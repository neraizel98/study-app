// Run with Playwright available in NODE_PATH. Uses isolated browser storage and stubbed cloud APIs.
const {chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=process.cwd(),server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const base=`http://127.0.0.1:${server.address().port}`;
 try{
  await page.route('**/firebase-sync.js*',r=>r.fulfill({contentType:'application/javascript',body:''}));
  await page.route('**/firestore-repository.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('firestore-repository.js','utf8')+`;SmartStudy.FirestoreRepository.getLearnerPlanSettings=async()=>({budgetMinutes:45,grade:6,semester:2});SmartStudy.MockPublication.list=()=>new Promise(resolve=>window.resolveExams=resolve);`}));
  await page.route('**/weekly-review-policy.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('weekly-review-policy.js','utf8')+';SmartStudy.WeeklyReviewPolicy.timeoutMs=80;'}));
  await page.addInitScript(()=>localStorage.setItem('SmartStudy_ActiveUser','안정화검증'));
  for(const width of [360,390,768,1440]){
   await page.setViewportSize({width,height:900});await page.goto(base+'/today.html');
   await page.waitForSelector('#tasks .task');
   assert.equal(await page.locator('#tasks .task').count(),8);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.equal(await page.evaluate(()=>SmartStudy.LearningPlan.getPlan('안정화검증').tasks.reduce((n,t)=>n+t.minutes,0)),45);
  }
  const mathUrl=await page.evaluate(()=>{
   const app=SmartStudy,t=app.LearningPlan.getPlan('안정화검증').tasks.find(t=>t.subject==='math');
   app.LocalRepository.saveTimerConfig({math:0});app.LearningPlan.startTask('안정화검증',t.id);
   return `math_quiz.html?level=${t.context.levelId}&semester=${t.context.semesterId}&unit=${t.context.unitId}&type=basic`;
  });
  await page.goto(base+'/'+mathUrl);await page.waitForSelector('#optionsGrid button');
  await page.locator('#todayFlow button.today-flow-primary').click();
  assert(page.url().includes('math_quiz.html'),'quiz shortcut must never restart an active math quiz');
  await page.goto(base+'/today.html');await page.waitForSelector('#tasks .task');
  await page.evaluate(async()=>{
   const app=SmartStudy,u='안정화검증',p=app.LearningPlan.getPlan(u),now=Date.now();
   // Actual report metadata at each subject boundary; low score still counts as submission.
   const reports=p.tasks.map((t,i)=>({sessionId:'daily-'+i,subject:t.subject==='math_formula'?'math':t.subject,date:now,totalQuestions:1,metadata:{...t.context,stageId:t.context.levelId,source:t.subject==='math_formula'?'math-formula':undefined,submittedAt:now,initialAttempts:[{correct:false,question:'검증',correctAnswer:'정답',choices:['정답','오답']}]}}));
   app.LocalRepository.saveReports(u,reports);
   if(app.LearningProgress.evidence(u).length)throw Error('uncommitted evidence leaked');
   await app.LocalRepository.flush();app.LearningPlan.refreshEvidence(u);
  });
  await page.reload();await page.waitForFunction(()=>document.querySelector('#nextActivity')?.textContent.includes('오늘 학습 완료'));
  await page.evaluate(async()=>{
   const u='안정화검증',now=Date.now();
   SmartStudy.LocalRepository.saveReports(u,Array.from({length:20},(_,i)=>({sessionId:'weekly'+i,subject:'reading',date:now,totalQuestions:1,metadata:{initialAttempts:[{questionId:'weekly'+i,question:'주중 문제 '+i,correct:false,correctAnswer:'정답',choices:['정답','오답'],passageText:['원문 '+i]}]}})));
   await SmartStudy.LocalRepository.flush();
  });
  await page.goto(base+'/weekly-review.html');
  await page.getByRole('button',{name:'주중 오답으로 시작',exact:true}).click();
  await page.waitForSelector('.review-choices');
  const frozen=await page.evaluate(()=>JSON.stringify(SmartStudy.LocalRepository.getPreference(`SmartStudy_WeeklyReview_${encodeURIComponent('안정화검증')}_${SmartStudy.WeeklySchedule.day(Date.now())}`,null).items));
  await page.evaluate(()=>{
   const questions=Array.from({length:10},(_,i)=>({id:'exam'+i,subject:'reading',question:'시험 문제 '+i,answer:'정답',choices:['정답','오답'],passageLines:['시험 원문 '+i]}));
   window.resolveExams([{assessmentId:'exam',learnerId:'안정화검증',published:true,payload:{scheduledWeekId:SmartStudy.WeeklySchedule.weekDates()[0],submittedAt:Date.now(),questions,initialAttempts:questions.map(q=>({questionId:q.id,correct:false}))}}]);
  });
  await page.waitForTimeout(50);
  assert.equal(await page.evaluate(()=>JSON.stringify(SmartStudy.LocalRepository.getPreference(`SmartStudy_WeeklyReview_${encodeURIComponent('안정화검증')}_${SmartStudy.WeeklySchedule.day(Date.now())}`,null).items)),frozen,'late public exam must not replace started review');
  for(let i=0;i<10;i++){
   await page.getByRole('button',{name:'정답',exact:true}).click();
   await page.getByRole('button',{name:'답 확인',exact:true}).click();
   await page.getByRole('button',{name:i===9?'복습 제출':'다음 →',exact:true}).click();
  }
  await page.getByRole('button',{name:'공개된 시험 오답 복습',exact:true}).click();
  await page.waitForSelector('.review-choices');
  assert.match(await page.locator('#reviewProgress').innerText(),/1 \/ 6/);
  assert.match(await page.locator('#reviewBody').innerText(),/시험 문제/);
  await page.evaluate(()=>{
   const repo=SmartStudy.LocalRepository,flush=repo.flush.bind(repo);let first=true;
   repo.flush=()=>{if(first){first=false;return Promise.reject(Error('injected disk failure'));}return flush();};
  });
  await page.getByRole('button',{name:'정답',exact:true}).click();
  await page.getByRole('button',{name:'답 확인',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#reviewNote').textContent.includes('저장하지 못했어요'));
  assert.equal(await page.getByRole('button',{name:'다음 →',exact:true}).count(),0);
  await page.getByRole('button',{name:'답 확인',exact:true}).click();
  await page.getByRole('button',{name:'다음 →',exact:true}).click();
  await page.reload();await page.waitForSelector('.review-choices');
  assert.match(await page.locator('#reviewProgress').innerText(),/2 \/ 6/,'supplement resumes after saved answer');
  const main=await page.evaluate(()=>SmartStudy.LocalRepository.getPreference(`SmartStudy_WeeklyReview_${encodeURIComponent('안정화검증')}_${SmartStudy.WeeklySchedule.day(Date.now())}`,null));
  assert(main.submittedAt);assert.equal(main.items.length,10);
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('Browser: four widths, eight subjects durable low-score completion/reload, timeout fallback, late-publication freeze, 10-question submit, supplement, save failure retry and supplement reload passed.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

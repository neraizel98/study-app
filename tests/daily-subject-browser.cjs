// Actual quiz button flow for all eight subjects, isolated account and mock cloud only.
const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=process.cwd(),server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:390,height:844}}),base=`http://127.0.0.1:${server.address().port}`,errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>{console.log('Dialog:',d.type(),d.message());if(d.type()==='beforeunload')await d.accept();else await d.dismiss();});
 try{
  await page.clock.install({time:new Date('2026-10-23T08:00:00Z')});
  await page.route('**/firebase-sync.js*',r=>r.fulfill({contentType:'application/javascript',body:''}));
  await page.route('**/version-check.js*',r=>r.fulfill({contentType:'application/javascript',body:''}));
  await page.route('**/firestore-repository.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('firestore-repository.js','utf8')+';SmartStudy.FirestoreRepository.getLearnerPlanSettings=async()=>({budgetMinutes:45,grade:6,semester:2});SmartStudy.MockPublication.list=async()=>[];'}));
  await page.addInitScript(()=>{localStorage.setItem('SmartStudy_ActiveUser','실제퀴즈검증');localStorage.setItem('SmartStudy_MinStudyConfig',JSON.stringify({schemaVersion:2,levels:{},reading:0,korean_vocab:0,english:0,grammar:0,english_reading:0,math:0,hanja:0}));});
  const passed=[];
  for(let step=0;step<8;step++){
   await page.goto(base+'/today.html');await page.waitForSelector('#continueLearning');
   const task=await page.evaluate(()=>SmartStudy.LearningProgress.nextTask(SmartStudy.LearningPlan.getPlan('실제퀴즈검증').tasks));
   assert(task);console.log('Starting',task.subject);
   await page.locator('#continueLearning').click();await page.waitForLoadState('domcontentloaded');
   // Fix Hanja question-type selection to choices; real handwriting is a separate device check.
   if(task.subject==='hanja')await page.evaluate(()=>{Math.random=()=>.5;});
   if(task.subject==='math')await page.goto(base+`/math_quiz.html?level=${task.context.levelId}&semester=${task.context.semesterId}&unit=${task.context.unitId}&type=basic`);
   else await page.locator(task.subject==='english_reading'?'#practiceQuiz':['reading','korean_vocab','grammar'].includes(task.subject)?'#startQuiz':'#quizModeBtn').click();
   if(task.subject==='reading'){await page.locator('#passageSummary').fill('글의 중심 내용과 근거를 확인했습니다.');await page.locator('#summaryDone').click();}
   let rounds=0;
   if(task.subject==='math_formula'){
    await page.waitForSelector('[data-question]');
    const ids=await page.locator('[data-question]').evaluateAll(xs=>[...new Set(xs.map(x=>x.dataset.question))]);
    for(const id of ids)await page.locator(`[data-question="${id}"]`).first().click();
    for(const area of await page.locator('[data-written]').all())await area.fill('0');
    rounds=new Set([...ids,...await page.locator('[data-written]').evaluateAll(xs=>xs.map(x=>x.dataset.written))]).size;
    await page.locator('#submitQuizBtn').click();
   }else{
    while(!await page.locator('#resultModal:visible').count()){
     if(++rounds>55)throw Error(task.subject+': too many questions or stuck');
     if(['reading','korean_vocab','grammar','english_reading'].includes(task.subject)){
      await page.waitForSelector('#quizChoices button:visible:not([disabled]), #quizTypedInput:visible');
      const choice=page.locator('#quizChoices button:visible:not([disabled])').first();
      if(await choice.count())await choice.click();
      else{await page.locator('#quizTypedInput').fill('test');await page.locator('#quizTypedSubmit').click();}
      await page.locator('#nextQuestion').click();
     }else if(task.subject==='math'){
      const before=await page.locator('#quizIdx').innerText();await page.locator('#optionsGrid button').first().click();
      await page.waitForFunction(previous=>document.querySelector('#quizIdx').textContent!==previous||SmartStudy.LocalRepository.listReports('실제퀴즈검증').some(r=>r.subject==='math'&&r.metadata?.source!=='math-formula'),before);
      if(await page.locator('#questionBox').innerText().then(t=>t.includes('성적표')))break;
      if(await page.evaluate(()=>SmartStudy.LocalRepository.listReports('실제퀴즈검증').some(r=>r.subject==='math'&&r.metadata?.source!=='math-formula')))break;
     }else{
      const before=await page.evaluate(()=>typeof quizIndex==='number'?quizIndex:null);
      const choice=page.locator('#quizChoices .choice-btn:visible:not([disabled])').first();
      if(await choice.count())await choice.click();
      else if(await page.locator('#writingFinishBtn:visible').count())await page.locator('#writingFinishBtn').click();
      else{for(const input of await page.locator('#quizView input:visible, #phaseSubjectiveArea input:visible, #phaseVerbFormsArea input:visible').all())await input.fill('test');await page.locator('#quizSubmitBtn').click();}
      await page.waitForFunction(index=>document.querySelector('#resultModal:not(.hidden)')||typeof quizIndex==='number'&&quizIndex!==index,before);
     }
    }
   }
   await page.evaluate(()=>SmartStudy.LocalRepository.flush());
   await page.waitForFunction(subject=>SmartStudy.LearningPlan.refreshEvidence('실제퀴즈검증').tasks.find(t=>t.subject===subject)?.status==='completed',task.subject);
   if(task.subject!=='math'&&task.subject!=='math_formula'){
    await page.locator('#todayResultFlow a').waitFor({state:'visible'});
    assert.match(await page.locator('#todayResultFlow').innerText(),step===7?/오늘 학습 완료/:/다음 활동/);
   }
   passed.push({subject:task.subject,questions:rounds});
  }
  await page.goto(base+'/today.html');await page.waitForFunction(()=>document.querySelector('#nextActivity').textContent.includes('오늘 학습 완료'));
  assert.equal(errors.length,0,errors.join('\n'));console.log('Actual eight-subject quiz clicks, durable reports, next action in result modals and final reload passed.',JSON.stringify(passed));
 }catch(e){await page.screenshot({path:'scratch/daily-subject-failure.png',fullPage:true});console.log('Failure page:',await page.locator('body').innerText());console.log('Page errors:',errors);throw e;}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

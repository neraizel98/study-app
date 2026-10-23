// Isolated browser accounts and mock cloud: no real learner records are read or written.
const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=process.cwd(),server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:390,height:844}}),base=`http://127.0.0.1:${server.address().port}`,errors=[],user='영어학년브라우저검증';
 page.on('pageerror',error=>errors.push(error.stack||error.message));page.on('dialog',async d=>d.type()==='beforeunload'?d.accept():d.dismiss());
 try{
  await page.clock.install({time:new Date('2026-10-23T08:00:00Z')});
  await page.route('**/firebase-sync.js*',r=>r.fulfill({contentType:'application/javascript',body:''}));
  await page.route('**/version-check.js*',r=>r.fulfill({contentType:'application/javascript',body:''}));
  await page.route('**/firestore-repository.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('firestore-repository.js','utf8')+';SmartStudy.FirestoreRepository.getLearnerPlanSettings=async()=>({budgetMinutes:45,grade:6,semester:2});SmartStudy.MockPublication.list=async()=>[];'}));
  await page.addInitScript(user=>{
   localStorage.setItem('SmartStudy_ActiveUser',user);
   localStorage.setItem('SmartStudy_MinStudyConfig',JSON.stringify({schemaVersion:2,levels:{},grammar:0,english_reading:0}));
  },user);
  const grades=['grade6','middle1','middle2','middle3','high1','high2','high3'];
  for(const grade of grades){
   console.log('Reading grade',grade);
   await page.goto(`${base}/english_reading.html?level=${grade}`);
   await page.waitForSelector('#practiceQuiz:visible');
   assert.equal(await page.locator('#levelTabs button').count(),3);
   assert.equal(await page.evaluate(()=>EnglishReadingApp.getLevelId()),grade);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`reading ${grade}: mobile overflow`);
   await page.locator('#practiceQuiz').click();
   await page.waitForSelector('#quizChoices button:visible');
   // A reload must resume the same grade, passage and question.
   const before=await page.evaluate(()=>EnglishReadingApp.getSession());
   await page.reload();await page.waitForSelector('#quizChoices button:visible');
   assert.equal(await page.evaluate(()=>EnglishReadingApp.getSession().sessionId),before.sessionId);
   let rounds=0;
   while(!await page.locator('#resultModal:visible').count()){
    assert(++rounds<=20,`${grade}: quiz stuck`);
    const answer=await page.evaluate(()=>{const s=EnglishReadingApp.getSession();return s.questions.find(q=>q.id===s.roundQuestionIds[s.questionIndex]).answerIndex;});
    await page.locator(`#quizChoices button[data-choice="${answer}"]`).click();await page.locator('#nextQuestion').click();
   }
   await page.evaluate(()=>SmartStudy.LocalRepository.flush());
   const saved=await page.evaluate(user=>SmartStudy.LocalRepository.listReports(user).find(r=>r.subject==='english_reading'&&r.sessionId===EnglishReadingApp.getSession().sessionId),user);
   assert(saved&&saved.metadata.levelId===grade,`${grade}: persisted report grade`);assert.equal(saved.initialScore,saved.totalQuestions);
  }
  await page.goto(`${base}/english_reading.html?level=grade6&unit=er1&passage=er1-p0&mode=study`);await page.waitForSelector('#practiceQuiz:visible');
  assert.equal(await page.evaluate(()=>EnglishReadingApp.getLevelId()),'grade6');
  await page.locator('#levelTabs [data-group="group3"]').click();
  assert.equal(await page.evaluate(()=>EnglishReadingApp.getLevelId()),'high1');
  for(const stage of ['elementary','middle','middle2','middle3','high1','high2','high3']){
   await page.goto(`${base}/english_grammar.html?stage=${stage}`);await page.waitForSelector('#startQuiz:visible');
   assert.equal(await page.locator('#stageTabs button').count(),3);
   assert.equal(new URL(page.url()).searchParams.get('stage'),stage);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`grammar ${stage}: mobile overflow`);
   await page.locator('#startQuiz').click();let rounds=0;
   while(!await page.locator('#resultModal:visible').count()){
    assert(++rounds<=25,`${stage}: quiz stuck`);
    await page.waitForSelector('#quizChoices button:visible:not([disabled]),#quizTypedInput:visible');
    const choice=page.locator('#quizChoices button:visible:not([disabled])').first();
    if(await choice.count())await choice.click();else{await page.locator('#quizTypedInput').fill('test');await page.locator('#quizTypedSubmit').click();}
    await page.locator('#nextQuestion').click();
   }
   await page.evaluate(()=>SmartStudy.LocalRepository.flush());
   const saved=await page.evaluate(({user,stage})=>SmartStudy.LocalRepository.listReports(user).find(r=>r.subject==='grammar'&&r.metadata.stageId===stage),{user,stage});
   assert(saved&&saved.totalQuestions>0,`${stage}: persisted grammar report`);
  }
  await page.goto(`${base}/today.html`);await page.waitForSelector('#continueLearning');
  await page.evaluate(user=>{const plan=SmartStudy.LearningPlan.getPlan(user),t=plan.tasks.find(t=>t.subject==='english_reading');t.required=true;t.status='ready';t.context={levelId:'grade6',unitId:'er6',title:'지정 독해'};t.targetUrl='english_reading.html?level=grade6&unit=er6&mode=study';SmartStudy.LearningPlan.savePlan(plan);},user);
  await page.goto(`${base}/english_reading.html?level=grade6&unit=er6&mode=study`);await page.waitForSelector('#parentScopeGuard');
  await page.locator('#levelTabs [data-group="group3"]').click();await page.waitForLoadState('domcontentloaded');
  assert.equal(new URL(page.url()).searchParams.get('unit'),'er6','new grade controls retain pending parent scope');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('Mobile 390px: all seven reading grades and seven grammar stages, exact report metadata, reading reload recovery, old deep link, group/grade switching and completed quizzes passed.');
 }catch(error){await page.screenshot({path:'scratch/english-levels-browser-failure.png',fullPage:true});console.log('Failure page:',await page.locator('body').innerText());console.log('Page errors:',errors);throw error;}
 finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

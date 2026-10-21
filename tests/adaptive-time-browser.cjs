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
  await page.route('**/firebase-sync.js*',r=>r.fulfill({contentType:'application/javascript',body:''}));
  await page.route('**/version-check.js*',r=>r.fulfill({contentType:'application/javascript',body:''}));
  await page.route('**/firestore-repository.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('firestore-repository.js','utf8')+';SmartStudy.FirestoreRepository.getLearnerPlanSettings=async()=>({budgetMinutes:45,grade:6,semester:2});SmartStudy.MockPublication.list=async()=>[];'}));
  await page.addInitScript(user=>{
   localStorage.setItem('SmartStudy_ActiveUser',user);

  },user);
  const seed=async scores=>{
   await page.goto(base+'/today.html');await page.waitForSelector('#continueLearning');
   return page.evaluate(async ({user,scores})=>{
    const plan=SmartStudy.LearningPlan.getPlan(user),task=plan.tasks.find(t=>t.subject==='english_reading'),now=Date.now();
    const reports=scores.map((score,i)=>({userId:user,sessionId:'timer-history-'+i,subject:'english_reading',level:'초6',date:now-86400000+i,initialScore:score,totalQuestions:10,metadata:{levelId:task.context.levelId,unitId:task.context.unitId,initialAttempts:Array.from({length:10},(_,j)=>({correct:j<score}))}}));
    SmartStudy.LocalRepository.saveReports(user,reports);SmartStudy.LocalRepository.saveTimerConfig({english_reading:12});
    sessionStorage.setItem('SmartStudy_TodayFlow',JSON.stringify({user,date:plan.date,taskId:task.id}));
    await SmartStudy.LocalRepository.flush();return task.targetUrl;
   },{user,scores});
  };
  const target=await seed([10,9,8]);await page.goto(base+'/'+target);await page.waitForSelector('#studyTimerBar');
  const status=await page.evaluate(()=>StudyTimer.getStatus('english_reading','english_reading:grade6',['초6']));
  assert.equal(status.source,'daily');assert.equal(status.score,90);assert.equal(status.requiredSeconds,0);
  assert.match(await page.locator('#studyTimerBar').innerText(),/평균 90점.*퀴즈 가능/);
  await page.locator('#practiceQuiz').click();await page.waitForSelector('#quizChoices button:visible');
  const again=await seed([8,8,8]);await page.goto(base+'/'+again);await page.waitForSelector('#studyTimerBar');
  const below=await page.evaluate(()=>StudyTimer.getStatus('english_reading','english_reading:grade6',['초6']));
  assert.equal(below.source,'daily');assert.equal(below.score,80);assert.equal(below.requiredSeconds,720);
  assert(await page.locator('#practiceQuiz').evaluate(button=>button.classList.contains('stb-locked')));
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('390px daily reading: recent-three average90 exempts explicit12min and unlocks actual quiz; average80 preserves parent minimum12min.');
 }catch(error){await page.screenshot({path:'scratch/adaptive-time-browser-failure.png',fullPage:true});console.log(errors);throw error;}
 finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

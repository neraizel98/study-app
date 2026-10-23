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
  await page.goto(`${base}/english_reading.html?level=grade6&unit=er1&passage=er1-p0&mode=study`);await page.waitForSelector('#practiceQuiz:visible');
  await page.evaluate(()=>{QuizExposure.fresh=(subject,rows)=>rows.slice(0,1);});
  await page.locator('#practiceQuiz').click();await page.waitForSelector('#quizChoices button:visible');
  const session=await page.evaluate(()=>EnglishReadingApp.getSession());
  assert(session.questions.length>=5);assert.equal(session.review,true);assert.equal(session.practiceAssessment,false);
  await page.goto(`${base}/today.html`);await page.waitForSelector('#continueLearning');
  const result=await page.evaluate(async user=>{
   const records=[];for(let i=1;i<=3;i++)records.push({userId:user,sessionId:'aced-eight-'+i,subject:'hanja',level:'8급',date:Date.now()-i*86400000,totalQuestions:10,initialScore:10,finalScore:10,isCompleted:true,metadata:{unitId:'level8',initialAttempts:Array.from({length:10},()=>({correct:true}))}});
   SmartStudy.LocalRepository.saveReports(user,records);await SmartStudy.LocalRepository.flush();
   SmartStudy.LocalRepository.setPreference(`SmartStudy_DailyPlan_${encodeURIComponent(user)}_${SmartStudy.LearningPlan.today()}`,null);
   const p=SmartStudy.LearningPlan.createPlan(user),task=p.tasks.find(t=>t.subject==='hanja');let blocked=false;
   try{SmartStudy.LearningPlan.selectContext(p.id,user,task.id,{unitId:'level8'});}catch(e){blocked=e.message.includes('충분히 익힌');}
   return {unit:task.context.unitId,blocked};
  },user);
  assert.equal(result.unit,'level7');assert.equal(result.blocked,true);
  await page.goto(`${base}/hanja.html`);await page.waitForSelector('.level-btn.active');
  assert.equal(await page.locator('.level-btn.active').getAttribute('data-level'),'level7','free-learning entry must not reset to easiest level8');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('390px regression: one fresh question becomes 5+ review, three real stored 8급 successes recommend 7급, return to mastered 8급 is blocked.');
 }catch(error){await page.screenshot({path:'scratch/english-levels-browser-failure.png',fullPage:true});console.log('Failure page:',await page.locator('body').innerText());console.log('Page errors:',errors);throw error;}
 finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

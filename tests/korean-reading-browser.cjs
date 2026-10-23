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
   localStorage.setItem('SmartStudy_MinStudyConfig',JSON.stringify({schemaVersion:2,levels:{},reading:0,grammar:0,english_reading:0}));
  },user);
  for(const grade of [7,8,9,10,11,12]){
   const level=grade<10?'level1':'level2',unit=grade===7?'r7':`kr-${grade<10?'m'+(grade-6):'h'+(grade-9)}-r7`;
   console.log('Korean reading grade',grade);
   await page.goto(`${base}/reading.html?level=${level}&grade=${grade}&unit=${unit}&lesson=1&mode=study`);await page.waitForSelector('#startQuiz');
   assert.equal(await page.locator('#levelTabs button').count(),2);assert.equal(await page.locator('#gradeTabs button').count(),3);assert.equal(await page.locator('#unitTabs button').count(),8);
   assert.equal(new URL(page.url()).searchParams.get('unit'),unit);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${grade}: mobile overflow`);
   assert((await page.locator('#studyExamples').innerText()).length>100,`${grade}: worked study examples`);
   for(let trial=0;trial<3;trial++){
    if(trial)await page.locator('#resultStudy').click();
    await page.locator('#startQuiz').click();await page.locator('#passageSummary').fill('수업 지문의 상황과 표현, 핵심 근거를 연결해 읽었습니다.');await page.locator('#summaryDone').click();
    let count=0;
    while(!await page.locator('#resultModal:visible').count()){
     assert(++count<=5,`${grade}: quiz stuck`);
     const answer=await page.evaluate(()=>{
      const p=ReadingPassages.find(p=>p.title===document.querySelector('#passageTitle').textContent);
      const pool=[...p.questions,...ReadingVocabulary.getQuestions(p)];
      const q=pool.find(q=>document.querySelector('#quizQuestion').textContent.endsWith(q.question));
      if(!q)throw Error('unknown displayed question');
      return [...document.querySelectorAll('#quizChoices button')].findIndex(b=>b.textContent.trim().endsWith(q.answer));
     });
     assert(answer>=0);await page.locator('#quizChoices button').nth(answer).click();await page.locator('#nextQuestion').click();
    }
    assert.equal(count,5);await page.evaluate(()=>SmartStudy.LocalRepository.flush());
    const saved=await page.evaluate(({user,grade})=>SmartStudy.LocalRepository.listReports(user).filter(r=>r.subject==='reading'&&r.metadata.grade===grade).sort((a,b)=>b.date-a.date)[0],{user,grade});
    assert(saved&&saved.metadata.unitId===unit&&saved.metadata.levelId===level);assert.equal(saved.initialScore,5);
    assert.equal(Boolean(saved.metadata.review),trial>0,'exhausted pool stays playable as explicit review');
   }
  }
  await page.goto(base+'/reading.html?level=level1&unit=r7&lesson=1&mode=study');await page.waitForSelector('#lessonTitle');
  assert.equal(new URL(page.url()).searchParams.get('grade'),'7','legacy r7 link stays middle1');
  await page.locator('#levelTabs [data-level="level2"]').click();await page.locator('#gradeTabs [data-grade="12"]').click();
  assert.equal(new URL(page.url()).searchParams.get('grade'),'12');
  assert.equal(errors.length,0,errors.join('\n'));
  await page.screenshot({path:'scratch/korean-reading-grade12-mobile.png',fullPage:true});
  console.log('390px: six grades, worked study examples,18 five-question quiz submissions, exact grade metadata, repeated practice fallback, legacy r7 link and level/grade navigation passed.');
 }catch(error){await page.screenshot({path:'scratch/korean-reading-browser-failure.png',fullPage:true});console.log(await page.locator('body').innerText());console.log(errors);throw error;}
 finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

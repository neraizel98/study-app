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
  await page.route('**/firestore-repository.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('firestore-repository.js','utf8')+';SmartStudy.FirestoreRepository.getLearnerPlanSettings=async()=>({budgetMinutes:45,grade:7,semester:1});SmartStudy.MockPublication.list=async()=>[];'}));
  await page.addInitScript(user=>{
   localStorage.setItem('SmartStudy_ActiveUser',user);
   localStorage.setItem('SmartStudy_MinStudyConfig',JSON.stringify({schemaVersion:2,levels:{},grammar:0,english_reading:0}));
  },user);
  await page.goto(`${base}/today.html`);await page.waitForSelector('#continueLearning');
  await page.evaluate(user=>SmartStudy.LearningPlan.applyParentSettings(user,{grade:7,semester:1,budgetMinutes:45}),user);
  const subjects=[{id:'reading',page:'reading.html',key:'grade',ids:['7','8','9'],buttons:2},{id:'english_reading',page:'english_reading.html',key:'level',ids:['middle1','middle2','middle3'],buttons:3},{id:'grammar',page:'english_grammar.html',key:'stage',ids:['middle','middle2','middle3'],buttons:3}];
  for(const subject of subjects){
   for(let rank=0;rank<3;rank++){
    await page.goto(`${base}/${subject.page}`);await page.waitForSelector(subject.id==='english_reading'?'#practiceQuiz':'#startQuiz');
    assert.equal(new URL(page.url()).searchParams.get(subject.key),subject.ids[rank],`${subject.id}: internal placement ${rank}`);
    assert.equal(await page.locator('#gradeTabs button').count(),0,'no manual school-grade buttons');
    assert.equal(await page.locator(subject.id==='grammar'?'#stageTabs button':'#levelTabs button').count(),subject.buttons);
    const title=await page.locator(subject.id==='grammar'?'#courseSubtitle':subject.id==='reading'?'#heroLevel':'#passageMeta').innerText();
    assert(!/[중고][123](?:학년)?/.test(title),`${subject.id}: grade leaked in heading: ${title}`);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(rank<2){
     await page.evaluate(async ({user,subject,rank})=>{
      const repo=SmartStudy.LocalRepository,rows=repo.listReports(user),internal=subject.ids[rank];
      let scopes;
      if(subject.id==='reading')scopes=ReadingPassages.filter(p=>p.grade===Number(internal));
      else if(subject.id==='english_reading')scopes=EnglishReadingData.units.filter(u=>u.gradeId===internal).flatMap(u=>u.passages.map(p=>({...p,unitId:u.id})));
      else scopes=EnglishGrammarData[internal].units.map(u=>({unitId:u.id}));
      for(let i=0;i<3;i++)rows.push({userId:user,sessionId:`${subject.id}-rank-${rank}-${i}`,subject:subject.id,date:Date.now()-86400000+rank*100+i,totalQuestions:5,initialScore:5,finalScore:5,isCompleted:true,metadata:{grade:subject.id==='reading'?Number(internal):undefined,levelId:subject.id==='english_reading'?internal:subject.id==='reading'?'level1':undefined,stageId:subject.id==='grammar'?internal:undefined,unitId:scopes[i].unitId,passageId:scopes[i].id,initialAttempts:Array.from({length:5},()=>({correct:true}))}});
      repo.saveReports(user,rows);await repo.flush();
     },{user,subject,rank});
    }
   }
  }
  await page.goto(`${base}/today.html`);await page.waitForSelector('#continueLearning');
  const tasks=await page.evaluate(user=>{const p=SmartStudy.LearningPlan.getPlan(user);return p.tasks.map(t=>({subject:t.subject,context:t.context}));},user);
  assert.equal(tasks.find(t=>t.subject==='reading').context.unitId.startsWith('kr-m3-'),true);
  assert.equal(tasks.find(t=>t.subject==='grammar').context.levelId,'middle3');
  assert.equal(tasks.find(t=>t.subject==='english_reading').context.levelId,'middle3');
  await page.goto(`${base}/reading.html?level=level1&unit=r7&lesson=1&mode=study`);await page.waitForSelector('#lessonTitle');
  assert.equal(new URL(page.url()).searchParams.get('grade'),'7','historical exact lesson link remains usable');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('390px shared progression: all3 subjects automatically rise through3 internal grades, no grade controls/labels, matching daily tasks and historical exact links passed.');
 }catch(error){await page.screenshot({path:'scratch/english-levels-browser-failure.png',fullPage:true});console.log('Failure page:',await page.locator('body').innerText());console.log('Page errors:',errors);throw error;}
 finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

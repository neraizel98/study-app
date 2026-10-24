const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const fixture=require('./helpers/mock-transfer-fixture.cjs').setup(),cloud=new Map();
(async()=>{const root=process.cwd(),server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));});await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());try{
 await page.clock.install({time:new Date(fixture.now)});
 await page.exposeFunction('__examSubmit',snapshot=>{cloud.set(snapshot.assessmentId,{learnerId:'learner',assessmentId:snapshot.assessmentId,published:false,payload:snapshot});return {saved:true};});
 await page.exposeFunction('__examList',()=>[...cloud.values()]);
 await page.exposeFunction('__examGet',async id=>{const r=cloud.get(id);await new Promise(resolve=>setTimeout(resolve,30));return r?{published:r.published,snapshot:r.payload,publishedAt:fixture.now}:{published:false};});
 await page.route('**/firebase-sync.js*',r=>r.fulfill({contentType:'application/javascript',body:''}));await page.route('**/version-check.js*',r=>r.fulfill({contentType:'application/javascript',body:''}));
 await page.route('**/firestore-repository.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('firestore-repository.js','utf8')+';SmartStudy.FirestoreRepository.getLearnerPlanSettings=async()=>({grade:7,semester:1,budgetMinutes:45});SmartStudy.MockPublication.submit=(_,s)=>window.__examSubmit(s);SmartStudy.MockPublication.list=()=>window.__examList();SmartStudy.MockPublication.get=(_,id)=>window.__examGet(id);'}));
 await page.addInitScript(()=>localStorage.setItem('SmartStudy_ActiveUser','learner'));
 await page.goto(`http://127.0.0.1:${server.address().port}/mock-exam.html`);await page.waitForSelector('#bankStatus');await page.evaluate(async reports=>{await SmartStudy.LocalRepository.ready;SmartStudy.LocalRepository.saveReports('learner',reports);await SmartStudy.LocalRepository.flush();},JSON.parse(JSON.stringify(fixture.reports)));await page.reload();
 const snapshots=[];
 for(let round=1;round<=3;round++){
  if(round>1){await page.locator('#retakeExam').click();}
  await page.waitForSelector('#startExam:enabled',{timeout:10000});assert((await page.locator('#startExam').innerText()).includes(round>1?`${round}회차`:'55문항'));await page.locator('#startExam').click();await page.waitForSelector('#workPanel:visible');
  let count=0;
  while(true){const state=await page.evaluate(()=>{const d=SmartStudy.MockExam.get(SmartStudy.LocalRepository.getActiveUser()),s=d.sections.find(s=>s.state==='active'),q=s?SmartStudy.MockExam.questionsFor(d,s)[d.cursor]:null;return {done:!!d.submittedAt,rest:d.break&&!d.break.endedAt,q:q&&{answer:q.answer,kind:q.kind,index:q.choices.indexOf(q.answer)}};});if(state.done)break;if(state.rest){await page.locator('#skipBreak').click();continue;}
   if(await page.locator('.passage-gate:visible').count())await page.locator('.passage-gate').click();
   if(state.q.kind==='written')await page.locator('#writtenAnswer').fill(state.q.answer);else await page.locator('#choices button').nth(state.q.index).click();
   count++;assert(count<=55);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(round===2&&count===1){const saved=await page.evaluate(()=>{const d=SmartStudy.MockExam.get('learner');return {id:d.assessmentId,responses:d.responses,deadline:d.sections[0].deadline};});await page.reload();await page.waitForSelector('#workPanel:visible');assert.deepEqual(await page.evaluate(()=>{const d=SmartStudy.MockExam.get('learner');return {id:d.assessmentId,responses:d.responses,deadline:d.sections[0].deadline};}),saved);}
   if(await page.locator('#nextQuestion').isEnabled())await page.locator('#nextQuestion').click();else{await page.locator('#finishSection').click();await page.locator('#confirmSection').click();}
  }
  assert.equal(count,55);await page.waitForSelector('#retakeExam:enabled');await page.waitForFunction(()=>SmartStudy.MockExam.get('learner').syncStatus==='synced');
  const d=await page.evaluate(()=>SmartStudy.MockExam.get('learner'));assert.equal(d.attemptNo,round);assert((await page.locator('#submittedPanel h2').innerText()).includes(`${round}회차`));snapshots.push(d);
 }
 assert.equal(cloud.size,3);const ids=snapshots.flatMap(d=>d.questions.map(q=>q.fingerprint));assert.equal(new Set(ids).size,165,'no repeated question across three exams');
 assert.equal(await page.locator('#examHistory option').count(),3);
 const totals=await page.evaluate(()=>SmartStudy.LocalRepository.listReports('learner').filter(r=>r.metadata?.mockExam).reduce((map,r)=>(map[r.round]=(map[r.round]||0)+r.totalQuestions,map),{}));assert.deepEqual(totals,{'1':55,'2':55,'3':55});
 cloud.get(snapshots[1].assessmentId).published=true;
 await page.locator('#examHistory').selectOption(snapshots[1].assessmentId);await page.waitForSelector('#releasedResults .score-card');
 await page.locator('#examHistory').selectOption(snapshots[0].assessmentId);await page.waitForFunction(()=>document.querySelector('#releasedResults')?.textContent.includes('선생님'));assert.equal(await page.locator('#releasedResults .score-card').count(),0,'first result still withheld');
 await page.addScriptTag({path:'mock-admin.js'});
 await page.evaluate(async()=>{window._adminData={userId:'learner'};window.Chart=class{constructor(_,config){window.__retakeChart=config;}destroy(){}};const host=document.createElement('section');host.id='adminRetakes';document.body.append(host);await SmartStudy.MockAdmin.render('learner',host);});
 assert.equal(await page.locator('#adminRetakes .mock-result-card').count(),3,'admin lists all three rounds');
 assert((await page.locator('#adminRetakes').innerText()).includes('3회차'));
 assert(await page.evaluate(()=>window.__retakeChart.data.datasets.every(d=>d.data.filter(v=>v!=null).length===1)),'weekly chart uses only one first attempt');
 assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: same-day 1/2/3 rounds,165 distinct questions, second-round reload, independent cloud submissions/publication, round history and mobile layout.');
}catch(e){await page.screenshot({path:'scratch/mock-retakes-failure.png',fullPage:true});console.log(await page.locator('body').innerText());console.log(errors);throw e;}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

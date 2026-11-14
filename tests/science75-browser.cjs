const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const fixture=require('./helpers/mock-transfer-fixture.cjs').setup();
const weekly=false;
const science=require('../ScienceData.js'),unit=science.units[0],at=fixture.now-86400000;
fixture.reports.push({userId:'learner',sessionId:'science-browser-evidence',subject:'science',date:at,createdAt:at,totalQuestions:10,initialScore:8,finalScore:8,isCompleted:true,metadata:{source:'science',levelId:unit.levelId,unitId:unit.id,domainId:unit.domainId,unitTitle:unit.title,contentVersion:science.version,submittedAt:at,review:false,hintUsed:false,initialAttempts:unit.questions.slice(0,10).map((q,i)=>({questionId:q.id,question:q.question,correctAnswer:q.correctAnswer,choices:q.choices,answer:q.choices[q.answerIndex],correct:i<8,round:1,givens:q.givens,conceptId:q.conceptId}))}});

if(process.env.WRITING_READINESS==='1'){
 const report=fixture.reports.find(r=>r.subject==='english_reading');
 report.metadata.writingPack=true;report.metadata.pendingWritingCount=1;
 report.metadata.initialAttempts.unshift(
  {questionId:'mr1-unit1-p1-write-v1-rewrite',question:'Use the present tense with One member.',questionType:'rewrite',skill:'sentence-form',correct:true,round:1,correctAnswer:'One member sorts the objects by type.'},
  {questionId:'mr1-unit1-p1-write-v1-reading-short',question:'Describe the required detail.',questionType:'reading-short',correct:null,gradingStatus:'review_pending',round:1,selectedAnswer:'The bit only the owner knows.'}
 );
 report.totalQuestions++;report.initialScore++;report.finalScore=report.initialScore;
}

if(weekly){const rows=JSON.parse(JSON.stringify(fixture.reports));fixture.reports.length=0;for(let day=0;day<5;day++)for(const r of rows)if(r.metadata.source!=='math-formula'||day===4)fixture.reports.push({...r,sessionId:r.sessionId+'-day'+day,date:fixture.now-(6-day)*86400000});}

(async()=>{const root=process.cwd(),server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));});await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:390,height:844}}),base=`http://127.0.0.1:${server.address().port}`,errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>d.dismiss());try{
 if(weekly){
  await page.route('**/mock-math-transfer.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('mock-math-transfer.js','utf8')+`;{const a=MockMathTransfer.create,b=MockMathTransfer.createFormula;MockMathTransfer.create=(g,r)=>a(g,r).filter(q=>q.templateFamily==='circle-area-cost-limit');MockMathTransfer.createFormula=(g,r)=>b(g,r).filter(q=>q.templateFamily==='formula-quantity-conditions');}`}));
  await page.route('**/MockKoreanTransfer.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('MockKoreanTransfer.js','utf8')+';for(const p of MockKoreanTransfer)for(const q of p.questions)q.cognitiveDemand="application";'}));
 }
 await page.clock.install({time:new Date(fixture.now)});
 await page.route('**/firebase-sync.js*',r=>r.fulfill({contentType:'application/javascript',body:''}));await page.route('**/version-check.js*',r=>r.fulfill({contentType:'application/javascript',body:''}));
 await page.route('**/firestore-repository.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('firestore-repository.js','utf8')+';SmartStudy.FirestoreRepository.getLearnerPlanSettings=async()=>({grade:7,semester:1,budgetMinutes:45});SmartStudy.MockPublication.submit=async()=>({saved:true});SmartStudy.MockPublication.get=async()=>({published:false});SmartStudy.MockPublication.list=async()=>[];'}));
 await page.addInitScript(()=>localStorage.setItem('SmartStudy_ActiveUser','learner'));
 await page.goto(base+'/mock-exam.html');await page.waitForSelector('#bankStatus');await page.evaluate(async reports=>{await SmartStudy.LocalRepository.ready;SmartStudy.LocalRepository.saveReports('learner',reports);await SmartStudy.LocalRepository.flush();},JSON.parse(JSON.stringify(fixture.reports)));await page.reload();await page.locator('#examPledge').check();await page.waitForSelector('#startExam:enabled');if(weekly){assert((await page.locator('#shortages').innerText()).includes('수학 공식: 이번 주 1일 학습 · 1문항 반영'));}await page.locator('#startExam').click();await page.waitForSelector('#workPanel:visible');
 assert(await page.evaluate(()=>document.documentElement.translate===false&&getComputedStyle(document.querySelector('#question')).userSelect==='none'));
 assert.equal(await page.locator('#question').evaluate(el=>{const e=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});el.dispatchEvent(e);return e.defaultPrevented;}),true);
 const get=()=>page.evaluate(()=>{const d=SmartStudy.MockExam.get('learner'),s=d.sections.find(s=>s.state==='active'),q=s?SmartStudy.MockExam.questionsFor(d,s)[d.cursor]:null;return {id:d.assessmentId,questions:d.questions.length,examVersion:d.examVersion,duration:d.sections.reduce((n,s)=>n+s.durationSeconds,0),section:s?.id,deadline:s?.deadline,cursor:d.cursor,q:q&&{id:q.id,answer:q.answer,kind:q.kind,answerFormat:q.answerFormat,index:q.choices?.indexOf(q.answer)},submitted:d.submittedAt,rest:d.break&&!d.break.endedAt,responses:d.responses};});
 const initial=await get();assert.equal(initial.questions,75);assert.equal(initial.examVersion,'science75-v1');assert.equal(initial.duration,95*60);let count=0,reloaded=false,writtenEnglish=0,scienceCount=0;
 while(true){let state=await get();if(state.submitted)break;if(state.rest){await page.locator('#skipBreak').click();continue;}
  if(await page.locator('.passage-gate:visible').count())await page.locator('.passage-gate').click();
  assert.equal(await page.locator('#choices .correct,#choices .wrong').count(),0,'no immediate grading');
  if(state.q.kind==='written'){
   if(state.q.answerFormat==='english-form')writtenEnglish++;
   await page.locator('#writtenAnswer').fill(state.q.answer);
   assert.equal(await page.locator('#writtenAnswer').evaluate(el=>{const e=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});el.dispatchEvent(e);el.select();return e.defaultPrevented||el.selectionEnd-el.selectionStart!==el.value.length;}),false,'answer editing stays available');
  }else await page.locator('#choices button').nth(state.q.index).click();
  if(state.section==='science')scienceCount++;count++;if(!reloaded){const before=await get();await page.reload();await page.waitForSelector('#workPanel:visible');if(await page.locator('#leaveDialog:visible').count())await page.locator('#resumeExam').click();const after=await get();assert.equal(after.id,before.id);assert.deepEqual(after.responses,before.responses);assert.equal(after.deadline,before.deadline);reloaded=true;}
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile overflow');
  if(await page.locator('#nextQuestion').isEnabled())await page.locator('#nextQuestion').click();else{await page.locator('#finishSection').click();await page.locator('#confirmSection').click();}
  assert(count<=75,'stuck science75 exam');
 }
 if(process.env.WRITING_READINESS==='1')assert(writtenEnglish>0,'English sentence input must be answered through the UI');
 assert.equal(count,75);assert.equal(scienceCount,20);await page.waitForSelector('#submittedPanel:visible');await page.evaluate(()=>SmartStudy.LocalRepository.flush());const result=await page.evaluate(()=>{const d=SmartStudy.MockExam.get('learner');return {policy:d.policyId,sections:d.sections.map(s=>s.state),count:SmartStudy.LocalRepository.listReports('learner').filter(r=>r.metadata?.mockExam).reduce((n,r)=>n+r.totalQuestions,0),visibility:d.resultVisibility,synced:d.syncStatus};});assert.equal(result.policy,'weekly-transfer-20261024');assert.equal(result.count,75);assert(result.sections.every(s=>s==='ended'));assert.equal(result.visibility,'withheld');assert(!(await page.locator('#submittedPanel').innerText()).includes('75 / 75'));assert.equal(errors.length,0,errors.join('\n'));console.log('Translation opt-out/read-only text menu suppressed, answer editing preserved. 390px strict science75 mock:75 UI answers, new passages/glossary, reload retains answers/deadline, five sections/break, science20, local records75 and withheld results passed.',JSON.stringify(result));
 await page.goto(base+'/english.html?word=moon');await page.waitForSelector('#showMeaningBtn:visible');
 await page.locator('#showMeaningBtn').click();assert(await page.locator('#metaContent').isVisible(),'built-in meaning button works');
 console.log('English vocabulary built-in meaning reveal still works.');
}catch(e){await page.screenshot({path:'scratch/science75-browser-failure.png',fullPage:true});console.log('Failure:',await page.locator('body').innerText());console.log('Errors:',errors);throw e;}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

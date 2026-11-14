const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{const root=process.cwd(),server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));});await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.type()==='beforeunload'?d.accept():d.dismiss());try{
await page.route('**/*',route=>{const u=route.request().url();if(!u.startsWith('http://127.0.0.1:')||/firebase-sync.js|notification-client.js|version-check.js/.test(u))return route.fulfill({body:'',contentType:'application/javascript'});return route.continue();});await page.addInitScript(()=>localStorage.setItem('SmartStudy_ActiveUser','reading-expansion-test'));
const base=`http://127.0.0.1:${server.address().port}`;
for(const stage of ['middle','high'])for(const grade of [1,2,3]){
 const level=stage+grade,prefix=stage==='middle'?'mr':'hr';
 await page.goto(`${base}/english_reading.html?level=${level}&unit=${prefix}${grade}-unit1&passage=${prefix}${grade}-unit1-p4&mode=study`);
 await page.waitForSelector('.sentence-guide-item',{state:'attached'});assert.equal(await page.locator('#gradeTabs:visible').count(),0,'internal grade remains hidden');
 for(const unitNo of [1,2]){
  const unit=`${prefix}${grade}-unit${unitNo}`;await page.locator(`[data-unit="${unit}"]`).click();assert.equal(await page.locator('#passageSelect option').count(),6);
  for(const n of [4,5,6]){const id=`${unit}-p${n}`;await page.locator('#passageSelect').selectOption(id);await page.waitForFunction(id=>new URL(location.href).searchParams.get('passage')===id,id);
   const count=await page.evaluate(id=>EnglishReadingData.units.flatMap(u=>u.passages).find(p=>p.id===id).sentences.length,id);
   assert.equal(await page.locator('.sentence-guide-item').count(),count);assert.equal(await page.locator('.sentence-guide-unavailable').count(),0);assert.equal(await page.locator('.sentence-guide-translation:visible').count(),0);
   await page.locator('.sentence-guide-title').click();await page.locator('.sentence-guide-heading').first().click();assert.deepEqual(await page.locator('.sentence-guide-item').first().locator('h4').allTextContents(),['① 구조','② 핵심 문법','③ 어휘','④ 기존 해석']);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile overflow '+id);
   if(unitNo===1&&n===4&&grade===1)await page.locator('#studyPanel').screenshot({path:`scratch/reading-expanded-${stage}-mobile.png`});
  }
 }
}
await page.goto(`${base}/english_reading.html?level=middle1&unit=mr1-unit1&passage=mr1-unit1-p4&mode=study`);await page.waitForSelector('.sentence-guide-item',{state:'attached'});await page.evaluate(()=>{StudyTimer.isUnlocked=()=>true;EnglishReadingApp.startQuiz('practice');});await page.waitForSelector('#quizPanel:visible');assert.equal(await page.locator('#sentenceGuide:visible').count(),0);const total=await page.evaluate(()=>EnglishReadingApp.getSession().questions.length);assert(total>=6&&total<=10,'authored questions plus existing context variants');
const chooseCorrect=async()=>{
 const q=await page.evaluate(()=>{const s=EnglishReadingApp.getSession();return s.questions.find(q=>q.id===s.roundQuestionIds[s.questionIndex]);});
 if(q.type==='arrange'){
  await page.locator('#arrangeInput').fill(q.answer);
  await page.locator('#arrangeSubmit').click();
 }else await page.locator(`#quizChoices [data-choice="${q.answerIndex}"]`).click();
};
await chooseCorrect();await page.reload();await page.waitForSelector('#quizPanel:visible');assert.equal(await page.evaluate(()=>EnglishReadingApp.getSession().initialAttempts.length),1,'new reading answer restored');
const integrityContinue=page.locator('.quiz-integrity-notice button');if(await integrityContinue.isVisible())await integrityContinue.click();
await page.locator('#nextQuestion').click();
for(let i=1;i<total;i++){await chooseCorrect();await page.locator('#nextQuestion').click();}await page.waitForSelector('#resultModal:visible');
await page.waitForFunction(()=>SmartStudy.LocalRepository.listReports(SmartStudy.LocalRepository.getActiveUser()).some(r=>r.metadata?.passageId==='mr1-unit1-p4'&&r.totalQuestions>=6));
let saved=await page.evaluate(()=>SmartStudy.LocalRepository.listReports(SmartStudy.LocalRepository.getActiveUser()).filter(r=>r.metadata?.passageId==='mr1-unit1-p4'));assert.equal(saved.length,1);assert.equal(saved[0].initialScore,total);assert.equal(saved[0].metadata.initialAttempts.length,total);
await page.reload();await page.waitForSelector('#resultModal:visible');saved=await page.evaluate(()=>SmartStudy.LocalRepository.listReports(SmartStudy.LocalRepository.getActiveUser()).filter(r=>r.metadata?.passageId==='mr1-unit1-p4'));assert.equal(saved.length,1,'reload does not duplicate quiz result');
await page.goto(`${base}/english_reading.html?level=high3&unit=hr3-unit2&passage=hr3-unit2-p6&mode=study`);await page.waitForSelector('.sentence-guide-item',{state:'attached'});await page.setViewportSize({width:1440,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.locator('#studyPanel').screenshot({path:'scratch/reading-expanded-high-desktop.png'});
assert.equal(errors.length,0,errors.join('\n'));console.log('PASS:36new readings in6internal grades, source-aligned notes, scope/selection, mobile anddesktop fit, full quiz completion, interrupted-session reload and single saved result. No live learner data used.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const scripts=['mock-learning-admin.js','mock-admin.js'].map(p=>fs.readFileSync(p,'utf8'));
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));try{
 await page.setContent('<main id="host"></main>');
 await page.addStyleTag({content:fs.readFileSync('theme.css','utf8').replace(/@import[^;]+;/g,'')+'\n'+fs.readFileSync('mock-learning-admin.css','utf8')});
 await page.evaluate(()=>{
  window._adminData={userId:'learner'}; window.__writes=[];window.__setting=null;
  const payload=(id,attemptNo,mode)=>({assessmentId:id,status:'submitted',scheduledWeekId:'2026-11-02',submittedAt:1,attemptNo,mode,bankVersion:'fixture-v1',questions:[{id:'v',subject:'english',difficulty:'standard'},{id:'g',subject:'grammar',difficulty:'basic'},{id:'r',subject:'english_reading',difficulty:'challenge'}],initialAttempts:[{questionId:'v',subject:'english',correct:true},{questionId:'g',subject:'grammar',correct:false},{questionId:'r',subject:'english_reading',correct:true}]});
  window.__records=[{assessmentId:'firstPaper',published:false,payload:payload('firstPaper',1,'paper')},{assessmentId:'paper',published:false,payload:payload('paper',2,'paper')},{assessmentId:'unscored',published:false,payload:{status:'paper',generatedAt:1,scheduledWeekId:'2026-11-02',attemptNo:3,questions:[]}}];
  window.SmartStudy={WeeklySchedule:{weekDates:(_,offset)=>[new Date(Date.UTC(2026,10,2+offset*7)).toISOString().slice(0,10)]},MockPublication:{list:async()=>structuredClone(__records),publish:async()=>{window.__published=(window.__published||0)+1;}},MockLearningRepository:{get:async()=>structuredClone(__setting),set:async(user,settings)=>{__writes.push({user,...settings});if(window.__reject)throw new Error('permission-denied');if(window.__delay)await new Promise(r=>window.__finishSave=r);return window.__setting={...settings,learnerId:user,scope:'english',schemaVersion:1};}}};
  window.Chart=class{constructor(_,config){window.__chart=config;}destroy(){}};
 });
 for(const content of scripts)await page.addScriptTag({content});
 await page.evaluate(()=>SmartStudy.MockAdmin.render('learner',document.querySelector('#host')));
 const cards=page.locator('.mock-result-card'),choose=page.locator('.mock-learning-choose');
 assert.equal(await cards.count(),3);assert.equal(await choose.count(),2);assert.equal(await choose.nth(1).isEnabled(),false);assert.equal(await page.evaluate(()=>__writes.length),0);
 assert((await page.locator('.mock-admin-sub').innerText()).includes('채점된 종이 시험 포함'));
 assert.equal(await page.locator('.mock-learning-card-status').count(),2);
 await cards.nth(1).locator('input[type=checkbox]').check();
 await page.evaluate(()=>window.__delay=true);await choose.nth(1).click();
 await page.waitForFunction(()=>typeof window.__finishSave==='function');assert.equal(await choose.nth(0).isEnabled(),false);assert.equal(await choose.nth(1).isEnabled(),false);
 await page.evaluate(()=>{window.__delay=false;window.__finishSave();});await page.waitForFunction(()=>document.querySelector('.mock-learning-score')?.textContent==='영어 67점');
 assert((await page.locator('.mock-learning-counts').innerText()).includes('단어 1/1 정답'));assert((await page.locator('.mock-learning-counts').innerText()).includes('문법 0/1 정답'));assert((await page.locator('.mock-learning-counts').innerText()).includes('독해 1/1 정답'));
 assert((await page.locator('.mock-learning-meta').innerText()).includes('fixture-v1'));assert((await page.locator('.mock-learning-state').innerText()).includes('결과 공개 후 학습 반영'));assert.equal(await page.evaluate(()=>window.__published||0),0);
 await cards.nth(1).locator('.mock-publish').click();await page.waitForFunction(()=>document.querySelector('.mock-learning-state')?.textContent==='다음 미시작 학습에 반영');
 assert.equal(await page.evaluate(()=>__chart.data.datasets[1].data.filter(x=>x!==null).length),1,'chart includes scored first paper and omits later attempts');
 await page.evaluate(()=>SmartStudy.MockAdmin.render('learner',document.querySelector('#host')));assert.equal(await page.locator('.is-learning-baseline').count(),1,'settings restore from repository');
 await page.evaluate(()=>window.__reject=true);await page.locator('.mock-learning-clear').click();await page.waitForFunction(()=>document.querySelector('.mock-learning-message')?.textContent.includes('permission-denied'));assert.equal(await page.locator('.is-learning-baseline').count(),1,'failed write retains prior selection');
 await page.evaluate(()=>window.__reject=false);await page.locator('.mock-learning-clear').click();await page.waitForFunction(()=>!document.querySelector('.is-learning-baseline'));assert.equal(await page.locator('.mock-learning-clear').isVisible(),false);
 // Fetch failure is visible and never gives a usable fallback based on preferences.
 await page.evaluate(async()=>{SmartStudy.MockLearningRepository.get=async()=>{throw new Error('offline');};await SmartStudy.MockAdmin.render('learner',document.querySelector('#host'));});
 assert((await page.locator('.mock-learning-message').innerText()).includes('offline'));assert.equal(await choose.count(),0);
 // A delayed get must not draw controls after another learner has been selected.
 await page.evaluate(()=>{SmartStudy.MockLearningRepository.get=()=>new Promise(r=>window.__finishGet=r);window.__render=SmartStudy.MockAdmin.render('learner',document.querySelector('#host'));});await page.waitForFunction(()=>typeof window.__finishGet==='function');assert.equal(await cards.count(),0,'settings load before result controls');
 await page.evaluate(async()=>{window._adminData.userId='other';document.querySelector('#host').textContent='다른 학습자';window.__finishGet(null);await window.__render;});assert.equal(await page.locator('#host').innerText(),'다른 학습자');
 // A same-learner rerender also invalidates the old pending panel.
 await page.evaluate(()=>{window._adminData.userId='learner';SmartStudy.MockLearningRepository.get=()=>new Promise(r=>window.__finishOldGet=r);window.__oldRender=SmartStudy.MockAdmin.render('learner',document.querySelector('#host'));});await page.waitForFunction(()=>typeof window.__finishOldGet==='function');
 await page.evaluate(async()=>{SmartStudy.MockLearningRepository.get=async()=>structuredClone(window.__setting);await SmartStudy.MockAdmin.render('learner',document.querySelector('#host'));window.__newChart=window.__chart;window.__finishOldGet(null);await window.__oldRender;});assert(await page.evaluate(()=>window.__newChart===window.__chart),'obsolete render leaves current chart intact');
 // A write already sent for the old learner cannot repaint the newly selected learner.
 await page.evaluate(async()=>{window._adminData.userId='learner';SmartStudy.MockLearningRepository.get=async()=>structuredClone(window.__setting);await SmartStudy.MockAdmin.render('learner',document.querySelector('#host'));window.__delay=true;});
 await cards.nth(0).locator('input[type=checkbox]').check();await choose.nth(0).click();await page.waitForFunction(()=>typeof window.__finishSave==='function');
 await page.evaluate(async()=>{window._adminData.userId='other';document.querySelector('#host').textContent='다른 학습자의 화면';window.__delay=false;window.__finishSave();await new Promise(r=>setTimeout(r,0));});assert.equal(await page.locator('#host').innerText(),'다른 학습자의 화면');
 // Missing module dependency gracefully leaves legacy cards and publication intact.
 await page.evaluate(async()=>{window._adminData.userId='learner';window.__records[0].payload.integrity={translationDetected:true};await SmartStudy.MockAdmin.render('learner',document.querySelector('#host'));});assert.equal(await choose.count(),1,'translated exam cannot be selected');assert((await cards.nth(0).innerText()).includes('번역이 감지된 시험'));
 // A delayed initial list, including its rejection, must not overwrite a newer render.
 await page.evaluate(()=>{window.__oldList=SmartStudy.MockPublication.list;SmartStudy.MockPublication.list=()=>new Promise((resolve,reject)=>{window.__listResolve=resolve;window.__listReject=reject;});window.__pendingList=SmartStudy.MockAdmin.render('learner',document.querySelector('#host'));});
 await page.waitForFunction(()=>typeof window.__listResolve==='function');
 await page.evaluate(async()=>{SmartStudy.MockPublication.list=window.__oldList;await SmartStudy.MockAdmin.render('learner',document.querySelector('#host'));window.__latestChart=window.__chart;window.__listResolve(structuredClone(window.__records));await window.__pendingList;});assert(await page.evaluate(()=>window.__latestChart===window.__chart),'obsolete list leaves newer same-learner render intact');
 await page.evaluate(()=>{SmartStudy.MockPublication.list=()=>new Promise((resolve,reject)=>{window.__listReject=reject;});window.__pendingList=SmartStudy.MockAdmin.render('learner',document.querySelector('#host'));});
 await page.evaluate(async()=>{window._adminData.userId='other';document.querySelector('#host').textContent='다른 학습자 유지';window.__listReject(new Error('old failure'));await window.__pendingList;});assert.equal(await page.locator('#host').innerText(),'다른 학습자 유지');
 await page.evaluate(()=>SmartStudy.MockPublication.list=window.__oldList);
 await page.evaluate(async()=>{window._adminData.userId='learner';delete SmartStudy.MockLearningRepository;await SmartStudy.MockAdmin.render('learner',document.querySelector('#host'));});assert.equal(await cards.count(),3);assert.equal(await choose.count(),0);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'390px layout fits viewport');assert.deepEqual(errors,[]);
 console.log('PASS: English diagnostic explicit selection, real counts, pending/public timing, busy guard, persisted restore, clear/error/stale-user handling, legacy fallback, mobile layout.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

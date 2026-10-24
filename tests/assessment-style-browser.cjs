const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const fixture=require('./helpers/mock-transfer-fixture.cjs').setup(),api=fixture.c.SmartStudy.MockExam;
let draft=api.create('learner',fixture.api.build('learner',fixture.now),fixture.now),index=0;
for(let n=0;n<4;n++){
 const section=draft.sections.find(s=>s.state==='active');
 for(const q of api.questionsFor(draft,section)){api.answer('learner',draft.scheduledWeekId,q.id,index++%5?q.answer:q.choices.find(c=>c!==q.answer),fixture.now+1);}
 draft=api.finishSection('learner',draft.scheduledWeekId,fixture.now+2+n,section.id);
 if(draft.break&&!draft.break.endedAt)draft=api.skipBreak('learner',draft.scheduledWeekId,fixture.now+2+n);
}
const reports=JSON.parse(JSON.stringify(api.reportsFor(draft))),result={published:true,publishedAt:fixture.now,snapshot:JSON.parse(JSON.stringify(draft))};
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.setContent('<!doctype html><html lang="ko"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main style="max-width:940px;margin:auto;padding:20px 14px"><section id="summary" class="chart-card" style="background:white;border:1px solid #ede5d6;border-radius:20px;padding:20px"></section><section id="results" class="panel" hidden></section></main></body></html>');
 for(const file of ['mock-exam.css','theme.css','assessment-results.css'])await page.addStyleTag({path:file});
 await page.addScriptTag({path:'assessment-summary.js'});await page.addScriptTag({path:'mock-exam-results.js'});
 await page.evaluate(data=>{window.reports=data.reports;window.result=data.result;SmartStudy.AssessmentSummary.render(document.querySelector('#summary'),reports);}, {reports,result});
 assert.equal(await page.locator('.assessment-subject').count(),reports.length);
 assert((await page.locator('#summary').innerText()).includes('44 / 55'));
 await page.evaluate(()=>SmartStudy.MockExamResults.render(document.querySelector('#results'),{published:false,snapshot:result.snapshot}));
 assert.equal(await page.locator('#results .score-card,#results .released-question').count(),0,'unpublished answers do not enter DOM');
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'admin overflow '+width);}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'scratch/assessment-admin-390.png',fullPage:true});
 await page.evaluate(()=>{document.querySelector('#summary').hidden=true;document.querySelector('#results').hidden=false;SmartStudy.MockExamResults.render(document.querySelector('#results'),result);});
 assert.equal(await page.locator('.score-card').count(),4);assert.equal(await page.locator('.released-question').count(),55);
 assert((await page.locator('.released-overview').innerText()).includes('55문항 중 44문항'));
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'learner overflow '+width);}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'scratch/assessment-learner-390.png',fullPage:true});
 await page.locator('.released-details summary').first().click();assert(await page.locator('.released-question').first().isVisible(),'answer accordion');
 await page.evaluate(()=>SmartStudy.AssessmentSummary.render(document.querySelector('#summary'),[{subject:'math',initialScore:1,totalQuestions:1,metadata:{initialAttempts:[{correct:false,question:'<img src=x onerror=alert(1)>',context:{title:'<script>bad</script>'}}]}}]));
 assert.equal(await page.locator('#summary img,#summary script').count(),0,'scope labels remain text');
 console.log('PASS: admin summary and learner publication UI at 320/390/768/1280px; 44/55 scores preserved, 55 answers expandable, unpublished results absent from DOM, safe text.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

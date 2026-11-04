const {chromium}=require('playwright'),fs=require('fs'),assert=require('assert');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 try{
  await page.setContent('<main></main>');
  await page.evaluate(()=>{window.saved=[];window.SmartStudy={MockLearning:{getState:()=>({targets:[{assessmentId:'exam',questionId:'q',progress:{reviewDone:false},question:{question:'Choose',choices:['one','two'],answer:'two',explanation:'reason'}}]}),recordReview:async(u,e)=>{saved.push(e)}}};});
  await page.addScriptTag({content:fs.readFileSync('answer-validation.js','utf8')});
  await page.addScriptTag({content:fs.readFileSync('mock-learning-review.js','utf8')});
  await page.evaluate(()=>SmartStudy.MockLearningReview.open('user',{diagnostic:{assessmentId:'exam',questionId:'q'}},()=>window.proceeded=true));
  await page.getByRole('button',{name:'two',exact:true}).click();
  await page.getByRole('button',{name:'답 확인'}).click();
  assert.equal(await page.evaluate(()=>saved[0].correct),true);
  await page.getByRole('button',{name:'학습 시작 →'}).click();
  assert.equal(await page.evaluate(()=>window.proceeded),true);
  console.log('PASS diagnostic review answer and transition at mobile size');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

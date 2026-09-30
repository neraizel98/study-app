const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const prefs=new Map(),reports=[], users={};
const clone=x=>JSON.parse(JSON.stringify(x));
const local={getPreference:(k,d)=>prefs.has(k)?clone(prefs.get(k)):d,setPreference:(k,v)=>prefs.set(k,clone(v)),listReports:u=>clone(reports.filter(r=>r.userId===u)),getWrongAnswers:()=>({}),getUser:u=>users[u]||{}};
const ctx={console,Date,Math,Set,Map,URLSearchParams};ctx.window=ctx;ctx.SmartStudy={LocalRepository:local};vm.createContext(ctx);
for(const f of ['ReadingData.js','VocabEng.js','EnglishReadingData.js','EnglishGrammarData.js','VocabHanja.js','MathData.js','MathDataMiddle1.js','MathDataMiddle1Semester2.js','MathFormulaData.js','MathFormulaDataExtra.js','MathFormulaDataVolume2.js','MathFormulaDataVolume3.js','MathFormulaDataVolume4.js','EnglishCourse.js','learning-plan.js','unified-learning.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const p=ctx.SmartStudy.LearningPlan,progress=ctx.SmartStudy.LearningProgress;
for(const budget of [30,45,60]){
 const u='budget'+budget;p.applyParentSettings(u,{budgetMinutes:budget,grade:6,semester:2});const plan=p.createPlan(u);
 assert.deepEqual(clone(plan.tasks.map(t=>t.subject)),['reading','english','grammar','english_reading','math','math_formula','hanja']);
 assert.equal(plan.tasks.reduce((n,t)=>n+t.minutes,0),budget);assert(plan.tasks.every(t=>t.context));
 assert.deepEqual(clone(p.getPlan(u)),clone(plan),'reading the plan must not reset it');
 assert(p.catalog('math_formula',plan.profile).every(c=>ctx.MATH_FORMULAS.find(f=>`formula-${f.number}`===c.context.unitId).level==='초6'));
}
const u='direct',now=Date.now();reports.push({userId:u,sessionId:'direct-hanja',subject:'hanja',date:now,totalQuestions:2,metadata:{unitId:'level7',initialAttempts:[{correct:true},{correct:false}]}});
let plan=p.createPlan(u);plan=p.refreshEvidence(u);let t=plan.tasks.find(t=>t.subject==='hanja');assert.equal(t.context.unitId,'level7');assert.equal(t.status,'completed');assert.equal(t.sessionId,'direct-hanja');
const formula=plan.tasks.find(t=>t.subject==='math_formula');reports.push({userId:u,sessionId:'formula',subject:'math',date:now,totalQuestions:1,metadata:{source:'math-formula',unitId:formula.context.unitId,submittedAt:now,attempts:[{correct:true}]}});
plan=p.refreshEvidence(u);assert.equal(plan.tasks.find(t=>t.subject==='math_formula').status,'completed');assert.notEqual(plan.tasks.find(t=>t.subject==='math').status,'completed');
const other=p.createPlan('other');assert(other.tasks.every(t=>t.status==='ready'),'account isolation');
const english=other.tasks.find(t=>t.subject==='english');
reports.push({userId:'other',sessionId:'partial',subject:'english',date:now,totalQuestions:2,metadata:{...english.context,attempts:[{correct:true}]}});
assert.equal(p.refreshEvidence('other').tasks.find(t=>t.subject==='english').status,'ready');
reports.push({userId:'other',sessionId:'old',subject:'english',date:now-86400000,totalQuestions:1,metadata:{...english.context,attempts:[{correct:true}]}});
assert.equal(p.refreshEvidence('other').tasks.find(t=>t.subject==='english').status,'ready');
users[u]={dailyStats:{date:plan.date,learningTime:{english:10,grammar:20,english_reading:30,math:40,hanja:50},quizTime:{reading:60}},formulaStudyTime:{date:plan.date,studySeconds:70,quizSeconds:80}};
assert.equal(progress.activity(u,plan.date).total,360,'no English/formula double count');
const saved=clone(plan);p.applyParentSettings(u,{budgetMinutes:60,grade:7,semester:1});assert.deepEqual(clone(p.getPlan(u).tasks),saved.tasks,'started/completed activities preserved');
p.savePlan({id:'legacy',userId:'legacy',date:p.today(),budget:45,profile:{grade:6,semester:2},tasks:[{id:'kept',status:'in_progress',startedAt:1,minutes:45}]});assert.equal(p.getPlan('legacy').tasks.length,1);
assert(p.catalog('math_formula',{grade:7,semester:1}).some(c=>ctx.MATH_FORMULAS.find(f=>`formula-${f.number}`===c.context.unitId).level==='중1'));
console.log('Unified daily progression: all 7 activities, budgets, direct submissions, isolation, formula separation, historical preservation verified.');


const choose=progress.nextTask;
assert.equal(choose([{id:'done',status:'completed',context:{}},{id:'missing',status:'ready',context:null},{id:'next',status:'ready',context:{}}]).id,'next');
assert.equal(choose([{id:'first',status:'ready',context:{}},{id:'active',status:'in_progress',context:{}}]).id,'active');
assert.equal(choose([{id:'active',status:'in_progress',context:{}},{id:'required',required:true,status:'ready',context:{}}]).id,'required');
assert.equal(choose([{status:'completed',context:{}}]),null);
const weakUser='weekly-weak',weakContext={unitId:'e3',levelId:'elementary'};
reports.push({userId:weakUser,sessionId:'weekly',subject:'grammar',date:now-3*86400000,totalQuestions:1,metadata:{assessment:true,stageId:'elementary',unitId:'e3',attempts:[{context:weakContext,correct:false}]}});
assert.equal(p.createPlan(weakUser).tasks.find(t=>t.subject==='grammar').context.unitId,'e3','weekly weak scope must feed daily recommendation');
reports.push({userId:'weekly-corrected',sessionId:'weekly',subject:'grammar',date:now-3*86400000,totalQuestions:1,metadata:{assessment:true,stageId:'elementary',unitId:'e3',attempts:[{context:weakContext,correct:false}]}});
reports.push({userId:'weekly-corrected',sessionId:'remedied',subject:'grammar',date:now-2*86400000,totalQuestions:3,metadata:{stageId:'elementary',unitId:'e3',attempts:[{correct:true},{correct:true},{correct:true}]}});
assert.notEqual(p.createPlan('weekly-corrected').tasks.find(t=>t.subject==='grammar').reason,'주간 평가에서 확인된 약점을 먼저 보충해요.','successful later work clears weak recommendation');
assert(p.catalog('math_formula',{grade:6,semester:2}).some(c=>c.context.unitId==='formula-120'),'percent belongs in grade6 catalog');
assert(!p.catalog('math_formula',{grade:6,semester:2}).some(c=>['formula-91','formula-112','formula-115'].includes(c.context.unitId)),'advanced formulas excluded from elementary recommendations');
assert(!p.catalog('math_formula',{grade:12,semester:2}).some(c=>c.context.unitId==='formula-112'),'enrichment remains voluntary');

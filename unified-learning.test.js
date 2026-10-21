const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const prefs=new Map(),reports=[], users={};
const clone=x=>JSON.parse(JSON.stringify(x));
const local={getPreference:(k,d)=>prefs.has(k)?clone(prefs.get(k)):d,setPreference:(k,v)=>prefs.set(k,clone(v)),listReports:u=>clone(reports.filter(r=>r.userId===u)),getWrongAnswers:()=>({}),getUser:u=>users[u]||{}};
const ctx={console,Date,Math,Set,Map,URLSearchParams};ctx.window=ctx;ctx.SmartStudy={LocalRepository:local};vm.createContext(ctx);
for(const f of ['ReadingData.js','VocabEng.js','EnglishReadingData.js','EnglishGrammarData.js','VocabHanja.js','MathData.js','MathDataMiddle1.js','MathDataMiddle1Semester2.js','MathFormulaData.js','MathFormulaDataExtra.js','MathFormulaDataVolume2.js','MathFormulaDataVolume3.js','MathFormulaDataVolume4.js','EnglishCourse.js','KoreanVocabData.js','learning-budget-policy.js','learning-plan.js','unified-learning.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const p=ctx.SmartStudy.LearningPlan,progress=ctx.SmartStudy.LearningProgress;
local.areReportsPersisted=()=>true;
for(const budget of [30,45,60]){
 const u='budget'+budget;p.applyParentSettings(u,{budgetMinutes:budget,grade:6,semester:2});const plan=p.createPlan(u);
 assert.deepEqual(clone(plan.tasks.map(t=>t.subject)),['reading','korean_vocab','english','grammar','english_reading','math','math_formula','hanja']);
 // 모든 과목의 배정 합계는 하루 목표 안에 포함된다.
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
local.areReportsPersisted=()=>false;
assert.equal(progress.evidence('direct').length,0,'pending or failed report writes cannot complete daily tasks');
local.areReportsPersisted=()=>true;
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
const flowUser='warmup-entry',flowPlan=p.createPlan(flowUser),flowTask=flowPlan.tasks.find(t=>t.subject==='english');
assert.equal(p.entryUrl(flowUser,flowTask),flowTask.targetUrl,'today plan skips the English warm-up page');
vm.runInContext(fs.readFileSync('today-journey.js','utf8'),ctx);
const switchUser='journey-switch',switchPlan=p.createPlan(switchUser),switchTask=switchPlan.tasks.find(t=>t.subject==='reading');
p.startTask(switchUser,switchTask.id);const switching=p.getPlan(switchUser);switching.tasks.find(t=>t.id===switchTask.id).studyConfirmed=true;p.savePlan(switching);
const alternate=p.catalog('reading',switchPlan.profile).find(c=>p.contextKey('reading',c.context)!==p.contextKey('reading',switchTask.context));
const beforeSwitch=clone(reports);p.selectContext(switchPlan.id,switchUser,switchTask.id,alternate.context);
let switched=p.getPlan(switchUser).tasks.find(t=>t.id===switchTask.id);assert.equal(switched.status,'ready');assert.equal(switched.studyConfirmed,false);assert.equal(switched.previousContexts.length,1);assert.deepEqual(clone(reports),beforeSwitch);
const protect=p.getPlan(switchUser);protect.tasks.find(t=>t.id===switchTask.id).required=true;p.savePlan(protect);assert.throws(()=>p.selectContext(protect.id,switchUser,switchTask.id,switchTask.context));
const recoverUser='journey-recover',recover=p.createPlan(recoverUser),recoverTask=recover.tasks.find(t=>t.subject==='reading');
const recoveryContext=p.catalog('reading',recover.profile).find(c=>p.contextKey('reading',c.context)!==p.contextKey('reading',recoverTask.context));
reports.push({userId:recoverUser,sessionId:'other-unit-completed',subject:'reading',date:Date.now(),totalQuestions:1,metadata:{...recoveryContext.context,attempts:[{correct:false}]}});
const diagnosed=ctx.SmartStudy.TodayJourney.state(recoverUser,recoverTask.id);assert.equal(diagnosed.phase,1);assert(diagnosed.alternative);
p.selectContext(recover.id,recoverUser,recoverTask.id,diagnosed.alternative.context);assert.equal(ctx.SmartStudy.TodayJourney.state(recoverUser,recoverTask.id).phase,3,'submitted wrong answers also complete the task');
const bothUser='parent-both-english';p.applyParentSettings(bothUser,{budgetMinutes:45,grade:6,semester:2,englishActivity:'vocabulary',scopes:{reading:{mode:'auto'},english:{mode:'assigned',unitId:'level2'},english_reading:{mode:'assigned',levelId:'grade6',unitId:'er2'},math:{mode:'auto'}}});
const bothPlan=p.createPlan(bothUser);assert(bothPlan.tasks.find(t=>t.subject==='english').required);assert(bothPlan.tasks.find(t=>t.subject==='english_reading').required);assert.equal(bothPlan.tasks.find(t=>t.subject==='english_reading').context.unitId,'er2');assert.equal(bothPlan.tasks.find(t=>t.subject==='english').context.unitId,'level2');
// Promotion: a level the learner keeps acing (first attempts) is no longer suggested; the next one is.
{
 const day=86400000,quiz=(user,unitId,ago,correct,total=10)=>reports.push({userId:user,sessionId:`${user}-${unitId}-${ago}`,subject:'hanja',date:Date.now()-ago*day,totalQuestions:total,
  metadata:{unitId,initialAttempts:Array.from({length:total},(_,i)=>({correct:i<correct}))}});
 const hanjaTask=user=>{p.applyParentSettings(user,{budgetMinutes:45,grade:6,semester:2});return p.createPlan(user).tasks.find(t=>t.subject==='hanja');};
 // 한자 8급 100점 세 번 → 7급 제안, 이유에 8급과 평균을 밝힌다.
 for(const ago of [3,2,1])quiz('promote-8',  'level8',ago,10);
 let task=hanjaTask('promote-8');assert.equal(task.context.unitId,'level7');assert.match(task.reasonText,/한자 8급.*100%\(3회\).*한 단계 높은/);
 // 두 번뿐이면 아직 근거가 부족해 8급을 이어 간다.
 for(const ago of [2,1])quiz('two-only','level8',ago,10);
 const grown=user=>progress.outgrown(progress.performance('hanja',{unitId:'level8'},progress.evidence(user)));
 assert.equal(grown('two-only'),false);
 // 평균은 높아도 가장 최근 퀴즈가 흔들리면(70%) 승급하지 않는다.
 for(const [ago,c] of [[4,10],[3,10],[2,10],[1,7]])quiz('shaky','level8',ago,c);
 assert.equal(grown('shaky'),false);
 // 많이 풀었고 평균이 80% 이상이면(8회) 승급한다.
 for(let ago=8;ago>=1;ago--)quiz('many','level8',ago,8);
 assert.equal(grown('many'),true);assert.equal(hanjaTask('many').context.unitId,'level7');
 // 30일이 지난 기록은 승급 근거가 아니다.
 for(const ago of [40,39,38])quiz('old','level8',ago,10);
 assert.equal(grown('old'),false);
 // 8·7급을 모두 넘어서면 6급으로, 넘어선 단계의 오답이 남아 있어도 다시 끌어내리지 않는다.
 for(const ago of [6,5,4])quiz('two-levels','level8',ago,10);
 for(const ago of [3,2,1])quiz('two-levels','level7',ago,10);
 const wrongBefore=local.getWrongAnswers;local.getWrongAnswers=()=>({hanja:[{hanja:'一',unitId:'level8',dueAt:0}]});
 task=hanjaTask('two-levels');local.getWrongAnswers=wrongBefore;
 assert.equal(task.context.unitId,'level6');assert.match(task.reasonText,/한자 7급/);
 const stats=progress.performance('hanja',{unitId:'level8'},progress.evidence('promote-8'));
 assert.deepEqual([stats.sessions,Math.round(stats.average*100),Math.round(stats.last*100)],[3,100,100]);
}
console.log('Promotion: aced levels step up (3×90%+ or 8×80%+, recent and steady), older or shaky evidence does not.');

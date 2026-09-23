const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const values = new Map(), reports = [], wrong = {reading:[],english:[],math:[]};
const local = {
    getPreference:(key,fallback)=>values.has(key)?JSON.parse(JSON.stringify(values.get(key))):fallback,
    setPreference:(key,value)=>values.set(key,JSON.parse(JSON.stringify(value))),
    listReports:()=>JSON.parse(JSON.stringify(reports)),
    getWrongAnswers:()=>JSON.parse(JSON.stringify(wrong)),
    getActiveUser:()=> '우준'
};
const context = {console,Date,Math,Set,Map,TextEncoder,window:null};
context.window=context;
context.SmartStudy={LocalRepository:local};
context.StudyPeriods={daily:()=> '2026-09-18'};
context.LearningPolicy={isDue:item=>Boolean(item.dueAt && item.dueAt<=Date.now())};
vm.createContext(context);
for(const file of ['utils.js','MathData.js','MathDataMiddle1.js','MathDataMiddle1Semester2.js','MathQuizData.js','ReadingData.js','ReadingPassages.js','VocabEng.js','learning-plan.js','learning-session.js','weekly-assessment.js'])
    vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const plan=context.SmartStudy.LearningPlan,session=context.SmartStudy.LearningSession,assessment=context.SmartStudy.WeeklyAssessment;
const autoScopes={reading:{mode:'auto'},english:{mode:'auto'},math:{mode:'auto'}};

assert.deepEqual(JSON.parse(JSON.stringify(plan.budgets[30])),[8,10,12]);
assert.deepEqual(JSON.parse(JSON.stringify(plan.budgets[45])),[12,15,18]);
assert.deepEqual(JSON.parse(JSON.stringify(plan.budgets[60])),[15,20,25]);
assert.equal(plan.getProfile('우준').grade,6);
assert.equal(plan.getSettings('우준').budgetMinutes,45,'the offline default must be 45 minutes');
plan.applyParentSettings('다른학생',{budgetMinutes:45,grade:7,semester:1,scopes:autoScopes});
assert.equal(plan.getProfile('다른학생').grade,7);
plan.savePlan({id:'legacy-2026-09-18',userId:'기존학생',date:'2026-09-18',budget:30,profile:{grade:5,semester:1,publisher:''},tasks:[
    {minutes:8,status:'completed',context:{unitId:'kept'},sessionId:'kept-session',startedAt:10,completedAt:20},
    {minutes:10,status:'ready',context:null,sessionId:null,startedAt:null,completedAt:null},
    {minutes:12,status:'in_progress',context:{unitId:'math'},sessionId:'draft',startedAt:30,completedAt:null}
]});
const migratedDefault=plan.getPlan('기존학생');
assert.equal(migratedDefault.budget,30,'a started legacy plan must keep the goal that was active when work began');
assert.deepEqual(migratedDefault.tasks.map(task=>task.minutes),[8,10,12]);
assert.equal(migratedDefault.tasks[0].status,'completed');
assert.equal(migratedDefault.tasks[0].sessionId,'kept-session');
assert.equal(migratedDefault.tasks[0].context.unitId,'kept');
plan.savePlan({id:'untouched-2026-09-18',userId:'새학생',date:'2026-09-18',budget:30,profile:{grade:5,semester:1},tasks:[
    {minutes:8,status:'ready',startedAt:null,completedAt:null},{minutes:10,status:'ready',startedAt:null,completedAt:null},{minutes:12,status:'ready',startedAt:null,completedAt:null}
]});
const refreshedUntouched=plan.getPlan('새학생');
assert.equal(refreshedUntouched.budget,45,'a completely untouched old plan may adopt the parent/default goal');
assert.deepEqual(JSON.parse(JSON.stringify(refreshedUntouched.tasks.map(task=>task.minutes))),[12,15,18]);
plan.savePlan({id:'past',userId:'기존학생',date:'2026-09-17',budget:30,profile:{grade:5,semester:1,publisher:''},tasks:[
    {minutes:8,status:'completed'},{minutes:10,status:'completed'},{minutes:12,status:'completed'}
]});
assert.equal(plan.getPlan('기존학생','2026-09-17').budget,30,'past plan goals must remain historical evidence');
assert.deepEqual(plan.getPlan('기존학생','2026-09-17').tasks.map(task=>task.minutes),[8,10,12]);

const now=Date.now();
reports.push({sessionId:'math-recent',subject:'math',date:now,createdAt:now,totalQuestions:2,
    metadata:{levelId:'elementary-6',semesterId:'2',unitId:'e6-2-u1',unitTitle:'현재 단원',initialAttempts:[{question:'1',correct:false},{question:'2',correct:true}]}});
reports.push({sessionId:'math-old',subject:'math',date:now-40*86400000,createdAt:now-40*86400000,totalQuestions:1,
    metadata:{levelId:'elementary-6',semesterId:'1',unitId:'e6-1-u1',initialAttempts:[{question:'옛 문항',correct:false}]}});
plan.applyParentSettings('우준',{budgetMinutes:30,grade:6,semester:2,scopes:autoScopes});
const daily=plan.createPlan('우준');
assert.equal(daily.tasks[2].context.unitId,'e6-2-u1','recent current-semester weakness should win');
assert.equal(daily.tasks[0].context.unitId,plan.catalog('reading',daily.profile)[0].context.unitId,'no-history auto mode must use the first verified catalog unit');
assert.equal(daily.tasks[2].minutes,12);
plan.startTask('우준',daily.tasks[2].id);
const beforeSettingsChange=plan.getPlan('우준');
beforeSettingsChange.tasks[0].context={levelId:'level1',unitId:'saved',title:'저장된 단원'};
beforeSettingsChange.tasks[0].sessionId='draft-session';
beforeSettingsChange.tasks[0].startedAt=1234;
plan.savePlan(beforeSettingsChange);
plan.applyParentSettings('우준',{budgetMinutes:60,grade:6,semester:2,scopes:autoScopes});
const migrated=plan.getPlan('우준');
assert.equal(migrated.budget,30,'new parent settings must wait when any current task has started');
assert.deepEqual(migrated.tasks.map(task=>task.minutes),[8,10,12]);
assert.equal(migrated.tasks[0].context.unitId,'saved','a settings change must preserve the selected unit');
assert.equal(migrated.tasks[0].sessionId,'draft-session','a settings change must preserve the draft session');
assert.equal(migrated.tasks[0].startedAt,1234,'a settings change must preserve start evidence');
assert.equal(migrated.tasks[2].status,'in_progress','a settings change must preserve task status');
assert.equal(plan.refreshEvidence('우준').tasks[2].status,'in_progress','old report cannot finish a new task');
reports.push({sessionId:'partial',subject:'math',date:Date.now()+10,createdAt:Date.now()+10,totalQuestions:3,
    metadata:{levelId:'elementary-6',semesterId:'2',unitId:'e6-2-u1',initialAttempts:[{question:'1',correct:true}]}});
assert.equal(plan.refreshEvidence('우준').tasks[2].status,'in_progress','partial quiz cannot finish the task');
reports.push({sessionId:'full',subject:'math',date:Date.now()+20,createdAt:Date.now()+20,totalQuestions:2,
    metadata:{levelId:'elementary-6',semesterId:'2',unitId:'e6-2-u1',submittedAt:Date.now()+20,
        initialAttempts:[{question:'1',correct:false},{question:'2',correct:true}]}});
assert.equal(plan.refreshEvidence('우준').tasks[2].sessionId,'full','complete submitted attempt confirms the task');

const readingChoice=plan.catalog('reading',{grade:6,semester:2})[1];
const englishChoice=plan.catalog('english',{grade:6,semester:2})[0];
const mathChoice=plan.catalog('math',{grade:6,semester:2})[0];
const assignedScopes={
    reading:{mode:'assigned',...readingChoice.context},
    english:{mode:'assigned',...englishChoice.context},
    math:{mode:'assigned',...mathChoice.context}
};
plan.applyParentSettings('지정학생',{budgetMinutes:45,grade:6,semester:2,scopes:assignedScopes});
const assigned=plan.createPlan('지정학생');
assert(assigned.tasks.every(task=>task.required&&task.assignmentMode==='assigned'));
assert.equal(assigned.tasks[0].context.unitId,readingChoice.context.unitId);
assert.throws(()=>plan.selectContext(assigned.id,'지정학생',assigned.tasks[0].id,plan.catalog('reading',assigned.profile)[0].context),/완료 전 변경/);
plan.startTask('지정학생',assigned.tasks[0].id);
const assignedStart=plan.getPlan('지정학생').tasks[0].startedAt;
reports.push({sessionId:'assigned-partial',subject:'reading',createdAt:assignedStart+1,totalQuestions:1,
    metadata:{...readingChoice.context,initialAttempts:[{question:'1',correct:true}]}});
assert.equal(plan.refreshEvidence('지정학생').tasks[0].status,'in_progress','answers without submission evidence must not finish a required unit');
reports.push({sessionId:'assigned-submitted',subject:'reading',createdAt:assignedStart+2,totalQuestions:1,
    metadata:{...readingChoice.context,submittedAt:assignedStart+2,initialAttempts:[{question:'1',correct:true}]}});
assert.equal(plan.refreshEvidence('지정학생').tasks[0].status,'completed','a submitted quiz for the exact required unit unlocks free learning');
assert.equal(plan.getPlan('지정학생').tasks[0].context.unitId,readingChoice.context.unitId,'completion must retain the original required assignment');

plan.applyParentSettings('미지원학생',{budgetMinutes:45,grade:8,semester:1,scopes:autoScopes});
const unsupported=plan.createPlan('미지원학생');
assert.equal(unsupported.tasks[2].context,null,'unsupported grades must not invent a math range');
assert.match(unsupported.tasks[2].reasonText,/사용할 수 있는 단원/);

const draft={userId:'우준',sessionId:'weekly-test',planId:null,taskId:null,mode:'assessment',subject:'mixed',context:null,
    questions:[{id:'q1'}],responses:{q1:'A'},cursor:0,activeSeconds:3,updatedAt:0,submittedAt:null};
session.save('우준',draft);
assert.equal(session.get('우준','weekly-test').responses.q1,'A');
assert.equal(session.get('다른학생','weekly-test'),null,'draft keys must isolate learner accounts');
session.submit('우준','weekly-test');
assert.throws(()=>session.save('우준',draft),/제출한/);

const report={subject:'english',date:now,metadata:{unitId:'level1',initialAttempts:['animal','beautiful','clean','dance','easy'].map(question=>({question,correct:true}))}};
const englishScope=assessment.scopesFromReports([report],'english')[0];
const english=assessment.buildAssessmentItems({subject:'english',scope:englishScope,count:5});
assert(english.actualCount>0);
assert(english.items.every(item=>!item.question.includes(item.answer)),'answer word must be hidden in the blank');
const practicedWords=['animal','beautiful','clean','dance','easy'];
const practiceReport={subject:'english',date:now,metadata:{unitId:'level1',practice:true,initialAttempts:practicedWords.map(word=>({
    question:`This practiced sentence hides _____.`,word,correctAnswer:word,correct:true
}))}};
const practiceScope=assessment.scopesFromReports([practiceReport],'english')[0];
assert(practiceScope.learnedWords.has('animal'),'today practice word metadata must remain eligible for a later weekly assessment');
assert(assessment.buildAssessmentItems({subject:'english',scope:practiceScope,count:1}).actualCount>0);
const math=assessment.buildAssessmentItems({subject:'math',scope:{context:{levelId:'elementary-6',semesterId:'1',unitId:'e6-1-u1'}},count:3,mode:'practice',band:'standard'});
assert.equal(math.actualCount,3);
assert(math.items.every(item=>item.generator&&item.choices.includes(item.answer)),'math practice must retain a retry generator and exact answer');
const readingPassage=context.ReadingPassages.find(item=>item.difficulty==='standard');
const reading=assessment.buildAssessmentItems({subject:'reading',scope:{context:{levelId:'level1',unitId:readingPassage.unitId}},count:2});
assert(reading.actualCount>0);
assert(reading.items.every(item=>item.passageId&&item.passageLines.length&&item.choices.includes(item.answer)),'reading retry must retain passage and answer evidence');
const noScope=assessment.buildWeekly('우준',5);
assert.equal(noScope.reading.actualCount,0,'unstudied reading units cannot enter assessment');
assert(noScope.reading.shortfallReason);
console.log('Daily plan, profile isolation, evidence gate, resumable draft, and studied-scope assessment verified.');

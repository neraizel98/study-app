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
for(const file of ['utils.js','MathQuizData.js','ReadingPassages.js','VocabEng.js','learning-plan.js','learning-session.js','weekly-assessment.js'])
    vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const plan=context.SmartStudy.LearningPlan,session=context.SmartStudy.LearningSession,assessment=context.SmartStudy.WeeklyAssessment;

assert.deepEqual(JSON.parse(JSON.stringify(plan.budgets[30])),[8,10,12]);
assert.deepEqual(JSON.parse(JSON.stringify(plan.budgets[45])),[12,15,18]);
assert.deepEqual(JSON.parse(JSON.stringify(plan.budgets[60])),[15,20,25]);
assert.equal(plan.getProfile('우준').grade,6);
assert.equal(plan.getProfile('다른학생'),null,'another learner must set their own profile');
plan.saveProfile('다른학생',{grade:7,semester:1});
assert.equal(plan.getProfile('다른학생').grade,7);

const now=Date.now();
reports.push({sessionId:'math-recent',subject:'math',date:now,createdAt:now,totalQuestions:2,
    metadata:{levelId:'elementary-6',semesterId:'2',unitId:'e6-2-u1',unitTitle:'현재 단원',initialAttempts:[{question:'1',correct:false},{question:'2',correct:true}]}});
reports.push({sessionId:'math-old',subject:'math',date:now-40*86400000,createdAt:now-40*86400000,totalQuestions:1,
    metadata:{levelId:'elementary-6',semesterId:'1',unitId:'e6-1-u1',initialAttempts:[{question:'옛 문항',correct:false}]}});
const daily=plan.createPlan('우준',30);
assert.equal(daily.tasks[2].context.unitId,'e6-2-u1','recent current-semester weakness should win');
assert.equal(daily.tasks[0].context,null,'middle-school reading must not be assigned without prior learning');
assert.equal(daily.tasks[2].minutes,12);
plan.startTask('우준',daily.tasks[2].id);
assert.equal(plan.refreshEvidence('우준').tasks[2].status,'in_progress','old report cannot finish a new task');
reports.push({sessionId:'partial',subject:'math',date:Date.now()+10,createdAt:Date.now()+10,totalQuestions:3,
    metadata:{levelId:'elementary-6',semesterId:'2',unitId:'e6-2-u1',initialAttempts:[{question:'1',correct:true}]}});
assert.equal(plan.refreshEvidence('우준').tasks[2].status,'in_progress','partial quiz cannot finish the task');
reports.push({sessionId:'full',subject:'math',date:Date.now()+20,createdAt:Date.now()+20,totalQuestions:2,
    metadata:{levelId:'elementary-6',semesterId:'2',unitId:'e6-2-u1',submittedAt:Date.now()+20,
        initialAttempts:[{question:'1',correct:false},{question:'2',correct:true}]}});
assert.equal(plan.refreshEvidence('우준').tasks[2].sessionId,'full','complete submitted attempt confirms the task');

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

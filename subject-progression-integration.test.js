const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const prefs=new Map(),reports=[];
const local={getPreference:(k,d)=>prefs.get(k)??d,setPreference:(k,v)=>prefs.set(k,v),getActiveUser:()=> 'learner',listReports:u=>reports.filter(r=>r.userId===u),getWrongAnswers:()=>({}),getUser:()=>({})};
const c={console,Date,Math,Set,Map,URLSearchParams};c.window=c;c.SmartStudy={LocalRepository:local};vm.createContext(c);
for(const file of ['ReadingData.js','ReadingPassages.js','KoreanReadingMiddle.js','KoreanReadingHigh.js','KoreanReadingCurriculum.js','EnglishGrammarData.js','EnglishGrammarExpanded.js','english-curriculum.js','EnglishReadingData.js','EnglishReadingMore1.js','EnglishReadingMore2.js','EnglishReadingSecondary.js','VocabEng.js','VocabHanja.js','subject-progression.js','EnglishCourse.js','learning-budget-policy.js','learning-plan.js','unified-learning.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
const plan=c.SmartStudy.LearningPlan;
plan.applyParentSettings('learner',{grade:8,semester:1,budgetMinutes:45});
const profile=plan.getProfile('learner');
assert(plan.catalog('reading',profile).every(x=>c.KoreanReadingCurriculum.gradeOfUnit(x.context.unitId)===7));
assert(plan.catalog('english_reading',profile).every(x=>x.context.levelId==='middle1'));
assert(plan.catalog('grammar',profile).every(x=>x.context.levelId==='middle'));
function add(subject,unitId,internal,i,passageId){reports.push({userId:'learner',subject,sessionId:subject+'-'+i,date:Date.now()-86400000+i,totalQuestions:5,initialScore:5,
 metadata:{unitId,grade:subject==='reading'?internal:undefined,stageId:subject==='grammar'?internal:undefined,levelId:subject==='english_reading'?internal:'level1',passageId,initialAttempts:Array.from({length:5},()=>({correct:true}))}});}
const readings=c.ReadingPassages.filter(p=>p.grade===7);
const english=c.EnglishReadingData.units.filter(u=>u.gradeId==='middle1').flatMap(u=>u.passages.map(p=>({id:p.id,unitId:u.id})));
const grammar=c.EnglishGrammarData.middle.units;
for(let i=0;i<3;i++){add('reading',readings[i].unitId,7,i,readings[i].id);add('english_reading',english[i].unitId,'middle1',i,english[i].id);add('grammar',grammar[i].id,'middle',i);}
assert(plan.catalog('reading',profile).every(x=>c.KoreanReadingCurriculum.gradeOfUnit(x.context.unitId)===8));
assert(plan.catalog('english_reading',profile).every(x=>x.context.levelId==='middle2'));
assert(plan.catalog('grammar',profile).every(x=>x.context.levelId==='middle2'));
const daily=plan.createPlan('learner');
assert.equal(c.KoreanReadingCurriculum.gradeOfUnit(daily.tasks.find(t=>t.subject==='reading').context.unitId),8);
assert.equal(daily.tasks.find(t=>t.subject==='grammar').context.levelId,'middle2');
assert.equal(daily.tasks.find(t=>t.subject==='english_reading').context.levelId,'middle2');
plan.applyParentSettings('assigned',{grade:8,semester:1,budgetMinutes:45,scopes:{reading:{mode:'assigned',levelId:'level1',unitId:'kr-m3-r1'},english_reading:{mode:'assigned',levelId:'middle3',unitId:'mr3-unit1'}}});
const assigned=plan.createPlan('assigned');
assert.equal(assigned.tasks.find(t=>t.subject==='reading').context.unitId,'kr-m3-r1');
assert.equal(assigned.tasks.find(t=>t.subject==='english_reading').context.unitId,'mr3-unit1');
assert.equal(plan.catalog('grammar',plan.getProfile('other'))[0].context.levelId,'elementary','accounts remain isolated');
console.log('Shared progression drives daily catalogs and integrated English course, while exact parent assignments and accounts remain isolated.');

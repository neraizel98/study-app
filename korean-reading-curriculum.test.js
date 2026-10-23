const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={console,Date,Math,Set,Map,URLSearchParams};c.window=c;
const prefs=new Map(),reports=[];c.SmartStudy={LocalRepository:{getPreference:(key,fallback)=>prefs.get(key)||fallback,setPreference:(key,value)=>prefs.set(key,value),listReports:user=>reports.filter(r=>r.userId===user),getWrongAnswers:()=>({}),getUser:()=>({})}};
vm.createContext(c);
const files=['ReadingData.js','ReadingPassages.js','ReadingPassagesMore1.js','ReadingPassagesMore2.js','ReadingPassagesMore3.js'];
for(const file of files)vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
const legacy=c.ReadingPassages.map(p=>({id:p.id,body:JSON.stringify({lines:p.lines,questions:p.questions})}));
for(const file of ['KoreanReadingMiddle.js','KoreanReadingHigh.js','KoreanReadingCurriculum.js','learning-budget-policy.js','learning-plan.js','unified-learning.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
const api=c.KoreanReadingCurriculum,plan=c.SmartStudy.LearningPlan;
assert.deepEqual(Object.keys(c.ReadingData.levels),['level1','level2']);
const passages=c.ReadingPassages.filter(p=>!p.legacy),ids=new Set(),questions=new Set();
assert.equal(passages.length,48);
for(let grade=7;grade<=12;grade++){
 const levelId=api.levelForGrade(grade),units=c.ReadingData.levels[levelId].units.filter(u=>u.grade===grade);
 assert.equal(units.length,8);assert.equal(passages.filter(p=>p.grade===grade).length,8);
 const catalog=plan.catalog('reading',{grade,semester:1});
 assert.equal(catalog.length,8);assert(catalog.every(row=>api.gradeOfUnit(row.context.unitId)===grade&&row.context.levelId===levelId));
 for(const unit of units){
  assert(({...c.KoreanReadingMiddleLessons,...c.KoreanReadingHighLessons})[unit.id],`${unit.id}: authored grade-specific lesson registry`);
  assert.equal(unit.lessons.length,2);
  for(const lesson of unit.lessons){
   assert(lesson.title&&lesson.principle&&lesson.rules.length>=3&&lesson.tip,`${unit.id}: substantive lesson scaffold`);
   assert(lesson.examples?.length>=2,`${unit.id}: contrast/application examples`);
   for(const example of lesson.examples)assert(example.text&&example.analysis&&example.label);
  }
  const pool=passages.filter(p=>p.unitId===unit.id&&p.grade===grade);
  assert(pool.length>0,`${unit.id}: actual quiz passage`);
 }
}
for(const passage of passages){
 assert(!ids.has(passage.id));ids.add(passage.id);
 assert.equal(passage.levelId,api.levelForGrade(passage.grade));
 assert(passage.lines.length>=5&&passage.lines.every(line=>typeof line==='string'&&line.trim()));
 assert.equal(passage.questions.length,6);
 assert(passage.questions.some(q=>q.question.includes('보기')),`${passage.id}: apply to a new case`);
 for(const q of passage.questions){
  assert(q.id&&!questions.has(q.id));questions.add(q.id);
  assert(q.skill&&q.question&&q.evidence&&q.explanation,`${q.id}: explanation and skill`);
  assert.equal(q.difficulty,'standard');assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);
  assert.equal(q.choices.filter(choice=>choice===q.answer).length,1);
  assert(q.evidenceLines.length&&q.evidenceLines.every(index=>Number.isInteger(index)&&index>=0&&index<passage.lines.length),`${q.id}: real evidence lines`);
 }
}
for(const original of legacy){
 const p=c.ReadingPassages.find(p=>p.id===original.id);assert(p.legacy);
 assert.equal(JSON.stringify({lines:p.lines,questions:p.questions}),original.body,'retired texts stay intact for historical review');
}
assert.equal(plan.catalog('reading',{grade:6,semester:1})[0].context.unitId,'r1','primary learner starts at middle1');
console.log(`Korean reading: six grades,48units/96lessons,48original passages/288questions, exact grade catalogs, historical text preservation passed.`);

const learner='new-korean-course',yesterday=Date.now()-86400000;
plan.applyParentSettings(learner,{budgetMinutes:45,grade:7,semester:1});
for(let i=0;i<3;i++)reports.push({userId:learner,subject:'reading',sessionId:'legacy-pass-'+i,date:yesterday+i,totalQuestions:5,initialScore:5,metadata:{levelId:'level1',unitId:'r1',passageId:legacy.find(p=>c.ReadingPassages.find(x=>x.id===p.id).unitId==='r1').id,initialAttempts:Array.from({length:5},()=>({correct:true}))}});
assert.equal(plan.createPlan(learner).tasks.find(t=>t.subject==='reading').context.unitId,'r1','old easy scores must not skip upgraded lessons');
function submitted(unitId,correct,review=false,at=yesterday+100){
 const passage=passages.find(p=>p.unitId===unitId);
 reports.push({userId:learner,subject:'reading',sessionId:unitId+'-'+at,date:at,initialScore:correct,totalQuestions:5,metadata:{levelId:'level1',unitId,passageId:passage.id,review,initialAttempts:Array.from({length:5},(_,i)=>({correct:i<correct}))}});
}
submitted('r1',5);prefs.delete(`SmartStudy_DailyPlan_${learner}_${plan.today()}`);assert.equal(plan.createPlan(learner).tasks.find(t=>t.subject==='reading').context.unitId,'r2','successful lesson advances learning order without requiring repeated identical tests');
submitted('r2',5,true);prefs.delete(`SmartStudy_DailyPlan_${learner}_${plan.today()}`);assert.equal(plan.createPlan(learner).tasks.find(t=>t.subject==='reading').context.unitId,'r3','successful practice may advance learning order');
submitted('r2',2,true,yesterday+200);prefs.delete(`SmartStudy_DailyPlan_${learner}_${plan.today()}`);assert.equal(plan.createPlan(learner).tasks.find(t=>t.subject==='reading').context.unitId,'r2','a later weak check returns to the relevant lesson');

for(const name of fs.readdirSync('.').filter(name=>name.endsWith('.html'))){
 const html=fs.readFileSync(name,'utf8');
 if(!/src=["']Reading(?:Data|Passages)\.js/.test(html))continue;
 const scripts=[...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m=>m[1].split('?')[0]);
 for(const file of ['ReadingData.js','KoreanReadingMiddle.js','KoreanReadingHigh.js','KoreanReadingCurriculum.js'])assert.equal(scripts.filter(x=>x===file).length,1,`${name}: shared curriculum dependency exactly once`);
 assert(scripts.indexOf('ReadingData.js')<scripts.indexOf('KoreanReadingMiddle.js'));
 assert(scripts.indexOf('KoreanReadingHigh.js')<scripts.indexOf('KoreanReadingCurriculum.js'));
 if(scripts.includes('ReadingPassages.js'))assert(scripts.indexOf('ReadingPassages.js')<scripts.indexOf('KoreanReadingMiddle.js'),`${name}: legacy load cannot replace new passages`);
}

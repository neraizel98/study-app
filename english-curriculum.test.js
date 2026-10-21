const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const curriculum=require('./english-curriculum.js');
const ids=['grade6','middle1','middle2','middle3','high1','high2','high3'];
ids.forEach((id,index)=>{
 assert.equal(curriculum.gradeForProfile(index+6),id);
 assert.equal(curriculum.readingGrade(id).groupId,index===0?'level1':index<4?'level2':'level3');
 const unitId=index===0?'er6':`${index<4?'mr':'hr'}${index<4?index:index-3}-unit2`;
 assert(curriculum.validReadingScope({levelId:id,unitId}));
 assert(!curriculum.validReadingScope({levelId:id,unitId:index===0?'mr1-unit1':'er1'}));
});
assert.equal(curriculum.gradeForProfile(1),'grade6');
assert.equal(curriculum.gradeForProfile(20),'high3');
const prefs=new Map();
const c={console,Date,Math,Set,Map,URLSearchParams};c.window=c;
c.SmartStudy={LocalRepository:{getPreference:(key,fallback)=>prefs.get(key)||fallback,setPreference:(key,value)=>prefs.set(key,value),listReports:()=>[],getWrongAnswers:()=>({}),getUser:()=>({})}};
vm.createContext(c);
for(const file of ['english-curriculum.js','EnglishReadingData.js','EnglishReadingMore1.js','EnglishReadingMore2.js','EnglishReadingSecondary.js','EnglishReadingPolicy.js','EnglishGrammarData.js','EnglishGrammarExpanded.js','EnglishCourse.js','learning-budget-policy.js','learning-plan.js','unified-learning.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
ids.forEach((id,index)=>{
 const profile={grade:index+6,semester:1},plan=c.SmartStudy.LearningPlan;
 const reading=plan.catalog('english_reading',profile),grammar=plan.catalog('grammar',profile);
 assert(reading.length>0,`${id} reading catalog`);assert(grammar.length>0,`${id} grammar catalog`);
 assert(reading.every(x=>x.context.levelId===id));
 assert(grammar.every(x=>x.context.levelId===curriculum.grammarForProfile(profile.grade)));
 const course=c.EnglishCourse.build(c.EnglishReadingData,{},[],{},Date.now(),{grade:profile.grade});
 assert(course && (course.unit.gradeId||'grade6')===id,`${id} course cannot borrow another grade`);
 assert(course.steps[2].href.includes(`level=${id}`));
});
const reports=ids.flatMap((id,index)=>[0,1,2].map(n=>({subject:'english_reading',date:100+index*10+n,initialScore:index===0?5:1,totalQuestions:5,metadata:{levelId:id,passageId:`${id}-${n}`,isNovel:true,readingAssessment:true}})));
assert.equal(c.EnglishReadingPolicy.assessmentEvidence(reports,1,'grade6').band,2);
assert.equal(c.EnglishReadingPolicy.assessmentEvidence(reports,1,'high3').band,0);
assert.equal(c.EnglishReadingPolicy.assessmentEvidence(reports.filter(r=>r.metadata.levelId==='grade6'),1,'high3').samples,0);
console.log('Three-level mappings, bounded scopes, profile catalogs, course routing and grade-isolated difficulty verified.');

for(const unit of c.EnglishReadingData.units){
 for(const passage of unit.passages){
  assert(passage.sentences.length===passage.translations.length,`${passage.id}: aligned translations`);
  assert(passage.questions.length>=5,`${passage.id}: complete question set`);
  for(const q of passage.questions){
   assert(q.prompt&&q.explanation&&q.choices.length===4,`${q.id}: complete question`);
   assert(new Set(q.choices).size===4&&Number.isInteger(q.answerIndex)&&q.answerIndex>=0&&q.answerIndex<4,`${q.id}: unambiguous closed answer`);
   assert(q.evidence?.length&&q.evidence.every(index=>Number.isInteger(index)&&index>=0&&index<passage.sentences.length),`${q.id}: actual passage evidence`);
  }
  for(const ref of passage.grammarRefs||[]){
   const linked=c.EnglishGrammarData[ref.stageId]?.units.find(item=>item.id===ref.unitId);
   assert(linked?.lessons[ref.lessonIndex||0],`${passage.id}: real grammar lesson ${ref.stageId}/${ref.unitId}`);
  }
 }
}
for(const id of ids){
 const passages=curriculum.unitsForGrade(c.EnglishReadingData,id).flatMap(unit=>unit.passages);
 assert(passages.length>=(id==='grade6'?44:6),`${id}: expanded reading coverage`);
 assert.deepEqual([...new Set(passages.map(p=>p.band))].sort(),[0,1,2],`${id}: three within-grade bands`);
}

for(const file of ['EnglishGrammarQuiz.js','EnglishGrammarAdvancedQuiz.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
c.SmartStudy.WeeklyAssessment={buildAssessmentItems:()=>[]};
vm.runInContext(fs.readFileSync('weekly-assessment-expanded.js','utf8'),c);
for(const levelId of ids){
 const unit=curriculum.unitsForGrade(c.EnglishReadingData,levelId)[0],p=unit.passages[0];
 const scope={context:{levelId,unitId:unit.id},passageIds:new Set([p.id])};
 const built=c.SmartStudy.WeeklyAssessment.buildAssessmentItems({subject:'english_reading',scope,count:5});
 assert.equal(built.items.length,5,`${levelId}: weekly closed-choice adapter`);
 assert(built.items.every(q=>q.context.levelId===levelId&&q.passageId===p.id));
 const wrongScope={...scope,context:{...scope.context,levelId:levelId==='grade6'?'high3':'grade6'}};
 assert.equal(c.SmartStudy.WeeklyAssessment.buildAssessmentItems({subject:'english_reading',scope:wrongScope,count:5}).items.length,0,'mismatched grade-unit evidence cannot borrow another grade');
 const stage=curriculum.grammarForProfile(curriculum.readingGrade(levelId).grade),g=c.EnglishGrammarData[stage].units[0];
 assert.equal(c.SmartStudy.WeeklyAssessment.buildAssessmentItems({subject:'grammar',scope:{context:{levelId:stage,unitId:g.id}},count:5}).items.length,5,`${stage}: grammar weekly adapter`);
}

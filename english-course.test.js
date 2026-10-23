const assert=require('node:assert/strict');const {build}=require('./EnglishCourse');
const data={units:[{id:'er1',passages:[{id:'p1',band:0,vocabulary:[{word:'moon'}],grammarRefs:[{stageId:'elementary',unitId:'e3'}]},{id:'p2',band:1,vocabulary:[{word:'moon'}],grammarRefs:[{stageId:'elementary',unitId:'e3'}]}]}]};
const now=2000000000,vocab={level1:[{word:'moon'}]};
const report=(subject,meta,score=4)=>({subject,date:now-1000,initialScore:score,finalScore:5,totalQuestions:5,metadata:{...meta,attempts:Array(5).fill({correct:true})}});
assert.equal(build(data,vocab,[],{},now).next.id,'words');
const words=report('english',{unitId:'level1'}),grammar=report('grammar',{stageId:'elementary',unitId:'e3'});
assert.equal(build(data,vocab,[words],{},now).next.id,'grammar');
assert.equal(build(data,vocab,[words,grammar],{},now).next.id,'reading');
const low=report('english_reading',{passageId:'p1'},2);
assert.equal(build(data,vocab,[words,grammar,low],{},now).passage.id,'p1','retry final score cannot advance first-score mastery');
assert.equal(build(data,vocab,[words,grammar,report('english_reading',{passageId:'p1'})],{},now).passage.id,'p2');
assert.equal(build(data,vocab,[{...words,date:now-8*86400000}],{},now).next.id,'words','spaced prerequisite refresh');
assert.equal(build(data,vocab,[],{english:[{dueAt:now+1},{dueAt:now-1},{deleted:true}]},now).due.length,1);
assert.equal(build(data,vocab,[{...words,metadata:{...words.metadata,review:true}}],{},now).next.id,'words');
console.log('English course sequence, first-score progression, and spaced review verified.');

{
 global.ConceptMastery={evaluate:()=>({name:'foundation'})};
 const passages=[1,2,3].map(i=>({id:'standard-'+i,band:1,vocabulary:[],grammarRefs:[]}));
 passages.push({id:'challenge-1',band:2,vocabulary:[],grammarRefs:[]});
 const course={units:[{id:'test-unit',gradeId:'grade6',passages}]};
 const records=[1,2,3].map(i=>report('english_reading',{levelId:'grade6',passageId:'standard-'+i,practiceAssessment:true},5));
 assert.equal(build(course,{},records,{},now).passage.id,'challenge-1','three distinct first standard successes unlock challenge practice even if transfer mastery is still foundation');
 assert.notEqual(build(course,{},records.map(r=>({...r,totalQuestions:1})),{},now).passage.id,'challenge-1');
 delete global.ConceptMastery;
}

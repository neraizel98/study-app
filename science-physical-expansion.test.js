'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const data=require('./ScienceData.js');
const coreIds=['l1-physics-force','l1-physics-heat','l1-chemistry-states','l1-chemistry-mixtures'];
const before=new Map(coreIds.map(id=>[id,JSON.stringify(data.units.find(u=>u.id===id))]));
const practice=require('./SciencePhysicalExpansion.js');
const assessment=require('./ScienceMockPhysicalExpansion.js');
const bank=require('./ScienceMockData.js');

test('12 new physical units retain the four existing unit objects and question IDs',()=>{
 assert.equal(practice.units.length,12);
 assert.equal(practice.units.reduce((n,u)=>n+u.questions.length,0),240);
 assert.equal(assessment.items.length,720);
 for(const id of coreIds)assert.equal(JSON.stringify(data.units.find(u=>u.id===id)),before.get(id));
 const expected=['physics-magnets','physics-sound','physics-light','physics-electricity','physics-energy','chemistry-materials','chemistry-solutions','chemistry-gases','chemistry-acids','chemistry-combustion','bridge-force-graphs','bridge-particles'].map(x=>'l1-'+x);
 assert.deepEqual(new Set(practice.units.map(u=>u.id)),new Set(expected));
 for(const unit of practice.units){
  assert.equal(unit.questions.length,20,unit.id);
  assert.equal(unit.levelId,'level1');
  assert.equal(unit.curriculumMapping,null);
  assert.equal(unit.internalBand,unit.id.includes('-bridge-')?'bridge':'elementary');
  assert.ok(unit.lessons.length>=2);
  assert.ok(unit.goals.length>=2&&unit.concepts.length>=3&&unit.misconceptions.length>=2);
  assert.ok(unit.sourceRefs.every(s=>s.url.startsWith('https://')&&!s.url.includes('/subjects/')));
  assert.equal(new Set(unit.questions.map(q=>q.question)).size,20);
  assert.ok(unit.lessons.every(l=>l.question&&l.reason&&l.body.length>=2&&Number.isInteger(l.modelCondition)));
  assert.ok(unit.lessons.every(l=>unit.questions.some(q=>q.lessonId===l.id)),unit.id+' lesson coverage');
  assert.ok(unit.questions.every(q=>unit.lessons.some(l=>l.id===q.lessonId)));
  assert.deepEqual(new Set(unit.questions.map(q=>q.skill)),new Set(['concept','diagram','conditions','apply','evidence']));
 }
});

test('each physical assessment has 12 independently authored situations and 5 distinct targets',()=>{
 for(const unit of practice.units){
  const questions=assessment.items.filter(q=>q.unitId===unit.id);
  assert.equal(questions.length,60,unit.id);
  const families=new Set(questions.map(q=>q.familyId));
  assert.equal(families.size,12,unit.id);
  assert.equal(new Set(questions.map(q=>q.question)).size,60,unit.id+' unique questions');
  for(const family of families){
   const rows=questions.filter(q=>q.familyId===family);
   assert.equal(rows.length,5);
   assert.deepEqual(rows.map(q=>q.skill),['diagram','conditions','inference','apply','evidence']);
   assert.equal(new Set(rows.map(q=>q.question)).size,5);
   assert.ok(rows.every(q=>q.givens.includes('仮')===false&&q.givens.includes('가상')));
   assert.equal(new Set(rows.map(q=>q.lessonId)).size,1);
   assert.ok(unit.lessons.some(l=>l.id===rows[0].lessonId));
   assert.ok(rows.slice(2).every(q=>q.question.length>=8&&q.explanation.length>=8));
  }
 }
 const all=[...practice.units.flatMap(u=>u.questions),...assessment.items];
 assert.equal(new Set(all.map(q=>q.id)).size,960);
 for(const q of all){
  assert.equal(q.choices.length,4,q.id);
  assert.equal(new Set(q.choices).size,4,q.id);
  assert.equal(q.choices[q.answerIndex],q.answer,q.id);
  assert.equal(q.answer,q.correctAnswer,q.id);
  assert.ok(q.explanation&&q.givens&&q.sourceRefs.length,q.id);
  assert.ok(!/물체 이름의 길이|항상 나무이다|재료 이름의 길이/.test(q.choices.join(' ')),q.id);
 }
});

test('equal measurements, physical energy balance, and scene-to-lesson references stay correct',()=>{
 for(const family of ['chemistry-solutions:assessment:mass','chemistry-solutions:assessment:filter','chemistry-acids:assessment:identity','bridge-particles:assessment:closed-compression']){
  const q=assessment.items.find(q=>q.id==='l1-'+family+':0');
  assert.equal(q.answer,'두 조건의 값이 같다',family);
 }
 const heat=assessment.items.find(q=>q.id==='l1-physics-energy:assessment:lamp-heat:2');
 assert.ok(heat.givens.includes('10J')&&heat.givens.includes('5J')&&heat.givens.includes('3J'));
 assert.ok(heat.givens.includes('열로 전달된 에너지'));
 const conditions={
  'l1-physics-magnets':[0,3],'l1-physics-sound':[0,1],'l1-physics-light':[0,1,2],
  'l1-physics-electricity':[0,2,4,5],'l1-physics-energy':[0,0],'l1-chemistry-materials':[0,4],
  'l1-chemistry-solutions':[0,2],'l1-chemistry-gases':[1,2],'l1-chemistry-acids':[0,4],
  'l1-chemistry-combustion':[0,2],'l1-bridge-force-graphs':[0,2],'l1-bridge-particles':[0,3]
 };
 for(const u of practice.units)assert.deepEqual(u.lessons.map(l=>l.modelCondition),conditions[u.id]);
 assert.ok(assessment.items.filter(q=>q.unitId==='l1-physics-light'&&q.familyId.endsWith(':mirror-angle')).every(q=>q.lessonId.endsWith('-2')));
 assert.ok(assessment.items.filter(q=>q.unitId==='l1-physics-light'&&q.familyId.endsWith(':lens-focus')).every(q=>q.lessonId.endsWith('-3')));
});

test('assessment data tables can be persisted without nested arrays and repeat registration is idempotent',()=>{
 function walk(value,parentArray=false){
  if(Array.isArray(value)){assert.equal(parentArray,false,'Firestore nested arrays');value.forEach(x=>walk(x,true));}
  else if(value&&typeof value==='object')Object.values(value).forEach(x=>walk(x,false));
 }
 for(const q of assessment.items){walk(q);assert.ok(q.dataTable.rows.every(row=>!Array.isArray(row)&&row.cells.length===3));}
 const beforeCount=bank.items.length;
 assert.equal(bank.registerItems(assessment.items),0);
 assert.equal(bank.items.length,beforeCount);
 assert.equal(data.registerUnits(practice.units),0);
});

test('browser script loading and Node exports register identical new physical content',()=>{
 const context={console};context.window=context;context.globalThis=context;vm.createContext(context);
 for(const name of ['ScienceData.js','ScienceMockPhysical.js','ScienceMockData.js','SciencePhysicalExpansion.js','ScienceMockPhysicalExpansion.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,name),'utf8'),context,{filename:name});
 assert.equal(JSON.stringify(context.SciencePhysicalExpansion.units),JSON.stringify(practice.units));
 assert.equal(JSON.stringify(context.ScienceMockPhysicalExpansion.items),JSON.stringify(assessment.items));
 for(const unit of practice.units)assert.equal(context.ScienceMockData.items.filter(q=>q.unitId===unit.id).length,60);
});


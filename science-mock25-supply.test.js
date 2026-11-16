'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const files=['ScienceData.js','ScienceLifeEarthExpansion.js','SciencePhysicalExpansion.js','ScienceMockPhysical.js','ScienceMockData.js','ScienceMockLifeEarthExpansion.js','ScienceMockPhysicalExpansion.js'];
function prepared(){const c=vm.createContext({console});c.window=c;for(const f of files)vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),c,{filename:f});return c;}
test('32 units gain 15 new authored questions and support 75 unique science selections',()=>{
 const c=prepared(),base=[...c.ScienceMockData.items],knownIds=new Set(base.map(q=>q.id)),knownPrints=new Set(base.map(q=>q.fingerprint));
 const script=fs.readFileSync(__dirname+'/ScienceMock25Expansion.js','utf8');vm.runInContext(script,c,{filename:'ScienceMock25Expansion.js'});
 const additions=c.ScienceMock25Expansion.items;assert.equal(c.ScienceData.units.length,32);assert.equal(additions.length,480);
 const ids=new Set(),prints=new Set(),questionKeys=new Set();let maxItemBytes=0,max25Bytes=0;
 for(const q of additions){
  const unit=c.ScienceData.units.find(u=>u.id===q.unitId);assert(unit);assert.equal(q.levelId,'level1');assert.equal(q.domainId,unit.domainId);assert(unit.lessons.some(l=>l.id===q.lessonId));
  assert(!knownIds.has(q.id));assert(!ids.has(q.id));ids.add(q.id);assert(!knownPrints.has(q.fingerprint));assert(!prints.has(q.fingerprint));prints.add(q.fingerprint);
  const questionKey=q.unitId+'|'+q.question;assert(!questionKeys.has(questionKey));questionKeys.add(questionKey);
  assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.equal(q.choices.filter(x=>x===q.answer).length,1);assert.equal(q.choices[q.answerIndex],q.answer);assert.equal(q.correctAnswer,q.answer);
  for(const field of ['question','explanation','lessonId','familyId','conceptId','passageId','givens','fingerprint'])assert(q[field],q.id+':'+field);
  assert(q.sourceRefs.length);assert.equal(q.context.unitId,q.unitId);assert(q.passageLines.length>=3);assert(q.dataTable.rows.length>=3);
  assert(q.dataTable.rows.every(row=>!Array.isArray(row)&&Array.isArray(row.cells)&&row.cells.every(cell=>typeof cell==='string')));
  if(q.unitId==='l1-earth-motion'||q.unitId==='l1-earth-moon-seasons')assert(q.givens.includes('실제 비례가 아닙니다'));
  maxItemBytes=Math.max(maxItemBytes,Buffer.byteLength(JSON.stringify(q),'utf8'));
 }
 for(const unit of c.ScienceData.units){
  const extra=additions.filter(q=>q.unitId===unit.id),pool=c.ScienceMockData.items.filter(q=>q.unitId===unit.id);assert.equal(extra.length,15);assert.equal(pool.length,75);assert.equal(new Set(extra.map(q=>q.familyId)).size,3);
  for(const family of new Set(extra.map(q=>q.familyId)))assert.equal(new Set(extra.filter(q=>q.familyId===family).map(q=>q.skill)).size,5);
  const seen=new Set();for(let attempt=0;attempt<3;attempt++){
   const selection=pool.slice(attempt*25,(attempt+1)*25);assert.equal(selection.length,25);
   for(const q of selection){assert(!seen.has(q.fingerprint));seen.add(q.fingerprint);}
   max25Bytes=Math.max(max25Bytes,Buffer.byteLength(JSON.stringify(selection),'utf8'));
  }assert.equal(seen.size,75);
 }
 assert(maxItemBytes<5*1024);assert(max25Bytes<125*1024);
 const before=c.ScienceMockData.items.length;vm.runInContext(script,c);assert.equal(c.ScienceMockData.items.length,before,'reloading the extension must be idempotent');
 console.log(JSON.stringify({units:32,newItems:additions.length,totalItems:before,maxItemBytes,max25Bytes}));
});


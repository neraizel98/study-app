const fs=require('node:fs'),assert=require('node:assert/strict'),rows=require('./tests/helpers/content-audit-source.cjs')();
const audit=JSON.parse(fs.readFileSync('tests/helpers/content-audit.json','utf8')),map=new Map(audit.map(r=>[r.id,r]));
assert.equal(map.size,audit.length);assert.equal(audit.length,rows.length);
let reviewed=0;
for(const q of rows){
 const a=map.get(q.id);assert(a,`${q.id}: missing audit entry`);
 assert.equal(a.hash,q.hash,`${q.id}: changed content must be re-reviewed with refresh-content-audit`);
 assert(q.lines?.length&&q.question&&q.choices.length>=2&&q.answer,`${q.id}: missing context`);
 assert.equal(new Set(q.choices).size,q.choices.length,`${q.id}: duplicate choices`);
 assert.equal(q.choices.filter(x=>x===q.answer).length,1,`${q.id}: answer must identify exactly one option`);
 if(Array.isArray(q.evidence))assert(q.evidence.every(i=>Number.isInteger(i)&&i>=0&&i<q.lines.length),`${q.id}: evidence outside passage`);
 assert(['unreviewed','pass','revise','quarantine'].includes(a.semanticStatus));
 if(a.semanticStatus==='pass'){
  reviewed++;assert(a.rationale&&a.evidenceLines?.length,`${q.id}: approval needs rationale`);
  assert(a.evidenceLines.every(i=>i>=1&&i<=q.lines.length));
  assert.equal(a.distractors?.length,q.choices.length-1);
  for(const d of a.distractors)assert(q.choices.includes(d.choice)&&d.choice!==q.answer&&d.reason);
 }
}
console.log(`Content inventory: ${rows.length} structural checks; ${reviewed} manually reviewed, ${rows.length-reviewed} not semantically certified.`);

const {test}=require('node:test'),assert=require('node:assert/strict');
const {setup}=require('./tests/helpers/mock-transfer-fixture.cjs');
test('three same-day real-curriculum mocks contain 165 distinct questions and archive all rounds',()=>{
 const s=setup(),api=s.c.SmartStudy.MockExam,seen=new Set(),drafts=[];
 for(let round=1;round<=3;round++){
  const at=s.now+(round-1)*10000,b=s.api.build('learner',at,{attemptNo:round});assert(b.complete,`round ${round}: ${JSON.stringify(b.shortages)}`);assert.equal(b.items.length,55);assert(api.validateBank(b));
  for(const q of b.items){assert(!seen.has(q.fingerprint),`repeated ${q.question}`);seen.add(q.fingerprint);assert(s.api.grade(q,q.answer).correct,q.question);}
  let d=api.create('learner',b,at,{retake:round>1});
  for(let section=0;section<4;section++){const active=d.sections.find(s=>s.state==='active');d=api.finishSection('learner',d.assessmentId,at+section+1,active.id);if(d.break&&!d.break.endedAt)d=api.skipBreak('learner',d.assessmentId,at+section+1);}
  drafts.push(JSON.stringify(d));s.reports.push(...JSON.parse(JSON.stringify(api.reportsFor(d))));
 }
 assert.equal(seen.size,165);assert.equal(api.list('learner',api.weekId(s.now)).length,3);
 for(const json of drafts){const d=JSON.parse(json);assert.equal(JSON.stringify(api.getById('learner',d.assessmentId)),json);}
});
test('new retake reading content has complete evidence and four unique choices per question',()=>{
 const s=setup(),pool=s.c.MockRetakeReading;
 assert.equal(pool.korean.length,24);assert.equal(pool.english.length,14);
 assert.equal(pool.korean.flatMap(p=>p.questions).length,192);assert.equal(pool.english.flatMap(p=>p.questions).length,98);
 for(const passages of [pool.korean,pool.english]){const qs=passages.flatMap(p=>p.questions),long=qs.filter(q=>q.answer.length>Math.max(...q.choices.filter(c=>c!==q.answer).map(c=>c.length))).length,short=qs.filter(q=>q.answer.length<Math.min(...q.choices.filter(c=>c!==q.answer).map(c=>c.length))).length;assert(long/qs.length<=.4,'longest option cue');assert(short/qs.length<=.4,'shortest option cue');}
 const ids=new Set();
 for(const p of [...pool.korean,...pool.english]){assert(!ids.has(p.id));ids.add(p.id);for(const q of p.questions){assert(!ids.has(q.id));ids.add(q.id);assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert(s.api.grade(q,q.answer).correct,q.id);assert(q.evidenceLines.length&&q.evidenceLines.every(n=>Number.isInteger(n)&&n>=0&&n<p.lines.length),q.id);}}
});

const {test}=require('node:test'),assert=require('node:assert/strict');
const {setup}=require('./tests/helpers/mock-transfer-fixture.cjs');
const DAY=86400000;
function fiveDays(s){
 const original=JSON.parse(JSON.stringify(s.reports));s.reports.length=0;
 for(let day=0;day<5;day++)for(const r of original)s.reports.push({...r,sessionId:r.sessionId+'-day'+day,date:s.now-(6-day)*DAY});
}
test('five study days still start when only one math and formula template family is available',()=>{
 const s=setup();fiveDays(s);
 const math=s.c.MockMathTransfer.create,formula=s.c.MockMathTransfer.createFormula;
 s.c.MockMathTransfer.create=(g,rng)=>math(g,rng).filter(q=>q.templateFamily==='circle-area-cost-limit');
 s.c.MockMathTransfer.createFormula=(g,rng)=>formula(g,rng).filter(q=>q.templateFamily==='formula-quantity-conditions');
 // Reading with enough valid questions but below the old reasoning quota must not lock the pupil out.
 for(const p of s.c.MockKoreanTransfer)for(const q of p.questions)q.cognitiveDemand='application';
 const b=s.api.build('learner',s.now);
 assert.equal(b.items.length,55,JSON.stringify(b.shortages));assert(b.complete);assert(s.c.SmartStudy.MockExam.validateBank(b));
 assert.equal(b.quality.complete,false);assert.equal(b.qualityAdvisory,true);
 assert.equal(b.items.filter(q=>q.subject==='math').length,12);assert.equal(b.items.filter(q=>q.subject==='math_formula').length,3);
 assert.equal(new Set(b.items.map(q=>q.fingerprint)).size,55);assert(b.items.every(q=>!q.repeated));
});
test('a new formula subject studied for one day gets a smaller share than five-day mathematics',()=>{
 const s=setup();fiveDays(s);const formulas=s.reports.filter(r=>r.metadata.source==='math-formula');
 for(let i=s.reports.length-1;i>=0;i--)if(s.reports[i].metadata.source==='math-formula')s.reports.splice(i,1);
 s.reports.push(formulas.at(-1));
 const b=s.api.build('learner',s.now);assert(b.complete,JSON.stringify(b.shortages));
 assert.equal(b.weeklyCoverage.math.days,5);assert.equal(b.weeklyCoverage.math_formula.days,1);
 assert.equal(b.quotas.math_formula,1);assert.equal(b.quotas.math,14);
 const api=s.c.SmartStudy.MockExam,d=api.create('learner',b,s.now);assert.equal(d.quotas.math_formula,1);
 let finished=d;for(let i=0;i<4;i++){const active=finished.sections.find(x=>x.state==='active');if(active)finished=api.finishSection('learner',d.scheduledWeekId,s.now+100+i,active.id);if(finished.break&&!finished.break.endedAt)finished=api.skipBreak('learner',d.scheduledWeekId,s.now+100+i);}
 const report=api.reportsFor(finished).find(r=>r.metadata.assessmentSubject==='math_formula');assert.equal(report.totalQuestions,1);assert.equal(report.metadata.requestedCount,1);
});
test('an unstudied new English component does not prevent an English exam from learned components',()=>{
 const s=setup();fiveDays(s);for(let i=s.reports.length-1;i>=0;i--)if(s.reports[i].subject==='grammar')s.reports.splice(i,1);
 const b=s.api.build('learner',s.now);assert(b.complete,JSON.stringify(b.shortages));assert.equal(b.quotas.grammar,0);
 assert.equal(b.quotas.english+b.quotas.english_reading,15);assert(s.c.SmartStudy.MockExam.validateBank(b));
 assert(!b.items.some(q=>q.subject==='grammar'));
});

test('unseen numeric supplementation stays within learned generators and is not falsely counted as reasoning',()=>{
 const s=setup();fiveDays(s);s.c.MockMathTransfer.create=()=>[];
 const b=s.api.build('learner',s.now);assert(b.complete,JSON.stringify(b.shortages));
 const math=b.items.filter(q=>q.subject==='math');assert.equal(math.length,12);
 const allowed=new Set(['circle_area_basic','circle_circumference','circle_reverse_radius','circle_diameter_from_circumference']);
 assert(math.every(q=>allowed.has(q.generator)&&q.noveltyKind==='numeric-variation'&&q.cognitiveDemand==='recall'));
 for(const q of math)assert(s.api.grade(q,q.answer).correct);
 s.reports.push({subject:'math',sessionId:'older-exposure',date:s.now-100*DAY,totalQuestions:1,metadata:{review:true,initialAttempts:[{question:math[0].question,correctAnswer:math[0].answer,correct:true}]}});
 const next=s.api.build('learner',s.now);assert(next.complete);assert(!next.items.some(q=>q.fingerprint===math[0].fingerprint));
});
test('publication rules accept only the four to eight nonempty component reports',()=>{
 const fs=require('node:fs'),rules=fs.readFileSync('firestore.rules','utf8');
 assert(rules.includes('payload.reports.size() >= 4'));assert(rules.includes('payload.reports.size() <= 8'));
 assert(rules.includes('payload.questions.size() == 55'));assert(rules.includes('payload.initialAttempts.size() == 55'));
});

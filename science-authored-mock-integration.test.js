const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {setup}=require('./tests/helpers/mock-transfer-fixture.cjs');
const now=Date.parse('2026-11-13T10:00:00+09:00');
const load=(s,f)=>vm.runInContext(fs.readFileSync(f,'utf8'),s.c,{filename:f});
function prepared(){const s=setup(now);for(const f of ['ScienceData.js','science-policy.js','ScienceMockPhysical.js','ScienceMockData.js','MockKoreanReadingG7More.js','MockEnglishReadingMiddle1More.js','mock-paper.js','omr-layout.js'])load(s,f);const byId=new Map([...s.c.ScienceMockData.items,...s.c.ScienceMockPhysical.items].map(q=>[q.id,q]));s.c.ScienceMockData.items=[...byId.values()];return s;}
function addScience(s,unit){s.reports.push({userId:'learner',subject:'science',sessionId:'real-science-'+unit.id,date:now,totalQuestions:10,initialScore:8,isCompleted:false,metadata:{source:'science',levelId:unit.levelId,unitId:unit.id,domainId:unit.domainId,submittedAt:now,initialAttempts:unit.questions.slice(0,10).map((q,i)=>({questionId:q.id,question:q.question,correctAnswer:q.correctAnswer,correct:i<8,round:1}))}});}
test('actual authored units support three science20 rounds and source materials survive paper/OMR/result snapshots',()=>{
 const initial=prepared(),available=initial.c.ScienceData.units.filter(u=>initial.c.ScienceMockData.items.filter(q=>q.unitId===u.id).length>=60),sizes=[];assert(available.length>=6,'at least six completed authored units including physical240 must be available');
 for(const unit of available){const s=prepared();addScience(s,unit);const history=[],seen=new Set();for(let attemptNo=1;attemptNo<=3;attemptNo++){
  const b=s.api.build('learner',now,{attemptNo,history}),science=b.items.filter(q=>q.subject==='science');assert.equal(b.complete,true,JSON.stringify(b.shortages));assert.equal(s.c.SmartStudy.MockExam.validateBank(b),true);assert.equal(b.items.length,75);assert.equal(science.length,20);for(const q of science){assert.equal(q.unitId,unit.id);assert(!seen.has(q.fingerprint));seen.add(q.fingerprint);assert(q.passageLines.length>=4);assert(q.givens);assert(q.dataTable.rows.length>=2);}
  const families=new Set(science.map(q=>q.familyId));assert(families.size>=10,'prefer diverse scientific situations');
  history.push({userId:'learner',startedAt:now,questions:b.items});
  if(attemptNo===1){const api=s.c.SmartStudy.MockExam,p={examVersion:b.examVersion,assessmentId:'mock:learner:2026-11-09:attempt-1-paper-real',userId:'learner',scheduledWeekId:'2026-11-09',attemptNo:1,kind:'mock',mode:'paper',status:'paper',questions:b.items,quotas:b.quotas,sections:api.contract(b).definitions.map(d=>({...d,durationSeconds:d.minutes*60,state:'pending'})),startedAt:now,paper:{timeLimits:{}}},result=api.paperResult(p,Object.fromEntries(p.questions.map(q=>[q.id,q.answer])),now+1);
   const bytes=Buffer.byteLength(JSON.stringify(result),'utf8');sizes.push({unit:unit.id,bytes});assert(bytes<800*1024,'leave document/index overhead below the Firestore1MiB ceiling: '+bytes);assert.equal(result.initialAttempts.length,75);assert.equal(result.reports.find(r=>r.subject==='science').totalQuestions,20);assert(api.hydrateSnapshot(result).initialAttempts.filter(a=>a.subject==='science').every(a=>a.givens&&a.passageText.length));assert.equal(s.c.OmrLayout.build({items:b.items}).areas.length,5);
  }
 }assert.equal(seen.size,60,unit.id);}
 console.log('Actual science units:',available.length,'max submitted JSON bytes:',Math.max(...sizes.map(x=>x.bytes)),JSON.stringify(sizes));
});

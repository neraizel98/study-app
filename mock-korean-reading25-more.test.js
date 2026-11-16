const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {setup}=require('./tests/helpers/mock-transfer-fixture.cjs');
const FILE='MockKoreanReading25More.js',NOW=Date.parse('2026-11-13T10:00:00+09:00');
const load=(c,file)=>vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
test('ten authored passages provide80 unique, self-contained, evidence-linked items',()=>{
 const c={};c.window=c;vm.createContext(c);load(c,FILE);load(c,'mock-exam-quality.js');
 assert.equal(c.MockKoreanTransfer.length,10);const ids=new Set(),contents=new Set();
 for(let grade=8;grade<=12;grade++)assert.equal(c.MockKoreanTransfer.filter(p=>p.grade===grade).length,2);
 for(const p of c.MockKoreanTransfer){
  assert.equal(p.lines.length,4);assert(p.lines.every(l=>l.length>=90));assert.equal(p.questions.length,8);
  assert(new Set(p.questions.map(q=>q.skill)).size>=5);assert(p.questions.filter(q=>q.cognitiveDemand==='reasoning').length>=3);
  for(const q of p.questions){
   assert(!ids.has(q.id));ids.add(q.id);const fp=[p.lines.join('\n'),q.question,q.answer].join('|');assert(!contents.has(fp));contents.add(fp);
   assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.equal(q.choices.filter(v=>v===q.answer).length,1);
   assert(q.evidenceLines.length>0);assert(q.evidenceLines.every(n=>Number.isInteger(n)&&n>=0&&n<p.lines.length));
   const result=c.MockExamQuality.validateItem({...q,subject:'reading',passageId:p.id,passageTitle:p.title,passageLines:p.lines});assert(result.ok,`${q.id}: ${result.errors}`);
  }
 }
 assert.equal(ids.size,80);load(c,FILE);assert.equal(c.MockKoreanTransfer.length,10,'loading twice never duplicates');
});
test('grades8 through12 each support3 full reading25 rounds without Korean vocabulary evidence',()=>{
 for(let grade=8;grade<=12;grade++){
  const s=setup(NOW,{examVersion:'classic100-v1'});for(const f of ['MockKoreanReadingG7More.js','MockKoreanReading25More.js','MockEnglishReadingMiddle1More.js'])load(s.c,f);
  const sources=s.c.ReadingPassages.filter(p=>p.grade===grade).slice(0,3);assert(sources.length);
  for(let i=s.reports.length-1;i>=0;i--)if(s.reports[i].subject==='reading'||s.reports[i].subject==='korean_vocab')s.reports.splice(i,1);
  for(const p of sources)s.reports.push({userId:'learner',subject:'reading',sessionId:'reading25-'+p.id,date:NOW-86400000,totalQuestions:p.questions.length,metadata:{levelId:p.levelId,unitId:p.unitId,passageId:p.id,grade,initialAttempts:p.questions.map(q=>({questionId:q.id,question:q.question,correctAnswer:q.answer,skill:q.skill,passageId:p.id,correct:true}))}});
  const history=[],seen=new Set();for(let attemptNo=1;attemptNo<=3;attemptNo++){
   const bank=s.api.build('learner',NOW,{attemptNo,history});assert(bank.complete,`grade${grade} round${attemptNo}: ${JSON.stringify(bank.shortages)}`);assert(s.c.SmartStudy.MockExam.validateBank(bank));
   const reading=bank.items.filter(q=>q.subject==='reading');assert.equal(reading.length,25);assert.equal(bank.quotas.korean_vocab,0);
   for(const q of reading){assert(!seen.has(q.fingerprint),q.id);seen.add(q.fingerprint);assert.equal(s.c.KoreanReadingCurriculum.gradeOfUnit(q.context.unitId),grade);}
   history.push({userId:'learner',startedAt:NOW,questions:bank.items});
  }assert.equal(seen.size,75);
 }
});

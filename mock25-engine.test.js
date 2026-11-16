const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const NOW=Date.parse('2026-11-16T01:00:00Z');
function setup(version){
 const values=new Map(),reports=[];
 const local={getActiveUser:()=> 'learner',getPreference:(k,d)=>values.has(k)?structuredClone(values.get(k)):d,setPreference:(k,v)=>values.set(k,structuredClone(v)),keys:()=>[...values.keys()],listReports:()=>reports,saveReports:(_,r)=>reports.splice(0,reports.length,...r)};
 const c={SmartStudy:{LocalRepository:local,MockExamBank:{grade:(q,r)=>({correct:q.answer===r,answer:q.answer})}},Date,console,setTimeout,clearTimeout};c.window=c;
 vm.runInNewContext(fs.readFileSync('mock-exam.js','utf8'),c);
 const api=c.SmartStudy.MockExam,expanded=['classic100-v1','science125-v1'].includes(version),science=['science75-v1','science125-v1'].includes(version);
 const quotas=expanded?{reading:18,korean_vocab:7,english:9,grammar:8,english_reading:8,math:20,math_formula:5,hanja:25}:{...api.areas};if(science)quotas.science=expanded?25:20;
 const items=Object.entries(quotas).flatMap(([subject,n])=>Array.from({length:n},(_,i)=>({id:`${subject}:${i}`,subject,kind:'choice',question:`${subject} ${i}`,choices:['A','B','C','D'],answer:'A',explanation:'explanation',passageLines:['source '.repeat(250)],givens:'source '.repeat(250),dataTable:{headers:['x'],rows:[['1']]},sourceRefs:['source'],levelId:'level1',unitId:'unit',context:{levelId:'level1',unitId:'unit'}})));
 const bank={examVersion:version,complete:true,policyId:'weekly-transfer-20261024',quotas,items};return {api,bank,local};
}
for(const [version,total,minutes] of [['classic100-v1',100,[35,35,35,25]],['science125-v1',125,[35,35,35,25,35]],['legacy55-v1',55,[20,20,20,10]],['science75-v1',75,[20,20,20,10,25]]]){
 test(`${version}: create, immutable timers, submission, paper scoring, restore`,()=>{
  const {api,bank}=setup(version);assert.equal(api.validateBank(bank),true);
  const d=api.create('learner',bank,NOW,{sectionMinutes:{reading:5,science:5}});
  const expected=version==='legacy55-v1'?[5,20,20,10]:minutes;
  assert.deepEqual(Array.from(d.sections,s=>s.durationSeconds/60),expected);assert.equal(d.questions.length,total);
  assert.equal(api.get('learner',d.assessmentId).sections[0].deadline,d.sections[0].deadline);
  const bad=structuredClone(bank);bad.items[0].subject='hanja';assert.equal(api.validateBank(bad),false);
  const submitted=api.reconcile('learner',d.assessmentId,NOW+250*60000),snapshot=api.submissionSnapshot(submitted);
  assert.equal(snapshot.initialAttempts.length,total);assert.equal(api.validSnapshot(snapshot),true);
  const paper={...d,status:'paper',mode:'paper',generatedAt:NOW,paper:{timeLimits:{}}};delete paper.submittedAt;
  const scored=api.paperResult(paper,Object.fromEntries(paper.questions.map(q=>[q.id,'A'])),NOW+1);
  assert.equal(scored.initialAttempts.length,total);assert(scored.initialAttempts.every(a=>a.correct));
  assert.deepEqual(Array.from(scored.sections,s=>s.durationSeconds/60),minutes);
  const target=setup(version);target.api.restore('learner',[{learnerId:'learner',payload:scored,published:true}]);
  assert.equal(target.api.getById('learner',d.assessmentId).questions.length,total);
  if(version==='science125-v1'){
   assert.equal(scored.sourceSnapshotVersion,'questions-v1');assert.equal(scored.initialAttempts[0].givens,undefined);
   assert(api.hydrateSnapshot(scored).initialAttempts.every(a=>a.givens&&a.passageText.length));
   assert(Buffer.byteLength(JSON.stringify(scored))<800*1024);
   const malformed=structuredClone(scored);malformed.sections[0].durationSeconds=1200;assert.equal(api.validSnapshot(malformed),false);
  }
 });
}
test('unversioned saved legacy paper keeps 55 questions and supplied time limits',()=>{
 const {api,bank}=setup('legacy55-v1');delete bank.examVersion;
 const d=api.create('learner',bank,NOW,{sectionMinutes:{reading:27}});assert.equal(d.examVersion,'legacy55-v1');assert.equal(d.questions.length,55);assert.equal(d.sections[0].durationSeconds,27*60);
 const p={...d,status:'paper',mode:'paper',paper:{timeLimits:{reading:27}}};delete p.examVersion;assert.equal(api.paperTimeLimits(p).reading,27);
});
test('new contracts accept evidence-based component quotas and reject wrong subject totals',()=>{
 for(const version of ['classic100-v1','science125-v1'])for(const [reading,vocab,english,grammar,engReading,math,formula] of [[25,0,25,0,0,25,0],[13,12,0,10,15,10,15],[18,7,8,8,9,20,5]]){
  const {api,bank}=setup(version),quota={reading,korean_vocab:vocab,english,grammar,english_reading:engReading,math,math_formula:formula,hanja:25};if(version==='science125-v1')quota.science=25;
  bank.items=Object.entries(quota).flatMap(([subject,n])=>Array.from({length:n},(_,i)=>({...bank.items[0],id:`${subject}:${i}`,subject})));bank.quotas=quota;
  assert.equal(api.validateBank(bank),true,JSON.stringify(quota));
  bank.quotas={...quota,english:english+1};assert.equal(api.validateBank(bank),false);
 }
});

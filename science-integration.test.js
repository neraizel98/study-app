const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {setup}=require('./tests/helpers/mock-transfer-fixture.cjs');
const DAY=86400000;
function science(s,unit='l1-physics-heat',days=1){for(let i=0;i<days;i++)s.reports.push({userId:'learner',sessionId:`sci-${unit}-${i}`,subject:'science',date:s.now-i*DAY,totalQuestions:10,initialScore:7,isCompleted:false,metadata:{source:'science',levelId:'level1',unitId:unit,domainId:'physics',initialAttempts:Array.from({length:10},(_,j)=>({questionId:`practice-${j}`,question:`practice ${j}`,correct:j<7,round:1}))}});}
function bank(s,units=['l1-physics-heat']){s.c.ScienceMockData={items:units.flatMap(unitId=>Array.from({length:60},(_,i)=>({id:`${unitId}:${i}`,unitId,levelId:'level1',domainId:'physics',question:`시험 전용 상황 ${unitId} ${i}`,givens:`조건 ${i}`,choices:['A','B','C','D'],answer:'A',explanation:'설명'})))};}
function load(s,file){vm.runInContext(fs.readFileSync(file,'utf8'),s.c,{filename:file});}
test('science eligibility rejects prediction/draft/9 answers/review/hints/foreign learner and preserves no-science55',()=>{
 const s=setup();bank(s);assert.equal(s.api.build('learner',s.now).examVersion,'legacy55-v1');science(s);const good=s.reports.at(-1);assert.equal(s.api.scienceEvidence(s.reports,'learner',s.now).length,1);
 for(const mutate of [r=>r.totalQuestions=9,r=>r.metadata.initialAttempts.pop(),r=>r.metadata.review=true,r=>r.metadata.hintUsed=true,r=>r.metadata.status='draft',r=>r.userId='other',r=>r.metadata.initialAttempts[0].correct=null,r=>r.date-=8*DAY]){const r=structuredClone(good);mutate(r);assert.equal(s.api.scienceEvidence([r],'learner',s.now).length,0);}
});
test('1/2/5 days retain 75, exact section/time snapshot, immutable legacy55, and 3 nonoverlapping science rounds',()=>{
 for(const days of [1,2,5]){const s=setup(Date.parse('2026-11-13T10:00:00+09:00'));bank(s);const old=s.c.SmartStudy.MockExam.create('learner',s.api.build('learner',s.now),s.now-7*DAY,{scheduledWeekId:'2026-11-02'});science(s,undefined,days);assert.equal(s.c.SmartStudy.MockExam.get('learner','2026-11-02').questions.length,55);for(const file of ['MockKoreanReadingG7More.js','MockEnglishReadingMiddle1More.js'])load(s,file);const history=[],seen=new Set();
  for(let attemptNo=1;attemptNo<=3;attemptNo++){const b=s.api.build('learner',s.now,{attemptNo,history}),scienceItems=b.items.filter(q=>q.subject==='science');assert.equal(b.examVersion,'science75-v1');assert.equal(b.items.length,75);assert.equal(scienceItems.length,20);assert.equal(s.c.SmartStudy.MockExam.validateBank(b),true);for(const q of scienceItems){assert(!seen.has(q.fingerprint));seen.add(q.fingerprint);}history.push({userId:'learner',startedAt:s.now,questions:b.items});
   if(attemptNo===1){const d=s.c.SmartStudy.MockExam.create('learner',b,s.now,{scheduledWeekId:'2026-11-16',sectionMinutes:{reading:55}});assert.equal(d.examVersion,'science75-v1');assert.equal(d.sections.length,5);assert.equal(d.sections.reduce((n,x)=>n+x.durationSeconds,0),95*60);assert.equal(d.scopeCompleteness.required,75);b.items[0].question='changed';assert.notEqual(s.c.SmartStudy.MockExam.get('learner','2026-11-16').questions[0].question,'changed');}
  }assert.equal(seen.size,60);assert.equal(old.examVersion,'legacy55-v1');
 }
});
test('scope allocation follows learned units only, deduplicates session evidence, and shortage never shrinks to55',()=>{
 const s=setup(Date.parse('2026-11-13T10:00:00+09:00'));bank(s,['l1-physics-heat','l1-earth-motion']);science(s,'l1-physics-heat',1);science(s,'l1-earth-motion',2);s.reports.push(structuredClone(s.reports.at(-1)));
 const b=s.api.build('learner',s.now);assert.equal(b.quotas.science,20);assert.deepEqual(JSON.parse(JSON.stringify(b.scienceAllocation)),[{unitId:'l1-physics-heat',count:7},{unitId:'l1-earth-motion',count:13}]);
 s.c.ScienceMockData.items=s.c.ScienceMockData.items.filter(q=>q.unitId!=='l1-physics-heat');const short=s.api.build('learner',s.now);assert.equal(short.examVersion,'science75-v1');assert.equal(short.complete,false);assert(short.shortages['science:l1-physics-heat']);
});
test('75 paper, OMR, first-score result, restore and publication gate use saved version',()=>{
 const s=setup(Date.parse('2026-11-13T10:00:00+09:00'));bank(s);science(s);load(s,'mock-paper.js');load(s,'omr-layout.js');const b=s.api.build('learner',s.now),api=s.c.SmartStudy.MockExam;
 const p={examVersion:'science75-v1',assessmentId:'mock:learner:2026-11-09:attempt-1-paper-test',userId:'learner',scheduledWeekId:'2026-11-09',attemptNo:1,kind:'mock',mode:'paper',status:'paper',questions:b.items,sections:api.contract(b).definitions.map(s=>({...s,durationSeconds:s.minutes*60,state:'pending'})),quotas:b.quotas,startedAt:s.now,paper:{timeLimits:{}}};
 const set={examVersion:p.examVersion,items:p.questions},areas=s.c.MockPaper.areas(set.items);assert.equal(areas.length,5);assert.equal(areas.at(-1).questions.length,20);assert.equal(s.c.OmrLayout.build(set).areas.length,5);
 const r=api.paperResult(p,Object.fromEntries(p.questions.map(q=>[q.id,q.answer])),s.now+1000);assert.equal(r.initialAttempts.length,75);assert.equal(r.sections.length,5);assert.equal(r.reports.find(x=>x.subject==='science').initialScore,20);assert.equal(r.resultVisibility,'withheld');assert.equal(r.reports.find(x=>x.subject==='science').metadata.examVersion,'science75-v1');s.c.SmartStudy.LocalRepository.saveReports=()=>{};api.restore('learner',[{payload:r,published:false}]);assert.equal(api.getById('learner',p.assessmentId).questions.length,75);
 const missingVersion=structuredClone(r);delete missingVersion.examVersion;assert.equal(api.validSnapshot(missingVersion),false);const bad=structuredClone(r);bad.sections[4].id='hanja';assert.equal(api.validSnapshot(bad),false);
});

test('online75 advances through five saved sections, retains first answers and immutable denominator',()=>{
 const s=setup(Date.parse('2026-11-13T10:00:00+09:00'));bank(s);science(s);const api=s.c.SmartStudy.MockExam,d=api.create('learner',s.api.build('learner',s.now),s.now);assert.equal(d.quotas.science,20);let now=s.now;
 for(let i=0;i<5;i++){let current=api.get('learner',d.assessmentId);const section=current.sections.find(s=>s.state==='active');assert.equal(section.id,['reading','english','math','hanja','science'][i]);for(const q of api.questionsFor(current,section))api.answer('learner',d.assessmentId,q.id,q.answer,++now);api.finishSection('learner',d.assessmentId,++now,section.id);if(i===1)api.skipBreak('learner',d.assessmentId,++now);}
 const done=api.submissionSnapshot(api.get('learner',d.assessmentId));assert.equal(done.questions.length,75);assert.equal(done.initialAttempts.length,75);assert.equal(done.initialAttempts.filter(a=>a.correct).length,75);assert.equal(done.resultVisibility,'withheld');const id=done.questions[0].id;api.answer('learner',d.assessmentId,id,'B',++now);assert.equal(api.get('learner',d.assessmentId).responses[id],done.responses[id]);
});

const {test}=require('node:test'),assert=require('node:assert/strict');
const {setup}=require('./tests/helpers/mock-transfer-fixture.cjs');
test('current Korean course and all eight subjects produce a quality-gated unseen 55-question mock',()=>{
 const s=setup(),before=JSON.stringify(s.reports),b=s.api.build('learner',s.now);
 assert.equal(b.complete,true,JSON.stringify({short:b.shortages,quality:b.quality}));assert.equal(b.items.length,55);
 assert.equal(b.policyId,'weekly-transfer-20261024');assert.equal(b.reexposureCount,0);assert.equal(b.repeatPolicy,'all-stored-history');
 assert.equal(s.c.SmartStudy.MockExam.validateBank(b),true);
 for(const q of b.items){assert.equal(s.api.grade(q,q.answer).correct,true,q.question);assert(q.evidenceReportIds.length);assert(!q.repeated);}
 for(const row of Object.values(b.quality.summary)){assert(row.application>=row.applicationRequired);assert(row.reasoning>=row.reasoningRequired);}
 assert(b.items.filter(q=>q.subject==='reading').every(q=>q.passageId.startsWith('mock-kr-g7-')));
 assert.equal(new Set(b.items.filter(q=>q.subject==='english_reading').map(q=>q.passageId)).size,1,'keep one English text unused for a later exam');
 assert.equal(JSON.stringify(s.reports),before);
});
test('all past daily and mock records exclude same content even beyond fourteen days and with different IDs',()=>{
 const s=setup(),first=s.api.build('learner',s.now),target=first.items.find(q=>q.subject==='english');
 s.reports.push({userId:'learner',subject:'english',sessionId:'months-ago',date:s.now-100*86400000,totalQuestions:1,metadata:{review:true,initialAttempts:[{questionId:'legacy-different-id',question:target.question.toUpperCase().replace(/ /g,'  '),correctAnswer:target.answer,correct:true}]}});
 const next=s.api.build('learner',s.now);assert(!next.items.some(q=>q.fingerprint===target.fingerprint));
});
test('past booklet snapshots exclude exposed passages even if no answer was submitted',()=>{
 const s=setup(),first=s.api.build('learner',s.now),english=first.items.filter(q=>q.subject==='english_reading');
 s.prefs.set('SmartStudy_MockExam_Index_learner',['2026-10-12']);s.prefs.set('SmartStudy_MockExam_learner_2026-10-12',{userId:'learner',startedAt:s.now-15*86400000,questions:english});
 const second=s.api.build('learner',s.now),seen=new Set(english.map(q=>q.passageId));
 assert(second.items.filter(q=>q.subject==='english_reading').every(q=>!seen.has(q.passageId)));
});
test('quality ratio is advisory while repeat and quota validation still protect a full weekly exam',()=>{
 const s=setup(),b=s.api.build('learner',s.now),weak={...b,items:b.items.map(q=>({...q,cognitiveDemand:'recall',noveltyKind:'recall'}))};
 assert.equal(s.c.MockExamQuality.evaluate(weak.items).complete,false);assert.equal(s.c.SmartStudy.MockExam.validateBank(weak),true);assert.equal(s.c.SmartStudy.MockExam.validateBank({...b,items:b.items.map((q,i)=>i? q:{...q,repeated:true})}),false);assert.equal(s.c.SmartStudy.MockExam.validateBank({...b,quotas:{...b.quotas,math:999}}),false);
});
test('an already started exam keeps answers, question IDs and deadlines after a bank update',()=>{
 const s=setup(),b=s.api.build('learner',s.now),api=s.c.SmartStudy.MockExam,draft=api.create('learner',b,s.now),q=draft.questions[0];
 api.answer('learner',draft.scheduledWeekId,q.id,q.answer,s.now+1);const saved=api.get('learner',draft.scheduledWeekId);
 const resumed=api.create('learner',{...b,complete:false,version:'different',items:[]},s.now+100);
 assert.equal(JSON.stringify(resumed.questions),JSON.stringify(saved.questions));assert.equal(JSON.stringify(resumed.responses),JSON.stringify(saved.responses));assert.equal(resumed.sections[0].deadline,saved.sections[0].deadline);
});
test('all authored transfer choices and evidence indices are valid, without a systematic longest-answer cue',()=>{
 const s=setup();
 for(const [name,passageCount,questionCount] of [['MockKoreanTransfer',12,96],['MockEnglishTransfer',14,98]]){
  const passages=s.c[name],questions=passages.flatMap(p=>p.questions);assert.equal(passages.length,passageCount);assert.equal(questions.length,questionCount);
  for(const p of passages)for(const q of p.questions){assert.equal(s.api.grade(q,q.answer).correct,true,q.id);assert(q.evidenceLines.length&&q.evidenceLines.every(i=>Number.isInteger(i)&&i>=0&&i<p.lines.length));}
  const longest=questions.filter(q=>q.answer.length>Math.max(...q.choices.filter(c=>c!==q.answer).map(c=>c.length))).length;
  const shortest=questions.filter(q=>q.answer.length<Math.min(...q.choices.filter(c=>c!==q.answer).map(c=>c.length))).length;assert(shortest/questions.length<=.4,`${name}: shortest ${shortest}/${questions.length}`);
  assert(longest/questions.length<=.4,`${name}: longest ${longest}/${questions.length}`);
 }
 assert.equal(s.c.MockGrammarTransfer.length,184);
 for(const q of s.c.MockGrammarTransfer){assert(s.c.EnglishGrammarData[q.stageId]?.units.find(u=>u.id===q.unitId)?.lessons[q.lessonIndex]);assert.equal(s.api.grade(q,q.answer).correct,true,q.id);}
});
test('mathematics has varying answers, honest exact fractions and bounded template repetition',()=>{
 const s=setup(),scope={context:{unitId:'e6-1-u1'},attempts:[{generator:'fraction_div_int_basic',question:'fraction'}]},rows=s.c.MockMathTransfer.create(scope,()=>.5);
 assert(rows.every(q=>s.api.grade(q,q.answer).correct));
 const percentages=s.c.MockMathTransfer.createFormula({context:{unitId:'formula-120'},attempts:[{questionId:'formula-120-guided-calculation'}]},()=>.5);
 assert(new Set(percentages.map(q=>q.answer)).size>=5,'different quantities must not all have answer60');
 const b=s.api.build('learner',s.now),counts=new Map();for(const q of b.items.filter(q=>q.subject==='math'))counts.set(q.templateFamily,(counts.get(q.templateFamily)||0)+1);
 assert([...counts.values()].every(count=>count<=2));
});
test('old symbol-only formula and unknown generator evidence cannot expand to a new calculation skill',()=>{
 const s=setup();assert.equal(s.c.MockMathTransfer.createFormula({context:{unitId:'formula-16'},attempts:[{questionId:'formula-16-formula-recall',question:'직사각형 넓이 공식은?'}]}).length,0);
 assert.equal(s.c.MockMathTransfer.create({context:{},attempts:[{generator:'m1_integer_basic',question:'$|-3|$의 값은?'}]}).length,0);
});

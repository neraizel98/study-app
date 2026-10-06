const assert=require('node:assert/strict'),{test}=require('node:test');
const warmup=require('./english-warmup.js');
const now=Date.now();
function report(id,correct,subject='grammar',extra={}){return {sessionId:id,subject,date:now-1000,totalQuestions:1,metadata:{unitId:'e2',...extra,attempts:[{question:id,choices:['am','is'],correctAnswer:'am',correct,explanation:'I와 am'}]}};}
test('warmup selects two mistakes and one success without changing source records',()=>{
 const reports=[report('wrong1',false),report('wrong2',false),report('right',true)],before=JSON.stringify(reports);
 const state=warmup.build(reports,[],now);assert.equal(state.items.length,3);assert.deepEqual(state.items.map(q=>q.source),['오답 복습','오답 복습','기억 확인']);assert.equal(state.patterns[0].label,'be동사');assert.equal(state.patterns[0].count,2);assert.equal(JSON.stringify(reports),before);
});
test('draft, assessment, hint, review, future and malformed records cannot become review evidence',()=>{
 const reports=[report('draft',false,'grammar',{status:'draft'}),report('exam',false,'grammar',{assessment:true}),report('help',false,'grammar',{hintUsed:true}),report('review',false,'grammar',{review:true}),{...report('future',false),date:now+1000}];
 const broken=report('broken',false);broken.metadata.attempts[0].correctAnswer='not a choice';reports.push(broken);
 const state=warmup.build(reports,[],now);assert.equal(state.recordCount,0);assert(state.items.every(q=>q.source==='기초 확인'));assert.equal(state.items.length,3);
});
test('latest independent response replaces old mistake and warmup mistakes return next session',()=>{
 const old=report('old',false),fresh=report('new',true);fresh.metadata.attempts[0].question='old';fresh.date=now;
 assert.equal(warmup.build([old,fresh],[],now).patterns.length,0);
 const previous=warmup.build([],[],now);previous.items[1].response='play';
 const next=warmup.build([], [{date:'yesterday',items:previous.items}],now);assert.equal(next.items[0].id,'basic-verb');assert.equal(next.items[0].source,'오답 복습');assert(next.items.every(q=>q.response===undefined));
});

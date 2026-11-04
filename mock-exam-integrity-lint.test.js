// Broad integrity lint for the weekly mock exam: many learners, seeds, weeks and rounds with growing history.
// Every shipped item must be self-contained and uniquely answerable, areas keep their composition, and
// earlier material only returns as a labelled, oldest-first re-exposure after fresh items run out.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {setup}=require('./tests/helpers/mock-transfer-fixture.cjs');
const DAY=86400000,WEEK=7*DAY;
// Extra authored passages push into the same globals; include them whenever they are present.
const EXTRA=['MockKoreanReadingG7More.js','MockEnglishReadingMiddle1More.js'].filter(f=>fs.existsSync(f));
// The exam pages also load the later formula generator volumes.
const FORMULA=['MathFormulaQuizVolume2.js','MathFormulaQuizVolume3.js','MathFormulaQuizVolume4.js'];
const load=(c,files)=>{for(const f of files)vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});};
const AREAS={reading:['reading','korean_vocab'],english:['english','grammar','english_reading'],math:['math','math_formula'],hanja:['hanja']};
const TARGET={reading:15,english:15,math:15,hanja:10};

function learner(profile,now,extra=true){
 const s=setup(now),c=s.c;load(c,FORMULA);if(extra)load(c,EXTRA);
 s.reports.length=0;let id=0;
 const add=(subject,metadata,attempts,daysAgo=1)=>s.reports.push({userId:'learner',subject,sessionId:`ev-${subject}-${id++}`,date:now-daysAgo*DAY,totalQuestions:attempts.length,initialScore:attempts.length,metadata:{...metadata,initialAttempts:attempts.map(a=>({...a,correct:true}))}});
 const studied=new Set();
 if(profile.readingGrade){studied.add('reading');for(const p of c.ReadingPassages.filter(p=>p.grade===profile.readingGrade).slice(0,3))add('reading',{levelId:p.levelId||'level1',unitId:p.unitId,passageId:p.id,grade:p.grade},p.questions.map(q=>({questionId:q.id,question:q.question,correctAnswer:q.answer,skill:q.skill,passageId:p.id})));}
 if(profile.vocab){studied.add('korean_vocab');const unit=c.KoreanVocabData.levels.level1.units[profile.vocab-1];const attempts=unit.words.slice(0,8).map(w=>({wordId:w.id,type:'meaning',question:`‘${w.word}’의 뜻으로 알맞은 것은?`,correctAnswer:w.meaning}));add('korean_vocab',{levelId:'level1',unitId:unit.id,unitTitle:unit.title},attempts);}
 studied.add('english');const wordUnit=Object.keys(c.vocabData)[0];add('english',{unitId:wordUnit},c.vocabData[wordUnit].slice(0,8).map(w=>({word:w.word,question:w.word,correctAnswer:w.word})));
 studied.add('grammar');const grammar=c.EnglishGrammarData.middle.units.find(u=>u.id==='m2');add('grammar',{stageId:'middle',unitId:'m2'},grammar.lessons.flatMap((lesson,lessonIndex)=>lesson.examples.map(pair=>({lessonIndex,question:pair[0],correctAnswer:pair[1],explanation:lesson.principle}))));
 if(profile.englishGrade){studied.add('english_reading');const unit=c.EnglishReadingData.units.find(u=>(u.gradeId||'grade6')===profile.englishGrade&&u.passages?.length),p=unit.passages[0];add('english_reading',{levelId:profile.englishGrade,unitId:unit.id,passageId:p.id},p.questions.map(q=>({questionId:q.id,question:q.prompt,correctAnswer:q.choices[q.answerIndex],passageId:p.id})));}
 studied.add('math');
 if(profile.math==='middle-1'){const unitId='m1-1-u1',t=c.MathQuizData[unitId],templates=[...t.basic||[],...t.word||[],...t.advanced||[]].filter(x=>x.generator);const gens=[...new Set(templates.map(x=>x.generator))].slice(0,5);
  add('math',{levelId:'middle-1',semesterId:'1',unitId},gens.map(generator=>{let question=generator;try{question=c.Utils.generateMathQuiz(templates.find(x=>x.generator===generator)).question;}catch(_){}return {generator,question,correctAnswer:'1'};}));}
 else add('math',{levelId:'elementary-6',semesterId:'2',unitId:'e6-2-u5'},['circle_area_basic','circle_circumference','circle_reverse_radius','circle_diameter_from_circumference'].map(generator=>({generator,question:generator,correctAnswer:'1'})));
 studied.add('math_formula');add('math',{source:'math-formula',formulaNumber:profile.formula,unitId:`formula-${profile.formula}`},[{questionId:`formula-${profile.formula}-guided-calculation`,question:'계산',correctAnswer:'1',type:'guided-calculation'}]);
 studied.add('hanja');for(const [level,daysAgo] of profile.hanja)add('hanja',{unitId:level},c.vocabHanja[level].slice(0,10).map(w=>({hanja:w.hanja,question:`${w.hanja} (${w.eum})`,correctAnswer:`${w.meaning} ${w.eum}`})),daysAgo);
 return {...s,studied};
}
const weekOf=at=>{const d=new Date(at+9*3600000);d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return Date.parse(d.toISOString().slice(0,10)+'T00:00:00+09:00');};

function checkBank(s,b,label,shown){
 const V=s.c.MockExamQuality.validateItem,api=s.c.SmartStudy.MockExam;
 assert.equal(b.complete,true,`${label}: ${JSON.stringify(b.shortages)}`);assert.equal(b.items.length,55,label);assert(api.validateBank(b),`${label}: validateBank`);
 for(const [area,subjects] of Object.entries(AREAS)){
  const n=subjects.reduce((sum,sub)=>sum+b.items.filter(q=>q.subject===sub).length,0);assert.equal(n,TARGET[area],`${label}: ${area} total`);
  // No studied component silently disappears: it has items, or a note explains it has no examinable content.
  for(const sub of subjects)if(s.studied.has(sub))assert(b.items.some(q=>q.subject===sub)||b.componentNotes.some(note=>note.subject===sub),`${label}: ${sub} silently dropped`);
 }
 if(s.studied.has('reading')&&s.studied.has('korean_vocab')){assert.equal(b.quotas.reading,11,`${label}: reading share`);assert.equal(b.quotas.korean_vocab,4,`${label}: vocab share`);}
 else if(s.studied.has('reading'))assert.equal(b.quotas.reading,15,label);
 for(const q of b.items){const r=V(q);assert(r.ok,`${label}: ${q.subject} ${r.errors.join(';')} :: ${q.question}`);assert(s.api.grade(q,q.answer).correct,`${label}: ${q.question}`);}
 assert.equal(new Set(b.items.map(q=>q.fingerprint)).size,55,`${label}: duplicate inside one exam`);
 const weekStart=weekOf(b.scopeCutoffAt);
 for(const q of b.items){
  const before=shown.get(q.fingerprint);
  if(!q.repeated){assert.equal(before,undefined,`${label}: unlabelled repeat ${q.question}`);continue;}
  assert.equal(q.noveltyKind,'re-exposure',label);assert(Number.isFinite(q.lastExposedAt)&&q.lastExposedAt<weekStart,`${label}: same-week repeat ${q.question}`);
  // Fresh first: a subject only re-exposes when its fresh pool is used up (hanja: within the grade group).
  if(q.subject!=='hanja')assert.equal(b.freshLeft[q.subject],0,`${label}: ${q.subject} re-exposed while fresh items remained`);
 }
 for(const row of b.reexposureAudit)if(row.oldestUnusedAt!==null)assert(row.newestUsedAt<=row.oldestUnusedAt,`${label}: ${row.subject} re-exposure not oldest-first`);
}
function run(profile,{weeks,seedOffset=0,extra=true}){
 const base=Date.parse('2026-09-07T10:00:00+09:00')+seedOffset*DAY,history=[],shown=new Map();let reexposed=0;
 for(let w=0;w<weeks;w++)for(let round=1;round<=3;round++){
  const now=base+w*WEEK+(round-1)*3600000,s=learner(profile,now,extra),label=`${JSON.stringify(profile)} w${w} r${round}`;
  const b=s.api.build('learner',now,{attemptNo:round,history:history.map(h=>({payload:h}))});
  checkBank(s,b,label,shown);reexposed+=b.reexposureCount;
  history.push({userId:'learner',scheduledWeekId:new Date(weekOf(now)+9*3600000).toISOString().slice(0,10),attemptNo:round,startedAt:now,questions:JSON.parse(JSON.stringify(b.items))});
  for(const q of b.items)shown.set(q.fingerprint,now);
 }
 return reexposed;
}
const PROFILES=[
 {readingGrade:7,vocab:1,englishGrade:'middle1',math:'elementary-6',formula:6,hanja:[['level8',60],['level6',20],['level_jun5',1]]},
 {readingGrade:8,vocab:2,englishGrade:'grade6',math:'middle-1',formula:16,hanja:[['level7',30],['level_jun5',2]]},
 {readingGrade:9,englishGrade:'middle2',math:'elementary-6',formula:31,hanja:[['level6',1]]},
 {readingGrade:7,vocab:1,englishGrade:'middle3',math:'middle-1',formula:3,hanja:[['level8',10],['level7',1]]}
];
test('many learners, seeds and rounds: every exam is 15/15/15/10, keeps its composition and ships only valid items',()=>{
 for(const [index,profile] of PROFILES.entries())for(const seedOffset of [0,3])run(profile,{weeks:2,seedOffset:seedOffset+index});
});
test('a long run exhausts the fresh pools and then re-exposes only the oldest earlier-week items, never same-week ones',()=>{
 const reexposed=run(PROFILES[0],{weeks:7});assert(reexposed>0,'the long run should reach the re-exposure fallback');
});
test('2026-10-26 regression: grade-7 Korean transfer pool used last week still gives reading, never 15 vocabulary',()=>{
 const now=Date.parse('2026-10-26T19:00:00+09:00'),profile={readingGrade:7,vocab:1,englishGrade:'middle1',math:'elementary-6',formula:6,hanja:[['level8',60],['level6',20],['level_jun5',1]]};
 const s=learner(profile,now,false),c=s.c,used=c.MockKoreanTransfer.filter(p=>p.grade===7);assert.equal(used.length,2,'the original first-round grade-7 pool');
 const asQuestions=(passages,at)=>({payload:{userId:'learner',startedAt:at,questions:passages.flatMap(p=>p.questions.map(q=>({...q,subject:'reading',passageId:p.id,passageLines:p.lines})))}});
 // Last week's exam used both first-round grade-7 passages.
 let b=s.api.build('learner',now,{attemptNo:1,history:[asQuestions(used,now-7*DAY)]});
 const reading=b.items.filter(q=>q.subject==='reading');
 assert.equal(b.complete,true,JSON.stringify(b.shortages));assert.equal(reading.length,11);assert.equal(b.items.filter(q=>q.subject==='korean_vocab').length,4);
 assert(reading.every(q=>!q.repeated&&/^mock-retake-kr-g7-/.test(q.passageId)),'fresh grade-7 retake passages are used in round 1');
 // Every authored grade-7 passage already shown in earlier weeks: the oldest come back, labelled, still 11 reading.
 const retake=c.MockRetakeReading.korean.filter(p=>p.grade===7);
 const history=[asQuestions(retake.slice(0,2),now-35*DAY),asQuestions(retake.slice(2),now-14*DAY),asQuestions(used,now-7*DAY)];
 b=s.api.build('learner',now,{attemptNo:1,history});
 const again=b.items.filter(q=>q.subject==='reading'),oldest=new Set(retake.slice(0,2).map(p=>p.id));
 assert.equal(b.complete,true,JSON.stringify(b.shortages));assert.equal(again.length,11);assert.equal(b.items.filter(q=>q.subject==='korean_vocab').length,4);
 assert(again.every(q=>q.repeated&&q.noveltyKind==='re-exposure'&&oldest.has(q.passageId)),'re-exposure starts with the passages seen longest ago');
 assert(s.c.SmartStudy.MockExam.validateBank(b));
 // This week's rounds are never repeated, even as a fallback.
 const sameWeek=[asQuestions([...retake,...used],now-3600000)];
 b=s.api.build('learner',now,{attemptNo:2,history:sameWeek});
 assert.equal(b.items.filter(q=>q.subject==='reading').length,0);assert.equal(b.complete,false);
 assert.match(b.shortages.reading.reason,/국어 독해 0\/11문항/);assert.match(b.shortages.reading.reason,/다른 과목 문항으로 대신 채우지 않았습니다/);
});
test('hanja: five from the grade studied now and five from earlier grades, filled from the other side when short',()=>{
 const now=Date.parse('2026-10-26T19:00:00+09:00'),base={readingGrade:7,vocab:1,englishGrade:'middle1',math:'elementary-6',formula:16};
 let s=learner({...base,hanja:[['level8',60],['level6',20],['level_jun5',1]]},now),b=s.api.build('learner',now);
 assert.equal(b.hanjaSplit.currentLevel,'level_jun5');assert.equal(b.items.filter(q=>q.subject==='hanja'&&q.context.unitId==='level_jun5').length,5);assert.equal(b.items.filter(q=>q.subject==='hanja'&&q.context.unitId!=='level_jun5').length,5);
 s=learner({...base,hanja:[['level_jun5',1]]},now);b=s.api.build('learner',now);
 assert(b.complete);assert.equal(b.items.filter(q=>q.subject==='hanja'&&q.context.unitId==='level_jun5').length,10,'only one grade studied: all from it');
 // Two learned characters cannot form a valid transfer item, so the earlier grades fill the section.
 s=learner({...base,hanja:[['level6',20]]},now);s.reports.push({...s.reports.find(r=>r.subject==='hanja'),sessionId:'jun5-few',date:now-DAY,totalQuestions:2,metadata:{unitId:'level_jun5',initialAttempts:s.c.vocabHanja.level_jun5.slice(0,2).map(w=>({hanja:w.hanja,question:w.hanja,correctAnswer:w.meaning,correct:true}))}});
 b=s.api.build('learner',now);assert(b.complete,JSON.stringify(b.shortages));assert.equal(b.hanjaSplit.currentLevel,'level_jun5');assert.equal(b.items.filter(q=>q.subject==='hanja'&&q.context.unitId==='level6').length,10);
});
test('formula geometry questions name their figure; the validator rejects the 2026-10-26 nameless item',()=>{
 const s=setup(),V=s.c.MockExamQuality.validateItem;load(s.c,FORMULA);
 for(const number of [3,6,15,16,17,19,20,21,31,32,58,59,60,61])for(const q of s.c.MockMathTransfer.createFormula({context:{unitId:`formula-${number}`},attempts:[{questionId:`formula-${number}-guided-calculation`}]},Math.random)){
  const r=V({...q,subject:'math_formula'});assert(r.ok,`${number}: ${r.errors.join(';')} :: ${q.question}`);assert(q.question.includes(s.c.MockMathTransfer.figureOf(number)),q.question);
 }
 const nameless={subject:'math_formula',question:'[한 개의 조건] 밑변: 8 cm\n높이: 6 cm\n넓이를 구해 보세요.\n이 조건이 같은 대상을 3개 준비할 때, 각 대상에서 구한 값을 모두 합하면 얼마인가요? (cm²)',answer:'72',choices:['72','24','96','27'],explanation:'8×6÷2=24, 24×3=72',unit:'cm²'};
 assert.deepEqual([...V(nameless).errors],['도형·대상 이름 없는 측정 문항']);
});
test('the validator rejects non-unique answers, equivalent choices, wrong arithmetic, missing passages and out-of-range sentence numbers',()=>{
 const {c}=setup(),V=c.MockExamQuality.validateItem,ok={subject:'english_reading',question:'Which sentence shows the change?',answer:'Sentence 2',choices:['Sentence 1','Sentence 2','Sentence 3'],explanation:'2번 문장에 나온다.',passageId:'p',passageLines:['a.','b.','c.']};
 assert(V(ok).ok);
 assert(!V({...ok,choices:['Sentence 1','Sentence 2','Sentence 2']}).ok);
 assert(!V({...ok,answer:'Sentence 4'}).ok);
 assert(!V({...ok,subject:'math',question:'몇 개인가요?',answer:'1/2',choices:['1/2','0.5','2'],passageId:undefined,passageLines:undefined}).ok,'1/2 and 0.5 are the same choice');
 assert(!V({...ok,choices:['Sentence 1','Sentence 2','Sentence 5']}).ok,'sentence 5 of a three-sentence passage');
 assert(!V({...ok,passageLines:[]}).ok,'passage question without its passage');
 assert(!V({...ok,explanation:' '}).ok,'empty explanation');
 assert(!V({subject:'math',question:'반지름 3 cm인 원의 넓이는? (원주율 3.14)',answer:'28.26',choices:['28.26','18.84','9.42'],explanation:'3.14×3×3=28.36'}).ok,'explanation arithmetic must hold');
 assert(V({subject:'math',question:'반지름 3 cm인 원의 넓이는? (원주율 3.14)',answer:'28.26',choices:['28.26','18.84','9.42'],explanation:'3.14×3×3=28.26'}).ok);
});
test('same-week rounds 2-3: an exhausted this-week unit widens to older studied units before any shortage',()=>{
 const start=Date.parse('2026-10-28T10:00:00+09:00'),profile={readingGrade:7,vocab:1,englishGrade:'middle1',math:'elementary-6',formula:16,hanja:[['level6',1]]},history=[],shown=new Map();
 const grammarReport=(c,stageId,unitId,at,id)=>{const unit=c.EnglishGrammarData[stageId].units.find(u=>u.id===unitId),attempts=unit.lessons.flatMap((lesson,lessonIndex)=>lesson.examples.map(pair=>({lessonIndex,question:pair[0],correctAnswer:pair[1],explanation:lesson.principle,correct:true})));
  return {userId:'learner',subject:'grammar',sessionId:id,date:at,totalQuestions:attempts.length,initialScore:attempts.length,metadata:{stageId,unitId,initialAttempts:attempts}};};
 for(let round=1;round<=3;round++){
  const now=start+(round-1)*3600000,s=learner(profile,now),c=s.c;
  // This week only m10 (exactly four transfer items); m1 and e2 were studied the week before.
  for(let i=s.reports.length-1;i>=0;i--)if(s.reports[i].subject==='grammar')s.reports.splice(i,1);
  s.reports.push(grammarReport(c,'middle','m10',start-DAY,'g-m10'),grammarReport(c,'middle','m1',start-10*DAY,'g-m1'),grammarReport(c,'elementary','e2',start-11*DAY,'g-e2'));
  const b=s.api.build('learner',now,{attemptNo:round,history:history.map(h=>({payload:h}))}),grammar=b.items.filter(q=>q.subject==='grammar');
  checkBank(s,b,`grammar widening r${round}`,shown);
  // The share follows this week's coverage weights (grammar has older evidence, so it is not down-weighted as new).
  assert.equal(grammar.length,b.quotas.grammar);assert(grammar.length>=4,`round ${round}: grammar keeps its share`);
  if(round===1)assert.equal(grammar.filter(q=>q.context.unitId==='m10').length,4,'round 1 uses all of this week\'s unit first');
  else assert(grammar.every(q=>q.context.unitId!=='m10'&&!q.repeated),`round ${round}: fresh items from older studied units, no same-week repeat`);
  history.push({userId:'learner',startedAt:now,questions:JSON.parse(JSON.stringify(b.items))});for(const q of b.items)shown.set(q.fingerprint,now);
 }
});
test('hanja grades solved the same day: the most advanced recent grade is current, lower grades are previous',()=>{
 const now=Date.parse('2026-10-27T20:00:00+09:00');
 // Same day, 6급 first and 8급 last: the latest session must not make 8급 the current grade.
 const s=learner({readingGrade:7,vocab:1,englishGrade:'middle1',math:'elementary-6',formula:16,hanja:[['level6',.3],['level7',.2],['level8',.1]]},now),b=s.api.build('learner',now);
 assert(b.complete,JSON.stringify(b.shortages));assert.equal(b.hanjaSplit.currentLevel,'level6');
 const hanja=b.items.filter(q=>q.subject==='hanja');
 assert.equal(hanja.filter(q=>q.context.unitId==='level6').length,5);assert.equal(hanja.filter(q=>['level7','level8'].includes(q.context.unitId)).length,5);
 // A higher grade studied more than 14 days ago is not "current".
 const old=learner({readingGrade:7,vocab:1,englishGrade:'middle1',math:'elementary-6',formula:16,hanja:[['level_jun5',30],['level7',1],['level8',1]]},now).api.build('learner',now);
 assert.equal(old.hanjaSplit.currentLevel,'level7');
});
test('validator does not reject valid counting questions or chained fraction explanations',()=>{
 const {c}=setup(),V=c.MockExamQuality.validateItem;
 assert(V({subject:'math',question:'삼각기둥의 모서리의 수는 몇 개입니까?',answer:'9',choices:['9','6','12'],explanation:'밑면 모서리 3×2=6, 옆 모서리 3개로 9개입니다.'}).ok);
 assert(V({subject:'math',question:'$3 \div 4$ 의 계산 결과는?',answer:'$\frac{3}{4}$',choices:['$\frac{3}{4}$','$\frac{4}{3}$','$\frac{1}{12}$'],explanation:'$3 \div 4 = 3 \times \frac{1}{4} = \frac{3}{4}$ 입니다.'}).ok);
});

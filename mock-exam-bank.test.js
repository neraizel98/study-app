const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const NOW=Date.parse('2026-10-13T12:00:00+09:00'),DAY=86400000;
function setup(){
 const reports=[],c={console,Date,Set,Map,Math:Object.create(Math)};c.window=c;c.SmartStudy={LocalRepository:{listReports:()=>reports}};
 vm.createContext(c);
 for(const file of ['utils.js','VocabEng.js','MathQuizData.js','ReadingPassages.js','EnglishReadingData.js','EnglishGrammarData.js','EnglishGrammarQuiz.js','VocabHanja.js','MathFormulaData.js','MathFormulaDataExtra.js','quiz-registry.js','MathFormulaQuiz.js','MathFormulaQuizExtra.js','MathFormulaReview.js','KoreanVocabData.js','KoreanVocabLevel1a.js','KoreanVocabLevel1b.js','KoreanVocabLevel2a.js','KoreanVocabLevel2b.js','KoreanVocabQuiz.js','english-curriculum.js','learning-budget-policy.js','learning-plan.js','unified-learning.js','mock-reading-content.js','mock-exam-bank.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
 return {c,reports,api:c.SmartStudy.MockExamBank};
}
function report(subject,unitId,attempts,extra={}){return {subject,sessionId:`${subject}:${unitId}:${extra.date||NOW}`,date:NOW-18*DAY,totalQuestions:attempts.length,metadata:{unitId,initialAttempts:attempts.map(a=>({...a,correct:true})),...extra.metadata},...extra};}
function seed(s){
 const {c,reports}=s,bee=c.ReadingPassages.find(p=>p.id==='bee-signal');
 reports.push(report('reading','r3',bee.questions.map(q=>({questionId:q.id,question:q.question,correctAnswer:q.answer,skill:q.skill,passageId:bee.id})),{metadata:{unitId:'r3',levelId:'level1',passageId:bee.id,initialAttempts:bee.questions.map(q=>({questionId:q.id,question:q.question,correctAnswer:q.answer,skill:q.skill,passageId:bee.id,correct:true}))}}));
 const wordUnit=Object.keys(c.vocabData)[0];reports.push(report('english',wordUnit,c.vocabData[wordUnit].slice(0,4).map(w=>({word:w.word,question:w.word,correctAnswer:w.word}))));
 reports.push(report('grammar','e2',[{question:'I ___ a student.',correctAnswer:'am'}],{metadata:{unitId:'e2',stageId:'elementary',initialAttempts:[{question:'I ___ a student.',correctAnswer:'am',correct:true}]}}));
 const passage=c.EnglishReadingData.units[0].passages[0];reports.push(report('english_reading','er1',passage.questions.map(q=>({questionId:q.id,question:q.prompt,correctAnswer:q.choices[q.answerIndex],passageId:passage.id})),{metadata:{unitId:'er1',levelId:'grade6',passageId:passage.id,initialAttempts:passage.questions.map(q=>({questionId:q.id,question:q.prompt,correctAnswer:q.choices[q.answerIndex],passageId:passage.id,correct:true}))}}));
 reports.push(report('math','e6-2-u5',['circle_area_basic','circle_circumference','circle_reverse_radius','circle_diameter_from_circumference'].map(generator=>({generator,question:generator,correctAnswer:'1'})),{metadata:{unitId:'e6-2-u5',levelId:'elementary-6',semesterId:'2',initialAttempts:['circle_area_basic','circle_circumference','circle_reverse_radius','circle_diameter_from_circumference'].map(generator=>({generator,question:generator,correctAnswer:'1',correct:true}))}}));
 const formula=c.MathFormulaReview.create(16);reports.push(report('math','formula-16',formula.map((q,i)=>({questionId:`formula-16-${q.noteType}`,question:q.prompt,correctAnswer:q.answer})),{sessionId:'formula-evidence',metadata:{source:'math-formula',unitId:'formula-16',formulaNumber:16,formulaTitle:'직사각형의 넓이',initialAttempts:formula.map(q=>({questionId:`formula-16-${q.noteType}`,question:q.prompt,correctAnswer:q.answer,correct:true}))}}));
 reports.push(report('hanja','level8',c.vocabHanja.level8.slice(0,5).map(w=>({hanja:w.hanja,question:w.hanja,correctAnswer:`${w.meaning} ${w.eum}`}))));
 return s;
}
test('well evidenced corpus reaches all seven quotas and 55 valid questions',()=>{
 const s=seed(setup()),before=JSON.stringify(s.reports),result=s.api.build('우준',NOW);
 assert.equal(result.complete,true,JSON.stringify(result.shortages));assert.equal(result.items.length,55);assert.deepEqual({...result.quotas},{reading:11,korean_vocab:4,english:4,grammar:4,english_reading:7,math:12,math_formula:3,hanja:10});
 assert.equal(new Set(result.items.map(q=>q.id)).size,55);assert.equal(new Set(result.items.map(q=>q.fingerprint)).size,55);
 for(const [subject,count]of Object.entries(result.quotas))if(!['reading','korean_vocab'].includes(subject))assert.equal(result.items.filter(q=>q.subject===subject).length,count,subject);
 // 어휘 학습 기록이 없으면 국어 15문항을 모두 독해로 채운다.
 assert.equal(result.items.filter(q=>q.subject==='reading').length,15);assert.equal(result.items.filter(q=>q.subject==='korean_vocab').length,0);
 for(const q of result.items){assert.equal(q.choices.filter(v=>v===q.answer).length,1,q.question);assert.equal(new Set(q.choices).size,q.choices.length);assert.ok(q.evidenceReportIds.length);assert.equal(s.api.grade(q,q.answer).correct,true);if(['reading','english_reading'].includes(q.subject))assert.ok(q.passageLines.length);}
 assert.equal(JSON.stringify(s.reports),before);assert.equal(result.newQuestionCount+result.reexposureCount,55);
});
test('build is deterministic for the user and Korean day and restores the shared RNG',()=>{
 const s=seed(setup()),rng=s.c.Math.random,a=s.api.build('우준',NOW),b=s.api.build('우준',NOW+1000);assert.equal(JSON.stringify(a.items),JSON.stringify(b.items));assert.equal(s.c.Math.random,rng);
});
test('unknown, draft, partial, assessments and out of range evidence never expand scope',()=>{
 const s=setup();for(const extra of [{metadata:{stageId:'elementary',unitId:'e2',assessment:true}},{metadata:{stageId:'elementary',unitId:'e2',status:'draft'}},{metadata:{stageId:'elementary',unitId:'e2',status:'partial'}},{date:NOW-22*DAY},{date:NOW+1}])s.reports.push(report('grammar','e2',[{question:'I ___ a student.',correctAnswer:'am'}],extra));
 s.reports.push({...report('grammar','e2',[{question:'unknown',correctAnswer:'unknown'}]),totalQuestions:3});
 const result=s.api.build('우준',NOW);assert.equal(result.items.length,0);assert.equal(result.complete,false);assert.equal(result.shortages.reading.missing,15);assert.equal(Object.keys(result.shortages).length,7);
});
test('single evidenced grammar concept excludes other lessons in the same unit',()=>{
 const s=setup();s.reports.push(report('grammar','e2',[{question:'I ___ a student.',correctAnswer:'am'}],{metadata:{stageId:'elementary',unitId:'e2',initialAttempts:[{question:'I ___ a student.',correctAnswer:'am',correct:true}]}}));
 const items=s.api.build('우준',NOW).items;assert.equal(items.length,4);assert.ok(items.every(q=>q.subject==='grammar'&&['am','is','are'].includes(q.answer)&&q.question.includes('___')));
});
test('math without a generator or exact source match is reported as a shortage',()=>{
 const s=setup();s.reports.push(report('math','e6-2-u5',[{question:'some old math',correctAnswer:'1'}],{metadata:{unitId:'e6-2-u5',levelId:'elementary-6',semesterId:'2',initialAttempts:[{question:'some old math',correctAnswer:'1',correct:true}]}}));assert.equal(s.api.build('우준',NOW).shortages.math.actual,0);
});
test('recent assessment exact questions are excluded even if choices are reordered or text case changes',()=>{
 const s=seed(setup()),first=s.api.build('우준',NOW);s.reports.push({subject:'reading',sessionId:'recent-mock',date:NOW-1,totalQuestions:55,metadata:{assessment:true,initialAttempts:first.items.map(q=>({subject:q.subject,question:q.question.toUpperCase().replace(/ /g,'  '),questionId:q.id,choices:[...q.choices].reverse(),correctAnswer:q.answer,correct:true}))}});
 const second=s.api.build('우준',NOW),seen=new Set(first.items.map(q=>q.fingerprint));assert.ok(second.items.every(q=>!seen.has(q.fingerprint)));assert.equal(second.complete,false);assert.ok(second.shortages.hanja);assert.ok(second.items.every(q=>!q.evidenceReportIds.includes('recent-mock')));
});
test('numeric variants remain explicitly reexposure rather than inflated independent novelty',()=>{
 const s=seed(setup()),result=s.api.build('우준',NOW);assert.ok(result.items.filter(q=>['math','math_formula'].includes(q.subject)).every(q=>q.repeated));
});
test('grading is exact and distinguishes unanswered, invalid and wrong',()=>{
 const {api}=setup(),q={question:'Pick B',choices:['A','B','C'],answer:'B'};assert.equal(api.grade(q,'B').status,'correct');assert.equal(api.grade(q,'A').status,'wrong');assert.equal(api.grade(q,'').status,'unanswered');assert.equal(api.grade(q,' b ').status,'invalid');assert.equal(api.grade(q,1).status,'invalid');assert.equal(api.grade({...q,choices:['B','B']},'B').status,'invalid');assert.equal(api.grade({...q,answer:'D'},'D').status,'invalid');
});
test('semantic fingerprint ignores choice order, text case and whitespace',()=>{const {api}=setup();assert.equal(api.fingerprint({subject:'english',question:'A B',answer:'C',choices:['C','D']}),api.fingerprint({subject:'english',question:' a  b ',answer:' c ',choices:['D','C']}));});
test('numerically equivalent options and development placeholders are invalid questions',()=>{const {api}=setup();assert.equal(api.grade({question:'fraction',choices:['1/2','0.5','1'],answer:'1/2'},'1/2').status,'invalid');assert.equal(api.grade({question:'이 유형의 문제는 아직 개발 중입니다. (임시 문제)',choices:['1','2'],answer:'1'},'1').status,'invalid');});
test('original content covers all four English units and every supplied question has unique validated options',()=>{
 const {c,api}=setup(),content=c.MockReadingContent;assert.equal(content.korean.length,8);assert.equal(content.korean.flatMap(p=>p.questions).length,40);
 for(const id of ['er1','er2','er3','er4'])assert.equal(content.english.filter(p=>p.sourcePassageId.startsWith(id+'-')).length,7);
 for(const p of [...content.korean,...content.english])for(const q of p.questions){assert.equal(api.grade(q,q.answer).status,'correct',p.id+':'+q.question);assert.ok(q.explanation);}
 for(const p of content.english){const source=c.EnglishReadingData.units.flatMap(u=>u.passages).find(s=>s.id===p.sourcePassageId);assert.ok(source,p.id);for(const word of p.requiredVocabulary){assert.ok(source.vocabulary.some(w=>w.word===word)||source.sentences.some(s=>s.toLowerCase().includes(word)),p.id+':source '+word);assert.ok(p.lines.some(s=>s.toLowerCase().includes(word)),p.id+':passage '+word);}}
});
test('three consecutive weeks retain 15 fresh Korean and 7 fresh English questions per fully learned unit',()=>{
 for(const unitId of ['er1','er2','er3','er4']){
  const s=seed(setup());s.reports.splice(0,s.reports.length,...s.reports.filter(r=>r.subject==='reading'));
  s.reports[0].date=NOW-DAY;
  const unit=s.c.EnglishReadingData.units.find(u=>u.id===unitId);
  for(const p of unit.passages)s.reports.push(report('english_reading',unitId,p.questions.map(q=>({questionId:q.id,question:q.prompt,correctAnswer:q.choices[q.answerIndex],passageId:p.id})),{sessionId:p.id,date:NOW-DAY,metadata:{levelId:'grade6',unitId,passageId:p.id,initialAttempts:p.questions.map(q=>({questionId:q.id,question:q.prompt,correctAnswer:q.choices[q.answerIndex],passageId:p.id,correct:true}))}}));
  const seen=new Set();
  for(let week=0;week<3;week++){
   const at=NOW+week*7*DAY,result=s.api.build('우준',at),selected=result.items.filter(q=>['reading','english_reading'].includes(q.subject));
   assert.equal(selected.filter(q=>q.subject==='reading').length,15,`${unitId}:Korean week ${week}`);assert.equal(selected.filter(q=>q.subject==='english_reading').length,7,`${unitId}:English week ${week}`);
   for(const q of selected){assert.equal(q.repeated,false);assert.ok(!seen.has(q.fingerprint),q.id);seen.add(q.fingerprint);assert.ok(q.context.unitId==='r3'||q.context.unitId===unitId);}
   s.reports.push({subject:'reading',sessionId:`exam-${week}`,date:at,totalQuestions:selected.length,metadata:{assessment:true,initialAttempts:selected.map(q=>({...q,questionId:q.id,correctAnswer:q.answer,correct:true}))}});
  }
 }
});
test('recent units lead, one unit cannot fill math, and two numeric answers are typed',()=>{
 const s=seed(setup()),gens=['frac_div_frac_basic','frac_div_frac_fill','frac_div_frac_compare','frac_div_frac_word'];
 s.reports.push(report('math','e6-2-u1',gens.map(generator=>({generator,question:generator,correctAnswer:'1'})),{date:NOW-2*DAY,metadata:{unitId:'e6-2-u1',levelId:'elementary-6',semesterId:'2',initialAttempts:gens.map(generator=>({generator,question:generator,correctAnswer:'1',correct:true}))}}));
 const math=s.api.build('우준',NOW).items.filter(q=>q.subject==='math'),count=unit=>math.filter(q=>q.context.unitId===unit).length;
 assert.equal(math.length,12);assert.ok(count('e6-2-u1')>=5,'most recent unit leads');assert.ok(count('e6-2-u5')>=5,'older unit still covered');
 assert.ok(count('e6-2-u1')>=count('e6-2-u5'));
 const written=math.filter(q=>q.kind==='written');assert.equal(written.length,2);
 for(const q of written){assert.ok(s.api.writtenKey(q.answer).startsWith('number:'),q.question);assert.ok(!/ 중 |더 큰|더 작은/.test(q.question));assert.equal(s.api.grade(q,q.answer).correct,true);}
 assert.ok(math.some(q=>q.difficulty==='challenge'),'a harder item is reserved');
});
test('typed answers compare values, not notation',()=>{
 const {api}=setup(),B=String.fromCharCode(92),q={kind:'written',answer:`$${B}frac{4}{9}$km`};
 for(const value of ['4/9',' 4 / 9 ',`$${B}frac{4}{9}$`])assert.equal(api.grade(q,value).correct,true,value);
 assert.equal(api.grade({kind:'written',answer:'9개'},'9').correct,true);
 assert.equal(api.grade(q,'5/9').status,'wrong');assert.equal(api.grade(q,'').status,'unanswered');
});
test('reading options do not give the answer away by length or extreme wording',()=>{
 const {c}=setup(),content=c.MockReadingContent;
 for(const language of ['korean','english']){
  const items=content[language].flatMap(p=>p.questions),longest=items.filter(q=>{const lengths=q.choices.map(v=>v.length),max=Math.max(...lengths);return q.answer.length===max&&lengths.filter(v=>v===max).length===1;});
  assert.ok(longest.length/items.length<=0.2,`${language}: ${longest.length}/${items.length} answers are the longest option`);
 }
 const extreme=/반드시|항상|모든|언제나|절대|전혀|결코|숨기기 위해|없애기 위해|존재하지 않는다/;
 for(const q of content.korean.flatMap(p=>p.questions).filter(q=>q.skill!=='evidence'))for(const option of q.choices.filter(v=>v!==q.answer))assert.ok(!extreme.test(option),option);
});
test('studied Korean vocabulary fills four 국어 questions after reading',()=>{
 const s=seed(setup()),unit=s.c.KoreanVocabData.levels.level1.units[0],studied=unit.words.slice(0,6);
 const attempts=studied.map(w=>({wordId:w.id,type:'meaning',question:`‘${w.word}’의 뜻으로 알맞은 것은?`,correctAnswer:w.meaning,correct:true}));
 s.reports.push(report('korean_vocab',unit.id,attempts,{metadata:{levelId:'level1',unitId:unit.id,unitTitle:unit.title,initialAttempts:attempts.map(a=>({...a,correct:true}))}}));
 const result=s.api.build('우준',NOW),vocab=result.items.filter(q=>q.subject==='korean_vocab');
 assert.equal(result.complete,true,JSON.stringify(result.shortages));assert.equal(result.items.length,55);
 assert.equal(vocab.length,4);assert.equal(result.items.filter(q=>q.subject==='reading').length,11);
 for(const q of vocab){assert.ok(studied.some(w=>`vocab:${w.id}`===q.conceptId),q.conceptId);assert.equal(s.api.grade(q,q.answer).correct,true);assert.equal(new Set(q.choices).size,4);}
 const korean=Array.from(result.items.filter(q=>['reading','korean_vocab'].includes(q.subject)),q=>q.subject);
 assert.deepEqual(korean,[...Array(11).fill('reading'),...Array(4).fill('korean_vocab')],'국어 영역: 독해 다음에 어휘');
});

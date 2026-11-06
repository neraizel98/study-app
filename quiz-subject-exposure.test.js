const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const now=Date.now();let reports=[],seed=1747;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
const c={console,Date,Math:Object.assign(Object.create(Math),{random}),SmartStudy:{LocalRepository:{getActiveUser:()=> 'u',listReports:()=>reports}}};c.window=c;vm.createContext(c);
for(const f of ['quiz-exposure.js','KoreanVocabData.js','KoreanVocabLevel1a.js','KoreanVocabLevel1b.js','KoreanVocabLevel2a.js','KoreanVocabLevel2b.js','KoreanVocabQuiz.js','VocabHanja.js','hanja-quiz.js','utils.js','MathQuizData.js','math-session-questions.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});
const select=(subject,items,count)=>c.QuizExposure.select('u',subject,items,count,{now});
const record=(subject,items,id,at=now-1000)=>({sessionId:id,subject,date:at,totalQuestions:items.length,metadata:{initialAttempts:items.map(q=>({...q,questionType:q.questionType||q.type,correctAnswer:q.answer,correct:true}))}});
const rank=subject=>rows=>select(subject,rows,rows.length).items;
const pool=c.KoreanVocabData.allWords().filter(w=>w.levelId==='level1'),words=pool.filter(w=>w.unitId==='kv1-u1');
let koreanCount=0;
for(const w of c.KoreanVocabData.allWords()){
 const levelPool=c.KoreanVocabData.allWords().filter(p=>p.levelId===w.levelId),q=c.KoreanVocabQuiz.question(w,'definition',levelPool,random);
 assert(q);assert.equal(q.answer,w.word);assert(q.question.includes(w.meaning));assert.equal(new Set(q.choices).size,4);assert(q.choices.filter(v=>v===q.answer).length===1);koreanCount++;
}
let selected=c.KoreanVocabQuiz.build({words,pool,count:10,rank:rank('korean_vocab'),random});assert.equal(selected.length,10);assert.equal(new Set(selected.map(q=>q.wordId)).size,10);
reports=[record('korean_vocab',selected,'k1')];const previous=new Set(selected.map(q=>q.exposure.fingerprint));
selected=c.KoreanVocabQuiz.build({words,pool,count:10,rank:rank('korean_vocab'),random});assert(selected.every(q=>!previous.has(q.exposure.fingerprint)));assert(selected.every(q=>q.unitId==='kv1-u1'));
const allKv=words.flatMap(w=>c.KoreanVocabQuiz.available(w).map(t=>c.KoreanVocabQuiz.question(w,t,pool,random)).filter(Boolean));
reports=[record('korean_vocab',allKv,'ka'),record('korean_vocab',allKv,'kb')];selected=c.KoreanVocabQuiz.build({words,pool,count:10,rank:rank('korean_vocab'),random});assert.equal(selected.length,10);assert(selected.every(q=>q.exposure.reviewRequired));
let hanjaCount=0;
for(const rows of Object.values(c.vocabHanja))for(const q of c.HanjaQuiz.candidates(rows,rows,random)){
 if(q.questionType!=='writing'){assert.equal(q.quizChoices.length,4,q.questionId);assert.equal(new Set(q.quizChoices).size,4,q.questionId);assert.equal(q.quizChoices.filter(v=>v===q.answer).length,1,q.questionId);}
 if(q.questionType==='sound')assert.equal(q.answer,rows.find(w=>w.hanja===q.hanja).eum);
 if(q.questionType==='radical')assert(!q.quizChoices.some(v=>/[()]/.test(v)),'same radical must not differ by total stroke suffix');
 hanjaCount++;
}
reports=[];const hp=c.vocabHanja.level8;selected=c.HanjaQuiz.select({words:hp,pool:hp,rank:rank('hanja'),random});assert.equal(selected.length,10);assert.equal(new Set(selected.map(q=>q.hanja)).size,10);
reports=[record('hanja',selected,'h1')];const old=new Set(selected.map(q=>q.exposure.fingerprint));selected=c.HanjaQuiz.select({words:hp,pool:hp,rank:rank('hanja'),random});assert(selected.every(q=>!old.has(q.exposure.fingerprint)));
const allH=c.HanjaQuiz.candidates(hp,hp,random);reports=[record('hanja',allH,'ha'),record('hanja',allH,'hb')];selected=c.HanjaQuiz.select({words:hp,pool:hp,rank:rank('hanja'),random});assert.equal(selected.length,10);assert(selected.every(q=>q.exposure.reviewRequired));
const legacy=allH.find(q=>q.questionType==='meaning');reports=[record('hanja',[{question:`${legacy.hanja} (${legacy.eum})`,answer:legacy.answer}],'old-h'),record('hanja',[legacy],'new-h')];assert.equal(select('hanja',[legacy],1).items[0].exposure.priorCount,2,'old generic display and new real prompt count together');
reports=[];const template=Object.values(c.MathQuizData).find(u=>u.basic?.length>=3).basic.slice(0,3),generate=q=>c.Utils.generateMathQuiz(q);
const math=c.MathSessionQuestions.build(template,generate,40).map(q=>({...q,correctAnswer:q.choices[q.answer]}));assert.equal(math.length,40);
const first=select('math',math,10);reports=[record('math',first.items.map(q=>({...q,answer:q.correctAnswer})),'m1')];const second=select('math',math,10);assert(second.items.every(q=>!first.items.some(p=>p.exposure.fingerprint===q.exposure.fingerprint)));
const q=math[0],reordered={...q,choices:[...q.choices].reverse(),answer:3-q.answer};assert.equal(c.QuizExposure.fingerprint(q),c.QuizExposure.fingerprint(reordered),'answer option order is not fresh content');
reports=[record('math',math.map(q=>({...q,answer:q.correctAnswer})),'ma'),record('math',math.map(q=>({...q,answer:q.correctAnswer})),'mb')];assert.equal(select('math',math,10).reviewRequired,true);
console.log(`PASS: ${koreanCount} reverse vocabulary items, ${hanjaCount} Hanja variants, unique words/characters, fresh-first rotation, finite-pool review, legacy Hanja exposure, and real math candidate rotation.`);

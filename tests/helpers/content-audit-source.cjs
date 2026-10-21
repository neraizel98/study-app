const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
module.exports=function(){
 const c={};c.window=c;vm.createContext(c);
 for(const f of ['ReadingPassages.js','ReadingPassagesMore1.js','ReadingPassagesMore2.js','ReadingPassagesMore3.js','EnglishReadingData.js','EnglishReadingMore1.js','EnglishReadingMore2.js','EnglishReadingSecondary.js','reading-question-variants.js','mock-reading-content.js'])
  vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});
 const groups=[
  ['reading',c.ReadingPassages],['english_reading',c.EnglishReadingData.units.flatMap(u=>u.passages)],
  ['mock_reading',c.MockReadingContent.korean],['mock_english_reading',c.MockReadingContent.english]
 ];
 return groups.flatMap(([subject,passages])=>passages.flatMap(p=>p.questions.map((q,i)=>{
  const lines=p.lines||p.sentences,question=q.question||q.prompt;
  const answer=Number.isInteger(q.answerIndex)?q.choices[q.answerIndex]:Number.isInteger(q.answer)?q.choices[q.answer]:q.answer;
  const payload={lines,question,choices:q.choices,answer,explanation:q.explanation,evidence:q.evidence,translations:p.translations};
  return {id:`${subject}/${p.id}/${q.id||i}`,subject,passageId:p.id,question,choices:q.choices,answer,
   lines,evidence:q.evidence,explanation:q.explanation,
   hash:crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')};
 })));
};

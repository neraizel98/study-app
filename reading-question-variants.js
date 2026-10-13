(function(root){
 'use strict';const all=(root.EnglishReadingData?.units||[]).flatMap(u=>u.passages);
 for(const p of all){const seen=new Set(p.questions.map(q=>q.id));for(const entry of p.vocabulary){const escaped=entry.word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),regex=new RegExp('\\b'+escaped+'\\b','i'),index=p.sentences.findIndex(s=>regex.test(s));if(index<0)continue;
  const others=p.vocabulary.filter(w=>w.word!==entry.word&&w.meaning!==entry.meaning).map(w=>w.word);if(new Set(others).size<3)continue;
  const id=p.id+'-context-'+entry.word;if(seen.has(id))continue;seen.add(id);const sentence=p.sentences[index].replace(regex,'_____'),base=[entry.word,...[...new Set(others)].slice(0,3)],shift=[...id].reduce((n,c)=>n+c.charCodeAt(0),0)%4,choices=base.slice(shift).concat(base.slice(0,shift));p.questions.push({id,type:'vocabulary',prompt:`According to sentence ${index+1}, choose the missing word: ${sentence}`,promptKo:`빈칸에 알맞은 단어를 고르세요. ${entry.meaning}`,choices,answerIndex:(4-shift)%4,explanation:`${index+1}번째 문장의 ${entry.word}는 ${entry.meaning}라는 뜻이에요.`,evidence:[index],variant:true});
 }}
})(window);

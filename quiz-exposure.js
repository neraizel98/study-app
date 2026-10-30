(function(root){
 'use strict';const norm=s=>String(s??'').normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();
 const fingerprint=q=>norm(q.question||q.prompt)+'|'+norm(q.answer??q.correctAnswer??q.choices?.[q.answerIndex]);
 function recent(user,subject,now=Date.now()){return (root.SmartStudy.LocalRepository.listReports(user)||[]).filter(r=>r.subject===subject&&r.metadata?.status!=='draft'&&Number(r.date)>now-14*86400000&&Number(r.date)<=now).flatMap(r=>r.metadata?.initialAttempts||r.metadata?.attempts||[]);}
 function fresh(subject,candidates,now=Date.now()){const user=root.SmartStudy.LocalRepository.getActiveUser(),seen=new Set(recent(user,subject,now).map(fingerprint));return (candidates||[]).filter(q=>!seen.has(fingerprint(q)));}
 function freshWords(candidates,now=Date.now()){const user=root.SmartStudy.LocalRepository.getActiveUser(),seen=new Set(recent(user,'english',now).flatMap(a=>[norm(a.word),norm(a.question)]).filter(Boolean));return candidates.filter(q=>!seen.has(norm(q.word)));}
 // Daily practice must stay available when the finite unseen pool is exhausted.
 // Preserve the supplied level/grade pool; never widen scope or delete history.
 function practiceWords(candidates,count,now=Date.now()){
  const user=root.SmartStudy.LocalRepository.getActiveUser(),last=new Map();
  for(const report of root.SmartStudy.LocalRepository.listReports(user)||[]){
   const date=Number(report.date);
   if(report.subject!=='english'||report.metadata?.status==='draft'||!Number.isFinite(date)||date>now)continue;
   for(const a of report.metadata?.initialAttempts||report.metadata?.attempts||[]){
    const key=norm(a.word||a.question);if(key&&(!last.has(key)||date>last.get(key)))last.set(key,date);
   }
  }
  const unique=new Map();
  for(const word of candidates||[]){const key=norm(word?.word);if(key&&!unique.has(key))unique.set(key,word);}
  return [...unique.values()].sort((a,b)=>(last.get(norm(a.word))??-Infinity)-(last.get(norm(b.word))??-Infinity)).slice(0,Math.max(0,count));
 }
 root.QuizExposure={fingerprint,fresh,freshWords,practiceWords};
})(typeof window!=='undefined'?window:globalThis);

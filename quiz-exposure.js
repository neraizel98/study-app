(function(root){
 'use strict';const norm=s=>String(s??'').normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();
 const fingerprint=q=>norm(q.question||q.prompt)+'|'+norm(q.answer??q.correctAnswer??q.choices?.[q.answerIndex]);
 function recent(user,subject,now=Date.now()){return (root.SmartStudy.LocalRepository.listReports(user)||[]).filter(r=>r.subject===subject&&r.metadata?.status!=='draft'&&Number(r.date)>now-14*86400000&&Number(r.date)<=now).flatMap(r=>r.metadata?.initialAttempts||r.metadata?.attempts||[]);}
 function fresh(subject,candidates,now=Date.now()){const user=root.SmartStudy.LocalRepository.getActiveUser(),seen=new Set(recent(user,subject,now).map(fingerprint));return (candidates||[]).filter(q=>!seen.has(fingerprint(q)));}
 function freshWords(candidates,now=Date.now()){const user=root.SmartStudy.LocalRepository.getActiveUser(),seen=new Set(recent(user,'english',now).flatMap(a=>[norm(a.word),norm(a.question)]).filter(Boolean));return candidates.filter(q=>!seen.has(norm(q.word)));}
 root.QuizExposure={fingerprint,fresh,freshWords};
})(typeof window!=='undefined'?window:globalThis);

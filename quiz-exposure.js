(function(root){
 'use strict';const norm=s=>String(s??'').normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();
 const policyVersion='20261105-repeat-window-v1',windowMs=7*86400000,maxNormalExposures=2;
 const compact=value=>norm(value).replace(/\\(?:d|t)?frac\{([^{}]+)\}\{([^{}]+)\}/g,'$1/$2').replace(/\\[()[\]]|\$|\\(?:left|right)|[{}]/g,'').replace(/[“”‘’]/g,"'").replace(/\s+/g,'');
 function answerOf(q){return q.correctAnswer??q.answer??q.correctValue??q.displayCorrect??q.choices?.[q.answerIndex];}
 function fingerprint(q){
  if(!q||typeof q!=='object')return null;
  const prompt=q.question||q.prompt||q.word&&`word:${q.word}:type:${q.qType??q.questionType??q.type??''}`;
  if(!prompt)return null;
  const answer=answerOf(q),passage=q.passageText?.length?q.passageText:q.passageLines?.length?q.passageLines:q.sentences?.length?q.sentences:[];
  // IDs, option order and layout are not new questions. Passage/givens are part of meaning.
  return JSON.stringify([compact(prompt),compact(answer),compact(q.givens||''),compact(Array.isArray(passage)?passage.join(' '):passage)||compact(q.passageId||'')]);
 }
 const reportSubject=r=>r.metadata?.source==='math-formula'?'math_formula':r.subject;
 function firstAt(r){const values=[r.createdAt,r.date,r.metadata?.submittedAt].map(Number).filter(v=>Number.isFinite(v)&&v>0);return values.length?Math.min(...values):null;}
 function exposures(user,subject,now){
  const result=new Map(),sessions=new Set(),rows=user?(root.SmartStudy?.LocalRepository?.listReports(user)||[]):[];
  for(const r of [...rows].sort((a,b)=>(firstAt(a)||0)-(firstAt(b)||0))){
   const m=r.metadata||{},at=firstAt(r);
   if((r.userId&&r.userId!==user)||(r.learnerId&&r.learnerId!==user)||reportSubject(r)!==subject||!at||at<=now-windowMs||at>now||r.draft||m.draft||['draft','partial','active'].includes(r.status)||['draft','partial','active'].includes(m.status))continue;
   const session=r.sessionId?String(r.sessionId):`${at}:${r.subject}:${r.totalQuestions||''}`;
   if(sessions.has(session))continue;sessions.add(session);
   const first=Array.isArray(m.initialAttempts)?m.initialAttempts:(Array.isArray(m.attempts)?m.attempts:[]),seen=new Set();
   for(const a of first){
    if(!a||typeof a.correct!=='boolean'||(a.round!=null&&Number(a.round)!==1))continue;
    const q={...a,passageText:a.passageText||a.passageLines||m.passageText||m.passageLines||[],passageId:a.passageId||m.passageId};
    const fp=a.exposure?.fingerprint||fingerprint(q);if(!fp||seen.has(fp))continue;seen.add(fp);
    const entry=result.get(fp)||{count:0,lastAt:0,sessions:new Set()};entry.sessions.add(session);entry.count=entry.sessions.size;entry.lastAt=Math.max(entry.lastAt,at);result.set(fp,entry);
   }
  }
  return result;
 }
 function inspect(user,subject,candidates,options={}){
  const history=exposures(user,subject,options.now??Date.now()),seen=new Set(),rows=[];
  for(const item of candidates||[]){
   const fp=fingerprint(item);if(!fp||seen.has(fp))continue;seen.add(fp);
   // Legacy aliases are supplied only by subject adapters with authoritative metadata.
   // Union session references so aliases neither double-count nor erase old/new exposures.
   const refs=new Set();let lastAt=0;
   for(const alias of [fp,...(Array.isArray(item.exposureAliases)?item.exposureAliases:[])]){
    const prior=history.get(alias);if(!prior)continue;for(const session of prior.sessions)refs.add(session);lastAt=Math.max(lastAt,prior.lastAt);
   }
   const count=refs.size;rows.push({item,fingerprint:fp,count,lastAt,kind:count===0?'fresh':count<maxNormalExposures?'repeat':'review'});
  }
  return rows;
 }
 function select(user,subject,candidates,count,options={}){
  const rows=inspect(user,subject,candidates,options).map((row,index)=>({...row,index}));
  rows.sort((a,b)=>(a.count===0?0:a.count<maxNormalExposures?1:2)-(b.count===0?0:b.count<maxNormalExposures?1:2)||a.count-b.count||a.lastAt-b.lastAt||a.index-b.index);
  const picked=rows.slice(0,Math.max(0,Math.floor(Number(count)||0))),reviewRequired=!!options.review||picked.some(row=>row.kind==='review');
  const items=picked.map(row=>({...row.item,exposure:{fingerprint:row.fingerprint,priorCount:row.count,kind:options.review?'review':row.kind,reviewRequired:!!options.review||row.kind==='review',policyVersion}}));
  return {items,reviewRequired,reason:reviewRequired?'최근 7일에 같은 문제를 두 번 풀어, 이번에는 복습으로 연습해요.':'새 문제를 먼저 풀고, 최근 문제는 7일 동안 두 번까지 연습해요.',freshCount:picked.filter(r=>r.kind==='fresh').length,repeatCount:picked.filter(r=>r.kind==='repeat').length,reviewCount:options.review?items.length:picked.filter(r=>r.kind==='review').length,policyVersion};
 }
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
 root.QuizExposure={fingerprint,fresh,freshWords,practiceWords,select,inspect,policyVersion,windowMs,maxNormalExposures};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.QuizExposure;
})(typeof window!=='undefined'?window:globalThis);

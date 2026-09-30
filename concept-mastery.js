(function(root){
 'use strict';
 const DAY=86400000, names=['foundation','standard','challenge'];
 const normalize=s=>String(s??'').normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();
 function concept(a,m){
  if(a.conceptId)return String(a.conceptId);
  if(a.skill)return `skill:${a.skill}`;
  if(a.generator)return `generator:${a.generator}`;
  if(a.questionType)return `type:${a.questionType}`;
  return 'unit';
 }
 function fingerprint(a,m){
  // IDs may change on retry; rendered content plus passage identity is stable.
  const prompt=normalize(a.question||a.prompt);
  return prompt?`${m.passageId||a.passageId||''}|${prompt}|${normalize(a.correctAnswer??a.answer)}`:null;
 }
 function evaluate(reports,subject,context,now=Date.now()){
  const sessions=new Map();
  for(const r of reports||[]){
   const m=r.metadata||{},total=Number(r.totalQuestions),attempts=m.initialAttempts;
   const at=Number(r.createdAt||r.date||m.submittedAt);
   if(r.subject!==subject||m.context!==context||m.review||m.assessment||m.status==='draft'||!r.sessionId||!Number.isFinite(at)||at>now||at<=0||!Number.isInteger(total)||total<1||!Array.isArray(attempts)||attempts.length<total)continue;
   if(attempts.slice(0,total).some(a=>typeof a.correct!=='boolean'))continue;
   if(!sessions.has(r.sessionId)||at<sessions.get(r.sessionId).at)sessions.set(r.sessionId,{r,m,at,attempts:attempts.slice(0,total)});
  }
  const buckets=new Map();
  for(const session of [...sessions.values()].sort((a,b)=>a.at-b.at||String(a.r.sessionId).localeCompare(String(b.r.sessionId)))){
   const {m,at,r}=session, perSession=new Set();
   for(const a of session.attempts){
    const key=fingerprint(a,m);if(!key||perSession.has(key)||a.invalid||a.quarantined)continue;perSession.add(key);
    const id=concept(a,m);if(!buckets.has(id))buckets.set(id,{id,label:id==='unit'?'단원 전체 · 세부 개념 정보 없음':String(a.conceptLabel||a.skill||a.questionType||a.generator||id),seen:new Set(),fresh:[],checks:[],rank:0,lastChange:0,dueAt:0,retained:false,lastSession:null});
    const b=buckets.get(id),fresh=!b.seen.has(key);b.seen.add(key);
    const assisted=Boolean(a.assisted||a.hintUsed||a.translationUsed||m.hintUsed);
    if(assisted)continue;
    const entry={at,correct:a.correct,session:r.sessionId,band:m.adaptiveBandSnapshot||'foundation'};
    if(fresh)b.fresh.push(entry);
    b.checks.push({...entry,fresh});
   }
   for(const b of buckets.values()){
    const current=b.checks.filter(e=>e.session===r.sessionId);if(!current.length)continue;
    const score=current.filter(e=>e.correct).length/current.length;
    if(score<.6){b.retained=false;b.dueAt=at+DAY;}
    else if(score>=.8&&current.length>=3&&b.dueAt&&at>=b.dueAt&&b.lastSession!==r.sessionId){b.retained=true;b.dueAt=at+7*DAY;}
    else if(!b.dueAt)b.dueAt=at+DAY;
    const recent=b.fresh.filter(e=>e.at>b.lastChange).slice(-30);
    const days=new Set(recent.map(e=>new Date(e.at).toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'})));
    const count=recent.length,rate=count?recent.filter(e=>e.correct).length/count:0;
    // Weakness requires two different sessions; a single bad answer never demotes.
    const sessionIds=[...new Set(b.checks.map(e=>e.session))].slice(-2);
    const weak=sessionIds.length===2&&sessionIds.every(id=>{const xs=b.checks.filter(e=>e.session===id);return xs.length>=3&&xs.filter(e=>e.correct).length/xs.length<.6;});
    if(weak&&b.rank>0&&at>b.lastChange){b.rank--;b.lastChange=at;b.retained=false;}
    else if(count>=12&&days.size>=2&&rate>=.8&&b.retained&&b.rank<2&&recent.every(e=>names.indexOf(e.band)>=b.rank)){
     b.rank++;b.lastChange=at;b.retained=false;b.dueAt=at+3*DAY;
    }
    b.lastSession=r.sessionId;
   }
  }
  const concepts=[...buckets.values()].map(b=>({id:b.id,label:b.label,name:names[b.rank],samples:b.fresh.length,score:b.fresh.length?Math.round(100*b.fresh.filter(e=>e.correct).length/b.fresh.length):null,dueAt:b.dueAt,reviewDue:Boolean(b.dueAt&&b.dueAt<=now),retained:b.retained,status:b.rank===2&&b.retained?'retained':b.dueAt<=now?'review_due':b.fresh.length<12?'collecting':'learning'}));
  const rank=concepts.length?Math.min(...concepts.map(c=>names.indexOf(c.name))):0;
  const count=concepts.reduce((n,c)=>n+c.samples,0),score=count?Math.round(concepts.reduce((n,c)=>n+(c.score||0)*c.samples,0)/count):null;
  return {name:names[rank],score,samples:count,concepts,wrongRatio:rank===2?.2:.3,reason:!count?'새 문제의 첫 답안을 모으는 중이에요.':concepts.some(c=>c.reviewDue)?'복습할 시기예요. 새 문제 실력과 기억 유지 결과를 따로 확인해요.':'새 문제 12개 이상·서로 다른 날·지연 확인을 바탕으로 단계가 올라가요.'};
 }
 root.ConceptMastery={evaluate,fingerprint,concept,day:DAY};
})(typeof window!=='undefined'?window:globalThis);

(function(root){
 'use strict';
 const app=root.SmartStudy,api=app.WeeklyAssessment,baseBuild=api.buildAssessmentItems;
 const subjects=['reading','english','grammar','english_reading','math','math_formula','hanja'];
 const key=(subject,c)=>app.LearningPlan.contextKey(subject,c);
 const DAY=86400000;
 function boundaries(now){const local=new Date(now+9*3600000);const date=Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate())-9*3600000;return {start:date-((local.getUTCDay()+6)%7)*DAY,now};}
 function scopes(reports,subject,period='current',now=Date.now()){
  const {start}=boundaries(now), selected=[];
  for(const r of reports){
   const m=r.metadata||{},actual=m.source==='math-formula'?'math_formula':r.subject,at=Number(m.submittedAt||r.createdAt||r.date),attempts=m.initialAttempts||m.attempts||[];
   if(actual!==subject||m.assessment||m.status==='draft'||!r.sessionId||!(r.totalQuestions>0)||attempts.length<r.totalQuestions||attempts.slice(0,r.totalQuestions).some(a=>typeof a.correct!=='boolean')||!Number.isFinite(at)||at>now||at<start-28*DAY)continue;
   if(period==='current'?at<start:at>=start)continue;
   selected.push(r);
  }
  const groups=new Map();
  for(const r of selected.sort((a,b)=>Number(b.date)-Number(a.date))){
   const context=app.LearningPlan.contextOf(subject,r);if(!context)continue;
   const k=key(subject,context),g=groups.get(k)||{context,learnedWords:new Set(),seenKeys:new Set(),passageIds:new Set(),attempts:[]};
   for(const a of r.metadata.initialAttempts||r.metadata.attempts||[]){
    g.attempts.push(a);if(a.passageId)g.passageIds.add(a.passageId);
    if(subject==='english')for(const w of root.vocabData?.[context.unitId]||[])if([a.word,a.correctAnswer,a.question].some(x=>String(x||'').toLowerCase()===w.word.toLowerCase()))g.learnedWords.add(w.word.toLowerCase());
   }
   if(r.metadata.passageId)g.passageIds.add(r.metadata.passageId);groups.set(k,g);
  }
  return [...groups.values()];
 }
 function build(args){
  const {subject,scope,count=5}=args;
  if(!['grammar','english_reading','math_formula','hanja'].includes(subject))return baseBuild(args);
  const items=[],context=scope.context,seen=new Set();
  function add(question,choices,answer,explanation,extra={}){
   choices=(choices||[]).map(String);answer=String(answer??'');const fingerprint=`${question}|${answer}`;
   if(!question||!answer||choices.length<2||new Set(choices).size!==choices.length||choices.filter(c=>c===answer).length!==1||seen.has(fingerprint)||items.length>=count)return;
   seen.add(fingerprint);items.push({id:`${subject}:${key(subject,context)}:${fingerprint}`,subject,context,question,choices,answer,explanation:explanation||'',sourceType:'학습 범위 재확인',...extra});
  }
  if(subject==='grammar')for(const q of root.EnglishGrammarQuiz?.generate(context.unitId,count,'foundation')||[])add(q.question,q.choices,q.answer,q.explanation);
  if(subject==='english_reading')for(const p of (root.EnglishReadingData?.units||[]).find(u=>u.id===context.unitId)?.passages||[]){
   if(!scope.passageIds.has(p.id))continue;
   for(const q of p.questions||[])add(q.prompt,q.choices,q.choices[q.answerIndex],q.explanation,{passageId:p.id,passageTitle:p.title,passageLines:p.sentences,sourceType:'학습한 지문 재확인'});
  }
  if(subject==='math_formula'){
   const number=Number(context.unitId?.replace('formula-',''));
   if((root.MATH_FORMULAS||[]).some(f=>f.number===number))for(let i=0;i<6&&items.length<count;i++)for(const q of root.MathFormulaQuiz?.create(number)||[])add(q.prompt+(q.unit?` (단위: ${q.unit})`:""),q.choices,q.answer,q.solution,{sourceType:'학습 공식 계산 확인',unit:q.unit});
  }
  if(subject==='hanja'){
   const bank=root.vocabHanja?.[context.unitId]||[];
   for(const w of bank){
    if(!scope.attempts.some(a=>[a.hanja,a.word,a.question,a.correctAnswer].some(x=>String(x||'')===w.hanja)||String(a.question||'').includes(w.hanja)))continue;
    const answer=`${w.meaning} ${w.eum}`,others=[...new Set(bank.map(x=>`${x.meaning} ${x.eum}`))].filter(x=>x!==answer).slice(0,3);
    if(others.length===3)add(`${w.hanja}의 뜻과 음은?`,[answer,...others].sort(()=>Math.random()-.5),answer,`${w.hanja}: ${answer}`,{sourceType:'학습한 한자 뜻·음 재확인'});
   }
  }
  return {items,requestedCount:count,actualCount:items.length,shortfallReason:items.length<count?'학습 범위의 검증 문항이 부족합니다.':null};
 }
 function weekly(user,count=5,now=Date.now()){
  const reports=app.LocalRepository.listReports(user),groups={};count=Math.max(0,Math.floor(Number(count)||0));
  for(const subject of subjects){
   const items=[],seen=new Set(),quota={current:Math.ceil(count*.6),previous:Math.floor(count*.4)};
   for(const period of ['current','previous']){
    let collected=0;
    for(const scope of scopes(reports,subject,period,now)){
     const result=build({subject,scope,count:count+5});
     for(const q of result.items){
      const k=`${subject}:${key(subject,q.context)}:${q.passageId||''}:${q.question}:${q.answer}`;
      if(collected>=quota[period])break;if(seen.has(k))continue;seen.add(k);items.push({...q,period});collected++;
     }
     if(collected>=quota[period])break;
    }
   }
   groups[subject]={subject,items,requestedCount:count,actualCount:items.length,periodCounts:{current:items.filter(q=>q.period==='current').length,previous:items.filter(q=>q.period==='previous').length},shortfallReason:items.length<count?'이번 주 또는 이전 4주 학습 범위의 문항이 부족합니다. 다른 범위로 채우지 않았습니다.':null};
  }
  return groups;
 }
 Object.assign(api,{subjects,buildAssessmentItems:build,buildWeekly:weekly,weeklyScopes:scopes,boundaries});
})(window);

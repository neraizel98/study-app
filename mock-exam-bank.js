(function(root){
 'use strict';
 const app=root.SmartStudy=root.SmartStudy||{},DAY=86400000;
 const quotas=Object.freeze({reading:11,korean_vocab:4,english:4,grammar:4,english_reading:7,math:12,math_formula:3,hanja:10});
 const version='20261024-mock-transfer-v4';
 const normalize=value=>String(value??'').normalize('NFKC').toLowerCase().replace(/\s+/g,'').trim();
 // Choice order, case, and spacing are presentation, not a new question.
 function fingerprint(q){const lines=q.passageLines||q.passageText||q.sentences||[];return [q.subject,normalize(q.question||q.prompt),normalize(q.answer??q.correctAnswer),...(Array.isArray(lines)?lines:[lines]).map(normalize)].join('|');}
 function choiceKey(value){
  const text=normalize(value).replace(/\$/g,'');
  const fraction=text.match(/^(-?\d+)\/(\d+)([a-z%²³]*)$/)||text.match(/^\\frac\{(-?\d+)\}\{(\d+)\}([a-z%²³]*)$/);
  if(fraction&&Number(fraction[2])!==0)return `number:${Number(fraction[1])/Number(fraction[2])}:${fraction[3]}`;
  const decimal=text.match(/^(-?\d+(?:\.\d+)?)([a-z%²³]*)$/);
  return decimal?`number:${Number(decimal[1])}:${decimal[2]}`:text;
 }
 function valid(q){return Boolean(q&&q.question&&!/아직 개발 중|임시 문제/.test(q.question)&&Array.isArray(q.choices)&&q.choices.length>=2&&q.choices.every(c=>typeof c==='string'&&c.trim())&&new Set(q.choices.map(choiceKey)).size===q.choices.length&&q.choices.filter(c=>c===q.answer).length===1);}
 // Typed answers compare values, so 4/9, $rac{4}{9}$km and 0.444… style units do not matter.
 function writtenKey(value){
  const text=normalize(value).replace(/\$/g,'').replace(/^([^가-힣]*?)[가-힣]+$/,'$1'),key=choiceKey(text);
  return key.startsWith('number:')?key.split(':').slice(0,2).join(':'):key;
 }
 function grade(q,response){
  if(q?.kind==='written'){
   if(response===undefined||response===null||String(response).trim()==='')return {correct:false,status:'unanswered',answer:q.answer};
   const correct=writtenKey(response)===writtenKey(q.answer);return {correct,status:correct?'correct':'wrong',answer:q.answer};
  }
  if(!valid(q))return {correct:false,status:'invalid',answer:q?.answer??null};
  if(response===undefined||response===null||response==='')return {correct:false,status:'unanswered',answer:q.answer};
  if(typeof response!=='string'||!q.choices.includes(response))return {correct:false,status:'invalid',answer:q.answer};
  const correct=response===q.answer;return {correct,status:correct?'correct':'wrong',answer:q.answer};
 }
 const CAPS=Object.freeze({math:{unit:5,concept:2},math_formula:{unit:2,concept:1},grammar:{unit:2},hanja:{unit:5}});
 const MIX=Object.freeze({math:{challenge:.1,standard:.3},hanja:{challenge:.1,standard:.4}});
 const WRITTEN_MATH=2;
 // Comparisons and "choose the formula" items need their options; numeric results can be typed.
 const writable=q=>!/ 중 |더 큰|더 작은|고르|알맞은 것/.test(q.question)&&writtenKey(q.answer).startsWith('number:');
 function hash(value){let result=2166136261;for(const ch of value){result^=ch.charCodeAt(0);result=Math.imul(result,16777619);}return result>>>0;}
 function random(seed){let state=hash(seed)||1;return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};}
 function shuffle(values,rng){const copy=[...values];for(let i=copy.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
 function contextOf(subject,r){
  const m=r.metadata||{},existing=app.LearningPlan?.contextOf(subject,r);if(existing)return existing;
  if(subject==='grammar'&&m.stageId&&m.unitId)return {levelId:m.stageId,unitId:m.unitId,title:m.unitTitle||''};
  if(subject==='math_formula'&&(m.formulaNumber||/^formula-\d+$/.test(m.unitId||'')))return {levelId:'formula',unitId:m.unitId||`formula-${m.formulaNumber}`,title:m.formulaTitle||''};
  if(subject==='hanja'&&m.unitId)return {unitId:m.unitId,title:m.unitTitle||''};
  return null;
 }
 function learnedScopes(reports,now){
  const groups=new Map(),unique=new Map();
  for(const r of reports){
   if(!r||typeof r!=='object')continue;
   const m=r.metadata||{},subject=m.source==='math-formula'?'math_formula':r.subject,at=Number(m.submittedAt||r.createdAt||r.date),total=Number(r.totalQuestions),attempts=m.initialAttempts||m.attempts||[];
   if(!quotas[subject]||!r.sessionId||m.assessment||m.assessmentId||m.mockExam||m.examTraining||m.review||m.status==='draft'||m.status==='partial'||!Number.isInteger(total)||total<1||!Array.isArray(attempts)||attempts.length<total||attempts.slice(0,total).some(a=>!a||typeof a.correct!=='boolean')||!Number.isFinite(at)||at>now||at<now-21*DAY)continue;
   const c=contextOf(subject,r);if(!c)continue;
   const sessionKey=`${subject}:${r.sessionId}`;const entry={r,subject,at,context:c,attempts:attempts.slice(0,total)};
   if(!unique.has(sessionKey)||Number(r.updatedAt||r.date)>Number(unique.get(sessionKey).r.updatedAt||unique.get(sessionKey).r.date))unique.set(sessionKey,entry);
  }
  for(const e of [...unique.values()].sort((a,b)=>b.at-a.at)){
   const key=[e.subject,e.context.levelId||'',e.context.semesterId||'',e.context.unitId].join(':');
   const g=groups.get(key)||{subject:e.subject,context:e.context,attempts:[],reportIds:[],passageIds:new Set(),lastAt:e.at};
   g.attempts.push(...e.attempts);g.reportIds.push(e.r.sessionId);
   if(e.r.metadata?.passageId)g.passageIds.add(e.r.metadata.passageId);
   for(const a of e.attempts)if(a.passageId)g.passageIds.add(a.passageId);
   groups.set(key,g);
  }
  return [...groups.values()];
 }
 function core(subject,question,answer){return [subject,normalize(question).replace(/\$/g,''),normalize(answer).replace(/\$/g,'')].join('|');}
 function recentQuestions(reports,now,strict=false){
  const seen=new Set(),ids=new Set(),cores=new Set(),passageIds=new Set();
  for(const r of reports){if(!r||typeof r!=='object')continue;const at=Number(r.metadata?.submittedAt||r.createdAt||r.date);if(!Number.isFinite(at)||at>now||(!strict&&at<now-14*DAY))continue;
   const attempts=r.metadata?.initialAttempts||r.metadata?.attempts||[],questions=r.metadata?.questions||r.metadata?.questionSnapshot||[];
   for(const a of Array.isArray(attempts)?attempts:[]){if(!a)continue;const subject=a.subject||a.assessmentSubject||(r.metadata?.source==='math-formula'?'math_formula':r.subject);seen.add(fingerprint({...a,subject,answer:a.correctAnswer??a.answer}));cores.add(core(subject,a.question||a.prompt,a.correctAnswer??a.answer));if(a.fingerprint)seen.add(a.fingerprint);if(a.passageId)passageIds.add(String(a.passageId));if(a.questionId)ids.add(String(a.questionId));}
   for(const q of Array.isArray(questions)?questions:[]){if(!q)continue;seen.add(fingerprint(q));cores.add(core(q.subject,q.question||q.prompt,q.answer??q.correctAnswer));if(q.fingerprint)seen.add(q.fingerprint);if(q.passageId)passageIds.add(String(q.passageId));if(q.id)ids.add(String(q.id));}
  }
  return {seen,ids,cores,passageIds};
 }
 const skillOf=skill=>/중심|주제|제목/.test(skill||'')?'main':/내용 확인|정보 확인|사실/.test(skill||'')?'fact':/근거|주장/.test(skill||'')?'evidence':/추론|관점|심리|의미|평가|갈등|태도|정서|화자|상징|비유|표현|시점/.test(skill||'')?'inference':/구조|전개|역할|기능|설명 방식/.test(skill||'')?'structure':null;
 const q=(skill,question,answer,wrong,explanation)=>({skill,question,answer,choices:[answer,...wrong],explanation});
 // All passages below are newly authored educational fiction/exposition.
 // They assess an evidenced reading skill; they do not expand a unit's factual syllabus.
 const koreanPassages=[
  {id:'mock-library-box',title:'반납함을 옮긴 까닭',lines:['학교 도서관의 책 반납함은 문 안쪽에 있었다.','수업이 끝난 뒤 도서관 문이 잠기면 학생들은 책을 돌려줄 수 없었다.','사서는 반납함을 복도에 두자고 제안했다.','그러나 비상 통로를 막지 않도록 벽 안쪽의 빈 공간을 먼저 확인했다.','반납함을 옮긴 뒤 학생들은 문이 잠긴 시간에도 책을 반납할 수 있었다.','이 변화는 이용자의 불편을 줄이면서 안전도 고려한 결과였다.'],questions:[q('main','이 글의 중심 내용은?','안전을 고려한 반납함 이동으로 이용자의 불편을 줄였다.',['도서관 문이 잠기는 시간을 늦추어 반납의 불편을 줄였다.','사서는 비상 통로 앞 복도로 반납함을 옮기자고 제안했다.','반납함을 문 안쪽에 두어 책을 더 안전하게 보관했다.'],'마지막 문장이 편의와 안전을 함께 정리한다.'),q('fact','반납함을 옮기기 전에 확인한 것은?','비상 통로를 막지 않는 빈 공간',['문이 잠기는 시간과 반납 권수','복도를 지나는 학생들의 수','반납함이 들어갈 도서관 문 안쪽 공간'],'4행에 안전한 위치를 확인했다고 나온다.'),q('evidence','기존 반납함의 불편을 직접 보여 주는 내용은?','문이 잠기면 책을 돌려줄 수 없었다.',['사서는 반납함을 복도에 두자고 제안했다.','비상 통로를 막지 않을 빈 공간을 확인했다.','반납함은 도서관 문 안쪽에 있었다.'],'2행이 기존 위치의 문제를 직접 제시한다.'),q('inference','사서의 결정에서 알 수 있는 태도는?','편의를 개선할 때 안전 조건도 살핀다.',['안전을 위해 이용자의 불편은 참게 한다.','학생들이 요청할 때만 위치를 바꾼다.','반납함 위치는 사서 혼자 정해야 한다.'],'제안에 이어 비상 통로를 확인한 행동이 근거이다.'),q('structure','마지막 문장은 어떤 역할을 하는가?','앞의 변화가 지닌 의미를 정리한다.',['변화 뒤에 생긴 새 문제를 제시한다.','반납함을 옮긴 과정을 차례로 나열한다.','사서가 제안한 까닭을 처음 밝힌다.'],'편의와 안전이라는 결과를 종합한다.')]},
  {id:'mock-rain-record',title:'비 오는 날의 기록',lines:['지우는 비가 오는 날마다 교실 앞 신발장 바닥이 젖는다고 생각했다.','확인하기 위해 일주일 동안 날씨와 바닥 상태를 함께 적었다.','비가 온 세 날 중 우산을 입구에서 접은 두 날은 바닥이 많이 젖었다.','다른 한 날에는 우산을 밖에서 털고 들어왔고 바닥이 거의 젖지 않았다.','지우는 비 자체뿐 아니라 우산을 다루는 방법도 영향을 줄 수 있다고 말했다.','친구들은 다음 비 오는 날에도 같은 방법으로 기록을 이어 가기로 했다.'],questions:[q('main','이 글의 중심 내용은?','기록을 통해 젖은 바닥의 원인을 살피고 추가 확인을 계획했다.',['일주일의 기록으로 바닥이 젖는 원인이 우산임을 확정했다.','비가 오는 날에는 신발장 바닥이 젖는다는 생각이 옳았다.','우산을 입구에서 접으면 바닥이 덜 젖는다는 사실을 새로 알아냈다.'],'관찰 결과와 추가 확인 계획을 함께 포괄한다.'),q('fact','바닥이 거의 젖지 않은 날 학생들이 한 행동은?','우산을 밖에서 털고 들어왔다.',['우산을 입구에서 접고 들어왔다.','신발장 바닥을 미리 닦아 두었다.','우산을 교실 밖에 두고 들어왔다.'],'4행에 직접 제시되어 있다.'),q('evidence','우산을 다루는 방법도 영향을 줄 수 있다는 근거는?','우산을 밖에서 턴 날은 바닥이 거의 젖지 않았다.',['비가 온 날마다 신발장 바닥이 젖는다고 생각했다.','일주일 동안 날씨와 바닥 상태를 함께 적었다.','다음 비 오는 날에도 기록을 이어 가기로 했다.'],'같은 비 오는 날에도 행동에 따라 바닥 상태가 달랐다.'),q('inference','추가로 기록하려는 이유로 가장 적절한 것은?','관찰한 결과가 다른 날에도 나타나는지 확인하려고',['비가 온 날의 수를 더 정확하게 세어 보려고','우산을 입구에서 접는 방법이 낫다는 것을 보이려고','지우의 처음 생각이 맞았다는 것을 확정하려고'],'관찰은 제한된 기간이므로 다음 날의 확인이 필요하다.'),q('structure','2~4행의 전개 방식은?','관찰 방법과 비교 결과를 제시한다.',['문제의 원인과 해결책을 차례로 제시한다.','지우의 생각과 친구들의 반론을 대비한다.','날짜 순서에 따라 날씨 변화를 나열한다.'],'날씨·바닥을 기록한 방법과 상황별 결과를 설명한다.')]},
  {id:'mock-poster',title:'두 장의 안내문',lines:['학급은 물을 아끼자는 안내문 두 장을 만들었다.','첫 안내문에는 물을 아끼자는 말만 크게 적었다.','둘째 안내문에는 양치할 때 컵을 쓰고 수도꼭지를 잠그라는 행동을 적었다.','친구들은 둘째 안내문을 보면 무엇을 해야 할지 바로 알 수 있다고 말했다.','학급은 두 안내문을 번갈아 붙이고 실제 행동도 살펴보기로 했다.','좋은 안내는 목적을 전하는 데 더해 실천 방법을 알려 주어야 한다.'],questions:[q('main','글쓴이가 강조하는 좋은 안내의 조건은?','목적과 구체적인 실천 방법을 함께 알린다.',['물을 아끼자는 목적을 크고 분명하게 알린다.','목적보다 실천 방법 한 가지를 짧게 알린다.','친구들이 직접 만든 문장으로 목적을 알린다.'],'마지막 문장이 목적과 실천 방법을 함께 강조한다.'),q('fact','둘째 안내문에 적은 행동은?','양치할 때 컵을 쓰고 수도꼭지를 잠근다.',['물을 아끼자는 말을 크게 적어 붙인다.','양치할 때 컵을 쓰고 물을 받아 둔다.','세수할 때 수도꼭지를 잠그고 물을 받는다.'],'3행에 행동 두 가지가 제시된다.'),q('evidence','둘째 안내문이 이해하기 쉽다는 근거는?','친구들이 무엇을 해야 할지 바로 알 수 있다고 말했다.',['첫 안내문에는 물을 아끼자는 말만 크게 적었다.','학급은 두 안내문을 번갈아 붙이고 실제 행동도 살펴보기로 했다.','학급은 물을 아끼자는 안내문 두 장을 만들었다.'],'4행이 안내를 읽은 친구들의 반응을 직접 제시한다.'),q('inference','두 안내문을 번갈아 붙이며 행동을 보는 까닭은?','안내 방식이 실천에 어떤 영향을 주는지 살피려고',['친구들이 어느 안내문을 더 좋아하는지 물어보려고','두 안내문 중 더 눈에 띄는 위치를 찾으려고','첫 안내문이 더 효과적이라는 것을 증명하려고'],'5행은 안내 방식의 효과를 실제 행동으로 확인하는 계획이다.'),q('structure','첫째와 둘째 안내문을 함께 설명한 방식은?','두 대상의 차이를 비교한다.',['한 대상의 변화 과정을 나열한다.','문제와 해결 방법을 차례로 제시한다.','두 대상의 공통점을 묶어 설명한다.'],'1~4행이 목적만 있는 안내와 행동을 제시한 안내를 대비한다.')]},
  {id:'mock-paper-bridge',title:'종이 다리를 만드는 팀',lines:['민호의 팀은 종이 한 장으로 장난감 자동차를 받칠 다리를 만들었다.','처음에는 종이를 평평하게 놓았지만 자동차를 올리자 가운데가 처졌다.','민호는 실패한 종이를 버리려 했고 유나는 종이를 접어 보자고 제안했다.','팀은 같은 종이를 여러 번 접어 다시 양쪽 받침 위에 올렸다.','이번에는 자동차를 올려도 다리가 곧바로 처지지 않았다.','민호는 실패한 결과도 다음 방법을 찾는 단서가 된다는 것을 깨달았다.'],questions:[q('main','이 이야기의 주제로 가장 적절한 것은?','실패를 살피고 방법을 바꾸면 새로운 해결책을 찾을 수 있다.',['종이를 접어서 쓰면 평평한 종이보다 무거운 물건을 더 잘 받친다.','친구의 제안을 따르면 어떤 실험이든 성공할 수 있다.','실패한 재료는 버리고 새 재료로 다시 시작해야 한다.'],'처음 실패 뒤 같은 재료를 접어 개선한 사건과 깨달음이 근거이다.'),q('fact','팀이 두 번째 시도에서 바꾼 것은?','같은 종이를 여러 번 접었다.',['새 종이를 받아 평평하게 놓았다.','받침 사이의 거리를 더 좁혔다.','종이 두 장을 겹쳐서 올렸다.'],'4행에 직접 제시되어 있다.'),q('evidence','두 번째 시도의 결과를 보여 주는 문장은?','자동차를 올려도 다리가 곧바로 처지지 않았다.',['자동차를 올리자 다리의 가운데가 처졌다.','같은 종이를 여러 번 접어 받침 위에 올렸다.','유나는 종이를 접어 보자고 제안했다.'],'5행은 변화 뒤에 관찰한 결과이다.'),q('inference','마지막에 민호의 생각은 어떻게 달라졌는가?','실패를 버릴 대상으로만 보던 데서 개선의 단서로 보게 되었다.',['유나의 제안을 의심하던 데서 친구의 생각을 믿게 되었다.','평평한 종이가 더 튼튼하다고 보던 생각을 끝까지 지켰다.','종이 다리는 만들기 어렵다고 보던 데서 쉽다고 여기게 되었다.'],'3행의 버리려던 행동과 6행의 깨달음을 연결한다.'),q('structure','2행과 5행을 함께 제시한 효과는?','방법을 바꾸기 전과 후의 결과를 비교하게 한다.',['실패한 원인이 자동차의 무게임을 밝혀 준다.','민호와 유나의 의견이 어떻게 달랐는지 보여 준다.','다리를 만드는 과정을 순서대로 설명해 준다.'],'평평한 종이와 접은 종이의 결과를 대비한다.')]}
 ];
 const englishPassages=[
  {id:'mock-moon-picture',sourcePassageId:'er1-p0',title:'Two Moon Pictures',lines:['Jin looks at two pictures of the moon.','The first picture shows a thin curve.','The second picture shows a wider bright part.','Jin draws the two shapes in his notebook.','He learns that the pictures show a change in the moon.'],questions:[q('fact','What does Jin look at?','Two pictures of the moon',['Three pictures of the moon','Two pictures of the sun','The notebook of a friend'],'첫 문장에 달 사진 두 장을 본다고 나온다.'),q('main','What is the passage mainly about?','Jin compares two moon shapes.',['Jin draws a thin curve only.','Jin takes two moon pictures.','The moon stops changing its shape.'],'서로 다른 달 모양을 보고 기록하는 내용이다.'),q('reference','Who does “He” in sentence 5 refer to?','Jin',['the moon','the notebook','the first picture'],'앞 문장에서 그림을 그린 사람 Jin을 가리킨다.'),q('evidence','Which sentence shows that Jin keeps a record?','Sentence 4',['Sentence 1','Sentence 2','Sentence 3'],'4문장의 공책 그림이 기록의 근거이다.')]},
  {id:'mock-moon-observe',sourcePassageId:'er1-p0',title:'A Bright Part',lines:['Sora draws the moon on Monday.','The moon looks like a thin curve.','Three nights later, she looks at the moon again.','The bright part is wider, so she draws a new shape.','Her notebook shows the change over time.'],questions:[q('fact','When does Sora first draw the moon?','On Monday',['On Thursday','On Sunday','Every night'],'첫 문장에 Monday라고 제시한다.'),q('main','What does the notebook show?','A change in the moon over time',['A thin curve drawn on Monday','A moon shape that never changes','The days Sora goes to school'],'마지막 문장이 공책 기록의 의미를 정리한다.'),q('reference','Who does “she” in sentence 3 refer to?','Sora',['Monday','the moon','the bright part'],'앞 두 문장의 주인공 Sora를 가리킨다.'),q('evidence','Which sentence shows a different moon shape?','Sentence 4',['Sentence 1','Sentence 2','Sentence 3'],'4문장에서 밝은 부분이 더 넓어져 새 모양을 그린다.')]}
 ];
 function build(user,now=Date.now(),options={}){
  const strict=options.profile!=='legacy',buildVersion=strict?version:'20261019-mock-bank-v3';
  now=Number(now);if(!Number.isFinite(now))now=Date.now();
  const reports=(app.LocalRepository?.listReports(user)||[]).filter(r=>(!r.userId||r.userId===user)&&(!r.learnerId||r.learnerId===user)),scopes=learnedScopes(reports,now);
  const history=[...reports];
  if(strict)for(const week of app.LocalRepository?.getPreference?.(`SmartStudy_MockExam_Index_${encodeURIComponent(user)}`,[])||[]){
   const draft=app.LocalRepository.getPreference(`SmartStudy_MockExam_${encodeURIComponent(user)}_${week}`,null);
   if(draft?.userId===user&&draft.questions?.length)history.push({date:draft.startedAt||now,metadata:{questions:draft.questions}});
  }
  const recent=recentQuestions(history,now,strict);
  const rng=random(`${user}:${Math.floor((now+9*3600000)/DAY)}:${buildVersion}`),pools=Object.fromEntries(Object.keys(quotas).map(s=>[s,[]])),used=new Set(),meta=new Map();
  function generated(factory){const previous=root.Math.random;root.Math.random=rng;try{return factory();}finally{root.Math.random=previous;}}
  function add(g,item){
   const candidate={...item,subject:g.subject,context:{...g.context},kind:'choice',choices:(item.choices||[]).map(String),answer:String(item.answer??''),explanation:item.explanation||'',evidenceReportIds:[...g.reportIds],sourceType:item.sourceType||'학습 범위의 검증 문항',repeated:Boolean(item.repeated),difficulty:item.difficulty||'basic',noveltyKind:item.noveltyKind||(item.repeated?'reexposure':'recall'),cognitiveDemand:item.cognitiveDemand||'recall'};
   if(strict&&(candidate.repeated||candidate.passageId&&recent.passageIds.has(String(candidate.passageId))))return;
   if(!valid(candidate))return;
   const fp=fingerprint(candidate);candidate.id=`mock:${g.subject}:${hash(fp).toString(36)}`;
   if(strict&&recent.cores.has(core(candidate.subject,candidate.question,candidate.answer)))return;
   if(used.has(fp)||recent.seen.has(fp)||recent.ids.has(candidate.id)||candidate.sourceQuestionId&&recent.ids.has(String(candidate.sourceQuestionId)))return;
   candidate.fingerprint=fp;candidate.choices=shuffle(candidate.choices,rng);used.add(fp);pools[g.subject].push(candidate);
   meta.set(candidate,{recency:g.lastAt||0,unit:[g.subject,g.context.levelId||'',g.context.semesterId||'',g.context.unitId||''].join(':')});
  }
  for(const g of scopes){
   const attempts=g.attempts,c=g.context;
   if(strict&&g.subject==='reading'){
    const grade=root.KoreanReadingCurriculum?.gradeOfUnit(c.unitId)||7;
    const skills=new Set(attempts.map(a=>{const p=(root.ReadingPassages||[]).find(p=>p.unitId===c.unitId&&(p.levelId||'level1')===(c.levelId||'level1')&&g.passageIds.has(p.id));const original=p?.questions?.find(q=>q.id===a.questionId||normalize(q.question)===normalize(a.question));return skillOf(a.skill||original?.skill);}).filter(Boolean));
    // Locating a stated fact is a prerequisite of the evidenced higher-order reading skills, not a new syllabus topic.
    if(skills.size)skills.add('fact');
    for(const p of root.MockKoreanTransfer||[])if(p.grade===grade)for(const item of p.questions)if(skills.has(item.skill))add(g,{...item,passageId:p.id,passageTitle:p.title,passageLines:p.lines,sourceQuestionId:item.id,conceptId:`reading:${item.skill}`,templateFamily:`new-reading:${p.id}:${item.skill}`,noveltyKind:'new-passage',cognitiveDemand:item.cognitiveDemand||(item.difficulty==='challenge'?'reasoning':'application'),sourceType:'모의고사 전용 새 지문 · 배운 읽기 기능 적용'});
    continue;
   }
   if(strict&&g.subject==='english_reading'){
    const unit=root.EnglishReadingData?.units?.find(u=>u.id===c.unitId&&(u.gradeId||'grade6')===(c.levelId||'grade6'));
    const skills=new Set();for(const p of unit?.passages||[])if(g.passageIds.has(p.id))for(const a of attempts){const q=p.questions.find(q=>q.id===a.questionId||normalize(q.prompt)===normalize(a.question));if(q)skills.add(q.type);}
    for(const p of root.MockEnglishTransfer||[])if(p.gradeId===(c.levelId||'grade6'))for(const item of p.questions)if(skills.has(item.skill))add(g,{...item,passageId:p.id,passageTitle:p.title,passageLines:p.lines,glossary:p.glossary||[],sourceQuestionId:item.id,conceptId:item.skill,templateFamily:`new-reading:${p.id}:${item.skill}`,noveltyKind:'new-passage',cognitiveDemand:item.cognitiveDemand||(item.difficulty==='challenge'?'reasoning':'application'),sourceType:'모의고사 전용 새 영어 지문 · 배운 독해 기능 적용'});
    continue;
   }
   if(strict&&g.subject==='math'){for(const item of root.MockMathTransfer?.create(g,rng)||[])add(g,item);continue;}
   if(strict&&g.subject==='math_formula'){for(const item of generated(()=>root.MockMathTransfer?.createFormula(g,rng))||[])add(g,item);continue;}
   if(g.subject==='reading'){
    const currentCourse=root.KoreanReadingCurriculum&&[...g.passageIds].some(id=>root.KoreanReadingCurriculum.isCurrentPassageId(id));
    const learnedSkills=new Set();
    for(const a of attempts){const p=(root.ReadingPassages||[]).find(p=>p.unitId===c.unitId&&(p.levelId||'level1')===(c.levelId||'level1')&&(g.passageIds.has(p.id)||(p.questions||[]).some(q=>q.id===a.questionId)));const original=p?.questions?.find(q=>q.id===a.questionId||normalize(q.question)===normalize(a.question));const skill=skillOf(a.skill||original?.skill);if(p&&original&&skill)learnedSkills.add(skill);}
    for(const p of shuffle([...koreanPassages,...root.MockReadingContent?.korean||[]],rng))for(const [index,item] of p.questions.entries())if(!currentCourse&&learnedSkills.has(item.skill))add(g,{...item,passageId:p.id,passageTitle:p.title,passageLines:p.lines,sourceQuestionId:`${p.id}:${index}`,sourceType:'자체 제작 새 지문 · 학습한 읽기 기능',conceptId:`reading:${item.skill}`,source:{kind:'original',note:'스마트 스터디 자체 제작'}});
    for(const p of root.ReadingPassages||[])if(p.unitId===c.unitId&&(p.levelId||'level1')===(c.levelId||'level1')&&g.passageIds.has(p.id)&&(!currentCourse||root.KoreanReadingCurriculum.isCurrentPassageId(p.id)))for(const item of p.questions||[])if(learnedSkills.has(skillOf(item.skill)))add(g,{...item,sourceQuestionId:item.id,explanation:item.evidence,passageId:p.id,passageLines:p.lines,passageTitle:p.title,repeated:true,sourceType:'학습한 지문 재확인'});
   }
   if(g.subject==='english'){
    const bank=root.vocabData?.[c.unitId]||[],learned=bank.filter(w=>attempts.some(a=>[a.word,a.correctAnswer,a.question].some(v=>normalize(v)===normalize(w.word))));
    for(const w of learned){const distractors=bank.filter(other=>normalize(other.word)!==normalize(w.word)&&normalize(other.meaning)!==normalize(w.meaning)&&!(w.altWords||[]).includes(other.word)).map(other=>other.word);if(new Set(distractors.map(normalize)).size<3)continue;
     add(g,{question:`“${w.meaning}”의 뜻을 가진 영어 단어는?`,choices:[w.word,...shuffle([...new Set(distractors)],rng).slice(0,3)],answer:w.word,explanation:`${w.word}: ${w.meaning}`,conceptId:`word:${w.word}`,sourceType:'학습한 단어 뜻 확인'});
     const expression=new RegExp(`\\b${w.word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'i'),sentence=String(w.ex||'');if(expression.test(sentence))add(g,{question:`${sentence.replace(expression,'_____')} (뜻: ${w.meaning})`,choices:[w.word,...shuffle([...new Set(distractors)],rng).slice(0,3)],answer:w.word,explanation:sentence,conceptId:`word:${w.word}`,repeated:true,sourceType:'학습한 예문 빈칸 재확인'});
    }
   }
   if(g.subject==='grammar'){
    const unit=root.EnglishGrammarData?.[c.levelId]?.units?.find(u=>u.id===c.unitId);const lessons=new Set();
    for(const [index,lesson] of (unit?.lessons||[]).entries())if(attempts.some(a=>Number.isInteger(a.lessonIndex)&&a.lessonIndex===index||(lesson.examples||[]).some(pair=>pair.some(part=>[a.answer,a.correctAnswer,a.question].some(v=>normalize(v)&&normalize(part)&&(normalize(v)===normalize(part)||normalize(v).includes(normalize(part))))))))lessons.add(index);
    for(const [index,lesson] of (unit?.lessons||[]).entries())if(attempts.some(a=>[lesson.title,lesson.principle].some(rule=>rule&&rule.length>8&&normalize(a.explanation).includes(normalize(rule)))))lessons.add(index);
    if(strict){for(const item of root.MockGrammarTransfer||[])if(item.stageId===c.levelId&&item.unitId===c.unitId&&lessons.has(item.lessonIndex))add(g,{...item,templateFamily:`grammar:${c.levelId}:${c.unitId}:${item.lessonIndex}:${item.noveltyKind}`,conceptId:`lesson:${item.lessonIndex}`,cognitiveDemand:item.cognitiveDemand||(item.difficulty==='challenge'?'reasoning':'application'),sourceQuestionId:item.id,sourceType:'새 상황 문법 적용 · 오류 분석'});continue;}
    const learnedAnswers=new Set(attempts.map(a=>normalize(a.correctAnswer??a.answer)));
    for(const item of generated(()=>root.EnglishGrammarQuiz?.generate(c.unitId,250,'foundation'))||[]){
     const exact=attempts.some(a=>normalize(a.question)===normalize(item.question));
     const lessonMatch=[...lessons].some(i=>(unit.lessons[i].examples||[]).some(pair=>pair.some(part=>normalize(item.question).includes(normalize(part))||normalize(item.answer)===normalize(part))));
     // Closed be-verb substitution is one evidenced concept, not every lesson in e2.
     const beMatch=c.unitId==='e2'&&['am','is','are'].some(v=>learnedAnswers.has(v))&&['am','is','are'].includes(item.answer)&&item.question.includes('___');
     if(exact||lessonMatch||beMatch)add(g,{...item,repeated:true,sourceType:'학습한 문법 개념 재확인',conceptId:lessonMatch?`lesson:${[...lessons].find(i=>(unit.lessons[i].examples||[]).some(pair=>pair.some(part=>normalize(item.question).includes(normalize(part))||normalize(item.answer)===normalize(part))))}`:'evidenced-question'});
    }
    if(c.unitId==='e2'&&['am','is','are'].some(v=>learnedAnswers.has(v)))for(const item of [q('be','My sister ___ at school.','is',['am','are','be'],'단수 주어 my sister에는 is를 쓴다.'),q('be','You ___ my friend.','are',['am','is','be'],'you에는 are를 쓴다.'),q('be','I ___ ready for class.','am',['is','are','be'],'I에는 am을 쓴다.'),q('be','The two books ___ on the desk.','are',['am','is','be'],'복수 주어 the two books에는 are를 쓴다.')])add(g,{...item,conceptId:'be-present',sourceType:'학습한 be동사 개념의 새 예문'});
   }
   if(g.subject==='korean_vocab'){
    // 학습한 낱말만 출제한다. 같은 낱말이라도 아직 풀지 않은 유형은 새 문항으로 본다.
    const vocab=root.KoreanVocabData,quiz=root.KoreanVocabQuiz,level=vocab?.levels?.[c.levelId];
    if(vocab&&quiz&&level){
     const levelPool=level.units.flatMap(u=>u.words.map(w=>({...w,levelId:level.id,unitId:u.id,unitTitle:u.title})));
     const seenTypes=new Map();for(const a of attempts){const id=a.wordId||a.wrongNoteId;if(id)seenTypes.set(id,new Set([...(seenTypes.get(id)||[]),a.type]));}
     for(const word of levelPool.filter(w=>seenTypes.has(w.id)))for(const type of quiz.available(word)){
      const item=quiz.question(word,type,levelPool,rng);if(!item)continue;
      add(g,{question:item.question,choices:item.choices,answer:item.answer,explanation:item.explanation,passageTitle:item.passage?.title||'',passageLines:item.passage?.lines||undefined,
       noveltyKind:'recall',cognitiveDemand:'recall',conceptId:`vocab:${word.id}`,wordId:word.id,questionType:type,repeated:seenTypes.get(word.id).has(type),sourceType:'학습한 어휘 확인',difficulty:level.id==='level2'?'standard':'basic'});
     }
    }
   }
   if(g.subject==='english_reading'){
    const unit=root.EnglishReadingData?.units?.find(u=>u.id===c.unitId&&(u.gradeId||'grade6')===(c.levelId||'grade6'));
    for(const p of unit?.passages||[]){if(!g.passageIds.has(p.id))continue;
     const skills=new Set(attempts.map(a=>p.questions.find(q=>q.id===a.questionId||normalize(q.prompt)===normalize(a.question))?.type).filter(Boolean));
     for(const variant of [...englishPassages,...root.MockReadingContent?.english||[]].filter(v=>v.sourcePassageId===p.id)){
      const words=[...(p.vocabulary||[]).map(w=>normalize(w.word)),...(p.sentences||[]).map(normalize)];
      if(!(variant.requiredVocabulary||[]).every(word=>words.some(known=>known.includes(normalize(word)))))continue;
      for(const item of variant.questions)if(skills.has(item.skill))add(g,{...item,passageId:variant.id,passageTitle:variant.title,passageLines:variant.lines,sourcePassageId:p.id,sourceGrammarTags:[...p.grammarTags||[]],sourceVocabulary:[...variant.requiredVocabulary||[]],conceptId:item.skill,sourceType:'자체 제작 새 지문 · 학습한 독해 기능',source:{kind:'original',note:'스마트 스터디 자체 제작'}});
     }
     for(const item of p.questions||[])if(skills.has(item.type))add(g,{question:item.prompt,choices:item.choices,answer:item.choices[item.answerIndex],explanation:item.explanation,sourceQuestionId:item.id,conceptId:item.type,passageId:p.id,passageTitle:p.title,passageLines:p.sentences,repeated:true,sourceType:'학습한 영어 지문 재확인'});
    }
   }
   if(g.subject==='math'){
    const source=root.MathQuizData?.[c.unitId]||{},templates=[...source.basic||[],...source.advanced||[],...source.word||[]];
    const tiers=new Map([...(source.basic||[]).map(t=>[t,'basic']),...(source.word||[]).map(t=>[t,'standard']),...(source.advanced||[]).map(t=>[t,'challenge'])]);
    // The legacy generic word generator draws several unrelated concepts.
    // Its name alone does not prove which concept the child actually learned.
    const generators=new Set(attempts.map(a=>a.generator).filter(value=>value&&value!=='math_word_problem'));
    const distinct=new Map();for(const t of templates){if(t.generator&&generators.has(t.generator))distinct.set(`g:${t.generator}`,t);else if(!t.generator&&attempts.some(a=>normalize(a.question)===normalize(t.question)))distinct.set(`q:${normalize(t.question)}`,t);}
    for(const [key,t] of distinct)for(let index=0;index<(t.generator?6:1);index++)try{const item=generated(()=>root.Utils?.generateMathQuiz(t));if(!item||!Number.isInteger(Number(item.answer))||item.choices?.[Number(item.answer)]===undefined)continue;add(g,{...item,answer:String(item.choices[Number(item.answer)]),generator:t.generator,conceptId:key,difficulty:tiers.get(t)||'basic',sourceType:t.generator?'학습한 계산 유형 · 숫자 변형 재연습':'학습한 계산 문항 재확인',repeated:true});}catch(_){/* An unsupported generator is a shortage, not permission to expand scope. */}
   }
   if(g.subject==='math_formula'){
    const number=Number(c.unitId.replace('formula-',''));if(!(root.MATH_FORMULAS||[]).some(f=>f.number===number))continue;
    const learnedKinds=new Set(attempts.map(a=>a.questionId?.replace(`formula-${number}-`,'')).filter(Boolean));
    for(let index=0;index<8;index++)for(const item of generated(()=>root.MathFormulaReview?.create(number,'foundation')||root.MathFormulaQuiz?.create(number))||[]){
     if(item.kind!=='choice')continue;
     const exact=attempts.some(a=>normalize(a.question)===normalize(item.prompt));
     const supported=exact||item.noteType&&learnedKinds.has(item.noteType);
     if(supported)add(g,{question:`${item.givens?item.givens+'\n':''}${item.noteType==='formula-recall'?`${c.title||c.unitId}: `:''}${item.prompt}`+(item.unit?` (단위: ${item.unit})`:''),choices:item.choices,answer:item.answer,explanation:item.solution,unit:item.unit,conceptId:item.noteType||'evidenced-formula-question',repeated:true,sourceType:'학습한 공식 적용 유형 · 재연습'});
    }
   }
   if(g.subject==='hanja'){
    if(strict){for(const item of root.MockHanjaTransfer?.create(g,root.vocabHanja?.[c.unitId]||[],rng)||[])add(g,item);continue;}
    const bank=root.vocabHanja?.[c.unitId]||[],level=Number(String(c.unitId).replace(/\D/g,'')),difficulty=level>=7?'basic':level===6?'standard':'challenge';
    for(const w of bank)if(attempts.some(a=>[a.hanja,a.word,a.question,a.correctAnswer].some(v=>normalize(v)===normalize(w.hanja))||String(a.question||'').includes(w.hanja))){
     const answer=`${w.meaning} ${w.eum}`,other=[...new Set(bank.map(x=>`${x.meaning} ${x.eum}`))].filter(v=>v!==answer);if(other.length>=3)add(g,{question:`${w.hanja}의 뜻과 음은?`,choices:[answer,...shuffle(other,rng).slice(0,3)],answer,explanation:`${w.hanja}: ${answer}`,conceptId:`hanja:${w.hanja}`,difficulty,sourceType:'학습한 한자 뜻·음 확인'});
     const others=[...new Set(bank.map(x=>x.hanja))].filter(v=>v!==w.hanja);if(others.length>=3)add(g,{question:`“${w.meaning} ${w.eum}”에 알맞은 한자는?`,choices:[w.hanja,...shuffle(others,rng).slice(0,3)],answer:w.hanja,explanation:`${answer}은 ${w.hanja}이다.`,conceptId:`hanja:${w.hanja}`,difficulty,sourceType:'학습한 한자 읽기 확인'});
    }
   }
  }
  // Recent units come first, caps keep one unit or question type from filling a subject,
  // and a small share of harder items is reserved. Caps are a preference: a learner who
  // studied only one unit still receives a complete exam.
  function select(subject,pool,required){
   if(strict&&subject==='english_reading'){
    const texts=new Map();for(const q of pool){const rows=texts.get(q.passageId)||[];rows.push(q);texts.set(q.passageId,rows);}
    const full=shuffle([...texts.values()].filter(rows=>rows.length>=required),rng).sort((a,b)=>b.filter(q=>q.cognitiveDemand==='reasoning').length-a.filter(q=>q.cognitiveDemand==='reasoning').length);
    if(full.length)pool=full[0];
   }
   const order=list=>shuffle(list,rng).sort((a,b)=>(meta.get(b)?.recency||0)-(meta.get(a)?.recency||0));
   const ranked=[...order(pool.filter(q=>!q.repeated)),...order(pool.filter(q=>q.repeated))];
   const cap=CAPS[subject]||{},picked=[],units=new Map(),concepts=new Map();
   const fits=q=>(!cap.unit||(units.get(meta.get(q)?.unit)||0)<cap.unit)&&(!cap.concept||(concepts.get(q.conceptId)||0)<cap.concept);
   const take=q=>{picked.push(q);const unit=meta.get(q)?.unit;units.set(unit,(units.get(unit)||0)+1);concepts.set(q.conceptId,(concepts.get(q.conceptId)||0)+1);};
   for(const [tier,share] of Object.entries(strict?{challenge:.25,standard:.6}:(MIX[subject]||{}))){let left=Math.round(required*share);for(const q of ranked)if(left>0&&q.difficulty===tier&&!picked.includes(q)&&fits(q)){take(q);left--;}}
   for(const q of ranked)if(picked.length<required&&!picked.includes(q)&&fits(q))take(q);
   for(const q of ranked)if(picked.length<required&&!picked.includes(q)&&(!strict||!cap.concept||(concepts.get(q.conceptId)||0)<cap.concept))take(q);
   return shuffle(picked,rng);
  }
  const items=[],shortages={};
  // 어휘를 먼저 뽑고, 모자란 만큼 국어 독해를 더 뽑아 국어 영역 15문항을 맞춘다.
  const order=['korean_vocab',...Object.keys(quotas).filter(s=>s!=='korean_vocab')];
  let vocabularyShort=0,vocabularyItems=[];
  for(const subject of order){
   const required=quotas[subject]+(subject==='reading'?vocabularyShort:0);
   const selected=select(subject,pools[subject],required);
   if(subject==='korean_vocab'){vocabularyShort=required-selected.length;vocabularyItems=selected;continue;}
   if(subject==='math')selected.filter(writable).slice(0,WRITTEN_MATH).forEach(q=>Object.assign(q,{kind:'written',inputHint:'분수는 4/9처럼 쓰고, 단위는 빼도 돼요.'}));
   items.push(...selected);
   if(subject==='reading')items.push(...vocabularyItems); // 국어 영역: 독해 다음에 어휘
   if(selected.length<required)shortages[subject]={required,actual:selected.length,missing:required-selected.length,reason:strict?'학습한 범위에서 아직 풀지 않은 적용·추론 문항이 부족합니다. 이미 푼 문제로 채우지 않았습니다.':'최근 3주 실제 학습의 세부 근거 또는 최근 14일 미출제 문항이 부족합니다.'};
  }
  const quality=strict?(root.MockExamQuality?.evaluate(items)||{complete:false,deficits:{dependency:{reason:'시험 품질 검사 준비가 필요합니다.'}}}):null;
  return {items,quotas:{...quotas},shortages,quality,complete:Object.keys(shortages).length===0&&(!strict||quality.complete),version:buildVersion,policyId:strict?root.MockExamQuality?.policyId:null,scopeCutoffAt:now,evidenceWindowDays:21,repeatAvoidanceDays:strict?null:14,repeatPolicy:strict?'all-stored-history':'14-days',newQuestionCount:items.filter(q=>!q.repeated).length,reexposureCount:items.filter(q=>q.repeated).length};
 }
 app.MockExamBank={build,grade,quotas,version,fingerprint,learnedScopes,writtenKey};
})(window);

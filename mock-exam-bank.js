(function(root){
 'use strict';
 const app=root.SmartStudy=root.SmartStudy||{},DAY=86400000;
 const quotas=Object.freeze({reading:15,english:4,grammar:4,english_reading:7,math:12,math_formula:3,hanja:10});
 const version='20261013-mock-bank-v1';
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
 function grade(q,response){
  if(!valid(q))return {correct:false,status:'invalid',answer:q?.answer??null};
  if(response===undefined||response===null||response==='')return {correct:false,status:'unanswered',answer:q.answer};
  if(typeof response!=='string'||!q.choices.includes(response))return {correct:false,status:'invalid',answer:q.answer};
  const correct=response===q.answer;return {correct,status:correct?'correct':'wrong',answer:q.answer};
 }
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
   const g=groups.get(key)||{subject:e.subject,context:e.context,attempts:[],reportIds:[],passageIds:new Set()};
   g.attempts.push(...e.attempts);g.reportIds.push(e.r.sessionId);
   if(e.r.metadata?.passageId)g.passageIds.add(e.r.metadata.passageId);
   for(const a of e.attempts)if(a.passageId)g.passageIds.add(a.passageId);
   groups.set(key,g);
  }
  return [...groups.values()];
 }
 function recentQuestions(reports,now){
  const seen=new Set(),ids=new Set();
  for(const r of reports){if(!r||typeof r!=='object')continue;const at=Number(r.metadata?.submittedAt||r.createdAt||r.date);if(!Number.isFinite(at)||at>now||at<now-14*DAY)continue;
   const attempts=r.metadata?.initialAttempts||r.metadata?.attempts||[],questions=r.metadata?.questions||r.metadata?.questionSnapshot||[];
   for(const a of Array.isArray(attempts)?attempts:[]){if(!a)continue;const subject=a.subject||a.assessmentSubject||(r.metadata?.source==='math-formula'?'math_formula':r.subject);seen.add(fingerprint({...a,subject,answer:a.correctAnswer??a.answer}));if(a.questionId)ids.add(String(a.questionId));}
   for(const q of Array.isArray(questions)?questions:[]){if(!q)continue;seen.add(fingerprint(q));if(q.id)ids.add(String(q.id));}
  }
  return {seen,ids};
 }
 const skillOf=skill=>/중심|주제|제목/.test(skill||'')?'main':/내용 확인|정보 확인|사실/.test(skill||'')?'fact':/근거|주장/.test(skill||'')?'evidence':/추론|관점|심리|의미|평가|갈등/.test(skill||'')?'inference':/구조|전개|역할|기능/.test(skill||'')?'structure':null;
 const q=(skill,question,answer,wrong,explanation)=>({skill,question,answer,choices:[answer,...wrong],explanation});
 // All passages below are newly authored educational fiction/exposition.
 // They assess an evidenced reading skill; they do not expand a unit's factual syllabus.
 const koreanPassages=[
  {id:'mock-library-box',title:'반납함을 옮긴 까닭',lines:['학교 도서관의 책 반납함은 문 안쪽에 있었다.','수업이 끝난 뒤 도서관 문이 잠기면 학생들은 책을 돌려줄 수 없었다.','사서는 반납함을 복도에 두자고 제안했다.','그러나 비상 통로를 막지 않도록 벽 안쪽의 빈 공간을 먼저 확인했다.','반납함을 옮긴 뒤 학생들은 문이 잠긴 시간에도 책을 반납할 수 있었다.','이 변화는 이용자의 불편을 줄이면서 안전도 고려한 결과였다.'],questions:[q('main','이 글의 중심 내용은?','안전을 고려한 반납함 이동으로 이용자의 불편을 줄였다.',['반납한 책은 모두 버려야 한다.','도서관 문은 항상 열어 두어야 한다.','복도에는 어떤 물건도 둘 수 없다.'],'마지막 문장이 편의와 안전을 함께 정리한다.'),q('fact','반납함을 옮기기 전에 확인한 것은?','비상 통로를 막지 않는 빈 공간',['학생들의 운동화 크기','책 표지의 색','방학의 길이'],'4행에 안전한 위치를 확인했다고 나온다.'),q('evidence','기존 반납함의 불편을 직접 보여 주는 내용은?','문이 잠기면 책을 돌려줄 수 없었다.',['학생들이 책을 새로 샀다.','복도 벽을 칠했다.','책의 가격이 올랐다.'],'2행이 기존 위치의 문제를 직접 제시한다.'),q('inference','사서의 결정에서 알 수 있는 태도는?','편의를 개선할 때 안전 조건도 살핀다.',['불편은 모두 이용자가 참아야 한다.','안전보다 책의 색이 중요하다.','한 번 정한 위치는 바꾸면 안 된다.'],'제안에 이어 비상 통로를 확인한 행동이 근거이다.'),q('structure','마지막 문장은 어떤 역할을 하는가?','앞의 변화가 지닌 의미를 정리한다.',['새 인물을 소개한다.','처음 문제의 존재를 부정한다.','반납함 제작 순서를 자세히 설명한다.'],'편의와 안전이라는 결과를 종합한다.')]},
  {id:'mock-rain-record',title:'비 오는 날의 기록',lines:['지우는 비가 오는 날마다 교실 앞 신발장 바닥이 젖는다고 생각했다.','확인하기 위해 일주일 동안 날씨와 바닥 상태를 함께 적었다.','비가 온 세 날 중 우산을 입구에서 접은 두 날은 바닥이 많이 젖었다.','다른 한 날에는 우산을 밖에서 털고 들어왔고 바닥이 거의 젖지 않았다.','지우는 비 자체뿐 아니라 우산을 다루는 방법도 영향을 줄 수 있다고 말했다.','친구들은 다음 비 오는 날에도 같은 방법으로 기록을 이어 가기로 했다.'],questions:[q('main','이 글의 중심 내용은?','기록을 통해 젖은 바닥의 원인을 살피고 추가 확인을 계획했다.',['비가 오면 모든 교실이 반드시 잠긴다.','일주일 관찰로 모든 원인이 확정되었다.','날씨는 기록할 필요가 없다.'],'관찰 결과와 추가 확인 계획을 함께 포괄한다.'),q('fact','바닥이 거의 젖지 않은 날 학생들이 한 행동은?','우산을 밖에서 털고 들어왔다.',['우산을 신발장에 숨겼다.','창문을 모두 열었다.','교실 안에서 우산을 펼쳤다.'],'4행에 직접 제시되어 있다.'),q('evidence','우산을 다루는 방법도 영향을 줄 수 있다는 근거는?','우산을 밖에서 턴 날은 바닥이 거의 젖지 않았다.',['친구들의 이름이 모두 달랐다.','우산의 손잡이가 둥글었다.','지우가 매일 같은 신발을 신었다.'],'같은 비 오는 날에도 행동에 따라 바닥 상태가 달랐다.'),q('inference','추가로 기록하려는 이유로 가장 적절한 것은?','관찰한 결과가 다른 날에도 나타나는지 확인하려고',['이미 확정된 사실을 잊으려고','바닥 상태를 숨기려고','날씨가 기록에 영향을 주지 않는다고 가정하려고'],'관찰은 제한된 기간이므로 다음 날의 확인이 필요하다.'),q('structure','2~4행의 전개 방식은?','관찰 방법과 비교 결과를 제시한다.',['찬성자와 반대자의 토론을 중계한다.','신발장 제조법을 나열한다.','과거의 전설을 인용한다.'],'날씨·바닥을 기록한 방법과 상황별 결과를 설명한다.')]},
  {id:'mock-poster',title:'두 장의 안내문',lines:['학급은 물을 아끼자는 안내문 두 장을 만들었다.','첫 안내문에는 물을 아끼자는 말만 크게 적었다.','둘째 안내문에는 양치할 때 컵을 쓰고 수도꼭지를 잠그라는 행동을 적었다.','친구들은 둘째 안내문을 보면 무엇을 해야 할지 바로 알 수 있다고 말했다.','학급은 두 안내문을 번갈아 붙이고 실제 행동도 살펴보기로 했다.','좋은 안내는 목적을 전하는 데 더해 실천 방법을 알려 주어야 한다.'],questions:[q('main','글쓴이가 강조하는 좋은 안내의 조건은?','목적과 구체적인 실천 방법을 함께 알린다.',['글자를 크게 쓰면 내용은 필요 없다.','그림만 있고 말은 없어야 한다.','친구들의 의견은 모두 지워야 한다.'],'마지막 문장이 목적과 실천 방법을 함께 강조한다.'),q('fact','둘째 안내문에 적은 행동은?','양치할 때 컵을 쓰고 수도꼭지를 잠근다.',['물을 하루 내내 틀어 둔다.','매일 안내문을 찢는다.','컵을 사용하지 않는다.'],'3행에 행동 두 가지가 제시된다.'),q('evidence','둘째 안내문이 이해하기 쉽다는 근거는?','친구들이 무엇을 해야 할지 바로 알 수 있다고 말했다.',['첫 안내문의 종이가 더 두꺼웠다.','교실의 문이 파란색이었다.','학생 수가 늘어났다.'],'4행이 안내를 읽은 친구들의 반응을 직접 제시한다.'),q('inference','두 안내문을 번갈아 붙이며 행동을 보는 까닭은?','안내 방식이 실천에 어떤 영향을 주는지 살피려고',['물을 더 많이 버리려고','안내문을 읽지 못하게 하려고','학급 이름을 바꾸려고'],'5행은 안내 방식의 효과를 실제 행동으로 확인하는 계획이다.'),q('structure','첫째와 둘째 안내문을 함께 설명한 방식은?','두 대상의 차이를 비교한다.',['여행 경로를 시간순으로 기록한다.','인물의 외모만 묘사한다.','말의 어원을 분석한다.'],'1~4행이 목적만 있는 안내와 행동을 제시한 안내를 대비한다.')]},
  {id:'mock-paper-bridge',title:'종이 다리를 만드는 팀',lines:['민호의 팀은 종이 한 장으로 장난감 자동차를 받칠 다리를 만들었다.','처음에는 종이를 평평하게 놓았지만 자동차를 올리자 가운데가 처졌다.','민호는 실패한 종이를 버리려 했고 유나는 종이를 접어 보자고 제안했다.','팀은 같은 종이를 여러 번 접어 다시 양쪽 받침 위에 올렸다.','이번에는 자동차를 올려도 다리가 곧바로 처지지 않았다.','민호는 실패한 결과도 다음 방법을 찾는 단서가 된다는 것을 깨달았다.'],questions:[q('main','이 이야기의 주제로 가장 적절한 것은?','실패를 살피고 방법을 바꾸면 새로운 해결책을 찾을 수 있다.',['실패한 재료는 반드시 버려야 한다.','모든 다리는 종이로 만들어야 한다.','자동차의 색이 다리의 힘을 정한다.'],'처음 실패 뒤 같은 재료를 접어 개선한 사건과 깨달음이 근거이다.'),q('fact','팀이 두 번째 시도에서 바꾼 것은?','같은 종이를 여러 번 접었다.',['자동차를 모두 없앴다.','받침을 물에 넣었다.','종이를 철판으로 바꾸었다.'],'4행에 직접 제시되어 있다.'),q('evidence','두 번째 시도의 결과를 보여 주는 문장은?','자동차를 올려도 다리가 곧바로 처지지 않았다.',['민호의 팀은 종이 한 장을 받았다.','민호는 종이를 버리려 했다.','유나는 제안을 했다.'],'5행은 변화 뒤에 관찰한 결과이다.'),q('inference','마지막에 민호의 생각은 어떻게 달라졌는가?','실패를 버릴 대상으로만 보던 데서 개선의 단서로 보게 되었다.',['친구의 제안을 모두 무시하게 되었다.','실험을 하지 않아도 결과를 안다고 믿게 되었다.','재료의 모양은 전혀 중요하지 않다고 확신했다.'],'3행의 버리려던 행동과 6행의 깨달음을 연결한다.'),q('structure','2행과 5행을 함께 제시한 효과는?','방법을 바꾸기 전과 후의 결과를 비교하게 한다.',['사건의 순서를 알 수 없게 한다.','유나가 등장하지 않았다고 주장한다.','결말을 처음과 완전히 같게 만든다.'],'평평한 종이와 접은 종이의 결과를 대비한다.')]}
 ];
 const englishPassages=[
  {id:'mock-moon-picture',sourcePassageId:'er1-p0',title:'Two Moon Pictures',lines:['Jin looks at two pictures of the moon.','The first picture shows a thin curve.','The second picture shows a wider bright part.','Jin draws the two shapes in his notebook.','He learns that the pictures show a change in the moon.'],questions:[q('fact','What does Jin look at?','Two pictures of the moon',['A book about dinner','A clock in the kitchen','Three pictures of the sun'],'첫 문장에 달 사진 두 장을 본다고 나온다.'),q('main','What is the passage mainly about?','Jin compares two moon shapes.',['Jin makes his own light.','Jin cooks dinner.','Jin loses his notebook.'],'서로 다른 달 모양을 보고 기록하는 내용이다.'),q('reference','Who does “He” in sentence 5 refer to?','Jin',['the moon','the notebook','the first picture'],'앞 문장에서 그림을 그린 사람 Jin을 가리킨다.'),q('evidence','Which sentence shows that Jin keeps a record?','Sentence 4',['Sentence 1','Sentence 2','Sentence 3'],'4문장의 공책 그림이 기록의 근거이다.')]},
  {id:'mock-moon-observe',sourcePassageId:'er1-p0',title:'A Bright Part',lines:['Sora draws the moon on Monday.','The moon looks like a thin curve.','Three nights later, she looks at the moon again.','The bright part is wider, so she draws a new shape.','Her notebook shows the change over time.'],questions:[q('fact','When does Sora first draw the moon?','On Monday',['After three weeks','On Friday','Every morning'],'첫 문장에 Monday라고 제시한다.'),q('main','What does the notebook show?','A change in the moon over time',['A plan for dinner','The price of a clock','The name of a school'],'마지막 문장이 공책 기록의 의미를 정리한다.'),q('reference','Who does “she” in sentence 3 refer to?','Sora',['Monday','the moon','the bright part'],'앞 두 문장의 주인공 Sora를 가리킨다.'),q('evidence','Which sentence shows a different moon shape?','Sentence 4',['Sentence 1','Sentence 2','Sentence 3'],'4문장에서 밝은 부분이 더 넓어져 새 모양을 그린다.')]}
 ];
 function build(user,now=Date.now()){
  now=Number(now);if(!Number.isFinite(now))now=Date.now();
  const reports=app.LocalRepository?.listReports(user)||[],scopes=learnedScopes(reports,now),recent=recentQuestions(reports,now);
  const rng=random(`${user}:${Math.floor((now+9*3600000)/DAY)}:${version}`),pools=Object.fromEntries(Object.keys(quotas).map(s=>[s,[]])),used=new Set();
  function generated(factory){const previous=root.Math.random;root.Math.random=rng;try{return factory();}finally{root.Math.random=previous;}}
  function add(g,item){
   const candidate={...item,subject:g.subject,context:{...g.context},kind:'choice',choices:(item.choices||[]).map(String),answer:String(item.answer??''),explanation:item.explanation||'',evidenceReportIds:[...g.reportIds],sourceType:item.sourceType||'학습 범위의 검증 문항',repeated:Boolean(item.repeated)};
   if(!valid(candidate))return;
   const fp=fingerprint(candidate);candidate.id=`mock:${g.subject}:${hash(fp).toString(36)}`;
   if(used.has(fp)||recent.seen.has(fp)||recent.ids.has(candidate.id)||candidate.sourceQuestionId&&recent.ids.has(String(candidate.sourceQuestionId)))return;
   candidate.fingerprint=fp;candidate.choices=shuffle(candidate.choices,rng);used.add(fp);pools[g.subject].push(candidate);
  }
  for(const g of scopes){
   const attempts=g.attempts,c=g.context;
   if(g.subject==='reading'){
    const learnedSkills=new Set();
    for(const a of attempts){const p=(root.ReadingPassages||[]).find(p=>p.unitId===c.unitId&&(g.passageIds.has(p.id)||(p.questions||[]).some(q=>q.id===a.questionId)));const original=p?.questions?.find(q=>q.id===a.questionId||normalize(q.question)===normalize(a.question));const skill=skillOf(a.skill||original?.skill);if(p&&original&&skill)learnedSkills.add(skill);}
    for(const p of shuffle([...koreanPassages,...root.MockReadingContent?.korean||[]],rng))for(const [index,item] of p.questions.entries())if(learnedSkills.has(item.skill))add(g,{...item,passageId:p.id,passageTitle:p.title,passageLines:p.lines,sourceQuestionId:`${p.id}:${index}`,sourceType:'자체 제작 새 지문 · 학습한 읽기 기능',conceptId:`reading:${item.skill}`,source:{kind:'original',note:'스마트 스터디 자체 제작'}});
    for(const p of root.ReadingPassages||[])if(p.unitId===c.unitId&&g.passageIds.has(p.id))for(const item of p.questions||[])if(learnedSkills.has(skillOf(item.skill)))add(g,{...item,sourceQuestionId:item.id,explanation:item.evidence,passageId:p.id,passageLines:p.lines,passageTitle:p.title,repeated:true,sourceType:'학습한 지문 재확인'});
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
   if(g.subject==='english_reading'){
    const unit=root.EnglishReadingData?.units?.find(u=>u.id===c.unitId);
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
    // The legacy generic word generator draws several unrelated concepts.
    // Its name alone does not prove which concept the child actually learned.
    const generators=new Set(attempts.map(a=>a.generator).filter(value=>value&&value!=='math_word_problem'));
    const distinct=new Map();for(const t of templates){if(t.generator&&generators.has(t.generator))distinct.set(`g:${t.generator}`,t);else if(!t.generator&&attempts.some(a=>normalize(a.question)===normalize(t.question)))distinct.set(`q:${normalize(t.question)}`,t);}
    for(const [key,t] of distinct)for(let index=0;index<(t.generator?6:1);index++)try{const item=generated(()=>root.Utils?.generateMathQuiz(t));if(!item||!Number.isInteger(Number(item.answer))||item.choices?.[Number(item.answer)]===undefined)continue;add(g,{...item,answer:String(item.choices[Number(item.answer)]),generator:t.generator,conceptId:key,sourceType:t.generator?'학습한 계산 유형 · 숫자 변형 재연습':'학습한 계산 문항 재확인',repeated:true});}catch(_){/* An unsupported generator is a shortage, not permission to expand scope. */}
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
    const bank=root.vocabHanja?.[c.unitId]||[];
    for(const w of bank)if(attempts.some(a=>[a.hanja,a.word,a.question,a.correctAnswer].some(v=>normalize(v)===normalize(w.hanja))||String(a.question||'').includes(w.hanja))){
     const answer=`${w.meaning} ${w.eum}`,other=[...new Set(bank.map(x=>`${x.meaning} ${x.eum}`))].filter(v=>v!==answer);if(other.length>=3)add(g,{question:`${w.hanja}의 뜻과 음은?`,choices:[answer,...shuffle(other,rng).slice(0,3)],answer,explanation:`${w.hanja}: ${answer}`,conceptId:`hanja:${w.hanja}`,sourceType:'학습한 한자 뜻·음 확인'});
     const others=[...new Set(bank.map(x=>x.hanja))].filter(v=>v!==w.hanja);if(others.length>=3)add(g,{question:`“${w.meaning} ${w.eum}”에 알맞은 한자는?`,choices:[w.hanja,...shuffle(others,rng).slice(0,3)],answer:w.hanja,explanation:`${answer}은 ${w.hanja}이다.`,conceptId:`hanja:${w.hanja}`,sourceType:'학습한 한자 읽기 확인'});
    }
   }
  }
  const items=[],shortages={};
  for(const [subject,required] of Object.entries(quotas)){
   const pool=pools[subject];const fresh=shuffle(pool.filter(q=>!q.repeated),rng),repeat=shuffle(pool.filter(q=>q.repeated),rng),selected=[...fresh,...repeat].slice(0,required);items.push(...selected);
   if(selected.length<required)shortages[subject]={required,actual:selected.length,missing:required-selected.length,reason:'최근 3주 실제 학습의 세부 근거 또는 최근 14일 미출제 문항이 부족합니다. 미학습 범위로 채우지 않았습니다.'};
  }
  return {items,quotas:{...quotas},shortages,complete:Object.keys(shortages).length===0,version,scopeCutoffAt:now,evidenceWindowDays:21,repeatAvoidanceDays:14,newQuestionCount:items.filter(q=>!q.repeated).length,reexposureCount:items.filter(q=>q.repeated).length};
 }
 app.MockExamBank={build,grade,quotas,version,fingerprint,learnedScopes};
})(window);

(function(root){
 'use strict';
 // Parent-printed mock exams. A paper round takes the week's next round (1-3) and is stored in
 // mockExamResults beside the online rounds, with its questions but no answers or scores, so the
 // learner's next online round skips that number and every later build excludes its questions.
 const app=root.SmartStudy=root.SmartStudy||{},DAY=86400000,PRINT_KEY='SmartStudy_MockPaperPrint',HISTORY_DAYS=35;
 const areaNames={reading:'국어',english:'영어',math:'수학',hanja:'한자',korean_vocab:'국어 어휘',grammar:'영어 문법',english_reading:'영어 독해',math_formula:'수학 공식'};
 const el=(tag,className,text)=>{const node=root.document.createElement(tag);if(className)node.className=className;if(text!=null)node.textContent=text;return node;};
 const clone=value=>JSON.parse(JSON.stringify(value));
 const limit=()=>app.MockExam?.maxAttempts||3,payloadOf=r=>r?.payload||r,isPaper=p=>p?.status==='paper'&&p.mode==='paper';
 const kstDate=at=>new Date(at+9*3600000).toISOString().slice(0,10);
 function weekLabel(week){const [y,m,d]=String(week).split('-').map(Number);return `${y}년 ${m}월 ${Math.ceil(d/7)}주차`;}
 // Server rounds of one week: an online submission wins the state; paper sets are reprintable.
 function rounds(records,week){const rows=(records||[]).map(payloadOf).filter(p=>p?.scheduledWeekId===week);
  return Array.from({length:limit()},(_,i)=>{const n=i+1,own=rows.filter(p=>(Number(p.attemptNo)||1)===n),paper=own.find(isPaper)||null;return {attemptNo:n,state:own.some(p=>!isPaper(p))?(own.some(p=>!isPaper(p)&&p.mode!=='paper')?'online':'scored'):paper?'paper':'empty',paper};});}
 function nextRound(records,week){const used=(records||[]).map(payloadOf).filter(p=>p?.scheduledWeekId===week).map(p=>Number(p.attemptNo)||1);return used.length?Math.max(...used)+1:1;}
 function paperSet(p){return {schema:1,learnerId:p.userId,learnerName:p.paper?.learnerName||p.userId,weekKey:p.scheduledWeekId,weekLabel:p.paper?.weekLabel||weekLabel(p.scheduledWeekId),attemptNo:Number(p.attemptNo)||1,generatedAt:p.generatedAt,timeLimits:clone(p.paper?.timeLimits||{}),items:clone(p.questions||[])};}
 // mock-print.html reads this key once; the durable copy stays in mockExamResults for reprints.
 function print(set){app.LocalRepository.rawSet(PRINT_KEY,JSON.stringify(set));return root.open?.('mock-print.html','_blank')||null;}
 const reprint=payload=>print(paperSet(payload));
 // Generation runs on the parent's device, so the learner's learning evidence comes from the server copy.
 // Mock rounds of the last 12 weeks come from mockExamResults; ordinary quiz history covers HISTORY_DAYS.
 async function learnerReports(user,now){
  const R=app.FirestoreRepository;
  if(!R.getReportsPage||!R.getReportStorageMode||await R.getReportStorageMode(user)!=='partition')return (await R.getUserBundle(user))?.reports||[];
  const rows=[];let cursor=null;
  do{const page=await R.getReportsPage(user,{start:now-HISTORY_DAYS*DAY,end:now,before:cursor,limit:100});rows.push(...page.reports);cursor=page.hasMore?page.cursor:null;}while(cursor);
  return Promise.all(rows.map(async row=>{const merged={...row,...await R.getReportDetail(user,row)};delete merged._body;return merged;}));
 }
 // Same per-area limits as the online exam: parent settings, else the exam defaults.
 async function timeLimits(user){
  let weekly=null;try{weekly=(await app.FirestoreRepository.getLearnerPlanSettings(user))?.weekly;}catch(_){/* The online exam also falls back to defaults. */}
  const minutes=weekly?.mockSectionMinutes||{};return Object.fromEntries(app.MockExam.definitions.map(s=>{const n=Number(minutes[s.id]);return [s.id,Number.isInteger(n)&&n>=5&&n<=60?n:s.minutes];}));
 }
 async function generate(user,options={}){
  const now=Number(options.now)||Date.now(),week=app.MockExam.weekId(now),records=await app.MockPublication.list(user,{weeks:12}),attemptNo=nextRound(records,week);
  if(attemptNo>limit())throw new Error(`이번 주 ${limit()}회차를 모두 사용했습니다.`);
  if(options.attemptNo!=null&&Number(options.attemptNo)!==attemptNo)throw new Error(`${options.attemptNo}회차는 만들 수 없습니다. 지금은 ${attemptNo}회차 차례이며 이미 있는 회차는 덮어쓰지 않습니다.`);
  const bank=app.MockExamBank.build(user,now,{attemptNo,history:records,reports:await learnerReports(user,now)});
  const key=q=>app.MockExamBank.fingerprint(q),seen=new Set(records.flatMap(r=>payloadOf(r).questions||[]).flatMap(q=>[q.id,key(q)]));
  const repeated=(bank.items||[]).filter(q=>seen.has(q.id)||seen.has(key(q))).length;
  // Printing is allowed exactly when the online exam could start with this bank.
  if(!app.MockExam.validateBank(bank)||repeated)return {ok:false,attemptNo,bank,repeated};
  const last=records.map(payloadOf).filter(p=>p.scheduledWeekId===week).sort((a,b)=>(Number(b.attemptNo)||1)-(Number(a.attemptNo)||1))[0];
  const payload={schemaVersion:1,assessmentId:`mock:${user}:${week}:attempt-${attemptNo}-paper-${root.crypto?.randomUUID?.()||now.toString(36)}`,userId:user,scheduledWeekId:week,scheduledDate:kstDate(now),
   scopeCutoffAt:bank.scopeCutoffAt||now,kind:'mock',mode:'paper',status:'paper',attemptNo,parentAttemptId:last?.assessmentId||null,bankVersion:bank.version||'unknown',policyId:bank.policyId||null,repeatPolicy:bank.repeatPolicy||null,
   quotas:Object.fromEntries(Object.keys(app.MockExam.areas).map(s=>[s,bank.items.filter(q=>q.subject===s).length])),newQuestionCount:bank.items.filter(q=>!q.repeated).length,reexposureCount:bank.items.filter(q=>q.repeated).length,
   questions:clone(bank.items),sections:[],generatedAt:now,startedAt:now,resultVisibility:'withheld',paper:{learnerName:String(options.learnerName||user),weekLabel:weekLabel(week),timeLimits:await timeLimits(user)}};
  await app.MockPublication.savePaper(user,payload);
  return {ok:true,attemptNo,bank,payload,set:paperSet(payload)};
 }
 // Reasons are listed like the online ready screen: area shortages first, then quality checks.
 function reasons(result){
  const rows=[];for(const [area,s] of Object.entries(result.bank?.shortages||{}))if(s.missing>0)rows.push(`${areaNames[area]||area}: ${s.actual}/${s.required}문항 · ${s.missing}문항 부족`);
  if(result.repeated)rows.push(`이전 회차와 겹치는 문제 ${result.repeated}개`);
  if(!rows.length)for(const d of Object.values(result.bank?.quality?.deficits||{}))if(d?.reason)rows.push(d.reason);
  return rows.length?rows:['문항 구성과 영역 배분 확인이 필요합니다.'];
 }
 function renderRounds(user,host,options={}){
  const now=Number(options.now)||Date.now(),week=app.MockExam.weekId(now),records=options.records||[],next=nextRound(records,week),makers=[];
  const list=el('div','mock-paper-rounds'),message=el('p','mock-paper-message',options.notice||''),shortages=el('ul','mock-paper-shortages');
  const button=text=>{const b=el('button',null,text);b.type='button';return b;},unlock=()=>{for(const [b,n] of makers)b.disabled=n!==next;};
  const say=(text,error)=>{message.className=`mock-paper-message${error?' mock-admin-error':''}`;message.textContent=text;};
  async function make(n){
   if(root.confirm&&!root.confirm(`${weekLabel(week)} ${n}회차를 종이 시험지로 만들까요?\n이 회차는 온라인으로 응시할 수 없고 점수도 기록되지 않습니다.`))return;
   for(const [b] of makers)b.disabled=true;shortages.replaceChildren();say('학습 기록과 이전 회차를 확인해 시험지를 만드는 중...');
   try{
    const result=await generate(user,{attemptNo:n,now:options.now,learnerName:options.learnerName});
    if(!result.ok){for(const row of reasons(result))shortages.append(el('li',null,row));say(`${n}회차 시험 문항을 구성하지 못했습니다. 온라인 시험도 시작할 수 없는 상태라 시험지를 만들지 않았습니다. 추가 공부가 필요한 것은 아니며, 학습자 기기의 기록 동기화 후 다시 확인해 주세요.`,true);unlock();return;}
    // The print window is opened by the 출력하기 click itself; opening it after the save is usually blocked as a popup.
    const notice=`${n}회차 종이 시험지를 만들었습니다. 출력하기를 눌러 인쇄해 주세요.`;
    if(options.onChange)await options.onChange(notice);else say(notice);
   }catch(error){say(errorText(error),true);unlock();}
  }
  for(const round of rounds(records,week)){
   const row=el('div',`mock-paper-round is-${round.state}`);row.append(el('strong',null,`${round.attemptNo}회차`),el('span','mock-paper-state',{online:'온라인 응시함',scored:'종이 시험 채점함',paper:'종이 시험지 생성됨',empty:'비어 있음'}[round.state]));
   if(round.state==='paper'){const again=button('출력하기');again.onclick=()=>say(reprint(round.paper)?`${round.attemptNo}회차 시험지를 인쇄 창에 열었습니다.`:'팝업이 차단되었습니다. 팝업을 허용한 뒤 출력하기를 다시 눌러 주세요.');row.append(again);}
   if(round.state==='empty'){const create=button('시험지 만들기');create.onclick=()=>make(round.attemptNo);if(round.attemptNo!==next)create.title='앞 회차부터 순서대로 만들 수 있습니다.';makers.push([create,round.attemptNo]);row.append(create);}
   list.append(row);
  }
  unlock();host.replaceChildren();
  host.append(el('h3',null,'시험지 출력'),el('p','mock-paper-sub',`${weekLabel(week)} · 종이 시험은 그 회차를 대신하고, OMR 답안지 사진으로 채점합니다.`),list,message,shortages,
   el('p','mock-paper-note','앞 회차부터 순서대로 만들고, 이미 응시했거나 만든 회차는 덮어쓰지 않습니다. 학습자 기기에서 아직 제출하지 않은 온라인 시험은 여기에 보이지 않습니다.'));
 }
 // Firestore errors arrive in English; show the parent what to do instead.
 function errorText(error){const code=String(error?.code||''),text=String(error?.message||error||'');if(/permission|insufficient/i.test(code+text))return '서버에서 저장을 허용하지 않았어요. 관리자 계정으로 로그인했는지 확인하고, 앱을 새로고침해 최신 버전으로 다시 시도해 주세요.';if(/unavailable|network|offline|failed to fetch/i.test(code+text))return '인터넷 연결을 확인한 뒤 다시 시도해 주세요.';return /[가-힣]/.test(text)?text:'저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.';}
 app.MockPaperAdmin={errorText,renderRounds,generate,rounds,nextRound,paperSet,print,reprint,weekLabel,learnerReports,PRINT_KEY};
})(typeof window!=='undefined'?window:globalThis);

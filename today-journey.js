(function(root){
 'use strict';
 const app=root.SmartStudy,api=app.LearningPlan,repo=app.LocalRepository;
 const names={reading:'국어 독해',korean_vocab:'국어 어휘',english:'영어 단어',grammar:'영어 문법',english_reading:'영어 독해',math:'수학',math_formula:'수학 공식',hanja:'한자'};
 const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const day=at=>new Date(at).toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
 function state(user,taskId){
  const plan=api.refreshEvidence(user),task=plan?.tasks.find(t=>t.id===taskId);
  if(!task)return null;
  const sameDay=app.LearningProgress.evidence(user).filter(e=>e.subject===task.subject&&day(e.at)===plan.date);
  if(task.status!=='completed'){
   const submitted=sameDay.find(e=>api.contextKey(task.subject,e.context)===api.contextKey(task.subject,task.context));
   if(submitted){Object.assign(task,{status:'completed',sessionId:submitted.report.sessionId,submittedAt:submitted.at,completedAt:Date.now()});api.savePlan(plan);}
  }
  const alternative=task.required?null:sameDay.find(e=>api.catalog(task.subject,plan.profile).some(c=>api.contextKey(task.subject,c.context)===api.contextKey(task.subject,e.context)));
  return {plan,task,completed:plan.tasks.filter(t=>t.status==='completed').length,total:plan.tasks.length,index:plan.tasks.indexOf(task)+1,phase:task.status==='completed'?3:task.studyConfirmed?2:1,alternative};
 }
 const icons={reading:'📖',korean_vocab:'📚',english:'🔤',grammar:'🧩',english_reading:'📗',math:'🧮',math_formula:'📐',hanja:'🏮'};
 function phases(phase){return `<ol class="journey-phases" aria-label="과목 진행"><li class="${phase>1?'done':'active'}">${phase>1?'✓':'1'} 📖 학습</li><li class="${phase>2?'done':phase===2?'active':''}">${phase>2?'✓':'2'} ✏️ 퀴즈</li><li class="${phase===3?'active':''}">✓ 완료</li></ol>`;}
 function openUnit(user,taskId,changed){
  const s=state(user,taskId);if(!s||repo.getActiveUser()!==user)return;
  const dialog=document.createElement('dialog');dialog.className='journey-dialog';dialog.setAttribute('aria-label','단원 선택');
  const choices=api.catalog(s.task.subject,s.plan.profile);
  dialog.innerHTML=`<h2>${names[s.task.subject]} 단원 바꾸기</h2>${s.task.required&&s.phase!==3?'<p>보호자가 정한 필수 단원이에요.</p>':`<p>학습 기록은 그대로 보관해요.</p><select aria-label="학습할 단원">${choices.map((c,i)=>`<option value="${i}">${escape(c.label)}</option>`).join('')}</select><button class="journey-primary" data-choose>${s.phase===3?'선택 단원 자유 학습':'이 단원으로 변경'}</button>`}<p class="journey-message" role="status"></p><button class="journey-secondary" data-close>닫기</button>`;
  document.body.append(dialog);dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove());
  const choose=dialog.querySelector('[data-choose]');
  if(choose)choose.onclick=()=>{try{if(repo.getActiveUser()!==user)throw Error('계정이 바뀌었어요. 다시 열어 주세요.');const choice=choices[Number(dialog.querySelector('select').value)];if(!choice)throw Error('선택할 단원이 없어요.');
   if(s.phase===3){try{root.sessionStorage.removeItem('SmartStudy_TodayFlow');}catch(_){}root.location.href=api.target(s.task.subject,choice.context);return;}
   api.selectContext(s.plan.id,user,taskId,choice.context);dialog.close();changed?.();
  }catch(error){dialog.querySelector('.journey-message').textContent=error.message;}};
  const selected=choices.findIndex(c=>api.contextKey(s.task.subject,c.context)===api.contextKey(s.task.subject,s.task.context));if(selected>=0&&dialog.querySelector('select'))dialog.querySelector('select').value=String(selected);
  dialog.showModal();
 }
 function check(user,taskId,box,changed){
  if(repo.getActiveUser()!==user)return;
  const s=state(user,taskId);if(!s)return;
  box.replaceChildren();
  const text=document.createElement('p');text.setAttribute('role','status');box.append(text);
  if(repo.areReportsPersisted?.(user)===false){
   text.textContent='답안을 아직 이 기기에 저장하지 못했어요. 창을 닫지 말고 다시 저장해 주세요.';
   const retry=document.createElement('button');retry.textContent='다시 저장';
   retry.onclick=async()=>{retry.disabled=true;try{await repo.retryPersistence();if(repo.getActiveUser()===user)changed?.();}catch(_){text.textContent='저장 공간을 확인한 뒤 다시 시도해 주세요. 답안은 유지 중이에요.';retry.disabled=false;}};box.append(retry);return;
  }
  if(s.phase===3){text.textContent='퀴즈 제출을 확인했어요. 다음으로 갈 수 있어요.';changed?.();return;}
  if(s.alternative){text.textContent='오늘 다른 단원의 퀴즈를 제출했어요.';
   const use=document.createElement('button');use.className='journey-secondary';use.textContent='푼 단원으로 오늘 계획 연결';
   use.onclick=()=>{try{if(repo.getActiveUser()!==user)return;api.selectContext(s.plan.id,user,taskId,s.alternative.context);api.refreshEvidence(user);changed?.();}catch(error){text.textContent=error.message;}};box.append(use);
  }else text.textContent=(s.task.required?'지정된 단원':'이 단원')+'의 퀴즈 완료 기록이 아직 없어요. '+(['english','hanja','reading','korean_vocab','grammar','english_reading'].includes(s.task.subject)?'퀴즈를 끝까지 풀고 결과 화면까지 확인해 주세요.':'답을 모두 고른 뒤 채점·제출 버튼을 눌러 주세요.');
 }
 function quiz(user,taskId,box,changed){
  const s=state(user,taskId);if(!s||repo.getActiveUser()!==user)return;
  if(s.task.subject==='math'&&root.location.pathname.endsWith('math_quiz.html')){
   document.querySelector('.quiz-card')?.scrollIntoView({block:'start',behavior:'smooth'});return;
  }
  const active=document.querySelector('#quizModeBtn.active');
  if(active){document.querySelector('#quizView, #quizPanel, #content')?.scrollIntoView({block:'start',behavior:'smooth'});return;}
  const button=document.querySelector('#practiceQuiz, #startQuiz, #quizModeBtn');
  const timer=typeof StudyTimer!=='undefined'?StudyTimer.getActiveStatus?.(s.task.subject):null;
  if(timer&&!timer.unlocked){box.textContent=`퀴즈 전 학습이 ${Math.ceil(timer.remainingSeconds/60)}분 남았어요.`;return;}
  if(!button&&!root.location.pathname.endsWith('math_viewer.html')&&!root.location.pathname.endsWith('math.html')){root.location.href=s.task.targetUrl;return;}
  s.task.studyConfirmed=true;s.task.status='in_progress';s.task.startedAt=s.task.startedAt||Date.now();api.startTask(user,taskId);api.savePlan(s.plan);
  if(s.task.subject==='math'){
   const c=s.task.context;root.location.href=`math_quiz.html?level=${encodeURIComponent(c.levelId)}&semester=${encodeURIComponent(c.semesterId)}&unit=${encodeURIComponent(c.unitId)}&type=basic`;return;
  }
  if(button)button.click();changed?.();
 }
 function renderPlan(user){
  const plan=api.refreshEvidence(user);if(!plan||repo.getActiveUser()!==user)return;
  const next=app.LearningProgress.nextTask(plan.tasks),completed=plan.tasks.filter(t=>t.status==='completed').length;
  const nextIndex=next?plan.tasks.indexOf(next)+1:plan.tasks.length;
  const hero=document.getElementById('nextActivity');
  hero.innerHTML=`<div class="journey-heading"><span>${completed===plan.tasks.length?'오늘 학습 완료':`${nextIndex} / ${plan.tasks.length}단계`}</span><span>${completed}/${plan.tasks.length} 완료</span></div><progress class="journey-progress" max="${plan.tasks.length||1}" value="${completed}" aria-label="오늘 완료 활동"></progress><nav class="journey-track" aria-label="오늘 학습 순서">${plan.tasks.map((t,i)=>`<span class="${t.status==='completed'?'done':t.id===next?.id?'active':''}" ${t.id===next?.id?'aria-current="step"':''}><b>${t.status==='completed'?'✓':icons[t.subject]||i+1}</b> ${names[t.subject]}</span>`).join('')}</nav><h2>${next?`${icons[next.subject]} ${names[next.subject]}`:completed===plan.tasks.length?'오늘도 수고했어요!':'단원을 선택해 주세요'}</h2><p class="journey-unit">${next?escape(next.context.title):completed===plan.tasks.length?'모든 과목의 퀴즈 제출을 확인했어요.':'아래 과목에서 단원을 골라 주세요.'}</p>${next?phases(next.studyConfirmed?2:1):''}<div class="journey-actions">${next?`<a id="continueLearning" class="journey-primary" href="${escape(api.entryUrl(user,next))}">${next.studyConfirmed?'학습·퀴즈 이어가기':'학습 시작'} →</a><button id="changeCurrent" class="journey-secondary">${next.required?'지정 단원 확인':'단원 바꾸기'}</button>`:'<a class="journey-primary" href="index.html">홈으로 →</a>'}</div>${next?'<button id="checkCurrent" class="journey-link">퀴즈를 풀었는데 완료가 안 됐나요?</button><div id="journeyRecovery" class="journey-message"></div>':''}`;
  if(next){document.getElementById('continueLearning').onclick=()=>api.startTask(user,next.id);document.getElementById('changeCurrent').onclick=()=>openUnit(user,next.id,()=>renderPlan(user));document.getElementById('checkCurrent').onclick=()=>check(user,next.id,document.getElementById('journeyRecovery'),()=>renderPlan(user));}
  const container=document.getElementById('tasks');container.replaceChildren();
  for(const t of plan.tasks){const card=document.createElement('details');card.className=`task ${t.id===next?.id?'is-next':''} ${t.status==='completed'?'is-done':''}`;
   card.innerHTML=`<summary><span class="task-title">${names[t.subject]}</span><span class="task-count">${t.status==='completed'?'✓ 완료':t.id===next?.id?'진행할 차례':'대기'}</span><span class="tag">${t.minutes}분</span></summary><div class="task-body"><p>${escape(t.context?.title||'단원 선택 필요')}</p><div class="journey-actions">${t.context?`<a class="go" href="${escape(api.entryUrl(user,t))}">${t.status==='completed'?'다시 학습':'이 과목 시작'} →</a>`:''}<button class="journey-secondary">${t.required&&t.status!=='completed'?'지정 단원 확인':'단원 바꾸기'}</button></div></div>`;
   const link=card.querySelector('a');if(link)link.onclick=()=>{if(t.status!=='completed')api.startTask(user,t.id);};card.querySelector('button').onclick=()=>openUnit(user,t.id,()=>renderPlan(user));container.append(card);
  }
  document.getElementById('timeNote').textContent='퀴즈 결과가 저장되면 과목이 완료돼요. 목표 시간은 학습 안내예요.';
 }
 app.TodayJourney={state,phases,openUnit,check,quiz,renderPlan,names};
})(window);

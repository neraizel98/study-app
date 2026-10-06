(async function(){
    'use strict';
    const app=window.SmartStudy,local=app.LocalRepository;
    await local.ready;
    const user=local.getActiveUser(),box=document.getElementById('englishWarmup');if(!user||!box)return;
    const key=`SmartStudy_EnglishWarmup_${encodeURIComponent(user)}`,date=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
    let stored=local.getPreference(key,{history:[]}),session=stored.current?.date===date?stored.current:null,error='';
    if(!session){const built=EnglishWarmup.build(local.listReports(user),stored.history);session={date,items:built.items,patterns:built.patterns,recordCount:built.recordCount,cursor:0};}
    const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    let pendingSeconds=0;
    function flushTime(){const seconds=Math.floor(pendingSeconds);if(seconds>0&&local.getActiveUser()===user){UserSession.updateDailyStat('study_time','english',seconds);pendingSeconds-=seconds;}}
    const clock=app.LearningSession.createClock(seconds=>{if(local.getActiveUser()===user&&!session.items.every(q=>q.response!==undefined)){pendingSeconds+=seconds;if(pendingSeconds>=10)flushTime();}});
    clock.start();let timer=setInterval(()=>clock.tick(),1000);
    box.addEventListener('pointerdown',clock.mark);box.addEventListener('keydown',clock.mark);
    window.addEventListener('pagehide',()=>{clock.stop();flushTime();clearInterval(timer);});
    window.addEventListener('pageshow',event=>{if(event.persisted&&!session.items.every(q=>q.response!==undefined)){clock.start();clearInterval(timer);timer=setInterval(()=>clock.tick(),1000);}});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)flushTime();});
    function save(){
        if(local.getActiveUser()!==user)throw Error('계정이 바뀌었습니다. 원래 계정에서 다시 열어 주세요.');
        const complete=session.items.every(q=>q.response!==undefined);
        const history=(stored.history||[]).filter(x=>x.date!==date);
        if(complete)history.push({date,items:session.items});
        const value={current:session,history:history.slice(-14)};
        if(local.setPreference(key,value)===false)throw Error('복습 기록을 저장하지 못했습니다. 저장 공간을 확인하고 다시 시도해 주세요.');
        stored=value;
    }
    function render(){
        if(local.getActiveUser()!==user){box.textContent='계정이 바뀌었습니다. 현재 계정으로 페이지를 다시 열어 주세요.';return;}
        const count=session.items.filter(q=>q.response!==undefined).length,q=session.items[session.cursor],done=count===3;
        if(done){clock.stop();flushTime();clearInterval(timer);}
        box.innerHTML=`<h2>먼저, 복습 3문항</h2><p class="muted">${session.recordCount?'최근 제출 기록의 오답과 이전 정답을 다시 확인해요.':'기록이 부족해 기초부터 확인해요.'} 최초 평가 점수와 진도를 바꾸지 않아요.</p><p>${count}/3 응답${done?' · 오늘 복습 완료':''}</p>${error?`<p role="alert">${escape(error)}</p><button id="warmupSave" class="go">저장 다시 시도</button>`:''}`;
        if(!done){
            box.insertAdjacentHTML('beforeend',`<p class="muted">${session.cursor+1}/3 · ${escape(q.source)} · ${escape(q.pattern)}</p>${q.passage?.length?`<div class="warmup-passage">${q.passage.map(line=>`<p>${escape(line)}</p>`).join('')}</div>`:''}<h3>${escape(q.question)}</h3><div class="warmup-choices">${q.choices.map((c,i)=>`<button type="button" data-warmup="${i}" ${q.response!==undefined?'disabled':''}>${escape(c)}</button>`).join('')}</div>`);
            box.querySelectorAll('[data-warmup]').forEach(button=>button.onclick=()=>{q.response=q.choices[Number(button.dataset.warmup)];try{save();error='';}catch(e){error=e.message;}render();});
            if(q.response!==undefined){box.insertAdjacentHTML('beforeend',`<div class="warmup-feedback" role="status"><strong>${q.response===q.answer?'정답! 이번에는 정확히 기억했어요.':'이 부분을 다음에도 다시 확인해요.'}</strong><p>내 답: ${escape(q.response)}<br>정답: ${escape(q.answer)}</p><p>${escape(q.explanation)}</p></div><button id="warmupNext" class="go">다음 문항 →</button>`);box.querySelector('#warmupNext').onclick=()=>{session.cursor=Math.min(2,session.cursor+1);try{save();error='';}catch(e){error=e.message;}render();};}
        }else{
            box.insertAdjacentHTML('beforeend',`<p>첫 응답 ${session.items.filter(q=>q.response===q.answer).length}/3 정답 · 아래 단어 → 문법 → 독해를 이어가세요.</p><details><summary>복습 답안 확인</summary>${session.items.map(q=>`<p>${escape(q.question)}<br>내 답: ${escape(q.response)} · 정답: ${escape(q.answer)}<br>${escape(q.explanation)}</p>`).join('')}</details>`);
            const weak=[...new Set(session.items.filter(q=>q.response!==q.answer).map(q=>q.pattern))];
            box.insertAdjacentHTML('beforeend',`<p>${weak.length?`다음 복습에서 다시 확인할 내용: ${weak.map(escape).join(', ')}`:'이번 복습은 모두 정확히 답했어요.'}</p>`);
        }
        if(session.patterns.length)box.insertAdjacentHTML('beforeend',`<details><summary>복습 가능한 오답 유형</summary><p class="muted">최초 응답에서 관찰된 문항 유형입니다. 틀린 심리적 이유나 전체 실력 진단은 아닙니다.</p>${session.patterns.map(p=>`<p>${escape(p.label)} · ${p.count}개</p>`).join('')}</details>`);
        if(error)box.querySelector('#warmupSave').onclick=()=>{try{save();error='';}catch(e){error=e.message;}render();};
    }
    try{save();}catch(e){error=e.message;}render();
    window.addEventListener('focus',render);
})().catch(error=>{console.error('[EnglishWarmup]',error);const box=document.getElementById('englishWarmup');if(box)box.textContent='복습을 불러오지 못했습니다. 아래 과목 학습은 계속할 수 있어요.';});

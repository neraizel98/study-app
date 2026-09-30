(async function(){
    await SmartStudy.LocalRepository.ready;
    const local=SmartStudy.LocalRepository, user=local.getActiveUser();
    if(!user){location.href='index.html';return;}
    const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function render(){
        if(local.getActiveUser()!==user)return;
        const state=EnglishCourse.build(EnglishReadingData,window.vocabData||{},local.listReports(user),local.getWrongAnswers(user));
        if(!state){document.getElementById('courseContent').textContent='학습 자료를 준비 중입니다.';return;}
        const date=window.StudyPeriods?.daily?.()||new Date().toLocaleDateString('sv-SE');
        const settings=local.getPreference(`SmartStudy_ParentPlanSettings_${encodeURIComponent(user)}`,null);
        const api=SmartStudy.LearningPlan;
        let plan=api.getPlan(user)||api.createPlan(user);plan=api.refreshEvidence(user)||plan;
        if(plan.curriculumVersion){
            const tasks=plan.tasks.filter(t=>['english','grammar','english_reading'].includes(t.subject));
            const names={english:'단어 익히기',grammar:'문법 연결하기',english_reading:'지문 읽고 풀기'};
            const next=SmartStudy.LearningProgress.nextTask(tasks);
            document.getElementById('courseContent').innerHTML=`<section class="focus-hero"><span class="focus-eyebrow">ENGLISH · CONNECT &amp; GROW</span><h2>${next?names[next.subject]:'오늘 영어 활동 제출 완료'}</h2><p>오늘 학습과 동일한 범위와 제출 기록입니다. 단어 → 문법 → 독해를 이어가세요.</p>${next?`<a id="continueEnglish" class="focus-primary" href="${escape(next.targetUrl)}">이어서 학습 →</a>`:'<a class="focus-primary" href="today.html">다음 과목으로 →</a>'}</section>`+tasks.map(t=>`<section class="panel"><h2>${names[t.subject]} · ${t.minutes}분</h2><p>${escape(t.context?.title||'지원 자료 없음')}</p><p>${t.status==='completed'?'오늘 제출 확인됨 · 숙달 판정과는 별개입니다.':escape(t.reasonText)}</p>${t.context?`<a class="go" href="${escape(t.targetUrl)}">${t.status==='completed'?'계속 학습':'학습 시작'}</a>`:''}</section>`).join('');
            if(next)document.getElementById('continueEnglish').onclick=()=>api.startTask(user,next.id);
            return;
        }
        const required=plan?.tasks?.find(t=>['english','english_reading'].includes(t.subject)&&t.required&&t.status!=='completed');
        const budget=plan?.tasks?.find(t=>['english','english_reading'].includes(t.subject))?.minutes||({30:10,45:15,60:20}[settings?.budgetMinutes||45]);
        const daily=local.getUser(user)?.dailyStats;
        const seconds=daily?.date===date?['english','grammar','english_reading'].reduce((sum,id)=>sum+Number(daily.learningTime?.[id]||0)+Number(daily.quizTime?.[id]||0),0):0;
        let html=`<section class="panel"><h2>초6 · 기초부터 연결하기</h2><p>오늘 영어 ${budget}분 목표 · 실제 ${Math.floor(seconds/60)}분</p><p class="muted">${state.minutesHint} 단어·문법·독해 시간을 함께 합산합니다.</p><progress value="${state.completed}" max="${state.total}"></progress><p>독해 최초 80% 이상 확인 ${state.completed}/${state.total}지문</p></section>`;
        if(required)html+=`<section class="panel"><h2>보호자 필수 과제 먼저</h2><p>${escape(required.context?.title||'오늘 지정 범위')}를 먼저 마친 뒤 통합 진도를 이어가세요.</p><a class="go" href="today.html">필수 과제 확인</a></section>`;
        if(state.due.length){
            const first=state.due[0],e=first.entry;
            const href=first.subject==='english'?'english.html?mode=review':first.subject==='grammar'?`english_grammar.html?stage=${encodeURIComponent(e.stageId||'elementary')}&unit=${encodeURIComponent(e.unitId||'e1')}&mode=review`:`english_reading.html?level=grade6&unit=${encodeURIComponent(e.unitId||'er1')}&mode=review`;
            html+=`<section class="panel"><h2>먼저, 기억 꺼내기</h2><p>복습 시기가 된 영어 오답 ${state.due.length}개가 있어요. 오늘은 오답 복습부터 시작하세요.</p><a class="go" href="${required?'today.html':href}">오답 복습 시작</a></section>`;
        }
        html+=`<section class="panel"><p>${state.reviewCycle?'전체 과정을 마쳐 오래된 지문부터 다시 확인해요.':'이번 연결 학습'}</p><h2>${escape(state.passage.title)}</h2><p>${escape(state.unit.title)} · 단어와 문법을 익힌 뒤 읽을 지문이에요.</p><div class="word-links">${state.linked.map(w=>w.level?`<a href="english.html?word=${encodeURIComponent(w.word)}">${escape(w.word)}</a>`:`<span>${escape(w.word)}</span>`).join('')}</div><p class="muted">단어장에 없는 새 단어의 뜻과 발음은 독해 학습 화면에서 확인할 수 있어요.</p></section>`;
        html+=state.steps.map((step,index)=>`<section class="panel step ${step.done?'done':''}"><div><h2>${step.done?'✓':index+1} ${step.title}</h2><p>${step.description}</p><p class="muted">${step.done?'최근 7일 이내 최초 80% 이상 확인':state.next.id===step.id?'지금 이어갈 단계':'앞 단계를 익힌 뒤 이어가세요'}</p></div><a class="go" href="${required?'today.html':step.href}">${step.done?'다시 보기':state.next.id===step.id?'이어서 학습':'학습 보기'}</a></section>`).join('');
        html+='<p class="muted">단어·문법은 7일이 지나면 다시 확인합니다. 독해 최초 점수가 80% 미만이면 같은 지문을 보완하고 다시 평가합니다. 재시험 점수로 최초 점수를 덮어쓰지 않습니다. 기존 과목별 성적과 오답 기록은 그대로 사용합니다.</p>';
        document.getElementById('courseContent').innerHTML=html;
    }
    render();window.addEventListener('pageshow',render);window.addEventListener('firemerged',render);window.addEventListener('focus',render);
})();

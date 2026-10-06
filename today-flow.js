(function(root){
    'use strict';
    const app=root.SmartStudy, api=app?.LearningPlan, repo=app?.LocalRepository;
    if(!api||!repo)return;
    const names={reading:'국어 독해',english:'영어 단어',grammar:'영어 문법',english_reading:'영어 독해',math:'수학',math_formula:'수학 공식',hanja:'한자'};
    let panel;
    function render(){
        let intent;
        try{intent=JSON.parse(root.sessionStorage.getItem('SmartStudy_TodayFlow'));}catch(_){return;}
        const user=repo.getActiveUser();
        if(!intent||intent.user!==user||intent.date!==api.today()) {panel?.remove();panel=null;return;}
        const plan=api.refreshEvidence(user), task=plan?.tasks.find(t=>t.id===intent.taskId);
        if(!task){panel?.remove();panel=null;return;}
        if(!panel){
            panel=document.createElement('section');panel.id='todayFlow';panel.setAttribute('aria-label','오늘 학습 진행');
            panel.style.cssText='box-sizing:border-box;width:100%;max-width:100%;padding:14px 18px;margin:12px 0;background:#14273d;color:#e8f3ff;border:1px solid #5982ab;border-radius:12px;line-height:1.6;overflow-wrap:anywhere';
            document.body.prepend(panel);
        }
        panel.replaceChildren();
        const completed=plan.tasks.filter(t=>t.status==='completed').length;
        const title=document.createElement('strong');title.textContent=`오늘 학습 · ${completed}/${plan.tasks.length}활동 제출`;panel.append(title);
        const note=document.createElement('p');note.style.margin='6px 0';
        const next=app.LearningProgress.nextTask(plan.tasks);
        note.textContent=task.status==='completed'?(next?`${names[task.subject]} 제출을 확인했어요. 다음은 ${names[next.subject]}입니다.`:completed===plan.tasks.length?'오늘 계획의 퀴즈를 모두 제출했어요. 수고했어요!':'남은 활동의 학습 범위를 확인해야 해요. 오늘 계획으로 돌아가 주세요.'):`현재 활동: ${names[task.subject]} · ${task.context.title}. 내용을 학습한 뒤 해당 범위의 퀴즈를 끝까지 풀고 제출해 주세요. 첫 퀴즈에서 틀려도 제출하면 다음 활동으로 이어갈 수 있어요.`;
        panel.append(note);
        if(task.status==='completed'&&next){
            const go=document.createElement('a');go.href=api.entryUrl?api.entryUrl(user,next):next.targetUrl;go.textContent=`다음 활동 · ${names[next.subject]} →`;
            go.style.cssText='display:inline-block;padding:10px 14px;border-radius:8px;background:#79beff;color:#071a2e;font-weight:700;text-decoration:none;margin:4px 12px 4px 0';
            go.onclick=()=>api.startTask(user,next.id);panel.append(go);
        }
        const back=document.createElement('a');back.href='today.html';back.textContent=completed===plan.tasks.length?'오늘 학습 결과 보기':'오늘 계획 확인 · 이어하기';back.style.color='#9edbff';panel.append(back);
    }
    repo.ready.then(()=>{
        render();
        app.StorageEvents?.subscribe('reports:saved',()=>queueMicrotask(render));
        root.addEventListener('pageshow',render);root.addEventListener('focus',render);
        root.addEventListener('smartstudy:firebase-merged',render);
    }).catch(error=>console.error('[TodayFlow]',error));
})(window);

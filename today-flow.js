(function(root){
    'use strict';
    const app=root.SmartStudy, api=app?.LearningPlan, repo=app?.LocalRepository;
    if(!api||!repo)return;
    const names={reading:'국어 독해',korean_vocab:'국어 어휘',english:'영어 단어',grammar:'영어 문법',english_reading:'영어 독해',math:'수학',math_formula:'수학 공식',hanja:'한자'};
    const contentHost=()=>document.querySelector('body > .container, body > .viewer-container, body > .quiz-container, body > main');
    const courseReturn=document.querySelector('body > a[href="english_course.html"]'),courseHost=contentHost();
    if(courseReturn?.tagName==='A'&&courseHost){courseReturn.removeAttribute('style');courseReturn.className='subject-course-return';courseHost.append(courseReturn);}
    let panel;
    function element(tag,className,text){const node=document.createElement(tag);node.className=className;if(text)node.textContent=text;return node;}
    function resultActions(user,plan,task){
        const host=document.querySelector('#resultModal .result-actions, #resultModal .actions');
        if(!host)return;
        let box=document.getElementById('todayResultFlow');
        if(!box){box=element('div','today-flow-actions');box.id='todayResultFlow';host.prepend(box);}
        box.replaceChildren();
        if(repo.areReportsPersisted?.(user)===false){
            box.append(element('span','','답안을 저장하고 있어요'));
            const retry=element('button','today-flow-primary','다시 저장');retry.type='button';
            retry.onclick=async()=>{retry.disabled=true;try{await repo.retryPersistence();if(repo.getActiveUser()===user)render();}catch(_){retry.disabled=false;box.firstElementChild.textContent='저장하지 못했어요. 답안은 유지 중이에요.';}};
            box.append(retry);return;
        }
        if(task.status!=='completed')return;
        const next=app.LearningProgress.nextTask(plan.tasks);
        const go=element('a','today-flow-primary',next?`다음 활동 · ${names[next.subject]} →`:'오늘 학습 완료 · 결과 보기');
        go.href=next?api.entryUrl(user,next):'today.html';
        if(next)go.onclick=()=>api.startTask(user,next.id);
        box.append(go);
    }
    function render(){
        let intent;
        try{intent=JSON.parse(root.sessionStorage.getItem('SmartStudy_TodayFlow'));}catch(_){return;}
        const user=repo.getActiveUser();
        if(!intent||intent.user!==user||intent.date!==api.today()){panel?.remove();panel=null;document.getElementById('todayResultFlow')?.remove();return;}
        const plan=api.refreshEvidence(user),task=plan?.tasks.find(t=>t.id===intent.taskId);
        if(!task){panel?.remove();panel=null;return;}
        resultActions(user,plan,task);
        if(!panel){
            const host=contentHost();
            if(!host)return;
            panel=element('section','today-flow');panel.id='todayFlow';panel.setAttribute('aria-label','오늘 학습 진행');
            const anchor=host.querySelector('#app-header')||(host.firstElementChild?.tagName==='NAV'?host.firstElementChild:null);
            if(anchor)anchor.after(panel);else host.prepend(panel);
        }
        panel.replaceChildren();
        const completed=plan.tasks.filter(t=>t.status==='completed').length,next=app.LearningProgress.nextTask(plan.tasks),done=completed===plan.tasks.length;
        const head=element('div','today-flow-head');
        const title=element('h2','today-flow-title',done?'오늘 학습 완료':`오늘 학습 · ${names[task.subject]}`);
        const count=element('span','today-flow-count',`${plan.tasks.indexOf(task)+1}/${plan.tasks.length}단계 · ${completed}완료`);head.append(title,count);panel.append(head);
        const progress=element('progress','today-flow-progress');progress.max=plan.tasks.length;progress.value=completed;progress.setAttribute('aria-label','오늘 활동 제출 진행률');panel.append(progress);
        const note=element('p','today-flow-context');
        note.textContent=task.status==='completed'?(next?`제출을 확인했어요. 다음은 ${names[next.subject]}입니다.`:done?'오늘 계획의 퀴즈를 모두 제출했어요. 수고했어요!':'남은 활동의 학습 범위를 확인해야 해요. 오늘 계획으로 돌아가 주세요.'):task.context.title;
        note.setAttribute('aria-live','polite');panel.append(note);
        if(repo.areReportsPersisted?.(user)===false){
            note.textContent='답안을 저장하고 있어요. 저장 후 다음 활동으로 이어집니다.';
            const retry=element('button','today-flow-primary','다시 저장');
            retry.onclick=async()=>{
                retry.disabled=true;
                try{await repo.retryPersistence();if(repo.getActiveUser()===user)render();}
                catch(_){note.textContent='저장하지 못했어요. 답안은 유지 중이에요. 저장 공간을 확인하고 다시 시도해 주세요.';retry.disabled=false;}
            };
            panel.append(retry);return;
        }
        if(task.status==='completed')panel.append(element('p','today-flow-context','이 기기에 저장됨 · 서버 전송 상태는 동기화 표시에서 확인해 주세요.'));
        const journey=app.TodayJourney,state=journey?.state(user,task.id);
        if(state&&state.phase!==3&&(document.querySelector('#quizModeBtn.active')||root.location.pathname.endsWith('math_quiz.html')))state.phase=2;
        if(state){const phases=element('div','');phases.innerHTML=journey.phases(state.phase);panel.append(phases);}
        const footer=element('div','today-flow-footer');
        if(task.status!=='completed'&&!journey){
            const help=element('details','today-flow-help');help.append(element('summary','','완료 기준 보기'));
            help.append(element('p','','내용을 학습한 뒤 같은 범위의 퀴즈를 끝까지 풀고 제출해 주세요. 첫 퀴즈에서 틀려도 제출하면 다음 활동으로 이어갈 수 있어요.'));footer.append(help);
        }
        const actions=element('div','today-flow-actions');
        if(task.status!=='completed'&&journey){
            const quiz=element('button','today-flow-primary',root.location.pathname.endsWith('english_course.html')?'다음 · 학습 화면 →':state?.phase===2?'퀴즈로 이동 →':'학습했어요 · 퀴즈 시작 →');quiz.type='button';
            quiz.onclick=()=>journey.quiz(user,task.id,panel.querySelector('.journey-message'),render);actions.append(quiz);
            const change=element('button','today-flow-secondary',task.required?'지정 단원 확인':'단원 바꾸기');change.type='button';change.onclick=()=>journey.openUnit(user,task.id,()=>{root.location.href=api.getPlan(user).tasks.find(t=>t.id===task.id).targetUrl;});actions.append(change);
        }
        if(task.status==='completed'&&next){
            const go=element('a','today-flow-primary',`다음 활동 · ${names[next.subject]} →`);go.href=api.entryUrl?api.entryUrl(user,next):next.targetUrl;
            go.onclick=()=>api.startTask(user,next.id);actions.append(go);
        }
        const back=element('a','today-flow-secondary',done?'오늘 결과 보기': '오늘 계획 보기');back.href='today.html';actions.append(back);footer.append(actions);panel.append(footer);
        if(journey&&task.status!=='completed'){
            const retry=element('button','journey-link','퀴즈를 풀었는데 완료가 안 됐나요?');retry.type='button';retry.onclick=()=>journey.check(user,task.id,panel.querySelector('.journey-message'),render);panel.append(retry);
            panel.append(element('div','journey-message'));
        }
    }
    repo.ready.then(()=>{
        render();document.addEventListener?.('click',event=>{if(event.target.closest?.('#quizModeBtn,#startQuiz,#practiceQuiz'))root.setTimeout(render,0);});app.StorageEvents?.subscribe('reports:saved',()=>queueMicrotask(render));
        root.addEventListener('pageshow',render);root.addEventListener('focus',render);root.addEventListener('smartstudy:firebase-merged',render);
        root.addEventListener('smartstudy:storage-committed',render);
    }).catch(error=>console.error('[TodayFlow]',error));
})(window);

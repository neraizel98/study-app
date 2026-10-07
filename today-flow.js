(function(root){
    'use strict';
    const app=root.SmartStudy, api=app?.LearningPlan, repo=app?.LocalRepository;
    if(!api||!repo)return;
    const names={reading:'국어 독해',english:'영어 단어',grammar:'영어 문법',english_reading:'영어 독해',math:'수학',math_formula:'수학 공식',hanja:'한자'};
    const contentHost=()=>document.querySelector('body > .container, body > .viewer-container, body > .quiz-container, body > main');
    const courseReturn=document.querySelector('body > a[href="english_course.html"]'),courseHost=contentHost();
    if(courseReturn?.tagName==='A'&&courseHost){courseReturn.removeAttribute('style');courseReturn.className='subject-course-return';courseHost.append(courseReturn);}
    let panel;
    function element(tag,className,text){const node=document.createElement(tag);node.className=className;if(text)node.textContent=text;return node;}
    function render(){
        let intent;
        try{intent=JSON.parse(root.sessionStorage.getItem('SmartStudy_TodayFlow'));}catch(_){return;}
        const user=repo.getActiveUser();
        if(!intent||intent.user!==user||intent.date!==api.today()){panel?.remove();panel=null;return;}
        const plan=api.refreshEvidence(user),task=plan?.tasks.find(t=>t.id===intent.taskId);
        if(!task){panel?.remove();panel=null;return;}
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
        const count=element('span','today-flow-count',`${completed}/${plan.tasks.length}활동 제출`);head.append(title,count);panel.append(head);
        const progress=element('progress','today-flow-progress');progress.max=plan.tasks.length;progress.value=completed;progress.setAttribute('aria-label','오늘 활동 제출 진행률');panel.append(progress);
        const note=element('p','today-flow-context');
        note.textContent=task.status==='completed'?(next?`제출을 확인했어요. 다음은 ${names[next.subject]}입니다.`:done?'오늘 계획의 퀴즈를 모두 제출했어요. 수고했어요!':'남은 활동의 학습 범위를 확인해야 해요. 오늘 계획으로 돌아가 주세요.'):task.context.title;
        note.setAttribute('aria-live','polite');panel.append(note);
        const footer=element('div','today-flow-footer');
        if(task.status!=='completed'){
            const help=element('details','today-flow-help');help.append(element('summary','','완료 기준 보기'));
            help.append(element('p','','내용을 학습한 뒤 같은 범위의 퀴즈를 끝까지 풀고 제출해 주세요. 첫 퀴즈에서 틀려도 제출하면 다음 활동으로 이어갈 수 있어요.'));footer.append(help);
        }
        const actions=element('div','today-flow-actions');
        if(task.status==='completed'&&next){
            const go=element('a','today-flow-primary',`다음 활동 · ${names[next.subject]} →`);go.href=api.entryUrl?api.entryUrl(user,next):next.targetUrl;
            go.onclick=()=>api.startTask(user,next.id);actions.append(go);
        }
        const back=element('a','today-flow-secondary',done?'오늘 결과 보기': '오늘 계획 보기');back.href='today.html';actions.append(back);footer.append(actions);panel.append(footer);
    }
    repo.ready.then(()=>{
        render();app.StorageEvents?.subscribe('reports:saved',()=>queueMicrotask(render));
        root.addEventListener('pageshow',render);root.addEventListener('focus',render);root.addEventListener('smartstudy:firebase-merged',render);
    }).catch(error=>console.error('[TodayFlow]',error));
})(window);

(function(root){
    'use strict';
    const app=root.SmartStudy=root.SmartStudy||{}, local=app.LocalRepository;
    const key=(user,session)=>`SmartStudy_LearningDraft_${encodeURIComponent(user)}_${encodeURIComponent(session)}`;
    const clone=value=>JSON.parse(JSON.stringify(value));
    function assertOwner(user,draft){
        if(!user||!draft||draft.userId!==user||!draft.sessionId)throw new Error('다른 계정의 학습 초안은 열 수 없습니다.');
    }
    const api={
        get(user,session){
            const draft=local.getPreference(key(user,session),null);
            if(draft)assertOwner(user,draft);
            return draft;
        },
        save(user,draft){
            assertOwner(user,draft);
            const previous=this.get(user,draft.sessionId);
            if(previous?.submittedAt)throw new Error('제출한 학습 결과는 다시 바꿀 수 없습니다.');
            const saved={...clone(draft),updatedAt:Date.now()};
            local.setPreference(key(user,draft.sessionId),saved);
            return saved;
        },
        submit(user,session){
            const draft=this.get(user,session);
            if(!draft)throw new Error('학습 초안을 찾지 못했습니다.');
            if(draft.submittedAt)return draft;
            draft.submittedAt=Date.now();draft.updatedAt=draft.submittedAt;
            local.setPreference(key(user,session),draft);
            return draft;
        },
        createClock(onSeconds){
            let last=Date.now(),activeAt=Date.now(),running=false;
            const mark=()=>{activeAt=Date.now();};
            const tick=()=>{
                const now=Date.now(),delta=Math.min(2,Math.max(0,(now-last)/1000));last=now;
                if(running&&root.document?.visibilityState==='visible'&&now-activeAt<=45000&&delta>0)onSeconds(delta);
            };
            return {start(){last=Date.now();activeAt=last;running=true;},stop(){tick();running=false;},mark,tick};
        }
    };
    app.LearningSession=api;
})(window);

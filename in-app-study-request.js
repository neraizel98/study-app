(function(root){
    'use strict';
    const app=root.SmartStudy=root.SmartStudy||{},repository=app.FirestoreRepository;
    const activeLearner=()=>root.UserSession?.getActiveUser?.()||app.LocalRepository?.getActiveUser?.()||'';
    const pendingKey=learnerId=>`SmartStudy_PendingStudyActivity_${encodeURIComponent(learnerId)}`;
    const lastKey=learnerId=>`SmartStudy_LastStudyActivity_${encodeURIComponent(learnerId)}`;
    let latestRequest=null;
    async function recordActualStart(detail={}){
        await app.LocalRepository?.ready;
        if(document.visibilityState==='hidden')return {recorded:false};
        const learnerId=activeLearner();
        if(!learnerId||learnerId==='우준아빠'||!repository?.recordActualStudyStart)return {recorded:false};
        const startedAt=Number(detail.startedAt||Date.now()),source=detail.source||detail.subject||'study';
        const last=app.LocalRepository?.getPreference?.(lastKey(learnerId),null);
        const newPending=latestRequest?.status==='pending'&&latestRequest.requestId!==last?.requestId;
        if(last&&latestRequest&&startedAt-Number(last.at||0)<15*60*1000&&!newPending)return {recorded:false,duplicate:true,local:true};
        const event={...detail,learnerId,startedAt,source,activityId:detail.activityId||`${source}-${startedAt}`};
        app.LocalRepository?.setPreference?.(pendingKey(learnerId),event);
        const result=await repository.recordActualStudyStart(learnerId,event);
        const pending=app.LocalRepository?.getPreference?.(pendingKey(learnerId),null);
        if((result?.recorded||result?.duplicate)&&activeLearner()===learnerId&&pending?.activityId===event.activityId)
            app.LocalRepository?.setPreference?.(pendingKey(learnerId),null);
        if(result?.recorded||result?.duplicate)app.LocalRepository?.setPreference?.(lastKey(learnerId),{at:startedAt,requestId:result?.acknowledged?result.requestId:null});
        return result;
    }
    async function retryPending(){
        const learnerId=activeLearner();if(!learnerId||learnerId==='우준아빠'||document.visibilityState==='hidden')return;
        const event=app.LocalRepository?.getPreference?.(pendingKey(learnerId),null);if(!event||event.learnerId!==learnerId)return;
        try{const result=await repository.recordActualStudyStart(learnerId,event),pending=app.LocalRepository.getPreference(pendingKey(learnerId),null);if((result?.recorded||result?.duplicate)&&activeLearner()===learnerId&&pending?.activityId===event.activityId){app.LocalRepository.setPreference(pendingKey(learnerId),null);app.LocalRepository.setPreference(lastKey(learnerId),{at:event.startedAt,requestId:result?.acknowledged?result.requestId:null});}}
        catch(error){console.warn('[Study activity retry]',error.message);}
    }
    function showLearnerBanner(request){
        document.getElementById('inAppStudyRequestBanner')?.remove();
        if(!request||request.status!=='pending')return;
        const box=document.createElement('aside');box.id='inAppStudyRequestBanner';
        box.style.cssText='margin:12px auto;padding:12px 15px;max-width:900px;box-sizing:border-box;border:1px solid #58a6ff;border-radius:12px;background:#162b45;color:#e6f2ff;font-weight:700;line-height:1.5;';
        box.append(document.createTextNode('📣 보호자가 공부 시작을 요청했어요. '));
        const link=document.createElement('a');link.href='today.html';link.textContent='오늘 학습 열기';link.style.color='#8bd1ff';box.append(link);
        (document.querySelector('main,.wrap')||document.body).prepend(box);
    }
    function showLearnerError(){
        showLearnerBanner(null);const box=document.createElement('aside');box.id='inAppStudyRequestBanner';
        box.textContent='공부 요청 상태를 확인하지 못했습니다. 계정 연결과 네트워크를 확인해 주세요.';
        box.style.cssText='margin:12px auto;padding:10px 14px;max-width:900px;box-sizing:border-box;border:1px solid #8b949e;border-radius:12px;background:#242b36;color:#d7e0ea;';
        (document.querySelector('main,.wrap')||document.body).prepend(box);
    }
    let stop=null,generation=0;
    async function watchLearnerRequest(){
        await app.LocalRepository?.ready;const currentGeneration=++generation;
        stop?.();stop=null;latestRequest=null;showLearnerBanner(null);const learnerId=activeLearner();
        if(!learnerId||learnerId==='우준아빠'||!repository?.watchStudyRequest||document.visibilityState==='hidden')return;
        const current=()=>currentGeneration===generation&&activeLearner()===learnerId&&document.visibilityState!=='hidden';
        try{const unsubscribe=await repository.watchStudyRequest(learnerId,value=>{if(current()){latestRequest=value;showLearnerBanner(value);}},error=>{if(current()){console.warn('[Study request]',error.message);showLearnerError();}});if(current())stop=unsubscribe;else unsubscribe?.();}
        catch(error){if(current()){console.warn('[Study request]',error.message);showLearnerError();}}
    }
    app.StorageEvents?.subscribe('study:active-start',payload=>recordActualStart({...payload,source:'active-study'}).catch(error=>console.warn('[Study activity]',error.message)));
    document.addEventListener('visibilitychange',()=>{watchLearnerRequest();retryPending();});
    root.addEventListener('online',retryPending);root.addEventListener('focus',retryPending);
    root.addEventListener('firesynced',()=>{watchLearnerRequest();retryPending();});
    root.addEventListener('smartstudy:ready',()=>{watchLearnerRequest();retryPending();});
    document.addEventListener('DOMContentLoaded',()=>{watchLearnerRequest();retryPending();});
    app.InAppStudyRequest={recordActualStart,watchLearnerRequest};
})(window);

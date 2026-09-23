(function(root){
    'use strict';
    const app=root.SmartStudy=root.SmartStudy||{};
    const today=()=>root.StudyPeriods?.daily?.()||new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
    const planKey=(user,date)=>`SmartStudy_DailyPlan_${encodeURIComponent(user)}_${date}`;
    const subjectFromPath=()=>{
        const name=location.pathname.split('/').pop();
        if(name==='reading.html')return'reading';
        if(name==='english.html')return'english';
        if(['math.html','math_viewer.html','math_quiz.html'].includes(name))return'math';
        return null;
    };
    function subjectForUrl(url){const name=url.pathname.split('/').pop();if(name==='reading.html')return'reading';if(name==='english.html')return'english';if(['math.html','math_viewer.html','math_quiz.html'].includes(name))return'math';return null;}
    function matchesUrl(task,url){
        const params=url.searchParams,context=task.context||{};
        if(task.subject==='reading')return params.get('unit')===String(context.unitId||'');
        if(task.subject==='english')return params.get('level')===String(context.unitId||'');
        if(task.subject==='math')return params.get('level')===String(context.levelId||'')
            &&params.get('semester')===String(context.semesterId||'')&&params.get('unit')===String(context.unitId||'');
        return false;
    }
    function banner(task,onTarget){
        if(document.getElementById('parentScopeGuard'))return;
        const box=document.createElement('aside');box.id='parentScopeGuard';
        box.style.cssText='margin:12px auto;padding:12px 15px;max-width:900px;box-sizing:border-box;border:1px solid #ffd166;border-radius:12px;background:#362f1d;color:#fff3c4;font-weight:700;line-height:1.5;';
        box.append(document.createTextNode(onTarget?`📌 보호자 필수 단원 학습 중 · ${String(task.context?.title||'지정 단원')} · 이 단원 퀴즈를 제출한 뒤 오늘 학습으로 돌아오면 자유 학습이 열립니다.`:'📌 먼저 완료할 보호자 지정 단원이 있습니다. '));
        if(!onTarget){const link=document.createElement('a');link.style.color='#8bd1ff';link.href=task.targetUrl;link.textContent=`${String(task.context?.title||'필수 단원')}으로 이동`;box.append(link);}
        (document.querySelector('main,.wrap')||document.body).prepend(box);
    }
    function cachedSettings(user){return app.LocalRepository.getPreference(`SmartStudy_ParentPlanSettings_${encodeURIComponent(user)}`,null);}
    async function settingsWhenMissing(user){
        const cached=cachedSettings(user);if(cached)return cached;
        try{return await Promise.race([app.FirestoreRepository?.getLearnerPlanSettings?.(user),new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),2000))]);}
        catch(error){return null;}
    }
    async function apply(){
        await app.LocalRepository?.ready;
        const user=app.LocalRepository?.getActiveUser?.();if(!user)return;
        const key=planKey(user,today()),plan=app.LocalRepository.getPreference(key,null),subject=subjectFromPath();
        if(!plan){
            if(!subject)return;
            const settings=await settingsWhenMissing(user),scope=settings?.scopes?.[subject];
            if(scope?.mode==='assigned'){location.replace('today.html');return;}
            if(!settings){
                const box=document.createElement('aside');box.id='parentScopeGuard';box.textContent='보호자 필수 범위를 확인하지 못했습니다. 온라인 상태에서 오늘 학습을 먼저 열어 주세요.';
                box.style.cssText='margin:12px auto;padding:12px 15px;max-width:900px;box-sizing:border-box;border:1px solid #8b949e;border-radius:12px;background:#242b36;color:#d7e0ea;';(document.querySelector('main,.wrap')||document.body).prepend(box);
            }
            return;
        }
        const pending=(plan.tasks||[]).filter(task=>task.required&&task.status!=='completed'&&task.context);
        if(!pending.length)return;
        if(location.pathname.endsWith('/index.html')||location.pathname.endsWith('/')){
            pending.forEach(task=>{const link=document.querySelector(`a[href="${task.subject}.html"]`);if(link){link.href=task.targetUrl;link.querySelector('.lang-desc')?.append(' · 보호자 필수 단원 먼저');}});return;
        }
        const task=pending.find(item=>item.subject===subject);if(!task)return;
        const onTarget=matchesUrl(task,new URL(location.href));
        if(!onTarget){location.replace(task.targetUrl);return;}
        banner(task,true);
        if(onTarget&&task.status==='ready'){
            task.status='in_progress';task.startedAt=Date.now();app.LocalRepository.setPreference(key,plan);
        }
        const returnToTarget=event=>{event.preventDefault();event.stopImmediatePropagation();location.href=task.targetUrl;};
        document.addEventListener('click',event=>{
            const link=event.target.closest?.('a[href]');
            if(link){const url=new URL(link.href,location.href);if(subjectForUrl(url)===task.subject&&!matchesUrl(task,url)){returnToTarget(event);return;}}
            const control=event.target.closest?.('[data-unit],[data-level],[data-semester],#nextLesson');if(!control)return;
            const context=task.context||{};
            if(control.dataset.unit&&String(control.dataset.unit)!==String(context.unitId||'')){returnToTarget(event);return;}
            if(control.dataset.level){
                const required=task.subject==='english'?context.unitId:context.levelId;
                if(String(control.dataset.level)!==String(required||'')){returnToTarget(event);return;}
            }
            if(control.dataset.semester&&String(control.dataset.semester)!==String(context.semesterId||'')){returnToTarget(event);return;}
            if(control.id==='nextLesson'&&task.subject==='reading'){
                const params=new URLSearchParams(location.search),level=root.ReadingData?.levels?.[context.levelId],units=level?.units||[];
                const current=units.find(item=>item.id===params.get('unit')),lesson=Number(params.get('lesson')||0);
                if(current&&lesson>=current.lessons.length-1&&units[units.indexOf(current)+1]?.id!==context.unitId)returnToTarget(event);
            }
        },true);
        root.addEventListener('popstate',()=>{if(!matchesUrl(task,new URL(location.href)))location.replace(task.targetUrl);});
    }
    document.addEventListener('DOMContentLoaded',()=>apply().catch(error=>console.warn('[Parent scope]',error.message)));
})(window);

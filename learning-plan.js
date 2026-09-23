(function(root){
    'use strict';
    const app=root.SmartStudy=root.SmartStudy||{}, local=app.LocalRepository;
    const minutesByBudget={30:[8,10,12],45:[12,15,18],60:[15,20,25]};
    const subjects=['reading','english','math'];
    const urls={reading:'reading.html',english:'english.html',math:'math.html'};
    const key=(user,date)=>`SmartStudy_DailyPlan_${encodeURIComponent(user)}_${date}`;
    const settingsKey=user=>`SmartStudy_ParentPlanSettings_${encodeURIComponent(user)}`;
    const today=()=>root.StudyPeriods?.daily?.()||new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
    const defaultScopes=()=>Object.fromEntries(subjects.map(subject=>[subject,{mode:'auto'}]));
    const defaults=user=>({budgetMinutes:45,grade:6,semester:2,scopes:defaultScopes(),source:user==='우준'?'default':'fallback'});
    const normalizeScope=(subject,scope)=>scope?.mode==='assigned'?{
        mode:'assigned',unitId:String(scope.unitId||''),
        ...(scope.levelId?{levelId:String(scope.levelId)}:{}),
        ...(scope.semesterId?{semesterId:String(scope.semesterId)}:{})
    }:{mode:'auto'};
    const normalizeSettings=(user,value)=>{
        const fallback=defaults(user), budgetMinutes=Number(value?.budgetMinutes), grade=Number(value?.grade), semester=Number(value?.semester);
        return {
            budgetMinutes:minutesByBudget[budgetMinutes]?budgetMinutes:fallback.budgetMinutes,
            grade:Number.isInteger(grade)&&grade>=1&&grade<=12?grade:fallback.grade,
            semester:[1,2].includes(semester)?semester:fallback.semester,
            scopes:Object.fromEntries(subjects.map(subject=>[subject,normalizeScope(subject,value?.scopes?.[subject])])),
            source:value?.source||fallback.source
        };
    };
    const contextOf=(subject,item)=>{
        const m=item?.metadata||item||{};
        if(subject==='math')return m.levelId&&m.semesterId&&m.unitId?{levelId:m.levelId,semesterId:String(m.semesterId),unitId:m.unitId,title:m.unitTitle||''}:null;
        if(subject==='reading')return m.unitId?{levelId:m.levelId||'level1',unitId:m.unitId,title:m.passageTitle||m.unitTitle||''}:null;
        if(subject==='english')return m.unitId||m.level?{unitId:m.unitId||m.level,title:m.unitTitle||''}:null;
        return null;
    };
    const contextKey=(subject,context)=>`${subject}:${context?.levelId||''}:${context?.semesterId||''}:${context?.unitId||''}`;
    function allowed(profile,subject,context){
        if(!context)return false;
        if(subject==='math'){
            if(context.levelId==='formula')return false;
            const expectedLevel=profile.grade===6?'elementary-6':profile.grade===7?'middle-1':null;
            if(!expectedLevel||context.levelId!==expectedLevel)return false;
            if(String(context.semesterId)!==String(profile.semester))return false;
        }
        return true;
    }
    function catalog(subject,profile){
        if(subject==='reading')return Object.entries(root.ReadingData?.levels||{}).flatMap(([levelId,level])=>(level.units||[]).map(unit=>({
            label:`${level.title} · ${unit.title}`,context:{levelId,unitId:unit.id,title:unit.title}
        })));
        if(subject==='english')return Object.keys(root.vocabData||{}).map((unitId,index)=>({label:`영어 단어 레벨 ${index+1}`,context:{unitId,title:`영어 단어 레벨 ${index+1}`}}));
        const levelId=profile.grade===6?'elementary-6':profile.grade===7?'middle-1':null,data=levelId&&root.MathData?.[levelId];
        if(!data)return [];
        return (data.semesters?.[profile.semester]?.units||data.units||[]).map(unit=>({label:unit.title,context:{levelId,semesterId:String(profile.semester),unitId:unit.id,title:unit.title}}));
    }
    function target(subject,context){
        if(subject==='math'&&context?.levelId&&context.semesterId&&context.unitId)
            return `math.html?level=${encodeURIComponent(context.levelId)}&semester=${encodeURIComponent(context.semesterId)}&unit=${encodeURIComponent(context.unitId)}`;
        if(subject==='reading'&&context?.unitId)return `reading.html?unit=${encodeURIComponent(context.unitId)}`;
        if(subject==='english'&&context?.unitId)return `english.html?level=${encodeURIComponent(context.unitId)}`;
        return urls[subject];
    }
    function recommend(user,profile,subject){
        const available=new Set(catalog(subject,profile).map(item=>contextKey(subject,item.context)));
        const usable=context=>allowed(profile,subject,context)&&available.has(contextKey(subject,context));
        const reports=local.listReports(user).filter(r=>r.subject===subject&&!r.metadata?.assessment&&r.metadata?.source!=='math-formula'
            &&Number(r.date||0)>=Date.now()-30*86400000)
            .sort((a,b)=>Number(b.updatedAt||b.date||0)-Number(a.updatedAt||a.date||0));
        const wrong=(local.getWrongAnswers(user)[subject]||[]).filter(item=>!item.deleted&&!item.isMastered
            &&(root.LearningPolicy?.isDue?root.LearningPolicy.isDue(item):item.dueAt!=null&&Number(item.dueAt)<=Date.now()));
        for(const item of wrong){
            const context=contextOf(subject,item);
            if(usable(context))return {context,reasonText:'복습할 시기가 된 오답을 먼저 확인해요.'};
        }
        const assessments=local.listReports(user).filter(r=>r.subject===subject&&r.metadata?.assessment)
            .sort((a,b)=>Number(b.updatedAt||b.date||0)-Number(a.updatedAt||a.date||0));
        for(const report of assessments){
            for(const attempt of report.metadata?.attempts||[]){
                if(attempt.correct)continue;
                const context=contextOf(subject,attempt.context||report);
                if(usable(context))return {context,reasonText:'최근 평가에서 틀린 범위를 다시 연습해요.'};
            }
        }
        const examined=new Set();
        for(const report of reports){
            const attempts=report.metadata?.initialAttempts||report.metadata?.attempts||[];
            const context=contextOf(subject,report);
            const key=contextKey(subject,context);
            if(examined.has(key))continue;
            examined.add(key);
            if(!attempts.some(a=>a.correct===false))continue;
            if(usable(context))return {context,reasonText:'이전에 틀린 문제가 있는 단원을 다시 연습해요.'};
        }
        for(const report of reports){
            const context=contextOf(subject,report);
            if(usable(context))return {context,reasonText:'최근 실제로 학습한 범위를 이어서 연습해요.'};
        }
        const fallback=catalog(subject,profile)[0];
        return fallback?{context:fallback.context,reasonText:'학습 기록이 없어 검증된 첫 단원부터 시작해요.'}
            :{context:null,reasonText:'현재 설정에서 사용할 수 있는 단원 자료가 없습니다.'};
    }
    function configuredTask(user,settings,profile,subject,index,date){
        const scope=settings.scopes[subject]||{mode:'auto'};
        let context=null,reasonText='';
        if(scope.mode==='assigned'){
            const choice=catalog(subject,profile).find(item=>contextKey(subject,item.context)===contextKey(subject,scope));
            context=choice?.context||null;
            reasonText=context?'보호자가 지정한 필수 단원이에요. 같은 단원의 퀴즈를 제출하면 완료됩니다.':'보호자가 지정한 단원을 현재 자료에서 찾을 수 없습니다.';
        }else ({context,reasonText}=recommend(user,profile,subject));
        return {id:`${date}-${subject}`,subject,context,minutes:minutesByBudget[settings.budgetMinutes][index],reasonText,
            targetUrl:target(subject,context),assignmentMode:scope.mode,required:scope.mode==='assigned',status:'ready',sessionId:null,startedAt:null,completedAt:null,submittedAt:null};
    }
    const settingsSignature=settings=>JSON.stringify({budgetMinutes:settings.budgetMinutes,grade:settings.grade,semester:settings.semester,scopes:settings.scopes});
    const api={
        budgets:minutesByBudget,subjects,contextOf,contextKey,target,today,catalog,settingsSignature,
        getSettings(user){return normalizeSettings(user,local.getPreference(settingsKey(user),null));},
        applyParentSettings(user,settings){
            const value=normalizeSettings(user,{...settings,source:'parent'});
            local.setPreference(settingsKey(user),value);
            this.getPlan(user);
            return value;
        },
        getProfile(user){
            const settings=this.getSettings(user);
            return {grade:settings.grade,semester:settings.semester};
        },
        getPlan(user,date=today()){
            const plan=local.getPreference(key(user,date),null);
            if(!plan||date!==today())return plan;
            const settings=this.getSettings(user), minutes=minutesByBudget[settings.budgetMinutes];
            const profile={grade:settings.grade,semester:settings.semester},signature=settingsSignature(settings);
            const untouched=plan.tasks.every(task=>task.status==='ready'&&!task.startedAt&&!task.completedAt);
            const needsUpdate=untouched&&(plan.settingsSnapshot!==signature||plan.budget!==settings.budgetMinutes
                || plan.profile?.grade!==profile.grade || plan.profile?.semester!==profile.semester
                || plan.tasks.some((task,index)=>task.minutes!==minutes[index]));
            if(needsUpdate){
                plan.budget=settings.budgetMinutes;plan.profile=profile;plan.settingsSnapshot=signature;
                plan.tasks=subjects.map((subject,index)=>configuredTask(user,settings,profile,subject,index,date));
                local.setPreference(key(user,date),plan);
            }
            return plan;
        },
        savePlan(plan){local.setPreference(key(plan.userId,plan.date),plan);return plan;},
        createPlan(user){
            const settings=this.getSettings(user),profile=this.getProfile(user);
            const existing=this.getPlan(user);if(existing)return existing;
            const safeBudget=settings.budgetMinutes;
            const date=today();
            const tasks=subjects.map((subject,index)=>configuredTask(user,settings,profile,subject,index,date));
            return this.savePlan({id:`${date}-${user}`,userId:user,date,budget:safeBudget,profile,tasks,settingsSnapshot:settingsSignature(settings),createdAt:Date.now()});
        },
        selectContext(planId,user,taskId,context){
            const plan=this.getPlan(user);if(!plan||plan.id!==planId)throw new Error('오늘 계획을 찾지 못했습니다.');
            const task=plan.tasks.find(item=>item.id===taskId);if(!task)return plan;
            if(task.required&&task.status!=='completed')throw new Error('보호자가 지정한 필수 단원은 완료 전 변경할 수 없습니다.');
            if(task.status!=='ready')throw new Error('시작하거나 완료한 과제는 변경할 수 없습니다.');
            const choice=catalog(task.subject,plan.profile).find(item=>contextKey(task.subject,item.context)===contextKey(task.subject,context));
            if(!choice)throw new Error('현재 학습 자료에 없는 단원입니다.');
            task.context=choice.context;task.targetUrl=target(task.subject,choice.context);
            task.status='ready';task.startedAt=null;task.sessionId=null;
            task.reasonText='직접 선택한 단원을 학습해요.';
            return this.savePlan(plan);
        },
        startTask(user,taskId){
            const plan=this.getPlan(user),task=plan?.tasks.find(item=>item.id===taskId);
            if(!task||!task.context)throw new Error('먼저 학습할 단원을 선택해 주세요.');
            if(task.status==='ready'){task.status='in_progress';task.startedAt=Date.now();this.savePlan(plan);}
            return task;
        },
        refreshEvidence(user){
            const plan=this.getPlan(user);if(!plan)return null;
            const reports=local.listReports(user);
            let changed=false;
            for(const task of plan.tasks){
                if(task.status!=='in_progress'||!task.startedAt)continue;
                const expected=contextKey(task.subject,task.context);
                const report=reports.find(r=>r.subject===task.subject&&!r.metadata?.assessment&&r.metadata?.source!=='math-formula'
                    && Number(r.createdAt||r.date||0)>task.startedAt
                    && Number(r.metadata?.submittedAt||0)>task.startedAt
                    && (r.metadata?.initialAttempts||r.metadata?.attempts||[]).length>=Math.max(1,Number(r.totalQuestions)||0)
                    && contextKey(task.subject,contextOf(task.subject,r))===expected);
                if(!report)continue;
                task.status='completed';task.sessionId=report.sessionId;
                task.submittedAt=Number(report.metadata?.submittedAt||report.updatedAt||report.date||0);
                task.completedAt=Date.now();changed=true;
            }
            return changed?this.savePlan(plan):plan;
        }
    };
    app.LearningPlan=api;
})(window);

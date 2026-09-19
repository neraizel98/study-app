(function(root){
    'use strict';
    const app=root.SmartStudy=root.SmartStudy||{}, local=app.LocalRepository;
    const minutesByBudget={30:[8,10,12],45:[12,15,18],60:[15,20,25]};
    const subjects=['reading','english','math'];
    const urls={reading:'reading.html',english:'english.html',math:'math.html'};
    const key=(user,date)=>`SmartStudy_DailyPlan_${encodeURIComponent(user)}_${date}`;
    const profileKey=user=>`SmartStudy_SchoolProfile_${encodeURIComponent(user)}`;
    const today=()=>root.StudyPeriods?.daily?.()||new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
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
        if(subject==='math' && context.levelId==='formula')return false;
        if(profile.grade===6 && subject==='math' && context.levelId!=='elementary-6')return false;
        if(profile.grade===6 && subject==='math' && String(context.semesterId)!==String(profile.semester))return false;
        return true;
    }
    function target(subject,context){
        if(subject==='math'&&context?.levelId&&context.semesterId&&context.unitId)
            return `math.html?level=${encodeURIComponent(context.levelId)}&semester=${encodeURIComponent(context.semesterId)}&unit=${encodeURIComponent(context.unitId)}`;
        if(subject==='reading'&&context?.unitId)return `reading.html?unit=${encodeURIComponent(context.unitId)}`;
        if(subject==='english'&&context?.unitId)return `english.html?level=${encodeURIComponent(context.unitId)}`;
        return urls[subject];
    }
    function recommend(user,profile,subject){
        const reports=local.listReports(user).filter(r=>r.subject===subject&&!r.metadata?.assessment&&r.metadata?.source!=='math-formula'
            &&Number(r.date||0)>=Date.now()-30*86400000)
            .sort((a,b)=>Number(b.updatedAt||b.date||0)-Number(a.updatedAt||a.date||0));
        const wrong=(local.getWrongAnswers(user)[subject]||[]).filter(item=>!item.deleted&&!item.isMastered
            &&(root.LearningPolicy?.isDue?root.LearningPolicy.isDue(item):item.dueAt!=null&&Number(item.dueAt)<=Date.now()));
        for(const item of wrong){
            const context=contextOf(subject,item);
            if(allowed(profile,subject,context))return {context,reasonText:'복습할 시기가 된 오답을 먼저 확인해요.'};
        }
        const assessments=local.listReports(user).filter(r=>r.subject===subject&&r.metadata?.assessment)
            .sort((a,b)=>Number(b.updatedAt||b.date||0)-Number(a.updatedAt||a.date||0));
        for(const report of assessments){
            for(const attempt of report.metadata?.attempts||[]){
                if(attempt.correct)continue;
                const context=contextOf(subject,attempt.context||report);
                if(allowed(profile,subject,context))return {context,reasonText:'최근 평가에서 틀린 범위를 다시 연습해요.'};
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
            if(allowed(profile,subject,context))return {context,reasonText:'이전에 틀린 문제가 있는 단원을 다시 연습해요.'};
        }
        for(const report of reports){
            const context=contextOf(subject,report);
            if(allowed(profile,subject,context))return {context,reasonText:'최근 실제로 학습한 범위를 이어서 연습해요.'};
        }
        return {context:null,reasonText:'학습 기록이 아직 없어요. 오늘 배울 단원을 직접 고르세요.'};
    }
    const api={
        budgets:minutesByBudget,subjects,contextOf,contextKey,target,today,
        getProfile(user){
            return local.getPreference(profileKey(user),null)||(user==='우준'?{grade:6,semester:2,publisher:''}:null);
        },
        saveProfile(user,profile){
            const grade=Math.max(1,Math.min(12,Math.floor(Number(profile.grade)||6)));
            const semester=Number(profile.semester)===1?1:2;
            const value={grade,semester,publisher:String(profile.publisher||'').trim().slice(0,80)};
            local.setPreference(profileKey(user),value);return value;
        },
        getPlan(user,date=today()){return local.getPreference(key(user,date),null);},
        savePlan(plan){local.setPreference(key(plan.userId,plan.date),plan);return plan;},
        createPlan(user,budget=45){
            const profile=this.getProfile(user);if(!profile)throw new Error('학년과 학기를 먼저 설정해 주세요.');
            const existing=this.getPlan(user);if(existing)return existing;
            const safeBudget=minutesByBudget[budget]?budget:45;
            const date=today();
            const tasks=subjects.map((subject,index)=>{
                const {context,reasonText}=recommend(user,profile,subject);
                return {id:`${date}-${subject}`,subject,context,minutes:minutesByBudget[safeBudget][index],reasonText,
                    targetUrl:target(subject,context),status:'ready',sessionId:null,startedAt:null,completedAt:null,submittedAt:null};
            });
            return this.savePlan({id:`${date}-${user}`,userId:user,date,budget:safeBudget,profile,tasks,createdAt:Date.now()});
        },
        updateBudget(user,budget){
            const plan=this.getPlan(user),minutes=minutesByBudget[budget];
            if(!plan||!minutes)return plan;
            plan.budget=Number(budget);
            plan.tasks.forEach((task,index)=>{task.minutes=minutes[index];});
            return this.savePlan(plan);
        },
        selectContext(planId,user,taskId,context){
            const plan=this.getPlan(user);if(!plan||plan.id!==planId)throw new Error('오늘 계획을 찾지 못했습니다.');
            const task=plan.tasks.find(item=>item.id===taskId);if(!task||task.status==='completed')return plan;
            task.context=context;task.targetUrl=target(task.subject,context);
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

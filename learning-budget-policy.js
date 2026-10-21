(function(root){
    'use strict';
    const subjects=Object.freeze(['reading','korean_vocab','english','grammar','english_reading','math','math_formula','hanja']);
    const allocations=Object.freeze({
        30:Object.freeze([5,4,3,3,5,6,2,2]),
        45:Object.freeze([8,6,4,4,7,10,3,3]),
        60:Object.freeze([10,8,5,5,10,14,4,4])
    });
    const api={
        version:2,subjects,allocations,
        allocate(budget){
            if(!allocations[budget])throw new Error('지원하지 않는 하루 목표입니다.');
            return subjects.map((subject,i)=>({subject,minutes:allocations[budget][i]}));
        },
        validateConfiguration(budget,minimums={}){
            const conflicts=this.allocate(budget).filter(t=>Number(minimums[t.subject])>t.minutes)
                .map(t=>({...t,minimumMinutes:Number(minimums[t.subject])}));
            return {valid:conflicts.length===0,conflicts};
        },
        explicitMinimum(subject,context,config={}){
            const level=context?.levelId||context?.unitId;
            const value=config.levels?.[subject]?.[level]??config[subject];
            return value!=null&&value!==''?Math.max(0,Number(value)||0):0;
        },
        conflictsForTasks(tasks,config){
            return tasks.map(t=>({...t,minimumMinutes:this.explicitMinimum(t.subject,t.context,config)}))
                .filter(t=>t.minimumMinutes>t.minutes);
        },
        activeTask(subject){
            try{
                const app=root.SmartStudy,repo=app.LocalRepository,user=repo.getActiveUser();
                const intent=JSON.parse(root.sessionStorage.getItem('SmartStudy_TodayFlow'));
                if(!user||intent?.user!==user||intent.date!==app.LearningPlan.today())return null;
                const plan=repo.getPreference(`SmartStudy_DailyPlan_${encodeURIComponent(user)}_${intent.date}`,null);
                const task=plan?.tasks.find(t=>t.id===intent.taskId&&t.subject===subject&&t.context);
                if(!task||plan.userId!==user||plan.date!==intent.date)return null;
                const current=new URL(root.location.href),target=new URL(task.targetUrl,current);
                const allowed=subject==='math'?['math.html','math_viewer.html','math_quiz.html']:[target.pathname.split('/').pop()];
                if(!allowed.includes(current.pathname.split('/').pop()))return null;
                for(const name of ['level','unit','stage','semester','formula'])
                    if(target.searchParams.has(name)&&current.searchParams.get(name)!==target.searchParams.get(name))return null;
                return task;
            }catch(_){return null;}
        },
        migrate(plan){
            if(!plan||plan.allocationPolicyVersion===this.version)return plan;
            if(plan.tasks?.some(t=>t.status!=='ready'||t.startedAt||t.completedAt||t.submittedAt))return plan;
            if(plan.tasks?.length!==subjects.length||subjects.some(s=>!plan.tasks.some(t=>t.subject===s)))return plan;
            const rows=this.allocate(plan.budget);
            for(const task of plan.tasks)task.minutes=rows.find(t=>t.subject===task.subject).minutes;
            plan.allocationPolicyVersion=this.version;
            return plan;
        }
    };
    (root.SmartStudy=root.SmartStudy||{}).LearningBudgetPolicy=api;
    if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

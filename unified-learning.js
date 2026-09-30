(function(root){
    'use strict';
    const app=root.SmartStudy=root.SmartStudy||{}, local=app.LocalRepository, plan=app.LearningPlan;
    if(!plan)return;
    const ids=['reading','english','grammar','english_reading','math','math_formula','hanja'];
    const allocations={30:[7,3,3,4,8,2,3],45:[10,4,4,7,12,4,4],60:[13,5,5,10,16,6,5]};
    const day=at=>new Date(at).toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'});
    const subjectOf=r=>r.metadata?.source==='math-formula'?'math_formula':r.subject;
    const previousContext=plan.contextOf,previousCatalog=plan.catalog,previousTarget=plan.target;
    function contextOf(subject,r){
        const m=r?.metadata||r||{};
        if(subject==='math_formula')return m.formulaNumber||/^formula-\d+$/.test(m.unitId||'')?{unitId:m.unitId||`formula-${m.formulaNumber}`,title:m.formulaTitle||'',levelId:'formula'}:null;
        if(subject==='grammar')return m.stageId&&m.unitId?{levelId:m.stageId,unitId:m.unitId,title:m.unitTitle||''}:null;
        if(subject==='hanja')return m.unitId?{unitId:m.unitId,title:m.unitTitle||''}:null;
        return previousContext(subject,r);
    }
    function evidence(user){
        const unique=new Map();
        for(const r of local.listReports(user)||[]){
            const m=r.metadata||{}, attempts=m.initialAttempts||m.attempts||[], total=Number(r.totalQuestions);
            if(!r.sessionId||m.assessment||m.status==='draft'||!Number.isInteger(total)||total<1||attempts.length<total)continue;
            if(attempts.slice(0,total).some(a=>typeof a.correct!=='boolean'))continue;
            const at=Number(m.submittedAt||r.createdAt||r.date||0);
            if(!Number.isFinite(at)||at<=0)continue;
            const subject=subjectOf(r),context=contextOf(subject,r);
            if(!context)continue;
            const entry={subject,context,at,report:r,attempts:attempts.slice(0,total)};
            const key=`${subject}:${r.sessionId}`;
            if(!unique.has(key)||Number(r.updatedAt||r.date)>Number(unique.get(key).report.updatedAt||unique.get(key).report.date))unique.set(key,entry);
        }
        return [...unique.values()];
    }
    function catalog(subject,profile){
        if(subject==='hanja')return Object.keys(root.vocabHanja||{}).map(unitId=>({label:`한자 ${unitId.replace('level','')}급`,context:{unitId,title:`한자 ${unitId.replace('level','')}급`}}));
        if(subject==='grammar')return Object.entries(root.EnglishGrammarData||{}).filter(([id])=>profile.grade>6||id==='elementary').flatMap(([levelId,data])=>(data.units||[]).map(u=>({label:`${data.title} · ${u.title}`,context:{levelId,unitId:u.id,title:u.title}})));
        if(subject==='math_formula'){
            const grades={'초6':6,'중1':7,'중2':8,'중3':9,'고1':10,'고2':11,'고3':12};
            return (root.MATH_FORMULAS||[]).filter(f=>grades[f.level]<=profile.grade).map(f=>({label:`${f.level} · ${f.number}. ${f.title}`,context:{levelId:'formula',unitId:`formula-${f.number}`,title:`${f.number}. ${f.title}`}}));
        }
        if(subject==='english_reading'&&profile.grade>6)return previousCatalog(subject,{...profile,grade:6});
        return previousCatalog(subject,profile);
    }
    function target(subject,context){
        if(subject==='math_formula')return `math_formula.html?formula=${encodeURIComponent((context?.unitId||'formula-1').replace('formula-',''))}&mode=study`;
        if(subject==='grammar')return `english_grammar.html?stage=${encodeURIComponent(context?.levelId||'elementary')}&unit=${encodeURIComponent(context?.unitId||'e1')}`;
        if(subject==='hanja')return `hanja.html?level=${encodeURIComponent(context?.unitId||'level8')}`;
        return previousTarget(subject,context);
    }
    function recommend(subject,profile,entries,user){
        const choices=catalog(subject,profile), same=(a,b)=>plan.contextKey(subject,a)===plan.contextKey(subject,b);
        const todayEntry=entries.filter(e=>e.subject===subject&&day(e.at)===plan.today()).sort((a,b)=>b.at-a.at).find(e=>choices.some(c=>same(c.context,e.context)));
        if(todayEntry)return {...choices.find(c=>same(c.context,todayEntry.context)),reason:'오늘 과목 화면에서 제출한 기록을 연결했어요.',todayEvidence:true};
        const wrong=local.getWrongAnswers(user)?.[subject==='math_formula'?'math':subject]||[];
        for(const item of wrong){
            if(item.deleted||item.invalid||item.quarantined||item.isMastered||Number(item.dueAt||0)>Date.now())continue;
            const choice=choices.find(c=>same(c.context,contextOf(subject,item)));
            if(choice)return {...choice,reason:'복습할 오답이 있는 범위를 먼저 확인해요.'};
        }
        // Submission confirms today's activity; passing is only a provisional recommendation signal.
        const passed=c=>entries.filter(e=>e.subject===subject&&same(e.context,c.context)).sort((a,b)=>b.at-a.at)[0];
        const secure=c=>{const e=passed(c);return e&&!e.report.metadata?.review&&!e.report.metadata?.hintUsed&&e.attempts.every(a=>!a.assisted&&!a.hintUsed)&&e.attempts.filter(a=>a.correct).length/e.attempts.length>=.8;};
        const choice=choices.find(c=>!secure(c))||[...choices].sort((a,b)=>(passed(a)?.at||0)-(passed(b)?.at||0))[0];
        return choice?{...choice,reason:'공통 학습 기록을 기준으로 다음 범위를 연결했어요. 숙달 확정은 아니에요.'}:null;
    }
    function upgrade(p){
        if(!p||p.date!==plan.today()||p.curriculumVersion===1)return p;
        if(p.tasks.some(t=>t.status!=='ready'||t.startedAt||t.completedAt))return p;
        const entries=evidence(p.userId), settings=plan.getSettings(p.userId), original=p.tasks;
        const course=root.EnglishCourse?.build(root.EnglishReadingData||{units:[]},root.vocabData||{},local.listReports(p.userId),local.getWrongAnswers(p.userId));
        p.tasks=ids.map((subject,index)=>{
            const existing=original.find(t=>t.subject===subject), assigned=existing?.required;
            let rec=recommend(subject,p.profile,entries,p.userId);
            if(['english','grammar','english_reading'].includes(subject)&&course&&!assigned&&!rec?.todayEvidence){
                const step=course.steps.find(s=>s.id===({english:'words',grammar:'grammar',english_reading:'reading'}[subject]));
                const params=new URLSearchParams(step.href.split('?')[1]);
                const linked=subject==='english'?{unitId:params.get('level')}:subject==='grammar'?{levelId:params.get('stage'),unitId:params.get('unit')}:{levelId:'grade6',unitId:course.unit.id};
                const found=catalog(subject,p.profile).find(c=>plan.contextKey(subject,c.context)===plan.contextKey(subject,linked));
                if(found)rec={...found,reason:'영어 통합 과정과 같은 단어·문법·독해 범위예요.'};
            }
            const context=assigned?existing.context:rec?.context||null;
            const linkedPassage=subject==='english_reading'&&course&&!assigned&&!rec?.todayEvidence&&context?.unitId===course.unit.id?`&passage=${encodeURIComponent(course.passage.id)}`:'';
            return {...(existing||{}),id:`${p.date}-${subject}`,subject,context,minutes:allocations[p.budget][index],targetUrl:target(subject,context)+linkedPassage,
                reasonText:assigned?existing.reasonText:rec?.reason||'현재 학년에 맞는 자료가 없습니다.',required:Boolean(assigned),assignmentMode:assigned?'assigned':'auto',status:'ready',startedAt:null,sessionId:null,completedAt:null};
        });
        p.curriculumVersion=1;p.settingsSnapshot=plan.settingsSignature(settings);
        return plan.savePlan(p);
    }
    const oldGet=plan.getPlan.bind(plan), oldCreate=plan.createPlan.bind(plan), oldRefresh=plan.refreshEvidence.bind(plan);
    plan.getPlan=function(user,date){return upgrade(oldGet(user,date));};
    plan.createPlan=function(user){return upgrade(oldCreate(user));};
    plan.contextOf=contextOf;plan.catalog=catalog;plan.target=target;
    const oldSelect=plan.selectContext.bind(plan);
    plan.selectContext=function(planId,user,taskId,context){
        const p=this.getPlan(user),task=p?.tasks.find(t=>t.id===taskId);
        if(!p?.curriculumVersion)return oldSelect(planId,user,taskId,context);
        if(p.id!==planId||!task||task.required||task.status!=='ready')throw Error('진행 중이거나 보호자가 지정한 과제는 변경할 수 없습니다.');
        const choice=catalog(task.subject,p.profile).find(c=>this.contextKey(task.subject,c.context)===this.contextKey(task.subject,context));
        if(!choice)throw Error('학습 자료에 없는 단원입니다.');
        task.context=choice.context;task.targetUrl=target(task.subject,choice.context);task.reasonText='선택한 범위를 공통 기록으로 확인해요.';return this.savePlan(p);
    };
    plan.refreshEvidence=function(user){
        const p=this.getPlan(user);if(!p?.curriculumVersion)return oldRefresh(user);
        const entries=evidence(user);let changed=false;
        for(const t of p.tasks){
            if(t.status==='completed'||!t.context)continue;
            const e=entries.find(e=>e.subject===t.subject&&day(e.at)===p.date&&this.contextKey(t.subject,e.context)===this.contextKey(t.subject,t.context));
            if(!e)continue;
            Object.assign(t,{status:'completed',sessionId:e.report.sessionId,submittedAt:e.at,completedAt:Date.now()});changed=true;
        }
        return changed?this.savePlan(p):p;
    };
    function activity(user,date){
        const u=local.getUser?.(user)||{},d=u.dailyStats?.date===date?u.dailyStats:{},f=u.formulaStudyTime?.date===date?u.formulaStudyTime:{};
        const seconds=Object.fromEntries(ids.map(s=>[s,s==='math_formula'?Math.max(0,Number(f.studySeconds||0)+Number(f.quizSeconds||0)):Math.max(0,Number(d.learningTime?.[s]||0)+Number(d.quizTime?.[s]||0))]));
        return {seconds,total:Object.values(seconds).reduce((a,b)=>a+b,0)};
    }
    function nextTask(tasks){
        const pending=(tasks||[]).filter(t=>t.status!=='completed'&&t.context);
        return pending.find(t=>t.required)||pending.find(t=>t.status==='in_progress')||pending[0]||null;
    }
    app.LearningProgress={nextTask,subjects:ids,evidence,contextOf,subjectOf,activity,allocations};
})(window);

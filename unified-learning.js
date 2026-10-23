(function(root){
    'use strict';
    const app=root.SmartStudy=root.SmartStudy||{}, local=app.LocalRepository, plan=app.LearningPlan;
    if(!plan)return;
    const budgetPolicy=app.LearningBudgetPolicy;
    const ids=budgetPolicy.subjects, allocations=budgetPolicy.allocations;
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
        if(local.areReportsPersisted?.(user)===false)return [];
        const unique=new Map();
        for(const r of local.listReports(user)||[]){
            if((r.userId&&r.userId!==user)||(r.learnerId&&r.learnerId!==user))continue;
            const m=r.metadata||{}, attempts=m.initialAttempts||m.attempts||[], total=Number(r.totalQuestions);
            if(!r.sessionId||m.assessment||m.status==='draft'||!Number.isInteger(total)||total<1||attempts.length<total)continue;
            if(attempts.slice(0,total).some(a=>typeof a.correct!=='boolean'))continue;
            const at=Number(m.submittedAt||r.createdAt||r.date||0);
            if(!Number.isFinite(at)||at<=0)continue;
            const subject=subjectOf(r),context=contextOf(subject,r);
            if(!context)continue;
            if(subject==='english_reading'&&total<5)continue;
            const entry={subject,context,at,report:r,attempts:attempts.slice(0,total)};
            const key=`${subject}:${r.sessionId}`;
            if(!unique.has(key)||Number(r.updatedAt||r.date)>Number(unique.get(key).report.updatedAt||unique.get(key).report.date))unique.set(key,entry);
        }
        return [...unique.values()];
    }
    function rawCatalog(subject,profile){
        if(subject==='hanja')return Object.keys(root.vocabHanja||{}).map(unitId=>({label:`한자 ${unitId.replace('level','')}급`,context:{unitId,title:`한자 ${unitId.replace('level','')}급`}}));
        if(subject==='grammar')return Object.entries(root.EnglishGrammarData||{}).filter(([id])=>profile.allGrades||id===(root.SmartStudy?.SubjectProgression&&profile.userId?root.SmartStudy.SubjectProgression.resolve('grammar',root.SmartStudy.SubjectProgression.profileGroup('grammar',profile.grade),profile.userId):(root.EnglishCurriculum?.grammarForProfile(profile.grade)||'elementary'))).flatMap(([levelId,data])=>(data.units||[]).map(u=>({label:`${data.title} · ${u.title}`,context:{levelId,unitId:u.id,title:u.title}})));
        if(subject==='math_formula'){
            const grades={'초6':6,'중1':7,'중2':8,'중3':9,'고1':10,'고2':11,'고3':12};
            return (root.MATH_FORMULAS||[]).filter(f=>!f.enrichment&&grades[f.level]<=profile.grade).map(f=>({label:`${f.level} · ${f.number}. ${f.title}`,context:{levelId:'formula',unitId:`formula-${f.number}`,title:`${f.number}. ${f.title}`}}));
        }
        return previousCatalog(subject,profile);
    }
    function catalog(subject,profile){
        const rows=rawCatalog(subject,profile),progression=root.SmartStudy?.SubjectProgression;
        if(!progression||!profile.userId||profile.allGrades||!['reading','grammar','english_reading'].includes(subject))return rows;
        return rows.map(row=>{
            const internal=subject==='reading'?root.KoreanReadingCurriculum?.gradeOfUnit(row.context.unitId):row.context.levelId;
            const title=String(row.context.title||'').replace(/^(?:중|고)[1-3](?:학년)?\s*[·:.-]?\s*/, '');
            return {...row,label:`${progression.label(subject,internal)} · ${title}`,context:{...row.context,title}};
        });
    }
    function target(subject,context){
        if(subject==='math_formula')return `math_formula.html?formula=${encodeURIComponent((context?.unitId||'formula-1').replace('formula-',''))}&mode=study`;
        if(subject==='grammar')return `english_grammar.html?stage=${encodeURIComponent(context?.levelId||'elementary')}&unit=${encodeURIComponent(context?.unitId||'e1')}`;
        if(subject==='hanja')return `hanja.html?level=${encodeURIComponent(context?.unitId||'level8')}`;
        return previousTarget(subject,context);
    }
    function mastery(user,subject,context){
        if(!root.ConceptMastery||!root.LearningPolicy)return null;
        const rawSubject=subject==='math_formula'?'math':subject;
        const metadata={...context,stageId:context?.levelId};
        if(subject==='math_formula'){
            const f=(root.MATH_FORMULAS||[]).find(f=>`formula-${f.number}`===context?.unitId);
            metadata.semesterId=f?.level;
        }
        return root.ConceptMastery.evaluate(local.listReports(user),rawSubject,root.LearningPolicy.context(rawSubject,metadata));
    }
    // Promotion: a unit the learner has clearly outgrown (high first-attempt average over several
    // quizzes, or many quizzes at a solid average) is no longer suggested; the next one is.
    // Mastery checks with spaced reviews stay as they are; this only stops "100점이 뻔한" repeats.
    const PROMOTION={windowDays:30,recent:5,minSessions:3,highAverage:.9,manySessions:8,solidAverage:.8,lastAtLeast:.8};
    function performance(subject,context,entries){
        const since=Date.now()-PROMOTION.windowDays*86400000;
        const sessions=entries.filter(e=>e.subject===subject&&Number(e.report.totalQuestions)>=5&&e.at>=since&&plan.contextKey(subject,e.context)===plan.contextKey(subject,context)
            &&!e.report.metadata?.review&&!e.report.metadata?.hintUsed&&e.attempts.every(a=>!a.assisted&&!a.hintUsed)
            &&(subject!=='reading'||!root.KoreanReadingCurriculum||root.KoreanReadingCurriculum.isCurrentPassageId(e.report.metadata?.passageId)))
            .sort((a,b)=>b.at-a.at);
        const scores=sessions.map(e=>e.attempts.filter(a=>a.correct).length/e.attempts.length);
        const recent=scores.slice(0,PROMOTION.recent),average=recent.length?recent.reduce((a,b)=>a+b,0)/recent.length:0;
        return {sessions:sessions.length,average,last:scores[0]??0};
    }
    function outgrown(stats){
        if(stats.last<PROMOTION.lastAtLeast)return false;
        return (stats.sessions>=PROMOTION.minSessions&&stats.average>=PROMOTION.highAverage)
            ||(stats.sessions>=PROMOTION.manySessions&&stats.average>=PROMOTION.solidAverage);
    }
    function recommend(subject,profile,entries,user){
        const choices=catalog(subject,profile), same=(a,b)=>plan.contextKey(subject,a)===plan.contextKey(subject,b);
        const stats=new Map(choices.map(c=>[plan.contextKey(subject,c.context),performance(subject,c.context,entries)]));
        const statsOf=c=>stats.get(plan.contextKey(subject,c.context));
        // A curriculum lesson may move on after successful practice. This is not mastery:
        // repeated answers remain excluded from ConceptMastery and adaptive score evidence.
        const readingPassed=c=>{
            if(subject!=='reading'||!root.KoreanReadingCurriculum)return false;
            const e=entries.filter(e=>e.subject==='reading'&&same(e.context,c.context)&&root.KoreanReadingCurriculum.isCurrentPassageId(e.report.metadata?.passageId))
                .sort((a,b)=>b.at-a.at)[0];
            return Boolean(e&&!e.report.metadata?.hintUsed&&e.attempts.every(a=>!a.assisted&&!a.hintUsed)
                &&e.attempts.filter(a=>a.correct).length/e.attempts.length>=.8);
        };
        const isOutgrown=c=>readingPassed(c)||outgrown(statsOf(c));
        const todayEntry=entries.filter(e=>e.subject===subject&&day(e.at)===plan.today()).sort((a,b)=>b.at-a.at).find(e=>choices.some(c=>same(c.context,e.context)&&!outgrown(statsOf(c))));
        if(todayEntry)return {...choices.find(c=>same(c.context,todayEntry.context)),reason:'오늘 과목 화면에서 제출한 기록을 연결했어요.',todayEvidence:true};
        const wrong=local.getWrongAnswers(user)?.[subject==='math_formula'?'math':subject]||[];
        for(const item of wrong){
            if(item.deleted||item.invalid||item.quarantined||item.isMastered||Number(item.dueAt||0)>Date.now())continue;
            const choice=choices.find(c=>same(c.context,contextOf(subject,item)));
            // An outgrown unit's wrong answers stay in the wrong-note review instead of pulling the plan back.
            if(choice&&!isOutgrown(choice))return {...choice,reason:'복습할 오답이 있는 범위를 먼저 확인해요.'};
        }
        const assessments=(local.listReports(user)||[]).filter(r=>r.metadata?.assessment&&(!r.metadata.mockExam||r.metadata.resultVisibility==='published')&&subjectOf(r)===subject).sort((a,b)=>Number(b.date)-Number(a.date));
        const assessed=new Set();
        for(const report of assessments)for(const attempt of report.metadata.initialAttempts||report.metadata.attempts||[]){
            const c=attempt.context||contextOf(subject,report),id=plan.contextKey(subject,c);
            if(assessed.has(id))continue;
            const sameAttempts=(report.metadata.initialAttempts||report.metadata.attempts||[]).filter(a=>plan.contextKey(subject,a.context||contextOf(subject,report))===id);
            assessed.add(id);if(!sameAttempts.some(a=>a.correct===false))continue;
            const corrected=entries.some(e=>e.subject===subject&&e.at>Number(report.metadata.submittedAt||report.date)&&same(e.context,c)&&!e.report.metadata?.review&&e.attempts.every(a=>!a.assisted&&!a.hintUsed)&&e.attempts.filter(a=>a.correct).length/e.attempts.length>=.8);
            const choice=choices.find(x=>same(x.context,c));
            if(choice&&!corrected)return {...choice,reason:'주간 평가에서 확인된 약점을 먼저 보충해요.'};
        }
        const scheduled=choices.find(c=>!isOutgrown(c)&&mastery(user,subject,c.context)?.concepts.some(x=>x.reviewDue));
        if(scheduled)return {...scheduled,reason:'시간을 두고 기억을 확인할 차례예요. 새 문제 실력과 복습 결과를 따로 기록해요.'};
        // Submission confirms today's activity; passing is only a provisional recommendation signal.
        const passed=c=>entries.filter(e=>e.subject===subject&&same(e.context,c.context)&&(subject!=='reading'||!root.KoreanReadingCurriculum||root.KoreanReadingCurriculum.isCurrentPassageId(e.report.metadata?.passageId))).sort((a,b)=>b.at-a.at)[0];
        const secure=c=>{const state=mastery(user,subject,c.context);if(state)return state.concepts.length>0&&state.concepts.every(x=>x.name!=='foundation');const e=passed(c);return e&&!e.report.metadata?.review&&!e.report.metadata?.hintUsed&&e.attempts.every(a=>!a.assisted&&!a.hintUsed)&&e.attempts.filter(a=>a.correct).length/e.attempts.length>=.8;};
        const open=choices.filter(c=>!isOutgrown(c));
        const choice=open.find(c=>!secure(c))||open[0]||[...choices].sort((a,b)=>(passed(a)?.at||0)-(passed(b)?.at||0))[0];
        if(!choice)return null;
        // Name the level just outgrown so the step up is visible on the today page.
        const before=choices.slice(0,choices.indexOf(choice)).filter(isOutgrown).at(-1);
        if(before){
            if(readingPassed(before))return {...choice,reason:`${before.label}의 학습 퀴즈를 마쳐 다음 읽기 범위를 제안해요. 새로운 문제의 숙달 평가는 별도로 확인해요.`,promotedFrom:before.context};
            const s=statsOf(before);
            return {...choice,reason:`${before.label}은(는) 최근 첫 시도 평균 ${Math.round(s.average*100)}%(${s.sessions}회)로 충분히 익혔어요. 한 단계 높은 범위를 제안해요.`,promotedFrom:before.context};
        }
        return {...choice,reason:'공통 학습 기록을 기준으로 다음 범위를 연결했어요. 숙달 확정은 아니에요.'};
    }
    function upgrade(p){
        if(!p||p.date!==plan.today())return p;
        if(p.curriculumVersion===1){
            const submitted=evidence(p.userId).some(e=>day(e.at)===p.date&&p.tasks.some(t=>t.subject===e.subject&&plan.contextKey(t.subject,t.context)===plan.contextKey(e.subject,e.context)));
            if(submitted)return p;
            const before=p.allocationPolicyVersion;budgetPolicy.migrate(p);
            const currentPlacement=root.SmartStudy?.SubjectProgression?JSON.stringify(['reading','grammar','english_reading'].map(subject=>root.SmartStudy.SubjectProgression.resolve(subject,root.SmartStudy.SubjectProgression.profileGroup(subject,p.profile.grade),p.userId))):null;
            if((p.recommendationVersion==='20261024-internal-levels'&&p.placementSignature===currentPlacement)||p.tasks.some(t=>t.status!=='ready'||t.startedAt||t.completedAt))return before!==p.allocationPolicyVersion?plan.savePlan(p):p;
        }
        if(p.tasks.some(t=>t.status!=='ready'||t.startedAt||t.completedAt))return p;
        p.profile={...p.profile,userId:p.userId};
        const entries=evidence(p.userId), settings=plan.getSettings(p.userId), original=p.tasks;
        const course=root.EnglishCourse?.build(root.EnglishReadingData||{units:[]},root.vocabData||{},local.listReports(p.userId),local.getWrongAnswers(p.userId),Date.now(),{grade:p.profile.grade,userId:p.userId});
        p.tasks=ids.map((subject,index)=>{
            const existing=original.find(t=>t.subject===subject),scope=settings.scopes?.[subject];
            const assigned=Boolean(existing?.required||scope?.mode==='assigned');
            const assignedChoice=scope?.mode==='assigned'?catalog(subject,{...p.profile,allGrades:true}).find(c=>c.context.unitId===scope.unitId&&(!scope.levelId||c.context.levelId===scope.levelId)&&(!scope.semesterId||String(c.context.semesterId)===String(scope.semesterId))):null;
            let rec=recommend(subject,p.profile,entries,p.userId);
            if(['english','grammar','english_reading'].includes(subject)&&course&&!assigned&&!rec?.todayEvidence&&!rec?.promotedFrom){
                const step=course.steps.find(s=>s.id===({english:'words',grammar:'grammar',english_reading:'reading'}[subject]));
                const params=new URLSearchParams(step.href.split('?')[1]);
                const linked=subject==='english'?{unitId:params.get('level')}:subject==='grammar'?{levelId:params.get('stage'),unitId:params.get('unit')}:{levelId:course.unit.gradeId||'grade6',unitId:course.unit.id};
                const found=catalog(subject,p.profile).find(c=>plan.contextKey(subject,c.context)===plan.contextKey(subject,linked));
                if(found)rec={...found,reason:'영어 통합 과정과 같은 단어·문법·독해 범위예요.'};
            }
            const context=assigned?(assignedChoice?.context||existing?.context||null):rec?.context||null;
            const linkedPassage=subject==='english_reading'&&course&&!assigned&&!rec?.todayEvidence&&!rec?.promotedFrom&&context?.unitId===course.unit.id?`&passage=${encodeURIComponent(course.passage.id)}`:'';
            return {...(existing||{}),id:`${p.date}-${subject}`,subject,context,minutes:allocations[p.budget][index],targetUrl:target(subject,context)+linkedPassage,
                reasonText:assigned?(existing?.reasonText||'보호자가 지정한 단원을 학습해요.'):rec?.reason||'현재 학년에 맞는 자료가 없습니다.',required:Boolean(assigned),assignmentMode:assigned?'assigned':'auto',status:'ready',startedAt:null,sessionId:null,completedAt:null};
        });
        p.curriculumVersion=1;p.recommendationVersion='20261024-internal-levels';p.placementSignature=root.SmartStudy?.SubjectProgression?JSON.stringify(['reading','grammar','english_reading'].map(subject=>root.SmartStudy.SubjectProgression.resolve(subject,root.SmartStudy.SubjectProgression.profileGroup(subject,p.profile.grade),p.userId))):null;p.allocationPolicyVersion=budgetPolicy.version;p.settingsSnapshot=plan.settingsSignature(settings);
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
        if(p.id!==planId||!task||task.required||task.status==='completed')throw Error('완료했거나 보호자가 지정한 과제는 변경할 수 없습니다.');
        const choice=catalog(task.subject,p.profile).find(c=>this.contextKey(task.subject,c.context)===this.contextKey(task.subject,context));
        if(!choice)throw Error('학습 자료에 없는 단원입니다.');
        if(outgrown(performance(task.subject,choice.context,evidence(user))))throw Error('충분히 익힌 범위예요. 오늘 학습에서는 다음 범위를 선택하고, 이 범위는 자유 복습에서 풀어 주세요.');
        if(this.contextKey(task.subject,task.context)===this.contextKey(task.subject,choice.context))return p;
        task.previousContexts=[...(task.previousContexts||[]),task.context].slice(-10);task.context=choice.context;task.targetUrl=target(task.subject,choice.context);task.status='ready';task.startedAt=null;task.studyConfirmed=false;task.sessionId=null;task.reasonText='선택한 범위를 공통 기록으로 확인해요.';return this.savePlan(p);
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
    app.LearningProgress={recommendScope:(user,subject)=>recommend(subject,plan.getProfile(user),evidence(user),user),performance,outgrown,promotion:PROMOTION,mastery,nextTask,subjects:ids,evidence,contextOf,subjectOf,activity,allocations};
})(window);

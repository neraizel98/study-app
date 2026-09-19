(function(root){
    'use strict';
    const app=root.SmartStudy=root.SmartStudy||{};
    const subjects=['reading','english','math'];
    const contextOf=(subject,report)=>app.LearningPlan.contextOf(subject,report);
    const keyOf=(subject,context)=>app.LearningPlan.contextKey(subject,context);
    function scopesFromReports(reports,subject){
        const byKey=new Map();
        const monday=new Date();monday.setHours(0,0,0,0);monday.setDate(monday.getDate()-(monday.getDay()+6)%7);
        for(const report of reports.filter(r=>r.subject===subject&&!r.metadata?.assessment&&r.metadata?.source!=='math-formula'
            &&Number(r.date||0)>=monday.getTime())
            .sort((a,b)=>Number(b.date||0)-Number(a.date||0))){
            const context=contextOf(subject,report),attempts=report.metadata?.initialAttempts||report.metadata?.attempts||[];
            if(!context||!attempts.length)continue;
            const key=keyOf(subject,context);
            const scope=byKey.get(key)||{context,learnedWords:new Set(),seenKeys:new Set(),passageIds:new Set()};
            for(const attempt of attempts){
                if(subject==='english'){
                    const bank=new Set((root.vocabData?.[context.unitId]||[]).map(item=>String(item.word).toLowerCase()));
                    const candidates=[attempt.word,attempt.correctAnswer,attempt.question];
                    const learned=candidates.map(value=>String(value||'').toLowerCase()).find(value=>bank.has(value));
                    if(learned)scope.learnedWords.add(learned);
                }
                if(subject==='reading'){
                    if(attempt.questionId)scope.seenKeys.add(String(attempt.questionId));
                    if(attempt.passageId)scope.passageIds.add(String(attempt.passageId));
                }
                if(subject==='math'&&attempt.question)scope.seenKeys.add(`${attempt.question}|${attempt.correctAnswer||''}`);
            }
            if(report.metadata?.passageId)scope.passageIds.add(String(report.metadata.passageId));
            byKey.set(key,scope);
        }
        return [...byKey.values()];
    }
    function buildAssessmentItems({subject,scope,count=5,seenKeys=new Set(),mode='assessment',band='standard'}){
        const requestedCount=Math.max(0,Math.floor(Number(count)||0)),items=[],used=new Set(seenKeys);
        const context=scope.context;
        const push=(item,key)=>{if(items.length<requestedCount&&!used.has(key)){used.add(key);items.push(item);}};
        if(subject==='math'){
            const source=root.MathQuizData?.[context?.unitId]||{};
            const templates=(mode==='practice'&&band==='challenge'?source.advanced:source.basic||[])
                ?.filter(t=>t.difficulty===(mode==='practice'&&band==='foundation'?'easy':'medium'))||[];
            for(let attempt=0;attempt<Math.max(25,requestedCount*20)&&items.length<requestedCount&&templates.length;attempt++){
                try{
                    const template=templates[attempt%templates.length],q=root.Utils.generateMathQuiz(template);
                    if(!q||!q.question||!Array.isArray(q.choices)||q.choices.length<2||!Number.isInteger(Number(q.answer)))continue;
                    const answer=String(q.choices[Number(q.answer)]),key=`${q.question}|${answer}`;
                    push({id:`math:${context.unitId}:${key}`,subject,context,generator:q.generator||template.generator,question:q.question,choices:q.choices.map(String),answer,
                        explanation:q.explanation||'',sourceType:'새 동등문항'},key);
                }catch(error){console.warn('[Assessment math item]',error.message);}
            }
        }else if(subject==='reading'){
            const passages=(root.ReadingPassages||[]).filter(p=>p.unitId===context?.unitId&&p.difficulty==='standard');
            for(const passage of passages){
                for(const q of passage.questions||[]){
                    if(q.difficulty!=='standard'||!Array.isArray(q.choices)||!q.choices.length)continue;
                    const key=String(q.id);
                    push({id:`reading:${key}`,subject,context,question:q.question,choices:q.choices.map(String),answer:String(q.answer),passageId:passage.id,
                        explanation:q.evidence||'',passageTitle:passage.title,passageLines:passage.lines||[],sourceType:'검증된 지문 문항'},key);
                }
            }
        }else if(subject==='english'){
            const words=(root.vocabData?.[context?.unitId]||[]).filter(item=>scope.learnedWords?.has(String(item.word).toLowerCase()));
            const pool=[...new Set(words.map(item=>item.word))];
            if(pool.length>=4)for(const item of words){
                const sentence=String(item.ex||'');
                const expression=new RegExp(`\\b${String(item.word).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'i');
                if(!expression.test(sentence))continue;
                const prompt=`${sentence.replace(expression,'_____')} (뜻: ${item.meaning})`;
                const distractors=pool.filter(word=>word!==item.word
                    &&words.find(entry=>entry.word===word)?.meaning!==item.meaning
                    &&!(item.altWords||[]).includes(word)).slice(0,3);
                if(distractors.length<3)continue;
                const choices=[item.word,...distractors].sort(()=>Math.random()-.5);
                const key=`${item.word}:${sentence}`;
                push({id:`english:${context.unitId}:${item.word}`,subject,context,question:prompt,choices,answer:item.word,
                    explanation:sentence,sourceType:'기존 예문 빈칸 재확인'},key);
            }
        }
        return {items,requestedCount,actualCount:items.length,
            shortfallReason:items.length<requestedCount
                ? '최근 실제 학습 범위에서 검증된 문항이 부족합니다. 학습하지 않은 단원은 평가에 넣지 않았습니다.' : null};
    }
    function buildWeekly(user,requestedPerSubject=5){
        const reports=app.LocalRepository.listReports(user),groups={};
        for(const subject of subjects){
            const scopes=scopesFromReports(reports,subject),items=[];
            for(const scope of scopes){
                const part=buildAssessmentItems({subject,scope,count:requestedPerSubject-items.length,seenKeys:scope.seenKeys});
                items.push(...part.items);
                if(items.length>=requestedPerSubject)break;
            }
            groups[subject]={subject,items,requestedCount:requestedPerSubject,actualCount:items.length,
                shortfallReason:items.length<requestedPerSubject?'최근 학습한 검증 문항이 부족합니다. 미학습 단원은 제외했습니다.':null};
        }
        return groups;
    }
    app.WeeklyAssessment={subjects,scopesFromReports,buildAssessmentItems,buildWeekly};
})(window);

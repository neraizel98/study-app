(function(root){
    'use strict';
    const day=86400000;
    function build(data,vocabulary,reports,wrong,now=Date.now()){
        const valid=(reports||[]).filter(r=>!r.metadata?.review&&!r.metadata?.assessment&&Number(r.totalQuestions)>0&&(r.metadata?.initialAttempts||r.metadata?.attempts||[]).length>=Number(r.totalQuestions));
        const passed=r=>Number(r.initialScore)/Number(r.totalQuestions)>=.8&&!r.metadata?.hintUsed;
        const latest=(subject,match)=>valid.filter(r=>r.subject===subject&&match(r)).sort((a,b)=>Number(b.date)-Number(a.date))[0];
        const items=(data.units||[]).flatMap(unit=>unit.passages.map(passage=>({unit,passage}))).sort((a,b)=>a.passage.band-b.passage.band);
        const readingReport=p=>latest('english_reading',r=>r.metadata?.passageId===p.id);
        const completed=items.filter(x=>passed(readingReport(x.passage)||{}));
        const item=items.find(x=>!passed(readingReport(x.passage)||{}))||[...items].sort((a,b)=>Number(readingReport(a.passage)?.date||0)-Number(readingReport(b.passage)?.date||0))[0];
        if(!item)return null;
        const {passage,unit}=item;
        const linked=passage.vocabulary.map(word=>({ ...word,level:Object.keys(vocabulary).find(level=>vocabulary[level].some(v=>v.word.toLowerCase()===word.word.toLowerCase()))}));
        const levels=[...new Set(linked.map(w=>w.level).filter(Boolean))];
        const grammar=passage.grammarRefs||[];
        const fresh=r=>r&&passed(r)&&now-Number(r.date)<7*day;
        const wordChecks=levels.map(level=>({level,report:latest('english',r=>r.metadata?.unitId===level)}));
        const grammarChecks=grammar.map(ref=>({...ref,report:latest('grammar',r=>r.metadata?.stageId===ref.stageId&&r.metadata?.unitId===ref.unitId)}));
        const due=[];
        for(const subject of ['english','grammar','english_reading'])for(const entry of wrong?.[subject]||[]){
            if(entry.deleted||entry.invalid||entry.quarantined||Number(entry.dueAt||0)>now)continue;
            if(entry.isMastered&&!entry.dueAt)continue;
            due.push({subject,entry});
        }
        const wordPending=wordChecks.find(x=>!fresh(x.report));
        const grammarPending=grammarChecks.find(x=>!fresh(x.report));
        const readingUrl=`english_reading.html?level=grade6&unit=${unit.id}&passage=${passage.id}`;
        const steps=[
            {id:'words',title:'단어 익히기',done:wordChecks.length>0&&wordChecks.every(x=>fresh(x.report)),href:wordPending?`english.html?level=${wordPending.level}`:readingUrl,description:'지문의 핵심 단어를 익히고 연결된 단어 레벨 퀴즈에서 최초 80% 이상을 확인해요.'},
            {id:'grammar',title:'문법 연결하기',done:grammarChecks.length>0&&grammarChecks.every(x=>fresh(x.report)),href:grammarPending?`english_grammar.html?stage=${grammarPending.stageId}&unit=${grammarPending.unitId}&lesson=${grammarPending.lessonIndex||0}`:readingUrl,description:'지문에 쓰인 문법을 복습하고 해당 단원 퀴즈에서 80% 이상을 확인해요.'},
            {id:'reading',title:'지문 읽고 풀기',done:false,href:readingUrl,description:'뜻을 추론하며 읽고 최초 정답률 80% 이상이면 다음 지문으로 이어져요.'}
        ];
        return {passage,unit,linked,steps,due,completed:completed.length,total:items.length,reviewCycle:completed.length===items.length,next:steps.find(x=>!x.done),minutesHint:'오늘 시간이 끝나면 멈춰도 괜찮아요. 다음에는 남은 단계부터 이어갑니다.'};
    }
    root.EnglishCourse={build};if(typeof module!=='undefined')module.exports=root.EnglishCourse;
})(typeof window!=='undefined'?window:globalThis);

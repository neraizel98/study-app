(function(root){
    'use strict';
    const app=root.SmartStudy=root.SmartStudy||{};
    const groups={
        reading:{level1:[7,8,9],level2:[10,11,12]},
        english_reading:{level1:['grade6'],level2:['middle1','middle2','middle3'],level3:['high1','high2','high3']},
        grammar:{level1:['elementary'],level2:['middle','middle2','middle3'],level3:['high1','high2','high3']}
    };
    const normalize=id=>String(id||'level1').replace(/^group/,'level');
    function groupFor(subject,internal){
        return Object.entries(groups[subject]||{}).find(([,ids])=>ids.includes(internal))?.[0]||'level1';
    }
    function profileGroup(subject,grade){
        return subject==='reading'?(Number(grade)>=10?'level2':'level1'):(Number(grade)>=10?'level3':Number(grade)>=7?'level2':'level1');
    }
    function internalOf(subject,report){
        const m=report.metadata||{};
        if(subject==='grammar')return m.stageId||m.levelId;
        if(subject==='english_reading')return m.levelId||'grade6';
        return Number(m.grade)||root.KoreanReadingCurriculum?.gradeOfUnit?.(m.unitId)||7;
    }
    function placement(subject,groupId,reports,user){
        const group=normalize(groupId),ids=groups[subject]?.[group]||groups[subject]?.level1||[];
        let rank=0,window=new Map(),lastAt=0;
        const sessions=new Map();
        for(const report of reports||[]){
            const m=report.metadata||{},total=Number(report.totalQuestions),attempts=m.initialAttempts||m.attempts||[];
            if(report.subject!==subject||!report.sessionId||(user&&report.userId&&report.userId!==user)||(user&&report.learnerId&&report.learnerId!==user))continue;
            if(report.isCompleted===false||m.status==='draft'||report.status==='draft'||m.assessment||m.mockExam||m.review||m.hintUsed||total<5||!Number.isInteger(total)||attempts.length<total)continue;
            const first=attempts.slice(0,total);
            if(first.some(a=>typeof a.correct!=='boolean'||a.assisted||a.hintUsed))continue;
            if(subject==='reading'&&root.KoreanReadingCurriculum&&!root.KoreanReadingCurriculum.isCurrentPassageId(m.passageId))continue;
            const internal=internalOf(subject,report),scope=subject==='grammar'?m.unitId:m.passageId;
            const at=Number(m.submittedAt||report.createdAt||report.date);
            if(!ids.includes(internal)||!scope||!Number.isFinite(at)||at<=0)continue;
            // Count first-submit answers, never a corrected final score.
            const entry={internal,scope,at,score:first.filter(a=>a.correct).length/total,total,session:report.sessionId};
            const old=sessions.get(report.sessionId);
            if(!old||at>old.at)sessions.set(report.sessionId,entry);
        }
        for(const entry of [...sessions.values()].sort((a,b)=>a.at-b.at||String(a.session).localeCompare(String(b.session)))){
            if(entry.internal!==ids[rank])continue;
            window.delete(entry.scope);window.set(entry.scope,entry);
            if(window.size>3)window.delete(window.keys().next().value);
            const rows=[...window.values()],average=rows.reduce((n,row)=>n+row.score,0)/Math.max(1,rows.length);
            if(rank<ids.length-1&&rows.length===3&&average>=.85&&entry.score>=.8){rank++;lastAt=entry.at;window=new Map();}
        }
        const rows=[...window.values()];
        return {groupId:group,internal:ids[rank],rank,samples:rows.length,average:rows.length?Math.round(rows.reduce((n,row)=>n+row.score,0)/rows.length*100):null,lastPromotionAt:lastAt};
    }
    function resolve(subject,groupId,user){
        const learner=user||app.LocalRepository?.getActiveUser?.();
        return placement(subject,groupId,learner?app.LocalRepository?.listReports?.(learner)||[]:[],learner).internal;
    }
    function label(subject,internal){
        const group=groupFor(subject,internal),n=Number(group.slice(-1));
        return `레벨 ${n} · ${subject==='reading'?(n===1?'중학':'고교'):(n===1?'초등':n===2?'중학':'고교')}`;
    }
    app.SubjectProgression={groups,groupFor,profileGroup,placement,resolve,label};
    if(typeof module!=='undefined')module.exports=app.SubjectProgression;
})(typeof window!=='undefined'?window:globalThis);

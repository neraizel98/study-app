/* Explicitly authored readings and notes share the same exact sentence source. */
(function(root){
    'use strict';
    if(root.EnglishReadingExpansion)return;
    const data=root.EnglishReadingData;
    if(!data||!Array.isArray(data.units))throw new Error('Load English reading data before its expansion.');
    const roles={S:['subject','주어'],V:['verb','동사'],O:['object','목적어'],C:['complement','보어'],K:['connector','접속·연결 표현'],T:['modifier','시간을 나타내는 수식어'],P:['modifier','장소를 나타내는 수식어'],A:['modifier','방법·정도·상황을 보충하는 수식어'],R:['modifier','앞 명사를 꾸미는 관계절'],N:['modifier','앞 명사를 꾸미는 구'],B:['modifier','이유를 나타내는 절'],I:['modifier','목적을 나타내는 구·절'],D:['modifier','상황·결과를 덧붙이는 분사구문'],H:['object','목적어 역할의 명사절'],J:['subject','주어 역할의 명사절'],U:['modifier','양보·대조를 나타내는 절'],F:['modifier','조건을 나타내는 절'],E:['modifier','앞 명사의 내용을 풀어 주는 동격 표현'],L:['clause','앞 내용을 풀어 설명하는 절'],W:['clause','앞 절 전체를 받는 관계절']};
    const registered=new Set();
    function ensure(condition,label){if(!condition)throw new Error('Invalid reading expansion: '+label);}
    function register(records){
        ensure(Array.isArray(records),'records');
        const existing=new Set(data.units.flatMap(u=>u.passages.map(p=>p.id))),incoming=new Set();
        const built=records.map(record=>{
            ensure(record&&typeof record.id==='string','passage id');
            ensure(!incoming.has(record.id),record.id+' duplicate in bundle');incoming.add(record.id);
            if(registered.has(record.id))return null;
            ensure(!existing.has(record.id),record.id+' would overwrite old content');
            const match=/^(mr|hr)([123])-unit([12])$/.exec(record.unitId||'');
            ensure(match&&record.gradeId===(match[1]==='mr'?'middle':'high')+match[2],record.id+' grade scope');
            ensure(new RegExp('^'+record.unitId+'-p[456]$').test(record.id),record.id+' stable id');
            ensure([0,1,2].includes(record.band)&&record.title&&record.topic&&record.unitTitle,record.id+' metadata');
            ensure(Array.isArray(record.rows)&&record.rows.length>=7,record.id+' sentences');
            const notes=record.rows.map((row,index)=>{
                ensure(row&&typeof row.parts==='string'&&row.ko,record.id+' sentence '+index);
                const phrases=row.parts.split('~');ensure(phrases.length>=2,record.id+' authored structure');
                const chunks=phrases.map((part,i)=>{const role=roles[part[0]];ensure(role&&part.slice(1).trim().length>0,record.id+' role '+part);return {text:part.slice(1).trim()+(i<phrases.length-1?' ':''),role:role[0],label:role[1]};});
                const sentence=chunks.map(c=>c.text).join('');
                ensure(Array.isArray(row.grammar)&&row.grammar.length===2&&row.grammar.every(v=>typeof v==='string'&&v.length>0),record.id+' grammar');
                ensure(Array.isArray(row.vocabulary)&&row.vocabulary.length>0,record.id+' sentence vocabulary');
                const vocabulary=row.vocabulary.map(v=>{ensure(v.length===3&&v.every(x=>typeof x==='string'&&x.length>0)&&sentence.toLowerCase().includes(v[0].toLowerCase()),record.id+' contextual word '+v[0]);return {word:v[0],meaning:v[1],pos:v[2]};});
                return {sentence,chunks,grammar:[{title:row.grammar[0],explanation:row.grammar[1]}],vocabulary};
            });
            ensure(record.vocabulary?.length>=5&&record.grammarRefs?.length&&record.grammarNotes?.length,record.id+' study support');
            ensure(record.questions?.length===6,record.id+' six questions');
            const questionIds=new Set();
            const questions=record.questions.map(q=>{
                ensure(q.id&&!questionIds.has(q.id)&&q.id.startsWith(record.id+'-q'),record.id+' question ids');questionIds.add(q.id);
                ensure(q.prompt&&q.promptKo&&q.explanation&&['fact','main','vocabulary','reference','evidence','inference'].includes(q.type),q.id+' explanation');
                ensure(q.choices?.length===4&&new Set(q.choices.map(c=>c.trim().toLowerCase())).size===4&&Number.isInteger(q.answerIndex)&&q.answerIndex>=0&&q.answerIndex<4,q.id+' choices');
                ensure(q.evidence?.length&&q.evidence.every(i=>Number.isInteger(i)&&i>=0&&i<notes.length),q.id+' evidence');
                return {...q,choices:q.choices.slice(),evidence:q.evidence.slice()};
            });
            ensure(new Set(questions.map(q=>q.type)).size===6,record.id+' question coverage');
            const passage={id:record.id,title:record.title,topic:record.topic,gradeId:record.gradeId,band:record.band,
                sentences:notes.map(n=>n.sentence),translations:record.rows.map(r=>r.ko),
                vocabulary:record.vocabulary.map(v=>({...v})),grammarRefs:record.grammarRefs.map(r=>({...r})),grammarTags:[...new Set(record.grammarRefs.map(r=>r.unitId))],grammarNotes:record.grammarNotes.map(n=>({...n})),
                source:{kind:'original',note:'스마트 스터디 자체 제작 · 학습용 예시 상황'},questions};
            return {record,passage,notes};
        }).filter(Boolean);
        // Validate the whole bundle before appending; existing IDs and histories stay intact.
        built.forEach(({record})=>{
            const unit=data.units.find(u=>u.id===record.unitId);
            ensure(unit&&unit.gradeId===record.gradeId&&unit.title===record.unitTitle,record.unitId+' existing unit metadata');
        });
        root.EnglishReadingSentenceNotes=root.EnglishReadingSentenceNotes||{};
        built.forEach(({record,passage,notes})=>{data.units.find(u=>u.id===record.unitId).passages.push(passage);root.EnglishReadingSentenceNotes[record.id]=notes;registered.add(record.id);});
        data.version='20261102-reading-expanded';
        return built.length;
    }
    root.EnglishReadingExpansion=Object.freeze({register});
})(window);

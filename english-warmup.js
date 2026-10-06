(function(root){
    'use strict';
    const subjects=new Set(['english','grammar','english_reading']);
    const grammar={e1:'어순·품사',e2:'be동사',e3:'일반동사',e4:'시제',e5:'명령문·조동사',e6:'문장 꾸미기'};
    const basics=[
        {id:'basic-be',subject:'grammar',pattern:'be동사',question:'빈칸에 알맞은 말을 고르세요. I ___ a student.',choices:['am','is','are'],answer:'am',explanation:'주어 I에는 am을 써요. I am a student. / I am happy.'},
        {id:'basic-verb',subject:'grammar',pattern:'일반동사',question:'빈칸에 알맞은 말을 고르세요. She ___ soccer every Sunday.',choices:['play','plays','playing'],answer:'plays',explanation:'현재의 습관을 말할 때, she 뒤의 일반동사에는 보통 s나 es를 붙여요. She plays soccer. / He reads books.'},
        {id:'basic-read',subject:'english_reading',pattern:'독해·근거 확인',question:'지문을 읽고 답하세요. When does Mina read?',passage:['Mina reads a book after dinner. She likes stories about animals.'],choices:['Before dinner.','After dinner.','Before breakfast.'],answer:'After dinner.',explanation:'첫 문장의 after dinner가 근거예요. after는 ‘~후에’라는 뜻이에요.'}
    ];
    function pattern(subject,metadata,attempt){
        if(subject==='english')return '단어·뜻 연결';
        if(subject==='english_reading')return '독해·근거 확인';
        return grammar[attempt.unitId||metadata.unitId]||'문법·문장 구조';
    }
    function candidates(reports,now,vocabulary=root.vocabData||{}){
        const result=[],seen=new Set();
        for(const report of [...(reports||[])].filter(Boolean).sort((a,b)=>Number(b.metadata?.submittedAt||b.date)-Number(a.metadata?.submittedAt||a.date))){
            const m=report.metadata||{},at=Number(m.submittedAt||report.date),attempts=m.initialAttempts||m.attempts;
            if(!subjects.has(report.subject)||m.assessment||m.review||m.status==='draft'||!report.sessionId||!Number.isFinite(at)||at<=0||at>now||!Array.isArray(attempts)||attempts.length<Number(report.totalQuestions)||!(Number(report.totalQuestions)>0))continue;
            for(const a of attempts.slice(0,Number(report.totalQuestions))){
                if(!a||typeof a.correct!=='boolean'||a.assisted||a.hintUsed||a.translationUsed||m.hintUsed)continue;
                let answer=a.correctAnswer||a.answer,choices=a.choices,question=a.question;
                // Older vocabulary records omitted choices. Rebuild only verified meaning questions.
                if(report.subject==='english'&&a.questionType===1&&!Array.isArray(choices)){
                    const words=Object.values(vocabulary).flat(),word=words.find(w=>w.word===a.question&&w.meaning===answer);
                    if(word){
                        const meanings=value=>String(value).split(/[,;/()]/).map(x=>x.trim()).filter(Boolean);
                        const distractors=[...new Set(words.filter(w=>w.word!==word.word&&!meanings(w.meaning).some(x=>meanings(answer).includes(x))).map(w=>w.meaning))].slice(0,2);
                        if(distractors.length===2){choices=[distractors[0],answer,distractors[1]];question=`다음 단어의 뜻을 고르세요: ${word.word}`;}
                    }
                }
                if(typeof a.question!=='string'||!a.question.trim()||typeof answer!=='string'||!Array.isArray(choices)||choices.length<2||choices.some(x=>typeof x!=='string')||!choices.includes(answer)||new Set(choices).size!==choices.length)continue;
                const passage=Array.isArray(a.passageText)?a.passageText.filter(x=>typeof x==='string'&&x.trim()):[];
                if(report.subject==='english_reading'&&!passage.length)continue;
                const id=JSON.stringify([report.subject,a.question,answer,a.passageId||m.passageId||'']);
                if(seen.has(id))continue;seen.add(id);
                result.push({id,subject:report.subject,question,answer,choices:[...choices],passage,explanation:a.explanation||'정답을 확인한 뒤 해당 과목의 학습 내용을 다시 살펴보세요.',pattern:pattern(report.subject,m,a),correct:a.correct,at});
            }
        }
        return result;
    }
    function build(reports,history=[],now=Date.now()){
        const latest=new Map(candidates(reports,now).map(q=>[q.id,q]));
        for(const session of history||[])for(const q of session.items||[]){
            const at=Number(session.completedAt)||Date.parse(`${session.date}T23:59:59+09:00`);
            if(q.response===undefined||!Number.isFinite(at)||at>now||at<(latest.get(q.id)?.at||0))continue;
            latest.set(q.id,{...q,correct:q.response===q.answer,at});
        }
        const all=[...latest.values()].sort((a,b)=>b.at-a.at),wrong=all.filter(q=>!q.correct),right=all.filter(q=>q.correct);
        const items=[],seen=new Set();
        function add(q,source){if(q&&items.length<3&&!seen.has(q.id)){seen.add(q.id);const item={...q,source};delete item.response;items.push(item);}}
        for(const q of wrong){if(items.length>=2)break;add(q,'오답 복습');}
        for(const q of right){const before=items.length;add(q,'기억 확인');if(items.length>before)break;}
        for(const q of basics)add(q,'기초 확인');
        const counts={};for(const q of wrong)counts[q.pattern]=(counts[q.pattern]||0)+1;
        return {items,patterns:Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([label,count])=>({label,count})),recordCount:all.length};
    }
    root.EnglishWarmup={build,candidates};
    if(typeof module!=='undefined')module.exports=root.EnglishWarmup;
})(typeof window!=='undefined'?window:globalThis);

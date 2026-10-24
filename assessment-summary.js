(function (root) {
    'use strict';
    const app = root.SmartStudy = root.SmartStudy || {};
    const names = {reading:'국어 독해',korean_vocab:'국어 어휘',english:'영어 단어',grammar:'영어 문법',english_reading:'영어 독해',math:'수학',math_formula:'수학 공식',hanja:'한자'};
    const icons = {reading:'📖',korean_vocab:'📚',english:'🔤',grammar:'🧩',english_reading:'📗',math:'📐',math_formula:'📏',hanja:'🏮'};
    const el = (tag, cls, text) => {const node=document.createElement(tag);if(cls)node.className=cls;if(text!=null)node.textContent=text;return node;};
    function render(panel, reports) {
        const rows=(reports||[]).filter(Boolean),total=rows.reduce((n,r)=>n+(Number(r.totalQuestions)||0),0),correct=rows.reduce((n,r)=>n+(Number(r.initialScore)||0),0);
        panel.replaceChildren();panel.classList.add('assessment-summary');
        const header=el('div','assessment-heading'),titles=el('div'),label=el('span','assessment-eyebrow','LEARNING REPORT');
        titles.append(label,el('h3',null,'최근 학습 평가'));
        const badge=el('span','assessment-tag',rows.some(r=>r.metadata?.examTraining)?'학습 모의고사':'주간 학습 확인');header.append(titles,badge);
        const overview=el('div','assessment-overview');overview.append(el('span',null,'전체 정답'),el('strong',null,`${correct} / ${total}`),el('span','assessment-percent',total?`${Math.round(correct/total*100)}%`:'—'));
        const grid=el('div','assessment-subjects'),supplements=new Set();
        for(const report of rows){
            const m=report.metadata||{},subject=m.assessmentSubject||report.subject,attempts=m.initialAttempts||m.attempts||[],count=Number(report.totalQuestions)||0,score=Number(report.initialScore)||0,pct=count?Math.max(0,Math.min(100,score/count*100)):0;
            const card=el('article','assessment-subject'),top=el('div','assessment-subject-top'),name=el('div','assessment-subject-name');
            const icon=el('span','assessment-icon',icons[subject]||'📝');icon.setAttribute('aria-hidden','true');
            name.append(icon,el('strong',null,names[subject]||subject));
            const value=el('span',`assessment-score ${pct>=80?'is-strong':'is-review'}`,`${score} / ${count}`);value.setAttribute('aria-label',`${count}문항 중 ${score}문항 정답`);top.append(name,value);
            const track=el('div','assessment-track'),fill=el('span');fill.style.width=`${pct}%`;track.append(fill);track.setAttribute('aria-hidden','true');
            const actual=m.actualCount??count,requested=m.requestedCount??count;
            const meta=el('div','assessment-subject-meta');meta.append(el('span',null,actual===requested?`${actual}문항 출제`:`출제 ${actual} / 계획 ${requested}문항`),el('span',null,`답안 ${attempts.length}개 확인`));
            if(m.periodCounts&&!m.examTraining)meta.append(el('span',null,`이번 주 ${m.periodCounts.current} · 누적 ${m.periodCounts.previous}`));
            card.append(top,track,meta);grid.append(card);
            for(const attempt of attempts.filter(a=>!a.correct)){const context=attempt.context||m,scope=context.title||context.unitTitle||m.unitTitle||m.formulaTitle||(!/모의고사|주간 평가/.test(report.level||'')?report.level:'')||'이번 평가의 오답';supplements.add(`${names[subject]||subject}${scope?' · '+scope:''}`);}
        }
        const follow=el('div','assessment-followup');follow.append(el('h4',null,supplements.size?'다음에 함께 복습해요':'이번 평가를 잘 마쳤어요'));
        if(supplements.size){const chips=el('div','assessment-review-chips');for(const text of supplements)chips.append(el('span',null,text));follow.append(chips);}
        else follow.append(el('p',null,'오답 없이 마쳤어요. 다음 학습도 차근차근 이어 가요.'));
        panel.append(header,overview,grid,follow);
    }
    app.AssessmentSummary={render};
})(window);

(function (root) {
    'use strict';
    const app = root.SmartStudy = root.SmartStudy || {};
    const names = { reading: '국어', korean_vocab: '국어 어휘', english: '영어 단어', grammar: '영어 문법', english_reading: '영어 독해', math: '수학', math_formula: '수학 공식', hanja: '한자' };
    const node = (tag, text, className) => { const el = document.createElement(tag); if (text != null) el.textContent = text; if (className) el.className = className; return el; };
    function setMathText(element, value) {
        element.replaceChildren(); const parts = String(value || '').split(/(\$[^$]+\$)/g);
        for (const part of parts) {
            if (part.startsWith('$') && part.endsWith('$')) {
                const span = node('span'); const formula = part.slice(1, -1);
                if (root.katex?.render) root.katex.render(formula, span, { throwOnError: false, trust: false });
                else span.textContent = formula.replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
                element.append(span);
            } else element.append(document.createTextNode(part));
        }
    }
    const duration = seconds => { const total = Math.max(0, Math.round(Number(seconds) || 0)), m = Math.floor(total / 60), r = total % 60; return m ? `${m}분${r ? ` ${r}초` : ''}` : `${r}초`; };
    // Exams submitted before screen-leave recording have no integrity data and show nothing.
    function integrityText(integrity) {
        if (!integrity || typeof integrity !== 'object') return null;
        const leaves = Math.max(0, Number(integrity.leaves) || 0), translated = integrity.translationDetected === true;
        return { text: `${leaves ? `화면 이탈 ${leaves}회 · 총 ${duration(integrity.awaySeconds)}` : '화면 이탈 없음'} · ${translated ? '번역 감지됨' : '번역 감지 없음'}`, warning: leaves > 0 || translated };
    }
    async function load(user, assessmentId) {
        if (app.LocalRepository.getActiveUser() !== user) return { published: false, reason: 'account' };
        if (!app.MockPublication?.get) return { published: false, reason: 'unavailable' };
        try {
            const result = await app.MockPublication.get(user, assessmentId);
            if (app.LocalRepository.getActiveUser() !== user || result?.published !== true) return { published: false, reason: 'withheld' };
            const local = app.MockExam.getById(user, assessmentId), snapshot = result.snapshot || result.payload || local;
            if (!snapshot || snapshot.userId !== user || snapshot.assessmentId !== assessmentId || !snapshot.submittedAt
                || !snapshot.sections?.every(s => s.state === 'ended')) return { published: false, reason: 'incomplete' };
            try { app.MockWrongNote?.note(user, snapshot.assessmentId, snapshot.initialAttempts || (snapshot.sections || []).flatMap(section => section.initialAttempts || []),snapshot.attemptNo||1); } catch (error) { console.warn('[Mock wrong note]', error); }
            return { published: true, publishedAt: result.publishedAt, snapshot };
        } catch (_) { return { published: false, reason: 'offline' }; }
    }
    function render(container, result) {
        container.replaceChildren();container.classList.add('released-results');
        if (!result?.published) {
            const waiting=node('div',null,'released-waiting');waiting.append(node('span','🔒','assessment-icon'),node('h2','결과를 확인하고 있어요'),node('p',result?.reason==='offline'?'인터넷 연결 후 공개 상태를 다시 확인해 주세요.':'선생님·보호자가 공개하면 점수와 해설을 볼 수 있어요.'));container.append(waiting);return;
        }
        const draft = result.snapshot;
        const heading=node('div',null,'released-heading'),titles=node('div');titles.append(node('span','MY LEARNING REPORT','assessment-eyebrow'),node('h2',`나의 모의고사 · ${draft.attemptNo||1}회차`));heading.append(titles,node('span','결과 공개 완료','assessment-tag'));container.append(heading);
        const all=draft.sections.flatMap(s=>s.initialAttempts||[]),correctAll=all.filter(a=>a.correct).length;
        const overview=node('div',null,'released-overview'),description=node('div');description.append(node('span','전체 정답'),node('p',`${all.length}문항 중 ${correctAll}문항을 맞혔어요`));
        const overall=node('strong',all.length?String(Math.round(correctAll/all.length*100)):'—');overall.append(node('small','점'));overview.append(description,overall);container.append(overview);
        if (result.publishedAt) container.append(node('p', `공개 시각: ${new Date(result.publishedAt).toLocaleString('ko-KR')}`, 'released-date'));
        const grid = node('div', null, 'score-grid');
        for (const section of draft.sections) {
            const attempts = section.initialAttempts || [], correct = attempts.filter(a => a.correct).length;
            const card = node('div', null, 'score-card');
            card.append(node('h3',section.name));const score=node('strong',attempts.length?`${Math.round(correct/attempts.length*100)}점`:'—');score.append(node('small',attempts.length?`${correct} / ${attempts.length} 정답`:'평가 자료 없음'));card.append(score);
            const parts=section.subjects.map(subject=>({subject,attempts:attempts.filter(a=>a.subject===subject)})).filter(part=>part.attempts.length);
            if(parts.length>1)for(const part of parts)card.append(node('p',`${names[part.subject]} ${part.attempts.filter(a=>a.correct).length}/${part.attempts.length}`));
            grid.append(card);
        }
        container.append(grid, node('p', '이 회차의 제출 점수입니다. 다시 응시한 결과는 별도 회차에 기록됩니다.', 'released-first-note'));
        const integrity = integrityText(draft.integrity);
        if (integrity) container.append(node('p', `시험 중 기록 · ${integrity.text}`, `released-integrity${integrity.warning ? ' is-warning' : ''}`));
        for (const section of draft.sections) {
            const detail = node('details',null,'released-details'), summary = node('summary', `${section.name} · 답안과 해설`); detail.append(summary);
            (section.initialAttempts || []).forEach((attempt, index) => {
                const card = node('article', null, `released-question ${attempt.unanswered?'is-empty':attempt.correct?'is-correct':'is-wrong'}`);
                card.append(node('h3', `${index + 1}. ${attempt.question}`), node('p', attempt.unanswered ? '미응답' : attempt.correct ? '정답' : '오답 · 다시 확인', 'released-answer-state'),
                    node('p', `나의 답: ${attempt.selectedAnswer || '미응답'}`), node('p', `정답: ${attempt.correctAnswer}`), node('p', attempt.explanation || '별도 해설이 없습니다.', 'released-explanation'));
                if (['math', 'math_formula'].includes(attempt.subject)) {
                    setMathText(card.children[0], `${index + 1}. ${attempt.question}`);
                    setMathText(card.children[2], `나의 답: ${attempt.selectedAnswer || '미응답'}`);
                    setMathText(card.children[3], `정답: ${attempt.correctAnswer}`);
                    setMathText(card.children[4], attempt.explanation || '별도 해설이 없습니다.');
                }
                detail.append(card);
            });
            container.append(detail);
        }
        container.append(node('a', '오답 복습 이어가기 →', 'review-link')); container.lastChild.href = 'today.html';
    }
    app.MockExamResults = { load, render, setMathText, integrityText };
    if (typeof module !== 'undefined' && module.exports) module.exports = app.MockExamResults;
})(typeof window !== 'undefined' ? window : globalThis);

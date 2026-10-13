(function (root) {
    'use strict';
    const app = root.SmartStudy = root.SmartStudy || {};
    const names = { reading: '국어', english: '영어 단어', grammar: '영어 문법', english_reading: '영어 독해', math: '수학', math_formula: '수학 공식', hanja: '한자' };
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
    async function load(user, assessmentId) {
        if (app.LocalRepository.getActiveUser() !== user) return { published: false, reason: 'account' };
        if (!app.MockPublication?.get) return { published: false, reason: 'unavailable' };
        try {
            const result = await app.MockPublication.get(user, assessmentId);
            if (app.LocalRepository.getActiveUser() !== user || result?.published !== true) return { published: false, reason: 'withheld' };
            const local = app.MockExam.getById(user, assessmentId), snapshot = result.snapshot || result.payload || local;
            if (!snapshot || snapshot.userId !== user || snapshot.assessmentId !== assessmentId || !snapshot.submittedAt
                || !snapshot.sections?.every(s => s.state === 'ended')) return { published: false, reason: 'incomplete' };
            return { published: true, publishedAt: result.publishedAt, snapshot };
        } catch (_) { return { published: false, reason: 'offline' }; }
    }
    function render(container, result) {
        container.replaceChildren();
        if (!result?.published) { container.append(node('p', result?.reason === 'offline' ? '공개 상태를 확인하지 못했어요. 인터넷 연결 후 다시 확인해 주세요.' : '선생님/보호자가 결과를 확인하고 있어요. 공개되면 이곳에서 확인할 수 있어요.')); return; }
        const draft = result.snapshot;
        container.append(node('h2', '공개된 첫 제출 결과'));
        if (result.publishedAt) container.append(node('p', `공개 시각: ${new Date(result.publishedAt).toLocaleString('ko-KR')}`, 'muted'));
        const grid = node('div', null, 'score-grid');
        for (const section of draft.sections) {
            const attempts = section.initialAttempts || [], correct = attempts.filter(a => a.correct).length;
            const card = node('div', null, 'score-card');
            card.append(node('h3', section.name), node('strong', attempts.length ? `${Math.round(correct / attempts.length * 100)}점 · ${correct}/${attempts.length}` : '평가 자료 없음'));
            for (const subject of section.subjects) if (section.subjects.length > 1) {
                const part = attempts.filter(a => a.subject === subject);
                card.append(node('p', `${names[subject]} ${part.filter(a => a.correct).length}/${part.length}`));
            }
            grid.append(card);
        }
        container.append(grid, node('p', '첫 제출 점수입니다. 같은 문제를 다시 확인해도 이 점수는 바뀌지 않습니다.', 'muted'));
        for (const section of draft.sections) {
            const detail = node('details'), summary = node('summary', `${section.name} · 답안과 해설 확인`); detail.append(summary);
            (section.initialAttempts || []).forEach((attempt, index) => {
                const card = node('article', null, 'released-question');
                card.append(node('h3', `${index + 1}. ${attempt.question}`), node('p', attempt.unanswered ? '미응답' : attempt.correct ? '정답' : '오답'),
                    node('p', `나의 답: ${attempt.selectedAnswer || '미응답'}`), node('p', `정답: ${attempt.correctAnswer}`), node('p', attempt.explanation || '별도 해설이 없습니다.'));
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
        container.append(node('a', '일요일 오답 복습으로 이동', 'review-link')); container.lastChild.href = 'today.html';
    }
    app.MockExamResults = { load, render, setMathText };
    if (typeof module !== 'undefined' && module.exports) module.exports = app.MockExamResults;
})(typeof window !== 'undefined' ? window : globalThis);

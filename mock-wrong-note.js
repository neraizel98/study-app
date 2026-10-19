(function (root) {
    'use strict';
    const app = root.SmartStudy = root.SmartStudy || {};
    // Once a result is published, its first-attempt mistakes join the wrong-answer notebook
    // (once per exam), so the regular spaced review and today's plan pick them up.
    function wrongNoteData(attempt) {
        const c = attempt.context || {}, base = { questionId: attempt.questionId, question: attempt.question, choices: attempt.choices, answer: attempt.correctAnswer,
            correctAnswer: attempt.correctAnswer, selectedAnswer: attempt.selectedAnswer, explanation: attempt.explanation, passageId: attempt.passageId,
            passageTitle: attempt.passageTitle, passageText: attempt.passageText, source: 'mock-exam' };
        if (attempt.subject === 'math') return c.levelId && c.semesterId && c.unitId && attempt.generator
            ? ['math', { ...base, levelId: c.levelId, semesterId: String(c.semesterId), unitId: c.unitId, unitTitle: c.title, type: attempt.generator }] : null;
        if (attempt.subject === 'math_formula') {
            const number = Number(String(c.unitId || '').replace('formula-', '')), formula = (root.MATH_FORMULAS || []).find(f => f.number === number);
            return formula ? ['math', { ...base, levelId: 'formula', semesterId: formula.level, unitId: `formula-${number}`, unitTitle: c.title, type: attempt.conceptId || attempt.questionId }] : null;
        }
        if (attempt.subject === 'english') return ['english', { ...base, word: attempt.correctAnswer, meaning: (String(attempt.question).match(/“(.+?)”/) || [])[1] || '', level: c.unitId }];
        if (attempt.subject === 'hanja') {
            const reading = /의 뜻과 음은/.test(attempt.question), hanja = reading ? String(attempt.question).charAt(0) : attempt.correctAnswer;
            const sound = (reading ? attempt.correctAnswer : (String(attempt.question).match(/“(.+?)”/) || [])[1] || '').trim().split(/\s+/);
            return ['hanja', { ...base, hanja, eum: sound.pop() || '', meaning: sound.join(' '), level: c.unitId }];
        }
        return ['reading', 'grammar', 'english_reading'].includes(attempt.subject) ? [attempt.subject, { ...c, ...base, type: attempt.questionId }] : null;
    }
    function note(user, assessmentId, attempts) {
        const local = app.LocalRepository, key = `SmartStudy_MockWrongNoted_${encodeURIComponent(user)}_${assessmentId}`;
        if (!assessmentId || !root.WrongNote?.save || local.getActiveUser() !== user || local.getPreference(key, false)) return 0;
        // Formula mistakes need the formula catalogue; wait for a page that loads it rather than skip them.
        if (attempts.some(a => a.subject === 'math_formula' && !a.correct) && !root.MATH_FORMULAS) return 0;
        let saved = 0;
        for (const attempt of attempts) {
            if (attempt.correct) continue;
            const entry = wrongNoteData(attempt); if (!entry) continue;
            root.WrongNote.save(entry[0], entry[1], 'wrong', assessmentId, 1); saved++;
        }
        local.setPreference(key, true);
        return saved;
    }
    // Published mock reports already on this device (e.g. results released before this
    // feature) are noted when the learner next opens the home or today page.
    function sweep(user) {
        const local = app.LocalRepository; if (!user || local?.getActiveUser?.() !== user) return 0;
        const exams = new Map();
        for (const report of local.listReports(user)) {
            const m = report.metadata || {};
            if (!m.mockExam || m.resultVisibility !== 'published' || !m.assessmentId) continue;
            exams.set(m.assessmentId, [...(exams.get(m.assessmentId) || []), ...(m.initialAttempts || [])]);
        }
        let saved = 0; for (const [assessmentId, attempts] of exams) saved += note(user, assessmentId, attempts);
        return saved;
    }
    app.MockWrongNote = { note, sweep, wrongNoteData };
    app.LocalRepository?.ready?.then(() => { try { sweep(app.LocalRepository.getActiveUser()); } catch (error) { console.warn('[Mock wrong note]', error); } });
})(window);

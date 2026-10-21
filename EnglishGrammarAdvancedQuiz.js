// New formats augment the historical bank; old question identities remain restorable.
(function () {
    const original = window.EnglishGrammarQuiz;
    const shuffle = values => {
        const result = [...values];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    };
    const variants = sentence => {
        const contracted = sentence.replace(/\bdo not\b/gi, "don't").replace(/\bdoes not\b/gi, "doesn't")
            .replace(/\bdid not\b/gi, "didn't").replace(/\bis not\b/gi, "isn't")
            .replace(/\bare not\b/gi, "aren't").replace(/\bwas not\b/gi, "wasn't")
            .replace(/\bwere not\b/gi, "weren't").replace(/\bcannot\b/gi, "can't")
            .replace(/\bwill not\b/gi, "won't").replace(/\bwould not\b/gi, "wouldn't");
        return contracted === sentence ? [] : [contracted];
    };
    const find = unitId => Object.values(window.EnglishGrammarData).flatMap(stage => stage.units).find(unit => unit.id === unitId);
    function pool(unitId) {
        const unit = find(unitId);
        if (!unit) return [];
        const result = [];
        unit.lessons.forEach((lesson, lessonIndex) => {
            (lesson.practice || []).forEach((item, index) => {
                const short = index % 2 === 1 && /^[A-Za-z][A-Za-z '\-]*$/.test(item.answer);
                result.push({
                    type: short ? 'short' : 'choice', question: item.question, answer: item.answer,
                    choices: [item.answer, ...item.distractors], acceptedAnswers: variants(item.answer),
                    explanation: item.explanation, lessonIndex
                });
            });
            if (lesson.commonError) {
                const error = lesson.commonError;
                result.push({ type: 'correction',
                    question: `뜻을 유지하면서 이 차시에서 배운 문법 오류 한 곳을 고쳐 전체 문장을 쓰세요: ${error.wrong}`,
                    answer: error.correct, acceptedAnswers: variants(error.correct), choices: [],
                    explanation: `${error.correct} — ${error.reason}`, lessonIndex });
            }
            lesson.examples.forEach(([sentence, meaning], exampleIndex) => {
                // Exact ordering is explicitly a recall task; open translation is never exact-match graded.
                const tokens = sentence.replace(/[.!?]$/u, '').split(/\s+/);
                result.push({ type: 'arrange', question: `학습 예문과 동일한 어순으로 배열하세요. “${meaning}” (첫 단어: ${tokens[0]})`,
                    answer: sentence, acceptedAnswers: [], tokens, choices: [],
                    explanation: `${sentence} — ${lesson.principle}`, lessonIndex });
                if (/^h[123]u/.test(unitId)) {
                    const otherMeanings = unit.lessons.flatMap(other => other.examples.map(example => example[1]));
                    const distractors = [...new Set(otherMeanings)].filter(value => value !== meaning).slice(exampleIndex, exampleIndex + 3);
                    if (distractors.length < 3) {
                        distractors.splice(0, distractors.length, ...[...new Set(otherMeanings)].filter(value => value !== meaning).slice(0, 3));
                    }
                    result.push({ type: 'choice', question: `문법 형태와 의미를 함께 확인하세요: ${sentence}`,
                        answer: meaning, choices: [meaning, ...distractors], explanation: `${sentence} — ${meaning}`, lessonIndex });
                }
            });
        });
        const seen = new Set();
        return result.filter(item => {
            if (seen.has(item.question)) return false;
            seen.add(item.question);
            return true;
        });
    }
    function materialize(item) {
        const choices = shuffle(item.choices || []);
        return { ...item, choices, answerIndex: choices.indexOf(item.answer),
            tokens: shuffle(item.tokens || []), acceptedAnswers: [...(item.acceptedAnswers || [])] };
    }
    window.EnglishGrammarQuiz = {
        ...original,
        generate(unitId, count = 10, band = 'standard') {
            const current = pool(unitId);
            const legacy = /^h[123]u/.test(unitId) ? [] : original.generate(unitId, 100, band);
            let combined = shuffle([...current, ...legacy]);
            // WeeklyAssessment consumes only closed choices; preserve its foundation contract.
            if (band === 'foundation') combined = combined.filter(item => item.choices?.length === 4)
                .map(item => ({ ...item, type: 'choice' }));
            const selected = [], used = new Set();
            // Each session contains different tasks, rather than the same stem with reordered options.
            for (const type of band === 'foundation' ? ['choice'] : ['choice', 'short', 'correction', 'arrange']) {
                const question = combined.find(item => item.type === type && !used.has(item.question));
                if (question && selected.length < count) { selected.push(question); used.add(question.question); }
            }
            for (const question of combined) {
                if (selected.length >= count) break;
                if (!used.has(question.question)) { selected.push(question); used.add(question.question); }
            }
            return shuffle(selected).map(materialize);
        },
        restoreReview(unitId, saved) {
            const answer = String(saved.correctAnswer || saved.answer || '').trim();
            const current = pool(unitId).find(item => item.question === saved.question && item.answer === answer);
            return current ? materialize(current) : original.restoreReview(unitId, saved);
        }
    };
})();

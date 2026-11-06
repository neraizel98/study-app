(function (root) {
    'use strict';
    const shuffle = (rows, random) => { const copy = [...rows]; for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; };
    // Every answer comes from the supplied character data; no inferred relations or readings.
    function candidates(words, pool, random = Math.random) {
        const out = [];
        for (const q of words) {
            const others = pool.filter(w => w.hanja !== q.hanja);
            const add = (type, question, answer, alternatives, extra = {}) => {
                const wrong = shuffle([...new Set(alternatives.filter(v => v && v !== answer))], random).slice(0, 3);
                if (!answer || (type !== 'writing' && wrong.length !== 3)) return;
                const legacyAnswer = type === 'writing' ? '__writing_done__' : type === 'radical' ? q.radical : answer;
                const alias = type !== 'sound' && root.QuizExposure?.fingerprint({ question: `${q.hanja} (${q.eum})`, correctAnswer: legacyAnswer });
                out.push({ ...q, ...extra, exposureAliases: alias ? [alias] : [], questionId: `hanja:${q.hanja}:${type}${extra.relationKind ? ':' + extra.relationKind : ''}`, questionType: type, question, answer,
                    quizChoices: type === 'writing' ? [] : shuffle([answer, ...wrong], random) });
            };
            add('meaning', `${q.hanja}의 뜻과 음은?`, `${q.eum} [${q.meaning}]`, others.map(w => `${w.eum} [${w.meaning}]`));
            add('reverse', `다음 훈음에 해당하는 한자는? ${q.eum} [${q.meaning}]`, q.hanja, others.filter(w => w.eum !== q.eum || w.meaning !== q.meaning).map(w => w.hanja));
            add('sound', `${q.hanja}의 음은?`, q.eum, others.map(w => w.eum));
            const radical = value => String(value || '').replace(/\([^)]*\)/g, '').trim();
            add('radical', `${q.hanja}의 부수는?`, radical(q.radical), others.map(w => radical(w.radical)));
            if (q.idiom?.includes(q.hanja)) add('idiom', `빈칸에 들어갈 한자는? ${q.idiom.replace(q.hanja, '□')} (${q.idiomEum}) — ${q.idiomMean}`, q.hanja, others.map(w => w.hanja));
            for (const relationKind of ['antonym', 'synonym']) if (q[relationKind]) add('relation', `${q.hanja}(${q.eum})의 ${relationKind === 'antonym' ? '반의어' : '유의어'}는?`, q[relationKind], others.map(w => `${w.hanja}(${w.eum})`), { relationKind });
            add('writing', `[${q.eum} (${q.meaning})]에 해당하는 한자를 써 보세요.`, q.hanja, []);
        }
        return shuffle(out, random);
    }
    function select({ words, pool, count = 10, rank, priority = [], random = Math.random }) {
        const all = candidates(words, pool, random).sort((a, b) => Number(priority.includes(b.hanja)) - Number(priority.includes(a.hanja))), ordered = rank ? rank(all) : all, seen = new Set(), chosen = [];
        for (const q of ordered) {
            if (seen.has(q.hanja)) continue;
            seen.add(q.hanja); chosen.push(q); if (chosen.length >= count) break;
        }
        return shuffle(chosen, random);
    }
    root.HanjaQuiz = { candidates, select };
    if (typeof module !== 'undefined') module.exports = root.HanjaQuiz;
})(typeof window !== 'undefined' ? window : globalThis);

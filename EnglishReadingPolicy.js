(function (root) {
    'use strict';

    const clampBand = value => Math.max(0, Math.min(2, Math.floor(Number(value) || 0)));
    const normalize = value => String(value || '').normalize('NFC').trim().toLocaleLowerCase();
    const distinctBy = (items, keyOf) => {
        const seen = new Set();
        return (items || []).filter(item => {
            const key = keyOf(item);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    function assessmentEvidence(reports, currentBand = 1) {
        const eligible = (reports || [])
            .filter(report => report?.subject === 'english_reading' && report.metadata?.isNovel === true
                && report.metadata?.readingAssessment === true && !report.metadata?.review
                && !report.metadata?.familiarAttempt && !report.metadata?.hintUsed)
            .sort((a, b) => Number(b.date || b.createdAt || 0) - Number(a.date || a.createdAt || 0));
        const recent = distinctBy(eligible, report => report.metadata?.passageId).slice(0, 3);
        if (recent.length < 3) {
            return { band: clampBand(currentBand), changed: false, samples: recent.length, scores: recent.map(scoreOf),
                reason: `미학습 지문 최초 평가 ${recent.length}/3개를 모으는 중입니다.` };
        }
        const scores = recent.map(scoreOf);
        const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
        let band = clampBand(currentBand);
        if (average >= 85) band = clampBand(band + 1);
        else if (average <= 59) band = clampBand(band - 1);
        const windowKey = recent.map(report => report.metadata.passageId).sort().join('|');
        return { band, changed: band !== clampBand(currentBand), samples: 3, scores, average, windowKey,
            reason: average >= 85 ? (band > clampBand(currentBand) ? `서로 다른 미학습 지문 3개의 최초 점수 평균이 ${average}점이라 난이도를 올렸습니다.` : `최근 3개 평균이 ${average}점이며 현재 최고 난이도입니다.`)
                : average <= 59 ? (band < clampBand(currentBand) ? `서로 다른 미학습 지문 3개의 최초 점수 평균이 ${average}점이라 난이도를 낮췄습니다.` : `최근 3개 평균이 ${average}점이며 현재 기초 난이도입니다.`)
                    : `최근 미학습 지문 3개의 최초 점수(${scores.join(', ')}점)를 바탕으로 난이도를 유지합니다.` };
    }

    function scoreOf(report) {
        const total = Math.max(1, Number(report?.totalQuestions) || 0);
        return Math.round(Math.max(0, Number(report?.initialScore) || 0) / total * 100);
    }

    function selectPassage(passages, options = {}) {
        const band = clampBand(options.band);
        const excluded = new Set(options.excludedIds || []);
        const exact = (passages || []).filter(item => Number(item.band) === band && !excluded.has(item.id));
        const unseen = (passages || []).filter(item => !excluded.has(item.id));
        const pool = exact.length ? exact : unseen;
        if (!pool.length) return null;
        const recommended = options.recommendedId && pool.find(item => item.id === options.recommendedId);
        return recommended || pool[0];
    }

    function recommendation(passages, wrong = {}, reports = []) {
        const usable = item => item && !item.deleted && !item.isMastered;
        const reportAttempts = (reports || []).flatMap(report => (report?.metadata?.initialAttempts || []).map(attempt => ({
            ...attempt, reportSubject: report.subject, reportDate: Number(report.date || 0),
            unitId: attempt.unitId || report.metadata?.unitId, stageId: attempt.stageId || report.metadata?.stageId
        })));
        const latest = new Map();
        const remember = (kind, key, correct, at) => {
            key = normalize(key); if (!key) return;
            const id = `${kind}:${key}`, previous = latest.get(id);
            if (!previous || Number(at || 0) >= previous.at) latest.set(id, { correct: Boolean(correct), at: Number(at || 0) });
        };
        (wrong.english || []).filter(item => item && !item.deleted).forEach(item => {
            const history = [...(item.history || [])].sort((a,b)=>Number(a.createdAt||a.date||0)-Number(b.createdAt||b.date||0));
            const last = history.at(-1); remember('v', item.word || item.answer, last ? last.status === 'correct' : !usable(item), last?.createdAt || last?.date || item.date);
        });
        (wrong.grammar || []).filter(item => item && !item.deleted).forEach(item => {
            const history = [...(item.history || [])].sort((a,b)=>Number(a.createdAt||a.date||0)-Number(b.createdAt||b.date||0));
            const last = history.at(-1);
            if (last && ['correct','wrong'].includes(last.status)) remember('g', `${item.stageId || 'elementary'}:${item.unitId}`, last.status === 'correct', last.createdAt || last.date);
        });
        reportAttempts.forEach(item => {
            if (typeof item.correct !== 'boolean') return;
            if (item.reportSubject === 'english' || item.category === 'english' || item.word) remember('v', item.word || item.answer, item.correct, item.reportDate);
            if (item.reportSubject === 'grammar' || item.category === 'grammar') remember('g', `${item.stageId || 'elementary'}:${item.unitId}`, item.correct, item.reportDate);
        });
        const ranked = (passages || []).map(passage => {
            const words = (passage.vocabulary || []).map(item => normalize(item.word));
            const tags = (passage.grammarRefs?.length ? passage.grammarRefs.map(ref => `${ref.stageId}:${ref.unitId}`) : (passage.grammarTags || []).map(unitId => `elementary:${unitId}`)).map(normalize);
            const vocabularyKnown = words.filter(word => latest.get(`v:${word}`)?.correct === true);
            const vocabularyWeak = words.filter(word => latest.get(`v:${word}`)?.correct === false);
            const vocabularyUnknown = words.filter(word => !latest.has(`v:${word}`));
            const grammarKnown = tags.filter(tag => latest.get(`g:${tag}`)?.correct === true);
            const grammarWeak = tags.filter(tag => latest.get(`g:${tag}`)?.correct === false);
            return { passage, vocabularyKnown, vocabularyWeak, vocabularyUnknown, grammarKnown, grammarWeak,
                count: vocabularyWeak.length * 3 + grammarWeak.length * 3 + vocabularyKnown.length + grammarKnown.length };
        }).sort((a, b) => b.count - a.count);
        const best = ranked[0];
        if (!best || best.count === 0) return { passageId: null, reason: '연결할 수 있는 최근 영어 단어·문법 학습 데이터가 아직 부족합니다.', evidence: [], vocabularyKnownCount: 0, unknownCount: best?.vocabularyUnknown.length ?? null, grammarKnown: [], vocabularyWeakCount: 0, grammarWeak: [] };
        const evidence = [
            ...best.vocabularyWeak.map(value => `보완할 단어: ${value}`),
            ...(best.grammarWeak.length ? [`보완할 문법 단원 ${best.grammarWeak.length}개`] : []),
            ...best.vocabularyKnown.map(value => `확인된 단어: ${value}`),
            ...(best.grammarKnown.length ? [`확인된 문법 단원 ${best.grammarKnown.length}개`] : [])
        ];
        return { passageId: best.passage.id, reason: `${evidence.join(', ')} 기록과 연결되는 검증 지문입니다.`, evidence,
            vocabularyKnownCount: best.vocabularyKnown.length, unknownCount: best.vocabularyUnknown.length, grammarKnown: best.grammarKnown,
            vocabularyWeakCount: best.vocabularyWeak.length, grammarWeak: best.grammarWeak };
    }

    const api = { assessmentEvidence, selectPassage, recommendation, scoreOf, clampBand };
    root.EnglishReadingPolicy = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

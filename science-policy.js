(function (root) {
    'use strict';

    const data = () => root.ScienceData || { units: [], levels: [] };
    function findUnit(levelId, unitId) {
        if (!data().levels.some(level => level.id === levelId && level.available)) return null;
        return data().units.find(unit => unit.levelId === levelId && unit.id === unitId) || null;
    }
    function contextOf(value) {
        const metadata = value?.metadata || value || {};
        const unit = findUnit(metadata.levelId, metadata.unitId);
        return unit ? { levelId: unit.levelId, unitId: unit.id, title: unit.title } : null;
    }
    function validEvidence(report, options = {}) {
        const metadata = report?.metadata || {};
        const attempts = metadata.initialAttempts;
        const submittedAt = Number(metadata.submittedAt || report?.createdAt || report?.date || 0);
        const now = options.now ?? Date.now();
        return Boolean(report?.subject === 'science' && report.sessionId && metadata.source === 'science'
            && !report.draft && !metadata.draft && ![report.status, metadata.status].some(status => ['draft', 'partial', 'active', 'in-progress'].includes(status))
            && !metadata.assessment && !metadata.mockExam && !metadata.assessmentId
            && contextOf(report) && Number(report.totalQuestions) === 10
            && Number.isFinite(submittedAt) && submittedAt > 0 && submittedAt <= now
            && Array.isArray(attempts) && attempts.length === 10
            && new Set(attempts.map(attempt => attempt?.questionId)).size === 10
            && attempts.every(attempt => attempt && typeof attempt.questionId === 'string' && attempt.questionId
                && typeof attempt.correct === 'boolean' && (attempt.round == null || Number(attempt.round) === 1)));
    }
    function validMasteryEvidence(report, options = {}) {
        return validEvidence(report, options) && !report.metadata.review && !report.metadata.hintUsed
            && report.metadata.initialAttempts.every(attempt => !attempt.hintUsed && !attempt.assisted);
    }
    function shuffle(items) {
        const result = [...items];
        for (let index = result.length - 1; index > 0; index--) {
            const next = Math.floor(Math.random() * (index + 1));
            [result[index], result[next]] = [result[next], result[index]];
        }
        return result;
    }
    function selectQuestions(user, unit, count = 10, options = {}) {
        if (!findUnit(unit?.levelId, unit?.id)) throw new Error('학습할 수 있는 과학 단원을 선택해 주세요.');
        if (count !== 10) throw new Error('과학 단원 퀴즈는 10문항으로 구성합니다.');
        if (!root.QuizExposure?.select) throw new Error('문제 노출 정책을 불러오지 못했습니다. 새로고침해 주세요.');
        const skills = [...new Set(unit.questions.map(question => question.skill))];
        const buckets = skills.map(skill => shuffle(unit.questions.filter(question => question.skill === skill)));
        const candidates = [];
        for (let index = 0; buckets.some(bucket => index < bucket.length); index++) {
            for (const bucket of buckets) if (bucket[index]) candidates.push({ ...bucket[index] });
        }
        const selected = root.QuizExposure.select(user, 'science', candidates, count, options);
        if (selected.items.length !== count) throw new Error('이 단원의 검수된 10문항을 준비하지 못했습니다. 단원 콘텐츠를 확인해 주세요.');
        return selected;
    }
    function evidence(reports, options = {}) {
        const unique = new Map();
        for (const report of reports || []) {
            if (!validEvidence(report, options)) continue;
            const old = unique.get(report.sessionId);
            if (!old || Number(report.updatedAt || report.date) >= Number(old.updatedAt || old.date)) unique.set(report.sessionId, report);
        }
        return [...unique.values()];
    }
    const api = { findUnit, contextOf, validEvidence, validMasteryEvidence, selectQuestions, evidence };
    root.SciencePolicy = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

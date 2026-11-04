(function (root) {
    'use strict';
    const app = root.SmartStudy = root.SmartStudy || {};
    let state = null;
    let generation = 0;
    const queues = new Map();
    const copy = value => JSON.parse(JSON.stringify(value));
    const local = () => app.LocalRepository;
    const active = user => !!user && local()?.getActiveUser() === user;
    const key = user => `SmartStudy_MockLearningReview_${encodeURIComponent(user)}`;
    const validId = id => typeof id === 'string' && /^[A-Za-z0-9_.:-]{1,160}$/.test(id);
    const eventFields = ['eventId', 'assessmentId', 'questionId', 'correct', 'status', 'reviewedAt'];
    function eventOf(event, user, now = Date.now()) {
        if (!event || (event.userId && event.userId !== user) || (event.learnerId && event.learnerId !== user)
            || !validId(event.eventId) || typeof event.assessmentId !== 'string' || !event.assessmentId || event.assessmentId.includes('/')
            || typeof event.questionId !== 'string' || !event.questionId || event.questionId.includes('/')
            || typeof event.correct !== 'boolean' || event.status !== (event.correct ? 'correct' : 'wrong')
            || !Number.isInteger(event.reviewedAt) || event.reviewedAt <= 0 || event.reviewedAt > now) return null;
        return Object.fromEntries(eventFields.map(field => [field, event[field]]));
    }
    const equivalent = (a, b) => eventFields.every(field => a[field] === b[field]);
    function mergeEvents(user, ...sources) {
        const events = new Map();
        for (const source of sources) for (const raw of Array.isArray(source) ? source : []) {
            const e = eventOf(raw, user); if (!e) continue;
            const previous = events.get(e.eventId);
            if (previous && !equivalent(previous, e)) throw new Error('같은 복습 기록의 내용이 다릅니다. 다시 확인해 주세요.');
            events.set(e.eventId, e);
        }
        return [...events.values()].sort((a, b) => a.reviewedAt - b.reviewedAt || a.eventId.localeCompare(b.eventId));
    }
    function store(user) {
        const saved = local().getPreference(key(user), null);
        return saved?.schemaVersion === 1 && saved.userId === user
            ? { schemaVersion: 1, userId: user, events: mergeEvents(user, saved.events), pending: Array.isArray(saved.pending) ? saved.pending.filter(validId) : [] }
            : { schemaVersion: 1, userId: user, events: [], pending: [] };
    }
    function weeklySessions(user) {
        const prefix = `SmartStudy_WeeklyReview_${encodeURIComponent(user)}_`;
        return (local().keys?.() || []).filter(k => typeof k === 'string' && k.startsWith(prefix) && /^\d{4}-\d{2}-\d{2}(?:_supplement)?$/.test(k.slice(prefix.length)))
            .map(k => local().getPreference(k, null)).filter(s => s?.userId === user && Number.isInteger(s.submittedAt) && s.submittedAt > 0 && s.submittedAt <= Date.now() && Array.isArray(s.answers));
    }
    function reviewEvents(user) {
        if (!active(user)) return [];
        return [...store(user).events, ...weeklySessions(user)];
    }
    function reports(user) {
        return local().areReportsPersisted?.(user) === false ? [] : (local().listReports(user) || [])
            .filter(r => r && (!r.userId || r.userId === user) && (!r.learnerId || r.learnerId === user));
    }
    function getState(user, now = Date.now()) {
        if (!active(user) || state?.user !== user) return null;
        const rows = reports(user), events = reviewEvents(user);
        const targets = state.targets.map(target => ({ ...copy(target), progress: app.MockLearningPolicy.progress(target, rows, events, now) }));
        return { assessmentId: state.assessmentId, components: copy(state.components), targets, unmapped: copy(state.unmapped), signature: state.signature,
            pendingReviewCount: store(user).pending.length };
    }
    function signature(user) {
        const current = getState(user);
        return current ? JSON.stringify([current.signature, app.MockLearningPolicy.version, current.targets.map(t => [t.id, t.progress.stage, t.progress.completed])]) : null;
    }
    function serial(user, action) {
        const run = (queues.get(user) || Promise.resolve()).catch(() => {}).then(action);
        queues.set(user, run);
        return run.finally(() => { if (queues.get(user) === run) queues.delete(user); });
    }
    async function persist(user, next) {
        if (!active(user)) throw new Error('학습자가 변경되었습니다.');
        await local().retryPersistence?.();
        if (!active(user)) throw new Error('학습자가 변경되었습니다.');
        const previous = local().getPreference(key(user), null);
        try {
            if (local().setPreference(key(user), next) === false) throw new Error('복습을 저장하지 못했습니다.');
            await local().flush?.();
        } catch (error) {
            if (active(user)) { local().setPreference(key(user), previous); await Promise.resolve(local().flush?.()).catch(() => {}); }
            throw error;
        }
    }
    function eventId(user, assessmentId, questionId, at, source = '') {
        // A stable content reference; collisions are rejected by immutable payload comparison.
        let hash = 14695981039346656037n;
        for (const ch of JSON.stringify([user, assessmentId, questionId, at, source])) hash = BigInt.asUintN(64, (hash ^ BigInt(ch.codePointAt(0))) * 1099511628211n);
        return `mlr:${at}:${hash.toString(16).padStart(16, '0')}`;
    }
    function weeklyEvents(user, current) {
        const targets = new Map(current.targets.map(t => [`${t.assessmentId}|${t.questionId}`, t])), events = [];
        for (const session of weeklySessions(user)) session.answers.forEach((answer, index) => {
            if (!answer || typeof answer.correct !== 'boolean' || !Number.isInteger(answer.reviewedAt) || answer.reviewedAt > session.submittedAt) return;
            for (const ref of Array.isArray(answer.sourceReferences) ? answer.sourceReferences : []) {
                const assessmentId = ref.sourceAssessmentId || ref.assessmentId, questionId = ref.sourceQuestionId || ref.questionId;
                const target = targets.get(`${assessmentId}|${questionId}`);
                if (!target || answer.reviewedAt <= target.sourceSubmittedAt) continue;
                events.push({ eventId: eventId(user, assessmentId, questionId, answer.reviewedAt, `${session.sessionId || session.submittedAt}:${index}`), assessmentId, questionId, reviewedAt: answer.reviewedAt, correct: answer.correct, status: answer.correct ? 'correct' : 'wrong' });
            }
        });
        return mergeEvents(user, events);
    }
    async function synchronize(user, current) {
        if (!active(user) || state !== current) return;
        let saved = store(user);
        const bridged = weeklyEvents(user, current), events = mergeEvents(user, saved.events, bridged);
        const pending = new Set(saved.pending);
        for (const e of bridged) if (!saved.events.some(old => old.eventId === e.eventId)) pending.add(e.eventId);
        if (events.length !== saved.events.length || pending.size !== saved.pending.length) {
            saved = { ...saved, events, pending: [...pending] }; await persist(user, saved);
        }
        const repository = app.MockLearningRepository;
        if (repository?.listReviewEvents) {
            const remote = await repository.listReviewEvents(user);
            if (!active(user) || state !== current) return;
            const remoteEvents = mergeEvents(user, remote), merged = mergeEvents(user, saved.events, remoteEvents), remoteIds = new Set(remoteEvents.map(e => e.eventId));
            saved = { ...saved, events: merged, pending: saved.pending.filter(id => !remoteIds.has(id)) };
            await persist(user, saved);
        }
        if (!repository?.saveReviewEvent) return;
        for (const id of [...saved.pending]) {
            if (!active(user) || state !== current) return;
            const e = saved.events.find(item => item.eventId === id);
            if (!e) continue;
            await repository.saveReviewEvent(user, copy(e));
            if (!active(user) || state !== current) return;
            saved = { ...saved, pending: saved.pending.filter(item => item !== id) }; await persist(user, saved);
        }
    }
    async function sync(user) {
        return serial(user, async () => {
            const current = state;
            if (!active(user) || current?.user !== user) return null;
            await synchronize(user, current);
            return getState(user);
        });
    }

    async function refresh(user) {
        const request = ++generation;
        let next = null;
        try {
            const settings = await app.MockLearningRepository.get(user);
            if (settings?.confirmedUnassisted && settings.assessmentId) {
                const result = await app.MockPublication.get(user, settings.assessmentId);
                const exam = result.snapshot;
                if (result.published === true && exam?.assessmentId === settings.assessmentId && exam.status === 'submitted'
                    && (!exam.userId || exam.userId === user) && (!exam.learnerId || exam.learnerId === user)
                    && exam.translationDetected !== true && exam.integrity?.translationDetected !== true) {
                    const diagnosis = app.MockLearningPolicy.analyze(exam);
                    next = { user, assessmentId: exam.assessmentId, signature: JSON.stringify(settings), ...diagnosis };
                }
            }
        } catch (error) {
            console.warn('영어 진단 기준을 불러오지 못했습니다.', error);
        }
        if (request !== generation || !active(user)) return null;
        state = next;
        if (next) {
            try { await sync(user); }
            catch (error) { console.warn('복습 기록은 이 기기에 유지됩니다. 다음 확인 때 동기화를 다시 시도합니다.', error); }
        }
        return getState(user);
    }

    function recordReview(user, input) {
        return serial(user, async () => {
            const current = state;
            if (!active(user) || current?.user !== user) throw new Error('공개된 진단 시험을 먼저 확인해 주세요.');
            const target = current.targets.find(t => t.assessmentId === input?.assessmentId && t.questionId === input?.questionId);
            if (!target) throw new Error('현재 진단 시험의 복습 문항이 아닙니다.');
            const at = input.reviewedAt ?? Date.now();
            const e = eventOf({ eventId: input.eventId || eventId(user, target.assessmentId, target.questionId, at), assessmentId: target.assessmentId, questionId: target.questionId,
                correct: input.correct, status: input.status || (input.correct ? 'correct' : 'wrong'), reviewedAt: at }, user);
            if (!e || e.reviewedAt <= target.sourceSubmittedAt) throw new Error('복습 결과를 확인할 수 없습니다.');
            let saved = store(user), events = mergeEvents(user, saved.events, [e]);
            if (!saved.events.some(old => old.eventId === e.eventId)) {
                saved = { ...saved, events, pending: [...new Set([...saved.pending, e.eventId])] }; await persist(user, saved);
            }
            if (!active(user) || state !== current) throw new Error('학습자 또는 진단 기준이 변경되었습니다.');
            try { await synchronize(user, current); }
            catch (error) { console.warn('복습 기록은 이 기기에 유지됩니다. 다음 확인 때 동기화를 다시 시도합니다.', error); }
            return { ...e, syncStatus: store(user).pending.includes(e.eventId) ? 'pending' : 'synced' };
        });
    }

    function recommend(user, subject, choices, contextKey) {
        const current = getState(user);
        if (!current) return null;
        for (const { question, sourceFingerprints, sourceFingerprint, sourceSubmittedAt, ...target } of current.targets) {
            if (target.subject !== subject || target.progress.completed) continue;
            const choice = choices.find(item => contextKey(subject, item.context) === contextKey(subject, target.context));
            if (choice) return { ...choice, diagnostic: target, reason: '모의고사 보충 · ' + target.label };
        }
        return null;
    }

    app.MockLearning = { refresh, recommend, signature, getState, recordReview, reviewEvents, sync };
    if (typeof module !== 'undefined' && module.exports) module.exports = app.MockLearning;
})(typeof window !== 'undefined' ? window : globalThis);

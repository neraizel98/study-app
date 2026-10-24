(function (root) {
    'use strict';
    const app = root.SmartStudy = root.SmartStudy || {};
    const areas = Object.freeze({ reading: 11, korean_vocab: 4, english: 4, grammar: 4, english_reading: 7, math: 12, math_formula: 3, hanja: 10 });
    // 국어 영역은 독해와 어휘를 합쳐 15문항이다. 어휘 학습 기록이 모자라면 독해로 채운다.
    const KOREAN = Object.freeze({ total: 15, vocabularyMax: 4 });
    const definitions = Object.freeze([
        { id: 'reading', name: '국어', subjects: ['reading', 'korean_vocab'], minutes: 20 },
        { id: 'english', name: '영어', subjects: ['english', 'grammar', 'english_reading'], minutes: 20 },
        { id: 'math', name: '수학', subjects: ['math', 'math_formula'], minutes: 20 },
        { id: 'hanja', name: '한자', subjects: ['hanja'], minutes: 10 }
    ]);
    const clone = value => JSON.parse(JSON.stringify(value));
    const repo = () => app.LocalRepository;
    const key = (user, week) => `SmartStudy_MockExam_${encodeURIComponent(user)}_${week}`;
    const indexKey = user => `SmartStudy_MockExam_Index_${encodeURIComponent(user)}`;
    function weekId(now = Date.now()) {
        const date = new Date(now + 9 * 3600000);
        date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
        return date.toISOString().slice(0, 10);
    }
    function assertUser(user) {
        if (!user || repo().getActiveUser() !== user) throw new Error('계정이 바뀌었습니다. 현재 계정으로 다시 열어 주세요.');
    }
    function list(user, week = weekId()) {
        const prefix=key(user,''),recovered=(repo().keys?.()||[]).filter(k=>k.startsWith(prefix)).map(k=>k.slice(prefix.length));
        const slots=new Set([week,...repo().getPreference(indexKey(user),[]),...recovered]);
        return [...slots].map(slot=>repo().getPreference(key(user,slot),null))
            .filter(d=>d?.userId===user&&d.scheduledWeekId===week)
            .map(clone).sort((a,b)=>(Number(a.attemptNo)||1)-(Number(b.attemptNo)||1)||a.startedAt-b.startedAt);
    }
    function get(user, reference = weekId()) {
        if(String(reference).startsWith('mock:'))return getById(user,reference);
        return list(user,reference).at(-1)||null;
    }
    function getById(user, assessmentId) {
        const prefix=`mock:${user}:`;if(!String(assessmentId).startsWith(prefix))return null;
        const rest=String(assessmentId).slice(prefix.length),match=rest.match(/^(\d{4}-\d{2}-\d{2}):(?:first|attempt-(\d+)-[A-Za-z0-9-]+)$/);
        const candidates=[...repo().getPreference(indexKey(user),[])];
        if(match){candidates.push(match[1]);if(match[2])candidates.push(`${match[1]}~${match[2]}`,`${match[1]}~${match[2]}~${encodeURIComponent(assessmentId)}`);}
        const ownPrefix=key(user,'');for(const stored of repo().keys?.()||[])if(stored.startsWith(ownPrefix))candidates.push(stored.slice(ownPrefix.length));
        for(const slot of new Set(candidates)){
            const draft=repo().getPreference(key(user,slot),null);
            if(draft?.userId===user&&draft.assessmentId===assessmentId){
                const slots=repo().getPreference(indexKey(user),[]);
                if(repo().getActiveUser()===user&&!slots.includes(slot))repo().setPreference(indexKey(user),[...slots,slot]);
                return clone(draft);
            }
        }
        return null;
    }
    function restore(user, records) {
        assertUser(user);
        for(const row of records||[]){
            const d=row.payload||row.snapshot;if(!d||row.learnerId&&row.learnerId!==user||d.userId!==user||d.kind!=='mock'||d.status!=='submitted'||!d.submittedAt||!/^\d{4}-\d{2}-\d{2}$/.test(d.scheduledWeekId)||!String(d.assessmentId).startsWith(`mock:${user}:${d.scheduledWeekId}:`)||!Array.isArray(d.questions)||d.questions.length!==55||!Array.isArray(d.sections)||d.sections.length!==4||!d.sections.every(s=>s.state==='ended'&&Array.isArray(s.initialAttempts))||d.sections.reduce((n,s)=>n+s.initialAttempts.length,0)!==55)continue;
            if(getById(user,d.assessmentId))continue; // Never replace this device's in-progress/submitted answers.
            const restored=clone(d),n=Number(restored.attemptNo)||1;
            restored.storageSlot=n===1?restored.scheduledWeekId:`${restored.scheduledWeekId}~${n}~${encodeURIComponent(restored.assessmentId)}`;
            restored.syncStatus='synced';restored.resultVisibility=row.published===true?'published':'withheld';write(restored);
        }
    }
    function write(draft) {
        assertUser(draft.userId);
        const slot=draft.storageSlot||draft.scheduledWeekId;
        repo().setPreference(key(draft.userId,slot),draft);
        const slots=repo().getPreference(indexKey(draft.userId),[]);
        if(!slots.includes(slot))repo().setPreference(indexKey(draft.userId),[...slots,slot]);
        return clone(draft);
    }
    function validateBank(bank) {
        const items = bank?.items || [], counts = Object.fromEntries(Object.keys(areas).map(subject => [subject, items.filter(q => q.subject === subject).length]));
        return bank?.complete === true && (bank.policyId!=='transfer-20261024'||root.MockExamQuality?.evaluate(items).complete===true&&items.every(q=>!q.repeated)) && items.length === 55 && new Set(items.map(q => q.id)).size === 55
            && items.every(q => q.id && q.question && (q.kind === 'written' ? typeof q.answer === 'string'
                : Array.isArray(q.choices) && q.choices.length >= 2 && q.choices.includes(q.answer) && new Set(q.choices).size === q.choices.length))
            && (bank.policyId==='weekly-transfer-20261024'
                ? items.every(q=>!q.repeated)&&Object.entries(areas).every(([subject])=>Number.isInteger(bank.quotas?.[subject])&&bank.quotas[subject]>=0&&counts[subject]===bank.quotas[subject])&&counts.english+counts.grammar+counts.english_reading===15&&counts.math+counts.math_formula===15&&counts.hanja===10
                : Object.entries(areas).every(([subject, count]) => ['reading', 'korean_vocab'].includes(subject) || counts[subject] === count))
            && counts.reading + counts.korean_vocab === KOREAN.total && (bank.policyId==='weekly-transfer-20261024'||counts.korean_vocab <= KOREAN.vocabularyMax);
    }
    function create(user, bank, now = Date.now(), options = {}) {
        assertUser(user);
        const scheduledWeekId = options.scheduledWeekId || weekId(now), old = get(user, scheduledWeekId);
        if(old&&!options.retake)return old;
        if(!old&&!options.retake&&repo().listReports(user).some(r=>r.metadata?.mockExam&&r.metadata?.scheduledWeekId===scheduledWeekId))throw new Error('이전 응시 기록이 있습니다. 새 회차로 시험을 준비해 주세요.');
        if(options.retake&&old&&!old.submittedAt)throw new Error('진행 중인 시험을 먼저 제출해 주세요.');
        const previous=list(user,scheduledWeekId),attemptNo=options.retake?Math.max(1,...previous.map(d=>Number(d.attemptNo)||1),Number(options.previousAttemptNo)||0)+1:1;
        if(options.retake){
            const oldIds=new Set(previous.flatMap(d=>d.questions||[]).map(q=>q.id));
            const oldContent=new Set(previous.flatMap(d=>d.questions||[]).map(q=>app.MockExamBank.fingerprint?.(q)||[q.subject,q.question,q.answer].join('|')));
            if((bank.items||[]).some(q=>oldIds.has(q.id)||oldContent.has(app.MockExamBank.fingerprint?.(q)||[q.subject,q.question,q.answer].join('|'))))throw new Error('이전 회차와 겹치는 문제를 다시 구성해 주세요.');
        }
        if (!validateBank(bank)) throw new Error('정규 55문항 시험 준비 중입니다. 부족한 학습 범위와 문항을 확인해 주세요.');
        const sectionMinutes = options.sectionMinutes || app.LearningPlan?.getSettings?.(user)?.weekly?.mockSectionMinutes || {};
        const sections = definitions.map((section, index) => {
            const proposed = Number(sectionMinutes[section.id]);
            return { ...section, durationSeconds: Number.isFinite(proposed) && proposed >= 5 && proposed <= 60 ? proposed * 60 : section.minutes * 60,
                state: index === 0 ? 'active' : 'pending', startedAt: index === 0 ? now : null, deadline: null, endedAt: null, timedOut: false,
                activeSeconds: 0, elapsedSeconds: 0, initialAttempts: null };
        });
        sections[0].deadline = now + sections[0].durationSeconds * 1000;
        const assessmentId=attemptNo===1?`mock:${user}:${scheduledWeekId}:first`:`mock:${user}:${scheduledWeekId}:attempt-${attemptNo}-${root.crypto?.randomUUID?.()||now.toString(36)}`;
        return write({ schemaVersion: 1, assessmentId, storageSlot:attemptNo===1?scheduledWeekId:`${scheduledWeekId}~${attemptNo}~${encodeURIComponent(assessmentId)}`, userId: user, scheduledWeekId,
            scheduledDate: options.scheduledDate || new Date(now + 9 * 3600000).toISOString().slice(0, 10), scopeCutoffAt: bank.scopeCutoffAt || now,
            kind: 'mock', attemptNo, parentAttemptId: old?.assessmentId||options.parentAttemptId||null, bankVersion: bank.version || 'unknown', quotas: Object.fromEntries(Object.keys(areas).map(subject=>[subject,bank.items.filter(q=>q.subject===subject).length])),
            evidenceWindowDays: bank.evidenceWindowDays || null, repeatAvoidanceDays: bank.repeatAvoidanceDays || null,
            repeatPolicy:bank.repeatPolicy||null,quality:bank.quality?clone(bank.quality):null,policyId:bank.policyId||null,weeklyCoverage:bank.weeklyCoverage?clone(bank.weeklyCoverage):null,
            newQuestionCount: bank.items.filter(q => !q.repeated).length, reexposureCount: bank.items.filter(q => q.repeated).length,
            scopeCompleteness: { required: 55, actual: 55, complete: true }, restricted: false,
            questions: clone(bank.items), sections, cursor: 0, responses: {}, startedAt: now, submittedAt: null,
            resultVisibility: 'withheld', status: 'in-progress', syncStatus: 'not-submitted', break: null });
    }
    function activate(draft, index, now) {
        const section = draft.sections[index];
        if (!section) { draft.submittedAt = now; draft.status = 'submitted'; draft.syncStatus = 'pending'; return; }
        section.state = 'active'; section.startedAt = now; section.deadline = now + section.durationSeconds * 1000; draft.cursor = 0;
    }
    function questionsFor(draft, section) { return draft.questions.filter(q => section.subjects.includes(q.subject)); }
    function endSection(draft, index, now, timedOut) {
        const section = draft.sections[index];
        if (section.state !== 'active') return;
        section.state = 'ended'; section.endedAt = now; section.timedOut = timedOut;
        section.elapsedSeconds = Math.max(0, Math.min(section.durationSeconds, Math.floor((now - section.startedAt) / 1000)));
        section.initialAttempts = questionsFor(draft, section).map(q => {
            const selectedAnswer = draft.responses[q.id] ?? '';
            const grade = app.MockExamBank.grade(q, selectedAnswer);
            return { questionId: q.id, subject: q.subject, question: q.question, selectedAnswer,
                correct: typeof grade === 'boolean' ? grade : grade.correct === true, correctAnswer: q.answer ?? grade.answer,
                unanswered: selectedAnswer === '', status: selectedAnswer === '' ? 'unanswered' : ((typeof grade === 'boolean' ? grade : grade.correct) ? 'correct' : 'wrong'),
                context: clone(q.context || {}), choices: q.choices || [], explanation: q.explanation || '', answerKind: q.kind || 'choice',
                passageId: q.passageId || null, passageTitle: q.passageTitle || '', passageText: q.passageLines || q.passageText || [],
                sourceType: q.sourceType || '', sourceReportIds: q.sourceReportIds || q.evidenceReportIds || [],
                conceptId: q.conceptId || null, sourceQuestionId: q.sourceQuestionId || null,
                repeated: !!q.repeated, assisted: false, generator: q.generator || null,
                fingerprint:q.fingerprint||null,templateFamily:q.templateFamily||null,noveltyKind:q.noveltyKind||null,cognitiveDemand:q.cognitiveDemand||null,difficulty:q.difficulty||null };
        });
        if (index === 1) draft.break = { startedAt: now, deadline: now + 5 * 60000, endedAt: null };
        else activate(draft, index + 1, now);
    }
    function reconcileDraft(draft, now) {
        for (let i = 0; i < 6 && !draft.submittedAt; i++) {
            if (draft.break && !draft.break.endedAt) {
                if (now < draft.break.deadline) break;
                draft.break.endedAt = draft.break.deadline; activate(draft, 2, draft.break.deadline);
            }
            const index = draft.sections.findIndex(section => section.state === 'active');
            if (index < 0 || now < draft.sections[index].deadline) break;
            endSection(draft, index, draft.sections[index].deadline, true);
        }
        return draft;
    }
    function reconcile(user, week, now = Date.now()) {
        assertUser(user); const draft = get(user, week); if (!draft) return null;
        if (draft.submittedAt) return draft;
        const before = JSON.stringify(draft); reconcileDraft(draft, now);
        return before === JSON.stringify(draft) ? draft : write(draft);
    }
    function answer(user, week, questionId, response, now = Date.now()) {
        assertUser(user); const draft = reconcile(user, week, now); if (!draft || draft.submittedAt) return draft;
        const section = draft.sections.find(s => s.state === 'active'), question = draft.questions.find(q => q.id === questionId);
        if (!section || !question || !section.subjects.includes(question.subject)) return draft;
        const value = String(response ?? '');
        if (question.kind !== 'written' && !question.choices.map(String).includes(value)) throw new Error('보기 중 하나를 선택해 주세요.');
        draft.responses[questionId] = value.slice(0, 2000); return write(draft);
    }
    function move(user, week, cursor, now = Date.now()) {
        const draft = reconcile(user, week, now), section = draft?.sections.find(s => s.state === 'active');
        if (!section || draft.submittedAt) return draft;
        draft.cursor = Math.max(0, Math.min(questionsFor(draft, section).length - 1, Number(cursor) || 0)); return write(draft);
    }
    // The UI supplies only ActiveTimeTracker deltas. A deadline's elapsed time is
    // deliberately never used to infer learning time, including after reload.
    function recordActivity(user, week, sectionId, seconds, now = Date.now()) {
        assertUser(user); const draft = get(user, week), section = draft?.sections.find(s => s.id === sectionId);
        if (!draft || draft.submittedAt || !section || section.state !== 'active' || draft.break && !draft.break.endedAt) return draft;
        const delta = Math.max(0, Math.floor(Number(seconds) || 0));
        if (!delta || !Number.isFinite(delta)) return draft;
        const elapsed = Math.max(0, Math.floor((Math.min(now, section.deadline) - section.startedAt) / 1000));
        const previous = Math.max(0, Number(section.activeSeconds) || 0), next = Math.min(section.durationSeconds, elapsed, previous + delta);
        if (next <= previous) return draft;
        section.activeSeconds = next; return write(draft);
    }
    function finishSection(user, week, now = Date.now(), expectedSectionId) {
        const before = get(user, week), previousId = expectedSectionId || before?.sections.find(s => s.state === 'active')?.id;
        const draft = reconcile(user, week, now); if (!draft || draft.submittedAt) return draft;
        const index = draft.sections.findIndex(s => s.state === 'active');
        if (index < 0 || draft.sections[index].id !== previousId) return draft;
        endSection(draft, index, now, false); return write(draft);
    }
    function skipBreak(user, week, now = Date.now()) {
        const draft = reconcile(user, week, now);
        if (draft?.break && !draft.break.endedAt) { draft.break.endedAt = now; activate(draft, 2, now); return write(draft); }
        return draft;
    }
    function reportsFor(draft) {
        return draft.sections.filter(s => s.state === 'ended').flatMap(section => section.subjects.filter(subject=>section.initialAttempts.some(a=>a.subject===subject)).map(subject => {
            const attempts = section.initialAttempts.filter(a => a.subject === subject);
            const score = attempts.filter(a => a.correct).length, context = attempts[0]?.context || {}, formula = subject === 'math_formula';
            return { sessionId: `${draft.assessmentId}:${subject}`, subject: formula ? 'math' : subject, level: `${section.name} 종합 모의고사`,
                round: draft.attemptNo||1, date: section.endedAt, createdAt: section.endedAt, updatedAt: section.endedAt, totalQuestions: attempts.length,
                initialScore: score, finalScore: score, timeSpentSeconds: Math.max(0, Number(section.activeSeconds) || 0) * attempts.length / questionsFor(draft, section).length,
                isCompleted: score === attempts.length, metadata: { ...context, assessment: true, examTraining: true, mockExam: true, kind: 'mock', assessmentId: draft.assessmentId,
                    assessmentSubject: subject, ...(formula ? { source: 'math-formula' } : {}), resultVisibility: 'withheld',
                    scheduledWeekId: draft.scheduledWeekId, scheduledDate: draft.scheduledDate, scopeCutoffAt: draft.scopeCutoffAt,
                    bankVersion: draft.bankVersion, examVersion: draft.bankVersion, attemptNo: draft.attemptNo||1, parentAttemptId: draft.parentAttemptId||null, submittedAt: section.endedAt,
                    examComplete: !!draft.submittedAt, status: 'submitted', sectionId: section.id, sectionDeadline: section.deadline,
                    timedOut: section.timedOut, activeSeconds: Math.max(0, Number(section.activeSeconds) || 0) * attempts.length / questionsFor(draft, section).length,
                    elapsedSeconds: Math.max(0, Number(section.elapsedSeconds) || 0) * attempts.length / questionsFor(draft, section).length,
                    sectionElapsedSeconds: Math.max(0, Number(section.elapsedSeconds) || 0), timeAccountingVersion: 'active-v1',
                    unansweredCount: attempts.filter(a => a.unanswered).length, initialAttempts: clone(attempts), attempts: clone(attempts),
                    requestedCount: draft.quotas?.[subject] ?? areas[subject], actualCount: attempts.length, repeatedCount: attempts.filter(a => a.repeated).length,
                    newQuestionCount: attempts.filter(a => !a.repeated).length, scopeComplete: true,
                    questionContexts: attempts.map(a => ({ questionId: a.questionId, context: a.context, sourceReportIds: a.sourceReportIds })) } };
        }));
    }
    async function saveReports(user, week) {
        assertUser(user); const draft = get(user, week); if (!draft) return [];
        const generated = reportsFor(draft), old = repo().listReports(user), ids = new Set(old.map(r => r.sessionId));
        for (const report of generated) {
            const existing = old.find(r => r.sessionId === report.sessionId);
            if (existing && (existing.metadata?.submittedAt !== report.metadata.submittedAt
                || JSON.stringify(existing.metadata?.initialAttempts) !== JSON.stringify(report.metadata.initialAttempts)))
                throw new Error('다른 기기의 시험 제출 기록이 있습니다. 답안을 합치지 않았습니다. 관리자 확인이 필요합니다.');
        }
        repo().saveReports(user, [...old.map(report => draft.submittedAt && generated.some(r => r.sessionId === report.sessionId)
            ? { ...report, updatedAt: Math.max(Number(report.updatedAt || 0), draft.submittedAt), metadata: { ...report.metadata, examComplete: true } } : report), ...generated.filter(r => !ids.has(r.sessionId))]);
        await repo().flush?.(); assertUser(user);
        const saved = new Set(repo().listReports(user).map(r => r.sessionId));
        if (!generated.every(r => saved.has(r.sessionId))) throw new Error('일부 과목 기록 저장을 확인하지 못했습니다.');
        return generated;
    }
    function submissionSnapshot(draft) {
        if (!draft?.submittedAt || draft.sections.some(s => s.state !== 'ended')) throw new Error('네 과목 제출을 먼저 완료해 주세요.');
        return { ...clone(draft), initialAttempts: draft.sections.flatMap(s => clone(s.initialAttempts)), reports: reportsFor(draft) };
    }
    async function sync(user, week) {
        assertUser(user); let draft = get(user, week); if (!draft?.submittedAt) return { synced: false, reason: 'incomplete' };
        const assessmentId=draft.assessmentId;
        try {
            await saveReports(user, assessmentId); assertUser(user);
            if (!app.MockPublication?.submit) throw new Error('클라우드 저장 준비 중입니다.');
            let timeout;
            const saved = await Promise.race([app.MockPublication.submit(user, submissionSnapshot(draft)),
                new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('클라우드 저장이 지연되고 있습니다. 다시 저장해 주세요.')), 15000); })]).finally(() => clearTimeout(timeout));
            if (saved !== true && saved?.saved !== true && saved?.synced !== true) throw new Error('클라우드 저장을 확인하지 못했습니다.');
            assertUser(user); draft = getById(user, assessmentId); draft.syncStatus = 'synced'; delete draft.syncError; write(draft); return { synced: true };
        } catch (error) {
            if (repo().getActiveUser() === user) { draft = getById(user, assessmentId); draft.syncStatus = 'pending'; draft.syncError = String(error.message || error); write(draft); }
            return { synced: false, reason: String(error.message || error) };
        }
    }
    app.MockExam = { areas, definitions, weekId, key, list, get, getById, restore, create, validateBank, questionsFor, reconcile, answer, move, recordActivity, finishSection,
        skipBreak, reportsFor, saveReports, submissionSnapshot, sync };
    if (typeof module !== 'undefined' && module.exports) module.exports = app.MockExam;
})(typeof window !== 'undefined' ? window : globalThis);

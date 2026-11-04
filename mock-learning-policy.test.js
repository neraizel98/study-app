const { test } = require('node:test');
const assert = require('node:assert/strict');
const P = require('./mock-learning-policy.js');
const DAY = 86400000;
const base = Date.parse('2026-11-01T12:00:00+09:00');
const catalogs = {
    vocabData: { level1: [{ word: 'moon', meaning: '달' }, { word: 'sun', meaning: '태양' }], level2: [{ word: 'moon' }] },
    EnglishGrammarData: { elementary: { units: [{ id: 'e1', lessons: [{ title: '문장 순서' }, { title: '대명사' }] }] }, middle1: { units: [{ id: 'e1', lessons: [{ title: '다른 학년' }] }] } },
    EnglishReadingData: { units: [{ id: 'er1', gradeId: 'grade6', passages: [{ id: 'learned', questions: [{ id: 'known-fact', type: 'fact' }, { id: 'known-main', type: 'main' }, { id: 'known-word', type: 'vocabulary' }] }] }, { id: 'er2', gradeId: 'middle1', passages: [{ questions: [{ type: 'fact' }] }] }] }
};
const contexts = { english: { unitId: 'level1' }, grammar: { levelId: 'elementary', unitId: 'e1' }, english_reading: { levelId: 'grade6', unitId: 'er1' } };
const question = (subject = 'english', extra = {}) => ({ id: `${subject}-source`, subject, context: contexts[subject], question: `${subject} source question`, answer: 'A', choices: ['A', 'B'], conceptId: { english: 'word-definition:moon', grammar: 'lesson:0', english_reading: 'fact' }[subject], ...(subject === 'english_reading' ? { passageId: 'exam-transfer', passageLines: ['Brand new exam passage.'] } : {}), ...extra });
function snapshot(questions = [question()]) { return { assessmentId: 'exam-a', status: 'submitted', submittedAt: base, questions, initialAttempts: questions.map(q => ({ questionId: q.id, subject: q.subject, context: q.context, conceptId: q.conceptId, correct: false })) }; }
const targetFor = subject => P.analyze(snapshot([question(subject)]), catalogs).targets[0];
function attempt(subject, id, extra = {}) { return { questionId: id, subject, question: `${subject} fresh ${id}`, correctAnswer: 'A', choices: ['A', 'B'], correct: true, ...(subject === 'english' ? { word: 'moon' } : subject === 'grammar' ? { lessonIndex: 0 } : { skill: 'fact', passageText: [`Unique passage ${id}.`] }), ...extra }; }
function report(subject, id, at, attempts, extra = {}) { return { sessionId: id, subject, createdAt: at, date: at, totalQuestions: attempts.length, isCompleted: false, finalScore: attempts.filter(a => a.correct).length, metadata: { ...contexts[subject], submittedAt: at, initialAttempts: attempts, attempts, ...extra } }; }
function review(target, at = base + 1000) { return { assessmentId: target.assessmentId, questionId: target.questionId, reviewedAt: at, correct: true, status: 'correct' }; }
function wordReports() { return [report('english', 'first', base + 3600000, [attempt('english', 'a'), attempt('english', 'b')]), report('english', 'second', base + DAY + 3600000, [attempt('english', 'c')])]; }
const evaluate = (target, reports, events = [review(target)], now = base + 3 * DAY) => P.progress(target, reports, events, now, catalogs);
function freezeDeep(object) { Object.freeze(object); for (const item of Object.values(object)) if (item && typeof item === 'object' && !Object.isFrozen(item)) freezeDeep(item); return object; }

test('actual component counts, only English subjects, stable per-question targets, immutable source', () => {
    const questions = [question(), question('english', { id: 'word-two' }), question('grammar'), question('english_reading'), { id: 'math-one', subject: 'math' }];
    const s = snapshot(questions); s.initialAttempts[1].correct = true; s.initialAttempts[4].correct = true;
    const before = JSON.stringify(s); freezeDeep(s); freezeDeep(catalogs);
    const result = P.analyze(s, catalogs);
    assert.deepEqual(result.components, { english: { correct: 1, total: 2 }, grammar: { correct: 0, total: 1 }, english_reading: { correct: 0, total: 1 } });
    assert.deepEqual(result.targets.map(t => t.id), ['exam-a|english-source', 'exam-a|grammar-source', 'exam-a|english_reading-source']);
    assert.equal(result.targets[0].word, 'moon'); assert.equal(result.targets[0].conceptId, 'word:moon');
    assert.equal(result.targets[1].context.stageId, 'elementary'); assert.equal(result.targets[2].skill, 'fact');
    assert.equal(result.targets[2].context.unitId, 'er1'); assert.equal(result.targets[2].passageId, undefined);
    assert.equal(result.targets[2].question.passageId, 'exam-transfer'); assert.equal(JSON.stringify(s), before);
});

test('definition answer and question text never guess a word, lesson, or reading skill', () => {
    const s = snapshot([question('english', { conceptId: null, answer: 'the object seen at night' }), question('grammar', { conceptId: 'be-present' }), question('english_reading', { conceptId: 'story-feelings' })]);
    const result = P.analyze(s, catalogs);
    assert.equal(result.targets.length, 0); assert.equal(result.unmapped.length, 3);
    assert(result.unmapped.every(row => row.reason && row.question && !row.context && !row.conceptId));
});

test('explicit targets remain verified against catalog and incompatible context is isolated', () => {
    const q = question('english', { conceptId: null, learningTarget: { kind: 'word', word: 'moon', context: { unitId: 'level1' } } });
    assert.equal(P.analyze(snapshot([q]), catalogs).targets[0].word, 'moon');
    assert.equal(P.analyze(snapshot([{ ...q, learningTarget: { ...q.learningTarget, word: 'guessed' } }]), catalogs).targets.length, 0);
    const wrongGrade = question('english_reading', { context: { levelId: 'grade6', unitId: 'er2' } });
    assert.equal(P.analyze(snapshot([wrongGrade]), catalogs).unmapped[0].reason, 'reading-skill-not-in-catalog');
    const mismatch = snapshot([question()]); mismatch.initialAttempts[0].context = { unitId: 'level2' };
    assert.equal(P.analyze(mismatch, catalogs).targets.length, 0);
    const ambiguous = { ...catalogs, vocabData: { level1: [{ word: 'moon' }, { word: 'MOON' }] } };
    assert.equal(P.analyze(snapshot(), ambiguous).targets.length, 0);
});

test('non-submitted and invalid sources generate no targets', () => {
    assert.equal(P.analyze({ ...snapshot(), status: 'draft' }, catalogs).targets.length, 0);
    assert.equal(P.analyze({ ...snapshot(), submittedAt: null }, catalogs).targets.length, 0);
    const duplicate = snapshot(); duplicate.questions.push(structuredClone(duplicate.questions[0]));
    assert.equal(P.analyze(duplicate, catalogs).targets.length, 0);
});

test('exact concepts and context match, whole-unit scores and other words never do', () => {
    const word = targetFor('english'), grammar = targetFor('grammar'), reading = targetFor('english_reading');
    assert(P.matchAttempt(word, attempt('english', 'a'), report('english', 'r', base + 1, []), catalogs));
    assert(!P.matchAttempt(word, attempt('english', 'a', { word: 'sun' }), report('english', 'r', base + 1, []), catalogs));
    assert(!P.matchAttempt(word, attempt('english', 'a'), report('english', 'r', base + 1, [], { unitId: 'level2' }), catalogs));
    assert(!P.matchAttempt(grammar, { correct: true }, report('grammar', 'r', base + 1, []), catalogs));
    assert(!P.matchAttempt(grammar, attempt('grammar', 'a', { lessonIndex: 1 }), report('grammar', 'r', base + 1, []), catalogs));
    assert(P.matchAttempt(reading, { questionId: 'known-fact' }, report('english_reading', 'r', base + 1, []), catalogs));
    assert(!P.matchAttempt(reading, { questionId: 'known-main' }, report('english_reading', 'r', base + 1, []), catalogs));
    assert(!P.matchAttempt(reading, { questionId: 'invented' }, report('english_reading', 'r', base + 1, []), catalogs));
});

test('word completion uses three unique first answers over two KST days and 24 hours after review', () => {
    const target = targetFor('english'), rows = wordReports(), before = JSON.stringify(rows);
    const result = evaluate(target, rows);
    assert.equal(result.stage, 'completed'); assert.equal(result.completed, true); assert.equal(result.freshCount, 3); assert.equal(result.successfulDays, 2);
    assert.equal(JSON.stringify(rows), before); assert.equal(target.context.unitId, 'level1');
    assert.equal(evaluate(target, rows, []).stage, 'needs-review');
});

test('crossing midnight without 24 hour gap cannot complete', () => {
    const target = { ...targetFor('english'), sourceSubmittedAt: Date.parse('2026-11-01T23:00:00+09:00') }, start = target.sourceSubmittedAt;
    const rows = [report('english', 'a', start + 100000, [attempt('english', 'a'), attempt('english', 'b')]), report('english', 'b', start + 2 * 3600000, [attempt('english', 'c')])];
    const result = evaluate(target, rows, [review(target, start + 1000)]);
    assert.equal(result.successfulDays, 2); assert.equal(result.completed, false); assert.equal(result.stage, 'verify');
});

test('review-only correctness and repeated renamed questions never inflate fresh counts', () => {
    const target = targetFor('english'), source = target.question;
    const same = attempt('english', 'renamed', { question: source.question, correctAnswer: source.answer });
    const rows = [report('english', 'a', base + 3600000, [same, attempt('english', 'new')]), report('english', 'b', base + DAY + 3600000, [attempt('english', 'new', { questionId: 'new-id' })])];
    const result = evaluate(target, rows, [review(target), review(target), { ...review(target), reviewedAt: base + DAY }]);
    assert.equal(result.reviewDone, true); assert.equal(result.freshCount, 1); assert.equal(result.completed, false);
    assert.equal(evaluate(target, [], [review(target)]).freshCount, 0);
});

test('earlier exposures including drafts and assisted records block the same rendered question', () => {
    const target = targetFor('english'), rows = wordReports();
    const old = report('english', 'old', base - DAY, [attempt('english', 'a')], { status: 'draft', assisted: true });
    const result = evaluate(target, [old, ...rows]);
    assert.equal(result.freshCount, 2); assert.equal(result.completed, false);
});

test('first attempts are authoritative even when final retry is 100 percent', () => {
    const target = targetFor('english'), rows = wordReports();
    rows[0].metadata.initialAttempts = rows[0].metadata.initialAttempts.map((a, i) => ({ ...a, correct: i !== 0 }));
    rows[0].metadata.attempts = rows[0].metadata.initialAttempts.map(a => ({ ...a, correct: true, round: 2 })); rows[0].finalScore = 2; rows[0].isCompleted = true;
    const result = evaluate(target, rows);
    assert.equal(result.freshCount, 3); assert.equal(result.correctCount, 2); assert.equal(result.completed, false);
});

test('ordinary isCompleted false reports and legacy createdAt fallback remain valid', () => {
    const target = targetFor('english'), rows = wordReports(); rows.forEach(r => { delete r.metadata.submittedAt; });
    assert.equal(evaluate(target, rows).completed, true);
    rows[0].createdAt = base - DAY; rows[0].date = base - DAY; rows[0].metadata.submittedAt = base + 3600000;
    assert.equal(evaluate(target, rows).freshCount, 1);
});

test('incomplete, hinted, translation, exam, review, future, and nonboolean evidence cannot complete', () => {
    const target = targetFor('english');
    for (const flag of [{ hintUsed: true }, { translationUsed: true }, { assisted: true }, { assessment: true }, { assessmentId: 'other' }, { mockExam: true }, { examTraining: true }, { review: true }, { familiarAttempt: true }, { repeated: true }, { status: 'draft' }, { status: 'partial' }]) {
        const rows = wordReports(); rows[0].metadata = { ...rows[0].metadata, ...flag };
        assert.equal(evaluate(target, rows).completed, false, JSON.stringify(flag));
    }
    let rows = wordReports(); rows[0].metadata.initialAttempts = rows[0].metadata.initialAttempts.slice(1); assert.equal(evaluate(target, rows).freshCount, 1);
    rows = wordReports(); rows[0].metadata.initialAttempts[0].correct = 'true'; assert.equal(evaluate(target, rows).freshCount, 1);
    rows = wordReports(); rows[0].metadata.initialAttempts[0].hintUsed = true; assert.equal(evaluate(target, rows).freshCount, 2);
    rows = wordReports(); rows[0].metadata.initialAttempts[0].repeated = true; assert.equal(evaluate(target, rows).freshCount, 2);
    assert.equal(evaluate(target, wordReports(), [review(target)], base + 5000).freshCount, 0);
});

test('missing semantic content remains collecting or needs-confirmation', () => {
    const target = targetFor('english'), rows = wordReports(); rows.forEach(r => r.metadata.initialAttempts.forEach(a => { delete a.question; }));
    const result = evaluate(target, rows);
    assert.equal(result.freshCount, 0); assert.equal(result.completed, false); assert.equal(result.status, 'needs-confirmation');
    assert.equal(evaluate({ ...target, context: {} }, wordReports()).status, 'needs-confirmation');
});

test('grammar requires six exact-lesson first answers, three per successful day', () => {
    const target = targetFor('grammar'), rows = [report('grammar', 'first', base + 3600000, ['a', 'b', 'c'].map(id => attempt('grammar', id))), report('grammar', 'second', base + DAY + 3600000, ['d', 'e', 'f'].map(id => attempt('grammar', id)))];
    assert.equal(evaluate(target, rows).completed, true);
    rows[1].metadata.initialAttempts[0].lessonIndex = 1;
    assert.equal(evaluate(target, rows).completed, false);
});

test('reading requires full sessions of five plus exact skill and actual passage content', () => {
    const target = targetFor('english_reading');
    const batch = prefix => ['a', 'b', 'c', 'd', 'e'].map((id, i) => attempt('english_reading', prefix + id, { skill: i < 3 ? 'fact' : 'main' }));
    const rows = [report('english_reading', 'first', base + 3600000, batch('one-')), report('english_reading', 'second', base + DAY + 3600000, batch('two-'))];
    assert.equal(evaluate(target, rows).freshCount, 6); assert.equal(evaluate(target, rows).completed, true);
    rows[0].totalQuestions = 4; rows[0].metadata.initialAttempts = rows[0].metadata.initialAttempts.slice(0, 4);
    assert.equal(evaluate(target, rows).completed, false);
    const missing = [report('english_reading', 'first', base + 3600000, batch('missing-').map(a => ({ ...a, passageText: [] })))];
    assert.equal(evaluate(target, missing).status, 'needs-confirmation');
});

test('submitted Sunday source references connect, draft sessions and unrelated accounts of questions do not', () => {
    const target = targetFor('english'), event = { sourceReferences: [{ sourceAssessmentId: target.assessmentId, sourceQuestionId: target.questionId }], correct: true, status: 'correct', reviewedAt: base + 1000 };
    assert.equal(evaluate(target, [], [{ submittedAt: base + 2000, answers: [event] }]).reviewDone, true);
    assert.equal(evaluate(target, [], [{ submittedAt: null, answers: [event] }]).reviewDone, false);
    assert.equal(evaluate(target, [], [{ ...event, sourceReferences: [{ sourceAssessmentId: 'other', sourceQuestionId: target.questionId }] }]).reviewDone, false);
    assert.equal(evaluate(target, [], [{ ...review(target), reviewedAt: base - 1 }]).reviewDone, false);
});

test('reading one skill question per new five-item passage can complete with three passages across two days', () => {
    const target = targetFor('english_reading');
    const passage = prefix => ['a', 'b', 'c', 'd', 'e'].map((id, i) => attempt('english_reading', prefix + id, { skill: i === 0 ? 'fact' : 'main', passageText: [`A complete different passage ${prefix}.`] }));
    const rows = [report('english_reading', 'p1', base + 3600000, passage('p1')), report('english_reading', 'p2', base + 7200000, passage('p2')), report('english_reading', 'p3', base + DAY + 3600000, passage('p3'))];
    const result = evaluate(target, rows);
    assert.equal(result.freshCount, 3); assert.equal(result.successfulDays, 2); assert.equal(result.completed, true);
    assert.equal(evaluate(target, rows.slice(1)).completed, false);
    rows[0].metadata.initialAttempts[0].correct = false;
    assert.equal(evaluate(target, rows).completed, false);
});

function wrapperHarness({ rows = [], remoteFails = false } = {}) {
    const fs = require('node:fs'), vm = require('node:vm');
    const prefs = new Map(), remote = new Map(), savedCalls = [];
    let activeUser = 'learner', settings = { assessmentId: 'exam-a', confirmedUnassisted: true }, published = true, exam = snapshot();
    let fail = remoteFails, failFlush = false;
    const app = {
        LocalRepository: { getActiveUser: () => activeUser, listReports: () => structuredClone(rows), areReportsPersisted: () => true,
            getPreference: (k, fallback) => prefs.has(k) ? structuredClone(prefs.get(k)) : fallback,
            setPreference: (k, value) => { prefs.set(k, structuredClone(value)); return value; }, keys: () => [...prefs.keys()],
            flush: async () => { if (failFlush) throw new Error('disk full'); }, retryPersistence: async () => {} },
        MockLearningRepository: { get: async () => structuredClone(settings), listReviewEvents: async () => [...remote.values()].map(value => structuredClone(value)),
            saveReviewEvent: async (user, event) => { savedCalls.push(structuredClone(event)); if (fail) throw new Error('offline'); const previous = remote.get(event.eventId); if (previous && JSON.stringify(previous) !== JSON.stringify(event)) throw new Error('conflict'); remote.set(event.eventId, structuredClone(event)); } },
        MockPublication: { get: async () => ({ published, snapshot: structuredClone(exam) }) }
    };
    const context = { SmartStudy: app, ...catalogs, console: { warn: () => {} }, Date: class extends Date { static now() { return base + 4 * DAY; } } }; context.window = context;
    vm.createContext(context); vm.runInContext(fs.readFileSync('mock-learning-policy.js', 'utf8'), context); vm.runInContext(fs.readFileSync('mock-learning.js', 'utf8'), context);
    return { api: app.MockLearning, app, rows, prefs, remote, savedCalls, setUser: v => { activeUser = v; }, setSettings: v => { settings = v; }, setPublished: v => { published = v; }, setExam: v => { exam = v; }, setFail: v => { fail = v; }, setFlushFail: v => { failFlush = v; } };
}
const eventInput = extra => ({ assessmentId: 'exam-a', questionId: 'english-source', reviewedAt: base + 1000, correct: true, status: 'correct', eventId: 'review.test', ...extra });
const choices = [{ context: contexts.english, label: '단어 레벨1' }];
const contextKey = (subject, c) => `${subject}:${c.levelId || ''}:${c.unitId}`;

test('wrapper gates hidden/unconfirmed/translation-detected/wrong-user exams before exposing targets', async () => {
    const h = wrapperHarness();
    h.setPublished(false); assert.equal(await h.api.refresh('learner'), null);
    h.setPublished(true); h.setExam({ ...snapshot(), integrity: { translationDetected: true } }); assert.equal(await h.api.refresh('learner'), null);
    h.setExam({ ...snapshot(), userId: 'someone-else' }); assert.equal(await h.api.refresh('learner'), null);
    h.setExam(snapshot()); h.setSettings({ assessmentId: 'exam-a', confirmedUnassisted: false }); assert.equal(await h.api.refresh('learner'), null);
    assert.equal(h.api.recommend('learner', 'english', choices, contextKey), null);
    await assert.rejects(h.api.recordReview('learner', eventInput()), /공개된/);
});

test('wrapper saves minimal immutable review refs, retains an offline outbox, retries once, and skips completed targets', async () => {
    const h = wrapperHarness({ rows: wordReports(), remoteFails: true });
    await h.api.refresh('learner');
    const before = h.api.signature('learner'); assert(h.api.recommend('learner', 'english', choices, contextKey));
    const saved = await h.api.recordReview('learner', eventInput({ selectedAnswer: 'DO NOT PERSIST' }));
    assert.equal(saved.syncStatus, 'pending'); assert.equal(h.api.getState('learner').pendingReviewCount, 1);
    const persisted = h.prefs.get('SmartStudy_MockLearningReview_learner');
    assert.deepEqual(Object.keys(persisted.events[0]).sort(), ['assessmentId', 'correct', 'eventId', 'questionId', 'reviewedAt', 'status']);
    assert(!JSON.stringify(persisted).includes('DO NOT PERSIST'));
    assert.equal(h.api.getState('learner').targets[0].progress.completed, true);
    assert.equal(h.api.recommend('learner', 'english', choices, contextKey), null); assert.notEqual(h.api.signature('learner'), before);
    h.setFail(false); await h.api.sync('learner'); assert.equal(h.remote.size, 1); assert.equal(h.api.getState('learner').pendingReviewCount, 0);
    const count = h.savedCalls.length;
    await h.api.recordReview('learner', eventInput()); assert.equal(h.savedCalls.length, count);
    await assert.rejects(h.api.recordReview('learner', eventInput({ correct: false, status: 'wrong' })), /내용이 다릅니다/);
});

test('wrapper bridges only submitted Sunday sessions with correct user and stable source refs', async () => {
    const h = wrapperHarness();
    const session = { userId: 'learner', sessionId: 'weekly-review:learner:2026-11-01:main', submittedAt: base + 2000,
        answers: [{ sourceReferences: [{ sourceAssessmentId: 'exam-a', sourceQuestionId: 'english-source' }], correct: true, status: 'correct', reviewedAt: base + 1000 }] };
    h.prefs.set('SmartStudy_WeeklyReview_learner_2026-11-01', session);
    h.prefs.set('SmartStudy_WeeklyReview_learner_2026-11-02', { ...session, submittedAt: null });
    h.prefs.set('SmartStudy_WeeklyReview_learner_2026-11-03', { ...session, userId: 'another' });
    await h.api.refresh('learner'); assert.equal(h.api.getState('learner').targets[0].progress.reviewDone, true); assert.equal(h.remote.size, 1);
    const count = h.savedCalls.length; await h.api.refresh('learner'); assert.equal(h.savedCalls.length, count); assert.equal(h.remote.size, 1);
});

test('wrapper restores review completion on another device through the dedicated repository', async () => {
    const first = wrapperHarness(); await first.api.refresh('learner'); await first.api.recordReview('learner', eventInput());
    const second = wrapperHarness({ rows: wordReports() }); for (const [id, event] of first.remote) second.remote.set(id, event);
    await second.api.refresh('learner'); assert.equal(second.api.getState('learner').targets[0].progress.completed, true);
    assert.equal(second.api.getState('learner').pendingReviewCount, 0);
    assert.equal(second.rows.length, 2); // Review does not add a normal quiz report.
});

test('wrapper never crosses accounts or allows caller mutation to alter the verified target', async () => {
    const h = wrapperHarness(); await h.api.refresh('learner');
    const current = h.api.getState('learner'); current.targets[0].word = 'sun'; assert.equal(h.api.getState('learner').targets[0].word, 'moon');
    await assert.rejects(h.api.recordReview('learner', eventInput({ questionId: 'unrelated' })), /현재 진단/);
    await assert.rejects(h.api.recordReview('learner', eventInput({ reviewedAt: base - 1 })), /확인할 수 없습니다/);
    h.setUser('another'); assert.equal(h.api.getState('learner'), null); assert.equal(h.api.signature('learner'), null);
    assert.equal(h.api.recommend('learner', 'english', choices, contextKey), null); await assert.rejects(h.api.recordReview('learner', eventInput()), /공개된/);
});

test('wrapper does not confirm a locally failed review save', async () => {
    const h = wrapperHarness(); await h.api.refresh('learner'); h.setFlushFail(true);
    await assert.rejects(h.api.recordReview('learner', eventInput()), /disk full/);
    assert.equal(h.remote.size, 0); assert.equal(h.api.getState('learner').targets[0].progress.reviewDone, false);
});

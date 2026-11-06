const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const DAY = 86400000, now = Date.parse('2026-11-05T12:00:00+09:00');
const q = (id, extra = {}) => ({ id, question: `Question ${id}?`, answer: 'A', choices: ['A', 'B'], ...extra });
function harness(reports = []) {
    let user = 'learner'; const c = { Date, console, URLSearchParams, Math, setTimeout, clearTimeout };
    c.SmartStudy = { LocalRepository: { getActiveUser: () => user, listReports: () => reports } }; c.window = c;
    vm.createContext(c); vm.runInContext(fs.readFileSync('quiz-exposure.js', 'utf8'), c);
    return { c, api: c.QuizExposure, reports, setUser: value => { user = value; } };
}
function report(subject, sessionId, questions, at = now - DAY, extra = {}) {
    return { userId: 'learner', subject, sessionId, createdAt: at, date: at, totalQuestions: questions.length,
        metadata: { initialAttempts: questions.map(item => ({ ...item, correct: true, correctAnswer: item.correctAnswer ?? item.answer, round: 1 })), ...extra } };
}
test('semantic fingerprint ignores IDs, choice order, case/layout and retains givens and passage meaning', () => {
    const { api } = harness();
    assert.equal(api.fingerprint(q('one', { question: 'What is this?', choices: ['A', 'B'] })), api.fingerprint(q('renamed', { question: 'WHAT  IS THIS ?', choices: ['B', 'A'] })));
    assert.notEqual(api.fingerprint(q('one', { givens: 'x=2' })), api.fingerprint(q('one', { givens: 'x=3' })));
    assert.notEqual(api.fingerprint(q('one', { passageText: ['One passage.'] })), api.fingerprint(q('one', { passageText: ['Another passage.'] })));
    assert.equal(api.fingerprint(q('a', { passageText: ['First.', 'Second.'], passageId: 'old' })), api.fingerprint(q('b', { question: 'Question a?', passageText: ['First. Second.'], passageId: 'new' })));
});
test('unseen first, one prior answer second, capped content only as explicit same-scope review', () => {
    const known = q('known'), once = q('once'), fresh = q('fresh'), { api } = harness([report('grammar', 'r1', [known, once]), report('grammar', 'r2', [known])]);
    const selected = api.select('learner', 'grammar', [known, once, fresh], 2, { now });
    assert.deepEqual(Array.from(selected.items, item => item.id), ['fresh', 'once']); assert.equal(selected.reviewRequired, false);
    const full = api.select('learner', 'grammar', [known, once, fresh], 5, { now });
    assert.equal(full.items.length, 3); assert.equal(full.reviewRequired, true); assert.equal(full.items[2].exposure.kind, 'review');
    assert.equal(full.items[2].exposure.priorCount, 2); assert.equal(full.reviewCount, 1);
});
test('first answers count once per session and retry final success never adds an exposure', () => {
    const a = q('same'), r = report('grammar', 'same-session', [a, { ...a, id: 'renamed' }]);
    r.metadata.attempts = [...r.metadata.initialAttempts, { ...a, correct: true, round: 2 }];
    const { api } = harness([r, { ...r, date: now - 100, metadata: { ...r.metadata, submittedAt: now - 100 } }]);
    assert.equal(api.inspect('learner', 'grammar', [a], { now })[0].count, 1);
    const legacy = report('grammar', 'legacy', []); delete legacy.metadata.initialAttempts; legacy.metadata.attempts = [{ ...a, correct: true, round: 1 }, { ...a, correct: true, round: 2 }];
    assert.equal(harness([legacy]).api.inspect('learner', 'grammar', [a], { now })[0].count, 1);
});
test('seven-day boundary, drafts, future entries and explicit foreign users are isolated', () => {
    const a = q('a'), rows = [report('grammar', 'old', [a], now - 7 * DAY), report('grammar', 'future', [a], now + 1), report('grammar', 'draft', [a], now - 100, { status: 'draft' }), { ...report('grammar', 'foreign', [a]), userId: 'another' }];
    const h = harness(rows); assert.equal(h.api.inspect('learner', 'grammar', [a], { now })[0].count, 0);
    rows.push(report('grammar', 'within', [a], now - 7 * DAY + 1)); assert.equal(h.api.inspect('learner', 'grammar', [a], { now })[0].count, 1);
    rows[4].createdAt = now - 8 * DAY; assert.equal(h.api.inspect('learner', 'grammar', [a], { now })[0].count, 0, 'retry timestamp cannot renew old first submission');
});
test('semantic duplicates with different IDs are one candidate and copies do not mutate the bank', () => {
    const { api } = harness(), source = [q('a'), q('b', { question: 'Question a?' })]; Object.freeze(source[0]); Object.freeze(source);
    const selected = api.select('learner', 'grammar', source, 10, { now });
    assert.equal(selected.items.length, 1); assert.equal(source[0].exposure, undefined); assert(selected.items[0].exposure);
});
test('formula history uses the source adapter and least exposed/oldest fallback stays in supplied range', () => {
    const a = q('a'), b = q('b'), { api } = harness([report('math', 'one', [a, b], now - 3 * DAY, { source: 'math-formula' }), report('math', 'two', [a, b], now - DAY, { source: 'math-formula' }), report('math', 'three', [b], now - 100, { source: 'math-formula' })]);
    const selected = api.select('learner', 'math_formula', [b, a], 2, { now });
    assert.deepEqual(Array.from(selected.items, item => item.id), ['a', 'b']); assert(selected.reviewRequired);
    assert.equal(api.inspect('learner', 'math', [a], { now })[0].count, 0);
});
test('explicit review still records exposure and null user cannot read another learner history', () => {
    const a = q('a'), { api } = harness([report('grammar', 'one', [a])]);
    assert.equal(api.select('learner', 'grammar', [a], 1, { now, review: true }).items[0].exposure.reviewRequired, true);
    assert.equal(api.inspect(null, 'grammar', [a], { now })[0].count, 0);
});
test('authoritative legacy aliases union old and new first-submit sessions without double-counting one session', () => {
    const h = harness(), old = q('old'), current = q('current');
    current.exposureAliases = [h.api.fingerprint(old)];
    h.reports.push(report('hanja', 'same-session', [old, current]), report('hanja', 'new-session', [current]));
    assert.equal(h.api.inspect('learner', 'hanja', [current], { now })[0].count, 2);
    assert.equal(h.api.select('learner', 'hanja', [current], 1, { now }).reviewRequired, true);
});

function dom(c) {
    const elements = new Map(), saves = [], alerts = [], timerResults = [];
    const element = id => {
        if (!elements.has(id)) elements.set(id, { id, hidden: false, value: '', children: [], textContent: '', innerHTML: '', disabled: false, classList: { add() {}, remove() {} }, addEventListener() {} });
        return elements.get(id);
    };
    c.document = { getElementById: element, addEventListener() {}, querySelectorAll: () => [] }; c.location = { search: '', href: '' }; c.history = { replaceState() {} };
    c.Utils = { shuffle: values => [...values] }; c.alert = message => alerts.push(message); c.saveQuizResult = (...args) => saves.push(args);
    c.StudyTimer = { isUnlocked: () => true, recordResult: (...args) => timerResults.push(args) }; c.LearningPolicy = { isDue: () => false };
    c.WrongNote = { getAll: () => ({}), save() {} };
    return { element, saves, alerts, timerResults };
}
test('real grammar start/first answers/finish continue when every candidate has reached the cap', () => {
    const h = harness(), ui = dom(h.c); const bank = Array.from({ length: 12 }, (_, i) => q(`grammar-${i}`, { type: 'choice', answerIndex: 0, lessonIndex: 0, explanation: '확인' }));
    h.c.EnglishGrammarData = { elementary: { title: '초등', units: [{ id: 'e1', title: '단원', lessons: [{ title: '학습', examples: [] }] }] } };
    h.c.EnglishGrammarQuiz = { generate: () => bank }; h.c.AdaptiveQuiz = { getBand: () => ({ name: 'standard', wrongRatio: 0 }), weightedWrongItems: () => [] };
    h.reports.push(report('grammar', 'one', bank, Date.now() - DAY), report('grammar', 'two', bank, Date.now() - 1000));
    vm.runInContext(fs.readFileSync('EnglishGrammarApp.js', 'utf8').replace(/\}\)\(\);\s*$/, 'window.testGrammar={startQuiz,finishQuiz,completeAnswer,questions:()=>questions,advance:()=>{questionIndex++;answered=false;}};})();'), h.c);
    h.c.testGrammar.startQuiz(); const selected = h.c.testGrammar.questions(); assert.equal(selected.length, 10); assert.equal(ui.alerts.length, 0);
    assert.match(ui.element('quizProgress').textContent, /복습/);
    for (const item of selected) { h.c.testGrammar.completeAnswer(item.answer, true, 0); h.c.testGrammar.advance(); }
    h.c.testGrammar.finishQuiz(); const metadata = ui.saves[0][8]; assert.equal(metadata.review, true); assert.equal(metadata.familiarAttempt, true); assert.equal(ui.timerResults.length, 0); assert.equal(metadata.attempts.length, 10);
    assert.equal(metadata.attempts[0].exposure.priorCount, 2);
});
test('real Korean reading chooses a same-unit passage with fresh questions before a capped passage', () => {
    const h = harness(), ui = dom(h.c);
    const makePassage = id => ({ id, levelId: 'level1', unitId: 'u1', grade: 7, difficulty: 'standard', title: id, category: '확인', lines: ['가', '나', '다', '라', '마'], questions: Array.from({ length: 5 }, (_, i) => q(`${id}-${i}`, { choices: ['A', 'B', 'C', 'D'], evidence: '근거', skill: '사실' })) });
    const old = makePassage('old'), fresh = makePassage('fresh');
    h.c.ReadingData = { levels: { level1: { title: '중학', units: [{ id: 'u1', title: '단원', lessons: [{ title: '학습' }] }] } } };
    h.c.KoreanReadingCurriculum = { gradeOfUnit: () => 7, gradeOfPassage: () => 7, levelForGrade: () => 'level1' }; h.c.ReadingPassages = [old, fresh];
    h.c.SmartStudy.LocalRepository.getPreference = (_key, fallback) => fallback; h.c.SmartStudy.LocalRepository.setPreference = () => {}; h.c.SmartStudy.StorageKeys = { recentPassages: id => id };
    h.reports.push(report('reading', 'one', old.questions.map(item => ({ ...item, passageId: old.id, passageText: old.lines })), Date.now() - DAY), report('reading', 'two', old.questions.map(item => ({ ...item, passageId: old.id, passageText: old.lines })), Date.now() - 1000));
    vm.runInContext(fs.readFileSync('ReadingApp.js', 'utf8').replace(/\}\)\(\);\s*$/, 'window.testReading={startQuiz,finish,questions:()=>questions};})();'), h.c);
    h.c.testReading.startQuiz(); assert.equal(ui.element('passageTitle').textContent, 'fresh'); assert.equal(h.c.testReading.questions().length, 5);
    h.c.ReadingPassages.pop(); h.c.testReading.startQuiz(); assert.equal(ui.alerts.length, 0); assert.match(ui.element('passageMeta').textContent, /복습/);
    h.c.testReading.finish(); assert.equal(ui.saves[0][8].review, true); assert.equal(ui.timerResults.length, 0);
});
test('real formula creator generates a same-formula review instead of blocking when its finite pool is capped', () => {
    const h = harness(); h.c.addEventListener = () => {};
    const bank = Array.from({ length: 5 }, (_, i) => ({ prompt: `Formula question ${i}`, answer: String(i), givens: `x=${i}`, choices: [String(i), '99'], noteType: 'calculation' }));
    h.c.MathFormulaReview = { band: () => 'foundation', create: () => bank };
    h.reports.push(report('math', 'one', bank, Date.now() - DAY, { source: 'math-formula' }), report('math', 'two', bank, Date.now() - 1000, { source: 'math-formula' }));
    vm.runInContext(fs.readFileSync('MathFormulaApp.js', 'utf8'), h.c);
    const selected = vm.runInContext('MathFormulaApp.createCalculationQuestions(3)', h.c);
    assert.equal(selected.length, 5); assert(selected.every(item => item.exposure.reviewRequired)); assert(selected.every(item => bank.some(q => q.prompt === item.prompt)));
});
test('real vocabulary candidate selection counts actual meaning items, keeps one item per word and never mutates bank', () => {
    const h = harness(); h.c.location = { search: '' }; h.c.Utils = { shuffle: rows => [...rows] };
    vm.runInContext(fs.readFileSync('main.js', 'utf8'), h.c);
    vm.runInContext('currentQuizBand={name:"foundation"}', h.c);
    const words = Array.from({ length: 30 }, (_, i) => ({ word: `word${i}`, meaning: `뜻${i}`, ex: `This is word${i}.`, pos: 'n.' }));
    h.c.words = words;
    const candidates = vm.runInContext('words.flatMap(vocabularyQuestionVariants)', h.c), before = JSON.stringify(words);
    h.reports.push(report('english', 'one', candidates, Date.now() - DAY), report('english', 'two', candidates, Date.now() - 1000));
    const chosen = vm.runInContext('selectVocabularyPractice(words,20)', h.c);
    assert.equal(chosen.length, 20); assert.equal(new Set(chosen.map(w => w.word)).size, 20);
    assert(chosen.every(item => item.exposure.reviewRequired)); assert.equal(JSON.stringify(words), before);
    vm.runInContext('currentQuizBand={name:"standard"}', h.c);
    const variants = vm.runInContext('vocabularyQuestionVariants(words[0])', h.c);
    assert.equal(h.api.fingerprint(variants.find(q => q.qType === 2)), h.api.fingerprint(variants.find(q => q.qType === 8)), 'input widget change cannot reset the same blank question');
});

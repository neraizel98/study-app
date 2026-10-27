const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
// Minimal DOM: enough for mock-exam-ui.js, mock-exam-results.js and mock-admin.js.
class El {
    constructor(tag = 'div', id = '') { this.tagName = tag.toUpperCase(); this.id = id; this.children = []; this.hidden = false; this.disabled = false; this.checked = false; this.open = false; this.textContent = ''; this.className = ''; this.attributes = {}; this.style = { setProperty() {} }; this.isConnected = true;
        this.classList = { add: name => { if (!this.className.split(' ').includes(name)) this.className = `${this.className} ${name}`.trim(); }, remove() {}, toggle() {}, contains: name => this.className.split(' ').includes(name) }; }
    get childNodes() { return this.children; } get lastChild() { return this.children.at(-1); }
    get value() { return this._value ?? this.children.find(c => c.tagName === 'OPTION')?.value ?? ''; }
    set value(v) { this._value = v; }
    append(...nodes) { this.children.push(...nodes); } replaceChildren(...nodes) { this.children = [...nodes]; }
    setAttribute(k, v) { this.attributes[k] = v; } querySelector() { return this._h2 ||= new El('h2'); } focus() {} showModal() { this.open = true; } close() { this.open = false; }
}
const all = node => [node, ...(node.children || []).flatMap(all)];
const textOf = node => all(node).map(n => n.textContent || '').join(' ');
const start = Date.parse('2026-10-17T00:00:00Z');
function storage() {
    const values = new Map(), reports = new Map();
    return { values, reports, local: user => ({ ready: Promise.resolve(), getActiveUser: () => user, getPreference: (k, d) => values.has(k) ? structuredClone(values.get(k)) : d, setPreference: (k, v) => values.set(k, structuredClone(v)),
        keys: () => [...values.keys()], listReports: u => structuredClone(reports.get(u) || []), saveReports: (u, items) => reports.set(u, structuredClone(items)), flush: async () => {} }) };
}
function bankFor(areas) {
    return { complete: true, version: 'test', items: Object.entries(areas).flatMap(([subject, count]) => Array.from({ length: count }, (_, index) =>
        ({ id: `${subject}:${index}`, subject, question: `${subject} 문항 ${index}`, choices: ['A', 'B', 'C'], answer: 'A', explanation: '설명', context: { unitId: `${subject}-unit` } }))) };
}
function apiHarness(store = storage()) {
    const app = { LocalRepository: store.local('우준'), MockExamBank: { grade: (q, response) => ({ correct: q.answer === response, answer: q.answer }) } };
    const context = { SmartStudy: app, module: { exports: {} }, Date, console, setTimeout, clearTimeout }; context.window = context;
    vm.runInNewContext(fs.readFileSync('mock-exam.js', 'utf8'), context);
    return { api: app.MockExam, app, store, bank: bankFor(app.MockExam.areas) };
}
// Boots mock-exam-ui.js against shared storage, like one page load on the same device.
async function page(store, clock, extra = {}) {
    const elements = new Map(), listeners = { window: {}, document: {} };
    const on = bucket => (type, fn) => { (bucket[type] ||= []).push(fn); };
    const document = { hidden: false, visibilityState: 'visible', activeElement: null, focused: true, hasFocus: () => document.focused,
        getElementById: id => { if (!elements.has(id)) elements.set(id, new El(id === 'examHistory' ? 'select' : 'div', id)); return elements.get(id); },
        createElement: tag => new El(tag), createTextNode: text => Object.assign(new El('#text'), { textContent: text }), addEventListener: on(listeners.document) };
    class FakeDate extends Date { constructor(...args) { super(...(args.length ? args : [clock.now])); } static now() { return clock.now; } }
    const intervals = [];
    const app = { LocalRepository: store.local('우준'), MockPublication: { list: async () => [], submit: async () => true, get: async () => ({ published: false }) },
        FirestoreRepository: { getLearnerPlanSettings: async () => null }, LearningPlan: { applyParentSettings() {}, getSettings: () => ({}) },
        MockExamBank: { build: () => bankFor(app.MockExam.areas), grade: (q, response) => ({ correct: q.answer === response, answer: q.answer }) },
        MockExamResults: { setMathText: (el, value) => { el.textContent = value; }, load: async () => ({ published: false }), render() {} } };
    const context = { SmartStudy: app, module: undefined, Date: FakeDate, console, setTimeout, clearTimeout, setInterval: fn => intervals.push(fn), clearInterval() {}, URLSearchParams,
        location: { search: '', pathname: '/mock-exam.html', href: '' }, history: { replaceState() {} }, document, addEventListener: on(listeners.window), ...extra };
    context.window = context;
    vm.runInNewContext(fs.readFileSync('mock-exam.js', 'utf8'), context);
    vm.runInNewContext(fs.readFileSync('mock-exam-ui.js', 'utf8'), context);
    for (let i = 0; i < 20; i++) await new Promise(resolve => setImmediate(resolve));
    const fire = (bucket, type, event = {}) => { for (const fn of listeners[bucket][type] || []) fn(event); };
    return { $: id => document.getElementById(id), document, app, fire, win: vm.runInContext('globalThis', context),
        draft: () => app.MockExam.get('우준', '2026-10-12'),
        hide: () => { document.hidden = true; document.visibilityState = 'hidden'; fire('document', 'visibilitychange'); },
        show: () => { document.hidden = false; document.visibilityState = 'visible'; fire('document', 'visibilitychange'); },
        tick: () => new Promise(resolve => setTimeout(resolve, 5)) };
}
test('화면 이탈 횟수와 시간 누적 · 최장 시간 · 휴식과 제출 후 미기록 · 이벤트 50개 제한', () => {
    const h = apiHarness(), draft = h.api.create('우준', h.bank, start, { pledged: true }), id = draft.assessmentId;
    assert.deepEqual([draft.integrity.leaves, draft.integrity.awaySeconds, draft.integrity.pledgedAt], [0, 0, start]);
    h.api.markLeave('우준', id, start + 1000); h.api.markLeave('우준', id, start + 2000);
    assert.equal(h.api.getById('우준', id).integrity.leaves, 1, 'blur와 visibilitychange가 겹쳐도 한 번');
    let saved = h.api.markReturn('우준', id, start + 31000);
    assert.deepEqual([saved.integrity.leaves, saved.integrity.awaySeconds, saved.integrity.longestAwaySeconds, saved.integrity.awayStartedAt], [1, 30, 30, null]);
    assert.deepEqual(JSON.parse(JSON.stringify(saved.integrity.events)), [{ type: 'leave', at: start + 1000, seconds: 30 }]);
    h.api.markLeave('우준', id, start + 40000); saved = h.api.markReturn('우준', id, start + 50000);
    assert.deepEqual([saved.integrity.leaves, saved.integrity.awaySeconds, saved.integrity.longestAwaySeconds], [2, 40, 30]);
    h.api.finishSection('우준', id, start + 60000); h.api.finishSection('우준', id, start + 61000);
    assert.equal(h.api.markLeave('우준', id, start + 62000).integrity.leaves, 2, '휴식 중 이탈은 세지 않음');
    h.api.skipBreak('우준', id, start + 63000);
    for (let i = 0; i < 60; i++) { h.api.markLeave('우준', id, start + 70000 + i * 2000); h.api.markReturn('우준', id, start + 71000 + i * 2000); }
    saved = h.api.getById('우준', id);
    assert.equal(saved.integrity.leaves, 62); assert.equal(saved.integrity.awaySeconds, 100); assert.equal(saved.integrity.events.length, 50);
    const done = h.api.reconcile('우준', id, start + 90 * 60000);
    assert.equal(h.api.markLeave('우준', id, start + 91 * 60000).integrity.leaves, 62, '제출 후 이탈은 세지 않음');
    assert.equal(h.api.submissionSnapshot(done).integrity.leaves, 62, '제출 스냅샷(서버 payload)에 포함');
});
test('이탈 중 시간이 끝나면 제출 시각까지만 이탈 시간으로 기록', () => {
    const h = apiHarness(), id = h.api.create('우준', h.bank, start).assessmentId;
    h.api.markLeave('우준', id, start + 60 * 60000);
    const done = h.api.reconcile('우준', id, start + 3 * 3600000);
    assert.equal(done.submittedAt, start + 75 * 60000);
    assert.deepEqual([done.integrity.awayStartedAt, done.integrity.awaySeconds], [null, 15 * 60]);
});
test('번역 감지는 기록하고 같은 신호 반복은 한 번만 · 이전 진행 중 시험도 기록 가능', () => {
    const h = apiHarness(), draft = h.api.create('우준', h.bank, start), id = draft.assessmentId;
    h.api.markTranslation('우준', id, 'html-class', start + 1000); h.api.markTranslation('우준', id, 'html-class', start + 2000);
    let saved = h.api.markTranslation('우준', id, 'font-tag', start + 3000);
    assert.equal(saved.integrity.translationDetected, true);
    assert.deepEqual(JSON.parse(JSON.stringify(saved.integrity.events.map(e => [e.type, e.signal]))), [['translation', 'html-class'], ['translation', 'font-tag']]);
    // A draft saved before this feature has no integrity field.
    const old = h.api.getById('우준', id); delete old.integrity; h.store.values.set(h.api.key('우준', old.storageSlot), old);
    saved = h.api.markLeave('우준', id, start + 4000);
    assert.equal(saved.integrity.leaves, 1);
});
test('서약 체크 전에는 시작 불가 · 이탈/복귀 경고 · 새로고침 후에도 이탈 기록 유지', async () => {
    const store = storage(), clock = { now: start }, first = await page(store, clock);
    assert.equal(first.$('pledgeLabel').hidden, false);
    assert.equal(first.$('startExam').disabled, true, '서약 전 시작 버튼 비활성');
    first.$('startExam').onclick(); assert.equal(first.draft(), null, '서약 없이 시작하지 않음');
    first.$('examPledge').checked = true; first.$('examPledge').onchange();
    assert.equal(first.$('startExam').disabled, false);
    first.$('startExam').onclick();
    assert.equal(first.draft().integrity.pledgedAt, start); assert.equal(first.$('workPanel').hidden, false); assert.equal(first.$('examPledge').checked, false);
    clock.now += 5000; first.hide(); clock.now += 65000; first.show();
    assert.equal(first.$('leaveDialog').open, true);
    assert.match(first.$('leaveMessage').textContent, /보호자 결과에 표시돼요\. \(이번까지 1회\)/);
    assert.deepEqual([first.draft().integrity.leaves, first.draft().integrity.awaySeconds], [1, 65]);
    first.$('resumeExam').onclick(); assert.equal(first.$('leaveDialog').open, false);
    // Focus moving into an input or iframe keeps document focus: not a leave.
    first.fire('window', 'blur', { target: first.win }); await first.tick();
    assert.equal(first.draft().integrity.leaves, 1);
    first.document.focused = false; first.fire('window', 'blur', { target: first.win }); await first.tick();
    assert.equal(first.draft().integrity.leaves, 2);
    clock.now += 10000; first.document.focused = true; first.fire('window', 'focus', { target: first.win });
    assert.deepEqual([first.draft().integrity.leaves, first.draft().integrity.awaySeconds], [2, 75]);
    assert.match(first.$('leaveMessage').textContent, /이번까지 2회/);
    // Translation event from the guard is recorded on the in-progress attempt.
    first.fire('document', 'learning-translation-detected', { detail: { signal: 'html-class' } });
    assert.equal(first.draft().integrity.translationDetected, true);
    // Leave, then the page is closed; the next load closes the away period and warns.
    first.hide(); clock.now += 40000;
    const second = await page(store, clock);
    assert.deepEqual([second.draft().integrity.leaves, second.draft().integrity.awaySeconds, second.draft().integrity.translationDetected], [3, 115, true]);
    assert.equal(second.$('leaveDialog').open, true); assert.match(second.$('leaveMessage').textContent, /이번까지 3회/);
});
test('번역 감지 API가 이미 감지한 상태면 시험 시작 시 기록 · API가 없어도 동작', async () => {
    const store = storage(), clock = { now: start };
    const guard = { detected: true, signal: 'html-lang', onDetect() {} };
    const p = await page(store, clock, { LearningTranslationGuard: guard });
    p.$('examPledge').checked = true; p.$('examPledge').onchange(); p.$('startExam').onclick();
    assert.equal(p.draft().integrity.translationDetected, true); assert.equal(p.draft().integrity.events[0].signal, 'html-lang');
    const plain = await page(storage(), { now: start });
    plain.$('examPledge').checked = true; plain.$('examPledge').onchange(); plain.$('startExam').onclick();
    assert.equal(plain.draft().integrity.translationDetected, false);
});
function adminHarness(records) {
    const document = { createElement: tag => new El(tag) };
    const app = { MockPublication: { list: async () => records, publish: async () => {} }, WeeklySchedule: { weekDates: (_, offset) => [offset === 0 ? '2026-10-12' : `old-${offset}`] } };
    const context = { SmartStudy: app, document, console, Date, _adminData: { userId: '우준' } }; context.window = context;
    vm.runInNewContext(fs.readFileSync('mock-admin.js', 'utf8'), context);
    return app.MockAdmin;
}
const payload = (attemptNo, extra = {}) => ({ userId: '우준', scheduledWeekId: '2026-10-12', attemptNo, submittedAt: start + attemptNo, questions: [], initialAttempts: [], ...extra });
test('보호자 화면: 이탈·번역 기록 표시와 경고색 · 이전 시험은 기록 없음', async () => {
    const admin = adminHarness([
        { assessmentId: 'a1', published: false, payload: payload(1) },
        { assessmentId: 'a2', published: false, payload: payload(2, { integrity: { leaves: 3, awaySeconds: 130, longestAwaySeconds: 70, translationDetected: false, events: [] } }) },
        { assessmentId: 'a3', published: true, payload: payload(3, { integrity: { leaves: 0, awaySeconds: 0, longestAwaySeconds: 0, translationDetected: false, events: [] } }) },
        { assessmentId: 'a4', published: true, payload: payload(4, { integrity: { leaves: 0, awaySeconds: 0, translationDetected: true, events: [] } }) }]);
    const host = new El('div'); await admin.render('우준', host);
    const lines = all(host).filter(n => n.className.split(' ').includes('mock-integrity'));
    assert.equal(lines.length, 4);
    const byText = Object.fromEntries(lines.map(n => [n.textContent, n.className]));
    assert.equal(byText['화면 이탈 3회 · 총 2분 10초 (최장 1분 10초) · 번역 감지 없음'], 'mock-integrity is-warning');
    assert.equal(byText['화면 이탈 없음 · 번역 감지 없음'], 'mock-integrity');
    assert.equal(byText['화면 이탈 없음 · 번역 감지됨'], 'mock-integrity is-warning');
    assert.equal(byText['화면 이탈·번역 기록 없음 (기록 기능 이전 시험)'], 'mock-integrity is-empty');
    assert.match(textOf(host), /2026-10-12 주 · 1회차/, '기존 카드 렌더링 유지');
});
test('학생 공개 결과: 기록이 있으면 요약 한 줄, 이전 시험은 표시하지 않음', () => {
    const app = { LocalRepository: {} }, context = { SmartStudy: app, document: { createElement: tag => new El(tag), createTextNode: text => Object.assign(new El('#text'), { textContent: text }) }, console, Date }; context.window = context;
    vm.runInNewContext(fs.readFileSync('mock-exam-results.js', 'utf8'), context);
    const sections = [{ name: '국어', subjects: ['reading'], initialAttempts: [{ subject: 'reading', correct: true, question: 'q', correctAnswer: 'A', selectedAnswer: 'A' }] }];
    const withRecord = new El(), without = new El();
    app.MockExamResults.render(withRecord, { published: true, snapshot: { attemptNo: 1, sections, integrity: { leaves: 1, awaySeconds: 45, translationDetected: false } } });
    app.MockExamResults.render(without, { published: true, snapshot: { attemptNo: 1, sections } });
    const line = all(withRecord).find(n => n.className.includes('released-integrity'));
    assert.equal(line.textContent, '시험 중 기록 · 화면 이탈 1회 · 총 45초 · 번역 감지 없음'); assert.match(line.className, /is-warning/);
    assert.equal(all(without).some(n => n.className.includes('released-integrity')), false);
});

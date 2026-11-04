const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
// Minimal DOM: enough for quiz-integrity.js to listen, persist and show its notice.
class El {
    constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.children = []; this.attributes = {}; this.listeners = {}; this.hidden = false; this.textContent = ''; this.className = ''; this.id = ''; }
    append(...nodes) { this.children.push(...nodes); } appendChild(node) { this.children.push(node); return node; }
    setAttribute(k, v) { this.attributes[k] = v; } addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
    click() { for (const fn of this.listeners.click || []) fn({ target: this }); } focus() {}
}
const all = node => [node, ...(node.children || []).flatMap(all)];
const start = Date.parse('2026-11-04T00:00:00Z');
// One page load. Shares sessionStorage with other loads in the same tab, like a reload.
function load({ clock = { now: start }, session = new Map(), navigation = 'navigate', guard = null } = {}) {
    const listeners = { window: {}, document: {} };
    const add = bucket => (type, fn) => { (bucket[type] ||= []).push(fn); };
    const remove = bucket => (type, fn) => { bucket[type] = (bucket[type] || []).filter(f => f !== fn); };
    const body = new El('body'), head = new El('head');
    const document = { hidden: false, focused: true, activeElement: null, body, head, hasFocus: () => document.focused,
        createElement: tag => new El(tag), getElementById: id => all(head).concat(all(body)).find(n => n.id === id) || null,
        addEventListener: add(listeners.document), removeEventListener: remove(listeners.document) };
    class FakeDate extends Date { constructor(...args) { super(...(args.length ? args : [clock.now])); } static now() { return clock.now; } }
    const context = { document, Date: FakeDate, console, setTimeout, JSON,
        sessionStorage: { getItem: k => session.has(k) ? session.get(k) : null, setItem: (k, v) => session.set(k, String(v)), removeItem: k => session.delete(k) },
        performance: { getEntriesByType: () => [{ type: navigation }] },
        addEventListener: add(listeners.window), removeEventListener: remove(listeners.window) };
    if (guard) context.LearningTranslationGuard = guard;
    context.window = context;
    vm.runInNewContext(fs.readFileSync('quiz-integrity.js', 'utf8'), context);
    const fire = (bucket, type, event = {}) => { for (const fn of [...(listeners[bucket][type] || [])]) fn(event); };
    const win = vm.runInContext('window', context);
    const notice = () => all(body).find(n => n.className.includes('quiz-integrity-notice')) || null;
    return { api: context.QuizIntegrity, document, clock, session, listeners, fire, notice,
        win, text: () => all(notice()).map(n => n.textContent).join(' '),
        hide: () => { document.hidden = true; fire('document', 'visibilitychange'); },
        show: () => { document.hidden = false; fire('document', 'visibilitychange'); },
        tick: () => new Promise(resolve => setTimeout(resolve, 5)) };
}
const plain = value => JSON.parse(JSON.stringify(value));

test('화면 이탈 횟수·시간 누적 · 이탈 중 요약은 중복 없이 마감 · 복귀 시 안내', () => {
    const p = load(), s = p.api.start({ subject: 'english', kind: 'translator' });
    assert.equal(p.api.current(), s);
    assert.deepEqual(plain(s.summary()), { v: 1, kind: 'translator', leaves: 0, awaySeconds: 0, longestAwaySeconds: 0, translationDetected: false, translationSignal: null, events: [] });
    p.clock.now += 5000; p.hide();
    p.fire('window', 'blur', { target: p.win }); // blur와 visibilitychange가 겹쳐도 한 번
    p.clock.now += 12400;
    const open = s.summary();
    assert.deepEqual([open.leaves, open.awaySeconds, open.events[0].seconds], [1, 12, 12], '이탈 중 요약은 현재까지 시간으로 마감');
    assert.equal(s.summary().leaves, 1, '요약을 여러 번 불러도 한 번만 셈');
    p.clock.now += 47600; p.show();
    let sum = s.summary();
    assert.deepEqual([sum.leaves, sum.awaySeconds, sum.longestAwaySeconds], [1, 60, 60]);
    assert.deepEqual(plain(sum.events), [{ type: 'leave', at: start + 5000, seconds: 60 }]);
    assert.equal(p.notice().hidden, false);
    assert.equal(p.notice().attributes.translate, 'no');
    assert.match(p.text(), /퀴즈 중 화면을 벗어났어요/);
    assert.match(p.text(), /퀴즈는 번역기·사전 없이 스스로 풀어요\. 화면을 벗어난 기록은 보호자에게 표시돼요\. \(이번 퀴즈 1회\)/);
    assert.match(p.text(), /계속 풀기/);
    all(p.notice()).find(n => n.tagName === 'BUTTON').click();
    assert.equal(p.notice().hidden, true);
    p.clock.now += 1000; p.hide(); p.clock.now += 20000; p.show();
    sum = s.summary();
    assert.deepEqual([sum.leaves, sum.awaySeconds, sum.longestAwaySeconds], [2, 80, 60]);
    assert.match(p.text(), /\(이번 퀴즈 2회\)/);
    assert.ok(p.document.getElementById('quizIntegrityStyle'), '자체 CSS 주입');
});

test('페이지 안에서 포커스 이동(입력칸·iframe)은 이탈이 아님', async () => {
    const p = load(), s = p.api.start({ subject: 'grammar', kind: 'translator' });
    p.fire('window', 'blur', { target: p.win }); await p.tick();
    assert.equal(s.summary().leaves, 0, '문서 포커스 유지');
    p.document.focused = false; p.document.activeElement = { tagName: 'IFRAME' };
    p.fire('window', 'blur', { target: p.win }); await p.tick();
    assert.equal(s.summary().leaves, 0, 'iframe으로 이동');
    p.document.activeElement = null;
    p.fire('window', 'blur', { target: {} }); await p.tick();
    assert.equal(s.summary().leaves, 0, '요소 blur는 무시');
    p.fire('window', 'blur', { target: p.win }); await p.tick();
    assert.equal(s.summary().leaves, 1);
    p.clock.now += 9000; p.document.focused = true; p.fire('window', 'focus', { target: p.win });
    assert.deepEqual([s.summary().leaves, s.summary().awaySeconds], [1, 9]);
});

test('번역 감지는 영어(translator)만 한 번 기록 · 시작 전 감지도 기록 · 계산 퀴즈는 미기록', () => {
    let detect = null;
    const guard = { detected: false, signal: null, onDetect(cb) { detect = cb; } };
    const p = load({ guard }), s = p.api.start({ subject: 'english', kind: 'translator' });
    p.fire('document', 'learning-translation-detected', { detail: { signal: 'html-class' } });
    detect('html-class');
    p.fire('document', 'learning-translation-detected', { detail: { signal: 'font' } });
    const sum = s.summary();
    assert.deepEqual([sum.translationDetected, sum.translationSignal, sum.events.length, sum.events[0].type], [true, 'html-class', 1, 'translation']);
    const early = load({ guard: { detected: true, signal: 'sentinel', onDetect(cb) { cb('sentinel'); } } });
    assert.equal(early.api.start({ subject: 'english_reading', kind: 'translator' }).summary().translationSignal, 'sentinel');
    const math = load({ guard: { detected: true, signal: 'html-lang', onDetect() {} } }), ms = math.api.start({ subject: 'math', kind: 'calculator' });
    math.fire('document', 'learning-translation-detected', { detail: { signal: 'font' } });
    assert.equal(ms.summary().translationDetected, false);
    assert.equal(load().api.start({ subject: 'english', kind: 'translator' }).summary().translationDetected, false, '가드가 없어도 동작');
});

test('계산 퀴즈 안내 문구 · 이벤트는 20개까지, 횟수·시간은 계속 누적', () => {
    const p = load(), s = p.api.start({ subject: 'math', kind: 'calculator' });
    for (let i = 0; i < 25; i++) { p.hide(); p.clock.now += 2000; p.show(); p.clock.now += 1000; }
    const sum = s.summary();
    assert.deepEqual([sum.leaves, sum.awaySeconds, sum.events.length], [25, 50, 20]);
    assert.equal(sum.kind, 'calculator');
    assert.match(p.text(), /계산은 계산기 없이 직접 해요\. 화면을 벗어난 기록은 보호자에게 표시돼요\. \(이번 퀴즈 25회\)/);
    assert.doesNotMatch(p.text(), /번역기/);
});

test('새로고침하면 같은 과목 기록을 이어서 셈 · 일반 이동이나 정지 후에는 새로 시작', () => {
    const session = new Map(), clock = { now: start };
    const first = load({ session, clock }), s1 = first.api.start({ subject: 'english', kind: 'translator' });
    clock.now += 3000; first.hide(); clock.now += 4000; first.show(); clock.now += 1000; first.hide(); // 새로고침 중 이탈
    clock.now += 6000;
    const second = load({ session, clock, navigation: 'reload' });
    clock.now += 30000; // 다시 퀴즈를 시작하기까지 학습 화면에 머문 시간은 이탈이 아님
    const s2 = second.api.start({ subject: 'english', kind: 'translator' });
    const sum = s2.summary();
    assert.deepEqual([sum.leaves, sum.awaySeconds, sum.longestAwaySeconds], [2, 10, 6]);
    assert.equal(second.notice().hidden, false); assert.match(second.text(), /이번 퀴즈 2회/);
    assert.ok(s1);
    // A normal navigation (not a reload) does not inherit an old record.
    const third = load({ session, clock });
    assert.equal(third.api.start({ subject: 'english', kind: 'translator' }).summary().leaves, 0);
    // Stop clears the stored record, so a later reload starts fresh.
    const fourth = load({ session, clock, navigation: 'reload' }), s4 = fourth.api.start({ subject: 'grammar', kind: 'translator' });
    fourth.hide(); s4.stop();
    assert.equal(session.has('SmartStudy_QuizIntegrity_grammar'), false);
    assert.equal(load({ session, clock, navigation: 'reload' }).api.start({ subject: 'grammar', kind: 'translator' }).summary().leaves, 0);
});

test('stop은 멱등 · 정지 후 리스너 해제 · 새 start는 이전 세션을 정지 · continueFrom으로 재도전 누적', () => {
    const p = load(), s = p.api.start({ subject: 'english', kind: 'translator' });
    p.hide(); p.clock.now += 7000;
    const final = s.stop();
    assert.deepEqual([final.leaves, final.awaySeconds], [1, 7], '정지 시 열린 이탈 마감');
    p.clock.now += 50000;
    assert.deepEqual(plain(s.stop()), plain(final)); assert.deepEqual(plain(s.summary()), plain(final));
    assert.equal(p.api.current(), null);
    p.show(); p.hide(); p.show();
    assert.equal(s.summary().leaves, 1);
    assert.equal((p.listeners.document.visibilitychange || []).length, 0);
    const a = p.api.start({ subject: 'english', kind: 'translator' });
    const b = p.api.start({ subject: 'english', kind: 'translator', continueFrom: final });
    assert.equal(p.api.current(), b); assert.equal((p.listeners.document.visibilitychange || []).length, 1);
    assert.equal(a.stop().leaves, 0);
    p.hide(); p.clock.now += 3000; p.show();
    assert.deepEqual([b.summary().leaves, b.summary().awaySeconds, b.summary().longestAwaySeconds, b.summary().events.length], [2, 10, 7, 2]);
});

const read = file => fs.readFileSync(file, 'utf8');
test('영어 페이지 연결: 스크립트 순서 · 서비스워커 캐시', () => {
    for (const page of ['english.html', 'english_grammar.html', 'english_reading.html']) {
        const html = read(page), guard = html.indexOf('learning-translation-guard.js'), mine = html.indexOf('quiz-integrity.js?v=20261104-quiz-integrity');
        assert.ok(guard > 0 && mine > guard, `${page}: 번역 가드 뒤에 quiz-integrity.js`);
    }
    assert.match(read('service-worker.js'), /'\.\/quiz-integrity\.js'/);
});

test('영어 단어(main.js): 문제 시작 시 start · 결과 저장에 integrity · 재도전은 이어서 · 학습 모드 전환 시 정지', () => {
    const src = read('main.js');
    assert.match(src, /QuizIntegrity\?\.start\(\{ subject: 'english', kind: 'translator', continueFrom: retry \? quizSessionData\.integrity : null \}\)/);
    const startQuiz = src.slice(src.indexOf('function startQuiz('), src.indexOf('function updateHeader('));
    assert.ok(startQuiz.indexOf('startQuizIntegrity(Boolean(wordList));') < startQuiz.indexOf('showQuestion();', startQuiz.indexOf('startQuizIntegrity(')));
    const result = src.slice(src.indexOf('function showResult('), src.indexOf('function setMode('));
    assert.ok(result.indexOf('const integrity = stopQuizIntegrity();') >= 0 && result.indexOf('const integrity = stopQuizIntegrity();') < result.indexOf('saveQuizResult('));
    assert.match(result, /\.\.\.\(integrity \? \{ integrity \} : \{\}\)/);
    const setMode = src.slice(src.indexOf('function setMode('), src.indexOf('function reportCriticalError('));
    assert.match(setMode.slice(0, setMode.indexOf('} else {')), /stopQuizIntegrity\(\);/);
});

test('영어 문법·독해: 시작/정지 지점과 저장 metadata', () => {
    const grammar = read('EnglishGrammarApp.js');
    const gStart = grammar.slice(grammar.indexOf('function startQuiz('), grammar.indexOf('function renderQuestion('));
    assert.ok(gStart.indexOf("QuizIntegrity?.start({ subject: 'grammar', kind: 'translator' })") < gStart.indexOf('renderQuestion();'));
    const gFinish = grammar.slice(grammar.indexOf('function finishQuiz('), grammar.indexOf('function bind('));
    assert.ok(gFinish.indexOf('quizIntegrity?.stop()') < gFinish.indexOf('saveQuizResult('));
    assert.match(gFinish, /\.\.\.\(integrity \? \{ integrity \} : \{\}\)/);
    assert.match(grammar.slice(grammar.indexOf('function renderStudy('), grammar.indexOf('function quizUnlocked(')), /quizIntegrity\?\.stop\(\)/);

    const reading = read('EnglishReadingApp.js');
    const enter = reading.slice(reading.indexOf('function enterQuiz('), reading.indexOf('function quizPassage('));
    assert.match(enter, /QuizIntegrity\?\.start\(\{ subject: SUBJECT, kind: 'translator', continueFrom: session\.integrity \|\| null \}\)/);
    const finish = reading.slice(reading.indexOf('function finishRound('), reading.indexOf('function showResults('));
    assert.ok(finish.indexOf('session.integrity = quizIntegrity.stop()') < finish.indexOf('saveReport()'));
    assert.match(reading.slice(reading.indexOf('function saveReport('), reading.indexOf('function updateDifficultyAfterSession(')), /integrity: session\.integrity/);
    assert.match(reading.slice(reading.indexOf('function renderStudy('), reading.indexOf('function chooseAssessmentPassage(')), /quizIntegrity\?\.stop\(\)/);
    assert.match(reading, /function saveSession\(\) \{[^\n]*session\.integrity = quizIntegrity\.summary\(\)/);
});

test('saveQuizResult는 metadata.integrity를 보존하고 재도전 저장에서 갱신', () => {
    const reports = [];
    const repository = { getActiveUser: () => '우준', listReports: () => structuredClone(reports), saveReports: (_, rows) => { reports.splice(0, reports.length, ...structuredClone(rows)); },
        getUser: () => null, saveUser() {}, getWrongAnswers: () => ({}), saveWrongAnswers() {}, getDeviceId: () => 'device', getPreference: (_, d) => d, setPreference() {} };
    const context = { console, Date, Math, JSON, structuredClone, setInterval: () => 1, clearInterval() {}, setTimeout, clearTimeout,
        document: { visibilityState: 'visible', hasFocus: () => true, addEventListener() {}, removeEventListener() {} } };
    context.window = Object.assign(context, { SmartStudy: { LocalRepository: repository }, addEventListener() {}, removeEventListener() {}, matchMedia: () => ({ matches: false }) });
    vm.runInNewContext(`${read('report.js')}\nthis.save = saveQuizResult;`, context);
    const integrity = { v: 1, kind: 'translator', leaves: 1, awaySeconds: 9, longestAwaySeconds: 9, translationDetected: false, translationSignal: null, events: [{ type: 'leave', at: 1, seconds: 9 }] };
    context.save('s1', 'english', '레벨 1', 2, 1, 1, 30, false, { category: 'english', integrity, attempts: [] });
    assert.deepEqual(reports[0].metadata.integrity, integrity);
    context.save('s1', 'english', '레벨 1', 2, 2, 1, 40, true, { category: 'english', integrity: { ...integrity, leaves: 2 }, attempts: [] });
    assert.equal(reports.length, 1); assert.equal(reports[0].metadata.integrity.leaves, 2);
});

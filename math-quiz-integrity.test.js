// Math quizzes record leaving the app (a calculator proxy) only while solving and save it with every result.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class FakeElement {
    constructor(tag = 'div', id = '') {
        this.tagName = tag.toUpperCase(); this.id = id; this.children = []; this.style = {}; this.dataset = {};
        this.listeners = {}; this.innerHTML = ''; this.innerText = ''; this.textContent = ''; this.hidden = false;
        this.disabled = false; this.value = ''; this.className = ''; const classes = new Set();
        this.classList = { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c),
            toggle: (c, on) => { if (on ?? !classes.has(c)) classes.add(c); else classes.delete(c); } };
    }
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
    fire(type) { (this.listeners[type] || []).forEach(fn => fn({ target: this })); }
    appendChild(child) { this.children.push(child); return child; }
    append(...nodes) { this.children.push(...nodes); }
    prepend(child) { this.children.unshift(child); }
    after() {}
    replaceChildren(...nodes) { this.children = nodes; }
    setAttribute() {}
    scrollIntoView() {}
    focus() {}
}

function fakeDocument() {
    const byId = new Map();
    const docListeners = {};
    const queried = {};
    const document = {
        getElementById: id => { if (!byId.has(id)) byId.set(id, new FakeElement('div', id)); return byId.get(id); },
        createElement: tag => new FakeElement(tag),
        querySelector: () => null,
        addEventListener: (type, fn) => { (docListeners[type] ||= []).push(fn); },
        listeners: docListeners,
        queried,
        // Supports the attribute selectors MathFormulaApp binds after rendering markup with innerHTML.
        querySelectorAll(selector) {
            if (selector === '.option-btn') return document.getElementById('optionsGrid').children.filter(el => el.className === 'option-btn');
            const attr = /^\[data-([a-z-]+)\]$/.exec(selector)?.[1];
            if (!attr) return [];
            const html = document.getElementById('content').innerHTML;
            const elements = [...html.matchAll(/<(button|textarea)\b([^>]*)>/g)]
                .filter(([, , attrs]) => new RegExp(`\\bdata-${attr}="`).test(attrs))
                .map(([, tag, attrs]) => {
                    const el = new FakeElement(tag);
                    for (const [, name, value] of attrs.matchAll(/data-([a-z-]+)="([^"]*)"/g)) {
                        el.dataset[name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
                    }
                    return el;
                });
            queried[selector] = elements;
            return elements;
        }
    };
    return document;
}

function stubIntegrity() {
    const sessions = [];
    return {
        sessions,
        api: {
            start({ subject, kind }) {
                const session = { subject, kind, leaves: 0, awaySeconds: 0, stopped: false, stopCalls: 0, events: [],
                    leave(seconds) { if (!this.stopped) { this.leaves += 1; this.awaySeconds += seconds; this.events.push({ type: 'leave', seconds }); } },
                    summary() { return { v: 1, kind, leaves: this.leaves, awaySeconds: this.awaySeconds,
                        longestAwaySeconds: Math.max(0, ...this.events.map(e => e.seconds)), translationDetected: false,
                        translationSignal: null, events: this.events.map(e => ({ ...e })) }; },
                    stop() { this.stopCalls += 1; this.stopped = true; return this.summary(); } };
                sessions.push(session);
                return session;
            },
            current() { return sessions.find(s => !s.stopped) || null; }
        }
    };
}

const active = sessions => sessions.filter(s => !s.stopped);

// ---------- math_quiz.html (unit quiz + wrong-note review mode) ----------
const quizPage = fs.readFileSync('math_quiz.html', 'utf8');
const quizScript = [...quizPage.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1])
    .find(code => code.includes("addEventListener('DOMContentLoaded'"));
assert(quizScript, 'math_quiz.html inline quiz engine must be found');

async function runMathQuiz({ integrity, mode = '' } = {}) {
    const document = fakeDocument();
    const saves = [];
    const timers = [];
    const templates = [0, 1, 2].map(i => ({ question: `${i} + 1 = ?`, choices: [String(i + 1), 'x', 'y', 'z'], answer: 0, explanation: 'e', generator: `gen${i}` }));
    const context = {
        console, Date, Math, JSON, URLSearchParams, Set, Array, Number, String, Boolean, Promise,
        document, alert: () => {}, location: { search: `?level=elementary-6&semester=1&unit=u1&type=basic${mode}`, href: '' },
        setTimeout: fn => timers.push(fn),
        AppUI: { init() {} },
        MathData: { 'elementary-6': { units: [{ id: 'u1', title: '분수의 나눗셈' }] } },
        MathQuizData: { u1: { basic: templates } },
        MathSessionQuestions: { build: list => list.map(q => ({ ...q })) },
        Utils: { generateMathQuiz: q => ({ ...q }), shuffle: list => list, renderMath: text => String(text) },
        WrongNote: { getAll: () => ({ math: mode ? [{ isMastered: false, levelId: 'elementary-6', semesterId: '1', unitId: 'u1', type: 'gen0' }] : [] }), save() {} },
        UserSession: { addEXP: () => null },
        saveQuizResult: (...args) => saves.push(args)
    };
    context.window = context;
    context.location.search = context.location.search;
    if (integrity) context.QuizIntegrity = integrity.api;
    vm.createContext(context);
    vm.runInContext(quizScript, context);
    await Promise.all(document.listeners.DOMContentLoaded.map(fn => fn()));
    const flush = () => { while (timers.length) timers.shift()(); };
    const answer = choiceIndex => { document.getElementById('optionsGrid').children[choiceIndex].onclick(); flush(); };
    return { document, saves, answer, flush };
}

(async () => {
    {
        const integrity = stubIntegrity();
        const quiz = await runMathQuiz({ integrity });
        assert.equal(integrity.sessions.length, 1, 'session starts when the first math question appears');
        assert.equal(integrity.sessions[0].subject, 'math');
        assert.equal(integrity.sessions[0].kind, 'calculator');
        integrity.sessions[0].leave(30);
        quiz.answer(0); // correct
        assert.equal(integrity.sessions.length, 1, 'next questions keep the same solving session');
        quiz.answer(1); // wrong
        integrity.sessions[0].leave(12);
        quiz.answer(1); // wrong → result
        assert.equal(active(integrity.sessions).length, 0, 'session stops when the result shows');
        assert.equal(quiz.saves.length, 1);
        const first = quiz.saves[0][8].integrity;
        assert.deepEqual({ leaves: first.leaves, awaySeconds: first.awaySeconds, longest: first.longestAwaySeconds, kind: first.kind },
            { leaves: 2, awaySeconds: 42, longest: 30, kind: 'calculator' });
        assert.equal(integrity.sessions[0].stopCalls, 1, 'the solving session is stopped once at the result');
    }

    // Retry wrong answers: a new solving stretch, saved under the same quiz session with the merged record.
    {
        const integrity = stubIntegrity();
        const quiz = await runMathQuiz({ integrity });
        const created = [];
        const create = quiz.document.createElement;
        quiz.document.createElement = tag => { const el = create(tag); created.push(el); return el; };
        integrity.sessions[0].leave(5);
        quiz.answer(1); quiz.answer(0); quiz.answer(0);
        const retryButton = created.find(el => /다시 풀기/.test(el.textContent || ''));
        assert(retryButton, 'wrong answers offer a retry');
        retryButton.onclick();
        assert.equal(integrity.sessions.length, 2, 'retry starts a new solving stretch');
        assert.equal(active(integrity.sessions).length, 1);
        integrity.sessions[1].leave(20);
        quiz.answer(0);
        assert.equal(active(integrity.sessions).length, 0, 'retry result stops recording');
        assert.equal(quiz.saves.length, 2);
        assert.equal(quiz.saves[1][0], quiz.saves[0][0], 'retry saves the same quiz session');
        const merged = quiz.saves[1][8].integrity;
        assert.equal(merged.leaves, 2, 'retry save carries leaves from every round');
        assert.equal(merged.awaySeconds, 25);
        assert.equal(merged.longestAwaySeconds, 20);
        assert.equal(merged.events.length, 2);
        assert.equal(quiz.saves[0][8].integrity.leaves, 1, 'first save carried the first round');
    }

    // Wrong-note review mode is a math quiz too.
    {
        const integrity = stubIntegrity();
        const quiz = await runMathQuiz({ integrity, mode: '&mode=review' });
        assert.equal(integrity.sessions.length, 1, 'review quiz starts recording');
        const total = quiz.saves.length;
        for (let i = 0; i < 5 && !quiz.saves.length; i++) quiz.answer(0);
        assert(quiz.saves.length > total);
        assert.equal(quiz.saves.at(-1)[8].review, true);
        assert.equal(quiz.saves.at(-1)[8].integrity.kind, 'calculator');
        assert.equal(active(integrity.sessions).length, 0);
    }

    // Without the module nothing breaks and no integrity field is written.
    {
        const quiz = await runMathQuiz();
        quiz.answer(0); quiz.answer(0); quiz.answer(0);
        assert.equal(quiz.saves.length, 1);
        assert(!('integrity' in quiz.saves[0][8]));
    }

    // ---------- math_formula.html (formula review quiz, written answers) ----------
    const appSource = fs.readFileSync('MathFormulaApp.js', 'utf8');
    function runFormula({ integrity, search }) {
        const document = fakeDocument();
        const saves = [];
        const context = { console, Math, Date, JSON, Set, Array, Number, String, Boolean, URLSearchParams, document,
            location: { search }, history: { replaceState() {} }, requestAnimationFrame: fn => fn(), scrollTo() {},
            saveQuizResult: (...args) => saves.push(args), crypto: { randomUUID: () => 'uuid' } };
        context.window = context;
        context.addEventListener = () => {};
        vm.createContext(context);
        for (const file of ['MathFormulaData.js', 'MathFormulaDataExtra.js', 'MathFormulaDataVolume2.js', 'MathFormulaDataVolume3.js',
            'MathFormulaDataVolume4.js', 'quiz-registry.js', 'MathFormulaQuiz.js', 'MathFormulaQuizExtra.js', 'MathFormulaQuizVolume2.js',
            'MathFormulaQuizVolume3.js', 'MathFormulaQuizVolume4.js']) vm.runInContext(fs.readFileSync(file, 'utf8'), context);
        context.SmartStudy = { ...(context.SmartStudy || {}), StorageKeys: { formulaLevels: 'levels' },
            LocalRepository: { getActiveUser: () => null, listReports: () => [], getPreference: (_, fallback) => fallback, setPreference() {} } };
        vm.runInContext(fs.readFileSync('MathFormulaReview.js', 'utf8'), context);
        if (integrity) context.QuizIntegrity = integrity.api;
        vm.runInContext(appSource, context);
        vm.runInContext('MathFormulaApp.init()', context);
        const click = (selector, predicate) => {
            const el = (document.queried[selector] || []).find(predicate);
            assert(el, `missing ${selector}`);
            el.fire('click');
        };
        const questionCount = () => new Set((document.queried['[data-question]'] || []).map(el => el.dataset.question)).size;
        const answerAll = pickWrongFor => {
            const quiz = vm.runInContext('MATH_FORMULAS', context);
            assert(quiz);
            for (let qi = 0; qi < questionCount(); qi++) {
                const options = (document.queried['[data-question]'] || []).filter(el => el.dataset.question === String(qi));
                click('[data-question]', el => el === options[pickWrongFor === qi ? options.length - 1 : 0]);
            }
        };
        return { document, saves, context, click, answerAll, byId: id => document.getElementById(id) };
    }

    {
        const integrity = stubIntegrity();
        const app = runFormula({ integrity, search: '?formula=1&mode=study' });
        assert.equal(integrity.sessions.length, 0, 'no recording while studying a formula');
        app.byId('quizModeBtn').fire('click');
        assert.equal(integrity.sessions.length, 1, 'formula quiz starts recording when questions appear');
        assert.equal(integrity.sessions[0].kind, 'calculator');
        assert.equal(integrity.sessions[0].subject, 'math');
        integrity.sessions[0].leave(40);
        app.answerAll();
        assert.equal(integrity.sessions.length, 1, 'choosing answers keeps one solving session');
        app.byId('submitQuizBtn').fire('click');
        assert.equal(active(integrity.sessions).length, 0, 'grading stops recording');
        assert.equal(app.saves.length, 1);
        assert.equal(app.saves[0][8].integrity.leaves, 1);
        assert.equal(app.saves[0][8].integrity.awaySeconds, 40);

        // Changing an answer after grading resumes solving; the re-grade save of the same session merges both stretches.
        const firstSession = app.saves[0][0];
        const options = app.document.queried['[data-question]'].filter(el => el.dataset.question === '0');
        options.at(-1).fire('click');
        assert.equal(active(integrity.sessions).length, 1, 'editing graded answers resumes recording');
        integrity.sessions.at(-1).leave(10);
        app.byId('submitQuizBtn').fire('click');
        assert.equal(app.saves.length, 2);
        assert.equal(app.saves[1][0], firstSession);
        assert.equal(app.saves[1][8].integrity.leaves, 2);
        assert.equal(app.saves[1][8].integrity.awaySeconds, 50);
        assert.equal(app.saves[1][8].integrity.longestAwaySeconds, 40);

        // Leaving quiz mode stops an in-progress stretch; a new quiz is a fresh record.
        app.answerAll(0);
        assert.equal(active(integrity.sessions).length, 1);
        app.byId('studyModeBtn').fire('click');
        assert.equal(active(integrity.sessions).length, 0, 'switching to study mode stops recording');
        app.byId('quizModeBtn').fire('click');
        const fresh = integrity.sessions.at(-1);
        assert(!fresh.stopped);
        app.answerAll();
        app.byId('submitQuizBtn').fire('click');
        assert.notEqual(app.saves.at(-1)[0], firstSession);
        assert.equal(app.saves.at(-1)[8].integrity.leaves, 0, 'a new quiz session does not inherit older leaves');
    }

    {
        const app = runFormula({ search: '?formula=1&mode=quiz' });
        app.answerAll();
        app.byId('submitQuizBtn').fire('click');
        assert.equal(app.saves.length, 1, 'formula quiz still saves without the integrity module');
        assert(!('integrity' in app.saves[0][8]));
    }

    // Pages load the module right after the translation guard.
    for (const page of ['math_quiz.html', 'math_formula.html']) {
        const html = fs.readFileSync(page, 'utf8');
        assert.match(html, /learning-translation-guard\.js[^\n]*<\/script>\r?\n\s*<script src="quiz-integrity\.js\?v=20261104-quiz-integrity" defer><\/script>/, `${page} loads quiz-integrity.js after the guard`);
    }

    console.log('Math quiz integrity: leaving the app is recorded only while solving and saved with every math quiz result.');
})().catch(error => { console.error(error); process.exit(1); });

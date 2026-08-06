const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

let now = 1_000_000;
let intervalCallback = null;
let focused = true;
const windowListeners = {};
const documentListeners = {};
const storage = new Map();

class FakeDate extends Date {
    static now() { return now; }
}

const repository = {
    getActiveUser: () => '우준',
    setActiveUser() {}, clearActiveUser() {},
    getUser: () => null, saveUser() {},
    listReports: () => [], saveReports() {},
    getWrongAnswers: () => ({}), saveWrongAnswers() {}
};
const sandbox = {
    console,
    Date: FakeDate,
    setInterval(callback) { intervalCallback = callback; return 1; },
    clearInterval() {},
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    window: {
        SmartStudy: { LocalRepository: repository },
        matchMedia: () => ({ matches: false }),
        addEventListener(event, callback) { windowListeners[event] = callback; },
        removeEventListener(event) { delete windowListeners[event]; }
    },
    document: {
        visibilityState: 'visible',
        hasFocus: () => focused,
        addEventListener(event, callback) { documentListeners[event] = callback; },
        removeEventListener(event) { delete documentListeners[event]; }
    }
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(`${fs.readFileSync('report.js', 'utf8')}\nthis.trackerApi = ActiveTimeTracker;`, sandbox);

const tracker = sandbox.trackerApi.create();
now += 1000;
intervalCallback();
assert.equal(tracker.getSeconds(), 1, 'Visible quiz activity must count');

sandbox.document.visibilityState = 'hidden';
now += 10_000;
intervalCallback();
assert.equal(tracker.getSeconds(), 1, 'Hidden-page time must not count');

sandbox.document.visibilityState = 'visible';
focused = false;
now += 10_000;
intervalCallback();
assert.equal(tracker.getSeconds(), 1, 'Unfocused desktop time must not count');

focused = true;
now += 46_000;
intervalCallback();
assert.equal(tracker.getSeconds(), 1, 'Idle time beyond 45 seconds must not count');

windowListeners.click();
now += 1000;
intervalCallback();
assert.equal(tracker.getSeconds(), 2, 'Activity must resume quiz timing');
tracker.destroy();

const reportSource = fs.readFileSync('report.js', 'utf8');
const timerSource = fs.readFileSync('study-timer.js', 'utf8');
const adminSource = fs.readFileSync('admin.html', 'utf8');
const shareSource = fs.readFileSync('kakao-share.js', 'utf8');
const sharedReportSource = fs.readFileSync('report.html', 'utf8');

assert.match(timerSource, /updateDailyStat\('study_time'/, 'Learning time must use the study bucket');
assert.match(reportSource, /updateDailyStat\('quiz_time'/, 'Quiz time must use the quiz bucket');
assert.doesNotMatch(reportSource, /subject === 'grammar'\s*\?\s*0/, 'Grammar quiz time must not be discarded');
assert.match(adminSource, /Math\.max\(subjectTime\.studyTime \|\| 0, reportQuizSeconds\)/, 'Admin subject totals must use the combined subject time');
assert.match(adminSource, /학습 \$\{formatStudySeconds\(learningSeconds\)\} \+ 퀴즈/, 'Admin must show the time formula');
assert.match(shareSource, /timeSpentSeconds: activeQuizSeconds/, 'Shared reports must include active quiz seconds');
assert.match(sharedReportSource, /r\.timeSpentSeconds \?\? wallElapsed/, 'Shared report view must prefer active time');

for (const file of ['main.js', 'hanja.js', 'EnglishGrammarApp.js', 'ReadingApp.js', 'math_quiz.html']) {
    const source = fs.readFileSync(file, 'utf8');
    assert.match(source, /ActiveTimeTracker\.create\(\)/, `${file} must start an active quiz timer`);
    assert.match(source, /getSeconds\(\)/, `${file} must save active quiz seconds`);
}

console.log('Active learning + quiz time accounting and idle exclusion verified.');

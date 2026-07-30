const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

let now = 1_000_000;
let intervalCallback = null;
let focused = true;
const listeners = {};
const bar = { innerHTML: '' };
const quizButton = {
    classList: { add() {}, remove() {} },
    addEventListener() {}
};

class FakeDate extends Date {
    static now() { return now; }
}

const sandbox = {
    console,
    Date: FakeDate,
    localStorage: {
        getItem() { return null; },
        setItem() {},
        removeItem() {}
    },
    setTimeout,
    clearTimeout,
    setInterval(callback) {
        intervalCallback = callback;
        return 1;
    },
    clearInterval() {},
    window: {
        addEventListener(event, callback) { listeners[event] = callback; }
    },
    document: {
        visibilityState: 'visible',
        hasFocus() { return focused; },
        getElementById(id) { return id === 'studyTimerBar' ? bar : null; },
        querySelector() { return null; },
        body: { appendChild() {} },
        createElement() { return { classList: { add() {}, remove() {} } }; }
    }
};

vm.createContext(sandbox);
for (const file of ['storage-keys.js', 'storage-events.js', 'schema-migrations.js', 'local-repository.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}
vm.runInContext(`${fs.readFileSync('study-timer.js', 'utf8')}\nthis.timer = StudyTimer;`, sandbox);

const controller = sandbox.timer.initBar('grammar', quizButton, {
    getContext: () => 'grammar:elementary',
    getAliases: () => [],
    getLabel: () => '영문법 Lv. 1',
    isLearningActive: () => true
});
controller.startTimer();

now += 1000;
intervalCallback();
assert.equal(controller.getActiveSeconds(), 1, 'Visible and active learning time must count');

sandbox.document.visibilityState = 'hidden';
now += 5000;
intervalCallback();
assert.equal(controller.getActiveSeconds(), 1, 'Hidden-page time must not count');

sandbox.document.visibilityState = 'visible';
focused = false;
now += 5000;
intervalCallback();
assert.equal(controller.getActiveSeconds(), 1, 'Unfocused time must not count');

focused = true;
now += 46_000;
intervalCallback();
assert.equal(controller.getActiveSeconds(), 1, 'Idle time after 45 seconds must not count');

listeners.click();
now += 1000;
intervalCallback();
assert.equal(controller.getActiveSeconds(), 2, 'Activity must resume counting');

controller.resetActiveSeconds();
assert.equal(controller.getActiveSeconds(), 0, 'A completed quiz must reset its active-time session');

const grammarApp = fs.readFileSync('EnglishGrammarApp.js', 'utf8');
assert(grammarApp.includes('activeStudySeconds'), 'Grammar reports must save active study time');
assert(!grammarApp.includes("initialScore, initialScore, 0, true"), 'Grammar reports must not hard-code zero seconds');

console.log('Grammar active-time reporting and idle exclusion verified.');

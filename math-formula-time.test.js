const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

let savedUser = {
    id: 'formula-time-test',
    dailyStats: { studyTime: { math: 120 }, subjectsStudied: ['math'] },
    missionProgress: { daily: { sample: { progress: 1, completed: false } } }
};
const originalDaily = JSON.stringify(savedUser.dailyStats);
const originalMissions = JSON.stringify(savedUser.missionProgress);

const context = {
    console,
    window: { addEventListener() {}, dispatchEvent() {} },
    CustomEvent: function(type, options) { this.type = type; this.detail = options?.detail; },
    document: {
        visibilityState: 'visible',
        hasFocus: () => true,
        getElementById: () => null,
        addEventListener() {}
    },
    Date,
    setInterval: () => 1,
    UserSession: {
        getUserData: () => JSON.parse(JSON.stringify(savedUser)),
        saveUserData: user => { savedUser = JSON.parse(JSON.stringify(user)); }
    },
    StudyPeriods: { daily: () => '2026-07-29' }
};
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(
    fs.readFileSync('MathFormulaTime.js', 'utf8')
        + '\nglobalThis.__MathFormulaTime = MathFormulaTime;',
    context
);

const tracker = context.__MathFormulaTime;
tracker.record('study', 12.8);
tracker.record('quiz', 5.7);
tracker.flush();

assert.strictEqual(savedUser.formulaStudyTime.date, '2026-07-29');
assert.strictEqual(savedUser.formulaStudyTime.studySeconds, 12);
assert.strictEqual(savedUser.formulaStudyTime.quizSeconds, 5);
assert.strictEqual(savedUser.formulaStudyTime.totalStudySeconds, 12);
assert.strictEqual(savedUser.formulaStudyTime.totalQuizSeconds, 5);
assert.strictEqual(JSON.stringify(savedUser.dailyStats), originalDaily, 'Normal subject time must not change');
assert.strictEqual(JSON.stringify(savedUser.missionProgress), originalMissions, 'Missions must not change');

tracker.record('quiz', 3.2);
tracker.flush();
assert.strictEqual(savedUser.formulaStudyTime.quizSeconds, 8);
assert.strictEqual(savedUser.formulaStudyTime.totalQuizSeconds, 8);
assert(!fs.readFileSync('MathFormulaTime.js', 'utf8').includes('document.hasFocus()'), 'Mobile formula timer must not depend on unreliable focus state');

const admin = fs.readFileSync('admin.html', 'utf8');
assert(admin.includes('buildFormulaTimePanel(ud)'), 'Admin dashboard must render formula study time panel');
assert(admin.includes('수학 공식 사전 학습 시간'), 'Admin dashboard formula time label is missing');
assert(admin.includes('totalStudySeconds') && admin.includes('totalQuizSeconds'), 'Admin dashboard must display cumulative formula time');

console.log('Math formula study and quiz time isolation verified.');

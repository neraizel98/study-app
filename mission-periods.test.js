const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const storage = new Map();
const localStorage = {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key)
};
const context = {
    console,
    localStorage,
    window: {},
    document: { getElementById: () => null },
    Date,
    Math,
    setTimeout,
    clearTimeout
};
context.window = context;
vm.createContext(context);
vm.runInContext(
    fs.readFileSync('report.js', 'utf8')
        + '\nglobalThis.__UserSession = UserSession; globalThis.__StudyPeriods = StudyPeriods;',
    context
);
vm.runInContext(
    fs.readFileSync('missions.js', 'utf8')
        + '\nglobalThis.__MissionManager = MissionManager;',
    context
);

const UserSession = context.__UserSession;
const StudyPeriods = context.__StudyPeriods;
const MissionManager = context.__MissionManager;

assert.strictEqual(StudyPeriods.daily(new Date(2026, 6, 29, 0, 0)), '2026-07-29');
assert.strictEqual(StudyPeriods.weekly(new Date(2026, 6, 27, 23, 59)), '2026-07-27');
assert.strictEqual(StudyPeriods.weekly(new Date(2026, 7, 2, 23, 59)), '2026-07-27');
assert.strictEqual(StudyPeriods.weekly(new Date(2026, 7, 3, 0, 0)), '2026-08-03');
assert.strictEqual(StudyPeriods.monthly(new Date(2026, 7, 31, 23, 59)), '2026-08-01');

UserSession.setActiveUser('period-test');
localStorage.setItem('SmartStudy_UserData_period-test', JSON.stringify({
    id: 'period-test',
    dailyStats: { date: '2020-01-01', studyTime: { english: 999 }, quizScores: { english: [100] }, subjectsStudied: ['english'] },
    weeklyStats: { weekStart: '2020-01-06', studyTime: 999, attendanceDays: 7, subjectsStudied: ['english'], quizCount: 99 },
    monthlyStats: { monthStart: '2020-01-01', studyTime: 999, attendanceDays: 20, subjectsStudied: ['english'], quizCount: 99 },
    missionProgress: {
        daily: { old: { completed: true } },
        weekly: { old: { completed: true } },
        monthly: { old: { completed: true } },
        periods: { daily: '2020-01-01', weekly: '2020-01-06', monthly: '2020-01-01' },
        rewards: { daily: null, weekly: null, monthly: null }
    }
}));

let user = UserSession.getUserData();
assert.deepStrictEqual(Object.keys(user.missionProgress.daily), []);
assert.deepStrictEqual(Object.keys(user.missionProgress.weekly), []);
assert.deepStrictEqual(Object.keys(user.missionProgress.monthly), []);
assert.strictEqual(user.dailyStats.studyTime.english, 0);
assert.strictEqual(user.weeklyStats.studyTime, 0);
assert.strictEqual(user.monthlyStats.studyTime, 0);

const subjects = MissionManager.registeredSubjects(user);
assert.deepStrictEqual(Array.from(subjects), ['reading', 'english', 'grammar', 'hanja', 'math']);
user.dailyStats.studyTime = Object.fromEntries(subjects.map(id => [id, 900]));
user.dailyStats.subjectsStudied = subjects.slice(0, 2);
user.dailyStats.quizScores = { reading: [80] };
user.weeklyStats = {
    weekStart: StudyPeriods.weekly(),
    studyTime: 10800,
    attendanceDays: 5,
    subjectsStudied: [...subjects],
    quizCount: 5
};
user.monthlyStats = {
    monthStart: StudyPeriods.monthly(),
    studyTime: 43200,
    attendanceDays: 20,
    subjectsStudied: [...subjects],
    quizCount: 20
};
UserSession.saveUserData(user);

MissionManager.checkMissions();
user = UserSession.getUserData();
for (const category of ['daily', 'weekly', 'monthly']) {
    assert(MissionManager.DEFINITIONS[category].every(m => user.missionProgress[category][m.id].completed));
    assert.strictEqual(user.missionProgress.rewards[category].period, StudyPeriods[category]());
}

const rewardsBefore = JSON.stringify(user.missionProgress.rewards);
MissionManager.checkMissions();
user = UserSession.getUserData();
assert.strictEqual(JSON.stringify(user.missionProgress.rewards), rewardsBefore, 'Each period must award exactly once');

console.log('Daily, weekly, and monthly mission periods verified.');

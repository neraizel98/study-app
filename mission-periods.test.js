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
    Date: class extends Date { constructor(...args) { super(...(args.length?args:[2026,8,27,21,0])); } static now(){return new Date(2026,8,27,21,0).getTime();} },
    Math,
    setTimeout,
    clearTimeout
};
context.window = context;
vm.createContext(context);
for (const file of ['storage-keys.js', 'storage-events.js', 'schema-migrations.js', 'local-repository.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}
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
assert.deepStrictEqual(Array.from(subjects), ['reading','english','english_reading','grammar','hanja','math']);
// Login alone, even with legacy attendance counters, must not earn new goals.
user.weeklyStats.attendanceDays=7;user.monthlyStats.attendanceDays=30;
UserSession.saveUserData(user);
MissionManager.checkMissions();
assert.equal(UserSession.getUserData().missionProgress.daily.d_checkin.completed,false);
assert.equal(UserSession.getUserData().missionProgress.weekly.w_attendance_5.progress,0);
const reports=[];
for(let date=1;date<=27;date++)for(const subject of MissionManager.areas){
    const at=new Date(2026,8,date,12).getTime();
    reports.push({subject:subject==='math_formula'?'math':subject,sessionId:`${subject}-${date}`,date:at,createdAt:at,totalQuestions:1,
      metadata:{unitId:'unit-1',source:subject==='math_formula'?'math-formula':undefined,submittedAt:at,initialAttempts:[{correct:false}]}});
}
const repo=context.SmartStudy.LocalRepository;
repo.saveReports('period-test',reports);
user=UserSession.getUserData();
user.dailyStats.studyTime={reading:600,english:600,math:600,hanja:300};
user.formulaStudyTime={date:StudyPeriods.daily(),studySeconds:300,quizSeconds:300};
UserSession.saveUserData(user);
assert.equal(MissionManager.progressOf(user,MissionManager.DEFINITIONS.daily[1]),2700,'Formula time counted once');
MissionManager.checkMissions();
user=UserSession.getUserData();
for(const category of ['daily','weekly','monthly']){
    assert(MissionManager.DEFINITIONS[category].every(m=>user.missionProgress[category][m.id].completed),category);
    assert.equal(user.missionProgress.rewards[category].period,StudyPeriods[category]());
}
const before=JSON.stringify({exp:user.exp,level:user.level,rewards:user.missionProgress.rewards});
MissionManager.checkMissions();user=UserSession.getUserData();
assert.equal(JSON.stringify({exp:user.exp,level:user.level,rewards:user.missionProgress.rewards}),before);
// Existing earned goals/rewards survive changing criteria, without another EXP grant.
user.missionProgress.daily.d_checkin={completed:true,progress:1};
user.missionProgress.rewards.daily={period:StudyPeriods.daily(),title:'기존 간식',awardedAt:1};
UserSession.saveUserData(user);MissionManager.checkMissions();
assert.equal(UserSession.getUserData().missionProgress.rewards.daily.title,'기존 간식');
assert.equal(UserSession.getUserData().exp,user.exp);
// Budget follows parent's saved setting.
repo.setPreference('SmartStudy_ParentPlanSettings_period-test',{budgetMinutes:60});
assert.equal(MissionManager.targetOf(MissionManager.DEFINITIONS.daily[1],user),3600);
// Incomplete/future/assessment/deleted reports do not count; repeated session IDs count once.
const first=reports[0];
repo.saveReports('period-test',[first,{...first,date:new Date(2026,8,2).getTime()},
 {...first,sessionId:'draft',metadata:{...first.metadata,status:'draft'}},
 {...first,sessionId:'assessment',metadata:{...first.metadata,assessment:true}},
 {...first,sessionId:'future',metadata:{...first.metadata,submittedAt:new Date(2026,9,1).getTime()}},
 {...first,sessionId:'partial',totalQuestions:2},
 {...first,sessionId:'deleted',deleted:true}]);
assert.equal(MissionManager.evidence(user).length,1);
assert.equal(MissionManager.progressOf(user,MissionManager.DEFINITIONS.monthly[3]),0);
// Same-day repeats do not count as spaced review. Next-day same scope does.
const second={...first,sessionId:'second',metadata:{...first.metadata}};
repo.saveReports('period-test',[first,second]);
assert.equal(MissionManager.progressOf(user,MissionManager.DEFINITIONS.monthly[3]),0);
second.metadata.submittedAt=new Date(2026,8,2,12).getTime();repo.saveReports('period-test',[first,second]);
assert.equal(MissionManager.progressOf(user,MissionManager.DEFINITIONS.monthly[3]),1);
console.log('Goal periods, evidence, parent budget, formula coverage, legacy rewards and repeat grants verified.');

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const store = new Map();
const sandbox = {
    console,
    Date,
    setInterval,
    clearInterval,
    localStorage: {
        getItem: key => store.has(key) ? store.get(key) : null,
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: key => store.delete(key)
    }
};
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const file of ['storage-keys.js', 'storage-events.js', 'schema-migrations.js', 'local-repository.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}
vm.runInContext(`${fs.readFileSync('study-timer.js', 'utf8')}\nthis.timer = StudyTimer;`, sandbox);

const timer = sandbox.timer;
// A daily task uses explicit parent minima, never adaptive penalties.
sandbox.SmartStudy.LearningBudgetPolicy={activeTask:()=>({minutes:4,context:{unitId:'level1'}})};
timer.setConfig({});
assert.equal(timer.getRequiredSeconds('english','level1'),120,'default leaves room for quiz in four-minute activity');
timer.setConfig({english:10});
assert.equal(timer.getRequiredSeconds('english','level1'),600,'explicit parent minimum preserved');
timer.setConfig({english:0});
assert.equal(timer.getRequiredSeconds('english','level1'),0,'explicit zero preserved');
delete sandbox.SmartStudy.LearningBudgetPolicy;
timer.setConfig({
    english: 5, grammar: 5, hanja: 5, math: 5, reading: 5,
    levels: {
        grammar: { elementary: 7, middle: 12 },
        math: { 'elementary-6': 6, 'middle-1': 14 },
        hanja: { level6: 9 }
    }
});

assert.equal(timer.getLevelKey('grammar', 'grammar:elementary'), 'elementary');
assert.equal(timer.getLevelKey('reading', 'reading:level1'), 'level1');
assert.equal(timer.getLevelKey('math', 'middle-1:semester1:u2'), 'middle-1');
assert.equal(timer.getBaseMinutes('grammar', 'grammar:elementary'), 7);
assert.equal(timer.getBaseMinutes('grammar', 'grammar:middle'), 12);
assert.equal(timer.getBaseMinutes('math', 'elementary-6:semester1:u1'), 6);
assert.equal(timer.getBaseMinutes('math', 'middle-1:semester2:u4'), 14);
assert.equal(timer.getBaseMinutes('hanja', 'level6'), 9);
assert.equal(timer.getBaseMinutes('english', 'level3'), 5, 'legacy subject value remains the fallback');

assert.equal(timer.getRequiredSeconds('grammar', 'grammar:elementary'), 7 * 60);
timer.recordResult('grammar', 'grammar:elementary', 8, 10, 'g1');
timer.recordResult('grammar', 'grammar:elementary', 7, 10, 'g2');
timer.recordResult('grammar', 'grammar:elementary', 6, 10, 'g3');
assert.equal(timer.getRequiredSeconds('grammar', 'grammar:elementary'), 10 * 60, 'recent average 70 applies 10 minutes');

timer.recordResult('grammar', 'grammar:middle', 8, 10, 'm1');
assert.equal(timer.getRequiredSeconds('grammar', 'grammar:middle'), 12 * 60, 'longer level baseline wins over 5-minute score rule');

timer.recordResult('math', 'middle-1:semester1:u1', 9, 10, 'math1');
assert.equal(timer.getRequiredSeconds('math', 'middle-1:semester1:u1'), 0, '90 or higher remains exempt');

console.log('Level-based study timer verified.');
// English reading shares one daily counter per grade, retaining old unit records.
sandbox.SmartStudy.LocalRepository.keys = () => [...store.keys()];
const day = new Date().toLocaleDateString('sv-SE');
const timerKey = context => sandbox.SmartStudy.StorageKeys.timerTime('guest',context,day);
store.set(timerKey('english_reading:english_reading:grade6:er1'),'60');
store.set(timerKey('english_reading:english_reading:grade6:er2'),'120');
store.set(timerKey('english_reading:grade6'),'30');
store.set(timerKey('english_reading:english_reading:middle1:er1'),'90');
assert.equal(timer.getAccumulated('english_reading','english_reading:grade6:er1'),210);
assert.equal(timer.getAccumulated('english_reading','english_reading:grade6:er4'),210);
assert.equal(timer.getAccumulated('english_reading','english_reading:grade6'),210,'repeated reads never duplicate legacy time');
assert.equal(timer.getAccumulated('english_reading','english_reading:middle1'),90,'grades remain isolated');
timer.recordResult('english_reading','english_reading:grade6',4,5,'reading-grade-test');
assert.equal(timer.getAccumulated('english_reading','english_reading:grade6'),210,'quiz completion retains daily grade time');
assert.equal(timer.LEVELS.english_reading.length,7);

assert.equal(timer.LEVELS.grammar.length,7);
sandbox.SmartStudy.LocalRepository.listReports=()=>[
 {subject:'grammar',level:'레벨 2',initialScore:10,totalQuestions:10,date:400,metadata:{stageId:'middle2'}},
 {subject:'grammar',level:'레벨 2',initialScore:2,totalQuestions:10,date:300,metadata:{stageId:'middle3'}},
 {subject:'grammar',level:'레벨 2',initialScore:10,totalQuestions:10,date:500,metadata:{stageId:'middle3',assessment:true,mockExam:true}},
 {subject:'english_reading',level:'레벨 3',initialScore:5,totalQuestions:5,date:100,metadata:{levelId:'high1'}}
];
assert.equal(timer.getRecentScores('grammar','grammar:middle3',['레벨 2'])[0].pct,20,'canonical grade metadata isolates shared visible levels and hidden mocks');
assert.equal(timer.getRecentScores('english_reading','english_reading:high2',['레벨 3']).length,0);

// The daily budget branch must not bypass the established mastery exemption.
sandbox.SmartStudy.LearningBudgetPolicy={activeTask:subject=>({minutes:7,context:{levelId:subject==='grammar'?'high3':'high3'}})};
const isolatedReports=[100,90,80].map((pct,index)=>({subject:'english_reading',sessionId:'daily-average-'+index,level:'고3',initialScore:pct,totalQuestions:100,date:1000+index,metadata:{levelId:'high3'}}));
sandbox.SmartStudy.LocalRepository.listReports=()=>isolatedReports;
timer.setConfig({english_reading:12});
assert.equal(timer.getStatus('english_reading','english_reading:high3').score,90,'canonical metadata works without presentation aliases');
assert.equal(timer.getRequiredSeconds('english_reading','english_reading:high3'),0,'daily recent-three average90 is exempt even with an explicit base');
assert.equal(timer.isUnlocked('english_reading','english_reading:high3'),true);
assert.equal(timer.getRequiredSeconds('english_reading','english_reading:high2'),720,'other grades cannot inherit exemption');
isolatedReports.push({subject:'english_reading',sessionId:'bad-score',level:'고3',initialScore:1000,totalQuestions:5,date:9000,metadata:{levelId:'high3'}});
assert.equal(timer.getStatus('english_reading','english_reading:high3').score,90,'out-of-range reports cannot corrupt the average');
isolatedReports.splice(0,3,...[80,80,80].map((pct,index)=>({subject:'english_reading',sessionId:'daily-average-'+index,level:'고3',initialScore:pct,totalQuestions:100,date:1000+index,metadata:{levelId:'high3'}})));
assert.equal(timer.getRequiredSeconds('english_reading','english_reading:high3'),720,'below90 explicit parent minimum still applies');
delete sandbox.SmartStudy.LearningBudgetPolicy;
timer.setConfig({english_reading:0});
assert.equal(timer.getRequiredSeconds('english_reading','english_reading:high3'),300,'free-study80% requires five minutes');
isolatedReports.splice(0,3,...[70,70,70].map((pct,index)=>({subject:'english_reading',sessionId:'daily-average-'+index,initialScore:pct,totalQuestions:100,date:1000+index,metadata:{levelId:'high3'}})));
assert.equal(timer.getRequiredSeconds('english_reading','english_reading:high3'),600,'free-study70% requires ten minutes');
isolatedReports.splice(0,3,...[60,60,60].map((pct,index)=>({subject:'english_reading',sessionId:'daily-average-'+index,initialScore:pct,totalQuestions:100,date:1000+index,metadata:{levelId:'high3'}})));
assert.equal(timer.getRequiredSeconds('english_reading','english_reading:high3'),900,'free-studybelow70% requires fifteen minutes');

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

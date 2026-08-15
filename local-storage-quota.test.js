const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function createStorage(limit) {
    const data = new Map();
    return {
        get length() { return data.size; },
        key(index) { return [...data.keys()][index] ?? null; },
        getItem(key) { return data.has(key) ? data.get(key) : null; },
        removeItem(key) { data.delete(key); },
        setItem(key, value) {
            const next = new Map(data);
            next.set(String(key), String(value));
            const size = [...next].reduce((sum, [k, v]) => sum + k.length + v.length, 0);
            if (size > limit) {
                const error = new Error('The quota has been exceeded.');
                error.name = 'QuotaExceededError';
                throw error;
            }
            data.clear();
            next.forEach((value, mapKey) => data.set(mapKey, value));
        }
    };
}

const localStorage = createStorage(700);
localStorage.setItem('SmartStudy_UserData_우준.backup.1', 'x'.repeat(500));
const context = { console, localStorage, crypto: { randomUUID: () => 'device-test' } };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const file of ['storage-keys.js', 'storage-events.js', 'schema-migrations.js', 'local-repository.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), context);
}

const repository = context.SmartStudy.LocalRepository;
assert.equal(localStorage.getItem('SmartStudy_UserData_우준.backup.1'), null, 'Abandoned migration backups must be removed');
assert.doesNotThrow(() => repository.setNumber('counter', 1));

// Fill the remaining quota and verify that a failed write is contained inside
// the repository instead of aborting answer handling and next-question logic.
localStorage.setItem('filler', 'y'.repeat(620));
assert.doesNotThrow(() => repository.setNumber('another-counter', 2));
assert.doesNotThrow(() => repository.saveReports('우준', [{
    sessionId: 's1', totalQuestions: 20, initialScore: 19, finalScore: 20,
    metadata: { attempts: [{ question: 'q'.repeat(500) }] }
}]));
assert.equal(repository.listReports('우준')[0].finalScore, 20,
    'Overflow reports must remain available for cloud synchronization');

console.log('Local storage quota recovery and non-blocking quiz writes verified.');

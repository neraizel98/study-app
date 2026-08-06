const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const subscriptions = {};
const context = {
    console,
    setTimeout,
    clearTimeout,
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    UserSession: { getActiveUser: () => '우준' },
    document: {
        addEventListener() {},
        getElementById() { return null; },
        createElement() { return { style: {} }; },
        body: { appendChild() {} }
    },
    window: {
        dispatchEvent() {},
        SmartStudy: {
            LocalRepository: {},
            FirestoreRepository: {},
            StorageEvents: { subscribe(event, handler) { subscriptions[event] = handler; } },
            FirebaseClient: {}
        }
    }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('firebase-sync.js', 'utf8'), context);

const merged = vm.runInContext(`_mergeUserData(
    { id:'우준', level:1, exp:0, totalStudyTime:0, totalAttempts:0, totalCorrect:0 },
    { id:'우준', level:25, exp:1226, totalStudyTime:131572, totalAttempts:589, totalCorrect:7454 },
    '우준'
)`, context);
assert.strictEqual(merged.level, 25);
assert.strictEqual(merged.exp, 1226);
assert.strictEqual(merged.totalStudyTime, 131572);
assert.strictEqual(merged.totalAttempts, 589);
assert.strictEqual(merged.totalCorrect, 7454);

const sameLevel = vm.runInContext(`_mergeUserData(
    { id:'우준', level:25, exp:10 },
    { id:'우준', level:25, exp:1226 },
    '우준'
)`, context);
assert.strictEqual(sameLevel.exp, 1226, 'Lower same-level EXP must never replace cloud progress');

const source = fs.readFileSync('firebase-sync.js', 'utf8');
assert(source.includes('_syncingUsers.has(userId)'), 'Default local records must not upload during cloud merge');
assert(source.includes('if (_loginPromises[userId]) return _loginPromises[userId]'), 'Concurrent login sync must be deduplicated');
assert(source.includes('if (db && activeUser) await this.onLogin(activeUser)'), 'Account connection must immediately sync the active learner');

const index = fs.readFileSync('index.html', 'utf8');
assert(index.includes("window.addEventListener('firesynced'"), 'Dashboard must refresh after cloud synchronization');
assert(index.includes('if (activeUser && window.FireSync) await FireSync.onLogin(activeUser)'), 'Initial dashboard render must wait for restored cloud progress');

for (const file of fs.readdirSync('.').filter(name => name.endsWith('.html'))) {
    const html = fs.readFileSync(file, 'utf8');
    if (!html.includes('firebase-sync.js')) continue;
    assert(
        html.includes('firebase-sync.js?v=20260806-progress-resume'),
        `${file} must load the protected progress-sync build instead of a cached older build`
    );
}

console.log('Cloud progress is merged before rendering and lower progress cannot overwrite existing data.');

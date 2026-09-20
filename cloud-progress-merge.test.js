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
assert(source.includes('if (db && activeUser) this.onLogin(activeUser)'), 'Account connection must start syncing the active learner');

const index = fs.readFileSync('index.html', 'utf8');
assert(index.includes("window.addEventListener('firesynced'"), 'Dashboard must refresh after cloud synchronization');
assert(index.indexOf('updateUI();\n            if (activeUser && window.FireSync)') > 0, 'Initial dashboard must render before cloud synchronization');

for (const file of fs.readdirSync('.').filter(name => name.endsWith('.html'))) {
    const html = fs.readFileSync(file, 'utf8');
    if (!html.includes('firebase-sync.js')) continue;
    assert(
        html.includes('firebase-sync.js?v=20260920-syncstatus'),
        `${file} must load the protected progress-sync build instead of a cached older build`
    );
}

console.log('Cloud progress merges in the background and lower progress cannot overwrite existing data.');

(async () => {
    context.window.SmartStudy.LocalRepository.getActiveUser = () => '우준';
    const calls = await vm.runInContext(`(async () => {
        _syncReady = true;
        let uploads = 0;
        _uploadReports = async () => {
            uploads++;
            if (uploads === 1) _queueUpload('우준', 'reports', 2000);
        };
        _syncingUsers.add('우준');
        _queueUpload('우준', 'reports', 2000);
        await _drainUpload('우준', 'reports');
        if (uploads !== 0) throw new Error('upload started during merge');
        _syncingUsers.delete('우준');
        await _drainUpload('우준', 'reports');
        clearTimeout(_timers['우준:reports']);
        return {uploads, generation: _dirty.get('우준:reports').generation, confirmed: _dirty.get('우준:reports').confirmed};
    })()`, context);
    assert.strictEqual(calls.uploads, 2, 'A save during an upload must trigger a second upload');
    assert.strictEqual(calls.confirmed, calls.generation, 'Only the latest uploaded generation may be confirmed');
    console.log('Changes during merge and upload are retained for a later upload.');
})().catch(error => { console.error(error); process.exitCode = 1; });

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function element(tag = 'div') {
    return {
        tagName: tag.toUpperCase(), style: {}, children: [], hidden: false, textContent: '', listeners: {},
        appendChild(child) { this.children.push(child); return child; },
        replaceChildren(...children) { this.children = children; },
        addEventListener(type, handler) { this.listeners[type] = handler; },
        setAttribute() {}
    };
}
const nodes = new Map();
const body = element('body');
body.appendChild = child => { body.children.push(child); if (child.id) nodes.set(child.id, child); return child; };
const listeners = {};
const local = { ready: Promise.resolve(), getActiveUser: () => 'learner' };
const context = {
    console, setTimeout, clearTimeout,
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    document: { body, createElement: element, getElementById: id => nodes.get(id) || null, addEventListener() {} },
    navigator: {}, UserSession: { getActiveUser: () => 'learner' },
    window: {
        navigator: { onLine: true },
        SmartStudy: { LocalRepository: local, FirestoreRepository: {}, StorageEvents: { subscribe() {} }, FirebaseClient: {} },
        addEventListener(type, handler) { listeners[type] = handler; }, dispatchEvent() {}
    }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('firebase-sync.js', 'utf8'), context);

assert.equal(vm.runInContext(`_classifySyncError(Object.assign(new Error('full'),{name:'QuotaExceededError'}),'local').code`, context), 'storage');
assert.equal(vm.runInContext(`_classifySyncError({code:'resource-exhausted'},'upload').code`, context), 'quota');

vm.runInContext(`
    first=_beginSyncRun('learner');
    _recordSyncStep('learner',first.runId,'download','reports-list','progress',{completed:100,total:null,pages:1,source:'cache'});
    second=_beginSyncRun('learner');
    _recordSyncStep('learner',first.runId,'download','reports-body','progress',{completed:1,total:100,source:'server'});
`, context);
assert.equal(vm.runInContext(`second.lanes.size`, context), 0, 'an old run cannot overwrite a newer run');

vm.runInContext(`
    _recordSyncStep('learner',second.runId,'download','reports-list','progress',{completed:100,total:null,pages:1,source:'cache'});
    _recordSyncStep('learner',second.runId,'download','reports-body','failed',{completed:3,total:100,error:{code:'permission-denied',message:'private learner@example.com'}});
`, context);
const panel = nodes.get('_firesync_panel');
function allText(node) { return [node.textContent, ...node.children.flatMap(child => allText(child))].join(' '); }
const text = allText(panel);
assert.match(text, /전체 수 확인 중/);
assert.match(text, /기기 캐시/);
assert.doesNotMatch(text, /서버 응답/, 'cache completion must not claim a server response');
assert.doesNotMatch(text, /learner@example\.com/, 'raw error messages and personal data stay out of diagnostics');
const copyButton = panel._syncNodes.copy;
vm.runInContext(`_renderSyncStatus(second)`, context);
assert.equal(panel._syncNodes.copy, copyButton, 'periodic rendering keeps the copy control stable for touch and keyboard use');

vm.runInContext(`_finishSyncRun(second,'completed')`, context);
assert.equal(vm.runInContext(`second.state`, context), 'completed');
const terminalSnapshot = vm.runInContext(`JSON.stringify([...second.lanes.entries()])`, context);
vm.runInContext(`_recordSyncStep('learner',second.runId,'download','wrong-list','waiting',{completed:0,total:null})`, context);
assert.equal(vm.runInContext(`JSON.stringify([...second.lanes.entries()])`, context), terminalSnapshot, 'late events cannot overwrite a terminal run');
assert.equal(vm.runInContext(`second._ticker`, context), null, 'terminal runs release their render ticker');
assert.equal(vm.runInContext(`_watchdogs.has('learner')`, context), false, 'terminal runs release their watchdog');
clearTimeout(nodes.get('_firesync_badge')._hideTimer);
vm.runInContext(`for(const timer of _watchdogs.values())clearTimeout(timer);_watchdogs.clear()`, context);

(async () => {
    const drain = await vm.runInContext(`(async()=>{
        _syncReady=true;_initialSucceeded.add('learner');
        const ok=_beginSyncRun('learner');_uploadReports=async()=>{};
        _queueUpload('learner','reports',2000);clearTimeout(_timers['learner:reports']);_timers['learner:reports']=null;
        await _drainUpload('learner','reports');
        const okState=ok.state;
        const failed=_beginSyncRun('learner');
        _recordSyncStep('learner',failed.runId,'upload','reports','waiting',{completed:0,total:1});
        _uploadReports=async()=>{throw Object.assign(new Error('service down'),{code:'unavailable'});};
        _queueUpload('learner','reports',2000);clearTimeout(_timers['learner:reports']);_timers['learner:reports']=null;
        await _drainUpload('learner','reports');
        const failure=[...failed.lanes.values()].find(step=>step.operation==='reports');
        clearTimeout(_timers['learner:reports']);_timers['learner:reports']=null;
        for(const timer of _watchdogs.values())clearTimeout(timer);_watchdogs.clear();
        return {okState,failureStatus:failure.status,failureCode:failure.error.code,runState:failed.state};
    })()`, context);
    assert.equal(drain.okState, 'completed', 'a pending post-merge upload closes the visible run');
    assert.equal(drain.failureStatus, 'failed');
    assert.equal(drain.failureCode, 'unavailable');
    assert.equal(drain.runState, 'failed', 'a failed pending upload terminates its visible run');
    console.log('Sync status: pending/progress/failure/final rendering, drain completion/failure, stale-run isolation, cache labeling and safe error classification verified.');
})().catch(error => { console.error(error); process.exitCode = 1; });

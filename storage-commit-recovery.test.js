const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {IDBFactory,IDBDatabase}=require('fake-indexeddb');
const original=IDBDatabase.prototype.transaction;
let failNext=false;
IDBDatabase.prototype.transaction=function(stores,mode,...rest){
    const tx=original.call(this,stores,mode,...rest);
    if(failNext&&mode==='readwrite'){failNext=false;tx.abort();}
    return tx;
};
async function open(indexedDB){
    const values=new Map(),events=[],handlers={};
    const c={console,indexedDB,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},
        localStorage:{get length(){return values.size;},key:i=>[...values.keys()][i],getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)},
        dispatchEvent:e=>events.push(e),addEventListener:(name,handler)=>handlers[name]=handler};
    c.window=c;vm.createContext(c);
    for(const f of ['storage-keys.js','storage-events.js','schema-migrations.js','durable-store.js','local-repository.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
    await c.SmartStudy.LocalRepository.ready;c.SmartStudy.testLeave=()=>{let prevented=false;handlers.beforeunload({preventDefault(){prevented=true;}});return prevented;};return c.SmartStudy;
}
(async()=>{
    const factory=new IDBFactory(),app=await open(factory),L=app.LocalRepository;
    const report=(n)=>({sessionId:'same',subject:'math',date:1,totalQuestions:1,initialScore:0,finalScore:n,metadata:{attempts:[{correct:false}]}});
    failNext=true;L.saveReports('child',[report(0)]);
    assert.equal(L.areReportsPersisted('child'),false,'optimistic report is not committed');
    assert.equal(app.testLeave(),true,'pending answer must warn on exit');
    await assert.rejects(L.flush());
    assert.equal(L.areReportsPersisted('child'),false);
    await L.retryPersistence();assert.equal(L.areReportsPersisted('child'),true);
    assert.equal((await open(factory)).LocalRepository.listReports('child')[0].finalScore,0,'retry survives restart');
    failNext=true;L.saveReports('child',[report(0),{...report(0),sessionId:'second'}]);
    L.saveReports('child',[report(1),{...report(0),sessionId:'second'}]);
    await L.flush();
    assert.equal((await open(factory)).LocalRepository.listReports('child')[0].finalScore,1,'new snapshot includes failed delta');
    failNext=true;L.saveReports('other',[report(0)]);await assert.rejects(L.flush());
    L.saveReports('child',[report(1)]);await assert.rejects(L.flush(),'unrelated commit cannot clear another key error');
    assert.equal(L.areReportsPersisted('child'),true);assert.equal(L.areReportsPersisted('other'),false);
    await L.retryPersistence();assert.equal(L.areReportsPersisted('other'),true);
    assert.equal((await open(factory)).LocalRepository.listReports('child').length,1,'deletion in latest desired snapshot persists');
    const metaPromise=app.DurableStore.setMeta('clock:child',{seconds:2});await Promise.resolve();assert.equal(app.testLeave(),false,'ordinary pending clock metadata must not block next activity');await metaPromise;
    console.log('Storage: failed write, identical retry, newer snapshot, restart, independent keys and deletion passed.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{IDBDatabase.prototype.transaction=original;});

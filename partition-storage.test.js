const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const {IDBFactory}=require('fake-indexeddb');

function storage(){const map=new Map();return {map,get length(){return map.size;},key:i=>[...map.keys()][i],getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};}
async function create(indexedDB,localStorage){
    const ctx={console,indexedDB,localStorage,crypto:webcrypto,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},dispatchEvent(){},addEventListener(){},TextEncoder,TextDecoder,Blob,Response,CompressionStream,DecompressionStream,btoa,atob,setTimeout,clearTimeout};
    ctx.window=ctx;vm.createContext(ctx);
    for(const file of ['storage-keys.js','storage-events.js','schema-migrations.js','durable-store.js','local-repository.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
    await ctx.SmartStudy.LocalRepository.ready;return ctx;
}
function mockFirestore(){
    const docs=new Map();let writes=0,reads=0,fail=false,tick=1000;
    const snapshot=(path)=>({id:path.split('/').at(-1),path,exists:docs.has(path),data:()=>docs.get(path)});
    function collection(path,filter=[],order=null,cursor=null,limit=Infinity){
        return {doc:id=>document(`${path}/${id}`),
            where:(field,op,value)=>collection(path,[...filter,[field,op,value]],order,cursor,limit),
            orderBy:(field,direction='asc')=>collection(path,filter,[field,direction],cursor,limit),
            startAfter:s=>collection(path,filter,order,s,limit),limit:n=>collection(path,filter,order,cursor,n),
            async get(){reads++;let rows=[...docs.keys()].filter(k=>k.startsWith(path+'/')&&k.split('/').length===path.split('/').length+1).map(snapshot);
                const val=v=>v?.toMillis?v.toMillis():v instanceof Date?v.getTime():v;
                rows=rows.filter(r=>filter.every(([f,op,v])=>op==='>='?val(r.data()[f])>=val(v):val(r.data()[f])<=val(v)));
                if(order)rows.sort((a,b)=>((val(a.data()[order[0]])-val(b.data()[order[0]]))||a.path.localeCompare(b.path))*(order[1]==='desc'?-1:1));
                if(cursor){const i=rows.findIndex(r=>r.path===cursor.path);if(i>=0)rows=rows.slice(i+1);}
                rows=rows.slice(0,limit);return {docs:rows,size:rows.length};}
        };
    }
    function document(path){return {path,collection:name=>collection(path+'/'+name),async get(){reads++;return snapshot(path);},async set(value,options){if(fail)throw new Error('offline');writes++;docs.set(path,options?.merge?{...docs.get(path),...value}:value);}};}
    const db={collection:name=>collection(name),async runTransaction(action){const ops=[];const result=await action({get:async ref=>ref.get(),set:(ref,value,options)=>ops.push([ref,value,options])});if(fail)throw new Error('offline');for(const [ref,value,options]of ops)await ref.set(value,options);return result;}};
    return {db,docs,get writes(){return writes;},get reads(){return reads;},set fail(value){fail=value;},timestamp:()=>{const n=++tick;return {toMillis:()=>n};}};
}

(async()=>{
    const local=storage(),idb=new IDBFactory();
    const reports=Array.from({length:1100},(_,i)=>({sessionId:`session-${i}`,subject:'english',date:i+1,initialScore:1,finalScore:2,totalQuestions:2,metadata:{attempts:[{question:'기록 보존 '.repeat(50)+i,correct:true}],initialAttempts:[{question:'first '+i,correct:false}]}}));
    const key='SmartVocab_Reports_test',original=JSON.stringify({schemaVersion:4,items:reports});local.setItem(key,original);
    local.setItem('SmartStudy_WrongAnswers_test',JSON.stringify({schemaVersion:3,subjects:{english:[{word:'keep',date:1,history:Array.from({length:200},(_,i)=>({eventId:String(i),date:i,status:'wrong'}))}]}}));
    const ctx=await create(idb,local),L=ctx.SmartStudy.LocalRepository,D=ctx.SmartStudy.DurableStore;
    assert.equal(L.listReports('test').length,1100);
    assert.equal(local.getItem(key),null,'large localStorage copy removed only after commit');
    assert.equal(L.getWrongAnswers('test').english[0].history.length,200,'no history trimming');
    // Archive exists in IndexedDB even though it is not part of the active cache.
    const db=await new Promise(resolve=>{const r=idb.open('SmartStudyRecords');r.onsuccess=()=>resolve(r.result);});
    const archived=await new Promise(resolve=>{const r=db.transaction('meta').objectStore('meta').get('archive:'+key);r.onsuccess=()=>resolve(r.result);});
    assert.equal(archived.value,original);
    L.saveReports('test',[...L.listReports('test'),{sessionId:'offline',subject:'math',date:2000,initialScore:0,finalScore:1,totalQuestions:1}]);await L.flush();
    const restarted=await create(idb,local);
    assert.equal(restarted.SmartStudy.LocalRepository.listReports('test').length,1101,'offline writes survive a new app context');
    assert.equal(restarted.SmartStudy.LocalRepository.listReports('test').find(r=>r.sessionId==='session-0').metadata.initialAttempts[0].correct,false);
    local.setItem(key,JSON.stringify({schemaVersion:4,items:[{sessionId:'old-tab',subject:'reading',date:3000}]}));
    const mixed=await create(idb,local);
    assert.equal(mixed.SmartStudy.LocalRepository.listReports('test').length,1102,'late writes from an older tab merge without replacing durable history');
    const beforeRemove=JSON.parse(L.rawGet('SmartStudy_WrongAnswers_test')).subjects.english[0];
    L.saveWrongAnswers('test',{english:[]});await L.flush();
    assert.equal(L.getWrongAnswers('test').english.length,0);
    const deleted=JSON.parse(L.rawGet('SmartStudy_WrongAnswers_test')).subjects.english[0];
    assert.equal(deleted.deleted,true);
    assert.deepEqual(deleted.history,beforeRemove.history,'hiding a wrong answer retains its original evidence');

    const remote=mockFirestore();ctx.firebase={firestore:{FieldValue:{serverTimestamp:remote.timestamp}}};
    ctx.SmartStudy.FirestoreRepository={getDB:async()=>remote.db,getUserBundle:async()=>({user:{id:'test'},reports:[],wrongAnswers:{}})};
    vm.runInContext(fs.readFileSync('partition-repository.js','utf8'),ctx);
    const R=ctx.SmartStudy.FirestoreRepository;
    const subset=reports.slice(0,25);
    await R.putReports('test',subset);
    assert.equal([...remote.docs.keys()].filter(k=>k.includes('/quizRecords/')).length,25);
    const writes=remote.writes,reads=remote.reads;
    await R.putReports('test',subset);
    assert.equal(remote.writes,writes,'unchanged records perform no writes');
    assert.equal(remote.reads,reads,'unchanged records perform no remote reads');
    const changed=structuredClone(subset);changed[0].finalScore=1;
    await R.putReports('test',changed);
    assert.equal(remote.writes-writes,2,'one changed result writes only its body and summary');
    const page=await R.getReportsPage('test');assert.equal(page.reports.length,20);
    assert.equal(page.reports[0].metadata.attempts,undefined,'summaries exclude full answers');
    const detail=await R.getReportDetail('test',page.reports[0]);assert.equal(detail.metadata.attempts.length,1);
    const older=await R.getReportsPage('test',{before:page.cursor});assert.equal(older.reports.length,5);
    const bundle=await R.getUserBundle('test');assert.equal(bundle.reports.length,25);
    remote.fail=true;
    await assert.rejects(R.putReports('test',[{sessionId:'failed',date:3000,subject:'math'}]),/offline/);
    assert.equal([...remote.docs.keys()].filter(k=>k.includes('/quizRecords/')).length,25,'failed upload never acknowledges or publishes an incomplete record');
    remote.fail=false;await R.putReports('test',[{sessionId:'failed',date:3000,subject:'math'}]);
    assert.equal([...remote.docs.keys()].filter(k=>k.includes('/quizRecords/')).length,26);
    await R.putWrongAnswers('test',L.getWrongAnswers('test'));
    const packed=await ctx.SmartStudy.PartitionStorage.pack({text:'한글 원문 '.repeat(10000)});
    assert.equal((await ctx.SmartStudy.PartitionStorage.unpack(packed)).text.length,60000);
    assert.ok(packed.text.length<10000,'lossless compression reduces repeated content');
    for(const [path,value]of remote.docs)assert.ok(Buffer.byteLength(JSON.stringify(value))<500000,`oversized ${path}`);
    for(let i=0;i<20;i++)ctx.SmartStudy.DailyLedger.record('test','study_time','english',1);
    await D.flush();await R.putDaily('test');
    const day=[...remote.docs].find(([k])=>k.includes('/dailyRecords/'))[1];
    assert.equal(day.subjects.english.learningTime,20,'rapid time updates do not overwrite each other');
    const dailyWrites=remote.writes;await R.putDaily('test');assert.equal(remote.writes,dailyWrites);
    // Real backup can be validated locally without checking private learner data into git.
    if(process.env.SMARTSTUDY_BACKUP_PATH){
        const backup=JSON.parse(fs.readFileSync(process.env.SMARTSTUDY_BACKUP_PATH,'utf8')),store=storage();
        for(const [key,value]of Object.entries(backup))store.setItem(key,value);
        const migrated=await create(new IDBFactory(),store);
        for(const [key,value]of Object.entries(backup))if(key.startsWith('SmartVocab_Reports_')){
            const original=JSON.parse(value).items;const actual=JSON.parse(migrated.SmartStudy.DurableStore.read(key)).items;
            assert.deepEqual(JSON.parse(JSON.stringify(actual)),original,`full record preservation: ${key}`);
        }
        for(const [key,value]of Object.entries(backup))if(key.startsWith('SmartStudy_WrongAnswers_')){
            const original=JSON.parse(value).subjects;const actual=JSON.parse(migrated.SmartStudy.DurableStore.read(key)).subjects;
            assert.deepEqual(JSON.parse(JSON.stringify(actual)),original,`full wrong-answer preservation: ${key}`);
        }
        console.log('Private backup: every report, original answer and wrong-answer history preserved exactly.');
    }
    console.log('Partition storage: migration, durable restart, lossless bodies, delta writes, pagination, failed-upload retry and daily idempotency verified.');
})().catch(error=>{console.error(error);process.exitCode=1;});


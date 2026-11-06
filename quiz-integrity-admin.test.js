// Parent display and persistence of quiz screen-leave / translation records (report metadata.integrity).
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const {IDBFactory}=require('fake-indexeddb');

const read=file=>fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
const plain=value=>value===undefined?value:JSON.parse(JSON.stringify(value));
const same=(actual,expected,message)=>assert.deepEqual(plain(actual),plain(expected),message);
const englishIntegrity={v:1,kind:'translator',leaves:2,awaySeconds:70,longestAwaySeconds:50,translationDetected:false,translationSignal:null,
    events:[{type:'leave',at:1,seconds:20},{type:'leave',at:2,seconds:50}]};
const mathIntegrity={v:1,kind:'calculator',leaves:1,awaySeconds:40,longestAwaySeconds:40,translationDetected:false,translationSignal:null,events:[{type:'leave',at:3,seconds:40}]};
const clean={v:1,kind:'translator',leaves:0,awaySeconds:0,longestAwaySeconds:0,translationDetected:false,translationSignal:null,events:[]};
const translated={v:1,kind:'translator',leaves:0,awaySeconds:0,longestAwaySeconds:0,translationDetected:true,translationSignal:'html-lang',events:[{type:'translation',at:4}]};

// Minimal fake DOM: an element whose innerHTML is parsed only far enough to find classes and text.
function fakeElement(){
    return {innerHTML:'',
        querySelectorAll(selector){const cls=selector.replace(/^\./,'');return [...this.innerHTML.matchAll(/<(span|p)[^>]*class="([^"]*)"[^>]*>([^<]*)</g)]
            .filter(m=>m[2].split(/\s+/).includes(cls)).map(m=>({className:m[2],textContent:m[3],classList:{contains:c=>m[2].split(/\s+/).includes(c)}}));}};
}

(async()=>{
    // 1. Module: per-record text and warning state.
    const ctx={console};ctx.window=ctx;vm.createContext(ctx);
    vm.runInContext(read('quiz-integrity-admin.js'),ctx);
    const Q=ctx.SmartStudy.QuizIntegrityAdmin;
    const rec=(subject,integrity,extra={})=>({sessionId:`${subject}-${Math.random()}`,subject,level:'L',date:Date.now(),totalQuestions:10,initialScore:8,finalScore:10,
        metadata:{...(integrity?{integrity}:{}),...extra}});
    same({...Q.describe(rec('english',englishIntegrity))},{text:'화면 이탈 2회 · 1분 10초 · 번역 감지 없음',warning:true,kind:'translator'});
    assert.equal(Q.describe(rec('english',{...englishIntegrity,translationDetected:true})).text,'화면 이탈 2회 · 1분 10초 · 번역 감지됨');
    same({...Q.describe(rec('math',mathIntegrity))},{text:'화면 이탈 1회 · 40초 (계산기 사용 의심)',warning:true,kind:'calculator'});
    same({...Q.describe(rec('grammar',clean))},{text:'이탈 없음',warning:false,kind:'translator'});
    same({...Q.describe(rec('english_reading',translated))},{text:'번역 감지됨',warning:true,kind:'translator'});
    assert.equal(Q.describe(rec('math',{...mathIntegrity,leaves:0,awaySeconds:0})).text,'이탈 없음');
    assert.equal(Q.describe(rec('english',null)),null,'records saved before recording show nothing');
    assert.equal(Q.describe({subject:'english'}),null);
    assert.equal(Q.describe(rec('english',{v:1,kind:'other',leaves:3})),null,'unknown kinds are ignored');
    assert.equal(Q.chipHTML(rec('english',null)),'');
    assert.match(Q.chipHTML(rec('math',mathIntegrity)),/class="mock-integrity quiz-integrity is-warning"/);
    assert.match(Q.chipHTML(rec('english',clean)),/class="mock-integrity quiz-integrity is-empty">이탈 없음</);

    // 2. Admin quiz tab (inline admin.html functions) renders the chip per record.
    const admin=read('admin.html');
    const extract=name=>{const start=admin.indexOf(`    function ${name}(`);assert(start>0,name);
        const end=admin.indexOf('\n    }\n',start);return admin.slice(start,end+7);};
    assert(/<script src="quiz-integrity-admin\.js(\?v=[^"]+)?"><\/script>/.test(admin),'admin page loads the parent-only display');
    const actx={console,SmartStudy:ctx.SmartStudy,SUBJ_COLORS:{},SUBJ_ICONS:{},SUBJ_NAMES:{english:'영어 단어',math:'수학'},
        StudyPeriods:{dateKey:d=>d.toISOString().slice(0,10),weekly:()=>''},Date,Math,Number,Set,String};
    actx.window=actx;vm.createContext(actx);
    vm.runInContext([extract('buildQuizTab'),extract('_weekRange'),extract('_weeklyHTML')].join('\n')+'\nthis.buildQuizTab=buildQuizTab;this._weeklyHTML=_weeklyHTML;this._weekRange=_weekRange;',actx);
    const now=Date.now();
    const rows=[
        {...rec('english',englishIntegrity),date:now-1000},
        {...rec('math',mathIntegrity),date:now-2000},
        {...rec('grammar',clean),date:now-3000},
        {...rec('english',null),sessionId:'legacy',date:now-4000}
    ];
    const tab=fakeElement();tab.innerHTML=actx.buildQuizTab(rows,{});
    const chips=tab.querySelectorAll('.quiz-integrity');
    same(chips.map(c=>c.textContent),['화면 이탈 2회 · 1분 10초 · 번역 감지 없음','화면 이탈 1회 · 40초 (계산기 사용 의심)','이탈 없음'],
        'one chip per recorded quiz, none for old records');
    same(chips.map(c=>c.classList.contains('is-warning')),[true,true,false]);

    // 3. Weekly summary counts and the units where leaves/translation happened most.
    const {start,end}=actx._weekRange(0);
    const inWeek=start.getTime()+3600e3;
    const week=[
        {...rec('english',englishIntegrity,{unitTitle:'Unit 3'}),date:inWeek},
        {...rec('english',{...translated},{unitTitle:'Unit 3'}),date:inWeek},
        {...rec('english_reading',{...englishIntegrity,leaves:1},{unitTitle:'Reading 1'}),date:inWeek},
        {...rec('grammar',clean,{unitTitle:'Grammar 2'}),date:inWeek},
        {...rec('math',mathIntegrity),level:'분수의 나눗셈 - 계산',date:inWeek},
        {...rec('math',{...mathIntegrity,leaves:0}),level:'비와 비율',date:inWeek},
        {...rec('math',mathIntegrity),level:'지난주 단원',date:start.getTime()-1000},
        {...rec('english',null),date:inWeek}
    ];
    const summary=Q.weeklySummary(week,start,end);
    assert.equal(summary.translator.recorded,4);
    assert.equal(summary.translator.withLeaves,2);
    assert.equal(summary.translator.translations,1);
    same(JSON.parse(JSON.stringify(summary.translator.units)),[{unit:'Unit 3',count:2},{unit:'Reading 1',count:1}]);
    assert.equal(summary.calculator.recorded,2);
    assert.equal(summary.calculator.withLeaves,1,'last week is excluded');
    same(JSON.parse(JSON.stringify(summary.calculator.units)),[{unit:'분수의 나눗셈 - 계산',count:1}]);
    const weekly=fakeElement();weekly.innerHTML=actx._weeklyHTML(week,0,{});
    const lines=weekly.querySelectorAll('.quiz-integrity-week');
    assert.equal(lines.length,2);
    assert.match(lines[0].textContent,/^영어 · 기록된 퀴즈 4회 · 화면 이탈 있음 2회 · 번역 감지 1회 · 많이 생긴 단원: Unit 3\(2\), Reading 1\(1\)$/);
    assert.match(lines[1].textContent,/^수학 · 기록된 퀴즈 2회 · 화면 이탈 있음 1회 · 많이 생긴 단원: 분수의 나눗셈 - 계산\(1\)$/);
    assert(lines.every(line=>line.classList.contains('is-warning')));
    const quiet=Q.weeklyHTML([{...rec('grammar',clean),date:inWeek}],start,end);
    assert.match(quiet,/class="mock-integrity quiz-integrity-week" data-kind="translator">영어 · 기록된 퀴즈 1회 · 화면 이탈 있음 0회 · 번역 감지 0회</);
    assert.equal(Q.weeklyHTML([{...rec('english',null),date:inWeek}],start,end),'','no summary without recorded quizzes');
    assert(Q.weeklyHTML([{...rec('english',englishIntegrity,{unitTitle:'<b>x</b>'}),date:inWeek}],start,end).includes('&lt;b&gt;x&lt;/b&gt;'),'unit names are escaped');
    assert(read('theme.css').includes('.mock-integrity.quiz-integrity '),'chip reuses the mock-integrity warning colors');

    // 4. Learner screens never load the parent-only display.
    for(const file of fs.readdirSync('.').filter(f=>f.endsWith('.html')&&f!=='admin.html'))
        assert(!read(file).includes('quiz-integrity-admin'),`${file} must not show parent-only quiz integrity`);

    // 5. Persistence: local storage (including compaction of old records), migration and partition sync round-trip.
    const SM=require('./schema-migrations.js');
    const migrated=SM.migrate('reports',{schemaVersion:2,items:[{sessionId:'m',date:1,totalQuestions:2,metadata:{integrity:englishIntegrity}}]});
    same(migrated.items[0].metadata.integrity,englishIntegrity,'schema migration keeps the field');

    function storage(){const map=new Map();return {map,get length(){return map.size;},key:i=>[...map.keys()][i],getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};}
    async function device(indexedDB,localStorage){
        const c={console,indexedDB,localStorage,crypto:webcrypto,events:[],CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},dispatchEvent(event){this.events.push(event);},addEventListener(){},TextEncoder,TextDecoder,Blob,Response,CompressionStream,DecompressionStream,btoa,atob,setTimeout,clearTimeout};
        c.window=c;vm.createContext(c);
        for(const file of ['storage-keys.js','storage-events.js','schema-migrations.js','durable-store.js','local-repository.js'])vm.runInContext(read(file),c);
        await c.SmartStudy.LocalRepository.ready;return c;
    }
    function mockFirestore(){
        const docs=new Map();let tick=1000;
        const snapshot=path=>({id:path.split('/').at(-1),path,exists:docs.has(path),data:()=>docs.get(path),metadata:{fromCache:false}});
        function collection(path,filter=[],order=null,cursor=null,limit=Infinity){
            return {doc:id=>document(`${path}/${id}`),
                where:(f,op,v)=>collection(path,[...filter,[f,op,v]],order,cursor,limit),
                orderBy:(f,d='asc')=>collection(path,filter,[f,d],cursor,limit),
                startAfter:s=>collection(path,filter,order,s,limit),limit:n=>collection(path,filter,order,cursor,n),
                async get(){let rows=[...docs.keys()].filter(k=>k.startsWith(path+'/')&&k.split('/').length===path.split('/').length+1).map(snapshot);
                    const val=v=>v?.toMillis?v.toMillis():v instanceof Date?v.getTime():v;
                    rows=rows.filter(r=>filter.every(([f,op,v])=>op==='>='?val(r.data()[f])>=val(v):val(r.data()[f])<=val(v)));
                    if(order)rows.sort((a,b)=>((val(a.data()[order[0]])-val(b.data()[order[0]]))||a.path.localeCompare(b.path))*(order[1]==='desc'?-1:1));
                    if(cursor){const i=rows.findIndex(r=>r.path===cursor.path);if(i>=0)rows=rows.slice(i+1);}
                    rows=rows.slice(0,limit);return {docs:rows,size:rows.length,metadata:{fromCache:false}};}};
        }
        // Stored values pass through JSON, as Firestore keeps only plain data.
        function document(path){return {path,collection:name=>collection(path+'/'+name),async get(){return snapshot(path);},
            async set(value,options){const plain=JSON.parse(JSON.stringify(value,(k,v)=>v?.toMillis?{__ts:v.toMillis()}:v),(k,v)=>v?.__ts?{toMillis:()=>v.__ts}:v);
                docs.set(path,options?.merge?{...docs.get(path),...plain}:plain);}};}
        const db={collection:name=>collection(name),async runTransaction(action){const ops=[];const result=await action({get:async ref=>ref.get(),set:(ref,value,options)=>ops.push([ref,value,options])});for(const [ref,value,options]of ops)await ref.set(value,options);return result;}};
        return {db,docs,timestamp:()=>{const n=++tick;return {toMillis:()=>n};}};
    }
    const reports=[
        {sessionId:'eng-1',subject:'english',level:'Unit 3',date:10,totalQuestions:2,initialScore:1,finalScore:2,metadata:{attempts:[{question:'a',correct:true}],initialAttempts:[],integrity:englishIntegrity}},
        {sessionId:'math-1',subject:'math',level:'분수',date:11,totalQuestions:2,initialScore:1,finalScore:2,metadata:{attempts:[],initialAttempts:[],integrity:mathIntegrity}},
        ...Array.from({length:105},(_,i)=>({sessionId:`fill-${i}`,subject:'reading',date:100+i,totalQuestions:1,initialScore:1,finalScore:1,metadata:{attempts:[]}}))
    ];
    const local=storage(),idb=new IDBFactory();
    const a=await device(idb,local),L=a.SmartStudy.LocalRepository;
    L.saveReports('kid',reports);await L.flush();
    same(L.listReports('kid').find(r=>r.sessionId==='eng-1').metadata.integrity,englishIntegrity);
    const restarted=await device(idb,local);
    const kept=restarted.SmartStudy.LocalRepository.listReports('kid');
    same(kept.find(r=>r.sessionId==='eng-1').metadata.integrity,englishIntegrity,'local storage survives a restart');
    same(kept.find(r=>r.sessionId==='math-1').metadata.integrity,mathIntegrity);

    const remote=mockFirestore();a.firebase={firestore:{FieldValue:{serverTimestamp:remote.timestamp}}};
    a.SmartStudy.FirestoreRepository={getDB:async()=>remote.db,getUserBundle:async()=>({user:{id:'kid'},reports:[],wrongAnswers:{}})};
    vm.runInContext(read('partition-repository.js'),a);
    await a.SmartStudy.FirestoreRepository.putReports('kid',L.listReports('kid').slice(0,2));
    const page=await a.SmartStudy.FirestoreRepository.getReportsPage('kid');
    const summaryRow=page.reports.find(r=>r.sessionId==='eng-1');
    assert.equal(summaryRow.metadata.attempts,undefined,'summaries still drop answers');
    same(summaryRow.metadata.integrity,englishIntegrity,'parent dashboard summaries carry the integrity record');
    const b=await device(new IDBFactory(),storage());b.firebase=a.firebase;
    b.SmartStudy.FirestoreRepository={getDB:async()=>remote.db,getUserBundle:async()=>({user:{id:'kid'},reports:[],wrongAnswers:{}})};
    vm.runInContext(read('partition-repository.js'),b);
    const bundle=await b.SmartStudy.FirestoreRepository.getUserBundle('kid');
    same(bundle.reports.find(r=>r.sessionId==='math-1').metadata.integrity,mathIntegrity,'another device restores the record');
    b.SmartStudy.LocalRepository.saveReports('kid',bundle.reports);await b.SmartStudy.LocalRepository.flush();
    same(b.SmartStudy.LocalRepository.listReports('kid').find(r=>r.sessionId==='eng-1').metadata.integrity,englishIntegrity);

    // Cloud merge (firebase-sync.js _mergeReports): newer saves win, but a later save without the record keeps it.
    const sync=read('firebase-sync.js');
    const mergeSource=sync.slice(sync.indexOf('function _mergeReports('),sync.indexOf('function _mergeWrong('));
    const mctx={};vm.createContext(mctx);vm.runInContext(mergeSource+';this._mergeReports=_mergeReports;',mctx);
    const older={sessionId:'s',date:1,updatedAt:1,metadata:{integrity:englishIntegrity,initialAttempts:[]}};
    const newerWithout={sessionId:'s',date:1,updatedAt:2,metadata:{initialAttempts:[]}};
    const newerWith={sessionId:'s',date:1,updatedAt:3,metadata:{integrity:{...englishIntegrity,leaves:3},initialAttempts:[]}};
    assert.equal(mctx._mergeReports([newerWithout],[older])[0].metadata.integrity.leaves,2);
    assert.equal(mctx._mergeReports([newerWith],[older])[0].metadata.integrity.leaves,3);
    assert.equal(mctx._mergeReports([{...newerWithout}],[{...older,metadata:{initialAttempts:[]}}])[0].metadata.integrity,undefined,'old records stay without the field');

    // 6. Firestore rules: report and partition documents live under users/{userId}/** without field validation.
    const rules=read('firestore.rules');
    assert.match(rules,/match \/users\/\{userId\} \{\s*allow get, create, update: if canUse\(userId\);\s*allow list, delete: if isAdmin\(\);\s*match \/\{document=\*\*\} \{ allow read, write: if canUse\(userId\); \}/,
        'quizRecords, recordBodies and data/reports accept any metadata for the learner and admin');

    console.log('Quiz integrity admin display, weekly summary and sync round-trip verified.');
})().catch(error=>{console.error(error);process.exit(1);});

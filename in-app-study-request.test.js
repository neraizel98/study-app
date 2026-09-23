const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const state={
  access:{role:'admin',learnerIds:['우준']},
  request:{learnerId:'우준',requestId:'request-current',requestedAt:{toMillis:()=>2000},requestedBy:'admin-uid',status:'pending'},
  activity:null
};
const writes=[];
const snap=value=>({exists:Boolean(value),data:()=>value});
const ref=path=>({path,async get(){if(path==='access/admin-uid')return snap(state.access);return snap(null);},async set(value,options){writes.push({kind:'direct-set',path,value,options});}});
const db={
  collection(name){return{doc(id){return ref(`${name}/${id}`);}};},
  async runTransaction(handler){
    const tx={
      async get(target){return target.path.startsWith('learnerActivity/')?snap(state.activity):snap(state.request);},
      set(target,value){writes.push({kind:'set',path:target.path,value});state.activity=value;},
      update(target,value){writes.push({kind:'update',path:target.path,value});state.request={...state.request,...value};}
    };
    return handler(tx);
  }
};
const context={window:null,console};context.window=context;
context.firebase={firestore:{FieldValue:{serverTimestamp:()=>({serverTime:true})},Timestamp:{fromMillis:value=>({clientMillis:value})}}};
context.SmartStudy={FirebaseClient:{getDB:async()=>db,getCurrentUser:async()=>({uid:'admin-uid'})}};
vm.createContext(context);vm.runInContext(fs.readFileSync('firestore-repository.js','utf8'),context);
const repository=context.SmartStudy.FirestoreRepository;

(async()=>{
  let result=await repository.recordActualStudyStart('우준',{activityId:'active-study-1000',source:'active-study',subject:'math',startedAt:1000});
  assert.equal(result.acknowledged,false,'activity older than the latest request must not acknowledge it');
  assert.equal(writes.filter(write=>write.kind==='update').length,0);
  assert.equal(writes.find(write=>write.kind==='set').value.occurredAt.clientMillis,1000,'actual event time must be retained when an offline event is retried');

  result=await repository.recordActualStudyStart('우준',{activityId:'active-study-3000',source:'active-study',subject:'math',startedAt:3000});
  assert.equal(result.acknowledged,true,'new actual activity must acknowledge the pending request');
  assert.equal(state.request.status,'started');
  assert.equal(writes.filter(write=>write.kind==='update').length,1,'the same request must transition only once');

  const before=writes.length;
  result=await repository.recordActualStudyStart('우준',{activityId:'active-study-3000',source:'active-study',subject:'math',startedAt:3000});
  assert.equal(result.duplicate,true);
  assert.equal(writes.length,before,'a retried stable activity id must not write twice');

  const rules=fs.readFileSync('firestore.rules','utf8');
  assert.match(rules,/match \/learnerStudyRequests\/\{userId\}/);
  assert.match(rules,/request\.time >= resource\.data\.requestedAt \+ duration\.value\(60, 's'\)/);
  assert.match(rules,/affectedKeys\(\)\.hasOnly\(\['status', 'startedAt', 'startedBy'\]\)/);
  assert.match(rules,/request\.resource\.data\.occurredAt <= request\.time \+ duration\.value\(5, 'm'\)/);
  assert.match(rules,/match \/learnerActivity\/\{userId\}/);
  const notification=fs.readFileSync('notification-client.js','utf8');
  assert(!notification.includes("subscribe('study:active-start'"),'legacy FCM study-start writes must not duplicate the free in-app activity path');
  const client=fs.readFileSync('in-app-study-request.js','utf8');
  assert(client.includes("root.addEventListener('online',retryPending)"));
  assert(client.includes("pending?.activityId===event.activityId"),'a successful retry may clear only the exact saved activity');
  const preferences=new Map(),clientResults=[{recorded:false},{recorded:true,acknowledged:true,requestId:'request-new'}];
  const clientContext={window:null,console,Date,setTimeout,clearTimeout};clientContext.window=clientContext;
  clientContext.document={visibilityState:'visible',addEventListener(){},getElementById(){return null;},querySelector(){return null;},body:{prepend(){}}};
  clientContext.addEventListener=()=>{};
  clientContext.SmartStudy={
    LocalRepository:{ready:Promise.resolve(),getActiveUser:()=> '우준',getPreference:(key,fallback)=>preferences.has(key)?preferences.get(key):fallback,setPreference:(key,value)=>preferences.set(key,value)},
    FirestoreRepository:{recordActualStudyStart:async()=>clientResults.shift(),watchStudyRequest:async()=>()=>{}},
    StorageEvents:{subscribe(){}}
  };
  vm.createContext(clientContext);vm.runInContext(client,clientContext);
  await clientContext.SmartStudy.InAppStudyRequest.recordActualStart({source:'active-study',startedAt:5000});
  const pendingKey=[...preferences.keys()].find(key=>key.startsWith('SmartStudy_PendingStudyActivity_'));
  assert(preferences.get(pendingKey),'an unauthenticated or failed server result must retain the latest activity for retry');
  await clientContext.SmartStudy.InAppStudyRequest.recordActualStart({source:'active-study',startedAt:5000,activityId:'active-study-5000'});
  assert.equal(preferences.get(pendingKey),null,'only a recorded exact activity may clear the retry slot');
  console.log('Free in-app request transaction, stale-event guard, retry idempotence, and strict rules verified.');
})().catch(error=>{console.error(error);process.exitCode=1;});

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

let activeUser='우준아빠',authUser={uid:'admin-uid'},access={role:'admin',learnerIds:['우준']};
const preferences=new Map();
const context={window:null,console,Date,setTimeout,clearTimeout};context.window=context;
context.document={addEventListener(){},querySelectorAll(){return[];},querySelector(){return null;},getElementById(){return null;},body:{appendChild(){},prepend(){}}};
context.navigator={};
context.SmartStudy={
  LocalRepository:{getActiveUser:()=>activeUser,getPreference:(key,fallback)=>preferences.has(key)?preferences.get(key):fallback,setPreference:(key,value)=>preferences.set(key,value)},
  FirebaseClient:{getCurrentUser:async()=>authUser},
  FirestoreRepository:{getAccess:async()=>access},
  StorageEvents:{subscribe(){}}
};
vm.createContext(context);vm.runInContext(fs.readFileSync('notification-client.js','utf8'),context);

(async()=>{
  const api=context.SmartStudy.NotificationClient;
  assert.equal((await api.resolveRole()).role,'guardian','admin access plus the parent profile exposes only the administrator role');
  activeUser='우준';
  assert.equal((await api.resolveRole()).role,'learner','the shared admin account on an authorized learner profile exposes only the learner role');
  authUser={uid:'learner-uid'};access={role:'learner',learnerIds:['우준']};
  assert.equal((await api.resolveRole()).role,'learner');
  await assert.rejects(()=>api.register('guardian'),/허용된 알림 역할과 다릅니다/,'direct calls must not bypass the resolved role');
  activeUser='다른학생';
  await assert.rejects(()=>api.resolveRole(),/권한을 확인/,'an unauthorized local profile cannot choose either role');
  authUser=null;
  await assert.rejects(()=>api.resolveRole(),/Google 계정을 연결/);

  const source=fs.readFileSync('notification-client.js','utf8');
  assert(!source.includes('오후 9시 학습 알림 받기'));
  assert(!source.includes('학습 시작·퀴즈 완료 보고 받기'));
  assert(source.includes('현재 서버 발송 미연결'));
  assert(source.includes("button.dataset.notificationRole=resolved.role"),'the modal must create exactly the resolved role action');
  console.log('Notification modal single-role authorization, direct-call guard, and honest delivery status verified.');
})().catch(error=>{console.error(error);process.exitCode=1;});

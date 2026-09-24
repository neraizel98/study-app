const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const listeners={},roleAction={replaceChildren(){},append(){}},nodes={
  '[data-role-status]':{},'[data-role-action]':roleAction,'[data-push-status]':{},
  '[data-notification-disable]':{},'[data-in-app-status]':{dataset:{}}
};
const modal={classList:{add(){},contains:()=>true},querySelector:selector=>nodes[selector]||null};
const document={
  body:{},addEventListener:(type,handler)=>{listeners[type]=handler;},querySelectorAll:()=>[],querySelector:()=>null,
  getElementById:id=>id==='notificationSetupModal'?modal:null,
  createElement:tag=>({tag,dataset:{},append(){},set type(_){} }),createTextNode:value=>({value})
};
let accessReads=0,active='우준';
const context={window:null,document,console,Date,setTimeout,clearTimeout,MutationObserver:class{observe(){} }};context.window=context;
context.addEventListener=()=>{};
context.SmartStudy={
  LocalRepository:{getActiveUser:()=>active,getPreference:(_key,fallback)=>fallback,setPreference(){}},
  FirebaseClient:{getCurrentUser:async()=>({uid:'admin-uid'})},
  FirestoreRepository:{getAccess:async()=>{accessReads++;return{role:'admin',learnerIds:['우준']};}},
  StorageEvents:{subscribe(){}},InAppStudyRequest:{getStatus:()=>({state:'on',message:'연결됨'})}
};
vm.createContext(context);vm.runInContext(fs.readFileSync('notification-client.js','utf8'),context);
listeners.DOMContentLoaded();
const click=button=>listeners.click({target:{closest:selector=>selector==='.notification-settings-btn'?button:null},preventDefault(){}});

(async()=>{
  click({id:'first'});await new Promise(resolve=>setTimeout(resolve,0));
  click({id:'replacement'});await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(accessReads,2,'the document-level handler must open settings for both the original and replacement header button');
  const source=fs.readFileSync('notification-client.js','utf8');
  assert(source.includes("document.addEventListener('click'"));
  assert(!source.includes("button.addEventListener('click', showSetup)"),'replacement buttons must not depend on direct listeners');
  assert(source.includes('new MutationObserver'),'replacement buttons must receive current status and accessibility text');
  console.log('Delegated notification click survives header replacement and refreshes button state.');
})().catch(error=>{console.error(error);process.exitCode=1;});

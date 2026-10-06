const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
(async()=>{
 const handlers={},nodes=[];let user='우준',intent={user,date:'2026-10-07',taskId:'a'},started;
 const plan={tasks:[{id:'a',subject:'reading',status:'in_progress',context:{title:'단원'}},{id:'b',subject:'hanja',status:'ready',context:{title:'8급'},targetUrl:'hanja.html?level=level8'}]};
 class Node {constructor(){this.children=[];this.style={};}append(x){this.children.push(x)}prepend(x){nodes.push(x)}replaceChildren(){this.children=[]}setAttribute(){}remove(){nodes.splice(nodes.indexOf(this),1)}}
 const root={console,queueMicrotask,document:{body:new Node(),createElement:()=>new Node()},sessionStorage:{getItem:()=>JSON.stringify(intent)},addEventListener:(k,f)=>handlers[k]=f};root.window=root;
 root.SmartStudy={LocalRepository:{ready:Promise.resolve(),getActiveUser:()=>user},LearningPlan:{today:()=> '2026-10-07',refreshEvidence:()=>plan,startTask:(u,id)=>started={u,id}},LearningProgress:{nextTask:tasks=>tasks.find(t=>t.status!=='completed'&&t.context)},StorageEvents:{subscribe:(k,f)=>handlers[k]=f}};
 vm.runInNewContext(fs.readFileSync('today-flow.js','utf8'),root);await new Promise(r=>setImmediate(r));
 assert(nodes[0].children[1].textContent.includes('끝까지'));
 plan.tasks[0].status='completed';handlers['reports:saved']();await new Promise(r=>setImmediate(r));
 const go=nodes[0].children[2];assert.equal(go.href,'hanja.html?level=level8');go.onclick();assert.deepEqual(started,{u:'우준',id:'b'});
 plan.tasks[1].context=null;handlers.focus();assert(nodes[0].children[1].textContent.includes('범위를 확인'));assert(!nodes[0].children[1].textContent.includes('모두 제출'));
 plan.tasks[1].status='completed';handlers.pageshow();assert(nodes[0].children[1].textContent.includes('모두 제출'));
 user='다른 사용자';handlers.focus();assert.equal(nodes.length,0);
 console.log('Today flow: submission transition, exact next URL, missing scope, completion and account isolation verified.');
})().catch(e=>{console.error(e);process.exitCode=1});

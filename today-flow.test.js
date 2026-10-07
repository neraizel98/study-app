const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
(async()=>{
 const handlers={},nodes=[];let user='우준',intent={user,date:'2026-10-07',taskId:'a'},started;
 const plan={tasks:[{id:'a',subject:'reading',status:'in_progress',context:{title:'단원'}},{id:'b',subject:'hanja',status:'ready',context:{title:'8급'},targetUrl:'hanja.html?level=level8'}]};
 class Node {constructor(){this.children=[];this.style={};this.text='';}get textContent(){return this.text+this.children.map(x=>x.textContent).join(' ');}set textContent(v){this.text=v;}append(...xs){this.children.push(...xs)}prepend(x){nodes.push(x)}querySelector(){return null;}replaceChildren(){this.children=[]}setAttribute(){}remove(){nodes.splice(nodes.indexOf(this),1)}}
 const host=new Node();const find=(node,match)=>match(node)?node:node.children.map(x=>find(x,match)).find(Boolean);
 const root={console,queueMicrotask,document:{body:{prepend(){throw Error('must mount inside content');}},querySelector:()=>host,createElement:()=>new Node()},sessionStorage:{getItem:()=>JSON.stringify(intent)},addEventListener:(k,f)=>handlers[k]=f};root.window=root;
 root.SmartStudy={LocalRepository:{ready:Promise.resolve(),getActiveUser:()=>user},LearningPlan:{today:()=> '2026-10-07',refreshEvidence:()=>plan,startTask:(u,id)=>started={u,id}},LearningProgress:{nextTask:tasks=>tasks.find(t=>t.status!=='completed'&&t.context)},StorageEvents:{subscribe:(k,f)=>handlers[k]=f}};
 vm.runInNewContext(fs.readFileSync('today-flow.js','utf8'),root);await new Promise(r=>setImmediate(r));
 assert(nodes[0].textContent.includes('끝까지'));
 plan.tasks[0].status='completed';handlers['reports:saved']();await new Promise(r=>setImmediate(r));
 const go=find(nodes[0],node=>node.className==='today-flow-primary');assert.equal(go.href,'hanja.html?level=level8');go.onclick();assert.deepEqual(started,{u:'우준',id:'b'});
 plan.tasks[1].context=null;handlers.focus();assert(nodes[0].textContent.includes('범위를 확인'));assert(!nodes[0].textContent.includes('모두 제출'));
 plan.tasks[1].status='completed';handlers.pageshow();assert(nodes[0].textContent.includes('모두 제출'));
 user='다른 사용자';handlers.focus();assert.equal(nodes.length,0);
 console.log('Today flow: submission transition, exact next URL, missing scope, completion and account isolation verified.');
})().catch(e=>{console.error(e);process.exitCode=1});

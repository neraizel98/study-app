const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),nodeCrypto=require('node:crypto');
const {setup,files}=require('./tests/helpers/mock-transfer-fixture.cjs');
// Minimal DOM, as in mock-integrity.test.js.
class El{
 constructor(tag='div',id=''){this.tagName=tag.toUpperCase();this.id=id;this.children=[];this.hidden=false;this.disabled=false;this.checked=false;this.open=false;this.textContent='';this.className='';this.title='';this.attributes={};this.style={setProperty(){}};this.isConnected=true;
  this.classList={add:name=>{if(!this.className.split(' ').includes(name))this.className=`${this.className} ${name}`.trim();},remove(){},toggle(){},contains:name=>this.className.split(' ').includes(name)};}
 get childNodes(){return this.children;}get value(){return this._value??this.children.find(c=>c.tagName==='OPTION')?.value??'';}set value(v){this._value=v;}
 append(...nodes){this.children.push(...nodes);}replaceChildren(...nodes){this.children=[...nodes];}setAttribute(k,v){this.attributes[k]=v;}querySelector(){return this._h2||=new El('h2');}focus(){}showModal(){this.open=true;}close(){this.open=false;}
}
const all=node=>[node,...(node.children||[]).flatMap(all)],textOf=node=>all(node).map(n=>n.textContent||'').join(' ');
const buttons=(node,label)=>all(node).filter(n=>n.tagName==='BUTTON'&&n.textContent===label);
const NOW=Date.parse('2026-10-25T10:00:00+09:00'),WEEK='2026-10-19';
// One shared fake Firestore: both devices read and write mockExamResults through firestore-repository.js.
function server(){
 const docs=new Map(),snap=id=>({id,exists:docs.has(id),data:()=>structuredClone(docs.get(id))}),ref=id=>({id,get:async()=>snap(id)});
 const query=filters=>({where:(field,op,value)=>query([...filters,[field,value]]),get:async()=>({docs:[...docs].filter(([,d])=>filters.every(([field,v])=>field.split('.').reduce((x,k)=>x?.[k],d)===v)).map(([id])=>snap(id))})});
 return {docs,db:{collection:()=>({doc:ref,where:(field,op,value)=>query([[field,value]])}),runTransaction:async fn=>fn({get:async r=>snap(r.id),update:(r,patch)=>docs.set(r.id,{...docs.get(r.id),...structuredClone(patch)}),set:(r,data)=>docs.set(r.id,structuredClone(data))})}};
}
// A device with the real exam bank and content. The parent's device has no local learner reports.
function device(role,cloud,clock,evidence){
 const prefs=new Map(),local=role==='learner'?structuredClone(evidence):[],raw=new Map(),opened=[];
 class FakeDate extends Date{constructor(...args){super(...(args.length?args:[clock.now]));}static now(){return clock.now;}}
 const c={console,Date:FakeDate,Set,Map,URLSearchParams,Math:Object.create(Math),setTimeout,clearTimeout,crypto:{randomUUID:()=>nodeCrypto.randomUUID()},
  open:(url,target)=>{opened.push([url,target]);return {};},confirm:()=>true,document:{createElement:tag=>new El(tag)}};c.window=c;
 c.SmartStudy={LocalRepository:{getActiveUser:()=>role==='learner'?'learner':'parent',listReports:()=>structuredClone(local),saveReports:(_,rows)=>local.splice(0,local.length,...structuredClone(rows)),flush:async()=>{},
  getPreference:(k,d)=>prefs.has(k)?structuredClone(prefs.get(k)):d,setPreference:(k,v)=>prefs.set(k,structuredClone(v)),keys:()=>[...prefs.keys()],rawSet:(k,v)=>raw.set(k,v),getWrongAnswers:()=>({}),getUser:()=>({})},
  FirebaseClient:{getDB:async()=>cloud.db,getCurrentUser:async()=>({uid:role})}};
 c.firebase={firestore:{FieldValue:{serverTimestamp:()=>clock.now}}};vm.createContext(c);
 for(const file of [...files,'weekly-schedule.js','firestore-repository.js','mock-paper-admin.js','mock-admin.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
 const R=c.SmartStudy.FirestoreRepository;R.getAccess=async uid=>({role:uid==='parent'?'admin':'learner'});R.getReportStorageMode=async()=>'legacy';R.getUserBundle=async()=>({reports:structuredClone(evidence)});
 R.getLearnerPlanSettings=async()=>({weekly:{learningDays:5,miniCheck:false,mockSectionMinutes:{reading:25,english:20,math:30,hanja:10}}});
 c._adminData={userId:'learner',ud:{id:'하늘'}};
 return {c,app:c.SmartStudy,api:c.SmartStudy.MockExam,raw,opened,local};
}
function world(){const s=setup(),clock={now:NOW},cloud=server(),evidence=JSON.parse(JSON.stringify(s.reports));return {clock,cloud,evidence,learner:device('learner',cloud,clock,evidence),parent:device('parent',cloud,clock,evidence)};}
// The learner's online round, as mock-exam-ui.js runs it: server history first, then a new bank.
async function online(w){
 const {app,api}=w.learner,remote=await app.MockPublication.list('learner',{week:WEEK});api.restore('learner',remote);
 const rounds=[...api.list('learner',WEEK),...remote.map(r=>r.payload)].sort((a,b)=>(Number(a.attemptNo)||1)-(Number(b.attemptNo)||1)),attemptNo=rounds.length?(Number(rounds.at(-1).attemptNo)||1)+1:1;
 const bank=app.MockExamBank.build('learner',w.clock.now,{attemptNo,history:remote});assert(api.validateBank(bank),JSON.stringify(bank.shortages));
 let d=api.create('learner',bank,w.clock.now,{retake:attemptNo>1,parentAttemptId:rounds.at(-1)?.assessmentId});
 for(let i=0;i<4;i++){const active=d.sections.find(s=>s.state==='active');d=api.finishSection('learner',d.assessmentId,w.clock.now+i+1,active.id);if(d.break&&!d.break.endedAt)d=api.skipBreak('learner',d.assessmentId,w.clock.now+i+1);}
 assert((await api.sync('learner',d.assessmentId)).synced);w.clock.now+=60000;return api.getById('learner',d.assessmentId);
}
const keys=questions=>new Set(questions.flatMap(q=>[q.id,q.fingerprint]));
const overlap=(a,b)=>[...keys(a)].filter(k=>keys(b).has(k));
async function paper(w,attemptNo){const result=await w.parent.app.MockPaperAdmin.generate('learner',{attemptNo,learnerName:'하늘'});w.clock.now+=60000;return result;}

test('paper rounds are generated in order on the parent device and never repeat earlier questions',async()=>{
 const w=world(),one=await online(w),admin=w.parent.app.MockPaperAdmin;
 await assert.rejects(()=>paper(w,3),/2회차 차례/);
 const two=await paper(w,2);assert(two.ok,JSON.stringify(two.bank?.shortages));
 assert.equal(two.payload.status,'paper');assert.equal(two.payload.mode,'paper');assert.equal(two.payload.attemptNo,2);assert.equal(two.payload.submittedAt,undefined);
 assert.match(two.payload.assessmentId,/^mock:learner:2026-10-19:attempt-2-paper-[A-Za-z0-9-]+$/);assert.equal(two.payload.parentAttemptId,one.assessmentId);
 // Print contract for mock-print.html.
 const set=two.set;assert.deepEqual(Object.keys(set).sort(),['attemptNo','generatedAt','items','learnerId','learnerName','schema','timeLimits','weekKey','weekLabel']);
 assert.deepEqual([set.schema,set.learnerId,set.learnerName,set.weekKey,set.weekLabel,set.attemptNo],[1,'learner','하늘',WEEK,'2026년 10월 3주차',2]);
 assert.deepEqual({...set.timeLimits},{reading:25,english:20,math:30,hanja:10});assert.equal(set.items.length,55);assert.deepEqual(set.items.map(q=>q.id),two.bank.items.map(q=>q.id));
 const three=await paper(w,3);assert(three.ok);
 assert.deepEqual(overlap(one.questions,two.payload.questions),[]);assert.deepEqual(overlap(one.questions,three.payload.questions),[]);assert.deepEqual(overlap(two.payload.questions,three.payload.questions),[]);
 const stored=[...w.cloud.docs.values()].filter(d=>d.payload.status==='paper');
 assert.equal(stored.length,2);assert(stored.every(d=>d.published===false&&d.createdBy==='parent'&&d.payload.questions.length===55&&!('initialAttempts' in d.payload)));
 assert.deepEqual(Array.from(admin.rounds([...w.cloud.docs.values()],WEEK),r=>r.state),['online','paper','paper']);
 await assert.rejects(()=>paper(w,4),/모두 사용/);
});
test('an existing online round or paper set is never overwritten',async()=>{
 const w=world(),pub=w.parent.app.MockPublication,first=await paper(w,1);assert(first.ok);
 const before=JSON.stringify([...w.cloud.docs]);
 await assert.rejects(()=>paper(w,1),/덮어쓰지/);
 await assert.rejects(()=>pub.savePaper('learner',{...first.payload,assessmentId:first.payload.assessmentId+'-copy'}),/덮어쓰지/);
 await assert.rejects(()=>pub.savePaper('learner',first.payload),/덮어쓰지/);
 await assert.rejects(()=>pub.savePaper('learner',{...first.payload,attemptNo:3,assessmentId:`mock:learner:${WEEK}:attempt-3-paper-x`}),/덮어쓰지/,'rounds stay sequential');
 await assert.rejects(()=>pub.publish('learner',first.payload.assessmentId),/공개할 수 없습니다/);
 assert.equal(JSON.stringify([...w.cloud.docs]),before);
 // Learner accounts cannot create paper rounds.
 await assert.rejects(()=>w.learner.app.MockPublication.savePaper('learner',{...first.payload,attemptNo:2}),/관리자/);
});
test('the online retake after a paper round takes the next round and excludes the paper questions',async()=>{
 const w=world(),first=await paper(w,1);assert(first.ok);
 const {api,app}=w.learner;api.restore('learner',await app.MockPublication.list('learner',{week:WEEK}));
 assert.equal(api.get('learner',WEEK),null,'a paper round is not an online exam');assert.equal(api.list('learner',WEEK)[0].status,'paper');
 assert.throws(()=>api.create('learner',app.MockExamBank.build('learner',w.clock.now,{attemptNo:1}),w.clock.now),/이전 응시 기록/);
 const two=await online(w);assert.equal(two.attemptNo,2);assert.equal(two.parentAttemptId,first.payload.assessmentId);
 assert.deepEqual(overlap(two.questions,first.payload.questions),[]);
 const three=await paper(w,3);assert(three.ok);assert.deepEqual(overlap(three.payload.questions,[...first.payload.questions,...two.questions]),[]);
 // The learner device restores round 3 and the week is used up.
 api.restore('learner',await app.MockPublication.list('learner',{week:WEEK}));
 assert.deepEqual(JSON.parse(JSON.stringify(api.list('learner',WEEK).map(d=>[d.attemptNo,d.status]))),[[1,'paper'],[2,'submitted'],[3,'paper']]);assert.equal(api.get('learner',WEEK).attemptNo,2);
 assert.throws(()=>api.create('learner',app.MockExamBank.build('learner',w.clock.now,{attemptNo:4}),w.clock.now,{retake:true}),/모두 사용/);
 // Paper rounds create no quiz reports, so score charts and trends never see them.
 assert(w.learner.local.filter(r=>r.metadata?.mockExam).every(r=>r.metadata.attemptNo===2));
});
test('admin list: rounds area, paper card without score or publication, reprint and sequential generation',async()=>{
 const w=world();await online(w);const two=await paper(w,2);assert(two.ok);
 const {app,raw,opened}=w.parent,host=new El('div');w.parent.c.document.createElement=tag=>new El(tag);
 await app.MockAdmin.render('learner',host);
 const text=textOf(host);
 assert.match(text,/시험지 출력/);assert.match(text,/2026-10-19 주 · 2회차 · 종이 시험 · 채점 전/);
 const states=all(host).filter(n=>n.className==='mock-paper-state').map(n=>n.textContent);assert.deepEqual(states,['온라인 응시함','종이 시험지 생성됨','비어 있음']);
 const cards=all(host).filter(n=>n.className.includes('mock-result-card'));assert.equal(cards.length,2);
 const paperCard=cards.find(n=>n.className.includes('is-paper'));
 assert.equal(buttons(paperCard,'학습자에게 공개').length,0);assert.equal(all(paperCard).some(n=>n.className.includes('mock-score-grid')||n.className.includes('mock-integrity')),false);
 assert.equal(buttons(host,'학습자에게 공개').length,1,'only the online round can be published');
 // Reprint from the list and from the rounds area writes the stored set for mock-print.html.
 buttons(paperCard,'출력하기')[0].onclick();
 assert.deepEqual(opened.at(-1),['mock-print.html','_blank']);const printed=JSON.parse(raw.get('SmartStudy_MockPaperPrint'));
 assert.equal(printed.attemptNo,2);assert.deepEqual(printed.items.map(q=>q.id),Array.from(two.payload.questions,q=>q.id));
 assert.equal(buttons(host,'출력하기').length,2);
 // Only the next free round can be made; making it re-renders with the new state.
 const make=buttons(host,'시험지 만들기');assert.equal(make.length,1);assert.equal(make[0].disabled,false);
 const count=opened.length;await make[0].onclick();
 assert.equal(opened.length,count,'making a round does not open a window; 출력하기 does (a window opened after the save is blocked as a popup)');
 assert.deepEqual(all(host).filter(n=>n.className==='mock-paper-state').map(n=>n.textContent),['온라인 응시함','종이 시험지 생성됨','종이 시험지 생성됨']);
 assert.match(textOf(host),/3회차 종이 시험지를 만들었습니다\. 출력하기를 눌러/);assert.equal(buttons(host,'시험지 만들기').length,0);
});
test('admin rounds: a later round waits, a declined confirmation saves nothing, and an incomplete bank is refused with reasons',async()=>{
 const w=world(),{app,c}=w.parent,host=new El('div');let notice=null;
 app.MockPaperAdmin.renderRounds('learner',host,{records:[],onChange:n=>{notice=n;}});
 const make=buttons(host,'시험지 만들기');assert.deepEqual(make.map(b=>b.disabled),[false,true,true]);assert.match(make[1].title,/순서대로/);
 c.confirm=()=>false;await make[0].onclick();assert.equal(w.cloud.docs.size,0);assert.equal(notice,null);
 c.confirm=()=>true;const build=app.MockExamBank.build;app.MockExamBank.build=(...args)=>{const bank=build(...args);bank.items=bank.items.filter(q=>q.subject!=='hanja');bank.complete=false;bank.shortages={hanja:{required:10,actual:0,missing:10}};return bank;};
 await make[0].onclick();
 assert.equal(w.cloud.docs.size,0);assert.equal(notice,null);assert.equal(w.parent.opened.length,0);
 assert.match(textOf(host),/온라인 시험도 시작할 수 없는 상태/);assert.match(textOf(host),/한자: 0\/10문항 · 10문항 부족/);assert.equal(make[0].disabled,false);
});

// mock-exam-ui.js on the learner's device with a server paper round (stub bank, as in mock-integrity.test.js).
const uiStart=Date.parse('2026-10-17T00:00:00Z'),UI_WEEK='2026-10-12';
function paperRow(attemptNo){const assessmentId=`mock:우준:${UI_WEEK}:attempt-${attemptNo}-paper-p${attemptNo}`;
 return {learnerId:'우준',assessmentId,published:false,payload:{schemaVersion:1,assessmentId,userId:'우준',scheduledWeekId:UI_WEEK,scheduledDate:'2026-10-16',kind:'mock',mode:'paper',status:'paper',attemptNo,generatedAt:uiStart-1000,startedAt:uiStart-1000,sections:[],
  questions:Array.from({length:55},(_,i)=>({id:`paper${attemptNo}:${i}`,subject:'reading',question:`종이 ${attemptNo}회 ${i}`,answer:'A',choices:['A','B']}))}};}
async function page(rows,search=''){
 const values=new Map(),elements=new Map(),reports=[];
 const local={ready:Promise.resolve(),getActiveUser:()=> '우준',getPreference:(k,d)=>values.has(k)?structuredClone(values.get(k)):d,setPreference:(k,v)=>values.set(k,structuredClone(v)),keys:()=>[...values.keys()],listReports:()=>structuredClone(reports),saveReports:(_,items)=>reports.splice(0,reports.length,...structuredClone(items)),flush:async()=>{}};
 const document={hidden:false,visibilityState:'visible',hasFocus:()=>true,getElementById:id=>{if(!elements.has(id))elements.set(id,new El(id==='examHistory'?'select':'div',id));return elements.get(id);},createElement:tag=>new El(tag),addEventListener(){}};
 class FakeDate extends Date{constructor(...args){super(...(args.length?args:[uiStart]));}static now(){return uiStart;}}
 const areas={reading:11,korean_vocab:4,english:4,grammar:4,english_reading:7,math:12,math_formula:3,hanja:10};
 const bank=()=>({complete:true,items:Object.entries(areas).flatMap(([subject,count])=>Array.from({length:count},(_,i)=>({id:`${subject}:${i}`,subject,question:`${subject} 문항 ${i}`,choices:['A','B','C'],answer:'A'})))});
 const builds=[],app={LocalRepository:local,MockPublication:{list:async()=>structuredClone(rows),submit:async()=>true,get:async()=>({published:false})},FirestoreRepository:{getLearnerPlanSettings:async()=>null},LearningPlan:{applyParentSettings(){},getSettings:()=>({})},
  MockExamBank:{build:(user,now,options)=>{builds.push(options);return bank();},grade:(q,r)=>({correct:q.answer===r,answer:q.answer})},MockExamResults:{setMathText:(el,v)=>{el.textContent=v;},load:async()=>({published:false}),render(){}}};
 const replaced=[],context={SmartStudy:app,Date:FakeDate,console,setTimeout,clearTimeout,setInterval(){},clearInterval(){},URLSearchParams,location:{search,pathname:'/mock-exam.html',href:''},history:{replaceState:(...args)=>replaced.push(args)},document,addEventListener(){}};context.window=context;
 vm.runInNewContext(fs.readFileSync('mock-exam.js','utf8'),context);vm.runInNewContext(fs.readFileSync('mock-exam-ui.js','utf8'),context);
 for(let i=0;i<20;i++)await new Promise(resolve=>setImmediate(resolve));
 return {$:id=>document.getElementById(id),api:app.MockExam,builds,replaced};
}
test('learner screen: a paper round moves the online exam to the next round and keeps paper questions in history',async()=>{
 const p=await page([paperRow(1)]);
 assert.equal(p.$('startExam').textContent,'2회차 새 문제로 시작');assert.equal(p.$('cancelRetake').hidden,true);
 assert.equal(p.builds.at(-1).attemptNo,2);assert(p.builds.at(-1).history.some(r=>r.payload.status==='paper'),'paper questions are build history');
 p.$('examPledge').checked=true;p.$('examPledge').onchange();p.$('startExam').onclick();
 const draft=p.api.get('우준',UI_WEEK);assert.equal(draft.attemptNo,2);assert.doesNotMatch(draft.assessmentId,/paper/);assert.equal(draft.status,'in-progress');
 assert.deepEqual(JSON.parse(JSON.stringify(p.api.list('우준',UI_WEEK).map(d=>[d.attemptNo,d.status]))),[[1,'paper'],[2,'in-progress']]);
});
test('learner screen: all three rounds used (paper included) shows the week as used up; a paper link is not opened',async()=>{
 const full=await page([paperRow(1),paperRow(2),paperRow(3)]);
 assert.match(full.$('bankStatus').textContent,/3회차까지 모두 사용했어요/);assert.equal(full.$('startExam').hidden,true);assert.equal(full.$('pledgeLabel').hidden,true);
 const linked=await page([paperRow(1)],'?assessment='+encodeURIComponent(paperRow(1).assessmentId));
 assert.equal(linked.replaced.length>0,true,'the paper link is dropped');assert.equal(linked.$('startExam').textContent,'2회차 새 문제로 시작');
});
test('firestore.rules: admin-only paper rounds without answers; paper rounds cannot be published',()=>{
 const rules=fs.readFileSync('firestore.rules','utf8');
 assert(rules.includes('function validPaperMock(p)'));assert(rules.includes("(isAdmin() && validPaperMock(request.resource.data.payload))"));
 assert(rules.includes("p.status == 'paper' && p.mode == 'paper'"));assert(rules.includes("!p.keys().hasAny(['submittedAt', 'initialAttempts', 'reports', 'responses'])"));
 assert(/allow update: if isAdmin\(\) && canUse\(resource\.data\.learnerId\)\s+&& resource\.data\.payload\.status == 'submitted'/.test(rules));
 const admin=fs.readFileSync('admin.html','utf8'),scripts=[...admin.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]);
 const exam=[...fs.readFileSync('mock-exam.html','utf8').matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]);
 // Every exam-bank dependency is on the admin page with the same cache tag; ReadingPassages.js precedes the passages it is extended by.
 for(const src of exam.filter(s=>!/^(learning-translation-guard|firebase-sync|mock-exam-ui|mock-exam-results|mock-wrong-note)\.js/.test(s)))assert(scripts.includes(src),src);
 assert(scripts.indexOf('ReadingPassages.js?v=20261019-content-fix')<scripts.indexOf('KoreanReadingMiddle.js?v=20261023-korean-reading'));
 const at=name=>scripts.findIndex(src=>src.split('?')[0]===name);assert(at('mock-paper-admin.js')>=0&&at('mock-paper-admin.js')<at('mock-admin.js'));
});

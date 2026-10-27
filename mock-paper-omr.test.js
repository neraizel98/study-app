// Parent OMR scoring of a printed round (mock-paper-omr.js): photo -> stubbed OmrReader -> confirmation ->
// the same submitted record as an online exam -> publication -> learner result, wrong notes, trends, review.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),nodeCrypto=require('node:crypto');
const {setup,files}=require('./tests/helpers/mock-transfer-fixture.cjs');
class El{
 constructor(tag='div',id=''){this.tagName=tag.toUpperCase();this.id=id;this.children=[];this.hidden=false;this.disabled=false;this.checked=false;this.open=false;this.textContent='';this.className='';this.title='';this.attributes={};this.style={setProperty(){}};this.isConnected=true;this.clicks=0;
  this.classList={add:name=>{if(!this.className.split(' ').includes(name))this.className=`${this.className} ${name}`.trim();},remove(){},toggle(){},contains:name=>this.className.split(' ').includes(name)};
  if(this.tagName==='CANVAS'){const canvas=this;this.drawn=[];this.context={drawImage:(...args)=>canvas.drawn.push(args),getImageData:(x,y,w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),
   createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),putImageData:img=>{canvas.put=img;}};this.getContext=()=>this.context;}}
 get childNodes(){return this.children;}get lastChild(){return this.children.at(-1);}get value(){return this._value??this.children.find(c=>c.tagName==='OPTION')?.value??'';}set value(v){this._value=v;}
 append(...nodes){this.children.push(...nodes);}replaceChildren(...nodes){this.children=[...nodes];}setAttribute(k,v){this.attributes[k]=String(v);}querySelector(){return this._h2||=new El('h2');}focus(){}showModal(){this.open=true;}close(){this.open=false;}click(){this.clicks++;}
}
const all=node=>[node,...(node.children||[]).flatMap(all)],textOf=node=>all(node).map(n=>n.textContent||'').join(' ');
const buttons=(node,label)=>all(node).filter(n=>n.tagName==='BUTTON'&&n.textContent===label);
const NOW=Date.parse('2026-10-25T10:00:00+09:00'),WEEK='2026-10-19';
const flush=async()=>{for(let i=0;i<10;i++)await new Promise(resolve=>setImmediate(resolve));};
function server(){
 const docs=new Map(),snap=id=>({id,exists:docs.has(id),data:()=>structuredClone(docs.get(id))}),ref=id=>({id,get:async()=>snap(id)});
 const query=filters=>({where:(field,op,value)=>query([...filters,[field,value]]),get:async()=>({docs:[...docs].filter(([,d])=>filters.every(([field,v])=>field.split('.').reduce((x,k)=>x?.[k],d)===v)).map(([id])=>snap(id))})});
 return {docs,db:{collection:()=>({doc:ref,where:(field,op,value)=>query([[field,value]])}),runTransaction:async fn=>fn({get:async r=>snap(r.id),update:(r,patch)=>docs.set(r.id,{...docs.get(r.id),...structuredClone(patch)}),set:(r,data)=>docs.set(r.id,structuredClone(data))})}};
}
const extra=['weekly-schedule.js','firestore-repository.js','mock-paper-admin.js','mock-paper.js','mock-paper-omr.js','mock-admin.js','mock-wrong-note.js','mock-exam-results.js','weekly-review-policy.js'];
function device(role,cloud,clock,evidence){
 const prefs=new Map(),local=role==='learner'?structuredClone(evidence):[],raw=new Map(),charts=[],notes=[],reads=[];
 class FakeDate extends Date{constructor(...args){super(...(args.length?args:[clock.now]));}static now(){return clock.now;}}
 const c={console,Date:FakeDate,Set,Map,URLSearchParams,Uint8ClampedArray,Math:Object.create(Math),setTimeout,clearTimeout,crypto:{randomUUID:()=>nodeCrypto.randomUUID()},
  open:()=>({}),confirm:()=>true,document:{createElement:tag=>new El(tag),createTextNode:text=>Object.assign(new El('#text'),{textContent:text})},
  Chart:class{constructor(canvas,config){charts.push(config);}destroy(){}},WrongNote:{save:(...args)=>notes.push(args)}};c.window=c;
 c.SmartStudy={LocalRepository:{getActiveUser:()=>role==='learner'?'learner':'parent',listReports:()=>structuredClone(local),saveReports:(_,rows)=>local.splice(0,local.length,...structuredClone(rows)),flush:async()=>{},
  getPreference:(k,d)=>prefs.has(k)?structuredClone(prefs.get(k)):d,setPreference:(k,v)=>prefs.set(k,structuredClone(v)),keys:()=>[...prefs.keys()],rawSet:(k,v)=>raw.set(k,v),getWrongAnswers:()=>({}),getUser:()=>({})},
  FirebaseClient:{getDB:async()=>cloud.db,getCurrentUser:async()=>({uid:role})}};
 c.firebase={firestore:{FieldValue:{serverTimestamp:()=>clock.now}}};vm.createContext(c);
 for(const file of [...files,...extra])vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
 const R=c.SmartStudy.FirestoreRepository;R.getAccess=async uid=>({role:uid==='parent'?'admin':'learner'});R.getReportStorageMode=async()=>'legacy';R.getUserBundle=async()=>({reports:structuredClone(evidence)});
 R.getLearnerPlanSettings=async()=>({weekly:{learningDays:5,miniCheck:false,mockSectionMinutes:{reading:25,english:20,math:30,hanja:10}}});
 c._adminData={userId:'learner',ud:{id:'하늘'}};
 // Default reader: the test sets c.readerResult (value, or a function of the image and set).
 c.OmrReader={read:(image,set,options)=>{reads.push({image,set,options});return typeof c.readerResult==='function'?c.readerResult(image,set):c.readerResult;}};
 c.createImageBitmap=async(file,options)=>{c.bitmapOptions=options;return {width:file.width,height:file.height,close(){c.bitmapClosed=true;}};};
 return {c,app:c.SmartStudy,api:c.SmartStudy.MockExam,local,charts,notes,reads,prefs};
}
function world(){const s=setup(),clock={now:NOW},cloud=server(),evidence=JSON.parse(JSON.stringify(s.reports));return {clock,cloud,learner:device('learner',cloud,clock,evidence),parent:device('parent',cloud,clock,evidence)};}
async function online(w){
 const {app,api}=w.learner,remote=await app.MockPublication.list('learner',{week:WEEK});api.restore('learner',remote);
 const bank=app.MockExamBank.build('learner',w.clock.now,{attemptNo:1,history:remote});assert(api.validateBank(bank));
 let d=api.create('learner',bank,w.clock.now);
 for(let i=0;i<4;i++){const active=d.sections.find(s=>s.state==='active');d=api.finishSection('learner',d.assessmentId,w.clock.now+i+1,active.id);if(d.break&&!d.break.endedAt)d=api.skipBreak('learner',d.assessmentId,w.clock.now+i+1);}
 assert((await api.sync('learner',d.assessmentId)).synced);w.clock.now+=60000;return api.getById('learner',d.assessmentId);
}
async function printed(w,attemptNo=1){const result=await w.parent.app.MockPaperAdmin.generate('learner',{attemptNo,learnerName:'하늘'});assert(result.ok,JSON.stringify(result.bank?.shortages));w.clock.now+=60000;return result;}
// The reader result for a filled card: plan(itemIndex, item) -> {choice, status} for choice items.
function readerResult(app,set,plan){
 const places=app.MockPaperOmr.numbering(set.items);
 return {ok:true,attemptNo:set.attemptNo,quality:{},answers:places.map(p=>{const q=set.items[p.itemIndex];if(q.kind==='written')return {...p,choice:null,status:'ok',confidence:1};const r=plan(p.itemIndex,q);return {...p,choice:r.choice,status:r.status||'ok',confidence:r.status&&r.status!=='ok'?.4:.98};}),
  writtenCrops:places.filter(p=>set.items[p.itemIndex].kind==='written').map(p=>({...p,rgba:{width:3,height:2,data:new Uint8ClampedArray(24).fill(7)}}))};
}
// Choice items: even positions marked correctly, odd ones with another choice; three rows unreadable.
function plan(set){
 const choiceIndexes=set.items.map((q,i)=>q.kind==='written'?null:i).filter(i=>i!=null),unsure=new Map([[choiceIndexes[0],'blank'],[choiceIndexes[1],'multiple'],[choiceIndexes[2],'faint']]);
 return {unsure,mark:(i,q)=>{if(unsure.has(i))return {choice:null,status:unsure.get(i)};const right=q.choices.indexOf(q.answer);return {choice:(i%2?(right+1)%q.choices.length:right)+1};}};
}
async function openOmr(w,host){
 const {app}=w.parent;await app.MockAdmin.render('learner',host);
 const trigger=buttons(host,'OMR 사진으로 채점');assert.equal(trigger.length,1,'one printed round, one OMR button');
 const input=all(host).find(n=>n.className==='omr-file');trigger[0].onclick();assert.equal(input.clicks,1,'the button opens the camera/gallery picker');
 return {input,panel:all(host).find(n=>n.className==='omr-review'),take:async(file={width:4000,height:3000})=>{input.files=[file];await input.onchange();}};
}
const items=panel=>all(panel).filter(n=>n.attributes?.['data-item']!=null);
const row=(panel,i)=>items(panel).find(n=>n.attributes['data-item']===String(i));
// The create-rule checks for an online submission, applied to a stored payload.
function onlineChecks(doc){
 const p=doc.payload;assert.equal(doc.published,false);assert.equal(p.kind,'mock');assert.equal(p.status,'submitted');assert.equal(p.assessmentId,doc.assessmentId);assert.equal(p.userId,doc.learnerId);
 assert.match(p.scheduledWeekId,/^\d{4}-\d{2}-\d{2}$/);assert.deepEqual(p.sections.map(s=>[s.id,s.state]),[['reading','ended'],['english','ended'],['math','ended'],['hanja','ended']]);
 assert.equal(p.questions.length,55);assert.equal(p.initialAttempts.length,55);assert(p.reports.length>=4&&p.reports.length<=8);
 assert.equal(p.sections.reduce((n,s)=>n+s.initialAttempts.length,0),55);assert(Number.isInteger(p.submittedAt));
}

test('reader errors are shown in Korean with a retake; the image is oriented, downscaled and read with the reprint set',async()=>{
 const w=world(),paper=await printed(w),host=new El('div'),{c,app}=w.parent,o=await openOmr(w,host),retake=()=>buttons(o.panel,'다시 찍기')[0];
 c.readerResult={ok:false,error:'no-card'};await o.take();
 assert.equal(c.bitmapOptions.imageOrientation,'from-image');assert.equal(c.bitmapClosed,true);
 const seen=w.parent.reads.at(-1);assert.equal(seen.image.width,2000);assert.equal(seen.image.height,1500);assert.equal(seen.image.data.length,2000*1500*4);
 assert.deepEqual(JSON.parse(JSON.stringify(seen.set)),JSON.parse(JSON.stringify(app.MockPaperAdmin.paperSet(paper.payload))),'the same set the reprint uses');
 assert.match(textOf(o.panel),/답안지 네 모서리의 검은 사각형이 모두 보이게 다시 찍어 주세요/);retake().onclick();assert.equal(o.input.clicks,2);
 c.readerResult=Promise.resolve({ok:false,error:'blurry'});await o.take();assert.match(textOf(o.panel),/사진이 흐려요\. 밝은 곳에서 흔들리지 않게 다시 찍어 주세요/);assert(retake());
 c.readerResult={ok:false,error:'wrong-card'};await o.take();assert.match(textOf(o.panel),/다른 회차\(또는 다른 주\)의 답안지예요\. 1회차 답안지를 찍어 주세요/);
 // A clean read of another round's card is the wrong card too.
 c.readerResult=(image,set)=>({...readerResult(app,set,plan(set).mark),attemptNo:2});await o.take();assert.match(textOf(o.panel),/1회차 답안지를 찍어 주세요/);assert.equal(items(o.panel).length,0);
 c.readerResult=()=>{throw new Error('boom');};await o.take();assert.match(textOf(o.panel),/답안지를 읽지 못했어요/);
 // A small photo is not enlarged; without createImageBitmap the <img> path is used.
 c.createImageBitmap=async()=>{throw new Error('unsupported');};c.URL={createObjectURL:()=>'blob:x',revokeObjectURL(){}};
 c.Image=class{set src(v){this.naturalWidth=1200;this.naturalHeight=900;setImmediate(()=>this.onload());}};c.readerResult={ok:false,error:'no-card'};await o.take();
 assert.deepEqual([w.parent.reads.at(-1).image.width,w.parent.reads.at(-1).image.height],[1200,900]);
 c.Image=class{set src(v){setImmediate(()=>this.onerror());}};await o.take();assert.match(textOf(o.panel),/사진을 열지 못했어요/);
 c.Image=class{set src(v){this.naturalWidth=800;this.naturalHeight=600;setImmediate(()=>this.onload());}};delete c.OmrReader;await o.take();assert.match(textOf(o.panel),/판독 기능을 불러오지 못했어요/);
 assert.equal([...w.cloud.docs.values()].filter(d=>d.payload.status!=='paper').length,0,'nothing saved');
});

test('confirmation: uncertain rows wait for the parent, handwriting is shown for 단답형, and no answer is revealed',async()=>{
 const w=world(),paper=await printed(w),host=new El('div'),{c,app}=w.parent,o=await openOmr(w,host),set=app.MockPaperAdmin.paperSet(paper.payload),p=plan(set);
 c.readerResult=readerResult(app,set,p.mark);await o.take();
 assert.equal(items(o.panel).length,55);const written=set.items.map((q,i)=>q.kind==='written'?i:null).filter(i=>i!=null);assert(written.length>=1,'the printed math has 단답형');
 for(const [i,status] of p.unsure){const r=row(o.panel,i);assert.match(r.className,/is-uncertain/);assert.match(textOf(r),{blank:/표시 없음/,multiple:/두 개 이상/,faint:/흐리게/}[status]);
  assert(all(r).filter(n=>n.tagName==='BUTTON').every(b=>b.attributes['aria-pressed']==='false'),'nothing preselected');assert.equal(buttons(r,'무응답').length,1);}
 const clean=set.items.findIndex((q,i)=>q.kind!=='written'&&!p.unsure.has(i));assert.doesNotMatch(row(o.panel,clean).className,/is-uncertain/);
 assert.equal(all(row(o.panel,clean)).filter(n=>n.attributes?.['aria-pressed']==='true').length,1,'a clean read is preselected');
 for(const i of written){const r=row(o.panel,i),canvas=all(r).find(n=>n.tagName==='CANVAS');assert(canvas&&canvas.put,'handwriting crop drawn');assert.equal(canvas.width,3);assert.equal(canvas.put.data[0],7);
  assert(all(r).some(n=>n.className==='omr-text'));assert.match(r.className,/is-uncertain/);}
 // Area sections in printed order, numbers restarting at 1.
 assert.deepEqual(all(o.panel).filter(n=>n.tagName==='H5').map(n=>n.textContent.split(' · ')[0]),['1교시 국어','2교시 수학','3교시 영어','4교시 한자']);
 // Transcription only: no correct answers, no correctness, no choice text.
 const texts=new Set(all(o.panel).map(n=>n.textContent));assert.doesNotMatch(textOf(o.panel),/정답|오답|맞았|틀렸/);
 for(const q of set.items)for(const choice of q.choices||[])if(!/^\d{1,2}$/.test(String(choice)))assert(!texts.has(String(choice)),choice);
 const save=buttons(o.panel,'채점하고 저장')[0];assert.equal(save.disabled,true);assert.match(textOf(o.panel),new RegExp(`노란 칸 ${3+written.length}문항`));
 for(const [i] of p.unsure)buttons(row(o.panel,i),'무응답')[0].onclick();
 for(const i of written)buttons(row(o.panel,i),'무응답')[0].onclick();
 assert.equal(save.disabled,false);assert.match(textOf(o.panel),/모든 문항을 확인했어요/);
 // Typing replaces 무응답 for 단답형; clearing the text needs a choice again.
 const text=all(row(o.panel,written[0])).find(n=>n.className==='omr-text');text.value='12';text.oninput();assert.equal(save.disabled,false);
 text.value='';text.oninput();assert.equal(save.disabled,true);
 buttons(o.panel,'다시 찍기')[0].onclick();assert.equal(o.input.clicks,2);
});

test('scoring and saving: the printed round becomes an online-shaped submitted result that only the admin sees',async()=>{
 const w=world(),first=await online(w),paper=await printed(w,2),host=new El('div'),{c,app}=w.parent,o=await openOmr(w,host),set=app.MockPaperAdmin.paperSet(paper.payload),p=plan(set);
 // The learner device already holds the printed copy.
 w.learner.api.restore('learner',await w.learner.app.MockPublication.list('learner',{week:WEEK}));assert.equal(w.learner.api.getById('learner',paper.payload.assessmentId).status,'paper');
 c.readerResult=readerResult(app,set,p.mark);await o.take();
 const [blank,multiple,faint]=[...p.unsure.keys()],written=set.items.map((q,i)=>q.kind==='written'?i:null).filter(i=>i!=null);
 buttons(row(o.panel,blank),'무응답')[0].onclick();
 const multi=set.items[multiple],multiPick=multi.choices.indexOf(multi.answer);buttons(row(o.panel,multiple),['①','②','③','④','⑤'][multiPick])[0].onclick();
 const faintItem=set.items[faint],faintPick=(faintItem.choices.indexOf(faintItem.answer)+1)%faintItem.choices.length;buttons(row(o.panel,faint),['①','②','③','④','⑤'][faintPick])[0].onclick();
 const typed=written.map((i,k)=>k===0?String(set.items[i].answer):'99999');written.forEach((i,k)=>{const t=all(row(o.panel,i)).find(n=>n.className==='omr-text');t.value=` ${typed[k]} `;t.oninput();});
 const saveAt=w.clock.now;await buttons(o.panel,'채점하고 저장')[0].onclick();
 const doc=w.cloud.docs.get(`learner|${paper.payload.assessmentId}`),saved=doc.payload;
 onlineChecks(doc);assert.equal(saved.mode,'paper');assert.deepEqual(saved.integrity,{source:'paper-omr'});assert.equal(saved.attemptNo,2);assert.equal(saved.assessmentId,paper.payload.assessmentId);
 assert.equal(JSON.stringify(saved.questions),JSON.stringify(paper.payload.questions));assert.equal(saved.submittedAt,saveAt);assert.equal(saved.startedAt,paper.payload.startedAt);assert.equal(saved.scheduledWeekId,WEEK);
 assert.equal(doc.createdBy,'parent');assert.equal(doc.publishedAt,null);
 // Expected grading, computed from the marks.
 const expected=new Map(set.items.map((q,i)=>{if(q.kind==='written'){const k=written.indexOf(i);return [q.id,{answer:typed[k],correct:k===0}];}
  if(i===blank)return [q.id,{answer:'',correct:false}];if(i===multiple)return [q.id,{answer:q.choices[multiPick],correct:true}];if(i===faint)return [q.id,{answer:q.choices[faintPick],correct:false}];
  const right=q.choices.indexOf(q.answer),pick=i%2?(right+1)%q.choices.length:right;return [q.id,{answer:q.choices[pick],correct:pick===right}];}));
 for(const a of saved.initialAttempts){const e=expected.get(a.questionId);assert.equal(a.selectedAnswer,e.answer,a.questionId);assert.equal(a.correct,e.correct,a.questionId);assert.equal(a.unanswered,e.answer==='');}
 assert.equal(saved.initialAttempts.find(a=>a.questionId===set.items[blank].id).status,'unanswered');
 // Same record shape as the online round in this world.
 const keys=o=>Object.keys(o).sort().join(',');assert.equal(keys(saved.initialAttempts[0]),keys(first.sections[0].initialAttempts[0]));
 assert.equal(keys(saved.sections[0]),keys(first.sections[0]));
 const onlineReports=w.cloud.docs.get(`learner|${first.assessmentId}`).payload.reports;assert.equal(keys(saved.reports[0]),keys(onlineReports[0]));
 const fixed=['assessment','examTraining','mockExam','kind','assessmentId','assessmentSubject','resultVisibility','scheduledWeekId','scheduledDate','attemptNo','parentAttemptId','submittedAt','examComplete','status','sectionId','timedOut','activeSeconds','elapsedSeconds','unansweredCount','initialAttempts','attempts','requestedCount','actualCount','scopeComplete','questionContexts'];
 for(const r of [...saved.reports,...onlineReports])for(const k of fixed)assert(k in r.metadata,k);
 assert(saved.reports.every(r=>r.metadata.mockExam&&r.metadata.mode==='paper'&&r.metadata.assessmentId===saved.assessmentId&&r.metadata.attemptNo===2&&r.round===2&&r.metadata.resultVisibility==='withheld'));
 assert.equal(saved.reports.reduce((n,r)=>n+r.totalQuestions,0),55);
 // Admin list: the round reads like an online result waiting for publication.
 const card=all(host).filter(n=>n.className==='mock-result-card').find(n=>textOf(n).includes('2회차'));
 assert.match(textOf(card),/학생 공개 대기/);assert(all(card).some(n=>n.className==='mock-score-grid'));assert.match(textOf(card),/종이 시험 · OMR 채점/);assert.doesNotMatch(textOf(card),/화면 이탈/);
 assert.equal(buttons(card,'학습자에게 공개').length,1);assert.equal(buttons(host,'OMR 사진으로 채점').length,0,'a scored round cannot be scored again');
 assert.match(textOf(host),/2회차 종이 시험을 채점해 저장했습니다/);
 assert.deepEqual(all(host).filter(n=>n.className==='mock-paper-state').map(n=>n.textContent),['온라인 응시함','종이 시험 채점함','비어 있음']);
 // The learner sees nothing before publication, yet the round is restored with its subject reports.
 const L=w.learner;assert.equal((await L.app.MockExamResults.load('learner',saved.assessmentId)).published,false);
 L.api.restore('learner',await L.app.MockPublication.list('learner',{week:WEEK}));
 assert.equal(L.api.getById('learner',saved.assessmentId).status,'submitted','the printed copy is replaced by the scored result');
 const reports=L.local.filter(r=>r.metadata?.assessmentId===saved.assessmentId);assert.equal(reports.length,saved.reports.length);assert(reports.every(r=>r.metadata.resultVisibility==='withheld'));
 L.api.restore('learner',await L.app.MockPublication.list('learner',{week:WEEK}));assert.equal(L.local.filter(r=>r.metadata?.assessmentId===saved.assessmentId).length,reports.length,'restored once');
 // Re-scoring is refused before and after publication.
 const again=app.MockExam.paperResult(paper.payload,{},w.clock.now);await assert.rejects(()=>app.MockPublication.savePaperResult('learner',again),/이미 채점한 회차/);
 await assert.rejects(()=>L.app.MockPublication.savePaperResult('learner',again),/관리자/);
 await buttons(card,'학습자에게 공개')[0].onclick();assert.equal(w.cloud.docs.get(doc.learnerId+'|'+doc.assessmentId).published,true);
 await assert.rejects(()=>app.MockPublication.savePaperResult('learner',again),/이미 공개한 결과/);
});

test('after publication the learner sees score, answers and explanations; wrong notes, trends, review and mastery use it',async()=>{
 const w=world(),paper=await printed(w,1),host=new El('div'),{c,app}=w.parent,o=await openOmr(w,host),set=app.MockPaperAdmin.paperSet(paper.payload);
 c.readerResult=readerResult(app,set,(i,q)=>{const right=q.choices.indexOf(q.answer);return {choice:(i%3?right:(right+1)%q.choices.length)+1};});await o.take();
 for(const r of items(o.panel))if(r.className.includes('is-uncertain'))buttons(r,'무응답')[0].onclick();
 await buttons(o.panel,'채점하고 저장')[0].onclick();
 const id=paper.payload.assessmentId,saved=w.cloud.docs.get(`learner|${id}`).payload,wrong=saved.initialAttempts.filter(a=>!a.correct).length,right=55-wrong;assert(wrong>0&&right>0);
 // The weekly chart uses round 1, so this paper round is the week's point.
 const mathScore=app.MockAdmin.scores(saved).math,config=w.parent.charts.at(-1),labels=config.data.labels,at=labels.indexOf(WEEK.slice(5));
 assert(at>=0);assert.equal(config.data.datasets.find(d=>d.label==='수학').data[at],Math.round(mathScore.correct/mathScore.total*100));
 await buttons(host,'학습자에게 공개')[0].onclick();
 const L=w.learner,result=await L.app.MockExamResults.load('learner',id);assert.equal(result.published,true);assert.equal(result.snapshot.mode,'paper');
 const view=new El('div');L.app.MockExamResults.render(view,result);const text=textOf(view);
 assert.match(text,new RegExp(`55문항 중 ${right}문항을 맞혔어요`));assert.match(text,/종이 시험 · OMR 채점/);assert.doesNotMatch(text,/화면 이탈|시험 중 기록/);
 const missed=saved.initialAttempts.find(a=>!a.correct&&a.explanation);if(missed)assert.match(text,new RegExp(missed.explanation.slice(0,10).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 assert.match(text,/정답: /);
 // Wrong-answer note: once per exam, from the published snapshot.
 const noted=L.notes.length;assert(noted>0);assert(L.notes.every(n=>n[3]===id&&n[2]==='wrong'));
 await L.app.MockExamResults.load('learner',id);assert.equal(L.notes.length,noted);
 // The learner device restores the round with published subject reports (mastery and the notebook sweep read these).
 L.api.restore('learner',await L.app.MockPublication.list('learner',{week:WEEK}));
 const reports=L.local.filter(r=>r.metadata?.assessmentId===id);assert(reports.length>=4&&reports.length<=8);
 assert(reports.every(r=>r.metadata.assessment&&r.metadata.mockExam&&r.metadata.resultVisibility==='published'&&r.metadata.examComplete));
 assert.equal(reports.reduce((n,r)=>n+r.initialScore,0),right);
 // Sunday review: the released paper round's mistakes are mock candidates; the week's mock day is complete.
 const rows=await L.app.MockPublication.list('learner',{week:WEEK}),review=L.app.WeeklyReviewPolicy.buildCandidates({userId:'learner',weekId:WEEK,publishedExams:rows,now:w.clock.now});
 assert(review.mockCandidates.length>0);assert(review.mockCandidates.every(q=>q.sourceReferences[0].sourceAssessmentId===id));
 // The weekly dashboard counts a submitted (not printed) round as the week's mock exam.
 assert(rows.some(r=>r.assessmentId===id&&r.payload.status==='submitted'&&r.published===true));
});

// mock-exam-ui.js on the learner device: a link to a printed round that has since been scored opens its result.
test('learner screen: the scored paper link replaces the printed copy and shows the result flow',async()=>{
 const start=Date.parse('2026-10-17T00:00:00Z'),UI_WEEK='2026-10-12',assessmentId=`mock:우준:${UI_WEEK}:attempt-1-paper-p1`;
 const paperPayload={schemaVersion:1,assessmentId,userId:'우준',scheduledWeekId:UI_WEEK,scheduledDate:'2026-10-16',kind:'mock',mode:'paper',status:'paper',attemptNo:1,generatedAt:start-1000,startedAt:start-1000,sections:[],
  questions:Array.from({length:55},(_,i)=>({id:`p:${i}`,subject:['reading','english','math','hanja'][i%4],question:`종이 ${i}`,answer:'A',choices:['A','B']}))};
 const values=new Map(),elements=new Map(),reports=[],loads=[];let rows=[{learnerId:'우준',assessmentId,published:false,payload:paperPayload}];
 const local={ready:Promise.resolve(),getActiveUser:()=> '우준',getPreference:(k,d)=>values.has(k)?structuredClone(values.get(k)):d,setPreference:(k,v)=>values.set(k,structuredClone(v)),keys:()=>[...values.keys()],listReports:()=>structuredClone(reports),saveReports:(_,items)=>reports.splice(0,reports.length,...structuredClone(items)),flush:async()=>{}};
 const document={hidden:false,visibilityState:'visible',hasFocus:()=>true,getElementById:id=>{if(!elements.has(id))elements.set(id,new El(id==='examHistory'?'select':'div',id));return elements.get(id);},createElement:tag=>new El(tag),addEventListener(){}};
 class FakeDate extends Date{constructor(...args){super(...(args.length?args:[start]));}static now(){return start;}}
 const app={LocalRepository:local,MockPublication:{list:async()=>structuredClone(rows),submit:async()=>true,get:async()=>({published:false})},FirestoreRepository:{getLearnerPlanSettings:async()=>null},LearningPlan:{applyParentSettings(){},getSettings:()=>({})},
  MockExamBank:{build:()=>({complete:false,items:[]}),grade:(q,r)=>({correct:q.answer===r,answer:q.answer})},MockExamResults:{setMathText:(el,v)=>{el.textContent=v;},load:async(user,id)=>{loads.push(id);return {published:false};},render(){}}};
 const replaced=[],context={SmartStudy:app,Date:FakeDate,console,setTimeout,clearTimeout,setInterval(){},clearInterval(){},URLSearchParams,location:{search:'?assessment='+encodeURIComponent(assessmentId),pathname:'/mock-exam.html',href:''},history:{replaceState:(...args)=>replaced.push(args)},document,addEventListener(){}};context.window=context;
 vm.runInNewContext(fs.readFileSync('mock-exam.js','utf8'),context);
 app.MockExam.restore('우준',rows);assert.equal(app.MockExam.getById('우준',assessmentId).status,'paper');
 const scored=app.MockExam.paperResult(paperPayload,Object.fromEntries(paperPayload.questions.map((q,i)=>[q.id,i%5?'A':'B'])),start);rows=[{learnerId:'우준',assessmentId,published:false,payload:scored}];
 vm.runInNewContext(fs.readFileSync('mock-exam-ui.js','utf8'),context);await flush();
 assert.equal(replaced.length,0,'the link is kept');const $=id=>document.getElementById(id);
 assert.equal($('submittedPanel').hidden,false);assert.match($('submittedPanel').querySelector('h2').textContent,/1회차 · 네 과목 제출 완료/);assert.equal($('syncState').textContent,'클라우드 저장 완료');
 assert.deepEqual(loads,[assessmentId]);assert.equal(app.MockExam.getById('우준',assessmentId).status,'submitted');
 assert.equal(reports.filter(r=>r.metadata.assessmentId===assessmentId).length,4);
});

test('firestore.rules: one admin-only transition from a printed round to an unpublished, online-shaped result',()=>{
 const rules=fs.readFileSync('firestore.rules','utf8');
 const fn=rules.match(/function validPaperResult\(p, old\) \{([\s\S]*?)\n    \}/)[1];
 for(const part of ["p.status == 'submitted' && p.mode == 'paper' && p.kind == 'mock'","p.assessmentId == old.assessmentId && p.userId == old.userId","p.scheduledWeekId == old.scheduledWeekId && p.attemptNo == old.attemptNo",
  'p.questions == old.questions',"p.integrity is map && p.integrity.source == 'paper-omr'",'p.submittedAt is int','p.sections is list && p.sections.size() == 4',
  "p.sections[0].id == 'reading' && p.sections[0].state == 'ended'","p.sections[1].id == 'english' && p.sections[1].state == 'ended'","p.sections[2].id == 'math' && p.sections[2].state == 'ended'","p.sections[3].id == 'hanja' && p.sections[3].state == 'ended'",
  'p.initialAttempts is list && p.initialAttempts.size() == 55','p.reports is list && p.reports.size() >= 4 && p.reports.size() <= 8'])assert(fn.includes(part),part);
 const updates=[...rules.matchAll(/allow update: if ([\s\S]*?);/g)].map(m=>m[1]).filter(r=>r.includes('resource.data.learnerId'));
 const scoring=updates.find(r=>r.includes('validPaperResult'));assert(scoring);
 for(const part of ['isAdmin() && canUse(resource.data.learnerId)','validPaperMock(resource.data.payload) && resource.data.published == false',"request.resource.data.diff(resource.data).affectedKeys().hasOnly(['payload'])",'validPaperResult(request.resource.data.payload, resource.data.payload)'])assert(scoring.includes(part),part);
 // Publication is unchanged: submitted results only, and a paper copy (status 'paper') never matches it.
 assert(updates.some(r=>r.includes("resource.data.payload.status == 'submitted'")&&r.includes("affectedKeys().hasOnly(['published','publishedAt','publishedBy'])")));
 // Learner reports are written by the learner's own device under users/{userId}, which canUse already covers.
 assert(rules.includes('match /{document=**} { allow read, write: if canUse(userId); }'));
 const admin=fs.readFileSync('admin.html','utf8'),scripts=[...admin.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
 for(const name of ['mock-paper.js','omr-layout.js','omr-reader.js','mock-paper-omr.js'])assert(scripts.indexOf(name)>scripts.indexOf('mock-paper-admin.js')&&scripts.indexOf(name)<scripts.indexOf('mock-admin.js'),name);
 assert(fs.readFileSync('service-worker.js','utf8').includes("'./mock-paper-omr.js'"));
});

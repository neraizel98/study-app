const {test}=require('node:test'),fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function fixture(){
 const docs=new Map(),reads=[];let role='admin';
 const collection=name=>({doc:id=>({key:name+'/'+id,collection:child=>collection(name+'/'+id+'/'+child),get:async options=>{reads.push({key:name+'/'+id,options});return {exists:docs.has(name+'/'+id),data:()=>structuredClone(docs.get(name+'/'+id))};}}),get:async options=>{reads.push({key:name,options});return {docs:[...docs].filter(([key])=>key.startsWith(name+'/')&&!key.slice(name.length+1).includes('/')).map(([key,value])=>({id:key.slice(name.length+1),data:()=>structuredClone(value)}))};}});
 const db={collection,runTransaction:async fn=>{const writes=[];await fn({get:r=>r.get(),set:(r,v)=>writes.push([r.key,structuredClone(v)])});for(const [key,value]of writes)docs.set(key,value);}};
 const context={console,setTimeout,clearTimeout,Date,firebase:{firestore:{FieldValue:{serverTimestamp:()=>123}}},SmartStudy:{FirebaseClient:{getDB:async()=>db,getCurrentUser:async()=>({uid:'parent'})}}};context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync('firestore-repository.js','utf8'),context);context.SmartStudy.FirestoreRepository.getAccess=async()=>({role,learnerIds:role==='learner'?['learner']:[]});
 const user='learner',assessmentId='mock:learner:2026-11-02:attempt-3-paper-fixture',key='mockExamResults/'+user+'|'+assessmentId;
 const payload={userId:user,assessmentId,kind:'mock',status:'submitted',submittedAt:100,mode:'paper',integrity:{source:'paper-omr'},sections:['reading','english','math','hanja'].map(id=>({id,state:'ended'})),questions:Array.from({length:55},(_,i)=>({id:'q'+i,subject:i<15?'english':'math'})),initialAttempts:Array.from({length:55},(_,i)=>({questionId:'q'+i,subject:i<15?'english':'math',correct:i%2===0}))};
 docs.set(key,{learnerId:user,assessmentId,published:false,payload});
 return {docs,reads,api:context.SmartStudy.MockLearningRepository,user,assessmentId,key,settingsKey:'mockLearningSettings/'+user,setRole:value=>role=value};
}
test('admin selection round-trips from server, permits unpublished graded paper, and never changes original exam',async()=>{
 const f=fixture(),before=JSON.stringify(f.docs.get(f.key));assert.equal(await f.api.get(f.user),null);
 const saved=await f.api.set(f.user,{assessmentId:f.assessmentId,confirmedUnassisted:true});assert.equal(saved.assessmentId,f.assessmentId);assert.equal(saved.scope,'english');assert.equal(saved.updatedBy,'parent');assert.equal(saved.updatedAt,123);assert.equal(JSON.stringify(f.docs.get(f.key)),before);
 assert(f.reads.filter(r=>r.key===f.settingsKey).every(r=>r.options?.source==='server'));
 await f.api.set(f.user,{assessmentId:null,confirmedUnassisted:false});assert.equal((await f.api.get(f.user)).assessmentId,null);assert.equal(JSON.stringify(f.docs.get(f.key)),before);
});
test('published review events are immutable, idempotent and isolated in the root collection',async()=>{
 const f=fixture();f.setRole('learner');f.docs.get(f.key).published=true;const before=JSON.stringify(f.docs.get(f.key));
 const event={eventId:'mlr:200:0123456789abcdef',assessmentId:f.assessmentId,questionId:'q0',correct:true,status:'correct',reviewedAt:200};
 await f.api.saveReviewEvent(f.user,event);const stored=JSON.stringify([...f.docs]);await f.api.saveReviewEvent(f.user,{...event});assert.equal(JSON.stringify([...f.docs]),stored);
 assert(f.docs.has('mockLearningReviews/learner/events/'+event.eventId));assert.equal((await f.api.listReviewEvents(f.user)).length,1);assert.equal(JSON.stringify(f.docs.get(f.key)),before);
 await assert.rejects(f.api.saveReviewEvent(f.user,{...event,correct:false,status:'wrong'}),/이미 저장/);assert.equal(JSON.stringify([...f.docs]),stored);
 assert(f.reads.filter(r=>r.key==='mockLearningReviews/learner/events').every(r=>r.options?.source==='server'));
 await assert.rejects(f.api.listReviewEvents('other'),/접근/);
 await assert.rejects(f.api.saveReviewEvent('other',{...event,assessmentId:'mock:other:week:first'}),/접근/);
});
test('review events require a real published source, valid answer status and bounded timestamps',async()=>{
 const event=f=>({eventId:'mlr:200:0123456789abcdef',assessmentId:f.assessmentId,questionId:'q0',correct:false,status:'wrong',reviewedAt:200});
 for(const alter of [e=>e.status='correct',e=>e.correct=null,e=>e.eventId='unsafe/path',e=>e.reviewedAt=0,e=>e.reviewedAt=Date.now()+600000,e=>e.questionId='unknown',e=>e.reviewedAt=100,e=>e.extra=true]){const f=fixture();f.docs.get(f.key).published=true;const e=event(f);alter(e);await assert.rejects(f.api.saveReviewEvent(f.user,e));assert.equal(f.docs.size,1);}
 const f=fixture();await assert.rejects(f.api.saveReviewEvent(f.user,event(f)),/공개된 시험/);assert.equal(f.docs.size,1);f.docs.delete(f.key);await assert.rejects(f.api.saveReviewEvent(f.user,event(f)),/공개된 시험/);
});
test('unauthorized or ambiguous writes cannot select or silently clear a baseline',async()=>{
 const f=fixture();await f.api.set(f.user,{assessmentId:f.assessmentId,confirmedUnassisted:true});const before=JSON.stringify([...f.docs]);
 f.setRole('learner');await assert.rejects(f.api.set(f.user,{assessmentId:null,confirmedUnassisted:false}),/관리자/);f.setRole('admin');
 for(const value of [undefined,{}, {assessmentId:f.assessmentId,confirmedUnassisted:false},{assessmentId:null,confirmedUnassisted:true},{assessmentId:'mock:other:week:first',confirmedUnassisted:true},{assessmentId:f.assessmentId+'/bad',confirmedUnassisted:true}])await assert.rejects(f.api.set(f.user,value));
 assert.equal(JSON.stringify([...f.docs]),before);
});
test('selection rejects unfinished, cross-learner, assisted, malformed and duplicate exam evidence',async()=>{
 const changes=[d=>d.learnerId='other',d=>d.payload.userId='other',d=>d.payload.assessmentId='different',d=>d.payload.status='paper',d=>d.payload.submittedAt=0,d=>d.payload.submittedAt='100',d=>d.payload.sections=[],d=>d.payload.sections[0].state='active',d=>d.payload.sections.reverse(),d=>d.payload.integrity.translationDetected=true,d=>d.payload.initialAttempts[0].correct=null,d=>d.payload.initialAttempts[0].subject='grammar',d=>d.payload.initialAttempts[0].questionId='unknown',d=>d.payload.initialAttempts[0]=d.payload.initialAttempts[1],d=>d.payload.questions[0]=d.payload.questions[1]];
 for(const change of changes){const f=fixture();change(f.docs.get(f.key));const before=JSON.stringify(f.docs.get(f.key));await assert.rejects(f.api.set(f.user,{assessmentId:f.assessmentId,confirmedUnassisted:true}));assert.equal(f.docs.has(f.settingsKey),false);assert.equal(JSON.stringify(f.docs.get(f.key)),before);}
 const f=fixture();f.docs.delete(f.key);await assert.rejects(f.api.set(f.user,{assessmentId:f.assessmentId,confirmedUnassisted:true}));
});
test('malformed server settings fail closed rather than returning a usable selection',async()=>{
 const changes=[d=>d.learnerId='other',d=>d.scope='all',d=>d.schemaVersion=2,d=>d.assessmentId='mock:other:week:first',d=>d.assessmentId='',d=>d.confirmedUnassisted=false,d=>d.updatedAt=0,d=>d.updatedBy='',d=>d.extra=true,d=>delete d.updatedBy,d=>{d.assessmentId=null;}];
 for(const change of changes){const f=fixture();await f.api.set(f.user,{assessmentId:f.assessmentId,confirmedUnassisted:true});change(f.docs.get(f.settingsKey));await assert.rejects(f.api.get(f.user),/진단 기준/);}
 const f=fixture();for(const user of [null,{},'',' ','bad/path'])await assert.rejects(f.api.get(user),/학습자 식별자/);
});

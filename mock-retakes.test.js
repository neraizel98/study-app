const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){
 const prefs=new Map(),reports=[],app={LocalRepository:{getActiveUser:()=> 'learner',getPreference:(k,d)=>prefs.has(k)?structuredClone(prefs.get(k)):d,setPreference:(k,v)=>prefs.set(k,structuredClone(v)),listReports:()=>structuredClone(reports),saveReports:(_,rows)=>reports.splice(0,reports.length,...structuredClone(rows)),flush:async()=>{}},MockExamBank:{grade:(q,a)=>({correct:q.answer===a})}};
 const c={SmartStudy:app,Date,console,setTimeout,clearTimeout};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('mock-exam.js','utf8'),c);
 const bank=n=>({complete:true,items:Object.entries(app.MockExam.areas).flatMap(([subject,count])=>Array.from({length:count},(_,i)=>({id:`r${n}:${subject}:${i}`,subject,question:`${subject} different scenario ${n}-${i}`,answer:'A',choices:['A','B','C'],context:{unitId:'known'}})))});
 return {api:app.MockExam,app,bank,prefs,reports};
}
const now=Date.parse('2026-10-24T18:00:00+09:00');
function finish(s,d,at){for(let n=0;n<4;n++){const sec=d.sections.find(x=>x.state==='active');for(const q of s.api.questionsFor(d,sec))s.api.answer('learner',d.assessmentId,q.id,q.answer,at+n);d=s.api.finishSection('learner',d.assessmentId,at+n+1,sec.id);if(d.break&&!d.break.endedAt)d=s.api.skipBreak('learner',d.assessmentId,at+n+1);}return d;}
test('three same-day exams preserve all IDs, rounds, answers and independent publication submissions',async()=>{
 const s=setup(),sent=new Map();s.app.MockPublication={submit:async(_,snapshot)=>{sent.set(snapshot.assessmentId,structuredClone(snapshot));return {saved:true};}};
 const one=finish(s,s.api.create('learner',s.bank(1),now),now+100),frozen=JSON.stringify(one);
 await s.api.sync('learner',one.assessmentId);
 const two=finish(s,s.api.create('learner',s.bank(2),now+1000,{retake:true}),now+1100);await s.api.sync('learner',two.assessmentId);
 const three=finish(s,s.api.create('learner',s.bank(3),now+2000,{retake:true}),now+2100);await s.api.sync('learner',three.assessmentId);
 assert.deepEqual(Array.from(s.api.list('learner',one.scheduledWeekId),d=>d.attemptNo),[1,2,3]);assert.equal(s.api.get('learner',one.scheduledWeekId).assessmentId,three.assessmentId);
 assert.equal(sent.size,3);assert.equal(new Set(s.reports.map(r=>r.sessionId)).size,24);assert.equal(s.reports.reduce((n,r)=>n+r.totalQuestions,0),165);
 assert(s.reports.filter(r=>r.metadata.assessmentId===three.assessmentId).every(r=>r.round===3&&r.metadata.attemptNo===3&&r.metadata.parentAttemptId===two.assessmentId));
 const saved=s.api.getById('learner',one.assessmentId);delete saved.syncStatus;const original=JSON.parse(frozen);delete original.syncStatus;assert.deepEqual(JSON.parse(JSON.stringify(saved)),original);
 assert([...sent.values()].every(d=>d.resultVisibility==='withheld'&&d.initialAttempts.length===55));
 // Saving/reconciling an old exam must not redirect writes to the latest round.
 await s.api.sync('learner',one.assessmentId);assert.equal(s.api.get('learner',one.scheduledWeekId).attemptNo,3);assert.equal(sent.size,3);
});
test('an unfinished exam and repeated questions cannot be replaced by a new attempt',()=>{
 const s=setup(),one=s.api.create('learner',s.bank(1),now);
 assert.throws(()=>s.api.create('learner',s.bank(2),now+1,{retake:true}),/진행 중/);
 const done=finish(s,one,now+100);const before=JSON.stringify(s.api.list('learner',done.scheduledWeekId));
 const duplicate=s.bank(1);duplicate.items=duplicate.items.map(q=>({...q,id:q.id+'renamed'}));
 assert.throws(()=>s.api.create('learner',duplicate,now+1000,{retake:true}),/겹치는/);
 assert.equal(JSON.stringify(s.api.list('learner',done.scheduledWeekId)),before);
});
test('server history lists every attempt and publication changes only the selected exam',async()=>{
 const docs=new Map(),week='2026-10-19';
 for(let round=1;round<=3;round++){const assessmentId=`mock:learner:${week}:attempt-${round}`;docs.set('learner|'+assessmentId,{learnerId:'learner',assessmentId,published:false,payload:{userId:'learner',assessmentId,scheduledWeekId:week,attemptNo:round,submittedAt:now+round,questions:[{id:'q'+round}],initialAttempts:[{questionId:'q'+round}]}});}
 docs.set('other|x',{learnerId:'other',assessmentId:'x',payload:{userId:'other',scheduledWeekId:week}});
 const snapshot=id=>({id,exists:docs.has(id),data:()=>docs.get(id)}),ref=id=>({id,get:async()=>snapshot(id)});
 const db={collection:()=>({doc:ref,where:(field,op,value)=>query([[field,value]])}),runTransaction:async fn=>fn({get:async r=>snapshot(r.id),update:(r,patch)=>docs.set(r.id,{...docs.get(r.id),...patch}),set:(r,data)=>docs.set(r.id,data)})};
 function query(filters){return {where:(field,op,value)=>query([...filters,[field,value]]),get:async()=>({docs:[...docs].filter(([,d])=>filters.every(([field,v])=>field.split('.').reduce((x,k)=>x?.[k],d)===v)).map(([id])=>snapshot(id))})};}
 const app={FirebaseClient:{getDB:async()=>db,getCurrentUser:async()=>({uid:'admin'})},LocalRepository:{getActiveUser:()=> 'learner',listReports:()=>[],saveReports:()=>{}}};
 const c={SmartStudy:app,firebase:{firestore:{FieldValue:{serverTimestamp:()=>now}}},Date,console,setTimeout,clearTimeout};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('firestore-repository.js','utf8'),c);app.FirestoreRepository.getAccess=async()=>({role:'admin'});
 const rows=await app.MockPublication.list('learner',{week});assert.equal(rows.length,3);assert(rows.every(r=>r.learnerId==='learner'));
 const id=rows.find(r=>r.payload.attemptNo===2).assessmentId;await app.MockPublication.publish('learner',id);
 assert.equal((await app.MockPublication.get('learner',id)).published,true);
 const after=await app.MockPublication.list('learner',{week});assert.equal(after.filter(r=>r.published).length,1);assert.equal(after.find(r=>r.published).payload.attemptNo,2);
});
test('a delayed week-alias upload marks only its original round synced',async()=>{
 const s=setup(),one=finish(s,s.api.create('learner',s.bank(1),now),now+100);let release;
 s.app.MockPublication={submit:()=>new Promise(resolve=>release=resolve)};
 const pending=s.api.sync('learner',one.scheduledWeekId);while(!release)await new Promise(resolve=>setTimeout(resolve,0));
 const two=s.api.create('learner',s.bank(2),now+1000,{retake:true});release({saved:true});assert((await pending).synced);
 assert.equal(s.api.getById('learner',one.assessmentId).syncStatus,'synced');assert.equal(s.api.getById('learner',two.assessmentId).syncStatus,'not-submitted');
});
test('lost indexes recover exact-ID drafts and server rounds restore without replacing an active local exam',()=>{
 const s=setup(),one=finish(s,s.api.create('learner',s.bank(1),now),now+100),two=finish(s,s.api.create('learner',s.bank(2),now+1000,{retake:true}),now+1100);
 s.prefs.delete('SmartStudy_MockExam_Index_learner');assert.equal(s.api.getById('learner',one.assessmentId).attemptNo,1);assert.equal(s.api.getById('learner',two.assessmentId).attemptNo,2);
 const device=setup();device.api.restore('learner',[{learnerId:'learner',published:true,payload:one},{learnerId:'learner',published:false,payload:two},{learnerId:'other',payload:{...two,userId:'other'}}]);
 assert.equal(device.api.get('learner',one.scheduledWeekId).attemptNo,2);assert.equal(device.api.getById('learner',one.assessmentId).resultVisibility,'published');assert.equal(device.api.list('learner',one.scheduledWeekId).length,2);
 const active=device.api.create('learner',device.bank(3),now+2000,{retake:true}),before=JSON.stringify(active);device.api.restore('learner',[{learnerId:'learner',payload:{...active,status:'submitted',submittedAt:now+3000}}]);assert.equal(JSON.stringify(device.api.getById('learner',active.assessmentId)),before);
});

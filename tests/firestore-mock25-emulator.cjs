'use strict';
// Run only against a local emulator: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
// SCIENCE_RULES_RUNTIME points to the isolated npm runtime, never a production Firebase project.
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const runtime=process.env.SCIENCE_RULES_RUNTIME||path.resolve(__dirname,'../../work/science-rules-runtime');
const isolated=createRequire(path.join(runtime,'package.json'));
const {initializeTestEnvironment,assertSucceeds,assertFails}=isolated('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,updateDoc,serverTimestamp}=isolated('firebase/firestore');
const projectId='demo-science-rules';
const assert=require('node:assert/strict');
if(!process.env.FIRESTORE_EMULATOR_HOST||!projectId.startsWith('demo-'))throw new Error('A local demo Firestore emulator is required. Production access is forbidden.');
const [host,portText]=process.env.FIRESTORE_EMULATOR_HOST.split(':'),port=Number(portText),results=[];
const copy=x=>JSON.parse(JSON.stringify(x));
const definitions=[['reading',['reading','korean_vocab'],2100],['english',['english','grammar','english_reading'],2100],['math',['math','math_formula'],2100],['hanja',['hanja'],1500],['science',['science'],2100]];
function payload(version,name){
 const own=version==='science125-v1'?definitions:definitions.slice(0,4),questions=own.flatMap(([id])=>Array.from({length:25},(_,i)=>({id:id+'-'+i,subject:id,kind:'choice',question:id+' '+i,choices:['A','B'],answer:'A'}))),initialAttempts=questions.map(q=>({questionId:q.id,subject:q.subject,correct:false}));
 return {examVersion:version,assessmentId:'mock:learner:2026-11-16:attempt-1-paper-'+name,userId:'learner',scheduledWeekId:'2026-11-16',kind:'mock',status:'submitted',submittedAt:1,attemptNo:1,questions,initialAttempts,reports:own.map(([subject])=>({subject})),quotas:{reading:18,korean_vocab:7,english:7,grammar:6,english_reading:12,math:20,math_formula:5,hanja:25,...(version==='science125-v1'?{science:25}:{})},sections:own.map(([id,subjects,durationSeconds])=>({id,subjects,durationSeconds,state:'ended',initialAttempts:initialAttempts.filter(a=>subjects.includes(a.subject))}))};
}
function paper(p){const x=copy(p);x.status='paper';x.mode='paper';x.sections=x.sections.map(({initialAttempts,...s})=>({...s,state:'pending'}));for(const k of ['submittedAt','initialAttempts','reports'])delete x[k];return x;}
async function main(){
 const env=await initializeTestEnvironment({projectId,firestore:{host,port,rules:fs.readFileSync(path.resolve(__dirname,'../firestore.rules'),'utf8')}}),student=env.authenticatedContext('student').firestore(),admin=env.authenticatedContext('admin').firestore();
 const ref=(db,p)=>doc(db,'mockExamResults',p.userId+'|'+p.assessmentId),record=(p,uid)=>({learnerId:p.userId,assessmentId:p.assessmentId,payload:p,published:false,publishedAt:null,publishedBy:null,createdBy:uid,createdAt:serverTimestamp()});
 let serial=0;
 async function check(name,fn){try{await fn();results.push({name,ok:true});console.log('PASS '+name);}catch(e){results.push({name,ok:false,error:String(e.message||e)});console.log('FAIL '+name+': '+String(e.message||e).split('\n')[0]);}}
 async function create(version,name,edit,allowed=true){const p=payload(version,'case'+(++serial));edit?.(p);await check(version+' '+name,()=>(allowed?assertSucceeds:assertFails)(setDoc(ref(student,p),record(p,'student'))));}
 try{
 await env.clearFirestore();await env.withSecurityRulesDisabled(async c=>{for(const [id,role] of [['student','learner'],['admin','admin']])await setDoc(doc(c.firestore(),'access',id),{role,learnerIds:['learner']});});
 for(const version of ['classic100-v1','science125-v1']){
 await create(version,'valid online',null);
 await create(version,'variable component weights',p=>Object.assign(p.quotas,{reading:1,korean_vocab:24,english:0,grammar:25,english_reading:0,math:25,math_formula:0}));
 await create(version,'question count rejected',p=>p.questions.pop(),false);
 await create(version,'total initial attempts rejected',p=>p.initialAttempts.pop(),false);
 await create(version,'section attempts rejected',p=>p.sections[0].initialAttempts.pop(),false);
 await create(version,'area quota sum rejected',p=>p.quotas.grammar++,false);
 await create(version,'hanja quota rejected',p=>p.quotas.hanja=24,false);
 await create(version,'science quota rejected',p=>p.quotas.science=24,false);
 await create(version,'reports count rejected',p=>p.reports.pop(),false);
 await create(version,'negative quota rejected',p=>Object.assign(p.quotas,{reading:-1,korean_vocab:26}),false);
 await create(version,'fractional quota rejected',p=>Object.assign(p.quotas,{math:20.5,math_formula:4.5}),false);
 await create(version,'old duration rejected',p=>p.sections[0].durationSeconds=1200,false);
 await create(version,'section subjects rejected',p=>p.sections[1].subjects=['english'],false);
 await create(version,'missing section rejected',p=>p.sections.pop(),false);
 await create(version,'unknown version rejected',p=>p.examVersion='unknown',false);
 await create(version,'missing version rejected',p=>delete p.examVersion,false);
 const full=payload(version,'paper'+(++serial)),p=paper(full),g={...copy(full),mode:'paper',integrity:{source:'paper-omr'}};
 await check(version+' admin paper create',()=>assertSucceeds(setDoc(ref(admin,p),record(p,'admin'))));
 const learnerPaper=paper(payload(version,'learner'+(++serial)));await check(version+' learner paper denied',()=>assertFails(setDoc(ref(student,learnerPaper),record(learnerPaper,'student'))));
 await check(version+' premature publication denied',()=>assertFails(updateDoc(ref(admin,p),{published:true,publishedAt:serverTimestamp(),publishedBy:'admin'})));
 await check(version+' student grading denied',()=>assertFails(updateDoc(ref(student,p),{payload:g})));
 const wrong=copy(g);wrong.examVersion=version==='classic100-v1'?'science125-v1':'classic100-v1';await check(version+' version change denied',()=>assertFails(updateDoc(ref(admin,p),{payload:wrong})));
 const altered=copy(g);altered.questions[0].question='changed';await check(version+' printed question change denied',()=>assertFails(updateDoc(ref(admin,p),{payload:altered})));
 const quotaChange=copy(g);quotaChange.quotas.reading--;quotaChange.quotas.korean_vocab++;await check(version+' printed quotas immutable',()=>assertFails(updateDoc(ref(admin,p),{payload:quotaChange})));
 await check(version+' OMR submit within evaluator budget',()=>assertSucceeds(updateDoc(ref(admin,p),{payload:g})));
 await check(version+' publication within evaluator budget',()=>assertSucceeds(updateDoc(ref(admin,p),{published:true,publishedAt:serverTimestamp(),publishedBy:'admin'})));
 await check(version+' published payload immutable',()=>assertFails(updateDoc(ref(admin,p),{'payload.initialAttempts':[]})));
 }
 for(const count of [100,125]){
 const fixturePath=path.resolve(__dirname,'../scratch/mock25-actual'+count+'.json');
 if(!fs.existsSync(fixturePath))continue;
 const {paper:actualPaper,result:actualResult}=JSON.parse(fs.readFileSync(fixturePath,'utf8'));
 // Fixtures may reuse a saved round ID; isolate each version without rewriting its snapshot.
 await env.clearFirestore();
 // Grant only this local fixture learner; the project remains a demo emulator.
 await env.withSecurityRulesDisabled(async c=>{await setDoc(doc(c.firestore(),'access','admin'),{role:'admin',learnerIds:[actualPaper.userId]});});
 await check('actual '+count+' snapshot size under Firestore document limit',async()=>{
 for(const payload of [actualPaper,actualResult]){
 const bytes=Buffer.byteLength(JSON.stringify(record(payload,'admin')),'utf8');
 console.log('ACTUAL '+count+' '+payload.status+' JSON bytes '+bytes);
 assert(bytes<1048576,'snapshot JSON exceeds Firestore document limit: '+bytes);
 }
 });
 await check('actual '+count+' authored paper accepted by SDK and rules',()=>assertSucceeds(setDoc(ref(admin,actualPaper),record(actualPaper,'admin'))));
 await check('actual '+count+' OMR transition within evaluator budget and document size',()=>assertSucceeds(updateDoc(ref(admin,actualPaper),{payload:actualResult})));
 await check('actual '+count+' publish submitted result',()=>assertSucceeds(updateDoc(ref(admin,actualPaper),{published:true,publishedAt:serverTimestamp(),publishedBy:'admin'})));
 await check('actual '+count+' persisted submitted snapshot preserved',async()=>{
 const saved=(await getDoc(ref(admin,actualPaper))).data();assert.equal(saved.published,true);assert.deepEqual(saved.payload,actualResult);
 });
 }
 }finally{await env.cleanup();}
 console.log(JSON.stringify({passed:results.filter(x=>x.ok).length,failed:results.filter(x=>!x.ok).length}));if(results.some(x=>!x.ok))process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});

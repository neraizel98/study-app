'use strict';
// Run only against a local emulator: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
// SCIENCE_RULES_RUNTIME points to the isolated npm runtime, never a production Firebase project.
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const runtime=process.env.SCIENCE_RULES_RUNTIME||path.resolve(__dirname,'../../work/science-rules-runtime');
const isolated=createRequire(path.join(runtime,'package.json'));
const {initializeTestEnvironment,assertSucceeds,assertFails}=isolated('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,updateDoc,serverTimestamp}=isolated('firebase/firestore');
const projectId='demo-science-rules';
if(!process.env.FIRESTORE_EMULATOR_HOST||!projectId.startsWith('demo-'))throw new Error('A local demo Firestore emulator is required. Production access is forbidden.');
const [host,portText]=process.env.FIRESTORE_EMULATOR_HOST.split(':'),port=Number(portText),results=[];
const copy=x=>JSON.parse(JSON.stringify(x));
const definitions=[['reading',['reading','korean_vocab'],15,1200],['english',['english','grammar','english_reading'],15,1200],['math',['math','math_formula'],15,1200],['hanja',['hanja'],10,600],['science',['science'],20,1500]];
function payload(version='science75-v1',name='first'){
 const own=version==='science75-v1'?definitions:definitions.slice(0,4),questions=own.flatMap(([id,,n])=>Array.from({length:n},(_,i)=>({id:id+'-'+i,subject:id,kind:'choice',question:id+' 문항 '+i,choices:['A','B','C','D'],answer:'A'}))),initialAttempts=questions.map(q=>({questionId:q.id,subject:q.subject,question:q.question,choices:q.choices,selectedAnswer:'B',correctAnswer:'A',correct:false}));
 const p={schemaVersion:1,examVersion:version,assessmentId:'mock:learner:2026-11-09:'+name,userId:'learner',scheduledWeekId:'2026-11-09',kind:'mock',status:'submitted',submittedAt:1000,startedAt:1,questions,initialAttempts,reports:own.map(([id])=>({subject:id})),quotas:{reading:15,korean_vocab:0,english:15,grammar:0,english_reading:0,math:15,math_formula:0,hanja:10,...(version==='science75-v1'?{science:20}:{})},sections:own.map(([id,subjects,n,durationSeconds])=>({id,subjects,durationSeconds,state:'ended',initialAttempts:initialAttempts.filter(a=>subjects.includes(a.subject))}))};return p;
}
function printed(name){const p=payload('science75-v1','attempt-1-paper-'+name);p.mode='paper';p.status='paper';p.attemptNo=1;p.paper={timeLimits:{reading:20,english:20,math:20,hanja:10,science:25}};p.sections=p.sections.map(({initialAttempts,...s})=>({...s,state:'pending'}));for(const k of ['submittedAt','initialAttempts','reports','responses'])delete p[k];return p;}
function graded(p){const full=payload('science75-v1');return {...copy(p),status:'submitted',submittedAt:2000,initialAttempts:full.initialAttempts,reports:full.reports,sections:full.sections,integrity:{source:'paper-omr'}};}
async function main(){
 const env=await initializeTestEnvironment({projectId,firestore:{host,port,rules:fs.readFileSync(path.resolve(__dirname,'../firestore.rules'),'utf8')}});
 const student=env.authenticatedContext('student').firestore(),admin=env.authenticatedContext('admin').firestore(),foreign=env.authenticatedContext('foreign').firestore();
 const ref=(db,p)=>doc(db,'mockExamResults',p.userId+'|'+p.assessmentId),record=(p,uid)=>({learnerId:p.userId,assessmentId:p.assessmentId,payload:p,published:false,publishedAt:null,publishedBy:null,createdBy:uid,createdAt:serverTimestamp()});
 async function check(name,fn){try{await fn();results.push({name,ok:true});console.log('PASS '+name);}catch(e){results.push({name,ok:false,error:String(e.message||e)});console.log('FAIL '+name+': '+String(e.message||e).split('\n')[0]);}}
 let number=0;
 async function createCase(name,edit,allow=true,db=student,uid='student'){const p=payload('science75-v1','attempt-2-case'+(++number));edit?.(p);return check(name,()=> (allow?assertSucceeds:assertFails)(setDoc(ref(db,p),record(p,uid))));}
 try{
  await env.clearFirestore();await env.withSecurityRulesDisabled(async c=>{const db=c.firestore();for(const [id,data] of Object.entries({student:{role:'learner',learnerIds:['learner']},admin:{role:'admin',learnerIds:['learner']},foreign:{role:'learner',learnerIds:['someone-else']}}))await setDoc(doc(db,'access',id),data);});
  await createCase('valid science75 online submission',null);
  await createCase('versioned legacy55 submission',p=>Object.assign(p,payload('legacy55-v1','attempt-2-legacy')));
  await createCase('unversioned legacy55 submission',p=>{Object.assign(p,payload('legacy55-v1','attempt-2-unversioned'));delete p.examVersion;});
  await createCase('75 without examVersion denied',p=>delete p.examVersion,false);
  await createCase('unknown examVersion denied',p=>p.examVersion='science75-v99',false);
  await createCase('75 labelled legacy55 denied',p=>p.examVersion='legacy55-v1',false);
  await createCase('foreign learner create denied',null,false,foreign,'foreign');
  await createCase('74 questions denied',p=>p.questions.pop(),false);
  await createCase('74 first attempts denied',p=>p.initialAttempts.pop(),false);
  await createCase('missing science section denied',p=>p.sections.pop(),false);
  await createCase('wrong science section count denied',p=>p.sections[4].initialAttempts.pop(),false);
  await createCase('wrong science section subjects denied',p=>p.sections[4].subjects=['english'],false);
  await createCase('wrong duration snapshot denied',p=>p.sections[4].durationSeconds=60,false);
  await createCase('negative quota hidden by component sum denied',p=>{p.quotas.reading=-1;p.quotas.korean_vocab=16;},false);
  await createCase('fractional quota hidden by component sum denied',p=>{p.quotas.reading=14.5;p.quotas.korean_vocab=.5;},false);
  await createCase('science75 with four reports denied',p=>p.reports.pop(),false);
  await createCase('reports map denied',p=>p.reports={length:5},false);
  const {setup}=require('./helpers/mock-transfer-fixture.cjs'),vm=require('node:vm'),actualNow=Date.parse('2026-11-13T10:00:00+09:00'),fixture=setup(actualNow);
  for(const file of ['ScienceData.js','ScienceLifeEarthExpansion.js','SciencePhysicalExpansion.js','science-policy.js','ScienceMockPhysical.js','ScienceMockData.js','ScienceMockLifeEarthExpansion.js','ScienceMockPhysicalExpansion.js'])vm.runInContext(fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),fixture.c,{filename:file});
  const unit=fixture.c.ScienceData.units.find(u=>u.id==='l1-earth-moon-seasons');fixture.reports.push({userId:'learner',subject:'science',sessionId:'actual-science',date:actualNow,totalQuestions:10,initialScore:8,metadata:{source:'science',levelId:unit.levelId,unitId:unit.id,initialAttempts:unit.questions.slice(0,10).map((q,i)=>({questionId:q.id,question:q.question,correctAnswer:q.correctAnswer,correct:i<8,round:1}))}});
  const bank=fixture.api.build('learner',actualNow),exam=fixture.c.SmartStudy.MockExam,actualPaper={examVersion:'science75-v1',assessmentId:'mock:learner:2026-11-09:attempt-1-paper-actual',userId:'learner',scheduledWeekId:'2026-11-09',attemptNo:1,kind:'mock',mode:'paper',status:'paper',bankVersion:bank.version,scopeCutoffAt:actualNow,scheduledDate:'2026-11-13',questions:bank.items,quotas:bank.quotas,sections:exam.contract(bank).definitions.map(s=>({...s,durationSeconds:s.minutes*60,state:'pending'})),startedAt:actualNow,paper:{timeLimits:{}}};
  const actual=copy(exam.paperResult(actualPaper,Object.fromEntries(bank.items.map(q=>[q.id,q.answer])),actualNow+1));
  await check('actual authored75 snapshot accepted by Firestore SDK and rules',()=>assertSucceeds(setDoc(ref(student,actual),record(actual,'student'))));
  const privacy=payload('science75-v1','attempt-2-privacy');await assertSucceeds(setDoc(ref(student,privacy),record(privacy,'student')));
  await check('foreign learner cannot read results',()=>assertFails(getDoc(ref(foreign,privacy))));
  await check('student cannot self-publish',()=>assertFails(updateDoc(ref(student,privacy),{published:true,publishedAt:serverTimestamp(),publishedBy:'student'})));
  await check('KNOWN LIMIT: linked student can raw-read unpublished answer payload under existing policy',()=>assertSucceeds(getDoc(ref(student,privacy))));
  await check('admin can inspect unpublished result',()=>assertSucceeds(getDoc(ref(admin,privacy))));
  await check('admin publication transition allowed',()=>assertSucceeds(updateDoc(ref(admin,privacy),{published:true,publishedAt:serverTimestamp(),publishedBy:'admin'})));
  await check('student can read published result',()=>assertSucceeds(getDoc(ref(student,privacy))));
  await check('published first answers cannot be overwritten',()=>assertFails(updateDoc(ref(admin,privacy),{'payload.initialAttempts':[]})));
  const p=printed('valid'),g=graded(p);await check('admin can create paper75',()=>assertSucceeds(setDoc(ref(admin,p),record(p,'admin'))));
  const deniedPaper=printed('learner');await check('student cannot create paper75',()=>assertFails(setDoc(ref(student,deniedPaper),record(deniedPaper,'student'))));
  await check('paper cannot be published before OMR grading',()=>assertFails(updateDoc(ref(admin,p),{published:true,publishedAt:serverTimestamp(),publishedBy:'admin'})));
  await check('student cannot grade paper',()=>assertFails(updateDoc(ref(student,p),{payload:g})));
  const changed=copy(g);changed.questions[0].question='changed';await check('OMR cannot replace printed questions',()=>assertFails(updateDoc(ref(admin,p),{payload:changed})));
  const version=copy(g);version.examVersion='legacy55-v1';await check('OMR cannot change saved version',()=>assertFails(updateDoc(ref(admin,p),{payload:version})));
  const duration=copy(g);duration.sections[4].durationSeconds=1200;await check('OMR cannot change duration contract',()=>assertFails(updateDoc(ref(admin,p),{payload:duration})));
  await check('admin can grade same paper once',()=>assertSucceeds(updateDoc(ref(admin,p),{payload:g})));
  await check('submitted OMR result cannot be regraded',()=>assertFails(updateDoc(ref(admin,p),{payload:{...g,submittedAt:3000}})));
 }finally{await env.cleanup();fs.writeFileSync(path.resolve(__dirname,'../science-firestore-emulator-results.json'),JSON.stringify({projectId,host,port,knownLimitations:['Existing canUse read permits linked learners to raw-read unpublished answers; UI publication gate remains separate. No privacy migration is included.'],passed:results.filter(x=>x.ok).length,failed:results.filter(x=>!x.ok).length,cases:results},null,2));}
 console.log(JSON.stringify({knownLimitations:['Existing canUse read permits linked learners to raw-read unpublished answers; UI publication gate remains separate. No privacy migration is included.'],passed:results.filter(x=>x.ok).length,failed:results.filter(x=>!x.ok).length}));if(results.some(x=>!x.ok))process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});

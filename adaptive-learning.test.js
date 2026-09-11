const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
let now = new Date('2026-09-11T10:00:00+09:00').getTime();
class Clock extends Date { static now() { return now; } }
let reports = [], wrong = {};
const repo = { getActiveUser:()=> 'test', getUser:()=>null, getDeviceId:()=> 'test-device',
    listReports:()=>structuredClone(reports), saveReports:r=>{ reports=structuredClone(r); },
    getWrongAnswers:()=>structuredClone(wrong), saveWrongAnswers:(user,data)=>{wrong=structuredClone(data);} };
// saveReports uses (userId, data), like the actual repository.
repo.saveReports=(user,data)=>{reports=structuredClone(data);};
const sandbox={console, Date:Clock, window:{SmartStudy:{LocalRepository:repo}}, setInterval, clearInterval};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('report.js','utf8'),sandbox);
const {LearningPolicy:P, WrongNote:W, saveQuizResult:save}=sandbox.window;
sandbox.window.UserSession.getUserData = () => null;
const day=P.day;
const event=(d,status,extra={})=>({date:now+d*day,sessionId:`s${d}`,round:1,eventId:`${d}:${status}`,status,contentVersion:P.version,...extra});
let events=[event(0,'wrong'),event(.01,'correct')];
for(let i=0;i<20;i++)events.push(event(.02+i/1000,'correct',{sessionId:'s0'}));
assert.equal(P.review(events).masteryScore,0,'same-day repetition never masters');
const due=P.review(events).dueAt;
events.push(event(1.01,'correct',{assisted:true}));
assert.equal(P.review(events).masteryScore,0,'hints never pass memory check');
events.push(event(1.02,'correct'));
assert.equal(P.review(events).masteryScore,1);
events.push(event(3.02,'correct'));
assert.equal(P.review(events).masteryScore,2);
events.push(event(7.02,'correct'));
assert.equal(P.review(events).isMastered,true);
assert.equal(P.review([...events].reverse()).isMastered,true,'merge order independent');
assert.equal(P.review([...events,event(8,'wrong')]).masteryScore,0,'new failure resets');
assert.equal(P.isDue({dueAt:now+day}),false);
assert.equal(P.isDue({invalid:true}),false);
assert.equal(P.review([event(0,'correct'),event(0,'wrong')]).reviewStage,'scheduled','timestamp ties have deterministic ordering');
assert.equal(P.review([event(0,'correct',{contentVersion:'legacy'}),event(1,'correct',{contentVersion:'legacy'})]).isMastered,false);

const row=(i,correct=10,unit='level1',extra={})=>({subject:'english',date:now+i*day,metadata:{contentVersion:P.version,context:unit,
    initialAttempts:Array.from({length:10},(_,j)=>({question:`${i}-${j}`,correct:j<correct})),...extra}});
assert.equal(P.evaluate([row(0)],'english','level1').name,'foundation');
assert.equal(P.evaluate([row(0),row(1),row(2)],'english','level1').name,'standard');
assert.equal(P.evaluate([row(0),row(1),row(2),row(3)],'english','level1').name,'standard','no immediate double promotion');
assert.equal(P.evaluate(Array.from({length:6},(_,i)=>row(i)),'english','level1').name,'challenge');
assert.equal(P.evaluate([row(0),row(1),row(2)],'english','level2').name,'foundation');
assert.equal(P.evaluate(Array.from({length:6},(_,i)=>row(i,10,'level1',{review:true})),'english','level1').samples,0);
const repeated=Array.from({length:8},(_,i)=>({...row(0),date:now+i*day}));
assert.equal(P.evaluate(repeated,'english','level1').samples,20,'weekly recheck can count despite daily practice');
assert.equal(P.evaluate(Array.from({length:6},(_,i)=>({...row(i),date:now+i*1000})),'english','level1').name,'foundation','multiple days required');
assert.equal(P.evaluate([row(0),row(1),row(2),row(3,6),row(4,6)],'english','level1').name,'foundation');

save('one','english','Lv1',2,0,0,10,false,{unitId:'level1',attempts:[{question:'A',correct:false},{question:'B',correct:false}]});
now+=1000;
save('one','english','Lv1',2,2,2,20,true,{unitId:'level1',attempts:[{question:'A',correct:true},{question:'B',correct:true}]});
assert.equal(reports[0].initialScore,0);
assert.equal(reports[0].metadata.initialAttempts[0].correct,false);
assert.equal(reports[0].metadata.attempts[0].correct,true);
W.save('math',{type:'volume_reverse',levelId:'1',semesterId:'1',unitId:'a',question:'A'},'wrong','a',1);
W.save('math',{type:'volume_reverse',levelId:'1',semesterId:'1',unitId:'b',question:'B'},'wrong','a',1);
assert.equal(wrong.math.length,2,'same generator in separate units stays separate');
W.save('math',{type:'volume_reverse',levelId:'1',semesterId:'1',unitId:'a',question:'A'},'correct','a',1);
assert.equal(wrong.math[0].history[0].status,'wrong','first error is preserved');
assert.equal(wrong.math[0].history.length,2);
W.save('math',{type:'volume_reverse',levelId:'1',semesterId:'1',unitId:'a',question:'A'},'correct','a',1);
assert.equal(wrong.math[0].history.length,2,'duplicate writes are idempotent');

const sync={window:{LearningPolicy:P,SmartStudy:{LocalRepository:{},FirestoreRepository:{},StorageEvents:{subscribe(){}},FirebaseClient:{}}},console,document:{addEventListener(){}},setTimeout,clearTimeout};
vm.createContext(sync);vm.runInContext(fs.readFileSync('firebase-sync.js','utf8'),sync);
const merged=sync._mergeWrong({english:[{word:'test',history:events.slice(0,10),date:now}]},{english:[{word:'test',history:events.slice(10),date:now+1}]});
assert.equal(merged.english[0].isMastered,true,'spaced evidence survives cloud merge');
const failed=sync._mergeWrong(merged,{english:[{word:'test',history:[event(8,'wrong')],date:now+8*day}]});
assert.equal(failed.english[0].isMastered,false);
const U=require('./utils.js');
for(let i=0;i<500;i++){
 const q=U.generateMathQuiz({type:'dynamic',generator:'volume_reverse'});
 const asked=q.question.match(/직육면체의 (높이|가로|세로)/)[1];
 assert.ok(!q.question.split('부피가')[0].includes(asked),q.question);
}
// Compile scripts embedded in changed pages too.
for(const name of ['admin.html','math_quiz.html','wrong_note.html']){
 for(const match of fs.readFileSync(name,'utf8').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(match[1].trim())new vm.Script(match[1],{filename:name});
}
console.log('Adaptive promotion, delayed review, immutable first attempts, hints, sync and volume regression verified.');



// Writing: finishing early is blocked; mistakes/hints cannot become independent success.
const hanjaSource=fs.readFileSync('hanja.js','utf8');
let callbacks, accepted=0;
const writingSandbox={writingFinishBtn:{disabled:false},writerInstance:{quiz:c=>{callbacks=c;}},isPhaseTransition:false,
    checkAnswer:()=>accepted++};
vm.createContext(writingSandbox);
const start=hanjaSource.slice(hanjaSource.indexOf('let writingComplete ='),hanjaSource.indexOf('function setupWritingQuiz'));
vm.runInContext(start,writingSandbox);
const finish=hanjaSource.match(/writingFinishBtn.addEventListener\('click', \(\) => \{([\s\S]*?)\n\}\);/)[1];
vm.runInContext('startWritingAttempt();',writingSandbox);
const submitWriting=()=>vm.runInContext(`(()=>{${finish}})()`,writingSandbox);
submitWriting();assert.equal(accepted,0);
callbacks.onMistake();callbacks.onComplete({totalMistakes:1});
assert.equal(writingSandbox.writingFinishBtn.disabled,false);
assert.equal(vm.runInContext('writingAssisted',writingSandbox),true);
submitWriting();assert.equal(accepted,1);
const readingSandbox={window:{}};vm.createContext(readingSandbox);
for(const file of ['ReadingData.js','ReadingPassages.js'])vm.runInContext(fs.readFileSync(file,'utf8'),readingSandbox);
for(const unit of readingSandbox.window.ReadingData.levels.level1.units)
 assert.ok(readingSandbox.window.ReadingPassages.some(p=>p.unitId===unit.id),`No passage for ${unit.id}`);
assert.ok(fs.readFileSync('EnglishGrammarApp.js','utf8').includes('`grammar:${stageId}:${unit().id}`'));
console.log('Writing completion gates and unit-scoped reading/grammar integration verified.');

const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');const box={Date,console};box.window=box;vm.createContext(box);vm.runInContext(fs.readFileSync('concept-mastery.js','utf8'),box);const M=box.ConceptMastery,D=M.day,base=Date.UTC(2026,8,1);
const row=(id,day,{correct=6,repeated=false,band='foundation',skill='추론',assisted=false}={})=>({sessionId:id,subject:'reading',date:base+day*D,totalQuestions:6,metadata:{context:'ctx',adaptiveBandSnapshot:band,initialAttempts:Array.from({length:6},(_,i)=>({question:`${repeated?'same':id}-${i}`,correct:i<correct,skill,assisted}))}});
const run=rs=>M.evaluate(rs,'reading','ctx',base+30*D);
assert.equal(run([row('a',0)]).name,'foundation');
assert.equal(run([row('a',0),row('b',1)]).name,'standard','new items plus delayed success promote');
assert.equal(run([row('a',0),row('b',.01)]).name,'foundation','same-day success not sufficient');
assert.equal(run([row('a',0,{repeated:true}),row('b',1,{repeated:true}),row('c',8,{repeated:true})]).samples,6,'identical content never becomes new evidence');
assert.equal(run([row('a',0),row('a',0)]).samples,6,'duplicate sync session');
assert.equal(run([row('a',0,{assisted:true}),row('b',1)]).name,'foundation','hints do not promote');
const rs=[row('a',0),row('b',1),row('c',4,{band:'standard'}),row('d',5,{band:'standard'})];
assert.equal(run(rs).name,'challenge');
assert.equal(run([...rs,row('e',6,{correct:0,band:'challenge'}),row('f',7,{correct:0,band:'challenge'})]).name,'standard','two failures lower one step');
const split=run([row('a',0),row('b',1),row('c',2,{skill:'어휘',correct:0})]);assert.equal(split.concepts.find(c=>c.label==='추론').name,'standard');assert.equal(split.concepts.find(c=>c.label==='어휘').name,'foundation');
assert.equal(run([row('a',0),{...row('b',1),metadata:{...row('b',1).metadata,assessment:true}}]).name,'foundation');
const partial=row('partial',2);partial.totalQuestions=20;assert.equal(run([partial]).samples,0);
const noInitial=row('old',1);delete noInitial.metadata.initialAttempts;assert.equal(run([noInitial]).samples,0);
assert(run(rs).concepts[0].reviewDue);
const input=JSON.stringify(rs);run(rs);assert.equal(JSON.stringify(rs),input,'original reports unchanged');
console.log('Concept mastery: novel content, spaced checks, hints, isolated concepts, demotion, duplicate/partial filtering and immutable records passed.');

// Real report policy delegates to the new engine when loaded in page order.
box.SmartStudy={LocalRepository:{getActiveUser:()=> 'test',listReports:()=>[]}};
box.setInterval=setInterval;box.clearInterval=clearInterval;
vm.runInContext(fs.readFileSync('report.js','utf8'),box);
assert.equal(box.LearningPolicy.evaluate([row('a',0),row('b',1)],'reading','ctx').name,'standard');
for(const f of fs.readdirSync('.').filter(f=>f.endsWith('.html'))){
 const page=fs.readFileSync(f,'utf8');if(page.includes('src="report.js'))assert(page.indexOf('src="concept-mastery.js')>=0&&page.indexOf('src="concept-mastery.js')<page.indexOf('src="report.js'),f+' must load the policy before report');
}

const assert=require('node:assert/strict');
const api=require('./subject-progression');
const groups={reading:{group:'level1',ids:[7,8,9]},grammar:{group:'level2',ids:['middle','middle2','middle3']},english_reading:{group:'group2',ids:['middle1','middle2','middle3']}};
function row(subject,internal,index,correct=5,extra={}){
 return {userId:'learner',subject,sessionId:subject+'-'+internal+'-'+index,date:1000+index,totalQuestions:5,initialScore:correct,finalScore:5,
  metadata:{grade:typeof internal==='number'?internal:undefined,levelId:subject==='english_reading'?internal:undefined,stageId:subject==='grammar'?internal:undefined,
   unitId:'unit-'+index,passageId:'passage-'+index,initialAttempts:Array.from({length:5},(_,i)=>({correct:i<correct})),...extra}};
}
for(const [subject,{group,ids}] of Object.entries(groups)){
 assert.equal(api.placement(subject,group,[],'learner').internal,ids[0]);
 const reports=[0,1,2].map(i=>row(subject,ids[0],i));
 assert.equal(api.placement(subject,group,reports,'learner').internal,ids[1]);
 assert.equal(api.placement(subject,group,reports.concat(reports),'learner').internal,ids[1],'duplicate uploads cannot double-promote');
 assert.equal(api.placement(subject,group,reports,'other').internal,ids[0]);
 assert.equal(api.placement(subject,group,reports.map(r=>({...r,metadata:{...r.metadata,review:true}})),'learner').internal,ids[0]);
 assert.equal(api.placement(subject,group,reports.map(r=>({...r,metadata:{...r.metadata,hintUsed:true}})),'learner').internal,ids[0]);
 assert.equal(api.placement(subject,group,reports.map(r=>({...r,totalQuestions:1})),'learner').internal,ids[0]);
 assert.equal(api.placement(subject,group,[row(subject,ids[0],0),row(subject,ids[0],1),row(subject,ids[0],2,3)],'learner').internal,ids[0],'weak latest submission cannot promote');
 const higher=[3,4,5].map(i=>row(subject,ids[1],i));
 assert.equal(api.placement(subject,group,[...reports,...higher],'learner').internal,ids[2]);
 assert.equal(api.placement(subject,group,[...reports,...higher,...[6,7,8].map(i=>row(subject,ids[2],i))],'learner').internal,ids[2],'never cross selected group');
 const same=[0,1,2].map(i=>row(subject,ids[0],i,5,{unitId:'one',passageId:'one'}));
 assert.equal(api.placement(subject,group,same,'learner').internal,ids[0],'same scope cannot fill three distinct scopes');
 assert(!/[중고][123]/.test(api.label(subject,ids[2])));
}
console.log('Shared internal progression: 3 scopes / 85% / latest80%, first answers only, account isolation, no duplicate or cross-group promotion.');

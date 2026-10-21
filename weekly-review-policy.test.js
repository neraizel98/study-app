const assert=require('node:assert/strict');const P=require('./weekly-review-policy');
const q=(id,source='weekly',passage='')=>({id,subject:'reading',question:'question '+id,answer:'yes',choices:['yes','no'],passageLines:[passage],sourceAt:10,sourceReferences:[source==='mock'?{sourceAssessmentId:'exam',sourceQuestionId:id}:{sourceReportId:'report',sourceQuestionId:id}]});
for(const [w,m,em,ew]of [[20,20,6,4],[2,20,8,2],[20,2,2,8],[2,1,1,2]]){const r=P.selectReview({weeklyCandidates:Array.from({length:w},(_,i)=>q('w'+i)),mockCandidates:Array.from({length:m},(_,i)=>q('m'+i,'mock'))});assert.equal(r.counts.mock,em);assert.equal(r.counts.weekly,ew);}
let r=P.selectReview({weeklyCandidates:[q('same')],mockCandidates:[q('same','mock')]});assert.equal(r.items.length,1);assert.equal(r.items[0].sourceReferences.length,2);assert.equal(r.counts.mock,1);
assert.equal(P.selectReview({weeklyCandidates:[q('same','weekly','A'),q('same','weekly','B')]}).items.length,2);
const now=Date.parse('2026-10-18T23:59:59+09:00'),report={sessionId:'r',subject:'reading',date:now,totalQuestions:1,metadata:{initialAttempts:[{question:'q',correct:false,correctAnswer:'yes',choices:['yes','no']}]}};
let candidates=P.buildCandidates({userId:'child',weekId:'2026-10-12',reports:[report],publishedExams:[{published:false,payload:{questions:[q('secret')]}}],now});assert.equal(candidates.weeklyCandidates.length,1);assert.equal(candidates.mockCandidates.length,0);assert(!JSON.stringify(candidates).includes('secret'));
assert.equal(P.buildCandidates({userId:'child',weekId:'2026-10-19',reports:[report],now:now+1000}).weeklyCandidates.length,0);
assert.equal(P.buildCandidates({userId:'child',weekId:'2026-10-12',reports:[{...report,userId:'other'}],now}).weeklyCandidates.length,0);
assert.equal(P.buildCandidates({userId:'child',weekId:'2026-10-12',reports:[{...report,totalQuestions:2}],now}).excluded.incomplete,1);
const invalid=JSON.parse(JSON.stringify(report));invalid.metadata.initialAttempts[0].choices=['yes','yes'];assert.equal(P.buildCandidates({userId:'child',weekId:'2026-10-12',reports:[invalid],now}).excluded.invalid,1);
const original=[q('b'),q('a')],before=JSON.stringify(original);assert.equal(P.selectReview({weeklyCandidates:original}).items[0].id,'a');assert.equal(JSON.stringify(original),before);
console.log('Weekly review policy B01-B07/B10-B11 selection, ownership, validity, privacy, date boundaries passed.');

const richReport={...report,metadata:{unitId:'u',levelId:'level1',passageId:'p',initialAttempts:[{questionId:'qid',question:'same',correct:false,correctAnswer:'yes',choices:['yes','no'],passageText:'one\ntwo'}]}};
const richExam={learnerId:'child',assessmentId:'e',published:true,payload:{scheduledWeekId:'2026-10-12',submittedAt:now,questions:[{id:'qid',subject:'reading',question:'same',answer:'yes',choices:['yes','no'],context:{levelId:'level1',unitId:'u'},passageId:'p',passageLines:['one','two']}],initialAttempts:[{questionId:'qid',correct:false}]}};
const both=P.buildCandidates({userId:'child',weekId:'2026-10-12',reports:[richReport],publishedExams:[richExam],now});
assert.equal(P.selectReview(both).items.length,1,'nested exam context and report metadata deduplicate');
assert.deepEqual(both.weeklyCandidates[0].passageLines,['one','two']);

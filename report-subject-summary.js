(function(root){
'use strict';
function summarize(reports,subject){
 const bySession=new Map(),anonymous=[];
 for(const r of reports||[]){if(r?.subject!==subject)continue; if(!r.sessionId){anonymous.push(r);continue;}const old=bySession.get(r.sessionId);if(!old||Number(r.updatedAt||r.date||0)>=Number(old.updatedAt||old.date||0))bySession.set(r.sessionId,r);}
 const all=[...bySession.values(),...anonymous];
 const valid=all.filter(r=>Number.isFinite(Number(r.totalQuestions))&&Number(r.totalQuestions)>0&&r.initialScore!=null&&r.finalScore!=null&&Number.isFinite(Number(r.initialScore))&&Number.isFinite(Number(r.finalScore))&&Number(r.initialScore)>=0&&Number(r.finalScore)>=0&&Number(r.initialScore)<=Number(r.totalQuestions)&&Number(r.finalScore)<=Number(r.totalQuestions));
 const logs=valid.sort((a,b)=>Number(a.date||0)-Number(b.date||0));const scores=logs.map(r=>Number(r.initialScore)/Number(r.totalQuestions)*100);
 return {logs,attempts:logs.length,completes:logs.filter(r=>r.isCompleted===true).length,avg:scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null,high:scores.length?Math.round(Math.max(...scores)):null,low:scores.length?Math.round(Math.min(...scores)):null,invalid:all.length-valid.length};
}
const api={summarize};root.ReportSubjectSummary=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

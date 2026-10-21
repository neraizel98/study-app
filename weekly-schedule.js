(function(root){
 'use strict';const app=root.SmartStudy=root.SmartStudy||{},D=86400000;
 const day=at=>new Date(at+9*3600000).toISOString().slice(0,10);
 function weekDates(at=Date.now(),offset=0){const k=new Date(at+9*3600000),mid=Date.UTC(k.getUTCFullYear(),k.getUTCMonth(),k.getUTCDate())-9*3600000,start=mid-((k.getUTCDay()+6)%7)*D+offset*7*D;return Array.from({length:7},(_,i)=>day(start+i*D));}
 function normalize(value){const raw=value||{},m=raw.mockSectionMinutes||{},defaults={reading:20,english:20,math:20,hanja:10};return {learningDays:raw.learningDays===6?6:5,miniCheck:raw.miniCheck===true,mockSectionMinutes:Object.fromEntries(Object.entries(defaults).map(([s,n])=>[s,Number.isInteger(m[s])&&m[s]>=5&&m[s]<=60?m[s]:n]))};}
 function days(user,at=Date.now(),offset=0){const local=app.LocalRepository,dates=weekDates(at,offset),reports=local.listReports(user),now=day(at);return dates.map((date,index)=>{
  const kind=index===5?'mock':index===6?'review':'learning';
  const submitted=reports.filter(r=>day(Number(r.metadata?.submittedAt||r.date||0))===date&&r.metadata?.status!=='draft'&&Number(r.totalQuestions)>0&&(r.metadata?.initialAttempts||r.metadata?.attempts||[]).length>=r.totalQuestions);
  const key=`SmartStudy_DailyPlan_${encodeURIComponent(user)}_${date}`,plan=local.getPreference(key,null);
  const expected=plan?.tasks?.length||app.LearningBudgetPolicy?.subjects.length||8,finished=plan?.tasks?.filter(t=>t.status==='completed').length||0;
  const mock=submitted.filter(r=>r.metadata?.mockExam),review=local.getPreference(`SmartStudy_WeeklyReview_${encodeURIComponent(user)}_${date}`,null);
  const complete=kind==='learning'?Boolean(plan&&finished===expected):kind==='mock'?mock.some(r=>r.metadata?.examComplete===true):Boolean(review?.submittedAt);
  return {date,kind,plan,submitted,complete,finished,expected,status:complete?'completed':!plan&&submitted.length?'recorded':date>now?'scheduled':submitted.length||finished?'in_progress':date===now?'ready':'missing'};
 });}
 app.WeeklySchedule={day,weekDates,normalize,days};
})(typeof window!=='undefined'?window:globalThis);

(function(root){
 'use strict';
 const groups=[
  {id:'level1',label:'레벨 1 · 초6',grammarStages:['elementary'],readingGrades:['grade6']},
  {id:'level2',label:'레벨 2 · 중1~중3',grammarStages:['middle','middle2','middle3'],readingGrades:['middle1','middle2','middle3']},
  {id:'level3',label:'레벨 3 · 고1~고3',grammarStages:['high1','high2','high3'],readingGrades:['high1','high2','high3']}
 ];
 const readingIds=['grade6','middle1','middle2','middle3','high1','high2','high3'];
 const grammarIds=['elementary','middle','middle2','middle3','high1','high2','high3'];
 const labels=['초6','중1','중2','중3','고1','고2','고3'];
 const describe=(id,ids)=>{const index=ids.indexOf(id);return index<0?null:{id,grade:index+6,school:index===0?'elementary':index<4?'middle':'high',schoolGrade:index===0?6:index<4?index:index-3,groupId:index===0?'level1':index<4?'level2':'level3',label:labels[index]};};
 const api={groups,readingIds,grammarIds,
  readingGrade:id=>describe(id,readingIds),grammarGrade:id=>describe(id,grammarIds),
  gradeForProfile:grade=>readingIds[Math.max(0,Math.min(6,Math.floor(Number(grade)||6)-6))],
  grammarForProfile:grade=>grammarIds[Math.max(0,Math.min(6,Math.floor(Number(grade)||6)-6))],
  readingGradeOfUnit:unit=>unit?.gradeId||'grade6',
  unitsForGrade(data,id){return (data?.units||[]).filter(u=>this.readingGradeOfUnit(u)===id);},
  validReadingScope(scope){
   if(!this.readingGrade(scope?.levelId))return false;
   return scope.levelId==='grade6'?/^er[1-6]$/.test(scope.unitId):new RegExp('^'+(scope.levelId.startsWith('middle')?'mr':'hr')+scope.levelId.slice(-1)+'-unit[12]$').test(scope.unitId);
  }
 };
 root.EnglishCurriculum=api;(root.SmartStudy=root.SmartStudy||{}).EnglishCurriculum=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

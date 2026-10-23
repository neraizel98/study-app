(function(root){
 'use strict';
 const data=root.ReadingData;
 const gradeForProfile=value=>Math.max(7,Math.min(12,Math.floor(Number(value)||7)));
 const levelForGrade=grade=>gradeForProfile(grade)>=10?'level2':'level1';
 const gradeOfUnit=value=>{
  const id=typeof value==='string'?value:value?.id||value?.unitId||'';
  if(value?.grade)return gradeForProfile(value.grade);
  const match=/^kr-([mh])([123])-r[1-8]$/.exec(id);
  return match?(match[1]==='m'?6:9)+Number(match[2]):7;
 };
 const gradeOfPassage=p=>p?.grade?gradeForProfile(p.grade):gradeOfUnit(p?.unitId);
 const api={gradeForProfile,levelForGrade,gradeOfUnit,gradeOfPassage,
  isCurrentPassageId:id=>(root.ReadingPassages||[]).some(p=>p.id===id&&Boolean(p.grade)&&!p.legacy),
  label:grade=>`${grade<10?'중':'고'}${grade<10?grade-6:grade-9}`,
  matches(p,context){return Boolean(p&&p.unitId===context?.unitId&&(p.levelId||'level1')===(context?.levelId||'level1'));}
 };
 root.KoreanReadingCurriculum=api;
 if(!data||data.curriculumVersion==='20261023')return;
 const base=data.levels.level1.units;
 const lessons={...root.KoreanReadingMiddleLessons,...root.KoreanReadingHighLessons};
 const all=[];
 for(let grade=7;grade<=12;grade++)for(let index=1;index<=8;index++){
  const original=base[index-1];
  const id=grade===7?`r${index}`:`kr-${grade<10?'m'+(grade-6):'h'+(grade-9)}-r${index}`;
  const authored=lessons[id];
  all.push({...original,id,grade,title:`${api.label(grade)} · ${original.title}`,
   lessons:Array.isArray(authored)?authored:authored?.lessons||original.lessons});
 }
 data.levels={
  level1:{title:'레벨 1 · 중학 독해',goal:'중1~중3의 글 구조·근거·표현을 분석하고 새로운 상황에 적용합니다.',units:all.filter(u=>u.grade<10)},
  level2:{title:'레벨 2 · 고교 독해',goal:'고1~고3의 복합 지문·논증·문학을 비교·추론·비판적으로 읽습니다.',units:all.filter(u=>u.grade>=10)}
 };
 // Retain retired texts for existing reports and wrong-answer review, not ordinary new quizzes.
 for(const passage of root.ReadingPassages||[])if(!passage.grade){passage.legacy=true;}
 data.curriculumVersion='20261023';
})(window);

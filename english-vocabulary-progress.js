(function(root){
 'use strict';
 // Teaching bands, not an official textbook-specific grade word list.
 const middle2=new Set('ability advice allow avoid believe calm cancel cause collect complain complete continue control create damage decide design earth effort energy event exact expect experience explain factory familiar fault festival foreign future history human imagine improve include inform interest invent journey knowledge language leader local machine manage material meaning memory message method moment national native natural notice object offer office opinion ordinary own particular perfect period planet popular practice prepare prevent price problem produce promise protect proud provide public purpose raise realize reason receive record reduce regular relax remain remind remove repair repeat reply report respect result review rule scene secret select serious serve shape share silent similar simple single situation skill solve special spend spread straight strange subject success sudden suggest supply support surprise taste thick thin toward trade traffic travel trouble trust truth uniform usual value village weak weigh whole wide wild'.split(' '));
 const middle3=new Set('destroy garage operate order origin perform permit physical recognize require research separate society source state strike suppose survive tear traditional typical union unique unite universe unless various view voice waste wonder'.split(' '));
 for(const entry of root.vocabData.level3){
  if(!entry.schoolGrade)entry.schoolGrade=middle3.has(entry.word)?3:middle2.has(entry.word)?2:1;
 }
 // 레벨 4 is high school: schoolGrade 1~3 means 고1~고3. Newer entries carry it; the first 27 are mapped here.
 const high2=new Set('accelerate alleviate articulate diminish facilitate inevitable'.split(' '));
 const high3=new Set('comprehensive controversial persistence sophisticated transparent vulnerable'.split(' '));
 for(const entry of root.vocabData.level4||[]){
  if(!entry.schoolGrade)entry.schoolGrade=high3.has(entry.word)?3:high2.has(entry.word)?2:1;
 }
 // Levels whose words are banded by school grade, and the prefix the band shows (중1, 고2 …).
 const GRADED={level3:'중',level4:'고'};
 const isGraded=level=>Object.prototype.hasOwnProperty.call(GRADED,level);
 const label=(level,band)=>isGraded(level)?`${GRADED[level]}${grade(band)}`:'';
 const grade=band=>({foundation:1,standard:2,challenge:3}[band?.name]||1);
 function band(reports,evaluate,now,level='level3'){
  // Vocabulary mastery is independent of which quiz format happens to be drawn.
  // Read old records through the same lens without rewriting saved history.
  const concept=level==='level4'?'high-school-vocabulary':'middle-school-vocabulary';
  const evidence=(reports||[]).map(r=>r.subject==='english'&&r.metadata?.context===level
   ? {...r,metadata:{...r.metadata,initialAttempts:r.metadata.initialAttempts?.map(a=>({...a,conceptId:concept}))}}:r);
  return evaluate(evidence,'english',level,now);
 }
 function eligible(level,band){return (root.vocabData[level]||[]).filter(w=>!isGraded(level)||w.schoolGrade<=grade(band));}
 function focused(level,band,shuffle,reviewLimit){
  const all=eligible(level,band);if(!isGraded(level))return shuffle([...all]);
  const target=all.filter(w=>w.schoolGrade===grade(band));
  const review=shuffle(all.filter(w=>w.schoolGrade<grade(band))).slice(0,reviewLimit??Math.floor(target.length*.3));
  return [...shuffle(target),...review];
 }
 root.EnglishVocabularyProgress={grade,eligible,focused,band,isGraded,label};
})(typeof window!=='undefined'?window:globalThis);

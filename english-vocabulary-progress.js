(function(root){
 'use strict';
 // Teaching bands, not an official textbook-specific grade word list.
 const middle2=new Set('ability advice allow avoid believe calm cancel cause collect complain complete continue control create damage decide design earth effort energy event exact expect experience explain factory familiar fault festival foreign future history human imagine improve include inform interest invent journey knowledge language leader local machine manage material meaning memory message method moment national native natural notice object offer office opinion ordinary own particular perfect period planet popular practice prepare prevent price problem produce promise protect proud provide public purpose raise realize reason receive record reduce regular relax remain remind remove repair repeat reply report respect result review rule scene secret select serious serve shape share silent similar simple single situation skill solve special spend spread straight strange subject success sudden suggest supply support surprise taste thick thin toward trade traffic travel trouble trust truth uniform usual value village weak weigh whole wide wild'.split(' '));
 const middle3=new Set('destroy garage operate order origin perform permit physical recognize require research separate society source state strike suppose survive tear traditional typical union unique unite universe unless various view voice waste wonder'.split(' '));
 for(const entry of root.vocabData.level3){
  if(!entry.schoolGrade)entry.schoolGrade=middle3.has(entry.word)?3:middle2.has(entry.word)?2:1;
 }
 const grade=band=>({foundation:1,standard:2,challenge:3}[band?.name]||1);
 function band(reports,evaluate,now){
  // Vocabulary mastery is independent of which quiz format happens to be drawn.
  // Read old records through the same lens without rewriting saved history.
  const evidence=(reports||[]).map(r=>r.subject==='english'&&r.metadata?.context==='level3'
   ? {...r,metadata:{...r.metadata,initialAttempts:r.metadata.initialAttempts?.map(a=>({...a,conceptId:'middle-school-vocabulary'}))}}:r);
  return evaluate(evidence,'english','level3',now);
 }
 function eligible(level,band){return (root.vocabData[level]||[]).filter(w=>level!=='level3'||w.schoolGrade<=grade(band));}
 function focused(level,band,shuffle,reviewLimit){
  const all=eligible(level,band);if(level!=='level3')return shuffle([...all]);
  const target=all.filter(w=>w.schoolGrade===grade(band));
  const review=shuffle(all.filter(w=>w.schoolGrade<grade(band))).slice(0,reviewLimit??Math.floor(target.length*.3));
  return [...shuffle(target),...review];
 }
 root.EnglishVocabularyProgress={grade,eligible,focused,band};
})(typeof window!=='undefined'?window:globalThis);

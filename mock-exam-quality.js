(function(root){
 'use strict';
 const areas={reading:['reading','korean_vocab'],english:['english','grammar','english_reading'],math:['math','math_formula'],hanja:['hanja']};
 const policyId='transfer-20261024';
 const applicationKinds=new Set(['new-context-application','error-analysis','multi-step-application','new-passage']);
 function evaluate(items){
  const deficits={},summary={};
  for(const [area,subjects] of Object.entries(areas)){
   const rows=items.filter(q=>subjects.includes(q.subject)),expected=area==='hanja'?10:15;
   const application=rows.filter(q=>applicationKinds.has(q.noveltyKind)&&['application','reasoning'].includes(q.cognitiveDemand)&&!q.repeated).length;
   const reasoning=rows.filter(q=>applicationKinds.has(q.noveltyKind)&&q.cognitiveDemand==='reasoning'&&!q.repeated).length;
   const applicationRequired=Math.ceil(expected*.6),reasoningRequired=Math.ceil(expected*.2);
   summary[area]={application,applicationRequired,reasoning,reasoningRequired};
   if(application<applicationRequired||reasoning<reasoningRequired)deficits[area]={...summary[area],reason:'새 상황 적용·두 조건 비교 문항이 부족하여 쉬운 재확인 문제로 채우지 않았습니다.'};
  }
  return {policyId,complete:!Object.keys(deficits).length,summary,deficits};
 }
 root.MockExamQuality={policyId,evaluate,applicationKinds};
})(window);

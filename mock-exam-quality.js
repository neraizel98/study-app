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
 // ---- Item integrity: every shipped item must be self-contained and have exactly one defensible answer. ----
 const normalize=value=>String(value??'').normalize('NFKC').toLowerCase().replace(/\s+/g,'').trim();
 // Same equivalence as grading: 0.5, 1/2 and $\frac{1}{2}$ are one choice; order, case, spacing and a final period are presentation.
 function choiceKey(value){
  const text=normalize(value).replace(/\$/g,'').replace(/[.。]$/,'');
  const fraction=text.match(/^(-?\d+)\/(\d+)([a-z%²³^0-9{}]*)$/)||text.match(/^\\frac\{(-?\d+)\}\{(\d+)\}([a-z%²³^0-9{}]*)$/);
  if(fraction&&Number(fraction[2])!==0)return `number:${Number(fraction[1])/Number(fraction[2])}:${fraction[3]}`;
  const decimal=text.match(/^(-?\d+(?:\.\d+)?)([a-z%²³^0-9{}]*)$/);
  return decimal?`number:${Number(decimal[1])}:${decimal[2]}`:text;
 }
 // A length/area/volume prompt without the figure it is about cannot be solved ("밑변 8 cm, 높이 6 cm의 넓이는?").
 const MEASURE=/밑변|높이|반지름|지름|가로|세로|윗변|아랫변|대각선|한 변|두 변|모서리|둘레|넓이|부피|원주/;
 const FIGURE=/삼각형|사각형|오각형|육각형|팔각형|다각형|평행사변형|사다리꼴|마름모|부채꼴|직육면체|정육면체|원기둥|원뿔|각기둥|각뿔|입체|반원|원(?:의|을|은|이|에|과|와|으로|\)|,|\s|$)|원 모양|종이|판|상자|테두리|밭|화단|땅|운동장|방|벽|타일|수조|도형|리본|끈/;
 const UNIT=/mm|cm|km|(?:^|[^a-z])m(?:[²³^]|\b|$)|㎝|㎡|㎥|L\b|mL|단위|몇 개|개수|몇 번|몇 쌍/;// counting ("모서리의 수는 몇 개") needs no length unit
 // Plain arithmetic chains in explanations ("3.14×6×6=113.04", "$14 \times 3.1 = 43.4$") must be true.
 function arithmeticErrors(text){
  const errors=[],src=String(text||'').replace(/\$/g,'').replace(/\\times/g,'×').replace(/\\div/g,'÷').replace(/\\cdot/g,'×').replace(/−/g,'-');
  const chain=/(?<![\d.,)²³^/\]}a-zA-Z])(\d+(?:\.\d+)?(?:\s*[×÷+*\-]\s*\d+(?:\.\d+)?)+)\s*=\s*(-?\d+(?:\.\d+)?)(?![\d.,/²³^(])(?!\s*[×÷+*\-/:\\])/g;// a right side that continues ("= 3 × \frac{1}{4}", "= 19-18") is not a final value
  for(const m of src.matchAll(chain)){
   const before=src.slice(0,m.index).trimEnd();
   if(/[×÷+*\-(=^]$/.test(before))continue;// part of a longer bracketed or chained expression
   const tokens=m[1].match(/\d+(?:\.\d+)?|[×÷+*\-]/g),terms=[];let sign=1,acc=Number(tokens[0]),ok=true;
   for(let i=1;i<tokens.length;i+=2){const op=tokens[i],n=Number(tokens[i+1]);
    if(op==='×'||op==='*')acc*=n;else if(op==='÷'){if(!n){ok=false;break;}acc/=n;}else{terms.push(sign*acc);sign=op==='-'?-1:1;acc=n;}}
   if(!ok)continue;terms.push(sign*acc);
   const value=terms.reduce((a,b)=>a+b,0),shown=Number(m[2]),decimals=(m[2].split('.')[1]||'').length;
   if(Math.abs(value-shown)>Math.max(1e-6,.5*10**-decimals+1e-9))errors.push(`해설 계산 불일치: ${m[0]}`);
  }
  return errors;
 }
 // Sentence/line/paragraph numbers a question or its choices point to.
 function referencedLines(text){
  const refs=[],src=String(text||'');
  for(const m of src.matchAll(/\bsentences?\s+(\d+)(?:\s*(?:-|–|~|and|to)\s*(\d+))?/gi))refs.push(Number(m[1]),Number(m[2]||m[1]));
  for(const m of src.matchAll(/\b(?:paragraphs?|lines?)\s+(\d+)(?:\s*(?:-|–|~|and|to)\s*(\d+))?/gi))refs.push(Number(m[1]),Number(m[2]||m[1]));
  for(const m of src.matchAll(/(\d+)(?:\s*[~∼-]\s*(\d+))?\s*(?:번째\s*|번\s*)?(?:행|문장|문단|단락|연(?=$|[\s,.)~·]|의|에|과|와|은|는|을|이|부터|까지))/g))refs.push(Number(m[1]),Number(m[2]||m[1]));
  return refs;
 }
 function validateItem(q){
  const errors=[],question=typeof q?.question==='string'?q.question.trim():'';
  if(!question)errors.push('문항 본문 없음');
  if(/아직 개발 중|임시 문제|undefined|NaN|\[object Object\]/.test(question))errors.push('미완성 문구');
  if(!String(q?.explanation??'').trim())errors.push('해설 없음');
  if(q?.kind==='written'){if(!String(q.answer??'').trim())errors.push('단답 정답 없음');}
  else{
   const choices=Array.isArray(q?.choices)?q.choices:[];
   if(choices.length<2||!choices.every(c=>typeof c==='string'&&c.trim()))errors.push('선택지 형식 오류');
   if(choices.filter(c=>c===q?.answer).length!==1)errors.push('정답이 선택지에 정확히 하나가 아님');
   if(new Set(choices.map(choiceKey)).size!==choices.length)errors.push('같거나 동등한 선택지');
   if(choices.some(c=>/undefined|NaN|\[object Object\]/.test(String(c))))errors.push('선택지 미완성 문구');
  }
  const lines=q?.passageLines,hasLines=Array.isArray(lines)?lines.length>0&&lines.every(l=>typeof l==='string'&&l.trim()):typeof lines==='string'&&lines.trim().length>0;
  if((q?.passageId||q?.passageTitle||/윗글|이 글|다음 글|위 글|지문|글쓴이|\bpassage\b|\bthe text\b/i.test(question))&&!hasLines)errors.push('지문 없이 지문을 묻는 문항');
  if(hasLines){
   const count=Array.isArray(lines)?lines.length:1,refs=[question,...(q.choices||[])].flatMap(referencedLines);
   if(refs.some(n=>n<1||n>count))errors.push(`지문 범위를 벗어난 문장 번호(지문 ${count}개 문장/단락)`);
  }
  if(['math','math_formula'].includes(q?.subject)&&MEASURE.test(question)){
   if(!FIGURE.test(question))errors.push('도형·대상 이름 없는 측정 문항');
   if(!UNIT.test(question)&&!q.unit)errors.push('단위 없는 측정 문항');
  }
  errors.push(...arithmeticErrors(q?.explanation),...arithmeticErrors(q?.question));
  return {ok:!errors.length,errors};
 }
 root.MockExamQuality={policyId,evaluate,applicationKinds,validateItem,choiceKey,arithmeticErrors};
})(typeof window!=='undefined'?window:globalThis);

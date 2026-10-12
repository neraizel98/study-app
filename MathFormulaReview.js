(function(root){
 'use strict';
 const shuffle=values=>[...values].sort(()=>Math.random()-.5);
 function simple(number,stage){
  const n=2+Math.floor(Math.random()*(stage==='foundation'?3:5)),a=n+2,b=n+1,h=n;
  const tasks={
   3:[`직각을 이루는 두 변: ${a} cm, ${b} cm`,a*b/2,`${a}×${b}÷2`,'넓이','cm²'],
   6:[`밑변: ${a} cm\n높이: ${h} cm`,a*h/2,`${a}×${h}÷2`,'넓이','cm²'],
   15:[`한 변: ${a} cm`,a*a,`${a}×${a}`,'넓이','cm²'],
   16:[`가로: ${a} cm\n세로: ${b} cm`,a*b,`${a}×${b}`,'넓이','cm²'],
   17:[`가로: ${a} cm\n세로: ${b} cm`,2*(a+b),`(${a}+${b})×2`,'둘레','cm'],
   19:[`두 대각선: ${a} cm, ${2*h} cm`,a*h,`${a}×${2*h}÷2`,'넓이','cm²'],
   20:[`밑변: ${a} cm\n높이: ${h} cm`,a*h,`${a}×${h}`,'넓이','cm²'],
   21:[`윗변: ${a} cm\n아랫변: ${a+2} cm\n높이: ${h} cm`,(a+1)*h,`(${a}+${a+2})×${h}÷2`,'넓이','cm²'],
   31:[`반지름: ${h} cm\n원주율: 3.14`,3.14*h*h,`3.14×${h}×${h}`,'넓이','cm²'],
   32:[`반지름: ${h} cm\n원주율: 3.14`,6.28*h,`2×3.14×${h}`,'둘레','cm'],
   37:[`원의 둘레: ${3.14*10} cm\n지름: 10 cm`,3.14,'31.4÷10','원주율',''],
   58:[`한 모서리: ${h} cm`,h**3,`${h}×${h}×${h}`,'부피','cm³'],
   59:[`한 모서리: ${h} cm`,6*h*h,`6×${h}×${h}`,'겉넓이','cm²'],
   60:[`가로: ${a} cm\n세로: ${b} cm\n높이: ${h} cm`,a*b*h,`${a}×${b}×${h}`,'부피','cm³'],
   61:[`가로: ${a} cm\n세로: ${b} cm\n높이: ${h} cm`,2*(a*b+b*h+a*h),`2×(${a}×${b}+${b}×${h}+${a}×${h})`,'겉넓이','cm²'],
   120:[`전체: 20개\n선택한 수: ${2*n}개`,10*n,`${2*n}÷20×100`,'비율','%']
  };
  const t=tasks[number];if(!t)return null;
  const [givens,value,work,name,unit]=t,answer=Number(value.toFixed(2));
  return {kind:'choice',givens,prompt:`${name}를 구해 보세요.`,answer:String(answer),choices:shuffle([answer,answer+1,answer+2,answer+3].map(x=>String(Number(x.toFixed(2))))),solution:`${work} = ${answer}${unit?' '+unit:''}`,unit};
 }
 function band(reports,number){
  const seen=new Set(),rows=(reports||[]).filter(r=>r.metadata?.source==='math-formula'&&r.metadata?.formulaNumber===number&&r.metadata?.quizFormat==='formula-review-v2'&&!r.metadata?.review).sort((a,b)=>Number(b.date)-Number(a.date)).filter(r=>{if(seen.has(r.sessionId))return false;seen.add(r.sessionId);return true;}).map(r=>{
   const a=r.metadata.initialAttempts||r.metadata.attempts||[];if(a.length!==Number(r.totalQuestions))return null;
   const independent=a.filter(x=>typeof x.correct==='boolean'&&!x.assisted&&!x.hintUsed);return independent.length?independent.filter(x=>x.correct).length/independent.length:null;
  }).filter(x=>x!==null);
  const recent=rows.slice(0,3),average=recent.length?recent.reduce((a,b)=>a+b,0)/recent.length:0;
  return rows.length>=6&&average>=.9?'application':rows.length>=3&&average>=.8?'practice':'foundation';
 }
 function create(number,stage='foundation'){
  const item=root.MATH_FORMULAS.find(f=>f.number===number),generated=root.MathFormulaQuiz.create(number),basic=simple(number,stage)||generated[0];
  const others=root.MATH_FORMULAS.filter(f=>f.number!==number&&f.formula!==item.formula);
  const similar=others.filter(f=>f.level===item.level&&f.formula.length<=Math.max(60,item.formula.length));
  const formulas=[...new Set([item.formula,...shuffle(similar).map(f=>f.formula),...shuffle(others).map(f=>f.formula)])].slice(0,3);
  const recall={kind:'choice',level:'공식 떠올리기',prompt:'배운 공식을 골라 보세요.',answer:item.formula,choices:shuffle(formulas),displayMath:true,solution:item.formula,solutionMath:true,noteType:'formula-recall'};
  const [symbol,meaning]=item.symbols[Math.floor(Math.random()*item.symbols.length)];
  const meanings=[...new Set([meaning,...item.symbols.filter(x=>x[0]!==symbol).map(x=>x[1])])].slice(0,3);
  const symbolQuestion={kind:'choice',level:'기호 확인',prompt:`${symbol}는 무엇을 뜻하나요?`,answer:meaning,choices:shuffle(meanings),solution:`${symbol}: ${meaning}`,noteType:'symbol-recall'};
  function calculation(q,label,scaffold=false){return {...q,level:label,formulaTex:scaffold?item.formula:null,assisted:scaffold,noteType:scaffold?'guided-calculation':'calculation',prompt:q.prompt.replace(/숫자만 쓰세요\.?/g,'').replace(/입력하세요\./g,'구하세요.').replace(/입니다\. /g,'입니다.\n').trim()};}
  const numeric=calculation(simple(number,stage)||root.MathFormulaQuiz.create(number)[0],'혼자 계산하기');
  if(stage==='application')return [calculation(basic,'공식 적용'),calculation(simple(number,stage)||generated[1],'한 단계 응용'),{...numeric,kind:'written',answer:Number(numeric.answer),choices:undefined,tolerance:.02,strictNumeric:true}];
  if(stage==='practice')return [recall,calculation(basic,'값 넣기'),{...numeric,kind:'written',answer:Number(numeric.answer),choices:undefined,tolerance:.02,strictNumeric:true}];
  return [recall,symbolQuestion,calculation(basic,'공식 보고 계산',true)];
 }
 root.MathFormulaReview={create,band};
})(window);

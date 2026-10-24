(function(root){
 'use strict';
 const round=n=>Number(n.toFixed(4)),text=n=>typeof n==='string'?n:String(round(n));
 function create(scope,rng=Math.random){
  const generators=new Set(scope.attempts.map(a=>a.generator).filter(Boolean)),rows=[];
  const n=(a,b)=>a+Math.floor(rng()*(b-a+1));
  const add=(family,question,value,wrong,explanation,required,difficulty='standard',unit='')=>{
   const answer=text(value),choices=[answer,...new Set(wrong.map(text).filter(v=>v!==answer))];
   if(choices.length<4||required.some(g=>!generators.has(g)))return;
   rows.push({question,answer,choices:choices.slice(0,4),explanation,difficulty,unit,
    conceptId:family,templateFamily:family,requiredConceptIds:required,noveltyKind:'new-context-application',cognitiveDemand:difficulty==='challenge'?'reasoning':'application'});
  };
  for(let k=0;k<16;k++){
   const r=n(2,8),s=r+n(1,4),pi=3.14;
   const area=[...generators].find(g=>g==='circle_area_basic');
   if(area){
    const inner=pi*r*r,outer=pi*s*s,difference=outer-inner;
    add('circle-area-remaining',`넓이가 ${text(outer+20)} cm²인 종이에서 반지름 ${r} cm인 원 한 개를 오려 냈습니다. 남은 종이의 넓이는? (원주율 3.14)`,outer+20-inner,[outer+20,outer+20-pi*r,inner],`원 넓이는 3.14×${r}×${r}=${text(inner)}입니다. 전체 ${text(outer+20)}에서 오려 낸 넓이를 빼면 ${text(outer+20-inner)} cm²입니다.`,[area],'standard','cm²');
    add('circle-area-two-conditions',`같은 종이에 반지름 ${s} cm인 큰 원 안에 반지름 ${r} cm인 작은 원을 그렸습니다. 작은 원 안은 칠하지 않고 큰 원의 나머지만 칠했습니다. 칠한 넓이는? (원주율 3.14)`,difference,[outer,outer+inner,pi*(s-r)*(s-r)],`큰 원과 작은 원의 넓이를 각각 구해 빼야 합니다. 3.14×(${s}²−${r}²)=${text(difference)} cm²입니다. 반지름의 차로 새 원을 구하는 것은 다릅니다.`,[area],'challenge','cm²');
    add('circle-area-change',`반지름 ${r} cm인 원의 넓이를 계산한 뒤 반지름을 2배로 바꿨습니다. 두 번째 원이 첫 번째 원보다 넓어진 양은? (원주율 3.14)`,3*inner,[inner,2*inner,4*inner],`반지름이 2배면 넓이는 4배입니다. 넓어진 양은 새 넓이−처음 넓이이므로 처음 넓이의 3배, ${text(3*inner)} cm²입니다.`,[area],'challenge','cm²');
   }
   if(area){
    const cost=100*n(2,6),value=pi*r*r;
    add('circle-area-cost-limit',`반지름 ${r} cm인 원 모양 판 전체를 칠합니다. 1 cm²당 비용이 ${cost}원일 때 총 비용은? (원주율 3.14)`,value*cost,[value,2*pi*r*cost,value+cost],`먼저 칠할 넓이 3.14×${r}²=${text(value)} cm²를 구하고 단위 넓이당 비용 ${cost}원을 곱하면 ${text(value*cost)}원입니다.`,[area],'standard','원');
    add('circle-area-two-orders',`반지름 ${r} cm인 원 두 장과 반지름 ${2*r} cm인 원 한 장을 비교합니다. 큰 원 한 장의 넓이가 작은 원 두 장의 넓이 합보다 얼마나 큰가요? (원주율 3.14)`,2*value,[value,3*value,4*value],`큰 원은 작은 원 한 장의 4배이고 작은 원 두 장의 합은 2배입니다. 차이는 작은 원 한 장의 넓이의 2배, ${text(2*value)} cm²입니다.`,[area],'challenge','cm²');
    add('circle-radius-added',`반지름 ${r} cm인 원을 반지름 ${r+1} cm인 원으로 바꿉니다. 종이를 더 준비해야 하는 넓이는? (원주율 3.14)`,pi*((r+1)**2-r*r),[pi,pi*(r+1)**2,pi*r*r],`추가 넓이는 두 원 넓이의 차이입니다. 3.14×(${r+1}²−${r}²)=${text(pi*((r+1)**2-r*r))} cm²입니다. 반지름 1 cm 증가가 넓이 3.14 cm² 증가와 같지는 않습니다.`,[area],'challenge','cm²');
   }
   const circumference=[...generators].find(g=>g==='circle_circumference');
   if(circumference){
    const length=2*pi*r;
    add('circle-string-two-rounds',`반지름 ${r} cm인 원 모양 테두리를 끈으로 두 번 두르고 매듭에 5 cm를 더 씁니다. 필요한 끈의 길이는? (원주율 3.14)`,2*length+5,[length+5,2*length,length*2+10],`한 바퀴는 2×3.14×${r}=${text(length)} cm입니다. 두 바퀴를 먼저 계산한 뒤 매듭 5 cm를 한 번 더하면 ${text(2*length+5)} cm입니다.`,[circumference],'standard','cm');
   }
   if(area&&circumference){
    add('circle-circumference-to-area',`원의 둘레가 ${text(2*pi*r)} cm입니다. 같은 원의 넓이를 구하세요. (원주율 3.14)`,pi*r*r,[2*pi*r,r*r,pi*4*r*r],`둘레÷(2×3.14)로 반지름 ${r} cm를 구하고, 넓이 공식에 넣습니다. 3.14×${r}²=${text(pi*r*r)} cm²입니다. 둘레와 넓이는 다른 양입니다.`,[circumference,area],'challenge','cm²');
   }
   const frac=[...generators].find(g=>/^frac_div_frac_|^fraction_div_int|^frac_div_int/.test(g));
   if(frac){
    const total=n(7,15),parts=n(2,5),used=n(1,total-2),remaining=total-used;
    if(/^frac_div_frac_/.test(frac)){
     const count=2*total-1;
     add('fraction-remaining-capacity',`주스 ${total} L에서 먼저 1/2 L를 사용했습니다. 남은 주스를 한 병에 1/2 L씩 담으면 몇 병을 채울 수 있나요?`,count,[2*total,total-1,2*total+1],`먼저 남은 양 ${total}−1/2를 구합니다. 이를 1/2로 나누면 (${total}−1/2)×2=${count}병입니다. 사용하기 전 전체를 나누면 안 됩니다.`,[frac],'challenge','병');
    }
    add('fraction-two-shares',`리본 ${total} m 중 ${used} m를 쓰고 남은 양을 ${parts}명이 똑같이 나눕니다. 한 사람이 받는 길이는?`,` ${remaining}/${parts}`.trim(),[`${total}/${parts}`,`${used}/${parts}`,parts],`남은 리본은 ${total}−${used}=${remaining} m입니다. 남은 양을 ${parts}로 나누므로 ${remaining}/${parts} m입니다.`,[frac],'standard','m');
   }
   const factor=[...generators].find(g=>/^m1_factor_/.test(g));
   if(factor){
    const a=n(2,5),b=a+1,d=n(2,5),x=d*a,y=d*b;
    const gcd=(x,y)=>y?gcd(y,x%y):x,g=gcd(x,y),l=x*y/g;
    if(scope.attempts.some(a=>/최대공약|공약수/.test(a.question||'')))add('factor-largest-packets',`사탕 ${x}개와 쿠키 ${y}개를 남김없이 똑같은 꾸러미로 나눕니다. 꾸러미 수를 가장 많게 할 때, 한 꾸러미의 사탕과 쿠키를 합하면 몇 개인가요?`,x/g+y/g,[g,x+y,l],`꾸러미 수는 최대공약수 ${g}입니다. 한 꾸러미에는 사탕 ${x/g}개와 쿠키 ${y/g}개가 들어가므로 합은 ${x/g+y/g}개입니다. 최대공약수 자체가 한 꾸러미 속 개수는 아닙니다.`,[factor],'challenge','개');
    if(scope.attempts.some(a=>/최소공배|공배수/.test(a.question||'')))add('factor-next-meeting',`A 신호는 ${x}초마다, B 신호는 ${y}초마다 울립니다. 지금 함께 울린 뒤, 두 신호가 다음에 함께 울리는 시간까지 A는 몇 번 더 울리나요?`,l/x,[l/y,g,l],`다음에 함께 울리는 때는 최소공배수 ${l}초 뒤입니다. 그동안 A가 더 울린 횟수는 ${l}÷${x}=${l/x}번이며 처음 순간은 세지 않습니다.`,[factor],'challenge','번');
   }
   if(factor&&scope.attempts.some(a=>/소인수|5\^|3\^|2\^/.test(a.question||''))){
    const exponent=n(2,4),quotient=5**(exponent-1)*7;
    add('factor-quotient-exponent',`어떤 자연수 N을 5로 나눈 몫이 ${quotient}이고 나머지는 0입니다. N=5^a×7로 나타낼 때 a의 값은?`,exponent,[exponent-1,exponent+1,2*exponent],`먼저 N=${quotient}×5=${quotient*5}입니다. ${quotient*5}=5^${exponent}×7이므로 a=${exponent}입니다. 몫을 N으로 잘못 읽으면 지수가 1 작아집니다.`,[factor],'challenge');
    const value=30*2**exponent;
    add('factor-product-exponent',`N=2^a×3×5입니다. N의 2배가 ${value}일 때 a의 값은?`,exponent,[exponent-1,exponent+1,2*exponent],`N=${value}÷2=${value/2}이고, 3×5=15를 나누면 2^a=${2**exponent}입니다. 따라서 a=${exponent}입니다.`,[factor],'challenge');
   }
   const integer=[...generators].find(g=>/^m1_integer_/.test(g));
   if(integer&&scope.attempts.some(a=>/온도|기온/.test(a.question||'')||(!/[|]|절댓값/.test(a.question||'')&&/[0-9})]\s*[+-]/.test(a.question||'')))){
    const start=-n(2,8),up=n(4,9),down=n(1,4);
    add('integer-changed-direction',`기온이 ${start}℃에서 ${up}℃ 올랐다가 ${down}℃ 내려갔습니다. 마지막 기온과 처음 기온의 차이는 몇 ℃인가요?`,up-down,[start+up-down,up+down,start-up+down],`마지막 기온은 ${start+up-down}℃이지만, 처음과의 차이는 (${start}+${up}−${down})−(${start})=${up-down}℃입니다. 묻는 것은 마지막 기온이 아닙니다.`,[integer],'challenge','℃');
   }
  }
  return rows;
 }
 function createFormula(scope,rng=Math.random){
  const number=Number(scope.context.unitId.replace('formula-',''));
  if(!scope.attempts.some(a=>/(?:guided-)?calculation/.test(a.questionId||'')||/^(?:guided-)?calculation$/.test(a.type||a.noteType||'')))return [];
  const rows=[],geometry=new Set([3,6,15,16,17,19,20,21,31,32,58,59,60,61]);
  for(let i=0;i<20;i++){
   if(number===120){
    const total=40+20*Math.floor(rng()*5),firstPercent=[25,50,75][i%3],extraPercent=[5,10,15,20][i%4],chosen=total*firstPercent/100,extra=total*extraPercent/100;
    const percent=firstPercent+extraPercent,answer=String(percent),choices=[answer,String(firstPercent),String(extraPercent),String(100-percent)];
    if(new Set(choices).size<4)continue;
    rows.push({question:`전체 ${total}명 중 처음 ${chosen}명이 참여했고 나중에 ${extra}명이 더 참여했습니다. 전체 인원은 그대로일 때 최종 참여 비율은 몇 %인가요?`,answer,choices,explanation:`최종 참여 인원은 ${chosen+extra}명입니다. (${chosen}+${extra})÷${total}×100=${percent}%이며, 나중에 더한 인원만으로 비율을 구하면 안 됩니다.`,unit:'%',templateFamily:'formula-percentage-combined',conceptId:'percentage-combined',noveltyKind:'multi-step-application',cognitiveDemand:'reasoning',difficulty:'challenge'});
   }else if(geometry.has(number)){
    const source=(root.MathFormulaReview?.create(number,'practice')||[]).find(q=>q.kind==='choice'&&/calculation/.test(q.noteType||'')&&Number.isFinite(Number(q.answer)));
    if(!source?.unit||!/^cm/.test(source.unit))continue;
    const value=Number(source.answer),count=2+i%3,total=value*count;
    const question=`[한 개의 조건] ${source.givens||''}\n${source.prompt}\n이 조건이 같은 대상을 ${count}개 준비할 때, 각 대상에서 구한 값을 모두 합하면 얼마인가요? (${source.unit})`;
    const answer=text(total),choices=[answer,...new Set([value,value*(count+1),value+count,total+count].map(text).filter(v=>v!==answer))].slice(0,4);
    if(choices.length<4)continue;
    rows.push({question,answer,choices,explanation:`먼저 한 개의 값을 공식으로 구합니다. ${source.solution} 같은 조건의 ${count}개이므로 ${value}×${count}=${answer}${source.unit}입니다.`,unit:source.unit,templateFamily:'formula-quantity-conditions',conceptId:'formula-quantity-conditions',noveltyKind:'multi-step-application',cognitiveDemand:'application',difficulty:'standard'});
    const dimensions=(source.givens||'').match(/\d+(?:\.\d+)?/g)?.map(Number)||[];
    if(number===16&&dimensions.length>=2){
     const [width,height]=dimensions,area=width*height,remaining=area-width;
     rows.push({question:`직사각형의 넓이가 ${area} cm²이고 가로는 ${width} cm입니다. 세로 길이는?`,answer:text(height),choices:[text(height),text(area),text(width),text(height+2)],explanation:`가로×세로=넓이이므로 세로=${area}÷${width}=${height} cm입니다.`,unit:'cm',templateFamily:'formula-area-inverse',conceptId:'formula-area-inverse',noveltyKind:'multi-step-application',cognitiveDemand:'reasoning',difficulty:'challenge'});
     rows.push({question:`가로 ${width} cm, 세로 ${height} cm인 직사각형에서 넓이가 ${width} cm²인 부분을 오려 냈습니다. 남은 넓이는?`,answer:text(remaining),choices:[text(remaining),text(area),text(width+height),text(area+width)],explanation:`처음 넓이 ${width}×${height}=${area}에서 오려 낸 ${width}를 빼면 ${remaining} cm²입니다.`,unit:'cm²',templateFamily:'formula-area-remaining',conceptId:'formula-area-remaining',noveltyKind:'multi-step-application',cognitiveDemand:'application',difficulty:'standard'});
    }

   }
  }
  return rows;
 }
 root.MockMathTransfer={create,createFormula};
})(window);

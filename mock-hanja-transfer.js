(function(root){
 'use strict';
 function create(scope,bank,rng=Math.random){
  const norm=s=>String(s||'').replace(/\s/g,''),rows=[];
  const learned=bank.filter(w=>scope.attempts.some(a=>[a.hanja,a.word,a.question,a.correctAnswer].some(v=>norm(v)===norm(w.hanja))||String(a.question||'').includes(w.hanja)));
  const add=(family,question,answer,choices,explanation,difficulty='standard')=>{
   if(new Set(choices).size!==4||!choices.includes(answer))return;
   rows.push({question,answer,choices,explanation,templateFamily:family,conceptId:family,noveltyKind:'multi-step-application',cognitiveDemand:difficulty==='challenge'?'reasoning':'application',difficulty});
  };
  for(const a of learned)for(const b of learned){if(a.hanja===b.hanja)continue;
   const c=learned.find(w=>w.hanja!==a.hanja&&w.hanja!==b.hanja);if(!c)continue;
   const answer=`${a.hanja} / ${b.hanja}`;
   add(`hanja-two-clues:${a.hanja}:${b.hanja}`,`전시 카드의 첫째 칸에는 ‘${a.meaning} ${a.eum}’, 둘째 칸에는 ‘${b.meaning} ${b.eum}’을 써야 합니다. 두 조건을 모두 맞춘 카드는?`,answer,[answer,`${b.hanja} / ${a.hanja}`,`${a.hanja} / ${c.hanja}`,`${c.hanja} / ${b.hanja}`],`첫째 조건은 ${a.hanja}(${a.meaning} ${a.eum}), 둘째 조건은 ${b.hanja}(${b.meaning} ${b.eum})입니다. 한 칸만 맞거나 순서를 바꾸면 두 조건을 모두 만족하지 못합니다.`);
  }
  const numberWords={'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10};
  const numerals=learned.filter(w=>numberWords[w.hanja]);
  const symbol=value=>numerals.find(w=>numberWords[w.hanja]===value)?.hanja;
  for(const a of numerals)for(const b of numerals){
   const left=numberWords[a.hanja],right=numberWords[b.hanja];
   if(left===right||right<2)continue;
   const l=symbol(left+1),r=symbol(right-1);if(!l||!r||!symbol(1))continue;
   const answer=`${l} / ${r}`,others=[`${a.hanja} / ${b.hanja}`,`${r} / ${l}`,`${l} / ${b.hanja}`];
   add('hanja-numeral-transfer',`첫 상자에 ‘${a.hanja}’개, 둘째 상자에 ‘${b.hanja}’개가 있습니다. 둘째에서 ‘一’개를 첫째로 옮겼습니다. 옮긴 뒤 첫째 / 둘째 상자의 수를 한자로 바르게 표시한 것은?`,answer,[answer,...others],`${a.hanja}는 ${left}, ${b.hanja}는 ${right}, 一은 1입니다. 옮긴 뒤 수는 ${left}+1=${left+1}, ${right}−1=${right-1}이므로 ${l} / ${r}입니다.`,'challenge');
  }
  return rows;
 }
 root.MockHanjaTransfer={create};
})(window);

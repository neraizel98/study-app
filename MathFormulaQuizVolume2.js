(() => {
    const previous = window.MathFormulaQuiz;
    const legacyLevels = previous.create(1).map(question => question.level);
    const pick = values => values[Math.floor(Math.random() * values.length)];
    const round = (n, d = 2) => Number(n.toFixed(d));
    const shuffle = values => [...values].sort(() => Math.random() - .5);
    const makeChoices = answer => {
        const n = Number(answer);
        const pool = [n, round(n * 2), round(n / 2), round(n + Math.max(1, Math.abs(n) * .25)), round(n - Math.max(1, Math.abs(n) * .2))];
        let bump = 1;
        while (new Set(pool.map(String)).size < 4) pool.push(round(n + bump++));
        return shuffle([...new Set(pool.map(String))].slice(0, 4));
    };
    const q = (prompt, answer, solution, unit = '') => ({
        level:'계산 연습', kind:'choice', prompt, answer:String(answer),
        choices:makeChoices(answer), solution, unit
    });
    const triple = (a,b,c) => [a,b,c];
    const pi = n => round(n * Math.PI);

    const generators = {
        31:()=>{const r=pick([3,4,5,6,8]);return triple(q(`반지름이 ${r} cm인 원의 넓이를 π=3.14로 계산하면?`,round(3.14*r*r),`3.14×${r}²`,'cm²'),q(`넓이가 ${r*r}π cm²인 원의 반지름은?`,r,`r²=${r*r}`,'cm'),q(`반지름 ${r} cm인 반원의 넓이를 π=3.14로 계산하면?`,round(3.14*r*r/2),`원의 넓이의 절반`,'cm²'));},
        32:()=>{const r=pick([3,5,7,8,10]);return triple(q(`반지름 ${r} cm인 원의 둘레를 π=3.14로 계산하면?`,round(2*3.14*r),`2×3.14×${r}`,'cm'),q(`지름 ${2*r} cm인 원의 둘레는 몇 π cm인가?`,2*r,`πd=${2*r}π`,'π cm'),q(`둘레가 ${2*r}π cm인 원의 반지름은?`,r,`2πr=${2*r}π`,'cm'));},
        33:()=>{const a=pick([2,3,4]),b=pick([1,2,5]),r=pick([3,4,6]);return triple(q(`원의 방정식 (x-${a})²+(y-${b})²=${r*r}의 반지름은?`,r,`r²=${r*r}`),q(`중심이 (${a},${b}), 반지름이 ${r}인 원에서 오른쪽 끝점의 x좌표는?`,a+r,`${a}+${r}`),q(`중심이 (${a},${b})인 원의 방정식 괄호 속 y항은 y-□이다. □는?`,b,`중심 좌표를 넣습니다.`));},
        34:()=>{const beta=pick([25,30,35,40,55]);return triple(q(`원주각이 ${beta}°일 때 같은 호의 중심각은?`,beta*2,`중심각=원주각×2`,'°'),q(`중심각이 ${beta*2}°일 때 같은 호의 원주각은?`,beta,`원주각=중심각÷2`,'°'),q(`같은 호를 보는 한 원주각이 ${beta}°이면 다른 원주각은?`,beta,`같은 호의 원주각은 같습니다.`,'°'));},
        35:()=>{const a=pick([2,3,4,5]),b=pick([8,10,12]),c=pick([4,5,6]);const d=a*b/c;return triple(q(`PA=${a}, PB=${b}, PC=${c}일 때 PD는?`,d,`${a}×${b}=${c}×PD`),q(`PA·PB가 ${a*b}이면 PC·PD는?`,a*b,`방멱의 정리로 두 곱은 같습니다.`),q(`PC=${c}, PD=${d}일 때 PA·PB는?`,a*b,`${c}×${d}`));},
        36:()=>{const angle=pick([28,35,42,50,63]);return triple(q(`접선과 현의 각이 ${angle}°일 때 같은 현을 보는 원주각은?`,angle,`접현의 정리`,'°'),q(`원주각이 ${angle}°이면 대응하는 접선-현 각은?`,angle,`두 각은 같습니다.`,'°'),q(`접점에서 반지름과 접선이 이루는 각은?`,90,`반지름과 접선은 수직입니다.`,'°'));},
        37:()=>{const d=pick([4,5,8,10]);const l=round(3.14*d);return triple(q(`지름 ${d} cm, 둘레 ${l} cm인 원에서 둘레÷지름은?`,3.14,`${l}÷${d}`),q(`원주율을 3.14로 보고 지름 ${d} cm인 원의 둘레는?`,l,`3.14×${d}`,'cm'),q(`둘레 ${l} cm인 원의 지름은?`,d,`${l}÷3.14`,'cm'));},
        38:()=>{const terms=pick([2,3,4]);let sum=0;for(let i=0;i<terms;i++)sum+=(i%2?-1:1)/(2*i+1);const val=round(4*sum,3);return triple(q(`라이프니츠 공식의 앞 ${terms}항을 사용한 4×합은?`,val,`4×(1-1/3+…)`),q(`공식에서 다섯 번째 분모는?`,9,`분모는 1,3,5,7,9`),q(`공식에서 더하기와 빼기는 몇 항마다 바뀌는가?`,1,`매 항마다 번갈아 바뀝니다.`,'항'));},
        39:()=>{const r=pick([2,3,4,5]),theta=pick([1,1.5,2]);const l=r*theta;return triple(q(`반지름 ${r}, 호의 길이 ${l}인 부채꼴 중심각은?`,theta,`θ=ℓ/r`,'rad'),q(`중심각 ${theta} rad, 반지름 ${r}일 때 호의 길이는?`,l,`ℓ=rθ`),q(`호의 길이가 반지름과 같을 때 중심각은?`,1,`ℓ/r=1`,'rad'));},
        40:()=>{const r=pick([2,4,6]),theta=pick([1,1.5,2]);const s=r*r*theta/2;return triple(q(`r=${r}, θ=${theta} rad인 부채꼴 넓이는?`,s,`½r²θ`),q(`r=${r}, 호의 길이 ${r*theta}인 부채꼴 넓이는?`,s,`½rℓ`),q(`같은 반지름에서 중심각이 2배면 넓이는 몇 배?`,2,`넓이는 중심각에 비례합니다.`,'배'));},
        41:()=>{const r=pick([3,4,5,6]),theta=pick([1,1.5,2]);return triple(q(`r=${r}, θ=${theta} rad인 호의 길이는?`,r*theta,`rθ`),q(`호 ${r*theta}, 반지름 ${r}일 때 θ는?`,theta,`ℓ/r`,'rad'),q(`반지름이 2배이고 각이 같으면 호의 길이는 몇 배?`,2,`ℓ은 r에 비례합니다.`,'배'));},
        42:()=>{const a=pick([3,4,5,6]),b=pick([2,3,4]);return triple(q(`긴반지름 ${a}, 짧은반지름 ${b}인 타원 넓이는 몇 π인가?`,a*b,`πab`,'π'),q(`넓이가 ${a*b}π이고 a=${a}이면 b는?`,b,`${a*b}÷${a}`),q(`a와 b를 모두 2배 하면 넓이는 몇 배?`,4,`2×2=4`,'배'));},
        43:()=>{const [a,b,c]=pick([[5,4,3],[13,12,5],[10,8,6]]);return triple(q(`a=${a}, b=${b}인 타원의 이심률은?`,c/a,`√(1-b²/a²)=${c}/${a}`),q(`초점거리 c=${c}, 긴반지름 a=${a}일 때 e는?`,c/a,`e=c/a`),q(`원에 가까워질수록 이심률은 어느 값에 가까워지는가?`,0,`원은 a=b이므로 e=0`));},
        44:()=>{const a=pick([3,4,5]),b=pick([2,3]);return triple(q(`x²/${a*a}+y²/${b*b}=1의 x축 반지름은?`,a,`√${a*a}`),q(`같은 타원의 y축 반지름은?`,b,`√${b*b}`),q(`이 타원의 넓이는 몇 π인가?`,a*b,`πab`,'π'));},
        45:()=>{const r=pick([2,3,6]);return triple(q(`반지름 ${r}인 구의 부피는 몇 π인가?`,4*r*r*r/3,`4r³/3`,'π'),q(`반지름이 2배면 구의 부피는 몇 배?`,8,`2³=8`,'배'),q(`r=${r}에서 r³은?`,r*r*r,`${r}×${r}×${r}`));},
        46:()=>{const r=pick([2,3,5,7]);return triple(q(`반지름 ${r}인 구의 겉넓이는 몇 π인가?`,4*r*r,`4r²`,'π'),q(`반지름이 3배면 겉넓이는 몇 배?`,9,`3²=9`,'배'),q(`구 겉넓이는 같은 반지름 원 넓이의 몇 배?`,4,`A=4πr²`,'배'));},
        47:()=>{const r=pick([2,3,4,5]),h=pick([4,6,8]);return triple(q(`r=${r}, h=${h}인 원기둥 부피는 몇 π인가?`,r*r*h,`r²h`,'π'),q(`밑넓이가 ${r*r}π, 높이가 ${h}이면 부피는 몇 π?`,r*r*h,`밑넓이×높이`,'π'),q(`높이가 2배면 부피는 몇 배?`,2,`부피는 높이에 비례`,'배'));},
        48:()=>{const r=pick([2,3,4]),h=pick([4,5,7]);const a=2*r*h+2*r*r;return triple(q(`r=${r}, h=${h}인 원기둥 겉넓이는 몇 π인가?`,a,`2rh+2r²`,'π'),q(`같은 원기둥의 옆넓이는 몇 π인가?`,2*r*h,`2rh`,'π'),q(`두 밑면 넓이는 몇 π인가?`,2*r*r,`2r²`,'π'));},
        49:()=>{const r=pick([3,4,6]),h=pick([3,6,9]);return triple(q(`r=${r}, h=${h}인 원뿔 부피는 몇 π인가?`,r*r*h/3,`r²h/3`,'π'),q(`같은 밑면·높이의 원기둥 부피가 ${r*r*h}π이면 원뿔은 몇 π?`,r*r*h/3,`3으로 나눕니다.`,'π'),q(`원뿔 부피는 같은 기둥의 몇 분의 1?`,1/3,`V=기둥÷3`));},
        50:()=>{const [r,h,l]=pick([[3,4,5],[5,12,13],[6,8,10]]);return triple(q(`r=${r}, h=${h}인 원뿔의 모선은?`,l,`√(r²+h²)`),q(`r=${r}, 모선=${l}인 원뿔 겉넓이는 몇 π?`,r*l+r*r,`rℓ+r²`,'π'),q(`같은 원뿔의 옆넓이는 몇 π?`,r*l,`πrℓ`,'π'));},
        51:()=>{const A=pick([12,18,24]),h=pick([6,9,12]);return triple(q(`밑넓이 ${A}, 높이 ${h}인 삼각뿔 부피는?`,A*h/3,`Ah/3`),q(`같은 밑면·높이의 삼각기둥 부피가 ${A*h}이면 삼각뿔은?`,A*h/3,`3으로 나눕니다.`),q(`뿔 부피는 같은 기둥의 몇 분의 1?`,1/3,`공통 비율`));},
        52:()=>{const a=pick([3,6,9]),h=pick([6,9,12]);return triple(q(`밑면 한 변 ${a}, 높이 ${h}인 정사각뿔 부피는?`,a*a*h/3,`a²h/3`),q(`밑넓이는?`,a*a,`${a}²`),q(`같은 밑면·높이의 기둥 부피는?`,a*a*h,`a²h`));},
        53:()=>{const [a,b,s]=pick([[6,5,4],[8,5,3],[10,13,12]]);return triple(q(`밑면 변 ${a}, 옆모서리 ${b}인 정사각뿔 옆면 높이는?`,s,`√(b²-(a/2)²)`),q(`옆면 삼각형 4개의 넓이는?`,2*a*s,`4×½as`),q(`겉넓이는?`,2*a*s+a*a,`옆넓이+밑넓이`));},
        54:()=>{const [a,b]=pick([[6,5],[4,3],[8,7]]);const h=round(Math.sqrt(b*b-a*a/2));return triple(q(`a=${a}, b=${b}인 정사각뿔 높이는?`,h,`√(b²-a²/2)`),q(`밑면 중심에서 꼭짓점까지 거리의 제곱은?`,a*a/2,`a²/2`),q(`높이의 제곱 h²은?`,b*b-a*a/2,`b²-a²/2`));},
        55:()=>{const a=pick([6,12,18]);return triple(q(`모서리 ${a}인 정사면체 부피에서 √2의 계수는?`,a*a*a/12,`a³/12`),q(`모서리가 2배면 부피는 몇 배?`,8,`2³`,'배'),q(`a=${a}일 때 a³은?`,a*a*a,`${a}³`));},
        56:()=>{const a=pick([2,4,6,8]);return triple(q(`모서리 ${a}인 정사면체 겉넓이에서 √3의 계수는?`,a*a,`A=√3a²`),q(`한 면 정삼각형 넓이에서 √3의 계수는?`,a*a/4,`√3a²/4`),q(`정사면체의 면 개수는?`,4,`정삼각형 4개`,'개'));},
        57:()=>{const a=pick([3,6,9]);return triple(q(`정사면체 높이 h=a√(2/3)에서 a=${a}일 때 h²은?`,2*a*a/3,`h²=2a²/3`),q(`밑면 중심에서 꼭짓점까지 거리의 제곱은?`,a*a/3,`a²/3`),q(`모서리가 2배면 높이는 몇 배?`,2,`높이는 a에 비례`,'배'));},
        58:()=>{const a=pick([3,4,5,6,8]);return triple(q(`모서리 ${a}인 정육면체 부피는?`,a*a*a,`${a}³`),q(`모서리가 3배면 부피는 몇 배?`,27,`3³`,'배'),q(`부피가 ${a*a*a}인 정육면체 모서리는?`,a,`세제곱근`));},
        59:()=>{const a=pick([3,4,5,7]);return triple(q(`모서리 ${a}인 정육면체 겉넓이는?`,6*a*a,`6a²`),q(`한 면 넓이는?`,a*a,`a²`),q(`정육면체의 면 개수는?`,6,`정사각형 6개`,'개'));},
        60:()=>{const a=pick([3,4,5]),b=pick([4,6,8]),c=pick([2,3,5]);return triple(q(`가로 ${a}, 세로 ${b}, 높이 ${c}인 직육면체 부피는?`,a*b*c,`abc`),q(`밑넓이는?`,a*b,`ab`),q(`부피가 ${a*b*c}, 밑넓이가 ${a*b}이면 높이는?`,c,`부피÷밑넓이`));}
    };
    const normalized = Object.fromEntries(Object.entries(generators).map(([number, generator]) => [
        number,
        () => generator().map((question, index) => ({ ...question, level: legacyLevels[index] }))
    ]));
    SmartStudy.QuizRegistry.registerFormulaGenerators('MathFormulaQuizVolume2.js', normalized);
})();

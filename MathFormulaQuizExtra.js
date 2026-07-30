(() => {
    const baseQuiz = MathFormulaQuiz;
    const pick = values => values[Math.floor(Math.random() * values.length)];
    const shuffle = values => [...values].sort(() => Math.random() - 0.5);
    const round = (value, digits = 2) => Number(value.toFixed(digits));
    const choices = answer => {
        const candidates = [answer, round(answer * 2), round(answer / 2), round(answer + Math.max(1, Math.abs(answer) * .25))];
        let bump = 1;
        while (new Set(candidates.map(String)).size < 4) candidates.push(round(answer + bump++));
        return shuffle([...new Map(candidates.map(value => [String(value), value])).values()].slice(0, 4)).map(String);
    };
    const mc = (level, prompt, answer, solution, unit = '') => ({
        level, kind: 'choice', prompt, answer: String(answer), choices: choices(answer), solution, unit
    });
    const written = (prompt, answer, solution, unit = '', tolerance = .03) => ({
        level: '서술형', kind: 'written', prompt, answer: Number(answer), solution, unit, tolerance
    });
    const set = (basic, deep, story) => [basic, deep, story];

    const generators = {
        11() {
            const [a, b] = pick([[3, 4], [5, 6], [6, 8]]);
            const area = a * b / 2;
            return set(
                mc('기본 연산', `서로 수직인 두 벡터의 길이가 ${a}, ${b}일 때 두 벡터가 만드는 삼각형의 넓이는?`, area, `내적이 0인 수직 벡터이므로 S=½×${a}×${b}=${area}입니다.`),
                mc('심화 연산', `|a|=${a}, |b|=${b}, a·b=0일 때 √(|a|²|b|²-(a·b)²)의 값은?`, a * b, `√(${a}²×${b}²)=${a * b}입니다.`),
                written(`한 점에서 서로 수직인 길이 ${a}, ${b}의 두 벡터를 그었습니다. 평행사변형이 아닌 삼각형의 넓이를 입력하세요.`, area, `평행사변형 넓이 ${a * b}의 절반이므로 ${area}입니다.`)
            );
        },
        12() {
            const [x, y] = pick([[4, 3], [6, 4], [8, 5]]);
            const area = x * y / 2;
            return set(
                mc('기본 연산', `A(0,0), B(${x},0), C(0,${y})인 삼각형의 넓이는?`, area, `직각삼각형이므로 ½×${x}×${y}=${area}입니다.`),
                mc('심화 연산', `사선 공식에서 세 점 (0,0), (${x},0), (1,${y})를 계산한 넓이는?`, area, `½|${x}×${y}|=${area}입니다.`),
                written(`좌표 A(0,0), B(${x},0), C(1,${y})를 시계 방향으로 적고 사선 공식을 적용한 넓이를 입력하세요.`, area, `S=½|0+${x * y}+0-0-0-0|=${area}입니다.`)
            );
        },
        13() {
            const [x, y] = pick([[3, 2], [4, 3], [5, 4]]);
            return set(
                mc('기본 연산', `A(0,0), B(${x * 2},0), C(${x},${y * 3})의 무게중심 x좌표는?`, x, `x좌표 평균은 (0+${x * 2}+${x})÷3=${x}입니다.`),
                mc('심화 연산', `같은 삼각형의 무게중심 y좌표는?`, y, `y좌표 평균은 (0+0+${y * 3})÷3=${y}입니다.`),
                written(`A(0,0), B(${x * 2},0), C(${x},${y * 3})의 무게중심 좌표에서 x+y 값을 입력하세요.`, x + y, `G=(${x},${y})이므로 x+y=${x + y}입니다.`)
            );
        },
        14() {
            const [ab, ac, bm] = pick([[5, 7, 3], [7, 9, 4], [8, 10, 3]]);
            const am2 = (ab * ab + ac * ac) / 2 - bm * bm;
            return set(
                mc('기본 연산', `AB=${ab}, AC=${ac}, BM=${bm}이고 M이 BC의 중점일 때 AM²은?`, am2, `AM²=(${ab}²+${ac}²)÷2-${bm}²=${am2}입니다.`),
                mc('심화 연산', `중선 정리의 오른쪽 2(AM²+BM²) 값은?`, ab * ab + ac * ac, `왼쪽 AB²+AC²=${ab * ab + ac * ac}와 같습니다.`),
                written(`AB=${ab}, AC=${ac}, BM=${bm}인 삼각형에서 중선 AM의 길이의 제곱을 입력하세요.`, am2, `중선 정리를 정리하면 AM²=${am2}입니다.`)
            );
        },
        15: () => {
            const a = pick([4, 6, 8, 11]); const area = a * a;
            return set(mc('기본 연산', `한 변이 ${a} cm인 정사각형의 넓이는?`, area, `${a}×${a}=${area} cm²입니다.`, 'cm²'),
                mc('심화 연산', `넓이가 ${area} cm²인 정사각형 한 변은?`, a, `√${area}=${a} cm입니다.`, 'cm'),
                written(`한 변이 ${a} cm인 정사각형 바닥에 1 cm² 타일을 빈틈없이 놓을 때 필요한 개수를 입력하세요.`, area, `${a}줄에 각각 ${a}개이므로 ${area}개입니다.`, '개'));
        },
        16: () => {
            const [a, b] = pick([[6, 4], [8, 5], [12, 7]]); const area = a * b;
            return set(mc('기본 연산', `가로 ${a} cm, 세로 ${b} cm인 직사각형의 넓이는?`, area, `${a}×${b}=${area} cm²입니다.`, 'cm²'),
                mc('심화 연산', `넓이가 ${area} cm²이고 가로가 ${a} cm인 직사각형의 세로는?`, b, `${area}÷${a}=${b} cm입니다.`, 'cm'),
                written(`가로 ${a} m, 세로 ${b} m인 방의 바닥 넓이를 입력하세요.`, area, `A=ab=${area} m²입니다.`, 'm²'));
        },
        17: () => {
            const [a, b] = pick([[7, 4], [9, 5], [12, 8]]); const perimeter = 2 * (a + b);
            return set(mc('기본 연산', `가로 ${a} cm, 세로 ${b} cm인 직사각형의 둘레는?`, perimeter, `2×(${a}+${b})=${perimeter} cm입니다.`, 'cm'),
                mc('심화 연산', `둘레가 ${perimeter} cm이고 가로가 ${a} cm일 때 세로는?`, b, `${perimeter}÷2-${a}=${b} cm입니다.`, 'cm'),
                written(`가로 ${a} m, 세로 ${b} m인 텃밭 가장자리에 울타리를 두를 때 필요한 길이를 입력하세요.`, perimeter, `2a+2b=${perimeter} m입니다.`, 'm'));
        },
        18: () => {
            const [a, b, d] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]]);
            return set(mc('기본 연산', `가로 ${a} cm, 세로 ${b} cm인 직사각형의 대각선은?`, d, `√(${a}²+${b}²)=${d} cm입니다.`, 'cm'),
                mc('심화 연산', `대각선 ${d} cm, 가로 ${a} cm인 직사각형의 세로는?`, b, `√(${d}²-${a}²)=${b} cm입니다.`, 'cm'),
                written(`가로 ${a} m, 세로 ${b} m인 직사각형 운동장을 대각선으로 가로지를 때 거리를 입력하세요.`, d, `피타고라스 정리로 ${d} m입니다.`, 'm'));
        },
        19: () => {
            const [d1, d2] = pick([[8, 6], [10, 12], [14, 8]]); const area = d1 * d2 / 2;
            return set(mc('기본 연산', `두 대각선이 ${d1} cm, ${d2} cm인 마름모의 넓이는?`, area, `½×${d1}×${d2}=${area} cm²입니다.`, 'cm²'),
                mc('심화 연산', `넓이가 ${area} cm²이고 한 대각선이 ${d1} cm일 때 다른 대각선은?`, d2, `2S÷d₁=${d2} cm입니다.`, 'cm'),
                written(`대각선 길이가 ${d1} m와 ${d2} m인 마름모 화단의 넓이를 입력하세요.`, area, `대각선 곱의 절반인 ${area} m²입니다.`, 'm²'));
        },
        20: () => {
            const [a, h] = pick([[8, 5], [11, 6], [13, 7]]); const area = a * h;
            return set(mc('기본 연산', `밑변 ${a} cm, 높이 ${h} cm인 평행사변형의 넓이는?`, area, `${a}×${h}=${area} cm²입니다.`, 'cm²'),
                mc('심화 연산', `넓이가 ${area} cm²이고 밑변이 ${a} cm일 때 높이는?`, h, `${area}÷${a}=${h} cm입니다.`, 'cm'),
                written(`밑변 ${a} m, 수직 높이 ${h} m인 평행사변형 땅의 넓이를 입력하세요.`, area, `A=ah=${area} m²입니다.`, 'm²'));
        },
        21: () => {
            const [a, b, h] = pick([[5, 9, 4], [7, 13, 6], [8, 14, 5]]); const area = (a + b) * h / 2;
            return set(mc('기본 연산', `윗변 ${a} cm, 아랫변 ${b} cm, 높이 ${h} cm인 사다리꼴의 넓이는?`, area, `½×(${a}+${b})×${h}=${area} cm²입니다.`, 'cm²'),
                mc('심화 연산', `넓이가 ${area} cm², 두 평행한 변이 ${a}, ${b} cm일 때 높이는?`, h, `2S÷(a+b)=${h} cm입니다.`, 'cm'),
                written(`평행한 두 변이 ${a} m와 ${b} m, 높이가 ${h} m인 사다리꼴 땅의 넓이를 입력하세요.`, area, `${area} m²입니다.`, 'm²'));
        },
        22: () => {
            const [d1, d2] = pick([[8, 6], [10, 12], [14, 10]]); const area = d1 * d2 / 2;
            return set(mc('기본 연산', `대각선 ${d1}, ${d2} cm가 수직인 사각형의 넓이는?`, area, `sin90°=1이므로 ½×${d1}×${d2}=${area}입니다.`, 'cm²'),
                mc('심화 연산', `같은 사각형에서 두 대각선 사이 각의 sin값은?`, 1, `수직이므로 θ=90°, sinθ=1입니다.`),
                written(`두 대각선이 ${d1} m와 ${d2} m이고 직각으로 만나는 연 모양 사각형의 넓이를 입력하세요.`, area, `S=½d₁d₂=${area} m²입니다.`, 'm²'));
        },
        23: () => {
            const a = pick([2, 4, 6]); const area = round(a * a / 4 * Math.sqrt(25 + 10 * Math.sqrt(5)));
            return set(mc('기본 연산', `한 변이 ${a} cm인 정오각형의 넓이를 소수 둘째 자리까지 구하면?`, area, `공식에 a=${a}를 넣으면 약 ${area} cm²입니다.`, 'cm²'),
                mc('심화 연산', `정오각형을 중심에서 나누면 같은 삼각형이 몇 개 생기는가?`, 5, `꼭짓점이 5개이므로 5개입니다.`, '개'),
                written(`한 변이 ${a} cm인 정오각형의 넓이를 공식으로 계산해 소수 둘째 자리까지 입력하세요.`, area, `S=(a²/4)√(25+10√5)≈${area}입니다.`, 'cm²'));
        },
        24: () => {
            const a = pick([2, 4, 6]); const h = round(a / 2 * Math.sqrt(5 + 2 * Math.sqrt(5)));
            return set(mc('기본 연산', `한 변이 ${a} cm인 정오각형의 높이는 약 얼마인가?`, h, `h=(a/2)√(5+2√5)≈${h} cm입니다.`, 'cm'),
                mc('심화 연산', `한 변이 ${a} cm일 때 높이는 한 변보다 얼마나 긴가?`, round(h - a), `${h}-${a}=${round(h - a)} cm입니다.`, 'cm'),
                written(`한 변 ${a} cm인 정오각형의 위 꼭짓점에서 반대편 변까지 높이를 소수 둘째 자리까지 입력하세요.`, h, `공식에 대입하면 ${h} cm입니다.`, 'cm'));
        },
        25: () => {
            const a = pick([4, 6, 8]); const d = round((1 + Math.sqrt(5)) / 2 * a);
            return set(mc('기본 연산', `한 변이 ${a} cm인 정오각형의 대각선은 약 얼마인가?`, d, `황금비 약 1.618을 곱하면 ${d} cm입니다.`, 'cm'),
                mc('심화 연산', `정오각형의 대각선/변의 비를 소수 셋째 자리까지 쓰면?`, 1.618, `황금비 (1+√5)/2≈1.618입니다.`),
                written(`한 변이 ${a} cm인 정오각형 별의 대각선 길이를 소수 둘째 자리까지 입력하세요.`, d, `d=φa≈${d} cm입니다.`, 'cm'));
        },
        26: () => {
            const a = pick([2, 4, 6]); const coefficient = 3 * a * a / 2; const area = round(coefficient * Math.sqrt(3));
            return set(mc('기본 연산', `한 변이 ${a} cm인 정육각형 넓이가 k√3 cm²일 때 k는?`, coefficient, `k=3a²/2=${coefficient}입니다.`),
                mc('심화 연산', `같은 정육각형 넓이를 소수 둘째 자리까지 구하면?`, area, `${coefficient}√3≈${area} cm²입니다.`, 'cm²'),
                written(`한 변 ${a} cm인 정삼각형 6개로 만든 정육각형의 넓이를 소수 둘째 자리까지 입력하세요.`, area, `6×(√3/4)×${a}²≈${area}입니다.`, 'cm²'));
        },
        27: () => {
            const n = pick([6, 7, 8, 10, 12]); const count = n * (n - 3) / 2;
            return set(mc('기본 연산', `${n}각형의 대각선 수는?`, count, `${n}×(${n}-3)÷2=${count}개입니다.`, '개'),
                mc('심화 연산', `한 꼭짓점에서 그을 수 있는 대각선 수는?`, n - 3, `자기 자신과 양옆 두 점을 빼면 ${n - 3}개입니다.`, '개'),
                written(`${n}각형의 모든 꼭짓점에서 대각선을 세되 중복을 제거한 개수를 입력하세요.`, count, `D=n(n-3)/2=${count}개입니다.`, '개'));
        },
        28: () => {
            const n = pick([5, 6, 7, 9, 12]); const sum = 180 * (n - 2);
            return set(mc('기본 연산', `${n}각형의 내각의 합은?`, sum, `180×(${n}-2)=${sum}°입니다.`, '°'),
                mc('심화 연산', `한 꼭짓점에서 삼각형으로 나누면 몇 개가 되는가?`, n - 2, `${n}-2=${n - 2}개입니다.`, '개'),
                written(`${n}각형을 한 꼭짓점에서 삼각형으로 나누어 내각의 합을 입력하세요.`, sum, `${n - 2}개의 삼각형이므로 ${sum}°입니다.`, '°'));
        },
        29: () => {
            const [n, a] = pick([[4, 5], [6, 4], [8, 4]]); const area = round(n * a * a / (4 * Math.tan(Math.PI / n)));
            return set(mc('기본 연산', `n=${n}, a=${a}인 정다각형의 넓이를 소수 둘째 자리까지 구하면?`, area, `S=na²/(4tan(π/n))≈${area}입니다.`),
                mc('심화 연산', `정${n}각형을 중심에서 나누면 같은 삼각형이 몇 개인가?`, n, `변과 꼭짓점이 ${n}개이므로 ${n}개입니다.`, '개'),
                written(`한 변 ${a} cm인 정${n}각형 넓이를 공식으로 계산해 소수 둘째 자리까지 입력하세요.`, area, `공식에 n=${n}, a=${a}를 넣으면 ${area} cm²입니다.`, 'cm²'));
        },
        30: () => {
            const n = pick([5, 6, 8, 9, 10, 12]); const angle = 180 * (n - 2) / n;
            return set(mc('기본 연산', `정${n}각형의 한 내각은?`, angle, `180×(${n}-2)÷${n}=${angle}°입니다.`, '°'),
                mc('심화 연산', `정${n}각형의 내각의 합은?`, 180 * (n - 2), `180×(${n}-2)=${180 * (n - 2)}°입니다.`, '°'),
                written(`모든 각이 같은 정${n}각형의 한 내각 크기를 입력하세요.`, angle, `내각의 합을 ${n}으로 나누면 ${angle}°입니다.`, '°'));
        }
    };

    SmartStudy.QuizRegistry.registerFormulaGenerators('MathFormulaQuizExtra.js', generators);
})();

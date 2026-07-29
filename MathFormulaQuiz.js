const MathFormulaQuiz = (() => {
    const pick = values => values[Math.floor(Math.random() * values.length)];
    const shuffle = values => [...values].sort(() => Math.random() - 0.5);
    const round = (value, digits = 2) => Number(value.toFixed(digits));
    const uniqueChoices = (answer, candidates) => {
        const values = [answer, ...candidates].filter((v, i, all) => all.findIndex(x => String(x) === String(v)) === i);
        let bump = 1;
        while (values.length < 4) {
            const value = typeof answer === 'number' ? round(answer + bump) : `${answer} (${bump})`;
            if (!values.includes(value)) values.push(value);
            bump += 1;
        }
        return shuffle(values.slice(0, 4));
    };
    const mc = (level, prompt, answer, distractors, solution, unit = '') => ({
        level, kind: 'choice', prompt, answer: String(answer),
        choices: uniqueChoices(answer, distractors).map(String), solution, unit
    });
    const written = (prompt, answer, solution, unit = '', tolerance = 0.02) => ({
        level: '서술형', kind: 'written', prompt, answer: Number(answer), solution, unit, tolerance
    });

    const generators = {
        1() {
            const a = pick([4, 6, 8, 10, 12]);
            const k = a * a / 4;
            const basic = mc('기본 연산', `한 변이 ${a} cm인 정삼각형의 넓이를 k√3 cm²라 할 때 k는?`, k,
                [k / 2, k * 2, a * a], `A=(√3/4)×${a}²=${k}√3이므로 k=${k}입니다.`);
            const area = round(k * Math.sqrt(3));
            const deep = mc('심화 연산', `한 변이 ${a} cm인 정삼각형 넓이를 소수 둘째 자리까지 구하면?`, area,
                [round(area / 2), round(area + a), round(a * Math.sqrt(3))],
                `A=${k}√3≈${k}×1.732=${area} cm²입니다.`, 'cm²');
            return [basic, deep, written(`정삼각형 한 변이 ${a} cm입니다. 높이를 먼저 구하는 과정을 생각하여 넓이를 소수 둘째 자리까지 입력하세요.`, area,
                `높이 h=(√3/2)×${a}≈${round(a * Math.sqrt(3) / 2)} cm, 따라서 A=${a}×h÷2≈${area} cm²입니다.`, 'cm²')];
        },
        2() {
            const a = pick([4, 6, 8, 10, 12]);
            const k = a / 2;
            const h = round(k * Math.sqrt(3));
            return [
                mc('기본 연산', `한 변이 ${a} cm인 정삼각형의 높이는 k√3 cm입니다. k는?`, k, [a, k * 2, k / 2],
                    `h=(√3/2)×${a}=${k}√3이므로 k=${k}입니다.`),
                mc('심화 연산', `한 변이 ${a} cm인 정삼각형의 높이를 소수 둘째 자리까지 구하면?`, h,
                    [round(h / 2), round(h + 2), round(a * Math.sqrt(3))],
                    `h=${k}√3≈${k}×1.732=${h} cm입니다.`, 'cm'),
                written(`한 변이 ${a} cm인 정삼각형을 반으로 나누어 생긴 직각삼각형에 피타고라스 정리를 적용하세요. 높이를 소수 둘째 자리까지 입력하세요.`, h,
                    `h²=${a}²-(${a}/2)²=${a * a}-${a * a / 4}=${3 * a * a / 4}, 따라서 h≈${h} cm입니다.`, 'cm')
            ];
        },
        3() {
            const [a, b] = pick([[3, 4], [5, 12], [6, 8], [8, 15], [9, 12]]);
            const area = a * b / 2;
            const hyp = Math.sqrt(a * a + b * b);
            return [
                mc('기본 연산', `직각을 이루는 두 변이 ${a} cm와 ${b} cm입니다. 넓이는?`, area,
                    [a * b, area + a, area + b], `S=${a}×${b}÷2=${area} cm²입니다.`, 'cm²'),
                mc('심화 연산', `빗변이 ${hyp} cm이고 한 직각변이 ${a} cm인 직각삼각형의 넓이는?`, area,
                    [a * b, area / 2, area + hyp],
                    `다른 변은 √(${hyp}²-${a}²)=${b} cm이므로 S=${a}×${b}÷2=${area} cm²입니다.`, 'cm²'),
                written(`직사각형을 대각선으로 잘라 직각삼각형 두 개를 만들었습니다. 직사각형의 가로가 ${b} cm, 세로가 ${a} cm일 때 삼각형 하나의 넓이를 입력하세요.`, area,
                    `직사각형 넓이는 ${a}×${b}=${a * b} cm²이고 대각선이 정확히 반으로 나누므로 ${area} cm²입니다.`, 'cm²')
            ];
        },
        4() {
            const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15]]);
            return [
                mc('기본 연산', `직각을 이루는 두 변이 ${a} cm, ${b} cm일 때 빗변은?`, c,
                    [a + b, c - 1, c + 2], `c=√(${a}²+${b}²)=√${c * c}=${c} cm입니다.`, 'cm'),
                mc('심화 연산', `빗변이 ${c} cm이고 한 변이 ${a} cm일 때 다른 직각변은?`, b,
                    [c - a, b + 2, a + b], `b=√(${c}²-${a}²)=√${b * b}=${b} cm입니다.`, 'cm'),
                written(`가로 ${a} m, 세로 ${b} m인 직사각형 운동장을 대각선으로 가로지릅니다. 대각선 거리를 입력하세요.`, c,
                    `직사각형 모서리는 직각이므로 d²=${a}²+${b}²=${c * c}, d=${c} m입니다.`, 'm')
            ];
        },
        5() {
            const [a, b, h] = pick([[6, 5, 4], [10, 13, 12], [16, 10, 6], [18, 15, 12]]);
            const area = a * h / 2;
            return [
                mc('기본 연산', `밑변 ${a} cm, 같은 두 변 ${b} cm인 이등변삼각형의 높이는?`, h,
                    [h + 2, a / 2, b - h], `밑변의 절반은 ${a / 2} cm이므로 h=√(${b}²-${a / 2}²)=${h} cm입니다.`, 'cm'),
                mc('심화 연산', `밑변 ${a} cm, 같은 두 변 ${b} cm인 이등변삼각형의 넓이는?`, area,
                    [a * h, area + h, area / 2], `A=${a}×${h}÷2=${area} cm²입니다.`, 'cm²'),
                written(`밑변 ${a} cm, 같은 두 변 ${b} cm인 이등변삼각형입니다. 높이를 먼저 구한 뒤 넓이를 입력하세요.`, area,
                    `h=√(${b}²-(${a}/2)²)=${h}, A=${a}×${h}÷2=${area} cm²입니다.`, 'cm²')
            ];
        },
        6() {
            const b = pick([7, 9, 11, 13, 15]);
            const h = pick([4, 6, 8, 10]);
            const area = b * h / 2;
            return [
                mc('기본 연산', `밑변 ${b} cm, 높이 ${h} cm인 삼각형의 넓이는?`, area,
                    [b * h, area + h, area + b], `A=${b}×${h}÷2=${area} cm²입니다.`, 'cm²'),
                mc('심화 연산', `넓이가 ${area} cm²이고 밑변이 ${b} cm인 삼각형의 높이는?`, h,
                    [h / 2, h + 2, b], `h=2A÷b=2×${area}÷${b}=${h} cm입니다.`, 'cm'),
                written(`같은 밑변 ${b} cm와 같은 높이 ${h} cm를 가진 서로 다른 모양의 삼각형 두 개가 있습니다. 그중 하나의 넓이를 입력하세요.`, area,
                    `모양이 달라도 밑변과 수직 높이가 같으면 넓이는 같습니다. A=${b}×${h}÷2=${area} cm²입니다.`, 'cm²')
            ];
        },
        7() {
            const [a, b, c, area] = pick([[3, 4, 5, 6], [5, 5, 6, 12], [5, 12, 13, 30], [13, 14, 15, 84]]);
            const s = (a + b + c) / 2;
            return [
                mc('기본 연산', `세 변이 ${a}, ${b}, ${c} cm인 삼각형의 반둘레 s는?`, s,
                    [a + b + c, s / 2, s + 2], `s=(${a}+${b}+${c})÷2=${s} cm입니다.`, 'cm'),
                mc('심화 연산', `세 변이 ${a}, ${b}, ${c} cm인 삼각형의 넓이는?`, area,
                    [area / 2, area + s, a * b / 2],
                    `A=√(${s}×${s - a}×${s - b}×${s - c})=${area} cm²입니다.`, 'cm²'),
                written(`높이는 알려지지 않았고 세 변만 ${a}, ${b}, ${c} cm로 주어졌습니다. 헤론의 공식을 사용해 넓이를 입력하세요.`, area,
                    `s=${s}, A=√[${s}(${s}-${a})(${s}-${b})(${s}-${c})]=${area} cm²입니다.`, 'cm²')
            ];
        },
        8() {
            const b = pick([6, 8, 10, 12]);
            const c = pick([5, 7, 9]);
            const angle = pick([30, 90]);
            const sin = angle === 30 ? 0.5 : 1;
            const area = b * c * sin / 2;
            return [
                mc('기본 연산', `두 변이 ${b} cm, ${c} cm이고 사이각이 ${angle}°입니다. 넓이는?`, area,
                    [b * c * sin, b * c / 2, area + c],
                    `sin${angle}°=${sin}이므로 S=½×${b}×${c}×${sin}=${area} cm²입니다.`, 'cm²'),
                mc('심화 연산', `넓이가 ${area} cm², 두 변이 ${b} cm와 ${c} cm라면 sin A는?`, sin,
                    [round(sin / 2), round(1 - sin / 2), round(sin + 0.25)],
                    `sin A=2S÷(bc)=2×${area}÷(${b}×${c})=${sin}입니다.`),
                written(`길이 ${b} cm와 ${c} cm인 두 막대가 ${angle}°로 만납니다. 두 막대와 양 끝을 이은 선분이 만드는 삼각형의 넓이를 입력하세요.`, area,
                    `두 막대가 끼인 두 변이므로 S=½bc sin A=½×${b}×${c}×${sin}=${area} cm²입니다.`, 'cm²')
            ];
        },
        9() {
            const [a, b, c, r, area] = pick([[3, 4, 5, 1, 6], [5, 5, 6, 1.5, 12], [6, 8, 10, 2, 24]]);
            const s = (a + b + c) / 2;
            return [
                mc('기본 연산', `세 변이 ${a}, ${b}, ${c} cm인 삼각형의 반둘레는?`, s,
                    [a + b + c, s / 2, s + r], `s=(${a}+${b}+${c})÷2=${s} cm입니다.`, 'cm'),
                mc('심화 연산', `반둘레가 ${s} cm이고 내접원 반지름이 ${r} cm일 때 넓이는?`, area,
                    [s + r, area / 2, area + s], `S=rs=${r}×${s}=${area} cm²입니다.`, 'cm²'),
                written(`세 변이 ${a}, ${b}, ${c} cm이고 내접원 반지름이 ${r} cm입니다. 세 작은 삼각형의 넓이를 합한다는 원리로 전체 넓이를 입력하세요.`, area,
                    `S=½r(a+b+c)=½×${r}×${a + b + c}=${area} cm²입니다.`, 'cm²')
            ];
        },
        10() {
            const [a, b, c, R, area] = pick([[3, 4, 5, 2.5, 6], [6, 8, 10, 5, 24], [5, 12, 13, 6.5, 30]]);
            return [
                mc('기본 연산', `세 변이 ${a}, ${b}, ${c} cm이고 외접원 반지름 R=${R} cm입니다. 넓이는?`, area,
                    [area / 2, area + R, a * b / 2],
                    `S=abc÷4R=(${a}×${b}×${c})÷(4×${R})=${area} cm²입니다.`, 'cm²'),
                mc('심화 연산', `세 변이 ${a}, ${b}, ${c} cm이고 넓이가 ${area} cm²일 때 외접원 반지름 R은?`, R,
                    [R * 2, round(R / 2), R + 2],
                    `R=abc÷4S=(${a}×${b}×${c})÷(4×${area})=${R} cm입니다.`, 'cm'),
                written(`삼각형 세 변이 ${a}, ${b}, ${c} cm이고 세 꼭짓점을 지나는 원의 반지름이 ${R} cm입니다. 공식을 사용해 넓이를 입력하세요.`, area,
                    `세 꼭짓점을 지나는 원은 외접원입니다. S=abc/(4R)=${a}×${b}×${c}÷(4×${R})=${area} cm²입니다.`, 'cm²')
            ];
        }
    };

    function create(number) {
        return generators[number]();
    }

    function isCorrect(question, response) {
        if (question.kind === 'choice') return String(response) === String(question.answer);
        const match = String(response ?? '').replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
        if (!match) return false;
        return Math.abs(Number(match[0]) - question.answer) <= question.tolerance;
    }

    return { create, isCorrect };
})();

window.MathFormulaQuiz = MathFormulaQuiz;

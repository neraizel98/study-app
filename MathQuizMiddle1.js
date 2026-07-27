/**
 * 중학교 1학년 1학기 단원별 랜덤 퀴즈
 * 각 실행마다 문제 유형과 수치가 새로 생성됩니다.
 */
(() => {
    if (typeof Utils === 'undefined' || typeof MathQuizData === 'undefined') return;

    const r = (min, max) => Utils.randomInt(min, max);
    const pick = values => Utils.pick(values);
    const gcd = (a, b) => Math.abs(Utils.gcd(Math.abs(a), Math.abs(b)));
    const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
    const signed = n => n < 0 ? `(${n})` : `${n}`;
    const fmt = n => Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));

    function shuffledQuiz(question, answer, distractors, explanation) {
        const correct = String(answer);
        const unique = [];
        [correct, ...distractors.map(String)].forEach(value => {
            const normalized = value.trim();
            if (!unique.some(item => item.trim() === normalized)) unique.push(value);
        });

        let step = 1;
        while (unique.length < 4) {
            const numeric = Number(correct.replace(/[^0-9.-]/g, ''));
            const fallback = Number.isFinite(numeric) ? String(numeric + step * 7) : `다른 값 ${step}`;
            if (!unique.includes(fallback)) unique.push(fallback);
            step++;
        }

        const choices = Utils.shuffle(unique.slice(0, 4));
        return {
            question,
            choices,
            answer: choices.indexOf(correct),
            explanation
        };
    }

    function numberQuiz(question, answer, explanation, unit = '') {
        const value = Number(answer);
        const offsets = Utils.shuffle([-5, -3, -2, -1, 1, 2, 3, 5, 10]);
        const distractors = [];
        for (const offset of offsets) {
            const candidate = value + offset;
            if (candidate !== value && !distractors.includes(candidate)) distractors.push(candidate);
            if (distractors.length === 3) break;
        }
        return shuffledQuiz(question, `${fmt(value)}${unit}`, distractors.map(v => `${fmt(v)}${unit}`), explanation);
    }

    function templates(generator, count, difficulty) {
        return Array.from({ length: count }, () => ({ type: 'dynamic', generator, difficulty }));
    }

    // 1단원: 소인수분해
    Utils.registerMathQuizGenerator('m1_factor_basic', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const primes = [2, 3, 5, 7, 11, 13];
            const p = pick(primes), q = pick(primes.filter(x => x !== p));
            const n = p * q;
            return numberQuiz(`$${n}$의 서로 다른 소인수의 개수는?`, 2,
                `$${n}=${p}\\times${q}$이므로 서로 다른 소인수는 ${p}, ${q}의 2개입니다.`, '개');
        }
        if (kind === 1) {
            const p = pick([2, 3, 5]), exponent = r(2, 4);
            const other = pick([3, 5, 7].filter(x => x !== p));
            const n = (p ** exponent) * other;
            return numberQuiz(`$${n}=${p}^a\\times${other}$일 때 $a$의 값은?`, exponent,
                `$${n}=${p}^{${exponent}}\\times${other}$이므로 $a=${exponent}$입니다.`);
        }
        const a = r(2, 8), b = r(2, 8), g = r(2, 6);
        const x = a * g, y = b * g;
        return numberQuiz(`$${x}$와 $${y}$의 최대공약수는?`, gcd(x, y),
            `두 수의 공통 소인수를 모으면 최대공약수는 $${gcd(x, y)}$입니다.`);
    });

    Utils.registerMathQuizGenerator('m1_factor_advanced', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const p = pick([2, 3, 5]), q = pick([3, 5, 7].filter(x => x !== p));
            const a = r(1, 3), b = r(1, 3), n = (p ** a) * (q ** b);
            const count = (a + 1) * (b + 1);
            return numberQuiz(`$${n}=${p}^{${a}}\\times${q}^{${b}}$의 양의 약수의 개수는?`, count,
                `약수의 개수는 지수에 1씩 더해 곱한 $(${a}+1)(${b}+1)=${count}$개입니다.`, '개');
        }
        if (kind === 1) {
            const a = r(3, 10), b = r(3, 10), g = r(2, 5);
            const x = a * g, y = b * g, answer = lcm(x, y);
            return numberQuiz(`$${x}$와 $${y}$의 최소공배수는?`, answer,
                `각 소인수의 큰 지수를 선택하면 최소공배수는 $${answer}$입니다.`);
        }
        const g = pick([2, 3, 5, 6]), left = g * r(2, 7), target = g * r(8, 14);
        const answer = lcm(left, target);
        return numberQuiz(`두 수 $${left}, ${target}$의 공배수 중 가장 작은 수는?`, answer,
            `가장 작은 공배수는 최소공배수 $${answer}$입니다.`);
    });

    Utils.registerMathQuizGenerator('m1_factor_word', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const a = pick([8, 12, 15, 18]), b = pick([10, 14, 20, 24]), answer = lcm(a, b);
            return numberQuiz(`${a}분마다 오는 버스와 ${b}분마다 오는 버스가 지금 함께 왔습니다. 다시 함께 오는 것은 몇 분 뒤인가요?`, answer,
                `두 간격의 최소공배수 $\\operatorname{lcm}(${a},${b})=${answer}$분 뒤입니다.`, '분');
        }
        if (kind === 1) {
            const rows = r(4, 9), cols = r(6, 12), total = rows * cols;
            const group = gcd(rows, cols);
            return numberQuiz(`학생 ${total}명을 ${rows}명씩 또는 ${cols}명씩 남김없이 나눌 수 있습니다. 두 모둠 크기의 최대공약수는?`, group,
                `$\\gcd(${rows},${cols})=${group}$입니다.`);
        }
        const a = r(24, 48), b = r(30, 60), answer = gcd(a, b);
        return numberQuiz(`리본 ${a}cm와 ${b}cm를 남김없이 같은 길이로 가장 길게 자르려 합니다. 한 조각은 몇 cm인가요?`, answer,
            `가능한 가장 긴 길이는 $\\gcd(${a},${b})=${answer}$cm입니다.`, 'cm');
    });

    // 2단원: 정수와 유리수
    Utils.registerMathQuizGenerator('m1_integer_basic', () => {
        const kind = r(0, 3);
        if (kind === 0) {
            const n = r(-15, -2);
            return numberQuiz(`$|${n}|$의 값은?`, Math.abs(n), `절댓값은 0에서의 거리이므로 $|${n}|=${Math.abs(n)}$입니다.`);
        }
        const a = r(-12, 12), b = r(-12, 12);
        if (kind === 1) return numberQuiz(`$${signed(a)}+${signed(b)}$의 값은?`, a + b, `수직선에서 이동하면 $${signed(a)}+${signed(b)}=${a + b}$입니다.`);
        if (kind === 2) return numberQuiz(`$${signed(a)}-${signed(b)}$의 값은?`, a - b, `빼는 수의 부호를 바꾸면 $${signed(a)}+${signed(-b)}=${a - b}$입니다.`);
        return numberQuiz(`$${signed(a || 2)}\\times${signed(b || -3)}$의 값은?`, (a || 2) * (b || -3),
            `부호를 먼저 정하고 절댓값을 곱하면 $${(a || 2) * (b || -3)}$입니다.`);
    });

    Utils.registerMathQuizGenerator('m1_integer_advanced', () => {
        const a = r(-9, 9), b = r(-9, 9), c = r(2, 7);
        const kind = r(0, 2);
        if (kind === 0) {
            const answer = a - b * c;
            return numberQuiz(`$${signed(a)}-${signed(b)}\\times${c}$의 값은?`, answer,
                `곱셈을 먼저 계산하여 $${signed(a)}-${signed(b * c)}=${answer}$입니다.`);
        }
        if (kind === 1) {
            const answer = (a - b) * c;
            return numberQuiz(`$(${signed(a)}-${signed(b)})\\times${c}$의 값은?`, answer,
                `괄호 안을 먼저 계산하면 $${a - b}\\times${c}=${answer}$입니다.`);
        }
        const denominator = pick([2, 3, 4]), numerator = denominator * r(-8, 8);
        const answer = numerator / denominator;
        return numberQuiz(`$${numerator}\\div${denominator}$의 값은?`, answer,
            `부호를 정한 뒤 절댓값을 나누면 $${answer}$입니다.`);
    });

    Utils.registerMathQuizGenerator('m1_integer_word', () => {
        const kind = r(0, 2);
        const start = r(-12, 3), change = r(4, 15);
        if (kind === 0) {
            return numberQuiz(`아침 기온이 ${start}℃였고 낮에 ${change}℃ 올랐습니다. 낮 기온은?`, start + change,
                `$${start}+${change}=${start + change}$이므로 낮 기온은 ${start + change}℃입니다.`, '℃');
        }
        if (kind === 1) {
            const down = r(3, 12);
            const basement = r(1, 12);
            return numberQuiz(`엘리베이터가 지하 ${basement}층에서 ${change}개 층 올라갔다가 ${down}개 층 내려갔습니다. 현재 층은?`,
                -basement + change - down,
                `지하 ${basement}층을 $-${basement}$로 나타내면 $-${basement}+${change}-${down}=${-basement + change - down}$층입니다.`, '층');
        }
        const gain = r(5, 20), loss = r(3, 15);
        return numberQuiz(`게임에서 ${gain}점을 얻고 ${loss}점을 잃는 일을 2번 반복했습니다. 점수 변화는?`, 2 * (gain - loss),
            `$2\\times(${gain}-${loss})=${2 * (gain - loss)}$점입니다.`, '점');
    });

    // 3단원: 문자와 식
    Utils.registerMathQuizGenerator('m1_expression_basic', () => {
        const kind = r(0, 2), x = r(-5, 6), a = r(2, 8), b = r(-9, 9);
        if (kind === 0) return numberQuiz(`$x=${x}$일 때 $${a}x${b >= 0 ? '+' : ''}${b}$의 값은?`, a * x + b,
            `$${a}\\times${signed(x)}${b >= 0 ? '+' : ''}${b}=${a * x + b}$입니다.`);
        if (kind === 1) {
            const c = r(-7, 7);
            return numberQuiz(`$${a}x${c >= 0 ? '+' : ''}${c}x$에서 $x$의 계수는?`, a + c,
                `동류항의 계수를 더하면 $(${a}${c >= 0 ? '+' : ''}${c})x=${a + c}x$입니다.`);
        }
        return shuffledQuiz(`$a\\times a\\times${a}$를 간단히 나타낸 것은?`, `$${a}a^2$`,
            [`$${a * 2}a$`, `$${a}a$`, `$a^{${a}}$`], `$a\\times a=a^2$이므로 $${a}a^2$입니다.`);
    });

    Utils.registerMathQuizGenerator('m1_expression_advanced', () => {
        const a = r(2, 7), b = r(-8, 8), c = r(1, 6), d = r(-8, 8);
        const kind = r(0, 1);
        if (kind === 0) {
            const coefficient = a - c, constant = b - d, x = r(-4, 5);
            const answer = coefficient * x + constant;
            return numberQuiz(`$x=${x}$일 때 $(${a}x${b >= 0 ? '+' : ''}${b})-(${c}x${d >= 0 ? '+' : ''}${d})$의 값은?`, answer,
                `식을 정리하면 $${coefficient}x${constant >= 0 ? '+' : ''}${constant}$이고, $x=${x}$를 대입하면 ${answer}입니다.`);
        }
        const m = r(2, 5), n = r(-6, 6), x = r(-4, 4);
        const answer = m * (a * x + n);
        return numberQuiz(`$x=${x}$일 때 $${m}(${a}x${n >= 0 ? '+' : ''}${n})$의 값은?`, answer,
            `분배하거나 먼저 대입하면 $${m}\\times(${a * x + n})=${answer}$입니다.`);
    });

    Utils.registerMathQuizGenerator('m1_expression_word', () => {
        const kind = r(0, 2), x = r(2, 10);
        if (kind === 0) {
            const price = r(700, 1800), fixed = r(200, 800), answer = price * x + fixed;
            return numberQuiz(`한 권에 ${price}원인 공책 $x$권과 ${fixed}원짜리 지우개를 샀습니다. $x=${x}$일 때 총금액은?`, answer,
                `$${price}x+${fixed}$에 $x=${x}$를 대입하면 ${answer}원입니다.`, '원');
        }
        if (kind === 1) {
            const extra = r(1, 6), answer = 2 * (x + extra);
            return numberQuiz(`가로가 $x$cm, 세로가 가로보다 ${extra}cm 긴 직사각형이 있습니다. $x=${x}$일 때 둘레는?`, answer,
                `둘레는 $2\\{x+(x+${extra})\\}$이고, 대입하면 ${answer}cm입니다.`, 'cm');
        }
        const per = r(3, 8), remaining = r(3, 15), start = per * x + remaining, answer = remaining;
        return numberQuiz(`용기에 물이 ${start}L 있고 매분 ${per}L씩 빠집니다. $x=${x}$분 뒤 물의 양은?`, answer,
            `남은 물은 $${start}-${per}x$이고 $x=${x}$이면 ${answer}L입니다.`, 'L');
    });

    // 4단원: 일차방정식
    Utils.registerMathQuizGenerator('m1_equation_basic', () => {
        const x = r(-8, 12), a = pick([-5, -4, -3, 2, 3, 4, 5]), b = r(-12, 12);
        const c = a * x + b;
        return numberQuiz(`방정식 $${a}x${b >= 0 ? '+' : ''}${b}=${c}$의 해는?`, x,
            `상수항을 이항하고 ${a}로 나누면 $x=${x}$입니다.`);
    });

    Utils.registerMathQuizGenerator('m1_equation_advanced', () => {
        const x = r(-7, 10), a = r(2, 7), c = r(1, a - 1), b = r(-10, 10);
        const d = (a - c) * x + b;
        if (r(0, 1) === 0) {
            return numberQuiz(`방정식 $${a}x${b >= 0 ? '+' : ''}${b}=${c}x${d >= 0 ? '+' : ''}${d}$의 해는?`, x,
                `미지수항과 상수항을 각각 이항하면 $${a - c}x=${d - b}$이므로 $x=${x}$입니다.`);
        }
        const m = r(2, 5), inside = r(-5, 6), right = m * (x + inside);
        return numberQuiz(`방정식 $${m}(x${inside >= 0 ? '+' : ''}${inside})=${right}$의 해는?`, x,
            `양변을 ${m}로 나누면 $x${inside >= 0 ? '+' : ''}${inside}=${right / m}$이므로 $x=${x}$입니다.`);
    });

    Utils.registerMathQuizGenerator('m1_equation_word', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const x = r(4, 18), mult = r(2, 6), add = r(-8, 10), result = mult * x + add;
            return numberQuiz(`어떤 수의 ${mult}배에 ${add >= 0 ? add + '을 더했더니' : Math.abs(add) + '을 뺐더니'} ${result}이 되었습니다. 어떤 수는?`, x,
                `$${mult}x${add >= 0 ? '+' : ''}${add}=${result}$을 풀면 $x=${x}$입니다.`);
        }
        if (kind === 1) {
            const younger = r(8, 17), gap = r(2, 6), sum = younger * 2 + gap;
            return numberQuiz(`두 사람의 나이 차는 ${gap}살이고 합은 ${sum}살입니다. 어린 사람의 나이는?`, younger,
                `어린 사람을 $x$라 하면 $x+(x+${gap})=${sum}$이므로 $x=${younger}$입니다.`, '살');
        }
        const speed = pick([40, 50, 60, 70]), time = r(2, 5), distance = speed * time;
        return numberQuiz(`일정한 속력으로 ${time}시간 동안 ${distance}km를 이동했습니다. 속력은?`, speed,
            `$속력=거리\\div시간=${distance}\\div${time}=${speed}$km/h입니다.`, 'km/h');
    });

    // 5단원: 좌표평면과 그래프
    Utils.registerMathQuizGenerator('m1_graph_basic', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const x = pick([-5, -4, -3, 2, 3, 4, 5]), y = pick([-5, -4, -3, 2, 3, 4, 5]);
            const quadrant = x > 0 ? (y > 0 ? 1 : 4) : (y > 0 ? 2 : 3);
            return shuffledQuiz(`점 $P(${x},${y})$가 있는 사분면은?`, `제${quadrant}사분면`,
                [1, 2, 3, 4].filter(n => n !== quadrant).map(n => `제${n}사분면`),
                `x좌표와 y좌표의 부호를 보면 제${quadrant}사분면입니다.`);
        }
        const a = pick([-5, -4, -3, 2, 3, 4, 5]), x = pick([-4, -3, -2, 2, 3, 4]);
        if (kind === 1) return numberQuiz(`정비례 관계 $y=${a}x$에서 $x=${x}$일 때 $y$는?`, a * x,
            `$y=${a}\\times${signed(x)}=${a * x}$입니다.`);
        const y = a * x;
        return numberQuiz(`점 $(${x},${y})$가 정비례 그래프 $y=ax$ 위에 있을 때 $a$는?`, a,
            `$a=y\\div x=${y}\\div${signed(x)}=${a}$입니다.`);
    });

    Utils.registerMathQuizGenerator('m1_graph_advanced', () => {
        const kind = r(0, 2), a = pick([-12, -10, -8, 8, 10, 12]), x = pick([-4, -2, 2, 4]);
        if (kind === 0) {
            const y = a / x;
            return numberQuiz(`반비례 관계 $y=\\frac{${a}}{x}$에서 $x=${x}$일 때 $y$는?`, y,
                `$y=${a}\\div${signed(x)}=${y}$입니다.`);
        }
        if (kind === 1) {
            const y = a / x;
            return numberQuiz(`반비례 그래프가 점 $(${x},${y})$를 지날 때 $xy=a$의 $a$는?`, a,
                `$a=xy=${x}\\times${signed(y)}=${a}$입니다.`);
        }
        const p1 = [r(-5, 5), r(-5, 5)], p2 = [r(-5, 5), r(-5, 5)];
        const dx = Math.abs(p1[0] - p2[0]), dy = Math.abs(p1[1] - p2[1]);
        return numberQuiz(`두 점 $A(${p1[0]},${p1[1]})$, $B(${p2[0]},${p2[1]})$의 x좌표 차와 y좌표 차의 합은?`, dx + dy,
            `$|${p1[0]}-${signed(p2[0])}|+|${p1[1]}-${signed(p2[1])}|=${dx}+${dy}=${dx + dy}$입니다.`);
    });

    Utils.registerMathQuizGenerator('m1_graph_word', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const rate = r(2, 8), x = r(3, 10);
            return numberQuiz(`수도꼭지에서 매분 ${rate}L씩 물이 나옵니다. $x=${x}$분일 때 물의 양 $y=${rate}x$는?`, rate * x,
                `$y=${rate}\\times${x}=${rate * x}$L입니다.`, 'L');
        }
        if (kind === 1) {
            const area = pick([24, 30, 36, 48, 60]), width = pick([2, 3, 4, 5, 6].filter(v => area % v === 0));
            return numberQuiz(`넓이가 ${area}cm²인 직사각형의 가로가 ${width}cm일 때 세로는?`, area / width,
                `$xy=${area}$인 반비례 관계이므로 $y=${area}\\div${width}=${area / width}$cm입니다.`, 'cm');
        }
        const base = r(1000, 3000), per = r(80, 200), distance = r(3, 12);
        return numberQuiz(`택시 기본요금이 ${base}원이고 1km마다 ${per}원씩 추가됩니다. ${distance}km 이동 요금은?`, base + per * distance,
            `$y=${base}+${per}x$에 $x=${distance}$를 대입하면 ${base + per * distance}원입니다.`, '원');
    });

    MathQuizData["m1-1-u1"] = {
        basic: templates('m1_factor_basic', 20, 'easy'),
        advanced: templates('m1_factor_advanced', 10, 'hard'),
        word: templates('m1_factor_word', 5, 'medium')
    };
    MathQuizData["m1-1-u2"] = {
        basic: templates('m1_integer_basic', 20, 'easy'),
        advanced: templates('m1_integer_advanced', 10, 'hard'),
        word: templates('m1_integer_word', 5, 'medium')
    };
    MathQuizData["m1-1-u3"] = {
        basic: templates('m1_expression_basic', 20, 'easy'),
        advanced: templates('m1_expression_advanced', 10, 'hard'),
        word: templates('m1_expression_word', 5, 'medium')
    };
    MathQuizData["m1-1-u4"] = {
        basic: templates('m1_equation_basic', 20, 'easy'),
        advanced: templates('m1_equation_advanced', 10, 'hard'),
        word: templates('m1_equation_word', 5, 'medium')
    };
    MathQuizData["m1-1-u5"] = {
        basic: templates('m1_graph_basic', 20, 'easy'),
        advanced: templates('m1_graph_advanced', 10, 'hard'),
        word: templates('m1_graph_word', 5, 'medium')
    };

    if (typeof window !== 'undefined') window.MathQuizData = MathQuizData;
})();

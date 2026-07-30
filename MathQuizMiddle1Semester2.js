/**
 * 중학교 1학년 2학기 단원별 랜덤 퀴즈
 */
(() => {
    if (typeof Utils === 'undefined' || typeof MathQuizData === 'undefined') return;

    const r = (a, b) => Utils.randomInt(a, b);
    const pick = values => Utils.pick(values);
    const fmt = n => Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
    const templates = (generator, count, difficulty) =>
        Array.from({ length: count }, () => ({ type: 'dynamic', generator, difficulty }));

    function choice(question, answer, wrong, explanation) {
        const correct = String(answer);
        const values = [];
        [correct, ...wrong.map(String)].forEach(value => {
            if (!values.some(item => item.trim() === value.trim())) values.push(value);
        });
        let i = 1;
        while (values.length < 4) {
            const fallback = `해당 없음 ${i++}`;
            if (!values.includes(fallback)) values.push(fallback);
        }
        const choices = Utils.shuffle(values.slice(0, 4));
        return { question, choices, answer: choices.indexOf(correct), explanation };
    }

    function number(question, answer, explanation, unit = '') {
        const value = Number(answer);
        const wrong = [];
        for (const offset of Utils.shuffle([-30, -20, -10, -5, -3, -2, -1, 1, 2, 3, 5, 10, 20, 30])) {
            const candidate = value + offset;
            if (candidate >= 0 && candidate !== value && !wrong.includes(candidate)) wrong.push(candidate);
            if (wrong.length === 3) break;
        }
        return choice(question, `${fmt(value)}${unit}`, wrong.map(v => `${fmt(v)}${unit}`), explanation);
    }

    // 1. 기본 도형
    Utils.registerMathQuizGenerator('m1s2_geometry_basic', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const a = r(20, 160);
            return number(`두 직선이 만나 생긴 한 각이 ${a}°일 때 그 맞꼭지각은?`, a,
                `맞꼭지각은 크기가 같으므로 ${a}°입니다.`, '°');
        }
        if (kind === 1) {
            const a = r(20, 160), answer = 180 - a;
            return number(`한 직선 위의 이웃한 두 각 중 한 각이 ${a}°일 때 다른 각은?`, answer,
                `두 각의 합은 180°이므로 $180-${a}=${answer}$°입니다.`, '°');
        }
        return choice("같은 평면 위에서 만나지 않는 두 직선의 위치 관계는?", "평행",
            ["수직", "꼬인 위치", "일치"], "같은 평면에서 만나지 않는 두 직선은 평행입니다.");
    });

    Utils.registerMathQuizGenerator('m1s2_geometry_advanced', () => {
        const a = r(25, 155), kind = r(0, 2);
        if (kind === 0) return number(`평행선의 한 동위각이 ${a}°일 때 대응하는 동위각은?`, a,
            `평행선의 동위각은 같으므로 ${a}°입니다.`, '°');
        if (kind === 1) return number(`평행선에서 한 예각이 ${a < 90 ? a : 180 - a}°일 때 이웃한 둔각은?`,
            a < 90 ? 180 - a : a, `이웃한 두 각의 합은 180°입니다.`, '°');
        const x = r(20, 70), y = r(20, 70), answer = 180 - x - y;
        return number(`한 점 주위에서 직선이 만든 세 연속 각이 ${x}°, ${y}°, 180°입니다. 남은 각은?`, answer,
            `점 주위 각의 합 360°에서 빼면 $360-180-${x}-${y}=${answer}$°입니다.`, '°');
    });

    Utils.registerMathQuizGenerator('m1s2_geometry_word', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const turn = r(20, 160);
            return number(`직진하던 로봇이 왼쪽으로 ${turn}° 회전했습니다. 원래 진행방향과 새 방향 사이의 작은 각은?`, turn,
                `회전한 크기가 두 진행방향 사이의 각이므로 ${turn}°입니다.`, '°');
        }
        if (kind === 1) {
            const angle = pick([30, 45, 60, 75]);
            return number(`서로 평행한 두 도로를 횡단보도가 가로지릅니다. 한쪽 교차각이 ${angle}°이면 반대편 엇각은?`, angle,
                `평행선의 엇각은 같으므로 ${angle}°입니다.`, '°');
        }
        const a = r(25, 80);
        return number(`접이식 자의 두 막대가 이루는 각이 ${a}°입니다. 완전히 일직선이 되려면 몇 도 더 벌려야 하나요?`, 180 - a,
            `평각 180°가 되어야 하므로 $180-${a}=${180 - a}$°입니다.`, '°');
    });

    // 2. 작도와 합동
    Utils.registerMathQuizGenerator('m1s2_congruence_basic', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const a = r(3, 12);
            return number(`선분 AB의 수직이등분선 위의 점 P에 대해 $PA=${a}cm$일 때 $PB$는?`, a,
                `수직이등분선 위의 점은 양 끝점까지 거리가 같으므로 ${a}cm입니다.`, 'cm');
        }
        if (kind === 1) return choice("세 쌍의 대응변이 각각 같을 때의 삼각형 합동 조건은?", "SSS",
            ["SAS", "ASA", "AAA"], "세 변이 각각 같으므로 SSS 합동입니다.");
        return choice("두 변과 그 끼인각이 각각 같을 때의 합동 조건은?", "SAS",
            ["SSS", "ASA", "AAA"], "Side-Angle-Side이므로 SAS 합동입니다.");
    });

    Utils.registerMathQuizGenerator('m1s2_congruence_advanced', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const a = r(2, 10), b = r(2, 10), c = a + b - r(1, Math.min(a, b));
            return choice(`세 선분 ${a}cm, ${b}cm, ${c}cm로 삼각형을 만들 수 있나요?`, "만들 수 있다",
                ["만들 수 없다", "직각삼각형만 가능", "알 수 없다"],
                `가장 긴 변이 나머지 두 변의 합보다 작으므로 만들 수 있습니다.`);
        }
        if (kind === 1) {
            const a = r(25, 75), b = r(25, 75), c = 180 - a - b;
            return number(`두 각이 ${a}°, ${b}°인 삼각형의 나머지 한 각은?`, c,
                `삼각형 내각의 합은 180°이므로 ${c}°입니다.`, '°');
        }
        const side = r(4, 15);
        return number(`합동인 두 삼각형에서 대응변 AB가 ${side}cm이면 대응변 DE의 길이는?`, side,
            `합동인 도형의 대응변 길이는 같으므로 ${side}cm입니다.`, 'cm');
    });

    Utils.registerMathQuizGenerator('m1s2_congruence_word', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const distance = r(4, 18);
            return number(`두 마을 A, B에서 같은 거리에 있는 수직이등분선 위에 쉼터 P가 있습니다. $PA=${distance}km$이면 $PB$는?`, distance,
                `수직이등분선의 성질로 $PA=PB=${distance}km$입니다.`, 'km');
        }
        if (kind === 1) {
            const perimeter = pick([18, 24, 30, 36]), side = perimeter / 3;
            return number(`세 변의 길이가 모두 같은 삼각형의 둘레가 ${perimeter}cm입니다. 한 변은?`, side,
                `$${perimeter}\\div3=${side}$cm입니다.`, 'cm');
        }
        const a = r(3, 9), b = r(4, 10), c = r(5, 12);
        return number(`SSS 합동인 삼각형 두 개가 있습니다. 첫 삼각형의 세 변이 ${a}, ${b}, ${c}cm일 때 두 번째 삼각형의 둘레는?`, a + b + c,
            `대응변이 모두 같으므로 둘레도 $${a}+${b}+${c}=${a + b + c}$cm입니다.`, 'cm');
    });

    // 3. 평면도형
    Utils.registerMathQuizGenerator('m1s2_plane_basic', () => {
        const kind = r(0, 2), n = r(4, 10);
        if (kind === 0) {
            const answer = (n - 2) * 180;
            return number(`${n}각형의 내각의 합은?`, answer,
                `$(${n}-2)\\times180=${answer}$°입니다.`, '°');
        }
        if (kind === 1) {
            const n2 = pick([3, 4, 5, 6, 8, 9, 10, 12]), answer = 360 / n2;
            return number(`정${n2}각형의 한 외각의 크기는?`, answer,
                `외각의 합 360°를 ${n2}로 나누면 ${answer}°입니다.`, '°');
        }
        const angle = pick([30, 45, 60, 90, 120, 180]), fraction = angle / 360;
        return choice(`중심각이 ${angle}°인 부채꼴은 원 전체의 얼마인가요?`, `$\\frac{${angle}}{360}$`,
            [`$\\frac{${360 - angle}}{360}$`, `$\\frac{${angle}}{180}$`, `$\\frac{1}{${Math.max(2, Math.round(360 / angle) + 1)}}$`],
            `중심각의 비율은 $${angle}/360$입니다.`);
    });

    Utils.registerMathQuizGenerator('m1s2_plane_advanced', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const n = pick([5, 6, 8, 9, 10, 12]), answer = ((n - 2) * 180) / n;
            return number(`정${n}각형의 한 내각의 크기는?`, answer,
                `내각의 합을 ${n}로 나누면 $(${n}-2)180/${n}=${answer}$°입니다.`, '°');
        }
        const radius = r(2, 12), angle = pick([60, 90, 120, 180]);
        if (kind === 1) {
            const coefficient = (2 * radius * angle) / 360;
            return number(`반지름 ${radius}cm, 중심각 ${angle}°인 부채꼴의 호의 길이를 $k\\pi cm$라 할 때 k는?`, coefficient,
                `$2\\pi\\times${radius}\\times${angle}/360=${coefficient}\\pi$이므로 $k=${coefficient}$입니다.`);
        }
        const coefficient = (radius * radius * angle) / 360;
        return number(`반지름 ${radius}cm, 중심각 ${angle}°인 부채꼴 넓이를 $k\\pi cm^2$라 할 때 k는?`, coefficient,
            `$\\pi\\times${radius}^2\\times${angle}/360=${fmt(coefficient)}\\pi$입니다.`);
    });

    Utils.registerMathQuizGenerator('m1s2_plane_word', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const sides = pick([5, 6, 8, 10, 12]), turn = 360 / sides;
            return number(`정${sides}각형 모양 트랙의 꼭짓점마다 같은 방향으로 회전합니다. 한 번의 회전각은?`, turn,
                `외각의 합 360°를 ${sides}로 나누면 ${turn}°입니다.`, '°');
        }
        if (kind === 1) {
            const radius = r(2, 10), turns = r(2, 8), coefficient = 2 * radius * turns;
            return number(`반지름 ${radius}cm인 바퀴가 ${turns}바퀴 굴렀습니다. 이동거리를 $k\\pi cm$라 할 때 k는?`, coefficient,
                `원주 $2\\pi r$에 회전수를 곱하면 $${coefficient}\\pi cm$입니다.`);
        }
        const radius = r(4, 12), arc = r(3, 10), areaCoefficient = radius * arc / 2;
        return number(`반지름이 ${radius}cm이고 호의 길이가 ${arc}cm인 부채꼴의 넓이는?`, areaCoefficient,
            `$S=\\frac12rl=\\frac12\\times${radius}\\times${arc}=${fmt(areaCoefficient)}cm^2$입니다.`, 'cm²');
    });

    // 4. 입체도형
    Utils.registerMathQuizGenerator('m1s2_solid_basic', () => {
        const kind = r(0, 2), n = r(3, 10);
        if (kind === 0) return number(`${n}각기둥의 모서리 수는?`, 3 * n,
            `n각기둥의 모서리는 $3n=${3 * n}$개입니다.`, '개');
        if (kind === 1) return number(`${n}각뿔의 꼭짓점 수는?`, n + 1,
            `밑면 꼭짓점 ${n}개와 꼭짓점 1개로 ${n + 1}개입니다.`, '개');
        const base = r(5, 40), height = r(2, 12);
        return number(`밑넓이가 ${base}cm², 높이가 ${height}cm인 기둥의 부피는?`, base * height,
            `$V=Bh=${base}\\times${height}=${base * height}cm^3$입니다.`, 'cm³');
    });

    Utils.registerMathQuizGenerator('m1s2_solid_advanced', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const base = r(6, 36), height = pick([3, 6, 9, 12]), answer = base * height / 3;
            return number(`밑넓이가 ${base}cm², 높이가 ${height}cm인 뿔의 부피는?`, answer,
                `$V=\\frac13Bh=${answer}cm^3$입니다.`, 'cm³');
        }
        const radius = r(2, 9), height = r(3, 12);
        if (kind === 1) {
            const coefficient = radius * radius * height;
            return number(`반지름 ${radius}cm, 높이 ${height}cm인 원기둥 부피를 $k\\pi cm^3$라 할 때 k는?`, coefficient,
                `$\\pi r^2h=${coefficient}\\pi$이므로 $k=${coefficient}$입니다.`);
        }
        const coefficient = 2 * radius * radius + 2 * radius * height;
        return number(`반지름 ${radius}cm, 높이 ${height}cm인 원기둥 겉넓이를 $k\\pi cm^2$라 할 때 k는?`, coefficient,
            `$2r^2+2rh=${coefficient}$이므로 $k=${coefficient}$입니다.`);
    });

    Utils.registerMathQuizGenerator('m1s2_solid_word', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const base = r(10, 40), height = r(3, 10), answer = base * height;
            return number(`밑넓이 ${base}cm²인 상자를 높이 ${height}cm만큼 가득 채웠습니다. 부피는?`, answer,
                `기둥의 부피 $Bh=${base}\\times${height}=${answer}cm^3$입니다.`, 'cm³');
        }
        if (kind === 1) {
            const cone = r(20, 100), cylinder = cone * 3;
            return number(`같은 밑면과 높이인 원뿔의 부피가 ${cone}cm³입니다. 원기둥의 부피는?`, cylinder,
                `원뿔은 원기둥의 1/3이므로 $${cone}\\times3=${cylinder}cm^3$입니다.`, 'cm³');
        }
        const radius = r(2, 8), turns = r(2, 5), coefficient = 2 * radius * turns;
        return number(`반지름 ${radius}cm인 원기둥 모양 롤러가 ${turns}회전했습니다. 이동거리를 $k\\pi cm$라 할 때 k는?`, coefficient,
            `원주×회전수 $=2\\pi\\times${radius}\\times${turns}=${coefficient}\\pi cm$입니다.`);
    });

    // 5. 자료의 정리와 해석
    Utils.registerMathQuizGenerator('m1s2_stats_basic', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const stem = r(1, 8), leaves = Utils.shuffle([r(0, 3), r(4, 6), r(7, 9)]).sort();
            const answer = stem * 10 + Math.max(...leaves);
            return number(`줄기 ${stem}의 잎이 ${leaves.join(', ')}일 때 가장 큰 자료는?`, answer,
                `가장 큰 잎 ${Math.max(...leaves)}를 붙이면 ${answer}입니다.`);
        }
        if (kind === 1) {
            const frequencies = [r(2, 8), r(2, 8), r(2, 8), r(2, 8)];
            const answer = frequencies.reduce((a, b) => a + b, 0);
            return number(`네 계급의 도수가 ${frequencies.join(', ')}일 때 전체 자료 수는?`, answer,
                `도수의 합은 ${answer}입니다.`, '개');
        }
        const total = pick([20, 25, 40, 50]), freq = pick([5, 10, 15, 20].filter(v => v < total && total % v === 0));
        return number(`전체 ${total}개 중 한 계급의 도수가 ${freq}일 때 상대도수를 백분율로 나타내면?`, freq / total * 100,
            `$${freq}/${total}\\times100=${freq / total * 100}\\%$입니다.`, '%');
    });

    Utils.registerMathQuizGenerator('m1s2_stats_advanced', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const known = [r(2, 9), r(2, 9), r(2, 9)], total = known.reduce((a, b) => a + b, 0) + r(3, 10);
            const answer = total - known.reduce((a, b) => a + b, 0);
            return number(`전체 자료가 ${total}개이고 세 계급의 도수가 ${known.join(', ')}일 때 나머지 계급의 도수는?`, answer,
                `전체에서 알려진 도수의 합을 빼면 ${answer}입니다.`, '개');
        }
        if (kind === 1) {
            const total = pick([40, 50, 80, 100]), percent = pick([10, 20, 25, 30, 40, 50]), answer = total * percent / 100;
            return number(`전체 ${total}명에서 상대도수가 ${percent}%인 계급의 도수는?`, answer,
                `$${total}\\times${percent}/100=${answer}$명입니다.`, '명');
        }
        const aTotal = pick([20, 40, 50]), bTotal = pick([30, 60, 100]);
        const percent = pick([20, 25, 40, 50]), a = aTotal * percent / 100, b = bTotal * percent / 100;
        return number(`A집단 ${aTotal}명 중 ${a}명, B집단 ${bTotal}명 중 ${b}명이 같은 구간에 있습니다. 두 집단의 상대도수 차는?`, 0,
            `두 집단 모두 ${percent}%이므로 상대도수 차는 0입니다.`);
    });

    Utils.registerMathQuizGenerator('m1s2_stats_word', () => {
        const kind = r(0, 2);
        if (kind === 0) {
            const total = pick([20, 25, 40, 50]), freq = pick([5, 10, 15, 20].filter(v => v < total));
            return number(`학생 ${total}명 중 ${freq}명이 하루 2시간 이상 운동합니다. 이 구간의 상대도수는?`, freq / total,
                `$${freq}\\div${total}=${fmt(freq / total)}$입니다.`);
        }
        if (kind === 1) {
            const values = [r(10, 19), r(20, 29), r(30, 39), r(40, 49)].sort((a,b)=>a-b);
            return number(`자료 ${values.join(', ')}를 줄기와 잎 그림으로 나타낼 때 잎의 총개수는?`, values.length,
                `자료 하나가 잎 하나이므로 ${values.length}개입니다.`, '개');
        }
        const total = pick([40, 50, 80, 100]), relative = pick([0.1, 0.2, 0.25, 0.4, 0.5]), answer = total * relative;
        return number(`전체 ${total}명인 설문에서 한 항목의 상대도수가 ${relative}입니다. 이 항목을 선택한 사람은?`, answer,
            `$${total}\\times${relative}=${answer}$명입니다.`, '명');
    });

    const config = [
        ["m1-2-u1", "m1s2_geometry"],
        ["m1-2-u2", "m1s2_congruence"],
        ["m1-2-u3", "m1s2_plane"],
        ["m1-2-u4", "m1s2_solid"],
        ["m1-2-u5", "m1s2_stats"]
    ];
    config.forEach(([unit, prefix]) => {
        MathQuizData[unit] = {
            basic: templates(`${prefix}_basic`, 20, 'easy'),
            advanced: templates(`${prefix}_advanced`, 10, 'hard'),
            word: templates(`${prefix}_word`, 5, 'medium')
        };
    });

})();

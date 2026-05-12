/**
 * utils.js
 * 수학 퀴즈 생성 및 렌더링 유틸리티
 * v6-2-v1
 */
const Utils = {
    // 배열 셔플
    shuffle: function (array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    },

    // 랜덤 아이템 선택
    pick: function (array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    // KaTeX 수식 렌더링
    renderMath: function (text) {
        if (!text) return '';
        let processed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return processed.replace(/\$(.*?)\$/g, (match, formula) => {
            try { return katex.renderToString(formula, { throwOnError: false }); }
            catch (e) { return formula; }
        });
    },

    // 랜덤 정수
    randomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // 최대공약수
    gcd: function (a, b) {
        return b === 0 ? a : this.gcd(b, a % b);
    },

    // 분수 포맷팅
    formatFraction: function (n, d) {
        let g = this.gcd(n, d);
        n /= g; d /= g;
        if (d === 1) return `${n}`;
        return `\\frac{${n}}{${d}}`;
    },

    // 대분수 포맷팅
    formatMixedFraction: function (whole, n, d) {
        if (n === 0) return `${whole}`;
        let g = this.gcd(n, d);
        n /= g; d /= g;
        if (n === d) return `${whole + 1}`;
        return `${whole}\\frac{${n}}{${d}}`;
    },

    // 템플릿 치환
    replacePlaceholders: function (template, data) {
        return template.replace(/\{(.*?)\}/g, (match, key) => data[key] || match);
    },

    // ----------------------------------------------------
    // 동적 퀴즈 생성 엔진
    // ----------------------------------------------------
    generateMathQuiz: function (qTemplate) {
        if (qTemplate.type !== 'dynamic') return qTemplate;

        let q, ans, exp, wrong = [];
        const r = this.randomInt.bind(this);
        const p = this.pick.bind(this);

        const NAMES = ["우준", "지호", "민서", "예준", "서윤", "도윤", "하윤", "주원"];
        const ITEMS = ["사과", "오렌지", "초콜릿", "사탕", "우유", "주스", "끈", "리본"];
        const UNITS = ["개", "병", "kg", "L", "m", "cm"];

        switch (qTemplate.generator) {
            // [1단원] (분수) ÷ (자연수) - 기본/심화
            case 'fraction_div_int_basic':
            case 'fraction_div_int_advanced': {
                let isMixed = qTemplate.generator === 'fraction_div_int_advanced' || r(0, 1) === 1;
                let num, den, whole = 0;
                
                if (isMixed) {
                    whole = r(1, 3);
                    den = r(2, 6);
                    num = r(1, den - 1);
                } else {
                    den = r(3, 12);
                    num = r(1, den - 1);
                }
                
                let div = r(2, 9);
                let totalNum = (whole * den) + num;
                let ansNum = totalNum;
                let ansDen = den * div;

                let fracStr = isMixed ? `$${this.formatMixedFraction(whole, num, den)}$` : `$${this.formatFraction(num, den)}$`;
                q = `${fracStr} $\\div ${div}$ 의 기약분수 값은?`;
                ans = `$${this.formatFraction(ansNum, ansDen)}$`;
                
                let step1 = isMixed ? `$\\frac{${totalNum}}{${den}} \\div ${div}$` : `${fracStr} $\\div ${div}$`;
                exp = `${fracStr} 를 가분수로 나타내면 ${step1} 입니다. 여기에 $\\frac{1}{${div}}$ 을 곱하면 $${this.formatFraction(ansNum, ansDen)}$ 가 됩니다.`;

                wrong = [
                    `$${this.formatFraction(totalNum * div, den)}$`,
                    `$${this.formatFraction(ansNum, ansDen + r(1, 3))}$`,
                    `$${this.formatFraction(ansNum + r(1, 2), ansDen)}$`
                ];
                break;
            }

            // [2단원] 각기둥/각뿔 구성 요소
            case 'poly_edge_count':
                const shapes = ["각기둥", "각뿔"];
                const properties = ["면", "모서리", "꼭짓점"];
                let s = p(shapes);
                let pr = p(properties);
                let n = r(3, 12);

                const korNums = ["", "", "", "삼", "사", "오", "육", "칠", "팔", "구", "십", "십일", "십이"];
                let sName = `${korNums[n]}${s}`;

                q = `${sName}의 ${pr}의 수는 몇 개입니까?`;

                let cNum;
                if (s === "각기둥") {
                    if (pr === "면") cNum = n + 2;
                    else if (pr === "모서리") cNum = n * 3;
                    else cNum = n * 2;
                } else {
                    if (pr === "면") cNum = n + 1;
                    else if (pr === "모서리") cNum = n * 2;
                    else cNum = n + 1;
                }

                ans = `${cNum}개`;
                exp = `${sName}은 밑면이 ${n}각형인 ${s}입니다. 공식에 따라 ${pr}의 수는 ${cNum}개입니다.`;

                while (wrong.length < 3) {
                    let w = r(cNum - 4, cNum + 5);
                    if (w > 0 && w !== cNum && !wrong.includes(`${w}개`)) wrong.push(`${w}개`);
                }
                break;

            // [3단원] 소수의 나눗셈 (소수 ÷ 자연수)
            case 'decimal_div_int_basic': {
                let dAns = r(5, 45) / 10; // 0.5 ~ 4.5
                let dDiv = r(2, 5);
                let dDividend = dAns * dDiv;
                
                q = `$${dDividend.toFixed(1)} \\div ${dDiv}$ 의 값은?`;
                ans = `$${dAns.toFixed(1)}$`;
                exp = `$${dDividend.toFixed(1)} \\div ${dDiv} = ${dAns.toFixed(1)}$ 입니다.`;
                wrong = [`$${(dAns + 0.1).toFixed(1)}$`, `$${(dAns - 0.1).toFixed(1)}$`, `$${(dAns * 10).toFixed(1)}$`];
                break;
            }

            // [4단원] 비와 비율
            case 'ratio_percentage_basic': {
                let part = r(1, 9) * 10;
                let whole = 100;
                if (r(0,1) === 0) { whole = 50; part = r(1, 4) * 10; }
                else if (r(0,1) === 0) { whole = 200; part = r(1, 9) * 20; }
                
                q = `전체 ${whole} 중 ${part}가 차지하는 비율은 몇 $\\%$ 입니까?`;
                ans = `$${(part / whole * 100).toFixed(0)}\\%$`;
                exp = `비율 = $\\frac{${part}}{${whole}} \\times 100 = ${(part/whole*100).toFixed(0)}\\%$ 입니다.`;
                wrong = [`$${(part / whole * 10).toFixed(0)}\\%$`, `$${(part / whole * 100 + 10).toFixed(0)}\\%$`, `$${(part / whole * 50).toFixed(0)}\\%$`];
                break;
            }

            // =============================================
            // [6학년 2학기] 신규 제너레이터
            // =============================================

            // [1단원] (분수) ÷ (분수)
            case 'frac_div_frac_basic':
                let n1 = r(1, 5), d1 = r(2, 6);
                let n2 = r(1, 5), d2 = r(2, 6);
                // 중복 방지 및 계산 편의를 위해 다른 값 유도
                if (n1 === n2 && d1 === d2) n2++;

                q = `$${this.formatFraction(n1, d1)} \\div ${this.formatFraction(n2, d2)}$ 의 계산 결과는?`;
                let resN = n1 * d2;
                let resD = d1 * n2;
                ans = `$${this.formatFraction(resN, resD)}$`;
                exp = `$${this.formatFraction(n1, d1)} \\div ${this.formatFraction(n2, d2)} = ${this.formatFraction(n1, d1)} \\times ${this.formatFraction(d2, n2)} = ${this.formatFraction(resN, resD)}$ 입니다.`;
                wrong = [`$${this.formatFraction(n1 * n2, d1 * d2)}$`, `$${this.formatFraction(d1, n1 * n2 * d2)}$`, `$${this.formatFraction(resN + 1, resD)}$` ];
                break;

            // [2단원] (소수) ÷ (소수)
            case 'decimal_div_decimal_basic':
                let dDiv2 = r(2, 12); // 나누는 수 (자연수 환산)
                let dQuot2 = r(5, 25); // 몫
                let factor = p([10, 100]);
                let dDivVal = dDiv2 / 10;
                let dDividendVal = (dDiv2 * dQuot2) / 100;

                q = `$${dDividendVal.toFixed(2)} \\div ${dDivVal.toFixed(1)}$ 의 값은?`;
                ans = `$${(dQuot2 / 10).toFixed(1)}$`;
                exp = `소수점을 똑같이 오른쪽으로 한 칸 옮기면 $${(dDividendVal * 10).toFixed(1)} \\div ${dDiv2}$ 가 됩니다. 따라서 결과는 $${(dQuot2 / 10).toFixed(1)}$ 입니다.`;
                wrong = [`$${dQuot2}$`, `$${(dQuot2 / 100).toFixed(2)}$`, `$${(dQuot2 / 10 + 0.1).toFixed(1)}$` ];
                break;

            // [4단원] 비례식과 비례배분
            case 'proportion_basic':
                let ratioA = r(1, 5), ratioB = r(2, 6);
                if (ratioA === ratioB) ratioB++;
                let mult = r(2, 5);
                let valA = ratioA * mult;
                let valB = ratioB * mult;

                let unknownPos = r(0, 3);
                let problemArr = [valA, valB, ratioA, ratioB];
                let displayArr = [...problemArr];
                let correctVal = displayArr[unknownPos];
                displayArr[unknownPos] = '\\Box';

                q = `비례식 $${displayArr[0]} : ${displayArr[1]} = ${displayArr[2]} : ${displayArr[3]}$ 에서 $\\Box$에 알맞은 수는?`;
                ans = `$${correctVal}$`;
                exp = `비례식에서 외항의 곱과 내항의 곱은 같습니다. $${valA} \\times ${ratioB} = ${valB} \\times ${ratioA}$ 임을 이용하여 계산하면 $\\Box = ${correctVal}$ 입니다.`;
                wrong = [`$${correctVal + 1}$`, `$${correctVal * 2}$`, `$${Math.abs(correctVal - 2)}$` ];
                break;

            // [5단원] 원의 넓이 (원주율 3.1)
            case 'circle_area_basic':
                let radius = r(2, 10);
                let pi = 3.1;
                q = `반지름이 ${radius}cm인 원의 넓이는 몇 $cm^2$입니까? (원주율: ${pi})`;
                let area = radius * radius * pi;
                ans = `$${area.toFixed(1)}cm^2$`;
                exp = `원의 넓이 = 반지름 $\\times$ 반지름 $\\times$ 원주율 = $${radius} \\times ${radius} \\times ${pi} = ${area.toFixed(1)}cm^2$ 입니다.`;
                wrong = [`$${(radius * 2 * pi).toFixed(1)}cm^2$`, `$${(area + 5).toFixed(1)}cm^2$`, `$${(radius * radius).toFixed(1)}cm^2$`];
                break;

            // [6단원] 원기둥의 부피 (원주율 3)
            case 'cylinder_volume_basic':
                let cR = r(2, 5);
                let cH = r(5, 15);
                let cPi = 3;
                q = `밑면의 반지름이 ${cR}cm이고 높이가 ${cH}cm인 원기둥의 부피는 몇 $cm^3$입니까? (원주율: ${cPi})`;
                let cVol = cR * cR * cPi * cH;
                ans = `$${cVol}cm^3$`;
                exp = `원기둥의 부피 = 밑넓이 $\\times$ 높이 = $(${cR} \\times ${cR} \\times ${cPi}) \\times ${cH} = ${cR * cR * cPi} \\times ${cH} = ${cVol}cm^3$ 입니다.`;
                wrong = [`$${cVol + 20}cm^3$`, `$${(cR * 2 * cPi * cH).toFixed(0)}cm^3$`, `$${(cR * cR * cH).toFixed(0)}cm^3$`];
                break;

            // [기존 6-1단원 계속...]
            // [문장제] 공통 템플릿 (분수/소수 나눗셈)
            case 'math_word_problem':
                let name = p(NAMES);
                let item = p(ITEMS);
                let unit = p(UNITS);
                let personCount = r(3, 6);
                let totalAmount, perPerson;

                if (r(0, 1) === 0) { // 분수 유형
                    let w2 = r(2, 5);
                    let d2 = r(2, 5);
                    let n2 = r(1, d2 - 1);
                    totalAmount = `$${this.formatMixedFraction(w2, n2, d2)}$${unit}`;
                    let tNum = (w2 * d2) + n2;
                    perPerson = `$${this.formatFraction(tNum, d2 * personCount)}$${unit}`;
                    exp = `전체 양 ${totalAmount}를 ${personCount}명으로 나누면 $${this.formatMixedFraction(w2, n2, d2)} \\div ${personCount} = ${perPerson}$ 입니다.`;
                } else { // 소수 유형
                    let val = (r(50, 200) / 10).toFixed(1);
                    totalAmount = `$${val}$${unit}`;
                    perPerson = `$${(val / personCount).toFixed(2)}$${unit}`;
                    exp = `$${val} \\div ${personCount} = ${(val / personCount).toFixed(2)}$ 입니다.`;
                }

                q = `${name}는 ${item} ${totalAmount}를 가지고 있습니다. 이것을 친구 ${personCount}명에게 똑같이 나누어 준다면 한 명이 가지게 되는 ${item}의 양은?`;
                ans = perPerson;
                wrong = [`$${(parseFloat(perPerson.replace(/[^0-9.]/g, '')) * 1.2).toFixed(2)}$${unit}`, `$${(parseFloat(perPerson.replace(/[^0-9.]/g, '')) / 2).toFixed(2)}$${unit}`, `0${unit}`];
                break;

            // [5단원] 그래프 관련
            case 'graph_percentage_problem':
                let totalG = r(50, 500);
                // 10의 배수로 맞춤 (계산 편의)
                totalG = Math.round(totalG / 10) * 10;
                let partG = p([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]) * totalG;
                let pName = p(NAMES);
                let pItem = p(["독서", "운동", "게임", "잠", "공부"]);

                q = `전체 조사 대상 ${totalG}명 중 '${pItem}'를 좋아하는 학생이 ${partG}명입니다. 원 그래프에서 '${pItem}'가 차지하는 백분율은?`;
                ans = `$${(partG / totalG * 100).toFixed(0)}\\%$`;
                exp = `$\\frac{${partG}}{${totalG}} \\times 100 = ${(partG / totalG * 100).toFixed(0)}\\%$ 입니다.`;
                wrong = [`$${(partG / totalG * 100 + 10).toFixed(0)}\\%$`, `$${(partG / totalG * 100 / 2).toFixed(0)}\\%$`, `$100\\%$` ];
                break;

            case 'graph_value_problem':
                let totalV = p([100, 200, 400, 500, 1000]);
                let percentV = p([10, 15, 20, 25, 30, 40, 50]);
                let vItem = p(["축구", "야구", "농구", "배구"]);

                q = `전체 학생 수 ${totalV}명인 원 그래프에서 '${vItem}'를 좋아하는 비율이 ${percentV}\\% 일 때, '${vItem}'를 좋아하는 학생은 몇 명입니까?`;
                let correctV = (totalV * percentV) / 100;
                ans = `${correctV}명`;
                exp = `${totalV}명의 ${percentV}\\%는 $${totalV} \\times \\frac{${percentV}}{100} = ${correctV}$명 입니다.`;
                wrong = [`${correctV + 10}명`, `${correctV - 5}명`, `${percentV}명` ];
                break;

            // [6단원] 부피와 겉넓이
            case 'volume_calculation':
                let w = r(2, 10);
                let l = r(2, 10);
                let h = r(2, 10);
                let isCube = r(0, 1) === 1;
                if (isCube) l = h = w;

                q = isCube ? `한 모서리의 길이가 ${w}cm인 정육면체의 부피는?` : `가로 ${w}cm, 세로 ${l}cm, 높이 ${h}cm인 직육면체의 부피는?`;
                let vol = w * l * h;
                ans = `$${vol}cm^3$`;
                exp = isCube ? `$${w} \\times ${w} \\times ${w} = ${vol}cm^3$ 입니다.` : `$${w} \\times ${l} \\times ${h} = ${vol}cm^3$ 입니다.`;
                wrong = [`$${vol + 10}cm^3$`, `$${w + l + h}cm^3$`, `$${vol * 2}cm^3$`];
                break;

            case 'surface_area_calculation':
                let w2 = r(2, 6);
                let l2 = r(2, 6);
                let h2 = r(2, 6);
                let isCube2 = r(0, 1) === 1;
                if (isCube2) l2 = h2 = w2;

                q = isCube2 ? `한 모서리의 길이가 ${w2}cm인 정육면체의 겉넓이는?` : `가로 ${w2}cm, 세로 ${l2}cm, 높이 ${h2}cm인 직육면체의 겉넓이는?`;
                let sa = isCube2 ? (6 * w2 * w2) : 2 * (w2 * l2 + l2 * h2 + h2 * w2);
                ans = `$${sa}cm^2$`;
                exp = isCube2 ? `한 면의 넓이가 $${w2} \\times ${w2} = ${w2 * w2}$이고 면이 6개이므로 $${w2 * w2} \\times 6 = ${sa}cm^2$입니다.` 
                             : `세 쌍의 면 넓이의 합의 2배이므로 $2 \\times (${w2 * l2} + ${l2 * h2} + ${h2 * w2}) = ${sa}cm^2$입니다.`;
                wrong = [`$${sa + 8}cm^2$`, `$${sa / 2}cm^2$`, `$${w2 * l2 * h2}cm^2$`];
                break;

            default:
                if (!qTemplate.choices) {
                    q = "이 유형의 문제는 아직 개발 중입니다. (임시 문제)";
                    ans = "1";
                    exp = "아직 개발 중인 문제입니다.";
                    wrong = ["2", "3", "4"];
                    break;
                }
                return qTemplate;
        }

        let choices = [ans, ...wrong];
        this.shuffle(choices);
        let ansIdx = choices.indexOf(ans);

        return {
            question: q,
            choices: choices,
            answer: ansIdx,
            explanation: exp,
            difficulty: qTemplate.difficulty || "medium",
            generator: qTemplate.generator,
            wrongCount: qTemplate.wrongCount || 0
        };
    }
};

if (typeof window !== 'undefined') window.Utils = Utils;
if (typeof module !== 'undefined' && module.exports) module.exports = Utils;


// ----------------------------------------------------
// 전역 및 모듈 노출
// ----------------------------------------------------
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
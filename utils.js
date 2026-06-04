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

            // =============================================
            // [1학기 1단원] 분수의 나눗셈 추가 유형
            // =============================================

            // □ ÷ n = 분수  →  □ 구하기
            case 'frac_div_int_fill_blank': {
                let fNum = r(1, 7), fDen = r(2, 8), fDiv = r(2, 6);
                let boxNum = fNum * fDiv;
                let boxDen = fDen;
                q = `$\\Box \\div ${fDiv} = ${this.formatFraction(fNum, fDen)}$ 에서 $\\Box$에 알맞은 분수는?`;
                ans = `$${this.formatFraction(boxNum, boxDen)}$`;
                exp = `$\\Box = ${this.formatFraction(fNum, fDen)} \\times ${fDiv} = ${this.formatFraction(boxNum, boxDen)}$ 입니다.`;
                wrong = [
                    `$${this.formatFraction(fNum, fDen * fDiv)}$`,
                    `$${this.formatFraction(boxNum + 1, boxDen)}$`,
                    `$${this.formatFraction(fNum, fDen + fDiv)}$`
                ];
                break;
            }

            // 두 분수 나눗셈 결과 대소 비교
            case 'frac_div_int_compare': {
                let an1 = r(1, 5), ad1 = r(2, 8), aDiv = r(2, 5);
                let bn1 = r(1, 5), bd1 = r(2, 8), bDiv = r(2, 5);
                let aResN = an1, aResD = ad1 * aDiv;
                let bResN = bn1, bResD = bd1 * bDiv;
                // 공통분모로 비교
                let aVal = an1 / (ad1 * aDiv);
                let bVal = bn1 / (bd1 * bDiv);
                let aStr = `$${this.formatFraction(an1, ad1)} \\div ${aDiv}$`;
                let bStr = `$${this.formatFraction(bn1, bd1)} \\div ${bDiv}$`;
                q = `${aStr} 와 ${bStr} 중 어느 것이 더 큽니까?`;
                if (Math.abs(aVal - bVal) < 0.0001) {
                    ans = `두 값이 같습니다`;
                    exp = `두 값을 계산하면 모두 $${this.formatFraction(aResN, aResD)}$ 로 같습니다.`;
                    wrong = [aStr, bStr, `알 수 없습니다`];
                } else if (aVal > bVal) {
                    ans = aStr;
                    exp = `${aStr} $= ${this.formatFraction(aResN, aResD)}$, ${bStr} $= ${this.formatFraction(bResN, bResD)}$ 이므로 ${aStr}가 더 큽니다.`;
                    wrong = [bStr, `두 값이 같습니다`, `알 수 없습니다`];
                } else {
                    ans = bStr;
                    exp = `${aStr} $= ${this.formatFraction(aResN, aResD)}$, ${bStr} $= ${this.formatFraction(bResN, bResD)}$ 이므로 ${bStr}가 더 큽니다.`;
                    wrong = [aStr, `두 값이 같습니다`, `알 수 없습니다`];
                }
                break;
            }

            // 다양한 맥락의 분수 나눗셈 문장제
            case 'frac_div_int_word2': {
                let wName = p(NAMES);
                let wDiv = r(2, 5);
                let wType = r(0, 2);
                let wN = r(1, 5), wD = r(2, 8);
                let wTotal = `$${this.formatFraction(wN * wDiv, wD)}$`;
                let wAns = `$${this.formatFraction(wN, wD)}$`;
                if (wType === 0) {
                    q = `${wName}이가 테이프 ${wTotal}m를 ${wDiv}도막으로 똑같이 자르면 한 도막은 몇 m입니까?`;
                    exp = `$${this.formatFraction(wN * wDiv, wD)} \\div ${wDiv} = ${this.formatFraction(wN, wD)}$m 입니다.`;
                } else if (wType === 1) {
                    q = `물 ${wTotal}L를 ${wDiv}개의 컵에 똑같이 나누면 컵 하나에 들어가는 물의 양은 몇 L입니까?`;
                    exp = `$${this.formatFraction(wN * wDiv, wD)} \\div ${wDiv} = ${this.formatFraction(wN, wD)}$L 입니다.`;
                } else {
                    q = `${wName}이가 ${wTotal}km를 ${wDiv}시간 동안 같은 빠르기로 걸었습니다. 1시간에 걷는 거리는 몇 km입니까?`;
                    exp = `$${this.formatFraction(wN * wDiv, wD)} \\div ${wDiv} = ${this.formatFraction(wN, wD)}$km 입니다.`;
                }
                ans = `${wAns}`;
                wrong = [
                    `$${this.formatFraction(wN * wDiv * wDiv, wD)}$`,
                    `$${this.formatFraction(wN + 1, wD)}$`,
                    `$${this.formatFraction(wN, wD + wDiv)}$`
                ];
                break;
            }

            // =============================================
            // [1학기 3단원] 소수의 나눗셈 추가 유형
            // =============================================

            // □ ÷ n = 소수  →  □ 구하기
            case 'decimal_div_int_fill': {
                let dAnsF = r(5, 45) / 10;
                let dDivF = r(2, 6);
                let dBoxF = parseFloat((dAnsF * dDivF).toFixed(1));
                q = `$\\Box \\div ${dDivF} = ${dAnsF.toFixed(1)}$ 에서 $\\Box$에 알맞은 수는?`;
                ans = `$${dBoxF.toFixed(1)}$`;
                exp = `$\\Box = ${dAnsF.toFixed(1)} \\times ${dDivF} = ${dBoxF.toFixed(1)}$ 입니다.`;
                wrong = [
                    `$${(dAnsF / dDivF).toFixed(2)}$`,
                    `$${(dBoxF + 0.1).toFixed(1)}$`,
                    `$${(dBoxF - 0.1).toFixed(1)}$`
                ];
                break;
            }

            // 소수점 위치가 올바른 것 고르기
            case 'decimal_div_int_place': {
                let dpAns = r(5, 45) / 10;
                let dpDiv = r(2, 6);
                let dpDividend = parseFloat((dpAns * dpDiv).toFixed(1));
                q = `$${dpDividend.toFixed(1)} \\div ${dpDiv}$ 의 계산 결과로 소수점 위치가 올바른 것은?`;
                ans = `$${dpAns.toFixed(1)}$`;
                exp = `$${dpDividend.toFixed(1)} \\div ${dpDiv} = ${dpAns.toFixed(1)}$ 입니다. 소수점 위치에 주의하세요.`;
                wrong = [
                    `$${(dpAns * 10).toFixed(0)}$`,
                    `$${(dpAns / 10).toFixed(2)}$`,
                    `$${(dpAns * 100).toFixed(0)}$`
                ];
                break;
            }

            // 어림값으로 나눗셈 계산
            case 'decimal_div_int_estimate': {
                let deAns = r(2, 9);
                let deDiv = r(2, 6);
                let deExact = parseFloat((deAns * deDiv + r(1, 4) / 10).toFixed(1));
                let deRound = Math.round(deExact);
                q = `$${deExact.toFixed(1)}$을 반올림하여 자연수로 어림한 뒤 ${deDiv}로 나누면 얼마입니까?`;
                ans = `$${deRound} \\div ${deDiv} = ${(deRound / deDiv).toFixed(1)}$`;
                exp = `$${deExact.toFixed(1)}$을 반올림하면 ${deRound}이고, $${deRound} \\div ${deDiv} = ${(deRound / deDiv).toFixed(1)}$ 입니다.`;
                wrong = [
                    `$${deExact} \\div ${deDiv} = ${(deExact / deDiv).toFixed(2)}$`,
                    `$${deRound} \\div ${deDiv} = ${(deRound / deDiv + 1).toFixed(1)}$`,
                    `$${deRound + 1} \\div ${deDiv} = ${((deRound + 1) / deDiv).toFixed(1)}$`
                ];
                break;
            }

            // =============================================
            // [1학기 4단원] 비와 비율 추가 유형
            // =============================================

            // 전체와 비율로 부분 구하기
            case 'ratio_find_part': {
                let rfTotal = p([50, 100, 200, 400, 500]);
                let rfPercent = p([10, 20, 25, 30, 40, 50]);
                let rfPart = rfTotal * rfPercent / 100;
                q = `전체 ${rfTotal}의 ${rfPercent}$\\%$는 얼마입니까?`;
                ans = `$${rfPart}$`;
                exp = `$${rfTotal} \\times \\frac{${rfPercent}}{100} = ${rfPart}$ 입니다.`;
                wrong = [
                    `$${rfTotal * rfPercent}$`,
                    `$${rfPart + 10}$`,
                    `$${rfPercent}$`
                ];
                break;
            }

            // 비율을 분수로 변환
            case 'ratio_to_fraction': {
                let rtA = r(1, 6), rtB = r(rtA + 1, rtA + 6);
                q = `$${rtA} : ${rtB}$ 에서 $${rtA}$의 비율을 분수로 나타내면?`;
                ans = `$${this.formatFraction(rtA, rtB)}$`;
                exp = `기준량이 ${rtB}이고 비교하는 양이 ${rtA}이므로 비율 $= \\frac{${rtA}}{${rtB}}$ 입니다.`;
                wrong = [
                    `$${this.formatFraction(rtB, rtA)}$`,
                    `$${this.formatFraction(rtA, rtA + rtB)}$`,
                    `$${this.formatFraction(rtA + 1, rtB)}$`
                ];
                break;
            }

            // 두 비율 중 더 높은 것 고르기
            case 'ratio_compare': {
                let rcA1 = r(1, 5), rcB1 = p([10, 20, 50, 100]);
                let rcA2 = r(1, 5), rcB2 = p([10, 20, 50, 100]);
                while (rcA1 / rcB1 === rcA2 / rcB2) rcA2++;
                let rcVal1 = rcA1 / rcB1;
                let rcVal2 = rcA2 / rcB2;
                let opt1 = `$${this.formatFraction(rcA1, rcB1)}$`;
                let opt2 = `$${this.formatFraction(rcA2, rcB2)}$`;
                q = `${opt1} 과 ${opt2} 중 비율이 더 높은 것은?`;
                ans = rcVal1 > rcVal2 ? opt1 : opt2;
                exp = `${opt1} $= ${rcVal1.toFixed(3)}$, ${opt2} $= ${rcVal2.toFixed(3)}$ 이므로 ${ans}이 더 높습니다.`;
                wrong = [rcVal1 > rcVal2 ? opt2 : opt1, `두 비율이 같습니다`, `비교할 수 없습니다`];
                break;
            }

            // =============================================
            // [1학기 6단원] 직육면체 부피/겉넓이 추가 유형
            // =============================================

            // 부피가 주어지고 한 변 구하기
            case 'volume_reverse': {
                let vrW = r(2, 6), vrL = r(2, 6), vrH = r(2, 8);
                let vrVol = vrW * vrL * vrH;
                let hideWhich = p(['높이', '가로', '세로']);
                let knownA, knownB, knownC, hideVal;
                if (hideWhich === '높이') { knownA = vrW; knownB = vrL; hideVal = vrH; }
                else if (hideWhich === '가로') { knownA = vrL; knownB = vrH; hideVal = vrW; }
                else { knownA = vrW; knownB = vrH; hideVal = vrL; }
                q = hideWhich === '높이'
                    ? `가로 ${knownA}cm, 세로 ${knownB}cm, 부피가 ${vrVol}cm³인 직육면체의 높이는 몇 cm입니까?`
                    : `세로 ${knownA}cm, 높이 ${knownB}cm, 부피가 ${vrVol}cm³인 직육면체의 ${hideWhich}는 몇 cm입니까?`;
                ans = `$${hideVal}$cm`;
                exp = `부피 = 가로 × 세로 × 높이 이므로 ${hideWhich} $= ${vrVol} \\div (${knownA} \\times ${knownB}) = ${hideVal}$cm 입니다.`;
                wrong = [`$${hideVal + 1}$cm`, `$${hideVal * 2}$cm`, `$${hideVal - 1}$cm`];
                break;
            }

            // 단위 변환 (cm³ ↔ L, mL)
            case 'volume_unit_convert': {
                let vucType = r(0, 2);
                if (vucType === 0) {
                    let vucL = p([1, 2, 3, 4, 5]);
                    q = `$${vucL}$L는 몇 cm³입니까?`;
                    ans = `$${vucL * 1000}$cm³`;
                    exp = `1L = 1000cm³ 이므로 $${vucL}$L $= ${vucL * 1000}$cm³ 입니다.`;
                    wrong = [`$${vucL * 100}$cm³`, `$${vucL * 10}$cm³`, `$${vucL * 1000 + 100}$cm³`];
                } else if (vucType === 1) {
                    let vucCm = p([1000, 2000, 3000, 5000]);
                    q = `$${vucCm}$cm³는 몇 L입니까?`;
                    ans = `$${vucCm / 1000}$L`;
                    exp = `1000cm³ = 1L 이므로 $${vucCm}$cm³ $= ${vucCm / 1000}$L 입니다.`;
                    wrong = [`$${vucCm / 100}$L`, `$${vucCm}$L`, `$${vucCm / 1000 + 1}$L`];
                } else {
                    let vucMl = p([500, 250, 1500, 2500]);
                    q = `$${vucMl}$mL는 몇 cm³입니까?`;
                    ans = `$${vucMl}$cm³`;
                    exp = `1mL = 1cm³ 이므로 $${vucMl}$mL $= ${vucMl}$cm³ 입니다.`;
                    wrong = [`$${vucMl / 10}$cm³`, `$${vucMl * 10}$cm³`, `$${vucMl + 100}$cm³`];
                }
                break;
            }

            // =============================================
            // [2학기 1단원] 분수 ÷ 분수 추가 유형
            // =============================================

            // □ ÷ 분수 = 분수  →  □ 구하기
            case 'frac_div_frac_fill': {
                let ffN1 = r(1, 5), ffD1 = r(2, 6);
                let ffN2 = r(1, 5), ffD2 = r(2, 6);
                // 결과 = ffN1/ffD1, 나누는 수 = ffN2/ffD2
                // □ = (ffN1/ffD1) × (ffN2/ffD2)
                let ffBoxN = ffN1 * ffN2, ffBoxD = ffD1 * ffD2;
                q = `$\\Box \\div ${this.formatFraction(ffN2, ffD2)} = ${this.formatFraction(ffN1, ffD1)}$ 에서 $\\Box$는?`;
                ans = `$${this.formatFraction(ffBoxN, ffBoxD)}$`;
                exp = `$\\Box = ${this.formatFraction(ffN1, ffD1)} \\times ${this.formatFraction(ffN2, ffD2)} = ${this.formatFraction(ffBoxN, ffBoxD)}$ 입니다.`;
                wrong = [
                    `$${this.formatFraction(ffN1 * ffD2, ffD1 * ffN2)}$`,
                    `$${this.formatFraction(ffBoxN + 1, ffBoxD)}$`,
                    `$${this.formatFraction(ffN1, ffD1 + ffD2)}$`
                ];
                break;
            }

            // 두 분수 나눗셈 결과 대소 비교
            case 'frac_div_frac_compare': {
                let fcA1 = r(1, 4), fcB1 = r(2, 6), fcC1 = r(1, 4), fcD1 = r(2, 6);
                let fcA2 = r(1, 4), fcB2 = r(2, 6), fcC2 = r(1, 4), fcD2 = r(2, 6);
                let fcVal1 = (fcA1 * fcD1) / (fcB1 * fcC1);
                let fcVal2 = (fcA2 * fcD2) / (fcB2 * fcC2);
                let fcStr1 = `$${this.formatFraction(fcA1, fcB1)} \\div ${this.formatFraction(fcC1, fcD1)}$`;
                let fcStr2 = `$${this.formatFraction(fcA2, fcB2)} \\div ${this.formatFraction(fcC2, fcD2)}$`;
                q = `${fcStr1} 와 ${fcStr2} 중 계산 결과가 더 큰 것은?`;
                if (Math.abs(fcVal1 - fcVal2) < 0.0001) {
                    ans = `두 값이 같습니다`;
                    exp = `두 식의 계산 결과가 같습니다.`;
                    wrong = [fcStr1, fcStr2, `알 수 없습니다`];
                } else if (fcVal1 > fcVal2) {
                    ans = fcStr1;
                    exp = `${fcStr1}의 결과가 더 큽니다.`;
                    wrong = [fcStr2, `두 값이 같습니다`, `알 수 없습니다`];
                } else {
                    ans = fcStr2;
                    exp = `${fcStr2}의 결과가 더 큽니다.`;
                    wrong = [fcStr1, `두 값이 같습니다`, `알 수 없습니다`];
                }
                break;
            }

            // 속도/거리 맥락 문장제
            case 'frac_div_frac_word': {
                let fwName = p(NAMES);
                let fwDistN = r(1, 5), fwDistD = r(2, 6);
                let fwTimeN = r(1, 3), fwTimeD = p([2, 3, 4]);
                // 속력 = 거리 ÷ 시간
                let fwSpeedN = fwDistN * fwTimeD;
                let fwSpeedD = fwDistD * fwTimeN;
                q = `${fwName}이가 $${this.formatFraction(fwDistN, fwDistD)}$km를 $${this.formatFraction(fwTimeN, fwTimeD)}$시간 동안 걸었습니다. 1시간에 걷는 거리는 몇 km입니까?`;
                ans = `$${this.formatFraction(fwSpeedN, fwSpeedD)}$km`;
                exp = `속력 $= ${this.formatFraction(fwDistN, fwDistD)} \\div ${this.formatFraction(fwTimeN, fwTimeD)} = ${this.formatFraction(fwDistN, fwDistD)} \\times ${this.formatFraction(fwTimeD, fwTimeN)} = ${this.formatFraction(fwSpeedN, fwSpeedD)}$km/시간 입니다.`;
                wrong = [
                    `$${this.formatFraction(fwDistN * fwTimeN, fwDistD * fwTimeD)}$km`,
                    `$${this.formatFraction(fwSpeedN + 1, fwSpeedD)}$km`,
                    `$${this.formatFraction(fwDistN, fwDistD)}$km`
                ];
                break;
            }

            // =============================================
            // [2학기 2단원] 소수 ÷ 소수 추가 유형
            // =============================================

            // □ ÷ 소수 = 소수  →  □ 구하기
            case 'decimal_div_decimal_fill': {
                let ddQuot = r(5, 25);
                let ddDivisor = r(2, 12);
                let ddBox = parseFloat(((ddDivisor * ddQuot) / 100).toFixed(2));
                let ddDivVal = parseFloat((ddDivisor / 10).toFixed(1));
                let ddAnsVal = parseFloat((ddQuot / 10).toFixed(1));
                q = `$\\Box \\div ${ddDivVal.toFixed(1)} = ${ddAnsVal.toFixed(1)}$ 에서 $\\Box$에 알맞은 수는?`;
                ans = `$${ddBox.toFixed(2)}$`;
                exp = `$\\Box = ${ddAnsVal.toFixed(1)} \\times ${ddDivVal.toFixed(1)} = ${ddBox.toFixed(2)}$ 입니다.`;
                wrong = [
                    `$${(ddAnsVal / ddDivVal).toFixed(2)}$`,
                    `$${(ddBox + 0.1).toFixed(2)}$`,
                    `$${(ddBox * 10).toFixed(1)}$`
                ];
                break;
            }

            // 두 소수 나눗셈 대소 비교
            case 'decimal_div_decimal_compare': {
                let dcQ1 = r(5, 25), dcD1 = r(2, 12);
                let dcQ2 = r(5, 25), dcD2 = r(2, 12);
                while (dcQ1 / dcD1 === dcQ2 / dcD2) dcQ2++;
                let dcVal1 = dcQ1 / dcD1;
                let dcVal2 = dcQ2 / dcD2;
                let dc1str = `$${((dcD1 * dcQ1) / 100).toFixed(2)} \\div ${(dcD1 / 10).toFixed(1)}$`;
                let dc2str = `$${((dcD2 * dcQ2) / 100).toFixed(2)} \\div ${(dcD2 / 10).toFixed(1)}$`;
                q = `${dc1str} 와 ${dc2str} 중 계산 결과가 더 큰 것은?`;
                ans = dcVal1 > dcVal2 ? dc1str : dc2str;
                exp = `${dc1str} $= ${(dcQ1 / 10).toFixed(1)}$, ${dc2str} $= ${(dcQ2 / 10).toFixed(1)}$ 이므로 ${ans}이 더 큽니다.`;
                wrong = [dcVal1 > dcVal2 ? dc2str : dc1str, `두 값이 같습니다`, `알 수 없습니다`];
                break;
            }

            // =============================================
            // [2학기 4단원] 비례식과 비례배분 추가 유형
            // =============================================

            // 비례배분 문장제
            case 'proportion_word': {
                let pwTotal = p([12, 18, 20, 24, 30, 36]);
                let pwA = r(1, 5), pwB = r(1, 5);
                while (pwA === pwB) pwB = r(1, 5);
                let pwSum = pwA + pwB;
                // 나누어 떨어지는 경우만
                while (pwTotal % pwSum !== 0) pwTotal = p([12, 18, 20, 24, 30, 36, 40, 42, 48]);
                let pwPartA = pwTotal * pwA / pwSum;
                let pwPartB = pwTotal * pwB / pwSum;
                let pwItem = p(ITEMS);
                let pwName1 = p(NAMES), pwName2 = p(NAMES.filter(n => n !== pwName1));
                q = `${pwItem} ${pwTotal}개를 ${pwName1}와 ${pwName2}가 ${pwA} : ${pwB}로 나눈다면, ${pwName1}는 몇 개를 가져갑니까?`;
                ans = `${pwPartA}개`;
                exp = `전체 ${pwTotal}개를 ${pwA} : ${pwB}로 나누면 ${pwName1}는 $${pwTotal} \\times \\frac{${pwA}}{${pwSum}} = ${pwPartA}$개 입니다.`;
                wrong = [`${pwPartB}개`, `${pwTotal - 1}개`, `${pwA}개`];
                break;
            }

            // 비 간단히 하기
            case 'proportion_simplify': {
                let psBase = r(2, 6);
                let psA = psBase * r(2, 5);
                let psB = psBase * r(2, 5);
                while (psA === psB) psB = psBase * r(2, 5);
                let psG = this.gcd(psA, psB);
                let psSA = psA / psG, psSB = psB / psG;
                q = `$${psA} : ${psB}$ 를 가장 간단한 자연수의 비로 나타내면?`;
                ans = `$${psSA} : ${psSB}$`;
                exp = `최대공약수 ${psG}로 나누면 $${psA} \\div ${psG} = ${psSA}$, $${psB} \\div ${psG} = ${psSB}$ 이므로 $${psSA} : ${psSB}$ 입니다.`;
                wrong = [`$${psA} : ${psB}$`, `$${psSA + 1} : ${psSB}$`, `$${psSA} : ${psSB + 1}$`];
                break;
            }

            // =============================================
            // [2학기 5단원] 원의 넓이 추가 유형
            // =============================================

            // 원주 구하기
            case 'circle_circumference': {
                let ccR = r(2, 10);
                let ccPi = 3.1;
                let ccCirc = parseFloat((ccR * 2 * ccPi).toFixed(1));
                q = `반지름이 ${ccR}cm인 원의 원주는 몇 cm입니까? (원주율: ${ccPi})`;
                ans = `$${ccCirc}$cm`;
                exp = `원주 = 지름 $\\times$ 원주율 = $${ccR * 2} \\times ${ccPi} = ${ccCirc}$cm 입니다.`;
                wrong = [`$${parseFloat((ccR * ccPi).toFixed(1))}$cm`, `$${(ccCirc + ccPi).toFixed(1)}$cm`, `$${parseFloat((ccR * ccR * ccPi).toFixed(1))}$cm`];
                break;
            }

            // 넓이로 반지름 구하기
            case 'circle_reverse_radius': {
                let crrR = p([2, 3, 4, 5, 6, 7, 8]);
                let crrPi = 3.1;
                let crrArea = parseFloat((crrR * crrR * crrPi).toFixed(1));
                q = `넓이가 ${crrArea}cm²인 원의 반지름은 몇 cm입니까? (원주율: ${crrPi})`;
                ans = `$${crrR}$cm`;
                exp = `넓이 = 반지름² $\\times$ 원주율 이므로 반지름² $= ${crrArea} \\div ${crrPi} = ${crrR * crrR}$, 반지름 $= ${crrR}$cm 입니다.`;
                wrong = [`$${crrR + 1}$cm`, `$${crrR - 1}$cm`, `$${crrR * 2}$cm`];
                break;
            }

            // 원주로 지름 구하기
            case 'circle_diameter_from_circumference': {
                let cdR = p([3, 4, 5, 6, 7, 8, 10]);
                let cdPi = 3.1;
                let cdCirc = parseFloat((cdR * 2 * cdPi).toFixed(1));
                q = `원주가 ${cdCirc}cm인 원의 지름은 몇 cm입니까? (원주율: ${cdPi})`;
                ans = `$${cdR * 2}$cm`;
                exp = `지름 = 원주 $\\div$ 원주율 $= ${cdCirc} \\div ${cdPi} = ${cdR * 2}$cm 입니다.`;
                wrong = [`$${cdR}$cm`, `$${cdR * 2 + 2}$cm`, `$${cdR * 2 - 2}$cm`];
                break;
            }

            // =============================================
            // [2학기 6단원] 원기둥·원뿔·구 추가 유형
            // =============================================

            // 원기둥 옆넓이
            case 'cylinder_lateral_area': {
                let claR = r(2, 7);
                let claH = r(3, 12);
                let claPi = 3.1;
                let claLat = parseFloat((claR * 2 * claPi * claH).toFixed(1));
                q = `밑면의 반지름이 ${claR}cm, 높이가 ${claH}cm인 원기둥의 옆넓이는 몇 cm²입니까? (원주율: ${claPi})`;
                ans = `$${claLat}$cm²`;
                exp = `옆넓이 = 밑면 둘레 $\\times$ 높이 $= (${claR * 2} \\times ${claPi}) \\times ${claH} = ${claLat}$cm² 입니다.`;
                wrong = [`$${parseFloat((claR * claR * claPi * claH).toFixed(1))}$cm²`, `$${(claLat + claR).toFixed(1)}$cm²`, `$${(claLat / 2).toFixed(1)}$cm²`];
                break;
            }

            // 원기둥 전체 겉넓이
            case 'cylinder_total_surface': {
                let ctsR = r(2, 6);
                let ctsH = r(3, 10);
                let ctsPi = 3.1;
                let ctsBase = parseFloat((ctsR * ctsR * ctsPi).toFixed(1));
                let ctsLat = parseFloat((ctsR * 2 * ctsPi * ctsH).toFixed(1));
                let ctsTotal = parseFloat((ctsBase * 2 + ctsLat).toFixed(1));
                q = `밑면의 반지름이 ${ctsR}cm, 높이가 ${ctsH}cm인 원기둥의 겉넓이는 몇 cm²입니까? (원주율: ${ctsPi})`;
                ans = `$${ctsTotal}$cm²`;
                exp = `겉넓이 = 옆넓이 + 밑면 2개 $= ${ctsLat} + ${ctsBase} \\times 2 = ${ctsLat} + ${ctsBase * 2} = ${ctsTotal}$cm² 입니다.`;
                wrong = [`$${(ctsTotal + ctsBase).toFixed(1)}$cm²`, `$${ctsLat}$cm²`, `$${(ctsBase * 2).toFixed(1)}$cm²`];
                break;
            }

            // 원기둥과 원뿔 비교 개념 문제
            case 'cone_vs_cylinder': {
                let cvcType = r(0, 2);
                if (cvcType === 0) {
                    q = `원기둥과 원뿔에 대한 설명으로 **옳은** 것은?`;
                    ans = `원기둥의 옆면은 직사각형 모양입니다`;
                    exp = `원기둥을 펼치면 옆면이 직사각형이 됩니다. 원뿔의 꼭짓점은 1개이며, 원기둥과 원뿔 모두 밑면은 원입니다.`;
                    wrong = [`원뿔에는 꼭짓점이 없습니다`, `원기둥의 밑면은 삼각형입니다`, `원기둥과 원뿔의 면의 수는 같습니다`];
                } else if (cvcType === 1) {
                    q = `원뿔에 대한 설명으로 **틀린** 것은?`;
                    ans = `원뿔의 밑면은 2개입니다`;
                    exp = `원뿔의 밑면은 1개(원)이고, 옆면은 1개(부채꼴)입니다. 꼭짓점은 1개 있습니다.`;
                    wrong = [`원뿔의 꼭짓점은 1개입니다`, `원뿔의 밑면은 원입니다`, `원뿔의 옆면은 부채꼴 모양입니다`];
                } else {
                    q = `원기둥에 대한 설명으로 **옳은** 것은?`;
                    ans = `원기둥의 두 밑면은 서로 합동이고 평행합니다`;
                    exp = `원기둥의 위아래 두 밑면은 합동인 원이고 서로 평행합니다.`;
                    wrong = [`원기둥에는 꼭짓점이 2개 있습니다`, `원기둥의 옆면은 곡면이 아닌 평면입니다`, `원기둥의 밑면은 직사각형입니다`];
                }
                break;
            }

            // =============================================
            // [5단원] 여러 가지 그래프 추가 유형
            // =============================================

            // 부분과 비율로 전체 구하기 (역방향)
            case 'graph_find_total': {
                let gftPart = p([20, 30, 40, 50, 60, 80, 100]);
                let gftPercent = p([10, 20, 25, 40, 50]);
                let gftTotal = gftPart * 100 / gftPercent;
                let gftItem = p(["독서", "운동", "게임", "공부", "음악"]);
                q = `원 그래프에서 '${gftItem}'의 비율이 ${gftPercent}\\%이고, '${gftItem}'를 선택한 학생이 ${gftPart}명일 때, 전체 학생 수는 몇 명입니까?`;
                ans = `${gftTotal}명`;
                exp = `전체 $= ${gftPart} \\div \\frac{${gftPercent}}{100} = ${gftPart} \\times \\frac{100}{${gftPercent}} = ${gftTotal}$명 입니다.`;
                wrong = [`${gftTotal + 10}명`, `${gftTotal / 2}명`, `${gftPart}명`];
                break;
            }

            // 그래프에서 순위/관계 파악
            case 'graph_rank': {
                let grItems = p([["축구", "농구", "야구", "배구"], ["독서", "운동", "게임", "잠"], ["사과", "바나나", "포도", "딸기"]]);
                let grVals = [r(25, 40), r(20, 30), r(15, 25), r(5, 15)];
                // 합이 100이 되도록 조정
                let grSum = grVals.reduce((a, b) => a + b, 0);
                grVals[3] = 100 - grVals[0] - grVals[1] - grVals[2];
                if (grVals[3] <= 0) { grVals[0] = 30; grVals[1] = 25; grVals[2] = 20; grVals[3] = 25; }
                // 정렬하여 1위 찾기
                let grRanked = grItems.map((item, i) => ({ item, val: grVals[i] })).sort((a, b) => b.val - a.val);
                let grType = r(0, 1);
                if (grType === 0) {
                    q = `어느 반 학생들이 좋아하는 것을 조사한 원 그래프에서 ${grItems[0]}이 ${grVals[0]}\\%, ${grItems[1]}이 ${grVals[1]}\\%, ${grItems[2]}이 ${grVals[2]}\\%, ${grItems[3]}이 ${grVals[3]}\\%일 때, 가장 좋아하는 것은?`;
                    ans = grRanked[0].item;
                    exp = `비율이 가장 높은 것은 ${grRanked[0].val}\\%인 ${grRanked[0].item} 입니다.`;
                    wrong = [grRanked[1].item, grRanked[2].item, grRanked[3].item];
                } else {
                    q = `원 그래프에서 ${grItems[0]}이 ${grVals[0]}\\%, ${grItems[1]}이 ${grVals[1]}\\%, ${grItems[2]}이 ${grVals[2]}\\%, ${grItems[3]}이 ${grVals[3]}\\%일 때, 두 번째로 좋아하는 것은?`;
                    ans = grRanked[1].item;
                    exp = `두 번째로 비율이 높은 것은 ${grRanked[1].val}\\%인 ${grRanked[1].item} 입니다.`;
                    wrong = [grRanked[0].item, grRanked[2].item, grRanked[3].item];
                }
                break;
            }

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
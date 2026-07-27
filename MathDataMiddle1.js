/**
 * 중학교 1학년 수학 학습 데이터
 * 1학기: 소인수분해, 정수와 유리수, 문자와 식, 일차방정식, 좌표평면과 그래프
 */
(() => {
    if (typeof MathData === 'undefined') return;

    const visual = {
        factorTree: {
            svg: `<svg viewBox="0 0 640 260" role="img" aria-label="60의 소인수분해 나무">
                <style>.n{fill:#161b22;stroke:#58a6ff;stroke-width:3}.t{fill:#f0f6fc;font:700 22px sans-serif;text-anchor:middle}.p{stroke:#8b949e;stroke-width:3}.prime{fill:#1f6f46;stroke:#3fb950}</style>
                <line class="p" x1="320" y1="48" x2="220" y2="105"/><line class="p" x1="320" y1="48" x2="420" y2="105"/>
                <line class="p" x1="420" y1="130" x2="365" y2="200"/><line class="p" x1="420" y1="130" x2="475" y2="200"/>
                <circle class="n" cx="320" cy="40" r="30"/><text class="t" x="320" y="48">60</text>
                <circle class="n prime" cx="220" cy="120" r="28"/><text class="t" x="220" y="128">2</text>
                <circle class="n" cx="420" cy="120" r="30"/><text class="t" x="420" y="128">30</text>
                <circle class="n prime" cx="365" cy="215" r="28"/><text class="t" x="365" y="223">2</text>
                <circle class="n" cx="475" cy="215" r="30"/><text class="t" x="475" y="223">15</text>
                <text class="t" x="95" y="238" style="fill:#3fb950">60 = 2² × 3 × 5</text>
            </svg>`,
            caption: "합성수를 소수가 될 때까지 가지로 나누면 소인수분해가 보입니다."
        },
        venn: {
            svg: `<svg viewBox="0 0 640 260" role="img" aria-label="최대공약수와 최소공배수의 소인수 비교">
                <style>.c{fill-opacity:.22;stroke-width:3}.a{fill:#58a6ff;stroke:#58a6ff}.b{fill:#f778ba;stroke:#f778ba}.t{fill:#f0f6fc;font:700 22px sans-serif;text-anchor:middle}.s{fill:#c9d1d9;font:18px sans-serif;text-anchor:middle}</style>
                <circle class="c a" cx="270" cy="125" r="95"/><circle class="c b" cx="370" cy="125" r="95"/>
                <text class="t" x="210" y="55">12 = 2²×3</text><text class="t" x="430" y="55">18 = 2×3²</text>
                <text class="t" x="215" y="135">2</text><text class="t" x="320" y="118">2×3</text><text class="t" x="425" y="135">3</text>
                <text class="s" x="320" y="235">공통 부분 2×3=6 → 최대공약수</text>
            </svg>`,
            caption: "최대공약수는 공통 부분, 최소공배수는 양쪽을 모두 합친 부분입니다."
        },
        numberLine: {
            svg: `<svg viewBox="0 0 700 230" role="img" aria-label="정수와 유리수의 수직선">
                <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#8b949e"/></marker></defs>
                <style>.axis{stroke:#8b949e;stroke-width:3}.tick{stroke:#c9d1d9;stroke-width:2}.t{fill:#f0f6fc;font:18px sans-serif;text-anchor:middle}.pos{fill:#3fb950}.neg{fill:#ff7b72}</style>
                <line class="axis" x1="45" y1="115" x2="665" y2="115" marker-end="url(#arrow)"/>
                ${[-3,-2,-1,0,1,2,3].map((n,i)=>`<line class="tick" x1="${100+i*85}" y1="100" x2="${100+i*85}" y2="130"/><text class="t" x="${100+i*85}" y="158">${n}</text>`).join('')}
                <circle class="neg" cx="185" cy="115" r="8"/><text class="t neg" x="185" y="72">-2</text>
                <circle class="pos" cx="525" cy="115" r="8"/><text class="t pos" x="525" y="72">+2</text>
                <text class="t" x="350" y="205">0에서 같은 거리 → 절댓값은 모두 2</text>
            </svg>`,
            caption: "수직선에서 오른쪽으로 갈수록 큰 수이며, 절댓값은 0에서 떨어진 거리입니다."
        },
        signRule: {
            svg: `<svg viewBox="0 0 680 250" role="img" aria-label="부호가 있는 수의 곱셈 규칙">
                <style>.box{fill:#161b22;stroke-width:3;rx:18}.same{stroke:#3fb950}.diff{stroke:#ff7b72}.t{fill:#f0f6fc;font:700 23px sans-serif;text-anchor:middle}.r{fill:#8b949e;font:18px sans-serif;text-anchor:middle}</style>
                <rect class="box same" x="60" y="45" width="250" height="145"/><rect class="box diff" x="370" y="45" width="250" height="145"/>
                <text class="t" x="185" y="85">같은 부호</text><text class="t" x="185" y="125">(+)(+) 또는 (-)(-)</text><text class="t" x="185" y="165" style="fill:#3fb950">결과는 +</text>
                <text class="t" x="495" y="85">다른 부호</text><text class="t" x="495" y="125">(+)(-) 또는 (-)(+)</text><text class="t" x="495" y="165" style="fill:#ff7b72">결과는 -</text>
                <text class="r" x="340" y="225">부호 결정 → 절댓값 계산</text>
            </svg>`,
            caption: "곱셈과 나눗셈은 먼저 부호를 정한 뒤 절댓값끼리 계산합니다."
        },
        tiles: {
            svg: `<svg viewBox="0 0 700 240" role="img" aria-label="대수 타일로 나타낸 동류항">
                <style>.x{fill:#1f6feb;stroke:#58a6ff;stroke-width:2}.one{fill:#d29922;stroke:#f2cc60;stroke-width:2}.t{fill:white;font:700 25px sans-serif;text-anchor:middle}.eq{fill:#f0f6fc;font:700 26px sans-serif;text-anchor:middle}</style>
                <rect class="x" x="45" y="55" width="115" height="55" rx="8"/><text class="t" x="102" y="91">x</text>
                <rect class="x" x="175" y="55" width="115" height="55" rx="8"/><text class="t" x="232" y="91">x</text>
                <rect class="x" x="305" y="55" width="115" height="55" rx="8"/><text class="t" x="362" y="91">x</text>
                <rect class="one" x="120" y="140" width="50" height="50" rx="8"/><text class="t" x="145" y="174">1</text>
                <rect class="one" x="185" y="140" width="50" height="50" rx="8"/><text class="t" x="210" y="174">1</text>
                <text class="eq" x="555" y="105">3x + 2</text><text class="eq" x="555" y="155">x끼리, 수끼리</text>
            </svg>`,
            caption: "모양이 같은 타일끼리만 합칠 수 있습니다. 이것이 동류항 계산의 원리입니다."
        },
        balance: {
            svg: `<svg viewBox="0 0 700 280" role="img" aria-label="일차방정식의 저울 원리">
                <style>.line{stroke:#8b949e;stroke-width:8;stroke-linecap:round}.pan{fill:#161b22;stroke:#58a6ff;stroke-width:3}.t{fill:#f0f6fc;font:700 24px sans-serif;text-anchor:middle}.sub{fill:#c9d1d9;font:18px sans-serif;text-anchor:middle}</style>
                <line class="line" x1="350" y1="55" x2="350" y2="205"/><line class="line" x1="165" y1="105" x2="535" y2="105"/>
                <line class="line" x1="165" y1="105" x2="115" y2="190"/><line class="line" x1="535" y1="105" x2="585" y2="190"/>
                <path class="pan" d="M55 190 Q115 245 175 190 Z"/><path class="pan" d="M525 190 Q585 245 645 190 Z"/>
                <text class="t" x="115" y="205">x + 3</text><text class="t" x="585" y="205">8</text>
                <text class="sub" x="350" y="265">양쪽에서 3을 똑같이 빼면 x = 5</text>
            </svg>`,
            caption: "등식의 양변에 같은 계산을 하면 균형이 유지됩니다."
        },
        coordinate: {
            svg: `<svg viewBox="0 0 640 360" role="img" aria-label="좌표평면과 점의 좌표">
                <defs><marker id="a2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#8b949e"/></marker></defs>
                <style>.axis{stroke:#8b949e;stroke-width:3}.grid{stroke:#30363d;stroke-width:1}.t{fill:#c9d1d9;font:16px sans-serif}.p{fill:#f778ba}.label{fill:#f0f6fc;font:700 21px sans-serif}</style>
                ${[80,140,200,260,320,380,440,500,560].map(x=>`<line class="grid" x1="${x}" y1="35" x2="${x}" y2="325"/>`).join('')}
                ${[60,120,180,240,300].map(y=>`<line class="grid" x1="45" y1="${y}" x2="600" y2="${y}"/>`).join('')}
                <line class="axis" x1="45" y1="180" x2="605" y2="180" marker-end="url(#a2)"/><line class="axis" x1="320" y1="325" x2="320" y2="30" marker-end="url(#a2)"/>
                <circle class="p" cx="500" cy="60" r="9"/><line x1="500" y1="60" x2="500" y2="180" stroke="#f778ba" stroke-dasharray="7"/><line x1="320" y1="60" x2="500" y2="60" stroke="#f778ba" stroke-dasharray="7"/>
                <text class="label" x="515" y="52">P(3, 2)</text><text class="t" x="610" y="173">x</text><text class="t" x="330" y="27">y</text>
            </svg>`,
            caption: "좌표는 항상 (x좌표, y좌표) 순서로 읽습니다. 먼저 가로, 다음 세로입니다."
        },
        graph: {
            svg: `<svg viewBox="0 0 660 360" role="img" aria-label="정비례와 반비례 그래프 비교">
                <style>.axis{stroke:#8b949e;stroke-width:2}.direct{stroke:#58a6ff;stroke-width:5}.inverse{stroke:#f778ba;stroke-width:5;fill:none}.t{fill:#f0f6fc;font:18px sans-serif}</style>
                <g transform="translate(10,0)"><line class="axis" x1="45" y1="180" x2="310" y2="180"/><line class="axis" x1="175" y1="320" x2="175" y2="35"/><line class="direct" x1="70" y1="285" x2="280" y2="75"/><text class="t" x="65" y="42">정비례 y=ax</text></g>
                <g transform="translate(335,0)"><line class="axis" x1="0" y1="180" x2="290" y2="180"/><line class="axis" x1="145" y1="320" x2="145" y2="35"/><path class="inverse" d="M160 50 C175 90 205 130 280 160 M10 200 C85 230 115 270 130 315"/><text class="t" x="10" y="42">반비례 y=a/x</text></g>
            </svg>`,
            caption: "정비례는 원점을 지나는 직선, 반비례는 두 갈래의 곡선으로 나타납니다."
        }
    };

    const q = (question, choices, answer, explanation) => ({ question, choices, answer, explanation });
    const chapter = (id, title, principle, explanation, steps, example, quizzes, svgDiagram, deepDive) => ({
        id, title, principle, explanation, steps, example, quizzes, svgDiagram, deepDive
    });

    MathData["middle-1"] = {
        title: "중학교 1학년",
        semesters: {
            "1": {
                title: "1학기",
                units: [
                    {
                        id: "m1-1-u1",
                        title: "1. 소인수분해",
                        chapters: [
                            chapter(
                                "m1-1-u1-c1", "소수와 합성수",
                                "자연수는 **더 이상 쪼개지지 않는 소수**를 재료로 만들어집니다. 소수는 약수가 1과 자기 자신뿐인 1보다 큰 자연수입니다.",
                                [
                                    "**소수**: 약수가 정확히 2개인 수 — $2,3,5,7,11,\\ldots$",
                                    "**합성수**: 약수가 3개 이상인 수 — $4,6,8,9,\\ldots$",
                                    "$1$은 약수가 하나뿐이므로 소수도 합성수도 아닙니다.",
                                    "$2$는 유일한 짝수 소수입니다. 2보다 큰 짝수는 모두 2를 약수로 가집니다."
                                ],
                                [
                                    { text: "2부터 $\\sqrt n$까지의 수로 나누어지는지 확인합니다.", formula: "n=a\\times b\\Rightarrow a\\le\\sqrt n\\text{ 또는 }b\\le\\sqrt n" },
                                    { text: "한 번도 나누어지지 않으면 소수입니다.", formula: "29\\div2,3,5\\text{ 모두 나누어떨어지지 않음}" }
                                ],
                                { problem: "$37$이 소수인지 판별하세요.", solution: ["$\\sqrt{37}$은 6보다 작으므로 2, 3, 5만 확인합니다.", "37은 2, 3, 5로 나누어떨어지지 않습니다.", "따라서 37은 소수입니다."] },
                                [
                                    q("다음 중 소수는?", ["1", "21", "29", "39"], 2, "29는 1과 29만 약수로 가집니다."),
                                    q("소수도 합성수도 아닌 자연수는?", ["0", "1", "2", "3"], 1, "1은 약수가 1 하나뿐입니다.")
                                ],
                                visual.factorTree
                            ),
                            chapter(
                                "m1-1-u1-c2", "소인수분해와 거듭제곱",
                                "합성수를 **소수의 곱으로 나타내는 것**이 소인수분해입니다. 곱해진 소수는 달라도 순서만 다를 뿐 결과는 하나로 정해집니다.",
                                [
                                    "**소인수**는 어떤 수의 인수이면서 소수인 수입니다.",
                                    "같은 소수가 반복되면 거듭제곱으로 간단히 씁니다: $2\\times2\\times2=2^3$",
                                    "$60=2^2\\times3\\times5$이며 60의 소인수는 2, 3, 5입니다.",
                                    "소인수분해는 약수의 개수, 최대공약수, 최소공배수를 찾는 공통 도구입니다."
                                ],
                                [
                                    { text: "가장 작은 소수부터 차례로 나눕니다.", formula: "180\\div2=90,\\quad90\\div2=45" },
                                    { text: "몫이 소수가 될 때까지 계속합니다.", formula: "45\\div3=15,\\quad15\\div3=5" },
                                    { text: "같은 소수를 거듭제곱으로 묶습니다.", formula: "180=2^2\\times3^2\\times5" }
                                ],
                                { problem: "$252$를 소인수분해하세요.", solution: ["$252=2\\times126=2^2\\times63$", "$63=3^2\\times7$", "따라서 $252=2^2\\times3^2\\times7$"] },
                                [
                                    q("$72$의 소인수분해는?", ["$2^3\\times3^2$", "$2^2\\times3^3$", "$8\\times9^2$", "$2\\times36$"], 0, "$72=8\\times9=2^3\\times3^2$입니다."),
                                    q("$2^3\\times5^2$의 값은?", ["100", "150", "200", "250"], 2, "$8\\times25=200$입니다.")
                                ],
                                visual.factorTree
                            ),
                            chapter(
                                "m1-1-u1-c3", "최대공약수와 최소공배수",
                                "두 수의 소인수분해를 나란히 놓으면 **공통 부분은 최대공약수**, 모든 부분을 빠짐없이 모으면 최소공배수가 됩니다.",
                                [
                                    "최대공약수: 공통 소인수의 지수 중 **작은 것**을 선택합니다.",
                                    "최소공배수: 모든 소인수의 지수 중 **큰 것**을 선택합니다.",
                                    "$12=2^2\\times3$, $18=2\\times3^2$",
                                    "$\\gcd(12,18)=2\\times3=6$, $\\operatorname{lcm}(12,18)=2^2\\times3^2=36$"
                                ],
                                [
                                    { text: "두 수를 각각 소인수분해합니다.", formula: "48=2^4\\times3,\\quad72=2^3\\times3^2" },
                                    { text: "작은 지수로 최대공약수를 구합니다.", formula: "2^3\\times3=24" },
                                    { text: "큰 지수로 최소공배수를 구합니다.", formula: "2^4\\times3^2=144" }
                                ],
                                { problem: "24분마다 오는 버스와 36분마다 오는 버스가 지금 함께 왔습니다. 다시 함께 오는 것은 몇 분 뒤인가요?", solution: ["$24=2^3\\times3$, $36=2^2\\times3^2$", "최소공배수는 $2^3\\times3^2=72$", "72분 뒤에 다시 함께 옵니다."] },
                                [
                                    q("18과 30의 최대공약수는?", ["3", "6", "9", "90"], 1, "$18=2\\times3^2$, $30=2\\times3\\times5$이므로 6입니다."),
                                    q("8과 12의 최소공배수는?", ["4", "20", "24", "96"], 2, "$8=2^3$, $12=2^2\\times3$이므로 $2^3\\times3=24$입니다.")
                                ],
                                visual.venn
                            )
                        ]
                    },
                    {
                        id: "m1-1-u2",
                        title: "2. 정수와 유리수",
                        chapters: [
                            chapter(
                                "m1-1-u2-c1", "양수와 음수, 절댓값",
                                "0을 기준으로 서로 반대 방향을 나타내기 위해 $+$와 $-$를 사용합니다. **절댓값은 방향을 버리고 0에서 떨어진 거리만 나타낸 값**입니다.",
                                [
                                    "0보다 큰 수는 양수, 0보다 작은 수는 음수입니다.",
                                    "수직선에서는 오른쪽에 있는 수가 항상 더 큽니다.",
                                    "$|-3|=3$, $|3|=3$: 부호는 다르지만 0에서 거리는 같습니다.",
                                    "음수끼리는 절댓값이 큰 수가 더 작습니다: $-7<-2$"
                                ],
                                [
                                    { text: "기준을 0으로 정합니다.", formula: "-3<0<4" },
                                    { text: "0에서의 거리를 세어 절댓값을 구합니다.", formula: "|-5|=5" },
                                    { text: "수직선의 위치로 대소를 비교합니다.", formula: "-5<-1<2" }
                                ],
                                { problem: "기온이 오전에는 $-4^\\circ C$, 오후에는 $3^\\circ C$였습니다. 어느 때가 몇 도 더 높나요?", solution: ["수직선에서 3은 -4보다 오른쪽에 있습니다.", "$3-(-4)=7$", "오후가 $7^\\circ C$ 더 높습니다."] },
                                [
                                    q("$-5,-1,0,3$ 중 가장 작은 수는?", ["-5", "-1", "0", "3"], 0, "수직선에서 가장 왼쪽에 있는 -5가 가장 작습니다."),
                                    q("$|-8|$의 값은?", ["-8", "0", "8", "16"], 2, "절댓값은 0에서의 거리이므로 8입니다.")
                                ],
                                visual.numberLine
                            ),
                            chapter(
                                "m1-1-u2-c2", "정수와 유리수의 덧셈·뺄셈",
                                "덧셈은 수직선에서 이동하는 것이고, 뺄셈은 **빼는 수의 부호를 바꾸어 더하는 것**으로 이해할 수 있습니다.",
                                [
                                    "같은 부호의 덧셈: 절댓값을 더하고 공통 부호를 붙입니다.",
                                    "다른 부호의 덧셈: 절댓값의 차를 구하고 큰 절댓값의 부호를 붙입니다.",
                                    "뺄셈 공식: $a-b=a+(-b)$",
                                    "$3-(-5)=3+5=8$: 음수를 빼는 것은 반대 방향을 다시 뒤집는 것입니다."
                                ],
                                [
                                    { text: "뺄셈을 덧셈으로 바꿉니다.", formula: "-2-5=-2+(-5)" },
                                    { text: "부호를 보고 같은 부호인지 확인합니다.", formula: "-2+(-5)=-(2+5)" },
                                    { text: "절댓값을 계산하고 부호를 붙입니다.", formula: "-7" }
                                ],
                                { problem: "잠수함이 해수면 아래 12m에서 7m 올라갔습니다. 현재 위치는?", solution: ["해수면 아래를 음수로 두면 처음 위치는 -12m입니다.", "$-12+7=-5$", "현재 해수면 아래 5m입니다."] },
                                [
                                    q("$-7+12$의 값은?", ["-19", "-5", "5", "19"], 2, "부호가 다르므로 $12-7=5$, 큰 절댓값 12의 부호 +를 붙입니다."),
                                    q("$4-(-6)$의 값은?", ["-10", "-2", "2", "10"], 3, "$4+6=10$입니다.")
                                ],
                                visual.numberLine
                            ),
                            chapter(
                                "m1-1-u2-c3", "정수와 유리수의 곱셈·나눗셈",
                                "곱셈과 나눗셈은 **부호 계산과 절댓값 계산을 분리**하면 간단합니다. 같은 부호는 양수, 다른 부호는 음수입니다.",
                                [
                                    "$(+)\\times(+)=+$, $(-)\\times(-)=+$",
                                    "$(+)\\times(-)=-$, $(-)\\times(+)=-$",
                                    "나눗셈도 같은 부호 규칙을 사용합니다.",
                                    "곱하는 음수의 개수가 짝수면 양수, 홀수면 음수입니다."
                                ],
                                [
                                    { text: "음수 인수의 개수를 세어 결과의 부호를 정합니다.", formula: "(-2)\\times3\\times(-4)\\Rightarrow +" },
                                    { text: "절댓값끼리 계산합니다.", formula: "2\\times3\\times4=24" },
                                    { text: "부호와 값을 합칩니다.", formula: "(-2)\\times3\\times(-4)=24" }
                                ],
                                { problem: "$(-\\frac34)\\div(\\frac12)$를 계산하세요.", solution: ["부호가 다르므로 결과는 음수입니다.", "나눗셈은 역수를 곱합니다: $\\frac34\\times2=\\frac32$", "따라서 $-\\frac32$입니다."] },
                                [
                                    q("$(-6)\\times(-4)$의 값은?", ["-24", "-10", "10", "24"], 3, "같은 부호의 곱은 양수이고 $6\\times4=24$입니다."),
                                    q("$(-18)\\div3$의 값은?", ["-6", "6", "-15", "15"], 0, "다른 부호의 나눗셈은 음수이므로 -6입니다.")
                                ],
                                visual.signRule
                            )
                        ]
                    },
                    {
                        id: "m1-1-u3",
                        title: "3. 문자와 식",
                        chapters: [
                            chapter(
                                "m1-1-u3-c1", "문자의 사용과 식의 값",
                                "문자는 아직 정해지지 않았거나 변할 수 있는 수를 담는 **수 상자**입니다. 문자를 사용하면 여러 상황을 하나의 식으로 표현할 수 있습니다.",
                                [
                                    "곱셈 기호는 생략합니다: $3\\times x=3x$, $a\\times b=ab$",
                                    "수는 문자 앞에 씁니다: $x\\times5=5x$",
                                    "나눗셈은 분수로 씁니다: $a\\div b=\\frac ab$",
                                    "식의 값은 문자에 수를 대입한 뒤 계산 순서에 따라 구합니다."
                                ],
                                [
                                    { text: "상황에서 변하는 양을 문자로 정합니다.", formula: "한 권이 x\\text{원}" },
                                    { text: "수량 관계를 식으로 나타냅니다.", formula: "3\\text{권의 값}=3x" },
                                    { text: "문자의 값이 주어지면 괄호를 사용해 대입합니다.", formula: "x=1200\\Rightarrow3x=3600" }
                                ],
                                { problem: "한 변의 길이가 $a$cm인 정사각형의 둘레와 넓이를 나타내세요.", solution: ["둘레는 네 변의 합이므로 $4a$cm입니다.", "넓이는 가로×세로이므로 $a\\times a=a^2$", "둘레 $4a$cm, 넓이 $a^2cm^2$"] },
                                [
                                    q("$a\\times a\\times3$을 간단히 하면?", ["$3a$", "$3a^2$", "$a^3$", "$6a$"], 1, "$a\\times a=a^2$이고 수 3을 앞에 씁니다."),
                                    q("$x=-2$일 때 $3x+5$의 값은?", ["-11", "-1", "1", "11"], 1, "$3(-2)+5=-6+5=-1$입니다.")
                                ],
                                visual.tiles
                            ),
                            chapter(
                                "m1-1-u3-c2", "일차식과 동류항",
                                "문자와 차수가 같은 항을 **동류항**이라고 합니다. 같은 종류의 물건끼리 개수를 합치듯 계수끼리만 계산합니다.",
                                [
                                    "$3x+2x=(3+2)x=5x$",
                                    "$3x$와 $3x^2$는 차수가 달라 동류항이 아닙니다.",
                                    "$2x+3-5x+1=-3x+4$",
                                    "괄호 앞이 음수면 괄호 안 모든 항의 부호가 바뀝니다."
                                ],
                                [
                                    { text: "괄호가 있으면 분배법칙으로 풉니다.", formula: "2(x+3)=2x+6" },
                                    { text: "문자항과 상수항을 각각 모읍니다.", formula: "2x-x+6-4" },
                                    { text: "계수끼리 계산합니다.", formula: "x+2" }
                                ],
                                { problem: "$3(2x-1)-2(x+4)$를 간단히 하세요.", solution: ["분배법칙: $6x-3-2x-8$", "동류항끼리 모으면 $(6x-2x)+(-3-8)$", "따라서 $4x-11$"] },
                                [
                                    q("$4x-7x$를 간단히 하면?", ["$-3$", "$-3x$", "$3x$", "$-11x$"], 1, "$(4-7)x=-3x$입니다."),
                                    q("$2(a+3)$과 같은 식은?", ["$2a+3$", "$2a+5$", "$2a+6$", "$a+6$"], 2, "분배법칙으로 $2a+6$입니다.")
                                ],
                                visual.tiles
                            ),
                            chapter(
                                "m1-1-u3-c3", "일차식의 계산",
                                "일차식의 덧셈과 뺄셈은 **괄호 풀기 → 동류항 모으기 → 계수 계산**의 일정한 순서로 해결합니다.",
                                [
                                    "덧셈: $(2x+3)+(x-5)=3x-2$",
                                    "뺄셈: $(2x+3)-(x-5)=2x+3-x+5=x+8$",
                                    "괄호 앞의 $-$는 괄호 안 모든 항에 $-1$을 곱하는 뜻입니다.",
                                    "계산 후 같은 문자가 다른 항에 남아 있지 않은지 확인합니다."
                                ],
                                [
                                    { text: "괄호 앞 부호를 각 항에 분배합니다.", formula: "(5x-2)-(3x+4)=5x-2-3x-4" },
                                    { text: "동류항끼리 위치를 모읍니다.", formula: "(5x-3x)+(-2-4)" },
                                    { text: "각 묶음을 계산합니다.", formula: "2x-6" }
                                ],
                                { problem: "철수는 $2x+500$원, 영희는 $x+1200$원을 가지고 있습니다. 두 사람의 돈의 합은?", solution: ["$(2x+500)+(x+1200)$", "문자항과 상수항을 각각 더합니다.", "$3x+1700$원"] },
                                [
                                    q("$(3x+2)+(2x-7)$을 간단히 하면?", ["$5x-5$", "$5x+9$", "$x-5$", "$x+9$"], 0, "$3x+2x=5x$, $2-7=-5$입니다."),
                                    q("$(4x-1)-(x+3)$을 간단히 하면?", ["$3x-4$", "$3x+2$", "$5x+2$", "$5x-4$"], 0, "$4x-1-x-3=3x-4$입니다.")
                                ],
                                visual.tiles
                            )
                        ]
                    },
                    {
                        id: "m1-1-u4",
                        title: "4. 일차방정식",
                        chapters: [
                            chapter(
                                "m1-1-u4-c1", "방정식과 등식의 성질",
                                "방정식은 미지수의 값에 따라 참 또는 거짓이 되는 등식입니다. 해를 구하는 과정은 **저울의 균형을 유지하며 미지수만 남기는 과정**입니다.",
                                [
                                    "등식의 양변에 같은 수를 더하거나 빼도 등식은 성립합니다.",
                                    "등식의 양변에 0이 아닌 같은 수를 곱하거나 나누어도 성립합니다.",
                                    "방정식을 참이 되게 하는 미지수의 값을 해라고 합니다.",
                                    "구한 해를 원래 식에 대입하면 검산할 수 있습니다."
                                ],
                                [
                                    { text: "상수항을 없애기 위해 양변에 같은 수를 계산합니다.", formula: "x+3=8\\Rightarrow x+3-3=8-3" },
                                    { text: "미지수만 남깁니다.", formula: "x=5" },
                                    { text: "원래 식에 대입해 확인합니다.", formula: "5+3=8\\;\\checkmark" }
                                ],
                                { problem: "$3x=18$의 해를 구하세요.", solution: ["양변을 3으로 나눕니다.", "$\\frac{3x}{3}=\\frac{18}{3}$", "$x=6$이며 $3\\times6=18$로 검산됩니다."] },
                                [
                                    q("$x-4=9$의 해는?", ["5", "9", "13", "-13"], 2, "양변에 4를 더하면 $x=13$입니다."),
                                    q("$-2x=10$의 해는?", ["-5", "5", "-8", "8"], 0, "양변을 -2로 나누면 $x=-5$입니다.")
                                ],
                                visual.balance
                            ),
                            chapter(
                                "m1-1-u4-c2", "일차방정식의 풀이",
                                "복잡한 방정식도 **괄호 제거 → 미지수항은 왼쪽 → 상수항은 오른쪽 → 계수로 나누기** 순서로 정리하면 됩니다.",
                                [
                                    "이항은 항을 반대편으로 옮길 때 부호가 바뀌는 것처럼 보입니다.",
                                    "실제로는 양변에 같은 항을 더하거나 빼는 등식의 성질입니다.",
                                    "분모가 있으면 양변에 최소공배수를 곱해 분모를 먼저 없앱니다.",
                                    "소수는 10, 100 등을 곱해 정수로 바꾸면 편리합니다."
                                ],
                                [
                                    { text: "괄호를 풀고 동류항을 정리합니다.", formula: "2(x+1)=8\\Rightarrow2x+2=8" },
                                    { text: "상수항을 오른쪽으로 이항합니다.", formula: "2x=8-2=6" },
                                    { text: "미지수의 계수로 양변을 나눕니다.", formula: "x=3" }
                                ],
                                { problem: "$3(x-2)+4=2x+7$을 푸세요.", solution: ["괄호를 풀면 $3x-6+4=2x+7$", "정리하면 $3x-2=2x+7$", "양변에서 $2x$를 빼고 2를 더하면 $x=9$"] },
                                [
                                    q("$5x-3=2x+9$의 해는?", ["2", "3", "4", "6"], 2, "$3x=12$이므로 $x=4$입니다."),
                                    q("$2(x+3)=14$의 해는?", ["4", "5", "7", "10"], 0, "$2x+6=14$, $2x=8$, $x=4$입니다.")
                                ],
                                visual.balance
                            ),
                            chapter(
                                "m1-1-u4-c3", "일차방정식의 활용",
                                "문장제는 답을 바로 계산하려 하지 말고, **구하려는 것을 $x$로 정한 뒤 서로 같은 두 양을 찾아 등식으로 연결**합니다.",
                                [
                                    "문제에서 무엇을 구하는지 확인하고 단위와 함께 $x$로 둡니다.",
                                    "나이, 거리·속력·시간, 가격, 도형 문제의 수량 관계를 식으로 번역합니다.",
                                    "거리 공식: $거리=속력\\times시간$",
                                    "해를 구한 뒤 문제의 조건과 단위에 맞는지 반드시 확인합니다."
                                ],
                                [
                                    { text: "구하려는 값을 문자로 둡니다.", formula: "어떤\\;수=x" },
                                    { text: "문장의 수량 관계로 방정식을 세웁니다.", formula: "3x+5=26" },
                                    { text: "방정식을 풀고 문장으로 답합니다.", formula: "3x=21\\Rightarrow x=7" }
                                ],
                                { problem: "연속한 두 자연수의 합이 35입니다. 두 수를 구하세요.", solution: ["작은 수를 $x$라 두면 큰 수는 $x+1$입니다.", "$x+(x+1)=35$", "$2x=34$이므로 $x=17$, 두 수는 17과 18입니다."] },
                                [
                                    q("어떤 수의 4배에서 3을 뺀 값이 17일 때 그 수는?", ["4", "5", "6", "7"], 1, "$4x-3=17$, $4x=20$, $x=5$입니다."),
                                    q("시속 60km로 $x$시간 간 거리가 150km일 때의 방정식은?", ["$60+x=150$", "$60x=150$", "$150x=60$", "$x/60=150$"], 1, "거리=속력×시간이므로 $60x=150$입니다.")
                                ],
                                visual.balance
                            )
                        ]
                    },
                    {
                        id: "m1-1-u5",
                        title: "5. 좌표평면과 그래프",
                        chapters: [
                            chapter(
                                "m1-1-u5-c1", "순서쌍과 좌표",
                                "좌표는 평면 위 위치를 숫자 두 개로 정확히 나타내는 주소입니다. 순서쌍 $(x,y)$는 **가로로 $x$만큼, 세로로 $y$만큼 이동**한다는 뜻입니다.",
                                [
                                    "가로축은 $x$축, 세로축은 $y$축이며 만나는 점은 원점 $O(0,0)$입니다.",
                                    "점 $P(a,b)$에서 $a$는 x좌표, $b$는 y좌표입니다.",
                                    "제1사분면 $(+,+)$, 제2사분면 $(-,+)$, 제3사분면 $(-,-)$, 제4사분면 $(+,-)$",
                                    "축 위의 점은 어느 사분면에도 속하지 않습니다."
                                ],
                                [
                                    { text: "원점에서 x축 방향으로 먼저 이동합니다.", formula: "x=3\\Rightarrow 오른쪽으로\\;3" },
                                    { text: "그 위치에서 y축 방향으로 이동합니다.", formula: "y=2\\Rightarrow 위로\\;2" },
                                    { text: "점을 찍고 좌표를 표시합니다.", formula: "P(3,2)" }
                                ],
                                { problem: "$A(-2,3)$은 어느 사분면에 있나요?", solution: ["x좌표가 음수이므로 원점의 왼쪽입니다.", "y좌표가 양수이므로 원점의 위쪽입니다.", "왼쪽 위인 제2사분면입니다."] },
                                [
                                    q("점 $(3,-4)$가 있는 사분면은?", ["제1사분면", "제2사분면", "제3사분면", "제4사분면"], 3, "x는 양수, y는 음수이므로 제4사분면입니다."),
                                    q("y축 위의 점이 반드시 만족하는 것은?", ["$x=0$", "$y=0$", "$x=y$", "$x>0$"], 0, "y축 위에서는 가로 이동이 없으므로 x좌표가 0입니다.")
                                ],
                                visual.coordinate
                            ),
                            chapter(
                                "m1-1-u5-c2", "그래프와 변화 관계",
                                "그래프는 두 양의 관계를 좌표평면에 나타낸 그림입니다. 표의 순서쌍을 점으로 옮기면 **수의 변화가 모양으로 보입니다**.",
                                [
                                    "독립적으로 정하는 값을 $x$, 그에 따라 변하는 값을 $y$로 둡니다.",
                                    "표의 각 행 $(x,y)$를 좌표평면의 점으로 나타냅니다.",
                                    "점들을 자연스럽게 연결하면 전체 변화 경향을 읽을 수 있습니다.",
                                    "그래프에서는 증가·감소, 가장 큰 값, 변화가 빠른 구간을 파악합니다."
                                ],
                                [
                                    { text: "두 양을 x와 y로 정해 표를 만듭니다.", formula: "(0,1),(1,3),(2,5)" },
                                    { text: "각 순서쌍을 좌표평면에 찍습니다.", formula: "x\\rightarrow가로,\\quad y\\rightarrow세로" },
                                    { text: "점의 배열에서 변화 규칙을 읽습니다.", formula: "x가\\;1\\;늘면\\;y는\\;2\\;증가" }
                                ],
                                { problem: "물이 1분마다 3L씩 일정하게 채워집니다. $x$분 뒤 물의 양 $y$L의 관계를 나타내세요.", solution: ["0분에는 0L이므로 원점을 지납니다.", "1분마다 3L이므로 $y=3x$", "$(0,0),(1,3),(2,6)$을 지나는 직선입니다."] },
                                [
                                    q("$x$가 1 증가할 때 $y$가 항상 2 증가하고 $(0,1)$을 지나는 관계식은?", ["$y=x+1$", "$y=2x+1$", "$y=2x$", "$y=x+2$"], 1, "변화량이 2이고 y절편이 1이므로 $y=2x+1$입니다."),
                                    q("그래프가 오른쪽으로 갈수록 내려간다면 일반적으로 y는?", ["증가한다", "감소한다", "항상 0이다", "변하지 않는다"], 1, "x가 증가할 때 y가 감소하는 관계입니다.")
                                ],
                                visual.coordinate
                            ),
                            chapter(
                                "m1-1-u5-c3", "정비례와 반비례",
                                "정비례는 한 양이 몇 배가 되면 다른 양도 같은 배가 되고, 반비례는 한 양이 몇 배가 되면 다른 양은 그 역수배가 되는 관계입니다.",
                                [
                                    "정비례: $y=ax$ ($a\\ne0$), 비 $\\frac yx=a$가 일정합니다.",
                                    "정비례 그래프는 원점을 지나는 직선입니다.",
                                    "반비례: $y=\\frac ax$ ($a\\ne0$), 곱 $xy=a$가 일정합니다.",
                                    "반비례 그래프는 원점을 지나지 않는 두 갈래 곡선입니다."
                                ],
                                [
                                    { text: "표에서 y/x 또는 xy가 일정한지 확인합니다.", formula: "\\frac yx=3\\Rightarrow정비례,\\quad xy=12\\Rightarrow반비례" },
                                    { text: "일정한 값을 a로 정해 관계식을 씁니다.", formula: "y=3x\\quad또는\\quad y=\\frac{12}{x}" },
                                    { text: "대표 좌표를 찍어 그래프를 그립니다.", formula: "y=3x:(0,0),(1,3),(2,6)" }
                                ],
                                { problem: "넓이가 $24cm^2$인 직사각형의 가로를 $x$cm, 세로를 $y$cm라 할 때 관계식과 관계를 말하세요.", solution: ["넓이=가로×세로이므로 $xy=24$", "$y=\\frac{24}{x}$", "곱이 일정하므로 반비례 관계입니다."] },
                                [
                                    q("다음 중 정비례 관계식은?", ["$y=3x$", "$y=x+3$", "$y=3/x$", "$xy=x$"], 0, "$y=ax$ 꼴인 $y=3x$가 정비례입니다."),
                                    q("$y=12/x$에서 $x=3$일 때 $y$는?", ["3", "4", "9", "36"], 1, "$y=12\\div3=4$입니다.")
                                ],
                                visual.graph,
                                {
                                    content: [
                                        "**그래프를 외우지 말고 값의 변화를 생각하세요.** 정비례는 x가 2배면 y도 2배, 반비례는 x가 2배면 y는 $\\frac12$배입니다.",
                                        "정비례의 $a$는 직선의 기울어진 정도와 방향을 결정합니다. $a>0$이면 오른쪽 위로, $a<0$이면 오른쪽 아래로 향합니다."
                                    ],
                                    examples: [
                                        { problem: "$y=-2x$에서 x가 1 증가할 때 y는 어떻게 변하나요?", solution: ["$a=-2$이므로 y는 2씩 감소합니다.", "그래프는 원점을 지나며 오른쪽 아래로 향합니다."] }
                                    ]
                                }
                            )
                        ]
                    }
                ]
            },
            "2": {
                title: "2학기",
                units: []
            }
        }
    };
})();

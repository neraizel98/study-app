// MathDataExtra_s2.js — 6학년 2학기 심화 콘텐츠
var MathDataExtra_s2 = {
  'e6-2-u1-c1': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg">
  <!-- 수직선 -->
  <line x1="20" y1="55" x2="280" y2="55" stroke="#e0e0e0" stroke-width="2"/>
  <!-- 양 끝 눈금 -->
  <line x1="20" y1="48" x2="20" y2="62" stroke="#e0e0e0" stroke-width="2"/>
  <line x1="280" y1="48" x2="280" y2="62" stroke="#e0e0e0" stroke-width="2"/>
  <!-- 1/4 눈금 -->
  <line x1="85" y1="48" x2="85" y2="62" stroke="#4facfe" stroke-width="2"/>
  <!-- 2/4 눈금 -->
  <line x1="150" y1="48" x2="150" y2="62" stroke="#4facfe" stroke-width="2"/>
  <!-- 3/4 눈금 (강조) -->
  <line x1="215" y1="44" x2="215" y2="66" stroke="#ff5252" stroke-width="3"/>
  <!-- 라벨 -->
  <text x="13" y="76" fill="#e0e0e0" font-size="12" font-family="Arial">0</text>
  <text x="78" y="76" fill="#4facfe" font-size="12" font-family="Arial">1/4</text>
  <text x="143" y="76" fill="#4facfe" font-size="12" font-family="Arial">2/4</text>
  <text x="208" y="76" fill="#ff5252" font-size="12" font-family="Arial" font-weight="bold">3/4</text>
  <text x="273" y="76" fill="#e0e0e0" font-size="12" font-family="Arial">1</text>
  <!-- 묶음 표시 -->
  <text x="55" y="40" fill="#ffd740" font-size="11" font-family="Arial">①</text>
  <text x="120" y="40" fill="#ffd740" font-size="11" font-family="Arial">②</text>
  <text x="185" y="40" fill="#ffd740" font-size="11" font-family="Arial">③</text>
  <!-- 수식 -->
  <text x="50" y="108" fill="#00c853" font-size="13" font-family="Arial" font-weight="bold">(3/4) ÷ (1/4) = 3  →  분자 3÷1=3</text>
</svg>`,
      caption: '수직선에서 3/4을 1/4씩 묶으면 3묶음 → (3/4)÷(1/4)=3'
    },
    commonMistakes: [
      {
        wrong: '(3/4) ÷ (1/4) = (3/4) × (4/1) = 3/1',
        right: '(3/4) ÷ (1/4) = 3 (분자끼리 나누기: 3÷1=3)',
        reason: '분모가 같은 경우 분자끼리 나누면 바로 답이 나옵니다. 역수 곱셈을 써도 되지만, 더 빠른 방법을 놓치지 마세요.'
      },
      {
        wrong: '(3/4) ÷ (1/4) = 3/1',
        right: '(3/4) ÷ (1/4) = 3',
        reason: '결과가 자연수인데 굳이 분수(3/1)로 표현할 필요가 없습니다. 3/1=3임을 항상 확인하세요.'
      }
    ],
    deepDive: {
      content: [
        '**직관적 이해(묶음 수 세기)**: 분모가 같은 분수의 나눗셈은 "몇 묶음인가?"로 바라볼 수 있습니다. $\\frac{3}{4} \\div \\frac{1}{4}$는 "3/4 안에 1/4이 몇 번 들어가는가?"이므로 분자 3÷1=3입니다.',
        '**공식 요약**: 분모가 같을 때 $\\frac{a}{n} \\div \\frac{b}{n} = a \\div b = \\frac{a}{b}$',
        '**중학 연계(분수 방정식)**: 분수의 나눗셈은 중학교 방정식 $\\frac{a}{n}x = \\frac{b}{n}$을 풀 때 직접 활용됩니다. 분모가 같으면 양변에 분모를 곱해 계수 비교로 단순화할 수 있습니다.'
      ],
      examples: [
        {
          problem: '$(5/7) \\div (2/7)$을 계산하세요.',
          solution: [
            '분모가 같으므로 분자끼리 나눕니다: $5 \\div 2 = \\frac{5}{2}$',
            '정답: $\\frac{5}{2}$ (또는 $2\\frac{1}{2}$)'
          ]
        }
      ]
    }
  },

  'e6-2-u1-c2': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg">
  <!-- 위 수직선 -->
  <line x1="20" y1="40" x2="280" y2="40" stroke="#e0e0e0" stroke-width="2"/>
  <line x1="20" y1="33" x2="20" y2="47" stroke="#e0e0e0" stroke-width="2"/>
  <line x1="280" y1="33" x2="280" y2="47" stroke="#e0e0e0" stroke-width="2"/>
  <line x1="107" y1="33" x2="107" y2="47" stroke="#00c853" stroke-width="2.5"/>
  <line x1="194" y1="33" x2="194" y2="47" stroke="#00c853" stroke-width="2.5"/>
  <text x="15" y="60" fill="#e0e0e0" font-size="11" font-family="Arial">0</text>
  <text x="100" y="60" fill="#00c853" font-size="11" font-family="Arial">1/3</text>
  <text x="188" y="60" fill="#00c853" font-size="11" font-family="Arial">2/3</text>
  <text x="275" y="60" fill="#e0e0e0" font-size="11" font-family="Arial">1</text>
  <!-- 역수 변환 화살표 -->
  <text x="80" y="90" fill="#4facfe" font-size="13" font-family="Arial" font-weight="bold">÷ 1/4 = × 4</text>
  <!-- 결과 -->
  <text x="80" y="120" fill="#ffd740" font-size="14" font-family="Arial" font-weight="bold">2/3 × 4 = 8/3</text>
</svg>`,
      caption: '2/3 ÷ 1/4 에서 제수 1/4의 역수(4)를 곱하면 8/3'
    },
    commonMistakes: [
      {
        wrong: '(2/3) ÷ (1/4) = (3/2) × (1/4) = 3/8',
        right: '(2/3) ÷ (1/4) = (2/3) × (4/1) = 8/3',
        reason: '역수를 곱하는 것은 **제수(나누는 수)**의 역수입니다. 피제수(나눠지는 수)를 역수로 바꾸면 안 됩니다.'
      },
      {
        wrong: '(5/6) ÷ (2/3) = (5/6) × (3/2) = 15/12',
        right: '(5/6) ÷ (2/3) = (5/6) × (3/2) = 15/12 = 5/4',
        reason: '계산 후 약분을 빠트리지 마세요. 15와 12의 최대공약수 3으로 약분하면 5/4입니다.'
      }
    ],
    deepDive: {
      content: [
        '**역수의 정의**: $\\frac{a}{b}$의 역수는 $\\frac{b}{a}$이며, 두 수의 곱이 1이 되는 수입니다. ($\\frac{a}{b} \\times \\frac{b}{a} = 1$)',
        '**공식 유도**: $\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c} = \\frac{ad}{bc}$. 나눗셈을 곱셈으로 바꾸고 제수를 역수로 바꿉니다.',
        '**중학 연계**: 분수 나눗셈 원리는 중학교 유리수 연산 및 방정식 풀이의 기초가 됩니다.'
      ],
      examples: [
        {
          problem: '$(5/6) \\div (2/3)$을 계산하세요.',
          solution: [
            '제수 $\\frac{2}{3}$의 역수는 $\\frac{3}{2}$입니다.',
            '$\\frac{5}{6} \\times \\frac{3}{2} = \\frac{15}{12}$',
            '약분: $\\frac{15}{12} = \\frac{5}{4}$ (최대공약수 3으로 약분)',
            '정답: $\\frac{5}{4}$ (또는 $1\\frac{1}{4}$)'
          ]
        }
      ]
    }
  },

  'e6-2-u1-c3': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 300 130" xmlns="http://www.w3.org/2000/svg">
  <!-- 직사각형 3개 (각각 4등분) -->
  <!-- 첫 번째 -->
  <rect x="10" y="20" width="80" height="40" fill="rgba(0,200,83,0.15)" stroke="#00c853" stroke-width="2"/>
  <line x1="30" y1="20" x2="30" y2="60" stroke="#00c853" stroke-width="1"/>
  <line x1="50" y1="20" x2="50" y2="60" stroke="#00c853" stroke-width="1"/>
  <line x1="70" y1="20" x2="70" y2="60" stroke="#00c853" stroke-width="1"/>
  <!-- 두 번째 -->
  <rect x="110" y="20" width="80" height="40" fill="rgba(79,172,254,0.15)" stroke="#4facfe" stroke-width="2"/>
  <line x1="130" y1="20" x2="130" y2="60" stroke="#4facfe" stroke-width="1"/>
  <line x1="150" y1="20" x2="150" y2="60" stroke="#4facfe" stroke-width="1"/>
  <line x1="170" y1="20" x2="170" y2="60" stroke="#4facfe" stroke-width="1"/>
  <!-- 세 번째 -->
  <rect x="210" y="20" width="80" height="40" fill="rgba(255,215,64,0.15)" stroke="#ffd740" stroke-width="2"/>
  <line x1="230" y1="20" x2="230" y2="60" stroke="#ffd740" stroke-width="1"/>
  <line x1="250" y1="20" x2="250" y2="60" stroke="#ffd740" stroke-width="1"/>
  <line x1="270" y1="20" x2="270" y2="60" stroke="#ffd740" stroke-width="1"/>
  <!-- 라벨 -->
  <text x="35" y="80" fill="#00c853" font-size="12" font-family="Arial">4칸</text>
  <text x="135" y="80" fill="#4facfe" font-size="12" font-family="Arial">4칸</text>
  <text x="235" y="80" fill="#ffd740" font-size="12" font-family="Arial">4칸</text>
  <!-- 총 개수 -->
  <text x="60" y="105" fill="#ff5252" font-size="14" font-family="Arial" font-weight="bold">3 ÷ (1/4) = 12조각</text>
  <text x="40" y="125" fill="#e0e0e0" font-size="11" font-family="Arial">3개 × 4등분 = 총 12조각</text>
</svg>`,
      caption: '3개의 직사각형을 각각 4등분하면 총 12조각 → 3÷(1/4)=12'
    },
    commonMistakes: [
      {
        wrong: '3 ÷ (1/4) = 3 × (1/4) = 3/4',
        right: '3 ÷ (1/4) = 3 × (4/1) = 12',
        reason: '자연수를 분수로 나눌 때는 제수(1/4)의 역수(4/1=4)를 곱해야 합니다. 제수를 그대로 곱하면 안 됩니다.'
      },
      {
        wrong: '3 ÷ (1/4) = 결과가 3보다 작아야 한다?',
        right: '3 ÷ (1/4) = 12 (3보다 크다)',
        reason: '1보다 작은 수로 나누면 결과가 원래 수보다 커집니다. "3 안에 1/4이 몇 번 들어가는가?" → 12번으로 이해하세요.'
      }
    ],
    deepDive: {
      content: [
        '**나눗셈의 의미**: $3 \\div \\frac{1}{4}$는 "3 안에 $\\frac{1}{4}$이 몇 번 들어가는가?"입니다. 1 안에 4번, 3 안에는 $3 \\times 4 = 12$번.',
        '**1보다 작은 수로 나누면 왜 커지나?**: $a \\div b$에서 $b < 1$이면 $\\frac{1}{b} > 1$이므로 결과($a \\times \\frac{1}{b}$)는 $a$보다 커집니다.',
        '**공식**: $n \\div \\frac{a}{b} = n \\times \\frac{b}{a} = \\frac{nb}{a}$'
      ],
      examples: [
        {
          problem: '$6 \\div \\frac{3}{4}$를 계산하세요.',
          solution: [
            '제수 $\\frac{3}{4}$의 역수는 $\\frac{4}{3}$입니다.',
            '$6 \\times \\frac{4}{3} = \\frac{24}{3} = 8$',
            '정답: $8$'
          ]
        }
      ]
    }
  },

  'e6-2-u2-c1': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg">
  <!-- 원래 식 -->
  <text x="20" y="50" fill="#e0e0e0" font-size="16" font-family="Arial" font-weight="bold">1.2 ÷ 0.4</text>
  <!-- 화살표 -->
  <line x1="140" y1="55" x2="175" y2="55" stroke="#ffd740" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="148" y="45" fill="#ffd740" font-size="11" font-family="Arial">×10</text>
  <!-- 변환 식 -->
  <text x="185" y="50" fill="#00c853" font-size="16" font-family="Arial" font-weight="bold">12 ÷ 4</text>
  <!-- 결과 -->
  <text x="110" y="90" fill="#4facfe" font-size="18" font-family="Arial" font-weight="bold">= 3</text>
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#ffd740"/>
    </marker>
  </defs>
</svg>`,
      caption: '1.2÷0.4: 양쪽에 ×10 → 12÷4=3 (소수점 이동은 두 수 모두에 동일하게)'
    },
    commonMistakes: [
      {
        wrong: '1.2 ÷ 0.4 → 12 ÷ 0.4 (한 쪽만 ×10)',
        right: '1.2 ÷ 0.4 → 12 ÷ 4 (양쪽 모두 ×10)',
        reason: '나눗셈에서 피제수와 제수에 같은 수를 곱해도 몫이 변하지 않습니다. 반드시 **양쪽 모두** 이동해야 합니다.'
      },
      {
        wrong: '2.16 ÷ 0.08 → 216 ÷ 8 (×100이 아니라 ×10만 적용)',
        right: '2.16 ÷ 0.08 → 216 ÷ 8 (소수 둘째 자리이므로 ×100)',
        reason: '소수점 이동 횟수는 제수의 소수점 자릿수에 맞춥니다. 0.08은 소수 둘째 자리이므로 ×100 해야 합니다.'
      }
    ],
    deepDive: {
      content: [
        '**소수점 이동 = 10의 거듭제곱 곱하기**: $1.2 \\div 0.4 = \\frac{1.2}{0.4} = \\frac{1.2 \\times 10}{0.4 \\times 10} = \\frac{12}{4} = 3$',
        '**이동 횟수 결정법**: 제수(나누는 수)의 소수점 아래 자릿수만큼 양쪽에 10을 곱합니다. 소수 첫째 자리 → ×10, 소수 둘째 자리 → ×100.',
        '**검산**: 몫 × 제수 = 피제수가 성립하는지 확인합니다. $3 \\times 0.4 = 1.2$ ✓'
      ],
      examples: [
        {
          problem: '$2.16 \\div 0.08$을 계산하세요.',
          solution: [
            '0.08은 소수 둘째 자리 → ×100',
            '$2.16 \\times 100 = 216$, $0.08 \\times 100 = 8$',
            '$216 \\div 8 = 27$',
            '정답: $27$'
          ]
        }
      ]
    }
  },

  'e6-2-u2-c2': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
  <!-- 제목 -->
  <text x="20" y="28" fill="#e0e0e0" font-size="13" font-family="Arial" font-weight="bold">12.6 ÷ 0.3</text>
  <!-- 세로셈 박스 -->
  <rect x="20" y="38" width="120" height="70" fill="rgba(79,172,254,0.07)" stroke="#4facfe" stroke-width="1.5"/>
  <text x="28" y="60" fill="#4facfe" font-size="13" font-family="Arial">12.6 ÷ 0.3</text>
  <text x="28" y="82" fill="#e0e0e0" font-size="11" font-family="Arial">→ ×10 양쪽</text>
  <text x="28" y="100" fill="#00c853" font-size="13" font-family="Arial">126 ÷ 3 = 42</text>
  <!-- 화살표 -->
  <text x="155" y="78" fill="#ffd740" font-size="22" font-family="Arial">→</text>
  <!-- 결과 -->
  <rect x="185" y="38" width="100" height="70" fill="rgba(0,200,83,0.07)" stroke="#00c853" stroke-width="1.5"/>
  <text x="195" y="62" fill="#00c853" font-size="13" font-family="Arial">126 ÷ 3</text>
  <text x="195" y="85" fill="#ffd740" font-size="16" font-family="Arial" font-weight="bold">= 42</text>
  <!-- 검산 -->
  <text x="20" y="130" fill="#e0e0e0" font-size="11" font-family="Arial">검산: 42 × 0.3 = 12.6 ✓</text>
</svg>`,
      caption: '12.6÷0.3: 양쪽 ×10 → 126÷3=42'
    },
    commonMistakes: [
      {
        wrong: '5.04 ÷ 0.12 → 504 ÷ 1.2 (×10만 적용, 자릿수 불일치)',
        right: '5.04 ÷ 0.12 → 504 ÷ 12 (×100 양쪽 모두)',
        reason: '제수 0.12는 소수 둘째 자리이므로 양쪽에 ×100을 해야 합니다. 자릿수가 다를 때는 더 긴 쪽(더 많은 자릿수)에 맞춥니다.'
      },
      {
        wrong: '12.6 ÷ 0.3 = 4.2 (소수점 위치 혼동)',
        right: '12.6 ÷ 0.3 = 42',
        reason: '변환 후 126÷3=42이며 소수점이 없는 자연수 나눗셈입니다. 원래 식의 소수점 자리를 결과에 다시 붙이는 실수를 하지 마세요.'
      }
    ],
    deepDive: {
      content: [
        '**분수 변환 검산법**: $5.04 \\div 0.12 = \\frac{504}{100} \\div \\frac{12}{100} = \\frac{504}{100} \\times \\frac{100}{12} = \\frac{504}{12} = 42$',
        '**나누어 떨어지지 않는 경우**: 나머지가 생기면 소수 부분을 이어서 계산하거나 반올림합니다. 예: $10 \\div 0.3 = 33.333...$',
        '**자릿수 기준**: 두 소수 중 소수점 아래 자릿수가 더 많은 쪽에 맞춰 10의 거듭제곱을 곱합니다.'
      ],
      examples: [
        {
          problem: '$5.04 \\div 0.12$를 계산하세요.',
          solution: [
            '0.12는 소수 둘째 자리 → 양쪽 ×100',
            '$5.04 \\times 100 = 504$, $0.12 \\times 100 = 12$',
            '$504 \\div 12 = 42$',
            '정답: $42$'
          ]
        }
      ]
    }
  },

  'e6-2-u2-c3': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 300 130" xmlns="http://www.w3.org/2000/svg">
  <!-- 수직선 -->
  <line x1="20" y1="60" x2="280" y2="60" stroke="#e0e0e0" stroke-width="2"/>
  <!-- 2.33 눈금 -->
  <line x1="100" y1="53" x2="100" y2="67" stroke="#4facfe" stroke-width="2"/>
  <text x="78" y="80" fill="#4facfe" font-size="11" font-family="Arial">2.33...</text>
  <!-- 2.335 기준점 -->
  <line x1="160" y1="50" x2="160" y2="70" stroke="#ffd740" stroke-width="3"/>
  <text x="143" y="44" fill="#ffd740" font-size="11" font-family="Arial">2.335</text>
  <text x="128" y="90" fill="#ffd740" font-size="10" font-family="Arial">(반올림 기준)</text>
  <!-- 2.34 눈금 -->
  <line x1="220" y1="53" x2="220" y2="67" stroke="#00c853" stroke-width="2"/>
  <text x="208" y="80" fill="#00c853" font-size="11" font-family="Arial">2.34</text>
  <!-- 반올림 화살표 -->
  <path d="M100,52 Q130,30 218,52" fill="none" stroke="#ff5252" stroke-width="1.5" marker-end="url(#rarrow)"/>
  <text x="120" y="22" fill="#ff5252" font-size="11" font-family="Arial">반올림 →</text>
  <defs>
    <marker id="rarrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#ff5252"/>
    </marker>
  </defs>
  <!-- 설명 -->
  <text x="20" y="115" fill="#e0e0e0" font-size="11" font-family="Arial">2.335 이상 → 2.34 / 미만 → 2.33</text>
</svg>`,
      caption: '수직선의 2.335 기준으로 2.33...은 2.34로 반올림되는 과정'
    },
    commonMistakes: [
      {
        wrong: '10÷3을 소수 둘째 자리에서 반올림 → 3.3 (자리 한 칸 밀림)',
        right: '10÷3≈3.333... → 소수 셋째 자리(3)에서 반올림 → 3.33',
        reason: '"소수 셋째 자리에서 반올림"은 소수 셋째 자리 숫자를 보고 올리거나 버려서 **소수 둘째 자리까지** 나타냅니다. 자리 혼동에 주의하세요.'
      },
      {
        wrong: '7÷3 = 2.3 (나누기를 충분히 진행 안 함)',
        right: '7÷3 = 2.333... → 소수 셋째 자리에서 반올림 → 2.33',
        reason: '반올림할 자리보다 한 자리 더 계산해야 반올림 판단이 가능합니다. 나누기를 충분히 진행하세요.'
      }
    ],
    deepDive: {
      content: [
        '**무한소수와 순환소수 예고**: $\\frac{1}{3} = 0.333...$(순환소수), $\\frac{1}{7} = 0.142857...$처럼 나누어 떨어지지 않는 소수를 무한소수라 합니다. 중학교에서 자세히 배웁니다.',
        '**실용적 반올림**: 공학에서는 유효숫자, 요리에서는 계량 단위에 맞게 반올림합니다. 상황에 따라 반올림 자릿수가 달라집니다.',
        '**반올림 규칙**: 반올림할 자리의 숫자가 5 이상이면 올리고, 4 이하이면 버립니다.'
      ],
      examples: [
        {
          problem: '$10 \\div 3$을 소수 셋째 자리에서 반올림하여 나타내세요.',
          solution: [
            '$10 \\div 3 = 3.3333...$',
            '소수 셋째 자리 숫자: 3 (4 이하 → 버림)',
            '정답: $3.33$'
          ]
        }
      ]
    }
  },

  'e6-2-u3-c1': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 300 170" xmlns="http://www.w3.org/2000/svg">
  <!-- 위에서 본 모양 (격자 2×3) -->
  <text x="20" y="22" fill="#e0e0e0" font-size="11" font-family="Arial">위에서 본 모양</text>
  <rect x="20" y="28" width="30" height="30" fill="rgba(0,200,83,0.2)" stroke="#00c853" stroke-width="1.5"/>
  <rect x="50" y="28" width="30" height="30" fill="rgba(0,200,83,0.2)" stroke="#00c853" stroke-width="1.5"/>
  <rect x="80" y="28" width="30" height="30" fill="rgba(0,200,83,0.2)" stroke="#00c853" stroke-width="1.5"/>
  <rect x="20" y="58" width="30" height="30" fill="rgba(0,200,83,0.2)" stroke="#00c853" stroke-width="1.5"/>
  <rect x="50" y="58" width="30" height="30" fill="rgba(0,200,83,0.2)" stroke="#00c853" stroke-width="1.5"/>
  <rect x="80" y="58" width="30" height="30" fill="rgba(0,200,83,0.2)" stroke="#00c853" stroke-width="1.5"/>
  <!-- 층수 표시 -->
  <text x="30" y="48" fill="#ffd740" font-size="11" font-family="Arial">2</text>
  <text x="60" y="48" fill="#ffd740" font-size="11" font-family="Arial">1</text>
  <text x="90" y="48" fill="#ffd740" font-size="11" font-family="Arial">2</text>
  <text x="30" y="78" fill="#ffd740" font-size="11" font-family="Arial">1</text>
  <text x="60" y="78" fill="#ffd740" font-size="11" font-family="Arial">2</text>
  <text x="90" y="78" fill="#ffd740" font-size="11" font-family="Arial">1</text>
  <!-- 옆에서 본 모양 -->
  <text x="160" y="22" fill="#e0e0e0" font-size="11" font-family="Arial">옆에서 본 모양</text>
  <rect x="160" y="58" width="30" height="30" fill="rgba(79,172,254,0.2)" stroke="#4facfe" stroke-width="1.5"/>
  <rect x="190" y="58" width="30" height="30" fill="rgba(79,172,254,0.2)" stroke="#4facfe" stroke-width="1.5"/>
  <rect x="220" y="58" width="30" height="30" fill="rgba(79,172,254,0.2)" stroke="#4facfe" stroke-width="1.5"/>
  <rect x="160" y="28" width="30" height="30" fill="rgba(79,172,254,0.2)" stroke="#4facfe" stroke-width="1.5"/>
  <rect x="220" y="28" width="30" height="30" fill="rgba(79,172,254,0.2)" stroke="#4facfe" stroke-width="1.5"/>
  <!-- 총 개수 -->
  <text x="20" y="115" fill="#ff5252" font-size="12" font-family="Arial" font-weight="bold">총 개수: 2+1+2+1+2+1 = 9개</text>
  <text x="20" y="133" fill="#e0e0e0" font-size="11" font-family="Arial">위 격자의 숫자 = 각 칸의 층수</text>
</svg>`,
      caption: '위에서 본 격자에 층수를 적어 쌓기나무 개수를 구합니다'
    },
    commonMistakes: [
      {
        wrong: '앞면만 보고 뒷줄 나무를 계산에서 빠트림',
        right: '위에서 본 평면도에 각 칸의 층수를 모두 적고 합산',
        reason: '입체를 앞에서만 보면 뒤에 숨겨진 나무가 보이지 않습니다. 위에서 본 모양의 격자에 층수를 기록하는 방법을 사용하세요.'
      },
      {
        wrong: '1층 개수 6 + 2층 개수를 잘못 합산 (중복 계산)',
        right: '각 칸의 층수를 독립적으로 합산: Σ(각 위치의 층수)',
        reason: '층별로 세면 겹쳐 세는 실수가 생깁니다. 위에서 본 평면도의 각 칸 숫자를 모두 더하는 방법이 가장 정확합니다.'
      }
    ],
    deepDive: {
      content: [
        '**세 방향 투영도로부터 최소/최대 개수 구하기**: 위·앞·옆 세 방향에서 본 모양이 주어지면, 각 열·행의 최대 높이를 맞추는 최솟값과 최댓값을 구할 수 있습니다.',
        '**최솟값**: 각 조건을 만족하는 가장 적은 나무 수. 최댓값: 세 투영도를 모두 만족하면서 가장 많이 쌓은 경우.',
        '**공학 연계**: 건축 도면의 평면도·입면도·측면도가 이와 같은 원리입니다.'
      ],
      examples: [
        {
          problem: '위에서 보면 2×2 격자, 앞에서 보면 모든 칸이 2층일 때, 최소 나무 개수는?',
          solution: [
            '앞에서 보면 2층 → 각 열에 최소 한 칸은 2층이어야 함',
            '2×2 격자 4칸 중 앞줄 2칸을 2층, 뒷줄 2칸을 1층으로 구성하면 최소',
            '2+2+1+1 = 6개',
            '정답: 최소 **6개**'
          ]
        }
      ]
    }
  },

  'e6-2-u3-c2': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
  <!-- 평면도 (위) -->
  <text x="10" y="18" fill="#ffd740" font-size="10" font-family="Arial">평면도(위)</text>
  <rect x="10" y="22" width="22" height="22" fill="rgba(255,215,64,0.2)" stroke="#ffd740" stroke-width="1.5"/>
  <rect x="32" y="22" width="22" height="22" fill="rgba(255,215,64,0.2)" stroke="#ffd740" stroke-width="1.5"/>
  <rect x="10" y="44" width="22" height="22" fill="rgba(255,215,64,0.2)" stroke="#ffd740" stroke-width="1.5"/>
  <!-- 정면도 (앞) -->
  <text x="90" y="18" fill="#00c853" font-size="10" font-family="Arial">정면도(앞)</text>
  <rect x="90" y="22" width="22" height="22" fill="rgba(0,200,83,0.2)" stroke="#00c853" stroke-width="1.5"/>
  <rect x="112" y="22" width="22" height="22" fill="rgba(0,200,83,0.2)" stroke="#00c853" stroke-width="1.5"/>
  <rect x="90" y="44" width="22" height="22" fill="rgba(0,200,83,0.2)" stroke="#00c853" stroke-width="1.5"/>
  <rect x="112" y="44" width="22" height="22" fill="rgba(0,200,83,0.2)" stroke="#00c853" stroke-width="1.5"/>
  <!-- 측면도 (옆) -->
  <text x="180" y="18" fill="#4facfe" font-size="10" font-family="Arial">측면도(옆)</text>
  <rect x="180" y="22" width="22" height="22" fill="rgba(79,172,254,0.2)" stroke="#4facfe" stroke-width="1.5"/>
  <rect x="180" y="44" width="22" height="22" fill="rgba(79,172,254,0.2)" stroke="#4facfe" stroke-width="1.5"/>
  <!-- 화살표 및 방향 라벨 -->
  <text x="10" y="90" fill="#e0e0e0" font-size="11" font-family="Arial">↑ 위  ↗ 앞  → 옆</text>
  <!-- 설명 -->
  <text x="10" y="110" fill="#e0e0e0" font-size="11" font-family="Arial">세 방향에서 보이는 최대 높이/너비</text>
  <text x="10" y="128" fill="#e0e0e0" font-size="11" font-family="Arial">를 투영하여 그립니다.</text>
  <text x="10" y="150" fill="#ff5252" font-size="11" font-family="Arial" font-weight="bold">겹치는 나무: 뒤쪽은 앞 투영도에 포함</text>
</svg>`,
      caption: '같은 쌓기나무를 위·앞·옆 세 방향에서 투영한 정투영도'
    },
    commonMistakes: [
      {
        wrong: '앞에서 본 모양을 옆에서 본 모양으로 그림 (방향 혼동)',
        right: '앞=정면(바라보는 방향), 옆=측면(왼쪽 또는 오른쪽)',
        reason: '방향을 헷갈리지 않도록 문제마다 보는 방향 화살표를 먼저 설정하고 시작하세요. 앞=정면도, 옆=측면도입니다.'
      },
      {
        wrong: '뒤에 나무가 있어도 앞 투영에서 보이는 칸만 그림',
        right: '투영 시 해당 방향에서 보이는 가장 큰 높이를 기준으로 그림',
        reason: '투영도는 그 방향에서 "보이는 모든 나무"의 윤곽선입니다. 뒤쪽 나무도 앞 나무에 가리지 않는다면 윤곽에 영향을 줍니다.'
      }
    ],
    deepDive: {
      content: [
        '**정투영도(Orthographic Projection)**: 건축·공학에서 사용하는 도면 방식으로, 평면도(위)·정면도(앞)·측면도(옆)로 3D 형태를 완전히 표현합니다.',
        '**3D→2D 연습법**: 쌓기나무 모형을 직접 쌓고, 각 방향에서 바라보며 격자에 그리는 연습이 공간 감각 향상에 효과적입니다.',
        '**역방향(2D→3D)**: 세 투영도가 주어지면 각 위치의 나무 높이를 역으로 추론할 수 있습니다.'
      ],
      examples: [
        {
          problem: '위에서 보면 ㄱ자 모양(3칸), 앞과 옆에서 모두 1칸×1칸으로 보일 때, 가능한 쌓기나무 구조를 설명하세요.',
          solution: [
            '위 평면도가 ㄱ자 → 3개의 칸이 ㄱ형으로 배치',
            '앞·옆 모두 1층으로만 보임 → 모든 칸이 정확히 1층',
            '정답: ㄱ자 배치의 1층짜리 쌓기나무 3개'
          ]
        }
      ]
    }
  },

  'e6-2-u4-c1': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 300 130" xmlns="http://www.w3.org/2000/svg">
  <!-- 원래 비 -->
  <text x="20" y="50" fill="#e0e0e0" font-size="20" font-family="Arial" font-weight="bold">12 : 18</text>
  <!-- 전항·후항 라벨 -->
  <text x="22" y="28" fill="#4facfe" font-size="11" font-family="Arial">전항</text>
  <text x="65" y="28" fill="#ff5252" font-size="11" font-family="Arial">후항</text>
  <!-- 화살표 -->
  <text x="120" y="55" fill="#ffd740" font-size="14" font-family="Arial">÷6 →</text>
  <!-- 간단한 비 -->
  <text x="185" y="50" fill="#00c853" font-size="20" font-family="Arial" font-weight="bold">2 : 3</text>
  <text x="188" y="28" fill="#4facfe" font-size="11" font-family="Arial">전항</text>
  <text x="218" y="28" fill="#ff5252" font-size="11" font-family="Arial">후항</text>
  <!-- 설명 -->
  <text x="20" y="85" fill="#e0e0e0" font-size="11" font-family="Arial">전항과 후항을 최대공약수(6)로 나눕니다.</text>
  <text x="20" y="105" fill="#ffd740" font-size="11" font-family="Arial">12:18 ≠ 12/18(분수)  →  비와 분수는 다릅니다!</text>
</svg>`,
      caption: '12:18을 최대공약수 6으로 나누어 가장 간단한 자연수 비 2:3으로 나타냄'
    },
    commonMistakes: [
      {
        wrong: '12:18 → 4:6 (÷3, 최대공약수 아님)',
        right: '12:18 → 2:3 (최대공약수 6으로 나누기)',
        reason: '최대공약수로 나누어야 **가장 간단한** 자연수 비가 됩니다. 임의의 공약수로 나누면 더 간단히 할 수 있는 비가 남을 수 있습니다.'
      },
      {
        wrong: '2:3 = 2/3 (비를 분수로 혼동)',
        right: '2:3은 두 양의 관계, 2/3은 하나의 수로 다릅니다',
        reason: '비(ratio)는 두 양의 상대적 크기를 나타내며, 분수와 표현이 비슷하지만 개념이 다릅니다. 예: 설탕2:소금3에서 설탕은 전체의 2/5입니다.'
      }
    ],
    deepDive: {
      content: [
        '**비의 성질**: 비의 전항과 후항에 0이 아닌 같은 수를 곱하거나 나누어도 비의 값은 같습니다. $a:b = (a \\times k):(b \\times k) = (a \\div k):(b \\div k)$',
        '**연비(a:b:c)**: 세 양의 비. 예: 15:25:35의 최대공약수는 5이므로 3:5:7.',
        '**활용**: 지도 축척(1:25000), 혼합비(시멘트:모래=1:3) 등에서 비가 활용됩니다.'
      ],
      examples: [
        {
          problem: '$15:25:35$를 가장 간단한 자연수 비로 나타내세요.',
          solution: [
            '15, 25, 35의 최대공약수: 5',
            '$15 \\div 5 : 25 \\div 5 : 35 \\div 5 = 3:5:7$',
            '정답: $3:5:7$'
          ]
        }
      ]
    }
  },

  'e6-2-u4-c2': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 300 130" xmlns="http://www.w3.org/2000/svg">
  <!-- 비례식 -->
  <text x="30" y="60" fill="#ff5252" font-size="22" font-weight="bold" font-family="Arial">2</text>
  <text x="60" y="60" fill="#e0e0e0" font-size="22" font-family="Arial"> : </text>
  <text x="88" y="60" fill="#4facfe" font-size="22" font-weight="bold" font-family="Arial">3</text>
  <text x="115" y="60" fill="#e0e0e0" font-size="22" font-family="Arial"> = </text>
  <text x="150" y="60" fill="#4facfe" font-size="22" font-weight="bold" font-family="Arial">4</text>
  <text x="178" y="60" fill="#e0e0e0" font-size="22" font-family="Arial"> : </text>
  <text x="206" y="60" fill="#ff5252" font-size="22" font-weight="bold" font-family="Arial">6</text>
  <!-- 외항 곱 -->
  <path d="M38,70 Q148,105 214,70" fill="none" stroke="#ff5252" stroke-width="1.5" stroke-dasharray="4"/>
  <text x="110" y="115" fill="#ff5252" font-size="12" font-family="Arial">외항 곱: 2×6=12</text>
  <!-- 내항 곱 -->
  <path d="M96,65 Q148,85 158,65" fill="none" stroke="#4facfe" stroke-width="1.5" stroke-dasharray="4"/>
  <text x="110" y="40" fill="#4facfe" font-size="12" font-family="Arial">내항 곱: 3×4=12</text>
</svg>`,
      caption: '비례식 2:3=4:6에서 외항(2,6)의 곱과 내항(3,4)의 곱은 같다'
    },
    commonMistakes: [
      {
        wrong: 'a:b=c:d에서 외항=b,c / 내항=a,d (위치 혼동)',
        right: '외항=a,d (양 끝) / 내항=b,c (안쪽)',
        reason: '외항(outer terms)은 비례식의 바깥쪽 두 수(첫째·넷째), 내항(inner terms)은 안쪽 두 수(둘째·셋째)입니다.'
      },
      {
        wrong: '5:□=15:9 → □=5×9÷15=3 (내항을 외항으로 혼동)',
        right: '5:□=15:9 → 외항의 곱=내항의 곱 → 5×9=□×15 → □=3',
        reason: '□의 위치를 먼저 파악하세요. 내항에 있으면 (외항의 곱)÷(나머지 내항), 외항에 있으면 (내항의 곱)÷(나머지 외항)입니다.'
      }
    ],
    deepDive: {
      content: [
        '**비례식의 성질**: $a:b = c:d$이면 $a \\times d = b \\times c$ (외항의 곱 = 내항의 곱)',
        '**□ 구하기**: $5:□ = 15:9$에서 $5 \\times 9 = □ \\times 15$, $□ = 45 \\div 15 = 3$',
        '**활용**: 지도 축척(실제 거리 계산), 닮음비(도형의 변의 길이 계산), 환율 계산에 비례식을 활용합니다.'
      ],
      examples: [
        {
          problem: '$5:□=15:9$에서 □의 값을 구하세요.',
          solution: [
            '외항의 곱 = 내항의 곱: $5 \\times 9 = □ \\times 15$',
            '$45 = □ \\times 15$',
            '$□ = 45 \\div 15 = 3$',
            '정답: $□ = 3$'
          ]
        }
      ]
    }
  },

  'e6-2-u4-c3': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg">
  <!-- 전체 띠 -->
  <rect x="20" y="30" width="260" height="40" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>
  <!-- 2칸 (12개, 파랑) -->
  <rect x="20" y="30" width="86" height="40" fill="rgba(79,172,254,0.3)" stroke="#4facfe" stroke-width="1.5"/>
  <text x="45" y="56" fill="#4facfe" font-size="13" font-family="Arial" font-weight="bold">12개</text>
  <!-- 4칸 (24개, 초록) -->
  <rect x="106" y="30" width="174" height="40" fill="rgba(0,200,83,0.3)" stroke="#00c853" stroke-width="1.5"/>
  <text x="168" y="56" fill="#00c853" font-size="13" font-family="Arial" font-weight="bold">24개</text>
  <!-- 라벨 -->
  <text x="45" y="22" fill="#4facfe" font-size="11" font-family="Arial">2칸</text>
  <text x="175" y="22" fill="#00c853" font-size="11" font-family="Arial">4칸</text>
  <!-- 총 -->
  <text x="20" y="90" fill="#ffd740" font-size="12" font-family="Arial">전체: 36개 = (2+4)칸 = 6칸</text>
  <text x="20" y="108" fill="#e0e0e0" font-size="11" font-family="Arial">1칸 = 36÷6 = 6개  →  2칸=12, 4칸=24</text>
</svg>`,
      caption: '36개를 2:4로 비례배분: 전체 6칸 중 2칸(12개)과 4칸(24개)'
    },
    commonMistakes: [
      {
        wrong: '36을 2:4로 나눌 때 → 36×(2/4)=18, 36×(4/4)=36 (분모에 비의 합 미사용)',
        right: '분모는 비의 합(2+4=6): 36×(2/6)=12, 36×(4/6)=24',
        reason: '비례배분에서 분수의 분모는 비의 합입니다. 2:4에서 한 부분의 분율은 2/(2+4)=1/3, 4/(2+4)=2/3입니다.'
      },
      {
        wrong: '12+24=36이 아닌 경우 (계산 오류)',
        right: '두 부분의 합이 반드시 전체(36)와 같아야 함',
        reason: '비례배분 후 항상 두 부분의 합 = 전체임을 검산하세요. 다르다면 계산에 오류가 있습니다.'
      }
    ],
    deepDive: {
      content: [
        '**공식 유도**: 전체 $N$을 $a:b$로 나누면 → $N \\times \\frac{a}{a+b}$와 $N \\times \\frac{b}{a+b}$',
        '**3부분 비례배분(a:b:c)**: 전체 $N$을 $a:b:c$로 나누면 → $N \\times \\frac{a}{a+b+c}$, $N \\times \\frac{b}{a+b+c}$, $N \\times \\frac{c}{a+b+c}$',
        '**활용**: 이익 분배, 재료 배합, 인원 배정 등에 비례배분이 활용됩니다.'
      ],
      examples: [
        {
          problem: '사탕 60개를 형, 동생, 친구에게 3:2:1로 나누면 각각 몇 개씩 받나요?',
          solution: [
            '비의 합: $3+2+1=6$',
            '형: $60 \\times \\frac{3}{6} = 30$개',
            '동생: $60 \\times \\frac{2}{6} = 20$개',
            '친구: $60 \\times \\frac{1}{6} = 10$개',
            '검산: $30+20+10=60$ ✓'
          ]
        }
      ]
    }
  },

  'e6-2-u5-c1': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  <!-- 원 -->
  <circle cx="130" cy="100" r="70" fill="none" stroke="#4facfe" stroke-width="2.5"/>
  <!-- 지름 -->
  <line x1="60" y1="100" x2="200" y2="100" stroke="#00c853" stroke-width="2" stroke-dasharray="6,3"/>
  <text x="115" y="92" fill="#00c853" font-size="13" font-family="Arial" font-weight="bold">지름(d)</text>
  <!-- 반지름 -->
  <line x1="130" y1="100" x2="200" y2="100" stroke="#ffd740" stroke-width="2.5"/>
  <text x="157" y="118" fill="#ffd740" font-size="12" font-family="Arial">반지름(r)</text>
  <!-- 원주율 -->
  <text x="30" y="170" fill="#ff5252" font-size="13" font-family="Arial" font-weight="bold">원주 = 지름 × π (π≈3.14)</text>
  <!-- 원주 곡선 화살표 -->
  <path d="M200,100 A70,70 0 1,0 200,101" fill="none" stroke="#ff5252" stroke-width="1.5" stroke-dasharray="3,3"/>
</svg>`,
      caption: '원의 지름·반지름·원주 관계: 원주 = 지름 × π'
    },
    commonMistakes: [
      {
        wrong: '반지름=5cm → 원주=5×3.14=15.7cm (지름 대신 반지름 사용)',
        right: '지름=10cm → 원주=10×3.14=31.4cm',
        reason: '원주 공식은 **지름**×π입니다. 반지름이 주어지면 반드시 2를 곱해 지름을 먼저 구하세요.'
      },
      {
        wrong: '원주율을 문제에 따라 3 또는 3.14 혼용하여 다른 답이 나옴',
        right: '문제에서 지정한 원주율 값을 일관되게 사용',
        reason: '문제에서 "원주율 3.14"라고 하면 3.14, "원주율 3"이라고 하면 3을 사용해야 합니다. 혼용하면 답이 달라집니다.'
      }
    ],
    deepDive: {
      content: [
        '**π의 역사**: 고대 이집트인들도 원주율을 사용했으며, 아르키메데스(기원전 3세기)는 다각형으로 원을 근사하여 $3\\frac{10}{71} < \\pi < 3\\frac{1}{7}$임을 증명했습니다.',
        '**원주 공식 유도**: 원을 매우 잘게 자른 부채꼴을 이어 붙이면 직사각형에 가까워지고, 가로는 원주의 절반, 세로는 반지름이 됩니다. $C = 2\\pi r = \\pi d$',
        '**원주율의 정의**: $\\pi = \\frac{원주}{지름}$이며 모든 원에서 일정한 값입니다.'
      ],
      examples: [
        {
          problem: '바퀴의 반지름이 35cm일 때, 한 바퀴 굴렸을 때 이동 거리는? (원주율 3.14)',
          solution: [
            '지름: $35 \\times 2 = 70$ cm',
            '원주: $70 \\times 3.14 = 219.8$ cm',
            '정답: $219.8$ cm'
          ]
        }
      ]
    }
  },

  'e6-2-u5-c2': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
  <!-- 원 (왼쪽) -->
  <circle cx="65" cy="90" r="50" fill="rgba(0,200,83,0.15)" stroke="#00c853" stroke-width="2"/>
  <text x="50" y="155" fill="#e0e0e0" font-size="11" font-family="Arial">원 (r=50)</text>
  <!-- 화살표 -->
  <text x="122" y="95" fill="#ffd740" font-size="24" font-family="Arial">→</text>
  <!-- 직사각형 (오른쪽) -->
  <rect x="158" y="55" width="120" height="65" fill="rgba(79,172,254,0.15)" stroke="#4facfe" stroke-width="2"/>
  <!-- 가로 라벨 -->
  <text x="175" y="145" fill="#4facfe" font-size="11" font-family="Arial">가로 = 원주/2</text>
  <!-- 세로 라벨 -->
  <text x="162" y="75" fill="#00c853" font-size="11" font-family="Arial">세로=r</text>
  <!-- 넓이 공식 -->
  <text x="155" y="170" fill="#ff5252" font-size="12" font-family="Arial" font-weight="bold">넓이 = r × r × π</text>
</svg>`,
      caption: '원을 부채꼴로 잘라 직사각형으로 재배열: 가로=원주/2=πr, 세로=r → 넓이=πr²'
    },
    commonMistakes: [
      {
        wrong: '원의 넓이 = 지름×π (원주 공식을 넓이에 적용)',
        right: '원의 넓이 = 반지름×반지름×π = $r^2 \\times \\pi$',
        reason: '원주(둘레) 공식은 $2\\pi r$, 넓이 공식은 $\\pi r^2$입니다. 두 공식을 혼동하지 마세요.'
      },
      {
        wrong: '지름=10cm → 넓이=10×10×3.14=314cm² (지름을 반지름으로 착각)',
        right: '반지름=5cm → 넓이=5×5×3.14=78.5cm²',
        reason: '넓이 공식의 r은 반지름입니다. 지름이 주어지면 2로 나눠 반지름을 먼저 구하세요.'
      }
    ],
    deepDive: {
      content: [
        '**시각적 유도**: 원을 수많은 부채꼴로 나눠 이어 붙이면 직사각형에 가까워집니다. 가로 ≈ 원주/2 = $\\pi r$, 세로 = $r$ → 넓이 ≈ $\\pi r \\times r = \\pi r^2$',
        '**반원·사분원 넓이**: 반원의 넓이 = $\\frac{\\pi r^2}{2}$, 사분원 = $\\frac{\\pi r^2}{4}$',
        '**역산**: 넓이가 주어지면 $r = \\sqrt{\\frac{넓이}{\\pi}}$로 반지름을 구합니다.'
      ],
      examples: [
        {
          problem: '넓이가 $78.5\\text{cm}^2$인 원의 반지름은? ($\\pi=3.14$)',
          solution: [
            '$r^2 \\times 3.14 = 78.5$',
            '$r^2 = 78.5 \\div 3.14 = 25$',
            '$r = 5$ cm',
            '정답: $5$ cm'
          ]
        }
      ]
    }
  },

  'e6-2-u6-c1': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
  <!-- 원기둥 -->
  <ellipse cx="70" cy="55" rx="45" ry="12" fill="rgba(0,200,83,0.15)" stroke="#00c853" stroke-width="2"/>
  <ellipse cx="70" cy="140" rx="45" ry="12" fill="rgba(0,200,83,0.1)" stroke="#00c853" stroke-width="2"/>
  <line x1="25" y1="55" x2="25" y2="140" stroke="#00c853" stroke-width="2"/>
  <line x1="115" y1="55" x2="115" y2="140" stroke="#00c853" stroke-width="2"/>
  <text x="20" y="170" fill="#00c853" font-size="11" font-family="Arial">원기둥</text>
  <line x1="115" y1="95" x2="130" y2="95" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="3"/>
  <text x="132" y="99" fill="#e0e0e0" font-size="10" font-family="Arial">높이 h</text>
  <!-- 원뿔 -->
  <line x1="200" y1="20" x2="155" y2="145" stroke="#4facfe" stroke-width="2"/>
  <line x1="200" y1="20" x2="245" y2="145" stroke="#4facfe" stroke-width="2"/>
  <ellipse cx="200" cy="145" rx="45" ry="12" fill="rgba(79,172,254,0.1)" stroke="#4facfe" stroke-width="2"/>
  <text x="185" y="170" fill="#4facfe" font-size="11" font-family="Arial">원뿔</text>
  <line x1="200" y1="20" x2="200" y2="145" stroke="#ffd740" stroke-width="1.5" stroke-dasharray="4"/>
  <text x="204" y="90" fill="#ffd740" font-size="10" font-family="Arial">높이</text>
</svg>`,
      caption: '원기둥(좌)과 원뿔(우): 밑면·옆면·높이의 구조 비교'
    },
    commonMistakes: [
      {
        wrong: '원뿔 부피 = πr²h (원기둥 공식 그대로 적용)',
        right: '원뿔 부피 = (1/3)×πr²h',
        reason: '원뿔의 부피는 같은 밑면·높이를 갖는 원기둥 부피의 1/3입니다. 실험(물 붓기)으로 확인할 수 있습니다.'
      },
      {
        wrong: '원뿔의 모선(빗면 길이)을 높이로 착각하여 대입',
        right: '높이 = 꼭짓점에서 밑면까지의 수직 거리',
        reason: '모선(slant height)은 꼭짓점에서 밑면 원의 둘레까지의 거리로, 항상 높이보다 깁니다. 공식에는 수직 높이를 사용해야 합니다.'
      }
    ],
    deepDive: {
      content: [
        '**원기둥 부피**: $V = \\pi r^2 h$ (밑넓이 × 높이)',
        '**원뿔 부피**: $V = \\frac{1}{3} \\pi r^2 h$ (원기둥의 1/3). 물 붓기 실험으로 확인 가능합니다.',
        '**원기둥 겉넓이**: 두 밑면($2\\pi r^2$) + 옆면($2\\pi r h$) = $2\\pi r(r+h)$'
      ],
      examples: [
        {
          problem: '밑면 반지름 3cm, 높이 7cm인 원기둥의 부피는? ($\\pi=3$)',
          solution: [
            '$V = \\pi r^2 h = 3 \\times 3^2 \\times 7$',
            '$= 3 \\times 9 \\times 7 = 189$ cm³',
            '정답: $189$ cm³'
          ]
        }
      ]
    }
  },

  'e6-2-u6-c2': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  <!-- 구 외곽 -->
  <circle cx="130" cy="100" r="75" fill="rgba(255,152,0,0.08)" stroke="#ffd740" stroke-width="2.5"/>
  <!-- 적도 타원 -->
  <ellipse cx="130" cy="100" rx="75" ry="18" fill="none" stroke="#ffd740" stroke-width="1.5" stroke-dasharray="5,4"/>
  <!-- 반지름 -->
  <line x1="130" y1="100" x2="205" y2="100" stroke="#00c853" stroke-width="2.5"/>
  <text x="155" y="92" fill="#00c853" font-size="13" font-family="Arial" font-weight="bold">r</text>
  <!-- 중심점 -->
  <circle cx="130" cy="100" r="4" fill="#ff5252"/>
  <!-- 공식 -->
  <text x="20" y="185" fill="#ffd740" font-size="11" font-family="Arial">부피: (4/3)πr³  |  겉넓이: 4πr²</text>
</svg>`,
      caption: '구의 단면도: 반지름 r, 부피=(4/3)πr³, 겉넓이=4πr²'
    },
    commonMistakes: [
      {
        wrong: '구 부피 = πr²h (원기둥 공식 적용)',
        right: '구 부피 = (4/3)πr³',
        reason: '구·원기둥·원뿔 공식을 혼동하기 쉽습니다. 구는 $\\frac{4}{3}\\pi r^3$, 원기둥은 $\\pi r^2 h$, 원뿔은 $\\frac{1}{3}\\pi r^2 h$입니다.'
      },
      {
        wrong: '구에도 꼭짓점이나 모서리가 있다고 생각',
        right: '구는 곡면 1개로만 이루어지며 꼭짓점·모서리가 없습니다',
        reason: '구는 완전한 곡면 입체로, 꼭짓점이나 직선 모서리가 없습니다. 원기둥·원뿔과 구별하세요.'
      }
    ],
    deepDive: {
      content: [
        '**구 부피 유도 개념(카발리에리 원리)**: 같은 높이에서 단면 넓이가 같으면 부피가 같습니다. 반지름 $r$인 구의 부피 = $\\frac{4}{3}\\pi r^3$',
        '**구·원기둥·원뿔 부피 비율**: 반지름과 높이가 같을 때($h=2r$), 구:원기둥:원뿔 = $\\frac{4}{3}\\pi r^3 : 2\\pi r^3 : \\frac{2}{3}\\pi r^3 = 2:3:1$',
        '**실생활 연계**: 농구공·지구·행성 등 구형 물체의 부피 계산에 활용됩니다.'
      ],
      examples: [
        {
          problem: '반지름 6cm인 구와 같은 밑면 반지름·높이($h=12$cm)를 갖는 원기둥의 부피 비는?',
          solution: [
            '구 부피: $\\frac{4}{3}\\pi \\times 6^3 = \\frac{4}{3} \\times 216\\pi = 288\\pi$ cm³',
            '원기둥 부피: $\\pi \\times 6^2 \\times 12 = 432\\pi$ cm³',
            '비: $288\\pi : 432\\pi = 288:432 = 2:3$',
            '정답: 구:원기둥 = $2:3$'
          ]
        }
      ]
    }
  }
};

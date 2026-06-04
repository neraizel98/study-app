// MathDataExtra_s1.js — 6학년 1학기 심화 콘텐츠
var MathDataExtra_s1 = {
  'e6-1-u1-c1': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 120" xmlns="http://www.w3.org/2000/svg">
  <!-- 수직선 -->
  <line x1="20" y1="60" x2="260" y2="60" stroke="#e0e0e0" stroke-width="2"/>
  <line x1="20" y1="50" x2="20" y2="70" stroke="#e0e0e0" stroke-width="2"/>
  <line x1="260" y1="50" x2="260" y2="70" stroke="#e0e0e0" stroke-width="2"/>
  <!-- 5등분 눈금 -->
  <line x1="68" y1="53" x2="68" y2="67" stroke="#e0e0e0" stroke-width="1.5"/>
  <line x1="116" y1="53" x2="116" y2="67" stroke="#e0e0e0" stroke-width="1.5"/>
  <line x1="164" y1="53" x2="164" y2="67" stroke="#e0e0e0" stroke-width="1.5"/>
  <line x1="212" y1="53" x2="212" y2="67" stroke="#e0e0e0" stroke-width="1.5"/>
  <!-- 3/5 강조점 -->
  <circle cx="164" cy="60" r="7" fill="#00c853"/>
  <!-- 라벨 -->
  <text x="14" y="85" fill="#e0e0e0" font-size="12" font-family="Arial">0</text>
  <text x="254" y="85" fill="#e0e0e0" font-size="12" font-family="Arial">1</text>
  <text x="155" y="85" fill="#00c853" font-size="12" font-family="Arial">3/5</text>
  <!-- 상단 수식 -->
  <text x="75" y="30" fill="#ffd740" font-size="14" font-family="Arial" font-weight="bold">3 ÷ 5 = 3/5</text>
  <!-- 화살표 -->
  <line x1="140" y1="32" x2="164" y2="50" stroke="#ffd740" stroke-width="1.5" marker-end="url(#arr)"/>
  <defs>
    <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#ffd740"/>
    </marker>
  </defs>
</svg>`,
      caption: '수직선에서 3÷5=3/5: 0~1을 5등분한 3번째 위치'
    },
    commonMistakes: [
      {
        wrong: '3÷5=5/3',
        right: '3÷5=3/5',
        reason: '나누는 수(5)가 분모, 나뉘는 수(3)가 분자입니다. 뒤바꾸면 안 됩니다.'
      },
      {
        wrong: '4÷6=4/6 (그대로)',
        right: '4÷6=2/3',
        reason: '결과가 분수로 나오면 반드시 기약분수로 약분해야 합니다.'
      }
    ],
    deepDive: {
      content: [
        '**항등식 유도**: $a \\div b = \\frac{a}{b}$는 "a를 b개로 똑같이 나눈 한 몫"이 $\\frac{1}{b}$짜리 a개라는 뜻입니다.',
        '**역수 예고**: $\\frac{a}{b} \\times b = a$이므로 나눗셈을 역수의 곱셈으로 바꾸는 원리와 연결됩니다.',
        '**연결**: 분수는 나눗셈의 또 다른 표현이며, 이후 분수 나눗셈·비율 단원의 기초가 됩니다.'
      ],
      examples: [
        {
          problem: '피자 7판을 12명에게 똑같이 나누면 한 명이 받는 양은?',
          solution: [
            '$7 \\div 12 = \\frac{7}{12}$ (판)',
            '정답: 한 명이 $\\frac{7}{12}$판씩 받습니다.'
          ]
        }
      ]
    }
  },

  'e6-1-u1-c2': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg">
  <!-- 전체 직사각형(분모=3, 3칸) -->
  <rect x="20" y="40" width="60" height="80" fill="rgba(79,172,254,0.15)" stroke="#4facfe" stroke-width="2"/>
  <rect x="80" y="40" width="60" height="80" fill="rgba(79,172,254,0.15)" stroke="#4facfe" stroke-width="2"/>
  <rect x="140" y="40" width="60" height="80" fill="rgba(79,172,254,0.15)" stroke="#4facfe" stroke-width="2"/>
  <!-- ÷4: 각 칸을 4개로 세분 -->
  <line x1="20" y1="60" x2="80" y2="60" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="3,2"/>
  <line x1="20" y1="80" x2="80" y2="80" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="3,2"/>
  <line x1="20" y1="100" x2="80" y2="100" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="3,2"/>
  <!-- 강조 칸 1개 = 1/12 -->
  <rect x="20" y="40" width="60" height="20" fill="rgba(0,200,83,0.5)" stroke="#00c853" stroke-width="2"/>
  <!-- 라벨 -->
  <text x="30" y="55" fill="#00c853" font-size="11" font-family="Arial" font-weight="bold">1/12</text>
  <text x="20" y="15" fill="#e0e0e0" font-size="12" font-family="Arial">전체를 3칸으로 나눔 (분모=3)</text>
  <text x="20" y="138" fill="#4facfe" font-size="12" font-family="Arial">각 칸을 ÷4 → 총 12칸</text>
  <text x="185" y="85" fill="#ffd740" font-size="13" font-family="Arial" font-weight="bold">÷4</text>
</svg>`,
      caption: '(분수)÷(자연수): 각 칸을 다시 나누면 분모가 곱해집니다.'
    },
    commonMistakes: [
      {
        wrong: '\\frac{2}{3} \\div 4 = \\frac{8}{3}',
        right: '\\frac{2}{3} \\div 4 = \\frac{2}{12} = \\frac{1}{6}',
        reason: '자연수를 분모에 곱해야 합니다. 분자에 곱하면 오히려 커집니다.'
      },
      {
        wrong: '\\frac{4}{6} ÷ 2 = \\frac{4}{12} (약분 안 함)',
        right: '\\frac{4}{6} \\div 2 = \\frac{4}{12} = \\frac{1}{3}',
        reason: '계산 후 반드시 기약분수로 나타냅니다.'
      }
    ],
    deepDive: {
      content: [
        '**역수 이용**: $\\frac{a}{b} \\div n = \\frac{a}{b} \\times \\frac{1}{n} = \\frac{a}{b \\times n}$',
        '**단축 계산**: 분자가 나누는 수의 배수일 때는 분자를 바로 나눌 수 있습니다. 예) $\\frac{6}{7} \\div 3 = \\frac{6 \\div 3}{7} = \\frac{2}{7}$',
        '**연결**: 이 원리가 분수÷분수(역수 곱셈)의 기초가 됩니다.'
      ],
      examples: [
        {
          problem: '$\\frac{5}{6} \\div 4$를 계산하시오.',
          solution: [
            '$\\frac{5}{6} \\div 4 = \\frac{5}{6} \\times \\frac{1}{4} = \\frac{5}{24}$',
            '정답: $\\frac{5}{24}$'
          ]
        }
      ]
    }
  },

  'e6-1-u1-c3': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 130" xmlns="http://www.w3.org/2000/svg">
  <!-- 대분수 박스 -->
  <rect x="15" y="30" width="70" height="50" rx="8" fill="rgba(79,172,254,0.15)" stroke="#4facfe" stroke-width="2"/>
  <text x="30" y="62" fill="#4facfe" font-size="18" font-family="Arial" font-weight="bold">2⅓</text>
  <!-- 화살표 -->
  <line x1="90" y1="55" x2="130" y2="55" stroke="#ffd740" stroke-width="2" marker-end="url(#arr2)"/>
  <text x="96" y="48" fill="#ffd740" font-size="10" font-family="Arial">가분수로</text>
  <defs>
    <marker id="arr2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#ffd740"/>
    </marker>
  </defs>
  <!-- 가분수 박스 -->
  <rect x="135" y="30" width="70" height="50" rx="8" fill="rgba(0,200,83,0.15)" stroke="#00c853" stroke-width="2"/>
  <text x="155" y="62" fill="#00c853" font-size="18" font-family="Arial" font-weight="bold">7/3</text>
  <!-- 계산 설명 -->
  <text x="15" y="100" fill="#e0e0e0" font-size="11" font-family="Arial">2×3+1=7  →  7/3</text>
  <!-- 화살표2 -->
  <line x1="210" y1="55" x2="250" y2="55" stroke="#ffd740" stroke-width="2" marker-end="url(#arr3)"/>
  <text x="212" y="48" fill="#ffd740" font-size="10" font-family="Arial">÷3</text>
  <defs>
    <marker id="arr3" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#ffd740"/>
    </marker>
  </defs>
  <text x="252" y="62" fill="#ff5252" font-size="16" font-family="Arial" font-weight="bold">7/9</text>
</svg>`,
      caption: '대분수를 가분수로 바꾼 뒤 나눕니다.'
    },
    commonMistakes: [
      {
        wrong: '2\\frac{1}{3} \\div 3 = \\frac{2}{3} + \\frac{1}{3}\\div3',
        right: '2\\frac{1}{3} \\div 3 = \\frac{7}{3} \\div 3 = \\frac{7}{9}',
        reason: '정수 부분만 따로 나누면 안 됩니다. 반드시 가분수로 변환 후 계산합니다.'
      },
      {
        wrong: '3\\frac{2}{5}를 가분수로 → \\frac{11}{5} (오계산)',
        right: '3\\frac{2}{5} = \\frac{3 \\times 5 + 2}{5} = \\frac{17}{5}',
        reason: '가분수 변환: 분자 = (정수×분모+분자). 계산 실수에 주의합니다.'
      }
    ],
    deepDive: {
      content: [
        '**반례**: $2\\frac{1}{3}\\div 3$에서 정수만 나누면 $\\frac{2}{3}+\\frac{1}{3}\\div 3=\\frac{2}{3}+\\frac{1}{9}=\\frac{7}{9}$이 아닌 $\\frac{7}{9}$…처럼 우연히 맞을 수도 있지만, $2\\frac{2}{3}\\div 2$에서는 $\\frac{1}{3}+\\frac{1}{3}=\\frac{2}{3}\\ne\\frac{4}{3}$으로 틀립니다.',
        '**중학 연계**: 대분수 나눗셈은 분수 방정식 $\\frac{a}{b}x=c$의 풀이와 직결됩니다.'
      ],
      examples: [
        {
          problem: '$3\\frac{2}{5} \\div 6$을 계산하시오.',
          solution: [
            '$3\\frac{2}{5} = \\frac{17}{5}$',
            '$\\frac{17}{5} \\div 6 = \\frac{17}{5} \\times \\frac{1}{6} = \\frac{17}{30}$',
            '정답: $\\frac{17}{30}$'
          ]
        }
      ]
    }
  },

  'e6-1-u2-c1': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  <!-- 삼각기둥: 아래 삼각형 -->
  <polygon points="60,160 160,160 110,120" fill="none" stroke="#4facfe" stroke-width="2"/>
  <!-- 위 삼각형 -->
  <polygon points="80,60 180,60 130,20" fill="none" stroke="#4facfe" stroke-width="2"/>
  <!-- 세 옆면 모서리 -->
  <line x1="60" y1="160" x2="80" y2="60" stroke="#00c853" stroke-width="2"/>
  <line x1="160" y1="160" x2="180" y2="60" stroke="#00c853" stroke-width="2"/>
  <line x1="110" y1="120" x2="130" y2="20" stroke="#00c853" stroke-width="2"/>
  <!-- 꼭짓점 -->
  <circle cx="60" cy="160" r="5" fill="#ff5252"/><circle cx="160" cy="160" r="5" fill="#ff5252"/>
  <circle cx="110" cy="120" r="5" fill="#ff5252"/><circle cx="80" cy="60" r="5" fill="#ff5252"/>
  <circle cx="180" cy="60" r="5" fill="#ff5252"/><circle cx="130" cy="20" r="5" fill="#ff5252"/>
  <!-- 라벨 -->
  <text x="170" y="30" fill="#e0e0e0" font-size="11" font-family="Arial">면: 5개</text>
  <text x="170" y="50" fill="#00c853" font-size="11" font-family="Arial">모서리: 9개</text>
  <text x="170" y="70" fill="#ff5252" font-size="11" font-family="Arial">꼭짓점: 6개</text>
</svg>`,
      caption: '삼각기둥: 꼭짓점 6개, 모서리 9개, 면 5개'
    },
    commonMistakes: [
      {
        wrong: 'n각기둥 꼭짓점 = n+1',
        right: 'n각기둥 꼭짓점 = 2n',
        reason: '꼭짓점은 위·아래 밑면에 각각 n개씩, 합계 2n개입니다. n+1은 각뿔 공식입니다.'
      },
      {
        wrong: '각기둥의 밑면은 1개',
        right: '각기둥의 밑면은 2개 (위·아래)',
        reason: '각뿔은 밑면이 1개지만, 각기둥은 서로 평행한 두 밑면이 있습니다.'
      }
    ],
    deepDive: {
      content: [
        '**오일러 공식**: 모든 볼록 다면체에서 $V - E + F = 2$ (V=꼭짓점, E=모서리, F=면). 삼각기둥: $6-9+5=2$ ✓',
        '**n각기둥 일반 공식**: 면 $= n+2$, 모서리 $= 3n$, 꼭짓점 $= 2n$',
        '| 각기둥 | 면 | 모서리 | 꼭짓점 |\n|---|---|---|---|\n| 삼각기둥 | 5 | 9 | 6 |\n| 사각기둥 | 6 | 12 | 8 |\n| 오각기둥 | 7 | 15 | 10 |'
      ],
      examples: [
        {
          problem: '꼭짓점이 16개인 각기둥의 모서리 수를 구하시오.',
          solution: [
            '꼭짓점 = $2n$ → $2n=16$ → $n=8$ (팔각기둥)',
            '모서리 = $3n = 3 \\times 8 = 24$개',
            '정답: 24개'
          ]
        }
      ]
    }
  },

  'e6-1-u2-c2': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  <!-- 위 밑면 -->
  <rect x="105" y="15" width="70" height="50" fill="rgba(255,215,64,0.15)" stroke="#ffd740" stroke-width="2"/>
  <text x="125" y="45" fill="#ffd740" font-size="11" font-family="Arial">윗면</text>
  <!-- 아래 밑면 -->
  <rect x="105" y="145" width="70" height="50" fill="rgba(255,215,64,0.15)" stroke="#ffd740" stroke-width="2"/>
  <text x="122" y="175" fill="#ffd740" font-size="11" font-family="Arial">아랫면</text>
  <!-- 옆면 4개 (가운데 + 좌우) -->
  <rect x="105" y="70" width="70" height="70" fill="rgba(0,200,83,0.15)" stroke="#00c853" stroke-width="2"/>
  <text x="122" y="110" fill="#00c853" font-size="11" font-family="Arial">앞면</text>
  <rect x="30" y="70" width="70" height="70" fill="rgba(79,172,254,0.15)" stroke="#4facfe" stroke-width="2"/>
  <text x="48" y="110" fill="#4facfe" font-size="11" font-family="Arial">왼쪽면</text>
  <rect x="180" y="70" width="70" height="70" fill="rgba(79,172,254,0.15)" stroke="#4facfe" stroke-width="2"/>
  <text x="196" y="110" fill="#4facfe" font-size="11" font-family="Arial">오른면</text>
  <!-- 뒷면 표시 -->
  <rect x="105" y="70" width="70" height="70" fill="none" stroke="#ff5252" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="118" y="88" fill="#ff5252" font-size="9" font-family="Arial">(뒷면: 점선)</text>
</svg>`,
      caption: '사각기둥 전개도: 밑면 2개 + 옆면 4개 = 총 6면'
    },
    commonMistakes: [
      {
        wrong: '사각기둥 전개도에 직사각형 3개',
        right: '사각기둥 전개도에 직사각형 4개 + 정사각형(또는 직사각형) 2개',
        reason: 'n각기둥의 옆면은 n개입니다. 사각기둥은 옆면 4개입니다.'
      },
      {
        wrong: '전개도를 접었을 때 겹치는 면이 없어도 됨',
        right: '전개도를 접을 때 어떤 면도 겹쳐서는 안 됨',
        reason: '면이 겹치면 입체가 완성되지 않습니다. 접는 방향을 미리 확인해야 합니다.'
      }
    ],
    deepDive: {
      content: [
        '**전개도의 다양성**: 정육면체의 전개도는 11가지입니다. 같은 각기둥이라도 전개도는 여러 종류로 그릴 수 있습니다.',
        '**최단거리 문제**: 입체 위의 두 점 사이 최단 경로는 전개도 위에서 직선으로 구합니다. (중학 연계)',
        '**옆면 너비 합**: n각기둥에서 옆면 직사각형들의 너비의 합 = 밑면 둘레'
      ],
      examples: [
        {
          problem: '밑면이 정오각형인 각기둥의 전개도에서 직사각형은 몇 개입니까?',
          solution: [
            '오각기둥의 옆면 수 = 밑면의 변의 수 = 5개',
            '옆면은 모두 직사각형이므로 직사각형 5개',
            '정답: 5개'
          ]
        }
      ]
    }
  },

  'e6-1-u2-c3': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  <!-- 밑면 사각형 -->
  <polygon points="40,160 160,160 180,130 60,130" fill="rgba(79,172,254,0.12)" stroke="#4facfe" stroke-width="2"/>
  <!-- 꼭짓점 -->
  <circle cx="110" cy="25" r="6" fill="#ffd740"/>
  <!-- 옆 모서리 4개 -->
  <line x1="110" y1="25" x2="40" y2="160" stroke="#00c853" stroke-width="2"/>
  <line x1="110" y1="25" x2="160" y2="160" stroke="#00c853" stroke-width="2"/>
  <line x1="110" y1="25" x2="180" y2="130" stroke="#00c853" stroke-width="2"/>
  <line x1="110" y1="25" x2="60" y2="130" stroke="#00c853" stroke-width="1.5" stroke-dasharray="5,3"/>
  <!-- 밑면 꼭짓점 -->
  <circle cx="40" cy="160" r="4" fill="#ff5252"/>
  <circle cx="160" cy="160" r="4" fill="#ff5252"/>
  <circle cx="180" cy="130" r="4" fill="#ff5252"/>
  <circle cx="60" cy="130" r="4" fill="#ff5252"/>
  <!-- 라벨 -->
  <text x="190" y="50" fill="#ffd740" font-size="11" font-family="Arial">꼭짓점: 5개</text>
  <text x="190" y="68" fill="#00c853" font-size="11" font-family="Arial">모서리: 8개</text>
  <text x="190" y="86" fill="#ff5252" font-size="11" font-family="Arial">면: 5개</text>
  <text x="190" y="104" fill="#4facfe" font-size="11" font-family="Arial">밑면: 1개</text>
</svg>`,
      caption: '사각뿔: 꼭짓점 5개, 모서리 8개, 면 5개, 밑면 1개'
    },
    commonMistakes: [
      {
        wrong: 'n각뿔 모서리 = 3n',
        right: 'n각뿔 모서리 = 2n',
        reason: '각뿔의 모서리는 밑면 n개 + 옆 모서리 n개 = 2n개입니다. 3n은 각기둥 공식입니다.'
      },
      {
        wrong: '각뿔의 밑면은 2개',
        right: '각뿔의 밑면은 1개',
        reason: '각뿔은 한 꼭짓점에서 밑면으로 내려오는 형태라 밑면이 1개입니다.'
      }
    ],
    deepDive: {
      content: [
        '**n각뿔 일반 공식**: 면 $= n+1$, 모서리 $= 2n$, 꼭짓점 $= n+1$',
        '**각기둥 vs 각뿔 비교표**:\n| 구분 | 밑면 | 면 | 모서리 | 꼭짓점 |\n|---|---|---|---|---|\n| n각기둥 | 2 | n+2 | 3n | 2n |\n| n각뿔 | 1 | n+1 | 2n | n+1 |',
        '**오일러 공식 확인**: 사각뿔 $V-E+F = 5-8+5 = 2$ ✓'
      ],
      examples: [
        {
          problem: '모서리가 12개인 각뿔의 꼭짓점 수를 구하시오.',
          solution: [
            '모서리 = $2n$ → $2n=12$ → $n=6$ (육각뿔)',
            '꼭짓점 = $n+1 = 6+1 = 7$개',
            '정답: 7개'
          ]
        }
      ]
    }
  },

  'e6-1-u3-c1': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 150" xmlns="http://www.w3.org/2000/svg">
  <!-- 자리값 표 -->
  <rect x="15" y="20" width="50" height="35" fill="rgba(255,255,255,0.05)" stroke="#e0e0e0" stroke-width="1.5"/>
  <rect x="65" y="20" width="50" height="35" fill="rgba(255,255,255,0.05)" stroke="#e0e0e0" stroke-width="1.5"/>
  <rect x="115" y="20" width="20" height="35" fill="rgba(255,255,255,0.02)" stroke="#e0e0e0" stroke-width="1"/>
  <rect x="135" y="20" width="60" height="35" fill="rgba(0,200,83,0.1)" stroke="#00c853" stroke-width="1.5"/>
  <rect x="195" y="20" width="60" height="35" fill="rgba(0,200,83,0.1)" stroke="#00c853" stroke-width="1.5"/>
  <!-- 헤더 텍스트 -->
  <text x="27" y="34" fill="#e0e0e0" font-size="9" font-family="Arial">십의 자리</text>
  <text x="78" y="34" fill="#e0e0e0" font-size="9" font-family="Arial">일의 자리</text>
  <text x="119" y="38" fill="#ffd740" font-size="13" font-family="Arial" font-weight="bold">.</text>
  <text x="140" y="32" fill="#00c853" font-size="9" font-family="Arial">소수 첫째</text>
  <text x="200" y="32" fill="#00c853" font-size="9" font-family="Arial">소수 둘째</text>
  <!-- 8.4 ÷ 2 = 4.2 -->
  <text x="27" y="50" fill="#e0e0e0" font-size="14" font-family="Arial">8</text>
  <text x="83" y="50" fill="#4facfe" font-size="14" font-family="Arial" font-weight="bold">·</text>
  <text x="119" y="50" fill="#ffd740" font-size="13" font-family="Arial">.</text>
  <text x="155" y="50" fill="#4facfe" font-size="14" font-family="Arial" font-weight="bold">4</text>
  <!-- 화살표: ÷2 -->
  <text x="85" y="90" fill="#ffd740" font-size="14" font-family="Arial" font-weight="bold">8.4 ÷ 2 = 4.2</text>
  <text x="85" y="112" fill="#e0e0e0" font-size="11" font-family="Arial">소수점 위치 그대로 유지</text>
  <text x="85" y="130" fill="#00c853" font-size="11" font-family="Arial">8÷2=4,  4÷2=2  →  4.2</text>
</svg>`,
      caption: '8.4÷2=4.2: 소수점 위치를 그대로 내려씁니다.'
    },
    commonMistakes: [
      {
        wrong: '8.4 \\div 2 = 42',
        right: '8.4 \\div 2 = 4.2',
        reason: '자연수처럼 계산한 뒤 소수점을 원래 자리에 맞춰 내려야 합니다.'
      },
      {
        wrong: '피제수 8.4에서 제수 2로 소수점을 이동',
        right: '제수(2)는 자연수이므로 소수점을 이동하지 않음',
        reason: '나누는 수가 자연수일 때는 피제수의 소수점 위치를 그대로 내립니다.'
      }
    ],
    deepDive: {
      content: [
        '**소수점 아래 0 추가**: 나누어떨어지지 않으면 소수점 아래에 0을 추가해 계산합니다. 예) $7 \\div 2 = 3.5$',
        '**나머지 처리**: 나머지가 있을 때는 0을 내려서 계속 나눌 수 있습니다.',
        '**검산**: 몫 × 제수 = 피제수가 되는지 확인합니다.'
      ],
      examples: [
        {
          problem: '$15.75 \\div 5$를 계산하시오.',
          solution: [
            '$15.75 \\div 5$: 자연수 부분 $15 \\div 5 = 3$, 소수 부분 $0.75 \\div 5 = 0.15$',
            '세로 계산: $15.75 \\div 5 = 3.15$',
            '검산: $3.15 \\times 5 = 15.75$ ✓',
            '정답: $3.15$'
          ]
        }
      ]
    }
  },

  'e6-1-u3-c2': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 120" xmlns="http://www.w3.org/2000/svg">
  <!-- 수직선 -->
  <line x1="20" y1="60" x2="260" y2="60" stroke="#e0e0e0" stroke-width="2"/>
  <line x1="20" y1="50" x2="20" y2="70" stroke="#e0e0e0" stroke-width="2"/>
  <line x1="140" y1="50" x2="140" y2="70" stroke="#e0e0e0" stroke-width="2"/>
  <line x1="260" y1="50" x2="260" y2="70" stroke="#e0e0e0" stroke-width="2"/>
  <!-- 0.2, 0.4, 0.6 눈금 -->
  <line x1="68" y1="53" x2="68" y2="67" stroke="#e0e0e0" stroke-width="1.5"/>
  <line x1="116" y1="53" x2="116" y2="67" stroke="#e0e0e0" stroke-width="1.5"/>
  <line x1="164" y1="53" x2="164" y2="67" stroke="#4facfe" stroke-width="2"/>
  <!-- 0.6 강조 -->
  <circle cx="164" cy="60" r="7" fill="#4facfe" opacity="0.7"/>
  <!-- 0.2 강조 -->
  <circle cx="68" cy="60" r="6" fill="#00c853"/>
  <!-- 라벨 -->
  <text x="14" y="85" fill="#e0e0e0" font-size="12" font-family="Arial">0</text>
  <text x="134" y="85" fill="#e0e0e0" font-size="12" font-family="Arial">0.5</text>
  <text x="254" y="85" fill="#e0e0e0" font-size="12" font-family="Arial">1</text>
  <text x="155" y="85" fill="#4facfe" font-size="12" font-family="Arial">0.6</text>
  <text x="59" y="85" fill="#00c853" font-size="12" font-family="Arial">0.2</text>
  <!-- 수식 -->
  <text x="60" y="25" fill="#ffd740" font-size="13" font-family="Arial" font-weight="bold">0.6 ÷ 3 = 0.2</text>
</svg>`,
      caption: '0.6÷3=0.2: 몫이 1보다 작은 소수 나눗셈'
    },
    commonMistakes: [
      {
        wrong: '0.6 \\div 3 = .2 (0 빠트림)',
        right: '0.6 \\div 3 = 0.2',
        reason: '일의 자리가 0이라도 반드시 "0."을 써야 합니다.'
      },
      {
        wrong: '0.6 \\div 3 = 2 (소수점 누락)',
        right: '0.6 \\div 3 = 0.2',
        reason: '소수점을 빠트리면 실제 값의 10배가 됩니다. 소수점 위치를 확인합니다.'
      }
    ],
    deepDive: {
      content: [
        '**몫<1 판별**: 피제수 < 제수이면 몫이 1보다 작습니다. 예) $0.6 < 3$ → 몫 < 1',
        '**변환 계산법**: $0.6 \\div 3 = \\frac{6}{10} \\div 3 = \\frac{6}{30} = \\frac{1}{5} = 0.2$',
        '**자연수 나눗셈 활용**: $6 \\div 3 = 2$이고 $0.6$은 $6$의 $\\frac{1}{10}$이므로 몫도 $\\frac{1}{10}$인 $0.2$'
      ],
      examples: [
        {
          problem: '$0.84 \\div 4$를 계산하시오.',
          solution: [
            '$0.84 < 4$이므로 몫 < 1',
            '$84 \\div 4 = 21$, $0.84$는 $84$의 $\\frac{1}{100}$이므로 몫도 $\\frac{1}{100}$',
            '$0.84 \\div 4 = 0.21$',
            '정답: $0.21$'
          ]
        }
      ]
    }
  },

  'e6-1-u3-c3': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 130" xmlns="http://www.w3.org/2000/svg">
  <!-- 수직선 -->
  <line x1="20" y1="65" x2="260" y2="65" stroke="#e0e0e0" stroke-width="2"/>
  <!-- 2.3, 2.35, 2.4 표시 -->
  <line x1="60" y1="55" x2="60" y2="75" stroke="#e0e0e0" stroke-width="2"/>
  <line x1="160" y1="55" x2="160" y2="75" stroke="#e0e0e0" stroke-width="2"/>
  <line x1="260" y1="55" x2="260" y2="75" stroke="#e0e0e0" stroke-width="2"/>
  <!-- 0.05 기준선 -->
  <line x1="160" y1="45" x2="160" y2="85" stroke="#ffd740" stroke-width="2" stroke-dasharray="4,3"/>
  <!-- 범위 표시 -->
  <rect x="60" y="57" width="200" height="16" fill="rgba(79,172,254,0.1)" stroke="none"/>
  <!-- 화살표: 반올림 방향 -->
  <text x="50" y="98" fill="#e0e0e0" font-size="11" font-family="Arial">2.3</text>
  <text x="148" y="98" fill="#ffd740" font-size="11" font-family="Arial">2.35</text>
  <text x="248" y="98" fill="#e0e0e0" font-size="11" font-family="Arial">2.4</text>
  <text x="90" y="40" fill="#4facfe" font-size="11" font-family="Arial">← 버림(2.3)</text>
  <text x="170" y="40" fill="#ff5252" font-size="11" font-family="Arial">올림(2.4) →</text>
  <text x="50" y="120" fill="#ffd740" font-size="11" font-family="Arial">기준: 소수 둘째 자리 = 5 → 올림</text>
</svg>`,
      caption: '반올림 기준: 구하는 자리 바로 아래 숫자가 5 이상이면 올림'
    },
    commonMistakes: [
      {
        wrong: '소수 첫째 자리에서 반올림 → 소수 첫째 자리를 봄',
        right: '소수 첫째 자리에서 반올림 → 소수 둘째 자리 숫자를 봄',
        reason: '반올림은 구하려는 자리의 바로 아래 자리를 보고 판단합니다.'
      },
      {
        wrong: '올림=반올림',
        right: '올림: 무조건 위로, 반올림: 5 이상만 올림, 버림: 무조건 아래로',
        reason: '세 가지 어림 방법의 기준이 다릅니다. 문제에서 요구하는 방법을 확인합니다.'
      }
    ],
    deepDive: {
      content: [
        '**비교 정리**: 올림(항상 위), 버림(항상 아래), 반올림(5 이상 올림, 4 이하 버림)',
        '**실생활**: 환율 계산(원 단위 절사=버림), 물건 개수(모자라면 안 되므로 올림), 평균 점수(반올림)',
        '**주의**: "소수 첫째 자리까지 나타내기"와 "소수 첫째 자리에서 반올림"은 다릅니다.'
      ],
      examples: [
        {
          problem: '$7 \\div 3$의 몫을 소수 둘째 자리에서 반올림하여 나타내시오.',
          solution: [
            '$7 \\div 3 = 2.333...$',
            '소수 둘째 자리 숫자: 3 < 5 → 버림',
            '정답: $2.3$'
          ]
        }
      ]
    }
  },

  'e6-1-u4-c1': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg">
  <!-- 파란 직사각형 3개 -->
  <rect x="20" y="30" width="40" height="40" rx="4" fill="rgba(79,172,254,0.7)" stroke="#4facfe" stroke-width="1.5"/>
  <rect x="65" y="30" width="40" height="40" rx="4" fill="rgba(79,172,254,0.7)" stroke="#4facfe" stroke-width="1.5"/>
  <rect x="110" y="30" width="40" height="40" rx="4" fill="rgba(79,172,254,0.7)" stroke="#4facfe" stroke-width="1.5"/>
  <!-- 빨간 직사각형 5개 -->
  <rect x="160" y="30" width="40" height="40" rx="4" fill="rgba(255,82,82,0.7)" stroke="#ff5252" stroke-width="1.5"/>
  <rect x="205" y="30" width="40" height="40" rx="4" fill="rgba(255,82,82,0.7)" stroke="#ff5252" stroke-width="1.5"/>
  <rect x="20" y="75" width="40" height="20" rx="3" fill="rgba(255,82,82,0.5)" stroke="#ff5252" stroke-width="1"/>
  <rect x="65" y="75" width="40" height="20" rx="3" fill="rgba(255,82,82,0.5)" stroke="#ff5252" stroke-width="1"/>
  <rect x="110" y="75" width="40" height="20" rx="3" fill="rgba(255,82,82,0.5)" stroke="#ff5252" stroke-width="1"/>
  <!-- 라벨 -->
  <text x="60" y="20" fill="#4facfe" font-size="12" font-family="Arial">파란색: 3개</text>
  <text x="165" y="20" fill="#ff5252" font-size="12" font-family="Arial">빨간색: 5개</text>
  <text x="95" y="98" fill="#ffd740" font-size="14" font-family="Arial" font-weight="bold">3 : 5</text>
</svg>`,
      caption: '파란색 3개와 빨간색 5개의 비 = 3:5'
    },
    commonMistakes: [
      {
        wrong: '파란:빨간 = 5:3',
        right: '파란:빨간 = 3:5',
        reason: '비는 순서가 중요합니다. "A:B"에서 기준이 되는 대상을 먼저 씁니다.'
      },
      {
        wrong: '비 3:5와 비율 3/5은 같은 것',
        right: '비 3:5는 두 양의 관계를 나타내고, 비율 3/5은 기준량에 대한 비교량의 값',
        reason: '비는 두 수의 관계 표현, 비율은 비를 하나의 수로 나타낸 것입니다.'
      }
    ],
    deepDive: {
      content: [
        '**전항·후항**: $a:b$에서 $a$를 전항, $b$를 후항이라 합니다.',
        '**비의 값**: $a:b$의 비의 값 = $\\frac{a}{b}$ (비율과 같습니다)',
        '**비의 성질**: 비의 전항과 후항에 같은 수를 곱하거나 나누어도 비는 같습니다. $3:5 = 6:10 = 9:15$'
      ],
      examples: [
        {
          problem: '소금물 200g에 소금이 30g 들어 있습니다. 소금과 물의 비를 구하시오.',
          solution: [
            '물의 양 = $200 - 30 = 170$(g)',
            '소금:물 $= 30:170 = 3:17$',
            '정답: $3:17$'
          ]
        }
      ]
    }
  },

  'e6-1-u4-c2': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 80" xmlns="http://www.w3.org/2000/svg">
  <!-- 100칸 바 (20칸씩 5묶음) -->
  <rect x="15" y="25" width="250" height="35" rx="4" fill="rgba(255,255,255,0.05)" stroke="#e0e0e0" stroke-width="1.5"/>
  <!-- 40칸 초록 강조 -->
  <rect x="15" y="25" width="100" height="35" rx="4" fill="rgba(0,200,83,0.5)" stroke="#00c853" stroke-width="2"/>
  <!-- 눈금 -->
  <line x1="65" y1="25" x2="65" y2="60" stroke="#e0e0e0" stroke-width="0.8" stroke-dasharray="2,2"/>
  <line x1="115" y1="25" x2="115" y2="60" stroke="#e0e0e0" stroke-width="0.8" stroke-dasharray="2,2"/>
  <line x1="165" y1="25" x2="165" y2="60" stroke="#e0e0e0" stroke-width="0.8" stroke-dasharray="2,2"/>
  <line x1="215" y1="25" x2="215" y2="60" stroke="#e0e0e0" stroke-width="0.8" stroke-dasharray="2,2"/>
  <!-- 라벨 -->
  <text x="40" y="46" fill="#00c853" font-size="11" font-family="Arial" font-weight="bold">40</text>
  <text x="170" y="46" fill="#e0e0e0" font-size="11" font-family="Arial">60</text>
  <text x="80" y="18" fill="#ffd740" font-size="12" font-family="Arial" font-weight="bold">40/100 = 0.4 = 40%</text>
</svg>`,
      caption: '100칸 바 모델로 비율의 세 가지 표현을 비교합니다.'
    },
    commonMistakes: [
      {
        wrong: '비율 = 비교량 ÷ 비교량',
        right: '비율 = 비교량 ÷ 기준량',
        reason: '비율은 항상 "기준량"을 분모로 둡니다. 기준량과 비교량을 먼저 파악합니다.'
      },
      {
        wrong: '0.4 → 40% 변환 시 ×10',
        right: '0.4 → 40% 변환 시 ×100',
        reason: '소수를 백분율로 변환하려면 100을 곱합니다. ($0.4 \\times 100 = 40$%)'
      }
    ],
    deepDive: {
      content: [
        '**3가지 표현 변환**: 분수 $\\frac{2}{5}$ → 소수 $0.4$ → 백분율 $40\\%$',
        '변환 규칙: 분수↔소수(나눗셈), 소수→백분율(×100), 백분율→소수(÷100)',
        '**실생활**: 타율 0.300 = $\\frac{3}{10}$ = 30%, 합격률 $\\frac{7}{20}$ = 35%'
      ],
      examples: [
        {
          problem: '할인율이 25%이고 원가가 8000원일 때 판매가는 얼마입니까?',
          solution: [
            '할인 금액 = $8000 \\times 0.25 = 2000$(원)',
            '판매가 = $8000 - 2000 = 6000$(원)',
            '정답: 6000원'
          ]
        }
      ]
    }
  },

  'e6-1-u4-c3': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg">
  <!-- 원 그래프 4등분 -->
  <circle cx="110" cy="100" r="70" fill="none" stroke="#e0e0e0" stroke-width="1"/>
  <path d="M110,100 L110,30 A70,70 0 0,1 180,100 Z" fill="rgba(0,200,83,0.7)"/>
  <path d="M110,100 L180,100 A70,70 0 0,1 110,170 Z" fill="rgba(79,172,254,0.7)"/>
  <path d="M110,100 L110,170 A70,70 0 0,1 40,100 Z" fill="rgba(255,215,64,0.7)"/>
  <path d="M110,100 L40,100 A70,70 0 0,1 110,30 Z" fill="rgba(255,82,82,0.7)"/>
  <!-- 라벨 -->
  <text x="130" y="75" fill="#e0e0e0" font-size="11" font-family="Arial" font-weight="bold">25%</text>
  <text x="130" y="135" fill="#e0e0e0" font-size="11" font-family="Arial" font-weight="bold">25%</text>
  <text x="58" y="135" fill="#e0e0e0" font-size="11" font-family="Arial" font-weight="bold">25%</text>
  <text x="58" y="75" fill="#e0e0e0" font-size="11" font-family="Arial" font-weight="bold">25%</text>
  <!-- 범례 -->
  <text x="200" y="80" fill="#e0e0e0" font-size="11" font-family="Arial">각 25%</text>
  <text x="200" y="100" fill="#ffd740" font-size="11" font-family="Arial">합계: 100%</text>
</svg>`,
      caption: '원 그래프: 전체를 100%로 보고 각 항목의 비율을 표시합니다.'
    },
    commonMistakes: [
      {
        wrong: '%를 소수로 변환 시 ÷10',
        right: '%를 소수로 변환 시 ÷100',
        reason: '$25\\% = 25 \\div 100 = 0.25$. ÷10은 10분율(할)입니다.'
      },
      {
        wrong: '원 그래프에서 비율 합이 100%가 아니어도 됨',
        right: '원 그래프의 모든 항목 비율의 합은 반드시 100%',
        reason: '원 그래프는 전체를 나타내므로 모든 비율의 합이 100%여야 합니다.'
      }
    ],
    deepDive: {
      content: [
        '**연속 할인 주의**: 20% 할인 후 10% 추가 할인 ≠ 30% 할인',
        '실제: $100 \\times 0.8 \\times 0.9 = 72$원 → 28% 할인',
        '**할인율·이자율·득표율** 모두 같은 원리: (비교량 ÷ 기준량) × 100%'
      ],
      examples: [
        {
          problem: '정가 15000원에서 20% 할인 후, 다시 10% 추가 할인하면 최종 가격은?',
          solution: [
            '1차 할인: $15000 \\times 0.8 = 12000$(원)',
            '2차 할인: $12000 \\times 0.9 = 10800$(원)',
            '정답: 10800원 (30% 할인인 10500원이 아님에 주의)'
          ]
        }
      ]
    }
  },

  'e6-1-u5-c1': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 130" xmlns="http://www.w3.org/2000/svg">
  <!-- 제목 -->
  <text x="15" y="20" fill="#e0e0e0" font-size="12" font-family="Arial" font-weight="bold">사과 수확량 (○=10개)</text>
  <!-- 행 라벨 -->
  <text x="15" y="50" fill="#e0e0e0" font-size="11" font-family="Arial">A농장</text>
  <text x="15" y="80" fill="#e0e0e0" font-size="11" font-family="Arial">B농장</text>
  <text x="15" y="110" fill="#e0e0e0" font-size="11" font-family="Arial">C농장</text>
  <!-- A농장: 3개 = 30개 -->
  <circle cx="70" cy="45" r="10" fill="rgba(255,82,82,0.7)" stroke="#ff5252" stroke-width="1.5"/>
  <circle cx="95" cy="45" r="10" fill="rgba(255,82,82,0.7)" stroke="#ff5252" stroke-width="1.5"/>
  <circle cx="120" cy="45" r="10" fill="rgba(255,82,82,0.7)" stroke="#ff5252" stroke-width="1.5"/>
  <text x="140" y="50" fill="#ffd740" font-size="11" font-family="Arial">= 30개</text>
  <!-- B농장: 5개 = 50개 -->
  <circle cx="70" cy="75" r="10" fill="rgba(0,200,83,0.7)" stroke="#00c853" stroke-width="1.5"/>
  <circle cx="95" cy="75" r="10" fill="rgba(0,200,83,0.7)" stroke="#00c853" stroke-width="1.5"/>
  <circle cx="120" cy="75" r="10" fill="rgba(0,200,83,0.7)" stroke="#00c853" stroke-width="1.5"/>
  <circle cx="145" cy="75" r="10" fill="rgba(0,200,83,0.7)" stroke="#00c853" stroke-width="1.5"/>
  <circle cx="170" cy="75" r="10" fill="rgba(0,200,83,0.7)" stroke="#00c853" stroke-width="1.5"/>
  <text x="190" y="80" fill="#ffd740" font-size="11" font-family="Arial">= 50개</text>
  <!-- C농장: 2.5개 = 25개 -->
  <circle cx="70" cy="105" r="10" fill="rgba(79,172,254,0.7)" stroke="#4facfe" stroke-width="1.5"/>
  <circle cx="95" cy="105" r="10" fill="rgba(79,172,254,0.7)" stroke="#4facfe" stroke-width="1.5"/>
  <!-- 반쪽 원 -->
  <path d="M120,105 A10,10 0 0,1 120,105 m0,-10 A10,10 0 0,1 130,105 L120,105 Z" fill="rgba(79,172,254,0.7)" stroke="#4facfe" stroke-width="1.5"/>
  <path d="M120,95 A10,10 0 0,1 130,105 L120,105 Z" fill="rgba(79,172,254,0.7)" stroke="#4facfe" stroke-width="1.5"/>
  <text x="140" y="110" fill="#ffd740" font-size="11" font-family="Arial">= 25개</text>
</svg>`,
      caption: '그림 그래프: 기호 1개의 단위를 먼저 확인합니다.'
    },
    commonMistakes: [
      {
        wrong: '기호 3개 = 3개',
        right: '기호 3개 = 단위 × 3개 (단위 확인 필수)',
        reason: '그림 그래프에서 기호 1개가 나타내는 수량을 반드시 먼저 확인합니다.'
      },
      {
        wrong: '반쪽 기호를 0으로 읽음',
        right: '반쪽 기호 = 단위의 절반',
        reason: '그림 그래프에서 반쪽 그림은 단위 수량의 반을 나타냅니다.'
      }
    ],
    deepDive: {
      content: [
        '**장점**: 한눈에 비교하기 쉽고 시각적으로 직관적입니다.',
        '**단점**: 정확한 수치 표현이 어렵고, 중간 값(예: 단위의 1/3)은 표현하기 어렵습니다.',
        '**반올림 표현의 한계**: 실제 수치가 달라도 기호 수는 같게 표현될 수 있습니다.'
      ],
      examples: [
        {
          problem: '그림 1개가 50명을 나타낼 때, 그림이 2.5개인 항목의 인원은?',
          solution: [
            '그림 2개 = $50 \\times 2 = 100$(명)',
            '그림 0.5개 = $50 \\times 0.5 = 25$(명)',
            '합계 = $100 + 25 = 125$(명)',
            '정답: 125명'
          ]
        }
      ]
    }
  },

  'e6-1-u5-c2': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  <!-- 40% 섹터 (초록) -->
  <path d="M140,100 L140,20 A80,80 0 0,1 211,140 Z" fill="#00c853" opacity="0.8"/>
  <!-- 30% 섹터 (파랑) -->
  <path d="M140,100 L211,140 A80,80 0 0,1 91,172 Z" fill="#4facfe" opacity="0.8"/>
  <!-- 20% 섹터 (노랑) -->
  <path d="M140,100 L91,172 A80,80 0 0,1 68,60 Z" fill="#ffd740" opacity="0.8"/>
  <!-- 10% 섹터 (빨강) -->
  <path d="M140,100 L68,60 A80,80 0 0,1 140,20 Z" fill="#ff5252" opacity="0.8"/>
  <!-- 범례 -->
  <rect x="230" y="50" width="12" height="12" fill="#00c853"/>
  <text x="246" y="61" fill="#e0e0e0" font-size="10" font-family="Arial">40%</text>
  <rect x="230" y="70" width="12" height="12" fill="#4facfe"/>
  <text x="246" y="81" fill="#e0e0e0" font-size="10" font-family="Arial">30%</text>
  <rect x="230" y="90" width="12" height="12" fill="#ffd740"/>
  <text x="246" y="101" fill="#e0e0e0" font-size="10" font-family="Arial">20%</text>
  <rect x="230" y="110" width="12" height="12" fill="#ff5252"/>
  <text x="246" y="121" fill="#e0e0e0" font-size="10" font-family="Arial">10%</text>
</svg>`,
      caption: '원 그래프: 각 항목의 비율을 각도로 표현합니다. 합계 = 100%'
    },
    commonMistakes: [
      {
        wrong: '원 그래프의 비율 합이 100%가 아니어도 됨',
        right: '원 그래프의 모든 항목 비율의 합은 반드시 100%',
        reason: '원 전체가 100%를 나타내므로 모든 섹터의 합이 100%여야 합니다.'
      },
      {
        wrong: '띠 그래프에서 눈금을 왼쪽에서부터 각 항목 크기로만 읽음',
        right: '띠 그래프에서 각 항목의 비율 = 오른쪽 눈금 - 왼쪽 눈금',
        reason: '누적 막대이므로 각 항목의 끝과 시작 눈금의 차이를 구해야 합니다.'
      }
    ],
    deepDive: {
      content: [
        '**그래프 선택 기준**: 띠 그래프는 여러 집단의 구성 비율 비교에 유리, 원 그래프는 한 집단의 구성 비율 표현에 유리합니다.',
        '**각도 계산**: 원 그래프에서 비율 $p\\%$에 해당하는 각도 = $360° \\times \\frac{p}{100}$',
        '예) $40\\% = 360° \\times 0.4 = 144°$'
      ],
      examples: [
        {
          problem: 'A 항목이 36%, B 항목이 24%일 때 원 그래프에서 각각 몇 도입니까?',
          solution: [
            'A: $360° \\times 0.36 = 129.6°$',
            'B: $360° \\times 0.24 = 86.4°$',
            '정답: A=129.6°, B=86.4°'
          ]
        }
      ]
    }
  },

  'e6-1-u5-c3': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg">
  <!-- 축 -->
  <line x1="40" y1="20" x2="40" y2="150" stroke="#e0e0e0" stroke-width="2"/>
  <line x1="40" y1="150" x2="260" y2="150" stroke="#e0e0e0" stroke-width="2"/>
  <!-- 막대 3개 -->
  <rect x="55" y="70" width="35" height="80" fill="rgba(79,172,254,0.5)" stroke="#4facfe" stroke-width="1.5"/>
  <rect x="115" y="50" width="35" height="100" fill="rgba(0,200,83,0.5)" stroke="#00c853" stroke-width="1.5"/>
  <rect x="175" y="90" width="35" height="60" fill="rgba(255,215,64,0.5)" stroke="#ffd740" stroke-width="1.5"/>
  <!-- 꺾은선그래프 -->
  <polyline points="72,70 132,48 192,85" fill="none" stroke="#ff5252" stroke-width="2.5"/>
  <circle cx="72" cy="70" r="4" fill="#ff5252"/>
  <circle cx="132" cy="48" r="4" fill="#ff5252"/>
  <circle cx="192" cy="85" r="4" fill="#ff5252"/>
  <!-- 범례 -->
  <rect x="210" y="30" width="12" height="10" fill="rgba(79,172,254,0.5)" stroke="#4facfe" stroke-width="1"/>
  <text x="225" y="40" fill="#4facfe" font-size="10" font-family="Arial">막대</text>
  <line x1="210" y1="55" x2="222" y2="55" stroke="#ff5252" stroke-width="2"/>
  <circle cx="216" cy="55" r="3" fill="#ff5252"/>
  <text x="225" y="59" fill="#ff5252" font-size="10" font-family="Arial">꺾은선</text>
  <!-- x축 라벨 -->
  <text x="60" y="165" fill="#e0e0e0" font-size="10" font-family="Arial">1월</text>
  <text x="120" y="165" fill="#e0e0e0" font-size="10" font-family="Arial">2월</text>
  <text x="180" y="165" fill="#e0e0e0" font-size="10" font-family="Arial">3월</text>
</svg>`,
      caption: '복합 그래프: 막대(양)와 꺾은선(변화 추이)을 함께 표현합니다.'
    },
    commonMistakes: [
      {
        wrong: '그래프의 제목과 단위는 안 읽어도 됨',
        right: '그래프 해석 시 제목, 단위, 축의 범위를 먼저 확인',
        reason: '단위와 범위를 모르면 수치를 잘못 읽을 수 있습니다.'
      },
      {
        wrong: 'Y축이 0부터 시작하지 않아도 비율 비교 가능',
        right: 'Y축이 0부터 시작하지 않으면 막대 크기로 비율 비교 불가',
        reason: 'Y축을 0부터 시작하지 않으면 시각적으로 차이가 왜곡되어 보입니다.'
      }
    ],
    deepDive: {
      content: [
        '**통계 왜곡 사례**: Y축이 0부터 시작하지 않으면 작은 차이가 크게 보입니다. 항상 Y축 원점을 확인합니다.',
        '**그래프 종류 선택 기준**:\n| 목적 | 적합한 그래프 |\n|---|---|\n| 크기 비교 | 막대 그래프 |\n| 변화 추이 | 꺾은선 그래프 |\n| 구성 비율 | 원/띠 그래프 |\n| 수량 비교(직관) | 그림 그래프 |',
        '**절대값 vs 상대값**: 막대 그래프는 절대값 비교, 원/띠 그래프는 상대적 비율 비교에 적합합니다.'
      ],
      examples: [
        {
          problem: '같은 학급 선호 과목 데이터를 띠·원·막대 그래프로 각각 그릴 때 각 그래프의 특징을 비교하시오.',
          solution: [
            '막대 그래프: 각 과목의 학생 수(절대값)를 한눈에 비교 가능',
            '원 그래프: 전체 대비 각 과목의 비율(%)을 한눈에 파악 가능',
            '띠 그래프: 여러 학급 간 비율 구성을 나란히 비교하기 용이',
            '정답: 목적에 따라 알맞은 그래프를 선택합니다.'
          ]
        }
      ]
    }
  },

  'e6-1-u6-c1': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  <!-- 직육면체 앞면 -->
  <rect x="40" y="80" width="140" height="90" fill="rgba(0,200,83,0.08)" stroke="#00c853" stroke-width="2"/>
  <!-- 윗면 (마름모꼴로) -->
  <polygon points="40,80 90,40 230,40 180,80" fill="rgba(79,172,254,0.08)" stroke="#4facfe" stroke-width="2"/>
  <!-- 오른쪽 면 -->
  <polygon points="180,80 230,40 230,130 180,170" fill="rgba(255,255,255,0.04)" stroke="#e0e0e0" stroke-width="2"/>
  <!-- 치수 선/라벨 -->
  <text x="95" y="175" fill="#00c853" font-size="13" font-family="Arial" font-weight="bold">가로 5cm</text>
  <text x="200" y="110" fill="#4facfe" font-size="12" font-family="Arial">높이 4cm</text>
  <text x="195" y="58" fill="#e0e0e0" font-size="12" font-family="Arial">세로 3cm</text>
  <text x="65" y="130" fill="#ffd740" font-size="14" font-family="Arial" font-weight="bold">V=60cm³</text>
</svg>`,
      caption: '직육면체 부피 = 가로 × 세로 × 높이 = 5×3×4 = 60cm³'
    },
    commonMistakes: [
      {
        wrong: '부피 = 60cm²',
        right: '부피 = 60cm³',
        reason: '부피의 단위는 세제곱(cm³, m³)입니다. cm²는 넓이 단위입니다.'
      },
      {
        wrong: '직육면체 부피 = 가로 × 세로 (2개만 곱함)',
        right: '직육면체 부피 = 가로 × 세로 × 높이 (3개를 곱함)',
        reason: '부피는 3차원이므로 세 변을 모두 곱해야 합니다.'
      },
      {
        wrong: '정육면체 부피 = 한 변 × 2',
        right: '정육면체 부피 = 한 변 × 한 변 × 한 변 = (한 변)³',
        reason: '정육면체도 세 변(모두 같은 길이)을 곱합니다.'
      }
    ],
    deepDive: {
      content: [
        '**단위 변환**: $1\\text{L} = 1000\\text{cm}^3$, $1\\text{m}^3 = 1{,}000{,}000\\text{cm}^3$',
        '**부피 최적화**: 같은 부피에서 모든 변의 길이가 같을수록(정육면체에 가까울수록) 겉넓이가 최소가 됩니다.',
        '**역산**: 부피 = 가로 × 세로 × 높이에서 한 변을 구하려면 나눕니다.'
      ],
      examples: [
        {
          problem: '부피가 $120\\text{cm}^3$이고 가로 4cm, 높이 5cm인 직육면체의 세로를 구하시오.',
          solution: [
            '부피 = 가로 × 세로 × 높이',
            '$120 = 4 \\times \\text{세로} \\times 5 = 20 \\times \\text{세로}$',
            '세로 = $120 \\div 20 = 6$(cm)',
            '정답: 6cm'
          ]
        }
      ]
    }
  },

  'e6-1-u6-c2': {
    svgDiagram: {
      svg: `<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
  <!-- 전개도: T자형 -->
  <!-- 위 밑면 -->
  <rect x="90" y="15" width="70" height="50" fill="rgba(255,215,64,0.3)" stroke="#ffd740" stroke-width="2"/>
  <text x="108" y="44" fill="#ffd740" font-size="11" font-family="Arial">윗면</text>
  <!-- 왼쪽 면 -->
  <rect x="15" y="65" width="70" height="70" fill="rgba(79,172,254,0.2)" stroke="#4facfe" stroke-width="2"/>
  <text x="35" y="104" fill="#4facfe" font-size="11" font-family="Arial">왼쪽면</text>
  <!-- 앞면 (가운데) -->
  <rect x="90" y="65" width="70" height="70" fill="rgba(0,200,83,0.2)" stroke="#00c853" stroke-width="2"/>
  <text x="110" y="104" fill="#00c853" font-size="11" font-family="Arial">앞면</text>
  <!-- 오른쪽 면 -->
  <rect x="165" y="65" width="70" height="70" fill="rgba(79,172,254,0.2)" stroke="#4facfe" stroke-width="2"/>
  <text x="180" y="104" fill="#4facfe" font-size="11" font-family="Arial">오른쪽면</text>
  <!-- 뒷면 -->
  <rect x="240" y="65" width="25" height="70" fill="rgba(255,82,82,0.15)" stroke="#ff5252" stroke-width="1.5" stroke-dasharray="4,2"/>
  <text x="241" y="104" fill="#ff5252" font-size="9" font-family="Arial">뒷면</text>
  <!-- 아래 밑면 -->
  <rect x="90" y="135" width="70" height="50" fill="rgba(255,215,64,0.3)" stroke="#ffd740" stroke-width="2"/>
  <text x="105" y="164" fill="#ffd740" font-size="11" font-family="Arial">아랫면</text>
</svg>`,
      caption: '사각기둥 전개도: 밑면 2개(노랑) + 옆면 4개(파랑·초록) = 6면'
    },
    commonMistakes: [
      {
        wrong: '겉넓이 = 한 면의 넓이 × 3',
        right: '겉넓이 = (세 쌍의 면 넓이 합) × 2',
        reason: '직육면체는 면이 6개(3쌍)이며, 각 쌍은 크기가 같으므로 ×2를 합니다.'
      },
      {
        wrong: '겉넓이 = 가로×세로×높이',
        right: '겉넓이 = 2×(가로×세로 + 세로×높이 + 가로×높이)',
        reason: '부피 공식과 혼동하지 않도록 주의합니다.'
      }
    ],
    deepDive: {
      content: [
        '**겉넓이 공식**: $S = 2(ab + bh + ah)$ (a=가로, b=세로, h=높이)',
        '**겉넓이 최소**: 같은 부피에서 정육면체(모든 변 같음)일 때 겉넓이가 최소입니다.',
        '**포장지 계산**: 실제 포장에는 겹치는 부분(여유분)을 추가해야 합니다.'
      ],
      examples: [
        {
          problem: '가로 6cm, 세로 4cm, 높이 3cm인 직육면체의 겉넓이를 구하시오.',
          solution: [
            '앞뒤 면: $6 \\times 3 \\times 2 = 36\\text{cm}^2$',
            '좌우 면: $4 \\times 3 \\times 2 = 24\\text{cm}^2$',
            '위아래 면: $6 \\times 4 \\times 2 = 48\\text{cm}^2$',
            '겉넓이 = $36 + 24 + 48 = 108\\text{cm}^2$',
            '정답: $108\\text{cm}^2$'
          ]
        }
      ]
    }
  }
};

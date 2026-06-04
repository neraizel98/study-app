// MathDataExtra.js — 6학년 1·2학기 심화 콘텐츠
// 자동 생성: MathDataExtra_s1.js + MathDataExtra_s2.js 병합
var MathDataExtra = {
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
  },
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

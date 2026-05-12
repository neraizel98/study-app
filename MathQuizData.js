var MathQuizData = {
    // v6-2-v1
    // 1단원. 분수의 나눗셈
    "e6-1-u1": {
        basic: Array(15).fill({ type: "dynamic", generator: "fraction_div_int_basic", difficulty: "easy" }),
        advanced: Array(10).fill({ type: "dynamic", generator: "fraction_div_int_advanced", difficulty: "medium" }),
        word: Array(10).fill({ type: "dynamic", generator: "math_word_problem", difficulty: "medium" })
    },

    // 2단원. 각기둥과 각뿔
    "e6-1-u2": {
        basic: Array(15).fill({ type: "dynamic", generator: "poly_edge_count", difficulty: "easy" }),
        advanced: [
            { type: "dynamic", generator: "poly_edge_count", difficulty: "medium" },
            { type: "dynamic", generator: "poly_edge_count", difficulty: "medium" },
            { type: "dynamic", generator: "poly_edge_count", difficulty: "medium" },
            { type: "dynamic", generator: "poly_edge_count", difficulty: "medium" },
            { type: "dynamic", generator: "poly_edge_count", difficulty: "medium" },
            { question: "옆면이 7개인 각기둥의 꼭짓점의 수는?", choices: ["14개", "7개", "21개", "9개"], answer: 0, explanation: "옆면이 7개면 칠각기둥이므로, 꼭짓점은 $7 \\times 2 = 14$개", difficulty: "medium" },
            { question: "모든 모서리의 길이가 5cm로 같은 육각기둥의 모서리 총합은?", choices: ["90cm", "60cm", "30cm", "120cm"], answer: 0, explanation: "모서리 개수 $18 \\times 5 = 90cm$", difficulty: "medium" }
        ],
        word: [
            { type: "dynamic", generator: "poly_edge_count", difficulty: "hard" },
            {
                question: "수민이는 미술 시간에 찰흙을 동그랗게 빚어 구슬을 만들고, 얇은 나무꼬치를 이어서 입체도형의 뼈대를 만들었습니다. 사용된 찰흙 구슬은 총 10개였고, 사용한 나무꼬치의 개수는 정확히 꼭짓점 수보다 5개 더 많았습니다. 수민이가 만든 도형은?",
                choices: ["오각기둥", "사각기둥", "구각뿔", "삼각기둥"],
                answer: 0,
                explanation: "꼭짓점이 10개, 모서리가 15개인 도형은 $n=5$인 오각기둥입니다.",
                difficulty: "medium"
            }
        ]
    },

    // 3단원. 소수의 나눗셈
    "e6-1-u3": {
        basic: Array(20).fill({ type: "dynamic", generator: "decimal_div_int_basic", difficulty: "easy" }),
        advanced: Array(10).fill({ type: "dynamic", generator: "decimal_div_int_basic", difficulty: "medium" }),
        word: Array(10).fill({ type: "dynamic", generator: "math_word_problem", difficulty: "medium" })
    },

    // 4단원. 비와 비율
    "e6-1-u4": {
        basic: Array(20).fill({ type: "dynamic", generator: "ratio_percentage_basic", difficulty: "easy" }),
        advanced: [
            { type: "dynamic", generator: "ratio_percentage_basic", difficulty: "medium" },
            { question: "어느 야구팀의 올 시즌 승률이 $60\\%$ 입니다. 이 팀이 총 20경기를 치렀다면, 승리한 경기는 몇 경기입니까?", choices: ["$12$경기", "$6$경기", "$14$경기", "$8$경기"], answer: 0, explanation: "승리한 경기 수 = $20 \\times 0.6 = 12$경기 입니다.", difficulty: "medium" },
            { question: "상자 안에 사과가 300개 들어있는데, 그 중 $15\\%$가 상했습니다. 상한 사과는 몇 개입니까?", choices: ["$45$개", "$15$개", "$30$개", "$50$개"], answer: 0, explanation: "$300 \\times 0.15 = 45$개 입니다.", difficulty: "medium" }
        ],
        word: Array(10).fill({ type: "dynamic", generator: "math_word_problem", difficulty: "medium" })
    },

    // 5단원. 여러 가지 그래프
    "e6-1-u5": {
        basic: Array(15).fill({ type: "dynamic", generator: "graph_percentage_problem", difficulty: "easy" }),
        advanced: Array(10).fill({ type: "dynamic", generator: "graph_value_problem", difficulty: "medium" }),
        word: Array(5).fill({ type: "dynamic", generator: "math_word_problem", difficulty: "medium" })
    },

    // 6단원. 직육면체의 부피와 겉넓이
    "e6-1-u6": {
        basic: Array(15).fill({ type: "dynamic", generator: "volume_calculation", difficulty: "easy" }),
        advanced: Array(10).fill({ type: "dynamic", generator: "surface_area_calculation", difficulty: "medium" }),
        word: Array(10).fill({ type: "dynamic", generator: "math_word_problem", difficulty: "medium" })
    },
    // =============================================
    // [6학년 2학기]
    // =============================================

    // 1단원. 분수의 나눗셈
    "e6-2-u1": {
        basic: Array(15).fill({ type: "dynamic", generator: "frac_div_frac_basic", difficulty: "easy" }),
        advanced: Array(10).fill({ type: "dynamic", generator: "frac_div_frac_basic", difficulty: "medium" }),
        word: Array(10).fill({ type: "dynamic", generator: "math_word_problem", difficulty: "medium" })
    },

    // 2단원. 소수의 나눗셈
    "e6-2-u2": {
        basic: Array(15).fill({ type: "dynamic", generator: "decimal_div_decimal_basic", difficulty: "easy" }),
        advanced: Array(10).fill({ type: "dynamic", generator: "decimal_div_decimal_basic", difficulty: "medium" }),
        word: Array(10).fill({ type: "dynamic", generator: "math_word_problem", difficulty: "medium" })
    },

    // 3단원. 공간과 입체
    "e6-2-u3": {
        basic: [
            { question: "쌓기나무 5개로 만든 모양을 위에서 보았을 때 3칸이라면, 1층에 놓인 쌓기나무는 몇 개입니까?", choices: ["3개", "5개", "2개", "4개"], answer: 0, explanation: "위에서 본 모양의 칸 수는 1층에 놓인 쌓기나무의 개수와 같습니다.", difficulty: "easy" },
            { question: "앞에서 보았을 때 3층, 옆에서 보았을 때 2층인 모양이 있습니다. 이 모양의 전체 높이는 몇 층입니까?", choices: ["3층", "2층", "5층", "1층"], answer: 0, explanation: "앞, 옆, 위 어디서든 가장 높은 층이 전체 높이가 됩니다.", difficulty: "easy" }
        ],
        advanced: [
            { question: "쌓기나무로 만든 모양의 위, 앞, 옆 모양이 모두 'ㄱ'자 모양(3칸)입니다. 사용된 쌓기나무의 최소 개수는?", choices: ["4개", "3개", "5개", "6개"], answer: 0, explanation: "직접 그려보며 추론하면 최소 4개가 필요함을 알 수 있습니다.", difficulty: "medium" }
        ],
        word: [
            { question: "우준이는 쌓기나무 8개를 사용하여 입체도형을 만들었습니다. 위에서 본 모양이 4칸일 때, 한 줄에 가장 많이 쌓인 나무는 최대 몇 개일 수 있습니까?", choices: ["5개", "4개", "8개", "2개"], answer: 0, explanation: "바닥에 4개를 깔고 남은 4개를 한 곳에 모두 쌓으면 $1+4=5$층이 됩니다.", difficulty: "medium" }
        ]
    },

    // 4단원. 비례식과 비례배분
    "e6-2-u4": {
        basic: Array(15).fill({ type: "dynamic", generator: "proportion_basic", difficulty: "easy" }),
        advanced: Array(10).fill({ type: "dynamic", generator: "proportion_basic", difficulty: "medium" }),
        word: Array(10).fill({ type: "dynamic", generator: "math_word_problem", difficulty: "medium" })
    },

    // 5단원. 원의 넓이
    "e6-2-u5": {
        basic: Array(15).fill({ type: "dynamic", generator: "circle_area_basic", difficulty: "easy" }),
        advanced: Array(10).fill({ type: "dynamic", generator: "circle_area_basic", difficulty: "medium" }),
        word: Array(10).fill({ type: "dynamic", generator: "circle_area_basic", difficulty: "hard" })
    },

    // 6단원. 원기둥, 원뿔, 구
    "e6-2-u6": {
        basic: Array(15).fill({ type: "dynamic", generator: "cylinder_volume_basic", difficulty: "easy" }),
        advanced: Array(10).fill({ type: "dynamic", generator: "cylinder_volume_basic", difficulty: "medium" }),
        word: Array(10).fill({ type: "dynamic", generator: "cylinder_volume_basic", difficulty: "hard" })
    }
};


if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathQuizData;
}

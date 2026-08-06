(function () {
    const contextItems = {
        'library-light': {
            word: '효율', choices: ['효율', '소음', '습도', '속도'],
            meaning: '들인 노력이나 자원에 비해 얻는 결과의 정도'
        },
        'bee-signal': {
            word: '의사소통', choices: ['의사소통', '광합성', '보호색', '겨울잠'],
            meaning: '생각이나 정보를 서로 주고받는 일'
        },
        'sleep-memory': {
            word: '안정적으로', choices: ['안정적으로', '우연히', '급격하게', '일시적으로'],
            meaning: '쉽게 흔들리거나 변하지 않는 상태로'
        },
        'hong-gildong': {
            word: '모순', choices: ['모순', '화합', '질서', '풍요'],
            meaning: '앞뒤가 맞지 않거나 서로 어긋나는 상태'
        },
        'sim-cheong': {
            word: '관습', choices: ['관습', '발명', '예측', '계약'],
            meaning: '한 사회에서 오랫동안 이어져 온 생활 방식이나 습관'
        },
        'sonagi-guide': {
            word: '섬세하게', choices: ['섬세하게', '거칠게', '단순하게', '성급하게'],
            meaning: '작고 미묘한 부분까지 세밀하게'
        },
        'after-rain': {
            word: '계주', choices: ['계주', '축구', '높이뛰기', '줄다리기'],
            meaning: '여러 주자가 일정한 거리를 이어 달리는 경기'
        },
        'moon-poem': {
            word: '걱정', choices: ['걱정', '자랑', '분노', '기대'],
            meaning: '마음이 편하지 않고 염려되는 상태'
        },
        'plastic-loop': {
            word: '미세 플라스틱', choices: ['미세 플라스틱', '천연 섬유', '수증기', '모래 알갱이'],
            meaning: '크기가 매우 작은 플라스틱 조각'
        },
        'media-title': {
            word: '왜곡', choices: ['왜곡', '요약', '인용', '분류'],
            meaning: '사실과 다르게 비틀어 나타냄'
        },
        'community-garden': {
            word: '공동체', choices: ['공동체', '경쟁자', '관찰자', '소비자'],
            meaning: '생활이나 목적을 함께하며 서로 연결된 집단'
        },
        'chicago-reform': {
            word: '종합', choices: ['종합', '분리', '생략', '모방'],
            meaning: '여러 내용을 한데 모아 전체로 묶음'
        },
        'deep-reading-five': {
            word: '근거', choices: ['근거', '소문', '기분', '우연'],
            meaning: '어떤 생각이나 판단이 옳다고 뒷받침하는 까닭이나 자료'
        },
        'knowledge-judgment': {
            word: '보완', choices: ['보완', '방해', '제거', '반복'],
            meaning: '모자라거나 부족한 부분을 채워 더 완전하게 함'
        },
        'socrates-question': {
            word: '모순', choices: ['모순', '결론', '사례', '순서'],
            meaning: '두 생각이나 말이 서로 맞지 않아 함께 참일 수 없는 상태'
        },
        'plato-cave': {
            word: '탐구', choices: ['탐구', '포기', '망각', '모방'],
            meaning: '문제를 깊이 파고들어 이치나 사실을 알아봄'
        },
        'aristotle-habit': {
            word: '무모함', choices: ['무모함', '신중함', '정직함', '다정함'],
            meaning: '앞뒤를 충분히 살피지 않고 함부로 행동하는 성질'
        },
        'confucius-practice': {
            word: '배려', choices: ['배려', '경쟁', '변명', '복종'],
            meaning: '다른 사람의 처지와 마음을 생각하여 보살핌'
        },
        'theseus-ship': {
            word: '정체성', choices: ['정체성', '속도', '가격', '방향'],
            meaning: '다른 것과 구별되는 그 존재만의 성질'
        },
        'plato-justice-ring': {
            word: '욕망', choices: ['욕망', '기억', '질서', '약속'],
            meaning: '무엇을 얻거나 이루고 싶어 하는 강한 마음'
        },
        'hunmin-creation': {
            word: '의의', choices: ['의의', '모양', '순서', '속도'],
            meaning: '어떤 사실이나 일이 지니는 가치와 중요성'
        },
        'silk-roads-network': {
            word: '교류망', choices: ['교류망', '방어선', '경계선', '일방통행'],
            meaning: '여러 지역이 물건·정보·문화를 주고받도록 이어진 관계'
        },
        'daedong-law': {
            word: '폐단', choices: ['폐단', '장점', '원칙', '기회'],
            meaning: '어떤 제도나 일에서 나타나는 좋지 않은 문제점'
        },
        'industrial-two-faces': {
            word: '동원', choices: ['동원', '보호', '해방', '휴식'],
            meaning: '사람이나 물자를 어떤 목적에 쓰도록 불러 모음'
        },
        'donghak-gabo': {
            word: '횡포', choices: ['횡포', '배려', '협력', '절약'],
            meaning: '힘을 믿고 제멋대로 행동하며 남을 괴롭힘'
        },
        'udhr-making': {
            word: '보편적', choices: ['보편적', '일시적', '개인적', '우연한'],
            meaning: '일부에만 한정되지 않고 모든 경우에 두루 적용되는'
        },
        'rabbit-court': {
            word: '재치', choices: ['재치', '고집', '허영', '욕심'],
            meaning: '상황에 맞게 슬기롭고 빠르게 대처하는 능력'
        }
    };

    const idioms = [
        ['유비무환', '미리 준비하면 걱정할 일이 없다.'],
        ['전화위복', '나쁜 일이 오히려 좋은 결과로 바뀐다.'],
        ['일석이조', '한 가지 일로 두 가지 이익을 얻는다.'],
        ['동문서답', '묻는 말과 전혀 관계없는 대답을 한다.'],
        ['설상가상', '어려운 일 위에 또 어려운 일이 생긴다.'],
        ['과유불급', '지나친 것은 모자란 것만큼 좋지 않다.'],
        ['새옹지마', '좋고 나쁜 일은 쉽게 예측할 수 없다.'],
        ['백문불여일견', '여러 번 듣는 것보다 한 번 직접 보는 것이 낫다.']
    ];

    const normalize = value => String(value).normalize('NFC').trim();

    function contextQuestion(passage) {
        const item = contextItems[passage.id];
        if (!item) return null;
        const sourceLine = passage.lines.find(line => normalize(line).includes(normalize(item.word)));
        if (!sourceLine) return null;
        const blanked = sourceLine.replace(item.word, '______');
        return {
            id: `vocab-${passage.id}`,
            skill: '문맥 어휘',
            question: `다음 문장의 빈칸에 들어갈 말로 가장 알맞은 것은?\n“${blanked}”`,
            choices: item.choices,
            answer: item.word,
            evidence: `문맥에서 ‘${item.word}’은(는) ‘${item.meaning}’이라는 뜻으로 쓰였다.`,
            difficulty: 'foundation',
            vocabularyType: 'context'
        };
    }

    function idiomQuestions() {
        const meanings = idioms.map(item => item[1]);
        return idioms.map(([idiom, meaning], index) => {
            const distractors = [1, 3, 5].map(offset => meanings[(index + offset) % meanings.length]);
            return {
                id: `idiom-${index + 1}`,
                skill: '사자성어',
                question: `사자성어 ‘${idiom}’의 뜻으로 가장 알맞은 것은?`,
                choices: [meaning, ...distractors],
                answer: meaning,
                evidence: `‘${idiom}’은(는) ${meaning}`,
                difficulty: index < 4 ? 'foundation' : 'standard',
                vocabularyType: 'idiom',
                vocabulary: idiom
            };
        });
    }

    const idiomPool = idiomQuestions();

    window.ReadingVocabulary = {
        getQuestions(passage) {
            const context = contextQuestion(passage);
            return [
                ...(context ? [context] : []),
                ...idiomPool.map(item => ({
                    ...item,
                    id: `${item.id}-${passage.id}`,
                    choices: [...item.choices]
                }))
            ];
        },
        contextItems,
        idioms
    };
})();

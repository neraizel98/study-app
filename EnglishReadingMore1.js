// 영어 독해 추가 지문 · 단원 er1~er2
(function () {
    const unit = id => window.EnglishReadingData.units.find(item => item.id === id);
    const source = () => ({ kind: 'original', note: '스마트 스터디 자체 제작' });
    const q = (id, type, prompt, promptKo, choices, answerIndex, explanation, evidence) => ({ id, type, prompt, promptKo, choices, answerIndex, explanation, evidence });

    unit('er1').passages.push({
        id: 'er1-p4', title: 'The Rabbit in the Moon', topic: '보름달 속 토끼 모양', band: 0,
        sentences: [
            'Tonight, Ben and his dad sit outside in the yard.',
            'The moon is big and round in the sky.',
            'Ben can see some dark spots on the moon.',
            'In Korea, many people say the spots look like a rabbit.',
            'Ben looks again and finds the rabbit’s long ears.',
            'He smiles and draws the rabbit in his notebook.'
        ],
        translations: [
            '오늘 밤, 벤과 아빠는 마당에 나가 앉아 있습니다.',
            '하늘에 뜬 달은 크고 둥급니다.',
            '벤은 달에서 어두운 얼룩 몇 개를 볼 수 있습니다.',
            '한국에서는 많은 사람이 그 얼룩이 토끼처럼 보인다고 말합니다.',
            '벤은 다시 보고 토끼의 긴 귀를 찾아냅니다.',
            '벤은 미소를 지으며 공책에 토끼를 그립니다.'
        ],
        vocabulary: [{ word: 'yard', meaning: '마당' }, { word: 'round', meaning: '둥근' }, { word: 'spot', meaning: '얼룩, 점' }, { word: 'look like', meaning: '~처럼 보이다' }, { word: 'rabbit', meaning: '토끼' }, { word: 'ear', meaning: '귀' }],
        grammarTags: ['e3', 'e5'],
        grammarRefs: [{ stageId: 'elementary', unitId: 'e3', lessonIndex: 0 }],
        grammarNotes: [{ title: '3인칭 단수 현재형', text: '주어가 Ben이나 He일 때 현재형 동사에 -s를 붙여 looks, finds, draws처럼 씁니다.' }, { title: 'can + 동사원형', text: 'Ben can see는 ‘벤은 볼 수 있다’라는 뜻으로, can 뒤에는 동사원형이 옵니다.' }],
        questions: [
            q('er1-p4-q1', 'fact', 'What does the moon look like tonight?', '오늘 밤 달은 어떤 모양인가요?', ['big and round', 'thin and curved', 'a half circle', 'hidden by clouds'], 0, '두 번째 문장에 달이 크고 둥글다고 나옵니다.', [1]),
            q('er1-p4-q2', 'main', 'What is the passage mainly about?', '이 글은 주로 무엇에 관한 글인가요?', ['Ben and his dad clean up the whole yard.', 'Ben buys a new notebook.', 'Ben finds a rabbit shape on the moon.', 'Ben’s dad tells a story about stars.'], 2, '벤이 달의 어두운 얼룩에서 토끼 모양을 찾아 그리는 이야기입니다.', [2, 3, 4, 5]),
            q('er1-p4-q3', 'vocabulary', 'What does “spots” mean in sentence 3?', '3번 문장에서 “spots”는 무슨 뜻인가요?', ['clouds that cover the sky', 'areas of a different color', 'sounds in the dark yard', 'pictures in a notebook'], 1, 'spots는 주변과 색이 다른 작은 부분, 즉 얼룩을 뜻합니다.', [2]),
            q('er1-p4-q4', 'reference', 'Who does “He” in sentence 6 refer to?', '6번 문장의 “He”는 누구를 가리키나요?', ['the rabbit', 'Ben’s dad', 'the moon', 'Ben'], 3, '앞 문장에서 다시 보고 토끼 귀를 찾은 사람은 벤이므로 He는 벤입니다.', [4, 5]),
            q('er1-p4-q5', 'evidence', 'Which sentence shows that Ben records what he sees?', '벤이 본 것을 기록한다는 것을 보여 주는 문장은 무엇인가요?', ['Sentence 1', 'Sentence 3', 'Sentence 5', 'Sentence 6'], 3, '여섯 번째 문장에서 벤이 공책에 토끼를 그리며 본 것을 기록합니다.', [5])
        ],
        source: source()
    }, {
        id: 'er1-p5', title: 'A Moon in the Daytime', topic: '낮에 보이는 달', band: 1,
        sentences: [
            'On Tuesday afternoon, Hana sees a pale moon above her school.',
            'She is surprised because she thought the moon came out only at night.',
            'Her teacher explains that the moon is often in the sky during the day.',
            'We often do not notice it because sunlight makes the whole sky bright.',
            'The moon looks pale in the daytime, but it still reflects sunlight.',
            'After school, Hana points to the moon and shows it to her little brother.',
            'Now they look for the daytime moon whenever the sky is clear.'
        ],
        translations: [
            '화요일 오후, 하나는 학교 위에 뜬 희미한 달을 봅니다.',
            '달은 밤에만 뜬다고 생각했기 때문에 하나는 깜짝 놀랍니다.',
            '선생님은 낮에도 달이 하늘에 떠 있을 때가 많다고 설명하십니다.',
            '햇빛이 하늘 전체를 밝게 만들기 때문에 우리는 달을 알아차리지 못할 때가 많습니다.',
            '낮에는 달이 희미해 보이지만, 그래도 여전히 햇빛을 반사하고 있습니다.',
            '방과 후에 하나는 달을 가리키며 남동생에게 보여 줍니다.',
            '이제 두 사람은 하늘이 맑을 때마다 낮달을 찾아봅니다.'
        ],
        vocabulary: [{ word: 'pale', meaning: '희미한, 옅은' }, { word: 'surprised', meaning: '놀란' }, { word: 'daytime', meaning: '낮, 낮 시간' }, { word: 'notice', meaning: '알아차리다' }, { word: 'reflect', meaning: '반사하다' }, { word: 'whenever', meaning: '~할 때마다' }, { word: 'clear', meaning: '맑은' }],
        grammarTags: ['e6', 'e3'],
        grammarRefs: [{ stageId: 'elementary', unitId: 'e6', lessonIndex: 1 }],
        grammarNotes: [{ title: '접속사 because와 but', text: 'because는 이유를, but은 앞 내용과 반대되는 내용을 이어 줍니다. 4번 문장은 달을 알아차리지 못하는 이유를 because로 설명합니다.' }],
        questions: [
            q('er1-p5-q1', 'fact', 'Where does Hana see the moon?', '하나는 달을 어디에서 보나요?', ['behind her house', 'above her school', 'over the river', 'next to the library'], 1, '첫 문장에 하나가 학교 위에 뜬 달을 본다고 나옵니다.', [0]),
            q('er1-p5-q2', 'main', 'What is the main idea of the passage?', '이 글의 중심 생각은 무엇인가요?', ['Hana and her little brother walk home after school.', 'The moon makes its own light at noon.', 'The moon can often be seen during the day.', 'Hana’s teacher likes cloudy skies.'], 2, '하나가 낮달을 보고, 달이 낮에도 하늘에 자주 떠 있다는 것을 알게 되는 글입니다.', [0, 2, 6]),
            q('er1-p5-q3', 'vocabulary', 'What does “pale” mean in sentence 1?', '1번 문장에서 “pale”은 무슨 뜻인가요?', ['very large and round', 'moving very quickly', 'hidden behind clouds', 'not strong in color'], 3, 'pale은 색이 진하지 않고 옅다는 뜻으로, 낮에 희미하게 보이는 달을 묘사합니다.', [0, 4]),
            q('er1-p5-q4', 'reference', 'What does “it” in sentence 4 refer to?', '4번 문장의 “it”은 무엇을 가리키나요?', ['the moon', 'the sunlight', 'the sky', 'the school'], 0, '낮에 하늘에 떠 있는 달을 우리가 알아차리지 못한다는 뜻이므로 it은 달입니다.', [2, 3]),
            q('er1-p5-q5', 'evidence', 'Which sentence explains why the daytime moon is hard to notice?', '낮달을 알아차리기 어려운 이유를 설명하는 문장은 무엇인가요?', ['Sentence 2', 'Sentence 3', 'Sentence 4', 'Sentence 6'], 2, '네 번째 문장이 햇빛 때문에 하늘 전체가 밝아서 달을 알아차리기 어렵다고 설명합니다.', [3])
        ],
        source: source()
    }, {
        id: 'er1-p6', title: 'The Side We Always See', topic: '늘 같은 면을 보이는 달', band: 1,
        sentences: [
            'Every month, Yuri draws the full moon on a large sheet of paper.',
            'When she puts the drawings side by side, the dark spots are always in the same places.',
            'Her uncle tells her that the moon always shows the same side to Earth.',
            'The moon spins around once while it travels once around Earth.',
            'Because of this, most of the other side of the moon cannot be seen from Earth.',
            'Spacecraft took photos of that hidden side many years ago.',
            'Now Yuri wants to find those photos in a science book.'
        ],
        translations: [
            '유리는 매달 커다란 종이에 보름달을 그립니다.',
            '그림들을 나란히 놓아 보면 어두운 얼룩이 언제나 같은 자리에 있습니다.',
            '삼촌은 달이 늘 지구 쪽으로 같은 면을 보인다고 말해 줍니다.',
            '달은 지구 둘레를 한 바퀴 도는 동안 스스로 한 바퀴 돕니다.',
            '이 때문에 지구에서는 달 반대쪽 면의 대부분을 볼 수 없습니다.',
            '오래전에 우주선이 그 숨겨진 면의 사진을 찍었습니다.',
            '이제 유리는 과학책에서 그 사진들을 찾아보고 싶어 합니다.'
        ],
        vocabulary: [{ word: 'full moon', meaning: '보름달' }, { word: 'side by side', meaning: '나란히' }, { word: 'side', meaning: '면, 쪽' }, { word: 'spin', meaning: '회전하다, 돌다' }, { word: 'travel around', meaning: '~의 둘레를 돌다' }, { word: 'spacecraft', meaning: '우주선' }, { word: 'hidden', meaning: '숨겨진' }],
        grammarTags: ['e6', 'e3'],
        grammarRefs: [{ stageId: 'elementary', unitId: 'e6', lessonIndex: 1 }],
        grammarNotes: [{ title: '접속사 when과 while', text: 'when은 ‘~할 때’, while은 ‘~하는 동안’이라는 뜻으로 두 일이 일어나는 시간을 이어 줍니다.' }, { title: 'Because of this', text: 'Because of this는 ‘이 때문에’라는 뜻으로, 앞 문장의 내용이 원인이 되어 생긴 결과를 말할 때 씁니다.' }],
        questions: [
            q('er1-p6-q1', 'fact', 'What does Yuri notice in her drawings?', '유리는 자기 그림에서 무엇을 알아차리나요?', ['The moon gets bigger each month.', 'The dark spots stay in the same places.', 'The dark spots move a little every month.', 'The full moon has no dark spots.'], 1, '두 번째 문장에 그림을 나란히 놓으면 어두운 얼룩이 늘 같은 자리에 있다고 나옵니다.', [1]),
            q('er1-p6-q2', 'main', 'What does the passage mainly explain?', '이 글은 주로 무엇을 설명하나요?', ['How Yuri’s uncle takes photos in space', 'Where Yuri keeps her drawings of the moon', 'Why we always see the same side of the moon', 'Why the moon looks full on every single night'], 2, '달이 늘 같은 면을 보이는 이유와 그 결과를 설명하는 글입니다.', [2, 3, 4]),
            q('er1-p6-q3', 'vocabulary', 'What does “spins” mean in sentence 4?', '4번 문장에서 “spins”는 무슨 뜻인가요?', ['stops moving for a while', 'shines more brightly', 'turns around and around', 'falls toward the ground'], 2, 'spin은 제자리에서 빙글빙글 돈다는 뜻입니다.', [3]),
            q('er1-p6-q4', 'reference', 'What does “that hidden side” in sentence 6 refer to?', '6번 문장의 “that hidden side”는 무엇을 가리키나요?', ['the side of Earth where we live', 'the back of Yuri’s large sheet of paper', 'the dark spots in the drawings', 'the side of the moon we cannot see'], 3, '앞 문장에서 지구에서는 볼 수 없다고 한 달의 반대쪽 면을 가리킵니다.', [4, 5]),
            q('er1-p6-q5', 'evidence', 'Which sentence gives the reason we always see the same side of the moon?', '우리가 늘 달의 같은 면을 보는 이유를 알려 주는 문장은 무엇인가요?', ['Sentence 2', 'Sentence 4', 'Sentence 5', 'Sentence 6'], 1, '네 번째 문장이 달이 지구를 한 바퀴 도는 동안 스스로도 한 바퀴 돈다는 이유를 밝힙니다. 5번 문장은 그 결과입니다.', [3])
        ],
        source: source()
    }, {
        id: 'er1-p7', title: 'The Night the Moon Turned Red', topic: '개기월식 관찰', band: 2,
        sentences: [
            'Last night, Minho stayed up late because his family wanted to watch a total lunar eclipse.',
            'A lunar eclipse happens when Earth is directly between the sun and the moon.',
            'At that time, Earth’s shadow falls on the moon, so the moon slowly grows darker.',
            'While Minho was watching, the moon did not disappear completely.',
            'Instead, it turned a dark orange-red color.',
            'His mother explained that some sunlight passes through Earth’s air and still reaches the moon.',
            'Red light gets through the air more easily than blue light, so the moon looks red.',
            'Unlike a solar eclipse, a lunar eclipse is safe to watch with your eyes.',
            'Before he went to bed, Minho wrote the start and end times in his moon journal.'
        ],
        translations: [
            '가족이 개기월식을 보고 싶어 해서 민호는 어젯밤 늦게까지 깨어 있었습니다.',
            '월식은 지구가 태양과 달 사이에 정확히 놓일 때 일어납니다.',
            '그때 지구의 그림자가 달에 드리워져서 달이 서서히 어두워집니다.',
            '민호가 지켜보는 동안 달은 완전히 사라지지 않았습니다.',
            '대신 달은 짙은 주황빛이 도는 붉은색으로 변했습니다.',
            '어머니는 햇빛의 일부가 지구의 공기를 통과해 여전히 달에 닿는다고 설명해 주셨습니다.',
            '붉은빛은 푸른빛보다 공기를 더 쉽게 통과하기 때문에 달이 붉게 보입니다.',
            '일식과 달리 월식은 맨눈으로 보아도 안전합니다.',
            '잠자리에 들기 전, 민호는 월식이 시작하고 끝난 시각을 달 관찰 일지에 적었습니다.'
        ],
        vocabulary: [{ word: 'lunar eclipse', meaning: '월식' }, { word: 'shadow', meaning: '그림자' }, { word: 'disappear', meaning: '사라지다' }, { word: 'completely', meaning: '완전히' }, { word: 'instead', meaning: '대신에' }, { word: 'unlike', meaning: '~와 달리' }, { word: 'solar eclipse', meaning: '일식' }, { word: 'journal', meaning: '일지, 기록장' }],
        grammarTags: ['e4', 'e6'],
        grammarRefs: [{ stageId: 'elementary', unitId: 'e4', lessonIndex: 0 }],
        grammarNotes: [{ title: '일반동사의 과거형', text: '어젯밤에 끝난 일이므로 stayed, turned, explained, wrote처럼 과거형을 씁니다. 월식의 원리처럼 늘 사실인 내용은 현재형으로 씁니다.' }, { title: '접속사 so와 while', text: 'so는 ‘그래서’라는 결과를, while은 ‘~하는 동안’이라는 시간을 나타냅니다.' }],
        questions: [
            q('er1-p7-q1', 'fact', 'What color did the moon turn during the eclipse?', '월식 동안 달은 무슨 색으로 변했나요?', ['pale blue', 'bright white', 'dark orange-red', 'completely black'], 2, '다섯 번째 문장에 달이 짙은 주황빛 붉은색으로 변했다고 나옵니다.', [4]),
            q('er1-p7-q2', 'main', 'What is the passage mainly about?', '이 글은 주로 무엇에 관한 글인가요?', ['How Minho’s family plans a long trip to see the sun', 'What happens to the moon during a lunar eclipse', 'Why Minho likes to stay up late on weekends', 'Why the moon makes its own red light at night'], 1, '민호가 월식을 관찰하며 달이 어두워지고 붉게 변하는 과정과 그 이유를 알게 되는 글입니다.', [1, 2, 4, 6]),
            q('er1-p7-q3', 'vocabulary', 'What does “shadow” mean in sentence 3?', '3번 문장에서 “shadow”는 무슨 뜻인가요?', ['a dark area where light is blocked', 'a bright beam of light from the sun', 'a thin layer of clouds in the sky', 'a round path that the moon follows'], 0, 'shadow는 빛이 가려져서 생기는 어두운 부분, 즉 그림자입니다.', [2]),
            q('er1-p7-q4', 'reference', 'What does “it” in sentence 5 refer to?', '5번 문장의 “it”은 무엇을 가리키나요?', ['Earth', 'the shadow', 'the sun', 'the moon'], 3, '앞 문장에서 완전히 사라지지 않았다고 한 달이 붉게 변한 것이므로 it은 달입니다.', [3, 4]),
            q('er1-p7-q5', 'evidence', 'Which two sentences explain why the moon looked red?', '달이 붉게 보인 이유를 설명하는 두 문장은 무엇인가요?', ['Sentences 2 and 3', 'Sentences 4 and 5', 'Sentences 6 and 7', 'Sentences 8 and 9'], 2, '6번 문장은 햇빛 일부가 지구의 공기를 지나 달에 닿는다고, 7번 문장은 그중 붉은빛이 더 잘 통과한다고 설명합니다.', [5, 6])
        ],
        source: source()
    });

    unit('er2').passages.push({
        id: 'er2-p4', title: 'Pizza Friday', topic: '가족이 함께 만드는 저녁', band: 0,
        sentences: [
            'Every Friday, my family makes pizza at home.',
            'My mom rolls out the dough on the table.',
            'My little brother puts cheese on the dough.',
            'I cut the green peppers with my dad’s help.',
            'Then Dad puts the pizza in the hot oven.',
            'We eat it together and talk about our week.'
        ],
        translations: [
            '금요일마다 우리 가족은 집에서 피자를 만듭니다.',
            '엄마는 식탁 위에서 반죽을 밀어 폅니다.',
            '남동생은 반죽 위에 치즈를 올립니다.',
            '나는 아빠의 도움을 받아 피망을 자릅니다.',
            '그다음 아빠가 피자를 뜨거운 오븐에 넣습니다.',
            '우리는 피자를 함께 먹으며 한 주 동안 있었던 일을 이야기합니다.'
        ],
        vocabulary: [{ word: 'dough', meaning: '반죽' }, { word: 'roll out', meaning: '밀어 펴다' }, { word: 'cheese', meaning: '치즈' }, { word: 'green pepper', meaning: '피망' }, { word: 'oven', meaning: '오븐' }, { word: 'together', meaning: '함께' }],
        grammarTags: ['e3', 'e6'],
        grammarRefs: [{ stageId: 'elementary', unitId: 'e3', lessonIndex: 0 }],
        grammarNotes: [{ title: '3인칭 단수 현재형', text: 'my family, My mom, Dad처럼 한 사람이나 하나의 무리가 주어이면 makes, rolls, puts처럼 -s를 붙이고, I와 We 뒤에서는 cut, eat처럼 동사원형을 씁니다.' }],
        questions: [
            q('er2-p4-q1', 'fact', 'Who puts cheese on the dough?', '누가 반죽 위에 치즈를 올리나요?', ['the writer’s mother', 'the writer’s father', 'the writer', 'the little brother'], 3, '세 번째 문장에 남동생이 반죽 위에 치즈를 올린다고 나옵니다.', [2]),
            q('er2-p4-q2', 'main', 'What is the passage mainly about?', '이 글은 주로 무엇에 관한 글인가요?', ['A family buys pizza at a store.', 'Dad fixes the broken oven in the kitchen.', 'A family makes a meal and eats together.', 'Mom teaches a cooking class on Friday.'], 2, '가족이 함께 피자를 만들고 같이 먹으며 이야기하는 내용입니다.', [0, 5]),
            q('er2-p4-q3', 'vocabulary', 'What does “dough” mean in sentence 2?', '2번 문장에서 “dough”는 무슨 뜻인가요?', ['a hot box that we use for baking', 'a soft mix of flour and water', 'a kind of green vegetable', 'a thin slice of cheese'], 1, 'dough는 밀가루와 물을 섞어 만든 부드러운 반죽입니다.', [1, 2]),
            q('er2-p4-q4', 'reference', 'What does “it” in sentence 6 refer to?', '6번 문장의 “it”은 무엇을 가리키나요?', ['the pizza', 'the hot oven', 'the table', 'our week'], 0, '오븐에 넣어 구운 피자를 함께 먹는다는 뜻이므로 it은 피자입니다.', [4, 5]),
            q('er2-p4-q5', 'evidence', 'Which sentence shows that the family talks together?', '가족이 함께 이야기를 나눈다는 것을 보여 주는 문장은 무엇인가요?', ['Sentence 1', 'Sentence 2', 'Sentence 5', 'Sentence 6'], 3, '여섯 번째 문장에 함께 먹으며 한 주 동안의 이야기를 나눈다고 나옵니다.', [5])
        ],
        source: source()
    }, {
        id: 'er2-p5', title: 'The Screen-Free Hour', topic: '화면 없는 가족 시간', band: 1,
        sentences: [
            'Every evening from eight to nine, Mia’s family turns off all their screens.',
            'Nobody watches TV or plays games on a phone during that hour.',
            'At first, Mia’s older brother does not like the new rule.',
            'He thinks the hour will feel long and boring.',
            'After a few weeks, however, he begins to enjoy it.',
            'He teaches Mia card tricks, and their parents read books nearby.',
            'Now the family talks and laughs more than before.'
        ],
        translations: [
            '매일 저녁 8시부터 9시까지 미아네 가족은 모든 전자 기기 화면을 끕니다.',
            '그 한 시간 동안은 아무도 TV를 보거나 휴대폰으로 게임을 하지 않습니다.',
            '처음에 미아의 오빠는 새 규칙을 좋아하지 않습니다.',
            '오빠는 그 한 시간이 길고 지루하게 느껴질 거라고 생각합니다.',
            '하지만 몇 주가 지나자 오빠는 그 시간을 즐기기 시작합니다.',
            '오빠는 미아에게 카드 마술을 가르쳐 주고, 부모님은 근처에서 책을 읽습니다.',
            '이제 가족은 전보다 더 많이 이야기하고 웃습니다.'
        ],
        vocabulary: [{ word: 'screen', meaning: '화면' }, { word: 'nobody', meaning: '아무도 ~않다' }, { word: 'rule', meaning: '규칙' }, { word: 'boring', meaning: '지루한' }, { word: 'begin', meaning: '시작하다' }, { word: 'trick', meaning: '마술, 묘기' }, { word: 'nearby', meaning: '근처에서' }],
        grammarTags: ['e3', 'e4'],
        grammarRefs: [{ stageId: 'elementary', unitId: 'e3', lessonIndex: 1 }],
        grammarNotes: [{ title: 'does not + 동사원형', text: '주어가 3인칭 단수일 때 일반동사의 부정문은 does not like처럼 does not 뒤에 동사원형을 씁니다.' }, { title: 'will + 동사원형', text: 'the hour will feel은 ‘그 시간이 ~하게 느껴질 것이다’라는 앞으로의 일을 나타냅니다.' }],
        questions: [
            q('er2-p5-q1', 'fact', 'When does the screen-free hour begin?', '화면 없는 시간은 언제 시작하나요?', ['at seven o’clock', 'at eight o’clock', 'at nine o’clock', 'right after school'], 1, '첫 문장에 저녁 8시부터 9시까지라고 나오므로 8시에 시작합니다.', [0]),
            q('er2-p5-q2', 'main', 'What is the main idea of the passage?', '이 글의 중심 생각은 무엇인가요?', ['Mia’s brother is very good at phone games.', 'Card tricks are hard for children to learn.', 'A screen-free hour brings a family closer.', 'Mia’s parents read many books every day.'], 2, '화면을 끈 한 시간 덕분에 가족이 더 많이 이야기하고 웃게 되었다는 글입니다.', [0, 4, 6]),
            q('er2-p5-q3', 'vocabulary', 'What does “begins” mean in sentence 5?', '5번 문장에서 “begins”는 무슨 뜻인가요?', ['stops', 'starts', 'forgets', 'refuses'], 1, 'begin은 start와 같이 ‘시작하다’라는 뜻입니다.', [4]),
            q('er2-p5-q4', 'reference', 'Who does “He” in sentence 4 refer to?', '4번 문장의 “He”는 누구를 가리키나요?', ['Mia’s father', 'the family’s neighbor', 'Mia’s grandfather', 'Mia’s older brother'], 3, '앞 문장에서 새 규칙을 좋아하지 않는다고 한 미아의 오빠를 가리킵니다.', [2, 3]),
            q('er2-p5-q5', 'evidence', 'Which sentence shows that the brother’s feelings changed?', '오빠의 마음이 바뀌었다는 것을 보여 주는 문장은 무엇인가요?', ['Sentence 2', 'Sentence 4', 'Sentence 5', 'Sentence 7'], 2, '다섯 번째 문장에 몇 주 뒤 오빠가 그 시간을 즐기기 시작한다고 나옵니다.', [4])
        ],
        source: source()
    }, {
        id: 'er2-p6', title: 'Sundays in Grandpa’s Garden', topic: '할아버지와 가꾸는 텃밭', band: 1,
        sentences: [
            'On Sunday mornings, Tae helps in his grandfather’s small garden.',
            'They pull weeds together and water the young bean plants.',
            'Grandpa’s back often hurts, so Tae does the work near the ground.',
            'In return, Grandpa teaches him the names of many plants.',
            'Last week, Tae learned that beans need plenty of sunlight.',
            'When the beans are ready, they will cook them with Grandma.',
            'Tae enjoys the garden because he and Grandpa work as a team.'
        ],
        translations: [
            '일요일 아침마다 태는 할아버지의 작은 텃밭에서 일을 돕습니다.',
            '두 사람은 함께 잡초를 뽑고 어린 콩 모종에 물을 줍니다.',
            '할아버지는 허리가 자주 아프셔서 땅 가까이에서 하는 일은 태가 합니다.',
            '그 보답으로 할아버지는 태에게 여러 식물의 이름을 가르쳐 주십니다.',
            '지난주에 태는 콩이 햇빛을 충분히 받아야 한다는 것을 배웠습니다.',
            '콩을 거둘 때가 되면 두 사람은 할머니와 함께 그 콩으로 요리할 것입니다.',
            '태는 할아버지와 한 팀이 되어 일하기 때문에 텃밭 일이 즐겁습니다.'
        ],
        vocabulary: [{ word: 'garden', meaning: '정원, 텃밭' }, { word: 'weed', meaning: '잡초' }, { word: 'bean', meaning: '콩' }, { word: 'hurt', meaning: '아프다' }, { word: 'ground', meaning: '땅' }, { word: 'in return', meaning: '보답으로' }, { word: 'plenty of', meaning: '충분한, 많은' }],
        grammarTags: ['e4', 'e3'],
        grammarRefs: [{ stageId: 'elementary', unitId: 'e4', lessonIndex: 1 }],
        grammarNotes: [{ title: '과거형과 will', text: 'Last week가 있는 5번 문장은 과거형 learned를, 앞으로의 일을 말하는 6번 문장은 will cook을 씁니다.' }],
        questions: [
            q('er2-p6-q1', 'fact', 'Why does Tae do the work near the ground?', '태는 왜 땅 가까이에서 하는 일을 하나요?', ['Grandpa’s back often hurts.', 'Grandma asks him to do it.', 'The beans need more sunlight.', 'The weeds are too tall for him.'], 0, '세 번째 문장에 할아버지가 허리가 자주 아프셔서 태가 그 일을 한다고 나옵니다.', [2]),
            q('er2-p6-q2', 'main', 'What is the passage mainly about?', '이 글은 주로 무엇에 관한 글인가요?', ['Grandma cooks beans for the whole family every single day.', 'A boy and his grandfather care for a garden together.', 'Beans can grow well without any sunlight.', 'Tae wants to buy a bigger garden next year.'], 1, '태와 할아버지가 서로 도우며 함께 텃밭을 가꾸는 이야기입니다.', [0, 1, 6]),
            q('er2-p6-q3', 'vocabulary', 'What are “weeds” in sentence 2?', '2번 문장의 “weeds”는 무엇인가요?', ['plants that grow where they are not wanted', 'tools that people use for digging in hard ground', 'seeds that will later become beans', 'small bugs that like to eat leaves'], 0, 'weed는 원하지 않는 곳에 저절로 자라는 풀, 즉 잡초입니다.', [1]),
            q('er2-p6-q4', 'reference', 'What does “them” in sentence 6 refer to?', '6번 문장의 “them”은 무엇을 가리키나요?', ['the weeds', 'the names of plants', 'the beans', 'Tae and Grandpa'], 2, '다 자란 콩을 할머니와 함께 요리한다는 뜻이므로 them은 콩입니다. Tae and Grandpa는 they가 가리키는 사람들입니다.', [5]),
            q('er2-p6-q5', 'evidence', 'Which sentence tells what Tae learned about beans?', '태가 콩에 대해 배운 내용을 알려 주는 문장은 무엇인가요?', ['Sentence 2', 'Sentence 4', 'Sentence 5', 'Sentence 6'], 2, '다섯 번째 문장에 콩은 햇빛이 충분히 필요하다는 것을 배웠다고 나옵니다.', [4])
        ],
        source: source()
    }, {
        id: 'er2-p7', title: 'Sunday Night Meetings', topic: '바쁜 가족의 주간 회의', band: 2,
        sentences: [
            'Last month, Yerin’s family felt busy because everyone had a different schedule.',
            'Her parents worked late, and her older brother had soccer practice almost every evening.',
            'So they decided to hold a short family meeting every Sunday night.',
            'During each meeting, everyone shared one good thing and one hard thing from the week.',
            'Then they chose one activity that the whole family could do together.',
            'When it was Yerin’s turn to choose, she picked a bike ride along the river.',
            'While they were riding, her brother told funny stories about his team.',
            'Yerin realized that even a short time together can make a family feel closer.'
        ],
        translations: [
            '지난달 예린이네 가족은 저마다 일정이 달라서 바쁘다고 느꼈습니다.',
            '부모님은 늦게까지 일하셨고, 오빠는 거의 매일 저녁 축구 연습이 있었습니다.',
            '그래서 가족은 일요일 밤마다 짧은 가족회의를 열기로 했습니다.',
            '회의 때마다 모두가 그 주에 있었던 좋은 일 하나와 힘든 일 하나를 나누었습니다.',
            '그다음 온 가족이 함께할 수 있는 활동을 하나 골랐습니다.',
            '예린이가 고를 차례가 되었을 때, 예린이는 강을 따라 자전거 타기를 골랐습니다.',
            '자전거를 타는 동안 오빠는 자기 팀에 관한 재미있는 이야기를 들려주었습니다.',
            '예린이는 짧은 시간이라도 함께하면 가족이 더 가깝게 느껴질 수 있다는 것을 깨달았습니다.'
        ],
        vocabulary: [{ word: 'schedule', meaning: '일정' }, { word: 'practice', meaning: '연습' }, { word: 'hold a meeting', meaning: '회의를 열다' }, { word: 'activity', meaning: '활동' }, { word: 'turn', meaning: '차례' }, { word: 'along', meaning: '~을 따라' }, { word: 'realize', meaning: '깨닫다' }],
        grammarTags: ['e4', 'e6'],
        grammarRefs: [{ stageId: 'elementary', unitId: 'e4', lessonIndex: 0 }],
        grammarNotes: [{ title: '일반동사의 과거형', text: '지난달에 있었던 일이므로 felt, decided, chose, told처럼 과거형을 씁니다. feel-felt, choose-chose, tell-told는 불규칙 변화입니다.' }, { title: '시간과 이유를 잇는 접속사', text: 'because는 이유, so는 결과, when은 ‘~할 때’, while은 ‘~하는 동안’을 나타냅니다.' }],
        questions: [
            q('er2-p7-q1', 'fact', 'What activity did Yerin choose?', '예린이는 어떤 활동을 골랐나요?', ['a soccer practice with her brother', 'a bike ride along the river', 'a late dinner with her parents', 'a short meeting on Sunday night'], 1, '여섯 번째 문장에 예린이가 강을 따라 자전거 타기를 골랐다고 나옵니다.', [5]),
            q('er2-p7-q2', 'main', 'What is the main idea of the passage?', '이 글의 중심 생각은 무엇인가요?', ['Yerin’s older brother wanted to quit his soccer team.', 'Weekly meetings helped a busy family share time.', 'Yerin’s parents worked late every night of the week.', 'Riding a bike along a river is good exercise for kids.'], 1, '바쁜 가족이 매주 회의를 열어 함께하는 시간을 만들고 더 가까워졌다는 글입니다.', [2, 4, 7]),
            q('er2-p7-q3', 'vocabulary', 'What does “schedule” mean in sentence 1?', '1번 문장에서 “schedule”은 무슨 뜻인가요?', ['a plan of times for activities', 'a place for playing sports', 'a feeling of being tired after work', 'a funny story about a team'], 0, 'schedule은 언제 무엇을 할지 정해 둔 시간 계획, 즉 일정입니다.', [0, 1]),
            q('er2-p7-q4', 'reference', 'Who does “his” in sentence 7 refer to?', '7번 문장의 “his”는 누구를 가리키나요?', ['Yerin’s father', 'Yerin’s grandfather', 'a friend from Yerin’s school', 'Yerin’s older brother'], 3, '축구 연습을 하는 오빠가 자기 팀 이야기를 한 것이므로 his는 예린이의 오빠입니다.', [1, 6]),
            q('er2-p7-q5', 'evidence', 'Which sentence shows the family’s problem before the meetings started?', '회의를 시작하기 전 가족의 문제를 보여 주는 문장은 무엇인가요?', ['Sentence 1', 'Sentence 3', 'Sentence 6', 'Sentence 8'], 0, '첫 번째 문장에 저마다 일정이 달라 가족이 바쁘다고 느꼈다는 문제가 나옵니다. 3번 문장은 그 해결책입니다.', [0])
        ],
        source: source()
    });
})();

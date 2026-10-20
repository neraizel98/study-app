// 영어 독해 추가 지문 · 단원 er3~er4
(function () {
    const unit = id => window.EnglishReadingData.units.find(item => item.id === id);
    const source = () => ({ kind: 'original', note: '스마트 스터디 자체 제작' });
    const ref = (unitId, lessonIndex) => ({ stageId: 'elementary', unitId, lessonIndex });
    const q = (id, type, prompt, promptKo, choices, answerIndex, explanation, evidence) => ({ id, type, prompt, choices, answerIndex, explanation, evidence, promptKo });

    unit('er3').passages.push({
        id: 'er3-p4', title: 'Milk for Breakfast', topic: '우유가 식탁에 오는 길', band: 0,
        sentences: [
            'Cows on a farm give milk every morning.',
            'The farmer keeps the milk cold in a big tank.',
            'A truck takes the milk to a factory.',
            'Workers heat the milk to kill harmful germs and put it into cartons.',
            'Then cold trucks carry the cartons to stores.',
            'Jun drinks a glass of cold milk with his breakfast.'
        ],
        translations: [
            '농장의 소들은 매일 아침 우유를 냅니다.',
            '농부는 우유를 큰 통에 담아 차갑게 보관합니다.',
            '트럭 한 대가 그 우유를 공장으로 가져갑니다.',
            '일하는 사람들은 해로운 세균을 없애려고 우유를 데운 뒤 우유갑에 담습니다.',
            '그다음 냉장 트럭들이 우유갑을 가게로 실어 나릅니다.',
            '준은 아침 식사와 함께 차가운 우유 한 잔을 마십니다.'
        ],
        vocabulary: [{word:'farm',meaning:'농장'},{word:'cold',meaning:'차가운'},{word:'tank',meaning:'큰 통'},{word:'factory',meaning:'공장'},{word:'germ',meaning:'세균'},{word:'carton',meaning:'(우유)갑'},{word:'carry',meaning:'나르다'}],
        grammarTags: ['e3','e6'],
        grammarRefs: [ref('e3', 0)],
        grammarNotes: [{title:'3인칭 단수 현재형',text:'주어가 The farmer, A truck, Jun처럼 한 사람·한 사물이면 keeps, takes, drinks처럼 동사에 -s를 붙입니다.'}],
        questions: [
            q('er3-p4-q1','fact','Where does the truck take the milk?','트럭은 우유를 어디로 가져가나요?',['to a school','to a factory','to the farm','to Jun’s house'],1,'세 번째 문장에 트럭이 우유를 공장으로 가져간다고 나옵니다.',[2]),
            q('er3-p4-q2','main','What is the passage mainly about?','이 글은 주로 무엇에 관한 글인가요?',['how cows eat grass on a farm','how milk gets from a farm to a table','how workers make cartons in a factory','how Jun cooks his breakfast'],1,'농장의 우유가 공장과 가게를 거쳐 준의 아침 식탁에 오는 과정을 보여 줍니다.',[0,1,2,3,4,5]),
            q('er3-p4-q3','vocabulary','What does “germs” mean in sentence 4?','4번 문장에서 “germs”는 무슨 뜻인가요?',['tiny things that can make us sick','paper boxes for holding milk','large metal tanks that keep milk cold','animals that live on a farm'],0,'우유를 데워서 없애는 것은 사람을 아프게 할 수 있는 아주 작은 세균입니다.',[3]),
            q('er3-p4-q4','reference','What does “it” in sentence 4 refer to?','4번 문장의 “it”은 무엇을 가리키나요?',['the truck','the factory','the milk','the farm'],2,'일하는 사람들이 데운 뒤 우유갑에 담는 것은 우유입니다.',[3]),
            q('er3-p4-q5','evidence','Which sentence shows how the milk stays fresh on the farm?','농장에서 우유를 신선하게 지키는 방법을 보여 주는 문장은 무엇인가요?',['Sentence 1','Sentence 2','Sentence 3','Sentence 5'],1,'두 번째 문장에서 농부가 우유를 큰 통에 담아 차갑게 보관한다고 합니다.',[1])
        ],
        source: source()
    }, {
        id: 'er3-p5', title: 'Rice from a Wet Field', topic: '쌀이 밥이 되기까지', band: 1,
        sentences: [
            'In spring, farmers fill their rice fields with water.',
            'They plant young rice plants in rows in the wet fields.',
            'During the hot summer, the plants grow tall and green.',
            'In autumn, the rice grains turn golden, and farmers harvest them.',
            'The grains are dried and taken to a mill.',
            'At the mill, machines remove the hard outer shell of each grain.',
            'At home, we wash the rice and cook it for our meals.'
        ],
        translations: [
            '봄에 농부들은 논에 물을 채웁니다.',
            '그들은 물이 찬 논에 어린 벼를 줄지어 심습니다.',
            '더운 여름 동안 벼는 키가 크고 푸르게 자랍니다.',
            '가을에 벼 낟알은 황금빛으로 변하고, 농부들은 그것을 거두어들입니다.',
            '낟알은 말린 뒤 정미소로 옮겨집니다.',
            '정미소에서는 기계가 낟알 하나하나의 단단한 겉껍질을 벗겨 냅니다.',
            '집에서 우리는 쌀을 씻어 식사로 먹을 밥을 짓습니다.'
        ],
        vocabulary: [{word:'field',meaning:'논, 밭'},{word:'row',meaning:'줄'},{word:'grain',meaning:'낟알'},{word:'autumn',meaning:'가을'},{word:'harvest',meaning:'수확하다, 거두어들이다'},{word:'mill',meaning:'정미소, 방앗간'},{word:'remove',meaning:'없애다, 제거하다'},{word:'shell',meaning:'껍질'}],
        grammarTags: ['e6','e3'],
        grammarRefs: [ref('e6', 1)],
        grammarNotes: [{title:'때를 나타내는 전치사',text:'계절 앞에는 in을 써서 In spring, In autumn이라고 합니다. During the hot summer는 ‘더운 여름 동안’이라는 뜻입니다.'}],
        questions: [
            q('er3-p5-q1','fact','What do farmers do in autumn?','농부들은 가을에 무엇을 하나요?',['fill the fields with water','plant young rice plants','harvest the golden grains','wash and cook the rice'],2,'네 번째 문장에 가을에 황금빛 낟알을 거두어들인다고 나옵니다.',[3]),
            q('er3-p5-q2','main','What does the passage mainly describe?','이 글은 주로 무엇을 설명하나요?',['why rice fields need so much water','how machines at a mill are built and fixed','what farmers eat during the hot summer','the steps rice goes through to reach us'],3,'논에 심은 벼가 자라고 수확되어 정미소를 거쳐 밥이 되기까지의 단계를 차례로 설명합니다.',[0,1,2,3,4,5,6]),
            q('er3-p5-q3','vocabulary','What does “harvest” mean in sentence 4?','4번 문장에서 “harvest”는 무슨 뜻인가요?',['gather crops when they are ready','plant young seeds deep in wet ground','dry grains in the sun','remove the outer shell'],0,'다 익은 낟알을 거두어들인다는 뜻입니다.',[3]),
            q('er3-p5-q4','reference','What does “them” in sentence 4 refer to?','4번 문장의 “them”은 무엇을 가리키나요?',['the rice fields','the rice grains','the farmers','the machines'],1,'농부들이 거두어들이는 것은 같은 문장 앞부분의 황금빛 벼 낟알입니다.',[3]),
            q('er3-p5-q5','evidence','Which sentence tells what machines do at the mill?','정미소에서 기계가 하는 일을 알려 주는 문장은 무엇인가요?',['Sentence 2','Sentence 3','Sentence 5','Sentence 6'],3,'여섯 번째 문장에 기계가 낟알의 단단한 겉껍질을 벗겨 낸다고 나옵니다.',[5])
        ],
        source: source()
    }, {
        id: 'er3-p6', title: 'Why Bread Gets Bigger', topic: '빵이 부풀어 오르는 까닭', band: 1,
        sentences: [
            'Mr. Park, a baker, starts work early in the morning.',
            'He mixes flour, water, a little sugar and yeast to make dough.',
            'Yeast is a tiny living thing, and it eats the sugar.',
            'When the yeast eats the sugar, it makes gas bubbles in the dough.',
            'The bubbles make the dough rise, so it becomes bigger and softer.',
            'Then Mr. Park bakes the dough in a hot oven.',
            'By eight o’clock, fresh bread is ready for the first customers.'
        ],
        translations: [
            '제빵사인 박 선생님은 아침 일찍 일을 시작합니다.',
            '그는 밀가루, 물, 약간의 설탕과 효모를 섞어 반죽을 만듭니다.',
            '효모는 아주 작은 생물이고, 설탕을 먹습니다.',
            '효모가 설탕을 먹으면 반죽 속에 기체 거품을 만듭니다.',
            '거품 때문에 반죽이 부풀어 올라 더 크고 부드러워집니다.',
            '그다음 박 선생님은 반죽을 뜨거운 오븐에 굽습니다.',
            '8시까지 첫 손님들을 위한 갓 구운 빵이 준비됩니다.'
        ],
        vocabulary: [{word:'baker',meaning:'제빵사'},{word:'flour',meaning:'밀가루'},{word:'yeast',meaning:'효모, 이스트'},{word:'dough',meaning:'반죽'},{word:'bubble',meaning:'거품'},{word:'rise',meaning:'부풀어 오르다'},{word:'oven',meaning:'오븐'},{word:'customer',meaning:'손님'}],
        grammarTags: ['e6','e3'],
        grammarRefs: [ref('e6', 1)],
        grammarNotes: [{title:'when과 so',text:'When the yeast eats the sugar는 ‘효모가 설탕을 먹을 때’라는 뜻입니다. so 뒤에는 앞 내용의 결과가 옵니다.'}],
        questions: [
            q('er3-p6-q1','fact','What does the yeast eat in the dough?','효모는 반죽 속에서 무엇을 먹나요?',['the salt','the water','the bubbles','the sugar'],3,'세 번째와 네 번째 문장에 효모가 설탕을 먹는다고 나옵니다.',[2,3]),
            q('er3-p6-q2','main','What is the passage mainly about?','이 글은 주로 무엇에 관한 글인가요?',['how a baker sells bread to customers','how yeast helps bread dough rise','why bakers start work so early','why ovens must be very hot'],1,'효모가 만든 기체 거품 때문에 반죽이 부풀어 오르는 과정을 설명합니다.',[2,3,4]),
            q('er3-p6-q3','vocabulary','What does “rise” mean in sentence 5?','5번 문장에서 “rise”는 무슨 뜻인가요?',['go up and get bigger','fall down and break','turn hard and dark','become cold and very wet'],0,'반죽이 위로 부풀어 올라 커진다는 뜻입니다.',[4]),
            q('er3-p6-q4','reference','What does “it” in sentence 4 refer to?','4번 문장의 “it”은 무엇을 가리키나요?',['the sugar','the dough','the yeast','the oven'],2,'설탕을 먹고 기체 거품을 만드는 것은 효모입니다.',[3]),
            q('er3-p6-q5','evidence','Which sentence explains where the gas bubbles come from?','기체 거품이 어디에서 생기는지 설명하는 문장은 무엇인가요?',['Sentence 2','Sentence 4','Sentence 6','Sentence 7'],1,'네 번째 문장에서 효모가 설탕을 먹으면서 거품을 만든다고 설명합니다.',[3])
        ],
        source: source()
    }, {
        id: 'er3-p7', title: 'Kimchi for the Cold Months', topic: '김장과 발효', band: 2,
        sentences: [
            'Every November, Hana’s family gathers to make kimchi for the winter.',
            'First, they cut the cabbages in half and put salt between the leaves.',
            'The salt pulls water out of the leaves, so the cabbages become soft.',
            'The next day, they wash off the extra salt while Grandma mixes red pepper powder, garlic and other seasonings.',
            'Everyone rubs the seasoning onto each leaf and packs the cabbages into containers.',
            'At first, the kimchi tastes fresh and salty.',
            'Over the next few weeks, it becomes sour because tiny helpful bacteria grow in it.',
            'When the kimchi is kept in a cold place, this change happens more slowly.',
            'That is why the family stores it in a kimchi fridge and enjoys it all winter.'
        ],
        translations: [
            '매년 11월이면 하나네 가족은 겨울에 먹을 김치를 담그려고 모입니다.',
            '먼저 그들은 배추를 반으로 자르고 잎 사이사이에 소금을 넣습니다.',
            '소금이 잎에서 물기를 빼내기 때문에 배추가 부드러워집니다.',
            '다음 날 그들은 남은 소금기를 씻어 내고, 그동안 할머니는 고춧가루, 마늘, 다른 양념을 섞습니다.',
            '모두가 잎 하나하나에 양념을 바르고 배추를 통에 꼭꼭 담습니다.',
            '처음에 김치는 신선하고 짠맛이 납니다.',
            '몇 주가 지나면 아주 작은 이로운 세균이 김치 속에서 자라기 때문에 김치가 시어집니다.',
            '김치를 차가운 곳에 두면 이 변화가 더 천천히 일어납니다.',
            '그래서 가족은 김치를 김치냉장고에 보관하고 겨울 내내 맛있게 먹습니다.'
        ],
        vocabulary: [{word:'cabbage',meaning:'배추'},{word:'salt',meaning:'소금'},{word:'seasoning',meaning:'양념'},{word:'container',meaning:'통, 용기'},{word:'sour',meaning:'신, 시큼한'},{word:'bacteria',meaning:'세균'},{word:'store',meaning:'보관하다'}],
        grammarTags: ['e6','e3'],
        grammarRefs: [ref('e6', 1)],
        grammarNotes: [{title:'원인과 결과를 잇는 접속사',text:'because 뒤에는 원인이, so 뒤에는 결과가 옵니다. while은 ‘~하는 동안’, when은 ‘~할 때’라는 뜻으로 두 일을 시간으로 연결합니다.'}],
        questions: [
            q('er3-p7-q1','fact','What does Grandma do while the others wash off the salt?','다른 가족들이 소금기를 씻어 내는 동안 할머니는 무엇을 하나요?',['She cuts the cabbages in half.','She buys more salt.','She mixes the seasoning.','She cleans the fridge.'],2,'네 번째 문장에 할머니가 고춧가루, 마늘 등 양념을 섞는다고 나옵니다.',[3]),
            q('er3-p7-q2','main','What is the passage mainly about?','이 글은 주로 무엇에 관한 글인가요?',['why cabbages grow best in November','how a kimchi fridge is built at a factory','why Grandma does not like salty food','how kimchi is made and how it changes'],3,'김치를 담그는 순서와 시간이 지나며 김치가 시어지는 변화를 함께 설명합니다.',[1,2,3,4,5,6,7]),
            q('er3-p7-q3','vocabulary','What does “sour” mean in sentence 7?','7번 문장에서 “sour”는 무슨 뜻인가요?',['tasting sweet like honey','tasting like lemon or vinegar','feeling very hot to the touch','looking bright red in color'],1,'김치가 익으면서 레몬이나 식초처럼 신맛이 난다는 뜻입니다.',[6]),
            q('er3-p7-q4','reference','What does “this change” in sentence 8 refer to?','8번 문장의 “this change”는 무엇을 가리키나요?',['the kimchi becoming sour','the cabbages turning soft','the seasoning turning red','the salt being washed off'],0,'바로 앞 문장에서 설명한, 김치가 시어지는 변화를 가리킵니다.',[6,7]),
            q('er3-p7-q5','evidence','Which sentence explains why the cabbages become soft?','배추가 부드러워지는 까닭을 설명하는 문장은 무엇인가요?',['Sentence 1','Sentence 2','Sentence 3','Sentence 7'],2,'세 번째 문장에서 소금이 잎의 물기를 빼내서 배추가 부드러워진다고 설명합니다.',[2])
        ],
        source: source()
    });

    unit('er4').passages.push({
        id: 'er4-p4', title: 'Clothes in the Sun', topic: '물의 증발', band: 0,
        sentences: [
            'Mom washes our clothes on Saturday morning.',
            'I help her hang the wet clothes outside.',
            'The sun is warm, and a light wind is blowing.',
            'Slowly, the water in the clothes goes into the air.',
            'This change is called evaporation.',
            'By lunchtime, all of the clothes are dry.'
        ],
        translations: [
            '엄마는 토요일 아침에 우리 옷을 빨래합니다.',
            '나는 엄마를 도와 젖은 옷을 밖에 넙니다.',
            '햇볕은 따뜻하고 산들바람이 불고 있습니다.',
            '옷 속의 물이 천천히 공기 중으로 날아갑니다.',
            '이러한 변화를 증발이라고 부릅니다.',
            '점심때쯤이면 옷이 모두 말라 있습니다.'
        ],
        vocabulary: [{word:'wash',meaning:'빨다, 씻다'},{word:'hang',meaning:'널다, 걸다'},{word:'wet',meaning:'젖은'},{word:'dry',meaning:'마른'},{word:'wind',meaning:'바람'},{word:'air',meaning:'공기'},{word:'evaporation',meaning:'증발'}],
        grammarTags: ['e3','e6'],
        grammarRefs: [ref('e3', 0)],
        grammarNotes: [{title:'3인칭 단수 현재형',text:'Mom처럼 주어가 한 사람이면 wash 대신 washes를 씁니다. 주어가 I이면 help처럼 동사원형을 씁니다.'}],
        questions: [
            q('er4-p4-q1','fact','When does Mom wash the clothes?','엄마는 언제 빨래를 하나요?',['on Sunday night','after lunch','on a rainy afternoon','on Saturday morning'],3,'첫 번째 문장에 토요일 아침에 빨래한다고 나옵니다.',[0]),
            q('er4-p4-q2','main','What is the passage mainly about?','이 글은 주로 무엇에 관한 글인가요?',['how wet clothes become dry','how to fold dry clothes','why Mom likes Saturday mornings','how wind makes clouds'],0,'젖은 옷의 물이 공기 중으로 날아가 옷이 마르는 과정을 보여 줍니다.',[1,2,3,4,5]),
            q('er4-p4-q3','vocabulary','What does “evaporation” mean in this passage?','이 글에서 “evaporation”은 무슨 뜻인가요?',['water falling as rain','water going into the air','clothes getting wet again','wind blowing very hard'],1,'옷 속의 물이 공기 중으로 날아가는 변화를 증발이라고 합니다.',[3,4]),
            q('er4-p4-q4','reference','Who does “her” in sentence 2 refer to?','2번 문장의 “her”는 누구를 가리키나요?',['the sun','the wind','Mom','the writer'],2,'앞 문장에서 빨래를 한 엄마를 돕는다는 뜻입니다.',[0,1]),
            q('er4-p4-q5','evidence','Which sentence tells where the water in the clothes goes?','옷 속의 물이 어디로 가는지 알려 주는 문장은 무엇인가요?',['Sentence 2','Sentence 3','Sentence 4','Sentence 6'],2,'네 번째 문장에 물이 공기 중으로 간다고 나옵니다.',[3])
        ],
        source: source()
    }, {
        id: 'er4-p5', title: 'The Foggy Mirror', topic: '수증기와 응결', band: 1,
        sentences: [
            'After a hot shower, Minho cannot see his face in the bathroom mirror.',
            'The mirror is covered with tiny drops of water.',
            'The hot shower adds a lot of water vapor to the air.',
            'Water vapor is water in the form of a gas, so we cannot see it.',
            'When the warm, wet air touches the cool mirror, the vapor turns back into liquid water.',
            'The same thing happens on the outside of a glass of cold juice.',
            'Minho opens the window, and soon the mirror becomes clear again.'
        ],
        translations: [
            '뜨거운 물로 샤워를 하고 나면 민호는 욕실 거울에서 자기 얼굴을 볼 수 없습니다.',
            '거울이 아주 작은 물방울로 덮여 있습니다.',
            '뜨거운 샤워는 공기 중에 수증기를 많이 더합니다.',
            '수증기는 기체 상태의 물이어서 우리 눈에 보이지 않습니다.',
            '따뜻하고 축축한 공기가 차가운 거울에 닿으면 수증기가 다시 액체인 물로 바뀝니다.',
            '차가운 주스 잔의 바깥쪽에서도 같은 일이 일어납니다.',
            '민호가 창문을 열자 곧 거울이 다시 맑아집니다.'
        ],
        vocabulary: [{word:'shower',meaning:'샤워'},{word:'mirror',meaning:'거울'},{word:'drop',meaning:'방울'},{word:'vapor',meaning:'수증기'},{word:'gas',meaning:'기체'},{word:'liquid',meaning:'액체'},{word:'clear',meaning:'맑은, 깨끗한'}],
        grammarTags: ['e6','e3'],
        grammarRefs: [ref('e6', 1)],
        grammarNotes: [{title:'when과 so',text:'When the warm, wet air touches the cool mirror는 ‘따뜻하고 축축한 공기가 차가운 거울에 닿을 때’라는 뜻입니다. so 뒤에는 결과(우리가 볼 수 없음)가 옵니다.'}],
        questions: [
            q('er4-p5-q1','fact','What covers the mirror after the shower?','샤워 후 거울을 덮고 있는 것은 무엇인가요?',['a thin layer of soap','tiny drops of water','pieces of white paper','dust from the window'],1,'두 번째 문장에 거울이 아주 작은 물방울로 덮여 있다고 나옵니다.',[1]),
            q('er4-p5-q2','main','What does the passage mainly explain?','이 글은 주로 무엇을 설명하나요?',['how to clean a bathroom mirror quickly','why juice tastes better when it is cold','why a mirror fogs up after a shower','how Minho takes a hot shower'],2,'샤워 후 수증기가 차가운 거울에서 물방울로 바뀌어 거울이 뿌옇게 되는 까닭을 설명합니다.',[1,2,3,4]),
            q('er4-p5-q3','vocabulary','What does “vapor” mean in sentence 3?','3번 문장에서 “vapor”는 무슨 뜻인가요?',['a small piece of ice','soap that makes a lot of bubbles','a cold glass of juice','water in the form of a gas'],3,'네 번째 문장에서 수증기는 기체 상태의 물이라고 설명합니다.',[2,3]),
            q('er4-p5-q4','reference','What does “it” in sentence 4 refer to?','4번 문장의 “it”은 무엇을 가리키나요?',['the water vapor','the mirror','the window','the hot shower'],0,'우리 눈에 보이지 않는 것은 기체 상태의 물인 수증기입니다.',[3]),
            q('er4-p5-q5','evidence','Which sentence explains how the drops form on the mirror?','거울에 물방울이 생기는 과정을 설명하는 문장은 무엇인가요?',['Sentence 2','Sentence 3','Sentence 5','Sentence 7'],2,'다섯 번째 문장에서 수증기가 차가운 거울에 닿아 액체인 물로 바뀐다고 설명합니다.',[4])
        ],
        source: source()
    }, {
        id: 'er4-p6', title: 'The Floating Orange', topic: '물에 뜨고 가라앉는 까닭', band: 1,
        sentences: [
            'Jiwoo puts an orange into a bowl of water, and it floats.',
            'Then she peels the orange and puts it back into the water.',
            'This time, the orange sinks to the bottom of the bowl.',
            'The peel has many tiny pockets of air inside it.',
            'The air makes the whole orange light for its size, so it floats.',
            'Without its peel, the orange is heavier for its size, and it sinks.',
            'Jiwoo writes the result in her science notebook.'
        ],
        translations: [
            '지우가 물이 담긴 그릇에 오렌지를 넣자 오렌지가 물에 뜹니다.',
            '그다음 지우는 오렌지 껍질을 벗기고 다시 물에 넣습니다.',
            '이번에는 오렌지가 그릇 바닥으로 가라앉습니다.',
            '껍질 속에는 아주 작은 공기 주머니가 많이 있습니다.',
            '그 공기 덕분에 껍질을 벗기지 않은 오렌지는 크기에 비해 가벼워서 물에 뜹니다.',
            '껍질이 없으면 오렌지는 크기에 비해 더 무거워져서 가라앉습니다.',
            '지우는 그 결과를 과학 공책에 적습니다.'
        ],
        vocabulary: [{word:'bowl',meaning:'그릇'},{word:'float',meaning:'뜨다'},{word:'peel',meaning:'껍질; 껍질을 벗기다'},{word:'sink',meaning:'가라앉다'},{word:'bottom',meaning:'바닥'},{word:'pocket',meaning:'작은 공간, 주머니'},{word:'result',meaning:'결과'}],
        grammarTags: ['e1','e6'],
        grammarRefs: [ref('e1', 1)],
        grammarNotes: [{title:'대명사 it',text:'it은 앞에 나온 한 사물을 대신합니다. 1번 문장의 it은 the orange, 4번 문장의 it은 the peel을 가리킵니다.'}],
        questions: [
            q('er4-p6-q1','fact','What happens after Jiwoo peels the orange?','지우가 오렌지 껍질을 벗긴 뒤 어떤 일이 일어나나요?',['It floats on the water.','It turns into juice.','It gets bigger and lighter.','It sinks to the bottom.'],3,'세 번째 문장에 껍질을 벗긴 오렌지가 그릇 바닥으로 가라앉는다고 나옵니다.',[1,2]),
            q('er4-p6-q2','main','What is the passage mainly about?','이 글은 주로 무엇에 관한 글인가요?',['why a peeled orange sinks','how to grow oranges at home','why oranges taste sweet','how to clean a bowl'],0,'껍질의 공기 때문에 뜨던 오렌지가 껍질을 벗기면 가라앉는 까닭을 설명합니다.',[2,3,4,5]),
            q('er4-p6-q3','vocabulary','What does “peels” mean in sentence 2?','2번 문장에서 “peels”는 무슨 뜻인가요?',['cuts into small pieces','fills with cold water','takes off the skin','throws into the air'],2,'오렌지의 껍질을 벗긴다는 뜻입니다.',[1]),
            q('er4-p6-q4','reference','What does “it” in sentence 4 refer to?','4번 문장의 “it”은 무엇을 가리키나요?',['the bowl','the peel','the water','the notebook'],1,'작은 공기 주머니가 들어 있는 것은 같은 문장의 껍질입니다.',[3]),
            q('er4-p6-q5','evidence','Which sentence explains why the whole orange floats?','껍질을 벗기지 않은 오렌지가 물에 뜨는 까닭을 설명하는 문장은 무엇인가요?',['Sentence 1','Sentence 2','Sentence 3','Sentence 5'],3,'다섯 번째 문장에서 껍질 속 공기 때문에 오렌지가 크기에 비해 가벼워 뜬다고 설명합니다.',[4])
        ],
        source: source()
    }, {
        id: 'er4-p7', title: 'Counting After the Flash', topic: '번개와 천둥', band: 2,
        sentences: [
            'One summer evening, Daniel sees a bright flash of lightning far away.',
            'A few seconds later, he hears a loud boom of thunder.',
            'Lightning and thunder happen at the same moment, but we notice them at different times.',
            'We see the flash first because light travels much faster than sound.',
            'Sound moves through the air more slowly, so the thunder reaches us later.',
            'Daniel counts the seconds between the flash and the boom.',
            'If he counts to three, the storm is about one kilometer away.',
            'When the time between them gets shorter, the storm is coming closer.',
            'Daniel watches from inside the house while he counts, because storms can be dangerous.'
        ],
        translations: [
            '어느 여름 저녁, 대니얼은 멀리서 밝게 번쩍이는 번개를 봅니다.',
            '몇 초 뒤 그는 우르릉 쾅 하는 큰 천둥소리를 듣습니다.',
            '번개와 천둥은 같은 순간에 생기지만, 우리는 그것들을 서로 다른 때에 알아차립니다.',
            '빛이 소리보다 훨씬 빨리 이동하기 때문에 우리는 번쩍임을 먼저 봅니다.',
            '소리는 공기 중에서 더 느리게 움직이므로 천둥은 우리에게 나중에 도착합니다.',
            '대니얼은 번쩍임과 천둥소리 사이에 몇 초가 지나는지 셉니다.',
            '셋까지 센다면 폭풍은 약 1킬로미터 떨어져 있는 것입니다.',
            '그 둘 사이의 시간이 짧아지면 폭풍이 더 가까이 다가오고 있는 것입니다.',
            '폭풍은 위험할 수 있기 때문에 대니얼은 초를 세는 동안 집 안에서 지켜봅니다.'
        ],
        vocabulary: [{word:'lightning',meaning:'번개'},{word:'thunder',meaning:'천둥'},{word:'flash',meaning:'번쩍임'},{word:'notice',meaning:'알아차리다'},{word:'travel',meaning:'이동하다, 나아가다'},{word:'count',meaning:'세다'},{word:'storm',meaning:'폭풍, 뇌우'},{word:'dangerous',meaning:'위험한'}],
        grammarTags: ['e6','e3'],
        grammarRefs: [ref('e6', 1)],
        grammarNotes: [{title:'접속사로 이유와 때 나타내기',text:'because는 이유, so는 결과, when은 ‘~할 때’, while은 ‘~하는 동안’을 나타냅니다. faster, more slowly는 두 가지를 비교하는 표현입니다.'}],
        questions: [
            q('er4-p7-q1','fact','If Daniel counts to three, how far away is the storm?','대니얼이 셋까지 센다면 폭풍은 얼마나 멀리 있나요?',['about three kilometers','about one kilometer','about ten meters','about a hundred kilometers'],1,'일곱 번째 문장에 셋까지 세면 약 1킬로미터 떨어져 있다고 나옵니다.',[6]),
            q('er4-p7-q2','main','What is the passage mainly about?','이 글은 주로 무엇에 관한 글인가요?',['why lightning is brighter in summer than in winter','how to build a house that is safe from storms','what the gap between flash and boom tells us','why thunder sounds louder inside the house'],2,'번개와 천둥 사이에 시간 차가 생기는 까닭과 그 시간으로 폭풍의 거리를 짐작하는 방법을 설명합니다.',[2,3,4,5,6,7]),
            q('er4-p7-q3','vocabulary','What does “travels” mean in sentence 4?','4번 문장에서 “travels”는 무슨 뜻인가요?',['makes a loud noise','becomes very bright','goes on a long trip with family','moves from one place to another'],3,'빛이 한 곳에서 다른 곳으로 이동한다는 뜻입니다.',[3]),
            q('er4-p7-q4','reference','What does “them” in sentence 8 refer to?','8번 문장의 “them”은 무엇을 가리키나요?',['the flash and the boom','Daniel and the storm','the storm and the house','the seconds and the minutes'],0,'앞 문장들에서 대니얼이 사이의 시간을 세는 번쩍임과 천둥소리를 가리킵니다.',[5,7]),
            q('er4-p7-q5','evidence','Which sentence gives the reason we see the flash before we hear the boom?','천둥소리를 듣기 전에 번쩍임을 먼저 보는 까닭을 밝히는 문장은 무엇인가요?',['Sentence 2','Sentence 4','Sentence 6','Sentence 9'],1,'네 번째 문장에서 빛이 소리보다 훨씬 빨리 이동하기 때문이라고 설명합니다.',[3])
        ],
        source: source()
    });
})();

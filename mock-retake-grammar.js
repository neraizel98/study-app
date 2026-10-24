/* Authored, finite retake pool. A different name or option order is never a new item. */
(function (root) {
    'use strict';
    const skills = Object.create(null), bindings = [];
    const normalize = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/\s+/g, '').trim();
    const item = (task, question, answer, wrong, explanation) => ({ task, question, answer, choices: [answer, ...wrong], explanation });
    function bind(stageId, unitId, lessonIndex, title, skill, indexes) { bindings.push({ stageId, unitId, lessonIndex, title, skill, indexes }); }

    skills.structure = [
        item('classify', '“The baby sleeps peacefully.”에서 peacefully는 잠자는 방식을 덧붙인다. 이 문장의 기본 형식은?', '1형식', ['2형식', '3형식', '4형식'], 'sleeps는 목적어나 보어 없이 뜻이 완성됩니다. peacefully는 부사이며 필수 보어가 아닙니다.'),
        item('role', '“The sky became dark.”에서 dark를 지우면 어떤 정보가 빠지는가?', '주어인 하늘이 어떤 상태로 변했는지', ['하늘이 변화시킨 대상', '변화가 일어난 장소', '행동을 받은 목적어'], 'dark는 주어 sky의 상태를 설명하는 주격보어입니다.'),
        item('compare', '“The boy opened the gate.”와 “The gate remained open.”에서 open/opened 뒤 구조를 바르게 분석한 것은?', '첫 문장의 the gate는 목적어, 둘째의 open은 보어이다.', ['두 문장 모두 목적어가 있다.', '두 문장 모두 보어만 있다.', '첫 문장의 the gate와 둘째의 open은 모두 부사이다.'], 'opened는 문을 대상으로 한 행동이며, remained open은 문이 열린 상태로 남았다는 주어 설명입니다.'),
        item('correction', '“수프의 맛이 짜다”라는 상태를 나타내려 한다. The soup tastes salt.에서 salt를 바르게 고치면?', 'salty', ['saltily', 'salts', 'salting'], '여기서 taste는 주어의 성질을 잇는 연결동사이므로 형용사 salty를 보어로 씁니다.'),
        item('classify', '“The students collected bottles.”에서 bottles는 수거한 대상이다. 문장의 형식은?', '3형식', ['1형식', '2형식', '5형식'], '주어 The students, 동사 collected, 목적어 bottles의 S+V+O 구조입니다.'),
        item('role', '“The leaves turned yellow.”의 yellow와 같은 역할을 하는 부분은?', 'The child became quiet.의 quiet', ['The child carried a bag.의 a bag', 'The child walked slowly.의 slowly', 'The child opened a box.의 a box'], 'yellow와 quiet 모두 주어의 상태를 설명하는 주격보어입니다.')
    ];
    skills.objects = [
        item('classify', '“The librarian lent us a dictionary.”에서 us와 a dictionary를 바르게 설명한 것은?', 'us는 받는 사람, a dictionary는 빌려준 물건이다.', ['두 표현은 모두 사서의 상태를 설명한다.', 'us가 빌려준 물건이고 a dictionary가 받는 사람이다.', 'us는 주어이고 a dictionary는 동사이다.'], 'lend의 4형식은 간접목적어 us와 직접목적어 a dictionary를 가집니다.'),
        item('correction', '문을 열린 상태로 두라는 뜻이다. “Keep the door openly.”의 올바른 수정은?', 'Keep the door open.', ['Keep the door openingly.', 'Keep the door openness.', 'Keep the door to open.'], 'open이 목적어 the door의 상태를 설명하는 목적격보어입니다. 방식의 부사 openly와 구별합니다.'),
        item('role', '“The class elected Sara leader.”에서 Sara와 leader의 관계는?', 'leader는 Sara가 맡게 된 역할을 설명한다.', ['leader는 Sara에게 건네준 물건이다.', 'Sara와 leader는 서로 다른 두 사람이다.', 'leader는 선출한 방식을 나타낸다.'], '목적어 Sara를 leader라고 설명하므로 목적어와 목적격보어의 5형식 관계입니다.'),
        item('compare', '“Grandpa sent me a postcard.”와 “The joke made me cheerful.”의 구조 차이는?', '첫 문장은 두 목적어, 둘째는 목적어와 목적격보어를 가진다.', ['첫 문장과 둘째 문장은 모두 두 목적어를 가진다.', '첫 문장과 둘째 문장은 모두 주격보어만 가진다.', '첫 문장은 1형식, 둘째는 2형식이다.'], 'a postcard는 me에게 보내는 물건이지만 cheerful은 me의 상태를 설명합니다.'),
        item('classify', '“We call our dog Pepper.”에서 Pepper의 역할은?', '목적어 our dog를 설명하는 목적격보어', ['우리에게 주어진 직접목적어', '문장 전체의 주어', 'call을 꾸미는 부사'], 'Pepper는 별개의 대상이 아니라 our dog의 이름을 설명하는 보어입니다.'),
        item('correction', '발표가 청중을 조용하게 만들었다. “The speech made the audience silently.”의 수정은?', 'silently → silent', ['made → was', 'silently → silence', 'audience 뒤에 to를 넣는다.'], '청중의 상태를 설명하는 목적격보어에는 형용사 silent를 씁니다.')
    ];
    skills.progressive = [
        item('context', '지금 정원에서 실제로 물을 주는 중이다. “The gardener ___ the plants right now.”의 빈칸은?', 'is watering', ['waters', 'watering', 'was water'], '현재 진행 중인 행동은 단수 주어에 맞는 is와 watering을 함께 씁니다.'),
        item('context', '어제 정오 그 순간 두 학생이 지도를 그리고 있었다. “At noon yesterday, two students ___ a map.”의 빈칸은?', 'were drawing', ['are drawing', 'was drawing', 'were draw'], '과거 특정 순간 진행 중이므로 were drawing입니다. two students는 복수입니다.'),
        item('correction', '한 아이가 지금 계단을 오르는 중이다. “A child is climb the stairs now.”의 올바른 수정은?', 'climb → climbing', ['is → are', 'climb → climbed', 'is를 지운다.'], '현재진행은 is + -ing이므로 climbing이 필요합니다.'),
        item('correction', '어제 6시에 우리 모두 요리 중이었다. “We was cooking at six yesterday.”의 수정은?', 'was → were', ['cooking → cook', 'was → are', 'cooking → cooks'], '과거진행의 be동사는 복수 주어 we에 맞춰 were로 씁니다.'),
        item('meaning', '“The volunteers are sorting the clothes now.”가 전달하는 상황은?', '자원봉사자들이 지금 옷을 분류하는 중이다.', ['자원봉사자들이 어제 옷 분류를 끝냈다.', '자원봉사자들이 내일 옷을 분류할 것이다.', '자원봉사자들은 옷 분류를 하지 않는다.'], 'are sorting은 현재 진행 중인 행동입니다.'),
        item('meaning', '“Mina was reading when the bell rang.”에서 종이 울린 순간 미나의 상황은?', '읽는 행동이 진행 중이었다.', ['읽기를 시작할 예정이었다.', '읽기를 이미 끝낸 상태였다.', '읽는 것을 좋아하지 않았다.'], 'was reading은 과거 기준 시점에 진행 중이던 동작을 나타냅니다.'),
        item('context', '사진을 찍는 바로 그 순간 새 한 마리가 날고 있었다. 과거진행형으로 완성하면? “A bird ___ over the lake.”', 'was flying', ['were flying', 'was fly', 'is fly'], '과거 시점의 진행이며 a bird는 단수이므로 was flying입니다.'),
        item('context', '수업 중인 지금 선생님들이 회의실에서 이야기하는 중이다. “The teachers ___ in the meeting room now.”의 빈칸은?', 'are talking', ['is talking', 'are talk', 'were talk'], '복수 주어 teachers의 현재진행은 are talking입니다.')
    ];
    skills.pastFuture = [
        item('context', '이미 끝난 지난 금요일 일을 말한다. “We ___ the old castle last Friday.”의 빈칸은?', 'visited', ['visit', 'visits', 'will visit'], 'last Friday는 끝난 과거 시점이므로 visited를 씁니다.'),
        item('context', '어제 길에서 친구를 만난 일을 적는다. “I ___ my friend on the street yesterday.”의 빈칸은?', 'saw', ['see', 'sees', 'will see'], 'yesterday는 과거 시점이며 see의 과거형은 saw입니다.'),
        item('correction', '내일 가져오겠다는 약속이다. “She will brings the tickets tomorrow.”의 수정은?', 'brings → bring', ['will → was', 'brings → brought', 'brings → bringing'], 'will 뒤에는 주어와 관계없이 동사원형 bring을 씁니다.'),
        item('meaning', '“The club will plant trees next Saturday.”가 나타내는 일은?', '동아리가 다음 토요일에 나무를 심을 것이다.', ['동아리가 지난 토요일 나무를 심었다.', '동아리가 매주 토요일 나무를 심는다.', '동아리가 지금 나무를 심는 중이다.'], 'will과 next Saturday가 앞으로 할 일을 나타냅니다.'),
        item('correction', '지난밤 이미 귀가했다. “My parents go home last night.”에서 동사를 고치면?', 'go → went', ['go → goes', 'go → going', 'go → will go'], 'last night는 끝난 과거이며 go의 과거형은 went입니다.'),
        item('context', '팀은 다음 주에 새 계획을 발표할 것이다. 미래 표현으로 빈칸을 채우면? “The team ___ announce a new plan next week.”', 'will', ['did', 'was', 'has'], 'will + announce로 미래에 할 일을 나타냅니다.'),
        item('meaning', '“Leo carried the boxes yesterday.”의 시제를 유지한 해석은?', '레오는 어제 상자들을 날랐다.', ['레오는 내일 상자들을 나를 것이다.', '레오는 매일 상자들을 나른다.', '레오는 지금 상자들을 나르는 중이다.'], 'carried와 yesterday가 끝난 과거 일을 나타냅니다.'),
        item('correction', '다음 월요일에 출발할 것이다. “We will left on Monday.”의 올바른 수정은?', 'left → leave', ['will → did', 'left → leaves', 'left → leaving'], 'will 다음에는 과거형 left가 아니라 동사원형 leave를 씁니다.')
    ];
    skills.modals = [
        item('meaning', '전시실 입장은 무료여서 표를 살 의무가 없고 원하면 기념 표를 살 수 있다. 알맞은 안내는?', 'You do not have to buy a ticket.', ['You must not buy a ticket.', 'You must buy a ticket.', 'You cannot buy a ticket.'], '살 필요가 없다는 불필요는 do not have to입니다. must not/cannot은 금지 의미입니다.'),
        item('context', '담당자가 출입 금지 구역임을 분명히 알린다. “You ___ enter this area.”의 빈칸은?', 'must not', ['do not have to', 'may', 'should'], '허용되지 않는 행동의 금지는 must not으로 나타냅니다.'),
        item('context', '의사가 쉬는 것이 좋겠다고 충고한다. “You ___ take a short break.”의 빈칸은?', 'should', ['should to', 'are should', 'shoulds'], '충고 조동사 should 뒤에는 동사원형 take가 옵니다.'),
        item('meaning', '일기 예보에서 “It might snow this evening.”이라고 했다. 확실히 전달한 내용은?', '오늘 저녁 눈이 올 가능성이 있다.', ['오늘 저녁 반드시 눈이 온다.', '오늘 저녁 눈이 오는 것은 불가능하다.', '오늘 저녁 눈이 와야 할 의무가 있다.'], 'might는 가능성을 나타내며 확실한 발생을 단정하지 않습니다.'),
        item('correction', '규칙에 따라 가방을 맡겨야 한다. “Visitors must leaves their bags here.”의 수정은?', 'leaves → leave', ['must → are', 'leaves → to leave', 'leaves → leaving'], '의무 must 뒤에는 동사원형 leave를 씁니다.'),
        item('compare', '“You must not use this lift.”와 “You do not have to use this lift.”의 차이는?', '앞은 사용 금지, 뒤는 사용할 의무가 없다는 뜻이다.', ['두 문장 모두 사용을 금지한다.', '앞은 사용 의무, 뒤는 사용 금지이다.', '두 문장 모두 반드시 사용하라는 뜻이다.'], 'must not은 금지, do not have to는 불필요로 행동의 허용 여부가 다릅니다.')
    ];
    skills.commands = [
        item('context', '조용히 하라는 안내를 문법에 맞게 쓰면?', 'Be quiet in the reading room.', ['To be quiet in the reading room.', 'Being quiet in the reading room.', 'Is quiet in the reading room.'], '명령문은 주어를 생략하고 동사원형 Be로 시작합니다.'),
        item('context', '복사본에 쓰지 말라는 금지 명령을 완성하면? “___ on the copy.”', 'Don’t write', ['Not writes', 'Don’t writing', 'Doesn’t write'], '부정 명령은 Don’t + 동사원형 write입니다.'),
        item('context', '큰 건물 하나를 보며 감탄한다. “___ huge building!”의 빈칸은?', 'What a', ['How a', 'What an', 'How an'], '단수 명사구 a huge building이 중심인 감탄은 What a ...입니다.'),
        item('context', '선수의 달리는 속도를 감탄한다. “___ fast she runs!”의 빈칸은?', 'How', ['What', 'What a', 'What an'], '부사 fast를 강조하고 뒤에 주어+동사가 이어지므로 How fast she runs!입니다.'),
        item('correction', '“What an beautiful garden!”에서 한 곳을 고치면?', 'an → a', ['What → How', 'beautiful → beautifully', 'garden → gardening'], 'beautiful은 자음 소리로 시작하므로 단수 명사구는 a beautiful garden입니다.'),
        item('correction', '움직이지 말라고 “Don’t moves.”라고 썼다. 올바른 수정은?', 'Don’t move.', ['Doesn’t move.', 'Don’t moving.', 'Not moves.'], 'Don’t 뒤의 동사는 원형 move입니다.')
    ];
    skills.infinitive = [
        item('context', '사진을 찍을 목적으로 공원에 갔다. “I went to the park ___ photos.”의 빈칸은?', 'to take', ['take', 'took', 'to taking'], '방문의 목적을 나타내는 부사적 to부정사입니다.'),
        item('role', '“I have a letter to send.”에서 to send가 설명하는 대상은?', 'a letter', ['I', 'have라는 행동의 속도', '문장 전체의 시간'], 'to send는 보내야 할 편지라는 뜻으로 명사 a letter를 뒤에서 수식합니다.'),
        item('role', '“To learn a language takes time.”에서 To learn a language의 역할은?', '무엇이 시간이 걸리는지 나타내는 주어', ['시간을 꾸미는 형용사', 'takes가 일어나는 장소', '문장 전체의 서술동사'], 'to부정사구가 주어 자리에 쓰여 언어를 배우는 것이라는 명사 역할을 합니다.'),
        item('correction', '물을 마시려고 멈췄다는 목적을 나타낸다. “I paused to drinking water.”의 수정은?', 'to drinking → to drink', ['paused → pause만 적용한다.', 'to drinking → drank', 'water 앞에 to를 넣는다.'], '목적의 to부정사는 to + 동사원형 drink입니다.'),
        item('role', '“She hopes to become a pilot.”에서 to become a pilot이 채우는 자리는?', '희망하는 내용을 나타내는 목적어', ['pilot를 꾸미는 앞 형용사', '주어 She를 대신하는 대명사', 'hopes를 꾸미는 장소 표현'], '희망하는 내용을 담은 to부정사구가 동사 hopes의 목적어입니다.'),
        item('context', '함께 앉아서 쓸 의자를 찾는다. “We need chairs ___ on.”의 빈칸은?', 'to sit', ['to sitting', 'sat', 'sits'], 'chairs를 뒤에서 설명하는 형용사적 to부정사 to sit on입니다.')
    ];
    skills.gerund = [
        item('context', '친구는 모형 만들기를 즐긴다. “My friend enjoys ___ models.”의 빈칸은?', 'building', ['to build', 'build', 'built'], 'enjoy는 목적어로 동명사 building을 취합니다.'),
        item('context', '숙제 읽기를 끝냈다. “We finished ___ the chapter.”의 빈칸은?', 'reading', ['to read', 'read', 'to reading'], 'finish 뒤 동작을 나타내는 목적어는 동명사 reading입니다.'),
        item('meaning', '차를 운전하다가 전화하려고 잠시 멈췄다. 의도에 맞는 문장은?', 'I stopped to make a call.', ['I stopped making a call.', 'I stopped to making a call.', 'I stopped made a call.'], '다른 행동을 하려고 멈춘 것은 stop to do입니다. stop doing은 그 행동 자체를 그만둔 것입니다.'),
        item('meaning', '“The workers stopped painting.”가 뜻하는 상황은?', '작업자들이 페인트칠하던 행동을 그만두었다.', ['작업자들이 페인트칠하려고 다른 일을 멈췄다.', '작업자들이 페인트칠하기로 계획했다.', '작업자들이 페인트칠을 즐겼다.'], 'stop doing은 하던 행동을 멈추는 뜻입니다.'),
        item('correction', '“They plan visiting the island.”에서 방문할 계획이라는 뜻을 유지해 고치면?', 'visiting → to visit', ['plan → plans', 'visiting → visited', 'island → islands'], 'plan은 to부정사를 목적어로 취하므로 plan to visit입니다.'),
        item('correction', '“Would you mind to open the gate?”에서 배운 동사 뒤 형태를 고치면?', 'to open → opening', ['mind → minds', 'to open → opened', 'to open → opens'], 'mind 뒤의 동작 목적어는 동명사 opening입니다.')
    ];
    skills.quantity = [
        item('context', '병 속 우유의 양을 묻는다. “How ___ milk is in the bottle?”의 빈칸은?', 'much', ['many', 'a few', 'several'], 'milk는 셀 수 없는 명사이므로 양은 much로 묻습니다.'),
        item('context', '방에 의자가 많이 있음을 나타낸다. “There are ___ chairs in the room.”의 빈칸은?', 'many', ['much', 'a little', 'an'], 'chairs는 셀 수 있는 복수명사이므로 many를 씁니다.'),
        item('correction', '민수 혼자 자기 힘으로 했다. “Minsu fixed the clock by themselves.”의 수정은?', 'themselves → himself', ['Minsu → We', 'fixed → fixing', 'themselves → ourselves'], '한 남자 Minsu를 받는 재귀대명사는 himself입니다.'),
        item('correction', '학생들 여럿이 스스로 준비했다. “The students prepared the meal by herself.”의 수정은?', 'herself → themselves', ['herself → himself', 'herself → itself', 'herself → myself'], '복수 주어 The students와 일치하는 재귀대명사는 themselves입니다.'),
        item('context', '설탕을 셀 수 없는 물질로 말한다. “There isn’t ___ sugar in the jar.”의 빈칸은?', 'much', ['many', 'a few', 'several'], '셀 수 없는 명사 sugar의 양은 much로 표현합니다.'),
        item('compare', '명사의 수에 맞게 짝지은 표현은?', 'many oranges / much rice', ['much oranges / many rice', 'a little oranges / many rice', 'many orange / several rice'], 'oranges는 셀 수 있는 복수명사이고 rice는 셀 수 없는 명사입니다.')
    ];
    skills.adverbs = [
        item('context', '안내원이 또렷하게 말하는 방식을 나타낸다. “The guide speaks ___.”의 빈칸은?', 'clearly', ['clear', 'clearness', 'a clear'], '동사 speaks의 방식을 꾸미므로 부사 clearly입니다.'),
        item('context', '작업 뒤 방의 조용한 상태를 말한다. “The room is ___.”의 빈칸은?', 'quiet', ['quietly', 'quietness', 'a quietly'], 'be동사 뒤에서 주어의 상태를 설명하므로 형용사 quiet입니다.'),
        item('position', '“그는 항상 정시에 도착한다”를 자연스러운 빈도부사 위치로 쓰면?', 'He always arrives on time.', ['He arrives on always time.', 'He arrives on time alwaysly.', 'He alwaysly arrives on time.'], '빈도부사 always는 일반동사 arrives 앞에 둡니다. alwaysly라는 형태는 쓰지 않습니다.'),
        item('position', '“그녀는 대체로 바쁘다”의 뜻에 맞는 문장은?', 'She is usually busy.', ['She is busy usuallyly.', 'She usuallyly is busy.', 'She is usual busy.'], '빈도부사 usually는 be동사 is 뒤에 놓입니다.'),
        item('correction', '신중하게 운전한다는 뜻이다. “My uncle drives careful.”의 수정은?', 'careful → carefully', ['drives → is', 'careful → care', 'careful → a careful'], 'drives의 방식을 설명하므로 부사 carefully를 씁니다.'),
        item('compare', '“a patient nurse”와 “wait patiently”에서 꾸미는 대상을 바르게 설명한 것은?', 'patient는 간호사, patiently는 기다리는 행동을 꾸민다.', ['patient와 patiently 모두 명사 nurse만 꾸민다.', 'patient는 기다리는 행동, patiently는 간호사를 꾸민다.', 'patient와 patiently는 모두 문장의 동사이다.'], '형용사는 명사나 주어의 성질을, 부사는 행동의 방식을 꾸밉니다.')
    ];
    skills.comparison = [
        item('context', '기차는 80km/h, 버스는 50km/h로 달린다. 문법과 사실에 맞는 비교는?', 'The train is faster than the bus.', ['The train is fastest than the bus.', 'The train is more faster than the bus.', 'The bus is faster than the train.'], '두 대상의 속도를 비교하므로 faster than이며 기차의 속도가 더 빠릅니다.'),
        item('context', '세 밧줄은 각각 2m, 4m, 7m이다. 7m 밧줄을 전체 중 가장 긴 것으로 나타내면?', 'It is the longest of the three.', ['It is longer of the three.', 'It is the most longest of the three.', 'It is the long of the three.'], '전체 범위에서 가장 긴 것은 the longest이며 more/most와 -est를 겹치지 않습니다.'),
        item('context', '두 상자는 무게가 똑같다. “This box is ___ that box.”의 빈칸은?', 'as heavy as', ['as heavier as', 'as heavy than', 'heavier as'], '같은 정도는 as + 형용사 원급 + as로 표현합니다.'),
        item('correction', '두 경로 중 더 짧다는 뜻이다. “This route is more shorter than that one.”의 수정은?', 'more를 지운다.', ['than을 of로 바꾼다.', 'shorter를 shortest로 바꾼다.', 'more를 most로 바꾼다.'], 'shorter에 이미 비교급 -er가 있으므로 more를 함께 쓰지 않습니다.'),
        item('meaning', '“The green bag is smaller than the red bag.”에서 알 수 있는 것은?', '빨간 가방이 초록 가방보다 크다.', ['초록 가방이 빨간 가방보다 크다.', '두 가방의 크기가 같다.', '초록 가방이 모든 가방 중 가장 크다.'], 'green이 red보다 작다는 비교 관계를 반대로 읽으면 red가 더 큽니다.'),
        item('context', '네 학생 중 준이 가장 키가 크다. 빈칸을 완성하면? “Jun is ___ student in the group.”', 'the tallest', ['taller than', 'as tall', 'most taller'], '한 집단에서 키가 가장 큰 사람은 the tallest로 나타냅니다.')
    ];
    skills.connections = [
        item('context', '전기가 끊겨 불을 켜지 못했다는 이유를 잇는다. “We couldn’t turn on the light ___ the power was out.”의 빈칸은?', 'because', ['but', 'or', 'under'], '뒤 절이 앞 상황의 원인이므로 because입니다.'),
        item('context', '빵 또는 밥 중 하나를 고르게 한다. “You can choose bread ___ rice.”의 빈칸은?', 'or', ['because', 'at', 'under'], '선택 관계의 두 명사를 연결하는 접속사는 or입니다.'),
        item('context', '정확히 오전 9시 시작이다. “The lesson starts ___ nine o’clock.”의 빈칸은?', 'at', ['on', 'in', 'under'], '정확한 시각 앞에는 at을 씁니다.'),
        item('context', '금요일에 다시 만나자는 약속이다. “See you ___ Friday.”의 빈칸은?', 'on', ['at', 'in', 'because'], '요일 Friday 앞의 전치사는 on입니다.'),
        item('meaning', '“Wash your hands before you eat.”가 나타내는 순서는?', '손을 씻고 나서 먹는다.', ['먹고 나서 손을 씻는다.', '먹는 대신 손을 씻는다.', '손을 씻지 말고 먹는다.'], 'before you eat은 먹기 전에라는 시간 관계입니다.'),
        item('correction', '비가 왔지만 밖에서 기다렸다는 대조이다. “It rained because we waited outside.”의 연결어를 고치면?', 'because → but', ['because → under', 'because → at', 'because → in'], '비가 왔다는 조건과 밖에서 기다렸다는 행동이 대조되므로 but을 씁니다.')
    ];
    skills.wh = [
        item('context', '“At the community center.”라는 장소 답을 얻으려 한다. “___ do you practice?”의 빈칸은?', 'Where', ['When', 'Why', 'Who'], '장소를 묻는 의문사는 Where입니다.'),
        item('context', '“Because I missed the bus.”라는 답에 맞는 질문은?', 'Why were you late?', ['Where were you late?', 'Who were you late?', 'When were you late?'], 'because로 제시한 이유를 묻는 의문사는 Why입니다.'),
        item('context', '버스가 떠나는 시각을 묻는다. “___ does the bus leave?”의 빈칸은?', 'When', ['Who', 'Why', 'Where'], '떠나는 시간을 묻는 의문사는 When입니다.'),
        item('context', '상자를 연 사람이 누구인지 묻는 주어 의문문을 완성하면? “___ opened the box?”', 'Who', ['Where', 'When', 'Why'], '사람이 주어인 질문은 Who가 주어 자리를 맡고 바로 동사 opened가 이어집니다.'),
        item('correction', '사는 장소를 묻는다. “Where you live?”의 올바른 수정은?', 'Where do you live?', ['Where does you live?', 'Where are you live?', 'Where do you lives?'], '일반동사의 현재 의문문은 Where + do + you + 동사원형 live입니다.'),
        item('context', '“By train.”이라는 이동 방법을 답하려면 “___ did you get there?”에 무엇을 쓰는가?', 'How', ['When', 'Who', 'Why'], '방법이나 수단을 묻는 의문사는 How입니다.')
    ];
    skills.tags = [
        item('context', '두 음료 중 하나를 고르라고 묻는다. “Would you like milk ___ water?”의 빈칸은?', 'or', ['because', 'under', 'at'], '선택 의문문은 선택지를 or로 잇습니다.'),
        item('context', '“The children are hungry, ___?”의 빈칸은?', 'aren’t they', ['are they', 'isn’t he', 'don’t they'], '앞이 긍정 be동사 are이므로 부가의문은 부정형 aren’t와 복수 대명사 they입니다.'),
        item('context', '“She doesn’t drive, ___?”의 빈칸은?', 'does she', ['doesn’t she', 'is she', 'do they'], '앞이 일반동사 현재 부정문이므로 긍정형 does she를 덧붙입니다.'),
        item('context', '“Tom can swim, ___?”의 빈칸은?', 'can’t he', ['can he', 'doesn’t he', 'isn’t it'], '앞 문장 조동사 can을 유지하고 긍정에 반대되는 can’t he로 확인합니다.'),
        item('correction', '“The shop isn’t open, isn’t it?”의 부가의문을 고치면?', 'isn’t it → is it', ['isn’t it → does it', 'isn’t it → are they', 'isn’t it → don’t it'], '앞이 be동사 부정문이므로 뒤는 긍정형 is it입니다.'),
        item('meaning', '“Don’t you like carrots?”에 실제로 당근을 좋아한다고 답하려면?', 'Yes, I do.', ['No, I do.', 'Yes, I don’t.', 'No, I am.'], '영어의 대답은 질문의 부정 형태와 상관없이 실제로 좋아하면 Yes, I do.입니다.')
    ];
    skills.there = [
        item('context', '건물 옆에 나무 세 그루가 있음을 처음 말한다. “___ three trees beside the building.”의 빈칸은?', 'There are', ['There is', 'It are', 'They is'], '존재 구문의 동사는 뒤 복수명사 three trees에 맞춰 are입니다.'),
        item('context', '컵 안에 물이 조금 있다. “There ___ some water in the cup.”의 빈칸은?', 'is', ['are', 'am', 'have'], 'water는 셀 수 없는 명사이며 There is를 씁니다.'),
        item('context', '근처에 우체국 하나가 있는지 묻는다. “___ a post office near here?”의 빈칸은?', 'Is there', ['Are there', 'Does there', 'There does'], '단수 존재의 의문문은 Is there + a post office입니다.'),
        item('correction', '“There is four chairs by the window.”의 수정은?', 'is → are', ['chairs → chair만 적용한다.', 'There → It', 'is → am'], '존재하는 대상 four chairs가 복수이므로 are가 필요합니다.'),
        item('meaning', '“There aren’t any apples in the basket.”가 나타내는 상황은?', '바구니에 사과가 없다.', ['바구니에 사과가 하나 있다.', '바구니에 사과가 많이 있다.', '바구니 자체가 없다.'], 'There are의 부정형 aren’t가 apples의 존재를 부정합니다.'),
        item('context', '보관함 안에 열쇠 하나가 있다. “There ___ a key in the locker.”의 빈칸은?', 'is', ['are', 'am', 'do'], '뒤의 a key가 단수이므로 There is를 씁니다.')
    ];
    skills.impersonal = [
        item('context', '밖의 기온이 높다고 말한다. “___ is hot outside.”의 빈칸은?', 'It', ['There', 'They', 'These'], '날씨나 기온을 나타낼 때는 비인칭 주어 It을 씁니다.'),
        item('context', '현재 시각이 8시라고 알린다. “___ is eight o’clock.”의 빈칸은?', 'It', ['There', 'These', 'They'], '시각 표현의 주어는 비인칭 It입니다.'),
        item('context', '항구까지 4km라는 거리이다. “___ is four kilometers to the harbor.”의 빈칸은?', 'It', ['There', 'They', 'Those'], '거리를 나타내는 It은 특정 물건을 대신하지 않는 비인칭 주어입니다.'),
        item('meaning', '“It is Tuesday today.”의 It을 바르게 설명한 것은?', '요일을 말하기 위해 쓰는 비인칭 주어', ['Tuesday라는 사람을 대신하는 대명사', '화요일에 존재하는 물건', '앞 문장에서 나온 두 물건'], '요일을 표현하는 It에는 구체적으로 가리키는 대상이 없습니다.'),
        item('correction', '오늘 눈이 온다고 말한다. “There is snowy today.”의 수정은?', 'There → It', ['is → are', 'snowy → snows만 적용한다.', 'There → They'], '날씨의 상태 snowy는 It is snowy로 표현합니다.'),
        item('compare', '실제로 특정 사물을 가리키는 It이 쓰인 문장은?', 'I bought a watch. It is expensive.', ['It is windy today.', 'It is five o’clock.', 'It is Monday.'], '첫 문장의 It은 앞에서 언급한 watch를 대신합니다. 나머지는 날씨·시간·요일의 비인칭 It입니다.')
    ];

    skills.order = [
        item('context', '“학생들이 책상을 닦는다”의 기본 어순으로 쓴 문장은?', 'The students clean the desks.', ['Clean the students the desks.', 'The desks clean the students.', 'The students the desks clean.'], '누가 하는지 The students, 행동 clean, 대상 the desks 순서입니다.'),
        item('correction', '“The rabbit carrots eats.”를 토끼가 당근을 먹는다는 기본 어순으로 고치면?', 'The rabbit eats carrots.', ['Carrots eats the rabbit.', 'Eats the rabbit carrots.', 'The rabbit carrots to eats.'], '주어 The rabbit 뒤에 동사 eats, 나머지 carrots를 둡니다.'),
        item('role', '“The girl draws a boat.”에서 행동을 하는 주어는?', 'The girl', ['draws', 'a boat', 'boat만'], '누가 그리는지 나타내는 The girl이 주어입니다.'),
        item('role', '“My uncle cooks dinner.”에서 행동을 나타내는 동사는?', 'cooks', ['My uncle', 'dinner', 'My'], 'cooks가 무엇을 하는지를 나타내며 주어 My uncle 뒤에 놓입니다.')
    ];
    skills.pronouns = [
        item('context', '“The windows are open.”에서 창문 여러 개를 대신해 같은 뜻으로 쓰면?', 'They are open.', ['It is open.', 'He is open.', 'She is open.'], '여러 창문은 복수 사물이므로 They로 받습니다.'),
        item('context', '한 개의 우산을 소개한다. “This umbrella is blue. ___ is new.”의 빈칸은?', 'It', ['They', 'He', 'She'], '사물 한 개 umbrella는 It으로 받습니다.'),
        item('context', '여학생 미나를 두 번째 문장에서 대신한다. “Mina has a kite. ___ likes it.”의 빈칸은?', 'She', ['He', 'They', 'We'], '한 명의 여학생을 주어 자리에서 대신하는 대명사는 She입니다.'),
        item('correction', '남학생 준을 소개하며 “Jun is my friend. She is kind.”라고 썼다. 두 번째 문장의 수정은?', 'She → He', ['She → They', 'She → We', 'She → It'], '한 명의 남학생 Jun을 대신하는 주격 대명사는 He입니다.')
    ];
    skills.be = [
        item('context', '두 자매가 함께 준비되었다. “My sisters ___ ready.”의 빈칸은?', 'are', ['is', 'am', 'be'], 'My sisters는 복수 주어이므로 are입니다.'),
        item('context', '말하는 사람 한 명이 자신의 역할을 소개한다. “I ___ the captain.”의 빈칸은?', 'am', ['is', 'are', 'be'], '주어 I에 맞는 현재 be동사는 am입니다.'),
        item('correction', '로봇 한 대를 가리키며 “The robot are small.”이라고 했다. 수정은?', 'are → is', ['are → am', 'small → smalls', 'The → They'], '단수 주어 The robot의 현재 be동사는 is입니다.'),
        item('correction', '“You is very helpful.”에서 주어를 유지해 고치면?', 'is → are', ['is → am', 'is → be', 'helpful → helpfully'], '주어 You와 함께 쓰는 현재 be동사는 are입니다.')
    ];
    skills.beQuestions = [
        item('context', '“The gate is closed.”를 문이 닫혔는지 묻는 질문으로 바꾸면?', 'Is the gate closed?', ['Does the gate closed?', 'Are the gate closed?', 'Do the gate closed?'], 'be동사 의문문은 Is를 주어 앞으로 옮깁니다.'),
        item('context', '“The shoes are wet.”를 젖지 않았다는 부정문으로 바꾸면?', 'The shoes are not wet.', ['The shoes not are wet.', 'The shoes do not wet.', 'The shoes is not wet.'], '복수 주어의 be동사 are 뒤에 not을 둡니다.'),
        item('correction', '“Are the bag heavy?”에서 가방 하나를 묻는 뜻을 유지해 고치면?', 'Are → Is', ['heavy → heavily', 'Are → Do', 'Are → Am'], '단수 the bag에 맞는 be동사는 Is입니다.'),
        item('context', '“Are the children tired?”에 실제로 아이들이 피곤하지 않다고 답하면?', 'No, they are not.', ['No, they do not.', 'Yes, they are not.', 'No, they is not.'], '복수 children은 they로 받고 질문의 be동사 are를 사용해 부정 답을 합니다.')
    ];
    skills.present = [
        item('context', '한 명의 요리사가 매일 수프를 만든다. “The cook ___ soup every day.”의 빈칸은?', 'makes', ['make', 'making', 'are make'], '습관의 현재형이며 3인칭 단수 The cook이므로 makes입니다.'),
        item('context', '형이 매일 영어를 공부한다. “My brother ___ English every day.”의 빈칸은?', 'studies', ['study', 'studys', 'studying'], '3인칭 단수이고 study는 자음+y로 끝나므로 studies입니다.'),
        item('correction', '“We walks to the library every Saturday.”의 주어를 유지해 고치면?', 'walks → walk', ['walks → walking', 'walks → walksies', 'We → He만 적용한다.'], 'We의 현재 습관에는 동사원형 walk를 씁니다.'),
        item('correction', '여학생 한 명의 일과이다. “She wash the cups after lunch.”의 수정은?', 'wash → washes', ['wash → washs', 'wash → washing', 'wash → are wash'], '3인칭 단수 현재이며 -sh로 끝난 동사는 -es를 붙여 washes입니다.')
    ];
    skills.doQuestions = [
        item('context', '새 이웃 한 사람이 고양이를 좋아하는지 묻는다. “___ your neighbor like cats?”의 빈칸은?', 'Does', ['Do', 'Is', 'Are'], '일반동사 현재 질문에서 단수 your neighbor에는 Does를 씁니다.'),
        item('context', '“They do not ___ football.”의 빈칸은?', 'play', ['plays', 'playing', 'played'], 'do not 뒤의 일반동사는 원형 play입니다.'),
        item('correction', '“Does the shop opens early?”의 주어와 현재 질문을 유지해 고치면?', 'opens → open', ['Does → Is', 'opens → opening', 'Does → Do'], 'Does 뒤 본동사는 3인칭 단수 어미 없이 open으로 씁니다.'),
        item('correction', '“He do not eat onions.”의 수정은?', 'do → does', ['eat → eats', 'do → is', 'eat → eating'], '3인칭 단수 He의 일반동사 현재 부정문은 does not + 원형 eat입니다.')
    ];
    skills.plans = [
        item('context', '우리는 이번 주말에 수영할 계획이다. “We ___ swim this weekend.”의 빈칸은?', 'are going to', ['is going to', 'are going', 'going to'], '복수 주어 We에는 are going to + 동사원형을 씁니다.'),
        item('correction', '한 학생의 내일 계획이다. “She are going to sing tomorrow.”의 수정은?', 'are → is', ['sing → sings', 'are → am', 'going → went'], 'be going to에서 단수 주어 She의 be동사는 is입니다.'),
        item('context', '곧 도와주겠다는 약속이다. “I will ___ you soon.”의 빈칸은?', 'help', ['helps', 'helped', 'helping'], 'will 다음에는 동사원형 help를 씁니다.'),
        item('meaning', '“They are going to paint the fence.”가 나타내는 내용은?', '그들은 울타리에 페인트칠할 계획이다.', ['그들은 울타리에 페인트칠을 끝냈다.', '그들은 매일 울타리에 페인트칠한다.', '그들은 울타리에 페인트칠하지 않는다.'], 'be going to는 앞으로 할 계획을 나타냅니다.')
    ];
    skills.basicCommands = [
        ...skills.commands.slice(0, 2),
        item('context', '함께 공원을 청소하자는 제안이다. “Let’s ___ the park.”의 빈칸은?', 'clean', ['cleans', 'cleaning', 'cleaned'], 'Let’s 뒤에는 동사원형 clean을 씁니다.'),
        item('correction', '“Let’s to share the crayons.”를 바르게 고치면?', 'to를 지운다.', ['share를 shares로 바꾼다.', 'share를 shared로 바꾼다.', 'Let’s를 Doesn’t로 바꾼다.'], '함께 하자는 제안은 Let’s + 동사원형 share입니다.')
    ];
    skills.basicModals = [
        item('context', '할머니는 중국어를 말할 능력이 있다. “My grandmother can ___ Chinese.”의 빈칸은?', 'speak', ['speaks', 'speaking', 'to speak'], '능력 조동사 can 뒤에는 동사원형 speak를 씁니다.'),
        item('context', '규칙상 모두 안전띠를 매야 한다. “Everyone must ___ a seat belt.”의 빈칸은?', 'wear', ['wears', 'wearing', 'to wear'], '의무 must 뒤에는 동사원형 wear입니다.'),
        item('meaning', '“The child can ride a bike.”가 전달하는 뜻은?', '그 아이는 자전거를 탈 수 있다.', ['그 아이는 반드시 자전거를 타야 한다.', '그 아이는 자전거를 타면 안 된다.', '그 아이는 어제 자전거를 샀다.'], 'can은 여기서 능력을 나타냅니다.'),
        item('correction', '“You must to follow the rule.”의 수정은?', 'to를 지운다.', ['follow를 follows로 바꾼다.', 'must를 are로 바꾼다.', 'follow를 following으로 바꾼다.'], '조동사 must 바로 뒤에는 동사원형 follow가 옵니다.')
    ];
    bind('elementary', 'e1', 0, '영어 문장의 기본 순서', 'order');
    bind('elementary', 'e1', 1, '명사와 대명사', 'pronouns');
    bind('elementary', 'e2', 0, 'am, are, is', 'be');
    bind('elementary', 'e2', 1, 'be동사의 부정문과 의문문', 'beQuestions');
    bind('elementary', 'e3', 0, '현재형과 3인칭 단수', 'present');
    bind('elementary', 'e3', 1, 'do와 does', 'doQuestions');
    bind('elementary', 'e4', 0, '일반동사의 과거', 'pastFuture', [0, 1, 4, 6]);
    bind('elementary', 'e4', 1, '미래와 be going to', 'plans');
    bind('elementary', 'e5', 0, '명령문과 Let’s', 'basicCommands');
    bind('elementary', 'e5', 1, 'can과 must', 'basicModals');
    bind('elementary', 'e6', 0, '형용사와 부사', 'adverbs', [0, 1, 4, 5]);
    bind('elementary', 'e6', 1, '전치사와 접속사', 'connections', [0, 1, 2, 3, 5]);

    const middle = [
        ['m1', '1·2·3형식', 'structure', '4·5형식', 'objects'],
        ['m2', '진행시제', 'progressive', '과거와 미래', 'pastFuture'],
        ['m3', '조동사의 의미', 'modals', '명령문과 감탄문', 'commands'],
        ['m4', 'to부정사의 세 용법', 'infinitive', '동명사와 목적어', 'gerund'],
        ['m5', '명사와 대명사의 수', 'quantity', '형용사와 부사', 'adverbs'],
        ['m6', '비교급과 최상급', 'comparison', '접속사와 전치사', 'connections'],
        ['m7', '의문사 의문문', 'wh', '선택·부가·부정 의문문', 'tags'],
        ['m8', 'There is / are', 'there', '날씨·시간·거리의 it', 'impersonal']
    ];
    for (const [id, title0, skill0, title1, skill1] of middle) {
        bind('middle', id, 0, title0, skill0);
        bind('middle', id, 1, title1, skill1);
    }
    // These high-school lessons explicitly teach the same operation; no unit-wide fallback.
    bind('high1', 'h1u1', 1, '주어·보어와 목적어·보어', 'structure', [1, 2, 3, 5]);
    bind('high1', 'h1u1', 1, '주어·보어와 목적어·보어', 'objects');
    bind('high1', 'h1u3', 0, '의무·금지·불필요의 구별', 'modals', [0, 1, 4, 5]);
    bind('high1', 'h1u4', 0, 'to부정사의 역할과 의미상 주어', 'infinitive');
    bind('high1', 'h1u4', 1, '동명사와 전치사 to', 'gerund', [0, 1, 4]);
    bind('high1', 'h1u6', 1, '원급·비교급·최상급', 'comparison');

    function learnedLessons(unit, attempts) {
        const learned = new Set();
        for (const [index, lesson] of (unit.lessons || []).entries()) {
            if (attempts.some(a => {
                if (!a) return false;
                // An explicit index is authoritative. Text fallback is for older saved attempts only.
                if (Number.isInteger(a.lessonIndex)) return a.lessonIndex === index;
                return (lesson.examples || []).some(pair => pair.some(part => [a.answer, a.correctAnswer, a.question].some(v =>
                    normalize(v) && normalize(part) && normalize(v).includes(normalize(part))))) ||
                    [lesson.title, lesson.principle].some(rule => rule && rule.length > 8 && normalize(a.explanation).includes(normalize(rule)));
            })) learned.add(index);
        }
        return learned;
    }
    root.MockRetakeGrammar = Object.freeze({
        create(scope, rng = Math.random) {
            const context = scope?.context || {}, stageId = context.levelId || context.stageId;
            const unit = root.EnglishGrammarData?.[stageId]?.units?.find(u => u.id === context.unitId);
            if (!unit || !Array.isArray(scope?.attempts)) return [];
            const learned = learnedLessons(unit, scope.attempts), result = [], seen = new Set();
            for (const binding of bindings) {
                if (binding.stageId !== stageId || binding.unitId !== unit.id || !learned.has(binding.lessonIndex) ||
                    unit.lessons[binding.lessonIndex]?.title !== binding.title) continue;
                for (const [index, q] of skills[binding.skill].entries()) {
                    if (binding.indexes && !binding.indexes.includes(index)) continue;
                    const core = `${normalize(q.question)}|${normalize(q.answer)}`;
                    if (seen.has(core) || q.choices.length !== 4 || new Set(q.choices.map(normalize)).size !== 4 ||
                        q.choices.filter(choice => choice === q.answer).length !== 1) continue;
                    seen.add(core);
                    const choices = [...q.choices];
                    for (let i = choices.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [choices[i], choices[j]] = [choices[j], choices[i]]; }
                    result.push({ id: `grammar-retake:${stageId}:${unit.id}:${binding.lessonIndex}:${binding.skill}:${index}`,
                        stageId, unitId: unit.id, lessonIndex: binding.lessonIndex, question: q.question, answer: q.answer, choices,
                        explanation: q.explanation, conceptId: `lesson:${binding.lessonIndex}`,
                        templateFamily: `grammar-retake:${binding.skill}:${q.task}`, noveltyKind: 'new-context-application',
                        cognitiveDemand: 'application', difficulty: 'standard', sourceType: '추가 모의고사 · 새 문맥 문법 적용' });
                }
            }
            return result;
        }
    });
})(window);

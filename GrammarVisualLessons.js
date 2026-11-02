/* Authored teaching cards. Each key names an actual curriculum lesson;
 * examples and Korean registers are written explicitly, never transformed. */
(function () {
    'use strict';
    const lessons = Object.create(null);
    function add(stage, unit, index, rule, flow, spoken, written) {
        lessons[`${stage}/${unit}/${index}`] = Object.freeze({
            visualKind: unit === 'e1' && index === 1 ? 'nouns' : /^(e4|m2|m9|n2u1|n3u1|h2u1)$/.test(unit) ? 'time' : ((unit === 'm6' && index === 0) || (unit === 'h3u4' && index === 1)) ? 'compare' : /^(n3u2|h2u2|h3u2)$/.test(unit) ? 'condition' : 'structure',
            rule, flow: Object.freeze(flow.map(node => Object.freeze(node))),
            examples: Object.freeze([
                Object.freeze({ register: '구어체', en: spoken[0], ko: spoken[1] }),
                Object.freeze({ register: '문어체', en: written[0], ko: written[1] })
            ])
        });
    }

    add('elementary', 'e1', 0, '영어 평서문은 누가 → 무엇을 하는지 → 나머지 정보 순서로 읽어요.',
        [['주어', '누가 / 무엇이'], ['동사', '행동 / 상태'], ['나머지', '대상 · 장소 · 시간']],
        ["I'm reading a book at home.", '나는 집에서 책을 읽고 있어.'],
        ['Mina reads a book at home.', '미나는 집에서 책을 읽는다.']);
    add('elementary', 'e1', 1, '이름인 명사를 다시 말할 때는 수와 대상에 맞는 대명사로 받아요.',
        [['명사', 'Mina / books'], ['대상과 수', '한 사람 / 여러 사물'], ['대명사', 'she / they']],
        ["Mina is here, and she's ready.", '미나가 여기 와 있어. 준비를 마쳤어.'],
        ['The books are new, and they are on the desk.', '그 책들은 새것이다. 책상 위에 있다.']);
    add('elementary', 'e2', 0, '주어가 I이면 am, you·we·they이면 are, he·she·it이면 is를 써요.',
        [['주어 선택', 'I / we / she'], ['be동사', 'am / are / is'], ['상태 · 위치', 'ready / at home']],
        ["We're at home.", '우리는 집에 있어.'],
        ['She is at the library.', '그녀는 도서관에 있다.']);
    add('elementary', 'e2', 1, 'be 뒤에 not을 붙이면 부정, be를 주어 앞으로 옮기면 질문이에요.',
        [['기본', 'You are ready.'], ['부정', 'You are not ready.'], ['질문', 'Are you ready?']],
        ["I'm not at home.", '나는 집에 없어.'],
        ['Is she at home? No, she is not at home.', '그녀는 집에 있는가? 아니다. 집에 있지 않다.']);
    add('elementary', 'e3', 0, '현재 습관을 말할 때 he·she·it 같은 3인칭 단수 주어에는 동사 -(e)s를 붙여요.',
        [['현재 습관', 'every day'], ['주어 확인', 'he / she / it'], ['동사 변화', 'walk → walks']],
        ["She knows I'm at home.", '그녀는 내가 집에 있는 걸 알고 있어.'],
        ['Mina studies English every evening.', '미나는 매일 저녁 영어를 공부한다.']);
    add('elementary', 'e3', 1, '일반동사 질문·부정에는 do·does를 쓰고, 뒤의 동사는 원형으로 둬요.',
        [['주어 확인', 'I / she'], ['도움 동사', 'do / does + not'], ['본동사', 'like · drink 원형']],
        ["She doesn't have a bike.", '그녀는 자전거가 없어.'],
        ['Does he like music? He does not like music.', '그는 음악을 좋아하는가? 그는 음악을 좋아하지 않는다.']);
    add('elementary', 'e4', 0, '끝난 과거의 일은 -(e)d 또는 went·saw 같은 불규칙 과거형으로 나타내요.',
        [['시간', 'yesterday / last week'], ['끝난 일', 'visit / go'], ['과거형', 'visited / went']],
        ["We visited Busan yesterday, but we didn't see the beach.", '우리는 어제 부산을 방문했지만 해변은 보지 못했어.'],
        ['He went home after school yesterday.', '그는 어제 방과 후에 집에 갔다.']);
    add('elementary', 'e4', 1, '미래는 will + 동사원형, 미리 정한 계획은 be going to + 동사원형으로 말해요.',
        [['앞으로 할 일', '미래'], ['선택', 'will / be going to'], ['행동', '동사원형']],
        ["I'm going to visit Busan tomorrow.", '나는 내일 부산에 가려고 계획하고 있어.'],
        ['We will help the new students.', '우리는 새 학생들을 도울 것이다.']);
    add('elementary', 'e5', 0, '명령은 동사원형, 부정 명령은 Do not, 함께하자는 제안은 Let’s로 시작해요.',
        [['말의 목적', '지시 / 금지 / 제안'], ['시작', '동사 / Do not / Let’s'], ['행동', '동사원형']],
        ["Don't touch the stove; stay back.", '난로를 만지지 말고 뒤로 물러서 있어.'],
        ['Do not run in the hall.', '복도에서는 뛰지 말아야 한다.']);
    add('elementary', 'e5', 1, 'can은 능력, must는 의무를 더하며 뒤에는 동사원형을 써요.',
        [['뜻 선택', '능력 / 의무'], ['조동사', 'can / must'], ['행동', 'swim / wear 원형']],
        ["I can't swim.", '나는 수영을 할 수 없어.'],
        ['You must wear a helmet.', '너는 반드시 헬멧을 써야 한다.']);
    add('elementary', 'e6', 0, '형용사는 명사·상태를, 부사는 행동의 방식 등을 설명해요.',
        [['꾸미는 대상', '명사 / 행동'], ['단어 선택', 'quiet / quietly'], ['쓰는 자리', 'a quiet room / speak quietly']],
        ["It's a quiet room, so I'm speaking quietly.", '조용한 방이라서 나는 조용히 말하고 있어.'],
        ['The careful student writes carefully.', '그 신중한 학생은 신중하게 글을 쓴다.']);
    add('elementary', 'e6', 1, '전치사는 명사 앞에서 관계를, 접속사는 단어·문장 사이의 연결을 나타내요.',
        [['위치 관계', 'on + the desk'], ['정보 연결', 'and / but / because'], ['문장 완성', '대상 + 관계 + 이유']],
        ["I'm at home because it's raining.", '비가 와서 나는 집에 있어.'],
        ['The book is on the desk, and the bag is under it.', '책은 책상 위에 있고 가방은 그 아래에 있다.']);

    add('middle', 'm1', 0, '동사 뒤에 보어가 오면 2형식, 목적어가 오면 3형식이며 1형식은 둘 다 필요 없어요.',
        [['동사 찾기', 'sleep / seem / read'], ['필요한 성분', '없음 / 보어 / 목적어'], ['형식', 'S+V / S+V+C / S+V+O']],
        ["I'm happy, and I read novels every day.", '나는 행복하게 지내며 매일 소설을 읽고 있어.'],
        ['Birds fly. Mina seems happy. Mina reads novels.', '새들은 난다. 미나는 행복해 보인다. 미나는 소설을 읽는다.']);
    add('middle', 'm1', 1, '4형식은 누구에게 무엇을, 5형식은 목적어가 어떤 상태인지까지 말해요.',
        [['동사 뒤', 'give / make'], ['4형식', '사람 + 물건'], ['5형식', '대상 + 대상의 상태']],
        ["You've made me happy.", '네가 나를 행복하게 해 주었어.'],
        ['She gave me a book, and the book made me happy.', '그녀는 나에게 책을 주었고 그 책은 나를 행복하게 했다.']);
    add('middle', 'm2', 0, '특정 순간에 하던 동작은 그때의 be동사 + -ing로 나타내요.',
        [['기준 시점', '지금 / 과거 그때'], ['be동사', 'am·are·is / was·were'], ['동작', 'reading · running']],
        ["I'm reading now.", '나는 지금 책을 읽고 있어.'],
        ['They were studying at eight last night.', '그들은 어젯밤 여덟 시에 공부하고 있었다.']);
    add('middle', 'm2', 1, '끝난 일에는 과거형, 앞으로 할 일에는 will + 동사원형을 써요.',
        [['시간 확인', '어제 / 내일'], ['형태 선택', '과거형 / will + 원형'], ['시간과 일치', 'went / will go']],
        ["I went there yesterday, and I'll go again tomorrow.", '나는 어제 거기에 갔고 내일도 다시 갈 생각을 하고 있어.'],
        ['We visited the museum last week and will visit it again next month.', '우리는 지난주에 박물관을 방문했고 다음 달에 다시 방문할 것이다.']);
    add('middle', 'm3', 0, 'may·might는 가능성, should는 충고, must는 의무를 나타내요.',
        [['말하는 태도', '가능성 / 충고 / 의무'], ['조동사', 'might / should / must'], ['동작', '동사원형']],
        ["You shouldn't stay up late.", '너는 늦게까지 깨어 있지 않는 게 좋겠어.'],
        ['Students must not use phones during the test.', '학생들은 시험 중에 휴대 전화를 사용해서는 안 된다.']);
    add('middle', 'm3', 1, '명령은 동사원형, 감탄은 What + 명사구 또는 How + 형용사·부사로 표현해요.',
        [['목적', '명령 / 감탄'], ['형태', 'Do not + 원형 / How + 형용사'], ['표현', 'Do not run. / How beautiful!']],
        ["Don't run; walk slowly.", '뛰지 말고 천천히 걸어.'],
        ['How beautiful the garden is!', '정원이 참으로 아름답다.']);
    add('middle', 'm4', 0, 'to + 동사원형은 명사 자리, 명사 수식, 목적 설명에 쓸 수 있어요.',
        [['to + 동사원형', 'to read / to eat / to help'], ['자리 확인', '주어 / 명사 뒤 / 목적'], ['역할', '명사 / 형용사 / 부사']],
        ["I'd like something to eat.", '나는 먹을 것을 좀 먹고 싶어.'],
        ['To read is useful, and she visits the library to read.', '독서는 유익하며 그녀는 책을 읽으려고 도서관을 방문한다.']);
    add('middle', 'm4', 1, '동명사는 -ing가 명사 역할을 하는 형태이며, 앞 동사에 맞춰 -ing와 to do를 골라요.',
        [['앞 동사', 'enjoy / want'], ['목적어 형태', '-ing / to + 원형'], ['동작을 명사로', 'enjoy reading / want to read']],
        ["I'm enjoying reading this book.", '나는 이 책 읽기를 즐기고 있어.'],
        ['She finished reading and wanted to rest.', '그녀는 책 읽기를 끝내고 쉬기를 원했다.']);
    add('middle', 'm5', 0, 'many는 셀 수 있는 복수명사, much는 셀 수 없는 명사와 짝을 이뤄요.',
        [['명사 확인', 'books / water'], ['셀 수 있나요?', '여러 개 / 양'], ['수량어', 'many books / much water']],
        ["I don't have many books or much time.", '나는 책도 많지 않고 시간도 별로 없어.'],
        ['The students prepared many sandwiches by themselves.', '학생들은 스스로 많은 샌드위치를 준비했다.']);
    add('middle', 'm5', 1, '명사·주어 상태에는 형용사, 동작의 방식에는 부사, 빈도부사는 동사 종류에 맞춰 둬요.',
        [['설명 대상', '상태 / 동작'], ['형태', 'careful / carefully'], ['빈도 위치', 'always writes / is always']],
        ["She's always careful and writes carefully.", '그녀는 늘 신중하고 글도 신중하게 쓰고 있어.'],
        ['The student always writes carefully and is always polite.', '그 학생은 항상 신중하게 글을 쓰고 늘 예의가 바르다.']);
    add('middle', 'm6', 0, '같은 정도는 as 원급 as, 둘의 차이는 비교급 than, 범위 안 최고는 the 최상급이에요.',
        [['비교 목적', '같음 / 차이 / 최고'], ['형태', 'as tall as / taller than / the tallest'], ['범위 확인', '비교 대상 · 전체 집단']],
        ["I've got a bigger bag than you.", '나는 네 것보다 더 큰 가방을 갖고 있어.'],
        ['Mina is as tall as Jisu, and Yuna is the tallest in the class.', '미나는 지수만큼 키가 크고 유나는 반에서 가장 크다.']);
    add('middle', 'm6', 1, '전치사 뒤에는 명사구를, because·when 같은 접속사 뒤에는 절을 이어요.',
        [['뒤의 구조', '명사구 / 주어 + 동사'], ['연결어', 'during / when'], ['완성', 'during class / when class begins']],
        ["I'll wait at the station until you arrive.", '네가 도착할 때까지 나는 역에서 기다리고 있겠어.'],
        ['We met at seven on Monday because the class began early.', '수업이 일찍 시작해서 우리는 월요일 일곱 시에 만났다.']);
    add('middle', 'm7', 0, '묻는 정보에 맞는 의문사를 앞에 두며, 의문사가 주어이면 별도 도치가 필요 없어요.',
        [['알고 싶은 정보', '장소 / 사람'], ['의문사 역할', '부사어 / 주어'], ['질문 어순', 'Where do you live? / Who lives here?']],
        ["Who's calling? I didn't hear the name.", '누가 전화한 거지? 이름을 못 들었어.'],
        ['She asked, "Who lives here, and when did they move here?"', '그녀는 “누가 여기 살고 언제 이사 왔는가?”라고 물었다.']);
    add('middle', 'm7', 1, '선택은 or로, 부가의문은 앞 문장과 반대 부정 형태로 확인해요.',
        [['앞 문장', 'You are ready.'], ['부정 형태 뒤집기', 'are → are not'], ['짧은 확인', 'aren’t you?']],
        ["You don't have a pen, do you? I've got one.", '너 펜 없지? 나는 하나 갖고 있어.'],
        ['She asked, "Do you prefer tea or coffee?"', '그녀는 “차와 커피 중 무엇을 더 좋아하는가?”라고 물었다.']);
    add('middle', 'm8', 0, '존재를 소개할 때 단수·셀 수 없는 명사에는 There is, 복수에는 There are를 써요.',
        [['처음 소개할 대상', 'a book / books'], ['수 확인', '단수 / 복수'], ['존재 표현', 'There is / There are']],
        ["There's a book on the desk.", '책상 위에 책 한 권이 있어.'],
        ['There are three students in the room.', '방 안에 학생 세 명이 있다.']);
    add('middle', 'm8', 1, '날씨·시간·거리의 it은 특정 사물을 가리키지 않고 문장의 주어 자리를 채워요.',
        [['상황', '날씨 / 시간 / 거리'], ['주어 자리', '비인칭 it'], ['상태 설명', 'It is sunny / seven / five kilometers']],
        ["It's raining outside.", '밖에 비가 내리고 있어.'],
        ['It is five kilometers from here to the station.', '여기서 역까지는 5킬로미터이다.']);
    add('middle', 'm9', 0, 'have·has + 과거분사는 경험·완료·현재에 남은 결과를 과거와 연결해요.',
        [['과거의 일', 'visit / finish / lose'], ['현재와 연결', '경험 / 완료 / 결과'], ['현재완료', 'have·has + p.p.']],
        ["I've lost my key, so I can't open the door.", '열쇠를 잃어버려서 문을 열 수 없어.'],
        ['She has already finished her homework and has visited Busan before.', '그녀는 이미 숙제를 끝냈으며 전에 부산에 가 본 적이 있다.']);
    add('middle', 'm9', 1, '과거부터 지금까지 이어진 상태에는 현재완료를 쓰고 for는 기간, since는 시작점을 붙여요.',
        [['시작점', 'since 2020'], ['지금까지 계속', 'have lived / have known'], ['기간', 'for six years']],
        ["I've known Mina for three years.", '나는 미나를 3년 전부터 알고 지내고 있어.'],
        ['She has lived here since 2020.', '그녀는 2020년부터 지금까지 이곳에 살고 있다.']);
    add('middle', 'm10', 0, '행동을 받는 대상을 주어로 두고 be + 과거분사로 수동태를 만들어요.',
        [['행동의 대상', 'the window'], ['시제에 맞는 be', 'is / was'], ['받은 행동', 'broken + 필요하면 by 행위자']],
        ["The window wasn't repaired, so it's still broken.", '창문은 수리되지 않아서 아직 깨져 있어.'],
        ['This bridge was built in 1990.', '이 다리는 1990년에 건설되었다.']);
    add('middle', 'm10', 1, '명사를 설명하는 관계절에서 사람은 who, 사물은 which, 둘 다 that으로 이을 수 있어요.',
        [['앞 명사', '사람 / 사물'], ['관계대명사', 'who / which / that'], ['설명하는 절', '명사 성분 한 자리 담당']],
        ["I've met the teacher who helped you.", '나는 너를 도와주신 선생님을 만난 적 있어.'],
        ['This is the book that explains the rule.', '이것은 그 규칙을 설명하는 책이다.']);

    add('middle2', 'n2u1', 0, '현재완료는 같은 have·has + p.p. 형태라도 문맥에 따라 경험·완료·계속·결과로 읽어요.',
        [['형태', 'have / has + p.p.'], ['문맥 단서', 'ever / already / for / 지금 상태'], ['뜻', '경험 / 완료 / 계속 / 결과']],
        ["I've already finished my homework.", '나는 숙제를 이미 끝냈어.'],
        ['She has lived here for ten years and has visited Busan twice.', '그녀는 이곳에 10년째 살고 있으며 부산에 두 번 가 본 적이 있다.']);
    add('middle2', 'n2u1', 1, '끝난 과거 시점은 단순과거, 지금까지의 경험·기간은 현재완료로 구별해요.',
        [['시간 범위', 'yesterday / so far'], ['끝났나요?', '끝난 시점 / 현재까지'], ['시제', 'went / have been']],
        ["I've been to Busan, but I went there last year.", '나는 부산에 가 본 적이 있는데 작년에 갔어.'],
        ['She visited the museum yesterday and has visited it three times so far.', '그녀는 어제 박물관을 방문했고 지금까지 세 번 방문했다.']);
    add('middle2', 'n2u2', 0, '수동태는 p.p.를 유지하고 be를 is·was·will be·has been처럼 바꿔 시제를 나타내요.',
        [['행동의 대상', 'the room'], ['시제 선택', '현재 / 과거 / 미래 / 완료'], ['수동 형태', 'is / was / will be / has been + cleaned']],
        ["The room's been cleaned.", '그 방은 청소가 끝났어.'],
        ['The room was cleaned yesterday and will be cleaned again tomorrow.', '그 방은 어제 청소되었고 내일 다시 청소될 것이다.']);
    add('middle2', 'n2u2', 1, '조동사 수동은 조동사 + be + p.p.이며 give는 사람·물건을 각각 주어로 바꿀 수 있어요.',
        [['출발', 'They gave Mina a book.'], ['받는 대상', 'Mina / a book'], ['수동 전환', 'was given a book / was given to Mina']],
        ["This book can't be borrowed today.", '이 책은 오늘 빌릴 수 없어.'],
        ['Mina was given a book. A book was given to Mina.', '미나는 책을 받았다. 책 한 권이 미나에게 주어졌다.']);
    add('middle2', 'n2u3', 0, 'what·how·where·when + to부정사는 무엇을·어떻게·어디서·언제 할지 나타내요.',
        [['모르는 정보', '무엇 / 방법 / 장소 / 시간'], ['의문사', 'what / how / where / when'], ['할 행동', 'to + 동사원형']],
        ["I don't know how to use this camera.", '나는 이 카메라를 어떻게 사용하는지 모르겠어.'],
        ['We decided where to meet and when to start.', '우리는 어디에서 만날지와 언제 시작할지를 결정했다.']);
    add('middle2', 'n2u3', 1, 'remember to do는 할 일, remember doing은 한 일이며 stop·try도 뒤 형태에 따라 뜻이 달라져요.',
        [['동사', 'remember / stop / try'], ['to do', '할 일 / 목적 / 노력'], ['doing', '한 일 / 중단할 일 / 시험 삼아 하기']],
        ["I don't remember locking the door.", '나는 문을 잠근 기억이 없어.'],
        ['She remembered to lock the door and stopped to check it.', '그녀는 문을 잠가야 한다는 것을 기억했고 확인하려고 멈췄다.']);
    add('middle2', 'n2u4', 0, '명사가 동작을 하거나 감정을 일으키면 -ing, 동작을 받거나 감정을 느끼면 p.p.를 골라요.',
        [['수식 대상', 'game / students'], ['관계', '흥미를 줌 / 흥미를 느낌'], ['분사', 'exciting / excited']],
        ["I'm excited about the exciting game.", '나는 흥미진진한 경기에 들떠 있어.'],
        ['The sleeping baby lay beside a broken chair.', '자고 있는 아기는 부서진 의자 옆에 누워 있었다.']);
    add('middle2', 'n2u4', 1, '목적어 뒤의 보어는 앞 동사가 요구하는 원형·to do·형용사·분사 중에서 골라요.',
        [['앞 동사', 'make / want / keep / see'], ['목적어', 'me / him / the door'], ['보어 형태', '원형 / to do / 형용사 / -ing']],
        ["She's making me laugh.", '그녀가 나를 웃게 하고 있어.'],
        ['They wanted him to leave and kept the door open.', '그들은 그가 떠나기를 원했고 문을 열어 두었다.']);
    add('middle2', 'n2u5', 0, '관계절의 빈자리가 주어이면 주격, 목적어이면 목적격이며 일부 목적격은 생략할 수 있어요.',
        [['관계절 분석', '___ called / I met ___'], ['빈자리 역할', '주어 / 목적어'], ['선택', 'who / whom·who·that 또는 생략']],
        ["I've met the teacher you called.", '나는 네가 전화한 선생님을 만난 적 있어.'],
        ['The teacher who called me is the teacher whom I met yesterday.', '나에게 전화한 선생님은 내가 어제 만난 선생님이다.']);
    add('middle2', 'n2u5', 1, '소유는 whose + 명사, 격식 있는 전치사 목적어는 전치사 + whom·which로 나타내요.',
        [['관계', '소유 / 전치사의 대상'], ['사람 · 사물', 'whose + 명사 / whom·which'], ['연결', 'whose book / with whom']],
        ["I've met the boy whose bike you borrowed.", '나는 네가 자전거를 빌린 아이를 만난 적 있어.'],
        ['She is the teacher to whom I sent the letter.', '그녀는 내가 편지를 보낸 선생님이다.']);
    add('middle2', 'n2u6', 0, '내용·여부를 맡는 명사절과 이유·조건을 붙이는 부사절을 구별해 접속사를 골라요.',
        [['절의 역할', '내용 / 여부 / 상황'], ['연결어', 'that / whether / because·if'], ['조건 부사절', '미래 뜻도 현재형']],
        ["I don't know whether she'll come if it rains.", '비가 오면 그녀가 올지는 모르겠어.'],
        ['Although it is cold, we will go out if the rain stops.', '비록 춥지만 비가 그치면 우리는 밖에 나갈 것이다.']);
    add('middle2', 'n2u6', 1, '질문을 문장 안에 넣으면 의문사 + 주어 + 동사, yes·no 질문은 if·whether + 평서문 어순이에요.',
        [['직접 질문', 'Where does she live?'], ['문장 안으로', 'I know + 의문사절'], ['평서문 어순', 'where she lives']],
        ["I don't know where she lives.", '나는 그녀가 어디 사는지 모르겠어.'],
        ['She asked me whether the library was open.', '그녀는 도서관이 열려 있는지 나에게 물었다.']);

    add('middle3', 'n3u1', 0, '과거보다 먼저 끝난 일은 had p.p., 기준까지 계속한 동작은 have·had been -ing로 나타내요.',
        [['시간 비교', '과거 기준 이전 / 기준까지 계속'], ['형태', 'had p.p. / have·had been -ing'], ['의미', '앞선 완료 / 이어진 동작']],
        ["I've been waiting for an hour.", '나는 한 시간째 기다리고 있어.'],
        ['She had finished dinner before he arrived.', '그가 도착하기 전에 그녀는 저녁 식사를 끝낸 상태였다.']);
    add('middle3', 'n3u1', 1, '과거의 말을 전할 때 시제를 뒤로 맞출 수 있지만, 불변의 진리는 현재형을 유지해요.',
        [['전달 동사', 'said / taught'], ['내용 성격', '당시 상황 / 불변의 진리'], ['시제 선택', '과거 계열 / 현재형']],
        ["She said she couldn't come.", '그녀는 올 수 없다고 말했어.'],
        ['The teacher taught us that the earth moves around the sun.', '선생님은 지구가 태양 주위를 돈다는 것을 가르쳐 주셨다.']);
    add('middle3', 'n3u2', 0, '현재와 다른 상상은 if + 과거형, 결과는 would·could + 동사원형으로 말해요.',
        [['현재 사실', 'I do not have time.'], ['반대 가정', 'If I had time'], ['상상한 결과', 'I would help.']],
        ["If I had time, I'd be helping you now.", '시간이 있다면 나는 지금 너를 돕고 있겠어.'],
        ['If I were you, I would ask the teacher.', '내가 너라면 선생님께 물어볼 것이다.']);
    add('middle3', 'n3u2', 1, '과거 반대 가정은 had p.p.와 would have p.p., wish의 과거 후회도 had p.p.로 나타내요.',
        [['과거 사실', 'I missed the bus.'], ['반대 조건', 'If I had left earlier'], ['다른 결과', 'I would have caught it.']],
        ["I wish I'd left earlier.", '더 일찍 나왔더라면 하고 후회하고 있어.'],
        ['I wish I had studied harder.', '더 열심히 공부했더라면 하고 후회한다.']);
    add('middle3', 'n3u3', 0, '관계절에서 장소·시간·이유를 잇는 where·when·why를 쓰며 the way와 how는 함께 쓰지 않아요.',
        [['앞 명사', 'place / time / reason'], ['절 안 관계', '장소 / 시간 / 이유'], ['관계부사', 'where / when / why']],
        ["I've visited the town where you grew up.", '나는 네가 자란 마을에 가 본 적 있어.'],
        ['This is the way she solved the problem.', '이것은 그녀가 문제를 해결한 방법이다.']);
    add('middle3', 'n3u3', 1, '쉼표 뒤 관계절은 정보를 더하며 that을 쓰지 않고, whoever·whatever는 선행사 뜻을 포함해요.',
        [['추가 정보', '쉼표 + who / which'], ['포함된 선행사', 'anyone / anything'], ['복합관계사', 'whoever / whatever']],
        ["I'm helping whoever needs me.", '나를 필요로 하는 사람은 누구든 돕고 있어.'],
        ['Mina passed the test, which surprised us.', '미나가 시험에 합격했으며 그 사실은 우리를 놀라게 했다.']);
    add('middle3', 'n3u4', 0, '부사절과 주절의 주어가 같으면 접속사·주어를 줄이고 동사를 -ing로 바꿀 수 있어요.',
        [['원래 절', 'When she saw me'], ['같은 주어 확인', 'she = 주절의 she'], ['분사구문', 'Seeing me, she waved.']],
        ["Walking home, I'm thinking about the test.", '집으로 걸어가면서 시험에 대해 생각하고 있어.'],
        ['Seeing me, she waved.', '그녀는 나를 보고 손을 흔들었다.']);
    add('middle3', 'n3u4', 1, '수동 관계는 p.p., 주절보다 앞선 완료는 having p.p., 부정은 not을 분사 앞에 둬요.',
        [['관계 · 순서', '수동 / 앞선 완료 / 부정'], ['형태', 'p.p. / having p.p. / not -ing'], ['주절 연결', '주어가 같은지 확인']],
        ["Having finished my work, I'm resting.", '일을 마치고 이제 쉬고 있어.'],
        ['Written in simple English, the book is easy to read.', '쉬운 영어로 쓰여 있어서 그 책은 읽기 쉽다.']);
    add('middle3', 'n3u5', 0, 'It is ... that은 성분을 강조하고, Never 같은 부정 부사어가 앞에 오면 조동사와 주어를 뒤집어요.',
        [['강조할 내용', '성분 / 부정 경험'], ['구조 선택', 'It is ... that / Never + 조동사 + 주어'], ['기본 문장 확인', '강조를 풀어 원래 뜻 확인']],
        ['I said, "It\'s Mina that I want to meet."', '나는 “내가 만나고 싶은 사람은 바로 미나야”라고 말했어.'],
        ['Never have I seen such a beautiful lake.', '나는 그렇게 아름다운 호수를 본 적이 한 번도 없다.']);
    add('middle3', 'n3u5', 1, '긍정 동의는 so, 부정 동의는 neither 뒤에 조동사 + 주어를 두고 동작 반복은 do so로 줄여요.',
        [['앞말', '긍정 / 부정 / 동작'], ['반복 줄이기', 'so / neither / do so'], ['동의 어순', 'So·Neither + 조동사 + 주어']],
        ["I can't swim, and neither can Mina.", '나는 수영을 못하고 미나도 할 수 없어.'],
        ['Jisu likes music, and so does Mina. They asked us to wait, and we did so.', '지수는 음악을 좋아하고 미나도 그렇다. 그들이 기다려 달라고 해서 우리는 그렇게 했다.']);
    add('middle3', 'n3u6', 0, '말·질문을 전할 때 인칭·시점을 맞추고 질문 내용은 if·whether나 의문사 뒤 평서문 어순으로 이어요.',
        [['원래 질문', 'Where do you live?'], ['전달 동사', 'asked me'], ['간접 질문', 'where I lived']],
        ["She asked me why I couldn't come.", '그녀는 내가 왜 올 수 없는지 물었어.'],
        ['He told me that he was busy and asked whether I could wait.', '그는 바쁘다고 말하고 내가 기다릴 수 있는지 물었다.']);
    add('middle3', 'n3u6', 1, '명령 전달은 tell·ask + 목적어 + (not) to do로, 긴 문장은 절마다 주어·동사를 찾아 읽어요.',
        [['원래 명령', 'Do not open the door.'], ['듣는 사람', 'told + me'], ['전달 형태', 'not to open the door']],
        ["She's asked me to wait until she returns.", '그녀는 돌아올 때까지 기다려 달라고 나에게 부탁했어.'],
        ['He told me not to open the door because the baby was sleeping.', '아기가 자고 있었기 때문에 그는 나에게 문을 열지 말라고 했다.']);

    add('high1', 'h1u1', 0, '주어의 수식어를 묶고 핵심 명사의 수에 맞춰 주절 동사를 골라요.',
        [['긴 주어', 'The box [of old books]'], ['핵심 명사', 'box: 단수'], ['주절 동사', 'is / belongs']],
        ["The box of books isn't here.", '책들이 든 그 상자는 여기 없어.'],
        ['The students who live near the school walk to class.', '학교 근처에 사는 학생들은 걸어서 수업에 간다.']);
    add('high1', 'h1u1', 1, '보어는 주어·목적어의 상태를 설명하므로 행동 방식인 부사와 구별해요.',
        [['설명 대상', '주어 / 목적어'], ['연결 구조', 'seem / keep + 목적어'], ['상태 보어', 'happy / open 형용사']],
        ["I'm keeping the door open.", '나는 문을 열어 두고 있어.'],
        ['She seems calm and keeps the children quiet.', '그녀는 차분해 보이며 아이들을 조용하게 한다.']);
    add('high1', 'h1u2', 0, '끝난 시점은 과거형, 현재까지 이어진 기간·경험은 have·has p.p.로 판단해요.',
        [['시간 단서', 'last year / since last year'], ['현재 연결', '없음 / 있음'], ['시제', 'lived / have lived']],
        ["I've lived here since 2020.", '나는 2020년부터 여기서 살고 있어.'],
        ['She moved here in 2020 and has lived here ever since.', '그녀는 2020년에 이곳으로 이사 왔고 그때부터 계속 이곳에 살고 있다.']);
    add('high1', 'h1u2', 1, '과거의 기준 사건을 잡고 그보다 먼저 끝난 일을 had p.p.로 표시해요.',
        [['먼저 일어난 일', 'the train had left'], ['과거 기준', 'when I arrived'], ['읽는 순서', '출발 → 도착']],
        ["The train had left, so I couldn't catch it.", '기차가 이미 떠난 뒤라 탈 수 없었어.'],
        ['By the time we arrived, the meeting had started.', '우리가 도착했을 때 회의는 이미 시작된 상태였다.']);
    add('high1', 'h1u3', 0, 'must는 의무, must not은 금지, do not have to는 해도 되지만 의무는 없다는 뜻이에요.',
        [['규칙의 뜻', '필수 / 금지 / 선택'], ['형태', 'must / must not / do not have to'], ['구별', '하면 안 됨 ≠ 안 해도 됨']],
        ["You don't have to come early.", '너는 일찍 올 필요 없어.'],
        ['You must wear a helmet and must not ride on the sidewalk.', '너는 반드시 헬멧을 쓰고 인도에서는 타지 말아야 한다.']);
    add('high1', 'h1u3', 1, '수동태 p.p. 앞에서 시제는 be·been, 조동사 뒤는 be로 맞춰요.',
        [['받는 행동', 'the report / finish'], ['필요한 시제', '완료 / 조동사'], ['수동 형태', 'has been / must be + finished']],
        ["The report hasn't been finished yet.", '보고서는 아직 완성되지 않았어.'],
        ['The report must be finished by Friday.', '보고서는 금요일까지 완성되어야 한다.']);
    add('high1', 'h1u4', 0, 'to부정사의 역할을 확인하고 행동 주체는 일반 평가에 for, 성품 평가에 of로 밝혀요.',
        [['평가 표현', 'easy / kind'], ['행동의 주체', 'for me / of you'], ['행동', 'to solve / to help']],
        ["It's hard for me to understand this rule.", '나는 이 규칙을 이해하는 데 어려움을 겪고 있어.'],
        ['It is important for students to read every day.', '학생들이 매일 책을 읽는 것은 중요하다.']);
    add('high1', 'h1u4', 1, 'look forward to의 to는 전치사이므로 동작을 이어 붙일 때 -ing를 써요.',
        [['to의 역할', '전치사 / 부정사 표시'], ['뒤 형태', '명사·-ing / 동사원형'], ['비교', 'look forward to meeting / want to meet']],
        ["I'm looking forward to meeting you.", '나는 너를 만나기를 기대하고 있어.'],
        ['She is used to getting up early and wants to exercise before school.', '그녀는 일찍 일어나는 데 익숙하며 등교 전에 운동하기를 원한다.']);
    add('high1', 'h1u5', 0, '명사가 행동을 하거나 감정을 일으키면 -ing, 행동을 받거나 감정을 느끼면 p.p.로 꾸며요.',
        [['꾸밈받는 명사', 'movie / audience'], ['관계 판단', '흥미를 줌 / 흥미를 느낌'], ['분사 선택', 'exciting / excited']],
        ["I'm bored by this boring movie.", '나는 이 지루한 영화를 보며 지루함을 느끼고 있어.'],
        ['The broken window was beside a sleeping cat.', '깨진 창문은 자고 있는 고양이 옆에 있었다.']);
    add('high1', 'h1u5', 1, '관계절의 주어·목적어가 비면 관계대명사, 장소 부사어가 필요하면 where를 써요.',
        [['관계절 확인', 'I visited ___ / I lived there'], ['필요 성분', '목적어 / 장소 부사어'], ['연결어', 'which·that / where']],
        ["I've visited the town that you mentioned.", '나는 네가 언급한 마을에 가 본 적 있어.'],
        ['This is the town where I lived, and that is the house which I bought.', '이곳은 내가 살던 마을이고 저것은 내가 산 집이다.']);
    add('high1', 'h1u6', 0, '미래 조건·시간 부사절은 현재형, ‘~인지’라는 여부 명사절은 뜻에 맞는 미래형도 가능해요.',
        [['if절 역할', '조건 / 여부'], ['미래를 말할 때', '현재형 / will 가능'], ['대조', 'if she comes / if she will come']],
        ["I'll call you if she comes.", '그녀가 오면 너에게 전화할 생각을 하고 있어.'],
        ['I do not know if she will come, but I will wait until she arrives.', '그녀가 올지는 모르지만 그녀가 도착할 때까지 기다릴 것이다.']);
    add('high1', 'h1u6', 1, '같음·둘 사이 차이·전체 범위의 최고를 구분하고 more와 -er를 겹쳐 쓰지 않아요.',
        [['비교 관계', '같음 / 차이 / 최고'], ['표현', 'as fast as / faster than / the fastest'], ['점검', 'more faster는 쓰지 않음']],
        ["I've got as many books as Mina.", '나는 미나만큼 많은 책을 갖고 있어.'],
        ['This is the most useful book in the library.', '이것은 도서관에서 가장 유용한 책이다.']);

    add('high2', 'h2u1', 0, '기준까지 이어진 동작은 have·had been -ing, 미래 기준까지 끝날 일은 will have p.p.예요.',
        [['기준 시점', '지금·과거 / 미래'], ['동작의 모습', '계속 / 완료'], ['형태', 'have·had been -ing / will have p.p.']],
        ["I've been studying for two hours.", '나는 두 시간째 공부하고 있어.'],
        ['By Friday, she will have finished the report.', '금요일이면 그녀는 보고서를 완성한 상태일 것이다.']);
    add('high2', 'h2u1', 1, '과거 일의 강한 추측은 must have p.p., 불가능 추측은 cannot have p.p., 후회는 should have p.p.예요.',
        [['과거를 보는 태도', '틀림없음 / 불가능 / 아쉬움'], ['조동사', 'must / cannot / should'], ['과거 행동', 'have + p.p.']],
        ["I'm sure she can't have forgotten the meeting.", '그녀가 회의를 잊었을 리 없다고 나는 확신하고 있어.'],
        ['He must have missed the bus, and he should have left earlier.', '그는 버스를 놓친 것이 틀림없으며 더 일찍 출발했어야 했다.']);
    add('high2', 'h2u2', 0, '현재 반대는 if 과거 + would 원형, 과거 반대는 if had p.p. + would have p.p.로 맞춰요.',
        [['사실의 시간', '현재 / 과거'], ['조건', '과거형 / had p.p.'], ['결과', 'would 원형 / would have p.p.']],
        ["If I were free, I'd be helping you now.", '시간이 있다면 나는 지금 너를 돕고 있겠어.'],
        ['If she had studied harder, she would have passed the test.', '그녀가 더 열심히 공부했더라면 시험에 합격했을 것이다.']);
    add('high2', 'h2u2', 1, '과거 원인의 현재 결과는 if had p.p. + would 원형, wish는 아쉬운 사실의 시간을 먼저 봐요.',
        [['원인 시점', '과거: had p.p.'], ['결과 시점', '현재: would + 원형'], ['wish의 아쉬움', '현재는 과거형 / 과거는 had p.p.']],
        ["If I'd taken that job, I would be living in Busan now.", '그 일을 맡았더라면 나는 지금 부산에서 살고 있겠어.'],
        ['I wish I had accepted the offer, and I wish I were there now.', '그 제안을 받아들였더라면 하고 후회하며 지금 그곳에 있기를 바란다.']);
    add('high2', 'h2u3', 0, '본동사보다 앞선 일은 to have·having p.p., 행동을 받는 관계는 to be·being p.p.로 나타내요.',
        [['시간 · 태', '앞선 일 / 받는 행동'], ['부정사', 'to have p.p. / to be p.p.'], ['동명사', 'having p.p. / being p.p.']],
        ["I'm proud of having finished the project.", '나는 그 프로젝트를 끝낸 것을 자랑스럽게 여기고 있어.'],
        ['She seems to have left and dislikes being kept waiting.', '그녀는 이미 떠난 것 같으며 기다리게 되는 것을 싫어한다.']);
    add('high2', 'h2u3', 1, 'make의 수동형은 be made to do이며, have + 목적어 + p.p.는 일을 맡기거나 어떤 일을 겪는 뜻이에요.',
        [['능동 사역', 'They made me wait.'], ['수동 전환', 'I was made to wait.'], ['받는 작업', 'have my bike repaired']],
        ["I've had my bike repaired.", '나는 자전거 수리를 맡겨서 고쳤어.'],
        ['He was made to wait and was seen to leave later.', '그는 기다려야 했으며 나중에 떠나는 것이 목격되었다.']);
    add('high2', 'h2u4', 0, '분사구문 주어와 동작의 관계가 능동이면 -ing, 수동이면 p.p., 앞선 완료이면 having p.p.예요.',
        [['주절 주어 대입', '누가 행동하나요?'], ['관계 · 시점', '능동 / 수동 / 먼저 완료'], ['분사 형태', '-ing / p.p. / having p.p.']],
        ["Having read the report, I'm ready to discuss it.", '보고서를 다 읽어서 토론할 준비가 되어 있어.'],
        ['Surrounded by trees, the house stays cool in summer.', '나무들로 둘러싸여 있어서 그 집은 여름에 시원하다.']);
    add('high2', 'h2u4', 1, '주절과 주어가 다르면 분사 앞에 그 주어를 남기고, with 뒤에서도 목적어와 분사의 관계를 봐요.',
        [['두 주어 비교', '주절 주어 ≠ 분사 주어'], ['독립분사구문', 'The weather being fine'], ['with 구조', 'with + 목적어 + -ing·p.p.']],
        ["I'm studying with the window closed.", '나는 창문을 닫아 둔 채 공부하고 있어.'],
        ['The weather being fine, we went for a walk with the birds singing.', '날씨가 좋아서 우리는 새들이 노래하는 가운데 산책을 나갔다.']);
    add('high2', 'h2u5', 0, 'what은 선행사 뜻을 포함하고, 관계대명사 that은 빈자리를 맡으며 동격 that절은 내용이 완전해요.',
        [['선행사 유무', '없음 / 있음'], ['절의 빈자리', '있음 / 내용 완전'], ['선택', 'what / 관계 that / 동격 that']],
        ["I don't understand what you mean.", '나는 네가 뜻하는 것을 이해하지 못하고 있어.'],
        ['The news that she won surprised us, and the news that we heard was true.', '그녀가 이겼다는 소식은 우리를 놀라게 했고 우리가 들은 소식은 사실이었다.']);
    add('high2', 'h2u5', 1, '쉼표 뒤 which는 앞 절 전체도 받으며 whoever·whatever는 명사절이나 양보절을 이끌 수 있어요.',
        [['추가 설명', '쉼표 + which'], ['명사절', 'whoever = anyone who'], ['양보절', 'whatever = no matter what']],
        ["I'm ready to support you whatever happens.", '무슨 일이 생겨도 나는 너를 지지할 준비가 되어 있어.'],
        ['She helped whoever asked, which impressed us.', '그녀는 요청한 사람이면 누구든 도왔으며 그 사실은 우리에게 깊은 인상을 주었다.']);
    add('high2', 'h2u6', 0, '부정·only 부사어가 문두에 오면 주절을 조동사 + 주어로 도치하지만 주어 자체의 only는 도치하지 않아요.',
        [['문두 성분', 'Never / Only then'], ['주절 도치', '조동사 + 주어 + 본동사'], ['주어 only 예외', 'Only Mina knew.']],
        ["Never have I felt so happy; I can't stop smiling.", '이렇게 행복했던 적이 없어서 웃음을 멈출 수 없어.'],
        ['Only then did I understand the rule.', '그제야 나는 그 규칙을 이해했다.']);
    add('high2', 'h2u6', 1, 'and·or·not only A but also B가 잇는 요소는 같은 문장 역할과 나란한 형태로 맞춰요.',
        [['연결 범위', 'A and B'], ['같은 역할', '명사끼리 / 동작끼리'], ['형태 점검', 'reading and writing']],
        ["I'm interested in both reading and writing.", '나는 읽기와 쓰기 둘 다에 관심을 갖고 있어.'],
        ['She not only reads novels but also writes stories.', '그녀는 소설을 읽을 뿐 아니라 이야기도 쓴다.']);

    add('high3', 'h3u1', 0, '삽입된 수식어를 묶고 주절 핵심 주어와 서술동사를 연결해 수 일치를 확인해요.',
        [['문장 분리', 'The report [that she wrote]'], ['핵심 주어', 'report: 단수'], ['주절 서술동사', 'is / explains']],
        ["The report that you sent isn't complete.", '네가 보낸 보고서는 아직 완성되지 않았어.'],
        ['The students in the room who need help are waiting.', '도움이 필요한 방 안의 학생들은 기다리고 있다.']);
    add('high3', 'h3u1', 1, '절의 서술동사를 먼저 확보하고 명사를 꾸미는 추가 동작은 분사 같은 준동사로 나타내요.',
        [['동작 두 개', 'stand / be my teacher'], ['역할 나누기', '명사 수식 / 주절 서술'], ['형태 결정', 'standing / is']],
        ["I'm looking at the woman standing by the door.", '나는 문 옆에 서 있는 여자를 보고 있어.'],
        ['The book written by Mina explains the rule clearly.', '미나가 쓴 책은 그 규칙을 명확하게 설명한다.']);
    add('high3', 'h3u2', 0, '가정법 if를 생략하면 had·were·should를 주어 앞으로 옮기며 without은 문맥의 시간을 확인해요.',
        [['원래 조건', 'If I had known'], ['if 생략 · 도치', 'Had I known'], ['가정 결과', 'would have + p.p.']],
        ["Had I taken that job, I'd be living in Busan now.", '그 일을 맡았더라면 나는 지금 부산에서 살고 있겠어.'],
        ['Without your help, I would have failed.', '너의 도움이 없었더라면 나는 실패했을 것이다.']);
    add('high3', 'h3u2', 1, 'must have p.p.는 과거 추측, had to는 의무이며, should have p.p.는 후회·비판 문맥에서 ‘했어야 했는데 하지 않았다’예요.',
        [['말의 뜻', '추측 / 의무 / 후회'], ['형태', 'must have p.p. / had to / should have p.p.'], ['문맥 확인', '추정한 일 ≠ 실제로 해야 한 일']],
        ["I'm sure he can't have left; his bag is still here.", '그가 떠났을 리 없다고 나는 확신하고 있어. 그의 가방이 아직 여기 있어.'],
        ['He must have worked late because he had to finish the report.', '그는 보고서를 끝내야 했으므로 늦게까지 일한 것이 틀림없다.']);
    add('high3', 'h3u3', 0, '명사 뒤 that절의 주어·목적어가 비면 관계절, 완전한 사실로 명사의 내용을 풀면 동격절이에요.',
        [['that절 분석', 'she won / we heard ___'], ['빈자리', '없음 / 목적어 없음'], ['절의 역할', '동격 내용 / 관계절 수식']],
        ["I can't believe the news that she won.", '그녀가 이겼다는 소식을 믿을 수 없어.'],
        ['The news that we heard was the news that she had won.', '우리가 들은 소식은 그녀가 이겼다는 소식이었다.']);
    add('high3', 'h3u3', 1, '전치사 뒤는 whom·which, 집단의 일부를 덧붙일 때는 수량어 + of whom·which로 연결해요.',
        [['관계 대상', '사람 / 사물'], ['전치사 연결', 'to whom / in which'], ['집단 일부', 'two of whom / some of which']],
        ["I'm talking to her three sons, two of whom live abroad.", '나는 그녀의 세 아들과 이야기하고 있어. 그중 둘은 해외에 살고 있어.'],
        ['She has five books, three of which were written by Mina.', '그녀는 책 다섯 권을 가지고 있으며 그중 세 권은 미나가 썼다.']);
    add('high3', 'h3u4', 0, 'not all·not always는 일부 예외, none·never는 해당 범위를 전부 부정해요.',
        [['부정 범위', '일부 / 전체'], ['표현', 'not all·not always / none·never'], ['뜻 확인', '모두 그런 것은 아님 / 하나도 아님']],
        ['I said, "I don\'t always agree with you."', '나는 “네 의견에 항상 동의하는 건 아니야”라고 말했어.'],
        ['Not all students passed, but none of them gave up.', '모든 학생이 합격한 것은 아니지만 아무도 포기하지 않았다.']);
    add('high3', 'h3u4', 1, '비교급은 much·far·even으로 강조하고 than 양쪽은 같은 종류끼리 비교해요.',
        [['강조어', 'much / far / even'], ['비교급', 'higher / better'], ['대상 맞추기', 'population과 that of ...']],
        ["I've got much more time today than yesterday.", '나는 어제보다 오늘 시간이 훨씬 더 있어.'],
        ['The population of Seoul is larger than that of Busan.', '서울의 인구는 부산의 인구보다 많다.']);
    add('high3', 'h3u5', 0, '강조구문은 It is/was와 that을 빼고 강조 성분을 원래 자리로 돌리며, 가주어 it은 뒤 내용절을 실제 주어로 받아요.',
        [['It is ... that', '겉모양만으로 판단하지 않기'], ['성분 복원', 'Mina solved it. / That she came is clear.'], ['구별', '강조 / 가주어 + 진주어']],
        ['I said, "It\'s Mina that I called."', '나는 “내가 전화한 사람은 바로 미나야”라고 말했어.'],
        ['It is clear that Mina solved the problem.', '미나가 그 문제를 해결했다는 것은 분명하다.']);
    add('high3', 'h3u5', 1, '다른 주어의 동의는 so·neither + 조동사 + 주어, 같은 주어에 대한 확인은 so + 주어 + 조동사예요.',
        [['응답의 뜻', '나도 그렇다 / 정말 그렇다'], ['어순', 'So do I. / So I do.'], ['부정 동의', 'Neither + 조동사 + 주어']],
        ["I'm tired, and so is Mina.", '나는 지쳐 있고 미나도 피곤해하고 있어.'],
        ['Jisu did not agree, and neither did Mina.', '지수는 동의하지 않았고 미나도 동의하지 않았다.']);
    add('high3', 'h3u6', 0, '실제 수식 대상을 찾고 감정의 원인·경험자와 능동·수동 관계를 함께 판단해요.',
        [['수식 대상 찾기', 'news / students'], ['의미 관계', '놀라게 함 / 놀람을 느낌'], ['형태 선택', 'surprising / surprised']],
        ["I'm surprised by the surprising result.", '나는 그 놀라운 결과에 놀라 있어.'],
        ['The students excited by the news read the report written by Mina.', '그 소식에 들뜬 학생들은 미나가 쓴 보고서를 읽었다.']);
    add('high3', 'h3u6', 1, '연결된 절의 역할부터 나누면 조건절의 시제, 간접질문의 어순, 관계절의 빈자리를 판단할 수 있어요.',
        [['절 역할', '조건 / 간접질문 / 관계절'], ['확인 항목', '현재형 / 평서문 어순 / 빈자리'], ['적용', 'if she comes / where she lives / who lives here']],
        ["I don't know where she lives, but I'm ready to ask if she comes.", '그녀가 어디 사는지는 모르지만 오면 물어볼 준비가 되어 있어.'],
        ['If the student who called returns, I will ask whether she will join us.', '전화했던 학생이 돌아오면 나는 그녀가 우리와 함께할 것인지 물어볼 것이다.']);

    const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
    const speakerIcon = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M4 9h4l5-4v14l-5-4H4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
    function get(stage, unitId, lessonIndex) { return lessons[`${stage}/${unitId}/${lessonIndex}`] || null; }
    const drawings = {
        nouns: '<circle cx="22" cy="17" r="7"/><path d="M10 40v-5a12 12 0 0 1 24 0v5M40 12h14v27H40zM44 8h14v27M44 20h6M44 25h6"/>',
        time: '<circle cx="31" cy="25" r="18"/><path d="M31 12v14l9 5M5 43h52m-5-5 5 5-5 5"/>',
        compare: '<path d="M31 8v36M13 15h36M16 15 6 34h20L16 15zm30 0L36 34h20L46 15zM20 45h22"/>',
        condition: '<path d="M8 25h14m0 0 12-14h20m-32 14 12 14h20M49 6l5 5-5 5m0 18 5 5-5 5"/><circle cx="8" cy="25" r="4"/>',
        structure: '<rect x="5" y="15" width="14" height="20" rx="4"/><rect x="24" y="15" width="14" height="20" rx="4"/><rect x="43" y="15" width="14" height="20" rx="4"/><path d="M19 25h5m14 0h5M10 22h4m15 0h4m15 0h4"/>'
    };
    function diagramHTML(lesson) {
        if (!lesson) return '';
        const kind = lesson.visualKind || 'structure';
        return `<div class="grammar-diagram-heading"><span>구조를 눈으로 익혀요</span><small>순서대로 연결해 보세요</small></div><ol class="grammar-flow" style="--flow-count:${lesson.flow.length}" aria-label="문법 구조 흐름">${lesson.flow.map(([label, value], index) => `<li class="grammar-flow-step">${index ? '<span class="grammar-flow-arrow" aria-hidden="true">→</span>' : ''}<div class="grammar-flow-node"><div class="grammar-node-head"><span class="grammar-step-index">${String(index + 1).padStart(2, '0')}</span><span class="grammar-flow-label">${escape(label)}</span></div>${index === 0 ? `<svg class="grammar-diagram-art" viewBox="0 0 64 52" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${drawings[kind]}</svg>` : ''}<strong${kind === 'nouns' ? ' class="grammar-map-caption"' : ''}>${escape(value)}</strong>${kind === 'nouns' ? `<div class="grammar-map-pair">${[['Mina','books'],['한 사람','여러 사물'],['she','they']][index].map((text, row) => `<span>${index === 0 ? `<svg class="grammar-map-image" viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">${row === 0 ? '<circle cx="16" cy="10" r="5"/><path d="M7 28v-4a9 9 0 0 1 18 0v4"/>' : '<rect x="5" y="9" width="16" height="19" rx="2"/><path d="M10 4h16v19M10 15h6m-6 5h6"/>'}</svg>` : `<i class="grammar-map-dot lane-${row}" aria-hidden="true"></i>`}${escape(text)}</span>`).join('')}</div>` : ''}</div></li>`).join('')}</ol>`;
    }
    function examplesHTML(lesson) {
        if (!lesson) return '';
        return lesson.examples.map(example => `<article class="grammar-register"><div class="grammar-register-head"><span class="grammar-register-label">[${example.register}]</span><button type="button" class="speak grammar-speak" data-speak="${escape(example.en)}" data-accent="us" aria-label="${example.register} 영어 예문 미국식 발음 듣기">${speakerIcon}<span>듣기</span></button></div><strong lang="en">${escape(example.en)}</strong><p>${escape(example.ko)}</p></article>`).join('');
    }
    window.GrammarVisualLessons = Object.freeze({ get, diagramHTML, examplesHTML });
})();

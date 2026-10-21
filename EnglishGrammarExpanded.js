// Keep historical stage/unit IDs stable: this file adds teaching scaffolds and new high-school stages.
(function () {
    const data = window.EnglishGrammarData;
    const practice = (question, answer, distractors, explanation) => ({ question, answer, distractors, explanation });
    const practiceExplanations = {
        e1: ['Mina는 주어, tennis는 행동의 대상이며 plays가 행동을 나타내는 동사입니다.', '여러 권의 books는 복수이므로 주격 대명사 they로 받습니다.'],
        e2: ['주어 I에 맞는 현재 be동사는 am입니다.', 'be동사의 부정문은 be동사 are 뒤에 not을 붙입니다.'],
        e3: ['every day의 현재 습관에서 주어 she는 3인칭 단수이므로 walks입니다.', 'does가 3인칭 단수 표시를 하므로 뒤 본동사는 원형 drink입니다.'],
        e4: ['yesterday는 끝난 과거이므로 watch의 과거형 watched를 씁니다.', 'be going to 뒤에는 동사원형 have가 옵니다.'],
        e5: ['함께 하자는 제안은 Let’s 뒤에 동사원형 go를 씁니다.', 'must는 반드시 해야 할 의무를 나타내는 조동사입니다.'],
        e6: ['명사 flower의 성질을 설명하므로 형용사 beautiful이 필요합니다.', 'seven o’clock처럼 특정 시각 앞에는 전치사 at을 씁니다.'],
        m1: ['likes의 행동 대상인 music은 목적어이며 주어나 주어의 상태를 설명하는 보어가 아닙니다.', '준 물건 a pen이 직접목적어이고 받은 사람 me가 간접목적어입니다.'],
        m2: ['현재진행형은 be -ing이며 복수 주어 they의 be동사는 are입니다.', 'last night는 끝난 과거이고 주어 she가 단수이므로 was입니다.'],
        m3: ['do not have to는 의무가 없다는 뜻입니다. must not은 금지이므로 뜻이 다릅니다.', '형용사 beautiful을 강조하는 감탄문은 How 형용사 주어 동사 순서입니다.'],
        m4: ['우유를 사려는 목적을 나타내는 부사적 to부정사 to buy를 씁니다.', 'finish는 동명사 목적어를 취하므로 eating이 필요합니다.'],
        m5: ['milk는 셀 수 없는 명사이므로 적은 양은 a little milk로 표현합니다. a few와 many는 복수 가산명사와 씁니다.', '일반동사 writes의 방식을 설명하므로 부사 carefully를 씁니다.'],
        m6: ['as와 as 사이에는 원급 형용사 tall을 씁니다.', '뒤에 it rained라는 완전한 이유절이 있으므로 접속사 because를 씁니다.'],
        m7: ['전화를 한 사람, 즉 주어를 물으므로 who를 쓰고 바로 동사 called를 연결합니다.', '긍정문 they are 뒤에는 부정 be동사와 같은 주어를 써 aren’t they로 확인합니다.'],
        m8: ['a cat은 단수명사이므로 존재문에는 There is를 씁니다.', '특정 사물이 아닌 시간을 나타낼 때 비인칭 주어 It을 씁니다.'],
        m9: ['현재완료 has 뒤에는 finish의 과거분사 finished가 옵니다.', '2020은 기간의 길이가 아닌 시작 시점이므로 since를 씁니다.'],
        m10: ['현재 수동태에서 복수 주어 the doors에 맞는 be동사는 are입니다.', '사물 선행사의 관계절 주어 역할에는 which를 쓸 수 있습니다. where는 주어 역할을 하지 않습니다.'],
        n2u1: ['현재완료 has 뒤 본동사는 과거분사 opened입니다.', 'last year는 끝난 과거 시점이므로 단순과거 visited를 씁니다.'],
        n2u2: ['현재완료 수동태는 has been p.p.이므로 been이 필요합니다.', '조동사 can 뒤 수동태는 동사원형 be와 과거분사 repaired를 씁니다.'],
        n2u3: ['what to do는 무엇을 해야 할지라는 뜻으로 의문사 뒤 to부정사를 씁니다.', '나가기 전에 앞으로 해야 할 일을 기억하라는 뜻이므로 remember to lock입니다.'],
        n2u4: ['영화가 흥미를 일으키는 대상이므로 현재분사형 형용사 exciting을 씁니다.', 'ask는 목적어 me 뒤에 to부정사 목적격보어 to wait를 씁니다.'],
        n2u5: ['I bought에서 목적어가 빠져 있어 목적격 that을 쓰며 이 제한적 용법에서는 생략할 수도 있습니다.', '작가와 그의 책 사이 소유 관계는 whose books로 나타냅니다.'],
        n2u6: ['비가 와도 밖에서 놀았다는 양보의 절을 연결하므로 Although를 씁니다. despite 뒤에는 명사구가 필요합니다.', '간접의문문은 where 주어 she 동사 lives의 어순이며 주어 수에 맞춰 lives를 씁니다.'],
        n3u1: ['과거 도착 시점보다 먼저 떠난 일은 과거완료 had left로 나타냅니다.', '과거 그때의 상태를 전달하므로 he said 뒤 종속절 동사는 was입니다.'],
        n3u2: ['현재와 반대되는 가정의 if절에서 be동사는 보통 were를 씁니다.', '이미 지나간 공부에 대한 후회는 wish had p.p.이므로 had가 필요합니다.'],
        n3u3: ['she lives는 주어와 동사가 갖춰져 있으며 장소 관계는 관계부사 where로 연결합니다.', '필요한 것은 무엇이든이라는 뜻이며 목적어 자리를 포함한 whatever가 필요합니다.'],
        n3u4: ['주절 주어가 그 행동을 하는 능동 관계이면 현재분사 -ing로 분사구문을 만듭니다.', '주절 행동보다 먼저 끝난 일은 완료 분사구문 having p.p.로 나타냅니다.'],
        n3u5: ['부정어 Never가 문두에 오면 현재완료 조동사 have를 주어 I 앞으로 보냅니다.', '일반동사 likes의 현재 긍정 내용에 주어 I가 동의하므로 so do I가 됩니다.'],
        n3u6: ['준비됐는지라는 yes/no 질문을 전달하므로 ask 뒤에 whether로 절을 연결합니다.', '명령을 전달하는 tell us 뒤에는 to부정사 to be를 쓰고 형용사 quiet를 잇습니다.']
    };
    const enrich = (unitId, rows) => {
        const unit = Object.values(data).flatMap(stage => stage.units).find(item => item.id === unitId);
        rows.forEach((row, index) => {
            const item = unit.lessons[index];
            const [en, ko, wrong, correct, reason, question, answer, distractors] = row;
            item.examples.push([en, ko]);
            item.detail = `${item.principle} ${reason} 예문의 뜻을 먼저 읽고, 같은 뜻을 전달하는 데 필요한 문장 성분과 동사 형태를 차례로 확인하세요.`;
            item.steps = item.rules.map((rule, step) => `${step === 0 ? '먼저 확인' : step === item.rules.length - 1 ? '마지막 점검' : '형태 적용'}: ${rule}`);
            item.commonError = { wrong, correct, reason };
            item.practice = [practice(question, answer, distractors, practiceExplanations[unitId][index])];
        });
    };
    enrich('e1', [
        ['My brother makes breakfast.', '우리 오빠는 아침을 만든다.', 'Plays Mina tennis.', 'Mina plays tennis.', '평서문은 주어 Mina 뒤에 동사 plays를 둡니다.', '평서문에서 행동을 나타내는 말은? Mina plays tennis.', 'plays', ['Mina', 'tennis', 'Mina tennis']],
        ['The children are here. They are ready.', '아이들이 여기 있다. 그들은 준비됐다.', 'The books are new. It is new.', 'The books are new. They are new.', 'books는 여러 권이므로 복수 대명사 they로 받습니다.', '여러 권의 책 books를 받는 주격 대명사는?', 'they', ['it', 'he', 'she']]
    ]);
    enrich('e2', [
        ['My sister is at the library.', '내 여동생은 도서관에 있다.', 'We is hungry.', 'We are hungry.', 'we는 여러 사람을 나타내므로 are와 짝을 이룹니다.', '주어에 맞게 고르세요: I ___ ready.', 'am', ['is', 'are', 'be']],
        ['Is your brother at school?', '네 남동생은 학교에 있니?', 'Do you are ready?', 'Are you ready?', 'be동사 의문문은 are를 주어 앞으로 옮기며 do를 더하지 않습니다.', 'be동사 부정문: They are ___ tired.', 'not', ['no', 'do', 'does']]
    ]);
    enrich('e3', [
        ['Mina studies English after dinner.', '미나는 저녁 식사 후 영어를 공부한다.', 'My father work here.', 'My father works here.', '한 사람인 my father가 주어인 현재 습관은 works로 나타냅니다.', '매일의 습관: She ___ to school every day.', 'walks', ['walk', 'walking', 'walked']],
        ['Do your friends like music?', '네 친구들은 음악을 좋아하니?', 'Does she likes apples?', 'Does she like apples?', 'does가 현재 3인칭 단수 표시를 담당하므로 본동사는 like입니다.', '현재 부정문: He does not ___ coffee.', 'drink', ['drinks', 'drinking', 'drank']]
    ]);
    enrich('e4', [
        ['I saw my teacher yesterday.', '나는 어제 선생님을 보았다.', 'We goed home yesterday.', 'We went home yesterday.', 'go의 과거형은 규칙형 goed가 아니라 went입니다.', '어제 있었던 일: We ___ a movie yesterday.', 'watched', ['watch', 'watches', 'will watch']],
        ['She is going to visit her grandmother.', '그녀는 할머니를 방문할 예정이다.', 'He will studies tonight.', 'He will study tonight.', 'will 뒤에서는 주어와 관계없이 동사원형 study를 씁니다.', '예정된 계획: They are going to ___ a picnic.', 'have', ['has', 'had', 'having']]
    ]);
    enrich('e5', [
        ['Please close the door.', '문을 닫아 주세요.', 'Do not running here.', 'Do not run here.', '부정 명령문도 do not 뒤에 동사원형 run을 씁니다.', '함께 가자: Let’s ___ together.', 'go', ['goes', 'went', 'going']],
        ['You must not touch this button.', '너는 이 버튼을 누르면 안 된다.', 'She can sings well.', 'She can sing well.', '능력을 나타내는 can 뒤에 동사원형 sing을 씁니다.', '반드시 해야 할 의무를 나타내는 말은?', 'must', ['yesterday', 'and', 'under']]
    ]);
    enrich('e6', [
        ['The careful driver drives slowly.', '조심성 있는 운전자는 천천히 운전한다.', 'She speaks English fluency.', 'She speaks English fluently.', '말하는 방식을 꾸미려면 명사 fluency가 아니라 부사 fluently를 씁니다.', '명사 flower를 꾸미세요: a ___ flower', 'beautiful', ['beautifully', 'beauty', 'beautify']],
        ['We meet at seven on Fridays.', '우리는 금요일마다 7시에 만난다.', 'I stayed home because the rain.', 'I stayed home because it rained.', 'because 뒤에는 주어와 동사가 있는 절이 필요합니다. 명사만 쓰려면 because of를 씁니다.', '시각 앞 전치사: ___ seven o’clock', 'at', ['on', 'under', 'between']]
    ]);
    enrich('m1', [
        ['The soup smells delicious.', '그 수프는 맛있는 냄새가 난다.', 'She became happily.', 'She became happy.', 'became 뒤에서는 주어의 상태를 설명하는 형용사 happy가 보어입니다.', 'She likes music.에서 music의 역할은?', '목적어', ['주어', '주격보어', '목적격보어']],
        ['We call our dog Lucky.', '우리는 우리 개를 럭키라고 부른다.', 'The music made me happily.', 'The music made me happy.', 'happy는 made가 아니라 목적어 me의 상태를 설명합니다.', 'He gave me a pen.에서 직접목적어는?', 'a pen', ['He', 'gave', 'me']]
    ]);
    enrich('m2', [
        ['I was reading when you called.', '네가 전화했을 때 나는 읽고 있었다.', 'She studying now.', 'She is studying now.', '진행형은 be동사와 -ing가 함께 있어야 합니다.', '현재진행형: They ___ playing now.', 'are', ['is', 'be', 'does']],
        ['He bought a notebook yesterday.', '그는 어제 공책을 샀다.', 'I will called tomorrow.', 'I will call tomorrow.', 'will 뒤에는 과거형 called가 아니라 원형 call을 씁니다.', '명확한 과거 시점: She ___ here last night.', 'was', ['is', 'will be', 'has been']]
    ]);
    enrich('m3', [
        ['You do not have to come early.', '너는 일찍 올 필요가 없다.', 'You must not come. (올 필요가 없다)', 'You do not have to come.', 'must not은 금지이고 do not have to는 의무가 없다는 뜻입니다.', '의무가 없음을 뜻하는 표현은?', 'do not have to', ['must not', 'cannot', 'had better not']],
        ['How carefully she drives!', '그녀는 정말 조심스럽게 운전하는구나!', 'How a beautiful day!', 'What a beautiful day!', 'a beautiful day처럼 명사구를 감탄하면 What으로 시작합니다.', '형용사 감탄문: ___ beautiful this flower is!', 'How', ['What a', 'Which', 'Who']]
    ]);
    enrich('m4', [
        ['She has a lot of homework to do.', '그녀는 해야 할 숙제가 많다.', 'I want visiting Seoul.', 'I want to visit Seoul.', 'want 뒤에 행동을 목적어로 놓을 때 to부정사를 씁니다.', '목적을 나타내세요: I went to the store ___ milk.', 'to buy', ['buy', 'bought', 'to buying']],
        ['He finished cleaning his room.', '그는 방 청소를 끝냈다.', 'She enjoys to cook.', 'She enjoys cooking.', 'enjoy는 동명사 목적어를 취하므로 cooking이 필요합니다.', '동명사를 고르세요: We finished ___ lunch.', 'eating', ['to eat', 'eat', 'ate']]
    ]);
    enrich('m5', [
        ['I made this sandwich myself.', '나는 이 샌드위치를 직접 만들었다.', 'I need many water.', 'I need much water.', 'water는 셀 수 없는 물질명사이므로 much와 어울립니다.', '셀 수 없는 milk와 어울리는 표현은?', 'a little milk', ['a few milk', 'many milk', 'two milk']],
        ['The children usually walk to school.', '아이들은 보통 학교에 걸어간다.', 'He is carefully.', 'He is careful.', 'be동사 뒤에서 주어의 성질을 설명할 때 형용사 careful을 씁니다.', '방식을 꾸미는 부사: She writes ___.', 'carefully', ['careful', 'care', 'carefulness']]
    ]);
    enrich('m6', [
        ['My bag is as heavy as yours.', '내 가방은 네 것만큼 무겁다.', 'This bag is more cheaper.', 'This bag is cheaper.', 'cheap의 비교급 cheaper 앞에 more를 중복하지 않습니다.', '원급 비교: as ___ as', 'tall', ['taller', 'tallest', 'more tall']],
        ['I will wait until you return.', '네가 돌아올 때까지 기다리겠다.', 'Call me when you will arrive.', 'Call me when you arrive.', '미래의 시간을 나타내는 부사절에서는 현재형으로 미래를 나타냅니다.', '이유의 절을 연결하세요: I stayed inside ___ it rained.', 'because', ['because of', 'during', 'despite']]
    ]);
    enrich('m7', [
        ['Who opened the window?', '누가 창문을 열었니?', 'Where you live?', 'Where do you live?', 'where가 장소를 물으면 일반동사 의문문에 do가 필요합니다.', '사람을 묻는 주어 의문문: ___ called you?', 'Who', ['Where', 'When', 'Why']],
        ['She cannot swim, can she?', '그녀는 수영을 못하지, 그렇지?', 'He likes music, isn’t he?', 'He likes music, doesn’t he?', '일반동사 현재 3인칭 단수의 부가의문에는 does를 씁니다.', '부가의문문: They are ready, ___?', 'aren’t they', ['are they', 'don’t they', 'isn’t he']]
    ]);
    enrich('m8', [
        ['There is some milk in the fridge.', '냉장고에 우유가 조금 있다.', 'There is three chairs.', 'There are three chairs.', '존재를 나타낼 때 뒤 명사가 복수이면 are를 씁니다.', '단수 존재문: There ___ a cat outside.', 'is', ['are', 'do', 'have']],
        ['It is five kilometers to the station.', '역까지 5킬로미터이다.', 'There is rainy today.', 'It is rainy today.', '날씨를 표현하는 비인칭 주어는 it입니다.', '시간을 나타내세요: ___ is six o’clock.', 'It', ['They', 'There', 'These']]
    ]);
    enrich('m9', [
        ['Have you ever tried this food?', '이 음식을 먹어 본 적이 있니?', 'I have visited Jeju yesterday.', 'I visited Jeju yesterday.', 'yesterday는 끝난 과거 시점을 직접 가리키므로 이 문장에는 단순과거를 씁니다.', '방금 끝낸 숙제: She has just ___ her homework.', 'finished', ['finish', 'finishes', 'finishing']],
        ['How long have you lived here?', '여기에서 얼마나 오래 살았니?', 'I have lived here since five years.', 'I have lived here for five years.', 'five years는 시작 시점이 아닌 기간이므로 for를 씁니다.', '시작 시점 앞: We have lived here ___ 2020.', 'since', ['for', 'during', 'ago']]
    ]);
    enrich('m10', [
        ['These cookies were made by my father.', '이 쿠키는 아버지가 만드셨다.', 'This book written in English.', 'This book is written in English.', '수동태는 be동사와 과거분사가 모두 필요합니다.', '현재 수동태: The doors ___ closed at night.', 'are', ['is', 'do', 'have']],
        ['The woman who teaches us is kind.', '우리를 가르치는 여성은 친절하다.', 'The boy who he won is my friend.', 'The boy who won is my friend.', '주격 who가 관계절 주어를 맡으므로 he를 다시 쓰지 않습니다.', '사물 선행사에 쓰는 주격 관계사는?', 'which', ['who', 'whom', 'where']]
    ]);
    enrich('n2u1', [
        ['She has already sent the email.', '그녀는 이미 이메일을 보냈다.', 'He have lost his phone.', 'He has lost his phone.', '현재완료의 have/has는 주어 수에 맞추고 본동사는 과거분사로 둡니다.', '현재완료 형태: He has ___ the door.', 'opened', ['open', 'opens', 'opening']],
        ['We have learned a lot so far.', '우리는 지금까지 많이 배웠다.', 'When have you met him yesterday?', 'When did you meet him yesterday?', '끝난 과거 시점의 일을 물으므로 did와 동사원형을 씁니다.', '과거 시점 last year와 쓸 형태: She ___ Paris last year.', 'visited', ['has visited', 'visits', 'will visit']]
    ]);
    enrich('n2u2', [
        ['The room has been cleaned.', '그 방은 청소된 상태이다.', 'The letters was sent yesterday.', 'The letters were sent yesterday.', '수동태 be동사는 주어 letters의 복수와 과거 시점을 함께 표시합니다.', '현재완료 수동태: The job has ___ finished.', 'been', ['be', 'being', 'was']],
        ['A book was given to me.', '내게 책 한 권이 주어졌다.', 'The rule must followed.', 'The rule must be followed.', '조동사 수동태는 조동사 뒤 원형 be와 과거분사로 만듭니다.', '조동사 수동태: This can ___ repaired.', 'be', ['is', 'been', 'being']]
    ]);
    enrich('n2u3', [
        ['We must decide when to leave.', '우리는 언제 떠날지 결정해야 한다.', 'I know how use it.', 'I know how to use it.', '의문사 뒤에 to와 동사원형을 붙여 해야 할 행동을 표현합니다.', '무엇을 할지: what ___ do', 'to', ['for', 'of', 'at']],
        ['I remember meeting her last summer.', '나는 지난여름 그녀를 만난 것을 기억한다.', 'He stopped to talk. (말을 그만뒀다)', 'He stopped talking.', 'stop doing은 하던 일을 중단하는 것이고 stop to do는 다른 일을 하려고 멈추는 것입니다.', '해야 할 일을 기억: Remember ___ the door before you leave.', 'to lock', ['locking', 'locked', 'lock']]
    ]);
    enrich('n2u4', [
        ['The sleeping baby looks peaceful.', '자고 있는 아기는 평온해 보인다.', 'I was boring by the lesson.', 'I was bored by the lesson.', '감정을 느낀 사람은 bored, 지루함을 주는 수업은 boring입니다.', '감정을 주는 영화: The movie was ___.', 'exciting', ['excited', 'excite', 'excitement']],
        ['The joke made everyone laugh.', '그 농담은 모두를 웃게 했다.', 'The teacher made me to wait.', 'The teacher made me wait.', '능동문 사역동사 make 뒤 목적격보어로 동사원형을 씁니다.', 'ask의 목적격보어: She asked me ___ outside.', 'to wait', ['wait', 'waited', 'to waiting']]
    ]);
    enrich('n2u5', [
        ['The students who live nearby walk here.', '근처에 사는 학생들은 이곳까지 걸어온다.', 'The students who lives here are kind.', 'The students who live here are kind.', '주격 관계대명사의 동사는 선행사 students의 복수에 맞춥니다.', '목적격 생략 가능: The bag ___ I bought is blue.', 'that', ['where', 'whose', 'when']],
        ['The girl whose bike is red is Mina.', '자전거가 빨간 소녀는 미나이다.', 'The house in that he lived is old.', 'The house in which he lived is old.', '전치사 바로 뒤에 놓는 사물 관계대명사는 which이며 that은 쓸 수 없습니다.', '소유 관계: a writer ___ books are famous', 'whose', ['whom', 'which', 'where']]
    ]);
    enrich('n2u6', [
        ['Although it was cold, we went outside.', '추웠지만 우리는 밖에 나갔다.', 'If it will rain, we will stay home.', 'If it rains, we will stay home.', '미래 조건의 부사절에서는 현재형으로 미래를 나타냅니다.', '양보의 절: ___ it was raining, we played outdoors.', 'Although', ['Despite', 'During', 'Because of']],
        ['Tell me what you need.', '무엇이 필요한지 말해 줘.', 'Do you know where does he live?', 'Do you know where he lives?', '문장 안의 간접의문문은 의문사 다음에 주어와 동사를 둡니다.', '간접의문문: I wonder where she ___.', 'lives', ['does live?', 'live does', 'do live']]
    ]);
    enrich('n3u1', [
        ['He had been waiting for an hour when I arrived.', '내가 도착했을 때 그는 한 시간째 기다리고 있었다.', 'She has been know him for years.', 'She has known him for years.', 'know처럼 상태를 나타내는 동사는 보통 완료진행 대신 현재완료를 씁니다.', '과거보다 앞선 완료: The train ___ left when we arrived.', 'had', ['has', 'will', 'is']],
        ['She said she had lost her ticket.', '그녀는 표를 잃어버렸다고 말했다.', 'He said that he is tired then.', 'He said that he was tired then.', '그때 피곤했던 상태를 전달하므로 과거 주절에 맞춰 was를 씁니다.', '그때의 상태 전달: He said he ___ busy then.', 'was', ['is', 'will be', 'has been']]
    ]);
    enrich('n3u2', [
        ['If it were sunny now, we could go outside.', '지금 맑다면 밖에 나갈 수 있을 텐데.', 'If I will have time now, I would help.', 'If I had time now, I would help.', '현재와 반대되는 가정의 if절에는 과거형 had를 씁니다.', '현재 반대 가정: If I ___ you, I would wait.', 'were', ['am', 'will be', 'have been']],
        ['I wish I knew her address.', '그녀의 주소를 안다면 좋을 텐데.', 'If I had known, I would help yesterday.', 'If I had known, I would have helped yesterday.', '실현되지 않은 과거 행동은 would have와 과거분사로 나타냅니다.', '과거 후회: I wish I ___ studied harder.', 'had', ['have', 'will', 'am']]
    ]);
    enrich('n3u3', [
        ['This is the reason why I called.', '이것이 내가 전화한 이유이다.', 'This is the place where I visited.', 'This is the place which I visited.', 'visit의 목적어가 빠진 불완전한 절이므로 장소 명사라도 관계대명사를 씁니다.', '완전한 절의 장소 수식: the house ___ she lives', 'where', ['which', 'what', 'who']],
        ['He missed the train, which upset him.', '그는 기차를 놓쳤고, 그 일이 그를 속상하게 했다.', 'Mina, that lives next door, is kind.', 'Mina, who lives next door, is kind.', '쉼표 뒤의 계속적 용법에서는 that을 쓰지 않습니다.', '선행사를 포함해 무엇이든: Take ___ you need.', 'whatever', ['that', 'which', 'whose']]
    ]);
    enrich('n3u4', [
        ['Reading the letter, Mina smiled.', '편지를 읽으며 미나는 미소 지었다.', 'Walking home, the rain started.', 'While I was walking home, the rain started.', '비는 걸을 수 없으므로 주어가 다를 때 부사절 주어 I를 그대로 밝혀야 합니다.', '주절 주어가 동작을 하는 능동 분사구문 형태는?', '-ing', ['과거형', 'will + 원형', 'to + 과거형']],
        ['Not knowing the answer, I asked for help.', '답을 몰라서 나는 도움을 청했다.', 'Seen the city from above, I was amazed.', 'Seeing the city from above, I was amazed.', 'I가 도시를 보는 능동 관계이므로 seeing을 씁니다.', '주절보다 먼저 끝난 동작: ___ finished dinner, she left.', 'Having', ['Have', 'Has', 'Had']]
    ]);
    enrich('n3u5', [
        ['Only then did I understand the rule.', '그제야 나는 그 규칙을 이해했다.', 'Never I have seen it.', 'Never have I seen it.', '부정어 never가 문두에 오면 조동사 have를 주어 앞으로 옮깁니다.', '부정어 문두 도치: Never ___ I seen this.', 'have', ['having', 'to have', 'has']],
        ['She is tired, and so am I.', '그녀는 피곤하고 나도 그렇다.', 'She cannot swim, and so can I.', 'She cannot swim, and neither can I.', '부정 내용에 동의할 때 neither와 도치 어순을 씁니다.', '긍정 동의: He likes music, and so ___ I.', 'do', ['am', 'does', 'did']]
    ]);
    enrich('n3u6', [
        ['She asked me whether I was ready.', '그녀는 내가 준비됐는지 물었다.', 'He asked me where did I live.', 'He asked me where I lived.', '전달된 질문은 물음표 어순이 아닌 주어+동사의 어순을 씁니다.', '간접화법의 의문문: She asked ___ I was ready.', 'whether', ['that', 'because', 'although']],
        ['He asked us to wait until the rain stopped.', '그는 비가 그칠 때까지 기다려 달라고 부탁했다.', 'Mom told me do not run.', 'Mom told me not to run.', '부정 명령을 전달할 때 목적어 뒤에 not to와 동사원형을 씁니다.', '명령 전달: The teacher told us ___ quiet.', 'to be', ['be', 'being', 'are']]
    ]);

    const L = (title, principle, rules, examples, wrong, correct, reason, exercises) => ({
        title, principle, detail: `${principle} ${reason}`, rules,
        steps: rules.map((rule, index) => `${index + 1}단계 · ${rule}`), examples, tip: reason,
        commonError: { wrong, correct, reason }, practice: exercises.map(row => practice(...row))
    });
    const U = (id, title, goal, lessons) => ({ id, title, goal, lessons });
    data.high1 = { title: '고1 문법', subtitle: '절의 뼈대부터 시제·준동사·관계사를 체계적으로 분석합니다.', units: [
        U('h1u1', '1. 문장 구조와 수 일치', '긴 주어에서도 핵심 명사와 서술동사를 찾습니다.', [
            L('긴 주어와 수 일치', '주어 뒤에 꾸미는 말이 길어져도 동사의 수는 주어의 핵심 명사에 맞춥니다.', ['전치사구를 잠시 묶고 핵심 명사를 찾습니다.', '핵심 명사가 단수인지 복수인지 판단합니다.', '관계절 동사와 주절 동사를 각각 구별합니다.'], [['The box of pencils is on the desk.', '연필이 든 상자는 책상 위에 있다.'], ['Students in this class enjoy reading.', '이 반 학생들은 독서를 즐긴다.'], ['The girl who lives next door is my friend.', '옆집에 사는 소녀는 내 친구이다.']], 'The list of names are long.', 'The list of names is long.', 'of names는 list를 꾸미므로 가까운 names가 아니라 단수 list에 동사를 맞춥니다.', [
                ['핵심 주어에 맞추세요: The color of these bags ___ bright.', 'is', ['are', 'be', 'have'], '주어 핵심은 단수 color이므로 is입니다.'],
                ['현재형: The students near the window ___ books.', 'read', ['reads', 'reading', 'is reading'], '핵심 주어 students가 복수이므로 read입니다.']]),
            L('주어·보어와 목적어·보어', '보어는 주어나 목적어가 어떤 존재인지 어떤 상태인지 설명합니다.', ['동사가 become·seem 등 연결동사인지 확인합니다.', '목적어 뒤 말이 목적어의 상태를 설명하는지 확인합니다.', '행동의 방식은 부사, 대상의 상태는 형용사로 구별합니다.'], [['The plan seems reasonable.', '그 계획은 합리적으로 보인다.'], ['We found the room empty.', '우리는 방이 비어 있음을 알았다.'], ['The news made everyone happy.', '그 소식은 모두를 행복하게 했다.']], 'We found the room emptily.', 'We found the room empty.', 'empty는 발견한 방의 상태를 설명하는 목적격보어이므로 형용사입니다.', [
                ['주어의 상태: She seems ___.', 'tired', ['tiredly', 'tire', 'tiringly'], 'seems 뒤에는 주어의 상태를 나타내는 형용사 tired가 옵니다.'],
                ['The news made me happy.에서 happy의 역할은?', '목적격보어', ['주어', '직접목적어', '동사를 꾸미는 부사'], 'happy는 목적어 me의 상태를 설명합니다.']])
        ]),
        U('h1u2', '2. 시제와 완료', '현재와 과거의 기준 시점을 구별합니다.', [
            L('현재완료와 단순과거의 선택', '현재완료는 현재와 연결된 경험·결과·계속을, 단순과거는 끝난 과거 시점의 일을 나타냅니다.', ['시간 표현이 끝난 시점인지 현재까지 기간인지 구분합니다.', '단순과거는 과거형, 현재완료는 have/has p.p.로 씁니다.', 'since의 시작 시점과 for의 기간을 구별합니다.'], [['I visited the museum yesterday.', '나는 어제 박물관을 방문했다.'], ['I have visited the museum twice.', '나는 그 박물관을 두 번 방문한 적이 있다.'], ['She has lived here since 2021.', '그녀는 2021년부터 여기 살아왔다.']], 'I have met him two days ago.', 'I met him two days ago.', 'two days ago는 끝난 과거 시점이므로 단순과거 met을 씁니다.', [
                ['끝난 과거: We ___ the game last Saturday.', 'watched', ['have watched', 'watch', 'will watch'], 'last Saturday는 끝난 과거 시점입니다.'],
                ['현재까지 계속: She has worked here ___ five years.', 'for', ['since', 'ago', 'last'], 'five years는 기간이므로 for를 씁니다.']]),
            L('과거완료와 사건의 선후', '과거완료 had p.p.는 과거 기준보다 먼저 일어난 일을 나타냅니다.', ['비교할 과거 기준 사건을 찾습니다.', '더 먼저 끝난 사건에 had p.p.를 씁니다.', '시간 순서가 뚜렷하면 단순과거도 가능하므로 문맥을 봅니다.'], [['The train had left when we arrived.', '우리가 도착했을 때 기차는 이미 떠나 있었다.'], ['I realized that I had lost my key.', '나는 열쇠를 잃어버렸음을 깨달았다.'], ['She had finished dinner before I called.', '내가 전화하기 전에 그녀는 저녁을 다 먹은 상태였다.']], 'The train has left when we arrived yesterday.', 'The train had left when we arrived yesterday.', '도착한 과거 시점보다 앞선 출발을 나타내므로 현재완료가 아닌 과거완료를 씁니다.', [
                ['과거완료의 기본 형태는?', 'had + 과거분사', ['has + 동사원형', 'was + 동사원형', 'will + 과거분사'], '과거 기준 이전의 완료는 had p.p.입니다.'],
                ['어제 도착했을 때 이미 끝난 일: She ___ already finished when I arrived.', 'had', ['has', 'is', 'will'], '과거 도착보다 앞선 완료를 표시합니다.']])
        ]),
        U('h1u3', '3. 조동사와 수동태', '판단의 강도와 행동을 받는 대상을 표현합니다.', [
            L('의무·금지·불필요의 구별', 'must not은 금지, do not have to는 의무가 없다는 뜻입니다.', ['지시가 반드시 해야 함인지 금지인지 판단합니다.', '의무가 없을 뿐 허용되는 경우 do not have to를 씁니다.', '조동사 뒤에는 동사원형을 유지합니다.'], [['You must wear a seat belt.', '너는 안전벨트를 매야 한다.'], ['You must not park here.', '너는 여기에 주차하면 안 된다.'], ['You do not have to bring lunch.', '너는 점심을 가져올 필요가 없다.']], 'You must not come. (올 필요가 없다)', 'You do not have to come.', '금지와 선택 가능은 다릅니다. 불필요는 do not have to로 표현합니다.', [
                ['‘할 필요가 없다’에 맞는 말은?', 'do not have to', ['must not', 'cannot', 'must'], '의무가 없다는 뜻이며 행동을 금지하지 않습니다.'],
                ['조동사 뒤: She can ___ the problem.', 'solve', ['solves', 'solved', 'solving'], 'can 뒤에는 동사원형 solve가 옵니다.']]),
            L('수동태의 시제와 조동사', '수동태는 be p.p.를 중심으로 시제와 조동사에 맞춰 be의 형태를 바꿉니다.', ['능동문의 목적어가 수동문의 주어가 되는지 확인합니다.', '시제·수에 맞게 be를 바꾸고 본동사는 p.p.로 둡니다.', '조동사 뒤에는 be, 완료에서는 been을 씁니다.'], [['The bridge was built in 2010.', '그 다리는 2010년에 건설되었다.'], ['The report must be submitted today.', '그 보고서는 오늘 제출되어야 한다.'], ['The room has been cleaned.', '그 방은 청소된 상태이다.']], 'The report must submitted today.', 'The report must be submitted today.', '조동사와 과거분사 사이에 동사원형 be가 필요합니다.', [
                ['완료 수동: The windows have ___ repaired.', 'been', ['be', 'being', 'was'], 'have been p.p.가 현재완료 수동태입니다.'],
                ['조동사 수동: This door should ___ closed.', 'be', ['is', 'been', 'being'], 'should 뒤에 be p.p.를 씁니다.']])
        ]),
        U('h1u4', '4. to부정사와 동명사', '준동사의 자리와 의미상 주어를 찾습니다.', [
            L('to부정사의 역할과 의미상 주어', 'to부정사는 명사 자리나 수식어 자리에 쓰이며 행동의 주체는 for/of로 밝힐 수 있습니다.', ['주어·목적어·보어이면 명사 역할인지 확인합니다.', '목적·명사 수식이면 수식 대상을 찾습니다.', '일반 평가에는 for, 사람의 성품 평가에는 of를 검토합니다.'], [['To read widely is helpful.', '폭넓게 읽는 것은 도움이 된다.'], ['It is important for us to listen.', '우리가 듣는 것은 중요하다.'], ['It was kind of you to help me.', '나를 도와주다니 너는 친절했다.']], 'It is important of us to listen.', 'It is important for us to listen.', 'important는 사람 성품보다 행동의 중요성을 평가하므로 for us를 씁니다.', [
                ['행동의 주체: It is hard ___ me to understand this.', 'for', ['of', 'at', 'by'], '행동이 어렵다는 일반 평가는 for를 씁니다.'],
                ['목적: I came here ___ you.', 'to help', ['helped', 'to helping', 'helps'], '도우려는 목적은 to부정사로 나타냅니다.']]),
            L('동명사와 전치사 to', '전치사 뒤에는 명사나 동명사를 쓰며, 전치사 to와 부정사의 to를 구별합니다.', ['to가 look forward to 같은 표현의 일부인지 봅니다.', '전치사 뒤 동작은 -ing로 씁니다.', 'enjoy·finish 뒤 동명사와 want·plan 뒤 부정사를 구별합니다.'], [['I look forward to meeting you.', '나는 너를 만나기를 기대한다.'], ['She is good at solving problems.', '그녀는 문제를 잘 푼다.'], ['We finished cleaning the classroom.', '우리는 교실 청소를 마쳤다.']], 'I look forward to meet you.', 'I look forward to meeting you.', 'look forward to의 to는 전치사이므로 meeting이 옵니다.', [
                ['전치사 뒤: She left without ___ goodbye.', 'saying', ['say', 'to say', 'said'], 'without은 전치사이므로 saying을 씁니다.'],
                ['목적어 형태: He enjoys ___ books.', 'reading', ['to read', 'read', 'reads'], 'enjoy는 동명사 목적어를 취합니다.']])
        ]),
        U('h1u5', '5. 분사와 관계사', '꾸미는 명사와 능동·수동 관계를 판단합니다.', [
            L('분사 수식의 능동과 수동', '명사가 동작을 하면 현재분사, 동작을 받으면 과거분사로 꾸밉니다.', ['꾸밈을 받는 명사를 찾습니다.', '명사와 동사의 능동·수동 관계를 판단합니다.', '감정은 원인을 주는 대상과 느끼는 사람을 구별합니다.'], [['The sleeping baby is my cousin.', '자고 있는 아기는 내 사촌이다.'], ['The book written by Mina is popular.', '미나가 쓴 책은 인기가 있다.'], ['The excited children entered the park.', '신이 난 아이들이 공원에 들어갔다.']], 'The book writing by Mina is popular.', 'The book written by Mina is popular.', '책은 쓰는 주체가 아니라 쓰이는 대상이므로 written입니다.', [
                ['수동 수식: a window ___ by the ball', 'broken', ['breaking', 'break', 'breaks'], '창문이 깨진 것이므로 과거분사를 씁니다.'],
                ['감정의 원인: The story was ___.', 'surprising', ['surprised', 'surprise', 'surprisedly'], '이야기가 놀라움을 주므로 surprising입니다.']]),
            L('관계대명사와 관계부사', '관계절에서 명사 성분이 빠지면 관계대명사, 장소·시간 부사어가 필요하면 관계부사를 검토합니다.', ['선행사의 의미만 보지 말고 관계절을 분석합니다.', '주어나 목적어가 비면 who·which 등을 씁니다.', '명사 성분이 갖춰진 절에 장소 관계이면 where를 씁니다.'], [['This is the house which I bought.', '이것은 내가 산 집이다.'], ['This is the house where I live.', '이것은 내가 사는 집이다.'], ['The student whose bag is blue is Mina.', '가방이 파란 학생은 미나이다.']], 'This is the house where I bought.', 'This is the house which I bought.', 'bought의 목적어가 빠져 있으므로 장소 명사 house라도 which를 씁니다.', [
                ['전치사 바로 뒤의 관계사: the house in ___ she lived', 'which', ['that', 'what', 'where'], 'in which가 장소 관계를 나타냅니다.'],
                ['소유 관계: a student ___ father is a doctor', 'whose', ['whom', 'where', 'which'], 'whose 뒤에 소유되는 명사 father가 옵니다.']])
        ]),
        U('h1u6', '6. 접속사와 비교', '절의 역할과 비교 기준을 정확히 구분합니다.', [
            L('명사절과 시간·조건 부사절', 'if절이 조건이면 미래 대신 현재형을 쓰지만, ‘~인지’라는 명사절이면 미래형도 가능합니다.', ['if절이 문장 성분인지 조건 수식어인지 봅니다.', '미래 조건·시간 부사절에는 현재형을 씁니다.', 'whether로 바꿀 수 있는 여부 명사절은 시제를 뜻에 맞춥니다.'], [['If it rains tomorrow, we will stay home.', '내일 비가 오면 우리는 집에 있을 것이다.'], ['I wonder if it will rain tomorrow.', '나는 내일 비가 올지 궁금하다.'], ['Call me when you arrive.', '도착하면 나에게 전화해 줘.']], 'If it will rain tomorrow, we will stay home.', 'If it rains tomorrow, we will stay home.', '이 if절은 조건 부사절이므로 현재형 rains로 미래를 나타냅니다.', [
                ['조건 부사절: If she ___ tomorrow, I will help.', 'comes', ['will come', 'came', 'has came'], '미래 조건에서는 현재형 comes를 씁니다.'],
                ['간접의문문: I wonder where she ___.', 'lives', ['does live?', 'live does', 'do live'], '의문사 뒤에 주어+동사를 둡니다.']]),
            L('원급·비교급·최상급', '두 대상·집단 사이 비교는 비교급, 같은 범위에서 가장 높은 정도는 최상급으로 나타냅니다.', ['비교 기준이 둘 사이인지 전체 범위인지 봅니다.', 'as 원급 as와 비교급 than의 틀을 확인합니다.', '비교급 앞 more와 -er를 중복하지 않습니다.'], [['This road is wider than that one.', '이 길은 저 길보다 넓다.'], ['Mina is as careful as Jisu.', '미나는 지수만큼 조심성이 있다.'], ['This is the most useful tool in the box.', '이것은 상자 안에서 가장 유용한 도구이다.']], 'This road is more wider than that one.', 'This road is wider than that one.', 'wider에 이미 비교 의미가 있어 more를 중복하지 않습니다.', [
                ['원급 비교: This book is as ___ as that one.', 'useful', ['more useful', 'most useful', 'usefully'], 'as와 as 사이에는 원급을 씁니다.'],
                ['최상급: She is the ___ runner in our class.', 'fastest', ['faster', 'fast', 'more fast'], '반 전체에서 가장 빠른 사람은 fastest입니다.']])
        ])
    ] };
    data.high2 = { title: '고2 문법', subtitle: '준동사·가정·관계사의 의미 차이를 문맥 속에서 분석합니다.', units: [
        U('h2u1', '1. 완료·진행과 조동사 완료', '기준 시점과 과거에 대한 판단을 구별합니다.', [
            L('완료진행과 미래완료', '완료진행은 기준 시점까지 이어진 동작을, 미래완료는 미래 기준까지 끝날 일을 나타냅니다.', ['현재·과거·미래 중 기준 시점을 정합니다.', '계속된 동작은 have/had been -ing로 씁니다.', '미래까지 완료는 will have p.p.로 씁니다.'], [['She has been studying for two hours.', '그녀는 두 시간째 공부하고 있다.'], ['He had been waiting when I arrived.', '내가 도착했을 때 그는 계속 기다리고 있었다.'], ['By Friday, I will have finished the report.', '금요일까지 나는 보고서를 끝낸 상태일 것이다.']], 'By next Friday, I will had finished it.', 'By next Friday, I will have finished it.', 'will 뒤에는 원형 have를 놓고 과거분사 finished를 연결합니다.', [
                ['미래완료의 기본 형태는?', 'will have + 과거분사', ['will had + 과거분사', 'will has + 과거분사', 'will have + 과거형만'], 'will have p.p.가 미래 기준까지의 완료입니다.'],
                ['현재까지 계속된 동작: She has ___ working since noon.', 'been', ['be', 'being', 'was'], 'have/has been -ing가 현재완료진행입니다.']]),
            L('must·cannot·should have p.p.', '조동사 have p.p.는 과거 일에 대한 추측이나 후회·비판을 표현합니다.', ['추측인지 실제 의무인지 문맥을 읽습니다.', 'must have p.p.는 강한 긍정 추측입니다.', 'should have p.p.는 했어야 했으나 하지 않은 일을 나타낼 수 있습니다.'], [['He must have missed the train.', '그는 기차를 놓쳤음이 틀림없다.'], ['She cannot have forgotten your name.', '그녀가 네 이름을 잊었을 리 없다.'], ['I should have checked the address.', '나는 주소를 확인했어야 했다.']], 'I should have check the address.', 'I should have checked the address.', '조동사 뒤 have는 원형이지만 본동사는 과거분사 checked입니다.', [
                ['과거에 대한 강한 긍정 추측: He ___ have left already.', 'must', ['will to', 'ought', 'has'], 'must have p.p.는 이미 떠났음이 틀림없다는 추측입니다.'],
                ['하지 않은 일의 후회: I should have ___ harder.', 'studied', ['study', 'studies', 'studying'], 'should have 뒤에는 과거분사를 씁니다.']])
        ]),
        U('h2u2', '2. 가정법의 시간', '현재 반대와 과거 반대 및 혼합 가정을 구별합니다.', [
            L('가정법 과거와 과거완료', '현재 반대는 if 과거형과 would 원형, 과거 반대는 if had p.p.와 would have p.p.로 나타냅니다.', ['실제 사실이 현재인지 과거인지 먼저 적습니다.', '현재 반대 가정의 be는 격식체에서 were를 씁니다.', '과거 결과에는 would have p.p.를 씁니다.'], [['If I were you, I would apologize.', '내가 너라면 사과하겠다.'], ['If she had left earlier, she would have caught the bus.', '그녀가 더 일찍 떠났다면 버스를 탔을 것이다.'], ['If I had more time now, I could help you.', '지금 시간이 더 있다면 너를 도울 수 있을 텐데.']], 'If I had known yesterday, I would help then.', 'If I had known yesterday, I would have helped then.', '어제 실현되지 않은 도움은 would have helped로 나타냅니다.', [
                ['현재 반대의 조건절: If I ___ taller now, I could reach it.', 'were', ['am', 'will be', 'have been'], '현재 비현실 가정에서 be는 were를 씁니다.'],
                ['과거 반대: If she ___ studied, she would have passed.', 'had', ['has', 'will', 'is'], 'if had p.p.가 과거 반대의 조건절입니다.']]),
            L('혼합 가정과 wish', '과거 원인이 현재 결과로 이어지면 조건절은 과거완료, 결과절은 would 원형으로 시간을 나눕니다.', ['조건과 결과가 가리키는 시간을 각각 찾습니다.', '과거 원인·현재 결과이면 had p.p.와 would 원형을 조합합니다.', 'wish 뒤 현재 아쉬움은 과거형, 과거 후회는 had p.p.를 씁니다.'], [['If I had taken that job, I would live in Seoul now.', '그 일을 맡았더라면 지금 서울에 살 텐데.'], ['I wish I knew the answer.', '내가 답을 안다면 좋을 텐데.'], ['I wish I had saved the file.', '내가 파일을 저장했더라면 좋았을 텐데.']], 'I wish I know the answer now.', 'I wish I knew the answer now.', '지금 모르는 사실에 대한 아쉬움은 wish 뒤 과거형 knew로 표현합니다.', [
                ['과거 후회: I wish I ___ brought an umbrella yesterday.', 'had', ['have', 'will', 'am'], '과거에 우산을 가져오지 않은 후회는 had brought입니다.'],
                ['과거 원인의 현재 결과: If I had slept well, I ___ feel tired now.', 'would not', ['would not have', 'had not', 'will have'], '현재 상태 feel에 would not을 붙입니다.']])
        ]),
        U('h2u3', '3. 준동사의 태와 시제', '준동사의 주체·수동 관계·시간을 해석합니다.', [
            L('완료·수동 부정사와 동명사', '준동사도 본동사보다 앞선 시간과 행동을 받는 수동 관계를 나타낼 수 있습니다.', ['본동사 기준보다 앞선 일인지 판단합니다.', '완료부정사는 to have p.p., 완료동명사는 having p.p.입니다.', '수동은 to be p.p. 또는 being p.p.로 표현합니다.'], [['He seems to have lost the key.', '그는 열쇠를 잃어버린 것 같다.'], ['She dislikes being interrupted.', '그녀는 방해받는 것을 싫어한다.'], ['The work needs to be finished today.', '그 일은 오늘 끝내야 한다.']], 'He seems to has lost the key.', 'He seems to have lost the key.', 'to 뒤 완료형의 have는 주어와 관계없이 원형입니다.', [
                ['본동사보다 앞선 완료부정사의 형태는?', 'to have + 과거분사', ['to had + 과거분사', 'to has + 과거분사', 'to + 과거형'], 'to have p.p.가 본동사보다 앞선 시간을 나타냅니다.'],
                ['수동 동명사: She hates ___ ignored.', 'being', ['be', 'is', 'to being'], '동명사 수동은 being p.p.입니다.']]),
            L('사역·지각동사와 수동 전환', 'make·see 등의 능동문에서 원형보어를 쓰더라도 수동문에서는 to가 나타날 수 있습니다.', ['목적어가 동작을 하는지 받는지 확인합니다.', '능동 make 목적어 원형과 수동 be made to를 구별합니다.', 'have 목적어 p.p.는 수리 등 행동을 받는 관계입니다.'], [['The teacher made us rewrite the essay.', '선생님은 우리에게 글을 다시 쓰게 했다.'], ['We were made to rewrite the essay.', '우리는 글을 다시 쓰도록 요구받았다.'], ['I had my bike repaired.', '나는 자전거를 수리 맡겼다.']], 'We were made rewrite the essay.', 'We were made to rewrite the essay.', 'make의 수동태에서는 능동문 원형보어 앞에 to가 나타납니다.', [
                ['make 수동: He was made ___ wait outside.', 'to', ['for', 'at', 'by'], 'be made to do로 씁니다.'],
                ['수리를 받는 자전거: I had my bike ___.', 'repaired', ['repair', 'repairing', 'repairs'], 'bike가 수리되는 관계이므로 과거분사입니다.']])
        ]),
        U('h2u4', '4. 분사구문과 주어', '분사구문의 의미상 주어와 선후 관계를 판별합니다.', [
            L('능동·수동·완료 분사구문', '분사구문의 숨은 주어는 원칙적으로 주절 주어이며, 그 주어와의 관계에 따라 분사 형태를 고릅니다.', ['주절 주어를 분사 동작의 주체로 넣어 봅니다.', '능동이면 -ing, 수동이면 p.p.를 검토합니다.', '앞서 완료된 동작을 강조하면 having p.p.를 씁니다.'], [['Walking home, I met Mina.', '집에 걸어가다가 나는 미나를 만났다.'], ['Seen from above, the island looks small.', '위에서 보면 그 섬은 작아 보인다.'], ['Having finished the work, she went home.', '일을 끝낸 뒤 그녀는 집에 갔다.']], 'Seen from above, I thought the island was small.', 'Seeing the island from above, I thought it was small.', 'I가 보는 주체이므로 능동 seeing을 씁니다. 섬이 주절 주어라면 seen이 가능합니다.', [
                ['수동 분사구문: ___ by the news, she said nothing.', 'Surprised', ['Surprising', 'Surprise', 'Surprises'], '주절 주어 she가 놀라움을 느낀 상태입니다.'],
                ['앞선 완료: ___ finished dinner, he left.', 'Having', ['Have', 'Has', 'Had'], 'having finished가 먼저 끝낸 일을 나타냅니다.']]),
            L('독립분사구문과 with', '분사구문의 주어가 주절 주어와 다르면 별도 주어를 밝히며, with 목적어 분사로 부대 상황을 덧붙일 수 있습니다.', ['두 동작의 주어가 같은지 비교합니다.', '다르면 명사 주어를 분사 앞에 남깁니다.', 'with 뒤 목적어와 분사의 능동·수동 관계를 판단합니다.'], [['Weather permitting, we will have a picnic.', '날씨가 허락하면 우리는 소풍을 갈 것이다.'], ['She sat with her eyes closed.', '그녀는 눈을 감은 채 앉아 있었다.'], ['He studied with music playing.', '그는 음악이 흐르는 가운데 공부했다.']], 'She sat with her eyes closing. (눈을 감은 상태)', 'She sat with her eyes closed.', '눈이 감긴 상태를 뜻하면 closed를 씁니다. closing은 감기는 동작을 나타냅니다.', [
                ['눈을 감은 상태: with his eyes ___', 'closed', ['close', 'closes', 'to close'], 'eyes와 닫힌 상태의 관계이므로 closed입니다.'],
                ['허락하는 날씨: Weather ___, we will leave.', 'permitting', ['permitted', 'permits', 'to permitted'], 'weather가 허락하는 주체이므로 permitting입니다.']])
        ]),
        U('h2u5', '5. 관계사와 명사절', 'what·that·which 및 복합관계사의 역할을 구별합니다.', [
            L('what과 that의 절 구조', '관계사 what은 선행사를 포함하고 절 안의 성분을 맡으며, 접속사 that은 완전한 내용절을 연결합니다.', ['앞에 꾸밈을 받는 선행사가 있는지 봅니다.', '절 안에 주어나 목적어가 빠졌는지 확인합니다.', '동격 that은 명사 뒤에서 완전한 사실 내용을 풉니다.'], [['What she said was true.', '그녀가 말한 것은 사실이었다.'], ['I believe that she is honest.', '나는 그녀가 정직하다고 믿는다.'], ['The fact that he won surprised us.', '그가 이겼다는 사실은 우리를 놀라게 했다.']], 'The thing what she said was true.', 'What she said was true.', 'what 자체에 the thing(s)의 의미가 있으므로 선행사를 중복하지 않습니다.', [
                ['선행사 포함, 목적어가 빈 절: ___ I need is rest.', 'What', ['That', 'Where', 'When'], 'need의 목적어를 맡는 what이 전체 주어절을 이끕니다.'],
                ['완전한 내용절: I know ___ she is honest.', 'that', ['what', 'whose', 'which'], 'she is honest는 완전한 절이므로 접속사 that입니다.']]),
            L('계속적 용법과 복합관계사', '쉼표 뒤 관계절은 정보를 덧붙이며, whoever·whatever는 선행사를 포함해 범위 제한 없이 나타냅니다.', ['쉼표 뒤에서는 that을 제외합니다.', 'which가 앞 절 전체를 받는지 확인합니다.', '복합관계사가 명사절인지 양보 부사절인지 살펴봅니다.'], [['Mina, who lives nearby, helped me.', '근처에 사는 미나가 나를 도왔다.'], ['He was late, which annoyed us.', '그는 늦었고, 그 일이 우리를 짜증 나게 했다.'], ['Whoever arrives first can choose a seat.', '먼저 도착하는 누구든 자리를 고를 수 있다.']], 'He was late, that annoyed us.', 'He was late, which annoyed us.', '앞 절 전체를 덧붙여 받는 계속적 관계사는 which를 씁니다.', [
                ['앞 절 전체 추가 설명: He failed, ___ surprised me.', 'which', ['that', 'what', 'who'], 'which가 앞의 실패 사실을 받습니다.'],
                ['누구든 먼저 도착하는 사람: ___ arrives first gets the key.', 'Whoever', ['Whatever', 'Whichever of', 'No matter'], 'whoever가 선행사를 포함한 주어절을 이끕니다.']])
        ]),
        U('h2u6', '6. 도치·강조와 병렬', '특수 어순에서도 문장 성분과 형태를 유지합니다.', [
            L('부정어·only 도치와 강조', '부정 부사어나 only 수식어가 문두에 오면 보통 주절의 조동사와 주어가 도치됩니다.', ['부정어·only가 주어 자체를 꾸미는지 부사어인지 구별합니다.', '조동사가 없으면 시제에 맞춰 do를 보충합니다.', 'It is/was ... that은 강조한 성분을 원래 자리에 돌려 확인합니다.'], [['Never have I seen such a view.', '그런 경치를 본 적이 전혀 없다.'], ['Only then did I understand the problem.', '그제야 나는 문제를 이해했다.'], ['It was Mina that solved the problem.', '그 문제를 푼 사람은 바로 미나였다.']], 'Only then I understood the problem.', 'Only then did I understand the problem.', 'only then은 문두 부사어이므로 did를 앞으로 보내고 본동사는 원형으로 둡니다.', [
                ['과거 도치: Never ___ I imagine this would happen.', 'did', ['do', 'does', 'am'], '과거 imagine의 도치에 did를 쓰고 동사는 원형으로 둡니다.'],
                ['강조구문: It was yesterday ___ we met.', 'that', ['what', 'whose', 'where'], '시간 부사 yesterday를 It was ... that으로 강조합니다.']]),
            L('병렬과 상관접속사', 'and·or 및 not only A but also B는 같은 문장 역할을 하는 요소를 나란히 연결합니다.', ['접속사가 연결하는 범위를 먼저 표시합니다.', '나란한 요소의 형태와 문장 기능을 맞춥니다.', '동사 수 일치는 주어 구조와 가까운 주어 등을 따로 확인합니다.'], [['She enjoys reading and writing.', '그녀는 읽기와 쓰기를 즐긴다.'], ['He is not only kind but also honest.', '그는 친절할 뿐 아니라 정직하다.'], ['You can either stay here or come with us.', '너는 여기 있거나 우리와 함께 갈 수 있다.']], 'She enjoys reading and to write.', 'She enjoys reading and writing.', 'enjoy의 목적어로 나란히 연결된 두 동작을 모두 동명사로 씁니다.', [
                ['동명사 병렬: He enjoys swimming and ___.', 'running', ['to run', 'ran', 'runs'], 'enjoy 뒤 나란한 목적어는 동명사로 맞춥니다.'],
                ['형용사 병렬: She is not only kind but also ___.', 'honest', ['honestly', 'honesty', 'be honest'], 'kind와 같은 보어 역할의 형용사 honest입니다.']])
        ])
    ] };
    data.high3 = { title: '고3 문법', subtitle: '긴 문장과 미묘한 의미 차이를 통합해 내신·수능 어법에 적용합니다.', units: [
        U('h3u1', '1. 긴 문장 구조 통합', '삽입된 절과 진짜 주절을 분리합니다.', [
            L('삽입 수식과 핵심 동사', '삽입된 관계절·전치사구를 묶으면 긴 문장에서도 주절의 주어와 서술동사를 찾을 수 있습니다.', ['관계절의 시작과 끝을 묶습니다.', '주절 주어의 핵심 명사와 수를 확인합니다.', '주절 서술동사가 실제로 있는지 확인합니다.'], [['The report that Mina wrote is useful.', '미나가 쓴 보고서는 유용하다.'], ['The students sitting near the door are ready.', '문 근처에 앉아 있는 학생들은 준비됐다.'], ['What the researchers found was unexpected.', '연구자들이 발견한 것은 예상 밖이었다.']], 'The report that Mina wrote are useful.', 'The report that Mina wrote is useful.', '주절 주어는 단수 report이며 wrote는 관계절 동사입니다.', [
                ['주절 수 일치: The results of the experiment ___ surprising.', 'are', ['is', 'be', 'has'], '핵심 주어 results는 복수입니다.'],
                ['명사절 주어: What she said ___ important.', 'is', ['are', 'be', 'have'], '하나의 내용을 나타내는 명사절 전체는 단수 취급합니다.']]),
            L('서술동사와 준동사의 구별', '접속사 없이 하나의 절에 서술동사를 나란히 놓을 수 없으므로 수식 동작은 준동사로 바꿉니다.', ['절을 연결하는 접속사와 관계사를 찾습니다.', '각 절에 필요한 서술동사를 하나씩 확인합니다.', '명사를 꾸미는 추가 동작에는 분사 등을 씁니다.'], [['The boy standing there is my brother.', '저기 서 있는 소년은 내 동생이다.'], ['She opened the door and entered the room.', '그녀는 문을 열고 방에 들어갔다.'], ['To solve this problem requires patience.', '이 문제를 푸는 데는 인내가 필요하다.']], 'The boy stands there is my brother.', 'The boy standing there is my brother.', '주절의 is 외에 stands를 접속사 없이 둘 수 없어 수식 분사 standing으로 바꿉니다.', [
                ['명사 수식: The girl ___ under the tree is Mina.', 'sitting', ['sits', 'sat', 'sit'], 'is가 주절 동사이고 sitting은 girl을 꾸밉니다.'],
                ['서술동사 완성: Reading books ___ me relax.', 'helps', ['helping', 'to help', 'helped to'], '동명사 주어 Reading books에 단수 동사 helps가 필요합니다.']])
        ]),
        U('h3u2', '2. 가정·추측·조건 도치', '표면 형태가 다른 가정을 같은 의미로 해석합니다.', [
            L('if 생략과 without 가정', '가정법 조건절의 had·were·should는 if를 생략하면 주어 앞으로 이동할 수 있습니다.', ['원래 if절의 시제와 조동사를 찾습니다.', 'if를 빼고 had/were/should를 앞으로 옮깁니다.', 'without의 가정은 문맥상 현재·과거 시간을 구별합니다.'], [['Had I known, I would have helped.', '내가 알았더라면 도왔을 것이다.'], ['Were I you, I would wait.', '내가 너라면 기다리겠다.'], ['Without your help, I could not have succeeded.', '네 도움이 없었다면 성공하지 못했을 것이다.']], 'Had I knew, I would have helped.', 'Had I known, I would have helped.', 'Had I known은 If I had known의 도치이므로 had 뒤 과거분사 known을 유지합니다.', [
                ['If I had known의 if 생략형: ___ I known', 'Had', ['Have', 'Did', 'Would'], 'had를 주어 앞으로 보내고 known을 유지합니다.'],
                ['현재 가정 도치: ___ I you, I would wait.', 'Were', ['Am', 'Will', 'Have'], 'If I were you에서 if를 생략한 형태입니다.']]),
            L('과거 추측과 후회의 문맥', 'must have p.p.는 과거에 대한 추측이고 had to는 과거의 실제 의무이므로 의미를 바꾸어 쓰지 않습니다.', ['사실을 추측하는지 실제 의무를 보고하는지 봅니다.', '추측은 조동사 have p.p.로 나타냅니다.', 'should have p.p.의 후회·비판과 must have p.p.의 추측을 구별합니다.'], [['He must have forgotten the meeting.', '그는 회의를 잊었음이 틀림없다.'], ['He had to attend the meeting yesterday.', '그는 어제 회의에 참석해야 했다.'], ['You should have told me earlier.', '너는 내게 더 일찍 말했어야 했다.']], 'He must have attend the meeting.', 'He must have attended the meeting.', '과거 추측의 have 뒤 본동사는 과거분사 attended여야 합니다.', [
                ['어제의 실제 의무: We ___ leave early yesterday.', 'had to', ['must have', 'should have', 'cannot have'], '실제 과거 의무를 나타내는 had to입니다.'],
                ['과거 추측: She must have ___ the message.', 'received', ['receive', 'receives', 'receiving'], 'must have 뒤에 과거분사 received를 씁니다.']])
        ]),
        U('h3u3', '3. 관계절과 동격절 통합', '절의 빈자리와 전치사 관계로 연결어를 선택합니다.', [
            L('관계절·동격절의 that', '명사 뒤 that절이 불완전하면 관계절, 완전한 사실 내용을 설명하면 동격절일 수 있습니다.', ['앞 명사가 fact·idea·news처럼 내용을 담는지 봅니다.', 'that절에서 주어나 목적어가 빠졌는지 분석합니다.', '뜻과 구조를 함께 보며 동격절과 관계절을 구별합니다.'], [['The news that she won made us happy.', '그녀가 우승했다는 소식은 우리를 기쁘게 했다.'], ['The news that she shared made us happy.', '그녀가 전한 소식은 우리를 기쁘게 했다.'], ['I accepted the idea that everyone needs rest.', '나는 누구나 휴식이 필요하다는 생각을 받아들였다.']], 'The news what she won made us happy.', 'The news that she won made us happy.', 'she won은 여기서 완전한 우승 사실을 말하며 news의 내용을 푸는 접속사 that이 필요합니다.', [
                ['동격 내용절: The fact ___ he lied shocked me.', 'that', ['what', 'where', 'whose'], 'he lied는 완전한 절이고 fact의 내용을 설명합니다.'],
                ['The book that I bought is new.에서 that절에 빠진 성분은?', '목적어', ['주어', '서술동사', '접속사 that 자체'], 'I bought 뒤에 산 대상이 빠져 있습니다.']]),
            L('전치사 관계사와 수량 관계사', '전치사 뒤에는 whom·which를 쓰고, 수량 표현 뒤 of whom/which는 앞 집단의 일부를 설명합니다.', ['전치사가 어떤 동사·명사와 연결되는지 봅니다.', '사람은 whom, 사물은 which를 검토합니다.', '일부를 덧붙이는 관계절은 쉼표와 of를 확인합니다.'], [['This is the issue about which we talked.', '이것이 우리가 이야기했던 쟁점이다.'], ['I have two brothers, both of whom live abroad.', '나는 형제가 두 명 있는데 둘 다 해외에 산다.'], ['She bought three books, one of which was expensive.', '그녀는 책 세 권을 샀는데 그중 한 권은 비쌌다.']], 'I have two brothers, both of that live abroad.', 'I have two brothers, both of whom live abroad.', '전치사 of 뒤 사람 관계대명사는 whom이며 계속적 용법에 that은 쓸 수 없습니다.', [
                ['전치사 뒤 사람: the person to ___ I spoke', 'whom', ['that', 'whose', 'what'], 'to 바로 뒤에는 whom을 씁니다.'],
                ['사물 집단의 일부: three books, one of ___ was new', 'which', ['whom', 'that', 'what'], 'books를 받는 of which입니다.']])
        ]),
        U('h3u4', '4. 비교·부정의 범위', '부정과 비교가 실제로 가리키는 의미를 읽습니다.', [
            L('부분 부정과 전체 부정', 'not all·not always는 일부만 부정하며, none·never는 해당 범위를 전체 부정합니다.', ['all·every·always가 not과 함께 있는지 봅니다.', '일부 예외인지 전부 해당하지 않는지 구별합니다.', '수량·빈도 표현을 한국어 뜻과 함께 점검합니다.'], [['Not all students agreed.', '모든 학생이 동의한 것은 아니었다.'], ['No students agreed.', '어떤 학생도 동의하지 않았다.'], ['She is not always late.', '그녀가 항상 늦는 것은 아니다.']], 'Not all students agreed. (아무도 동의하지 않았다)', 'No students agreed.', 'not all은 일부는 동의했을 수 있는 부분 부정이며 no students와 다릅니다.', [
                ['부분 부정 Not all students agreed.의 뜻은?', '모든 학생이 동의한 것은 아니다.', ['어떤 학생도 동의하지 않았다.', '모든 학생이 동의했다.', '학생들은 언제나 동의한다.'], 'not all은 전체가 모두 그렇지는 않다는 뜻입니다.'],
                ['빈도 전체 부정 ‘한 번도 ~않다’는?', 'never', ['not always', 'sometimes', 'usually'], 'never는 빈도를 전체 부정합니다.']]),
            L('비교급 강조와 비교 대상 일치', '비교급은 much·far·even 등으로 강조하며 같은 종류의 대상을 나란히 비교합니다.', ['비교급 앞 강조어와 very를 구별합니다.', 'than 양쪽에서 사람·성질 등 비교 대상을 맞춥니다.', '반복 명사는 단수 that, 복수 those로 대신할 수 있습니다.'], [['This book is much more useful.', '이 책은 훨씬 더 유용하다.'], ['The population of Seoul is larger than that of this town.', '서울의 인구는 이 마을의 인구보다 많다.'], ['The prices here are lower than those online.', '이곳의 가격은 온라인의 가격보다 낮다.']], 'This book is very better.', 'This book is much better.', 'very는 보통 원급을 꾸미고 비교급 better는 much 등으로 강조합니다.', [
                ['비교급 강조: This is ___ better.', 'much', ['very', 'too very', 'many'], 'much는 비교급 better를 강조합니다.'],
                ['복수 명사 대용: Our prices are lower than ___ in that shop.', 'those', ['that', 'it', 'this'], '복수 prices를 대신하므로 those를 씁니다.']])
        ]),
        U('h3u5', '5. 강조·생략과 일치', '생략된 성분을 복원해 어순과 수를 판단합니다.', [
            L('강조구문과 가주어 구문', 'It is ... that의 강조구문은 강조 부분을 원래 자리에 돌릴 수 있지만, 가주어 it은 뒤의 실제 주어 내용을 받습니다.', ['It과 that을 제거하고 강조 성분을 복원합니다.', '형용사 뒤 that 내용절이 실제 주어인지 봅니다.', '겉모양이 같아도 문장 성분으로 판단합니다.'], [['It was Mina that called me.', '내게 전화한 사람은 바로 미나였다.'], ['It is clear that she is right.', '그녀가 옳다는 것은 분명하다.'], ['It is important to keep promises.', '약속을 지키는 것은 중요하다.']], 'It was Mina what called me.', 'It was Mina that called me.', 'Mina를 강조하는 틀은 It was ... that이며 what으로 바꾸지 않습니다.', [
                ['It is clear that she is right.에서 it의 역할은?', '가주어', ['목적어', '관계대명사', '시간의 비인칭 주어'], '실제 주어인 that절을 대신해 앞자리를 채웁니다.'],
                ['강조구문: It was this book ___ I wanted.', 'that', ['what', 'whose', 'where'], '기본문 I wanted this book의 목적어를 강조합니다.']]),
            L('so·neither와 대동사', '앞 문장 내용에 동의할 때 so/neither 뒤 조동사는 앞 동사 종류와 시제를 따라갑니다.', ['앞 문장이 긍정인지 부정인지 봅니다.', 'be·조동사는 그대로, 일반동사는 do/does/did를 씁니다.', '다른 주어가 동의하는 도치와 같은 주어를 확인하는 어순을 구별합니다.'], [['She likes science, and so do I.', '그녀는 과학을 좋아하고 나도 그렇다.'], ['He was tired, and so was I.', '그는 피곤했고 나도 그랬다.'], ['She cannot swim, and neither can I.', '그녀는 수영을 못하고 나도 못한다.']], 'He went home, and so do I.', 'He went home, and so did I.', '앞 동사 went가 과거이므로 일반동사를 받는 대동사도 did입니다.', [
                ['과거 긍정 동의: She passed, and so ___ I.', 'did', ['do', 'does', 'am'], 'passed의 과거 시제에 맞춰 did를 씁니다.'],
                ['부정 동의: He is not ready, and neither ___ I.', 'am', ['is', 'do', 'did'], 'be동사와 주어 I에 맞춰 am을 씁니다.']])
        ]),
        U('h3u6', '6. 어법 종합과 문장 고치기', '관계·시제·수식 형태를 근거로 문장을 교정합니다.', [
            L('수식 대상과 감정·태 통합', '분사와 형용사를 고를 때 겉으로 가까운 말보다 실제 수식 대상과 능동·수동 관계를 확인합니다.', ['수식 대상 명사를 찾아 선으로 연결합니다.', '감정 원인과 감정 경험자를 구별합니다.', '주절 동사와 수식 준동사를 나눕니다.'], [['The students interested in science joined the club.', '과학에 관심 있는 학생들이 동아리에 가입했다.'], ['The evidence collected yesterday was useful.', '어제 수집된 증거는 유용했다.'], ['The lecture was confusing, so we asked questions.', '강의가 혼란스러워서 우리는 질문했다.']], 'The evidence collecting yesterday was useful.', 'The evidence collected yesterday was useful.', 'evidence는 수집하는 주체가 아니라 수집된 대상이므로 collected입니다.', [
                ['수동 수식: The data ___ by researchers is reliable.', 'collected', ['collecting', 'collects', 'to collecting'], 'data가 수집된 관계이므로 collected입니다.'],
                ['관심을 느끼는 학생: students ___ in art', 'interested', ['interesting', 'interest', 'interestingly'], '학생이 관심을 느끼므로 interested입니다.']]),
            L('조건·간접의문·관계절 통합', '같은 연결어라도 절이 맡는 역할을 확인하면 시제·어순·빈자리를 함께 판단할 수 있습니다.', ['명사절인지 부사절인지 관계절인지 나눕니다.', '명사절 질문에는 평서문 어순을 적용합니다.', '미래 조건 부사절과 여부 명사절의 시제를 구별합니다.'], [['I wonder if she will come tomorrow.', '그녀가 내일 올지 궁금하다.'], ['If she comes tomorrow, I will help her.', '그녀가 내일 오면 나는 그녀를 도울 것이다.'], ['This is the place which she recommended.', '이곳은 그녀가 추천한 장소이다.']], 'Do you know where does she live?', 'Do you know where she lives?', '간접의문문은 where 다음에 주어 she와 동사 lives를 두며 의문문용 does를 제거합니다.', [
                ['조건 부사절: If he ___ tomorrow, we will talk.', 'comes', ['will come', 'came', 'has came'], '미래 조건 부사절에는 현재형을 씁니다.'],
                ['불완전한 관계절: This is the place ___ I visited.', 'which', ['where', 'when', 'whose'], 'visited의 목적어가 빠져 있어 which가 필요합니다.']])
        ])
    ] };
})();

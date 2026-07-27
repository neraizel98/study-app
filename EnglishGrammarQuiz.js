(function () {
    const Q = (question, answer, choices, explanation) => ({ question, answer, choices, explanation });
    const banks = {
        e1: [Q('영어 문장의 기본 어순은?', '주어 + 동사', ['동사 + 주어', '목적어 + 주어', '동사 + 목적어'], '영어 문장은 주어 뒤에 동사가 옵니다.'), Q('The dog을 대신할 대명사는?', 'it', ['he', 'we', 'they'], '동물 한 마리를 가리킬 때 it을 쓸 수 있습니다.'), Q('“그녀는 책을 읽는다.”에 알맞은 시작은?', 'She reads', ['Her reads', 'She reades', 'She reading'], '주격 대명사 she와 동사 reads를 사용합니다.')],
        e2: [Q('I ___ a student.', 'am', ['is', 'are', 'be'], 'I와 함께 am을 씁니다.'), Q('They ___ happy.', 'are', ['am', 'is', 'be'], '복수 주어 they와 are를 씁니다.'), Q('She is tired.의 의문문은?', 'Is she tired?', ['Does she tired?', 'She is tired?', 'Do she tired?'], 'be동사를 문장 앞으로 보냅니다.')],
        e3: [Q('He ___ soccer every day.', 'plays', ['play', 'plaies', 'playing'], '3인칭 단수 현재에는 -(e)s를 붙입니다.'), Q('Does Mina ___ milk?', 'like', ['likes', 'liked', 'liking'], 'does 뒤에는 동사원형이 옵니다.'), Q('I ___ not know him.', 'do', ['does', 'am', 'is'], 'I의 일반동사 부정문에는 do를 씁니다.')],
        e4: [Q('yesterday와 어울리는 문장은?', 'I visited my aunt.', ['I visit my aunt.', 'I will visit my aunt.', 'I am visit my aunt.'], 'yesterday는 과거 시제의 단서입니다.'), Q('go의 과거형은?', 'went', ['goed', 'gone', 'goes'], 'go는 불규칙동사입니다.'), Q('will 뒤에 알맞은 형태는?', '동사원형', ['과거형', '-ing형', '과거분사'], '조동사 will 뒤에는 동사원형이 옵니다.')],
        e5: [Q('올바른 명령문은?', 'Open the window.', ['You opening the window.', 'To open the window.', 'Opened the window.'], '명령문은 동사원형으로 시작합니다.'), Q('can 뒤에 알맞은 형태는?', 'swim', ['swims', 'swam', 'swimming'], '조동사 뒤에는 동사원형이 옵니다.'), Q('“~하자”를 나타내는 표현은?', 'Let’s + 동사원형', ['Must + 동사원형', 'Do not + 동사원형', 'Be + 과거분사'], 'Let’s로 제안합니다.')],
        e6: [Q('He runs ___.', 'quickly', ['quick', 'quicker noun', 'quickness'], '동사 runs를 꾸미므로 부사가 필요합니다.'), Q('Monday 앞에 쓰는 전치사는?', 'on', ['at', 'in', 'under'], '요일 앞에는 on을 씁니다.'), Q('이유를 연결하는 접속사는?', 'because', ['but', 'or', 'under'], 'because는 이유를 나타냅니다.')],
        m1: [Q('She became a doctor.의 형식은?', '2형식', ['1형식', '3형식', '4형식'], 'a doctor가 주어 She를 설명하는 보어입니다.'), Q('He gave me a book.의 형식은?', '4형식', ['2형식', '3형식', '5형식'], 'me와 a book, 두 목적어가 있습니다.'), Q('The news made me happy.에서 happy는?', '목적격보어', ['주격보어', '직접목적어', '부사'], 'happy는 목적어 me의 상태를 설명합니다.')],
        m2: [Q('She ___ now.', 'is studying', ['studies yesterday', 'has study', 'studying'], '현재 진행은 be + -ing입니다.'), Q('go의 과거형은?', 'went', ['goed', 'gone', 'goes'], 'go는 불규칙동사입니다.'), Q('tomorrow와 잘 어울리는 것은?', 'will + 동사원형', ['과거형', 'had + p.p.', 'was + -ing only'], '앞으로의 일은 will + 동사원형으로 나타낼 수 있습니다.')],
        m3: [Q('“~할지도 모른다”에 알맞은 조동사는?', 'may', ['must', 'should not', 'had better not'], 'may는 가능성을 나타냅니다.'), Q('올바른 부정 명령문은?', 'Don’t + 동사원형', ['Not + 과거형', 'Do + -ing', 'Be not + 명사만'], '부정 명령문은 Don’t로 시작합니다.'), Q('명사를 중심으로 감탄할 때 시작하는 말은?', 'What', ['How only', 'Which', 'Why'], 'What + (a/an) + 형용사 + 명사 어순을 씁니다.')],
        m4: [Q('I enjoy ___ books.', 'reading', ['to read only', 'readed', 'to reading'], 'enjoy의 목적어로 동명사를 씁니다.'), Q('I came here ___ you.', 'to help', ['helping noun', 'helped', 'to helping'], '목적을 나타내는 to부정사입니다.'), Q('want 뒤에 알맞은 것은?', 'to + 동사원형', ['동명사만', '과거분사', '전치사 + 원형'], 'want는 to부정사를 목적어로 취합니다.')],
        m5: [Q('___ books (많은 책)', 'many', ['much', 'a little', 'less'], '셀 수 있는 복수명사 앞에는 many를 씁니다.'), Q('He is ___ kind. (항상)', 'always', ['careful', 'many', 'himself noun'], '빈도부사는 be동사 뒤에 옵니다.'), Q('She speaks English ___.', 'well', ['good', 'careful', 'many'], '동사 speaks를 꾸미는 부사 well이 필요합니다.')],
        m6: [Q('셋 이상 중 가장 큰 것을 비교할 때는?', '최상급', ['비교급', '원급', '현재분사'], '셋 이상의 범위에서는 최상급을 씁니다.'), Q('이유를 나타내는 접속사는?', 'because', ['but', 'or', 'on'], 'because는 이유를 나타내는 절을 연결합니다.'), Q('Monday 앞에 알맞은 전치사는?', 'on', ['at', 'in', 'from only'], '요일 앞에는 on을 씁니다.')],
        m7: [Q('장소를 묻는 의문사는?', 'where', ['when', 'why', 'who'], 'where는 장소를 묻습니다.'), Q('Do you want tea ___ juice?', 'or', ['because', 'at', 'so that'], '선택 의문문은 or로 선택지를 연결합니다.'), Q('You are a student, ___?', 'aren’t you', ['are you', 'don’t you', 'isn’t he'], '긍정 be동사 문장 뒤에는 부정형 부가의문문을 씁니다.')],
        m8: [Q('___ two books on the desk.', 'There are', ['There is', 'It are', 'They is'], '복수명사의 존재는 There are로 나타냅니다.'), Q('날씨를 나타낼 때 주어로 쓰는 것은?', 'it', ['there만', 'they', 'this book'], '날씨의 it은 비인칭 주어입니다.'), Q('___ a bank near here?', 'Is there', ['Are there', 'Does there', 'It is'], '단수명사의 존재를 묻는 말은 Is there로 시작합니다.')],
        h1: [Q('올바른 병렬 구조는?', 'reading and writing', ['to read and writing', 'read and to writing', 'reading and to wrote'], '등위접속사 양쪽의 형태를 맞춥니다.'), Q('make + 목적어 뒤에 오는 형태는?', '동사원형', ['to부정사만', '과거형', '전치사'], '사역동사 make의 목적격보어로 원형부정사를 씁니다.'), Q('I found the door locked.에서 locked는?', '목적격보어', ['서술동사', '주어', '접속사'], 'locked는 목적어 door의 상태를 설명합니다.')],
        h2: [Q('우리가 도착하기 전에 기차가 떠났다: The train ___ before we arrived.', 'had left', ['has left', 'will leave', 'leaves'], '과거 기준보다 앞선 일은 과거완료입니다.'), Q('By next year와 가장 잘 어울리는 것은?', 'will have p.p.', ['had p.p.', '현재진행만', '단순과거만'], '미래 기준 시점까지의 완료는 미래완료입니다.'), Q('보편적 진리의 종속절 시제는?', '현재형 유지 가능', ['항상 과거완료', '항상 미래형', '동사 생략'], '현재도 참인 사실은 현재형을 유지합니다.')],
        h3: [Q('If I ___ you, I would apologize.', 'were', ['am', 'will be', 'have been'], '현재 사실과 반대되는 가정에는 과거형 were를 씁니다.'), Q('과거 사실의 반대를 나타내는 if절은?', 'had + p.p.', ['과거형만', 'will + 원형', 'have + 현재형'], '가정법 과거완료의 if절은 had p.p.입니다.'), Q('I wish I ___ the answer. (현재 모름)', 'knew', ['know', 'will know', 'had knowing'], '현재의 아쉬움은 wish + 과거형입니다.')],
        h4: [Q('본동사보다 앞선 일을 나타내는 to부정사는?', 'to have p.p.', ['to be -ing', 'to + 원형', 'being p.p.'], '완료부정사는 본동사보다 앞선 시점을 나타냅니다.'), Q('수동 의미의 분사구문은 주로?', 'p.p.', ['동사원형', 'to + 원형', '조동사'], '주절 주어가 행동을 받으면 과거분사를 씁니다.'), Q('분사구문의 의미상 주어는 원칙적으로?', '주절의 주어와 같음', ['항상 목적어와 같음', '존재하지 않음', '접속사와 같음'], '주어가 다르면 독립분사구문 등 별도 표시가 필요합니다.')],
        h5: [Q('관계사 뒤가 완전한 절이고 장소를 나타낼 때는?', 'where', ['which', 'who', 'what only'], '관계부사 where 뒤에는 완전한 절이 옵니다.'), Q('선행사를 포함하는 관계사는?', 'what', ['that', 'which', 'whose'], 'what은 the thing(s) which의 의미입니다.'), Q('명사절에서 “~인지 아닌지”를 나타내는 것은?', 'whether', ['because', 'although', 'so that'], 'whether가 선택 여부를 나타냅니다.')],
        h6: [Q('Never가 문두에 올 때 올바른 어순은?', 'Never + 조동사 + 주어 + 동사', ['Never + 주어 + 동사', 'Never + 동사 + 조동사', '주어 + Never + 목적어만'], '부정어가 문두에 오면 조동사와 주어가 도치됩니다.'), Q('Had I known의 원래 조건절은?', 'If I had known', ['If I knew', 'If I know', 'When I had known'], '가정법 과거완료에서 if가 생략되면 had가 앞으로 갑니다.'), Q('It was Tom that solved it.은 어떤 구문인가?', '강조구문', ['수동태', '관계부사절', '명령문'], 'It is/was ... that은 특정 성분을 강조합니다.')]
    };

    const names = ['Mina', 'Jin', 'Sora', 'Tom', 'Yuna'];
    function shuffle(items) {
        const copy = [...items];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }
    function vary(item) {
        const name = names[Math.floor(Math.random() * names.length)];
        const question = item.question.replace(/Mina|Tom/g, name);
        const choices = shuffle([item.answer, ...item.choices]);
        return { question, choices, answerIndex: choices.indexOf(item.answer), explanation: item.explanation };
    }
    window.EnglishGrammarQuiz = {
        generate(unitId, count = 10) {
            const bank = banks[unitId] || [];
            const result = [];
            while (result.length < count && bank.length) result.push(vary(bank[result.length % bank.length]));
            return shuffle(result);
        }
    };
})();

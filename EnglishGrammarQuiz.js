(function () {
    const Q = (question, answer, choices, explanation, options = {}) => ({ question, answer, choices, explanation, ...options });
    const banks = {
        m9: [Q("I ___ visited Jeju twice.", "have", ["has","having","am"], "주어 I의 현재완료는 have + 과거분사입니다."), Q("We have lived here ___ five years.", "for", ["since","during","from"], "for 뒤에는 기간, since 뒤에는 시작 시점을 씁니다.")],
        m10: [Q("English ___ spoken in many countries.", "is", ["are","does","has"], "단수로 취급하는 English의 현재 수동태는 is spoken입니다."), Q("관계절에서 주어 역할을 하는 말을 고르세요: the boy who won the race", "who", ["the","race","boy"], "who는 관계절에서 won의 주어 역할을 합니다.")],
        n2u1: [Q("I ___ to Busan last year.", "went", ["have gone","have been","going"], "끝난 과거 시점 last year에는 단순과거 went를 씁니다."), Q("Have you ever ___ a whale?", "seen", ["saw","see","seeing"], "현재완료는 have + 과거분사 seen입니다.")],
        n2u2: [Q("The rule must ___ followed.", "be", ["is","being","been"], "조동사 수동태는 must be + 과거분사입니다."), Q("The bridge was ___ in 2010.", "built", ["build","building","builds"], "과거 수동태는 was + 과거분사 built입니다.")],
        n2u3: [Q("문을 잠그는 것을 잊지 말라는 뜻은?", "Remember to lock the door.", ["Remember locking the door.","Forget to lock the door.","Stop locking the door."], "remember to do는 앞으로 할 일을 기억하라는 뜻입니다."), Q("He stopped talking.의 뜻은?", "그는 말하는 것을 그만두었다.", ["그는 말하려고 멈췄다.","그는 계속 말했다.","그는 말할 것을 기억했다."], "stop doing은 하던 행동을 그만두는 것입니다.")],
        n2u4: [Q("My parents want me ___ honest.", "to be", ["be","being","am"], "want + 목적어 + to부정사를 사용합니다."), Q("a sleeping baby에서 sleeping이 나타내는 것은?", "아기가 자고 있는 상태", ["아기가 재워진 상태","아기가 잘 의무","아기가 잔 경험의 횟수"], "sleeping은 baby를 꾸미는 현재분사입니다.")],
        n2u5: [Q("I met a writer ___ books are famous.", "whose", ["who","whom","which"], "whose books는 그 작가의 책들이라는 소유 관계입니다."), Q("This is the house in ___ he lived.", "which", ["that","who","whose"], "사물 선행사에 쓰는 전치사 바로 뒤의 관계대명사는 which입니다.")],
        n2u6: [Q("Do you know where ___?", "she lives", ["does she live","she live","does she lives"], "간접의문문은 where + 주어 + 동사의 어순입니다."), Q("If it ___ tomorrow, we will stay home.", "rains", ["will rain","raining","rain"], "미래를 나타내는 조건 부사절에서는 현재형 rains를 씁니다.")],
        n3u1: [Q("She has been ___ for two hours.", "studying", ["study","studied","studies"], "현재완료진행은 has been + -ing입니다."), Q("과거완료의 형태는?", "had + 과거분사", ["have + 동사원형","was + 동사원형","will + 과거분사"], "과거 기준보다 앞선 일을 나타내는 과거완료는 had + 과거분사입니다.")],
        n3u2: [Q("If I had left earlier, I would have ___ the bus.", "caught", ["catch","catching","catches"], "가정법 과거완료의 주절은 would have + 과거분사입니다."), Q("과거의 공부를 후회하는 문장은?", "I wish I had studied harder.", ["I wish I study harder.","I wish I will study harder.","I wish I studying harder."], "과거의 후회에는 wish + had + 과거분사를 씁니다.")],
        n3u3: [Q("관계부사 how를 사용한 올바른 표현은?", "This is how he did it.", ["This is the way how he did it.","This is how did he it.","This is how he do it."], "the way와 how는 함께 쓰지 않습니다."), Q("Take whatever you need.의 whatever와 같은 뜻은?", "anything that", ["anyone who","the place where","the time when"], "whatever는 여기서 필요한 것은 무엇이든이라는 뜻입니다.")],
        n3u4: [Q("Having finished the work, she went home.에서 먼저 한 일은?", "일을 끝냈다.", ["집에 갔다.","일을 시작했다.","순서를 알 수 없다."], "having finished는 주절의 귀가보다 먼저 일을 끝냈음을 나타냅니다."), Q("Feeling tired, she went to bed early.에서 피곤한 사람은?", "she", ["bed","별도로 언급된 다른 사람","알 수 없음"], "이 분사구문의 의미상 주어는 주절의 주어 she입니다.")],
        n3u5: [Q("It was Mina that solved the problem.에서 강조하는 대상은?", "Mina", ["the problem","was","that"], "문제를 푼 사람이 미나임을 강조합니다."), Q("I like science, and so ___ he.", "does", ["do","is","has"], "일반동사 현재형의 긍정 동의는 so does he입니다.")],
        n3u6: [Q("He asked me where ___.", "I lived", ["did I live","do I live","I living"], "간접의문문에는 주어 I 뒤에 동사 lived가 옵니다."), Q("The teacher told us ___ quiet.", "to be", ["be","being","were"], "명령의 간접화법은 tell + 목적어 + to부정사입니다.")],
        e1: [Q('영어 문장의 기본 어순은?', '주어 + 동사', ['동사 + 주어', '목적어 + 주어', '동사 + 목적어'], '영어 문장은 주어 뒤에 동사가 옵니다.'), Q('The dog을 대신할 대명사는?', 'it', ['he', 'we', 'they'], '동물 한 마리를 가리킬 때 it을 쓸 수 있습니다.'), Q('“그녀는 책을 읽는다.”에 알맞은 시작은?', 'She reads', ['Her reads', 'She reades', 'She reading'], '주격 대명사 she와 동사 reads를 사용합니다.')],
        e2: [Q('I ___ a student.', 'am', ['is', 'are', 'be'], 'I와 함께 am을 씁니다.'), Q('They ___ happy.', 'are', ['am', 'is', 'be'], '복수 주어 they와 are를 씁니다.'), Q('She is tired.의 의문문은?', 'Is she tired?', ['Does she tired?', 'She is tired?', 'Do she tired?'], 'be동사를 문장 앞으로 보냅니다.')],
        e3: [Q('현재의 습관을 나타내도록 빈칸을 채우세요: He ___ soccer every day.', 'plays', ['play', 'played', 'is playing'], '3인칭 단수 현재에는 -(e)s를 붙입니다.'), Q('Does Mina ___ milk?', 'like', ['likes', 'liked', 'liking'], 'does 뒤에는 동사원형이 옵니다.'), Q('I ___ not know him.', 'do', ['does', 'am', 'is'], 'I의 일반동사 부정문에는 do를 씁니다.')],
        e4: [Q('yesterday와 어울리는 문장은?', 'I visited my aunt.', ['I visit my aunt.', 'I will visit my aunt.', 'I am visit my aunt.'], 'yesterday는 과거 시제의 단서입니다.'), Q('go의 과거형은?', 'went', ['goed', 'gone', 'goes'], 'go는 불규칙동사입니다.'), Q('will 뒤에 알맞은 형태는?', '동사원형', ['과거형', '-ing형', '과거분사'], '조동사 will 뒤에는 동사원형이 옵니다.')],
        e5: [Q('올바른 명령문은?', 'Open the window.', ['You opening the window.', 'To open the window.', 'Opened the window.'], '명령문은 동사원형으로 시작합니다.'), Q('can 뒤에 알맞은 형태는?', 'swim', ['swims', 'swam', 'swimming'], '조동사 뒤에는 동사원형이 옵니다.'), Q('“~하자”를 나타내는 표현은?', 'Let’s + 동사원형', ['Must + 동사원형', 'Do not + 동사원형', 'Be + 과거분사'], 'Let’s로 제안합니다.')],
        e6: [Q('He runs ___.', 'quickly', ['quickness', 'quicklyness', 'quicking'], '동사 runs를 꾸미므로 부사가 필요합니다.'), Q('‘월요일에’: ___ Monday', 'on', ['at', 'in', 'under'], '요일 앞에는 on을 씁니다.'), Q('이유를 연결하는 접속사는?', 'because', ['but', 'or', 'under'], 'because는 이유를 나타냅니다.')],
        m1: [Q('She became a doctor.의 형식은?', '2형식', ['1형식', '3형식', '4형식'], 'a doctor가 주어 She를 설명하는 보어입니다.'), Q('He gave me a book.의 형식은?', '4형식', ['2형식', '3형식', '5형식'], 'me와 a book, 두 목적어가 있습니다.'), Q('The news made me happy.에서 happy는?', '목적격보어', ['주격보어', '직접목적어', '부사'], 'happy는 목적어 me의 상태를 설명합니다.')],
        m2: [Q('현재진행형으로 완성하세요: She ___ now.', 'is studying', ['studied', 'has studied', 'studying'], '현재 진행은 be + -ing입니다.'), Q('go의 과거형은?', 'went', ['goed', 'gone', 'goes'], 'go는 불규칙동사입니다.'), Q('tomorrow와 잘 어울리는 것은?', 'will + 동사원형', ['동사의 과거형', 'had + p.p.', 'was + -ing'], '앞으로의 일은 will + 동사원형으로 나타낼 수 있습니다.')],
        m3: [Q('“~할지도 모른다”에 알맞은 조동사는?', 'may', ['must', 'should not', 'had better not'], 'may는 가능성을 나타냅니다.'), Q('올바른 부정 명령문은?', 'Don’t + 동사원형', ['Not + 동사원형', 'Do + -ing', 'Be not + 명사'], '부정 명령문은 Don’t로 시작합니다.'), Q('명사를 중심으로 감탄할 때 시작하는 말은?', 'What', ['How', 'Which', 'Why'], 'What + (a/an) + 형용사 + 명사 어순을 씁니다.')],
        m4: [Q('I enjoy ___ books.', 'reading', ['to read', 'read', 'to reading'], 'enjoy의 목적어로 동명사를 씁니다.'), Q('‘너를 도우려고 왔다’라는 목적을 나타내세요: I came here ___ you.', 'to help', ['helping', 'helped', 'to helping'], '목적을 나타내는 to부정사입니다.'), Q('‘~하고 싶다’: want ___ (동작을 나타낼 때)', 'to + 동사원형', ['동명사', '과거분사', '전치사 + 동사원형'], 'want는 to부정사를 목적어로 취합니다.')],
        m5: [Q('___ books (많은 책)', 'many', ['much', 'a little', 'less'], '셀 수 있는 복수명사 앞에는 many를 씁니다.'), Q('He is ___ kind. (항상)', 'always', ['careful', 'oftenly', 'himself'], '빈도부사는 be동사 뒤에 옵니다.'), Q('She speaks English ___.', 'well', ['good', 'careful', 'many'], '동사 speaks를 꾸미는 부사 well이 필요합니다.')],
        m6: [Q('셋 이상 중 가장 큰 것을 비교할 때는?', '최상급', ['비교급', '원급', '현재분사'], '한 범위에서 가장 큰 대상을 나타낼 때 최상급을 씁니다.'), Q('이유를 나타내는 접속사는?', 'because', ['but', 'or', 'on'], 'because는 이유를 나타내는 절을 연결합니다.'), Q('‘월요일에’: ___ Monday', 'on', ['at', 'in', 'from'], '요일 앞에는 on을 씁니다.')],
        m7: [Q('장소를 묻는 의문사는?', 'where', ['when', 'why', 'who'], 'where는 장소를 묻습니다.'), Q('Do you want tea ___ juice?', 'or', ['because', 'at', 'so that'], '선택 의문문은 or로 선택지를 연결합니다.'), Q('You are a student, ___?', 'aren’t you', ['are you', 'don’t you', 'isn’t he'], '긍정 be동사 문장 뒤에는 부정형 부가의문문을 씁니다.')],
        m8: [Q('___ two books on the desk.', 'There are', ['There is', 'It are', 'They is'], '복수명사의 존재는 There are로 나타냅니다.'), Q('날씨를 나타낼 때 주어로 쓰는 것은?', 'it', ['there', 'they', 'this'], '날씨의 it은 비인칭 주어입니다.'), Q('___ a bank near here?', 'Is there', ['Are there', 'Does there', 'It is'], '단수명사의 존재를 묻는 말은 Is there로 시작합니다.')],
        h1: [Q('올바른 병렬 구조는?', 'reading and writing', ['to read and writing', 'read and to writing', 'reading and to wrote'], '등위접속사 양쪽의 형태를 맞춥니다.'), Q('make + 목적어 뒤에 오는 형태는?', '동사원형', ['to부정사만', '과거형', '전치사'], '사역동사 make의 목적격보어로 원형부정사를 씁니다.'), Q('I found the door locked.에서 locked는?', '목적격보어', ['서술동사', '주어', '접속사'], 'locked는 목적어 door의 상태를 설명합니다.')],
        h2: [Q('우리가 도착하기 전에 기차가 떠났다: The train ___ before we arrived.', 'had left', ['has left', 'will leave', 'leaves'], '과거 기준보다 앞선 일은 과거완료입니다.'), Q('By next year와 가장 잘 어울리는 것은?', 'will have p.p.', ['had p.p.', 'be + -ing', '동사의 과거형'], '미래 기준 시점까지의 완료는 미래완료입니다.'), Q('보편적 진리의 종속절 시제는?', '현재형 유지 가능', ['항상 과거완료', '항상 미래형', '동사 생략'], '현재도 참인 사실은 현재형을 유지합니다.')],
        h3: [Q('If I ___ you, I would apologize.', 'were', ['am', 'will be', 'have been'], '현재 사실과 반대되는 가정에는 과거형 were를 씁니다.'), Q('과거 사실의 반대를 나타내는 if절은?', 'had + p.p.', ['동사의 과거형', 'will + 동사원형', 'have + p.p.'], '가정법 과거완료의 if절은 had p.p.입니다.'), Q('I wish I ___ the answer. (현재 모름)', 'knew', ['know', 'will know', 'had known'], '현재의 아쉬움은 wish + 과거형입니다.')],
        h4: [Q('본동사보다 앞선 일을 나타내는 to부정사는?', 'to have p.p.', ['to be -ing', 'to + 원형', 'being p.p.'], '완료부정사는 본동사보다 앞선 시점을 나타냅니다.'), Q('수동 의미의 분사구문은 주로?', 'p.p.', ['동사원형', 'to + 원형', '조동사'], '주절 주어가 행동을 받으면 과거분사를 씁니다.'), Q('분사구문의 의미상 주어는 원칙적으로?', '주절의 주어와 같음', ['항상 목적어와 같음', '존재하지 않음', '접속사와 같음'], '주어가 다르면 독립분사구문 등 별도 표시가 필요합니다.')],
        h5: [Q('관계사 뒤가 완전한 절이고 장소를 나타낼 때는?', 'where', ['which', 'who', 'what'], '관계부사 where 뒤에는 완전한 절이 옵니다.'), Q('선행사를 포함하는 관계사는?', 'what', ['that', 'which', 'whose'], 'what은 the thing(s) which의 의미입니다.'), Q('명사절에서 “~인지 아닌지”를 나타내는 것은?', 'whether', ['because', 'although', 'so that'], 'whether가 선택 여부를 나타냅니다.')],
        h6: [Q('Never가 문두에 올 때 올바른 어순은?', 'Never + 조동사 + 주어 + 동사', ['Never + 주어 + 동사', 'Never + 동사 + 조동사', '주어 + Never + 목적어만'], '부정어가 문두에 오면 조동사와 주어가 도치됩니다.'), Q('Had I known의 원래 조건절은?', 'If I had known', ['If I knew', 'If I know', 'When I had known'], '가정법 과거완료에서 if가 생략되면 had가 앞으로 갑니다.'), Q('It was Tom that solved it.은 어떤 구문인가?', '강조구문', ['수동태', '관계부사절', '명령문'], 'It is/was ... that은 특정 성분을 강조합니다.')]
    };

    function shuffle(items) {
        const copy = [...items];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }
    function vary(item, band = 'standard') {
        const choices = shuffle([item.answer, ...item.choices]);
        // Only closed, single-word questions can use exact text grading.
        const type = item.allowTyped !== false && /^[A-Za-z]+$/.test(item.answer)
            && Math.random() < ({foundation:0,standard:.35,challenge:.8}[band] ?? .35) ? 'short' : 'choice';
        return {
            type,
            question: item.question.replace('영어 문장을 완성하세요:', '영어 문장은?'),
            choices,
            answer: item.answer,
            tokens: [],
            answerIndex: choices.indexOf(item.answer),
            explanation: item.explanation
        };
    }

    function findUnit(unitId) {
        const data = window.EnglishGrammarData || {};
        for (const [stageId, stage] of Object.entries(data)) {
            const found = (stage.units || []).find(candidate => candidate.id === unitId);
            if (found) return { stageId, stage, unit: found };
        }
        return null;
    }

    function unique(items) {
        return [...new Set(items.filter(Boolean))];
    }

    function pickDistractors(items, answer, count = 3) {
        return shuffle(unique(items).filter(item => item !== answer)).slice(0, count);
    }

    function buildLearningQuestions(unitId) {
        const found = findUnit(unitId);
        if (!found) return [];

        const stageLessons = (found.stage.units || []).flatMap(stageUnit => stageUnit.lessons || []);
        const allMeanings = unique(stageLessons.flatMap(item => (item.examples || []).map(example => example[1])));
        const allSentences = unique(stageLessons.flatMap(item => (item.examples || []).map(example => example[0])));
        const generated = [];

        (found.unit.lessons || []).forEach((currentLesson, lessonIndex) => {
            (currentLesson.examples || []).forEach((example, exampleIndex) => {
                const [sentence, meaning] = example;
                const choices = pickDistractors(allMeanings.filter(candidate => !stageLessons.some(lesson => (lesson.examples || []).some(pair => pair[0] === sentence && pair[1] === candidate))), meaning);
                if (sentence && meaning && choices.length === 3) {
                    generated.push(Q(
                        `다음 예문의 뜻으로 알맞은 것은? ${sentence}`,
                        meaning,
                        choices,
                        `${currentLesson.title} 예문 ${exampleIndex + 1}: ${sentence} — ${meaning}`
                    ));
                }
                const sentenceChoices = pickDistractors(allSentences.filter(candidate => !stageLessons.some(lesson => (lesson.examples || []).some(pair => pair[1] === meaning && pair[0] === candidate))), sentence);
                if (sentence && meaning && sentenceChoices.length === 3) {
                    generated.push(Q(
                        `다음 뜻에 알맞은 영어 문장을 완성하세요: ${meaning}`,
                        sentence,
                        sentenceChoices,
                        `${currentLesson.title}의 알맞은 문장은 “${sentence}”입니다.`,
                        { allowTyped: true }
                    ));
                }
            });
        });

        return generated;
    }

    window.EnglishGrammarQuiz = {
        restoreReview(unitId, saved) {
            const pool = [...(banks[unitId] || []), ...buildLearningQuestions(unitId)];
            const answer = String(saved.correctAnswer || saved.answer || '').trim();
            const current = pool.find(item => item.answer === answer &&
                item.question.replace('영어 문장을 완성하세요:', '영어 문장은?') === saved.question);
            return current ? vary(current) : null;
        },
        generate(unitId, count = 10, band = 'standard') {
            const pool = [...(banks[unitId] || []), ...buildLearningQuestions(unitId)];
            const seen = new Set();
            const distinct = shuffle(pool).filter(item => {
                const key = `${item.question}\u0000${item.answer}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
            return distinct.slice(0, count).map(item => vary(item, band));
        }
    };
})();

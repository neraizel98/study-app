(function () {
    const lesson = (title, principle, rules, examples, tip) => ({ title, principle, rules, examples, tip });
    const unit = (id, title, goal, lessons) => ({ id, title, goal, lessons });

    window.EnglishGrammarData = {
        elementary: {
            title: '초등 문법',
            subtitle: '문장의 뼈대를 익히는 단계',
            units: [
                unit('e1', '1. 문장과 품사', '영어 어순과 명사·대명사를 구별합니다.', [
                    lesson('영어 문장의 기본 순서', '영어 문장은 보통 「주어 + 동사 + 나머지」 순서입니다.', ['주어: 누가/무엇이', '동사: 무엇을 하는지 또는 어떤 상태인지', '장소·시간은 보통 뒤에 둡니다.'], [['I play soccer.', '나는 축구를 한다.'], ['Mina reads at home.', '미나는 집에서 읽는다.']], '먼저 “누가?”, 다음으로 “무엇을 해?”를 찾으세요.'),
                    lesson('명사와 대명사', '명사는 이름이고, 대명사는 반복되는 명사를 대신합니다.', ['사람·장소·사물의 이름은 명사', 'I, you, he, she, it, we, they는 주격 대명사', '한 사람/사물은 he, she, it으로 바꿉니다.'], [['Jisu is kind. She is kind.', '지수는 친절하다. 그녀는 친절하다.'], ['The dog is small. It is small.', '그 개는 작다. 그것은 작다.']], '사람의 성별과 단수·복수를 먼저 확인하세요.')
                ]),
                unit('e2', '2. be동사', 'am·are·is로 상태와 정체를 표현합니다.', [
                    lesson('am, are, is', 'be동사는 ‘~이다/~에 있다/~한 상태다’를 나타냅니다.', ['I + am', 'you/we/they + are', 'he/she/it + is'], [['I am a student.', '나는 학생이다.'], ['They are happy.', '그들은 행복하다.']], '주어와 be동사를 한 묶음으로 외우세요.'),
                    lesson('be동사의 부정문과 의문문', '부정문은 be동사 뒤에 not, 의문문은 be동사를 문장 앞으로 보냅니다.', ['She is not tired.', 'Is she tired?', '대답: Yes, she is. / No, she is not.'], [['We are not late.', '우리는 늦지 않았다.'], ['Are you ready?', '너는 준비됐니?']], '일반동사처럼 do를 쓰지 않습니다.')
                ]),
                unit('e3', '3. 일반동사', '행동을 나타내는 동사의 현재형을 사용합니다.', [
                    lesson('현재형과 3인칭 단수', '현재의 습관은 동사원형을 쓰되, he/she/it에는 -(e)s를 붙입니다.', ['I/you/we/they play', 'he/she/it plays', '자음+y는 y를 i로 바꾸고 -es: study→studies'], [['I walk to school.', '나는 학교에 걸어간다.'], ['He watches TV.', '그는 TV를 본다.']], '주어가 한 명인지 먼저 확인하세요.'),
                    lesson('do와 does', '일반동사의 부정문·의문문에는 do/does가 필요합니다.', ['I/you/we/they + do', 'he/she/it + does', 'does 뒤의 본동사는 원형'], [['She does not like milk.', '그녀는 우유를 좋아하지 않는다.'], ['Does he run fast?', '그는 빨리 달리니?']], 'does가 이미 s 역할을 하므로 likes가 아니라 like입니다.')
                ]),
                unit('e4', '4. 시제의 기초', '현재·과거·미래의 시간을 구별합니다.', [
                    lesson('일반동사의 과거', '끝난 일은 동사의 과거형으로 나타냅니다.', ['규칙동사: 동사 + -(e)d', '불규칙동사: go→went, see→saw', 'yesterday, last가 과거의 힌트'], [['We visited Busan.', '우리는 부산을 방문했다.'], ['He went home.', '그는 집에 갔다.']], '시간 표현을 먼저 찾으면 시제가 보입니다.'),
                    lesson('미래와 be going to', '앞으로 할 일은 will 또는 be going to로 표현합니다.', ['will + 동사원형', 'be going to + 동사원형', '계획은 be going to가 자연스럽습니다.'], [['I will help you.', '내가 너를 도울게.'], ['We are going to travel.', '우리는 여행할 예정이다.']], 'will 뒤에는 주어와 관계없이 동사원형입니다.')
                ]),
                unit('e5', '5. 명령문·조동사', '요청, 명령, 능력과 허가를 표현합니다.', [
                    lesson('명령문과 Let’s', '명령문은 주어 없이 동사원형으로 시작합니다.', ['긍정: Open the door.', '부정: Don’t + 동사원형', '제안: Let’s + 동사원형'], [['Be careful.', '조심해.'], ['Let’s play outside.', '밖에서 놀자.']], '명령문에서 you는 보통 생략됩니다.'),
                    lesson('can과 must', '조동사는 동사에 능력·의무 같은 뜻을 더합니다.', ['can: ~할 수 있다', 'must: 반드시 ~해야 한다', '조동사 뒤에는 동사원형'], [['She can swim.', '그녀는 수영할 수 있다.'], ['You must wear a helmet.', '너는 헬멧을 써야 한다.']], 'can swims가 아니라 can swim입니다.')
                ]),
                unit('e6', '6. 문장을 풍부하게', '형용사·부사·전치사로 정보를 더합니다.', [
                    lesson('형용사와 부사', '형용사는 명사를, 부사는 동사·형용사·다른 부사를 꾸밉니다.', ['a beautiful flower', 'run quickly', 'be동사 뒤에는 형용사: is happy'], [['This is a tall tree.', '이것은 키 큰 나무다.'], ['He speaks slowly.', '그는 천천히 말한다.']], '무엇을 꾸미는지 보면 품사를 알 수 있습니다.'),
                    lesson('전치사와 접속사', '전치사는 위치·시간 관계를, 접속사는 말과 문장을 연결합니다.', ['장소: in, on, under, behind', '시간: at, on, in', '연결: and, but, because'], [['The cat is under the table.', '고양이는 탁자 아래에 있다.'], ['I stayed home because it rained.', '비가 와서 집에 있었다.']], '요일 앞에는 on, 시각 앞에는 at을 씁니다.')
                ])
            ]
        },
        middle: {
            title: '중1 문법',
            subtitle: '중학교 1학년 문장 구조와 표현을 익히는 단계',
            units: [
                unit('m1', '1. 문장의 형식', '1~5형식의 핵심 성분과 보어를 이해합니다.', [
                    lesson('1·2·3형식', '동사 뒤에 무엇이 필요한지에 따라 문장의 형식이 달라집니다.', ['1형식 S+V', '2형식 S+V+C', '3형식 S+V+O'], [['Birds fly.', '새들이 난다.'], ['She became a doctor.', '그녀는 의사가 되었다.'], ['I like music.', '나는 음악을 좋아한다.']], '보어는 주어나 목적어를 설명합니다.'),
                    lesson('4·5형식', '4형식은 두 목적어, 5형식은 목적어와 목적격보어를 가집니다.', ['4형식 S+V+IO+DO', '5형식 S+V+O+OC', 'make/keep/call은 5형식에 자주 사용'], [['He gave me a book.', '그는 내게 책을 주었다.'], ['The news made me happy.', '그 소식은 나를 행복하게 했다.']], 'me와 happy가 같은 대상을 가리키면 5형식입니다.')
                ]),
                unit('m2', '2. 시제와 진행형', '현재·과거·미래와 진행 중인 일을 구별합니다.', [
                    lesson('진행시제', 'be동사 + -ing는 특정 시점에 진행 중인 동작을 나타냅니다.', ['현재진행: am/are/is + -ing', '과거진행: was/were + -ing', '상태동사는 보통 진행형으로 쓰지 않음'], [['She is studying now.', '그녀는 지금 공부 중이다.'], ['They were sleeping at ten.', '그들은 10시에 자고 있었다.']], '진행형에는 be동사와 -ing가 모두 필요합니다.'),
                    lesson('과거와 미래', '끝난 일은 과거형, 앞으로의 일은 will + 동사원형으로 나타냅니다.', ['규칙동사: -(e)d', '불규칙동사: go→went, see→saw', '미래: will + 동사원형'], [['We visited Gyeongju last week.', '우리는 지난주 경주를 방문했다.'], ['I will call you tomorrow.', '나는 내일 네게 전화할 것이다.']], 'yesterday·last는 과거, tomorrow·next는 미래의 힌트입니다.')
                ]),
                unit('m3', '3. 조동사와 특별한 문장', '능력·의무·충고와 명령·감탄을 표현합니다.', [
                    lesson('조동사의 의미', '조동사는 말하는 사람의 판단과 태도를 나타냅니다.', ['may/might: 가능성', 'should: 충고', 'must/have to: 의무', 'must not: 금지'], [['You should get some rest.', '너는 좀 쉬어야 한다.'], ['It may rain tonight.', '오늘 밤 비가 올지도 모른다.']], 'must not과 don’t have to의 뜻은 다릅니다.'),
                    lesson('명령문과 감탄문', '명령문은 동사원형으로 시작하고, 감탄문은 What 또는 How로 느낌을 강조합니다.', ['명령: Be quiet.', '부정 명령: Don’t + 동사원형', '감탄: What + (a/an) + 형용사 + 명사!', '감탄: How + 형용사/부사!'], [['Don’t run in the hall.', '복도에서 뛰지 마라.'], ['What a beautiful day!', '정말 아름다운 날이구나!']], '명사가 중심이면 What, 형용사·부사가 중심이면 How를 사용합니다.')
                ]),
                unit('m4', '4. to부정사와 동명사', '동사를 명사·형용사·부사처럼 활용합니다.', [
                    lesson('to부정사의 세 용법', 'to + 동사원형은 문장에서 명사·형용사·부사 역할을 합니다.', ['명사적: To read is fun.', '형용사적: something to eat', '부사적: came to help'], [['I want to travel.', '나는 여행하고 싶다.'], ['I need a chair to sit on.', '나는 앉을 의자가 필요하다.']], 'to부정사가 무엇을 설명하는지 살펴보세요.'),
                    lesson('동명사와 목적어', '동사 + -ing가 명사 역할을 하면 동명사입니다.', ['enjoy/finish/mind + -ing', 'want/hope/plan + to부정사', 'stop은 목적어에 따라 뜻이 달라짐'], [['She enjoys cooking.', '그녀는 요리를 즐긴다.'], ['We decided to leave.', '우리는 떠나기로 결정했다.']], '동사마다 뒤에 오는 형태를 묶어 익히세요.')
                ]),
                unit('m5', '5. 명사·대명사와 수식어', '수·양을 나타내고 형용사와 부사를 구별합니다.', [
                    lesson('명사와 대명사의 수', '셀 수 있는 명사와 셀 수 없는 명사에 따라 수량 표현이 달라집니다.', ['many + 셀 수 있는 복수명사', 'much + 셀 수 없는 명사', 'some/any는 둘 다 가능', '재귀대명사: myself, yourself, themselves'], [['There are many books.', '책이 많이 있다.'], ['We need some water.', '우리는 물이 조금 필요하다.']], '명사를 셀 수 있는지 먼저 판단하세요.'),
                    lesson('형용사와 부사', '형용사는 명사·주어를 설명하고, 부사는 동사·형용사·다른 부사를 꾸밉니다.', ['a careful student', 'The student is careful.', 'The student writes carefully.', '빈도부사는 일반동사 앞, be동사 뒤'], [['He is always kind.', '그는 항상 친절하다.'], ['She speaks English well.', '그녀는 영어를 잘 말한다.']], 'be동사 뒤에는 상태를 나타내는 형용사가 옵니다.')
                ]),
                unit('m6', '6. 비교와 문장 연결', '대상을 비교하고 접속사·전치사로 의미를 연결합니다.', [
                    lesson('비교급과 최상급', '두 대상은 비교급, 셋 이상은 최상급으로 비교합니다.', ['비교급 + than', 'the + 최상급', 'as + 원급 + as'], [['Tom is taller than Jim.', '톰은 짐보다 키가 크다.'], ['This is the most useful tool.', '이것은 가장 유용한 도구다.']], '비교 범위가 셋 이상이면 최상급을 검토하세요.'),
                    lesson('접속사와 전치사', '접속사는 말·구·절을 연결하고, 전치사는 명사 앞에서 시간·장소 관계를 나타냅니다.', ['and/but/or/because', 'when/before/after/if', '시간: at 7, on Monday, in July', '장소: at the station, on the desk, in the room'], [['I stayed home because it rained.', '비가 와서 집에 있었다.'], ['Call me when you arrive.', '도착하면 전화해 줘.']], '접속사 뒤에는 주어+동사, 전치사 뒤에는 명사(구)가 옵니다.')
                ])
            ]
        },
        high: {
            title: '고등 문법',
            subtitle: '수능·내신 문장 분석과 의미 차이를 다루는 단계',
            units: [
                unit('h1', '1. 동사와 문장 구조 심화', '복합 문장에서 동사·준동사·보어를 정확히 찾습니다.', [
                    lesson('동사 수와 병렬 구조', '접속사로 연결된 요소는 문법적 형태와 기능이 나란해야 합니다.', ['등위접속사 양쪽의 형태 일치', '주절·종속절마다 서술동사 확인', '준동사는 문장의 서술동사가 아님'], [['She likes reading and writing.', '그녀는 읽기와 쓰기를 좋아한다.'], ['What matters is how we respond.', '중요한 것은 우리가 어떻게 반응하는가이다.']], '긴 문장은 접속사와 서술동사부터 표시하세요.'),
                    lesson('목적격보어의 다양한 형태', '5형식 목적격보어에는 명사·형용사·원형·분사·to부정사가 올 수 있습니다.', ['make/let/have + O + 원형', 'ask/allow + O + to부정사', 'keep/find + O + 형용사·분사'], [['The teacher made us rewrite it.', '선생님은 우리에게 그것을 다시 쓰게 했다.'], ['I found the door locked.', '나는 문이 잠겨 있음을 알았다.']], '목적어와 목적격보어의 능동·수동 관계를 판단하세요.')
                ]),
                unit('h2', '2. 완료와 시제 일치', '완료시제와 시간의 선후 관계를 정밀하게 표현합니다.', [
                    lesson('과거완료와 미래완료', '기준 시점보다 더 앞선 완료는 had p.p., 미래 기준 완료는 will have p.p.입니다.', ['과거보다 먼저: had p.p.', '미래까지 완료: will have p.p.', '시간절의 시제 규칙 확인'], [['The train had left before we arrived.', '우리가 도착하기 전에 기차는 떠났다.'], ['By Friday, I will have finished it.', '금요일까지 나는 끝냈을 것이다.']], 'by가 제시하는 기준 시점을 찾으세요.'),
                    lesson('시제 일치와 예외', '주절이 과거면 종속절도 보통 과거 계열이지만, 보편적 사실은 현재형을 유지합니다.', ['동시: said that he was tired', '이전: said that he had left', '불변의 진리: The earth moves around the sun.'], [['She said that she needed help.', '그녀는 도움이 필요하다고 말했다.'], ['The teacher explained that water boils at 100°C.', '선생님은 물이 100도에서 끓는다고 설명했다.']], '내용이 지금도 참인지 판단하세요.')
                ]),
                unit('h3', '3. 가정법', '사실과 반대되는 상황과 아쉬움을 표현합니다.', [
                    lesson('가정법 과거·과거완료', '현재 반대는 과거형, 과거 반대는 had p.p.를 사용합니다.', ['If + 과거, would + 원형', 'If + had p.p., would have p.p.', 'be동사는 격식체에서 were'], [['If I were you, I would apologize.', '내가 너라면 사과하겠다.'], ['If she had left earlier, she would have caught it.', '더 일찍 떠났다면 그것을 탔을 것이다.']], '형태는 과거지만 의미 시점은 한 단계 뒤로 물러납니다.'),
                    lesson('I wish와 without', 'wish·as if·without도 가정의 의미를 만들 수 있습니다.', ['I wish + 과거: 현재의 아쉬움', 'I wish + had p.p.: 과거의 후회', 'without = if it were not for / if it had not been for'], [['I wish I knew the answer.', '내가 답을 안다면 좋을 텐데.'], ['Without your help, I could not have succeeded.', '네 도움이 없었다면 성공하지 못했을 것이다.']], '실제 사실과 반대되는 시점을 먼저 정하세요.')
                ]),
                unit('h4', '4. 준동사 심화', '준동사의 의미상 주어·태·시제를 해석합니다.', [
                    lesson('준동사의 태와 완료형', '준동사도 능동·수동과 기준 시점 이전을 나타낼 수 있습니다.', ['to be p.p. / being p.p.: 수동', 'to have p.p. / having p.p.: 완료', '본동사와의 시간 관계 판단'], [['He seems to have lost the key.', '그는 열쇠를 잃어버린 것 같다.'], ['She dislikes being treated unfairly.', '그녀는 부당한 대우를 받는 것을 싫어한다.']], '완료형 준동사는 본동사보다 앞선 일을 나타냅니다.'),
                    lesson('분사구문', '부사절의 접속사와 주어를 줄여 분사로 표현합니다.', ['능동: -ing', '수동: p.p.', '완료: having p.p.', '의미상 주어가 주절 주어와 같아야 함'], [['Walking home, I met Jane.', '집에 걸어가다가 제인을 만났다.'], ['Seen from above, the city looks small.', '위에서 보면 도시는 작아 보인다.']], '분사와 주절 주어 사이의 관계를 반드시 확인하세요.')
                ]),
                unit('h5', '5. 관계사·접속사 심화', '절의 완전성과 선행사를 이용해 연결어를 선택합니다.', [
                    lesson('관계대명사와 관계부사', '관계사 뒤 절의 빠진 성분 여부가 선택 기준입니다.', ['불완전한 절: 관계대명사', '완전한 절: 관계부사', 'what은 선행사를 포함'], [['This is the place where we met.', '이곳은 우리가 만난 장소다.'], ['What he said was true.', '그가 말한 것은 사실이었다.']], '뒤 절이 완전한지 먼저 검사하세요.'),
                    lesson('명사절 접속사', 'that·whether·의문사가 문장에서 명사 역할을 하는 절을 이끕니다.', ['that: 사실·진술', 'whether/if: ~인지 아닌지', '의문사절은 평서문 어순'], [['Whether he agrees is uncertain.', '그가 동의할지는 불확실하다.'], ['I wonder why she left.', '나는 그녀가 왜 떠났는지 궁금하다.']], '문장 속에서 주어·목적어·보어 자리를 찾으세요.')
                ]),
                unit('h6', '6. 강조·도치·생략', '특수 구문의 형태와 강조되는 의미를 파악합니다.', [
                    lesson('도치 구문', '부정어가 문두에 오거나 조건절에서 if가 생략되면 어순이 바뀝니다.', ['Never + 조동사 + S + V', 'Only then + 조동사 + S + V', 'Had I known = If I had known'], [['Never have I seen such a view.', '그런 경치를 본 적이 전혀 없다.'], ['Had I known, I would have helped.', '알았더라면 도왔을 것이다.']], '도치는 조동사를 주어 앞으로 보내는 것이 핵심입니다.'),
                    lesson('강조·생략·대용', '반복을 피하거나 특정 성분을 두드러지게 하는 구조입니다.', ['It is/was ... that 강조', 'do/does/did 동사 강조', '대용: one/ones, so, do so'], [['It was Tom that solved the problem.', '그 문제를 푼 사람은 바로 톰이었다.'], ['She said she would come, and she did.', '그녀는 오겠다고 했고 실제로 왔다.']], '강조구문에서 It is/was와 that을 빼도 기본 문장이 성립합니다.')
                ])
            ]
        }
    };
    // 이번 공개 범위는 초등 과정부터 중학교 1학년까지입니다.
    delete window.EnglishGrammarData.high;
})();

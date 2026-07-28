(function () {
    const $ = id => document.getElementById(id);
    const params = new URLSearchParams(location.search);
    const allowedStages = ['elementary', 'middle'];
    let stageId = allowedStages.includes(params.get('stage')) ? params.get('stage') : 'elementary';
    let unitId = params.get('unit') || EnglishGrammarData[stageId].units[0].id;
    let lessonIndex = Math.max(0, Number(params.get('lesson') || 0));
    const requestedReview = params.get('mode') === 'review';
    const requestedQuiz = params.get('mode') === 'quiz' || requestedReview;
    let mode = requestedQuiz ? 'quiz' : 'study';
    let questions = [], questionIndex = 0, score = 0, answered = false, timerController = null;
    let sessionId = '', attempts = [];
    const principleDetails = {
        e1: '한국어는 조사가 문장 성분을 알려 주지만 영어는 자리와 순서가 그 역할을 합니다. 그래서 단어 뜻만 아는 것보다 주어와 동사의 위치를 먼저 찾는 습관이 중요합니다. 문장을 읽을 때 “누가 또는 무엇이”를 찾고, 바로 뒤에서 그 대상의 행동이나 상태를 나타내는 동사를 확인하세요.',
        e2: 'be동사는 행동이 아니라 주어의 정체, 상태, 위치를 이어 주는 연결 동사입니다. 주어에 따라 am·are·is의 모양이 달라지지만 뜻과 역할은 같습니다. 부정문과 의문문에서도 별도의 do를 쓰지 않고 be동사 자체의 위치만 바꾼다는 점이 핵심입니다.',
        e3: '일반동사는 실제 행동이나 반복되는 습관을 나타냅니다. 현재형에서는 주어가 he·she·it처럼 한 사람이나 한 사물일 때만 동사에 -(e)s가 붙습니다. 의문문이나 부정문에서 does를 사용하면 3인칭 단수 표시는 does가 담당하므로 본동사는 반드시 원형으로 돌아갑니다.',
        e4: '시제는 동작이 언제 일어나는지를 동사의 모양으로 표시하는 장치입니다. 먼저 yesterday·last·tomorrow·next 같은 시간 표현을 찾은 뒤 현재, 과거, 미래 중 하나를 선택하세요. 불규칙 과거형은 규칙으로 만들 수 없으므로 자주 쓰는 동사부터 문장 속에서 익히는 것이 좋습니다.',
        e5: '명령문과 조동사는 짧지만 말하는 사람의 의도와 태도를 분명하게 전달합니다. 명령문은 듣는 사람 you를 생략하고 동사원형으로 시작하며, 조동사는 능력·의무·허가 같은 의미를 본동사에 더합니다. 조동사 자체가 주어와 시제를 표시하므로 뒤의 본동사는 형태가 변하지 않습니다.',
        e6: '문장의 뼈대가 완성된 뒤 형용사·부사·전치사·접속사를 사용하면 더 정확한 정보를 더할 수 있습니다. 형용사는 사람이나 사물의 성질을, 부사는 행동의 방법이나 정도를 설명합니다. 전치사 뒤에는 명사가 오고 접속사 뒤에는 주어와 동사를 갖춘 문장이 올 수 있다는 차이를 확인하세요.',
        m1: '문장 형식은 뜻을 억지로 외우는 표가 아니라 동사가 뒤에 어떤 성분을 요구하는지 보여 주는 지도입니다. 먼저 서술동사를 찾고, 그 뒤에 목적어나 보어가 필요한지 살펴보세요. 보어는 새로운 행동의 대상이 아니라 주어나 목적어가 누구인지, 어떤 상태인지 다시 설명하는 성분입니다.',
        m2: '영어의 시제와 진행형은 기준 시점과 동작의 진행 상태를 함께 보여 줍니다. 단순시제는 사실·습관·완료된 사건에 초점을 두고, 진행형은 특정 순간에 동작이 진행 중임을 강조합니다. be동사가 시제를 담당하고 본동사의 -ing가 진행 의미를 담당하므로 두 요소가 모두 필요합니다.',
        m3: '조동사는 가능성, 의무, 충고처럼 사실에 대한 말하는 사람의 판단을 덧붙입니다. 같은 행동이라도 can, may, must, should에 따라 의미의 강도가 달라집니다. 명령문과 감탄문은 평서문과 어순이 다르므로 문장의 목적이 정보 전달인지, 지시인지, 감정 표현인지 먼저 판단하세요.',
        m4: 'to부정사와 동명사는 원래 동사였던 말을 문장 안에서 명사나 수식어처럼 사용하게 해 줍니다. 형태만 보고 판단하지 말고 문장에서 주어·목적어·보어 중 어느 자리를 차지하는지 확인하세요. 특히 앞 동사가 to부정사와 동명사 중 어느 것을 목적어로 요구하는지 묶어서 익혀야 합니다.',
        m5: '명사의 셀 수 있음 여부는 단수·복수뿐 아니라 many, much, a few, a little 같은 수량 표현을 결정합니다. 형용사와 부사는 꾸미는 대상이 다르므로 겉모양보다 문장 속 기능을 봐야 합니다. be동사 뒤에서 주어의 상태를 설명하면 형용사, 일반동사의 방식을 설명하면 부사가 오는 경우가 많습니다.',
        m6: '비교 표현은 대상의 수와 비교 기준에 따라 원급·비교급·최상급을 선택합니다. 접속사와 전치사는 모두 말을 연결하지만 접속사는 절과 절을, 전치사는 명사와 다른 성분의 관계를 연결합니다. 빈칸 뒤에 주어와 동사가 있는지 확인하면 두 품사를 구별하기 쉽습니다.',
        m7: '의문문은 묻고 싶은 정보를 문장 앞에 표시한 뒤 나머지 부분을 의문문 어순으로 배열합니다. 의문사만 붙이고 평서문 어순을 그대로 두는 실수가 많으므로 be동사인지 일반동사인지 먼저 구별하세요. 부가의문문은 앞 문장의 동사와 주어를 그대로 받아 긍정과 부정을 반대로 만드는 구조입니다.',
        m8: 'There is/are의 there는 장소를 직접 가리키기보다 새로운 사람이나 사물의 존재를 소개합니다. 따라서 be동사는 뒤에 오는 실제 명사의 수에 맞춰야 합니다. 날씨·시간·거리의 it은 특정 사물을 대신하지 않는 비인칭 주어이므로 “그것”이라고 해석하지 않고 문장 전체 의미로 이해하세요.'
    };

    const stage = () => EnglishGrammarData[stageId];
    const unit = () => stage().units.find(item => item.id === unitId) || stage().units[0];
    const levelLabel = () => stageId === 'elementary' ? 'Lv. 1' : 'Lv. 2';
    const context = () => `grammar:${stageId}`;
    const aliases = () => [`영문법 ${levelLabel()}`, `영어 문법 ${levelLabel()}`, stage().title];

    function setUrl() {
        const urlMode = requestedReview && mode === 'quiz' ? 'review' : mode;
        const q = new URLSearchParams({ stage: stageId, unit: unit().id, lesson: String(lessonIndex), mode: urlMode });
        history.replaceState(null, '', `?${q}`);
    }

    function renderSelectors() {
        $('stageTabs').innerHTML = allowedStages.map(id =>
            `<button class="level-btn ${id === stageId ? 'active' : ''}" data-stage="${id}">${id === 'elementary' ? 'Lv. 1' : 'Lv. 2'}</button>`
        ).join('');
        $('unitTabs').innerHTML = stage().units.map(item =>
            `<button class="unit-chip ${item.id === unit().id ? 'active' : ''}" data-unit="${item.id}">${item.title}</button>`
        ).join('');
        $('lessonTabs').innerHTML = unit().lessons.map((item, index) =>
            `<button class="lesson-chip ${index === lessonIndex ? 'active' : ''}" data-lesson="${index}">${index + 1}. ${item.title}</button>`
        ).join('');
        $('courseSubtitle').textContent = `${stageId === 'elementary' ? 'Lv. 1 · 초등 문법' : 'Lv. 2 · 중1 문법'} · ${unit().goal}`;
    }

    function renderStudy() {
        const item = unit().lessons[lessonIndex] || unit().lessons[0];
        $('lessonTitle').textContent = item.title;
        $('principle').textContent = item.principle;
        $('principleDetail').textContent = principleDetails[unit().id] || '';
        $('rules').innerHTML = item.rules.map((rule, i) => `<li><span>${i + 1}</span>${rule}</li>`).join('');
        $('examples').innerHTML = item.examples.map(([en, ko]) =>
            `<article><strong>${en}</strong><p>${ko}</p><button class="speak" data-speak="${en.replace(/"/g, '&quot;')}">🔊 듣기</button></article>`
        ).join('');
        $('tip').textContent = item.tip;
        $('prevLesson').disabled = lessonIndex === 0;
        $('nextLesson').disabled = lessonIndex === unit().lessons.length - 1;
        $('studyPanel').hidden = false;
        $('quizPanel').hidden = true;
        mode = 'study';
        $('studyModeBtn').classList.add('active');
        $('quizModeBtn').classList.remove('active');
        setUrl();
        timerController?.startTimer();
    }

    function quizUnlocked() {
        return requestedReview || typeof StudyTimer === 'undefined' || StudyTimer.isUnlocked('grammar', context(), aliases());
    }

    function getReviewQuestions() {
        if (typeof WrongNote === 'undefined') return [];
        const wrongItems = (WrongNote.getAll().grammar || []).filter(item =>
            !item.isMastered && item.stageId === stageId && item.unitId === unit().id
        );
        return wrongItems.map(item => {
            const correctAnswer = String(item.correctAnswer || item.answer || '').normalize('NFC').trim();
            const seen = new Set();
            const choices = [correctAnswer, ...(item.choices || [])]
                .map(value => String(value ?? '').normalize('NFC').trim())
                .filter(value => value && !seen.has(value.toLocaleLowerCase()) && seen.add(value.toLocaleLowerCase()));
            const shuffled = typeof Utils !== 'undefined' ? Utils.shuffle(choices) : choices.sort(() => Math.random() - 0.5);
            return {
                question: item.question,
                choices: shuffled,
                answerIndex: shuffled.findIndex(value => value.toLocaleLowerCase() === correctAnswer.toLocaleLowerCase()),
                explanation: item.explanation || `정답은 ${correctAnswer}입니다.`
            };
        }).filter(item => item.answerIndex >= 0 && item.choices.length >= 2);
    }

    function startQuiz() {
        if (!quizUnlocked()) {
            const status = StudyTimer.getStatus('grammar', context(), aliases());
            alert(`${unit().title} 학습 시간이 ${Math.ceil((status.requiredSeconds - status.accumulatedSeconds) / 60)}분 부족합니다.`);
            mode = 'study';
            renderStudy();
            return;
        }
        questions = requestedReview ? getReviewQuestions() : EnglishGrammarQuiz.generate(unit().id, 10);
        if (!questions.length) {
            alert('이 단원에서 다시 풀 오답이 없습니다.');
            location.href = 'wrong_note.html';
            return;
        }
        questionIndex = 0; score = 0; answered = false; mode = 'quiz';
        sessionId = `grammar-${Date.now()}`; attempts = [];
        $('studyPanel').hidden = true;
        $('quizPanel').hidden = false;
        $('studyModeBtn').classList.remove('active');
        $('quizModeBtn').classList.add('active');
        setUrl();
        renderQuestion();
        timerController?.stopTimer();
    }

    function renderQuestion() {
        const q = questions[questionIndex];
        answered = false;
        $('quizProgress').textContent = `문제 ${questionIndex + 1} / ${questions.length}`;
        $('quizScore').textContent = `${score}점`;
        $('quizQuestion').textContent = q.question;
        $('quizFeedback').hidden = true;
        $('nextQuestion').hidden = true;
        $('quizChoices').innerHTML = q.choices.map((choice, index) =>
            `<button class="answer" data-answer="${index}"><span>${index + 1}</span>${choice}</button>`
        ).join('');
    }

    function chooseAnswer(index) {
        if (answered) return;
        answered = true;
        const q = questions[questionIndex];
        const correct = index === q.answerIndex;
        if (correct) score += 10;
        const detail = {
            type: `${unit().id}:${q.question}`,
            category: 'grammar',
            stageId,
            stageTitle: stage().title,
            unitId: unit().id,
            unitTitle: unit().title,
            question: q.question,
            selectedAnswer: q.choices[index],
            correctAnswer: q.choices[q.answerIndex],
            answer: q.choices[q.answerIndex],
            choices: q.choices,
            explanation: q.explanation,
            correct
        };
        attempts.push(detail);
        if (typeof WrongNote !== 'undefined') {
            WrongNote.save('grammar', detail, correct ? 'correct' : 'wrong', sessionId, 1);
        }
        [...$('quizChoices').children].forEach((button, i) => {
            button.disabled = true;
            if (i === q.answerIndex) button.classList.add('correct');
            else if (i === index) button.classList.add('wrong');
        });
        $('quizScore').textContent = `${score}점`;
        $('quizFeedback').hidden = false;
        $('quizFeedback').className = `feedback ${correct ? 'good' : 'bad'}`;
        $('quizFeedback').innerHTML = `<strong>${correct ? '정답입니다!' : '다시 확인해 보세요.'}</strong><p>${q.explanation}</p>`;
        $('nextQuestion').hidden = false;
        $('nextQuestion').textContent = questionIndex === questions.length - 1 ? '결과 보기' : '다음 문제';
    }

    function finishQuiz() {
        const initialScore = score / 10;
        if (!requestedReview && typeof StudyTimer !== 'undefined') StudyTimer.recordResult('grammar', context(), initialScore, questions.length, sessionId);
        if (typeof saveQuizResult === 'function') {
            saveQuizResult(sessionId, 'grammar', `${stage().title} · ${unit().title}`, questions.length, initialScore, initialScore, 0, true, {
                category: 'grammar',
                review: requestedReview,
                stageId,
                stageTitle: stage().title,
                unitId: unit().id,
                unitTitle: unit().title,
                attempts
            });
        }
        $('resultEmoji').textContent = score >= 90 ? '🏆' : score >= 70 ? '👍' : '📚';
        $('resultTitle').textContent = score >= 90 ? '문법 마스터!' : score >= 70 ? '잘했어요!' : '조금 더 연습해요!';
        $('resultScore').textContent = `${initialScore} / ${questions.length}점`;
        $('resultMessage').textContent = `${stage().title} · ${unit().title} 퀴즈를 완료했습니다.`;
        $('resultModal').classList.remove('hidden');
    }

    function bind() {
        $('stageTabs').addEventListener('click', e => {
            const button = e.target.closest('[data-stage]'); if (!button) return;
            stageId = button.dataset.stage; unitId = stage().units[0].id; lessonIndex = 0;
            renderSelectors(); renderStudy();
        });
        $('unitTabs').addEventListener('click', e => {
            const button = e.target.closest('[data-unit]'); if (!button) return;
            unitId = button.dataset.unit; lessonIndex = 0;
            renderSelectors(); renderStudy();
        });
        $('lessonTabs').addEventListener('click', e => {
            const button = e.target.closest('[data-lesson]'); if (!button) return;
            lessonIndex = Number(button.dataset.lesson); renderSelectors(); renderStudy();
        });
        $('examples').addEventListener('click', e => {
            const button = e.target.closest('[data-speak]'); if (!button || !speechSynthesis) return;
            speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(button.dataset.speak));
        });
        $('prevLesson').addEventListener('click', () => { if (lessonIndex > 0) { lessonIndex--; renderSelectors(); renderStudy(); } });
        $('nextLesson').addEventListener('click', () => { if (lessonIndex < unit().lessons.length - 1) { lessonIndex++; renderSelectors(); renderStudy(); } });
        $('startQuiz').addEventListener('click', startQuiz);
        $('quizChoices').addEventListener('click', e => {
            const button = e.target.closest('[data-answer]'); if (button) chooseAnswer(Number(button.dataset.answer));
        });
        $('nextQuestion').addEventListener('click', () => {
            if (questionIndex < questions.length - 1) { questionIndex++; renderQuestion(); } else finishQuiz();
        });
        $('backToStudy').addEventListener('click', renderStudy);
        $('studyModeBtn').addEventListener('click', renderStudy);
        $('quizModeBtn').addEventListener('click', startQuiz);
        $('retryBtn').addEventListener('click', () => { $('resultModal').classList.add('hidden'); startQuiz(); });
        $('studyAgainBtn').addEventListener('click', () => { $('resultModal').classList.add('hidden'); renderStudy(); });
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!stage().units.some(item => item.id === unitId)) unitId = stage().units[0].id;
        lessonIndex = Math.min(lessonIndex, unit().lessons.length - 1);
        renderSelectors(); bind(); renderStudy();
        if (typeof StudyTimer !== 'undefined') {
            timerController = StudyTimer.initBar('grammar', $('startQuiz'), {
                getContext: context,
                getAliases: aliases,
                getLabel: () => `영문법 · ${levelLabel()} (${stage().title})`,
                isLearningActive: () => mode === 'study' && !$('studyPanel').hidden,
                isLockBypassed: () => requestedReview
            });
            timerController.startTimer();
            window.addEventListener('beforeunload', () => timerController?.stopTimer());
        }
        if (requestedQuiz) startQuiz();
    });
})();

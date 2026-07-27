(function () {
    const $ = id => document.getElementById(id);
    const params = new URLSearchParams(location.search);
    const allowedStages = ['elementary', 'middle'];
    let stageId = allowedStages.includes(params.get('stage')) ? params.get('stage') : 'elementary';
    let unitId = params.get('unit') || EnglishGrammarData[stageId].units[0].id;
    let lessonIndex = Math.max(0, Number(params.get('lesson') || 0));
    const requestedQuiz = params.get('mode') === 'quiz';
    let mode = requestedQuiz ? 'quiz' : 'study';
    let questions = [], questionIndex = 0, score = 0, answered = false, timerController = null;

    const stage = () => EnglishGrammarData[stageId];
    const unit = () => stage().units.find(item => item.id === unitId) || stage().units[0];
    const context = () => `grammar:${stageId}:${unit().id}`;
    const aliases = () => [`영문법 ${stage().title} ${unit().title}`, unit().title];

    function setUrl() {
        const q = new URLSearchParams({ stage: stageId, unit: unit().id, lesson: String(lessonIndex), mode });
        history.replaceState(null, '', `?${q}`);
    }

    function renderSelectors() {
        $('stageTabs').innerHTML = allowedStages.map(id =>
            `<button class="level-btn ${id === stageId ? 'active' : ''}" data-stage="${id}">${EnglishGrammarData[id].title}</button>`
        ).join('');
        $('unitTabs').innerHTML = stage().units.map(item =>
            `<button class="unit-chip ${item.id === unit().id ? 'active' : ''}" data-unit="${item.id}">${item.title}</button>`
        ).join('');
        $('lessonTabs').innerHTML = unit().lessons.map((item, index) =>
            `<button class="lesson-chip ${index === lessonIndex ? 'active' : ''}" data-lesson="${index}">${index + 1}. ${item.title}</button>`
        ).join('');
        $('courseSubtitle').textContent = `${stage().subtitle} · ${unit().goal}`;
    }

    function renderStudy() {
        const item = unit().lessons[lessonIndex] || unit().lessons[0];
        $('lessonTitle').textContent = item.title;
        $('principle').textContent = item.principle;
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
        timerController?.refresh();
    }

    function quizUnlocked() {
        return typeof StudyTimer === 'undefined' || StudyTimer.isUnlocked('english', context(), aliases());
    }

    function startQuiz() {
        if (!quizUnlocked()) {
            const status = StudyTimer.getStatus('english', context(), aliases());
            alert(`${unit().title} 학습 시간이 ${Math.ceil((status.requiredSeconds - status.accumulatedSeconds) / 60)}분 부족합니다.`);
            mode = 'study';
            renderStudy();
            return;
        }
        questions = EnglishGrammarQuiz.generate(unit().id, 10);
        questionIndex = 0; score = 0; answered = false; mode = 'quiz';
        $('studyPanel').hidden = true;
        $('quizPanel').hidden = false;
        $('studyModeBtn').classList.remove('active');
        $('quizModeBtn').classList.add('active');
        setUrl();
        renderQuestion();
        timerController?.refresh();
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
        if (typeof StudyTimer !== 'undefined') StudyTimer.recordResult('english', context(), initialScore, questions.length);
        if (typeof saveQuizResult === 'function') {
            saveQuizResult(`grammar-${Date.now()}`, 'english', `영문법 ${stage().title} ${unit().title}`, questions.length, initialScore, initialScore, 0, true);
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
            timerController = StudyTimer.initBar('english', $('startQuiz'), {
                getContext: context,
                getAliases: aliases,
                getLabel: () => `영문법 · ${unit().title}`,
                isLearningActive: () => mode === 'study' && !$('studyPanel').hidden
            });
        }
        if (requestedQuiz) startQuiz();
    });
})();

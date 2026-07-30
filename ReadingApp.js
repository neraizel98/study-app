(function () {
    const $ = id => document.getElementById(id);
    const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
    const params = new URLSearchParams(location.search);
    const levelId = 'level1';
    const level = () => ReadingData.levels[levelId];
    let unitId = params.get('unit') || level().units[0].id;
    let lessonIndex = Math.max(0, Number(params.get('lesson') || 0));
    const reviewMode = params.get('mode') === 'review';
    let mode = 'study', timerController = null, passage = null, questions = [];
    let questionIndex = 0, score = 0, answered = false, attempts = [], sessionId = '', startTime = 0;

    const unit = () => level().units.find(item => item.id === unitId) || level().units[0];
    const context = () => `reading:${levelId}`;
    const aliases = () => ['국어 독해력 Lv. 1', '중1 독해', level().title];
    const hasNextLesson = () => lessonIndex < unit().lessons.length - 1
        || level().units.findIndex(item => item.id === unit().id) < level().units.length - 1;

    function setUrl(nextMode = mode) {
        history.replaceState(null, '', `?level=${levelId}&unit=${unit().id}&lesson=${lessonIndex}&mode=${reviewMode && nextMode === 'quiz' ? 'review' : nextMode}`);
    }

    function renderSelectors() {
        $('unitTabs').innerHTML = level().units.map(item => `<button class="unit-btn ${item.id === unit().id ? 'active' : ''}" data-unit="${item.id}">${item.title}</button>`).join('');
        $('lessonTabs').innerHTML = unit().lessons.map((item, index) => `<button class="lesson-btn ${index === lessonIndex ? 'active' : ''}" data-lesson="${index}">${index + 1}. ${item.title}</button>`).join('');
    }

    function renderStudy() {
        mode = 'study';
        const item = unit().lessons[lessonIndex] || unit().lessons[0];
        $('lessonTitle').textContent = item.title;
        $('principle').textContent = item.principle;
        $('rules').innerHTML = item.rules.map((rule, index) => `<li><strong>${index + 1}.</strong> ${rule}</li>`).join('');
        const examples = item.examples || [{ label: '적용 예문', text: item.example, analysis: item.tip }];
        $('studyExamples').innerHTML = examples.map(example => `
            <article class="study-example">
                <strong>${escapeHTML(example.label)}</strong>
                <div class="study-example-text">${escapeHTML(example.text)}</div>
                <p class="study-example-analysis">🔎 ${escapeHTML(example.analysis)}</p>
            </article>
        `).join('');
        $('tip').textContent = item.tip;
        $('prevLesson').disabled = lessonIndex === 0;
        $('nextLesson').disabled = !hasNextLesson();
        $('studyPanel').hidden = false; $('quizPanel').hidden = true;
        $('studyModeBtn').classList.add('active'); $('quizModeBtn').classList.remove('active');
        setUrl(); timerController?.startTimer();
    }

    function recentPassageIds() {
        return SmartStudy.LocalRepository.getPreference(SmartStudy.StorageKeys.recentPassages(levelId), []);
    }

    function rememberPassage(id) {
        const recent = [id, ...recentPassageIds().filter(item => item !== id)].slice(0, 4);
        SmartStudy.LocalRepository.setPreference(SmartStudy.StorageKeys.recentPassages(levelId), recent);
    }

    function activeWrongItems() {
        return typeof WrongNote === 'undefined' ? [] : (WrongNote.getAll().reading || []).filter(item => !item.isMastered);
    }

    function selectPassage(band) {
        const wrong = activeWrongItems();
        if (reviewMode && wrong.length) {
            const ids = [...new Set(wrong.map(item => item.passageId))];
            return ReadingPassages.find(item => item.id === ids[Math.floor(Math.random() * ids.length)]);
        }
        const wrongPassageIds = new Set(wrong.map(item => item.passageId));
        const eligible = ReadingPassages.filter(item => {
            if (band.name === 'foundation') return item.difficulty !== 'challenge';
            if (band.name === 'challenge') return item.difficulty !== 'foundation';
            return true;
        });
        const unseen = eligible.filter(item => !recentPassageIds().includes(item.id));
        let pool = unseen.length ? unseen : eligible;
        const priority = pool.filter(item => wrongPassageIds.has(item.id));
        if (priority.length && Math.random() < band.wrongRatio) pool = priority;
        return Utils.shuffle(pool)[0];
    }

    function validatePassage(item, questionPool = item?.questions || []) {
        if (!item || !Array.isArray(item.lines) || item.lines.length < 5) return false;
        return questionPool.every(question => {
            const normalized = question.choices.map(value => String(value).normalize('NFC').trim().toLocaleLowerCase());
            return question.id && question.evidence && question.choices.length === 4
                && new Set(normalized).size === 4 && normalized.includes(String(question.answer).normalize('NFC').trim().toLocaleLowerCase());
        });
    }

    function startQuiz() {
        if (!reviewMode && typeof StudyTimer !== 'undefined' && !StudyTimer.isUnlocked('reading', context(), aliases())) {
            const status = StudyTimer.getStatus('reading', context(), aliases());
            alert(`국어 독해력을 ${Math.ceil((status.requiredSeconds - status.accumulatedSeconds) / 60)}분 더 학습해야 합니다.`);
            renderStudy();
            return;
        }
        const band = typeof AdaptiveQuiz !== 'undefined' ? AdaptiveQuiz.getBand('reading', context(), aliases()) : { name: 'standard', wrongRatio: .45 };
        passage = selectPassage(band);
        const vocabularyQuestions = typeof ReadingVocabulary !== 'undefined'
            ? ReadingVocabulary.getQuestions(passage)
            : [];
        const questionPool = [...passage.questions, ...vocabularyQuestions];
        if (!validatePassage(passage, questionPool)) {
            alert('검증된 지문을 불러오지 못했습니다.');
            return;
        }
        const wrongIds = new Set(activeWrongItems().filter(item => item.passageId === passage.id).map(item => item.questionId));
        const base = questionPool.filter(item => {
            if (reviewMode) return wrongIds.has(item.id);
            if (band.name === 'foundation') return item.difficulty !== 'challenge';
            return true;
        });
        const priority = Utils.shuffle(base.filter(item => wrongIds.has(item.id)));
        const selected = [];
        const addUnique = item => {
            if (item && !selected.some(existing => existing.id === item.id)) selected.push(item);
        };
        priority.slice(0, 3).forEach(addUnique);
        if (!reviewMode) {
            const vocabulary = Utils.shuffle(base.filter(item => item.vocabularyType));
            vocabulary.slice(0, 2).forEach(addUnique);
        }
        Utils.shuffle(base).forEach(item => {
            if (selected.length < Math.min(5, base.length)) addUnique(item);
        });
        questions = selected.slice(0, Math.min(5, base.length));
        if (!questions.length) { alert('다시 풀 오답이 없습니다.'); location.href = 'wrong_note.html'; return; }
        rememberPassage(passage.id);
        questionIndex = 0; score = 0; answered = false; attempts = [];
        sessionId = `reading-${Date.now()}`; startTime = Date.now(); mode = 'quiz';
        $('studyPanel').hidden = true; $('quizPanel').hidden = false;
        $('studyModeBtn').classList.remove('active'); $('quizModeBtn').classList.add('active');
        $('passageMeta').textContent = `${level().title} · ${passage.category} · ${band.name === 'foundation' ? '기초' : band.name === 'challenge' ? '심화' : '표준'}`;
        $('passageTitle').textContent = passage.title;
        $('passage').innerHTML = passage.lines.map((line, index) => `<p><span class="line-no">${index + 1}</span>${line}</p>`).join('');
        $('sourceNote').textContent = passage.sourceNote;
        setUrl(); timerController?.stopTimer(); renderQuestion();
    }

    function renderQuestion() {
        const item = questions[questionIndex];
        answered = false;
        $('quizProgress').textContent = `${questionIndex + 1} / ${questions.length} · ${score}점`;
        $('quizQuestion').textContent = `[${item.skill}] ${item.question}`;
        const choices = Utils.shuffle([...item.choices]);
        item.renderedChoices = choices;
        $('quizChoices').innerHTML = choices.map((choice, index) => `<button class="answer" data-index="${index}"><span>${index + 1}</span>${choice}</button>`).join('');
        $('quizFeedback').hidden = true; $('nextQuestion').hidden = true;
    }

    function answer(index) {
        if (answered) return;
        answered = true;
        const item = questions[questionIndex];
        const selected = item.renderedChoices[index];
        const correct = selected === item.answer;
        if (correct) score += 1;
        const detail = {
            type: `${passage.id}:${item.id}`, category: 'reading', level: level().title,
            unitId: passage.unitId, unitTitle: level().units.find(candidate => candidate.id === passage.unitId)?.title || '',
            passageId: passage.id, passageTitle: passage.title, passageText: passage.lines,
            questionId: item.id, skill: item.skill, question: item.question, choices: item.choices,
            selectedAnswer: selected, correctAnswer: item.answer, answer: item.answer,
            explanation: `${item.evidence} 정답: ${item.answer}`, correct
        };
        attempts.push(detail);
        if (typeof WrongNote !== 'undefined') WrongNote.save('reading', detail, correct ? 'correct' : 'wrong', sessionId, 1);
        [...$('quizChoices').children].forEach((button, buttonIndex) => {
            button.disabled = true;
            const value = item.renderedChoices[buttonIndex];
            if (value === item.answer) button.classList.add('correct');
            else if (buttonIndex === index) button.classList.add('wrong');
        });
        $('quizFeedback').hidden = false;
        $('quizFeedback').className = `feedback ${correct ? 'good' : 'bad'}`;
        $('quizFeedback').innerHTML = `<strong>${correct ? '정답입니다.' : '지문 근거를 다시 확인하세요.'}</strong><p>${item.evidence}</p><p><b>정답:</b> ${item.answer}</p>`;
        $('nextQuestion').hidden = false;
        $('nextQuestion').textContent = questionIndex === questions.length - 1 ? '결과 보기' : '다음 문제';
        $('quizProgress').textContent = `${questionIndex + 1} / ${questions.length} · ${score}점`;
    }

    function finish() {
        const pct = Math.round(score / questions.length * 100);
        if (!reviewMode && typeof StudyTimer !== 'undefined') StudyTimer.recordResult('reading', context(), score, questions.length, sessionId);
        if (typeof saveQuizResult === 'function') saveQuizResult(sessionId, 'reading', `${level().title} · ${passage.title}`, questions.length, score, score, Math.round((Date.now() - startTime) / 1000), true, {
            category: 'reading', review: reviewMode, levelId, passageId: passage.id, passageTitle: passage.title,
            unitId: passage.unitId, skills: attempts.map(item => item.skill), attempts
        });
        $('resultScore').textContent = `${score} / ${questions.length} (${pct}%)`;
        $('resultMessage').textContent = `${passage.title} · ${pct >= 90 ? '근거를 정확히 찾았습니다!' : pct >= 70 ? '좋아요. 틀린 근거를 확인해 보세요.' : '학습 원리를 복습하고 다시 도전해 보세요.'}`;
        $('resultModal').hidden = false;
    }

    function bind() {
        $('unitTabs').addEventListener('click', event => { const button = event.target.closest('[data-unit]'); if (!button) return; unitId = button.dataset.unit; lessonIndex = 0; renderSelectors(); renderStudy(); });
        $('lessonTabs').addEventListener('click', event => { const button = event.target.closest('[data-lesson]'); if (!button) return; lessonIndex = Number(button.dataset.lesson); renderSelectors(); renderStudy(); });
        $('prevLesson').addEventListener('click', () => { if (lessonIndex > 0) { lessonIndex--; renderSelectors(); renderStudy(); } });
        $('nextLesson').addEventListener('click', () => {
            if (lessonIndex < unit().lessons.length - 1) lessonIndex++;
            else {
                const next = level().units[level().units.findIndex(item => item.id === unit().id) + 1];
                if (!next) return; unitId = next.id; lessonIndex = 0;
            }
            renderSelectors(); renderStudy();
        });
        $('startQuiz').addEventListener('click', startQuiz); $('quizModeBtn').addEventListener('click', startQuiz);
        $('studyModeBtn').addEventListener('click', renderStudy); $('backToStudy').addEventListener('click', renderStudy);
        $('quizChoices').addEventListener('click', event => { const button = event.target.closest('[data-index]'); if (button) answer(Number(button.dataset.index)); });
        $('nextQuestion').addEventListener('click', () => { if (questionIndex < questions.length - 1) { questionIndex++; renderQuestion(); } else finish(); });
        $('retryQuiz').addEventListener('click', () => { $('resultModal').hidden = true; startQuiz(); });
        $('resultStudy').addEventListener('click', () => { $('resultModal').hidden = true; renderStudy(); });
        $('shareResult').addEventListener('click', () => KakaoShare?.sendReport('reading', score, questions.length, Math.round(score / questions.length * 100), score, 1, { sessionId, levelInfo: level().title, startTime, endTime: Date.now() }));
    }

    document.addEventListener('DOMContentLoaded', () => {
        renderSelectors(); bind(); renderStudy();
        if (typeof StudyTimer !== 'undefined') {
            timerController = StudyTimer.initBar('reading', $('startQuiz'), {
                getContext: context, getAliases: aliases, getLabel: () => level().title,
                isLearningActive: () => mode === 'study' && !$('studyPanel').hidden,
                isLockBypassed: () => reviewMode
            });
            timerController.startTimer();
        }
        if (params.get('mode') === 'quiz' || reviewMode) startQuiz();
    });
})();

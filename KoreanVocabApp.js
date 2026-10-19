(function () {
    'use strict';
    const $ = id => document.getElementById(id);
    const SUBJECT = 'korean_vocab';
    const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
    const params = new URLSearchParams(location.search);
    const data = window.KoreanVocabData;
    const reviewMode = params.get('mode') === 'review';
    const usableLevels = () => Object.values(data.levels).filter(level => level.available && level.units.length);
    let levelId = data.levels[params.get('level')]?.available ? params.get('level') : (usableLevels()[0]?.id || 'level1');
    let unitId = params.get('unit') || '';
    let mode = 'study', timerController = null, questions = [], questionIndex = 0, score = 0, answered = false, attempts = [], sessionId = '', startTime = 0, quizActiveTimer = null;

    const level = () => data.levels[levelId];
    const unit = () => level().units.find(item => item.id === unitId) || level().units[0];
    const context = () => `${SUBJECT}:${levelId}`;
    const aliases = () => [`국어 어휘력 ${level().title}`];
    const levelWords = () => level().units.flatMap(item => item.words.map(word => ({ ...word, levelId, unitId: item.id, unitTitle: item.title })));
    const unitWords = () => levelWords().filter(word => word.unitId === unit().id);

    function setUrl(nextMode = mode) {
        history.replaceState(null, '', `?level=${levelId}&unit=${unit().id}&mode=${reviewMode && nextMode === 'quiz' ? 'review' : nextMode}`);
    }

    function renderSelectors() {
        $('levelTabs').innerHTML = Object.values(data.levels).map(item => `<button type="button" class="level-btn ${item.id === levelId ? 'active' : ''}" data-level="${item.id}" ${item.available && item.units.length ? '' : 'disabled'}>${escapeHTML(item.title)}<small>${escapeHTML(item.available ? item.grade : '준비 중')}</small></button>`).join('');
        $('unitTabs').innerHTML = level().units.map(item => `<button type="button" class="unit-btn ${item.id === unit().id ? 'active' : ''}" data-unit="${item.id}">${escapeHTML(item.title)}</button>`).join('');
        $('heroLevel').textContent = `${level().title} · ${level().grade} · ${level().description}`;
    }

    // The word inside a passage line is highlighted so the learner sees it in context.
    function highlight(line, usage) {
        return escapeHTML(line).split(escapeHTML(usage)).join(`<mark>${escapeHTML(usage)}</mark>`);
    }
    function relationChips(list, className, label) {
        return list?.length ? list.map(item => `<span class="chip ${className}">${label} ${escapeHTML(item)}</span>`).join('') : `<span class="chip none">${label} 없음</span>`;
    }
    function passageHTML(word, withTitle = true) {
        const passage = word.passage || {};
        return `${withTitle && passage.title ? `<div class="passage-title">${escapeHTML(passage.title)}</div>` : ''}${(passage.lines || []).map(line => `<p>${highlight(line, word.usage)}</p>`).join('')}<div class="source-note">${passage.source && passage.source !== '자작' ? `출처: ${escapeHTML(passage.source)}` : '스마트 스터디 자체 제작'}</div>`;
    }

    function renderStudy() {
        mode = 'study';
        const current = unit();
        $('unitCategory').textContent = current.category || '';
        $('unitTitle').textContent = current.title;
        $('unitIntro').textContent = current.intro || '';
        $('wordList').innerHTML = unitWords().map(word => `
            <article class="word-card">
                <div class="word-head"><strong>${escapeHTML(word.word)}</strong><span class="word-meta">${escapeHTML([word.pos, word.origin, word.hanja].filter(Boolean).join(' · '))}</span></div>
                <p class="word-meaning">${escapeHTML(word.meaning)}</p>
                <div class="relations">${relationChips(word.synonyms, 'syn', '유의어')}${relationChips(word.antonyms, 'ant', '반의어')}</div>
                <p class="word-example">${highlight(word.example, word.usage)}</p>
                <details><summary>관련 지문 읽기</summary><div class="passage">${passageHTML(word)}</div></details>
            </article>`).join('');
        const index = level().units.findIndex(item => item.id === current.id);
        $('prevUnit').disabled = index <= 0;
        $('nextUnit').disabled = index >= level().units.length - 1;
        $('studyPanel').hidden = false; $('quizPanel').hidden = true;
        $('studyModeBtn').classList.add('active'); $('quizModeBtn').classList.remove('active');
        setUrl(); timerController?.startTimer();
    }

    function dueWrongWordIds() {
        if (typeof WrongNote === 'undefined') return [];
        return (WrongNote.getAll()[SUBJECT] || []).filter(item => !item.deleted && (reviewMode ? !item.isMastered : LearningPolicy.isDue(item))).map(item => item.wordId || item.wrongNoteId);
    }

    function startQuiz() {
        if (!reviewMode && typeof StudyTimer !== 'undefined' && !StudyTimer.isUnlocked(SUBJECT, context(), aliases())) {
            const status = StudyTimer.getStatus(SUBJECT, context(), aliases());
            alert(`국어 어휘력을 ${Math.ceil((status.requiredSeconds - status.accumulatedSeconds) / 60)}분 더 학습해야 합니다.`);
            renderStudy();
            return;
        }
        const due = dueWrongWordIds();
        // Review mode practises every unmastered wrong word of the level; a normal quiz covers the unit.
        const words = reviewMode ? levelWords().filter(word => due.includes(word.id)) : unitWords();
        questions = KoreanVocabQuiz.build({ words, pool: levelWords(), count: reviewMode ? Math.min(10, Math.max(5, words.length)) : 10, priority: due });
        if (!questions.length) { alert(reviewMode ? '복습할 어휘 오답이 없습니다.' : '이 단원의 퀴즈를 준비하지 못했습니다.'); renderStudy(); return; }
        questionIndex = 0; score = 0; attempts = []; sessionId = `${SUBJECT}-${Date.now()}`; startTime = Date.now(); mode = 'quiz';
        quizActiveTimer?.destroy();
        quizActiveTimer = typeof ActiveTimeTracker !== 'undefined' ? ActiveTimeTracker.create() : null;
        $('studyPanel').hidden = true; $('quizPanel').hidden = false;
        $('studyModeBtn').classList.remove('active'); $('quizModeBtn').classList.add('active');
        setUrl(); timerController?.stopTimer(); renderQuestion();
    }

    function renderQuestion() {
        const item = questions[questionIndex];
        answered = false;
        $('typeBadge').textContent = item.typeLabel;
        $('quizProgress').textContent = `${questionIndex + 1} / ${questions.length} · ${score}점`;
        $('quizPassage').hidden = !item.passage;
        const word = levelWords().find(entry => entry.id === item.wordId);
        $('quizPassage').innerHTML = item.passage ? passageHTML({ usage: word?.usage || '', passage: item.passage }) : '';
        $('quizQuestion').textContent = item.question;
        $('quizChoices').innerHTML = item.choices.map((choice, index) => `<button type="button" class="answer" data-index="${index}"><span>${index + 1}</span>${escapeHTML(choice)}</button>`).join('');
        $('quizFeedback').hidden = true; $('nextQuestion').hidden = true;
    }

    function answer(index) {
        if (answered) return;
        answered = true;
        const item = questions[questionIndex], selected = item.choices[index], correct = selected === item.answer;
        if (correct) score += 1;
        const word = levelWords().find(entry => entry.id === item.wordId) || {};
        const detail = {
            wrongNoteId: item.wordId, wordId: item.wordId, word: item.word, meaning: word.meaning, type: item.type, category: SUBJECT,
            levelId, level: level().title, unitId: item.unitId, unitTitle: item.unitTitle, questionId: item.id, question: item.question,
            choices: [...item.choices], selectedAnswer: selected, correctAnswer: item.answer, answer: item.answer,
            passageTitle: item.passage?.title || '', passageText: item.passage?.lines || [], explanation: item.explanation, correct
        };
        attempts.push(detail);
        if (typeof WrongNote !== 'undefined') WrongNote.save(SUBJECT, detail, correct ? 'correct' : 'wrong', sessionId, 1);
        [...$('quizChoices').children].forEach((button, buttonIndex) => {
            button.disabled = true;
            if (item.choices[buttonIndex] === item.answer) button.classList.add('correct');
            else if (buttonIndex === index) button.classList.add('wrong');
        });
        $('quizFeedback').hidden = false;
        $('quizFeedback').className = `feedback ${correct ? 'good' : 'bad'}`;
        $('quizFeedback').innerHTML = `<strong>${correct ? '정답입니다.' : '다시 확인해 보세요.'}</strong><p><b>정답:</b> ${escapeHTML(item.answer)}</p><p>${escapeHTML(item.explanation)}</p>`;
        $('nextQuestion').hidden = false;
        $('nextQuestion').textContent = questionIndex === questions.length - 1 ? '결과 보기' : '다음 문제';
        $('quizProgress').textContent = `${questionIndex + 1} / ${questions.length} · ${score}점`;
    }

    function finish() {
        const pct = Math.round(score / questions.length * 100);
        if (!reviewMode && typeof StudyTimer !== 'undefined') StudyTimer.recordResult(SUBJECT, context(), score, questions.length, sessionId);
        if (typeof saveQuizResult === 'function') saveQuizResult(sessionId, SUBJECT, `${level().title} · ${reviewMode ? '오답 복습' : unit().title}`, questions.length, score, score, quizActiveTimer?.getSeconds() || 0, true, {
            category: SUBJECT, review: reviewMode, levelId, unitId: reviewMode ? null : unit().id, unitTitle: reviewMode ? '오답 복습' : unit().title,
            questionTypes: attempts.map(item => item.type), attempts
        });
        $('resultScore').textContent = `${score} / ${questions.length} (${pct}%)`;
        $('resultMessage').textContent = pct >= 90 ? '낱말의 뜻과 쓰임을 정확히 알고 있어요!' : pct >= 70 ? '좋아요. 틀린 낱말을 오답노트에서 다시 확인해 보세요.' : '단어 카드와 관련 지문을 다시 읽고 도전해 보세요.';
        $('resultModal').hidden = false;
    }

    function selectLevel(id) {
        if (!data.levels[id]?.available || !data.levels[id].units.length) return;
        levelId = id; unitId = level().units[0].id; renderSelectors(); renderStudy();
    }
    function moveUnit(step) {
        const index = level().units.findIndex(item => item.id === unit().id) + step, next = level().units[index];
        if (!next) return; unitId = next.id; renderSelectors(); renderStudy(); window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function bind() {
        $('levelTabs').addEventListener('click', event => { const button = event.target.closest('[data-level]'); if (button && !button.disabled) selectLevel(button.dataset.level); });
        $('unitTabs').addEventListener('click', event => { const button = event.target.closest('[data-unit]'); if (!button) return; unitId = button.dataset.unit; renderSelectors(); renderStudy(); });
        $('prevUnit').addEventListener('click', () => moveUnit(-1)); $('nextUnit').addEventListener('click', () => moveUnit(1));
        $('startQuiz').addEventListener('click', startQuiz); $('quizModeBtn').addEventListener('click', startQuiz);
        $('studyModeBtn').addEventListener('click', renderStudy); $('backToStudy').addEventListener('click', renderStudy);
        $('quizChoices').addEventListener('click', event => { const button = event.target.closest('[data-index]'); if (button) answer(Number(button.dataset.index)); });
        $('nextQuestion').addEventListener('click', () => { if (questionIndex < questions.length - 1) { questionIndex++; renderQuestion(); $('quizQuestion').focus(); } else finish(); });
        $('retryQuiz').addEventListener('click', () => { $('resultModal').hidden = true; startQuiz(); });
        $('resultStudy').addEventListener('click', () => { $('resultModal').hidden = true; renderStudy(); });
        $('shareResult').addEventListener('click', () => window.KakaoShare?.sendReport(SUBJECT, score, questions.length, Math.round(score / questions.length * 100), score, 1, { sessionId, levelInfo: `${level().title} · ${unit().title}`, startTime, endTime: Date.now(), timeSpentSeconds: quizActiveTimer?.getSeconds() || 0 }));
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await window.SmartStudy?.LocalRepository?.ready;
        if (!level().units.some(item => item.id === unitId)) unitId = level().units[0]?.id || '';
        if (!unitId) { $('studyPanel').innerHTML = '<p class="locked">어휘 자료를 준비하고 있습니다.</p>'; return; }
        renderSelectors(); bind(); renderStudy();
        if (typeof StudyTimer !== 'undefined') {
            timerController = StudyTimer.initBar(SUBJECT, $('startQuiz'), {
                getContext: context, getAliases: aliases, getLabel: () => `국어 어휘력 ${level().title}`,
                isLearningActive: () => mode === 'study' && !$('studyPanel').hidden,
                isLockBypassed: () => reviewMode
            });
            timerController.startTimer();
        }
        if (params.get('mode') === 'quiz' || reviewMode) startQuiz();
    });
})();

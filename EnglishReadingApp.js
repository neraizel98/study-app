(function () {
    'use strict';
    const $ = id => document.getElementById(id);
    const params = new URLSearchParams(location.search);
    const SUBJECT = 'english_reading';
    const LEVEL_ID = 'grade6';
    const data = () => window.EnglishReadingData || { levels: [], units: [] };
    const level = () => data().levels.find(item => item.id === LEVEL_ID) || data().levels[0];
    let unitId = params.get('unit') || 'er1';
    let passageIndex = 0;
    let mode = 'study';
    let translationVisible = false;
    let timerController = null;
    let quizTimer = null;
    let quizTimerBase = 0;
    let session = null;

    const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
    const unit = () => data().units.find(item => item.id === unitId) || data().units[0];
    const passages = () => unit()?.passages || [];
    const passage = () => passages()[passageIndex] || passages()[0];
    const userId = () => window.UserSession?.getActiveUser?.() || window.SmartStudy?.LocalRepository?.getActiveUser?.() || '';
    const preferenceKey = suffix => `SmartStudy_EnglishReading_${encodeURIComponent(userId())}_${suffix}`;
    const getPreference = (key, fallback) => window.SmartStudy?.LocalRepository?.getPreference?.(preferenceKey(key), fallback) ?? fallback;
    const setPreference = (key, value) => window.SmartStudy?.LocalRepository?.setPreference?.(preferenceKey(key), value);
    const context = () => `english_reading:${LEVEL_ID}:${unitId}`;
    const aliases = () => ['영어 독해', level()?.title, `영어 독해 ${level()?.title}`].filter(Boolean);
    const allPassages = () => data().units.flatMap(item => item.passages || []);

    function validateContent() {
        const ids = new Set();
        return allPassages().every(item => {
            if (!item?.id || ids.has(item.id) || ![0, 1, 2].includes(Number(item.band))) return false;
            ids.add(item.id);
            return Array.isArray(item.sentences) && item.sentences.length > 0
                && item.translations?.length === item.sentences.length && item.questions?.length === 5
                && new Set(item.questions.map(question => question.id)).size === 5
                && item.questions.every(question => question.choices?.length === 4
                    && new Set(question.choices.map(choice => String(choice).normalize('NFC').trim())).size === 4
                    && Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex < 4
                    && question.explanation && question.evidence?.every(index => Number.isInteger(index) && index >= 0 && index < item.sentences.length));
        });
    }

    function exposedIds() { return getPreference('exposed', []); }
    function expose(id, reason) {
        const rows = getPreference('exposureLog', []);
        if (!rows.some(item => item.passageId === id)) rows.push({ passageId: id, reason, at: Date.now() });
        setPreference('exposureLog', rows);
        setPreference('exposed', [...new Set([...exposedIds(), id])]);
    }
    function currentBand() { return EnglishReadingPolicy.clampBand(getPreference('band', 0)); }
    function reports() { return window.SmartStudy?.LocalRepository?.listReports?.(userId()) || []; }
    function updateBandNotice() {
        const evidence = EnglishReadingPolicy.assessmentEvidence(reports(), currentBand());
        const lastDecision = getPreference('lastBandDecision', null);
        const reason = evidence ? (lastDecision && lastDecision.windowKey === evidence.windowKey ? lastDecision.reason : evidence.reason) : '난이도 근거를 확인하는 중입니다.';
        $('adaptiveNotice').textContent = `현재 난이도 ${['기초','표준','도전'][currentBand()]} · ${reason}`;
    }
    function getRecommendation() {
        const wrong = typeof WrongNote === 'undefined' ? {} : WrongNote.getAll();
        return EnglishReadingPolicy.recommendation(allPassages(), wrong, reports());
    }

    function setUrl(nextMode = mode) {
        const query = new URLSearchParams({ level: LEVEL_ID, unit: unitId, passage: passage()?.id || '', mode: nextMode });
        history.replaceState(null, '', `?${query}`);
    }
    function renderSelectors() {
        $('levelTabs').innerHTML = data().levels.map(item => `<button class="${item.id === LEVEL_ID ? 'active' : ''}" ${item.available ? '' : 'disabled'}>${escapeHTML(item.title)}${item.available ? '' : ' · 준비 중'}</button>`).join('');
        $('unitTabs').innerHTML = data().units.map(item => `<button data-unit="${escapeHTML(item.id)}" class="${item.id === unitId ? 'active' : ''}">${escapeHTML(item.title)}</button>`).join('');
    }
    function renderPassageLines(item, translations) {
        return item.sentences.map((sentence, index) => `<p><b>${index + 1}.</b> ${escapeHTML(sentence)}${translations ? `<span class="translation" ${translationVisible ? '' : 'hidden'}>${escapeHTML(item.translations[index])}</span>` : ''}</p>`).join('');
    }
    function renderStudy() {
        const item = passage(); if (!item) return;
        mode = 'study'; session = null; clearSavedSession(); quizTimer?.destroy?.(); quizTimer = null;
        $('studyPanel').hidden = false; $('quizPanel').hidden = true; $('resultModal').hidden = true;
        $('passageMeta').textContent = `${level().title} · ${unit().title} · ${['기초','표준','도전'][item.band]}`;
        $('passageTitle').textContent = item.title; $('studyPassage').innerHTML = renderPassageLines(item, true);
        $('vocabulary').innerHTML = item.vocabulary.map(entry => `<li><a href="english.html?word=${encodeURIComponent(entry.word)}"><b>${escapeHTML(entry.word)}</b></a> — ${escapeHTML(entry.meaning)}</li>`).join('');
        $('grammarNotes').innerHTML = item.grammarNotes.map(note => `<p><b>${escapeHTML(note.title)}</b><br>${escapeHTML(note.text)}</p>`).join('');
        const grammarUnits = window.EnglishGrammarData?.elementary?.units || [];
        const grammarRefs = item.grammarRefs?.length ? item.grammarRefs : item.grammarTags.map(unitId => ({ stageId: 'elementary', unitId, lessonIndex: 0 }));
        $('grammarLinks').innerHTML = grammarRefs.map(ref => { const target = (window.EnglishGrammarData?.[ref.stageId]?.units || grammarUnits).find(candidate => candidate.id === ref.unitId); return `<a href="english_grammar.html?stage=${encodeURIComponent(ref.stageId)}&unit=${encodeURIComponent(ref.unitId)}&lesson=${Number(ref.lessonIndex) || 0}">${escapeHTML(target?.title || ref.unitId)} 복습</a>`; }).join(' · ');
        $('toggleTranslation').textContent = translationVisible ? '한국어 뜻 숨기기' : '한국어 뜻 보기';
        $('prevPassage').disabled = passageIndex === 0; $('nextPassage').disabled = passageIndex >= passages().length - 1;
        expose(item.id, translationVisible ? 'study-with-translation' : 'study');
        const wrong = typeof WrongNote === 'undefined' ? {} : WrongNote.getAll();
        const recommendation = EnglishReadingPolicy.recommendation([item], wrong, reports());
        $('recommendationNotice').textContent = `추천 근거: ${recommendation.reason}${recommendation.unknownCount == null ? '' : ` · 확인 ${recommendation.vocabularyKnownCount}개 / 보완 ${recommendation.vocabularyWeakCount}개 / 기록 없음 ${recommendation.unknownCount}개`}`;
        setUrl(); timerController?.startTimer?.(); updateBandNotice();
    }

    function chooseAssessmentPassage() {
        const excluded = new Set(exposedIds());
        reports().filter(report => report.subject === SUBJECT).forEach(report => excluded.add(report.metadata?.passageId));
        const recommendation = getRecommendation();
        return EnglishReadingPolicy.selectPassage(allPassages(), { band: currentBand(), excludedIds: [...excluded], recommendedId: recommendation.passageId });
    }
    function quizUnlocked() {
        return params.get('mode') === 'review' || typeof StudyTimer === 'undefined' || StudyTimer.isUnlocked(SUBJECT, context(), aliases());
    }
    function questionSnapshot(item) {
        return item.questions.map(question => ({ ...question, choices: [...question.choices], evidence: [...question.evidence] }));
    }
    function startQuiz(kind = 'practice', selectedPassage = null) {
        if (!quizUnlocked()) {
            const status = StudyTimer.getStatus(SUBJECT, context(), aliases());
            alert(`영어 독해를 ${Math.ceil((status.requiredSeconds - status.accumulatedSeconds) / 60)}분 더 학습해야 합니다.`);
            return;
        }
        const item = selectedPassage || passage();
        if (!item) { alert('풀 수 있는 지문이 없습니다.'); return; }
        const isNovel = kind === 'assessment' && !exposedIds().includes(item.id);
        const recommendation = EnglishReadingPolicy.recommendation([item], typeof WrongNote === 'undefined' ? {} : WrongNote.getAll(), reports());
        session = {
            schema: 1, sessionId: `english-reading-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            levelId: LEVEL_ID, unitId: data().units.find(candidate => candidate.passages.some(p => p.id === item.id))?.id || unitId,
            passageId: item.id, band: Number(item.band), assessment: kind === 'assessment', review: params.get('mode') === 'review',
            isNovel, familiarAttempt: !isNovel, recommendationReason: recommendation.reason, status: 'active', activeSeconds: 0,
            questions: questionSnapshot(item), roundQuestionIds: item.questions.map(question => question.id), questionIndex: 0, round: 1,
            answers: [], initialAttempts: [], attempts: [], initialScore: null, finalScore: 0, hintUsed: false, startedAt: Date.now()
        };
        expose(item.id, kind === 'assessment' ? 'assessment' : 'practice');
        enterQuiz(); saveSession();
    }
    function enterQuiz() {
        mode = 'quiz'; $('studyPanel').hidden = true; $('quizPanel').hidden = false; $('resultModal').hidden = true;
        timerController?.stopTimer?.(); quizTimer?.destroy?.(); quizTimerBase = Number(session.activeSeconds || 0); quizTimer = typeof ActiveTimeTracker !== 'undefined' ? ActiveTimeTracker.create() : null;
        setUrl(session.review ? 'review' : 'quiz'); renderQuestion();
    }
    function quizPassage() { return allPassages().find(item => item.id === session?.passageId); }
    function currentQuestion() { return session.questions.find(item => item.id === session.roundQuestionIds[session.questionIndex]); }
    function currentAnswer() { const q = currentQuestion(); return session.answers.find(answer => answer.round === session.round && answer.questionId === q?.id); }
    function renderQuestion() {
        const item = quizPassage(), question = currentQuestion(); if (!item || !question) return;
        const answer = currentAnswer(); const correctCount = session.answers.filter(entry => entry.correct).length;
        $('quizPassageTitle').textContent = item.title; $('quizPassage').innerHTML = renderPassageLines(item, false);
        $('quizProgress').textContent = `${session.questionIndex + 1} / ${session.roundQuestionIds.length}${session.round > 1 ? ` · 재도전 ${session.round - 1}` : ''}`;
        $('quizScore').textContent = `${correctCount}개 정답`; $('quizQuestion').textContent = question.prompt;
        $('quizChoices').innerHTML = question.choices.map((choice, index) => `<button class="choice" data-choice="${index}"><b>${index + 1}</b> ${escapeHTML(choice)}</button>`).join('');
        $('quizFeedback').hidden = !answer; $('nextQuestion').hidden = !answer; $('showHint').disabled = Boolean(answer);
        if (answer) showAnswer(answer, false); else $('quizFeedback').innerHTML = '';
    }
    function evidenceText(question) {
        const item = quizPassage();
        return question.evidence.map(index => `${index + 1}번 문장: ${item.sentences[index]}`).join(' ');
    }
    function submitAnswer(index) {
        if (currentAnswer()) return;
        const question = currentQuestion(); const correct = index === question.answerIndex;
        const detail = {
            type: `${session.passageId}:${question.id}`, wrongNoteId: `${session.passageId}:${question.id}`, category: SUBJECT,
            levelId: LEVEL_ID, level: level().title, unitId: session.unitId, unitTitle: data().units.find(item => item.id === session.unitId)?.title,
            passageId: session.passageId, passageTitle: quizPassage().title, passageText: [...quizPassage().sentences], band: session.band,
            questionId: question.id, question: question.prompt, choices: [...question.choices], selectedAnswer: question.choices[index],
            correctAnswer: question.choices[question.answerIndex], answer: question.choices[question.answerIndex], explanation: question.explanation,
            evidence: [...question.evidence], correct, hintUsed: Boolean(session.currentHintUsed), assisted: Boolean(session.currentHintUsed), round: session.round
        };
        session.answers.push({ round: session.round, questionId: question.id, selectedIndex: index, correct, hintUsed: detail.hintUsed });
        session.attempts.push(detail); if (session.round === 1) session.initialAttempts.push({ ...detail });
        session.hintUsed = session.hintUsed || detail.hintUsed; session.currentHintUsed = false;
        if (typeof WrongNote !== 'undefined') WrongNote.save(SUBJECT, detail, correct ? 'correct' : 'wrong', session.sessionId, session.round);
        showAnswer(session.answers.at(-1), true); saveSession();
    }
    function showAnswer(answer, updateScore) {
        const question = currentQuestion();
        [...$('quizChoices').children].forEach((button, index) => { button.disabled = true; if (index === question.answerIndex) button.classList.add('correct'); else if (index === answer.selectedIndex) button.classList.add('wrong'); });
        $('quizFeedback').hidden = false; $('quizFeedback').innerHTML = `<strong>${answer.correct ? '정답입니다.' : '다시 확인해 보세요.'}</strong><p>${escapeHTML(question.explanation)}</p><p class="evidence"><b>본문 근거</b><br>${escapeHTML(evidenceText(question))}</p>`;
        $('nextQuestion').hidden = false; $('nextQuestion').textContent = session.questionIndex === session.roundQuestionIds.length - 1 ? '결과 보기' : '다음 문제';
        if (updateScore) $('quizScore').textContent = `${session.answers.filter(entry => entry.correct).length}개 정답`;
    }
    function showHint() {
        const question = currentQuestion(); session.currentHintUsed = true; session.hintUsed = true;
        $('quizFeedback').hidden = false; $('quizFeedback').innerHTML = `<p class="evidence"><b>근거 힌트</b><br>${escapeHTML(evidenceText(question))}</p><p>힌트를 쓴 결과는 난이도 상승 근거에서 제외됩니다.</p>`; saveSession();
    }
    function nextQuestion() {
        if (!currentAnswer()) return;
        if (session.questionIndex < session.roundQuestionIds.length - 1) { session.questionIndex++; saveSession(); renderQuestion(); }
        else finishRound();
    }
    function finishRound() {
        if (session.status === 'results' && session.finishedRound === session.round) { showResults(); return; }
        const firstCorrect = session.initialAttempts.filter(item => item.correct).length;
        if (session.initialScore == null) session.initialScore = firstCorrect;
        const correctIds = new Set(session.answers.filter(item => item.correct).map(item => item.questionId));
        session.finalScore = session.questions.filter(item => correctIds.has(item.id)).length;
        session.status = 'results'; session.finishedRound = session.round; saveReport(); saveSession();
        showResults();
        quizTimer?.destroy?.(); quizTimer = null; updateDifficultyAfterSession();
    }
    function showResults() {
        const total = session.questions.length;
        $('resultScore').textContent = `현재 ${session.finalScore} / ${total}점`;
        $('initialScoreNote').textContent = `최초 제출 점수 ${session.initialScore} / ${total}점 · 재도전 점수와 별도로 보존됩니다.`;
        $('resultMessage').textContent = session.isNovel ? '미학습 지문 최초 평가로 기록했습니다.' : '연습·재도전 결과는 난이도 상승 근거에서 제외됩니다.';
        $('retryWrong').hidden = session.finalScore >= total; $('resultModal').hidden = false;
    }
    function saveReport() {
        const seconds = quizTimerBase + (quizTimer?.getSeconds?.() || 0); session.activeSeconds = seconds;
        const total = session.questions.length;
        if (session.round === 1 && !session.review && typeof StudyTimer !== 'undefined') StudyTimer.recordResult(SUBJECT, context(), session.initialScore, total, session.sessionId);
        if (typeof saveQuizResult === 'function') saveQuizResult(session.sessionId, SUBJECT, `${level().title} · ${quizPassage().title}`, total, session.finalScore, session.initialScore, seconds, true, {
            category: SUBJECT, levelId: LEVEL_ID, level: level().title, unitId: session.unitId, passageId: session.passageId, passageTitle: quizPassage().title,
            band: session.band, readingAssessment: session.assessment, review: session.review, isNovel: session.isNovel, familiarAttempt: session.familiarAttempt,
            hintUsed: session.hintUsed, attempts: session.attempts, initialAttempts: session.initialAttempts,
            vocabulary: quizPassage().vocabulary.map(item => item.word), grammarTags: [...quizPassage().grammarTags], recommendationReason: session.recommendationReason,
            submittedAt: Date.now()
        });
    }
    function updateDifficultyAfterSession() {
        if (!session.assessment || !session.isNovel || session.hintUsed || session.round > 1) return;
        const result = EnglishReadingPolicy.assessmentEvidence(reports(), currentBand());
        const lastDecision = getPreference('lastBandDecision', null);
        if (result.samples >= 3 && result.windowKey && result.windowKey !== lastDecision?.windowKey) {
            setPreference('band', result.band); setPreference('lastBandDecision', { ...result, at: Date.now() });
        }
        updateBandNotice();
    }
    function retryWrong() {
        const correctIds = new Set(session.answers.filter(item => item.correct).map(item => item.questionId));
        const wrongIds = session.questions.map(item => item.id).filter(id => !correctIds.has(id));
        if (!wrongIds.length) return;
        session.round++; session.roundQuestionIds = wrongIds; session.questionIndex = 0; session.currentHintUsed = false;
        session.status = 'active';
        $('resultModal').hidden = true; enterQuiz(); saveSession();
    }
    function saveSession() { if (session) setPreference('activeSession', session); }
    function clearSavedSession() { setPreference('activeSession', null); }
    function restoreSession() {
        const saved = getPreference('activeSession', null);
        if (!saved?.sessionId || !allPassages().some(item => item.id === saved.passageId)) return false;
        session = saved; unitId = saved.unitId;
        if (saved.status === 'results') { mode = 'quiz'; $('studyPanel').hidden = true; $('quizPanel').hidden = false; renderQuestion(); showResults(); return true; }
        enterQuiz(); return true;
    }
    function dueReviewItems() {
        if (typeof WrongNote === 'undefined') return [];
        return (WrongNote.getAll()[SUBJECT] || []).filter(item => (!item.isMastered || LearningPolicy.isDue(item)) && LearningPolicy.isDue(item));
    }
    function startReview() {
        const due = dueReviewItems();
        if (!due.length) { alert('복습할 영어 독해 오답이 없습니다.'); location.href = 'wrong_note.html'; return; }
        const first = due[0]; if (!selectPassageById(first.passageId)) { alert('현재 콘텐츠에서 복습 문항을 찾지 못했습니다.'); return; }
        startQuiz('practice', passage());
        session.review = true; session.assessment = false; session.isNovel = false; session.familiarAttempt = true;
        const ids = new Set(due.filter(item => item.passageId === first.passageId).map(item => item.questionId));
        session.questions = session.questions.filter(item => ids.has(item.id));
        session.roundQuestionIds = session.questions.map(item => item.id);
        session.questionIndex = 0; saveSession(); renderQuestion();
    }
    function selectPassageById(id) {
        for (const candidateUnit of data().units) { const index = candidateUnit.passages.findIndex(item => item.id === id); if (index >= 0) { unitId = candidateUnit.id; passageIndex = index; return true; } }
        return false;
    }
    function bind() {
        $('unitTabs').addEventListener('click', event => { const button = event.target.closest('[data-unit]'); if (!button) return; unitId = button.dataset.unit; passageIndex = 0; renderSelectors(); renderStudy(); });
        $('toggleTranslation').addEventListener('click', () => { translationVisible = !translationVisible; if (translationVisible) expose(passage().id, 'translation'); renderStudy(); });
        $('prevPassage').addEventListener('click', () => { if (passageIndex > 0) { passageIndex--; renderStudy(); } });
        $('nextPassage').addEventListener('click', () => { if (passageIndex < passages().length - 1) { passageIndex++; renderStudy(); } });
        $('practiceQuiz').addEventListener('click', () => startQuiz('practice'));
        $('freshAssessment').addEventListener('click', () => { const item = chooseAssessmentPassage(); if (!item) return alert('현재 난이도에서 아직 읽지 않은 평가 지문이 없습니다. 다른 단원을 학습해 보세요.'); selectPassageById(item.id); renderSelectors(); startQuiz('assessment', item); });
        $('quizChoices').addEventListener('click', event => { const button = event.target.closest('[data-choice]'); if (button) submitAnswer(Number(button.dataset.choice)); });
        $('showHint').addEventListener('click', showHint); $('nextQuestion').addEventListener('click', nextQuestion); $('retryWrong').addEventListener('click', retryWrong);
        $('backToStudy').addEventListener('click', renderStudy); $('closeResult').addEventListener('click', renderStudy);
    }
    async function init() {
        await window.SmartStudy?.LocalRepository?.ready;
        if (!userId()) { location.href = 'index.html'; return; }
        if (!validateContent()) { document.querySelector('main').innerHTML = '<section class="card"><h1>영어 독해 콘텐츠를 확인할 수 없습니다.</h1><p>검증된 5문항 지문 데이터가 필요합니다.</p></section>'; return; }
        const requestedPassage = params.get('passage'); if (requestedPassage) selectPassageById(requestedPassage);
        else if (!params.has('unit')) { const candidate = getRecommendation().passageId; if (candidate) selectPassageById(candidate); }
        renderSelectors(); bind(); updateBandNotice();
        if (typeof StudyTimer !== 'undefined') timerController = StudyTimer.initBar(SUBJECT, $('practiceQuiz'), { getContext: context, getAliases: aliases, getLabel: () => `영어 독해 · ${level().title}`, isLearningActive: () => mode === 'study' && !$('studyPanel').hidden, isLockBypassed: () => params.get('mode') === 'review' });
        if (!restoreSession()) { renderStudy(); if (params.get('mode') === 'review') startReview(); }
        const checkpoint = () => { if (session && quizTimer) { session.activeSeconds = quizTimerBase + quizTimer.getSeconds(); quizTimer.destroy(); quizTimer = null; quizTimerBase = session.activeSeconds; saveSession(); } };
        window.addEventListener('pagehide', checkpoint);
        window.addEventListener('pageshow', () => { if (mode === 'quiz' && session?.status === 'active' && !quizTimer) { quizTimerBase = Number(session.activeSeconds || 0); quizTimer = typeof ActiveTimeTracker !== 'undefined' ? ActiveTimeTracker.create() : null; } });
        window.addEventListener('beforeunload', () => { checkpoint(); timerController?.stopTimer?.(); });
    }
    window.EnglishReadingApp = { init, validateContent, startQuiz, restoreSession, getSession: () => session, chooseAssessmentPassage,
        submitAnswer, nextQuestion, retryWrong };
    document.addEventListener('DOMContentLoaded', init);
})();

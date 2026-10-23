(function () {
    'use strict';
    const $ = id => document.getElementById(id);
    const params = new URLSearchParams(location.search);
    const SUBJECT = 'english_reading';
    const data = () => window.EnglishReadingData || { levels: [], units: [] };
    const gradeOf = item => item?.gradeId || 'grade6';
    let levelId = data().levels.some(item => item.id === params.get('level') && item.available) ? params.get('level') : 'grade6';
    const level = () => data().levels.find(item => item.id === levelId) || data().levels[0];
    const groupOf = id => id.startsWith('middle') ? 'group2' : id.startsWith('high') ? 'group3' : 'group1';
    const units = () => data().units.filter(item => gradeOf(item) === levelId);
    let unitId = params.get('unit') || 'er1';
    let passageIndex = 0;
    let mode = 'study';
    // 지문 해석은 한꺼번에 열지 않고, 막힌 문장만 지문당 2문장까지 힌트로 본다. 본 문장은 계속 보인다.
    const PEEK_LIMIT = 2;
    let timerController = null;
    let quizTimer = null;
    let quizTimerBase = 0;
    let session = null;

    const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
    const unit = () => units().find(item => item.id === unitId) || units()[0];
    const passages = () => unit()?.passages || [];
    const passage = () => passages()[passageIndex] || passages()[0];
    const userId = () => window.UserSession?.getActiveUser?.() || window.SmartStudy?.LocalRepository?.getActiveUser?.() || '';
    // Keep the existing elementary keys; secondary grades have independent placement and saved sessions.
    const preferenceKey = suffix => `SmartStudy_EnglishReading_${encodeURIComponent(userId())}_${levelId === 'grade6' ? '' : `${levelId}_`}${suffix}`;
    const getPreference = (key, fallback) => window.SmartStudy?.LocalRepository?.getPreference?.(preferenceKey(key), fallback) ?? fallback;
    const setPreference = (key, value) => window.SmartStudy?.LocalRepository?.setPreference?.(preferenceKey(key), value);
    const context = () => `english_reading:${levelId}`;
    const aliases = () => [level()?.title, `영어 독해 ${level()?.title}`].filter(Boolean);
    const allPassages = () => units().flatMap(item => item.passages || []);

    function validateContent() {
        const ids = new Set();
        const content = data().units.flatMap(item => item.passages || []);
        return units().length > 0 && content.length > 0 && content.every(item => {
            if (!item?.id || ids.has(item.id) || ![0, 1, 2].includes(Number(item.band))) return false;
            ids.add(item.id);
            return Array.isArray(item.sentences) && item.sentences.length > 0
                && item.translations?.length === item.sentences.length && Array.isArray(item.questions) && item.questions.length >= 5
                && new Set(item.questions.map(question => question.id)).size === item.questions.length
                && item.questions.every(question => question.choices?.length === 4
                    && new Set(question.choices.map(choice => String(choice).normalize('NFC').trim())).size === 4
                    && Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex < 4
                    && question.explanation && question.evidence?.every(index => Number.isInteger(index) && index >= 0 && index < item.sentences.length));
        });
    }

    function exposedIds() { return getPreference('exposed', []); }
    function peekedLines(id) { return getPreference('translationPeeks', {})[id] || []; }
    function peekLine(id, index) {
        const all = getPreference('translationPeeks', {}), lines = all[id] || [];
        if (lines.includes(index) || lines.length >= PEEK_LIMIT) return false;
        all[id] = [...lines, index]; setPreference('translationPeeks', all); return true;
    }
    function expose(id, reason) {
        const rows = getPreference('exposureLog', []);
        if (!rows.some(item => item.passageId === id)) rows.push({ passageId: id, reason, at: Date.now() });
        setPreference('exposureLog', rows);
        setPreference('exposed', [...new Set([...exposedIds(), id])]);
    }
    function currentBand() { return EnglishReadingPolicy.clampBand(getPreference('band', 0)); }
    function reports() {
        const ids = new Set(allPassages().map(item => item.id));
        return (window.SmartStudy?.LocalRepository?.listReports?.(userId()) || []).filter(report => report.subject !== SUBJECT ||
            (report.metadata?.levelId ? report.metadata.levelId === levelId : ids.has(report.metadata?.passageId)));
    }
    function updateBandNotice() {
        const evidence = EnglishReadingPolicy.assessmentEvidence(reports(), currentBand(), levelId);
        const lastDecision = getPreference('lastBandDecision', null);
        const reason = evidence ? (lastDecision && lastDecision.windowKey === evidence.windowKey ? lastDecision.reason : evidence.reason) : '난이도 근거를 확인하는 중입니다.';
        $('adaptiveNotice').textContent = `현재 난이도 ${['기초','표준','도전'][currentBand()]} · ${reason}`;
    }
    function getRecommendation() {
        const wrong = typeof WrongNote === 'undefined' ? {} : WrongNote.getAll();
        return EnglishReadingPolicy.recommendation(allPassages(), wrong, reports());
    }

    function setUrl(nextMode = mode) {
        const query = new URLSearchParams({ level: levelId, unit: unitId, passage: passage()?.id || '', mode: nextMode });
        history.replaceState(null, '', `?${query}`);
    }
    function renderSelectors() {
        $('levelTabs').innerHTML = [['group1','레벨 1 · 초6'],['group2','레벨 2 · 중1~3'],['group3','레벨 3 · 고1~3']].map(([id,title]) => `<button data-group="${id}" aria-pressed="${groupOf(levelId) === id}" class="${groupOf(levelId) === id ? 'active' : ''}">${title}</button>`).join('');
        if ($('gradeTabs')) {
            $('gradeTabs').hidden = levelId === 'grade6';
            $('gradeTabs').innerHTML = data().levels.filter(item => groupOf(item.id) === groupOf(levelId)).map(item => `<button data-grade="${item.id}" aria-pressed="${item.id === levelId}" class="${item.id === levelId ? 'active' : ''}">${escapeHTML(item.title)}</button>`).join('');
        }
        $('unitTabs').innerHTML = units().map(item => `<button data-unit="${escapeHTML(item.id)}" class="${item.id === unitId ? 'active' : ''}">${escapeHTML(item.title)}</button>`).join('');
        if ($('passageSelect')) $('passageSelect').innerHTML = passages().map((item,index) => `<option value="${item.id}" ${index === passageIndex ? 'selected' : ''}>${index + 1}. ${escapeHTML(item.title)} · ${['기초','표준','도전'][item.band]}</option>`).join('');
    }
    function switchGrade(id) {
        if (!data().levels.some(item => item.id === id && item.available)) return;
        checkpointQuiz(); timerController?.stopTimer?.();
        levelId = id; unitId = units()[0]?.id; passageIndex = 0; session = null;
        quizTimer?.destroy?.(); quizTimer = null;
        renderSelectors();
        if (!restoreSession(false)) renderStudy();
        updateBandNotice();
    }
    function checkpointQuiz() {
        if (session && quizTimer) { session.activeSeconds = quizTimerBase + quizTimer.getSeconds(); quizTimer.destroy(); quizTimer = null; quizTimerBase = session.activeSeconds; saveSession(); }
    }
    function renderPassageLines(item, translations) {
        const peeked = translations ? peekedLines(item.id) : [], canPeek = peeked.length < PEEK_LIMIT;
        return item.sentences.map((sentence, index) => `<p class="passage-line"><span class="line-no">${index + 1}</span><span class="line-text">${escapeHTML(sentence)}${peeked.includes(index) ? `<span class="translation">${escapeHTML(item.translations[index])}</span>` : ''}</span>${translations && !peeked.includes(index) ? `<button type="button" class="peek-btn" data-peek="${index}" ${canPeek ? '' : 'disabled'} aria-label="${index + 1}번 문장 해석 힌트 보기">힌트</button>` : ''}</p>`).join('');
    }
    function renderStudy() {
        const item = passage(); if (!item) return;
        stopSpeech();
        mode = 'study'; session = null; clearSavedSession(); quizTimer?.destroy?.(); quizTimer = null;
        renderSelectors();
        $('studyPanel').hidden = false; $('quizPanel').hidden = true; $('resultModal').hidden = true;
        $('passageMeta').textContent = `${level().title} · ${unit().title} · ${['기초','표준','도전'][item.band]}`;
        $('passageTitle').textContent = item.title; $('studyPassage').innerHTML = renderPassageLines(item, true);
        $('vocabulary').innerHTML = item.vocabulary.map((entry, index) => `<li><div class="word-controls"><b class="reading-word">${escapeHTML(entry.word)}</b>${Object.values(window.vocabData || {}).some(words => words.some(word => word.word.toLowerCase() === entry.word.toLowerCase())) ? `<a class="word-book-link" href="english.html?word=${encodeURIComponent(entry.word)}" aria-label="${escapeHTML(entry.word)} 단어장에서 보기">단어장 ›</a>` : ''}<button type="button" class="meaning-btn" data-meaning="${index}" aria-expanded="false" aria-controls="word-meaning-${index}">뜻 확인</button><button type="button" class="audio-icon" data-pronounce="${index}" aria-pressed="false" title="발음 듣기 · 다시 누르면 정지" aria-label="${escapeHTML(entry.word)} 발음 듣기">${soundIcon}</button></div><p id="word-meaning-${index}" class="word-meaning" hidden>${escapeHTML(entry.meaning)}</p></li>`).join('');
        $('grammarNotes').innerHTML = item.grammarNotes.map(note => `<p><b>${escapeHTML(note.title)}</b><br>${escapeHTML(note.text)}</p>`).join('');
        const grammarUnits = window.EnglishGrammarData?.elementary?.units || [];
        const grammarRefs = item.grammarRefs?.length ? item.grammarRefs : item.grammarTags.map(unitId => ({ stageId: 'elementary', unitId, lessonIndex: 0 }));
        $('grammarLinks').innerHTML = grammarRefs.map(ref => { const target = (window.EnglishGrammarData?.[ref.stageId]?.units || grammarUnits).find(candidate => candidate.id === ref.unitId); return `<a href="english_grammar.html?stage=${encodeURIComponent(ref.stageId)}&unit=${encodeURIComponent(ref.unitId)}&lesson=${Number(ref.lessonIndex) || 0}">${escapeHTML(target?.title || ref.unitId)} 복습</a>`; }).join('');
        const peekLeft = PEEK_LIMIT - peekedLines(item.id).length;
        $('peekStatus').textContent = peekLeft > 0 ? `💡 해석 힌트 ${peekLeft}/${PEEK_LIMIT}` : '💡 해석 힌트 모두 사용';
        $('prevPassage').disabled = passageIndex === 0; $('nextPassage').disabled = passageIndex >= passages().length - 1;
        expose(item.id, peekedLines(item.id).length ? 'study-with-translation' : 'study');
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
        const allQuestions = questionSnapshot(item);
        const freshQuestions = window.QuizExposure ? QuizExposure.fresh(SUBJECT, allQuestions) : allQuestions;
        const practiceReview = params.get('mode') === 'review' || freshQuestions.length < 5;
        if (kind === 'assessment' && practiceReview) { alert('새 문제 5개가 있는 지문으로 평가해야 해요. 다른 지문을 선택해 주세요.'); return; }
        const questionPool = (practiceReview ? allQuestions : freshQuestions).slice(0,10);
        if (!questionPool.length) { alert('이 지문에서 최근에 풀지 않은 문제가 부족해요. 다른 지문을 선택하거나 오답 복습을 진행해 주세요.'); return; }
        const isNovel = kind === 'assessment' && !exposedIds().includes(item.id);
        const practiceAssessment = !practiceReview && !peekedLines(item.id).length && !reports().some(r=>r.subject===SUBJECT&&r.metadata?.passageId===item.id&&r.metadata?.status!=='draft');
        const recommendation = EnglishReadingPolicy.recommendation([item], typeof WrongNote === 'undefined' ? {} : WrongNote.getAll(), reports());
        session = {
            schema: 1, sessionId: `english-reading-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            levelId, unitId: units().find(candidate => candidate.passages.some(p => p.id === item.id))?.id || unitId,
            passageId: item.id, band: Number(item.band), assessment: kind === 'assessment', practiceAssessment, review: practiceReview,
            isNovel, familiarAttempt: !isNovel, recommendationReason: recommendation.reason, status: 'active', activeSeconds: 0,
            questions: questionPool, roundQuestionIds: questionPool.map(question => question.id), questionIndex: 0, round: 1,
            answers: [], initialAttempts: [], attempts: [], initialScore: null, finalScore: 0, hintUsed: false, startedAt: Date.now()
        };
        expose(item.id, kind === 'assessment' ? 'assessment' : 'practice');
        enterQuiz(); saveSession();
    }
    function enterQuiz() {
        stopSpeech();
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
        $('toggleQuizTranslation').hidden = !(session.round > 1 || session.review);
        $('toggleQuizTranslation').textContent = '번역 보기';
        $('toggleQuizTranslation').setAttribute('aria-expanded', 'false');
        $('quizTranslation').hidden = true;
        $('quizTranslation').innerHTML = '';
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
            levelId: session.levelId, level: level().title, unitId: session.unitId, unitTitle: data().units.find(item => item.id === session.unitId)?.title,
            passageId: session.passageId, passageTitle: quizPassage().title, passageText: [...quizPassage().sentences], band: session.band,
            questionId: question.id, question: question.prompt, choices: [...question.choices], selectedAnswer: question.choices[index],
            correctAnswer: question.choices[question.answerIndex], answer: question.choices[question.answerIndex], explanation: question.explanation,
            evidence: [...question.evidence], correct, translationUsed: Boolean(session.translationReadRound === session.round), hintUsed: Boolean(session.currentHintUsed), assisted: Boolean(session.currentHintUsed || session.translationReadRound === session.round), round: session.round
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
        $('resultMessage').textContent = session.isNovel ? '미학습 지문 최초 평가로 기록했습니다.' : session.practiceAssessment ? '이 지문의 첫 5문항 이상 풀이로 기록했습니다. 서로 다른 지문의 첫 풀이로 다음 난이도를 판단해요.' : '복습·재도전 결과입니다. 난이도 상승 근거와 구분해요.';
        $('retryWrong').hidden = session.finalScore >= total; $('resultModal').hidden = false;
    }
    function saveReport() {
        const seconds = quizTimerBase + (quizTimer?.getSeconds?.() || 0); session.activeSeconds = seconds;
        const total = session.questions.length;
        if (session.round === 1 && !session.review && typeof StudyTimer !== 'undefined') StudyTimer.recordResult(SUBJECT, context(), session.initialScore, total, session.sessionId);
        if (typeof saveQuizResult === 'function') saveQuizResult(session.sessionId, SUBJECT, `${level().title} · ${quizPassage().title}`, total, session.finalScore, session.initialScore, seconds, true, {
            category: SUBJECT, levelId: session.levelId, level: level().title, unitId: session.unitId, passageId: session.passageId, passageTitle: quizPassage().title,
            band: session.band, readingAssessment: session.assessment, practiceAssessment: session.practiceAssessment, review: session.review, isNovel: session.isNovel, familiarAttempt: session.familiarAttempt,
            hintUsed: session.hintUsed, attempts: session.attempts, initialAttempts: session.initialAttempts,
            vocabulary: quizPassage().vocabulary.map(item => item.word), grammarTags: [...quizPassage().grammarTags], recommendationReason: session.recommendationReason,
            submittedAt: Date.now()
        });
    }
    function updateDifficultyAfterSession() {
        if ((!session.assessment || !session.isNovel) && !session.practiceAssessment) return;
        if (session.review || session.hintUsed || session.round > 1) return;
        const result = EnglishReadingPolicy.assessmentEvidence(reports(), currentBand(), levelId);
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
    function restoreSession(respectQuery = true) {
        const saved = getPreference('activeSession', null);
        if (!saved?.sessionId || (saved.levelId || 'grade6') !== levelId || !allPassages().some(item => item.id === saved.passageId)) return false;
        if (respectQuery && params.get('mode') === 'study') return false;
        if (saved.status === 'results' && (!respectQuery || params.get('mode') !== 'quiz')) return false;
        // Explicit task/review links must not be replaced by an unrelated unfinished quiz.
        if (respectQuery && ((params.get('passage') && params.get('passage') !== saved.passageId) || (params.get('unit') && params.get('unit') !== saved.unitId) || (params.get('mode') === 'review' && !saved.review))) return false;
        session = saved; selectPassageById(saved.passageId); renderSelectors();
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
        const first = due.find(item => item.passageId === params.get('passage')) || due.find(item => allPassages().some(p => p.id === item.passageId)) || due[0]; if (!selectPassageById(first.passageId)) { alert('현재 콘텐츠에서 복습 문항을 찾지 못했습니다.'); return; }
        renderSelectors();
        startQuiz('practice', passage());
        session.review = true; session.assessment = false; session.isNovel = false; session.familiarAttempt = true;
        const ids = new Set(due.filter(item => item.passageId === first.passageId).map(item => item.questionId));
        session.questions = session.questions.filter(item => ids.has(item.id));
        session.roundQuestionIds = session.questions.map(item => item.id);
        session.questionIndex = 0; saveSession(); renderQuestion();
    }
    function selectPassageById(id) {
        for (const candidateUnit of data().units) { const index = candidateUnit.passages.findIndex(item => item.id === id); if (index >= 0) { levelId = gradeOf(candidateUnit); unitId = candidateUnit.id; passageIndex = index; return true; } }
        return false;
    }
    let speechButton = null;
    const soundIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></svg>';
    function stopSpeech() {
        window.speechSynthesis?.cancel();
        if (speechButton) { speechButton.classList.remove('playing'); speechButton.setAttribute('aria-pressed','false'); }
        speechButton = null;
    }
    function playSpeech(text, button) {
        const wasPlaying = speechButton === button;
        stopSpeech(); if (wasPlaying) return;
        if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { alert('이 브라우저에서는 음성 재생을 지원하지 않습니다.'); return; }
        const utterance = new window.SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; utterance.rate = 0.95;
        // Shared ranking prefers neural/premium voices; phones keep the system default unless one is installed.
        const voice = window.EnglishSpeech?.bestVoice ? window.EnglishSpeech.bestVoice('us') : null;
        if (voice) utterance.voice = voice;
        speechButton = button; button.classList.add('playing'); button.setAttribute('aria-pressed','true');
        const finish = () => { if (speechButton === button) { button.classList.remove('playing'); button.setAttribute('aria-pressed','false'); speechButton = null; } };
        utterance.onend = finish;
        utterance.onerror = event => { finish(); if (!['interrupted','canceled'].includes(event.error)) alert('음성을 재생하지 못했습니다. 기기의 음성 설정을 확인해 주세요.'); };
        window.speechSynthesis.speak(utterance);
    }
    function bind() {
        $('toggleQuizTranslation').addEventListener('click', () => {
            if (!session || !(session.round > 1 || session.review)) return;
            const panel = $('quizTranslation');
            panel.hidden = !panel.hidden;
            $('toggleQuizTranslation').textContent = panel.hidden ? '번역 보기' : '번역 숨기기';
            $('toggleQuizTranslation').setAttribute('aria-expanded', String(!panel.hidden));
            if (panel.hidden) return;
            const item = quizPassage(), question = currentQuestion();
            const canonical = item.questions.find(entry => entry.id === question.id);
            panel.innerHTML = `<strong>지문 번역</strong>${item.translations.map((line, index) => `<p>${index + 1}. ${escapeHTML(line)}</p>`).join('')}<strong>질문 번역</strong><p>${escapeHTML(canonical?.promptKo || question.promptKo || '질문 번역을 준비 중입니다.')}</p>`;
            session.translationReadRound = session.round;
            session.translationQuestions = [...new Set([...(session.translationQuestions || []), `${session.round}:${question.id}`])];
            session.currentHintUsed = true; session.hintUsed = true;
            saveSession();
        });
        $('listenPassage').innerHTML = soundIcon;
        $('listenPassage').addEventListener('click', () => playSpeech(passage().sentences.join(' '), $('listenPassage')));
        window.addEventListener('pagehide', stopSpeech);
        $('vocabulary').addEventListener('click', event => {
            const meaningButton = event.target.closest('[data-meaning]');
            if (meaningButton) {
                const meaning = $(`word-meaning-${meaningButton.dataset.meaning}`);
                meaning.hidden = !meaning.hidden;
                meaningButton.setAttribute('aria-expanded', String(!meaning.hidden));
                meaningButton.textContent = meaning.hidden ? '뜻 확인' : '뜻 숨기기';
                return;
            }
            const soundButton = event.target.closest('[data-pronounce]');
            if (!soundButton) return;
            const entry = passage().vocabulary[Number(soundButton.dataset.pronounce)];
            if (entry) playSpeech(entry.word, soundButton);
        });
        $('levelTabs').addEventListener('click', event => { const button = event.target.closest('[data-group]'); if (button) switchGrade(({group1:'grade6',group2:'middle1',group3:'high1'})[button.dataset.group]); });
        $('gradeTabs')?.addEventListener('click', event => { const button = event.target.closest('[data-grade]'); if (button) switchGrade(button.dataset.grade); });
        $('passageSelect')?.addEventListener('change', event => { if (selectPassageById(event.target.value)) renderStudy(); });
        $('unitTabs').addEventListener('click', event => { const button = event.target.closest('[data-unit]'); if (!button || !units().some(item => item.id === button.dataset.unit)) return; unitId = button.dataset.unit; passageIndex = 0; renderSelectors(); renderStudy(); });
        $('studyPassage').addEventListener('click', event => {
            const button = event.target.closest('[data-peek]');
            if (!button || button.disabled) return;
            if (peekLine(passage().id, Number(button.dataset.peek))) { expose(passage().id, 'translation'); renderStudy(); }
        });
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
        if (!validateContent()) { document.querySelector('main').innerHTML = '<section class="card"><h1>영어 독해 콘텐츠를 확인할 수 없습니다.</h1><p>지문과 문제 데이터를 다시 확인해 주세요. 홈으로 돌아가 다시 열 수 있습니다.</p></section>'; return; }
        const requestedUnit = data().units.find(item => item.id === params.get('unit'));
        if (requestedUnit) { levelId = gradeOf(requestedUnit); unitId = requestedUnit.id; }
        else unitId = unit().id;
        const requestedPassage = params.get('passage'); if (requestedPassage) selectPassageById(requestedPassage);
        else if (!params.has('unit')) { const candidate = getRecommendation().passageId; if (candidate) selectPassageById(candidate); }
        renderSelectors(); bind(); updateBandNotice();
        if (typeof StudyTimer !== 'undefined') timerController = StudyTimer.initBar(SUBJECT, $('practiceQuiz'), { getContext: context, getAliases: aliases, getLabel: () => `영어 독해 · ${level().title}`, isLearningActive: () => mode === 'study' && !$('studyPanel').hidden, isLockBypassed: () => params.get('mode') === 'review' });
        if (!restoreSession()) { renderStudy(); if (params.get('mode') === 'review') startReview(); }
        const checkpoint = checkpointQuiz;
        window.addEventListener('pagehide', checkpoint);
        window.addEventListener('pageshow', () => { if (mode === 'quiz' && session?.status === 'active' && !quizTimer) { quizTimerBase = Number(session.activeSeconds || 0); quizTimer = typeof ActiveTimeTracker !== 'undefined' ? ActiveTimeTracker.create() : null; } });
        window.addEventListener('beforeunload', () => { checkpoint(); timerController?.stopTimer?.(); });
    }
    window.EnglishReadingApp = { init, validateContent, startQuiz, restoreSession, getSession: () => session, chooseAssessmentPassage,
        submitAnswer, nextQuestion, retryWrong, switchGrade, selectPassageById, getLevelId: () => levelId };
    document.addEventListener('DOMContentLoaded', init);
})();

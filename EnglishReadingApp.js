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
    const learnerLabel = () => window.SmartStudy?.SubjectProgression?.label?.(SUBJECT, levelId) || ({ group1: '레벨 1 · 초등', group2: '레벨 2 · 중학', group3: '레벨 3 · 고교' })[groupOf(levelId)];
    const resolveGroup = group => window.SmartStudy?.SubjectProgression?.resolve?.(SUBJECT, group, userId()) || ({ group1: 'grade6', group2: 'middle1', group3: 'high1' })[group];
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
    let quizIntegrity = null;

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
    function diagnosticSkillFocus() {
        const user = userId();
        const task = window.SmartStudy?.LearningPlan?.getPlan?.(user)?.tasks?.find(item => item.subject === SUBJECT && item.diagnostic?.kind === 'reading-skill');
        const sameContext = task?.context?.levelId === levelId && task?.context?.unitId === unitId;
        const skill = sameContext ? task.diagnostic.skill : params.get('skill');
        return ['fact','main','vocabulary','reference','evidence','inference'].includes(skill) ? skill : null;
    }
    function selectDiagnosticPassage() {
        const skill = diagnosticSkillFocus();
        if (!skill) return false;
        const prior = new Set(exposedIds());
        reports().filter(report => report.subject === SUBJECT).forEach(report => prior.add(report.metadata?.passageId));
        const candidates = passages().filter(item => item.questions.some(question => (question.skill || question.type) === skill));
        const unseen = candidates.filter(item => !prior.has(item.id));
        const pool = unseen.length ? unseen : candidates;
        const selected = pool.find(item => Number(item.band) === currentBand()) || pool[0];
        return selected ? selectPassageById(selected.id) : false;
    }

    function validateContent() {
        const ids = new Set();
        const content = data().units.flatMap(item => item.passages || []);
        return units().length > 0 && content.length > 0 && content.every(item => {
            if (!item?.id || ids.has(item.id) || ![0, 1, 2].includes(Number(item.band))) return false;
            ids.add(item.id);
            return Array.isArray(item.sentences) && item.sentences.length > 0
                && item.translations?.length === item.sentences.length && Array.isArray(item.questions) && item.questions.length >= 5
                && new Set(item.questions.map(question => question.id)).size === item.questions.length
                && item.questions.every(question => (question.type === 'arrange'
                    ? Array.isArray(question.tokens) && question.tokens.length >= 3 && question.answer && !question.choices
                    : question.choices?.length === 4 && new Set(question.choices.map(choice => String(choice).normalize('NFC').trim())).size === 4
                        && Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex < 4)
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
        $('levelTabs').innerHTML = [['group1','레벨 1 · 초등'],['group2','레벨 2 · 중학'],['group3','레벨 3 · 고교']].map(([id,title]) => `<button data-group="${id}" aria-pressed="${groupOf(levelId) === id}" class="${groupOf(levelId) === id ? 'active' : ''}">${title}</button>`).join('');
        if ($('gradeTabs')) {
            $('gradeTabs').hidden = true;
            $('gradeTabs').innerHTML = '';
        }
        $('unitTabs').innerHTML = units().map(item => `<button data-unit="${escapeHTML(item.id)}" class="${item.id === unitId ? 'active' : ''}">${escapeHTML(item.title)}</button>`).join('');
        if ($('passageSelect')) $('passageSelect').innerHTML = passages().map((item,index) => `<option value="${item.id}" ${index === passageIndex ? 'selected' : ''}>${index + 1}. ${escapeHTML(item.title)} · ${['기초','표준','도전'][item.band]}</option>`).join('');
    }
    function switchGrade(id) {
        if (!data().levels.some(item => item.id === id && item.available)) return;
        checkpointQuiz(); timerController?.stopTimer?.();
        levelId = id; unitId = units()[0]?.id; passageIndex = 0; session = null;
        quizTimer?.destroy?.(); quizTimer = null; quizIntegrity?.stop(); quizIntegrity = null;
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
        quizIntegrity?.stop(); quizIntegrity = null;
        renderSelectors();
        $('studyPanel').hidden = false; $('quizPanel').hidden = true; $('resultModal').hidden = true;
        $('passageMeta').textContent = `${learnerLabel()} · ${unit().title} · ${['기초','표준','도전'][item.band]}`;
        $('passageTitle').textContent = item.title; $('studyPassage').innerHTML = renderPassageLines(item, true);
        const guideHost = $('sentenceGuide');
        if (!window.ReadingSentenceGuide && guideHost) guideHost.textContent = '문장별 독해 해설지를 불러오지 못했어요. 새로고침해 주세요.';
        window.ReadingSentenceGuide?.mount(guideHost, item, { onOpen: () => {
            if (mode !== 'study') return;
            expose(item.id, 'sentence-guide');
            const views = getPreference('sentenceGuideViews', {});
            if (!views[item.id]) { views[item.id] = Date.now(); setPreference('sentenceGuideViews', views); }
        } });
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
        return item.questions.map(question => ({ ...question,
            ...(Array.isArray(question.choices) ? { choices: [...question.choices] } : {}),
            ...(Array.isArray(question.tokens) ? { tokens: [...question.tokens] } : {}), evidence: [...question.evidence] }));
    }
    const writingBank = () => window.EnglishReadingWriting;
    const writingQuestions = item => writingBank()?.questions(item.id) || [];
    const isWriting = question => Boolean(question?.acceptedAnswers);
    const hasInput = question => question?.type === 'arrange' || isWriting(question);
    function startQuiz(kind = 'practice', selectedPassage = null, reviewIds = null) {
        if (mode === 'quiz') return;
        if (!quizUnlocked()) {
            const status = StudyTimer.getStatus(SUBJECT, context(), aliases());
            alert(`영어 독해를 ${Math.ceil((status.requiredSeconds - status.accumulatedSeconds) / 60)}분 더 학습해야 합니다.`);
            return;
        }
        const item = selectedPassage || passage();
        if (!item) { alert('풀 수 있는 지문이 없습니다.'); return; }
        const allQuestions = questionSnapshot(item);
        const focusSkill = diagnosticSkillFocus();
        const writing = writingQuestions(item);
        const writingCandidates = writing.map(question => ({ ...question, passageId: item.id, passageText: [...item.sentences] }));
        const writingSelection = kind === 'practice' && !reviewIds && writing.length && window.QuizExposure?.select(userId(), SUBJECT, writingCandidates, writing.length);
        const writingPack = kind === 'practice' && !reviewIds && writing.length > 0
            && (!window.QuizExposure || (writingSelection?.items.length === writing.length && !writingSelection.reviewRequired));
        const reviewCandidates = reviewIds && [...allQuestions, ...writing].filter(question => reviewIds.has(question.id));
        const shuffle = items => {
            const result = [...items];
            for (let index = result.length - 1; index > 0; index--) {
                const selected = Math.floor(Math.random() * (index + 1));
                [result[index], result[selected]] = [result[selected], result[index]];
            }
            return result;
        };
        const arrange = allQuestions.find(question => question.type === 'arrange');
        const remaining = allQuestions.filter(question => question !== arrange);
        const focused = remaining.filter(question => focusSkill && (question.skill || question.type) === focusSkill)
            .map(question => ({ ...question, diagnosticFocus: true }));
        const others = remaining.filter(question => !focusSkill || (question.skill || question.type) !== focusSkill);
        const ordinary = [...(arrange ? [arrange] : []), ...shuffle(focused), ...shuffle(others)];
        const orderedCandidates = (reviewCandidates || ordinary.filter(question => !writingPack || question.type !== 'arrange'))
            .map(question => ({ ...question, passageId: item.id, passageText: [...item.sentences] }));
        const questionLimit = writingPack ? 7 : reviewIds ? orderedCandidates.length : 10;
        const writingPool = writingPack ? writingCandidates.map(question =>
            writingSelection ? writingSelection.items.find(item => item.id === question.id) : question) : [];
        const exposureSelection = window.QuizExposure?.select
            ? QuizExposure.select(userId(), SUBJECT, orderedCandidates, questionLimit, { review: Boolean(reviewIds) || params.get('mode') === 'review' })
            : null;
        const fallbackFresh = window.QuizExposure?.fresh ? QuizExposure.fresh(SUBJECT, orderedCandidates) : orderedCandidates;
        const fallbackReview = params.get('mode') === 'review' || fallbackFresh.length < 5;
        const fallbackCandidates = fallbackReview ? [...fallbackFresh, ...orderedCandidates.filter(question => !fallbackFresh.some(fresh => fresh.id === question.id))] : fallbackFresh;
        const selectedQuestions = [...(exposureSelection?.items || fallbackCandidates.slice(0, questionLimit))];
        // New lookup drills must not crowd out the comprehension skills that establish reading mastery.
        const required = [
            question => question.type === 'arrange',
            question => (question.skill || question.type) === 'main',
            question => (question.skill || question.type) === 'inference',
            question => (question.skill || question.type) === 'evidence',
            ...(focusSkill ? [question => (question.skill || question.type) === focusSkill] : [])
        ].filter((predicate, index, list) => orderedCandidates.some(predicate) && list.findIndex(other => orderedCandidates.find(other)?.id === orderedCandidates.find(predicate)?.id) === index);
        const inspections = window.QuizExposure?.inspect ? QuizExposure.inspect(userId(), SUBJECT, orderedCandidates) : [];
        const inspected = new Map(inspections.map(row => [row.item.id, row]));
        for (const predicate of required) {
            if (selectedQuestions.some(predicate)) continue;
            const candidate = orderedCandidates.find(question => predicate(question) && !selectedQuestions.some(item => item.id === question.id));
            if (!candidate) continue;
            const removable = selectedQuestions.findIndex(question => !required.some(rule => rule(question) && selectedQuestions.filter(rule).length === 1));
            const row = inspected.get(candidate.id);
            const replacement = row ? { ...candidate, exposure: { fingerprint: row.fingerprint, priorCount: row.count, kind: row.kind, reviewRequired: row.count >= 2 } } : candidate;
            if (removable >= 0) selectedQuestions.splice(removable, 1, replacement); else selectedQuestions.push(replacement);
        }
        const coverageReview = selectedQuestions.some(question => question.exposure?.reviewRequired);
        const practiceReview = Boolean(reviewIds) || (exposureSelection ? exposureSelection.reviewRequired || coverageReview : fallbackReview);
        if (kind === 'assessment' && practiceReview) { alert('새 문제 5개가 있는 지문으로 평가해야 해요. 다른 지문을 선택해 주세요.'); return; }
        const questionPool = [...writingPool, ...shuffle(selectedQuestions.slice(0, questionLimit))].map(question =>
            question.type === 'phrase-arrange' ? { ...question, tokens: shuffle(question.tokens) } : question);
        if (writingPack) {
            const phrase = questionPool[0];
            if (writingBank().grade(phrase, phrase.tokens.join(' '))) phrase.tokens.push(phrase.tokens.shift());
        }
        if (!questionPool.length) { alert('이 지문에서 최근에 풀지 않은 문제가 부족해요. 다른 지문을 선택하거나 오답 복습을 진행해 주세요.'); return; }
        const isNovel = kind === 'assessment' && !exposedIds().includes(item.id);
        const practiceAssessment = !writingPack && !practiceReview && !peekedLines(item.id).length && !reports().some(r=>r.subject===SUBJECT&&r.metadata?.passageId===item.id&&r.metadata?.status!=='draft');
        const recommendation = EnglishReadingPolicy.recommendation([item], typeof WrongNote === 'undefined' ? {} : WrongNote.getAll(), reports());
        session = {
            schema: 1, sessionId: `english-reading-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            writingPack, levelId, unitId: units().find(candidate => candidate.passages.some(p => p.id === item.id))?.id || unitId,
            passageId: item.id, band: Number(item.band), assessment: kind === 'assessment', practiceAssessment, review: practiceReview,
            isNovel, familiarAttempt: !isNovel, recommendationReason: recommendation.reason, diagnosticSkill: focusSkill,
            exposurePolicy: exposureSelection ? { policyVersion: exposureSelection.policyVersion, reason: exposureSelection.reason, freshCount: exposureSelection.freshCount, repeatCount: exposureSelection.repeatCount, reviewCount: exposureSelection.reviewCount } : null,
            status: 'active', activeSeconds: 0,
            questions: questionPool, roundQuestionIds: questionPool.map(question => question.id), questionIndex: 0, round: 1,
            answers: [], arrangeDrafts: {}, initialAttempts: [], attempts: [], initialScore: null, finalScore: 0, hintUsed: false, startedAt: Date.now()
        };
        expose(item.id, kind === 'assessment' ? 'assessment' : 'practice');
        enterQuiz(); saveSession();
    }
    function enterQuiz() {
        stopSpeech();
        mode = 'quiz'; $('studyPanel').hidden = true; $('quizPanel').hidden = false; $('resultModal').hidden = true;
        timerController?.stopTimer?.(); quizTimer?.destroy?.(); quizTimerBase = Number(session.activeSeconds || 0); quizTimer = typeof ActiveTimeTracker !== 'undefined' ? ActiveTimeTracker.create() : null;
        // Screen leaves/translation while solving; the record rides on the session so retry rounds and restored quizzes keep counting.
        quizIntegrity = window.QuizIntegrity?.start({ subject: SUBJECT, kind: 'translator', continueFrom: session.integrity || null }) || null;
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
        const arranged = hasInput(question);
        if ($('writingTaskType')) {
            $('writingTaskType').textContent = writingBank()?.labels[question.type] || '';
            $('writingTaskType').hidden = !isWriting(question);
        }
        $('quizChoices').hidden = arranged; $('arrangeArea').hidden = !arranged;
        $('quizChoices').innerHTML = arranged ? '' : question.choices.map((choice, index) => `<button class="choice" data-choice="${index}"><b>${index + 1}</b> ${escapeHTML(choice)}</button>`).join('');
        if (arranged) renderArrange(question, answer);
        $('quizFeedback').hidden = !answer; $('nextQuestion').hidden = !answer; $('showHint').disabled = Boolean(answer);
        if (answer) showAnswer(answer, false);
        else if (session.currentHintUsed) showHint();
        else $('quizFeedback').innerHTML = '';
    }
    const normalizeSentence = value => String(value ?? '').normalize('NFKC').trim().toLocaleLowerCase().replace(/\s+([,.;:!?])/g, '$1').replace(/\s+/g, ' ');
    const draftKey = question => `${session.round}:${question.id}`;
    function arrangeDraft(question) {
        session.arrangeDrafts ||= {};
        return session.arrangeDrafts[draftKey(question)] ||= { value: '', used: [] };
    }
    function renderArrange(question, answer = null) {
        const draft = arrangeDraft(question);
        $('arrangeBank').hidden = !question.tokens?.length;
        $('arrangeInput').readOnly = question.type === 'phrase-arrange';
        $('arrangeUndo').hidden = !question.tokens?.length;
        $('arrangeUndo').textContent = question.type === 'phrase-arrange' ? '구절 하나 취소' : '한 단어 취소';
        $('arrangeBank').innerHTML = (question.tokens || []).map((token, index) => `<button type="button" class="arrange-token" data-token-index="${index}" ${draft.used.includes(index) || answer ? 'disabled' : ''}>${escapeHTML(token)}</button>`).join('');
        $('arrangeInput').value = answer?.selectedAnswer ?? draft.value;
        $('arrangeInput').disabled = Boolean(answer); $('arrangeUndo').disabled = Boolean(answer); $('arrangeReset').disabled = Boolean(answer); $('arrangeSubmit').disabled = Boolean(answer);
    }
    function evidenceText(question) {
        const item = quizPassage();
        return question.evidence.map(index => `${index + 1}번 문장: ${item.sentences[index]}`).join(' ');
    }
    function submitAnswer(index) {
        if (currentAnswer()) return;
        const question = currentQuestion();
        if (!question?.choices || !Number.isInteger(index) || index < 0 || index >= question.choices.length) return;
        completeQuestion(question.choices[index], index === question.answerIndex, index);
    }
    function submitArrange() {
        const question = currentQuestion();
        if (currentAnswer() || !hasInput(question)) return;
        const selected = (question.type === 'phrase-arrange' ? arrangeDraft(question).value : $('arrangeInput').value).trim();
        if (!selected || (question.type === 'phrase-arrange' && arrangeDraft(question).used.length !== question.tokens.length)) return;
        const correct = isWriting(question) ? writingBank().grade(question, selected) : normalizeSentence(selected) === normalizeSentence(question.answer);
        completeQuestion(selected, correct, null);
    }
    function completeQuestion(selectedAnswer, correct, selectedIndex) {
        const question = currentQuestion();
        const correctAnswer = hasInput(question) ? question.answer : question.choices[question.answerIndex];
        const reviewPending = correct === null;
        const detail = {
            type: `${session.passageId}:${question.id}`, wrongNoteId: `${session.passageId}:${question.id}`, category: SUBJECT,
            levelId: session.levelId, level: level().title, unitId: session.unitId, unitTitle: data().units.find(item => item.id === session.unitId)?.title,
            passageId: session.passageId, passageTitle: quizPassage().title, passageText: [...quizPassage().sentences], band: session.band,
            questionId: question.id, questionType: question.type, skill: question.skill || question.type || null, question: question.prompt, choices: question.choices ? [...question.choices] : [], tokens: question.tokens ? [...question.tokens] : [], selectedAnswer,
            conceptId: `reading-skill:${question.skill || question.type}`,
            learningTarget: { kind: 'reading-skill', conceptId: `reading-skill:${question.skill || question.type}`, skill: question.skill || question.type, context: { levelId: session.levelId, unitId: session.unitId } },
            correctAnswer, answer: correctAnswer, explanation: question.explanation,
            evidence: [...question.evidence], correct, ...(isWriting(question) ? {
                answerLabel: writingBank().labels[question.type], gradingStatus: reviewPending ? 'review_pending' : correct ? 'correct' : 'wrong',
                ...(question.type === 'phrase-arrange' ? { selectedTokens: [...arrangeDraft(question).used] } : {})
            } : {}), translationUsed: false, hintUsed: Boolean(session.currentHintUsed), assisted: Boolean(session.currentHintUsed), round: session.round
        };
        if (question.exposure) detail.exposure = { ...question.exposure };
        session.answers.push({ round: session.round, questionId: question.id, selectedIndex, selectedAnswer, correct, hintUsed: detail.hintUsed });
        session.attempts.push(detail); if (session.round === 1) session.initialAttempts.push({ ...detail });
        session.hintUsed = session.hintUsed || detail.hintUsed; session.currentHintUsed = false;
        if (!reviewPending && typeof WrongNote !== 'undefined') WrongNote.save(SUBJECT, detail, correct ? 'correct' : 'wrong', session.sessionId, session.round);
        showAnswer(session.answers.at(-1), true); saveSession();
    }
    function showAnswer(answer, updateScore) {
        const question = currentQuestion();
        if (hasInput(question)) renderArrange(question, answer);
        else [...$('quizChoices').children].forEach((button, index) => { button.disabled = true; if (index === question.answerIndex) button.classList.add('correct'); else if (index === answer.selectedIndex) button.classList.add('wrong'); });
        const feedback = answer.correct === null ? '확인 필요 · 예시 답과 비교해 보세요.' : answer.correct ? '정답입니다.' : '다시 확인해 보세요.';
        const example = isWriting(question) ? `<p><b>예시 답</b> ${escapeHTML(question.answer)}</p>` : '';
        $('quizFeedback').hidden = false; $('quizFeedback').innerHTML = `<strong>${feedback}</strong>${example}<p class="evidence"><b>본문 근거</b><br>${escapeHTML(evidenceText(question))}</p>`;
        $('nextQuestion').hidden = false; $('nextQuestion').textContent = session.questionIndex === session.roundQuestionIds.length - 1 ? '결과 보기' : '다음 문제';
        $('showHint').disabled = true;
        if (updateScore) $('quizScore').textContent = `${session.answers.filter(entry => entry.correct).length}개 정답`;
    }
    function showHint() {
        const question = currentQuestion(); if (currentAnswer()) return;
        session.currentHintUsed = true; session.hintUsed = true;
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
        if (quizIntegrity) session.integrity = quizIntegrity.stop();
        quizIntegrity = null;
        session.status = 'results'; session.finishedRound = session.round; saveReport(); saveSession();
        showResults();
        quizTimer?.destroy?.(); quizTimer = null; updateDifficultyAfterSession();
    }
    const scoredTotal = () => session.questions.length - session.initialAttempts.filter(item => item.correct === null).length;
    function wrongQuestionIds() {
        const correctIds = new Set(session.answers.filter(item => item.correct).map(item => item.questionId));
        return session.initialAttempts.filter(item => item.correct === false && !correctIds.has(item.questionId)).map(item => item.questionId);
    }
    function showResults() {
        const total = scoredTotal();
        const pending = session.questions.length - total;
        $('resultScore').textContent = pending ? `현재 정답 ${session.finalScore}개` : `현재 ${session.finalScore} / ${total}점`;
        const pendingNote = $('pendingWritingNote');
        if (pendingNote) {
            pendingNote.hidden = !pending;
            pendingNote.textContent = `확인 필요 ${pending}개 · 전체 ${session.questions.length}문항`;
        }
        $('initialScoreNote').textContent = `최초 ${pending ? '채점된 문항' : '제출 점수'} ${session.initialScore} / ${total}점 · 재도전 점수와 별도로 보존됩니다.`;
        $('resultMessage').textContent = session.isNovel ? '미학습 지문 최초 평가로 기록했습니다.' : session.practiceAssessment ? '이 지문의 첫 5문항 이상 풀이로 기록했습니다. 서로 다른 지문의 첫 풀이로 다음 난이도를 판단해요.' : '복습·재도전 결과입니다. 난이도 상승 근거와 구분해요.';
        if (session.writingPack) {
            const summary = session.initialAttempts.filter(item => item.answerLabel).map(item =>
                `${item.answerLabel} ${item.correct === null ? '확인 필요' : item.correct ? '정답' : '다시 확인'}`);
            $('resultMessage').textContent = `첫 답안 · ${summary.join(' / ')}${scoredTotal() < session.questions.length ? ' · 확인 필요 답안은 점수에서 제외했어요.' : ''}`;
        }
        $('retryWrong').hidden = !wrongQuestionIds().length; $('resultModal').hidden = false;
    }
    function saveReport() {
        const seconds = quizTimerBase + (quizTimer?.getSeconds?.() || 0); session.activeSeconds = seconds;
        const total = scoredTotal();
        const verifiedWriting = !session.writingPack || (total === session.questions.length && !session.hintUsed);
        if (session.round === 1 && verifiedWriting && !session.review && typeof StudyTimer !== 'undefined') StudyTimer.recordResult(SUBJECT, context(), session.initialScore, total, session.sessionId);
        if (typeof saveQuizResult === 'function') saveQuizResult(session.sessionId, SUBJECT, `${learnerLabel()} · ${quizPassage().title}`, total, session.finalScore, session.initialScore, seconds, true, {
            category: SUBJECT, levelId: session.levelId, level: level().title, unitId: session.unitId, passageId: session.passageId, passageTitle: quizPassage().title,
            writingPack: Boolean(session.writingPack), pendingWritingCount: session.questions.length - total, band: session.band, readingAssessment: session.assessment, practiceAssessment: session.practiceAssessment, review: session.review, isNovel: session.isNovel, familiarAttempt: session.familiarAttempt,
            hintUsed: session.hintUsed, attempts: session.attempts, initialAttempts: session.initialAttempts, ...(session.integrity ? { integrity: session.integrity } : {}),
            vocabulary: quizPassage().vocabulary.map(item => item.word), grammarTags: [...quizPassage().grammarTags], recommendationReason: session.recommendationReason, diagnosticSkill: session.diagnosticSkill, exposurePolicy: session.exposurePolicy,
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
        const wrongIds = wrongQuestionIds();
        if (!wrongIds.length) return;
        session.round++; session.roundQuestionIds = wrongIds; session.questionIndex = 0; session.currentHintUsed = false;
        session.status = 'active';
        $('resultModal').hidden = true; enterQuiz(); saveSession();
    }
    function saveSession() { if (!session) return; if (quizIntegrity) session.integrity = quizIntegrity.summary(); setPreference('activeSession', session); }
    function clearSavedSession() { setPreference('activeSession', null); }
    function restoreSession(respectQuery = true) {
        const saved = getPreference('activeSession', null);
        if (!saved?.sessionId || (saved.levelId || 'grade6') !== levelId || !allPassages().some(item => item.id === saved.passageId)) return false;
        if (respectQuery && params.get('mode') === 'study') return false;
        if (saved.status === 'results' && (!respectQuery || !['quiz', 'review'].includes(params.get('mode')))) return false;
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
        const ids = new Set(due.filter(item => item.passageId === first.passageId).map(item => item.questionId));
        startQuiz('practice', passage(), ids);
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
        $('levelTabs').addEventListener('click', event => { const button = event.target.closest('[data-group]'); if (button) switchGrade(resolveGroup(button.dataset.group)); });
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
        $('arrangeBank').addEventListener('click', event => { const button = event.target.closest('[data-token-index]'); if (!button || currentAnswer()) return; const question = currentQuestion(), draft = arrangeDraft(question), index = Number(button.dataset.tokenIndex); if (draft.used.includes(index)) return; draft.used.push(index); draft.value = [...draft.used.map(item => question.tokens[item])].join(' '); saveSession(); renderArrange(question); });
        $('arrangeInput').addEventListener('input', () => { if (currentAnswer() || currentQuestion()?.type === 'phrase-arrange') return; const draft = arrangeDraft(currentQuestion()); draft.value = $('arrangeInput').value; draft.used = []; saveSession(); renderArrange(currentQuestion()); $('arrangeInput').focus(); $('arrangeInput').setSelectionRange(draft.value.length, draft.value.length); });
        $('arrangeUndo').addEventListener('click', () => { const question = currentQuestion(), draft = arrangeDraft(question); if (draft.used.length) { draft.used.pop(); draft.value = draft.used.map(index => question.tokens[index]).join(' '); } else draft.value = draft.value.trim().split(/\s+/).slice(0, -1).join(' '); saveSession(); renderArrange(question); });
        $('arrangeReset').addEventListener('click', () => { const draft = arrangeDraft(currentQuestion()); draft.value = ''; draft.used = []; saveSession(); renderArrange(currentQuestion()); });
        $('arrangeSubmit').addEventListener('click', submitArrange); $('arrangeInput').addEventListener('keydown', event => { if (event.key === 'Enter' && !event.isComposing) submitArrange(); });
        $('showHint').addEventListener('click', showHint); $('nextQuestion').addEventListener('click', nextQuestion); $('retryWrong').addEventListener('click', retryWrong);
        $('backToStudy').addEventListener('click', renderStudy); $('closeResult').addEventListener('click', renderStudy);
    }
    async function init() {
        await window.SmartStudy?.LocalRepository?.ready;
        if (!userId()) { location.href = 'index.html'; return; }
        if (!params.has('level') && !params.has('unit') && !params.has('passage')) {
            const profile = window.SmartStudy?.LearningPlan?.getProfile?.(userId()) || {};
            const grade = Number(profile.grade || 6);
            levelId = resolveGroup(grade >= 10 ? 'group3' : grade >= 7 ? 'group2' : 'group1');
        }
        if (!validateContent()) { document.querySelector('main').innerHTML = '<section class="card"><h1>영어 독해 콘텐츠를 확인할 수 없습니다.</h1><p>지문과 문제 데이터를 다시 확인해 주세요. 홈으로 돌아가 다시 열 수 있습니다.</p></section>'; return; }
        const requestedUnit = data().units.find(item => item.id === params.get('unit'));
        if (requestedUnit) { levelId = gradeOf(requestedUnit); unitId = requestedUnit.id; }
        else unitId = unit().id;
        const requestedPassage = params.get('passage'); if (requestedPassage) selectPassageById(requestedPassage);
        else if (!selectDiagnosticPassage() && !params.has('unit')) { const candidate = getRecommendation().passageId; if (candidate) selectPassageById(candidate); }
        renderSelectors(); bind(); updateBandNotice();
        if (typeof StudyTimer !== 'undefined') timerController = StudyTimer.initBar(SUBJECT, $('practiceQuiz'), { getContext: context, getAliases: aliases, getLabel: () => `영어 독해 · ${learnerLabel()}`, isLearningActive: () => mode === 'study' && !$('studyPanel').hidden, isLockBypassed: () => params.get('mode') === 'review' });
        if (!restoreSession()) { renderStudy(); if (params.get('mode') === 'review') startReview(); }
        const checkpoint = checkpointQuiz;
        window.addEventListener('pagehide', checkpoint);
        window.addEventListener('pageshow', () => { if (mode === 'quiz' && session?.status === 'active' && !quizTimer) { quizTimerBase = Number(session.activeSeconds || 0); quizTimer = typeof ActiveTimeTracker !== 'undefined' ? ActiveTimeTracker.create() : null; } });
        window.addEventListener('beforeunload', () => { checkpoint(); timerController?.stopTimer?.(); });
    }
    window.EnglishReadingApp = { init, validateContent, startQuiz, restoreSession, getSession: () => session, chooseAssessmentPassage,
        submitAnswer, submitArrange, nextQuestion, retryWrong, switchGrade, selectPassageById, getLevelId: () => levelId };
    document.addEventListener('DOMContentLoaded', init);
})();

const POS_LABEL = {
    'n.': { label: 'n. 명사', cls: 'pos-n' },
    'v.t.': { label: 'v.t. 타동사', cls: 'pos-vt' },
    'v.i.': { label: 'v.i. 자동사', cls: 'pos-vi' },
    'adj.': { label: 'adj. 형용사', cls: 'pos-adj' },
    'adv.': { label: 'adv. 부사', cls: 'pos-adv' },
};
const TENSE_NAMES = ['현재형', '과거형', '미래형'];

function isVerb(d) {
    return d && (d.pos === 'v.t.' || d.pos === 'v.i.');
}

// tenseExs: [현재 예문, 과거 예문, 미래 예문]
// Vocabulary data moved to VocabEng.js

// ============================================================
// APP STATE
// ============================================================
let currentLevel = 'level1', currentIndex = 0, currentMode = 'study';
const QUIZ_COUNT = 20;
let quizWords = [], quizIndex = 0, quizScore = 0, quizPhase = 1;
let currentTenseIdx = 0;
let questionResults = [];
let retryWrongList = [];
let quizWrongWordCounts = {}; // 오답 유지
let quizSessionData = { id: null, total: 0, initialScore: null, currentScore: 0, startTime: 0 }; // 세션 관리
let showKoEx = false;
let shuffledStudyIndices = []; // 학습 모드용 랜덤 순서

// ============================================================
// DOM
// ============================================================
// DOM 엘리먼트 참조 (AppEngine.initDOM에서 지연 초기화됨)
let wordIndexEl, englishWordEl, pronunciationEl, posBadgeEl, koreanMeaningEl;
let verbFormsSec, vPresentEl, vPastEl, vPPEl, englishDefEl, exSentEl, exKoEl, toggleKoBtn;
let phrasalSec, phrasalList, togglePhrasalBtn;
let speakWordBtn, speakDefBtn, speakExBtn;
let prevBtn, nextBtn, levelBtns;
let studyModeBtn, quizModeBtn, studyView, studyControls, quizView;
let quizQNumEl, phaseBadgeEl, quizScoreEl, quizProgressBar, quizQuestionLabel;
let phase1Area, phase2Area, quizWordEl, quizSpeakBtn, tenseBadgeEl, phase2ContextEl, phaseFeedback;
let quizChoices, quizChoicesParent;
let resultModal, resultEmoji, resultTitle, resultScore, resultMessage, scoreCard;
let retryWrongBtn, retryBtn, studyAgainBtn, kakaoReportBtn;
let phaseVerbFormsArea, vQuizBaseEl, vQuizPastEl, vQuizPPEl;
let phaseSubjectiveArea, subjectiveContextEl, subjectiveInputEl;
let phaseUnscrambleArea, unscrambleTargetEl, unscrambleChipsEl, resetUnscrambleBtn;
let quizSubmitArea, quizSubmitBtn;

// ============================================================
// STUDY MODE
// ============================================================
function updateCard() {
    try {
        const dataList = (window.vocabData || {})[currentLevel];
        if (!dataList) {
            reportCriticalError(`데이터 로드 오류: '${currentLevel}' 레벨 데이터를 찾을 수 없습니다.`);
            return;
        }
    // 랜덤 순서 인덱스가 없으면 생성 (학습 모드용)
    if (shuffledStudyIndices.length !== dataList.length) refreshStudyOrder();
    
    const realIdx = shuffledStudyIndices[currentIndex];
    const d = dataList[realIdx];
    
    wordIndexEl.textContent = `${currentIndex + 1} / ${dataList.length}`;
    englishWordEl.textContent = d.word;
    pronunciationEl.textContent = d.pron || '';
    koreanMeaningEl.textContent = d.meaning;
    englishDefEl.textContent = d.def || '';
    exSentEl.textContent = d.ex || '';
    exKoEl.textContent = d.exKo || '';

    const showMeaningBtn = $('showMeaningBtn');
    const metaContent = $('metaContent');
    if (showMeaningBtn && metaContent) {
        showMeaningBtn.style.display = 'block';
        metaContent.style.display = 'none';
    }

    // 한글 표시 상태 유지
    if (showKoEx) {
        exKoEl.classList.remove('hidden-text');
        toggleKoBtn.textContent = '👁️ 한글 숨기기';
    } else {
        exKoEl.classList.add('hidden-text');
        toggleKoBtn.textContent = '🙈 한글 보기';
    }

    const pi = POS_LABEL[d.pos] || { label: d.pos, cls: 'pos-n' };
    posBadgeEl.textContent = pi.label; posBadgeEl.className = `pos-badge ${pi.cls}`;
    const isV = isVerb(d);
    verbFormsSec.style.display = isV ? '' : 'none';
    if (isV && d.forms) { vPresentEl.textContent = d.forms[0]; vPastEl.textContent = d.forms[1]; vPPEl.textContent = d.forms[2]; }

        // 구동사 렌더링
        if (d.phrasalVerbs && d.phrasalVerbs.length > 0) {
            phrasalSec.style.display = '';
            phrasalList.innerHTML = d.phrasalVerbs.map((pv, idx) => `
                <div class="phrasal-item">
                    <div class="phrasal-phrase">${formatPhrase(pv.phrase)}</div>
                    <div class="phrasal-meaning-small">${pv.meaning}</div>
                    <div class="phrasal-ex-box">
                        <div class="phrasal-ex-en">
                            <span>${pv.ex}</span>
                            <button class="speak-btn speak-xs" onclick="speak('${pv.ex.replace(/'/g, "\\'")}')">
                                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.03,19.86 21,16.28 21,12C21,7.72 18.03,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.02C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/></svg>
                            </button>
                        </div>
                        <div class="phrasal-ex-ko">${pv.exKo}</div>
                    </div>
                </div>
            `).join('');
        } else {
            phrasalSec.style.display = 'none';
        }
    } catch (e) {
        console.error('[updateCard Error]', e);
        reportCriticalError('카드 렌더링 중 오류가 발생했습니다: ' + e.message);
    }
}

function formatPhrase(p) {
    // 첫 단어 이후를 강조 (노란색)
    return p.replace(/^(\w+)\s+(.+)$/, '$1 <span class="particle-highlight">$2</span>');
}

function refreshStudyOrder() {
    const len = vocabData[currentLevel].length;
    shuffledStudyIndices = Utils.shuffle([...Array(len).keys()]);
}

function handleNext() { currentIndex = (currentIndex + 1) % vocabData[currentLevel].length; updateCard(); }
function handlePrev() { currentIndex = (currentIndex - 1 + vocabData[currentLevel].length) % vocabData[currentLevel].length; updateCard(); }

// ============================================================
// TTS
// ============================================================
function speak(t) { if (!('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'en-US'; u.rate = 0.85; window.speechSynthesis.speak(u); }

// ============================================================
// UTILS
// ============================================================
const $ = id => document.getElementById(id);

function createChallengeBadge() {
    const badge = document.createElement('div');
    badge.id = 'challengeBadge';
    badge.className = 'challenge-badge';
    badge.innerHTML = '🔥 도전 문항! (상위 레벨)';
    document.querySelector('.quiz-card').appendChild(badge);
    return badge;
}

// 동사 퀴즈의 보기 생성 로직 (이제 추출된 "실제 정답 형태"를 기준으로 생성)
function getVerbChoices(d, tenseIdx, exactCorrect) {
    const f = d.forms;
    const pool = new Set([
        f[0], f[1], f[2], 'will ' + f[0],
        f[0] + 's', f[0] + 'es', f[0].replace(/y$/, 'ies'), f[0] + 'ing'
    ]);
    const wrong = [...pool].filter(x => x !== exactCorrect).slice(0, 3);
    const extras = ['do ' + f[0], 'to ' + f[0], f[0] + 'ed'];
    for (const e of extras) {
        if (wrong.length >= 3) break;
        if (e !== exactCorrect && !wrong.includes(e)) wrong.push(e);
    }
    return Utils.shuffle([exactCorrect, ...wrong.slice(0, 3)]);
}

function getWordChoices(cur) {
    const dataList = (window.vocabData || {})[currentLevel] || [];
    const others = Utils.shuffle(dataList.filter(w => w.word !== cur.word && !isVerb(w))).slice(0, 3);
    if (others.length < 3) {
        const fallback = Utils.shuffle(dataList.filter(w => w.word !== cur.word)).slice(0, 3 - others.length);
        others.push(...fallback);
    }
    return Utils.shuffle([cur, ...others.slice(0, 3)]);
}

// ============================================================
// BLANK SENTENCE UTILS
// ============================================================
// 문장에서 빈칸을 뚫고, 실제로 뚫린 형태(단수/복수/과거 등)를 함께 리턴하는 함수
function blankVerbSentence(sentence, forms, tenseIdx) {
    let candidates = [];
    if (tenseIdx === 0) {
        // 현재형일 때 가능한 모든 형태 (가장 긴 것부터 검사하여 carries, catches 등을 먼저 매칭)
        candidates = [forms[0] + 'es', forms[0] + 's', forms[0].replace(/y$/, 'ies'), forms[0]];
        candidates.sort((a, b) => b.length - a.length);
    } else if (tenseIdx === 1) {
        candidates = [forms[1]];
    } else {
        candidates = ['will ' + forms[0]];
    }

    for (const c of candidates) {
        const escaped = c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/, '\\s+');
        const re = new RegExp('\\b' + escaped + '\\b', 'i');
        if (re.test(sentence)) {
            return {
                html: sentence.replace(re, '<span class="blank-word">( ___ )</span>'),
                matchedWord: c // 실제 뚫린 문장 속 형태 저장
            };
        }
    }

    // 예외 상황 대비 기본값
    const fallbackWord = tenseIdx === 0 ? forms[0] : tenseIdx === 1 ? forms[1] : 'will ' + forms[0];
    return {
        html: sentence + ' <span class="blank-word">( ___ )</span>',
        matchedWord: fallbackWord
    };
}

function blankNonVerbSentence(sentence, word) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('\\b' + escaped + '(s|es|d|ed|ing|ly)?\\b', 'i');
    const match = sentence.match(re);
    if (match) {
        return {
            html: sentence.replace(re, '<span class="blank-word">( ___ )</span>'),
            matchedWord: match[0]
        };
    }
    return {
        html: sentence + ' <span class="blank-word">( ___ )</span>',
        matchedWord: word
    };
}

// ============================================================
// QUIZ FLOW
// ============================================================
function startQuiz(wordList) {
    try {
        const LEVEL_ORDER = ['level1', 'level2', 'level3', 'level4'];
        
        const params = new URLSearchParams(window.location.search);
        const isReviewMode = params.get('mode') === 'review';

        // 퀴즈 상태 초기화
        quizIndex = 0;
        quizScore = 0;
        quizPhase = 1;
        questionResults = [];
        quizWrongWordCounts = {};

        if (wordList) {
            quizWords = wordList;
            // [Stabilized] 재시험 시 기존 세션 정보 유지 및 회차 증가
            quizSessionData.roundCount = (quizSessionData.roundCount || 0) + 1;
        } else {
            // [신규 세션]
            quizSessionData.id = Date.now().toString();
            quizSessionData.startTime = Date.now();
            quizSessionData.initialScore = null;
            quizSessionData.currentScore = 0;
            quizSessionData.roundCount = 1;

            if (isReviewMode) {
                const wrongAnswers = (typeof WrongNote !== 'undefined' ? (WrongNote.getAll().english || []) : []).map(w => w.word);
                if (wrongAnswers.length === 0) {
                    alert('오답 노트가 비어 있습니다!');
                    window.location.href = 'index.html';
                    return;
                }
                const fullData = Object.values(window.vocabData || {}).flat();
                quizWords = wrongAnswers.map(word => fullData.find(item => item && item.word === word)).filter(x => x);
                quizWords = Utils.shuffle(quizWords);
            } else {
                const dataList = (window.vocabData || {})[currentLevel] || [];
                let challengeWords = [];
                const curIdx = LEVEL_ORDER.indexOf(currentLevel);
                if (curIdx < LEVEL_ORDER.length - 1) {
                    const nextLevel = LEVEL_ORDER[curIdx + 1];
                    const challengeCount = Math.floor(Math.random() * 5) + 1;
                    challengeWords = Utils.shuffle((window.vocabData || {})[nextLevel] || []).slice(0, challengeCount);
                    challengeWords.forEach(w => w.isChallenge = true);
                }
                const baseCount = QUIZ_COUNT - challengeWords.length;
                const baseWords = Utils.shuffle([...dataList]).slice(0, baseCount);
                quizWords = Utils.shuffle([...baseWords, ...challengeWords]);
            }
            quizSessionData.total = quizWords.length;
        }
        
        // qType 할당 로직
        if (quizWords.length > 0) {
            quizWords.forEach(w => {
                if (!w._keepQType) {
                    const rand = Math.random();
                    if (w.phrasalVerbs && w.phrasalVerbs.length > 0 && rand < 0.3) {
                        w.qType = 3 + Math.floor(Math.random() * 4); // 3~6: 구동사
                    } else if (isVerb(w) && w.forms && rand < 0.5) {
                        w.qType = 7; // 동사 3단 변화
                    } else if (w.ex && rand < 0.7) {
                        // 6학년은 주관식이 너무 어려울 수 있으니 확률 조정
                        const subjectiveProb = currentLevel === 'level1' ? 0.2 : 0.4;
                        if (Math.random() < subjectiveProb) {
                            w.qType = 8; // 주관식 빈칸
                        } else {
                            w.qType = 9; // 문장 배열
                        }
                    } else if (rand < 0.85) {
                        w.qType = 10; // 품사 맞히기
                    } else {
                        w.qType = Math.random() < 0.5 ? 1 : 2; // 기존 뜻/객관식 빈칸
                    }
                }
                delete w._keepQType;
            });
        }

        showQuestion();
    } catch (e) {
        console.error('[startQuiz Error]', e);
        reportCriticalError('퀴즈 초기화 중 오류가 발생했습니다: ' + e.message);
    }
}

function updateHeader() {
    quizProgressBar.style.width = `${(quizIndex / quizWords.length) * 100}%`;
    quizQNumEl.textContent = `문제 ${quizIndex + 1} / ${quizWords.length}`;
    quizScoreEl.textContent = `${quizScore}점`;
}

function showQuestion() {
    try {
        if (quizIndex >= quizWords.length) { showResult(); return; }
        const cur = quizWords[quizIndex];
        quizPhase = cur.qType;
        updateHeader();
        hideAllPhases();

        // 도전 문항 배지 처리
        const challengeBadge = $('challengeBadge') || createChallengeBadge();
        challengeBadge.style.display = cur.isChallenge ? 'flex' : 'none';

        if (quizPhase === 1) {
            // 1. 뜻 맞추기 형태
            phaseBadgeEl.textContent = '뜻 맞추기'; phaseBadgeEl.className = 'phase-badge';
            quizQuestionLabel.textContent = '이 단어의 뜻은?';
            phase1Area.style.display = '';
            quizChoicesParent.style.display = 'grid';
            
            quizWordEl.textContent = cur.word;
            const dataList = (window.vocabData || {})[currentLevel] || [];
            const wrong = Utils.shuffle(dataList.filter(w => w.word !== cur.word)).slice(0, 3);
            const choices = Utils.shuffle([cur, ...wrong]);

            questionResults[quizIndex] = {
                word: cur.word, meaning: cur.meaning, qType: 1,
                correctValue: cur.word, displayCorrect: cur.meaning
            };

            quizChoices.forEach((btn, i) => {
                btn.textContent = choices[i].meaning;
                btn.dataset.answer = choices[i].word;
                btn.className = 'choice-btn'; btn.disabled = false; btn.style.display = '';
            });
        } else if (quizPhase === 2) {
            // 2. 빈칸 맞추기 형태
            phaseBadgeEl.textContent = '빈칸 맞추기'; phaseBadgeEl.className = 'phase-badge phase2';
            phase2Area.style.display = '';
            quizChoicesParent.style.display = 'grid';

            let choices, correctAnswer;
            if (isVerb(cur)) {
                currentTenseIdx = Math.floor(Math.random() * 3);
                const tenseName = TENSE_NAMES[currentTenseIdx];
                tenseBadgeEl.textContent = `⏱ 시제: ${tenseName}`;
                const rawSentence = cur.tenseExs ? cur.tenseExs[currentTenseIdx] : cur.ex;

                const blankRes = blankVerbSentence(rawSentence, cur.forms, currentTenseIdx);
                const koHint = currentLevel === 'level1' ? `<div class="quiz-ko-hint">뜻: ${cur.meaning}</div>` : '';
                phase2ContextEl.innerHTML = `${koHint}${blankRes.html}`;
                correctAnswer = blankRes.matchedWord;

                quizQuestionLabel.textContent = `'${cur.word}'의 알맞은 동사 형태를 고르세요`;
                choices = getVerbChoices(cur, currentTenseIdx, correctAnswer);
            } else {
                tenseBadgeEl.textContent = '📖 영문 뜻 & 예문';
                quizQuestionLabel.textContent = '빈칸에 들어갈 알맞은 단어를 고르세요';
                const blankRes = blankNonVerbSentence(cur.ex, cur.word);
                const koHint = currentLevel === 'level1' ? `<div class="quiz-ko-hint">뜻: ${cur.meaning}</div>` : '';
                phase2ContextEl.innerHTML = `${koHint}<span class="quiz-def-hint">${cur.def}</span>${blankRes.html}`;
                const wordChoices = getWordChoices(cur);
                choices = wordChoices.map(w => w.word);
                correctAnswer = cur.word;
            }

            questionResults[quizIndex] = {
                word: cur.word, meaning: cur.meaning, qType: 2,
                correctValue: correctAnswer, displayCorrect: correctAnswer
            };

            quizChoices.forEach((btn, i) => {
                btn.textContent = choices[i] || '';
                btn.dataset.answer = choices[i] || '';
                btn.className = 'choice-btn'; btn.disabled = false; btn.style.display = choices[i] ? '' : 'none';
            });
        } else if (quizPhase >= 3 && quizPhase <= 6) {
            // 구동사 퀴즈 (기존 로직 복구 및 hideAllPhases 적용)
            phase2Area.style.display = '';
            quizChoicesParent.style.display = 'grid';
            const pv = Utils.shuffle(cur.phrasalVerbs)[0];
            const vPart = pv.phrase.split(' ')[0];
            const pPart = pv.phrase.split(' ').slice(1).join(' ');
            tenseBadgeEl.textContent = '🔥 구동사 퀴즈';
            
            let correctAnswer, choices, qText, contextHtml;
            const dataList = (window.vocabData || {})[currentLevel] || [];
            const others = Utils.shuffle(dataList.filter(w => w !== cur)).slice(0, 3);

            if (quizPhase === 3) {
                phaseBadgeEl.textContent = '구동사 뜻'; phaseBadgeEl.className = 'phase-badge phase3';
                qText = `구동사 '${pv.phrase}'의 뜻은?`;
                contextHtml = `<div class="phrasal-quiz-context">${pv.phrase}</div>`;
                correctAnswer = pv.meaning;
                choices = Utils.shuffle([pv.meaning, ...others.map(o => o.meaning)]);
            } else if (quizPhase === 4) {
                phaseBadgeEl.textContent = '구동사 동사 찾기'; phaseBadgeEl.className = 'phase-badge phase3';
                qText = `아래 뜻과 전치사에 어울리는 동사는?`;
                contextHtml = `<div class="phrasal-quiz-context">( ___ ) <span class="particle-highlight">${pPart}</span></div><div class="quiz-ko-hint">뜻: ${pv.meaning}</div>`;
                correctAnswer = vPart;
                choices = Utils.shuffle([vPart, ...others.map(o => o.word)]);
            } else if (quizPhase === 5) {
                phaseBadgeEl.textContent = '구동사 전치사 찾기'; phaseBadgeEl.className = 'phase-badge phase3';
                qText = `아래 뜻과 동사에 어울리는 전치사는?`;
                contextHtml = `<div class="phrasal-quiz-context">${vPart} ( ___ )</div><div class="quiz-ko-hint">뜻: ${pv.meaning}</div>`;
                correctAnswer = pPart;
                const pPool = Utils.shuffle(['up', 'down', 'in', 'out', 'off', 'on', 'away', 'back', 'along']).filter(p => p !== pPart).slice(0, 3);
                choices = Utils.shuffle([pPart, ...pPool]);
            } else {
                phaseBadgeEl.textContent = '구동사 완성'; phaseBadgeEl.className = 'phase-badge phase3';
                qText = `뜻 '${pv.meaning}'에 알맞은 구동사는?`;
                contextHtml = `<div class="quiz-ko-hint" style="font-size:1.5rem">뜻: ${pv.meaning}</div>`;
                correctAnswer = pv.phrase;
                const pvPool = Utils.shuffle(dataList.filter(w => w.phrasalVerbs && w !== cur).map(w => w.phrasalVerbs[0].phrase)).slice(0, 3);
                choices = Utils.shuffle([pv.phrase, ...pvPool]);
            }

            quizQuestionLabel.textContent = qText;
            phase2ContextEl.innerHTML = contextHtml;
            questionResults[quizIndex] = { word: cur.word, meaning: cur.meaning, qType: quizPhase, correctValue: correctAnswer, displayCorrect: correctAnswer };
            quizChoices.forEach((btn, i) => {
                btn.textContent = choices[i] || '';
                btn.dataset.answer = choices[i] || '';
                btn.className = 'choice-btn'; btn.disabled = false; btn.style.display = choices[i] ? '' : 'none';
            });
        } else if (quizPhase === 7) {
            // 7. 동사 3단 변화
            phaseBadgeEl.textContent = '3단 변화'; phaseBadgeEl.className = 'phase-badge phase2';
            phaseVerbFormsArea.style.display = 'block';
            quizChoicesParent.style.display = 'none';
            quizSubmitArea.style.display = 'block';

            vQuizBaseEl.textContent = cur.forms[0];
            vQuizPastEl.value = ''; vQuizPPEl.value = '';
            vQuizPastEl.focus();

            quizQuestionLabel.textContent = '동사의 과거형과 과거분사형을 입력하세요';
            questionResults[quizIndex] = { 
                word: cur.word, meaning: cur.meaning, qType: 7,
                correctValue: cur.forms.slice(1).join('|'),
                displayCorrect: `${cur.forms[1]} - ${cur.forms[2]}`
            };
        } else if (quizPhase === 8) {
            // 8. 주관식 빈칸
            phaseBadgeEl.textContent = '주관식 빈칸'; phaseBadgeEl.className = 'phase-badge phase3';
            phaseSubjectiveArea.style.display = 'block';
            quizChoicesParent.style.display = 'none';
            quizSubmitArea.style.display = 'block';

            const blankRes = isVerb(cur)
                ? blankVerbSentence(cur.ex || (cur.tenseExs && cur.tenseExs[0]) || '', cur.forms, 0)
                : blankNonVerbSentence(cur.ex || '', cur.word);
            
            subjectiveContextEl.innerHTML = blankRes.html;
            subjectiveInputEl.value = '';
            subjectiveInputEl.focus();

            quizQuestionLabel.textContent = `뜻: ${cur.meaning}`;
            questionResults[quizIndex] = { 
                word: cur.word, meaning: cur.meaning, qType: 8,
                correctValue: blankRes.matchedWord,
                displayCorrect: blankRes.matchedWord
            };
        } else if (quizPhase === 9) {
            // 9. 문장 배열
            phaseBadgeEl.textContent = '문장 완성'; phaseBadgeEl.className = 'phase-badge';
            phaseUnscrambleArea.style.display = 'block';
            quizChoicesParent.style.display = 'none';

            const sentence = cur.ex;
            const words = sentence.replace(/[.?!,]/g, '').split(/\s+/);
            const shuffled = Utils.shuffle([...words]);
            
            unscrambleTargetEl.innerHTML = '';
            unscrambleChipsEl.innerHTML = shuffled.map(w => `<span class="unscramble-word" onclick="handleUnscrambleClick(this)">${w}</span>`).join('');
            
            quizQuestionLabel.textContent = `뜻: ${cur.exKo}`;
            questionResults[quizIndex] = { 
                word: cur.word, meaning: cur.meaning, qType: 9,
                correctValue: words.join(' '),
                displayCorrect: sentence
            };
        } else if (quizPhase === 10) {
            // 10. 품사 맞히기
            phaseBadgeEl.textContent = '품사 맞히기'; phaseBadgeEl.className = 'phase-badge phase2';
            phase1Area.style.display = '';
            quizChoicesParent.style.display = 'grid';
            quizWordEl.textContent = cur.word;
            quizQuestionLabel.textContent = '이 단어의 품사는 무엇인가요?';

            const posOptions = [
                { id: 'n.', label: '명사' },
                { id: 'v.t.', label: '타동사' },
                { id: 'v.i.', label: '자동사' },
                { id: 'adj.', label: '형용사' },
                { id: 'adv.', label: '부사' }
            ];
            
            const correctPos = posOptions.find(p => p.id === cur.pos) || { id: cur.pos, label: cur.pos };
            const otherPos = posOptions.filter(p => p.id !== cur.pos);
            const choices = Utils.shuffle([correctPos, ...Utils.shuffle(otherPos).slice(0, 3)]);

            questionResults[quizIndex] = { 
                word: cur.word, meaning: cur.meaning, qType: 10,
                correctValue: cur.pos,
                displayCorrect: correctPos.label
            };

            quizChoices.forEach((btn, i) => {
                btn.textContent = choices[i].label;
                btn.dataset.answer = choices[i].id;
                btn.className = 'choice-btn'; btn.disabled = false; btn.style.display = '';
            });
        }
        
        // 💡 3회 이상 오답 시 힌트 추가
        const oldHint = document.getElementById('engHintWrap');
        if (oldHint) oldHint.remove();

        if (quizWrongWordCounts[cur.word] >= 3) {
            const wrap = document.createElement('div');
            wrap.id = 'engHintWrap';
            wrap.style.marginTop = '16px';
            wrap.innerHTML = `<button class="hint-btn">💡 너무 어렵나요? 힌트 (뜻/예문) 보기</button>`;
            const popup = document.createElement('div');
            popup.className = 'result-explanation-box';
            let pTxt = `뜻: ${cur.meaning}`;
            if (cur.ex) pTxt += `<br>예문: ${cur.ex}<br>(${cur.exKo || ''})`;
            if (cur.phrasalVerbs) {
                cur.phrasalVerbs.forEach(pv => pTxt += `<br>🔥 ${pv.phrase}: ${pv.meaning}`);
            }
            popup.innerHTML = pTxt;
            wrap.querySelector('.hint-btn').onclick = () => popup.classList.toggle('show');
            wrap.appendChild(popup);

            // 주관식/배열 퀴즈에서는 quizSubmitArea 뒤에, 아니면 quizChoices 뒤에 삽입
            const hintAnchor = (quizSubmitArea && quizSubmitArea.style.display !== 'none')
                ? quizSubmitArea
                : document.getElementById('quizChoices');
            hintAnchor.after(wrap);
        }
    } catch (e) {
        console.error('[showQuestion Error]', e);
        reportCriticalError('문제 렌더링 중 오류가 발생했습니다: ' + e.message);
    }
}

function handleAnswer(btn) {
    const res = questionResults[quizIndex];
    const ok = btn.dataset.answer === res.correctValue;
    
    // 비주얼 피드백 (선택한 버튼 표시)
    quizChoices.forEach(b => { b.disabled = true; });
    btn.classList.add(ok ? 'correct' : 'wrong');
    
    finishQuestion(ok, btn.textContent);
}

// ============================================================
// NEW QUIZ HANDLERS
// ============================================================
function handleUnscrambleClick(chip) {
    if (chip.classList.contains('used')) return;
    
    // 타겟 영역으로 이동
    const clone = chip.cloneNode(true);
    clone.onclick = () => {
        chip.classList.remove('used');
        clone.remove();
    };
    unscrambleTargetEl.appendChild(clone);
    chip.classList.add('used');

    // 모든 단어가 배치되었는지 확인
    const allChips = unscrambleChipsEl.querySelectorAll('.unscramble-word');
    const usedChips = Array.from(allChips).filter(c => c.classList.contains('used'));

    if (allChips.length > 0 && usedChips.length === allChips.length) {
        const userSentence = Array.from(unscrambleTargetEl.querySelectorAll('.unscramble-word'))
            .map(c => c.textContent).join(' ');
        const res = questionResults[quizIndex];
        const ok = userSentence === res.correctValue;
        
        finishQuestion(ok, userSentence);
    }
}

function handleQuizSubmit() {
    const res = questionResults[quizIndex];
    let ok = false;
    let userVal = '';

    if (res.qType === 7) {
        // 동사 3단 변화 체크
        const pVal = vQuizPastEl.value.trim().toLowerCase();
        const ppVal = vQuizPPEl.value.trim().toLowerCase();
        const [correctP, correctPP] = res.correctValue.split('|');
        ok = (pVal === correctP.toLowerCase() && ppVal === correctPP.toLowerCase());
        userVal = `${pVal} - ${ppVal}`;
    } else if (res.qType === 8) {
        // 주관식 빈칸 체크
        userVal = subjectiveInputEl.value.trim().toLowerCase();
        const correct = res.correctValue.toLowerCase();
        const base = (res.word || '').toLowerCase();
        
        // 문장 내의 실제 형태(correct)와 일치하거나, 단어의 기본형(base)과 일치하면 정답 인정
        ok = (userVal === correct || (base && userVal === base));
    }

    finishQuestion(ok, userVal);
}

function finishQuestion(ok, userVal) {
    const res = questionResults[quizIndex];
    res.isOk = ok;
    
    const status = ok ? 'correct' : 'wrong';
    const wData = vocabData[currentLevel].find(w => w.word === res.word);
    
    if (ok) {
        quizScore++;
        phaseFeedback.textContent = '정답입니다! ✨';
        phaseFeedback.className = 'phase-feedback correct-fb';
    } else {
        quizWrongWordCounts[res.word] = (quizWrongWordCounts[res.word] || 0) + 1;
        phaseFeedback.textContent = `오답입니다. 정답: ${res.displayCorrect}`;
        phaseFeedback.className = 'phase-feedback wrong-fb';
        
        // 주관식일 때 흔들기 효과
        if (res.qType === 7 || res.qType === 8) {
            const area = res.qType === 7 ? phaseVerbFormsArea : phaseSubjectiveArea;
            area.classList.add('shake');
            setTimeout(() => area.classList.remove('shake'), 500);
        }
    }
    
    phaseFeedback.style.display = 'block';

    if (wData) {
        const explanation = `뜻: ${wData.meaning}<br>예문: ${wData.ex || ''}<br>해석: ${wData.exKo || ''}`;
        WrongNote.save('english', { 
            word: wData.word, 
            meaning: wData.meaning, 
            level: currentLevel,
            question: document.getElementById('quizWord')?.textContent || phase2ContextEl?.textContent || res.correctValue,
            explanation: explanation
        }, status, quizSessionData.id, quizSessionData.roundCount);
    }

    setTimeout(() => {
        quizIndex++;
        showQuestion();
    }, ok ? 800 : 1800); // 오답일 때는 정답을 볼 수 있게 더 오래 대기
}

// ============================================================
// HELPERS
// ============================================================
function hideAllPhases() {
    [phase1Area, phase2Area, phaseVerbFormsArea, phaseSubjectiveArea, phaseUnscrambleArea, quizChoicesParent, quizSubmitArea, phaseFeedback].forEach(el => {
        if (el) el.style.display = 'none';
    });
}

// ============================================================
// RESULT
// ============================================================
function showResult() {
    // 1. 점수 누적 처리 (백분율 계산 전 수행)
    if (quizSessionData.initialScore === null) {
        quizSessionData.initialScore = quizScore;
        quizSessionData.currentScore = quizScore;
    } else {
        quizSessionData.currentScore += quizScore;
    }

    const total = quizSessionData.total;
    const pct = Math.round((quizSessionData.currentScore / total) * 100);
    quizProgressBar.style.width = '100%';

    const isPerfect = pct === 100;
    const emoji    = isPerfect ? '🏆' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚';
    const title    = isPerfect ? '완벽 완료!' : '성적표';
    const msg      = isPerfect
        ? '모든 문제를 맞혔습니다! 대단해요! 🎊'
        : `틀린 문제를 다시 풀어서 100점을 완성해보세요!`;

    resultEmoji.textContent = emoji;
    resultTitle.textContent = title;
    resultScore.textContent = `${quizSessionData.currentScore} / ${total}문제 정답 (${pct}%)`;
    resultMessage.textContent = msg;

    scoreCard.innerHTML = '';
    retryWrongList = [];
    questionResults.forEach((r, i) => {
        const ok = r.isOk;
        const row = document.createElement('div');
        row.className = `sc-row ${ok ? 'sc-all-correct' : 'sc-all-wrong'}`;
        const types = ['뜻 맞추기', '빈칸 맞추기', '구동사 뜻', '동사 찾기', '전치사 찾기', '구동사 완성', '3단 변화', '주관식 빈칸', '문장 완성', '품사 맞히기'];
        const badgeType = types[r.qType - 1] || '퀴즈';
        const badge = `<span class="sc-badge ${ok ? 'ok' : 'ng'}">${ok ? '✓' : '✗'} ${badgeType}</span>`;
        
        const wData = vocabData[currentLevel].find(w => w.word === r.word);
        
        let expHtml = '';
        let expBoxHtml = '';
        if (ok && wData) {
            expHtml = `<button class="explanation-btn" onclick="document.getElementById('exp_${i}').classList.toggle('show');">💡 해설 보기</button>`;
            let exText = wData.ex ? `<br>예문: ${wData.ex}` : '';
            if (wData.exKo) exText += `<br>(${wData.exKo})`;
            if (wData.phrasalVerbs) wData.phrasalVerbs.forEach(pv => exText += `<br>🔥 ${pv.phrase}: ${pv.meaning}`);
            expBoxHtml = `<div id="exp_${i}" class="result-explanation-box" style="margin-top:10px;">뜻: ${wData.meaning}${exText}</div>`;
        } else {
            expHtml = !ok ? `<span style="font-size:0.8rem; color:#ff5252; margin-left:auto;">다시 풀기</span>` : '';
        }

        row.innerHTML = `
            <div style="display:flex; flex-direction:column; width:100%;">
                <div class="sc-top" style="display:flex; align-items:center; flex-wrap:wrap; width:100%; gap:10px;">
                    <span class="sc-num">Q${i+1}</span>
                    <span class="sc-word">${r.word}</span>
                    <span class="sc-meaning">${r.meaning}</span>
                    ${expHtml}
                </div>
                <div class="sc-badges" style="margin-top:8px;">${badge}</div>
                ${expBoxHtml}
            </div>
        `;
        scoreCard.appendChild(row);
        if (!ok) retryWrongList.push({ word: r.word, qType: r.qType }); // qType 보존
    });

    const isCompleted = (retryWrongList.length === 0);
    const timeSpent = Math.floor((Date.now() - quizSessionData.startTime) / 1000);
    
    if (typeof saveQuizResult === 'function') {
        const lvName = document.querySelector('.level-btn.active').textContent;
        saveQuizResult(quizSessionData.id, 'english', lvName, quizSessionData.total, quizSessionData.currentScore, quizSessionData.initialScore, timeSpent, isCompleted);

        // [New] 경험치 지급 및 레벨업 확인
        const result = UserSession.addEXP(quizScore);
        if (result && result.levelUp) {
            alert(`🎊 축하합니다! 레벨 ${(result.user.level)}로 레벨업하셨습니다!`);
        }
    }

    // 틀린 문제가 있으면 재도전 버튼만 표시 (완료 불가)
    if (retryWrongList.length > 0) {
        retryWrongBtn.style.display = '';
        retryWrongBtn.textContent = `🔄 틀린 ${retryWrongList.length}문제 다시 풀기`;
        retryBtn.style.display = 'none'; // 전체 다시풀기 숨김
    } else {
        retryWrongBtn.style.display = 'none';
        retryBtn.style.display = '';
    }
    
    // 카카오톡 보고 버튼 노출 (항상 노출하도록 설정)
    if (kakaoReportBtn) kakaoReportBtn.style.display = 'block';

    resultModal.classList.remove('hidden');
}

// ============================================================
// MODE
// ============================================================
function setMode(mode) {
    try {
        if (mode === 'study') {
            studyModeBtn.classList.add('active');
            quizModeBtn.classList.remove('active');
            studyView.classList.add('view-active');
            studyControls.classList.add('view-active');
            quizView.classList.remove('view-active');
            currentMode = 'study';
            updateCard();
        } else {
            quizModeBtn.classList.add('active');
            studyModeBtn.classList.remove('active');
            studyView.classList.remove('view-active');
            studyControls.classList.remove('view-active');
            quizView.classList.add('view-active');
            currentMode = 'quiz';
            startQuiz();
        }
    } catch (e) {
        console.error('[setMode Error]', e);
        reportCriticalError('모드 전환 실패: ' + e.message);
    }
}

// [Diagnostic] 내부 에러를 화면에 직접 출력하는 유틸
function reportCriticalError(msg) {
    console.error('[CRITICAL]', msg);
    const target = (currentMode === 'study') ? englishWordEl : quizWordEl;
    if (target && typeof target.innerHTML !== 'undefined') {
        target.innerHTML = `<div style="color:#ff5252; font-size:1.0rem; background:rgba(255,82,82,0.1); padding:10px; border-radius:8px; border:1px solid rgba(255,82,82,0.3); line-height:1.4;">⚠️ ${msg}</div>`;
    } else {
        // UI가 로드되지 않은 상태면 alert 시도
        setTimeout(() => alert('English App Error: ' + msg), 100);
    }
}

// ============================================================
// EVENTS
// ============================================================
function getCurrentStudyWord() {
    const realIdx = shuffledStudyIndices[currentIndex];
    return (window.vocabData || {})[currentLevel][realIdx];
}

// ============================================================
// APP ENTRY POINT (EXPLICIT INIT)
// ============================================================
window.AppEngine = {
    initDOM: function() {
        wordIndexEl = $('wordIndex'); englishWordEl = $('englishWord'); pronunciationEl = $('wordPronunciation');
        posBadgeEl = $('posBadge'); koreanMeaningEl = $('koreanMeaning');
        verbFormsSec = $('verbFormsSection'); vPresentEl = $('vPresent'); vPastEl = $('vPast'); vPPEl = $('vPP');
        englishDefEl = $('englishDef'); exSentEl = $('exampleSentence'); exKoEl = $('exampleKorean');
        toggleKoBtn = $('toggleKoBtn');
        phrasalSec = $('phrasalVerbsSection'); phrasalList = $('phrasalList'); togglePhrasalBtn = $('togglePhrasalBtn');
        speakWordBtn = $('speakWordBtn'); speakDefBtn = $('speakDefBtn'); speakExBtn = $('speakExBtn');
        prevBtn = $('prevBtn'); nextBtn = $('nextBtn');
        levelBtns = document.querySelectorAll('.level-btn');
        studyModeBtn = $('studyModeBtn'); quizModeBtn = $('quizModeBtn');
        studyView = $('studyView'); studyControls = $('studyControls'); quizView = $('quizView');
        quizQNumEl = $('quizQNum'); phaseBadgeEl = $('phaseBadge'); quizScoreEl = $('quizScoreEl');
        quizProgressBar = $('quizProgressBar'); quizQuestionLabel = $('quizQuestionLabel');
        phase1Area = $('phase1Area'); phase2Area = $('phase2Area');
        quizWordEl = $('quizWord'); quizSpeakBtn = $('quizSpeakBtn');
        tenseBadgeEl = $('tenseBadge'); phase2ContextEl = $('phase2Context');
        phaseFeedback = $('phaseFeedback');
        quizChoices = document.querySelectorAll('.choice-btn');
        resultModal = $('resultModal'); resultEmoji = $('resultEmoji');
        resultTitle = $('resultTitle'); resultScore = $('resultScore'); resultMessage = $('resultMessage');
        scoreCard = $('scoreCard');
        retryWrongBtn = $('retryWrongBtn'); retryBtn = $('retryBtn'); studyAgainBtn = $('studyAgainBtn');
        kakaoReportBtn = $('kakaoReportBtn');

        phaseVerbFormsArea = $('phaseVerbFormsArea');
        vQuizBaseEl = $('vQuizBase'); vQuizPastEl = $('vQuizPast'); vQuizPPEl = $('vQuizPP'); // HTML id는 'vQuizPP'
        phaseSubjectiveArea = $('phaseSubjectiveArea');
        subjectiveContextEl = $('subjectiveContext'); subjectiveInputEl = $('subjectiveInput');
        phaseUnscrambleArea = $('phaseUnscrambleArea');
        unscrambleTargetEl = $('unscrambleTarget'); unscrambleChipsEl = $('unscrambleChips');
        resetUnscrambleBtn = $('resetUnscrambleBtn');
        quizSubmitArea = $('quizSubmitArea'); quizSubmitBtn = $('quizSubmitBtn');
        quizChoicesParent = $('quizChoices'); // 기존 quizChoices는 NodeList이므로 부모 div 참조용
    },

    init: function(retryCount = 0) {
        console.log(`[AppEngine] Initializing... (Attempt ${retryCount + 1}/5)`);
        
        // 1. 데이터 로드 대기 확인 (최대 5회 재시도)
        if (!window.vocabData || Object.keys(window.vocabData).length === 0) {
            if (retryCount < 5) {
                console.warn('[AppEngine] Data not ready, retrying in 200ms...');
                setTimeout(() => this.init(retryCount + 1), 200);
                return;
            }
            const errorMsg = 'VocabEng.js 데이터 로딩 실패! (파일이 없거나 대기 시간이 초과되었습니다.)';
            console.error('[Critical Error]', errorMsg);
            if (window.onerror) window.onerror(errorMsg, 'main.js', 0, 0, new Error(errorMsg));
            return false;
        }

        // 2. DOM 초기화 (이제 안전함)
        try {
            this.initDOM();
            this.setupListeners();
        } catch (e) {
            console.error('[DOM Init Error]', e);
            if (window.onerror) window.onerror('화면 요소 초기화 실패: ' + e.message, 'main.js', 0, 0, e);
            return false;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode') === 'review' ? 'quiz' : 'study';
        
        console.log(`[AppEngine] Starting in ${mode} mode`);
        setMode(mode);
        return true;
    },

    setupListeners: function() {
        console.log('[AppEngine] Setting up listeners...');

        const showMeaningBtn = $('showMeaningBtn');
        const metaContent = $('metaContent');
        if (showMeaningBtn && metaContent) {
            showMeaningBtn.addEventListener('click', () => {
                showMeaningBtn.style.display = 'none';
                metaContent.style.display = 'flex';
            });
        }

        if (prevBtn) prevBtn.addEventListener('click', handlePrev);
        if (nextBtn) nextBtn.addEventListener('click', handleNext);
        if (togglePhrasalBtn) togglePhrasalBtn.addEventListener('click', () => {
            phrasalList.classList.toggle('phrasal-collapsed');
            togglePhrasalBtn.textContent = phrasalList.classList.contains('phrasal-collapsed') ? '➕ 펼치기' : '➖ 접기';
        });
        if (speakWordBtn) speakWordBtn.addEventListener('click', () => {
            const dataList = (window.vocabData || {})[currentLevel];
            if (dataList) speak(dataList[shuffledStudyIndices[currentIndex]].word);
        });
        if (speakDefBtn) speakDefBtn.addEventListener('click', () => {
            const dataList = (window.vocabData || {})[currentLevel];
            if (dataList) speak(dataList[shuffledStudyIndices[currentIndex]].def);
        });
        if (speakExBtn) speakExBtn.addEventListener('click', () => {
            const dataList = (window.vocabData || {})[currentLevel];
            if (dataList) speak(dataList[shuffledStudyIndices[currentIndex]].ex);
        });
        if (quizSpeakBtn) quizSpeakBtn.addEventListener('click', () => {
            if (quizWords[quizIndex]) speak(quizWords[quizIndex].word);
        });
        if (levelBtns) levelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                levelBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentLevel = btn.dataset.level;
                currentIndex = 0;
                
                if (currentMode === 'study') {
                    refreshStudyOrder();
                    updateCard();
                } else {
                    startQuiz();
                }
            });
        });

        if (studyModeBtn) studyModeBtn.addEventListener('click', () => setMode('study'));
        if (quizModeBtn) quizModeBtn.addEventListener('click', () => setMode('quiz'));

        if (toggleKoBtn) toggleKoBtn.addEventListener('click', () => {
            showKoEx = !showKoEx;
            if (showKoEx) {
                exKoEl.classList.remove('hidden-text');
                toggleKoBtn.textContent = '👁️ 한글 숨기기';
            } else {
                exKoEl.classList.add('hidden-text');
                toggleKoBtn.textContent = '🙈 한글 보기';
            }
        });

        if (quizChoices) quizChoices.forEach(btn => btn.addEventListener('click', () => handleAnswer(btn)));

        if (retryBtn) retryBtn.addEventListener('click', () => { resultModal.classList.add('hidden'); startQuiz(); });
        if (retryWrongBtn) retryWrongBtn.addEventListener('click', () => {
            resultModal.classList.add('hidden');
            const wrongEntries = retryWrongList; 
            const wrongWords = quizWords.filter(w => wrongEntries.some(e => e.word === w.word));
            wrongWords.forEach(w => {
                const entry = wrongEntries.find(e => e.word === w.word);
                if (entry) { w.qType = entry.qType; w._keepQType = true; }
            });
            startQuiz(wrongWords.length > 0 ? wrongWords : undefined);
        });
        if (studyAgainBtn) studyAgainBtn.addEventListener('click', () => { resultModal.classList.add('hidden'); setMode('study'); });
        if (kakaoReportBtn) kakaoReportBtn.addEventListener('click', () => {
            const pct = Math.round((quizSessionData.currentScore / quizSessionData.total) * 100);
            const levelInfo = currentLevel.replace('level', '레벨 ');
            KakaoShare.sendReport('english', quizSessionData.currentScore, quizSessionData.total, pct, quizSessionData.initialScore, quizSessionData.roundCount, {
                sessionId: quizSessionData.id,
                levelInfo: levelInfo,
                startTime: quizSessionData.startTime,
                endTime: Date.now()
            });
        });

        if (quizSubmitBtn) quizSubmitBtn.addEventListener('click', handleQuizSubmit);
        if (resetUnscrambleBtn) resetUnscrambleBtn.addEventListener('click', () => {
            const chips = unscrambleChipsEl.querySelectorAll('.unscramble-word');
            chips.forEach(c => c.classList.remove('used'));
            unscrambleTargetEl.innerHTML = '';
        });

        // 엔터키 지원 (주관식)
        [vQuizPastEl, vQuizPPEl, subjectiveInputEl].forEach(el => {
            if (el) el.addEventListener('keypress', e => {
                if (e.key === 'Enter') handleQuizSubmit();
            });
        });
        
        document.addEventListener('keydown', e => {
            if (currentMode === 'study') {
                if (e.key === 'ArrowRight') handleNext();
                if (e.key === 'ArrowLeft') handlePrev();
                if (e.key === 'p' || e.key === 'P') {
                    const dataList = (window.vocabData || {})[currentLevel];
                    const word = dataList ? dataList[shuffledStudyIndices[currentIndex]].word : null;
                    if (word) speak(word);
                }
            }
        });
    }
};

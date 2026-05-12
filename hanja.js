/**
 * hanja.js - 한자 퀴즈 엔진 및 UI 핸들링
 */

// DOM 요소
const studyView = $('studyView');
const quizView = $('quizView');
const studyModeBtn = $('studyModeBtn');
const quizModeBtn = $('quizModeBtn');
const levelBtns = document.querySelectorAll('.level-btn');
const studyControls = $('studyControls');

const mainHanja = $('mainHanja');
const hanjaMeaning = $('hanjaMeaning');
const radicalBadge = $('radicalBadge');
const hanjaIndex = $('hanjaIndex');
const prevBtn = $('prevBtn');
const nextBtn = $('nextBtn');

const quizQNum = $('quizQNum');
const quizScoreEl = $('quizScoreEl');
const quizProgressBar = $('quizProgressBar');
const quizHanja = $('quizHanja');
const quizChoices = document.querySelectorAll('.choice-btn');
const resultModal = $('resultModal');
const resultTitle = $('resultTitle');
const resultScore = $('resultScore');
const resultMessage = $('resultMessage');
const scoreCard = $('scoreCard');
const retryBtn = $('retryBtn');
const retryWrongBtn = $('retryWrongBtn');
const studyAgainBtn = $('studyAgainBtn');
const kakaoReportBtn = $('kakaoReportBtn');

const idiomTextEl = $('idiomText');
const idiomEumEl = $('idiomEum');
const idiomMeanEl = $('idiomMean');
const toggleEumBtn = $('toggleEumBtn');
const toggleMeanBtn = $('toggleMeanBtn');

const phaseBadge = $('phaseBadge');
const phaseFeedback = $('phaseFeedback');
const studyStrokeBtn = $('studyStrokeBtn');
const studyStrokeContainer = $('studyStrokeContainer');

// 상태 변수
let currentLevel = 'level8';
let currentMode = 'study';
let currentIndex = 0;
let studyWords = [];
let quizWords = [];
let quizIndex = 0;
let quizScore = 0;
let quizHistory = [];
let retryWrongList = [];
let quizSessionData = { id: '', startTime: 0, total: 0, currentScore: 0, initialScore: null, roundCount: 1 };

let isIdiomEumVisible = false;
let isIdiomMeanVisible = false;
let studyWriterInstance = null;
let writerInstance = null; // 퀴즈용
let isPhaseTransition = false;

function $(id) { return document.getElementById(id); }

// ============================================================
// STUDY MODE
// ============================================================
function updateCard() {
    const d = studyWords[currentIndex];
    mainHanja.textContent = d.hanja;
    hanjaMeaning.textContent = `${d.eum} [${d.meaning}]`;
    radicalBadge.textContent = `부수: ${d.radical}`;
    hanjaIndex.textContent = `${currentIndex + 1} / ${studyWords.length}`;

    // 사자성어
    if (d.idiom) {
        $('relationSection').nextElementSibling.style.display = 'block';
        idiomTextEl.textContent = d.idiom;
        idiomEumEl.textContent = d.idiomEum;
        idiomMeanEl.textContent = d.idiomMean;
        isIdiomEumVisible = false;
        isIdiomMeanVisible = false;
        idiomEumEl.classList.add('hidden');
        idiomMeanEl.classList.add('hidden');
        toggleEumBtn.innerHTML = '🔉 독음 보기';
        toggleMeanBtn.innerHTML = '📖 뜻 보기';
    } else {
        $('relationSection').nextElementSibling.style.display = 'none';
    }

    // 유의어/반의어
    if (d.synonym || d.antonym) {
        $('relationSection').style.display = 'block';
        $('synonym').textContent = d.synonym || '-';
        $('antonym').textContent = d.antonym || '-';
    } else {
        $('relationSection').style.display = 'none';
    }

    // 획순 캔버스 초기화
    studyStrokeContainer.innerHTML = '';
    studyStrokeContainer.classList.remove('active');
    studyStrokeBtn.innerHTML = '🖌️ 획순 보기';
    studyWriterInstance = null;
}

function handleNext() {
    if (currentIndex < studyWords.length - 1) {
        currentIndex++;
        updateCard();
    }
}

function handlePrev() {
    if (currentIndex > 0) {
        currentIndex--;
        updateCard();
    }
}

// ============================================================
// QUIZ MODE
// ============================================================
function startQuiz(customList) {
    quizWords = customList || Utils.shuffle([...vocabHanja[currentLevel]]).slice(0, 10);
    quizIndex = 0;
    quizScore = 0;
    quizHistory = [];
    retryWrongList = [];
    
    // 세션 정보 초기화
    if (!customList) {
        quizSessionData = {
            id: Date.now().toString(),
            startTime: Date.now(),
            total: quizWords.length,
            currentScore: 0,
            initialScore: null,
            roundCount: 1
        };
    } else {
        quizSessionData.roundCount++;
    }

    showQuestion();
}

function showQuestion() {
    const q = quizWords[quizIndex];
    quizQNum.textContent = `문제 ${quizIndex + 1} / ${quizWords.length}`;
    quizScoreEl.textContent = `${quizScore}점`;
    quizProgressBar.style.width = `${((quizIndex) / quizWords.length) * 100}%`;
    
    // 한자 쓰기 퀴즈 여부 결정 (약 30% 확률)
    const isWriting = Math.random() < 0.3;
    
    if (isWriting) {
        setupWritingQuiz(q);
    } else {
        setupMeaningQuiz(q);
    }
}

function setupMeaningQuiz(q) {
    phaseBadge.textContent = '뜻 맞추기';
    $('phase1Area').style.display = 'block';
    $('phase3Area').style.display = 'none';
    $('quizChoices').style.display = 'grid';
    quizHanja.textContent = q.hanja;
    phaseFeedback.style.display = 'none';

    // 선택지 생성
    const others = vocabHanja[currentLevel].filter(v => v.hanja !== q.hanja);
    const choices = Utils.shuffle([
        `${q.eum} [${q.meaning}]`,
        ...Utils.shuffle(others).slice(0, 3).map(o => `${o.eum} [${o.meaning}]`)
    ]);

    quizChoices.forEach((btn, i) => {
        btn.textContent = choices[i];
        btn.onclick = () => checkAnswer(choices[i], `${q.eum} [${q.meaning}]`);
    });
}

const writingQuizContainer = $('writingQuizContainer');
const writingHintBtn = $('writingHintBtn');
const writingFinishBtn = $('writingFinishBtn');
const writingResetBtn = $('writingResetBtn');

function setupWritingQuiz(q) {
    phaseBadge.textContent = '한자 쓰기';
    $('phase1Area').style.display = 'none';
    $('phase3Area').style.display = 'block';
    $('quizChoices').style.display = 'none';
    $('writingQuestionLabel').textContent = `[ ${q.eum} (${q.meaning}) ] 을(를) 써보세요`;
    phaseFeedback.style.display = 'none';

    writingQuizContainer.innerHTML = '';
    writerInstance = HanziWriter.create('writingQuizContainer', q.hanja, {
        width: 250,
        height: 250,
        showCharacter: false,
        showOutline: true,
        strokeColor: '#4facfe',
        outlineColor: 'rgba(255,255,255,0.05)',
        drawingColor: '#00f2fe',
        drawingWidth: 20,
        padding: 5
    });
    writerInstance.quiz();
}

function checkAnswer(selected, correct) {
    if (isPhaseTransition) return;
    isPhaseTransition = true;

    const isOk = selected === correct;
    if (isOk) {
        quizScore += 10;
        quizSessionData.currentScore++;
    }
    
    quizHistory.push({ word: quizWords[quizIndex].hanja, isOk });

    // 오답 노트 저장
    if (typeof WrongNote !== 'undefined') {
        const q = quizWords[quizIndex];
        const status = isOk ? 'correct' : 'wrong';
        const lvName = document.querySelector('.level-btn.active')?.textContent || '기본';
        WrongNote.save('hanja', {
            hanja: q.hanja,
            meaning: q.meaning,
            eum: q.eum,
            level: lvName
        }, status, quizSessionData.id, quizSessionData.roundCount);
    }
    
    phaseFeedback.textContent = isOk ? '정답입니다! ✨' : `아쉬워요! 정답은 [ ${correct} ] 입니다.`;
    phaseFeedback.className = `phase-feedback ${isOk ? 'correct' : 'wrong'}`;
    phaseFeedback.style.display = 'block';

    setTimeout(() => {
        isPhaseTransition = false;
        nextQuestion();
    }, 1500);
}

function nextQuestion() {
    quizIndex++;
    if (quizIndex < quizWords.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    quizProgressBar.style.width = '100%';
    resultScore.textContent = `${quizScore} / ${quizWords.length * 10}점`;
    
    // 최초 점수 기록
    if (quizSessionData.initialScore === null) {
        quizSessionData.initialScore = quizSessionData.currentScore;
    }

    scoreCard.innerHTML = '';
    retryWrongList = [];
    
    quizHistory.forEach((r, i) => {
        const row = document.createElement('div');
        row.className = 'score-row';
        const badge = r.isOk ? '<span class="sc-badge pass">PASS</span>' : '<span class="sc-badge fail">FAIL</span>';
        
        const wData = vocabHanja[currentLevel].find(v => v.hanja === r.word);
        let expBoxHtml = '';
        let expHtml = '';
        
        if (currentMode === 'study' || !r.isOk) {
            let exText = `<br>부수: ${wData.radical}`;
            if (wData.idiom) exText += `<br>사자성어: ${wData.idiom} (${wData.idiomMean})`;
            if (wData.synonym) exText += `<br>유의어: ${wData.synonym}`;
            if (wData.antonym) exText += `<br>반의어: ${wData.antonym}`;
            expBoxHtml = `<div id="exp_${i}" class="result-explanation-box" style="margin-top:10px;">[ ${wData.meaning} ] ${wData.eum}${exText}</div>`;
        } else {
            expHtml = !r.isOk ? `<span style="font-size:0.8rem; color:#ff5252; margin-left:auto;">다시 풀기</span>` : '';
        }

        row.innerHTML = `
            <div style="display:flex; flex-direction:column; width:100%;">
                <div class="sc-top" style="display:flex; align-items:center; flex-wrap:wrap; width:100%; gap:10px;">
                    <span class="sc-num">Q${i+1}</span>
                    <span class="sc-word">${r.word}</span>
                    ${expHtml}
                </div>
                <div class="sc-badges" style="margin-top:8px;">${badge}</div>
                ${expBoxHtml}
            </div>
        `;
        scoreCard.appendChild(row);
        if (!r.isOk) retryWrongList.push(r.word);
    });

    const isCompleted = (retryWrongList.length === 0);
    const timeSpent = Math.floor((Date.now() - quizSessionData.startTime) / 1000);

    if (typeof saveQuizResult === 'function') {
        const lvName = document.querySelector('.level-btn.active').textContent;
        saveQuizResult(quizSessionData.id, 'hanja', lvName, quizSessionData.total, quizSessionData.currentScore, quizSessionData.initialScore, timeSpent, isCompleted);
        
        const result = UserSession.addEXP(quizScore);
        if (result && result.levelUp) {
            alert(`🎊 축하합니다! 레벨 ${(result.user.level)}로 레벨업하셨습니다!`);
        }
    }

    if (retryWrongList.length > 0) {
        retryWrongBtn.style.display = '';
        retryWrongBtn.textContent = `🔄 틀린 ${retryWrongList.length}문제 다시 풀기`;
        retryBtn.style.display = 'none';
    } else {
        retryWrongBtn.style.display = 'none';
        retryBtn.style.display = '';
    }
    
    if (kakaoReportBtn) kakaoReportBtn.style.display = 'block';
    resultModal.classList.remove('hidden');
}

// ============================================================
// MODE & EVENTS
// ============================================================
function setMode(mode) {
    currentMode = mode;
    isPhaseTransition = false;
    if (mode === 'study') {
        studyModeBtn.classList.add('active'); quizModeBtn.classList.remove('active');
        studyView.classList.add('view-active'); studyControls.classList.add('view-active');
        quizView.classList.remove('view-active');
        studyWords = Utils.shuffle([...vocabHanja[currentLevel]]);
        currentIndex = 0;
        updateCard();
    } else {
        quizModeBtn.classList.add('active'); studyModeBtn.classList.remove('active');
        quizView.classList.add('view-active');
        studyView.classList.remove('view-active'); studyControls.classList.remove('view-active');
        startQuiz();
    }
}

nextBtn.addEventListener('click', handleNext);
prevBtn.addEventListener('click', handlePrev);
studyModeBtn.addEventListener('click', () => setMode('study'));
quizModeBtn.addEventListener('click', () => setMode('quiz'));

retryBtn.addEventListener('click', () => { resultModal.classList.add('hidden'); startQuiz(); });
retryWrongBtn.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    const wrongWords = vocabHanja[currentLevel].filter(w => retryWrongList.includes(w.hanja));
    startQuiz(wrongWords);
});
studyAgainBtn.addEventListener('click', () => { resultModal.classList.add('hidden'); setMode('study'); });

if (kakaoReportBtn) {
    kakaoReportBtn.addEventListener('click', () => {
        const pct = Math.round((quizSessionData.currentScore / quizSessionData.total) * 100);
        const lvName = document.querySelector('.level-btn.active').textContent;
        KakaoShare.sendReport('hanja', quizSessionData.currentScore, quizSessionData.total, pct, quizSessionData.initialScore, quizSessionData.roundCount, {
            sessionId: quizSessionData.id,
            levelInfo: lvName,
            startTime: quizSessionData.startTime,
            endTime: Date.now()
        });
    });
}

writingHintBtn.addEventListener('click', () => {
    if (writerInstance) {
        writerInstance.cancelQuiz();
        writerInstance.animateCharacter({ onComplete: () => { writerInstance.quiz(); } });
    }
});

writingFinishBtn.addEventListener('click', () => {
    if (isPhaseTransition) return;
    const q = quizWords[quizIndex];
    checkAnswer(`${q.eum} [${q.meaning}]`, `${q.eum} [${q.meaning}]`); // 한자 쓰기는 일단 완료하면 정답 처리 (HanziWriter 내부 체크 로직 연동 가능하나 간소화)
});

writingResetBtn.addEventListener('click', () => { if (writerInstance) writerInstance.quiz(); });

levelBtns.forEach(btn => {
    if (btn.classList.contains('disabled')) return;
    btn.addEventListener('click', () => {
        levelBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLevel = btn.dataset.level;
        currentIndex = 0;
        if (currentMode === 'study') { studyWords = Utils.shuffle([...vocabHanja[currentLevel]]); updateCard(); }
        else { startQuiz(); }
    });
});

toggleEumBtn.addEventListener('click', () => {
    isIdiomEumVisible = !isIdiomEumVisible;
    idiomEumEl.classList.toggle('hidden', !isIdiomEumVisible);
    toggleEumBtn.innerHTML = isIdiomEumVisible ? '🔉 독음 숨기기' : '🔉 독음 보기';
});

toggleMeanBtn.addEventListener('click', () => {
    isIdiomMeanVisible = !isIdiomMeanVisible;
    idiomMeanEl.classList.toggle('hidden', !isIdiomMeanVisible);
    toggleMeanBtn.innerHTML = isIdiomMeanVisible ? '📖 뜻 숨기기' : '📖 뜻 보기';
});

studyStrokeBtn.addEventListener('click', () => {
    const d = studyWords[currentIndex];
    if (!studyWriterInstance) {
        studyStrokeContainer.innerHTML = '';
        studyStrokeContainer.classList.add('active');
        studyStrokeBtn.innerHTML = '✨ 애니메이션 재생 중...';
        studyWriterInstance = HanziWriter.create('studyStrokeContainer', d.hanja, {
            width: 200, height: 200, showCharacter: false, showOutline: true, strokeColor: '#4facfe',
            outlineColor: 'rgba(255,255,255,0.05)', padding: 5
        });
        studyWriterInstance.animateCharacter({ onComplete: () => { studyStrokeBtn.innerHTML = '🖌️ 획순 다시 보기'; } });
    } else { studyWriterInstance.animateCharacter(); }
});

// ============================================================
// APP ENTRY POINT (EXPLICIT INIT)
// ============================================================
window.HanjaEngine = {
    init: function() {
        console.log('[HanjaEngine] Initializing...');
        const data = window.vocabHanja || {};
        if (Object.keys(data).length === 0) return false;
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode') === 'review' ? 'quiz' : 'study';
        setMode(mode);
        return true;
    }
};

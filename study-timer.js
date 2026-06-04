/**
 * StudyTimer — 과목별 최소 학습 시간 관리
 *
 * - 관리자가 각 과목별 최소 학습 시간(분)을 설정
 * - 오늘 날짜 기준 유저별/과목별 누적 학습 시간 추적 (LocalStorage)
 * - 최소 시간 미충족 시 퀴즈 버튼 잠금
 */
const StudyTimer = (() => {
    const CONFIG_KEY  = 'SmartStudy_MinStudyConfig';
    const TIME_PREFIX = 'SmartStudy_DailyTime_';

    const DEFAULTS = { english: 5, hanja: 5, math: 5 };

    // ── 설정 ──────────────────────────────────────────
    function getConfig() {
        try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(CONFIG_KEY))); }
        catch { return { ...DEFAULTS }; }
    }

    function setConfig(cfg) {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    }

    // ── 누적 시간 ─────────────────────────────────────
    function _todayKey(subject) {
        const user  = (typeof UserSession !== 'undefined' ? UserSession.getActiveUser() : null) || 'guest';
        const today = new Date().toISOString().slice(0, 10);
        return `${TIME_PREFIX}${user}_${subject}_${today}`;
    }

    function getAccumulated(subject) {
        return parseInt(localStorage.getItem(_todayKey(subject)) || '0', 10);
    }

    function _addSeconds(subject, seconds) {
        localStorage.setItem(_todayKey(subject), String(getAccumulated(subject) + seconds));
    }

    // ── 잠금 판단 ─────────────────────────────────────
    function getRequiredSeconds(subject) {
        return (getConfig()[subject] ?? DEFAULTS[subject]) * 60;
    }

    function isUnlocked(subject) {
        const req = getRequiredSeconds(subject);
        return req <= 0 || getAccumulated(subject) >= req;
    }

    // ── 타이머 시작 ───────────────────────────────────
    // onTick(accSec, reqSec) 1초마다 호출, stop 함수 반환
    function start(subject, onTick) {
        let lastTs = Date.now();
        onTick && onTick(getAccumulated(subject), getRequiredSeconds(subject));
        const id = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - lastTs) / 1000);
            if (elapsed > 0) { _addSeconds(subject, elapsed); lastTs = now; }
            onTick && onTick(getAccumulated(subject), getRequiredSeconds(subject));
        }, 1000);
        return () => clearInterval(id);
    }

    // ── UI 바 초기화 ──────────────────────────────────
    // quizBtn: 퀴즈 모드 버튼 엘리먼트
    // 반환: { startTimer(), stopTimer() }
    function initBar(subject, quizBtn) {
        // 기존 바 제거 후 재생성
        let bar = document.getElementById('studyTimerBar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'studyTimerBar';
            const modeToggle = document.querySelector('.mode-toggle');
            if (modeToggle) modeToggle.insertAdjacentElement('afterend', bar);
        }

        let stopFn = null;

        function updateUI(accSec, reqSec) {
            const unlocked = accSec >= reqSec;
            const pct = reqSec > 0 ? Math.min(100, Math.round(accSec / reqSec * 100)) : 100;
            const remaining = Math.max(0, reqSec - accSec);
            const remMin = Math.floor(remaining / 60);
            const remSec = remaining % 60;
            const accMin = Math.floor(accSec / 60);
            const accSecDisp = accSec % 60;

            if (unlocked) {
                bar.innerHTML = `<div class="stb-unlocked">✅ 오늘 학습 완료! 퀴즈를 풀 수 있어요 🎉</div>`;
                quizBtn.disabled = false;
                quizBtn.classList.remove('stb-locked');
                quizBtn.title = '';
            } else {
                bar.innerHTML = `
                    <div class="stb-inner">
                        <span class="stb-label">📚 ${accMin}분 ${String(accSecDisp).padStart(2,'0')}초 학습</span>
                        <div class="stb-track"><div class="stb-fill" style="width:${pct}%"></div></div>
                        <span class="stb-remain">🔒 ${remMin}분 ${String(remSec).padStart(2,'0')}초 남음</span>
                    </div>`;
                quizBtn.disabled = true;
                quizBtn.classList.add('stb-locked');
                quizBtn.title = `퀴즈까지 ${remMin}분 ${String(remSec).padStart(2,'0')}초 더 학습하세요`;
            }
        }

        function startTimer() {
            if (stopFn) stopFn();
            stopFn = start(subject, updateUI);
        }

        function stopTimer() {
            if (stopFn) { stopFn(); stopFn = null; }
            updateUI(getAccumulated(subject), getRequiredSeconds(subject));
        }

        // 초기 렌더 (타이머 없이)
        updateUI(getAccumulated(subject), getRequiredSeconds(subject));

        return { startTimer, stopTimer };
    }

    return { getConfig, setConfig, getAccumulated, getRequiredSeconds, isUnlocked, start, initBar, DEFAULTS };
})();

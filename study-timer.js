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
        // 관리자 설정을 전체 유저에게 공유 (Firestore 전역 config)
        if (typeof FireSync !== 'undefined' && FireSync.uploadStudyConfig) {
            FireSync.uploadStudyConfig(cfg);
        }
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

    // ── 비활동 감지 ───────────────────────────────────
    const IDLE_LIMIT = 15; // 초: 이 시간 동안 입력 없으면 타이머 일시정지
    const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

    // onIdle(isIdle) 콜백과 함께 비활동 감지 시작, stop 함수 반환
    function watchActivity(onIdle) {
        let idleSec = 0;
        let idle = false;

        function onActivity() {
            idleSec = 0;
            if (idle) { idle = false; onIdle(false); }
        }

        ACTIVITY_EVENTS.forEach(ev => window.addEventListener(ev, onActivity, { passive: true }));

        const id = setInterval(() => {
            idleSec++;
            if (!idle && idleSec >= IDLE_LIMIT) { idle = true; onIdle(true); }
        }, 1000);

        return () => {
            clearInterval(id);
            ACTIVITY_EVENTS.forEach(ev => window.removeEventListener(ev, onActivity));
        };
    }

    // ── 타이머 시작 ───────────────────────────────────
    // onTick(accSec, reqSec, isIdle) 1초마다 호출, stop 함수 반환
    function start(subject, onTick) {
        let lastTs = Date.now();
        let paused = false;

        onTick && onTick(getAccumulated(subject), getRequiredSeconds(subject), false);

        const stopActivity = watchActivity((isIdle) => {
            paused = isIdle;
            if (!isIdle) lastTs = Date.now(); // 재개 시 기준 시각 초기화
            onTick && onTick(getAccumulated(subject), getRequiredSeconds(subject), isIdle);
        });

        const id = setInterval(() => {
            if (!paused) {
                const now = Date.now();
                const elapsed = Math.floor((now - lastTs) / 1000);
                if (elapsed > 0) { _addSeconds(subject, elapsed); lastTs = now; }
            }
            onTick && onTick(getAccumulated(subject), getRequiredSeconds(subject), paused);
        }, 1000);

        return () => { clearInterval(id); stopActivity(); };
    }

    // ── 토스트 메시지 ─────────────────────────────────
    function _showToast(msg) {
        let toast = document.getElementById('stbToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'stbToast';
            toast.className = 'stb-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('stb-toast-show');
        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(() => toast.classList.remove('stb-toast-show'), 2500);
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
        let _lastRemain = 0; // 잠금 클릭 시 메시지용

        // 잠긴 상태에서 클릭 시 안내 메시지
        if (quizBtn) quizBtn.addEventListener('click', (e) => {
            if (quizBtn.classList.contains('stb-locked')) {
                e.stopImmediatePropagation();
                const remMin = Math.floor(_lastRemain / 60);
                const remSec = _lastRemain % 60;
                const timeStr = remMin > 0
                    ? `${remMin}분 ${String(remSec).padStart(2,'0')}초`
                    : `${remSec}초`;
                _showToast(`📚 퀴즈를 풀려면 ${timeStr} 더 학습해야 해요!`);
            }
        }, true); // capture 단계에서 처리

        function updateUI(accSec, reqSec, isIdle = false) {
            const unlocked = accSec >= reqSec;
            const pct = reqSec > 0 ? Math.min(100, Math.round(accSec / reqSec * 100)) : 100;
            const remaining = Math.max(0, reqSec - accSec);
            _lastRemain = remaining;
            const remMin = Math.floor(remaining / 60);
            const remSec = remaining % 60;
            const accMin = Math.floor(accSec / 60);
            const accSecDisp = accSec % 60;

            if (unlocked) {
                bar.innerHTML = `<div class="stb-unlocked">✅ 오늘 학습 완료! 퀴즈를 풀 수 있어요 🎉</div>`;
                if (quizBtn) { quizBtn.disabled = false; quizBtn.classList.remove('stb-locked'); quizBtn.title = ''; }
            } else if (isIdle) {
                bar.innerHTML = `
                    <div class="stb-inner stb-idle">
                        <span class="stb-label">💤 자리 비움 감지 — 타이머 일시정지</span>
                        <div class="stb-track"><div class="stb-fill" style="width:${pct}%; opacity:0.4;"></div></div>
                        <span class="stb-remain" style="color:var(--text-sub);">화면을 터치하세요</span>
                    </div>`;
                if (quizBtn) { quizBtn.disabled = false; quizBtn.classList.add('stb-locked'); }
            } else {
                bar.innerHTML = `
                    <div class="stb-inner">
                        <span class="stb-label">📚 ${accMin}분 ${String(accSecDisp).padStart(2,'0')}초 학습</span>
                        <div class="stb-track"><div class="stb-fill" style="width:${pct}%"></div></div>
                        <span class="stb-remain">🔒 ${remMin}분 ${String(remSec).padStart(2,'0')}초 남음</span>
                    </div>`;
                if (quizBtn) { quizBtn.disabled = false; quizBtn.classList.add('stb-locked'); }
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

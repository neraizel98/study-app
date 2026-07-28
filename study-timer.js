/**
 * 과목/단원별 적응형 학습 잠금
 *
 * - 관리자 기본시간과 최근 3회 최초 점수 평균을 함께 사용
 * - 90점 이상: 면제 / 80점 이상: 5분 / 70점 이상: 10분 / 70점 미만: 15분
 * - 90점 미만은 관리자 기본시간과 점수별 시간 중 더 긴 시간을 적용
 * - 화면이 보이고 실제 학습 모드이며 최근 학습 행동이 있을 때만 시간 누적
 */
const StudyTimer = (() => {
    const CONFIG_KEY = 'SmartStudy_MinStudyConfig';
    const TIME_PREFIX = 'SmartStudy_UnitTime_';
    const SCORE_PREFIX = 'SmartStudy_AdaptiveScores_';
    const REPORT_PREFIX = 'SmartVocab_Reports_';
    const DEFAULTS = { english: 5, grammar: 5, hanja: 5, math: 5 };
    const ACTIVITY_LIMIT_MS = 45 * 1000;
    const ACTIVITY_EVENTS = ['click', 'keydown', 'touchstart', 'scroll'];

    function getUserId() {
        return (typeof UserSession !== 'undefined' ? UserSession.getActiveUser() : null) || 'guest';
    }

    function getConfig() {
        try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}')); }
        catch { return { ...DEFAULTS }; }
    }

    function setConfig(cfg) {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    }

    function normalize(value) {
        return String(value || '').replace(/\s+/g, '').toLowerCase();
    }

    function matchesAlias(level, target) {
        if (level === target) return true;
        if (!level.startsWith(target)) return false;

        // 퀴즈 유형처럼 단원명 뒤에 구분자가 붙는 경우만 허용한다.
        // 단순 부분 일치는 "6급"과 "준6급" 같은 서로 다른 급수를 섞는다.
        const suffix = level.slice(target.length);
        return /^[-:()[\]{}]/.test(suffix);
    }

    function contextKey(subject, context) {
        return `${subject}:${context || 'default'}`;
    }

    function timeKey(subject, context) {
        const today = new Date().toISOString().slice(0, 10);
        return `${TIME_PREFIX}${getUserId()}_${encodeURIComponent(contextKey(subject, context))}_${today}`;
    }

    function getAccumulated(subject, context = 'default') {
        return parseInt(localStorage.getItem(timeKey(subject, context)) || '0', 10);
    }

    function addSeconds(subject, context, seconds) {
        localStorage.setItem(timeKey(subject, context), String(getAccumulated(subject, context) + seconds));
    }

    function resetAccumulated(subject, context = 'default') {
        localStorage.setItem(timeKey(subject, context), '0');
    }

    function getScoreStore() {
        try { return JSON.parse(localStorage.getItem(SCORE_PREFIX + getUserId()) || '{}'); }
        catch { return {}; }
    }

    function getReportScores(subject, aliases) {
        if (!aliases || aliases.length === 0) return [];
        let reports = [];
        try { reports = JSON.parse(localStorage.getItem(REPORT_PREFIX + getUserId()) || '[]'); }
        catch { return []; }

        const targets = aliases.map(normalize).filter(Boolean);
        const matches = reports
            .filter(r => r.subject === subject && r.totalQuestions > 0 && !(r.metadata && r.metadata.review))
            .filter(r => {
                const level = normalize(r.level);
                return targets.some(target => matchesAlias(level, target));
            })
            .sort((a, b) => (b.date || 0) - (a.date || 0));

        return matches.slice(0, 3).map(report => ({
            pct: Math.round((report.initialScore / report.totalQuestions) * 100),
            date: report.date || 0,
            sessionId: report.sessionId || ''
        }));
    }

    function savedScoreHistory(subject, context) {
        const saved = getScoreStore()[contextKey(subject, context)];
        if (!saved) return [];
        if (Array.isArray(saved.history)) return saved.history;
        return Number.isFinite(saved.pct) ? [saved] : [];
    }

    function getRecentScores(subject, context = 'default', aliases = []) {
        const combined = [
            ...getReportScores(subject, aliases),
            ...savedScoreHistory(subject, context)
        ].sort((a, b) => (b.date || 0) - (a.date || 0));
        const unique = [];
        combined.forEach(score => {
            const sameSession = score.sessionId && unique.some(item => item.sessionId === score.sessionId);
            const nearDuplicate = !score.sessionId && unique.some(item =>
                item.pct === score.pct && Math.abs((item.date || 0) - (score.date || 0)) < 5000
            );
            if (!sameSession && !nearDuplicate) unique.push(score);
        });
        return unique.slice(0, 3);
    }

    function getLatestScore(subject, context = 'default', aliases = []) {
        const scores = getRecentScores(subject, context, aliases);
        if (!scores.length) return null;
        return {
            pct: Math.round(scores.reduce((sum, score) => sum + score.pct, 0) / scores.length),
            date: Math.max(...scores.map(score => score.date || 0)),
            count: scores.length,
            scores: scores.map(score => score.pct)
        };
    }

    function getRequiredSeconds(subject, context = 'default', aliases = []) {
        const baseMinutes = Math.max(0, Number(getConfig()[subject] ?? DEFAULTS[subject]));
        const score = getLatestScore(subject, context, aliases);
        if (score && score.pct >= 90) return 0;

        let adaptiveMinutes = 0;
        if (score) {
            if (score.pct >= 80) adaptiveMinutes = 5;
            else if (score.pct >= 70) adaptiveMinutes = 10;
            else adaptiveMinutes = 15;
        }
        return Math.max(baseMinutes, adaptiveMinutes) * 60;
    }

    function isUnlocked(subject, context = 'default', aliases = []) {
        const required = getRequiredSeconds(subject, context, aliases);
        return required <= 0 || getAccumulated(subject, context) >= required;
    }

    function recordResult(subject, context, initialScore, totalQuestions, sessionId = '') {
        if (!context || !totalQuestions) return;
        const store = getScoreStore();
        const key = contextKey(subject, context);
        const history = savedScoreHistory(subject, context);
        const entry = {
            pct: Math.round((initialScore / totalQuestions) * 100),
            date: Date.now(),
            sessionId: sessionId || ''
        };
        const existingIndex = sessionId
            ? history.findIndex(item => item.sessionId === sessionId)
            : -1;
        if (existingIndex >= 0) history[existingIndex] = entry;
        else history.push(entry);
        store[key] = {
            history: history.sort((a, b) => (b.date || 0) - (a.date || 0)).slice(0, 3)
        };
        localStorage.setItem(SCORE_PREFIX + getUserId(), JSON.stringify(store));
        resetAccumulated(subject, context);
    }

    function getStatus(subject, context = 'default', aliases = []) {
        const score = getLatestScore(subject, context, aliases);
        const requiredSeconds = getRequiredSeconds(subject, context, aliases);
        const accumulatedSeconds = getAccumulated(subject, context);
        return {
            score: score ? score.pct : null,
            scoreCount: score ? score.count : 0,
            recentScores: score ? score.scores : [],
            requiredSeconds,
            accumulatedSeconds,
            unlocked: requiredSeconds <= 0 || accumulatedSeconds >= requiredSeconds
        };
    }

    function showToast(msg) {
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
        toast._hideTimer = setTimeout(() => toast.classList.remove('stb-toast-show'), 3000);
    }

    function initBar(subject, quizBtn, options = {}) {
        const getContext = options.getContext || (() => 'default');
        const getAliases = options.getAliases || (() => []);
        const getLabel = options.getLabel || (() => '현재 단원');
        const isLearningActive = options.isLearningActive || (() => true);
        const isLockBypassed = options.isLockBypassed || (() => false);

        let bar = document.getElementById('studyTimerBar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'studyTimerBar';
            const anchor = document.querySelector('.mode-toggle') || document.querySelector('main');
            if (anchor) anchor.insertAdjacentElement('afterend', bar);
        }

        let timerId = null;
        let lastTs = Date.now();
        let lastActivityAt = Date.now();

        const onActivity = () => { lastActivityAt = Date.now(); };
        ACTIVITY_EVENTS.forEach(ev => window.addEventListener(ev, onActivity, { passive: true }));

        function current() {
            const context = getContext() || 'default';
            const status = getStatus(subject, context, getAliases(context) || []);
            if (isLockBypassed()) status.unlocked = true;
            return {
                context,
                aliases: getAliases(context) || [],
                status
            };
        }

        function updateUI(paused = false) {
            const { status } = current();
            const remaining = Math.max(0, status.requiredSeconds - status.accumulatedSeconds);
            const pct = status.requiredSeconds > 0
                ? Math.min(100, Math.round(status.accumulatedSeconds / status.requiredSeconds * 100))
                : 100;
            const scoreText = status.score === null
                ? '첫 퀴즈 전'
                : `최근 ${status.scoreCount}회 평균 ${status.score}점`;

            if (isLockBypassed()) {
                bar.innerHTML = `<div class="stb-unlocked">♻️ 오답 복습 · 학습 시간 없이 바로 퀴즈 가능</div>`;
                if (quizBtn) quizBtn.classList.remove('stb-locked');
            } else if (status.unlocked) {
                bar.innerHTML = `<div class="stb-unlocked">✅ ${getLabel()} 학습 완료 · ${scoreText} · 퀴즈 가능</div>`;
                if (quizBtn) quizBtn.classList.remove('stb-locked');
            } else {
                const remMin = Math.floor(remaining / 60);
                const remSec = remaining % 60;
                const pauseText = paused ? ' · 학습 행동을 확인하면 다시 시작' : '';
                bar.innerHTML = `
                    <div class="stb-inner ${paused ? 'stb-idle' : ''}">
                        <span class="stb-label">📚 ${getLabel()} · ${scoreText}${pauseText}</span>
                        <div class="stb-track"><div class="stb-fill" style="width:${pct}%"></div></div>
                        <span class="stb-remain">⏳ ${remMin}분 ${String(remSec).padStart(2, '0')}초 남음</span>
                    </div>`;
                if (quizBtn) quizBtn.classList.add('stb-locked');
            }
        }

        function canCount() {
            return document.visibilityState === 'visible'
                && document.hasFocus()
                && isLearningActive()
                && Date.now() - lastActivityAt <= ACTIVITY_LIMIT_MS;
        }

        function tick() {
            const now = Date.now();
            const elapsed = Math.floor((now - lastTs) / 1000);
            lastTs = now;
            if (elapsed > 0 && canCount()) {
                const { context, status } = current();
                if (!status.unlocked) addSeconds(subject, context, Math.min(elapsed, 2));
            }
            updateUI(!canCount());
        }

        function startTimer() {
            if (timerId) clearInterval(timerId);
            lastTs = Date.now();
            lastActivityAt = Date.now();
            timerId = setInterval(tick, 1000);
            updateUI(false);
        }

        function stopTimer() {
            if (timerId) clearInterval(timerId);
            timerId = null;
            updateUI(true);
        }

        function refresh() {
            lastTs = Date.now();
            lastActivityAt = Date.now();
            updateUI(false);
        }

        if (quizBtn) {
            quizBtn.addEventListener('click', e => {
                const { status } = current();
                if (!status.unlocked) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    const remaining = status.requiredSeconds - status.accumulatedSeconds;
                    showToast(`🔒 ${getLabel()}을(를) ${Math.ceil(remaining / 60)}분 더 학습해야 합니다.`);
                }
            }, true);
        }

        updateUI(false);
        return { startTimer, stopTimer, refresh, getStatus: () => current().status };
    }

    return {
        DEFAULTS,
        getConfig,
        setConfig,
        getAccumulated,
        getRecentScores,
        getLatestScore,
        getRequiredSeconds,
        getStatus,
        isUnlocked,
        recordResult,
        resetAccumulated,
        initBar,
        showToast
    };
})();

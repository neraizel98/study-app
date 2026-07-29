const MathFormulaTime = (() => {
    const IDLE_LIMIT_MS = 45 * 1000;
    const SAVE_INTERVAL_MS = 5000;
    const ACTIVITY_EVENTS = ['click', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    let lastActivityAt = Date.now();
    let lastTickAt = Date.now();
    let pendingStudy = 0;
    let pendingQuiz = 0;
    let timerId = null;

    const currentMode = () =>
        document.getElementById('quizModeBtn')?.classList.contains('active') ? 'quiz' : 'study';

    const isActive = () =>
        document.visibilityState === 'visible'
        && document.hasFocus()
        && Date.now() - lastActivityAt <= IDLE_LIMIT_MS;

    function record(mode, seconds) {
        const safeSeconds = Math.max(0, Number(seconds) || 0);
        if (mode === 'quiz') pendingQuiz += safeSeconds;
        else pendingStudy += safeSeconds;
    }

    function flush() {
        const studySeconds = Math.floor(pendingStudy);
        const quizSeconds = Math.floor(pendingQuiz);
        if (studySeconds <= 0 && quizSeconds <= 0) return;
        pendingStudy -= studySeconds;
        pendingQuiz -= quizSeconds;

        const user = typeof UserSession !== 'undefined' ? UserSession.getUserData() : null;
        if (!user) return;
        const today = StudyPeriods.daily();
        const previous = user.formulaStudyTime || {};
        const sameDay = previous.date === today;
        user.formulaStudyTime = {
            date: today,
            studySeconds: (sameDay ? previous.studySeconds || 0 : 0) + studySeconds,
            quizSeconds: (sameDay ? previous.quizSeconds || 0 : 0) + quizSeconds,
            totalStudySeconds: (previous.totalStudySeconds || 0) + studySeconds,
            totalQuizSeconds: (previous.totalQuizSeconds || 0) + quizSeconds
        };
        UserSession.saveUserData(user);
    }

    function tick() {
        const now = Date.now();
        const delta = Math.min(2, Math.max(0, (now - lastTickAt) / 1000));
        lastTickAt = now;
        if (!isActive()) return;
        record(currentMode(), delta);
    }

    function init() {
        if (typeof UserSession === 'undefined' || typeof StudyPeriods === 'undefined') return;
        const onActivity = () => { lastActivityAt = Date.now(); };
        ACTIVITY_EVENTS.forEach(event => window.addEventListener(event, onActivity, { passive: true }));
        window.addEventListener('focus', onActivity);
        document.addEventListener('visibilitychange', () => {
            lastTickAt = Date.now();
            if (document.visibilityState !== 'visible') flush();
            else onActivity();
        });
        window.addEventListener('pagehide', flush);
        timerId = setInterval(tick, 1000);
        setInterval(flush, SAVE_INTERVAL_MS);
    }

    return { init, flush, record, currentMode };
})();

window.MathFormulaTime = MathFormulaTime;
window.addEventListener('DOMContentLoaded', MathFormulaTime.init);

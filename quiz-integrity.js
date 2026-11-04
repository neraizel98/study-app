(function (root) {
    'use strict';
    // Screen-leave and translation records while a child solves a quiz (not while studying).
    // Leaving is recorded, not blocked: screen lock and calls count too, so the notice stays neutral.
    // Pages call start() when the first question appears and pass session.summary() to saveQuizResult.
    const doc = root.document;
    if (!doc) return;
    const EVENT_LIMIT = 20;
    const KEY = 'SmartStudy_QuizIntegrity_';
    // A reload mid-quiz resumes the record; an old record from a past visit does not.
    const RESUME_WINDOW = 30 * 60000;
    const MESSAGES = {
        translator: '퀴즈는 번역기·사전 없이 스스로 풀어요. 화면을 벗어난 기록은 보호자에게 표시돼요.',
        calculator: '계산은 계산기 없이 직접 해요. 화면을 벗어난 기록은 보호자에게 표시돼요.'
    };
    const loadedAt = Date.now();
    const reloaded = (() => {
        try { return root.performance?.getEntriesByType?.('navigation')?.[0]?.type === 'reload'; } catch (_) { return false; }
    })();
    let active = null, activeRecord = null, guardHooked = false, notice = null;

    // sessionStorage is per tab and ends with it; a failed write only loses reload recovery.
    function read(subject) { try { return JSON.parse(root.sessionStorage.getItem(KEY + subject)); } catch (_) { return null; } }
    function write(record) { try { root.sessionStorage.setItem(KEY + record.subject, JSON.stringify({ ...record, updatedAt: Date.now() })); } catch (_) { /* Counting continues in memory. */ } }
    function clear(subject) { try { root.sessionStorage.removeItem(KEY + subject); } catch (_) { /* Nothing to recover. */ } }

    function pushEvent(record, event) { record.events = [...record.events, event].slice(-EVENT_LIMIT); }
    // A leave is counted when it starts; its away time is closed on return or at summary/stop.
    function closeAway(record, end) {
        if (!record.awayStartedAt) return;
        const ms = Math.max(0, end - record.awayStartedAt);
        record.awayMs += ms; record.longestMs = Math.max(record.longestMs, ms);
        const event = record.events.filter(e => e.type === 'leave' && e.at === record.awayStartedAt).at(-1);
        if (event) event.seconds = Math.round(ms / 1000);
        record.awayStartedAt = null;
    }
    function blank(subject, kind, from) {
        return { v: 1, subject, kind, startedAt: Date.now(), leaves: Number(from?.leaves) || 0, awayMs: (Number(from?.awaySeconds) || 0) * 1000,
            longestMs: (Number(from?.longestAwaySeconds) || 0) * 1000, awayStartedAt: null, translationDetected: kind === 'translator' && !!from?.translationDetected,
            translationSignal: kind === 'translator' && from?.translationDetected ? from.translationSignal || 'unknown' : null,
            events: Array.isArray(from?.events) ? from.events.map(e => ({ ...e })).slice(-EVENT_LIMIT) : [] };
    }
    function summarize(record) {
        const copy = { ...record, events: record.events.map(e => ({ ...e })) };
        closeAway(copy, Date.now());
        return { v: 1, kind: copy.kind, leaves: copy.leaves, awaySeconds: Math.round(copy.awayMs / 1000), longestAwaySeconds: Math.round(copy.longestMs / 1000),
            translationDetected: copy.translationDetected, translationSignal: copy.translationSignal, events: copy.events };
    }

    function noteLeave() {
        const record = activeRecord; if (!record || record.awayStartedAt) return;
        const now = Date.now();
        record.leaves += 1; record.awayStartedAt = now; pushEvent(record, { type: 'leave', at: now, seconds: 0 }); write(record);
    }
    function noteReturn(end = Date.now()) {
        const record = activeRecord; if (!record?.awayStartedAt || doc.hidden) return;
        closeAway(record, end); write(record); showNotice(record);
    }
    // The translation guard shows its own overlay and may report repeatedly; keep one record.
    function noteTranslation(signal) {
        const record = activeRecord, guard = root.LearningTranslationGuard;
        if (!record || record.kind !== 'translator' || record.translationDetected) return;
        record.translationDetected = true; record.translationSignal = String(signal || guard?.signal || 'unknown').slice(0, 40);
        pushEvent(record, { type: 'translation', at: Date.now() }); write(record);
    }
    function onVisibility() { if (doc.hidden) noteLeave(); else noteReturn(); }
    // Focus moving inside the page (an input or an iframe) is not a leave.
    function onBlur(event) {
        if (event?.target !== root && event?.target !== doc) return;
        root.setTimeout(() => { if (!doc.hasFocus?.() && doc.activeElement?.tagName !== 'IFRAME') noteLeave(); }, 0);
    }
    function onFocus(event) { if (event?.target === root || event?.target === doc) noteReturn(); }
    function onTranslation(event) { noteTranslation(event?.detail?.signal); }
    function listen(on) {
        const method = on ? 'addEventListener' : 'removeEventListener';
        doc[method]('visibilitychange', onVisibility); doc[method]('learning-translation-detected', onTranslation);
        root[method]('blur', onBlur); root[method]('focus', onFocus);
    }
    // onDetect callbacks cannot be removed, so hook the guard once and route to the active session.
    function hookGuard() {
        const guard = root.LearningTranslationGuard;
        if (guard?.detected) noteTranslation(guard.signal);
        if (guardHooked || typeof guard?.onDetect !== 'function') return;
        guardHooked = true;
        try { guard.onDetect(signal => noteTranslation(signal)); } catch (_) { /* The document event still records detection. */ }
    }

    const STYLE = '.quiz-integrity-notice{position:fixed;inset:0;z-index:2147482000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(43,38,32,.42);font-family:var(--font,sans-serif);color:var(--text,#2b2620)}' +
        '.quiz-integrity-notice[hidden]{display:none}' +
        '.quiz-integrity-card{box-sizing:border-box;width:100%;max-width:360px;padding:24px 20px 20px;border:1px solid var(--card-border,#ede5d6);border-radius:20px;background:var(--card-bg,#ffffff);box-shadow:0 12px 32px rgba(43,38,32,.16);text-align:center}' +
        '.quiz-integrity-card .quiz-integrity-icon{margin:0;font-size:2rem;line-height:1.2}' +
        '.quiz-integrity-card h2{margin:6px 0 8px;font-size:1.15rem;color:var(--text,#2b2620);word-break:keep-all}' +
        '.quiz-integrity-card p{margin:0 0 18px;line-height:1.65;color:var(--text-sub,#6e6559);word-break:keep-all}' +
        '.quiz-integrity-card button{min-width:150px;min-height:48px;padding:12px 22px;border:0;border-radius:14px;background:var(--accent,#23845c);color:#ffffff;font:inherit;font-weight:700;cursor:pointer}' +
        '.quiz-integrity-card button:focus-visible{outline:3px solid var(--accent2,#2e9a6c);outline-offset:3px}';
    function element(tag, className, text) {
        const node = doc.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    }
    function buildNotice() {
        if (!doc.getElementById?.('quizIntegrityStyle')) {
            const style = element('style'); style.id = 'quizIntegrityStyle'; style.textContent = STYLE;
            (doc.head || doc.body).appendChild(style);
        }
        const overlay = element('div', 'quiz-integrity-notice notranslate');
        overlay.setAttribute('translate', 'no'); overlay.setAttribute('lang', 'ko');
        overlay.setAttribute('role', 'alertdialog'); overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'quizIntegrityTitle'); overlay.setAttribute('aria-describedby', 'quizIntegrityMessage');
        const card = element('div', 'quiz-integrity-card'), icon = element('p', 'quiz-integrity-icon', '👀');
        icon.setAttribute('aria-hidden', 'true');
        const title = element('h2', '', '퀴즈 중 화면을 벗어났어요'); title.id = 'quizIntegrityTitle';
        const message = element('p'); message.id = 'quizIntegrityMessage';
        const button = element('button', '', '계속 풀기'); button.type = 'button';
        button.addEventListener('click', hideNotice);
        card.append(icon, title, message, button); overlay.appendChild(card); doc.body.appendChild(overlay);
        return { overlay, message, button };
    }
    function showNotice(record) {
        notice ||= buildNotice();
        notice.message.textContent = `${MESSAGES[record.kind] || MESSAGES.translator} (이번 퀴즈 ${record.leaves}회)`;
        notice.overlay.hidden = false;
        notice.button.focus?.();
    }
    function hideNotice() { if (notice) notice.overlay.hidden = true; }

    // options.continueFrom: a summary from an earlier round of the same report (e.g. retry-wrong),
    // so the saved record keeps accumulating instead of restarting at zero.
    function start({ subject, kind, continueFrom = null } = {}) {
        if (active) active.stop();
        subject = String(subject || 'quiz'); kind = kind === 'calculator' ? 'calculator' : 'translator';
        const saved = read(subject);
        const resumed = reloaded && saved?.v === 1 && saved.kind === kind && Date.now() - Number(saved.updatedAt || 0) < RESUME_WINDOW;
        const record = resumed ? saved : blank(subject, kind, continueFrom);
        let final = null;
        const session = {
            summary: () => final ? { ...final, events: final.events.map(e => ({ ...e })) } : summarize(record),
            stop() {
                if (final) return session.summary();
                closeAway(record, Date.now()); final = summarize(record);
                if (active === session) { active = activeRecord = null; listen(false); hideNotice(); }
                clear(subject);
                return session.summary();
            }
        };
        active = session; activeRecord = record; listen(true); write(record); hookGuard();
        // The page closed while away (reload): the away time ends when this page came back.
        if (resumed && record.awayStartedAt) noteReturn(Math.max(record.awayStartedAt, loadedAt));
        return session;
    }

    root.QuizIntegrity = { start, current: () => active };
})(window);

(function (root) {
    'use strict';
    // A web page can request no translation and suppress its text menu. It cannot
    // control OS screenshots, camera/OCR translation, or browser overrides.
    const doc = root.document;
    if (!doc || !doc.documentElement.hasAttribute('data-learning-translation-guard')) return;
    const html = doc.documentElement;
    // Keep answer editing, selection and accessibility tools in text fields.
    const EDITABLE = 'input, textarea, [contenteditable="true"], [contenteditable=""], [role="textbox"], [data-allow-selection]';
    const block = event => {
        const target = event.target?.closest ? event.target : event.target?.parentElement;
        if (!target?.closest(EDITABLE)) event.preventDefault();
    };
    // Copy, cut and text drag would carry lesson text into a translator app.
    for (const type of ['contextmenu', 'copy', 'cut', 'dragstart']) doc.addEventListener(type, block);

    // Forced translation ignores translate="no". Count only translator fingerprints,
    // never ordinary re-rendering: the app never writes <font> or html lang/class.
    const PHRASE = 'Read the original sentence carefully.';
    const originalLang = html.getAttribute('lang') || '';
    const listeners = [];
    let detected = false, signal = null, observers = [];
    root.LearningTranslationGuard = {
        get detected() { return detected; },
        get signal() { return signal; },
        onDetect(callback) {
            if (typeof callback !== 'function') return;
            if (detected) callback(signal); else listeners.push(callback);
        }
    };

    function report(name) {
        if (detected) return;
        detected = true;
        signal = name;
        observers.forEach(observer => observer.disconnect());
        showOverlay();
        listeners.splice(0).forEach(callback => { try { callback(name); } catch (error) { root.console?.error(error); } });
        doc.dispatchEvent(new root.CustomEvent('learning-translation-detected', { detail: { signal: name } }));
    }

    // Chrome/Google Translate mark <html> with translated-ltr/rtl and often swap lang.
    function checkRoot() {
        if (html.classList.contains('translated-ltr') || html.classList.contains('translated-rtl')) report('html-class');
        else if ((html.getAttribute('lang') || '') !== originalLang) report('html-lang');
    }
    // Google Translate wraps each translated run in <font style="vertical-align: inherit;">.
    const hasFont = node => node.nodeType === 1 &&
        (node.nodeName === 'FONT' || node.getElementsByTagName('font').length > 0);

    // English canary that opts in to translation, so any translator changes it.
    // Offscreen rather than display:none, since translators skip hidden text.
    const sentinel = doc.createElement('span');
    sentinel.className = 'learning-translation-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.setAttribute('translate', 'yes');
    sentinel.setAttribute('lang', 'en');
    sentinel.textContent = PHRASE;
    doc.body.appendChild(sentinel);
    const checkSentinel = () => { if (sentinel.textContent.trim() !== PHRASE) report('sentinel'); };

    if (root.MutationObserver) {
        const rootObserver = new root.MutationObserver(checkRoot);
        rootObserver.observe(html, { attributes: true, attributeFilter: ['class', 'lang'] });
        const bodyObserver = new root.MutationObserver(records => {
            for (const record of records) {
                for (const node of record.addedNodes || []) if (hasFont(node)) return report('font');
            }
            checkSentinel();
        });
        bodyObserver.observe(doc.body, { childList: true, subtree: true, characterData: true });
        observers = [rootObserver, bodyObserver];
    }
    checkRoot();
    if (!detected && doc.body.getElementsByTagName('font').length) report('font');

    function showOverlay() {
        const overlay = doc.createElement('div');
        overlay.className = 'learning-translation-overlay notranslate';
        overlay.setAttribute('translate', 'no');
        overlay.setAttribute('lang', 'ko');
        overlay.setAttribute('role', 'alertdialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'learningTranslationTitle');
        overlay.innerHTML = '<div class="learning-translation-card">' +
            '<h2 id="learningTranslationTitle">번역 기능이 켜져 있어요</h2>' +
            '<p>학습 내용은 원문으로 공부해야 해요. 브라우저의 번역을 끄고 새로고침해 주세요.</p>' +
            '<button type="button">새로고침</button></div>';
        const button = overlay.querySelector('button');
        button.addEventListener('click', () => root.location.reload());
        doc.body.appendChild(overlay);
        button.focus?.();
    }
})(window);

(function () {
    const STORAGE_KEY = 'smartStudyEnglishAccent';
    const ACCENTS = {
        us: { lang: 'en-US', label: '미국식', flag: '🇺🇸' },
        uk: { lang: 'en-GB', label: '영국식', flag: '🇬🇧' }
    };
    function readAccent() {
        return window.SmartStudy?.LocalRepository?.getPreference(STORAGE_KEY, 'us') === 'uk' ? 'uk' : 'us';
    }

    let accent = readAccent();

    function isMobileDevice() {
        return /Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator?.userAgent || '');
    }

    function voiceScore(voice, accentId) {
        const language = String(voice.lang || '').replace('_', '-').toLowerCase();
        const name = String(voice.name || '').toLowerCase();
        const target = ACCENTS[accentId].lang.toLowerCase();
        const preferred = accentId === 'uk'
            ? /daniel|serena|kate|hazel|george|susan|sonia|ryan|libby|uk english|british/
            : /samantha|alex|david|zira|mark|aria|jenny|guy|us english|american/;
        let score = language === target ? 100 : language.startsWith('en') ? 10 : -1000;
        if (preferred.test(name)) score += 80;
        if (/natural|neural|premium|enhanced|google|microsoft/.test(name)) score += 30;
        if (/korean|한국/.test(name) || language.startsWith('ko')) score = -1000;
        return score;
    }

    function desktopVoice(accentId) {
        if (isMobileDevice() || !('speechSynthesis' in window)) return null;
        return window.speechSynthesis.getVoices()
            .filter(voice => voiceScore(voice, accentId) > 0)
            .sort((a, b) => voiceScore(b, accentId) - voiceScore(a, accentId))[0] || null;
    }

    function waitForDesktopVoice(accentId) {
        const current = desktopVoice(accentId);
        if (current || isMobileDevice()) return Promise.resolve(current);
        return new Promise(resolve => {
            let settled = false;
            const finish = () => {
                if (settled) return;
                settled = true;
                window.speechSynthesis.removeEventListener?.('voiceschanged', finish);
                resolve(desktopVoice(accentId));
            };
            window.speechSynthesis.addEventListener?.('voiceschanged', finish, { once: true });
            setTimeout(finish, 500);
            window.speechSynthesis.getVoices();
        });
    }

    function updateControls() {
        document.querySelectorAll('[data-english-accent]').forEach(button => {
            const selected = button.dataset.englishAccent === accent;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        document.querySelectorAll('[data-voice-status]').forEach(element => {
            element.textContent = `${ACCENTS[accent].flag} ${ACCENTS[accent].label}`;
        });
    }

    function setAccent(next) {
        if (!ACCENTS[next]) return;
        accent = next;
        window.SmartStudy?.LocalRepository?.setPreference(STORAGE_KEY, accent);
        updateControls();
    }

    async function speak(text, requestedAccent = accent) {
        if (!text || !('speechSynthesis' in window)) return false;
        const selectedAccent = ACCENTS[requestedAccent] ? requestedAccent : accent;
        const settings = ACCENTS[selectedAccent];
        const voice = await waitForDesktopVoice(selectedAccent);
        const utterance = new SpeechSynthesisUtterance(String(text));
        utterance.lang = settings.lang;
        utterance.rate = 0.85;
        utterance.pitch = 1;
        if (voice) utterance.voice = voice;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        return true;
    }

    function bindControls(root = document) {
        root.querySelectorAll('[data-english-accent]').forEach(button => {
            button.addEventListener('click', () => setAccent(button.dataset.englishAccent));
        });
        updateControls();
    }

    if ('speechSynthesis' in window) window.speechSynthesis.addEventListener('voiceschanged', updateControls);
    window.EnglishSpeech = { speak, setAccent, getAccent: () => accent, bindControls, updateControls, desktopVoice, isMobileDevice };
})();

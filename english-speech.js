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

    function availableVoices() {
        return 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [];
    }

    function voiceScore(voice, lang) {
        const name = `${voice.name} ${voice.voiceURI}`.toLowerCase();
        let score = voice.lang.toLowerCase() === lang.toLowerCase() ? 100 : 0;
        if (voice.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase())) score += 10;
        if (/natural|neural|premium|enhanced|google|microsoft|samantha|daniel|serena|sonia|ryan|libby|jenny|aria/.test(name)) score += 30;
        if (/compact|espeak/.test(name)) score -= 20;
        return score;
    }

    function bestVoice(lang) {
        return availableVoices()
            .filter(voice => voice.lang.toLowerCase().startsWith('en'))
            .sort((a, b) => voiceScore(b, lang) - voiceScore(a, lang))[0] || null;
    }

    function updateControls() {
        document.querySelectorAll('[data-english-accent]').forEach(button => {
            const selected = button.dataset.englishAccent === accent;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        const voice = bestVoice(ACCENTS[accent].lang);
        document.querySelectorAll('[data-voice-status]').forEach(element => {
            element.textContent = voice
                ? `${ACCENTS[accent].flag} ${ACCENTS[accent].label} · ${voice.name}`
                : `${ACCENTS[accent].flag} ${ACCENTS[accent].label} · 기기 기본 음성`;
        });
    }

    function setAccent(next) {
        if (!ACCENTS[next]) return;
        accent = next;
        window.SmartStudy?.LocalRepository?.setPreference(STORAGE_KEY, accent);
        updateControls();
    }

    function speak(text, requestedAccent = accent) {
        if (!text || !('speechSynthesis' in window)) return false;
        const selectedAccent = ACCENTS[requestedAccent] ? requestedAccent : accent;
        const settings = ACCENTS[selectedAccent];
        const utterance = new SpeechSynthesisUtterance(String(text));
        const voice = bestVoice(settings.lang);
        utterance.lang = settings.lang;
        utterance.rate = 0.88;
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
    window.EnglishSpeech = { speak, setAccent, getAccent: () => accent, bindControls, updateControls };
})();

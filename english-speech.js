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

    function updateControls() {
        document.querySelectorAll('[data-english-accent]').forEach(button => {
            const selected = button.dataset.englishAccent === accent;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        document.querySelectorAll('[data-voice-status]').forEach(element => {
            element.textContent = `${ACCENTS[accent].flag} ${ACCENTS[accent].label} · 기기 최적 음성`;
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
        utterance.lang = settings.lang;
        utterance.rate = 0.85;
        utterance.pitch = 1;
        // 음성을 명시적으로 고르면 iOS가 저품질 compact 음성을 사용할 수 있다.
        // 지역(lang)만 지정해 운영체제가 가장 자연스러운 음성을 선택하게 둔다.
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

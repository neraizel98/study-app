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

    function normalizedLang(voice) {
        return String(voice?.lang || '').replace('_', '-').toLowerCase();
    }

    function voiceQuality(voice) {
        const name = `${voice.name || ''} ${voice.voiceURI || ''}`.toLowerCase();
        let score = voice.default ? 5 : 0;
        if (/natural|neural|premium|enhanced|siri/.test(name)) score += 100;
        if (/google.*english|microsoft.*(aria|jenny|guy|sonia|ryan|libby)/.test(name)) score += 80;
        if (/samantha|alex|daniel|serena|kate/.test(name)) score += 60;
        if (/compact|espeak/.test(name)) score -= 50;
        return score;
    }

    function nativeVoice(accentId = accent) {
        if (!('speechSynthesis' in window)) return null;
        const language = ACCENTS[accentId]?.lang.toLowerCase();
        return window.speechSynthesis.getVoices()
            .filter(voice => normalizedLang(voice) === language)
            .sort((a, b) => voiceQuality(b) - voiceQuality(a))[0] || null;
    }

    function updateControls() {
        document.querySelectorAll('[data-english-accent]').forEach(button => {
            const selected = button.dataset.englishAccent === accent;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        const voice = nativeVoice(accent);
        document.querySelectorAll('[data-voice-status]').forEach(element => {
            element.textContent = voice
                ? `${ACCENTS[accent].flag} ${ACCENTS[accent].label} 원어민 음성 · ${voice.name}`
                : `${ACCENTS[accent].flag} ${ACCENTS[accent].label} 영어 음성 설치 필요`;
        });
    }

    function setAccent(next) {
        if (!ACCENTS[next]) return;
        accent = next;
        window.SmartStudy?.LocalRepository?.setPreference(STORAGE_KEY, accent);
        updateControls();
    }

    function speak(text, requestedAccent = accent, retry = true) {
        if (!text || !('speechSynthesis' in window)) return false;
        const selectedAccent = ACCENTS[requestedAccent] ? requestedAccent : accent;
        const settings = ACCENTS[selectedAccent];
        const voice = nativeVoice(selectedAccent);
        if (!voice) {
            if (retry) {
                setTimeout(() => speak(text, selectedAccent, false), 250);
                return true;
            }
            updateControls();
            window.alert?.(`${settings.label} 영어 음성이 설치되어 있지 않습니다. 기기 설정에서 ${settings.lang} 영어 음성을 추가해 주세요.`);
            return false;
        }
        const utterance = new SpeechSynthesisUtterance(String(text));
        utterance.lang = settings.lang;
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.voice = voice;
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
    window.EnglishSpeech = { speak, setAccent, getAccent: () => accent, bindControls, updateControls, nativeVoice };
})();

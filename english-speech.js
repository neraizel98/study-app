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

    // Higher is more natural. Neural/premium voices first, Google next; legacy SAPI, compact and novelty voices last.
    const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|fred|good news|hysterical|jester|junior|kathy|organ|princess|ralph|superstar|trinoids|whisper|wobble|zarvox|grandma|grandpa|rocko|shelley|flo|eddy|reed|sandy/;
    function voiceScore(voice, accentId) {
        const language = String(voice.lang || '').replace('_', '-').toLowerCase();
        const name = `${voice.name || ''} ${voice.voiceURI || ''}`.toLowerCase();
        const target = ACCENTS[accentId].lang.toLowerCase();
        if (language.startsWith('ko') || /korean|한국/.test(name)) return -1000;
        let score = language === target ? 100 : language.startsWith('en') ? 10 : -1000;
        if (NOVELTY.test(name) || /espeak/.test(name)) return -500;
        if (/natural|neural|online|premium|enhanced|siri/.test(name)) score += 120;
        if (/google/.test(name)) score += 90;
        const preferred = accentId === 'uk'
            ? /daniel|serena|kate|sonia|ryan|libby|maisie|thomas|arthur|stephanie|jamie|oliver/
            : /ava|allison|susan|zoe|nicky|evan|nathan|joelle|noelle|tom|aria|jenny|guy|ana|michelle|christopher|eric|roger|steffan|emma|brian|andrew|samantha|alex/;
        if (preferred.test(name)) score += 40;
        if (/compact/.test(name)) score -= 60;
        if (/microsoft (zira|david|mark|hazel|george|susan)( desktop)?/.test(name) && !/natural|online/.test(name)) score -= 60;
        return score;
    }

    // Picks only from voices the browser has already listed, so playback can start inside the tap (iOS requirement).
    function bestVoice(accentId) {
        if (!('speechSynthesis' in window)) return null;
        const minimum = isMobileDevice() ? 200 : 1; // phones keep the system default unless a neural/premium voice is installed
        return window.speechSynthesis.getVoices()
            .map(voice => ({ voice, score: voiceScore(voice, accentId) }))
            .filter(item => String(item.voice.lang || '').replace('_', '-').toLowerCase() === ACCENTS[accentId].lang.toLowerCase() && item.score >= minimum)
            .sort((a, b) => b.score - a.score)[0]?.voice || null;
    }

    function desktopVoice(accentId) {
        return isMobileDevice() ? null : bestVoice(accentId);
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

    function play(text, settings, voice) {
        const utterance = new SpeechSynthesisUtterance(String(text));
        utterance.lang = settings.lang;
        utterance.rate = 0.95;
        utterance.pitch = 1;
        if (voice) utterance.voice = voice;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        return true;
    }

    function speak(text, requestedAccent = accent) {
        if (!text || !('speechSynthesis' in window)) return false;
        const selectedAccent = ACCENTS[requestedAccent] ? requestedAccent : accent;
        const settings = ACCENTS[selectedAccent];
        const ready = bestVoice(selectedAccent);
        // Phones (and desktops whose list is ready) speak synchronously inside the tap.
        if (ready || isMobileDevice()) return play(text, settings, ready);
        return waitForDesktopVoice(selectedAccent).then(voice => play(text, settings, voice));
    }

    function bindControls(root = document) {
        root.querySelectorAll('[data-english-accent]').forEach(button => {
            button.addEventListener('click', () => setAccent(button.dataset.englishAccent));
        });
        updateControls();
    }

    if ('speechSynthesis' in window) window.speechSynthesis.addEventListener('voiceschanged', updateControls);
    window.EnglishSpeech = { speak, setAccent, getAccent: () => accent, bindControls, updateControls, desktopVoice, bestVoice, voiceScore, isMobileDevice };
})();

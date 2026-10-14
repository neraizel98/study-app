const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

function load(voices, userAgent) {
    const spoken = [];
    const context = {
        SmartStudy: { LocalRepository: { getPreference: (key, fallback) => fallback, setPreference() {} } },
        document: { querySelectorAll: () => [] },
        navigator: { userAgent },
        setTimeout: handler => handler(),
        SpeechSynthesisUtterance: function (text) { this.text = text; },
        speechSynthesis: { getVoices: () => voices, cancel() {}, speak: u => spoken.push(u), addEventListener() {}, removeEventListener() {} }
    };
    context.window = context;
    vm.createContext(context);
    vm.runInContext(fs.readFileSync('english-speech.js', 'utf8'), context);
    return { speech: context.window.EnglishSpeech, spoken };
}
const v = (name, lang = 'en-US') => ({ name, lang, voiceURI: name });
const DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)';

// Chrome on Windows: the Google voice beats the legacy SAPI voices that used to win.
{
    const { speech } = load([v('Microsoft David - English (United States)'), v('Microsoft Zira - English (United States)'), v('Microsoft Mark - English (United States)'), v('Google US English')], DESKTOP);
    assert.strictEqual(speech.bestVoice('us').name, 'Google US English');
}
// Edge: neural "Online (Natural)" voices are preferred.
{
    const { speech } = load([v('Microsoft Zira - English (United States)'), v('Microsoft Aria Online (Natural) - English (United States)'), v('Google US English')], DESKTOP);
    assert.match(speech.bestVoice('us').name, /Aria Online \(Natural\)/);
}
// macOS: premium voices win and novelty voices are never chosen.
{
    const { speech } = load([v('Albert'), v('Bad News'), v('Samantha'), v('Ava (Premium)')], DESKTOP);
    assert.strictEqual(speech.bestVoice('us').name, 'Ava (Premium)');
    const only = load([v('Albert'), v('Zarvox')], DESKTOP);
    assert.strictEqual(only.speech.bestVoice('us'), null, 'Novelty voices must not be used');
}
// iPhone: keep the system default unless an enhanced/premium voice is installed, and speak synchronously in the tap.
{
    const plain = load([v('Samantha'), v('Albert'), v('Fred')], IPHONE);
    assert.strictEqual(plain.speech.bestVoice('us'), null);
    const result = plain.speech.speak('apple');
    assert.strictEqual(result, true, 'Mobile playback must not wait for a promise');
    assert.strictEqual(plain.spoken.length, 1);
    assert.strictEqual(plain.spoken[0].voice, undefined);
    assert.strictEqual(plain.spoken[0].lang, 'en-US');

    const enhanced = load([v('Samantha'), v('Ava (Enhanced)')], IPHONE);
    enhanced.speech.speak('apple');
    assert.strictEqual(enhanced.spoken[0].voice.name, 'Ava (Enhanced)');
}
// British accent only uses en-GB voices.
{
    const { speech } = load([v('Google US English'), v('Google UK English Female', 'en-GB'), v('Daniel', 'en-GB')], DESKTOP);
    assert.strictEqual(speech.bestVoice('uk').lang, 'en-GB');
}

console.log('English voice ranking verified for Windows Chrome/Edge, macOS and iPhone.');

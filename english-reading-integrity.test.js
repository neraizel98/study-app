const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

(async () => {

const grammarData = fs.readFileSync('EnglishGrammarData.js', 'utf8');
const grammarQuiz = fs.readFileSync('EnglishGrammarQuiz.js', 'utf8');
const grammarContext = { window: {}, Math: Object.create(Math) };
grammarContext.Math.random = () => 0.1;
vm.createContext(grammarContext);
vm.runInContext(grammarData, grammarContext);
vm.runInContext(grammarQuiz, grammarContext);

Object.values(grammarContext.window.EnglishGrammarData).forEach(stage => {
    stage.units.forEach(unit => {
        const questionRuns = Array.from({ length: 20 }, () => grammarContext.window.EnglishGrammarQuiz.generate(unit.id, 10));
        questionRuns.flat().forEach(question => {
            assert.ok(!question.question.includes('다음 잘못된 표현'), `${unit.id}: stacked correction prompt found`);
            assert.ok(!question.question.includes('핵심 규칙'), `${unit.id}: ambiguous rule-selection prompt found`);
            assert.ok(!/only| noun/.test(question.question), `${unit.id}: unnatural placeholder wording found`);
            assert.equal(new Set(question.choices).size, question.choices.length, `${unit.id}: duplicate choices found`);
            assert.equal(question.choices.filter(choice => choice === question.answer).length, 1, `${unit.id}: answer must appear exactly once`);
            if (question.type !== 'choice') {
                assert.ok(!/[+]/.test(question.answer), `${unit.id}: symbolic grammar rule must not become a typed question`);
            }
            if (question.type === 'correction') {
                assert.match(question.question, /^다음 문장을 자연스럽고 문법에 맞게 고쳐 쓰세요\./);
                assert.equal(question.question.split('\n').length, 2, `${unit.id}: correction must contain one target sentence`);
            }
            if (question.type === 'arrange') {
                assert.match(question.question, /^주어진 단어를 자연스러운 영어 문장으로 배열하세요/);
            }
        });
    });
});

let grammarSeed = 0;
grammarContext.Math.random = () => ((grammarSeed++ * 37) % 997) / 997;
const elementaryBeQuestions = Array.from(
    { length: 30 },
    () => grammarContext.window.EnglishGrammarQuiz.generate('e2', 10)
).flat();
assert.ok(elementaryBeQuestions.some(question => question.answer === 'am'));
assert.ok(elementaryBeQuestions.some(question => question.answer === 'are'));
assert.ok(elementaryBeQuestions.some(question => question.answer === 'Is she tired?'));

const spoken = [];
const accentButtons = ['us', 'uk'].map(value => ({
    dataset: { englishAccent: value },
    classList: { toggle() {} },
    setAttribute() {},
    addEventListener(_name, handler) { this.handler = handler; }
}));
const speechContext = {
    SmartStudy: { LocalRepository: { value: {}, getPreference(key, fallback) { return this.value[key] || fallback; }, setPreference(key, value) { this.value[key] = value; } } },
    document: { querySelectorAll(selector) { return selector === '[data-english-accent]' ? accentButtons : []; } },
    navigator: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    setTimeout(handler) { handler(); },
    SpeechSynthesisUtterance: function(text) { this.text = text; },
    speechSynthesis: {
        getVoices: () => [
            { lang: 'en-US', name: 'Microsoft Aria Natural', voiceURI: 'aria' },
            { lang: 'en-GB', name: 'Microsoft Sonia Natural', voiceURI: 'sonia' }
        ],
        cancel() {},
        speak(utterance) { spoken.push(utterance); },
        addEventListener() {},
        removeEventListener() {}
    }
};
speechContext.window = speechContext;
vm.createContext(speechContext);
vm.runInContext(fs.readFileSync('english-speech.js', 'utf8'), speechContext);
await speechContext.window.EnglishSpeech.speak('Good morning.');
assert.equal(spoken.at(-1).lang, 'en-US');
assert.equal(spoken.at(-1).voice.lang, 'en-US');
assert.equal(spoken.at(-1).rate, 0.85);
speechContext.window.EnglishSpeech.setAccent('uk');
await speechContext.window.EnglishSpeech.speak('Good morning.');
assert.equal(spoken.at(-1).lang, 'en-GB');
assert.equal(spoken.at(-1).voice.lang, 'en-GB');

const reading = fs.readFileSync('ReadingApp.js', 'utf8');
const report = fs.readFileSync('report.js', 'utf8');
const vocabPage = fs.readFileSync('english.html', 'utf8');
const grammarApp = fs.readFileSync('EnglishGrammarApp.js', 'utf8');
assert.match(vocabPage, /id="speakWordBtn"[^>]*>🇺🇸 미국식</);
assert.match(vocabPage, /id="speakWordUkBtn"[^>]*>🇬🇧 영국식</);
assert.match(vocabPage, /id="quizSpeakUkBtn"/);
assert.match(grammarApp, /data-accent="us">🇺🇸 미국식 듣기/);
assert.match(grammarApp, /data-accent="uk">🇬🇧 영국식 듣기/);
assert.match(reading, /wrongNoteId: `\$\{passage\.id\}:\$\{item\.id\}`/);
assert.match(reading, /choices: \[\.\.\.item\.renderedChoices\]/);
assert.match(reading, /snapshotId:/);
assert.match(report, /subject === 'grammar' \|\| subject === 'reading'/);
assert.match(report, /questionId: data\.questionId/);

console.log('English speech, grammar prompt, and reading snapshot integrity tests passed.');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});

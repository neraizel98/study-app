const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const grammarData = fs.readFileSync('EnglishGrammarData.js', 'utf8');
const grammarQuiz = fs.readFileSync('EnglishGrammarQuiz.js', 'utf8');
const grammarContext = { window: {}, Math: Object.create(Math) };
grammarContext.Math.random = () => 0.1;
vm.createContext(grammarContext);
vm.runInContext(grammarData, grammarContext);
vm.runInContext(grammarQuiz, grammarContext);

Object.values(grammarContext.window.EnglishGrammarData).forEach(stage => {
    stage.units.forEach(unit => {
        const questions = grammarContext.window.EnglishGrammarQuiz.generate(unit.id, 10);
        questions.forEach(question => {
            assert.ok(!question.question.includes('다음 잘못된 표현'), `${unit.id}: stacked correction prompt found`);
            assert.ok(!/only| noun/.test(question.question), `${unit.id}: unnatural placeholder wording found`);
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
    SpeechSynthesisUtterance: function(text) { this.text = text; },
    speechSynthesis: {
        getVoices: () => [
            { lang: 'en-US', name: 'Microsoft Aria Natural', voiceURI: 'aria' },
            { lang: 'en-GB', name: 'Microsoft Sonia Natural', voiceURI: 'sonia' }
        ],
        cancel() {},
        speak(utterance) { spoken.push(utterance); },
        addEventListener() {}
    }
};
speechContext.window = speechContext;
vm.createContext(speechContext);
vm.runInContext(fs.readFileSync('english-speech.js', 'utf8'), speechContext);
speechContext.window.EnglishSpeech.speak('Good morning.');
assert.equal(spoken.at(-1).lang, 'en-US');
assert.equal(spoken.at(-1).voice, undefined, 'the operating system must choose its best voice');
assert.equal(spoken.at(-1).rate, 0.85);
speechContext.window.EnglishSpeech.setAccent('uk');
speechContext.window.EnglishSpeech.speak('Good morning.');
assert.equal(spoken.at(-1).lang, 'en-GB');
assert.equal(spoken.at(-1).voice, undefined, 'the operating system must choose its best voice');

const reading = fs.readFileSync('ReadingApp.js', 'utf8');
const report = fs.readFileSync('report.js', 'utf8');
assert.match(reading, /wrongNoteId: `\$\{passage\.id\}:\$\{item\.id\}`/);
assert.match(reading, /choices: \[\.\.\.item\.renderedChoices\]/);
assert.match(reading, /snapshotId:/);
assert.match(report, /subject === 'grammar' \|\| subject === 'reading'/);
assert.match(report, /questionId: data\.questionId/);

console.log('English speech, grammar prompt, and reading snapshot integrity tests passed.');

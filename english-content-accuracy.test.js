const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const context = { window: {}, Math: Object.create(Math) };
let seed = 9112026;
context.Math.random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32);
vm.createContext(context);
for (const file of ['EnglishGrammarData.js', 'EnglishGrammarQuiz.js', 'VocabEng.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), context);
}
const main = fs.readFileSync('main.js', 'utf8');
vm.runInContext(main.slice(main.indexOf('function thirdPersonVerb'), main.indexOf('// QUIZ FLOW')), context);
let vocabularyCount = 0;
for (const words of Object.values(context.vocabData)) {
    for (const word of words) {
        vocabularyCount++;
        const verb = word.pos.startsWith('v.');
        const blank = verb ? context.blankVerbSentence(word.ex, word.forms)
            : context.blankNonVerbSentence(word.ex, word.word);
        assert.ok(blank, `${word.word}: actual example must contain a usable target`);
        assert.equal(blank.html.replace('<span class="blank-word">( ___ )</span>', blank.matchedWord), word.ex);
        if (verb) {
            assert.equal(word.tenseExs.length, 3, word.word);
            word.tenseExs.forEach((sentence, index) => {
                const result = context.blankVerbSentence(sentence, word.forms, index);
                assert.ok(result, `${word.word}: tense ${index}`);
                assert.equal(result.html.replace('<span class="blank-word">( ___ )</span>', result.matchedWord), sentence);
            });
        }
    }
}
assert.equal(context.blankVerbSentence('She got a letter.', ['get', 'got', 'gotten']).matchedWord, 'got');
assert.equal(context.blankVerbSentence('She is preparing dinner.', ['prepare', 'prepared', 'prepared']).matchedWord, 'preparing');
assert.equal(context.blankVerbSentence('She wakes up early.', ['wake up', 'woke up', 'woken up'], 0).matchedWord, 'wakes up');
assert.equal(context.blankVerbSentence('No target here.', ['get', 'got', 'gotten']), null);
assert.equal(context.blankNonVerbSentence('No target here.', 'apple'), null);
assert.equal(context.blankNonVerbSentence('Close your eyes.', 'eye').matchedWord, 'eyes');

// Exercise the actual submission handler: a base form or unrelated synonym must
// not be accepted where the sentence requires a different inflection.
const submission = { subjectiveInputEl: { value: '' }, result: null };
submission.finishQuestion = (ok, value) => { submission.result = { ok, value }; };
vm.createContext(submission);
vm.runInContext('let questionResults = [{ qType: 8, word: "get", correctValue: "got" }]; let quizIndex = 0;', submission);
vm.runInContext(main.slice(main.indexOf('function matchesVerbForm('), main.indexOf('function finishQuestion(')), submission);
for (const [input, expected] of [['get', false], ['receive', false], ['got', true], [' GOT ', true]]) {
    submission.subjectiveInputEl.value = input;
    submission.handleQuizSubmit();
    assert.equal(submission.result.ok, expected, input);
}

assert.equal(submission.matchesVerbForm('learnt', 'learned', 'learn', 1), true);
assert.equal(submission.matchesVerbForm('got', 'gotten', 'get', 2), true);
assert.equal(submission.matchesVerbForm('gotten', 'got', 'get', 1), false);
assert.equal(submission.matchesVerbForm('travelled', 'traveled', 'travel', 1), true);

const allWords = Object.values(context.vocabData).flat();
for (const [word, pos] of [['toward', 'prep.'], ['unless', 'conj.'], ['early', 'adv.'], ['straight', 'adv.']]) {
    assert.equal(allWords.find(item => item.word === word).pos, pos);
}

let units = 0, generated = 0;
for (const stage of Object.values(context.window.EnglishGrammarData)) {
    for (const unit of stage.units) {
        units++;
        for (let run = 0; run < 100; run++) {
            const questions = context.window.EnglishGrammarQuiz.generate(unit.id, 100);
            assert.ok(questions.length >= 10, unit.id);
            for (const q of questions) {
                generated++;
                assert.ok(['choice', 'short'].includes(q.type));
                assert.equal(q.choices[q.answerIndex], q.answer);
                assert.equal(new Set(q.choices).size, q.choices.length);
                assert.ok(!q.question.includes('에서 배운 규칙은'));
                if (q.type === 'short') assert.match(q.answer, /^[A-Za-z]+$/);
                if (q.question.startsWith('다음 예문의 뜻')) {
                    const sentence = q.question.replace('다음 예문의 뜻으로 알맞은 것은? ', '');
                    const pairs = unit.lessons.flatMap(lesson => lesson.examples);
                    assert.ok(pairs.some(pair => pair[0] === sentence && pair[1] === q.answer), q.question);
                }
            }
        }
    }
}
console.log(`English content accuracy passed: ${units} grammar units, ${generated} generated questions, ${vocabularyCount} vocabulary examples and all verb tense examples.`);

assert.equal(context.window.EnglishGrammarQuiz.restoreReview('e2', {
    question: '다음 문장을 자연스럽고 문법에 맞게 고쳐 쓰세요.\nI is a student.', answer: 'I am a student.'
}), null);
const restored = context.window.EnglishGrammarQuiz.restoreReview('e2', {
    question: 'I ___ a student.', answer: 'am', choices: ['wrong old content']
});
assert.ok(restored);
assert.equal(restored.answer, 'am');
assert.ok(!restored.choices.includes('wrong old content'));

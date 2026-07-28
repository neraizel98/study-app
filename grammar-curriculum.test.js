const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

let seed = 20260728;
const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
};
const sandbox = { window: {}, Math: Object.create(Math) };
sandbox.Math.random = random;
vm.createContext(sandbox);
for (const file of ['EnglishGrammarData.js', 'EnglishGrammarQuiz.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}

const data = sandbox.window.EnglishGrammarData;
const quiz = sandbox.window.EnglishGrammarQuiz;
assert.deepEqual(Object.keys(data), ['elementary', 'middle', 'middle2', 'middle3']);
assert.equal(data.middle.units.at(-2).id, 'm9');
assert.equal(data.middle.units.at(-1).id, 'm10');
assert.equal(data.middle2.units.length, 6);
assert.equal(data.middle3.units.length, 6);

const testedTypes = new Set();
for (const stage of Object.values(data)) {
    for (const unit of stage.units) {
        assert.ok(unit.lessons.length >= 2, `${unit.id}: lessons`);
        const questions = quiz.generate(unit.id, 10);
        assert.equal(questions.length, 10, `${unit.id}: question count`);
        for (let run = 0; run < 25; run += 1) {
            for (const question of quiz.generate(unit.id, 10)) {
                testedTypes.add(question.type);
                assert.ok(question.answer, `${unit.id}: answer`);
                if (question.type === 'choice') {
                    assert.equal(new Set(question.choices).size, question.choices.length, `${unit.id}: duplicate choices`);
                    assert.ok(question.answerIndex >= 0, `${unit.id}: answer index`);
                } else {
                    assert.match(question.answer, /^[A-Za-z0-9 ,.?!'’+\-()/]+$/, `${unit.id}: English typed answer`);
                }
            }
        }
    }
}
assert.deepEqual([...testedTypes].sort(), ['arrange', 'choice', 'correction', 'short']);
console.log('Grammar curriculum and quiz tests passed.');

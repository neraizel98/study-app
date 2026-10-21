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
for (const file of ['EnglishGrammarData.js', 'EnglishGrammarExpanded.js', 'EnglishGrammarQuiz.js', 'EnglishGrammarAdvancedQuiz.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}

const data = sandbox.window.EnglishGrammarData;
const quiz = sandbox.window.EnglishGrammarQuiz;
assert.deepEqual(Object.keys(data), ['elementary', 'middle', 'middle2', 'middle3', 'high1', 'high2', 'high3']);
assert.equal(data.middle.units.at(-2).id, 'm9');
assert.equal(data.middle.units.at(-1).id, 'm10');
assert.equal(data.middle2.units.length, 6);
assert.equal(data.middle3.units.length, 6);

const testedTypes = new Set();
const ids = new Set();
let lessons = 0;
for (const stage of Object.values(data)) {
    for (const unit of stage.units) {
        assert(!ids.has(unit.id), `${unit.id}: globally unique identifier`);
        ids.add(unit.id);
        assert.ok(unit.lessons.length >= 2, `${unit.id}: lessons`);
        for (const lesson of unit.lessons) {
            lessons++;
            assert(lesson.examples.length >= 3, `${unit.id}: contextual bilingual examples`);
            assert(lesson.examples.every(pair => pair.length === 2 && pair.every(value => typeof value === 'string' && value.length > 0)));
            assert(lesson.steps.length >= 3, `${unit.id}: step-by-step explanation`);
            assert(lesson.detail.length > lesson.principle.length, `${unit.id}: extended principle`);
            assert(lesson.commonError.wrong !== lesson.commonError.correct, `${unit.id}: error contrast`);
            assert(lesson.commonError.reason.length > 12, `${unit.id}: reason for correction`);
            assert(lesson.practice.length >= 1, `${unit.id}: application practice`);
            for (const exercise of lesson.practice) {
                assert.equal(exercise.distractors.length, 3);
                assert.equal(new Set([exercise.answer, ...exercise.distractors]).size, 4, `${unit.id}: practice choice uniqueness`);
                assert(exercise.explanation.length > 10);
            }
        }
        const questions = quiz.generate(unit.id, 10);
        assert.equal(questions.length, 10, `${unit.id}: question count`);
        const weeklyQuestions = quiz.generate(unit.id, 5, 'foundation');
        assert.equal(weeklyQuestions.length, 5, `${unit.id}: weekly foundation count`);
        assert(weeklyQuestions.every(question => question.type === 'choice' && question.choices.length === 4), `${unit.id}: weekly closed-choice contract`);
        for (let run = 0; run < 25; run += 1) {
            for (const question of quiz.generate(unit.id, 10)) {
                testedTypes.add(question.type);
                assert.ok(question.answer, `${unit.id}: answer`);
                if (question.type === 'choice') {
                    assert.equal(new Set(question.choices).size, question.choices.length, `${unit.id}: duplicate choices`);
                    assert.ok(question.answerIndex >= 0, `${unit.id}: answer index`);
                } else {
                    assert.match(question.answer, /^[A-Za-z0-9 ,.?!'’+\-()/°:]+$/, `${unit.id}: English typed answer`);
                }
                const restored = quiz.restoreReview(unit.id, { question: question.question, correctAnswer: question.answer, quizType: question.type });
                assert(restored, `${unit.id}: every generated question is restorable`);
                assert.equal(restored.answer, question.answer, `${unit.id}: review answer stability`);
                if (question.type === 'arrange') {
                    const words = value => value.replace(/[.!?]$/u, '').split(/\s+/).sort();
                    assert.deepEqual([...question.tokens].sort(), words(question.answer), `${unit.id}: complete arrangement word bank`);
                }
            }
        }
        if (/^h[123]u/.test(unit.id)) {
            const types = new Set(quiz.generate(unit.id, 10).map(question => question.type));
            assert.deepEqual([...types].sort(), ['arrange', 'choice', 'correction', 'short'], `${unit.id}: mixed task formats in a single session`);
        }
    }
}
assert.deepEqual([...testedTypes].sort(), ['arrange', 'choice', 'correction', 'short']);
assert.equal(ids.size, 46);
assert.equal(lessons, 92);
for (const stageId of ['high1', 'high2', 'high3']) assert.equal(data[stageId].units.length, 6);
assert.deepEqual([...data.elementary.units.map(unit => unit.id)], ['e1', 'e2', 'e3', 'e4', 'e5', 'e6']);
assert.deepEqual([...data.middle.units.map(unit => unit.id)], Array.from({length: 10}, (_, index) => `m${index + 1}`));
for (const grade of [2, 3]) assert.deepEqual([...data[`middle${grade}`].units.map(unit => unit.id)], Array.from({length: 6}, (_, index) => `n${grade}u${index + 1}`));
assert.equal(quiz.restoreReview('h1u1', { question: 'retired question', answer: 'anything' }), null);
// Historical unexpanded questions still resolve after layering the new bank.
const oldReview = quiz.restoreReview('e3', { question: 'Does Mina ___ milk?', correctAnswer: 'like' });
assert(oldReview);
assert.equal(oldReview.answer, 'like');
console.log(`Grammar curriculum verified: ${ids.size} units, ${lessons} lessons; mixed formats and review restoration passed.`);

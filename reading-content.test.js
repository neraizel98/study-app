const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sandbox = { window: {} };
vm.createContext(sandbox);
for (const file of ['ReadingData.js', 'ReadingPassages.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}

const level = sandbox.window.ReadingData.levels.level1;
const passages = sandbox.window.ReadingPassages;
assert.equal(level.units.length, 8);
for (const unit of level.units) {
    for (const lesson of unit.lessons) {
        assert.ok(lesson.examples.length >= 2, `${unit.id}/${lesson.title}: detailed examples`);
        lesson.examples.forEach(example => {
            assert.ok(example.label && example.text && example.analysis, `${lesson.title}: incomplete example`);
        });
    }
}
assert.ok(passages.length >= 10);
assert.ok(passages.some(item => item.title.includes('홍길동')));
assert.ok(passages.some(item => item.title.includes('심청')));
assert.ok(passages.some(item => item.title.includes('소나기')));
assert.ok(passages.some(item => item.category === '시'));
assert.ok(passages.filter(item => item.category.includes('과학')).length >= 3);

const passageIds = new Set();
const questionIds = new Set();
const categories = new Set();
const difficulties = new Set();
for (const passage of passages) {
    assert.ok(!passageIds.has(passage.id), `duplicate passage id: ${passage.id}`);
    passageIds.add(passage.id);
    categories.add(passage.category);
    difficulties.add(passage.difficulty);
    assert.ok(level.units.some(unit => unit.id === passage.unitId), `${passage.id}: unknown unit`);
    assert.ok(passage.lines.length >= 5 && passage.lines.length <= 30, `${passage.id}: passage length`);
    assert.ok(passage.questions.length >= 3 && passage.questions.length <= 5, `${passage.id}: question count`);
    for (const question of passage.questions) {
        assert.ok(!questionIds.has(question.id), `duplicate question id: ${question.id}`);
        questionIds.add(question.id);
        assert.ok(question.evidence, `${question.id}: missing evidence`);
        assert.equal(question.choices.length, 4, `${question.id}: choice count`);
        const normalized = question.choices.map(value => value.normalize('NFC').trim().toLocaleLowerCase());
        assert.equal(new Set(normalized).size, 4, `${question.id}: duplicate choices`);
        assert.equal(normalized.filter(value => value === question.answer.normalize('NFC').trim().toLocaleLowerCase()).length, 1, `${question.id}: answer uniqueness`);
    }
}
assert.deepEqual([...difficulties].sort(), ['challenge', 'foundation', 'standard']);
assert.ok(categories.size >= 7);
console.log(`Reading content verified: ${passages.length} passages, ${questionIds.size} questions.`);

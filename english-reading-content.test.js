const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('EnglishReadingData.js', 'utf8'), sandbox, { filename: 'EnglishReadingData.js' });
const data = sandbox.window.EnglishReadingData;
const grammarUnitIds = new Set(['e1', 'e2', 'e3', 'e4', 'e5', 'e6']);

assert.equal(data.version, '20260928-er1');
assert.deepEqual(Array.from(data.levels, level => level.id), ['grade6', 'middle1', 'middle2', 'middle3']);
assert.equal(data.levels.filter(level => level.available).length, 1);
assert.equal(data.levels.find(level => level.available).id, 'grade6');
assert.equal(data.units.length, 4);

const unitIds = new Set();
const passageIds = new Set();
const questionIds = new Set();
const answerPositions = new Set();
for (const unit of data.units) {
    assert.match(unit.id, /^er[1-4]$/);
    assert.ok(!unitIds.has(unit.id), `duplicate unit id: ${unit.id}`);
    unitIds.add(unit.id);
    assert.ok(unit.title && unit.goal);
    assert.equal(unit.passages.length, 3, `${unit.id}: exactly three passages`);
    assert.deepEqual(Array.from(unit.passages, passage => passage.band), [0, 1, 2], `${unit.id}: supported/base/stretch bands`);
    for (const passage of unit.passages) {
        assert.ok(!passageIds.has(passage.id), `duplicate passage id: ${passage.id}`);
        passageIds.add(passage.id);
        assert.ok(passage.title && passage.topic);
        assert.ok(passage.sentences.length >= 5, `${passage.id}: minimum sentence coverage`);
        assert.equal(passage.translations.length, passage.sentences.length, `${passage.id}: translation alignment`);
        passage.sentences.forEach((sentence, index) => {
            assert.ok(sentence.trim().length >= 20, `${passage.id}/${index}: substantive English sentence`);
            assert.ok(passage.translations[index].trim().length >= 10, `${passage.id}/${index}: substantive Korean translation`);
        });
        assert.ok(passage.vocabulary.length >= 5 && passage.vocabulary.length <= 8, `${passage.id}: vocabulary coverage`);
        passage.vocabulary.forEach(item => assert.ok(item.word && item.meaning));
        assert.ok(passage.grammarTags.length >= 1 && passage.grammarNotes.length >= 1, `${passage.id}: grammar support`);
        passage.grammarTags.forEach(tag => assert.ok(grammarUnitIds.has(tag), `${passage.id}: known elementary grammar unit ${tag}`));
        assert.ok(passage.grammarRefs.length >= 1 && passage.grammarRefs.length <= passage.grammarTags.length, `${passage.id}: grammar reference coverage`);
        passage.grammarRefs.forEach(ref => {
            assert.equal(ref.stageId, 'elementary');
            assert.ok(grammarUnitIds.has(ref.unitId), `${passage.id}: known grammar reference`);
            assert.ok(Number.isInteger(ref.lessonIndex) && ref.lessonIndex >= 0 && ref.lessonIndex <= 1, `${passage.id}: valid lesson index`);
        });
        assert.equal(passage.source.kind, 'original');
        assert.equal(passage.source.note, '스마트 스터디 자체 제작');
        assert.equal(passage.questions.length, 5, `${passage.id}: five questions`);
        assert.deepEqual(Array.from(passage.questions, question => question.type).sort(), ['evidence','fact','main','reference','vocabulary']);
        for (const question of passage.questions) {
            assert.ok(!questionIds.has(question.id), `duplicate question id: ${question.id}`);
            questionIds.add(question.id);
            assert.equal(question.choices.length, 4, `${question.id}: four choices`);
            assert.ok(Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex < 4, `${question.id}: valid answer`);
            answerPositions.add(question.answerIndex);
            const normalized = question.choices.map(choice => choice.normalize('NFC').trim().toLowerCase());
            assert.equal(new Set(normalized).size, 4, `${question.id}: unique choices`);
            assert.equal(normalized.filter(choice => choice === normalized[question.answerIndex]).length, 1, `${question.id}: single answer`);
            assert.ok(question.explanation.trim().length >= 10, `${question.id}: useful explanation`);
            assert.ok(question.evidence.length >= 1, `${question.id}: evidence required`);
            question.evidence.forEach(index => assert.ok(Number.isInteger(index) && index >= 0 && index < passage.sentences.length, `${question.id}: valid evidence index`));
        }
    }
}
assert.equal(passageIds.size, 12);
assert.equal(questionIds.size, 60);
assert.deepEqual([...answerPositions].sort(), [0, 1, 2, 3], 'answer positions are distributed');
console.log('English reading content verified: 4 units, 12 passages, 60 questions.');

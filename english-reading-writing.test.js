const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { questions, grade, passageIds } = require('./EnglishReadingWriting');

test('12 scoped passages have three distinct writing tasks with auditable English evidence', () => {
    const window = {};
    for (const file of ['EnglishReadingData.js', 'EnglishReadingSecondary.js']) {
        vm.runInNewContext(fs.readFileSync(file, 'utf8'), { window });
    }
    const counts = { grade6: 0, middle1: 0 };
    const ids = new Set();
    for (const id of passageIds) {
        const unit = window.EnglishReadingData.units.find(unit => unit.passages.some(passage => passage.id === id));
        const passage = unit.passages.find(passage => passage.id === id);
        counts[unit.gradeId || 'grade6']++;
        const pack = questions(id);
        assert.deepEqual(pack.map(item => item.type), ['phrase-arrange', 'rewrite', 'reading-short']);
        for (const item of pack) {
            assert(!ids.has(item.id));
            ids.add(item.id);
            assert(item.evidence.length && item.evidence.every(index => Boolean(passage.sentences[index])));
            assert(item.acceptedAnswers.every(answer => grade(item, answer) === true));
            assert(item.rejectedAnswers?.every(answer => grade(item, answer) === false) ?? true);
        }
        const remaining = pack[0].tokens.slice();
        let model = pack[0].answer;
        while (remaining.length) {
            const index = remaining.findIndex(token => model.startsWith(token));
            assert(index >= 0, id);
            model = model.slice(remaining[index].length).trimStart();
            remaining.splice(index, 1);
        }
        assert.match(model, /^[.!?]?$/);
    }
    assert.deepEqual(counts, { grade6: 6, middle1: 6 });
    assert.equal(ids.size, 36);
    assert.deepEqual(questions('unlisted'), []);
});

test('verified paraphrases are accepted, contradictions rejected, and unknown phrasing held for review', () => {
    const seedRule = questions('mr1-unit1-p2')[2];
    assert.equal(grade(seedRule, 'They didn’t have to return seeds.'), true);
    assert.equal(grade(seedRule, 'They DID NOT have to return seeds!'), true);
    assert.equal(grade(seedRule, 'Visitors had to return seeds.'), false);
    assert.equal(grade(seedRule, 'It was up to them.'), null);
    const moon = questions('er1-p1')[2];
    assert.equal(grade(moon, 'The moon makes its own light.'), false);
    assert.equal(grade(moon, 'It comes from the SUN.'), true);
    const rewrite = questions('er1-p0')[1];
    assert.equal(grade(rewrite, 'She looked at the moon.'), true);
    assert.equal(grade(rewrite, 'She looks at the moon.'), false);
});

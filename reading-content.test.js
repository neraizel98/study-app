const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sandbox = { window: {} };
vm.createContext(sandbox);
for (const file of ['ReadingData.js', 'ReadingPassages.js', 'ReadingVocabulary.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}

const level = sandbox.window.ReadingData.levels.level1;
const passages = sandbox.window.ReadingPassages;
const historyCatalog = sandbox.window.ReadingHistoryCatalog;
const vocabulary = sandbox.window.ReadingVocabulary;
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
const chicagoPassages = passages.filter(item => ['chicago-reform', 'deep-reading-five', 'knowledge-judgment'].includes(item.id));
assert.equal(chicagoPassages.length, 3, 'Chicago Plan reading set');
assert.ok(chicagoPassages.every(item => item.category.includes('교육')), 'Chicago Plan category');
assert.ok(passages.find(item => item.id === 'chicago-reform').lines.some(line => line.includes('제5대 총장')), 'Hutchins history');
assert.ok(passages.find(item => item.id === 'deep-reading-five').lines.some(line => line.includes('공식 규칙은 아니다')), 'historical distinction');
assert.ok(!chicagoPassages.flatMap(item => item.lines).some(line => line.includes('평범한 지역 대학') || line.includes('노벨상 수상자가 배출되는 계기')), 'unsupported causal claims');
const philosophyIds = ['socrates-question', 'plato-cave', 'aristotle-habit', 'confucius-practice'];
const philosophyPassages = passages.filter(item => philosophyIds.includes(item.id));
assert.equal(philosophyPassages.length, philosophyIds.length, 'classic philosophy reading set');
assert.ok(philosophyPassages.every(item => item.category === '고전 철학'), 'classic philosophy category');
assert.ok(philosophyPassages.every(item => item.sourceNote && item.sourceNote.includes('어린이 수준')), 'child-friendly source notes');
const longChallengePassages = passages.filter(item => item.difficulty === 'challenge' && item.lines.length >= 15);
assert.ok(longChallengePassages.some(item => item.lines.length >= 15 && item.lines.length <= 20), '15-20 line challenge passage');
assert.ok(longChallengePassages.some(item => item.lines.length >= 20 && item.lines.length <= 30), '20-30 line challenge passage');
assert.ok(longChallengePassages.every(item => item.questions.length === 5), 'long challenge question count');
for (const category of ['한국사', '세계사']) {
    const historyPassages = passages.filter(item => item.category === category);
    assert.equal(historyPassages.length, 3, `${category}: passage count`);
    assert.deepEqual([...new Set(historyPassages.map(item => item.difficulty))].sort(), ['challenge', 'foundation', 'standard'], `${category}: difficulty coverage`);
    assert.ok(historyPassages.find(item => item.difficulty === 'challenge').lines.length >= 15, `${category}: long challenge passage`);
    for (const item of historyPassages) {
        const meta = item.classification;
        assert.equal(meta.contentArea, 'history', `${item.id}: history content area`);
        assert.ok(['korean-history', 'world-history'].includes(meta.futureSubjectId), `${item.id}: future subject`);
        assert.ok(meta.region.length && meta.era.group && meta.era.century, `${item.id}: chronology and region`);
        assert.ok(meta.curriculum.school.length && meta.curriculum.grades.length && meta.curriculum.strands.length, `${item.id}: curriculum mapping`);
        assert.ok(meta.themes.length && meta.competencies.length && meta.events.length, `${item.id}: reusable history tags`);
        assert.ok(meta.sourceType, `${item.id}: source type`);
    }
}
assert.equal(historyCatalog.all.length, 6, 'history catalog size');
assert.equal(historyCatalog.filter({ subjectId: 'korean-history' }).length, 3, 'Korean history catalog');
assert.ok(historyCatalog.filter({ school: '중등', competency: '다중 관점' }).length >= 2, 'curriculum and competency filter');

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
    const vocabularyQuestions = vocabulary.getQuestions(passage);
    assert.ok(vocabularyQuestions.some(question => question.vocabularyType === 'context'), `${passage.id}: context vocabulary`);
    assert.ok(!vocabularyQuestions.some(question => /사자성어 .*의 뜻으로/.test(question.question)),
        `${passage.id}: standalone idiom question must not be mixed into passage quiz`);
    vocabularyQuestions.filter(question => question.vocabularyType === 'idiom-context').forEach(question => {
        assert.equal(question.passageRequired, true, `${question.id}: passage connection marker`);
        assert.ok(question.id.endsWith(passage.id), `${question.id}: passage-specific id`);
    });
    for (const question of [...passage.questions, ...vocabularyQuestions]) {
        assert.ok(!questionIds.has(question.id), `duplicate question id: ${question.id}`);
        questionIds.add(question.id);
        assert.ok(question.evidence, `${question.id}: missing evidence`);
        assert.equal(question.choices.length, 4, `${question.id}: choice count`);
        const normalized = question.choices.map(value => value.normalize('NFC').trim().toLocaleLowerCase());
        assert.equal(new Set(normalized).size, 4, `${question.id}: duplicate choices`);
        assert.equal(normalized.filter(value => value === question.answer.normalize('NFC').trim().toLocaleLowerCase()).length, 1, `${question.id}: answer uniqueness`);
    }
}
assert.ok(vocabulary.idioms.length >= 8, 'idiom variety');
assert.ok(Object.keys(vocabulary.passageIdioms).length >= 8, 'passage-linked idiom variety');
assert.deepEqual([...difficulties].sort(), ['challenge', 'foundation', 'standard']);
assert.ok(categories.size >= 7);
console.log(`Reading content verified: ${passages.length} passages, ${questionIds.size} questions.`);

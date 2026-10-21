// 국어 어휘력: 데이터 형식, 단원 색인, 퀴즈 정답 유일성, 학습 계획 레벨 선택.
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const ctx = { console, Math: Object.create(Math), Date, URLSearchParams }; ctx.window = ctx; vm.createContext(ctx);
for (const file of ['KoreanVocabData.js', 'KoreanVocabLevel1a.js', 'KoreanVocabLevel1b.js', 'KoreanVocabLevel2a.js', 'KoreanVocabLevel2b.js', 'KoreanVocabQuiz.js'])
    vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
const data = ctx.KoreanVocabData, quiz = ctx.KoreanVocabQuiz;

// Levels: 1·2 filled with 6 units × 20 words, 3 locked.
for (const levelId of ['level1', 'level2']) {
    const level = data.levels[levelId];
    assert.equal(level.available, true, levelId);
    assert.deepEqual(level.units.map(u => u.id), data.unitIndex[levelId].map(u => u.id), `${levelId}: unit index matches content`);
    for (const unit of level.units) assert.equal(unit.words.length, 20, unit.id);
}
assert.equal(data.levels.level3.available, false); assert.equal(data.levels.level3.units.length, 0);

const words = data.allWords();
assert.equal(words.length, 240);
assert.equal(new Set(words.map(w => w.id)).size, 240, 'unique ids');
assert.equal(new Set(words.map(w => w.word)).size, 240, 'a headword appears once across all levels');
for (const w of words) {
    for (const field of ['word', 'pos', 'origin', 'meaning', 'usage', 'example']) assert.ok(String(w[field] || '').trim(), `${w.id}.${field}`);
    assert.ok(/[.。]$/.test(w.meaning.trim()), `${w.id}: meaning ends with a period`);
    assert.ok(Array.isArray(w.synonyms) && Array.isArray(w.antonyms), w.id);
    assert.ok(!w.synonyms.includes(w.word) && !w.antonyms.includes(w.word), `${w.id}: headword is not its own relation`);
    assert.ok(!w.synonyms.some(s => w.antonyms.includes(s)), `${w.id}: synonym and antonym overlap`);
    assert.ok(w.example.includes(w.usage), `${w.id}: usage in example`);
    assert.ok((w.passage?.lines || []).some(line => line.includes(w.usage)), `${w.id}: usage in passage`);
    assert.ok(w.passage.lines.length >= 2 && w.passage.lines.length <= 5, `${w.id}: passage length`);
    if (w.origin === '한자어') assert.ok(w.hanja, `${w.id}: 한자어 needs hanja`);
}

// Quiz: every question has one correct option and no option that is also correct.
let generated = 0;
for (const levelId of ['level1', 'level2']) {
    const level = data.levels[levelId], pool = words.filter(w => w.levelId === levelId);
    for (const unit of level.units) for (let round = 0; round < 25; round++) {
        const items = quiz.build({ words: pool.filter(w => w.unitId === unit.id), pool, count: 10 });
        assert.equal(items.length, 10, unit.id);
        for (const q of items) {
            const word = pool.find(w => w.id === q.wordId);
            assert.equal(q.choices.length, 4, q.id); assert.equal(new Set(q.choices).size, 4, `${q.id}: distinct choices`);
            assert.equal(q.choices.filter(c => c === q.answer).length, 1, q.id);
            const others = q.choices.filter(c => c !== q.answer);
            if (q.type === 'synonym') assert.ok(others.every(c => !word.synonyms.includes(c) && !word.antonyms.includes(c)), `${q.id}: ${others}`);
            if (q.type === 'antonym') assert.ok(others.every(c => !word.antonyms.includes(c) && !word.synonyms.includes(c)), `${q.id}: ${others}`);
            if (q.type === 'meaning' || q.type === 'context') assert.ok(others.every(c => c !== word.meaning && !pool.some(w => w.meaning === c && quiz.related(w, word))), q.id);
            if (q.type === 'blank') {
                assert.equal(q.answer, word.word, `${q.id}: options are dictionary forms`);
                assert.ok(!q.question.split(String.fromCharCode(10))[1].includes(word.usage), `${q.id}: blank hides the word`);
            }
            // Distractors are of the same kind: a phrase (관용구·속담) never sits among single words and vice versa.
            if (['blank', 'synonym', 'antonym'].includes(q.type)) {
                const phrase = w => ['관용구', '속담'].includes(w.pos);
                for (const c of others) {
                    const w = pool.find(x => x.word === c); assert.ok(w && phrase(w) === phrase(word), `${q.id}: ${c}`);
                    // Near-synonyms share a unit, so single-word options never come from the same unit.
                    if (!phrase(word)) assert.notEqual(w.unitId, word.unitId, `${q.id}: ${c} from the same unit`);
                }
            }
            if (q.type === 'context') assert.ok(q.passage.lines.some(line => line.includes(word.usage)), q.id);
            generated++;
        }
    }
}
const types = new Set(); for (const w of words) for (const t of quiz.available(w)) types.add(t);
assert.deepEqual([...types].sort(), ['antonym', 'blank', 'context', 'meaning', 'synonym']);

// Learning plan: 중학 이하는 레벨 1, 고등은 레벨 2 단원을 고른다.
const store = new Map(), local = { getPreference: (k, f) => store.has(k) ? store.get(k) : f, setPreference: (k, v) => store.set(k, v), listReports: () => [], getWrongAnswers: () => ({}) };
ctx.SmartStudy = { LocalRepository: local };
for(const f of ['learning-budget-policy.js','learning-plan.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const plan = ctx.SmartStudy.LearningPlan;
assert.deepEqual(Array.from(plan.catalog('korean_vocab', { grade: 6, semester: 2 }), c => c.context.levelId), Array(6).fill('level1'));
assert.deepEqual(Array.from(plan.catalog('korean_vocab', { grade: 11, semester: 1 }), c => c.context.levelId), Array(6).fill('level2'));
assert.equal(plan.target('korean_vocab', { levelId: 'level1', unitId: 'kv1-u2' }), 'korean_vocab.html?level=level1&unit=kv1-u2');
assert.deepEqual(JSON.parse(JSON.stringify(plan.contextOf('korean_vocab', { metadata: { levelId: 'level1', unitId: 'kv1-u2', unitTitle: 'x' } }))), { levelId: 'level1', unitId: 'kv1-u2', title: 'x' });

console.log(`Korean vocabulary: ${words.length} words, ${generated} quiz questions verified; plan levels and targets verified.`);

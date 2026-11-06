const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const context = {}; context.window = context; vm.createContext(context);
const dataFiles = ['EnglishReadingData.js','EnglishReadingMore1.js','EnglishReadingMore2.js','EnglishReadingSecondary.js','EnglishReadingExpansion.js','EnglishReadingMiddleExpansion.js','EnglishReadingHighExpansion.js'];
dataFiles.forEach(file => vm.runInContext(fs.readFileSync(file, 'utf8'), context));
vm.runInContext(fs.readFileSync('reading-question-variants.js', 'utf8'), context);
const passages = context.EnglishReadingData.units.flatMap(unit => unit.passages || []);
const before = passages.reduce((sum, passage) => sum + passage.questions.length, 0);
vm.runInContext(fs.readFileSync('reading-question-expansion.js', 'utf8'), context);

let arrange = 0, locate = 0, sequence = 0;
for (const passage of passages) {
    const added = passage.questions.filter(question => question.expansion);
    assert.equal(added.length, 3, `${passage.id} must receive three expansion questions`);
    assert.equal(new Set(passage.questions.map(question => question.id)).size, passage.questions.length, `${passage.id} ids must be unique`);
    const arranged = added.find(question => question.type === 'arrange'); arrange++;
    assert.equal(arranged.answer, passage.sentences[arranged.evidence[0]]);
    assert.deepEqual([...arranged.tokens].sort(), arranged.answer.trim().split(/\s+/).sort());
    assert.notDeepEqual(arranged.tokens, arranged.answer.trim().split(/\s+/), `${passage.id} tokens must start scrambled`);
    const located = added.find(question => question.id.endsWith('-locate')); locate++;
    assert.equal(located.choices[located.answerIndex], `Sentence ${located.evidence[0] + 1}`);
    assert.ok(located.prompt.includes(passage.sentences[located.evidence[0]]));
    const ordered = added.find(question => question.type === 'sequence'); sequence++;
    assert.equal(ordered.evidence[1], ordered.evidence[0] + 1);
    assert.equal(ordered.choices[ordered.answerIndex], passage.sentences[ordered.evidence[1]]);
    assert.ok(ordered.prompt.includes(passage.sentences[ordered.evidence[0]]));
}
assert.equal(arrange, passages.length); assert.equal(locate, passages.length); assert.equal(sequence, passages.length);
assert.equal(passages.reduce((sum, passage) => sum + passage.questions.length, 0), before + passages.length * 3);
vm.runInContext(fs.readFileSync('reading-question-expansion.js', 'utf8'), context);
assert.equal(passages.reduce((sum, passage) => sum + passage.questions.length, 0), before + passages.length * 3, 'second load is idempotent');
console.log(`English reading expansion verified: ${passages.length} passages, ${passages.length * 3} new questions (${arrange} arrange, ${locate} locate, ${sequence} sequence).`);

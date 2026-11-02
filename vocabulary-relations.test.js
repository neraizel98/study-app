'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const context = {};
context.window = context;
vm.createContext(context);
// Follow the actual page order, including grade additions and Korean definitions.
const scripts = [...read('english.html').matchAll(/src="(VocabEng[^"?]*\.js)(?:\?[^"<>]*)?"/g)].map(match => match[1]);
assert.equal(scripts.length, 11, 'audit all current vocabulary scripts');
for (const script of scripts) vm.runInContext(read(script), context, { filename: script });
const sourceWords = Object.values(context.vocabData).flat();
const sourceByWord = new Map(sourceWords.map(entry => [entry.word, entry]));
assert.equal(sourceWords.length, sourceByWord.size, 'source headwords are unique');
const before = JSON.stringify(context.vocabData);
const definitionsBefore = JSON.stringify(context.vocabDefKo);
vm.runInContext(read('VocabularyRelations.js'), context, { filename: 'VocabularyRelations.js' });
const api = context.VocabularyRelations;
assert.equal(JSON.stringify(context.vocabData), before, 'supplement never changes quiz data, altWords or phrasalVerbs');
assert.equal(JSON.stringify(context.vocabDefKo), definitionsBefore, 'definitions are untouched');
assert.equal(api.metadata.role, 'study-supplement');
assert.equal(api.metadata.version, 1);
assert.equal(api.metadata.headwords, api.entries.length);
assert(api.entries.length >= 100, 'substantial authored coverage');
assert.equal(new Set(api.entries.map(row => row.word)).size, api.entries.length);
const allExpressions = api.entries.flatMap(row => row.expressions);
assert.equal(api.metadata.expressions, allExpressions.length);
assert(allExpressions.length >= 35);
const kinds = new Set(['idiom', 'phrasal verb', 'fixed phrase', 'collocation']);
const expressionPhrases = new Set();
let synonyms = 0;
let antonyms = 0;
for (const row of api.entries) {
    const source = sourceByWord.get(row.word);
    assert(source, 'existing headword: ' + row.word);
    assert.equal(source.pos, row.pos, row.word + ' POS');
    assert.equal(source.meaning, row.meaning, row.word + ' exact existing sense');
    assert.strictEqual(api.get(source), row);
    assert.strictEqual(api.get({ word: ' ' + row.word.toUpperCase() + ' ', pos: ' ' + row.pos + ' ', meaning: ' ' + row.meaning + ' ' }), row);
    assert.equal(api.get({ ...source, pos: source.pos === 'n.' ? 'v.t.' : 'n.' }), null, row.word + ' POS guard');
    assert.equal(api.get({ ...source, meaning: source.meaning + ' (새 의미)' }), null, row.word + ' sense guard');
    assert(Object.isFrozen(row));
    for (const field of ['synonyms', 'antonyms']) {
        assert(Array.isArray(row[field]));
        assert(Object.isFrozen(row[field]));
        const seen = new Set();
        for (const item of row[field]) {
            assert(Object.isFrozen(item));
            assert.equal(item.word, item.word.trim());
            assert(item.word && /[a-z]/i.test(item.word), row.word + ' English relation');
            assert(/[가-힣]/.test(item.meaning), row.word + ' Korean relation');
            assert.notEqual(item.word.toLowerCase(), row.word, 'not a synonym of itself');
            assert(!seen.has(item.word.toLowerCase()), row.word + ' duplicate ' + field);
            seen.add(item.word.toLowerCase());
            if (item.note) assert(/[가-힣]/.test(item.note));
        }
    }
    for (const item of row.synonyms) assert(!row.antonyms.some(ant => ant.word === item.word), row.word + ' contradictory relation');
    synonyms += row.synonyms.length;
    antonyms += row.antonyms.length;
    assert(Object.isFrozen(row.expressions));
    for (const item of row.expressions) {
        assert(Object.isFrozen(item));
        assert(kinds.has(item.kind), row.word + ' expression category');
        assert(!expressionPhrases.has(item.phrase.toLowerCase()), 'duplicate expression: ' + item.phrase);
        expressionPhrases.add(item.phrase.toLowerCase());
        assert(/[a-z]/i.test(item.phrase));
        assert(/[가-힣]/.test(item.meaning));
        assert(/[a-z]/i.test(item.ex));
        assert(/[가-힣]/.test(item.exKo));
        assert(/[.!?]$/.test(item.ex), item.phrase + ' complete example');
        assert(!source.phrasalVerbs?.some(old => old.phrase.toLowerCase() === item.phrase.toLowerCase()), 'avoid duplicating existing expression: ' + item.phrase);
    }
}
for (const input of [null, undefined, '', 'happy', 42, {}, { word: '__proto__' }, { word: 'constructor' }]) assert.equal(api.get(input), null);
assert.equal(api.get({ word: 'bank', pos: 'n.', meaning: '강둑' }), null, 'bank river sense is not bank institution');
assert.equal(api.get({ word: 'kind', pos: 'n.', meaning: '종류' }), null);
assert.equal(api.get({ word: 'fast', pos: 'adj.', meaning: '빠른' }), null, 'fast supplement is an adverb');
const fast = api.get(sourceByWord.get('fast'));
assert(fast.synonyms.some(row => row.word === 'quickly'));
assert(fast.antonyms.some(row => row.word === 'slowly'));
const hard = api.get(sourceByWord.get('hard'));
assert(hard.antonyms.find(row => row.word === 'soft').note);
assert(hard.antonyms.find(row => row.word === 'easy').note);
const lookingForward = api.get(sourceByWord.get('look')).expressions.find(item => item.phrase === 'look forward to');
assert.equal(lookingForward.kind, 'phrasal verb');
assert(lookingForward.ex.includes('seeing'));
assert(lookingForward.note.includes('동명사'));
const snapshot = JSON.stringify(api.entries);
// Array methods belong to the VM realm, so match the error name across realms.
const frozenError = error => error?.name === 'TypeError';
assert.throws(() => { fast.synonyms[0].word = 'corrupted'; }, frozenError);
assert.throws(() => { fast.antonyms.push({ word: 'corrupted' }); }, frozenError);
assert.throws(() => { api.entries.push({}); }, frozenError);
assert.throws(() => { api.metadata.headwords = 0; }, frozenError);
assert.equal(JSON.stringify(api.entries), snapshot, 'callers cannot corrupt shared supplement content');
assert.equal(JSON.stringify(context.vocabData), before, 'lookup and attempted edits preserve complete source');
console.log(`Vocabulary relations: ${sourceWords.length} source headwords loaded; ${api.entries.length} supplemented; ${synonyms} synonyms, ${antonyms} antonyms, ${allExpressions.length} expressions; sense guards, metadata, duplicates, categories and immutability passed.`);

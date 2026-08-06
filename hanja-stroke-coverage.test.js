const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const dataContext = { window: {} };
vm.createContext(dataContext);
vm.runInContext(`${fs.readFileSync('VocabHanja.js', 'utf8')}\nthis.vocab = vocabHanja;`, dataContext);

const source = fs.readFileSync('hanja.js', 'utf8');
const aliasBlock = source.match(/const STROKE_DATA_ALIASES = Object\.freeze\(\{([\s\S]*?)\}\);/);
assert.ok(aliasBlock, 'Stroke alias map must exist');

const aliases = {};
for (const match of aliasBlock[1].matchAll(/'([^']+)':\s*'([^']+)'/g)) aliases[match[1]] = match[2];

// Verified against hanzi-writer-data 2.0.1. These are the Korean glyph names
// not published under the same filename by that package.
const missingFromStrokePackage = ['擧', '氷', '査', '飮', '窓', '淸'];
const expectedTargets = { '擧': '舉', '氷': '冰', '査': '查', '飮': '飲', '窓': '窗', '淸': '清' };
assert.deepEqual(aliases, expectedTargets);

const allCharacters = Object.values(dataContext.vocab).flat().map(item => item.hanja);
assert.equal(new Set(allCharacters).size, 460, 'Vocabulary character count changed; rerun stroke-package coverage audit');
missingFromStrokePackage.forEach(character => {
    assert.ok(allCharacters.includes(character), `${character} must still be present in the vocabulary`);
    assert.ok(aliases[character], `${character} requires a supported stroke-data alias`);
});

assert.match(source, /HanziWriter\.create\('writingQuizContainer', strokeCharacter,/);
assert.match(source, /HanziWriter\.create\('studyStrokeContainer', strokeCharacter,/);
assert.equal((source.match(/onLoadCharDataError:/g) || []).length, 2, 'Both writer modes need load-error recovery');

console.log('All 460 Hanja entries have direct or aliased stroke-data coverage.');

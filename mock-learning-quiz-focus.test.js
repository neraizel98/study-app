const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const vocabulary = fs.readFileSync('main.js', 'utf8');
const grammar = fs.readFileSync('EnglishGrammarApp.js', 'utf8');
const reading = fs.readFileSync('EnglishReadingApp.js', 'utf8');

assert.match(vocabulary, /function diagnosticWordFocus\(\)/);
assert.match(vocabulary, /EnglishVocabularyProgress\.eligible\(currentLevel, currentQuizBand\)/, 'focus word cannot bypass the current grade band');
assert.match(vocabulary, /quizWords = \[\.\.\.\(focusItem \? \[focusItem\] : \[\]\),/, 'mapped word is selected before ordinary adaptive words');
assert.match(vocabulary, /conceptId: `word:\$\{r\.word\}`/);
assert.match(vocabulary, /learningTarget: \{ kind: 'word'/);

assert.match(grammar, /function diagnosticLessonFocus\(\)/);
assert.match(grammar, /function lessonFocusQuestions\(index\)/);
assert.match(grammar, /const focused = \[\.\.\.builtFocus, \.\.\.fresh\.filter\(item => lessonIndexOfQuestion\(item\) === focusLesson\)/);
assert.ok(grammar.indexOf('Utils.shuffle(focused)') < grammar.indexOf('Utils.shuffle(general)'), 'mapped lesson questions precede general fresh questions');
assert.match(grammar, /conceptId: Number\.isInteger\(q\.lessonIndex\) \? `lesson:/);
assert.match(grammar, /learningTarget: Number\.isInteger\(q\.lessonIndex\)/);

assert.match(reading, /function diagnosticSkillFocus\(\)/);
assert.match(reading, /function selectDiagnosticPassage\(\)/);
assert.ok(reading.indexOf('candidates.filter(question => (question.skill || question.type) === focusSkill)') < reading.indexOf("].slice(0,10)"), 'mapped reading skill is prioritized before the quiz limit');
assert.match(reading, /diagnosticSkill: focusSkill/);
assert.match(reading, /conceptId: `reading-skill:/);
assert.match(reading, /learningTarget: \{ kind: 'reading-skill'/);

const grammarContext = { window: {}, Math: Object.create(Math) };
vm.createContext(grammarContext);
vm.runInContext(fs.readFileSync('EnglishGrammarData.js', 'utf8'), grammarContext);
vm.runInContext(fs.readFileSync('EnglishGrammarExpanded.js', 'utf8'), grammarContext);
for (const stage of Object.values(grammarContext.window.EnglishGrammarData)) for (const unit of stage.units || []) {
    for (const [lessonIndex, lesson] of (unit.lessons || []).entries()) {
        assert.ok((lesson.examples || []).length, `${stage.title} ${unit.id} lesson ${lessonIndex} needs an authored example`);
        const meanings = new Set(stage.units.flatMap(candidate => candidate.lessons || []).flatMap(candidate => candidate.examples || []).map(pair => pair[1]).filter(Boolean));
        assert.ok(meanings.size >= 4, `${stage.title} ${unit.id} lesson ${lessonIndex} needs three vetted distractor meanings`);
    }
}

console.log('Mock-exam English weaknesses are connected to fresh vocabulary, grammar, and reading quiz selection.');

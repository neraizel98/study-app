// Every math quiz template must produce a well-formed question: a valid answer index,
// distinct choices, and no broken values or Korean particle placeholders.
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const c = { console, Math: Object.create(Math) }; c.window = c; vm.createContext(c);
for (const file of ['utils.js', 'MathQuizData.js', 'MathQuizMiddle1.js', 'MathQuizMiddle1Semester2.js']) vm.runInContext(fs.readFileSync(file, 'utf8'), c, { filename: file });
const Utils = vm.runInContext('Utils', c), B = String.fromCharCode(92);
const templates = Object.entries(c.MathQuizData).flatMap(([unit, data]) => ['basic', 'advanced', 'word'].flatMap(type => (data[type] || []).map(t => [unit, type, t])));
let generated = 0;
for (const [unit, type, template] of templates) for (let i = 0; i < (template.generator ? 60 : 1); i++) {
    const q = Utils.generateMathQuiz(template), where = `${unit}/${type}/${template.generator || 'static'}`;
    assert.ok(Array.isArray(q.choices) && q.choices.length >= 2, where);
    assert.ok(Number.isInteger(Number(q.answer)) && q.choices[Number(q.answer)] !== undefined, `${where}: answer index`);
    assert.equal(new Set(q.choices.map(String)).size, q.choices.length, `${where}: duplicate choices ${q.choices}`);
    assert.ok(!/undefined|NaN|Infinity|josa/.test(`${q.question} ${q.choices.join(' ')} ${q.explanation || ''}`), `${where}: ${q.question}`);
    generated++;
}
// Particles follow the spoken form: names, numbers, fractions (분자 last) and units.
const cases = [['우준', '이가/가', '이가'], ['지호', '이가/가', '가'], ['3', '을/를', '을'], ['2', '을/를', '를'], ['10', '이/가', '이'],
    [`$${B}frac{1}{2}$`, '을/를', '을'], [`$${B}frac{2}{3}$`, '을/를', '를'], ['$16.5$L', '을/를', '를'], ['$2$kg', '을/를', '을'], ['운동', '이/가', '이'], ['축구', '이/가', '가']];
for (const [word, pair, expected] of cases) assert.equal(Utils.josa(word, pair), expected, `${word} ${pair}`);
console.log(`Math quiz generators: ${templates.length} templates, ${generated} questions well formed; particles verified.`);

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const context = { window: {}, console, Math };
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('MathFormulaData.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('MathFormulaQuiz.js', 'utf8'), context);

const formulas = Array.from(context.MATH_FORMULAS);
const groups = Array.from(context.MATH_FORMULA_GROUPS);
const prerequisiteRefs = context.MATH_PREREQUISITE_REFS;
const foundationGuides = context.MATH_FOUNDATION_GUIDES;
const quiz = context.MathFormulaQuiz;
const page = fs.readFileSync('math_formula.html', 'utf8');
const app = fs.readFileSync('MathFormulaApp.js', 'utf8');
const home = fs.readFileSync('index.html', 'utf8');
const worker = fs.readFileSync('service-worker.js', 'utf8');

assert.strictEqual(formulas.length, 10);
assert.deepStrictEqual(formulas.map(item => item.number), [1,2,3,4,5,6,7,8,9,10]);
assert.strictEqual(groups.length, 3);
assert.deepStrictEqual(groups.flatMap(group => Array.from(group.items)), [1,2,3,4,5,6,7,8,9,10]);

const expectedTitles = [
    '정삼각형의 넓이 공식', '정삼각형의 높이 공식', '직각삼각형의 넓이 공식',
    '피타고라스의 정리', '이등변삼각형의 넓이 공식', '삼각형의 넓이 공식',
    '헤론의 공식', '각과 삼각형의 넓이 공식', '내접원과 삼각형의 넓이 공식',
    '외접원과 삼각형의 넓이 공식'
];
assert.deepStrictEqual(formulas.map(item => item.title), expectedTitles);
formulas.forEach(item => {
    assert(item.formula && item.curriculum.length >= 2, `Formula ${item.number} needs curriculum mapping`);
    assert(item.symbols.length >= 3, `Formula ${item.number} needs symbol explanations`);
    assert(item.steps.length >= 4, `Formula ${item.number} needs principle steps`);
    assert(item.example.work.length >= 3, `Formula ${item.number} needs a worked example`);
    assert.strictEqual(Array.from(prerequisiteRefs[item.number]).length, item.prerequisites.length,
        `Formula ${item.number} prerequisite links must match its knowledge list`);

    const generated = Array.from(quiz.create(item.number));
    assert.deepStrictEqual(generated.map(q => q.level), ['기본 연산', '심화 연산', '서술형']);
    generated.filter(q => q.kind === 'choice').forEach(q => {
        assert.strictEqual(new Set(Array.from(q.choices)).size, q.choices.length, `Formula ${item.number} has duplicate choices`);
        assert(q.choices.map(String).includes(String(q.answer)), `Formula ${item.number} choice answer is missing`);
    });
    generated.forEach(q => assert(quiz.isCorrect(q, q.answer), `Formula ${item.number} cannot grade its answer`));
});

for (const guideId of ['square-roots', 'trigonometry', 'perpendicular-height', 'right-triangle', 'circle-basics', 'sine-law']) {
    const guide = foundationGuides[guideId];
    assert(guide && guide.points.length >= 3, `Foundation guide ${guideId} is incomplete`);
}
assert(app.includes('href="?formula=${ref.formula}&mode=study"'), 'Related formula links are missing');
assert(app.includes('class="foundation-card"'), 'Embedded foundation explanations are missing');
assert(app.includes('M220 180 L320 180 L320 105'), 'Pythagorean triangle alignment is missing');
assert(app.includes('M220 180 L320 105 L245 5 L145 80'), 'Hypotenuse square must share the exact hypotenuse');
assert(app.includes('<circle cx="260" cy="140" r="110"'), 'Circumcircle geometry must use a shared radius');

const randomizedPrompts = new Set(Array.from({ length: 12 }, () => quiz.create(4)[0].prompt));
assert(randomizedPrompts.size > 1, 'Quiz values must vary between attempts');

assert(!page.includes('report.js'), 'Formula encyclopedia must not load statistics');
assert(!page.includes('study-timer.js'), 'Formula encyclopedia must not load the study timer');
assert(!page.includes('missions.js'), 'Formula encyclopedia must not load missions');
assert(!page.includes('firebase-sync.js'), 'Formula encyclopedia must not sync subject statistics');
assert(home.indexOf('math_formula.html') > home.indexOf('href="math.html"'), 'Formula encyclopedia must appear after the five subjects');
assert(home.indexOf('math_formula.html') < home.indexOf('id="missionContainer"'), 'Formula encyclopedia must appear before missions');
for (const asset of ['math_formula.html', 'MathFormulaData.js', 'MathFormulaQuiz.js', 'MathFormulaApp.js']) {
    assert(worker.includes(`'./${asset}'`), `Service worker missing ${asset}`);
}

console.log('Math formula encyclopedia verified: formulas 1-10, curriculum, quizzes, and isolation.');

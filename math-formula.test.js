const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const context = { window: {}, console, Math };
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('MathFormulaData.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('MathFormulaDataExtra.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('MathFormulaDataVolume2.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('MathFormulaDataVolume3.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('MathFormulaDataVolume4.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('quiz-registry.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('MathFormulaQuiz.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('MathFormulaQuizExtra.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('MathFormulaQuizVolume2.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('MathFormulaQuizVolume3.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('MathFormulaQuizVolume4.js', 'utf8'), context);

const formulas = Array.from(context.MATH_FORMULAS);
const groups = Array.from(context.MATH_FORMULA_GROUPS);
const prerequisiteRefs = context.MATH_PREREQUISITE_REFS;
const foundationGuides = context.MATH_FOUNDATION_GUIDES;
const quiz = context.MathFormulaQuiz;
const page = fs.readFileSync('math_formula.html', 'utf8');
const app = fs.readFileSync('MathFormulaApp.js', 'utf8');
const sync = fs.readFileSync('firebase-sync.js', 'utf8');
const home = fs.readFileSync('index.html', 'utf8');
const worker = fs.readFileSync('service-worker.js', 'utf8');

assert.strictEqual(formulas.length, 120);
assert.deepStrictEqual(formulas.map(item => item.number), Array.from({ length: 120 }, (_, index) => index + 1));
assert.strictEqual(groups.length, 19);
assert.deepStrictEqual(groups.flatMap(group => Array.from(group.items)), Array.from({ length: 120 }, (_, index) => index + 1));
assert.deepStrictEqual(formulas.slice(30,60).map(item => item.title), [
    '원의 넓이 공식','원의 둘레 공식','원의 방정식 공식','원주각과 중심각 공식','방멱의 정리','접현의 정리',
    '원주율 공식','원주율 구하는 공식','부채꼴의 중심각 공식','부채꼴의 넓이 공식','호의 길이 공식',
    '타원의 넓이 공식','타원의 이심률 공식','타원의 방정식 공식','구의 부피 공식','구의 겉넓이 공식',
    '원기둥의 부피 공식','원기둥의 겉넓이 공식','원뿔의 부피 공식','원뿔의 겉넓이 공식',
    '삼각뿔의 부피 공식','정사각뿔의 부피 공식','정사각뿔의 겉넓이 공식','정사각뿔의 높이 공식',
    '정사면체의 부피 공식','정사면체의 겉넓이 공식','정사면체의 높이 공식',
    '정육면체의 부피 공식','정육면체의 겉넓이 공식','직육면체의 부피 공식'
]);

const expectedTitles = [
    '정삼각형의 넓이 공식', '정삼각형의 높이 공식', '직각삼각형의 넓이 공식',
    '피타고라스의 정리', '이등변삼각형의 넓이 공식', '삼각형의 넓이 공식',
    '헤론의 공식', '각과 삼각형의 넓이 공식', '내접원과 삼각형의 넓이 공식',
    '외접원과 삼각형의 넓이 공식'
];
assert.deepStrictEqual(formulas.slice(0, 10).map(item => item.title), expectedTitles);
formulas.forEach(item => {
    assert(['초6','중1','중2','중3','고1','고2','고3'].includes(item.level), `Formula ${item.number} needs a school level`);
    assert(item.formula && item.curriculum.length >= 2, `Formula ${item.number} needs curriculum mapping`);
    assert(item.symbols.length >= 3, `Formula ${item.number} needs symbol explanations`);
    assert(item.steps.length >= 4, `Formula ${item.number} needs principle steps`);
    assert(item.example.work.length >= 2, `Formula ${item.number} needs a worked example`);
    assert(item.example.question && item.example.question !== 'undefined', `Formula ${item.number} needs an example heading`);
    assert.strictEqual(Array.from(prerequisiteRefs[item.number]).length, item.prerequisites.length,
        `Formula ${item.number} prerequisite links must match its knowledge list`);
    Array.from(prerequisiteRefs[item.number]).filter(Boolean).forEach(ref => {
        if (ref.guide) assert(foundationGuides[ref.guide], `Formula ${item.number} references missing guide ${ref.guide}`);
        if (ref.formula) assert(formulas.some(entry => entry.number === ref.formula), `Formula ${item.number} references missing formula ${ref.formula}`);
    });

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
assert(app.includes('교과 수준 필터'), 'School-level filter is missing');
assert(app.includes('level-badge'), 'Formula menu school-level badge is missing');
assert(app.includes("const allLevels = ['초6', '중1', '중2', '중3', '고1', '고2', '고3']"), 'All requested school levels must be selectable');
assert(page.indexOf('id="formulaFilter"') < page.indexOf('id="formulaGroups"'), 'Level filter must be separate from the formula list');
assert(page.includes('id="mobileListToggle"'), 'Mobile formula list reopen control is missing');
assert(page.includes('mobile-formula-toolbar'), 'Mobile selected-formula summary is missing');
assert(app.includes("if (isMobile()) mobileMenuOpen = false"), 'Mobile formula selection must collapse the list');
assert(app.includes("scrollIntoView({ behavior: 'smooth', block: 'start' })"), 'Mobile selection must scroll to learning content');
assert(app.includes('SmartStudy.LocalRepository.setPreference'), 'Level filter selection must persist through the repository');
assert(app.includes('M220 180 L320 180 L320 105'), 'Pythagorean triangle alignment is missing');
assert(app.includes('M220 180 L320 105 L245 5 L145 80'), 'Hypotenuse square must share the exact hypotenuse');
assert(app.includes('<circle cx="260" cy="140" r="110"'), 'Circumcircle geometry must use a shared radius');
assert(app.includes('const oppositeMidpoint'), 'Pentagon height must end at the exact opposite-side midpoint');
assert(app.includes('vertices.slice(2, -1)'), 'Polygon diagonals must use actual polygon vertices');
assert(app.includes('cx="260" cy="162.7"'), 'Centroid must be placed at the exact median intersection');
assert(app.includes('M132 220 A42 42 0 0 0 116 187'), 'Angle arc must be centered on vertex A');
assert(app.includes('M170 220 L170 55 A165 165 0 0 1 335 220 Z'), 'Sector radii must have exactly equal SVG lengths');
assert(app.includes('M170 180 A40 40 0 0 1 210 220'), 'Sector angle arc must be centered on the sector vertex');
assert(app.includes('circle cx="260" cy="151.3" r="78.7"'), 'Incircle must be tangent to all three triangle sides');
assert(app.includes('M260 30 L450 140 L260 250 L70 140 Z'), 'Rhombus must use perpendicular diagonals');

context.window.addEventListener = () => {};
vm.runInContext(app, context);
const appApi = vm.runInContext('MathFormulaApp', context);
formulas.forEach(item => {
    const calculationQuestions = Array.from(appApi.createCalculationQuestions(item.number));
    assert.strictEqual(calculationQuestions.length, 3, `Formula ${item.number} must show exactly three calculation questions`);
    assert(calculationQuestions[0].prompt.includes('만들어지는 과정'), `Formula ${item.number} needs a principle question`);
    assert(calculationQuestions[1].prompt.includes('기호가 나타내는 뜻'), `Formula ${item.number} needs a symbol question`);
    assert(!calculationQuestions[2].prompt.includes('만들어지는 과정'), `Formula ${item.number} needs a calculation application`);
    calculationQuestions.forEach((question,index) => {
        if(item.number>=91 && index===2){assert.equal(question.kind,"written");assert(question.strictNumeric);return;}
        assert.strictEqual(question.kind, 'choice', `Formula ${item.number} must not show written questions`);
        assert.strictEqual(question.level, '계산 연습', `Formula ${item.number} must not expose difficulty categories`);
        assert.strictEqual(new Set(Array.from(question.choices)).size, question.choices.length,
            `Formula ${item.number} calculation quiz has duplicate choices`);
    });
});
assert(!app.includes('${qi + 1}. ${q.level}'), 'Quiz difficulty category must not be rendered');

const randomizedPrompts = new Set(Array.from({ length: 12 }, () => quiz.create(4)[0].prompt));
assert(randomizedPrompts.size > 1, 'Quiz values must vary between attempts');

assert(!page.includes('study-timer.js'), 'Formula encyclopedia must not load the study timer');
assert(!page.includes('missions.js'), 'Formula encyclopedia must not load missions');
assert(/src=["']report\.js\?v=[^"']+["']/.test(page), 'Formula encyclopedia needs the active user for admin-only time');
assert(/src=["']firebase-sync\.js\?v=[^"']+["']/.test(page), 'Formula encyclopedia time must sync for the admin');
assert(/src=["']MathFormulaTime\.js\?v=[^"']+["']/.test(page), 'Formula time tracker is missing');
const timeTracker = fs.readFileSync('MathFormulaTime.js', 'utf8');
assert(!timeTracker.includes('updateDailyStat'), 'Formula time must not enter normal subject or mission statistics');
assert(!timeTracker.includes('totalStudyTime'), 'Formula time must remain separately identifiable in the admin');
assert(sync.includes('formulaStudyTime: _mergeFormulaStudyTime'), 'Formula time needs cross-device merge support');
assert(home.indexOf('math_formula.html') > home.indexOf('href="math.html"'), 'Formula encyclopedia must appear after the five subjects');
assert(home.indexOf('math_formula.html') < home.indexOf('id="missionContainer"'), 'Formula encyclopedia must appear before missions');
for (const asset of ['math_formula.html', 'MathFormulaData.js', 'MathFormulaDataExtra.js', 'MathFormulaDataVolume2.js', 'MathFormulaQuiz.js', 'MathFormulaQuizExtra.js', 'MathFormulaQuizVolume2.js', 'MathFormulaApp.js', 'MathFormulaTime.js', 'MathFormulaDataVolume3.js', 'MathFormulaQuizVolume3.js']) {
    assert(worker.includes(`'./${asset}'`), `Service worker missing ${asset}`);
}

assert(!home.includes('공식 001-010'), 'Home formula encyclopedia title must not show the old 001-010 badge');
console.log('Math formula encyclopedia verified: formulas 1-120, level filters, quizzes, and isolation.');

// Fixed draws cross-check numeric examples independently of the generators.
const originalRandom = Math.random;
try {
 Math.random = () => 0;
 const expected = [52,26,15,2,6,2,0,2.83,3,1,3,16,6,45,8,6,8,5,3,2,4,9,15,16,30,4,0,30,4,12];
 expected.forEach((answer,i)=>assert.strictEqual(Number(quiz.create(61+i)[0].answer),answer,`Formula ${61+i} worked calculation`));
} finally { Math.random = originalRandom; }
for(const file of ['MathFormulaDataVolume3.js','MathFormulaQuizVolume3.js']) assert(page.includes(file));
assert(page.indexOf('MathFormulaDataVolume3.js') < page.indexOf('MathFormulaApp.js'));
// New volume: exact original numbering, math calculation checks, strict written grading.
const expectedVolume4Titles=['증가율 공식','원리합계 공식','기수불, 기말불 원리합계 공식','하노이탑 공식','부분분수 공식','약수의 개수 공식','직선의 기울기 공식','직선의 방정식 공식','두 점 사이의 거리 공식','점과 직선 사이의 거리 공식','평균변화율 공식','접선의 방정식 공식','스튜어트의 정리','내분점 공식','외분점 공식','벡터의 길이 공식','벡터 내적 공식','벡터 외적 공식','역행렬 공식','쌍곡선의 표준형 공식','쌍곡선의 이심률 공식','곡률 공식','집합 공식','드 모르간의 법칙','집합의 분할 공식','집합의 분배 법칙','순열 공식','조합 공식','중복조합 공식','퍼센트 구하는 공식'];
assert.deepStrictEqual(formulas.slice(90).map(f=>f.title),expectedVolume4Titles);
const expectedV4=[20,144,21,3,6,9,2,3,10,2,6,-4,8,2,4,14,14,4,2,10,1.67,.5,9,2,1,2,12,6,3,25];
try{Math.random=()=>0;expectedV4.forEach((expected,i)=>{const qs=quiz.create(91+i);assert.equal(Number(qs[0].answer),expected,`formula ${91+i} independent calculation`);assert.equal(qs[2].kind,'written');assert(quiz.isCorrect(qs[2],String(expected)));assert(!quiz.isCorrect(qs[2],`${expected}/999`));assert(!quiz.isCorrect(qs[2],`wrong ${expected}`));assert(!quiz.isCorrect(qs[2],''));});}finally{Math.random=originalRandom;}
for(let i=0;i<20;i++)for(let number=91;number<=120;number++){for(const q of quiz.create(number)){assert(Number.isFinite(Number(q.answer)));assert(quiz.isCorrect(q,q.answer));if(q.choices)assert.equal(new Set(q.choices).size,4);}}
for(const asset of ['MathFormulaDataVolume4.js','MathFormulaQuizVolume4.js']){assert(page.includes(asset));assert(worker.includes(asset));}
try{for(let n=2;n<=6;n++){Math.random=()=>(n-2+.1)/5;let compound=100,annuity=0;for(let k=0;k<2;k++)compound*=1+n/10;for(let k=0;k<n;k++)annuity=annuity*1.1+10;const expected=[n*10,Number(compound.toFixed(2)),Number(annuity.toFixed(2)),2**n-1,n*(n+1),3*(n+1),n,3,5*n,n,2*n+2,-n*n,4*n,n,2*n,7*n,3*n+8,2*n,n,5*n,1.67,Number((1/n).toFixed(2)),2*n+5,2,2**(n-1)-1,n,(n+2)*(n+1),(n+2)*(n+1)/2,n*(n+1)/2,n*12.5];expected.forEach((value,i)=>assert.equal(Number(quiz.create(91+i)[2].answer),value,`formula ${91+i}, n=${n}`));}}finally{Math.random=originalRandom;}

// Exercise grade navigation and quiz writes with synthetic learner data only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function fixture(query = '', options = {}) {
    const elements = new Map(), events = {}, preferences = new Map(), reports = [], wrongWrites = [], alerts = [], contexts = [], timerResults = [];
    const element = id => {
        if (!elements.has(id)) elements.set(id, {
            id, hidden: false, value: '', disabled: false, textContent: '', children: [],
            classList: {add() {}, remove() {}}, addEventListener(name, callback) { this[name] = callback; },
            set innerHTML(value) {
                this.markup = value;
                if (id === 'quizChoices') this.children = [...value.matchAll(/data-index="(\d+)"/g)].map(() => ({classList: {add() {}}, disabled: false}));
            }, get innerHTML() { return this.markup || ''; }
        });
        return elements.get(id);
    };
    const unitId = grade => grade === 7 ? 'r7' : `kr-${grade < 10 ? 'm' + (grade - 6) : 'h' + (grade - 9)}-r7`;
    const makePassage = grade => ({
        id: `p${grade}`, levelId: grade < 10 ? 'level1' : 'level2', grade, unitId: unitId(grade), difficulty: 'standard',
        title: `지문 ${grade}`, category: '설명', sourceNote: '검증용 창작', lines: ['가', '나', '다', '라', '마'],
        questions: Array.from({length: 6}, (_, i) => ({id: `q${i}`, question: '핵심은?', skill: '근거', choices: ['정답', '둘', '셋', '넷'], answer: '정답', evidence: '첫 줄', difficulty: 'standard'}))
    });
    const levels = {level1: {title: '중학', units: []}, level2: {title: '고교', units: []}};
    for (let grade = 7; grade <= 12; grade++) levels[grade < 10 ? 'level1' : 'level2'].units.push({
        id: unitId(grade), title: `단원 ${grade}`, grade,
        lessons: [0, 1].map(i => ({title: `학습 ${grade}-${i}`, principle: '원리', rules: ['근거 읽기'], examples: [{label: '예문', text: '글', analysis: '분석'}], tip: '정리'}))
    });
    const passages = [7, 8, 9, 10, 11, 12].map(makePassage);
    passages.push({...makePassage(7), id: 'legacy7', grade: undefined, levelId: undefined, legacy: true});
    if (options.empty) passages.splice(0, passages.length);
    let user = 'learner-a';
    const scope = {
        console, URLSearchParams, Math, Date, Number, Set, String,
        location: {search: query, href: 'reading.html'}, history: {replaceState(_state, _title, value) { scope.url = value; }},
        document: {getElementById: element, addEventListener(name, callback) {events[name] = callback;}},
        ReadingData: {levels}, ReadingPassages: passages,
        KoreanReadingCurriculum: {
            gradeForProfile: value => Math.max(7, Math.min(12, Number(value) || 7)),
            gradeOfUnit: value => typeof value === 'object' ? value.grade : Object.values(levels).flatMap(level => level.units).find(unit => unit.id === value)?.grade || 7,
            gradeOfPassage: value => value.grade || 7, levelForGrade: value => value < 10 ? 'level1' : 'level2'
        },
        SmartStudy: {
            LocalRepository: {ready: Promise.resolve(), getActiveUser: () => user,
                getPreference: (key, fallback) => preferences.get(key) ?? fallback,
                setPreference: (key, value) => preferences.set(key, value)},
            StorageKeys: {recentPassages: key => `recent_${key}`},
            LearningPlan: {getProfile: () => ({grade: options.profileGrade || 7})}
        },
        StudyTimer: {isUnlocked: (_subject, context) => { contexts.push(context); return true; },
            recordResult: (_subject, context) => {contexts.push(context); timerResults.push(context);},
            initBar: (_subject, _button, settings) => {contexts.push(settings.getContext()); return {startTimer() {}, stopTimer() {}};}},
        AdaptiveQuiz: {getBand: (_subject, context) => {contexts.push(context); return {name: 'standard', wrongRatio: 0};}},
        Utils: {shuffle: items => [...items]}, LearningPolicy: {isDue: () => true},
        WrongNote: {getAll: () => ({reading: options.wrong || []}), save: (...args) => wrongWrites.push(args)},
        saveQuizResult: (...args) => reports.push(args), alert: value => alerts.push(value)
    };
    if (options.progression) scope.SmartStudy.SubjectProgression = {resolve: (_subject, group) => options.progression[group], label: (_subject, grade) => grade < 10 ? '레벨 1 · 중학' : '레벨 2 · 고교'};
    if (options.freshCount != null) scope.QuizExposure = {fresh: (_subject, questions) => questions.slice(-options.freshCount || questions.length).filter((_question, index) => index < options.freshCount)};
    scope.window = scope;
    vm.runInNewContext(fs.readFileSync(path.join(root, 'ReadingApp.js'), 'utf8'), scope);
    const click = (id, dataset) => element(id).click?.({target: {closest: () => ({dataset})}});
    return {scope, element, click, preferences, reports, wrongWrites, alerts, contexts, timerResults, initialize: events.DOMContentLoaded, setUser: value => {user = value;}};
}

(async () => {
    const legacyRoute = fixture('?level=level1&unit=r7&lesson=1');
    await legacyRoute.initialize();
    assert.match(legacyRoute.scope.url, /level=level1&grade=7&unit=r7&lesson=1/);
    assert.equal(legacyRoute.element('lessonTitle').textContent, '학습 7-1');

    const profile = fixture('', {profileGrade: 11});
    await profile.initialize();
    assert.match(profile.scope.url, /level=level2&grade=11/);
    assert.equal(profile.element('gradeTabs').hidden, true);
    assert.equal(profile.element('gradeTabs').innerHTML, '');

    const adaptive = fixture('?level=level2', {progression: {level1: 9, level2: 12}});
    await adaptive.initialize();
    assert.match(adaptive.scope.url, /level=level2&grade=12/);
    assert.doesNotMatch(adaptive.element('heroLevel').textContent, /고[123]|중[123]/);
    adaptive.click('levelTabs', {level: 'level1'});
    assert.match(adaptive.scope.url, /level=level1&grade=9/);

    const app = fixture('?level=level2&grade=11&unit=kr-h2-r7&mode=quiz', {progression: {level1: 8, level2: 12}});
    await app.initialize();
    assert.equal(app.element('passageTitle').textContent, '지문 11');
    assert(app.contexts.includes('reading:level2:grade11'));
    assert(app.contexts.includes('reading:level2:kr-h2-r7'));
    assert.deepEqual([...app.preferences.keys()], ['recent_learner-a_level2_grade11']);
    app.click('levelTabs', {level: 'level1'});
    app.click('startQuiz');
    assert.equal(app.element('passageTitle').textContent, '지문 8');
    assert.equal(app.element('summaryStep').hidden, false);
    app.element('passageSummary').value = '중심 내용의 요약';
    app.click('summaryDone');
    for (let index = 0; index < 5; index++) {app.click('quizChoices', {index: '0'}); app.click('nextQuestion');}
    assert.equal(app.reports.length, 1);
    const metadata = app.reports[0][8];
    assert.equal(metadata.grade, 8);
    assert.equal(metadata.levelId, 'level1');
    assert.equal(metadata.unitId, 'kr-m2-r7');
    assert.equal(metadata.passageId, 'p8');
    assert.equal(metadata.readingSummary, '중심 내용의 요약');
    assert.equal(metadata.attempts.length, 5);
    assert(app.wrongWrites.every(write => write[1].grade === 8 && write[1].levelId === 'level1'));
    app.setUser('learner-b'); app.click('startQuiz');
    assert(app.preferences.has('recent_learner-b_level1_grade8'));

    const review = fixture('?level=level1&unit=r7&mode=review', {wrong: [
        {grade: 8, levelId: 'level1', unitId: 'kr-m2-r7', passageId: 'p8', questionId: 'q0'},
        {unitId: 'r7', passageId: 'legacy7', questionId: 'q1'}
    ]});
    await review.initialize();
    assert.equal(review.element('passageTitle').textContent, '지문 7');
    assert.equal(review.element('summaryStep').hidden, true);
    assert.match(review.element('quizProgress').textContent, /1 \/ 1/);
    review.click('quizChoices', {index: '0'}); review.click('nextQuestion');
    assert.equal(review.reports[0][8].passageId, 'legacy7');
    assert.equal(review.reports[0][8].grade, 7);

    for (const freshCount of [1, 0]) {
        const practice = fixture('?grade=9&mode=quiz', {freshCount});
        await practice.initialize();
        assert.match(practice.element('passageMeta').textContent, /복습 퀴즈/);
        assert.match(practice.element('quizProgress').textContent, /1 \/ 5/);
        practice.click('summaryDone');
        for (let index = 0; index < 5; index++) {practice.click('quizChoices', {index: '0'}); practice.click('nextQuestion');}
        const result = practice.reports[0][8];
        assert.equal(result.review, true);
        assert.equal(result.familiarAttempt, true);
        assert.equal(practice.timerResults.length, 0);
        assert(practice.wrongWrites.every(write => write[1].review && write[1].familiarAttempt));
        if (freshCount) assert.equal(result.attempts[0].questionId, 'q5', 'Keep the one unseen question first when filling the rest with practice.');
    }

    const empty = fixture('?grade=12&mode=quiz', {empty: true});
    await empty.initialize();
    assert.equal(empty.alerts.length, 1);
    console.log('Korean reading frontend: legacy routes, profile grade, grade-isolated quizzes/reports/recent users, summary gate, archived wrong review, five-question practice fallback without score promotion, and missing content passed.');
})().catch(error => {console.error(error); process.exitCode = 1;});

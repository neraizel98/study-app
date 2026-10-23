const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Policy = require('./EnglishReadingPolicy.js');

const report = (id, score, options = {}) => ({
    subject: 'english_reading', date: options.date || Date.now(), totalQuestions: 5, initialScore: score,
    metadata: { passageId: id, readingAssessment: true, isNovel: true, review: false, familiarAttempt: false, hintUsed: false, ...options }
});

let result = Policy.assessmentEvidence([report('a', 5), report('b', 5), report('c', 5)], 0);
assert.equal(result.band, 1);
assert.equal(result.changed, true);
assert.match(result.reason, /평균.*올렸습니다/);
assert.ok(result.windowKey);
result = Policy.assessmentEvidence([report('a', 5), report('a', 5), report('b', 5)], 0);
assert.equal(result.samples, 2, 'same passage cannot fill the three-passage evidence window');
result = Policy.assessmentEvidence([report('a', 5, { hintUsed: true }), report('b', 5), report('c', 5)], 0);
assert.equal(result.samples, 2, 'hinted attempt cannot inflate placement');
result = Policy.assessmentEvidence([report('a', 0), report('b', 2), report('c', 2)], 1);
assert.equal(result.band, 0, 'all scores at or below 59 lower the band');
result = Policy.assessmentEvidence([report('a', 5), report('b', 4), report('c', 5)], 1);
assert.equal(result.band, 2, 'the three distinct first-score average drives placement');
result = Policy.assessmentEvidence([report('a', 4), report('b', 4), report('c', 4)], 1);
assert.equal(result.band, 1, 'an average below 85 and above 59 holds the band');
assert.equal(Policy.selectPassage([{ id: 'a', band: 0 }, { id: 'b', band: 0 }], { band: 0, excludedIds: ['a'] }).id, 'b');
assert.equal(Policy.selectPassage([{ id: 'a', band: 0 }], { band: 0, excludedIds: ['a'] }), null);

const passages = [{ id: 'p1', vocabulary: [{ word: 'orbit' }], grammarTags: ['e3'] }, { id: 'p2', vocabulary: [{ word: 'river' }], grammarTags: ['e6'] }];
const rec = Policy.recommendation(passages, { english: [{ word: 'orbit', isMastered: false }], grammar: [{ unitId: 'e3', isMastered: false }] });
assert.equal(rec.passageId, 'p1');
assert.match(rec.reason, /보완할 단어: orbit/);
assert.equal(rec.vocabularyKnownCount, 0);
assert.equal(rec.vocabularyWeakCount, 1);
const novice = Policy.recommendation(passages, {}, []);
assert.equal(novice.vocabularyKnownCount, 0);
assert.equal(novice.unknownCount, 1);
const corrected = Policy.recommendation(passages, { english: [{ word: 'orbit', isMastered: false, history: [{ status: 'wrong', createdAt: 1 }, { status: 'correct', createdAt: 2 }] }] }, []);
assert.equal(corrected.vocabularyKnownCount, 1, 'latest success replaces older wrong evidence');
assert.equal(corrected.vocabularyWeakCount, 0);
passages[0].grammarRefs = [{ stageId: 'elementary', unitId: 'e3', lessonIndex: 0 }];
const subjectMatched = Policy.recommendation(passages, {}, [{ subject: 'grammar', date: 3, metadata: { stageId: 'elementary', unitId: 'e3', initialAttempts: [{ correct: false }] } }]);
assert.deepEqual(subjectMatched.grammarWeak, ['elementary:e3']);
const undefinedResult = Policy.recommendation(passages, {}, [{ subject: 'grammar', date: 4, metadata: { stageId: 'elementary', unitId: 'e3', initialAttempts: [{ correct: undefined }] } }]);
assert.deepEqual(undefinedResult.grammarWeak, [], 'attempts without a boolean result are not treated as wrong');
assert.match(Policy.recommendation(passages, {}, []).reason, /데이터가 아직 부족/);

class Element {
    constructor() { this.hidden = false; this.disabled = false; this.children = []; this.dataset = {}; this.classList = { add() {}, remove() {} }; }
    setAttribute(name, value) { this[name] = value; }
    addEventListener(name, callback) { (this.listeners ||= {})[name] = callback; } closest() { return null; }
    set innerHTML(value) { this._innerHTML = value; this.children = []; }
    get innerHTML() { return this._innerHTML || ''; }
    set textContent(value) { this._textContent = String(value); }
    get textContent() { return this._textContent || ''; }
}
function makeBrowser(sharedPreferences, sharedReports, options = {}) {
    const ids = ['gradeTabs','levelTabs','unitTabs','adaptiveNotice','recommendationNotice','studyPanel','quizPanel','resultModal','passageMeta','passageTitle','studyPassage','vocabulary','grammarNotes','grammarLinks','listenPassage','peekStatus','prevPassage','nextPassage','practiceQuiz','freshAssessment','quizPassageTitle','quizPassage','quizProgress','quizScore','quizQuestion','toggleQuizTranslation','quizTranslation','quizChoices','quizFeedback','showHint','nextQuestion','backToStudy','resultScore','initialScoreNote','resultMessage','retryWrong','closeResult'];
    const elements = Object.fromEntries(ids.map(id => [id, new Element()]));
    const documentListeners = {};
    const document = { getElementById: id => elements[id], querySelector: () => new Element(), addEventListener: (name, callback) => { documentListeners[name] = callback; } };
    const repository = {
        ready: Promise.resolve(), getActiveUser: () => 'tester', getPreference: (key, fallback) => sharedPreferences.has(key) ? structuredClone(sharedPreferences.get(key)) : fallback,
        setPreference: (key, value) => sharedPreferences.set(key, structuredClone(value)), listReports: () => sharedReports
    };
    const window = { QuizExposure: options.freshCount==null?undefined:{fresh:(subject,questions)=>questions.slice(0,options.freshCount)}, document, location: { search: options.search ?? '?level=grade6&unit=er1', href: '' }, history: { replaceState() {} }, addEventListener() {}, SmartStudy: { LocalRepository: repository, SubjectProgression: options.progression, LearningPlan: { getProfile: () => ({ grade: options.profileGrade || 6 }) } },
        UserSession: { getActiveUser: () => 'tester' }, EnglishReadingPolicy: Policy, alert() {} };
    window.window = window;
    const sandbox = { window, document, location: window.location, history: window.history, URLSearchParams, console, Date, Math, structuredClone,
        alert: window.alert, EnglishReadingPolicy: Policy,
        QuizExposure: window.QuizExposure,
        WrongNote: options.wrongItems ? { getAll: () => ({ english_reading: options.wrongItems }), save() {} } : undefined,
        LearningPolicy: { isDue: () => true },
        saveQuizResult(sessionId, subject, level, totalQuestions, currentScore, initialScore, time, completed, metadata) {
            const old = sharedReports.find(item => item.sessionId === sessionId);
            if (old) { old.finalScore = currentScore; old.metadata = { ...metadata, initialAttempts: old.metadata.initialAttempts }; }
            else sharedReports.push({ sessionId, subject, level, totalQuestions, finalScore: currentScore, initialScore, timeSpentSeconds: time, isCompleted: completed, date: Date.now(), metadata: { ...metadata, initialAttempts: metadata.attempts.map(item => ({ ...item })) } });
        }
    };
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync('EnglishGrammarData.js', 'utf8'), sandbox);
    vm.runInContext(fs.readFileSync('EnglishReadingData.js', 'utf8'), sandbox);
    if (options.secondary) vm.runInContext(fs.readFileSync('EnglishReadingSecondary.js', 'utf8'), sandbox);
    vm.runInContext(fs.readFileSync('EnglishReadingApp.js', 'utf8'), sandbox);
    return { window, elements, init: documentListeners.DOMContentLoaded };
}

(async () => {
    const progression = { resolve: (subject, group) => ({ group1: 'grade6', group2: 'middle3', group3: 'high2' })[group], label: () => '레벨 2 · 중학' };
    const automatic = makeBrowser(new Map(), [], { search: '', secondary: true, profileGrade: 8, progression });
    await automatic.init();
    assert.equal(automatic.window.EnglishReadingApp.getLevelId(), 'middle3', 'score resolver selects hidden internal stage on ordinary entry');
    assert.equal(automatic.elements.gradeTabs.hidden, true);
    assert.equal(automatic.elements.gradeTabs.innerHTML, '');
    assert.doesNotMatch(automatic.elements.levelTabs.innerHTML, /중[123]|고[123]/);
    assert.doesNotMatch(automatic.elements.passageMeta.textContent, /중[123]|고[123]/);
    automatic.elements.levelTabs.listeners.click({ target: { closest: () => ({ dataset: { group: 'group3' } }) } });
    assert.equal(automatic.window.EnglishReadingApp.getLevelId(), 'high2', 'group selection uses resolver rather than first stage');
    const explicit = makeBrowser(new Map(), [], { search: '?level=middle1&unit=erm1-1', secondary: true, profileGrade: 8, progression });
    await explicit.init();
    assert.equal(explicit.window.EnglishReadingApp.getLevelId(), 'middle1', 'explicit saved task stage stays unchanged');

    const nearlyUsed = makeBrowser(new Map(), [], {freshCount:1}); await nearlyUsed.init();
    nearlyUsed.window.EnglishReadingApp.startQuiz('practice');
    assert.equal(nearlyUsed.window.EnglishReadingApp.getSession().questions.length,5,'one fresh question cannot become a one-question regular quiz');
    assert.equal(nearlyUsed.window.EnglishReadingApp.getSession().review,true,'reused questions are visibly classified as review');
    assert.equal(nearlyUsed.window.EnglishReadingApp.getSession().practiceAssessment,false);
    const preferences = new Map(), reports = [];
    const first = makeBrowser(preferences, reports); await first.init();
    assert.equal(first.window.EnglishReadingApp.validateContent(), true);
    first.window.EnglishReadingApp.startQuiz('practice');
    const originalId = first.window.EnglishReadingApp.getSession().sessionId;
    const firstQuestion = first.window.EnglishReadingApp.getSession().questions[0];
    first.window.EnglishReadingApp.submitAnswer((firstQuestion.answerIndex + 1) % 4);
    assert.equal(first.window.EnglishReadingApp.getSession().initialAttempts.length, 1);
    assert.ok([...preferences.keys()].some(key => key.includes('activeSession')), 'mid-quiz state is persisted per user');

    const reload = makeBrowser(preferences, reports); await reload.init();
    assert.equal(reload.window.EnglishReadingApp.getSession().sessionId, originalId, 'reload restores the same quiz session');
    for (let index = 1; index < 5; index++) {
        reload.window.EnglishReadingApp.nextQuestion();
        const current = reload.window.EnglishReadingApp.getSession();
        const question = current.questions.find(item => item.id === current.roundQuestionIds[current.questionIndex]);
        reload.window.EnglishReadingApp.submitAnswer(question.answerIndex);
    }
    reload.window.EnglishReadingApp.nextQuestion();
    assert.equal(reports.length, 1);
    assert.equal(reports[0].initialScore, 4);
    assert.equal(reports[0].metadata.initialAttempts.length, 5);
    reload.window.EnglishReadingApp.retryWrong();
    const retrySession = reload.window.EnglishReadingApp.getSession();
    const retryQuestion = retrySession.questions.find(item => item.id === retrySession.roundQuestionIds[0]);
    reload.window.EnglishReadingApp.submitAnswer(retryQuestion.answerIndex); reload.window.EnglishReadingApp.nextQuestion();
    assert.equal(reports.length, 1, 'retry updates the existing report instead of duplicating it');
    assert.equal(reports[0].initialScore, 4, 'retry preserves first-submit score');
    assert.equal(reports[0].finalScore, 5);
    assert.equal(reports[0].metadata.initialAttempts.length, 5);

    const reviewReports = [], reviewPreferences = new Map();
    const review = makeBrowser(reviewPreferences, reviewReports, { search: '?level=grade6&unit=er1&mode=review', wrongItems: [{ passageId: 'er1-p0', questionId: 'er1-p0-q1', isMastered: false }] });
    await review.init();
    const reviewSession = review.window.EnglishReadingApp.getSession();
    assert.equal(reviewSession.questions.length, 1, 'review session contains only due questions');
    review.window.EnglishReadingApp.submitAnswer(reviewSession.questions[0].answerIndex);
    review.window.EnglishReadingApp.nextQuestion();
    assert.equal(reviewReports[0].totalQuestions, 1);
    assert.equal(reviewReports[0].initialScore, 1, 'one due answer is recorded as 1/1, not 1/5');
    console.log('English reading policy, persisted reload, and retry score separation verified.');
})().catch(error => { console.error(error); process.exitCode = 1; });

// The study screen has no whole-passage translation switch: only per-sentence hints, at most two per passage.
{
    const page = fs.readFileSync('english_reading.html', 'utf8'), app = fs.readFileSync('EnglishReadingApp.js', 'utf8');
    assert.ok(!page.includes('id="toggleTranslation"') && page.includes('id="peekStatus"'));
    assert.ok(app.includes('const PEEK_LIMIT = 2;') && app.includes('data-peek='));
}

{
 const practice=(id,band=0)=>report(id,5,{band,isNovel:false,readingAssessment:false,familiarAttempt:true,practiceAssessment:true,initialAttempts:Array.from({length:5},()=>({correct:true}))});
 const rows=['first','second','third'].map(id=>practice(id));
 assert.equal(Policy.assessmentEvidence(rows,0).band,1,'three complete first practice passages can advance practice difficulty');
 assert.equal(Policy.assessmentEvidence(rows,1).samples,0,'lower-band scores cannot trigger a second promotion');
 assert.equal(Policy.assessmentEvidence(rows.map(r=>({...r,totalQuestions:1})),0).samples,0,'single-question records do not qualify');
 assert.equal(Policy.assessmentEvidence(rows.map(r=>({...r,metadata:{...r.metadata,review:true}})),0).samples,0,'review does not promote');
}

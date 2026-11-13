const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const data = require('./ScienceData');
const mock = require('./ScienceMockData');

test('eight introductory units have160 distinct reviewed practice questions and480 separate assessment items', () => {
    assert.equal(data.units.length, 8);
    assert.equal(new Set(data.units.map(unit => unit.domainId)).size, 4);
    const ids = new Set(), meanings = new Set();
    for (const unit of data.units) {
        assert.equal(unit.questions.length, 20);
        assert.equal(unit.lessons.length, 2);
        assert.equal(unit.goals.length, 3);
        const skills = new Map();
        for (const question of unit.questions) {
            assert(!ids.has(question.id)); ids.add(question.id);
            assert.equal(question.choices.length, 4);
            assert.equal(new Set(question.choices).size, 4);
            assert.equal(question.choices[question.answerIndex], question.correctAnswer);
            assert(question.explanation && question.sourceRefs.length);
            assert(unit.lessons.some(lesson => lesson.id === question.lessonId));
            const meaning = JSON.stringify([question.question, question.correctAnswer, question.givens]);
            assert(!meanings.has(meaning)); meanings.add(meaning);
            skills.set(question.skill, (skills.get(question.skill) || 0) + 1);
        }
        for (const skill of ['concept','diagram','conditions','apply','evidence']) assert.equal(skills.get(skill), 4);
        const assessment = mock.items.filter(question => question.unitId === unit.id);
        assert.equal(assessment.length, 60);
        assert.equal(new Set(assessment.map(question => question.familyId)).size, 12);
        for (const question of assessment) {
            assert(!ids.has(question.id)); ids.add(question.id);
            assert.equal(question.choices.length, 4);
            assert.equal(new Set(question.choices).size, 4);
            assert.equal(question.choices.filter(choice => choice === question.answer).length, 1);
            assert(question.givens && question.passageLines.length >= 4 && question.dataTable.rows.length === 2);
            assert(question.explanation && question.sourceRefs.length);
            assert.equal(question.context.unitId, unit.id);
            const meaning = JSON.stringify([question.question, question.answer, question.givens]);
            assert(!meanings.has(meaning)); meanings.add(meaning);
        }
        const custom = assessment.filter(question => ['inference', 'apply', 'evidence'].includes(question.skill));
        assert.equal(custom.length, 36);
        assert.equal(new Set(custom.map(question => question.question)).size, 36, 'scientific interpretation, evidence and transfer prompts are authored per situation');
    }
    assert.equal(ids.size, 640);
    assert(data.levels.filter(level => level.available).every(level => level.id === 'level1'));
});

function world() {
    const reports = [];
    const context = { console, Date, Set, Map, Math: Object.create(Math) };
    context.window = context;
    context.SmartStudy = { LocalRepository: {
        listReports: user => reports.filter(report => !report.userId || report.userId === user),
        getActiveUser: () => 'science-test'
    } };
    vm.createContext(context);
    for (const file of ['ScienceData.js','quiz-exposure.js','science-policy.js']) {
        vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
    }
    return { context, reports, policy: context.SciencePolicy, unit: context.ScienceData.units[0] };
}

test('first two quizzes use20 fresh questions and the fifth is an explicit same-unit review', () => {
    const { reports, policy, unit } = world();
    const rounds = [];
    for (let index = 0; index < 5; index++) {
        const selection = policy.selectQuestions('science-test', unit);
        assert.equal(selection.items.length, 10);
        assert(selection.items.every(question => question.unitId === unit.id));
        assert.equal(selection.reviewRequired, index >= 4);
        rounds.push(selection);
        reports.push({
            userId: 'science-test', sessionId: 'practice-' + index, subject: 'science',
            date: Date.now(), totalQuestions: 10,
            metadata: { initialAttempts: selection.items.map(question => ({
                ...question, correct: true, correctAnswer: question.answer, round: 1
            })) }
        });
    }
    assert.equal(new Set(rounds.slice(0, 2).flatMap(round => round.items.map(question => question.id))).size, 20);
    assert.throws(() => policy.selectQuestions('science-test', unit, 9), /10문항/);
    assert.throws(() => policy.selectQuestions('science-test', { ...unit, levelId: 'level2' }), /단원/);
});

test('completion uses ten valid first answers while review and hints cannot raise mastery', () => {
    const { policy, unit } = world();
    const good = {
        subject: 'science', sessionId: 'first', totalQuestions: 10, initialScore: 6, finalScore: 8, isCompleted: false,
        date: Date.now(),
        metadata: { source: 'science', levelId: 'level1', unitId: unit.id, submittedAt: Date.now(),
            initialAttempts: unit.questions.slice(0, 10).map((question, index) => ({
                questionId: question.id, correct: index < 6, round: 1
            })) }
    };
    assert.equal(policy.validEvidence(good), true);
    assert.equal(policy.validMasteryEvidence(good), true);
    const reviewed = structuredClone(good); reviewed.metadata.review = true;
    assert.equal(policy.validEvidence(reviewed), true);
    assert.equal(policy.validMasteryEvidence(reviewed), false);
    const hinted = structuredClone(good); hinted.metadata.initialAttempts[0].assisted = true;
    assert.equal(policy.validMasteryEvidence(hinted), false);
    for (const mutate of [
        row => row.metadata.initialAttempts.pop(),
        row => row.metadata.initialAttempts[0].correct = null,
        row => row.metadata.initialAttempts[0].round = 2,
        row => row.metadata.initialAttempts[1].questionId = row.metadata.initialAttempts[0].questionId,
        row => row.metadata.status = 'draft',
        row => row.status = 'partial',
        row => row.metadata.source = 'prediction',
        row => row.metadata.levelId = 'level2',
        row => row.metadata.unitId = 'unknown',
        row => row.metadata.assessment = true,
        row => row.metadata.submittedAt = Date.now() + 100000
    ]) {
        const bad = structuredClone(good); mutate(bad);
        assert.equal(policy.validEvidence(bad), false);
    }
    assert.equal(policy.evidence([good, { ...good, updatedAt: Date.now() }]).length, 1);
});

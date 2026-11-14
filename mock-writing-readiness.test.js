const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { setup } = require('./tests/helpers/mock-transfer-fixture.cjs');
const DAY = 86400000;

function writingEvidence(s, levelId = 'middle1') {
    vm.runInContext(fs.readFileSync('EnglishReadingWriting.js', 'utf8'), s.c);
    const unit = s.c.EnglishReadingData.units.find(unit => (unit.gradeId || 'grade6') === levelId);
    const passage = unit.passages[0], tasks = s.c.EnglishReadingWriting.questions(passage.id);
    const first = [
        ...tasks.map((q, index) => ({
            questionId: q.id, question: q.prompt, questionType: q.type, skill: q.skill,
            correctAnswer: q.answer, passageId: passage.id, round: 1,
            correct: index === 2 ? null : true, gradingStatus: index === 2 ? 'review_pending' : 'correct'
        })),
        ...passage.questions.map(q => ({ questionId: q.id, question: q.prompt, correctAnswer: q.choices[q.answerIndex], passageId: passage.id, correct: true, round: 1 }))
    ];
    const report = {
        userId: 'learner', sessionId: 'writing-source', subject: 'english_reading', date: s.now - DAY,
        totalQuestions: first.length - 1, initialScore: first.length - 1, finalScore: first.length - 1,
        metadata: { writingPack: true, pendingWritingCount: 1, levelId, unitId: unit.id, passageId: passage.id, initialAttempts: first }
    };
    s.reports.splice(s.reports.findIndex(r => r.subject === 'english_reading'), 1, report);
    return report;
}

test('writing with one pending answer supplies a complete 55-item mock and a verified English form change', () => {
    const s = setup(), report = writingEvidence(s), before = JSON.stringify(report);
    const bank = s.api.build('learner', s.now);
    assert(bank.complete, JSON.stringify(bank.shortages));
    assert.equal(bank.items.length, 55);
    assert(s.c.SmartStudy.MockExam.validateBank(bank));
    const written = bank.items.filter(q => q.answerFormat === 'english-form');
    assert(written.length > 0);
    for (const q of written) {
        assert(q.passageId.startsWith('mock-'));
        assert.notEqual(q.passageId, report.metadata.passageId);
        for (const answer of q.acceptedAnswers) assert.equal(s.api.grade(q, answer).correct, true);
        assert.equal(s.api.grade(q, q.answer.toUpperCase().replace(/.$/, '')).correct, true);
        assert.equal(s.api.grade(q, 'I do not know.').correct, false);
        assert.equal(s.api.grade(q, '').status, 'unanswered');
    }
    assert.equal(JSON.stringify(report), before);
    report.metadata.initialAttempts.pop();
    assert.equal(s.api.learnedScopes(s.reports, s.now).some(g => g.subject === 'english_reading'), false);
});

test('five practice days and new writing component after one or two days start and submit three fresh same-week exams', () => {
    for (const writingDays of [1, 2]) {
        const s = setup();
        const written = writingEvidence(s);
        const original = JSON.parse(JSON.stringify(s.reports));
        s.reports.length = 0;
        for (let day = 0; day < 5; day++) for (const report of original) {
            if (report.subject === 'english_reading' && day < 5 - writingDays) continue;
            s.reports.push({ ...report, sessionId: report.sessionId + '-day-' + day, date: s.now - (5 - day) * DAY });
        }
        const seen = new Set(), api = s.c.SmartStudy.MockExam;
        for (let round = 1; round <= 3; round++) {
            const at = s.now + round * 10000, bank = s.api.build('learner', at, { attemptNo: round });
            assert(bank.complete, JSON.stringify({ writingDays, round, shortages: bank.shortages }));
            assert.equal(bank.items.length, 55);
            assert.equal(bank.items.filter(q => ['english', 'grammar', 'english_reading'].includes(q.subject)).length, 15);
            assert(bank.items.some(q => q.answerFormat === 'english-form'));
            for (const q of bank.items) {
                assert(!seen.has(q.fingerprint), q.id);
                seen.add(q.fingerprint);
            }
            let draft = api.create('learner', bank, at, { retake: round > 1 });
            for (let section = 0; section < 4; section++) {
                const active = draft.sections.find(section => section.state === 'active');
                for (const q of draft.questions.filter(q => active.subjects.includes(q.subject))) {
                    api.answer('learner', draft.assessmentId, q.id, q.answer, at + section + 1);
                }
                draft = api.finishSection('learner', draft.assessmentId, at + section + 2, active.id);
                if (draft.break && !draft.break.endedAt) draft = api.skipBreak('learner', draft.assessmentId, at + section + 3);
            }
            assert.equal(draft.resultVisibility, 'withheld');
            assert.equal(api.submissionSnapshot(draft).initialAttempts.length, 55);
            s.reports.push(...JSON.parse(JSON.stringify(api.reportsFor(draft))));
        }
        assert.equal(seen.size, 165);
        assert(written.metadata.pendingWritingCount);
    }
});

test('paper grading and OMR preserve the English written answer format and accepted answer snapshot', () => {
    const s = setup();
    writingEvidence(s);
    const bank = s.api.build('learner', s.now), api = s.c.SmartStudy.MockExam;
    const online = api.create('learner', bank, s.now);
    const paper = JSON.parse(JSON.stringify({ ...online, status: 'paper', mode: 'paper' }));
    const responses = Object.fromEntries(paper.questions.map(q => [q.id, q.acceptedAnswers?.at(-1) || q.answer]));
    const result = api.paperResult(paper, responses, s.now + 1000);
    assert.equal(result.initialAttempts.length, 55);
    assert(result.initialAttempts.every(a => a.correct));
    assert.equal(result.resultVisibility, 'withheld');
    assert(result.questions.some(q => q.answerFormat === 'english-form' && q.acceptedAnswers.length));
    vm.runInContext(fs.readFileSync('mock-paper.js', 'utf8'), s.c);
    vm.runInContext(fs.readFileSync('omr-layout.js', 'utf8'), s.c);
    const set = { items: result.questions, assessmentId: result.assessmentId, attemptNo: result.attemptNo };
    const layout = s.c.OmrLayout.build(set);
    const writtenIndexes = new Set(set.items.map((q, index) => q.answerFormat === 'english-form' ? index : -1).filter(index => index >= 0));
    const writtenRows = layout.areas.flatMap(area => area.rows).filter(row => writtenIndexes.has(row.itemIndex));
    assert.equal(writtenRows.length, writtenIndexes.size);
    assert(writtenRows.every(row => row.kind === 'written' && row.writtenBox));
});

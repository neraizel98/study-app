const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const context = { SmartStudy: {}, setTimeout, clearTimeout, Promise, console };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('shared-report-loader.js', 'utf8'), context);
const loader = context.SmartStudy.SharedReportLoader;
const dateKey = date => new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
const reportPage = fs.readFileSync('report.html', 'utf8');
assert(reportPage.indexOf("panel.classList.add('open')") < reportPage.indexOf('await loadDetailPanel(icon)'),
    'detail panel must open and expose loading state before awaiting remote detail');
assert(reportPage.includes('activeDetailRow !== panel || activeSubject !== subject'),
    'late detail results must verify both the selected row and subject');
assert(reportPage.includes("event.stopPropagation();\n                                loadDetailPanel(icon);"),
    'detail retry must immediately issue a fresh detail request');

(async () => {
    const calls = [];
    const report = { sessionId: 'quiz-1', date: Date.parse('2026-09-26T03:00:00+09:00'), _body: 'body-1' };
    const success = await loader.load({
        learnerId: '우준', date: '2026-09-26', dateKey,
        repository: {
            async getReportStorageMode() { return 'partition'; },
            async getReportsPage(user, query) { calls.push(['page', user, query]); return { reports: [report], hasMore: false }; },
            async getDaily(user, start, end, options) { calls.push(['daily', user, start, end, options]); return [{ date: start, subjects: { math: { learningTime: 90, quizTime: 30 } } }]; },
            async getReportDetail(user, summary) { calls.push(['detail', user]); return { ...summary, wrongItems: [{ display: '1+1' }] }; }
        }
    });
    assert.equal(success.reports.length, 1);
    assert.equal(success.daily.subjects.math.learningTime, 90);
    assert.equal(calls[0][2].start, Date.parse('2026-09-26T00:00:00+09:00'));
    assert.equal(calls[0][2].end, Date.parse('2026-09-27T00:00:00+09:00') - 1);
    assert.equal(calls[0][2].source, 'server');
    assert.equal(calls[1][4].source, 'server');
    assert.equal(calls.some(call => call[0] === 'detail'), false, 'details must stay lazy');
    assert.equal((await success.getDetail(report)).wrongItems.length, 1);

    const studyOnly = await loader.load({ learnerId: '우준', date: '2026-09-26', dateKey, repository: {
        async getReportsPage() { return { reports: [], hasMore: false }; },
        async getDaily() { return [{ date: '2026-09-26', subjects: { reading: { learningTime: 125, quizTime: 0 } } }]; },
        async getReportDetail(user, summary) { return summary; }
    }});
    assert.equal(studyOnly.reports.length, 0);
    assert.equal(studyOnly.daily.subjects.reading.learningTime, 125);

    const missing = await loader.load({ learnerId: '우준', date: '2026-09-26', dateKey, repository: {
        async getReportsPage() { return { reports: [], hasMore: false }; }, async getDaily() { return []; }, async getReportDetail(user, summary) { return summary; }
    }});
    assert.equal(missing.daily, null);
    assert.equal(missing.reports.length, 0);

    await assert.rejects(loader.load({ learnerId: '우준', date: '2026-09-26', dateKey, repository: {
        async getReportsPage() { throw new Error('offline'); }, async getDaily() { return []; }, async getReportDetail() {}
    }}), /offline/);
    await assert.rejects(loader.load({ learnerId: '우준', date: '2026-09-26', dateKey, timeoutMs: 10, repository: {
        getReportsPage() { return new Promise(() => {}); }, async getDaily() { return []; }, async getReportDetail() {}
    }}), error => error.code === 'shared-report/timeout');

    const legacy = await loader.load({ learnerId: '우준', date: '2026-09-26', dateKey, repository: {
        async getReportStorageMode() { return 'legacy'; },
        async getReportsPage() { throw new Error('partition lookup must not run'); }, async getDaily() { throw new Error('partition lookup must not run'); }, async getReportDetail() {},
        async getUserBundle() { return { reports: [report], user: { dailyStats: { date: '2026-09-26', learningTime: { math: 10 } } } }; }
    }});
    assert.equal(legacy.legacy, true);
    assert.equal(legacy.reports.length, 1);
    console.log('Shared report bounded loading, study-only, missing, error, timeout, and legacy paths verified.');
})().catch(error => { console.error(error); process.exitCode = 1; });

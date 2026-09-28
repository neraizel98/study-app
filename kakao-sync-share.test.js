const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const button = { disabled: false, textContent: '' };
const status = { textContent: '' };
const sends = [];
const calls = [];
let resolveUpload;
let rejectUpload;
const daily = {
    date: '2026-09-26', subjectsStudied: ['reading'],
    studyTime: { reading: 60 }, learningTime: { reading: 60 }, quizTime: {}, quizScores: {}
};
const context = {
    console, URLSearchParams, setTimeout, clearTimeout, Date,
    alert() {}, btoa: value => Buffer.from(value, 'binary').toString('base64'), unescape, encodeURIComponent,
    location: { origin: 'https://example.test', pathname: '/study-app/index.html' },
    document: {
        getElementById(id) { return id === 'dailyShareButton' ? button : id === 'dailyShareStatus' ? status : null; },
        createElement() { return {}; }, head: { appendChild() {} }
    },
    Kakao: {
        isInitialized: () => true, init() {},
        Share: { sendDefault(value) { sends.push(value); } }
    },
    UserSession: {
        getActiveUser: () => '우준',
        getUserData: () => ({ id: '우준', attendance: { currentStreak: 1 }, dailyStats: daily })
    },
    StudyPeriods: { daily: () => '2026-09-26' },
    SubjectRegistry: { get: () => ({ icon: '📖', name: '국어' }) },
    FireSync: {
        forceUpload(options) {
            calls.push(options);
            return new Promise((resolve, reject) => { resolveUpload = resolve; rejectUpload = reject; });
        }
    }
};
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('kakao-share.js', 'utf8'), context);

const settle = () => new Promise(resolve => setImmediate(resolve));
(async () => {
    context.KakaoShare.sendDailySummary();
    assert.equal(sends.length, 0, 'Kakao never opens before cloud confirmation');
    assert.equal(calls[0].userId, '우준');
    assert.equal(button.disabled, true);
    assert.match(status.textContent, /서버에 저장/);

    resolveUpload({ userId: '우준', confirmed: true });
    await settle(); await settle();
    assert.equal(button.disabled, false);
    assert.match(status.textContent, /저장을 확인/);
    context.KakaoShare.sendDailySummary();
    assert.equal(sends.length, 1, 'the confirmed second user tap opens Kakao');

    daily.learningTime.reading = 61;
    daily.studyTime.reading = 61;
    context.KakaoShare.sendDailySummary();
    assert.equal(sends.length, 1, 'new learning invalidates an older share confirmation');
    rejectUpload(Object.assign(new Error('offline'), { code: 'unavailable' }));
    await settle(); await settle();
    assert.match(status.textContent, /공유를 열지 않았습니다/);
    assert.equal(button.disabled, false);
    assert.equal(sends.length, 1);

    context.KakaoShare.DAILY_SHARE_SYNC_TIMEOUT_MS = 5;
    context.KakaoShare.sendDailySummary();
    await new Promise(resolve => setTimeout(resolve, 15));
    await settle();
    assert.match(status.textContent, /공유를 열지 않았습니다/, 'a hung upload is bounded and can be retried');
    assert.equal(button.disabled, false);

    console.log('Kakao daily share: cloud confirmation, second-tap user gesture, changed-data invalidation, failure and timeout blocking verified.');
})().catch(error => { console.error(error); process.exitCode = 1; });

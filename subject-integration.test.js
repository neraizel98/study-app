const fs = require('fs');
const assert = require('assert');

const read = file => fs.readFileSync(file, 'utf8');
const subjects = ['reading', 'english', 'grammar', 'hanja', 'math'];

const report = read('report.js');
const stats = read('stats.html');
const admin = read('admin.html');
const missions = read('missions.js');
const wrongNote = read('wrong_note.html');
const home = read('index.html');
const timer = read('study-timer.js');
const readingPage = read('reading.html');
const grammarPage = read('english_grammar.html');

subjects.forEach(subject => {
    assert(report.includes(`${subject}: { name:`), `SubjectRegistry missing ${subject}`);
    assert(admin.includes(`SUBJ_NAMES`) && admin.includes(`${subject}:`), `Admin missing ${subject}`);
});

assert(report.indexOf('reading: { name:') < report.indexOf('english: { name:'), 'Reading must precede English in the common subject registry');
assert(home.indexOf('<!-- Korean Reading -->') < home.indexOf('<!-- English Vocabulary -->'), 'Reading card must precede English vocabulary');
assert(home.includes("KakaoShare.sendRequest('grammar')"), 'Grammar sharing must use the grammar subject key');

assert(stats.includes("const d = { reading: Array(7).fill(0)"), 'Reading study-time series is missing');
assert(stats.includes("const series = { reading: []"), 'Reading score series is missing');
assert(stats.includes('data-subj="reading"'), 'Reading level/unit statistics tab is missing');

assert(admin.includes('StudyTimer.LEVELS[subject]'), 'Admin study-time settings must be generated from the shared level registry');
assert(admin.includes('data-study-subject="${subject}"'), 'Admin level setting is missing the subject key');
assert(admin.includes('data-study-level="${level.key}"'), 'Admin level setting is missing the level key');
assert(admin.includes('cfg.levels[subject][level]'), 'Admin must save level-specific study times');

assert(missions.includes('SubjectRegistry.list()'), 'Missions must derive their subjects from the registry');
assert(missions.includes("['daily', 'weekly', 'monthly']"), 'Mission completion and rewards must cover all three periods');
assert(missions.includes("makeSection('🏆', '이번 달 장기 목표', 'monthly'"), 'Monthly mission section is missing');
assert(report.includes('monthlyStats:'), 'Monthly mission statistics are missing');
assert(report.includes('StudyPeriods.weekly()'), 'Monday-based weekly period is missing');
assert(admin.includes("label:'월간 목표'"), 'Admin monthly reward management is missing');
assert(wrongNote.includes("currentSubject === 'grammar'"), 'Grammar wrong-note handling is missing');
assert(wrongNote.includes("currentSubject === 'reading'"), 'Reading wrong-note handling is missing');
assert(timer.includes("UserSession.updateDailyStat('time', subject, safeSeconds)"), 'Active study time must update user/admin statistics');
assert(readingPage.includes('class="mode-toggle"'), 'Reading timer must be anchored inside the reading shell');
assert(!readingPage.includes('class="mode-row"'), 'Reading must not use the obsolete external timer anchor');
assert(readingPage.includes('<a href="index.html">🏠 홈</a>'), 'Reading top navigation must include a home link');
assert(readingPage.includes('.study-example-text{white-space:pre-line;line-height:2'), 'Reading example line spacing must remain readable');
assert(readingPage.includes('.card h3{margin:28px 0 14px'), 'Reading section headings need vertical spacing');
assert(grammarPage.includes('.principle-detail{font-size:1rem;line-height:1.95'), 'Grammar detail line spacing must remain readable');
assert(grammarPage.includes('.card h3{margin:28px 0 14px'), 'Grammar section headings need vertical spacing');

console.log('Subject integration verified:', subjects.join(', '));

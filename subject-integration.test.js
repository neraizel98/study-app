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

assert(admin.includes('id="stcGrammar"'), 'Grammar study-time setting is missing');
assert(admin.includes('id="stcReading"'), 'Reading study-time setting is missing');
assert((admin.match(/id="stcReading"/g) || []).length === 1, 'Reading study-time setting must have one input');

assert(missions.includes('SubjectRegistry.list()'), 'Missions must derive their subjects from the registry');
assert(wrongNote.includes("currentSubject === 'grammar'"), 'Grammar wrong-note handling is missing');
assert(wrongNote.includes("currentSubject === 'reading'"), 'Reading wrong-note handling is missing');
assert(timer.includes("UserSession.updateDailyStat('time', subject, safeSeconds)"), 'Active study time must update user/admin statistics');
assert(read('reading.html').includes('class="mode-toggle"'), 'Reading timer must be anchored inside the reading shell');
assert(!read('reading.html').includes('class="mode-row"'), 'Reading must not use the obsolete external timer anchor');

console.log('Subject integration verified:', subjects.join(', '));

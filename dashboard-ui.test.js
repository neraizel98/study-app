const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const read = file => fs.readFileSync(file, 'utf8');
const compileInlineScripts = (file, html) => {
    const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
    scripts.forEach((match, index) => {
        new vm.Script(match[1], { filename: `${file}:inline-${index + 1}` });
    });
};

const index = read('index.html');
const uiCore = read('ui-core.js');
assert(index.includes('headerActionHtml'), 'Cloud connection action must be rendered in the shared header');
assert(index.includes('bindCloudButtons()'), 'Dynamically rendered cloud action must be bound');
assert(!index.includes('class="cloud-connect-btn nav-btn" style="margin:10px 0;"'),
    'Dashboard body must not retain the old cloud connection button');
assert(uiCore.includes("this.config.headerActionHtml || ''"), 'Shared header must expose an action slot');
assert(uiCore.includes('.header-cloud-connect .cloud-label { display: none; }'),
    'Mobile header must collapse the cloud action label');

const wrongNote = read('wrong_note.html');
const retryPosition = wrongNote.indexOf('id="retryAllBtn"');
const listPosition = wrongNote.indexOf('id="wrongListContainer"');
assert(retryPosition >= 0 && listPosition >= 0 && retryPosition < listPosition,
    'Wrong-answer retry button must appear immediately before the wrong-answer list');

const stats = read('stats.html');
assert(stats.includes('📚 나의 학습 현황'), 'Learning status heading is required');
assert(stats.includes('학습 내용 · ${levelShort}'), 'Learning content must be shown');
assert(stats.includes('⏱ ${timeStr} · 📝 퀴즈 ${quizStatus}'), 'Study time and quiz status must be shown');
assert(stats.includes('min: SCORE_FLOOR, max: 100'), 'Score chart must use a 50–100 range');
assert(stats.includes('Math.max(SCORE_FLOOR, v)'), 'Scores below 50 must be plotted at 50');
assert(stats.includes('actual < SCORE_FLOOR'), 'Actual scores below 50 must be labeled');
assert(stats.includes("quizView.classList.toggle('view-active', tab === 'quiz')"),
    'Quiz records view must override the shared hidden quiz-view style when active');
assert(stats.includes("classList.contains('view-active')"),
    'Quiz records refresh must follow the visible view state');

const admin = read('admin.html');
assert(admin.includes('min: SCORE_FLOOR, max: 100'), 'Admin score chart must use a 50–100 range');
assert(admin.includes('actual < SCORE_FLOOR'), 'Admin chart must label actual scores below 50');

compileInlineScripts('wrong_note.html', wrongNote);
compileInlineScripts('stats.html', stats);
compileInlineScripts('admin.html', admin);

console.log('Dashboard learning status, wrong-note layout, and score chart range verified.');

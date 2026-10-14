const assert = require('assert');
const fs = require('fs');

const pad = fs.readFileSync('scratchpad.js', 'utf8');
// The scratchpad must never persist anything or touch learning records.
for (const banned of ['localStorage', 'sessionStorage', 'indexedDB', 'LocalRepository', 'FireSync', 'saveQuizResult', 'setPreference']) {
    assert(!pad.includes(banned), `scratchpad.js must not use ${banned}`);
}
for (const page of ['math.html', 'math_viewer.html', 'math_quiz.html', 'math_formula.html']) {
    const html = fs.readFileSync(page, 'utf8');
    assert(/src="scratchpad\.js(\?v=[^"]*)?"/.test(html), `${page} must load the scratchpad`);
    assert(html.indexOf('icons.js') < html.indexOf('scratchpad.js'), `${page} must load icons before the scratchpad`);
}
assert(fs.readFileSync('service-worker.js', 'utf8').includes("'./scratchpad.js'"), 'scratchpad must be available offline');
console.log('Math scratchpad verified: unsaved, wired into the four math pages, cached offline.');

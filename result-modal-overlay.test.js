// Every quiz result window must cover the screen as a popup. A page that forgot the fixed
// overlay style showed the result as a box squeezed beside the quiz (국어 어휘력, 2026-10-21).
const assert = require('node:assert/strict');
const fs = require('node:fs');

const shared = fs.readFileSync('styles.css', 'utf8');
const fixedRule = (css, selector) => new RegExp(`${selector.replace('.', '\\.')}\\s*\\{[^}]*position\\s*:\\s*fixed`).test(css);

const pages = fs.readdirSync('.').filter(name => name.endsWith('.html'));
let checked = 0;
for (const page of pages) {
    const html = fs.readFileSync(page, 'utf8');
    const tag = html.match(/<[a-z]+[^>]*id="resultModal"[^>]*>/);
    if (!tag) continue;
    const classes = (tag[0].match(/class="([^"]*)"/)?.[1] || '').split(/\s+/).filter(Boolean);
    const inline = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
    const covered = classes.some(name => fixedRule(inline, `.${name}`) || fixedRule(shared, `.${name}`));
    assert.ok(covered, `${page}: #resultModal (${classes.join(' ')}) has no position: fixed overlay rule`);
    checked++;
}
assert.ok(checked >= 6, `result windows found: ${checked}`);
console.log(`Result windows cover the screen on ${checked} pages.`);

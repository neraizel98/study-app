// Printable mock exam paper (mock-paper.js): grouping, 교시 order, points, answer key, OMR and escaping.
const { test } = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const fixture = JSON.parse(fs.readFileSync('tests/helpers/mock-paper-fixture.json', 'utf8'));
const source = fs.readFileSync('mock-paper.js', 'utf8'), layoutSource = fs.readFileSync('omr-layout.js', 'utf8');

// Minimal DOM: just what MockPaper.render touches, plus HTML serialization for string checks.
class Text { constructor(value) { this.value = String(value); this.parentNode = null; } get textContent() { return this.value; } html() { return escape(this.value); } }
class Element {
    constructor(tag, doc) { this.tagName = tag.toUpperCase(); this.ownerDocument = doc; this.childNodes = []; this.attributes = {}; this.className = ''; this.parentNode = null; }
    appendChild(node) { node.parentNode = this; this.childNodes.push(node); return node; }
    append(...nodes) { for (const node of nodes) this.appendChild(typeof node === 'string' ? new Text(node) : node); }
    replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
    get lastChild() { return this.childNodes[this.childNodes.length - 1] || null; }
    get children() { return this.childNodes.filter(node => node instanceof Element); }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    getAttribute(name) { return this.attributes[name] ?? null; }
    set textContent(value) { this.childNodes = [new Text(value)]; }
    get textContent() { return this.childNodes.map(node => node.textContent).join(''); }
    get classes() { return this.className.split(/\s+/).filter(Boolean); }
    all(cls) { const out = []; const walk = node => { for (const child of node.children) { if (child.classes.includes(cls)) out.push(child); walk(child); } }; walk(this); return out; }
    one(cls) { return this.all(cls)[0]; }
    html() {
        const attrs = Object.entries({ ...(this.className ? { class: this.className } : {}), ...this.attributes }).map(([k, v]) => ` ${k}="${escape(v)}"`).join('');
        const tag = this.tagName.toLowerCase(); return `<${tag}${attrs}>${this.childNodes.map(node => node.html()).join('')}</${tag}>`;
    }
}
const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function documentStub() { const doc = { createElement: tag => new Element(tag, doc), createTextNode: value => new Text(value) }; return doc; }

function load(katex) {
    const context = { console, JSON, Math, Number, String, Array, Object, Map, Set };
    context.window = context; if (katex) context.katex = katex;
    vm.createContext(context); vm.runInContext(source, context, { filename: 'mock-paper.js' }); vm.runInContext(layoutSource, context, { filename: 'omr-layout.js' });
    return context.MockPaper;
}
const clone = value => JSON.parse(JSON.stringify(value));
function render(set, part, katex) { const api = load(katex), doc = documentStub(), host = doc.createElement('main'); const result = api.render(host, set, { part }); return { api, host, result }; }

test('fixture is a realistic 55-question weekly set', () => {
    assert.equal(fixture.schema, 1); assert.equal(fixture.items.length, 55);
    const count = subjects => fixture.items.filter(q => subjects.includes(q.subject)).length;
    assert.equal(count(['reading', 'korean_vocab']), 15); assert.equal(count(['korean_vocab']), 4);
    assert.equal(count(['english', 'grammar', 'english_reading']), 15); assert.equal(count(['math', 'math_formula']), 15); assert.equal(count(['hanja']), 10);
    assert.equal(fixture.items.filter(q => q.kind === 'written').length, 2);
    assert(fixture.items.some(q => q.subject === 'math' && /\\frac/.test(q.question)), 'LaTeX math item');
    for (const q of fixture.items) assert.equal(q.choices.filter(c => c === q.answer).length, 1, q.question);
});

test('영역 follow the school order 국어 → 수학 → 영어 → 한자 with numbering restarting at 1', () => {
    const areas = load().areas(fixture.items);
    assert.deepEqual(clone(areas.map(a => [a.id, a.name, a.period, a.questions.length])), [['reading', '국어', 1, 15], ['math', '수학', 2, 15], ['english', '영어', 3, 15], ['hanja', '한자', 4, 10]]);
    for (const area of areas) assert.deepEqual(area.questions.map(q => q.no), area.questions.map((_, i) => i + 1));
    assert.equal(load().areas([]).length, 0);
});

test('questions sharing a passage are grouped behind one passage box with a [n~m] directive', () => {
    const { host, result } = render(fixture, 'paper');
    const passageIds = [...new Set(fixture.items.filter(q => q.passageId).map(q => q.passageId))];
    for (const area of result.areas) {
        const seen = new Set();
        for (const block of area.blocks) if (block.passage) {
            assert(!seen.has(block.passage.id), 'one block per passage'); seen.add(block.passage.id);
            assert(block.questions.every(q => q.item.passageId === block.passage.id));
            const nos = block.questions.map(q => q.no); assert.deepEqual(nos, nos.map((_, i) => nos[0] + i), 'contiguous numbers');
        }
    }
    const boxes = host.all('passage').filter(box => !box.classes.includes('passage--inline'));
    assert.equal(boxes.length, passageIds.length);
    const directives = host.all('q-directive').map(node => node.textContent);
    assert.deepEqual(directives, ['[1~6] 다음 글을 읽고 물음에 답하시오.', '[7~11] 다음 글을 읽고 물음에 답하시오.', '[9~15] 다음 글을 읽고 물음에 답하시오.']);
    // The vocabulary "문맥" question keeps its own short passage inside the question.
    assert.equal(host.all('passage--inline').length, 1);
    assert(boxes.some(box => box.one('glossary')?.textContent.includes('* label: 표지')), 'English glossary as footnotes');
});

test('every 영역 totals exactly 100 points and harder items never score less', () => {
    const api = load(), all = api.points(fixture.items);
    for (const area of api.areas(fixture.items)) {
        assert.equal(area.questions.reduce((sum, q) => sum + q.points, 0), 100, area.name);
        const weight = q => ({ basic: 2, standard: 3, challenge: 4 }[q.item.difficulty] || 3) + (q.item.kind === 'written' ? 1 : 0);
        for (const a of area.questions) for (const b of area.questions) if (weight(a) > weight(b)) assert(a.points >= b.points, `${area.name} ${a.no} vs ${b.no}`);
        assert(area.questions.every(q => q.points > 0));
    }
    const totals = {}; fixture.items.forEach((q, i) => { const key = api.AREAS.find(a => a.subjects.includes(q.subject)).id; totals[key] = (totals[key] || 0) + all[i]; });
    assert.deepEqual({ ...totals }, { reading: 100, english: 100, math: 100, hanja: 100 });
    assert.deepEqual([...api.points([{ subject: 'hanja' }])], [100]);
    assert.deepEqual([...api.points([{ subject: 'hanja', difficulty: 'basic' }, { subject: 'hanja', difficulty: 'challenge' }, { subject: 'hanja', difficulty: 'challenge' }])], [20, 40, 40]);
});

test('exam paper shows header, time, name, points, written answer boxes and choice marks', () => {
    const { host } = render(fixture, 'paper'), sheets = host.children;
    assert.equal(sheets.length, 4);
    assert.deepEqual(sheets.map(s => s.one('eh-title').textContent), ['국어 영역', '수학 영역', '영어 영역', '한자 영역']);
    assert.deepEqual(sheets.map(s => s.one('eh-period').textContent), ['제 1 교시', '제 2 교시', '제 3 교시', '제 4 교시']);
    assert.equal(sheets[0].one('eh-top').children[0].textContent, '2026학년도 10월 4주차 Smart Study 모의고사 · 제1회');
    assert.equal(sheets[3].one('eh-time').one('eh-value').textContent, '10분');
    assert(sheets.every(s => s.one('eh-name').one('eh-value').textContent === ''));
    assert.equal(host.all('q').length, 55);
    assert.equal(host.all('q-type').filter(n => n.textContent === '[단답형]').length, 2);
    assert.equal(host.all('written-box').length, 2);
    assert(host.all('q-pts').every(n => /^\[\d+점\]$/.test(n.textContent)));
    const first = host.one('choices').children.map(li => li.one('mk').textContent); assert.deepEqual(first, ['①', '②', '③', '④']);
    assert.equal(host.all('end-note').length, 4);
    assert(host.all('bogi').length >= 3, '〈보기〉 boxes split from the stem');
    assert(!host.html().includes('[보기]'));
});

test('answer key and explanations match each numbered question', () => {
    const { host, result } = render(fixture, 'answers');
    const tables = host.all('key-table'); assert.equal(tables.length, 4);
    result.areas.forEach((area, index) => {
        const [numbers, answers, points] = tables[index].children.filter(row => row.tagName === 'TR').map(row => row.children.slice(1).map(cell => cell.textContent));
        assert.deepEqual(numbers, clone(area.questions.map(q => String(q.no))));
        assert.deepEqual(points, clone(area.questions.map(q => String(q.points))));
        assert.deepEqual(answers, clone(area.questions.map(q => q.item.kind === 'written' ? q.item.answer : '①②③④⑤'[q.item.choices.indexOf(q.item.answer)])));
    });
    const explanations = host.all('exp'); assert.equal(explanations.length, 55);
    const firstMath = result.areas[1].questions[0]; assert.equal(firstMath.item.kind, 'written');
    assert(explanations[15].textContent.includes(firstMath.item.answer) && explanations[15].textContent.includes(firstMath.item.explanation));
});

test('OMR card has one row per question, bubbles for choices and boxes for 단답형', () => {
    const { host } = render(fixture, 'omr'), card = host.one('omr');
    const columns = card.all('omr-col'); assert.deepEqual(columns.map(c => c.getAttribute('data-area')), ['reading', 'math', 'english', 'hanja']);
    const choiceItems = fixture.items.filter(q => q.kind !== 'written').length;
    assert.equal(card.one('omr-answers').all('bub').length, choiceItems * 4);
    assert.equal(card.all('omr-write').length, 2);
    assert.equal(card.one('omr-digits').all('bub').length, 60);
    assert.equal(card.one('omr-areas').all('bub').length, 4);
    assert.equal(card.one('omr-written').textContent, '', 'the student writes the name by hand');
    for (const column of columns) assert.equal(column.all('omr-row').filter(r => !r.classes.includes('omr-legend')).length, 15);
    const hanja = columns[3].all('omr-row').filter(r => r.classes.includes('omr-row--empty')); assert.equal(hanja.length, 5);
    assert(card.all('omr-tick').length > 20, 'timing marks strip');
    // A five-option item widens every choice row to ⑤.
    const five = clone(fixture); five.items[0].choices.push('다섯째 보기');
    const wide = render(five, 'omr').host.one('omr');
    assert.equal(wide.one('omr-answers').all('bub').length, choiceItems * 5);
});

test('OMR card is placed in mm straight from OmrLayout, with fiducials and the round code', () => {
    const { host } = render(fixture, 'omr'), card = host.one('omr');
    const context = { console, JSON, Math, Number, String, Array, Object, Map, Set }; context.window = context; vm.createContext(context);
    vm.runInContext(source, context); vm.runInContext(layoutSource, context);
    const omr = context.OmrLayout.build(fixture), box = node => Object.fromEntries((node.getAttribute('style') || '').split(';').filter(Boolean).map(rule => { const [k, v] = rule.split(':'); return [k, Number(v.replace('mm', ''))]; }));
    assert.equal(card.getAttribute('data-omr-version'), '1');
    const fids = card.all('omr-fid'); assert.equal(fids.length, 4);
    fids.forEach((node, i) => { const f = omr.fiducials[i], b = box(node); assert.deepEqual(b, { left: f.xMm - f.sizeMm / 2, top: f.yMm - f.sizeMm / 2, width: f.sizeMm, height: f.sizeMm }); });
    const cells = card.all('omr-code-cell'); assert.equal(cells.length, 25);
    assert.deepEqual(cells.map(c => c.classes.includes('omr-code-cell--on') ? 1 : 0), clone(omr.codeCells.map(c => c.bit)));
    assert.match(card.one('omr-code-label').textContent, /^판독 코드 · 제1회 · 2026-W43 · [0-9A-F]{4}$/);
    assert.equal(card.all('omr-tick').length, omr.timingMarks.length);
    // Every answer bubble sits exactly where the reader will look: column + row + bubble offsets add up to the layout.
    card.all('omr-col').forEach((col, k) => {
        const area = omr.areas[k], c = box(col);
        assert.equal(col.getAttribute('data-area'), area.key);
        const rows = col.children.filter(node => node.classes.includes('omr-row'));
        area.rows.forEach((row, r) => {
            const rb = box(rows[r]); assert.equal(rows[r].one('omr-n').textContent, String(row.number));
            const bubbles = rows[r].all('bub');
            assert.equal(bubbles.length, row.bubbles.length);
            bubbles.forEach((node, i) => {
                const b = box(node), want = row.bubbles[i], cx = c.left + rb.left + b.left + b.width / 2, cy = c.top + rb.top + b.top + b.height / 2;
                assert(Math.abs(cx - want.xMm) < 0.002 && Math.abs(cy - want.yMm) < 0.002, `${area.key} ${row.number}`);
                assert(Math.abs(b.width - 2 * want.rxMm) < 0.002 && Math.abs(b.height - 2 * want.ryMm) < 0.002);
            });
            if (row.writtenBox) { const w = box(rows[r].one('omr-write')); assert(Math.abs(c.left + rb.left + w.left - row.writtenBox.xMm) < 0.002 && Math.abs(c.top + rb.top + w.top - row.writtenBox.yMm) < 0.002); }
        });
    });
    const css = fs.readFileSync('mock-paper.css', 'utf8');
    assert.match(css, /\.omr\s*\{[^}]*width:\s*180mm;[^}]*height:\s*262mm/, 'card size matches OmrLayout.pageMm');
    assert.deepEqual(clone(omr.pageMm), { w: 180, h: 262 });
});

test('parts select what is printed', () => {
    const count = part => render(fixture, part).host.children.length;
    assert.equal(count('paper'), 4); assert.equal(count('answers'), 1); assert.equal(count('omr'), 1); assert.equal(count('all'), 6); assert.equal(count('bogus'), 4);
    const all = render(fixture, 'all').host.children.map(s => s.classes[1]);
    assert.deepEqual(all, ['exam-sheet', 'exam-sheet', 'exam-sheet', 'exam-sheet', 'omr-sheet', 'answer-sheet']);
});

test('stored text is escaped; only KaTeX produces markup and only for math', () => {
    const set = clone(fixture), attack = '<img src=x onerror=alert(1)>';
    set.learnerName = '<b>이름</b>'; set.weekLabel = '<script>x</script>';
    set.items[0].question = attack; set.items[0].passageLines = ['<script>alert(1)</script>', ...set.items[0].passageLines.slice(1)];
    set.items[0].explanation = '</div><iframe>'; set.items[0].choices[0] = '"><svg onload=1>'; if (set.items[0].answer === fixture.items[0].choices[0]) set.items[0].answer = set.items[0].choices[0];
    const html = render(set, 'all').host.html();
    for (const raw of ['<img', '<script', '<iframe', '<svg', '<b>']) assert(!html.includes(raw), raw);
    assert(html.includes('&lt;img src=x onerror=alert(1)&gt;') && html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
    assert(!/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(source), 'no raw HTML sinks');
    const calls = [], katex = { render: (formula, el) => { calls.push(formula); el.textContent = `[${formula}]`; } };
    const math = render(fixture, 'paper', katex).host;
    assert(calls.includes('\\displaystyle \\frac{9}{7}') || calls.some(f => /^\\displaystyle \\frac\{\d+\}\{\d+\}$/.test(f)), 'choices typeset as fractions');
    assert(calls.every(f => f.startsWith('\\displaystyle ')));
    const plain = clone(fixture); plain.items = [{ subject: 'math', question: '6/3과 같은 값은?', choices: ['6/3', '3'], answer: '6/3', kind: 'choice' }, { subject: 'english', question: 'Cost is $5 and $6', choices: ['a', 'b'], answer: 'a', kind: 'choice' }];
    calls.length = 0; render(plain, 'paper', katex);
    assert.deepEqual(calls, ['\\displaystyle \\frac{6}{3}'], 'whole fraction answers only, never in non-math subjects');
    assert(math.html().includes('[\\displaystyle'));
});

test('stored set is read defensively', () => {
    const api = load(), storage = value => ({ getItem: () => value });
    assert.equal(api.read(storage(null)), null); assert.equal(api.read(storage('{bad')), null);
    assert.equal(api.read(storage(JSON.stringify({ schema: 2, items: [{}] }))), null); assert.equal(api.read(storage(JSON.stringify({ schema: 1, items: [] }))), null);
    assert.equal(api.read(storage(JSON.stringify(fixture))).items.length, 55);
    assert.equal(api.STORAGE_KEY, 'SmartStudy_MockPaperPrint');
});

test('print page keeps the learning-page translation guard, KaTeX and offline cache', () => {
    const html = fs.readFileSync('mock-print.html', 'utf8');
    assert.match(html, /<html[^>]*translate="no"[^>]*data-learning-translation-guard/);
    assert.match(html, /<meta name="google" content="notranslate">/);
    assert.match(html, /learning-translation-guard\.js/); assert.match(html, /katex@0\.16\.8\/dist\/katex\.min\.js/);
    for (const id of ['paperRoot', 'paperEmpty', 'paperToolbar', 'printPaper']) assert(html.includes(`id="${id}"`), id);
    for (const part of ['paper', 'answers', 'omr', 'all']) assert(html.includes(`data-part="${part}"`), part);
    const worker = fs.readFileSync('service-worker.js', 'utf8');
    for (const asset of ['mock-print.html', 'mock-paper.js', 'mock-paper.css', 'omr-layout.js', 'omr-reader.js']) assert(worker.includes(`'./${asset}'`), asset);
    assert(html.indexOf('omr-layout.js') > 0 && !html.includes('omr-reader.js'), 'the print page needs the layout only');
    const css = fs.readFileSync('mock-paper.css', 'utf8');
    assert.match(css, /@page\s*\{[^}]*size:\s*A4 portrait/); assert.match(css, /counter\(page\) " \/ " counter\(pages\)/);
    assert.match(css, /\.q\s*\{[^}]*break-inside:\s*avoid/); assert.match(css, /\.sheet \+ \.sheet\s*\{\s*break-before:\s*page/);
});

console.log('Mock paper: 교시 order, shared passages, 100-point 영역, answer key, OMR and escaping verified.');

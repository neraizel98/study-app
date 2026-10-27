// OMR card layout (omr-layout.js) and photo reader (omr-reader.js) on synthetic phone photos:
// perspective, rotation, scale, blur, noise, uneven light, shadows, clutter, mono printing, pencil/pen/faint/double marks.
const { test } = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const synth = require('./tests/helpers/omr-synth.cjs');
const fixture = JSON.parse(fs.readFileSync('tests/helpers/mock-paper-fixture.json', 'utf8'));

const context = { console, JSON, Math, Number, String, Array, Object, Map, Set, Infinity, Float32Array, Float64Array, Int32Array, Uint8Array, Uint8ClampedArray };
context.window = context; vm.createContext(context);
for (const file of ['mock-paper.js', 'omr-layout.js', 'omr-reader.js']) vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
const { MockPaper, OmrLayout, OmrReader } = context;
const clone = value => JSON.parse(JSON.stringify(value));
const layout = OmrLayout.build(fixture);
const choiceRows = layout.areas.flatMap(area => area.rows.filter(row => row.kind === 'choice').map(row => ({ area: area.key, row })));

// Every 10 choice rows: pen, pen + erased residue, pencil, blank, partial pencil, pen, double mark, pencil, faint, pen.
function markPlan(seed) {
    const rand = synth.rng(seed), marks = {}, expected = {};
    choiceRows.forEach(({ row }, i) => {
        const n = row.bubbles.length, choice = 1 + Math.floor(rand() * n), other = 1 + (choice % n);
        const kind = i % 10;
        if (kind === 3) { expected[row.itemIndex] = { status: 'blank', choice: null }; return; }
        if (kind === 6) { marks[row.itemIndex] = [{ choice, kind: 'pen' }, { choice: other, kind: 'pen' }]; expected[row.itemIndex] = { status: 'multiple', choice: null }; return; }
        if (kind === 8) { marks[row.itemIndex] = [{ choice, kind: 'faint' }]; expected[row.itemIndex] = { status: 'faint', choice }; return; }
        const mark = kind === 1 ? [{ choice, kind: 'pen' }, { choice: other, kind: 'residue' }]
            : kind === 2 || kind === 7 ? [{ choice, kind: 'pencil' }]
                : kind === 4 ? [{ choice, kind: 'pencil', coverage: 0.7 }] : [{ choice, kind: 'pen' }];
        marks[row.itemIndex] = mark; expected[row.itemIndex] = { status: 'ok', choice };
    });
    return { marks, expected };
}
const writtenItem = layout.areas.flatMap(a => a.rows).find(row => row.kind === 'written').itemIndex;

function shoot(set, shot, plan, print) {
    const page = synth.paperTexture(OmrLayout.build(set), { marks: plan?.marks || {}, written: { [writtenItem]: 3 }, mono: !!print?.mono, fiducials: print?.fiducials });
    const w = shot.w || 1200, h = shot.h || 1600;
    return synth.photo(page, { w, h, corners: shot.corners || synth.corners({ w, h, ...shot }), ...shot }, OmrReader.homography, OmrReader.applyH);
}
function score(result, plan) {
    let right = 0; const wrong = [];
    for (const answer of result.answers) {
        const want = plan.expected[answer.itemIndex];
        if (answer.status === want.status && answer.choice === want.choice) right++;
        else wrong.push(`${answer.area} ${answer.number}: got ${answer.status} ${answer.choice} want ${want.status} ${want.choice} fills ${answer.fills.join("/")} tints ${answer.tints.join("/")}`);
    }
    return { right, total: result.answers.length, wrong };
}

const SHADOW = { nx: 1, ny: 0.3, at: 500, soft: 40, depth: 0.45 };
const CONDITIONS = [
    ['clean, straight', {}],
    ['rotated 12°, perspective, side light + shadow, blur, noise', { deg: 12, persp: 0.06, blur: 1.5, noise: 8, light: [0.6, 0.4, 0.15], shadow: SHADOW, fill: 0.8 }],
    ['rotated −15°, strong perspective, mono print, blur 2', { deg: -15, persp: 0.1, blur: 2, noise: 10, light: [1, -0.4, 0.1], fill: 0.75, seed: 9 }, { mono: true }],
    ['landscape (card turned 90°)', { deg: 90, w: 1600, h: 1200, persp: 0.05, blur: 1, noise: 6 }],
    ['upside down (180°) with clutter', { deg: 178, persp: 0.04, noise: 6, seed: 4 }],
    ['card small in a cluttered frame', { w: 1600, h: 2000, fill: 0.55, deg: 6, persp: 0.05, dx: 180, dy: -150, noise: 6, seed: 11 }],
    ['low resolution (~3 px/mm)', { w: 800, h: 1066, fill: 0.9, deg: -5, persp: 0.04, blur: 0.6, noise: 5, seed: 13 }],
    ['dim, warm, heavy noise', { deg: 4, persp: 0.05, noise: 16, light: [0.45, 0.15, 0.2], blur: 1, seed: 21 }]
];

test('layout: four corner fiducials, round code and per-row bubbles map to paperSet.items', () => {
    assert.equal(layout.version, 1); assert.deepEqual(clone(layout.pageMm), { w: 180, h: 262 });
    assert.deepEqual(clone(layout.fiducials.map(f => f.id)), ['tl', 'tr', 'br', 'bl']);
    for (const f of layout.fiducials) assert(f.sizeMm >= 6, 'large enough for a phone photo');
    const ticks = layout.timingMarks; assert(ticks.every(t => t.wMm * t.hMm < 0.2 * layout.fiducials[0].sizeMm ** 2), 'ticks are clearly smaller than fiducials');
    const areas = MockPaper.areas(fixture.items);
    assert.deepEqual(clone(layout.areas.map(a => a.key)), ['reading', 'math', 'english', 'hanja']);
    layout.areas.forEach((area, k) => {
        assert.equal(area.rows.length, areas[k].questions.length);
        area.rows.forEach((row, r) => {
            assert.equal(row.number, areas[k].questions[r].no);
            assert.equal(fixture.items[row.itemIndex].id, areas[k].questions[r].item.id, 'itemIndex points at the printed question');
            assert.equal(row.kind, fixture.items[row.itemIndex].kind === 'written' ? 'written' : 'choice');
            if (row.kind === 'written') { assert(row.writtenBox.wMm > 15 && row.writtenBox.hMm > 8); assert.equal(row.bubbles.length, 0); }
            else {
                assert.deepEqual(clone(row.bubbles.map(b => b.choice)), [1, 2, 3, 4]);
                for (const b of row.bubbles) {
                    assert(b.xMm - b.rxMm >= row.rect.xMm + 6 && b.xMm + b.rxMm <= row.rect.xMm + row.rect.wMm, 'inside its column');
                    assert(b.yMm - b.ryMm >= row.rect.yMm && b.yMm + b.ryMm <= row.rect.yMm + row.rect.hMm, 'inside its row');
                    assert.equal(b.rMm, Math.min(b.rxMm, b.ryMm));
                }
                for (let i = 1; i < row.bubbles.length; i++) assert(row.bubbles[i].xMm - row.bubbles[i - 1].xMm > 2 * row.bubbles[i].rxMm + 1, 'bubbles do not touch');
            }
        });
    });
    // The paper's numbering differs from item order because shared passages are regrouped.
    assert(layout.areas.some(a => a.rows.some((row, r) => r > 0 && row.itemIndex !== a.rows[r - 1].itemIndex + 1)));
    // Everything printed stays on the card.
    for (const box of [...layout.codeCells, ...ticks, layout.codeLabel, layout.tip]) assert(box.xMm >= 0 && box.yMm >= 0 && box.xMm + box.wMm <= 180 && box.yMm + box.hMm <= 262);
    const five = clone(fixture); five.items[0].choices.push('다섯째'); assert.equal(OmrLayout.build(five).areas[0].rows[0].bubbles.length, 5);
});

test('round code encodes attempt and a hash of weekKey + question ids, with a checksum', () => {
    const code = OmrLayout.code(fixture);
    assert.equal(code.attemptNo, 1); assert.equal(code.bits.length, OmrLayout.CODE_BITS); assert.match(code.label, /^판독 코드 · 제1회 · 2026-W43 · [0-9A-F]{4}$/);
    assert.deepEqual(clone(OmrLayout.decode(code.bits)), { valid: true, attemptNo: 1, hash: code.hash });
    const second = clone(fixture); second.attemptNo = 2;
    const other = clone(fixture); other.weekKey = '2026-W44';
    const swapped = clone(fixture); [swapped.items[0], swapped.items[1]] = [swapped.items[1], swapped.items[0]];
    assert.equal(OmrLayout.code(second).hash, code.hash); assert.equal(OmrLayout.decode(OmrLayout.code(second).bits).attemptNo, 2);
    assert.notEqual(OmrLayout.code(other).hash, code.hash); assert.notEqual(OmrLayout.code(swapped).hash, code.hash);
    for (let i = 0; i < code.bits.length; i++) { const flipped = code.bits.slice(); flipped[i] ^= 1; assert.equal(OmrLayout.decode(flipped).valid, false, `bit ${i}`); }
    assert.deepEqual(clone(layout.codeCells.map(c => c.bit)), clone(code.bits));
});

const summary = [];
for (const [name, shot, print] of CONDITIONS) {
    test(`reads every row correctly: ${name}`, () => {
        const plan = markPlan(name.length * 31 + 7), image = shoot(fixture, shot, plan, print);
        const started = Date.now(), result = OmrReader.read(image, fixture), ms = Date.now() - started;
        assert.equal(result.ok, true, `${name}: ${result.error} ${JSON.stringify(result.quality)}`);
        assert.equal(result.attemptNo, 1);
        const s = score(result, plan);
        summary.push(`${name}: ${s.right}/${s.total} rows, blur ${result.quality.blurScore}mm, skew ${result.quality.skewDeg}°, ${result.quality.pxPerMm}px/mm, ${ms}ms`);
        assert.equal(s.total, choiceRows.length);
        assert.deepEqual(s.wrong, [], name);
        assert(Math.abs(result.quality.skewDeg - (shot.deg || 0)) < 6 || Math.abs(Math.abs(result.quality.skewDeg - (shot.deg || 0)) - 360) < 6, `skew ${result.quality.skewDeg}`);
        // 단답형 boxes come back as rectified crops for the admin to type in.
        assert.equal(result.writtenCrops.length, 2);
        for (const crop of result.writtenCrops) {
            assert.equal(crop.rgba.data.length, crop.rgba.width * crop.rgba.height * 4);
            assert(crop.rgba.width > 150 && crop.rgba.height > 80);
            assert.equal(fixture.items[crop.itemIndex].kind, 'written');
        }
        const inked = result.writtenCrops.find(c => c.itemIndex === writtenItem), empty = result.writtenCrops.find(c => c.itemIndex !== writtenItem);
        assert(inked.inkRatio > 0.015 && empty.inkRatio < 0.01, `ink ${inked.inkRatio} / ${empty.inkRatio}`);
    });
}

test('answers carry area, paper number, itemIndex, fills and confidence', () => {
    const plan = markPlan(3), result = OmrReader.read(shoot(fixture, { deg: 3, persp: 0.03 }, plan), fixture);
    assert.equal(result.ok, true);
    const first = result.answers[0];
    assert.deepEqual(Object.keys(first).sort(), ['area', 'choice', 'confidence', 'fills', 'itemIndex', 'number', 'status', 'tints']);
    assert.equal(first.fills.length, 4);
    for (const a of result.answers) {
        assert(a.confidence >= 0 && a.confidence <= 1);
        const row = layout.areas.find(area => area.key === a.area).rows.find(r => r.number === a.number);
        assert.equal(row.itemIndex, a.itemIndex);
        if (a.status === 'ok') assert(a.confidence > 0.5, `${a.area} ${a.number} ${a.confidence}`);
    }
    assert.deepEqual(Object.keys(result.quality).sort(), ['blurScore', 'pxPerMm', 'skewDeg', 'timingScore']);
    assert.equal(result.fiducials.length, 4); assert.equal(result.homography.length, 9);
});

test('a card from another round or week is rejected as wrong-card', () => {
    const plan = markPlan(5);
    const second = clone(fixture); second.attemptNo = 2;
    const fromSecond = OmrReader.read(shoot(second, { deg: 5, persp: 0.05, noise: 6 }, plan), fixture);
    assert.equal(fromSecond.ok, false); assert.equal(fromSecond.error, 'wrong-card'); assert.equal(fromSecond.attemptNo, 2);
    assert.equal(fromSecond.code.expected.attemptNo, 1);
    const otherWeek = clone(fixture); otherWeek.weekKey = '2026-W44';
    const fromOtherWeek = OmrReader.read(shoot(otherWeek, { deg: -7, persp: 0.05, noise: 6 }, plan), fixture);
    assert.equal(fromOtherWeek.error, 'wrong-card'); assert.equal(fromOtherWeek.attemptNo, 1); assert.notEqual(fromOtherWeek.code.detected.hash, OmrLayout.code(fixture).hash);
    // The right card for the second round reads fine against its own set.
    assert.equal(OmrReader.read(shoot(second, { deg: 5, persp: 0.05, noise: 6 }, plan), second).ok, true);
});

test('no card: clutter only, a page without fiducials, garbage input', () => {
    const offscreen = [[-5000, -5000], [-4000, -5000], [-4000, -4000], [-5000, -4000]];
    assert.equal(OmrReader.read(shoot(fixture, { corners: offscreen, seed: 3 }), fixture).error, 'no-card');
    assert.equal(OmrReader.read(shoot(fixture, { deg: 4, seed: 5 }, markPlan(1), { fiducials: false }), fixture).error, 'no-card');
    const blank = { width: 600, height: 800, data: new Uint8ClampedArray(600 * 800 * 4).fill(235) };
    assert.equal(OmrReader.read(blank, fixture).error, 'no-card');
    assert.equal(OmrReader.read({ width: 0, height: 0, data: new Uint8ClampedArray(0) }, fixture).error, 'no-card');
});

test('a blurry photo is reported as blurry, not misread', () => {
    const result = OmrReader.read(shoot(fixture, { blur: 5, noise: 4, deg: 3 }, markPlan(2)), fixture);
    assert.equal(result.ok, false); assert.equal(result.error, 'blurry'); assert(result.quality.blurScore > 2);
});

test('full-resolution 3000×4000 photo is downscaled and read quickly', () => {
    const plan = markPlan(17), image = shoot(fixture, { w: 3000, h: 4000, deg: -8, persp: 0.07, blur: 3, noise: 6, fill: 0.7 }, plan);
    const started = Date.now(), result = OmrReader.read(image, fixture), ms = Date.now() - started;
    assert.equal(result.ok, true, result.error); assert.deepEqual(score(result, plan).wrong, []);
    assert(ms < 4000, `${ms}ms`);
    summary.push(`3000×4000 photo: read in ${ms}ms, crops ${result.writtenCrops[0].rgba.width}×${result.writtenCrops[0].rgba.height}`);
});

test('summary', () => { console.log(summary.map(line => `  ${line}`).join('\n')); });

console.log('OMR layout and reader: fiducials, round code, homography, bubble classification verified.');

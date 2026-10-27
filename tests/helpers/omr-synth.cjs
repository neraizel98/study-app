// Synthetic phone photos of the OMR card for omr-reader.test.js (pure JS, deterministic by seed).
// paperTexture() rasterises the A4 page from OmrLayout; photo() warps it into a cluttered, unevenly lit, blurred, noisy shot.
'use strict';

function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }

const PAGE = { w: 210, h: 297, cardX: 15, cardY: 15 };
const PAPER = [246, 244, 238], BLACK = [22, 22, 26], MAGENTA = [212, 36, 106], PINK = [251, 227, 236], GRAPHITE = [70, 70, 76];

// RGB page texture at ppm px/mm. marks: { [itemIndex]: [{ choice, kind:'pen'|'pencil'|'faint'|'residue', coverage?, darkness? }] }
function paperTexture(layout, options) {
    const o = { ppm: 8, mono: false, marks: {}, written: {}, seed: 1, ...options }, rand = rng(o.seed), ppm = o.ppm;
    const w = Math.round(PAGE.w * ppm), h = Math.round(PAGE.h * ppm), px = new Uint8ClampedArray(w * h * 3);
    for (let i = 0; i < w * h; i++) { px[i * 3] = PAPER[0]; px[i * 3 + 1] = PAPER[1]; px[i * 3 + 2] = PAPER[2]; }
    const ink = o.mono ? [100, 100, 100] : MAGENTA, soft = o.mono ? [232, 232, 232] : PINK;
    const toPx = (xMm, yMm) => [(PAGE.cardX + xMm) * ppm, (PAGE.cardY + yMm) * ppm];
    const blend = (i, color, a) => { for (let c = 0; c < 3; c++) px[i * 3 + c] = px[i * 3 + c] * (1 - a) + color[c] * a; };
    function rect(r, color, alpha) {
        const [x0, y0] = toPx(r.xMm, r.yMm), [x1, y1] = toPx(r.xMm + r.wMm, r.yMm + r.hMm);
        for (let y = Math.max(0, Math.round(y0)); y < Math.min(h, Math.round(y1)); y++) for (let x = Math.max(0, Math.round(x0)); x < Math.min(w, Math.round(x1)); x++) blend(y * w + x, color, alpha ?? 1);
    }
    function outline(r, t, color) {
        rect({ xMm: r.xMm, yMm: r.yMm, wMm: r.wMm, hMm: t }, color); rect({ xMm: r.xMm, yMm: r.yMm + r.hMm - t, wMm: r.wMm, hMm: t }, color);
        rect({ xMm: r.xMm, yMm: r.yMm, wMm: t, hMm: r.hMm }, color); rect({ xMm: r.xMm + r.wMm - t, yMm: r.yMm, wMm: t, hMm: r.hMm }, color);
    }
    function ellipse(cx, cy, rx, ry, paint) {
        const [x0, y0] = toPx(cx - rx * 1.3, cy - ry * 1.3), [x1, y1] = toPx(cx + rx * 1.3, cy + ry * 1.3);
        for (let y = Math.max(0, Math.floor(y0)); y < Math.min(h, Math.ceil(y1)); y++) for (let x = Math.max(0, Math.floor(x0)); x < Math.min(w, Math.ceil(x1)); x++) {
            const mx = (x + 0.5) / ppm - PAGE.cardX, my = (y + 0.5) / ppm - PAGE.cardY;
            paint(y * w + x, Math.hypot((mx - cx) / rx, (my - cy) / ry), mx, my);
        }
    }
    // Text-like clutter: rows of small glyph blocks.
    function text(r, color, size) {
        const step = size * 1.1;
        for (let x = r.xMm + 0.5; x < r.xMm + r.wMm - size; x += step) if (rand() > 0.15) {
            for (let k = 0; k < 3; k++) rect({ xMm: x + rand() * size * 0.6, yMm: r.yMm + r.hMm / 2 - size / 2 + rand() * size * 0.6, wMm: size * (0.2 + rand() * 0.3), hMm: size * (0.15 + rand() * 0.3) }, color);
        }
    }
    if (o.fiducials !== false) for (const f of layout.fiducials) rect({ xMm: f.xMm - f.sizeMm / 2, yMm: f.yMm - f.sizeMm / 2, wMm: f.sizeMm, hMm: f.sizeMm }, BLACK);
    for (const c of layout.codeCells) if (c.bit) rect(c, BLACK);
    for (const t of layout.timingMarks) rect(t, BLACK);
    text(layout.tip, BLACK, 2.2); text(layout.codeLabel, BLACK, 2.4);
    outline(layout.frame, 0.6, ink);
    rect({ ...layout.header, wMm: 45 }, ink); text({ ...layout.header, xMm: 55, wMm: 110 }, BLACK, 3.6);
    rect({ xMm: 0, yMm: layout.header.yMm + layout.header.hMm - 0.5, wMm: layout.frame.wMm, hMm: 0.5 }, ink);
    rect({ xMm: layout.idPanel.wMm - 0.5, yMm: layout.idPanel.yMm, wMm: 0.5, hMm: layout.idPanel.hMm }, ink);
    rect({ xMm: layout.timing.xMm, yMm: layout.timing.yMm, wMm: 0.35, hMm: layout.timing.hMm }, ink);
    // Left panel: 수험번호 bubbles and guide text.
    for (let c = 0; c < 6; c++) for (let d = 0; d < 10; d++) ellipse(6 + c * 7.5, 50 + d * 6.2, 1.8, 2.6, (i, r) => { if (r > 0.88 && r < 1) blend(i, ink, 1); });
    for (let l = 0; l < 10; l++) text({ xMm: 3, yMm: 175 + l * 4.5, wMm: 44, hMm: 3 }, ink, 2.2);
    for (const area of layout.areas) {
        rect(area.head, soft); rect({ xMm: area.column.xMm + area.column.wMm - 0.35, yMm: area.column.yMm, wMm: 0.35, hMm: area.column.hMm }, ink);
        rect({ xMm: area.head.xMm, yMm: area.head.yMm + area.head.hMm - 0.35, wMm: area.head.wMm, hMm: 0.35 }, ink);
        text({ ...area.head, xMm: area.head.xMm + 6, wMm: area.head.wMm - 12 }, ink, 3);
        for (let r = 0; r < layout.rowsMax; r++) rect({ xMm: area.column.xMm, yMm: area.rowTopMm + (r + 1) * area.rowHMm - 0.2, wMm: area.column.wMm, hMm: 0.2 }, ink);
        for (const row of area.rows) {
            rect(row.numberCell, soft); text({ ...row.numberCell, xMm: row.numberCell.xMm + 1.5, wMm: 3.5 }, ink, 2.6);
            if (row.writtenBox) {
                outline(row.writtenBox, 0.35, ink);
                const strokes = o.written[row.itemIndex];
                if (strokes) for (let s = 0; s < strokes; s++) {
                    const x0 = row.writtenBox.xMm + 3 + s * 4, y0 = row.writtenBox.yMm + 3;
                    for (let t = 0; t < 1; t += 0.01) rect({ xMm: x0 + t * 3, yMm: y0 + Math.sin(t * 6 + s) * 2 + t * 4, wMm: 0.5, hMm: 0.5 }, BLACK);
                }
            }
            for (const b of row.bubbles) {
                ellipse(b.xMm, b.yMm, b.rxMm, b.ryMm, (i, r, mx, my) => {
                    if (r > 1 - 0.3 / b.rxMm && r < 1) blend(i, ink, 1);
                    else if (Math.abs(mx - b.xMm) < 0.18 && Math.abs(my - b.yMm) < 1.1) blend(i, ink, 1);  // the printed digit
                });
                for (const mark of o.marks[row.itemIndex] || []) if (mark.choice === b.choice) fill(b, mark);
            }
        }
    }
    function fill(b, mark) {
        const preset = { pen: [0.95, 0.92, BLACK], pencil: [0.85, 0.55, GRAPHITE], faint: [0.7, 0.2, GRAPHITE], residue: [0.5, 0.06, GRAPHITE] }[mark.kind];
        const coverage = mark.coverage ?? preset[0], dark = mark.darkness ?? preset[1], color = preset[2];
        const scale = mark.kind === 'pen' ? 1.08 : 0.95, ox = (rand() - 0.5) * 0.4, oy = (rand() - 0.5) * 0.4, band = 0.35;
        const bands = Array.from({ length: Math.ceil(b.ryMm * 2.6 / band) + 1 }, () => rand() < coverage);
        ellipse(b.xMm + ox, b.yMm + oy, b.rxMm * scale, b.ryMm * scale, (i, r, mx, my) => {
            if (r > 1) return;
            const k = Math.floor((my - (b.yMm + oy - b.ryMm * scale)) / band);
            if (!bands[Math.max(0, Math.min(bands.length - 1, k))]) return;
            // darkness d means the red channel drops to paper·(1 − d)
            const d = Math.max(0, dark + (rand() - 0.5) * 0.12);
            blend(i, color, Math.min(1, d * PAPER[0] / (PAPER[0] - color[0])));
        });
    }
    return { w, h, ppm, px };
}

// Warps the page into a w×h photo. corners: photo px of the page corners TL, TR, BR, BL.
function photo(texture, options, homography, applyH) {
    const o = { w: 1200, h: 1600, blur: 0, noise: 4, light: null, shadow: null, clutter: true, seed: 7, ...options }, rand = rng(o.seed);
    const W = o.w, Hh = o.h, out = new Uint8ClampedArray(W * Hh * 4), bg = new Float32Array(W * Hh * 3);
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 3, grain = 0.75 + 0.25 * Math.sin(x * 0.05 + Math.sin(y * 0.01) * 4);
        bg[i] = 120 * grain; bg[i + 1] = 88 * grain; bg[i + 2] = 60 * grain;
    }
    if (o.clutter) for (let n = 0; n < 60; n++) {
        const s = 8 + rand() * 70, x0 = rand() * W, y0 = rand() * Hh, sq = rand() < 0.45, color = sq ? [15, 15, 18] : [rand() * 255, rand() * 255, rand() * 255];
        const ww = sq ? s : s * (0.3 + rand() * 3), hh = sq ? s : s * (0.3 + rand() * 3);
        for (let y = Math.max(0, y0 | 0); y < Math.min(Hh, y0 + hh); y++) for (let x = Math.max(0, x0 | 0); x < Math.min(W, x0 + ww); x++) { const i = (y * W + x) * 3; bg[i] = color[0]; bg[i + 1] = color[1]; bg[i + 2] = color[2]; }
    }
    const page = [[0, 0], [PAGE.w, 0], [PAGE.w, PAGE.h], [0, PAGE.h]], inv = homography(o.corners, page);
    const T = texture, tw = T.w, th = T.h;
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
        const [mx, my] = applyH(inv, x + 0.5, y + 0.5), o4 = (y * W + x) * 4, i3 = (y * W + x) * 3;
        let r, g, b;
        if (mx >= 0 && my >= 0 && mx < PAGE.w && my < PAGE.h) {
            const fx = Math.min(tw - 1.001, Math.max(0, mx * T.ppm - 0.5)), fy = Math.min(th - 1.001, Math.max(0, my * T.ppm - 0.5)), x0 = fx | 0, y0 = fy | 0, ax = fx - x0, ay = fy - y0;
            const at = (xx, yy, c) => T.px[(yy * tw + xx) * 3 + c];
            const v = c => (at(x0, y0, c) * (1 - ax) + at(x0 + 1, y0, c) * ax) * (1 - ay) + (at(x0, y0 + 1, c) * (1 - ax) + at(x0 + 1, y0 + 1, c) * ax) * ay;
            r = v(0); g = v(1); b = v(2);
        } else { r = bg[i3]; g = bg[i3 + 1]; b = bg[i3 + 2]; }
        let l = 1;
        if (o.light) l *= o.light[0] + o.light[1] * x / W + o.light[2] * y / Hh;
        if (o.shadow) { const d = (x * o.shadow.nx + y * o.shadow.ny - o.shadow.at) / o.shadow.soft; l *= 1 - o.shadow.depth / (1 + Math.exp(d)); }
        out[o4] = r * l; out[o4 + 1] = g * l; out[o4 + 2] = b * l; out[o4 + 3] = 255;
    }
    if (o.blur > 0) boxBlur(out, W, Hh, o.blur);
    if (o.noise > 0) for (let i = 0; i < W * Hh * 4; i++) if ((i & 3) !== 3) out[i] = out[i] + (rand() + rand() + rand() - 1.5) * o.noise * 2;
    return { width: W, height: Hh, data: out };
}

function boxBlur(data, W, H, radius) {
    const r = Math.max(1, Math.round(radius)), tmp = new Float32Array(W * H);
    for (let c = 0; c < 3; c++) for (let pass = 0; pass < 2; pass++) {
        for (let y = 0; y < H; y++) { let s = 0; for (let x = -r; x <= r; x++) s += data[(y * W + Math.min(W - 1, Math.max(0, x))) * 4 + c];
            for (let x = 0; x < W; x++) { tmp[y * W + x] = s / (2 * r + 1); s += data[(y * W + Math.min(W - 1, x + r + 1)) * 4 + c] - data[(y * W + Math.max(0, x - r)) * 4 + c]; } }
        for (let x = 0; x < W; x++) { let s = 0; for (let y = -r; y <= r; y++) s += tmp[Math.min(H - 1, Math.max(0, y)) * W + x];
            for (let y = 0; y < H; y++) { data[(y * W + x) * 4 + c] = s / (2 * r + 1); s += tmp[Math.min(H - 1, y + r + 1) * W + x] - tmp[Math.max(0, y - r) * W + x]; } }
    }
}

// Page corners for a shot: page scaled to `fill` of the frame, rotated `deg`, with per-corner perspective jitter `persp` (fraction).
function corners(o) {
    const { w, h, fill = 0.85, deg = 0, persp = 0, dx = 0, dy = 0, seed = 3 } = o, rand = rng(seed);
    const quarter = Math.abs(Math.round(deg / 90)) % 2 === 1, scale = fill * Math.min(w / (quarter ? PAGE.h : PAGE.w), h / (quarter ? PAGE.w : PAGE.h));
    const a = deg * Math.PI / 180, cx = w / 2 + dx, cy = h / 2 + dy;
    return [[0, 0], [PAGE.w, 0], [PAGE.w, PAGE.h], [0, PAGE.h]].map(([x, y]) => {
        const u = (x - PAGE.w / 2) * scale, v = (y - PAGE.h / 2) * scale;
        const j = persp * PAGE.w * scale;
        return [cx + u * Math.cos(a) - v * Math.sin(a) + (rand() - 0.5) * 2 * j, cy + u * Math.sin(a) + v * Math.cos(a) + (rand() - 0.5) * 2 * j];
    });
}

module.exports = { rng, paperTexture, photo, corners, boxBlur, PAGE };

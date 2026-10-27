(function (root) {
    'use strict';
    // Reads a phone photo of the printed OMR card (omr-layout.js). Dependency-free so it runs in the browser and in node.
    // image: { width, height, data: RGBA Uint8ClampedArray } (canvas getImageData). Returns codes only; wording is the caller's.
    // Pipeline: downscale (red channel, so the magenta print drops out like a scanner's dropout colour) → adaptive threshold →
    // solid square blobs → the 4-blob set whose homography lands on the timing marks with paper around every corner →
    // blur / round-code check → bubble darkness above the blank-bubble template.
    const DEFAULTS = { maxSide: 1600, cropPxPerMm: 8, maxBlurMm: 2, minPxPerMm: 2.5 };
    // Darkness is 1 − v/white (white measured around each row) above the blank-bubble template. A sample is inked at
    // ≥ INK (soft pencil ≈ 0.5, sign pen ≈ 0.9). An inked share ≥ MARK is a mark; FAINT..MARK, or a mean extra
    // darkness ≥ LIGHT·TINT without ink (light pencil), is uncertain ('faint').
    const INK = 0.25, TINT = 0.2, MARK = 0.3, FAINT = 0.12, LIGHT = 0.2;

    // ---------- geometry ----------
    function solve(A, b) {
        const n = b.length;
        for (let c = 0; c < n; c++) {
            let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
            if (Math.abs(A[p][c]) < 1e-12) return null;
            [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
            for (let r = c + 1; r < n; r++) { const f = A[r][c] / A[c][c]; for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; }
        }
        const x = new Array(n);
        for (let r = n - 1; r >= 0; r--) { let s = b[r]; for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k]; x[r] = s / A[r][r]; }
        return x;
    }
    function normalizer(pts) {
        const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
        const d = pts.reduce((s, p) => s + Math.hypot(p[0] - cx, p[1] - cy), 0) / pts.length || 1, k = Math.SQRT2 / d;
        return { T: [k, 0, -k * cx, 0, k, -k * cy, 0, 0, 1], inv: [1 / k, 0, cx, 0, 1 / k, cy, 0, 0, 1] };
    }
    const mul = (a, b) => [0, 1, 2].flatMap(r => [0, 1, 2].map(c => a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c]));
    // Homography mapping src[i] → dst[i] (≥ 4 pairs, least squares), as a 9-array; null when degenerate.
    function homography(src, dst) {
        const ns = normalizer(src), nd = normalizer(dst), A = [], b = [];
        src.forEach((p, i) => {
            const [x, y] = applyH(ns.T, p[0], p[1]), [u, v] = applyH(nd.T, dst[i][0], dst[i][1]);
            A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
            A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
        });
        const AtA = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => A.reduce((s, row) => s + row[r] * row[c], 0)));
        const Atb = Array.from({ length: 8 }, (_, r) => A.reduce((s, row, i) => s + row[r] * b[i], 0));
        const h = solve(AtA, Atb);
        if (!h) return null;
        const H = mul(nd.inv, mul([...h, 1], ns.T));
        return H.map(v => v / H[8]);
    }
    function applyH(H, x, y) { const w = H[6] * x + H[7] * y + H[8]; return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w]; }

    // ---------- image ----------
    // Box-downscaled red channel, then 3×3 smoothed against sensor noise; pixel centres sit at i + 0.5 and
    // small x·k is the full-resolution x. k rounds down so the long side stays between maxSide and 2·maxSide.
    function downscale(image, maxSide) {
        const k = Math.max(1, Math.floor(Math.max(image.width, image.height) / maxSide));
        const w = Math.floor(image.width / k), h = Math.floor(image.height / k), g = new Float32Array(w * h), src = image.data, W = image.width;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            let s = 0;
            for (let dy = 0; dy < k; dy++) { let o = ((y * k + dy) * W + x * k) * 4; for (let dx = 0; dx < k; dx++, o += 4) s += src[o]; }
            g[y * w + x] = s / (k * k);
        }
        return smooth({ w, h, g, k });
    }
    function smooth(img) {
        const { w, h } = img, g = new Float32Array(w * h);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            let s = 0, n = 0;
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < w && yy < h) { s += img.g[yy * w + xx]; n++; } }
            g[y * w + x] = s / n;
        }
        return { ...img, g };
    }
    // Further box reduction of a downscaled image (for the blurry-photo retry).
    function shrink(img, f) {
        const w = Math.floor(img.w / f), h = Math.floor(img.h / f), g = new Float32Array(w * h);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            let s = 0; for (let dy = 0; dy < f; dy++) for (let dx = 0; dx < f; dx++) s += img.g[(y * f + dy) * img.w + x * f + dx];
            g[y * w + x] = s / (f * f);
        }
        return { w, h, g, k: img.k * f };
    }
    function sample(img, x, y) {
        const fx = Math.min(img.w - 1.001, Math.max(0, x - 0.5)), fy = Math.min(img.h - 1.001, Math.max(0, y - 0.5));
        const x0 = fx | 0, y0 = fy | 0, ax = fx - x0, ay = fy - y0, i = y0 * img.w + x0, g = img.g;
        return (g[i] * (1 - ax) + g[i + 1] * ax) * (1 - ay) + (g[i + img.w] * (1 - ax) + g[i + img.w + 1] * ax) * ay;
    }
    const inside = (img, p) => p[0] >= 0 && p[1] >= 0 && p[0] < img.w && p[1] < img.h;
    // Mean over an n×n grid spanning ±hx, ±hy mm around (x, y) mm.
    function mean(img, H, x, y, hx, hy, n) {
        let s = 0; const m = n || 3;
        for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) { const p = applyH(H, x + hx * (2 * i / (m - 1) - 1), y + hy * (2 * j / (m - 1) - 1)); s += sample(img, p[0], p[1]); }
        return s / (m * m);
    }

    // Dark mask from a local-mean threshold (integral image), window ≈ 1/6 of the short side.
    function threshold(img) {
        const { w, h, g } = img, W = w + 1, I = new Float64Array(W * (h + 1)), dark = new Uint8Array(w * h);
        for (let y = 0; y < h; y++) { let row = 0; for (let x = 0; x < w; x++) { row += g[y * w + x]; I[(y + 1) * W + x + 1] = I[y * W + x + 1] + row; } }
        const r = Math.max(8, Math.round(Math.min(w, h) / 12));
        for (let y = 0; y < h; y++) {
            const y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
            for (let x = 0; x < w; x++) {
                const x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1);
                const m = (I[y1 * W + x1] - I[y0 * W + x1] - I[y1 * W + x0] + I[y0 * W + x0]) / ((x1 - x0) * (y1 - y0)), v = g[y * w + x];
                if (v < m * 0.72 && m - v > 14) dark[y * w + x] = 1;
            }
        }
        return dark;
    }

    // ---------- fiducial candidates ----------
    function components(dark, w, h, minArea, maxArea) {
        const label = new Int32Array(w * h), stack = new Int32Array(w * h), out = [];
        let next = 0;
        for (let start = 0; start < w * h; start++) {
            if (!dark[start] || label[start]) continue;
            next++; let top = 0, area = 0, sx = 0, sy = 0, x0 = w, x1 = 0, y0 = h, y1 = 0;
            stack[top++] = start; label[start] = next;
            while (top) {
                const i = stack[--top], x = i % w, y = (i - x) / w;
                area++; sx += x; sy += y; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
                if (x > 0 && dark[i - 1] && !label[i - 1]) { label[i - 1] = next; stack[top++] = i - 1; }
                if (x < w - 1 && dark[i + 1] && !label[i + 1]) { label[i + 1] = next; stack[top++] = i + 1; }
                if (y > 0 && dark[i - w] && !label[i - w]) { label[i - w] = next; stack[top++] = i - w; }
                if (y < h - 1 && dark[i + w] && !label[i + w]) { label[i + w] = next; stack[top++] = i + w; }
            }
            if (area >= minArea && area <= maxArea) out.push({ id: next, area, cx: sx / area + 0.5, cy: sy / area + 0.5, x0, x1, y0, y1 });
        }
        return { label, list: out };
    }
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    function hull(points) {
        const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), lower = [], upper = [];
        for (const q of p) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
        for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
        return lower.slice(0, -1).concat(upper.slice(0, -1));
    }
    const polyArea = poly => Math.abs(poly.reduce((s, p, i) => { const q = poly[(i + 1) % poly.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    // A filled square: solid (area ≈ hull) and its hull is well covered by an inscribed quadrilateral (an ellipse only reaches 2/π).
    function squareness(c, label, w) {
        const pts = [];
        for (let y = c.y0; y <= c.y1; y++) {
            let left = -1, right = -1;
            for (let x = c.x0; x <= c.x1; x++) if (label[y * w + x] === c.id) { if (left < 0) left = x; right = x; }
            if (left >= 0) pts.push([left, y], [left, y + 1], [right + 1, y], [right + 1, y + 1]);
        }
        const hp = hull(pts), ha = polyArea(hp);
        if (!ha || c.area / ha < 0.88) return null;
        const center = [c.cx, c.cy], far = (from, list) => list.reduce((best, p) => dist(p, from) > dist(best, from) ? p : best, list[0]);
        const p1 = far(center, hp), p3 = far(p1, hp);
        let p2 = null, p4 = null, s2 = 0, s4 = 0;
        for (const p of hp) { const s = cross(p1, p3, p); if (s > s2) { s2 = s; p2 = p; } if (-s > s4) { s4 = -s; p4 = p; } }
        if (!p2 || !p4) return null;
        const quad = [p1, p2, p3, p4], qa = polyArea(quad), sides = quad.map((p, i) => dist(p, quad[(i + 1) % 4]));
        if (qa / ha < 0.75 || Math.max(...sides) / Math.min(...sides) > 2.2) return null;
        return { ...c, side: Math.sqrt(c.area) };
    }
    function candidates(img) {
        const short = Math.min(img.w, img.h), minSide = Math.max(5, short * 0.012), maxSide = short * 0.12;
        const { label, list } = components(threshold(img), img.w, img.h, minSide * minSide * 0.5, maxSide * maxSide);
        return list.filter(c => {
            const bw = c.x1 - c.x0 + 1, bh = c.y1 - c.y0 + 1;
            return Math.max(bw, bh) / Math.min(bw, bh) <= 2.2 && c.area / (bw * bh) >= 0.45;
        }).map(c => squareness(c, label, img.w)).filter(Boolean).sort((a, b) => b.area - a.area).slice(0, 40);
    }

    // ---------- card location ----------
    // { ticks, paper }: share of timing ticks dark against the paper between them, and how white the paper around the
    // weakest fiducial is (ring / paper). A clutter square standing in for a corner has no paper around it, so it loses
    // to the real corner even when the ticks still line up. 0 when a fiducial is off-image or not a dark core.
    function verify(img, H, layout) {
        const marks = layout.timingMarks, whites = []; let hits = 0;
        marks.forEach((m, i) => {
            const cx = m.xMm + m.wMm / 2, cy = m.yMm + m.hMm / 2, next = marks[i + 1] || marks[i - 1], gap = (next.yMm - m.yMm) / 2;
            const p = applyH(H, cx, cy); if (!inside(img, p)) return;
            const tick = mean(img, H, cx, cy, m.wMm * 0.3, m.hMm * 0.25), white = mean(img, H, cx, cy + gap, m.wMm * 0.3, Math.abs(gap) * 0.25);
            whites.push(white);
            if (tick < white * 0.7) hits++;
        });
        const ticks = hits / marks.length;
        if (ticks < 0.6) return { ticks, paper: 0 };
        const paper = whites.sort((a, b) => a - b)[whites.length >> 1];
        let worst = Infinity;
        for (const f of layout.fiducials) {
            if (!inside(img, applyH(H, f.xMm, f.yMm))) return { ticks: 0, paper: 0 };
            const core = mean(img, H, f.xMm, f.yMm, f.sizeMm * 0.25, f.sizeMm * 0.25), d = f.sizeMm / 2 + 1.5;
            let ring = 0;
            for (let a = 0; a < 8; a++) { const p = applyH(H, f.xMm + d * Math.sign(Math.round(Math.cos(a * Math.PI / 4) * 2)), f.yMm + d * Math.sign(Math.round(Math.sin(a * Math.PI / 4) * 2))); ring += sample(img, p[0], p[1]) / 8; }
            if (!(core < ring * 0.5)) return { ticks: 0, paper: 0 };
            worst = Math.min(worst, ring / paper);
        }
        return { ticks, paper: Math.min(1, worst) };
    }
    function locate(img, layout) {
        const list = candidates(img), F = layout.fiducials, fsize = F[0].sizeMm;
        const spanShort = Math.min(dist([F[0].xMm, F[0].yMm], [F[1].xMm, F[1].yMm]), dist([F[1].xMm, F[1].yMm], [F[2].xMm, F[2].yMm]));
        const combos = [];
        for (let a = 0; a < list.length; a++) for (let b = a + 1; b < list.length; b++) for (let c = b + 1; c < list.length; c++) for (let d = c + 1; d < list.length; d++) {
            const set = [list[a], list[b], list[c], list[d]], sides = set.map(s => s.side);
            if (Math.max(...sides) / Math.min(...sides) > 1.8) continue;
            const mx = set.reduce((s, p) => s + p.cx, 0) / 4, my = set.reduce((s, p) => s + p.cy, 0) / 4;
            const quad = set.slice().sort((p, q) => Math.atan2(p.cy - my, p.cx - mx) - Math.atan2(q.cy - my, q.cx - mx));
            const pts = quad.map(p => [p.cx, p.cy]);
            if (!pts.every((p, i) => cross(p, pts[(i + 1) % 4], pts[(i + 2) % 4]) > 0)) continue;
            const L = pts.map((p, i) => dist(p, pts[(i + 1) % 4]));
            const r1 = L[0] / L[2], r2 = L[1] / L[3];
            if (r1 < 0.55 || r1 > 1.8 || r2 < 0.55 || r2 > 1.8) continue;
            const s1 = (L[0] + L[2]) / 2, s2 = (L[1] + L[3]) / 2, mean4 = sides.reduce((s, v) => s + v, 0) / 4;
            if (Math.max(s1, s2) / Math.min(s1, s2) > 2.4) continue;
            const rel = Math.min(s1, s2) / mean4, expected = spanShort / fsize;
            if (rel < expected * 0.45 || rel > expected * 1.8) continue;
            combos.push({ quad, pts, area: polyArea(pts) });
        }
        combos.sort((p, q) => q.area - p.area);
        let best = null;
        for (const combo of combos.slice(0, 300)) {
            for (let k = 0; k < 4; k++) {
                const dst = F.map((_, i) => combo.pts[(i + k) % 4]), H = homography(F.map(f => [f.xMm, f.yMm]), dst);
                if (!H) continue;
                const v = verify(img, H, layout), rank = v.ticks + v.paper;
                if (v.ticks >= 0.6 && v.paper >= 0.35 && (!best || rank > best.rank + 1e-9)) best = { H, score: v.ticks, rank, pts: dst };
            }
            if (best && best.score >= 0.95 && best.rank >= 1.8) break;
        }
        return best;
    }

    // ---------- quality ----------
    // Edge spread (10 %→90 %) across the fiducial sides in mm; larger is blurrier.
    function blurOf(img, H, layout) {
        const widths = [];
        for (const f of layout.fiducials) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const half = f.sizeMm / 2, prof = [];
            for (let t = half - 2; t <= half + 2.0001; t += 0.1) { const p = applyH(H, f.xMm + dx * t, f.yMm + dy * t); prof.push(sample(img, p[0], p[1])); }
            const avg = list => list.reduce((a, b) => a + b, 0) / list.length, lo = avg(prof.slice(0, 8)), hi = avg(prof.slice(-8));
            if (hi - lo < 20) continue;
            const at = level => prof.findIndex(v => v >= lo + (hi - lo) * level), a = at(0.1), b = at(0.9);
            if (a >= 0 && b >= a) widths.push((b - a) * 0.1);
        }
        widths.sort((a, b) => a - b);
        return widths.length ? widths[widths.length >> 1] : Infinity;
    }

    // ---------- reading ----------
    function readCode(img, H, layout) {
        return layout.codeCells.map(cell => {
            const cx = cell.xMm + cell.wMm / 2, cy = cell.yMm + cell.hMm / 2;
            const v = mean(img, H, cx, cy, cell.wMm * 0.25, cell.hMm * 0.25), white = mean(img, H, cx, cell.yMm - 1.2, cell.wMm * 0.3, 0.3);
            return v < white * 0.6 ? 1 : 0;
        });
    }
    const percentile = (values, q) => { const s = values.slice().sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
    // Darkness at fixed sample points over the bubble's inner 70 % (same order for every bubble).
    function bubbleSamples(img, H, b, white) {
        const out = [];
        for (let i = 0; i < 7; i++) for (let j = 0; j < 9; j++) {
            const u = (i / 6) * 2 - 1, v = (j / 8) * 2 - 1;
            if (u * u + v * v > 1) continue;
            const p = applyH(H, b.xMm + u * b.rxMm * 0.7, b.yMm + v * b.ryMm * 0.7);
            out.push(1 - sample(img, p[0], p[1]) / white);
        }
        return out;
    }
    function rowWhite(img, H, row) {
        const values = [], bs = row.bubbles;
        bs.forEach((b, i) => {
            for (const dy of [-1, 1]) { const p = applyH(H, b.xMm, b.yMm + dy * (b.ryMm + 1.2)); values.push(sample(img, p[0], p[1])); }
            if (i) { const p = applyH(H, (b.xMm + bs[i - 1].xMm) / 2, b.yMm); values.push(sample(img, p[0], p[1])); }
        });
        return Math.max(1, percentile(values, 0.8));
    }
    // fills: inked share per bubble; tints: mean extra darkness / TINT (light pencil).
    function classify(fills, tints) {
        const order = fills.map((f, i) => [f, i]).sort((a, b) => b[0] - a[0]), [f1, i1] = order[0], f2 = order[1] ? order[1][0] : 0;
        const strong = fills.filter(f => f >= MARK).length, weakAt = fills.map((f, i) => f < MARK && (f >= FAINT || tints[i] >= LIGHT));
        const weak = weakAt.filter(Boolean).length, clamp = v => Math.round(Math.min(1, Math.max(0, v)) * 100) / 100;
        if (strong >= 2) return { choice: null, status: 'multiple', confidence: clamp(f2 / 0.7) };
        if (strong === 1 && (weak === 0 || f1 - f2 >= 0.35)) return { choice: i1 + 1, status: 'ok', confidence: clamp(Math.min(f1 / 0.7, (f1 - f2) / 0.5)) };
        if (strong === 1) return { choice: i1 + 1, status: 'faint', confidence: clamp(f1 / MARK * 0.5) };
        if (weak) {
            const t = tints.map((v, i) => weakAt[i] ? v + fills[i] : -1), best = t.indexOf(Math.max(...t));
            return { choice: weak === 1 ? best + 1 : null, status: 'faint', confidence: clamp(Math.max(...t) / 2) };
        }
        return { choice: null, status: 'blank', confidence: clamp(1 - Math.max(f1 / FAINT, Math.max(...tints) / LIGHT)) };
    }
    function crop(image, Hfull, box, ppm) {
        const pad = 0.5, w = Math.max(1, Math.round((box.wMm + 2 * pad) * ppm)), h = Math.max(1, Math.round((box.hMm + 2 * pad) * ppm));
        const out = new Uint8ClampedArray(w * h * 4), W = image.width, Hh = image.height, src = image.data;
        let ink = 0, total = 0;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            const p = applyH(Hfull, box.xMm - pad + (x + 0.5) / ppm, box.yMm - pad + (y + 0.5) / ppm);
            const fx = Math.min(W - 1.001, Math.max(0, p[0] - 0.5)), fy = Math.min(Hh - 1.001, Math.max(0, p[1] - 0.5)), x0 = fx | 0, y0 = fy | 0, ax = fx - x0, ay = fy - y0;
            const o = (y * w + x) * 4, i = (y0 * W + x0) * 4;
            for (let c = 0; c < 4; c++) out[o + c] = (src[i + c] * (1 - ax) + src[i + 4 + c] * ax) * (1 - ay) + (src[i + W * 4 + c] * (1 - ax) + src[i + W * 4 + 4 + c] * ax) * ay;
        }
        // Ink inside the box (border and the printed '단답형' label excluded): share of pixels clearly darker than the paper.
        const reds = [];
        for (let y = Math.round(1.3 * ppm); y < h - 1.3 * ppm; y++) for (let x = Math.round(1.3 * ppm); x < w - 1.3 * ppm; x++) if (x > 10 * ppm || y > 3.6 * ppm) reds.push(out[(y * w + x) * 4]);
        const paper = reds.length ? percentile(reds, 0.9) : 255;
        for (const r of reds) { total++; if (r < paper * 0.6) ink++; }
        return { rgba: { width: w, height: h, data: out }, inkRatio: total ? Math.round(ink / total * 1000) / 1000 : 0 };
    }

    function read(image, paperSet, options) {
        const opt = { ...DEFAULTS, ...(options || {}) }, layout = opt.layout || root.OmrLayout.build(paperSet);
        if (!image || !image.data || !(image.width > 0) || !(image.height > 0)) return { ok: false, error: 'no-card' };
        const img = downscale(image, opt.maxSide);
        let found = locate(img, layout);
        // Blur or weak contrast can hide the timing marks / fiducial corners at full size; a coarser copy often still
        // finds the card. Reading then continues on the full-size image, and the blur check decides 'blurry'.
        for (const f of [2, 4]) {
            if (found || Math.min(img.w, img.h) / f < 200) break;
            const coarse = locate(shrink(img, f), layout);
            if (coarse) found = { ...coarse, H: mul([f, 0, 0, 0, f, 0, 0, 0, 1], coarse.H), pts: coarse.pts.map(p => [p[0] * f, p[1] * f]) };
        }
        if (!found) return { ok: false, error: 'no-card' };
        const H = found.H, F = layout.fiducials;
        const pxPerMm = (dist(found.pts[0], found.pts[1]) / dist([F[0].xMm, F[0].yMm], [F[1].xMm, F[1].yMm]) + dist(found.pts[1], found.pts[2]) / dist([F[1].xMm, F[1].yMm], [F[2].xMm, F[2].yMm])) / 2;
        const blur = blurOf(img, H, layout), top = applyH(H, F[1].xMm, F[1].yMm), origin = applyH(H, F[0].xMm, F[0].yMm);
        const quality = {
            blurScore: Math.round(blur * 100) / 100, skewDeg: Math.round(Math.atan2(top[1] - origin[1], top[0] - origin[0]) * 1800 / Math.PI) / 10,
            pxPerMm: Math.round(pxPerMm * img.k * 100) / 100, timingScore: Math.round(found.score * 100) / 100
        };
        const Hfull = mul([img.k, 0, 0, 0, img.k, 0, 0, 0, 1], H);
        const fiducials = F.map(f => { const p = applyH(Hfull, f.xMm, f.yMm); return { id: f.id, x: Math.round(p[0] * 10) / 10, y: Math.round(p[1] * 10) / 10 }; });
        const base = { quality, fiducials, homography: Hfull };
        if (!(blur <= opt.maxBlurMm) || pxPerMm < opt.minPxPerMm) return { ok: false, error: 'blurry', ...base };
        const bits = readCode(img, H, layout), detected = root.OmrLayout.decode(bits), expected = layout.code;
        const want = root.OmrLayout.code(paperSet).bits, misses = bits.reduce((s, bit, i) => s + (bit !== want[i] ? 1 : 0), 0);
        const matches = detected.valid ? detected.attemptNo === expected.attemptNo && detected.hash === expected.hash : misses <= 1;
        if (!matches) return { ok: false, error: 'wrong-card', attemptNo: detected.attemptNo, code: { detected: { ...detected, bits }, expected: { attemptNo: expected.attemptNo, hash: expected.hash } }, ...base };
        const answers = [], writtenCrops = [];
        for (const area of layout.areas) {
            const rows = area.rows.filter(r => r.kind === 'choice').map(row => {
                const white = rowWhite(img, H, row);
                return { row, raw: row.bubbles.map(b => bubbleSamples(img, H, b, white)) };
            });
            // Blank bubbles dominate every 영역, so the per-point median is the empty printed bubble (digit, outline
            // bleeding in through blur, mono-print grey). Marks are measured as darkness above that template.
            const all = rows.flatMap(r => r.raw), template = all.length ? all[0].map((_, j) => percentile(all.map(s => s[j]), 0.5)) : [];
            const share = (s, level) => Math.round(s.filter((d, j) => d - template[j] >= level).length / s.length * 1000) / 1000;
            for (const { row, raw } of rows) {
                const tint = s => Math.round(Math.max(0, s.reduce((sum, d, j) => sum + d - template[j], 0) / s.length / TINT) * 1000) / 1000;
                const fills = raw.map(s => share(s, INK)), tints = raw.map(tint);
                answers.push({ area: area.key, number: row.number, itemIndex: row.itemIndex, ...classify(fills, tints), fills, tints });
            }
            for (const row of area.rows.filter(r => r.writtenBox)) writtenCrops.push({ area: area.key, number: row.number, itemIndex: row.itemIndex, ...crop(image, Hfull, row.writtenBox, opt.cropPxPerMm) });
        }
        return { ok: true, attemptNo: expected.attemptNo, answers, writtenCrops, ...base };
    }

    root.OmrReader = { read, homography, applyH, THRESHOLDS: Object.freeze({ INK, TINT, MARK, FAINT, LIGHT }) };
})(typeof window !== 'undefined' ? window : globalThis);

(function (root) {
    'use strict';
    // Single source of truth for the printed OMR answer card (mock-paper.js renders it, omr-reader.js reads it).
    // Every coordinate is in millimetres in the card's own frame: the origin is the outer top-left corner of the
    // top-left fiducial, x grows right and y grows down. Rects are { xMm, yMm, wMm, hMm } (top-left + size);
    // bubbles are centres with radii. Changing any number here changes print and reader together.
    const VERSION = 1;
    const CARD = { w: 180, h: 262 };
    const FID = 7;                       // solid black corner squares, distinct from the 3.2×1.6 timing ticks
    const FRAME = { xMm: 0, yMm: 10, wMm: 180, hMm: 240 };
    const HEADER_H = 11, ID_W = 50, TIMING_W = 5, HEAD_H = 10, LEGEND_H = 5, NUMBER_W = 6.5, ROW_PAD_RIGHT = 1.4;
    const TICKS = 36, TICK = { w: 3.2, h: 1.6 }, TICK_PAD = 2;
    const CODE = { x: 12, y: 256.5, pitch: 3, w: 2.2, h: 4 };  // round code: [1][attempt:3][hash:16][check:4][1], separate cells
    const CODE_BITS = 25;
    const BUBBLE = { rx: 1.8, ry: 2.6 };

    const r3 = value => Math.round(value * 1000) / 1000;
    const rect = (x, y, w, h) => ({ xMm: r3(x), yMm: r3(y), wMm: r3(w), hMm: r3(h) });

    // 16-bit FNV-1a fold over weekKey and the question ids in print order.
    function hashOf(set) {
        const items = Array.isArray(set?.items) ? set.items : [];
        const text = `${set?.weekKey || ''}|${items.map(q => (q && (q.id ?? q.question)) ?? '').join(',')}`;
        let h = 0x811c9dc5;
        for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
        return ((h >>> 16) ^ (h & 0xffff)) >>> 0;
    }
    const checkOf = (attempt, hash) => (attempt * 7 + (hash & 15) + ((hash >> 4) & 15) * 3 + ((hash >> 8) & 15) * 5 + ((hash >> 12) & 15) * 9 + 5) & 15;
    const toBits = (value, count) => Array.from({ length: count }, (_, i) => (value >> (count - 1 - i)) & 1);
    const fromBits = bits => bits.reduce((value, bit) => value * 2 + (bit ? 1 : 0), 0);

    function code(set) {
        const attemptNo = Math.min(7, Math.max(1, Math.floor(Number(set?.attemptNo)) || 1)), hash = hashOf(set);
        const bits = [1, ...toBits(attemptNo, 3), ...toBits(hash, 16), ...toBits(checkOf(attemptNo, hash), 4), 1];
        const hashHex = hash.toString(16).toUpperCase().padStart(4, '0');
        return { attemptNo, hash, hashHex, bits, label: `판독 코드 · 제${attemptNo}회 · ${set?.weekKey || '-'} · ${hashHex}` };
    }
    // bits read from a card → { valid, attemptNo, hash }; valid means sentinels and checksum agree.
    function decode(bits) {
        if (!Array.isArray(bits) || bits.length !== CODE_BITS) return { valid: false, attemptNo: null, hash: null };
        const attemptNo = fromBits(bits.slice(1, 4)), hash = fromBits(bits.slice(4, 20)), check = fromBits(bits.slice(20, 24));
        const valid = bits[0] === 1 && bits[24] === 1 && attemptNo >= 1 && check === checkOf(attemptNo, hash);
        return { valid, attemptNo: valid ? attemptNo : null, hash: valid ? hash : null };
    }

    function build(paperSet) {
        const set = paperSet || {}, items = Array.isArray(set.items) ? set.items : [];
        const list = root.MockPaper.areas(items);
        const choiceCount = Math.max(4, ...list.flatMap(a => a.questions.map(q => q.item.kind === 'written' ? 0 : (Array.isArray(q.item.choices) ? q.item.choices.length : 0))));
        const rowsMax = Math.max(1, ...list.map(a => a.questions.length));
        const half = FID / 2;
        const fiducials = [['tl', half, half], ['tr', CARD.w - half, half], ['br', CARD.w - half, CARD.h - half], ['bl', half, CARD.h - half]]
            .map(([id, x, y]) => ({ id, xMm: x, yMm: y, sizeMm: FID }));
        const frameBottom = FRAME.yMm + FRAME.hMm, bodyTop = FRAME.yMm + HEADER_H;
        const timingX = CARD.w - TIMING_W, pitchT = (FRAME.hMm - 2 * TICK_PAD) / TICKS;
        const timingMarks = Array.from({ length: TICKS }, (_, i) => rect(timingX + (TIMING_W - TICK.w) / 2, FRAME.yMm + TICK_PAD + pitchT * (i + 0.5) - TICK.h / 2, TICK.w, TICK.h));
        const answersX = ID_W, colW = (timingX - answersX) / Math.max(1, list.length);
        const rowTop = bodyTop + HEAD_H + LEGEND_H, rowH = (frameBottom - rowTop) / rowsMax;
        const c = code(set);
        const codeCells = c.bits.map((bit, index) => ({ index, bit, ...rect(CODE.x + index * CODE.pitch + (CODE.pitch - CODE.w) / 2, CODE.y, CODE.w, CODE.h) }));
        const areas = list.map((area, k) => {
            const x0 = answersX + k * colW, zone0 = x0 + NUMBER_W, zoneW = colW - NUMBER_W - ROW_PAD_RIGHT, pitch = zoneW / choiceCount;
            const rx = Math.min(BUBBLE.rx, pitch * 0.4), ry = Math.min(BUBBLE.ry, rowH * 0.36);
            const centers = Array.from({ length: choiceCount }, (_, i) => r3(zone0 + pitch * (i + 0.5)));
            const rows = area.questions.map((question, r) => {
                const y = rowTop + r * rowH, kind = question.item.kind === 'written' ? 'written' : 'choice';
                const row = { number: question.no, itemIndex: items.indexOf(question.item), kind, rect: rect(x0, y, colW, rowH), numberCell: rect(x0, y, NUMBER_W, rowH), bubbles: [] };
                if (kind === 'written') row.writtenBox = rect(zone0 + 1, y + 1.2, colW - NUMBER_W - 1 - ROW_PAD_RIGHT, rowH - 2.4);
                else row.bubbles = centers.map((xMm, i) => ({ choice: i + 1, xMm, yMm: r3(y + rowH / 2), rMm: r3(Math.min(rx, ry)), rxMm: r3(rx), ryMm: r3(ry) }));
                return row;
            });
            return {
                key: area.id, name: area.name, period: area.period,
                column: rect(x0, bodyTop, colW, frameBottom - bodyTop), head: rect(x0, bodyTop, colW, HEAD_H),
                legend: { ...rect(x0, bodyTop + HEAD_H, colW, LEGEND_H), marks: centers.map((xMm, i) => ({ choice: i + 1, xMm })) },
                rowTopMm: r3(rowTop), rowHMm: r3(rowH), rows
            };
        });
        return {
            version: VERSION, pageMm: { w: CARD.w, h: CARD.h }, fiducials, code: { attemptNo: c.attemptNo, hash: c.hash, hashHex: c.hashHex, label: c.label },
            codeCells, codeLabel: rect(CODE.x + CODE_BITS * CODE.pitch + 4, CARD.h - FID, CARD.w - FID - 5 - (CODE.x + CODE_BITS * CODE.pitch + 4), FID),
            tip: rect(FID + 5, 0, CARD.w - 2 * (FID + 5), FID), frame: rect(FRAME.xMm, FRAME.yMm, FRAME.wMm, FRAME.hMm),
            header: rect(0, FRAME.yMm, timingX, HEADER_H), idPanel: rect(0, bodyTop, ID_W, frameBottom - bodyTop),
            timing: rect(timingX, FRAME.yMm, TIMING_W, FRAME.hMm), timingMarks, choiceCount, rowsMax, areas
        };
    }

    root.OmrLayout = { build, code, decode, hashOf, VERSION, CODE_BITS };
})(typeof window !== 'undefined' ? window : globalThis);

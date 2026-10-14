/* Math scratchpad: a floating, unsaved work area (handwriting on a grid, or typed notes).
   Nothing is written to storage — content lives only while this page stays open. */
(function (root) {
    'use strict';
    if (root.SmartStudyScratchpad) return;

    const COLORS = [
        { id: 'ink', value: '#2b2620', label: '검정' },
        { id: 'blue', value: '#2f68c8', label: '파랑' },
        { id: 'red', value: '#c0392b', label: '빨강' }
    ];
    const PEN_WIDTH = 2.6;
    const ERASER_WIDTH = 22;
    const icon = (name, size = 18) => root.SmartStudyIcons?.icon(name, { size }) || '';

    const state = { open: false, mode: 'draw', color: COLORS[0].value, eraser: false, strokes: [], history: [], current: null };
    let fab, panel, canvas, ctx, wrap, textarea, toolsDraw;

    function el(tag, attrs = {}, html = '') {
        const node = document.createElement(tag);
        Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
        if (html) node.innerHTML = html;
        return node;
    }

    function build() {
        fab = el('button', { type: 'button', class: 'ss-pad-fab', 'aria-label': '연습장 열기', 'aria-expanded': 'false' },
            `${icon('pencil', 22)}<span>연습장</span>`);
        fab.addEventListener('click', toggle);

        panel = el('section', { class: 'ss-pad', role: 'dialog', 'aria-label': '수학 연습장', hidden: '' });
        panel.innerHTML = `
            <header class="ss-pad-head">
                <span class="ss-pad-grip" aria-hidden="true"></span>
                <strong>연습장</strong>
                <small>저장되지 않아요</small>
                <button type="button" class="ss-pad-icon ss-pad-close" aria-label="연습장 닫기" title="닫기">${icon('x', 20)}</button>
            </header>
            <div class="ss-pad-tools">
                <div class="ss-pad-modes" role="group" aria-label="연습 방식">
                    <button type="button" data-mode="draw" aria-pressed="true">${icon('writing', 16)}손글씨</button>
                    <button type="button" data-mode="text" aria-pressed="false">${icon('keyboard', 16)}메모</button>
                </div>
                <div class="ss-pad-draw-tools">
                    ${COLORS.map((c, i) => `<button type="button" class="ss-pad-color" data-color="${c.value}" aria-label="${c.label} 펜" aria-pressed="${i === 0}" style="--pen:${c.value}"></button>`).join('')}
                    <button type="button" class="ss-pad-icon" data-tool="eraser" aria-label="지우개" aria-pressed="false" title="지우개">${icon('eraser', 19)}</button>
                    <button type="button" class="ss-pad-icon" data-tool="undo" aria-label="되돌리기" title="되돌리기">${icon('arrow-back-up', 19)}</button>
                    <button type="button" class="ss-pad-icon" data-tool="clear" aria-label="모두 지우기" title="모두 지우기">${icon('trash', 19)}</button>
                </div>
            </div>
            <div class="ss-pad-body">
                <div class="ss-pad-canvas"><canvas aria-label="손글씨 연습 영역"></canvas></div>
                <textarea class="ss-pad-text" hidden placeholder="계산이나 메모를 자유롭게 적어 보세요. 이 내용은 저장되지 않아요." aria-label="메모 연습 영역"></textarea>
            </div>`;
        document.body.append(fab, panel);

        wrap = panel.querySelector('.ss-pad-canvas');
        canvas = wrap.querySelector('canvas');
        ctx = canvas.getContext('2d');
        textarea = panel.querySelector('.ss-pad-text');
        toolsDraw = panel.querySelector('.ss-pad-draw-tools');

        panel.querySelector('.ss-pad-close').addEventListener('click', () => setOpen(false));
        panel.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
        panel.querySelectorAll('[data-color]').forEach(b => b.addEventListener('click', () => {
            state.color = b.dataset.color;
            state.eraser = false;
            syncTools();
        }));
        panel.querySelector('[data-tool="eraser"]').addEventListener('click', () => { state.eraser = !state.eraser; syncTools(); });
        panel.querySelector('[data-tool="undo"]').addEventListener('click', undo);
        panel.querySelector('[data-tool="clear"]').addEventListener('click', clearAll);
        panel.addEventListener('keydown', event => { if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); } });

        bindDrawing();
        bindDragging();
        if ('ResizeObserver' in root) new ResizeObserver(resizeCanvas).observe(wrap);
        root.addEventListener('resize', resizeCanvas);
    }

    function toggle() { setOpen(!state.open); }

    function setOpen(open) {
        state.open = open;
        panel.hidden = !open;
        fab.setAttribute('aria-expanded', String(open));
        fab.setAttribute('aria-label', open ? '연습장 닫기' : '연습장 열기');
        fab.classList.toggle('is-open', open);
        document.body.classList.toggle('ss-pad-open', open);
        if (open) {
            resizeCanvas();
            (state.mode === 'text' ? textarea : panel.querySelector('.ss-pad-close')).focus({ preventScroll: true });
        } else {
            fab.focus({ preventScroll: true });
        }
    }

    function setMode(mode) {
        state.mode = mode;
        panel.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
        wrap.hidden = mode !== 'draw';
        textarea.hidden = mode !== 'text';
        toolsDraw.hidden = mode !== 'draw';
        if (mode === 'text') textarea.focus({ preventScroll: true });
        else resizeCanvas();
    }

    function syncTools() {
        panel.querySelectorAll('[data-color]').forEach(b => b.setAttribute('aria-pressed', String(!state.eraser && b.dataset.color === state.color)));
        panel.querySelector('[data-tool="eraser"]').setAttribute('aria-pressed', String(state.eraser));
        wrap.classList.toggle('is-erasing', state.eraser);
    }

    /* ---------- drawing ---------- */
    function resizeCanvas() {
        if (!state.open || state.mode !== 'draw') return;
        const rect = wrap.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const dpr = Math.min(root.devicePixelRatio || 1, 3);
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        redraw();
    }

    function strokeStyle(stroke) {
        ctx.globalCompositeOperation = stroke.erase ? 'destination-out' : 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }

    function drawStroke(stroke, from = 0) {
        const pts = stroke.points;
        if (!pts.length) return;
        strokeStyle(stroke);
        ctx.beginPath();
        if (pts.length === 1) {
            ctx.arc(pts[0][0], pts[0][1], stroke.width / 2, 0, Math.PI * 2);
            ctx.fillStyle = stroke.color;
            ctx.fill();
            return;
        }
        const start = Math.max(0, from - 1);
        ctx.moveTo(pts[start][0], pts[start][1]);
        for (let i = start + 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.stroke();
    }

    function redraw() {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        state.strokes.forEach(stroke => drawStroke(stroke));
        ctx.globalCompositeOperation = 'source-over';
    }

    function point(event) {
        const rect = canvas.getBoundingClientRect();
        return [event.clientX - rect.left, event.clientY - rect.top];
    }

    function bindDrawing() {
        canvas.addEventListener('pointerdown', event => {
            if (event.button > 0) return;
            event.preventDefault();
            canvas.setPointerCapture?.(event.pointerId);
            state.current = { color: state.color, width: state.eraser ? ERASER_WIDTH : PEN_WIDTH, erase: state.eraser, points: [point(event)] };
            state.strokes.push(state.current);
            drawStroke(state.current);
        });
        canvas.addEventListener('pointermove', event => {
            if (!state.current) return;
            event.preventDefault();
            const before = state.current.points.length;
            const samples = event.getCoalescedEvents ? event.getCoalescedEvents() : [event];
            samples.forEach(sample => state.current.points.push(point(sample)));
            drawStroke(state.current, before);
        });
        const finish = () => {
            if (!state.current) return;
            state.history.push({ type: 'stroke' });
            state.current = null;
            ctx.globalCompositeOperation = 'source-over';
        };
        canvas.addEventListener('pointerup', finish);
        canvas.addEventListener('pointercancel', finish);
        canvas.addEventListener('lostpointercapture', finish);
    }

    function undo() {
        const last = state.history.pop();
        if (!last) return;
        if (last.type === 'stroke') state.strokes.pop();
        if (last.type === 'clear') state.strokes = last.strokes;
        redraw();
    }

    function clearAll() {
        if (!state.strokes.length) return;
        state.history.push({ type: 'clear', strokes: state.strokes });
        state.strokes = [];
        redraw();
    }

    /* ---------- dragging (wide screens only; phones use a bottom sheet) ---------- */
    function bindDragging() {
        const head = panel.querySelector('.ss-pad-head');
        let drag = null;
        head.addEventListener('pointerdown', event => {
            if (event.target.closest('button') || root.matchMedia('(max-width: 700px)').matches) return;
            const rect = panel.getBoundingClientRect();
            drag = { dx: event.clientX - rect.left, dy: event.clientY - rect.top };
            head.setPointerCapture?.(event.pointerId);
            panel.classList.add('is-dragging');
        });
        head.addEventListener('pointermove', event => {
            if (!drag) return;
            const maxX = root.innerWidth - panel.offsetWidth - 8, maxY = root.innerHeight - panel.offsetHeight - 8;
            panel.style.left = `${Math.max(8, Math.min(maxX, event.clientX - drag.dx))}px`;
            panel.style.top = `${Math.max(8, Math.min(maxY, event.clientY - drag.dy))}px`;
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
        });
        const end = () => { drag = null; panel.classList.remove('is-dragging'); };
        head.addEventListener('pointerup', end);
        head.addEventListener('pointercancel', end);
    }

    function init() {
        if (fab) return;
        build();
    }

    root.SmartStudyScratchpad = { init, open: () => { init(); setOpen(true); }, close: () => fab && setOpen(false) };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})(window);

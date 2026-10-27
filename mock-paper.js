(function (root) {
    'use strict';
    // Printable school-exam paper for the weekly mock exam (mock-print.html).
    // Every stored string is untrusted: text goes through textContent and only
    // KaTeX output is inserted as markup.
    const STORAGE_KEY = 'SmartStudy_MockPaperPrint';
    // Paper order follows a school test day: 국어 → 수학 → 영어 → 한자.
    const AREAS = Object.freeze([
        { id: 'reading', name: '국어', subjects: ['reading', 'korean_vocab'], period: 1, minutes: 20 },
        { id: 'math', name: '수학', subjects: ['math', 'math_formula'], period: 2, minutes: 20 },
        { id: 'english', name: '영어', subjects: ['english', 'grammar', 'english_reading'], period: 3, minutes: 20 },
        { id: 'hanja', name: '한자', subjects: ['hanja'], period: 4, minutes: 10 }
    ]);
    const PARTS = Object.freeze({ paper: '문제지', answers: '정답표·해설', omr: 'OMR 답안지', all: '전체' });
    const MARKS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];
    const WEIGHT = { basic: 2, standard: 3, challenge: 4 };
    const MATH = new Set(['math', 'math_formula']);
    const areaOf = subject => AREAS.find(area => area.subjects.includes(subject));

    // Points per item, 100 per 영역. Difficulty sets the weight (기본 2 · 표준 3 · 도전 4,
    // 단답형 +1); largest remainders keep every 영역 at exactly 100 and favour later, harder items.
    function points(items) {
        const list = Array.isArray(items) ? items : [], out = list.map(() => 0), groups = new Map();
        list.forEach((q, i) => { const id = areaOf(q?.subject)?.id || 'other'; if (!groups.has(id)) groups.set(id, []); groups.get(id).push(i); });
        for (const indexes of groups.values()) {
            const weights = indexes.map(i => (WEIGHT[list[i]?.difficulty] || 3) + (list[i]?.kind === 'written' ? 1 : 0));
            const sum = weights.reduce((a, b) => a + b, 0), raw = weights.map(w => w * 100 / sum), base = raw.map(Math.floor);
            let left = 100 - base.reduce((a, b) => a + b, 0);
            const order = weights.map((_, k) => k).sort((a, b) => (raw[b] - base[b]) - (raw[a] - base[a]) || weights[b] - weights[a] || b - a);
            for (const k of order) { if (left <= 0) break; base[k]++; left--; }
            indexes.forEach((i, k) => { out[i] = base[k]; });
        }
        return out;
    }

    // Groups each 영역; questions sharing a passage are pulled together behind the first one,
    // so "[1~3] 다음 글을 읽고…" covers one passage box. Numbers restart at 1 in every 영역.
    function areas(items) {
        const list = (Array.isArray(items) ? items : []).filter(q => q && typeof q === 'object');
        return AREAS.map(area => {
            const blocks = [], shared = new Map();
            for (const item of list.filter(q => area.subjects.includes(q.subject))) {
                const lines = passageLines(item);
                if (item.passageId && lines.length) {
                    const key = String(item.passageId);
                    if (!shared.has(key)) { const block = { passage: { id: key, title: item.passageTitle || '', lines, glossary: Array.isArray(item.glossary) ? item.glossary : [] }, items: [] }; shared.set(key, block); blocks.push(block); }
                    shared.get(key).items.push(item);
                } else blocks.push({ passage: null, items: [item] });
            }
            const ordered = blocks.flatMap(block => block.items), pts = points(ordered);
            const questions = ordered.map((item, i) => ({ no: i + 1, item, points: pts[i] }));
            let next = 0;
            return { ...area, questions, blocks: blocks.map(block => ({ passage: block.passage, questions: block.items.map(() => questions[next++]) })) };
        }).filter(area => area.questions.length);
    }

    function passageLines(q) {
        const lines = q.passageLines || q.passageText || [];
        return (Array.isArray(lines) ? lines : [lines]).map(line => String(line ?? '')).filter(line => line.trim());
    }

    function el(doc, tag, className, text) {
        const node = doc.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = String(text);
        return node;
    }

    // Math subjects render $…$ with KaTeX like the online exam; a bare "6/3" answer is typeset as a fraction.
    function rich(doc, node, value, isMath) {
        let text = String(value ?? '');
        if (!isMath) { node.appendChild(doc.createTextNode(text)); return node; }
        const fraction = text.match(/^(-?)(\d+)\/(\d+)(\s*[A-Za-z%가-힣²³]*)$/);
        if (fraction) text = `$${fraction[1]}\\frac{${fraction[2]}}{${fraction[3]}}$${fraction[4]}`;
        const pattern = /\$\$([\s\S]+?)\$\$|\$([^\n$]+?)\$/g;
        let start = 0, match;
        while ((match = pattern.exec(text))) {
            node.appendChild(doc.createTextNode(text.slice(start, match.index)));
            const formula = el(doc, 'span', 'math');
            try {
                if (!root.katex?.render) throw new Error('KaTeX unavailable');
                root.katex.render('\\displaystyle ' + (match[1] ?? match[2]), formula, { throwOnError: true, trust: false, displayMode: false, strict: 'ignore', maxExpand: 1000 });
            } catch (_) { formula.textContent = match[0]; }
            node.appendChild(formula);
            start = pattern.lastIndex;
        }
        node.appendChild(doc.createTextNode(text.slice(start)));
        return node;
    }

    const plainWidth = value => {
        const text = String(value ?? '').replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1').replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}$]/g, '');
        let width = 0; for (const ch of text) width += /[\u0000-ÿ]/.test(ch) ? 0.55 : 1; return width;
    };
    // One line when every option is short, two per line when medium, otherwise one per line.
    function choiceLayout(choices) {
        const widest = Math.max(0, ...choices.map(plainWidth));
        return widest <= 5.5 ? 'row' : widest <= 12 ? 'two' : 'one';
    }

    function examTitle(set) {
        const label = String(set.weekLabel || set.weekKey || '').replace(/^(\d{4})년\s*/, '$1학년도 ');
        return `${label} Smart Study 모의고사 · 제${Number(set.attemptNo) || 1}회`.trim();
    }
    const minutesOf = (set, area) => { const value = Number(set.timeLimits?.[area.id]); return Number.isFinite(value) && value > 0 ? value : area.minutes; };
    const range = qs => qs.length > 1 ? `[${qs[0].no}~${qs[qs.length - 1].no}]` : `[${qs[0].no}]`;

    function examHeader(doc, set, area) {
        const head = el(doc, 'header', 'exam-head');
        const top = el(doc, 'div', 'eh-top'); top.append(el(doc, 'span', '', examTitle(set)), el(doc, 'span', 'eh-kind', '문제지'));
        const main = el(doc, 'div', 'eh-main');
        main.append(el(doc, 'div', 'eh-period', `제 ${area.period} 교시`), el(doc, 'h1', 'eh-title', `${area.name} 영역`), el(doc, 'div', 'eh-round', `제${Number(set.attemptNo) || 1}회`));
        const info = el(doc, 'div', 'eh-info');
        const field = (label, value, className) => { const box = el(doc, 'div', `eh-field ${className || ''}`.trim()); box.append(el(doc, 'span', 'eh-label', label), el(doc, 'span', 'eh-value', value)); return box; };
        info.append(field('성명', '', 'eh-name'), field('학년', ''), field('반', ''), field('번호', ''),
            field('시험 시간', `${minutesOf(set, area)}분`, 'eh-time'), field('문항 수', `${area.questions.length}문항 · 100점`, 'eh-count'));
        const notice = el(doc, 'div', 'eh-notice'), list = el(doc, 'ol');
        notice.append(el(doc, 'strong', '', '수험생 유의 사항'));
        for (const line of ['답안지(OMR)의 해당란에 성명과 수험 번호를 쓰고, 답은 컴퓨터용 사인펜으로 표기하시오.',
            '문항에 따라 배점이 다르니, 각 물음의 끝에 표시된 배점을 참고하시오.',
            area.questions.some(q => q.item.kind === 'written') ? '[단답형] 문항의 답은 답안지의 단답형 칸에 바르게 쓰시오.' : '각 문항의 답은 하나만 고르시오.',
            `시험 시간은 ${minutesOf(set, area)}분입니다. 시험이 끝나면 필기구를 내려놓으시오.`]) list.append(el(doc, 'li', '', line));
        notice.append(list);
        head.append(top, main, info, notice);
        return head;
    }

    function passageBox(doc, passage, compact) {
        const box = el(doc, 'div', compact ? 'passage passage--inline' : 'passage');
        if (passage.title) box.append(el(doc, 'p', 'passage-title', passage.title));
        for (const line of passage.lines) box.append(el(doc, 'p', 'passage-line', line));
        if (passage.glossary?.length) {
            const notes = el(doc, 'p', 'glossary');
            for (const entry of passage.glossary) notes.append(el(doc, 'span', '', `* ${entry?.word ?? ''}: ${entry?.meaning ?? ''}`));
            box.append(notes);
        }
        return box;
    }

    function questionNode(doc, question) {
        const q = question.item, isMath = MATH.has(q.subject), node = el(doc, 'div', q.kind === 'written' ? 'q q--written' : 'q');
        let stem = String(q.question ?? ''), bogi = '';
        // "…은? 〈보기〉내용" becomes the stem plus a boxed 〈보기〉 as on a printed test.
        const split = stem.match(/^([\s\S]*?[?？])\s*〈보기〉\s*([\s\S]+)$/);
        if (split) { stem = split[1]; bogi = split[2]; }
        const head = el(doc, 'p', 'q-stem');
        head.append(el(doc, 'b', 'q-no', `${question.no}.`));
        if (q.kind === 'written') head.append(el(doc, 'span', 'q-type', '[단답형]'));
        rich(doc, head.appendChild(el(doc, 'span', 'q-text')), stem, isMath);
        head.append(el(doc, 'span', 'q-pts', `[${question.points}점]`));
        node.append(head);
        const lines = passageLines(q);
        if (!q.passageId && lines.length) node.append(passageBox(doc, { title: q.passageTitle || '', lines, glossary: q.glossary || [] }, true));
        if (bogi) { const box = el(doc, 'div', 'bogi'); box.append(el(doc, 'span', 'bogi-label', '〈보 기〉'), rich(doc, el(doc, 'p', ''), bogi, isMath)); node.append(box); }
        if (q.kind === 'written') {
            const answer = el(doc, 'div', 'written-box');
            answer.append(el(doc, 'span', 'written-label', '답'), el(doc, 'span', 'written-line'));
            node.append(answer);
            if (q.inputHint) node.append(el(doc, 'p', 'written-hint', `※ ${q.inputHint}`));
        } else {
            const choices = Array.isArray(q.choices) ? q.choices : [], list = el(doc, 'ol', `choices choices--${choiceLayout(choices)}`);
            choices.forEach((choice, index) => { const item = el(doc, 'li', 'choice'); item.append(el(doc, 'span', 'mk', MARKS[index] || `${index + 1})`)); rich(doc, item.appendChild(el(doc, 'span', 'ch-text')), choice, isMath); list.append(item); });
            node.append(list);
        }
        return node;
    }

    function examSection(doc, set, area) {
        const sheet = el(doc, 'section', `sheet exam-sheet sec-${area.id}`);
        sheet.setAttribute('data-area', area.id);
        sheet.append(examHeader(doc, set, area));
        const cols = el(doc, 'div', 'cols');
        for (const block of area.blocks) {
            if (block.passage) {
                const group = el(doc, 'div', 'q-group');
                group.append(el(doc, 'p', 'q-directive', `${range(block.questions)} 다음 글을 읽고 물음에 답하시오.`), passageBox(doc, block.passage, false));
                cols.append(group);
            }
            for (const question of block.questions) cols.append(questionNode(doc, question));
        }
        // The closing notice travels with the last question so it never lands alone on a blank page.
        const end = el(doc, 'div', 'end-note');
        end.append(el(doc, 'strong', '', '※ 확인 사항'), doc.createTextNode(' 답안지의 해당란에 필요한 내용을 정확히 기입(표기)했는지 확인하시오.'));
        (cols.lastChild || cols).appendChild(end);
        sheet.append(cols);
        return sheet;
    }

    function answerOf(doc, question, withText) {
        const q = question.item, span = el(doc, 'span', 'key-answer');
        if (q.kind === 'written') return rich(doc, span, q.answer, MATH.has(q.subject));
        const index = (q.choices || []).indexOf(q.answer);
        span.append(el(doc, 'b', 'key-mark', MARKS[index] || '?'));
        if (withText) rich(doc, span.appendChild(el(doc, 'span', 'key-text')), q.answer, MATH.has(q.subject));
        return span;
    }

    function answerSheet(doc, set, list) {
        const sheet = el(doc, 'section', 'sheet answer-sheet');
        const head = el(doc, 'header', 'ans-head');
        head.append(el(doc, 'div', 'eh-top', examTitle(set)), el(doc, 'h1', 'ans-title', '정답 및 해설'), el(doc, 'p', 'ans-sub', `${set.learnerName || ''} · ${list.map(a => `${a.period}교시 ${a.name}`).join(' · ')}`));
        sheet.append(head, el(doc, 'h2', 'ans-h2', '빠른 정답표'));
        for (const area of list) {
            const table = el(doc, 'table', 'key-table'), caption = el(doc, 'caption', '', `${area.period}교시 ${area.name} 영역 (${area.questions.length}문항 · 100점)`);
            const rows = [['번호', q => el(doc, 'span', '', q.no)], ['정답', q => answerOf(doc, q, false)], ['배점', q => el(doc, 'span', '', q.points)]];
            table.append(caption);
            for (const [label, cell] of rows) {
                const tr = el(doc, 'tr'); tr.append(el(doc, 'th', '', label));
                for (const question of area.questions) { const td = el(doc, 'td', question.item.kind === 'written' ? 'key-written' : ''); td.append(cell(question)); tr.append(td); }
                table.append(tr);
            }
            sheet.append(table);
        }
        sheet.append(el(doc, 'h2', 'ans-h2 ans-h2--exp', '문항별 해설'));
        for (const area of list) {
            const part = el(doc, 'div', 'exp-area');
            part.append(el(doc, 'h3', 'exp-title', `${area.period}교시 ${area.name} 영역`));
            const cols = el(doc, 'div', 'exp-cols');
            for (const question of area.questions) {
                const row = el(doc, 'div', 'exp'), line = el(doc, 'p', 'exp-head');
                line.append(el(doc, 'b', 'q-no', `${question.no}.`), el(doc, 'span', 'exp-label', '정답'), answerOf(doc, question, question.item.kind !== 'written'), el(doc, 'span', 'q-pts', `[${question.points}점]`));
                row.append(line, rich(doc, el(doc, 'p', 'exp-body'), question.item.explanation || '별도 해설이 없습니다.', MATH.has(question.item.subject)));
                cols.append(row);
            }
            part.append(cols);
            sheet.append(part);
        }
        return sheet;
    }

    const bubble = (doc, label, className) => el(doc, 'span', className ? `bub ${className}` : 'bub', label);
    // Absolute placement straight from OmrLayout (mm), relative to the parent's origin, so print and reader never drift.
    const mm = value => `${Math.round(value * 1000) / 1000}mm`;
    function place(node, box, origin) {
        const o = origin || { xMm: 0, yMm: 0 };
        node.setAttribute('style', `left:${mm(box.xMm - o.xMm)};top:${mm(box.yMm - o.yMm)};width:${mm(box.wMm)};height:${mm(box.hMm)}`);
        return node;
    }

    function omrSheet(doc, set, list) {
        const layout = root.OmrLayout.build(set), sheet = el(doc, 'section', 'sheet omr-sheet'), card = el(doc, 'div', 'omr');
        card.setAttribute('data-omr-version', layout.version);
        for (const f of layout.fiducials) card.append(place(el(doc, 'span', 'omr-fid'), { xMm: f.xMm - f.sizeMm / 2, yMm: f.yMm - f.sizeMm / 2, wMm: f.sizeMm, hMm: f.sizeMm }));
        card.append(place(el(doc, 'p', 'omr-photo-tip', '휴대폰으로 찍을 때는 네 모서리의 검은 네모가 모두 보이도록 평평하게 놓고 찍어 주세요.'), layout.tip));
        const top = place(el(doc, 'div', 'omr-top'), layout.header);
        top.append(el(doc, 'div', 'omr-pen', '컴퓨터용 사인펜만 사용'), el(doc, 'div', 'omr-heading', `${examTitle(set)} 답안지`));
        const id = place(el(doc, 'div', 'omr-id'), layout.idPanel);
        const name = el(doc, 'div', 'omr-box omr-name'); name.append(el(doc, 'span', 'omr-cap', '성 명'), el(doc, 'span', 'omr-written', ''));
        const number = el(doc, 'div', 'omr-box omr-number'); number.append(el(doc, 'span', 'omr-cap', '수 험 번 호'));
        const grid = el(doc, 'div', 'omr-digits');
        for (let column = 0; column < 6; column++) {
            const col = el(doc, 'div', 'omr-digit'); col.append(el(doc, 'span', 'omr-digit-write'));
            for (let digit = 0; digit <= 9; digit++) col.append(bubble(doc, digit));
            grid.append(col);
        }
        number.append(grid);
        const areaMark = el(doc, 'div', 'omr-box omr-areas'); areaMark.append(el(doc, 'span', 'omr-cap', '응 시 영 역'));
        const areaRow = el(doc, 'div', 'omr-area-row');
        for (const area of list) { const item = el(doc, 'span', 'omr-area'); item.append(el(doc, 'span', '', `${area.period}교시 ${area.name}`), bubble(doc, '', 'bub--area')); areaRow.append(item); }
        areaMark.append(areaRow);
        const sign = el(doc, 'div', 'omr-box omr-sign'); sign.append(el(doc, 'span', 'omr-cap', '감독관 확인'), el(doc, 'span', 'omr-sign-space', '(서명 또는 날인)'));
        const guide = el(doc, 'div', 'omr-guide');
        guide.append(el(doc, 'strong', '', '답안지 표기 요령'));
        const right = el(doc, 'p', ''); right.append(el(doc, 'span', '', '바른 표기 '), bubble(doc, '', 'bub--filled'));
        const wrong = el(doc, 'p', ''); wrong.append(el(doc, 'span', '', '틀린 표기 '), ...['⊙', '⊘', '◑', '✓'].map(sign => el(doc, 'span', 'omr-wrong', sign)));
        guide.append(right, wrong);
        for (const line of ['컴퓨터용 사인펜으로 ○ 안을 빈틈없이 칠하시오.', '한 문항에 답을 하나만 표기하시오.', '[단답형]은 해당 칸에 답만 바르게 쓰시오.', '수정 테이프 외의 수정액·스티커는 쓰지 마시오.']) guide.append(el(doc, 'p', 'omr-rule', `· ${line}`));
        id.append(name, number, areaMark, sign, guide);
        const answers = el(doc, 'div', 'omr-answers');
        for (const area of layout.areas) {
            const col = place(el(doc, 'div', 'omr-col'), area.column);
            col.setAttribute('data-area', area.key);
            const head = place(el(doc, 'div', 'omr-col-head'), area.head, area.column); head.append(el(doc, 'span', 'omr-col-period', `${area.period}교시`), el(doc, 'span', 'omr-col-name', `${area.name} 영역`));
            const legend = place(el(doc, 'div', 'omr-legend'), area.legend, area.column);
            legend.append(place(el(doc, 'span', 'omr-n', '번호'), { ...area.legend, wMm: area.rows[0]?.numberCell.wMm ?? 6.5 }, area.legend));
            for (const mark of area.legend.marks) legend.append(place(el(doc, 'span', 'omr-legend-mark', mark.choice), { xMm: mark.xMm - 1.8, yMm: area.legend.yMm, wMm: 3.6, hMm: area.legend.hMm }, area.legend));
            col.append(head, legend);
            for (let r = 0; r < layout.rowsMax; r++) {
                const row = area.rows[r], box = row ? row.rect : { xMm: area.column.xMm, yMm: area.rowTopMm + r * area.rowHMm, wMm: area.column.wMm, hMm: area.rowHMm };
                const node = place(el(doc, 'div', `omr-row${(r + 1) % 5 === 0 ? ' omr-row--fifth' : ''}${r === layout.rowsMax - 1 ? ' omr-row--last' : ''}${row ? '' : ' omr-row--empty'}${row?.kind === 'written' ? ' omr-row--written' : ''}`), box, area.column);
                if (row) {
                    node.append(place(el(doc, 'span', 'omr-n', row.number), row.numberCell, box));
                    if (row.writtenBox) { const write = place(el(doc, 'span', 'omr-write'), row.writtenBox, box); write.append(el(doc, 'span', 'omr-write-label', '단답형')); node.append(write); }
                    for (const b of row.bubbles) node.append(place(bubble(doc, b.choice), { xMm: b.xMm - b.rxMm, yMm: b.yMm - b.ryMm, wMm: 2 * b.rxMm, hMm: 2 * b.ryMm }, box));
                }
                col.append(node);
            }
            answers.append(col);
        }
        const timing = place(el(doc, 'div', 'omr-timing'), layout.timing);
        for (const tick of layout.timingMarks) timing.append(place(el(doc, 'span', 'omr-tick'), tick, layout.timing));
        const code = el(doc, 'div', 'omr-code');
        code.setAttribute('aria-label', layout.code.label);
        for (const cell of layout.codeCells) code.append(place(el(doc, 'span', cell.bit ? 'omr-code-cell omr-code-cell--on' : 'omr-code-cell'), cell));
        card.append(place(el(doc, 'div', 'omr-frame'), layout.frame), top, id, answers, timing, code, place(el(doc, 'p', 'omr-code-label', layout.code.label), layout.codeLabel));
        sheet.append(card);
        return sheet;
    }

    // part: 'paper' | 'answers' | 'omr' | 'all'
    function render(host, paperSet, options) {
        const doc = host.ownerDocument, set = paperSet || {}, part = PARTS[options?.part] ? options.part : 'paper', list = areas(set.items);
        host.replaceChildren();
        if (part === 'paper' || part === 'all') for (const area of list) host.append(examSection(doc, set, area));
        if (part === 'omr' || part === 'all') host.append(omrSheet(doc, set, list));
        if (part === 'answers' || part === 'all') host.append(answerSheet(doc, set, list));
        return { part, areas: list };
    }

    function read(storage) {
        try {
            const set = JSON.parse(storage.getItem(STORAGE_KEY) || 'null');
            return set && set.schema === 1 && Array.isArray(set.items) && set.items.length ? set : null;
        } catch (_) { return null; }
    }

    // Page bootstrap for mock-print.html only.
    function boot() {
        const doc = root.document, host = doc.getElementById('paperRoot');
        if (!host) return;
        const set = read(root.localStorage), empty = doc.getElementById('paperEmpty'), toolbar = doc.getElementById('paperToolbar');
        const print = doc.getElementById('printPaper'), label = doc.getElementById('paperLabel');
        if (!set) { empty.hidden = false; host.hidden = true; print.disabled = true; for (const button of toolbar.querySelectorAll('[data-part]')) button.disabled = true; return; }
        label.textContent = `${set.learnerName || ''} · ${examTitle(set)} · ${set.items.length}문항`;
        const show = () => {
            const part = PARTS[root.location.hash.slice(1)] ? root.location.hash.slice(1) : 'paper';
            render(host, set, { part });
            for (const button of toolbar.querySelectorAll('[data-part]')) button.setAttribute('aria-pressed', String(button.dataset.part === part));
            doc.title = `${set.learnerName || ''} ${set.weekLabel || ''} 모의고사 ${PARTS[part]}`.replace(/\s+/g, ' ').trim();
        };
        for (const button of toolbar.querySelectorAll('[data-part]')) button.addEventListener('click', () => { root.location.hash = button.dataset.part; });
        root.addEventListener('hashchange', show);
        print.addEventListener('click', async () => { try { await doc.fonts?.ready; } catch (_) { /* print anyway */ } root.print(); });
        show();
    }

    root.MockPaper = { render, points, areas, read, STORAGE_KEY, AREAS, PARTS };
    if (root.document?.getElementById) {
        if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', boot); else boot();
    }
})(window);

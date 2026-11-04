// Parent-only display of screen-leave / translation records saved with English and math quizzes
// (report metadata.integrity). Loaded by admin.html only; learner screens never render these records.
(function (root) {
    'use strict';
    const app = root.SmartStudy = root.SmartStudy || {};
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const duration = seconds => { const total = Math.max(0, Math.round(Number(seconds) || 0)), m = Math.floor(total / 60), r = total % 60; return m ? `${m}분${r ? ` ${r}초` : ''}` : `${r}초`; };
    const KINDS = { translator: '영어', calculator: '수학' };

    // Records saved before recording existed (or malformed ones) return null and show nothing.
    function read(report) {
        const x = report?.metadata?.integrity;
        if (!x || typeof x !== 'object' || !KINDS[x.kind]) return null;
        return { kind: x.kind, leaves: Math.max(0, Math.floor(Number(x.leaves) || 0)), awaySeconds: Math.max(0, Number(x.awaySeconds) || 0), translated: x.translationDetected === true };
    }

    function describe(report) {
        const x = read(report);
        if (!x) return null;
        const warning = x.leaves > 0 || x.translated;
        if (!warning) return { text: '이탈 없음', warning: false, kind: x.kind };
        const parts = [];
        if (x.leaves) parts.push(`화면 이탈 ${x.leaves}회`, duration(x.awaySeconds));
        if (x.kind === 'translator') parts.push(x.translated ? '번역 감지됨' : '번역 감지 없음');
        else if (x.translated) parts.push('번역 감지됨');
        let text = parts.join(' · ');
        if (x.kind === 'calculator' && x.leaves) text += ' (계산기 사용 의심)';
        return { text, warning: true, kind: x.kind };
    }

    function chipHTML(report) {
        const info = describe(report);
        if (!info) return '';
        return `<span class="mock-integrity quiz-integrity${info.warning ? ' is-warning' : ' is-empty'}">${escape(info.text)}</span>`;
    }

    function weeklySummary(reports, start, end) {
        const from = Number(start instanceof Date ? start.getTime() : start), to = Number(end instanceof Date ? end.getTime() : end);
        const rows = new Map();
        for (const report of reports || []) {
            const date = Number(report?.date || 0);
            if (date < from || date > to) continue;
            rows.set(report.sessionId || `${date}:${rows.size}`, report);
        }
        const summary = {};
        for (const kind of Object.keys(KINDS)) summary[kind] = { recorded: 0, withLeaves: 0, translations: 0, units: [] };
        const units = { translator: new Map(), calculator: new Map() };
        for (const report of rows.values()) {
            const x = read(report);
            if (!x) continue;
            const row = summary[x.kind];
            row.recorded++;
            if (x.leaves) row.withLeaves++;
            if (x.translated) row.translations++;
            if (x.leaves || x.translated) {
                const unit = String(report.metadata?.unitTitle || report.level || '단원 미상');
                units[x.kind].set(unit, (units[x.kind].get(unit) || 0) + 1);
            }
        }
        for (const kind of Object.keys(KINDS)) {
            summary[kind].units = [...units[kind]].map(([unit, count]) => ({ unit, count }))
                .sort((a, b) => b.count - a.count || a.unit.localeCompare(b.unit)).slice(0, 3);
        }
        return summary;
    }

    function weeklyHTML(reports, start, end) {
        const summary = weeklySummary(reports, start, end);
        const lines = Object.entries(KINDS).filter(([kind]) => summary[kind].recorded).map(([kind, name]) => {
            const row = summary[kind], warning = row.withLeaves > 0 || row.translations > 0;
            const counts = [`기록된 퀴즈 ${row.recorded}회`, `화면 이탈 있음 ${row.withLeaves}회`];
            if (kind === 'translator' || row.translations) counts.push(`번역 감지 ${row.translations}회`);
            const units = row.units.length ? ` · 많이 생긴 단원: ${row.units.map(item => `${escape(item.unit)}(${item.count})`).join(', ')}` : '';
            return `<p class="mock-integrity quiz-integrity-week${warning ? ' is-warning' : ''}" data-kind="${kind}">${name} · ${counts.join(' · ')}${units}</p>`;
        });
        if (!lines.length) return '';
        return `<div class="quiz-integrity-summary" style="background:#fdfbf6;border:1px solid #ede5d6;border-radius:16px;padding:16px;margin-bottom:12px;">
            <div style="font-size:0.82rem;font-weight:700;">퀴즈 중 화면 이탈 · 번역 감지 (보호자 전용)</div>
            ${lines.join('')}
        </div>`;
    }

    app.QuizIntegrityAdmin = { read, describe, chipHTML, weeklySummary, weeklyHTML };
    if (typeof module !== 'undefined' && module.exports) module.exports = app.QuizIntegrityAdmin;
})(typeof window !== 'undefined' ? window : globalThis);

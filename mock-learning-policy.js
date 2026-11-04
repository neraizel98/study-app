(function (root) {
    'use strict';
    const version = '20261102-mock-learning-v1';
    const SUBJECTS = ['english', 'grammar', 'english_reading'];
    const SKILLS = { fact: '사실 확인', main: '중심 내용', vocabulary: '문맥 속 어휘', reference: '지시어', evidence: '근거 찾기', inference: '추론' };
    // Operational teaching rules, not a scientifically validated mastery cut-off.
    const thresholds = Object.freeze({ freshItems: 6, successfulDays: 2, itemsPerDay: 3, wordFreshItems: 3, wordItemsPerDay: 1, readingFreshItems: 3, readingItemsPerDay: 1, accuracy: 0.8, delayMs: 86400000, readingSessionItems: 5 });
    const copy = value => JSON.parse(JSON.stringify(value));
    const norm = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
    const text = value => typeof value === 'string' && value.trim() ? value.trim() : null;
    const time = value => { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : null; };
    const list = value => Array.isArray(value) ? value : [];
    const catalogsOf = supplied => supplied || { vocabData: root.vocabData, EnglishGrammarData: root.EnglishGrammarData, EnglishReadingData: root.EnglishReadingData };
    const skillOf = value => { let v = String(value || '').replace(/^reading-skill:|^skill:/, ''); if (v === 'vocab') v = 'vocabulary'; return Object.prototype.hasOwnProperty.call(SKILLS, v) ? v : null; };
    const lessonOf = value => typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : /^lesson:\d+$/.test(String(value || '')) ? Number(String(value).slice(7)) : null;
    function contextOf(subject, input) {
        const c = input?.context && typeof input.context === 'object' ? input.context : input || {};
        if (subject === 'english') { const unitId = text(c.unitId || c.level || c.levelId); return unitId ? { unitId } : null; }
        const unitId = text(c.unitId), levelId = text(c.levelId || (subject === 'grammar' ? c.stageId : null));
        if (!unitId || !levelId || (subject === 'grammar' && c.stageId && c.levelId && c.stageId !== c.levelId)) return null;
        return subject === 'grammar' ? { levelId, stageId: levelId, unitId } : { levelId, unitId };
    }
    const sameContext = (subject, a, b) => !!a && !!b && a.unitId === b.unitId && (subject === 'english' || a.levelId === b.levelId);
    function fingerprint(q) {
        if (!q || !text(q.question || q.prompt) || (q.correctAnswer ?? q.answer ?? q.correctValue ?? q.displayCorrect) == null) return null;
        const passage = q.passageLines || q.passageText || q.sentences || [];
        // Deliberately excludes IDs, choice order, and mutable correctness/selection.
        const compact = value => norm(value).replace(/\s/g, '');
        return JSON.stringify([compact(q.subject || q.category), compact(q.question || q.prompt), compact(q.correctAnswer ?? q.answer ?? q.correctValue ?? q.displayCorrect), compact(Array.isArray(passage) ? passage.join(' ') : passage)]);
    }
    function readingUnit(c, catalogs) {
        const units = list(catalogs.EnglishReadingData?.units).filter(u => u.id === c.unitId && (u.gradeId || 'grade6') === c.levelId);
        return units.length === 1 ? units[0] : null;
    }
    function resolve(subject, q, a, catalogs) {
        const explicit = q.learningTarget || a.learningTarget || null;
        if (q.learningTarget && a.learningTarget && JSON.stringify(q.learningTarget) !== JSON.stringify(a.learningTarget)) return { reason: 'conflicting-learning-target' };
        const contexts = [q.context, a.context, explicit?.context || (explicit?.unitId ? explicit : null)].filter(Boolean).map(c => contextOf(subject, c));
        const c = contexts.find(Boolean);
        if (!c || contexts.some(candidate => !sameContext(subject, c, candidate))) return { reason: 'missing-or-conflicting-context' };
        if (explicit?.kind && explicit.kind !== ({ english: 'word', grammar: 'lesson', english_reading: 'reading-skill' }[subject])) return { reason: 'conflicting-target-kind' };
        if (subject === 'english') {
            const ids = [q.conceptId, a.conceptId, explicit?.conceptId].filter(Boolean);
            const words = [explicit?.word, q.word, a.word, ...ids.map(id => String(id).match(/^word(?:-definition|-sense)?:([^|:]+)$/)?.[1])].filter(Boolean).map(norm);
            if (!words.length || new Set(words).size !== 1) return { reason: 'missing-or-conflicting-word' };
            const bank = list(catalogs.vocabData?.[c.unitId]).filter(w => norm(w.word) === words[0]);
            if (bank.length !== 1) return { reason: 'word-not-unique-in-catalog' };
            return { context: c, conceptId: `word:${bank[0].word}`, kind: 'word', word: bank[0].word, label: `${bank[0].word} · 단어` };
        }
        if (subject === 'grammar') {
            const values = [explicit?.lessonIndex, q.lessonIndex, a.lessonIndex, explicit?.conceptId, q.conceptId, a.conceptId].filter(v => v !== undefined && v !== null).map(lessonOf);
            if (!values.length || values.some(v => v === null) || new Set(values).size !== 1) return { reason: 'missing-or-conflicting-lesson' };
            const units = list(catalogs.EnglishGrammarData?.[c.levelId]?.units).filter(u => u.id === c.unitId);
            const lesson = units.length === 1 ? units[0].lessons?.[values[0]] : null;
            if (!lesson) return { reason: 'lesson-not-in-catalog' };
            return { context: c, conceptId: `lesson:${values[0]}`, kind: 'lesson', lessonIndex: values[0], label: String(lesson.title || `문법 개념 ${values[0] + 1}`).slice(0, 60) };
        }
        const skills = [explicit?.skill, explicit?.conceptId, q.skill, a.skill, q.conceptId, a.conceptId].filter(Boolean).map(skillOf);
        const unit = readingUnit(c, catalogs);
        if (!skills.length || skills.some(s => !s) || new Set(skills).size !== 1) return { reason: 'missing-or-conflicting-reading-skill' };
        if (!unit || !list(unit.passages).some(p => list(p.questions).some(item => skillOf(item.skill || item.type || item.conceptId) === skills[0]))) return { reason: 'reading-skill-not-in-catalog' };
        // Source passages are transfer exam material, never the learned unit passage.
        return { context: c, conceptId: `reading-skill:${skills[0]}`, kind: 'reading-skill', skill: skills[0], label: SKILLS[skills[0]] };
    }
    function analyze(snapshot, suppliedCatalogs) {
        const result = { components: Object.fromEntries(SUBJECTS.map(s => [s, { correct: 0, total: 0 }])), targets: [], unmapped: [] };
        if (!snapshot || snapshot.status !== 'submitted' || !text(snapshot.assessmentId) || !time(snapshot.submittedAt)) return result;
        const catalogs = catalogsOf(suppliedCatalogs), questions = list(snapshot.questions), seen = new Set();
        const attempts = list(snapshot.initialAttempts).length ? snapshot.initialAttempts : list(snapshot.sections).flatMap(section => list(section.initialAttempts));
        for (const a of attempts) {
            if (!a || !SUBJECTS.includes(a.subject)) continue;
            const matches = questions.filter(q => q.id === a.questionId), q = matches.length === 1 ? matches[0] : null;
            const key = `${snapshot.assessmentId}|${a.questionId}`;
            if (seen.has(key)) continue;
            seen.add(key);
            const counts = result.components[a.subject]; counts.total++; if (a.correct === true) counts.correct++;
            if (a.correct !== false) continue;
            const mapped = q && q.subject === a.subject ? resolve(a.subject, q, a, catalogs) : { reason: 'missing-or-conflicting-source-question' };
            if (mapped.reason) {
                result.unmapped.push({ id: key, assessmentId: snapshot.assessmentId, questionId: a.questionId, subject: a.subject, reason: mapped.reason, question: copy(q || a) });
                continue;
            }
            const rendered = { ...q, subject: a.subject, correctAnswer: q.answer ?? a.correctAnswer };
            const sourceFingerprint = fingerprint(rendered), sourceFingerprints = [...new Set([sourceFingerprint, q.fingerprint, a.fingerprint].filter(Boolean))];
            result.targets.push({ id: key, assessmentId: snapshot.assessmentId, questionId: a.questionId, subject: a.subject, ...mapped, sourceFingerprint, sourceFingerprints, sourceSubmittedAt: Number(snapshot.submittedAt), question: copy(q) });
        }
        return result;
    }
    function reportContext(subject, report) {
        const m = report.metadata || {};
        return contextOf(subject, m.context && typeof m.context === 'object' ? m.context : { ...m, unitId: m.unitId || (subject === 'english' ? m.level || (typeof m.context === 'string' ? m.context : null) : null) });
    }
    function matchAttempt(target, attempt, report, suppliedCatalogs) {
        if (!target || !attempt || !report || report.subject !== target.subject || (attempt.subject && attempt.subject !== target.subject)) return false;
        const subject = target.subject, c = reportContext(subject, report), ac = contextOf(subject, attempt);
        if (!sameContext(subject, c, target.context) || (ac && !sameContext(subject, ac, c))) return false;
        const explicit = attempt.learningTarget;
        if (explicit && (!sameContext(subject, contextOf(subject, explicit.context || explicit), c))) return false;
        if (subject === 'english') {
            const words = [attempt.word, explicit?.word, ...[attempt.conceptId, explicit?.conceptId].filter(Boolean).map(id => String(id).match(/^word(?:-definition|-sense)?:([^|:]+)$/)?.[1])].filter(Boolean);
            return words.length > 0 && words.every(w => norm(w) === norm(target.word)) && target.conceptId === `word:${target.word}`;
        }
        if (subject === 'grammar') {
            const lessons = [attempt.lessonIndex, explicit?.lessonIndex, attempt.conceptId, explicit?.conceptId].filter(v => v !== null && v !== undefined).map(lessonOf);
            return lessons.length > 0 && lessons.every(n => n === target.lessonIndex) && target.conceptId === `lesson:${target.lessonIndex}`;
        }
        if (subject !== 'english_reading' || !skillOf(target.skill) || target.conceptId !== `reading-skill:${target.skill}`) return false;
        let skills = [attempt.skill, attempt.conceptId, explicit?.skill, explicit?.conceptId].filter(Boolean).map(skillOf);
        const unit = readingUnit(c, catalogsOf(suppliedCatalogs));
        const matches = list(unit?.passages).flatMap(p => list(p.questions)).filter(q => q.id === attempt.questionId);
        if (matches.length === 1) skills = [...skills, skillOf(matches[0].skill || matches[0].type || matches[0].conceptId)];
        return skills.length > 0 && skills.every(s => s === target.skill);
    }
    const assisted = value => !!(value?.assisted || value?.hintUsed || value?.hintsUsed || value?.translationUsed || value?.translationRead || value?.invalid || value?.quarantined);
    function renderedAttempt(a, r) {
        const m = r.metadata || {}, questions = list(m.questions).concat(list(m.questionSnapshot));
        const matches = questions.filter(q => (q.id || q.questionId) === a.questionId);
        const q = matches.length === 1 ? matches[0] : {};
        return { ...q, ...a, subject: r.subject, passageText: a.passageText || a.passageLines || q.passageText || q.passageLines || m.passageText || m.passageLines || [] };
    }
    function reviewEvidence(target, events, now) {
        const seen = new Set(), successful = [], reviewed = [];
        for (const row of list(events)) {
            const entries = Array.isArray(row?.answers) ? (time(row.submittedAt) ? row.answers : []) : [row];
            for (const e of entries) {
                if (!e) continue;
                const refs = list(e.sourceReferences).length ? e.sourceReferences : [e];
                if (!refs.some(ref => (ref.assessmentId || ref.sourceAssessmentId) === target.assessmentId && (ref.questionId || ref.sourceQuestionId) === target.questionId)) continue;
                const at = time(e.reviewedAt || e.submittedAt || row.submittedAt);
                if (!at || at <= target.sourceSubmittedAt || at > now || (row.submittedAt && at > Number(row.submittedAt))) continue;
                const key = `${at}|${e.correct}|${e.status}`;
                if (seen.has(key)) continue;
                seen.add(key); reviewed.push(at);
                if (e.correct === true && (!e.status || e.status === 'correct')) successful.push(at);
            }
        }
        return { reviewed: reviewed.length > 0, reviewDone: successful.length > 0, reviewedAt: successful.length ? Math.min(...successful) : null };
    }
    function progress(target, reports, reviewEvents, now = Date.now(), suppliedCatalogs) {
        const until = time(now) || 0, baseline = time(target?.sourceSubmittedAt), review = reviewEvidence(target || {}, reviewEvents, until);
        const requiredItems = target?.subject === 'english' ? thresholds.wordFreshItems : target?.subject === 'english_reading' ? thresholds.readingFreshItems : thresholds.freshItems;
        const requiredPerDay = target?.subject === 'english' ? thresholds.wordItemsPerDay : target?.subject === 'english_reading' ? thresholds.readingItemsPerDay : thresholds.itemsPerDay;
        const output = { stage: 'needs-review', status: 'collecting', completed: false, ...review, freshCount: 0, correctCount: 0, accuracy: null, days: [], successfulDays: 0, reason: '원래 시험 문제를 먼저 복습해요.', thresholds };
        if (!baseline || !target?.conceptId || !SUBJECTS.includes(target?.subject) || !contextOf(target.subject, target.context)) return { ...output, status: 'needs-confirmation', reason: '연결된 개념과 제출 기록을 확인해야 해요.' };
        const exposed = new Set(list(target.sourceFingerprints).concat(target.sourceFingerprint || []).filter(Boolean)), sessions = new Set(), evidence = [], dayMap = new Map();
        // Reports are created only when the normal quiz finishes. Older reports
        // have createdAt/date rather than submittedAt; retries must not move this baseline.
        const firstSubmittedAt = r => { const times = [r.createdAt, r.metadata?.submittedAt, r.submittedAt, r.date].map(time).filter(Boolean); return times.length ? Math.min(...times) : null; };
        const ordered = list(reports).filter(Boolean).map(r => ({ r, at: firstSubmittedAt(r) })).filter(e => e.at && e.at <= until).sort((a, b) => a.at - b.at || String(a.r.sessionId || '').localeCompare(String(b.r.sessionId || '')));
        let incompleteMetadata = false;
        for (const { r, at } of ordered) {
            const m = r.metadata || {}, first = m.initialAttempts, all = Array.isArray(first) ? first : list(m.attempts), total = Number(r.totalQuestions);
            const submitted = at;
            const sessionKey = `${r.subject}|${r.sessionId}`;
            const normal = r.subject === target.subject && !m.assessment && !m.assessmentId && !m.mockExam && !m.examTraining && !m.review && !m.familiarAttempt && !m.repeated && !r.assessment && !r.assessmentId && !r.mockExam && !r.review && !r.draft && !m.draft && !['draft', 'partial', 'active', 'in-progress'].includes(m.status || r.status) && !assisted(m) && !assisted(r);
            const full = !!r.sessionId && !!submitted && submitted <= until && Array.isArray(first) && Number.isInteger(total) && total >= (target.subject === 'english_reading' ? thresholds.readingSessionItems : 1) && first.length === total && first.every(a => a && typeof a.correct === 'boolean' && (!a.round || a.round === 1));
            const valid = normal && full && !sessions.has(sessionKey);
            if (normal && !full && at > baseline) incompleteMetadata = true;
            // Even drafts, assisted answers, exams and old reports establish prior exposure.
            for (const a of all) {
                if (!a) continue;
                const rendered = renderedAttempt(a, r), fp = fingerprint(rendered), keys = [fp, a.fingerprint].filter(Boolean), wasSeen = !fp || keys.some(key => exposed.has(key));
                keys.forEach(key => exposed.add(key));
                const matching = matchAttempt(target, a, r, suppliedCatalogs);
                if (valid && submitted > baseline && matching && !fp) incompleteMetadata = true;
                if (!valid || submitted <= baseline || wasSeen || assisted(a) || a.repeated || a.retry || !matching) continue;
                // Reading freshness must be based on the actual new passage, not its ID.
                if (target.subject === 'english_reading' && !norm(Array.isArray(rendered.passageText) ? rendered.passageText.join(' ') : rendered.passageText)) { incompleteMetadata = true; continue; }
                evidence.push({ at: submitted, correct: a.correct, fingerprint: fp, sessionId: r.sessionId });
            }
            // Retried final attempts and stored question snapshots also mark prior exposure.
            for (const a of list(m.attempts).concat(list(m.questions), list(m.questionSnapshot))) { const fp = fingerprint(renderedAttempt(a, r)); if (fp) exposed.add(fp); if (a?.fingerprint) exposed.add(a.fingerprint); }
            if (valid) sessions.add(sessionKey);
        }
        for (const item of evidence) {
            const day = new Date(item.at + 9 * 3600000).toISOString().slice(0, 10), bucket = dayMap.get(day) || { day, count: 0, correct: 0, firstAt: item.at, lastAt: item.at };
            bucket.count++; if (item.correct) bucket.correct++; bucket.lastAt = Math.max(bucket.lastAt, item.at); dayMap.set(day, bucket);
        }
        output.freshCount = evidence.length; output.correctCount = evidence.filter(e => e.correct).length; output.accuracy = evidence.length ? output.correctCount / evidence.length : null;
        output.days = [...dayMap.values()].map(day => ({ ...day, accuracy: day.correct / day.count, successful: day.count >= requiredPerDay && day.correct / day.count >= thresholds.accuracy }));
        const successful = output.days.filter(day => day.successful); output.successfulDays = successful.length;
        const delayed = successful.some(first => successful.some(last => last.day !== first.day && last.lastAt - first.firstAt >= thresholds.delayMs && review.reviewedAt && last.lastAt - review.reviewedAt >= thresholds.delayMs));
        output.completed = review.reviewDone && evidence.length >= requiredItems && output.accuracy >= thresholds.accuracy && successful.length >= thresholds.successfulDays && delayed;
        output.stage = output.completed ? 'completed' : !review.reviewDone ? 'needs-review' : successful.length ? 'verify' : 'practice';
        output.status = output.completed ? 'completed' : incompleteMetadata && !evidence.length ? 'needs-confirmation' : 'collecting';
        output.reason = output.completed ? '서로 다른 날의 새 문제와 하루 뒤 확인을 마쳤어요.' : !review.reviewDone ? '원래 시험 문제를 먼저 복습해요.' : incompleteMetadata && !evidence.length ? '첫 제출과 새 문제 정보를 더 확인해야 해요.' : successful.length ? '다른 날에 새 문제로 한 번 더 확인해요.' : '같은 개념의 새 문제 첫 답안을 모으고 있어요.';
        return output;
    }
    const api = Object.freeze({ analyze, progress, fingerprint, matchAttempt, version, thresholds });
    root.SmartStudy = root.SmartStudy || {}; root.SmartStudy.MockLearningPolicy = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

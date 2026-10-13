(function (root) {
    'use strict';
    async function init() {
        const app = root.SmartStudy, local = app.LocalRepository, api = app.MockExam;
        await local.ready;
        const user = local.getActiveUser(); if (!user) { root.location.href = 'index.html'; return; }
        const $ = id => document.getElementById(id), params = new URLSearchParams(root.location.search);
        let draft = params.get('assessment') ? api.getById(user, params.get('assessment')) : api.get(user), bank = null, busy = false, error = '', timer, confirmingSection;
        let activityTracker = null, activitySectionId = null, activityWeek = null, recordedSeconds = 0, lastActivityPersistAt = Date.now();
        if (!draft && !params.has('assessment')) {
            $('readyPanel').hidden = false; $('startExam').disabled = true; $('bankStatus').textContent = '부모 설정과 시험 범위를 확인하고 있어요.';
            let timeout;
            try {
                const settings = await Promise.race([app.FirestoreRepository.getLearnerPlanSettings(user), new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('설정 확인 지연')), 8000); })]).finally(() => clearTimeout(timeout));
                if (local.getActiveUser() !== user) { $('examMain').hidden = true; $('accountError').hidden = false; return; }
                if (settings) app.LearningPlan.applyParentSettings(user, settings);
                $('parentSettings').textContent = settings ? '부모 설정을 확인했어요.' : '현재 저장된 설정으로 시작합니다.';
            } catch (_) { $('parentSettings').textContent = '서버 설정을 확인하지 못했어요. 이 기기에 저장된 설정(없으면 기본 설정)으로 시작합니다.'; }
        }
        const guard = () => { if (local.getActiveUser() === user) return true; clearInterval(timer); activityTracker?.destroy(); activityTracker = null; $('examMain').replaceChildren(); $('accountError').hidden = false; return false; };
        function flushActivity() {
            if (!guard() || !activityTracker || !activitySectionId) return;
            const total = activityTracker.getSeconds(), delta = total - recordedSeconds;
            if (delta > 0) draft = api.recordActivity(user, activityWeek, activitySectionId, delta);
            recordedSeconds = total; lastActivityPersistAt = Date.now();
        }
        function ensureActivity() {
            const section = draft?.sections.find(s => s.state === 'active'), resting = draft?.break && !draft.break.endedAt;
            if (draft?.submittedAt || !section || resting || document.visibilityState !== 'visible') {
                if (activityTracker) { flushActivity(); activityTracker.destroy(); activityTracker = null; }
                activitySectionId = null; return;
            }
            if (activityTracker && activitySectionId === section.id) return;
            if (activityTracker) { flushActivity(); activityTracker.destroy(); }
            activityTracker = root.ActiveTimeTracker?.create() || null;
            activitySectionId = section.id; activityWeek = draft.scheduledWeekId; recordedSeconds = 0; lastActivityPersistAt = Date.now();
        }
        const text = (tag, value, className) => { const node = document.createElement(tag); node.textContent = value; if (className) node.className = className; return node; };
        function clear() { for (const id of ['readyPanel', 'workPanel', 'breakPanel', 'submittedPanel']) $(id).hidden = true; }
        function showReady() {
            clear(); $('readyPanel').hidden = false;
            if (params.has('assessment')) { $('bankStatus').textContent = '이 기기에 시험이 없습니다. 공개된 결과를 서버에서 확인합니다.'; $('startExam').hidden = true; $('remoteResult').hidden = false; return; }
            bank = app.MockExamBank.build(user, Date.now());
            $('bankStatus').textContent = api.validateBank(bank) ? '최근 실제로 학습한 범위에서 55문항을 준비했어요.' : '정규 55문항 시험 준비 중이에요. 부족한 영역을 먼저 학습해 주세요.';
            $('shortages').replaceChildren();
            for (const [subject, shortage] of Object.entries(bank.shortages || {})) if (shortage.missing > 0) $('shortages').append(text('li', `${app.MockExamBank.subjectNames?.[subject] || ({reading:'국어',english:'영어 단어',grammar:'영어 문법',english_reading:'영어 독해',math:'수학',math_formula:'수학 공식',hanja:'한자'})[subject] || subject}: ${shortage.actual}/${shortage.required}문항 · ${shortage.missing}문항 부족`));
            if (!api.validateBank(bank) && !$('shortages').children.length) $('shortages').append(text('li', '문항 구성과 영역 배분 확인이 필요합니다.'));
            $('startExam').disabled = !api.validateBank(bank);
            const minutes = app.LearningPlan?.getSettings?.(user)?.weekly?.mockSectionMinutes || {};
            $('timePlan').textContent = api.definitions.map(s => `${s.name} ${minutes[s.id] || s.minutes}분`).join(' → ') + ' · 영어 뒤 최대 5분 휴식';
        }
        function render() {
            if (!guard()) return;
            ensureActivity();
            $('saveError').textContent = error; $('saveError').hidden = !error;
            if (!draft) { showReady(); return; }
            clear(); $('weekLabel').textContent = `${draft.scheduledWeekId} 시작 주 · 55문항`;
            $('sectionSteps').replaceChildren(); draft.sections.forEach(section => {
                const label = text('li', `${section.name} ${section.state === 'ended' ? '제출 완료' : section.state === 'active' ? '진행 중' : '예정'}`);
                if (section.state === 'active') label.setAttribute('aria-current', 'step'); $('sectionSteps').append(label);
            });
            if (draft.submittedAt) {
                $('submittedPanel').hidden = false; $('syncState').textContent = busy ? '클라우드 저장 확인 중…' : draft.syncStatus === 'synced' ? '클라우드 저장 완료' : '이 기기에 제출 완료 · 클라우드 저장 대기';
                $('retrySave').hidden = draft.syncStatus === 'synced'; $('retrySave').disabled = busy; return;
            }
            if (draft.break && !draft.break.endedAt) { $('breakPanel').hidden = false; tickClock(); return; }
            const section = draft.sections.find(s => s.state === 'active'); if (!section) return;
            const questions = api.questionsFor(draft, section), q = questions[draft.cursor] || questions[0];
            $('workPanel').hidden = false; $('sectionName').textContent = `${section.name} · ${section.durationSeconds / 60}분`;
            $('position').textContent = `${draft.cursor + 1}/${questions.length}문항 · 답한 ${questions.filter(q => String(draft.responses[q.id] || '').trim()).length}문항`;
            if (['math', 'math_formula'].includes(q.subject)) app.MockExamResults.setMathText($('question'), q.question); else $('question').textContent = q.question;
            $('passage').replaceChildren();
            if (q.passageTitle) $('passage').append(text('h3', q.passageTitle));
            const lines = q.passageLines || q.passageText || []; for (const line of Array.isArray(lines) ? lines : [lines]) $('passage').append(text('p', line));
            $('passage').hidden = !$('passage').childNodes.length;
            $('choices').replaceChildren();
            if (q.kind === 'written') {
                const label = text('label', '답 입력'); label.htmlFor = 'writtenAnswer'; const input = document.createElement('input'); input.id = 'writtenAnswer'; input.type = 'text'; input.maxLength = 2000; input.autocomplete = 'off'; input.value = draft.responses[q.id] || '';
                input.oninput = () => { if (!guard()) return; try { flushActivity(); draft = api.answer(user, draft.scheduledWeekId, q.id, input.value);
                    if (!draft.sections.find(s => s.state === 'active')?.subjects.includes(q.subject)) { render(); persistSections(); }
                    else $('position').textContent = `${draft.cursor + 1}/${questions.length}문항 · 답안 자동 저장`;
                } catch (e) { error = e.message; render(); } };
                $('choices').append(label, input);
            } else q.choices.forEach((value, index) => {
                const button = text('button', `${index + 1}. ${value}`, 'choice'); button.type = 'button'; button.setAttribute('aria-pressed', String(draft.responses[q.id] === String(value))); button.classList.toggle('selected', draft.responses[q.id] === String(value));
                if (['math', 'math_formula'].includes(q.subject)) app.MockExamResults.setMathText(button, `${index + 1}. ${value}`);
                button.onclick = () => { if (!guard()) return; try { flushActivity(); draft = api.answer(user, draft.scheduledWeekId, q.id, value); render(); } catch (e) { error = e.message; render(); } }; $('choices').append(button);
            });
            $('questionNav').replaceChildren(); questions.forEach((question, index) => {
                const button = text('button', String(index + 1), draft.responses[question.id] ? 'answered' : ''); button.type = 'button'; button.setAttribute('aria-label', `${index + 1}번 ${draft.responses[question.id] ? '응답함' : '미응답'}`); if (index === draft.cursor) button.setAttribute('aria-current', 'true');
                button.onclick = () => { if (guard()) { flushActivity(); draft = api.move(user, draft.scheduledWeekId, index); render(); $('question').focus(); } }; $('questionNav').append(button);
            });
            $('prevQuestion').disabled = draft.cursor === 0; $('nextQuestion').disabled = draft.cursor === questions.length - 1;
            $('finishSection').textContent = section.id === 'hanja' ? '한자 종료 · 전체 제출' : `${section.name} 제출 · 다음 과목`; tickClock();
        }
        function tickClock() {
            if (!draft || draft.submittedAt) return;
            const resting = draft.break && !draft.break.endedAt, section = draft.sections.find(s => s.state === 'active');
            const seconds = Math.max(0, Math.ceil(((resting ? draft.break.deadline : section?.deadline) - Date.now()) / 1000));
            const label = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; $(resting ? 'breakClock' : 'examClock').textContent = label;
        }
        async function persistSections() {
            if (!guard() || !draft) return;
            try { await api.saveReports(user, draft.scheduledWeekId); } catch (e) { error = '과목 기록 저장을 확인하지 못했어요. 답안은 이 기기에 보관되어 있어요.'; }
            if (draft.submittedAt) await send(); else render();
        }
        async function send() {
            if (busy || !guard() || !draft?.submittedAt) return;
            busy = true; error = ''; render();
            const result = await api.sync(user, draft.scheduledWeekId);
            if (!guard()) return; busy = false; draft = api.get(user, draft.scheduledWeekId);
            if (!result.synced) error = '클라우드 저장을 완료하지 못했어요. 인터넷 연결 후 다시 저장해 주세요. 제출 답안은 유지됩니다.'; render();
        }
        async function showResults(id) {
            if (!guard() || busy) return;
            $('releasedResults').hidden = false; $('releasedResults').replaceChildren(text('p', '결과 공개 상태 확인 중…'));
            let timeout; const result = await Promise.race([app.MockExamResults.load(user, id), new Promise(resolve => { timeout = setTimeout(() => resolve({published:false,reason:'offline'}), 10000); })]).finally(() => clearTimeout(timeout));
            if (guard()) { app.MockExamResults.render($('releasedResults'), result);
                $('submissionMessage').textContent = result.published ? '선생님/보호자가 결과를 공개했어요. 첫 제출 결과와 해설을 아래에서 확인하세요.' : '선생님/보호자가 결과를 확인하고 있어요. 공개되면 확인할 수 있어요.';
            }
        }
        $('startExam').onclick = () => { if (!guard()) return; try { draft = api.create(user, bank); render(); } catch (e) { error = e.message; render(); } };
        $('prevQuestion').onclick = () => { if (guard()) { flushActivity(); draft = api.move(user, draft.scheduledWeekId, draft.cursor - 1); render(); $('question').focus(); } };
        $('nextQuestion').onclick = () => { if (guard()) { flushActivity(); draft = api.move(user, draft.scheduledWeekId, draft.cursor + 1); render(); $('question').focus(); } };
        $('finishSection').onclick = () => {
            if (!guard()) return; const section = draft.sections.find(s => s.state === 'active'), questions = api.questionsFor(draft, section), missing = questions.filter(q => !String(draft.responses[q.id] || '').trim()).length;
            confirmingSection = section.id; $('submitMessage').textContent = missing ? `${missing}문항이 미응답입니다. 제출 후 이 과목 답안은 바꿀 수 없습니다.` : '제출 후 이 과목 답안은 바꿀 수 없습니다.'; $('submitDialog').showModal();
        };
        $('continueExam').onclick = () => $('submitDialog').close();
        $('confirmSection').onclick = () => { $('submitDialog').close(); if (!guard()) return; try { flushActivity(); draft = api.finishSection(user, draft.scheduledWeekId, Date.now(), confirmingSection); render(); persistSections(); } catch (e) { error = e.message; render(); } };
        $('skipBreak').onclick = () => { if (guard()) { draft = api.skipBreak(user, draft.scheduledWeekId); render(); } };
        $('retrySave').onclick = send; $('checkResults').onclick = () => showResults(draft.assessmentId); $('remoteResult').onclick = () => showResults(params.get('assessment'));
        if (draft) { draft = api.reconcile(user, draft.scheduledWeekId); render(); if (draft.sections.some(s => s.state === 'ended')) persistSections(); if (draft.submittedAt) showResults(draft.assessmentId); }
        else { render(); if (params.has('assessment')) showResults(params.get('assessment')); }
        timer = setInterval(() => {
            if (!guard() || !draft || draft.submittedAt) return;
            try { const section = draft.sections.find(s => s.state === 'active');
                if (Date.now() - lastActivityPersistAt >= 10000 || section && Date.now() >= section.deadline) flushActivity();
                const previous = JSON.stringify(draft.sections.map(s => s.state)) + String(draft.break?.endedAt); draft = api.reconcile(user, draft.scheduledWeekId);
                if (previous !== JSON.stringify(draft.sections.map(s => s.state)) + String(draft.break?.endedAt)) { if ($('submitDialog').open) $('submitDialog').close(); render(); persistSections(); } else tickClock();
            } catch (e) { error = e.message; render(); }
        }, 1000);
        root.addEventListener('storage', guard);
        document.addEventListener('visibilitychange', () => { if (!guard()) return; try { flushActivity(); ensureActivity(); } catch (e) { error = e.message; } });
        root.addEventListener('pagehide', () => { try { flushActivity(); activityTracker?.destroy(); activityTracker = null; } catch (_) { /* Existing saved activity is retained. */ } });
        root.addEventListener('pageshow', () => { if (!guard() || !draft || draft.submittedAt) return; draft = api.reconcile(user, draft.scheduledWeekId); render(); if (draft.sections.some(s => s.state === 'ended')) persistSections(); });
        root.addEventListener('smartstudy:storage-error', event => {
            if (!guard()) return; error = event.detail?.memoryOnly ? '기기 저장 공간이 부족해 답안을 임시 보관 중입니다. 앱을 닫기 전에 제출과 클라우드 저장을 확인해 주세요.' : '기기 저장을 확인하지 못했습니다. 앱을 닫기 전에 저장 상태를 확인해 주세요.'; render();
        });
    }
    init().catch(error => { console.error('[Mock exam]', error); const message = document.getElementById('saveError'); message.hidden = false; message.textContent = '시험을 열지 못했어요. 새로고침해서 다시 확인해 주세요.'; });
})(window);

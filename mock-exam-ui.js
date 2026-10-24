(function (root) {
    'use strict';
    async function init() {
        const app = root.SmartStudy, local = app.LocalRepository, api = app.MockExam;
        await local.ready;
        const user = local.getActiveUser(); if (!user) { root.location.href = 'index.html'; return; }
        const $ = id => document.getElementById(id), params = new URLSearchParams(root.location.search);
        let retakeOptions=null,remoteHistory=[],publicationRequest=0;
        let draft = params.get('assessment') ? api.getById(user, params.get('assessment')) : api.get(user), bank = null, busy = false, error = '', timer, confirmingSection;
        // Recover submitted rounds from another device before offering a new first exam.
        if(!draft||draft.submittedAt){
        $('readyPanel').hidden=false;$('startExam').disabled=true;$('bankStatus').textContent='이전 시험과 회차를 확인하고 있어요.';
        try{
            remoteHistory=await app.MockPublication.list(user,{week:draft?.scheduledWeekId||api.weekId()});
            if(local.getActiveUser()!==user)return;
            api.restore(user,remoteHistory);
            draft=params.get('assessment')?api.getById(user,params.get('assessment')):api.get(user);
        }catch(_){/* Offline exams on this device remain available; no draft is overwritten. */}
        }
        if(!draft&&!params.has('assessment')){
            const recorded=local.listReports(user).filter(r=>r.metadata?.mockExam&&r.metadata?.examComplete&&r.metadata.scheduledWeekId===api.weekId());
            if(recorded.length){const max=Math.max(...recorded.map(r=>Number(r.metadata.attemptNo||r.round)||1));retakeOptions={retake:true,attemptNo:max+1,previousAttemptNo:max,scheduledWeekId:api.weekId(),parentAttemptId:recorded.find(r=>Number(r.metadata.attemptNo||r.round||1)===max)?.metadata.assessmentId,history:remoteHistory};}
        }
        // Passages read in this visit; their options open only after the learner confirms reading.
        const readPassages = new Set();
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
            activitySectionId = section.id; activityWeek = draft.assessmentId; recordedSeconds = 0; lastActivityPersistAt = Date.now();
        }
        const text = (tag, value, className) => { const node = document.createElement(tag); node.textContent = value; if (className) node.className = className; return node; };
        function clear() { for (const id of ['readyPanel', 'workPanel', 'breakPanel', 'submittedPanel']) $(id).hidden = true; }
        function showReady() {
            clear(); $('readyPanel').hidden = false;
            if (params.has('assessment')&&!retakeOptions) { $('bankStatus').textContent = '이 기기에 시험이 없습니다. 공개된 결과를 서버에서 확인합니다.'; $('startExam').hidden = true; $('remoteResult').hidden = false; return; }
            bank = app.MockExamBank.build(user, Date.now(),retakeOptions||{});
            $('cancelRetake').hidden=!retakeOptions||!draft;
            $('startExam').hidden=false;
            $('startExam').textContent=retakeOptions?`${retakeOptions.attemptNo}회차 새 문제로 시작`:'55문항 시험 시작';
            $('bankStatus').textContent = api.validateBank(bank) ? '학습한 범위의 새 지문·응용 문제로 55문항을 준비했어요. 기존 풀이 기록과 중복을 확인했어요.' : '학습 기록에서 시험 문항을 구성하지 못했어요. 추가 공부가 필요한 것은 아닙니다. 기록 동기화 후 다시 확인해 주세요.';
            $('shortages').replaceChildren();
            for (const [subject, shortage] of Object.entries(bank.shortages || {})) if (shortage.missing > 0) $('shortages').append(text('li', `${app.MockExamBank.subjectNames?.[subject] || ({reading:'국어',korean_vocab:'국어 어휘',english:'영어 단어',grammar:'영어 문법',english_reading:'영어 독해',math:'수학',math_formula:'수학 공식',hanja:'한자'})[subject] || subject}: ${shortage.actual}/${shortage.required}문항 · ${shortage.missing}문항 부족`));
            for(const row of bank.coverageNotes||[])if(row.questions)$('shortages').append(text('li',`${({reading:'국어 독해',korean_vocab:'국어 어휘',english:'영어 단어',grammar:'영어 문법',english_reading:'영어 독해',math:'수학',math_formula:'수학 공식',hanja:'한자'})[row.subject]}: 이번 주 ${row.days}일 학습 · ${row.questions}문항 반영`));
            if (!api.validateBank(bank) && !$('shortages').children.length) $('shortages').append(text('li', '문항 구성과 영역 배분 확인이 필요합니다.'));
            $('startExam').disabled = !api.validateBank(bank);
            const minutes = app.LearningPlan?.getSettings?.(user)?.weekly?.mockSectionMinutes || {};
            $('timePlan').textContent = api.definitions.map(s => `${s.name} ${minutes[s.id] || s.minutes}분`).join(' → ') + ' · 영어 뒤 최대 5분 휴식';
        }
        function render() {
            if (!guard()) return;
            ensureActivity();
            $('saveError').textContent = error; $('saveError').hidden = !error;
            if (!draft||retakeOptions) { showReady(); return; }
            clear(); $('weekLabel').textContent = `${draft.scheduledWeekId} 주 · ${draft.attemptNo||1}회차 · 55문항`;
            $('sectionSteps').replaceChildren(); draft.sections.forEach(section => {
                const label = text('li', `${section.name} ${section.state === 'ended' ? '제출 완료' : section.state === 'active' ? '진행 중' : '예정'}`);
                if (section.state === 'active') label.setAttribute('aria-current', 'step'); $('sectionSteps').append(label);
            });
            if (draft.submittedAt) {
                $('submittedPanel').hidden = false;$('submittedPanel').querySelector('h2').textContent=`${draft.attemptNo||1}회차 · 네 과목 제출 완료`; $('syncState').textContent = busy ? '클라우드 저장 확인 중…' : draft.syncStatus === 'synced' ? '클라우드 저장 완료' : '이 기기에 제출 완료 · 클라우드 저장 대기';
                $('retakeExam').disabled=busy;$('checkResults').disabled=busy;
                $('retakeExam').textContent=`새 문제로 ${Number(draft.attemptNo||1)+1}회차 보기`;
                renderHistory();
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
            if(q.glossary?.length)$('passage').append(text('p','낱말·구문 도움: '+q.glossary.map(item=>`${item.word}: ${item.meaning}`).join(' · ')));
            $('passage').hidden = !$('passage').childNodes.length;
            $('choices').replaceChildren();
            if (q.passageId && (q.passageLines || q.passageText) && !readPassages.has(q.passageId) && !draft.responses[q.id]) {
                const open = text('button', '지문을 끝까지 읽었어요 · 보기 열기', 'choice passage-gate'); open.type = 'button';
                open.onclick = () => { if (!guard()) return; readPassages.add(q.passageId); render(); $('question').focus(); };
                $('choices').append(open);
            } else if (q.kind === 'written') {
                const label = text('label', '답 입력'); label.htmlFor = 'writtenAnswer'; const input = document.createElement('input'); input.id = 'writtenAnswer'; input.type = 'text'; input.maxLength = 2000; input.autocomplete = 'off'; input.value = draft.responses[q.id] || ''; input.placeholder = q.inputHint || '답을 입력하세요'; input.inputMode = 'text';
                input.oninput = () => { if (!guard()) return; try { flushActivity(); draft = api.answer(user, draft.assessmentId, q.id, input.value);
                    if (!draft.sections.find(s => s.state === 'active')?.subjects.includes(q.subject)) { render(); persistSections(); }
                    else $('position').textContent = `${draft.cursor + 1}/${questions.length}문항 · 답안 자동 저장`;
                } catch (e) { error = e.message; render(); } };
                $('choices').append(label, input);
            } else q.choices.forEach((value, index) => {
                const button = text('button', `${index + 1}. ${value}`, 'choice'); button.type = 'button'; button.setAttribute('aria-pressed', String(draft.responses[q.id] === String(value))); button.classList.toggle('selected', draft.responses[q.id] === String(value));
                if (['math', 'math_formula'].includes(q.subject)) app.MockExamResults.setMathText(button, `${index + 1}. ${value}`);
                button.onclick = () => { if (!guard()) return; try { flushActivity(); draft = api.answer(user, draft.assessmentId, q.id, value); render(); } catch (e) { error = e.message; render(); } }; $('choices').append(button);
            });
            $('questionNav').replaceChildren(); questions.forEach((question, index) => {
                const button = text('button', String(index + 1), draft.responses[question.id] ? 'answered' : ''); button.type = 'button'; button.setAttribute('aria-label', `${index + 1}번 ${draft.responses[question.id] ? '응답함' : '미응답'}`); if (index === draft.cursor) button.setAttribute('aria-current', 'true');
                button.onclick = () => { if (guard()) { flushActivity(); draft = api.move(user, draft.assessmentId, index); render(); $('question').focus(); } }; $('questionNav').append(button);
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
            if(!guard()||!draft)return;
            const assessmentId=draft.assessmentId;
            try{await api.saveReports(user,assessmentId);}catch(e){if(draft?.assessmentId===assessmentId)error='과목 기록 저장을 확인하지 못했어요. 답안은 이 기기에 보관되어 있어요.';}
            if(!guard())return;
            const saved=api.getById(user,assessmentId);
            if(saved?.submittedAt){if(draft?.assessmentId===assessmentId)await send();else await api.sync(user,assessmentId);}
            else if(draft?.assessmentId===assessmentId)render();
        }
        async function send() {
            if (busy || !guard() || !draft?.submittedAt) return;
            busy = true; error = ''; const assessmentId=draft.assessmentId;render();
            const result = await api.sync(user, assessmentId);
            if (!guard()) return;busy=false;if(draft?.assessmentId!==assessmentId)return;draft=api.get(user,assessmentId);
            if (!result.synced) error = '클라우드 저장을 완료하지 못했어요. 인터넷 연결 후 다시 저장해 주세요. 제출 답안은 유지됩니다.'; render();
        }
        async function showResults(id) {
            if (!guard() || busy) return;
            const request=++publicationRequest;
            $('releasedResults').hidden = false; $('releasedResults').replaceChildren(text('p', '결과 공개 상태 확인 중…'));
            let timeout; const result = await Promise.race([app.MockExamResults.load(user, id), new Promise(resolve => { timeout = setTimeout(() => resolve({published:false,reason:'offline'}), 10000); })]).finally(() => clearTimeout(timeout));
            if(guard()&&request===publicationRequest&&!retakeOptions&&(draft?.assessmentId||params.get('assessment'))===id){app.MockExamResults.render($('releasedResults'),result);
                $('submissionMessage').textContent = result.published ? '선생님/보호자가 결과를 공개했어요. 이 회차의 결과와 해설을 아래에서 확인하세요.' : '선생님/보호자가 결과를 확인하고 있어요. 공개되면 확인할 수 있어요.';
            }
        }
        $('startExam').onclick = () => { if (!guard()) return; try { draft = api.create(user, bank,Date.now(),retakeOptions||{});retakeOptions=null;readPassages.clear();params.delete('assessment');root.history.replaceState(null,'',root.location.pathname);$('releasedResults').hidden=true;render(); } catch (e) { error = e.message; render(); } };
        function renderHistory(){
            const select=$('examHistory'),rows=api.list(user,draft?.scheduledWeekId||api.weekId());select.replaceChildren();select.disabled=busy;
            for(const row of rows){const option=text('option',`${row.scheduledDate} · ${row.attemptNo||1}회차${row.submittedAt?'':' · 진행 중'}`);option.value=row.assessmentId;option.selected=row.assessmentId===draft?.assessmentId;select.append(option);}
            $('examHistoryLabel').hidden=rows.length<2;
        }
        $('cancelRetake').onclick=()=>{retakeOptions=null;render();};
        $('examHistory').onchange=()=>{const saved=api.getById(user,$('examHistory').value);if(!saved)return;draft=saved;publicationRequest++;params.set('assessment',saved.assessmentId);root.history.replaceState(null,'',root.location.pathname+'?assessment='+encodeURIComponent(saved.assessmentId));$('releasedResults').hidden=true;render();if(draft.submittedAt)showResults(draft.assessmentId);};
        $('retakeExam').onclick=async()=>{
            if(!guard()||busy||!draft?.submittedAt)return;
            busy=true;publicationRequest++;$('examHistory').disabled=true;$('retakeExam').disabled=true;$('retakeExam').textContent='이전 회차와 새 문제 확인 중…';
            try{remoteHistory=await app.MockPublication.list(user,{week:draft.scheduledWeekId});if(guard())api.restore(user,remoteHistory);}catch(_){/* Keep the previously verified history if temporarily offline. */}
            if(!guard())return;
            const records=[...api.list(user,draft.scheduledWeekId),...remoteHistory.map(r=>r.payload).filter(Boolean)],max=Math.max(1,...records.map(r=>Number(r.attemptNo)||1));
            retakeOptions={retake:true,attemptNo:max+1,previousAttemptNo:max,scheduledWeekId:draft.scheduledWeekId,parentAttemptId:draft.assessmentId,history:remoteHistory};
            busy=false;error='';$('releasedResults').hidden=true;render();
        };
        $('prevQuestion').onclick = () => { if (guard()) { flushActivity(); draft = api.move(user, draft.assessmentId, draft.cursor - 1); render(); $('question').focus(); } };
        $('nextQuestion').onclick = () => { if (guard()) { flushActivity(); draft = api.move(user, draft.assessmentId, draft.cursor + 1); render(); $('question').focus(); } };
        $('finishSection').onclick = () => {
            if (!guard()) return; const section = draft.sections.find(s => s.state === 'active'), questions = api.questionsFor(draft, section), missing = questions.filter(q => !String(draft.responses[q.id] || '').trim()).length;
            // Finishing in the first quarter of the time usually means the answers were not checked.
            const minutesLeft = Math.ceil((section.deadline - Date.now()) / 60000), hurried = Date.now() - section.startedAt < section.durationSeconds * 250;
            confirmingSection = section.id; $('submitMessage').textContent = (hurried ? `아직 ${minutesLeft}분이 남았어요. 1분만 답을 다시 확인해 보세요. ` : '') + (missing ? `${missing}문항이 미응답입니다. 제출 후 이 과목 답안은 바꿀 수 없습니다.` : '제출 후 이 과목 답안은 바꿀 수 없습니다.'); $('submitDialog').showModal();
        };
        $('continueExam').onclick = () => $('submitDialog').close();
        $('confirmSection').onclick = () => { $('submitDialog').close(); if (!guard()) return; try { flushActivity(); draft = api.finishSection(user, draft.assessmentId, Date.now(), confirmingSection); render(); persistSections(); } catch (e) { error = e.message; render(); } };
        $('skipBreak').onclick = () => { if (guard()) { draft = api.skipBreak(user, draft.assessmentId); render(); } };
        $('retrySave').onclick = send; $('checkResults').onclick = () => showResults(draft.assessmentId); $('remoteResult').onclick = () => showResults(params.get('assessment'));
        if (draft) { draft = api.reconcile(user, draft.assessmentId); render(); if (draft.sections.some(s => s.state === 'ended')) persistSections(); if (draft.submittedAt) showResults(draft.assessmentId); }
        else { render(); if (params.has('assessment')) showResults(params.get('assessment')); }
        timer = setInterval(() => {
            if (!guard() || !draft || draft.submittedAt) return;
            try { const section = draft.sections.find(s => s.state === 'active');
                if (Date.now() - lastActivityPersistAt >= 10000 || section && Date.now() >= section.deadline) flushActivity();
                const previous = JSON.stringify(draft.sections.map(s => s.state)) + String(draft.break?.endedAt); draft = api.reconcile(user, draft.assessmentId);
                if (previous !== JSON.stringify(draft.sections.map(s => s.state)) + String(draft.break?.endedAt)) { if ($('submitDialog').open) $('submitDialog').close(); render(); persistSections(); } else tickClock();
            } catch (e) { error = e.message; render(); }
        }, 1000);
        root.addEventListener('storage', guard);
        root.addEventListener('firemerged',event=>{if(event.detail?.userId===user&&guard()&&!busy&&(!draft||retakeOptions))render();});
        document.addEventListener('visibilitychange', () => { if (!guard()) return; try { flushActivity(); ensureActivity(); } catch (e) { error = e.message; } });
        root.addEventListener('pagehide', () => { try { flushActivity(); activityTracker?.destroy(); activityTracker = null; } catch (_) { /* Existing saved activity is retained. */ } });
        root.addEventListener('pageshow', () => { if (!guard() || !draft || draft.submittedAt) return; draft = api.reconcile(user, draft.assessmentId); render(); if (draft.sections.some(s => s.state === 'ended')) persistSections(); });
        root.addEventListener('smartstudy:storage-error', event => {
            if (!guard()) return; error = event.detail?.memoryOnly ? '기기 저장 공간이 부족해 답안을 임시 보관 중입니다. 앱을 닫기 전에 제출과 클라우드 저장을 확인해 주세요.' : '기기 저장을 확인하지 못했습니다. 앱을 닫기 전에 저장 상태를 확인해 주세요.'; render();
        });
    }
    init().catch(error => { console.error('[Mock exam]', error); const message = document.getElementById('saveError'); message.hidden = false; message.textContent = '시험을 열지 못했어요. 새로고침해서 다시 확인해 주세요.'; });
})(window);

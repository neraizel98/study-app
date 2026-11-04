(function () {
 'use strict';
 const app = window.SmartStudy = window.SmartStudy || {}, generations = new WeakMap();
 const subjects = { english: '단어', grammar: '문법', english_reading: '독해' };
 const node = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
 function components(snapshot) {
  const counts = Object.fromEntries(Object.keys(subjects).map(s => [s, { correct: 0, total: 0 }]));
  for (const attempt of snapshot.initialAttempts || []) {
   const subject = attempt.subject || snapshot.questions?.find(q => q.id === attempt.questionId)?.subject;
   if (!counts[subject] || typeof attempt.correct !== 'boolean') continue;
   counts[subject].total++; if (attempt.correct) counts[subject].correct++;
  }
  return counts;
 }
 function eligible(record) {
  const p = record.payload;
  if (p?.status !== 'submitted' || !p.submittedAt || !record.assessmentId || p.integrity?.translationDetected === true) return false;
  const attempts = (p.initialAttempts || []).filter(a => subjects[a.subject || p.questions?.find(q => q.id === a.questionId)?.subject]);
  return attempts.length > 0 && attempts.every(a => typeof a.correct === 'boolean');
 }
 const label = r => `${r.payload.scheduledWeekId} 주 · ${r.payload.attemptNo || 1}회차 · ${r.payload.mode === 'paper' || r.payload.integrity?.source === 'paper-omr' ? '종이 시험' : '온라인 시험'}`;
 async function mount(user, host, records) {
  const repository = app.MockLearningRepository;
  if (!repository?.get || !repository?.set) return null;
  const generation = {}; generations.set(host, generation);
  const alive = () => host.isConnected && window._adminData?.userId === user && generations.get(host) === generation;
  const panel = node('section', 'mock-learning-panel'), title = node('h3', null, '영어 학습 진단 기준');
  panel.append(title); host.append(panel);
  const reference = node('div', 'mock-learning-reference'), message = node('p', 'mock-learning-message');
  message.setAttribute('role', 'status'); message.textContent = '진단 설정을 확인하는 중...';
  panel.append(reference, message);
  let settings = null, busy = false, loaded = false;
  const cards = new Map(), clear = node('button', 'mock-learning-clear', '진단 기준 해제'); clear.type = 'button'; clear.hidden = true; panel.append(clear);
  const selected = () => settings?.assessmentId || null;
  const timing = r => r.published ? '다음 미시작 학습에 반영' : '결과 공개 후 학습 반영';
  function refresh() {
   if (!alive()) return;
   reference.replaceChildren();
   const chosen = records.find(r => r.assessmentId === selected());
   if (!loaded) { clear.hidden = true; return; }
   if (chosen) {
    const c = components(chosen.payload), total = Object.values(c).reduce((n, x) => n + x.total, 0), correct = Object.values(c).reduce((n, x) => n + x.correct, 0);
    reference.append(node('strong', 'mock-learning-score', `영어 ${total ? `${Math.round(correct / total * 100)}점` : '점수 자료 없음'}`), node('p', null, `기준 시험: ${label(chosen)}`), node('p', 'mock-learning-state', timing(chosen)));
    const grid = node('div', 'mock-learning-counts');
    for (const s of Object.keys(subjects)) grid.append(node('span', null, `${subjects[s]} ${c[s].correct}/${c[s].total} 정답`));
    reference.append(grid);
    const tiers = {}; for (const q of chosen.payload.questions || []) if (subjects[q.subject]) { const d = q.difficulty || '미기록'; tiers[d] = (tiers[d] || 0) + 1; }
    reference.append(node('p', 'mock-learning-meta', `출제 구성 버전: ${chosen.payload.bankVersion || '미기록'} · 영어 문항 난도: ${Object.entries(tiers).map(([k, v]) => `${({ basic: '기초', standard: '표준', challenge: '도전' })[k] || k} ${v}문항`).join(' · ') || '미기록'}`));
   } else reference.append(node('p', null, selected() ? '지정된 진단 시험이 조회 기간에 없습니다. 원래 진단 설정은 유지됩니다.' : '진단 근거 미선택 · 아래 제출 회차에서 영어 진단 기준을 직접 선택해 주세요.'));
   reference.append(node('p', 'mock-learning-note', '영어 단어·문법·독해 보충에만 사용합니다. 기존 주별 첫 시험 추이는 유지하며, 시행 방식·출제 구성·난도가 다른 점수는 직접 비교하기 어렵습니다. 문항 수가 적은 영역은 새 문제로 추가 확인이 필요합니다. 이미 시작한 학습은 바꾸지 않습니다.'));
   clear.hidden = !selected(); clear.disabled = busy;
   for (const [r, ui] of cards) {
    const active = selected() === r.assessmentId;
    ui.card.classList.toggle('is-learning-baseline', active);
    ui.status.textContent = active ? `영어 진단 지정됨 · ${timing(r)}` : '진단 근거 미선택';
    ui.button.disabled = busy || active || !ui.check.checked; ui.check.disabled = busy || active;
    ui.button.textContent = active ? '영어 진단 기준으로 지정됨' : '이 시험을 영어 진단 기준으로 지정';
   }
  }
  async function save(assessmentId) {
   if (!alive() || busy || !loaded) return;
   busy = true; message.className = 'mock-learning-message'; message.textContent = '진단 설정을 서버에 저장하는 중...'; refresh();
   try {
    const saved = await repository.set(user, { assessmentId, confirmedUnassisted: assessmentId !== null });
    if (!alive()) return;
    if (!saved || saved.assessmentId !== assessmentId) throw new Error('서버 저장 결과를 확인하지 못했습니다. 다시 조회해 주세요.');
    settings = saved; message.textContent = assessmentId ? '영어 진단 기준을 저장했습니다.' : '영어 진단 기준을 해제했습니다.';
   } catch (error) { if (alive()) { message.className = 'mock-learning-message is-error'; message.textContent = `진단 설정을 저장하지 못했습니다. ${error?.message || '잠시 후 다시 시도해 주세요.'}`; } }
   finally { if (alive()) { busy = false; refresh(); } }
  }
  clear.onclick = () => save(null);
  try { settings = await repository.get(user); if (!alive()) return null; loaded = true; message.textContent = ''; refresh(); }
  catch (error) { if (!alive()) return null; message.className = 'mock-learning-message is-error'; message.textContent = `진단 설정을 받지 못했습니다. 학습자를 다시 선택해 주세요. ${error?.message || ''}`; }
  return {
   refresh,
   decorateCard(record, card) {
    for (const [r, ui] of cards) if (!ui.card.isConnected) cards.delete(r);
    if (!alive() || record.payload?.status === 'paper') return;
    const row = node('div', 'mock-learning-select'), status = node('p', 'mock-learning-card-status', loaded ? '진단 근거 미선택' : '진단 설정 확인 불가'); row.append(status); card.append(row);
    if (!loaded || !eligible(record)) { if (loaded) row.append(node('p', 'mock-learning-note', record.payload?.integrity?.translationDetected === true ? '번역이 감지된 시험은 영어 진단 기준으로 지정할 수 없습니다. 기존 시험 기록은 유지됩니다.' : '채점 완료된 영어 제출 결과만 진단 기준으로 지정할 수 있습니다.')); return; }
    const confirmation = node('label', 'mock-learning-confirm'), check = node('input'); check.type = 'checkbox';
    confirmation.append(check, node('span', null, '답안과 채점 결과를 확인했으며, 번역·다른 사람의 도움 없이 응시한 시험임을 확인했습니다.'));
    const button = node('button', 'mock-learning-choose'); button.type = 'button'; row.append(confirmation, button);
    cards.set(record, { card, status, check, button }); check.onchange = refresh;
    button.onclick = () => { if (check.checked && !button.disabled) return save(record.assessmentId); };
    refresh();
   }
  };
 }
 app.MockLearningAdmin = { mount };
})();

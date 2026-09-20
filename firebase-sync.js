/**
 * firebase-sync.js
 * Firebase Firestore 기반 크로스 디바이스 데이터 동기화
 *
 * 동작 방식:
 * - 로컬 localStorage 를 1차 저장소로 사용 (빠름, 오프라인 가능)
 * - Firestore 를 2차 저장소로 사용 (기기 간 동기화)
 * - 로그인 시: Firestore → localStorage 병합
 * - 저장 시:   localStorage 즉시 저장 + Firestore 백그라운드 업로드 (2초 디바운스)
 */

const _localRepository = window.SmartStudy.LocalRepository;
const _remoteRepository = window.SmartStudy.FirestoreRepository;
const _storageEvents = window.SmartStudy.StorageEvents;

// ─────────────────────────────────────────────
//  내부 상태
// ─────────────────────────────────────────────
let _db          = null;
let _syncReady   = false;
const _timers    = {};
const _syncingUsers = new Set();
const _loginPromises = {};
const _dirty = new Map();
let _badgeOwner = null;
const _watchdogs = new Map();
const _initialSucceeded = new Set();
const _retryTimers = new Map();
const _retryDelays = new Map();
const _syncRuns = new Map();
let _runSequence = 0;
let _lastInitError = null;
let _lastInitOperation = null;
const _operationLabels = {
    durable: '기기 저장소 준비', sdk: '클라우드 연결 준비', auth: '계정 인증', marker: '저장 형식 확인', legacy: '이전 기록 확인',
    profile: '사용자 정보 받기', 'reports-list': '퀴즈 목록 받기', 'wrong-list': '오답 목록 받기',
    'reports-body': '퀴즈 본문 검증', 'wrong-body': '오답 본문 검증', config: '학습 설정 받기', merge: '기기 기록과 합치기',
    flush: '기기 저장 확정', 'profile-upload': '사용자 정보 확인', 'daily-upload': '오늘 학습 확인', reports: '퀴즈 기록 확인',
    wrong: '오답 기록 확인', markerUpload: '저장 형식 확정', checkpoints: '다음 동기화 위치 저장', final: '최종 저장 확인'
};
function _classifySyncError(error, lane = '') {
    const raw = String(error?.code || error?.name || '').toLowerCase();
    const text = String(error?.message || '').toLowerCase();
    const match = (...values) => values.some(value => raw.includes(value) || text.includes(value));
    if (match('permission-denied', 'permission_denied')) return { code: 'permission', action: '클라우드 접근 권한을 확인해 주세요.' };
    if (match('unauthenticated', 'auth/', '인증')) return { code: 'unauthenticated', action: '클라우드 계정을 다시 연결해 주세요.' };
    if (lane === 'local' || match('quotaexceedederror', 'indexeddb', 'storage')) return { code: 'storage', action: '현재 화면을 유지하고 가능한 경우 기록을 백업해 주세요.' };
    if (match('resource-exhausted')) return { code: 'quota', action: '클라우드 사용량을 확인하고 잠시 뒤 다시 시도해 주세요.' };
    if (match('checksum', '검증에 실패')) return { code: 'checksum', action: '기록은 기기에 유지됩니다. 다시 동기화해 주세요.' };
    if (match('missing', '일부를 받지 못')) return { code: 'missing', action: '일부 기록을 받지 못했습니다. 다시 시도해 주세요.' };
    if (window.navigator?.onLine === false || match('network-request-failed', 'offline')) return { code: 'offline', action: '인터넷 연결 뒤 자동으로 다시 시도합니다.' };
    if (match('unavailable', 'deadline-exceeded')) return { code: 'unavailable', action: '서버가 응답하면 자동으로 다시 시도합니다.' };
    return { code: raw.replace(/[^a-z0-9_/-]/g, '').slice(0, 48) || 'unknown', action: '기록은 기기에 유지됩니다. 잠시 뒤 다시 시도해 주세요.' };
}
function _beginSyncRun(userId) {
    const run = { userId, runId: `sync-${Date.now()}-${++_runSequence}`, startedAt: Date.now(), lastCompletedAt: null, stalled: false, lanes: new Map(), state: 'running' };
    _syncRuns.set(userId, run);
    if (window.setInterval) run._ticker = window.setInterval(() => { if (run.state === 'running') _renderSyncStatus(run); }, 1000);
    return run;
}
function _recordSyncStep(userId, runId, lane, operation, status, options = {}) {
    const run = _syncRuns.get(userId);
    if (!run || run.runId !== runId || run.state !== 'running') return;
    const key = `${lane}:${operation}`;
    const prior = run.lanes.get(key) || {};
    const completed = Number.isFinite(options.completed) ? options.completed : (prior.completed || 0);
    const total = Number.isFinite(options.total) ? options.total : null;
    const now = Date.now();
    const next = { ...prior, lane, operation, status, completed, total, pages: options.pages || prior.pages || null, source: options.source || 'unknown', updatedAt: now };
    if (status === 'progress' || status === 'completed') {
        next.lastCompletedAt = now;
        run.lastCompletedAt = now;
        run.stalled = false;
    }
    if (options.error) { next.error = _classifySyncError(options.error, lane); next._errorRef = options.error; }
    run.lanes.set(key, next);
    _renderSyncStatus(run);
    if (status === 'waiting' || status === 'progress' || status === 'completed') _touchSync(userId);
}
function _failActiveSyncStep(run, error) {
    if (!run) return;
    if ([...run.lanes.values()].some(step => step.status === 'failed' && step._errorRef === error)) return;
    const active = [...run.lanes.values()].reverse().find(step => step.status === 'waiting' || step.status === 'progress');
    _recordSyncStep(run.userId, run.runId, active?.lane || 'final', active?.operation || 'final', 'failed', {
        completed: active?.completed || 0, total: active?.total, pages: active?.pages, source: active?.source, error
    });
}
function _retryLogin(userId) {
    if (_retryTimers.has(userId) || window.navigator?.onLine === false) return;
    const delay = Math.min(60000, (_retryDelays.get(userId) || 1000) * 2);
    _retryDelays.set(userId, delay);
    _retryTimers.set(userId, setTimeout(() => {
        _retryTimers.delete(userId);
        window.FireSync.onLogin(userId).catch(error => console.warn('[FireSync retry]', error));
    }, delay));
}
function _touchSync(userId) {
    clearTimeout(_watchdogs.get(userId));
    _watchdogs.set(userId, setTimeout(() => {
        const run = _syncRuns.get(userId);
        if (run?.state === 'running') {
            run.stalled = true;
            _renderSyncStatus(run);
        } else {
            _showSyncBadge('☁️ 현재 단계에서 새 완료 신호가 없습니다 · 기록은 기기에 보관됩니다', '#f0c674', true, userId);
        }
    }, 30000));
}

function _dirtyKey(userId, kind) { return `${userId}:${kind}`; }
function _queueUpload(userId, kind, delay) {
    if (!userId) return;
    const key = _dirtyKey(userId, kind);
    const state = _dirty.get(key) || { generation: 0, confirmed: 0, running: false, delay };
    state.generation++;
    _dirty.set(key, state);
    if (_syncReady && !_syncingUsers.has(userId)) _scheduleUpload(userId, kind, delay);
}
function _scheduleUpload(userId, kind, delay = 2000) {
    const key = _dirtyKey(userId, kind);
    clearTimeout(_timers[key]);
    _timers[key] = setTimeout(() => { _timers[key] = null; _drainUpload(userId, kind); }, delay);
}
async function _drainUpload(userId, kind) {
    const key = _dirtyKey(userId, kind), state = _dirty.get(key);
    if (!state || state.running || _syncingUsers.has(userId) || !_syncReady) return;
    state.running = true;
    const run = _syncRuns.get(userId);
    try {
        while (state.confirmed < state.generation && !_syncingUsers.has(userId)) {
            const generation = state.generation;
            await ({user: _uploadUserData, reports: _uploadReports, wrong: _uploadWrong})[kind](userId, run?.state === 'running' ? run : null);
            state.confirmed = generation;
        }
        if (_initialSucceeded.has(userId) && !_hasPendingUploads(userId) && !_syncingUsers.has(userId)) {
            if (run?.state === 'running') {
                const failed = [...run.lanes.values()].some(step => step.status === 'failed');
                if (!failed) _recordSyncStep(userId, run.runId, 'final', 'final', 'completed', { completed: 1, total: 1, source: 'local' });
                _finishSyncRun(run, failed ? 'failed' : 'completed');
            } else _showSyncBadge('✅ 변경 기록 동기화 완료', '#56d364', false, userId);
            window.dispatchEvent(new CustomEvent('firesynced', { detail: { userId } }));
        }
        state.delay = 2000;
    } catch (error) {
        state.delay = Math.min(60000, (state.delay || 2000) * 2);
        if (run?.state === 'running') {
            _finishSyncRun(run, 'failed', error);
        } else _showSyncBadge('⚠️ 기기에 보관 중 · 자동 재시도', '#ff5f6d', true, userId);
        _scheduleUpload(userId, kind, state.delay);
    } finally {
        state.running = false;
        if (state.confirmed < state.generation && !_timers[key] && !_syncingUsers.has(userId)) _scheduleUpload(userId, kind, 0);
    }
}
function _resumeUploads(userId) {
    for (const kind of ['user', 'reports', 'wrong']) {
        const state = _dirty.get(_dirtyKey(userId, kind));
        if (state && state.confirmed < state.generation) _scheduleUpload(userId, kind, 0);
    }
}
function _hasPendingUploads(userId) {
    return ['user', 'reports', 'wrong'].some(kind => {
        const state = _dirty.get(_dirtyKey(userId, kind));
        return state && state.confirmed < state.generation;
    });
}

// ─────────────────────────────────────────────
//  Firebase SDK 동적 로드
// ─────────────────────────────────────────────
async function _initDB() {
    if (window.navigator?.onLine === false) {
        _lastInitError = Object.assign(new Error('offline'), { code: 'offline' });
        _lastInitOperation = 'sdk';
        return null;
    }
    if (_db) return _db;
    try {
        const authUser = await window.SmartStudy.FirebaseClient.getCurrentUser();
        if (!authUser) throw Object.assign(new Error('클라우드 인증이 필요합니다.'), { code: 'unauthenticated' });
        try {
            _db = await _remoteRepository.getDB();
        } catch (error) {
            error._syncOperation = 'sdk';
            throw error;
        }
        _syncReady = true;
        _lastInitError = null;
        _lastInitOperation = null;
        return _db;
    } catch (e) {
        _lastInitError = e;
        _lastInitOperation = e._syncOperation || 'auth';
        console.warn('[FireSync] 초기화 실패 (오프라인 모드):', e.message);
        return null;
    }
}

// ─────────────────────────────────────────────
//  업로드 (localStorage → Firestore)
// ─────────────────────────────────────────────
function _debounce(key, fn, ms = 2000) {
    clearTimeout(_timers[key]);
    _timers[key] = setTimeout(() => Promise.resolve().then(fn).then(() => _showSyncBadge('✅ 변경 기록 동기화 완료', '#56d364')).catch(() => {
        _showSyncBadge('⚠️ 기기에 보관 중 · 자동 재시도', '#ff5f6d', true);
        _debounce(key, fn, Math.min(60000, ms * 2));
    }), ms);
}

async function _uploadUserData(userId, run = null) {
    if (!_syncReady) return;
    try {
        if (run) _recordSyncStep(userId, run.runId, 'upload', 'flush', 'waiting');
        await _localRepository.flush?.();
        if (run) _recordSyncStep(userId, run.runId, 'upload', 'flush', 'completed', { completed: 1, total: 1, source: 'local' });
        const data = _localRepository.getUser(userId);
        if (!data) return;
        if (run) _recordSyncStep(userId, run.runId, 'upload', 'profile-upload', 'waiting');
        await _remoteRepository.putUser(userId, data);
        if (run) _recordSyncStep(userId, run.runId, 'upload', 'profile-upload', 'completed', { completed: 1, total: 1, source: 'unknown' });
        if (run) _recordSyncStep(userId, run.runId, 'upload', 'daily-upload', 'waiting');
        await _remoteRepository.putDaily?.(userId);
        if (run) _recordSyncStep(userId, run.runId, 'upload', 'daily-upload', 'completed', { completed: 1, total: 1, source: 'unknown' });
    } catch (e) { _showSyncBadge('⚠️ 저장 재시도 필요', '#ff5f6d', true); throw e; }
}

async function _uploadReports(userId, run = null) {
    if (!_syncReady) return;
    try {
        await _localRepository.flush?.();
        const reports = _localRepository.listReports(userId);
        if (run) _recordSyncStep(userId, run.runId, 'upload', 'reports', 'waiting', { completed: 0, total: reports.length });
        await _remoteRepository.putReports(userId, reports, run ? { runId: run.runId } : {});
        if (run) _recordSyncStep(userId, run.runId, 'upload', 'reports', 'completed', { completed: reports.length, total: reports.length, source: 'unknown' });
    } catch (e) { _showSyncBadge('⚠️ 퀴즈 저장 재시도 필요', '#ff5f6d', true); throw e; }
}

async function _uploadStudyConfig(cfg) {
    if (!_syncReady) return;
    try {
        // 관리자(우준아빠) 문서에 studyTimeConfig 필드로 저장 (기존 경로 재사용)
        await _remoteRepository.saveStudyTimeConfig(cfg);
    } catch (e) { console.warn('[FireSync] studyConfig 업로드 실패:', e.message); }
}

async function _downloadStudyConfig() {
    if (!_syncReady) return null;
    try {
        const config = await _remoteRepository.getStudyTimeConfig();
        if (config) _localRepository.saveTimerConfig(config);
        return null;
    } catch (e) { console.warn('[FireSync] studyConfig 다운로드 실패:', e.message); return e; }
}

async function _uploadWrong(userId, run = null) {
    if (!_syncReady) return;
    try {
        await _localRepository.flush?.();
        const raw = window.SmartStudy.DurableStore?.read(`SmartStudy_WrongAnswers_${userId}`);
        const wrongAnswers = raw ? JSON.parse(raw).subjects : _localRepository.getWrongAnswers(userId);
        const trimmed = wrongAnswers; // V2 preserves every historical attempt.
        const total = Object.values(trimmed).reduce((sum, items) => sum + (items?.length || 0), 0);
        if (run) _recordSyncStep(userId, run.runId, 'upload', 'wrong', 'waiting', { completed: 0, total });
        await _remoteRepository.putWrongAnswers(userId, trimmed, run ? { runId: run.runId } : {});
        if (run) _recordSyncStep(userId, run.runId, 'upload', 'wrong', 'completed', { completed: total, total, source: 'unknown' });
    } catch (e) { _showSyncBadge('⚠️ 오답 저장 재시도 필요', '#ff5f6d', true); throw e; }
}

function _trimWrongHistory(wrongAnswers) {
    const result = {};
    Object.entries(wrongAnswers).forEach(([subj, items]) => {
        result[subj] = (items || []).map(item => ({
            ...item,
            history: (item.history || []).slice(-20)
        }));
    });
    return result;
}

// ─────────────────────────────────────────────
//  다운로드 & 병합 (Firestore → localStorage)
// ─────────────────────────────────────────────
async function _downloadAndMerge(userId, run) {
    if (!_syncReady) return;
    try {
        _recordSyncStep(userId, run.runId, 'local', 'durable', 'waiting');
        await _localRepository.ready;
        _recordSyncStep(userId, run.runId, 'local', 'durable', 'completed', { completed: 1, total: 1, source: 'local' });
        const bundle = await _remoteRepository.getUserBundle(userId, { runId: run.runId });

        // 전역 학습 시간 설정 항상 최신으로 받아옴 (관리자가 공유한 설정)
        _recordSyncStep(userId, run.runId, 'download', 'config', 'waiting');
        const configError = await _downloadStudyConfig();
        _recordSyncStep(userId, run.runId, 'download', 'config', configError ? 'failed' : 'completed', { completed: configError ? 0 : 1, total: 1, source: 'unknown', error: configError });

        let needsUpload = false;
        _recordSyncStep(userId, run.runId, 'merge', 'merge', 'waiting');

        // 1. userData 병합
        if (bundle.user) {
            const cloud    = bundle.user;
            const local    = _localRepository.getUser(userId);
            // 로컬이 더 최신이면 클라우드에 다시 올려야 함
            if ((local?._localUpdatedAt || 0) > (cloud._updatedAt || 0)) needsUpload = true;
            const merged   = _mergeUserData(local, cloud, userId);
            _localRepository.saveUser(merged);
        } else {
            needsUpload = true;
        }
        // 2. reports 병합
        if (Array.isArray(bundle.reports)) {
            const cloudReports = bundle.reports;
            const localReports = _localRepository.listReports(userId);
            // 로컬에만 있는 레포트가 있으면 업로드 필요
            if (localReports.some(r => !cloudReports.find(c => c.sessionId === r.sessionId))) needsUpload = true;
            const merged = _mergeReports(localReports, cloudReports);
            _localRepository.saveReports(userId, merged);
        } else {
            needsUpload = true;
        }
        // 3. wrongAnswers 병합
        if (bundle.wrongAnswers) {
            const cloudWrong = bundle.wrongAnswers;
            const local      = _localRepository.getWrongAnswers(userId);
            const merged     = _mergeWrong(local, cloudWrong);
            _localRepository.saveWrongAnswers(userId, merged);
        } else {
            needsUpload = true;
        }
        _recordSyncStep(userId, run.runId, 'merge', 'merge', 'completed', { completed: 1, total: 1, source: 'local' });

        // A migration must confirm each category before publishing its marker.
        if (needsUpload || bundle.migrationRequired || _remoteRepository.confirmBundle) {
            let generation = _dirty.get(_dirtyKey(userId, 'user'))?.generation || 0;
            await _uploadUserData(userId, run);
            const userState = _dirty.get(_dirtyKey(userId, 'user'));
            if (userState) userState.confirmed = Math.max(userState.confirmed, generation);
            _touchSync(userId);
            _showSyncBadge('☁️ 학습 기록 1/1', '#4facfe', true, userId);
            generation = _dirty.get(_dirtyKey(userId, 'reports'))?.generation || 0;
            await _uploadReports(userId, run);
            const reportsState = _dirty.get(_dirtyKey(userId, 'reports'));
            if (reportsState) reportsState.confirmed = Math.max(reportsState.confirmed, generation);
            generation = _dirty.get(_dirtyKey(userId, 'wrong'))?.generation || 0;
            await _uploadWrong(userId, run);
            const wrongState = _dirty.get(_dirtyKey(userId, 'wrong'));
            if (wrongState) wrongState.confirmed = Math.max(wrongState.confirmed, generation);
            console.log('[FireSync] 로컬→클라우드 업로드 완료');
        }

        _touchSync(userId);
        _showSyncBadge('☁️ 최종 저장 확인 중', '#4facfe', true, userId);
        await _remoteRepository.confirmBundle?.(userId, bundle, { uploaded: true, runId: run.runId });
        _recordSyncStep(userId, run.runId, 'final', 'flush', 'waiting');
        await _localRepository.flush?.();
        _recordSyncStep(userId, run.runId, 'final', 'flush', 'completed', { completed: 1, total: 1, source: 'local' });
        console.log('[FireSync] 동기화 완료');
        window.dispatchEvent(new CustomEvent('firemerged', { detail: { userId } }));
        return true;
    } catch (e) {
        _failActiveSyncStep(run, e);
        console.warn('[FireSync] 동기화 실패:', e.message);
        window.dispatchEvent(new CustomEvent('firesyncerror', { detail: { userId, message: e.message } }));
        return false;
    }
}

// ─────────────────────────────────────────────
//  병합 전략
// ─────────────────────────────────────────────
function _mergeUserData(local, cloud, userId) {
    const l = local || {};
    const c = cloud || {};

    // 레벨이 높은 쪽 기준으로 EXP 선택
    const localLevel = l.level || 1;
    const cloudLevel = c.level || 1;
    const finalLevel = Math.max(localLevel, cloudLevel);
    const finalExp = localLevel > cloudLevel
        ? (l.exp || 0)
        : cloudLevel > localLevel
            ? (c.exp || 0)
            : Math.max(l.exp || 0, c.exp || 0);

    // 출석: totalDays 가 더 많은 쪽 선택
    const localDays = l.attendance?.totalDays || 0;
    const cloudDays = c.attendance?.totalDays || 0;
    const finalAttendance = localDays >= cloudDays ? (l.attendance || {}) : (c.attendance || {});

    return {
        ...c,                           // 클라우드 기반 (알 수 없는 필드 보존)
        ...l,                           // 로컬로 덮어씀
        id:              userId,
        level:           finalLevel,
        exp:             finalExp,
        totalStudyTime:  Math.max(l.totalStudyTime || 0, c.totalStudyTime || 0),
        totalAttempts:   Math.max(l.totalAttempts  || 0, c.totalAttempts  || 0),
        totalCorrect:    Math.max(l.totalCorrect   || 0, c.totalCorrect   || 0),
        badges:          _unionArr(l.badges || [], c.badges || []),
        attendance:      finalAttendance,
        dailyStats:      _mergeDailyStats(l.dailyStats, c.dailyStats),
        subjectStats:    _mergeSubjectStats(l.subjectStats, c.subjectStats),
        weeklyStats:     _mergePeriodStats(l.weeklyStats, c.weeklyStats, 'weekStart'),
        monthlyStats:    _mergePeriodStats(l.monthlyStats, c.monthlyStats, 'monthStart'),
        formulaStudyTime: _mergeFormulaStudyTime(l.formulaStudyTime, c.formulaStudyTime),
        missionProgress: _mergeMissionProgress(l.missionProgress, c.missionProgress),
    };
}

function _mergeFormulaStudyTime(local, cloud) {
    const l = local || {};
    const c = cloud || {};
    const newer = (l.date || '') >= (c.date || '') ? l : c;
    const sameDay = l.date && l.date === c.date;
    return {
        date: newer.date || '',
        studySeconds: sameDay ? Math.max(l.studySeconds || 0, c.studySeconds || 0) : (newer.studySeconds || 0),
        quizSeconds: sameDay ? Math.max(l.quizSeconds || 0, c.quizSeconds || 0) : (newer.quizSeconds || 0),
        totalStudySeconds: Math.max(l.totalStudySeconds || 0, c.totalStudySeconds || 0),
        totalQuizSeconds: Math.max(l.totalQuizSeconds || 0, c.totalQuizSeconds || 0)
    };
}

function _mergeDailyStats(local, cloud) {
    const l = local || {};
    const c = cloud || {};

    // 같은 날짜면 과목별 시간을 max로 병합
    if (l.date && l.date === c.date) {
        const studyTime = {};
        const subjects = new Set([
            ...Object.keys(l.studyTime || {}),
            ...Object.keys(c.studyTime || {})
        ]);
        subjects.forEach(s => {
            studyTime[s] = Math.max(l.studyTime?.[s] || 0, c.studyTime?.[s] || 0);
        });
        const mergeTimeMap = (left, right) => {
            const result = {};
            new Set([...Object.keys(left || {}), ...Object.keys(right || {})]).forEach(subject => {
                result[subject] = Math.max(left?.[subject] || 0, right?.[subject] || 0);
            });
            return result;
        };
        const quizScores = {};
        new Set([
            ...Object.keys(l.quizScores || {}),
            ...Object.keys(c.quizScores || {})
        ]).forEach(s => {
            const localScores = l.quizScores?.[s] || [];
            const cloudScores = c.quizScores?.[s] || [];
            quizScores[s] = localScores.length >= cloudScores.length ? localScores : cloudScores;
        });
        return {
            date: l.date,
            studyTime,
            learningTime: mergeTimeMap(l.learningTime, c.learningTime),
            quizTime: mergeTimeMap(l.quizTime, c.quizTime),
            quizScores,
            subjectsStudied: [...new Set([
                ...(l.subjectsStudied || []),
                ...(c.subjectsStudied || [])
            ])]
        };
    }

    // 다른 날짜면 더 최근 날짜를 선택
    if ((l.date || '') >= (c.date || '')) return l;
    return c;
}

function _mergeSubjectStats(local, cloud) {
    const l = local || {};
    const c = cloud || {};
    const merged = {};
    new Set([...Object.keys(l), ...Object.keys(c)]).forEach(subject => {
        const ls = l[subject] || {};
        const cs = c[subject] || {};
        merged[subject] = {
            ...cs,
            ...ls,
            studyTime: Math.max(ls.studyTime || 0, cs.studyTime || 0),
            learningTime: Math.max(ls.learningTime || 0, cs.learningTime || 0),
            quizTime: Math.max(ls.quizTime || 0, cs.quizTime || 0),
            quizCount: Math.max(ls.quizCount || 0, cs.quizCount || 0),
            bestScore: Math.max(ls.bestScore || 0, cs.bestScore || 0)
        };
    });
    return merged;
}

function _mergePeriodStats(local, cloud, periodField) {
    const l = local || {};
    const c = cloud || {};
    if ((l[periodField] || '') !== (c[periodField] || '')) {
        return (l[periodField] || '') >= (c[periodField] || '') ? l : c;
    }
    return {
        ...c,
        ...l,
        [periodField]: l[periodField] || c[periodField] || '',
        studyTime: Math.max(l.studyTime || 0, c.studyTime || 0),
        attendanceDays: Math.max(l.attendanceDays || 0, c.attendanceDays || 0),
        quizCount: Math.max(l.quizCount || 0, c.quizCount || 0),
        subjectsStudied: [...new Set([...(l.subjectsStudied || []), ...(c.subjectsStudied || [])])]
    };
}

function _mergeMissionProgress(local, cloud) {
    const l = local || {};
    const c = cloud || {};
    const result = { ...c, ...l, periods: { ...(c.periods || {}), ...(l.periods || {}) } };
    ['daily', 'weekly', 'monthly'].forEach(category => {
        const lp = l.periods?.[category] || '';
        const cp = c.periods?.[category] || '';
        if (lp !== cp) {
            const useLocal = lp >= cp;
            result.periods[category] = useLocal ? lp : cp;
            result[category] = useLocal ? (l[category] || {}) : (c[category] || {});
            return;
        }
        const merged = {};
        const localMissions = l[category] || {};
        const cloudMissions = c[category] || {};
        new Set([...Object.keys(localMissions), ...Object.keys(cloudMissions)]).forEach(id => {
            const lm = localMissions[id] || {};
            const cm = cloudMissions[id] || {};
            merged[id] = {
                ...cm,
                ...lm,
                progress: Math.max(lm.progress || 0, cm.progress || 0),
                completed: Boolean(lm.completed || cm.completed)
            };
        });
        result[category] = merged;
    });
    result.rewards = {};
    ['daily', 'weekly', 'monthly'].forEach(category => {
        const lr = l.rewards?.[category];
        const cr = c.rewards?.[category];
        if (!lr) result.rewards[category] = cr || null;
        else if (!cr) result.rewards[category] = lr;
        else result.rewards[category] = (lr.period || '') >= (cr.period || '') ? lr : cr;
    });
    return result;
}

function _mergeReports(local, cloud) {
    const map = new Map();
    // 클라우드 먼저 넣고 로컬이 덮어씀 (로컬이 더 최신)
    [...cloud, ...local].forEach(r => {
        if (!r.sessionId) return;
        const prev = map.get(r.sessionId);
        if (!prev) { map.set(r.sessionId, r); return; }
        const currentUpdated = Number(r.updatedAt || r.date || 0);
        const previousUpdated = Number(prev.updatedAt || prev.date || 0);
        if (currentUpdated > previousUpdated || (currentUpdated === previousUpdated && (r.timeSpentSeconds || 0) > (prev.timeSpentSeconds || 0))) {
            map.set(r.sessionId, { ...prev, ...r, createdAt: prev.createdAt || r.createdAt || r.date,
                initialScore: prev.initialScore,
                metadata: {...r.metadata, initialAttempts: prev.metadata?.initialAttempts || r.metadata?.initialAttempts || []} });
        }
    });
    return Array.from(map.values()).sort((a, b) => (a.date || 0) - (b.date || 0));
}

function _mergeWrong(local, cloud) {
    const result = {};
    const subjects = new Set([...Object.keys(local), ...Object.keys(cloud)]);
    subjects.forEach(subj => {
        const map = new Map();
        [...(cloud[subj] || []), ...(local[subj] || [])].forEach(item => {
            const id = (subj === 'math' ? [item.levelId, item.semesterId, item.unitId, item.type].join(':') : item.wrongNoteId || item.questionId || item.word || item.hanja || item.type || '');
            if (!id) return;
            const prev = map.get(id);
            // 더 최근 기록 우선
            if (!prev) { map.set(id, item); return; }
            const historyMap = new Map();
            [...(prev.history || []), ...(item.history || [])].forEach((entry, index) => {
                const eventId = entry.eventId || [entry.sessionId || 'legacy', entry.round || index + 1, entry.questionId || id].join(':');
                const existing = historyMap.get(eventId);
                if (!existing || Number(entry.createdAt || entry.date || 0) >= Number(existing.createdAt || existing.date || 0)) historyMap.set(eventId, { ...entry, eventId });
            });
            const history = Array.from(historyMap.values()).sort((a, b) => Number(a.createdAt || a.date || 0) - Number(b.createdAt || b.date || 0));
            const newer = Number(item.date || 0) >= Number(prev.date || 0) ? item : prev;
            map.set(id, { ...prev, ...newer, history, count: Math.max(Number(prev.count || 0), Number(item.count || 0), history.filter(entry => entry.status === 'wrong').length), ...(window.LearningPolicy ? window.LearningPolicy.review(history) : {masteryScore: 0, isMastered: false}) });
        });
        result[subj] = Array.from(map.values());
    });
    return result;
}

function _unionArr(a, b) {
    return [...new Set([...a, ...b])];
}

// 저장 완료 이벤트를 구독한다. 도메인 함수를 덮어쓰지 않으므로 로드 순서와 함수 참조에 안전하다.
_storageEvents.subscribe('user:saved', ({ userId }) => {
    _queueUpload(userId, 'user', 15000);
});
_storageEvents.subscribe('reports:saved', ({ userId }) => {
    _queueUpload(userId, 'reports', 2000);
});
_storageEvents.subscribe('wrongAnswers:saved', ({ userId }) => {
    _queueUpload(userId, 'wrong', 2000);
});
_storageEvents.subscribe('config:saved', () => {
    if (_syncReady) _debounce('studyConfig', () => _uploadStudyConfig(_localRepository.getTimerConfig()), 2000);
});

// ─────────────────────────────────────────────
//  동기화 상태 UI (작은 뱃지)
// ─────────────────────────────────────────────
function _formatAge(time) {
    if (!time) return '아직 완료 신호 없음';
    const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
    return seconds < 2 ? '방금 전' : `${seconds}초 전`;
}
function _stepDescription(step) {
    const label = _operationLabels[step.operation] || '동기화 처리';
    if (step.status === 'failed') return `${label} · 실패 (${step.error?.code || 'unknown'})`;
    if (step.operation.endsWith('-list')) return step.total === null
        ? `${label} · 목록 ${step.pages || 0}페이지, ${step.completed}건 확인 · 전체 수 확인 중`
        : `${label} · 목록 ${step.pages || 0}페이지, ${step.completed}건 확인`;
    if (step.total !== null) return `${label} · ${step.completed}/${step.total} 확인 완료`;
    return `${label} · ${step.status === 'waiting' ? '응답 기다리는 중' : `${step.completed}건 확인 완료`}`;
}
function _renderSyncStatus(run) {
    if (!run || run.userId !== _localRepository.getActiveUser()) return;
    const steps = [...run.lanes.values()];
    const active = [...steps].reverse().find(step => step.status === 'waiting' || step.status === 'progress') || steps.at(-1);
    const failed = [...steps].reverse().find(step => step.status === 'failed');
    const summary = run.state === 'completed' ? '✅ 동기화 완료'
        : failed ? `⚠️ ${_operationLabels[failed.operation] || '동기화'} 실패`
        : run.stalled ? `☁️ ${_operationLabels[active?.operation] || '현재 단계'} · 새 완료 신호 없음`
        : `☁️ ${active ? _stepDescription(active) : '동기화 준비 중'}`;
    _showSyncBadge(summary, failed ? '#ff5f6d' : run.stalled ? '#f0c674' : run.state === 'completed' ? '#56d364' : '#4facfe', run.state !== 'completed', run.userId);
    let panel = document.getElementById('_firesync_panel');
    if (!panel) {
        panel = document.createElement('section');
        panel.id = '_firesync_panel';
        panel.hidden = true;
        panel.style.cssText = `position:fixed;right:12px;bottom:58px;z-index:9999;width:min(390px,calc(100vw - 24px));max-height:min(70vh,520px);overflow:auto;background:#161b22;border:1px solid #30363d;border-radius:14px;padding:14px;color:#f0f6fc;font:0.82rem/1.45 'Outfit',sans-serif;box-shadow:0 12px 32px #0008;`;
        const title = document.createElement('strong'); title.textContent = '동기화 상세'; panel.appendChild(title);
        const timing = document.createElement('p'); timing.style.margin = '6px 0 10px'; panel.appendChild(timing);
        const notice = document.createElement('p'); notice.style.cssText = 'color:#f0c674;margin:0 0 10px'; panel.appendChild(notice);
        const list = document.createElement('div'); panel.appendChild(list);
        const copy = document.createElement('button'); copy.type = 'button'; copy.textContent = '진단 정보 복사'; copy.style.cssText = 'margin-top:10px;padding:7px 10px;border:1px solid #4facfe;border-radius:8px;background:#0d1117;color:#f0f6fc';
        copy.addEventListener('click', () => {
            if (!navigator.clipboard?.writeText) { copy.textContent = '복사 실패'; return; }
            navigator.clipboard.writeText(JSON.stringify(panel._diagnostic, null, 2)).then(() => { copy.textContent = '복사됨'; }).catch(() => { copy.textContent = '복사 실패'; });
        });
        panel.appendChild(copy);
        panel._syncNodes = { timing, notice, list, copy };
        document.body.appendChild(panel);
    }
    const diagnostic = { runId: run.runId, state: run.state, stalled: run.stalled, lastCompletedSecondsAgo: run.lastCompletedAt ? Math.floor((Date.now() - run.lastCompletedAt) / 1000) : null,
        steps: steps.map(({lane,operation,status,source,completed,total,pages,error}) => ({lane,operation,status,source,completed,total,pages,errorCode:error?.code || null})) };
    panel._diagnostic = diagnostic;
    const { timing, notice, list, copy } = panel._syncNodes;
    timing.textContent = `최근 완료: ${_formatAge(run.lastCompletedAt)} · 실행 ${Math.floor((Date.now() - run.startedAt) / 1000)}초`;
    notice.hidden = !run.stalled;
    notice.textContent = run.stalled ? '현재 단계에서 30초 동안 새 완료 신호가 없습니다. 원인은 아직 확정할 수 없으며 학습 기록은 기기에 보관됩니다.' : '';
    list.replaceChildren();
    for (const step of steps) { const row=document.createElement('div'); row.style.cssText='padding:7px 0;border-top:1px solid #30363d'; row.textContent=_stepDescription(step); if(step.source==='cache')row.textContent+=' · 기기 캐시'; else if(step.source==='server')row.textContent+=' · 서버 응답'; if(step.error){const action=document.createElement('div');action.style.color='#ff9b9b';action.textContent=step.error.action;row.appendChild(action);} list.appendChild(row); }
    if (copy.textContent !== '복사됨' && copy.textContent !== '복사 실패') copy.textContent = '진단 정보 복사';
}
function _finishSyncRun(run, state, error = null) {
    if (!run || run.state !== 'running') return;
    if (error) _failActiveSyncStep(run, error);
    run.state = state;
    run.stalled = false;
    if (run._ticker) window.clearInterval(run._ticker);
    run._ticker = null;
    clearTimeout(_watchdogs.get(run.userId));
    _watchdogs.delete(run.userId);
    _renderSyncStatus(run);
}
function _showSyncBadge(text, color = '#4facfe', persistent = false, userId = null) {
    if (userId && userId !== _localRepository.getActiveUser()) return;
    let badge = document.getElementById('_firesync_badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = '_firesync_badge';
        badge.style.cssText = `
            position:fixed; bottom:16px; right:16px; z-index:9999;
            background:#161b22; border:1px solid rgba(255,255,255,0.1);
            color:#f0f6fc; font-size:0.75rem; font-family:'Outfit',sans-serif;
            padding:6px 12px; border-radius:20px; pointer-events:auto; cursor:pointer;
            transition:opacity 0.4s; opacity:0;
        `;
        badge.setAttribute('role', 'button');
        badge.setAttribute('tabindex', '0');
        const toggle=()=>{const panel=document.getElementById('_firesync_panel');if(panel)panel.hidden=!panel.hidden;};
        badge.addEventListener('click',toggle);
        badge.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle();}});
        document.body.appendChild(badge);
    }
    badge.style.borderColor = color + '55';
    badge.textContent = text;
    badge.style.opacity = '1';
    clearTimeout(badge._hideTimer);
    if (persistent) return;
    badge._hideTimer = setTimeout(() => { badge.style.opacity = '0'; }, 2500);
}

// ─────────────────────────────────────────────
//  공개 API
// ─────────────────────────────────────────────
window.FireSync = {
    connectCloud: async function() {
        const credential = await window.SmartStudy.FirebaseClient.signInWithGoogle();
        if (!credential) return null;
        _db = null;
        _syncReady = false;
        const db = await _initDB();
        const activeUser = typeof UserSession !== 'undefined' ? UserSession.getActiveUser() : null;
        if (db && activeUser) this.onLogin(activeUser).catch(error => console.warn('[FireSync]', error));
        return db;
    },
    /**
     * 로그인 시 호출 — 클라우드에서 데이터 다운로드 후 병합
     * @returns {Promise<boolean>}
     */
    onLogin: async function(userId) {
        if (!userId) return false;
        if (_loginPromises[userId]) return _loginPromises[userId];
        _loginPromises[userId] = (async () => {
            const run = _beginSyncRun(userId);
            _syncingUsers.add(userId);
            _badgeOwner = userId;
            _recordSyncStep(userId, run.runId, 'connect', 'sdk', 'waiting');
            _touchSync(userId);
            try {
                await _localRepository.ready;
                _recordSyncStep(userId, run.runId, 'connect', 'auth', 'waiting');
                const db = await _initDB();
                if (!db) {
                    if (_lastInitOperation === 'sdk') _recordSyncStep(userId, run.runId, 'connect', 'auth', 'completed', { completed: 1, total: 1, source: 'unknown' });
                    _recordSyncStep(userId, run.runId, 'connect', _lastInitOperation || 'auth', 'failed', { error: _lastInitError || new Error('unavailable') });
                    _finishSyncRun(run, 'failed');
                    return false;
                }
                _recordSyncStep(userId, run.runId, 'connect', 'auth', 'completed', { completed: 1, total: 1, source: 'unknown' });
                _recordSyncStep(userId, run.runId, 'connect', 'sdk', 'completed', { completed: 1, total: 1, source: 'unknown' });
                const synced = await _downloadAndMerge(userId, run);
                if (synced) {
                    _initialSucceeded.add(userId);
                    _retryDelays.delete(userId);
                    clearTimeout(_retryTimers.get(userId));
                    _retryTimers.delete(userId);
                } else { _initialSucceeded.delete(userId); _retryLogin(userId); }
                if (synced && !_hasPendingUploads(userId)) {
                    const failed = [...run.lanes.values()].some(step => step.status === 'failed');
                    if (!failed) _recordSyncStep(userId, run.runId, 'final', 'final', 'completed', { completed: 1, total: 1, source: 'local' });
                    _finishSyncRun(run, failed ? 'failed' : 'completed');
                    window.dispatchEvent(new CustomEvent('firesynced', { detail: { userId } }));
                }
                else if (synced) _recordSyncStep(userId, run.runId, 'upload', 'reports', 'waiting');
                else _finishSyncRun(run, 'failed');
                return synced;
            } catch (error) {
                _initialSucceeded.delete(userId);
                _retryLogin(userId);
                _finishSyncRun(run, 'failed', error);
                console.warn('[FireSync] 동기화 오류:', error);
                return false;
            } finally {
                clearTimeout(_watchdogs.get(userId));
                _watchdogs.delete(userId);
                _syncingUsers.delete(userId);
                delete _loginPromises[userId];
                if (_badgeOwner === userId) _badgeOwner = null;
                _resumeUploads(userId);
            }
        })();
        return _loginPromises[userId];
    },

    /**
     * 초기화된 Firestore DB 인스턴스 반환 (admin.html 등 외부에서 재사용)
     */
    getDB: async function() {
        return await _initDB();
    },

    /**
     * 관리자 학습 시간 설정을 전체 유저에게 공유 (admin.html에서 호출)
     */
    uploadStudyConfig: async function(cfg) {
        const db = await _initDB();
        if (!db) return;
        await _uploadStudyConfig(cfg);
        _showSyncBadge('✅ 학습 시간 설정 저장됨', '#56d364');
    },

    /**
     * 강제 전체 업로드 (데이터 가져오기 후 사용)
     */
    forceUpload: async function() {
        await _localRepository.ready;
        await _localRepository.flush?.();
        const uid = UserSession.getActiveUser();
        if (!uid || !_syncReady) return;
        _showSyncBadge('☁️ 업로드 중...');
        await Promise.all([
            _uploadUserData(uid),
            _uploadReports(uid),
            _uploadWrong(uid)
        ]);
        _showSyncBadge('✅ 업로드 완료', '#56d364');
    }
};

// ─────────────────────────────────────────────
//  자동 초기화 — 이미 로그인된 상태로 페이지 진입 시
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const userId = typeof UserSession !== 'undefined' ? UserSession.getActiveUser() : null;
    if (userId) {
        await window.FireSync.onLogin(userId);
    }
});

window.addEventListener?.('online', () => { const uid = _localRepository.getActiveUser(); if (uid) window.FireSync.onLogin(uid); });
window.addEventListener?.('offline', () => _showSyncBadge('📵 기기에 저장 중 · 연결되면 다시 전송합니다', '#f0c674', true));
window.addEventListener?.('smartstudy:storage-error', () => _showSyncBadge('⚠️ 기기 저장 실패 · 앱을 닫지 말고 백업해 주세요', '#ff5f6d', true));
window.addEventListener?.('smartstudy:sync-state', event => { if (!_badgeOwner) _showSyncBadge(`☁️ ${event.detail.message}`, '#4facfe', true); });
window.addEventListener?.('smartstudy:sync-progress', event => {
    const detail = event.detail || {};
    const user = detail.userId || detail.user;
    if (!user || !detail.runId || !detail.lane || !detail.operation || !detail.status) return;
    const run = _syncRuns.get(user);
    if (!run || run.runId !== detail.runId) return;
    _recordSyncStep(user, detail.runId, detail.lane, detail.operation, detail.status, {
        completed: detail.completed, total: detail.total, pages: detail.pages, source: detail.source, error: detail.error
    });
});

window.addEventListener?.('pagehide', () => { const uid = _localRepository.getActiveUser(); if (_syncReady && uid) _uploadUserData(uid).catch(()=>{}); });

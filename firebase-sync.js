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

// ─────────────────────────────────────────────
//  Firebase SDK 동적 로드
// ─────────────────────────────────────────────
async function _initDB() {
    if (_db) return _db;
    try {
        const authUser = await window.SmartStudy.FirebaseClient.getCurrentUser();
        if (!authUser) throw new Error('클라우드 인증이 필요합니다. 로컬 모드로 계속합니다.');
        _db = await _remoteRepository.getDB();
        _syncReady = true;
        return _db;
    } catch (e) {
        console.warn('[FireSync] 초기화 실패 (오프라인 모드):', e.message);
        return null;
    }
}

// ─────────────────────────────────────────────
//  업로드 (localStorage → Firestore)
// ─────────────────────────────────────────────
function _debounce(key, fn, ms = 2000) {
    clearTimeout(_timers[key]);
    _timers[key] = setTimeout(fn, ms);
}

async function _uploadUserData(userId) {
    if (!_syncReady) return;
    try {
        const data = _localRepository.getUser(userId);
        if (!data) return;
        await _remoteRepository.putUser(userId, data);
    } catch (e) { console.warn('[FireSync] userData 업로드 실패:', e.message); }
}

async function _uploadReports(userId) {
    if (!_syncReady) return;
    try {
        await _remoteRepository.putReports(userId, _localRepository.listReports(userId));
    } catch (e) { console.warn('[FireSync] reports 업로드 실패:', e.message); }
}

async function _uploadStudyConfig(cfg) {
    if (!_syncReady) return;
    try {
        // 관리자(우준아빠) 문서에 studyTimeConfig 필드로 저장 (기존 경로 재사용)
        await _remoteRepository.saveStudyTimeConfig(cfg);
    } catch (e) { console.warn('[FireSync] studyConfig 업로드 실패:', e.message); }
}

async function _downloadStudyConfig() {
    if (!_syncReady) return;
    try {
        const config = await _remoteRepository.getStudyTimeConfig();
        if (config) _localRepository.saveTimerConfig(config);
    } catch (e) { console.warn('[FireSync] studyConfig 다운로드 실패:', e.message); }
}

async function _uploadWrong(userId) {
    if (!_syncReady) return;
    try {
        const wrongAnswers = _localRepository.getWrongAnswers(userId);
        const trimmed = _trimWrongHistory(wrongAnswers);
        await _remoteRepository.putWrongAnswers(userId, trimmed);
    } catch (e) { console.warn('[FireSync] wrongAnswers 업로드 실패:', e.message); }
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
async function _downloadAndMerge(userId) {
    if (!_syncReady) return;
    try {
        const bundle = await _remoteRepository.getUserBundle(userId);

        // 전역 학습 시간 설정 항상 최신으로 받아옴 (관리자가 공유한 설정)
        await _downloadStudyConfig();

        let needsUpload = false;

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

        // 로컬이 더 최신이거나 첫 디바이스 → 클라우드에 즉시 업로드
        if (needsUpload) {
            await Promise.all([
                _uploadUserData(userId),
                _uploadReports(userId),
                _uploadWrong(userId)
            ]);
            console.log('[FireSync] 로컬→클라우드 업로드 완료');
        }

        console.log('[FireSync] 동기화 완료');
        window.dispatchEvent(new CustomEvent('firesynced', { detail: { userId } }));
    } catch (e) {
        console.warn('[FireSync] 동기화 실패:', e.message);
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
    const finalExp   = localLevel >= cloudLevel ? (l.exp || 0) : (c.exp || 0);

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
            map.set(r.sessionId, { ...prev, ...r, createdAt: prev.createdAt || r.createdAt || r.date });
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
            const id = item.word || item.hanja || item.type || '';
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
            const history = Array.from(historyMap.values()).sort((a, b) => Number(a.createdAt || a.date || 0) - Number(b.createdAt || b.date || 0)).slice(-15);
            const newer = Number(item.date || 0) >= Number(prev.date || 0) ? item : prev;
            let streak = 0;
            for (let index = history.length - 1; index >= 0 && history[index].status === 'correct'; index--) streak++;
            map.set(id, { ...prev, ...newer, history, count: Math.max(Number(prev.count || 0), Number(item.count || 0), history.filter(entry => entry.status === 'wrong').length), masteryScore: Math.min(3, streak), isMastered: streak >= 3 });
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
    if (_syncReady && userId) _debounce(`userData_${userId}`, () => _uploadUserData(userId), 2000);
});
_storageEvents.subscribe('reports:saved', ({ userId }) => {
    if (_syncReady && userId) _debounce(`reports_${userId}`, () => _uploadReports(userId), 2000);
});
_storageEvents.subscribe('wrongAnswers:saved', ({ userId }) => {
    if (_syncReady && userId) _debounce(`wrong_${userId}`, () => _uploadWrong(userId), 2000);
});
_storageEvents.subscribe('config:saved', () => {
    if (_syncReady) _debounce('studyConfig', () => _uploadStudyConfig(_localRepository.getTimerConfig()), 2000);
});

// ─────────────────────────────────────────────
//  동기화 상태 UI (작은 뱃지)
// ─────────────────────────────────────────────
function _showSyncBadge(text, color = '#4facfe') {
    let badge = document.getElementById('_firesync_badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = '_firesync_badge';
        badge.style.cssText = `
            position:fixed; bottom:16px; right:16px; z-index:9999;
            background:#161b22; border:1px solid rgba(255,255,255,0.1);
            color:#f0f6fc; font-size:0.75rem; font-family:'Outfit',sans-serif;
            padding:6px 12px; border-radius:20px; pointer-events:none;
            transition:opacity 0.4s; opacity:0;
        `;
        document.body.appendChild(badge);
    }
    badge.style.borderColor = color + '55';
    badge.textContent = text;
    badge.style.opacity = '1';
    clearTimeout(badge._hideTimer);
    badge._hideTimer = setTimeout(() => { badge.style.opacity = '0'; }, 2500);
}

// ─────────────────────────────────────────────
//  공개 API
// ─────────────────────────────────────────────
window.FireSync = {
    connectCloud: async function() {
        await window.SmartStudy.FirebaseClient.signInWithGoogle();
        _db = null;
        _syncReady = false;
        return _initDB();
    },
    /**
     * 로그인 시 호출 — 클라우드에서 데이터 다운로드 후 병합
     * @returns {Promise<void>}
     */
    onLogin: async function(userId) {
        _showSyncBadge('☁️ 동기화 중...');
        const db = await _initDB();
        if (!db) { _showSyncBadge('📵 오프라인 모드'); return; }
        await _downloadAndMerge(userId);
        _showSyncBadge('✅ 동기화 완료', '#56d364');
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

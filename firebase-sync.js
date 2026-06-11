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

const FIREBASE_CONFIG = {
    apiKey:            "AIzaSyDQBCqKxumH-NOdAETKhY6_9xGX_AsVKWg",
    authDomain:        "smart-study-wj.firebaseapp.com",
    projectId:         "smart-study-wj",
    storageBucket:     "smart-study-wj.firebasestorage.app",
    messagingSenderId: "994757323327",
    appId:             "1:994757323327:web:c0f68e95bbeea72a12e68a"
};

// ─────────────────────────────────────────────
//  내부 상태
// ─────────────────────────────────────────────
let _db          = null;
let _syncReady   = false;
let _patched     = false;
const _timers    = {};
let _initDBPromise = null; // 동시 초기화 방지용 싱글턴 Promise

// ─────────────────────────────────────────────
//  Firebase SDK 동적 로드
// ─────────────────────────────────────────────
function _loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement('script');
        s.src = src;
        s.onload  = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

async function _initDB() {
    if (_db) return _db;
    // 동시에 여러 곳에서 호출돼도 하나의 Promise만 실행되도록 보장
    if (_initDBPromise) return _initDBPromise;
    _initDBPromise = (async () => {
        try {
            await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
            await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js');
            if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
            _db = firebase.firestore();
            _syncReady = true;
            console.log('[FireSync] 연결됨');
            return _db;
        } catch (e) {
            _initDBPromise = null; // 실패 시 재시도 가능하도록 초기화
            console.warn('[FireSync] 초기화 실패 (오프라인 모드):', e.message);
            return null;
        }
    })();
    return _initDBPromise;
}

// ─────────────────────────────────────────────
//  Firestore 문서 참조 헬퍼
// ─────────────────────────────────────────────
const _col  = (uid) => _db.collection('users').doc(uid).collection('data');
const _uDoc = (uid) => _db.collection('users').doc(uid);              // userData
const _rDoc = (uid) => _col(uid).doc('reports');                      // 퀴즈 기록
const _wDoc = (uid) => _col(uid).doc('wrongAnswers');                 // 오답노트
const ADMIN_UID = '우준아빠'; // 학습 시간 설정은 관리자 문서에 저장

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
        const raw = localStorage.getItem('SmartStudy_UserData_' + userId);
        if (!raw) return;
        const data = JSON.parse(raw);
        await _uDoc(userId).set({ ...data, _updatedAt: Date.now() }, { merge: true });
    } catch (e) { console.warn('[FireSync] userData 업로드 실패:', e.message); }
}

async function _uploadReports(userId) {
    if (!_syncReady) return;
    try {
        const raw = localStorage.getItem('SmartVocab_Reports_' + userId);
        const reports = raw ? JSON.parse(raw) : [];
        await _rDoc(userId).set({ reports, _updatedAt: Date.now() });
    } catch (e) { console.warn('[FireSync] reports 업로드 실패:', e.message); }
}

async function _uploadStudyConfig(cfg) {
    if (!_syncReady) return;
    try {
        // 관리자(우준아빠) 문서에 studyTimeConfig 필드로 저장 (기존 경로 재사용)
        await _uDoc(ADMIN_UID).set({ studyTimeConfig: cfg }, { merge: true });
    } catch (e) { console.warn('[FireSync] studyConfig 업로드 실패:', e.message); }
}

async function _downloadStudyConfig() {
    if (!_syncReady) return;
    try {
        const snap = await _uDoc(ADMIN_UID).get();
        if (!snap.exists || !snap.data().studyTimeConfig) return;
        localStorage.setItem('SmartStudy_MinStudyConfig', JSON.stringify(snap.data().studyTimeConfig));
    } catch (e) { console.warn('[FireSync] studyConfig 다운로드 실패:', e.message); }
}

async function _uploadWrong(userId) {
    if (!_syncReady) return;
    try {
        const raw = localStorage.getItem('SmartStudy_WrongAnswers_' + userId);
        const wrongAnswers = raw ? JSON.parse(raw) : {};
        const trimmed = _trimWrongHistory(wrongAnswers);
        await _wDoc(userId).set({ wrongAnswers: trimmed, _updatedAt: Date.now() });
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
        const [uSnap, rSnap, wSnap] = await Promise.all([
            _uDoc(userId).get(),
            _rDoc(userId).get(),
            _wDoc(userId).get()
        ]);

        // 전역 학습 시간 설정 항상 최신으로 받아옴 (관리자가 공유한 설정)
        await _downloadStudyConfig();

        let needsUpload = false;

        // 1. userData 병합
        if (uSnap.exists) {
            const cloud    = uSnap.data();
            const localRaw = localStorage.getItem('SmartStudy_UserData_' + userId);
            const local    = localRaw ? JSON.parse(localRaw) : null;
            // 로컬이 더 최신이면 클라우드에 다시 올려야 함
            if ((local?._localUpdatedAt || 0) > (cloud._updatedAt || 0)) needsUpload = true;
            const merged   = _mergeUserData(local, cloud, userId);
            localStorage.setItem('SmartStudy_UserData_' + userId, JSON.stringify(merged));
        } else {
            needsUpload = true;
        }

        // 2. reports 병합
        if (rSnap.exists && Array.isArray(rSnap.data().reports)) {
            const cloudReports = rSnap.data().reports;
            const localRaw     = localStorage.getItem('SmartVocab_Reports_' + userId);
            const localReports = localRaw ? JSON.parse(localRaw) : [];
            // 로컬에만 있는 레포트가 있으면 업로드 필요
            if (localReports.some(r => !cloudReports.find(c => c.sessionId === r.sessionId))) needsUpload = true;
            const merged = _mergeReports(localReports, cloudReports);
            localStorage.setItem('SmartVocab_Reports_' + userId, JSON.stringify(merged));
        } else {
            needsUpload = true;
        }

        // 3. wrongAnswers 병합
        if (wSnap.exists && wSnap.data().wrongAnswers) {
            const cloudWrong = wSnap.data().wrongAnswers;
            const localRaw   = localStorage.getItem('SmartStudy_WrongAnswers_' + userId);
            const local      = localRaw ? JSON.parse(localRaw) : {};
            const merged     = _mergeWrong(local, cloudWrong);
            localStorage.setItem('SmartStudy_WrongAnswers_' + userId, JSON.stringify(merged));
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
        missionProgress: _mergeMissionProgress(l.missionProgress, c.missionProgress),
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
        return {
            date: l.date,
            studyTime,
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

function _mergeMissionProgress(local, cloud) {
    const l = local || {};
    const c = cloud || {};
    const result = {};
    const keys = new Set([...Object.keys(l), ...Object.keys(c)]);
    keys.forEach(k => {
        const lv = l[k];
        const cv = c[k];
        if (lv === undefined) { result[k] = cv; return; }
        if (cv === undefined) { result[k] = lv; return; }
        if (typeof lv === 'object' && lv !== null) {
            result[k] = {
                ...cv, ...lv,
                count:     Math.max(lv.count || 0, cv.count || 0),
                completed: lv.completed || cv.completed || false
            };
        } else if (typeof lv === 'number') {
            result[k] = Math.max(lv, typeof cv === 'number' ? cv : 0);
        } else {
            result[k] = lv;
        }
    });
    return result;
}

function _mergeReports(local, cloud) {
    const map = new Map();
    // 클라우드 먼저 넣고 로컬이 덮어씀 (로컬이 더 최신)
    [...cloud, ...local].forEach(r => {
        if (!r.sessionId) return;
        const prev = map.get(r.sessionId);
        if (!prev || (r.timeSpentSeconds || 0) >= (prev.timeSpentSeconds || 0)) {
            map.set(r.sessionId, r);
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
            if (!prev || (item.date || 0) >= (prev.date || 0)) map.set(id, item);
        });
        result[subj] = Array.from(map.values());
    });
    return result;
}

function _unionArr(a, b) {
    return [...new Set([...a, ...b])];
}

// ─────────────────────────────────────────────
//  저장 함수 패치 (report.js 함수 래핑)
// ─────────────────────────────────────────────
function _patchSaveFunctions() {
    if (_patched) return;
    _patched = true;

    // 1. UserSession.saveUserData
    if (typeof UserSession !== 'undefined' && UserSession.saveUserData) {
        const origSaveUser = UserSession.saveUserData.bind(UserSession);
        UserSession.saveUserData = function(data) {
            origSaveUser(data);
            if (data.id) {
                const raw = localStorage.getItem('SmartStudy_UserData_' + data.id);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    parsed._localUpdatedAt = Date.now();
                    localStorage.setItem('SmartStudy_UserData_' + data.id, JSON.stringify(parsed));
                }
                _debounce('userData_' + data.id, () => _uploadUserData(data.id), 2000);
            }
        };
    }

    // 2. saveQuizResult (전역 함수) — 없는 페이지(admin 등)에서는 건너뜀
    if (typeof window.saveQuizResult === 'function') {
        const origSaveQuiz = window.saveQuizResult;
        window.saveQuizResult = function(...args) {
            origSaveQuiz(...args);
            const uid = UserSession.getActiveUser();
            if (uid) _debounce('reports_' + uid, () => _uploadReports(uid), 2000);
        };
    }

    // 3. WrongNote.save — 없는 페이지에서는 건너뜀
    if (typeof WrongNote !== 'undefined' && WrongNote.save) {
        const origWrongSave = WrongNote.save.bind(WrongNote);
        WrongNote.save = function(...args) {
            origWrongSave(...args);
            const uid = UserSession.getActiveUser();
            if (uid) _debounce('wrong_' + uid, () => _uploadWrong(uid), 2000);
        };
    }

    // 4. WrongNote.remove — 없는 페이지에서는 건너뜀
    if (typeof WrongNote !== 'undefined' && WrongNote.remove) {
        const origWrongRemove = WrongNote.remove.bind(WrongNote);
        WrongNote.remove = function(...args) {
            origWrongRemove(...args);
            const uid = UserSession.getActiveUser();
            if (uid) _debounce('wrong_' + uid, () => _uploadWrong(uid), 2000);
        };
    }

    console.log('[FireSync] 저장 함수 패치 완료');
}

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
    /**
     * 로그인 시 호출 — 클라우드에서 데이터 다운로드 후 병합
     * @returns {Promise<void>}
     */
    onLogin: async function(userId) {
        _showSyncBadge('☁️ 동기화 중...');
        const db = await _initDB();
        if (!db) { _showSyncBadge('📵 오프라인 모드'); return; }
        await _downloadAndMerge(userId);
        _patchSaveFunctions();
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

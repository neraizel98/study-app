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
    try {
        await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
        await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js');
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        _db = firebase.firestore();
        _syncReady = true;
        console.log('[FireSync] 연결됨');
        return _db;
    } catch (e) {
        console.warn('[FireSync] 초기화 실패 (오프라인 모드):', e.message);
        return null;
    }
}

// ─────────────────────────────────────────────
//  Firestore 문서 참조 헬퍼
// ─────────────────────────────────────────────
const _col  = (uid) => _db.collection('users').doc(uid).collection('data');
const _uDoc = (uid) => _db.collection('users').doc(uid);              // userData
const _rDoc = (uid) => _col(uid).doc('reports');                      // 퀴즈 기록
const _wDoc = (uid) => _col(uid).doc('wrongAnswers');                 // 오답노트

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
        // dailyStats / missionProgress 는 디바이스별로 다르므로 클라우드에 올리지 않음
        const { dailyStats, missionProgress, ...cloudData } = data;
        await _uDoc(userId).set({ ...cloudData, _updatedAt: Date.now() }, { merge: true });
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

        let changed = false;

        // 1. userData 병합
        if (uSnap.exists) {
            const cloud = uSnap.data();
            const localRaw = localStorage.getItem('SmartStudy_UserData_' + userId);
            const local    = localRaw ? JSON.parse(localRaw) : null;
            const merged   = _mergeUserData(local, cloud, userId);
            localStorage.setItem('SmartStudy_UserData_' + userId, JSON.stringify(merged));
            changed = true;
        } else {
            // 첫 디바이스 → 현재 데이터를 클라우드에 올림
            await _uploadUserData(userId);
        }

        // 2. reports 병합
        if (rSnap.exists && Array.isArray(rSnap.data().reports)) {
            const cloudReports = rSnap.data().reports;
            const localRaw     = localStorage.getItem('SmartVocab_Reports_' + userId);
            const localReports = localRaw ? JSON.parse(localRaw) : [];
            const merged       = _mergeReports(localReports, cloudReports);
            localStorage.setItem('SmartVocab_Reports_' + userId, JSON.stringify(merged));
            changed = true;
        } else {
            await _uploadReports(userId);
        }

        // 3. wrongAnswers 병합
        if (wSnap.exists && wSnap.data().wrongAnswers) {
            const cloudWrong = wSnap.data().wrongAnswers;
            const localRaw   = localStorage.getItem('SmartStudy_WrongAnswers_' + userId);
            const local      = localRaw ? JSON.parse(localRaw) : {};
            const merged     = _mergeWrong(local, cloudWrong);
            localStorage.setItem('SmartStudy_WrongAnswers_' + userId, JSON.stringify(merged));
            changed = true;
        } else {
            await _uploadWrong(userId);
        }

        if (changed) {
            console.log('[FireSync] 클라우드 데이터 병합 완료');
            window.dispatchEvent(new CustomEvent('firesynced', { detail: { userId } }));
        }
    } catch (e) {
        console.warn('[FireSync] 다운로드 실패:', e.message);
    }
}

// ─────────────────────────────────────────────
//  병합 전략
// ─────────────────────────────────────────────
function _mergeUserData(local, cloud, userId) {
    const l = local  || {};
    const c = cloud  || {};

    const localLevel  = l.level || 1;
    const cloudLevel  = c.level || 1;
    const localExp    = l.exp   || 0;
    const cloudExp    = c.exp   || 0;

    // 레벨이 높은 쪽 기준으로 EXP 선택
    let finalLevel = Math.max(localLevel, cloudLevel);
    let finalExp   = localLevel >= cloudLevel ? localExp : cloudExp;

    // 출석: totalDays 가 더 많은 쪽 선택
    const localDays = l.attendance?.totalDays || 0;
    const cloudDays = c.attendance?.totalDays || 0;
    const finalAttendance = localDays >= cloudDays ? (l.attendance || {}) : (c.attendance || {});

    return {
        ...l,                          // 로컬 우선 (dailyStats, missionProgress 포함)
        id:             userId,
        level:          finalLevel,
        exp:            finalExp,
        totalStudyTime: Math.max(l.totalStudyTime || 0, c.totalStudyTime || 0),
        totalAttempts:  Math.max(l.totalAttempts  || 0, c.totalAttempts  || 0),
        totalCorrect:   Math.max(l.totalCorrect   || 0, c.totalCorrect   || 0),
        badges:         _unionArr(l.badges || [], c.badges || []),
        attendance:     finalAttendance
    };
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
    const origSaveUser = UserSession.saveUserData.bind(UserSession);
    UserSession.saveUserData = function(data) {
        origSaveUser(data);
        if (data.id) _debounce('userData_' + data.id, () => _uploadUserData(data.id), 2000);
    };

    // 2. saveQuizResult (전역 함수)
    const origSaveQuiz = window.saveQuizResult;
    window.saveQuizResult = function(...args) {
        origSaveQuiz(...args);
        const uid = UserSession.getActiveUser();
        if (uid) _debounce('reports_' + uid, () => _uploadReports(uid), 2000);
    };

    // 3. WrongNote.save
    const origWrongSave = WrongNote.save.bind(WrongNote);
    WrongNote.save = function(...args) {
        origWrongSave(...args);
        const uid = UserSession.getActiveUser();
        if (uid) _debounce('wrong_' + uid, () => _uploadWrong(uid), 2000);
    };

    // 4. WrongNote.remove
    const origWrongRemove = WrongNote.remove.bind(WrongNote);
    WrongNote.remove = function(...args) {
        origWrongRemove(...args);
        const uid = UserSession.getActiveUser();
        if (uid) _debounce('wrong_' + uid, () => _uploadWrong(uid), 2000);
    };

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

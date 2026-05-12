const REPORT_KEY = 'SmartVocab_Reports';
const ACTIVE_USER_KEY = 'SmartStudy_ActiveUser';
const USER_DATA_PREFIX = 'SmartStudy_UserData_';
const WRONG_NOTE_PREFIX = 'SmartStudy_WrongAnswers_';

/**
 * 전역 사용자 세션 관리
 */
const UserSession = {
    getActiveUser: () => localStorage.getItem(ACTIVE_USER_KEY),
    setActiveUser: (id) => localStorage.setItem(ACTIVE_USER_KEY, id),
    logout: () => localStorage.removeItem(ACTIVE_USER_KEY),

    // 성장형 레벨업에 필요한 경험치 계산 (현재 레벨 * 100)
    getRequiredEXP: (level) => level * 100,

    getUserData: function(id) {
        try {
            const userId = id || this.getActiveUser();
            if (!userId) return null;
            const raw = localStorage.getItem(USER_DATA_PREFIX + userId);
            const defaultData = {
                id: userId,
                level: 1,
                exp: 0,
                totalStudyTime: 0,
                totalAttempts: 0,
                totalCorrect: 0,
                badges: [],
                attendance: { totalDays: 0, currentStreak: 0, lastCheckIn: null },
                dailyStats: { date: new Date().toISOString().split('T')[0], studyTime: { math: 0, english: 0, hanja: 0 }, quizScores: { math: [], english: [], hanja: [] }, subjectsStudied: [] },
                weeklyStats: { weekStart: '', studyTime: 0, attendanceDays: 0 },
                missionProgress: { daily: {}, weekly: {}, achievements: {} }
            };
            
            if (!raw) return defaultData;
            
            const data = JSON.parse(raw);
            // 필드 누락 대비 초기화 (Deep Merge 느낌)
            if (!data.attendance) data.attendance = defaultData.attendance;
            if (!data.dailyStats) {
                data.dailyStats = defaultData.dailyStats;
            } else {
                // 기존 유저 데이터에 신규 필드(quizScores 등) 추가
                data.dailyStats.quizScores = data.dailyStats.quizScores || defaultData.dailyStats.quizScores;
                data.dailyStats.studyTime = data.dailyStats.studyTime || defaultData.dailyStats.studyTime;
                data.dailyStats.subjectsStudied = data.dailyStats.subjectsStudied || defaultData.dailyStats.subjectsStudied;
            }
            if (!data.missionProgress) {
                data.missionProgress = defaultData.missionProgress;
            } else {
                data.missionProgress.daily = data.missionProgress.daily || {};
                data.missionProgress.weekly = data.missionProgress.weekly || {};
                data.missionProgress.achievements = data.missionProgress.achievements || {};
            }

            // 날짜가 바뀌었으면 dailyStats 초기화
            const today = new Date().toISOString().split('T')[0];
            if (data.dailyStats.date !== today) {
                data.dailyStats = { ...defaultData.dailyStats, date: today };
                data.missionProgress.daily = {};
            }

            // 주차가 바뀌었으면 weeklyStats 초기화
            const weekStart = (() => {
                const d = new Date();
                d.setDate(d.getDate() - d.getDay());
                return d.toISOString().split('T')[0];
            })();
            if (!data.weeklyStats || data.weeklyStats.weekStart !== weekStart) {
                data.weeklyStats = { weekStart, studyTime: 0, attendanceDays: 0 };
                data.missionProgress.weekly = {};
            }
            
            return data;
        } catch (e) {
            console.error('[UserSession Data Load Error]', e);
            return { level: 1, exp: 0, totalStudyTime: 0, totalAttempts: 0, totalCorrect: 0, badges: [] };
        }
    },

    saveUserData: function(data) {
        if (!data.id) return;
        localStorage.setItem(USER_DATA_PREFIX + data.id, JSON.stringify(data));
    },

    // 출석 체크 및 연속 출석 계산
    checkIn: function() {
        const user = this.getUserData();
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];
        if (user.attendance.lastCheckIn === today) return; // 이미 오늘 출석함

        const last = user.attendance.lastCheckIn;
        if (last) {
            const lastDate = new Date(last);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                user.attendance.currentStreak++;
            } else if (diffDays > 1) {
                user.attendance.currentStreak = 1;
            }
        } else {
            user.attendance.currentStreak = 1;
        }

        user.attendance.totalDays++;
        user.attendance.lastCheckIn = today;
        if (user.weeklyStats) user.weeklyStats.attendanceDays++;
        this.saveUserData(user);
        console.log(`[UserSession] Checked in! Total: ${user.attendance.totalDays}, Streak: ${user.attendance.currentStreak}`);
    },

    // 일일 통계 업데이트
    updateDailyStat: function(type, subject, value) {
        const user = this.getUserData();
        if (!user) return;

        if (type === 'time') {
            user.dailyStats.studyTime[subject] = (user.dailyStats.studyTime[subject] || 0) + value;
            if (value > 0 && !user.dailyStats.subjectsStudied.includes(subject)) {
                user.dailyStats.subjectsStudied.push(subject);
            }
            if (user.weeklyStats && value > 0) user.weeklyStats.studyTime += value;
        } else if (type === 'score') {
            if (!user.dailyStats.quizScores[subject]) user.dailyStats.quizScores[subject] = [];
            user.dailyStats.quizScores[subject].push(value);
        }

        this.saveUserData(user);
    },

    // 경험치 증가 및 레벨업 처리
    addEXP: function(expGain) {
        const user = this.getUserData();
        if (!user) return null;

        user.exp += expGain;

        let levelUpHappened = false;
        while (user.exp >= this.getRequiredEXP(user.level)) {
            user.exp -= this.getRequiredEXP(user.level);
            user.level++;
            levelUpHappened = true;
        }

        this.saveUserData(user);
        return { user, levelUp: levelUpHappened };
    }
};

/**
 * 오답 관리 시스템
 */
const WrongNote = {
    getStorageKey: () => {
        const id = UserSession.getActiveUser();
        return id ? WRONG_NOTE_PREFIX + id : null;
    },

    getAll: function() {
        try {
            const key = this.getStorageKey();
            if (!key) return { english: [], hanja: [], math: [] };
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : { english: [], hanja: [], math: [] };
        } catch (e) {
            console.error('[WrongNote Error]', e);
            return { english: [], hanja: [], math: [] };
        }
    },

    /**
     * 오답 기록 저장 (히스토리 기능 포함)
     * @param {string} subject - 과목 (english, hanja, math)
     * @param {object} data - 문항 데이터
     * @param {string} status - 'wrong' 또는 'correct'
     * @param {string|number} sessionId - 퀴즈 세션 ID
     * @param {number} round - 시도 회차 (1: 최초, 2: 재시험...)
     */
    save: function(subject, data, status = 'wrong', sessionId = '', round = 1) {
        const all = this.getAll();
        const key = this.getStorageKey();
        if (!key) return;

        if (!all[subject]) all[subject] = [];
        
        // 중복 방지 (English/Hanja는 word/hanja 기준, Math는 type 기준)
        const identifier = subject === 'math' ? data.type : (data.word || data.hanja);
        const exists = all[subject].find(item => (item.word || item.hanja || item.type) === identifier);
        
        const historyEntry = {
            sessionId,
            round,
            status,
            date: Date.now(),
            question: data.question || '',
            explanation: data.explanation || '',
            answer: data.answer,
            choices: data.choices
        };

        if (!exists) {
            // [Refined] 1회차(최초 시도)에서 틀린 경우에만 신규 등록함
            if (round === 1 && status === 'wrong') {
                all[subject].push({ 
                    ...data, 
                    date: Date.now(), 
                    count: 1,
                    isMastered: false,
                    history: [historyEntry] 
                });
            }
        } else {
            // 기존 데이터 업데이트
            if (status === 'wrong') exists.count++;
            exists.date = Date.now();
            exists.isMastered = (status === 'correct');
            
            if (!exists.history) exists.history = [];
            
            // 동일 세션/회차의 기록이 이미 있으면 업데이트, 없으면 추가
            const sameIdx = exists.history.findIndex(h => h.sessionId === sessionId && h.round === round);
            if (sameIdx >= 0) {
                exists.history[sameIdx] = historyEntry;
            } else {
                exists.history.push(historyEntry);
            }
            
            // 최근 15개 이력만 유지 (10개보다 조금 더 여유있게 변경)
            if (exists.history.length > 15) exists.history.shift();
            
            // 문항 데이터 필드 최신화 (마지막 문제나 풀이가 바뀔 수 있으므로)
            if (data.question) exists.question = data.question;
            if (data.explanation) exists.explanation = data.explanation;
        }
        
        localStorage.setItem(key, JSON.stringify(all));
    },

    remove: function(subject, identifier) {
        const all = this.getAll();
        const key = this.getStorageKey();
        if (!key || !all[subject]) return;

        all[subject] = all[subject].filter(item => (item.word || item.hanja || item.type) !== identifier);
        localStorage.setItem(key, JSON.stringify(all));
    }
};

/**
 * 퀴즈 성적 저장 (기존 함수 유지하되 ID 연동)
 */
function saveQuizResult(sessionId, subject, level, totalQuestions, currentScore, initialScore, timeSpentSeconds, isCompleted) {
    const userId = UserSession.getActiveUser();
    if (!userId) return;

    let data = [];
    try {
        const raw = localStorage.getItem(REPORT_KEY + "_" + userId);
        if (raw) data = JSON.parse(raw);
    } catch (e) {}

    let timeDelta = timeSpentSeconds; // 신규 세션이면 전체 시간
    let correctDelta = currentScore;  // 이번에 새로 맞힌 정답 수
    const existingIdx = data.findIndex(r => r.sessionId === sessionId);
    if (existingIdx >= 0) {
        // 기존 세션 업데이트 시, 이전 기록과의 차이만 계산
        const prevTime = data[existingIdx].timeSpentSeconds || 0;
        timeDelta = Math.max(0, timeSpentSeconds - prevTime);

        const prevScore = data[existingIdx].finalScore || 0;
        correctDelta = Math.max(0, currentScore - prevScore);

        data[existingIdx].finalScore = currentScore;
        data[existingIdx].isCompleted = data[existingIdx].isCompleted || isCompleted;
        data[existingIdx].timeSpentSeconds = timeSpentSeconds;
        // totalQuestions는 최초 기록 값을 보존함
    } else {
        data.push({ sessionId, subject, level, date: Date.now(), totalQuestions, initialScore, finalScore: currentScore, timeSpentSeconds, isCompleted });
    }

    localStorage.setItem(REPORT_KEY + "_" + userId, JSON.stringify(data));

    // 경험치 및 통계 업데이트
    const user = UserSession.getUserData();
    if (user) {
        // 시간 계산 버그 방어: 델타 시간이 비정상적(1시간 초과 등)이면 무시
        const safeDelta = (timeDelta >= 0 && timeDelta <= 3600) ? timeDelta : 0;
        user.totalStudyTime += safeDelta;

        // 시도 횟수는 신규 세션일 때만 증가
        if (existingIdx < 0) user.totalAttempts++;

        // 실제 정답 수 누적 (재도전 시 새로 맞힌 문제만 카운트)
        user.totalCorrect = (user.totalCorrect || 0) + correctDelta;

        UserSession.saveUserData(user);

        // 일일 통계 업데이트 (미션용)
        UserSession.updateDailyStat('time', subject, safeDelta);
        UserSession.updateDailyStat('score', subject, currentScore);
    }
}

function getQuizReports() {
    const userId = UserSession.getActiveUser();
    if (!userId) return [];
    try {
        const raw = localStorage.getItem(REPORT_KEY + "_" + userId);
        const data = raw ? JSON.parse(raw) : [];
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error('[Quiz Reports Load Error]', e);
        return [];
    }
}
function exportUserData() {
    const exportData = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('SmartStudy') || key.startsWith('SmartVocab'))) {
            exportData[key] = localStorage.getItem(key);
        }
    }
    const userId = UserSession.getActiveUser() || 'unknown';
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartstudy_backup_${userId}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importUserData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                Object.entries(data).forEach(([key, value]) => {
                    if (key.startsWith('SmartStudy') || key.startsWith('SmartVocab')) {
                        localStorage.setItem(key, value);
                    }
                });
                resolve();
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// 전역 객체 노출
window.UserSession = UserSession;
window.WrongNote = WrongNote;
window.saveQuizResult = saveQuizResult;
window.getQuizReports = getQuizReports;
window.exportUserData = exportUserData;
window.importUserData = importUserData;

const REPORT_KEY = 'SmartVocab_Reports';
const ACTIVE_USER_KEY = 'SmartStudy_ActiveUser';
const USER_DATA_PREFIX = 'SmartStudy_UserData_';
const WRONG_NOTE_PREFIX = 'SmartStudy_WrongAnswers_';
const LocalRepository = window.SmartStudy?.LocalRepository;

const SubjectRegistry = {
    definitions: {
        reading: { name: '국어 독해력', icon: '📖', path: 'reading.html' },
        english: { name: '영어 단어', icon: '🇬🇧', path: 'english.html' },
        grammar: { name: '영어 문법', icon: '📘', path: 'english_grammar.html' },
        hanja: { name: '한자', icon: '🏮', path: 'hanja.html' },
        math: { name: '수학', icon: '📐', path: 'math.html' }
    },
    get(subject) {
        return this.definitions[subject] || {
            name: subject || '새 과목',
            icon: '📚',
            path: `${subject}.html`
        };
    },
    list({ reports = [], wrongAnswers = {} } = {}) {
        const ids = new Set(Object.keys(this.definitions));
        reports.forEach(report => report?.subject && ids.add(report.subject));
        Object.entries(wrongAnswers || {}).forEach(([subject, items]) => {
            if (Array.isArray(items) && items.length) ids.add(subject);
        });
        return [...ids].map(id => ({ id, ...this.get(id) }));
    }
};
window.SubjectRegistry = SubjectRegistry;

const StudyPeriods = {
    dateKey(date = new Date()) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    },
    daily(date = new Date()) {
        return this.dateKey(date);
    },
    weekly(date = new Date()) {
        const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        return this.dateKey(monday);
    },
    monthly(date = new Date()) {
        return this.dateKey(new Date(date.getFullYear(), date.getMonth(), 1));
    }
};
window.StudyPeriods = StudyPeriods;

/**
 * 화면이 실제로 보이고 최근 사용자 활동이 있을 때만 초를 누적합니다.
 * 퀴즈의 단순 시작/종료 시각 차이에서 자리비움 시간을 제거하기 위한 공통 타이머입니다.
 */
const ActiveTimeTracker = {
    create({ idleLimitMs = 45 * 1000 } = {}) {
        const activityEvents = ['click', 'keydown', 'touchstart', 'pointerdown', 'scroll'];
        let activeSeconds = 0;
        let lastTimestamp = Date.now();
        let lastActivityAt = Date.now();
        let timerId = null;

        const onActivity = () => { lastActivityAt = Date.now(); };
        const isMobileLike = () => window.matchMedia?.('(pointer: coarse)').matches === true;
        const canCount = () => document.visibilityState === 'visible'
            && (isMobileLike() || typeof document.hasFocus !== 'function' || document.hasFocus())
            && Date.now() - lastActivityAt <= idleLimitMs;

        function sample() {
            const now = Date.now();
            const elapsed = Math.floor((now - lastTimestamp) / 1000);
            lastTimestamp = now;
            if (elapsed > 0 && canCount()) activeSeconds += Math.min(elapsed, 2);
        }

        function start({ reset = false } = {}) {
            if (reset) activeSeconds = 0;
            lastTimestamp = Date.now();
            lastActivityAt = Date.now();
            if (!timerId) timerId = setInterval(sample, 1000);
        }

        function getSeconds() {
            sample();
            return activeSeconds;
        }

        function stop() {
            sample();
            if (timerId) clearInterval(timerId);
            timerId = null;
        }

        function destroy() {
            stop();
            activityEvents.forEach(event => window.removeEventListener(event, onActivity));
            document.removeEventListener('visibilitychange', sample);
        }

        activityEvents.forEach(event => window.addEventListener(event, onActivity, { passive: true }));
        document.addEventListener('visibilitychange', sample);
        start({ reset: true });

        return { start, stop, destroy, getSeconds };
    }
};
window.ActiveTimeTracker = ActiveTimeTracker;

/**
 * 전역 사용자 세션 관리
 */
const UserSession = {
    getActiveUser: () => LocalRepository.getActiveUser(),
    setActiveUser: (id) => LocalRepository.setActiveUser(id),
    logout: () => LocalRepository.clearActiveUser(),

    // 성장형 레벨업에 필요한 경험치 계산 (현재 레벨 * 100)
    getRequiredEXP: (level) => level * 100,

    getUserData: function(id) {
        try {
            const userId = id || this.getActiveUser();
            if (!userId) return null;
            const stored = LocalRepository.getUser(userId);
            const defaultData = {
                id: userId,
                level: 1,
                exp: 0,
                totalStudyTime: 0,
                totalAttempts: 0,
                totalCorrect: 0,
                badges: [],
                attendance: { totalDays: 0, currentStreak: 0, lastCheckIn: null },
                dailyStats: {
                    date: StudyPeriods.daily(),
                    studyTime: { reading: 0, english: 0, grammar: 0, hanja: 0, math: 0 },
                    learningTime: { reading: 0, english: 0, grammar: 0, hanja: 0, math: 0 },
                    quizTime: { reading: 0, english: 0, grammar: 0, hanja: 0, math: 0 },
                    quizScores: { reading: [], english: [], grammar: [], hanja: [], math: [] },
                    subjectsStudied: []
                },
                weeklyStats: { weekStart: StudyPeriods.weekly(), studyTime: 0, attendanceDays: 0, subjectsStudied: [], quizCount: 0 },
                monthlyStats: { monthStart: StudyPeriods.monthly(), studyTime: 0, attendanceDays: 0, subjectsStudied: [], quizCount: 0 },
                subjectStats: {},
                missionProgress: {
                    daily: {}, weekly: {}, monthly: {},
                    periods: {
                        daily: StudyPeriods.daily(),
                        weekly: StudyPeriods.weekly(),
                        monthly: StudyPeriods.monthly()
                    },
                    rewards: { daily: null, weekly: null, monthly: null }
                }
            };
            
            if (!stored) return defaultData;
            
            const data = stored;
            // 필드 누락 대비 초기화 (Deep Merge 느낌)
            if (!data.attendance) data.attendance = defaultData.attendance;
            if (!data.dailyStats) {
                data.dailyStats = defaultData.dailyStats;
            } else {
                // 기존 유저 데이터에 신규 필드(quizScores 등) 추가
                data.dailyStats.quizScores = data.dailyStats.quizScores || defaultData.dailyStats.quizScores;
                data.dailyStats.studyTime = data.dailyStats.studyTime || defaultData.dailyStats.studyTime;
                data.dailyStats.learningTime = data.dailyStats.learningTime || {};
                data.dailyStats.quizTime = data.dailyStats.quizTime || {};
                data.dailyStats.subjectsStudied = data.dailyStats.subjectsStudied || defaultData.dailyStats.subjectsStudied;
            }
            if (!data.missionProgress) {
                data.missionProgress = defaultData.missionProgress;
            } else {
                data.missionProgress.daily = data.missionProgress.daily || {};
                data.missionProgress.weekly = data.missionProgress.weekly || {};
                data.missionProgress.monthly = data.missionProgress.monthly || {};
                data.missionProgress.periods = data.missionProgress.periods || { daily: '', weekly: '', monthly: '' };
                data.missionProgress.rewards = data.missionProgress.rewards || { daily: null, weekly: null, monthly: null };
            }
            data.subjectStats = data.subjectStats || {};
            data.weeklyStats = data.weeklyStats || defaultData.weeklyStats;
            data.weeklyStats.subjectsStudied = data.weeklyStats.subjectsStudied || [];
            data.weeklyStats.quizCount = data.weeklyStats.quizCount || 0;
            data.monthlyStats = data.monthlyStats || defaultData.monthlyStats;
            data.monthlyStats.subjectsStudied = data.monthlyStats.subjectsStudied || [];
            data.monthlyStats.quizCount = data.monthlyStats.quizCount || 0;

            // 한국 로컬 시간 기준: 매일 0시, 월요일 0시, 매월 1일 0시에 초기화
            const today = StudyPeriods.daily();
            const weekStart = StudyPeriods.weekly();
            const monthStart = StudyPeriods.monthly();
            if (data.dailyStats.date !== today) {
                data.dailyStats = {
                    date: today,
                    studyTime: { ...defaultData.dailyStats.studyTime },
                    learningTime: { ...defaultData.dailyStats.learningTime },
                    quizTime: { ...defaultData.dailyStats.quizTime },
                    quizScores: { ...defaultData.dailyStats.quizScores },
                    subjectsStudied: []
                };
            }
            if (data.missionProgress.periods.daily !== today) {
                data.missionProgress.daily = {};
                data.missionProgress.periods.daily = today;
            }
            if (data.weeklyStats.weekStart !== weekStart) {
                data.weeklyStats = { weekStart, studyTime: 0, attendanceDays: 0, subjectsStudied: [], quizCount: 0 };
            }
            if (data.missionProgress.periods.weekly !== weekStart) {
                data.missionProgress.weekly = {};
                data.missionProgress.periods.weekly = weekStart;
            }
            if (data.monthlyStats.monthStart !== monthStart) {
                data.monthlyStats = { monthStart, studyTime: 0, attendanceDays: 0, subjectsStudied: [], quizCount: 0 };
            }
            if (data.missionProgress.periods.monthly !== monthStart) {
                data.missionProgress.monthly = {};
                data.missionProgress.periods.monthly = monthStart;
            }
            
            return data;
        } catch (e) {
            console.error('[UserSession Data Load Error]', e);
            return { level: 1, exp: 0, totalStudyTime: 0, totalAttempts: 0, totalCorrect: 0, badges: [] };
        }
    },

    saveUserData: function(data) {
        if (!data.id) return;
        LocalRepository.saveUser(data);
    },

    // 출석 체크 및 연속 출석 계산
    checkIn: function() {
        const user = this.getUserData();
        if (!user) return;

        const today = StudyPeriods.daily();
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
        if (user.monthlyStats) user.monthlyStats.attendanceDays++;
        this.saveUserData(user);
        console.log(`[UserSession] Checked in! Total: ${user.attendance.totalDays}, Streak: ${user.attendance.currentStreak}`);
    },

    // 일일 통계 업데이트
    updateDailyStat: function(type, subject, value) {
        const user = this.getUserData();
        if (!user) return;

        const isTime = type === 'time' || type === 'study_time' || type === 'quiz_time';
        if (isTime) {
            user.dailyStats.studyTime[subject] = (user.dailyStats.studyTime[subject] || 0) + value;
            user.dailyStats.learningTime = user.dailyStats.learningTime || {};
            user.dailyStats.quizTime = user.dailyStats.quizTime || {};
            if (type === 'study_time') user.dailyStats.learningTime[subject] = (user.dailyStats.learningTime[subject] || 0) + value;
            if (type === 'quiz_time') user.dailyStats.quizTime[subject] = (user.dailyStats.quizTime[subject] || 0) + value;
            if (value > 0 && !user.dailyStats.subjectsStudied.includes(subject)) {
                user.dailyStats.subjectsStudied.push(subject);
            }
            if (user.weeklyStats && value > 0) {
                user.weeklyStats.studyTime += value;
                user.weeklyStats.subjectsStudied = user.weeklyStats.subjectsStudied || [];
                if (!user.weeklyStats.subjectsStudied.includes(subject)) user.weeklyStats.subjectsStudied.push(subject);
            }
            if (user.monthlyStats && value > 0) {
                user.monthlyStats.studyTime += value;
                user.monthlyStats.subjectsStudied = user.monthlyStats.subjectsStudied || [];
                if (!user.monthlyStats.subjectsStudied.includes(subject)) user.monthlyStats.subjectsStudied.push(subject);
            }
        } else if (type === 'score') {
            if (!user.dailyStats.quizScores[subject]) user.dailyStats.quizScores[subject] = [];
            user.dailyStats.quizScores[subject].push(value);
        } else if (type === 'quiz') {
            if (user.weeklyStats) user.weeklyStats.quizCount = (user.weeklyStats.quizCount || 0) + 1;
            if (user.monthlyStats) user.monthlyStats.quizCount = (user.monthlyStats.quizCount || 0) + 1;
        }

        user.subjectStats = user.subjectStats || {};
        const subjectStat = user.subjectStats[subject] || { studyTime: 0, quizCount: 0, bestScore: 0 };
        if (isTime) subjectStat.studyTime = (subjectStat.studyTime || 0) + value;
        if (type === 'study_time') subjectStat.learningTime = (subjectStat.learningTime || 0) + value;
        if (type === 'quiz_time') subjectStat.quizTime = (subjectStat.quizTime || 0) + value;
        if (type === 'score') {
            subjectStat.bestScore = Math.max(subjectStat.bestScore || 0, value || 0);
        }
        if (type === 'quiz') {
            subjectStat.quizCount += 1;
        }
        user.subjectStats[subject] = subjectStat;

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
    getIdentifier: function(subject, data) {
        if (data?.wrongNoteId) return data.wrongNoteId;
        if (subject === 'grammar' || subject === 'reading') return data?.questionId || data?.type;
        if (subject === 'math') return data?.type;
        return data?.word || data?.hanja;
    },
    getStorageKey: () => {
        const id = UserSession.getActiveUser();
        return id ? WRONG_NOTE_PREFIX + id : null;
    },

    getAll: function() {
        try {
            const userId = UserSession.getActiveUser();
            if (!userId) return { english: [], grammar: [], hanja: [], math: [], reading: [] };
            const stored = LocalRepository.getWrongAnswers(userId);
            return Object.assign({ english: [], grammar: [], hanja: [], math: [], reading: [] }, stored);
        } catch (e) {
            console.error('[WrongNote Error]', e);
            return { english: [], grammar: [], hanja: [], math: [], reading: [] };
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
        const identifier = this.getIdentifier(subject, data);
        const exists = all[subject].find(item => this.getIdentifier(subject, item) === identifier);
        
        const historyEntry = {
            sessionId,
            round,
            status,
            date: Date.now(),
            question: data.question || '',
            explanation: data.explanation || '',
            answer: data.answer,
            choices: Array.isArray(data.choices) ? [...data.choices] : data.choices,
            selectedAnswer: data.selectedAnswer,
            correctAnswer: data.correctAnswer ?? data.answer,
            questionId: data.questionId,
            passageId: data.passageId,
            passageTitle: data.passageTitle,
            passageText: Array.isArray(data.passageText) ? [...data.passageText] : data.passageText,
            skill: data.skill,
            snapshotId: data.snapshotId
        };

        if (!exists) {
            // 1회차(최초 시도)에서 틀린 경우에만 신규 등록
            if (round === 1 && status === 'wrong') {
                all[subject].push({
                    ...data,
                    wrongNoteId: identifier,
                    date: Date.now(),
                    count: 1,
                    masteryScore: 0,  // 연속 정답 수 (0~3)
                    isMastered: false,
                    history: [historyEntry]
                });
            }
        } else {
            // 기존 데이터 업데이트
            if (status === 'wrong') exists.count++;
            exists.date = Date.now();

            // 연속 정답 3회 = Mastered (틀리면 0으로 리셋)
            if (status === 'correct') {
                exists.masteryScore = Math.min(3, (exists.masteryScore || 0) + 1);
            } else {
                exists.masteryScore = 0;
            }
            exists.isMastered = exists.masteryScore >= 3;
            
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
            if (data.selectedAnswer !== undefined) exists.selectedAnswer = data.selectedAnswer;
            if (data.correctAnswer !== undefined) exists.correctAnswer = data.correctAnswer;
            if (data.unitTitle) exists.unitTitle = data.unitTitle;
            if (data.stageTitle) exists.stageTitle = data.stageTitle;
        }
        
        LocalRepository.saveWrongAnswers(UserSession.getActiveUser(), all);
    },

    remove: function(subject, identifier) {
        const all = this.getAll();
        const key = this.getStorageKey();
        if (!key || !all[subject]) return;

        all[subject] = all[subject].filter(item => this.getIdentifier(subject, item) !== identifier);
        LocalRepository.saveWrongAnswers(UserSession.getActiveUser(), all);
    }
};

/**
 * 적응형 퀴즈 선택기
 * - 해결되지 않은 최근/반복 오답을 일반 문제보다 높은 확률로 포함
 * - 최근 성적에 따라 foundation → standard → challenge 단계로 상승
 */
const AdaptiveQuiz = {
    getBand(subject, context = 'default', aliases = []) {
        if (typeof StudyTimer === 'undefined') return { name: 'standard', score: null, wrongRatio: 0.4 };
        const result = StudyTimer.getLatestScore(subject, context, aliases);
        const score = result ? result.pct : null;
        if (score === null || score < 70) return { name: 'foundation', score, wrongRatio: 0.55 };
        if (score < 85) return { name: 'standard', score, wrongRatio: 0.45 };
        return { name: 'challenge', score, wrongRatio: 0.35 };
    },

    weightedWrongItems(items, count) {
        const candidates = (items || []).filter(item => !item.isMastered).map(item => ({ item, weight:
            2
            + Math.min(6, Number(item.count || 1)) * 1.5
            + (Number(item.masteryScore || 0) === 0 ? 2 : 0)
            + (Date.now() - Number(item.date || 0) < 7 * 86400000 ? 2 : 0)
        }));
        const selected = [];
        while (candidates.length && selected.length < count) {
            const total = candidates.reduce((sum, entry) => sum + entry.weight, 0);
            let pick = Math.random() * total;
            let index = 0;
            for (; index < candidates.length - 1; index++) {
                pick -= candidates[index].weight;
                if (pick <= 0) break;
            }
            selected.push(candidates.splice(index, 1)[0].item);
        }
        return selected;
    },

    mix(pool, wrongItems, idOfPool, idOfWrong, count, wrongRatio = 0.45) {
        const source = [...(pool || [])];
        const byId = new Map(source.map(item => [idOfPool(item), item]));
        const eligibleWrong = (wrongItems || []).filter(item => byId.has(idOfWrong(item)) && !item.isMastered);
        const targetWrong = Math.min(eligibleWrong.length, Math.max(1, Math.round(count * wrongRatio)));
        const priority = this.weightedWrongItems(eligibleWrong, targetWrong)
            .map(item => byId.get(idOfWrong(item)))
            .filter(Boolean);
        const used = new Set(priority.map(idOfPool));
        const fresh = typeof Utils !== 'undefined'
            ? Utils.shuffle(source.filter(item => !used.has(idOfPool(item))))
            : source.filter(item => !used.has(idOfPool(item))).sort(() => Math.random() - 0.5);
        return [...priority, ...fresh.slice(0, Math.max(0, count - priority.length))]
            .sort(() => Math.random() - 0.5);
    }
};

/**
 * 퀴즈 성적 저장 (기존 함수 유지하되 ID 연동)
 */
function saveQuizResult(sessionId, subject, level, totalQuestions, currentScore, initialScore, timeSpentSeconds, isCompleted, metadata = null) {
    const userId = UserSession.getActiveUser();
    if (!userId) return;

    const data = LocalRepository.listReports(userId);

    let timeDelta = timeSpentSeconds; // 신규 세션이면 전체 시간
    let correctDelta = currentScore;  // 이번에 새로 맞힌 정답 수
    const existingIdx = data.findIndex(r => r.sessionId === sessionId);
    const isNewSession = existingIdx < 0;
    if (existingIdx >= 0) {
        // 기존 세션 업데이트 시, 이전 기록과의 차이만 계산
        const prevTime = data[existingIdx].timeSpentSeconds || 0;
        timeDelta = Math.max(0, timeSpentSeconds - prevTime);

        const prevScore = data[existingIdx].finalScore || 0;
        correctDelta = Math.max(0, currentScore - prevScore);

        data[existingIdx].finalScore = currentScore;
        data[existingIdx].isCompleted = data[existingIdx].isCompleted || isCompleted;
        data[existingIdx].timeSpentSeconds = timeSpentSeconds;
        if (metadata) data[existingIdx].metadata = metadata;
        // totalQuestions는 최초 기록 값을 보존함
    } else {
        data.push({ sessionId, subject, level, date: Date.now(), totalQuestions, initialScore, finalScore: currentScore, timeSpentSeconds, isCompleted, metadata });
    }

    LocalRepository.saveReports(userId, data);

    // 경험치 및 통계 업데이트
    const user = UserSession.getUserData();
    if (user) {
        // 모든 과목의 timeSpentSeconds는 자리비움을 제외한 실제 퀴즈 시간이다.
        // 학습 시간은 StudyTimer가 별도로 합산하므로 여기서는 퀴즈 시간만 더한다.
        const safeDelta = (timeDelta >= 0 && timeDelta <= 3600) ? timeDelta : 0;
        user.totalStudyTime += safeDelta;

        // 시도 횟수는 신규 세션일 때만 증가
        if (existingIdx < 0) user.totalAttempts++;

        // 실제 정답 수 누적 (재도전 시 새로 맞힌 문제만 카운트)
        user.totalCorrect = (user.totalCorrect || 0) + correctDelta;

        UserSession.saveUserData(user);

        // 일일 통계 업데이트 (미션용)
        UserSession.updateDailyStat('quiz_time', subject, safeDelta);
        const scorePct = totalQuestions > 0 ? Math.round((currentScore / totalQuestions) * 100) : 0;
        UserSession.updateDailyStat('score', subject, scorePct);
        if (isNewSession) UserSession.updateDailyStat('quiz', subject, currentScore);
    }
}

function getQuizReports() {
    const userId = UserSession.getActiveUser();
    if (!userId) return [];
    try {
        return LocalRepository.listReports(userId);
    } catch (e) {
        console.error('[Quiz Reports Load Error]', e);
        return [];
    }
}
function exportUserData() {
    const exportData = {};
    for (const key of LocalRepository.keys()) {
        if (key && (key.startsWith('SmartStudy') || key.startsWith('SmartVocab'))) {
            exportData[key] = LocalRepository.rawGet(key);
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
                        LocalRepository.rawSet(key, value);
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
window.AdaptiveQuiz = AdaptiveQuiz;
window.saveQuizResult = saveQuizResult;
window.getQuizReports = getQuizReports;
window.exportUserData = exportUserData;
window.importUserData = importUserData;

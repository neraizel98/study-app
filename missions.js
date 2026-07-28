/**
 * missions.js - 단기·주간·장기 목표 및 보상 시스템
 */
const MissionManager = {
    DEFINITIONS: {
        daily: [
            { id: 'd_checkin', icon: '🌅', title: '오늘의 시작', desc: '오늘 앱에 접속하기', target: 1, exp: 20 },
            { id: 'd_study_15', icon: '⏱️', title: '집중 학습', desc: '한 과목을 15분 이상 학습하기', target: 900, exp: 50, type: 'time_any' },
            { id: 'd_two_subjects', icon: '🌈', title: '두 과목 도전', desc: '서로 다른 과목 2개 학습하기', target: 2, exp: 70, type: 'subjects_today' },
            { id: 'd_score_80', icon: '🎯', title: '오늘의 목표 점수', desc: '퀴즈에서 80점 이상 받기', target: 80, exp: 60, type: 'best_score_today' }
        ],
        weekly: [
            { id: 'w_attendance_5', icon: '📆', title: '성실한 일주일', desc: '이번 주 5일 이상 출석하기', target: 5, exp: 200, type: 'attendance_count' },
            { id: 'w_total_time_3h', icon: '🕐', title: '주간 집중 3시간', desc: '이번 주 총 학습 시간 3시간 달성', target: 10800, exp: 300, type: 'total_time' },
            { id: 'w_all_subjects', icon: '🧭', title: '전 과목 탐험', desc: '등록된 모든 과목을 한 번 이상 학습하기', target: 'subjects', exp: 250, type: 'subjects_week' },
            { id: 'w_quiz_5', icon: '📝', title: '꾸준한 실전', desc: '이번 주 퀴즈 5회 완료하기', target: 5, exp: 200, type: 'quiz_count_week' }
        ],
        achievements: [
            { id: 'a_streak_7', icon: '🔥', title: '7일 연속 출석', desc: '일주일 동안 매일 학습하기', target: 7, exp: 500, type: 'streak' },
            { id: 'a_streak_30', icon: '🌋', title: '30일 습관 완성', desc: '30일 연속 학습 습관 만들기', target: 30, exp: 1500, type: 'streak' },
            { id: 'a_time_10h', icon: '⏳', title: '누적 학습 10시간', desc: '차곡차곡 10시간 학습하기', target: 36000, exp: 800, type: 'lifetime_time' },
            { id: 'a_time_50h', icon: '🚀', title: '누적 학습 50시간', desc: '장기 목표 50시간 달성하기', target: 180000, exp: 2500, type: 'lifetime_time' },
            { id: 'a_correct_500', icon: '🧠', title: '정답 500개', desc: '누적 정답 수 500개 돌파', target: 500, exp: 700, type: 'total_correct' },
            { id: 'a_correct_1000', icon: '👑', title: '정답 1,000개', desc: '누적 정답 수 1,000개 돌파', target: 1000, exp: 1200, type: 'total_correct' },
            { id: 'a_subject_mastery', icon: '🏆', title: '전 과목 꾸준왕', desc: '등록된 모든 과목에서 퀴즈 5회 이상 도전', target: 'subjects', exp: 1500, type: 'subject_mastery' }
        ]
    },

    REWARDS: {
        daily: [
            { icon: '🎮', title: '자유시간 30분' },
            { icon: '🍪', title: '원하는 간식 선택' },
            { icon: '🍽️', title: '저녁 메뉴 선택권' },
            { icon: '🎬', title: '가족 놀이·영상 선택권 30분' }
        ],
        weekly: [
            { icon: '🎮', title: '자유시간 1시간' },
            { icon: '🍴', title: '주말 외식 메뉴 선택' },
            { icon: '🗺️', title: '주말 활동 장소 선택' }
        ],
        achievements: [
            { icon: '🕹️', title: '원하는 게임 1개 설치권', note: '부모 승인 필요' },
            { icon: '🎮', title: '자유시간 2시간' },
            { icon: '🎡', title: '원하는 체험·나들이 선택권' }
        ]
    },

    registeredSubjects(user = null) {
        const ids = new Set(typeof SubjectRegistry !== 'undefined'
            ? SubjectRegistry.list().map(subject => subject.id)
            : ['english', 'grammar', 'hanja', 'math']);
        Object.keys(user?.subjectStats || {}).forEach(subject => ids.add(subject));
        Object.keys(user?.dailyStats?.studyTime || {}).forEach(subject => ids.add(subject));
        return [...ids];
    },

    targetOf(mission, user = null) {
        return mission.target === 'subjects' ? this.registeredSubjects(user).length : mission.target;
    },

    progressOf(user, mission) {
        const daily = user.dailyStats || {};
        const weekly = user.weeklyStats || {};
        switch (mission.type || mission.id) {
            case 'd_checkin': return 1;
            case 'time_any': return Math.max(0, ...Object.values(daily.studyTime || {}));
            case 'subjects_today': return new Set(daily.subjectsStudied || []).size;
            case 'best_score_today':
                return Math.max(0, ...Object.values(daily.quizScores || {}).flat());
            case 'attendance_count': return weekly.attendanceDays || 0;
            case 'total_time': return weekly.studyTime || 0;
            case 'subjects_week': {
                const studied = new Set(weekly.subjectsStudied || []);
                return this.registeredSubjects(user).filter(subject => studied.has(subject)).length;
            }
            case 'quiz_count_week': return weekly.quizCount || 0;
            case 'streak': return user.attendance?.currentStreak || 0;
            case 'lifetime_time': return user.totalStudyTime || 0;
            case 'total_correct': return user.totalCorrect || 0;
            case 'subject_mastery':
                return this.registeredSubjects(user).filter(subject => (user.subjectStats?.[subject]?.quizCount || 0) >= 5).length;
            default: return 0;
        }
    },

    periodKey(category) {
        if (category === 'daily') return new Date().toISOString().split('T')[0];
        const date = new Date();
        date.setDate(date.getDate() - date.getDay());
        return date.toISOString().split('T')[0];
    },

    randomReward(category) {
        const pool = this.REWARDS[category] || [];
        return pool[Math.floor(Math.random() * pool.length)];
    },

    grantExp(user, amount) {
        user.exp = (user.exp || 0) + amount;
        user.level = user.level || 1;
        while (user.exp >= user.level * 100) {
            user.exp -= user.level * 100;
            user.level += 1;
        }
    },

    awardReward(user, category, mission = null) {
        const rewards = user.missionProgress.rewards;
        const reward = this.randomReward(category);
        if (!reward) return;
        const entry = { ...reward, awardedAt: Date.now(), used: false };
        if (category === 'achievements') {
            if (rewards.achievements.some(item => item.missionId === mission.id)) return;
            rewards.achievements.push({ ...entry, missionId: mission.id });
        } else {
            const period = this.periodKey(category);
            if (rewards[category]?.period === period) return;
            rewards[category] = { ...entry, period };
        }
    },

    checkMissions() {
        const user = UserSession.getUserData();
        if (!user) return [];
        user.missionProgress.rewards = user.missionProgress.rewards || { daily: null, weekly: null, achievements: [] };
        user.missionProgress.rewards.achievements = user.missionProgress.rewards.achievements || [];
        const completedNow = [];

        ['daily', 'weekly', 'achievements'].forEach(category => {
            this.DEFINITIONS[category].forEach(mission => {
                const target = this.targetOf(mission, user);
                const previous = user.missionProgress[category][mission.id];
                if (previous?.completed) return;
                const progress = this.progressOf(user, mission);
                if (progress >= target) {
                    user.missionProgress[category][mission.id] = { progress: target, completed: true, date: Date.now() };
                    this.grantExp(user, mission.exp);
                    completedNow.push(mission);
                    if (category === 'achievements') this.awardReward(user, category, mission);
                } else {
                    user.missionProgress[category][mission.id] = { progress, completed: false };
                }
            });
        });

        ['daily', 'weekly'].forEach(category => {
            const allDone = this.DEFINITIONS[category].every(mission => user.missionProgress[category][mission.id]?.completed);
            if (allDone) this.awardReward(user, category);
        });
        UserSession.saveUserData(user);
        return completedNow;
    },

    rewardFor(user, category) {
        const rewards = user.missionProgress.rewards || {};
        if (category === 'achievements') return (rewards.achievements || []).slice(-1)[0];
        const reward = rewards[category];
        return reward?.period === this.periodKey(category) ? reward : null;
    },

    renderMissionList(containerId) {
        const user = UserSession.getUserData();
        const container = document.getElementById(containerId);
        if (!container || !user) return;

        const makeSection = (emoji, label, category, isTwoCol) => {
            const definitions = this.DEFINITIONS[category];
            const progressMap = user.missionProgress[category];
            const done = definitions.filter(mission => progressMap[mission.id]?.completed).length;
            const reward = this.rewardFor(user, category);
            const rewardCandidates = (this.REWARDS[category] || []).map(item =>
                `<span class="mission-reward-chip">${item.icon} ${item.title}${item.note ? ` <small>(${item.note})</small>` : ''}</span>`
            ).join('');
            let html = `
                <div class="mission-section-header">
                    <span>${emoji} <span class="mission-section-label">${label}</span></span>
                    <span class="mission-section-count">${done}/${definitions.length} 완료</span>
                </div>
                ${reward ? `<div class="mission-reward-banner">🎁 획득 보상: <strong>${reward.icon} ${reward.title}</strong>${reward.note ? ` · ${reward.note}` : ''}</div>` : ''}
                <div class="mission-reward-preview">
                    <div class="mission-reward-preview-title">🎲 모두 완료하면 아래 보상 중 1개를 무작위로 받아요!</div>
                    <div class="mission-reward-chip-list">${rewardCandidates}</div>
                </div>
                <div class="mission-grid${isTwoCol ? '' : ' single-col'}">`;
            definitions.forEach(mission => {
                const progress = progressMap[mission.id] || { progress: 0, completed: false };
                const target = this.targetOf(mission, user);
                const pct = Math.min(100, Math.round((progress.progress / target) * 100));
                html += this.generateMissionItemHtml(mission, progress, pct);
            });
            return html + '</div>';
        };

        container.innerHTML = '<div class="mission-list">'
            + makeSection('📅', '오늘의 단기 목표', 'daily', true)
            + makeSection('📆', '이번 주 목표', 'weekly', false)
            + makeSection('🏆', '장기 목표 · 명예의 전당', 'achievements', false)
            + '</div>';
    },

    generateMissionItemHtml(mission, progress, pct) {
        const completed = progress.completed;
        return `
            <div class="mission-item ${completed ? 'completed' : ''}">
                <div class="mission-icon">${mission.icon}</div>
                <div class="mission-body">
                    <div class="mission-title-row">
                        <span class="mission-title">${mission.title}</span>
                        <span class="mission-reward">+${mission.exp} EXP</span>
                    </div>
                    <div class="mission-desc">${mission.desc}</div>
                    <div class="mission-footer">
                        <div class="mission-progress-bar"><div class="mission-progress-fill" style="width:${pct}%"></div></div>
                        <span class="mission-progress-text">${completed ? '완료! ✅' : this.formatProgress(mission, progress.progress)}</span>
                    </div>
                </div>
            </div>`;
    },

    formatProgress(mission, value) {
        const current = value || 0;
        const target = this.targetOf(mission, UserSession.getUserData());
        if (['time_any', 'total_time', 'lifetime_time'].includes(mission.type)) {
            const currentMinutes = Math.floor(current / 60);
            const targetMinutes = Math.floor(target / 60);
            return `${currentMinutes}분 / ${targetMinutes}분`;
        }
        if (['subjects_today', 'subjects_week', 'subject_mastery'].includes(mission.type)) return `${current} / ${target}과목`;
        if (['attendance_count', 'streak'].includes(mission.type)) return `${current} / ${target}일`;
        if (mission.type === 'quiz_count_week') return `${current} / ${target}회`;
        if (mission.type === 'total_correct') return `${current} / ${target}개`;
        if (mission.type === 'best_score_today') return `${current}점 / ${target}점`;
        return `${current} / ${target}`;
    }
};

window.MissionManager = MissionManager;

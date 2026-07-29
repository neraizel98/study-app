/**
 * missions.js - 일간·주간·월간 목표 및 보상 시스템
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
        monthly: [
            { id: 'm_attendance_20', icon: '🗓️', title: '월간 출석왕', desc: '이번 달 20일 이상 출석하기', target: 20, exp: 700, type: 'attendance_count_month' },
            { id: 'm_total_time_12h', icon: '⏳', title: '월간 집중 12시간', desc: '이번 달 총 학습 시간 12시간 달성', target: 43200, exp: 900, type: 'total_time_month' },
            { id: 'm_all_subjects', icon: '🏆', title: '전 과목 완주', desc: '이번 달 등록된 모든 과목을 한 번 이상 학습하기', target: 'subjects', exp: 800, type: 'subjects_month' },
            { id: 'm_quiz_20', icon: '🧠', title: '월간 실전왕', desc: '이번 달 퀴즈 20회 완료하기', target: 20, exp: 700, type: 'quiz_count_month' }
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
        monthly: [
            { icon: '🕹️', title: '원하는 게임 1개 설치권', note: '부모 승인 필요' },
            { icon: '🎮', title: '자유시간 2시간' },
            { icon: '🎡', title: '원하는 체험·나들이 선택권' }
        ]
    },

    registeredSubjects(user = null) {
        if (typeof SubjectRegistry !== 'undefined') {
            return SubjectRegistry.list().map(subject => subject.id);
        }
        return ['reading', 'english', 'grammar', 'hanja', 'math'];
    },

    targetOf(mission, user = null) {
        return mission.target === 'subjects' ? this.registeredSubjects(user).length : mission.target;
    },

    progressOf(user, mission) {
        const daily = user.dailyStats || {};
        const weekly = user.weeklyStats || {};
        const monthly = user.monthlyStats || {};
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
            case 'attendance_count_month': return monthly.attendanceDays || 0;
            case 'total_time_month': return monthly.studyTime || 0;
            case 'subjects_month': {
                const studied = new Set(monthly.subjectsStudied || []);
                return this.registeredSubjects(user).filter(subject => studied.has(subject)).length;
            }
            case 'quiz_count_month': return monthly.quizCount || 0;
            default: return 0;
        }
    },

    periodKey(category) {
        if (typeof StudyPeriods !== 'undefined' && StudyPeriods[category]) {
            return StudyPeriods[category]();
        }
        const now = new Date();
        const key = date => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };
        if (category === 'daily') return key(now);
        if (category === 'monthly') return key(new Date(now.getFullYear(), now.getMonth(), 1));
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        return key(monday);
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

    awardReward(user, category) {
        const rewards = user.missionProgress.rewards;
        const reward = this.randomReward(category);
        if (!reward) return;
        const entry = { ...reward, awardedAt: Date.now(), used: false };
        const period = this.periodKey(category);
        if (rewards[category]?.period === period) return;
        rewards[category] = { ...entry, period };
    },

    checkMissions() {
        const user = UserSession.getUserData();
        if (!user) return [];
        user.missionProgress = user.missionProgress || {};
        user.missionProgress.rewards = user.missionProgress.rewards || { daily: null, weekly: null, monthly: null };
        user.missionProgress.periods = user.missionProgress.periods || {};
        const completedNow = [];

        ['daily', 'weekly', 'monthly'].forEach(category => {
            const period = this.periodKey(category);
            if (user.missionProgress.periods[category] !== period) {
                user.missionProgress[category] = {};
                user.missionProgress.periods[category] = period;
            }
            user.missionProgress[category] = user.missionProgress[category] || {};
            this.DEFINITIONS[category].forEach(mission => {
                const target = this.targetOf(mission, user);
                const previous = user.missionProgress[category][mission.id];
                if (previous?.completed) return;
                const progress = this.progressOf(user, mission);
                if (progress >= target) {
                    user.missionProgress[category][mission.id] = { progress: target, completed: true, date: Date.now() };
                    this.grantExp(user, mission.exp);
                    completedNow.push(mission);
                } else {
                    user.missionProgress[category][mission.id] = { progress, completed: false };
                }
            });
        });

        ['daily', 'weekly', 'monthly'].forEach(category => {
            const allDone = this.DEFINITIONS[category].every(mission => user.missionProgress[category][mission.id]?.completed);
            if (allDone) this.awardReward(user, category);
        });
        UserSession.saveUserData(user);
        return completedNow;
    },

    rewardFor(user, category) {
        const rewards = user.missionProgress.rewards || {};
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
            + makeSection('🏆', '이번 달 장기 목표', 'monthly', false)
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
        if (['time_any', 'total_time', 'total_time_month'].includes(mission.type)) {
            const currentMinutes = Math.floor(current / 60);
            const targetMinutes = Math.floor(target / 60);
            return `${currentMinutes}분 / ${targetMinutes}분`;
        }
        if (['subjects_today', 'subjects_week', 'subjects_month'].includes(mission.type)) return `${current} / ${target}과목`;
        if (['attendance_count', 'attendance_count_month'].includes(mission.type)) return `${current} / ${target}일`;
        if (['quiz_count_week', 'quiz_count_month'].includes(mission.type)) return `${current} / ${target}회`;
        if (mission.type === 'best_score_today') return `${current}점 / ${target}점`;
        return `${current} / ${target}`;
    }
};

window.MissionManager = MissionManager;

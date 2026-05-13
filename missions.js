/**
 * missions.js - 미션 및 업적 관리 시스템
 * ============================================================
 */

const MissionManager = {
    // 미션 정의
    DEFINITIONS: {
        daily: [
            { id: 'd_checkin', icon: '🌅', title: '오늘의 시작', desc: '오늘 앱에 접속하기', target: 1, exp: 20 },
            { id: 'd_study_15', icon: '⏱️', title: '열정 학습자', desc: '한 과목 15분 이상 학습하기', target: 900, exp: 50, type: 'time_any' },
            { id: 'd_all_subjects', icon: '🌟', title: '팔방미인', desc: '영어, 수학, 한자 모두 학습하기', target: 3, exp: 100, type: 'all_subjects' },
            { id: 'd_perfect_quiz', icon: '💯', title: '퀴즈 마스터', desc: '퀴즈에서 100점 맞기', target: 1, exp: 50, type: 'perfect_score' }
        ],
        weekly: [
            { id: 'w_attendance_5', icon: '📆', title: '성실한 일주일', desc: '이번 주 5일 이상 출석하기', target: 5, exp: 200, type: 'attendance_count' },
            { id: 'w_total_time_3h', icon: '🕐', title: '공부 벌레', desc: '주간 총 학습 시간 3시간 달성', target: 10800, exp: 300, type: 'total_time' }
        ],
        achievements: [
            { id: 'a_streak_7', icon: '🔥', title: '7일 연속 출석', desc: '일주일 내내 쉬지 않고 공부했어요!', target: 7, exp: 500, type: 'streak' },
            { id: 'a_total_correct_1000', icon: '🧠', title: '천재의 탄생', desc: '누적 정답 수 1,000개 돌파', target: 1000, exp: 1000, type: 'total_correct' }
        ]
    },

    // 미션 상태 업데이트 및 체크
    checkMissions: function() {
        const user = UserSession.getUserData();
        if (!user) return [];

        const completedNow = [];
        const today = new Date().toISOString().split('T')[0];

        // 1. 일일 미션 체크
        this.DEFINITIONS.daily.forEach(m => {
            if (user.missionProgress.daily[m.id]?.completed) return;

            let progress = 0;
            switch(m.type || m.id) {
                case 'd_checkin': progress = 1; break;
                case 'time_any': progress = Math.max(...Object.values(user.dailyStats.studyTime)); break;
                case 'all_subjects': progress = user.dailyStats.subjectsStudied.length; break;
                case 'perfect_score': 
                    progress = Object.values(user.dailyStats.quizScores).some(scores => scores.some(s => s >= 100)) ? 1 : 0; 
                    break;
            }

            if (progress >= m.target) {
                this.completeMission(user, 'daily', m, completedNow);
            } else {
                user.missionProgress.daily[m.id] = { progress, completed: false };
            }
        });

        // 2. 주간 미션 체크
        this.DEFINITIONS.weekly.forEach(m => {
            if (user.missionProgress.weekly[m.id]?.completed) return;

            let progress = 0;
            if (m.type === 'attendance_count') progress = user.weeklyStats?.attendanceDays || 0;
            if (m.type === 'total_time') progress = user.weeklyStats?.studyTime || 0;

            if (progress >= m.target) {
                this.completeMission(user, 'weekly', m, completedNow);
            } else {
                user.missionProgress.weekly[m.id] = { progress, completed: false };
            }
        });

        // 3. 업적 체크
        this.DEFINITIONS.achievements.forEach(m => {
            if (user.missionProgress.achievements[m.id]?.completed) return;

            let progress = 0;
            if (m.type === 'streak') progress = user.attendance.currentStreak;
            if (m.type === 'total_correct') progress = user.totalCorrect;

            if (progress >= m.target) {
                this.completeMission(user, 'achievements', m, completedNow);
            } else {
                user.missionProgress.achievements[m.id] = { progress, completed: false };
            }
        });

        UserSession.saveUserData(user);
        return completedNow;
    },

    completeMission: function(user, category, mission, completedList) {
        user.missionProgress[category][mission.id] = { progress: mission.target, completed: true, date: Date.now() };
        UserSession.addEXP(mission.exp);
        completedList.push(mission);
        console.log(`[Mission] Completed: ${mission.title}! +${mission.exp} EXP`);
    },

    // 미션 UI 렌더링 (모달 또는 섹션용)
    renderMissionList: function(containerId) {
        const user = UserSession.getUserData();
        const container = document.getElementById(containerId);
        if (!container || !user) return;

        const makeSection = (emoji, label, defs, progressMap, isTwoCol) => {
            const done = defs.filter(m => progressMap[m.id]?.completed).length;
            let html = `
                <div class="mission-section-header">
                    <span>${emoji} <span class="mission-section-label">${label}</span></span>
                    <span class="mission-section-count">${done}/${defs.length} 완료</span>
                </div>
                <div class="mission-grid${isTwoCol ? '' : ' single-col'}">
            `;
            defs.forEach(m => {
                const prog = progressMap[m.id] || { progress: 0, completed: false };
                const pct = Math.min(100, Math.round((prog.progress / m.target) * 100));
                html += this.generateMissionItemHtml(m, prog, pct);
            });
            html += '</div>';
            return html;
        };

        let html = '<div class="mission-list">';
        html += makeSection('📅', '오늘의 미션', this.DEFINITIONS.daily, user.missionProgress.daily, true);
        html += makeSection('📆', '이번 주 미션', this.DEFINITIONS.weekly, user.missionProgress.weekly, false);
        html += makeSection('🏆', '명예의 전당', this.DEFINITIONS.achievements, user.missionProgress.achievements, false);
        html += '</div>';

        container.innerHTML = html;
    },

    generateMissionItemHtml: function(m, prog, pct) {
        const isDone = prog.completed;
        const progressText = isDone ? '완료! ✅' : this.formatProgress(m, prog.progress);
        return `
            <div class="mission-item ${isDone ? 'completed' : ''}">
                <div class="mission-icon">${m.icon || '🎯'}</div>
                <div class="mission-body">
                    <div class="mission-title-row">
                        <span class="mission-title">${m.title}</span>
                        <span class="mission-reward">+${m.exp} EXP</span>
                    </div>
                    <div class="mission-desc">${m.desc}</div>
                    <div class="mission-footer">
                        <div class="mission-progress-bar">
                            <div class="mission-progress-fill" style="width:${pct}%"></div>
                        </div>
                        <span class="mission-progress-text">${progressText}</span>
                    </div>
                </div>
            </div>
        `;
    },

    formatProgress: function(m, value) {
        const v = value || 0;
        switch(m.type || m.id) {
            case 'd_checkin':     return '미완';
            case 'perfect_score': return '도전 중';
            case 'time_any':
            case 'total_time': {
                const min = Math.floor(v / 60);
                const targetMin = Math.floor(m.target / 60);
                return `${min}분 / ${targetMin}분`;
            }
            case 'all_subjects':     return `${v} / ${m.target}과목`;
            case 'attendance_count': return `${v} / ${m.target}일`;
            case 'streak':           return `${v} / ${m.target}일`;
            case 'total_correct':    return `${v} / ${m.target}개`;
            default:                 return `${v} / ${m.target}`;
        }
    }
};

window.MissionManager = MissionManager;

/**
 * missions.js - 미션 및 업적 관리 시스템
 * ============================================================
 */

const MissionManager = {
    // 미션 정의
    DEFINITIONS: {
        daily: [
            { id: 'd_checkin', title: '오늘의 시작', desc: '오늘 앱에 접속하기', target: 1, exp: 20 },
            { id: 'd_study_15', title: '열정 학습자', desc: '한 과목 15분 이상 학습하기', target: 900, exp: 50, type: 'time_any' },
            { id: 'd_all_subjects', title: '팔방미인', desc: '영어, 수학, 한자 모두 학습하기', target: 3, exp: 100, type: 'all_subjects' },
            { id: 'd_perfect_quiz', title: '퀴즈 마스터', desc: '퀴즈에서 100점 맞기', target: 1, exp: 50, type: 'perfect_score' }
        ],
        weekly: [
            { id: 'w_attendance_5', title: '성실한 일주일', desc: '이번 주 5일 이상 출석하기', target: 5, exp: 200, type: 'attendance_count' },
            { id: 'w_total_time_3h', title: '공부 벌레', desc: '주간 총 학습 시간 3시간 달성', target: 10800, exp: 300, type: 'total_time' }
        ],
        achievements: [
            { id: 'a_streak_7', title: '7일 연속 출석', desc: '일주일 내내 쉬지 않고 공부했어요!', target: 7, exp: 500, type: 'streak' },
            { id: 'a_total_correct_1000', title: '천재의 탄생', desc: '누적 정답 수 1,000개 돌파', target: 1000, exp: 1000, type: 'total_correct' }
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

        let html = '<div class="mission-list">';
        
        // 일일 미션 섹션
        html += '<h3 class="mission-section-title">📅 오늘의 미션</h3>';
        this.DEFINITIONS.daily.forEach(m => {
            const prog = user.missionProgress.daily[m.id] || { progress: 0, completed: false };
            const pct = Math.min(100, Math.round((prog.progress / m.target) * 100));
            html += this.generateMissionItemHtml(m, prog, pct);
        });

        // 주간 미션 섹션
        html += '<h3 class="mission-section-title" style="margin-top:20px;">📆 이번 주 미션</h3>';
        this.DEFINITIONS.weekly.forEach(m => {
            const prog = user.missionProgress.weekly[m.id] || { progress: 0, completed: false };
            const pct = Math.min(100, Math.round((prog.progress / m.target) * 100));
            html += this.generateMissionItemHtml(m, prog, pct);
        });

        // 업적 섹션
        html += '<h3 class="mission-section-title" style="margin-top:20px;">🏆 명예의 전당</h3>';
        this.DEFINITIONS.achievements.forEach(m => {
            const prog = user.missionProgress.achievements[m.id] || { progress: 0, completed: false };
            const pct = Math.min(100, Math.round((prog.progress / m.target) * 100));
            html += this.generateMissionItemHtml(m, prog, pct);
        });

        html += '</div>';
        container.innerHTML = html;
    },

    generateMissionItemHtml: function(m, prog, pct) {
        const isDone = prog.completed;
        return `
            <div class="mission-item ${isDone ? 'completed' : ''}">
                <div class="mission-info">
                    <div class="mission-title">${m.title} ${isDone ? '✅' : ''}</div>
                    <div class="mission-desc">${m.desc}</div>
                </div>
                <div class="mission-reward">+${m.exp} EXP</div>
                <div class="mission-progress-bar">
                    <div class="mission-progress-fill" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    }
};

window.MissionManager = MissionManager;

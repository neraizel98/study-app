/* Stamps, streaks and badges derived from submitted-quiz evidence (MissionManager.evidence). Nothing new is stored. */
(function (root) {
    'use strict';
    const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

    function studyDays(user) {
        return new Set(root.MissionManager.evidence(user).map(e => e.date));
    }

    function currentStreak(days) {
        const cursor = new Date();
        if (!days.has(StudyPeriods.daily(cursor))) cursor.setDate(cursor.getDate() - 1);
        let streak = 0;
        while (days.has(StudyPeriods.daily(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }
        return streak;
    }

    function longestStreak(days) {
        let best = 0;
        for (const key of days) {
            const [y, m, d] = key.split('-').map(Number);
            const prev = new Date(y, m - 1, d - 1);
            if (days.has(StudyPeriods.daily(prev))) continue; // only count from the first day of a run
            let length = 0;
            const cursor = new Date(y, m - 1, d);
            while (days.has(StudyPeriods.daily(cursor))) { length++; cursor.setDate(cursor.getDate() + 1); }
            best = Math.max(best, length);
        }
        return best;
    }

    function weekStamps(days, date = new Date()) {
        const [y, m, d] = StudyPeriods.weekly(date).split('-').map(Number);
        const today = StudyPeriods.daily(date);
        return DAY_LABELS.map((label, i) => {
            const key = StudyPeriods.daily(new Date(y, m - 1, d + i));
            return { key, label, day: Number(key.slice(8)), stamped: days.has(key), isToday: key === today, isFuture: key > today };
        });
    }

    function bestWeek(days) {
        const perWeek = new Map();
        for (const key of days) {
            const [y, m, d] = key.split('-').map(Number);
            const week = StudyPeriods.weekly(new Date(y, m - 1, d));
            perWeek.set(week, (perWeek.get(week) || 0) + 1);
        }
        return Math.max(0, ...perWeek.values());
    }

    const BADGES = [
        { id: 'first_quiz', icon: 'star', title: '첫 도전', desc: '퀴즈 1회 끝까지 제출', test: s => s.quizzes >= 1 },
        { id: 'streak_3', icon: 'flame', title: '3일 연속', desc: '3일 연속 퀴즈 제출', test: s => s.longest >= 3 },
        { id: 'week_5', icon: 'calendar', title: '꾸준한 한 주', desc: '한 주에 5일 학습', test: s => s.bestWeek >= 5 },
        { id: 'quiz_10', icon: 'rosette', title: '퀴즈 10회', desc: '퀴즈 10회 제출', test: s => s.quizzes >= 10 },
        { id: 'explorer', icon: 'target-arrow', title: '7영역 탐험가', desc: '7개 영역 모두 퀴즈 제출', test: s => s.areas >= 7 },
        { id: 'streak_7', icon: 'flame', title: '7일 연속', desc: '7일 연속 퀴즈 제출', test: s => s.longest >= 7 },
        { id: 'quiz_50', icon: 'medal', title: '퀴즈 50회', desc: '퀴즈 50회 제출', test: s => s.quizzes >= 50 },
        { id: 'level_5', icon: 'trophy', title: '레벨 5', desc: '레벨 5 달성', test: s => s.level >= 5 },
        { id: 'streak_30', icon: 'sparkles', title: '한 달 습관', desc: '30일 연속 퀴즈 제출', test: s => s.longest >= 30 }
    ];

    function summary(user) {
        const evidence = root.MissionManager.evidence(user);
        const days = new Set(evidence.map(e => e.date));
        const stats = {
            quizzes: evidence.length,
            areas: new Set(evidence.map(e => e.subject)).size,
            longest: longestStreak(days),
            current: currentStreak(days),
            bestWeek: bestWeek(days),
            level: Number(user?.level) || 1
        };
        return {
            ...stats,
            week: weekStamps(days),
            badges: BADGES.map(b => ({ id: b.id, icon: b.icon, title: b.title, desc: b.desc, earned: b.test(stats) }))
        };
    }

    root.Achievements = { studyDays, currentStreak, longestStreak, weekStamps, summary, BADGES };
})(window);

'use strict';

function formatDuration(value) {
    const seconds = Math.max(0, Math.floor(Number(value) || 0));
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    if (!minutes) return `${remainder}초`;
    return remainder ? `${minutes}분 ${remainder}초` : `${minutes}분`;
}

function formatQuizNotification(learnerId, payload = {}) {
    const average = payload.previousThreeAverage == null
        ? '이전 기록 없음'
        : `이전 ${payload.previousAttemptCount || 3}회 평균 ${payload.previousThreeAverage}%`;
    return {
        title: `✅ ${learnerId} 퀴즈 완료`,
        body: `${payload.subjectName || payload.subject || '학습'} · ${payload.level || ''}\n`
            + `학습 ${formatDuration(payload.learningSeconds)} · 퀴즈 ${formatDuration(payload.quizSeconds)}\n`
            + `첫 회차 ${payload.initialScore || 0}/${payload.totalQuestions || 0} (${payload.initialScorePercent || 0}%) · ${average}`
    };
}

function formatStudyNotification(learnerId, payload = {}) {
    return {
        title: `📚 ${learnerId} 학습 시작`,
        body: `${payload.label || payload.subjectName || payload.subject || '학습'} 공부를 시작했습니다.`
    };
}

function hasStudyToday(user = {}, dateKey) {
    const daily = user.dailyStats || {};
    if (daily.date !== dateKey) return false;
    const maps = [daily.studyTime, daily.learningTime, daily.quizTime];
    return maps.some(map => Object.values(map || {}).some(value => Number(value) > 0));
}

module.exports = { formatDuration, formatQuizNotification, formatStudyNotification, hasStudyToday };

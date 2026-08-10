'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { formatDuration, formatQuizNotification, hasStudyToday } = require('./notification-format');

test('formats active seconds without counting idle time itself', () => {
    assert.equal(formatDuration(125), '2분 5초');
    assert.equal(formatDuration(-3), '0초');
});

test('quiz report includes initial score and previous average', () => {
    const result = formatQuizNotification('우준', {
        subjectName: '영어 문법', level: 'Lv. 2', learningSeconds: 610, quizSeconds: 95,
        initialScore: 9, totalQuestions: 10, initialScorePercent: 90,
        previousThreeAverage: 83, previousAttemptCount: 3
    });
    assert.match(result.body, /학습 10분 10초/);
    assert.match(result.body, /퀴즈 1분 35초/);
    assert.match(result.body, /첫 회차 9\/10 \(90%\)/);
    assert.match(result.body, /이전 3회 평균 83%/);
});

test('night reminder treats either learning or quiz time as study', () => {
    assert.equal(hasStudyToday({ dailyStats: { date: '2026-08-10', learningTime: { grammar: 1 } } }, '2026-08-10'), true);
    assert.equal(hasStudyToday({ dailyStats: { date: '2026-08-10', quizTime: { math: 5 } } }, '2026-08-10'), true);
    assert.equal(hasStudyToday({ dailyStats: { date: '2026-08-09', studyTime: { math: 500 } } }, '2026-08-10'), false);
});

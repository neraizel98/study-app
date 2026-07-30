(function (root) {
    'use strict';

    const Keys = Object.freeze({
        activeUser: 'SmartStudy_ActiveUser',
        user: userId => `SmartStudy_UserData_${userId}`,
        reports: userId => `SmartVocab_Reports_${userId}`,
        wrongAnswers: userId => `SmartStudy_WrongAnswers_${userId}`,
        timerConfig: 'SmartStudy_MinStudyConfig',
        timerScores: userId => `SmartStudy_AdaptiveScores_${userId}`,
        timerTime: (userId, context, date) =>
            `SmartStudy_UnitTime_${userId}_${encodeURIComponent(context)}_${date}`,
        recentPassages: level => `SmartStudy_RecentPassages_${level}`,
        formulaLevels: 'MathFormula_SelectedLevels',
        backup: (key, timestamp = Date.now()) => `${key}.backup.${timestamp}`
    });

    root.SmartStudy = root.SmartStudy || {};
    root.SmartStudy.StorageKeys = Keys;
    if (typeof module !== 'undefined' && module.exports) module.exports = Keys;
})(typeof window !== 'undefined' ? window : globalThis);

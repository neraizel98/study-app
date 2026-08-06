(function (root) {
    'use strict';

    const CURRENT = Object.freeze({ user: 3, reports: 3, wrongAnswers: 3, timerConfig: 2, timerScores: 1 });
    const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
    const periodStats = () => ({ periodKey: '', studyTime: {}, subjectsStudied: [], scores: [], quizCount: 0 });
    const formulaTime = value => ({
        date: value?.date || '',
        studySeconds: Number(value?.studySeconds) || 0,
        quizSeconds: Number(value?.quizSeconds) || 0,
        totalStudySeconds: Number(value?.totalStudySeconds) || 0,
        totalQuizSeconds: Number(value?.totalQuizSeconds) || 0
    });

    const migrations = {
        user: {
            0: data => ({ ...data, schemaVersion: 1 }),
            1: data => ({
                ...data,
                monthlyStats: data.monthlyStats || periodStats(),
                missionProgress: data.missionProgress || { daily: {}, weekly: {}, monthly: {}, rewards: {} },
                schemaVersion: 2
            }),
            2: data => ({ ...data, formulaStudyTime: formulaTime(data.formulaStudyTime), schemaVersion: 3 })
        },
        reports: {
            0: data => ({ schemaVersion: 1, items: Array.isArray(data) ? data : (data?.items || []) }),
            1: data => ({
                schemaVersion: 2,
                items: (data.items || []).map(item => ({
                    ...item,
                    updatedAt: item.updatedAt || item.date || Date.now()
                }))
            }),
            2: data => ({
                schemaVersion: 3,
                items: (data.items || []).map(item => ({
                    ...item,
                    createdAt: item.createdAt || item.date || item.updatedAt || Date.now(),
                    updatedAt: item.updatedAt || item.date || Date.now(),
                    deviceId: item.deviceId || 'legacy'
                }))
            })
        },
        wrongAnswers: {
            0: data => ({ schemaVersion: 1, subjects: data?.subjects || data || {} }),
            1: data => ({ schemaVersion: 2, subjects: data.subjects || {} }),
            2: data => ({
                schemaVersion: 3,
                subjects: Object.fromEntries(Object.entries(data.subjects || {}).map(([subject, items]) => [subject,
                    (items || []).map(item => ({
                        ...item,
                        history: (item.history || []).map((entry, index) => ({
                            ...entry,
                            eventId: entry.eventId || [entry.sessionId || 'legacy', entry.round || index + 1, entry.questionId || item.wrongNoteId || item.word || item.hanja || item.type || index].join(':'),
                            createdAt: entry.createdAt || entry.date || item.date || Date.now(),
                            deviceId: entry.deviceId || item.deviceId || 'legacy'
                        }))
                    }))
                ]))
            })
        },
        timerConfig: {
            0: data => ({ ...data, schemaVersion: 1 }),
            1: data => ({ ...data, levels: data.levels || {}, schemaVersion: 2 })
        },
        timerScores: {
            0: data => ({ schemaVersion: 1, subjects: data?.subjects || data || {} })
        }
    };

    function migrate(kind, input) {
        if (!CURRENT[kind]) throw new Error(`Unknown schema kind: ${kind}`);
        let data = clone(input == null ? {} : input);
        let version = Number.isInteger(data?.schemaVersion) ? data.schemaVersion : 0;
        if (version > CURRENT[kind]) throw new Error(`Unsupported future ${kind} schema v${version}`);
        while (version < CURRENT[kind]) {
            const step = migrations[kind][version];
            if (!step) throw new Error(`Missing ${kind} migration v${version}`);
            const next = step(data);
            if (!next || next.schemaVersion !== version + 1) {
                throw new Error(`Invalid ${kind} migration v${version}`);
            }
            data = next;
            version = data.schemaVersion;
        }
        return data;
    }

    const API = { CURRENT, migrate, migrateUserData: data => migrate('user', data) };
    root.SmartStudy = root.SmartStudy || {};
    root.SmartStudy.SchemaMigrations = API;
    if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);

(function (root) {
    'use strict';

    const SmartStudy = root.SmartStudy = root.SmartStudy || {};
    const Keys = SmartStudy.StorageKeys;
    const Events = SmartStudy.StorageEvents;
    const Migrations = SmartStudy.SchemaMigrations;

    function parse(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw == null ? fallback : JSON.parse(raw);
        } catch (error) {
            console.warn(`[LocalRepository] Invalid JSON at ${key}`, error);
            return fallback;
        }
    }

    function write(key, value, event, payload) {
        localStorage.setItem(key, JSON.stringify(value));
        if (event) Events.publish(event, payload);
        return value;
    }

    function migrateAndPersist(kind, key, raw, unwrap = value => value) {
        const migrated = Migrations.migrate(kind, raw);
        const changed = JSON.stringify(migrated) !== JSON.stringify(raw);
        if (changed && raw != null) {
            localStorage.setItem(Keys.backup(key), JSON.stringify(raw));
            localStorage.setItem(key, JSON.stringify(migrated));
        }
        return unwrap(migrated);
    }

    const Repository = {
        getDeviceId() {
            let id = localStorage.getItem(Keys.deviceId);
            if (!id) {
                id = root.crypto?.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                localStorage.setItem(Keys.deviceId, id);
            }
            return id;
        },
        getActiveUser: () => localStorage.getItem(Keys.activeUser),
        setActiveUser(userId) {
            localStorage.setItem(Keys.activeUser, userId);
        },
        clearActiveUser() {
            localStorage.removeItem(Keys.activeUser);
        },
        getUser(userId) {
            const key = Keys.user(userId);
            const raw = parse(key, null);
            return raw == null ? null : migrateAndPersist('user', key, raw);
        },
        saveUser(user) {
            const migrated = Migrations.migrate('user', { ...user, _localUpdatedAt: Date.now() });
            return write(Keys.user(user.id), migrated, 'user:saved', { userId: user.id });
        },
        listReports(userId) {
            const key = Keys.reports(userId);
            return migrateAndPersist('reports', key, parse(key, []), value => value.items);
        },
        saveReports(userId, reports) {
            const now = Date.now();
            const deviceId = Repository.getDeviceId();
            const items = reports.map(item => ({ ...item, createdAt: item.createdAt || item.date || now, updatedAt: item.updatedAt || item.date || now, deviceId: item.deviceId || deviceId }));
            const envelope = Migrations.migrate('reports', { items });
            write(Keys.reports(userId), envelope, 'reports:saved', { userId });
            return items;
        },
        getWrongAnswers(userId) {
            const key = Keys.wrongAnswers(userId);
            return migrateAndPersist('wrongAnswers', key, parse(key, {}), value => value.subjects);
        },
        saveWrongAnswers(userId, wrongAnswers) {
            const envelope = Migrations.migrate('wrongAnswers', { subjects: wrongAnswers });
            write(Keys.wrongAnswers(userId), envelope, 'wrongAnswers:saved', { userId });
            return wrongAnswers;
        },
        getTimerConfig() {
            return migrateAndPersist('timerConfig', Keys.timerConfig, parse(Keys.timerConfig, {}));
        },
        saveTimerConfig(config) {
            const migrated = Migrations.migrate('timerConfig', config);
            return write(Keys.timerConfig, migrated, 'config:saved', {});
        },
        getTimerScores(userId) {
            return migrateAndPersist('timerScores', Keys.timerScores(userId), parse(Keys.timerScores(userId), {}), value => value.subjects);
        },
        saveTimerScores(userId, scores) {
            const envelope = Migrations.migrate('timerScores', { subjects: scores });
            write(Keys.timerScores(userId), envelope, 'timerScores:saved', { userId });
        },
        getNumber(key, fallback = 0) {
            const value = Number.parseInt(localStorage.getItem(key), 10);
            return Number.isFinite(value) ? value : fallback;
        },
        setNumber(key, value) {
            localStorage.setItem(key, String(value));
        },
        getPreference(key, fallback) {
            return parse(key, fallback);
        },
        setPreference(key, value) {
            return write(key, value, 'preference:saved', { key });
        },
        rawGet(key) {
            return localStorage.getItem(key);
        },
        rawSet(key, value) {
            localStorage.setItem(key, value);
        },
        keys() {
            return Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(Boolean);
        },
        clearAppData() {
            const prefixes = ['SmartStudy_', 'SmartVocab_', 'MathFormula_'];
            Repository.keys().filter(key => prefixes.some(prefix => key.startsWith(prefix)))
                .forEach(key => localStorage.removeItem(key));
        }
    };

    SmartStudy.LocalRepository = Repository;
    if (typeof module !== 'undefined' && module.exports) module.exports = Repository;
})(typeof window !== 'undefined' ? window : globalThis);

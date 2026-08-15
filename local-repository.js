(function (root) {
    'use strict';

    const SmartStudy = root.SmartStudy = root.SmartStudy || {};
    const Keys = SmartStudy.StorageKeys;
    const Events = SmartStudy.StorageEvents;
    const Migrations = SmartStudy.SchemaMigrations;
    const overflowMemory = new Map();

    function rawValue(key) {
        return overflowMemory.has(key) ? overflowMemory.get(key) : localStorage.getItem(key);
    }

    function isQuotaError(error) {
        return error?.name === 'QuotaExceededError'
            || error?.name === 'NS_ERROR_DOM_QUOTA_REACHED'
            || error?.code === 22
            || /quota/i.test(String(error?.message || ''));
    }

    function removeMigrationBackups() {
        const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(Boolean);
        keys.filter(key => key.includes('.backup.')).forEach(key => localStorage.removeItem(key));
        Array.from(overflowMemory.keys()).filter(key => key.includes('.backup.')).forEach(key => overflowMemory.delete(key));
    }

    function compactValue(key, value) {
        if (key.startsWith('SmartVocab_Reports_') && Array.isArray(value?.items)) {
            const detailStart = Math.max(0, value.items.length - 100);
            return {
                ...value,
                items: value.items.map((item, index) => index >= detailStart ? item : {
                    ...item,
                    metadata: item.metadata ? { ...item.metadata, attempts: undefined } : item.metadata,
                    wrongItems: undefined
                })
            };
        }
        if (key.startsWith('SmartStudy_WrongAnswers_') && value?.subjects) {
            return {
                ...value,
                subjects: Object.fromEntries(Object.entries(value.subjects).map(([subject, items]) => [subject,
                    (items || []).slice(-500).map(item => ({ ...item, history: (item.history || []).slice(-10) }))
                ]))
            };
        }
        return value;
    }

    function safeSetItem(key, value, { json = false } = {}) {
        const serialize = candidate => json ? JSON.stringify(candidate) : String(candidate);
        try {
            localStorage.setItem(key, serialize(value));
            overflowMemory.delete(key);
            return true;
        } catch (error) {
            if (!isQuotaError(error)) throw error;
        }

        // Schema backups are recovery-only and can duplicate several MB after
        // a migration. Remove them first, then retry the real current data.
        removeMigrationBackups();
        try {
            localStorage.setItem(key, serialize(value));
            overflowMemory.delete(key);
            return true;
        } catch (error) {
            if (!isQuotaError(error)) throw error;
        }

        if (json) {
            try {
                const compacted = compactValue(key, value);
                localStorage.setItem(key, serialize(compacted));
                overflowMemory.delete(key);
                console.warn(`[LocalRepository] Storage compacted at ${key}`);
                return true;
            } catch (error) {
                if (!isQuotaError(error)) throw error;
            }
        }

        // Keep the newest value available for the current session so the quiz
        // can continue and Firebase synchronization can still read/upload it.
        overflowMemory.set(key, serialize(value));
        console.warn(`[LocalRepository] Storage quota still exceeded at ${key}; keeping this session in memory for cloud sync.`);
        return true;
    }

    function parse(key, fallback) {
        try {
            const raw = rawValue(key);
            return raw == null ? fallback : JSON.parse(raw);
        } catch (error) {
            console.warn(`[LocalRepository] Invalid JSON at ${key}`, error);
            return fallback;
        }
    }

    function write(key, value, event, payload) {
        const saved = safeSetItem(key, value, { json: true });
        if (saved && event) Events.publish(event, payload);
        return value;
    }

    function migrateAndPersist(kind, key, raw, unwrap = value => value) {
        const migrated = Migrations.migrate(kind, raw);
        const changed = JSON.stringify(migrated) !== JSON.stringify(raw);
        if (changed && raw != null) {
            const rawJson = JSON.stringify(raw);
            // Only small backups are useful in localStorage. Large backups can
            // consume the entire quota and prevent the migrated value itself.
            if (rawJson.length <= 100 * 1024) safeSetItem(Keys.backup(key), rawJson);
            safeSetItem(key, migrated, { json: true });
        }
        return unwrap(migrated);
    }

    const Repository = {
        getDeviceId() {
            let id = rawValue(Keys.deviceId);
            if (!id) {
                id = root.crypto?.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                safeSetItem(Keys.deviceId, id);
            }
            return id;
        },
        getActiveUser: () => rawValue(Keys.activeUser),
        setActiveUser(userId) {
            safeSetItem(Keys.activeUser, userId);
        },
        clearActiveUser() {
            localStorage.removeItem(Keys.activeUser);
            overflowMemory.delete(Keys.activeUser);
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
            const value = Number.parseInt(rawValue(key), 10);
            return Number.isFinite(value) ? value : fallback;
        },
        setNumber(key, value) {
            safeSetItem(key, value);
        },
        getPreference(key, fallback) {
            return parse(key, fallback);
        },
        setPreference(key, value) {
            return write(key, value, 'preference:saved', { key });
        },
        rawGet(key) {
            return rawValue(key);
        },
        rawSet(key, value) {
            safeSetItem(key, value);
        },
        keys() {
            return Array.from(new Set([
                ...Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(Boolean),
                ...overflowMemory.keys()
            ]));
        },
        clearAppData() {
            const prefixes = ['SmartStudy_', 'SmartVocab_', 'MathFormula_'];
            Repository.keys().filter(key => prefixes.some(prefix => key.startsWith(prefix)))
                .forEach(key => {
                    localStorage.removeItem(key);
                    overflowMemory.delete(key);
                });
        }
    };

    SmartStudy.LocalRepository = Repository;
    // Clean up abandoned migration copies from interrupted older builds.
    removeMigrationBackups();
    if (typeof module !== 'undefined' && module.exports) module.exports = Repository;
})(typeof window !== 'undefined' ? window : globalThis);

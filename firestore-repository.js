(function (root) {
    'use strict';

    const ADMIN_UID = '우준아빠';
    const client = root.SmartStudy.FirebaseClient;
    const normalizeReports = reports => (reports || []).map(report => {
        const totalQuestions = Math.max(0, Math.floor(Number(report.totalQuestions) || 0));
        const clampScore = value => Math.min(totalQuestions, Math.max(0, Math.floor(Number(value) || 0)));
        return {
            ...report,
            totalQuestions,
            initialScore: clampScore(report.initialScore),
            finalScore: clampScore(report.finalScore)
        };
    });
    const refs = async userId => {
        const db = await client.getDB();
        const user = db.collection('users').doc(userId);
        const data = user.collection('data');
        return { db, user, reports: data.doc('reports'), wrongAnswers: data.doc('wrongAnswers') };
    };

    const Repository = {
        async getLearnerPlanSettings(userId) {
            const db = await client.getDB();
            const snap = await db.collection('learnerPlanSettings').doc(userId).get();
            return snap.exists ? snap.data() : null;
        },
        async saveLearnerPlanSettings(userId, settings) {
            const authUser = await client.getCurrentUser();
            if (!authUser) throw Object.assign(new Error('Google 로그인이 필요합니다.'), { code: 'auth/login-required' });
            const access = await this.getAccess(authUser.uid);
            if (access?.role !== 'admin') throw Object.assign(new Error('관리자 권한이 필요합니다.'), { code: 'permission-denied' });
            const budgetMinutes = Number(settings?.budgetMinutes);
            const grade = Number(settings?.grade);
            const semester = Number(settings?.semester);
            const scopes = settings?.scopes;
            const validId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(value);
            const sameKeys = (value, expected) => Object.keys(value || {}).sort().join('|') === expected.slice().sort().join('|');
            const validScope = (subject, scope) => scope && (scope.mode === 'auto'
                ? sameKeys(scope, ['mode'])
                : scope.mode === 'assigned' && validId(scope.unitId)
                    && (subject === 'english' ? sameKeys(scope, ['mode', 'unitId'])
                        : subject === 'reading' ? sameKeys(scope, ['mode', 'levelId', 'unitId']) && validId(scope.levelId)
                            : sameKeys(scope, ['mode', 'levelId', 'semesterId', 'unitId']) && validId(scope.levelId)
                                && ['1', '2'].includes(String(scope.semesterId))));
            if (![30, 45, 60].includes(budgetMinutes) || !Number.isInteger(grade) || grade < 1 || grade > 12
                || ![1, 2].includes(semester) || !scopes || !['reading','english','math'].every(subject => validScope(subject, scopes[subject]))) {
                throw new Error('학습 계획 설정값이 올바르지 않습니다.');
            }
            const db = await client.getDB();
            return db.collection('learnerPlanSettings').doc(userId).set({
                budgetMinutes, grade, semester,
                scopes: Object.fromEntries(['reading','english','math'].map(subject => [subject, {
                    mode: scopes[subject].mode,
                    ...(scopes[subject].mode === 'assigned' ? {
                        unitId: scopes[subject].unitId,
                        ...(scopes[subject].levelId ? { levelId: scopes[subject].levelId } : {}),
                        ...(scopes[subject].semesterId ? { semesterId: String(scopes[subject].semesterId) } : {})
                    } : {})
                }])),
                updatedAt: root.firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: authUser.uid
            }, { mergeFields: ['budgetMinutes', 'grade', 'semester', 'scopes', 'updatedAt', 'updatedBy'] });
        },
        async getUserBundle(userId) {
            const r = await refs(userId);
            const [user, reports, wrongAnswers] = await Promise.all([
                r.user.get(), r.reports.get(), r.wrongAnswers.get()
            ]);
            return {
                user: user.exists ? user.data() : null,
                reports: reports.exists ? normalizeReports(reports.data().reports || []) : null,
                wrongAnswers: wrongAnswers.exists ? wrongAnswers.data().wrongAnswers || {} : null
            };
        },
        async putUser(userId, data) {
            const r = await refs(userId);
            return r.user.set({ ...data, _updatedAt: Date.now() }, { merge: true });
        },
        async putReports(userId, reports) {
            const r = await refs(userId);
            return r.reports.set({ reports: normalizeReports(reports), _updatedAt: Date.now() });
        },
        async putWrongAnswers(userId, wrongAnswers) {
            const r = await refs(userId);
            return r.wrongAnswers.set({ wrongAnswers, _updatedAt: Date.now() });
        },
        async getStudyTimeConfig() {
            const r = await refs(ADMIN_UID);
            const snap = await r.user.get();
            return snap.exists ? snap.data().studyTimeConfig || null : null;
        },
        async saveStudyTimeConfig(config) {
            const r = await refs(ADMIN_UID);
            return r.user.set({ studyTimeConfig: config }, { merge: true });
        },
        async listLearners() {
            const db = await client.getDB();
            const snap = await db.collection('users').get();
            const result = [];
            snap.forEach(doc => result.push({ userId: doc.id, ...doc.data() }));
            return result;
        },
        async markRewardUsed(userId, rewards) {
            const r = await refs(userId);
            return r.user.update({ 'missionProgress.rewards': rewards, _updatedAt: Date.now() });
        },
        async getAccess(uid) {
            const db = await client.getDB();
            const snap = await db.collection('access').doc(uid).get();
            return snap.exists ? snap.data() : null;
        },
        async createStudyRequest(learnerId) {
            const authUser = await client.getCurrentUser();
            if (!authUser) throw new Error('Google 로그인이 필요합니다.');
            const access = await this.getAccess(authUser.uid);
            if (access?.role !== 'admin') throw Object.assign(new Error('관리자 권한이 필요합니다.'), { code: 'permission-denied' });
            const db = await client.getDB(), ref = db.collection('learnerStudyRequests').doc(learnerId);
            const requestId = `request-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            await ref.set({ learnerId, requestId, requestedAt: root.firebase.firestore.FieldValue.serverTimestamp(), requestedBy: authUser.uid, status: 'pending' });
            return requestId;
        },
        watchStudyRequest(learnerId, next, error) {
            return client.getDB().then(db => db.collection('learnerStudyRequests').doc(learnerId)
                .onSnapshot(snap => next(snap.exists ? snap.data() : null), error));
        },
        watchLearnerActivity(learnerId, next, error) {
            return client.getDB().then(db => db.collection('learnerActivity').doc(learnerId)
                .onSnapshot(snap => next(snap.exists ? snap.data() : null), error));
        },
        async recordActualStudyStart(learnerId, event) {
            const authUser = await client.getCurrentUser();
            if (!authUser || !learnerId) return { recorded: false };
            const db = await client.getDB(), activityRef = db.collection('learnerActivity').doc(learnerId);
            const requestRef = db.collection('learnerStudyRequests').doc(learnerId);
            const eventStartedAt = Number(event?.startedAt || Date.now());
            const activityId = String(event?.activityId || `${event?.source || 'study'}-${eventStartedAt}`);
            return db.runTransaction(async transaction => {
                const [activitySnap, requestSnap] = await Promise.all([transaction.get(activityRef), transaction.get(requestRef)]);
                if (activitySnap.exists && activitySnap.data().activityId === activityId) return { recorded: false, duplicate: true };
                const request = requestSnap.exists ? requestSnap.data() : null;
                const requestMillis = request?.requestedAt?.toMillis?.() || 0;
                const acknowledge = request?.status === 'pending' && eventStartedAt >= requestMillis;
                transaction.set(activityRef, {
                    learnerId, activityId, source: String(event?.source || 'study').slice(0, 40),
                    ...(event?.subject ? { subject: String(event.subject).slice(0, 40) } : {}),
                    occurredAt: root.firebase.firestore.Timestamp.fromMillis(eventStartedAt),
                    startedAt: root.firebase.firestore.FieldValue.serverTimestamp(), startedBy: authUser.uid
                });
                if (acknowledge) transaction.update(requestRef, {
                    status: 'started', startedAt: root.firebase.firestore.FieldValue.serverTimestamp(), startedBy: authUser.uid
                });
                return { recorded: true, acknowledged: acknowledge, requestId: acknowledge ? request.requestId : null };
            });
        },
        async saveNotificationDevice(deviceId, data) {
            const db = await client.getDB();
            return db.collection('notificationDevices').doc(deviceId).set({
                ...data,
                updatedAt: root.firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        },
        async removeNotificationDevice(deviceId) {
            const db = await client.getDB();
            return db.collection('notificationDevices').doc(deviceId).delete();
        },
        async createNotificationEvent(eventId, data) {
            const db = await client.getDB();
            return db.collection('notificationEvents').doc(eventId).set({
                ...data,
                createdAt: root.firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });
        },
        getDB: () => client.getDB()
    };

    root.SmartStudy.FirestoreRepository = Repository;
})(window);

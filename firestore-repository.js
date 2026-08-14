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

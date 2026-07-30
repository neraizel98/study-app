(function (root) {
    'use strict';

    const ADMIN_UID = '우준아빠';
    const client = root.SmartStudy.FirebaseClient;
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
                reports: reports.exists ? reports.data().reports || [] : null,
                wrongAnswers: wrongAnswers.exists ? wrongAnswers.data().wrongAnswers || {} : null
            };
        },
        async putUser(userId, data) {
            const r = await refs(userId);
            return r.user.set({ ...data, _updatedAt: Date.now() }, { merge: true });
        },
        async putReports(userId, reports) {
            const r = await refs(userId);
            return r.reports.set({ reports, _updatedAt: Date.now() });
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
        getDB: () => client.getDB()
    };

    root.SmartStudy.FirestoreRepository = Repository;
})(window);

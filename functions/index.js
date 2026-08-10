'use strict';

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');
const { formatQuizNotification, formatStudyNotification, hasStudyToday } = require('./notification-format');

initializeApp();
const db = getFirestore();

function kstDateKey(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(date);
}

async function deviceDocuments(role, learnerId) {
    const snapshot = await db.collection('notificationDevices').where('role', '==', role).get();
    return snapshot.docs.filter(doc => {
        const device = doc.data();
        if (!device.enabled || !device.token) return false;
        return role === 'learner'
            ? device.learnerId === learnerId
            : Array.isArray(device.learnerIds) && device.learnerIds.includes(learnerId);
    });
}

async function sendToDevices(documents, message, eventId, url = './index.html') {
    if (!documents.length) return { sent: 0, failed: 0 };
    const response = await getMessaging().sendEachForMulticast({
        tokens: documents.map(doc => doc.data().token),
        data: { title: message.title, body: message.body, eventId, url },
        webpush: { fcmOptions: { link: url } }
    });
    const invalidCodes = new Set([
        'messaging/registration-token-not-registered',
        'messaging/invalid-registration-token'
    ]);
    await Promise.all(response.responses.map((result, index) => {
        if (!result.success && invalidCodes.has(result.error?.code)) return documents[index].ref.delete();
        return null;
    }));
    return { sent: response.successCount, failed: response.failureCount };
}

async function claimDelivery(deliveryId, details) {
    const ref = db.collection('notificationDeliveries').doc(deliveryId);
    return db.runTransaction(async transaction => {
        const snapshot = await transaction.get(ref);
        if (snapshot.exists) return false;
        transaction.create(ref, { ...details, status: 'processing', createdAt: FieldValue.serverTimestamp() });
        return true;
    });
}

exports.onNotificationEvent = onDocumentCreated({
    document: 'notificationEvents/{eventId}',
    region: 'asia-northeast3'
}, async event => {
    const snapshot = event.data;
    if (!snapshot) return;
    const data = snapshot.data();
    const learnerId = data.learnerId;
    const eventId = event.params.eventId;
    if (!learnerId || !['study_started', 'quiz_completed'].includes(data.type)) return;
    if (!await claimDelivery(`event-${eventId}`, { type: data.type, learnerId })) return;

    const deliveryRef = db.collection('notificationDeliveries').doc(`event-${eventId}`);
    try {
        const devices = await deviceDocuments('guardian', learnerId);
        const message = data.type === 'quiz_completed'
            ? formatQuizNotification(learnerId, data.payload)
            : formatStudyNotification(learnerId, data.payload);
        const result = await sendToDevices(devices, message, eventId, './admin.html');
        await deliveryRef.update({ status: 'sent', ...result, completedAt: FieldValue.serverTimestamp() });
        await snapshot.ref.update({ status: 'processed', processedAt: FieldValue.serverTimestamp() });
    } catch (error) {
        await deliveryRef.delete().catch(() => {});
        await snapshot.ref.update({ status: 'failed', error: String(error.message || error).slice(0, 300) });
        logger.error('Notification event failed', { eventId, learnerId, error });
        throw error;
    }
});

exports.sendNightlyStudyReminder = onSchedule({
    schedule: '0 21 * * *',
    timeZone: 'Asia/Seoul',
    region: 'asia-northeast3'
}, async () => {
    const today = kstDateKey();
    const snapshot = await db.collection('notificationDevices').where('role', '==', 'learner').get();
    const learnerIds = [...new Set(snapshot.docs
        .map(doc => doc.data())
        .filter(device => device.enabled && device.learnerId)
        .map(device => device.learnerId))];

    for (const learnerId of learnerIds) {
        const user = await db.collection('users').doc(learnerId).get();
        if (user.exists && hasStudyToday(user.data(), today)) continue;
        const deliveryId = `night-${today}-${learnerId}`;
        if (!await claimDelivery(deliveryId, { type: 'night_reminder', learnerId, date: today })) continue;
        const deliveryRef = db.collection('notificationDeliveries').doc(deliveryId);
        try {
            const devices = await deviceDocuments('learner', learnerId);
            const result = await sendToDevices(devices, {
                title: '⏰ 오늘 공부가 아직 없어요',
                body: `${learnerId}, 오늘 학습 기록이 없습니다. 짧게라도 공부를 시작해 볼까요?`
            }, deliveryId, './index.html');
            await deliveryRef.update({ status: 'sent', ...result, completedAt: FieldValue.serverTimestamp() });
        } catch (error) {
            await deliveryRef.delete().catch(() => {});
            logger.error('Night reminder failed', { learnerId, error });
            throw error;
        }
    }
});

exports._test = { kstDateKey };

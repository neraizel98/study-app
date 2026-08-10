(function (root) {
    'use strict';

    const SmartStudy = root.SmartStudy = root.SmartStudy || {};
    const ROLE_KEY = 'SmartStudy_NotificationRole';
    const TOKEN_KEY = 'SmartStudy_NotificationToken';
    const LAST_START_KEY = 'SmartStudy_LastStartNotification';
    const client = SmartStudy.FirebaseClient;
    const repository = SmartStudy.FirestoreRepository;
    let foregroundBound = false;
    let fallbackDeviceId = '';

    function getPreference(key, fallback = null) {
        return SmartStudy.LocalRepository?.getPreference?.(key, fallback) ?? fallback;
    }

    function setPreference(key, value) {
        SmartStudy.LocalRepository?.setPreference?.(key, value);
    }

    function activeLearner() {
        return root.UserSession?.getActiveUser?.() || SmartStudy.LocalRepository?.getActiveUser?.() || '';
    }

    function deviceId() {
        return SmartStudy.LocalRepository?.getDeviceId?.()
            || (fallbackDeviceId ||= `device-${Date.now()}`);
    }

    function roleLabel(role) {
        return role === 'guardian' ? '관리자 알림' : role === 'learner' ? '우준이 알림' : '알림 설정';
    }

    function updateButtons() {
        const role = getPreference(ROLE_KEY);
        document.querySelectorAll('.notification-settings-btn').forEach(button => {
            button.textContent = Notification.permission === 'granted' && role
                ? `🔔 ${roleLabel(role)} 켜짐`
                : '🔔 알림 설정';
        });
    }

    async function accessFor(user) {
        const access = await repository.getAccess(user.uid);
        if (!access) throw new Error('이 Google 계정에 등록된 접근 권한이 없습니다.');
        return access;
    }

    async function register(role) {
        if (!['learner', 'guardian'].includes(role)) throw new Error('알림 기기 역할이 올바르지 않습니다.');
        if (!client || !repository) throw new Error('Firebase 연결 모듈을 불러오지 못했습니다.');
        const user = await client.getCurrentUser();
        if (!user) throw new Error('먼저 Google 계정을 연결해 주세요.');
        const access = await accessFor(user);
        const learnerId = activeLearner();
        const learnerIds = Array.isArray(access.learnerIds) ? access.learnerIds : [];
        if (role === 'learner' && (!learnerId || (!learnerIds.includes(learnerId) && access.role !== 'admin'))) {
            throw new Error('현재 학습자를 이 계정으로 관리할 권한이 없습니다.');
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') throw new Error('브라우저 알림 권한이 허용되지 않았습니다.');
        const registration = await navigator.serviceWorker.register('./service-worker.js');
        await navigator.serviceWorker.ready;
        const messaging = await client.getMessaging();
        const token = await messaging.getToken({ serviceWorkerRegistration: registration });
        if (!token) throw new Error('알림 기기 토큰을 만들지 못했습니다.');

        await repository.saveNotificationDevice(deviceId(), {
            token,
            authUid: user.uid,
            role,
            learnerId: role === 'learner' ? learnerId : null,
            learnerIds: role === 'guardian' ? learnerIds : [learnerId],
            enabled: true,
            userAgent: navigator.userAgent.slice(0, 300)
        });
        setPreference(ROLE_KEY, role);
        setPreference(TOKEN_KEY, token);
        bindForeground(messaging);
        updateButtons();
        return role;
    }

    async function disable() {
        if (client && repository) {
            const user = await client.getCurrentUser();
            if (user) await repository.removeNotificationDevice(deviceId());
        }
        setPreference(ROLE_KEY, null);
        setPreference(TOKEN_KEY, null);
        updateButtons();
    }

    function bindForeground(messaging) {
        if (foregroundBound || !messaging?.onMessage) return;
        foregroundBound = true;
        messaging.onMessage(payload => {
            const notification = payload.notification || payload.data || {};
            if (Notification.permission === 'granted') {
                new Notification(notification.title || 'Smart Study', {
                    body: notification.body || '',
                    icon: './icons/icon-192.png',
                    tag: payload.data?.eventId || undefined
                });
            }
        });
    }

    async function restore() {
        if (Notification.permission !== 'granted' || !getPreference(ROLE_KEY)) return;
        try {
            const messaging = await client.getMessaging();
            bindForeground(messaging);
        } catch (error) {
            console.warn('[Notifications] restore failed:', error.message);
        }
    }

    async function createEvent(type, payload, eventId) {
        try {
            const user = await client?.getCurrentUser?.();
            const learnerId = payload.learnerId || activeLearner();
            if (!user || !learnerId || !repository) return false;
            await repository.createNotificationEvent(eventId, {
                type,
                learnerId,
                authUid: user.uid,
                originDeviceId: deviceId(),
                payload
            });
            return true;
        } catch (error) {
            if (!String(error.code || '').includes('already-exists')) {
                console.warn(`[Notifications] ${type} event failed:`, error.message);
            }
            return false;
        }
    }

    function showSetup() {
        let modal = document.getElementById('notificationSetupModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'notificationSetupModal';
            modal.innerHTML = `
                <div class="notification-setup-card" role="dialog" aria-modal="true" aria-labelledby="notificationSetupTitle">
                    <h3 id="notificationSetupTitle">🔔 이 기기의 알림 용도</h3>
                    <p>이 기기에서 받을 알림을 선택하세요.</p>
                    <button type="button" data-notification-role="learner">👦 우준이 기기<br><small>오후 9시 학습 알림 받기</small></button>
                    <button type="button" data-notification-role="guardian">👨‍👩‍👦 관리자 기기<br><small>학습 시작·퀴즈 완료 보고 받기</small></button>
                    <button type="button" data-notification-disable>알림 끄기</button>
                    <button type="button" data-notification-close>닫기</button>
                </div>`;
            document.body.appendChild(modal);
            modal.addEventListener('click', async event => {
                if (event.target === modal || event.target.closest('[data-notification-close]')) {
                    modal.classList.remove('open');
                    return;
                }
                const roleButton = event.target.closest('[data-notification-role]');
                const disableButton = event.target.closest('[data-notification-disable]');
                try {
                    if (roleButton) {
                        roleButton.disabled = true;
                        await register(roleButton.dataset.notificationRole);
                        alert(`${roleLabel(roleButton.dataset.notificationRole)}이 설정되었습니다.`);
                        modal.classList.remove('open');
                    } else if (disableButton) {
                        await disable();
                        modal.classList.remove('open');
                    }
                } catch (error) {
                    alert(`알림 설정에 실패했습니다.\n${error.message}`);
                } finally {
                    if (roleButton) roleButton.disabled = false;
                }
            });
        }
        modal.classList.add('open');
    }

    function injectButton() {
        let buttons = [...document.querySelectorAll('.notification-settings-btn')];
        if (!buttons.length) {
            const header = document.querySelector('.header-actions, .app-header-actions, #app-header');
            if (!header) return;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'notification-settings-btn';
            header.appendChild(button);
            buttons = [button];
        }
        buttons.forEach(button => {
            if (button.dataset.notificationBound === 'true') return;
            button.dataset.notificationBound = 'true';
            button.addEventListener('click', showSetup);
        });
        updateButtons();
    }

    SmartStudy.StorageEvents?.subscribe('study:active-start', payload => {
        if (getPreference(ROLE_KEY) !== 'learner') return;
        const lastStart = Number(getPreference(LAST_START_KEY, 0)) || 0;
        if (Date.now() - lastStart < 15 * 60 * 1000) return;
        setPreference(LAST_START_KEY, Date.now());
        const eventId = `study-${deviceId()}-${payload.startedAt || Date.now()}`;
        createEvent('study_started', { ...payload, learnerId: activeLearner() }, eventId);
    });
    SmartStudy.StorageEvents?.subscribe('quiz:completed', payload => {
        if (getPreference(ROLE_KEY) !== 'learner') return;
        createEvent('quiz_completed', payload, `quiz-${payload.learnerId}-${payload.sessionId}`);
    });

    document.addEventListener('DOMContentLoaded', () => {
        injectButton();
        restore();
        root.addEventListener('smartstudy:ready', injectButton);
        root.addEventListener('firesynced', injectButton);
    });

    SmartStudy.NotificationClient = { register, disable, showSetup, createEvent };
})(window);

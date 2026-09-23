(function (root) {
    'use strict';

    const SmartStudy = root.SmartStudy = root.SmartStudy || {};
    const ROLE_KEY = 'SmartStudy_NotificationRole';
    const TOKEN_KEY = 'SmartStudy_NotificationToken';
    const OWNER_KEY = 'SmartStudy_NotificationOwnerUid';
    const client = SmartStudy.FirebaseClient;
    const repository = SmartStudy.FirestoreRepository;
    let foregroundBound = false;
    let fallbackDeviceId = '';
    let setupGeneration = 0;

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
        return role === 'guardian' ? '관리자 알림' : role === 'learner' ? '학습자 알림' : '알림 설정';
    }

    function inAppStatus() {
        return SmartStudy.InAppStudyRequest?.getStatus?.() || { state:'checking', message:'연결 확인 중' };
    }

    function updateButtons() {
        const role = getPreference(ROLE_KEY);
        const appStatus = inAppStatus();
        document.querySelectorAll('.notification-settings-btn').forEach(button => {
            const enabled = root.Notification?.permission === 'granted' && role;
            button.textContent = '🔔 알림';
            button.dataset.notificationState = appStatus.state;
            const appLabel=appStatus.state==='on'?'앱 안 알림 켜짐':appStatus.state==='error'?'앱 안 알림 연결 확인 필요':'앱 안 알림 상태 확인 중';
            button.setAttribute('aria-label', `${appLabel}. ${enabled?`${roleLabel(role)} 휴대폰 푸시 준비됨`:'휴대폰 푸시 꺼짐'}. 알림 설정 열기`);
        });
    }

    async function accessFor(user) {
        const access = await repository.getAccess(user.uid);
        if (!access) throw new Error('이 Google 계정에 등록된 접근 권한이 없습니다.');
        return access;
    }

    async function resolveRole() {
        if (!client || !repository) throw new Error('Firebase 연결 모듈을 불러오지 못했습니다.');
        const user = await client.getCurrentUser();
        if (!user) throw new Error('먼저 Google 계정을 연결해 주세요.');
        const access = await accessFor(user), learnerId = activeLearner();
        const learnerIds = Array.isArray(access.learnerIds) ? access.learnerIds : [];
        if (access.role === 'admin' && learnerId === '우준아빠') return { role:'guardian', user, access, learnerId, learnerIds };
        if (learnerId && learnerId !== '우준아빠' && (access.role === 'admin' || learnerIds.includes(learnerId)))
            return { role:'learner', user, access, learnerId, learnerIds };
        throw new Error('현재 프로필과 Google 계정 권한을 확인해 주세요.');
    }

    async function register(role) {
        if (!['learner', 'guardian'].includes(role)) throw new Error('알림 기기 역할이 올바르지 않습니다.');
        const resolved=await resolveRole();
        if(resolved.role!==role)throw new Error('현재 계정에 허용된 알림 역할과 다릅니다.');
        const {user,learnerId,learnerIds}=resolved;

        if(!root.Notification?.requestPermission)throw new Error('이 브라우저는 휴대폰 푸시 알림을 지원하지 않습니다.');
        const permission = await root.Notification.requestPermission();
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
        setPreference(OWNER_KEY, user.uid);
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
        setPreference(OWNER_KEY, null);
        updateButtons();
    }

    function bindForeground(messaging) {
        if (foregroundBound || !messaging?.onMessage) return;
        foregroundBound = true;
        messaging.onMessage(payload => {
            const notification = payload.notification || payload.data || {};
            if (root.Notification?.permission === 'granted') {
                new root.Notification(notification.title || 'Smart Study', {
                    body: notification.body || '',
                    icon: './icons/icon-192.png',
                    tag: payload.data?.eventId || undefined
                });
            }
        });
    }

    async function restore() {
        if (root.Notification?.permission !== 'granted' || !getPreference(ROLE_KEY)) return;
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

    function renderInAppStatus(modal, role) {
        const line=modal.querySelector('[data-in-app-status]'),current=inAppStatus();
        if(role==='guardian'&&current.state==='off')line.textContent='앱 안 알림: 기본 켜짐 · 관리자 화면을 열면 요청/시작 상태를 연결합니다.';
        else if(current.state==='on')line.textContent='앱 안 알림: 켜짐 · 현재 서버 상태에 연결되었습니다.';
        else if(current.state==='error')line.textContent='앱 안 알림: 연결 확인 필요 · 계정 연결과 네트워크를 확인해 주세요.';
        else line.textContent=`앱 안 알림: ${current.message||'연결 확인 중'}`;
        line.dataset.state=current.state;
    }

    async function showSetup() {
        const currentGeneration=++setupGeneration;
        let modal = document.getElementById('notificationSetupModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'notificationSetupModal';
            modal.innerHTML = `
                <div class="notification-setup-card" role="dialog" aria-modal="true" aria-labelledby="notificationSetupTitle">
                    <h3 id="notificationSetupTitle">🔔 알림 상태</h3>
                    <p data-in-app-status>앱 안 알림: 연결 확인 중</p>
                    <p data-role-status>Google 계정 권한을 확인하는 중입니다.</p>
                    <div data-role-action></div>
                    <p data-push-status></p>
                    <button type="button" data-notification-disable hidden>휴대폰 푸시 끄기</button>
                    <button type="button" data-notification-close>닫기</button>
                </div>`;
            document.body.appendChild(modal);
            modal.addEventListener('click', async event => {
                if (event.target === modal || event.target.closest('[data-notification-close]')) {
                    setupGeneration++;
                    modal.classList.remove('open');
                    return;
                }
                const roleButton = event.target.closest('[data-notification-role]');
                const disableButton = event.target.closest('[data-notification-disable]');
                try {
                    if (roleButton) {
                        roleButton.disabled = true;
                        await register(roleButton.dataset.notificationRole);
                        alert(`${roleLabel(roleButton.dataset.notificationRole)} 휴대폰 푸시가 준비되었습니다. 현재 서버 발송 기능은 연결되어 있지 않습니다.`);
                        await showSetup();
                    } else if (disableButton) {
                        await disable();
                        await showSetup();
                    }
                } catch (error) {
                    alert(`알림 설정에 실패했습니다.\n${error.message}`);
                } finally {
                    if (roleButton) roleButton.disabled = false;
                }
            });
        }
        modal.classList.add('open');
        const roleStatus=modal.querySelector('[data-role-status]'),roleAction=modal.querySelector('[data-role-action]');
        const pushStatus=modal.querySelector('[data-push-status]'),disableButton=modal.querySelector('[data-notification-disable]');
        roleStatus.textContent='Google 계정 권한을 확인하는 중입니다.';roleAction.replaceChildren();
        pushStatus.textContent='휴대폰 푸시 상태 확인 중';disableButton.hidden=true;
        try{
            const resolved=await resolveRole();
            const confirmedUser=await client.getCurrentUser();
            if(currentGeneration!==setupGeneration||confirmedUser?.uid!==resolved.user.uid||!modal.classList.contains('open')||activeLearner()!==resolved.learnerId)return;
            roleStatus.textContent=`현재 역할: ${roleLabel(resolved.role)}`;
            const button=document.createElement('button');button.type='button';button.dataset.notificationRole=resolved.role;
            button.append(document.createTextNode(`${resolved.role==='guardian'?'👨‍👩‍👦':'👦'} ${roleLabel(resolved.role)}`),document.createElement('br'));
            const small=document.createElement('small');small.textContent='선택적 휴대폰 푸시 준비 · 현재 서버 발송 미연결';button.append(small);roleAction.append(button);
            const hasToken=Boolean(getPreference(TOKEN_KEY)),sameOwner=getPreference(OWNER_KEY)===resolved.user.uid;
            const pushReady=root.Notification?.permission==='granted'&&getPreference(ROLE_KEY)===resolved.role&&hasToken&&sameOwner;
            pushStatus.textContent=pushReady?'휴대폰 푸시: 이 계정에서 준비됨 · 현재 서버 발송 미연결':hasToken&&!sameOwner?'휴대폰 푸시: 저장 계정을 확인할 수 없어 다시 설정해야 합니다.':'휴대폰 푸시: 꺼짐 · 앱 안 알림에는 영향 없음';
            disableButton.hidden=!hasToken;renderInAppStatus(modal,resolved.role);
        }catch(error){
            if(currentGeneration!==setupGeneration)return;
            roleStatus.textContent=`권한 확인 필요: ${error.message}`;
            pushStatus.textContent='휴대폰 푸시: 역할을 확인하기 전에는 설정할 수 없습니다.';
            renderInAppStatus(modal,null);
        }
        updateButtons();
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

    SmartStudy.StorageEvents?.subscribe('quiz:completed', payload => {
        if (getPreference(ROLE_KEY) !== 'learner') return;
        createEvent('quiz_completed', payload, `quiz-${payload.learnerId}-${payload.sessionId}`);
    });

    document.addEventListener('DOMContentLoaded', () => {
        injectButton();
        restore();
        root.addEventListener('smartstudy:ready', injectButton);
        root.addEventListener('firesynced', injectButton);
        root.addEventListener('smartstudy:in-app-notification-status',()=>{
            updateButtons();
            const modal=document.getElementById('notificationSetupModal');
            if(modal?.classList.contains('open'))renderInAppStatus(modal,modal.querySelector('[data-notification-role]')?.dataset.notificationRole||null);
        });
    });

    SmartStudy.NotificationClient = { register, disable, showSetup, createEvent, resolveRole };
})(window);

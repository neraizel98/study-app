(function (root) {
    'use strict';

    const firebaseConfig = root.SmartStudy?.FirebaseConfig;
    if (!firebaseConfig) throw new Error('firebase-config.js must load before firebase-client.js');
    const CONFIG = firebaseConfig.app;
    const SDK_URLS = [
        firebaseConfig.sdk.app,
        firebaseConfig.sdk.auth,
        firebaseConfig.sdk.firestore,
        firebaseConfig.sdk.messaging
    ];
    let promise = null;
    let authPromise = null;
    let redirectPromise = null;

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                if (root.firebase) return resolve();
                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', reject, { once: true });
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    const Client = {
        CONFIG,
        async getAuth() {
            await this.getDB();
            if (!authPromise) {
                const auth = root.firebase.auth();
                authPromise = auth.setPersistence(root.firebase.auth.Auth.Persistence.LOCAL)
                    .then(async () => {
                        // Complete a mobile redirect login before exposing the
                        // restored auth state to the rest of the application.
                        if (!redirectPromise) {
                            const redirectResult = auth.getRedirectResult().catch(error => {
                                if (error?.code !== 'auth/no-auth-event') throw error;
                                return null;
                            });
                            // Safari can leave the cross-origin redirect helper
                            // unresolved. Never let that block the whole app.
                            redirectPromise = Promise.race([
                                redirectResult,
                                new Promise(resolve => setTimeout(() => resolve(null), 4000))
                            ]);
                        }
                        await redirectPromise;
                        return auth;
                    })
                    .catch(error => {
                        authPromise = null;
                        throw error;
                    });
            }
            return authPromise;
        },
        async getCurrentUser() {
            const auth = await this.getAuth();
            if (auth.currentUser) return auth.currentUser;
            await new Promise(resolve => {
                let settled = false;
                let unsubscribe = () => {};
                let timeoutId = null;
                const finish = () => {
                    if (settled) return;
                    settled = true;
                    unsubscribe();
                    if (timeoutId) clearTimeout(timeoutId);
                    resolve();
                };
                unsubscribe = auth.onAuthStateChanged(finish, finish);
                timeoutId = setTimeout(finish, 5000);
            });
            return auth.currentUser;
        },
        async signInWithGoogle() {
            const auth = await this.getAuth();
            const provider = new root.firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            try {
                return await auth.signInWithPopup(provider);
            } catch (error) {
                // PC 브라우저·인앱 브라우저가 팝업을 막는 경우에는 같은 탭에서
                // 로그인한 뒤 앱으로 돌아오는 리다이렉트 방식으로 자동 전환한다.
                if (error && ['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment'].includes(error.code)) {
                    await auth.signInWithRedirect(provider);
                    return null;
                }
                throw error;
            }
        },
        async signOut() {
            const auth = await this.getAuth();
            return auth.signOut();
        },
        async getDB() {
            if (promise) return promise;
            promise = (async () => {
                for (const url of SDK_URLS) await loadScript(url);
                if (!root.firebase.apps.length) root.firebase.initializeApp(CONFIG);
                return root.firebase.firestore();
            })().catch(error => {
                promise = null;
                throw error;
            });
            return promise;
        },
        async getMessaging() {
            await this.getDB();
            if (!root.firebase.messaging.isSupported()) {
                throw new Error('이 브라우저는 웹 푸시 알림을 지원하지 않습니다.');
            }
            return root.firebase.messaging();
        }
    };

    root.SmartStudy = root.SmartStudy || {};
    root.SmartStudy.FirebaseClient = Client;
})(window);

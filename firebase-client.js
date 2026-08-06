(function (root) {
    'use strict';

    const CONFIG = Object.freeze({
        apiKey: "AIzaSyDQBCqKxumH-NOdAETKhY6_9xGX_AsVKWg",
        authDomain: "smart-study-wj.firebaseapp.com",
        projectId: "smart-study-wj",
        storageBucket: "smart-study-wj.firebasestorage.app",
        messagingSenderId: "994757323327",
        appId: "1:994757323327:web:c0f68e95bbeea72a12e68a"
    });
    const SDK_URLS = [
        'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
        'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js'
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
                            redirectPromise = auth.getRedirectResult().catch(error => {
                                if (error?.code !== 'auth/no-auth-event') throw error;
                                return null;
                            });
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
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
                || window.matchMedia?.('(display-mode: standalone)').matches;
            if (isMobile) {
                await auth.signInWithRedirect(provider);
                return null;
            }
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
        }
    };

    root.SmartStudy = root.SmartStudy || {};
    root.SmartStudy.FirebaseClient = Client;
})(window);

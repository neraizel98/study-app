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
            return root.firebase.auth();
        },
        async getCurrentUser() {
            const auth = await this.getAuth();
            if (auth.currentUser) return auth.currentUser;
            await new Promise(resolve => {
                let unsubscribe = () => {};
                unsubscribe = auth.onAuthStateChanged(() => { unsubscribe(); resolve(); });
                setTimeout(() => { unsubscribe(); resolve(); }, 2500);
            });
            return auth.currentUser;
        },
        async signInWithGoogle() {
            const auth = await this.getAuth();
            const provider = new root.firebase.auth.GoogleAuthProvider();
            return auth.signInWithPopup(provider);
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

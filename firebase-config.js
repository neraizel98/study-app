(function (root) {
    'use strict';
    root.SmartStudy = root.SmartStudy || {};
    root.SmartStudy.FirebaseConfig = Object.freeze({
        app: Object.freeze({
            apiKey: 'AIzaSyDQBCqKxumH-NOdAETKhY6_9xGX_AsVKWg',
            authDomain: 'smart-study-wj.firebaseapp.com',
            projectId: 'smart-study-wj',
            storageBucket: 'smart-study-wj.firebasestorage.app',
            messagingSenderId: '994757323327',
            appId: '1:994757323327:web:c0f68e95bbeea72a12e68a'
        }),
        sdk: Object.freeze({
            app: 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
            auth: 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
            firestore: 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js',
            messaging: 'https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js'
        })
    });
})(typeof self !== 'undefined' ? self : window);

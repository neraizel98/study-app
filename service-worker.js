/**
 * Service Worker - 스마트 학습 앱 오프라인 캐시
 * ============================================================
 */

const CACHE_NAME = 'smart-study-v4';

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
    // 구버전 캐시 삭제
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 캐시할 파일 목록 (앱 핵심 파일)
const STATIC_ASSETS = [
    './',
    './index.html',
    './math.html',
    './math_viewer.html',
    './math_quiz.html',
    './english.html',
    './hanja.html',
    './wrong_note.html',
    './report.html',
    './styles.css',
    './main.js',
    './utils.js',
    './ui-core.js',
    './kakao-share.js',
    './VocabEng.js',
    './VocabHanja.js',
    './MathData.js',
    './MathQuizData.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './images/spatial.png',
    './images/circle_area.png',
    './images/solids.png',
    './images/pythagoras.png',
    './images/trigonometry.png'
];

// 설치 이벤트: 정적 자산 캐싱
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// 페치 이벤트: 네트워크 우선 전략 (데이터 파일의 경우) 또는 캐시 우선
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // JS 데이터 파일이나 HTML은 가급적 최신 버전을 확인하도록 시도 (Network First)
    if (url.pathname.endsWith('.js') || url.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, clonedResponse);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
    } else {
        // 이미지나 폰트 등은 캐시 우선 (Cache First)
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request).then(fetchRes => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, fetchRes.clone());
                        return fetchRes;
                    });
                });
            })
        );
    }
});

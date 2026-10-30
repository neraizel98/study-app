/**
 * Service Worker - 스마트 학습 앱 오프라인 캐시
 * ============================================================
 */

const CACHE_NAME = 'smart-study-20261030-vocab-continuity';

try {
    importScripts('./firebase-config.js');
    importScripts(self.SmartStudy.FirebaseConfig.sdk.app);
    importScripts(self.SmartStudy.FirebaseConfig.sdk.messaging);
    firebase.initializeApp(self.SmartStudy.FirebaseConfig.app);
    firebase.messaging().onBackgroundMessage(payload => {
        const data = payload.data || {};
        self.registration.showNotification(data.title || 'Smart Study', {
            body: data.body || '',
            icon: './icons/icon-192.png',
            badge: './icons/icon-96.png',
            tag: payload.data?.eventId || undefined,
            data: { url: payload.data?.url || './index.html' }
        });
    });
} catch (error) {
    console.warn('[SW] Firebase Messaging unavailable:', error.message);
}

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const target = new URL(event.notification.data?.url || './index.html', self.location.href).href;
    event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
        const existing = windows.find(client => client.url === target);
        return existing ? existing.focus() : clients.openWindow(target);
    }));
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
    './theme.css',
    './icons.js',
    './app-shell.js',
    './celebrate.js',
    './scratchpad.js',
    './images/login-hero.svg',
    './subjects.html',
    './goals.html',
    './goals.css',
    './goals-ui.js',
    './math.html',
    './math_viewer.html',
    './math-mobile.css',
    './math_quiz.html',
    './english.html',
    './english_reading.html',
    './korean_vocab.html',
    './KoreanVocabData.js',
    './KoreanVocabLevel1a.js',
    './KoreanVocabLevel1b.js',
    './KoreanVocabLevel2a.js',
    './KoreanVocabLevel2b.js',
    './KoreanVocabQuiz.js',
    './KoreanVocabApp.js',
    './english_course.html',
    './EnglishCourse.js',
    './english-course-ui.js',
    './english-warmup.js',
    './english-warmup-ui.js',
    './EnglishReadingData.js',
    './EnglishReadingMore1.js',
    './EnglishReadingMore2.js',
    './english-curriculum.js',
    './EnglishReadingSecondary.js',
    './EnglishGrammarExpanded.js',
    './EnglishGrammarAdvancedQuiz.js',
    './EnglishReadingPolicy.js',
    './EnglishReadingApp.js',
    './hanja.html',
    './wrong_note.html',
    './report.html',
    './report-subject-summary.js',
    './shared-report-loader.js',
    './styles.css',
    './main.js',
    './weekly-schedule.js',
    './weekly-dashboard.js',
    './weekly-dashboard.css',
    './weekly-review.html',
    './weekly-review.js',
    './weekly-review-policy.js',
    './learning-budget-policy.js',
    './answer-validation.js',
    './quiz-exposure.js',
    './reading-question-variants.js',
    './mock-exam.html',
    './mock-exam.js',
    './mock-exam-ui.js',
    './mock-exam-results.js',
    './mock-wrong-note.js',
    './mock-exam.css',
    './mock-print.html',
    './mock-paper.js',
    './mock-paper.css',
    './omr-layout.js',
    './omr-reader.js',
    './assessment-results.css',
    './assessment-summary.js',
    './learning-translation-guard.js',
    './learning-translation-guard.css',
    './mock-publication.js',
    './mock-admin.js',
    './mock-paper-admin.js',
    './mock-paper-omr.js',
    './MockRetakeReading.js',
    './MockRetakeEnglish.js',
    './mock-retake-grammar.js',
    './MockKoreanTransfer.js',
    './MockEnglishTransfer.js',
    './MockGrammarTransfer.js',
    './mock-math-transfer.js',
    './mock-hanja-transfer.js',
    './mock-exam-quality.js',
    './mock-exam-bank.js',
    './mock-reading-content.js',
    './english-speech.js',
    './english-vocabulary-progress.js',
    './utils.js',
    './ui-core.js',
    './storage-keys.js',
    './storage-events.js',
    './schema-migrations.js',
    './durable-store.js',
    './partition-repository.js',
    './local-repository.js',
    './app-bootstrap.js',
    './firebase-client.js',
    './firebase-config.js',
    './firestore-repository.js',
    './quiz-registry.js',
    './report.js',
    './concept-mastery.js',
    './firebase-sync.js',
    './notification-client.js',
    './parent-scope-guard.js',
    './in-app-study-request.js',
    './study-timer.js',
    './kakao-share.js',
    './VocabEng.js',
    './VocabEngM1.js',
    './VocabEngM2.js',
    './VocabEngM3.js',
    './VocabEngH1a.js',
    './VocabEngH1b.js',
    './VocabEngH2a.js',
    './VocabEngH2b.js',
    './VocabEngH3a.js',
    './VocabEngH3b.js',
    './VocabEngDefKo.js',
    './VocabHanja.js',
    './MathData.js',
    './MathQuizData.js',
    './MathDataMiddle1.js',
    './MathQuizMiddle1.js',
    './MathDataMiddle1Semester2.js',
    './MathQuizMiddle1Semester2.js',
    './english_grammar.html',
    './EnglishGrammarData.js',
    './EnglishGrammarQuiz.js',
    './EnglishGrammarApp.js',
    './reading.html',
    './ReadingData.js',
    './KoreanReadingMiddle.js',
    './KoreanReadingHigh.js',
    './KoreanReadingCurriculum.js',
    './answer-math-renderer.js',
    './math-session-questions.js',
    './subject-progression.js',
    './ReadingPassages.js',
    './ReadingPassagesMore1.js',
    './ReadingPassagesMore2.js',
    './ReadingPassagesMore3.js',
    './ReadingVocabulary.js',
    './ReadingApp.js',
    './math_formula.html',
    './MathFormulaData.js',
    './MathFormulaDataExtra.js',
    './MathFormulaDataVolume2.js',
    './MathFormulaDataVolume3.js',
    './MathFormulaDataVolume4.js',
    './MathFormulaQuiz.js',
    './MathFormulaQuizExtra.js',
    './MathFormulaQuizVolume2.js',
    './MathFormulaQuizVolume3.js',
    './MathFormulaQuizVolume4.js',
    './MathFormulaApp.js',
    './MathFormulaReview.js',
    './MathFormulaVisuals.js',
    './math-formula-visuals.css',
    './MathFormulaTime.js',
    './learning-plan.js',
    './unified-learning.js',
    './today-flow.js',
    './today-journey.js',
    './today-flow.css',
    './study-focus.css',
    './learning-session.js',
    './weekly-assessment.js',
    './weekly-assessment-expanded.js',
    './exam-training.js',
    './today.html',
    './weekly_assessment.html',
    './assessment-ui.css',
    './MathDataExtra.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './images/spatial.png',
    './images/circle_area.png',
    './images/solids.png'
];

// 설치 이벤트: 정적 자산 캐싱
self.addEventListener('install', event => {
    self.skipWaiting();
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
    
    // JS 데이터 파일이나 HTML은 항상 최신 버전 사용 (CDN 캐시 우회)
    if (url.pathname.endsWith('.js') || url.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(new Request(event.request, { cache: 'no-cache' }))
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

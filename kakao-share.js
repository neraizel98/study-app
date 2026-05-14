/**
 * KakaoTalk Sharing Manager
 * - Handles SDK initialization
 * - Study Request (Parent -> Son)
 * - Result Report (Son -> Parent)
 */

window.KakaoShare = {
    isInitialized: false,

    init: function() {
        if (this.isInitialized) return;
        
        try {
            if (typeof Kakao === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
                script.integrity = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4';
                script.crossOrigin = 'anonymous';
                script.onload = () => {
                    try {
                        if (!Kakao.isInitialized()) {
                            Kakao.init('33ff76b2028716f69802933476e0b9cb');
                        }
                        this.isInitialized = Kakao.isInitialized();
                        console.log('[KakaoShare] SDK Initialized:', this.isInitialized);
                    } catch (e) {
                        console.error('[KakaoShare SDK onload Error]', e);
                    }
                };
                document.head.appendChild(script);
            } else {
                if (!Kakao.isInitialized()) {
                    Kakao.init('33ff76b2028716f69802933476e0b9cb');
                }
                this.isInitialized = Kakao.isInitialized();
            }
        } catch (e) {
            console.error('[KakaoShare Init Error]', e);
        }
    },

    /**
     * 학습 요청 메시지 전송 (부모 -> 아들)
     * @param {string} subject - '영어', '한자', '수학'
     */
    sendRequest: function(subject) {
        if (!this.isInitialized) {
            alert('카카오톡 초기화 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        const subjectNames = { 'english': '영어', 'hanja': '한자', 'math': '수학' };
        const name = subjectNames[subject] || subject;
        const url = window.location.origin + window.location.pathname.replace('index.html', subject + '.html');
        
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: `📚 ${name} 학습 요청!`,
                description: `우준아, 오늘 ${name} 퀴즈 한 번 풀어볼까? 도전해보자!`,
                imageUrl: 'https://images.unsplash.com/photo-1454165833767-027ffea9e77b?q=80&w=400&auto=format&fit=crop', // 공부 이미지
                link: {
                    mobileWebUrl: url,
                    webUrl: url,
                },
            },
            buttons: [
                {
                    title: '퀴즈 풀러 가기 🚀',
                    link: {
                        mobileWebUrl: url,
                        webUrl: url,
                    },
                },
            ],
        });
    },

    /**
     * 학습 결과 보고 메시지 전송 (아들 -> 부모)
     * @param {string} subject - 과목 ID (math, english, hanja)
     * @param {number} score - 최종 맞힌 개수
     * @param {number} total - 전체 문제 수
     * @param {number} pct - 정답률
     * @param {number} initialScore - 최초 도전 시 맞힌 개수
     * @param {number} roundCount - 총 도전 횟수
     * @param {object} extra - { sessionId, levelInfo, startTime, endTime }
     */
    sendReport: function(subject, score, total, pct, initialScore, roundCount, extra = {}) {
        if (!this.isInitialized) {
            alert('카카오톡 초기화 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        const activeUser = typeof UserSession !== 'undefined' ? UserSession.getActiveUser() : '우준';
        const isPerfect = pct === 100;
        const emoji = isPerfect ? '🏆' : '👍';
        const subjectNames = { 'math': '수학', 'english': '영어', 'hanja': '한자' };
        const subjectName = subjectNames[subject] || subject;
        
        // 1. 과목 및 난이도 정보
        const levelInfo = extra.levelInfo || '기본';
        const title = `${emoji} ${activeUser}의 ${subjectName} [${levelInfo}] 결과!`;
        
        // 2. 테스트 시간 포맷팅 (HH:mm:ss)
        const formatTime = (date) => {
            if (!date) return '--:--:--';
            const d = new Date(date);
            return d.toTimeString().split(' ')[0];
        };
        const startTimeStr = formatTime(extra.startTime);
        const endTimeStr = formatTime(extra.endTime || Date.now());

        // 3. 메시지 설명 구성
        let desc = `✅ 결과: ${score} / ${total} (${pct}%)\n`;
        desc += `🕒 시간: ${startTimeStr} ~ ${endTimeStr}\n`;
        
        if (initialScore !== null && roundCount > 1) {
            desc += `🎯 최초 점수: ${initialScore} / ${total} (${roundCount}회 도전)`;
        } else {
            desc += `🎯 최초 점수: ${score} / ${total}`;
        }

        // 리포트 데이터 직렬화 (상세 페이지용)
        const sessionId = extra.sessionId || Date.now().toString();
        const reportData = {
            sessionId,
            subject: subject,
            level: levelInfo,
            date: Date.now(),
            totalQuestions: total,
            initialScore: initialScore !== null ? initialScore : score,
            finalScore: score,
            startTime: extra.startTime,
            endTime: extra.endTime || Date.now(),
            isCompleted: isPerfect
        };

        // 이 세션의 WrongNote 데이터 포함 (문제별 정답/오답 현황)
        // URL 길이 제한 주의: display만 포함하고 문제 전문(q/a)은 제외
        if (typeof WrongNote !== 'undefined') {
            const wrongAll = WrongNote.getAll()[subject] || [];
            const sessionItems = wrongAll
                .filter(item => item.history?.some(h => h.sessionId === sessionId))
                .map(item => {
                    const rounds = item.history
                        .filter(h => h.sessionId === sessionId)
                        .sort((a, b) => a.round - b.round)
                        .map(h => ({ r: h.round, s: h.status === 'correct' ? 'c' : 'w' }));
                    const display = item.word
                        ? `${item.word} — ${item.meaning || ''}`
                        : item.hanja
                        ? `${item.hanja} (${item.reading || ''}) — ${item.meaning || ''}`
                        : (item.type || '');
                    return { id: item.word || item.hanja || item.type || '', display, rounds };
                })
                .slice(0, 20); // 최대 20개로 제한
            if (sessionItems.length > 0) reportData.wrongItems = sessionItems;
        }

        const encodedData = btoa(unescape(encodeURIComponent(JSON.stringify(reportData))));
        const url = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/report.html?import=' + encodeURIComponent(encodedData);

        try { Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: title,
                description: desc,
                imageUrl: isPerfect
                    ? 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400&auto=format&fit=crop'
                    : 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=400&auto=format&fit=crop',
                link: { mobileWebUrl: url, webUrl: url },
            },
            buttons: [
                {
                    title: '성적표 자세히 보기 📊',
                    link: { mobileWebUrl: url, webUrl: url },
                },
            ],
        }); } catch (e) {
            console.error('[KakaoShare sendReport Error]', e);
            alert('카카오톡 전송 중 오류가 발생했습니다.\n브라우저 콘솔(F12)에서 상세 오류를 확인하세요.\n오류: ' + e.message);
        }
    },

    /**
     * 오늘의 학습 일일 요약 전송 (아들 -> 부모)
     * 대시보드에서 호출 — 오늘 공부한 과목·시간·스트릭 포함
     */
    sendDailySummary: function() {
        if (!this.isInitialized) {
            alert('카카오톡 초기화 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        const user = typeof UserSession !== 'undefined' ? UserSession.getUserData() : null;
        if (!user) { alert('로그인 정보가 없습니다.'); return; }

        const activeUser = user.id || '우준';
        const streak = user.attendance?.currentStreak || 0;
        const daily = user.dailyStats || {};
        const times = daily.studyTime || {};
        const subjects = daily.subjectsStudied || [];

        if (subjects.length === 0) {
            alert('오늘 학습한 기록이 없습니다. 먼저 공부하고 보내세요!');
            return;
        }

        const subjectNames = { english: '영어', hanja: '한자', math: '수학' };
        const subjectEmoji = { english: '🇬🇧', hanja: '🏮', math: '📐' };

        const toMin = (sec) => Math.round((sec || 0) / 60);
        const studiedLines = subjects
            .map(s => `${subjectEmoji[s] || '📚'} ${subjectNames[s] || s} ${toMin(times[s])}분`)
            .join('  ·  ');

        const totalMin = toMin(Object.values(times).reduce((a, b) => a + b, 0));
        const streakMsg = streak >= 3 ? ` 🔥 ${streak}일 연속 출석 중!` : '';
        const scores = daily.quizScores || {};
        const bestScore = Object.entries(scores).reduce((best, [subj, arr]) => {
            if (!arr.length) return best;
            const max = Math.max(...arr);
            return max > (best.score || 0) ? { subj, score: max } : best;
        }, {});
        const scoreMsg = bestScore.score
            ? `\n🏅 최고 점수: ${subjectNames[bestScore.subj]} ${bestScore.score}점`
            : '';

        const title = `📊 ${activeUser}의 오늘 학습 리포트`;
        const desc = `${studiedLines}\n⏱ 총 ${totalMin}분 학습${scoreMsg}${streakMsg}`;

        const url = `${window.location.origin}${window.location.pathname.split('/').slice(0, -1).join('/')}/report.html`;

        try { Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title,
                description: desc,
                imageUrl: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=400&auto=format&fit=crop',
                link: { mobileWebUrl: url, webUrl: url },
            },
            buttons: [{ title: '성적표 보기 📈', link: { mobileWebUrl: url, webUrl: url } }],
        }); } catch (e) {
            console.error('[KakaoShare sendDailySummary Error]', e);
            alert('카카오톡 전송 중 오류가 발생했습니다.\n오류: ' + e.message);
        }
    },

    /**
     * 전체 학습 기록 공유 (아들 -> 부모)
     */
    sendFullHistory: function() {
        if (!this.isInitialized) return;

        const reports = typeof getQuizReports === 'function' ? getQuizReports() : [];
        if (reports.length === 0) {
            alert('공유할 학습 기록이 없습니다.');
            return;
        }

        // 최신 10개로 제한 (URL 길이 초과 방지)
        const recentReports = reports.slice(-10);
        const encodedData = btoa(unescape(encodeURIComponent(JSON.stringify(recentReports))));
        const url = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/report.html?import_all=' + encodeURIComponent(encodedData);

        try { Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: '📊 우준이의 전체 학습 기록부',
                description: `지금까지 총 ${reports.length}번의 퀴즈에 도전했습니다. 전체 기록을 확인해보세요!`,
                imageUrl: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=400&auto=format&fit=crop',
                link: { mobileWebUrl: url, webUrl: url },
            },
            buttons: [
                {
                    title: '종합 성적표 보기 📈',
                    link: { mobileWebUrl: url, webUrl: url },
                },
            ],
        }); } catch (e) {
            console.error('[KakaoShare sendFullHistory Error]', e);
            alert('카카오톡 전송 중 오류가 발생했습니다.\n오류: ' + e.message);
        }
    }
};

// 초기화 즉시 시도
KakaoShare.init();

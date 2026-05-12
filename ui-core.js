// ============================================================
// GLOBAL ERROR HANDLER (DEBUG OVERLAY)
// ============================================================
window.onerror = function (msg, url, line, col, error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed; top:0; left:0; width:100%; background:#ff5252; color:white; padding:15px; z-index:10000; font-family:monospace; font-size:12px; border-bottom:2px solid black; box-shadow:0 5px 15px rgba(0,0,0,0.3);';
    errorDiv.innerHTML = `
        <strong>[Runtime Error]</strong><br>
        Message: ${msg}<br>
        File: ${url.split('/').pop()}<br>
        Line: ${line}, Column: ${col}<br>
        <button onclick="this.parentElement.remove()" style="margin-top:10px; padding:4px 8px; cursor:pointer; background:white; border:none; border-radius:4px; font-weight:bold;">닫기 (X)</button>
        <button onclick="localStorage.clear(); location.reload();" style="margin-top:10px; margin-left:10px; padding:4px 8px; cursor:pointer; background:black; color:white; border:none; border-radius:4px; font-weight:bold;">데이터 초기화 후 새로고침</button>
    `;
    document.body.prepend(errorDiv);
    return false;
};

const AppUI = {
    /**
     * 페이지 공통 UI 초기화
     * @param {Object} config - { title, subtitle }
     */
    init: function (config = {}) {
        try {
            this.config = config;

            // 1. 사용자 체크 (메인 페이지 제외)
            const path = window.location.pathname;
            const isIndex = path.endsWith('index.html') || path === '/' || path.endsWith('/');
            const activeUser = (typeof window.UserSession !== 'undefined') ? window.UserSession.getActiveUser() : null;

            if (!isIndex && !activeUser) {
                window.location.href = 'index.html';
                return;
            }

            this.renderHeader(activeUser);
            this.applyGlobalStyles();
        } catch (e) {
            console.error('[AppUI Init Error]', e);
            // 에러 오버레이가 이미 동작 중이므로 추가 조치는 하지 않음
        }
    },

    renderHeader: function (userId) {
        const headerContainer = document.getElementById('app-header');
        if (!headerContainer) return;

        let profileHtml = '';
        if (userId && typeof window.UserSession !== 'undefined') {
            const user = window.UserSession.getUserData(userId) || { level: 1, exp: 0 };
            const currentLevel = user.level || 1;
            const currentExp = user.exp || 0;
            const reqExp = window.UserSession.getRequiredEXP ? window.UserSession.getRequiredEXP(currentLevel) : 100;
            const expPct = Math.min(100, (currentExp / reqExp) * 100);

            profileHtml = `
                <div class="user-profile-mini">
                    <div class="user-info">
                        <span class="user-id">👤 ${userId}</span>
                        <span class="user-lv">Lv.${currentLevel}</span>
                    </div>
                    <div class="exp-bar-container">
                        <div class="exp-bar-fill" style="width: ${expPct}%"></div>
                    </div>
                    <button class="logout-btn-mini" onclick="window.UserSession.logout(); window.location.href='index.html';">로그아웃</button>
                </div>
            `;
        }

        const homeUrl = 'index.html';
        const reportUrl = 'report.html';
        const wrongNoteUrl = 'wrong_note.html';

        headerContainer.innerHTML = `
            <div class="app-header-container">
                <!-- Row 1: Global Bar (Brand & User) -->
                <div class="nav-row-top">
                    <div class="nav-left">
                        <a href="${homeUrl}" class="nav-logo-link">🏠 <span class="logo-text">Smart Study</span></a>
                    </div>
                    <div class="nav-right">
                        ${profileHtml}
                    </div>
                </div>
                <!-- Row 2: Page Title Bar (Main Identity) -->
                <div class="nav-row-bottom">
                    <div class="nav-center">
                        <h1 class="page-main-title">${this.config.title || 'Smart Study'}</h1>
                        ${this.config.subtitle ? `<p class="page-sub-title">${this.config.subtitle}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    applyGlobalStyles: function () {
        if (document.getElementById('ui-core-styles')) return;
        const style = document.createElement('style');
        style.id = 'ui-core-styles';
        style.innerHTML = `
            .app-header-container {
                display: flex;
                flex-direction: column;
                gap: 0;
                margin-bottom: 25px;
                border: 1px solid var(--card-border);
                border-top: none;
                border-left: none;
                border-right: none;
                background: var(--card-bg);
            }
            .nav-row-top {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 20px;
                background: rgba(0,0,0,0.2);
                border-bottom: 1px solid rgba(255,255,255,0.05);
            }
            .nav-row-bottom {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 24px 20px;
                background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%);
            }
            
            .nav-logo-link {
                text-decoration: none;
                font-size: 1.1rem;
                font-weight: 700;
                color: var(--text);
                display: flex;
                align-items: center;
                gap: 8px;
                white-space: nowrap;
            }
            .logo-text { background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
            
            .nav-center { text-align: center; width: 100%; }
            .page-main-title { 
                font-size: 2.2rem; 
                margin: 0; 
                font-weight: 800; 
                letter-spacing: -1.5px; 
                line-height: 1.2;
                white-space: nowrap;
                color: #ffffff;
                text-shadow: 0 4px 10px rgba(0,0,0,0.3);
            }
            .page-sub-title { 
                font-size: 1rem; 
                color: var(--text-sub); 
                margin: 8px 0 0 0; 
                opacity: 0.8;
                white-space: nowrap;
            }
            
            .nav-right { display: flex; align-items: center; gap: 15px; }
            .nav-links { display: flex; gap: 10px; }
            .nav-link-item { 
                text-decoration: none; 
                color: var(--text-sub); 
                font-size: 0.85rem; 
                font-weight: 600;
                padding: 6px 12px;
                border-radius: 8px;
                transition: all 0.2s;
                white-space: nowrap;
            }
            .nav-link-item:hover { color: var(--accent); background: rgba(79, 172, 254, 0.1); }
            
            /* Profile Styles */
            .user-profile-mini {
                display: flex;
                flex-direction: column;
                gap: 3px;
                background: rgba(255, 255, 255, 0.05);
                padding: 6px 14px;
                border-radius: 12px;
                border: 1px solid var(--card-border);
                min-width: 130px;
                white-space: nowrap;
            }
            .user-info { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; font-weight: 700; gap: 10px; }
            .user-id { color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 90px; }
            .user-lv { color: var(--accent2); font-size: 0.7rem; }
            
            .exp-bar-container {
                height: 4px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 2px;
                overflow: hidden;
            }
            .exp-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--accent), var(--accent2));
                transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .logout-btn-mini {
                background: none;
                border: none;
                color: var(--text-sub);
                font-size: 0.6rem;
                padding: 0;
                cursor: pointer;
                text-align: right;
                opacity: 0.5;
            }
            .logout-btn-mini:hover { opacity: 1; text-decoration: underline; }

            @media (max-width: 768px) {
                .nav-row-top { padding: 8px 12px; }
                .page-main-title { font-size: 1.6rem; }
                .nav-right { gap: 10px; }
                .nav-links { display: none; } /* 모바일에서는 링크 숨김 */
            }
        `;
        document.head.appendChild(style);
    }
};

window.AppUI = AppUI;

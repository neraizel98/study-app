/**
 * version-check.js
 * version.json(서버)과 현재 페이지 버전을 비교해 구버전이면 업데이트 배너를 표시
 *
 * 배포 시: version.json 과 APP_VERSION 을 같은 값으로 함께 올릴 것
 */

const APP_VERSION = '20260514';

(async function () {
    try {
        const res = await fetch('version.json?_=' + Date.now(), { cache: 'no-store' });
        const { v } = await res.json();
        if (v && v !== APP_VERSION) _showUpdateBanner();
    } catch (e) {
        // 오프라인 또는 fetch 실패 — 무시
    }
})();

function _showUpdateBanner() {
    if (document.getElementById('_update_banner')) return;

    const banner = document.createElement('div');
    banner.id = '_update_banner';
    banner.style.cssText = `
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 10000;
        background: linear-gradient(135deg, #1a2332, #0d1117);
        border-top: 2px solid rgba(79,172,254,0.5);
        padding: 14px 20px;
        display: flex; align-items: center; gap: 12px;
        font-family: 'Outfit', sans-serif;
        animation: _slideUp 0.3s ease-out;
    `;

    const style = document.createElement('style');
    style.textContent = `@keyframes _slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`;
    document.head.appendChild(style);

    banner.innerHTML = `
        <span style="flex:1; font-size:0.88rem; color:#f0f6fc; line-height:1.4;">
            🔄 <strong>새 버전</strong>이 있습니다. 업데이트 후 최신 기능을 사용하세요.
        </span>
        <button id="_update_btn" style="
            background: linear-gradient(135deg,#4facfe,#00f2fe);
            color: #0d1117; border: none;
            padding: 9px 20px; border-radius: 20px;
            font-weight: 700; cursor: pointer;
            font-size: 0.85rem; font-family: inherit;
            white-space: nowrap; flex-shrink: 0;
        ">지금 업데이트</button>
        <button onclick="document.getElementById('_update_banner').remove()" style="
            background: none; border: none;
            color: rgba(255,255,255,0.35); cursor: pointer;
            font-size: 1.2rem; padding: 4px; flex-shrink: 0;
            line-height: 1;
        ">✕</button>
    `;

    document.body.appendChild(banner);

    document.getElementById('_update_btn').addEventListener('click', async () => {
        document.getElementById('_update_btn').textContent = '업데이트 중...';
        try {
            if ('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                await Promise.all(regs.map(r => r.unregister()));
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(c => caches.delete(c)));
            }
        } catch (e) { /* ignore */ }
        location.reload(true);
    });
}

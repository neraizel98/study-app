/* In-page celebration card (replaces blocking alert() for level-ups and mission completions). No dependencies. */
(function (root) {
    'use strict';
    const queue = [];
    let showing = false;
    const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const COLORS = ['#2e9a6c', '#f0b44c', '#e07a5f', '#5b8def', '#9c7ddb'];

    function next() {
        if (showing || !queue.length) return;
        showing = true;
        const { title, message, badge } = queue.shift();
        const overlay = document.createElement('div');
        overlay.className = 'ss-celebrate';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', title);
        const confetti = Array.from({ length: 18 }, (_, i) =>
            `<i style="--x:${Math.round(Math.random() * 100)}%;--d:${(0.9 + Math.random() * 0.9).toFixed(2)}s;--r:${Math.round(Math.random() * 360)}deg;background:${COLORS[i % COLORS.length]}"></i>`).join('');
        overlay.innerHTML = `<div class="ss-celebrate-confetti" aria-hidden="true">${confetti}</div>
            <div class="ss-celebrate-card">
                <div class="ss-celebrate-badge" aria-hidden="true">${escape(badge || '★')}</div>
                <h2>${escape(title)}</h2>
                ${message ? `<p>${escape(message)}</p>` : ''}
                <button type="button" class="ss-celebrate-close">좋아요</button>
            </div>`;
        const close = () => {
            overlay.classList.add('is-leaving');
            setTimeout(() => { overlay.remove(); showing = false; next(); }, 180);
        };
        overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
        overlay.querySelector('button').addEventListener('click', close);
        document.addEventListener('keydown', function onKey(event) {
            if (event.key === 'Escape' && overlay.isConnected) { document.removeEventListener('keydown', onKey); close(); }
        });
        document.body.append(overlay);
        overlay.querySelector('button').focus({ preventScroll: true });
    }

    root.SmartStudyCelebrate = function celebrate(title, message, badge) {
        if (!document.body) { root.alert?.(`${title}\n${message || ''}`); return; }
        queue.push({ title, message, badge });
        next();
    };
})(window);

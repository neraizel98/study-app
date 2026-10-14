/* App shell: learner bottom tab bar shared by the hub pages (오늘 · 과목 · 기록 · 보상). */
(function (root) {
    'use strict';
    const icon = (name, opts) => root.SmartStudyIcons?.icon(name, opts) || '';

    const TABS = [
        { id: 'today', label: '오늘', icon: 'sun', href: 'index.html', pages: ['index.html', 'today.html', ''] },
        { id: 'subjects', label: '과목', icon: 'books', href: 'subjects.html', pages: ['subjects.html'] },
        { id: 'records', label: '기록', icon: 'chart-line', href: 'stats.html', pages: ['stats.html', 'report.html', 'wrong_note.html'] },
        { id: 'rewards', label: '보상', icon: 'trophy', href: 'goals.html', pages: ['goals.html'] }
    ];

    const page = () => root.location.pathname.split('/').pop();
    const activeUser = () => (typeof root.UserSession !== 'undefined' ? root.UserSession.getActiveUser() : null);

    function mountTabs() {
        const existing = document.getElementById('ssTabBar');
        if (!activeUser()) {
            existing?.remove();
            document.body.classList.remove('has-tab-bar');
            return;
        }
        if (existing) return;
        const current = page();
        const nav = document.createElement('nav');
        nav.id = 'ssTabBar';
        nav.className = 'ss-tabbar';
        nav.setAttribute('aria-label', '주요 메뉴');
        nav.innerHTML = TABS.map(tab => {
            const active = tab.pages.includes(current);
            return `<a href="${tab.href}" class="ss-tab${active ? ' is-active' : ''}"${active ? ' aria-current="page"' : ''}>${icon(tab.icon, { size: 22 })}<span>${tab.label}</span></a>`;
        }).join('');
        document.body.append(nav);
        document.body.classList.add('has-tab-bar');
    }

    root.AppShell = { mountTabs, icon };
    document.addEventListener('DOMContentLoaded', async () => {
        if (!document.body.hasAttribute('data-app-tabs')) return;
        await root.SmartStudy?.LocalRepository?.ready;
        mountTabs();
        document.querySelectorAll('[data-icon]:empty').forEach(el => { el.innerHTML = icon(el.dataset.icon, { size: el.classList.contains('ss-tile') ? 24 : 18 }); });
    });
})(window);

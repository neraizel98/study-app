(function (root) {
    'use strict';

    const DEFAULT_TIMEOUT_MS = 12000;
    const PAGE_SIZE = 50;
    const MAX_PAGES = 20;

    function dateRange(date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) throw new Error('공유 날짜가 올바르지 않습니다.');
        const start = Date.parse(`${date}T00:00:00+09:00`);
        if (!Number.isFinite(start)) throw new Error('공유 날짜가 올바르지 않습니다.');
        return { start, end: start + 24 * 60 * 60 * 1000 - 1 };
    }

    function withTimeout(work, timeoutMs = DEFAULT_TIMEOUT_MS) {
        let timer;
        return Promise.race([
            Promise.resolve().then(work),
            new Promise((_, reject) => {
                timer = setTimeout(() => reject(Object.assign(new Error('서버 응답 시간이 초과되었습니다.'), { code: 'shared-report/timeout' })), timeoutMs);
            })
        ]).finally(() => clearTimeout(timer));
    }

    async function loadBounded(repository, learnerId, date) {
        const range = date ? dateRange(date) : { start: null, end: null };
        const reports = [];
        let before = null;
        let hasMore = true;
        let pageCount = 0;
        while (hasMore && pageCount < MAX_PAGES) {
            const page = await repository.getReportsPage(learnerId, { before, start: range.start, end: range.end, limit: PAGE_SIZE, source: 'server' });
            reports.push(...(Array.isArray(page?.reports) ? page.reports : []));
            hasMore = Boolean(page?.hasMore && page?.cursor);
            before = page?.cursor || null;
            pageCount += 1;
        }
        if (hasMore) throw new Error('해당 날짜의 기록이 너무 많아 모두 불러오지 못했습니다.');
        const dailyRows = date ? await repository.getDaily(learnerId, date, date, { source: 'server' }) : [];
        return {
            reports,
            daily: (Array.isArray(dailyRows) ? dailyRows : []).find(row => row?.date === date) || null,
            legacy: false,
            getDetail: report => repository.getReportDetail(learnerId, report)
        };
    }

    async function loadLegacy(repository, learnerId, date, dateKey) {
        const bundle = await repository.getUserBundle(learnerId);
        const reports = (Array.isArray(bundle?.reports) ? bundle.reports : []).filter(report =>
            !date || dateKey(new Date(Number(report.date || report.createdAt || 0))) === date
        );
        const daily = date && bundle?.user?.dailyStats?.date === date ? bundle.user.dailyStats : null;
        return { reports, daily, legacy: true, getDetail: async report => report };
    }

    function load(options) {
        const { repository, learnerId, date, dateKey, timeoutMs = DEFAULT_TIMEOUT_MS } = options || {};
        if (!repository || !learnerId || typeof dateKey !== 'function') {
            return Promise.reject(new Error('공유 성적표 요청 정보가 부족합니다.'));
        }
        return withTimeout(async () => {
            const hasBoundedApi = ['getReportsPage', 'getReportDetail', 'getDaily'].every(name => typeof repository[name] === 'function');
            if (!hasBoundedApi) return loadLegacy(repository, learnerId, date, dateKey);
            const mode = typeof repository.getReportStorageMode === 'function'
                ? await repository.getReportStorageMode(learnerId)
                : 'partition';
            return mode === 'legacy'
                ? loadLegacy(repository, learnerId, date, dateKey)
                : loadBounded(repository, learnerId, date);
        }, timeoutMs);
    }

    root.SmartStudy = root.SmartStudy || {};
    root.SmartStudy.SharedReportLoader = { load, dateRange, withTimeout };
})(typeof window !== 'undefined' ? window : globalThis);

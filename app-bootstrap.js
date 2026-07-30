(function (root) {
    'use strict';
    const state = { initialized: false, page: null };
    root.SmartStudy.bootstrap = function bootstrap(options = {}) {
        if (state.initialized) return state;
        const pathname = root.location?.pathname || '';
        state.page = options.page || pathname.split('/').pop()?.replace(/\.html$/, '') || 'index';
        state.initialized = true;
        root.dispatchEvent?.(new CustomEvent('smartstudy:ready', { detail: { page: state.page } }));
        return state;
    };
    root.SmartStudy.bootstrap();
})(window);

(function (root) {
    'use strict';

    const listeners = new Map();
    const Events = {
        subscribe(event, handler) {
            if (!listeners.has(event)) listeners.set(event, new Set());
            listeners.get(event).add(handler);
            return () => listeners.get(event)?.delete(handler);
        },
        publish(event, payload) {
            for (const handler of listeners.get(event) || []) {
                try {
                    const result = handler(payload);
                    if (result?.catch) result.catch(error => console.error(`[StorageEvents:${event}]`, error));
                } catch (error) {
                    console.error(`[StorageEvents:${event}]`, error);
                }
            }
        },
        clear() {
            listeners.clear();
        }
    };

    root.SmartStudy = root.SmartStudy || {};
    root.SmartStudy.StorageEvents = Events;
    if (typeof module !== 'undefined' && module.exports) module.exports = Events;
})(typeof window !== 'undefined' ? window : globalThis);

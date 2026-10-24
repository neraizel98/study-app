(function (root) {
    'use strict';
    // A web page can request no translation and suppress its text menu. It cannot
    // control OS screenshots, camera/OCR translation, or browser overrides.
    const doc = root.document;
    if (!doc || !doc.documentElement.hasAttribute('data-learning-translation-guard')) return;
    doc.addEventListener('contextmenu', event => {
        const target = event.target?.closest ? event.target : event.target?.parentElement;
        // Keep answer editing, selection and accessibility tools in text fields.
        if (target?.closest('input, textarea, [contenteditable="true"], [contenteditable=""], [role="textbox"], [data-allow-selection]')) return;
        event.preventDefault();
    });
})(window);

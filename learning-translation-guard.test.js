// Lesson text must not leave the page through copy/cut/drag, and forced browser
// translation (which ignores translate="no") must be noticed and stopped.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('learning-translation-guard.js', 'utf8');

class Element {
    constructor(tag, attrs = {}) { this.nodeName = tag.toUpperCase(); this.nodeType = 1; this.attrs = { ...attrs }; this.children = []; this.parent = null; this.text = ''; this.listeners = {}; }
    get classList() { const list = (this.attrs.class || '').split(/\s+/); return { contains: name => list.includes(name) }; }
    set className(value) { this.attrs.class = value; }
    hasAttribute(name) { return name in this.attrs; }
    getAttribute(name) { return name in this.attrs ? this.attrs[name] : null; }
    setAttribute(name, value) { this.attrs[name] = String(value); }
    get textContent() { return this.text + this.children.map(child => child.textContent).join(''); }
    set textContent(value) { this.text = value; this.children = []; }
    set innerHTML(value) { this.html = value; this.children = [new Element('button')]; this.children[0].parent = this; }
    appendChild(child) { child.parent = this; this.children.push(child); return child; }
    addEventListener(type, fn) { this.listeners[type] = fn; }
    querySelector(tag) { return this.children.find(child => child.nodeName === tag.toUpperCase()); }
    getElementsByTagName(tag) { return this.children.flatMap(child => [child, ...child.getElementsByTagName(tag)]).filter(child => child.nodeName === tag.toUpperCase()); }
    // Supports the guard's exemption selector: tag names and [attribute] parts.
    matches(selector) { return selector.split(',').some(part => { part = part.trim(); const attr = part.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/); return attr ? attr[1] in this.attrs && (attr[2] === undefined || this.attrs[attr[1]] === attr[2]) : this.nodeName === part.toUpperCase(); }); }
    closest(selector) { for (let node = this; node; node = node.parent) if (node.matches?.(selector)) return node; return null; }
}

function setup({ guarded = true } = {}) {
    const html = new Element('html', { lang: 'ko', class: 'notranslate', translate: 'no', ...(guarded ? { 'data-learning-translation-guard': '' } : {}) });
    const body = html.appendChild(new Element('body'));
    const observers = [], docListeners = {}, events = [];
    let reloads = 0;
    class MutationObserver { constructor(fn) { this.fn = fn; this.active = false; observers.push(this); } observe(target, options) { this.target = target; this.options = options; this.active = true; } disconnect() { this.active = false; } }
    const document = {
        documentElement: html, body,
        createElement: tag => new Element(tag),
        addEventListener(type, fn) { (docListeners[type] ||= []).push(fn); },
        dispatchEvent(event) { events.push(event); (docListeners[event.type] || []).forEach(fn => fn(event)); }
    };
    class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } }
    const root = { document, MutationObserver, CustomEvent, console, location: { reload: () => reloads++ } };
    root.window = root;
    vm.createContext(root);
    vm.runInContext(source, root);
    const fire = (type, target) => { const event = { type, target, prevented: false, preventDefault() { this.prevented = true; } }; (docListeners[type] || []).forEach(fn => fn(event)); return event.prevented; };
    const mutate = (target, records) => observers.filter(o => o.active && o.target === target).forEach(o => o.fn(records));
    return { root, html, body, fire, mutate, events, observers, reloads: () => reloads };
}

// Unguarded pages keep the browser defaults and expose no guard.
{
    const page = setup({ guarded: false });
    assert.equal(page.root.LearningTranslationGuard, undefined);
    assert.equal(page.fire('copy', page.body), false);
}

// Copy, cut, drag and the text menu are blocked on lesson text only.
{
    const page = setup();
    const lesson = page.body.appendChild(new Element('p'));
    const word = { nodeType: 3, parentElement: lesson };
    const input = page.body.appendChild(new Element('input'));
    const textarea = page.body.appendChild(new Element('textarea'));
    const allowed = page.body.appendChild(new Element('div', { 'data-allow-selection': '' }));
    const allowedChild = allowed.appendChild(new Element('span'));
    const editor = page.body.appendChild(new Element('div', { contenteditable: 'true' }));
    const textbox = page.body.appendChild(new Element('div', { role: 'textbox' }));
    for (const type of ['copy', 'cut', 'dragstart', 'contextmenu']) {
        assert.equal(page.fire(type, lesson), true, `${type} on lesson text`);
        assert.equal(page.fire(type, word), true, `${type} on a text node`);
        for (const target of [input, textarea, allowed, allowedChild, editor, textbox]) {
            assert.equal(page.fire(type, target), false, `${type} on ${target.nodeName} stays usable`);
        }
    }
    // Clicks, keys and scrolling are never intercepted.
    for (const type of ['click', 'keydown', 'scroll', 'touchstart', 'selectstart']) assert.equal(page.fire(type, lesson), false);
}

// The page's own re-rendering and the hidden canary never count as translation.
{
    const page = setup();
    const guard = page.root.LearningTranslationGuard;
    const sentinel = page.body.children.find(child => child.attrs.class === 'learning-translation-sentinel');
    assert.ok(sentinel, 'offscreen sentinel inserted');
    assert.equal(sentinel.getAttribute('aria-hidden'), 'true');
    assert.equal(sentinel.getAttribute('translate'), 'yes');
    const card = new Element('div', { class: 'quiz' });
    card.appendChild(new Element('p')).text = 'The cat sat on the mat.';
    page.body.appendChild(card);
    page.mutate(page.body, [{ type: 'childList', addedNodes: [card] }]);
    page.html.setAttribute('class', 'notranslate modal-open');
    page.mutate(page.html, [{ type: 'attributes', attributeName: 'class' }]);
    assert.equal(guard.detected, false);
    assert.equal(guard.signal, null);
    assert.equal(page.events.length, 0);
}

// Chrome/Google Translate class on <html>: overlay, API, callbacks and event fire once.
{
    const page = setup();
    const guard = page.root.LearningTranslationGuard;
    const early = [], domEvents = [];
    guard.onDetect(name => early.push(name));
    page.root.document.addEventListener('learning-translation-detected', event => domEvents.push(event.detail));
    page.html.setAttribute('class', 'notranslate translated-ltr');
    page.mutate(page.html, [{ type: 'attributes', attributeName: 'class' }]);
    page.mutate(page.html, [{ type: 'attributes', attributeName: 'class' }]);
    assert.equal(guard.detected, true);
    assert.equal(guard.signal, 'html-class');
    assert.deepEqual(early, ['html-class']);
    assert.deepEqual(domEvents.map(d => ({ ...d })), [{ signal: 'html-class' }]);
    const late = [];
    guard.onDetect(name => late.push(name));
    assert.deepEqual(late, ['html-class'], 'late subscribers are told immediately');
    assert.ok(page.observers.every(o => !o.active), 'observers stop after detection');
    guard.detected = false;
    assert.equal(guard.detected, true, 'state cannot be reset from outside');
    const overlays = page.body.children.filter(child => /learning-translation-overlay/.test(child.attrs.class || ''));
    assert.equal(overlays.length, 1);
    const overlay = overlays[0];
    assert.equal(overlay.getAttribute('translate'), 'no');
    assert.match(overlay.attrs.class, /notranslate/);
    assert.match(overlay.html, /번역 기능이 켜져 있어요/);
    assert.match(overlay.html, /학습 내용은 원문으로 공부해야 해요\. 브라우저의 번역을 끄고 새로고침해 주세요\./);
    assert.match(overlay.html, />새로고침</);
    overlay.querySelector('button').listeners.click();
    assert.equal(page.reloads(), 1);
}

// Google Translate <font> wrappers, a changed lang, or a translated canary each count.
{
    const page = setup();
    const wrapper = new Element('div');
    wrapper.appendChild(new Element('font', { style: 'vertical-align: inherit;' }));
    page.mutate(page.body, [{ type: 'childList', addedNodes: [{ nodeType: 3 }, wrapper] }]);
    assert.equal(page.root.LearningTranslationGuard.signal, 'font');
}
{
    const page = setup();
    page.mutate(page.body, [{ type: 'childList', addedNodes: [new Element('font')] }]);
    assert.equal(page.root.LearningTranslationGuard.signal, 'font');
}
{
    const page = setup();
    page.html.setAttribute('lang', 'en');
    page.mutate(page.html, [{ type: 'attributes', attributeName: 'lang' }]);
    assert.equal(page.root.LearningTranslationGuard.signal, 'html-lang');
}
{
    const page = setup();
    const sentinel = page.body.children.find(child => child.attrs.class === 'learning-translation-sentinel');
    sentinel.textContent = '원래 문장을 주의 깊게 읽으세요.';
    page.mutate(page.body, [{ type: 'characterData', addedNodes: [] }]);
    assert.equal(page.root.LearningTranslationGuard.signal, 'sentinel');
}

// Every page that shows lesson or quiz text loads the guard.
{
    const learningPages = ['english.html', 'english_course.html', 'english_grammar.html', 'english_reading.html', 'reading.html',
        'korean_vocab.html', 'hanja.html', 'math.html', 'math_formula.html', 'math_quiz.html', 'math_viewer.html',
        'mock-exam.html', 'weekly_assessment.html', 'weekly-review.html', 'wrong_note.html'];
    for (const page of learningPages) {
        const html = fs.readFileSync(page, 'utf8');
        assert.match(html, /<html[^>]*translate="no"[^>]*data-learning-translation-guard/, `${page} guard attribute`);
        assert.match(html, /<meta name="google" content="notranslate">/, `${page} notranslate meta`);
        assert.match(html, /learning-translation-guard\.js/, `${page} guard script`);
        assert.match(html, /learning-translation-guard\.css/, `${page} guard styles`);
    }
}

console.log('Translation guard: copy/cut/drag blocked on lesson text, forced translation detected once with overlay.');

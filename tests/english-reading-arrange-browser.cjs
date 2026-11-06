const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.dirname(__dirname);
const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const target = path.join(root, pathname === '/' ? 'english_reading.html' : pathname.slice(1));
    if (!target.startsWith(root) || !fs.existsSync(target)) return response.writeHead(404).end();
    response.setHeader('Content-Type', target.endsWith('.html') ? 'text/html; charset=utf-8' : target.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/css; charset=utf-8');
    response.end(fs.readFileSync(target));
});

(async () => {
    let browser;
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        browser = await chromium.launch({ channel: 'chrome', headless: true });
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
        const learner = `arrange-browser-${Date.now()}`;
        await context.route('**/parent-scope-guard.js*', route => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
        await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
        await context.addInitScript(id => localStorage.setItem('SmartStudy_ActiveUser', id), learner);
        const page = await context.newPage();
        await page.goto(`http://127.0.0.1:${server.address().port}/english_reading.html?level=grade6&unit=er1`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForSelector('#passageTitle', { timeout: 15000 });
        assert.equal(await page.locator('#toggleQuizTranslation').count(), 0, 'translation control must not exist in any quiz round');
        await page.evaluate(() => { StudyTimer.isUnlocked = () => true; window.EnglishReadingApp.startQuiz('practice'); });
        for (let guard = 0; guard < 10; guard++) {
        const state = await page.evaluate(() => { const s = EnglishReadingApp.getSession(), q = s.questions.find(item => item.id === s.roundQuestionIds[s.questionIndex]); return { type: q.type, answerIndex: q.answerIndex, answer: q.answer }; });
        if (state.type === 'arrange') {
            const partial = state.answer.split(/\s+/).slice(0, 3).join(' ');
            await page.locator('#arrangeInput').fill(partial);
            await page.reload({ waitUntil: 'domcontentloaded' });
            assert.equal(await page.locator('#arrangeInput').inputValue(), partial, 'partial sentence must restore after reload');
            const integrityContinue = page.locator('.quiz-integrity-notice button');
            if (await integrityContinue.isVisible()) await integrityContinue.click();
            await page.locator('#arrangeInput').fill(state.answer); await page.click('#arrangeSubmit');
            assert.match(await page.locator('#quizFeedback').innerText(), /정답입니다/);
            const stored = await page.evaluate(() => { const a = EnglishReadingApp.getSession().attempts.at(-1); return { type: a.questionType, selected: a.selectedAnswer, tokens: a.tokens.length, translationUsed: a.translationUsed }; });
            assert.equal(stored.type, 'arrange'); assert.equal(stored.selected, state.answer); assert.ok(stored.tokens >= 3); assert.equal(stored.translationUsed, false);
                console.log('Mobile English reading arrange input, reload restore, grading, record, and no-translation UI verified.'); return;
            }
            await page.locator('[data-choice]').nth(state.answerIndex).click(); await page.click('#nextQuestion');
        }
        throw new Error('arrange question was not included in the 10-question session');
    } finally {
        await browser?.close();
        await new Promise(resolve => server.close(resolve));
    }
})().catch(error => { console.error(error); process.exitCode = 1; });

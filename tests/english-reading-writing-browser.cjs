const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.dirname(__dirname);
const server = http.createServer((request, response) => {
    const target = path.resolve(root, '.' + new URL(request.url, 'http://localhost').pathname);
    if (!target.startsWith(root + path.sep) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) return response.writeHead(404).end();
    response.setHeader('Content-Type', target.endsWith('.js') ? 'application/javascript; charset=utf-8' : target.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/html; charset=utf-8');
    response.end(fs.readFileSync(target));
});
const writingTypes = ['phrase-arrange', 'rewrite', 'reading-short'];

(async () => {
    let browser;
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        browser = await chromium.launch({ channel: 'chrome', headless: true });
        const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, serviceWorkers: 'block' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('dialog', dialog => dialog.type() === 'beforeunload' ? dialog.accept() : dialog.dismiss());
        const base = `http://127.0.0.1:${server.address().port}`;
        const study = base + '/english_reading.html?level=grade6&unit=er1&passage=er1-p0&mode=study';
        await page.route('**/*', route => {
            const url = route.request().url();
            if (url.includes('chart.umd.min.js')) {
                return route.fulfill({ contentType: 'application/javascript', body: 'window.Chart = class { destroy() {} };' });
            }
            return !url.startsWith(base) || /firebase-sync.js|version-check.js|notification-client.js|parent-scope-guard.js/.test(url)
                ? route.fulfill({ contentType: 'application/javascript', body: '' }) : route.continue();
        });
        const screenshot = async (name, selector) => {
            if (!process.env.READING_WRITING_SCREENSHOTS) return;
            await page.locator(selector).screenshot({ path: path.join(process.env.READING_WRITING_SCREENSHOTS, name + '.png') });
        };
        await page.addInitScript(() => localStorage.setItem('SmartStudy_ActiveUser', 'reading-writing-browser-test'));
        await page.goto(study);
        await page.waitForSelector('#studyTimerBar');
        await page.evaluate(async () => {
            const { LocalRepository: repo, LearningPlan: planner, StorageKeys: keys } = SmartStudy;
            const user = repo.getActiveUser();
            planner.applyParentSettings(user, { grade: 6, semester: 2, budgetMinutes: 45, englishActivity: 'reading' });
            const plan = planner.createPlan(user);
            const task = plan.tasks.find(item => item.subject === 'english_reading');
            task.context = { levelId: 'grade6', unitId: 'er1', title: '달을 바라보는 밤' };
            task.targetUrl = 'english_reading.html?level=grade6&unit=er1';
            planner.savePlan(plan);
            planner.startTask(user, task.id);
            repo.setNumber(keys.timerTime(user, 'english_reading:grade6', planner.today()), 9999);
            await repo.flush();
        });
        await page.reload();
        await page.locator('#todayFlow .today-flow-primary').click();
        const current = () => page.evaluate(() => {
            const session = EnglishReadingApp.getSession();
            return session.questions.find(item => item.id === session.roundQuestionIds[session.questionIndex]);
        });
        const next = () => page.locator('#nextQuestion').click();
        const tokens = page.locator('#arrangeBank button');
        const input = page.locator('#arrangeInput');
        await page.waitForSelector('#quizPanel:visible');
        const first = await current();
        assert.equal(first.type, writingTypes[0]);
        assert.equal(await page.evaluate(() => EnglishReadingApp.getSession().questions.length), 10);
        assert.equal(await page.locator('#quizPassage .translation').count(), 0);
        assert.equal(await page.locator('#toggleQuizTranslation').count(), 0);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await screenshot('01-phrases', '#arrangeArea');
        const firstIndex = first.tokens.findIndex(token => first.answer.startsWith(token));
        await tokens.nth(firstIndex).click();
        await page.reload();
        await page.waitForSelector('#quizPanel:visible');
        assert.equal(await input.inputValue(), first.tokens[firstIndex]);
        assert(await tokens.nth(firstIndex).isDisabled());
        const continueQuiz = async () => {
            const button = page.locator('.quiz-integrity-notice button');
            if (await button.isVisible()) await button.click();
        };
        await continueQuiz();
        await page.locator('#arrangeReset').click();
        for (let i = 0; i < first.tokens.length; i++) await tokens.nth(i).click();
        await page.locator('#arrangeSubmit').click();
        assert.match(await page.locator('#quizFeedback').innerText(), /다시 확인/);
        await next();

        assert.equal((await current()).type, writingTypes[1]);
        await input.fill('She looked');
        await page.reload();
        await page.waitForSelector('#quizPanel:visible');
        await continueQuiz();
        assert.equal(await input.inputValue(), 'She looked');
        assert.equal(await page.locator('#arrangeBank').isVisible(), false);
        await input.fill('she looked at the moon');
        await input.press('Enter');
        await input.press('Enter').catch(() => {});
        assert.match(await page.locator('#quizFeedback').innerText(), /정답입니다/);
        assert.equal(await page.evaluate(() => EnglishReadingApp.getSession().initialAttempts.length), 2);
        await next();

        assert.equal((await current()).type, writingTypes[2]);
        await page.locator('#showHint').click();
        await input.fill('The part that shines grows bigger.');
        await page.locator('#arrangeSubmit').click();
        assert.match(await page.locator('#quizFeedback').innerText(), /확인 필요/);
        await screenshot('02-answer-pending', '#quizFeedback');
        await next();
        for (let i = 0; i < 7; i++) {
            const question = await current();
            await page.locator(`#quizChoices [data-choice="${question.answerIndex}"]`).click();
            await next();
        }
        await page.waitForSelector('#resultModal:visible');
        await page.waitForSelector('#todayResultFlow a', {timeout: 5000});
        assert.match(await page.locator('#pendingWritingNote').innerText(), /확인 필요 1개 · 전체 10문항/);
        assert.match(await page.locator('#todayResultFlow a').innerText(), /다음 활동/);
        await screenshot('03-results', '#resultModal .modal-inner');
        const readReports = () => page.evaluate(() => SmartStudy.LocalRepository.listReports(SmartStudy.LocalRepository.getActiveUser()));
        let reports = await readReports();
        assert.equal(reports.length, 1);
        assert.equal(reports[0].totalQuestions, 9);
        assert.equal(reports[0].metadata.initialAttempts.length, 10);
        assert.equal(reports[0].metadata.initialAttempts[2].correct, null);
        assert.equal(reports[0].metadata.initialAttempts[2].gradingStatus, 'review_pending');
        assert.equal(reports[0].metadata.initialAttempts[2].hintUsed, true);
        assert.equal(await page.evaluate(() => (WrongNote.getAll().english_reading || []).some(item => item.questionType === 'reading-short')), false);

        await page.locator('#retryWrong').click();
        assert.equal(await page.evaluate(() => EnglishReadingApp.getSession().roundQuestionIds.length), 1);
        assert.equal((await current()).type, writingTypes[0]);
        assert.equal(await page.locator('#quizPassage .translation').count(), 0);
        let remainder = first.answer;
        const available = first.tokens.map((text, index) => ({ text, index }));
        while (available.length) {
            const match = available.findIndex(token => remainder.startsWith(token.text));
            assert(match >= 0);
            const [{ index, text }] = available.splice(match, 1);
            await tokens.nth(index).click();
            remainder = remainder.slice(text.length).trimStart();
        }
        await page.locator('#arrangeSubmit').click();
        await next();
        await page.waitForSelector('#resultModal:visible');
        await page.reload();
        await page.waitForSelector('#resultModal:visible');
        reports = await readReports();
        assert.equal(reports.length, 1);
        assert.equal(reports[0].initialScore, 8);
        assert.equal(reports[0].finalScore, 9);
        assert.equal(reports[0].metadata.attempts.length, 11);
        await page.locator('#todayResultFlow a').click();
        await page.waitForURL(url => !url.pathname.endsWith('english_reading.html'));
        await page.goto(base + '/stats.html');
        await page.evaluate(() => SmartStudy.LocalRepository.ready);
        await page.locator('.page-tab[data-tab="quiz"]').click();
        await page.locator('.quiz-session-head').first().click();
        const learnerPending = page.locator('.answer-row').filter({ hasText: 'The part that shines grows bigger.' });
        assert.match(await learnerPending.innerText(), /확인 필요.*영어 단답/);
        assert.equal(await learnerPending.evaluate(row => row.classList.contains('wrong')), false);
        assert.match(await learnerPending.locator('xpath=ancestor::div[contains(@class, "quiz-session-card")]').locator('.session-score').innerText(), /확인 필요 1 \/ 전체 10/);

        await page.goto(base + '/report.html');
        await page.evaluate(() => SmartStudy.LocalRepository.ready);
        await page.locator('.subject-tab[data-subject="english_reading"]').click();
        await page.locator('.report-data-row').first().click();
        assert.match(await page.locator('.report-data-row').first().innerText(), /확인 필요 1개/);
        const reportPending = page.locator('.q-card').filter({ hasText: 'The part that shines grows bigger.' });
        assert.match(await reportPending.innerText(), /영어 단답 · 확인 필요/);

        await page.goto(base + '/admin.html');
        await page.evaluate(() => SmartStudy.LocalRepository.ready);
        await page.evaluate(report => {
            window._adminData = { userId: 'fixture', reports: [report], wrongAnswers: {} };
            document.querySelector('.wrap').innerHTML = buildQuizTab([report], {});
        }, reports[0]);
        await page.getByRole('button', { name: '문제별 답안 보기' }).click();
        assert.match(await page.locator('.quiz-score').innerText(), /확인 필요 1 \/ 전체 10/);
        const parentPending = page.locator('.quiz-answer-line').filter({ hasText: 'The part that shines grows bigger.' });
        assert.match(await parentPending.innerText(), /확인 필요.*영어 단답/);

        await page.goto(study);
        await page.evaluate(async report => {
            const repo = SmartStudy.LocalRepository;
            await repo.ready;
            repo.saveReports(repo.getActiveUser(), [report, { ...report, sessionId: report.sessionId + '-second' }]);
            await repo.flush();
        }, reports[0]);
        await page.locator('#practiceQuiz').click();
        await page.waitForSelector('#quizPanel:visible');
        assert.equal(await page.evaluate(() => EnglishReadingApp.getSession().writingPack), false, 'a pending submission still counts towards the writing exposure limit');

        await page.goto(base + '/english_reading.html?level=middle1&unit=mr1-unit1&passage=mr1-unit1-p2&mode=study');
        await page.waitForSelector('#studyTimerBar');
        await page.evaluate(async () => {
            const { LocalRepository: repo, LearningPlan: planner, StorageKeys: keys } = SmartStudy;
            repo.setNumber(keys.timerTime(repo.getActiveUser(), 'english_reading:middle1', planner.today()), 9999);
            await repo.flush();
        });
        await page.reload();
        await page.waitForSelector('#practiceQuiz:not(.stb-locked)');
        await page.locator('#practiceQuiz').click();
        await page.waitForSelector('#quizPanel:visible');
        assert.equal((await current()).type, writingTypes[0]);
        assert.equal(await page.evaluate(() => EnglishReadingApp.getSession().questions.length), 10);
        const inventory = await page.evaluate(() => {
            StudyTimer.isUnlocked = () => true;
            const repo = SmartStudy.LocalRepository, user = repo.getActiveUser();
            const passages = EnglishReadingData.units.flatMap(unit => unit.passages);
            const starts = [];
            const check = () => {
                for (const passage of passages) {
                    document.getElementById('backToStudy').click();
                    EnglishReadingApp.selectPassageById(passage.id);
                    EnglishReadingApp.startQuiz('practice');
                    starts.push(EnglishReadingApp.getSession()?.questions.length || 0);
                }
            };
            check();
            const attempts = passages.flatMap(passage => [
                ...passage.questions, ...EnglishReadingWriting.questions(passage.id)
            ].map(question => ({
                ...question, question: question.prompt, correctAnswer: question.answer ?? question.choices?.[question.answerIndex],
                correct: true, passageId: passage.id, passageText: passage.sentences
            })));
            repo.saveReports(user, [1, 2].map(index => ({
                sessionId: 'capacity-' + index, subject: 'english_reading', date: Date.now(),
                totalQuestions: attempts.length, metadata: { initialAttempts: attempts }
            })));
            check();
            return { passages: passages.length, starts: starts.length, min: Math.min(...starts), max: Math.max(...starts) };
        });
        assert.deepEqual(inventory, { passages: 116, starts: 232, min: 10, max: 10 });
        assert.deepEqual(errors, []);
        console.log('390px mobile writing pack, token and text reload, three answer states, Today completion and next activity, retry and idempotent report passed.');
    } finally {
        await browser?.close();
        await new Promise(resolve => server.close(resolve));
    }
})().catch(error => { console.error(error); process.exitCode = 1; });

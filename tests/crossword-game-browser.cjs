const assert = require("node:assert/strict"),
  http = require("node:http"),
  fs = require("node:fs"),
  path = require("node:path"),
  { chromium } = require("playwright");
const core = require("../functions/crossword-core"),
  bank = require("../functions/game-words.json");
(async () => {
  const root = path.resolve(__dirname, ".."),
    server = http.createServer((req, res) => {
      const file = path.resolve(
        root,
        "." + new URL(req.url, "http://localhost").pathname,
      );
      if (
        !file.startsWith(root + path.sep) ||
        !fs.existsSync(file) ||
        fs.statSync(file).isDirectory()
      ) {
        res.writeHead(404).end();
        return;
      }
      res.setHeader(
        "Content-Type",
        file.endsWith(".js")
          ? "text/javascript; charset=utf-8"
          : file.endsWith(".json")
            ? "application/json; charset=utf-8"
            : file.endsWith(".css")
              ? "text/css; charset=utf-8"
              : "text/html; charset=utf-8",
      );
      res.end(fs.readFileSync(file));
    });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      serviceWorkers: "block",
    });
    await context.addInitScript(() =>
      localStorage.setItem("SmartStudy_ActiveUser", "student"),
    );
    await context.route("https://raw.githubusercontent.com/**", (r) =>
      r.abort(),
    );
    await context.route("**/game-config.js*", r=>r.fulfill({contentType:"application/javascript",body:"window.SmartStudy=window.SmartStudy||{};window.SmartStudy.GameConfig={onlineEnabled:true};"}));
    await context.route("**/firebase-client.js", (r) =>
      r.fulfill({
        contentType: "application/javascript",
        body: "window.SmartStudy.FirebaseClient={getCurrentUser:async()=>({getIdToken:async()=>'fixture'})};",
      }),
    );
    await context.route("**/kakao-share.js", (r) =>
      r.fulfill({
        contentType: "application/javascript",
        body: "window.KakaoShare={_sendFeed:feed=>window.__sharedFeed=feed};",
      }),
    );
    const puzzle = core.create(bank["en-level1"], "browser-board"),
      now = Date.now();
    let submitted = null;
    await context.route("**/gameApi", async (route) => {
      const body = route.request().postDataJSON();
      let value;
      if (body.action === "start")
        value = {
          puzzleId: "browser-board",
          player: "me123",
          serverNow: now,
          puzzle: core.publicPuzzle(puzzle),
          state: {
            startedAt: now,
            nickname: "번개트레이너",
            hintIds: [],
            result: submitted,
          },
        };
      else if (body.action === "submit") {
        submitted = {
          ...core.grade(puzzle, body.answers),
          answers: Object.fromEntries(
            puzzle.entries.map((e) => [e.id, e.answer]),
          ),
        };
        value = submitted;
      } else if (body.action === "draft") value = { saved: true };
      else if (body.action === "ranking")
        value = {
          player: "me123",
          rows: [
            { player: "me123", nickname: "번개트레이너", score: 600 },
            { player: "other456", nickname: "잎새트레이너", score: 400 },
          ],
        };
      else
        value = {
          letter: puzzle.entries[0].answer[0],
          hintIds: [puzzle.entries[0].id],
        };
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(value),
      });
    });
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("dialog", (d) => d.accept());
    await page.goto(
      "http://127.0.0.1:" + server.address().port + "/learning-games.html",
      { waitUntil: "domcontentloaded", timeout: 15000 },
    );
    await page.waitForFunction(
      () => document.getElementById("startPractice").onclick,
    );
    await page.selectOption("#gameScope", "en-level1");
    await page.evaluate(() =>
      SmartStudy.LocalRepository.saveReports("student", [
        {
          subject: "english",
          sessionId: "studied",
          totalQuestions: 10,
          metadata: { unitId: "level1" },
        },
      ]),
    );
    await page.click("#startCompetition");
    await page.waitForSelector("#gamePlay:not([hidden])");
    for (const entry of puzzle.entries) {
      await page
        .locator(".clue-item")
        .filter({ hasText: entry.number + ". " })
        .click();
      await page.fill("#wordAnswer", entry.answer);
      await page.click("#saveWord");
      await page.waitForFunction(
        () => !document.getElementById("saveWord").disabled,
      );
    }
    assert(
      (await page.locator("#filledStatus").textContent()).startsWith("6/6"),
    );
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.getElementById("startPractice").onclick,
    );
    await page.click("#startCompetition");
    await page.waitForSelector("#gamePlay:not([hidden])");
    assert(
      (await page.locator("#filledStatus").textContent()).startsWith("6/6"),
    );
    await page.click("#submitGame");
    await page.waitForFunction(() =>
      document.getElementById("gameResult").textContent.includes("600"),
    );
    await page.waitForSelector("#challengePanel:not([hidden])");
    await page.click("#shareChallenge");
    assert(
      (await page.evaluate(() => window.__sharedFeed.description)).includes(
        "내 기록 넘을 수 있겠어",
      ),
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS crossword mobile: fill, cross-grid, draft reload, server score, ranking, selected-target Kakao preview.",
    );
  } finally {
    await browser.close();
    server.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

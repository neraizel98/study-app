const assert = require("node:assert/strict"),
  http = require("node:http"),
  fs = require("node:fs"),
  path = require("node:path"),
  { chromium } = require("playwright");
const core = require("../functions/word-chain-core"),
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
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      serviceWorkers: "block",
    });
    await context.addInitScript(() =>
      localStorage.setItem("SmartStudy_ActiveUser", "student"),
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
    let gameState = core.create(
      bank["en-level1"],
      "en-level1",
      "browser-chain",
      Date.now(),
    );
    await context.route("**/gameApi", async (route) => {
      const body = route.request().postDataJSON();
      assert.equal(body.game, "chain");
      let response;
      if (body.action === "ranking")
        response = {
          player: "myplayer",
          rows: [
            {
              player: "myplayer",
              nickname: "파도트레이너",
              score: core.score(gameState),
            },
            { player: "otherplayer", nickname: "번개트레이너", score: 0 },
          ],
        };
      else {
        if (body.action !== "start")
          gameState = core.apply(
            gameState,
            bank["en-level1"],
            body.action,
            body,
            Date.now(),
          );
        response = {
          player: "myplayer",
          puzzleId: "browser-chain",
          serverNow: Date.now(),
          nickname: "파도트레이너",
          state: core.publicState(gameState),
        };
      }
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("dialog", (d) => d.accept());
    const url =
      "http://127.0.0.1:" + server.address().port + "/word-chain.html";
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.getElementById("chainPractice").onclick,
    );
    await page.selectOption("#chainScope", "en-level1");
    await page.evaluate(() =>
      SmartStudy.LocalRepository.saveReports("student", [
        {
          subject: "english",
          sessionId: "learned",
          totalQuestions: 10,
          metadata: { unitId: "level1" },
        },
      ]),
    );
    await page.click("#chainStart");
    await page.waitForSelector("#chainPlay:not([hidden])");
    const pool = core.dictionary(bank["en-level1"], "en-level1");
    const first = core.successors(
      pool,
      gameState.currentWord,
      gameState.used,
    )[0];
    await page.fill("#chainInput", first.answer);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.getElementById("chainPractice").onclick,
    );
    await page.click("#chainStart");
    await page.waitForSelector("#chainPlay:not([hidden])");
    assert.equal(await page.inputValue("#chainInput"), first.answer);
    await page.click("#chainWord");
    await page.waitForSelector("#chainMeaningArea:not([hidden])");
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.getElementById("chainPractice").onclick,
    );
    await page.click("#chainStart");
    await page.waitForSelector("#chainMeaningArea:not([hidden])");
    await page.getByRole("button", { name: first.clue, exact: true }).click();
    await page.waitForFunction(
      () => !document.getElementById("chainStart").disabled,
    );
    while (!gameState.finishedAt) {
      const next = core.successors(
        pool,
        gameState.currentWord,
        gameState.used,
      )[0];
      assert(next, "a displayed turn must be playable");
      await page.fill("#chainInput", next.answer);
      await page.click("#chainWord");
      await page.waitForSelector("#chainMeaningArea:not([hidden])");
      await page.getByRole("button", { name: next.clue, exact: true }).click();
      await page.waitForFunction(
        () => !document.getElementById("chainStart").disabled,
      );
    }
    assert(
      (await page.locator("#chainResult").textContent()).includes(
        core.score(gameState) + "점",
      ),
    );
    await page.waitForSelector("#chainChallenge:not([hidden])");
    await page.click("#chainShare");
    assert(
      (await page.evaluate(() => window.__sharedFeed.description)).includes(
        "내 항로 따라올 수 있겠어",
      ),
    );
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.click("#chainPractice");
    await page.waitForSelector("#chainWordArea:not([hidden])");
    const used = await page.locator("#chainHistory span").allTextContents(),
      current = await page.locator("#chainCurrent").textContent();
    const next = core.successors(pool, current, used)[0];
    await page.fill("#chainInput", next.answer);
    await page.click("#chainWord");
    await page.waitForSelector("#chainMeaningArea:not([hidden])");
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.getElementById("chainPractice").onclick,
    );
    await page.click("#chainPractice");
    await page.waitForSelector("#chainMeaningArea:not([hidden])");
    assert.equal(
      await page.locator("#chainMeaningTitle").textContent(),
      next.answer,
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS word chain mobile: typed draft, pending meaning reload, 10-turn play, score, independent ranking, Kakao preview and practice restoration.",
    );
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

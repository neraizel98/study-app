const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http"),
  { chromium } = require("playwright");
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
          : file.endsWith(".css")
            ? "text/css; charset=utf-8"
            : file.endsWith(".json")
              ? "application/json; charset=utf-8"
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
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("dialog", (d) => d.accept());
    let onlineRequests = 0;
    await context.route("**/gameApi", (route) => {
      onlineRequests++;
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ error: "not deployed" }),
      });
    });
    const base = "http://127.0.0.1:" + server.address().port;
    await page.goto(base + "/game-menu.html", {
      waitUntil: "domcontentloaded",
    });
    assert.equal(await page.locator(".game-menu-grid a").count(), 2);
    assert.equal(await page.locator(".game-menu-grid article").count(), 4);
    assert(
      await page.evaluate(
        () =>
          document
            .querySelector(".ranking-portal")
            .compareDocumentPosition(
              document.querySelector(".game-menu-grid"),
            ) & Node.DOCUMENT_POSITION_PRECEDING,
      ),
    );
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.getByRole("link", { name: /끝말잇기 항구/ }).click();
    await page.waitForFunction(
      () => document.getElementById("gameStart")?.onclick,
    );
    assert.equal(await page.locator("[data-level]").count(), 0);
    await page.click("#gameStart");
    await page.waitForSelector("#chainPlay:not([hidden])");
    await page.goto(base + "/game-rankings.html", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(() =>
      document.getElementById("rankingStatus").textContent.includes("준비 중"),
    );
    assert(await page.locator("#rankingRefresh").isDisabled());
    assert.equal(onlineRequests, 0);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    assert.deepEqual(errors, []);
    const live = await browser.newContext({
      viewport: { width: 390, height: 844 },
      serviceWorkers: "block",
    });
    await live.addInitScript(() =>
      localStorage.setItem("SmartStudy_ActiveUser", "student"),
    );
    await live.route("**/game-config.js*", (r) =>
      r.fulfill({
        contentType: "application/javascript",
        body: "window.SmartStudy.GameConfig={onlineEnabled:true};",
      }),
    );
    await live.route("**/firebase-client.js*", (r) =>
      r.fulfill({
        contentType: "application/javascript",
        body: "window.SmartStudy.FirebaseClient={getCurrentUser:async()=>({getIdToken:async()=>'fixture'})};",
      }),
    );
    await live.route("**/gameApi", (route) => {
      const body = route.request().postDataJSON();
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          puzzleId:
            (body.game === "chain" ? "chain-v1" : "crossword-v1") +
            "_2026-11-06_" +
            body.scope,
          player: "me",
          rows: [
            { player: "me", nickname: "파도", score: 400 },
            { player: "other", nickname: "번개", score: 400 },
            { player: "third", nickname: "잎새", score: 200 },
          ],
        }),
      });
    });
    const ranking = await live.newPage();
    await ranking.goto(base + "/game-rankings.html", {
      waitUntil: "domcontentloaded",
    });
    await ranking.waitForSelector(".rank-row");
    assert.deepEqual(
      await ranking.locator(".rank-row b:first-child").allTextContents(),
      ["1위", "1위", "3위"],
    );
    await ranking.selectOption("#rankingGame", "chain");
    await ranking.waitForFunction(() =>
      document.getElementById("rankingPlay").href.includes("word-chain.html"),
    );
    assert(
      (await ranking.locator("#rankingPlay").getAttribute("href")).includes(
        "scope=ko-level1",
      ),
    );
    console.log(
      "PASS game hub mobile: character cards, separate ranking area, playable practice, disabled undeployed service, and online ranking fixtures with tied ranks.",
    );
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

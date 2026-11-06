const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http"),
  { chromium } = require("playwright");
module.exports = async function run(kind) {
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
      const ext = path.extname(file);
      res.setHeader(
        "Content-Type",
        ({
          ".js": "text/javascript",
          ".css": "text/css",
          ".json": "application/json",
          ".png": "image/png",
        }[ext] || "text/html") + "; charset=utf-8",
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
      localStorage.setItem("SmartStudy_ActiveUser", "우준"),
    );
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("dialog", (d) => d.accept());
    const base = "http://127.0.0.1:" + server.address().port,
      filename = kind === "chain" ? "word-chain.html" : "learning-games.html",
      play = kind === "chain" ? "#chainPlay" : "#gamePlay";
    const stored = () =>
      page.evaluate((kind) => {
        const r = SmartStudy.LocalRepository;
        return r.getPreference(
          "SmartStudy_Arcade_" +
            kind +
            "_" +
            encodeURIComponent(r.getActiveUser()) +
            (kind === "chain" ? "_ko-free" : "_ko-stage1"),
          null,
        );
      }, kind);
    await page.goto(base + "/" + filename);
    await page.waitForSelector("#gameStart");
    assert.equal(await page.locator("#arcadePlayer").textContent(), "우준이");
    assert.equal(
      await page.locator("[data-level]").count(),
      kind === "chain" ? 0 : 10,
    );
    assert.equal(await page.locator("input").count(), 1);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.screenshot({
      path: path.join(root, "scratch", kind + "-arcade-mobile.png"),
      fullPage: true,
    });
    await page.click("#gameStart");
    await page.waitForSelector(play + ":not([hidden])");
    if (kind === "crossword") {
      const g = await stored();
      const entry = g.solution.entries[0];
      await page.fill("#wordAnswer", entry.answer.slice(0, 1));
      await page.reload();
      await page.waitForSelector("#gameStart");
      await page.click("#gameStart");
      assert.equal(
        await page.inputValue("#wordAnswer"),
        entry.answer.slice(0, 1),
      );
      for (let run = 0; run < 2; run++) {
        await page.waitForSelector("#gamePlay:not([hidden])");
        const active = await stored();
        for (const entry of active.solution.entries) {
          await page
            .locator("#clueList button")
            .filter({ hasText: entry.clue })
            .click();
          await page.fill("#wordAnswer", entry.answer);
          await page.click("#saveWord");
        }
        await page.click("#submitGame");
        await page.waitForFunction(
          () =>
            SmartStudy.LocalRepository.getPreference(
              "SmartStudy_Arcade_crossword_" +
                encodeURIComponent("우준") +
                "_ko-stage1",
              {},
            ).progressRecorded,
        );
        assert(
          (await page.locator("#gameResult").textContent()).includes(
            active.solution.entries.length +
              "/" +
              active.solution.entries.length,
          ),
        );
        await page.click("#nextGame");
        if (run === 0) await page.click("#gameStart");
      }
      assert.equal(
        await page.locator("#arcadeRecommended").textContent(),
        "추천 Lv.2",
      );
      await page.reload();
      await page.waitForSelector("#gameStart");
      assert.equal(
        await page.locator("#arcadeRecommended").textContent(),
        "추천 Lv.2",
      );
      await page.click("[data-language=en]");
      assert.equal(
        await page.locator("#arcadeRecommended").textContent(),
        "추천 Lv.1",
      );
      // Every stage launches without a studied-word gate.
      for (const lang of ["ko", "en"])
        for (const level of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
          await page.click("[data-language=" + lang + "]");
          await page.click('[data-level="' + level + '"]');
          await page.click("#gameStart");
          await page.waitForSelector("#gamePlay:not([hidden])");
          assert(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          );
          await page.click("#changeLevel");
        }
    } else {
      let g = await stored();
      const words = g.words;
      let move = words.find(
        (w) =>
          !g.state.used.includes(w.answer) &&
          w.answer.startsWith([...g.state.currentWord].at(-1)),
      );
      await page.fill("#chainInput", move.answer);
      await page.reload();
      await page.waitForSelector("#gameStart");
      await page.click("#gameStart");
      assert.equal(await page.inputValue("#chainInput"), move.answer);
      await page.click("#chainWord");
      await page.waitForSelector("#chainMeaningArea:not([hidden])");
      await page.reload();
      await page.waitForSelector("#gameStart");
      await page.click("#gameStart");
      assert(await page.locator("#chainMeaningArea").isVisible());
      while (true) {
        g = await stored();
        if (g.state.finishedAt) break;
        if (!g.state.pending) {
          move = g.words.find(
            (w) =>
              !g.state.used.includes(w.answer) &&
              w.answer.startsWith([...g.state.currentWord].at(-1)),
          );
          assert(move);
          await page.fill("#chainInput", move.answer);
          await page.click("#chainWord");
          g = await stored();
        }
        await page
          .getByRole("button", {
            name: g.privateState.pending.answer,
            exact: true,
          })
          .click();
      }
      assert.equal((await stored()).state.score, 1000);
      assert(
        (await page.locator("#chainResult").textContent()).includes("10턴"),
      );
      await page.click("#chainNext");
      for (const lang of ["ko", "en"]) {
        await page.click("[data-language=" + lang + "]");
        await page.click("#gameStart");
        await page.waitForSelector("#chainPlay:not([hidden])");
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        );
        await page.click("#chainChangeLevel");
      }
    }
    assert.deepEqual(errors, []);
    console.log(
      "PASS " +
        kind +
        ": mobile setup, automatic identity, stages, saved resume, grading and progress",
    );
  } finally {
    await browser.close();
    server.close();
  }
};

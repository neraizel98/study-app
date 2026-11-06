(function () {
  "use strict";
  const $ = (id) => document.getElementById(id),
    app = window.SmartStudy,
    repo = app.LocalRepository;
  let user,
    game,
    selected,
    busy = false,
    timer,
    setup;
  const current = () => repo.getActiveUser() === user;
  const key = (scope) =>
    "SmartStudy_Arcade_crossword_" + encodeURIComponent(user) + "_" + scope;
  const status = (message) => ($("hintStatus").textContent = message);
  async function save() {
    if (!game || !current()) return;
    if (repo.setPreference(key(game.scope), game) === false)
      throw Error("기기 저장 공간을 확인해 주세요.");
    await repo.flush();
  }
  async function safeSave() {
    try {
      await save();
    } catch (e) {
      status("현재 화면에서는 계속할 수 있어요. " + e.message);
    }
  }
  async function start(config) {
    if (!current()) throw Error("학습자를 다시 선택해 주세요.");
    const old =
      repo.getPreference(key(config.scope), null) ||
      GameSetup.resumeLegacy(repo, user, "crossword", config.scope);
    if (old && !old.result && old.solution)
      game = {
        ...old,
        ...config,
        nickname: config.name,
        drafts: old.drafts || {},
      };
    else {
      const response = await fetch("functions/game-level-words.json");
      if (!response.ok)
        throw Error("단어 자료를 불러오지 못했어요. 다시 눌러 주세요.");
      const bank = await response.json(),
        seed = config.scope + ":" + Date.now() + ":" + crypto.randomUUID();
      const solution = GameLevels.createPuzzle(
        CrosswordCore.create,
        bank[config.scope],
        seed,
        config.level,
      );
      game = {
        ...config,
        puzzleId: seed,
        puzzle: CrosswordCore.publicPuzzle(solution),
        solution,
        startedAt: Date.now(),
        hintIds: [],
        answers: {},
        drafts: {},
        nickname: config.name,
        result: null,
      };
    }
    selected = game.puzzle.entries[0].id;
    show();
    await safeSave();
  }
  function show() {
    $("gamePlay").hidden = false;
    $("gameSetupPanel").hidden = true;
    $("puzzleTitle").textContent = game.nickname + " · Lv." + game.level;
    const grid = $("crosswordGrid");
    grid.style.gridTemplateColumns =
      "repeat(" + game.puzzle.width + ",minmax(0,1fr))";
    grid.replaceChildren();
    const cells = new Map();
    for (const entry of game.puzzle.entries)
      for (let i = 0; i < entry.length; i++) {
        const x = entry.x + (entry.axis === "across" ? i : 0),
          y = entry.y + (entry.axis === "down" ? i : 0),
          k = x + "," + y,
          cell = cells.get(k) || { entries: [], letters: [], numbers: [] };
        cell.entries.push(entry.id);
        const answer =
          game.result?.answers?.[entry.id] || game.answers[entry.id] || "";
        if (answer[i]) cell.letters.push(answer[i]);
        if (i === 0) cell.numbers.push(entry.number);
        cells.set(k, cell);
      }
    for (let y = 0; y < game.puzzle.height; y++)
      for (let x = 0; x < game.puzzle.width; x++) {
        const cell = cells.get(x + "," + y),
          el = document.createElement(cell ? "button" : "span");
        el.className =
          "crossword-cell" +
          (!cell ? " block" : cell.entries.includes(selected) ? " active" : "");
        if (cell) {
          el.type = "button";
          const letters = [...new Set(cell.letters)];
          el.textContent = letters.length > 1 ? "?" : letters[0] || "";
          el.setAttribute(
            "aria-label",
            y + 1 + "행 " + (x + 1) + "열 " + (el.textContent || "빈칸"),
          );
          if (cell.numbers.length) {
            const num = document.createElement("small");
            num.textContent = cell.numbers.join("/");
            el.append(num);
          }
          el.onclick = () => {
            selected =
              cell.entries.find((id) => id !== selected) || cell.entries[0];
            show();
          };
        }
        grid.append(el);
      }
    const list = $("clueList");
    list.replaceChildren();
    for (const entry of game.puzzle.entries) {
      const button = document.createElement("button");
      button.className =
        "clue-item" + (entry.id === selected ? " selected" : "");
      button.textContent =
        entry.number +
        ". " +
        (entry.axis === "across" ? "가로" : "세로") +
        " · " +
        entry.clue +
        " (" +
        entry.length +
        ")";
      button.onclick = () => {
        selected = entry.id;
        show();
        $("wordAnswer").focus();
      };
      list.append(button);
    }
    const entry = game.puzzle.entries.find((e) => e.id === selected);
    $("selectedClue").textContent =
      entry.number + ". " + entry.clue + " (" + entry.length + ")";
    $("wordAnswer").value =
      game.drafts?.[selected] ?? game.answers[selected] ?? "";
    $("wordAnswer").maxLength = entry.length;
    for (const id of ["wordAnswer", "saveWord", "wordHint", "submitGame"])
      $(id).disabled = !!game.result;
    $("filledStatus").textContent =
      game.puzzle.entries.filter(
        (e) => (game.answers[e.id] || "").length === e.length,
      ).length +
      "/" +
      game.puzzle.entries.length +
      " 낱말 입력";
    $("gameResult").textContent = game.result
      ? (game.result.expired ? "제한 시간이 끝났어요. " : "") +
        game.result.correct +
        "/" +
        game.result.total +
        " 정답 · " +
        game.result.score +
        "점"
      : "";
    $("nextGame").hidden = !game.result;
    clearInterval(timer);
    tick();
    if (!game.result) timer = setInterval(tick, 1000);
  }

  function tick() {
    if (!game || !current()) {
      clearInterval(timer);
      return;
    }
    if (game.result) {
      $("gameClock").textContent = "FINISH";
      clearInterval(timer);
      return;
    }
    const seconds = Math.max(
      0,
      600 - Math.floor((Date.now() - game.startedAt) / 1000),
    );
    $("gameClock").textContent =
      Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
    if (!seconds && !busy) submit(true);
  }
  async function put() {
    if (busy || !game || game.result || !current()) return;
    const entry = game.puzzle.entries.find((e) => e.id === selected),
      value = $("wordAnswer").value.normalize("NFC").trim().toLowerCase();
    if (
      value.length !== entry.length ||
      !(game.language === "en" ? /^[a-z]+$/ : /^[가-힣]+$/).test(value)
    ) {
      status(entry.length + "글자로 입력해 주세요.");
      return;
    }
    game.answers[selected] = value;
    game.drafts[selected] = value;
    const next = game.puzzle.entries.find((e) => !game.answers[e.id]);
    if (next) selected = next.id;
    show();
    status(
      next ? "다음 낱말에 도전!" : "모두 입력했어요. 답안 제출을 눌러 주세요.",
    );
    await safeSave();
  }
  async function hint() {
    if (busy || !game || game.result || !current()) return;
    const entry = game.solution.entries.find((e) => e.id === selected);
    game.hintIds = [...new Set([...game.hintIds, selected])];
    status("첫 글자: " + entry.answer[0] + " · 이 낱말 힌트 −20점");
    await safeSave();
  }
  async function submit(expired = false) {
    if (busy || !game || game.result || !current()) return;
    if (!expired && !confirm("현재 답안으로 채점할까요?")) return;
    busy = true;
    try {
      game.result = {
        ...CrosswordCore.grade(game.solution, game.answers, game.hintIds),
        expired,
        answers: Object.fromEntries(
          game.solution.entries.map((e) => [e.id, e.answer]),
        ),
      };
      show();
      await safeSave();
      if (!game.progressRecorded) {
        const promotion = await setup.record({
          id: game.puzzleId,
          language: game.language,
          level: game.level,
          score: game.result.score,
          maxScore: game.puzzle.entries.length * 100,
          words: game.solution.entries.map((e) => e.answer),
        });
        game.progressRecorded = true;
        game.recommended = promotion.recommended;
        await safeSave();
        $("gameResult").textContent +=
          " · " +
          (promotion.promoted ? "LEVEL UP! 추천 Lv." : "추천 Lv.") +
          promotion.recommended;
      }
    } catch (e) {
      status(e.message);
    } finally {
      busy = false;
    }
  }
  function choose() {
    clearInterval(timer);
    $("gamePlay").hidden = true;
    $("gameSetupPanel").hidden = false;
    setup.refresh();
  }
  (async () => {
    await repo.ready;
    user = repo.getActiveUser();
    if (!user) {
      $("gameSetup").textContent = "대시보드에서 학습자를 선택해 주세요.";
      return;
    }
    setup = GameSetup.mount({ user, game: "crossword", onStart: start });
    $("saveWord").onclick = put;
    $("wordHint").onclick = hint;
    $("submitGame").onclick = () => submit();
    $("wordAnswer").onkeydown = (e) => {
      if (e.key === "Enter" && !e.isComposing) {
        e.preventDefault();
        put();
      }
    };
    $("wordAnswer").oninput = () => {
      if (game && !game.result && current()) {
        game.drafts[selected] = $("wordAnswer").value;
        safeSave();
      }
    };
    $("changeLevel").onclick = choose;
    $("nextGame").onclick = choose;
    $("leaveGame").onclick = async () => {
      await safeSave();
      choose();
    };
    window.addEventListener("focus", () => {
      if (!current()) location.reload();
    });
  })().catch((e) => {
    $("gameSetup").textContent = e.message;
  });
})();

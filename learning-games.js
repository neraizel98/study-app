(function () {
  "use strict";
  const $ = (id) => document.getElementById(id),
    app = window.SmartStudy;
  let user = "",
    game = null,
    selected = null,
    busy = false,
    timer = null,
    offset = 0,
    rankRows = [],
    player = null;
  const day = () =>
    new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  const key = (scope) =>
    "SmartStudy_Crossword_" +
    encodeURIComponent(user) +
    "_" +
    day() +
    "_" +
    scope;
  const current = () => app.LocalRepository.getActiveUser() === user;
  function status(message) {
    $("gameStatus").textContent = message;
  }
  function lock(value) {
    busy = value;
    for (const id of [
      "startCompetition",
      "startPractice",
      "submitGame",
      "wordHint",
      "saveWord",
      "refreshRanking",
    ])
      $(id).disabled =
        value ||
        (window.SmartStudy.GameConfig?.onlineEnabled === false &&
          ["startCompetition", "refreshRanking"].includes(id)) ||
        Boolean(
          game?.result && ["submitGame", "wordHint", "saveWord"].includes(id),
        );
  }
  async function save() {
    if (!game || !current()) return;
    if (
      app.LocalRepository.setPreference(
        key(game.scope) + (game.competitive ? "" : "_practice"),
        game,
      ) === false
    )
      throw Error("저장 공간을 확인해 주세요.");
    await app.LocalRepository.flush();
  }
  async function api(action, extra = {}) {
    if (!current()) throw Error("학습자가 바뀌었습니다. 다시 열어 주세요.");
    const auth = await app.FirebaseClient.getCurrentUser();
    if (!auth)
      throw Error(
        "Google 계정 연결이 필요합니다. 연습으로 시작할 수도 있어요.",
      );
    const token = await auth.getIdToken(),
      controller = new AbortController(),
      timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(
        "https://us-central1-" +
          app.FirebaseConfig.app.projectId +
          ".cloudfunctions.net/gameApi",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            action,
            learner: user,
            scope: game?.scope || $("gameScope").value,
            puzzleId: game?.competitive ? game.puzzleId : undefined,
            ...extra,
          }),
          signal: controller.signal,
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw Error(result.error || "게임 서버에 연결하지 못했습니다.");
      if (!current()) throw Error("학습자가 바뀌었습니다.");
      return result;
    } catch (error) {
      if (error.name === "AbortError")
        throw Error("서버 응답이 늦어요. 다시 눌러 주세요.");
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
  function learned(scope) {
    const [language, level] = scope.split("-");
    return app.LocalRepository.listReports(user).some(
      (r) =>
        r.subject === (language === "ko" ? "korean_vocab" : "english") &&
        Number(r.totalQuestions) > 0 &&
        !r.metadata?.draft &&
        [r.metadata?.levelId, r.metadata?.unitId, r.level].includes(level),
    );
  }
  async function start(competitive) {
    if (competitive && app.GameConfig?.onlineEnabled === false) {
      status("온라인 도전은 준비 중이에요. 연습으로 시작해 주세요.");
      return;
    }
    if (busy || !current()) return;
    const scope = $("gameScope").value,
      nickname = $("gameNickname").value.trim();
    if (competitive && !learned(scope)) {
      status(
        "이 범위의 학습 퀴즈 기록이 아직 없어요. 먼저 공부하거나 연습으로 시작해 주세요.",
      );
      return;
    }
    app.LocalRepository.setPreference(
      "SmartStudy_GameScope_" + encodeURIComponent(user),
      scope,
    );
    lock(true);
    rankRows = [];
    $("challengePanel").hidden = true;
    $("gameRanking").replaceChildren();
    try {
      const old = app.LocalRepository.getPreference(key(scope), null);
      if (competitive) {
        const result = await api("start", {
          scope,
          nickname,
          puzzleId: undefined,
        });
        player = result.player;
        offset = result.serverNow - Date.now();
        game = {
          competitive: true,
          scope,
          puzzleId: result.puzzleId,
          puzzle: result.puzzle,
          startedAt: result.state.startedAt,
          hintIds: result.state.hintIds,
          result: result.state.result,
          answers: {
            ...(result.state.answers || {}),
            ...(old?.competitive && old.puzzleId === result.puzzleId
              ? old.answers || {}
              : {}),
          },
          nickname: result.state.nickname,
        };
      } else {
        const savedPractice = app.LocalRepository.getPreference(
          key(scope) + "_practice",
          null,
        );
        if (savedPractice && !savedPractice.result) {
          game = savedPractice;
          offset = 0;
          await save();
          selected = game.puzzle.entries[0].id;
          show();
          status("저장한 연습을 이어서 시작해요.");
          return;
        }
        const response = await fetch("functions/game-words.json");
        if (!response.ok) throw Error("단어 자료를 불러오지 못했어요.");
        const bank = await response.json(),
          seen = new Set();
        const subject = scope.startsWith("ko-") ? "korean_vocab" : "english";
        for (const report of app.LocalRepository.listReports(user).filter(
          (r) => r.subject === subject,
        )) {
          for (const attempt of report.metadata?.initialAttempts ||
            report.metadata?.attempts ||
            []) {
            if (attempt.wordId) seen.add(attempt.wordId);
            if (attempt.word) seen.add(String(attempt.word).toLowerCase());
          }
        }
        const studied = bank[scope].filter(
          (w) => seen.has(w.id) || seen.has(w.answer),
        );
        let puzzle,
          practiceRange = "학습한 단어 연습";
        try {
          puzzle = CrosswordCore.create(
            studied,
            day() + scope + ":studied:" + Date.now(),
          );
        } catch (error) {
          if (
            !confirm(
              "교차할 수 있는 학습 단어가 아직 부족해요. 이 레벨 전체 단어로 자유 연습할까요?",
            )
          )
            return;
          puzzle = CrosswordCore.create(
            bank[scope],
            day() + scope + ":practice:" + Date.now(),
          );
          practiceRange = "레벨 전체 자유 연습";
        }
        game = {
          competitive: false,
          practiceRange,
          scope,
          puzzleId: puzzle.seed,
          puzzle: CrosswordCore.publicPuzzle(puzzle),
          solution: puzzle,
          startedAt: Date.now(),
          hintIds: [],
          answers: {},
          nickname: nickname || "연습 트레이너",
          result: null,
        };
        offset = 0;
      }
      await save();
      selected = game.puzzle.entries[0].id;
      show();
      status(
        game.competitive
          ? "순위 도전 중 · 같은 판은 새로고침해도 이어져요."
          : (game.practiceRange || "연습 모드") +
              " · 순위에는 올라가지 않아요.",
      );
      if (game.result) await ranking();
      $("gamePlay").scrollIntoView({ block: "start", behavior: "smooth" });
    } catch (error) {
      status(error.message);
    } finally {
      lock(false);
    }
  }
  function show() {
    $("gamePlay").hidden = false;
    $("gameScope").disabled = !game.result;
    $("gameNickname").disabled = !game.result;
    $("puzzleTitle").textContent = game.competitive
      ? "오늘의 십자말 숲"
      : "십자말 숲 · 연습";
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
    clearInterval(timer);
    tick();
    if (!game.result) timer = setInterval(tick, 1000);
  }
  function tick() {
    if (!game || game.result) {
      $("gameClock").textContent = "종료";
      clearInterval(timer);
      return;
    }
    const seconds = Math.max(
      0,
      600 - Math.floor((Date.now() + offset - game.startedAt) / 1000),
    );
    $("gameClock").textContent =
      Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
    if (seconds === 0 && !busy) submit(true);
  }
  async function put() {
    if (!game || game.result || busy || !current()) return;
    const entry = game.puzzle.entries.find((e) => e.id === selected),
      value = $("wordAnswer").value.normalize("NFC").trim().toLowerCase();
    if (
      value.length !== entry.length ||
      !(game.scope.startsWith("en-") ? /^[a-z]+$/ : /^[가-힣]+$/).test(value)
    ) {
      $("hintStatus").textContent = entry.length + "글자로 입력해 주세요.";
      return;
    }
    game.answers[selected] = value;
    game.drafts ||= {};
    game.drafts[selected] = value;
    try {
      await save();
      if (game.competitive) {
        lock(true);
        await api("draft", { answers: game.answers });
      }
      $("hintStatus").textContent = "입력하고 저장했어요.";
      show();
    } catch (error) {
      status("답안은 이 기기에 유지돼요. " + error.message);
    } finally {
      lock(false);
    }
  }
  async function hint() {
    if (busy || !game || game.result) return;
    lock(true);
    try {
      let result;
      if (game.competitive) result = await api("hint", { entryId: selected });
      else {
        const entry = game.solution.entries.find((e) => e.id === selected);
        result = {
          letter: entry.answer[0],
          hintIds: [...new Set([...game.hintIds, selected])],
        };
      }
      game.hintIds = result.hintIds;
      await save();
      $("hintStatus").textContent =
        "첫 글자는 " + result.letter + " · 이 낱말의 힌트 비용은 20점이에요.";
    } catch (error) {
      status(error.message);
    } finally {
      lock(false);
    }
  }
  async function submit(expired = false) {
    if (busy || !game || game.result || !current()) return;
    if (
      !expired &&
      !confirm("제출하면 오늘의 순위 점수가 확정돼요. 제출할까요?")
    )
      return;
    lock(true);
    try {
      await save();
      game.result = game.competitive
        ? await api("submit", { answers: game.answers })
        : {
            ...CrosswordCore.grade(
              game.solution,
              expired ? {} : game.answers,
              game.hintIds,
            ),
            expired,
            answers: Object.fromEntries(
              game.solution.entries.map((e) => [e.id, e.answer]),
            ),
          };
      await save();
      show();
      if (game.competitive) await ranking();
    } catch (error) {
      status(error.message);
    } finally {
      lock(false);
    }
  }
  async function ranking() {
    if (app.GameConfig?.onlineEnabled === false) {
      $("rankingStatus").textContent = "온라인 순위는 준비 중이에요.";
      return;
    }
    try {
      const result = await api("ranking", {
        scope: $("gameScope").value,
        puzzleId:
          game?.competitive && game.scope === $("gameScope").value
            ? game.puzzleId
            : undefined,
      });
      rankRows = result.rows;
      player = result.player;
      $("rankingStatus").textContent = rankRows.length
        ? "최초 도전 점수 · 공동 순위 적용"
        : "아직 제출한 트레이너가 없어요.";
      const host = $("gameRanking");
      host.replaceChildren();
      let rank = 0,
        previous = null;
      rankRows.forEach((row, index) => {
        if (previous !== row.score) rank = index + 1;
        previous = row.score;
        const el = document.createElement("div");
        el.className = "rank-row" + (row.player === player ? " me" : "");
        for (const value of [
          rank + "위",
          row.nickname + " #" + row.player.slice(0, 4),
          row.score + "점",
        ]) {
          const part = document.createElement("b");
          part.textContent = value;
          el.append(part);
        }
        host.append(el);
      });
      const mine = rankRows.find((r) => r.player === player),
        targets = mine
          ? rankRows.filter((r) => r.player !== player && r.score < mine.score)
          : [];
      $("challengePanel").hidden = !targets.length;
      const select = $("challengeTarget");
      select.replaceChildren();
      for (const row of targets) {
        const option = document.createElement("option");
        option.value = row.player;
        option.textContent =
          row.nickname +
          " #" +
          row.player.slice(0, 4) +
          " · " +
          row.score +
          "점";
        select.append(option);
      }
      challenge();
    } catch (error) {
      $("rankingStatus").textContent =
        error.message + " 순위 서버 배포가 필요할 수 있어요.";
    }
  }
  function challenge() {
    const mine = rankRows.find((r) => r.player === player),
      target = rankRows.find((r) => r.player === $("challengeTarget").value);
    $("challengeMessage").textContent =
      mine && target
        ? mine.nickname +
          " 트레이너가 " +
          mine.score +
          "점으로 " +
          target.nickname +
          "의 기록을 추월했다! 내 기록 넘을 수 있겠어? ⚡"
        : "";
  }
  function share() {
    const message = $("challengeMessage").textContent;
    if (!message || !current()) return;
    const url = new URL("learning-games.html", location.href);
    url.searchParams.set("scope", $("gameScope").value);
    window.KakaoShare?._sendFeed({
      title: "⚡ 낱말 숲 추월 도전장",
      description: message,
      imageUrl: document.querySelector(".companion img").src,
      url: url.href,
      buttonTitle: "낱말 숲에 도전",
    });
  }
  (async () => {
    await app.LocalRepository.ready;
    user = app.LocalRepository.getActiveUser();
    if (!user) {
      status("대시보드에서 학습자를 선택해 주세요.");
      lock(true);
      return;
    }
    document.querySelectorAll("[data-companion]").forEach(
      (button) =>
        (button.onclick = () => {
          const image = document.querySelector(".companion img");
          image.src =
            "assets/game-companions/" + button.dataset.companion + ".png";
          image.alt = button.getAttribute("aria-label") + " 동료";
        }),
    );
    const requested =
      new URLSearchParams(location.search).get("scope") ||
      app.LocalRepository.getPreference(
        "SmartStudy_GameScope_" + encodeURIComponent(user),
        "ko-level1",
      );
    if ([...$("gameScope").options].some((o) => o.value === requested))
      $("gameScope").value = requested;
    $("gameNickname").value = app.LocalRepository.getPreference(
      "SmartStudy_GameNickname_" + encodeURIComponent(user),
      "번개트레이너",
    );
    $("wordAnswer").oninput = () => {
      if (!game || game.result || !current()) return;
      game.drafts ||= {};
      game.drafts[selected] = $("wordAnswer").value;
      save().catch((error) => status(error.message));
    };
    $("startCompetition").onclick = () => start(true);
    $("startPractice").onclick = () => start(false);
    $("saveWord").onclick = put;
    $("wordAnswer").onkeydown = (e) => {
      if (e.key === "Enter" && !e.isComposing) {
        e.preventDefault();
        put();
      }
    };
    $("wordHint").onclick = hint;
    $("submitGame").onclick = () => submit(false);
    $("refreshRanking").onclick = ranking;
    $("challengeTarget").onchange = challenge;
    $("shareChallenge").onclick = share;
    $("leaveGame").onclick = async () => {
      try {
        await save();
        location.href = "index.html";
      } catch (error) {
        status(error.message);
      }
    };
    $("gameScope").onchange = () => {
      rankRows = [];
      $("gameRanking").replaceChildren();
      $("challengePanel").hidden = true;
      $("rankingStatus").textContent = "새 범위의 순위를 확인해 주세요.";
    };
    $("gameNickname").onchange = () =>
      app.LocalRepository.setPreference(
        "SmartStudy_GameNickname_" + encodeURIComponent(user),
        $("gameNickname").value.trim(),
      );
    window.addEventListener("focus", () => {
      if (!current()) {
        clearInterval(timer);
        location.reload();
      }
    });
    if (app.GameConfig?.onlineEnabled === false) {
      lock(false);
      status("온라인 도전은 준비 중이에요. 연습으로 시작할 수 있어요.");
    }
    const old = app.LocalRepository.getPreference(
      key($("gameScope").value),
      null,
    );
    if (old && app.GameConfig?.onlineEnabled !== false)
      status("저장된 도전이 있어요. 오늘의 순위 도전을 누르면 이어져요.");
  })().catch((error) => status(error.message));
})();

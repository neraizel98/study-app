(function () {
  "use strict";
  const $ = (id) => document.getElementById(id),
    app = window.SmartStudy,
    core = window.WordChainCore;
  let user = "",
    game = null,
    busy = false,
    timer = null,
    offset = 0,
    rows = [],
    player = null,
    rankingRequest = 0;
  const day = () =>
    new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  const current = () => app.LocalRepository.getActiveUser() === user;
  const key = (scope, competitive) =>
    "SmartStudy_WordChain_" +
    encodeURIComponent(user) +
    "_" +
    day() +
    "_" +
    scope +
    (competitive ? "" : "_practice");
  const state = () => game?.state;
  function status(message) {
    $("chainStatus").textContent = message;
  }
  function lock(value) {
    busy = value;
    for (const id of [
      "chainStart",
      "chainPractice",
      "chainWord",
      "chainHint",
      "chainFinish",
      "chainRankRefresh",
    ]) {
      $(id).disabled =
        value ||
        (app.GameConfig?.onlineEnabled === false &&
          ["chainStart", "chainRankRefresh"].includes(id)) ||
        Boolean(
          state()?.finishedAt &&
          ["chainWord", "chainHint", "chainFinish"].includes(id),
        );
    }
    $("chainInput").disabled =
      value || Boolean(state()?.pending || state()?.finishedAt);
    for (const button of $("chainChoices").children)
      button.disabled = value || Boolean(state()?.finishedAt);
  }
  async function save() {
    if (!game || !current()) return;
    if (
      app.LocalRepository.setPreference(
        key(game.scope, game.competitive),
        game,
      ) === false
    )
      throw Error("저장 공간을 확인해 주세요.");
    await app.LocalRepository.flush();
  }
  async function api(action, extra = {}) {
    if (!current()) throw Error("학습자가 바뀌었습니다. 다시 열어 주세요.");
    const auth = await app.FirebaseClient.getCurrentUser();
    if (!auth) throw Error("Google 계정을 연결하거나 연습으로 시작해 주세요.");
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
            game: "chain",
            action,
            learner: user,
            scope: game?.scope || $("chainScope").value,
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
      (report) =>
        report.subject === (language === "ko" ? "korean_vocab" : "english") &&
        Number(report.totalQuestions) > 0 &&
        !report.metadata?.draft &&
        [
          report.metadata?.levelId,
          report.metadata?.unitId,
          report.level,
        ].includes(level),
    );
  }
  function studiedWords(pool, scope) {
    const seen = new Set(),
      subject = scope.startsWith("ko-") ? "korean_vocab" : "english";
    for (const report of app.LocalRepository.listReports(user).filter(
      (r) => r.subject === subject,
    )) {
      for (const attempt of report.metadata?.initialAttempts ||
        report.metadata?.attempts ||
        []) {
        if (attempt.wordId) seen.add(attempt.wordId);
        if (attempt.word) seen.add(core.normalize(attempt.word));
      }
    }
    return pool.filter((word) => seen.has(word.id) || seen.has(word.answer));
  }
  async function start(competitive) {
    if (competitive && app.GameConfig?.onlineEnabled === false) {
      status("온라인 도전은 준비 중이에요. 연습으로 시작해 주세요.");
      return;
    }
    if (busy || !current()) return;
    const scope = $("chainScope").value,
      nickname = $("chainNickname").value.trim();
    if (competitive && !learned(scope)) {
      status("이 레벨의 학습 퀴즈를 먼저 풀거나 연습으로 시작해 주세요.");
      return;
    }
    lock(true);
    try {
      app.LocalRepository.setPreference(
        "SmartStudy_WordChainScope_" + encodeURIComponent(user),
        scope,
      );
      $("chainChallenge").hidden = true;
      $("chainRanking").replaceChildren();
      rows = [];
      const old = app.LocalRepository.getPreference(
        key(scope, competitive),
        null,
      );
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
          state: result.state,
          nickname: result.nickname,
          draft: old?.puzzleId === result.puzzleId ? old.draft || "" : "",
        };
      } else if (old && !old.state.finishedAt) {
        game = old;
        offset = 0;
      } else {
        const response = await fetch("functions/game-words.json");
        if (!response.ok) throw Error("단어 자료를 불러오지 못했습니다.");
        const bank = await response.json();
        let words = studiedWords(bank[scope], scope),
          next,
          range = "배운 단어 연습";
        const seed = day() + scope + ":" + Date.now();
        try {
          next = core.create(words, scope, seed, Date.now());
        } catch (error) {
          if (
            !confirm(
              "연결 가능한 학습 단어가 부족해요. 이 레벨 전체 단어로 자유 연습할까요?",
            )
          )
            return;
          words = bank[scope];
          next = core.create(words, scope, seed, Date.now());
          range = "레벨 전체 자유 연습";
        }
        game = {
          competitive: false,
          scope,
          puzzleId: seed,
          state: core.publicState(next),
          privateState: next,
          words,
          nickname: nickname || "파도트레이너",
          draft: "",
          range,
        };
        offset = 0;
      }
      render();
      let storageMessage = "";
      try {
        await save();
      } catch (error) {
        storageMessage = " · 이 기기 저장에 실패했어요. " + error.message;
      }
      status(
        (game.competitive
          ? "순위 도전 중 · 오늘 이 레벨의 첫 한 판만 순위에 반영돼요."
          : game.range + " · 순위에 반영되지 않아요.") + storageMessage,
      );
      if (state().finishedAt && competitive) await ranking();
      $("chainPlay").scrollIntoView({ block: "start", behavior: "smooth" });
    } catch (error) {
      status(error.message);
    } finally {
      lock(false);
    }
  }
  async function act(action, extra = {}) {
    if (busy || !game || state().finishedAt || !current()) return;
    lock(true);
    try {
      const input = { expectedTurn: state().turn, ...extra };
      if (game.competitive) {
        const result = await api(action, input);
        offset = result.serverNow - Date.now();
        game.state = result.state;
      } else {
        game.privateState = core.apply(
          game.privateState,
          game.words,
          action,
          input,
          Date.now(),
        );
        game.state = core.publicState(game.privateState);
      }
      if (action === "word" && state().pending) game.draft = "";
      render();
      try {
        await save();
      } catch (error) {
        status(
          "현재 화면에서는 이어갈 수 있어요. 이 기기 저장에 실패했어요. " +
            error.message,
        );
      }
      if (state().finishedAt && game.competitive) await ranking();
    } catch (error) {
      status(error.message);
    } finally {
      lock(false);
    }
  }
  function render() {
    const s = state();
    if (!s) return;
    $("chainPlay").hidden = false;
    $("chainScope").disabled = !s.finishedAt;
    $("chainNickname").disabled = !s.finishedAt;
    $("chainMode").textContent = game.competitive
      ? "오늘의 순위 도전"
      : game.range || "연습";
    $("chainScore").textContent = s.score + "점";
    $("chainTurn").textContent = s.turn + " / " + s.maxTurns + "턴 완료";
    $("chainProgress").value = s.turn;
    $("chainCurrent").textContent = s.currentWord;
    $("chainRequired").textContent =
      "'" +
      [...s.currentWord].at(-1) +
      "'" +
      (game.scope.startsWith("en-")
        ? "로 시작하는 영어 단어"
        : "로 시작하는 낱말");
    $("chainReset").hidden = !s.reset;
    $("chainWordArea").hidden = Boolean(s.pending || s.finishedAt);
    $("chainMeaningArea").hidden = !s.pending || Boolean(s.finishedAt);
    $("chainInput").value = game.draft || "";
    const choices = $("chainChoices");
    choices.replaceChildren();
    if (s.pending) {
      $("chainMeaningTitle").textContent = s.pending.word;
      for (const choice of s.pending.options) {
        const button = document.createElement("button");
        button.textContent = choice;
        button.onclick = () => act("meaning", { choice });
        choices.append(button);
      }
    }
    const feedback = s.lastFeedback;
    $("chainFeedback").textContent = s.hintWord
      ? "추천 단어 " + s.hintWord + " · 이번 턴 힌트 −20점"
      : feedback
        ? (feedback.correct ? "뜻까지 정확해요. " : "뜻을 다시 살펴봐요. ") +
          feedback.word +
          " — " +
          feedback.clue +
          " · " +
          feedback.earned +
          "점"
        : "단어를 입력한 뒤 뜻까지 골라 주세요.";
    const history = $("chainHistory");
    history.replaceChildren();
    for (const word of s.used) {
      const item = document.createElement("span");
      item.textContent = word;
      history.append(item);
    }
    $("chainResult").textContent = s.finishedAt
      ? (s.finishReason === "exhausted"
          ? "연결할 단어를 모두 연습했어요. "
          : "") +
        "이번 항해 " +
        s.score +
        "점 · " +
        s.turn +
        "턴 완료"
      : "";
    lock(busy);
    clearInterval(timer);
    tick();
    if (!s.finishedAt) timer = setInterval(tick, 1000);
  }
  function tick() {
    if (!game || !current()) {
      clearInterval(timer);
      return;
    }
    const s = state();
    if (s.finishedAt) {
      $("chainClock").textContent = "종료";
      clearInterval(timer);
      return;
    }
    const remaining = Math.max(
      0,
      Math.ceil((s.deadline - Date.now() - offset) / 1000),
    );
    $("chainClock").textContent =
      Math.floor(remaining / 60) +
      ":" +
      String(remaining % 60).padStart(2, "0");
    if (!remaining && !busy) act("finish");
  }
  async function ranking() {
    if (app.GameConfig?.onlineEnabled === false) {
      $("chainRankStatus").textContent = "온라인 순위는 준비 중이에요.";
      return;
    }
    const request = ++rankingRequest,
      scope = $("chainScope").value;
    try {
      const result = await api("ranking", {
        scope,
        puzzleId:
          game?.competitive && game.scope === scope ? game.puzzleId : undefined,
      });
      if (
        request !== rankingRequest ||
        scope !== $("chainScope").value ||
        !current()
      )
        return;
      rows = result.rows;
      player = result.player;
      const host = $("chainRanking");
      host.replaceChildren();
      let rank = 0,
        previous = null;
      rows.forEach((row, index) => {
        if (row.score !== previous) rank = index + 1;
        previous = row.score;
        const item = document.createElement("div");
        item.className = "rank-row" + (row.player === player ? " me" : "");
        for (const value of [
          rank + "위",
          row.nickname + " #" + row.player.slice(0, 4),
          row.score + "점",
        ]) {
          const part = document.createElement("b");
          part.textContent = value;
          item.append(part);
        }
        host.append(item);
      });
      $("chainRankStatus").textContent = rows.length
        ? "전체 학습자 경쟁 · 상위 100개 기록 · 같은 점수는 공동 순위"
        : "아직 제출한 트레이너가 없어요.";
      const mine = rows.find((r) => r.player === player),
        targets = mine
          ? rows.filter((r) => r.player !== player && r.score < mine.score)
          : [];
      const select = $("chainTarget");
      select.replaceChildren();
      $("chainChallenge").hidden = !targets.length;
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
      if (request === rankingRequest && current())
        $("chainRankStatus").textContent =
          error.message + " 순위 서버 배포가 필요할 수 있어요.";
    }
  }
  function challenge() {
    const mine = rows.find((r) => r.player === player),
      target = rows.find((r) => r.player === $("chainTarget").value);
    $("chainMessage").textContent =
      mine && target
        ? mine.nickname +
          " 트레이너가 끝말잇기 " +
          mine.score +
          "점으로 " +
          target.nickname +
          "의 기록을 추월했다! 내 항로 따라올 수 있겠어? 🌊"
        : "";
  }
  function share() {
    const message = $("chainMessage").textContent;
    if (!message || !current()) return;
    const url = new URL("word-chain.html", location.href);
    url.searchParams.set("scope", $("chainScope").value);
    window.KakaoShare?._sendFeed({
      title: "🌊 끝말잇기 추월 도전장",
      description: message,
      imageUrl: new URL("assets/game-companions/7.png", location.href).href,
      url: url.href,
      buttonTitle: "끝말잇기 항구에 도전",
    });
  }
  (async () => {
    await app.LocalRepository.ready;
    user = app.LocalRepository.getActiveUser();
    if (!user) {
      lock(true);
      status("대시보드에서 학습자를 선택해 주세요.");
      return;
    }
    const preferred =
      new URLSearchParams(location.search).get("scope") ||
      app.LocalRepository.getPreference(
        "SmartStudy_WordChainScope_" + encodeURIComponent(user),
        "ko-level1",
      );
    if (
      [...$("chainScope").options].some((option) => option.value === preferred)
    )
      $("chainScope").value = preferred;
    $("chainNickname").value = app.LocalRepository.getPreference(
      "SmartStudy_GameNickname_" + encodeURIComponent(user),
      "파도트레이너",
    );
    $("chainStart").onclick = () => start(true);
    $("chainPractice").onclick = () => start(false);
    $("chainWord").onclick = () => act("word", { word: $("chainInput").value });
    $("chainHint").onclick = () => act("hint");
    $("chainInput").onkeydown = (e) => {
      if (e.key === "Enter" && !e.isComposing) {
        e.preventDefault();
        act("word", { word: $("chainInput").value });
      }
    };
    $("chainInput").oninput = () => {
      if (!game || state().finishedAt || !current()) return;
      game.draft = $("chainInput").value;
      save().catch((error) => status(error.message));
    };
    $("chainFinish").onclick = () => {
      if (!busy && confirm("현재 점수로 이번 판을 마무리할까요?"))
        act("finish");
    };
    $("chainLeave").onclick = async () => {
      try {
        await save();
        location.href = "learning-games.html";
      } catch (error) {
        status(error.message);
      }
    };
    $("chainRankRefresh").onclick = ranking;
    $("chainTarget").onchange = challenge;
    $("chainShare").onclick = share;
    $("chainScope").onchange = () => {
      rankingRequest++;
      rows = [];
      $("chainRanking").replaceChildren();
      $("chainChallenge").hidden = true;
      $("chainRankStatus").textContent = "새 범위의 순위를 확인해 주세요.";
    };
    $("chainNickname").onchange = () =>
      app.LocalRepository.setPreference(
        "SmartStudy_GameNickname_" + encodeURIComponent(user),
        $("chainNickname").value.trim(),
      );
    if (app.GameConfig?.onlineEnabled === false) {
      lock(false);
      status("온라인 도전은 준비 중이에요. 연습으로 시작할 수 있어요.");
    }
    window.addEventListener("focus", () => {
      if (!current()) {
        clearInterval(timer);
        location.reload();
      }
    });
  })().catch((error) => status(error.message));
})();

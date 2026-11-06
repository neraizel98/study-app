(function () {
  "use strict";
  const $ = (id) => document.getElementById(id),
    app = window.SmartStudy,
    repo = app.LocalRepository,
    core = WordChainCore;
  let user,
    game,
    setup,
    busy = false,
    timer;
  const current = () => repo.getActiveUser() === user,
    state = () => game?.state;
  const key = (scope) =>
    "SmartStudy_Arcade_chain_" + encodeURIComponent(user) + "_" + scope;
  const status = (message) => ($("chainFeedback").textContent = message);
  function lock(value) {
    busy = value;
    for (const id of ["chainWord", "chainHint", "chainFinish", "chainInput"]) {
      $(id).disabled = value || Boolean(state()?.finishedAt);
    }
    for (const button of $("chainChoices").querySelectorAll("button"))
      button.disabled = value;
  }
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
      GameSetup.resumeLegacy(repo, user, "chain", config.scope);
    if (old && !old.state.finishedAt && old.privateState)
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
        words = GameLevels.chainPool(bank, config.scope),
        seed = config.scope + ":" + Date.now() + ":" + crypto.randomUUID();
      const privateState = core.create(words, config.scope, seed, Date.now());
      game = {
        ...config,
        puzzleId: seed,
        privateState,
        state: core.publicState(privateState),
        words,
        nickname: config.name,
        draft: "",
      };
    }
    render();
    await safeSave();
  }
  async function act(action, extra = {}) {
    if (busy || !game || state().finishedAt || !current()) return;
    lock(true);
    try {
      game.privateState = core.apply(
        game.privateState,
        game.words,
        action,
        { expectedTurn: state().turn, ...extra },
        Date.now(),
      );
      game.state = core.publicState(game.privateState);
      if (action === "word" && state().pending) game.draft = "";
      render();
      await safeSave();
      if (state().finishedAt && !game.progressRecorded) {
        const s = state(),
          maxScore =
            s.finishReason === "exhausted" ? Math.max(1, s.turn) * 100 : 1000;
        const promotion = await setup.record({
          id: game.puzzleId,
          language: game.language,
          level: game.level,
          score: Math.min(s.score, maxScore),
          maxScore,
          words: s.history.map((e) => e.word),
        });
        game.progressRecorded = true;
        await safeSave();
        $("chainResult").textContent +=
          " · " +
          (promotion.promoted ? "LEVEL UP! 추천 Lv." : "추천 Lv.") +
          promotion.recommended;
      }
    } catch (e) {
      status(e.message);
    } finally {
      lock(false);
    }
  }
  function render() {
    const s = state();
    if (!s) return;
    $("chainPlay").hidden = false;
    $("chainSetupPanel").hidden = true;
    $("chainMode").textContent = game.nickname + " · Lv." + game.level;
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
    $("chainNext").hidden = !s.finishedAt;
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
      $("chainClock").textContent = "FINISH";
      clearInterval(timer);
      return;
    }
    const remaining = Math.max(0, Math.ceil((s.deadline - Date.now()) / 1000));
    $("chainClock").textContent =
      Math.floor(remaining / 60) +
      ":" +
      String(remaining % 60).padStart(2, "0");
    if (!remaining && !busy) act("finish");
  }
  function choose() {
    clearInterval(timer);
    $("chainPlay").hidden = true;
    $("chainSetupPanel").hidden = false;
    setup.refresh();
  }
  (async () => {
    await repo.ready;
    user = repo.getActiveUser();
    if (!user) {
      $("gameSetup").textContent = "대시보드에서 학습자를 선택해 주세요.";
      return;
    }
    setup = GameSetup.mount({ user, game: "chain", onStart: start });
    $("chainWord").onclick = () => act("word", { word: $("chainInput").value });
    $("chainHint").onclick = () => act("hint");
    $("chainInput").onkeydown = (e) => {
      if (e.key === "Enter" && !e.isComposing) {
        e.preventDefault();
        act("word", { word: $("chainInput").value });
      }
    };
    $("chainInput").oninput = () => {
      if (game && !state().finishedAt && current()) {
        game.draft = $("chainInput").value;
        safeSave();
      }
    };
    $("chainFinish").onclick = () => {
      if (!busy && confirm("현재 점수로 마무리할까요?")) act("finish");
    };
    $("chainChangeLevel").onclick = choose;
    $("chainNext").onclick = choose;
    $("chainLeave").onclick = async () => {
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

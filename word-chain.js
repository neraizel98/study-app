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
    for (const id of ["chainChangeLevel", "chainLeave", "chainNext"])
      $(id).disabled = value;
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
    const prefix =
      "SmartStudy_Arcade_chain_" +
      encodeURIComponent(user) +
      "_" +
      config.language +
      "-stage";
    const legacy = repo
      .keys()
      .filter((key) => key.startsWith(prefix))
      .map((key) => repo.getPreference(key, null))
      .filter((saved) => saved?.privateState && !saved.state.finishedAt)
      .sort((a, b) => b.privateState.startedAt - a.privateState.startedAt)[0];
    const old = repo.getPreference(key(config.scope), null) || legacy;
    if (old && !old.state.finishedAt && old.privateState)
      game = {
        ...JSON.parse(JSON.stringify(old)),
        ...config,
        nickname: config.name,
        drafts: old.drafts || {},
      };
    else {
      const response = await fetch("functions/game-level-words.json");
      if (!response.ok)
        throw Error("단어 자료를 불러오지 못했어요. 다시 눌러 주세요.");
      const bank = await response.json(),
        words = [
          ...new Map(
            Object.entries(bank)
              .filter(([scope]) => scope.startsWith(config.language + "-"))
              .flatMap(([, words]) => words)
              .map((word) => [word.answer, word]),
          ).values(),
        ],
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
    game.privateState.scope = config.scope;
    game.state = core.publicState(game.privateState);
    render();
    await safeSave();
  }
  async function act(action, extra = {}) {
    if (busy || !game || state().finishedAt || !current()) return;
    lock(true);
    try {
      if (action === "word" && !state().pending) {
        const word = core.normalize(extra.word);
        if (state().used.includes(word))
          throw Error("이번 판에서 이미 나온 단어예요.");
        if (!word.startsWith([...state().currentWord].at(-1)))
          throw Error("앞 단어의 마지막 글자로 시작해 주세요.");
        if (!game.words.some((entry) => entry.answer === word)) {
          status("사전에서 단어 확인 중…");
          const entry = await WordChainDictionary.lookup(game.language, word);
          if (!current()) throw Error("학습자가 바뀌었습니다.");
          game.words.push(entry);
        }
      }
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
    $("chainMode").textContent =
      game.nickname + " · " + (game.language === "ko" ? "국어" : "영어");
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
    setup = GameSetup.mountFree({ user, onStart: start });
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

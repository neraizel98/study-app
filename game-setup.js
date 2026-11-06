(function (root) {
  "use strict";
  const repo = () => root.SmartStudy.LocalRepository;
  const progressKey = (user, game, language) =>
    "SmartStudy_ArcadeProgress_" +
    encodeURIComponent(user) +
    "_" +
    game +
    "_" +
    language;
  function mount({ user, game, onStart }) {
    const host = document.getElementById("gameSetup"),
      profile = repo().getUser(user);
    const params = new URLSearchParams(location.search),
      requested =
        GameLevels.parse(params.get("scope")) ||
        GameLevels.legacy(params.get("scope"));
    const pref = repo().getPreference(
      "SmartStudy_ArcadeLanguage_" + encodeURIComponent(user),
      "ko",
    );
    let language =
      requested?.language || (["ko", "en"].includes(pref) ? pref : "ko");
    const progress = () =>
      repo().getPreference(
        progressKey(user, game, language),
        GameLevels.initial(),
      );
    let level = requested?.level || progress().recommended,
      busy = false;
    const name = GameLevels.displayName(user, profile);
    host.innerHTML =
      '<div class="player-badge"><span aria-hidden="true">🎮</span><strong id="arcadePlayer"></strong><span class="player-ready">READY</span></div><div class="language-picks" role="group" aria-label="게임 언어"><button type="button" data-language="ko">국어</button><button type="button" data-language="en">영어</button></div><div class="level-heading"><h2>레벨 선택</h2><span id="arcadeRecommended"></span></div><div class="arcade-levels" role="group" aria-label="레벨 선택"></div><p id="arcadeProgress" class="arcade-progress"></p><button id="gameStart" type="button" class="arcade-start">게임 시작 <span aria-hidden="true">▶</span></button><p id="arcadeNotice" role="status" aria-live="polite"></p>';
    document.getElementById("arcadePlayer").textContent = name;
    function render() {
      const p = progress(),
        grid = host.querySelector(".arcade-levels");
      grid.replaceChildren();
      for (const item of GameLevels.levels) {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.level = String(item.level);
        button.className =
          "arcade-level" +
          (item.level === level ? " selected" : "") +
          (item.level === p.recommended ? " recommended" : "");
        button.setAttribute("aria-pressed", String(item.level === level));
        button.disabled = busy;
        const number = document.createElement("b");
        number.textContent = String(item.level);
        const description = document.createElement("span");
        description.textContent = item.description;
        button.append(number, description);
        button.onclick = () => {
          level = item.level;
          render();
        };
        grid.append(button);
      }
      for (const button of host.querySelectorAll("[data-language]")) {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.language === language),
        );
        button.disabled = busy;
      }
      document.getElementById("arcadeRecommended").textContent =
        "추천 Lv." + p.recommended;
      document.getElementById("arcadeProgress").textContent =
        "다른 판에서 80%↑ 두 번 → 다음 레벨";
      document.getElementById("gameStart").disabled = busy;
    }
    host.querySelectorAll("[data-language]").forEach(
      (button) =>
        (button.onclick = () => {
          language = button.dataset.language;
          level = progress().recommended;
          repo().setPreference(
            "SmartStudy_ArcadeLanguage_" + encodeURIComponent(user),
            language,
          );
          render();
        }),
    );
    document.getElementById("gameStart").onclick = async () => {
      if (busy) return;
      busy = true;
      render();
      document.getElementById("arcadeNotice").textContent = "";
      try {
        await onStart({
          user,
          language,
          level,
          scope: GameLevels.scope(language, level),
          name,
        });
      } catch (error) {
        document.getElementById("arcadeNotice").textContent = error.message;
      } finally {
        busy = false;
        render();
      }
    };
    render();
    return {
      name,
      refresh() {
        level = progress().recommended;
        render();
      },
      async record(result) {
        if (repo().getActiveUser() !== user)
          throw Error("학습자가 바뀌었습니다.");
        GameLevels.scope(result.language, result.level);
        const resultKey = progressKey(user, game, result.language);
        const old = repo().getPreference(resultKey, GameLevels.initial()),
          next = GameLevels.advance(old, result);
        if (repo().setPreference(resultKey, next) === false)
          throw Error("추천 레벨을 저장하지 못했어요.");
        await repo().flush();
        if (language === result.language) level = next.recommended;
        render();
        return {
          promoted: next.recommended > old.recommended,
          recommended: next.recommended,
        };
      },
    };
  }
  function resumeLegacy(repository, user, kind, scope) {
    const prefix =
      (kind === "chain" ? "SmartStudy_WordChain_" : "SmartStudy_Crossword_") +
      encodeURIComponent(user) +
      "_";
    for (const key of repository
      .keys()
      .filter((key) => key.startsWith(prefix))
      .reverse()) {
      const saved = repository.getPreference(key, null),
        mapped = GameLevels.legacy(saved?.scope);
      if (
        !saved ||
        saved.competitive ||
        !mapped ||
        GameLevels.scope(mapped.language, mapped.level) !== scope
      )
        continue;
      if (
        kind === "chain"
          ? saved.privateState && !saved.state.finishedAt
          : saved.solution && !saved.result
      )
        return saved;
    }
    return null;
  }
  function mountFree({ user, onStart }) {
    const host = document.getElementById("gameSetup"),
      name = GameLevels.displayName(user, repo().getUser(user));
    let language = new URLSearchParams(location.search)
      .get("scope")
      ?.startsWith("en-")
      ? "en"
      : repo().getPreference(
          "SmartStudy_ArcadeLanguage_" + encodeURIComponent(user),
          "ko",
        );
    if (!["ko", "en"].includes(language)) language = "ko";
    host.innerHTML =
      '<div class="player-badge"><span aria-hidden="true">🎮</span><strong id="arcadePlayer"></strong><span class="player-ready">READY</span></div><div class="language-picks" role="group" aria-label="게임 언어"><button type="button" data-language="ko">국어</button><button type="button" data-language="en">영어</button></div><p class="arcade-progress">끝 글자로 이어지는 단어라면 OK!</p><button id="gameStart" class="arcade-start">게임 시작 ▶</button><p id="arcadeNotice" role="status" aria-live="polite"></p>';
    document.getElementById("arcadePlayer").textContent = name;
    const buttons = [...host.querySelectorAll("button")];
    let busy = false;
    function render() {
      for (const button of host.querySelectorAll("[data-language]"))
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.language === language),
        );
      for (const button of buttons) button.disabled = busy;
    }
    for (const button of host.querySelectorAll("[data-language]"))
      button.onclick = () => {
        language = button.dataset.language;
        repo().setPreference(
          "SmartStudy_ArcadeLanguage_" + encodeURIComponent(user),
          language,
        );
        render();
      };
    document.getElementById("gameStart").onclick = async () => {
      if (busy) return;
      busy = true;
      render();
      document.getElementById("arcadeNotice").textContent = "";
      try {
        await onStart({ user, language, scope: language + "-free", name });
      } catch (e) {
        document.getElementById("arcadeNotice").textContent = e.message;
      } finally {
        busy = false;
        render();
      }
    };
    render();
    return { refresh: render };
  }
  root.GameSetup = { mount, resumeLegacy, mountFree };
})(window);

(function () {
  "use strict";
  const $ = (id) => document.getElementById(id),
    app = window.SmartStudy;
  let user = "",
    generation = 0,
    controller = null;
  function link() {
    const url = new URL(
      $("rankingGame").value === "chain"
        ? "word-chain.html"
        : "learning-games.html",
      location.href,
    );
    url.searchParams.set("scope", $("rankingScope").value);
    $("rankingPlay").href = url.href;
  }
  async function load() {
    link();
    const request = ++generation;
    controller?.abort();
    controller = new AbortController();
    const runController = controller;
    $("rankingRows").replaceChildren();
    $("rankingDate").textContent = new Date().toLocaleDateString("ko-KR", {
      timeZone: "Asia/Seoul",
    });
    if (!app.GameConfig.onlineEnabled) {
      $("rankingStatus").textContent =
        "온라인 순위는 준비 중이에요. 게임의 연습 모드를 먼저 이용해 주세요.";
      $("rankingRefresh").disabled = true;
      return;
    }
    if (!user) {
      $("rankingStatus").textContent = "대시보드에서 학습자를 선택해 주세요.";
      return;
    }
    const active = () =>
      request === generation && app.LocalRepository.getActiveUser() === user;
    $("rankingStatus").textContent = "오늘의 기록을 확인하고 있어요.";
    const timeout = setTimeout(() => runController.abort(), 15000);
    try {
      const auth = await app.FirebaseClient.getCurrentUser();
      if (!auth) throw Error("Google 계정을 연결한 뒤 다시 확인해 주세요.");
      const token = await auth.getIdToken();
      if (!active()) return;
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
            action: "ranking",
            game: $("rankingGame").value === "chain" ? "chain" : undefined,
            learner: user,
            scope: $("rankingScope").value,
          }),
          signal: runController.signal,
        },
      );
      if (!response.ok)
        throw Error("순위를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.");
      const data = await response.json();
      if (!active()) return;
      $("rankingDate").textContent =
        data.puzzleId?.split("_")[1] || $("rankingDate").textContent;
      let rank = 0,
        previous = null;
      for (const [index, row] of data.rows.entries()) {
        if (row.score !== previous) rank = index + 1;
        previous = row.score;
        const item = document.createElement("div");
        item.className = "rank-row" + (row.player === data.player ? " me" : "");
        for (const value of [
          rank + "위",
          row.nickname + " #" + row.player.slice(0, 4),
          row.score + "점",
        ]) {
          const part = document.createElement("b");
          part.textContent = value;
          item.append(part);
        }
        $("rankingRows").append(item);
      }
      $("rankingStatus").textContent = data.rows.length
        ? "오늘 제출된 최초 도전 기록이에요."
        : "아직 제출된 기록이 없어요. 첫 번째 기록에 도전해 보세요.";
    } catch (error) {
      if (active())
        $("rankingStatus").textContent =
          error.name === "AbortError"
            ? "서버 응답이 늦어요. 다시 확인해 주세요."
            : error.message;
    } finally {
      clearTimeout(timeout);
    }
  }
  (async () => {
    await app.LocalRepository.ready;
    user = app.LocalRepository.getActiveUser();
    const query = new URLSearchParams(location.search);
    if (["crossword", "chain"].includes(query.get("game")))
      $("rankingGame").value = query.get("game");
    if (
      [...$("rankingScope").options].some((o) => o.value === query.get("scope"))
    )
      $("rankingScope").value = query.get("scope");
    $("rankingRefresh").onclick = load;
    $("rankingGame").onchange = load;
    $("rankingScope").onchange = load;
    window.addEventListener("focus", () => {
      if (app.LocalRepository.getActiveUser() !== user) location.reload();
    });
    await load();
  })().catch((error) => ($("rankingStatus").textContent = error.message));
})();

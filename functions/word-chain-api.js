"use strict";
const { createHash } = require("node:crypto");
const core = require("./word-chain-core");
const bank = require("./game-words.json");
async function handle({ body, db, auth, access, learner, scope }) {
  const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  const date =
    body.action !== "start" && body.puzzleId
      ? String(body.puzzleId).split("_")[1]
      : today;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today)
    throw Error("게임 날짜를 확인해 주세요.");
  const puzzleId = core.version + "_" + date + "_" + scope;
  if (body.puzzleId && body.puzzleId !== puzzleId)
    throw Error("게임 정보가 일치하지 않습니다.");
  const player = createHash("sha256")
    .update(learner)
    .digest("hex")
    .slice(0, 24);
  const ref = db.collection("gameRounds").doc(puzzleId + "_" + player);
  const board = db.collection("gameBoards").doc(puzzleId).collection("scores");
  if (body.action === "ranking") {
    const rows = await board.orderBy("score", "desc").limit(100).get();
    return {
      puzzleId,
      player,
      rows: rows.docs.map((d) => ({ player: d.id, ...d.data() })),
    };
  }
  if (body.action === "start") {
    const nickname = String(body.nickname || "트레이너")
      .normalize("NFC")
      .trim();
    if (
      nickname.length < 2 ||
      nickname.length > 12 ||
      /[<>\r\n]/.test(nickname)
    )
      throw Error("닉네임은 2~12자로 입력해 주세요.");
    const record = await db.runTransaction(async (tx) => {
      const old = await tx.get(ref);
      if (old.exists) {
        if (old.data().uid !== auth.uid && access.role !== "admin")
          throw Error("원래 연결 계정으로 들어와 주세요.");
        return old.data();
      }
      const value = {
        uid: auth.uid,
        learner,
        nickname,
        game: core.create(bank[scope], scope, puzzleId, Date.now()),
      };
      tx.create(ref, value);
      return value;
    });
    return {
      puzzleId,
      player,
      serverNow: Date.now(),
      nickname: record.nickname,
      state: core.publicState(record.game),
    };
  }
  if (!["word", "meaning", "hint", "finish"].includes(body.action))
    throw Error("알 수 없는 게임 요청입니다.");
  if (
    (typeof body.word === "string" && body.word.length > 40) ||
    (typeof body.choice === "string" && body.choice.length > 2000)
  )
    throw Error("입력값을 확인해 주세요.");
  const record = await db.runTransaction(async (tx) => {
    const old = await tx.get(ref);
    if (!old.exists) throw Error("게임을 먼저 시작해 주세요.");
    const record = old.data();
    if (record.uid !== auth.uid && access.role !== "admin")
      throw Error("연결 계정을 확인해 주세요.");
    if (record.game.finishedAt) return record;
    const next = core.apply(
      record.game,
      bank[scope],
      body.action,
      body,
      Date.now(),
    );
    tx.update(ref, { game: next });
    if (next.finishedAt)
      tx.create(board.doc(player), {
        nickname: record.nickname,
        score: core.score(next),
        correct: next.history.filter((item) => item.correct).length,
        total: next.turn,
        hints: next.hintedTurns.length,
        submittedAt: next.finishedAt,
      });
    return { ...record, game: next };
  });
  return {
    puzzleId,
    player,
    serverNow: Date.now(),
    nickname: record.nickname,
    state: core.publicState(record.game),
  };
}
module.exports = { handle };

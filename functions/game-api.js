"use strict";
const { onRequest } = require("firebase-functions/v2/https");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { createHash } = require("node:crypto");
const core = require("./crossword-core"),
  bank = require("./game-words.json");
exports.gameApi = onRequest(
  { cors: true, maxInstances: 5 },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "POST 요청이 필요합니다." });
        return;
      }
      const token = String(req.headers.authorization || "").replace(
        /^Bearer /,
        "",
      );
      if (!token) {
        res.status(401).json({ error: "Google 계정 연결이 필요합니다." });
        return;
      }
      const auth = await getAuth().verifyIdToken(token),
        db = getFirestore(),
        body = req.body || {};
      const access = await db.collection("access").doc(auth.uid).get(),
        learner = body.learner;
      if (
        !access.exists ||
        typeof learner !== "string" ||
        !learner ||
        learner.length > 100 ||
        (access.data().role !== "admin" &&
          !access.data().learnerIds?.includes(learner))
      ) {
        res.status(403).json({ error: "학습자 권한을 확인해 주세요." });
        return;
      }
      const scope = body.scope;
      if (!Object.hasOwn(bank, scope)) {
        res.status(400).json({ error: "학습 범위를 선택해 주세요." });
        return;
      }
      if (body.game === "chain") {
        const result = await require("./word-chain-api").handle({
          body,
          db,
          auth,
          access: access.data(),
          learner,
          scope,
        });
        res.json(result);
        return;
      }
      const today = new Date(Date.now() + 9 * 3600000)
        .toISOString()
        .slice(0, 10);
      const date =
        body.action !== "start" && body.puzzleId
          ? String(body.puzzleId).split("_")[1]
          : today;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today)
        throw Error("게임 날짜를 확인해 주세요.");
      const puzzleId = core.version + "_" + date + "_" + scope;
      if (body.puzzleId && body.puzzleId !== puzzleId)
        throw Error("게임 정보가 일치하지 않습니다.");
      const puzzle = core.create(bank[scope], puzzleId),
        player = createHash("sha256")
          .update(learner)
          .digest("hex")
          .slice(0, 24);
      const round = db.collection("gameRounds").doc(puzzleId + "_" + player),
        board = db.collection("gameBoards").doc(puzzleId).collection("scores");
      if (body.action === "ranking") {
        const rows = await board.orderBy("score", "desc").limit(100).get();
        res.json({
          puzzleId,
          player,
          rows: rows.docs.map((d) => ({ player: d.id, ...d.data() })),
        });
        return;
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
        const state = await db.runTransaction(async (tx) => {
          const old = await tx.get(round);
          if (old.exists) {
            if (old.data().uid !== auth.uid && access.data().role !== "admin")
              throw Error("원래 연결 계정으로 들어와 주세요.");
            return old.data();
          }
          const value = {
            uid: auth.uid,
            learner,
            puzzleId,
            nickname,
            startedAt: Date.now(),
            hintIds: [],
            submittedAt: null,
          };
          tx.create(round, value);
          return value;
        });
        res.json({
          puzzleId,
          player,
          serverNow: Date.now(),
          puzzle: core.publicPuzzle(puzzle),
          state: {
            nickname: state.nickname,
            startedAt: state.startedAt,
            hintIds: state.hintIds,
            answers: state.answers || {},
            submittedAt: state.submittedAt,
            result: state.result || null,
          },
        });
        return;
      }
      if (!["hint", "submit", "draft"].includes(body.action))
        throw Error("알 수 없는 게임 요청입니다.");
      const result = await db.runTransaction(async (tx) => {
        const old = await tx.get(round);
        if (!old.exists) throw Error("게임을 먼저 시작해 주세요.");
        const state = old.data();
        if (state.uid !== auth.uid && access.data().role !== "admin")
          throw Error("연결 계정을 확인해 주세요.");
        if (state.submittedAt) {
          if (body.action === "submit") return state.result;
          throw Error("종료한 게임입니다.");
        }
        const expired = Date.now() - state.startedAt >= 10 * 60000;
        if (body.action === "hint") {
          if (expired)
            throw Error("제한 시간이 끝났습니다. 답안을 제출해 주세요.");
          const entry = puzzle.entries.find((e) => e.id === body.entryId);
          if (!entry) throw Error("문항을 확인해 주세요.");
          const hintIds = [...new Set([...state.hintIds, entry.id])];
          tx.update(round, { hintIds });
          return { entryId: entry.id, letter: entry.answer[0], hintIds };
        }
        if (
          !body.answers ||
          typeof body.answers !== "object" ||
          Array.isArray(body.answers) ||
          JSON.stringify(body.answers).length > 5000
        )
          throw Error("답안을 확인해 주세요.");
        if (body.action === "draft") {
          if (expired)
            throw Error("제한 시간이 끝났습니다. 답안을 제출해 주세요.");
          tx.update(round, { answers: body.answers });
          return { saved: true };
        }
        const marked = core.grade(
            puzzle,
            expired ? state.answers || {} : body.answers,
            state.hintIds,
          ),
          value = {
            ...marked,
            expired,
            answers: Object.fromEntries(
              puzzle.entries.map((e) => [e.id, e.answer]),
            ),
            puzzleId,
            submittedAt: Date.now(),
          };
        tx.update(round, { submittedAt: value.submittedAt, result: value });
        tx.create(board.doc(player), {
          nickname: state.nickname,
          score: marked.score,
          correct: marked.correct,
          total: marked.total,
          hints: state.hintIds.length,
          submittedAt: value.submittedAt,
        });
        return value;
      });
      res.json(result);
    } catch (error) {
      console.error("gameApi", error);
      res
        .status(400)
        .json({ error: String(error.message || "게임 저장에 실패했습니다.") });
    }
  },
);

const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm");
function harness() {
  const docs = new Map([
    ["access/account", { role: "learner", learnerIds: ["student"] }],
  ]);
  let now = Date.parse("2026-11-06T03:00:00Z"),
    sequence = Promise.resolve();
  class Ref {
    constructor(path) {
      this.path = path;
      this.id = path.split("/").at(-1);
    }
    doc(id) {
      return new Ref(this.path + "/" + id);
    }
    collection(id) {
      return new Ref(this.path + "/" + id);
    }
    async get() {
      return {
        exists: docs.has(this.path),
        data: () => structuredClone(docs.get(this.path)),
      };
    }
    orderBy() {
      return {
        limit: () => ({
          get: async () => ({
            docs: [...docs]
              .filter(([k]) => k.startsWith(this.path + "/"))
              .map(([path, data]) => ({
                id: path.split("/").at(-1),
                data: () => data,
              }))
              .sort((a, b) => b.data().score - a.data().score),
          }),
        }),
      };
    }
  }
  const db = {
    collection: (name) => new Ref(name),
    runTransaction: (fn) => {
      const run = sequence.then(() =>
        fn({
          get: (r) => r.get(),
          create: (r, v) => {
            assert(!docs.has(r.path));
            docs.set(r.path, structuredClone(v));
          },
          update: (r, v) =>
            docs.set(r.path, { ...docs.get(r.path), ...structuredClone(v) }),
        }),
      );
      sequence = run.catch(() => {});
      return run;
    },
  };
  const exports = {},
    context = {
      exports,
      Date: class extends Date {
        static now() {
          return now;
        }
      },
      console: { error() {} },
      require: (name) =>
        name === "firebase-functions/v2/https"
          ? { onRequest: (_, fn) => fn }
          : name === "firebase-admin/auth"
            ? {
                getAuth: () => ({
                  verifyIdToken: async (t) => {
                    if (t !== "valid") throw Error("invalid token");
                    return { uid: "account" };
                  },
                }),
              }
            : name === "firebase-admin/firestore"
              ? { getFirestore: () => db }
              : require(
                  name.startsWith("./") ? "./functions/" + name.slice(2) : name,
                ),
    };
  vm.runInNewContext(fs.readFileSync("functions/game-api.js", "utf8"), context);
  return {
    docs,
    setTime: (value) => (now = value),
    async call(body, token = "valid") {
      let status = 200,
        value;
      await exports.gameApi(
        {
          method: "POST",
          headers: { authorization: token ? "Bearer " + token : "" },
          body: { learner: "student", scope: "en-level1", ...body },
        },
        {
          status: (n) => {
            status = n;
            return {
              json: (v) => {
                value = v;
              },
            };
          },
          json: (v) => (value = v),
        },
      );
      return { status, value };
    },
  };
}
test("authenticated first attempt, private answers, idempotent hint and immutable result", async () => {
  const h = harness(),
    start = (await h.call({ action: "start", nickname: "번개트레이너" })).value;
  assert(start.puzzle.entries.every((e) => e.answer === undefined));
  assert.equal(
    (await h.call({ action: "start", nickname: "다른별명" })).value.state
      .nickname,
    "번개트레이너",
  );
  const entry = start.puzzle.entries[0],
    body = { puzzleId: start.puzzleId };
  await h.call({ action: "hint", entryId: entry.id, ...body });
  await h.call({ action: "hint", entryId: entry.id, ...body });
  const core = require("./functions/crossword-core"),
    bank = require("./functions/game-words.json"),
    p = core.create(bank["en-level1"], start.puzzleId),
    answers = Object.fromEntries(p.entries.map((e) => [e.id, e.answer]));
  const [a, b] = await Promise.all([
    h.call({ action: "submit", answers, score: 99999, ...body }),
    h.call({ action: "submit", answers: {}, ...body }),
  ]);
  assert.equal(a.value.score, p.entries.length * 100 - 20);
  assert.deepEqual(
    JSON.parse(JSON.stringify(a.value)),
    JSON.parse(JSON.stringify(b.value)),
  );
  const ranking = (await h.call({ action: "ranking", ...body })).value;
  assert.equal(ranking.rows.length, 1);
  assert(!Object.hasOwn(ranking.rows[0], "learner"));
  assert(!Object.hasOwn(ranking.rows[0], "uid"));
});
test("access checks and server deadline resist client score and clock claims", async () => {
  const h = harness();
  assert.equal((await h.call({ action: "start" }, "")).status, 401);
  assert.equal(
    (await h.call({ action: "start", learner: "other" })).status,
    403,
  );
  const start = (await h.call({ action: "start", nickname: "번개트레이너" }))
    .value;
  h.setTime(Date.parse("2026-11-06T03:11:00Z"));
  const r = await h.call({
    action: "submit",
    puzzleId: start.puzzleId,
    answers: {},
    score: 600,
    startedAt: Date.now(),
  });
  assert.equal(r.value.score, 0);
  assert.equal(r.value.expired, true);
});

test("deadline submission grades the last server-saved draft", async () => {
  const h = harness(),
    start = (await h.call({ action: "start", nickname: "저장트레이너" })).value;
  const p = require("./functions/crossword-core").create(
    require("./functions/game-words.json")["en-level1"],
    start.puzzleId,
  );
  const answers = Object.fromEntries(p.entries.map((e) => [e.id, e.answer]));
  assert.equal(
    (await h.call({ action: "draft", puzzleId: start.puzzleId, answers })).value
      .saved,
    true,
  );
  h.setTime(Date.parse("2026-11-06T03:11:00Z"));
  const result = await h.call({
    action: "submit",
    puzzleId: start.puzzleId,
    answers: {},
  });
  assert.equal(result.value.score, 600);
  assert.equal(result.value.expired, true);
});

test("word-chain endpoint uses authenticated saved turns and a separate first-attempt leaderboard", async () => {
  const h = harness();
  const chain = require("./functions/word-chain-core");
  const words = require("./functions/game-words.json")["en-level1"];
  const start = await h.call({
    game: "chain",
    action: "start",
    nickname: "항구트레이너",
  });
  assert.equal(start.status, 200);
  let state = start.value.state;
  assert.equal(state.score, 0);
  assert(start.value.puzzleId.startsWith("chain-v1_"));
  const move = chain.successors(
    chain.dictionary(words, "en-level1"),
    state.currentWord,
    state.used,
  )[0];
  const body = {
    game: "chain",
    puzzleId: start.value.puzzleId,
    expectedTurn: 0,
  };
  const accepted = await h.call({
    ...body,
    action: "word",
    word: move.answer,
    score: 99999,
  });
  assert.equal(accepted.value.state.score, 50);
  assert.equal(accepted.value.state.pending.answer, undefined);
  const answered = await h.call({
    ...body,
    action: "meaning",
    choice: move.clue,
  });
  assert.equal(answered.value.state.score, 100);
  assert.equal(answered.value.state.turn, 1);
  const replay = await h.call({
    ...body,
    action: "meaning",
    choice: move.clue,
  });
  assert.equal(replay.value.state.score, 100);
  const finish = await h.call({
    ...body,
    expectedTurn: 1,
    action: "finish",
    score: 99999,
  });
  assert(finish.value.state.finishedAt);
  const again = await h.call({ ...body, expectedTurn: 1, action: "finish" });
  assert.equal(again.value.state.score, 100);
  const ranking = await h.call({ ...body, action: "ranking" });
  assert.equal(ranking.value.rows.length, 1);
  assert.equal(ranking.value.rows[0].score, 100);
  assert(!Object.hasOwn(ranking.value.rows[0], "uid"));
  assert(!Object.hasOwn(ranking.value.rows[0], "learner"));
  assert.equal(
    (await h.call({ game: "chain", action: "start", learner: "other" })).status,
    403,
  );
  const crosswordRanking = await h.call({ action: "ranking" });
  assert.equal(crosswordRanking.value.rows.length, 0);
});

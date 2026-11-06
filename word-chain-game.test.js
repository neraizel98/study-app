const test = require("node:test"),
  assert = require("node:assert/strict");
const core = require("./functions/word-chain-core"),
  bank = require("./functions/game-words.json");
test("every level starts with a playable word and reaches a finish without a dead end", () => {
  for (const [scope, words] of Object.entries(bank))
    for (let day = 0; day < 15; day++) {
      let state = core.create(words, scope, scope + day, 1000);
      const dictionary = core.dictionary(words, scope);
      while (!state.finishedAt) {
        const moves = core.successors(
          dictionary,
          state.currentWord,
          state.used,
        );
        assert(moves.length, "unfinished round must offer a valid word");
        const move = moves[day % moves.length],
          before = state.turn;
        state = core.apply(
          state,
          words,
          "word",
          { word: move.answer, expectedTurn: before },
          1100 + before,
        );
        assert(state.pending);
        assert.equal(core.publicState(state).pending.answer, undefined);
        state = core.apply(
          state,
          words,
          "meaning",
          { choice: move.clue, expectedTurn: before },
          1200 + before,
        );
        assert.equal(state.turn, before + 1);
        assert(state.turn <= 10);
      }
      assert(state.turn > 0);
      assert.equal(new Set(state.used).size, state.used.length);
      assert.equal(core.score(state), state.turn * 100);
    }
});
test("wrong letter, unregistered words, duplicates and duplicate responses cannot earn points", () => {
  const words = bank["en-level1"],
    initial = core.create(words, "en-level1", "checks", 1000),
    pool = core.dictionary(words, "en-level1");
  assert.throws(() =>
    core.apply(
      initial,
      words,
      "word",
      { word: "unregisteredword", expectedTurn: 0 },
      1100,
    ),
  );
  assert.throws(
    () =>
      core.apply(
        initial,
        words,
        "word",
        { word: initial.currentWord, expectedTurn: 0 },
        1100,
      ),
    /이미/,
  );
  const next = pool.find(
    (w) => !w.answer.startsWith(initial.currentWord.at(-1)),
  );
  assert.throws(
    () =>
      core.apply(
        initial,
        words,
        "word",
        { word: next.answer, expectedTurn: 0 },
        1100,
      ),
    /마지막/,
  );
  const move = core.successors(pool, initial.currentWord, initial.used)[0];
  let state = core.apply(
    initial,
    words,
    "word",
    { word: move.answer.toUpperCase(), expectedTurn: 0 },
    1100,
  );
  const copy = core.apply(
    state,
    words,
    "word",
    { word: move.answer, expectedTurn: 0 },
    1100,
  );
  assert.deepEqual(copy, state);
  assert.equal(core.score(state), 50);
  const wrong = state.pending.options.find((v) => v !== state.pending.answer);
  state = core.apply(
    state,
    words,
    "meaning",
    { choice: wrong, expectedTurn: 0 },
    1200,
  );
  assert.equal(core.score(state), 50);
  assert.deepEqual(
    core.apply(
      state,
      words,
      "meaning",
      { choice: move.clue, expectedTurn: 0 },
      1300,
    ),
    state,
  );
});
test("one hint per turn has a persistent cost and timeouts keep accepted-word points", () => {
  const words = bank["en-level1"];
  let s = core.create(words, "en-level1", "hints", 1000);
  s = core.apply(s, words, "hint", { expectedTurn: 0 }, 1100);
  const repeated = core.apply(s, words, "hint", { expectedTurn: 0 }, 1150);
  assert.equal(repeated.hintedTurns.length, 1);
  s = core.apply(s, words, "word", { word: s.hintWord, expectedTurn: 0 }, 1200);
  assert.equal(core.score(s), 30);
  s = core.apply(
    s,
    words,
    "meaning",
    { choice: s.pending.answer, expectedTurn: 0 },
    1300,
  );
  assert.equal(core.score(s), 80);
  const ended = core.apply(
    s,
    words,
    "word",
    { word: "anything", expectedTurn: 1 },
    181000,
  );
  assert(ended.finishedAt);
  assert.equal(core.score(ended), 80);
  assert.deepEqual(
    core.apply(
      ended,
      words,
      "meaning",
      { choice: "anything", expectedTurn: 1 },
      181001,
    ),
    ended,
  );
});
test("Korean joins exact syllables and a blocked path restarts or ends safely", () => {
  const words = [
    { id: "가나", answer: "가나", clue: "첫째" },
    { id: "나라", answer: "나라", clue: "둘째" },
    { id: "바다", answer: "바다", clue: "셋째" },
    { id: "다리", answer: "다리", clue: "넷째" },
  ];
  const s = core.create(words, "ko-level1", "small", 1000),
    pool = core.dictionary(words, "ko-level1"),
    move = core.successors(pool, s.currentWord, s.used)[0];
  const pending = core.apply(
    s,
    words,
    "word",
    { word: move.answer, expectedTurn: 0 },
    1100,
  );
  const next = core.apply(
    pending,
    words,
    "meaning",
    { choice: pending.pending.answer, expectedTurn: 0 },
    1200,
  );
  assert(next.reset || next.finishedAt);
  if (!next.finishedAt)
    assert(core.successors(pool, next.currentWord, next.used).length);
  assert.throws(
    () =>
      core.create(
        [{ id: "x", answer: "가나", clue: "한 단어" }],
        "ko-level1",
        "none",
        1000,
      ),
    /부족/,
  );
});

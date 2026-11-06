const test = require("node:test"),
  assert = require("node:assert/strict"),
  core = require("./functions/crossword-core"),
  bank = require("./functions/game-words.json");
test("crosswords are connected, fit the grid, and every crossing agrees", () => {
  for (const [scope, words] of Object.entries(bank))
    for (let day = 1; day <= 30; day++) {
      const p = core.create(words, scope + day),
        cells = new Map(),
        links = new Map();
      assert(p.entries.length >= 3);
      assert(p.width <= 13 && p.height <= 13);
      p.entries.forEach((e, index) => {
        links.set(index, new Set());
        for (let i = 0; i < e.answer.length; i++) {
          const x = e.x + (e.axis === "across" ? i : 0),
            y = e.y + (e.axis === "down" ? i : 0),
            k = x + "," + y,
            old = cells.get(k);
          assert(x >= 0 && y >= 0 && x < p.width && y < p.height);
          if (old) {
            assert.equal(old.letter, e.answer[i]);
            links.get(index).add(old.index);
            links.get(old.index).add(index);
          } else cells.set(k, { letter: e.answer[i], index });
        }
      });
      const seen = new Set(),
        queue = [0];
      while (queue.length) {
        const n = queue.shift();
        if (seen.has(n)) continue;
        seen.add(n);
        queue.push(...links.get(n));
      }
      assert.equal(seen.size, p.entries.length);
      assert.deepEqual(core.create(words, scope + day), p);
      assert(
        core
          .publicPuzzle(p)
          .entries.every((e) => !Object.hasOwn(e, "answer") && e.length >= 2),
      );
    }
});
test("grading uses answers and distinct hint costs rather than client points", () => {
  const p = core.create(bank["en-level1"], "grade"),
    answers = Object.fromEntries(
      p.entries.map((e) => [e.id, e.answer.toUpperCase()]),
    );
  assert.equal(core.grade(p, answers).score, p.entries.length * 100);
  assert.equal(
    core.grade(p, answers, [p.entries[0].id, p.entries[0].id]).score,
    p.entries.length * 100 - 20,
  );
  assert.equal(core.grade(p, {}).score, 0);
});
test("insufficient connected content fails clearly", () =>
  assert.throws(
    () => core.create([{ id: "x", answer: "abc", clue: "x" }], "x"),
    /부족/,
  ));

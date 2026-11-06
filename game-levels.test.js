const { test } = require("node:test"),
  assert = require("node:assert/strict");
const levels = require("./game-levels"),
  cross = require("./functions/crossword-core"),
  chain = require("./functions/word-chain-core"),
  bank = require("./functions/game-level-words.json");
test("10 valid game stages per language have playable, well-formed clue banks", () => {
  assert.equal(levels.levels.length, 10);
  assert.equal(Object.keys(bank).length, 20);
  for (const [scope, words] of Object.entries(bank)) {
    assert(words.length >= 25);
    assert.equal(new Set(words.map((w) => w.answer)).size, words.length);
    for (const word of words) {
      assert(word.id && word.clue && word.clue !== "x");
      assert(
        (scope.startsWith("en") ? /^[a-z]{2,9}$/ : /^[가-힣]{2,8}$/).test(
          word.answer,
        ),
      );
      if (scope.startsWith("en")) assert(!/[가-힣]/.test(word.clue));
    }
    for (let seed = 0; seed < 12; seed++) {
      const p = levels.createPuzzle(
        cross.create,
        words,
        "test" + seed,
        levels.parse(scope).level,
      );
      assert.equal(
        p.entries.length,
        levels.levels[levels.parse(scope).level - 1].words,
        scope,
      );
      const pool = levels.chainPool(bank, scope);
      let s = chain.create(pool, scope, "test" + seed, 100);
      while (!s.finishedAt) {
        const move = chain.successors(pool, s.currentWord, s.used)[0];
        assert(move);
        s = chain.apply(
          s,
          pool,
          "word",
          { word: move.answer, expectedTurn: s.turn },
          101,
        );
        s = chain.apply(
          s,
          pool,
          "meaning",
          { choice: s.pending.answer, expectedTurn: s.turn },
          102,
        );
      }
      assert.equal(s.turn, 10, scope + " ends too early");
      assert.equal(chain.score(s), 1000);
    }
  }
});
test("recommendation requires two strong distinct boards, never duplicates or invalid scores", () => {
  const run = (id, words, score = 80, level = 1) => ({
    id,
    level,
    score,
    maxScore: 100,
    words,
  });
  let p = levels.advance(null, run("a", ["cat", "dog", "apple"]));
  assert.equal(p.recommended, 1);
  assert.deepEqual(
    levels.advance(p, run("a", ["different", "other", "words"])),
    p,
  );
  p = levels.advance(p, run("b", ["cat", "dog", "apple"]));
  assert.equal(p.recommended, 1);
  p = levels.advance(p, run("c", ["leaf", "tree", "root"]));
  assert.equal(p.recommended, 2);
  let q = levels.advance(null, run("d", ["one", "two", "three"], 79));
  q = levels.advance(q, run("e", ["four", "five", "six"]));
  assert.equal(q.recommended, 1);
  q = levels.advance(q, run("f", ["seven", "eight", "nine"]));
  assert.equal(q.recommended, 2);
  assert.throws(() => levels.advance(q, run("invalid", ["a"], 101)));
  let top = levels.advance(null, run("top1", ["a", "b", "c"], 90, 10));
  top = levels.advance(top, run("top2", ["d", "e", "f"], 90, 10));
  assert.equal(top.recommended, 10);
  assert.equal(levels.displayName("우준"), "우준이");
  assert.equal(levels.displayName("우준아빠"), "우준아빠");
  assert.throws(() => levels.scope("en", 11));
  assert.equal(levels.parse("ko-stage10").level, 10);
});
const fs=require('node:fs'),vm=require('node:vm');
test('legacy unfinished games remain recoverable without changing their saved record',()=>{
 const context={window:{},GameLevels:levels};vm.createContext(context);vm.runInContext(fs.readFileSync('./game-setup.js','utf8'),context);
 const legacy={scope:'ko-level1',competitive:false,solution:{entries:[]},result:null};const original=JSON.stringify(legacy);
 const entries={'SmartStudy_Crossword_student_2026-11-05_ko-level1_practice':legacy};const repository={keys:()=>Object.keys(entries),getPreference:key=>entries[key]};
 assert.equal(context.window.GameSetup.resumeLegacy(repository,'student','crossword','ko-stage4'),legacy);
 assert.equal(context.window.GameSetup.resumeLegacy(repository,'another','crossword','ko-stage4'),null);
 assert.equal(context.window.GameSetup.resumeLegacy(repository,'student','crossword','ko-stage1'),null);
 assert.equal(JSON.stringify(legacy),original);
});

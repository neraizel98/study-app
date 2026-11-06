const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const context = {};
context.window = context;
vm.createContext(context);
const files = [
  "KoreanVocabData.js",
  "KoreanVocabLevel1a.js",
  "KoreanVocabLevel1b.js",
  "KoreanVocabLevel2a.js",
  "KoreanVocabLevel2b.js",
  "VocabEng.js",
  ...fs
    .readdirSync(root)
    .filter((name) => /^VocabEng(?:M[123]|H[123][ab])\.js$/.test(name)),
];
for (const name of files)
  vm.runInContext(fs.readFileSync(path.join(root, name), "utf8"), context);
const foundation = JSON.parse(
  fs
    .readFileSync(path.join(root, "functions/game-foundation.json"), "utf8")
    .replace(/^\uFEFF/, ""),
);
const out = {};
const unique = (words) =>
  words.filter(
    (w, i, a) => a.findIndex((other) => other.answer === w.answer) === i,
  );
const convert = (pairs, prefix) =>
  pairs
    .filter(([word, clue]) => clue !== "x")
    .map(([answer, clue]) => ({ id: prefix + ":" + answer, answer, clue }));
const baseKo1 = convert(foundation.ko1, "primary1"),
  baseKo2 = convert(foundation.ko2, "primary2"),
  baseKo3 = convert(foundation.ko3, "primary3");
out["ko-stage1"] = baseKo1;
out["ko-stage2"] = unique([...baseKo2, ...baseKo1.slice(0, 15)]);
out["ko-stage3"] = unique([...baseKo3, ...baseKo2.slice(0, 15)]);
const ko = (level) =>
  context.KoreanVocabData.levels[level].units
    .flatMap((unit) =>
      unit.words.map((word) => ({
        id: word.id,
        answer: word.word,
        clue: word.meaning,
      })),
    )
    .filter((word) => /^[가-힣]{2,8}$/.test(word.answer));
const middle = ko("level1"),
  high = ko("level2");
for (let stage = 4; stage <= 6; stage++) {
  const units = stage === 4 ? [1, 2] : stage === 5 ? [3, 4] : [5, 6];
  const focus = middle.filter((w) =>
    units.some((unit) => w.id.startsWith("kv1-u" + unit + "-")),
  );
  out["ko-stage" + stage] = unique([
    ...focus,
    ...middle.filter((w) => !focus.includes(w)).slice(0, 16),
  ]);
}
for (let stage = 7; stage <= 10; stage++) {
  const units = stage === 7 ? [3, 4] : stage === 8 ? [1, 2] : [5, 6];
  const focus = high.filter((w) =>
    units.some((unit) => w.id.startsWith("kv2-u" + unit + "-")),
  );
  out["ko-stage" + stage] = unique([
    ...focus,
    ...high.filter((w) => !focus.includes(w)).slice(0, stage === 10 ? 26 : 16),
  ]);
}
const english = (level) =>
  context.vocabData[level]
    .filter((w) => /^[a-z]{2,9}$/.test(w.word) && w.def)
    .map((w) => ({
      id: w.word,
      answer: w.word,
      clue: w.def,
      grade: w.schoolGrade || 1,
    }));
const en1 = convert(foundation.en1, "primary1"),
  en2 = convert(foundation.en2, "primary2");
out["en-stage1"] = en1;
out["en-stage2"] = unique([...en2, ...en1.slice(0, 12)]);
out["en-stage3"] = unique([...english("level1"), ...english("level2")]);
for (let stage = 4; stage <= 6; stage++)
  out["en-stage" + stage] = unique(
    english("level3").filter((w) => w.grade === stage - 3),
  );
for (let stage = 7; stage <= 9; stage++)
  out["en-stage" + stage] = unique(
    english("level4").filter((w) => w.grade === stage - 6),
  );
out["en-stage10"] = unique(
  english("level4").filter((w) => w.grade >= 2 && w.answer.length >= 7),
);
for (const [scope, words] of Object.entries(out))
  if (words.length < 25) throw Error(scope + " requires more words");
fs.writeFileSync(
  path.join(root, "functions/game-level-words.json"),
  JSON.stringify(out, null, 2) + "\n",
);
console.log(
  Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.length])),
);

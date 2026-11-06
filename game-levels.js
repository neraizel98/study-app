(function (root) {
  "use strict";
  const descriptions = [
    "초1~2 기초",
    "초3~4",
    "초5~6",
    "중1",
    "중2",
    "중3",
    "고1",
    "고2",
    "고3",
    "고3 심화",
  ];
  const levels = descriptions.map((description, index) => ({
    level: index + 1,
    description,
    words: Math.min(8, 4 + Math.floor(index / 2)),
  }));
  function scope(language, level) {
    if (
      !["ko", "en"].includes(language) ||
      !Number.isInteger(level) ||
      level < 1 ||
      level > 10
    )
      throw Error("레벨을 확인해 주세요.");
    return language + "-stage" + level;
  }
  function parse(value) {
    const match = String(value || "").match(/^(ko|en)-stage(10|[1-9])$/);
    return match ? { language: match[1], level: Number(match[2]) } : null;
  }
  function legacy(value) {
    const match = String(value || "").match(/^(ko|en)-level([1-4])$/);
    if (!match) return null;
    return {
      language: match[1],
      level:
        match[1] === "ko"
          ? match[2] === "1"
            ? 4
            : 7
          : { 1: 2, 2: 3, 3: 4, 4: 7 }[match[2]],
    };
  }
  function displayName(user, profile) {
    const name = profile?.name || profile?.displayName || user;
    return name === "우준" ? "우준이" : String(name);
  }
  function initial() {
    return { version: 1, recommended: 1, streaks: {}, runs: [] };
  }
  function advance(previous, result) {
    const p =
      previous?.version === 1
        ? JSON.parse(JSON.stringify(previous))
        : initial();
    if (
      !result ||
      !result.id ||
      !Number.isInteger(result.level) ||
      result.level < 1 ||
      result.level > 10 ||
      !Number.isFinite(result.score) ||
      !Number.isFinite(result.maxScore) ||
      result.maxScore <= 0 ||
      result.score < 0 ||
      result.score > result.maxScore
    )
      throw Error("게임 결과를 확인해 주세요.");
    if (p.runs.some((run) => run.id === result.id)) return p;
    const fingerprint = [...new Set(result.words || [])].sort().join("|");
    const recent = p.runs.filter((run) => run.level === result.level);
    const repeated = recent.some((run) => run.fingerprint === fingerprint);
    const success =
      result.score / result.maxScore >= 0.8 &&
      new Set(result.words || []).size >= 3 &&
      !repeated;
    p.streaks[result.level] = success
      ? (p.streaks[result.level] || 0) + 1
      : repeated
        ? p.streaks[result.level] || 0
        : 0;
    if (p.streaks[result.level] >= 2)
      p.recommended = Math.max(p.recommended, Math.min(10, result.level + 1));
    p.runs.push({
      id: result.id,
      level: result.level,
      score: result.score,
      maxScore: result.maxScore,
      fingerprint,
      success,
    });
    p.runs = p.runs.slice(-80);
    return p;
  }
  function createPuzzle(create, words, seed, level) {
    const desired = levels[level - 1].words;
    let best = null,
      lastError = null;
    for (let trial = 0; trial < 20; trial++) {
      try {
        const puzzle = create(words, seed + ":" + trial, desired);
        if (!best || puzzle.entries.length > best.entries.length) best = puzzle;
        if (puzzle.entries.length === desired) return puzzle;
      } catch (error) {
        lastError = error;
      }
    }
    if (best) return best;
    throw lastError || Error("게임 자료를 준비하지 못했어요.");
  }
  function chainPool(bank, value) {
    const parsed = parse(value);
    if (!parsed) throw Error("레벨을 확인해 주세요.");
    const scopes =
      parsed.language === "ko" && parsed.level >= 4
        ? (parsed.level <= 6 ? [4, 5, 6] : [7, 8, 9, 10]).map((level) =>
            scope("ko", level),
          )
        : [value];
    const seen = new Set();
    return [value, ...scopes]
      .flatMap((key) => bank[key] || [])
      .filter((word) => {
        if (seen.has(word.answer)) return false;
        seen.add(word.answer);
        return true;
      });
  }
  const api = {
    levels,
    scope,
    parse,
    legacy,
    displayName,
    initial,
    advance,
    createPuzzle,
    chainPool,
  };
  if (typeof module !== "undefined") module.exports = api;
  else root.GameLevels = api;
})(typeof window === "undefined" ? globalThis : window);

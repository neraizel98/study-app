(function (root) {
  "use strict";
  const version = "crossword-v1";
  function random(seed) {
    let value = 2166136261;
    for (const c of seed)
      value = Math.imul(value ^ c.charCodeAt(0), 16777619) >>> 0;
    return () => {
      value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }
  function shuffle(items, rng) {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
  const key = (x, y) => x + "," + y;
  function create(words, seed, limit = 6) {
    const rng = random(version + seed),
      bank = shuffle(
        words.filter((w) => w.answer && w.clue),
        rng,
      ),
      cells = new Map(),
      entries = [];
    const counts = new Map();
    for (const word of bank)
      for (const c of new Set(word.answer))
        counts.set(c, (counts.get(c) || 0) + 1);
    const connectivity = (w) =>
      [...new Set(w.answer)].reduce((sum, c) => sum + (counts.get(c) || 0), 0);
    bank.sort((a, b) => connectivity(b) - connectivity(a));
    const anchorIndex = Math.floor(rng() * Math.min(20, bank.length));
    if (bank.length) bank.unshift(...bank.splice(anchorIndex, 1));
    function valid(word, x, y, axis) {
      if (
        x < 0 ||
        y < 0 ||
        x + (axis === "across" ? word.length : 1) > 13 ||
        y + (axis === "down" ? word.length : 1) > 13
      )
        return false;
      const dx = axis === "across" ? 1 : 0,
        dy = 1 - dx;
      if (
        cells.has(key(x - dx, y - dy)) ||
        cells.has(key(x + dx * word.length, y + dy * word.length))
      )
        return false;
      let crossings = 0;
      for (let i = 0; i < word.length; i++) {
        const px = x + dx * i,
          py = y + dy * i,
          cell = cells.get(key(px, py));
        if (cell) {
          if (cell.letter !== word[i] || cell.axes.includes(axis)) return false;
          crossings++;
        } else if (
          cells.has(key(px - dy, py - dx)) ||
          cells.has(key(px + dy, py + dx))
        )
          return false;
      }
      return entries.length === 0 || crossings > 0;
    }
    function place(item, x, y, axis) {
      const number = entries.length + 1;
      entries.push({ ...item, x, y, axis, number });
      for (let i = 0; i < item.answer.length; i++) {
        const k = key(
            x + (axis === "across" ? i : 0),
            y + (axis === "down" ? i : 0),
          ),
          cell = cells.get(k) || { letter: item.answer[i], axes: [] };
        cell.axes.push(axis);
        cells.set(k, cell);
      }
    }
    for (let pass = 0; pass < 4 && entries.length < limit; pass++)
      for (const item of bank) {
        if (entries.some((e) => e.answer === item.answer)) continue;
        if (!entries.length) {
          place(item, Math.floor((13 - item.answer.length) / 2), 6, "across");
          continue;
        }
        let choice = null;
        for (const [k, cell] of cells) {
          const [x, y] = k.split(",").map(Number);
          for (let i = 0; i < item.answer.length; i++)
            if (item.answer[i] === cell.letter)
              for (const axis of ["across", "down"]) {
                const sx = x - (axis === "across" ? i : 0),
                  sy = y - (axis === "down" ? i : 0);
                if (valid(item.answer, sx, sy, axis)) {
                  choice = { x: sx, y: sy, axis };
                  break;
                }
              }
          if (choice) break;
        }
        if (choice) place(item, choice.x, choice.y, choice.axis);
        if (entries.length === limit) break;
      }
    if (entries.length < 3)
      throw Error(
        "교차 가능한 단어가 부족합니다. 다른 학습 범위를 골라 주세요.",
      );
    const xs = [...cells.keys()].map((k) => +k.split(",")[0]),
      ys = [...cells.keys()].map((k) => +k.split(",")[1]),
      minX = Math.min(...xs),
      minY = Math.min(...ys);
    return {
      version,
      seed,
      width: Math.max(...xs) - minX + 1,
      height: Math.max(...ys) - minY + 1,
      entries: entries.map((e) => ({ ...e, x: e.x - minX, y: e.y - minY })),
    };
  }
  function publicPuzzle(p) {
    return {
      ...p,
      entries: p.entries.map(({ answer, ...e }) => ({
        ...e,
        length: answer.length,
      })),
    };
  }
  function grade(p, answers, hints = []) {
    let correct = 0;
    for (const e of p.entries)
      if (
        String(answers[e.id] || "")
          .normalize("NFC")
          .trim()
          .toLowerCase() === e.answer.toLowerCase()
      )
        correct++;
    const score = Math.max(0, correct * 100 - new Set(hints).size * 20);
    return { correct, total: p.entries.length, score };
  }
  const api = { create, publicPuzzle, grade, version, shuffle, random };
  if (typeof module !== "undefined") module.exports = api;
  else root.CrosswordCore = api;
})(typeof window === "undefined" ? globalThis : window);

(function (root) {
  "use strict";
  const { random, shuffle } =
    typeof module !== "undefined"
      ? require("./crossword-core")
      : root.CrosswordCore;
  const version = "chain-v1";
  const durationMs = 180000;
  const maxTurns = 10;
  const normalize = (value) =>
    String(value || "")
      .normalize("NFC")
      .trim()
      .toLowerCase();
  const score = (state) =>
    Math.max(0, state.earned - state.hintedTurns.length * 20);
  function dictionary(words, scope) {
    const english = scope.startsWith("en-");
    const seen = new Set();
    return words.filter((word) => {
      const value = normalize(word.answer);
      const valid =
        (english
          ? /^[a-z]{2,9}$/.test(value) &&
            typeof word.id === "string" &&
            word.id === word.id.toLowerCase()
          : /^[가-힣]{2,8}$/.test(value)) && word.clue;
      if (!valid || seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
  function successors(words, from, used) {
    const tail = [...normalize(from)].at(-1);
    return words.filter(
      (word) => !used.includes(word.answer) && word.answer.startsWith(tail),
    );
  }
  function pickStart(words, used, seed) {
    const free = shuffle(
      words.filter((word) => !used.includes(word.answer)),
      random(seed),
    );
    return (
      free.find(
        (word) => successors(words, word.answer, [...used, word.answer]).length,
      ) || free[0]
    );
  }
  function create(words, scope, seed, now) {
    const pool = dictionary(words, scope);
    const start = pickStart(pool, [], seed);
    if (!start || !successors(pool, start.answer, [start.answer]).length)
      throw Error("연결 가능한 단어가 부족해요. 다른 범위를 선택해 주세요.");
    return {
      version,
      scope,
      seed,
      startedAt: now,
      turn: 0,
      currentWord: start.answer,
      used: [start.answer],
      earned: 0,
      hintedTurns: [],
      pending: null,
      history: [],
      finishedAt: null,
      lastFeedback: null,
      reset: false,
    };
  }
  function publicState(state) {
    return {
      version,
      scope: state.scope,
      startedAt: state.startedAt,
      turn: state.turn,
      maxTurns,
      currentWord: state.currentWord,
      used: [...state.used],
      score: score(state),
      hintedTurns: [...state.hintedTurns],
      pending: state.pending
        ? { word: state.pending.word, options: [...state.pending.options] }
        : null,
      history: state.history.map((item) => ({ ...item })),
      finishedAt: state.finishedAt,
      lastFeedback: state.lastFeedback ? { ...state.lastFeedback } : null,
      reset: state.reset,
      hintWord: state.hintWord || null,
      finishReason: state.finishReason || null,
      deadline: state.startedAt + durationMs,
    };
  }
  function apply(old, words, action, input, now) {
    const state = JSON.parse(JSON.stringify(old));
    if (state.finishedAt) return state;
    if (now >= state.startedAt + durationMs || action === "finish") {
      state.finishedAt = now;
      state.pending = null;
      return state;
    }
    if (
      !Number.isInteger(input.expectedTurn) ||
      input.expectedTurn !== state.turn
    )
      return state;
    const pool = dictionary(words, state.scope);
    if (action === "hint") {
      if (state.pending) throw Error("먼저 단어의 뜻을 골라 주세요.");
      const candidate = successors(pool, state.currentWord, state.used)[0];
      if (!candidate) throw Error("새 시작 단어를 확인해 주세요.");
      if (!state.hintedTurns.includes(state.turn))
        state.hintedTurns.push(state.turn);
      state.hintWord = candidate.answer;
      return state;
    }
    if (action === "word") {
      const answer = normalize(input.word);
      if (state.pending) {
        if (answer === state.pending.word) return state;
        throw Error("입력한 단어의 뜻을 먼저 골라 주세요.");
      }
      if (state.used.includes(answer))
        throw Error("이번 판에서 이미 나온 단어예요.");
      if (!answer.startsWith([...state.currentWord].at(-1)))
        throw Error("앞 단어의 마지막 글자로 시작해 주세요.");
      const word = pool.find((item) => item.answer === answer);
      if (!word) throw Error("이 학습 범위에 등록된 단어를 입력해 주세요.");
      const alternatives = [
        ...new Set(
          pool
            .filter((item) => item.clue !== word.clue)
            .map((item) => item.clue),
        ),
      ];
      if (alternatives.length < 2)
        throw Error("이 단어의 뜻 문제를 준비하지 못했어요.");
      state.pending = {
        word: answer,
        answer: word.clue,
        options: shuffle(
          [
            word.clue,
            ...shuffle(alternatives, random(state.seed + state.turn)).slice(
              0,
              2,
            ),
          ],
          random(state.seed + ":choices:" + state.turn),
        ),
      };
      state.used.push(answer);
      state.earned += 50;
      state.reset = false;
      state.hintWord = null;
      return state;
    }
    if (action !== "meaning") throw Error("알 수 없는 게임 요청입니다.");
    if (!state.pending) return state;
    if (!state.pending.options.includes(input.choice))
      throw Error("보기 중 하나를 골라 주세요.");
    const pending = state.pending,
      correct = input.choice === pending.answer;
    const earned = correct ? 50 : 0;
    state.earned += earned;
    state.history.push({
      word: pending.word,
      clue: pending.answer,
      correct,
      earned: 50 + earned,
    });
    state.lastFeedback = {
      word: pending.word,
      clue: pending.answer,
      correct,
      earned: 50 + earned,
    };
    state.pending = null;
    state.turn++;
    if (state.turn >= maxTurns) {
      state.finishedAt = now;
      return state;
    }
    const following = successors(pool, pending.word, state.used);
    let opponent = shuffle(
      following,
      random(state.seed + ":opponent:" + state.turn),
    ).find(
      (word) =>
        successors(pool, word.answer, [...state.used, word.answer]).length,
    );
    state.reset = !opponent;
    if (!opponent)
      opponent = pickStart(
        pool,
        state.used,
        state.seed + ":restart:" + state.turn,
      );
    if (
      !opponent ||
      !successors(pool, opponent.answer, [...state.used, opponent.answer])
        .length
    ) {
      state.finishedAt = now;
      state.finishReason = "exhausted";
      return state;
    }
    state.currentWord = opponent.answer;
    state.used.push(opponent.answer);
    return state;
  }
  const api = {
    version,
    durationMs,
    maxTurns,
    normalize,
    dictionary,
    successors,
    create,
    publicState,
    apply,
    score,
  };
  if (typeof module !== "undefined") module.exports = api;
  else root.WordChainCore = api;
})(typeof window === "undefined" ? globalThis : window);

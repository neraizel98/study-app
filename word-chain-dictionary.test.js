const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  dictionary = require("./word-chain-dictionary"),
  core = require("./functions/word-chain-core");
test("public dictionary definitions stay in the selected language and remove wiki markup", () => {
  assert.equal(
    dictionary.koreanDefinition({
      parse: {
        wikitext: {
          "*": "== 한국어 ==\n=== 명사 ===\n# [[사과나무]]의 열매.\n== 일본어 ==\n# wrong",
        },
      },
    }),
    "사과나무의 열매.",
  );
  assert.equal(
    dictionary.koreanDefinition({
      parse: { wikitext: { "*": "== 일본어 ==\n# 다른 언어" } },
    }),
    null,
  );
  assert.equal(
    dictionary.englishDefinition(
      [
        {
          word: "photosynthesis",
          meanings: [
            {
              definitions: [
                {
                  definition:
                    "The process by which plants use light to make sugars.",
                },
              ],
            },
          ],
        },
      ],
      "photosynthesis",
    ),
    "The process by which plants use light to make sugars.",
  );
});
test("unlisted words use dictionary verification; unavailable and invalid words do not become accepted entries", async () => {
  const word = await dictionary.lookup("en", "photosynthesis", async () => ({
    ok: true,
    json: async () => [
      {
        word: "photosynthesis",
        meanings: [
          {
            definitions: [
              {
                definition:
                  "The process by which plants use light to make sugars.",
              },
            ],
          },
        ],
      },
    ],
  }));
  assert.equal(word.answer, "photosynthesis");
  assert.equal(core.dictionary([word], "en-free").length, 1);
  assert.equal(core.dictionary([word], "en-stage1").length, 0);
  await assert.rejects(
    dictionary.lookup("en", "wrong word", async () => {
      throw Error("should not request");
    }),
    /2~30/,
  );
  await assert.rejects(
    dictionary.lookup("en", "zzzz", async () => ({ ok: false, status: 404 })),
    /사전에서/,
  );
  await assert.rejects(
    dictionary.lookup("ko", "사과", async () => {
      throw new TypeError("network");
    }),
    /인터넷/,
  );
  await assert.rejects(
    dictionary.lookup("ko", "사과", async () => ({
      ok: true,
      json: async () => ({
        parse: { wikitext: { "*": "== 일본어 ==\n# unavailable" } },
      }),
    })),
    /뜻을 확인/,
  );
});

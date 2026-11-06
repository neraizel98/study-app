(function (root) {
  "use strict";
  function clean(text) {
    return String(text)
      .replace(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/g, "$1")
      .replace(/\{\{[^{}]*\}\}/g, "")
      .replace(/\{\{[^{}]*\}\}/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/'{2,}/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
  }
  function koreanDefinition(data) {
    const text = data?.parse?.wikitext?.["*"] || "",
      section =
        text.match(
          /^==\s*한국어\s*==\s*\n([\s\S]*?)(?=^==[^=]|$(?![\s\S]))/m,
        )?.[1] || "";
    for (const match of section.matchAll(/^# (.+)$/gm)) {
      const value = clean(match[1]);
      if (value.length >= 3) return value;
    }
    return null;
  }
  function englishDefinition(data, word) {
    if (!Array.isArray(data)) return null;
    for (const entry of data) {
      if (String(entry.word).toLowerCase() !== word) continue;
      for (const meaning of entry.meanings || [])
        for (const definition of meaning.definitions || []) {
          const value = clean(definition.definition);
          if (value.length >= 3) return value;
        }
    }
    return null;
  }
  async function lookup(language, value, fetcher = root.fetch.bind(root)) {
    const word = String(value).normalize("NFC").trim().toLowerCase();
    if (!(language === "ko" ? /^[가-힣]{2,20}$/ : /^[a-z]{2,30}$/).test(word))
      throw Error("국어는 한글 2~20자, 영어는 알파벳 2~30자로 입력해 주세요.");
    const url =
      language === "ko"
        ? "https://ko.wiktionary.org/w/api.php?action=parse&prop=wikitext&format=json&origin=*&page=" +
          encodeURIComponent(word)
        : "https://api.dictionaryapi.dev/api/v2/entries/en/" +
          encodeURIComponent(word);
    const controller = new AbortController(),
      timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetcher(url, { signal: controller.signal });
      if (response.status === 404)
        throw Error("사전에서 찾을 수 없는 단어예요. 철자를 확인해 주세요.");
      if (!response.ok)
        throw Error("사전 연결이 원활하지 않아요. 다시 눌러 주세요.");
      const data = await response.json();
      const clue =
        language === "ko"
          ? koreanDefinition(data)
          : englishDefinition(data, word);
      if (!clue)
        throw Error(
          "사전에서 뜻을 확인하지 못했어요. 다른 단어를 입력해 주세요.",
        );
      return {
        id: "dictionary:" + word,
        answer: word,
        clue,
        source:
          language === "ko"
            ? "https://ko.wiktionary.org/wiki/" + encodeURIComponent(word)
            : "https://en.wiktionary.org/wiki/" + encodeURIComponent(word),
      };
    } catch (error) {
      if (error.name === "AbortError" || error instanceof TypeError)
        throw Error(
          "사전에 연결하지 못했어요. 인터넷 연결을 확인한 뒤 다시 눌러 주세요.",
        );
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
  const api = { lookup, koreanDefinition, englishDefinition };
  if (typeof module !== "undefined") module.exports = api;
  else root.WordChainDictionary = api;
})(typeof window === "undefined" ? globalThis : window);

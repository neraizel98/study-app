# Game levels

The game menu and both launch screens use the independent game scope `ko-stage1` through `ko-stage10`, and equivalent `en-stage*` scopes. These are recommended game difficulty bands, not a standardized grade assessment.

- 1–3: primary foundations (grades 1–2, 3–4, 5–6).
- 4–6: middle-school vocabulary bands.
- 7–9: high-school vocabulary bands.
- 10: advanced high-school vocabulary.

Launch uses the current learner name (`우준` displays as `우준이`) and one start action. All ten levels are selectable. Two different word sets scoring at least 80% at a level raise the recommendation to the next level; a lower score resets that level's success streak. Duplicate result IDs and identical word sets do not earn an extra advancement. Recommendations are stored separately by learner, language and game and never alter subject mastery or normal quiz records.

Crosswords use 4–8 words and 10 minutes. Word chains use 10 turns and 3 minutes. Korean chains share supplemental words within the same school band to avoid dead ends; no word may repeat in one game. English clues remain English. Existing unfinished local games can resume at their mapped level and their original storage is retained.

`node scripts/build-game-levels.cjs` rebuilds the bank from existing vocabulary sources plus `functions/game-foundation.json`. Keep definitions accurate and add connecting words when extending Korean chains. `node --test game-levels.test.js` checks all 20 pools and difficulty policy. Browser flows live in `tests/arcade-browser.cjs`.

Online ranking stays disabled per the approved release scope. The legacy server dictionaries and APIs remain intact. A future online release must extend the server validation to the new stage scopes and define shared puzzle versions before enabling `GameConfig.onlineEnabled`; local scores are not authoritative competition scores.

## Free word chain update

Word chain now has language selection only, using `ko-free` / `en-free`. It draws starting words and hints from the combined banks across all levels. Words outside those banks are verified on demand through Korean Wiktionary or Free Dictionary API before being accepted. Network errors preserve the current turn. The usual last-letter, duplicate and meaning-choice rules remain. Word-chain level recommendations no longer change; previous recommendation data and unfinished stage snapshots are retained. Previous unfinished stage games can be resumed under their language-only mode. Crossword levels remain unchanged.

# Science Level 1 completion — in progress

Branch: agent/learning-games-release-20261106. Remote instructions synchronized through e36e420. No production deployment.

## Objective
Complete approved 28 elementary core units plus 4 middle-school bridge units, with curriculum limitations clearly stated. Keep cream/cyan UI, correct level/domain selection, explicit lesson-to-model mapping, meaningful diagrams and interactive media. Minimum 20 practice and 60 distinct assessment items per unit; ten-question practice and science20 in versioned75 mocks.

## Completed foundation
- Existing eight units, 160 practice/480 assessment questions, report/timer/wrong-note integration.
- Legacy55 versus science75 snapshots,95-minute science75, paper/OMR, source hydration and compact payloads.
- Local Firebase emulator34 cases passed; nested-array table serialization fixed. Existing unpublished raw result reads remain a documented pre-existing limitation: docs/MOCK_RESULT_PRIVACY_FOLLOWUP.md. UI publication gate remains.
- Three.js r187 vendored with license. Approved local moving-solar-system prototype: docs/science-cosmos-preview.html; no galaxy-wide image, oblique world-space trails,90-second playback.

## Active ownership
- /root/science_ui: production science UI, model dispatch/conditions, science-extension-models.js, science-cosmos-model.js, science.html/CSS/SW and browser QA.
- /root/english_read_write_phase1: ScienceData/ScienceMockData registration APIs; ScienceLifeEarthExpansion.js and ScienceMockLifeEarthExpansion.js; existing source lesson corrections; final full inventory tests.
- /root/science_physical_expansion: SciencePhysicalExpansion.js and ScienceMockPhysicalExpansion.js, related tests. No core edits.
- Root: integration, other HTML script loading, cross-review and final checks. Shared git index/commits managed by root only.

## Remaining
Expansion practice definitions are mostly written; assessment expansion banks are incomplete. Never describe32 units or2560 questions as finished until actual inventory and quality tests pass. Finish lesson condition mappings, full32 media checks, practice save/retry/refresh, each studied unit's three distinct science20 exams, real SDK payload writes, paper/OMR and privacy UI checks. Use docs/SCIENCE_LEVEL1_COMPLETION_PLAN.md for IDs and scene contracts.

## Runtime and cautions
Local preview http://127.0.0.1:8766. Playwright runtime NODE_PATH=C:/Users/NX3GAMES/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules. Firebase tools/Java isolated in ../work/science-rules-runtime. Existing English changes in this branch must be preserved. Incomplete data modules may produce syntax/404 errors during authoring: full browser completion is not yet verified. Do not substitute generic titles/colors for real topic-specific models or use irrelevant distractors. Do not claim exact school semester coverage; primary curriculum mapping is incomplete.

## Latest checkpoint
- Full practice inventory loads32 units (8 per domain) and650 questions, including10 supplementary questions. Content/answer QA still in progress.
- All new renderer kinds are connected; browser checks cover32 units/lesson bindings. Body anatomy and Moon observer labels are being improved after visual review.
- Both expansion assessment banks are still being authored; full mock inventory/SDK validation pending. Temporary authoring chunk files must not be published.


# English reading level2/level3 expansion

## Scope

Add36original passages: six for each of middle1, middle2, middle3, high1, high2 and high3. Each level grows from18to36 passages, each internal grade from6to12. Every new passage has six evidence-based questions (fact, main idea, vocabulary, reference, evidence and inference), giving216new questions. Every sentence includes an authored structural diagram, Korean translation, focused grammar explanation and contextual vocabulary.

Append only p4,p5,p6 to each existing unit1/unit2; do not replace the original p1,p2,p3. The existing parent scope identifiers remain valid. No permission changes, record migrations or new unit scope rules are needed. UI still presents level2/level3 and keeps internal grades behind the existing score-based progression.

## Authoring and integration

- EnglishReadingExpansion.js validates authored records, derives exact source sentences from explicit phrase boundaries, and atomically appends each bundle after checking all entries. This is not an English syntax parser: every phrase boundary and role is authored.
- EnglishReadingMiddleExpansion.js / EnglishReadingHighExpansion.js hold the independently written new material. New question IDs belong to new passage IDs.
- All seven reading consumers load the new bundles: reading page, English course, today, parent admin, mock exam, weekly assessment and weekly review.
- New modules are precached for offline use. Original content, source IDs and saved results are preserved.
- Grade-specific word lengths are editorial targets, not a standardized readability score or claim of official curriculum certification. Narratives and thought experiments are authored examples, not reports of real research.

## Verification

- Inventory, six question types, answer-position variation, evidence bounds, original-content immutability, real grammar links, source-aligned notes, exact old-scope continuity and idempotent loading.
- Mobile390 and desktop1440 browser checks across36new passages. Full-quiz answer/save/reload round trip uses an isolated local preview user with cloud synchronization disabled; no real learner data is modified.
- Re-run existing reading policy, reading app, course/progression and full repository tests before deployment.

Final local verification: 191 tests passed after adding reviewed-construction regression anchors; browser flow completed all36new passages and a10-question quiz including existing context-word variants, restoring the first answer after reload and retaining only one completed report after another reload. 306new sentence guides bring the total to836. Focused Astra review covered8difficult high-school passages; its corrections and final recheck are recorded in ADVANCED_ENGLISH_READING_REVIEW.md. Middle review/source references are in MIDDLE_READING_EXPANSION_REVIEW.md. Audit inventory grows by434entries (216authored questions plus218existing-generator context variants); every previous audit entry remains identical and new entries remain explicitly unreviewed in the formal audit ledger, rather than being automatically marked semantically certified.


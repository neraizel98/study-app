# English lesson guides

## Grammar
- GrammarVisualLessons.js explicitly maps all 92 current lessons to a concise rule, an ordered arrow diagram, and two authored register examples.
- [구어체] uses English contractions and colloquial Korean; [문어체] uses full English forms and written Korean. Examples have separate US speech controls.
- The diagram and register cards follow the app’s cream, white and forest-green palette, with rounded flow cards, concept-specific SVG drawings and parallel noun/pronoun mappings. Existing detailed explanations and practice remain in a disclosure; quiz IDs, timers and stored records remain compatible.

## Reading
- ReadingSentenceNotesPrimary.js and ReadingSentenceNotesSecondary.js contain authored notes for all 80 current passages / 530 sentences.
- Chunk boundaries and roles are editorial data, not a heuristic parser. The concatenated chunks must reproduce the exact source sentence. Changed sources do not silently receive outdated analysis.
- Each sentence provides ① structure, ② grammar, ③ contextual vocabulary and parts of speech, ④ the existing translation from the original data.
- Subject and verb have distinct colors; other components additionally use explicit role labels and line styles so the three-color palette remains accessible.
- Notes start closed; students can open one sentence or all sentences. A passage change closes the previous notes. The whole guide is inside studyPanel and is hidden during quizzes.
- Opening the guide records only an exposure preference, never a quiz submission, score, or completion. Existing two-line quick hints remain available separately.
- Missing analysis assets display a reload message rather than a guessed parse. The source passage and translations remain available.

## Verification
- grammar-visual.test.js: all 92 mappings, 184 examples, register/ending/construction anchors, escaping and speech markup.
- reading-sentence-guide.test.js: all 530 exact alignments, grammar and contextual vocabulary, original translations, source immutability, stale-data and HTML-injection handling.
- tests/english-guides-browser.cjs: Chrome 390x844 elementary/middle/high study pages, guide expansion, passage switch, quiz hiding and horizontal fit. Physical iPhone behavior is not claimed.

The reading guide uses rounded cream/green sentence cards, role-specific local SVG drawings, colored structure chips, separate grammar/vocabulary panels and an original-translation panel. On narrow screens the structure follows vertical arrows; all information remains inside the study-only disclosure.

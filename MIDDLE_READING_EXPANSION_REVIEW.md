# Middle reading expansion review — 2026-11-02

`EnglishReadingMiddleExpansion.js` adds 18 original passages to the existing middle1/2/3 units, using p4/p5/p6 without changing previous passage IDs or unit scopes. Each unit receives bands 0/1/2. The constructor’s authoring coordinates (unit3/4 and passage1/2/3) intentionally map to existing unit1/2 and new passage4/5/6.

## Counts and length

| ID | Title | Band | Sentences | Words |
| --- | --- | ---: | ---: | ---: |
| mr1-unit1-p4 | The Second Pass | 0 | 8 | 114 |
| mr1-unit1-p5 | Ears for the Desert | 1 | 8 | 112 |
| mr1-unit1-p6 | The Lantern Ticket | 2 | 8 | 127 |
| mr1-unit2-p4 | A Handle You Can Feel | 0 | 8 | 119 |
| mr1-unit2-p5 | The Missing Footsteps | 1 | 8 | 127 |
| mr1-unit2-p6 | The Moon Is Still There | 2 | 8 | 134 |
| mr2-unit1-p4 | Beyond the Goal Count | 0 | 8 | 173 |
| mr2-unit1-p5 | The Octopus That Was Still There | 1 | 8 | 170 |
| mr2-unit1-p6 | The Cup Turned Upside Down | 2 | 8 | 173 |
| mr2-unit2-p4 | The Suitcase on the Stairs | 0 | 8 | 179 |
| mr2-unit2-p5 | The Space Between Two Pictures | 1 | 8 | 180 |
| mr2-unit2-p6 | Salt You Cannot See | 2 | 8 | 180 |
| mr3-unit1-p4 | The Relay Split | 0 | 9 | 205 |
| mr3-unit1-p5 | The Glass That Seemed to Leak | 1 | 9 | 206 |
| mr3-unit1-p6 | The Replica Hall | 2 | 9 | 210 |
| mr3-unit2-p4 | The Oven Dial | 0 | 9 | 210 |
| mr3-unit2-p5 | The Rest in the Score | 1 | 9 | 208 |
| mr3-unit2-p6 | The Map with a Quiet Route | 2 | 9 | 209 |

Words are whitespace-separated tokens after removing role codes. Grade lengths are within the requested targets; readability is an editorial grade estimate, not a learner-study result.

## Authored learning content

- 108 questions: one fact, main, vocabulary, reference, evidence, and inference question per passage; four distinct choices, explicit answers, 0-based evidence indices, and Korean explanations.
- 150 sentence notes: every sentence has hand-written role chunks, Korean translation, a specific grammar explanation, and an exact contextual vocabulary entry with part of speech. No parser supplies the analysis.
- 150 passage vocabulary entries (8 or 9 per passage). Inflected forms that do not contain the lemma, such as priorities/priority, use the actual surface form in sentence notes.
- 36 grammar references checked against actual `EnglishGrammarData` plus `EnglishGrammarExpanded` stage/unit/lesson entries; each passage also exposes two relevant authored grammar notes.
- Answer positions across 108 questions: 24/27/28/29. Among 90 non-evidence questions, 18 correct answers tie for or have the most words; choosing the longest option is not a general answer pattern.
- Sports strategies, animal adaptations/camouflage, explicitly fictional travel customs and museum scenarios, everyday product design, radio drama/comic/music interpretation, and basic science comparisons broaden the topic mix.

## Factual source checks

These pages were read on 2026-11-02. All narratives, comparisons, questions, and explanations are original; the pages verify the limited background facts rather than supplying a passage to reproduce.

- [Smithsonian National Zoo: Fennec fox adaptations](https://www.nationalzoo.si.edu/animals/news/how-does-fennec-fox-survive-desert-and-other-questions-answered): ears help hear prey and dissipate heat; furry paws protect against heat; underground daytime rest avoids heat. The reading uses the conditional hot-desert setting rather than claiming all desert nights are hot.
- [San Diego Zoo: Fennec Fox](https://animals.sandiegozoo.org/animals/fennec-fox): independently checks daytime burrows and nocturnal activity.
- [Smithsonian Ocean: How Octopuses and Squids Change Color](https://ocean.si.edu/ocean-life/invertebrates/how-octopuses-and-squids-change-color): color/pattern change and skin-texture change. The reading explicitly rejects inferring perfect camouflage by all octopuses in all settings from one example.
- [NASA: Moonlight](https://science.nasa.gov/moon/moonlight/): moonlight is reflected sunlight; lunar phases concern the visible portion of the illuminated half. The model does not attribute ordinary phases to Earth’s shadow, and its title avoids implying the physical Moon is made of light.

Basic salt dissolution/evaporation and condensation are presented as original illustrative comparisons. Both state the limits of what their observations establish; they do not assert exact recovery, humidity, or that condensation disproves every possible crack. The condensation comparison uses a dry, sealed ice pack so it does not add loose liquid inside the glass.

## Verification and remaining scope

Node VM loaded the actual grammar and reading bundles, the shared expansion helper, and this file. Registration validates the existing unit titles/scopes, stable p4/p5/p6 IDs, all sentence vocabulary occurrences, role-code availability, question coverage/choices, and evidence ranges. Grammar references were checked separately. Reloading this file did not duplicate passages. No existing content was overwritten.

The content author did not change application code, permissions, deployment, or other agents’ content. Browser/device QA and deployment are integration-owner work. No claim of a classroom learning outcome is made.

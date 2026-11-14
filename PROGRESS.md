# OMR real photo recovery

Goal: prevent repeated upload loops for the supplied 2026-11-09 round1 OMR photograph.

Done:
- origin/main current at c6778d5 before changes; local user artifacts preserved.
- Reproduced no-card with original960x1280 image and correct1E1C code fixture.
- All4 fiducials found, but projective fit does not pass timing-mark verification (approx47% with approximate corner centers). Paper curvature/projection mismatch suspected; exact per-pixel cause not fully isolated.
- Added explicit manual photo transcription fallback for geometry/blur/unreadable failure. Printed round plus hash required. Wrong-card remains blocked; no guessed answers; all55 answers must be confirmed.
- Browser regression original photo:53choices and handwritten12/3,55attempts saved to mock DB, unpublished, no live user data touched.
- Unit13tests and reader16tests passed. Independent review corrected missing round check.

Remaining:
- Automatic geometric recognition still rejects this photo. Do not describe this as an automatic recognition fix.
- Not deployed. User approval required before merging per AGENTS.
- Remove PROGRESS.md before merge.

Cautions:
- Photo kept local, not checked in. Browser regression takes explicit local photo argument.
- Test fixture matches geometry/hash only; does not represent actual exam questions or determine real score.

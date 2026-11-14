# OMR photo recovery - 2026-11-14

## Cause and change
The supplied 960x1280 photo returned no-card although all four fiducials and its checksum-protected printed code were readable. Only15/36 edge timing marks met the rigid projective alignment. Nearby marks were displaced by less than2.5mm. No bubble coordinates, answer keys or exam content were changed.

The strict detector remains the first path. Only when it fails can a candidate with four verified fiducials, >=30% exact timing marks, an intact printed checksum, and >=90% nearby timing marks pass. Nearby search is bounded to x +/-1.5mm and y +/-2.5mm (less than half the tick pitch) and requires contrast against both neighbouring gaps. Weaker recovered marks (confidence <.85) require parent confirmation. Expected week/question hash and attempt matching still run afterward.

Unreadable geometry also offers manual transcription of the same photo after explicitly checking printed round and code. No answer is preselected in this fallback and every row must be resolved before saving. Wrong-card is not eligible for manual bypass.

## Validation
- Actual supplied photo: all53 choice numbers match independently transcribed photo marks. Eight are flagged for confirmation. Handwritten12/3 entered explicitly;55 attempts saved to a simulated server with publication withheld.
- Browser regression runs both automatic and forced-manual recovery on390px viewport. Photo remains local; only geometry/hash reconstructed, not the real exam content. No live learner record read or changed.
- Synthetic displaced-edge regression verifies recovery, other-attempt rejection, damaged-code rejection and no incorrect confidently accepted mark.
- Existing reader tests cover rotation, perspective, blur, shadows, clutter, low resolution, mono print and wrong-card rejection.

Run the supplied-photo regression with a local photo:
`node tests/paper-omr-recovery-browser.cjs <photo.jpg>`
`node tests/paper-omr-recovery-browser.cjs <photo.jpg> --manual`
Requires Playwright with the local Chrome channel. Handwriting remains parent-entered; this does not add OCR or guarantee arbitrary folded/cropped photos can be automatically read.

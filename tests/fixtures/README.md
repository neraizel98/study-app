# Real curved OMR regression fixture

omr-curved25.jpg is the supplied failure photo, re-encoded to strip image metadata. The name and candidate-number fields are blank. It tests photo geometry and mark transcription, not answer correctness or scoring.

omr-curved25-set.json contains synthetic question identities and generic choices only. Its round/week code is deliberately matched to the printed69A4 code so the full code check runs; no learner reports or actual question text are included.

The independently transcribed marks are in omr-real-photo.test.js. Crossed-out math23 and hanja20 stay ambiguous; math1/2 stay written-answer crops. Uncertain marks must never be counted as confirmed answers.

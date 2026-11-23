# Mock integrity repair
Goal: repair missing English reading scope; prevent inconsistent OMR scores; investigate real photo failure.
Completed: live read-only audit of Ujun week Nov16 attempt1. All100 saved answers regrade identically. Korean whole20/25 vs reading13/18. All11 recent English reading sessions flagged review; valid unassisted exposure reviews now establish exam scope only. Added grading copy validation and explicit Korean reading label.
Verified: mock25 integration8, paper OMR13, engine6. Live nonpersisted replay with qualifying review scope restores English7/6/12, full100, no shortages.
Remaining: full regression, independent diff review, PR; photo recognition still needs failing original photo. Actual differing scores awaiting user clarification. Do not modify learner records or regenerate saved exam.

Final verification: all110 root test files passed. Reviewer PASS after canonical section membership guard; independent27 scenarios passed. Actual OMR photo remains unavailable and incident score discrepancy not confirmed.
Self evaluation: accuracy4 (live evidence vs unconfirmed incident separated), completeness3 (real photo pending), clarity4 (explicit scope labels), actionability4 (reviewable branch), conciseness4. Mean3.8. Next: obtain failed photo and original differing scores; local browser QA and release remain pending.

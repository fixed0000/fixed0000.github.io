# Local regression checks

The repair was developed against portfolio commit `900bdf807efe96794f69eb628f4cbfc57f1060ee` and MoriGarden commit `ad4523d`.

Run `npm ci`, start `npm run serve` in another terminal, then run `npm test`. Set `CHROME_PATH` when Chromium is not at the platform default used by the browser tests. `node tests/repair-audit.cjs` additionally checks 44 mobile/tablet page layouts, every English prompt on a narrow viewport, reference-load failure, and external links.

`repair-baseline.cjs` is a historical reproducer for the original commit, **not a passing test of the repaired code**. Its JSON and screenshots are in `artifacts/repair/baseline.json`, `before-review.png`, and `before-undo.png`.

`repair-core.test.mjs` covers immutable review, explicit retry, result upserts, restoration, recognition/order independence, and negative inputs. `repair-browser.cjs` exercises real browser mouse events for 思/同 in both languages, delayed workers, duplicate clicks, retry, exit, reload, native CDP touch cancellation and pen events. CDP device emulation is not physical iOS or stylus validation.

`fixtures/repair-handwriting.json` contains manually authored trajectories, independent of the sampled KanjiVG template. They are automated pointer fixtures, **not a corpus collected from human writers**. Canonical template perturbations are separate tests. The original user's rejected 思 trajectory was not available, so these passing fixtures do not prove that particular failure is resolved.

Recognition thresholds are unchanged (`.105` shape cost, `.012` margin). Known limitations remain: joined/split strokes do not share the template's segmentation; a broad 口 can resemble 囗; 国's small dot may make direction indeterminate. Do not convert those cases into an expected-answer override. Stroke-order comparisons are experimental, not official Kanken grading.

Prompt source is `assets/kanji/prompt-selections.tsv`. Rebuild/audit with `python -X utf8 tools/data/audit-prompts.py <pinned-upstream-kanji.json> <official-kanken.pdf>`; PyMuPDF is required. See `DATA-SOURCES.txt` for URLs and the pinned metadata revision. All dictionary records are retained; unreviewed entries are excluded from exercises, including custom sets. Original history without task IDs remains attempt history; its task boundaries cannot safely be reconstructed.

The gallery capture instrumentation is separate from the game's production code. Create a detached MoriGarden worktree, run `python tools/prepare-gallery-capture.py <worktree>`, build it with .NET, import using Godot 4.5.1 .NET, then run with `--fixed-fps 60`, with a second run adding `-- --safe-gallery`. The capture project uses a separate application name/save directory. The safe run hides character render models; game simulation, UI, and environments are real. Do not publish the original character captures without resolving the rights question. The game's existing smoke test failed in `CheckIslandAndGlide` before its own screenshots; the capture runner does not turn that failure into a pass.

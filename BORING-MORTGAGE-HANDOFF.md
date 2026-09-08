# Boring Mortgage — Claude Code handoff

Updated September 7, 2026. This supersedes the earlier desktop handoff.

## Start here

Continue the existing Boring Mortgage website for Erik Miller / Patriot Home Mortgage. Preserve the navy/scarlet visual identity, exaggerated disaster illustrations, and deadpan humor. The premise is “exciting homes, uneventful financing.” Finish browser testing and remaining launch work from the existing implementation rather than rebuilding from scratch.

The latest task was to push all work to Git and prepare this handoff. It did not authorize a new public-domain cutover. Verify current hosting and domain state before proposing a launch.

## Open in Claude Code

On Erik’s current Mac, open this existing Git checkout:

```sh
cd /Users/emiller/Documents/Codex/2026-09-06/this-part-of-the-website-needs/work/boring-mortgage
claude
```

Then ask Claude: “Read BORING-MORTGAGE-HANDOFF.md, inspect the existing source, run the checks, and finish browser QA and remaining website work. Preserve the current design and humor. Check available account access before asking me for setup. Never ask me to paste secrets. Report specific launch blockers.”

A portable source ZIP is supplied alongside the downloadable handoff. It includes every tracked source file and asset, including `.openai/hosting.json`, but no credentials or `.git` directory. Extract it if using another computer. A Git bundle is also supplied to preserve the complete committed history; restore it with `git clone boring-mortgage.bundle boring-mortgage`. That clone’s origin is the local bundle, so configure an authenticated writable remote before future pushes.

## Repository and publication

- Existing Git origin: https://git.chatgpt-team.site/6edf54e4-cd41-409e-9310-24a1878ba3f5/appgprj_6a9c7147b5548191b92ebcb0c894926d.git
- Branch: `main`.
- This is the Sites-managed Git repository, not a GitHub repository. A September 7 search under ThunderbirdAgency found no matching “boring” repository. An exact separate GitHub destination remains unverified. Do not invent one or claim GitHub synchronization.
- Current private publication: https://boring-mortgage.thunderbird-8781.chatgpt.site/#check-in
- Sites project: `appgprj_6a9c7147b5548191b92ebcb0c894926d`.
- Latest published version: 4. Implementation commit: `75182b518cca6f032b9378eafbfd2b43901b15dd`.
- This handoff and retained test script are a later documentation commit; there is no new website deployment for the handoff.
- Sites Git authentication uses short-lived, repository-scoped credentials obtained through the Sites connector. They are deliberately not stored here. Claude Code does not automatically inherit Codex connectors or authentication. The local checkout, source ZIP, and Git bundle let you work without those credentials.
- Public BoringMortgage.com was not changed by this task or the prior check-in revision. Its current external configuration has not been audited in this handoff task.

## Run locally

This is plain static HTML/CSS/JavaScript. There is no package.json, package install, framework, database, or build command. `dist/` is the editable source and publish directory, not disposable generated output.

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:8765/#check-in in a browser. Use an HTTP server because links and asset paths are root-relative; do not open the HTML through file://.

With Node.js available:

```sh
node --check dist/motion.js
node scripts/check-flow.cjs
git diff --check
```

The check-flow script uses a lightweight mocked DOM. It covers all 27 goal/timing/concern combinations, missing answers, Back, preserved selections, route results, and changing answers. It does not verify real browser validation bubbles, rendered layout, focus behavior, or accessibility.

## Latest change: compact check-in

The old section displayed all questions in a long white form beside a mostly empty navy column. Version 4 replaces this with one question at a time, a progress indicator, explicit Continue/Back controls, and a final “Show my next step” action. Choices remain selected when revisiting a step or editing the result. The heading is “Let’s make this less exciting.” Supporting copy says “Three quick questions. One clear next step. No email ambush. No commitment.”

- Goals: buy a home, review current mortgage, double-check an offer.
- Timing: soon, a few months, just looking.
- Concerns: monthly payment, cash required, unexplained details.
- Each result combines goal-specific copy and route, timing guidance, and a suggested question for Erik.
- Answers live only in the page; there is no network submission or persistence.
- Radio inputs retain native required validation, with step navigation and focus handling in JavaScript.
- JavaScript-disabled visitors see a contact fallback.
- Mobile styles stack the intro above the panel. Real browser/mobile verification remains outstanding.

## Files and routes

| File | Purpose |
| --- | --- |
| `dist/index.html` | Homepage, disaster showcase, check-in, programs, testimonials, FAQ, disclosures |
| `dist/style.css` | Shared CSS and campaign layers; compact check-in block near the end |
| `dist/motion.js` | Disaster showcase controller, then check-in controller |
| `dist/assets/` | All images, original assets, and retained unused grass video |
| `dist/buy/index.html` | Buying page |
| `dist/refinance/index.html` | Mortgage review/refinance page |
| `dist/double_checker/index.html` | Second-opinion page |
| `dist/schedule-a-call/index.html` | Contact actions; no active booking calendar |
| `dist/privacy/index.html` | Site privacy information |
| `dist/404.html` | Not-found page |
| `dist/_headers` | Intended static-host security headers; verify host support |
| `dist/robots.txt` | Preview indexing exclusion: Disallow: / |
| `.openai/hosting.json` | Existing Sites identity and static directory |
| `scripts/check-flow.cjs` | Repeatable check-in logic regression checks |
| `ASSET-SOURCES.md` | Asset provenance |

Much of the original HTML/CSS/JavaScript is compressed into long lines. Reformat carefully before larger edits if helpful; preserve behavior and verify the result. Do not delete `dist/` or run a scaffold over this project.

## Existing experience to preserve

Three selectable pulp-style disaster illustrations: tiger, meteor, and cyclist losing the front wheel. The showcase has pause/play, arrow keys, crossfades, image motion, reduced-motion handling, and pausing when offscreen or in a background tab. Original yawning collage and four customer testimonial excerpts remain. Loan program information includes conventional, FHA, VA, USDA, jumbo, and refinancing. There are no invented star ratings, guaranteed savings, or guaranteed approvals.

Phone/email and Patriot’s secure application are the current conversion paths. No CRM, lead database, document upload, analytics integration, or functioning booking calendar is configured. Do not imply these are operational or add sensitive document collection to this static marketing site.

## Next work, in order

1. Serve locally and run browser QA at 390, 768, and 1440 pixels, plus narrow screens and 200% text enlargement. Check overflow, full choice labels, button visibility, and the result panel. Use keyboard-only navigation and confirm focus remains understandable after step/result changes.
2. Exercise all showcase controls, pause/play, reduced motion, background/offscreen behavior, and touch use. Check check-in validation, Back, changing answers, Enter submission, and appropriate result destinations in a real browser. The mock checks are not end-to-end browser evidence.
3. Review every route, image, anchor, phone link, email link, and external application destination. Verify actual application routing with Patriot without submitting fake borrower applications or private financial information.
4. Resolve any visible issues while retaining the current campaign identity. The latest headline/layout has not received explicit visual approval from Erik.
5. Identify the exact intended GitHub repository if a transfer is still wanted. Preserve existing history and destination content; never force-push over unrelated work. The current Sites origin can remain as a separate remote.
6. Inspect current hosting/DNS for BoringMortgage.com and prepare a concrete launch and rollback plan. Recheck SSL, apex/www behavior, old URL redirects, 404 handling, and security headers on the chosen host. This static site can be served by a static host using `dist/`; no framework migration is required.
7. Before public indexing, add final production canonical URLs and sitemap, then remove the preview robots exclusion at the appropriate launch point. Confirm current lender identity, licensing and advertising disclosures with Patriot. Do not treat this historical document as fresh legal verification.
8. Confirm whether contact links alone satisfy the requested launch or whether an approved calendar/CRM workflow is needed. Implement additional integrations only within the user’s confirmed scope. Launch completion means verified customer paths and domain behavior, not just a successful upload.

## Contact and lender details already in source

These are carried forward from the previous implementation; verify before public launch:

- Erik Miller, NMLS #263103; 623-696-8683; erik.miller@patriothomemortgage.com.
- Belem Servicing LLC, dba Patriot Home Mortgage; company NMLS #715386.
- 17505 N 79th Ave, Ste 312, Glendale, AZ 85308.
- Profile: https://patriothomemortgage.com/mortgage-officer/erik-miller/
- Secure application: https://myloan.patriothomemortgage.com/homehub/signup/erik.miller@patriothomemortgage.com
- Programs: https://patriothomemortgage.com/loan-options/

## Publishing through Sites, if available in the next environment

Preserve `.openai/hosting.json` and the existing project ID. Use a fresh Sites source credential through secure per-command authentication, never a token in a remote URL or committed file. Push exact source, package the static `dist/` output with hosting metadata, save a Sites version tied to the full pushed commit SHA, deploy to the authorized audience, and wait for terminal success. A Git push alone does not update the published website. Claude Code may need an explicitly configured Sites connector or an alternative authorized host.

## Completion evidence so far

The September 6 revision passed JavaScript syntax, whitespace checks, and 27 mocked check-in combinations. Its Sites deployment succeeded as version 4. No visual browser QA was performed. On September 7 the local implementation matched the fetched Sites main branch before adding this handoff. This task packages and pushes source/documentation; it does not mark the public launch complete.

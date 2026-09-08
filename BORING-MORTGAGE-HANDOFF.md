# Boring Mortgage — Claude Code handoff

Updated September 8, 2026. This supersedes the September 7 handoff. See “September 8 status” first.

## Start here

Continue the existing Boring Mortgage website for Erik Miller / Patriot Home Mortgage. Preserve the navy/scarlet visual identity, exaggerated disaster illustrations, and deadpan humor. The premise is “exciting homes, uneventful financing.” Finish browser testing and remaining launch work from the existing implementation rather than rebuilding from scratch.

The latest task was to push all work to Git and prepare this handoff. It did not authorize a new public-domain cutover. Verify current hosting and domain state before proposing a launch.

## September 8 status: browser QA done, launch prep in place, no cutover

Work continued in Claude Code on the web from the Git bundle. Every item below was verified in headless Chromium (Playwright 1.56) against a local `python3 -m http.server` serving `dist/`. Screenshots and the findings log are produced by `scripts/browser-qa.js` into `qa-output/` (ignored by Git).

### GitHub destination, resolved

- GitHub repository: https://github.com/ThunderbirdAgency/Boring-Mortgage (organization ThunderbirdAgency). It was empty before this session.
- The full bundle history (`6cca47d` … `84c51d5`) was restored unchanged and pushed to branch `claude/boring-mortgage-handoff-46ejl5`, with this session’s commit on top. The source ZIP and the bundle were diffed against each other and matched exactly.
- The Sites origin listed above is untouched and was not pushed to. `.openai/hosting.json` is preserved.

### Browser QA results (September 8)

Viewports 320, 390, 768, 1440, and 1920 px, plus a 720 px viewport as the 200% browser-zoom proxy and a 200% root font-size pass. All seven pages.

- No horizontal overflow on any page at any width. No console errors, failed requests, or 4xx responses.
- Check-in: native “Please select one of these options” bubble appears on empty submit and the step does not advance. Enter on a radio submits the step. Back keeps the selection. Tab order goes legend → radios → Continue. Arrow keys change the radio. Result panel shows the right copy and routes to `/buy/`, `/refinance/`, or `/double_checker/`; following the link loads the page. “Change my answers” returns to question 1 with all three answers still selected. Focus lands on the legend after each step change and on the result panel after submit; the result panel is inside the viewport at 390 and 1440.
- Showcase: dots switch scenes and set `aria-pressed`/`aria-hidden`; picking a scene pauses; Play resumes and auto-advances after 6.5 s; ArrowLeft/ArrowRight work with focus inside the showcase; Space toggles the pause button; scrolling the showcase offscreen pauses the image drift and scrolling back resumes it; a hidden tab pauses and a visible tab resumes; `prefers-reduced-motion: reduce` stops the drift and sets the button to Play. Touch taps on the dots and the check-in radios work in mobile emulation.
- Keyboard: skip link becomes visible at the top on focus. Tab order is skip → brand → nav → hero buttons → showcase controls → check-in.
- 200% text-only enlargement scales the check-in panel (rem units) but not the rest of the site, which uses px sizes. Browser zoom (the common mechanism) reflows correctly at the 720 px proxy. Not changed; noted for a future pass if text-only scaling matters.
- Under 900 px the nav collapses to the brand and “Talk to Erik” only; there is no menu button. Section anchors remain reachable by scrolling. Unchanged design decision, flagged for Erik.
- Inline text links (footer legal links, “Meet Erik at Patriot” style links) are 14–22 px tall. Inline links are exempt from the 24 px target-size criterion; not changed.

### Link and route audit

- All internal routes, anchors (`/#approach`, `/#options`, `/#reviews`, `#check-in`, `#main`), phone links, and email links resolve. Every image loads (lazy images verified after scrolling).
- External destinations return 200 with a browser user agent: Erik’s Patriot profile, Patriot loan options, the HomeHub secure application signup URL, Patriot privacy policy, Patriot licensing, CFPB owning-a-home, boringmortgage.com. NMLS Consumer Access returns 403 to non-browser clients (bot protection); it is a valid URL. No application was started or submitted.

### Changes made September 8

- **Image weight (was a launch blocker).** Homepage transferred 10.6 MB before scrolling at 390 px and 26 MB after a full scroll. It now transfers 494 KB and 626 KB respectively. Each illustration is served as WebP with JPEG fallback through `<picture>` and `srcset`: hero scenes at 900 and 1536 px wide, loan illustrations at 560 px, the yawning collage at 1000 and 1800 px, Erik’s byline portrait at 160 px. Variants were encoded with Chromium’s canvas encoder (WebP quality 0.80, JPEG 0.82) by `scripts/optimize-images.js`. Visual output matches the previous layout pixel-for-pixel in page dimensions at 390 and 1440. The full-resolution originals moved from `dist/assets/` to `source-assets/` so they stay tracked but are no longer published. `picture{display:contents}source{display:none}` keeps every existing image selector and grid placement working.
- Removed the dead `.cinema`/`.film-caption` CSS from the retired video hero (no element used it); `calm-home.mp4` and `calm-poster.jpg` now live in `source-assets/`.
- Unique `<title>` and meta description on every page (they were identical everywhere). 404 page carries `noindex`.
- Canonical URLs on `https://boringmortgage.com/…`, Open Graph and Twitter card tags (image: tiger scene JPEG), `theme-color`, and an SVG favicon (`/favicon.svg`) that stops the previous 404 for `/favicon.ico` on every page load.
- `dist/sitemap.xml` for the six public routes. `dist/robots.txt` still blocks all crawling; it now carries a comment with the exact lines to switch at launch.
- `dist/_redirects` (Netlify / Cloudflare Pages format) and `vercel.json` (Vercel) map the live site’s old URLs to the new routes and, on Vercel, apply the same security headers as `dist/_headers` plus HSTS and long-lived asset caching. Neither is active on the Sites preview host.
- `scripts/browser-qa.js` (repeatable Playwright QA) and `scripts/optimize-images.js` retained.
- Copy, headline, layout, colors, illustrations, and humor are unchanged. Erik has still not given explicit visual approval of the current headline/layout.

### Hosting and DNS findings (read-only audit, nothing changed)

- `boringmortgage.com` resolves to a Cloudflare address (162.159.140.166) and `www.boringmortgage.com` is a CNAME to `sites.ludicrous.cloud`, which is the LeadConnector / GoHighLevel website host. The live HTML is a GoHighLevel funnel page (title “BoringMortgage.com”, `leadconnectorhq.com` and `filesafe.space` assets). This is the old site, not this repository.
- Behavior today: HTTP → HTTPS 301, `www` → apex 301, valid TLS, apex is the canonical host. No security headers are sent. `/sitemap.xml` returns 200 but empty; `/robots.txt` is empty.
- Old URLs that return 200 on the live site and need redirects at cutover: `/home-7750`, `/conventional-loan`, `/fha-loans`, `/va-loans`, `/double_checker`, `/schedule-a-call`. (`/home`, `/buy`, `/refinance` already 404 there.) The redirect files above cover these.
- The Sites preview host (`boring-mortgage.thunderbird-8781.chatgpt.site`) serves `dist/_headers` as a plain file and applies none of the headers in it; it does serve `dist/404.html` for unknown paths, and it injects a Cloudflare challenge script into the HTML. It is not a suitable public host for the domain.
- Account access found in this environment: a Vercel team “Thunderbird Agency” (Pro plan) where the other Thunderbird sites are GitHub-linked projects, and a Cloudflare account with Workers. No Vercel or Cloudflare project exists for Boring Mortgage yet, and no DNS tooling for the `boringmortgage.com` zone is available here, so who controls that zone (Erik’s Cloudflare account or GoHighLevel’s) is unverified.

### Vercel project (created September 8, on Erik’s approval)

- Project `boring-mortgage` in the Thunderbird Agency team, linked to the GitHub repository. Project id `prj_BeCo7CevM0zpmx6UvV6x3ccZ0Kst`. Production branch is currently `claude/boring-mortgage-handoff-46ejl5` (the only branch); every push to it redeploys production automatically. Change the production branch in Settings → Git if `main` is created later.
- Production URL: https://boring-mortgage-thunderbird-agency.vercel.app (also `boring-mortgage.vercel.app`). The team default keeps Vercel Authentication on for `*.vercel.app` URLs, so they ask for a Vercel login; the custom domain will be public. A temporary share link valid until September 9, 2026 was given to Erik for phone review.
- Verified on the deployment: all six routes 200, unique titles, `sitemap.xml`, `robots.txt`, `favicon.svg`, WebP assets with one-year immutable caching, all five security headers from `vercel.json` plus HSTS, and the branded 404 page with a real 404 status. The old-URL redirects are matched with and without a trailing slash because Vercel’s trailing-slash normalization runs before redirects.
- No domain is attached yet. Adding `boringmortgage.com` and `www.boringmortgage.com` in Settings → Domains, then changing the GoDaddy records to the values Vercel shows (normally A `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com`), completes the cutover. Rollback is restoring A `@` → `162.159.140.166` and CNAME `www` → `sites.ludicrous.cloud`.
- Registrar and DNS host for boringmortgage.com: GoDaddy (nameservers `ns03/ns04.domaincontrol.com`). Nothing here has access to it.

### Launch blockers, in order

1. **Host: done.** Vercel project created and verified (see above). Remaining host step: add the two domains in Vercel’s Domains settings.
2. **DNS change at GoDaddy.** Erik (or whoever holds the GoDaddy login) changes the apex A record and the `www` CNAME to Vercel’s values. Until then the old GoHighLevel site keeps showing.
3. **Robots and indexing.** After the host is verified on a preview URL, swap the `robots.txt` lines noted in the file and confirm `sitemap.xml` and canonicals resolve on the production domain.
4. **Compliance confirmation with Patriot.** Lender identity, NMLS numbers, address, Equal Housing Lender language, and testimonial use in the footer and reviews section must be re-confirmed by Patriot before public launch. This repository carries them forward from the prior site and does not verify them.
5. **Erik’s visual sign-off** on the current headline and layout (unchanged since version 4).
6. **Scope confirmation** that phone, email, and the Patriot secure application are sufficient conversion paths at launch. The old site links a `meetmequickly.com/hlt` booking page; this site has no booking calendar and no CRM by design.

### Launch and rollback plan (proposed, not executed)

1. Create the host project from the GitHub repository, branch `main` after this branch is merged; verify on the host’s preview URL: all six routes, `/404` handling, security headers present, redirects from the six old URLs, `/favicon.svg`, `/sitemap.xml`.
2. Add `boringmortgage.com` and `www.boringmortgage.com` to the host; keep `www` → apex.
3. Lower DNS TTL on the current records if it is high; note the current values (apex A 162.159.140.166, `www` CNAME `sites.ludicrous.cloud`) for rollback.
4. Flip `robots.txt` to allow crawling with the sitemap line, commit, deploy.
5. Switch DNS to the host’s records. Verify TLS issuance, HTTP → HTTPS, `www` → apex, old-URL redirects, and the phone, email, and application links on the live domain from a phone.
6. Rollback: restore the two DNS records noted in step 3; the GoHighLevel site remains published there and needs no rebuild. Keep the GoHighLevel site untouched until at least one week after cutover.

### Commands

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist   # serve
node --check dist/motion.js && node scripts/check-flow.cjs && git diff --check
NODE_PATH=$(npm root -g) node scripts/browser-qa.js               # full browser QA → qa-output/
```

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
| `dist/assets/` | Published images only: WebP + JPEG/PNG variants and `patriot.svg` |
| `source-assets/` | Full-resolution originals and the retired hero video; tracked, not published |
| `dist/favicon.svg`, `dist/sitemap.xml`, `dist/_redirects`, `vercel.json` | Added September 8; see status section |
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
| `scripts/browser-qa.js` | Playwright browser QA: viewports, overflow, check-in flow, showcase, keyboard, touch, links |
| `scripts/optimize-images.js` | Regenerates the optimized image variants from `source-assets/` |
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

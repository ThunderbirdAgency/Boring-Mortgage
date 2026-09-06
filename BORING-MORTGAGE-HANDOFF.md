# Boring Mortgage — desktop handoff

Updated September 6, 2026. This file describes the playful interactive revision after version 2.

## Resume instruction

Continue the existing Boring Mortgage project. Preserve the Patriot Home Mortgage identity and the user's intentionally exaggerated, deadpan humor. The concept is that exciting can be terrible: a tiger fight, an approaching meteor, or a bicycle losing its front wheel. Finish browser QA and the public-domain launch; do not rebuild from scratch or generate more assets without a concrete need.

## Project and saved source

- Private preview: https://boring-mortgage.thunderbird-8781.chatgpt.site
- Existing Sites project ID: `appgprj_6a9c7147b5548191b92ebcb0c894926d`
- Local checkout if still present: `/workspace/sites/boring-mortgage`
- Git source: `https://git.chatgpt-team.site/6edf54e4-cd41-409e-9310-24a1878ba3f5/appgprj_6a9c7147b5548191b92ebcb0c894926d.git`
- Branch: `main`. This is the Sites-backed Git repository, NOT a verified user GitHub repository.
- GitHub search for `boring` returned no accessible matching repository. Obtain the exact GitHub owner/repository URL before transferring. Do not invent a repo or claim GitHub is synced.
- If local checkout is gone: use Sites get_site and create_source_repository_write_credential for the exact project above, then clone the returned URL and branch with per-command authentication. Never create a replacement Site or save a token to files.

## Stack

Portable static HTML/CSS/JavaScript; serve `dist`. No dependencies or build step. `.openai/hosting.json` contains the identity and `static.directory=dist`. Hosting package helper handles archives. Read Sites skills before lifecycle actions.

## What is implemented

- Interactive bad-excitement hero: three custom pulp-style illustrations (tiger, meteor, detached bicycle wheel). Clickable scene selectors, crossfades, gentle image motion, pause/play, arrow-key controls, reduced-motion support, offscreen and background-tab pausing.
- Original grass video is retained as an unused asset, no longer the hero.
- Three-question mortgage check-in (goal, timing, concern), native required choices, tailored result, a practical question to ask Erik, appropriate route CTA, and change-answer control. No personal data collection, no network submission or persistence.
- Humorous campaign copy across homepage and buying/refinance/second-opinion/contact pages.
- Original yawning collage restored.
- Four original customer testimonial excerpts retained without invented stars, counts, or guarantees.
- Conventional, FHA, VA, USDA, jumbo, refinance information and Patriot links retained.
- Phone, email, and secure application actions work as links. There is no fake submission-success form or backend lead database.

## Important files

- `dist/index.html`: homepage, review excerpts, loan programs, check-in markup.
- `dist/style.css`: original styles plus campaign revisions; consider careful consolidation after visual approval.
- `dist/motion.js`: showcase and check-in interactions.
- `dist/assets/exciting-{tiger,meteor,bicycle}.png`: new generated illustrations, 1536x1024.
- `dist/assets/yawning-original.jpg`: original collage.
- Routes: `/buy/`, `/refinance/`, `/double_checker/`, `/schedule-a-call/`, `/privacy/`.
- `ASSET-SOURCES.md`: asset provenance and initial video details.

## Patriot details

Erik Miller, NMLS 263103. Phone 623-696-8683. Email erik.miller@patriothomemortgage.com.
Company: Belem Servicing LLC, dba Patriot Home Mortgage; company NMLS 715386.
Verified reference: https://patriothomemortgage.com/mortgage-officer/erik-miller/
Application: https://myloan.patriothomemortgage.com/homehub/signup/erik.miller@patriothomemortgage.com
Program reference: https://patriothomemortgage.com/loan-options/
Keep the lender's required disclosures. No promises of guaranteed approval, savings, or absolutely surprise-free closings.

## Validation and remaining launch work

- JavaScript syntax and local links/assets checked. Art inspected.
- Browser end-to-end and mobile visual QA NOT performed. Verify all three scene choices, pause/play, reduced motion, keyboard operation, required fields, result combinations, edit answers, layout at 390/768/1440px, and external CTA destinations.
- Existing public BoringMortgage.com was not changed. Domain hosting/DNS and intended GitHub repo remain unconnected.
- User has requested launch. Private preview can be published from this chat; a public custom-domain cutover still needs verified destination/hosting access.
- Before public indexing: remove `Disallow: /` from robots.txt, add actual production canonical URLs and sitemap, check route redirects from old URLs, verify security headers on final host, and confirm Patriot advertising disclosures.
- Lead tracking, CRM routing, calendar booking, and document upload are NOT configured. Phone/email and official Patriot secure application are the current conversion path. Do not add sensitive document collection to this static site.
- A previous booking calendar was broken. Contact actions replace it until an approved working scheduling link is available.

## Asset generation notes

Three new built-in image generations: premium retro pulp editorial paintings, rich navy/scarlet/golden light, exaggerated comic peril, no text, no gore. Subjects: office worker confronting tiger; meteor approaching Earth; helmeted cyclist with detached front wheel. No new video generation for this revision.

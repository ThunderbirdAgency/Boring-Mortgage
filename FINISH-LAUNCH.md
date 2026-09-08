# Boring Mortgage — finish the launch

Written September 8, 2026, from the Claude Code web session that built and QA'd the current site.
Read this first. It is the only document you need to finish the project.

---

## Status: LIVE as of September 8, 2026, 19:30 UTC

The site is published at **https://www.boringmortgage.com** and open to search engines.

What was done to finish it:

- Erik added both domains in the Vercel dashboard. The certificate issued and the site came up.
- Vercel is configured with **www as the primary host**: `boringmortgage.com` 308-redirects to
  `www.boringmortgage.com`, and `http://` redirects to `https://`. Canonical tags, Open Graph URLs,
  and `sitemap.xml` were changed from the apex to `www` so every signal points at the host that
  actually serves. If you prefer the bare apex, set it as the primary domain in Vercel and change
  those URLs back in the same commit; do not leave the two disagreeing.
- `dist/robots.txt` switched from a blanket `Disallow: /` to `Allow: /` plus the sitemap line.

Verified on the live domain:

| Check | Result |
| --- | --- |
| Six public routes | 200, correct content types |
| Served HTML vs repo `dist/` | byte-identical on all six pages |
| `sitemap.xml`, `robots.txt`, `favicon.svg` | 200, correct types, robots allows crawling |
| Old GoHighLevel URLs `/home`, `/home-7750` | land on the homepage |
| Old `/conventional-loan`, `/fha-loans`, `/va-loans` | land on the loan options section |
| Unknown path | real 404 status, branded "A small detour." page |
| Security headers | HSTS, nosniff, DENY, referrer policy, permissions policy all present |
| Asset caching | one year immutable on `/assets/`, revalidate on HTML |
| Full browser suite on the committed build | zero findings |

The browser suite could not be pointed at the live domain from the sandboxed session, because the
agent proxy drops Chromium's tunnel. That is a sandbox limitation, not a site problem: curl reaches
the site fine, and the served HTML is byte-identical to the build that passed the suite. From a
normal machine you can run it directly:

```sh
QA_BASE=https://www.boringmortgage.com NODE_PATH=$(npm root -g) node scripts/browser-qa.js
```

### What is left

Nothing blocking. These are open questions for Erik and Patriot, not code:

1. **Patriot compliance sign-off** on the footer identity and the testimonials. See below.
2. **Erik's visual approval** of the headline and layout.
3. **The GoHighLevel question**, still unanswered. See below.
4. Optional: submit the sitemap in Google Search Console now that crawling is allowed.

---

## What already exists

### The site

Plain static HTML, CSS, and JavaScript. No framework, no build step, no package.json, no database.
`dist/` is both the editable source and the publish directory. Do not scaffold over it, do not
"modernize" it, do not delete it.

Campaign identity to preserve: navy `#13243b` and scarlet `#b11d1d`, Georgia serif headlines,
three pulp-style disaster illustrations (tiger, meteor, cyclist), deadpan humor. The premise is
"exciting homes, uneventful financing."

| Path | Purpose |
| --- | --- |
| `dist/index.html` | Homepage: disaster showcase, check-in, programs, testimonials, FAQ, disclosures |
| `dist/style.css` | All CSS, appended in campaign layers; compact check-in block near the end |
| `dist/motion.js` | Two IIFEs: disaster showcase controller, then check-in controller |
| `dist/buy/`, `dist/refinance/`, `dist/double_checker/` | Three intent pages |
| `dist/schedule-a-call/`, `dist/privacy/`, `dist/404.html` | Contact, privacy, not-found |
| `dist/assets/` | Published images only: WebP plus JPEG/PNG fallbacks, and `patriot.svg` |
| `source-assets/` | Full-resolution originals and retired hero video. Tracked, never published |
| `dist/_headers`, `dist/_redirects` | Netlify / Cloudflare Pages config. Inert on Vercel |
| `vercel.json` | Live config on Vercel: output dir, headers, redirects, trailing slash |
| `dist/robots.txt` | Allows crawling, references the sitemap |
| `dist/sitemap.xml` | Six public routes, absolute URLs on www.boringmortgage.com |
| `scripts/check-flow.cjs` | Mocked-DOM regression test, 27 answer combinations |
| `scripts/browser-qa.js` | Playwright QA: viewports, overflow, flow, showcase, keyboard, touch, links |
| `scripts/optimize-images.js` | Regenerates `dist/assets/` variants from `source-assets/` |
| `BORING-MORTGAGE-HANDOFF.md` | Full history and QA evidence. Background reading |

Much of the HTML and CSS is minified onto very long lines. That is how it was authored. Reformat
carefully if you need to, and verify behavior afterward.

### Hosting

- **GitHub:** https://github.com/ThunderbirdAgency/Boring-Mortgage
- **Branch:** `claude/boring-mortgage-handoff-46ejl5` — this is the only branch and it is the
  Vercel production branch. There is no `main`.
- **Vercel project:** `boring-mortgage`, team Thunderbird Agency, id
  `prj_BeCo7CevM0zpmx6UvV6x3ccZ0Kst`. Output directory `dist`, no build command.
  Every push to the branch above redeploys production automatically.
- **Working deployment URL:** https://boring-mortgage-thunderbird-agency.vercel.app — this asks
  for a Vercel login because the team default protects `*.vercel.app` URLs. The custom domain will
  be public once attached.
- **Registrar and DNS:** GoDaddy. Nameservers `ns03/ns04.domaincontrol.com`.
- **Old site:** GoHighLevel / LeadConnector funnel, still live in that account.

### What was already verified in a real browser

Headless Chromium at 320, 390, 768, 1440, and 1920 px, plus a 720 px zoom proxy and a 200% root
font-size pass, on all seven pages:

- No horizontal overflow anywhere. No console errors, failed requests, or 4xx responses.
- Check-in: validation bubble on empty submit, Enter submits a step, Back preserves the selection,
  focus moves to the legend on each step and to the result panel on submit, all three destinations
  route correctly, "Change my answers" keeps all three answers.
- Showcase: dots, pause and play, arrow keys, auto-advance at 6.5 s, pauses offscreen and in a
  hidden tab, respects `prefers-reduced-motion`, works under touch emulation.
- Every internal route, anchor, image, phone link, and email link resolves. All external Patriot
  and CFPB destinations return 200. No application was ever submitted.
- Homepage weight was cut from 10.6 MB to 494 KB on first load at 390 px.

Do not redo this from scratch. Re-run `scripts/browser-qa.js` only after you change something.

---

## Your job, in order

### 1. Confirm the site is still healthy

Done on September 8, but re-check after any change:

```sh
curl -sS -o /dev/null -D - https://www.boringmortgage.com/ | head -20
curl -sS https://www.boringmortgage.com/ | grep -o '<title>[^<]*</title>'
```

You want a 200, an `x-vercel-id` header, and the title
`Boring Mortgage | Exciting home. Boring mortgage. Erik Miller, Patriot Home Mortgage`.

### 2. Verify the live domain end to end

```sh
# every route
for p in / /buy/ /refinance/ /double_checker/ /schedule-a-call/ /privacy/ /sitemap.xml /robots.txt; do
  printf '%-22s ' "$p"; curl -sS -o /dev/null -w '%{http_code}\n' "https://www.boringmortgage.com$p"
done

# www to apex, http to https
curl -sS -o /dev/null -D - https://boringmortgage.com/     | grep -i '^location'   # apex -> www
curl -sS -o /dev/null -D - http://www.boringmortgage.com/ | grep -i '^location'   # http -> https

# old GoHighLevel URLs must land on the new site
for p in /home /home-7750 /conventional-loan /fha-loans /va-loans; do
  printf '%-20s ' "$p"; curl -sS -L -o /dev/null -w '%{url_effective}\n' "https://www.boringmortgage.com$p"
done

# security headers
curl -sS -o /dev/null -D - https://www.boringmortgage.com/ | grep -iE 'strict-transport|x-content-type|x-frame|referrer|permissions'

# branded 404 with a real 404 status
curl -sS -o /dev/null -w '%{http_code}\n' https://www.boringmortgage.com/definitely-not-a-page/
```

Then run the browser QA against the live domain:

```sh
QA_BASE=https://www.boringmortgage.com NODE_PATH=$(npm root -g) node scripts/browser-qa.js
```

Findings and screenshots land in `qa-output/`, which is gitignored.

### 3. Report, do not guess

Tell Erik what passed and what did not, with the actual output. If something fails, fix the
smallest thing that fixes it. Do not redesign anything.

---

## Open items that need Erik or Patriot, not code

These were flagged during the build and are still open. Ask, do not assume.

1. **Patriot compliance sign-off.** The footer carries Erik Miller NMLS #263103, Belem Servicing
   LLC dba Patriot Home Mortgage NMLS #715386, the Glendale address, and Equal Housing Lender.
   The reviews section carries four real testimonial excerpts. All of it was carried forward from
   the previous site and has never been re-confirmed with Patriot's compliance people.
2. **Erik's visual approval** of the current headline and layout. It has not changed since
   version 4 and he has never explicitly signed off on it.
3. **Conversion paths.** Today the site offers phone, email, and Patriot's secure application.
   No booking calendar, no CRM, no analytics. The old site linked a `meetmequickly.com/hlt`
   booking page. Erik has not said whether that needs to come back.

---

## The GoHighLevel question, unresolved

Erik asked on September 8 whether Boring Mortgage has a Private Integration Token set up for
GoHighLevel and where the code goes. He did not answer the follow-up.

**Current state: there is no GoHighLevel integration of any kind on this site.** No token, no
tracking snippet, no form, no chat widget. That was deliberate. `dist/privacy/index.html`
currently promises visitors "no advertising trackers, contact database, or analytics scripts."

Two very different things get called "the code," and they go to opposite places:

**A tracking or chat widget snippet.** A `<script>` block from GoHighLevel's Sites area containing
a location ID. This is public by design. It goes before `</body>` on all seven pages. If you add
it, you **must** also rewrite the privacy page paragraph quoted above, because it would no longer
be true. Ask Erik for the snippet.

**A Private Integration Token** (GoHighLevel Settings → Private Integrations). This is a secret.
It must never appear in the repository or in any file served from `dist/`. This is a static site
with no server, so anything shipped to the browser is readable by everyone. If Erik wants check-in
answers or a contact form to reach GoHighLevel, the shape is:

- A Vercel Serverless Function, for example `api/lead.js`, that posts to the GoHighLevel API.
- The token stored as a Vercel environment variable, added by Erik in the dashboard, never in git.
- The check-in form posts to that function instead of staying entirely client-side.
- The privacy page updated to describe what is now collected and where it goes.

That is real work with a compliance dimension, since it means collecting contact information on a
mortgage site. Scope it with Erik before building it. Never ask him to paste the token into chat.

---

## Ground rules

- Preserve the design, copy, and humor. This site has been through visual QA. Do not restyle it.
- `dist/` is source. `source-assets/` holds originals that are tracked but never published.
- Never commit a token, key, or password. Environment variables go in the Vercel dashboard.
- Push only to `claude/boring-mortgage-handoff-46ejl5`. It is the production branch.
- Run the checks before pushing:

```sh
node --check dist/motion.js
node scripts/check-flow.cjs
git diff --check
```

- Local preview, because paths are root-relative and `file://` will not work:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
# then open http://127.0.0.1:8765/#check-in
```

---

## Contact and lender details in the source

Verify with Patriot before public launch. Do not treat this list as verified.

- Erik Miller, NMLS #263103, 623-696-8683, erik.miller@patriothomemortgage.com
- Belem Servicing LLC, dba Patriot Home Mortgage, company NMLS #715386
- 17505 N 79th Ave, Ste 312, Glendale, AZ 85308
- Profile: https://patriothomemortgage.com/mortgage-officer/erik-miller/
- Secure application: https://myloan.patriothomemortgage.com/homehub/signup/erik.miller@patriothomemortgage.com
- Loan options: https://patriothomemortgage.com/loan-options/

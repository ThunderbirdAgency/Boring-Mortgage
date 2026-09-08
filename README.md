# Boring Mortgage — Patriot Home Mortgage

Start with [BORING-MORTGAGE-HANDOFF.md](BORING-MORTGAGE-HANDOFF.md) for Claude Code setup, current publication, architecture, and launch checklist.

Portable static website. The editable source and publish directory is `dist/`. No dependency installation or build step.

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
node --check dist/motion.js
node scripts/check-flow.cjs
```

Open http://127.0.0.1:8765/#check-in. Full browser QA: `NODE_PATH=$(npm root -g) node scripts/browser-qa.js` (needs Playwright with Chromium; output in `qa-output/`).

GitHub: https://github.com/ThunderbirdAgency/Boring-Mortgage. The Sites Git origin and `.openai/hosting.json` are preserved. Private Sites publication is version 4 (before the September 8 image and metadata changes). Browser QA is complete; the public-domain launch is not, and the blockers are listed in the handoff.

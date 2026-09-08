# Boring Mortgage — Patriot Home Mortgage

Start with [BORING-MORTGAGE-HANDOFF.md](BORING-MORTGAGE-HANDOFF.md) for Claude Code setup, current publication, architecture, and launch checklist.

Portable static website. The editable source and publish directory is `dist/`. No dependency installation or build step.

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
node --check dist/motion.js
node scripts/check-flow.cjs
```

Open http://127.0.0.1:8765/#check-in. Preserve the existing Sites Git origin and `.openai/hosting.json`. A separate GitHub destination has not been verified. Private publication is version 4; browser QA and public-domain launch remain outstanding.

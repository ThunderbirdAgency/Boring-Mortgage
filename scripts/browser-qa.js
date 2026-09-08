// Repeatable browser QA for the Boring Mortgage static site.
// Usage:  python3 -m http.server 8765 --bind 127.0.0.1 --directory dist &
//         NODE_PATH=$(npm root -g) node scripts/browser-qa.js
// Needs Playwright with Chromium (global install is fine). Screenshots and findings.txt land in qa-output/.
const { chromium } = require('playwright');
const S = process.env.QA_OUT || require('path').join(__dirname, '../qa-output');
require('fs').mkdirSync(S + '/shots', { recursive: true });
const BASE = process.env.QA_BASE || 'http://127.0.0.1:8765';
const findings = [];
const note = (sev, msg) => { findings.push(`[${sev}] ${msg}`); console.log(`[${sev}] ${msg}`); };

async function overflowCheck(page, label) {
  const r = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const sw = document.documentElement.scrollWidth;
    const wide = [];
    for (const el of document.querySelectorAll('body *')) {
      const b = el.getBoundingClientRect();
      if (b.width > 0 && (b.right > vw + 1 || b.left < -1) && getComputedStyle(el).visibility !== 'hidden') {
        const p = el.closest('[hidden]'); if (p) continue;
        wide.push(`${el.tagName.toLowerCase()}${el.id?'#'+el.id:''}${el.className&&typeof el.className==='string'?'.'+el.className.split(' ').join('.'):''} right=${Math.round(b.right)} left=${Math.round(b.left)}`);
      }
    }
    return { vw, sw, wide: wide.slice(0, 12) };
  });
  if (r.sw > r.vw) note('OVERFLOW', `${label}: scrollWidth ${r.sw} > viewport ${r.vw}; offenders: ${r.wide.join(' | ')}`);
  else console.log(`ok overflow ${label} (${r.vw})`);
  return r;
}

async function labelClipCheck(page, label) {
  const r = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('.check-panel label, .scene-controls button, .check-actions button, .button, nav a')) {
      if (el.closest('[hidden]')) continue;
      const b = el.getBoundingClientRect();
      if (b.width === 0) continue;
      if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 2) out.push(`${el.tagName} "${el.textContent.trim().slice(0,40)}" sw=${el.scrollWidth} cw=${el.clientWidth} sh=${el.scrollHeight} ch=${el.clientHeight}`);
    }
    return out;
  });
  if (r.length) note('CLIP', `${label}: ${r.join(' | ')}`);
}

(async () => {
  const browser = await chromium.launch();
  const pages = ['/', '/buy/', '/refinance/', '/double_checker/', '/schedule-a-call/', '/privacy/', '/404.html'];
  const viewports = [[320, 640], [390, 844], [768, 1024], [1440, 900], [1920, 1080]];

  // 1. console errors, failed requests, per-page screenshots at each viewport
  for (const [w, h] of viewports) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(`${m.type()}: ${m.text()}`); });
    page.on('requestfailed', r => errs.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
    page.on('response', r => { if (r.status() >= 400) errs.push(`http ${r.status()}: ${r.url()}`); });
    for (const p of pages) {
      await page.goto(BASE + p, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      const name = (p === '/' ? 'home' : p.replace(/\W+/g, '_').replace(/^_|_$/g, ''));
      await page.screenshot({ path: `${S}/shots/${name}-${w}.png`, fullPage: true });
      await overflowCheck(page, `${p} @${w}`);
      await labelClipCheck(page, `${p} @${w}`);
      // images loaded (scroll first so lazy images are fetched)
      await page.evaluate(async () => { document.documentElement.style.scrollBehavior = 'auto'; for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(600);
      const badImgs = await page.evaluate(() => [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src')));
      if (badImgs.length) note('IMG', `${p} @${w}: broken images ${badImgs.join(', ')}`);
    }
    if (errs.length) note('CONSOLE', `@${w}: ${[...new Set(errs)].join(' | ')}`);
    await ctx.close();
  }

  // 2. Check-in flow at 390 and 1440, keyboard + focus
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(BASE + '/#check-in', { waitUntil: 'networkidle' });
    const f = async () => page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName.toLowerCase()}${a.id?'#'+a.id:''} "${(a.textContent||'').trim().slice(0,30)}"` : 'none'; });
    // progress visible, only one fieldset visible
    const vis = await page.evaluate(() => ({ prog: !document.querySelector('.check-progress').hidden, fs: [...document.querySelectorAll('#mortgage-check fieldset')].map(f => !f.hidden), back: document.getElementById('check-back').hidden, next: document.getElementById('check-next').textContent }));
    console.log(`@${w} initial state`, JSON.stringify(vis));
    if (vis.fs.filter(Boolean).length !== 1 || !vis.back || vis.next !== 'Continue →') note('FLOW', `@${w} initial state wrong ${JSON.stringify(vis)}`);
    // submit with nothing selected -> should stay on step 1 and show validity
    await page.click('#check-next');
    await page.waitForTimeout(200);
    const s1 = await page.evaluate(() => ({ step: document.getElementById('check-step').textContent, valid: document.querySelector('input[name=goal]').validity.valueMissing, active: document.activeElement && document.activeElement.name }));
    console.log(`@${w} empty submit`, JSON.stringify(s1));
    if (s1.step !== 'QUESTION 1 OF 3') note('FLOW', `@${w} advanced without answer`);
    await page.screenshot({ path: `${S}/shots/checkin-validation-${w}.png` });
    // pick with keyboard: focus first radio, arrow to second, Enter
    await page.click('label:has(input[value=buy])');
    await page.waitForTimeout(100);
    await page.keyboard.press('Enter'); // Enter inside radio submits form
    await page.waitForTimeout(400);
    let st = await page.evaluate(() => document.getElementById('check-step').textContent);
    console.log(`@${w} after Enter on radio: ${st}; focus=${await f()}`);
    if (st !== 'QUESTION 2 OF 3') note('FLOW', `@${w} Enter did not advance (got ${st})`);
    const focus2 = await f();
    if (!focus2.startsWith('legend')) note('FOCUS', `@${w} focus after step change is ${focus2}`);
    await page.screenshot({ path: `${S}/shots/checkin-step2-${w}.png` });
    // Back preserves selection
    await page.click('#check-back');
    await page.waitForTimeout(200);
    const kept = await page.isChecked('input[value=buy]');
    if (!kept) note('FLOW', `@${w} Back lost selection`);
    console.log(`@${w} back focus=${await f()}`);
    await page.click('#check-next');
    await page.waitForTimeout(200);
    // keyboard select on step2: Tab to radio group, ArrowDown
    await page.keyboard.press('Tab');
    console.log(`@${w} tab from legend -> ${await f()}`);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    const when = await page.evaluate(() => (document.querySelector('input[name=when]:checked')||{}).value);
    console.log(`@${w} arrow selected when=${when}`);
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
    console.log(`@${w} tab tab -> ${await f()}`);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    st = await page.evaluate(() => document.getElementById('check-step').textContent);
    console.log(`@${w} step3: ${st}, focus=${await f()}`);
    await page.click('label:has(input[value=surprises])');
    await page.click('#check-next');
    await page.waitForTimeout(400);
    const res = await page.evaluate(() => ({ hidden: document.getElementById('check-result').hidden, formHidden: document.getElementById('mortgage-check').hidden, title: document.getElementById('result-title').textContent, link: document.getElementById('result-link').getAttribute('href'), linkText: document.getElementById('result-link').textContent, timing: document.getElementById('result-timing').textContent.slice(0, 40) }));
    console.log(`@${w} result`, JSON.stringify(res), 'focus=', await f());
    if (res.hidden || !res.formHidden || res.link !== '/buy/') note('FLOW', `@${w} result wrong ${JSON.stringify(res)}`);
    if (!(await f()).startsWith('div#check-result')) note('FOCUS', `@${w} result focus is ${await f()}`);
    await overflowCheck(page, `result @${w}`);
    await page.screenshot({ path: `${S}/shots/checkin-result-${w}.png`, fullPage: false });
    // is result panel within viewport after focus?
    const inView = await page.evaluate(() => { const b = document.getElementById('check-result').getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), vh: innerHeight }; });
    console.log(`@${w} result rect`, JSON.stringify(inView));
    if (inView.top < 0 || inView.top > inView.vh) note('SCROLL', `@${w} result panel top ${inView.top} not in viewport (vh ${inView.vh})`);
    // change answers -> selections preserved, step 1
    await page.click('#check-reset');
    await page.waitForTimeout(200);
    const after = await page.evaluate(() => ({ goal: (document.querySelector('input[name=goal]:checked')||{}).value, when: (document.querySelector('input[name=when]:checked')||{}).value, worry: (document.querySelector('input[name=worry]:checked')||{}).value, step: document.getElementById('check-step').textContent }));
    console.log(`@${w} after reset`, JSON.stringify(after), 'focus=', await f());
    // change goal to review, finish -> destination double_checker
    await page.click('label:has(input[value=review])');
    await page.click('#check-next'); await page.click('#check-next'); await page.click('#check-next');
    await page.waitForTimeout(300);
    const link2 = await page.evaluate(() => document.getElementById('result-link').getAttribute('href'));
    if (link2 !== '/double_checker/') note('FLOW', `@${w} review destination ${link2}`);
    // Actually follow the link
    await page.click('#result-link');
    await page.waitForLoadState('networkidle');
    console.log(`@${w} followed result link -> ${page.url()}`);
    await ctx.close();
  }

  // 3. Showcase controls, reduced motion, visibility, offscreen, touch
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitForTimeout: 0, waitUntil: 'networkidle' });
    const state = async () => page.evaluate(() => ({ active: document.querySelector('.trouble-scene.is-active').dataset.scene, pressed: [...document.querySelectorAll('.scene-dot')].map(b => b.getAttribute('aria-pressed')), hidden: [...document.querySelectorAll('.trouble-scene')].map(s => s.getAttribute('aria-hidden')), pause: document.getElementById('trouble-pause').textContent, label: document.getElementById('trouble-pause').getAttribute('aria-label'), motionOff: document.querySelector('.trouble-show').classList.contains('motion-off'), anim: getComputedStyle(document.querySelector('.trouble-scene.is-active img')).animationPlayState }));
    console.log('showcase initial', JSON.stringify(await state()));
    await page.click('[data-pick="1"]');
    let s = await state(); console.log('after dot 1', JSON.stringify(s));
    if (s.active !== '1' || s.pause !== 'Play' || !s.motionOff) note('SHOW', `dot click state ${JSON.stringify(s)}`);
    await page.click('#trouble-pause'); s = await state(); console.log('after play', JSON.stringify(s));
    if (s.pause !== 'Pause' || s.motionOff) note('SHOW', `play state ${JSON.stringify(s)}`);
    // auto-advance within 7s
    await page.waitForTimeout(7000); s = await state(); console.log('after 7s', JSON.stringify(s));
    if (s.active !== '2') note('SHOW', `auto-advance failed, active=${s.active}`);
    // arrow keys: focus inside root
    await page.focus('[data-pick="0"]');
    await page.keyboard.press('ArrowRight'); s = await state(); console.log('ArrowRight', JSON.stringify(s));
    await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft'); s = await state(); console.log('ArrowLeft x2', JSON.stringify(s));
    // keyboard: Space on pause
    await page.focus('#trouble-pause'); await page.keyboard.press('Space'); s = await state(); console.log('Space on pause', JSON.stringify(s));
    // offscreen -> motion-off
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(500);
    s = await state(); console.log('offscreen', JSON.stringify(s)); if (!s.motionOff) note('SHOW', 'not paused offscreen');
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500);
    s = await state(); console.log('back onscreen', JSON.stringify(s));
    // background tab simulation
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { get: () => true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    s = await state(); console.log('hidden tab', JSON.stringify(s)); if (!s.motionOff) note('SHOW', 'not paused in hidden tab');
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { get: () => false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    s = await state(); console.log('visible tab', JSON.stringify(s));
    // reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(300);
    s = await state(); console.log('reduced motion', JSON.stringify(s)); if (!s.motionOff || s.pause !== 'Play') note('SHOW', `reduced motion state ${JSON.stringify(s)}`);
    // can user still play under reduced motion? (should switch scenes but animation none)
    await page.click('#trouble-pause'); s = await state(); console.log('play under reduced motion', JSON.stringify(s));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    // Keyboard tab order from top
    await page.reload({ waitUntil: 'networkidle' });
    const order = [];
    for (let i = 0; i < 14; i++) { await page.keyboard.press('Tab'); order.push(await page.evaluate(() => { const a = document.activeElement; return `${a.tagName.toLowerCase()}${a.id?'#'+a.id:''}:${(a.textContent||a.getAttribute('aria-label')||'').trim().slice(0,22)}`; })); }
    console.log('tab order:', order.join(' > '));
    // skip link visibility on focus
    await page.goto(BASE + '/buy/', { waitUntil: 'networkidle' }); await page.keyboard.press('Tab');
    const skip = await page.evaluate(() => { const b = document.querySelector('.skip').getBoundingClientRect(); return { top: b.top, visible: b.top >= 0 }; });
    console.log('skip link on focus', JSON.stringify(skip)); if (!skip.visible) note('A11Y', 'skip link not visible on focus');
    await page.screenshot({ path: `${S}/shots/skip-focus.png` });
    await ctx.close();
  }
  // touch
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    await page.tap('[data-pick="2"]');
    const s = await page.evaluate(() => ({ active: document.querySelector('.trouble-scene.is-active').dataset.scene, pause: document.getElementById('trouble-pause').textContent }));
    console.log('touch tap dot 2', JSON.stringify(s)); if (s.active !== '2') note('TOUCH', 'tap did not select scene');
    await page.tap('#trouble-pause');
    await page.tap('a[href="#check-in"]'); await page.waitForTimeout(800);
    await page.tap('label:has(input[value=refi])'); await page.tap('#check-next'); await page.waitForTimeout(300);
    console.log('touch check-in step:', await page.evaluate(() => document.getElementById('check-step').textContent));
    // tap targets >= 44px?
    const small = await page.evaluate(() => [...document.querySelectorAll('a,button,label')].filter(e => !e.closest('[hidden]')).map(e => { const b = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 25), h: Math.round(b.height), w: Math.round(b.width) }; }).filter(x => x.h > 0 && x.h < 24));
    if (small.length) console.log('small tap targets (<24px high):', JSON.stringify(small));
    await page.screenshot({ path: `${S}/shots/mobile-touch-checkin.png` });
    await ctx.close();
  }
  // 4. 200% text enlargement (font-size 200% on html) and 200% zoom proxy (720 wide)
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + '/#check-in', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{font-size:200%!important}' });
    await page.waitForTimeout(300);
    await overflowCheck(page, 'text-200% @1440'); await labelClipCheck(page, 'text-200% @1440');
    await page.screenshot({ path: `${S}/shots/text200-1440.png`, fullPage: true });
    await ctx.close();
    const ctx2 = await browser.newContext({ viewport: { width: 720, height: 450 } });
    const p2 = await ctx2.newPage();
    await p2.goto(BASE + '/#check-in', { waitUntil: 'networkidle' });
    await overflowCheck(p2, 'zoom200 proxy @720'); await labelClipCheck(p2, 'zoom200 proxy @720');
    await p2.screenshot({ path: `${S}/shots/zoom200-720.png`, fullPage: true });
    await ctx2.close();
  }
  // 5. Anchors and internal links across all pages
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const seen = new Set();
    for (const p of pages) {
      await page.goto(BASE + p, { waitUntil: 'networkidle' });
      const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')));
      for (const href of links) {
        if (seen.has(p + '|' + href)) continue; seen.add(p + '|' + href);
        if (href.startsWith('#') || href.startsWith('/#')) {
          const id = href.split('#')[1];
          const target = href.startsWith('/#') ? '/' : p;
          if (target !== p) await page.goto(BASE + target, { waitUntil: 'networkidle' });
          const ok = await page.evaluate(id => !!document.getElementById(id), id);
          if (!ok) note('ANCHOR', `${p}: ${href} target missing`);
          if (target !== p) await page.goto(BASE + p, { waitUntil: 'networkidle' });
        } else if (href.startsWith('/')) {
          const r = await page.request.get(BASE + href);
          if (r.status() !== 200) note('LINK', `${p}: ${href} -> ${r.status()}`);
        } else if (href.startsWith('tel:') || href.startsWith('mailto:')) {
          console.log(`${p}: ${href}`);
        }
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log('\n=== FINDINGS ===\n' + (findings.length ? findings.join('\n') : 'none'));
  require('fs').writeFileSync(`${S}/findings.txt`, findings.join('\n'));
})().catch(e => { console.error('QA SCRIPT ERROR', e); process.exit(1); });

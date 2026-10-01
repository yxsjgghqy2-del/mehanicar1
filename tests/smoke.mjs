// Wiederverwendbarer Smoke-Test für mehanicar (index.html).
// Aufruf: node tests/smoke.mjs   (playwright muss erreichbar sein, s. docs/mitarbeiter/ROUTINE.md)
// Prüft alle Hauptansichten bei 390 px und 1280 px auf JS-Fehler und horizontales Scrollen,
// öffnet einen Auftrag und klickt die sichtbaren Buttons einmal durch.
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const URL = 'file://' + ROOT + '/index.html';
const VIEWS = ['planung', 'auftraege', 'kunden', 'termine', 'anfragen', 'mehr', 'fahrzeuge', 'lager', 'finanzen', 'einstellungen', 'kalender', 'bestellungen', 'team', 'apdb', 'pakvorlagen'];
const shotDir = process.env.SHOTS || null;

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
let fail = 0;
for (const [w, h] of [[390, 844], [1280, 800]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.goto(URL);
  await page.evaluate(() => { S.settings.onboarded = true; save(); render(); });
  for (const v of VIEWS) {
    await page.evaluate(v => { try { nav(v); } catch (e) { throw new Error('nav(' + v + '): ' + e.message); } }, v).catch(e => errs.push(e.message));
    await page.waitForTimeout(120);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw > w + 1) errs.push(`${v}: horizontales Scrollen (${sw}px bei ${w}px)`);
    if (shotDir && w === 390) await page.screenshot({ path: `${shotDir}/${v}.png` });
  }
  // „Was ist neu“: Mehr → Versionsnummer antippen, Liste muss erscheinen, Punkt verschwinden
  await page.evaluate(() => nav('mehr'));
  await page.waitForTimeout(120);
  await page.click('[data-act="whatsnew"]', { timeout: 2000 }).catch(e => errs.push('Was ist neu: Knopf fehlt'));
  await page.waitForTimeout(150);
  const wn = await page.evaluate(() => ({ items: document.querySelectorAll('#sheetbg .wn-item').length, dot: !!document.querySelector('.vers-dot'), seen: S.settings.seenVer === APP_VER }));
  if (!wn.items || wn.dot || !wn.seen) errs.push('Was ist neu: ' + JSON.stringify(wn));
  if (shotDir) await page.screenshot({ path: `${shotDir}/whatsnew-${w}.png` });
  await page.evaluate(() => closeSheet());
  // Globale Suche: Lupe → „sm247“ (kompaktes Kennzeichen) → Treffer antippen
  await page.evaluate(() => nav('planung'));
  await page.waitForTimeout(120);
  await page.click('[data-act="gsuche"]', { timeout: 2000 }).catch(() => errs.push('Such-Lupe fehlt'));
  await page.fill('#gs-in', 'sm247').catch(() => errs.push('Suchfeld fehlt'));
  await page.waitForTimeout(150);
  const gs = await page.evaluate(() => [...document.querySelectorAll('#gsuche .gs-gt')].map(e => e.firstChild.textContent));
  if (!gs.includes('Fahrzeuge') || !gs.includes('Aufträge')) errs.push('Suche „sm247“: Gruppen ' + JSON.stringify(gs));
  if (shotDir) await page.screenshot({ path: `${shotDir}/suche-${w}.png` });
  const swS = await page.evaluate(() => document.documentElement.scrollWidth);
  if (swS > w + 1) errs.push(`Suche: horizontales Scrollen (${swS}px)`);
  await page.click('#gsuche .gs-row', { timeout: 2000 }).catch(() => errs.push('Suchtreffer nicht antippbar'));
  await page.waitForTimeout(150);
  const gsNach = await page.evaluate(() => ({ zu: !document.getElementById('gsuche'), v: route.v }));
  if (!gsNach.zu || !['kunde', 'fahrzeug', 'auftrag'].includes(gsNach.v)) errs.push('Suchtreffer öffnet nichts: ' + JSON.stringify(gsNach));
  // Suche Scheibe 2: „brems“ → Positionen, Anfragen, Lager; Lager-Treffer öffnet das Teil
  await page.evaluate(() => { nav('planung'); openSuche(); });
  await page.fill('#gs-in', 'brems').catch(() => errs.push('Suchfeld fehlt (2)'));
  await page.waitForTimeout(150);
  const gs2 = await page.evaluate(() => [...document.querySelectorAll('#gsuche .gs-gt')].map(e => e.firstChild.textContent));
  for (const g of ['Arbeiten & Teile in Aufträgen', 'Anfragen', 'Lager']) if (!gs2.includes(g)) errs.push('Suche „brems“: Gruppe fehlt ' + g);
  if (shotDir) await page.screenshot({ path: `${shotDir}/suche2-${w}.png` });
  await page.click('#gsuche .gs-row[data-a="lager-edit"]', { timeout: 2000 }).catch(() => errs.push('Lager-Treffer fehlt'));
  await page.waitForTimeout(150);
  if (!(await page.evaluate(() => !!document.getElementById('lg-t')))) errs.push('Lager-Treffer öffnet kein Teil');
  await page.evaluate(() => closeSheet());
  // Auftrag öffnen und sichtbare Buttons einmal antippen
  const aid = await page.evaluate(() => (S.auftraege.find(a => a.pakete && a.pakete.length) || S.auftraege[0] || {}).id);
  if (aid) {
    await page.evaluate(id => nav('auftrag', id), aid);
    await page.waitForTimeout(200);
    // Kalk-Kopf: muss da sein und Brutto wie die Engine zeigen
    const kk = await page.evaluate(id => { const el = document.querySelector('.hdr .kkopf'); const a = auftrag(id);
      return el ? el.innerText.includes(fmt(ordBrutto(a))) : null; }, aid);
    if (kk !== true) errs.push('Kalk-Kopf fehlt oder Brutto falsch: ' + kk);
    if (shotDir) await page.screenshot({ path: `${shotDir}/auftrag-${w}.png` });
    // Detail-Kalkulation: Modus „Kalkulation“, Summen müssen zur Engine passen
    await page.click('[data-act="calc-mode"][data-m="calc"]', { timeout: 2000 }).catch(() => errs.push('Kalkulation-Knopf fehlt'));
    await page.waitForTimeout(150);
    const kd = await page.evaluate(id => { const a = auftrag(id), K = ordKalk(a), el = document.querySelector('.kdet');
      if (!el) return 'fehlt';
      if (K.posSum - K.rabPak - K.rabOrd !== K.netto) return 'Summe passt nicht: ' + JSON.stringify(K);
      const pay = el.querySelector('.kr.pay b'); return pay && pay.textContent === fmt(K.zuZahlen) ? true : 'Zu zahlen falsch'; }, aid);
    if (kd !== true) errs.push('Detail-Kalkulation: ' + kd);
    // Rabatt-Schnellwahl: 10 % setzen, prüfen, wieder auf 0 %
    const rabVorher = await page.evaluate(id => JSON.stringify(auftrag(id).rabatt), aid);
    await page.click('[data-act="orab-q"][data-r="10"]', { timeout: 2000 }).catch(() => errs.push('Rabatt-Knopf 10 % fehlt'));
    await page.waitForTimeout(120);
    const rq = await page.evaluate(id => { const a = auftrag(id), K = ordKalk(a);
      return K.rabOrd === Math.round(ordSub(a) * 10 / 100) && document.querySelector('.hdr .kkopf').innerText.includes(fmt(K.brutto)); }, aid);
    if (!rq) errs.push('Rabatt 10 % rechnet falsch');
    if (shotDir && w === 390) { await page.evaluate(() => { applyTheme('light'); document.querySelector('.krab').scrollIntoView({ block: 'center' }); });
      await page.screenshot({ path: `${shotDir}/rabatt-hell-${w}.png` }); await page.evaluate(() => applyTheme(S.settings.theme)); }
    await page.evaluate(([id, r]) => { auftrag(id).rabatt = JSON.parse(r); save(); render(); }, [aid, rabVorher]);
    if (shotDir) { await page.evaluate(() => document.querySelector('.kdet').scrollIntoView()); await page.screenshot({ path: `${shotDir}/kalk-${w}.png` }); }
    await page.click('[data-act="calc-mode"][data-m="over"]', { timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(100);
    const n = await page.$$eval('button', b => b.length);
    for (let i = 0; i < Math.min(n, 25); i++) {
      const btns = await page.$$('button:visible');
      if (!btns[i]) break;
      const txt = ((await btns[i].innerText().catch(() => '')) || '').toLowerCase();
      if (/löschen|zurücksetzen|entfernen/.test(txt)) continue; // nichts Destruktives
      await btns[i].click({ timeout: 1000 }).catch(() => {});
      await page.waitForTimeout(80);
      await page.keyboard.press('Escape').catch(() => {});
      await page.evaluate(() => { const s = document.getElementById('sheetbg'); if (s) s.remove(); document.querySelectorAll('.confirm-bg').forEach(c => c.remove()); });
    }
  } else errs.push('Kein Auftrag in den Demo-Daten gefunden');
  const ver = await page.evaluate(() => typeof APP_VER !== 'undefined' ? APP_VER : '?');
  console.log(`${w}px · Version ${ver} · Fehler: ${errs.length}`);
  errs.slice(0, 8).forEach(e => console.log('   ' + e));
  fail += errs.length;
}
await browser.close();
process.exit(fail ? 1 : 0);

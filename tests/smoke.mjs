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
  // Auftrag öffnen und sichtbare Buttons einmal antippen
  const aid = await page.evaluate(() => (S.auftraege.find(a => a.pakete && a.pakete.length) || S.auftraege[0] || {}).id);
  if (aid) {
    await page.evaluate(id => nav('auftrag', id), aid);
    await page.waitForTimeout(200);
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

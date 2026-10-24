// Wiederverwendbarer Smoke-Test für mehanicar (index.html).
// Aufruf: node tests/smoke.mjs   (playwright muss erreichbar sein, s. docs/mitarbeiter/ROUTINE.md)
// Prüft alle Hauptansichten bei 390 px und 1280 px auf JS-Fehler und horizontales Scrollen,
// öffnet einen Auftrag und klickt die sichtbaren Buttons einmal durch.
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Kleiner lokaler Webserver statt file:// (Schriften u. Ä. laden wie auf der echten Seite)
import http from 'http';
import fsSrv from 'fs';
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (!f.startsWith(ROOT) || !fsSrv.existsSync(f) || fsSrv.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
  r.setHeader('Content-Type', MIME[path.extname(f)] || 'application/octet-stream'); fsSrv.createReadStream(f).pipe(r); });
await new Promise(res => srv.listen(0, 'localhost', res));
const URL = 'http://localhost:' + srv.address().port + '/index.html';
const VIEWS = ['planung', 'auftraege', 'kunden', 'termine', 'anfragen', 'mehr', 'fahrzeuge', 'lager', 'finanzen', 'einstellungen', 'kalender', 'bestellungen', 'team', 'apdb', 'pakvorlagen'];
const shotDir = process.env.SHOTS || null;

// Barrierefreiheit: sichtbare Knöpfe brauchen einen Namen (Text, aria-label oder title)
async function a11y(page, errs, wo) {
  const ohneName = await page.evaluate(() => [...document.querySelectorAll('button, [role="button"]')].filter(b => {
    const r = b.getBoundingClientRect(); if (!r.width || !r.height) return false;
    return !(b.innerText || '').trim() && !b.getAttribute('aria-label') && !b.getAttribute('title');
  }).map(b => (b.dataset.act || b.className || b.outerHTML.slice(0, 40))));
  if (ohneName.length) errs.push(`${wo}: Knöpfe ohne Beschriftung: ${[...new Set(ohneName)].join(', ')}`);
  // Gestauchte Knöpfe: kurzer Text, aber viel höher als breit (Text bricht Buchstabe für Buchstabe um)
  const gestaucht = await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => {
    const r = b.getBoundingClientRect(); const t = (b.innerText || '').trim();
    return r.width > 0 && t.length > 2 && t.length < 25 && r.height > 64 && r.height > r.width * 1.5;
  }).map(b => (b.innerText || '').trim().replace(/\s+/g, '')));
  if (gestaucht.length) errs.push(`${wo}: gestauchte Knöpfe: ${gestaucht.join(', ')}`);
}

import fs from 'fs';
const exe = process.env.PW_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
let fail = 0;
for (const [w, h] of [[390, 844], [1280, 800]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  // Test ohne Internet: Cloud-Backup (Supabase) und andere externe Aufrufe lokal beantworten
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('requestfailed', r => { if (process.env.NETLOG) console.log('   Netz fehlgeschlagen: ' + r.url().slice(0, 120)); });
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.goto(URL);
  await page.evaluate(() => { S.settings.onboarded = true; save(); render(); });
  for (const v of VIEWS) {
    await page.evaluate(v => { try { nav(v); } catch (e) { throw new Error('nav(' + v + '): ' + e.message); } }, v).catch(e => errs.push(e.message));
    await page.waitForTimeout(120);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw > w + 1) errs.push(`${v}: horizontales Scrollen (${sw}px bei ${w}px)`);
    if (shotDir && w === 390) await page.screenshot({ path: `${shotDir}/${v}.png` });
    if (shotDir && w === 390 && ['planung','kunden','finanzen','einstellungen','auftraege','termine','anfragen'].includes(v)) { await page.evaluate(() => { applyTheme('light'); render(); }); await page.waitForTimeout(600); await page.screenshot({ path: `${shotDir}/${v}-hell.png`, fullPage: true }); await page.evaluate(() => { applyTheme(S.settings.theme); render(); }); await page.waitForTimeout(600); await page.screenshot({ path: `${shotDir}/${v}-dunkel.png`, fullPage: true }); }
    await a11y(page, errs, v);
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
  // Suche Scheibe 3: Schnellbefehle
  await page.evaluate(() => openSuche());
  await page.fill('#gs-in', 'neuer auftrag').catch(() => errs.push('Suchfeld fehlt (3)'));
  await page.waitForTimeout(120);
  await page.click('#gsuche .gs-row[data-a="ord-new"]', { timeout: 2000 }).catch(() => errs.push('Befehl „neuer auftrag“ fehlt'));
  await page.waitForTimeout(150);
  if (!(await page.evaluate(() => (document.querySelector('#sheetbg h2') || {}).textContent === 'Neuer Auftrag'))) errs.push('„neuer auftrag“ öffnet keine Maske');
  await page.evaluate(() => closeSheet());
  const beVor = await page.evaluate(() => S.bestellungen.length);
  await page.evaluate(() => openSuche());
  await page.fill('#gs-in', 'bestell bremsbel');
  await page.waitForTimeout(120);
  if (shotDir) await page.screenshot({ path: `${shotDir}/befehl-${w}.png` });
  await page.click('#gsuche .gs-row[data-a="gs-bestell"]', { timeout: 2000 }).catch(() => errs.push('Befehl „bestell …“ ohne Treffer'));
  await page.click('.confirm-bg [data-c="1"]', { timeout: 2000 }).catch(() => errs.push('Bestell-Rückfrage fehlt'));
  await page.waitForTimeout(150);
  const beNach = await page.evaluate(() => ({ n: S.bestellungen.length, v: route.v }));
  if (beNach.n !== beVor + 1 || beNach.v !== 'bestellungen') errs.push('„bestell …“ legt keine Bestellung an: ' + JSON.stringify(beNach));
  // Kunden-Maske (Entwurf 14): Vorschau-Kopf, aufklappbare Balken, Speichern
  await page.evaluate(() => { nav('kunden'); ACT['kunde-edit']({ dataset: {} }); });
  await page.waitForTimeout(150);
  await page.fill('#ku-vn', 'Test');
  await page.fill('#ku-nn', 'Prüfkunde');
  await page.fill('#ku-t', '0170 111');
  await page.fill('#ku-fa', 'Prüf GmbH');
  await page.fill('#ku-ust', ' de 123 456 789');
  const mk = await page.evaluate(() => document.getElementById('mk-n').textContent + '|' + document.getElementById('mk-av').textContent);
  if (mk !== 'Test Prüfkunde|TP') errs.push('Kunden-Maske: Vorschau falsch ' + mk);
  await page.click('details.msec:has(.mseg) > summary').catch(() => errs.push('Balken „Werkstatt-Infos“ fehlt'));
  await page.click('.mseg label:has(input[value="Mittel"])').catch(() => errs.push('Zahlungsmoral-Knopf fehlt'));
  if (shotDir) await page.screenshot({ path: `${shotDir}/kunde-neu-${w}.png` });
  await page.click('[data-act="kunde-save"]');
  await page.waitForTimeout(150);
  const kn = await page.evaluate(() => { const k = S.kunden.find(x => x.name === 'Test Prüfkunde'); const r = k ? k.moral + '|' + k.tel + '|' + k.ustid : null;
    if (k) { S.kunden = S.kunden.filter(x => x !== k); save(); render(); } return r; });
  if (kn !== 'Mittel|0170 111|DE123456789') errs.push('Kunden-Maske speichert falsch: ' + kn);
  // Fahrzeug-Maske (Entwurf 14): Kennzeichen-Vorschau, Halter wählen, Speichern
  await page.evaluate(() => { nav('fahrzeuge'); ACT['fzg-edit']({ dataset: {} }); });
  await page.waitForTimeout(150);
  await page.fill('#fzk-q', 'yilmaz').catch(() => errs.push('Fahrzeug-Maske: Halter-Suche fehlt'));
  await page.waitForTimeout(100);
  await page.click('#fzk-res [data-kid]').catch(() => errs.push('Fahrzeug-Maske: Halter nicht wählbar'));
  await page.fill('#fz-kz', 'hu-tt 99');
  await page.fill('#fz-ma', 'VW');
  await page.fill('#fz-mo', 'Golf');
  await page.waitForTimeout(80);
  const fk = await page.evaluate(() => [document.getElementById('mk-kz').textContent, document.getElementById('mk-n').textContent, document.getElementById('mk-s').textContent].join('|'));
  if (fk !== 'HU-TT 99|VW Golf|Ali Yilmaz') errs.push('Fahrzeug-Maske: Vorschau falsch ' + fk);
  if (shotDir) await page.screenshot({ path: `${shotDir}/fzg-neu-${w}.png` });
  await page.click('[data-act="fzg-save"]');
  await page.waitForTimeout(150);
  const fn = await page.evaluate(() => { const f = S.fahrzeuge.find(x => x.kennz === 'HU-TT 99'); const r = f ? f.marke + '|' + (kunde(f.kundeId) || {}).name : null;
    if (f) { S.fahrzeuge = S.fahrzeuge.filter(x => x !== f); save(); render(); } return r; });
  if (fn !== 'VW|Ali Yilmaz') errs.push('Fahrzeug-Maske speichert falsch: ' + fn);
  // Positions-Maske (Entwurf 14): Arbeit neu (AW × Satz) und Teil bearbeiten (Aufschlag im Kopf)
  {
    const ids = await page.evaluate(() => { const a = S.auftraege.find(o => o.pakete.some(pk => pk.pos.some(p => p.typ === 'teil')));
      const pk = a.pakete.find(pk => pk.pos.some(p => p.typ === 'teil')); const t = pk.pos.find(p => p.typ === 'teil');
      return { oid: a.id, pid: pk.id, xid: t.id, ek: t.ekCt, vk: t.vkCt, m: t.menge || 1 }; });
    await page.evaluate(i => { nav('auftrag', i.oid); ACT['add-arbeit']({ dataset: { oid: i.oid, pid: i.pid } }); }, ids);
    await page.waitForTimeout(150);
    await page.fill('#ps-b', 'Testarbeit');
    await page.fill('#ps-aw', '2');
    await page.waitForTimeout(80);
    const pa = await page.evaluate(() => [document.getElementById('mk-n').textContent, document.getElementById('mk-p').textContent, fmt(2 * (parseEuro(document.getElementById('ps-aws').value)))].join('|'));
    const [pn, pp, soll] = pa.split('|');
    if (pn !== 'Testarbeit' || pp !== soll) errs.push('Positions-Maske Arbeit: Vorschau falsch ' + pa);
    await page.evaluate(() => closeSheet());
    await page.evaluate(i => ACT['pos-edit']({ dataset: { oid: i.oid, pid: i.pid, xid: i.xid } }), ids);
    await page.waitForTimeout(120);
    const pt = await page.evaluate(() => document.getElementById('mk-g').textContent);
    const sollG = '+ ' + await page.evaluate(i => fmt((i.vk - i.ek) * i.m), ids);
    if (!pt.startsWith(sollG)) errs.push('Positions-Maske Teil: Aufschlag falsch ' + pt + ' statt ' + sollG);
    if (shotDir) await page.screenshot({ path: `${shotDir}/pos-teil-${w}.png` });
    await page.click('[data-act="pos-save"]');
    await page.waitForTimeout(120);
    const ps = await page.evaluate(i => { const t = auftrag(i.oid).pakete.find(p => p.id === i.pid).pos.find(p => p.id === i.xid);
      return t.ekCt === i.ek && t.vkCt === i.vk && (t.menge || 1) === i.m; }, ids);
    if (!ps) errs.push('Positions-Maske: Speichern verändert unveränderte Werte');
    await page.evaluate(() => closeSheet());
    // „Teil hinzufügen“ aus dem Lager: Vorschau + Hinzufügen
    const lid = await page.evaluate(() => (S.lager.find(l => l.bestand >= 1) || {}).id);
    const posVor = await page.evaluate(i => auftrag(i.oid).pakete.find(p => p.id === i.pid).pos.length, ids);
    const bestVor = await page.evaluate(id => lagerT(id).bestand, lid);
    await page.evaluate(i => ACT['add-teil']({ dataset: { oid: i.oid, pid: i.pid } }), ids);
    await page.waitForTimeout(120);
    await page.selectOption('#pt-l', lid);
    await page.waitForTimeout(80);
    const at = await page.evaluate(id => { const l = lagerT(id); return document.getElementById('mk-n').textContent === l.teil && document.getElementById('mk-p').textContent === fmt(l.vkCt); }, lid);
    if (!at) errs.push('Teil hinzufügen: Vorschau falsch');
    if (shotDir) await page.screenshot({ path: `${shotDir}/teil-neu-${w}.png` });
    await page.click('[data-act="teil-save"]');
    await page.waitForTimeout(120);
    const atN = await page.evaluate(([i, id]) => { const pk = auftrag(i.oid).pakete.find(p => p.id === i.pid); const x = pk.pos[pk.pos.length - 1];
      const r = { n: pk.pos.length, lid: x.lagerId, best: lagerT(id).bestand };
      pk.pos.pop(); lagerT(id).bestand += 1; save(); render(); return r; }, [ids, lid]);
    if (atN.n !== posVor + 1 || atN.lid !== lid || atN.best !== bestVor - 1) errs.push('Teil hinzufügen speichert falsch: ' + JSON.stringify(atN));
  }
  // E-Rechnung: Markierung nur für Firmenkunden über 250 € brutto
  const ere = await page.evaluate(() => { const a = S.auftraege[0], k = kunde(a.kundeId), alt = k.firma;
    const r = { auftragId: a.id, bruttoCt: 30000 };
    k.firma = ''; const privat = eReNoetig(r); k.firma = 'Test GmbH'; const firma = eReNoetig(r);
    const klein = eReNoetig({ auftragId: a.id, bruttoCt: 25000 }); k.firma = alt; return [privat, firma, klein].join(','); });
  if (ere !== 'false,true,false') errs.push('E-Rechnung-Markierung falsch: ' + ere);
  // Backup-Erinnerung: 8 Tage ohne Sicherung → Hinweis; „Jetzt sichern“ setzt zurück; „X“ pausiert 24 h
  const bkAlt = await page.evaluate(() => JSON.stringify(S.meta));
  await page.evaluate(() => { S.meta.lastBackup = Date.now() - 8 * 86400000; S.meta.changes = 0; delete S.meta.bkSnooze; S.settings.sync = S.settings.sync || {}; S.settings.sync.on = false; nav('planung'); });
  await page.waitForTimeout(100);
  if (!(await page.$('[data-act="bk-dismiss"]'))) errs.push('Backup-Erinnerung erscheint nicht nach 8 Tagen');
  await page.click('[data-act="bk-dismiss"]').catch(() => {});
  await page.waitForTimeout(80);
  if (await page.$('[data-act="bk-dismiss"]')) errs.push('Backup-Erinnerung lässt sich nicht ausblenden');
  await page.evaluate(() => { delete S.meta.bkSnooze; nav('mehr'); });
  await page.waitForTimeout(80);
  if (!(await page.$('.bk-card.due'))) errs.push('Mehr: Sicherungs-Karte fehlt');
  if (shotDir && w === 390) await page.screenshot({ path: `${shotDir}/backup-mehr.png` });
  await page.click('.bk-card [data-act="data-export"]').catch(() => errs.push('Mehr: Sichern-Knopf fehlt'));
  await page.waitForTimeout(150);
  const bkNach = await page.evaluate(() => ({ alt: Date.now() - S.meta.lastBackup, due: bkStatus().due }));
  if (bkNach.alt > 5000 || bkNach.due) errs.push('„Jetzt sichern“ setzt die Erinnerung nicht zurück: ' + JSON.stringify(bkNach));
  await page.evaluate(m => { S.meta = JSON.parse(m); save(); render(); }, bkAlt);
  // „Rückgängig“ statt Rückfrage: Position löschen → weg → Rückgängig → wieder da; nach anderer Änderung gesperrt
  {
    const u = await page.evaluate(() => { const a = S.auftraege.find(o => o.pakete.some(pk => pk.pos.length > 1)); const pk = a.pakete.find(p => p.pos.length > 1);
      nav('auftrag', a.id); return { oid: a.id, pid: pk.id, xid: pk.pos[0].id, n: pk.pos.length }; });
    const anz = () => page.evaluate(i => auftrag(i.oid).pakete.find(p => p.id === i.pid).pos.length, u);
    await page.evaluate(i => ACT['pos-del']({ dataset: { oid: i.oid, pid: i.pid, xid: i.xid } }), u);
    await page.waitForTimeout(100);
    if (await page.$('.confirm-bg')) errs.push('Position löschen fragt noch nach');
    if ((await anz()) !== u.n - 1) errs.push('Position löschen: nicht gelöscht');
    if (shotDir && w === 390) await page.screenshot({ path: `${shotDir}/rueckgaengig.png` });
    await page.click('.toast-undo button').catch(() => errs.push('Rückgängig-Knopf fehlt'));
    await page.waitForTimeout(100);
    if ((await anz()) !== u.n) errs.push('Rückgängig stellt die Position nicht wieder her');
    await page.evaluate(i => ACT['pos-del']({ dataset: { oid: i.oid, pid: i.pid, xid: i.xid } }), u);
    await page.evaluate(() => { S.settings.firma.tel = S.settings.firma.tel; save(); });
    await page.click('.toast-undo button').catch(() => {});
    await page.waitForTimeout(100);
    if ((await anz()) !== u.n - 1) errs.push('Rückgängig nach anderer Änderung nicht gesperrt');
    await page.evaluate(() => document.querySelectorAll('.toast').forEach(t => t.remove()));
  }
  // Barrierefreiheit Runde 2: Fokus ins Blatt, Labels verbunden, Esc schließt, Fokus zurück zum Auslöser
  await page.evaluate(() => nav('kunden'));
  await page.waitForTimeout(100);
  await page.focus('.fab[data-act="kunde-edit"]').catch(() => {});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const fo = await page.evaluate(() => ({ drin: !!document.activeElement.closest('#sheetbg'), dialog: !!document.querySelector('#sheetbg [role="dialog"][aria-modal="true"]'),
    label: (document.querySelector('label[for="ku-nn"]') || {}).textContent || '' }));
  if (!fo.drin || !fo.dialog) errs.push('Blatt: Fokus/Dialog fehlt ' + JSON.stringify(fo));
  if (!fo.label.includes('Nachname')) errs.push('Blatt: Label nicht mit Feld verbunden');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  const zu = await page.evaluate(() => ({ zu: !document.getElementById('sheetbg'), fokus: document.activeElement.dataset.act || document.activeElement.tagName }));
  if (!zu.zu || zu.fokus !== 'kunde-edit') errs.push('Esc/Fokus zurück falsch: ' + JSON.stringify(zu));
  // Bildschirm bleibt an: Stechuhr Start → Wake Lock angefordert, Pause → freigegeben (mit simuliertem navigator.wakeLock)
  {
    const wl = await page.evaluate(async () => {
      const log = { req: 0, rel: 0 };
      Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: async () => { log.req++; const l = new EventTarget(); l.release = async () => { log.rel++; l.dispatchEvent(new Event('release')); }; return l; } } });
      S.auftraege.forEach(a => { if (a.timerStart) { a.zeiten.push({ start: a.timerStart, end: Date.now() }); a.timerStart = null; } }); render();
      const a = S.auftraege[0]; ACT['timer-tog']({ dataset: { oid: a.id } }); await new Promise(r => setTimeout(r, 50));
      const an = log.req; ACT['timer-tog']({ dataset: { oid: a.id } }); await new Promise(r => setTimeout(r, 50));
      return { an, rel: log.rel };
    });
    if (wl.an !== 1 || wl.rel !== 1) errs.push('Bildschirm-an-Sperre falsch: ' + JSON.stringify(wl));
  }
  // Zahl am App-Symbol: aus → keine Zahl; einschalten → Zahl = neue Anfragen; ausschalten → Zahl weg
  {
    const bd = await page.evaluate(async () => {
      const log = []; navigator.setAppBadge = async n => log.push(n); navigator.clearAppBadge = async () => log.push(0);
      window.Notification = { permission: 'granted', requestPermission: async () => 'granted' };
      S.settings.badge = false; render(); const aus = log[log.length - 1];
      nav('einstellungen'); await new Promise(r => setTimeout(r, 50));
      const knopf = !!document.querySelector('[data-act="badge-tog"]');
      await ACT['badge-tog'](); const neu = (S.anfragen || []).filter(q => q.status === 'neu').length; const an = log[log.length - 1];
      await ACT['badge-tog'](); const wieder = log[log.length - 1];
      return { aus, knopf, an, neu, wieder };
    });
    if (bd.aus !== 0 || !bd.knopf || bd.an !== bd.neu || bd.wieder !== 0) errs.push('Zahl am App-Symbol falsch: ' + JSON.stringify(bd));
  }
  // Erinnerungen unterschreiben mit dem Werkstattnamen aus den Einstellungen
  {
    const gr = await page.evaluate(() => { const alt = S.settings.firma.name; S.settings.firma.name = 'Kfz Test Hanau';
      const f = S.fahrzeuge.find(x => kunde(x.kundeId)); const altHu = f.hu; const d = new Date(); d.setMonth(d.getMonth() + 1);
      f.hu = d.toISOString().slice(0, 7); const it = radarItems().find(r => r.key === 'hu:' + f.id);
      const kamp = kampFill(KAMP_TPL.hu, kunde(f.kundeId), f); f.hu = altHu; S.settings.firma.name = alt;
      return { radar: it ? it.msg.endsWith('Ihre Kfz Test Hanau') : 'kein HU-Eintrag', kamp: kamp.includes('Kfz Test Hanau') && !kamp.includes('{firma}') }; });
    if (gr.radar !== true || gr.kamp !== true) errs.push('Werkstattname in Erinnerung fehlt: ' + JSON.stringify(gr));
  }
  // Status an Kunden senden (Kundenportal Stufe A)
  {
    const sm = await page.evaluate(async () => {
      const a = S.auftraege.find(o => o.status === 'arbeit'), b = S.auftraege.find(o => o.status === 'fertig');
      const ma = statusMsg(a), mb = statusMsg(b);
      const k = kunde(a.kundeId), tel = k.tel; k.tel = ''; const vor = a.komm.length;
      nav('auftrag', a.id); await new Promise(r => setTimeout(r, 80));
      document.querySelector('[data-act="status-msg"]').click(); await new Promise(r => setTimeout(r, 80));
      const feld = !!document.getElementById('st-msg');
      document.querySelector('[data-act="status-send"]').click(); await new Promise(r => setTimeout(r, 80));
      const log = a.komm.length === vor + 1 && a.komm[a.komm.length - 1].txt.startsWith('Status gesendet');
      a.komm.pop(); k.tel = tel; save(); render();
      return { arbeit: ma.includes('arbeiten gerade') && ma.includes('Voraussichtlich fertig'), fertig: mb.includes('abgeholt werden'), feld, log };
    });
    if (!sm.arbeit || !sm.fertig || !sm.feld || !sm.log) errs.push('Status an Kunden senden: ' + JSON.stringify(sm));
  }
  // Statusseite per Link (Stufe B): Link anhängen, Seite zeigt Stand ohne Namen/Preise, Aktualisierung, Rückfall ohne Einrichtung
  {
    const sl = await page.evaluate(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms));
      const store = {}, calls = []; let einger = true; const of = window.fetch;
      window.fetch = async (u, o) => { const m = String(u).match(/\/rpc\/(\w+)$/); if (!m) return of(u, o);
        calls.push(m[1]); if (!einger) return new Response('{}', { status: 404 }); const b = JSON.parse(o.body);
        if (m[1] === 'status_put') { store[b.p_id] = b.p_data; return new Response(null, { status: 204 }); }
        if (m[1] === 'status_get') return new Response(JSON.stringify(store[b.p_id] || null), { status: 200 });
        return new Response('null', { status: 200 }); };
      const c = syncCfg(), alt = { ...c }; c.on = true; c.id = c.id || 'TESTCODE01';
      const a = S.auftraege.find(o => o.status === 'arbeit'), k = kunde(a.kundeId), tel = k.tel; k.tel = ''; delete a.statusLink; const vor = a.komm.length;
      nav('auftrag', a.id); await w(80);
      document.querySelector('[data-act="status-msg"]').click(); await w(80);
      const cb = !!document.getElementById('st-link');
      document.querySelector('[data-act="status-send"]').click(); await w(150);
      const linkImText = (a.komm[a.komm.length - 1].txt || '').includes('#/status/' + (a.statusLink || {}).id);
      const d = store[(a.statusLink || {}).id] || {};
      const sparsam = !!d.kz && !JSON.stringify(d).includes(k.name) && !('brutto' in d) && d.st === 'arbeit';
      route = { v: 'status', id: a.statusLink.id }; render(); await w(150);
      const seite = document.querySelector('.stl-st')?.textContent === 'In Arbeit' && !document.querySelector('.nav');
      a.status = 'fertig'; await statusLinksPush(); stView.id = null; render(); await w(150);
      const aktuell = document.querySelector('.stl-st')?.textContent === 'Fertig';
      route = { v: 'status', id: 'unbekannt' }; render(); await w(150);
      const weg = document.body.textContent.includes('Link nicht mehr gültig');
      // ohne Einrichtung (Funktion fehlt): Nachricht geht trotzdem raus, ohne Link
      einger = false; const b = S.auftraege.find(o => o !== a && o.status !== 'abgeholt'); delete b.statusLink; const vb = b.komm.length; const kb = kunde(b.kundeId), telb = kb.tel; kb.tel = '';
      nav('auftrag', b.id); await w(80); document.querySelector('[data-act="status-msg"]').click(); await w(80);
      document.querySelector('[data-act="status-send"]').click(); await w(150);
      const rueck = b.komm.length === vb + 1 && !b.statusLink && !b.komm[b.komm.length - 1].txt.includes('#/status/');
      a.komm.length = vor; b.komm.length = vb; kb.tel = telb; a.status = 'arbeit'; delete a.statusLink; k.tel = tel; Object.assign(c, alt);
      window.fetch = of; closeSheet(); nav('planung'); save(); await w(80);
      return { cb, linkImText, sparsam, seite, aktuell, weg, rueck };
    });
    if (Object.values(sl).some(v => !v)) errs.push('Statusseite per Link: ' + JSON.stringify(sl));
  }
  // Online-Terminbuchung kommt über Supabase in der Werkstatt an
  {
    const bk = await page.evaluate(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms));
      const keys = {}, box = []; let rid = 1; const of = window.fetch;
      window.fetch = async (u, o) => { const m = String(u).match(/\/rpc\/(\w+)$/); if (!m) return of(u, o); const b = JSON.parse(o.body);
        if (m[1] === 'buchung_an') { keys[b.p_buch_id] = b.p_info; return new Response(null, { status: 204 }); }
        if (m[1] === 'buchung_info') return new Response(JSON.stringify(keys[b.p_buch_id] || null), { status: 200 });
        if (m[1] === 'anfrage_neu') { if (!keys[b.p_buch_id]) return new Response('{}', { status: 400 }); box.push({ ...b.p_data, rid: rid++, ts: Date.now() }); return new Response(null, { status: 204 }); }
        if (m[1] === 'anfragen_holen') { const r = box.splice(0); return new Response(JSON.stringify(r), { status: 200 }); }
        return new Response('null', { status: 200 }); };
      const c = syncCfg(), alt = { ...c }, altBid = S.settings.buchId; c.on = true; c.id = c.id || 'TESTCODE01'; delete S.settings.buchId;
      await buchungAnmelden(); const bid = S.settings.buchId;
      const link = buchUrl().endsWith('#/buchen/' + bid);
      const vorher = S.anfragen.length;
      route = { v: 'buchen', id: bid }; render(); await w(150);
      const name = document.body.textContent.includes(S.settings.firma.name || '§');
      const set = (id, v) => { const e = document.getElementById(id); if (e) e.value = v; };
      set('bk-name', 'Test Kunde'); set('bk-tel', '0170 1234567'); set('bk-anl', 'Bremsen quietschen'); set('bk-kz', 'HU-XY 12');
      document.querySelector('[data-act="buchen-send"]').click(); await w(150);
      const pflicht = box.length === 0; /* ohne Kategorie, FIN/Foto und km nicht absendbar */
      const fz0 = S.fahrzeuge.find(f => f.vin && kunde(f.kundeId));
      document.querySelector('input[name="bk-kat"][value="beanst"]').checked = true; set('bk-fin', fz0.vin.toLowerCase()); set('bk-km', '88.000'); set('bk-mail', 'a@b.de');
      bkSlotsZeigen(); const sl0 = document.querySelector('.bk-slot'); if (sl0) sl0.click(); await w(50);
      document.querySelector('[data-act="buchen-send"]').click(); await w(150);
      const imPostfach = pflicht && box.length === 1 && S.anfragen.length === vorher;
      const n = await anfragenHolen();
      const q = S.anfragen[S.anfragen.length - 1];
      const an = n === 1 && S.anfragen.length === vorher + 1 && q.name === 'Test Kunde' && q.status === 'neu' && q.kanal === 'web';
      const bestand = q.fzgId === fz0.id && q.kundeId === fz0.kundeId && q.km === 88000 && q.kat === 'Problem / Reparatur' && /Bestandskunde/.test(q.notiz);
      S.anfragen.length = vorher; Object.assign(c, alt); if (altBid) S.settings.buchId = altBid; else delete S.settings.buchId;
      window.fetch = of; nav('planung'); save(); await w(80);
      return { link, name, imPostfach, an, bestand };
    });
    if (Object.values(bk).some(v => !v)) errs.push('Online-Terminbuchung: ' + JSON.stringify(bk));
  }
  // E-Rechnung (XRechnung CII): Pflichtangaben-Prüfung, Summen stimmen, Knopf in Finanzen
  {
    const er = await page.evaluate(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms));
      const fi = S.settings.firma, altFi = { ...fi };
      const a = S.auftraege.find(o => o.pakete.some(pk => pk.pos.some(p => posNetto(p) > 0)));
      const k = kunde(a.kundeId), altK = { ...k };
      Object.assign(fi, { name: 'Testwerkstatt', adresse: 'Hauptstr. 5, 63450 Hanau', ustid: 'DE123456789', iban: 'DE89 3704 0044 0532 0130 00', email: 'w@test.de', tel: '06181 1' });
      Object.assign(k, { firma: 'Test GmbH', name: 'Test GmbH', adresse: 'Industriestr. 2, 60311 Frankfurt', email: '' });
      const paks = a.pakete.filter(pk => pk.pos.some(p => posNetto(p) > 0)); const pos = rePosSnap(paks);
      const zeilen = pos.reduce((x, p) => x + p.nettoCt, 0), netto = zeilen - 500, mwst = Math.round(netto * 0.19);
      const r = { id: 'rTEST', nr: 'RE-TEST-0001', auftragId: a.id, datum: todayISO(), nettoCt: netto, mwstCt: mwst, bruttoCt: netto + mwst, pos, anzCt: 1000, mwstSatz: 19 };
      S.rechnungen.push(r);
      const fehltMail = eRechDaten(r).fehl.some(f => f.includes('E-Mail des Kunden'));
      k.email = 'buch@test.de';
      const ok = eRechDaten(r).fehl.length === 0;
      const doc = new DOMParser().parseFromString(xrechnungXml(r), 'application/xml');
      const wohl = !doc.querySelector('parsererror');
      const t = n => [...doc.getElementsByTagName('ram:' + n)].map(e => e.textContent);
      const c = n => Math.round(parseFloat(t(n).slice(-1)[0]) * 100);
      const zs = t('LineTotalAmount').slice(0, -1).reduce((x, v) => x + Math.round(parseFloat(v) * 100), 0);
      const summen = zs === c('LineTotalAmount') && c('LineTotalAmount') - c('AllowanceTotalAmount') === c('TaxBasisTotalAmount')
        && c('TaxBasisTotalAmount') + c('TaxTotalAmount') === c('GrandTotalAmount') && c('GrandTotalAmount') - c('TotalPrepaidAmount') === c('DuePayableAmount');
      const pflicht = ['BuyerReference', 'IBANID', 'DueDateDateTime', 'PostcodeCode'].every(n => t(n).length) && t('ID').some(v => v.includes('xrechnung_3.0'));
      nav('finanzen'); await w(100);
      const knopf = !!document.querySelector('[data-act="erech"][data-id="rTEST"]');
      document.querySelector('[data-act="erech"][data-id="rTEST"]')?.click(); await w(80);
      const blatt = !!document.querySelector('[data-act="erech-xml"]:not([disabled])');
      closeSheet(); S.rechnungen = S.rechnungen.filter(x => x.id !== 'rTEST'); Object.assign(fi, altFi); Object.keys(k).forEach(x => delete k[x]); Object.assign(k, altK); save(); nav('planung'); await w(60);
      return { fehltMail, ok, wohl, summen, pflicht, knopf, blatt };
    });
    if (Object.values(er).some(v => !v)) errs.push('E-Rechnung: ' + JSON.stringify(er));
  }
  // Kalkulation: VK-Vorschlag aus Aufschlag-Staffel
  {
    const ka = await page.evaluate(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms));
      const formel = vkVorschlag(1200) === 2190 && vkVorschlag(8000) === 11990 && vkVorschlag(0) === 0;
      const a = S.auftraege.find(o => o.pakete.length), pk = a.pakete[0];
      nav('auftrag', a.id); await w(80);
      ACT['add-teil']({ dataset: { oid: a.id, pid: pk.id } }); await w(80);
      const ek = document.getElementById('pt-ek'), vk = document.getElementById('pt-vk');
      ek.value = '12,00'; ek.dispatchEvent(new Event('input', { bubbles: true })); await w(30);
      const auto = parseEuro(vk.value) === 2190;
      vk.value = '30,00'; vk.dispatchEvent(new Event('input', { bubbles: true }));
      ek.value = '15,00'; ek.dispatchEvent(new Event('input', { bubbles: true })); await w(30);
      const hand = parseEuro(vk.value) === 3000 && /Vorschlag/.test(document.getElementById('pt-vk-hint').textContent);
      closeSheet(); nav('einstellungen'); await w(80);
      const einst = document.querySelectorAll('[data-f="auf-pct"]').length === 4;
      nav('planung'); await w(40);
      return { formel, auto, hand, einst };
    });
    if (Object.values(ka).some(v => !v)) errs.push('Aufschlag-Staffel: ' + JSON.stringify(ka));
  }
  // Positionen als Tabelle: echte Tastatur (Tab/Enter), neue Zeilen, Automatik für Preise
  {
    const prep = await page.evaluate(async () => {
      const a = S.auftraege.find(o => o.pakete.length && !o.pakete[0].abger && !o.sig && !o.freigabe) || S.auftraege.find(o => o.pakete.length && !o.pakete[0].abger);
      const pk = a.pakete[0]; pk.entsperrt = false; calcMode[a.id] = 'tab'; nav('auftrag', a.id); await new Promise(r => setTimeout(r, 120));
      const sec = document.querySelector('.kt'); if (sec) sec.scrollIntoView();
      return { oid: a.id, pid: pk.id, n: pk.pos.length, satz: a.awCt || S.settings.awCt, tab: !!document.querySelector('tr[data-new="' + pk.id + '"]') };
    });
    let kt = { tab: prep.tab };
    if (prep.tab) {
      const sel = k => `tr[data-new="${prep.pid}"] .kt-in[data-k="${k}"]`;
      await page.click(sel('bez')); await page.keyboard.type('Testarbeit Tabelle');
      const w = () => page.waitForTimeout(120);
      await page.keyboard.press('Tab'); await w(); await page.keyboard.press('Tab'); await w(); await page.keyboard.type('1.5'); await page.keyboard.press('Tab'); await page.waitForTimeout(200);
      Object.assign(kt, await page.evaluate(({ pid, satz }) => { const pk = auftrag(route.id).pakete.find(p => p.id === pid); const x = pk.pos.find(p => p.bez === 'Testarbeit Tabelle');
        return { arbeit: !!x && x.typ === 'arbeit' && x.aw === 1.5 && x.vkCt === Math.round(1.5 * satz), fokus: document.activeElement && document.activeElement.dataset.k === 'vk' && document.activeElement.dataset.xid === (x || {}).id }; }, prep));
      await page.selectOption(`tr[data-new="${prep.pid}"] .kt-typ`, 'teil');
      await page.click(sel('bez')); await page.keyboard.type('Testteil Tabelle');
      await page.click(sel('ek')); await w(); await page.keyboard.type('10,00'); await page.keyboard.press('Tab'); await page.waitForTimeout(200);
      Object.assign(kt, await page.evaluate(({ pid }) => { const pk = auftrag(route.id).pakete.find(p => p.id === pid); const x = pk.pos.find(p => p.bez === 'Testteil Tabelle');
        return { teil: !!x && x.typ === 'teil' && x.ekCt === 1000 && x.vkCt === vkVorschlag(1000) }; }, prep));
      kt.typMerk = await page.evaluate(({ pid }) => document.querySelector(`tr[data-new="${pid}"] .kt-typ`).value === 'teil', prep);
      const ersteVk = `.kt[data-pid="${prep.pid}"] tbody tr[data-xid] .kt-in[data-k="vk"]`;
      await page.click(ersteVk); await page.keyboard.press('Enter'); await page.waitForTimeout(50);
      kt.enter = await page.evaluate(sel0 => { const all = [...document.querySelectorAll(sel0)]; return document.activeElement === all[1]; }, ersteVk);
      kt.summe = await page.evaluate(() => /Brutto/.test(document.querySelector('.kt-tot').textContent));
      await page.evaluate(({ pid }) => { const a = auftrag(route.id), pk = a.pakete.find(p => p.id === pid); pk.pos = pk.pos.filter(p => !/Tabelle$/.test(p.bez)); delete ktNeuTyp[pid]; calcMode[a.id] = 'tab'; save(); nav('planung'); }, prep);
    }
    if (Object.values(kt).some(v => !v)) errs.push('Tabelle: ' + JSON.stringify(kt));
  }
  // Kleinmaterial-Pauschale (5 % vom Lohn, 5–25 €) und Rabatt-Spalte
  {
    const km = await page.evaluate(async () => {
      const a = S.auftraege.find(o => o.pakete.length && !o.pakete[0].abger && !o.sig && !o.freigabe && o.status !== 'abgeholt');
      if (!a) return { auftrag: false };
      const pk = a.pakete[0], alt = JSON.parse(JSON.stringify(a.pakete)), altAus = a.kmAus;
      a.kmAus = false; pk.entsperrt = false;
      a.pakete.forEach(p => { if (!p.abger) p.pos = []; });
      pk.pos.push({ id: 'xkm1', nr: 99, created: Date.now(), typ: 'arbeit', bez: 'Testlohn', menge: 1, aw: 10, ekCt: 0, vkCt: 100000, best: null, eta: null, lagerId: null, ext: false });
      save();
      const pauschale = () => a.pakete.flatMap(p => p.pos).filter(p => p.auto === 'km');
      const r = { hoch: pauschale().length === 1 && pauschale()[0].vkCt === 2500 };
      pk.pos[0].vkCt = 4000; save(); r.niedrig = pauschale()[0].vkCt === 500;
      pk.pos[0].vkCt = 20000; save(); r.mitte = pauschale()[0].vkCt === 1000;
      calcMode[a.id] = 'tab'; nav('auftrag', a.id); await new Promise(r => setTimeout(r, 120));
      r.zeile = !!document.querySelector('tr.kt-auto');
      const inp = document.querySelector('.kt-in[data-k="rab"][data-xid="xkm1"]');
      r.rabFeld = !!inp;
      if (inp) { inp.value = '10 %'; inp.dispatchEvent(new Event('change', { bubbles: true })); await new Promise(r => setTimeout(r, 120)); }
      const x = pk.pos.find(p => p.id === 'xkm1');
      r.rabatt = !!x && posNetto(x) === 18000 && pauschale()[0].vkCt === 900;
      document.querySelector('tr.kt-auto .kt-del').click(); await new Promise(r => setTimeout(r, 120));
      r.aus = a.kmAus === true && pauschale().length === 0 && !document.querySelector('tr.kt-auto');
      a.pakete = alt; a.kmAus = altAus; save(); nav('planung');
      return r;
    });
    if (Object.values(km).some(v => !v)) errs.push('Kleinmaterial: ' + JSON.stringify(km));
  }
  // Werkstattbericht: Beanstandung → Diagnose (+ Prüfung) → Befund → Abhilfe; Freigabe-Hinweis + Überschreitung
  {
    const wb = await page.evaluate(async () => {
      const a = S.auftraege.find(o => o.pakete.length && !o.pakete[0].abger && o.status !== 'abgeholt'); if (!a) return { auftrag: false };
      const pk = a.pakete[0], alt = JSON.parse(JSON.stringify(pk)); pk.entsperrt = true; pk.klass = 'tb';
      const w = () => new Promise(r => setTimeout(r, 120));
      delete calcMode[a.id]; pakOpen[a.id] = new Set([pk.id]); nav('kalk', a.id); await w();
      const r = { bericht: !!document.querySelector('.kalk-voll .wb-pk.open'), reihenfolge: [...document.querySelectorAll('.wb-pk.open .wb-h > span:first-child')].map(e => e.textContent).join() === 'Beanstandung,Diagnose,Befund,Abhilfe,Hinweise',
        keinWischen: document.documentElement.scrollWidth <= innerWidth + 1 };
      document.querySelector('[data-act="wb-text"][data-f="problem"]').click(); await w();
      document.getElementById('wb-t').value = 'MKL leuchtet'; document.querySelector('[data-act="wb-text-ok"]').click(); await w();
      document.querySelector('[data-act="wb-text"][data-f="pruefung"]').click(); await w();
      document.getElementById('wb-t').value = 'P0302'; document.querySelector('[data-act="wb-text-ok"]').click(); await w();
      r.texte = pk.problem === 'MKL leuchtet' && pk.pruefung === 'P0302' && !!document.querySelector('.wb-sub .wb-txt');
      document.querySelector('[data-act="ls-kat"][data-ph="diag"]').click(); await w();
      const q = document.getElementById('ls-q'); q.value = 'Zzz Diagnose'; q.dispatchEvent(new Event('input'));
      r.eigen = document.querySelector('[data-act="ls-eigen"]').dataset.bez === 'Zzz Diagnose';
      document.querySelector('[data-act="ls-eigen"]').click(); await w();
      r.phaseVor = document.getElementById('ps-ph').value === 'diag';
      document.getElementById('ps-aw').value = '2'; document.getElementById('ps-aw').dispatchEvent(new Event('input')); document.getElementById('ps-vk').value = '250,00';
      document.querySelector('[data-act="pos-save"]').click(); await w();
      const x = pk.pos.find(p => p.bez === 'Zzz Diagnose'); r.diagPos = !!x && x.phase === 'diag' && wbDiag(pk).includes(x);
      document.querySelector('[data-act="frei-set"][data-ph="diag"]').click(); await w();
      document.getElementById('fr-ct').value = '200,00'; document.querySelector('[data-act="frei-ok"]').click(); await w(); await w();
      r.meldung = !!document.querySelector('#sheetbg .wb-warn');
      const ok = [...document.querySelectorAll('[data-act="rahmen-ok"]')].pop(); if (ok) ok.click(); await w(); await w();
      r.hinweis = !document.querySelector('#sheetbg') && !!document.querySelector('.wb-chip-ueber') && /50 €/.test(document.querySelector('.wb-chip-ueber').textContent);
      const p = document.querySelector('.wb-pos[data-act="pos-edit"]'); if (p) { p.click(); await w(); } r.details = !!document.getElementById('ps-b') || !!document.getElementById('bf-b'); closeSheet();
      Object.keys(pk).forEach(k => delete pk[k]); Object.assign(pk, alt); save(); nav('planung'); return r;
    });
    if (Object.values(wb).some(v => !v)) errs.push('Bericht: ' + JSON.stringify(wb));
  }
  // Auswahl: Summe Diagnose, ↑↓, verschieben, RKZ, löschen + Rückgängig
  {
    const au = await page.evaluate(async () => {
      const a = S.auftraege.find(o => o.pakete.length && !o.pakete[0].abger && o.status !== 'abgeholt'); if (!a) return { auftrag: false };
      const snap = JSON.stringify(S.auftraege); const pk = a.pakete[0]; pk.entsperrt = true; pk.klass = 'tb';
      const w = () => new Promise(r => setTimeout(r, 100));
      const P = o => Object.assign({ id: 'x' + uid(), nr: 90, created: Date.now(), menge: 1, ekCt: 0, vkCt: 0, aw: 0, rab: null, ext: false, best: null, eta: null, lagerId: null }, o);
      const d1 = P({ typ: 'arbeit', bez: 'D1', vkCt: 10000, phase: 'diag' }), d2 = P({ typ: 'arbeit', bez: 'D2', vkCt: 5000, phase: 'diag' }), a1 = P({ typ: 'arbeit', bez: 'A1', vkCt: 7000 });
      pk.pos = [d1, a1, d2]; a.kmAus = true; delete calcMode[a.id]; pakOpen[a.id] = new Set([pk.id]); nav('kalk', a.id); await w();
      const r = { summe: [...document.querySelectorAll('.wb-zs')].some(e => /Summe Diagnose/.test(e.textContent) && /150/.test(e.textContent)) };
      document.querySelector('[data-act="wb-sel"]').click(); await w();
      document.querySelector('[data-act="wb-pick"][data-xid="' + d2.id + '"]').click(); await w();
      document.querySelector('[data-act="wb-mv"][data-dir="-1"]').click(); await w();
      r.hoch = pk.pos.map(x => x.bez).join() === 'D2,A1,D1';
      document.querySelector('[data-act="wb-pick"][data-xid="' + a1.id + '"]').click(); await w();
      document.querySelector('[data-act="wb-rkz"]').click(); await w(); document.getElementById('rk-z').value = 'gar'; document.querySelector('[data-act="wb-rkz-ok"]').click(); await w();
      r.rkz = pk.pos.filter(x => x.zahler === 'gar').length === 2;
      document.querySelector('[data-act="wb-move"]').click(); await w(); document.getElementById('mv-ph').value = 'abh'; document.querySelector('[data-act="wb-move-ok"]').click(); await w();
      r.verschoben = wbDiag(pk).length === 1 && wbAbh(pk).length === 2;
      document.querySelector('[data-act="wb-del"]').click(); await w();
      r.geloescht = pk.pos.length === 1;
      const u = document.querySelector('.toast-undo button'); if (u) u.click(); await w();
      r.rueckgaengig = auftrag(a.id).pakete[0].pos.length === 3;
      S.auftraege = JSON.parse(snap); wbSel.oid = null; save(); nav('planung'); return r;
    });
    if (Object.values(au).some(v => !v)) errs.push('Auswahl: ' + JSON.stringify(au));
  }
  // Fahrzeugannahme: ✓/✗, Foto über Datei-Knopf, Pflicht 4 Seiten + Unterschrift, ✗ → technische Beanstandung, Überspringen → roter Hinweis
  {
    const snapA = await page.evaluate(() => JSON.stringify(S.auftraege));
    const oid = await page.evaluate(async () => { const a = S.auftraege.find(o => o.status !== 'abgeholt'); delete a.dlg; nav('auftrag', a.id); await new Promise(r => setTimeout(r, 100)); return a.id; });
    const an = { karte: await page.evaluate(() => !!document.querySelector('.dl-card.start')) };
    await page.click('.dl-card.start'); await page.waitForTimeout(150);
    an.ansicht = await page.evaluate(() => route.v === 'annahme' && document.querySelectorAll('.dl-it').length > 30 && !!document.querySelector('.dl-ta').value.length >= 0);
    await page.click('[data-act="dlg-v"][data-i="bb-h"][data-v="0"]'); await page.waitForTimeout(80);
    await page.click('[data-act="dlg-v"][data-i="oel"][data-v="1"]'); await page.waitForTimeout(80);
    await page.fill('.dl-note[data-i="bb-h"]', '2 mm'); await page.press('.dl-note[data-i="bb-h"]', 'Tab'); await page.waitForTimeout(80);
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR4nGP8z8Dwn4GBgYGJAQoAHxcCAqqGq6MAAAAASUVORK5CYII=', 'base64');
    await page.evaluate(() => { photoTarget = { oid: route.id, pid: null, dlg: 'f4:vorne' }; });
    await page.setInputFiles('#photoinp', { name: 'v.png', mimeType: 'image/png', buffer: png }); await page.waitForTimeout(600);
    an.foto = await page.evaluate(() => !!auftrag(route.id).dlg.f4.vorne && !!document.querySelector('.dl-f4i.da img'));
    await page.evaluate(() => ACT['dlg-fertig']({ dataset: { oid: route.id } })); await page.waitForTimeout(80);
    an.pflicht = await page.evaluate(() => route.v === 'annahme' && !auftrag(route.id).dlg.done);
    await page.evaluate(() => { const a = auftrag(route.id); ['hinten', 'links', 'rechts'].forEach(k => { const id = 'fo' + uid(); a.fotos.push({ id, paketId: null, label: 'x', data: 'data:image/png;base64,' }); dlgFotoZiel(a, { dlg: 'f4:' + k }, id); }); a.dlg.sig = 'data:image/png;base64,'; a.dlg.txt = 'MKL leuchtet'; a.dlg.frei = 50000; a.dlg.zus.batt = true; save(); render(); });
    await page.evaluate(() => ACT['dlg-fertig']({ dataset: { oid: route.id } })); await page.waitForTimeout(80);
    const ok = await page.$('.confirm-bg [data-c="1"]'); if (ok) await ok.click(); await page.waitForTimeout(200);
    Object.assign(an, await page.evaluate(oid => { const a = auftrag(oid), cp = a.pakete.find(p => p.dlgCheck), tb = a.pakete.find(p => p.klass === 'tb' && !p.dlgCheck);
      return { fertig: !!a.dlg.done && route.v === 'auftrag', beanstandung: !!cp && cp.pos.length === 1 && cp.pos[0].typ === 'befund' && cp.pos[0].bez === 'Bremsbeläge hinten nicht in Ordnung – 2 mm',
        keinePreise: !!cp && !cp.pos.some(x => x.typ === 'arbeit' || x.typ === 'teil'), problem: !!tb && tb.problem === 'MKL leuchtet' && tb.frei && tb.frei.diag.ct === 50000 && a.pakete.some(p => p.klass === 'zl' && p.name === 'Batterietest' && !p.pos.length), karteOk: !!document.querySelector('.dl-card.ok'), druck: (() => { const h = dlgDruckHtml(a); return /Prüfprotokoll/.test(h) && /Bremsbeläge hinten/.test(h) && /n\.i\.O\./.test(h) && /2 mm/.test(h); })() }; }, oid));
    await page.evaluate(oid => { const a = auftrag(oid); a.dlg = { skip: Date.now(), chk: {}, f4: {}, zus: {} }; save(); render(); }, oid);
    an.rot = await page.evaluate(() => !!document.querySelector('.dl-card.rot'));
    await page.evaluate(s => { S.auftraege = JSON.parse(s); save(); nav('planung'); }, snapA);
    if (Object.values(an).some(v => !v)) errs.push('Annahme: ' + JSON.stringify(an));
  }
  // KP3 Teil 2: eine Rad-Position + Abschluss-Liste, Probefahrt, Service-Reset + nächster Service, Fehlerspeicher
  {
    const k4 = await page.evaluate(async () => {
      const snap = JSON.stringify(S.auftraege), w = ms => new Promise(r => setTimeout(r, ms || 120));
      const a = S.auftraege.find(o => o.pakete.length && !o.pakete[0].abger && o.status !== 'abgeholt'); const pk = a.pakete[0]; pk.entsperrt = true;
      a.pakete.forEach(p => p.pos = p.pos.filter(x => spezOf(x) !== 'rad'));
      nav('kalk', a.id); await w();
      posSheet(a, pk, null, 'Räderwechsel'); await w(80); document.getElementById('ps-vk').value = '40,00'; document.querySelector('[data-act="pos-save"]').click(); await w(300);
      const rad = pk.pos.find(x => spezOf(x) === 'rad'); const r = { umbenannt: !!rad && rad.bez === 'Räder komplett ab- und anmontieren' };
      posSheet(a, pk, null, 'Reifenwechsel'); await w(80); document.querySelector('[data-act="pos-save"]').click(); await w(300);
      r.nurEine = a.pakete.flatMap(p => p.pos).filter(x => spezOf(x) === 'rad').length === 1;
      posSheet(a, pk, rad); await w(80); r.liste = !!document.querySelector('[data-act="spz-ein"]');
      document.querySelector('[data-act="spz-ein"][data-v="1"]').click(); await w(200);
      r.einlagern = !!pk.pos.find(p => p.bez === 'Räder einlagern' && p.vkCt === 0) && rad.spz.einlagern === true; closeSheet();
      const wart = { id: 'xw', nr: 95, created: Date.now(), typ: 'arbeit', bez: 'Inspektion nach Herstellervorgabe', menge: 1, aw: 1, ekCt: 0, vkCt: 10000, rab: null, ext: false };
      const pf = { id: 'xp', nr: 94, created: Date.now(), typ: 'arbeit', bez: 'Probefahrt durchführen', menge: 1, aw: 0.3, ekCt: 0, vkCt: 3000, rab: null, ext: false };
      pk.pos.push(wart, pf); save(); render();
      { const of = spezOffen(a).join('|'); r.offen = /Drehmoment/.test(of) && /RDKS/.test(of) && /Service-Reset/.test(of) && /Probefahrt/.test(of) && !/einlagern/.test(of); }
      posSheet(a, pk, wart); await w(80); const cb = document.querySelector('input[data-k="reset"]'); cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true }));
      const nd = document.querySelector('input[data-k="nDat"]'); nd.value = '2027-10-19'; nd.dispatchEvent(new Event('change', { bubbles: true })); await w(80);
      r.service = wart.spz.reset === true && (fzg(a.fzgId).naechsterService || {}).datum === '2027-10-19'; closeSheet();
      posSheet(a, pk, pf); await w(80); const ke = document.querySelector('input[data-k="kmEnde"]'); ke.value = '87460'; ke.dispatchEvent(new Event('change', { bubbles: true })); await w(80);
      r.probefahrt = pf.spz.kmEnde === 87460; closeSheet(); render(); await w();
      r.fs = !!document.querySelector('.fs-box input[data-f="fs-del"]');
      a.status = 'arbeit'; ACT['ord-status']({ dataset: { oid: a.id, v: 'fertig' } }); await w(350);
      r.erinnerung = /Drehmoment/.test((document.querySelector('.confirm-bg') || {}).textContent || ''); document.querySelectorAll('.confirm-bg').forEach(c => c.remove()); closeSheet();
      S.auftraege = JSON.parse(snap); save(); nav('planung'); return r; });
    if (Object.values(k4).some(v => !v)) errs.push('KP3 Teil 2: ' + JSON.stringify(k4));
  }
  // Teile & Bestellung: Lager-Prüfung, „muss bestellt werden“, Rückfrage beim Verlassen, Bestellung, Wareneingang → „Teile da“
  {
    const tl = await page.evaluate(async () => {
      const snap = JSON.stringify({ a: S.auftraege, b: S.bestellungen, l: S.lager }), w = ms => new Promise(r => setTimeout(r, ms || 120));
      const a = S.auftraege.find(o => o.pakete.length && !o.pakete[0].abger && o.status !== 'abgeholt'); a.status = 'arbeit'; const pk = a.pakete[0]; pk.entsperrt = true;
      a.pakete.forEach(p => p.pos.forEach(x => { if (x.typ === 'teil' && ['inbest', 'bestellt'].includes(x.best)) x.best = 'lager'; }));
      const l = S.lager[0]; l.bestand = 5; l.artnr = 'AB 123';
      nav('auftrag', a.id); await w();
      ACT['add-teil']({ dataset: { oid: a.id, pid: pk.id } }); await w(); document.getElementById('pt-b').value = 'Testteil'; document.getElementById('pt-nr').value = 'AB123'; document.getElementById('pt-nr').dispatchEvent(new Event('change'));
      document.querySelector('[data-act="teil-save"]').click(); await w();
      const nx = pk.pos[pk.pos.length - 1]; const r = { imHaus: nx.typ === 'teil' && nx.best === 'lager' && nx.lagerId === l.id && nx.artnr === 'AB123' && l.bestand === 4 };
      ACT['add-teil']({ dataset: { oid: a.id, pid: pk.id } }); await w(); document.getElementById('pt-b').value = 'Sonderteil XY'; document.querySelector('[data-act="teil-save"]').click(); await w();
      const sx = pk.pos.find(x => x.bez === 'Sonderteil XY'); r.mussBestellt = !!sx && sx.best === 'inbest' && !!document.querySelector('.dl-card.tlb');
      ACT.back(); await w(); r.rueckfrage = route.v === 'auftrag' && !!document.querySelector('[data-act="tl-best-ok"]');
      document.querySelector('[data-act="tl-best-ok"]').click(); await w();
      const b = S.bestellungen.find(x => x.auftragId === a.id); r.bestellt = !!b && sx.best === 'bestellt' && a.status === 'teile';
      nav('bestellungen'); await w(); const btn = document.querySelector('[data-act="be-pos-in"][data-bid="' + (b || {}).id + '"]'); if (btn) btn.click(); await w(500);
      r.teileDa = sx.best === 'da' && a.status === 'teileda' && l.bestand === 4;
      const o = JSON.parse(snap); S.auftraege = o.a; S.bestellungen = o.b; S.lager = o.l; save(); nav('planung'); return r; });
    if (Object.values(tl).some(v => !v)) errs.push('Teile: ' + JSON.stringify(tl));
  }
  // Freigabe-Link: Projektcode im Link (nur *.supabase.co), Antwort des Kunden wird eingetragen, Ablehnung beim nächsten Besuch
  {
    const fr = await page.evaluate(async () => {
      const snap = JSON.stringify(S.auftraege), syncAlt = JSON.stringify(S.settings.sync || null), hashAlt = location.hash;
      const c = syncCfg(); c.url = 'https://abcdefgh.supabase.co'; c.key = 'sb_publishable_X';
      const code = pubCfgCode(); location.hash = '#/status/0123456789abcdef0123456789/' + code; await new Promise(r => setTimeout(r, 50));
      const r = { link: !!pubCfgAusHash() && pubCfgAusHash().url === 'https://abcdefgh.supabase.co' };
      const boese = btoa(JSON.stringify(['https://boese.example.com', 'x'])); location.hash = '#/status/0123456789abcdef0123456789/' + boese; await new Promise(r => setTimeout(r, 50));
      r.nurSupabase = pubCfgAusHash() === null;
      history.replaceState(null, '', hashAlt || '#/planung'); nav('planung');
      const a = S.auftraege.find(o => o.pakete.length && !o.pakete[0].abger && o.status !== 'abgeholt'); a.freigabe = null; a.sig = null; a.statusLink = { id: 'sl' + uid() };
      const pk = a.pakete[0]; pk.frei = {}; pk.freiAnfrage = { id: 'f1', ts: Date.now() - 4 * 3600000, ct: 10000, status: 'offen', daten: {} };
      r.nachhaken = /nachhaken/.test(pkFreiTxt(a, pk));
      freigabeAntwort({ sl: a.statusLink.id, fid: 'f1', antwort: 'nein' });
      r.abgelehnt = pk.freiAnfrage.status === 'nein' && (fzg(a.fzgId).abgelehnt || []).some(x => x.auftragId === a.id);
      const b2 = S.auftraege.find(o => o.id !== a.id && o.status !== 'abgeholt'); const fAlt = b2.fzgId; b2.fzgId = a.fzgId; nav('auftrag', b2.id); await new Promise(r => setTimeout(r, 100));
      r.naechsterBesuch = !!document.querySelector('.dl-card.abg'); b2.fzgId = fAlt;
      S.auftraege = JSON.parse(snap); S.settings.sync = JSON.parse(syncAlt) || undefined; if (!S.settings.sync) delete S.settings.sync; const f = fzg(a.fzgId); if (f) delete f.abgelehnt; save(); nav('planung'); return r; });
    if (Object.values(fr).some(v => !v)) errs.push('Freigabe-Link: ' + JSON.stringify(fr));
  }
  // KP1 Termine: Anfrage → Termin bestätigen → Nachricht; fällige Erinnerung 3/1 Tage
  {
    const tm = await page.evaluate(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms || 120)), snap = JSON.stringify({ q: S.anfragen, t: S.termine || [] });
      const x = anfrageAusBuchung({ name: 'Eva Test', tel: '0170 5551234', anl: 'Ölwechsel', kat: 'wartung', km: 50000, fin: '', dat: addDays(todayISO(), 3), uhr: '10:00' }); S.anfragen.push(x);
      nav('anfrage', x.id); await w();
      const knopf = document.querySelector('[data-act="anf-termin"]'); const r = { knopf: !!knopf };
      if (knopf) { knopf.click(); await w(); document.querySelector('[data-act="anf-termin-ok"]').click(); await w(); }
      const t = (S.termine || []).find(y => y.anfrageId === x.id);
      r.termin = !!t && t.datum === addDays(todayISO(), 3) && t.von === '10:00' && x.status === 'termin';
      r.ohneMailAnruf = !!document.querySelector('#sheetbg a[href^="tel:"]') && /bestätigen Ihren Termin/.test((document.getElementById('tn-t') || {}).value || '');
      document.querySelector('#sheetbg [data-w="erl"]').click(); await w();
      r.bestaetigt = !!(t && t.bestaetigt);
      r.faellig = erinnFaellig().some(f => f.t.id === t.id && f.n === 3);
      nav('planung'); await w(); r.karte = !!document.querySelector('.tn-karte [data-act="tn-erinn"]');
      ACT['tn-erinn']({ dataset: { id: t.id, n: '3' } }); await w(); document.querySelector('#sheetbg [data-w="erl"]').click(); await w();
      r.erledigt = !erinnFaellig().some(f => f.t.id === t.id);
      const o = JSON.parse(snap); S.anfragen = o.q; S.termine = o.t; save(); nav('planung'); return r; });
    if (Object.values(tm).some(v => !v)) errs.push('Termine: ' + JSON.stringify(tm));
  }
  // KP1 Slots: Öffnungszeiten, belegte Zeiten nicht buchbar, „Auto dauert länger“ blockiert
  {
    const sl = await page.evaluate(async () => {
      const w = ms => new Promise(r => setTimeout(r, ms || 120)), snapT = JSON.stringify(S.termine || []), snapA = JSON.stringify(S.auftraege);
      const oe = { tage: [1, 2, 3, 4, 5, 6, 7], von: '08:00', bis: '12:00', slot: 60 }, d = addDays(todayISO(), 5);
      const r = { frei: freieSlots(d, oe, []).join() === '08:00,09:00,10:00,11:00', belegt: freieSlots(d, oe, [[d, '09:00', '10:30']]).join() === '08:00,11:00' };
      r.wochenende = freieSlots(d, { ...oe, tage: [] }, []).length === 0;
      const a = S.auftraege.find(o => o.status !== 'abgeholt'); S.settings.oeffnung = { tage: [1, 2, 3, 4, 5, 6, 7], von: '08:00', bis: '17:00', slot: 60 };
      nav('auftrag', a.id); await w(); ACT['blk-auftrag']({ dataset: { oid: a.id } }); await w(); document.getElementById('bl-d').value = addDays(todayISO(), 2); document.getElementById('bl-u').value = '12:00';
      document.querySelector('[data-act="blk-auftrag-ok"]').click(); await w();
      const bl = (S.termine || []).filter(t => t.typ === 'block' && t.auftragId === a.id);
      r.blockiert = bl.length >= 2 && a.abgabe === addDays(todayISO(), 2) && freieSlots(addDays(todayISO(), 1), S.settings.oeffnung, belegtListe()).length === 0 && freieSlots(addDays(todayISO(), 2), S.settings.oeffnung, belegtListe())[0] === '12:00';
      S.termine = JSON.parse(snapT); S.auftraege = JSON.parse(snapA); save(); nav('planung'); return r; });
    if (Object.values(sl).some(v => !v)) errs.push('Slots: ' + JSON.stringify(sl));
  }
  // Zielpreis rückwärts + Mindestmarge
  {
    const zp = await page.evaluate(async () => {
      const snap = JSON.stringify(S.auftraege), mm = S.settings.minMarge; const a = S.auftraege.find(o => o.pakete.length && !o.pakete[0].abger && o.status !== 'abgeholt'); a.rabatt = { typ: 'eur', wert: 0 };
      const voll = ordBrutto(a), ziel = Math.round(voll * 0.9);
      nav('kalk', a.id); await new Promise(r => setTimeout(r, 100)); document.querySelector('[data-act="zielpreis"]').click(); await new Promise(r => setTimeout(r, 100));
      document.getElementById('zp-z').value = fmtIn(ziel); document.getElementById('zp-z').dispatchEvent(new Event('input'));
      const r = { vorschau: /Rabatt auf den Auftrag/.test(document.getElementById('zp-v').textContent) };
      document.querySelector('[data-act="zielpreis-ok"]').click(); await new Promise(r => setTimeout(r, 100));
      r.genau = ordBrutto(a) === ziel && a.rabatt.typ === 'eur' && a.rabatt.wert > 0;
      S.settings.minMarge = 99; render(); await new Promise(r => setTimeout(r, 50)); r.warnung = !!document.querySelector('.ls-minm');
      S.settings.minMarge = mm; S.auftraege = JSON.parse(snap); save(); nav('planung'); return r; });
    if (Object.values(zp).some(v => !v)) errs.push('Zielpreis: ' + JSON.stringify(zp));
  }
  // Kostenvoranschlag mit Gültigkeit + 15-%-Grenze
  {
    const kv = await page.evaluate(async () => {
      const snap = JSON.stringify(S.auftraege), wp = window.print; window.print = () => {};
      const a = S.auftraege.find(o => o.pakete.length && !o.pakete[0].abger && o.status !== 'abgeholt'); a.rabatt = { typ: 'eur', wert: 0 };
      ACT['print-kv']({ dataset: { oid: a.id } }); await new Promise(r => setTimeout(r, 80)); document.querySelector('[data-act="kva-druck"]').click(); await new Promise(r => setTimeout(r, 120));
      const h = document.getElementById('printarea').innerHTML;
      const r = { druck: /Kostenvoranschlag/.test(h) && /Gültig bis/.test(h) && /15 %/.test(h), gemerkt: !!a.kva && a.kva.bruttoCt === ordBrutto(a) };
      a.kva.bruttoCt = Math.round(ordBrutto(a) / 1.3); calcMode[a.id] = 'liste'; nav('kalk', a.id); await new Promise(r => setTimeout(r, 100));
      r.warnung = /über dem Kostenvoranschlag/.test(document.querySelector('.ls-sum').textContent);
      window.print = wp; S.auftraege = JSON.parse(snap); save(); nav('planung'); return r; });
    if (Object.values(kv).some(v => !v)) errs.push('Kostenvoranschlag: ' + JSON.stringify(kv));
  }
  // Preis-Varianten: Teil mit Alternative, Kostenvoranschlag zeigt beide, Kunde wählt
  {
    const pv = await page.evaluate(async () => {
      const snap = JSON.stringify(S.auftraege), wp = window.print; window.print = () => {}; const w = ms => new Promise(r => setTimeout(r, ms));
      const a = S.auftraege.find(o => o.pakete.length && !o.pakete[0].abger && o.status !== 'abgeholt' && !o.sig && !o.freigabe) || S.auftraege.find(o => o.pakete.length && !o.pakete[0].abger);
      const pk = a.pakete[0], x = { id: 'xalt1', nr: 99, created: Date.now(), typ: 'teil', bez: 'Bremsscheibe Original', ekCt: 8000, vkCt: 12000, menge: 2, rab: null, aw: 0, lagerId: null };
      pk.pos.push(x); save(); calcMode[a.id] = 'liste'; nav('kalk', a.id); await w(80);
      ACT['pos-edit']({ dataset: { oid: a.id, pid: pk.id, xid: x.id } }); await w(80);
      const r = { feld: !!document.getElementById('ps-alt-b') };
      if (r.feld) { document.getElementById('ps-alt-b').value = 'Bremsscheibe Qualität'; document.getElementById('ps-alt-ek').value = '50,00'; document.getElementById('ps-alt-vk').value = '80,00';
        document.querySelector('[data-act="pos-save"]').click(); await w(100); }
      r.gespeichert = !!x.alt && x.alt.vkCt === 8000;
      const altBr = altBrutto(a), vorher = ordBrutto(a); r.billiger = altBr < vorher;
      r.hinweis = /Mit Alternativ-Teilen/.test(document.querySelector('.ls-sum').textContent);
      ACT['print-kv']({ dataset: { oid: a.id } }); await w(60); document.querySelector('[data-act="kva-druck"]').click(); await w(100);
      r.druck = /oder alternativ: Bremsscheibe Qualität/.test(document.getElementById('printarea').innerHTML);
      nav('kalk', a.id); await w(80); document.querySelector('[data-act="alt-alle"]').click(); await w(60); const ok = document.querySelector('[data-c="1"]'); if (ok) ok.click(); await w(100);
      r.getauscht = x.bez === 'Bremsscheibe Qualität' && x.alt.bez === 'Bremsscheibe Original' && ordBrutto(a) === altBr;
      window.print = wp; S.auftraege = JSON.parse(snap); save(); nav('planung'); return r; });
    if (Object.values(pv).some(v => !v)) errs.push('Preis-Varianten: ' + JSON.stringify(pv));
  }
  // Geräte-Abgleich: Vergleichslogik und Einschalt-Frage
  {
    const sy = await page.evaluate(async () => {
      const alt = JSON.stringify(S.settings.sync || null), altMeta = JSON.stringify(S.meta || {});
      const c = syncCfg(); c.base = 1000; S.meta = S.meta || {};
      const row = t => ({ payload: { meta: { savedAt: t } }, updated_at: new Date().toISOString() });
      S.meta.savedAt = 1000; const r = { gleich: syncVergleich(row(1000)) === 'gleich', holen: syncVergleich(row(2000)) === 'holen' };
      S.meta.savedAt = 1500; r.senden = syncVergleich(row(1000)) === 'senden'; r.konflikt = syncVergleich(row(2000)) === 'konflikt';
      r.leer = syncVergleich(null) === 'senden';
      S.meta.savedAt = 500; r.uhr = syncVergleich(row(1000)) === 'senden';
      c.on = false; c.id = ''; ACT['sync-tog'](); await new Promise(r => setTimeout(r, 80));
      r.frage = !!document.querySelector('#sheetbg [data-act="sync-neu"]') && !!document.querySelector('#sheetbg [data-act="sync-restore"]'); closeSheet();
      S.settings.sync = JSON.parse(alt) || undefined; if (!S.settings.sync) delete S.settings.sync; S.meta = JSON.parse(altMeta); save(); return r;
    });
    if (Object.values(sy).some(v => !v)) errs.push('Abgleich: ' + JSON.stringify(sy));
  }
  // Stundensätze nach Arbeitsart: Art in der Tabelle wählen → eigener Satz
  {
    const ar = await page.evaluate(async () => {
      const a = S.auftraege.find(o => o.pakete.length && !o.pakete[0].abger && o.status !== 'abgeholt'); if (!a) return { auftrag: false };
      const pk = a.pakete[0], altPos = JSON.parse(JSON.stringify(pk.pos)), altArten = JSON.parse(JSON.stringify(S.settings.arten)), altEnt = pk.entsperrt;
      pk.entsperrt = true; S.settings.arten.find(r => r.id === 'elek').stdCt = 15000;
      pk.pos.push({ id: 'xart1', nr: 98, created: Date.now(), typ: 'arbeit', bez: 'Testdiagnose', menge: 1, aw: 10, ekCt: 0, vkCt: 10 * ktSatz(a, null), best: null, eta: null, lagerId: null, ext: false });
      calcMode[a.id] = 'tab'; nav('auftrag', a.id); await new Promise(r => setTimeout(r, 120));
      const sel = document.querySelector('.kt-typ[data-xid="xart1"]'); if (!sel) return { auswahl: false };
      const r = { optionen: [...sel.options].map(o => o.value).join() === 'arbeit,arbeit:elek,arbeit:karo,arbeit:lack,teil' };
      sel.value = 'arbeit:elek'; sel.dispatchEvent(new Event('change', { bubbles: true })); await new Promise(r => setTimeout(r, 120));
      const x = pk.pos.find(p => p.id === 'xart1');
      r.satz = x.art === 'elek' && x.vkCt === Math.round(10 * Math.round(15000 / (a.awTeiler || S.settings.awTeiler || 1)));
      r.anzeige = document.querySelector('.kt-typ[data-xid="xart1"]').value === 'arbeit:elek';
      pk.pos = altPos; S.settings.arten = altArten; pk.entsperrt = altEnt; save(); nav('planung'); return r;
    });
    if (Object.values(ar).some(v => !v)) errs.push('Arbeitsart: ' + JSON.stringify(ar));
  }
  // Kalkulation im Vollbild: nur Positionen, Fertig führt zurück zum Auftrag
  {
    const kv = await page.evaluate(async () => {
      const a = S.auftraege.find(o => o.pakete.length); nav('auftrag', a.id); await new Promise(r => setTimeout(r, 120));
      const btn = document.querySelector('.kt-voll-btn'); if (!btn) return { knopf: false };
      btn.click(); await new Promise(r => setTimeout(r, 120));
      const r = { knopf: true, route: route.v === 'kalk', tabelle: !!document.querySelector('.kalk-voll table.kt, .kalk-voll .ls'), nurPositionen: !document.querySelector('.sec, .nav, .calcbar, .kkopf') };
      document.querySelector('.kv-fertig').click(); await new Promise(r => setTimeout(r, 120));
      r.zurueck = route.v === 'auftrag' && route.id === a.id; nav('planung'); return r;
    });
    if (Object.values(kv).some(v => !v)) errs.push('Vollbild-Kalkulation: ' + JSON.stringify(kv));
  }
  // Akzentfarbe frei wählbar
  {
    const ak = await page.evaluate(async () => {
      nav('einstellungen'); await new Promise(r => setTimeout(r, 80));
      const dots = document.querySelectorAll('[data-act="akzent-set"]').length;
      document.querySelector('[data-act="akzent-set"][data-v="#3B7DD8"]').click(); await new Promise(r => setTimeout(r, 80));
      const btn = document.querySelector('.btn-main'), cs = btn && getComputedStyle(btn);
      const blau = S.settings.akzent === '#3B7DD8' && getComputedStyle(document.body).getPropertyValue('--acc').trim().toLowerCase() === '#3b7dd8';
      let inp = document.querySelector('[data-f="akzent-pick"]'); inp.value = '#1f3a7a'; inp.dispatchEvent(new Event('change', { bubbles: true })); await new Promise(r => setTimeout(r, 80));
      const ink = getComputedStyle(document.body).getPropertyValue('--acc-ink').trim();
      inp = document.querySelector('[data-f="akzent-pick"]'); inp.value = '#f0e040'; inp.dispatchEvent(new Event('change', { bubbles: true })); await new Promise(r => setTimeout(r, 80));
      const hellInk = getComputedStyle(document.body).getPropertyValue('--acc-ink').trim();
      document.querySelector('[data-act="akzent-set"][data-v=""]').click(); await new Promise(r => setTimeout(r, 80));
      const reset = !S.settings.akzent && !document.body.style.getPropertyValue('--acc');
      return { dots, blau, ink, hellInk, reset };
    });
    if (ak.dots < 5 || !ak.blau || ak.ink !== '#FFFFFF' || ak.hellInk !== '#15180A' || !ak.reset) errs.push('Akzentfarbe: ' + JSON.stringify(ak));
  }
  // Terminkalender: alle 7 Tage sichtbar, Heute-Knopf
  {
    const tk = await page.evaluate(async () => {
      nav('termine'); await new Promise(r => setTimeout(r, 80));
      const hd = [...document.querySelectorAll('.kal-hd-cell')], sc = hd[0] && hd[0].closest('[style*="overflow-x"]');
      const alle = hd.length === 7 && (window.innerWidth > 500 || hd[6].getBoundingClientRect().right <= sc.getBoundingClientRect().right + 1);
      document.querySelector('[data-act="term-woche"][data-d="1"]').click(); await new Promise(r => setTimeout(r, 80));
      const btn = document.querySelector('[data-act="term-heute"]'); btn && btn.click(); await new Promise(r => setTimeout(r, 80));
      return { alle, heute: !!btn && termWoche === 0 && !document.querySelector('[data-act="term-heute"]') };
    });
    if (!tk.alle || !tk.heute) errs.push('Terminkalender: ' + JSON.stringify(tk));
  }
  // Auftrag öffnen und sichtbare Buttons einmal antippen
  const aid = await page.evaluate(() => (S.auftraege.find(a => a.pakete && a.pakete.length) || S.auftraege[0] || {}).id);
  if (aid) {
    await page.evaluate(id => nav('auftrag', id), aid);
    await page.waitForTimeout(200);
    await a11y(page, errs, 'auftrag');
    await page.evaluate(() => ACT['kunde-edit']({ dataset: {} })); await page.waitForTimeout(100);
    await a11y(page, errs, 'kunden-maske'); await page.evaluate(() => closeSheet());
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
    await page.click('[data-act="calc-mode"][data-m="liste"]', { timeout: 2000 }).catch(() => {});
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
  errs.slice(0, 40).forEach(e => console.log((process.env.GITHUB_ACTIONS ? `::error::${w}px ` : '   ') + e.replace(/\n/g, ' ')));
  fail += errs.length;
}
await browser.close();
srv.close();
process.exit(fail ? 1 : 0);

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
    if (shotDir && w === 390 && ['planung','kunden','finanzen','einstellungen','auftraege','termine'].includes(v)) { await page.evaluate(() => { applyTheme('light'); render(); }); await page.waitForTimeout(600); await page.screenshot({ path: `${shotDir}/${v}-hell.png`, fullPage: true }); await page.evaluate(() => { applyTheme(S.settings.theme); render(); }); await page.waitForTimeout(600); await page.screenshot({ path: `${shotDir}/${v}-dunkel.png`, fullPage: true }); }
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
      const imPostfach = box.length === 1 && S.anfragen.length === vorher;
      const n = await anfragenHolen();
      const q = S.anfragen[S.anfragen.length - 1];
      const an = n === 1 && S.anfragen.length === vorher + 1 && q.name === 'Test Kunde' && q.status === 'neu' && q.kanal === 'web';
      S.anfragen.length = vorher; Object.assign(c, alt); if (altBid) S.settings.buchId = altBid; else delete S.settings.buchId;
      window.fetch = of; nav('planung'); save(); await w(80);
      return { link, name, imPostfach, an };
    });
    if (Object.values(bk).some(v => !v)) errs.push('Online-Terminbuchung: ' + JSON.stringify(bk));
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
  errs.slice(0, 40).forEach(e => console.log('   ' + e));
  fail += errs.length;
}
await browser.close();
process.exit(fail ? 1 : 0);

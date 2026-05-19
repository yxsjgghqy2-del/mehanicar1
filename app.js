 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const { useState, useEffect, useRef, useCallback, createContext, useContext } = React;
const SB_URL = "https://jyyorhojzgubdsbijekx.supabase.co";
const SB_KEY = "sb_publishable_52CxKyr4PZRlC96eNoiCBg_ew7lRmtu";
async function sbQ(table, method="GET", body=null, query="") {
const res = await fetch(`${SB_URL}/rest/v1/${table}${query}`, {
method,
headers: {
apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
"Content-Type": "application/json",
Prefer: method==="POST"?"return=representation":method==="PATCH"?"return=representation":""
},
body: body ? JSON.stringify(body) : null,
});
if (!res.ok) throw new Error(await res.text());
if (method==="DELETE"||res.status===204) return null;
const t = await res.text(); return t ? JSON.parse(t) : null;
}
const db = {
list: (t,q="order=id.desc") => sbQ(t,"GET",null,`?${q}`),
insert: (t,r) => sbQ(t,"POST",r),
update: (t,id,d) => sbQ(t,"PATCH",d,`?id=eq.${id}`),
del: (t,id) => sbQ(t,"DELETE",null,`?id=eq.${id}`),
};
// Alle Berechnungen laufen durch diese Funktionen - niemals direkt in UI
const round2=n=>Math.round((Number(n)||0)*100)/100;
const FA="-apple-system";
// Lagerbestand abziehen für alle Material-Positionen mit lager_id
async function adjustLagerbestand(pakete, delta, addRow, updateRow, data, confirm_fn, notify){
const lagerIds={};
(pakete||[]).forEach(p=>{(p.material||[]).forEach(m=>{if(m.lager_id)lagerIds[m.lager_id]=(lagerIds[m.lager_id]||0)+Math.round(m.menge||1);});});
for(const [lid,menge] of Object.entries(lagerIds)){
const artikel=(data.lager||[]).find(l=>l.id===lid);
if(!artikel) continue;
const neuerBestand=(artikel.bestand||0)+(delta*menge);
if(delta<0&&neuerBestand<0){
notify(`Lager: "${artikel.bezeichnung}" hat nur noch ${artikel.bestand} Stk. (benotigt: ${menge})`, "warning");
}
await updateRow("lager",lid,{bestand:Math.max(0,neuerBestand)});
}
}
const eur = n => {
const v = round2(n);
const abs = Math.abs(v);
const parts = abs.toFixed(2).split(".");
parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
return (v < 0 ? "-" : "") + "\u20AC\u00a0" + parts[0] + "," + parts[1];
};
const getMahnStufe = re => {
if(re.bezahlt || re.storniert) return null;
if(!re.faellig) return null;
const tage = Math.floor((Date.now() - new Date(re.faellig).getTime()) / 86400000);
if(tage >= 60) return {stufe:3, tage, label:"3. Mahnung", color:"#FF3B30"};
if(tage >= 30) return {stufe:2, tage, label:"2. Mahnung", color:"#FF3B30"};
if(tage >= 14) return {stufe:1, tage, label:"1. Mahnung", color:"#FF9500"};
if(tage > 0)   return {stufe:0, tage, label:"Überfällig", color:"#FF9500"};
return null;
};
// Validierung: Darf Auftrag gelöscht werden?
const kannAuftragLoeschen = (au, rechnungen) => {
const reList = (rechnungen||[]).filter(r => r.auftrags_id === au.id && !r.storniert);
const hatBezahlt = reList.some(r => r.bezahlt);
if(hatBezahlt) return {ok:false, grund:"Auftrag hat bezahlte Rechnungen. Zuerst Stornorechnung erstellen."};
return {ok:true};
};
// Validierung: Darf KV gelöscht werden?
const kannKVLoeschen = kv => {
if(kv.status === "in_auftrag") return {ok:false, grund:"KV wurde bereits in einen Auftrag umgewandelt."};
return {ok:true};
};
const dat = d => d ? new Date(d).toLocaleDateString("de-DE") : "-";
const datTime = d => d ? new Date(d).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "-";
const tod = () => new Date().toISOString().slice(0,10);
const uid = () => Math.random().toString(36).slice(2)+Date.now().toString(36);
const yr  = () => new Date().getFullYear();
const genNr = (pre,n) => `${pre}-${yr()}-${String(n).padStart(4,"0")}`;
const timerFmt = s => { s=Math.floor(s||0); return `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; };
// AW-Preis Berechnung: Stundensatz / Teiler
const calcAWPreis = (stundensatz, teiler) => {
const t = parseFloat(teiler)||12;
const s = parseFloat(stundensatz)||150;
return parseFloat((s/t).toFixed(2));
};
// "offen" = neu, noch nicht abgerechnet
// "abgerechnet" = Rechnung erstellt, noch nicht bezahlt
// "bezahlt" = bezahlt, gesperrt
function calcPakete(pakete) {
let aN=0, mN=0, mEK=0, sollAW=0;
(pakete||[]).forEach(p=>{
(p.arbeiten||[]).forEach(a=>{
const kz = a.kennzeichen||"kunde";
const preis = (a.aw||0)*(a.aw_preis||0);
if(kz!=="intern") aN += preis;
sollAW += (a.aw||0);
});
(p.material||[]).forEach(m=>{
const kz = m.kennzeichen||"kunde";
if(kz!=="intern") mN += (m.vk_preis||0)*(m.menge||0);
mEK += (m.ek_preis||0)*(m.menge||0);
});
});
const netto=aN+mN, mwst=netto*0.19, brutto=netto+mwst;
return {aN,mN,mEK,netto,mwst,brutto,sollAW};
}
function calcAU(au) {
const c = calcPakete(au.pakete||[]);
const istStd=(au.timer_gesamt_sek||0)/3600;
return {...c, istStd, effStd:istStd>0?c.aN/istStd:0, db:c.netto-c.mEK-istStd*50};
}
// Nur offene (nicht bezahlte) Pakete berechnen
function calcOffenePakete(pakete) {
const offen = (pakete||[]).filter(p=>p.paket_status!=="bezahlt"&&p.paket_status!=="abgerechnet");
return calcPakete(offen);
}
function printDokument({typ,daten,settings,kunde,fahrzeug}){
const S=settings||{};
const titel=typ==="stornorechnung"?"Stornorechnung":typ==="rechnung"?"Rechnung":typ==="kv"?"Kostenvoranschlag":"Auftrag";
const kn=kunde?`${kunde.vorname||""} ${kunde.nachname||""}`.trim():"";
const fz=fahrzeug?[fahrzeug.kennzeichen,fahrzeug.marke].filter(Boolean).join(" "):"";
let pos="";let sumN=0;
(daten.pakete||[]).forEach((pk,pi)=>{
const aR=(pk.arbeiten||[]).filter(a=>(a.kennzeichen||"kunde")!=="intern");
const mR=(pk.material||[]).filter(m=>(m.kennzeichen||"kunde")!=="intern");
if(!aR.length&&!mR.length)return;
pos+=`<tr style="background:#f5f5f7"><td colspan="4" style="padding:5px 8px;font-weight:700">${pk.beanstandung||"Paket "+(pi+1)}</td></tr>`;
aR.forEach(a=>{const p=round2((a.aw||0)*(a.aw_preis||0));sumN+=p;pos+=`<tr><td style="padding:4px 8px">${a.beschreibung}</td><td style="text-align:right;padding:4px 8px">${a.aw} AW</td><td style="text-align:right;padding:4px 8px">${eur(a.aw_preis)}</td><td style="text-align:right;padding:4px 8px;font-weight:600">${eur(p)}</td></tr>`;});
mR.forEach(m=>{const p=round2((m.vk_preis||0)*(m.menge||1));sumN+=p;pos+=`<tr><td style="padding:4px 8px">${m.beschreibung}</td><td style="text-align:right;padding:4px 8px">${m.menge}x</td><td style="text-align:right;padding:4px 8px">${eur(m.vk_preis)}</td><td style="text-align:right;padding:4px 8px;font-weight:600">${eur(p)}</td></tr>`;});
});
const ms=S.mwst||19;const mb=round2(sumN*(ms/100));const br=round2(sumN+mb);
const fd=d=>d?new Date(d).toLocaleDateString("de-DE"):"";
const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:-apple-system,sans-serif;padding:18mm;font-size:10pt}table{width:100%;border-collapse:collapse;margin:6mm 0}th{border-bottom:1pt solid #000;padding:3px 8px;font-size:8pt;color:#666;text-align:left}td{border-bottom:.3pt solid #eee;padding:3px 8px}.ftr{margin-top:8mm;padding-top:3mm;border-top:.5pt solid #ccc;font-size:8pt;color:#666;display:flex;justify-content:space-between}@media print{@page{margin:16mm;size:A4}}</style></head><body><div style="display:flex;justify-content:space-between;margin-bottom:8mm;padding-bottom:4mm;border-bottom:.5pt solid #ccc"><div><b style="font-size:15pt">${S.firma||"mehanicar"}</b><div style="color:#666;font-size:8pt;margin-top:2mm">${[S.inhaber,S.telefon].filter(Boolean).join(" | ")}</div></div><div style="text-align:right"><b style="font-size:18pt">${titel}</b><div style="color:#666;font-size:8pt;margin-top:2mm">${daten.nr||""}${daten.datum?"<br>"+fd(daten.datum):""}${daten.faellig?"<br>Faellig: "+fd(daten.faellig):""}</div></div></div>${kn?`<div style="margin-bottom:5mm">${kn}</div>`:""}${fz?`<div style="margin-bottom:3mm;font-size:9pt;color:#666">Fahrzeug: ${fz}</div>`:""}<table><thead><tr><th>Bezeichnung</th><th style="text-align:right">Menge</th><th style="text-align:right">Einzel</th><th style="text-align:right">Gesamt</th></tr></thead><tbody>${pos}</tbody></table><div style="text-align:right;margin-top:3mm"><div style="display:inline-block;min-width:120px"><div style="display:flex;justify-content:space-between;padding:2px 0;color:#666"><span>Netto</span><span>${eur(sumN)}</span></div><div style="display:flex;justify-content:space-between;padding:2px 0;color:#666"><span>MwSt ${ms}%</span><span>${eur(mb)}</span></div><div style="display:flex;justify-content:space-between;padding:4px 0;border-top:1pt solid #000;font-weight:700;font-size:12pt"><span>Brutto</span><span>${eur(br)}</span></div></div></div>${S.iban&&typ==="rechnung"?`<div style="margin-top:5mm;padding:4px 9px;background:#f5f5f7;font-size:8.5pt">IBAN: ${S.iban}${daten.faellig?" | Faellig: "+fd(daten.faellig):""}</div>`:""}<div class="ftr"><span>${S.firma||""}${S.inhaber?" | "+S.inhaber:""}</span><span>${[S.steuernummer&&"StNr: "+S.steuernummer,S.ust_id].filter(Boolean).join(" | ")}</span></div></body></html>`;
const w=window.open("","_blank");if(!w){alert("Popup-Blocker aktiv");return;}
w.document.write(html);w.document.close();setTimeout(()=>w.print(),400);
}
function shareRechnung({re, kunde, settings}){
const S=settings||{};
const kdName=kunde?`${kunde.vorname||""} ${kunde.nachname||""}`.trim():"Kunde";
const firma=S.firma||"mehanicar";
const zahlungsziel=S.zahlungsziel||14;
const text=`Guten Tag ${kdName},
Ihre Rechnung ${re.nr} uber ${eur(re.brutto||0)} ist bereit.
Fallig bis: ${re.faellig?new Date(re.faellig).toLocaleDateString("de-DE"):""}
Bitte uberweisen Sie auf:
IBAN: ${S.iban||"[IBAN eintragen]"}
Mit freundlichen Grüßen
${S.inhaber||firma}
${firma}`;
const encoded=encodeURIComponent(text);
const phone=_optionalChain([kunde, 'optionalAccess', _2 => _2.whatsapp])||_optionalChain([kunde, 'optionalAccess', _3 => _3.telefon])||"";
const cleanPhone=phone.replace(/[^0-9]/g,"");
if(cleanPhone){
window.open(`https://wa.me/${cleanPhone}?text=${encoded}`,"_blank");
} else {
window.open(`https://wa.me/?text=${encoded}`,"_blank");
}
}
function shareKV({kv,kunde,fahrzeug,settings}){
const S=settings||{};
const nm=kunde?`${kunde.vorname||""} ${kunde.nachname||""}`.trim():"Kunde";
const c=calcPakete(kv.pakete||[]);
const fz=fahrzeug?fahrzeug.kennzeichen:"";
const t="Guten Tag "+nm+",\n\nKV "+kv.nr+(fz?" fuer "+fz:"")+" ueber "+eur(c.brutto)+" liegt bereit."+(kv.gueltig_bis?"\nGueltig bis: "+new Date(kv.gueltig_bis).toLocaleDateString("de-DE"):"")+"\n\nBitte Rueckmeldung geben.\n\n"+(S.inhaber||S.firma||"mehanicar");
const ph=(_optionalChain([kunde, 'optionalAccess', _4 => _4.whatsapp])||_optionalChain([kunde, 'optionalAccess', _5 => _5.telefon])||"").replace(/[^0-9]/g,"");
window.open("https://wa.me/"+(ph||"")+"?text="+encodeURIComponent(t),"_blank");
}

const SC = {
offen:         {label:"Offen",           c:"#FF9F0A", bg:"rgba(255,159,10,0.14)"},
in_arbeit:     {label:"In Arbeit",        c:"#0A84FF", bg:"rgba(10,132,255,0.14)"},
klaerung:      {label:"Klärung",          c:"#BF5AF2", bg:"rgba(191,90,242,0.14)"},
wartet_teile:  {label:"Wartet auf Teile", c:"#FF6B35", bg:"rgba(255,107,53,0.14)"},
abgeschlossen: {label:"Abgeschlossen",    c:"#30D158", bg:"rgba(48,209,88,0.14)"},
storniert:     {label:"Storniert",        c:"#FF453A", bg:"rgba(255,69,58,0.14)"},
photo:      `<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>`,
whatsapp:   `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
};
const ICONS = {
auftraege:    `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
rechnungen:   `<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>`,
kunden:       `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
lager:        `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>`,
finanzen:     `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`,
fahrzeuge:    `<path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>`,
chevronL:     `<polyline points="15,18 9,12 15,6"/>`,
chevronR:     `<polyline points="9,18 15,12 9,6"/>`,
chevronD:     `<polyline points="6,9 12,15 18,9"/>`,
chevronU:     `<polyline points="18,15 12,9 6,15"/>`,
plus:         `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`,
check:        `<polyline points="20,6 9,17 4,12"/>`,
search:       `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
edit:         `<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>`,
trash:        `<polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>`,
warning:      `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
download:     `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>`,
email:        `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>`,
phone:        `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.1a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>`,
play:         `<polygon points="5,3 19,12 5,21" fill="currentColor"/>`,
pause:        `<rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/>`,
refresh:      `<polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>`,
arrow_r:      `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>`,
clock:        `<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>`,
scan:         `<polyline points="23,7 23,1 17,1"/><line x1="23" y1="1" x2="13" y2="11"/><polyline points="1,7 1,1 7,1"/><line x1="1" y1="1" x2="11" y2="11"/><polyline points="1,17 1,23 7,23"/><line x1="1" y1="23" x2="11" y2="13"/><polyline points="23,17 23,23 17,23"/><line x1="23" y1="23" x2="13" y2="13"/>`,
lock:         `<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
unlock:       `<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>`,
storno:       `<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>`,
filter:       `<polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>`,
send:         `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/>`,
};
function Ic({n,s=18,c="currentColor"}) {
const d=ICONS[n];
if(!d) return React.createElement('svg', { width: s, height: s, viewBox: "0 0 24 24"   , style: {display:"block",flexShrink:0},});
return React.createElement('svg', { width: s, height: s, viewBox: "0 0 24 24"   , fill: "none", stroke: c, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", style: {display:"block",flexShrink:0}, dangerouslySetInnerHTML: {__html:d},});
}
const P = {
blue:"#007AFF", green:"#34C759", red:"#FF3B30",
orange:"#FF9500", purple:"#AF52DE",
text:"#1D1D1F", textSub:"#6E6E73",
textMuted:"#AEAEB2", border:"rgba(60,60,67,0.12)",
bgCard:"#FFFFFF", bg:"#F2F2F7",
};
const Ctx = createContext(null);
const useApp = () => useContext(Ctx);
function useIsMobile() {
const [m,setM]=useState(window.innerWidth<900);
useEffect(()=>{const h=()=>setM(window.innerWidth<900);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
return m;
}
const DEF_SETTINGS = {
firma:"mehanicar", inhaber:"Samed",
stundensatz:150, aw_teiler:12, // 12er System Standard
material_aufschlag:25, mwst:19, zahlungsziel:14,
naechste_re_nr:1, naechste_kv_nr:1, naechste_au_nr:1,
email:"", telefon:"", iban:"", steuernummer:"", ust_id:"",
};
function AppProvider({children}) {
const [data,setData]=useState({kunden:[],fahrzeuge:[],auftraege:[],rechnungen:[],angebote:[],lager:[],termine:[],kassenbuch:[],bewertungen:[],settings:DEF_SETTINGS});
const [loading,setLoading]=useState(true);
const [view,setView]=useState("dashboard");
const [toast,setToast]=useState(null);
const [searchOpen,setSearchOpen]=useState(false);
const [sidebarOpen,setSidebarOpen]=useState(false);
const loadAll=useCallback(async()=>{
try {
const tables=["kunden","fahrzeuge","auftraege","rechnungen","angebote","lager","termine","kassenbuch","bewertungen"];
const res=await Promise.all(tables.map(t=>db.list(t).catch(()=>[])));
const nd={};tables.forEach((t,i)=>{nd[t]=res[i]||[];});
const sv=await db.list("settings","limit=1").catch(()=>[]);
if(sv&&sv[0]) nd.settings={...DEF_SETTINGS,...sv[0]};
setData(p=>({...p,...nd}));
} catch(e){console.error(e);}
finally{setLoading(false);}
},[]);
useEffect(()=>{loadAll();},[loadAll]);
useEffect(()=>{
const iv=setInterval(()=>{
setData(p=>{
if(!(p.auftraege||[]).some(a=>a.timer_aktiv)) return p;
return {...p,auftraege:p.auftraege.map(a=>a.timer_aktiv?{...a,timer_gesamt_sek:(a.timer_gesamt_sek||0)+1}:a)};
});
},1000);
return()=>clearInterval(iv);
},[]);
const notify=useCallback((msg,type="success")=>{
setToast({msg,type,id:Date.now()});
setTimeout(()=>setToast(null),3500);
},[]);
const addRow=useCallback(async(table,row)=>{
try{const res=await db.insert(table,row);const saved=Array.isArray(res)?res[0]:res||row;setData(p=>({...p,[table]:[saved,...(p[table]||[])]}));return saved;}
catch(e){setData(p=>({...p,[table]:[row,...(p[table]||[])]}));return row;}
},[]);
const updateRow=useCallback(async(table,id,updates)=>{
setData(p=>({...p,[table]:(p[table]||[]).map(r=>r.id===id?{...r,...updates}:r)}));
try{await db.update(table,id,updates);}catch(e){console.error(e);}
},[]);
const deleteRow=useCallback(async(table,id)=>{
setData(p=>({...p,[table]:(p[table]||[]).filter(r=>r.id!==id)}));
try{await db.del(table,id);}catch(e){console.error(e);}
},[]);
const saveSettings=useCallback(async s=>{
setData(p=>({...p,settings:{...p.settings,...s}}));
try{const ex=await db.list("settings","limit=1").catch(()=>[]);if(ex&&ex[0])await db.update("settings",ex[0].id,s);else await db.insert("settings",{id:uid(),...DEF_SETTINGS,...s});}
catch(e){console.error(e);}
},[]);
const kvZuAuftrag=useCallback(async kv=>{
// Guard: KV darf nur einmal umgewandelt werden
if(kv.status==="in_auftrag"){notify("Kostenvoranschlag wurde bereits umgewandelt.","error");return null;}
try{
const S=data.settings;
const nr=genNr("AU",S.naechste_au_nr||1);
// Alle Pakete bekommen Status "offen"
const pakete=(kv.pakete||[]).map(p=>({...p,paket_status:"offen",kv_paket:true}));
const au={
id:uid(),nr,kv_id:kv.id,kunden_id:kv.kunden_id,fahrzeug_id:kv.fahrzeug_id,
status:"offen",erstellt:tod(),beschreibung:kv.titel||kv.beschreibung||"",
pakete,interne_notiz:"",timer_aktiv:false,timer_gesamt_sek:0,
fertigstellung_geplant:kv.fertigstellung_geplant||null,
garantie_bis:null,checkliste:[],fotos:[],pdfs:[],
rechnungen_ids:[],abgeschlossen:null,zahlungsart:null,bezahlt:false,
};
await addRow("auftraege",au);
// Lagerbestand abziehen fuer Artikel mit lager_id
await adjustLagerbestand(pakete,-1,addRow,updateRow,data,null,notify);
await updateRow("angebote",kv.id,{status:"in_auftrag",auftrags_id:au.id});
if(kv.fertigstellung_geplant){
await addRow("termine",{id:uid(),titel:`Fertigstellung: ${nr}`,kunden_id:kv.kunden_id,fahrzeug_id:kv.fahrzeug_id,datum:kv.fertigstellung_geplant.slice(0,10),uhrzeit_von:kv.fertigstellung_geplant.slice(11,16)||"08:00",uhrzeit_bis:"18:00",typ:"reparatur",notiz:`Aus KV ${kv.nr}`});
}
await saveSettings({naechste_au_nr:(S.naechste_au_nr||1)+1});
notify(`Auftrag ${nr} erstellt`);
setView("auftraege");
return au;
}catch(e){notify("Fehler beim Erstellen des Auftrags","error");console.error(e);return null;}
},[data.settings,addRow,updateRow,saveSettings,notify]);
// Schnellauftrag (direkt ohne KV)
const schnellauftragErstellen=useCallback(async({kunden_id,fahrzeug_id,beschreibung,pakete,schnellmodus,schnell_betrag,schnell_beschreibung,annahme_km})=>{
const S=data.settings;
const nr=genNr("AU",S.naechste_au_nr||1);
// Ab 250 EUR Brutto: Name Pflicht (SS33 UStDV)
if(schnellmodus&&!kunden_id){
const betrag=parseFloat(schnell_betrag)||0;
if(betrag>=250){notify("Ab 250\u20AC brutto muss ein Kundenname angegeben werden (SS33 UStDV)","error");return null;}
}
const paketeNeu=schnellmodus
?[{id:uid(),beanstandung:schnell_beschreibung||"Reparatur",kv_paket:false,paket_status:"offen",
arbeiten:[],material:[],
schnell_betrag:parseFloat(schnell_betrag)||0,
schnell_modus:true}]
:(pakete||[]).map(p=>({...p,paket_status:"offen",kv_paket:false}));
const au={
id:uid(),nr,kv_id:null,
kunden_id:kunden_id||"laufkunde",
fahrzeug_id:fahrzeug_id||null,
status:"offen",erstellt:tod(),
beschreibung:beschreibung||schnell_beschreibung||"",
pakete:paketeNeu,
interne_notiz:"",timer_aktiv:false,timer_gesamt_sek:0,
fertigstellung_geplant:null,garantie_bis:null,
checkliste:[],fotos:[],pdfs:[],
rechnungen_ids:[],abgeschlossen:null,
zahlungsart:null,bezahlt:false,
annahme_km:annahme_km||null,
annahme_protokoll:null,
schnellauftrag:true,
};
await addRow("auftraege",au);
await saveSettings({naechste_au_nr:(S.naechste_au_nr||1)+1});
await adjustLagerbestand(paketeNeu,-1,addRow,updateRow,data,null,notify);
notify("Auftrag "+nr+" erstellt");
return au;
},[data.settings,addRow,updateRow,saveSettings,notify,data]);
// Offene Pakete eines Auftrags in Rechnung stellen
const paketeAbrechnen=useCallback(async(au,paketeIds)=>{
// Guard: keine doppelte Abrechnung
const bereitsAbgerechnet=paketeIds.filter(id=>{const p=(au.pakete||[]).find(x=>x.id===id);return p&&(p.paket_status==="abgerechnet"||p.paket_status==="bezahlt");});
if(bereitsAbgerechnet.length>0){notify("Einige Pakete sind bereits abgerechnet","error");return null;}
try{
const S=data.settings;
const nr=genNr("RE",S.naechste_re_nr||1);
// Nur die gewählten Pakete abrechnen
const zuRechnen=(au.pakete||[]).filter(p=>paketeIds.includes(p.id));
const c=calcPakete(zuRechnen);
if(c.brutto<=0){notify("Keine abrechenbaren Positionen","error");return;}
const faellig=new Date();faellig.setDate(faellig.getDate()+(S.zahlungsziel||14));
const re={
id:uid(),nr,auftrags_id:au.id,kunden_id:au.kunden_id,
datum:tod(),faellig:faellig.toISOString().slice(0,10),
netto:c.netto,mwst_betrag:c.mwst,brutto:c.brutto,
bezahlt:false,bezahlt_am:null,zahlungsart:null,mahnungen:0,
pakete:zuRechnen,
};
await addRow("rechnungen",re);
// Pakete als "abgerechnet" markieren
const updPakete=(au.pakete||[]).map(p=>paketeIds.includes(p.id)?{...p,paket_status:"abgerechnet",rechnung_id:re.id}:p);
const alleAbgerechnet=updPakete.every(p=>p.paket_status==="abgerechnet"||p.paket_status==="bezahlt");
await updateRow("auftraege",au.id,{pakete:updPakete,status:alleAbgerechnet?"abgeschlossen":au.status,abgeschlossen:alleAbgerechnet?tod():au.abgeschlossen,rechnungen_ids:[...(au.rechnungen_ids||[]),re.id]});
await saveSettings({naechste_re_nr:(S.naechste_re_nr||1)+1});
notify(`Rechnung ${nr} erstellt`);
return re;
}catch(e){notify("Fehler beim Erstellen der Rechnung","error");console.error(e);return null;}
},[data.settings,addRow,updateRow,saveSettings,notify]);
// Rechnung als bezahlt markieren -> Pakete auf "bezahlt" setzen
const rechnungBezahlen=useCallback(async(re,zahlungsart)=>{
if(re.bezahlt){notify("Rechnung bereits bezahlt","error");return;}
if(re.storniert){notify("Stornierte Rechnung kann nicht bezahlt werden","error");return;}
await updateRow("rechnungen",re.id,{bezahlt:true,bezahlt_am:tod(),zahlungsart});
// Pakete im Auftrag auf bezahlt setzen
if(re.auftrags_id){
const au=(data.auftraege||[]).find(x=>x.id===re.auftrags_id);
if(au){
const rePakIds=(re.pakete||[]).map(p=>p.id);
const updPakete=(au.pakete||[]).map(p=>rePakIds.includes(p.id)?{...p,paket_status:"bezahlt"}:p);
await updateRow("auftraege",au.id,{pakete:updPakete});
}
}
notify("Zahlung verbucht ");
},[data.auftraege,updateRow,notify]);
const stornoRechnung=useCallback(async re=>{
const S=data.settings;
const nr=genNr("ST",S.naechste_re_nr||1);
const storno={
id:uid(),nr,auftrags_id:re.auftrags_id,kunden_id:re.kunden_id,
datum:tod(),faellig:tod(),
netto:-re.netto,mwst_betrag:-re.mwst_betrag,brutto:-re.brutto,
bezahlt:true,bezahlt_am:tod(),zahlungsart:"storno",mahnungen:0,
pakete:re.pakete,storno_von:re.id,
};
await addRow("rechnungen",storno);
await updateRow("rechnungen",re.id,{storniert:true,storno_id:storno.id});
// Pakete wieder auf "offen" setzen
if(re.auftrags_id){
const au=(data.auftraege||[]).find(x=>x.id===re.auftrags_id);
if(au){
const rePakIds=(re.pakete||[]).map(p=>p.id);
const updPakete=(au.pakete||[]).map(p=>rePakIds.includes(p.id)?{...p,paket_status:"offen",rechnung_id:null}:p);
await updateRow("auftraege",au.id,{pakete:updPakete,status:"in_arbeit"});
}
}
await saveSettings({naechste_re_nr:(S.naechste_re_nr||1)+1});
notify(`Stornorechnung ${nr} erstellt `);
},[data.auftraege,addRow,updateRow,saveSettings,notify]);
const doExport=useCallback(()=>{
const sheets={
"Aufträge":[["Nr.","Datum","Status","Kunde","Kennzeichen","Netto \u20AC","Brutto \u20AC"],
...(data.auftraege||[]).map(au=>{const k=(data.kunden||[]).find(x=>x.id===au.kunden_id)||{};const f=(data.fahrzeuge||[]).find(x=>x.id===au.fahrzeug_id)||{};const c=calcAU(au);return[au.nr,au.erstellt,_optionalChain([SC, 'access', _6 => _6[au.status], 'optionalAccess', _7 => _7.label])||"",`${k.vorname||""} ${k.nachname||""}`.trim(),f.kennzeichen||"",c.netto.toFixed(2),c.brutto.toFixed(2)];})],
"Rechnungen":[["Nr.","Datum","Fällig","Kunde","Brutto \u20AC","Bezahlt"],
...(data.rechnungen||[]).map(r=>{const k=(data.kunden||[]).find(x=>x.id===r.kunden_id)||{};return[r.nr,r.datum||"",r.faellig||"",`${k.vorname||""} ${k.nachname||""}`.trim(),(r.brutto||0).toFixed(2),r.bezahlt?"Ja":"Nein"];})],
"Kunden":[["Nr.","Name","Telefon","E-Mail"],
...(data.kunden||[]).map(k=>[k.nr,`${k.vorname||""} ${k.nachname||""}`.trim(),k.telefon||"",k.email||""])],
"Fahrzeuge":[["Kennzeichen","VIN","Marke","Modell","Baujahr","KM"],
...(data.fahrzeuge||[]).map(f=>[f.kennzeichen,f.vin||"",f.marke||"",f.modell||"",f.baujahr||"",f.km||0])],
};
let html=`<html><head><meta charset="utf-8"></head><body>`;
Object.entries(sheets).forEach(([n,rows])=>{
html+=`<table><caption>${n}</caption><thead><tr>${rows[0].map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>`;
rows.slice(1).forEach(row=>{html+=`<tr>${row.map(c=>`<td>${c}</td>`).join("")}</tr>`;});
html+=`</tbody></table><br/>`;
});
html+=`</body></html>`;
const blob=new Blob(["\ufeff"+html],{type:"application/vnd.ms-excel;charset=utf-8"});
const url=URL.createObjectURL(blob);
const a=document.createElement("a");a.href=url;a.download=`mehanicar_backup_${tod()}.xls`;a.click();URL.revokeObjectURL(url);
notify("Excel-Backup gespeichert -> Downloads-Ordner ");
},[data,notify]);
const ctx={data,loading,view,setView,notify,searchOpen,setSearchOpen,sidebarOpen,setSidebarOpen,addRow,updateRow,deleteRow,saveSettings,kvZuAuftrag,schnellauftragErstellen,paketeAbrechnen,rechnungBezahlen,stornoRechnung,loadAll,doExport};
return React.createElement(Ctx.Provider, { value: ctx,}, children, toast&&React.createElement(Toast, { t: toast,}));
}
function Toast({t}){
const m=window.innerWidth<900;
const c={success:"#30D158",error:"#FF453A",warning:"#FF9F0A",info:"#0A84FF"}[t.type]||"#30D158";
return React.createElement('div', { style: {position:"fixed",bottom:m?130:28,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:"rgba(18,18,22,0.97)",backdropFilter:"blur(20px)",borderRadius:14,padding:"12px 20px",display:"flex",alignItems:"center",gap:10,boxShadow:`0 8px 40px rgba(0,0,0,0.5)`,border:`1px solid ${c}50`,maxWidth:"calc(100vw - 32px)"},}
, React.createElement('div', { style: {width:8,height:8,borderRadius:"50%",background:c,flexShrink:0},})
, React.createElement('span', { style: {color:"#1D1D1F",fontSize:14,fontWeight:500},}, t.msg)
);
}
function ConfirmModal({title,message,confirmLabel,confirmColor,onConfirm,onCancel}){
return React.createElement('div', { style: {position:"fixed",inset:0,zIndex:8000,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24},}
, React.createElement('div', { style: {background:"#FFFFFF",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:340,boxShadow:"0 24px 64px rgba(0,0,0,0.15)"},}
, React.createElement('div', { style: {color:"#1D1D1F",fontSize:17,fontWeight:700,fontFamily:FA,letterSpacing:-0.3,marginBottom:8},}, title)
, React.createElement('div', { style: {color:"#6E6E73",fontSize:14,fontFamily:FA,lineHeight:1.5,marginBottom:24},}, message)
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:10},}
, React.createElement('button', { onClick: onConfirm, style: {width:"100%",padding:"14px",borderRadius:12,border:"none",background:confirmColor||"#FF3B30",color:"#fff",fontSize:15,fontWeight:600,fontFamily:FA,cursor:"pointer"},}, confirmLabel||"Bestätigen")
, React.createElement('button', { onClick: onCancel, style: {width:"100%",padding:"14px",borderRadius:12,border:"none",background:"rgba(120,120,128,0.1)",color:"#1D1D1F",fontSize:15,fontFamily:FA,cursor:"pointer"},}, "Abbrechen")
)
)
);
}
function useConfirm(){
const [cfg,setCfg]=useState(null);
const confirm=opts=>new Promise(res=>{setCfg({...opts,resolve:res});});
const modal=cfg?React.createElement(ConfirmModal, { ...cfg, onConfirm: ()=>{const r=cfg.resolve;setCfg(null);r(true);}, onCancel: ()=>{const r=cfg.resolve;setCfg(null);r(false);},}):null;
return {confirm,modal};
}
function Card({children,style,onClick,noPad}){
const [p,setP]=useState(false);
return React.createElement('div', { onClick: onClick, onPointerDown: ()=>onClick&&setP(true), onPointerUp: ()=>setP(false), onPointerLeave: ()=>setP(false), style: {background:"#FFFFFF",border:"1px solid rgba(60,60,67,0.12)",borderRadius:16,padding:noPad?0:16,cursor:onClick?"pointer":"default",transition:"transform 0.15s,opacity 0.15s",transform:p&&onClick?"scale(0.983)":"scale(1)",opacity:p&&onClick?0.88:1,overflow:"hidden",...style},}, children);
}
function Btn({children,onClick,v="primary",size="md",full,disabled,style:ex}){
const [p,setP]=useState(false);
const vs={
primary:   {bg:"#007AFF",color:"#fff",border:"none"},
secondary: {bg:"rgba(120,120,128,0.12)",color:"#1D1D1F",border:"none"},
danger:    {bg:"#FF3B30",color:"#fff",border:"none"},
success:   {bg:"#34C759",color:"#fff",border:"none"},
ghost:     {bg:"transparent",color:"#6E6E73",border:"1px solid rgba(60,60,67,0.2)"},
green_out: {bg:"rgba(52,199,89,0.10)",color:"#1A7A3A",border:"1px solid rgba(52,199,89,0.25)"},
blue_out:  {bg:"rgba(0,122,255,0.08)",color:"#007AFF",border:"1px solid rgba(0,122,255,0.25)"},
orange_out:{bg:"rgba(255,149,0,0.08)",color:"#FF9F0A",border:"1px solid rgba(255,159,10,0.3)"},
purple_out:{bg:"rgba(191,90,242,0.1)",color:"#BF5AF2",border:"1px solid rgba(191,90,242,0.3)"},
red_out:   {bg:"rgba(255,69,58,0.1)",color:"#FF453A",border:"1px solid rgba(255,69,58,0.3)"},
};
const szs={
sm:{padding:"8px 14px",fontSize:13,borderRadius:10,gap:6,minHeight:36},
md:{padding:"12px 18px",fontSize:14,borderRadius:12,gap:7,minHeight:46},
lg:{padding:"15px 22px",fontSize:15,borderRadius:13,gap:8,minHeight:52},
};
const vs2=vs[v]||vs.primary,sz=szs[size]||szs.md;
return React.createElement('button', { disabled: disabled, onPointerDown: ()=>!disabled&&setP(true), onPointerUp: ()=>setP(false), onPointerLeave: ()=>setP(false), onClick: onClick, style: {background:vs2.bg,color:vs2.color,border:vs2.border,padding:sz.padding,fontSize:sz.fontSize,borderRadius:sz.borderRadius,fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif",fontWeight:600,cursor:disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:sz.gap,minHeight:sz.minHeight,width:full?"100%":"auto",transition:"all 0.15s",opacity:disabled?0.4:p?0.75:1,transform:p&&!disabled?"scale(0.96)":"scale(1)",flexShrink:0,boxSizing:"border-box",...ex},}, children);
}
function Bdg({children,color="#007AFF",bg,small}){
return React.createElement('span', { style: {background:bg||`${color}22`,color,borderRadius:20,padding:small?"3px 9px":"5px 12px",fontSize:small?11:12,fontWeight:600,display:"inline-flex",alignItems:"center",whiteSpace:"nowrap",lineHeight:1.3,flexShrink:0},}, children);
}
function Inp({label,value,onChange,type="text",placeholder,suffix,rows,note,readOnly,style:s}){
const [focused,setFocused]=useState(false);
const base={width:"100%",background:readOnly?"transparent":(type==="date"||type==="time"||type==="datetime-local")?"#FFFFFF":focused?"#FFFFFF":"#F2F2F7",border:`1.5px solid ${focused?"rgba(10,132,255,0.7)":"rgba(60,60,67,0.2)"}`,borderRadius:12,padding:suffix?"12px 44px 12px 14px":"12px 14px",color:readOnly?"#AEAEB2":"#1D1D1F",WebkitTextFillColor:readOnly?"#AEAEB2":"#1D1D1F",fontSize:15,fontFamily:FA,outline:"none",transition:"border-color 0.15s",boxSizing:"border-box",...s};
return React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:7},}
, label&&React.createElement('label', { style: {color:"#6E6E73",fontSize:12,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase"},}, label)
, React.createElement('div', { style: {position:"relative"},}
, rows?React.createElement('textarea', { value: value, onChange: e=>!readOnly&&onChange(e.target.value), placeholder: placeholder, rows: rows, readOnly: readOnly, onFocus: ()=>setFocused(true), onBlur: ()=>setFocused(false), style: {...base,resize:"vertical"},})
:React.createElement('input', { type: type, value: value, onChange: e=>!readOnly&&onChange(e.target.value), placeholder: placeholder, readOnly: readOnly, onFocus: ()=>setFocused(true), onBlur: ()=>setFocused(false), style: base,})
, suffix&&React.createElement('span', { style: {position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",color:"#AEAEB2",fontSize:13,pointerEvents:"none"},}, suffix)
)
, note&&React.createElement('span', { style: {color:"#AEAEB2",fontSize:12,marginTop:-2},}, note)
);
}
function Sel({label,value,onChange,options}){
return React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:7},}
, label&&React.createElement('label', { style: {color:"#6E6E73",fontSize:12,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase"},}, label)
, React.createElement('select', { value: value, onChange: e=>onChange(e.target.value), style: {background:"#F2F2F7",border:`1.5px solid ${P.border}`,borderRadius:12,padding:"12px 14px",color:"#1D1D1F",fontSize:15,fontFamily:FA,outline:"none",cursor:"pointer",minHeight:46,appearance:"none",WebkitAppearance:"none"},}
, options.map(o=>React.createElement('option', { key: o.value, value: o.value, style: {background:"#ffffff"},}, o.label))
)
);
}
// Kunde-Suchfeld mit Live-Filter (löst das "riesige Liste" Problem)
function KundenSuche({kunden,value,onChange,label="Kunde *"}){
const [q,setQ]=useState("");
const [open,setOpen]=useState(false);
const ref=useRef();
const sel=kunden.find(k=>k.id===value);
const filtered=q.length>0?kunden.filter(k=>`${k.vorname} ${k.nachname} ${k.firma||""} ${k.telefon||""}`.toLowerCase().includes(q.toLowerCase())):kunden.slice(0,8);
useEffect(()=>{
const h=(e)=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
document.addEventListener("pointerdown",h);return()=>document.removeEventListener("pointerdown",h);
},[]);
return React.createElement('div', { ref: ref, style: {display:"flex",flexDirection:"column",gap:7},}
, React.createElement('label', { style: {color:"#6E6E73",fontSize:12,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase"},}, label)
, sel&&!open?(
React.createElement('div', { style: {display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"rgba(10,132,255,0.1)",border:`1.5px solid rgba(10,132,255,0.4)`,borderRadius:12,cursor:"pointer"}, onClick: ()=>{setQ("");setOpen(true);},}
, React.createElement('div', { style: {width:32,height:32,borderRadius:9,background:"rgba(10,132,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},}, React.createElement(Ic, { n: "kunden", s: 15, c: P.blue,}))
, React.createElement('div', { style: {flex:1,minWidth:0},}
, React.createElement('div', { style: {color:"#1D1D1F",fontSize:14,fontWeight:600},}, sel.vorname, " " , sel.nachname, sel.firma?` (${sel.firma})`:"")
, React.createElement('div', { style: {color:"#6E6E73",fontSize:12},}, sel.telefon||sel.email||"")
)
, React.createElement('span', { style: {color:P.blue,fontSize:12},}, "ändern")
)
):(
React.createElement('div', { style: {position:"relative"},}
, React.createElement('input', { autoFocus: open, value: q, onChange: e=>{setQ(e.target.value);setOpen(true);}, onFocus: ()=>setOpen(true), placeholder: "Name, Telefon, Firma suchen..."   , style: {width:"100%",background:"#F2F2F7",border:`1.5px solid rgba(10,132,255,0.5)`,borderRadius:12,padding:"12px 14px 12px 42px",color:"#1D1D1F",fontSize:15,fontFamily:FA,outline:"none",boxSizing:"border-box"},})
, React.createElement('div', { style: {position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"},}, React.createElement(Ic, { n: "search", s: 16, c: P.textSub,}))
, open&&(
React.createElement('div', { style: {position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:"rgba(20,20,26,0.99)",border:"1px solid rgba(60,60,67,0.12)",borderRadius:14,overflow:"hidden",zIndex:1000,boxShadow:"0 12px 40px rgba(0,0,0,0.6)",maxHeight:260,overflowY:"auto"},}
, filtered.map(k=>(
React.createElement('div', { key: k.id, onPointerDown: e=>{e.preventDefault();onChange(k.id);setQ("");setOpen(false);}, style: {display:"flex",alignItems:"center",gap:11,padding:"12px 14px",borderBottom:`1px solid rgba(0,0,0,0.03)`,cursor:"pointer"}, onMouseEnter: e=>e.currentTarget.style.background="rgba(0,0,0,0.03)", onMouseLeave: e=>e.currentTarget.style.background="transparent",}
, React.createElement('div', { style: {width:34,height:34,borderRadius:9,background:"rgba(10,132,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},}, React.createElement(Ic, { n: "kunden", s: 15, c: P.blue,}))
, React.createElement('div', { style: {flex:1,minWidth:0},}
, React.createElement('div', { style: {color:"#1D1D1F",fontSize:14,fontWeight:500},}, k.vorname, " " , k.nachname, k.firma?` (${k.firma})`:"")
, React.createElement('div', { style: {color:"#6E6E73",fontSize:12},}, k.telefon||k.email||"")
)
)
))
, filtered.length===0&&React.createElement('div', { style: {padding:"16px",textAlign:"center",color:"#AEAEB2",fontSize:13},}, "Kein Kunde gefunden"  )
)
)
)
)
);
}
function Row({icon,iconColor="#007AFF",left,sub,right,badge,onClick,last}){
const [p,setP]=useState(false);
return React.createElement('div', { onClick: onClick, onPointerDown: ()=>onClick&&setP(true), onPointerUp: ()=>setP(false), onPointerLeave: ()=>setP(false), style: {display:"flex",alignItems:"center",gap:13,padding:"13px 16px",background:p?"rgba(0,0,0,0.03)":"transparent",borderBottom:last?"none":`1px solid ${P.border}`,cursor:onClick?"pointer":"default",transition:"background 0.12s"},}
, icon&&React.createElement('div', { style: {width:40,height:40,borderRadius:11,background:`${iconColor}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:iconColor},}, React.createElement(Ic, { n: icon, s: 18,}))
, React.createElement('div', { style: {flex:1,minWidth:0},}
, React.createElement('div', { style: {color:"#1D1D1F",fontSize:14,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},}, left)
, sub&&React.createElement('div', { style: {color:"#6E6E73",fontSize:12,marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},}, sub)
)
, React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,flexShrink:0},}
, badge, right&&React.createElement('span', { style: {color:"#6E6E73",fontSize:13,whiteSpace:"nowrap"},}, right)
, onClick&&React.createElement(Ic, { n: "chevronR", s: 16, c: P.textMuted,})
)
);
}
function Stat({label,value,sub,color="#007AFF",icon}){
return React.createElement(Card, null
, React.createElement('div', { style: {color:"#6E6E73",fontSize:11,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:6},}, label)
, React.createElement('div', { style: {color:"#1D1D1F",fontSize:22,fontWeight:700,letterSpacing:-0.5,lineHeight:1},}, value)
, sub&&React.createElement('div', { style: {color,fontSize:12,marginTop:6,fontWeight:500},}, sub)
);
}
function SecH({title,action}){
return React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11,marginTop:24},}
, React.createElement('span', { style: {color:"#AEAEB2",fontSize:11,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase"},}, title)
, action
);
}
function Screen({title,children,onBack,action}){
const m=useIsMobile();
return React.createElement('div', { style: {flex:1,overflow:"hidden",display:"flex",flexDirection:"column",minHeight:0},}
, React.createElement('div', { style: {padding:m?"14px 14px 0":"22px 28px 0",flexShrink:0},}
, onBack&&React.createElement('button', { onClick: onBack, style: {display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:P.blue,fontSize:15,cursor:"pointer",padding:"0 0 12px 0",fontWeight:500,minHeight:36},}, React.createElement(Ic, { n: "chevronL", s: 16, c: P.blue,}), " Zurück" )
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:14,borderBottom:"1px solid rgba(60,60,67,0.10)",gap:12},}
, React.createElement('h1', { style: {margin:0,fontSize:m?18:27,fontWeight:700,color:"#1D1D1F",letterSpacing:-0.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,minWidth:0,lineHeight:1.2},}, title)
, action&&React.createElement('div', { style: {flexShrink:0,display:"flex",alignItems:"center",gap:8},}, action)
)
)
, React.createElement('div', { style: {flex:1,overflowY:"auto",overflowX:"hidden",padding:m?"14px 14px":"20px 28px",paddingBottom:"32px"},}, children)
);
}
function Modal({title,children,onClose,wide}){
const m=useIsMobile();
return React.createElement('div', { style: {position:"fixed",inset:0,zIndex:7000,background:"rgba(0,0,0,0.78)",backdropFilter:"blur(14px)",display:"flex",alignItems:m?"flex-end":"center",justifyContent:"center"},}
, React.createElement('div', { style: {background:"#FFFFFF",border:m?"none":`1px solid ${P.border}`,borderRadius:m?"20px 20px 0 0":20,padding:m?"10px 20px 20px":"22px 20px",width:m?"100%":wide?680:520,maxWidth:"100vw",maxHeight:m?"92dvh":"90vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 -4px 24px rgba(0,0,0,0.12)",animation:m?"slideUp .28s cubic-bezier(.32,1,.26,.98)":"fadeIn .18s ease",boxSizing:"border-box"},}
, m&&React.createElement('div', { style: {width:36,height:4,background:"rgba(0,0,0,0.12)",borderRadius:2,margin:"0 auto 18px"},})
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,gap:12},}
, React.createElement('h2', { style: {margin:0,color:"#1D1D1F",fontSize:18,fontWeight:700,lineHeight:1.2},}, title)
, React.createElement('button', { onClick: onClose, style: {width:34,height:34,borderRadius:"50%",background:"rgba(0,0,0,0.07)",border:"none",color:"#6E6E73",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.12s"}, onMouseEnter: e=>e.currentTarget.style.background="rgba(0,0,0,0.06)", onMouseLeave: e=>e.currentTarget.style.background="rgba(0,0,0,0.06)",}, "x")
)
, React.createElement('div', { style: {flex:1,overflowY:"auto"},}, children)
)
);
}
function Tabs({tabs,active,onChange}){
return React.createElement('div', { style: {display:"flex",borderBottom:"1px solid rgba(60,60,67,0.10)",marginBottom:18,overflowX:"auto",scrollbarWidth:"none",flexShrink:0},}
, tabs.map(t=>React.createElement('button', { key: t.v, onClick: ()=>onChange(t.v), style: {padding:"11px 16px",background:"none",border:"none",borderBottom:`2.5px solid ${active===t.v?P.blue:"transparent"}`,color:active===t.v?P.blue:P.textSub,cursor:"pointer",fontSize:13,fontWeight:active===t.v?700:400,whiteSpace:"nowrap",flexShrink:0,marginBottom:-1,minHeight:44,transition:"color 0.12s"},}
, t.l, t.badge>0&&React.createElement('span', { style: {marginLeft:6,background:P.blue,color:"#fff",borderRadius:20,padding:"1px 6px",fontSize:10,fontWeight:700},}, t.badge)
))
);
}
// Umschalter (wie iOS Segmented Control)
function Switcher({options,value,onChange}){
return React.createElement('div', { style: {display:"flex",background:"rgba(120,120,128,0.12)",borderRadius:11,padding:3,marginBottom:16,gap:3},}
, options.map(o=>React.createElement('button', { key: o.v, onClick: ()=>onChange(o.v), style: {flex:1,padding:"8px 12px",borderRadius:9,border:"none",background:value===o.v?"#FFFFFF":"transparent",color:value===o.v?"#1D1D1F":"#6E6E73",cursor:"pointer",fontSize:13,fontWeight:value===o.v?600:400,transition:"all 0.2s cubic-bezier(.4,0,.2,1)",minHeight:36,lineHeight:1.2,boxShadow:value===o.v?"0 1px 4px rgba(0,0,0,0.12)":"none",whiteSpace:"nowrap"},}, o.l))
);
}
function LagerArtikelSuche({onSelect}){
const {data}=useApp();
const [q,setQ]=useState("");
const [open,setOpen]=useState(false);
const ref=React.useRef();
const filtered=React.useMemo(()=>{
if(!q.trim()) return (data.lager||[]).slice(0,8);
return (data.lager||[]).filter(a=>`${a.bezeichnung} ${a.artikelnr||""}`.toLowerCase().includes(q.toLowerCase())).slice(0,8);
},[q,data.lager]);
React.useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("pointerdown",h);return()=>document.removeEventListener("pointerdown",h);},[]);
return React.createElement('div', { ref: ref, style: {position:"relative"},}
, React.createElement('div', { style: {display:"flex",gap:8,alignItems:"center"},}
, React.createElement('div', { style: {flex:1,position:"relative"},}
, React.createElement('input', { value: q, onChange: e=>{setQ(e.target.value);setOpen(true);}, onFocus: ()=>setOpen(true), placeholder: "Lagerartikel suchen..." , style: {width:"100%",background:open?"#fff":"#F5F5F7",border:`1.5px solid ${open?"rgba(0,122,255,0.5)":"rgba(0,0,0,0.1)"}`,borderRadius:10,padding:"9px 13px 9px 36px",fontSize:13,color:"#1D1D1F",outline:"none",fontFamily:FA,boxSizing:"border-box",boxShadow:open?"0 0 0 3px rgba(0,122,255,0.1)":"none"},})
, React.createElement(Ic, { n: "search", s: 14, c: "#AEAEB2", style: {position:"absolute",left:11,top:"50%",transform:"translateY(-50%)"},})
)
)
, open&&filtered.length>0&&React.createElement('div', { style: {position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"#fff",border:"1px solid rgba(0,0,0,0.1)",borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",zIndex:1000,overflow:"hidden",maxHeight:220,overflowY:"auto"},}
, filtered.map(a=>(
React.createElement('div', { key: a.id, onPointerDown: e=>{e.preventDefault();onSelect(a);setQ("");setOpen(false);}, style: {display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderBottom:"1px solid rgba(0,0,0,0.05)",cursor:"pointer"}, onMouseEnter: e=>e.currentTarget.style.background="#F5F5F7", onMouseLeave: e=>e.currentTarget.style.background="transparent",}
, React.createElement('div', null
, React.createElement('div', { style: {color:"#1D1D1F",fontSize:13,fontWeight:500,fontFamily:FA},}, a.bezeichnung)
, React.createElement('div', { style: {color:"#AEAEB2",fontSize:11,fontFamily:FA},}, a.artikelnr||"", a.lagerort?" . "+a.lagerort:"")
)
, React.createElement('div', { style: {textAlign:"right",flexShrink:0},}
, React.createElement('div', { style: {color:P.green,fontSize:13,fontWeight:700,fontFamily:FA},}, eur(a.vk_preis||0))
, React.createElement('div', { style: {color:(a.bestand||0)<=( a.mindestbestand||0)?P.red:"#AEAEB2",fontSize:11,fontFamily:FA},}, a.bestand, " " , a.einheit||"Stk.")
)
)
))
)
);
}
// Rechnungskennzeichen: "kunde" | "intern" | "sonstiges" (+ freier Text)
function KzBadge({kennzeichen,sonstiges_text}){
if(kennzeichen==="intern") return React.createElement(Bdg, { color: P.purple, small: true,}, "Intern");
if(kennzeichen==="sonstiges") return React.createElement(Bdg, { color: P.orange, small: true,}, sonstiges_text||"Sonstiges");
return React.createElement(Bdg, { color: P.blue, small: true,}, "Kunde");
}
function PaketeEditor({pakete,onChange,settings,readOnly,auKvId}){
const awP=settings?calcAWPreis(settings.stundensatz,settings.aw_teiler):12.5;
const aufP=_optionalChain([settings, 'optionalAccess', _8 => _8.material_aufschlag])||25;
const addPaket=()=>onChange([...(pakete||[]),{id:uid(),beanstandung:"",arbeiten:[],material:[],expanded:true,paket_status:"offen"}]);
let tA=0,tM=0;
(pakete||[]).forEach(p=>{
(p.arbeiten||[]).forEach(a=>{if((a.kennzeichen||"kunde")!=="intern")tA+=(a.aw||0)*(a.aw_preis||0);});
(p.material||[]).forEach(m=>{if((m.kennzeichen||"kunde")!=="intern")tM+=(m.vk_preis||0)*(m.menge||0);});
});
const netto=tA+tM;
return React.createElement('div', null
, (pakete||[]).map((pk,pi)=>{
const gesperrt=pk.paket_status==="bezahlt";
return React.createElement(PaketBlock, { key: pk.id, paket: pk, pi: pi, awP: awP, aufP: aufP, readOnly: readOnly||gesperrt, gesperrt: gesperrt, auHasKV: !!auKvId, onChange: u=>onChange(pakete.map(p=>p.id===pk.id?{...p,...u}:p)), onDelete: ()=>onChange(pakete.filter(p=>p.id!==pk.id)),});
})
, !readOnly&&React.createElement('button', { onClick: addPaket, style: {width:"100%",padding:"13px",borderRadius:13,border:`2px dashed ${P.border}`,background:"transparent",color:"#6E6E73",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:8,minHeight:50,transition:"border-color 0.12s"}, onMouseEnter: e=>e.currentTarget.style.borderColor="rgba(10,132,255,0.4)", onMouseLeave: e=>e.currentTarget.style.borderColor=P.border,}
, React.createElement(Ic, { n: "plus", s: 16, c: P.textSub,}), " Paket / Beanstandung hinzufügen"
)
, (pakete||[]).length>0&&React.createElement('div', { style: {marginTop:16,padding:"14px 16px",background:"transparent",borderRadius:13},}
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",marginBottom:6},}, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, "Arbeit netto" ), React.createElement('span', { style: {color:"#1D1D1F",fontSize:13,fontWeight:500},}, eur(tA)))
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",marginBottom:6},}, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, "Material netto" ), React.createElement('span', { style: {color:"#1D1D1F",fontSize:13,fontWeight:500},}, eur(tM)))
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",marginBottom:6},}, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, "MwSt. 19%" ), React.createElement('span', { style: {color:"#1D1D1F",fontSize:13,fontWeight:500},}, eur(netto*0.19)))
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",paddingTop:10,borderTop:"1px solid rgba(60,60,67,0.10)"},}
, React.createElement('span', { style: {color:"#1D1D1F",fontSize:16,fontWeight:700},}, "Brutto gesamt" )
, React.createElement('span', { style: {color:P.green,fontSize:20,fontWeight:700},}, eur(netto*1.19))
)
)
);
}
function PaketBlock({paket,pi,awP,aufP,readOnly,gesperrt,onChange,onDelete,auHasKV}){
const [showAddA,setShowAddA]=useState(false);
const [showAddM,setShowAddM]=useState(false);
const [na,setNa]=useState({beschreibung:"",aw:"",aw_preis:String(awP),kennzeichen:"kunde",sonstiges_text:""});
const [nm,setNm]=useState({beschreibung:"",menge:"1",ek_preis:"",vk_preis:"",aufschlag_pct:String(aufP),kennzeichen:"kunde",sonstiges_text:""});
const exp=paket.expanded!==false;
const paketA=(paket.arbeiten||[]).reduce((s,a)=>s+(a.aw||0)*(a.aw_preis||0),0);
const paketM=(paket.material||[]).reduce((s,m)=>s+(m.vk_preis||0)*(m.menge||0),0);
const statusInfo={
offen:     {label:"Offen",      c:P.blue,   icon:"unlock"},
abgerechnet:{label:"In Rechnung",c:P.orange, icon:"rechnungen"},
bezahlt:   {label:"Bezahlt",    c:P.green,  icon:"lock"},
}[paket.paket_status||"offen"]||{label:"Offen",c:P.blue,icon:"unlock"};
const addArb=()=>{
if(!na.beschreibung||!na.aw) return;
onChange({...paket,arbeiten:[...(paket.arbeiten||[]),{id:uid(),beschreibung:na.beschreibung,aw:parseFloat(na.aw),aw_preis:parseFloat(na.aw_preis),kennzeichen:na.kennzeichen,sonstiges_text:na.sonstiges_text}]});
setNa({beschreibung:"",aw:"",aw_preis:String(awP),kennzeichen:"kunde",sonstiges_text:""});setShowAddA(false);
};
const addMat=()=>{
if(!nm.beschreibung||!nm.ek_preis) return;
const ek=parseFloat(nm.ek_preis),pct=parseFloat(nm.aufschlag_pct)||0;
const vk=nm.vk_preis?parseFloat(nm.vk_preis):parseFloat((ek*(1+pct/100)).toFixed(2));
onChange({...paket,material:[...(paket.material||[]),{id:uid(),beschreibung:nm.beschreibung,menge:parseFloat(nm.menge)||1,ek_preis:ek,vk_preis:vk,aufschlag_pct:pct,kennzeichen:nm.kennzeichen,sonstiges_text:nm.sonstiges_text}]});
setNm({beschreibung:"",menge:"1",ek_preis:"",vk_preis:"",aufschlag_pct:String(aufP),kennzeichen:"kunde",sonstiges_text:""});setShowAddM(false);
};
const KzFelder=({val,setVal})=>React.createElement(React.Fragment, null
, React.createElement(Sel, { label: "Rechnungskennzeichen", value: val.kennzeichen, onChange: v=>setVal(p=>({...p,kennzeichen:v})), options: [{value:"kunde",label:"Rechnung Kunde"},{value:"intern",label:"Interne Verrechnung"},{value:"sonstiges",label:"Sonstiges (eigener Text)"}],})
, val.kennzeichen==="sonstiges"&&React.createElement(Inp, { label: "Wer zahlt?" , value: val.sonstiges_text||"", onChange: v=>setVal(p=>({...p,sonstiges_text:v})), placeholder: "z.B. Versicherung, Garantie, Kulanz..."   ,})
);
return React.createElement('div', { style: {border:`1.5px solid ${gesperrt?"rgba(48,209,88,0.3)":paket.paket_status==="abgerechnet"?"rgba(255,159,10,0.3)":P.border}`,borderRadius:14,marginBottom:10,overflow:"hidden",opacity:gesperrt?0.75:1},}
/* Header */
, React.createElement('div', { style: {display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:gesperrt?"rgba(48,209,88,0.06)":paket.paket_status==="abgerechnet"?"rgba(255,159,10,0.06)":"rgba(0,0,0,0.03)",cursor:"pointer"}, onClick: ()=>onChange({...paket,expanded:!exp}),}
, React.createElement(Ic, { n: exp?"chevronU":"chevronD", s: 16, c: P.purple,})
, React.createElement('div', { style: {flex:1,minWidth:0},}
, readOnly?React.createElement('span', { style: {color:gesperrt?"#6E6E73":"#fff",fontSize:14,fontWeight:600},}, paket.beanstandung||`Paket ${pi+1}`)
:React.createElement('input', { value: paket.beanstandung||"", onChange: e=>onChange({...paket,beanstandung:e.target.value}), placeholder: `Beanstandung / Kundenwunsch ${pi+1}`, onClick: e=>e.stopPropagation(), style: {background:"transparent",border:"none",outline:"none",color:"#1D1D1F",fontSize:14,fontWeight:600,width:"100%",fontFamily:FA},})
, React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,marginTop:3},}
, React.createElement('span', { style: {color:"#6E6E73",fontSize:11},}, (paket.arbeiten||[]).length, " Arb. . "   , (paket.material||[]).length, " Teile . "   , eur(paketA+paketM))
, React.createElement(Bdg, { color: statusInfo.c, small: true,}, statusInfo.label)
, auHasKV&&!paket.kv_paket&&React.createElement(Bdg, { color: P.orange, small: true,}, "Erweiterung")
, gesperrt&&React.createElement(Ic, { n: "lock", s: 12, c: P.green,})
)
)
, !readOnly&&!gesperrt&&React.createElement('button', { onClick: e=>{e.stopPropagation();onDelete();}, style: {background:"none",border:"none",cursor:"pointer",padding:6,display:"flex",flexShrink:0,borderRadius:8}, onMouseEnter: e=>e.currentTarget.style.background="rgba(255,69,58,0.15)", onMouseLeave: e=>e.currentTarget.style.background="none",}, React.createElement(Ic, { n: "trash", s: 15, c: P.red,}))
)
, gesperrt&&exp&&React.createElement('div', { style: {padding:"10px 14px",background:"rgba(48,209,88,0.06)",display:"flex",alignItems:"center",gap:8},}, React.createElement(Ic, { n: "lock", s: 14, c: P.green,}), React.createElement('span', { style: {color:P.green,fontSize:12,fontWeight:500},}, "Bezahlt & gesperrt - Änderung nur über Stornorechnung möglich"        ))
, exp&&React.createElement('div', { style: {padding:"12px 14px"},}
/* Arbeiten */
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8},}
, React.createElement('span', { style: {color:"#AEAEB2",fontSize:11,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase"},}, "Arbeiten")
, !readOnly&&!gesperrt&&React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>{setShowAddA(v=>!v);setShowAddM(false);},}, React.createElement(Ic, { n: "plus", s: 13,}), " Position" )
)
, (paket.arbeiten||[]).map(a=>React.createElement('div', { key: a.id, style: {display:"flex",alignItems:"center",gap:10,padding:"9px 11px",background:"#F2F2F7",borderRadius:10,marginBottom:6},}
, React.createElement('div', { style: {flex:1,minWidth:0},}
, React.createElement('div', { style: {color:"#1D1D1F",fontSize:13,fontWeight:500},}, a.beschreibung)
, React.createElement('div', { style: {color:"#6E6E73",fontSize:12,marginTop:2},}, a.aw, " AW x "   , eur(a.aw_preis), " = "  , React.createElement('strong', null, eur(a.aw*a.aw_preis)))
)
, React.createElement(KzBadge, { kennzeichen: a.kennzeichen, sonstiges_text: a.sonstiges_text,})
, !readOnly&&!gesperrt&&React.createElement('button', { onClick: ()=>onChange({...paket,arbeiten:(paket.arbeiten||[]).filter(x=>x.id!==a.id)}), style: {background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",flexShrink:0},}, React.createElement(Ic, { n: "trash", s: 14, c: P.red,}))
))
, showAddA&&!readOnly&&React.createElement('div', { style: {background:"rgba(10,132,255,0.07)",border:"1px solid rgba(10,132,255,0.2)",borderRadius:12,padding:"13px",marginBottom:10},}
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:10},}
, React.createElement(Inp, { label: "Bezeichnung", value: na.beschreibung, onChange: v=>setNa(p=>({...p,beschreibung:v})), placeholder: "z.B. Bremsscheiben wechseln VA"   ,})
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},}, React.createElement(Inp, { label: "AW", value: na.aw, onChange: v=>setNa(p=>({...p,aw:v})), type: "number", placeholder: "1.5",}), React.createElement(Inp, { label: "AW-Preis \\u20AC" , value: na.aw_preis, onChange: v=>setNa(p=>({...p,aw_preis:v})), type: "number",}))
, na.aw&&na.aw_preis&&React.createElement('div', { style: {padding:"9px 12px",background:"rgba(10,132,255,0.08)",borderRadius:9,color:P.blue,fontSize:13,fontWeight:600,textAlign:"center"},}, "= " , eur(parseFloat(na.aw)*parseFloat(na.aw_preis)))
, React.createElement(KzFelder, { val: na, setVal: setNa,})
, React.createElement('div', { style: {display:"flex",gap:8},}, React.createElement(Btn, { v: "primary", size: "sm", onClick: addArb,}, React.createElement(Ic, { n: "check", s: 13,}), " Hinzufügen" ), React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>setShowAddA(false),}, "Abbrechen"))
)
)
/* Material */
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,marginTop:14},}
, React.createElement('span', { style: {color:"#AEAEB2",fontSize:11,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase"},}, "Material & Teile"  )
, !readOnly&&!gesperrt&&React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>{setShowAddM(v=>!v);setShowAddA(false);},}, React.createElement(Ic, { n: "plus", s: 13,}), " Material" )
)
, !readOnly&&!gesperrt&&React.createElement('div', { style: {marginBottom:8},}
, React.createElement(LagerArtikelSuche, { onSelect: a=>{const p={id:uid(),beschreibung:a.bezeichnung,menge:1,ek_preis:a.ek_preis||0,vk_preis:a.vk_preis||0,aufschlag_pct:0,kennzeichen:"kunde",sonstiges_text:"",lager_id:a.id};onChange({...paket,material:[...(paket.material||[]),p]});},})
)
, (paket.material||[]).map(m=>React.createElement('div', { key: m.id, style: {display:"flex",alignItems:"center",gap:10,padding:"9px 11px",background:"#F2F2F7",borderRadius:10,marginBottom:6},}
, React.createElement('div', { style: {flex:1,minWidth:0},}
, React.createElement('div', { style: {color:"#1D1D1F",fontSize:13,fontWeight:500},}, m.beschreibung)
, React.createElement('div', { style: {color:"#6E6E73",fontSize:12,marginTop:2},}, m.menge, "x . EK "   , eur(m.ek_preis), " . "  , React.createElement('span', { style: {color:P.green},}, "VK " , eur(m.vk_preis)))
)
, React.createElement(KzBadge, { kennzeichen: m.kennzeichen, sonstiges_text: m.sonstiges_text,})
, !readOnly&&!gesperrt&&React.createElement('button', { onClick: ()=>onChange({...paket,material:(paket.material||[]).filter(x=>x.id!==m.id)}), style: {background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",flexShrink:0},}, React.createElement(Ic, { n: "trash", s: 14, c: P.red,}))
))
, showAddM&&!readOnly&&React.createElement('div', { style: {background:"rgba(48,209,88,0.07)",border:"1px solid rgba(48,209,88,0.2)",borderRadius:12,padding:"13px",marginBottom:10},}
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:10},}
, React.createElement(Inp, { label: "Bezeichnung", value: nm.beschreibung, onChange: v=>setNm(p=>({...p,beschreibung:v})), placeholder: "z.B. Bremsscheiben Brembo"  ,})
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},}, React.createElement(Inp, { label: "Menge", value: nm.menge, onChange: v=>setNm(p=>({...p,menge:v})), type: "number",}), React.createElement(Inp, { label: "Aufschlag %" , value: nm.aufschlag_pct, onChange: v=>{const pct=parseFloat(v)||0;setNm(p=>({...p,aufschlag_pct:v,vk_preis:p.ek_preis?(parseFloat(p.ek_preis)*(1+pct/100)).toFixed(2):p.vk_preis}));}, type: "number",}))
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},}, React.createElement(Inp, { label: "EK-Preis \\u20AC" , value: nm.ek_preis, onChange: v=>{const ek=parseFloat(v)||0,pct=parseFloat(nm.aufschlag_pct)||0;setNm(p=>({...p,ek_preis:v,vk_preis:(ek*(1+pct/100)).toFixed(2)}));}, type: "number",}), React.createElement(Inp, { label: "VK-Preis \\u20AC" , value: nm.vk_preis, onChange: v=>setNm(p=>({...p,vk_preis:v})), type: "number",}))
, React.createElement(KzFelder, { val: nm, setVal: setNm,})
, nm.ek_preis&&nm.vk_preis&&React.createElement('div', { style: {padding:"9px 12px",background:"rgba(48,209,88,0.07)",borderRadius:9,color:P.green,fontSize:13,textAlign:"center"},}, "Deckungsbeitrag: " , eur((parseFloat(nm.vk_preis)-parseFloat(nm.ek_preis))*parseFloat(nm.menge)))
, React.createElement('div', { style: {display:"flex",gap:8},}, React.createElement(Btn, { v: "success", size: "sm", onClick: addMat,}, React.createElement(Ic, { n: "check", s: 13,}), " Hinzufügen" ), React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>setShowAddM(false),}, "Abbrechen"))
)
)
, (paket.arbeiten||[]).length===0&&(paket.material||[]).length===0&&React.createElement('div', { style: {color:"#AEAEB2",fontSize:13,padding:"8px 0",textAlign:"center"},}, "Noch keine Positionen"  )
)
);
}
const NAV_SECTIONS=[
[{id:"dashboard",icon:"dashboard",label:"Dashboard"}],
[{id:"auftraege",icon:"auftraege",label:"Aufträge"},{id:"rechnungen",icon:"rechnungen",label:"Rechnungen"},{id:"kalender",icon:"kalender",label:"Kalender"}],
[{id:"kunden",icon:"kunden",label:"Kunden & Fahrzeuge"}],
[{id:"lager",icon:"lager",label:"Lager"}],
[{id:"finanzen",icon:"finanzen",label:"Finanzen"},{id:"statistik",icon:"statistik",label:"Statistiken"},{id:"bewertungen",icon:"bewertungen",label:"Bewertungen"}],
[{id:"einstellungen",icon:"einstellungen",label:"Einstellungen"}],
];
const MOBILE_NAV=[
{id:"dashboard",icon:"dashboard",label:"Dashboard"},
{id:"auftraege",icon:"auftraege",label:"Aufträge"},
{id:"rechnungen",icon:"rechnungen",label:"Rechnungen"},
{id:"kalender",icon:"kalender",label:"Kalender"},
{id:"kunden",icon:"kunden",label:"Kunden"},
];
function MobileNav(){
const {view,setView,data,sidebarOpen,setSidebarOpen}=useApp();
const bdgAU=(data.auftraege||[]).filter(a=>a.status!=="abgeschlossen"&&a.status!=="storniert").length;
const bdgRE=(data.rechnungen||[]).filter(r=>!r.bezahlt&&!r.storniert).length;
const ITEMS=[
{id:"dashboard",   label:"Übersicht"},
{id:"auftraege",   label:"Aufträge",  bdg:bdgAU},
{id:"rechnungen",  label:"Rechnungen",bdg:bdgRE},
{id:"kalender",    label:"Kalender"},
{id:"kunden",      label:"Kunden"},
{id:"lager",       label:"Lager"},
{id:"finanzen",    label:"Finanzen"},
{id:"statistik",   label:"Statistiken"},
{id:"bewertungen", label:"Bewertungen"},
{id:"einstellungen",label:"Einstellungen"},
];
return React.createElement(React.Fragment, null
/* iPad-style top menu bar */
, React.createElement('div', { style: {
position:"fixed",top:0,left:0,right:0,zIndex:6000,
background:"#F8F8F8",
backdropFilter:"none",WebkitBackdropFilter:"none",
borderBottom:"1px solid rgba(0,0,0,0.1)",
display:"flex",alignItems:"center",
height:44,
WebkitOverflowScrolling:"touch",
},}
/* Scrollable nav items */
, React.createElement('div', { style: {
flex:1,
display:"flex",alignItems:"center",
overflowX:"auto",
scrollbarWidth:"none",msOverflowStyle:"none",WebkitOverflowScrolling:"touch",height:"100%",padding:"0 4px",
},}
, ITEMS.map(item=>{
const act=view===item.id;
return React.createElement('button', {
key: item.id,
onClick: ()=>setView(item.id),
style: {
flexShrink:0,
position:"relative",
height:"100%",
padding:"0 13px",
background:"none",
border:"none",
borderBottom:act?"2px solid #007AFF":"2px solid transparent",
color:act?"#007AFF":"#3C3C43",
fontSize:13,
fontWeight:act?600:400,
fontFamily:FA,
cursor:"pointer",
whiteSpace:"nowrap",
letterSpacing:-0.1,
transition:"color 0.12s",
},}

, item.label
, item.bdg>0&&React.createElement('span', { style: {
marginLeft:4,
background:"#FF3B30",color:"#fff",
borderRadius:9,padding:"1px 5px",
fontSize:10,fontWeight:700,
verticalAlign:"middle",
fontFamily:FA,
},}, item.bdg)
);
})
)
)
);
}
function GlobalSearch({isOpen,onClose}){
if(!isOpen)return null;
const {data,setView}=useApp();
const [q,setQ]=useState("");
const ref=React.useRef();
const filtered=q.length>1?(data.auftraege||[]).filter(a=>`${a.nr} ${a.beschreibung||""}`.toLowerCase().includes(q.toLowerCase())).slice(0,5):[];
return React.createElement('div', { style: {position:"fixed",inset:0,zIndex:8000,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(8px)"}, onClick: onClose,}
, React.createElement('div', { onClick: e=>e.stopPropagation(), style: {position:"absolute",top:60,left:16,right:16,background:"#fff",borderRadius:16,padding:"14px",boxShadow:"0 8px 32px rgba(0,0,0,0.15)"},}
, React.createElement('input', { ref: ref, autoFocus: true, value: q, onChange: e=>setQ(e.target.value), placeholder: "Suche...", style: {width:"100%",border:"1.5px solid rgba(0,122,255,0.4)",borderRadius:10,padding:"11px 14px",fontSize:15,color:"#1D1D1F",outline:"none",boxSizing:"border-box"},})
, filtered.map(a=>React.createElement('div', { key: a.id, onClick: ()=>{setView("auftraege");onClose();}, style: {padding:"10px 4px",borderBottom:"1px solid rgba(0,0,0,0.06)",cursor:"pointer",color:"#1D1D1F",fontSize:14},}, a.nr, " - "  , a.beschreibung||"Auftrag"))
));
}

function FahrzeugFormFelder({f,setF,withScan}){
const [scanning,setScanning]=useState(false);
const handleScan=async(e)=>{
const file=_optionalChain([e, 'access', _9 => _9.target, 'access', _10 => _10.files, 'optionalAccess', _11 => _11[0]]);if(!file)return;
const r=new FileReader();
r.onload=async(ev)=>{
const d=ev.target.result;
setF(p=>({...p,fahrzeugschein:{name:file.name,type:file.type,data:d}}));
if(!file.type.startsWith("image/"))return;
setScanning(true);
try{
const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:file.type,data:d.split(",")[1]}},{type:"text",text:"Fahrzeugschein. JSON: kennzeichen,vin,marke,modell,baujahr,erstzulassung,hu_datum,kraftstoff,hubraum,kw,farbe,farb_code"}]}]})});
const json=await res.json();
const p=JSON.parse(_optionalChain([((json.content||[]).find(c=>c.type==="text")||{}), 'access', _12 => _12.text, 'optionalAccess', _13 => _13.replace, 'call', _14 => _14(/```json|```/g,""), 'access', _15 => _15.trim, 'call', _16 => _16()])||"{}");
setF(prev=>{const u={...prev};Object.keys(p).forEach(k=>{if(p[k]&&!u[k])u[k]=String(p[k]);});return u;});
}catch(e){console.error(e);}finally{setScanning(false);}
};r.readAsDataURL(file);
};
return React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:12},}
, withScan&&React.createElement('label', { style: {display:"flex",alignItems:"center",justifyContent:"center",gap:9,padding:"13px",background:"rgba(0,122,255,0.07)",border:"1.5px dashed rgba(0,122,255,0.3)",borderRadius:14,cursor:"pointer"},}
, scanning?React.createElement(React.Fragment, null, React.createElement('div', { style: {width:15,height:15,borderRadius:"50%",border:"2px solid rgba(0,122,255,0.25)",borderTopColor:P.blue,animation:"spin .7s linear infinite"},}), React.createElement('span', { style: {color:P.blue,fontSize:14,fontWeight:600},}, "Felder werden ausgefüllt..."  )):React.createElement(React.Fragment, null, React.createElement(Ic, { n: "scan", s: 15, c: P.blue,}), React.createElement('span', { style: {color:P.blue,fontSize:14,fontWeight:600},}, f.fahrzeugschein?"Ersetzen":"Fahrzeugschein scannen"))
, React.createElement('input', { type: "file", accept: "image/*,.pdf", onChange: handleScan, style: {display:"none"},})
)
, _optionalChain([f, 'access', _17 => _17.fahrzeugschein, 'optionalAccess', _18 => _18.type, 'optionalAccess', _19 => _19.startsWith, 'call', _20 => _20("image/")])&&React.createElement('img', { src: f.fahrzeugschein.data, alt: "Scan", style: {width:"100%",borderRadius:10,maxHeight:100,objectFit:"cover"},})
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:11},}
, React.createElement(Inp, { label: "Kennzeichen *" , value: f.kennzeichen||"", onChange: v=>setF(p=>({...p,kennzeichen:v.toUpperCase()})),})
, React.createElement(Inp, { label: "Marke *" , value: f.marke||"", onChange: v=>setF(p=>({...p,marke:v})),})
)
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:11},}
, React.createElement(Inp, { label: "Modell", value: f.modell||"", onChange: v=>setF(p=>({...p,modell:v})),})
, React.createElement(Inp, { label: "VIN", value: f.vin||"", onChange: v=>setF(p=>({...p,vin:v.toUpperCase()})),})
)
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:11},}
, React.createElement(Inp, { label: "Baujahr", value: f.baujahr||"", onChange: v=>setF(p=>({...p,baujahr:v})), type: "number",})
, React.createElement(Inp, { label: "KM-Stand", value: f.km||"", onChange: v=>setF(p=>({...p,km:v})), type: "number",})
)
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:11},}
, React.createElement(Sel, { label: "Kraftstoff", value: f.kraftstoff||"Benzin", onChange: v=>setF(p=>({...p,kraftstoff:v})), options: ["Benzin","Diesel","Elektro","Hybrid","Gas"].map(v=>({value:v,label:v})),})
, React.createElement(Sel, { label: "Getriebe", value: f.getriebe||"Schaltung", onChange: v=>setF(p=>({...p,getriebe:v})), options: ["Schaltung","Automatik","DSG","CVT"].map(v=>({value:v,label:v})),})
)
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:11},}
, React.createElement(Inp, { label: "kW", value: f.kw||"", onChange: v=>setF(p=>({...p,kw:v})), type: "number",})
, React.createElement(Inp, { label: "Hubraum ccm" , value: f.hubraum||"", onChange: v=>setF(p=>({...p,hubraum:v})), type: "number",})
)
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:11},}
, React.createElement(Inp, { label: "Farbcode", value: f.farb_code||"", onChange: v=>setF(p=>({...p,farb_code:v})), placeholder: "z.B. 040" ,})
, React.createElement(Inp, { label: "Reifengrösse", value: f.reifengroesse||"", onChange: v=>setF(p=>({...p,reifengroesse:v})), placeholder: "225/45 R17" ,})
)
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:11},}
, React.createElement(Inp, { label: "Erstzulassung", value: f.erstzulassung||"", onChange: v=>setF(p=>({...p,erstzulassung:v})), type: "date",})
, React.createElement(Inp, { label: "HU-Datum", value: f.hu_datum||"", onChange: v=>setF(p=>({...p,hu_datum:v})), type: "date",})
)
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:11},}
, React.createElement(Inp, { label: "AU-Datum", value: f.au_datum||"", onChange: v=>setF(p=>({...p,au_datum:v})), type: "date",})
, React.createElement(Inp, { label: "Nächste Inspektion" , value: f.naechste_inspektion||"", onChange: v=>setF(p=>({...p,naechste_inspektion:v})), type: "date",})
)
, React.createElement(Inp, { label: "Vorbesitzer", value: f.anzahl_vorbesitzer||"", onChange: v=>setF(p=>({...p,anzahl_vorbesitzer:v})), type: "number",})
);
}
function KundeFormFelder({f,setF}){
return React.createElement(React.Fragment, null
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:11},}
, React.createElement(Sel, { label: "Anrede", value: f.anrede||"Herr", onChange: v=>setF(p=>({...p,anrede:v})), options: ["Herr","Frau","Firma","Divers"].map(v=>({value:v,label:v})),})
, React.createElement(Sel, { label: "Typ", value: f.typ||"privat", onChange: v=>setF(p=>({...p,typ:v})), options: [{value:"privat",label:"Privatkunde"},{value:"firma",label:"Firmenkunde"},{value:"intern",label:"Intern"}],})
)
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:11},}
, React.createElement(Inp, { label: "Vorname", value: f.vorname||"", onChange: v=>setF(p=>({...p,vorname:v})),})
, React.createElement(Inp, { label: "Nachname *" , value: f.nachname||"", onChange: v=>setF(p=>({...p,nachname:v})),})
)
, React.createElement(Inp, { label: "Firma / Organisation"  , value: f.firma||"", onChange: v=>setF(p=>({...p,firma:v})),})
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:11},}
, React.createElement(Inp, { label: "Telefon", value: f.telefon||"", onChange: v=>setF(p=>({...p,telefon:v})), type: "tel",})
, React.createElement(Inp, { label: "E-Mail", value: f.email||"", onChange: v=>setF(p=>({...p,email:v})), type: "email",})
)
, React.createElement(Inp, { label: "WhatsApp (ohne +, z.B. 4917612345678)"    , value: f.whatsapp||"", onChange: v=>setF(p=>({...p,whatsapp:v})), placeholder: "4917612345678",})
, React.createElement(Inp, { label: "Strasse", value: f.strasse||"", onChange: v=>setF(p=>({...p,strasse:v})),})
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"100px 1fr",gap:11},}
, React.createElement(Inp, { label: "PLZ", value: f.plz||"", onChange: v=>setF(p=>({...p,plz:v})),})
, React.createElement(Inp, { label: "Ort", value: f.ort||"", onChange: v=>setF(p=>({...p,ort:v})),})
)
, React.createElement(Sel, { label: "Zahlungsmoral", value: f.zahlungsmoral||"gut", onChange: v=>setF(p=>({...p,zahlungsmoral:v})), options: [{value:"gut",label:"Gut"},{value:"mittel",label:"Mittel"},{value:"schlecht",label:"Schlecht"}],})
);
}
function Dashboard(){
const {data,setView,setSearchOpen}=useApp();
const m=useIsMobile();
const monatKey=new Date().toISOString().slice(0,7);
const offene=React.useMemo(()=>(data.auftraege||[]).filter(a=>a.status!=="abgeschlossen"&&a.status!=="storniert"),[data.auftraege]);
const monatU=React.useMemo(()=>(data.rechnungen||[]).filter(r=>_optionalChain([r, 'access', _21 => _21.datum, 'optionalAccess', _22 => _22.startsWith, 'call', _23 => _23(monatKey)])&&!r.storniert).reduce((s,r)=>s+round2(r.brutto||0),0),[data.rechnungen]);
const offeneP=React.useMemo(()=>(data.rechnungen||[]).filter(r=>!r.bezahlt&&!r.storniert).reduce((s,r)=>s+round2(r.brutto||0),0),[data.rechnungen]);
const huFaellig=React.useMemo(()=>(data.fahrzeuge||[]).filter(f=>f.hu_datum&&new Date(f.hu_datum)<=new Date(Date.now()+60*24*3600000)),[data.fahrzeuge]);
const uebFaellig=React.useMemo(()=>(data.rechnungen||[]).filter(r=>!r.bezahlt&&!r.storniert&&r.faellig&&new Date(r.faellig)<new Date()),[data.rechnungen]);
return React.createElement(Screen, { title: "Dashboard", action: React.createElement('div', { style: {display:"flex",gap:8},}
, React.createElement(Btn, { v: "primary", size: "sm", onClick: ()=>{setView("auftraege");},}, "+ Schnell" )
, React.createElement(Btn, { v: "secondary", size: "sm", onClick: ()=>setSearchOpen(true),}, React.createElement(Ic, { n: "search", s: 14,}))
),}
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},}
, React.createElement(Stat, { label: "Umsatz Monat" , value: eur(monatU), color: P.green, icon: "finanzen",})
, React.createElement(Stat, { label: "Offene Aufträge" , value: offene.length, sub: `${offene.filter(a=>a.status==="in_arbeit").length} in Arbeit`, color: P.blue, icon: "auftraege",})
, React.createElement(Stat, { label: "Offene Posten" , value: eur(offeneP), color: P.orange, icon: "rechnungen",})
, React.createElement(Stat, { label: "HU-Warnungen", value: huFaellig.length, sub: "nächste 60 Tage"  , color: P.red, icon: "warning",})
)
/* Diese Woche */
, (()=>{
const hd=new Date();hd.setHours(0,0,0,0);const i7=new Date(hd.getTime()+7*24*3600000);
const rows=[...(data.termine||[]).filter(t=>{const d=new Date(t.datum+"T12:00");return d>=hd&&d<=i7;}).slice(0,3).map(t=>{const k=(data.kunden||[]).find(x=>x.id===t.kunden_id);const isH=new Date(t.datum+"T12:00").setHours(0,0,0,0)===hd.getTime();return {c:isH?P.blue:"#C7C7CC",b:isH?"Heute":new Date(t.datum+"T12:00").toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}),t:t.titel,s:k?k.vorname+" "+k.nachname:"",fn:()=>setView("kalender")};}),...(data.auftraege||[]).filter(a=>a.fertigstellung_geplant&&new Date(a.fertigstellung_geplant)<=i7&&a.status!=="abgeschlossen").slice(0,2).map(au=>{const k=(data.kunden||[]).find(x=>x.id===au.kunden_id);return {c:P.orange,b:"Faellig",t:au.nr+(k?" "+k.vorname:""),s:"",fn:()=>setView("auftraege")};}),...((data.rechnungen||[]).filter(r=>!r.bezahlt&&!r.storniert).length?[{c:P.red,b:(data.rechnungen||[]).filter(r=>!r.bezahlt&&!r.storniert).length+" offen",t:"Offene Rechnungen",s:"",fn:()=>setView("rechnungen")}]:[]),...((data.lager||[]).filter(l=>(l.bestand||0)<=(l.mindestbestand||0)).length?[{c:P.orange,b:"Lager",t:(data.lager||[]).filter(l=>(l.bestand||0)<=(l.mindestbestand||0)).length+" unter Mindestbestand",s:"",fn:()=>setView("lager")}]:[]),];
if(!rows.length)return null;
return React.createElement('div', { style: {marginBottom:0},}, React.createElement(SecH, { title: "Diese Woche" , action: React.createElement('button', { onClick: ()=>setView("kalender"), style: {background:"none",border:"none",color:P.blue,fontSize:13,cursor:"pointer",fontWeight:500},}, "Kalender"),}), React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:6},}, rows.map((row,i)=>React.createElement('div', { key: i, onClick: row.fn, style: {display:"flex",alignItems:"center",gap:10,padding:"10px 13px",background:"#fff",borderRadius:11,border:"1px solid rgba(0,0,0,0.06)",cursor:"pointer"},}, React.createElement('div', { style: {width:3,height:28,background:row.c,borderRadius:2,flexShrink:0},}), React.createElement('div', { style: {flex:1,minWidth:0},}, React.createElement(Bdg, { color: row.c, small: true,}, row.b), React.createElement('div', { style: {color:"#1D1D1F",fontSize:13,fontWeight:500,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},}, row.t), row.s&&React.createElement('div', { style: {color:"#AEAEB2",fontSize:11},}, row.s)), React.createElement(Ic, { n: "chevronR", s: 13, c: "#C7C7CC",})))));
})()
, (huFaellig.length+uebFaellig.length)>0&&React.createElement(React.Fragment, null
, React.createElement(SecH, { title: `Erinnerungen (${huFaellig.length+uebFaellig.length})`,})
, React.createElement(Card, { noPad: true,}
, huFaellig.map((f,i,arr)=>{const k=(data.kunden||[]).find(x=>x.id===f.kunden_id);return React.createElement(Row, { key: f.id, icon: "warning", iconColor: P.orange, left: `HU fällig: ${f.kennzeichen}`, sub: `${f.marke} . ${_optionalChain([k, 'optionalAccess', _24 => _24.vorname])||""} ${_optionalChain([k, 'optionalAccess', _25 => _25.nachname])||""}`, badge: React.createElement(Bdg, { color: P.orange, small: true,}, "HU"), onClick: ()=>setView("kunden"), last: i===arr.length-1&&uebFaellig.length===0,});} )
, uebFaellig.map((r,i,arr)=>{const k=(data.kunden||[]).find(x=>x.id===r.kunden_id);return React.createElement(Row, { key: r.id, icon: "rechnungen", iconColor: P.red, left: `Überfällig: ${r.nr}`, sub: `${_optionalChain([k, 'optionalAccess', _26 => _26.vorname])||""} ${_optionalChain([k, 'optionalAccess', _27 => _27.nachname])||""} . ${eur(r.brutto||0)}`, badge: React.createElement(Bdg, { color: P.red, small: true,}, "Offen"), onClick: ()=>setView("rechnungen"), last: i===arr.length-1,});} )
)
)
, React.createElement(SecH, { title: "Offene Aufträge" , action: React.createElement('button', { onClick: ()=>setView("auftraege"), style: {background:"none",border:"none",color:P.blue,fontSize:13,cursor:"pointer",fontWeight:500,minHeight:36},}, "Alle ->" ),})
, React.createElement(Card, { noPad: true,}
, offene.slice(0,5).map((au,i,arr)=>{const k=(data.kunden||[]).find(x=>x.id===au.kunden_id),f=(data.fahrzeuge||[]).find(x=>x.id===au.fahrzeug_id),sc=SC[au.status]||SC.offen;return React.createElement(Row, { key: au.id, icon: "auftraege", iconColor: sc.c, left: `${au.nr} . ${_optionalChain([k, 'optionalAccess', _28 => _28.vorname])||""} ${_optionalChain([k, 'optionalAccess', _29 => _29.nachname])||""}`, sub: _optionalChain([f, 'optionalAccess', _30 => _30.kennzeichen])||"", right: eur(calcAU(au).brutto), badge: React.createElement(Bdg, { color: sc.c, bg: sc.bg, small: true,}, sc.label), onClick: ()=>setView("auftraege"), last: i===arr.length-1,});} )
, offene.length===0&&React.createElement('div', { style: {padding:"22px",textAlign:"center",color:"#AEAEB2",fontSize:14},}, "Keine offenen Aufträge"  )
)
);
}
function Auftraege(){
const {data,addRow,saveSettings,updateRow,notify,kvZuAuftrag,paketeAbrechnen}=useApp();
const [tab,setTab]=useState("auftraege");
const [selKV,setSelKV]=useState(null);
const [selAU,setSelAU]=useState(null);
const [showKVForm,setShowKVForm]=useState(false);
const [filterStatus,setFilterStatus]=useState("alle");
const [filterQ,setFilterQ]=useState("");
const [filterKV,setFilterKV]=useState("");
const [showSchnell,setShowSchnell]=useState(false);
if(selKV) return React.createElement(KVDetail, { kv: selKV, onBack: ()=>setSelKV(null),});
if(selAU){const au=(data.auftraege||[]).find(a=>a.id===selAU);if(au) return React.createElement(AuftragDetail, { au: au, onBack: ()=>setSelAU(null),});}
const kvListe=(data.angebote||[]).filter(a=>{
if(a.status!=="offen") return false;
if(filterKV){
const ql=filterKV.toLowerCase();
const k=(data.kunden||[]).find(x=>x.id===a.kunden_id);
const f=(data.fahrzeuge||[]).find(x=>x.id===a.fahrzeug_id);
return `${a.nr} ${_optionalChain([k, 'optionalAccess', _31 => _31.vorname])||""} ${_optionalChain([k, 'optionalAccess', _32 => _32.nachname])||""} ${_optionalChain([f, 'optionalAccess', _33 => _33.kennzeichen])||""} ${a.titel||""}`.toLowerCase().includes(ql);
}
return true;
});
const auListe=(data.auftraege||[]).filter(au=>{
if(filterStatus!=="alle"&&au.status!==filterStatus) return false;
if(filterQ){
const ql=filterQ.toLowerCase();
const k=(data.kunden||[]).find(x=>x.id===au.kunden_id);
const f=(data.fahrzeuge||[]).find(x=>x.id===au.fahrzeug_id);
return `${au.nr} ${_optionalChain([k, 'optionalAccess', _34 => _34.vorname])||""} ${_optionalChain([k, 'optionalAccess', _35 => _35.nachname])||""} ${_optionalChain([f, 'optionalAccess', _36 => _36.kennzeichen])||""} ${au.beschreibung||""}`.toLowerCase().includes(ql);
}
return true;
});
return React.createElement(Screen, { title: tab==="kv"?"Kostenvoranschläge":"Aufträge", action: React.createElement('div', { style: {display:"flex",gap:8},}
, tab==="kv"&&React.createElement(Btn, { size: "sm", onClick: ()=>setShowKVForm(true),}, React.createElement(Ic, { n: "plus", s: 14,}), " Neu" )
, React.createElement(Btn, { v: "secondary", size: "sm", onClick: ()=>setShowSchnell(true),}, React.createElement(Ic, { n: "plus", s: 13,}), " Schnell" )
),}
, React.createElement(Switcher, { options: [{v:"kv",l:"Kostenvoranschläge"},{v:"auftraege",l:"Aufträge"}], value: tab, onChange: setTab,})
, tab==="kv"&&React.createElement(React.Fragment, null
/* Suchfeld */
, React.createElement('div', { style: {position:"relative",marginBottom:10},}
, React.createElement('input', { value: filterKV, onChange: e=>setFilterKV(e.target.value), placeholder: "Name, Kennzeichen, Nr. suchen..."   , style: {width:"100%",background:"#FFFFFF",border:"1px solid rgba(60,60,67,0.2)",borderRadius:12,padding:"11px 14px 11px 40px",fontSize:14,color:"#1D1D1F",outline:"none",boxSizing:"border-box",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"},})
, React.createElement('div', { style: {position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"},}, React.createElement(Ic, { n: "search", s: 16, c: "#AEAEB2",}))
, filterKV&&React.createElement('button', { onClick: ()=>setFilterKV(""), style: {position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"rgba(120,120,128,0.2)",border:"none",borderRadius:"50%",width:20,height:20,cursor:"pointer",color:"#6E6E73",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",padding:0},}, "x")
)
, kvListe.length===0?React.createElement('div', { style: {textAlign:"center",padding:"48px 20px",color:"#AEAEB2",fontSize:14},}, React.createElement(Ic, { n: "auftraege", s: 40, c: "rgba(0,0,0,0.06)",}), React.createElement('div', { style: {marginTop:14},}, filterKV?"Keine Ergebnisse":"Keine offenen Kostenvoranschläge"), React.createElement('div', { style: {marginTop:8,fontSize:12},}, filterKV?"":"Erstelle einen neuen Kostenvoranschlag"))
:React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:10},}
, kvListe.map(kv=>{
const k=(data.kunden||[]).find(x=>x.id===kv.kunden_id),f=(data.fahrzeuge||[]).find(x=>x.id===kv.fahrzeug_id);
const c=calcPakete(kv.pakete||[]);
return React.createElement(Card, { key: kv.id, style: {padding:"15px"},}
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,cursor:"pointer"}, onClick: ()=>setSelKV(kv),}
, React.createElement('div', { style: {flex:1,minWidth:0,marginRight:12},}
, React.createElement('div', { style: {color:P.purple,fontSize:12,fontFamily:"monospace",fontWeight:700,marginBottom:4},}, kv.nr)
, React.createElement('div', { style: {color:"#1D1D1F",fontSize:15,fontWeight:600,marginBottom:3},}, kv.titel||kv.beschreibung||"-")
, React.createElement('div', { style: {color:"#6E6E73",fontSize:12},}, _optionalChain([k, 'optionalAccess', _37 => _37.vorname])||"", " " , _optionalChain([k, 'optionalAccess', _38 => _38.nachname])||"", f?` . ${f.kennzeichen}`:"")
, kv.fertigstellung_geplant&&React.createElement('div', { style: {color:"#AEAEB2",fontSize:12,marginTop:3},}, "Fertigstellung: " , datTime(kv.fertigstellung_geplant))
)
, React.createElement('div', { style: {textAlign:"right",flexShrink:0},}, React.createElement('div', { style: {color:P.green,fontSize:17,fontWeight:700},}, eur(c.brutto)), React.createElement('div', { style: {color:"#AEAEB2",fontSize:11,marginTop:2},}, dat(kv.datum)))
)
, React.createElement(Btn, { v: "blue_out", full: true, onClick: ()=>kvZuAuftrag(kv),}, React.createElement(Ic, { n: "check", s: 15, c: P.blue,}), " Kunde hat zugesagt - Auftrag erstellen"      )
);
})
)
)
, tab==="auftraege"&&React.createElement(React.Fragment, null
/* Filter */
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:10,marginBottom:14},}
, React.createElement('div', { style: {position:"relative"},}
, React.createElement('input', { value: filterQ, onChange: e=>setFilterQ(e.target.value), placeholder: "Auftragsnr., Kundenname, Kennzeichen..."  , style: {width:"100%",background:"#F2F2F7",border:`1.5px solid ${P.border}`,borderRadius:12,padding:"11px 14px 11px 42px",color:"#1D1D1F",fontSize:14,outline:"none",boxSizing:"border-box",minHeight:44},})
, React.createElement('div', { style: {position:"absolute",left:13,top:"50%",transform:"translateY(-50%)"},}, React.createElement(Ic, { n: "search", s: 16, c: P.textSub,}))
, filterQ&&React.createElement('button', { onClick: ()=>setFilterQ(""), style: {position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#AEAEB2",cursor:"pointer",fontSize:16},}, "x")
)
, React.createElement('div', { style: {display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2},}
, [{v:"alle",l:"Alle"},{v:"offen",l:"Offen"},{v:"in_arbeit",l:"In Arbeit"},{v:"klaerung",l:"Klärung"},{v:"wartet_teile",l:"Wartet auf Teile"},{v:"abgeschlossen",l:"Fertig"}].map(fi=>(
React.createElement('button', { key: fi.v, onClick: ()=>setFilterStatus(fi.v), style: {padding:"8px 14px",borderRadius:22,border:"none",background:filterStatus===fi.v?P.blue:"rgba(0,0,0,0.03)",color:filterStatus===fi.v?"#fff":"#6E6E73",cursor:"pointer",fontSize:12,fontWeight:500,whiteSpace:"nowrap",flexShrink:0,minHeight:36,transition:"all 0.12s"},}, fi.l)
))
)
)
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:10},}
, auListe.map(au=>{
const k=(data.kunden||[]).find(x=>x.id===au.kunden_id),f=(data.fahrzeuge||[]).find(x=>x.id===au.fahrzeug_id),sc=SC[au.status]||SC.offen,c=calcAU(au);
const offenePakete=(au.pakete||[]).filter(p=>p.paket_status==="offen");
return React.createElement(Card, { key: au.id, onClick: ()=>setSelAU(au.id), style: {padding:"15px"},}
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9},}
, React.createElement('div', { style: {flex:1,minWidth:0,marginRight:12},}
, React.createElement('div', { style: {display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"},}
, React.createElement('span', { style: {color:P.blue,fontSize:12,fontFamily:"monospace",fontWeight:700},}, au.nr)
, React.createElement(Bdg, { color: sc.c, bg: sc.bg, small: true,}, sc.label)
, offenePakete.length>0&&React.createElement(Bdg, { color: P.orange, small: true,}, offenePakete.length, " Paket" , offenePakete.length>1?"e":"", " offen" )
)
, React.createElement('div', { style: {color:"#1D1D1F",fontSize:15,fontWeight:600},}, _optionalChain([k, 'optionalAccess', _39 => _39.vorname])||"", " " , _optionalChain([k, 'optionalAccess', _40 => _40.nachname])||"")
, React.createElement('div', { style: {color:"#6E6E73",fontSize:12,marginTop:3},}, _optionalChain([f, 'optionalAccess', _41 => _41.kennzeichen])||"", f?` . ${f.marke||""} ${f.modell||""}`:"", ".")
)
, React.createElement('div', { style: {textAlign:"right",flexShrink:0},}, React.createElement('div', { style: {color:"#1D1D1F",fontSize:17,fontWeight:700},}, eur(c.brutto)))
)
, au.beschreibung&&React.createElement('div', { style: {color:"#6E6E73",fontSize:12,marginBottom:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},}, au.beschreibung)
, React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,justifyContent:"space-between"},}
, React.createElement('div', { style: {display:"flex",alignItems:"center",gap:6,color:au.timer_aktiv?P.green:"#AEAEB2"},}
, React.createElement(Ic, { n: "clock", s: 13, c: au.timer_aktiv?P.green:"#AEAEB2",})
, React.createElement('span', { style: {fontFamily:"monospace",fontSize:12},}, timerFmt(au.timer_gesamt_sek))
, au.timer_aktiv&&React.createElement('span', { style: {width:6,height:6,borderRadius:"50%",background:P.green,animation:"pulse 1s infinite",display:"inline-block"},})
)
, au.fertigstellung_geplant&&React.createElement('span', { style: {color:"#AEAEB2",fontSize:11,marginLeft:"auto"},}, "Fertig: " , datTime(au.fertigstellung_geplant))
)
);
})
, auListe.length===0&&React.createElement('div', { style: {textAlign:"center",padding:"48px 20px",color:"#AEAEB2",fontSize:14},}, filterQ||filterStatus!=="alle"?"Keine Ergebnisse":"Noch keine Aufträge")
)
)
, showKVForm&&React.createElement(KVForm, { onClose: ()=>setShowKVForm(false),})
, showSchnell&&React.createElement(SchnellauftragModal, { onClose: ()=>setShowSchnell(false),})
);
}
function KVDetail({kv,onBack}){
const {data,updateRow,deleteRow,notify,kvZuAuftrag}=useApp();
const {confirm,modal:confirmModal}=useConfirm();
const [editing,setEditing]=useState(false);
const [form,setForm]=useState({...kv,pakete:kv.pakete||[]});
const k=(data.kunden||[]).find(x=>x.id===kv.kunden_id),f=(data.fahrzeuge||[]).find(x=>x.id===kv.fahrzeug_id);
const save=async()=>{
const c=calcPakete(form.pakete||[]);
await updateRow("angebote",kv.id,{...form,netto:c.netto,mwst_betrag:c.mwst,brutto:c.brutto});
setEditing(false);notify("Kostenvoranschlag aktualisiert ");
};
return React.createElement(Screen, { title: kv.nr, onBack: onBack, action: React.createElement('div', { style: {display:"flex",gap:8},}
, React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>setEditing(v=>!v),}, React.createElement(Ic, { n: "edit", s: 14,}))
, React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>{const k2=(data.kunden||[]).find(x=>x.id===kv.kunden_id);const fz3=(data.fahrzeuge||[]).find(x=>x.id===kv.fahrzeug_id);shareKV({kv,kunde:k2,fahrzeug:fz3,settings:data.settings});},}, React.createElement(Ic, { n: "whatsapp", s: 14, c: "#25D366",}), " Teilen" )
, React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>{const k2=(data.kunden||[]).find(x=>x.id===kv.kunden_id);const fz2=(data.fahrzeuge||[]).find(x=>x.id===kv.fahrzeug_id);printDokument({typ:"kv",daten:kv,settings:data.settings,kunde:k2,fahrzeug:fz2});},}, React.createElement(Ic, { n: "download", s: 14,}), " Drucken" )
, React.createElement(Btn, { v: "danger", size: "sm", onClick: async()=>{
const {ok,grund}=kannKVLoeschen(kv);
if(!ok){notify(grund,"error");return;}
const ja=await confirm({title:"Kostenvoranschlag löschen?",message:`${kv.nr} wird unwiderruflich gelöscht.`,confirmLabel:"Löschen",confirmColor:"#FF3B30"});
if(ja){deleteRow("angebote",kv.id);onBack();}
},}, React.createElement(Ic, { n: "trash", s: 14, c: "#fff",}))
, React.createElement(Btn, { v: "blue_out", size: "sm", onClick: ()=>kvZuAuftrag(kv),}, React.createElement(Ic, { n: "check", s: 14, c: P.blue,}), " Zu Auftrag"  )
),}
, React.createElement('div', { style: {display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"},}
, React.createElement(Bdg, { color: P.purple,}, "Angebot gültig bis "   , dat(kv.gueltig_bis))
, React.createElement('span', { style: {color:"#6E6E73",fontSize:13,display:"flex",alignItems:"center",gap:4},}, _optionalChain([k, 'optionalAccess', _42 => _42.vorname])||"", " " , _optionalChain([k, 'optionalAccess', _43 => _43.nachname])||"", f?` . ${f.kennzeichen}`:"")
)
, editing?(
React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:14},}
, React.createElement(Inp, { label: "Titel / Betreff"  , value: form.titel||"", onChange: v=>setForm(p=>({...p,titel:v})),})
, React.createElement(Inp, { label: "Angebot gültig bis"  , value: form.gueltig_bis||"", onChange: v=>setForm(p=>({...p,gueltig_bis:v})), type: "date", note: "Wie lange gilt dein Preis?"    ,})
, React.createElement(Inp, { label: "Geplante Fertigstellung" , value: form.fertigstellung_geplant||"", onChange: v=>setForm(p=>({...p,fertigstellung_geplant:v})), type: "datetime-local",})
, React.createElement(PaketeEditor, { pakete: form.pakete||[], onChange: paks=>setForm(p=>({...p,pakete:paks})), settings: data.settings,})
, React.createElement('div', { style: {display:"flex",gap:8},}, React.createElement(Btn, { v: "primary", onClick: save,}, React.createElement(Ic, { n: "check", s: 15,}), " Speichern" ), React.createElement(Btn, { v: "ghost", onClick: ()=>setEditing(false),}, "Abbrechen"))
)
):(
React.createElement('div', null
, React.createElement(Card, { style: {marginBottom:14},}
, [["Nr.",kv.nr],["Erstellt",dat(kv.datum)],["Angebot gültig bis",dat(kv.gueltig_bis)],["Fertigstellung",kv.fertigstellung_geplant?datTime(kv.fertigstellung_geplant):"-"],["Beschreibung",kv.beschreibung||kv.titel||"-"]].map(([l,v],i,arr)=>(
React.createElement('div', { key: l, style: {display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<arr.length-1?`1px solid ${P.border}`:"none"},}, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, l), React.createElement('span', { style: {color:"#1D1D1F",fontSize:13,textAlign:"right",maxWidth:"60%"},}, v))
))
)
, React.createElement(PaketeEditor, { pakete: kv.pakete||[], onChange: ()=>{}, settings: data.settings, readOnly: true,})
, React.createElement('div', { style: {marginTop:14},}, React.createElement(Btn, { full: true, v: "blue_out", size: "lg", onClick: ()=>kvZuAuftrag(kv),}, React.createElement(Ic, { n: "check", s: 16, c: P.blue,}), " Kunde hat zugesagt - Auftrag erstellen"      ))
)
)
, confirmModal
);
}
function AuftragDetail({au:initAu,onBack}){
const {data,updateRow,deleteRow,notify,paketeAbrechnen}=useApp();
const {confirm,modal:confirmModal}=useConfirm();
const au=(data.auftraege||[]).find(a=>a.id===initAu.id)||initAu;
const [tab,setTab]=useState("info");
const [editing,setEditing]=useState(false);
const [ef,setEf]=useState({...au,pakete:au.pakete||[]});
const [selPakete,setSelPakete]=useState([]);
const [showAbrModal,setShowAbrModal]=useState(false);
const k=(data.kunden||[]).find(x=>x.id===au.kunden_id),f=(data.fahrzeuge||[]).find(x=>x.id===au.fahrzeug_id),sc=SC[au.status]||SC.offen,c=calcAU(au);
const offenePakete=(au.pakete||[]).filter(p=>p.paket_status==="offen"||!p.paket_status);
const setStatus=async s=>{
await updateRow("auftraege",au.id,{status:s});
notify(`Status: ${_optionalChain([SC, 'access', _44 => _44[s], 'optionalAccess', _45 => _45.label])||s}`);
};
const toggleTimer=async()=>{
const aktiv=!au.timer_aktiv;
await updateRow("auftraege",au.id,{timer_aktiv:aktiv,timer_gesamt_sek:au.timer_gesamt_sek});
notify(aktiv?"Timer gestartet >":"Timer pausiert ||");
};
const saveEdit=async()=>{
const c2=calcPakete(ef.pakete||[]);
await updateRow("auftraege",au.id,{...ef,netto:c2.netto,mwst_betrag:c2.mwst,brutto:c2.brutto});
setEditing(false);notify("Auftrag aktualisiert ");
};
const handleFile=e=>{
Array.from(e.target.files||[]).forEach(file=>{
const reader=new FileReader();
reader.onload=ev=>{
const item={id:uid(),name:file.name,type:file.type,size:file.size,data:ev.target.result,datum:tod()};
if(file.type.startsWith("image/")) updateRow("auftraege",au.id,{fotos:[...(au.fotos||[]),item]});
else updateRow("auftraege",au.id,{pdfs:[...(au.pdfs||[]),item]});
};
reader.readAsDataURL(file);
});
};
const TABS=[{v:"info",l:"Info"},{v:"pakete",l:`Pakete${offenePakete.length>0?" ("+offenePakete.length+")":""}`},{v:"annahme",l:"Annahme"},{v:"timer",l:"Stechuhr"},{v:"checkliste",l:"Checkliste"},{v:"dateien",l:"Dateien"}];
return React.createElement(Screen, { title: au.nr, onBack: onBack, action: React.createElement('div', { style: {display:"flex",gap:8},}
, React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>setEditing(v=>!v),}, React.createElement(Ic, { n: "edit", s: 14,}))
, React.createElement(Btn, { v: "danger", size: "sm", onClick: async()=>{
const {ok,grund}=kannAuftragLoeschen(au,data.rechnungen);
if(!ok){notify(grund,"error");return;}
const ja=await confirm({title:"Auftrag löschen?",message:`${au.nr} wird unwiderruflich gelöscht.`,confirmLabel:"Löschen",confirmColor:"#FF3B30"});
if(ja){
deleteRow("auftraege",au.id);onBack();
}
},}, React.createElement(Ic, { n: "trash", s: 14, c: "#fff",}))
),}
, React.createElement('div', { style: {display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"},}
, React.createElement(Bdg, { color: sc.c, bg: sc.bg,}, sc.label)
, au.timer_aktiv&&React.createElement('span', { style: {color:P.green,fontSize:12,display:"flex",alignItems:"center",gap:5},}, React.createElement('span', { style: {width:7,height:7,borderRadius:"50%",background:P.green,animation:"pulse 1s infinite",display:"inline-block"},}), timerFmt(au.timer_gesamt_sek))
)
/* Status Schnellwahl */
, React.createElement('div', { style: {display:"flex",gap:6,marginBottom:14,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2},}
, Object.entries(SC).filter(([k2])=>k2!=="storniert").map(([k2,v])=>(
React.createElement('button', { key: k2, onClick: ()=>setStatus(k2), style: {padding:"8px 13px",borderRadius:22,border:`1.5px solid ${au.status===k2?v.c:P.border}`,background:au.status===k2?v.bg:"transparent",color:au.status===k2?v.c:P.textSub,cursor:"pointer",fontSize:12,whiteSpace:"nowrap",fontWeight:500,flexShrink:0,minHeight:36,transition:"all 0.12s"},}, v.label)
))
)
/* Offene Pakete abrechnen */
, !au.annahme_km&&au.status!=="abgeschlossen"&&au.status!=="storniert"&&React.createElement('div', { style: {padding:"11px 14px",background:"rgba(255,149,0,0.07)",border:"1px solid rgba(255,149,0,0.2)",borderRadius:12,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10},}
, React.createElement('span', { style: {color:P.orange,fontSize:13,fontWeight:500,fontFamily:FA},}, "KM-Stand nicht eingetragen"  )
, React.createElement('div', { style: {display:"flex",gap:7},}, React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>setTab("info"),}, "Eintragen"), React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>updateRow("auftraege",au.id,{annahme_km:-1}),}, "Uberspringen"))
)
, offenePakete.length>0&&React.createElement('div', { style: {padding:"14px",background:"rgba(255,159,10,0.08)",border:`1px solid rgba(255,159,10,0.25)`,borderRadius:14,marginBottom:14},}
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",gap:12},}
, React.createElement('div', null
, React.createElement('div', { style: {color:P.orange,fontSize:14,fontWeight:700,marginBottom:4},}, offenePakete.length, " Paket" , offenePakete.length>1?"e":"", " noch nicht abgerechnet"   )
, React.createElement('div', { style: {color:"#6E6E73",fontSize:12},}, eur(calcOffenePakete(au.pakete||[]).brutto), " ausstehend" )
)
, React.createElement(Btn, { v: "orange_out", size: "sm", onClick: ()=>setShowAbrModal(true),}, React.createElement(Ic, { n: "rechnungen", s: 14, c: P.orange,}), " Pakete abrechnen"  )
)
)
, React.createElement(Tabs, { tabs: TABS, active: tab, onChange: setTab,})
, tab==="info"&&(editing?(
React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:13},}
, React.createElement(Inp, { label: "Beschreibung", value: ef.beschreibung||"", onChange: v=>setEf(p=>({...p,beschreibung:v})), rows: 3,})
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},}
, React.createElement(Inp, { label: "Fertigstellung", value: ef.fertigstellung_geplant||"", onChange: v=>setEf(p=>({...p,fertigstellung_geplant:v})), type: "datetime-local",})
)
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:11},}
, React.createElement(Inp, { label: "KM-Stand bei Annahme"  , value: ef.annahme_km||"", onChange: v=>setEf(p=>({...p,annahme_km:v})), type: "number", suffix: "km",})
, React.createElement(Inp, { label: "KM-Stand bei Abgabe"  , value: ef.abgabe_km||"", onChange: v=>setEf(p=>({...p,abgabe_km:v})), type: "number", suffix: "km",})
, React.createElement(Inp, { label: "KM-Stand", value: ef.annahme_km||"", onChange: v=>setEf(p=>({...p,annahme_km:v})), type: "number", suffix: "km",})
)
, React.createElement(Inp, { label: "Interne Notiz" , value: ef.interne_notiz||"", onChange: v=>setEf(p=>({...p,interne_notiz:v})), rows: 2,})
, React.createElement('div', { style: {display:"flex",gap:8},}, React.createElement(Btn, { v: "primary", onClick: saveEdit,}, React.createElement(Ic, { n: "check", s: 15,}), " Speichern" ), React.createElement(Btn, { v: "ghost", onClick: ()=>setEditing(false),}, "Abbrechen"))
)
):(
React.createElement(React.Fragment, null
, React.createElement(Card, { style: {marginBottom:12},}
, [["Auftrag",au.nr],["KV-Bezug",au.kv_id||"-"],["Erstellt",dat(au.erstellt)],["KM-Stand",`${(au.annahme_km||0).toLocaleString("de-DE")} km`],["Fertigstellung",au.fertigstellung_geplant?datTime(au.fertigstellung_geplant):"-"]].map(([l,v],i,arr)=>(
React.createElement('div', { key: l, style: {display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<arr.length-1?`1px solid ${P.border}`:"none"},}, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, l), React.createElement('span', { style: {color:"#1D1D1F",fontSize:13,textAlign:"right",maxWidth:"60%"},}, v))
))
, au.beschreibung&&React.createElement('div', { style: {paddingTop:10},}, React.createElement('div', { style: {color:"#6E6E73",fontSize:13,marginBottom:6},}, "Beschreibung"), React.createElement('div', { style: {color:"#1D1D1F",fontSize:14,lineHeight:1.6},}, au.beschreibung))
)
, React.createElement(Card, null
, [["Arbeit netto",eur(c.aN)],["Material netto",eur(c.mN)],["MwSt. 19%",eur(c.mwst)]].map(([l,v])=>React.createElement('div', { key: l, style: {display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(60,60,67,0.10)"},}, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, l), React.createElement('span', { style: {color:"#1D1D1F",fontSize:13},}, v)))
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",paddingTop:11},}, React.createElement('span', { style: {color:"#1D1D1F",fontSize:15,fontWeight:700},}, "Brutto"), React.createElement('span', { style: {color:P.green,fontSize:19,fontWeight:700},}, eur(c.brutto)))
)
)
))
, tab==="pakete"&&React.createElement(React.Fragment, null
, React.createElement(PaketeEditor, { pakete: au.pakete||[], onChange: paks=>updateRow("auftraege",au.id,{pakete:paks}), settings: data.settings, auKvId: au.kv_id,})
, offenePakete.length>0&&React.createElement('div', { style: {marginTop:14},}, React.createElement(Btn, { full: true, v: "orange_out", size: "lg", onClick: ()=>setShowAbrModal(true),}, React.createElement(Ic, { n: "rechnungen", s: 16, c: P.orange,}), " Offene Pakete in Rechnung stellen"     ))
)
, tab==="timer"&&React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:13},}
, React.createElement(Card, { style: {padding:"32px 16px",textAlign:"center"},}
, React.createElement('div', { style: {fontSize:52,fontFamily:"monospace",fontWeight:300,color:au.timer_aktiv?P.green:"#1D1D1F",letterSpacing:5,marginBottom:8,lineHeight:1},}, timerFmt(au.timer_gesamt_sek))
, React.createElement('div', { style: {color:"#AEAEB2",fontSize:13,marginBottom:26},}, au.timer_aktiv?"* Timer läuft":"|| Pausiert")
, React.createElement('div', { style: {display:"flex",justifyContent:"center",gap:10},}
, React.createElement(Btn, { v: au.timer_aktiv?"secondary":"success", size: "lg", onClick: toggleTimer,}, React.createElement(Ic, { n: au.timer_aktiv?"pause":"play", s: 17,}), au.timer_aktiv?" Pause":" Start")
, React.createElement(Btn, { v: "ghost", size: "lg", onClick: ()=>updateRow("auftraege",au.id,{timer_aktiv:false,timer_gesamt_sek:0}),}, "Reset")
)
)
, React.createElement(Card, null
, [["Soll-AW",c.sollAW.toFixed(2)+" AW","#1D1D1F"],["Ist-Zeit",c.istStd.toFixed(2)+" h","#1D1D1F"],["Eff. Stundensatz",c.istStd>0?eur(c.effStd)+" / h":"-","#1D1D1F"],["Deckungsbeitrag",eur(round2(c.netto-c.mEK)),round2(c.netto-c.mEK)>=0?P.green:P.red]].map(([l,v,col])=>React.createElement('div', { key: l, style: {display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(60,60,67,0.08)"},}, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, l), React.createElement('span', { style: {color:col,fontSize:13,fontWeight:l==="Deckungsbeitrag"?700:500},}, v)))
)
)
, tab==="annahme"&&React.createElement(AnnahmeTab, { au: au, onSave: updated=>updateRow("auftraege",au.id,{annahme_protokoll:updated}),})
, tab==="checkliste"&&React.createElement(ChecklisteTab, { au: au, onSave: updated=>updateRow("auftraege",au.id,{checkliste:updated}),})
, tab==="dateien"&&React.createElement('div', null
, React.createElement('label', { style: {display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"24px",background:"#F2F2F7",border:`2px dashed ${P.border}`,borderRadius:14,cursor:"pointer",marginBottom:14,minHeight:100,justifyContent:"center"},}
, React.createElement(Ic, { n: "scan", s: 28, c: P.textSub,})
, React.createElement('span', { style: {color:"#6E6E73",fontSize:14,fontWeight:500},}, "Fotos, Scans & PDFs hochladen"    )
, React.createElement('input', { type: "file", accept: "image/*,.pdf", multiple: true, capture: "environment", onChange: handleFile, style: {display:"none"},})
)
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8},}
, (au.fotos||[]).map(foto=>React.createElement('div', { key: foto.id, style: {position:"relative",borderRadius:12,overflow:"hidden",aspectRatio:"1",background:"rgba(0,0,0,0.025)"},}
, React.createElement('img', { src: foto.data, alt: foto.name, style: {width:"100%",height:"100%",objectFit:"cover"},})
, React.createElement('button', { onClick: ()=>updateRow("auftraege",au.id,{fotos:(au.fotos||[]).filter(x=>x.id!==foto.id)}), style: {position:"absolute",top:5,right:5,width:26,height:26,borderRadius:"50%",background:"rgba(0,0,0,0.7)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},}, React.createElement(Ic, { n: "trash", s: 12, c: P.red,}))
))
)
)
, showAbrModal&&React.createElement(PaketeAbrModal, { au: au, onClose: ()=>setShowAbrModal(false), onAbrechnen: paketeAbrechnen,})
, confirmModal
);
}
function AnnahmeTab({au,onSave}){
const [p,setP]=React.useState(au.annahme_protokoll||{km:"",tankstand:"voll",schaden:[],notizen:"",fotos:[],zeitpunkt:null});
const upd=v=>{const u={...p,...v};setP(u);onSave(u);};
const B=["Frontscheibe","Heckscheibe","Motorhaube","Kofferraum","Tür VL","Tür VR","Tür HL","Tür HR","Stoßstange v","Stoßstange h","Dach","Sonstiges"];
const [nS,setNS]=React.useState("");const [bS,setBS]=React.useState(B[0]);
return React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:10},}
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:11},}, React.createElement(Inp, { label: "KM bei Annahme"  , value: p.km||"", onChange: v=>upd({km:v}), type: "number", suffix: "km",}), React.createElement(Sel, { label: "Tankstand", value: p.tankstand||"voll", onChange: v=>upd({tankstand:v}), options: ["voll","3/4","1/2","1/4","Reserve","Leer"].map(v=>({value:v,label:v})),}))
, React.createElement(Inp, { value: p.notizen||"", onChange: v=>upd({notizen:v}), rows: 2, placeholder: "Kundenwunsch / Hinweise..."  ,})
, React.createElement(Card, { style: {padding:"12px 14px"},}, React.createElement('div', { style: {color:"#6E6E73",fontSize:11,fontWeight:700,textTransform:"uppercase",marginBottom:8},}, "Schäden")
, React.createElement('div', { style: {display:"flex",gap:7,marginBottom:7},}, React.createElement('div', { style: {flex:2},}, React.createElement(Sel, { value: bS, onChange: setBS, options: B.map(v=>({value:v,label:v})),})), React.createElement('div', { style: {flex:3},}, React.createElement(Inp, { value: nS, onChange: setNS, placeholder: "Beschreibung",})), React.createElement(Btn, { size: "md", onClick: ()=>{if(nS.trim()){upd({schaden:[...(p.schaden||[]),{id:uid(),bereich:bS,beschreibung:nS}]});setNS("");}},}, "+"))
, (p.schaden||[]).map((s,i)=>React.createElement('div', { key: s.id, style: {display:"flex",alignItems:"center",gap:7,padding:"5px 9px",background:"#F5F5F7",borderRadius:8,marginBottom:4},}, React.createElement(Bdg, { color: P.orange, small: true,}, s.bereich), React.createElement('span', { style: {flex:1,fontSize:12},}, s.beschreibung), React.createElement('button', { onClick: ()=>upd({schaden:(p.schaden||[]).filter((_,j)=>j!==i)}), style: {background:"none",border:"none",color:"#AEAEB2",cursor:"pointer"},}, "x")))
)
, React.createElement('label', { style: {display:"flex",alignItems:"center",gap:8,padding:"9px",background:"rgba(0,122,255,0.06)",border:"1.5px dashed rgba(0,122,255,0.25)",borderRadius:10,cursor:"pointer"},}, React.createElement(Ic, { n: "photo", s: 13, c: P.blue,}), React.createElement('span', { style: {color:P.blue,fontSize:13,fontWeight:600},}, "Fotos"), React.createElement('input', { type: "file", accept: "image/*", multiple: true, capture: "environment", onChange: e=>{Array.from(e.target.files||[]).forEach(f=>{const r=new FileReader();r.onload=ev=>{upd({fotos:[...(p.fotos||[]),{id:uid(),data:ev.target.result}]});};r.readAsDataURL(f);});}, style: {display:"none"},}))
, (p.fotos||[]).length>0&&React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4},}, (p.fotos||[]).map((f,i)=>React.createElement('div', { key: f.id, style: {position:"relative",borderRadius:6,overflow:"hidden",aspectRatio:"1"},}, React.createElement('img', { src: f.data, style: {width:"100%",height:"100%",objectFit:"cover"},}), React.createElement('button', { onClick: ()=>upd({fotos:(p.fotos||[]).filter((_,j)=>j!==i)}), style: {position:"absolute",top:2,right:2,background:"rgba(0,0,0,0.5)",border:"none",borderRadius:"50%",width:17,height:17,color:"#fff",cursor:"pointer",fontSize:9},}, "x"))))
, !p.zeitpunkt?React.createElement(Btn, { full: true, v: "primary", onClick: ()=>upd({zeitpunkt:new Date().toISOString()}),}, "Annahme abschliessen" ):React.createElement('div', { style: {padding:"8px",background:"rgba(52,199,89,0.08)",borderRadius:9,border:"1px solid rgba(52,199,89,0.2)",textAlign:"center",color:P.green,fontSize:12,fontWeight:600},}, "Annahme: " , new Date(p.zeitpunkt).toLocaleString("de-DE"))
);
}
function ChecklisteTab({au,onSave}){
const [newCI,setNewCI]=useState("");
const addCI=()=>{if(!newCI.trim())return;onSave([...(au.checkliste||[]),{id:uid(),text:newCI,done:false}]);setNewCI("");};
return React.createElement('div', null
, React.createElement('div', { style: {display:"flex",gap:8,marginBottom:14},}
, React.createElement('input', { value: newCI, onChange: e=>setNewCI(e.target.value), onKeyDown: e=>e.key==="Enter"&&addCI(), placeholder: "Neuer Punkt..." , style: {flex:1,background:"#F2F2F7",border:`1.5px solid ${P.border}`,borderRadius:12,padding:"11px 14px",color:"#1D1D1F",fontSize:14,outline:"none",minHeight:44},})
, React.createElement(Btn, { v: "primary", onClick: addCI, size: "md",}, React.createElement(Ic, { n: "plus", s: 15,}))
)
, (au.checkliste||[]).map(item=>(
React.createElement('div', { key: item.id, style: {display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"transparent",borderRadius:12,marginBottom:7},}
, React.createElement('button', { onClick: ()=>onSave((au.checkliste||[]).map(c=>c.id===item.id?{...c,done:!c.done}:c)), style: {width:26,height:26,borderRadius:8,background:item.done?P.green:"rgba(0,0,0,0.06)",border:`1.5px solid ${item.done?P.green:P.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.12s"},}, item.done&&React.createElement(Ic, { n: "check", s: 13, c: "#fff",}))
, React.createElement('span', { style: {flex:1,color:item.done?P.textSub:"#fff",fontSize:14,textDecoration:item.done?"line-through":"none"},}, item.text)
, React.createElement('button', { onClick: ()=>onSave((au.checkliste||[]).filter(c=>c.id!==item.id)), style: {background:"none",border:"none",cursor:"pointer",padding:4,display:"flex"},}, React.createElement(Ic, { n: "trash", s: 14, c: P.red,}))
)
))
, (au.checkliste||[]).length===0&&React.createElement('div', { style: {textAlign:"center",padding:"24px",color:"#AEAEB2",fontSize:14},}, "Keine Punkte" )
, (au.checkliste||[]).length>0&&React.createElement('div', { style: {padding:"11px 14px",background:"transparent",borderRadius:11,display:"flex",justifyContent:"space-between"},}
, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, "Fortschritt")
, React.createElement('span', { style: {color:P.green,fontSize:13,fontWeight:600},}, (au.checkliste||[]).filter(c=>c.done).length, " / "  , (au.checkliste||[]).length)
)
);
}
// Modal: Pakete auswählen zum Abrechnen
function PaketeAbrModal({au,onClose,onAbrechnen}){
const offene=(au.pakete||[]).filter(p=>p.paket_status==="offen"||!p.paket_status);
const [sel,setSel]=useState(offene.map(p=>p.id));
const selPakete=offene.filter(p=>sel.includes(p.id));
const total=calcPakete(selPakete);
const toggle=id=>setSel(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
return React.createElement(Modal, { title: "Pakete in Rechnung stellen"   , onClose: onClose,}
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:12},}
, React.createElement('div', { style: {padding:"12px 14px",background:"rgba(255,159,10,0.08)",borderRadius:12,color:"#6E6E73",fontSize:13,lineHeight:1.5},}, "Wähle welche Pakete jetzt abgerechnet werden sollen. Bezahlte Pakete bleiben gesperrt."

)
, offene.map(p=>{
const pc=calcPakete([p]);
const checked=sel.includes(p.id);
return React.createElement('div', { key: p.id, onClick: ()=>toggle(p.id), style: {display:"flex",alignItems:"center",gap:12,padding:"13px 14px",background:checked?"rgba(10,132,255,0.1)":"rgba(0,0,0,0.03)",border:`1.5px solid ${checked?"rgba(10,132,255,0.4)":P.border}`,borderRadius:13,cursor:"pointer",transition:"all 0.12s"},}
, React.createElement('div', { style: {width:24,height:24,borderRadius:7,background:checked?P.blue:"#F2F2F7",border:`1.5px solid ${checked?P.blue:P.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.12s"},}, checked&&React.createElement(Ic, { n: "check", s: 13, c: "#fff",}))
, React.createElement('div', { style: {flex:1,minWidth:0},}
, React.createElement('div', { style: {color:"#1D1D1F",fontSize:14,fontWeight:500},}, p.beanstandung||`Paket`)
, React.createElement('div', { style: {color:"#6E6E73",fontSize:12,marginTop:2},}, (p.arbeiten||[]).length, " Arb. . "   , (p.material||[]).length, " Teile" )
)
, React.createElement('span', { style: {color:P.green,fontSize:14,fontWeight:700,flexShrink:0},}, eur(pc.brutto))
);
})
, sel.length>0&&React.createElement('div', { style: {padding:"12px 14px",background:"rgba(48,209,88,0.07)",borderRadius:12},}
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",marginBottom:4},}, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, "Netto"), React.createElement('span', { style: {color:"#1D1D1F",fontSize:13},}, eur(total.netto)))
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",marginBottom:4},}, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, "MwSt. 19%" ), React.createElement('span', { style: {color:"#1D1D1F",fontSize:13},}, eur(total.mwst)))
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",paddingTop:8,borderTop:"1px solid rgba(60,60,67,0.10)"},}, React.createElement('span', { style: {color:"#1D1D1F",fontSize:15,fontWeight:700},}, "Brutto"), React.createElement('span', { style: {color:P.green,fontSize:18,fontWeight:700},}, eur(total.brutto)))
)
, React.createElement(Btn, { full: true, v: "success", size: "lg", disabled: sel.length===0, onClick: async()=>{await onAbrechnen(au,sel);onClose();},}
, React.createElement(Ic, { n: "rechnungen", s: 16,}), " Rechnung erstellen ("   , sel.length, " Paket" , sel.length!==1?"e":"", ")"
)
, React.createElement(Btn, { full: true, v: "ghost", onClick: onClose,}, "Abbrechen")
)
);
}
function KVForm({onClose}){
const {data,addRow,saveSettings,notify}=useApp();
const [step,setStep]=useState(0); // 0=Basis, 1=Fahrzeug, 2=Pakete
const [f,setF]=useState({kunden_id:"",fahrzeug_id:"",titel:"",beschreibung:"",gueltig_bis:"",fertigstellung_geplant:"",pakete:[]});
const [showNK,setShowNK]=useState(false);
const [showNFz,setShowNFz]=useState(false);
const [nK,setNK]=useState({anrede:"Herr",vorname:"",nachname:"",firma:"",typ:"privat",telefon:"",email:"",whatsapp:"",strasse:"",plz:"",ort:"",zahlungsmoral:"gut"});
const [nFz,setNFz]=useState({kennzeichen:"",vin:"",marke:"",modell:"",baujahr:String(new Date().getFullYear()),kraftstoff:"Benzin",km:"",hu_datum:"",au_datum:"",hubraum:"",kw:"",ps:"",getriebe:"Schaltung",farbe:"",farb_code:"",reifengroesse:"",erstzulassung:"",naechste_inspektion:"",anzahl_vorbesitzer:"",fahrzeugschein:null});
const [lK,setLK]=useState(data.kunden||[]);
const [lFz,setLFz]=useState(data.fahrzeuge||[]);
const kFz=lFz.filter(x=>x.kunden_id===f.kunden_id);
const handleK=async()=>{
if(!nK.nachname){notify("Nachname erforderlich","error");return;}
const nr=`KD-${String(lK.length+4).padStart(4,"0")}`;
const row={id:uid(),nr,...nK,erstellt:tod(),interne_bewertung:3,tags:[],notizen:""};
const s=await addRow("kunden",row);setLK(p=>[s,...p]);setF(p=>({...p,kunden_id:s.id,fahrzeug_id:""}));setShowNK(false);notify("Kunde angelegt ");
};
const handleFz=async()=>{
if(!nFz.kennzeichen||!nFz.marke){notify("Kennzeichen + Marke erforderlich","error");return;}
const row={id:uid(),...nFz,kunden_id:f.kunden_id,km:parseInt(nFz.km)||0,baujahr:parseInt(nFz.baujahr)||new Date().getFullYear(),letzte_inspektion:null,notizen:""};
const s=await addRow("fahrzeuge",row);setLFz(p=>[s,...p]);setF(p=>({...p,fahrzeug_id:s.id}));setShowNFz(false);notify("Fahrzeug angelegt ");
};
const submit=async()=>{
if(!f.titel||!f.kunden_id){notify("Titel + Kunde erforderlich","error");return;}
const nr=genNr("KV",_optionalChain([data, 'access', _46 => _46.settings, 'optionalAccess', _47 => _47.naechste_kv_nr])||1);
const glt=new Date();glt.setDate(glt.getDate()+30);
const c=calcPakete(f.pakete||[]);
await addRow("angebote",{id:uid(),nr,...f,datum:tod(),gueltig_bis:f.gueltig_bis||glt.toISOString().slice(0,10),netto:c.netto,mwst_betrag:c.mwst,brutto:c.brutto,status:"offen"});
await saveSettings({naechste_kv_nr:(_optionalChain([data, 'access', _48 => _48.settings, 'optionalAccess', _49 => _49.naechste_kv_nr])||1)+1});
notify(`Kostenvoranschlag ${nr} erstellt `);onClose();
};
return React.createElement(Modal, { title: "Neuer Kostenvoranschlag" , onClose: onClose, wide: true,}
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:14},}
, React.createElement(Inp, { label: "Titel / Betreff *"   , value: f.titel, onChange: v=>setF(p=>({...p,titel:v})), placeholder: "z.B. Inspektion + Bremsanlage HV"    ,})
/* Kunde - mit Live-Suche */
, React.createElement('div', null
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7},}
, React.createElement('span', { style: {color:"#6E6E73",fontSize:12,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase"},})
, React.createElement('button', { onClick: ()=>setShowNK(v=>!v), style: {background:"none",border:"none",color:P.blue,fontSize:13,cursor:"pointer",fontWeight:500,display:"flex",alignItems:"center",gap:4,minHeight:36},}, React.createElement(Ic, { n: "plus", s: 13, c: P.blue,}), showNK?"Abbrechen":"+ Neuer Kunde")
)
, !showNK?React.createElement(KundenSuche, { kunden: lK, value: f.kunden_id, onChange: v=>setF(p=>({...p,kunden_id:v,fahrzeug_id:""})),})
:React.createElement('div', { style: {background:"rgba(10,132,255,0.07)",border:"1px solid rgba(10,132,255,0.22)",borderRadius:13,padding:"14px"},}
, React.createElement('div', { style: {color:P.blue,fontSize:11,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:12},}, "Neuer Kunde" )
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:11},}, React.createElement(KundeFormFelder, { f: nK, setF: setNK,}))
, React.createElement('div', { style: {display:"flex",gap:8,marginTop:14},}, React.createElement(Btn, { v: "primary", size: "sm", onClick: handleK,}, React.createElement(Ic, { n: "check", s: 13,}), " Anlegen & wählen"   ), React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>setShowNK(false),}, "Abbrechen"))
)
)
/* Fahrzeug */
, f.kunden_id&&React.createElement('div', null
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7},}
, React.createElement('label', { style: {color:"#6E6E73",fontSize:12,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase"},}, "Fahrzeug")
, React.createElement('button', { onClick: ()=>setShowNFz(v=>!v), style: {background:"none",border:"none",color:P.green,fontSize:13,cursor:"pointer",fontWeight:500,display:"flex",alignItems:"center",gap:4,minHeight:36},}, React.createElement(Ic, { n: "plus", s: 13, c: P.green,}), showNFz?"Abbrechen":"+ Neues Fahrzeug")
)
, !showNFz?React.createElement(Sel, { value: f.fahrzeug_id, onChange: v=>setF(p=>({...p,fahrzeug_id:v})), options: [{value:"",label:"- Kein Fahrzeug -"},...kFz.map(x=>({value:x.id,label:`${x.kennzeichen} - ${x.marke} ${x.modell||""}`}))],})
:React.createElement('div', { style: {background:"rgba(48,209,88,0.07)",border:"1px solid rgba(48,209,88,0.22)",borderRadius:13,padding:"14px"},}
, React.createElement('div', { style: {color:P.green,fontSize:11,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:12},}, "Neues Fahrzeug" )
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:11},}, React.createElement(FahrzeugFormFelder, { f: nFz, setF: setNFz, withScan: true,}))
, React.createElement('div', { style: {display:"flex",gap:8,marginTop:14},}, React.createElement(Btn, { v: "success", size: "sm", onClick: handleFz,}, React.createElement(Ic, { n: "check", s: 13,}), " Anlegen & wählen"   ), React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>setShowNFz(false),}, "Abbrechen"))
)
)
, React.createElement(Inp, { label: "Angebot gültig bis"  , value: f.gueltig_bis, onChange: v=>setF(p=>({...p,gueltig_bis:v})), type: "date", note: "Wie lange gilt dein Preis? (Standard: 30 Tage)"       ,})
, React.createElement(Inp, { label: "Geplante Fertigstellung" , value: f.fertigstellung_geplant, onChange: v=>setF(p=>({...p,fertigstellung_geplant:v})), type: "date", note: "Wird automatisch in den Kalender eingetragen"     ,})
, React.createElement(Inp, { label: "Interne Notiz" , value: f.beschreibung, onChange: v=>setF(p=>({...p,beschreibung:v})), rows: 2, placeholder: "Optional...",})
, React.createElement(PaketeEditor, { pakete: f.pakete||[], onChange: paks=>setF(p=>({...p,pakete:paks})), settings: data.settings,})
, React.createElement(Btn, { full: true, onClick: submit, size: "lg",}, React.createElement(Ic, { n: "check", s: 16,}), " Kostenvoranschlag erstellen"  )
)
);
}
function SchnellauftragModal({onClose}){
const {data,schnellauftragErstellen,notify,setView}=useApp();
const [kunden_id,setKId]=useState("");
const [fahrzeug_id,setFId]=useState("");
const [laufkunde,setLK]=useState(false);
const [betrag,setBetrag]=useState("");
const [beschreibung,setBeschreibung]=useState("");
const [km,setKm]=useState("");
const [kmWarn,setKmWarn]=useState(false);
const [loading2,setLoading2]=useState(false);
const kFz=(data.fahrzeuge||[]).filter(f=>f.kunden_id===kunden_id);
const submit=async()=>{
if(!laufkunde&&!kunden_id){notify("Kunde waehlen","error");return;}
if(!betrag){notify("Betrag erforderlich","error");return;}
if(!km&&!kmWarn){setKmWarn(true);return;}
if(parseFloat(betrag)>=250&&laufkunde&&!beschreibung){notify("Ab 250€: Name/Beschreibung Pflicht (SS33 UStDV)","error");return;}
setLoading2(true);
const r=await schnellauftragErstellen({kunden_id:laufkunde?"laufkunde":kunden_id,fahrzeug_id:fahrzeug_id||null,beschreibung,pakete:[],schnellmodus:true,schnell_betrag:betrag,schnell_beschreibung:beschreibung,annahme_km:km||null});
setLoading2(false);
if(r){onClose();setView("auftraege");}
};
return React.createElement(Modal, { title: "Schnellauftrag", onClose: onClose,}
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:12},}
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center"},}
, React.createElement('span', { style: {color:"#6E6E73",fontSize:12,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase"},}, "Kunde")
, React.createElement('button', { onClick: ()=>{setLK(v=>!v);setKId("");}, style: {background:"none",border:"none",color:laufkunde?P.orange:P.blue,fontSize:13,cursor:"pointer",fontWeight:600},}, laufkunde?"Kundenliste":"Laufkunde (anonym)")
)
, laufkunde?React.createElement('div', { style: {padding:"9px 12px",background:"rgba(255,149,0,0.07)",border:"1px solid rgba(255,149,0,0.2)",borderRadius:10},}, React.createElement('div', { style: {color:P.orange,fontSize:12,fontWeight:600},}, "Laufkunde / Bar - ab 250€ Beschreibung Pflicht"       ))
:React.createElement(KundenSuche, { kunden: data.kunden||[], value: kunden_id, onChange: v=>{setKId(v);setFId("");},})
, kunden_id&&!laufkunde&&React.createElement(Sel, { label: "Fahrzeug (optional)" , value: fahrzeug_id, onChange: setFId, options: [{value:"",label:"Kein Fahrzeug"},...kFz.map(f=>({value:f.id,label:f.kennzeichen+" "+( f.marke||"")}))],})
, kmWarn?React.createElement('div', { style: {padding:"10px 12px",background:"rgba(255,149,0,0.07)",border:"1.5px solid rgba(255,149,0,0.3)",borderRadius:10},}
, React.createElement('div', { style: {color:P.orange,fontSize:13,fontWeight:600,marginBottom:8},}, "KM-Stand nicht eingetragen"  )
, React.createElement('div', { style: {display:"flex",gap:9,alignItems:"flex-end"},}, React.createElement('div', { style: {flex:1},}, React.createElement(Inp, { label: "KM-Stand", value: km, onChange: setKm, type: "number", suffix: "km",})), React.createElement(Btn, { v: "ghost", size: "md", onClick: ()=>{setKmWarn(false);submit();},}, "Überspringen"))
):React.createElement(Inp, { label: "KM-Stand (optional)" , value: km, onChange: setKm, type: "number", suffix: "km",})
, React.createElement(Inp, { label: "Beschreibung *" , value: beschreibung, onChange: setBeschreibung, placeholder: "z.B. Ölwechsel + Filter"   ,})
, React.createElement(Inp, { label: "Brutto-Betrag *" , value: betrag, onChange: setBetrag, type: "number", suffix: "€", note: "Direktbetrag - wird als Rechnungsbetrag verwendet"     ,})
, React.createElement(Btn, { full: true, size: "lg", onClick: submit,}, loading2?"Erstelle...":"Auftrag erstellen")
));
}
function Rechnungen(){
const {data,rechnungBezahlen,stornoRechnung,notify}=useApp();
const [selId,setSelId]=useState(null);
const sel=selId?(data.rechnungen||[]).find(r=>r.id===selId):null;
if(sel) return React.createElement(RechnungDetail, { re: sel, onBack: ()=>setSelId(null),});
const liste=(data.rechnungen||[]).filter(r=>!r.storno_von); // Stornorechnungen separat
const gO=liste.filter(r=>!r.bezahlt&&!r.storniert).reduce((s,r)=>s+(r.brutto||0),0);
const gB=liste.filter(r=>r.bezahlt&&!r.storniert).reduce((s,r)=>s+(r.brutto||0),0);
return React.createElement(Screen, { title: "Rechnungen",}
, React.createElement('div', { style: {padding:"11px 14px",background:"rgba(48,209,88,0.07)",border:`1px solid rgba(48,209,88,0.2)`,borderRadius:12,marginBottom:14,display:"flex",gap:9},}
, React.createElement(Ic, { n: "rechnungen", s: 15, c: P.green,})
, React.createElement('span', { style: {color:"#6E6E73",fontSize:13,lineHeight:1.4},}, "Rechnungen entstehen automatisch wenn du Pakete eines Auftrags abrechnest. Bezahlte Pakete sind gesperrt - Änderungen nur per Stornorechnung."                 )
)
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14},}
, React.createElement(Stat, { label: "Offen", value: eur(gO), color: P.orange, icon: "rechnungen",})
, React.createElement(Stat, { label: "Bezahlt", value: eur(gB), color: P.green, icon: "check",})
)
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:10},}
, liste.map(r=>{
const k=(data.kunden||[]).find(x=>x.id===r.kunden_id);
const ueb=!r.bezahlt&&!r.storniert&&r.faellig&&new Date(r.faellig)<new Date();
const tage=r.faellig?Math.max(0,Math.floor((Date.now()-new Date(r.faellig))/86400000)):0;
const isStorno=r.storno_von!=null;
return React.createElement(Card, { key: r.id, style: {padding:"15px",opacity:r.storniert?0.55:1},}
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,cursor:"pointer"}, onClick: ()=>setSelId(r.id),}
, React.createElement('div', { style: {flex:1,minWidth:0,marginRight:12},}
, React.createElement('div', { style: {display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"},}
, React.createElement('span', { style: {color:r.storniert?P.red:P.blue,fontSize:12,fontFamily:"monospace",fontWeight:700},}, r.nr)
, r.storniert&&React.createElement(Bdg, { color: P.red, small: true,}, "Storniert")
)
, React.createElement('div', { style: {color:"#1D1D1F",fontSize:16,fontWeight:700},}, eur(r.brutto||0))
, React.createElement('div', { style: {color:"#6E6E73",fontSize:12,marginTop:3},}, _optionalChain([k, 'optionalAccess', _50 => _50.vorname])||"", " " , _optionalChain([k, 'optionalAccess', _51 => _51.nachname])||"")
)
, React.createElement('div', { style: {textAlign:"right",flexShrink:0},}
, (()=>{const ms=getMahnStufe(r);if(r.storniert)return React.createElement(Bdg, { color: P.red,}, "Storniert");if(r.bezahlt)return React.createElement(Bdg, { color: P.green,}, "Bezahlt");if(ms)return React.createElement(Bdg, { color: ms.color,}, ms.label);return React.createElement(Bdg, { color: P.orange,}, "Offen");})()
)
)
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",color:"#AEAEB2",fontSize:12,marginBottom:!r.bezahlt&&!r.storniert?11:0},}
, React.createElement('span', null, dat(r.datum))
, React.createElement('span', { style: {color:ueb&&!r.bezahlt?P.red:P.textMuted},}, "Fällig: " , dat(r.faellig))
)
, !r.bezahlt&&!r.storniert&&React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6},}
, [["Bargeld","bar",P.green],["Karte","karte",P.blue],["Überweis.","überweisung",P.purple]].map(([l,za,c])=>(
React.createElement(Btn, { key: za, v: "ghost", size: "sm", style: {background:`${c}12`,border:`1px solid ${c}30`,color:c}, onClick: ()=>rechnungBezahlen(r,za),}, l)
))
)
);
})
, liste.length===0&&React.createElement('div', { style: {textAlign:"center",padding:"56px 20px",color:"#AEAEB2",fontSize:14},}, React.createElement(Ic, { n: "rechnungen", s: 40, c: "rgba(0,0,0,0.06)",}), React.createElement('div', { style: {marginTop:16},}, "Noch keine Rechnungen"  ), React.createElement('div', { style: {marginTop:8,fontSize:12},}, "Schließe Auftragspakete ab um automatisch eine Rechnung zu erstellen"        ))
)
);
}
function RechnungDetail({re,onBack}){
const {data,updateRow,rechnungBezahlen,stornoRechnung,notify}=useApp();
const [editing,setEditing]=useState(false);
const [form,setForm]=useState({...re});
const k=(data.kunden||[]).find(x=>x.id===re.kunden_id);
const au=(data.auftraege||[]).find(x=>x.id===re.auftrags_id);
const save=async()=>{await updateRow("rechnungen",re.id,form);setEditing(false);notify("Rechnung aktualisiert ");};
const sendMail=()=>{
if(!_optionalChain([k, 'optionalAccess', _52 => _52.email])){notify("Keine E-Mail beim Kunden","error");return;}
const sub=encodeURIComponent(`Rechnung ${re.nr}`);
const body=encodeURIComponent(`Guten Tag ${k.vorname} ${k.nachname},\n\nbitte überweisen Sie ${eur(re.brutto)} bis zum ${dat(re.faellig)}.\n\nRechnung: ${re.nr}\n\nMit freundlichen Grüßen\n${_optionalChain([data, 'access', _53 => _53.settings, 'optionalAccess', _54 => _54.inhaber])||"mehanicar"}`);
window.open(`mailto:${k.email}?subject=${sub}&body=${body}`);
};
return React.createElement(Screen, { title: re.nr, onBack: onBack, action: React.createElement('div', { style: {display:"flex",gap:8},}
, _optionalChain([k, 'optionalAccess', _55 => _55.email])&&React.createElement(Btn, { v: "blue_out", size: "sm", onClick: sendMail,}, React.createElement(Ic, { n: "send", s: 13, c: P.blue,}))
, React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>shareRechnung({re,kunde:k,settings:data.settings}),}, React.createElement(Ic, { n: "whatsapp", s: 14, c: "#25D366",}))
, React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>printDokument({typ:re.storniert?"stornorechnung":"rechnung",daten:re,settings:data.settings,kunde:k,fahrzeug:(()=>{const au2=(data.auftraege||[]).find(a=>a.id===re.auftrags_id);return au2?(data.fahrzeuge||[]).find(f=>f.id===au2.fahrzeug_id):null;})()}),}, React.createElement(Ic, { n: "download", s: 14,}))
, !re.bezahlt&&!re.storniert&&React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>setEditing(v=>!v),}, React.createElement(Ic, { n: "edit", s: 14,}))
, re.bezahlt&&!re.storniert&&React.createElement(Btn, { v: "red_out", size: "sm", onClick: ()=>{if(window.confirm("Stornorechnung erstellen?"))stornoRechnung(re);},}, React.createElement(Ic, { n: "storno", s: 14, c: P.red,}), " Storno" )
),}
, React.createElement('div', { style: {display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"},}
, React.createElement(Bdg, { color: re.storniert?P.red:re.bezahlt?P.green:P.orange,}, re.storniert?"Storniert":re.bezahlt?"Bezahlt ":"Offen")
, au&&React.createElement(Bdg, { color: P.blue, small: true,}, "Auftrag: " , au.nr)
)
, re.bezahlt&&!re.storniert&&React.createElement('div', { style: {padding:"11px 14px",background:"rgba(255,69,58,0.07)",border:`1px solid rgba(255,69,58,0.2)`,borderRadius:12,marginBottom:14,display:"flex",gap:9,alignItems:"center"},}
, React.createElement(Ic, { n: "lock", s: 14, c: P.red,})
, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, "Bezahlte Rechnung - Änderung an Positionen nur über Stornorechnung möglich."         )
)
, editing&&!re.bezahlt?(
React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:13},}
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},}
, React.createElement(Inp, { label: "Datum", value: form.datum||"", onChange: v=>setForm(p=>({...p,datum:v})), type: "date",})
, React.createElement(Inp, { label: "Fällig", value: form.faellig||"", onChange: v=>setForm(p=>({...p,faellig:v})), type: "date",})
)
, React.createElement('div', { style: {display:"flex",gap:8},}, React.createElement(Btn, { v: "primary", onClick: save,}, React.createElement(Ic, { n: "check", s: 15,}), " Speichern" ), React.createElement(Btn, { v: "ghost", onClick: ()=>setEditing(false),}, "Abbrechen"))
)
):(
React.createElement(Card, { style: {marginBottom:14},}, [["Nr.",re.nr],["Ausgestellt",dat(re.datum)],["Fällig",dat(re.faellig)],["Netto",eur(re.netto||0)],["MwSt. 19%",eur(re.mwst_betrag||0)],["Brutto",eur(re.brutto||0)],["Zahlungsart",re.zahlungsart||"-"],["Bezahlt am",re.bezahlt_am?dat(re.bezahlt_am):"-"]].map(([l,v],i,arr)=>(
React.createElement('div', { key: l, style: {display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<arr.length-1?`1px solid ${P.border}`:"none"},}
, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, l), React.createElement('span', { style: {color:l==="Brutto"?P.green:"#fff",fontSize:13,fontWeight:l==="Brutto"?700:400},}, v)
)
)))
)
, !re.bezahlt&&!re.storniert&&React.createElement('div', { style: {marginTop:4},}
, React.createElement('div', { style: {color:"#6E6E73",fontSize:12,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:10},}, "Zahlung verbuchen" )
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8},}
, [["Bargeld","bar",P.green],["Karte","karte",P.blue],["Überweisung","überweisung",P.purple]].map(([l,za,c])=>(
React.createElement(Btn, { key: za, v: "ghost", full: true, style: {background:`${c}12`,border:`1px solid ${c}30`,color:c}, onClick: ()=>{rechnungBezahlen(re,za);onBack();},}, l)
))
)
)
);
}
function Kalender(){
const {data,addRow,deleteRow,notify}=useApp();
const [showForm,setShowForm]=useState(false);
const [nT,setNT]=useState({titel:"",kunden_id:"",datum:tod(),uhrzeit_von:"08:00",uhrzeit_bis:"09:00",typ:"inspektion",notiz:""});
const sorted=[...(data.termine||[])].sort((a,b)=>a.datum>b.datum?1:-1);
const grouped=sorted.reduce((acc,t)=>{const m=_optionalChain([t, 'access', _56 => _56.datum, 'optionalAccess', _57 => _57.slice, 'call', _58 => _58(0,7)])||"";(acc[m]=acc[m]||[]).push(t);return acc;},{});
const tcol={inspektion:P.blue,reifenwechsel:P.green,reparatur:P.orange,abholung:P.purple};
const kFz=(data.fahrzeuge||[]).filter(f=>f.kunden_id===nT.kunden_id);
const addT=async()=>{if(!nT.titel||!nT.datum){notify("Titel + Datum erforderlich","error");return;}await addRow("termine",{id:uid(),...nT});setShowForm(false);notify("Termin gespeichert ");};
return React.createElement(Screen, { title: "Kalender", action: React.createElement(Btn, { size: "sm", onClick: ()=>setShowForm(true),}, React.createElement(Ic, { n: "plus", s: 14,}), " Termin" ),}
, Object.keys(grouped).length===0&&React.createElement('div', { style: {textAlign:"center",padding:"48px",color:"#AEAEB2",fontSize:14},}, "Keine Termine - werden automatisch aus Aufträgen erstellt"       )
, Object.entries(grouped).map(([m,ts])=>(
React.createElement('div', { key: m,}
, React.createElement(SecH, { title: new Date(m+"-01").toLocaleDateString("de-DE",{month:"long",year:"numeric"}),})
, React.createElement(Card, { noPad: true, style: {marginBottom:14},}
, ts.map((t,i,arr)=>{
const k=(data.kunden||[]).find(x=>x.id===t.kunden_id),tc=tcol[t.typ]||P.blue;
return React.createElement('div', { key: t.id, style: {display:"flex",gap:13,padding:"13px 15px",borderBottom:i<arr.length-1?`1px solid ${P.border}`:"none",alignItems:"flex-start"},}
, React.createElement('div', { style: {width:44,flexShrink:0,textAlign:"center",paddingTop:2},}
, React.createElement('div', { style: {color:tc,fontSize:18,fontWeight:700,lineHeight:1},}, _optionalChain([t, 'access', _59 => _59.datum, 'optionalAccess', _60 => _60.slice, 'call', _61 => _61(8)])||"-")
, React.createElement('div', { style: {color:"#AEAEB2",fontSize:10,marginTop:2},}, new Date(t.datum+"T12:00:00").toLocaleDateString("de-DE",{weekday:"short"}))
)
, React.createElement('div', { style: {flex:1,minWidth:0},}
, React.createElement('div', { style: {color:"#1D1D1F",fontSize:14,fontWeight:600},}, t.titel)
, React.createElement('div', { style: {color:"#6E6E73",fontSize:12,marginTop:3},}, t.uhrzeit_von&&`${t.uhrzeit_von}-${t.uhrzeit_bis||""} Uhr`, k&&` . ${k.vorname} ${k.nachname}`)
, t.notiz&&React.createElement('div', { style: {color:"#AEAEB2",fontSize:12,marginTop:3},}, t.notiz)
)
, React.createElement('div', { style: {display:"flex",flexDirection:"column",alignItems:"flex-end",gap:7,flexShrink:0},}
, React.createElement(Bdg, { color: tc, small: true,}, t.typ)
, React.createElement('button', { onClick: ()=>deleteRow("termine",t.id), style: {background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",borderRadius:7}, onMouseEnter: e=>e.currentTarget.style.background="rgba(255,69,58,0.12)", onMouseLeave: e=>e.currentTarget.style.background="none",}, React.createElement(Ic, { n: "trash", s: 14, c: P.red,}))
)
);
})
)
)
))
, showForm&&React.createElement(Modal, { title: "Neuer Termin" , onClose: ()=>setShowForm(false),}
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:12},}
, React.createElement(Inp, { label: "Titel *" , value: nT.titel, onChange: v=>setNT(p=>({...p,titel:v})),})
, React.createElement(Sel, { label: "Typ", value: nT.typ, onChange: v=>setNT(p=>({...p,typ:v})), options: ["inspektion","reifenwechsel","reparatur","abholung","sonstiges"].map(v=>({value:v,label:v})),})
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9},}
, React.createElement(Inp, { label: "Datum *" , value: nT.datum, onChange: v=>setNT(p=>({...p,datum:v})), type: "date",})
, React.createElement(Inp, { label: "Von", value: nT.uhrzeit_von, onChange: v=>setNT(p=>({...p,uhrzeit_von:v})), type: "time",})
, React.createElement(Inp, { label: "Bis", value: nT.uhrzeit_bis, onChange: v=>setNT(p=>({...p,uhrzeit_bis:v})), type: "time",})
)
, (data.kunden||[]).length>0&&React.createElement(Sel, { label: "Kunde", value: nT.kunden_id, onChange: v=>setNT(p=>({...p,kunden_id:v})), options: [{value:"",label:"- Kein Kunde -"},...(data.kunden||[]).map(k=>({value:k.id,label:`${k.vorname} ${k.nachname}`}))],})
, React.createElement(Inp, { label: "Notiz", value: nT.notiz, onChange: v=>setNT(p=>({...p,notiz:v})), rows: 2,})
, React.createElement(Btn, { full: true, onClick: addT, size: "lg",}, React.createElement(Ic, { n: "check", s: 16,}), " Speichern" )
)
)
);
}
function KundenFahrzeuge(){
const {data,addRow,updateRow,notify}=useApp();
const [tab,setTab]=useState("kunden");
const [selKId,setSelKId]=useState(null);
const [selFId,setSelFId]=useState(null);
const [showKForm,setShowKForm]=useState(false);
const [showFForm,setShowFForm]=useState(false);
const [kFilter,setKFilter]=useState({name:"",telefon:"",email:""});
const [fFilter,setFFilter]=useState({kennzeichen:"",marke:"",baujahr:"",vin:"",kraftstoff:""});
const [editK,setEditK]=useState(false);
const [editF,setEditF]=useState(false);
const selK=selKId?(data.kunden||[]).find(k=>k.id===selKId):null;
const selF=selFId?(data.fahrzeuge||[]).find(f=>f.id===selFId):null;
const filteredK=(data.kunden||[]).filter(k=>{
if(kFilter.name&&!`${k.vorname||""} ${k.nachname||""} ${k.firma||""}`.toLowerCase().includes(kFilter.name.toLowerCase())) return false;
if(kFilter.telefon&&!(k.telefon||"").includes(kFilter.telefon)) return false;
if(kFilter.email&&!(k.email||"").toLowerCase().includes(kFilter.email.toLowerCase())) return false;
return true;
});
const filteredF=(data.fahrzeuge||[]).filter(f=>{
if(fFilter.kennzeichen&&!(f.kennzeichen||"").toLowerCase().includes(fFilter.kennzeichen.toLowerCase())) return false;
if(fFilter.marke&&!(f.marke||"").toLowerCase().includes(fFilter.marke.toLowerCase())) return false;
if(fFilter.baujahr&&String(f.baujahr||"")!==fFilter.baujahr) return false;
if(fFilter.vin&&!(f.vin||"").toLowerCase().includes(fFilter.vin.toLowerCase())) return false;
if(fFilter.kraftstoff&&fFilter.kraftstoff!=="alle"&&f.kraftstoff!==fFilter.kraftstoff) return false;
return true;
});
const hasKFilter=Object.values(kFilter).some(v=>v!=="");
const hasFFilter=Object.values(fFilter).some(v=>v!==""&&v!=="alle");
if(selK) return React.createElement(KundeDetail, { kunde: selK, onBack: ()=>setSelKId(null),});
if(selF) return React.createElement(FahrzeugDetail, { fahrzeug: selF, onBack: ()=>setSelFId(null),});
return React.createElement(Screen, { title: "Kunden & Fahrzeuge"  , action: React.createElement(Btn, { size: "sm", onClick: tab==="kunden"?()=>setShowKForm(true):()=>setShowFForm(true),}, React.createElement(Ic, { n: "plus", s: 14,}), " " , tab==="kunden"?"Kunde":"Fahrzeug"),}
, React.createElement(Switcher, { options: [{v:"kunden",l:`Kunden (${(data.kunden||[]).length})`},{v:"fahrzeuge",l:`Fahrzeuge (${(data.fahrzeuge||[]).length})`}], value: tab, onChange: setTab,})
, tab==="kunden"&&React.createElement(React.Fragment, null
, React.createElement(Card, { style: {marginBottom:14,padding:"13px"},}
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10},}
, React.createElement('span', { style: {color:"#6E6E73",fontSize:12,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",display:"flex",alignItems:"center",gap:6},}, React.createElement(Ic, { n: "filter", s: 13, c: P.textSub,}), " Filter" )
, hasKFilter&&React.createElement('button', { onClick: ()=>setKFilter({name:"",telefon:"",email:""}), style: {background:"none",border:"none",color:P.red,fontSize:12,cursor:"pointer",fontWeight:500},}, "Zurücksetzen")
)
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:9},}
, React.createElement(Inp, { placeholder: "Name oder Firma..."  , value: kFilter.name, onChange: v=>setKFilter(p=>({...p,name:v})),})
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:9},}
, React.createElement(Inp, { placeholder: "Telefon...", value: kFilter.telefon, onChange: v=>setKFilter(p=>({...p,telefon:v})),})
, React.createElement(Inp, { placeholder: "E-Mail...", value: kFilter.email, onChange: v=>setKFilter(p=>({...p,email:v})),})
)
)
, hasKFilter&&React.createElement('div', { style: {marginTop:8,color:P.blue,fontSize:12,fontWeight:500},}, filteredK.length, " Ergebnis" , filteredK.length!==1?"se":"")
)
, React.createElement(Card, { noPad: true,}
, filteredK.map((k,i,arr)=>{const mc={gut:P.green,mittel:P.orange,schlecht:P.red}[k.zahlungsmoral]||P.blue;return React.createElement(Row, { key: k.id, icon: "kunden", iconColor: P.blue, left: `${k.vorname||""} ${k.nachname||""}${k.firma?` (${k.firma})`:""}`, sub: `${k.nr||""} . ${k.telefon||"-"}`, badge: React.createElement(Bdg, { color: mc, small: true,}, "*".repeat(k.interne_bewertung||3)), onClick: ()=>setSelKId(k.id), last: i===arr.length-1,});} )
, filteredK.length===0&&React.createElement('div', { style: {padding:"28px",textAlign:"center",color:"#AEAEB2",fontSize:14},}, hasKFilter?"Keine Treffer":"Noch keine Kunden")
)
)
, tab==="fahrzeuge"&&React.createElement(React.Fragment, null
, React.createElement(Card, { style: {marginBottom:14,padding:"13px"},}
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10},}
, React.createElement('span', { style: {color:"#6E6E73",fontSize:12,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",display:"flex",alignItems:"center",gap:6},}, React.createElement(Ic, { n: "filter", s: 13, c: P.textSub,}), " Filter" )
, hasFFilter&&React.createElement('button', { onClick: ()=>setFFilter({kennzeichen:"",marke:"",baujahr:"",vin:"",kraftstoff:""}), style: {background:"none",border:"none",color:P.red,fontSize:12,cursor:"pointer",fontWeight:500},}, "Zurücksetzen")
)
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:9},}
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:9},}
, React.createElement(Inp, { placeholder: "Kennzeichen...", value: fFilter.kennzeichen, onChange: v=>setFFilter(p=>({...p,kennzeichen:v.toUpperCase()})),})
, React.createElement(Inp, { placeholder: "FIN / VIN..."  , value: fFilter.vin, onChange: v=>setFFilter(p=>({...p,vin:v.toUpperCase()})),})
)
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:9},}
, React.createElement(Inp, { placeholder: "Marke...", value: fFilter.marke, onChange: v=>setFFilter(p=>({...p,marke:v})),})
, React.createElement(Inp, { placeholder: "Baujahr...", value: fFilter.baujahr, onChange: v=>setFFilter(p=>({...p,baujahr:v})), type: "number",})
)
, React.createElement(Sel, { value: fFilter.kraftstoff||"alle", onChange: v=>setFFilter(p=>({...p,kraftstoff:v==="alle"?"":v})), options: [{value:"alle",label:"Alle Kraftstoffe"},...["Benzin","Diesel","Elektro","Hybrid","Gas"].map(v=>({value:v,label:v}))],})
)
, hasFFilter&&React.createElement('div', { style: {marginTop:8,color:P.blue,fontSize:12,fontWeight:500},}, filteredF.length, " Ergebnis" , filteredF.length!==1?"se":"")
)
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:10},}
, filteredF.map(f=>{
const k=(data.kunden||[]).find(x=>x.id===f.kunden_id);
const warn=f.hu_datum&&new Date(f.hu_datum)<=new Date(Date.now()+60*24*3600000);
return React.createElement(Card, { key: f.id, onClick: ()=>setSelFId(f.id), style: {padding:"15px"},}
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",marginBottom:9},}
, React.createElement('div', { style: {flex:1,minWidth:0,marginRight:12},}
, React.createElement('div', { style: {color:"#1D1D1F",fontSize:18,fontWeight:700,marginBottom:3},}, f.kennzeichen)
, React.createElement('div', { style: {color:"#6E6E73",fontSize:13},}, f.marke, " " , f.modell||"", " . "  , f.baujahr||"")
, k&&React.createElement('div', { style: {color:"#AEAEB2",fontSize:12,marginTop:2},}, k.vorname||"", " " , k.nachname||"")
)
, React.createElement('div', { style: {width:44,height:44,borderRadius:12,background:"#F5F5F7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},}, React.createElement(Ic, { n: "fahrzeuge", s: 21, c: "rgba(0,0,0,0.10)",}))
)
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:9},}
, [["KM",`${(f.km||0).toLocaleString("de-DE")}`],["HU",dat(f.hu_datum)],["PS",f.ps||"-"]].map(([l,v])=>(
React.createElement('div', { key: l, style: {background:"rgba(0,0,0,0.025)",borderRadius:10,padding:"8px 9px"},}
, React.createElement('div', { style: {color:"#AEAEB2",fontSize:10,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3},}, l)
, React.createElement('div', { style: {color:l==="HU"&&warn?P.orange:"#1D1D1F",fontSize:12,fontWeight:500},}, v)
)
))
)
, React.createElement('div', { style: {display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"},}
, warn&&React.createElement(Bdg, { color: P.orange, small: true,}, "HU bald fällig"  )
, f.kraftstoff&&React.createElement(Bdg, { color: P.purple, small: true,}, f.kraftstoff)
, f.vin&&React.createElement('span', { style: {color:"#AEAEB2",fontSize:11,fontFamily:"monospace"},}, f.vin)
, React.createElement(Ic, { n: "chevronR", s: 16, c: P.textMuted, style: {marginLeft:"auto"},})
)
);
})
, filteredF.length===0&&React.createElement('div', { style: {textAlign:"center",padding:"44px",color:"#AEAEB2",fontSize:14},}, hasFFilter?"Keine Treffer":"Noch keine Fahrzeuge")
)
)
, showKForm&&React.createElement(Modal, { title: "Neuer Kunde" , onClose: ()=>setShowKForm(false),}
, React.createElement(KundeNeuForm, { onClose: ()=>setShowKForm(false),})
)
, showFForm&&React.createElement(Modal, { title: "Neues Fahrzeug" , onClose: ()=>setShowFForm(false), wide: true,}
, React.createElement(FahrzeugNeuForm, { onClose: ()=>setShowFForm(false),})
)
);
}
function KundeNeuForm({onClose}){
const {data,addRow,notify}=useApp();
const [f,setF]=useState({anrede:"Herr",vorname:"",nachname:"",firma:"",typ:"privat",telefon:"",email:"",whatsapp:"",strasse:"",plz:"",ort:"",zahlungsmoral:"gut"});
const save=async()=>{
if(!f.nachname){notify("Nachname erforderlich","error");return;}
const nr=`KD-${String((data.kunden||[]).length+4).padStart(4,"0")}`;
await addRow("kunden",{id:uid(),nr,...f,erstellt:tod(),interne_bewertung:3,tags:[],notizen:""});
onClose();notify("Kunde angelegt ");
};
return React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:12},}
, React.createElement(KundeFormFelder, { f: f, setF: setF,})
, React.createElement(Btn, { full: true, onClick: save, size: "lg",}, React.createElement(Ic, { n: "check", s: 16,}), " Anlegen" )
);
}
function FahrzeugNeuForm({onClose}){
const {data,addRow,notify}=useApp();
const [f,setF]=useState({kunden_id:_optionalChain([(data.kunden||[]), 'access', _62 => _62[0], 'optionalAccess', _63 => _63.id])||"",kennzeichen:"",vin:"",marke:"",modell:"",baujahr:String(new Date().getFullYear()),kraftstoff:"Benzin",km:"",hu_datum:"",au_datum:"",hubraum:"",kw:"",ps:"",getriebe:"Schaltung",farbe:"",farb_code:"",reifengroesse:"",erstzulassung:"",naechste_inspektion:"",anzahl_vorbesitzer:"",fahrzeugschein:null});
const save=async()=>{
if(!f.kennzeichen||!f.marke){notify("Kennzeichen + Marke erforderlich","error");return;}
await addRow("fahrzeuge",{id:uid(),...f,km:parseInt(f.km)||0,baujahr:parseInt(f.baujahr)||new Date().getFullYear(),letzte_inspektion:null,notizen:""});
onClose();notify("Fahrzeug angelegt ");
};
return React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:12},}
, React.createElement(Sel, { label: "Besitzer *" , value: f.kunden_id, onChange: v=>setF(p=>({...p,kunden_id:v})), options: (data.kunden||[]).map(k=>({value:k.id,label:`${k.vorname||""} ${k.nachname||""}`})),})
, React.createElement(FahrzeugFormFelder, { f: f, setF: setF, withScan: true,})
, React.createElement(Btn, { full: true, onClick: save, size: "lg",}, React.createElement(Ic, { n: "check", s: 16,}), " Anlegen" )
);
}
function KundeDetail({kunde,onBack}){
const {data,updateRow}=useApp();
const [editing,setEditing]=useState(false);
const [ef,setEf]=useState({...kunde});
const kFz=(data.fahrzeuge||[]).filter(f=>f.kunden_id===kunde.id);
const kRe=(data.rechnungen||[]).filter(r=>r.kunden_id===kunde.id&&!r.storniert);
const u=kRe.reduce((s,r)=>s+(r.brutto||0),0),op=kRe.filter(r=>!r.bezahlt).reduce((s,r)=>s+(r.brutto||0),0);
const save=async()=>{await updateRow("kunden",kunde.id,ef);setEditing(false);};
return React.createElement(Screen, { title: `${kunde.vorname||""} ${kunde.nachname||""}`, onBack: onBack, action: React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>setEditing(v=>!v),}, React.createElement(Ic, { n: "edit", s: 14,}), editing?" Abbrechen":" Bearbeiten"),}
, editing?(
React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:12},}
, React.createElement(KundeFormFelder, { f: ef, setF: setEf,})
, React.createElement(Btn, { full: true, onClick: save, size: "lg",}, React.createElement(Ic, { n: "check", s: 16,}), " Speichern" )
)
):(
React.createElement(React.Fragment, null
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14},}
, kunde.whatsapp&&React.createElement('a', { href: `https://wa.me/${kunde.whatsapp}`, target: "_blank", rel: "noopener noreferrer" , style: {display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"12px",background:"rgba(37,211,102,0.12)",border:"1px solid rgba(37,211,102,0.3)",borderRadius:13,color:"#25D366",textDecoration:"none",fontSize:14,fontWeight:600,minHeight:48},}, "WA")
, kunde.telefon&&React.createElement('a', { href: `tel:${kunde.telefon}`, style: {display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"12px",background:"rgba(48,209,88,0.1)",border:`1px solid rgba(48,209,88,0.3)`,borderRadius:13,color:P.green,textDecoration:"none",fontSize:14,fontWeight:600,minHeight:48},}, React.createElement(Ic, { n: "phone", s: 15, c: P.green,}), " Anruf" )
, kunde.email&&React.createElement('a', { href: `mailto:${kunde.email}`, style: {display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"12px",background:"rgba(10,132,255,0.1)",border:`1px solid rgba(10,132,255,0.3)`,borderRadius:13,color:P.blue,textDecoration:"none",fontSize:14,fontWeight:600,minHeight:48,gridColumn:!kunde.whatsapp&&!kunde.telefon?"1/-1":"auto"},}, React.createElement(Ic, { n: "email", s: 15, c: P.blue,}), " Mail" )
)
, React.createElement('div', { style: {display:"flex",gap:5,flexWrap:"wrap",alignItems:"center",marginBottom:10},}
, [1,2,3,4,5].map(n=>React.createElement('button', { key: n, onClick: ()=>updateRow("kunden",kunde.id,{interne_bewertung:n}), style: {background:"none",border:"none",cursor:"pointer",padding:"1px",fontSize:20,color:n<=(kunde.interne_bewertung||0)?"#FFCC00":"#E5E5EA"},}, "*"))
, (kunde.tags||[]).map(t=>React.createElement('span', { key: t, onClick: ()=>updateRow("kunden",kunde.id,{tags:(kunde.tags||[]).filter(x=>x!==t)}), style: {background:"rgba(0,122,255,0.08)",color:P.blue,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600,cursor:"pointer"},}, "x " , t))
, ["Stammkunde","Barzahler","VIP","Firmenkunde"].filter(t=>!(kunde.tags||[]).includes(t)).slice(0,2).map(t=>React.createElement('button', { key: t, onClick: ()=>updateRow("kunden",kunde.id,{tags:[...(kunde.tags||[]),t]}), style: {background:"rgba(0,0,0,0.04)",border:"1px dashed rgba(0,0,0,0.12)",borderRadius:20,padding:"3px 9px",fontSize:12,color:"#AEAEB2",cursor:"pointer"},}, "+ " , t))
)
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14},}
, React.createElement(Stat, { label: "Umsatz", value: eur(u), color: P.green, icon: "finanzen",})
, React.createElement(Stat, { label: "Offen", value: eur(op), color: op>0?P.orange:P.green, icon: "rechnungen",})
)
, React.createElement(Card, { style: {marginBottom:14},}
, [["Kundennr.",kunde.nr],["Typ",kunde.typ],["Telefon",kunde.telefon||"-"],["E-Mail",kunde.email||"-"],["Adresse",kunde.strasse?`${kunde.strasse}, ${kunde.plz} ${kunde.ort}`:"-"],["Zahlungsmoral",kunde.zahlungsmoral||"-"]].map(([l,v],i,arr)=>(
React.createElement('div', { key: l, style: {display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<arr.length-1?`1px solid ${P.border}`:"none"},}, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, l), React.createElement('span', { style: {color:"#1D1D1F",fontSize:13,textAlign:"right",maxWidth:"60%"},}, v))
))
)
, kFz.length>0&&React.createElement(React.Fragment, null, React.createElement(SecH, { title: `Fahrzeuge (${kFz.length})`,}), React.createElement(Card, { noPad: true, style: {marginBottom:14},}, kFz.map((f,i,arr)=>React.createElement(Row, { key: f.id, icon: "fahrzeuge", iconColor: P.blue, left: f.kennzeichen, sub: `${f.marke||""} ${f.modell||""} . ${f.baujahr||""}`, right: `HU: ${dat(f.hu_datum)}`, last: i===arr.length-1,}))))
, React.createElement(SecH, { title: "Notizen",})
, React.createElement(Inp, { value: kunde.notizen||"", onChange: v=>updateRow("kunden",kunde.id,{notizen:v}), rows: 4, placeholder: "Notizen zum Kunden..."  ,})
)
)
);
}
function FahrzeugDetail({fahrzeug:fz,onBack}){
const {data,updateRow,notify}=useApp();
const [editing,setEditing]=useState(false);
const [ef,setEf]=useState({...fz});
useEffect(()=>{setEf({...fz});},[fz.id]);
const k=(data.kunden||[]).find(x=>x.id===fz.kunden_id);
const fzA=(data.auftraege||[]).filter(a=>a.fahrzeug_id===fz.id);
const handleScan=async(e)=>{
const file=_optionalChain([e, 'access', _64 => _64.target, 'access', _65 => _65.files, 'optionalAccess', _66 => _66[0]]);if(!file)return;
const reader=new FileReader();
reader.onload=async(ev)=>{
const imgData=ev.target.result;
updateRow("fahrzeuge",fz.id,{fahrzeugschein:{name:file.name,type:file.type,data:imgData}});
notify("Fahrzeugschein gespeichert");
if(!file.type.startsWith("image/"))return;
try{
const b64=imgData.split(",")[1];
const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:file.type,data:b64}},{type:"text",text:"Fahrzeugdokument. JSON: kennzeichen,vin,marke,modell,baujahr,erstzulassung(YYYY-MM-DD),hu_datum(YYYY-MM-DD),kraftstoff,hubraum,kw,farbe,farb_code."}]}]})});
const json=await res.json();
const parsed=JSON.parse(_optionalChain([((json.content||[]).find(c=>c.type==="text")||{}), 'access', _67 => _67.text, 'optionalAccess', _68 => _68.replace, 'call', _69 => _69(/```json|```/g,""), 'access', _70 => _70.trim, 'call', _71 => _71()])||"{}");
const upd={fahrzeugschein:{name:file.name,type:file.type,data:imgData}};
["kennzeichen","vin","marke","modell","baujahr","erstzulassung","hu_datum","kraftstoff","hubraum","kw","farbe","farb_code"].forEach(k=>{if(parsed[k]!=null&&!fz[k])upd[k]=String(parsed[k]);});
updateRow("fahrzeuge",fz.id,upd);notify("Felder ausgefuellt");
}catch(e){console.error(e);}
};reader.readAsDataURL(file);
};

const save=async()=>{await updateRow("fahrzeuge",fz.id,ef);setEditing(false);notify("Fahrzeug aktualisiert ");};
return React.createElement(Screen, { title: fz.kennzeichen, onBack: onBack, action: React.createElement(Btn, { v: "ghost", size: "sm", onClick: ()=>setEditing(v=>!v),}, React.createElement(Ic, { n: "edit", s: 14,}), editing?" Abbrechen":" Bearbeiten"),}
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14},}
, React.createElement(Stat, { label: "Aufträge", value: fzA.length, color: P.blue, icon: "auftraege",})
, React.createElement(Stat, { label: "Gesamtkosten", value: eur(fzA.filter(a=>a.status==="abgeschlossen").reduce((s,a)=>s+calcAU(a).brutto,0)), color: P.green, icon: "finanzen",})
)
/* Fahrzeugschein */
, React.createElement(Card, { style: {marginBottom:14,padding:"14px"},}
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:fz.fahrzeugschein?10:0},}
, React.createElement('span', { style: {color:"#6E6E73",fontSize:12,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase"},}, "Fahrzeugschein")
, React.createElement('label', { style: {display:"flex",alignItems:"center",gap:6,padding:"7px 13px",background:"rgba(10,132,255,0.1)",border:`1px solid rgba(10,132,255,0.3)`,borderRadius:10,cursor:"pointer",color:P.blue,fontSize:12,fontWeight:600,minHeight:36},}
, React.createElement(Ic, { n: "scan", s: 14, c: P.blue,}), " " , fz.fahrzeugschein?"Neu scannen":"Scannen"
, React.createElement('input', { type: "file", accept: "image/*,.pdf", onChange: handleScan, style: {display:"none"},})
)
)
, _optionalChain([fz, 'access', _72 => _72.fahrzeugschein, 'optionalAccess', _73 => _73.type, 'optionalAccess', _74 => _74.startsWith, 'call', _75 => _75("image/")])&&React.createElement('img', { src: fz.fahrzeugschein.data, alt: "FS", style: {width:"100%",borderRadius:10,maxHeight:200,objectFit:"cover"},})
, fz.fahrzeugschein&&!_optionalChain([fz, 'access', _76 => _76.fahrzeugschein, 'access', _77 => _77.type, 'optionalAccess', _78 => _78.startsWith, 'call', _79 => _79("image/")])&&React.createElement('a', { href: fz.fahrzeugschein.data, download: fz.fahrzeugschein.name, style: {display:"flex",alignItems:"center",gap:8,color:P.blue,textDecoration:"none",fontSize:13},}, React.createElement(Ic, { n: "download", s: 16, c: P.blue,}), " " , fz.fahrzeugschein.name)
, !fz.fahrzeugschein&&React.createElement('div', { style: {color:"#AEAEB2",fontSize:13,marginTop:6},}, "Noch nicht hinterlegt"  )
)
, editing?(
React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:12},}
, React.createElement(FahrzeugFormFelder, { f: ef, setF: setEf,})
, React.createElement(Btn, { full: true, onClick: save, size: "lg",}, React.createElement(Ic, { n: "check", s: 16,}), " Speichern" )
)
):(
React.createElement(Card, { style: {marginBottom:14},}
, [["Kennzeichen",fz.kennzeichen],["VIN/FIN",fz.vin||"-"],["Marke / Modell",`${fz.marke||""} ${fz.modell||""}`],["Baujahr",fz.baujahr||"-"],["Erstzulassung",fz.erstzulassung?dat(fz.erstzulassung):"-"],["Kraftstoff",fz.kraftstoff||"-"],["Getriebe",fz.getriebe||"-"],["Motor",fz.hubraum?`${fz.hubraum} ccm . ${fz.kw||"-"} kW . ${fz.ps||"-"} PS`:"-"],["KM-Stand",`${(fz.km||0).toLocaleString("de-DE")} km`],["Farbe / Code",fz.farbe?`${fz.farbe}${fz.farb_code?" ("+fz.farb_code+")":""}` :"-"],["HU-Datum",dat(fz.hu_datum)],["AU-Datum",dat(fz.au_datum)],["Nächste Inspektion",fz.naechste_inspektion?dat(fz.naechste_inspektion):"-"],["Vorbesitzer",fz.anzahl_vorbesitzer||"-"],["Besitzer",k?`${k.vorname||""} ${k.nachname||""}`:"-"]].map(([l,v],i,arr)=>(
React.createElement('div', { key: l, style: {display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<arr.length-1?`1px solid ${P.border}`:"none"},}
, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, l), React.createElement('span', { style: {color:"#1D1D1F",fontSize:13,textAlign:"right",maxWidth:"55%"},}, v)
)
))
)
)
, fzA.filter(a=>a.annahme_km&&parseInt(a.annahme_km)>0).length>0&&React.createElement('div', { style: {marginBottom:14},}, React.createElement(SecH, { title: "KM-Verlauf",}), React.createElement(Card, { style: {padding:"12px 14px"},}, fzA.filter(a=>a.annahme_km&&parseInt(a.annahme_km)>0).sort((a,b)=>new Date(a.erstellt)-new Date(b.erstellt)).map((au,i,arr)=>{const prev=arr[i-1];const diff=prev?parseInt(au.annahme_km)-parseInt(prev.annahme_km):null;return React.createElement('div', { key: au.id, style: {display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<arr.length-1?"1px solid rgba(0,0,0,0.05)":"none"},}, React.createElement('div', null, React.createElement('div', { style: {color:"#1D1D1F",fontSize:13,fontWeight:500},}, parseInt(au.annahme_km).toLocaleString("de-DE"), " km" ), React.createElement('div', { style: {color:"#AEAEB2",fontSize:11},}, dat(au.erstellt))), diff&&diff>0&&React.createElement('span', { style: {color:P.blue,fontSize:12,fontWeight:600},}, "+", diff.toLocaleString("de-DE"), " km" ));})))
, React.createElement(SecH, { title: `Fahrzeughistorie (${fzA.length})`,})
, fzA.map(au=>{const sc=SC[au.status]||SC.offen,c=calcAU(au);return React.createElement(Card, { key: au.id, style: {marginBottom:8,padding:"12px"},}, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",alignItems:"center"},}, React.createElement('div', null, React.createElement('div', { style: {color:P.blue,fontSize:12,fontFamily:"monospace"},}, au.nr), React.createElement('div', { style: {color:"#1D1D1F",fontSize:13,fontWeight:500,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200},}, au.beschreibung||""), React.createElement('div', { style: {display:"flex",gap:5,marginTop:5},}, React.createElement(Bdg, { color: sc.c, bg: sc.bg, small: true,}, sc.label), React.createElement('span', { style: {color:"#AEAEB2",fontSize:12},}, dat(au.erstellt)))), React.createElement('span', { style: {color:"#1D1D1F",fontSize:15,fontWeight:700,flexShrink:0},}, eur(c.brutto))));})
, fzA.length===0&&React.createElement('div', { style: {textAlign:"center",padding:"20px",color:"#AEAEB2",fontSize:14},}, "Noch keine Aufträge"  )
);
}
function Lager(){
const {data,addRow,updateRow,notify}=useApp();
const [q,setQ]=useState(""); const [showForm,setShowForm]=useState(false);
const [nL,setNL]=useState({artikelnr:"",bezeichnung:"",bestand:"0",mindestbestand:"2",ek_preis:"",vk_preis:"",lieferant:"",lagerort:"",einheit:"Stk."});
const filtered=(data.lager||[]).filter(l=>`${l.bezeichnung||""} ${l.artikelnr||""} ${l.lieferant||""}`.toLowerCase().includes(q.toLowerCase()));
const warn=(data.lager||[]).filter(l=>(l.bestand||0)<=(l.mindestbestand||0));
const addL=async()=>{if(!nL.bezeichnung){notify("Bezeichnung erforderlich","error");return;}const nr=nL.artikelnr||`ART-${String((data.lager||[]).length+1).padStart(4,"0")}`;await addRow("lager",{id:uid(),...nL,artikelnr:nr,bestand:parseInt(nL.bestand)||0,mindestbestand:parseInt(nL.mindestbestand)||0,ek_preis:parseFloat(nL.ek_preis)||0,vk_preis:parseFloat(nL.vk_preis)||0});setShowForm(false);notify("Artikel angelegt ");};
return React.createElement(Screen, { title: "Lager", action: React.createElement(Btn, { size: "sm", onClick: ()=>setShowForm(true),}, React.createElement(Ic, { n: "plus", s: 14,}), " Artikel" ),}
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14},}
, React.createElement(Stat, { label: "Lagerwert", value: eur((data.lager||[]).reduce((s,l)=>s+(l.bestand||0)*(l.ek_preis||0),0)), color: P.green, icon: "lager",})
, React.createElement(Stat, { label: "Warnungen", value: warn.length, color: P.orange, icon: "warning",})
)
, warn.length>0&&React.createElement(React.Fragment, null, React.createElement('div', { style: {color:P.orange,fontSize:12,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:8},}, "! Nachbestellen" ), React.createElement(Card, { noPad: true, style: {marginBottom:14},}, warn.map((l,i,arr)=>React.createElement(Row, { key: l.id, icon: "warning", iconColor: P.orange, left: l.bezeichnung, sub: `${l.artikelnr||""} . ${l.lieferant||"-"}`, right: `${l.bestand}/${l.mindestbestand}`, badge: React.createElement(Bdg, { color: P.orange, small: true,}, "Tief"), last: i===arr.length-1,}))))
, React.createElement('div', { style: {marginBottom:12},}, React.createElement('div', { style: {position:"relative"},}, React.createElement('input', { value: q, onChange: e=>setQ(e.target.value), placeholder: "Artikel suchen..." , style: {width:"100%",background:"#F2F2F7",border:`1.5px solid ${P.border}`,borderRadius:12,padding:"11px 14px 11px 42px",color:"#1D1D1F",fontSize:14,outline:"none",boxSizing:"border-box",minHeight:44},}), React.createElement('div', { style: {position:"absolute",left:13,top:"50%",transform:"translateY(-50%)"},}, React.createElement(Ic, { n: "search", s: 16, c: P.textSub,}))))
, React.createElement(Card, { noPad: true,}
, filtered.map((l,i,arr)=>(
React.createElement('div', { key: l.id, style: {display:"flex",alignItems:"center",gap:12,padding:"13px 15px",borderBottom:i<arr.length-1?`1px solid ${P.border}`:"none"},}
, React.createElement('div', { style: {width:40,height:40,borderRadius:11,background:"rgba(255,159,10,0.14)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:P.orange},}, React.createElement(Ic, { n: "lager", s: 18,}))
, React.createElement('div', { style: {flex:1,minWidth:0},}, React.createElement('div', { style: {color:"#1D1D1F",fontSize:14,fontWeight:500},}, l.bezeichnung), React.createElement('div', { style: {color:"#6E6E73",fontSize:12,marginTop:2},}, l.artikelnr||"", l.lagerort?` . ${l.lagerort}`:""))
, React.createElement('div', { style: {textAlign:"right",flexShrink:0},}, React.createElement('div', { style: {color:(l.bestand||0)<=(l.mindestbestand||0)?P.red:P.green,fontSize:15,fontWeight:700},}, l.bestand, " " , l.einheit||"Stk."), React.createElement('div', { style: {color:"#AEAEB2",fontSize:12,marginTop:2},}, eur(l.vk_preis||0)))
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:5},}
, React.createElement('button', { onClick: ()=>updateRow("lager",l.id,{bestand:(l.bestand||0)+1}), style: {width:32,height:32,borderRadius:9,background:"rgba(48,209,88,0.15)",border:"none",cursor:"pointer",color:P.green,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700},}, "+")
, React.createElement('button', { onClick: ()=>updateRow("lager",l.id,{bestand:Math.max(0,(l.bestand||0)-1)}), style: {width:32,height:32,borderRadius:9,background:"rgba(255,69,58,0.12)",border:"none",cursor:"pointer",color:P.red,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700},}, "-")
)
)
))
, filtered.length===0&&React.createElement('div', { style: {padding:"28px",textAlign:"center",color:"#AEAEB2",fontSize:14},}, "Keine Artikel" )
)
, showForm&&React.createElement(Modal, { title: "Neuer Artikel" , onClose: ()=>setShowForm(false),}
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:12},}
, React.createElement(Inp, { label: "Bezeichnung *" , value: nL.bezeichnung, onChange: v=>setNL(p=>({...p,bezeichnung:v})),})
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:11},}, React.createElement(Inp, { label: "Artikelnr.", value: nL.artikelnr, onChange: v=>setNL(p=>({...p,artikelnr:v})),}), React.createElement(Inp, { label: "Lagerort", value: nL.lagerort, onChange: v=>setNL(p=>({...p,lagerort:v})),}))
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9},}, React.createElement(Inp, { label: "Bestand", value: nL.bestand, onChange: v=>setNL(p=>({...p,bestand:v})), type: "number",}), React.createElement(Inp, { label: "Mindest", value: nL.mindestbestand, onChange: v=>setNL(p=>({...p,mindestbestand:v})), type: "number",}), React.createElement(Sel, { label: "Einheit", value: nL.einheit, onChange: v=>setNL(p=>({...p,einheit:v})), options: ["Stk.","Liter","Kg","m","Paar","Satz"].map(v=>({value:v,label:v})),}))
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:11},}, React.createElement(Inp, { label: "EK-Preis \\u20AC" , value: nL.ek_preis, onChange: v=>setNL(p=>({...p,ek_preis:v})), type: "number",}), React.createElement(Inp, { label: "VK-Preis \\u20AC" , value: nL.vk_preis, onChange: v=>setNL(p=>({...p,vk_preis:v})), type: "number",}))
, React.createElement(Inp, { label: "Lieferant", value: nL.lieferant, onChange: v=>setNL(p=>({...p,lieferant:v})),})
, React.createElement(Btn, { full: true, onClick: addL, size: "lg",}, React.createElement(Ic, { n: "check", s: 16,}), " Anlegen" )
)
)
);
}
function Finanzen(){
const {data,addRow,notify,doExport}=useApp();
const [tab2,setTab2]=useState("kassenbuch");
const [ustJahr,setUstJahr]=useState(String(new Date().getFullYear()));
const [nE,setNE]=useState({beschreibung:"",betrag:"",typ:"einnahme",kategorie:"Reparatur",datum:tod()});
const kassen=data.kassenbuch||[];
const saldo=kassen.reduce((s,k)=>s+(k.typ==="einnahme"?1:-1)*(k.betrag||0),0);
const monat=new Date().toISOString().slice(0,7);
const monatE=kassen.filter(k=>_optionalChain([k, 'access', _80 => _80.datum, 'optionalAccess', _81 => _81.startsWith, 'call', _82 => _82(monat)])&&k.typ==="einnahme").reduce((s,k)=>s+(k.betrag||0),0);
const monatA=kassen.filter(k=>_optionalChain([k, 'access', _83 => _83.datum, 'optionalAccess', _84 => _84.startsWith, 'call', _85 => _85(monat)])&&k.typ==="ausgabe").reduce((s,k)=>s+(k.betrag||0),0);
const addE=async()=>{if(!nE.beschreibung||!nE.betrag){notify("Pflichtfelder fehlen","error");return;}await addRow("kassenbuch",{id:uid(),...nE,betrag:parseFloat(nE.betrag)||0});setNE(p=>({...p,beschreibung:"",betrag:""}));notify("Gebucht ");};
const jEinn=(data.rechnungen||[]).filter(r=>r.bezahlt&&!r.storniert&&_optionalChain([r, 'access', _86 => _86.bezahlt_am, 'optionalAccess', _87 => _87.startsWith, 'call', _88 => _88(String(yr()))])).reduce((s,r)=>s+(r.netto||0),0);
const jAusg=kassen.filter(k=>_optionalChain([k, 'access', _89 => _89.datum, 'optionalAccess', _90 => _90.startsWith, 'call', _91 => _91(String(yr()))])&&k.typ==="ausgabe").reduce((s,k)=>s+(k.betrag||0),0);
const jMwst=(data.rechnungen||[]).filter(r=>r.bezahlt&&!r.storniert&&_optionalChain([r, 'access', _92 => _92.bezahlt_am, 'optionalAccess', _93 => _93.startsWith, 'call', _94 => _94(String(yr()))])).reduce((s,r)=>s+(r.mwst_betrag||0),0);
const TABS2=[{v:"kassenbuch",l:"Kassenbuch"},{v:"euer",l:"EÜR"},{v:"backup",l:"Backup"}];
return React.createElement(Screen, { title: "Finanzen",}
, React.createElement(Tabs, { tabs: TABS2, active: tab2, onChange: setTab2,})
, tab2==="kassenbuch"&&React.createElement(React.Fragment, null
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14},}
, React.createElement(Stat, { label: "Saldo", value: eur(saldo), color: saldo>0?P.green:P.red, icon: "finanzen",})
, React.createElement(Stat, { label: "Einnahmen", value: eur(monatE), sub: "Monat", color: P.green, icon: "arrow_r",})
, React.createElement(Stat, { label: "Ausgaben", value: eur(monatA), sub: "Monat", color: P.red, icon: "arrow_r",})
)
, React.createElement(Card, { style: {marginBottom:14},}
, React.createElement('div', { style: {color:"#6E6E73",fontSize:12,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:12},}, "Neue Buchung" )
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:10},}
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},}, React.createElement(Inp, { label: "Beschreibung", value: nE.beschreibung, onChange: v=>setNE(p=>({...p,beschreibung:v})),}), React.createElement(Inp, { label: "Betrag \\u20AC" , value: nE.betrag, onChange: v=>setNE(p=>({...p,betrag:v})), type: "number",}))
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10},}, React.createElement(Sel, { label: "Typ", value: nE.typ, onChange: v=>setNE(p=>({...p,typ:v})), options: [{value:"einnahme",label:"Einnahme"},{value:"ausgabe",label:"Ausgabe"}],}), React.createElement(Sel, { label: "Kategorie", value: nE.kategorie, onChange: v=>setNE(p=>({...p,kategorie:v})), options: ["Reparatur","Teile","Werkzeug","Miete","Personal","Versicherung","Sonstige"].map(v=>({value:v,label:v})),}), React.createElement(Inp, { label: "Datum", value: nE.datum, onChange: v=>setNE(p=>({...p,datum:v})), type: "date",}))
, React.createElement(Btn, { full: true, onClick: addE, size: "md",}, React.createElement(Ic, { n: "plus", s: 15,}), " Buchen" )
)
)
, React.createElement(Card, { noPad: true,}
, kassen.slice(0,40).map((k,i,arr)=>{const tp=k.typ==="einnahme"?P.green:P.red;return React.createElement(Row, { key: k.id, icon: k.typ==="einnahme"?"finanzen":"arrow_r", iconColor: tp, left: k.beschreibung||"-", sub: `${k.kategorie||""} . ${dat(k.datum)}`, right: `${k.typ==="einnahme"?"+":"-"} ${eur(k.betrag)}`, last: i===arr.length-1,});} )
, kassen.length===0&&React.createElement('div', { style: {padding:"28px",textAlign:"center",color:"#AEAEB2",fontSize:14},}, "Keine Buchungen" )
)
)
, tab2==="euer"&&React.createElement(Card, null
, React.createElement('div', { style: {color:"#AEAEB2",fontSize:12,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:14},}, "EÜR " , yr())
, [["Betriebseinnahmen (netto)",jEinn,P.green],["Betriebsausgaben",jAusg,P.red],["Gewinn (vor Steuer)",jEinn-jAusg,(jEinn-jAusg)>0?P.green:P.red],["MwSt-Schuld (UStVA)",jMwst,P.orange]].map(([l,v,c],i,arr)=>(
React.createElement('div', { key: l, style: {display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:i<arr.length-1?`1px solid ${P.border}`:"none"},}, React.createElement('span', { style: {color:"#6E6E73",fontSize:14},}, l), React.createElement('span', { style: {color:c,fontSize:16,fontWeight:700},}, eur(v)))
))
, React.createElement('div', { style: {marginTop:14,padding:"12px",background:"rgba(10,132,255,0.07)",borderRadius:11,color:"#AEAEB2",fontSize:12},}, "i Nur zur Orientierung - kein steuerrechtlich verbindliches Dokument. Bitte mit Steuerberater abstimmen."            )
)
, tab2==="ust"&&React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:14},}
, React.createElement('div', { style: {display:"flex",gap:10,alignItems:"center"},}
, React.createElement(Sel, { label: "Jahr", value: ustJahr, onChange: setUstJahr, options: [String(new Date().getFullYear()),String(new Date().getFullYear()-1),String(new Date().getFullYear()-2)].map(v=>({value:v,label:v})),})
, React.createElement(Btn, { v: "secondary", size: "sm", onClick: ()=>{const jahr=parseInt(ustJahr);const re=(data.rechnungen||[]).filter(r=>r.bezahlt&&!r.storniert&&_optionalChain([r, 'access', _95 => _95.bezahlt_am, 'optionalAccess', _96 => _96.startsWith, 'call', _97 => _97(String(jahr))]));const rows=[["Quartal","Netto","MwSt","Brutto","Anz"]];for(let q=1;q<=4;q++){const m1=(q-1)*3+1;const m2=m1+2;const qR=re.filter(r=>{const m=parseInt(_optionalChain([r, 'access', _98 => _98.bezahlt_am, 'optionalAccess', _99 => _99.slice, 'call', _100 => _100(5,7)]));return m>=m1&&m<=m2;});rows.push(["Q"+q+"/"+jahr,qR.reduce((s,r)=>s+round2(r.netto||0),0).toFixed(2),qR.reduce((s,r)=>s+round2(r.mwst_betrag||0),0).toFixed(2),qR.reduce((s,r)=>s+round2(r.brutto||0),0).toFixed(2),qR.length]);}const csv=rows.map(r=>r.join(";")).join("\n");const blob=new Blob([""+csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="UStVA_"+jahr+".csv";a.click();URL.revokeObjectURL(url);},}, "CSV Export" )
)
, React.createElement(Card, null
, React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:0},}
, [1,2,3,4].map(q=>{const m1=(q-1)*3+1;const m2=m1+2;const jr=parseInt(ustJahr);const qR=(data.rechnungen||[]).filter(r=>r.bezahlt&&!r.storniert&&_optionalChain([r, 'access', _101 => _101.bezahlt_am, 'optionalAccess', _102 => _102.startsWith, 'call', _103 => _103(String(jr))])&&parseInt(_optionalChain([r, 'access', _104 => _104.bezahlt_am, 'optionalAccess', _105 => _105.slice, 'call', _106 => _106(5,7)]))>=m1&&parseInt(_optionalChain([r, 'access', _107 => _107.bezahlt_am, 'optionalAccess', _108 => _108.slice, 'call', _109 => _109(5,7)]))<=m2);const n=qR.reduce((s,r)=>s+round2(r.netto||0),0);const mw=qR.reduce((s,r)=>s+round2(r.mwst_betrag||0),0);const br=qR.reduce((s,r)=>s+round2(r.brutto||0),0);
return React.createElement('div', { key: q, style: {display:"grid",gridTemplateColumns:"60px 1fr 1fr 1fr 1fr",gap:8,padding:"10px 0",borderBottom:q<4?"1px solid rgba(0,0,0,0.05)":"none",alignItems:"center"},}
, React.createElement('span', { style: {color:P.blue,fontSize:13,fontWeight:700},}, "Q", q)
, React.createElement('span', { style: {color:"#6E6E73",fontSize:12},}, qR.length, " RE" )
, React.createElement('span', { style: {color:"#1D1D1F",fontSize:12,textAlign:"right"},}, eur(n), React.createElement('div', { style: {color:"#AEAEB2",fontSize:10},}, "Netto"))
, React.createElement('span', { style: {color:P.orange,fontSize:12,textAlign:"right"},}, eur(mw), React.createElement('div', { style: {color:"#AEAEB2",fontSize:10},}, "MwSt"))
, React.createElement('span', { style: {color:"#1D1D1F",fontSize:13,fontWeight:700,textAlign:"right"},}, eur(br), React.createElement('div', { style: {color:"#AEAEB2",fontSize:10},}, "Brutto"))
);
})
)
)
)
, tab2==="backup"&&React.createElement(React.Fragment, null
, React.createElement('div', { style: {padding:"16px",background:"rgba(48,209,88,0.08)",border:`1px solid rgba(48,209,88,0.2)`,borderRadius:14,marginBottom:14},}
, React.createElement('div', { style: {color:P.green,fontSize:14,fontWeight:600,marginBottom:6},}, "Excel-Backup")
, React.createElement('div', { style: {color:"#6E6E73",fontSize:13,lineHeight:1.6},}, "Alle Daten als Excel-Datei - wird in deinen "        , React.createElement('strong', { style: {color:"#1D1D1F"},}, "Downloads-Ordner"), " gespeichert. Empfohlen: wöchentlich als Backup."     )
)
, React.createElement(Btn, { full: true, v: "success", size: "lg", onClick: doExport,}, React.createElement(Ic, { n: "download", s: 16,}), " Jetzt Excel-Backup erstellen"   )
, React.createElement('div', { style: {marginTop:12,padding:"12px",background:"transparent",borderRadius:11,color:"#AEAEB2",fontSize:12,textAlign:"center"},}, "[folder] Gespeichert als: mehanicar_backup_"
   , tod(), ".xls"
)
)
);
}
function Statistiken(){
const {data}=useApp();
const yr=new Date().getFullYear();
const months=["J","F","M","A","M","J","J","A","S","O","N","D"];
const mData=months.map((_,i)=>{const m=String(i+1).padStart(2,"0");return(data.rechnungen||[]).filter(r=>!r.storniert&&_optionalChain([r, 'access', _110 => _110.datum, 'optionalAccess', _111 => _111.startsWith, 'call', _112 => _112(yr+"-"+m)])).reduce((s,r)=>s+round2(r.brutto||0),0);});
const gesU=mData.reduce((s,v)=>s+v,0);
const auCnt=(data.auftraege||[]).filter(a=>_optionalChain([a, 'access', _113 => _113.erstellt, 'optionalAccess', _114 => _114.startsWith, 'call', _115 => _115(String(yr))])).length;
const kvCnt=(data.angebote||[]).filter(a=>_optionalChain([a, 'access', _116 => _116.erstellt, 'optionalAccess', _117 => _117.startsWith, 'call', _118 => _118(String(yr))])).length;
const maxV=Math.max(...mData,1);
return React.createElement(Screen, { title: "Statistiken",}
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:14},}
, React.createElement(Stat, { label: "Gesamtumsatz", value: eur(gesU), color: P.green,})
, React.createElement(Stat, { label: "Aufträge", value: String(auCnt),})
, React.createElement(Stat, { label: "Abschlussquote", value: kvCnt>0?Math.round(auCnt/kvCnt*100)+"%":"0%",})
, React.createElement(Stat, { label: "Durchschnitt", value: auCnt>0?eur(round2(gesU/auCnt)):eur(0),})
)
, React.createElement(SecH, { title: "Monatsumsatz "+yr,})
, React.createElement(Card, null, React.createElement('div', { style: {display:"flex",alignItems:"flex-end",gap:3,height:110,padding:"6px 2px"},}
, mData.map((v,i)=>React.createElement('div', { key: i, style: {flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2},}
, React.createElement('div', { style: {width:"100%",background:v>0?P.blue:"rgba(0,0,0,0.06)",borderRadius:"3px 3px 0 0",minHeight:4,height:v>0?Math.max(4,Math.round(v/maxV*90))+"%":"6px"},})
, React.createElement('div', { style: {color:"#AEAEB2",fontSize:7},}, months[i])
))
))
);
}
function Bewertungen(){
return React.createElement(Screen, { title: "Bewertungen",}, React.createElement(Card, null, React.createElement('div', { style: {textAlign:"center",padding:"20px"},}, React.createElement('div', { style: {color:"#1D1D1F",fontSize:15,fontWeight:600,marginBottom:8},}, "Kundenbewertungen"), React.createElement('div', { style: {color:"#6E6E73",fontSize:13,marginBottom:14},}, "Sammle Bewertungen direkt bei Google."    ), React.createElement('a', { href: "https://business.google.com", target: "_blank", rel: "noopener noreferrer" , style: {display:"inline-block",padding:"11px 22px",background:P.blue,color:"#fff",borderRadius:11,fontSize:13,fontWeight:600,textDecoration:"none"},}, "Google Business oeffnen"  ))));
}

function Einstellungen(){
const {data,saveSettings,notify,loadAll}=useApp();
const [s,setS]=useState({...DEF_SETTINGS,...data.settings});
const [tab3,setTab3]=useState("preise");
const save2=async()=>{await saveSettings(s);notify("Einstellungen gespeichert ");};
// AW-Preis automatisch berechnen
const awPreisCalc=calcAWPreis(s.stundensatz,s.aw_teiler);
const TABS3=[{v:"preise",l:"Preise & AW"},{v:"firma",l:"Firma"},{v:"nummern",l:"Nummern"}];
return React.createElement(Screen, { title: "Einstellungen",}
, React.createElement(Tabs, { tabs: TABS3, active: tab3, onChange: setTab3,})
, tab3==="preise"&&React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:14},}
/* AW-Teiler Umschalter */
, React.createElement('div', null
, React.createElement('label', { style: {color:"#6E6E73",fontSize:12,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",display:"block",marginBottom:9},}, "AW-Teiler System" )
, React.createElement(Switcher, { options: [{v:"12",l:"12er System (Standard)"},{v:"60",l:"60er System"}], value: String(s.aw_teiler), onChange: v=>setS(p=>({...p,aw_teiler:parseInt(v)})),})
, React.createElement('div', { style: {padding:"12px 14px",background:"rgba(10,132,255,0.08)",borderRadius:12},}
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",marginBottom:4},}, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, "System"), React.createElement('span', { style: {color:"#1D1D1F",fontSize:13,fontWeight:600},}, s.aw_teiler, "er AW-Teiler" ))
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between",marginBottom:4},}, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, "1 AW entspricht"  ), React.createElement('span', { style: {color:"#1D1D1F",fontSize:13,fontWeight:600},}, (60/s.aw_teiler).toFixed(1), " Minuten" ))
, React.createElement('div', { style: {display:"flex",justifyContent:"space-between"},}, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, "AW-Preis (auto)" ), React.createElement('span', { style: {color:P.green,fontSize:15,fontWeight:700},}, eur(awPreisCalc), " / AW"  ))
)
)
, React.createElement(Inp, { label: "Stundensatz \\u20AC/h" , value: String(s.stundensatz||150), onChange: v=>{const st=parseFloat(v)||150;setS(p=>({...p,stundensatz:st}));}, type: "number", note: `-> AW-Preis wird automatisch berechnet: ${eur(awPreisCalc)} pro AW`,})
, React.createElement('div', { style: {padding:"10px 14px",background:"rgba(48,209,88,0.07)",borderRadius:12,display:"flex",justifyContent:"space-between",alignItems:"center"},}
, React.createElement('span', { style: {color:"#6E6E73",fontSize:13},}, "Berechneter AW-Preis" )
, React.createElement('span', { style: {color:P.green,fontSize:18,fontWeight:700},}, eur(awPreisCalc))
)
, React.createElement(Inp, { label: "Material-Aufschlag %" , value: String(s.material_aufschlag||25), onChange: v=>setS(p=>({...p,material_aufschlag:parseFloat(v)||25})), type: "number", suffix: "%",})
, React.createElement(Inp, { label: "MwSt. %" , value: String(s.mwst||19), onChange: v=>setS(p=>({...p,mwst:parseFloat(v)||19})), type: "number", suffix: "%",})
, React.createElement(Inp, { label: "Zahlungsziel (Tage)" , value: String(s.zahlungsziel||14), onChange: v=>setS(p=>({...p,zahlungsziel:parseInt(v)||14})), type: "number",})
, React.createElement(Btn, { full: true, onClick: save2, size: "lg",}, React.createElement(Ic, { n: "check", s: 16,}), " Speichern" )
)
, tab3==="firma"&&React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:12},}
, React.createElement(Inp, { label: "Firmenname", value: s.firma||"", onChange: v=>setS(p=>({...p,firma:v})),})
, React.createElement(Inp, { label: "Inhaber", value: s.inhaber||"", onChange: v=>setS(p=>({...p,inhaber:v})),})
, React.createElement(Inp, { label: "E-Mail", value: s.email||"", onChange: v=>setS(p=>({...p,email:v})), type: "email",})
, React.createElement(Inp, { label: "Telefon", value: s.telefon||"", onChange: v=>setS(p=>({...p,telefon:v})), type: "tel",})
, React.createElement(Inp, { label: "IBAN", value: s.iban||"", onChange: v=>setS(p=>({...p,iban:v})),})
, React.createElement(Inp, { label: "Steuernummer", value: s.steuernummer||"", onChange: v=>setS(p=>({...p,steuernummer:v})),})
, React.createElement(Inp, { label: "USt-ID", value: s.ust_id||"", onChange: v=>setS(p=>({...p,ust_id:v})),})
, React.createElement(Btn, { full: true, onClick: save2, size: "lg",}, React.createElement(Ic, { n: "check", s: 16,}), " Speichern" )
)
, tab3==="nummern"&&React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:12},}
, React.createElement('div', { style: {padding:"12px 14px",background:"rgba(255,159,10,0.08)",borderRadius:12,color:"#AEAEB2",fontSize:13,lineHeight:1.6},}, "Format: "
 , React.createElement('strong', { style: {color:"#3C3C43"},}, "KV-", yr(), "-0001"), " . "  , React.createElement('strong', { style: {color:"#3C3C43"},}, "AU-", yr(), "-0001"), " . "  , React.createElement('strong', { style: {color:"#3C3C43"},}, "RE-", yr(), "-0001")
)
, React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9},}
, React.createElement(Inp, { label: "Nächste KV-Nr." , value: String(s.naechste_kv_nr||1), onChange: v=>setS(p=>({...p,naechste_kv_nr:parseInt(v)||1})), type: "number",})
, React.createElement(Inp, { label: "Nächste AU-Nr." , value: String(s.naechste_au_nr||1), onChange: v=>setS(p=>({...p,naechste_au_nr:parseInt(v)||1})), type: "number",})
, React.createElement(Inp, { label: "Nächste RE-Nr." , value: String(s.naechste_re_nr||1), onChange: v=>setS(p=>({...p,naechste_re_nr:parseInt(v)||1})), type: "number",})
)
, React.createElement(Btn, { full: true, onClick: save2, size: "lg",}, React.createElement(Ic, { n: "check", s: 16,}), " Speichern" )
, React.createElement(Btn, { full: true, v: "secondary", onClick: loadAll, size: "md",}, React.createElement(Ic, { n: "refresh", s: 14,}), " Daten neu laden"   )
)
);
}
const VIEWS={dashboard:Dashboard,auftraege:Auftraege,rechnungen:Rechnungen,kalender:Kalender,kunden:KundenFahrzeuge,lager:Lager,finanzen:Finanzen,statistik:Statistiken,bewertungen:Bewertungen,einstellungen:Einstellungen};
function AppInner(){
const {view,loading}=useApp();
const ViewComp=VIEWS[view]||Dashboard;
if(loading) return React.createElement('div', { style: {display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#F2F2F7",flexDirection:"column",gap:16},}
, React.createElement('div', { style: {width:52,height:52,borderRadius:14,background:"#007AFF",display:"flex",alignItems:"center",justifyContent:"center"},}
, React.createElement('span', { style: {color:"#fff",fontSize:20,fontWeight:900,letterSpacing:-1,fontFamily:FA},}, "m")
)
, React.createElement('div', { style: {color:"#6E6E73",fontSize:14,fontFamily:FA},}, "Wird geladen..." )
);
return React.createElement('div', { style: {minHeight:"100vh",background:"#F2F2F7",fontFamily:"-apple-system,BlinkMacSystemFont,Helvetica Neue,sans-serif",color:"#1D1D1F"},}
, React.createElement(MobileNav, null)
, React.createElement('div', { style: {paddingTop:44},}, React.createElement(ViewComp, null))
, React.createElement(GlobalSearch, null)
);
}
function App(){
return React.createElement(AppProvider, null, React.createElement(AppInner, null));
}


window.__mehanicarReady = true;
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));

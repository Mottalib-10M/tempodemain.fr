#!/usr/bin/env node
/**
 * Relève les jours EJP annoncés par EDF (RECETTE §4 et §12.1 : données qui changent chaque jour).
 *
 * Source : le service qui alimente la page « Connaître les prochains jours EJP » d'EDF
 * (https://particulier.edf.fr/fr/accueil/gestion-contrat/options/ejp.html), sans clé d'API :
 *   - …/calendrier-jours-effacement?option=EJP&dateApplicationBorneInf=…&dateApplicationBorneSup=…
 *     statut de chaque jour : EJP, NON_EJP, HORS_PERIODE_EJP ;
 *   - …/saisons/search?option=EJP&dateReference=…
 *     nombre de jours de la saison, jours déjà tirés, état (NON_COMMENCEE, EN_COURS, FERMEE).
 * EDF précise sur sa page que la mise à jour est faite « quotidiennement vers 14h », qu'elle peut
 * être retardée « jusqu'à 5h du matin du jour EJP », que l'information est non contractuelle et
 * valable pour toutes les zones EJP. Un jour à venir vaut NON_EJP tant qu'EDF n'a rien annoncé :
 * NON_EJP n'est une réponse que pour un jour dont la veille 14 h est passée au moment du relevé.
 *
 * Le serveur d'EDF refuse les appels sans en-têtes de navigateur (Akamai) : on envoie ceux de la
 * page EDF. Si EDF ne répond pas, le fichier existant est gardé tel quel, le script le dit et le
 * build continue (la page affiche la date du dernier relevé réussi).
 *
 * Écrit src/data/ejp.json : une entrée par saison (1er novembre - 31 mars) depuis 2019-2020, la
 * première que le service d'EDF renseigne, avec la liste des jours EJP.
 *
 * Usage : node scripts/data/fetch-ejp.mjs [--all]   (--all : relit aussi les saisons closes)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../../src/data/ejp.json');
const BASE = 'https://api-commerce.edf.fr/commerce/activet/v1';
const FIRST = 2019; // avant la saison 2019-2020, le service d'EDF renvoie HORS_PERIODE_EJP partout
const all = process.argv.includes('--all');
const HEADERS = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  accept: 'application/json, text/plain, */*',
  'accept-language': 'fr-FR,fr;q=0.9',
  origin: 'https://particulier.edf.fr',
  referer: 'https://particulier.edf.fr/',
  'application-origine-controlee': 'site_RC',
  'situation-usage': 'Jours Effacement',
};

const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { seasons: {} };

async function get(url, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(30000) });
      if (r.ok) return await r.json();
      console.warn(`EDF ${r.status} sur ${url} (essai ${i})`);
    } catch (e) { console.warn(`EDF injoignable sur ${url} (essai ${i}) : ${e.message}`); }
    await new Promise((res) => setTimeout(res, 2000 * i));
  }
  return null;
}

const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (s, n) => { const d = new Date(`${s}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const parisToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
/** Saison EJP d'un jour : celle qui a commencé (ou commencera) le 1er novembre précédent ou suivant. */
const seasonOf = (day) => { const [y, m] = day.split('-').map(Number); return m >= 9 ? y : y - 1; };

const today = parisToday();
const tomorrow = addDays(today, 1);
const current = seasonOf(today);
const seasons = { ...prev.seasons };
let ok = true;

for (let y = FIRST; y <= current; y++) {
  const key = `${y}-${y + 1}`;
  if (y < current && seasons[key]?.etat === 'FERMEE' && !all) continue;
  const start = `${y}-11-01`, end = `${y + 1}-03-31`;
  // Saison en cours : on lit jusqu'au lendemain (jamais plus loin, ce serait des NON_EJP par défaut).
  const upTo = y === current ? (tomorrow < end ? tomorrow : end) : end;
  const ref = y === current ? (today < start ? start : today > end ? end : today) : `${y + 1}-01-15`;
  const s = await get(`${BASE}/saisons/search?option=EJP&dateReference=${ref}`);
  const info = s?.content?.[0];
  if (!info) { ok = false; continue; }
  let ejp = [];
  if (upTo >= start) {
    const c = await get(`${BASE}/calendrier-jours-effacement?option=EJP&dateApplicationBorneInf=${start}&dateApplicationBorneSup=${upTo}&identifiantConsommateur=src`);
    const cal = c?.content?.options?.find((o) => o.option === 'EJP')?.calendrier;
    if (!cal) { ok = false; continue; }
    ejp = cal.filter((x) => x.statut === 'EJP').map((x) => x.dateApplication).sort();
  }
  seasons[key] = {
    jours: info.nombreJours,
    tires: info.nombreJoursTires,
    etat: info.etat,
    premier_jour: info.premierJour,
    dernier_jour: info.dernierJour,
    releve_jusqu_au: upTo >= start ? upTo : null,
    ejp,
  };
}

// Contrôles : quota de la saison, jours dans la période. Une saison incohérente arrête le job.
const errors = [];
for (const [key, s] of Object.entries(seasons)) {
  const y = Number(key.slice(0, 4));
  if (s.ejp.length > s.jours) errors.push(`${key} : ${s.ejp.length} jours EJP pour un quota de ${s.jours}`);
  if (s.ejp.some((d) => d < `${y}-11-01` || d > `${y + 1}-03-31`)) errors.push(`${key} : jour EJP hors période`);
  if (s.etat === 'FERMEE' && s.ejp.length !== s.tires) errors.push(`${key} : ${s.ejp.length} jours listés, ${s.tires} tirés selon EDF`);
}
if (errors.length) { console.error('Données EDF incohérentes :\n- ' + errors.join('\n- ')); process.exit(1); }

const out = {
  _lisezmoi: 'Jours EJP (Effacement Jours de Pointe) annoncés par EDF, lus sur le service qui alimente la page « Connaître les prochains jours EJP » d’EDF. Une entrée par saison (1er novembre - 31 mars) : quota, jours tirés selon EDF, état, et liste des jours EJP relevés jusqu’à « releve_jusqu_au ». Information non contractuelle selon EDF, valable pour toutes les zones EJP. Fichier réécrit par scripts/data/fetch-ejp.mjs ; ne pas modifier à la main.',
  source: 'https://particulier.edf.fr/fr/accueil/gestion-contrat/options/ejp.html',
  fetched_at: ok ? new Date().toISOString() : prev.fetched_at ?? null,
  fetched_ok: ok,
  seasons: Object.fromEntries(Object.entries(seasons).sort()),
};
writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
const cs = out.seasons[`${current}-${current + 1}`];
console.log(`ejp.json : ${Object.keys(out.seasons).length} saisons, saison en cours ${cs ? `${cs.ejp.length} jour(s) EJP sur ${cs.jours}, état ${cs.etat}` : 'absente'}, relevé ${ok ? 'complet' : 'partiel (EDF injoignable, données précédentes gardées)'}`);
if (!ok && !prev.fetched_at) process.exit(1);

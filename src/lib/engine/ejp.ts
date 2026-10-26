/**
 * Option EJP (Effacement Jours de Pointe) : jours annoncés par EDF (data/ejp.json, relevé par
 * scripts/data/fetch-ejp.mjs) et prix de la grille EDF « Tarif Bleu - Option EJP » du 1er août 2026
 * (data/params-2026.json). Fonctions pures : la date du jour est toujours passée en argument.
 */
import raw from '../../data/ejp.json';
import { P } from './params';
import { addDays, diffDays } from './tempo';
import { partsCouleur } from './compare';

interface SaisonEjp { jours: number; tires: number; etat: string; premier_jour: string; dernier_jour: string; releve_jusqu_au: string | null; ejp: string[] }
const SAISONS = raw.seasons as Record<string, SaisonEjp>;
export const EJP_RELEVE = { fetchedAt: raw.fetched_at as string | null, fetchedOk: raw.fetched_ok };

/** Date et heure de Paris d'un instant ISO (pour savoir si l'annonce de 14 h était passée au relevé). */
function paris(isoInstant: string) {
  const d = new Date(isoInstant);
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', hour12: false }).format(d)) % 24;
  return { date, hour: h };
}
export const releveParis = () => (EJP_RELEVE.fetchedAt ? paris(EJP_RELEVE.fetchedAt) : null);

/** Saison EJP (1er novembre - 31 mars) rattachée à un jour : celle de l'hiver qui vient ou en cours. */
export const ejpSeasonStart = (d: string) => { const [y, m] = d.split('-').map(Number); return m >= 9 ? y : y - 1; };
export const ejpSeasonKey = (y: number) => `${y}-${y + 1}`;
export const ejpSeasonKeys = () => Object.keys(SAISONS).sort();
export const ejpSeason = (y: number): SaisonEjp | undefined => SAISONS[ejpSeasonKey(y)];
export const enPeriodeEjp = (d: string) => { const m = Number(d.slice(5, 7)); return m >= 11 || m <= 3; };

export type StatutEjp = 'ejp' | 'non' | 'attente' | 'hors';
/**
 * Statut d'un jour pour l'abonné EJP :
 *   - 'hors' : hors de la période du 1er novembre au 31 mars ;
 *   - 'ejp' : EDF l'a annoncé jour EJP ;
 *   - 'non' : pas annoncé alors que le relevé a eu lieu après 14 h la veille (EDF peut encore
 *     retarder l'annonce jusqu'à 5 h du matin, la page le rappelle) ;
 *   - 'attente' : aucun relevé postérieur à la veille 14 h.
 */
export function statutEjp(d: string): StatutEjp {
  if (!enPeriodeEjp(d)) return 'hors';
  const s = ejpSeason(ejpSeasonStart(d));
  if (s?.ejp.includes(d)) return 'ejp';
  const r = releveParis();
  if (!s || !r || !s.releve_jusqu_au || d > s.releve_jusqu_au) return 'attente';
  const veille = addDays(d, -1);
  return r.date > veille || (r.date === veille && r.hour >= P.ejp.annonce_heure) ? 'non' : 'attente';
}

/** Jours EJP déjà annoncés et restants dans la saison qui contient (ou suit) ce jour. */
export function ejpRestants(d: string) {
  const y = ejpSeasonStart(d), s = ejpSeason(y);
  const quota = s?.jours ?? P.ejp.jours, tires = s ? Math.max(s.ejp.length, s.tires) : 0;
  return { y, quota, tires, restants: Math.max(0, quota - tires), etat: s?.etat ?? 'NON_COMMENCEE', jours: s?.ejp ?? [] };
}

/** Jours encore dans la période EJP après `d` (exclu), jusqu'au 31 mars. */
export function joursPeriodeRestants(d: string) {
  const y = ejpSeasonStart(d), debut = `${y}-11-01`, fin = `${y + 1}-03-31`;
  if (d > fin) return 0;
  return diffDays(d < debut ? addDays(debut, -1) : d, fin);
}

/** Statistiques d'une saison close : nombre de jours, premier et dernier, samedis et dimanches, par mois. */
export function ejpStats(y: number) {
  const s = ejpSeason(y);
  const jours = s?.ejp ?? [];
  const wd = (x: string) => new Date(`${x}T12:00:00Z`).getUTCDay();
  const parMois: Record<number, number> = {};
  jours.forEach((x) => { const m = Number(x.slice(5, 7)); parMois[m] = (parMois[m] ?? 0) + 1; });
  return { y, n: jours.length, quota: s?.jours ?? P.ejp.jours, premier: jours[0] ?? null, dernier: jours[jours.length - 1] ?? null, weekend: jours.filter((x) => wd(x) === 0 || wd(x) === 6).length, parMois, complete: s?.etat === 'FERMEE' };
}

/* ---------------- Prix et facture ---------------- */
export const EJP_PUISSANCES: number[] = Object.keys(P.ejp.abo).map(Number).sort((a, b) => a - b);
export const aboAnnuelEjp = (kva: number) => (P.ejp.abo as Record<string, number>)[String(kva)] * 12;
/** Part d'une journée EJP facturée en pointe mobile : 18 heures sur 24 (7 h - 1 h), consommation à plat. */
export const PART_POINTE = P.ejp.pointe_heures / 24;

/** Coût d'une journée pour une consommation donnée : jour EJP (18 h au prix de pointe) ou jour normal. */
export function coutJourEjp(kwhJour: number, ejp: boolean) {
  const E = P.ejp.kwh;
  return ejp ? kwhJour * (PART_POINTE * E.pm + (1 - PART_POINTE) * E.hn) : kwhJour * E.hn;
}

/**
 * Facture annuelle en option EJP. Hypothèses (publiées sur la page) : les 22 jours EJP tombent sur
 * les jours les plus froids, comme les 22 jours rouges Tempo, et reçoivent la même part de la
 * consommation (profil éCO2mix du site) ; sur ces jours, 18 heures sur 24 sont en pointe mobile.
 */
export function factureEjp(kwh: number, kva: number, chauffage: number) {
  const q = Math.max(0, kwh), partEjp = partsCouleur(chauffage).R * (P.ejp.jours / P.tempo_regles.jours_rouges);
  const kwhEjp = q * partEjp, kwhPointe = kwhEjp * PART_POINTE;
  const conso = kwhPointe * P.ejp.kwh.pm + (q - kwhPointe) * P.ejp.kwh.hn;
  const abo = aboAnnuelEjp(kva);
  return { abo, conso, total: abo + conso, kwhEjp, kwhPointe };
}

/**
 * Calendrier Tempo : couleurs publiées par RTE (data/tempo.json, relevé quotidien) et règles de
 * placement (délibération CRE de 2014, fiche de méthode RTE). Fonctions pures : la date du jour est
 * toujours passée en argument (jamais lue ici), pour que le HTML du build et le premier rendu du
 * navigateur soient identiques (RECETTE §17.5).
 */
import raw from '../../data/tempo.json';
import { P } from './params';

export type Couleur = 'B' | 'W' | 'R';
export type Jour = Couleur | null;
const SEASONS: Record<string, string> = raw.seasons;

export const TEMPO = { fetchedAt: raw.fetched_at, fetchedOk: raw.fetched_ok, fallback: raw.fallback as string[] };

const ms = (d: string) => Date.parse(`${d}T12:00:00Z`);
export const addDays = (d: string, n: number) => new Date(ms(d) + n * 864e5).toISOString().slice(0, 10);
export const diffDays = (a: string, b: string) => Math.round((ms(b) - ms(a)) / 864e5);
/** Jour de la semaine, 0 = dimanche. */
export const weekday = (d: string) => new Date(ms(d)).getUTCDay();

/** Première année de la saison qui contient ce jour (saison du 1er septembre au 31 août). */
export const seasonStart = (d: string) => { const [y, m] = d.split('-').map(Number); return m >= 9 ? y : y - 1; };
export const seasonKey = (y: number) => `${y}-${y + 1}`;
export const seasonKeys = () => Object.keys(SEASONS).sort();
export const seasonLength = (y: number) => diffDays(`${y}-09-01`, `${y + 1}-09-01`);

/** Couleur publiée pour un jour Tempo (6 h - 6 h du lendemain), ou null si RTE ne l'a pas encore publiée. */
export function colour(d: string): Jour {
  const y = seasonStart(d);
  const s = SEASONS[seasonKey(y)];
  if (!s) return null;
  const c = s[diffDays(`${y}-09-01`, d)];
  return c === 'B' || c === 'W' || c === 'R' ? c : null;
}

/** Jour Tempo en cours à un instant donné (heure de Paris) : avant 6 h, c'est encore celui de la veille. */
export const tempoDayAt = (dateParis: string, heureParis: number) => (heureParis < P.tempo_regles.heure_debut_jour ? addDays(dateParis, -1) : dateParis);

/** Fériés nationaux fixes et mobiles (lundi de Pâques) : un jour rouge n'y tombe jamais. */
function easter(y: number) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
export function isHoliday(d: string) {
  const md = d.slice(5);
  if (['01-01', '05-01', '05-08', '07-14', '08-15', '11-01', '11-11', '12-25'].includes(md)) return true;
  const y = Number(d.slice(0, 4)), e = easter(y);
  return [1, 39, 50].some((n) => addDays(e, n) === d);
}
/**
 * Le jour peut-il être rouge ? Du 1er novembre au 31 mars, hors samedi, dimanche et fériés ;
 * à partir du 1er novembre 2026, jamais le 24 ni le 31 décembre (délibération CRE n° 2026-189).
 */
export function redPossible(d: string) {
  const m = Number(d.slice(5, 7)), w = weekday(d), R = P.tempo_regles;
  if (d >= R.rouge_pp_depuis && R.rouge_exclus.includes(d.slice(5))) return false;
  return (m >= 11 || m <= 3) && w !== 0 && w !== 6 && !isHoliday(d);
}
/** Le jour peut-il être blanc ? Toute l'année sauf le dimanche. */
export const whitePossible = (d: string) => weekday(d) !== 0;

export interface Compte { B: number; W: number; R: number; publies: number }
/** Jours déjà publiés de chaque couleur dans la saison, jusqu'à `jusquA` inclus (par défaut : tout ce qui est publié). */
export function used(y: number, jusquA?: string): Compte {
  const s = SEASONS[seasonKey(y)] ?? '';
  const n = jusquA ? Math.min(s.length, diffDays(`${y}-09-01`, jusquA) + 1) : s.length;
  const c: Compte = { B: 0, W: 0, R: 0, publies: 0 };
  for (let i = 0; i < n; i++) { const x = s[i] as Couleur; if (x in c) { c[x]++; c.publies++; } }
  return c;
}
/** Quotas de la saison : 22 rouges et 43 blancs (47 blancs et 18 rouges en 2019-2020, décision CRE). */
export function quotas(y: number) {
  const R = P.tempo_regles;
  if (y === 2019) return { R: R.saison_2019_2020.rouges, W: R.saison_2019_2020.blancs, B: seasonLength(y) - R.saison_2019_2020.rouges - R.saison_2019_2020.blancs };
  return { R: R.jours_rouges, W: R.jours_blancs, B: seasonLength(y) - R.jours_rouges - R.jours_blancs };
}
/** Jours restants de chaque couleur. Les trois totaux font toujours la longueur de la saison. */
export function remaining(y: number) {
  const u = used(y), q = quotas(y);
  return { B: q.B - u.B, W: q.W - u.W, R: q.R - u.R, total: seasonLength(y) - u.publies, u, q };
}
/** Dernier jour publié de la saison (ou null). */
export function lastPublished(y: number) {
  const s = SEASONS[seasonKey(y)] ?? '';
  return s.length ? addDays(`${y}-09-01`, s.length - 1) : null;
}
/** Jours encore capables d'accueillir un rouge, après le dernier jour publié : contrôle de cohérence. */
export function redSlotsLeft(y: number) {
  const last = lastPublished(y) ?? addDays(`${y}-09-01`, -1);
  let n = 0;
  for (let d = addDays(last, 1); d <= `${y + 1}-03-31`; d = addDays(d, 1)) if (redPossible(d)) n++;
  return n;
}

export interface Stat { key: string; y: number; n: Compte; premierRouge: string | null; dernierRouge: string | null; premierBlanc: string | null; serieRouge: number; rougesParMois: Record<string, number>; complete: boolean }
/** Statistiques d'une saison : comptes, premier et dernier rouge, plus longue série de rouges consécutifs. */
export function seasonStats(y: number): Stat {
  const s = SEASONS[seasonKey(y)] ?? '';
  let premierRouge: string | null = null, dernierRouge: string | null = null, premierBlanc: string | null = null, serie = 0, best = 0, prev: string | null = null;
  const parMois: Record<string, number> = {};
  for (let i = 0; i < s.length; i++) {
    const d = addDays(`${y}-09-01`, i);
    if (s[i] === 'W' && !premierBlanc) premierBlanc = d;
    if (s[i] !== 'R') continue;
    premierRouge ??= d; dernierRouge = d;
    parMois[d.slice(0, 7)] = (parMois[d.slice(0, 7)] ?? 0) + 1;
    // Série : jours rouges qui se suivent au calendrier (la règle CRE en limite la longueur à 5).
    serie = prev && diffDays(prev, d) === 1 ? serie + 1 : 1;
    best = Math.max(best, serie); prev = d;
  }
  return { key: seasonKey(y), y, n: used(y), premierRouge, dernierRouge, premierBlanc, serieRouge: best, rougesParMois: parMois, complete: s.length >= seasonLength(y) };
}
/** Les N derniers jours publiés jusqu'à `d` inclus, du plus ancien au plus récent. */
export function lastDays(d: string, n: number) {
  return Array.from({ length: n }, (_, i) => addDays(d, i - n + 1)).map((x) => ({ d: x, c: colour(x) }));
}

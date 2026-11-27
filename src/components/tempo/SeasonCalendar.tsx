/**
 * Calendrier d'une saison Tempo (1er septembre - 31 août) : un carré par jour, à la couleur publiée
 * par RTE. Jours à venir en gris ; ceux qui peuvent encore être rouges portent un liseré rouge.
 * Survol / focus : la date et la couleur (title + aria-label). La table des comptes sert de vue texte.
 */
import { addDays, colour, redPossible, seasonLength, type Jour } from '../../lib/engine/tempo';
import { NOM, tag, type L } from './ui';

const MOIS = (l: L, y: number, m: number) => new Date(Date.UTC(y, m, 1)).toLocaleDateString(tag(l), { month: 'short', timeZone: 'UTC' });
// jours blancs : liseré ardoise (4,8:1 sur la carte blanche), sinon invisibles
const BORD_BLANC = '#64748b';
const fill = (c: Jour) => (c === 'B' ? '#1d4ed8' : c === 'R' ? '#b91c1c' : c === 'W' ? '#ffffff' : '#e2e8f0');

export default function SeasonCalendar({ y, lang = 'fr', today }: { y: number; lang?: L; today: string }) {
  const months = Array.from({ length: 12 }, (_, i) => ({ y: i < 4 ? y : y + 1, m: (8 + i) % 12 }));
  const fr = lang === 'fr';
  return (
    <figure className="not-prose">
      <div className="grid grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-4">
        {months.map(({ y: yy, m }) => {
          const first = `${yy}-${String(m + 1).padStart(2, '0')}-01`;
          const n = new Date(Date.UTC(yy, m + 1, 0)).getUTCDate();
          const offset = (new Date(`${first}T12:00:00Z`).getUTCDay() + 6) % 7; // lundi en premier
          return (
            <div key={first}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-navy-600">{MOIS(lang, yy, m)} {String(yy).slice(2)}</p>
              <div className="grid grid-cols-7 gap-[2px]">
                {Array.from({ length: offset }, (_, i) => <span key={`o${i}`} />)}
                {Array.from({ length: n }, (_, i) => {
                  const d = addDays(first, i), c = colour(d);
                  const futureRed = !c && d > today && redPossible(d);
                  const lbl = `${d}${fr ? "\u00a0: " : ": "}${c ? NOM[lang][c] : fr ? 'non publié' : 'not published'}`;
                  return <span key={d} title={lbl} aria-label={lbl} role="img"
                    className={`block aspect-square rounded-[3px] ${c === 'W' || !c ? 'border border-navy-300' : ''} ${d === today ? 'outline outline-2 outline-offset-1 outline-navy-900' : ''}`}
                    style={{ backgroundColor: fill(c), ...(futureRed ? { borderColor: '#b91c1c' } : c === 'W' ? { borderColor: BORD_BLANC } : {}) }} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-600">
        {(['B', 'W', 'R'] as const).map((c) => <span key={c} className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-[3px] border border-navy-300" style={{ backgroundColor: fill(c), ...(c === 'W' ? { borderColor: BORD_BLANC } : {}) }} />{NOM[lang][c]}</span>)}
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-[3px] border border-red-700 bg-navy-200" />{fr ? 'à venir, peut être rouge' : 'to come, can be red'}</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-[3px] border border-navy-300 bg-navy-200" />{fr ? 'à venir' : 'to come'}</span>
        <span>{fr ? `Saison ${y}-${y + 1}, ${seasonLength(y)} jours, lundi en premier.` : `Season ${y}-${y + 1}, ${seasonLength(y)} days, Monday first.`}</span>
      </figcaption>
    </figure>
  );
}

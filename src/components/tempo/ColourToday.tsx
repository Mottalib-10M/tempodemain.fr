/**
 * Couleur Tempo d'aujourd'hui et de demain, jours restants de la saison. Premier rendu = jour du
 * build (propriété), puis l'heure de Paris du navigateur après hydratation (RECETTE §17.5).
 */
import { useEffect, useState } from 'react';
import { addDays, colour, remaining, seasonStart, redPossible, lastPublished, TEMPO, type Jour } from '../../lib/engine/tempo';
import { parisNow } from '../../lib/today';
import { NOM_JOUR, cardStyle, jourLong, dateLongue, type L } from './ui';
import { formatNumber } from '../../lib/format';

const TX = {
  fr: { today: 'Aujourd’hui', tomorrow: 'Demain', hours: 'de 6\u00a0h à 6\u00a0h le lendemain', pending: 'Pas encore publiée', pendingWhy: 'RTE la publie chaque jour vers 10\u00a0h\u00a030', late: 'Publiée par RTE à 10\u00a0h\u00a030 ; notre relevé suit dans l’heure', none: 'Non relevée', night: 'Il est avant 6\u00a0h\u00a0: la journée Tempo en cours est encore celle d’hier', left: 'Restent dans la saison', red: 'rouges', white: 'blancs', blue: 'bleus', until: 'jusqu’au 31 août', nextRed: 'Premier jour rouge possible', redOver: 'Plus aucun jour rouge possible cette saison', fetched: 'Relevé RTE du' },
  en: { today: 'Today', tomorrow: 'Tomorrow', hours: '06:00 to 06:00 the next day', pending: 'Not published yet', pendingWhy: 'RTE publishes it every day around 10:30', late: 'Published by RTE at 10:30; our reading follows within the hour', none: 'Not recorded', night: 'It is before 06:00: the current Tempo day is still yesterday’s', left: 'Left this season', red: 'red', white: 'white', blue: 'blue', until: 'until 31 August', nextRed: 'Earliest possible red day', redOver: 'No red day left possible this season', fetched: 'RTE reading of' },
};

function Card({ d, c, title, sub, lang, note }: { d: string; c: Jour; title: string; sub: string; lang: L; note?: string }) {
  return (
    <div className="rounded-xl border-2 px-3 py-2 sm:px-4 sm:py-3" style={cardStyle(c)} data-couleur={c ?? 'inconnue'}>
      <p className="text-xs font-medium opacity-90 sm:text-sm"><span className="font-semibold">{title}</span><span className="max-sm:block"><span className="sm:inline hidden"> · </span>{jourLong(d, lang)}</span></p>
      {/* Couleur en grand ; le message d'attente, plus long, reste sur une ligne pour ne pas repousser le comparateur sous la ligne de flottaison. */}
      <p className={`mt-0.5 font-bold leading-tight ${c ? 'text-xl sm:text-3xl' : 'text-lg sm:text-xl'}`}>{c ? NOM_JOUR[lang][c] : sub}</p>
      <p className="mt-0.5 text-xs opacity-90 max-sm:hidden">{note ?? (c ? TX[lang].hours : TX[lang].pendingWhy)}</p>
    </div>
  );
}

export default function ColourToday({ lang = 'fr', buildDate, buildHour }: { lang?: L; buildDate: string; buildHour: number }) {
  const t = TX[lang];
  const [now, setNow] = useState({ date: buildDate, hour: buildHour });
  useEffect(() => { setNow(parisNow()); const id = setInterval(() => setNow(parisNow()), 60000); return () => clearInterval(id); }, []);
  const today = now.date, tomorrow = addDays(today, 1);
  const cT = colour(today), cD = colour(tomorrow);
  const y = seasonStart(today), r = remaining(y);
  const last = lastPublished(y) ?? today;
  let next: string | null = null;
  for (let d = addDays(last, 1); d <= `${y + 1}-03-31`; d = addDays(d, 1)) if (redPossible(d)) { next = d; break; }
  const n = (x: number) => formatNumber(x, 0, lang);
  const hier = colour(addDays(today, -1));
  const night = now.hour < 6 ? `${t.night} (${hier ? NOM_JOUR[lang][hier].toLowerCase() : '?'}).` : undefined;
  return (
    <div data-chrome className="not-prose">
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Card d={today} c={cT} title={t.today} sub={t.none} lang={lang} note={night} />
        <Card d={tomorrow} c={cD} title={t.tomorrow} sub={now.hour < 11 ? t.pending : t.late} lang={lang} />
      </div>
      {/* Avant 6 h, la note de nuit va dans la carte sur ordinateur (hauteur constante, le comparateur reste au premier écran) ; paragraphe sur mobile, où cette ligne de la carte est masquée. */}
      {night && <p className="mt-2 text-sm text-navy-700 sm:hidden">{night}</p>}
      <p className="mt-2 text-sm text-navy-700">
        <strong>{t.left}</strong> ({t.until} {y + 1}){lang === "fr" ? "\u00a0: " : ": "}<span className="font-semibold text-red-800">{n(r.R)} {t.red}</span> · <span className="font-semibold text-navy-900">{n(r.W)} {t.white}</span> · <span className="font-semibold text-blue-800">{n(r.B)} {t.blue}</span>
        {' · '}{r.R > 0 ? (next ? <>{t.nextRed}{lang === "fr" ? "\u00a0: " : ": "}{dateLongue(next, lang)}</> : null) : t.redOver}
        <span className="text-xs text-navy-500"> · {t.fetched} {dateLongue(TEMPO.fetchedAt.slice(0, 10), lang)}</span>
      </p>
    </div>
  );
}

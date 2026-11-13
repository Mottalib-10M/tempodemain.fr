import { defineGuide, type Helpers } from '../../lib/guide-types';
import profil from '../../data/profil-conso.json';

type Saisons = Record<string, { chauffage: { B: number; W: number; R: number }; conso_moyenne_mw: { B: number; W: number; R: number } }>;
const PROF = profil.saisons as Saisons;

/** Toutes les saisons publiées par RTE, de la plus récente à la plus ancienne. */
const saisons = (h: Helpers) => h.M.seasonKeys().map((k) => h.M.seasonStats(Number(k.slice(0, 4)))).reverse();
/** Premier rouge le plus précoce et le plus tardif, rangés par jour de saison. */
const extremes = (h: Helpers) => {
  const s = saisons(h).filter((x) => x.complete && x.premierRouge);
  const rang = (x: (typeof s)[number]) => h.M.diffDays(`${x.y}-09-01`, x.premierRouge!);
  const tri = s.slice().sort((a, b) => rang(a) - rang(b));
  const tard = s.slice().sort((a, b) => h.M.diffDays(`${a.y}-09-01`, a.dernierRouge!) - h.M.diffDays(`${b.y}-09-01`, b.dernierRouge!));
  return { tot: tri[0], tardif: tri[tri.length - 1], finTot: tard[0], finTard: tard[tard.length - 1], n: s.length };
};
const pr = (h: Helpers) => { const ks = Object.keys(PROF); const v = ks.map((k) => ({ k, r: PROF[k].chauffage.R })); return { min: v.reduce((a, b) => (b.r < a.r ? b : a)), max: v.reduce((a, b) => (b.r > a.r ? b : a)), ks }; };

export default defineGuide({
  id: 'historique-tempo',
  group: 'tempo',
  order: 5,
  tool: 'historique',
  related: ['jours-tempo-restants', 'couleur-tempo-demain', 'chauffage-electrique-tempo', 'tempo-rentable', 'comparateur'],
  sources: ['rteCalendrier', 'creTempo2014', 'eco2mix', 'rteMethode'],
  fr: {
    slug: 'historique-tempo',
    nav: 'Historique des saisons Tempo',
    card: 'Chaque saison depuis 2014 : jours rouges, premier et dernier rouge, séries.',
    title: 'Historique Tempo 2014-2026 : jours rouges de chaque saison',
    description: 'Historique Tempo de 2014 à 2026 : jours rouges et blancs de chaque saison, premier et dernier rouge, plus longues séries, part du chauffage tombée en rouge.',
    h1: 'Historique des saisons Tempo depuis 2014',
    intro: 'Chaque hiver depuis que RTE choisit les couleurs Tempo : combien de rouges, quand ils sont tombés, et ce qu’ils vous auraient coûté.',
    resume: (h) => {
      const e = extremes(h), n = h.P.tempo_regles;
      return `RTE choisit les couleurs Tempo depuis le 1er novembre 2014, et la totalité de ses publications reste consultable : ${h.num(e.n)} saisons sont closes, de 2014-2015 à la dernière, et la saison en cours se complète jour après jour. Chaque saison close a compté ${h.num(n.jours_rouges)} jours rouges et ${h.num(n.jours_blancs)} jours blancs, sauf 2019-2020, qui s’est terminée sur ${h.num(n.saison_2019_2020.rouges)} rouges et ${h.num(n.saison_2019_2020.blancs)} blancs après la décision de la CRE de remplacer les rouges par des blancs à partir du 19 mars 2020. Ce qui change vraiment d’un hiver à l’autre, c’est le moment : le premier rouge est tombé dès le ${h.date(e.tot.premierRouge!)} et aussi tard que le ${h.date(e.tardif.premierRouge!)} ; le dernier, entre le ${h.date(e.finTot.dernierRouge!)} et le ${h.date(e.finTard.dernierRouge!)}. Choisissez une saison dans l’outil pour voir son calendrier jour par jour et ce que ses jours rouges auraient ajouté à votre facture, au tarif d’aujourd’hui.`;
    },
    faqs: (h) => {
      const p = pr(h);
      return [
        { q: 'Pourquoi la saison 2019-2020 ne compte-t-elle que 18 jours rouges ?', a: `Au printemps 2020, la consommation s’est effondrée avec le confinement, et des jours rouges n’avaient plus de raison d’être. La CRE a décidé que les jours rouges seraient remplacés par des jours blancs à partir du 19 mars 2020. La saison s’est donc close sur ${h.num(h.P.tempo_regles.saison_2019_2020.rouges)} rouges et ${h.num(h.P.tempo_regles.saison_2019_2020.blancs)} blancs, la seule exception depuis 2014.` },
        { q: 'Un hiver doux a-t-il moins de jours rouges ?', a: 'Non, le nombre est fixe : 22 par saison, quel que soit le temps. Un hiver doux décale seulement les dates, parce que l’algorithme de RTE attend des jours de forte consommation nette puis, en fin de période, place le stock restant même sans grand froid. Ce qui change avec la douceur, c’est le coût réel des jours rouges : un chauffage qui tourne moins pèse moins sur ces journées.' },
        { q: 'D’où vient la part du chauffage tombée en jour rouge ?', a: `Nous la calculons à partir de la consommation nationale publiée par RTE dans éCO2mix : pour chaque jour, la consommation au-dessus du niveau d’été mesure l’effet du froid. Selon les saisons, les jours rouges en ont porté entre ${h.pct(p.min.r)} (${p.min.k}) et ${h.pct(p.max.r)} (${p.max.k}). C’est la base du comparateur pour les foyers chauffés à l’électricité.` },
        { q: 'Peut-on prévoir les jours rouges d’après les hivers passés ?', a: 'Pas à la date près. L’historique montre des tendances solides, janvier très chargé, novembre presque vide, jamais un week-end, mais la couleur dépend des prévisions de consommation et de production de la veille. RTE ne publie qu’un jour à l’avance. Les sites qui affichent des prévisions sur neuf jours font leur propre estimation, sans valeur officielle.' },
      ];
    },
    body: (h) => {
      const S = saisons(h);
      return `
<h2>Toutes les saisons Tempo, une par ligne</h2>
${h.table(['Saison', 'Rouges', 'Blancs', 'Bleus', 'Premier rouge', 'Dernier rouge', 'Plus longue série'], S.map((s) => [
  `<span class="whitespace-nowrap">${s.key}</span>${s.complete ? '' : ' (en cours)'}`, h.num(s.n.R), h.num(s.n.W), h.num(s.n.B),
  s.premierRouge ? h.date(s.premierRouge) : 'aucun encore', s.dernierRouge ? h.date(s.dernierRouge) : 'aucun encore', s.premierRouge ? `${h.num(s.serieRouge)} j` : '',
]), 'Couleurs publiées par RTE ; série : jours rouges qui se suivent au calendrier.', ['l', 'r', 'r', 'r', 'l', 'l', 'r'])}
<p>Le tableau est recalculé à chaque relevé à partir du ${h.src('rteCalendrier', 'calendrier de RTE')}. Toutes les saisons closes respectent les règles de la ${h.src('creTempo2014', 'délibération de 2014')} : aucun rouge un samedi, un dimanche ou un jour férié, aucun hors de la période du 1er novembre au 31 mars, jamais plus de cinq de suite, aucun blanc un dimanche. Nos tests le vérifient jour par jour avant chaque mise en ligne.</p>
<h2>Ce que racontent douze hivers</h2>
<p>Une série de cinq rouges consécutifs, du lundi au vendredi, a eu lieu dans ${h.num(S.filter((x) => x.complete && x.serieRouge === 5).length)} saisons closes sur ${h.num(S.filter((x) => x.complete).length)} : c’est la plus longue que la règle autorise, et RTE la pose lors des vagues de froid qui durent une semaine. À l’inverse, la date du premier rouge varie de plusieurs semaines. Un foyer qui attend « le premier rouge de décembre » pour s’organiser a parfois été surpris fin novembre, et a parfois attendu jusqu’en janvier.</p>
<h3>La part du chauffage qui tombe en rouge</h3>
${h.table(['Saison', 'Chauffage en jours rouges', 'Chauffage en jours blancs', 'Consommation moyenne un jour rouge'], Object.keys(PROF).slice().reverse().map((k) => [k, h.pct(PROF[k].chauffage.R), h.pct(PROF[k].chauffage.W), `${h.num(PROF[k].conso_moyenne_mw.R)} MW`]), 'Calcul sur la consommation nationale définitive de RTE (éCO2mix) : consommation de chaque jour au-dessus de la médiane de mai à septembre.', ['l', 'r', 'r', 'r'])}
<p>Avec ${h.src('eco2mix', 'les données éCO2mix')}, on voit combien un hiver pèse. Une saison où les rouges ont coïncidé avec de vraies vagues de froid leur fait porter plus d’un cinquième du chauffage du pays ; une saison douce, ou celle de 2019-2020 et ses rouges remplacés, beaucoup moins. Le ${h.a('comparateur', 'comparateur')} retient la moyenne de toutes les saisons closes, pour ne parier ni sur un hiver rude ni sur un hiver clément.</p>
<h2>Rejouer une saison sur votre consommation</h2>
<p>L’outil en haut de page compte, pour la saison choisie, ce que ses jours rouges vous auraient coûté de plus que des jours bleus, au tarif du 1er août 2026 et pour une journée d’hiver de la consommation que vous indiquez. C’est un moyen simple de mesurer l’écart entre deux hivers ; pour décider de votre option, préférez le calcul complet sur une année, et pour la saison en cours, la page des ${h.a('jours-tempo-restants', 'jours Tempo restants')}.</p>`;
    },
  },
  en: {
    slug: 'tempo-history',
    nav: 'Tempo season history',
    card: 'Every season since 2014: red days, first and last red day, runs.',
    title: 'Tempo history 2014-2026: red and white days, every season',
    description: 'Tempo history from 2014 to 2026: red and white days in every season, the first and last red day, longest runs and the share of heating that fell on red days.',
    h1: 'Tempo seasons since 2014',
    intro: 'Every winter since RTE started choosing the Tempo colours: how many red days, when they fell, and what they would have cost you.',
    resume: (h) => {
      const e = extremes(h), n = h.P.tempo_regles;
      return `RTE has chosen the Tempo colours since 1 November 2014, and every one of its publications can still be looked up: ${h.num(e.n)} seasons are complete, from 2014-2015 to the latest, and the current one fills in day by day. Each completed season had ${h.num(n.jours_rouges)} red days and ${h.num(n.jours_blancs)} white days, except 2019-2020, which ended on ${h.num(n.saison_2019_2020.rouges)} red and ${h.num(n.saison_2019_2020.blancs)} white after the energy regulator, the CRE, had red days replaced by white ones from 19 March 2020. What really changes from one winter to the next is timing: the first red day has fallen as early as ${h.date(e.tot.premierRouge!)} and as late as ${h.date(e.tardif.premierRouge!)}; the last one between ${h.date(e.finTot.dernierRouge!)} and ${h.date(e.finTard.dernierRouge!)}. Pick a season in the tool to see its day-by-day calendar and what its red days would have added to your bill at today’s prices.`;
    },
    faqs: (h) => {
      const p = pr(h);
      return [
        { q: 'Why did the 2019-2020 season have only 18 red days?', a: `In spring 2020 demand collapsed with lockdown and red days no longer made sense. The CRE decided that red days would be replaced by white days from 19 March 2020. The season therefore closed on ${h.num(h.P.tempo_regles.saison_2019_2020.rouges)} red and ${h.num(h.P.tempo_regles.saison_2019_2020.blancs)} white days, the only exception since 2014.` },
        { q: 'Does a mild winter have fewer red days?', a: 'No, the number is fixed at 22 a season whatever the weather. A mild winter only shifts the dates, because RTE’s algorithm waits for days of high net demand and then, towards the end of the period, places the remaining stock even without a cold spell. What mildness changes is the real cost of red days: heating that runs less weighs less on those days.' },
        { q: 'Where does the share of heating on red days come from?', a: `We work it out from national demand published by RTE in éCO2mix: for each day, consumption above the summer level measures the effect of cold. Depending on the season, red days carried between ${h.pct(p.min.r)} (${p.min.k}) and ${h.pct(p.max.r)} (${p.max.k}) of it. That is the basis of the comparison tool for electrically heated homes.` },
        { q: 'Can past winters predict red days?', a: 'Not to the day. The history shows firm patterns, January heavily loaded, November almost empty, never a weekend, but the colour depends on the previous day’s demand and production forecasts. RTE publishes only one day ahead. Sites showing nine-day forecasts are making their own estimates, with no official standing.' },
      ];
    },
    body: (h) => {
      const S = saisons(h);
      return `
<h2>Every Tempo season, one row each</h2>
${h.table(['Season', 'Red', 'White', 'Blue', 'First red', 'Last red', 'Longest run'], S.map((s) => [
  `<span class="whitespace-nowrap">${s.key}</span>${s.complete ? '' : ' (current)'}`, h.num(s.n.R), h.num(s.n.W), h.num(s.n.B),
  s.premierRouge ? h.date(s.premierRouge) : 'none yet', s.dernierRouge ? h.date(s.dernierRouge) : 'none yet', s.premierRouge ? `${h.num(s.serieRouge)} d` : '',
]), 'Colours published by RTE; run: red days following each other on the calendar.', ['l', 'r', 'r', 'r', 'l', 'l', 'r'])}
<p>The table is recalculated at every reading from ${h.src('rteCalendrier', 'RTE’s calendar')}. Every completed season keeps to the rules of the ${h.src('creTempo2014', '2014 deliberation')}: no red day on a Saturday, Sunday or public holiday, none outside 1 November to 31 March, never more than five in a row, no white day on a Sunday. Our tests check this day by day before every release.</p>
<h2>What twelve winters tell us</h2>
<p>A run of five red days, Monday to Friday, happened in ${h.num(S.filter((x) => x.complete && x.serieRouge === 5).length)} of the ${h.num(S.filter((x) => x.complete).length)} completed seasons: it is the longest the rule allows, and RTE uses it during cold spells that last a week. The date of the first red day, on the other hand, moves by several weeks. A household waiting for “the first red day in December” before getting organised has sometimes been caught out in late November and has sometimes waited until January.</p>
<h3>The share of heating that falls on red days</h3>
${h.table(['Season', 'Heating on red days', 'Heating on white days', 'Average demand on a red day'], Object.keys(PROF).slice().reverse().map((k) => [k, h.pct(PROF[k].chauffage.R), h.pct(PROF[k].chauffage.W), `${h.num(PROF[k].conso_moyenne_mw.R)} MW`]), 'Worked out on RTE’s final national demand data (éCO2mix): each day’s consumption above the May to September median.', ['l', 'r', 'r', 'r'])}
<p>With ${h.src('eco2mix', 'the éCO2mix data')} you can see how much a winter weighs. A season whose red days matched genuine cold spells puts over a fifth of the country’s heating on them; a mild season, or 2019-2020 with its swapped red days, far less. The ${h.a('comparateur', 'comparison tool')} uses the average of all completed seasons, so as to bet neither on a harsh winter nor on a gentle one.</p>
<h2>Replay a season on your own use</h2>
<p>The tool at the top counts, for the season you pick, how much more its red days would have cost you than blue days, at the 1 August 2026 tariff and for a winter day of the consumption you enter. It is a simple way to measure the gap between two winters; to choose your option, use the full annual calculation, and for the season under way, the ${h.a('jours-tempo-restants', 'Tempo days left')} page.</p>`;
    },
  },
});

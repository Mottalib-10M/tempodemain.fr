import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Saison en cours au jour du build : comptes, cohérence et premier rouge possible. */
const etat = (h: Helpers) => {
  const M = h.M, y = M.seasonStart(h.today), r = M.remaining(y), last = M.lastPublished(y) ?? h.today;
  let next: string | null = null;
  for (let d = M.addDays(last, 1); d <= `${y + 1}-03-31`; d = M.addDays(d, 1)) if (M.redPossible(d)) { next = d; break; }
  return { y, r, last, next, slots: M.redSlotsLeft(y) };
};
/** Répartition moyenne des jours rouges par mois sur les saisons closes (novembre à mars). */
const parMois = (h: Helpers) => {
  const closed = h.M.seasonKeys().map((k) => h.M.seasonStats(Number(k.slice(0, 4)))).filter((s) => s.complete);
  const mois = ['11', '12', '01', '02', '03'];
  return {
    n: closed.length,
    rows: mois.map((m) => {
      const v = closed.map((s) => Object.entries(s.rougesParMois).filter(([k]) => k.slice(5) === m).reduce((a, [, x]) => a + x, 0));
      return { m, moy: v.reduce((a, x) => a + x, 0) / closed.length, max: Math.max(...v), zero: v.filter((x) => x === 0).length };
    }),
  };
};
const top = (pm: ReturnType<typeof parMois>) => pm.rows.reduce((a, b) => (b.moy > a.moy ? b : a));
const total = (pm: ReturnType<typeof parMois>) => pm.rows.reduce((a, b) => a + b.moy, 0);
const MOIS = { fr: { '11': 'Novembre', '12': 'Décembre', '01': 'Janvier', '02': 'Février', '03': 'Mars' }, en: { '11': 'November', '12': 'December', '01': 'January', '02': 'February', '03': 'March' } } as Record<'fr' | 'en', Record<string, string>>;

export default defineGuide({
  id: 'jours-tempo-restants',
  group: 'tempo',
  order: 3,
  tool: 'joursRestants',
  related: ['couleur-tempo-demain', 'historique-tempo', 'jour-rouge-tempo', 'jour-blanc-tempo', 'tarif-tempo'],
  sources: ['rteCalendrier', 'creTempo2014', 'cre2026189', 'rteMethode', 'grilleEdf'],
  fr: {
    slug: 'jours-tempo-restants',
    nav: 'Jours Tempo restants',
    card: 'Les jours rouges, blancs et bleus qui restent dans la saison, jour par jour.',
    title: 'Calendrier Tempo 2026-2027 : jours rouges et blancs restants',
    description: 'Jours Tempo restants en 2026-2027 : rouges et blancs encore à venir, calendrier jour par jour publié par RTE et coût des jours rouges sur votre facture.',
    h1: 'Jours Tempo restants dans la saison',
    intro: 'Combien de jours Tempo rouges, blancs et bleus il reste d’ici au 31 août, et ce que les jours rouges à venir vous coûteront.',
    resume: (h) => {
      const { y, r, last, next } = etat(h);
      return `La saison Tempo ${y}-${y + 1} a commencé le 1er septembre ${y} et finira le 31 août ${y + 1}. D’après les couleurs publiées par RTE jusqu’au ${h.date(last)}, il reste ${h.num(r.R)} jours rouges sur ${h.num(r.q.R)}, ${h.num(r.W)} jours blancs sur ${h.num(r.q.W)} et ${h.num(r.B)} jours bleus sur ${h.num(r.q.B)}. Les jours rouges ne peuvent tomber qu’entre le 1er novembre et le 31 mars, du lundi au vendredi, hors jours fériés : ${next ? `le prochain jour qui peut être rouge est le ${h.date(next)}` : 'plus aucun jour de la saison ne peut être rouge'}. Les jours blancs, eux, peuvent encore arriver n’importe quel jour sauf le dimanche, jusqu’à la fin du mois d’août. Le calcul ci-dessus multiplie les jours rouges restants par le coût d’une de vos journées d’hiver au tarif du 1er août 2026, pour savoir ce qu’il reste à payer cet hiver, et le calendrier en dessous montre chaque jour déjà publié.`;
    },
    faqs: (h) => {
      const { y, slots, r } = etat(h);
      return [
        { q: 'Comment sont comptés les jours Tempo restants ?', a: `Chaque couleur publiée par RTE depuis le 1er septembre ${y} est retirée de son quota : ${h.num(r.q.R)} rouges, ${h.num(r.q.W)} blancs, le reste en bleu. Le lendemain est compté dès que RTE l’a publié à 10 h 30. Le site vérifie que publiés et restants font toujours la longueur de la saison, ${h.num(h.M.seasonLength(y))} jours, et qu’aucune couleur ne viole les règles de placement.` },
        { q: 'Peut-il rester des jours rouges non utilisés au 31 mars ?', a: `En principe non : l’algorithme de RTE vérifie en fin de période que tout le stock est placé, quitte à poser des jours rouges sans grand froid. Depuis 2014, chaque saison a compté ses ${h.num(h.P.tempo_regles.jours_rouges)} rouges, sauf 2019-2020, où la CRE a fait remplacer les derniers par des blancs pendant le confinement. Il reste aujourd’hui ${h.num(slots)} jours ouvrés capables d’en recevoir.` },
        { q: 'Les jours blancs restants tombent-ils aussi en hiver ?', a: 'Surtout, mais pas seulement. Un jour blanc peut être placé toute l’année sauf le dimanche, samedi compris. Dans les faits, l’algorithme de RTE les réserve aux jours de forte consommation nette : depuis 2014, ils sont tombés de novembre à juin, surtout de décembre à février, et jamais en juillet, août, septembre ni octobre. Après le 31 mars, seuls des blancs et des bleus restent possibles.' },
        { q: 'Que se passe-t-il pour les jours restants si je quitte Tempo en cours de saison ?', a: 'Rien ne vous est dû ni réclamé : les quotas sont nationaux et ne dépendent pas de votre contrat. Vous payez chaque journée au prix de sa couleur tant que vous êtes en Tempo. Changer d’option en plein hiver évite les rouges restants, mais vous perdez aussi les prix bas des jours bleus jusqu’à la fin août : le comparateur aide à peser les deux.' },
      ];
    },
    body: (h) => {
      const { y, r, next, slots } = etat(h), pm = parMois(h);
      return `
<h2>Où en est la saison ${y}-${y + 1}</h2>
${h.table(['Couleur', 'Déjà publiés', 'Restants', 'Quota de la saison'], [
  ['Rouge', h.num(r.u.R), h.num(r.R), h.num(r.q.R)],
  ['Blanc', h.num(r.u.W), h.num(r.W), h.num(r.q.W)],
  ['Bleu', h.num(r.u.B), h.num(r.B), h.num(r.q.B)],
], `Total : ${h.num(r.u.publies)} jours publiés et ${h.num(r.total)} à venir, sur ${h.num(h.M.seasonLength(y))}.`, ['l', 'r', 'r', 'r'])}
<p>Les couleurs viennent du ${h.src('rteCalendrier', 'calendrier Tempo de RTE')}, relu plusieurs fois par jour. Un compteur de jours restants n’a de valeur que s’il tient debout : nous vérifions donc, à chaque relevé, que publiés et restants font le quota, que les trois quotas font la saison, et qu’il reste assez de jours ouvrés avant le 31 mars pour loger les rouges restants. À ce jour, ${h.num(slots)} jours de semaine non fériés peuvent encore être rouges, pour ${h.num(r.R)} rouges à placer.</p>
<h2>Le calendrier des rouges</h2>
<p>La ${h.src('creTempo2014', 'délibération de la CRE de 2014')} borne les jours rouges : du 1er novembre au 31 mars, jamais un samedi, un dimanche ou un jour férié, et au plus cinq d’affilée ; la ${h.src('cre2026189', 'délibération du 21 octobre 2026')} exclut aussi le 24 et le 31 décembre à partir de l’hiver 2026-2027. ${next ? `Le premier jour encore possible est le ${h.date(next)}.` : 'La fenêtre des rouges est refermée pour cette saison.'} Dans le calendrier ci-dessus, les jours à venir qui peuvent devenir rouges portent un liseré rouge ; les autres ne recevront qu’une couleur blanche ou bleue.</p>
<h2>Comment les rouges se sont répartis les hivers passés</h2>
${h.table(['Mois', 'Jours rouges en moyenne', 'Le plus', 'Saisons sans aucun rouge ce mois'], pm.rows.map((x) => [MOIS.fr[x.m], h.num(x.moy, 1), h.num(x.max), `${h.num(x.zero)} sur ${h.num(pm.n)}`]), `Saisons closes depuis 2014-2015, couleurs publiées par RTE.`, ['l', 'r', 'r', 'r'])}
<p>${MOIS.fr[top(pm).m]} concentre à lui seul ${h.pct(top(pm).moy / total(pm), 0)} des jours rouges, parce que l’algorithme de RTE suit la consommation nette, au plus haut quand il fait froid et que le vent manque. Novembre en reçoit rarement : ${h.num(pm.rows[0].zero)} saisons sur ${h.num(pm.n)} n’y ont compté aucun rouge. Un stock encore plein à la mi-janvier n’annonce pas une fin d’hiver tranquille : tout le stock s’écoule avant le 31 mars. Jusqu’en 2025-2026, les rouges restants se serraient alors sur février et mars ; depuis le 1er novembre 2026, un couloir mensuel borne le nombre de rouges cumulés à la fin de chaque mois et limite cet entassement.</p>
<h2>Ce que les jours restants veulent dire pour votre budget</h2>
<p>Le calcul en haut de page multiplie les rouges et les blancs restants par le coût d’une de vos journées d’hiver, aux prix de la ${h.src('grilleEdf', 'grille du 1er août 2026')}. Une journée Linky d’un jour froid, relevée dans votre espace client, donne la valeur la plus juste. Pour savoir ce que coûte une journée précise dès sa publication, voyez la ${h.a('couleur-tempo-demain', 'couleur Tempo de demain')} ; pour les gestes qui réduisent la note, le guide ${h.a('jour-rouge-tempo', 'jour rouge Tempo')}.</p>`;
    },
  },
  en: {
    slug: 'tempo-days-left',
    nav: 'Tempo days left',
    card: 'The red, white and blue days left in the season, day by day.',
    title: 'Tempo days left 2026-2027: red, white and blue days to come',
    description: 'Tempo days left in the 2026-2027 season: red and white days still to come, the day-by-day calendar published by RTE and what the red days will add to your bill.',
    h1: 'Tempo days left in the season',
    intro: 'How many red, white and blue Tempo days are left until 31 August, and what the red days to come will cost you.',
    resume: (h) => {
      const { y, r, last, next } = etat(h);
      return `The ${y}-${y + 1} Tempo season began on 1 September ${y} and will end on 31 August ${y + 1}. Going by the colours RTE has published up to ${h.date(last)}, there are ${h.num(r.R)} red days left out of ${h.num(r.q.R)}, ${h.num(r.W)} white days out of ${h.num(r.q.W)} and ${h.num(r.B)} blue days out of ${h.num(r.q.B)}. Red days can only fall between 1 November and 31 March, Monday to Friday, excluding French public holidays: ${next ? `the next day that can be red is ${h.date(next)}` : 'no day left in the season can be red'}. White days can still come on any day except Sunday, right up to the end of August. The calculation above multiplies the red days left by the cost of one of your winter days on the tariff of 1 August 2026, to show what is still to pay this winter, and the calendar below it shows every day already published by the grid operator.`;
    },
    faqs: (h) => {
      const { y, slots, r } = etat(h);
      return [
        { q: 'How are the Tempo days left counted?', a: `Each colour RTE has published since 1 September ${y} is taken off its quota: ${h.num(r.q.R)} red, ${h.num(r.q.W)} white, the rest blue. Tomorrow counts as soon as RTE publishes it at 10:30. The site checks that published plus remaining always equals the length of the season, ${h.num(h.M.seasonLength(y))} days, and that no colour breaks the placement rules.` },
        { q: 'Can red days go unused by 31 March?', a: `In principle no: RTE’s algorithm checks at the end of the period that the whole stock has been placed, even if that means red days without a cold snap. Since 2014 every season has had its ${h.num(h.P.tempo_regles.jours_rouges)} red days except 2019-2020, when the regulator had the last ones swapped for white during lockdown. Today ${h.num(slots)} weekdays remain that could take one.` },
        { q: 'Do the remaining white days also fall in winter?', a: 'Mostly, but not only. A white day can be placed any day of the year except Sunday, Saturdays included. In practice RTE’s algorithm keeps them for days of high net demand: since 2014 they have fallen between November and June, mostly December to February, and never in July, August, September or October. After 31 March only white and blue days remain possible.' },
        { q: 'What happens to the days left if I leave Tempo mid-season?', a: 'Nothing is owed or claimed: the quotas are national and have nothing to do with your contract. You pay each day at its colour’s price while you are on Tempo. Switching option in midwinter avoids the red days left, but you also lose cheap blue days until the end of August, and the comparison tool helps weigh the two.' },
      ];
    },
    body: (h) => {
      const { y, r, next, slots } = etat(h), pm = parMois(h);
      return `
<h2>Where the ${y}-${y + 1} season stands</h2>
${h.table(['Colour', 'Already published', 'Left', 'Season quota'], [
  ['Red', h.num(r.u.R), h.num(r.R), h.num(r.q.R)],
  ['White', h.num(r.u.W), h.num(r.W), h.num(r.q.W)],
  ['Blue', h.num(r.u.B), h.num(r.B), h.num(r.q.B)],
], `Total: ${h.num(r.u.publies)} days published and ${h.num(r.total)} to come, out of ${h.num(h.M.seasonLength(y))}.`, ['l', 'r', 'r', 'r'])}
<p>The colours come from ${h.src('rteCalendrier', 'RTE’s Tempo calendar')}, read several times a day. A days-left counter is only worth something if it adds up, so at every reading we check that published plus remaining equals the quota, that the three quotas make up the season, and that enough weekdays remain before 31 March to fit the red days still due. As of now, ${h.num(slots)} non-holiday weekdays can still turn red, for ${h.num(r.R)} red days to place.</p>
<h2>The red-day window</h2>
<p>The ${h.src('creTempo2014', 'regulator’s 2014 deliberation')} fences red days in: 1 November to 31 March, never on a Saturday, Sunday or public holiday, and no more than five in a row; the ${h.src('cre2026189', 'deliberation of 21 October 2026')} also rules out 24 and 31 December from the 2026-2027 winter. ${next ? `The earliest day still possible is ${h.date(next)}.` : 'The red-day window has closed for this season.'} In the calendar above, days to come that could turn red have a red outline; the others can only be white or blue.</p>
<h2>How red days were spread in past winters</h2>
${h.table(['Month', 'Average red days', 'Most', 'Seasons with none that month'], pm.rows.map((x) => [MOIS.en[x.m], h.num(x.moy, 1), h.num(x.max), `${h.num(x.zero)} of ${h.num(pm.n)}`]), 'Completed seasons since 2014-2015, colours published by RTE.', ['l', 'r', 'r', 'r'])}
<p>${MOIS.en[top(pm).m]} alone takes ${h.pct(top(pm).moy / total(pm), 0)} of red days, because RTE’s algorithm follows net demand, which peaks when it is cold and the wind drops. November rarely gets any: ${h.num(pm.rows[0].zero)} seasons out of ${h.num(pm.n)} had no red day that month. A stock still full in mid-January does not promise a quiet end of winter: the whole stock is used before 31 March. Until 2025-2026 the remaining red days then bunched up in February and March; since 1 November 2026 a monthly corridor caps the number of red days used by the end of each month and limits that bunching.</p>
<h2>What the days left mean for your budget</h2>
<p>The calculation at the top multiplies the red and white days left by the cost of one of your winter days, at the prices of the ${h.src('grilleEdf', '1 August 2026 grid')}. A Linky reading from a cold day, taken from your online account, gives the most accurate figure. To see what a given day costs as soon as it is announced, check ${h.a('couleur-tempo-demain', 'tomorrow’s Tempo colour')}; for the habits that cut the bill, see the ${h.a('jour-rouge-tempo', 'red day guide')}.</p>`;
    },
  },
});

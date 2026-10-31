import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Jours blancs des saisons closes : premier blanc, blancs tombés un samedi, répartition par mois. */
const blancs = (h: Helpers) => {
  const M = h.M;
  const saisons = M.seasonKeys().map((k) => Number(k.slice(0, 4))).filter((y) => M.seasonStats(y).complete);
  const parMois: Record<number, number> = {};
  let samedis = 0, total = 0;
  const lignes = saisons.map((y) => {
    let sam = 0, n = 0;
    for (let d = `${y}-09-01`; d < `${y + 1}-09-01`; d = M.addDays(d, 1)) {
      if (M.colour(d) !== 'W') continue;
      n++; total++;
      const m = Number(d.slice(5, 7)); parMois[m] = (parMois[m] ?? 0) + 1;
      if (M.weekday(d) === 6) { sam++; samedis++; }
    }
    return { y, premier: M.seasonStats(y).premierBlanc, n, sam };
  });
  return { saisons, lignes, parMois, samedis, total };
};
const MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ORDRE = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];

export default defineGuide({
  id: 'jour-blanc-tempo',
  group: 'tempo',
  order: 11,
  mini: 'jourBlanc',
  related: ['jour-rouge-tempo', 'historique-tempo', 'jours-tempo-restants', 'tarif-tempo'],
  sources: ['creTempo2014', 'cre2026189', 'rteCalendrier', 'grilleEdf'],
  fr: {
    slug: 'jour-blanc-tempo',
    nav: 'Les jours blancs',
    card: 'Quand tombent les 43 jours blancs, samedi compris, et ce qu’ils coûtent.',
    title: 'Jour blanc Tempo 2026 : prix, dates et samedis possibles',
    description: 'Jour blanc Tempo 2026 : 43 jours par saison, possibles le samedi mais jamais le dimanche, prix du kWh, premiers blancs des saisons passées, coût pour vous.',
    h1: 'Jour blanc Tempo : prix, dates et samedis possibles',
    intro: 'Les jours blancs sont plus nombreux que les rouges et moins redoutés : leur prix reste proche de la Base, mais ils tombent aussi le samedi.',
    resume: (h) => {
      const W = h.P.tempo.kwh.W, B = h.P.tempo.kwh.B, Q = h.P.tempo_regles, D = blancs(h);
      return `Une saison Tempo compte ${h.num(Q.jours_blancs)} jours blancs, le niveau intermédiaire entre les jours bleus et les jours rouges. RTE peut les placer à n’importe quelle date de l’année, sauf un dimanche, et donc aussi un samedi ou en dehors de l’hiver. Au tarif réglementé du 1er août 2026, le kilowattheure d’un jour blanc coûte ${h.kwh(W.hp)} en heures pleines, de 6 h à 22 h, et ${h.kwh(W.hc)} en heures creuses, de 22 h à 6 h, contre ${h.kwh(B.hp)} et ${h.kwh(B.hc)} un jour bleu et ${h.kwh(h.P.base.kwh['6'])} en option Base à 6 kVA. Un jour blanc n’est donc pas une journée à éviter à tout prix : en heures pleines, il reste à peine plus cher que la Base. Sur les ${h.num(D.saisons.length)} saisons closes depuis 2014, ${h.num(D.samedis)} des ${h.num(D.total)} jours blancs sont tombés un samedi, et la plupart en plein hiver. Le mini-simulateur ci-dessous donne ce que vous coûte une journée blanche et l’ensemble des jours blancs d’une saison.`;
    },
    faqs: (h) => [
      { q: 'Un dimanche peut-il être un jour blanc ?', a: 'Non. Le dimanche est toujours un jour bleu dans le calendrier Tempo, c’est une des règles de placement fixées en 2014 par la Commission de régulation de l’énergie. Le samedi, en revanche, peut être blanc, mais jamais rouge. Un week-end d’hiver peut donc commencer par un samedi blanc et se terminer par un dimanche bleu, même par grand froid.' },
      { q: 'Faut-il décaler ses usages un jour blanc ?', a: `L’écart est bien plus faible qu’un jour rouge. En heures pleines, le kWh blanc vaut ${h.kwh(h.P.tempo.kwh.W.hp)}, presque le prix de la Base. Décaler après 22 h fait gagner l’écart avec ${h.kwh(h.P.tempo.kwh.W.hc)}, utile pour une lessive, une recharge ou le ballon, mais inutile de baisser le chauffage comme on le ferait un jour rouge.` },
      { q: 'Peut-il y avoir un jour blanc en été ?', a: 'Les règles le permettent : un jour blanc peut tomber toute l’année, sauf le dimanche. Dans les faits, RTE les place surtout quand la consommation nette est forte, c’est-à-dire en hiver. Le tableau des mois sur cette page compte, saison par saison depuis 2014, où sont réellement tombés les jours blancs, ce qui donne une bonne idée des périodes à surveiller.' },
      { q: 'Les jours blancs restants se reportent-ils sur la saison suivante ?', a: `Non. Le stock de ${h.num(h.P.tempo_regles.jours_blancs)} jours blancs est remis à zéro chaque 1er septembre. RTE doit avoir placé tous ceux de la saison avant le 31 août ; un hiver doux en laisse donc davantage pour le printemps. Le compte de la saison en cours est tenu à jour sur la page des jours Tempo restants.` },
      { q: 'Combien de jours blancs tombent avant le premier rouge ?', a: 'Dans chaque saison publiée par RTE depuis 2014, au moins un jour blanc est tombé avant le premier jour rouge, et parfois plus d’une dizaine quand les rouges ont tardé jusqu’à fin décembre ou janvier. Une série de blancs en novembre est donc un bon signal pour vérifier ses réglages avant les premiers rouges : thermostat, ballon, heure de recharge et alertes du fournisseur.' },
    ],
    body: (h) => {
      const W = h.P.tempo.kwh.W, D = blancs(h), fr = true;
      const M = fr ? MOIS_FR : MOIS_EN;
      return `
<h2>Ce que dit la règle</h2>
<p>La ${h.src('creTempo2014', 'délibération de la CRE de 2014')} qui confie à RTE le choix des jours fixe deux contraintes seulement pour les jours blancs : il y en a ${h.num(h.P.tempo_regles.jours_blancs)} par saison, et aucun ne tombe un dimanche. Contrairement aux rouges, ils ne sont limités ni à l’hiver, ni aux jours ouvrés, ni à une durée maximale d’enchaînement. RTE les publie de la même façon, la veille à 10 h 30, sur son ${h.src('rteCalendrier', 'calendrier Tempo')}.</p>
<p>Le jour blanc sert de tampon. Quand la consommation nette dépasse le seuil blanc de l’algorithme sans que la journée soit tirée en rouge, elle devient blanche. Les rouges, eux, ne tombent qu’un jour de semaine entre novembre et mars et, depuis le 1er novembre 2026, sont tirés selon la méthode des jours de pointe du mécanisme de capacité (${h.src('cre2026189', 'délibération de la CRE du 21 octobre 2026')}) ; les blancs restent choisis par l’algorithme habituel. Un samedi très froid peut donc devenir blanc là où un mardi identique aurait été rouge.</p>

<h2>Où tombent vraiment les jours blancs</h2>
<p>Le calendrier publié par RTE depuis 2014 permet de compter, saison par saison, la date du premier jour blanc et le nombre de blancs tombés un samedi.</p>
${h.table(['Saison', 'Premier jour blanc', 'Jours blancs', 'Dont un samedi'], D.lignes.map((l) => [`${l.y}-${l.y + 1}`, l.premier ? h.date(l.premier) : '–', h.num(l.n), h.num(l.sam)]), 'Couleurs publiées par RTE, saisons closes.', ['l', 'l', 'r', 'r'])}
<p>Répartis par mois, sur l’ensemble de ces saisons :</p>
${h.table(['Mois', 'Jours blancs'], ORDRE.filter((m) => D.parMois[m]).map((m) => [M[m - 1], h.num(D.parMois[m])]), `Total ${h.num(D.total)} jours blancs sur ${h.num(D.saisons.length)} saisons.`, ['l', 'r'])}
<p>Le constat est net : les blancs accompagnent le froid. Ils arrivent avec les premiers froids de novembre et s’étirent jusqu’au printemps, quand le stock n’a pas été épuisé. Les mois d’été en reçoivent peu, voire aucun.</p>

<h2>Un prix proche de la Base</h2>
<p>En heures pleines, le kWh blanc coûte ${h.kwh(W.hp)}, à comparer à ${h.kwh(h.P.base.kwh['6'])} en Base et ${h.kwh(h.P.hc.hp)} en heures pleines de l’option Heures creuses (grille ${h.src('grilleEdf', 'EDF du 1er août 2026')}). Une journée blanche ne fait donc presque pas perdre d’argent par rapport à un contrat classique. Les heures creuses blanches, à ${h.kwh(W.hc)}, restent même moins chères que celles de l’option Heures creuses. C’est l’une des raisons pour lesquelles Tempo reste intéressant malgré ses jours rouges : 43 jours sur 365 sont facturés autour du prix habituel, et plus de 300 en dessous.</p>

<h2>Les gestes qui suffisent</h2>
<p>Un jour blanc, inutile de baisser le chauffage ou de renoncer au four. Les gestes qui comptent sont ceux qui ne coûtent rien : laisser le ballon d’eau chaude chauffer la nuit, lancer le lave-linge après 22 h si c’est possible, programmer la recharge de la voiture sur les heures creuses. Gardez votre vigilance pour les ${h.a('jour-rouge-tempo', 'jours rouges')}, où le même kWh coûte près de quatre fois plus.</p>
<p>Le samedi blanc mérite une attention particulière, parce qu’il tombe le jour des grandes lessives et du ménage. Regardez la couleur le vendredi en fin de matinée : si le samedi est blanc, avancer une machine au vendredi soir ou la repousser au dimanche, toujours bleu, fait gagner quelques euros sans effort.</p>

<h2>Suivre le stock de la saison</h2>
<p>Le compte des jours blancs déjà publiés et restants, mis à jour chaque jour, est sur la page ${h.a('jours-tempo-restants', 'jours Tempo restants')}. L’${h.a('historique-tempo', 'historique des saisons')} montre, hiver par hiver, comment RTE a réparti ses blancs et ses rouges, et le coût de ces journées pour une consommation comme la vôtre.</p>
<h2>Combien pèsent les jours blancs dans une année</h2>
<p>Pour un foyer dont la consommation est répartie à plat sur l’année, les ${h.num(h.P.tempo_regles.jours_blancs)} jours blancs représentent ${h.pct(h.P.tempo_regles.jours_blancs / 365)} des jours. Chez un foyer chauffé à l’électricité, la part est plus forte, parce que les blancs tombent surtout l’hiver : selon la consommation nationale mesurée par RTE, ils concentrent ${h.pct(h.M.PROFIL_CHAUFFAGE.W)} de la consommation de chauffage. Le tableau compare le coût d’une même journée selon sa couleur, pour trois niveaux de consommation et 30 % la nuit.</p>
${h.table(['Journée de', 'Bleue', 'Blanche', 'Rouge', 'En Base (6 kVA)'], [15, 30, 50].map((k) => [`${h.num(k)} kWh`, h.eur(h.M.coutJour('B', k, 0.3)), h.eur(h.M.coutJour('W', k, 0.3)), h.eur(h.M.coutJour('R', k, 0.3)), h.eur(k * h.P.base.kwh['6'])]), 'Coût de l’énergie d’une journée, prix TTC au 1er août 2026, hors abonnement.', ['l', 'r', 'r', 'r', 'r'])}
<p>La colonne blanche reste proche de la colonne Base, tandis que la colonne rouge s’en écarte nettement. Pour la facture d’une année, les jours blancs comptent donc surtout par leur nombre, pas par leur prix.</p>

<h2>Ce que le jour blanc annonce</h2>
<p>Un jour blanc n’est pas seulement un tarif : c’est un signal sur l’état du réseau. Il veut dire que la consommation nette prévue par RTE dépasse le seuil blanc de son algorithme. Dans chaque saison publiée depuis 2014, le premier jour blanc est tombé avant le premier rouge, de quelques jours à plusieurs semaines plus tôt. C’est un bon moment pour vérifier les réglages : programmation du thermostat, horaires du ballon, heure de départ de la recharge, et l’abonnement aux alertes de votre fournisseur.</p>
<p>À l’inverse, au printemps, les blancs servent à écouler le stock de la saison. Le froid recule, mais RTE doit avoir placé ses ${h.num(h.P.tempo_regles.jours_blancs)} jours avant le 31 août. Le tableau des mois montre que ces blancs tardifs restent rares en mai et juin, et absents des mois d’été dans l’historique publié.</p>

<h2>Samedi blanc et vie de famille</h2>
<p>Le samedi est souvent le jour où la maison tourne le plus : machines, cuisine, bricolage, recharge pour le week-end. S’il est blanc, le surcoût reste limité, mais il porte sur une journée chargée. Les gestes simples suffisent : regarder la couleur dès le vendredi, faire tourner une machine le vendredi soir, garder les plus grosses pour le dimanche, toujours bleu.</p>
<h2>Faut-il des alertes pour les jours blancs ?</h2>
<p>Les alertes de couleur sont surtout utiles pour les jours rouges, mais elles signalent aussi les blancs. Si vous recevez une notification chaque soir de blanc, vous risquez de finir par ne plus les lire, et de manquer le rouge du lendemain. Un réglage raisonnable consiste à ne demander d’alerte que pour les rouges, et à regarder la couleur du samedi le vendredi. Pour le reste, les heures creuses Tempo font l’essentiel du travail : un foyer qui consomme déjà une bonne part la nuit n’a presque rien à changer un jour blanc.</p>
<p>Les automatismes simplifient encore les choses. Un thermostat ou un gestionnaire d’énergie relié au compteur Linky reçoit la couleur et peut appliquer des consignes différentes selon le jour : normale en bleu, légèrement réduite en blanc, nettement réduite en rouge. Ce réglage à trois niveaux tire parti de l’écart de prix sans demander d’attention au quotidien.</p>
<p>Pour vérifier qu’un réglage est bon, comparez deux semaines d’hiver sur l’espace client de votre fournisseur : la consommation des jours blancs en heures pleines doit rester proche de celle des jours bleus, celle des rouges nettement plus basse.</p>`;
    },
  },
  en: {
    slug: 'tempo-white-day',
    nav: 'White days',
    card: 'When the 43 white days fall, Saturdays included, and what they cost.',
    title: 'Tempo White Day 2026: Prices, Dates and White Saturdays',
    description: 'Tempo white day 2026: 43 days a season, possible on a Saturday but never on a Sunday, kWh prices, first white days of past seasons and what they cost you.',
    h1: 'Tempo white day: prices, dates and Saturdays',
    intro: 'White days outnumber red ones and are far less feared: their price stays close to Base, but they can fall on a Saturday too.',
    resume: (h) => {
      const W = h.P.tempo.kwh.W, B = h.P.tempo.kwh.B, Q = h.P.tempo_regles, D = blancs(h);
      return `A Tempo season contains ${h.num(Q.jours_blancs)} white days, the middle level between blue and red days. RTE can place them on any date of the year except a Sunday, so on a Saturday too, or outside winter. On the regulated tariff of 1 August 2026, a white-day kilowatt-hour costs ${h.kwh(W.hp)} at peak time, 06:00 to 22:00, and ${h.kwh(W.hc)} off-peak, 22:00 to 06:00, against ${h.kwh(B.hp)} and ${h.kwh(B.hc)} on a blue day and ${h.kwh(h.P.base.kwh['6'])} on the Base option at 6 kVA. A white day is therefore not one to dodge at any cost: at peak time it is barely dearer than Base. Over the ${h.num(D.saisons.length)} seasons completed since 2014, ${h.num(D.samedis)} of the ${h.num(D.total)} white days fell on a Saturday, and most fell in the depth of winter. The mini-calculator below gives the cost of one white day and of a whole season’s white days for your household.`;
    },
    faqs: (h) => [
      { q: 'Can a Sunday be a white day?', a: 'No. Sunday is always blue in the Tempo calendar, one of the placement rules set in 2014 by the energy regulator. Saturday, on the other hand, can be white but never red. A winter weekend can therefore start with a white Saturday and end with a blue Sunday, even in a hard frost.' },
      { q: 'Is it worth shifting use on a white day?', a: `The gap is much smaller than on a red day. At peak time a white kWh costs ${h.kwh(h.P.tempo.kwh.W.hp)}, close to the Base price. Moving use after 22:00 saves the difference with ${h.kwh(h.P.tempo.kwh.W.hc)}, which helps for a wash, a car charge or the water heater, but there is no need to turn the heating down as you would on a red day.` },
      { q: 'Can there be a white day in summer?', a: 'The rules allow it: a white day can fall any time of year except Sunday. In practice RTE places them mainly when net demand is high, which means winter. The month-by-month table on this page counts, season by season since 2014, where white days actually fell, which gives a good idea of the periods to watch.' },
      { q: 'Do unused white days carry over to the next season?', a: `No. The stock of ${h.num(h.P.tempo_regles.jours_blancs)} white days resets every 1 September. RTE must have placed all of a season’s white days before 31 August, so a mild winter leaves more of them for the spring. The current season’s count is kept up to date on the Tempo days left page.` },
      { q: 'How many white days fall before the first red day?', a: 'In every season RTE has published since 2014, at least one white day came before the first red day, and sometimes more than ten when red days held off until late December or January. A run of white days in November is therefore a good cue to check your settings before the first red days: thermostat, water heater, charging time and supplier alerts.' },
    ],
    body: (h) => {
      const W = h.P.tempo.kwh.W, D = blancs(h);
      return `
<h2>What the rule says</h2>
<p>The ${h.src('creTempo2014', 'regulator’s 2014 deliberation')} that gave RTE the job of choosing the days sets only two constraints for white days: there are ${h.num(h.P.tempo_regles.jours_blancs)} per season, and none falls on a Sunday. Unlike red days they are not limited to winter, to weekdays or to a maximum run. RTE publishes them the same way, at 10:30 the day before, on its ${h.src('rteCalendrier', 'Tempo calendar')}.</p>
<p>The white day acts as a buffer. When net demand passes the algorithm’s white threshold and the day is not drawn red, it turns white. Red days only fall on weekdays between November and March and, since 1 November 2026, are drawn with the capacity mechanism’s peak-day method (${h.src('cre2026189', 'CRE deliberation of 21 October 2026')}); white days are still chosen by the usual algorithm. A bitterly cold Saturday can therefore become white where an identical Tuesday would have been red.</p>

<h2>Where white days really fall</h2>
<p>The calendar RTE has published since 2014 lets us count, season by season, the date of the first white day and how many white days fell on a Saturday.</p>
${h.table(['Season', 'First white day', 'White days', 'On a Saturday'], D.lignes.map((l) => [`${l.y}-${l.y + 1}`, l.premier ? h.date(l.premier) : '–', h.num(l.n), h.num(l.sam)]), 'Colours published by RTE, completed seasons.', ['l', 'l', 'r', 'r'])}
<p>Spread by month, across all those seasons:</p>
${h.table(['Month', 'White days'], ORDRE.filter((m) => D.parMois[m]).map((m) => [MOIS_EN[m - 1], h.num(D.parMois[m])]), `Total of ${h.num(D.total)} white days over ${h.num(D.saisons.length)} seasons.`, ['l', 'r'])}
<p>The picture is clear: white days come with the cold. They arrive with the first cold of November and stretch into spring when the stock has not run out. Summer months get few, if any.</p>

<h2>A price close to Base</h2>
<p>At peak time a white kWh costs ${h.kwh(W.hp)}, against ${h.kwh(h.P.base.kwh['6'])} on Base and ${h.kwh(h.P.hc.hp)} at peak on the Off-peak option (${h.src('grilleEdf', 'EDF grid of 1 August 2026')}). A white day therefore costs almost nothing extra compared with a standard contract. White off-peak hours, at ${h.kwh(W.hc)}, are even cheaper than the Off-peak option’s off-peak rate. That is one reason Tempo stays attractive despite its red days: 43 days in 365 are billed around the usual price, and more than 300 below it.</p>

<h2>The habits that are enough</h2>
<p>On a white day there is no need to turn the heating down or give up the oven. The habits that count are the free ones: let the water heater run at night, start the washing machine after 22:00 when you can, schedule car charging for off-peak hours. Save your vigilance for ${h.a('jour-rouge-tempo', 'red days')}, when the same kWh costs nearly four times as much.</p>
<p>A white Saturday deserves a little attention, because it is the day of big washes and cleaning. Check the colour on Friday late morning: if Saturday is white, bringing a load forward to Friday evening or pushing it to Sunday, always blue, saves a few euros with no effort.</p>

<h2>Keeping track of the season’s stock</h2>
<p>The count of white days already published and still to come, updated every day, is on the ${h.a('jours-tempo-restants', 'Tempo days left')} page. The ${h.a('historique-tempo', 'season history')} shows, winter by winter, how RTE spread its white and red days, and what those days cost for a consumption like yours.</p>
<h2>How much white days weigh in a year</h2>
<p>For a household whose use is spread evenly over the year, the ${h.num(h.P.tempo_regles.jours_blancs)} white days are ${h.pct(h.P.tempo_regles.jours_blancs / 365)} of the days. For an electrically heated household the share is higher, because white days mostly fall in winter: according to national demand measured by RTE, they concentrate ${h.pct(h.M.PROFIL_CHAUFFAGE.W)} of heating consumption. The table compares the cost of the same day by colour, for three levels of use with 30% at night.</p>
${h.table(['A day of', 'Blue', 'White', 'Red', 'On Base (6 kVA)'], [15, 30, 50].map((k) => [`${h.num(k)} kWh`, h.eur(h.M.coutJour('B', k, 0.3)), h.eur(h.M.coutJour('W', k, 0.3)), h.eur(h.M.coutJour('R', k, 0.3)), h.eur(k * h.P.base.kwh['6'])]), 'Energy cost of one day, prices including tax from 1 August 2026, standing charge excluded.', ['l', 'r', 'r', 'r', 'r'])}
<p>The white column stays close to the Base column, while the red one pulls well away from it. For a year’s bill, white days therefore count mainly through their number, not their price.</p>

<h2>What a white day signals</h2>
<p>A white day is not just a price: it is a signal about the state of the grid. It means the net demand RTE forecasts has crossed the white threshold of its algorithm. In every season published since 2014, the first white day came before the first red one, anywhere from a few days to several weeks earlier. It is a good moment to check your settings: thermostat schedule, water heater times, charging start time, and your supplier’s alerts.</p>
<p>In spring, on the other hand, white days use up the season’s stock. The cold is easing, but RTE must have placed its ${h.num(h.P.tempo_regles.jours_blancs)} days before 31 August. The month table shows those late white days stay rare in May and June, and absent from the summer months in the published record.</p>

<h2>White Saturdays and family life</h2>
<p>Saturday is often the busiest day in the house: laundry, cooking, DIY, charging for the weekend. If it is white, the extra cost stays limited, but it lands on a full day. Simple habits are enough: check the colour on Friday, run one load on Friday evening and keep the biggest ones for Sunday, which is always blue.</p>
<h2>Do you need alerts for white days?</h2>
<p>Colour alerts matter most for red days, but they flag white ones too. If a notification arrives every white evening, you may end up ignoring them and missing the next day’s red. A sensible setting is to ask for alerts on red days only and to check Saturday’s colour on Friday. For the rest, Tempo’s off-peak hours do most of the work: a household that already uses a good share at night has almost nothing to change on a white day.</p>
<p>Automation makes it simpler still. A thermostat or energy manager linked to the Linky meter receives the colour and can apply a different setting for each kind of day: normal on blue, slightly lower on white, clearly lower on red. That three-level setting takes advantage of the price gap without asking for daily attention.</p>
<p>To check that a setting works, compare two winter weeks in your supplier’s online account: white-day peak consumption should stay close to blue days, and red-day consumption clearly lower.</p>
<p>A last point for households who arrive mid-season: the stock of white days already used does not change what you pay per white day, only how many remain. The count is on the Tempo days left page, refreshed every day.</p>
<p>For households new to Tempo, the first winter is the time to learn the rhythm: a few white days in November, the first red ones in late autumn or winter, then a mix of colours until March. After one season most people stop checking white days altogether and keep an eye out only for red.</p>`;
    },
  },
});

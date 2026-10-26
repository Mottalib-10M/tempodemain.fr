import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Appareils types : puissance (kW) et durée (h) saisies comme exemples, coûts tirés de la grille. */
const USAGES: Array<[string, string, number, number]> = [
  ['Lave-linge, cycle à 40 °C', 'Washing machine, 40 °C cycle', 2, 1.5],
  ['Sèche-linge', 'Tumble dryer', 2.5, 2],
  ['Four électrique', 'Electric oven', 2.5, 1],
  ['Radiateur de 1 500 W', '1,500 W radiator', 1.5, 8],
  ['Recharge de voiture sur prise renforcée', 'Car charging on a reinforced socket', 3.7, 4],
];
const lignes = (h: Helpers, fr: boolean) => {
  const R = h.P.tempo.kwh.R, B = h.P.tempo.kwh.B;
  return USAGES.map(([lf, le, p, d]) => { const k = p * d; return [fr ? lf : le, `${h.num(k, 1)} kWh`, h.eur(k * R.hp), h.eur(k * R.hc), h.eur(k * B.hc)]; });
};

export default defineGuide({
  id: 'jour-rouge-tempo',
  group: 'tempo',
  order: 10,
  mini: 'appareilRouge',
  related: ['couleur-tempo-demain', 'jours-tempo-restants', 'chauffage-electrique-tempo', 'jour-blanc-tempo', 'tarif-tempo', 'ecowatt'],
  sources: ['rteCalendrier', 'creTempo2014', 'grilleEdf', 'rteMethode'],
  fr: {
    slug: 'jour-rouge-tempo',
    nav: 'Que faire un jour rouge',
    card: 'Heure par heure, ce qui coûte cher un jour rouge et ce qui peut attendre.',
    title: 'Jour rouge Tempo 2026 : que faire, heure par heure',
    description: 'Jour rouge Tempo 2026 : prix du kWh de 6 h à 22 h, ce qu’il faut décaler après 22 h, comment baisser le chauffage sans risque et ce que coûte chaque appareil.',
    h1: 'Jour rouge Tempo : que faire, heure par heure',
    intro: 'Un jour rouge se prépare la veille au soir : voici ce qui coûte cher entre 6 h et 22 h, et ce qui peut attendre la nuit.',
    resume: (h) => {
      const R = h.P.tempo.kwh.R, B = h.P.tempo.kwh.B, Q = h.P.tempo_regles;
      return `Un jour rouge Tempo, le kilowattheure consommé entre 6 h et 22 h coûte ${h.kwh(R.hp)} au tarif réglementé du 1er août 2026, soit plus de quatre fois le prix des heures pleines d’un jour bleu (${h.kwh(B.hp)}). Après 22 h et jusqu’à 6 h le lendemain, il retombe à ${h.kwh(R.hc)}. La saison en compte ${h.num(Q.jours_rouges)}, tous placés par RTE entre le 1er novembre et le 31 mars, en semaine, hors jours fériés, et jamais plus de ${h.num(Q.rouge_max_consecutifs)} d’affilée. La couleur est connue la veille à 10 h 30 : il reste donc une soirée pour lancer les machines, programmer le ballon d’eau chaude et préparer le chauffage. L’effort utile se concentre sur trois postes, le chauffage, l’eau chaude et les appareils qui chauffent ou qui tournent longtemps, tandis que l’éclairage, la box ou le réfrigérateur ne pèsent presque rien. Le mini-simulateur ci-dessous chiffre l’écart pour l’appareil de votre choix.`;
    },
    faqs: (h) => [
      { q: 'La nuit qui suit un jour rouge est-elle encore chère ?', a: `Elle est facturée au prix des heures creuses rouges, ${h.kwh(h.P.tempo.kwh.R.hc)} le kWh, de 22 h à 6 h. C’est un peu plus qu’une nuit bleue (${h.kwh(h.P.tempo.kwh.B.hc)}), mais très loin des heures pleines rouges. Lancer le lave-linge, le lave-vaisselle ou la recharge de la voiture après 22 h reste donc la meilleure parade, même si le lendemain est lui aussi rouge.` },
      { q: 'Faut-il couper complètement le chauffage un jour rouge ?', a: 'Non. Une baisse d’un ou deux degrés en journée, puis une remontée après 22 h, suffit à alléger la note sans refroidir le logement. Couper tout fait condenser l’humidité, peut abîmer les canalisations par grand froid et met en danger les personnes fragiles, nourrissons, malades ou personnes âgées, qui doivent rester au chaud quelle que soit la couleur.' },
      { q: 'Peut-il y avoir deux semaines de rouge d’affilée ?', a: `Pas au calendrier : RTE ne peut pas placer plus de ${h.num(h.P.tempo_regles.rouge_max_consecutifs)} jours rouges consécutifs, et un week-end ne peut jamais être rouge. Une semaine froide peut donc être rouge du lundi au vendredi, suivie d’un samedi blanc ou bleu et d’un dimanche bleu. La semaine suivante peut recommencer, tant que le stock de jours rouges de la saison n’est pas épuisé.` },
      { q: 'Le réfrigérateur et la box coûtent-ils cher un jour rouge ?', a: 'Très peu. Un appareil qui consomme quelques dizaines de watts en continu ne représente qu’une fraction de kilowattheure sur la journée, donc quelques dizaines de centimes au prix rouge. L’effort se joue sur les appareils puissants ou longs : radiateurs, ballon d’eau chaude, four, sèche-linge, plaques, recharge de voiture. Vérifiez la puissance sur la plaque et faites le calcul avec le mini-simulateur.' },
      { q: 'Comment être prévenu de la veille d’un jour rouge ?', a: 'La couleur paraît à 10 h 30 sur la page calendrier de RTE, puis les fournisseurs l’envoient par courriel, SMS ou application, et le compteur Linky l’affiche. Cette page la relève chez RTE plusieurs fois par jour. Prenez l’habitude de regarder en fin de matinée de novembre à mars : un rouge annoncé laisse toute la soirée pour s’organiser.' },
    ],
    body: (h) => {
      const R = h.P.tempo.kwh.R, Q = h.P.tempo_regles;
      return `
<h2>La veille, dès 10 h 30</h2>
<p>RTE publie la couleur du lendemain à 10 h 30 sur son ${h.src('rteCalendrier', 'calendrier Tempo')} ; c’est la seule publication qui fait foi, et le signal ${h.a('ecowatt', 'Ecowatt')} n’y change rien. Quand le lendemain est rouge, la soirée qui précède devient précieuse : elle est facturée au prix de la couleur du jour en cours, souvent bleue ou blanche, et chaque tâche avancée échappe aux heures pleines rouges. Faites tourner le lave-vaisselle, lancez une lessive, rechargez la voiture jusqu’au bout et laissez le ballon d’eau chaude chauffer pleinement pendant la nuit.</p>
<p>Si votre logement est chauffé à l’électricité, montez d’un degré en fin de soirée et pendant la nuit : la maison emmagasine de la chaleur dans ses murs et ses meubles, que vous consommerez le lendemain sans la payer au prix rouge. L’effet dépend beaucoup de l’isolation, mais il ne coûte presque rien à essayer.</p>

<h2>De 6 h à 22 h : les heures qui coûtent</h2>
<p>Pendant seize heures, chaque kilowattheure coûte ${h.kwh(R.hp)}. Le tableau ci-dessous chiffre quelques usages fréquents, avec des puissances et des durées données en exemple : remplacez-les par celles de vos propres appareils, inscrites sur leur plaque signalétique.</p>
${h.table(['Usage (exemple)', 'Énergie', 'Rouge 6 h - 22 h', 'Rouge après 22 h', 'Bleu la nuit'], lignes(h, true), 'Coût d’un usage, prix TTC du kWh au 1er août 2026.', ['l', 'r', 'r', 'r', 'r'])}
<p>La leçon tient en une ligne : un usage qui dure, comme un radiateur allumé huit heures, pèse beaucoup plus qu’un usage puissant mais bref. Le four d’un dîner coûte quelques euros, le chauffage d’une journée entière en coûte des dizaines. C’est pourquoi l’essentiel de l’économie d’un jour rouge vient du chauffage et de l’eau chaude, pas de l’éclairage.</p>

<h2>Le chauffage, sans prendre de risque</h2>
<p>Baisser la consigne d’un ou deux degrés entre 6 h et 22 h, puis la relever à 22 h, est le geste le plus rentable. Un thermostat programmable le fait sans y penser ; certains reçoivent directement le signal Tempo du compteur et s’ajustent seuls. Ne descendez pas trop bas : un logement trop froid prend l’humidité, et la remise en température consomme une partie de ce que vous aurez économisé. Surtout, la santé passe avant la facture : les nourrissons, les personnes âgées ou malades doivent rester au chaud, et un chauffage d’appoint au combustible dans une pièce fermée est dangereux. Le guide ${h.a('chauffage-electrique-tempo', 'chauffage électrique et Tempo')} montre combien pèsent les jours rouges dans une année de chauffage.</p>

<h2>L’eau chaude, la cuisine, le linge</h2>
<p>Un ballon d’eau chaude relié au contact heures creuses du compteur chauffe entre 22 h et 6 h : il ne consomme rien en heures pleines rouges, à condition que vous ne forciez pas une marche manuelle. Pour la cuisine, préférez ce jour-là des plats rapides aux longues cuissons au four. Le lave-linge et le sèche-linge attendent sans difficulté la nuit ou le lendemain ; un départ différé règle la question. Une voiture électrique branchée ne doit charger qu’après 22 h : programmez l’heure de début dans la voiture ou sur la borne.</p>

<h2>Après 22 h, et le lendemain</h2>
<p>De 22 h à 6 h, le prix tombe à ${h.kwh(R.hc)}. C’est le moment de rattraper ce qui a été repoussé. Une journée Tempo va de 6 h à 6 h, si bien que la nuit appartient encore au jour rouge pour la facture, au tarif des heures creuses rouges. Les jours rouges pouvant s’enchaîner jusqu’à ${h.num(Q.rouge_max_consecutifs)} fois en semaine, regardez la couleur du lendemain avant de tout relancer : la page ${h.a('couleur-tempo-demain', 'couleur Tempo de demain')} la donne dès sa publication.</p>

<h2>Combien de jours rouges cet hiver ?</h2>
<p>Le stock est fixé : ${h.num(Q.jours_rouges)} par saison, selon les règles de la ${h.src('creTempo2014', 'délibération de la CRE de 2014')}. RTE les place quand la consommation nette prévue, consommation nationale moins éolien et solaire, franchit un seuil qui baisse à mesure que la saison avance, comme l’explique sa ${h.src('rteMethode', 'fiche de méthode')}. Les ${h.num(Q.jours_rouges)} jours doivent être placés avant le 31 mars : même un hiver doux finit par les écouler, et l’${h.a('historique-tempo', 'historique des saisons')} montre des derniers rouges tombés jusqu’au 31 mars. Le compte de la saison en cours est sur la page ${h.a('jours-tempo-restants', 'jours Tempo restants')}.</p>
<h2>Trois façons de vivre la même journée rouge</h2>
<p>Pour mesurer l’effet des gestes, prenons une maison qui consomme 40 kWh un jour d’hiver, dont 30 % la nuit, et comparons trois manières de passer la journée. Les coûts viennent du moteur du site, au prix rouge de la grille en vigueur.</p>
${h.table(['Organisation de la journée', 'Part la nuit', 'Énergie', 'Coût de la journée'], [
  ['Rien ne change', h.pct(0.3, 0), '40 kWh', h.eur(h.M.coutJour('R', 40, 0.3))],
  ['Machines, ballon et recharge après 22 h', h.pct(0.45, 0), '40 kWh', h.eur(h.M.coutJour('R', 40, 0.45))],
  ['Même chose, chauffage baissé en journée', h.pct(0.5, 0), '34 kWh', h.eur(h.M.coutJour('R', 34, 0.5))],
], 'Exemple de calcul, prix TTC des jours rouges au 1er août 2026. La baisse du chauffage retire 6 kWh d’heures pleines.', ['l', 'r', 'r', 'r'])}
<p>La première économie vient du simple déplacement des usages vers la nuit, sans le moindre inconfort. La seconde vient du chauffage. Additionnées, elles divisent presque la note de la journée par deux, et ce sur ${h.num(Q.jours_rouges)} journées par hiver.</p>

<h2>Les erreurs qui coûtent le plus</h2>
<p>La plus fréquente consiste à forcer le ballon d’eau chaude en marche manuelle un matin de jour rouge, parce que l’eau a manqué la veille : quelques kilowattheures facturés au prix fort, alors qu’une douche plus courte aurait suffi jusqu’au soir. Vient ensuite la minuterie réglée une fois pour toutes sur une heure fixe de l’après-midi, pour un lave-linge ou un déshumidificateur, que personne ne pense à décaler les jours rouges.</p>
<p>Autre piège : le radiateur d’appoint électrique allumé dans une pièce froide pendant que le chauffage principal a été baissé. Il annule l’effort et coûte souvent plus cher qu’une consigne générale réduite d’un seul degré. Enfin, beaucoup oublient que le jour rouge commence à 6 h : un four lancé à 6 h 30 pour le petit-déjeuner ou une recharge qui se prolonge après 6 h passe déjà au prix rouge des heures pleines.</p>

<h2>Un foyer avec des personnes fragiles</h2>
<p>Tempo n’oblige à rien : il incite. Un foyer où vivent un nouveau-né, une personne âgée, malade ou dépendante doit garder une température confortable, quelle que soit la couleur. Les économies se cherchent alors ailleurs que dans le chauffage des pièces de vie : eau chaude, machines, cuisson, recharge. Si le chauffage ne peut pas baisser les jours rouges, refaites le calcul avec le ${h.a('comparateur', 'comparateur')} en choisissant « Rien » comme report : il dira si Tempo reste intéressant pour vous.</p>
<h2>Le cas des logements sans chauffage électrique</h2>
<p>Un appartement chauffé au gaz ou par un réseau collectif vit les jours rouges beaucoup plus sereinement : sa consommation électrique tient surtout à l’eau chaude, à la cuisine, au linge et aux appareils. Pour lui, l’effort se résume souvent à ne rien lancer de gros entre 6 h et 22 h et à laisser le ballon chauffer la nuit. Ces journées pèsent alors à peu près leur part du calendrier, et Tempo reste en général l’option la moins chère, comme le montre la page d’accueil sur un foyer type sans chauffage électrique.</p>
<p>Le télétravail change un peu la donne : un ordinateur, un écran et une plaque de cuisson à midi, un jour rouge, ne représentent que quelques kilowattheures, mais un radiateur d’appoint dans le bureau en représente vite beaucoup plus. Mieux vaut alors s’installer dans la pièce la mieux chauffée que réchauffer une pièce froide à l’électricité.</p>`;
    },
  },
  en: {
    slug: 'tempo-red-day',
    nav: 'What to do on a red day',
    card: 'Hour by hour, what is expensive on a red day and what can wait.',
    title: 'Tempo Red Day 2026: What to Do, Hour by Hour in France',
    description: 'Tempo red day 2026: the kWh price from 06:00 to 22:00, what to move after 22:00, how to turn the heating down safely and what each appliance costs you.',
    h1: 'Tempo red day: what to do, hour by hour',
    intro: 'A red day is prepared the evening before: here is what costs a lot between 06:00 and 22:00 and what can wait for the night.',
    resume: (h) => {
      const R = h.P.tempo.kwh.R, B = h.P.tempo.kwh.B, Q = h.P.tempo_regles;
      return `On a Tempo red day, each kilowatt-hour used between 06:00 and 22:00 costs ${h.kwh(R.hp)} on the regulated tariff of 1 August 2026, more than four times the blue-day peak price (${h.kwh(B.hp)}). After 22:00 and until 06:00 the next morning it drops back to ${h.kwh(R.hc)}. A season holds ${h.num(Q.jours_rouges)} of them, all placed by RTE between 1 November and 31 March, on weekdays, never on a bank holiday and never more than ${h.num(Q.rouge_max_consecutifs)} in a row. The colour is known at 10:30 the day before, which leaves an evening to run appliances, set the water heater and prepare the heating. Useful effort goes into three areas, heating, hot water and appliances that heat up or run for a long time, while lighting, the internet box and the fridge weigh almost nothing. The mini-calculator below puts a figure on the gap for any appliance you choose.`;
    },
    faqs: (h) => [
      { q: 'Is the night after a red day still expensive?', a: `It is billed at the red off-peak rate, ${h.kwh(h.P.tempo.kwh.R.hc)} per kWh, from 22:00 to 06:00. That is a little more than a blue night (${h.kwh(h.P.tempo.kwh.B.hc)}) but nowhere near red peak hours. Running the washing machine, the dishwasher or the car charge after 22:00 is still the best move, even if the next day is red as well.` },
      { q: 'Should I switch the heating off entirely on a red day?', a: 'No. Turning it down one or two degrees during the day and back up after 22:00 is enough to lighten the bill without chilling the home. Switching everything off lets damp build up, can harm pipes in a hard frost and puts vulnerable people at risk: babies, elderly or ill people must stay warm whatever the colour.' },
      { q: 'Can there be two weeks of red in a row?', a: `Not on the calendar: RTE cannot place more than ${h.num(h.P.tempo_regles.rouge_max_consecutifs)} consecutive red days, and a weekend can never be red. A cold week can be red Monday to Friday, followed by a white or blue Saturday and a blue Sunday. The next week can start again, as long as the season’s stock of red days is not used up.` },
      { q: 'Do the fridge and the internet box cost much on a red day?', a: 'Very little. A device drawing a few dozen watts around the clock uses only a fraction of a kilowatt-hour over the day, so a few dozen cents at the red price. The effort belongs to powerful or long-running appliances: radiators, water heater, oven, tumble dryer, hob, car charging. Check the power on the rating plate and run the figures in the mini-calculator.' },
      { q: 'How can I be warned the day before a red day?', a: 'The colour appears at 10:30 on RTE’s calendar page, then suppliers send it by email, text or app, and the Linky meter shows it. This page reads it from RTE several times a day. Get into the habit of checking late in the morning from November to March: a red day announced in advance leaves the whole evening to get organised.' },
    ],
    body: (h) => {
      const R = h.P.tempo.kwh.R, Q = h.P.tempo_regles;
      return `
<h2>The day before, from 10:30</h2>
<p>RTE publishes the next day’s colour at 10:30 on its ${h.src('rteCalendrier', 'Tempo calendar')}, the only binding source, which the ${h.a('ecowatt', 'Ecowatt')} signal does not change. When tomorrow is red, the evening before becomes valuable: it is billed at the current day’s colour, often blue or white, and every task brought forward escapes red peak prices. Run the dishwasher, start a wash, charge the car to full and let the water heater heat up completely overnight.</p>
<p>If your home is electrically heated, raise the temperature by a degree late in the evening and overnight: the house stores heat in its walls and furniture, which you then use the next day without paying the red price for it. How well this works depends a great deal on insulation, but it costs almost nothing to try.</p>

<h2>From 06:00 to 22:00: the expensive hours</h2>
<p>For sixteen hours each kilowatt-hour costs ${h.kwh(R.hp)}. The table below prices a few common uses, with power ratings and durations given as examples: swap in those of your own appliances, printed on their rating plate.</p>
${h.table(['Use (example)', 'Energy', 'Red 06:00-22:00', 'Red after 22:00', 'Blue at night'], lignes(h, false), 'Cost of one use, kWh prices including tax from 1 August 2026.', ['l', 'r', 'r', 'r', 'r'])}
<p>The lesson fits on one line: something that runs for hours, like a radiator left on for eight, weighs far more than a powerful but brief use. Dinner in the oven costs a few euros; a full day of heating costs tens. That is why most of a red day’s saving comes from heating and hot water, not from lighting.</p>

<h2>Heating, without taking risks</h2>
<p>Lowering the setting by one or two degrees between 06:00 and 22:00 and raising it again at 22:00 is the most rewarding move. A programmable thermostat does it for you; some receive the Tempo signal straight from the meter and adjust on their own. Do not go too low: a home that gets too cold picks up damp, and warming it back up eats part of the saving. Above all, health comes before the bill: babies, elderly or ill people must stay warm, and a fuel-burning heater in a closed room is dangerous. The guide on ${h.a('chauffage-electrique-tempo', 'electric heating and Tempo')} shows how much red days weigh in a year of heating.</p>

<h2>Hot water, cooking, laundry</h2>
<p>A water heater wired to the meter’s off-peak contact heats between 22:00 and 06:00: it uses nothing at red peak time, provided you do not force it on manually. For cooking, favour quick dishes over long oven sessions that day. The washing machine and dryer can easily wait for the night or the next day; a delayed start does the job. An electric car that is plugged in should only charge after 22:00: set the start time in the car or on the wallbox.</p>

<h2>After 22:00, and the next day</h2>
<p>From 22:00 to 06:00 the price falls to ${h.kwh(R.hc)}. This is when to catch up on whatever was put off. A Tempo day runs from 06:00 to 06:00, so for billing purposes the night still belongs to the red day, at red off-peak rates. Since red days can run up to ${h.num(Q.rouge_max_consecutifs)} times in a row on weekdays, check the next day’s colour before restarting everything: the ${h.a('couleur-tempo-demain', 'tomorrow’s Tempo colour')} page shows it as soon as it is out.</p>

<h2>How many red days this winter?</h2>
<p>The stock is fixed: ${h.num(Q.jours_rouges)} per season, under the rules of the ${h.src('creTempo2014', 'regulator’s 2014 deliberation')}. RTE places them when forecast net demand, national consumption minus wind and solar, crosses a threshold that falls as the season goes on, as its ${h.src('rteMethode', 'method note')} explains. All ${h.num(Q.jours_rouges)} days must be placed before 31 March: even a mild winter ends up using them, and the ${h.a('historique-tempo', 'season history')} shows last red days falling as late as 31 March. The current season’s count is on the ${h.a('jours-tempo-restants', 'Tempo days left')} page.</p>
<h2>Three ways to live the same red day</h2>
<p>To measure what the habits are worth, take a house using 40 kWh on a winter day, 30% of it at night, and compare three ways of getting through the day. Costs come from the site’s engine at the red prices of the grid in force.</p>
${h.table(['How the day is organised', 'Night share', 'Energy', 'Cost of the day'], [
  ['Nothing changes', h.pct(0.3, 0), '40 kWh', h.eur(h.M.coutJour('R', 40, 0.3))],
  ['Appliances, water heater and charging after 22:00', h.pct(0.45, 0), '40 kWh', h.eur(h.M.coutJour('R', 40, 0.45))],
  ['Same again, heating lowered during the day', h.pct(0.5, 0), '34 kWh', h.eur(h.M.coutJour('R', 34, 0.5))],
], 'Worked example, red-day prices including tax from 1 August 2026. Lowering the heating removes 6 kWh of peak use.', ['l', 'r', 'r', 'r'])}
<p>The first saving comes simply from moving use into the night, with no discomfort at all. The second comes from heating. Together they come close to halving the cost of the day, and that across ${h.num(Q.jours_rouges)} days each winter.</p>

<h2>The mistakes that cost most</h2>
<p>The most common is forcing the water heater on manually on a red-day morning because hot water ran out the evening before: a few kilowatt-hours at the top price, when a shorter shower would have lasted until the evening. Next comes the timer set once and for all to a fixed afternoon hour, for a washing machine or a dehumidifier, which nobody thinks to move on red days.</p>
<p>Another trap is the plug-in electric heater switched on in a cold room while the main heating has been turned down. It cancels the effort and often costs more than lowering the whole house by a single degree. Finally, many forget that a red day starts at 06:00: an oven switched on at 06:30 for breakfast, or a charge that runs past 06:00, is already billed at red peak prices.</p>

<h2>A household with vulnerable people</h2>
<p>Tempo obliges nothing; it encourages. A household with a newborn, an elderly, ill or dependent person must keep a comfortable temperature whatever the colour. Savings then have to be found away from the heating of living rooms: hot water, appliances, cooking, charging. If the heating cannot go down on red days, run the ${h.a('comparateur', 'comparison tool')} again with “Nothing” as the shift: it will tell you whether Tempo still pays for you.</p>
<h2>Homes without electric heating</h2>
<p>A flat heated by gas or a district network gets through red days far more calmly: its electricity use comes mainly from hot water, cooking, laundry and appliances. For it, the effort often comes down to running nothing large between 06:00 and 22:00 and letting the water heater work at night. Those days then weigh roughly their share of the calendar, and Tempo usually stays the cheapest option, as the home page shows for a typical household without electric heating.</p>
<p>Working from home changes things slightly: a computer, a screen and a hob at lunchtime on a red day add up to only a few kilowatt-hours, but a plug-in heater in the study soon adds up to far more. Better to work in the best-heated room than to warm a cold one with electricity.</p>
<p>The same logic applies to second homes and holiday lets: a property left empty on a red day only needs frost protection, not comfort heating, and a frost setting on each radiator costs a fraction of a normal day.</p>`;
    },
  },
});

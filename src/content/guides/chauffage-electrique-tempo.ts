import { defineGuide, type Helpers } from '../../lib/guide-types';
import profil from '../../data/profil-conso.json';
import { chauffageRouge } from '../../lib/minis/chauffage';

type S = { jours: { B: number; W: number; R: number }; chauffage: { B: number; W: number; R: number } };
const SAISONS = Object.entries(profil.saisons as Record<string, S>);
const parSaison = (h: Helpers) => SAISONS.map(([k, s]) => [k, h.num(s.jours.R), h.pct(s.chauffage.R), h.pct(s.chauffage.W), h.pct(s.chauffage.B)]);
const KWH = [4000, 6000, 10000];
const scenarios = (h: Helpers) => KWH.map((k) => { const a = chauffageRouge(k, 0), b = chauffageRouge(k, 0.2); return [`${h.num(k)} kWh`, `${h.num(a.kr)} kWh`, h.eur(a.rouge), h.eur(b.rouge), h.eur(a.hcOpt)]; });
const extremes = () => { const r = SAISONS.map(([k, s]) => ({ k, r: s.chauffage.R })).sort((a, b) => a.r - b.r); return { min: r[0], max: r[r.length - 1] }; };

export default defineGuide({
  id: 'chauffage-electrique-tempo',
  group: 'choisir',
  order: 13,
  mini: 'chauffage',
  related: ['tempo-rentable', 'jour-rouge-tempo', 'comparateur', 'historique-tempo', 'puissance-compteur'],
  sources: ['eco2mix', 'rteMethode', 'grilleEdf', 'rteCalendrier'],
  fr: {
    slug: 'chauffage-electrique-tempo',
    nav: 'Chauffage électrique et Tempo',
    card: 'La part du chauffage qui tombe un jour rouge, mesurée sur douze hivers.',
    title: 'Chauffage électrique et Tempo 2026 : le poids des rouges',
    description: 'Chauffage électrique et Tempo en 2026 : part du chauffage tombant un jour rouge selon RTE, coût d’un hiver de radiateurs ou de pompe à chaleur, baisse utile.',
    h1: 'Chauffage électrique et Tempo : ce que pèsent les jours rouges',
    intro: 'Les jours rouges Tempo tombent par grand froid, quand le chauffage tourne le plus : voici, mesurée par RTE, la part de votre chauffage qu’ils concentrent.',
    resume: (h) => {
      const P = h.M.PROFIL_CHAUFFAGE, Q = h.P.tempo_regles, t = h.P.tempo.kwh;
      return `Les jours rouges Tempo ne tombent pas au hasard : RTE les place quand la consommation nette nationale est la plus forte, c’est-à-dire par grand froid, quand les radiateurs et les pompes à chaleur tournent le plus. Pour mesurer cet effet, nous avons croisé la consommation nationale jour par jour publiée par RTE avec la couleur de chaque jour depuis 2014. En moyenne sur ${h.num(h.M.PROFIL_SAISONS)} saisons, les ${h.num(Q.jours_rouges)} jours rouges ont concentré ${h.pct(P.R)} de la consommation de chauffage, les ${h.num(Q.jours_blancs)} jours blancs ${h.pct(P.W)} et les jours bleus ${h.pct(P.B)}. Un logement chauffé à l’électricité consomme donc environ un cinquième de son chauffage annuel pendant les jours où le kilowattheure coûte ${h.kwh(t.R.hp)} entre 6 h et 22 h. C’est le premier chiffre à connaître avant de choisir Tempo, et le levier le plus puissant pour réduire la facture : chaque degré baissé ces jours-là pèse lourd. Le mini-simulateur chiffre ce coût sur votre consommation de chauffage.`;
    },
    faqs: (h) => [
      { q: 'Quelle part de mon chauffage tombe un jour rouge ?', a: `En moyenne, ${h.pct(h.M.PROFIL_CHAUFFAGE.R)} sur les saisons mesurées, alors que les jours rouges ne représentent que ${h.pct(h.P.tempo_regles.jours_rouges / 365)} du calendrier. La part varie d’un hiver à l’autre selon la place des vagues de froid et le nombre de rouges placés. Votre logement s’écarte aussi de la moyenne nationale selon son isolation et vos réglages, d’où l’intérêt de relever vos propres index.` },
      { q: 'Une pompe à chaleur rend-elle Tempo plus intéressant que des radiateurs ?', a: 'Une pompe à chaleur consomme moins de kWh pour la même chaleur, donc les jours rouges pèsent moins en euros, mais ils pèsent la même part de sa consommation de chauffage. Son rendement baisse aussi par grand froid, précisément les jours rouges. Entrez sa consommation annuelle réelle dans le comparateur plutôt qu’une estimation : c’est la seule façon de trancher.' },
      { q: 'De combien baisser le chauffage un jour rouge ?', a: 'Un ou deux degrés en journée suffisent souvent, avec une remontée après 22 h. Le mini-simulateur montre l’effet d’une baisse exprimée en pourcentage des kWh de chauffage de ces journées. Ne descendez pas jusqu’à risquer l’humidité ou le gel, et gardez une température normale dans les pièces où vivent des personnes fragiles.' },
      { q: 'Peut-on chauffer la maison la nuit pour profiter des heures creuses rouges ?', a: `Oui, dans une certaine mesure : monter la température avant 6 h, au prix des heures creuses rouges de ${h.kwh(h.P.tempo.kwh.R.hc)}, permet d’entrer dans la journée avec une maison chaude. L’effet dépend de l’inertie du logement : une maison lourde et isolée garde sa chaleur des heures, un logement léger la perd vite. Un accumulateur ou un plancher chauffant en tirent davantage parti.` },
      { q: 'Le profil de RTE vaut-il pour un appartement chauffé à l’électricité ?', a: 'Il décrit la consommation de chauffage de tout le pays, maisons et appartements confondus. Un appartement entouré de logements chauffés perd moins de chaleur et réagit moins au froid qu’une maison isolée ; sa part de jours rouges peut donc être un peu plus faible. Si vous êtes déjà en Tempo, vos factures donnent votre propre répartition, plus fiable que la moyenne.' },
    ],
    body: (h) => {
      const t = h.P.tempo.kwh, E = extremes();
      return `
<h2>Ce que mesure le profil de chauffage</h2>
<p>RTE publie dans ${h.src('eco2mix', 'éCO2mix')} la consommation d’électricité de la France entière, par demi-heure, depuis plus de dix ans. Pour chaque saison Tempo, nous en avons retenu la moyenne de chaque jour, puis retiré le socle de l’été, la consommation médiane de mai à septembre, quand presque personne ne se chauffe. Ce qui dépasse le socle dépend du froid : c’est la part thermosensible, celle du chauffage. Il suffit ensuite d’additionner cette part sur les jours bleus, blancs et rouges de la saison.</p>
<p>Chaque journée est comptée comme un jour Tempo, de 6 h à 6 h le lendemain, à partir des relevés au quart d’heure. La mesure porte sur la consommation nationale, alors que la ${h.src('rteMethode', 'méthode de RTE')} choisit les rouges sur la consommation nette, déduction faite de l’éolien et du solaire : les deux montent ensemble avec le froid, ce qui rend la répartition fidèle à l’essentiel.</p>

<h2>Saison par saison</h2>
${h.table(['Saison', 'Jours rouges', 'Chauffage les jours rouges', 'Les jours blancs', 'Les jours bleus'], parSaison(h), 'Part de la consommation thermosensible nationale tombée chaque couleur, calculée depuis éCO2mix et le calendrier Tempo de RTE.', ['l', 'r', 'r', 'r', 'r'])}
<p>La part des rouges va de ${h.pct(E.min.r)} (${E.min.k}) à ${h.pct(E.max.r)} (${E.max.k}). Les écarts suivent la météo : un hiver aux froids concentrés sur quelques semaines charge davantage ses jours rouges, un hiver doux étale le chauffage sur des jours bleus. La saison 2019-2020, raccourcie à ${h.num(h.P.tempo_regles.saison_2019_2020.rouges)} rouges par décision de la CRE, se distingue logiquement par une part plus faible.</p>

<h2>Ce que coûte le chauffage électrique des jours rouges</h2>
<p>Appliquée à quelques consommations de chauffage annuelles, avec 30 % de la chaleur produite la nuit, la moyenne donne :</p>
${h.table(['Chauffage par an', 'Dont jours rouges', 'Coût Tempo des rouges', 'Avec 20 % de baisse', 'Mêmes kWh en Heures creuses'], scenarios(h), 'Prix TTC au 1er août 2026, hors abonnement.', ['l', 'r', 'r', 'r', 'r'])}
<p>L’écart entre la colonne Tempo et la colonne Heures creuses est le prix des jours rouges. Il doit être compensé par les jours bleus et blancs, moins chers en Tempo, pour que l’option reste rentable. Le guide ${h.a('tempo-rentable', 'Tempo est-il rentable')} calcule le point d’équilibre, et le ${h.a('comparateur', 'comparateur')} l’applique à votre consommation entière.</p>

<h2>Radiateurs, pompe à chaleur, accumulation</h2>
<p>Des radiateurs électriques transforment chaque kWh en chaleur, sans plus : leur consommation suit le froid de très près, et les jours rouges en concentrent une part proche de la moyenne nationale. Une pompe à chaleur produit plus de chaleur qu’elle ne consomme d’électricité, ce qui réduit tous les kWh, rouges compris ; mais son rendement baisse quand il fait très froid, donc ses jours rouges pèsent un peu plus que ses autres jours. Les systèmes qui stockent la chaleur, plancher chauffant, accumulateurs, ballon tampon, peuvent charger la nuit au prix des heures creuses et restituer la chaleur en journée : ce sont eux qui tirent le meilleur parti de Tempo.</p>

<h2>Programmer plutôt que subir</h2>
<p>Un thermostat programmable, ou un gestionnaire qui reçoit le signal Tempo du compteur Linky, applique la baisse sans y penser : consigne réduite de 6 h à 22 h les jours rouges, normale ensuite. Le jour Tempo commençant à 6 h, une remontée en température entre 4 h et 6 h se paie au prix des heures creuses de la veille. Pour la sécurité, gardez toujours un minimum raisonnable dans toutes les pièces, surtout s’il y vit des enfants en bas âge, des personnes âgées ou malades.</p>
<p>Les ${h.num(h.P.tempo_regles.jours_rouges)} jours rouges d’une saison sont publiés un par un, la veille, sur le ${h.src('rteCalendrier', 'calendrier de RTE')}. Pour savoir où en est la saison et combien il en reste, voyez l’${h.a('historique-tempo', 'historique des saisons')} et le guide ${h.a('jour-rouge-tempo', 'que faire un jour rouge')}.</p>
<h2>Ce que valent les jours blancs pour le chauffage</h2>
<p>On parle surtout des rouges, mais les ${h.num(h.P.tempo_regles.jours_blancs)} jours blancs portent davantage de chauffage : ${h.pct(h.M.PROFIL_CHAUFFAGE.W)} en moyenne, contre ${h.pct(h.M.PROFIL_CHAUFFAGE.R)} pour les rouges. Leur prix d’heures pleines, ${h.kwh(h.P.tempo.kwh.W.hp)}, reste toutefois proche de celui des autres options. Sur une année de ${h.num(6000)} kWh de chauffage, avec 30 % la nuit, la répartition donne :</p>
${h.table(['Couleur', 'Part du chauffage', 'kWh', 'Coût en Tempo', 'Mêmes kWh en Heures creuses'], (['B', 'W', 'R'] as const).map((c) => {
  const k = 6000 * h.M.PROFIL_CHAUFFAGE[c], p = h.P.tempo.kwh[c];
  return [c === 'B' ? 'Bleu' : c === 'W' ? 'Blanc' : 'Rouge', h.pct(h.M.PROFIL_CHAUFFAGE[c]), `${h.num(k)} kWh`, h.eur(k * (0.3 * p.hc + 0.7 * p.hp)), h.eur(k * (0.3 * h.P.hc.hc + 0.7 * h.P.hc.hp))];
}), '6 000 kWh de chauffage par an, profil national mesuré par RTE, prix TTC au 1er août 2026.', ['l', 'r', 'r', 'r', 'r'])}
<p>Les jours bleus font gagner de l’argent, les blancs un peu, les rouges en font perdre. C’est cette ligne rouge qu’il faut réduire pour que le chauffage électrique reste gagnant en Tempo.</p>

<h2>Relever sa propre répartition</h2>
<p>La moyenne nationale est un point de départ. Un foyer déjà en Tempo connaît sa vraie répartition : la facture ou l’espace client donnent les kWh de chaque couleur en heures pleines et en heures creuses. En divisant les kWh rouges par le total, vous obtenez votre propre part. Si elle dépasse nettement la moyenne, votre logement est plus sensible au froid que la moyenne, ce qui plaide pour l’isolation ou pour une baisse plus franche les jours rouges ; si elle est plus faible, Tempo vous est d’autant plus favorable. La page ${h.a('tarif-tempo', 'tarif Tempo')} recalcule une année entière à partir de ces relevés.</p>

<h2>Un mot sur le bois et le gaz d’appoint</h2>
<p>Certains foyers basculent sur un poêle ou une chaudière d’appoint les jours rouges. Le calcul de ce site ne porte que sur l’électricité : il ne connaît ni le prix de votre bois, ni celui de votre gaz. Un appoint bien installé peut réduire fortement les kWh rouges ; un appareil mobile à combustible dans une pièce fermée, en revanche, présente un vrai danger d’intoxication et n’a pas sa place dans un logement habité.</p>
<h2>Isoler avant de choisir</h2>
<p>Plus un logement perd sa chaleur vite, plus son chauffage suit le froid, et plus les jours rouges pèsent. L’isolation agit donc deux fois sur une facture Tempo : elle réduit les kilowattheures de chauffage sur toute l’année, et elle permet de baisser la consigne les jours rouges sans que la maison se refroidisse. Une maison bien isolée garde plusieurs heures la chaleur accumulée la nuit, alors qu’un logement mal isolé la perd en quelques dizaines de minutes.</p>
<p>Avant de juger Tempo sur une seule saison, regardez aussi ce qui a changé chez vous : un nouveau mode de chauffage, des travaux, une personne de plus à la maison en journée. Ce sont souvent eux, plus que le tarif, qui expliquent qu’une facture grimpe d’un hiver à l’autre.</p>`;
    },
  },
  en: {
    slug: 'electric-heating-tempo',
    nav: 'Electric heating and Tempo',
    card: 'The share of heating that lands on red days, measured over twelve winters.',
    title: 'Electric Heating and Tempo 2026: the Weight of Red Days',
    description: 'Electric heating on Tempo in 2026: the share of heating falling on red days according to RTE, the cost of a winter on radiators or a heat pump, set-backs.',
    h1: 'Electric heating and Tempo: how much red days weigh',
    intro: 'Tempo red days fall in hard frost, when heating runs hardest: here is the share of your heating they concentrate, as measured by RTE.',
    resume: (h) => {
      const P = h.M.PROFIL_CHAUFFAGE, Q = h.P.tempo_regles, t = h.P.tempo.kwh;
      return `Tempo red days do not fall at random: RTE places them when national net demand peaks, which means in hard frost, when radiators and heat pumps run hardest. To measure this effect we combined day-by-day national demand published by RTE with the colour of every day since 2014. Averaged over ${h.num(h.M.PROFIL_SAISONS)} seasons, the ${h.num(Q.jours_rouges)} red days concentrated ${h.pct(P.R)} of heating consumption, the ${h.num(Q.jours_blancs)} white days ${h.pct(P.W)} and blue days ${h.pct(P.B)}. An electrically heated home therefore uses about a fifth of its annual heating on the days when a kilowatt-hour costs ${h.kwh(t.R.hp)} between 06:00 and 22:00. That is the first figure to know before choosing Tempo, and the most powerful lever to cut the bill: every degree turned down on those days counts. The mini-calculator puts a cost on it from your own heating consumption.`;
    },
    faqs: (h) => [
      { q: 'What share of my heating falls on red days?', a: `On average ${h.pct(h.M.PROFIL_CHAUFFAGE.R)} over the seasons measured, while red days are only ${h.pct(h.P.tempo_regles.jours_rouges / 365)} of the calendar. The share varies from one winter to the next with the timing of cold spells and the number of red days placed. Your home also strays from the national average depending on insulation and settings, so it pays to read your own meter figures.` },
      { q: 'Does a heat pump make Tempo better value than radiators?', a: 'A heat pump uses fewer kWh for the same heat, so red days weigh less in euros, but they take the same share of its heating consumption. Its efficiency also drops in hard frost, which is precisely when red days fall. Enter its real annual consumption in the comparison tool rather than an estimate: that is the only way to settle it.' },
      { q: 'How far should I turn the heating down on a red day?', a: 'One or two degrees during the day is often enough, raising it again after 22:00. The mini-calculator shows the effect of a cut expressed as a percentage of those days’ heating kWh. Do not go so low that damp or frost become a risk, and keep a normal temperature in rooms where vulnerable people live.' },
      { q: 'Can I heat the house at night to use red off-peak hours?', a: `Up to a point: raising the temperature before 06:00, at the red off-peak price of ${h.kwh(h.P.tempo.kwh.R.hc)}, lets you start the day with a warm house. How well it works depends on the home’s thermal mass: a heavy, insulated house holds heat for hours, a light one loses it fast. Storage heaters or underfloor heating make more of it.` },
      { q: 'Does RTE’s profile apply to an electrically heated flat?', a: 'It describes heating demand across the whole country, houses and flats together. A flat surrounded by heated homes loses less heat and reacts less to the cold than a detached house, so its red-day share may be a little lower. If you are already on Tempo, your bills give your own split, which is more reliable than the average.' },
    ],
    body: (h) => {
      const E = extremes();
      return `
<h2>What the heating profile measures</h2>
<p>RTE publishes in ${h.src('eco2mix', 'éCO2mix')} the electricity consumption of the whole of France, half-hour by half-hour, going back more than ten years. For each Tempo season we took each day’s average, then removed the summer baseline, the median consumption from May to September when almost nobody heats. Whatever exceeds the baseline depends on the cold: that is the temperature-sensitive part, the heating. It then only remains to add that part up over the season’s blue, white and red days.</p>
<p>Each day is counted as a Tempo day, 06:00 to 06:00 the next morning, from the quarter-hour readings. The measure uses national demand, whereas ${h.src('rteMethode', 'RTE’s method')} picks red days on net demand, after wind and solar output: both climb together with the cold, which keeps the split true to the essentials.</p>

<h2>Season by season</h2>
${h.table(['Season', 'Red days', 'Heating on red days', 'On white days', 'On blue days'], parSaison(h), 'Share of national temperature-sensitive demand falling on each colour, worked out from éCO2mix and RTE’s Tempo calendar.', ['l', 'r', 'r', 'r', 'r'])}
<p>The red-day share ranges from ${h.pct(E.min.r)} (${E.min.k}) to ${h.pct(E.max.r)} (${E.max.k}). The differences follow the weather: a winter whose cold is packed into a few weeks loads its red days more heavily, a mild winter spreads heating over blue days. The 2019-2020 season, cut to ${h.num(h.P.tempo_regles.saison_2019_2020.rouges)} red days by the regulator, naturally shows a lower share.</p>

<h2>What electric heating costs on red days</h2>
<p>Applied to a few annual heating consumptions, with 30% of the heat produced at night, the average gives:</p>
${h.table(['Heating a year', 'Of which red days', 'Tempo cost of red days', 'With a 20% cut', 'Same kWh on Off-peak'], scenarios(h), 'Prices including tax from 1 August 2026, standing charge excluded.', ['l', 'r', 'r', 'r', 'r'])}
<p>The gap between the Tempo column and the Off-peak column is the price of red days. It has to be made up by blue and white days, cheaper on Tempo, for the option to pay. The guide ${h.a('tempo-rentable', 'is Tempo worth it')} works out the break-even point, and the ${h.a('comparateur', 'comparison tool')} applies it to your whole consumption.</p>

<h2>Radiators, heat pumps, storage</h2>
<p>Electric radiators turn each kWh into heat and nothing more: their consumption tracks the cold closely, and red days take a share close to the national average. A heat pump produces more heat than the electricity it uses, which cuts every kWh, red ones included; but its efficiency falls in severe cold, so its red days weigh a little more than its other days. Systems that store heat, underfloor heating, storage heaters, buffer tanks, can charge at night at off-peak prices and release the heat during the day: they get the most out of Tempo.</p>

<h2>Schedule rather than suffer</h2>
<p>A programmable thermostat, or a controller that receives the Tempo signal from the Linky meter, applies the set-back without you thinking about it: lower setting from 06:00 to 22:00 on red days, normal afterwards. Since the Tempo day starts at 06:00, warming the house between 04:00 and 06:00 is paid at the previous day’s off-peak price. For safety, always keep a sensible minimum in every room, especially where young children, elderly or ill people live.</p>
<p>A season’s ${h.num(h.P.tempo_regles.jours_rouges)} red days are published one by one, the day before, on ${h.src('rteCalendrier', 'RTE’s calendar')}. To see where the season stands and how many are left, see the ${h.a('historique-tempo', 'season history')} and the guide on ${h.a('jour-rouge-tempo', 'what to do on a red day')}.</p>
<h2>What white days mean for heating</h2>
<p>Red days get the attention, but the ${h.num(h.P.tempo_regles.jours_blancs)} white days carry more heating: ${h.pct(h.M.PROFIL_CHAUFFAGE.W)} on average, against ${h.pct(h.M.PROFIL_CHAUFFAGE.R)} for red days. Their peak price, ${h.kwh(h.P.tempo.kwh.W.hp)}, stays close to the other options, though. Over a year of ${h.num(6000)} kWh of heating, with 30% at night, the split gives:</p>
${h.table(['Colour', 'Heating share', 'kWh', 'Cost on Tempo', 'Same kWh on Off-peak'], (['B', 'W', 'R'] as const).map((c) => {
  const k = 6000 * h.M.PROFIL_CHAUFFAGE[c], p = h.P.tempo.kwh[c];
  return [c === 'B' ? 'Blue' : c === 'W' ? 'White' : 'Red', h.pct(h.M.PROFIL_CHAUFFAGE[c]), `${h.num(k)} kWh`, h.eur(k * (0.3 * p.hc + 0.7 * p.hp)), h.eur(k * (0.3 * h.P.hc.hc + 0.7 * h.P.hc.hp))];
}), '6,000 kWh of heating a year, national profile measured by RTE, prices including tax from 1 August 2026.', ['l', 'r', 'r', 'r', 'r'])}
<p>Blue days save money, white days a little, red days lose it. That red line is the one to shrink if electric heating is to stay a winner on Tempo.</p>

<h2>Reading your own split</h2>
<p>The national average is a starting point. A household already on Tempo knows its real split: the bill or online account gives the kWh for each colour at peak and off-peak. Dividing red kWh by the total gives your own share. If it is well above the average, your home is more sensitive to cold than most, which argues for insulation or a firmer set-back on red days; if it is lower, Tempo suits you all the better. The ${h.a('tarif-tempo', 'Tempo prices')} page recalculates a whole year from those readings.</p>

<h2>A word on wood and gas back-up</h2>
<p>Some households switch to a wood stove or a back-up boiler on red days. This site’s calculation covers electricity only: it knows neither the price of your wood nor that of your gas. A properly installed back-up can sharply cut red kWh; a portable fuel-burning heater in a closed room, on the other hand, carries a real risk of poisoning and has no place in an occupied home.</p>
<h2>Insulate before you choose</h2>
<p>The faster a home loses heat, the more closely its heating follows the cold, and the more red days weigh. Insulation therefore works twice on a Tempo bill: it cuts heating kilowatt-hours all year round, and it lets you lower the setting on red days without the house cooling down. A well-insulated house holds the heat stored overnight for several hours, while a poorly insulated one loses it in tens of minutes.</p>
<p>Before judging Tempo on a single season, look at what has changed at home too: a new heating system, building work, one more person at home during the day. They often explain a bill rising from one winter to the next better than the tariff does.</p>
<p>English speakers settling in France will meet the energy performance certificate, the DPE, when renting or buying: a home rated poorly for energy is one where heating, and therefore red days, will weigh more.</p>
<p>For an English speaker used to gas central heating, French all-electric homes can come as a surprise: radiators in every room, a water heater in a cupboard, and a bill that climbs steeply in January. Tempo turns that seasonality into a choice: pay a premium on a few cold days, or adjust and pay less across the year.</p>`;
    },
  },
});

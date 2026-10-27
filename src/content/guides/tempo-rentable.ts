import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Part de chauffage maximale (pas de 1 %) pour laquelle Tempo bat la meilleure des deux autres options. */
const seuil = (h: Helpers, kwh: number, kva: number, partHC: number, effort: number) => {
  let s = -1;
  for (let i = 0; i <= 100; i++) {
    const e = { kwh, kva, chauffage: i / 100, partHC };
    const autre = Math.min(h.M.coutOption('base', e).total, h.M.coutOption('hc', e).total);
    if (h.M.coutOption('tempo', { ...e, effortRouge: effort }).total < autre) s = i / 100; else break;
  }
  return s;
};
const PROFILS: Array<[number, number, number]> = [[4000, 6, 0.3], [8000, 9, 0.35], [8000, 9, 0.5], [14000, 12, 0.35], [14000, 12, 0.5]];
const fmt = (h: Helpers, s: number, fr: boolean) => (s < 0 ? (fr ? 'jamais' : 'never') : s >= 1 ? (fr ? 'toujours' : 'always') : `${h.pct(s, 0)}`);
const tableau = (h: Helpers, fr: boolean) => PROFILS.map(([k, v, n]) => [`${h.num(k)} kWh, ${v} kVA`, h.pct(n, 0), fmt(h, seuil(h, k, v, n, 0), fr), fmt(h, seuil(h, k, v, n, 0.25), fr), fmt(h, seuil(h, k, v, n, 0.5), fr)]);

export default defineGuide({
  id: 'tempo-rentable',
  group: 'choisir',
  order: 14,
  mini: 'seuilTempo',
  related: ['comparateur', 'chauffage-electrique-tempo', 'tarif-tempo', 'jour-rouge-tempo', 'prix-kwh', 'avis-tempo-edf'],
  sources: ['grilleEdf', 'creTrve2026', 'eco2mix'],
  fr: {
    slug: 'tempo-rentable',
    nav: 'Tempo est-il rentable ?',
    card: 'Le seuil de chauffage au-delà duquel Tempo cesse d’être la moins chère.',
    title: 'Tempo rentable ou non en 2026 : le seuil de votre foyer',
    description: 'Tempo rentable en 2026 ? Le seuil de chauffage au-delà duquel l’option coûte plus que les Heures creuses, selon votre consommation, vos nuits et vos efforts.',
    h1: 'Tempo est-il rentable pour vous ? Le calcul du seuil',
    intro: 'Tempo n’est ni toujours gagnant ni toujours perdant : il existe un seuil, propre à chaque foyer, au-delà duquel il coûte plus cher.',
    resume: (h) => {
      const s0 = seuil(h, 8000, 9, 0.35, 0), s5 = seuil(h, 8000, 9, 0.35, 0.5);
      return `Tempo est rentable tant que ce que vous gagnez sur ses ${h.num(h.P.tempo_regles.jours_bleus_annee_365 + h.P.tempo_regles.jours_blancs)} jours bleus et blancs dépasse ce que vous perdez sur ses ${h.num(h.P.tempo_regles.jours_rouges)} jours rouges. Le gain vient de prix plus bas que la Base et les Heures creuses presque toute l’année ; la perte vient des heures pleines rouges, facturées ${h.kwh(h.P.tempo.kwh.R.hp)} au tarif réglementé du 1er août 2026. Trois leviers déplacent l’équilibre : la part de votre consommation qui sert au chauffage, puisque le chauffage se concentre sur les jours rouges ; la part que vous consommez la nuit ; et l’effort consenti les jours rouges. Pour une maison de ${h.num(8000)} kWh en 9 kVA avec 35 % de consommation nocturne, notre moteur trouve que Tempo, sans aucun effort, reste devant tant que le chauffage ne dépasse pas ${fmt(h, s0, true)} de la consommation ; en reportant la moitié des heures pleines rouges, le seuil monte à ${fmt(h, s5, true)}. Le mini-simulateur fait ce calcul pour votre propre foyer.`;
    },
    faqs: (h) => [
      { q: 'À partir de quand faut-il quitter Tempo ?', a: 'Quand votre facture Tempo d’une année, refaite avec les prix des autres options, montre qu’une autre aurait coûté moins, et que vous ne voulez pas changer vos habitudes les jours rouges. Reprenez les six index de vos factures, entrez-les sur la page tarif Tempo, puis comparez. Un hiver exceptionnellement froid peut fausser une année : regardez plutôt la tendance sur deux hivers.' },
      { q: 'Pourquoi la part de chauffage décide-t-elle de tout ?', a: `Parce que le chauffage se concentre sur les jours froids, donc sur les jours rouges : selon les données de RTE, ${h.pct(h.M.PROFIL_CHAUFFAGE.R)} de la consommation de chauffage nationale tombe ces jours-là, contre ${h.pct(h.P.tempo_regles.jours_rouges / 365)} des jours. Le reste de la consommation, lui, se répartit à plat. Plus le chauffage pèse, plus la facture dépend des jours rouges.` },
      { q: 'Consommer davantage la nuit rend-il Tempo plus rentable ?', a: 'Oui, et doublement : les heures creuses Tempo des jours bleus et blancs sont moins chères que celles de l’option Heures creuses, et un kWh nocturne échappe au prix rouge en heures pleines. Passer de 35 % à 50 % de consommation la nuit, avec un ballon et des appareils programmés, relève nettement le seuil, comme le montre le tableau de cette page.' },
      { q: 'Le seuil change-t-il avec la puissance du compteur ?', a: 'Un peu. L’abonnement Tempo est légèrement moins cher que celui des autres options à puissance égale, ce qui joue davantage pour les petites consommations. Pour une grosse consommation, ce sont surtout les prix du kWh qui comptent. Changez la puissance dans le mini-simulateur pour voir l’effet sur votre propre seuil.' },
      { q: 'Un hiver très froid peut-il rendre Tempo perdant une année ?', a: 'Oui. Le nombre de jours rouges est fixe, mais leur poids dépend du froid : un hiver rigoureux concentre davantage de chauffage sur ces journées, et la facture s’en ressent. Un foyer proche du seuil peut alors passer au-dessus une année et revenir en dessous l’année suivante. C’est pourquoi le calcul de cette page repose sur la moyenne de plusieurs hivers mesurés par RTE.' },
    ],
    body: (h) => {
      const t = h.P.tempo.kwh, ab = (o: 'base' | 'hc' | 'tempo') => h.M.aboAnnuel(o, 9);
      return `
<h2>Le principe de l’équilibre</h2>
<p>Tempo ne coûte pas plus cher « en moyenne » : il coûte moins cher la plupart du temps et beaucoup plus cher quelques jours. Un kWh d’heures pleines bleues vaut ${h.kwh(t.B.hp)}, contre ${h.kwh(h.P.hc.hp)} en heures pleines de l’option Heures creuses et ${h.kwh(h.P.base.kwh['9'])} en Base au-delà de 6 kVA. Un kWh d’heures pleines rouges vaut ${h.kwh(t.R.hp)}. L’abonnement est à peu près le même : ${h.eur(ab('tempo'))} par an en Tempo et ${h.eur(ab('hc'))} en Heures creuses à 9 kVA, selon la ${h.src('grilleEdf', 'grille du 1er août 2026')}. La question se résume donc à une balance entre beaucoup de petits gains et quelques grosses pertes.</p>
<p>Ce qui fait pencher la balance, c’est la part de votre consommation qui tombe en heures pleines un jour rouge. Elle dépend surtout du chauffage, puisque les jours rouges sont les plus froids. Nos calculs l’estiment à partir de la consommation nationale mesurée par RTE dans ${h.src('eco2mix', 'éCO2mix')} : le chauffage d’un foyer suit à peu près la courbe de froid du pays.</p>

<h2>Le seuil pour quelques foyers types</h2>
<p>Le tableau donne, pour chaque profil, la part maximale du chauffage dans la consommation annuelle pour laquelle Tempo reste l’option la moins chère, selon l’effort consenti les jours rouges.</p>
${h.table(['Foyer', 'Part la nuit', 'Sans effort', 'Un quart reporté', 'Moitié reportée'], tableau(h, true), 'Seuil de chauffage calculé par le moteur du site par pas de 1 %, tarif réglementé du 1er août 2026. « Toujours » : Tempo reste devant même avec tout le chauffage électrique.', ['l', 'r', 'r', 'r', 'r'])}
<p>Trois enseignements ressortent. D’abord, sans chauffage électrique, Tempo est presque toujours rentable : les jours rouges ne pèsent alors que leur part du calendrier. Ensuite, la consommation nocturne relève nettement le seuil. Enfin, l’effort les jours rouges est le levier le plus puissant : reporter la moitié des heures pleines rouges vaut souvent davantage que tout le reste.</p>

<h2>Comment mesurer votre propre part de chauffage</h2>
<p>Prenez votre consommation annuelle, puis celle d’un mois d’été sans chauffage ni climatisation. Douze fois le mois d’été donne votre socle annuel : réfrigérateur, cuisson, eau chaude, éclairage, appareils. Le reste est du chauffage. Avec ${h.num(8000)} kWh par an et ${h.num(350)} kWh en août, le chauffage pèse ${h.pct(h.M.partChauffage(8000, 350), 0)} de la consommation. C’est cette méthode qu’applique le ${h.a('comparateur', 'comparateur')}. Si vous chauffez l’eau sanitaire avec une pompe à chaleur ou si vous partez en vacances l’été, prenez plutôt un mois de juin ou de septembre.</p>

<h2>Quand quitter Tempo, quand y rester</h2>
<p>Un foyer déjà en Tempo a mieux qu’une estimation : ses factures détaillent les kWh consommés en heures pleines et creuses de chaque couleur. Entrez-les sur la page ${h.a('tarif-tempo', 'tarif Tempo')} : elle recalcule l’année et la compare à la Base et aux Heures creuses, sur les mêmes kWh. Si l’écart est défavorable deux hivers de suite et que vous ne pouvez pas réduire le chauffage les jours rouges, une autre option vous conviendra mieux.</p>
<p>À l’inverse, un foyer qui découvre qu’il est juste au-dessus du seuil peut souvent y revenir avec peu : programmer le ballon la nuit, différer lave-linge et sèche-linge, baisser d’un degré les jours rouges. Le guide ${h.a('jour-rouge-tempo', 'que faire un jour rouge')} détaille ces gestes, et celui sur le ${h.a('chauffage-electrique-tempo', 'chauffage électrique')} montre, hiver par hiver, ce que pèsent les jours rouges.</p>

<h2>Ce que ce calcul ne prend pas en compte</h2>
<p>La grille actuelle découle de la ${h.src('creTrve2026', 'délibération de la CRE de juillet 2026')} ; un prochain mouvement est attendu au 1er février 2027. Il peut déplacer le seuil : le calcul sera refait dès la publication de la nouvelle grille. Le calcul suppose aussi un hiver moyen ; un hiver très froid alourdit les jours rouges, un hiver doux les allège.</p>
<h2>Le poids de chaque levier, chiffré</h2>
<p>Pour la maison de ${h.num(8000)} kWh en 9 kVA, avec 45 % de chauffage, voici le coût annuel de Tempo quand on actionne un levier à la fois, face aux Heures creuses à la même consommation :</p>
${h.table(['Réglage', 'Tempo', 'Heures creuses', 'Écart'], ([
  ['Point de départ : 35 % la nuit, aucun effort', 0.35, 0],
  ['50 % de la consommation la nuit', 0.5, 0],
  ['Un quart des heures pleines rouges reporté', 0.35, 0.25],
  ['Moitié des heures pleines rouges reportée', 0.35, 0.5],
] as Array<[string, number, number]>).map(([l, n, e]) => {
  const x = { kwh: 8000, kva: 9, chauffage: 0.45, partHC: n }, t = h.M.coutOption('tempo', { ...x, effortRouge: e }).total, c = h.M.coutOption('hc', x).total;
  return [l, h.eur(t), h.eur(c), `${t < c ? '−' : '+'}${h.eur(Math.abs(t - c))}`];
}), 'Coût annuel TTC, abonnement compris. Écart négatif : Tempo moins cher.', ['l', 'r', 'r', 'r'])}
<p>La dernière ligne résume l’enjeu : à consommation égale, ce sont les heures pleines des jours rouges qui décident. Un foyer prêt à les réduire de moitié peut garder Tempo même avec un chauffage important ; un foyer qui ne peut rien décaler a intérêt à rester sous le seuil du tableau précédent.</p>

<h2>Pourquoi le calcul part d’un hiver moyen</h2>
<p>La part du chauffage tombant un jour rouge varie d’une saison à l’autre, de plusieurs points selon la place des vagues de froid. Le seuil calculé ici repose sur la moyenne de ${h.num(h.M.PROFIL_SAISONS)} saisons, ce qui gomme les hivers exceptionnels. C’est la bonne base pour une décision qui vaut plusieurs années. Pour juger un hiver particulier, l’${h.a('historique-tempo', 'historique des saisons')} donne la date et le nombre de jours rouges de chacun.</p>
<p>Il faut aussi garder en tête que le seuil est une frontière, pas un précipice : à quelques points au-dessus, Tempo coûte à peine plus cher que les Heures creuses, et l’écart se rattrape avec un hiver doux ou quelques gestes. C’est loin au-dessus du seuil, avec un chauffage lourd et aucune possibilité de baisse, que Tempo devient un mauvais choix.</p>
<h2>Un exemple pas à pas</h2>
<p>Prenez un foyer qui consomme ${h.num(10000)} kWh par an et ${h.num(400)} kWh en juillet. Son socle annuel vaut douze fois juillet, soit ${h.num(4800)} kWh, et son chauffage le reste, soit ${h.pct(h.M.partChauffage(10000, 400), 0)} de la consommation. En 9 kVA, avec 35 % de consommation la nuit et sans effort particulier, il se compare au tableau ci-dessus : si sa part de chauffage dépasse le seuil de la ligne correspondante, les Heures creuses lui coûtent moins cher ; sinon, Tempo l’emporte. Le mini-simulateur en haut de page donne ce seuil exact pour sa consommation et sa puissance.</p>
<p>Le même foyer peut ensuite se demander ce qu’il est prêt à changer. Reporter un quart des heures pleines rouges, c’est surtout programmer le ballon, décaler les machines et baisser un peu le chauffage : des gestes que beaucoup de foyers font déjà sans y penser. Le comparateur montre aussitôt l’effet de ce réglage sur la facture de l’année.</p>`;
    },
  },
  en: {
    slug: 'is-tempo-worth-it',
    nav: 'Is Tempo worth it?',
    card: 'The heating share beyond which Tempo stops being the cheapest option.',
    title: 'Tempo Worth It or Not in 2026: Your Household’s Threshold',
    description: 'Is Tempo worth it in 2026? The heating share beyond which the option costs more than Off-peak, depending on your consumption, night-time use and red-day effort.',
    h1: 'Is Tempo worth it for you? Working out the threshold',
    intro: 'Tempo neither always wins nor always loses: every household has a threshold beyond which it costs more.',
    resume: (h) => {
      const s0 = seuil(h, 8000, 9, 0.35, 0), s5 = seuil(h, 8000, 9, 0.35, 0.5);
      return `Tempo pays off as long as what you save on its ${h.num(h.P.tempo_regles.jours_bleus_annee_365 + h.P.tempo_regles.jours_blancs)} blue and white days exceeds what you lose on its ${h.num(h.P.tempo_regles.jours_rouges)} red days. The saving comes from prices below Base and Off-peak for most of the year; the loss comes from red peak hours, billed at ${h.kwh(h.P.tempo.kwh.R.hp)} on the regulated tariff of 1 August 2026. Three levers shift the balance: the share of your consumption that goes on heating, since heating concentrates on red days; the share you use at night; and the effort you make on red days. For an 8,000 kWh house on 9 kVA with 35% of use at night, our engine finds that Tempo with no effort at all stays ahead as long as heating does not exceed ${fmt(h, s0, false)} of consumption; shifting half of red-day peak use lifts the threshold to ${fmt(h, s5, false)}. The mini-calculator runs the same calculation for your own household.`;
    },
    faqs: (h) => [
      { q: 'When should I leave Tempo?', a: 'When a year of your Tempo bills, redone at the other options’ prices, shows another option would have cost less, and you do not want to change your habits on red days. Take the six meter readings from your bills, enter them on the Tempo prices page, then compare. An exceptionally cold winter can skew one year: look at the trend over two winters instead.' },
      { q: 'Why does the heating share decide everything?', a: `Because heating concentrates on cold days, so on red days: according to RTE data, ${h.pct(h.M.PROFIL_CHAUFFAGE.R)} of national heating consumption falls on those days, against ${h.pct(h.P.tempo_regles.jours_rouges / 365)} of the days. The rest of your use spreads evenly. The more heating weighs, the more the bill depends on red days.` },
      { q: 'Does using more at night make Tempo better value?', a: 'Yes, twice over: Tempo off-peak hours on blue and white days are cheaper than those of the Off-peak option, and a night-time kWh escapes the red peak price. Going from 35% to 50% of use at night, with a scheduled water heater and appliances, clearly raises the threshold, as the table on this page shows.' },
      { q: 'Does the threshold change with meter power?', a: 'Slightly. The Tempo standing charge is a little cheaper than the other options at the same power, which matters more for small consumers. For high consumption it is mostly the kWh prices that count. Change the power in the mini-calculator to see the effect on your own threshold.' },
      { q: 'Can a very cold winter make Tempo lose for a year?', a: 'Yes. The number of red days is fixed, but their weight depends on the cold: a harsh winter packs more heating into those days, and the bill shows it. A household near the threshold may cross above it one year and fall back below the next. That is why this page’s calculation rests on the average of several winters measured by RTE.' },
    ],
    body: (h) => {
      const t = h.P.tempo.kwh, ab = (o: 'base' | 'hc' | 'tempo') => h.M.aboAnnuel(o, 9);
      return `
<h2>The principle of the balance</h2>
<p>Tempo is not dearer “on average”: it is cheaper most of the time and much dearer on a few days. A blue peak kWh costs ${h.kwh(t.B.hp)}, against ${h.kwh(h.P.hc.hp)} at peak on the Off-peak option and ${h.kwh(h.P.base.kwh['9'])} on Base above 6 kVA. A red peak kWh costs ${h.kwh(t.R.hp)}. The standing charge is about the same: ${h.eur(ab('tempo'))} a year on Tempo and ${h.eur(ab('hc'))} on Off-peak at 9 kVA, according to the ${h.src('grilleEdf', 'grid of 1 August 2026')}. The question therefore boils down to a balance between many small savings and a few large losses.</p>
<p>What tips the balance is the share of your consumption that falls at peak time on a red day. It depends above all on heating, since red days are the coldest. Our calculations estimate it from national demand measured by RTE in ${h.src('eco2mix', 'éCO2mix')}: a household’s heating roughly follows the country’s cold-weather curve.</p>

<h2>The threshold for some typical households</h2>
<p>For each profile, the table gives the highest heating share of annual consumption at which Tempo remains the cheapest option, depending on the effort made on red days.</p>
${h.table(['Household', 'Night share', 'No effort', 'A quarter shifted', 'Half shifted'], tableau(h, false), 'Heating threshold worked out by the site’s engine in 1% steps, regulated tariff of 1 August 2026. “Always”: Tempo stays ahead even with all heating electric.', ['l', 'r', 'r', 'r', 'r'])}
<p>Three lessons stand out. First, without electric heating Tempo almost always pays: red days then only weigh their share of the calendar. Second, night-time use clearly raises the threshold. Third, red-day effort is the strongest lever: shifting half of red peak use is often worth more than everything else together.</p>

<h2>How to measure your own heating share</h2>
<p>Take your annual consumption, then that of one summer month with no heating or air conditioning. Twelve times the summer month gives your annual baseline: fridge, cooking, hot water, lighting, appliances. The rest is heating. With ${h.num(8000)} kWh a year and ${h.num(350)} kWh in August, heating makes up ${h.pct(h.M.partChauffage(8000, 350), 0)} of consumption. That is the method the ${h.a('comparateur', 'comparison tool')} applies. If a heat pump heats your hot water or you go away in summer, use June or September instead.</p>

<h2>When to leave Tempo, when to stay</h2>
<p>A household already on Tempo has better than an estimate: its bills list the kWh used at peak and off-peak for each colour. Enter them on the ${h.a('tarif-tempo', 'Tempo prices')} page: it recalculates the year and compares it with Base and Off-peak on the same kWh. If the gap goes the wrong way two winters running and you cannot cut heating on red days, another option will suit you better.</p>
<p>Conversely, a household that finds itself just above the threshold can often get back under it with little: water heater at night, washing and drying put off, one degree less on red days. The guide on ${h.a('jour-rouge-tempo', 'what to do on a red day')} goes through those habits, and the one on ${h.a('chauffage-electrique-tempo', 'electric heating')} shows, winter by winter, how much red days weigh.</p>

<h2>What this calculation leaves out</h2>
<p>The current grid stems from the ${h.src('creTrve2026', 'regulator’s July 2026 deliberation')}; the next movement is expected on 1 February 2027. It may shift the threshold: the calculation will be redone as soon as the new grid is published. The calculation also assumes an average winter; a very cold winter makes red days heavier, a mild one lighter.</p>
<h2>Each lever, in figures</h2>
<p>For the 8,000 kWh house on 9 kVA with 45% heating, here is Tempo’s annual cost when one lever is pulled at a time, against Off-peak on the same consumption:</p>
${h.table(['Setting', 'Tempo', 'Off-peak', 'Gap'], ([
  ['Starting point: 35% at night, no effort', 0.35, 0],
  ['50% of use at night', 0.5, 0],
  ['A quarter of red peak use shifted', 0.35, 0.25],
  ['Half of red peak use shifted', 0.35, 0.5],
] as Array<[string, number, number]>).map(([l, n, e]) => {
  const x = { kwh: 8000, kva: 9, chauffage: 0.45, partHC: n }, t = h.M.coutOption('tempo', { ...x, effortRouge: e }).total, c = h.M.coutOption('hc', x).total;
  return [l, h.eur(t), h.eur(c), `${t < c ? '−' : '+'}${h.eur(Math.abs(t - c))}`];
}), 'Annual cost including tax and standing charge. A negative gap means Tempo is cheaper.', ['l', 'r', 'r', 'r'])}
<p>The last row sums up what is at stake: for the same consumption, red-day peak hours decide. A household ready to halve them can keep Tempo even with substantial heating; a household that can shift nothing is better off staying below the threshold in the previous table.</p>

<h2>Why the calculation starts from an average winter</h2>
<p>The share of heating falling on red days varies from season to season, by several points depending on when the cold spells come. The threshold here rests on the average of ${h.num(h.M.PROFIL_SAISONS)} seasons, which smooths out exceptional winters. That is the right basis for a decision meant to last several years. To judge a particular winter, the ${h.a('historique-tempo', 'season history')} gives the dates and number of red days of each one.</p>
<p>Remember too that the threshold is a border, not a cliff: a few points above it, Tempo costs barely more than Off-peak, and the gap is made up by a mild winter or a few habits. It is far above the threshold, with heavy heating and no way to turn it down, that Tempo becomes a poor choice.</p>
<h2>A worked example</h2>
<p>Take a household using ${h.num(10000)} kWh a year and ${h.num(400)} kWh in July. Its annual baseline is twelve times July, ${h.num(4800)} kWh, and heating is the rest, ${h.pct(h.M.partChauffage(10000, 400), 0)} of consumption. On 9 kVA, with 35% of use at night and no particular effort, it compares with the table above: if its heating share is above the threshold on the matching row, Off-peak costs it less; otherwise Tempo wins. The mini-calculator at the top of the page gives the exact threshold for its consumption and power.</p>
<p>The same household can then ask what it is willing to change. Shifting a quarter of red peak use mostly means scheduling the water heater, moving the appliances and turning the heating down a little: habits many households already have without thinking. The comparison tool shows the effect of that setting on the year’s bill at once.</p>
<p>Newcomers to France often inherit the previous occupant’s contract and option when they move in. Moving home is a natural moment to run this check before the first winter rather than after the first red-day bill.</p>
<p>Finally, the threshold is a tool for the decision, not a verdict. A household slightly above it may still prefer Tempo for its cheap nights and its blue weekends, accepting a few dearer days; another slightly below it may prefer the simplicity of a single price. The figures on this page say what each choice costs, so that the choice is made knowingly rather than on the strength of a sales call.</p>`;
    },
  },
});

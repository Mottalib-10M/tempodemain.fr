import { defineGuide, type Helpers } from '../../lib/guide-types';
import { coutRecharge } from '../../lib/minis/recharge';

const KM = [8000, 12000, 20000];
const CONSO = 17;
const tableau = (h: Helpers, fr: boolean) => KM.map((km) => {
  const r = coutRecharge(km, CONSO, 0.9);
  return [`${h.num(km)} km`, `${h.num(r.kwh)} kWh`, h.eur(r.tempo), h.eur(r.hc), h.eur(r.base), h.eur(r.base - r.tempo)];
});
/** Énergie qu'une puissance de charge délivre pendant les huit heures creuses Tempo (22 h - 6 h). */
const PUISS = [3.7, 7.4];
const nuit = (h: Helpers) => PUISS.map((p) => { const kwh = p * 8; return [`${h.num(p, 1)} kW`, `${h.num(kwh)} kWh`, `${h.num(kwh / CONSO * 100)} km`]; });

export default defineGuide({
  id: 'recharge-voiture-tempo',
  group: 'choisir',
  order: 12,
  mini: 'recharge',
  related: ['puissance-compteur', 'comparateur', 'jour-rouge-tempo', 'heures-creuses', 'tempo-rentable'],
  sources: ['grilleEdf', 'creTempo2014', 'creHc2026'],
  fr: {
    slug: 'recharge-voiture-electrique-tempo',
    nav: 'Recharger sa voiture en Tempo',
    card: 'Le coût d’une année de recharge en Tempo, en Heures creuses et en Base.',
    title: 'Recharge voiture électrique et Tempo 2026 : coût par an',
    description: 'Recharge voiture électrique 2026 : coût annuel en Tempo, en Heures creuses et en Base selon vos kilomètres, charge la nuit de 22 h à 6 h, jours rouges évités.',
    h1: 'Recharger une voiture électrique avec Tempo',
    intro: 'Une voiture qui charge la nuit est l’usage idéal pour Tempo : voici ce que coûte une année de recharge dans chaque option.',
    resume: (h) => {
      const t = h.P.tempo.kwh, r = coutRecharge(12000, CONSO, 0.9);
      return `Une voiture électrique se recharge surtout la nuit, quand elle est garée : c’est exactement la plage des heures creuses Tempo, de 22 h à 6 h, où le kilowattheure coûte ${h.kwh(t.B.hc)} un jour bleu, ${h.kwh(t.W.hc)} un jour blanc et ${h.kwh(t.R.hc)} un jour rouge au tarif réglementé du 1er août 2026. En option Heures creuses, le même kWh nocturne vaut ${h.kwh(h.P.hc.hc)}, et ${h.kwh(h.P.base.kwh['6'])} en Base à 6 kVA. Pour ${h.num(12000)} kilomètres par an avec une consommation de ${h.num(CONSO)} kWh aux 100 km, soit ${h.num(r.kwh)} kWh rechargés, et 90 % de la recharge la nuit, l’année coûte environ ${h.eur(r.tempo)} en Tempo, ${h.eur(r.hc)} en Heures creuses et ${h.eur(r.base)} en Base, hors abonnement. La seule règle à tenir : ne jamais charger entre 6 h et 22 h un jour rouge, où le kWh monte à ${h.kwh(t.R.hp)}. Le mini-simulateur prend vos kilomètres et votre voiture.`;
    },
    faqs: (h) => [
      { q: 'Faut-il augmenter la puissance du compteur pour une borne ?', a: 'Pas toujours. Une borne de 7,4 kW appelle à elle seule plus que la moitié d’un compteur de 12 kVA ; si elle charge la nuit, quand le chauffage et la cuisine tournent peu, la puissance actuelle peut suffire. Additionnez ce qui fonctionne en même temps la nuit, borne comprise, avec le calculateur de puissance du compteur avant de demander un changement.' },
      { q: 'Combien de kilomètres récupère-t-on en une nuit Tempo ?', a: `Les heures creuses Tempo durent huit heures, de 22 h à 6 h. À ${h.num(3.7, 1)} kW, la voiture reçoit environ ${h.num(3.7 * 8)} kWh, de quoi rouler près de ${h.num(3.7 * 8 / CONSO * 100)} km avec ${h.num(CONSO)} kWh aux 100 km. À ${h.num(7.4, 1)} kW, c’est le double. Pour la plupart des trajets quotidiens, une nuit suffit largement à refaire le plein.` },
      { q: 'Que faire si je dois recharger un jour rouge en journée ?', a: `Limitez la charge au strict nécessaire pour le trajet suivant et terminez après 22 h. Chaque kWh pris entre 6 h et 22 h un jour rouge coûte ${h.kwh(h.P.tempo.kwh.R.hp)}, plus de cinq fois le prix d’une nuit bleue. Si la voiture le permet, réglez une heure de début de charge à 22 h : elle attendra seule le bon moment.` },
      { q: 'La recharge en Heures creuses change-t-elle avec la réforme d’Enedis ?', a: 'Pour l’option Heures creuses, oui : une partie des heures creuses peut passer l’après-midi, et il faut alors reprogrammer la voiture sur les nouveaux horaires. Pour Tempo, non : la plage de 22 h à 6 h fait partie du tarif et ne bouge pas. C’est un argument pratique pour Tempo quand on charge toujours la nuit.' },
      { q: 'La recharge de la voiture fait-elle baisser le prix moyen de mon kWh ?', a: 'Souvent, oui. Des kilowattheures ajoutés la nuit, au prix des heures creuses, font baisser le prix moyen de tout le foyer, abonnement compris, puisque celui-ci se répartit sur davantage de kWh. Avec Tempo, l’effet est d’autant plus net que les heures creuses bleues et blanches sont moins chères que celles de l’option Heures creuses. La page prix du kWh fait ce calcul.' },
    ],
    body: (h) => {
      const t = h.P.tempo.kwh;
      return `
<h2>Pourquoi la voiture électrique et Tempo vont bien ensemble</h2>
<p>Tempo récompense ce qui se consomme la nuit et punit ce qui se consomme en journée les jours rouges. Une voiture garée le soir et repartie le matin coche la première case sans effort. Les huit heures creuses Tempo, de 22 h à 6 h, sont fixées par le tarif depuis la ${h.src('creTempo2014', 'délibération de la CRE de 2014')} : elles sont les mêmes partout en France et ne dépendent pas d’Enedis. Programmer la voiture une fois suffit pour toute l’année.</p>
<p>La nuit, la couleur pèse peu : le kWh vaut ${h.kwh(t.B.hc)} un jour bleu et ${h.kwh(t.R.hc)} un jour rouge, un écart de quelques centimes. Même la nuit d’un jour rouge reste moins chère qu’une heure pleine de l’option Heures creuses, à ${h.kwh(h.P.hc.hp)}.</p>

<h2>Ce que coûte une année de recharge</h2>
<p>Le calcul ci-dessous suppose ${h.num(CONSO)} kWh aux 100 km, 90 % de la recharge la nuit et les jours rouges rechargés uniquement la nuit. Les jours de chaque couleur sont comptés au prorata du calendrier : ${h.num(h.P.tempo_regles.jours_bleus_annee_365)} bleus, ${h.num(h.P.tempo_regles.jours_blancs)} blancs, ${h.num(h.P.tempo_regles.jours_rouges)} rouges. Les prix sont ceux de la ${h.src('grilleEdf', 'grille du Tarif Bleu au 1er août 2026')}.</p>
${h.table(['Kilomètres par an', 'Énergie', 'Tempo', 'Heures creuses', 'Base', 'Gain de Tempo sur la Base'], tableau(h, true), 'Coût annuel de la recharge, TTC, hors abonnement et hors pertes de charge.', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Le gain grandit avec les kilomètres. Il ne dit pas tout, parce que l’abonnement et le reste de la maison comptent aussi : une voiture qui ajoute plusieurs milliers de kWh par an rend souvent Tempo plus intéressant pour tout le foyer, à condition que le chauffage reste maîtrisé les jours rouges. Le ${h.a('comparateur', 'comparateur Base, Heures creuses ou Tempo')} fait le calcul pour la maison entière : ajoutez les kWh de la voiture à votre consommation annuelle et indiquez une part nocturne plus élevée.</p>

<h2>La puissance de charge et la nuit</h2>
<p>La question pratique est de savoir si huit heures suffisent. L’énergie délivrée est simplement la puissance multipliée par la durée :</p>
${h.table(['Puissance de charge', 'Énergie en 8 h', 'Autonomie récupérée'], nuit(h), `Autonomie calculée avec ${h.num(CONSO)} kWh aux 100 km, hors pertes.`, ['l', 'r', 'r'])}
<p>Une prise renforcée suffit à la plupart des trajets domicile-travail ; une borne plus puissante devient utile pour les gros rouleurs ou les batteries de grande taille. Avant d’installer une borne, vérifiez que votre compteur supporte la charge en même temps que le chauffage et le ballon : la page ${h.a('puissance-compteur', 'puissance du compteur')} additionne les appareils qui tournent ensemble et donne la puissance à souscrire.</p>

<h2>Programmer la charge</h2>
<p>La plupart des voitures et des bornes permettent de régler une heure de début. Réglez-la à 22 h, ou un peu après pour laisser une marge. Certaines bornes lisent directement le signal heures creuses du compteur Linky ; d’autres se pilotent depuis une application. L’essentiel est d’éviter le réflexe de brancher en rentrant à 18 h et de laisser charger aussitôt : un soir de jour rouge, ces quatre heures seraient facturées ${h.kwh(t.R.hp)} le kWh.</p>
<p>Pour l’option Heures creuses, la réforme décidée par la ${h.src('creHc2026', 'CRE en février 2026')} déplace une partie des heures creuses vers l’après-midi selon les secteurs : une charge réglée sur les anciens horaires risque alors de tomber en heures pleines. La page ${h.a('heures-creuses', 'nouvelles heures creuses')} chiffre ce risque. Avec Tempo, la plage ne change pas.</p>

<h2>Les jours rouges, le seul piège</h2>
<p>Un trajet imprévu un jour rouge peut obliger à recharger en journée. Prenez juste ce qu’il faut pour rentrer, et laissez la nuit finir le travail. La veille d’une série de rouges, faites le plein complet pendant la nuit bleue ou blanche qui précède : le guide ${h.a('jour-rouge-tempo', 'que faire un jour rouge')} détaille cette préparation.</p>
<h2>Une année de recharge, couleur par couleur</h2>
<p>Pour ${h.num(12000)} km par an à ${h.num(CONSO)} kWh aux 100 km, la recharge représente ${h.num(12000 * CONSO / 100)} kWh. Répartis au prorata du calendrier et facturés au prix de chaque couleur, voici ce que deviennent ces kilowattheures, avec 90 % de recharge la nuit et les jours rouges rechargés uniquement la nuit :</p>
${h.table(['Couleur', 'Jours', 'kWh rechargés', 'Coût'], (['B', 'W', 'R'] as const).map((c) => {
  const j = c === 'B' ? h.P.tempo_regles.jours_bleus_annee_365 : c === 'W' ? h.P.tempo_regles.jours_blancs : h.P.tempo_regles.jours_rouges;
  const k = 12000 * CONSO / 100 * j / 365, p = h.P.tempo.kwh[c];
  const cout = c === 'R' ? k * p.hc : k * (0.9 * p.hc + 0.1 * p.hp);
  return [c === 'B' ? 'Bleu' : c === 'W' ? 'Blanc' : 'Rouge', h.num(j), `${h.num(k)} kWh`, h.eur(cout)];
}), 'Recharge de 12 000 km par an, prix TTC au 1er août 2026.', ['l', 'r', 'r', 'r'])}
<p>Les jours rouges ne pèsent presque rien quand la voiture charge la nuit : leur prix d’heures creuses reste proche de celui des autres couleurs. Toute la différence avec une recharge mal placée se fait sur les heures pleines rouges.</p>

<h2>Ce qui change quand la voiture rentre tard</h2>
<p>Un conducteur qui rentre à 23 h et repart à 6 h dispose encore de sept heures creuses : la plupart des recharges quotidiennes y tiennent. Celui qui travaille de nuit et recharge en journée est dans la situation inverse : ses heures de charge tombent en heures pleines, et les jours rouges lui coûtent cher. Pour lui, l’option Heures creuses, avec une partie des heures creuses l’après-midi après la réforme d’Enedis, peut convenir mieux que Tempo. Le ${h.a('comparateur', 'comparateur')} permet de tester les deux, en indiquant une part nocturne plus faible.</p>

<h2>Recharger ailleurs qu’à la maison</h2>
<p>Ce site ne calcule que la recharge au domicile, facturée par votre fournisseur d’électricité au tarif de votre contrat. Une borne publique, sur le lieu de travail ou sur une aire d’autoroute applique ses propres prix, qui ne dépendent pas de la couleur Tempo de votre compteur. Si une partie de vos kilomètres est rechargée ailleurs, retirez-la du kilométrage saisi dans le mini-simulateur : le résultat ne portera que sur ce que paie votre compteur.</p>
<h2>Hybride rechargeable et petits rouleurs</h2>
<p>Une hybride rechargeable a une petite batterie, souvent rechargée en quelques heures sur une prise ordinaire : la nuit Tempo suffit toujours. Le gain en euros est plus modeste qu’avec une voiture électrique, faute de kilowattheures, mais la règle reste la même : brancher le soir, programmer le départ de la charge à 22 h, ne jamais charger en journée un jour rouge. Pour un petit rouleur, l’essentiel de la facture reste celui de la maison ; la voiture ne fait pas basculer le choix de l’option, elle le conforte quand Tempo est déjà avantageux.</p>
<p>À l’inverse, un gros rouleur qui recharge chaque nuit plusieurs dizaines de kilowattheures ajoute à son foyer une consommation presque entièrement nocturne. C’est le profil le plus favorable à Tempo : la part de la consommation la nuit grimpe, et les jours rouges pèsent moins dans le total. Refaites alors le calcul complet avec le comparateur, voiture comprise.</p>
<p>Enfin, gardez un œil sur la facture des premiers mois : les relevés par couleur et par plage horaire montrent tout de suite si la voiture charge bien la nuit. Une hausse des kWh en heures pleines rouges trahit une programmation qui ne fonctionne pas, une recharge lancée à la main, ou une heure de début mal réglée après un changement d’heure.</p>`;
    },
  },
  en: {
    slug: 'ev-charging-tempo',
    nav: 'Charging an EV on Tempo',
    card: 'A year of charging on Tempo, Off-peak and Base, in euros.',
    title: 'EV Charging on Tempo 2026: Cost per Year in France',
    description: 'EV charging in France 2026: annual cost on Tempo, Off-peak and Base by mileage, night charging from 22:00 to 06:00 and how to avoid red-day peak prices.',
    h1: 'Charging an electric car on Tempo',
    intro: 'A car that charges overnight is the ideal Tempo use: here is what a year of charging costs on each option.',
    resume: (h) => {
      const t = h.P.tempo.kwh, r = coutRecharge(12000, CONSO, 0.9);
      return `An electric car mostly charges at night while it is parked, which is exactly Tempo’s off-peak window, from 22:00 to 06:00, when a kilowatt-hour costs ${h.kwh(t.B.hc)} on a blue day, ${h.kwh(t.W.hc)} on a white day and ${h.kwh(t.R.hc)} on a red day under the regulated tariff of 1 August 2026. On the Off-peak option the same night-time kWh costs ${h.kwh(h.P.hc.hc)}, and ${h.kwh(h.P.base.kwh['6'])} on Base at 6 kVA. For ${h.num(12000)} kilometres a year at ${h.num(CONSO)} kWh per 100 km, that is ${h.num(r.kwh)} kWh charged, with 90% of charging at night, the year costs about ${h.eur(r.tempo)} on Tempo, ${h.eur(r.hc)} on Off-peak and ${h.eur(r.base)} on Base, standing charge excluded. There is only one rule to keep: never charge between 06:00 and 22:00 on a red day, when a kWh rises to ${h.kwh(t.R.hp)}. The mini-calculator takes your own mileage and car.`;
    },
    faqs: (h) => [
      { q: 'Do I need a bigger meter power for a wallbox?', a: 'Not always. A 7.4 kW wallbox alone draws more than half of a 12 kVA meter; if it charges at night, when heating and cooking are low, your current power may be enough. Add up everything running at the same time at night, charger included, with the meter power calculator before asking for a change.' },
      { q: 'How many kilometres do I get back in one Tempo night?', a: `Tempo off-peak hours last eight hours, 22:00 to 06:00. At ${h.num(3.7, 1)} kW the car receives about ${h.num(3.7 * 8)} kWh, enough for roughly ${h.num(3.7 * 8 / CONSO * 100)} km at ${h.num(CONSO)} kWh per 100 km. At ${h.num(7.4, 1)} kW it is twice that. For most daily journeys, one night is more than enough to fill up again.` },
      { q: 'What if I must charge during the day on a red day?', a: `Keep the charge to what the next trip needs and finish after 22:00. Each kWh taken between 06:00 and 22:00 on a red day costs ${h.kwh(h.P.tempo.kwh.R.hp)}, more than five times a blue night. If the car allows it, set the charging start time to 22:00: it will wait for the right moment by itself.` },
      { q: 'Does the Enedis off-peak reform change Off-peak charging?', a: 'For the Off-peak option, yes: some off-peak hours may move to the afternoon, and the car must then be reprogrammed to the new times. For Tempo, no: the 22:00 to 06:00 window is part of the tariff and does not move. That is a practical point in Tempo’s favour if you always charge at night.' },
      { q: 'Does charging the car lower my average price per kWh?', a: 'Often, yes. Kilowatt-hours added at night, at off-peak prices, bring down the whole household’s average price, standing charge included, since it is spread over more kWh. On Tempo the effect is clearer still because blue and white off-peak hours are cheaper than the Off-peak option’s. The price-per-kWh page works it out.' },
    ],
    body: (h) => {
      const t = h.P.tempo.kwh;
      return `
<h2>Why an EV and Tempo go well together</h2>
<p>Tempo rewards what you use at night and penalises daytime use on red days. A car parked in the evening and driven off in the morning ticks the first box with no effort. Tempo’s eight off-peak hours, 22:00 to 06:00, have been fixed in the tariff since the ${h.src('creTempo2014', 'regulator’s 2014 deliberation')}: they are the same everywhere in France and do not depend on Enedis. Programming the car once is enough for the whole year.</p>
<p>At night the colour matters little: a kWh costs ${h.kwh(t.B.hc)} on a blue day and ${h.kwh(t.R.hc)} on a red day, a gap of a few cents. Even a red-day night is cheaper than a peak hour on the Off-peak option, at ${h.kwh(h.P.hc.hp)}.</p>

<h2>What a year of charging costs</h2>
<p>The figures below assume ${h.num(CONSO)} kWh per 100 km, 90% of charging at night and red days charged at night only. Days of each colour are counted in proportion to the calendar: ${h.num(h.P.tempo_regles.jours_bleus_annee_365)} blue, ${h.num(h.P.tempo_regles.jours_blancs)} white, ${h.num(h.P.tempo_regles.jours_rouges)} red. Prices are those of the ${h.src('grilleEdf', 'Tarif Bleu grid of 1 August 2026')}.</p>
${h.table(['Kilometres a year', 'Energy', 'Tempo', 'Off-peak', 'Base', 'Tempo saving over Base'], tableau(h, false), 'Annual charging cost including tax, excluding standing charge and charging losses.', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The saving grows with mileage. It is not the whole story, because the standing charge and the rest of the home count too: a car adding several thousand kWh a year often makes Tempo more attractive for the whole household, as long as heating stays under control on red days. The ${h.a('comparateur', 'Base, Off-peak or Tempo comparison')} works it out for the whole home: add the car’s kWh to your annual consumption and enter a higher night share.</p>

<h2>Charging power and the night</h2>
<p>The practical question is whether eight hours are enough. The energy delivered is simply power multiplied by time:</p>
${h.table(['Charging power', 'Energy in 8 h', 'Range recovered'], nuit(h), `Range worked out at ${h.num(CONSO)} kWh per 100 km, before losses.`, ['l', 'r', 'r'])}
<p>A reinforced socket covers most commutes; a more powerful wallbox becomes useful for high-mileage drivers or large batteries. Before installing a wallbox, check that your meter can take the load alongside heating and the water heater: the ${h.a('puissance-compteur', 'meter power')} page adds up appliances running together and gives the power to subscribe.</p>

<h2>Scheduling the charge</h2>
<p>Most cars and wallboxes let you set a start time. Set it to 22:00, or slightly later for a margin. Some wallboxes read the Linky meter’s off-peak signal directly; others are run from an app. What matters is breaking the habit of plugging in at 18:00 and letting it charge straight away: on a red-day evening those four hours would be billed at ${h.kwh(t.R.hp)} per kWh.</p>
<p>On the Off-peak option, the reform decided by the ${h.src('creHc2026', 'regulator in February 2026')} moves some off-peak hours to the afternoon depending on the area: a charge set to the old times may then land in peak hours. The ${h.a('heures-creuses', 'new off-peak hours')} page puts a figure on that risk. With Tempo the window stays put.</p>

<h2>Red days, the only trap</h2>
<p>An unplanned trip on a red day may force a daytime charge. Take only what you need to get home and let the night finish the job. Before a run of red days, charge to full during the blue or white night before: the guide on ${h.a('jour-rouge-tempo', 'what to do on a red day')} goes through that preparation.</p>
<h2>A year of charging, colour by colour</h2>
<p>For ${h.num(12000)} km a year at ${h.num(CONSO)} kWh per 100 km, charging comes to ${h.num(12000 * CONSO / 100)} kWh. Spread in proportion to the calendar and billed at each colour’s price, here is what those kilowatt-hours become, with 90% charged at night and red days charged at night only:</p>
${h.table(['Colour', 'Days', 'kWh charged', 'Cost'], (['B', 'W', 'R'] as const).map((c) => {
  const j = c === 'B' ? h.P.tempo_regles.jours_bleus_annee_365 : c === 'W' ? h.P.tempo_regles.jours_blancs : h.P.tempo_regles.jours_rouges;
  const k = 12000 * CONSO / 100 * j / 365, p = h.P.tempo.kwh[c];
  const cout = c === 'R' ? k * p.hc : k * (0.9 * p.hc + 0.1 * p.hp);
  return [c === 'B' ? 'Blue' : c === 'W' ? 'White' : 'Red', h.num(j), `${h.num(k)} kWh`, h.eur(cout)];
}), 'Charging for 12,000 km a year, prices including tax from 1 August 2026.', ['l', 'r', 'r', 'r'])}
<p>Red days weigh almost nothing when the car charges at night: their off-peak price stays close to the other colours. The whole difference with badly timed charging is made in red peak hours.</p>

<h2>What changes when the car comes home late</h2>
<p>A driver who gets home at 23:00 and leaves at 06:00 still has seven off-peak hours: most daily top-ups fit into them. Someone who works nights and charges during the day is in the opposite position: charging falls in peak hours, and red days cost a lot. For them the Off-peak option, with some off-peak hours in the afternoon after the Enedis reform, may suit better than Tempo. The ${h.a('comparateur', 'comparison tool')} lets you test both by entering a lower night share.</p>

<h2>Charging away from home</h2>
<p>This site only works out charging at home, billed by your electricity supplier at your contract’s rates. A public charger, at work or on a motorway services, applies its own prices, which do not depend on your meter’s Tempo colour. If some of your kilometres are charged elsewhere, take them off the mileage entered in the mini-calculator: the result will then cover only what your meter pays for.</p>
<h2>Plug-in hybrids and low-mileage drivers</h2>
<p>A plug-in hybrid has a small battery, often charged in a few hours on an ordinary socket: a Tempo night is always enough. The saving in euros is smaller than with a full electric car, for want of kilowatt-hours, but the rule stays the same: plug in in the evening, set the charge to start at 22:00, never charge during the day on a red day. For a low-mileage driver most of the bill remains the house’s; the car does not tip the choice of option, it reinforces it when Tempo already pays.</p>
<p>Conversely, a high-mileage driver who charges tens of kilowatt-hours every night adds an almost entirely night-time load to the household. That is the profile most favourable to Tempo: the night share of consumption rises and red days weigh less in the total. Rerun the full calculation in the comparison tool, car included.</p>
<p>Whatever the car, keep an eye on the charging cable and socket: a dedicated, properly rated circuit is the safe way to charge every night, and an electrician can confirm what your installation supports.</p>
<p>Finally, keep an eye on the first few months’ bills: the readings by colour and time band show straight away whether the car really charges at night. A rise in red peak kWh gives away a schedule that is not working, a charge started by hand, or a start time knocked out by the clocks changing. Fix it before the next run of red days and the year’s figures will match the table above. Some cars and wallboxes keep a charging log: comparing it with the meter readings is a quick way to confirm that every session started after 22:00.</p>`;
    },
  },
});

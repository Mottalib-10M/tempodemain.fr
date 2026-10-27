import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Abonnement annuel TTC de chaque option à chaque puissance (moteur, grille du 1er août 2026). */
const grille = (h: Helpers, fr: boolean) => h.M.PUISSANCES.map((kva) => [
  `${kva} kVA`,
  ...(['base', 'hc', 'tempo'] as const).map((o) => (h.M.disponible(o, kva) ? `${h.eur(h.M.aboAnnuel(o, kva))}${h.M.enExtinction(o, kva) ? ' *' : ''}` : (fr ? 'non proposée' : 'not offered'))),
]);
/** Surcoût annuel d'un cran de puissance en Heures creuses, du plus petit au plus grand. */
const crans = (h: Helpers) => h.M.PUISSANCES.slice(0, -1).map((kva, i) => ({ de: kva, a: h.M.PUISSANCES[i + 1], plus: h.M.aboAnnuel('hc', h.M.PUISSANCES[i + 1]) - h.M.aboAnnuel('hc', kva) }));

export default defineGuide({
  id: 'puissance-compteur',
  group: 'choisir',
  order: 3,
  tool: 'puissance',
  related: ['comparateur', 'prix-kwh', 'recharge-voiture-tempo', 'consommation-appareils', 'chauffage-electrique-tempo', 'compteur-linky'],
  sources: ['grilleEdf', 'creTrve2026', 'creTempo2014'],
  fr: {
    slug: 'puissance-compteur',
    nav: 'Puissance du compteur',
    card: 'Les kVA qu’il vous faut, d’après les appareils qui tournent ensemble.',
    title: 'Puissance compteur électrique 2026 : quels kVA choisir ?',
    description: 'Puissance du compteur électrique 2026 : quelle puissance en kVA choisir selon vos appareils, abonnement de chaque option et coût d’un cran de puissance en plus.',
    h1: 'Quelle puissance de compteur choisir ?',
    intro: 'Additionnez les appareils qui fonctionnent en même temps : l’outil donne la puissance à souscrire et l’abonnement qui va avec.',
    resume: (h) => {
      const C = crans(h), c69 = C.find((c) => c.de === 6)!;
      return `La puissance souscrite, exprimée en kilovoltampères (kVA), est le plafond d’électricité que votre logement peut appeler au même instant. Si les appareils allumés ensemble le dépassent, le compteur coupe. En usage domestique, un kVA vaut à peu près un kilowatt : un radiateur de 2 000 W, une plaque de 1,5 kW et un ballon de 2,2 kW tirent ensemble environ 5,7 kVA. Les puissances proposées au tarif réglementé vont de ${h.num(h.M.PUISSANCES[0])} à ${h.num(h.M.PUISSANCES[h.M.PUISSANCES.length - 1])} kVA, par crans. Chaque cran augmente l’abonnement mais pas le prix du kilowattheure, sauf en Base où le kWh baisse légèrement à partir de 9 kVA. Passer de 6 à 9 kVA coûte ${h.eur(c69.plus)} de plus par an en option Heures creuses. L’option Tempo n’existe qu’à partir de ${h.num(h.P.tempo.kva_min)} kVA, et la Base n’est plus ouverte aux nouveaux contrats au-delà de 6 kVA. Le bon réglage est donc la plus petite puissance qui ne coupe jamais.`;
    },
    faqs: (h) => [
      { q: 'Que se passe-t-il si je dépasse ma puissance souscrite ?', a: 'Le compteur Linky coupe l’alimentation, comme le faisait l’ancien disjoncteur d’abonné. Il suffit d’éteindre un appareil puis de réarmer en appuyant sur le bouton du disjoncteur. Des coupures répétées, toujours aux mêmes moments, chauffage et four allumés ensemble par exemple, sont le signe qu’il faut soit étaler les usages, soit monter d’un cran de puissance.' },
      { q: 'Comment connaître la puissance d’un appareil ?', a: 'Elle figure sur sa plaque signalétique, une étiquette souvent collée à l’arrière ou sous l’appareil, en watts (W) ou en kilowatts (kW). Un four ou une plaque de cuisson affichent la puissance maximale, atteinte surtout au démarrage. Pour un radiateur, additionnez la puissance de tous ceux qui chauffent en même temps dans le logement, pas seulement celui de la pièce principale.' },
      { q: 'Baisser ma puissance fait-il baisser le prix du kWh ?', a: `Non, en Heures creuses et en Tempo le prix du kWh est le même à toutes les puissances : seul l’abonnement baisse. En Base, le kWh coûte ${h.kwh(h.P.base.kwh['6'])} en 3 et 6 kVA et ${h.kwh(h.P.base.kwh['9'])} au-delà. Réduire la puissance n’a donc d’intérêt que si vous n’utilisez jamais la marge : sinon les coupures coûtent plus en confort qu’elles ne font gagner.` },
      { q: 'Faut-il plus de puissance pour une voiture électrique ?', a: 'Souvent, oui. Une prise renforcée charge à environ 3,7 kW et une borne murale à 7,4 kW, à ajouter à tout ce qui tourne en même temps. Si la charge a lieu la nuit, quand le chauffage et la cuisson sont à l’arrêt, un cran de plus peut suffire, voire aucun. Faites le calcul avec l’outil en entrant la puissance de charge.' },
      { q: 'Comment changer de puissance de compteur ?', a: 'La modification se demande à votre fournisseur, qui la transmet à Enedis. Avec un compteur Linky, elle se fait à distance, sans rendez-vous. L’abonnement change à la date de la modification, au tarif de la nouvelle puissance. Si vous êtes en Base au-delà de 6 kVA, renseignez-vous avant : l’option étant fermée aux nouveaux contrats à ces puissances, un changement peut vous faire basculer sur une autre option.' },
    ],
    body: (h) => {
      const C = crans(h);
      return `
<h2>L’abonnement de chaque option, cran par cran</h2>
${h.table(['Puissance', 'Base', 'Heures creuses', 'Tempo'], grille(h, true), 'Abonnement annuel TTC au tarif réglementé du 1er août 2026. * Base fermée aux nouveaux contrats au-delà de 6 kVA, facturée aux contrats existants.', ['l', 'r', 'r', 'r'])}
<p>Ces montants viennent de la ${h.src('grilleEdf', 'grille du Tarif Bleu')} applicable au 1er août 2026, établie sur proposition de la ${h.src('creTrve2026', 'CRE')}. À une même puissance, Base et Heures creuses ont le même abonnement depuis cette date, et l’option Heures creuses est désormais ouverte dès 3 kVA. L’abonnement Tempo est un peu moins cher que les deux autres, mais l’option ne se souscrit pas en dessous de ${h.num(h.P.tempo.kva_min)} kVA.</p>
<h2>Ce que coûte un cran de plus</h2>
${h.table(['De', 'À', 'Abonnement en plus par an'], C.map((c) => [`${c.de} kVA`, `${c.a} kVA`, h.eur(c.plus)]), 'Option Heures creuses, écart d’abonnement annuel TTC.', ['l', 'l', 'r'])}
<p>Les crans ne coûtent pas tous la même chose : l’écart grandit entre 18 et 36 kVA, où les marches font 6 kVA. Avant de monter, regardez quand surviennent les coupures. Si elles tombent toujours quand le four et le lave-linge tournent pendant que le chauffage est allumé, décaler une machine de deux heures suffit souvent, et l’économie se garde chaque année.</p>
<h2>Comment estimer votre pointe</h2>
<p>Ce qui compte n’est pas la somme de tous vos appareils, mais celle de ceux qui fonctionnent au même moment. Un sèche-linge et un four allumés le dimanche midi, en plein hiver, avec les radiateurs : c’est souvent la pointe d’une maison. L’outil vous fait additionner les familles d’usages qui se cumulent vraiment : chauffage, cuisson, eau chaude, recharge et le reste. Lisez la puissance de chaque appareil sur sa plaque, puis prenez la puissance immédiatement supérieure à votre total.</p>
<ul>
<li>Un chauffage électrique se compte en totalité : tous les radiateurs peuvent démarrer ensemble au réveil d’un matin froid.</li>
<li>Un ballon d’eau chaude piloté en heures creuses ne chauffe que la nuit : si rien d’autre ne tourne alors, il ne s’ajoute pas à la pointe du soir.</li>
<li>Une recharge de voiture programmée la nuit suit la même logique ; une recharge lancée en rentrant à 18 h, non.</li>
</ul>
<p>Une fois la puissance fixée, comparez les options sur votre consommation avec le ${h.a('comparateur', 'comparateur Base, Heures creuses ou Tempo')}, et vérifiez la consommation de chaque appareil avec le guide ${h.a('consommation-appareils', 'consommation des appareils')}.</p>`;
    },
  },
  en: {
    slug: 'meter-power-kva',
    nav: 'Meter power (kVA)',
    card: 'The kVA you need, from the appliances that run at the same time.',
    title: 'Meter Power in kVA 2026: Which Electricity Power to Choose',
    description: 'Meter power in kVA for 2026: which French electricity power to choose for your appliances, the standing charge of each option, and the cost of one step up.',
    h1: 'Which meter power should you choose?',
    intro: 'Add up the appliances that run at the same time: the tool gives the power to subscribe and the standing charge that goes with it.',
    resume: (h) => {
      const C = crans(h), c69 = C.find((c) => c.de === 6)!;
      return `Subscribed power (puissance souscrite), expressed in kilovolt-amperes (kVA), is the ceiling on the electricity your home can draw at any one moment. If the appliances running together exceed it, the meter cuts out. In household use one kVA is roughly one kilowatt: a 2,000 W radiator, a 1.5 kW hob ring and a 2.2 kW water heater draw about 5.7 kVA between them. On the regulated tariff, powers run from ${h.num(h.M.PUISSANCES[0])} to ${h.num(h.M.PUISSANCES[h.M.PUISSANCES.length - 1])} kVA in steps. Each step raises the standing charge but not the price per kilowatt-hour, except on Base where the kWh is slightly cheaper from 9 kVA. Going from 6 to 9 kVA costs ${h.eur(c69.plus)} more a year on the Off-peak option. Tempo only exists from ${h.num(h.P.tempo.kva_min)} kVA, and Base is closed to new contracts above 6 kVA. The right setting is therefore the lowest power that never trips.`;
    },
    faqs: (h) => [
      { q: 'What happens if I go over my subscribed power?', a: 'The Linky meter cuts the supply, as the old main breaker used to. Switch an appliance off, then reset by pressing the breaker button. Repeated cut-outs, always at the same moments, such as heating and oven on together, are a sign that you should either spread your use or move up one power step.' },
      { q: 'How do I find an appliance’s power rating?', a: 'It is on the rating plate (plaque signalétique), a label usually on the back or underside of the appliance, in watts (W) or kilowatts (kW). An oven or hob shows its maximum power, reached mostly when heating up. For radiators, add up all those that heat at the same time in the home, not just the one in the main room.' },
      { q: 'Does lowering my power lower the price per kWh?', a: `No: on Off-peak and Tempo the kWh price is the same at every power, and only the standing charge falls. On Base the kWh costs ${h.kwh(h.P.base.kwh['6'])} at 3 and 6 kVA and ${h.kwh(h.P.base.kwh['9'])} above. Cutting power only makes sense if you never use the headroom; otherwise the cut-outs cost more in comfort than they save.` },
      { q: 'Do I need more power for an electric car?', a: 'Often, yes. A reinforced socket charges at about 3.7 kW and a wall box at 7.4 kW, on top of everything running at the same time. If you charge at night, when heating and cooking are off, one extra step may be enough, or none at all. Run the tool with your charging power entered.' },
      { q: 'How do I change my meter power?', a: 'You ask your supplier, who passes the request to Enedis, the network operator. With a Linky meter it is done remotely, without an appointment. The standing charge changes from that date, at the rate for the new power. If you are on Base above 6 kVA, check first: the option being closed to new contracts at those powers, a change may move you onto another option.' },
    ],
    body: (h) => {
      const C = crans(h);
      return `
<h2>Each option’s standing charge, step by step</h2>
${h.table(['Power', 'Base', 'Off-peak', 'Tempo'], grille(h, false), 'Annual standing charge including tax, regulated tariff of 1 August 2026. * Base closed to new contracts above 6 kVA, still billed to existing ones.', ['l', 'r', 'r', 'r'])}
<p>These amounts come from the ${h.src('grilleEdf', 'Tarif Bleu grid')} in force from 1 August 2026, set on the ${h.src('creTrve2026', 'regulator’s proposal')}. At a given power, Base and Off-peak have carried the same standing charge since that date, and the Off-peak option is now open from 3 kVA. The Tempo standing charge is a little lower than the other two, but the option cannot be taken below ${h.num(h.P.tempo.kva_min)} kVA.</p>
<h2>What one more step costs</h2>
${h.table(['From', 'To', 'Extra standing charge a year'], C.map((c) => [`${c.de} kVA`, `${c.a} kVA`, h.eur(c.plus)]), 'Off-peak option, annual standing charge gap including tax.', ['l', 'l', 'r'])}
<p>Steps do not all cost the same: the gap widens between 18 and 36 kVA, where steps are 6 kVA wide. Before moving up, look at when the cut-outs happen. If they always come when the oven and washing machine run while the heating is on, putting one load off by two hours is often enough, and the saving repeats every year.</p>
<h2>How to estimate your peak</h2>
<p>What matters is not the total of all your appliances but the total of those running at the same moment. A tumble dryer and an oven at Sunday lunchtime in mid-winter, with the radiators on, is often a house’s peak. The tool has you add up the groups of uses that really stack: heating, cooking, hot water, car charging and the rest. Read each appliance’s power on its plate, then take the power step just above your total.</p>
<ul>
<li>Electric heating counts in full: every radiator can start at once on a cold morning.</li>
<li>A water heater run on off-peak hours only heats at night: if nothing else runs then, it does not add to the evening peak.</li>
<li>Car charging scheduled at night follows the same logic; charging started on arriving home at 18:00 does not.</li>
</ul>
<p>A last check before you change anything: the standing charge is billed every month of the year, while a cut-out may only happen a few winter mornings. Spreading two appliances by an hour costs nothing; a step up costs the amount in the table, year after year.</p>
<p>Once the power is set, compare the options on your consumption with the ${h.a('comparateur', 'Base, Off-peak or Tempo comparison')}, and check what each appliance uses with the guide ${h.a('consommation-appareils', 'appliance consumption')}.</p>`;
    },
  },
});

import { defineGuide, type Helpers } from '../../lib/guide-types';

const k = (kva: number) => String(kva) as keyof Helpers['P']['base']['abo'];
/** Grille Base et Heures creuses du 1er août 2026, lue dans params-2026.json. */
const grille = (h: Helpers) => h.M.PUISSANCES.map((kva) => [`${kva} kVA`, h.eur(h.P.base.abo[k(kva)], 2), h.kwh(h.P.base.kwh[k(kva)]), h.eur(h.P.hc.abo[k(kva)], 2), h.kwh(h.P.hc.hp), h.kwh(h.P.hc.hc)]);
/** Prix moyen tout compris pour quatre consommations types (moteur, 35 % en heures creuses, 30 % de chauffage). */
const PROFILS = [[2000, 3], [4500, 6], [8000, 9], [14000, 12]] as const;
const moyens = (h: Helpers) => PROFILS.map(([kwh, kva]) => ({ kwh, kva, c: h.M.comparer({ kwh, kva, chauffage: 0.3, partHC: 0.35 }) }));

export default defineGuide({
  id: 'prix-kwh',
  group: 'choisir',
  order: 2,
  tool: 'prixKwh',
  related: ['comparateur', 'tarif-tempo', 'puissance-compteur', 'heures-creuses', 'home', 'accise-electricite', 'tarif-reglemente-offre-marche', 'cheque-energie'],
  sources: ['grilleEdf', 'creTrve2026', 'creHc2026'],
  fr: {
    slug: 'prix-kwh-tarif-bleu',
    nav: 'Prix du kWh au Tarif Bleu',
    card: 'La grille d’août 2026 et le prix moyen réel de votre kWh, abonnement compris.',
    title: 'Prix du kWh EDF 2026 : grille du Tarif Bleu au 1er août',
    description: 'Prix du kWh EDF au Tarif Bleu 2026 : grille Base et Heures creuses du 1er août, prix moyen abonnement compris selon votre consommation, taxes, prochaine hausse.',
    h1: 'Prix du kWh au Tarif Bleu en 2026',
    intro: 'Le prix affiché sur la grille n’est pas celui que vous payez vraiment : l’abonnement s’y ajoute. L’outil calcule votre prix moyen tout compris.',
    resume: (h) => `Depuis le 1er août 2026, le tarif réglementé de vente d’électricité, le Tarif Bleu d’EDF, facture le kilowattheure ${h.kwh(h.P.base.kwh['6'])} en option Base pour 3 et 6 kVA, et ${h.kwh(h.P.base.kwh['9'])} au-delà. En option Heures creuses, il coûte ${h.kwh(h.P.hc.hp)} en heures pleines et ${h.kwh(h.P.hc.hc)} en heures creuses, quelle que soit la puissance. Ces prix sont toutes taxes comprises : ils incluent l’acheminement sur les réseaux, l’accise sur l’électricité de ${h.kwh(h.P.taxes.accise_kwh_htva)} par kWh hors TVA, la contribution tarifaire d’acheminement et la TVA à ${h.pct(h.P.taxes.tva, 0)}. La Commission de régulation de l’énergie avait proposé en juillet une hausse moyenne de 3,12 % hors taxes des tarifs bleus résidentiels. Le prix réellement payé dépend aussi de l’abonnement : plus vous consommez, plus il se dilue, et un petit consommateur paie son kWh bien plus cher que le chiffre de la grille. Le prochain mouvement est attendu au 1er février 2027 ; il n’est pas encore publié.`,
    faqs: (h) => [
      { q: 'Pourquoi mon prix moyen du kWh est-il plus élevé que celui de la grille ?', a: 'Parce que l’abonnement se paie quel que soit votre usage. Divisé par une petite consommation, il pèse lourd : un studio qui consomme 2 000 kWh par an paie son kWh nettement plus que le prix affiché, une maison chauffée à 14 000 kWh presque le prix affiché. L’outil fait la division pour votre consommation et votre puissance, option par option.' },
      { q: 'Le prix du kWh est-il le même chez tous les fournisseurs ?', a: 'Non. Seul le tarif réglementé, proposé par EDF et par certaines entreprises locales de distribution, suit la grille fixée par les pouvoirs publics sur proposition de la CRE. Les offres de marché fixent leurs propres prix, parfois indexés sur le tarif réglementé, parfois fixes sur un ou deux ans. Comparez toujours le prix TTC du kWh et l’abonnement, à puissance égale.' },
      { q: 'Combien coûte l’absence de compteur Linky ?', a: `Une majoration de ${h.eur(h.P.taxes.majoration_sans_linky_an_ht, 2)} hors taxes par an s’ajoute à l’abonnement des consommateurs qui n’ont pas de compteur Linky, hors impossibilité technique d’installation. Une autre majoration, de ${h.eur(h.P.taxes.majoration_sans_index_an_ht, 2)} hors taxes par an, vise l’absence de transmission d’index depuis plus de douze mois. Les deux figurent sur la grille du 1er août 2026.` },
      { q: 'Quand le prix de l’électricité change-t-il ?', a: 'Le tarif réglementé évolue en général deux fois par an, au 1er février et au 1er août, sur proposition de la CRE. La grille du 1er août 2026 est en vigueur à la date de ce relevé. Le mouvement de février 2027 n’est pas encore publié : le site le reprendra dès sa parution, et la date de vérification en bas de page le dira.' },
    ],
    body: (h) => {
      const Mo = moyens(h);
      const nom = (o: string) => (o === 'base' ? 'Base' : o === 'hc' ? 'Heures creuses' : 'Tempo');
      return `
<h2>La grille Base et Heures creuses au 1er août 2026</h2>
${h.table(['Puissance', 'Base : abonnement / mois', 'Base : kWh', 'HC : abonnement / mois', 'HC : heures pleines', 'HC : heures creuses'], grille(h), 'Prix TTC de la grille EDF « Tarif Bleu » applicable au 1er août 2026.', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>La ${h.src('grilleEdf', 'grille officielle')} reprend les barèmes proposés par la ${h.src('creTrve2026', 'délibération de la CRE du 15 juillet 2026')}. Deux nouveautés y figurent : l’option Heures creuses est ouverte aux compteurs de 3 kVA, et les puissances de 9 à 36 kVA de l’option Base sont en extinction, c’est-à-dire facturées aux contrats existants mais fermées à la souscription. Les prix Tempo, qui varient avec la couleur du jour, ont leur page : ${h.a('tarif-tempo', 'tarif Tempo')}.</p>
<h2>Votre prix moyen, abonnement compris</h2>
${h.table(['Consommation', 'Puissance', 'Base', 'Heures creuses', 'Tempo', 'La moins chère'], Mo.map((m) => [
  `${h.num(m.kwh)} kWh`, `${m.kva} kVA`,
  ...m.c.lignes.map((l) => (l.dispo ? h.kwh(l.prixMoyen) : 'non proposée')),
  nom(m.c.meilleure.o),
]), 'Prix moyen TTC du kWh = facture annuelle ÷ consommation. 35 % en heures creuses, 30 % de chauffage pour Tempo.', ['r', 'l', 'r', 'r', 'r', 'l'])}
<p>Le prix moyen est le seul chiffre qui permet de comparer deux contrats d’un coup d’œil, parce qu’il intègre l’abonnement. On voit qu’il baisse fortement avec la consommation : la part fixe se répartit sur plus de kilowattheures. Pour les petites consommations, l’écart entre options tient surtout à l’abonnement ; pour les grosses, au prix du kWh.</p>
<h2>Ce que contient le prix TTC</h2>
<ul>
<li>La fourniture d’énergie et la commercialisation, calculées par la CRE par empilement des coûts.</li>
<li>L’acheminement sur les réseaux de transport et de distribution, le TURPE : avec l’entrée en vigueur du nouveau mécanisme de capacité, c’est l’un des deux postes qui expliquent la hausse d’août 2026 selon la CRE.</li>
<li>L’${h.a('accise-electricite', 'accise sur l’électricité')}, ${h.kwh(h.P.taxes.accise_kwh_htva)} par kWh hors TVA, anciennement appelée CSPE.</li>
<li>La contribution tarifaire d’acheminement (CTA), assise sur la part fixe de l’acheminement.</li>
<li>La TVA à ${h.pct(h.P.taxes.tva, 0)}, sur l’abonnement comme sur les consommations et les autres taxes.</li>
</ul>
<p>Pour savoir quelle option vous revient le moins cher sur une année entière, avec votre chauffage et vos usages de nuit, passez au ${h.a('comparateur', 'comparateur des trois options')}. Les ${h.a('heures-creuses', 'nouvelles heures creuses')} ne changent pas ces prix, seulement l’heure à laquelle ils s’appliquent.</p>`;
    },
  },
  en: {
    slug: 'price-per-kwh-tarif-bleu',
    nav: 'Price per kWh (Tarif Bleu)',
    card: 'The August 2026 grid and the real average price of your kWh, standing charge included.',
    title: 'Price per kWh 2026: Tarif Bleu Grid from 1 August, Explained',
    description: 'Price per kWh on the French Tarif Bleu 2026: Base and Off-peak grid from 1 August, all-in average price for your consumption, taxes and the next tariff change.',
    h1: 'Price per kWh on the Tarif Bleu in 2026',
    intro: 'The price on the grid is not what you really pay: the standing charge comes on top. The tool works out your all-in average price.',
    resume: (h) => `Since 1 August 2026 the regulated electricity tariff, EDF’s Tarif Bleu, bills a kilowatt-hour at ${h.kwh(h.P.base.kwh['6'])} on the Base option at 3 and 6 kVA, and ${h.kwh(h.P.base.kwh['9'])} above that. On the Off-peak option (heures creuses) it costs ${h.kwh(h.P.hc.hp)} at peak and ${h.kwh(h.P.hc.hc)} off-peak, whatever the power. These prices include all taxes: network charges, the electricity excise duty of ${h.kwh(h.P.taxes.accise_kwh_htva)} per kWh before VAT, the network access contribution (CTA) and VAT at ${h.pct(h.P.taxes.tva, 0)}. In July the CRE, the energy regulator, had proposed an average rise of 3.12% before tax for residential blue tariffs. What you really pay also depends on the standing charge: the more you use, the more it is spread out, and a small user pays far more per kWh than the grid figure suggests. The next change is expected on 1 February 2027 and has not been published yet.`,
    faqs: (h) => [
      { q: 'Why is my average price per kWh higher than the grid price?', a: 'Because the standing charge is due whatever you use. Spread over a small consumption it weighs a lot: a studio using 2,000 kWh a year pays well above the listed price per kWh, an electrically heated house at 14,000 kWh pays close to it. The tool does the division for your consumption and power, option by option.' },
      { q: 'Is the price per kWh the same with every supplier?', a: 'No. Only the regulated tariff, offered by EDF and some local distribution companies, follows the grid set by the authorities on the regulator’s proposal. Market offers set their own prices, sometimes indexed to the regulated tariff, sometimes fixed for one or two years. Always compare the price per kWh including tax and the standing charge, at the same power.' },
      { q: 'How much does having no Linky meter cost?', a: `A surcharge of ${h.eur(h.P.taxes.majoration_sans_linky_an_ht, 2)} a year before tax is added to the standing charge of customers without a Linky meter, unless installation is technically impossible. A second surcharge, ${h.eur(h.P.taxes.majoration_sans_index_an_ht, 2)} a year before tax, applies when no meter reading has been sent for over twelve months. Both appear on the 1 August 2026 grid.` },
      { q: 'When does the electricity price change?', a: 'The regulated tariff usually moves twice a year, on 1 February and 1 August, on the regulator’s proposal. The 1 August 2026 grid is in force at the date of this reading. The February 2027 change has not been published yet: the site will apply it as soon as it appears, and the check date at the foot of the page will say so.' },
    ],
    body: (h) => {
      const Mo = moyens(h);
      const nom = (o: string) => (o === 'base' ? 'Base' : o === 'hc' ? 'Off-peak' : 'Tempo');
      return `
<h2>The Base and Off-peak grid from 1 August 2026</h2>
${h.table(['Power', 'Base: standing / month', 'Base: kWh', 'Off-peak: standing / month', 'Off-peak: peak', 'Off-peak: off-peak'], grille(h), 'Prices including tax from the EDF “Tarif Bleu” grid applicable from 1 August 2026.', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The ${h.src('grilleEdf', 'official grid')} follows the scales proposed in the ${h.src('creTrve2026', 'regulator’s deliberation of 15 July 2026')}. Two changes stand out: the Off-peak option is now open to 3 kVA meters, and Base at 9 to 36 kVA is being phased out, meaning existing contracts are still billed but new ones cannot be taken. Tempo prices, which vary with the colour of the day, have their own page: ${h.a('tarif-tempo', 'Tempo prices')}.</p>
<h2>Your average price, standing charge included</h2>
${h.table(['Consumption', 'Power', 'Base', 'Off-peak', 'Tempo', 'Cheapest'], Mo.map((m) => [
  `${h.num(m.kwh)} kWh`, `${m.kva} kVA`,
  ...m.c.lignes.map((l) => (l.dispo ? h.kwh(l.prixMoyen) : 'not offered')),
  nom(m.c.meilleure.o),
]), 'Average price per kWh including tax = annual bill ÷ consumption. 35% off-peak, 30% heating for Tempo.', ['r', 'l', 'r', 'r', 'r', 'l'])}
<p>The average price is the only figure that compares two contracts at a glance, because it takes the standing charge in. It falls steeply as consumption grows: the fixed part is spread over more kilowatt-hours. For small users the gap between options comes mostly from the standing charge; for large ones, from the price per kWh.</p>
<h2>What the price including tax contains</h2>
<ul>
<li>Energy supply and retail costs, worked out by the regulator by adding up each cost block.</li>
<li>Transmission and distribution network charges, the TURPE: with the new capacity mechanism coming into force, it is one of the two items behind the August 2026 rise, according to the regulator.</li>
<li>The ${h.a('accise-electricite', 'electricity excise duty')}, ${h.kwh(h.P.taxes.accise_kwh_htva)} per kWh before VAT, formerly known as the CSPE.</li>
<li>The network access contribution (CTA), levied on the fixed part of the network charge.</li>
<li>VAT at ${h.pct(h.P.taxes.tva, 0)}, on the standing charge as on consumption and the other taxes.</li>
</ul>
<p>Prices on the grid are the same at every address in mainland France: the regulated tariff is set nationally, unlike off-peak hours, which Enedis places meter by meter. What differs from one home to the next is the power subscribed, the option chosen and the share of use at night, which is exactly what the tool asks for.</p>
<p>To find which option costs you least over a whole year, with your heating and night-time use, go to the ${h.a('comparateur', 'three-option comparison')}. The ${h.a('heures-creuses', 'new off-peak hours')} do not change these prices, only the time at which they apply.</p>`;
    },
  },
});

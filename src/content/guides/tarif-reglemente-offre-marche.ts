import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Gain annuel d'une offre remisée de 5, 10 ou 15 % sur le kWh hors taxes, pour trois foyers. */
const CAS: Array<['base' | 'hc', number, number]> = [['base', 2500, 6], ['base', 5000, 6], ['hc', 9000, 9]];
const gains = (h: Helpers) => CAS.map(([o, kwh, kva]) => {
  const e = { kwh, kva, chauffage: 0, partHC: 0.35 };
  const g = (r: number) => h.M.offreRemisee(o, e, r);
  return { o, kwh, kva, trv: g(0).trv, r5: g(0.05).gain, r10: g(0.1).gain, r15: g(0.15).gain };
});

export default defineGuide({
  id: 'tarif-reglemente-offre-marche',
  group: 'choisir',
  order: 20,
  mini: 'offreMarche',
  miniHref: 'comparateur',
  related: ['comparateur', 'prix-kwh', 'zen-flex-edf', 'accise-electricite', 'avis-tempo-edf'],
  sources: ['creTrve2026', 'mneRetourTrv', 'spFournisseur', 'mneComparateur', 'grilleEdf', 'spTrve2026'],
  fr: {
    slug: 'tarif-reglemente-ou-offre-de-marche',
    nav: 'Tarif réglementé ou offre de marché',
    card: 'Ce qui distingue le tarif bleu d’une offre de marché, et ce que rapporte vraiment une remise.',
    title: 'Tarif réglementé ou offre de marché 2026 : le vrai calcul',
    description: 'Tarif réglementé ou offre de marché en 2026 : qui fixe les prix, retour au tarif bleu, et ce que rapporte une remise de 10 % sur le kWh hors taxes, chiffrée.',
    h1: 'Tarif réglementé ou offre de marché : ce qui change vraiment',
    intro: 'Les règles des deux formules, ce qu’une remise annoncée rapporte une fois les taxes comptées, et quand revenir au tarif bleu.',
    resume: (h) => {
      const G = gains(h);
      return `Le tarif réglementé de vente d’électricité, le Tarif Bleu, est fixé par les pouvoirs publics sur proposition de la CRE, deux fois par an, et seuls EDF et les entreprises locales de distribution le vendent. Une offre de marché est un contrat dont le fournisseur fixe librement le prix, à prix fixe pour une durée donnée, indexé sur le tarif réglementé avec une remise, ou indexé sur les prix de gros. Tous les foyers jusqu’à 36 kVA peuvent choisir l’un ou l’autre, changer quand ils veulent et sans frais, et revenir au tarif réglementé après une offre de marché, sauf vers une option fermée comme EJP. La remise d’une offre indexée porte sur le prix hors taxes du kWh : l’accise et la TVA restent dues en entier. Une remise de 10 % fait ainsi gagner ${h.eur(G[1].r10)} par an à un foyer de ${h.num(G[1].kwh)} kWh en option Base, soit ${h.pct(G[1].r10 / G[1].trv)} de sa facture, et non 10 %. Le compteur, le réseau et la qualité de fourniture sont les mêmes dans les deux cas : seul le prix change.`;
    },
    faqs: (h) => [
      { q: 'Quitter le tarif réglementé est-il définitif ?', a: 'Non. Pour l’électricité, le médiateur national de l’énergie confirme qu’on peut revenir au tarif réglementé en le demandant à EDF, ou à l’entreprise locale de distribution là où elle existe, tant que la puissance souscrite ne dépasse pas 36 kVA. Seules les options fermées à la souscription, comme EJP, ne se retrouvent pas.' },
      { q: 'Changer de fournisseur coupe-t-il le courant ou change-t-il le compteur ?', a: 'Ni l’un ni l’autre. Le réseau et le compteur restent ceux d’Enedis ; le nouveau fournisseur s’occupe de résilier l’ancien contrat, et l’ancien fournisseur continue de vous livrer jusqu’à la date de bascule. Service-public.fr précise qu’il n’y a ni frais ni durée minimale d’engagement.' },
      { q: 'Une offre à prix fixe protège-t-elle d’une hausse ?', a: 'Oui pour le prix hors taxes du kWh, pendant la durée inscrite au contrat. Les taxes, elles, suivent la loi : une hausse de l’accise ou de la TVA se répercute quand même. À l’inverse, si le tarif réglementé baisse, le prix fixe ne suit pas : c’est un pari dans les deux sens.' },
      { q: 'Où comparer les offres de façon neutre ?', a: 'Sur le comparateur du médiateur national de l’énergie, une autorité publique, qui liste les offres de chaque fournisseur avec leur prix pour votre consommation et votre commune. Pour comparer les options du tarif réglementé entre elles, notre comparateur Base, Heures creuses ou Tempo fait le calcul.' },
    ],
    body: (h) => {
      const G = gains(h), acc = h.P.taxes.accise_kwh_htva, tva = h.P.taxes.tva, B6 = h.P.base.kwh['6'];
      const ht = B6 / (1 + tva) - acc;
      return `
<h2>Les deux formules, côte à côte</h2>
${h.table(['', 'Tarif réglementé (Tarif Bleu)', 'Offre de marché'], [
  ['Qui fixe le prix', 'Les ministres, sur proposition de la CRE', 'Le fournisseur, librement, dans le contrat'],
  ['Qui le vend', 'EDF, ou l’entreprise locale de distribution', 'Tous les fournisseurs, EDF compris'],
  ['Qui peut le souscrire', 'Particuliers, et entreprises de moins de 10 salariés et 2 M€, jusqu’à 36 kVA', 'Tout le monde'],
  ['Quand le prix bouge', 'En général au 1er février et au 1er août', 'Selon le contrat : jamais (prix fixe), avec le tarif réglementé, ou chaque mois'],
  ['Options', 'Base, Heures creuses, Tempo (EJP fermée)', 'Variables : week-end, jours chers façon Tempo, heures creuses décalées'],
  ['Engagement, frais de sortie', 'Aucun', 'Aucun pour un particulier'],
], 'Sources : délibération CRE n° 2026-147, service-public.fr, médiateur national de l’énergie.', ['l', 'l', 'l'])}
<p>Le tarif réglementé est construit par la CRE en additionnant des coûts, selon l’article L. 337-6 du code de l’énergie : l’énergie achetée au prix de marché, les garanties de capacité, l’acheminement sur les réseaux, les coûts commerciaux et une rémunération du fournisseur. Depuis la fin de l’accès régulé à l’électricité nucléaire historique, le 31 décembre 2025, cette brique d’énergie est entièrement achetée sur les marchés, comme le rappelle la ${h.src('creTrve2026', 'délibération du 15 juillet 2026')}. Ce mode de calcul vise à ce qu’un fournisseur alternatif puisse proposer moins cher : le tarif réglementé sert de référence, pas de prix plancher.</p>
<h2>Ce que rapporte vraiment une remise</h2>
<p>La plupart des offres indexées annoncent une remise sur le prix du kWh hors taxes du tarif réglementé. Or le kWh de l’option Base à ${h.kwh(B6)} contient ${h.kwh(acc * (1 + tva))} d’accise et de TVA sur l’accise, que personne ne peut remiser : la remise porte sur ${h.kwh(ht)} hors taxes, et la TVA baisse ensuite d’autant. Une remise de 10 % fait donc passer le kWh à ${h.kwh(h.M.offreRemisee('base', { kwh: 1000, kva: 6, chauffage: 0, partHC: 0 }, 0.1).kwhMoyenOffre)}, soit ${h.pct(1 - h.M.offreRemisee('base', { kwh: 1000, kva: 6, chauffage: 0, partHC: 0 }, 0.1).kwhMoyenOffre / B6)} de moins seulement sur le prix payé, et l’abonnement, souvent identique, ne baisse pas.</p>
${h.table(['Foyer', 'Tarif bleu par an', 'Remise de 5 %', 'Remise de 10 %', 'Remise de 15 %'], G.map((g) => [`${h.num(g.kwh)} kWh, ${g.o === 'base' ? 'Base' : 'Heures creuses'} ${g.kva} kVA`, h.eur(g.trv), h.eur(g.r5), h.eur(g.r10), h.eur(g.r15)]), 'Gain annuel TTC d’une offre remisée sur le prix du kWh hors taxes, abonnement inchangé. Grille du 1er août 2026 ; Heures creuses : 35 % de la consommation en heures creuses.', ['l', 'r', 'r', 'r', 'r'])}
<p>Le mini-calculateur fait le même calcul avec votre remise et un éventuel abonnement plus cher : quelques euros par mois d’abonnement suffisent à effacer la remise d’un petit consommateur. Vérifiez aussi si la remise est limitée dans le temps, et l’indexation : une remise sur le tarif réglementé suit ses hausses comme ses baisses, une offre indexée sur le marché de gros peut s’en écarter dans les deux sens.</p>
<h2>Quand rester au tarif réglementé</h2>
<p>Le tarif réglementé garde un atout que peu d’offres de marché reproduisent : l’option ${h.a('tarif-tempo', 'Tempo')}, dont le kWh des jours bleus est très bas, avec des règles publiques et un calendrier tenu par RTE. Un foyer qui en tire parti a peu à gagner ailleurs ; notre ${h.a('avis-tempo-edf', 'avis sur Tempo')} chiffre l’option sur cinq foyers. Le tarif réglementé est aussi le choix de ceux qui ne veulent pas surveiller une offre : son prix change par décision publique, connue à l’avance, et a augmenté de 2,5 % en moyenne au 1er août 2026 selon ${h.src('spTrve2026', 'service-public.fr')}.</p>
<h2>Quand regarder une offre de marché</h2>
<p>Une offre remisée devient intéressante pour un foyer en Base ou en Heures creuses qui ne veut pas de Tempo, dès que la remise est réelle et durable. Certaines offres de marché reprennent aussi l’idée de jours chers, comme ${h.a('zen-flex-edf', 'Zen Flex d’EDF')}, avec d’autres horaires. Pour les comparer de façon neutre, le ${h.src('mneComparateur', 'comparateur du médiateur national de l’énergie')} donne le prix de chaque offre pour votre consommation. ${h.src('spFournisseur', 'Service-public.fr')} rappelle que le changement est gratuit, sans durée minimale, sans changement de compteur, et que la ${h.src('mneRetourTrv', 'porte du tarif réglementé reste ouverte')} jusqu’à 36 kVA.</p>`;
    },
  },
  en: {
    slug: 'regulated-tariff-or-market-offer',
    nav: 'Regulated tariff or market offer',
    card: 'What separates the Tarif Bleu from a market offer, and what a discount is really worth.',
    title: 'Regulated Tariff or Market Offer 2026: The Real Numbers',
    description: 'Regulated tariff or market offer in France in 2026: who sets prices, going back to the Tarif Bleu, and what a 10% discount on the pre-tax kWh is worth in euros.',
    h1: 'Regulated tariff or market offer: what really changes',
    intro: 'The rules of both, what an advertised discount is worth once taxes are counted, and when to go back to the Tarif Bleu.',
    resume: (h) => {
      const G = gains(h);
      return `France’s regulated electricity tariff, the Tarif Bleu, is set by the government on a proposal from the CRE regulator, twice a year, and only EDF and local distribution companies sell it. A market offer is a contract whose price the supplier sets freely: fixed for a set period, indexed on the regulated tariff with a discount, or indexed on wholesale prices. Every household up to 36 kVA can choose either, switch whenever it likes at no cost, and go back to the regulated tariff after a market offer, except to a closed option such as EJP. The discount on an indexed offer applies to the pre-tax kWh price: the excise duty and VAT are still paid in full. A 10% discount therefore saves a ${h.num(G[1].kwh)} kWh household on the Base option ${h.eur(G[1].r10)} a year, ${h.pct(G[1].r10 / G[1].trv)} of its bill, not 10%. The meter, the grid and the quality of supply are the same either way: only the price changes.`;
    },
    faqs: (h) => [
      { q: 'Is leaving the regulated tariff final?', a: 'No. For electricity, the national energy ombudsman confirms you can return to the regulated tariff by asking EDF, or the local distribution company where there is one, as long as subscribed power does not exceed 36 kVA. Only options closed to new customers, such as EJP, cannot be recovered.' },
      { q: 'Does switching supplier cut the power or change the meter?', a: 'Neither. The grid and the meter stay with Enedis; the new supplier cancels the old contract for you, and the old supplier keeps supplying you until the switch date. Service-public.fr states that there are no fees and no minimum commitment period.' },
      { q: 'Does a fixed-price offer protect against rises?', a: 'Yes for the pre-tax kWh price, for the period written in the contract. Taxes follow the law: a rise in the excise duty or VAT is passed on anyway. Conversely, if the regulated tariff falls, the fixed price does not follow: it is a bet both ways.' },
      { q: 'Where can I compare offers impartially?', a: 'On the national energy ombudsman’s comparison tool, run by a public authority, which lists each supplier’s offers with their price for your consumption and town. To compare the regulated tariff’s own options, our Base, Off-peak or Tempo comparison does the maths.' },
    ],
    body: (h) => {
      const G = gains(h), acc = h.P.taxes.accise_kwh_htva, tva = h.P.taxes.tva, B6 = h.P.base.kwh['6'];
      const ht = B6 / (1 + tva) - acc;
      return `
<h2>The two side by side</h2>
${h.table(['', 'Regulated tariff (Tarif Bleu)', 'Market offer'], [
  ['Who sets the price', 'Ministers, on a proposal from the CRE', 'The supplier, freely, in the contract'],
  ['Who sells it', 'EDF, or the local distribution company', 'Every supplier, EDF included'],
  ['Who can take it', 'Households, and businesses under 10 staff and €2m, up to 36 kVA', 'Anyone'],
  ['When the price moves', 'Usually on 1 February and 1 August', 'Per contract: never (fixed), with the regulated tariff, or monthly'],
  ['Options', 'Base, Off-peak, Tempo (EJP closed)', 'Varied: weekend, Tempo-style expensive days, shifted off-peak hours'],
  ['Commitment, exit fees', 'None', 'None for a household'],
], 'Sources: CRE deliberation no. 2026-147, service-public.fr, national energy ombudsman.', ['l', 'l', 'l'])}
<p>The CRE builds the regulated tariff by adding up costs, under article L. 337-6 of the Energy Code: energy bought at market prices, capacity guarantees, use of the networks, sales costs and a supplier margin. Since regulated access to historic nuclear power (ARENH) ended on 31 December 2025, that energy block is bought entirely on the markets, as the ${h.src('creTrve2026', 'deliberation of 15 July 2026')} points out. The method is meant to let an alternative supplier undercut it: the regulated tariff is a benchmark, not a floor.</p>
<h2>What a discount is really worth</h2>
<p>Most indexed offers advertise a discount on the regulated tariff’s pre-tax kWh price. But the Base kWh at ${h.kwh(B6)} contains ${h.kwh(acc * (1 + tva))} of excise and VAT on the excise, which nobody can discount: the discount applies to ${h.kwh(ht)} before tax, and VAT then falls in proportion. A 10% discount brings the kWh to ${h.kwh(h.M.offreRemisee('base', { kwh: 1000, kva: 6, chauffage: 0, partHC: 0 }, 0.1).kwhMoyenOffre)}, only ${h.pct(1 - h.M.offreRemisee('base', { kwh: 1000, kva: 6, chauffage: 0, partHC: 0 }, 0.1).kwhMoyenOffre / B6)} off the price paid, and the standing charge, often identical, does not fall.</p>
${h.table(['Household', 'Tarif Bleu per year', '5% discount', '10% discount', '15% discount'], G.map((g) => [`${h.num(g.kwh)} kWh, ${g.o === 'base' ? 'Base' : 'Off-peak'} ${g.kva} kVA`, h.eur(g.trv), h.eur(g.r5), h.eur(g.r10), h.eur(g.r15)]), 'Annual saving incl. tax from an offer discounted on the pre-tax kWh price, same standing charge. 1 August 2026 grid; Off-peak: 35% of use in off-peak hours.', ['l', 'r', 'r', 'r', 'r'])}
<p>The mini calculator does the same with your discount and any higher standing charge: a few euros a month on the standing charge is enough to wipe out a small user’s discount. Check too whether the discount is time-limited, and the indexation: a discount on the regulated tariff follows its rises and falls, an offer indexed on wholesale prices can drift away from it either way.</p>
<h2>When to stay on the regulated tariff</h2>
<p>The regulated tariff has one asset few market offers match: the ${h.a('tarif-tempo', 'Tempo')} option, with a very cheap kWh on blue days, public rules and a calendar run by RTE. A household making the most of it has little to gain elsewhere; our ${h.a('avis-tempo-edf', 'Tempo review')} puts figures on it for five households. The regulated tariff also suits people who do not want to keep an eye on an offer: its price changes by public decision, known in advance, and rose by 2.5% on average on 1 August 2026 according to ${h.src('spTrve2026', 'service-public.fr')}.</p>
<h2>When to look at a market offer</h2>
<p>A discounted offer becomes worthwhile for a Base or Off-peak household that does not want Tempo, as long as the discount is real and lasting. Some market offers also borrow the idea of expensive days, such as ${h.a('zen-flex-edf', 'EDF’s Zen Flex')}, with different hours. To compare them impartially, the ${h.src('mneComparateur', 'national energy ombudsman’s comparison tool')} gives each offer’s price for your consumption. ${h.src('spFournisseur', 'Service-public.fr')} notes that switching is free, with no minimum period and no meter change, and the ${h.src('mneRetourTrv', 'door back to the regulated tariff stays open')} up to 36 kVA.</p>`;
    },
  },
});

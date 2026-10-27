import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Quatre foyers types : accise payée (TVA comprise) et part dans la facture de chaque option. */
const foyers = (h: Helpers) => [[2500, 6, 0], [5000, 6, 0], [9000, 9, 0.5], [14000, 12, 0.65]].map(([kwh, kva, ch]) => {
  const e = { kwh, kva, chauffage: ch, partHC: 0.35 };
  return { kwh, kva, ch, acc: h.M.accisePayee(kwh).ttc, base: h.M.partAccise('base', e).part, hc: h.M.partAccise('hc', e).part, tempo: h.M.partAccise('tempo', e).part };
});

export default defineGuide({
  id: 'accise-electricite',
  group: 'choisir',
  order: 17,
  mini: 'accise',
  miniHref: 'comparateur',
  related: ['prix-kwh', 'comparateur', 'tarif-reglemente-offre-marche', 'cheque-energie', 'tarif-tempo'],
  sources: ['creTrve2026', 'bofipAccise2026', 'grilleEdf', 'spTrve2026'],
  fr: {
    slug: 'accise-electricite',
    nav: 'Accise sur l’électricité',
    card: 'Le taux 2026 de l’accise, ce qu’elle pèse sur votre facture et la baisse attendue en février 2027.',
    title: 'Accise sur l’électricité 2026 : taux et part de la facture',
    description: 'Accise sur l’électricité 2026 : 30,85 € par MWh en février, 30,62 € depuis le 1er août, TVA de 20 % en plus. Ce qu’elle pèse sur votre facture, calcul compris.',
    h1: 'Accise sur l’électricité en 2026 : taux et part de votre facture',
    intro: 'Le taux officiel, la façon dont il s’ajoute au prix du kWh et ce qu’il représente sur une année de consommation.',
    resume: (h) => {
      const A = h.P.accise, F = foyers(h);
      return `L’accise sur l’électricité, qu’on appelait autrefois CSPE, est une taxe due sur chaque kilowattheure consommé, quelle que soit l’option ou le fournisseur. Pour un foyer dont la puissance souscrite ne dépasse pas 36 kVA, elle vaut ${h.eur(A.fevrier_2026, 2)} par mégawattheure hors TVA du 1er février au 31 juillet 2026, puis ${h.eur(A.aout_2026, 2)} depuis le 1er août 2026, soit ${h.kwh(h.P.taxes.accise_kwh_htva)} par kWh. La TVA de 20 % s’applique par-dessus : chaque kWh porte donc ${h.kwh(h.P.taxes.accise_kwh_htva * (1 + h.P.taxes.tva))} d’accise toutes taxes comprises. Le taux combine un tarif normal, indexé sur l’inflation, et une majoration qui finance les surcoûts de l’électricité dans les zones non interconnectées, comme la Corse et l’outre-mer. Sur un foyer de ${h.num(F[1].kwh)} kWh par an, l’accise coûte ${h.eur(F[1].acc)} par an, environ ${h.pct(F[1].base, 0)} d’une facture en option Base. Une nouvelle baisse est prévue au 1er février 2027 par la loi de finances pour 2026 ; son montant n’était pas publié le 27 octobre 2026.`;
    },
    faqs: (h) => [
      { q: 'Pourquoi l’accise a-t-elle baissé au 1er août 2026 ?', a: `La CRE l’explique dans sa délibération du 15 juillet 2026 : la réforme du mécanisme de capacité fait payer deux fois la TVA sur une partie de son coût. L’article 71 de la loi de finances pour 2026 compense cette double imposition par une baisse de l’accise en août 2026, de ${h.eur(h.P.accise.fevrier_2026, 2)} à ${h.eur(h.P.accise.aout_2026, 2)} par MWh, puis une seconde en février 2027.` },
      { q: 'L’accise est-elle la même chez tous les fournisseurs ?', a: 'Oui. C’est une taxe fixée par la loi, pas un prix : EDF au tarif réglementé, un fournisseur alternatif en offre de marché ou une entreprise locale de distribution facturent le même montant par kWh à un foyer de 36 kVA au plus. Une offre « moins chère de 10 % » ne la réduit donc pas ; la remise porte sur le prix hors taxes du fournisseur.' },
      { q: 'Où lire l’accise sur ma facture ?', a: 'Dans le détail des taxes et contributions, sur une ligne « Accise sur l’électricité » ou « Accise sur l’électricité (ex-CSPE) », exprimée en euros par kWh puis multipliée par votre consommation de la période. La TVA de 20 % qui la frappe apparaît dans la ligne de TVA globale, pas à côté de l’accise elle-même.' },
      { q: 'Payer moins d’accise est-il possible pour un particulier ?', a: 'Pas en changeant de contrat : seule la consommation compte. Chaque kWh évité retire l’accise et sa TVA de la facture. Les tarifs réduits du code des impositions sur les biens et services visent des usages professionnels précis, pas les logements. Un foyer modeste peut en revanche recevoir le chèque énergie, qui paie une partie de la facture.' },
    ],
    body: (h) => {
      const A = h.P.accise, F = foyers(h), acc = h.P.taxes.accise_kwh_htva, tva = h.P.taxes.tva;
      const kwhTTC = acc * (1 + tva), B6 = h.P.base.kwh['6'], R = h.P.tempo.kwh.R.hp, BHC = h.P.tempo.kwh.B.hc;
      return `
<h2>Le taux de 2026, période par période</h2>
${h.table(['Période', 'Avant majoration ZNI', 'Taux appliqué, hors TVA', 'Par kWh, TVA comprise'], [
  ['1er janvier - 31 janvier 2026', h.eur(A.janvier_2026_avant_majoration, 2) + ' par MWh', 'taux de 2025 maintenu', '-'],
  ['1er février - 31 juillet 2026', h.eur(A.fevrier_2026_avant_majoration, 2) + ' par MWh', h.eur(A.fevrier_2026, 2) + ' par MWh', h.kwh(A.fevrier_2026 / 1000 * (1 + tva))],
  ['Depuis le 1er août 2026', 'tarif normal en baisse', h.eur(A.aout_2026, 2) + ' par MWh', h.kwh(kwhTTC)],
  ['À partir du 1er février 2027', 'nouvelle baisse prévue', 'non publié au 27 octobre 2026', '-'],
], 'Catégorie « ménages et assimilés », puissance souscrite jusqu’à 36 kVA. Sources : BOFiP (janvier et février), CRE délibération n° 2026-147 et grille EDF (août).', ['l', 'r', 'r', 'r'])}
<p>Les montants de janvier et de février viennent de l’${h.src('bofipAccise2026', 'actualité du BOFiP sur les tarifs d’accise à compter du 1er janvier 2026')} : le projet de loi de finances pour 2026 déplaçant au 1er février la révision annuelle du tarif normal, celui-ci est resté à ${h.eur(A.janvier_2026_avant_majoration, 2)} par MWh en janvier, puis a été indexé à ${h.eur(A.fevrier_2026_avant_majoration, 2)} au 1er février, soit ${h.eur(A.fevrier_2026, 2)} une fois ajoutée la majoration qui finance les zones non interconnectées. Le taux d’août est celui de la ${h.src('creTrve2026', 'délibération de la CRE du 15 juillet 2026')}, repris sur la ${h.src('grilleEdf', 'grille du Tarif Bleu')} : ${h.kwh(acc)} par kWh hors TVA. La CRE précise qu’il additionne un tarif normal en baisse et une majoration élargie par l’article 72 de la loi de finances pour 2026.</p>
<h2>Comment l’accise entre dans le prix du kWh</h2>
<p>Le prix toutes taxes comprises d’un kWh empile trois couches : le prix hors taxes, qui couvre l’énergie, l’acheminement sur les réseaux et la marge du fournisseur ; l’accise ; puis la TVA de 20 %, calculée sur l’ensemble. L’abonnement porte, lui, la contribution tarifaire d’acheminement et sa propre TVA, mais pas d’accise. Sur le kWh de l’option Base à ${h.kwh(B6)}, l’accise et sa TVA représentent ${h.kwh(kwhTTC)}, soit ${h.pct(kwhTTC / B6)} du prix. Sur une heure creuse d’un jour bleu Tempo à ${h.kwh(BHC)}, la même accise pèse ${h.pct(kwhTTC / BHC)} ; sur une heure pleine rouge à ${h.kwh(R)}, à peine ${h.pct(kwhTTC / R)}. Comme elle est fixe par kWh, plus le kWh est bon marché, plus sa part grimpe.</p>
<h2>Ce que l’accise pèse sur une année</h2>
${h.table(['Foyer', 'Accise TTC par an', 'Part en Base', 'Part en Heures creuses', 'Part en Tempo'], F.map((f) => [`${h.num(f.kwh)} kWh, ${f.kva} kVA, chauffage ${h.pct(f.ch, 0)}`, h.eur(f.acc), h.pct(f.base), h.pct(f.hc), h.pct(f.tempo)]), 'Accise au taux du 1er août 2026, TVA comprise. Factures annuelles TTC de la grille du 1er août 2026, abonnement compris, 35 % de la consommation la nuit, sans effort les jours rouges.', ['l', 'r', 'r', 'r', 'r'])}
<p>L’accise suit la consommation au kWh près : ${h.num(F[3].kwh)} kWh paient ${h.num(F[3].kwh / F[1].kwh, 1)} fois l’accise de ${h.num(F[1].kwh)} kWh. Sa part dans la facture dépend en revanche du reste : l’abonnement pèse davantage sur une petite consommation, ce qui dilue l’accise, et les jours rouges Tempo gonflent la facture d’un foyer chauffé à l’électricité sans changer l’accise. Le mini-calculateur reprend ce calcul sur votre consommation, votre option et votre puissance, et montre ce que la baisse d’août vous fait gagner.</p>
<h2>Ce que la baisse d’août change, et ce qu’elle ne change pas</h2>
<p>Passer de ${h.eur(A.fevrier_2026, 2)} à ${h.eur(A.aout_2026, 2)} par MWh fait gagner ${h.kwh((A.fevrier_2026 - A.aout_2026) / 1000 * (1 + tva))} par kWh, TVA comprise : ${h.eur((A.fevrier_2026 - A.aout_2026) / 1000 * (1 + tva) * F[1].kwh, 2)} sur ${h.num(F[1].kwh)} kWh par an. Le même jour, le tarif réglementé a augmenté en moyenne de 2,5 % toutes taxes comprises, selon ${h.src('spTrve2026', 'service-public.fr')}, sous l’effet du coût des réseaux et du nouveau mécanisme de capacité. La baisse de l’accise est donc noyée dans la hausse du prix hors taxes : elle ne fait que compenser, comme la CRE l’indique, la TVA payée deux fois sur le coût de la capacité. Le détail des prix par option se trouve sur la page ${h.a('prix-kwh', 'prix du kWh au tarif bleu')}.</p>
<p>Parce qu’elle est identique chez tous les fournisseurs, l’accise ne joue aucun rôle dans le choix entre ${h.a('tarif-reglemente-offre-marche', 'tarif réglementé et offre de marché')} : une remise annoncée en pourcentage du prix hors taxes ne s’applique jamais sur elle. Elle pèse en revanche sur le budget des foyers modestes, que le ${h.a('cheque-energie', 'chèque énergie')} aide à payer.</p>`;
    },
  },
  en: {
    slug: 'electricity-excise-duty',
    nav: 'Electricity excise duty',
    card: 'The 2026 excise rate on electricity, what it adds to your bill and the cut expected in February 2027.',
    title: 'Electricity Excise Duty France 2026: Rate and Bill Share',
    description: 'France’s electricity excise duty in 2026: €30.85 per MWh from February, €30.62 since 1 August, plus 20% VAT. What it adds to your bill, with a calculator.',
    h1: 'Electricity excise duty in France, 2026: rate and bill share',
    intro: 'The official rate, how it is added to the kWh price and what it comes to over a year of consumption.',
    resume: (h) => {
      const A = h.P.accise, F = foyers(h);
      return `The excise duty on electricity, formerly known as the CSPE, is a tax charged on every kilowatt-hour used, whatever the option or the supplier. For a household with a subscribed power of up to 36 kVA it was ${h.eur(A.fevrier_2026, 2)} per megawatt-hour before VAT from 1 February to 31 July 2026, and ${h.eur(A.aout_2026, 2)} since 1 August 2026, that is ${h.kwh(h.P.taxes.accise_kwh_htva)} per kWh. The 20% VAT is then charged on top, so each kWh carries ${h.kwh(h.P.taxes.accise_kwh_htva * (1 + h.P.taxes.tva))} of excise including tax. The rate combines a standard rate, indexed on inflation, and a surcharge that pays for the extra cost of electricity in non-interconnected areas such as Corsica and the overseas departments. For a household using ${h.num(F[1].kwh)} kWh a year, the excise comes to ${h.eur(F[1].acc)} a year, about ${h.pct(F[1].base, 0)} of a Base option bill. A further cut is due on 1 February 2027 under the 2026 finance act; its amount had not been published on 27 October 2026.`;
    },
    faqs: (h) => [
      { q: 'Why did the excise duty fall on 1 August 2026?', a: `The CRE regulator explains it in its deliberation of 15 July 2026: the reform of the capacity mechanism means VAT is paid twice on part of its cost. Article 71 of the 2026 finance act offsets that double taxation with an excise cut in August 2026, from ${h.eur(h.P.accise.fevrier_2026, 2)} to ${h.eur(h.P.accise.aout_2026, 2)} per MWh, and a second one in February 2027.` },
      { q: 'Is the excise the same with every supplier?', a: 'Yes. It is a tax set by law, not a price: EDF on the regulated tariff, an alternative supplier on a market offer or a local distribution company all bill the same amount per kWh to a household of up to 36 kVA. An offer advertised as 10% cheaper does not reduce it; the discount applies to the supplier’s pre-tax price.' },
      { q: 'Where is the excise on my bill?', a: 'In the breakdown of taxes and contributions, on a line called « Accise sur l’électricité », sometimes followed by « ex-CSPE », shown in euros per kWh and multiplied by your consumption for the period. The 20% VAT charged on it is included in the overall VAT line, not next to the excise itself.' },
      { q: 'Can a household pay less excise?', a: 'Not by changing contract: only consumption counts. Every kWh saved removes the excise and its VAT from the bill. The reduced rates in the tax code cover specific business uses, not homes. A low-income household can, however, receive the chèque énergie, a voucher that pays part of the bill.' },
    ],
    body: (h) => {
      const A = h.P.accise, F = foyers(h), acc = h.P.taxes.accise_kwh_htva, tva = h.P.taxes.tva;
      const kwhTTC = acc * (1 + tva), B6 = h.P.base.kwh['6'], R = h.P.tempo.kwh.R.hp, BHC = h.P.tempo.kwh.B.hc;
      return `
<h2>The 2026 rate, period by period</h2>
${h.table(['Period', 'Before the ZNI surcharge', 'Rate charged, before VAT', 'Per kWh, VAT included'], [
  ['1-31 January 2026', h.eur(A.janvier_2026_avant_majoration, 2) + ' per MWh', '2025 rate kept', '-'],
  ['1 February-31 July 2026', h.eur(A.fevrier_2026_avant_majoration, 2) + ' per MWh', h.eur(A.fevrier_2026, 2) + ' per MWh', h.kwh(A.fevrier_2026 / 1000 * (1 + tva))],
  ['Since 1 August 2026', 'standard rate cut', h.eur(A.aout_2026, 2) + ' per MWh', h.kwh(kwhTTC)],
  ['From 1 February 2027', 'further cut planned', 'not published on 27 October 2026', '-'],
], 'Households and similar users, subscribed power up to 36 kVA. Sources: BOFiP (January and February), CRE deliberation no. 2026-147 and EDF grid (August).', ['l', 'r', 'r', 'r'])}
<p>The January and February figures come from the ${h.src('bofipAccise2026', 'tax administration’s BOFiP note on excise rates from 1 January 2026')}: as the 2026 finance bill moved the yearly revision of the standard rate to 1 February, it stayed at ${h.eur(A.janvier_2026_avant_majoration, 2)} per MWh in January, then was indexed to ${h.eur(A.fevrier_2026_avant_majoration, 2)} on 1 February, or ${h.eur(A.fevrier_2026, 2)} once the surcharge for non-interconnected areas is added. The August rate is the one in the ${h.src('creTrve2026', 'CRE deliberation of 15 July 2026')}, repeated on the ${h.src('grilleEdf', 'Tarif Bleu price grid')}: ${h.kwh(acc)} per kWh before VAT. The CRE notes that it adds a lower standard rate to a surcharge widened by article 72 of the 2026 finance act.</p>
<h2>How the excise enters the kWh price</h2>
<p>The all-in price of a kWh stacks three layers: the pre-tax price, covering energy, use of the networks and the supplier’s margin; the excise; then 20% VAT on the whole. The standing charge carries the transmission contribution (CTA) and its own VAT, but no excise. On the Base option kWh at ${h.kwh(B6)}, excise plus its VAT is ${h.kwh(kwhTTC)}, or ${h.pct(kwhTTC / B6)} of the price. On a Tempo blue-day off-peak hour at ${h.kwh(BHC)}, the same excise is ${h.pct(kwhTTC / BHC)}; on a red peak hour at ${h.kwh(R)}, barely ${h.pct(kwhTTC / R)}. Because it is a fixed amount per kWh, the cheaper the kWh, the larger its share.</p>
<h2>What the excise adds up to over a year</h2>
${h.table(['Household', 'Excise per year incl. VAT', 'Share on Base', 'Share on Off-peak', 'Share on Tempo'], F.map((f) => [`${h.num(f.kwh)} kWh, ${f.kva} kVA, heating ${h.pct(f.ch, 0)}`, h.eur(f.acc), h.pct(f.base), h.pct(f.hc), h.pct(f.tempo)]), 'Excise at the 1 August 2026 rate, VAT included. Annual bills incl. tax from the 1 August 2026 grid, standing charge included, 35% of use at night, no effort on red days.', ['l', 'r', 'r', 'r', 'r'])}
<p>The excise follows consumption to the kWh: ${h.num(F[3].kwh)} kWh pay ${h.num(F[3].kwh / F[1].kwh, 1)} times the excise of ${h.num(F[1].kwh)} kWh. Its share of the bill depends on everything else: the standing charge weighs more on a small consumption, diluting the excise, and Tempo red days push up the bill of an electrically heated home without changing the excise. The mini calculator reruns this on your consumption, option and meter power, and shows what the August cut saves you.</p>
<h2>What the August cut changes, and what it does not</h2>
<p>Going from ${h.eur(A.fevrier_2026, 2)} to ${h.eur(A.aout_2026, 2)} per MWh saves ${h.kwh((A.fevrier_2026 - A.aout_2026) / 1000 * (1 + tva))} per kWh, VAT included: ${h.eur((A.fevrier_2026 - A.aout_2026) / 1000 * (1 + tva) * F[1].kwh, 2)} on ${h.num(F[1].kwh)} kWh a year. The same day, the regulated tariff rose by 2.5% on average including tax, according to ${h.src('spTrve2026', 'service-public.fr')}, driven by network costs and the new capacity mechanism. The excise cut is therefore lost in the rise of the pre-tax price: as the CRE puts it, it only offsets the VAT paid twice on the cost of capacity. Prices by option are on the ${h.a('prix-kwh', 'Tarif Bleu kWh price')} page.</p>
<p>Since it is the same with every supplier, the excise plays no part in choosing between the ${h.a('tarif-reglemente-offre-marche', 'regulated tariff and a market offer')}: a discount quoted as a percentage of the pre-tax price never applies to it. It does weigh on low-income households, which the ${h.a('cheque-energie', 'chèque énergie')} helps to pay.</p>`;
    },
  },
});

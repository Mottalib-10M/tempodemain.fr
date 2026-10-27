import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Plafond de revenu fiscal de référence (RFR/UC × UC) pour quelques foyers types. */
const foyers = (h: Helpers, fr: boolean) => ([[1, 0], [1, 1], [2, 0], [2, 1], [2, 2], [2, 3]] as const).map(([d, a]) => {
  const uc = h.M.ucFoyer(d, a);
  const nom = fr
    ? `${d === 2 ? 'Couple' : 'Personne seule'}${a ? `, ${a} enfant${a > 1 ? 's' : ''}` : ''}`
    : `${d === 2 ? 'Couple' : 'Single person'}${a ? `, ${a} child${a > 1 ? 'ren' : ''}` : ''}`;
  return { nom, uc, plafond: uc * h.P.cheque_energie.plafond_rfr_uc };
});
const tranches = (h: Helpers, fr: boolean) => {
  const S = h.P.cheque_energie.seuils, M = h.P.cheque_energie.montants;
  return S.map((s, i) => [
    i === 0 ? (fr ? `moins de ${h.eur(s)}` : `under ${h.eur(s)}`) : (fr ? `de ${h.eur(S[i - 1])} à moins de ${h.eur(s)}` : `${h.eur(S[i - 1])} to under ${h.eur(s)}`),
    h.eur(M.un[i]), h.eur(M.entre[i]), h.eur(M.deux[i]),
  ]);
};

export default defineGuide({
  id: 'cheque-energie',
  group: 'choisir',
  order: 18,
  mini: 'chequeEnergie',
  miniHref: 'prix-kwh',
  related: ['prix-kwh', 'accise-electricite', 'tarif-tempo', 'compteur-linky', 'tarif-reglemente-offre-marche'],
  sources: ['chequeArrete', 'chequeDecret', 'spCheque', 'mneCheque', 'chequeEnergie', 'grilleEdf'],
  fr: {
    slug: 'cheque-energie',
    nav: 'Chèque énergie 2026',
    card: 'Qui y a droit, le montant selon le revenu et le foyer, et comment l’utiliser pour payer l’électricité.',
    title: 'Chèque énergie 2026 : montant, barème et comment l’utiliser',
    description: 'Chèque énergie 2026 : 48 à 277 € selon le revenu fiscal par unité de consommation, plafond 11 000 €. Calcul du montant et mode d’emploi pour payer la facture.',
    h1: 'Chèque énergie 2026 : montant, barème et mode d’emploi',
    intro: 'Le barème officiel, le calcul des unités de consommation, le calendrier 2026 et la façon de s’en servir pour payer l’électricité.',
    resume: (h) => {
      const C = h.P.cheque_energie, M = C.montants;
      return `Le chèque énergie est une aide de l’État pour payer les dépenses d’énergie du logement : facture d’électricité ou de gaz, fioul, bois, ou charges de chauffage d’un logement social. En ${C.annee}, il revient aux foyers dont le revenu fiscal de référence de ${C.rfr_annee}, celui des revenus ${C.revenus_annee}, est inférieur à ${h.eur(C.plafond_rfr_uc)} par unité de consommation. Le premier déclarant compte pour 1 unité, le second ou, à défaut, la première personne à charge pour 0,5, chacune des autres personnes pour 0,3. Le montant va de ${h.eur(Math.min(...M.un))} à ${h.eur(Math.max(...M.deux))} selon la tranche de revenu et la taille du foyer, avec un seul chèque par logement. L’envoi automatique a commencé en avril ${C.annee}, avec une seconde vague en mai ; un foyer éligible qui n’a rien reçu doit le demander sur chequeenergie.gouv.fr. Pour payer l’électricité, on l’envoie à son fournisseur avec son numéro client, ou on le règle en ligne ; un chèque de ${C.annee} reste valable jusqu’au ${h.date(C.fin_validite)}.`;
    },
    faqs: (h) => [
      { q: 'Je n’ai pas reçu de chèque énergie cette année, que faire ?', a: `Si votre revenu fiscal par unité de consommation est sous ${h.eur(h.P.cheque_energie.plafond_rfr_uc)}, faites la demande sur chequeenergie.gouv.fr, avec votre numéro fiscal et une attestation de contrat d’électricité. Depuis 2025, une partie des foyers éligibles n’est plus repérée automatiquement : l’Agence de services et de paiement croise les fichiers fiscaux avec ceux des gestionnaires de réseau et des fournisseurs, et quand ce croisement ne retrouve pas votre contrat, par exemple après un déménagement, rien n’est envoyé.` },
      { q: 'Peut-on payer une facture EDF au tarif Tempo avec le chèque énergie ?', a: 'Oui. Le chèque paie toute facture d’électricité, quelle que soit l’option : Base, Heures creuses ou Tempo, au tarif réglementé comme en offre de marché : le fournisseur doit simplement avoir adhéré au dispositif, et l’annuaire du site officiel permet de le vérifier. Indiquez au dos votre numéro client, ou réglez en ligne : le montant est déduit des factures ou mensualités suivantes.' },
      { q: 'Le chèque papier peut-il être fractionné entre deux fournisseurs ?', a: 'Non : un chèque papier s’utilise en une seule fois, chez un seul professionnel. Le trop-perçu reste au crédit de votre compte client chez ce fournisseur. Le e-chèque énergie, activé depuis l’espace bénéficiaire, peut en revanche être utilisé en plusieurs fois et chez plusieurs fournisseurs d’énergie, pour les factures payées en ligne.' },
      { q: 'Quels droits le chèque énergie ouvre-t-il en plus du paiement ?', a: `Avec l’attestation jointe au chèque : mise en service gratuite en électricité et en gaz, absence de frais en cas de rejet de paiement, frais réduits en cas d’intervention pour impayé, et pas de réduction de puissance pendant la trêve hivernale. Ces droits courent jusqu’au ${h.date(h.P.cheque_energie.droits_jusqu_au)} pour un chèque de ${h.P.cheque_energie.annee}.` },
    ],
    body: (h) => {
      const C = h.P.cheque_energie, F = foyers(h, true), ex = h.M.chequeEnergie(20000, h.M.ucFoyer(2, 2));
      const fac = h.M.coutOption('base', { kwh: 4000, kva: 6, chauffage: 0, partHC: 0 }).total;
      return `
<h2>Le barème 2026</h2>
${h.table(['Revenu fiscal par unité de consommation', '1 unité', 'Entre 1 et 2 unités', '2 unités ou plus'], tranches(h, true), 'Montant TTC du chèque énergie, arrêté du 31 juillet 2025, article 2. Au-delà de 11 000 € par unité, pas de chèque.', ['l', 'r', 'r', 'r'])}
<p>Le barème est fixé par l’${h.src('chequeArrete', 'arrêté du 31 juillet 2025')}, publié au Journal officiel du 1er août 2025, et n’a pas bougé depuis : le chèque ${C.annee} est calculé sur la même grille, avec le revenu fiscal de référence ${C.rfr_annee}, selon la ${h.src('mneCheque', 'fiche du médiateur national de l’énergie')}. Le revenu fiscal de référence se lit en première page de l’avis d’impôt ${C.rfr_annee}. Le calcul des unités de consommation vient de l’article R. 124-1 du code de l’énergie, réécrit par le ${h.src('chequeDecret', 'décret n° 2025-735')} : les valeurs de 0,5 et de 0,3 sont divisées par deux pour un enfant mineur en résidence alternée.</p>
<h2>Les plafonds de revenu selon le foyer</h2>
${h.table(['Foyer fiscal', 'Unités de consommation', 'Revenu fiscal de référence maximal'], F.map((f) => [f.nom, h.num(f.uc, 1), `moins de ${h.eur(f.plafond)}`]), `Plafond de ${h.eur(C.plafond_rfr_uc)} par unité multiplié par le nombre d’unités. Enfants à charge, sans résidence alternée.`, ['l', 'r', 'r'])}
<p>Un exemple : un couple avec deux enfants compte ${h.num(h.M.ucFoyer(2, 2), 1)} unités. Avec un revenu fiscal de référence de ${h.eur(20000)}, il dispose de ${h.eur(ex.rfrUc)} par unité, dans la dernière tranche : son chèque vaut ${h.eur(ex.montant)}. Le mini-calculateur fait ce calcul pour votre foyer et le rapporte à une facture d’électricité ; pour ${h.num(4000)} kWh en option Base 6 kVA, la facture annuelle atteint ${h.eur(fac)}, et le chèque le plus élevé, ${h.eur(Math.max(...C.montants.deux))}, en couvre ${h.pct(Math.max(...C.montants.deux) / fac, 0)}.</p>
<h2>Comment utiliser le chèque énergie pour l’électricité</h2>
<ul>
<li><strong>Par courrier</strong> : inscrivez au dos votre numéro client, celui de vos factures, et envoyez-le au fournisseur avec la copie d’une facture ou de l’échéancier si vous êtes mensualisé. Un chèque papier ne s’utilise qu’une fois.</li>
<li><strong>En ligne</strong> : sur le ${h.src('chequeEnergie', 'site officiel du chèque énergie')}, rubrique paiement en ligne, avec le code à gratter du chèque. Une fois gratté, le chèque papier ne peut plus être posté.</li>
<li><strong>En e-chèque</strong> : en activant le service depuis l’espace bénéficiaire, les chèques suivants arrivent sous forme numérique et peuvent être répartis entre plusieurs factures.</li>
</ul>
<p>Le montant non utilisé reste au crédit du compte client et passe sur les factures suivantes ; selon la ${h.src('spCheque', 'fiche F33667 de service-public.fr')}, il n’est remboursé qu’à la fin du contrat. Pour le fioul ou le bois, on remet le chèque au vendeur, sans remboursement possible. Depuis le 15 février 2025, le chèque ne finance plus les travaux de rénovation.</p>
<h2>Calendrier 2026 et dates limites</h2>
<p>Les chèques ${C.annee} ont été envoyés à partir d’avril, puis en mai pour les foyers repérés après la première vague. La demande se fait au cours de l’année concernée : le code de l’énergie n’inscrit sur la liste des bénéficiaires que les demandes déposées dans l’année. Un chèque émis avant le 1er septembre est valable jusqu’au 31 mars de l’année suivante, soit le ${h.date(C.fin_validite)} pour la campagne ${C.annee} ; émis à partir du 1er septembre, il gagne un an. Le numéro vert du chèque énergie est le ${C.numero_vert}.</p>
<p>Le chèque ne baisse pas le prix du kWh, il paie une partie de la facture. Pour réduire la facture elle-même, regardez l’option la moins chère pour votre consommation dans le ${h.a('comparateur', 'comparateur Base, Heures creuses ou Tempo')} et le ${h.a('prix-kwh', 'prix du kWh au tarif bleu')}. Un foyer qui garde un ancien compteur paie en plus une majoration détaillée sur la page ${h.a('compteur-linky', 'compteur Linky')}.</p>`;
    },
  },
  en: {
    slug: 'cheque-energie',
    nav: 'Chèque énergie 2026',
    card: 'Who qualifies, the amount by income and household, and how to use it to pay the electricity bill.',
    title: 'Chèque Énergie 2026: Amount, Income Scale and How to Use It',
    description: 'Chèque énergie 2026, France’s energy voucher: €48-€277 by tax income per consumption unit, €11,000 ceiling. Work out the amount and how to pay a bill with it.',
    h1: 'Chèque énergie 2026: amount, income scale and how to use it',
    intro: 'The official scale, how consumption units are counted, the 2026 timetable and how to use the voucher to pay for electricity.',
    resume: (h) => {
      const C = h.P.cheque_energie, M = C.montants;
      return `The chèque énergie is a French state voucher that pays household energy costs: an electricity or gas bill, heating oil, wood, or the heating charges of a social housing flat. In ${C.annee} it goes to households whose ${C.rfr_annee} reference tax income (revenu fiscal de référence, on the income of ${C.revenus_annee}) is below ${h.eur(C.plafond_rfr_uc)} per consumption unit. The first person filing counts as 1 unit, the second or, failing that, the first dependant as 0.5, and each other person as 0.3. The amount ranges from ${h.eur(Math.min(...M.un))} to ${h.eur(Math.max(...M.deux))} depending on the income band and household size, with one voucher per home. Automatic sending began in April ${C.annee}, with a second wave in May; an eligible household that received nothing has to apply on chequeenergie.gouv.fr. To pay for electricity you send it to your supplier with your customer number, or pay online; a ${C.annee} voucher is valid until ${h.date(C.fin_validite)}.`;
    },
    faqs: (h) => [
      { q: 'I did not receive a chèque énergie this year: what should I do?', a: `If your tax income per consumption unit is below ${h.eur(h.P.cheque_energie.plafond_rfr_uc)}, apply on chequeenergie.gouv.fr with your tax number and a certificate of your electricity contract. Since 2025 some eligible households are no longer picked up automatically: the payment agency matches tax files with those of network operators and suppliers, and when that match does not find your contract, for example after a move, nothing is sent.` },
      { q: 'Can I pay an EDF Tempo bill with the chèque énergie?', a: 'Yes. The voucher pays any electricity bill, whatever the option: Base, Off-peak or Tempo, on the regulated tariff or a market offer: the supplier only has to have joined the scheme, which the directory on the official site lets you check. Write your customer number on the back, or pay online: the amount comes off the next bills or monthly instalments.' },
      { q: 'Can a paper voucher be split between two suppliers?', a: 'No: a paper voucher is used once, with a single business. Any surplus stays as a credit on your account with that supplier. The e-chèque énergie, switched on from the beneficiary account, can however be used in several goes and with several energy suppliers, for bills paid online.' },
      { q: 'What rights come with the voucher besides payment?', a: `With the certificate sent alongside the voucher: free connection for electricity and gas, no charge for a rejected payment, reduced fees for a visit over unpaid bills, and no power reduction during the winter truce. These rights run until ${h.date(h.P.cheque_energie.droits_jusqu_au)} for a ${h.P.cheque_energie.annee} voucher.` },
    ],
    body: (h) => {
      const C = h.P.cheque_energie, F = foyers(h, false), ex = h.M.chequeEnergie(20000, h.M.ucFoyer(2, 2));
      const fac = h.M.coutOption('base', { kwh: 4000, kva: 6, chauffage: 0, partHC: 0 }).total;
      return `
<h2>The 2026 scale</h2>
${h.table(['Tax income per consumption unit', '1 unit', 'Between 1 and 2 units', '2 units or more'], tranches(h, false), 'Voucher amount incl. tax, order of 31 July 2025, article 2. Above €11,000 per unit, no voucher.', ['l', 'r', 'r', 'r'])}
<p>The scale is set by the ${h.src('chequeArrete', 'order of 31 July 2025')}, published in the Journal officiel of 1 August 2025, and has not moved since: the ${C.annee} voucher uses the same grid, with the ${C.rfr_annee} reference tax income, according to the ${h.src('mneCheque', 'national energy ombudsman’s sheet')}. The reference tax income is printed on the first page of the ${C.rfr_annee} tax notice. Consumption units are defined in article R. 124-1 of the Energy Code, rewritten by ${h.src('chequeDecret', 'decree no. 2025-735')}: the 0.5 and 0.3 values are halved for a minor child in shared custody.</p>
<h2>Income ceilings by household</h2>
${h.table(['Tax household', 'Consumption units', 'Maximum reference tax income'], F.map((f) => [f.nom, h.num(f.uc, 1), `under ${h.eur(f.plafond)}`]), `Ceiling of ${h.eur(C.plafond_rfr_uc)} per unit times the number of units. Dependent children, no shared custody.`, ['l', 'r', 'r'])}
<p>An example: a couple with two children counts ${h.num(h.M.ucFoyer(2, 2), 1)} units. With a reference tax income of ${h.eur(20000)}, that is ${h.eur(ex.rfrUc)} per unit, in the top band: the voucher is worth ${h.eur(ex.montant)}. The mini calculator works this out for your household and sets it against an electricity bill; for ${h.num(4000)} kWh on the Base option at 6 kVA, the annual bill comes to ${h.eur(fac)}, and the largest voucher, ${h.eur(Math.max(...C.montants.deux))}, covers ${h.pct(Math.max(...C.montants.deux) / fac, 0)} of it.</p>
<h2>How to use the voucher for electricity</h2>
<ul>
<li><strong>By post</strong>: write your customer number, the one on your bills, on the back and send it to the supplier with a copy of a bill or of the payment schedule if you pay monthly. A paper voucher can only be used once.</li>
<li><strong>Online</strong>: on the ${h.src('chequeEnergie', 'official chèque énergie site')}, in the online payment section, with the scratch-off code on the voucher. Once scratched, the paper voucher can no longer be posted.</li>
<li><strong>As an e-voucher</strong>: switch the service on from the beneficiary account and the following vouchers arrive in digital form and can be spread over several bills.</li>
</ul>
<p>Any unused amount stays as a credit on the customer account and goes towards the next bills; according to ${h.src('spCheque', 'service-public.fr sheet F33667')}, it is only refunded when the contract ends. For heating oil or wood you hand the voucher to the seller, with no refund possible. Since 15 February 2025 the voucher no longer pays for renovation work.</p>
<h2>2026 timetable and deadlines</h2>
<p>The ${C.annee} vouchers were sent from April, then in May for households identified after the first wave. Applications must be made during the year concerned: the Energy Code only adds to the beneficiary list the requests filed within that year. A voucher issued before 1 September is valid until 31 March of the next year, that is ${h.date(C.fin_validite)} for the ${C.annee} round; issued from 1 September, it gains a year. The chèque énergie free helpline is ${C.numero_vert}, in French.</p>
<p>The voucher does not lower the kWh price; it pays part of the bill. To cut the bill itself, find the cheapest option for your consumption with the ${h.a('comparateur', 'Base, Off-peak or Tempo comparison')} and the ${h.a('prix-kwh', 'Tarif Bleu kWh price')}. A household still on an old meter also pays a surcharge, explained on the ${h.a('compteur-linky', 'Linky meter')} page.</p>`;
    },
  },
});

import { chequeEnergie, ucFoyer } from '../engine/aides';
import { coutOption } from '../engine/compare';
import { P } from '../engine/params';
import { T, eur, num, pct, type L } from './_kit';
/** Chèque énergie 2026 : montant selon le revenu fiscal de référence et la composition du foyer. */
export default (l: L) => ({
  title: T(l, 'Votre chèque énergie 2026', 'Your 2026 chèque énergie'),
  cta: T(l, 'Voir le prix du kWh au tarif bleu', 'See the Tarif Bleu kWh price'),
  inputs: [
    { id: 'r', label: T(l, 'Revenu fiscal de référence 2025', '2025 reference tax income'), def: 14000, unit: '€', max: 200000 },
    { id: 'd', label: T(l, 'Déclarants', 'People filing'), def: 1, options: [{ value: '1', label: T(l, '1 déclarant', '1 person') }, { value: '2', label: T(l, '2 déclarants (couple)', '2 people (couple)') }] },
    { id: 'a', label: T(l, 'Autres personnes du foyer fiscal', 'Other people in the tax household'), def: 1, unit: T(l, 'pers.', 'people'), max: 12 },
    { id: 'k', label: T(l, 'Consommation d’électricité', 'Electricity use'), def: 4000, unit: 'kWh', max: 100000 },
  ],
  run: ({ r, d, a, k }: Record<string, number>) => {
    const uc = ucFoyer(d, a), c = chequeEnergie(r, uc);
    const facture = coutOption('base', { kwh: k, kva: 6, chauffage: 0, partHC: 0 }).total;
    const C = P.cheque_energie;
    return {
      head: [T(l, 'Montant du chèque énergie 2026', '2026 chèque énergie amount'), c.eligible ? eur(c.montant, l) : T(l, 'non éligible', 'not eligible')] as [string, string],
      rows: [
        [T(l, 'Unités de consommation du foyer', 'Household consumption units'), num(c.uc, l, 1)],
        [T(l, 'Revenu fiscal par unité', 'Tax income per unit'), eur(c.rfrUc, l)],
        [T(l, 'Plafond par unité', 'Ceiling per unit'), eur(C.plafond_rfr_uc, l)],
        [T(l, 'Part d’une facture Base 6 kVA couverte', 'Share of a Base 6 kVA bill covered'), c.eligible && facture > 0 ? pct(Math.min(1, c.montant / facture), l) : pct(0, l)],
      ] as [string, string][],
      note: T(l, 'Barème de l’arrêté du 31 juillet 2025 : 1 unité pour le premier déclarant, 0,5 pour le second ou la première personne à charge, 0,3 pour chacune des autres. Facture : option Base 6 kVA du 1er août 2026, abonnement compris.', 'Scale from the order of 31 July 2025: 1 unit for the first person filing, 0.5 for the second or the first dependant, 0.3 for each other person. Bill: Base option at 6 kVA from 1 August 2026, standing charge included.'),
    };
  },
});

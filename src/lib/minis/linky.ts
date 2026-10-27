import { surcoutSansLinky } from '../engine/aides';
import { P } from '../engine/params';
import { T, eur, type L } from './_kit';
/** Compteur Linky : ce que coûte de garder l'ancien compteur, sur l'abonnement et les interventions. */
const ms = P.linky.prestations_ttc.mise_en_service;
export default (l: L) => ({
  title: T(l, 'Ce que coûte l’ancien compteur', 'What keeping the old meter costs'),
  cta: T(l, 'Voir le prix du kWh et des abonnements', 'See kWh prices and standing charges'),
  inputs: [
    { id: 'i', label: T(l, 'Index transmis à Enedis depuis moins de 12 mois', 'Reading sent to Enedis in the last 12 months'), def: 1, options: [{ value: '1', label: T(l, 'Oui', 'Yes') }, { value: '0', label: T(l, 'Non', 'No') }] },
    { id: 'y', label: T(l, 'Nombre d’années', 'Number of years'), def: 5, unit: T(l, 'ans', 'years'), max: 30 },
    { id: 'm', label: T(l, 'Emménagements sur la période', 'Move-ins over the period'), def: 1, max: 20 },
  ],
  run: ({ i, y, m }: Record<string, number>) => {
    const s = surcoutSansLinky(i === 1);
    const miseEnService = m * (ms.ancien - ms.linky);
    return {
      head: [T(l, 'Surcoût par an sans Linky, TVA comprise', 'Extra cost a year without Linky, VAT included'), eur(s.ttc, l, 2)] as [string, string],
      rows: [
        [T(l, `Sur ${y} ans`, `Over ${y} years`), eur(s.ttc * y, l)],
        [T(l, 'Mises en service plus chères', 'More expensive connections'), eur(miseEnService, l, 2)],
        [T(l, 'Total sur la période', 'Total over the period'), eur(s.ttc * y + miseEnService, l)],
      ] as [string, string][],
      note: T(l, `Majorations HT de la grille Tarif Bleu du 1er août 2026 (${eur(P.taxes.majoration_sans_linky_an_ht, l, 2)} par an sans Linky, ${eur(P.taxes.majoration_sans_index_an_ht, l, 2)} de plus sans index depuis 12 mois), TVA de 20 %. Mise en service : ${eur(ms.ancien, l, 2)} TTC avec un ancien compteur, ${eur(ms.linky, l, 2)} avec Linky (Enedis).`, `Pre-tax surcharges from the 1 August 2026 Tarif Bleu grid (${eur(P.taxes.majoration_sans_linky_an_ht, l, 2)} a year without Linky, ${eur(P.taxes.majoration_sans_index_an_ht, l, 2)} more with no reading for 12 months), 20% VAT. Connection: ${eur(ms.ancien, l, 2)} incl. tax with an old meter, ${eur(ms.linky, l, 2)} with Linky (Enedis).`),
    };
  },
});

import { offreRemisee } from '../engine/aides';
import { PUISSANCES } from '../engine/tarifs';
import { P } from '../engine/params';
import { T, eur, type L } from './_kit';
/** Tarif réglementé ou offre de marché : une offre remisée sur le kWh hors taxes face au tarif bleu. */
export default (l: L) => ({
  title: T(l, 'Tarif réglementé ou offre remisée', 'Regulated tariff or discounted offer'),
  cta: T(l, 'Choisir l’option du tarif bleu', 'Pick the Tarif Bleu option'),
  inputs: [
    { id: 'k', label: T(l, 'Consommation annuelle', 'Annual consumption'), def: 5000, unit: 'kWh', max: 100000 },
    { id: 'p', label: T(l, 'Puissance', 'Meter power'), def: 6, options: PUISSANCES.map((x) => ({ value: String(x), label: `${x} kVA` })) },
    { id: 'r', label: T(l, 'Remise de l’offre sur le kWh hors taxes', 'Offer discount on the pre-tax kWh'), def: 10, unit: '%', max: 50 },
    { id: 'a', label: T(l, 'Abonnement plus cher de', 'Standing charge higher by'), def: 0, unit: T(l, '€/mois', '€/month'), max: 50, decimals: 2 },
  ],
  run: ({ k, p, r, a }: Record<string, number>) => {
    const o = offreRemisee('base', { kwh: k, kva: p, chauffage: 0, partHC: 0 }, r / 100, a);
    return {
      head: [o.gain >= 0 ? T(l, 'L’offre vous fait économiser', 'The offer saves you') : T(l, 'L’offre vous coûte en plus', 'The offer costs you extra'), `${eur(Math.abs(o.gain), l)} ${T(l, 'par an', 'a year')}`] as [string, string],
      rows: [
        [T(l, 'Tarif bleu, option Base', 'Tarif Bleu, Base option'), eur(o.trv, l)],
        [T(l, 'Offre de marché', 'Market offer'), eur(o.offre, l)],
        [T(l, 'Prix du kWh TTC, tarif bleu puis offre', 'kWh price incl. tax, tariff then offer'), `${eur(o.kwhMoyenTRV, l, 4)} / ${eur(o.kwhMoyenOffre, l, 4)}`],
      ] as [string, string][],
      note: T(l, `La remise porte sur le prix hors taxes du kWh ; l’accise (${eur(P.accise.aout_2026, l, 2)} par MWh) et la TVA de 20 % restent dues. Tarif bleu option Base du 1er août 2026, abonnement compris.`, `The discount applies to the pre-tax kWh price; the excise (${eur(P.accise.aout_2026, l, 2)} per MWh) and 20% VAT are still due. Tarif Bleu Base option from 1 August 2026, standing charge included.`),
    };
  },
});

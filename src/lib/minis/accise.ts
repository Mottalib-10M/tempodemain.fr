import { accisePayee, partAccise } from '../engine/aides';
import { P } from '../engine/params';
import { T, eur, pct, type L } from './_kit';
/** Accise sur l'électricité : ce qu'elle pèse dans la facture du foyer, au taux du 1er août 2026. */
const OPTS = ['base', 'hc', 'tempo'] as const;
export default (l: L) => ({
  title: T(l, 'L’accise dans votre facture d’électricité', 'The excise duty in your electricity bill'),
  cta: T(l, 'Comparer Base, Heures creuses et Tempo', 'Compare Base, Off-peak and Tempo'),
  inputs: [
    { id: 'k', label: T(l, 'Consommation annuelle', 'Annual consumption'), def: 5000, unit: 'kWh', max: 100000 },
    { id: 'o', label: T(l, 'Option du tarif bleu', 'Tarif Bleu option'), def: 1, options: [{ value: '1', label: 'Base' }, { value: '2', label: T(l, 'Heures creuses', 'Off-peak') }, { value: '3', label: 'Tempo' }] },
    { id: 'p', label: T(l, 'Puissance', 'Meter power'), def: 6, options: P.puissances.filter((x: number) => x >= P.tempo.kva_min).map((x: number) => ({ value: String(x), label: `${x} kVA` })) },
  ],
  run: ({ k, o, p }: Record<string, number>) => {
    const r = partAccise(OPTS[Math.min(2, Math.max(0, o - 1))], { kwh: k, kva: p, chauffage: 0.5, partHC: 0.35 });
    const avant = accisePayee(k, P.accise.fevrier_2026 / 1000);
    return {
      head: [T(l, 'Accise payée sur l’année, TVA comprise', 'Excise paid over the year, VAT included'), eur(r.accise.ttc, l)] as [string, string],
      rows: [
        [T(l, 'Accise hors TVA', 'Excise before VAT'), eur(r.accise.ht, l, 2)],
        [T(l, 'TVA de 20 % sur l’accise', '20% VAT on the excise'), eur(r.accise.tva, l, 2)],
        [T(l, 'Part de votre facture annuelle TTC', 'Share of your annual bill incl. tax'), pct(r.part, l)],
        [T(l, 'Au taux de février 2026, vous auriez payé', 'At the February 2026 rate you would have paid'), eur(avant.ttc, l, 2)],
      ] as [string, string][],
      note: T(l, `Accise : ${eur(P.accise.aout_2026, l, 2)} par MWh hors TVA depuis le 1er août 2026 (${eur(P.accise.fevrier_2026, l, 2)} de février à juillet). Facture : grille du 1er août 2026, abonnement compris ; Tempo et Heures creuses avec 35 % la nuit et 50 % de chauffage.`, `Excise: ${eur(P.accise.aout_2026, l, 2)} per MWh before VAT since 1 August 2026 (${eur(P.accise.fevrier_2026, l, 2)} from February to July). Bill: 1 August 2026 grid, standing charge included; Tempo and Off-peak with 35% at night and 50% heating.`),
    };
  },
});

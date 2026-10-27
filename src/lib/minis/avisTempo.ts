import { coutOption } from '../engine/compare';
import { P } from '../engine/params';
import { T, eur, pct, type L } from './_kit';
/** Avis sur Tempo : le bilan chiffré d'une année pour le foyer, et ce que pèsent les 22 jours rouges. */
export default (l: L) => ({
  title: T(l, 'Le bilan d’une année Tempo chez vous', 'A year on Tempo in your home'),
  cta: T(l, 'Comparer en détail avec le comparateur', 'Compare in detail'),
  inputs: [
    { id: 'k', label: T(l, 'Consommation annuelle', 'Annual consumption'), def: 9000, unit: 'kWh', max: 100000 },
    { id: 'p', label: T(l, 'Puissance', 'Meter power'), def: 9, options: P.puissances.filter((x: number) => x >= P.tempo.kva_min).map((x: number) => ({ value: String(x), label: `${x} kVA` })) },
    { id: 'c', label: T(l, 'Part du chauffage électrique', 'Electric heating share'), def: 50, unit: '%', max: 100 },
    { id: 'e', label: T(l, 'Heures pleines rouges reportées la nuit', 'Red peak use moved to the night'), def: 25, unit: '%', max: 100 },
  ],
  run: ({ k, p, c, e }: Record<string, number>) => {
    const ent = { kwh: k, kva: p, chauffage: c / 100, partHC: 0.35, effortRouge: e / 100 };
    const t = coutOption('tempo', ent), b = coutOption('base', ent), hc = coutOption('hc', ent);
    const rouge = t.tempo?.find((x) => x.c === 'R'), part = rouge && t.conso > 0 ? rouge.cout / t.conso : 0;
    const ecart = b.total - t.total;
    return {
      head: [ecart >= 0 ? T(l, 'Tempo vous fait gagner, face à la Base', 'Tempo saves you, against Base') : T(l, 'Tempo vous coûte en plus, face à la Base', 'Tempo costs you extra, against Base'), `${eur(Math.abs(ecart), l)} ${T(l, 'par an', 'a year')}`] as [string, string],
      rows: [
        [T(l, 'Facture Tempo', 'Tempo bill'), eur(t.total, l)],
        [T(l, 'Facture Heures creuses', 'Off-peak bill'), eur(hc.total, l)],
        [T(l, `Coût de vos ${P.tempo_regles.jours_rouges} jours rouges`, `Cost of your ${P.tempo_regles.jours_rouges} red days`), rouge ? eur(rouge.cout, l) : '0'],
        [T(l, 'Part du coût de l’énergie payée ces jours-là', 'Share of the energy cost paid on those days'), pct(part, l, 0)],
      ] as [string, string][],
      note: T(l, '35 % de la consommation la nuit ; part du chauffage par couleur tirée d’éCO2mix (RTE). Prix TTC au 1er août 2026, abonnement compris.', '35% of use at night; heating split by colour from RTE éCO2mix data. Prices incl. tax from 1 August 2026, standing charge included.'),
    };
  },
});

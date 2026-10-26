import { coutOption } from '../engine/compare';
import { factureZen, ZEN_PUISSANCES } from '../engine/zenflex';
import { T, eur, type L } from './_kit';
/** Zen Flex face à Tempo et aux Heures creuses, sur la consommation annuelle du foyer. */
export default (l: L) => ({
  title: T(l, 'Zen Flex ou Tempo pour votre consommation', 'Zen Flex or Tempo for your consumption'),
  cta: T(l, 'Comparer aussi Base et Heures creuses', 'Also compare Base and Off-peak'),
  inputs: [
    { id: 'k', label: T(l, 'Consommation annuelle', 'Annual consumption'), def: 9000, unit: 'kWh', max: 100000 },
    { id: 'p', label: T(l, 'Puissance', 'Meter power'), def: 9, options: ZEN_PUISSANCES.map((x) => ({ value: String(x), label: `${x} kVA` })) },
    { id: 'c', label: T(l, 'Part du chauffage électrique', 'Electric heating share'), def: 50, unit: '%', max: 100 },
    { id: 'h', label: T(l, 'Part de 8 h - 13 h et 18 h - 20 h', 'Share at 08:00-13:00 and 18:00-20:00'), def: 40, unit: '%', max: 100 },
  ],
  run: ({ k, p, c, h }: Record<string, number>) => {
    const z = factureZen(k, p, c / 100, h / 100);
    const e = { kwh: k, kva: p, chauffage: c / 100, partHC: 0.35 };
    const t = coutOption('tempo', e), t50 = coutOption('tempo', { ...e, effortRouge: 0.5 }), hc = coutOption('hc', e);
    return {
      head: [T(l, 'Votre facture annuelle en Zen Flex', 'Your annual bill on Zen Flex'), eur(z.total, l)] as [string, string],
      rows: [
        [T(l, 'Tempo, sans rien décaler', 'Tempo, shifting nothing'), eur(t.total, l)],
        [T(l, 'Tempo, moitié des heures rouges décalée', 'Tempo, half of red peak use shifted'), eur(t50.total, l)],
        [T(l, 'Tarif bleu Heures creuses', 'Regulated Off-peak option'), eur(hc.total, l)],
      ] as [string, string][],
      note: T(l, 'Tempo et Heures creuses : 35 % la nuit. Zen Flex : 20 jours Sobriété placés comme les jours rouges. Prix TTC, abonnement compris.', 'Tempo and Off-peak: 35% at night. Zen Flex: 20 Sobriety days placed like red days. Prices incl. tax, standing charge included.'),
    };
  },
});

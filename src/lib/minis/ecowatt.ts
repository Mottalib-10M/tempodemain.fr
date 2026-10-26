import { P } from '../engine/params';
import { T, eur, type L } from './_kit';
/** Ecowatt : le signal n'a pas de prix ; ce que rapporte le même geste selon l'option du foyer. */
export default (l: L) => ({
  title: T(l, 'Ce que rapporte un geste de pointe selon votre option', 'What a peak-hour effort is worth on your option'),
  cta: T(l, 'Comparer Base, Heures creuses et Tempo', 'Compare Base, Off-peak and Tempo'),
  inputs: [
    { id: 'k', label: T(l, 'kWh décalés hors des heures de pointe', 'kWh moved out of peak hours'), def: 5, unit: 'kWh', max: 200 },
    { id: 'j', label: T(l, 'Nombre de jours d’effort dans l’hiver', 'Number of effort days in the winter'), def: 10, unit: T(l, 'jours', 'days'), max: 151 },
  ],
  run: ({ k, j }: Record<string, number>) => {
    const R = P.tempo.kwh.R, E = P.ejp.kwh, Z = P.zen_flex.kwh.sobriete;
    const rouge = k * (R.hp - R.hc), ejp = k * (E.pm - E.hn), zen = k * (Z.hp - Z.hc), hc = k * (P.hc.hp - P.hc.hc);
    return {
      head: [T(l, 'Un jour rouge Tempo, ce geste rapporte', 'On a Tempo red day, this effort saves'), eur(rouge, l, 2)] as [string, string],
      rows: [
        [T(l, `Sur ${j} jours rouges Tempo`, `Over ${j} Tempo red days`), eur(rouge * j, l)],
        [T(l, 'Un jour EJP (pointe vers la nuit 1 h - 7 h)', 'An EJP day (peak to 01:00-07:00)'), eur(ejp, l, 2)],
        [T(l, 'Un jour Sobriété Zen Flex', 'A Zen Flex Sobriety day'), eur(zen, l, 2)],
        [T(l, 'Un jour en option Heures creuses', 'A day on the Off-peak option'), eur(hc, l, 2)],
      ] as [string, string][],
      note: T(l, 'Le signal Ecowatt n’a pas de prix : seul le contrat du foyer en donne un. Prix TTC des grilles EDF en vigueur (Tempo et EJP : 1er août 2026 ; Zen Flex : 15 septembre 2026).', 'The Ecowatt signal has no price: only the household’s contract gives it one. Prices incl. tax from the current EDF grids (Tempo and EJP: 1 August 2026; Zen Flex: 15 September 2026).'),
    };
  },
});

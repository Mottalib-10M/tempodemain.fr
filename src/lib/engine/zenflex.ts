/**
 * Offre de marché EDF « Zen Week-End - Option Flex » (dite Zen Flex) : grille EDF applicable aux
 * nouvelles souscriptions à compter du 15 septembre 2026 (data/params-2026.json). Fonctions pures.
 */
import { P } from './params';
import { partsCouleur } from './compare';

export const ZEN_PUISSANCES: number[] = Object.keys(P.zen_flex.abo).map(Number).sort((a, b) => a - b);
export const aboAnnuelZen = (kva: number) => (P.zen_flex.abo as Record<string, number>)[String(kva)] * 12;

/** Coût d'une journée Zen Flex : `partHP` = part de la journée consommée de 8 h à 13 h et de 18 h à 20 h. */
export function coutJourZen(kwhJour: number, partHP: number, sobriete: boolean) {
  const p = sobriete ? P.zen_flex.kwh.sobriete : P.zen_flex.kwh.eco, n = Math.min(1, Math.max(0, partHP));
  return kwhJour * (n * p.hp + (1 - n) * p.hc);
}

/**
 * Facture annuelle Zen Flex. Hypothèse (publiée sur la page) : EDF place ses 20 jours Sobriété sur
 * des jours de semaine froids, comme RTE ses 22 jours rouges ; ils reçoivent la même part de la
 * consommation que les jours rouges du profil éCO2mix du site, ramenée de 22 à 20 jours.
 */
export function factureZen(kwh: number, kva: number, chauffage: number, partHP: number) {
  const q = Math.max(0, kwh), part = partsCouleur(chauffage).R * (P.zen_flex.jours_sobriete / P.tempo_regles.jours_rouges);
  const kwhSob = q * part, n = Math.min(1, Math.max(0, partHP));
  const E = P.zen_flex.kwh;
  const conso = (q - kwhSob) * (n * E.eco.hp + (1 - n) * E.eco.hc) + kwhSob * (n * E.sobriete.hp + (1 - n) * E.sobriete.hc);
  const abo = aboAnnuelZen(kva);
  return { abo, conso, total: abo + conso, kwhSob };
}

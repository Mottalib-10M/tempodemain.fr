/**
 * Taxes, aides et contrats autour du tarif bleu (data/params-2026.json) : accise sur l'électricité,
 * chèque énergie 2026, majorations sans Linky, offre de marché remisée face au tarif réglementé.
 * Fonctions pures.
 */
import { P } from './params';
import { coutOption, type Entree } from './compare';
import type { Option } from './tarifs';

const TVA = P.taxes.tva;

/** Accise payée sur une consommation annuelle, au taux en vigueur (€/kWh HTVA), puis TVA sur l'accise. */
export function accisePayee(kwh: number, tauxKwh: number = P.taxes.accise_kwh_htva) {
  const q = Math.max(0, kwh), ht = q * tauxKwh, tva = ht * TVA;
  return { ht, tva, ttc: ht + tva };
}

/** Part de l'accise (TVA sur l'accise comprise) dans la facture TTC d'une option du tarif bleu. */
export function partAccise(o: Option, e: Entree) {
  const r = coutOption(o, e), a = accisePayee(e.kwh);
  return { facture: r.total, accise: a, part: r.total > 0 ? a.ttc / r.total : 0, dispo: r.dispo };
}

/** Unités de consommation du foyer fiscal (art. R. 124-1 du code de l'énergie) : 1 pour le premier
 *  déclarant, 0,5 pour le second (ou, à défaut, la première personne à charge), 0,3 pour chacune des autres. */
export function ucFoyer(declarants: number, autres: number): number {
  const U = P.cheque_energie.uc, n = Math.max(0, Math.floor(autres));
  if (declarants >= 2) return U.premier + U.second + n * U.autres;
  return U.premier + (n > 0 ? U.second + (n - 1) * U.autres : 0);
}

export interface Cheque { uc: number; rfrUc: number; eligible: boolean; tranche: number; montant: number }
/** Chèque énergie 2026 : barème de l'arrêté du 31 juillet 2025 (RFR 2025, revenus 2024). */
export function chequeEnergie(rfr: number, uc: number): Cheque {
  const C = P.cheque_energie, u = Math.max(1, uc), rfrUc = Math.max(0, rfr) / u;
  const tranche = C.seuils.findIndex((s) => rfrUc < s);
  if (tranche < 0) return { uc: u, rfrUc, eligible: false, tranche: -1, montant: 0 };
  const col = u <= 1.0001 ? C.montants.un : u < 2 - 1e-9 ? C.montants.entre : C.montants.deux;
  return { uc: u, rfrUc, eligible: true, tranche, montant: col[tranche] };
}

/** Surcoût annuel TTC d'un compteur d'ancienne génération (grille Tarif Bleu du 1er août 2026). */
export function surcoutSansLinky(indexTransmis: boolean) {
  const T = P.taxes, ht = T.majoration_sans_linky_an_ht + (indexTransmis ? 0 : T.majoration_sans_index_an_ht);
  return { ht, ttc: ht * (1 + TVA) };
}

/**
 * Offre de marché indexée sur le tarif réglementé, avec une remise sur le prix HT du kWh.
 * Prix HT du kWh = prix TTC / (1 + TVA) - accise ; la remise ne touche pas l'accise ni la TVA sur celle-ci.
 * `surcoutAboMois` : écart d'abonnement mensuel TTC de l'offre par rapport au tarif réglementé.
 */
export function offreRemisee(o: 'base' | 'hc', e: Entree, remiseKwhHT: number, surcoutAboMois = 0) {
  const trv = coutOption(o, e), r = Math.min(1, Math.max(0, remiseKwhHT));
  const accTTC = P.taxes.accise_kwh_htva * (1 + TVA);
  const remiseTTC = (trv.conso - Math.max(0, e.kwh) * accTTC) * r;
  const offre = trv.total - remiseTTC + 12 * surcoutAboMois;
  const kwhMoyenTRV = e.kwh > 0 ? trv.conso / e.kwh : 0;
  return { trv: trv.total, offre, gain: trv.total - offre, kwhMoyenTRV, kwhMoyenOffre: e.kwh > 0 ? (trv.conso - remiseTTC) / e.kwh : 0, dispo: trv.dispo };
}

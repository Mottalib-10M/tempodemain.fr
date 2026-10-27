/**
 * Cas de référence recalculés à la main (grille EDF du 1er août 2026) et règles Tempo (CRE 2014,
 * RTE). Un écart fait échouer le build (RECETTE §4, §17.4).
 */
import { describe, it, expect } from 'vitest';
import * as M from './index';
import { getSpec, MINIS } from '../mini-specs';

describe('Grille du 1er août 2026', () => {
  it('abonnements et prix lus sur la grille EDF', () => {
    expect(M.aboMensuel('base', 6)).toBe(15.86);
    expect(M.aboMensuel('hc', 3)).toBe(12.13);
    expect(M.aboMensuel('tempo', 6)).toBe(15.80);
    expect(M.aboMensuel('tempo', 36)).toBe(53.76);
    expect(M.prixBase(6)).toBe(0.2001);
    expect(M.prixBase(9)).toBe(0.1985);
    expect(M.prixTempo('R').hp).toBe(0.7295);
    expect(M.prixTempo('B').hc).toBe(0.1356);
  });
  it('Tempo n’existe pas en 3 kVA, la Base est en extinction dès 9 kVA', () => {
    expect(M.disponible('tempo', 3)).toBe(false);
    expect(M.disponible('hc', 3)).toBe(true);
    expect(M.enExtinction('base', 6)).toBe(false);
    expect(M.enExtinction('base', 9)).toBe(true);
    expect(M.disponible('base', 7)).toBe(false);
  });
});

describe('Comparateur : cas recalculés à la main', () => {
  // 8 000 kWh, 6 kVA, 35 % en heures creuses, sans chauffage (parts 300/365, 43/365, 22/365).
  const e = { kwh: 8000, kva: 6, chauffage: 0, partHC: 0.35 };
  it('Base : 15,86 × 12 + 8 000 × 0,2001 = 1 791,12 €', () => expect(M.coutOption('base', e).total).toBeCloseTo(1791.12, 2));
  it('Heures creuses : 190,32 + 8 000 × (0,35 × 0,1589 + 0,65 × 0,2142) = 1 749,08 €', () => expect(M.coutOption('hc', e).total).toBeCloseTo(1749.08, 2));
  it('Tempo sans chauffage : 1 632,83 €', () => expect(M.coutOption('tempo', e).total).toBeCloseTo(1632.83, 2));
  it('Tempo avec la moitié des heures pleines rouges reportées : 1 543,82 €', () => expect(M.coutOption('tempo', { ...e, effortRouge: 0.5 }).total).toBeCloseTo(1543.82, 2));
  it('sans Linky : + 40,08 € HT × 1,2 = 48,10 € TTC par an, sur chaque option, classement inchangé', () => {
    expect(M.majorationHT('sansLinky')).toBe(40.08); expect(M.majorationHT('linky')).toBe(0);
    expect(M.coutOption('base', { ...e, majorationHT: 40.08 }).total).toBeCloseTo(1791.12 + 48.096, 3);
    expect(M.comparer({ ...e, majorationHT: 40.08 }).meilleure.o).toBe('tempo');
  });
  it('autoproducteur avec injection : 9,84 € HT → 11,81 € TTC', () => expect(M.coutOption('hc', { ...e, majorationHT: M.majorationHT('autoprod') }).total - 1749.08).toBeCloseTo(11.808, 2));
  it('Base 9 kVA, 4 000 kWh : 19,88 × 12 + 4 000 × 0,1985 = 1 032,56 €', () => expect(M.coutOption('base', { kwh: 4000, kva: 9, chauffage: 0, partHC: 0 }).total).toBeCloseTo(1032.56, 2));
  it('les parts par couleur font 100 %, et le chauffage alourdit les jours rouges', () => {
    const p0 = M.partsCouleur(0), p1 = M.partsCouleur(1);
    expect(p0.B + p0.W + p0.R).toBeCloseTo(1, 6);
    expect(p1.B + p1.W + p1.R).toBeCloseTo(1, 3);
    expect(p1.R).toBeGreaterThan(p0.R * 2);
  });
  it('le classement retient l’option la moins chère disponible', () => {
    const c = M.comparer(e);
    expect(c.meilleure.o).toBe('tempo');
    expect(c.ecart).toBeCloseTo(1791.12 - 1632.83, 1);
    expect(M.comparer({ ...e, kva: 3 }).lignes.find((l) => l.o === 'tempo')!.dispo).toBe(false);
  });
  it('journée rouge de 30 kWh à 35 % en heures creuses : 15,92 €', () => expect(M.coutJour('R', 30, 0.35)).toBeCloseTo(15.921, 3));
  it('part du chauffage : 8 000 kWh par an et 350 kWh en août → 47,5 %', () => expect(M.partChauffage(8000, 350)).toBeCloseTo(0.475, 4));
  it('puissance conseillée : 7,2 kW de pointe → 9 kVA ; 40 kW → 36 kVA', () => { expect(M.puissanceConseillee(7.2)).toBe(9); expect(M.puissanceConseillee(40)).toBe(36); });
});

describe('Calendrier Tempo publié par RTE', () => {
  it('saisons closes : 22 rouges et 43 blancs (18 et 47 en 2019-2020)', () => {
    for (const k of M.seasonKeys()) {
      const y = Number(k.slice(0, 4)), s = M.seasonStats(y);
      if (!s.complete) continue;
      const q = M.quotas(y);
      expect(s.n.R, k).toBe(q.R);
      expect(s.n.W, k).toBe(q.W);
      expect(s.n.B, k).toBe(q.B);
    }
  });
  it('jamais de rouge un week-end, un férié, ni hors novembre-mars ; jamais de blanc un dimanche', () => {
    for (const k of M.seasonKeys()) {
      const y = Number(k.slice(0, 4));
      for (let d = `${y}-09-01`; d < `${y + 1}-09-01`; d = M.addDays(d, 1)) {
        const c = M.colour(d);
        if (c === 'R') expect(M.redPossible(d), d).toBe(true);
        if (c === 'W') expect(M.whitePossible(d), d).toBe(true);
      }
    }
  });
  it('au plus 5 rouges d’affilée', () => { for (const k of M.seasonKeys()) expect(M.seasonStats(Number(k.slice(0, 4))).serieRouge).toBeLessThanOrEqual(5); });
  it('les restes tiennent dans le calendrier : assez de jours ouvrés pour les rouges restants', () => {
    const y = M.seasonStart(M.lastPublished(Number(M.seasonKeys().at(-1)!.slice(0, 4)))!);
    const r = M.remaining(y);
    expect(r.B + r.W + r.R).toBe(r.total);
    expect(M.redSlotsLeft(y)).toBeGreaterThanOrEqual(r.R);
  });
  it('jour Tempo : avant 6 h, c’est encore la couleur de la veille', () => {
    expect(M.tempoDayAt('2026-01-15', 5)).toBe('2026-01-14');
    expect(M.tempoDayAt('2026-01-15', 6)).toBe('2026-01-15');
  });
  it('fériés : lundi de Pâques 2026 le 6 avril, 11 novembre', () => { expect(M.isHoliday('2026-04-06')).toBe(true); expect(M.isHoliday('2026-11-11')).toBe(true); expect(M.isHoliday('2026-11-12')).toBe(false); });
  it('couleurs connues : 4 décembre 2014 premier rouge choisi par RTE', () => { expect(M.colour('2014-12-04')).toBe('R'); expect(M.seasonStats(2014).premierRouge).toBe('2014-12-04'); });
});

describe('Accise, chèque énergie, Linky, offre de marché', () => {
  it('accise : 30,62 €/MWh au 1er août 2026, cohérente avec la grille EDF (3,062 c€/kWh)', () => {
    expect(M.P.accise.aout_2026 / 1000).toBeCloseTo(M.P.taxes.accise_kwh_htva, 8);
    // 5 000 kWh × 0,03062 = 153,10 € HT, + 20 % de TVA = 183,72 €
    const a = M.accisePayee(5000);
    expect(a.ht).toBeCloseTo(153.1, 6); expect(a.ttc).toBeCloseTo(183.72, 6);
  });
  it('unités de consommation : exemple de service-public.fr, 2 parents et 2 enfants = 2,1 UC', () => {
    expect(M.ucFoyer(2, 2)).toBeCloseTo(2.1, 9);
    expect(M.ucFoyer(1, 0)).toBe(1);
    expect(M.ucFoyer(1, 1)).toBeCloseTo(1.5, 9);
    expect(M.ucFoyer(2, 0)).toBeCloseTo(1.5, 9);
  });
  it('chèque énergie : barème de l’arrêté du 31 juillet 2025', () => {
    expect(M.chequeEnergie(48000, 2.1).eligible).toBe(false); // 22 857 € par UC, exemple service-public.fr
    expect(M.chequeEnergie(5000, 1).montant).toBe(194);
    expect(M.chequeEnergie(5700, 1).montant).toBe(146); // 5 700 € pile : tranche suivante
    expect(M.chequeEnergie(10000, 1.5).montant).toBe(176); // 6 667 € par UC
    expect(M.chequeEnergie(21000, 2.1).montant).toBe(76); // 10 000 € par UC
    expect(M.chequeEnergie(11000, 1).eligible).toBe(false);
  });
  it('sans Linky : 40,08 € HT, + 25,62 € HT sans index depuis 12 mois, TVA 20 %', () => {
    expect(M.surcoutSansLinky(true).ttc).toBeCloseTo(48.096, 6);
    expect(M.surcoutSansLinky(false).ttc).toBeCloseTo(78.84, 6);
  });
  it('offre remisée de 10 % sur le kWh HT, Base 6 kVA, 5 000 kWh', () => {
    // (0,2001 - 0,03062 × 1,2) × 5 000 × 10 % = 81,678 €
    const r = M.offreRemisee('base', { kwh: 5000, kva: 6, chauffage: 0, partHC: 0.35 }, 0.1);
    expect(r.gain).toBeCloseTo(81.678, 6);
    expect(M.offreRemisee('base', { kwh: 5000, kva: 6, chauffage: 0, partHC: 0.35 }, 0, 1).gain).toBeCloseTo(-12, 9);
  });
});

describe('Mini-simulateurs', () => {
  for (const kind of Object.keys(MINIS)) for (const l of ['fr', 'en'] as const) {
    it(`${kind} (${l}) rend un résultat sans valeur manquante`, () => {
      const s = getSpec(kind, l);
      const out = s.run(Object.fromEntries(s.inputs.map((i) => [i.id, i.def])));
      expect(out.head[1]).not.toMatch(/NaN|undefined|Infinity/);
      for (const [, v] of out.rows) expect(v).not.toMatch(/NaN|undefined|Infinity/);
    });
  }
});

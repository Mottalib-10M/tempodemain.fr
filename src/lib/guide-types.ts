/**
 * Une page (guide ou page outil) = UN fichier de données dans `src/content/guides/` ou `outils/`.
 * Il porte les deux langues, le texte, la FAQ, les sources, le mini-simulateur et les liens ; le
 * cœur du site (routes, menus, pied de page, sitemap, hreflang, schémas, maillage) le lit seul.
 */
import type { SourceKey, Params } from './engine/params';

export type Lang = 'fr' | 'en';
export type Group = 'tempo' | 'hc' | 'choisir';
export type Tool = 'ejp' | 'comparateur' | 'tarifTempo' | 'joursRestants' | 'demain' | 'historique' | 'heuresCreuses' | 'puissance' | 'prixKwh';
export interface FAQ { q: string; a: string }

/** Outils d'écriture passés au corps : liens internes, nombres au format de la langue, moteur. */
export interface Helpers {
  lang: Lang;
  a: (id: string, text: string) => string;
  eur: (n: number, decimals?: number) => string;
  num: (n: number, decimals?: number) => string;
  pct: (x: number, decimals?: number) => string;
  /** Prix du kWh cité tel que la grille l'écrit, en euros à 4 décimales (« 0,7295 € »). */
  kwh: (n: number) => string;
  date: (iso: string) => string;
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  src: (key: SourceKey, text?: string) => string;
  P: Params;
  M: typeof import('./engine/index');
  /** Jour de référence du build (heure de Paris) : les pages citent la saison en cours à cette date. */
  today: string;
}

export interface PageText {
  slug: string;
  nav: string;
  card: string;
  /** 50 à 60 caractères, terme-clé en tête, année comprise (RECETTE §11). */
  title: string;
  /** 150 à 160 caractères. */
  description: string;
  h1: string;
  intro: string;
  /** Bloc citable : UN paragraphe d'au moins 120 mots (RECETTE §21). */
  resume: (h: Helpers) => string;
  faqs: (h: Helpers) => FAQ[];
  body: (h: Helpers) => string;
}

export interface PageDef {
  id: string;
  group: Group;
  order: number;
  mini?: string;
  miniHref?: string;
  tool?: Tool;
  related: string[];
  sources: SourceKey[];
  fr: PageText;
  en: PageText;
}
export const defineGuide = (g: PageDef): PageDef => g;

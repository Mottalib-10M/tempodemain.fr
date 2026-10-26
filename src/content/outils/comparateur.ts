import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Sensibilité : un foyer de 9 kVA, 8 000 kWh, selon la part de chauffage et l'effort les jours rouges. */
const grille = (h: Helpers) => [0, 0.25, 0.5, 0.65].map((ch) => {
  const e = { kwh: 8000, kva: 9, chauffage: ch, partHC: 0.35 };
  const c = h.M.comparer(e), t0 = c.lignes[2].total, t50 = h.M.coutOption('tempo', { ...e, effortRouge: 0.5 }).total;
  return { ch, base: c.lignes[0].total, hc: c.lignes[1].total, t0, t50 };
});

/** Lecture de la grille, tirée des chiffres (jamais écrite en dur). */
const lecture = (G: ReturnType<typeof grille>, fr: boolean) => {
  const perd = G.find((g) => g.t0 > Math.min(g.base, g.hc)), tient = G.every((g) => g.t50 < Math.min(g.base, g.hc));
  const p = (x: number) => `${Math.round(x * 100)}\u00a0%`;
  return fr
    ? `Sans effort, Tempo passe derrière les Heures creuses ${perd ? `dès ${p(perd.ch)} de chauffage` : 'à aucun niveau de la grille'} ; avec la moitié des heures pleines rouges reportée, il ${tient ? 'reste l’option la moins chère sur toute la grille' : 'redevient compétitif, sans être toujours devant'}.`
    : `With no effort Tempo falls behind Off-peak ${perd ? `from ${p(perd.ch)} heating` : 'at no level of the grid'}; with half of red-day peak use shifted, it ${tient ? 'stays the cheapest option across the whole grid' : 'becomes competitive again without always leading'}.`;
};

export default defineGuide({
  id: 'comparateur',
  group: 'choisir',
  order: 1,
  tool: 'comparateur',
  related: ['tempo-rentable', 'prix-kwh', 'tarif-tempo', 'chauffage-electrique-tempo', 'puissance-compteur', 'zen-flex-edf', 'ejp-demain'],
  sources: ['grilleEdf', 'creTrve2026', 'eco2mix', 'rteCalendrier'],
  fr: {
    slug: 'base-heures-creuses-ou-tempo',
    nav: 'Base, Heures creuses ou Tempo',
    card: 'Les trois options du tarif bleu, calculées sur votre consommation.',
    title: 'Base, Heures creuses ou Tempo : comparateur gratuit 2026',
    description: 'Base, Heures creuses ou Tempo : quelle option vous coûte le moins en 2026 ? Calcul sur votre consommation, votre chauffage et vos heures creuses, sans compte.',
    h1: 'Base, Heures creuses ou Tempo : quelle option vous coûte le moins ?',
    intro: 'Entrez votre consommation annuelle et votre puissance : le coût des trois options s’affiche aussitôt, abonnement compris.',
    resume: (h) => `Le tarif bleu réglementé propose trois options. La Base facture chaque kilowattheure au même prix, ${h.kwh(h.P.base.kwh['6'])} en 6 kVA depuis le 1er août 2026. Les Heures creuses facturent ${h.kwh(h.P.hc.hc)} pendant huit heures choisies par Enedis et ${h.kwh(h.P.hc.hp)} le reste du temps, pour le même abonnement. Tempo, à partir de ${h.num(h.P.tempo.kva_min)} kVA, offre des prix plus bas 343 jours par an, mais facture ${h.kwh(h.P.tempo.kwh.R.hp)} les heures pleines des ${h.num(h.P.tempo_regles.jours_rouges)} jours rouges. Le bon choix dépend donc de trois choses : la part de votre consommation qui sert au chauffage, celle que vous placez la nuit, et ce que vous acceptez de décaler les jours rouges. Le comparateur les prend toutes les trois, et répartit votre chauffage sur les couleurs comme la consommation de chauffage nationale mesurée par RTE.`,
    faqs: (h) => [
      { q: 'Comment connaître ma part de consommation en heures creuses ?', a: 'Votre facture en option Heures creuses donne deux index, heures pleines et heures creuses : divisez le second par le total. Sans facture HP/HC, votre espace client ou l’application du compteur Linky affichent la consommation par demi-heure, ce qui permet de faire le compte. Un ballon d’eau chaude piloté la nuit fait à lui seul monter cette part : la sienne se lit sur l’étiquette du ballon ou dans le suivi Linky, heure par heure.' },
      { q: 'Pourquoi le comparateur demande-t-il un mois d’été ?', a: 'Un mois sans chauffage donne votre socle : réfrigérateur, cuisson, eau chaude, éclairage. Douze fois ce mois, retranché de la consommation annuelle, donne la part du chauffage. C’est elle qui pèse sur les jours rouges, puisque ceux-ci tombent par grand froid. Sans cette information, un simulateur répartit tout au prorata des jours et sous-estime le coût des jours rouges pour une maison chauffée.' },
      { q: 'Que veut dire « reporter les heures pleines » un jour rouge ?', a: 'C’est la part de ce que vous auriez consommé entre 6 h et 22 h que vous déplacez après 22 h ou que vous évitez : chauffage réduit en journée, machines lancées le soir, recharge différée. Avec la moitié reportée, un foyer chauffé à l’électricité gagne souvent plus de cent euros par an sur Tempo. Choisissez « Rien » si vous ne voulez rien changer.' },
      { q: 'Le comparateur tient-il compte des taxes ?', a: `Oui. Les prix de la grille sont toutes taxes comprises : ils incluent l’acheminement, l’accise sur l’électricité (${h.kwh(h.P.taxes.accise_kwh_htva)} par kWh hors TVA au 1er août 2026), la contribution tarifaire d’acheminement et la TVA à 20 %. Le total affiché correspond donc à ce que vous paieriez sur un an au tarif réglementé, hors majorations particulières comme l’absence de compteur Linky.` },
      { q: 'Puis-je comparer une offre de marché avec ce calcul ?', a: 'Le calcul suit le tarif réglementé, qui sert de référence à la plupart des offres. Une offre de marché « Tempo » ou « heures creuses » n’a pas forcément les mêmes prix ni les mêmes jours : relevez ses prix sur sa fiche descriptive et comparez-les à la grille de la page prix du kWh. Le site ne vend aucune offre et ne transmet votre profil à personne.' },
    ],
    body: (h) => {
      const G = grille(h);
      return `
<h2>Ce que le calcul fait de vos réponses</h2>
<p>La consommation annuelle est découpée en deux. Le socle, douze fois votre mois d’été, se répartit à plat sur l’année : ${h.num(h.P.tempo_regles.jours_bleus_annee_365)} jours bleus, ${h.num(h.P.tempo_regles.jours_blancs)} blancs, ${h.num(h.P.tempo_regles.jours_rouges)} rouges. Le chauffage suit le profil de froid mesuré par RTE : ${h.pct(h.M.PROFIL_CHAUFFAGE.R)} tombe les jours rouges, ${h.pct(h.M.PROFIL_CHAUFFAGE.W)} les jours blancs, en moyenne des ${h.num(h.M.PROFIL_SAISONS)} saisons closes de ${h.src('eco2mix', 'éCO2mix')}. Chaque kWh est ensuite facturé au prix de sa couleur et de son heure. L’abonnement de chaque option, pour votre puissance, s’ajoute au total.</p>
<p>La Base n’est plus ouverte aux nouveaux contrats au-delà de 6 kVA : le comparateur la calcule quand même pour ceux qui l’ont gardée et la signale d’un astérisque. Tempo n’existe pas en 3 kVA ; à cette puissance, seules la Base et les Heures creuses, ouvertes aux 3 kVA depuis le 1er août 2026, sont comparées.</p>
<h2>Le même foyer, quatre niveaux de chauffage</h2>
${h.table(['Part du chauffage', 'Base', 'Heures creuses', 'Tempo', 'Tempo, moitié reportée'], G.map((g) => [h.pct(g.ch, 0), h.eur(g.base), h.eur(g.hc), h.eur(g.t0), h.eur(g.t50)]), 'Maison de 9 kVA, 8 000 kWh par an, 35 % en heures creuses. Coût annuel TTC, abonnement compris.', ['l', 'r', 'r', 'r', 'r'])}
<p>Plus le chauffage pèse, plus les jours rouges coûtent, et plus l’effort compte. ${lecture(G, true)} Le guide ${h.a('tempo-rentable', 'Tempo est-il rentable pour vous')} calcule ce seuil sur votre propre consommation.</p>
<h2>Les limites du calcul</h2>
<p>Votre chauffage ne suit pas exactement la courbe nationale : une maison très bien isolée chauffe moins par grand froid que la moyenne, une maison mal isolée davantage. Les jours rouges d’une saison réelle dépendent de l’hiver ; le profil retenu est une moyenne de douze hivers. Le calcul ne connaît pas non plus vos heures creuses exactes, seulement la part que vous lui donnez. Pour un résultat au plus près, entrez les index d’une année de facture Tempo sur la page ${h.a('tarif-tempo', 'tarif Tempo')}. Le comparateur s’en tient aux trois options ouvertes du Tarif Bleu : l’ancienne option EJP est chiffrée face à Tempo sur la page ${h.a('ejp-demain', 'EJP demain')}, l’offre de marché d’EDF sur ${h.a('zen-flex-edf', 'Zen Flex')}.</p>`;
    },
  },
  en: {
    slug: 'base-off-peak-or-tempo',
    nav: 'Base, Off-peak or Tempo',
    card: 'The three options of the regulated tariff, worked out on your use.',
    title: 'Base, Off-peak or Tempo: Free 2026 Electricity Comparison',
    description: 'Base, Off-peak or Tempo: which French electricity option costs you least in 2026? Worked out on your use, heating and off-peak share, with no sign-up.',
    h1: 'Base, Off-peak or Tempo: which option costs you least?',
    intro: 'Enter your annual consumption and meter power: the cost of all three options appears at once, standing charge included.',
    resume: (h) => `France’s regulated blue tariff comes with three options. Base bills every kilowatt-hour at one price, ${h.kwh(h.P.base.kwh['6'])} at 6 kVA since 1 August 2026. Off-peak (HP/HC) bills ${h.kwh(h.P.hc.hc)} during eight hours set by Enedis and ${h.kwh(h.P.hc.hp)} the rest of the time, for the same standing charge. Tempo, from ${h.num(h.P.tempo.kva_min)} kVA, offers lower prices 343 days a year but charges ${h.kwh(h.P.tempo.kwh.R.hp)} at peak time on the ${h.num(h.P.tempo_regles.jours_rouges)} red days. The right choice therefore depends on three things: how much of your use goes on heating, how much you place at night, and how much you are willing to shift on red days. The comparison takes all three into account, and spreads your heating over the colours the way national heating demand measured by RTE spreads.`,
    faqs: (h) => [
      { q: 'How do I find my off-peak share?', a: 'An Off-peak bill shows two meter readings, peak and off-peak: divide the second by the total. Without an HP/HC bill, your online account or the Linky meter app shows consumption half-hour by half-hour, which lets you add it up. A water heater running at night raises that share on its own: its consumption shows on the Linky hourly data.' },
      { q: 'Why does the tool ask for a summer month?', a: 'A month without heating gives your baseline: fridge, cooking, hot water, lighting. Twelve times that month, taken away from the annual total, gives the heating share. Heating is what weighs on red days, since they fall in hard frost. Without it a calculator spreads everything in proportion to days and underestimates the cost of red days for a heated house.' },
      { q: 'What does “shift peak use” mean on a red day?', a: 'It is the share of what you would have used between 06:00 and 22:00 that you move after 22:00 or simply avoid: heating turned down during the day, appliances run in the evening, charging put off. With half shifted, an electrically heated household often saves over a hundred euros a year on Tempo. Pick “Nothing” if you would rather change nothing.' },
      { q: 'Are taxes included in the result?', a: `Yes. The grid prices include all taxes: network charges, the electricity excise duty (${h.kwh(h.P.taxes.accise_kwh_htva)} per kWh before VAT from 1 August 2026), the network access contribution (CTA) and 20% VAT. The total shown is what you would pay over a year on the regulated tariff, leaving aside special surcharges such as having no Linky meter.` },
      { q: 'Can I use this to compare a market offer?', a: 'The calculation follows the regulated tariff, which most offers use as their benchmark. A market “Tempo” or off-peak offer may not have the same prices or the same days: take its prices from its product sheet and compare them with the grid on the price-per-kWh page. The site sells no offer and passes your profile to nobody.' },
    ],
    body: (h) => {
      const G = grille(h);
      return `
<h2>What the calculation does with your answers</h2>
<p>Annual consumption is split in two. The baseline, twelve times your summer month, is spread evenly over the year: ${h.num(h.P.tempo_regles.jours_bleus_annee_365)} blue days, ${h.num(h.P.tempo_regles.jours_blancs)} white, ${h.num(h.P.tempo_regles.jours_rouges)} red. Heating follows the cold-weather profile measured by RTE: ${h.pct(h.M.PROFIL_CHAUFFAGE.R)} falls on red days and ${h.pct(h.M.PROFIL_CHAUFFAGE.W)} on white days, averaged over the ${h.num(h.M.PROFIL_SAISONS)} completed seasons of ${h.src('eco2mix', 'éCO2mix')}. Each kWh is then billed at the price of its colour and hour, and each option’s standing charge for your power is added.</p>
<p>Base is closed to new contracts above 6 kVA: the tool still works it out for those who kept it and flags it with an asterisk. Tempo does not exist at 3 kVA; at that power only Base and Off-peak, open to 3 kVA since 1 August 2026, are compared.</p>
<h2>The same household at four heating levels</h2>
${h.table(['Heating share', 'Base', 'Off-peak', 'Tempo', 'Tempo, half shifted'], G.map((g) => [h.pct(g.ch, 0), h.eur(g.base), h.eur(g.hc), h.eur(g.t0), h.eur(g.t50)]), 'House at 9 kVA, 8,000 kWh a year, 35% off-peak. Annual cost including tax and standing charge.', ['l', 'r', 'r', 'r', 'r'])}
<p>The more heating weighs, the more red days cost and the more effort matters. ${lecture(G, false)} The guide ${h.a('tempo-rentable', 'does Tempo pay off for you')} works out that threshold on your own figures.</p>
<h2>Limits of the calculation</h2>
<p>Your heating does not follow the national curve exactly: a very well insulated house heats less than average in a cold snap, a poorly insulated one more. A real season’s red days depend on the winter; the profile used is an average of twelve winters. Nor does the calculation know your exact off-peak hours, only the share you give it. For the closest result, enter a year of Tempo meter readings on the ${h.a('tarif-tempo', 'Tempo prices')} page. The comparison sticks to the three open Tarif Bleu options: the old EJP option is priced against Tempo on ${h.a('ejp-demain', 'EJP tomorrow')}, and EDF’s market offer on ${h.a('zen-flex-edf', 'Zen Flex')}.</p>`;
    },
  },
});

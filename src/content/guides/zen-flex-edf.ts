import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Trois foyers : Zen Flex (40 % de la consommation en heures pleines Zen Flex) face à Tempo et aux Heures creuses. */
const foyers = (h: Helpers) => [[5000, 6, 0], [9000, 9, 0.5], [14000, 12, 0.65]].map(([kwh, kva, ch]) => {
  const e = { kwh, kva, chauffage: ch, partHC: 0.35 };
  return { kwh, kva, ch, zen: h.M.factureZen(kwh, kva, ch, 0.4).total, t0: h.M.coutOption('tempo', e).total, t50: h.M.coutOption('tempo', { ...e, effortRouge: 0.5 }).total, hc: h.M.coutOption('hc', e).total };
});

export default defineGuide({
  id: 'zen-flex-edf',
  group: 'choisir',
  order: 16,
  mini: 'zenFlex',
  miniHref: 'comparateur',
  related: ['comparateur', 'tarif-tempo', 'tempo-rentable', 'ecowatt', 'ejp-demain'],
  sources: ['zenFlex', 'grilleZen', 'presZenFlex', 'ficheZen', 'grilleEdf'],
  fr: {
    slug: 'zen-flex-edf',
    nav: 'Zen Flex d’EDF',
    card: 'L’offre Zen Flex d’EDF : jours Éco, jours Sobriété, prix vérifiés et comparaison avec Tempo.',
    title: 'Zen Flex EDF : jours Sobriété, prix 2026 et face à Tempo',
    description: 'Zen Flex EDF : 345 jours Éco, 20 jours Sobriété annoncés à 16 h, prix de la grille du 15 septembre 2026 et comparaison chiffrée avec l’option Tempo d’EDF.',
    h1: 'Zen Flex d’EDF : jours Éco, jours Sobriété et Tempo',
    intro: 'Les règles de l’offre, ses prix lus sur la grille d’EDF et le calcul face à Tempo sur votre consommation.',
    resume: (h) => {
      const Z = h.P.zen_flex, T = h.P.tempo.kwh;
      return `Zen Flex est le nom courant de l’offre EDF « Zen Week-End, option Flex », une offre de marché et non un tarif réglementé. Elle découpe l’année en ${Z.jours_eco} jours Éco et ${Z.jours_sobriete} jours Sobriété. Chaque jour, les heures pleines vont de 8 h à 13 h et de 18 h à 20 h ; les ${Z.heures_creuses_par_jour} autres heures sont creuses. Un jour Éco, le kWh coûte ${h.kwh(Z.kwh.eco.hc)} en heures creuses et ${h.kwh(Z.kwh.eco.hp)} en heures pleines. Un jour Sobriété, il passe à ${h.kwh(Z.kwh.sobriete.hc)} en heures creuses et ${h.kwh(Z.kwh.sobriete.hp)} en heures pleines, un peu plus qu’un jour rouge Tempo (${h.kwh(T.R.hp)}). Les jours Sobriété tombent en semaine, hors fériés, du 1er janvier au 15 avril et du 15 octobre au 31 décembre ; EDF les annonce la veille à 16 h. L’offre exige un compteur Linky, ses prix hors taxes peuvent changer deux fois par an et on la quitte sans frais. Face à Tempo, elle se joue sur une question : vos heures de consommation tombent-elles plutôt de 8 h à 13 h et de 18 h à 20 h, ou de 6 h à 22 h ?`;
    },
    faqs: (h) => [
      { q: 'Zen Flex est-il un tarif réglementé comme Tempo ?', a: 'Non. Tempo est une option du Tarif Bleu, dont les prix sont fixés par les pouvoirs publics sur proposition de la CRE. Zen Flex est une offre de marché d’EDF : ses prix hors taxes sont fixés librement par EDF et peuvent bouger jusqu’à deux fois par an, avec un mois de préavis selon la fiche descriptive. Quitter le tarif réglementé pour une offre de marché n’empêche pas d’y revenir.' },
      { q: 'Qui choisit les jours Sobriété, et quand les connaît-on ?', a: 'EDF, qui les annonce la veille : sa page donne rendez-vous à 16 h pour connaître la nature du lendemain, dans l’application EDF & Moi, par SMS ou par courriel. Les jours rouges Tempo, eux, sont choisis par RTE et publiés à 10 h 30.' },
      { q: 'Que sont les jours Bonus ?', a: 'Des jours Éco où EDF demande soit de réduire sa consommation, en cas de tension sur le réseau, soit de la décaler vers une période de forte production. Celui qui suit la consigne reçoit une récompense, qu’EDF limite à quelques euros par an au plus, et EDF ne garantit pas qu’il y en ait chaque année.' },
      { q: 'Faut-il un compteur particulier ?', a: 'Oui, un Linky. La fiche descriptive précise qu’en souscrivant, le client autorise EDF à récupérer chez Enedis sa consommation à la demi-heure et ses index quotidiens, nécessaires pour séparer jours Éco et jours Sobriété. Sans compteur communicant, l’offre n’est pas accessible ; un logement encore équipé d’un ancien compteur doit d’abord passer au Linky auprès d’Enedis.' },
    ],
    body: (h) => {
      const Z = h.P.zen_flex, T = h.P.tempo, F = foyers(h);
      const ab = (o: Record<string, number>, k: number) => o[String(k)];
      return `
<h2>Les règles de l’offre</h2>
${h.table(['', 'Zen Flex (EDF)', 'Tempo (Tarif Bleu)'], [
  ['Nature', 'Offre de marché, prix fixés par EDF', 'Tarif réglementé, prix fixés par les pouvoirs publics'],
  ['Jours chers', `${Z.jours_sobriete} jours Sobriété`, `${h.P.tempo_regles.jours_rouges} jours rouges et ${h.P.tempo_regles.jours_blancs} jours blancs`],
  ['Période des jours chers', '1er janvier - 15 avril et 15 octobre - 31 décembre, en semaine hors fériés', 'Rouges : 1er novembre - 31 mars, en semaine hors fériés'],
  ['Qui les choisit', 'EDF, annonce la veille à 16 h', 'RTE, publication la veille à 10 h 30'],
  ['Heures pleines', '8 h - 13 h et 18 h - 20 h (7 h par jour)', '6 h - 22 h (16 h par jour)'],
  ['Puissances', '6 à 36 kVA', '6 à 36 kVA'],
  ['Compteur', 'Linky obligatoire', `Sans Linky, abonnement majoré de ${h.eur(h.P.taxes.majoration_sans_linky_an_ht, 2)} HT par an`],
], 'Règles lues sur la fiche de présentation et la fiche descriptive EDF de l’option Flex, et sur la délibération CRE Tempo.', ['l', 'l', 'l'])}
<p>Ces règles viennent de la ${h.src('presZenFlex', 'fiche de présentation de l’option Flex')}, de la ${h.src('zenFlex', 'page de l’offre chez EDF')} et de la ${h.src('ficheZen', 'fiche descriptive Zen Week-End')}. EDF y ajoute que les week-ends et jours fériés sont toujours des jours Éco, que les plages d’heures pleines et creuses restent les mêmes un jour Sobriété, et que l’heure creuse d’un jour Éco est, hors taxes, 31 % moins chère que son heure pleine. Le prix hors taxes de l’heure pleine d’un jour Sobriété vaut quatre fois celui d’un jour Éco.</p>
<h2>Les prix de la grille EDF</h2>
${h.table(['Puissance', 'Abonnement Zen Flex', 'Abonnement Tempo'], [6, 9, 12, 15, 18, 24, 30, 36].map((k) => [`${k} kVA`, h.eur(ab(Z.abo as Record<string, number>, k), 2), h.eur(ab(T.abo as Record<string, number>, k), 2)]), 'Abonnements mensuels TTC. Zen Flex : grille EDF applicable aux nouvelles souscriptions à compter du 15 septembre 2026. Tempo : grille Tarif Bleu du 1er août 2026.', ['l', 'r', 'r'])}
${h.table(['Prix du kWh TTC', 'Heures creuses', 'Heures pleines'], [
  ['Zen Flex, jour Éco', h.kwh(Z.kwh.eco.hc), h.kwh(Z.kwh.eco.hp)],
  ['Zen Flex, jour Sobriété', h.kwh(Z.kwh.sobriete.hc), h.kwh(Z.kwh.sobriete.hp)],
  ['Tempo, jour bleu', h.kwh(T.kwh.B.hc), h.kwh(T.kwh.B.hp)],
  ['Tempo, jour blanc', h.kwh(T.kwh.W.hc), h.kwh(T.kwh.W.hp)],
  ['Tempo, jour rouge', h.kwh(T.kwh.R.hc), h.kwh(T.kwh.R.hp)],
], 'Grilles EDF « Zen Week-End » du 15 septembre 2026 et « Tarif Bleu » du 1er août 2026, lues le 26 octobre 2026.', ['l', 'r', 'r'])}
<p>Les prix Zen Flex sont ceux de la ${h.src('grilleZen', 'grille de l’offre Zen Week-End')}, qui regroupe les options Week-End, Heures Creuses + Week-End et Flex ; ceux de Tempo viennent de la ${h.src('grilleEdf', 'grille du Tarif Bleu')}. L’abonnement Zen Flex reprend celui des options Base et Heures creuses du Tarif Bleu, quelques centimes au-dessus de Tempo selon la puissance. Un jour ordinaire, Tempo bleu est moins cher la nuit de 22 h à 6 h et pendant les heures pleines Zen Flex ; Zen Flex l’emporte de 6 h à 8 h, de 13 h à 18 h et de 20 h à 22 h, où son heure creuse à ${h.kwh(Z.kwh.eco.hc)} passe sous l’heure pleine bleue à ${h.kwh(T.kwh.B.hp)}. En échange, Zen Flex n’a que 20 jours chers au lieu de 65 jours rouges ou blancs, et ses heures creuses couvrent l’après-midi et la soirée après 20 h.</p>
<h2>Zen Flex ou Tempo : le calcul</h2>
${h.table(['Foyer', 'Zen Flex', 'Tempo', 'Tempo avec effort'], F.map((f) => [`${h.num(f.kwh)} kWh, ${f.kva} kVA, chauffage ${h.pct(f.ch, 0)}`, h.eur(f.zen), h.eur(f.t0), h.eur(f.t50)]), 'Facture annuelle TTC, abonnement compris. Zen Flex : 40 % de la consommation de 8 h à 13 h et de 18 h à 20 h. Tempo : 35 % la nuit ; « avec effort » : moitié des heures pleines rouges décalée la nuit.', ['l', 'r', 'r', 'r'])}
<p>Le calcul suppose que les 20 jours Sobriété reçoivent la même part de la consommation que les jours rouges Tempo, ramenée de 22 à 20 jours : nous ne connaissons pas encore de saison complète de jours Sobriété pour le vérifier. La part du chauffage qui tombe sur ces jours vient de la consommation nationale ${h.src('eco2mix', 'éCO2mix de RTE')}, comme dans notre ${h.a('comparateur', 'comparateur Base, Heures creuses ou Tempo')}. Le mini-calculateur ci-dessous refait le calcul sur vos chiffres : la part de 8 h à 13 h et de 18 h à 20 h compte autant que la consommation elle-même.</p>
<!--mini:zenFlex-->
<h2>Pour qui chaque offre est faite</h2>
<p>Tempo récompense le foyer qui consomme surtout la nuit, entre 22 h et 6 h, et qui sait réduire sa consommation une vingtaine de jours rouges par hiver : ballon d’eau chaude, voiture électrique, chauffage programmé. Zen Flex récompense le foyer présent l’après-midi, qui peut lancer ses machines entre 13 h et 18 h ou après 20 h, et qui accepte vingt journées très chères en semaine, y compris en avril et en octobre. Le chauffage électrique pèse dans les deux cas : un jour Sobriété comme un jour rouge tombe par grand froid.</p>
<p>Avant de changer, gardez en tête deux différences de fond. Les prix de Tempo suivent le tarif réglementé, fixé par décision publique sur proposition de la CRE ; ceux de Zen Flex sont fixés par EDF, qui peut les réviser deux fois par an, dans une limite de 250 % sur les 12 premiers mois selon la fiche descriptive. Et quitter Tempo pour une offre de marché n’empêche pas d’y revenir. Les jours rouges de Tempo sont détaillés sur ${h.a('tarif-tempo', 'tarif Tempo 2026')}, et la question de la rentabilité sur ${h.a('tempo-rentable', 'Tempo est-il rentable ?')}.</p>`;
    },
  },
  en: {
    slug: 'edf-zen-flex',
    nav: 'EDF Zen Flex',
    card: 'EDF’s Zen Flex offer: Eco days, Sobriety days, checked prices and a comparison with Tempo.',
    title: 'EDF Zen Flex: Sobriety Days, 2026 Prices, Versus Tempo',
    description: 'EDF Zen Flex: 345 Eco days, 20 Sobriety days announced at 16:00, prices from the 15 September 2026 grid and a worked comparison with the Tempo option, no spin.',
    h1: 'EDF Zen Flex: Eco days, Sobriety days and Tempo',
    intro: 'The offer’s rules, its prices read from EDF’s grid and how it compares with Tempo on your own consumption.',
    resume: (h) => {
      const Z = h.P.zen_flex, T = h.P.tempo.kwh;
      return `Zen Flex is the usual name for EDF’s « Zen Week-End, Flex option », a market offer rather than a regulated tariff. It splits the year into ${Z.jours_eco} Eco days and ${Z.jours_sobriete} Sobriety days. Every day, peak hours run from 08:00 to 13:00 and from 18:00 to 20:00; the other ${Z.heures_creuses_par_jour} hours are off-peak. On an Eco day a kWh costs ${h.kwh(Z.kwh.eco.hc)} off-peak and ${h.kwh(Z.kwh.eco.hp)} at peak. On a Sobriety day it rises to ${h.kwh(Z.kwh.sobriete.hc)} off-peak and ${h.kwh(Z.kwh.sobriete.hp)} at peak, slightly more than a Tempo red day (${h.kwh(T.R.hp)}). Sobriety days fall on weekdays, excluding bank holidays, from 1 January to 15 April and from 15 October to 31 December; EDF announces them at 16:00 the day before. The offer requires a Linky meter, its pre-tax prices can change twice a year and you can leave at no cost. Against Tempo, it comes down to one question: does your use fall mainly between 08:00-13:00 and 18:00-20:00, or between 06:00 and 22:00?`;
    },
    faqs: (h) => [
      { q: 'Is Zen Flex a regulated tariff like Tempo?', a: 'No. Tempo is an option of the Tarif Bleu, whose prices are set by the government on a proposal from the CRE regulator. Zen Flex is an EDF market offer: its pre-tax prices are set freely by EDF and can move up to twice a year, with one month’s notice according to the offer sheet. Leaving the regulated tariff for a market offer does not stop you coming back.' },
      { q: 'Who picks the Sobriety days, and when are they known?', a: 'EDF, which announces them the day before: its page says to check at 16:00 for the next day’s type, in the EDF & Moi app, by text or by email. Tempo red days, by contrast, are chosen by RTE and published at 10:30.' },
      { q: 'What are Bonus days?', a: 'Eco days on which EDF asks you either to cut consumption, when the grid is under strain, or to shift it to a period of high generation. Those who follow the request get a reward, which EDF caps at a few euros a year at most, and EDF does not guarantee there will be any in a given year.' },
      { q: 'Do I need a particular meter?', a: 'Yes, a Linky. The offer sheet states that by signing up the customer lets EDF collect half-hourly consumption and daily readings from Enedis, which are needed to separate Eco days from Sobriety days. Without a smart meter the offer is not available; a home still fitted with an old meter first has to move to Linky through Enedis.' },
    ],
    body: (h) => {
      const Z = h.P.zen_flex, T = h.P.tempo, F = foyers(h);
      const ab = (o: Record<string, number>, k: number) => o[String(k)];
      return `
<h2>The offer’s rules</h2>
${h.table(['', 'Zen Flex (EDF)', 'Tempo (Tarif Bleu)'], [
  ['Type', 'Market offer, prices set by EDF', 'Regulated tariff, prices set by the government'],
  ['Expensive days', `${Z.jours_sobriete} Sobriety days`, `${h.P.tempo_regles.jours_rouges} red days and ${h.P.tempo_regles.jours_blancs} white days`],
  ['When they can fall', '1 January-15 April and 15 October-31 December, weekdays excluding bank holidays', 'Red: 1 November-31 March, weekdays excluding bank holidays'],
  ['Who picks them', 'EDF, announced the day before at 16:00', 'RTE, published the day before at 10:30'],
  ['Peak hours', '08:00-13:00 and 18:00-20:00 (7 hours a day)', '06:00-22:00 (16 hours a day)'],
  ['Meter power', '6 to 36 kVA', '6 to 36 kVA'],
  ['Meter', 'Linky required', `Without Linky, standing charge raised by ${h.eur(h.P.taxes.majoration_sans_linky_an_ht, 2)} excl. tax a year`],
], 'Rules read from EDF’s Flex option presentation and offer sheets, and the CRE Tempo deliberation.', ['l', 'l', 'l'])}
<p>These rules come from ${h.src('presZenFlex', 'EDF’s Flex option presentation sheet')}, ${h.src('zenFlex', 'the offer page at EDF')} and ${h.src('ficheZen', 'the Zen Week-End offer sheet')}. EDF adds that weekends and bank holidays are always Eco days, that peak and off-peak hours stay the same on a Sobriety day, and that before tax an off-peak hour on an Eco day is 31% cheaper than its peak hour. The pre-tax peak price on a Sobriety day is four times that of an Eco day.</p>
<h2>Prices from EDF’s grid</h2>
${h.table(['Meter power', 'Zen Flex standing charge', 'Tempo standing charge'], [6, 9, 12, 15, 18, 24, 30, 36].map((k) => [`${k} kVA`, h.eur(ab(Z.abo as Record<string, number>, k), 2), h.eur(ab(T.abo as Record<string, number>, k), 2)]), 'Monthly standing charges incl. tax. Zen Flex: EDF grid for new contracts from 15 September 2026. Tempo: Tarif Bleu grid of 1 August 2026.', ['l', 'r', 'r'])}
${h.table(['kWh price incl. tax', 'Off-peak', 'Peak'], [
  ['Zen Flex, Eco day', h.kwh(Z.kwh.eco.hc), h.kwh(Z.kwh.eco.hp)],
  ['Zen Flex, Sobriety day', h.kwh(Z.kwh.sobriete.hc), h.kwh(Z.kwh.sobriete.hp)],
  ['Tempo, blue day', h.kwh(T.kwh.B.hc), h.kwh(T.kwh.B.hp)],
  ['Tempo, white day', h.kwh(T.kwh.W.hc), h.kwh(T.kwh.W.hp)],
  ['Tempo, red day', h.kwh(T.kwh.R.hc), h.kwh(T.kwh.R.hp)],
], 'EDF « Zen Week-End » grid of 15 September 2026 and « Tarif Bleu » grid of 1 August 2026, read on 26 October 2026.', ['l', 'r', 'r'])}
<p>Zen Flex prices are those of the ${h.src('grilleZen', 'Zen Week-End offer grid')}, which covers the Week-End, Off-peak + Week-End and Flex options; Tempo prices come from the ${h.src('grilleEdf', 'Tarif Bleu grid')}. The Zen Flex standing charge matches the Base and Off-peak options of the Tarif Bleu, a few cents above Tempo depending on meter power. On an ordinary day, Tempo blue is cheaper at night from 22:00 to 06:00 and during Zen Flex peak hours; Zen Flex wins from 06:00 to 08:00, 13:00 to 18:00 and 20:00 to 22:00, when its off-peak rate of ${h.kwh(Z.kwh.eco.hc)} is below the blue peak rate of ${h.kwh(T.kwh.B.hp)}. In return Zen Flex has only 20 expensive days instead of 65 red or white ones, and its off-peak hours cover the afternoon and the evening after 20:00.</p>
<h2>Zen Flex or Tempo: the numbers</h2>
${h.table(['Household', 'Zen Flex', 'Tempo', 'Tempo with effort'], F.map((f) => [`${h.num(f.kwh)} kWh, ${f.kva} kVA, heating ${h.pct(f.ch, 0)}`, h.eur(f.zen), h.eur(f.t0), h.eur(f.t50)]), 'Annual bill incl. tax and standing charge. Zen Flex: 40% of use between 08:00-13:00 and 18:00-20:00. Tempo: 35% at night; « with effort »: half of red peak use shifted to the night.', ['l', 'r', 'r', 'r'])}
<p>The calculation assumes the 20 Sobriety days take the same share of consumption as Tempo red days, scaled from 22 to 20 days: there is no complete season of Sobriety days yet to check it against. The share of heating on those days comes from RTE’s ${h.src('eco2mix', 'éCO2mix')} national consumption, as in our ${h.a('comparateur', 'Base, Off-peak or Tempo comparison')}. The mini calculator below reruns it on your figures: the share between 08:00-13:00 and 18:00-20:00 matters as much as total consumption.</p>
<!--mini:zenFlex-->
<h2>Who each offer suits</h2>
<p>Tempo rewards a household that uses most of its power at night, between 22:00 and 06:00, and can cut back on twenty-odd red days a winter: water heater, electric car, scheduled heating. Zen Flex rewards a household that is home in the afternoon, can run appliances between 13:00 and 18:00 or after 20:00, and accepts twenty very expensive weekdays, including in April and October. Electric heating weighs on both: a Sobriety day, like a red day, comes in cold weather.</p>
<p>Before switching, keep two basic differences in mind. Tempo prices follow the regulated tariff, set by public decision on a proposal from the CRE; Zen Flex prices are set by EDF, which can revise them twice a year, within a 250% limit over the first 12 months according to the offer sheet. And leaving Tempo for a market offer does not stop you returning to it. Tempo’s red days are detailed on ${h.a('tarif-tempo', 'Tempo prices 2026')}, and whether it pays off on ${h.a('tempo-rentable', 'is Tempo worth it?')}.</p>`;
    },
  },
});

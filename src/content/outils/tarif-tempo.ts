import { defineGuide, type Helpers } from '../../lib/guide-types';

const KVA = (h: Helpers) => Object.keys(h.P.tempo.abo).map(Number).sort((a, b) => a - b);
const abo = (h: Helpers, k: number) => h.P.tempo.abo[String(k) as keyof typeof h.P.tempo.abo];
const ratio = (h: Helpers) => h.P.tempo.kwh.R.hp / h.P.tempo.kwh.B.hc;

export default defineGuide({
  id: 'tarif-tempo',
  group: 'tempo',
  order: 4,
  tool: 'tarifTempo',
  related: ['comparateur', 'prix-kwh', 'jours-tempo-restants', 'tempo-rentable', 'puissance-compteur', 'ejp-demain', 'zen-flex-edf', 'avis-tempo-edf'],
  sources: ['grilleEdf', 'creTrve2026', 'creTempo2014', 'rteCalendrier'],
  fr: {
    slug: 'tarif-tempo',
    nav: 'Tarif Tempo 2026',
    card: 'La grille Tempo du 1er août 2026 et votre facture à partir de vos index.',
    title: 'Tarif Tempo 2026 : prix du kWh par couleur et abonnement',
    description: 'Tarif Tempo 2026 : prix TTC du kWh bleu, blanc et rouge, abonnement de 6 à 36 kVA au 1er août, et votre facture annuelle calculée depuis vos six index.',
    h1: 'Tarif Tempo 2026 : prix du kWh et abonnement',
    intro: 'La grille réglementée en vigueur depuis le 1er août 2026, et votre facture d’un an à partir des six index Tempo.',
    resume: (h) => {
      const T = h.P.tempo.kwh;
      return `Le tarif Tempo du tarif bleu réglementé applique six prix du kilowattheure, un par couleur de jour et par période. Depuis le 1er août 2026, toutes taxes comprises, un jour bleu coûte ${h.kwh(T.B.hc)} en heures creuses et ${h.kwh(T.B.hp)} en heures pleines, un jour blanc ${h.kwh(T.W.hc)} et ${h.kwh(T.W.hp)}, un jour rouge ${h.kwh(T.R.hc)} et ${h.kwh(T.R.hp)}. Les heures creuses vont de 22 h à 6 h, les heures pleines de 6 h à 22 h. L’abonnement dépend de la puissance du compteur, de ${h.eur(abo(h, 6), 2)} par mois en 6 kVA à ${h.eur(abo(h, 36), 2)} en 36 kVA ; Tempo n’est pas proposé en 3 kVA. Ces prix sont ceux de la grille officielle, issue de la proposition de la CRE du 15 juillet 2026, et restent en vigueur jusqu’au prochain mouvement tarifaire. Entrez vos kWh de chaque couleur : l’outil donne la facture d’une année, et la compare à la Base et aux Heures creuses pour la même consommation.`;
    },
    faqs: (h) => [
      { q: 'Que sont les six index d’une facture Tempo ?', a: 'Le compteur Linky enregistre séparément les kWh de chaque couleur et de chaque période : bleu heures creuses, bleu heures pleines, blanc heures creuses, blanc heures pleines, rouge heures creuses, rouge heures pleines. La facture les reprend un par un, chacun à son prix. En additionnant les deux index d’une couleur, vous obtenez les kWh à entrer dans l’outil pour cette couleur.' },
      { q: 'Les prix Tempo vont-ils changer en février 2027 ?', a: 'Les tarifs réglementés évoluent en général au 1er février et au 1er août, sur proposition de la CRE. À la date de notre relevé, aucune proposition n’avait été publiée pour février 2027 : nous ne publions donc aucun chiffre. Dès qu’une délibération paraîtra, le fichier de paramètres sera mis à jour et toutes les pages du site suivront.' },
      { q: 'Pourquoi l’abonnement Tempo est-il un peu moins cher que celui de la Base ?', a: `En 6 kVA, l’abonnement Tempo est de ${h.eur(abo(h, 6), 2)} par mois contre ${h.eur(h.P.base.abo['6'], 2)} pour la Base et les Heures creuses. La CRE construit chaque barème à partir des coûts de chaque option, et la répartition entre abonnement et kWh n’est pas la même. L’écart d’abonnement reste faible : c’est le prix des jours rouges qui décide.` },
      { q: 'Faut-il un compteur Linky pour avoir le tarif Tempo ?', a: `Le compteur doit pouvoir compter les kWh par couleur et par période, ce que fait le Linky. La grille prévoit par ailleurs une majoration de ${h.eur(h.P.taxes.majoration_sans_linky_an_ht, 2)} hors taxes par an pour un client sans Linky, hors impossibilité technique d’installation, quelle que soit l’option. Le plus simple est de vérifier sur votre facture que le compteur est bien un Linky.` },
    ],
    body: (h) => {
      const T = h.P.tempo.kwh, K = KVA(h);
      return `
<h2>La grille Tempo au 1er août 2026</h2>
${h.table(['Couleur du jour', 'Heures creuses (22 h - 6 h)', 'Heures pleines (6 h - 22 h)'], [
  ['Bleu', h.kwh(T.B.hc), h.kwh(T.B.hp)], ['Blanc', h.kwh(T.W.hc), h.kwh(T.W.hp)], ['Rouge', h.kwh(T.R.hc), h.kwh(T.R.hp)],
], 'Prix du kWh TTC, identiques pour toutes les puissances.', ['l', 'r', 'r'])}
${h.table(['Puissance', 'Abonnement par mois', 'Par an'], K.map((k) => [`${k} kVA`, h.eur(abo(h, k), 2), h.eur(abo(h, k) * 12)]), 'Abonnement TTC de l’option Tempo, grille EDF du Tarif Bleu.', ['l', 'r', 'r'])}
<p>Ces montants sont lus sur la ${h.src('grilleEdf', 'grille de prix officielle du Tarif Bleu')} applicable au 1er août 2026, qui reprend la ${h.src('creTrve2026', 'délibération n° 2026-147 de la CRE')}. Nouveauté de ce mouvement : la CRE a proposé des abonnements distincts pour 24 et 30 kVA en Tempo, qui partageaient jusque-là le même montant. Les prix intègrent l’acheminement, l’accise, la contribution tarifaire d’acheminement et la TVA à 20 %.</p>
<h2>Un rapport de un à ${h.num(ratio(h), 1)}</h2>
<p>Le kWh le moins cher de la grille, bleu en heures creuses, vaut ${h.kwh(T.B.hc)} ; le plus cher, rouge en heures pleines, ${h.kwh(T.R.hp)}, soit ${h.num(ratio(h), 1)} fois plus. Entre les deux, l’écart est modeste : un kWh blanc en heures pleines ne coûte que ${h.kwh(T.W.hp - T.B.hp)} de plus qu’un bleu. Tout le pari de Tempo tient donc dans les ${h.num(h.P.tempo_regles.jours_rouges)} jours rouges et leurs seize heures pleines, du 1er novembre au 31 mars. Les heures creuses rouges, elles, restent à ${h.kwh(T.R.hc)} : moins cher que le kWh de la Base, qui est à ${h.kwh(h.P.base.kwh['6'])} en 6 kVA.</p>
<h2>Lire sa facture et remplir l’outil</h2>
<ol>
<li>Prenez une facture de régularisation ou le relevé annuel de votre espace client : il donne les six index sur douze mois.</li>
<li>Additionnez heures creuses et heures pleines de chaque couleur : ce sont les trois montants de kWh demandés.</li>
<li>Calculez la part des heures creuses sur le total, toutes couleurs confondues.</li>
<li>Choisissez la puissance de votre contrat : elle figure en tête de facture.</li>
</ol>
<p>L’outil applique alors exactement la grille, sans hypothèse sur votre chauffage : c’est le calcul le plus fiable si vous êtes déjà client Tempo. Si vous ne l’êtes pas encore, le ${h.a('comparateur', 'comparateur Base, Heures creuses ou Tempo')} estime la répartition par couleur à partir de votre seule consommation annuelle, et la page ${h.a('prix-kwh', 'prix du kWh')} donne les grilles des deux autres options.</p>
<h2>Jusqu’à quand ces prix s’appliquent</h2>
<p>Les tarifs réglementés changent par décision des pouvoirs publics, sur proposition de la CRE, le plus souvent au 1er février et au 1er août. À la date du relevé, ${h.date(h.P.retrieved_at)}, aucune proposition n’était publiée pour le mouvement suivant. Le site affichera les nouveaux prix le jour de leur entrée en vigueur, en gardant l’ancienne grille en mémoire dans ses paramètres datés. Deux autres formules à jours chers se comparent à Tempo : l’ancienne ${h.a('ejp-demain', 'option EJP')}, fermée aux nouveaux clients, et l’offre de marché ${h.a('zen-flex-edf', 'Zen Flex d’EDF')}.</p>`;
    },
  },
  en: {
    slug: 'tempo-prices',
    nav: 'Tempo prices 2026',
    card: 'The 1 August 2026 Tempo grid and your bill from your meter readings.',
    title: 'Tempo prices 2026: kWh price by colour, standing charge',
    description: 'Tempo prices 2026: price per kWh incl. tax on blue, white and red days, standing charge from 6 to 36 kVA since 1 August, and your bill from meter readings.',
    h1: 'Tempo prices 2026: price per kWh and standing charge',
    intro: 'The regulated grid in force since 1 August 2026, and a year’s bill worked out from your six Tempo meter readings.',
    resume: (h) => {
      const T = h.P.tempo.kwh;
      return `The Tempo option of France’s regulated blue tariff uses six prices per kilowatt-hour, one for each day colour and time band. Since 1 August 2026, all taxes included, a blue day costs ${h.kwh(T.B.hc)} off-peak and ${h.kwh(T.B.hp)} at peak, a white day ${h.kwh(T.W.hc)} and ${h.kwh(T.W.hp)}, a red day ${h.kwh(T.R.hc)} and ${h.kwh(T.R.hp)}. Off-peak hours (heures creuses) run from 22:00 to 06:00, peak hours (heures pleines) from 06:00 to 22:00. The standing charge (abonnement) depends on meter power, from ${h.eur(abo(h, 6), 2)} a month at 6 kVA to ${h.eur(abo(h, 36), 2)} at 36 kVA; Tempo is not offered at 3 kVA. These are the official grid prices, based on the regulator’s proposal of 15 July 2026, and they stay in force until the next tariff change. Enter your kWh for each colour: the tool gives a year’s bill and compares it with Base and Off-peak for the same consumption, so you see at once what Tempo is worth to you.`;
    },
    faqs: (h) => [
      { q: 'What are the six readings on a Tempo bill?', a: 'The Linky meter records kWh separately for each colour and time band: blue off-peak, blue peak, white off-peak, white peak, red off-peak, red peak. The bill lists them one by one, each at its own price. Adding the two readings of a colour gives the kWh to enter in the tool for that colour.' },
      { q: 'Will Tempo prices change in February 2027?', a: 'Regulated tariffs usually move on 1 February and 1 August, on the energy regulator’s proposal. On the date we last checked, no proposal had been published for February 2027, so we publish no figure. As soon as a deliberation appears, the parameter file will be updated and every page on the site will follow.' },
      { q: 'Why is the Tempo standing charge slightly cheaper than Base?', a: `At 6 kVA the Tempo standing charge is ${h.eur(abo(h, 6), 2)} a month against ${h.eur(h.P.base.abo['6'], 2)} for Base and Off-peak. The regulator builds each schedule from the costs of each option, and the split between standing charge and kWh is not the same. The standing-charge gap is small: red-day prices are what decide.` },
      { q: 'Do I need a Linky meter for Tempo?', a: `The meter has to count kWh by colour and time band, which the Linky does. The grid also sets a surcharge of ${h.eur(h.P.taxes.majoration_sans_linky_an_ht, 2)} a year before tax for customers without a Linky, unless installation is technically impossible, whatever the option. The simplest check is your bill, which names the meter type.` },
    ],
    body: (h) => {
      const T = h.P.tempo.kwh, K = KVA(h);
      return `
<h2>The Tempo grid from 1 August 2026</h2>
${h.table(['Day colour', 'Off-peak (22:00-06:00)', 'Peak (06:00-22:00)'], [
  ['Blue', h.kwh(T.B.hc), h.kwh(T.B.hp)], ['White', h.kwh(T.W.hc), h.kwh(T.W.hp)], ['Red', h.kwh(T.R.hc), h.kwh(T.R.hp)],
], 'Price per kWh including tax, the same at every power level.', ['l', 'r', 'r'])}
${h.table(['Power', 'Standing charge a month', 'A year'], K.map((k) => [`${k} kVA`, h.eur(abo(h, k), 2), h.eur(abo(h, k) * 12)]), 'Tempo standing charge including tax, EDF Tarif Bleu grid.', ['l', 'r', 'r'])}
<p>These amounts come from the ${h.src('grilleEdf', 'official Tarif Bleu price grid')} applicable from 1 August 2026, which follows the ${h.src('creTrve2026', 'regulator’s deliberation no. 2026-147')}. New this time: the regulator proposed separate Tempo standing charges for 24 and 30 kVA, which used to share one amount. Prices include network charges, excise duty, the network access contribution and 20% VAT.</p>
<h2>A one-to-${h.num(ratio(h), 1)} spread</h2>
<p>The cheapest kWh on the grid, blue off-peak, costs ${h.kwh(T.B.hc)}; the dearest, red peak, ${h.kwh(T.R.hp)}, which is ${h.num(ratio(h), 1)} times as much. In between the gaps are small: a white peak kWh costs only ${h.kwh(T.W.hp - T.B.hp)} more than a blue one. The whole Tempo bet therefore lies in the ${h.num(h.P.tempo_regles.jours_rouges)} red days and their sixteen peak hours, between 1 November and 31 March. Red off-peak hours stay at ${h.kwh(T.R.hc)}, below the Base rate of ${h.kwh(h.P.base.kwh['6'])} at 6 kVA.</p>
<h2>Reading your bill and filling in the tool</h2>
<ol>
<li>Take an annual adjustment bill (facture de régularisation) or the yearly statement in your online account: it gives the six readings over twelve months.</li>
<li>Add off-peak and peak for each colour: those are the three kWh figures the tool asks for.</li>
<li>Work out the off-peak share of the total, all colours together.</li>
<li>Pick your contract’s power: it is printed at the top of the bill.</li>
</ol>
<p>The tool then applies the grid exactly, with no assumption about your heating: it is the most reliable calculation if you are already on Tempo. If you are not yet, the ${h.a('comparateur', 'Base, Off-peak or Tempo comparison')} estimates the split by colour from your annual consumption alone, and the ${h.a('prix-kwh', 'price per kWh')} page gives the grids of the two other options.</p>
<h2>How long these prices apply</h2>
<p>Regulated tariffs change by government decision on the regulator’s proposal, most often on 1 February and 1 August. On the date of our check, ${h.date(h.P.retrieved_at)}, no proposal had been published for the next change. The site will show new prices on the day they take effect, keeping the old grid on record in its dated parameters. Two other formulas with expensive days compare with Tempo: the old ${h.a('ejp-demain', 'EJP option')}, closed to new customers, and EDF’s ${h.a('zen-flex-edf', 'Zen Flex')} market offer.</p>`;
    },
  },
});

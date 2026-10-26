import { defineGuide, type Helpers } from '../../lib/guide-types';

const NOMS = { fr: { B: 'Bleu', W: 'Blanc', R: 'Rouge' }, en: { B: 'Blue', W: 'White', R: 'Red' } } as const;
/** Les quatorze derniers jours publiés par RTE jusqu'au lendemain du build, du plus récent au plus ancien. */
const quinzaine = (h: Helpers) => h.M.lastDays(h.M.addDays(h.today, 1), 14).slice().reverse();
const nomJour = (h: Helpers, d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString(h.lang === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', timeZone: 'UTC' });

export default defineGuide({
  id: 'couleur-tempo-demain',
  group: 'tempo',
  order: 2,
  tool: 'demain',
  related: ['jour-rouge-tempo', 'jours-tempo-restants', 'tarif-tempo', 'comparateur', 'historique-tempo', 'ejp-demain', 'ecowatt'],
  sources: ['rteCalendrier', 'rteMethode', 'creTempo2014', 'grilleEdf'],
  fr: {
    slug: 'couleur-tempo-demain',
    nav: 'Couleur Tempo de demain',
    card: 'La couleur du lendemain dès sa publication par RTE, et son coût pour vous.',
    title: 'Couleur Tempo demain : publication RTE à 10 h 30, 2026-2027',
    description: 'Couleur Tempo de demain publiée par RTE la veille à 10 h 30 : ce que la journée vous coûtera, les quatorze derniers jours et comment s’y préparer en 2026-2027.',
    h1: 'Couleur Tempo de demain',
    intro: 'La couleur du lendemain telle que RTE la publie, et ce que la journée vous coûtera selon votre consommation.',
    resume: (h) => {
      const T = h.P.tempo.kwh, R = h.P.tempo_regles;
      return `La couleur Tempo de demain est fixée par RTE et publiée chaque jour à ${R.publication.replace(':', ' h ')} sur son calendrier Tempo ; c’est cette publication, et elle seule, qui engage les fournisseurs. Entre 8 h et 10 h 30, RTE peut diffuser une indication sans valeur contractuelle quand ses prévisions le permettent. La couleur annoncée vaut pour la journée Tempo du lendemain, de 6 h à 6 h le surlendemain, avec des heures creuses de 22 h à 6 h. Un jour rouge ne peut tomber qu’en semaine, entre le 1er novembre et le 31 mars. Au tarif du 1er août 2026, le kWh d’heures pleines passe de ${h.kwh(T.B.hp)} un jour bleu à ${h.kwh(T.R.hp)} un jour rouge : savoir la veille ce qui vous attend laisse une soirée pour lancer les machines, programmer le ballon et préparer le chauffage. L’outil ci-dessus affiche la couleur dès que notre relevé chez RTE l’a reçue et chiffre la journée sur votre propre consommation.`;
    },
    faqs: (h) => [
      { q: 'La couleur de demain peut-elle encore changer après 10 h 30 ?', a: 'Non. RTE indique que la couleur qui fait foi est celle publiée la veille à 10 h 30 sur son calendrier. Ce qui peut paraître avant, entre 8 h et 10 h 30, n’est qu’une indication tirée des prévisions du matin. Si un site annonce une couleur à 7 h, il s’agit au mieux de cette indication, au pire d’une prévision maison.' },
      { q: 'Où voir la couleur de demain sur le compteur Linky ?', a: 'Le Linky affiche la couleur Tempo en cours, et celle du lendemain une fois qu’elle lui a été transmise, en faisant défiler ses écrans avec la touche de navigation. Les fournisseurs transmettent aussi la couleur par courriel, SMS ou dans leur application. Ces relais reprennent tous la même source : la publication de RTE à 10 h 30. Cette page la relit directement chez RTE plusieurs fois par jour.' },
      { q: 'Comment RTE décide-t-il qu’un jour sera rouge ?', a: 'Son algorithme, décrit dans une fiche publique, compare la consommation nette prévue pour le lendemain, c’est-à-dire la consommation nationale moins la production éolienne et solaire, à deux seuils. Ces seuils dépendent de l’avancement dans la saison et du stock de jours rouges et blancs restant. Franchir le premier seuil donne un jour blanc, franchir les deux un jour rouge, si le calendrier le permet.' },
      { q: 'Pourquoi la carte « demain » reste-t-elle vide le matin ?', a: `Parce que RTE n’a pas encore publié. Avant ${h.P.tempo_regles.publication.replace(':', ' h ')}, aucune couleur officielle n’existe pour le lendemain, et nous préférons l’écrire plutôt que d’afficher une prévision présentée comme un fait. La page se reconstruit dans l’heure qui suit la publication, puis plusieurs fois dans la journée, pour rattraper un éventuel retard de l’un de ses relevés.` },
    ],
    body: (h) => {
      const L = quinzaine(h), T = h.P.tempo.kwh;
      return `
<h2>Qui décide de la couleur, et quand</h2>
<p>Depuis le 1er novembre 2014, le choix des jours Tempo revient à RTE, qui gère le réseau de transport d’électricité, et non plus à un fournisseur. La ${h.src('creTempo2014', 'délibération de la CRE')} qui le prévoit fixe les quotas et le calendrier ; la ${h.src('rteMethode', 'fiche de méthode de RTE')} décrit l’algorithme. Chaque matin, RTE compare la consommation nette attendue le lendemain, consommation nationale moins éolien et solaire, à deux seuils qui baissent à mesure que la saison avance et que le stock de jours se vide. Un lundi de janvier glacial et sans vent a toutes les chances d’être rouge ; un mardi doux et venteux restera bleu.</p>
<p>La décision est publiée à 10 h 30 sur le ${h.src('rteCalendrier', 'calendrier Tempo de RTE')}. Elle vaut pour tous les clients Tempo, quel que soit leur fournisseur, et pour la journée qui commence le lendemain à 6 h. Les abonnés à l’ancienne option EJP suivent un autre calendrier, décidé par EDF et annoncé vers 14 h : il a sa page, ${h.a('ejp-demain', 'EJP demain')}. Le signal ${h.a('ecowatt', 'Ecowatt')}, lui aussi publié par RTE, ne change pas la couleur Tempo.</p>
<h2>Les quatorze derniers jours</h2>
${h.table(['Jour', 'Date', 'Couleur'], L.map((x) => [nomJour(h, x.d), h.date(x.d), x.c ? NOMS.fr[x.c] : 'non publiée']), 'Couleurs publiées par RTE, du plus récent au plus ancien ; la première ligne est le lendemain du dernier relevé.', ['l', 'l', 'l'])}
<p>Le tableau suit le dernier relevé de la page. Les jours encore à venir n’ont pas de couleur tant que RTE ne l’a pas publiée. Le détail de toute la saison est sur la page ${h.a('jours-tempo-restants', 'jours Tempo restants')}, et les hivers passés sur l’${h.a('historique-tempo', 'historique Tempo')}.</p>
<h2>La veille d’un jour rouge : la soirée qui compte</h2>
<p>Une couleur publiée à 10 h 30 laisse environ dix-neuf heures avant le début de la journée rouge, à 6 h. C’est assez pour décaler l’essentiel :</p>
<ul>
<li>lancer le soir même, après 22 h, le lave-linge, le sèche-linge et le lave-vaisselle prévus pour le lendemain ;</li>
<li>chauffer un peu plus la maison dans la nuit, en heures creuses rouges à ${h.kwh(T.R.hc)}, pour la laisser redescendre doucement entre 6 h et 22 h ;</li>
<li>terminer la recharge de la voiture avant 6 h et la reprendre à 22 h ;</li>
<li>prévoir un repas qui demande peu de four ou de plaques.</li>
</ul>
<p>Le guide ${h.a('jour-rouge-tempo', 'que faire un jour rouge')} chiffre chacun de ces gestes appareil par appareil.</p>
<h2>À quelle fréquence cette page se met à jour</h2>
<p>La page est reconstruite automatiquement plusieurs fois par jour : peu après 10 h 30 pour saisir la publication de RTE, puis deux fois en fin de matinée pour rattraper un relevé en retard, et juste après minuit pour basculer sur la nouvelle date. Dans votre navigateur, les cartes se recalent sur l’heure de Paris : entre minuit et 6 h, elles rappellent que la journée Tempo en cours est encore celle de la veille. Si RTE ne répond pas, la page garde le dernier relevé réussi et en affiche la date.</p>`;
    },
  },
  en: {
    slug: 'tempo-colour-tomorrow',
    nav: 'Tomorrow’s Tempo colour',
    card: 'Tomorrow’s colour as soon as RTE publishes it, and what it costs you.',
    title: 'Tempo colour tomorrow: RTE publishes at 10:30, 2026-2027',
    description: 'Tomorrow’s Tempo colour as RTE publishes it at 10:30 the day before: what the day will cost you, the last fourteen days and how to get ready, 2026-2027.',
    h1: 'Tomorrow’s Tempo colour',
    intro: 'Tomorrow’s colour as RTE publishes it, and what the day will cost you on your own consumption.',
    resume: (h) => {
      const T = h.P.tempo.kwh;
      return `Tomorrow’s Tempo colour is set by RTE, France’s transmission grid operator, and published every day at 10:30 on its Tempo calendar; that publication, and only that one, binds the electricity suppliers. Between 08:00 and 10:30 RTE may put out a non-binding indication when its forecasts allow. The announced colour applies to the next Tempo day, from 06:00 to 06:00 the morning after, with off-peak hours from 22:00 to 06:00. A red day can only fall on a weekday between 1 November and 31 March. On the regulated tariff of 1 August 2026, a peak-hour kWh goes from ${h.kwh(T.B.hp)} on a blue day to ${h.kwh(T.R.hp)} on a red one: knowing the evening before leaves time to run the appliances, set the water heater and plan the heating. The tool above shows the colour as soon as our reading from RTE has picked it up and prices the day on your own consumption, so you can see what tomorrow means for your bill before it starts.`;
    },
    faqs: (h) => [
      { q: 'Can tomorrow’s colour still change after 10:30?', a: 'No. RTE states that the binding colour is the one published the day before at 10:30 on its calendar. Anything shown earlier, between 08:00 and 10:30, is only an indication drawn from the morning forecasts. A site announcing a colour at 07:00 is at best repeating that indication and at worst giving its own forecast.' },
      { q: 'Where does the Linky meter show tomorrow’s colour?', a: 'The Linky meter cycles through its screens with the scroll button and shows the current Tempo colour, and the next day’s once it has been sent to the meter. Suppliers also send the colour by email, text or app. All these channels repeat the same source, RTE’s 10:30 publication, which this page reads directly from RTE several times a day.' },
      { q: 'How does RTE decide that a day will be red?', a: 'Its algorithm, set out in a public note, compares the next day’s forecast net demand, national consumption minus wind and solar output, with two thresholds. They depend on how far the season has gone and how many red and white days are left. Crossing the first threshold gives a white day, crossing both a red day, provided the calendar allows it.' },
      { q: 'Why is the “tomorrow” card blank in the morning?', a: `Because RTE has not published yet. Before ${h.P.tempo_regles.publication}, no official colour exists for the next day, and we would rather say so than show a forecast dressed up as fact. The page rebuilds within the hour after publication and again several times during the day, to catch up if one of its readings runs late.` },
    ],
    body: (h) => {
      const L = quinzaine(h), T = h.P.tempo.kwh;
      return `
<h2>Who decides the colour, and when</h2>
<p>Since 1 November 2014 Tempo days have been chosen by RTE, which runs the high-voltage grid, rather than by a supplier. The ${h.src('creTempo2014', 'regulator’s deliberation')} behind it sets the quotas and the calendar; ${h.src('rteMethode', 'RTE’s method note')} describes the algorithm. Each morning RTE compares the next day’s expected net demand, national consumption minus wind and solar, with two thresholds that drop as the season goes on and the stock of days runs down. A freezing, windless Monday in January is very likely to be red; a mild, breezy Tuesday will stay blue.</p>
<p>The decision goes out at 10:30 on ${h.src('rteCalendrier', 'RTE’s Tempo calendar')}. It applies to every Tempo customer, whatever the supplier, for the day that starts at 06:00 the next morning. Customers on the old EJP option follow a different calendar, set by EDF and announced around 14:00: it has its own page, ${h.a('ejp-demain', 'EJP tomorrow')}. The ${h.a('ecowatt', 'Ecowatt')} signal, also published by RTE, does not change the Tempo colour.</p>
<h2>The last fourteen days</h2>
${h.table(['Day', 'Date', 'Colour'], L.map((x) => [nomJour(h, x.d), h.date(x.d), x.c ? NOMS.en[x.c] : 'not published']), 'Colours published by RTE, most recent first; the top row is the day after the latest reading.', ['l', 'l', 'l'])}
<p>The table follows the page’s latest reading. Days still to come have no colour until RTE publishes it. The whole season, day by day, is on the ${h.a('jours-tempo-restants', 'Tempo days left')} page, and past winters are in the ${h.a('historique-tempo', 'Tempo history')}.</p>
<h2>The evening before a red day</h2>
<p>A colour published at 10:30 leaves roughly nineteen hours before the red day starts at 06:00. That is enough to move most things:</p>
<ul>
<li>run tomorrow’s washing, drying and dishwasher loads tonight after 22:00;</li>
<li>warm the house a little more overnight, at the red off-peak rate of ${h.kwh(T.R.hc)}, and let it cool slowly between 06:00 and 22:00;</li>
<li>finish charging the car before 06:00 and resume at 22:00;</li>
<li>plan a meal that needs little oven or hob time.</li>
</ul>
<p>The guide ${h.a('jour-rouge-tempo', 'what to do on a red day')} prices each of these moves appliance by appliance.</p>
<h2>How often this page updates</h2>
<p>The page rebuilds itself automatically several times a day: shortly after 10:30 to catch RTE’s publication, twice more in the late morning in case a reading is late, and just after midnight to roll over to the new date. In your browser the cards line up with Paris time: between midnight and 06:00 they remind you that the current Tempo day is still yesterday’s. If RTE cannot be reached, the page keeps its last successful reading and shows its date.</p>`;
    },
  },
});

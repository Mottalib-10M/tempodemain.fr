import { defineGuide } from '../../lib/guide-types';

export default defineGuide({
  id: 'ecowatt',
  group: 'tempo',
  order: 12,
  mini: 'ecowatt',
  miniHref: 'comparateur',
  related: ['couleur-tempo-demain', 'ejp-demain', 'jour-rouge-tempo', 'zen-flex-edf', 'horaires-heures-creuses'],
  sources: ['ecowatt', 'ecowattSignaux', 'ecowattAlerte', 'ecowattApi', 'rteMethode'],
  fr: {
    slug: 'ecowatt',
    nav: 'Ecowatt de RTE',
    card: 'Le signal vert, orange ou rouge de RTE, ce qu’il change pour un abonné Tempo ou EJP, et où le lire.',
    title: 'Ecowatt : signal vert, orange ou rouge de RTE, hiver 2026',
    description: 'Ecowatt, la météo de l’électricité de RTE : signal vert, orange ou rouge, heures décarbonées, lien avec les jours rouges Tempo et EJP, où le consulter en 2026.',
    h1: 'Ecowatt : le signal de RTE, vert, orange ou rouge',
    intro: 'Ce que dit chaque couleur, ce qu’elle ne dit pas, et comment elle se combine avec un jour rouge Tempo ou un jour EJP.',
    resume: (h) => {
      const R = h.P.tempo.kwh.R;
      return `Ecowatt est la « météo de l’électricité » de RTE, le gestionnaire du réseau de transport, montée avec l’ADEME. Son signal prend trois couleurs. Vert : pas d’alerte, la production disponible couvre la consommation, et certaines heures sont signalées comme « vertueuses » parce que le nucléaire et les renouvelables suffisent à tout fournir sans émettre de CO₂. Orange : le système est tendu, les éco-gestes sont bienvenus. Rouge : le système est très tendu et des coupures sont inévitables si la consommation ne baisse pas ; RTE précise qu’elles seraient locales, organisées et d’environ deux heures au plus. Le signal se consulte sur monecowatt.fr, dans l’application EcoWatt, par alerte ou par l’API de RTE. Ecowatt ne change aucun prix : ce sont les jours rouges Tempo, fixés par RTE selon une autre règle, et les jours EJP, fixés par EDF, qui font payer le kWh jusqu’à ${h.kwh(R.hp)}. Les trois peuvent tomber le même jour, mais aucun n’entraîne les autres.`;
    },
    faqs: (h) => [
      { q: 'Un signal Ecowatt rouge fait-il passer le jour en rouge Tempo ?', a: 'Non. La couleur Tempo sort d’un algorithme de RTE publié dans une fiche de méthode : il compare la consommation prévue, moins l’éolien et le solaire, à des seuils qui dépendent du stock de jours restants. Le signal Ecowatt mesure les marges du système électrique. Les deux sont calculés par RTE mais séparément, et la couleur Tempo est fixée la veille à 10 h 30 quoi qu’il arrive ensuite.' },
      { q: 'Le signal Ecowatt coûte-t-il quelque chose aux abonnés ?', a: 'Non. Aucune grille tarifaire ne fait référence au signal Ecowatt. Ce qui coûte, c’est le contrat : un jour rouge Tempo, un jour EJP ou un jour Sobriété d’une offre comme Zen Flex. Le mini-calculateur de cette page chiffre le même geste de décalage sur chacun.' },
      { q: 'Peut-on afficher le signal Ecowatt sur son propre site ou dans sa domotique ?', a: 'Oui. RTE propose un widget à intégrer depuis monecowatt.fr et une API publique sur son portail data. L’API demande de créer un compte et une application sur data.rte-france.com pour obtenir des identifiants ; cette page ne l’interroge pas et renvoie vers les pages officielles.' },
      { q: 'Quand faut-il réduire sa consommation lors d’une alerte ?', a: 'RTE vise les pointes du matin et du soir : en cas de signal orange ou rouge, ses conseils portent sur la période de 7 h à 11 h et celle de 18 h à 20 h. Lancer les machines après 20 h, baisser le chauffage, éteindre les veilles et limiter l’eau chaude sont les gestes qu’il cite en premier.' },
    ],
    body: (h) => {
      const R = h.P.tempo.kwh.R, E = h.P.ejp.kwh, Z = h.P.zen_flex.kwh.sobriete;
      return `
<h2>Les trois couleurs, telles que RTE les définit</h2>
${h.table(['Signal', 'Ce que dit RTE', 'Ce qu’on fait'], [
  ['Vert', 'Pas d’alerte : la consommation reste sous la production disponible, les marges suffisent.', 'Rien d’obligé ; profiter des heures vertueuses pour les usages décalables.'],
  ['Vert, heures vertueuses', 'Production sans CO₂ (nucléaire, renouvelables) suffisante pour couvrir toute la consommation prévue.', 'Recharger la voiture, lancer les machines, chauffer l’eau à ces heures-là.'],
  ['Orange', 'Système tendu : la production disponible est très proche de la consommation attendue.', 'Éco-gestes bienvenus, surtout de 7 h à 11 h et de 18 h à 20 h.'],
  ['Rouge', 'Système très tendu : pas assez d’électricité pour tous les besoins.', 'Éco-gestes indispensables ; coupures locales possibles, d’environ 2 h au plus.'],
], 'Définitions reprises de la foire aux questions de MonEcoWatt (RTE).', ['l', 'l', 'l'])}
<p>Ces définitions viennent de la ${h.src('ecowattSignaux', 'page de RTE sur le calcul des signaux')}. RTE y explique qu’il prévoit chaque jour la consommation et, en parallèle, la production disponible et les importations possibles. Quand les marges se réduisent, il active d’abord ses propres leviers, comme la baisse de tension ou l’effacement d’industriels ; le signal orange avertit que ces leviers pourraient ne plus suffire si la consommation montait encore. Le rouge correspond au cas, que RTE dit rare, où tous les besoins ne pourraient pas être couverts.</p>
<h2>Où consulter Ecowatt</h2>
<ul>
<li>le site ${h.src('ecowatt', 'monecowatt.fr')}, qui affiche le signal du jour et des jours suivants, heure par heure ;</li>
<li>l’application EcoWatt, et les alertes auxquelles on s’inscrit depuis le site ;</li>
<li>le widget que RTE met à disposition pour relayer le signal sur un autre site ;</li>
<li>l’${h.src('ecowattApi', 'API Ecowatt du portail data de RTE')}, ouverte à tous mais qui demande un compte et une application déclarée.</li>
</ul>
<p>Nous ne recopions pas le signal ici : sans compte sur le portail de RTE, nous n’avons pas d’accès automatique fiable, et un signal Ecowatt périmé serait pire que pas de signal du tout. La couleur Tempo, elle, est relue chez RTE et affichée sur la page ${h.a('couleur-tempo-demain', 'couleur Tempo de demain')} ; le jour EJP est relu chez EDF sur la page ${h.a('ejp-demain', 'EJP demain')}.</p>
<h2>Ecowatt, jour rouge Tempo, jour EJP : trois choses différentes</h2>
${h.table(['', 'Ecowatt', 'Jour rouge Tempo', 'Jour EJP'], [
  ['Qui décide', 'RTE', 'RTE', 'EDF'],
  ['Selon quoi', 'Marges du système électrique', 'Consommation nette prévue et stock de jours', 'Choix d’EDF, 22 jours par hiver'],
  ['Quand c’est connu', 'Prévision publiée sur monecowatt.fr', 'La veille à 10 h 30', 'La veille vers 14 h, au plus tard 5 h'],
  ['Week-end possible', 'Oui', 'Non', 'Oui'],
  ['Effet sur le prix', 'Aucun', `${h.kwh(R.hp)} le kWh en heures pleines`, `${h.kwh(E.pm)} le kWh de 7 h à 1 h`],
], 'Prix TTC des grilles EDF au 1er août 2026.', ['l', 'l', 'l', 'l'])}
<p>Les jours qui déclenchent un signal orange sont des jours de forte consommation, donc souvent des jours froids de semaine : exactement ceux que l’${h.src('rteMethode', 'algorithme Tempo de RTE')} et EDF visent pour leurs jours rouges et leurs jours EJP. Il est donc probable qu’une alerte Ecowatt tombe un jour rouge ou un jour EJP, mais rien ne l’impose. Un dimanche glacial peut porter un signal orange sans jamais pouvoir être rouge en Tempo. À l’inverse, un jour rouge Tempo peut rester vert sur Ecowatt si la production suit.</p>
<!--mini:ecowatt-->
<h2>Ce que vaut un geste, selon votre contrat</h2>
<p>Le signal Ecowatt invite tout le monde aux mêmes gestes, mais seuls certains contrats les récompensent. Décaler 1 kWh hors des heures pleines rapporte ${h.kwh(R.hp - R.hc)} un jour rouge Tempo, ${h.kwh(E.pm - E.hn)} un jour EJP si on le reporte entre 1 h et 7 h, et ${h.kwh(Z.hp - Z.hc)} un jour Sobriété de l’offre ${h.a('zen-flex-edf', 'Zen Flex d’EDF')}. En option Heures creuses, le même geste ne rapporte que l’écart habituel entre heures pleines et creuses, et en option Base, rien. Les gestes les plus efficaces sont listés sur la page ${h.a('jour-rouge-tempo', 'que faire un jour rouge')}.</p>
<p>RTE donne un ordre de grandeur dans sa ${h.src('ecowattAlerte', 'présentation du système d’alerte')} : si tous les foyers chauffés à l’électricité baissaient leur thermostat d’un degré, la pointe du matin baisserait de 1,3 GW, l’équivalent de la consommation d’une ville comme Marseille.</p>`;
    },
  },
  en: {
    slug: 'ecowatt',
    nav: 'RTE’s Ecowatt signal',
    card: 'RTE’s green, orange or red signal, what it changes for Tempo or EJP customers, and where to read it.',
    title: 'Ecowatt: RTE’s Green, Orange and Red Grid Signal, 2026',
    description: 'Ecowatt, RTE’s electricity weather forecast: the green, orange or red signal, low-carbon hours, its link with Tempo red and EJP days, and where to check it.',
    h1: 'Ecowatt: RTE’s green, orange or red signal',
    intro: 'What each colour says, what it does not say, and how it combines with a Tempo red day or an EJP day.',
    resume: (h) => {
      const R = h.P.tempo.kwh.R;
      return `Ecowatt is the « electricity weather forecast » of RTE, the French transmission grid operator, run with the environment agency ADEME. Its signal has three colours. Green: no alert, available generation covers demand, and some hours are flagged as « virtuous » because nuclear and renewables can supply everything without emitting CO₂. Orange: the system is under strain and energy-saving actions are welcome. Red: the system is under severe strain and power cuts are unavoidable unless demand falls; RTE says they would be local, organised and last about two hours at most. The signal can be checked on monecowatt.fr, in the EcoWatt app, through alerts or through RTE’s API. Ecowatt changes no price: Tempo red days, set by RTE under a different rule, and EJP days, set by EDF, are what push a kWh up to ${h.kwh(R.hp)}. All three can fall on the same day, but none triggers the others.`;
    },
    faqs: (h) => [
      { q: 'Does a red Ecowatt signal turn the day red on Tempo?', a: 'No. The Tempo colour comes from an RTE algorithm set out in a method note: it compares forecast demand, minus wind and solar, with thresholds that depend on the stock of days left. The Ecowatt signal measures the grid’s margins. RTE computes both, but separately, and the Tempo colour is fixed the day before at 10:30 whatever happens next.' },
      { q: 'Does the Ecowatt signal cost customers anything?', a: 'No. No price grid refers to the Ecowatt signal. What costs money is the contract: a Tempo red day, an EJP day or a Sobriety day on an offer such as Zen Flex. The mini calculator on this page prices the same shift on each one.' },
      { q: 'Can I show the Ecowatt signal on my own site or home automation?', a: 'Yes. RTE offers a widget to embed from monecowatt.fr and a public API on its data portal. The API requires creating an account and an application on data.rte-france.com to get credentials; this page does not query it and points to the official pages instead.' },
      { q: 'When should I cut consumption during an alert?', a: 'RTE targets the morning and evening peaks: for an orange or red signal, its advice covers 07:00 to 11:00 and 18:00 to 20:00. Running appliances after 20:00, turning the heating down, switching off standby devices and using less hot water are the first actions it lists.' },
    ],
    body: (h) => {
      const R = h.P.tempo.kwh.R, E = h.P.ejp.kwh, Z = h.P.zen_flex.kwh.sobriete;
      return `
<h2>The three colours, as RTE defines them</h2>
${h.table(['Signal', 'What RTE says', 'What to do'], [
  ['Green', 'No alert: demand stays below available generation, margins are sufficient.', 'Nothing required; use the virtuous hours for flexible uses.'],
  ['Green, virtuous hours', 'CO₂-free generation (nuclear, renewables) is enough to cover all forecast demand.', 'Charge the car, run the appliances, heat water at those hours.'],
  ['Orange', 'System under strain: available generation is very close to expected demand.', 'Saving actions welcome, especially 07:00-11:00 and 18:00-20:00.'],
  ['Red', 'System under severe strain: not enough electricity for every need.', 'Saving actions essential; local cuts possible, about 2 hours at most.'],
], 'Definitions taken from the MonEcoWatt FAQ (RTE).', ['l', 'l', 'l'])}
<p>These definitions come from ${h.src('ecowattSignaux', 'RTE’s page on how the signals are worked out')}. RTE explains there that it forecasts demand every day and, alongside it, available generation and possible imports. When margins shrink it first uses its own levers, such as lowering voltage or paying industrial sites to cut demand; the orange signal warns that these levers might no longer be enough if demand kept rising. Red is the case, which RTE calls rare, where not every need could be met.</p>
<h2>Where to check Ecowatt</h2>
<ul>
<li>the ${h.src('ecowatt', 'monecowatt.fr')} site, which shows the signal for today and the following days, hour by hour;</li>
<li>the EcoWatt app, and the alerts you can sign up for on the site;</li>
<li>the widget RTE provides to relay the signal on another site;</li>
<li>the ${h.src('ecowattApi', 'Ecowatt API on RTE’s data portal')}, open to all but requiring an account and a registered application.</li>
</ul>
<p>We do not copy the signal here: without an account on RTE’s portal we have no reliable automatic access, and an out-of-date Ecowatt signal would be worse than none. The Tempo colour, by contrast, is read from RTE and shown on the ${h.a('couleur-tempo-demain', 'tomorrow’s Tempo colour')} page; the EJP day is read from EDF on the ${h.a('ejp-demain', 'EJP tomorrow')} page.</p>
<h2>Ecowatt, Tempo red day, EJP day: three different things</h2>
${h.table(['', 'Ecowatt', 'Tempo red day', 'EJP day'], [
  ['Who decides', 'RTE', 'RTE', 'EDF'],
  ['Based on', 'Grid margins', 'Forecast net demand and stock of days', 'EDF’s choice, 22 days per winter'],
  ['When it is known', 'Forecast published on monecowatt.fr', 'Day before at 10:30', 'Day before around 14:00, 05:00 at the latest'],
  ['Weekend possible', 'Yes', 'No', 'Yes'],
  ['Effect on price', 'None', `${h.kwh(R.hp)} per peak kWh`, `${h.kwh(E.pm)} per kWh from 07:00 to 01:00`],
], 'Prices incl. tax from the EDF grids of 1 August 2026.', ['l', 'l', 'l', 'l'])}
<p>Days that trigger an orange signal are high-demand days, so often cold weekdays: exactly the ones ${h.src('rteMethode', 'RTE’s Tempo algorithm')} and EDF aim at for their red days and EJP days. An Ecowatt alert is therefore likely to land on a red or EJP day, but nothing requires it. A freezing Sunday can carry an orange signal while it can never be red on Tempo. Conversely, a Tempo red day can stay green on Ecowatt if generation keeps up.</p>
<!--mini:ecowatt-->
<h2>What an effort is worth, depending on your contract</h2>
<p>The Ecowatt signal asks everyone for the same actions, but only some contracts reward them. Moving 1 kWh out of peak hours saves ${h.kwh(R.hp - R.hc)} on a Tempo red day, ${h.kwh(E.pm - E.hn)} on an EJP day if moved to 01:00-07:00, and ${h.kwh(Z.hp - Z.hc)} on a Sobriety day of EDF’s ${h.a('zen-flex-edf', 'Zen Flex')} offer. On the Off-peak option the same action only saves the usual gap between peak and off-peak, and on Base nothing at all. The most effective actions are listed on the ${h.a('jour-rouge-tempo', 'what to do on a red day')} page.</p>
<p>RTE gives an order of magnitude in its ${h.src('ecowattAlerte', 'description of the alert system')}: if every electrically heated home turned its thermostat down one degree, the morning peak would drop by 1.3 GW, the consumption of a city like Marseille.</p>`;
    },
  },
});

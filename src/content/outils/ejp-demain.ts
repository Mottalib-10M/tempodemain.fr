import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Saisons EJP closes relevées chez EDF : nombre de jours, premier et dernier, week-ends, jours aussi rouges en Tempo. */
const saisons = (h: Helpers) => h.M.ejpSeasonKeys().map((k) => Number(k.slice(0, 4))).map((y) => h.M.ejpStats(y)).filter((s) => s.complete).map((s) => {
  const jours = h.M.ejpSeason(s.y)?.ejp ?? [];
  return { ...s, rouges: jours.filter((d) => h.M.colour(d) === 'R').length };
});
/** Trois foyers types : EJP face à Tempo, sans effort et avec la moitié des heures rouges décalée. */
const foyers = (h: Helpers) => [[8000, 9, 0.5], [12000, 12, 0.6], [18000, 15, 0.65]].map(([kwh, kva, ch]) => {
  const e = { kwh, kva, chauffage: ch, partHC: 0.35 };
  return { kwh, kva, ch, ejp: h.M.factureEjp(kwh, kva, ch).total, t0: h.M.coutOption('tempo', e).total, t50: h.M.coutOption('tempo', { ...e, effortRouge: 0.5 }).total };
});
const kva = (h: Helpers) => h.M.EJP_PUISSANCES;
const cts = (h: Helpers, x: number) => h.kwh(x);

export default defineGuide({
  id: 'ejp-demain',
  group: 'tempo',
  order: 6,
  tool: 'ejp',
  related: ['couleur-tempo-demain', 'comparateur', 'tarif-tempo', 'ecowatt', 'jour-rouge-tempo'],
  sources: ['edfEjpJours', 'edfEjpOption', 'grilleEjp', 'grilleEdf'],
  fr: {
    slug: 'ejp-demain',
    nav: 'EJP demain',
    card: 'Demain est-il un jour EJP ? L’annonce d’EDF, les jours restants et le match avec Tempo.',
    title: 'EJP demain : jour EJP ou non, jours restants 2026-2027',
    description: 'EJP demain : le jour EJP annoncé par EDF vers 14 h, les jours EJP restants sur 22, les prix de l’option au 1er août 2026 et le calcul pour passer à Tempo.',
    h1: 'EJP demain : jour EJP ou pas ?',
    intro: 'L’annonce d’EDF pour demain, le compte des jours EJP de l’hiver et ce que l’option vous coûte face à Tempo.',
    resume: (h) => {
      const E = h.P.ejp, r = h.M.ejpRestants(h.today);
      return `Un jour EJP, pour « Effacement Jours de Pointe », est l’un des ${E.jours} jours de l’hiver où le kWh de l’option EJP d’EDF passe de ${h.kwh(E.kwh.hn)} à ${h.kwh(E.kwh.pm)}, de 7 h du matin à 1 h la nuit suivante. EDF les place entre le 1er novembre et le 31 mars ; ils peuvent se suivre et tomber un week-end ou un jour férié. C’est EDF, et non RTE, qui les décide : sa page des prochains jours EJP est mise à jour chaque jour vers 14 h, parfois jusqu’à 5 h du matin le jour même, et vaut pour toutes les zones EJP. L’outil ci-dessus relit ce service d’EDF et affiche la réponse pour demain, avec le nombre de jours restants dans la saison ${r.y}-${r.y + 1} (${h.num(r.restants)} sur ${h.num(r.quota)} au dernier relevé). L’option EJP n’est plus proposée aux nouveaux clients : un abonné qui la quitte pour Tempo ne pourra pas y revenir, d’où le calcul de comparaison qui suit, fait sur votre consommation.`;
    },
    faqs: (h) => [
      { q: 'À quelle heure sait-on si demain est un jour EJP ?', a: 'EDF indique sur sa page des jours EJP que l’information est mise à jour chaque jour vers 14 h, mais que des contraintes d’exploitation peuvent la retarder jusqu’à 5 h du matin du jour EJP. Le compteur, l’application EDF & Moi, les alertes par courriel ou SMS et le serveur vocal d’EDF au 09 70 83 33 33 relaient la même annonce.' },
      { q: 'Les jours EJP sont-ils les mêmes dans toutes les régions ?', a: 'Oui pour la période récente : EDF précise que les informations de sa page des jours EJP sont valables pour toutes les zones EJP. Le service que lit cette page ne renvoie d’ailleurs qu’un seul calendrier, sans découpage par zone.' },
      { q: 'Peut-on encore souscrire l’option EJP ?', a: 'Non. La grille d’EDF la dit en extinction et sa page précise qu’elle n’est plus commercialisée : seuls les clients qui l’ont déjà la gardent. Changer d’option, pour Tempo ou pour les Heures creuses, est donc un aller simple. Faites le calcul avant de demander le changement à EDF.' },
      { q: 'Un jour EJP est-il toujours un jour rouge Tempo ?', a: `Non. Les deux calendriers sont décidés par deux acteurs différents : EDF pour l’EJP, RTE pour Tempo. Ils se recoupent souvent parce qu’ils visent les mêmes journées froides, mais pas toujours : le tableau des saisons passées, plus bas, compte les jours EJP qui étaient aussi rouges en Tempo. Un jour EJP peut aussi tomber un samedi ou un dimanche, ce qu’un jour rouge ne fait jamais.` },
    ],
    body: (h) => {
      const E = h.P.ejp, S = saisons(h), F = foyers(h), r = h.M.ejpRestants(h.today);
      const tot = S.reduce((a, s) => a + s.n, 0), rouges = S.reduce((a, s) => a + s.rouges, 0), we = S.reduce((a, s) => a + s.weekend, 0);
      const t = h.P.tempo.kwh;
      return `
<h2>Où lire l’annonce officielle</h2>
<p>La seule source qui engage est EDF. Sa ${h.src('edfEjpJours', 'page des prochains jours EJP')} affiche aujourd’hui et demain ; la mise à jour se fait chaque jour vers 14 h et peut glisser jusqu’à 5 h du matin du jour EJP. EDF relaie la même information sur le compteur, dans l’application EDF & Moi, par courriel ou SMS une fois les alertes activées, et sur son serveur vocal au 09 70 83 33 33, joignable à toute heure. La grille de l’option rappelle que l’annonce arrive la veille, « sauf préavis plus court ».</p>
<p>Cette page relit plusieurs fois par jour le service qui alimente la page d’EDF, dont un passage peu après 14 h. Tant qu’EDF n’a rien publié pour demain, la carte affiche « pas encore annoncé » plutôt que de deviner. Après 14 h, si EDF n’a pas classé demain en jour EJP, elle l’écrit, en rappelant qu’une annonce tardive reste possible jusqu’à 5 h.</p>
<h2>Saison ${r.y}-${r.y + 1} : où en est-on</h2>
<p>Au dernier relevé, EDF compte ${h.num(r.tires)} jour${r.tires > 1 ? 's' : ''} EJP déjà annoncé${r.tires > 1 ? 's' : ''} sur ${h.num(r.quota)} pour l’hiver ${r.y}-${r.y + 1}, soit ${h.num(r.restants)} restant${r.restants > 1 ? 's' : ''}. ${r.jours.length ? `Jours EJP de la saison : ${r.jours.map((d) => h.date(d)).join(', ')}.` : 'Aucun jour EJP n’a encore été annoncé cet hiver.'}</p>
<h2>Les saisons passées, relevées chez EDF</h2>
${h.table(['Saison', 'Jours EJP', 'Premier', 'Dernier', 'Week-end', 'Aussi rouges Tempo'], S.map((s) => [`${s.y}-${s.y + 1}`, `${h.num(s.n)} / ${h.num(s.quota)}`, s.premier ? h.date(s.premier) : '-', s.dernier ? h.date(s.dernier) : '-', h.num(s.weekend), h.num(s.rouges)]), 'Jours EJP de chaque hiver selon le service d’EDF, croisés avec les couleurs Tempo publiées par RTE.', ['l', 'r', 'l', 'l', 'r', 'r'])}
<p>Sur ces ${h.num(S.length)} hivers, ${h.num(tot)} jours EJP ont été tirés ; ${h.num(rouges)} étaient aussi des jours rouges Tempo, soit ${h.pct(rouges / tot, 0)}, et ${h.num(we)} ${we > 1 ? 'tombaient' : 'tombait'} un samedi ou un dimanche. Le service d’EDF compte ${h.num(S[0]?.quota ?? 0)} jours pour l’hiver ${S[0] ? `${S[0].y}-${S[0].y + 1}` : ''}, le premier que son service renseigne ; tous les hivers suivants comptent ${h.num(E.jours)} jours.</p>
<h2>Les prix de l’option EJP au 1er août 2026</h2>
${h.table(['Puissance', 'Abonnement mensuel', 'kWh heures normales', 'kWh pointe mobile'], kva(h).map((k) => [`${k} kVA`, h.eur((h.P.ejp.abo as Record<string, number>)[String(k)], 2), cts(h, E.kwh.hn), cts(h, E.kwh.pm)]), 'Prix TTC de la grille EDF « Tarif Bleu - Option EJP » applicable au 1er août 2026.', ['l', 'r', 'r', 'r'])}
<p>Les prix viennent de la ${h.src('grilleEjp', 'grille EDF de l’option EJP')}, lue le 26 octobre 2026. L’option n’existe qu’en 9, 12, 15, 18 et 36 kVA. Hors des ${h.num(E.jours)} jours, le kWh à ${h.kwh(E.kwh.hn)} vaut jour et nuit : c’est plus cher que les heures creuses d’un jour bleu Tempo (${h.kwh(t.B.hc)}) mais à peine plus que ses heures pleines (${h.kwh(t.B.hp)}). Pendant les 18 heures de pointe mobile, le kWh EJP à ${h.kwh(E.kwh.pm)} reste en dessous des heures pleines d’un jour rouge Tempo (${h.kwh(t.R.hp)}).</p>
<h2>Faut-il passer de l’EJP à Tempo ?</h2>
<p>Les deux options ne punissent pas les mêmes heures. L’EJP fait payer cher 22 journées presque entières, de 7 h à 1 h, et pratique un prix unique le reste de l’année. Tempo fait payer très cher 22 jours rouges de 6 h à 22 h, moyennement 43 jours blancs, et offre ses meilleurs prix les autres jours, surtout la nuit. Le tableau ci-dessous applique les deux grilles à trois foyers chauffés à l’électricité.</p>
${h.table(['Foyer', 'EJP', 'Tempo', 'Tempo avec effort'], F.map((f) => [`${h.num(f.kwh)} kWh, ${f.kva} kVA, chauffage ${h.pct(f.ch, 0)}`, h.eur(f.ejp), h.eur(f.t0), h.eur(f.t50)]), 'Facture annuelle TTC, abonnement compris ; « avec effort » : moitié des heures pleines rouges décalée la nuit. Hypothèses dans le paragraphe qui suit.', ['l', 'r', 'r', 'r'])}
<p>Hypothèses, les mêmes que dans l’outil : les jours EJP et les jours rouges reçoivent la même part de la consommation, tirée de la consommation nationale ${h.src('eco2mix', 'éCO2mix de RTE')} qu’utilise aussi notre ${h.a('comparateur', 'comparateur Base, Heures creuses ou Tempo')} ; sur un jour EJP, 18 heures sur 24 sont facturées en pointe ; en Tempo, 35 % de la consommation tombe la nuit. Un foyer qui ne peut rien décaler les jours rouges a rarement intérêt à quitter l’EJP ; un foyer qui sait couper ou programmer son chauffage y trouve souvent son compte. Le détail des prix Tempo est sur la page ${h.a('tarif-tempo', 'tarif Tempo 2026')}, et la couleur du lendemain sur ${h.a('couleur-tempo-demain', 'couleur Tempo de demain')}.</p>
<h2>Un jour EJP, que faire</h2>
<ul>
<li>baisser le chauffage de un ou deux degrés entre 7 h et 1 h, ou prendre le relais avec un poêle ou un insert si vous en avez un, comme le conseille EDF ;</li>
<li>lancer lave-linge, sèche-linge et lave-vaisselle après 1 h du matin, par programmation différée ;</li>
<li>couper le ballon d’eau chaude en journée et le laisser chauffer entre 1 h et 7 h ;</li>
<li>surveiller les jours EJP qui se suivent : du 5 au 9 janvier 2026, EDF en a annoncé cinq d’affilée.</li>
</ul>
<p>Le signal ${h.a('ecowatt', 'Ecowatt de RTE')} est une autre alerte, qui ne change aucun prix : il dit quand le réseau est tendu. Il peut coïncider avec un jour EJP, sans que l’un entraîne l’autre.</p>`;
    },
  },
  en: {
    slug: 'ejp-tomorrow',
    nav: 'EJP tomorrow',
    card: 'Is tomorrow an EJP day? EDF’s announcement, the days left and how it compares with Tempo.',
    title: 'EJP Tomorrow: Is It an EJP Day? Days Left in 2026-2027',
    description: 'EJP tomorrow: the EJP day EDF announces around 14:00, the EJP days left out of 22, the option’s prices from 1 August 2026 and whether to switch to Tempo.',
    h1: 'EJP tomorrow: an EJP day or not?',
    intro: 'EDF’s announcement for tomorrow, the count of this winter’s EJP days and what the option costs you against Tempo.',
    resume: (h) => {
      const E = h.P.ejp, r = h.M.ejpRestants(h.today);
      return `An EJP day, short for « Effacement Jours de Pointe » (peak-day load shedding), is one of the ${E.jours} winter days on which a kWh on EDF’s EJP option rises from ${h.kwh(E.kwh.hn)} to ${h.kwh(E.kwh.pm)}, from 07:00 until 01:00 the following night. EDF places them between 1 November and 31 March; they can run back to back and fall on a weekend or bank holiday. EDF, not RTE, decides them: its upcoming EJP days page is updated every day around 14:00, sometimes as late as 05:00 on the day itself, and applies to every EJP zone. The tool above reads that EDF service and shows the answer for tomorrow, with the days left in the ${r.y}-${r.y + 1} season (${h.num(r.restants)} out of ${h.num(r.quota)} at the latest reading). The EJP option is closed to new customers, so a subscriber who leaves it for Tempo cannot come back, which is why the comparison below runs on your own consumption.`;
    },
    faqs: (h) => [
      { q: 'When do we know whether tomorrow is an EJP day?', a: 'EDF states on its EJP days page that the information is updated every day around 14:00, but that operating constraints can delay it until 05:00 on the EJP day itself. The meter, the EDF & Moi app, email or text alerts and EDF’s voice service on 09 70 83 33 33 all relay the same announcement.' },
      { q: 'Are EJP days the same in every region?', a: 'Yes for recent years: EDF says the information on its EJP days page is valid for every EJP zone. The service this page reads returns a single calendar, with no split by zone, so the answer shown in the card above applies whatever your EJP zone.' },
      { q: 'Can I still sign up for the EJP option?', a: 'No. EDF’s price grid lists it as being phased out and its page says it is no longer sold: only customers who already have it keep it. Moving to another option, Tempo or Off-peak, is therefore one-way. Run the numbers before asking EDF for the change.' },
      { q: 'Is an EJP day always a Tempo red day?', a: 'No. The two calendars are set by two different bodies: EDF for EJP, RTE for Tempo. They often overlap because both target the same cold days, but not always: the past-seasons table below counts the EJP days that were also red on Tempo. An EJP day can also fall on a Saturday or Sunday, which a red day never does.' },
    ],
    body: (h) => {
      const E = h.P.ejp, S = saisons(h), F = foyers(h), r = h.M.ejpRestants(h.today);
      const tot = S.reduce((a, s) => a + s.n, 0), rouges = S.reduce((a, s) => a + s.rouges, 0), we = S.reduce((a, s) => a + s.weekend, 0);
      const t = h.P.tempo.kwh;
      return `
<h2>Where to read the official announcement</h2>
<p>The only binding source is EDF. Its ${h.src('edfEjpJours', 'upcoming EJP days page')} shows today and tomorrow; it is updated every day around 14:00 and can slip to 05:00 on the EJP day. EDF repeats the same information on the meter, in the EDF & Moi app, by email or text once alerts are switched on, and on its voice service at 09 70 83 33 33, open around the clock. The option’s price grid notes that the notice comes the day before, « unless notice is shorter ».</p>
<p>This page reads the service behind EDF’s page several times a day, including a run shortly after 14:00. As long as EDF has published nothing for tomorrow, the card says « not announced yet » rather than guessing. After 14:00, if EDF has not made tomorrow an EJP day, the card says so and reminds you that a late announcement remains possible until 05:00.</p>
<h2>Season ${r.y}-${r.y + 1}: where things stand</h2>
<p>At the latest reading, EDF counts ${h.num(r.tires)} EJP day${r.tires === 1 ? '' : 's'} already announced out of ${h.num(r.quota)} for winter ${r.y}-${r.y + 1}, leaving ${h.num(r.restants)}. ${r.jours.length ? `EJP days this season: ${r.jours.map((d) => h.date(d)).join(', ')}.` : 'No EJP day has been announced yet this winter.'}</p>
<h2>Past seasons, as recorded by EDF</h2>
${h.table(['Season', 'EJP days', 'First', 'Last', 'Weekend', 'Also Tempo red'], S.map((s) => [`${s.y}-${s.y + 1}`, `${h.num(s.n)} / ${h.num(s.quota)}`, s.premier ? h.date(s.premier) : '-', s.dernier ? h.date(s.dernier) : '-', h.num(s.weekend), h.num(s.rouges)]), 'EJP days of each winter according to EDF’s service, cross-checked with the Tempo colours published by RTE.', ['l', 'r', 'l', 'l', 'r', 'r'])}
<p>Over these ${h.num(S.length)} winters, ${h.num(tot)} EJP days were called; ${h.num(rouges)} were also Tempo red days, that is ${h.pct(rouges / tot, 0)}, and ${h.num(we)} fell on a Saturday or Sunday. EDF’s service counts ${h.num(S[0]?.quota ?? 0)} days for winter ${S[0] ? `${S[0].y}-${S[0].y + 1}` : ''}, the first its service covers; every winter since has had ${h.num(E.jours)}.</p>
<h2>EJP option prices from 1 August 2026</h2>
${h.table(['Meter power', 'Monthly standing charge', 'kWh normal hours', 'kWh mobile peak'], kva(h).map((k) => [`${k} kVA`, h.eur((h.P.ejp.abo as Record<string, number>)[String(k)], 2), cts(h, E.kwh.hn), cts(h, E.kwh.pm)]), 'Prices incl. tax from EDF’s « Tarif Bleu - EJP option » grid applicable from 1 August 2026.', ['l', 'r', 'r', 'r'])}
<p>The prices come from ${h.src('grilleEjp', 'EDF’s EJP option grid')}, read on 26 October 2026. The option only exists at 9, 12, 15, 18 and 36 kVA. Outside the ${h.num(E.jours)} days, the ${h.kwh(E.kwh.hn)} kWh applies day and night: dearer than off-peak on a Tempo blue day (${h.kwh(t.B.hc)}) but only slightly above its peak rate (${h.kwh(t.B.hp)}). During the 18 mobile peak hours, the EJP kWh at ${h.kwh(E.kwh.pm)} stays below peak on a Tempo red day (${h.kwh(t.R.hp)}).</p>
<h2>Should you move from EJP to Tempo?</h2>
<p>The two options do not penalise the same hours. EJP charges a lot for 22 almost-whole days, from 07:00 to 01:00, and a single price the rest of the year. Tempo charges a great deal for 22 red days from 06:00 to 22:00, a moderate amount for 43 white days, and its best prices on all other days, especially at night. The table below applies both grids to three electrically heated households.</p>
${h.table(['Household', 'EJP', 'Tempo', 'Tempo with effort'], F.map((f) => [`${h.num(f.kwh)} kWh, ${f.kva} kVA, heating ${h.pct(f.ch, 0)}`, h.eur(f.ejp), h.eur(f.t0), h.eur(f.t50)]), 'Annual bill incl. tax and standing charge; « with effort »: half of red peak use shifted to the night. Assumptions in the next paragraph.', ['l', 'r', 'r', 'r'])}
<p>Assumptions, the same as in the tool: EJP days and red days take the same share of consumption, drawn from RTE’s ${h.src('eco2mix', 'éCO2mix')} national consumption, also used by our ${h.a('comparateur', 'Base, Off-peak or Tempo comparison')}; on an EJP day, 18 hours out of 24 are billed at the peak rate; on Tempo, 35% of use falls at night. A household that cannot shift anything on red days rarely gains by leaving EJP; one that can cut or schedule its heating often does. Tempo’s full prices are on the ${h.a('tarif-tempo', 'Tempo prices 2026')} page, and the next day’s colour on ${h.a('couleur-tempo-demain', 'tomorrow’s Tempo colour')}.</p>
<h2>On an EJP day</h2>
<ul>
<li>turn the heating down a degree or two between 07:00 and 01:00, or switch to a wood stove or insert if you have one, as EDF suggests;</li>
<li>run the washing machine, dryer and dishwasher after 01:00 using the delay timer;</li>
<li>switch the water heater off during the day and let it heat between 01:00 and 07:00;</li>
<li>watch for EJP days in a row: from 5 to 9 January 2026, EDF called five in a row.</li>
</ul>
<p>RTE’s ${h.a('ecowatt', 'Ecowatt signal')} is a separate alert that changes no price: it says when the grid is under strain. It can coincide with an EJP day without one causing the other.</p>`;
    },
  },
});

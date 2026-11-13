/** Accueil (page pilier) : texte des deux langues. Rendu par components/HomePage.astro. */
import type { Helpers, PageText } from '../lib/guide-types';

type Home = Omit<PageText, 'slug' | 'card' | 'nav'> & { calcTitle: string };

/** Trois foyers types, calculés par le moteur (mêmes valeurs dans les deux langues). */
const foyers = (h: Helpers) => {
  const M = h.M;
  return [
    { fr: 'Appartement, sans chauffage électrique', en: 'Flat, no electric heating', e: { kwh: 2800, kva: 6, chauffage: 0, partHC: 0.3 } },
    { fr: 'Maison avec pompe à chaleur', en: 'House with a heat pump', e: { kwh: 8000, kva: 9, chauffage: M.partChauffage(8000, 350), partHC: 0.35 } },
    { fr: 'Maison chauffée par radiateurs', en: 'House heated by radiators', e: { kwh: 14000, kva: 12, chauffage: M.partChauffage(14000, 380), partHC: 0.35 } },
  ].map((f) => ({ ...f, c: M.comparer(f.e), t50: M.coutOption('tempo', { ...f.e, effortRouge: 0.5 }).total }));
};
const saison = (h: Helpers) => { const y = h.M.seasonStart(h.today); return { y, r: h.M.remaining(y), last: h.M.lastPublished(y) }; };
/** Lecture du tableau des foyers types, tirée des chiffres du moteur (jamais écrite en dur). */
const verdict = (h: Helpers, F: ReturnType<typeof foyers>, fr: boolean) => {
  const [a, pac, rad] = F;
  const best = (f: (typeof F)[number]) => nomOpt(f.c.meilleure.o, fr);
  const hcOf = (f: (typeof F)[number]) => f.c.lignes[1].total;
  const gagne = (f: (typeof F)[number]) => f.t50 < Math.min(f.c.lignes[0].total, hcOf(f));
  return fr
    ? `Sans chauffage électrique, l’option la moins chère est ${best(a)} : les jours rouges n’y pèsent que leur part du calendrier. Dès que le chauffage compte, les jours rouges coûtent cher si l’on ne change rien : pour la maison avec pompe à chaleur, ${best(pac)} passe devant, de même pour la maison à radiateurs (${best(rad)}). Tout se joue sur l’effort : en reportant la moitié des heures pleines rouges, Tempo revient à ${h.eur(pac.t50)} pour la pompe à chaleur${gagne(pac) ? ', moins que les deux autres options' : ''} et à ${h.eur(rad.t50)} pour les radiateurs${gagne(rad) ? ', là aussi devant' : ', encore au-dessus des Heures creuses'}.`
    : `Without electric heating the cheapest option is ${best(a)}: red days only weigh their share of the calendar. Once heating counts, red days are costly if nothing changes: for the heat-pump house ${best(pac)} comes out ahead, and likewise for the radiator house (${best(rad)}). It all comes down to effort: shifting half of red-day peak use brings Tempo to ${h.eur(pac.t50)} for the heat pump${gagne(pac) ? ', below both other options' : ''} and ${h.eur(rad.t50)} for the radiators${gagne(rad) ? ', ahead there too' : ', still above Off-peak'}.`;
};
const nomOpt = (o: string, fr: boolean) => (o === 'base' ? 'Base' : o === 'hc' ? (fr ? 'Heures creuses' : 'Off-peak') : 'Tempo');

export const HOME: Record<'fr' | 'en', Home> = {
  fr: {
    title: 'Couleur Tempo EDF aujourd’hui et demain, saison 2026-2027',
    description: 'Couleur Tempo du jour et de demain publiée par RTE, jours rouges et blancs restants en 2026-2027, et comparateur Base, Heures creuses ou Tempo sans téléphone.',
    h1: 'Couleur Tempo aujourd’hui et demain',
    intro: 'La couleur Tempo d’EDF aujourd’hui et demain, publiée par RTE, les jours restants de la saison et l’option la moins chère pour vous, sans numéro de téléphone à laisser.',
    calcTitle: 'Base, Heures creuses ou Tempo : quelle option vous coûte le moins ?',
    resume: (h) => {
      const { y, r } = saison(h); const R = h.P.tempo_regles;
      return `La couleur Tempo est choisie chaque jour par RTE, le gestionnaire du réseau de transport, et publiée la veille à 10 h 30 : c’est cette publication qui fait foi pour tous les fournisseurs. Un jour Tempo court de 6 h du matin à 6 h le lendemain, avec des heures creuses de 22 h à 6 h. Une saison compte ${h.num(R.jours_rouges)} jours rouges, placés du 1er novembre au 31 mars en semaine, ${h.num(R.jours_blancs)} jours blancs, jamais un dimanche, et des jours bleus pour le reste. Dans la saison ${y}-${y + 1}, il reste ${h.num(r.R)} jours rouges, ${h.num(r.W)} jours blancs et ${h.num(r.B)} jours bleus. Au tarif réglementé du 1er août 2026, le kilowattheure d’un jour rouge en heures pleines coûte ${h.kwh(h.P.tempo.kwh.R.hp)}, contre ${h.kwh(h.P.tempo.kwh.B.hc)} en heures creuses d’un jour bleu. Le comparateur ci-dessus calcule, sur votre propre consommation, si Tempo vous fait gagner de l’argent face à la Base et aux Heures creuses.`;
    },
    faqs: (h) => {
      const R = h.P.tempo_regles, T = h.P.tempo.kwh;
      return [
        { q: 'À quelle heure connaît-on la couleur Tempo de demain ?', a: `RTE publie la couleur du lendemain chaque jour à 10 h 30, sur sa page « Calendrier Tempo » ; c’est cette couleur qui fait foi. Une indication peut paraître entre 8 h et 10 h 30, sans valeur contractuelle. Les fournisseurs relaient ensuite l’information par courriel, SMS ou application, et le compteur Linky l’affiche. Cette page se reconstruit plusieurs fois par jour après la publication de RTE.` },
        { q: 'Un jour rouge peut-il tomber un samedi ou un jour férié ?', a: `Non. Les ${h.num(R.jours_rouges)} jours rouges ne peuvent être placés qu’entre le 1er novembre et le 31 mars, du lundi au vendredi, hors jours fériés, et jamais plus de ${h.num(R.rouge_max_consecutifs)} jours d’affilée ; depuis le ${h.date(R.rouge_pp_depuis)}, ni le 24 ni le 31 décembre. Un samedi peut en revanche être blanc ; seul le dimanche est toujours bleu. Ces règles viennent de la délibération de la CRE de 2014 qui a confié le choix des jours à RTE, complétée par celle du 21 octobre 2026.` },
        { q: 'Pourquoi la couleur d’aujourd’hui change-t-elle à 6 h et pas à minuit ?', a: 'Une journée Tempo va de 6 h à 6 h le lendemain. Entre minuit et 6 h, vous êtes donc encore sur la couleur de la veille, au prix des heures creuses de cette couleur. Concrètement, la nuit qui suit un jour rouge reste facturée au prix « rouge heures creuses », un peu plus cher que les heures creuses d’un jour bleu, mais sans commune mesure avec les heures pleines.' },
        { q: 'Combien coûte un kWh un jour rouge en 2026 ?', a: `Au tarif réglementé applicable depuis le 1er août 2026, le kWh d’un jour rouge coûte ${h.kwh(T.R.hp)} TTC en heures pleines, de 6 h à 22 h, et ${h.kwh(T.R.hc)} en heures creuses. Un jour bleu, il revient à ${h.kwh(T.B.hp)} et ${h.kwh(T.B.hc)}. L’écart rouge heures pleines contre bleu heures creuses dépasse un facteur cinq, d’où l’intérêt de décaler ses usages ces jours-là.` },
        { q: 'Tempo est-il intéressant sans chauffage électrique ?', a: 'Souvent, oui : sans chauffage, les jours rouges ne pèsent que leur part du calendrier, environ 6 % de l’année, et le reste de l’année est facturé moins cher qu’en Base. Le calcul dépend toutefois de votre puissance et de vos heures creuses. Indiquez « Non » au chauffage dans le comparateur : il recalcule les trois options sur votre consommation annuelle.' },
        { q: 'Le site me demandera-t-il mes coordonnées pour voir le résultat ?', a: 'Non. Le calcul se fait entièrement dans votre navigateur, sans compte, sans numéro de téléphone et sans rappel commercial. Rien de ce que vous tapez n’est envoyé à un serveur. Le lien de partage reprend seulement vos saisies dans l’adresse de la page, pour que vous puissiez retrouver ou transmettre votre simulation.' },
        { q: 'Les jours restants affichés ici sont-ils fiables ?', a: 'Ils sont recalculés à partir de chaque couleur publiée par RTE depuis le 1er septembre, et le site vérifie que les trois totaux font bien la longueur de la saison. Il contrôle aussi qu’il reste assez de jours ouvrés avant le 31 mars pour placer les jours rouges restants. Un écart bloquerait la mise à jour plutôt que d’afficher un compte faux.' },
      ];
    },
    body: (h) => {
      const R = h.P.tempo_regles, T = h.P.tempo.kwh, { y, r, last } = saison(h), F = foyers(h), prof = h.M.PROFIL_CHAUFFAGE;
      const stats = h.M.seasonKeys().map((k) => h.M.seasonStats(Number(k.slice(0, 4)))).filter((s) => s.complete);
      // Premier rouge le plus précoce et le plus tardif, comparés en rang dans la saison.
      const rang = (s: { y: number; premierRouge: string | null }) => h.M.diffDays(`${s.y}-09-01`, s.premierRouge!);
      const tri = stats.filter((s) => s.premierRouge).sort((a, b) => rang(a) - rang(b));
      const tot = tri[0].premierRouge!, tard = tri[tri.length - 1].premierRouge!;
      const jour = (c: 'B' | 'W' | 'R') => h.M.coutJour(c, 40, 0.3);
      return `
<h2>Comment lire la couleur Tempo d’aujourd’hui et de demain</h2>
<p>La couleur d’un jour vaut pour une journée Tempo, de 6 h à 6 h le lendemain. Elle fixe deux prix : celui des heures pleines, de 6 h à 22 h, et celui des heures creuses, de 22 h à 6 h. Ces horaires sont les mêmes dans toute la France métropolitaine, parce qu’ils sont écrits dans le tarif, et non choisis par le gestionnaire de réseau local comme le sont les heures creuses de l’option classique.</p>
<p>RTE choisit la couleur la veille, en regardant la consommation nette prévue pour le lendemain, c’est-à-dire la consommation nationale moins la production éolienne et solaire. Depuis le 1er novembre 2026, la ${h.src('cre2026189', 'délibération de la CRE n° 2026-189')} lui fait tirer les jours rouges avec la méthode des jours de pointe du mécanisme de capacité : des seuils publiés par RTE pour chaque jour de l’hiver, dans un couloir mensuel qui borne le nombre de rouges cumulés à la fin de chaque mois, pour ne plus les entasser en fin d’hiver comme en mars 2026. Les jours blancs restent choisis par l’algorithme de la ${h.src('rteMethode', 'fiche de méthode')}, à seuils qui baissent au fil de la saison et selon le stock restant. Un froid vif en semaine et peu de vent : le jour devient rouge. Un temps doux : bleu. La couleur est publiée à ${R.publication.replace(':', ' h ')} sur le ${h.src('rteCalendrier', 'calendrier Tempo de RTE')}, qui précise qu’une indication non contractuelle peut paraître ${R.presignal}. À partir du ${h.date(R.rouge_annonce_j2_depuis)}, un jour rouge pourra être annoncé dès l’avant-veille, quand RTE le tire si tôt.</p>
<p>Vous la retrouvez aussi sur l’écran du compteur Linky, sur l’application ou dans les courriels de votre fournisseur. Cette page la relève directement chez RTE et se reconstruit plusieurs fois par jour : en haut de l’écran, la carte de gauche est la journée en cours, celle de droite le lendemain. Avant 10 h 30, la carte de demain indique simplement que la couleur n’est pas encore publiée.</p>

<h2>Les quotas d’une saison : ${h.num(R.jours_rouges)} rouges, ${h.num(R.jours_blancs)} blancs</h2>
<p>La saison Tempo commence le 1er septembre et finit le 31 août. Elle contient ${h.num(R.jours_rouges)} jours rouges et ${h.num(R.jours_blancs)} jours blancs ; tous les autres sont bleus, soit ${h.num(R.jours_bleus_annee_365)} sur une année de 365 jours. Les règles de placement, fixées par la ${h.src('creTempo2014', 'délibération de la CRE de 2014')}, sont simples : un rouge tombe du 1er novembre au 31 mars, du lundi au vendredi, hors jours fériés, jamais plus de ${h.num(R.rouge_max_consecutifs)} jours de suite et, depuis le ${h.date(R.rouge_pp_depuis)}, jamais le 24 ni le 31 décembre ; un blanc peut tomber toute l’année sauf le dimanche.</p>
${h.table(['Saison ' + y + '-' + (y + 1), 'Publiés', 'Restants', 'Quota'], [
  ['Jours rouges', h.num(r.u.R), h.num(r.R), h.num(r.q.R)],
  ['Jours blancs', h.num(r.u.W), h.num(r.W), h.num(r.q.W)],
  ['Jours bleus', h.num(r.u.B), h.num(r.B), h.num(r.q.B)],
], `Couleurs publiées par RTE jusqu’au ${last ? h.date(last) : h.date(h.today)} inclus.`, ['l', 'r', 'r', 'r'])}
<p>Les trois colonnes se tiennent : publiés et restants font toujours le quota, et les trois quotas font la longueur de la saison. Ce contrôle a l’air évident ; il ne l’est pas partout, et des calendriers en ligne affichent un nombre de jours bleus écoulés qui ne correspond pas à leur propre compteur. Ici, un écart bloque la mise à jour au lieu d’être publié. Le détail jour par jour et le premier jour rouge encore possible sont sur la page ${h.a('jours-tempo-restants', 'jours Tempo restants')}.</p>
<p>Une seule saison a dérogé aux quotas : en 2019-2020, la CRE a fait remplacer les jours rouges par des blancs à partir du 19 mars 2020, pendant le confinement, et la saison s’est close sur ${h.num(R.saison_2019_2020.rouges)} rouges et ${h.num(R.saison_2019_2020.blancs)} blancs. Depuis la reprise du choix par RTE en 2014, le premier jour rouge est tombé au plus tôt le ${h.date(tot)} et au plus tard le ${h.date(tard)} ; l’${h.a('historique-tempo', 'historique des saisons')} donne chaque date.</p>

<h2>Ce que coûte une journée de chaque couleur</h2>
<p>Le prix du kilowattheure Tempo dépend de la couleur et de l’heure, pas de la puissance du compteur : seul l’abonnement change avec les kVA. Voici la grille TTC applicable depuis le 1er août 2026, telle que la publie ${h.src('grilleEdf', 'EDF pour le Tarif Bleu')} sur proposition de la ${h.src('creTrve2026', 'CRE')}, que le Gouvernement a acceptée : ${h.src('spTrve2026', 'hausse moyenne de 2,5 % au 1er août 2026')}, pour environ 20 millions de foyers au tarif réglementé.</p>
${h.table(['Couleur', 'Heures creuses (22 h - 6 h)', 'Heures pleines (6 h - 22 h)', 'Journée de 40 kWh'], [
  ['Bleu', h.kwh(T.B.hc), h.kwh(T.B.hp), h.eur(jour('B'))],
  ['Blanc', h.kwh(T.W.hc), h.kwh(T.W.hp), h.eur(jour('W'))],
  ['Rouge', h.kwh(T.R.hc), h.kwh(T.R.hp), h.eur(jour('R'))],
], 'Journée de 40 kWh dont 30 % la nuit : une maison chauffée à l’électricité par temps froid.', ['l', 'r', 'r', 'r'])}
<p>Une même journée d’hiver coûte ainsi ${h.eur(jour('B'))} si elle est bleue et ${h.eur(jour('R'))} si elle est rouge. Tout l’enjeu de Tempo est là : les jours bleus et blancs sont moins chers que le kWh de la Base, à ${h.kwh(h.P.base.kwh['6'])} en 6 kVA, mais vingt-deux journées pèsent lourd si l’on ne change rien à ses habitudes. Faites l’essai sur votre propre consommation d’une journée :</p>
<!--mini:jourCouleur-->

<h2>Pourquoi nos calculs partent de la consommation nationale mesurée par RTE</h2>
<p>Les simulateurs Tempo qu’on trouve en ligne butent tous sur la même question : quelle part de votre consommation tombe un jour rouge ? Votre facture de l’an dernier le dit si vous étiez déjà en Tempo. Sinon, la plupart des outils supposent une répartition au prorata des jours, ce qui revient à dire qu’un radiateur consomme autant en août qu’en janvier. C’est faux, et c’est précisément le chauffage qui rend les jours rouges coûteux.</p>
<p>Nous avons donc croisé deux données publiques de RTE : la couleur de chaque jour depuis 2014 et la ${h.src('eco2mix', 'consommation nationale d’électricité jour par jour (éCO2mix)')}. En retirant de chaque journée le socle de consommation de l’été, il reste la part qui dépend du froid, celle du chauffage. Sur les ${h.num(h.M.PROFIL_SAISONS)} saisons closes, les jours rouges en ont porté en moyenne ${h.pct(prof.R)}, les blancs ${h.pct(prof.W)} et les bleus ${h.pct(prof.B)}, alors que les rouges ne représentent que ${h.pct(R.jours_rouges / 365)} des jours. Autrement dit, un kWh de chauffage a trois fois plus de chances de tomber un jour rouge qu’un kWh de réfrigérateur.</p>
<p>Le comparateur applique cette répartition à la seule part de votre consommation qui sert au chauffage, et la répartition calendaire au reste. Pour isoler votre chauffage, il suffit de connaître la consommation d’un mois d’été : douze fois ce mois donne votre socle, le reste est du chauffage. Aucun autre outil ne fait ce partage avec la mesure du réseau, et c’est ce qui évite de surestimer l’intérêt de Tempo pour une maison chauffée, ou de le sous-estimer pour un appartement.</p>

<h2>Base, Heures creuses ou Tempo : trois foyers types</h2>
<p>Le moteur du comparateur, appliqué à trois foyers fréquents, avec 30 à 35 % de consommation en heures creuses et sans effort particulier les jours rouges :</p>
${h.table(['Foyer', 'Base', 'Heures creuses', 'Tempo', 'Tempo, moitié reportée', 'La moins chère sans effort'], F.map((f) => [
  `${f.fr} (${h.num(f.e.kwh)} kWh, ${f.e.kva} kVA)`,
  ...f.c.lignes.map((l) => (l.dispo ? h.eur(l.total) : 'non proposée')),
  h.eur(f.t50),
  nomOpt(f.c.meilleure.o, true),
]), 'Coût annuel TTC, abonnement compris, tarif réglementé du 1er août 2026. « Moitié reportée » : la moitié des heures pleines des jours rouges déplacée après 22 h ou évitée.', ['l', 'r', 'r', 'r', 'r', 'l'])}
<p>${verdict(h, F, true)} Le ${h.a('comparateur', 'comparateur détaillé')} montre l’effet de chaque réglage, et le guide ${h.a('tempo-rentable', 'quand Tempo est-il rentable')} donne le seuil à partir duquel il cesse de l’être.</p>

<h2>Les nouvelles heures creuses ne touchent pas l’horaire de Tempo</h2>
<p>Depuis novembre 2025, Enedis déplace une partie des heures creuses de l’option Heures creuses vers l’après-midi, entre 11 h et 17 h, selon des ${h.src('creHc2026', 'règles fixées par la CRE')}. Huit heures creuses par jour restent garanties, dont au moins cinq consécutives la nuit. Cette réforme concerne les heures que place Enedis compteur par compteur. Celles de Tempo, de 22 h à 6 h, font partie du tarif lui-même : elles ne bougent pas. La page ${h.a('heures-creuses', 'nouvelles heures creuses')} détaille le calendrier, phase par phase, et calcule ce que le changement vous coûte si vos appareils restent programmés sur les anciens horaires.</p>

<h2>Sans numéro de téléphone, sans rappel</h2>
<p>Le marché de l’électricité est tenu par des comparateurs qui se rémunèrent en vous mettant en relation avec un fournisseur : la couleur du jour sert d’appât, et le bouton « être rappelé » n’est jamais loin. Ici, le résultat s’affiche tout de suite, il ne vous est demandé ni nom, ni numéro, ni adresse électronique, et aucun fournisseur ne nous paie. Les prix viennent des textes publiés par la CRE et de la grille officielle, la couleur de RTE, et chaque chiffre de la page est recalculé à partir d’eux.</p>

<h2>Bien vivre une saison Tempo</h2>
<ol>
<li>Programmez le ballon d’eau chaude et la recharge de la voiture entre 22 h et 6 h : c’est déjà le cas si le ballon est piloté par le contact heures creuses du compteur.</li>
<li>Abonnez-vous aux alertes de votre fournisseur, ou regardez cette page vers 11 h : la veille d’un rouge, il reste toute une soirée pour s’organiser.</li>
<li>Un jour rouge, baissez le chauffage d’un ou deux degrés entre 6 h et 22 h et relancez-le à 22 h ; une maison bien isolée garde sa chaleur plusieurs heures.</li>
<li>Gardez lave-linge, lave-vaisselle et four pour les soirs et les jours bleus ; le samedi peut être blanc, le dimanche jamais.</li>
<li>Vérifiez votre puissance : Tempo n’existe qu’à partir de ${h.num(h.P.tempo.kva_min)} kVA, et la ${h.a('puissance-compteur', 'puissance du compteur')} fixe votre abonnement.</li>
</ol>

<h2>Les autres calculs du site</h2>
<ul>
<li>${h.a('couleur-tempo-demain', 'Couleur Tempo de demain')} : ce que coûtera la journée selon votre consommation.</li>
<li>${h.a('tarif-tempo', 'Tarif Tempo 2026')} : la facture d’une année à partir de vos kWh par couleur.</li>
<li>${h.a('prix-kwh', 'Prix du kWh au Tarif Bleu')} : le prix moyen tout compris de chaque option.</li>
<li>${h.a('jour-rouge-tempo', 'Que faire un jour rouge')} et ${h.a('jour-blanc-tempo', 'les jours blancs')}.</li>
<li>${h.a('recharge-voiture-tempo', 'Recharger une voiture électrique en Tempo')} et ${h.a('chauffage-electrique-tempo', 'se chauffer à l’électricité en Tempo')}.</li>
</ul>`;
    },
  },
  en: {
    title: 'Tempo Colour Today and Tomorrow: 2026-2027 Season, RTE',
    description: 'Today’s and tomorrow’s Tempo colour as published by RTE, red and white days left in 2026-2027, and a Base, Off-peak or Tempo comparison with no phone number.',
    h1: 'Tempo colour today and tomorrow',
    intro: 'The Tempo colour for today and tomorrow as published by RTE, the days left and the cheapest option for you, with no phone number to leave.',
    calcTitle: 'Base, Off-peak or Tempo: which option costs you least?',
    resume: (h) => {
      const { y, r } = saison(h); const R = h.P.tempo_regles;
      return `The Tempo colour is chosen every day by RTE, the French transmission grid operator, and published the day before at 10:30: that publication is binding on every supplier. A Tempo day runs from 06:00 to 06:00 the next morning, with off-peak hours from 22:00 to 06:00. A season holds ${h.num(R.jours_rouges)} red days, placed between 1 November and 31 March on weekdays, ${h.num(R.jours_blancs)} white days, never on a Sunday, and blue days for the rest. In the ${y}-${y + 1} season there are ${h.num(r.R)} red days, ${h.num(r.W)} white days and ${h.num(r.B)} blue days left. On the regulated tariff in force since 1 August 2026, a kilowatt-hour on a red day at peak time costs ${h.kwh(h.P.tempo.kwh.R.hp)}, against ${h.kwh(h.P.tempo.kwh.B.hc)} off-peak on a blue day. The comparison tool above works out, on your own consumption, whether Tempo saves you money against the Base and Off-peak options.`;
    },
    faqs: (h) => {
      const R = h.P.tempo_regles, T = h.P.tempo.kwh;
      return [
        { q: 'What time is tomorrow’s Tempo colour announced?', a: 'RTE publishes the next day’s colour every day at 10:30 on its Tempo calendar page, and that colour is binding. An early indication may appear between 08:00 and 10:30 with no contractual value. Suppliers then pass it on by email, text or app, and the Linky meter displays it. This page rebuilds several times a day after RTE publishes.' },
        { q: 'Can a red day fall on a Saturday or a bank holiday?', a: `No. The ${h.num(R.jours_rouges)} red days can only be placed between 1 November and 31 March, Monday to Friday, excluding public holidays, and never more than ${h.num(R.rouge_max_consecutifs)} days in a row; since ${h.date(R.rouge_pp_depuis)}, never on 24 or 31 December either. A Saturday can be white, though; only Sunday is always blue. These rules come from the 2014 CRE deliberation that handed the choice of days to RTE, supplemented by the one of 21 October 2026.` },
        { q: 'Why does today’s colour switch at 06:00 rather than midnight?', a: 'A Tempo day runs from 06:00 to 06:00 the next day. Between midnight and 06:00 you are still on the previous day’s colour, at that colour’s off-peak price. In practice the night after a red day is billed at the red off-peak rate, slightly dearer than blue off-peak but nowhere near the red peak rate.' },
        { q: 'How much is a kWh on a red day in 2026?', a: `On the regulated tariff in force since 1 August 2026, a red-day kWh costs ${h.kwh(T.R.hp)} including tax at peak time, 06:00 to 22:00, and ${h.kwh(T.R.hc)} off-peak. On a blue day it costs ${h.kwh(T.B.hp)} and ${h.kwh(T.B.hc)}. Red peak against blue off-peak is more than a fivefold gap, which is why shifting use on those days pays.` },
        { q: 'Is Tempo worth it without electric heating?', a: 'Often, yes: without heating, red days only weigh their share of the calendar, about 6% of the year, and the rest of the year is billed below the Base rate. The answer still depends on your meter power and your off-peak share. Set heating to “No” in the comparison tool and it reruns all three options on your annual use.' },
        { q: 'Will the site ask for my details before showing the result?', a: 'No. The calculation runs entirely in your browser, with no account, no phone number and no sales call-back. Nothing you type is sent to a server. The share link only puts your inputs in the page address, so you can come back to your simulation or pass it on.' },
        { q: 'Can I trust the days-left figures shown here?', a: 'They are recounted from every colour RTE has published since 1 September, and the site checks that the three totals add up to the length of the season. It also checks that enough weekdays remain before 31 March to place the red days still to come. A mismatch blocks the update rather than publishing a wrong count.' },
      ];
    },
    body: (h) => {
      const R = h.P.tempo_regles, T = h.P.tempo.kwh, { y, r, last } = saison(h), F = foyers(h), prof = h.M.PROFIL_CHAUFFAGE;
      const jour = (c: 'B' | 'W' | 'R') => h.M.coutJour(c, 40, 0.3);
      return `
<h2>How to read the Tempo colour for today and tomorrow</h2>
<p>A colour applies to one Tempo day, from 06:00 to 06:00 the following morning. It sets two prices: peak hours from 06:00 to 22:00 and off-peak hours from 22:00 to 06:00. Those hours are the same everywhere in mainland France, because they are written into the tariff itself rather than set meter by meter by the local network operator, as the off-peak hours of the standard HP/HC option are.</p>
<p>RTE picks the colour the day before, looking at the next day’s forecast net demand, meaning national consumption minus wind and solar output. Since 1 November 2026, ${h.src('cre2026189', 'CRE deliberation no. 2026-189')} has it draw red days with the peak-day method of the capacity mechanism: thresholds RTE publishes for every day of the winter, within a monthly corridor that caps the number of red days used by the end of each month, so they no longer pile up at the end of winter as in March 2026. White days are still chosen by the algorithm in the ${h.src('rteMethode', 'method note')}, with thresholds that fall as the season goes on and as the stock left shrinks. A cold, still weekday turns red; a mild one stays blue. The colour is published at 10:30 on ${h.src('rteCalendrier', 'RTE’s Tempo calendar')}, which adds that a non-binding indication may appear between 08:00 and 10:30. From ${h.date(R.rouge_annonce_j2_depuis)}, a red day may be announced two days ahead when RTE draws it that early.</p>
<p>You will also see it on the Linky meter display, in your supplier’s app or in its emails. This page reads it straight from RTE and rebuilds several times a day: at the top of the screen, the left card is the current day and the right card is tomorrow. Before 10:30, tomorrow’s card simply says the colour is not out yet.</p>

<h2>A season’s quotas: ${h.num(R.jours_rouges)} red, ${h.num(R.jours_blancs)} white</h2>
<p>The Tempo season starts on 1 September and ends on 31 August. It contains ${h.num(R.jours_rouges)} red days and ${h.num(R.jours_blancs)} white days; every other day is blue, ${h.num(R.jours_bleus_annee_365)} in a 365-day year. The placement rules, set by the ${h.src('creTempo2014', 'energy regulator’s 2014 deliberation')}, are simple: a red day falls between 1 November and 31 March, Monday to Friday, never on a public holiday, never more than ${h.num(R.rouge_max_consecutifs)} days running and, since ${h.date(R.rouge_pp_depuis)}, never on 24 or 31 December; a white day can fall any day of the year except Sunday.</p>
${h.table(['Season ' + y + '-' + (y + 1), 'Published', 'Left', 'Quota'], [
  ['Red days', h.num(r.u.R), h.num(r.R), h.num(r.q.R)],
  ['White days', h.num(r.u.W), h.num(r.W), h.num(r.q.W)],
  ['Blue days', h.num(r.u.B), h.num(r.B), h.num(r.q.B)],
], `Colours published by RTE up to and including ${last ? h.date(last) : h.date(h.today)}.`, ['l', 'r', 'r', 'r'])}
<p>The columns hold together: published plus left always equals the quota, and the three quotas add up to the length of the season. It sounds obvious, yet some calendars online show a count of blue days gone that does not match their own counter. Here a mismatch stops the update instead of going live. The day-by-day view and the earliest date a red day can still fall are on the ${h.a('jours-tempo-restants', 'Tempo days left')} page.</p>
<p>Only one season broke the quotas: in 2019-2020 the regulator had red days swapped for white ones from 19 March 2020, during lockdown, and the season closed on ${h.num(R.saison_2019_2020.rouges)} red and ${h.num(R.saison_2019_2020.blancs)} white days. The ${h.a('historique-tempo', 'season history')} lists the first and last red day of every winter since 2014.</p>

<h2>What a day of each colour costs</h2>
<p>The Tempo price per kilowatt-hour depends on the colour and the hour, not on the meter power: only the standing charge changes with the kVA. Here is the grid including tax that applies from 1 August 2026, as published by ${h.src('grilleEdf', 'EDF for the regulated Tarif Bleu')} on the ${h.src('creTrve2026', 'regulator’s proposal')}, which the Government accepted: an ${h.src('spTrve2026', 'average rise of 2.5% on 1 August 2026')}, for some 20 million households on the regulated tariff.</p>
${h.table(['Colour', 'Off-peak (22:00-06:00)', 'Peak (06:00-22:00)', '40 kWh day'], [
  ['Blue', h.kwh(T.B.hc), h.kwh(T.B.hp), h.eur(jour('B'))],
  ['White', h.kwh(T.W.hc), h.kwh(T.W.hp), h.eur(jour('W'))],
  ['Red', h.kwh(T.R.hc), h.kwh(T.R.hp), h.eur(jour('R'))],
], 'A 40 kWh day with 30% at night: an electrically heated house in cold weather.', ['l', 'r', 'r', 'r'])}
<p>The same winter day therefore costs ${h.eur(jour('B'))} if it is blue and ${h.eur(jour('R'))} if it is red. That is the whole Tempo bargain: blue and white days are cheaper than the Base rate of ${h.kwh(h.P.base.kwh['6'])} at 6 kVA, but twenty-two days weigh heavily if you change nothing. Try it on one day of your own use:</p>
<!--mini:jourCouleur-->

<h2>Why our figures start from national demand measured by RTE</h2>
<p>Every online Tempo calculator runs into the same question: how much of your use falls on red days? Last year’s bill tells you if you were already on Tempo. Otherwise most tools assume a split in proportion to the number of days, which amounts to saying that a radiator uses as much in August as in January. It does not, and heating is exactly what makes red days expensive.</p>
<p>So we combined two public RTE datasets: the colour of every day since 2014 and ${h.src('eco2mix', 'national electricity demand day by day (éCO2mix)')}. Taking the summer baseline away from each day leaves the part that depends on the cold, which is heating. Over the ${h.num(h.M.PROFIL_SAISONS)} completed seasons, red days carried on average ${h.pct(prof.R)} of it, white days ${h.pct(prof.W)} and blue days ${h.pct(prof.B)}, while red days are only ${h.pct(R.jours_rouges / 365)} of the calendar. Put differently, a heating kWh is three times more likely to land on a red day than a fridge kWh.</p>
<p>The comparison tool applies that split to the heating part of your use only, and the calendar split to the rest. To isolate your heating you only need one summer month’s consumption: twelve times that month gives your baseline, the remainder is heating. No other tool divides consumption this way with the grid’s own measurements, and it avoids overstating Tempo for a heated house or understating it for a flat.</p>

<h2>Base, Off-peak or Tempo: three typical households</h2>
<p>The comparison engine applied to three common households, with 30 to 35% of use off-peak and no special effort on red days:</p>
${h.table(['Household', 'Base', 'Off-peak', 'Tempo', 'Tempo, half shifted', 'Cheapest with no effort'], F.map((f) => [
  `${f.en} (${h.num(f.e.kwh)} kWh, ${f.e.kva} kVA)`,
  ...f.c.lignes.map((l) => (l.dispo ? h.eur(l.total) : 'not offered')),
  h.eur(f.t50),
  nomOpt(f.c.meilleure.o, false),
]), 'Annual cost including tax and standing charge, regulated tariff of 1 August 2026. “Half shifted”: half of red-day peak use moved after 22:00 or avoided.', ['l', 'r', 'r', 'r', 'r', 'l'])}
<p>${verdict(h, F, false)} The ${h.a('comparateur', 'detailed comparison')} shows the effect of each setting, and the guide ${h.a('tempo-rentable', 'when Tempo pays off')} gives the point at which it stops paying.</p>

<h2>The new off-peak hours leave Tempo’s timetable alone</h2>
<p>Since November 2025 Enedis, the distribution network operator, has been moving part of the standard option’s off-peak hours to the afternoon, between 11:00 and 17:00, under ${h.src('creHc2026', 'rules set by the regulator')}. Eight off-peak hours a day remain guaranteed, at least five of them consecutive at night. The reform concerns the hours Enedis sets meter by meter. Tempo’s 22:00 to 06:00 window is part of the tariff itself and does not move. The ${h.a('heures-creuses', 'new off-peak hours')} page sets out the timetable phase by phase and works out what the change costs if your appliances stay on the old schedule.</p>

<h2>No phone number, no call-back</h2>
<p>The French electricity market is dominated by comparison sites paid to put you in touch with a supplier: the colour of the day is the bait, and a “call me back” button is never far away. Here the result appears straight away, nobody asks for your name, number or email address, and no supplier pays us. Prices come from the regulator’s published texts and the official grid, the colour from RTE, and every figure on the page is recalculated from them.</p>

<h2>Living with a Tempo season</h2>
<ol>
<li>Schedule the water heater and car charging between 22:00 and 06:00; a water heater wired to the meter’s off-peak contact already does this.</li>
<li>Sign up to your supplier’s alerts or check this page around 11:00: the evening before a red day leaves time to plan.</li>
<li>On a red day, lower the heating by one or two degrees between 06:00 and 22:00 and bring it back at 22:00; a well-insulated house holds its warmth for hours.</li>
<li>Keep the washing machine, dishwasher and oven for evenings and blue days; Saturday can be white, Sunday never.</li>
<li>Check your power: Tempo only exists from ${h.num(h.P.tempo.kva_min)} kVA, and the ${h.a('puissance-compteur', 'meter power')} sets your standing charge.</li>
</ol>

<h2>The site’s other calculations</h2>
<ul>
<li>${h.a('couleur-tempo-demain', 'Tomorrow’s Tempo colour')}: what the day will cost on your consumption.</li>
<li>${h.a('tarif-tempo', 'Tempo prices 2026')}: a year’s bill from your kWh by colour.</li>
<li>${h.a('prix-kwh', 'Price per kWh on the Tarif Bleu')}: the all-in average price of each option.</li>
<li>${h.a('jour-rouge-tempo', 'What to do on a red day')} and ${h.a('jour-blanc-tempo', 'white days')}.</li>
<li>${h.a('recharge-voiture-tempo', 'Charging an electric car on Tempo')} and ${h.a('chauffage-electrique-tempo', 'electric heating on Tempo')}.</li>
</ul>`;
    },
  },
};

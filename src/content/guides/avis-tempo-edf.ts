import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Cinq profils : facture Tempo (sans effort, 25 %, 50 % des heures pleines rouges décalées) face à Base et Heures creuses. */
const PROFILS: Array<[number, number, number]> = [[3000, 6, 0], [6000, 6, 0.1], [9000, 9, 0.5], [12000, 9, 0.5], [14000, 12, 0.65]];
const profils = (h: Helpers) => PROFILS.map(([kwh, kva, ch]) => {
  const e = { kwh, kva, chauffage: ch, partHC: 0.35 };
  const t = (eff: number) => h.M.coutOption('tempo', { ...e, effortRouge: eff }).total;
  return { kwh, kva, ch, base: h.M.coutOption('base', e).total, hc: h.M.coutOption('hc', e).total, t0: t(0), t25: t(0.25), t50: t(0.5) };
});

export default defineGuide({
  id: 'avis-tempo-edf',
  group: 'tempo',
  order: 13,
  mini: 'avisTempo',
  miniHref: 'comparateur',
  related: ['tempo-rentable', 'comparateur', 'tarif-tempo', 'jour-rouge-tempo', 'chauffage-electrique-tempo'],
  sources: ['grilleEdf', 'creTempo2014', 'creTrve2026', 'eco2mix', 'rteCalendrier'],
  fr: {
    slug: 'avis-tempo-edf',
    nav: 'Avis sur Tempo',
    card: 'Les points forts et les pièges de l’option Tempo d’EDF, chiffrés sur cinq profils de foyers.',
    title: 'Tempo EDF : avis 2026, avantages, pièges et vrai coût',
    description: 'Tempo EDF, notre avis 2026 : 300 jours bleus moins chers que la Base, 22 jours rouges à 0,7295 € le kWh. Le bilan chiffré sur cinq foyers et sur le vôtre.',
    h1: 'Tempo EDF : notre avis, chiffres à l’appui',
    intro: 'Pas de témoignage recopié : les prix de la grille, les règles de RTE et le calcul sur des foyers réels, du studio à la maison chauffée à l’électricité.',
    resume: (h) => {
      const T = h.P.tempo.kwh, Q = h.P.tempo_regles, P = profils(h);
      return `Notre avis sur Tempo tient en une phrase : c’est l’option la moins chère du tarif réglementé pour la plupart des foyers qui ne se chauffent pas à l’électricité, et un pari pour ceux qui le font. Sur ${Q.jours_bleus_annee_365} jours bleus par an, le kWh coûte ${h.kwh(T.B.hp)} en heures pleines et ${h.kwh(T.B.hc)} la nuit, moins que les ${h.kwh(h.P.base.kwh['6'])} de l’option Base. Sur ${Q.jours_blancs} jours blancs, il reste proche de la Base. Mais ${Q.jours_rouges} jours rouges, en semaine entre novembre et mars, facturent l’heure pleine ${h.kwh(T.R.hp)}, plus de quatre fois le prix d’un jour bleu. Un foyer de ${h.num(P[1].kwh)} kWh peu chauffé économise ${h.eur(P[1].base - P[1].t0)} par an face à la Base sans rien changer. Une maison de ${h.num(P[2].kwh)} kWh chauffée pour moitié à l’électricité paie ${h.eur(P[2].t0 - P[2].base)} de plus si elle ne fait aucun effort, et en gagne ${h.eur(P[2].base - P[2].t50)} si elle reporte la moitié de ses heures pleines rouges la nuit. Tout se joue donc sur le chauffage et sur la discipline des jours rouges.`;
    },
    faqs: (h) => [
      { q: 'Quels sont les vrais points faibles de Tempo ?', a: `Trois : le prix rouge, ${h.kwh(h.P.tempo.kwh.R.hp)} le kWh de 6 h à 22 h, qui tombe justement les jours froids ; la contrainte de suivre la couleur chaque jour à partir de 10 h 30 ; et l’absence de Tempo en 3 kVA. Un foyer absent en journée s’en accommode bien, un foyer qui chauffe tout à l’électricité avec des radiateurs sans programmation souffre.` },
      { q: 'Peut-on quitter Tempo si l’hiver se passe mal ?', a: 'Oui : on demande à EDF de changer d’option au sein du tarif réglementé ; Base, Heures creuses et Tempo restent ouvertes jusqu’à 36 kVA, sauf la Base au-delà de 6 kVA pour les nouveaux contrats. Sortir en plein hiver ne rembourse pas les jours rouges déjà passés ; mieux vaut juger sur une saison complète, de septembre à août.' },
      { q: 'Sans chauffage électrique, Tempo reste-t-il gagnant ?', a: `Presque toujours. Sans chauffage, les jours rouges reçoivent la même part de la consommation que les autres jours, soit ${h.pct(h.P.tempo_regles.jours_rouges / 365)} : leur surcoût est largement compensé par les ${h.P.tempo_regles.jours_bleus_annee_365} jours bleus. Le tableau de cette page le montre pour un petit et un moyen consommateur ; la marge grandit avec un ballon d’eau chaude et une voiture rechargés la nuit.` },
      { q: 'Les jours rouges tombent-ils toujours aux mêmes dates ?', a: 'Non. RTE les place la veille, selon la consommation prévue, entre le 1er novembre et le 31 mars, jamais le week-end, avec au plus cinq rouges d’affilée. Un hiver doux les repousse vers la fin de saison, un froid précoce les avance. L’historique des saisons passées se consulte sur la page dédiée.' },
    ],
    body: (h) => {
      const T = h.P.tempo.kwh, P = profils(h);
      const lig = (p: ReturnType<typeof profils>[number]) => [`${h.num(p.kwh)} kWh, ${p.kva} kVA, chauffage ${h.pct(p.ch, 0)}`, h.eur(p.base), h.eur(p.hc), h.eur(p.t0), h.eur(p.t25), h.eur(p.t50)];
      return `
<h2>Ce qui plaît dans Tempo</h2>
<ul>
<li><strong>Le prix des jours bleus.</strong> ${h.kwh(T.B.hc)} la nuit et ${h.kwh(T.B.hp)} le jour, contre ${h.kwh(h.P.hc.hc)} et ${h.kwh(h.P.hc.hp)} en Heures creuses : sur l’essentiel de l’année, Tempo est l’option la moins chère du tarif réglementé.</li>
<li><strong>Un abonnement un peu plus bas.</strong> ${h.eur(h.P.tempo.abo['9'], 2)} par mois en 9 kVA, contre ${h.eur(h.P.base.abo['9'], 2)} en Base ou en Heures creuses.</li>
<li><strong>Des règles publiques.</strong> Le nombre de jours de chaque couleur et les heures creuses de 22 h à 6 h sont fixés par la ${h.src('creTempo2014', 'délibération de la CRE de 2014')} ; la couleur est publiée par RTE à 10 h 30 la veille, sans surprise de dernière minute.</li>
<li><strong>Un prix réglementé.</strong> Tempo reste une option du Tarif Bleu : ses prix bougent avec les autres, par décision publique sur proposition de la ${h.src('creTrve2026', 'CRE')}, deux fois par an.</li>
</ul>
<h2>Ce qui pique</h2>
<ul>
<li><strong>Le jour rouge en heures pleines.</strong> ${h.kwh(T.R.hp)} le kWh de 6 h à 22 h, ${h.num(T.R.hp / T.B.hp, 1)} fois le prix d’un jour bleu. Un radiateur de 2 kW allumé huit heures coûte ${h.eur(2 * 8 * T.R.hp, 2)} ce jour-là.</li>
<li><strong>Le calendrier.</strong> Les ${h.P.tempo_regles.jours_rouges} rouges tombent en semaine pendant les grands froids, quand le chauffage tourne le plus : un logement chauffé à l’électricité y concentre une part de sa consommation bien supérieure à leur part des jours.</li>
<li><strong>L’attention quotidienne.</strong> Il faut savoir la couleur du lendemain et décaler lessives, recharge ou chauffage ; un foyer qui ne veut pas y penser perd une partie de l’intérêt.</li>
<li><strong>Pas de 3 kVA.</strong> Tempo commence à ${h.P.tempo.kva_min} kVA, ce qui écarte les plus petits logements.</li>
</ul>
<h2>Le verdict sur cinq foyers</h2>
${h.table(['Foyer', 'Base', 'Heures creuses', 'Tempo sans effort', 'Tempo, 25 % décalé', 'Tempo, 50 % décalé'], P.map(lig), 'Facture annuelle TTC, abonnement compris, grille du 1er août 2026. 35 % de la consommation la nuit ; « décalé » : part des heures pleines rouges reportée en heures creuses. Part du chauffage par couleur tirée d’éCO2mix.', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>La lecture est nette. Sans chauffage électrique, ou presque, Tempo gagne dès la première année sans aucun effort. Avec la moitié de la consommation en chauffage, il perd face aux Heures creuses tant qu’on ne fait rien les jours rouges, et redevient le moins cher quand on décale la moitié des heures pleines rouges. La part du chauffage qui tombe ces jours-là vient de la consommation nationale ${h.src('eco2mix', 'éCO2mix de RTE')} sur douze hivers ; un logement mieux isolé que la moyenne fait mieux que le tableau. Le seuil exact de votre foyer se calcule sur ${h.a('tempo-rentable', 'Tempo est-il rentable ?')}, et le mini-calculateur ci-dessus donne le bilan d’une année avec votre propre effort.</p>
<h2>Pour qui, et pour qui pas</h2>
<p>Tempo convient au foyer qui consomme beaucoup la nuit, avec un ballon d’eau chaude ou une voiture électrique, à celui qui se chauffe au gaz, au bois ou par pompe à chaleur et n’a que de petites pointes l’hiver, et à celui qui peut baisser le chauffage quelques heures ou lancer ses machines après 22 h les ${h.P.tempo_regles.jours_rouges} jours rouges. Il convient mal au logement chauffé tout électrique, mal isolé, habité en journée, sans programmation des radiateurs : le prix rouge s’y paie à plein. Pour préparer un jour rouge, la page ${h.a('jour-rouge-tempo', 'jour rouge Tempo')} liste les gestes qui comptent ; pour suivre les couleurs, la ${h.a('couleur-tempo-demain', 'couleur Tempo de demain')} est relevée chez RTE plusieurs fois par jour, selon le ${h.src('rteCalendrier', 'calendrier officiel')}.</p>
<p>Enfin, Tempo n’enferme pas : on peut demander à EDF de changer d’option au sein du tarif réglementé, et les prix de la ${h.src('grilleEdf', 'grille du Tarif Bleu')} sont les mêmes pour tous les abonnés. Le ${h.a('comparateur', 'comparateur Base, Heures creuses ou Tempo')} refait le calcul complet avec vos index.</p>`;
    },
  },
  en: {
    slug: 'tempo-edf-review',
    nav: 'Tempo review',
    card: 'The strengths and pitfalls of EDF’s Tempo option, worked out on five household profiles.',
    title: 'Tempo EDF Review 2026: Pros, Pitfalls and the Real Cost',
    description: 'Tempo EDF review for 2026: 300 blue days cheaper than Base, 22 red days at €0.7295 per kWh. The figures for five households, and a calculator for your own home.',
    h1: 'Tempo EDF: our review, with the numbers',
    intro: 'No copied testimonials: the grid prices, RTE’s rules and the calculation on real households, from a studio to an electrically heated house.',
    resume: (h) => {
      const T = h.P.tempo.kwh, Q = h.P.tempo_regles, P = profils(h);
      return `Our view of Tempo fits in one sentence: it is the cheapest option of the regulated tariff for most households that do not heat with electricity, and a gamble for those that do. On ${Q.jours_bleus_annee_365} blue days a year a kWh costs ${h.kwh(T.B.hp)} at peak and ${h.kwh(T.B.hc)} at night, less than the ${h.kwh(h.P.base.kwh['6'])} of the Base option. On ${Q.jours_blancs} white days it stays close to Base. But ${Q.jours_rouges} red days, on weekdays between November and March, bill the peak hour at ${h.kwh(T.R.hp)}, more than four times the blue-day price. A ${h.num(P[1].kwh)} kWh household with little heating saves ${h.eur(P[1].base - P[1].t0)} a year against Base without changing a thing. A ${h.num(P[2].kwh)} kWh house heated half by electricity pays ${h.eur(P[2].t0 - P[2].base)} more if it makes no effort, and saves ${h.eur(P[2].base - P[2].t50)} if it moves half of its red peak use to the night. It all comes down to heating and to discipline on red days.`;
    },
    faqs: (h) => [
      { q: 'What are Tempo’s real weak points?', a: `Three: the red price, ${h.kwh(h.P.tempo.kwh.R.hp)} per kWh from 06:00 to 22:00, which falls precisely on cold days; having to follow the colour every day from 10:30; and no Tempo at 3 kVA. A household that is out during the day copes well; one that heats everything with unprogrammed electric radiators suffers.` },
      { q: 'Can I leave Tempo if the winter goes badly?', a: 'Yes: you ask EDF to switch option within the regulated tariff; Base, Off-peak and Tempo stay open up to 36 kVA, except Base above 6 kVA for new contracts. Leaving mid-winter does not refund the red days already gone; it is better to judge over a full season, from September to August.' },
      { q: 'With no electric heating, does Tempo still come out ahead?', a: `Almost always. Without heating, red days take the same share of consumption as other days, ${h.pct(h.P.tempo_regles.jours_rouges / 365)}: their extra cost is easily outweighed by the ${h.P.tempo_regles.jours_bleus_annee_365} blue days. The table on this page shows it for a small and a medium user; the margin grows with a water heater and a car charged at night.` },
      { q: 'Do red days always fall on the same dates?', a: 'No. RTE sets them the day before, based on forecast demand, between 1 November and 31 March, never at weekends, with at most five reds in a row. A mild winter pushes them towards the end of the season, an early cold snap brings them forward. Past seasons can be checked on the history page.' },
    ],
    body: (h) => {
      const T = h.P.tempo.kwh, P = profils(h);
      const lig = (p: ReturnType<typeof profils>[number]) => [`${h.num(p.kwh)} kWh, ${p.kva} kVA, heating ${h.pct(p.ch, 0)}`, h.eur(p.base), h.eur(p.hc), h.eur(p.t0), h.eur(p.t25), h.eur(p.t50)];
      return `
<h2>What people like about Tempo</h2>
<ul>
<li><strong>The blue-day price.</strong> ${h.kwh(T.B.hc)} at night and ${h.kwh(T.B.hp)} by day, against ${h.kwh(h.P.hc.hc)} and ${h.kwh(h.P.hc.hp)} on Off-peak: for most of the year Tempo is the cheapest option of the regulated tariff.</li>
<li><strong>A slightly lower standing charge.</strong> ${h.eur(h.P.tempo.abo['9'], 2)} a month at 9 kVA, against ${h.eur(h.P.base.abo['9'], 2)} on Base or Off-peak.</li>
<li><strong>Public rules.</strong> The number of days of each colour and the 22:00-06:00 off-peak hours are set by the ${h.src('creTempo2014', '2014 CRE deliberation')}; RTE publishes the colour at 10:30 the day before, with no last-minute surprise.</li>
<li><strong>A regulated price.</strong> Tempo remains a Tarif Bleu option: its prices move with the others, by public decision on a proposal from the ${h.src('creTrve2026', 'CRE regulator')}, twice a year.</li>
</ul>
<h2>What hurts</h2>
<ul>
<li><strong>Red-day peak hours.</strong> ${h.kwh(T.R.hp)} per kWh from 06:00 to 22:00, ${h.num(T.R.hp / T.B.hp, 1)} times the blue-day price. A 2 kW heater on for eight hours costs ${h.eur(2 * 8 * T.R.hp, 2)} that day.</li>
<li><strong>The timing.</strong> The ${h.P.tempo_regles.jours_rouges} reds fall on weekdays during cold spells, when heating runs hardest: an electrically heated home packs a far larger share of its use into them than their share of days.</li>
<li><strong>Daily attention.</strong> You need to know tomorrow’s colour and move washing, charging or heating; a household that does not want to think about it loses part of the benefit.</li>
<li><strong>No 3 kVA.</strong> Tempo starts at ${h.P.tempo.kva_min} kVA, which rules out the smallest homes.</li>
</ul>
<h2>The verdict on five households</h2>
${h.table(['Household', 'Base', 'Off-peak', 'Tempo, no effort', 'Tempo, 25% shifted', 'Tempo, 50% shifted'], P.map(lig), 'Annual bill incl. tax and standing charge, 1 August 2026 grid. 35% of use at night; « shifted »: share of red peak use moved to off-peak hours. Heating split by colour from éCO2mix.', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The picture is clear. With no electric heating, or very little, Tempo wins from the first year with no effort at all. With half of consumption going on heating, it loses to Off-peak as long as nothing is done on red days, and becomes the cheapest again once half of red peak use is shifted. The share of heating falling on those days comes from RTE’s ${h.src('eco2mix', 'éCO2mix')} national consumption over twelve winters; a home better insulated than average does better than the table. Your exact threshold is worked out on ${h.a('tempo-rentable', 'is Tempo worth it?')}, and the mini calculator above gives the yearly result with your own effort.</p>
<h2>Who it suits, and who it does not</h2>
<p>Tempo suits a household that uses a lot of power at night, with a water heater or an electric car; one that heats with gas, wood or a heat pump and has only small winter peaks; and one that can turn the heating down for a few hours or run appliances after 22:00 on the ${h.P.tempo_regles.jours_rouges} red days. It suits poorly an all-electric, badly insulated home, occupied during the day, with no radiator programming: there the red price is paid in full. To prepare for a red day, the ${h.a('jour-rouge-tempo', 'Tempo red day')} page lists the steps that matter; to follow the colours, ${h.a('couleur-tempo-demain', 'Tempo colour tomorrow')} is read from RTE several times a day, according to the ${h.src('rteCalendrier', 'official calendar')}.</p>
<p>Finally, Tempo is not a trap: you can ask EDF to switch option within the regulated tariff, and the prices on the ${h.src('grilleEdf', 'Tarif Bleu grid')} are the same for every customer. The ${h.a('comparateur', 'Base, Off-peak or Tempo comparison')} reruns the full calculation with your meter readings.</p>`;
    },
  },
});

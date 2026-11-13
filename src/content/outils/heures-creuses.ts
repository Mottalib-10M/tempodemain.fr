import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Plage horaire [de, à] écrite dans la langue (« 7 h - 11 h » / « 07:00-11:00 »). */
const plage = (h: Helpers, [a, b]: number[]) => (h.lang === 'fr' ? `${a} h - ${b} h` : `${String(a).padStart(2, '0')}:00-${String(b).padStart(2, '0')}:00`);
const plages = (h: Helpers, l: number[][], vide: string) => (l.length ? l.map((x) => plage(h, x)).join(h.lang === 'fr' ? ' et ' : ' and ') : vide);
const mois = (h: Helpers, iso: string) => h.date(iso).replace(/^1er |^\d+ /, '');

export default defineGuide({
  id: 'heures-creuses',
  group: 'hc',
  order: 1,
  tool: 'heuresCreuses',
  related: ['horaires-heures-creuses', 'comparateur', 'prix-kwh', 'recharge-voiture-tempo', 'home'],
  sources: ['creHc2026', 'creHc2025', 'enedisHc', 'grilleEdf'],
  fr: {
    slug: 'nouvelles-heures-creuses',
    nav: 'Nouvelles heures creuses',
    card: 'La réforme Enedis des heures creuses, phase par phase, et son coût pour vous.',
    title: 'Heures creuses 2026 : nouvelles plages et calendrier Enedis',
    description: 'Heures creuses 2026 : nouvelles plages de 11 h à 17 h, calendrier Enedis par phase, règles CRE été et hiver, coût d’un minuteur resté sur l’ancien horaire.',
    h1: 'Nouvelles heures creuses : ce qui change, et quand',
    intro: 'Huit heures creuses par jour, toujours, mais une partie glisse vers l’après-midi. Calculez ce que le changement vous coûte ou vous rapporte.',
    resume: (h) => {
      const H = h.P.heures_creuses, [p1, p2] = H.phases;
      return `La réforme des heures creuses ne retire aucune heure : chaque foyer en option Heures creuses garde ${h.num(H.heures_par_jour)} heures à prix réduit par jour, dont au moins ${h.num(H.nuit_min_consecutives)} consécutives la nuit, entre ${H.nuit_de} h et ${H.nuit_a} h. Ce qui change, c’est leur place. Pour profiter de la production solaire, Enedis peut en déplacer jusqu’à ${h.num(H.apres_midi_max)} entre ${H.apres_midi_de} h et ${H.apres_midi_a} h, surtout l’été, du 1er avril au 31 octobre. Une première phase, de ${mois(h, p1.de)} à ${mois(h, p1.a)}, a touché ${h.num(p1.clients / 1e6, 1)} million de clients avec les mêmes horaires été comme hiver ; la seconde, de ${mois(h, p2.de)} à ${mois(h, p2.a)}, concerne ${h.num(p2.clients / 1e6, 1)} millions de clients, avec des horaires différents selon la saison. Le prix ne bouge pas : ${h.kwh(h.P.hc.hc)} le kWh creux contre ${h.kwh(h.P.hc.hp)} en heures pleines au tarif réglementé. Le risque est ailleurs : un appareil programmé sur l’ancien horaire consomme désormais au prix fort.`;
    },
    faqs: (h) => {
      const H = h.P.heures_creuses;
      return [
        { q: 'Vais-je perdre des heures creuses avec la réforme ?', a: `Non. Le nombre reste de ${h.num(H.heures_par_jour)} heures par jour, et Enedis garantit au moins ${h.num(H.nuit_min_consecutives)} heures consécutives au cœur de la nuit. Seule la répartition change : une partie peut passer l’après-midi, au plus ${h.num(H.apres_midi_max)} heures entre ${H.apres_midi_de} h et ${H.apres_midi_a} h. Le prix du kWh en heures creuses, lui, reste celui de votre contrat.` },
        { q: 'Qui me prévient du changement de mes horaires ?', a: `Votre fournisseur, au moins ${h.num(H.preavis_mois)} mois avant la date effective. Enedis lui communique les nouvelles plages environ six mois à l’avance, d’après la CRE. Le changement se fait ensuite à distance, par le compteur Linky : aucun technicien ne passe, et vous n’avez rien à signer. Les nouveaux horaires figurent aussi sur la facture suivante et dans l’espace client du fournisseur.` },
        { q: 'Les heures creuses de l’option Tempo bougent-elles aussi ?', a: 'Non. Les heures creuses de Tempo vont de 22 h à 6 h partout en France, parce qu’elles sont fixées par le tarif lui-même. La réforme ne touche que les plages qu’Enedis attribue compteur par compteur aux clients de l’option Heures creuses. Un client Tempo n’a donc rien à reprogrammer, mais il garde le même intérêt à décaler ses usages les jours rouges.' },
        { q: 'Pourquoi déplacer des heures creuses vers l’après-midi ?', a: 'Parce que le réseau a changé. Les heures creuses ont été placées la nuit à l’époque où les centrales nucléaires produisaient plus que la demande nocturne. Aujourd’hui, les panneaux solaires injectent beaucoup d’électricité entre 11 h et 17 h, surtout l’été, quand la consommation est faible. La CRE juge plus utile d’y attirer les usages programmables et de libérer le début de soirée.' },
        { q: 'Combien de foyers gardent leurs heures creuses de 23 h à 7 h ?', a: `Selon la CRE, ${h.num(H.foyers_23h_7h / 1e6, 1)} million de foyers ont déjà leurs heures creuses de 23 h à 7 h et ne verront aucun changement. Sur les ${h.num(H.foyers_hphc / 1e6, 1)} millions de foyers en option Heures creuses, environ ${h.num(H.foyers_concernes / 1e6, 0)} millions verront leurs plages évoluer, au moins l’été. Seule la lettre de votre fournisseur dit à quelle catégorie vous appartenez.` },
      ];
    },
    body: (h) => {
      const H = h.P.heures_creuses, [p1, p2] = H.phases;
      return `
<h2>Les règles de placement fixées par la CRE</h2>
<p>La délibération du ${h.src('creHc2026', '4 février 2026')} a remplacé le tableau des règles du TURPE 7 par le suivant. Le tarif de réseau distingue une saison haute, l’hiver, et une saison basse, l’été. Pour chacune, il désigne les heures creuses existantes à déplacer et celles vers lesquelles Enedis doit les placer en priorité.</p>
${h.table(['Saison', 'Heures creuses à déplacer', 'Heures à favoriser'], [
  ['Hiver (1er novembre - 31 mars)', plages(h, H.a_deplacer.hiver, 'aucune'), plages(h, H.a_favoriser.hiver, 'Libre')],
  ['Été (1er avril - 31 octobre)', plages(h, H.a_deplacer.ete, 'aucune'), plages(h, H.a_favoriser.ete, 'Libre')],
], 'Tableau 4 de la délibération CRE n° 2026-33 du 4 février 2026.', ['l', 'l', 'l'])}
<p>La même délibération a levé le gel qui interdisait d’attribuer des heures creuses entre 11 h et 14 h aux nouveaux clients. Enedis et RTE ont simulé l’effet de ces heures méridiennes sur le système électrique et conclu que l’hiver passé et l’essor du photovoltaïque permettaient de les accueillir. Tous les répondants à la consultation publique y étaient favorables.</p>
<h2>Le calendrier des heures creuses, phase par phase</h2>
${h.table(['Phase', 'Période', 'Clients concernés', 'Horaires'], [
  ['1', `${mois(h, p1.de)} - ${mois(h, p1.a)}`, `${h.num(p1.clients / 1e6, 1)} million`, 'identiques été comme hiver'],
  ['2', `${mois(h, p2.de)} - ${mois(h, p2.a)}`, `${h.num(p2.clients / 1e6, 1)} millions`, 'différents l’été et l’hiver'],
  ['Professionnels', H.professionnels, 'tous', 'en fin de chantier'],
], 'Calendrier publié par Enedis.', ['l', 'l', 'r', 'l'])}
<p>La première phase visait des clients qui avaient déjà des heures creuses en journée, souvent mal placées en début de matinée ou en début de soirée. La seconde, qui démarre en décembre, touche la grande masse des foyers dont toutes les heures creuses sont aujourd’hui la nuit. ${h.src('enedisHc', 'Enedis')} précise que les plages varient selon les contraintes locales du réseau, y compris entre deux rues d’un même quartier.</p>
<h2>Ce que l’outil calcule</h2>
<p>Le prix d’un kWh ne dépend pas de l’heure à laquelle tombe votre plage creuse : ${h.kwh(h.P.hc.hc)} la nuit comme l’après-midi, au tarif du 1er août 2026. Le changement n’a donc un coût que si votre consommation ne suit pas les nouvelles plages. Un ballon d’eau chaude relié au contact heures creuses du compteur bascule seul. Un lave-linge, un lave-vaisselle ou une borne réglés sur une minuterie, eux, continuent de démarrer à l’ancienne heure, désormais pleine. Chaque kWh mal placé coûte alors ${h.kwh(h.M.ecartHpHc())} de plus. À l’inverse, la plage de l’après-midi ouvre l’été une occasion nouvelle : lancer une machine à 14 h au prix creux. L’outil fait les deux comptes sur une année.</p>
<p>Comment repérer vos propres plages et reprogrammer chaque appareil : voir ${h.a('horaires-heures-creuses', 'les horaires de vos heures creuses')}. Pour savoir si l’option Heures creuses reste la bonne : ${h.a('comparateur', 'Base, Heures creuses ou Tempo')}.</p>`;
    },
  },
  en: {
    slug: 'new-off-peak-hours',
    nav: 'New off-peak hours',
    card: 'The Enedis off-peak reform, phase by phase, and what it costs you.',
    title: 'Off-Peak Hours 2026: New Enedis Time Slots and Timetable',
    description: 'Off-peak hours in France 2026: new 11:00 to 17:00 slots, the Enedis rollout phase by phase, CRE summer and winter rules, and what an unchanged timer costs you.',
    h1: 'New off-peak hours: what changes, and when',
    intro: 'Eight off-peak hours a day, as before, but some of them move to the afternoon. Work out what the change costs or earns you.',
    resume: (h) => {
      const H = h.P.heures_creuses, [p1, p2] = H.phases;
      return `The reform of French off-peak hours (heures creuses) takes no hours away: every household on the Off-peak (HP/HC) option keeps ${h.num(H.heures_par_jour)} cheaper hours a day, at least ${h.num(H.nuit_min_consecutives)} of them in a row at night, between 23:00 and 07:00. What changes is where they sit. To make use of solar output, Enedis, the distribution network operator, may move up to ${h.num(H.apres_midi_max)} of them to between 11:00 and 17:00, mostly in summer, from 1 April to 31 October. A first phase, from ${mois(h, p1.de)} to ${mois(h, p1.a)}, covered ${h.num(p1.clients / 1e6, 1)} million customers with the same hours all year; the second, from ${mois(h, p2.de)} to ${mois(h, p2.a)}, covers ${h.num(p2.clients / 1e6, 1)} million customers with summer and winter hours that differ. The price stays put: ${h.kwh(h.P.hc.hc)} per off-peak kWh against ${h.kwh(h.P.hc.hp)} at peak on the regulated tariff. The risk lies elsewhere: an appliance timed for the old slot now runs at the higher rate.`;
    },
    faqs: (h) => {
      const H = h.P.heures_creuses;
      return [
        { q: 'Will I lose off-peak hours under the reform?', a: `No. The count stays at ${h.num(H.heures_par_jour)} hours a day, and Enedis guarantees at least ${h.num(H.nuit_min_consecutives)} consecutive hours in the middle of the night. Only the split changes: some hours may move to the afternoon, at most ${h.num(H.apres_midi_max)} between 11:00 and 17:00. The off-peak price per kWh remains whatever your contract says.` },
        { q: 'Who tells me my hours are changing?', a: `Your supplier, at least ${h.num(H.preavis_mois)} month before the change takes effect. Enedis sends the new slots to suppliers about six months ahead, according to the regulator. The switch is then made remotely through the Linky meter: no engineer visits and there is nothing to sign. The new hours also appear on your next bill and in the supplier’s online account.` },
        { q: 'Do Tempo off-peak hours move as well?', a: 'No. Tempo off-peak hours run from 22:00 to 06:00 everywhere in France, because the tariff itself sets them. The reform only affects the slots Enedis assigns meter by meter to Off-peak option customers. A Tempo customer has nothing to reprogram, but still gains by shifting use on red days.' },
        { q: 'Why move off-peak hours to the afternoon?', a: 'Because the grid has changed. Off-peak hours were put at night when nuclear plants produced more than night-time demand. Today solar panels feed in a great deal of power between 11:00 and 17:00, especially in summer, when demand is low. The regulator considers it more useful to draw programmable uses there and free up the early evening.' },
        { q: 'How many homes keep their 23:00 to 07:00 off-peak hours?', a: `According to the regulator, ${h.num(H.foyers_23h_7h / 1e6, 1)} million homes already have off-peak hours from 23:00 to 07:00 and will see no change. Of the ${h.num(H.foyers_hphc / 1e6, 1)} million homes on the Off-peak option, about ${h.num(H.foyers_concernes / 1e6, 0)} million will see their slots move, at least in summer. Only your supplier’s letter says which group you belong to.` },
      ];
    },
    body: (h) => {
      const H = h.P.heures_creuses, [p1, p2] = H.phases;
      return `
<h2>The placement rules set by the regulator</h2>
<p>The ${h.src('creHc2026', 'deliberation of 4 February 2026')} by the CRE, the French energy regulator, replaced the rules table of the TURPE 7 network tariff with the one below. The network tariff distinguishes a high season, winter, and a low season, summer. For each it names the existing off-peak hours to move and the hours Enedis should place them in first.</p>
${h.table(['Season', 'Off-peak hours to move', 'Hours to favour'], [
  ['Winter (1 November - 31 March)', plages(h, H.a_deplacer.hiver, 'none'), plages(h, H.a_favoriser.hiver, 'Free')],
  ['Summer (1 April - 31 October)', plages(h, H.a_deplacer.ete, 'none'), plages(h, H.a_favoriser.ete, 'Free')],
], 'Table 4 of CRE deliberation no. 2026-33 of 4 February 2026.', ['l', 'l', 'l'])}
<p>The same deliberation lifted the freeze that barred new customers from off-peak hours between 11:00 and 14:00. Enedis and RTE modelled the effect of these midday hours on the power system and concluded that last winter’s supply and the growth of solar allowed them. Every respondent to the public consultation was in favour.</p>
<h2>The off-peak hours timetable, phase by phase</h2>
${h.table(['Phase', 'Period', 'Customers', 'Hours'], [
  ['1', `${mois(h, p1.de)} - ${mois(h, p1.a)}`, `${h.num(p1.clients / 1e6, 1)} million`, 'same in summer and winter'],
  ['2', `${mois(h, p2.de)} - ${mois(h, p2.a)}`, `${h.num(p2.clients / 1e6, 1)} million`, 'different in summer and winter'],
  ['Businesses', 'second half of 2027', 'all', 'at the end of the rollout'],
], 'Timetable published by Enedis.', ['l', 'l', 'r', 'l'])}
<p>The first phase targeted customers who already had some daytime off-peak hours, often badly placed early in the morning or early in the evening. The second, starting in December, reaches the bulk of households whose off-peak hours are all at night today. ${h.src('enedisHc', 'Enedis')} points out that slots vary with local network constraints, even between two streets of the same neighbourhood.</p>
<h2>What the tool works out</h2>
<p>The price of a kWh does not depend on when your off-peak slot falls: ${h.kwh(h.P.hc.hc)} at night or in the afternoon, on the 1 August 2026 tariff. The change therefore only costs you something if your use does not follow the new slots. A water heater wired to the meter’s off-peak contact switches over by itself. A washing machine, dishwasher or car charger on a timer keeps starting at the old time, now a peak hour, and each misplaced kWh costs ${h.kwh(h.M.ecartHpHc())} more. The afternoon slot works the other way in summer: a load started at 14:00 is billed at the off-peak rate. The tool does both sums over a year.</p>
<p>One practical point for summer: an afternoon slot only pays if someone, or something, is there to use it. Delayed-start appliances, a car plugged in at home or a water heater on the meter contact can; a household out all day with nothing programmed gains nothing from it, while still losing any old evening hours that were moved.</p>
<p>How to find your own slots and reprogram each appliance: see ${h.a('horaires-heures-creuses', 'your off-peak hours times')}. To check whether the Off-peak option is still right for you: ${h.a('comparateur', 'Base, Off-peak or Tempo')}.</p>`;
    },
  },
});

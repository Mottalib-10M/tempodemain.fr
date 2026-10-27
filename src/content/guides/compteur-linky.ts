import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Prestations Enedis dont le prix dépend du compteur (€ TTC, FAQ Enedis). */
const prestations = (h: Helpers, fr: boolean) => {
  const X = h.P.linky.prestations_ttc;
  const L: Array<[keyof typeof X, string, string]> = [
    ['mise_en_service', 'Mise en service sur raccordement existant', 'Connection on an existing supply'],
    ['releve_special', 'Relevé spécial', 'Special meter reading'],
    ['teleinfo', 'Activation de la sortie télé-information', 'Enabling the tele-information output'],
    ['reduction_puissance', 'Réduction de puissance pour impayé', 'Power reduction for unpaid bills'],
    ['suspension', 'Suspension d’alimentation pour impayé', 'Supply suspension for unpaid bills'],
  ];
  const v = (x: number) => (x === 0 ? (fr ? 'non facturé' : 'free') : h.eur(x, 2));
  return L.map(([k, f, e]) => [fr ? f : e, v(X[k].linky), v(X[k].ancien)]);
};

export default defineGuide({
  id: 'compteur-linky',
  group: 'choisir',
  order: 19,
  mini: 'linky',
  miniHref: 'prix-kwh',
  related: ['puissance-compteur', 'couleur-tempo-demain', 'prix-kwh', 'heures-creuses', 'cheque-energie'],
  sources: ['enedisLinky', 'enedisSansLinky', 'enedisReleve', 'enedisDuree', 'grilleEdf'],
  fr: {
    slug: 'compteur-linky',
    nav: 'Compteur Linky',
    card: 'Comment fonctionne le Linky, ce qu’il affiche pour Tempo et ce que coûte de garder l’ancien compteur.',
    title: 'Compteur Linky 2026 : fonctionnement, Tempo, coût sans Linky',
    description: 'Compteur Linky 2026 : relevé à distance par CPL, écrans et couleur Tempo, données de consommation, et 40,08 € HT par an de majoration pour un ancien compteur.',
    h1: 'Compteur Linky : fonctionnement, Tempo et coût sans Linky',
    intro: 'Ce que fait le compteur, ce qu’il affiche, ce qu’il transmet, et la facture d’un foyer qui garde l’ancien modèle.',
    resume: (h) => {
      const K = h.P.linky, T = h.P.taxes;
      return `Le Linky est le compteur communicant d’Enedis, le gestionnaire du réseau de distribution. Déployé depuis ${K.deploiement_depuis}, il équipe ${h.pct(K.part_foyers, 0)} des foyers, soit ${h.num(K.compteurs / 1e6, 1)} millions de compteurs selon Enedis. Il fonctionne comme l’ancien compteur pour mesurer l’énergie, mais transmet ses index par courant porteur en ligne, un signal qui circule dans les câbles électriques eux-mêmes et non par ondes radio. Le relevé se fait donc à distance, sans rendez-vous, et les factures sont établies sur la consommation réelle. Le Linky affiche aussi la couleur Tempo du jour et coupe le courant quand la puissance souscrite est dépassée. Il n’est pas obligatoire de l’aimer, mais le refuser coûte : depuis le 1er août 2026, la grille du tarif bleu ajoute ${h.eur(T.majoration_sans_linky_an_ht, 2)} hors taxes par an à l’abonnement d’un foyer sans Linky, et ${h.eur(T.majoration_sans_index_an_ht, 2)} de plus s’il n’a transmis aucun index depuis douze mois. Le compteur appartient au réseau public et son installation est prise en charge par Enedis.`;
    },
    faqs: (h) => [
      { q: 'Le Linky enregistre-t-il ce que fait chaque appareil ?', a: 'Non. Selon Enedis, il mesure la consommation globale du logement, pas celle de chaque appareil. Il peut enregistrer une courbe de consommation heure par heure, mais vous pouvez vous opposer à cet enregistrement depuis votre compte client Enedis, rubrique de gestion de l’accès aux données, en application du décret n° 2017-948. Votre fournisseur reçoit les index nécessaires à la facture.' },
      { q: 'Combien de temps dure un compteur Linky ?', a: `Au moins ${h.P.linky.duree_vie_ans} ans d’après les essais en laboratoire puis sur le terrain cités par Enedis. Comme tous les instruments de mesure, les compteurs font l’objet d’un contrôle de conformité, réalisé par échantillonnage tous les ${h.P.linky.controle_ans} ans. Le compteur restant la propriété du réseau public, son remplacement éventuel n’est pas à la charge du client.` },
      { q: 'Plus d’eau chaude depuis la pose du Linky : que faire ?', a: 'Le ballon a sans doute été mal rebranché sur le contact qui le pilote en heures creuses. Passez-le en marche forcée avec l’interrupteur du tableau électrique ou du ballon pour retrouver de l’eau chaude, puis appelez Enedis au 0 800 054 659, numéro gratuit, pour corriger le branchement durablement.' },
      { q: 'Peut-on éteindre un Linky ou le débrancher la nuit ?', a: 'Non. Enedis indique que le compteur doit rester actif en permanence pour mesurer exactement la consommation. C’est aussi ce qui lui permet d’envoyer les index à distance, de changer de plage Tempo à 6 h et à 22 h et de commander le ballon d’eau chaude en heures creuses. Couper le disjoncteur général coupe votre installation, pas le compteur.' },
    ],
    body: (h) => {
      const T = h.P.taxes, sL = h.M.surcoutSansLinky(true), sI = h.M.surcoutSansLinky(false);
      return `
<h2>Comment fonctionne le compteur Linky</h2>
<p>Le Linky mesure l’énergie qui entre dans le logement et l’additionne dans un ou plusieurs index, selon l’option : un seul en Base, deux en Heures creuses, six en Tempo, un par couleur et par plage horaire. Il communique avec Enedis par courant porteur en ligne : les informations voyagent sous forme de signal dans les câbles basse tension jusqu’à un concentrateur, puis vers le système d’information d’Enedis. Le même principe sert depuis des décennies à envoyer le signal heures pleines, heures creuses aux ballons d’eau chaude, précise ${h.src('enedisLinky', 'Enedis')}.</p>
<p>Le compteur porte aussi un organe de coupure. Il remplace la fonction de limitation du disjoncteur : si les appareils allumés dépassent la puissance souscrite, il coupe et affiche « PUISS DEPASSEE » ; on éteint un appareil, puis on réarme. C’est ce qui permet de changer de puissance à distance, sans déplacement, comme l’explique la page ${h.a('puissance-compteur', 'puissance du compteur')}.</p>
<h2>Ce que le Linky affiche, et ce qu’il sait de Tempo</h2>
<p>Les touches du compteur font défiler ses écrans : puissance souscrite, index de chaque plage, puissance appelée à l’instant, et pour un abonné Tempo, la couleur du jour en cours et celle du lendemain dès qu’elle est connue. Le compteur reçoit la couleur que RTE publie la veille à 10 h 30 et bascule ses index à 6 h et à 22 h ; c’est pourquoi un foyer Tempo n’a rien à déclarer. La couleur de demain se lit aussi, sans descendre au compteur, sur notre page ${h.a('couleur-tempo-demain', 'couleur Tempo de demain')}. Le même relais pilote le ballon d’eau chaude et sert au changement des ${h.a('heures-creuses', 'nouvelles heures creuses')} décidé par la CRE.</p>
<h2>Ce que coûte de garder l’ancien compteur</h2>
${h.table(['Situation', 'Majoration HT par an', 'Avec TVA'], [
  ['Linky posé', h.eur(0, 2), h.eur(0, 2)],
  ['Sans Linky, index transmis dans l’année', h.eur(T.majoration_sans_linky_an_ht, 2), h.eur(sL.ttc, 2)],
  ['Sans Linky, aucun index depuis 12 mois', h.eur(T.majoration_sans_linky_an_ht + T.majoration_sans_index_an_ht, 2), h.eur(sI.ttc, 2)],
], 'Majorations de l’abonnement, grille EDF Tarif Bleu du 1er août 2026, identiques pour Base, Heures creuses et Tempo.', ['l', 'r', 'r'])}
<p>Ces deux majorations figurent sur la ${h.src('grilleEdf', 'grille du Tarif Bleu')} ; elles viennent du tarif d’acheminement fixé par la CRE et s’appliquent chez tous les fournisseurs. ${h.src('enedisReleve', 'Enedis les décrit')} comme une composante fixe pour la gestion des compteurs d’ancienne génération, facturée tous les deux mois, et des frais de relevé quand aucun index n’a été transmis depuis plus d’un an. Ceux-là s’évitent en envoyant ses index au moins une fois par an ; la composante fixe, seulement en demandant le Linky, posé gratuitement.</p>
${h.table(['Prestation Enedis', 'Avec Linky', 'Ancien compteur'], prestations(h, true), 'Prix TTC affichés par Enedis, lus le 27 octobre 2026.', ['l', 'r', 'r'])}
<p>Les interventions coûtent aussi plus cher sans Linky, puisqu’un technicien doit se déplacer : la ${h.src('enedisSansLinky', 'liste d’Enedis')} donne les prix ci-dessus ; la différence selon la génération du compteur s’applique depuis le 1er novembre 2023. Le mini-calculateur additionne la majoration sur plusieurs années et le surcoût des mises en service lors d’un emménagement. Enedis rappelle enfin que le compteur fait partie du réseau public et que son installation est obligatoire ; sa durée de vie est d’au moins ${h.P.linky.duree_vie_ans} ans selon ${h.src('enedisDuree', 'ses essais')}.</p>`;
    },
  },
  en: {
    slug: 'linky-meter',
    nav: 'Linky meter',
    card: 'How the Linky works, what it shows for Tempo and what keeping the old meter costs.',
    title: 'Linky Meter 2026: How It Works, Tempo, Cost Without It',
    description: 'Linky smart meter in 2026: remote readings over power lines, display screens and Tempo colour, consumption data, and a €40.08 yearly surcharge for old meters.',
    h1: 'Linky meter: how it works, Tempo and the cost of going without',
    intro: 'What the meter does, what it shows, what it sends, and the bill of a household that keeps the old model.',
    resume: (h) => {
      const K = h.P.linky, T = h.P.taxes;
      return `Linky is the smart meter of Enedis, the company that runs France’s distribution grid. Rolled out since ${K.deploiement_depuis}, it is fitted in ${h.pct(K.part_foyers, 0)} of homes, or ${h.num(K.compteurs / 1e6, 1)} million meters according to Enedis. It measures energy like the old meter did, but sends its readings by power-line communication, a signal carried in the electrical cables themselves rather than by radio waves. Readings are therefore taken remotely, with no appointment, and bills are based on actual use. The Linky also shows the day’s Tempo colour and cuts the supply when subscribed power is exceeded. Nobody has to like it, but refusing it costs money: since 1 August 2026 the regulated tariff grid adds ${h.eur(T.majoration_sans_linky_an_ht, 2)} before tax a year to the standing charge of a home without Linky, and ${h.eur(T.majoration_sans_index_an_ht, 2)} more if no meter reading has been sent for twelve months. The meter belongs to the public grid and Enedis pays for fitting it.`;
    },
    faqs: (h) => [
      { q: 'Does the Linky record what each appliance does?', a: 'No. According to Enedis it measures the home’s total consumption, not that of each appliance. It can store an hour-by-hour consumption curve, but you can opt out of that from your Enedis customer account, in the data access section, under decree no. 2017-948. Your supplier receives the readings it needs for the bill.' },
      { q: 'How long does a Linky meter last?', a: `At least ${h.P.linky.duree_vie_ans} years, according to the lab and field tests Enedis cites. Like every measuring instrument, meters undergo a conformity check, carried out by sampling every ${h.P.linky.controle_ans} years. Since the meter remains the property of the public grid, any replacement is not charged to the customer.` },
      { q: 'No hot water since the Linky was fitted: what now?', a: 'The water heater has probably been badly reconnected to the contact that switches it on off-peak. Set it to forced mode with the switch on the fuse board or on the tank to get hot water back, then call Enedis on 0 800 054 659, a free number in French, to fix the wiring for good.' },
      { q: 'Can a Linky be switched off or unplugged at night?', a: 'No. Enedis states that the meter must stay on at all times to measure consumption accurately. Staying on is also what lets it send readings remotely, switch Tempo slots at 06:00 and 22:00 and turn the water heater on during off-peak hours. Turning off the main breaker cuts your installation, not the meter.' },
    ],
    body: (h) => {
      const T = h.P.taxes, sL = h.M.surcoutSansLinky(true), sI = h.M.surcoutSansLinky(false);
      return `
<h2>How the Linky meter works</h2>
<p>The Linky measures the energy coming into the home and adds it to one or more registers, depending on the option: one on Base, two on Off-peak, six on Tempo, one per colour and time slot. It talks to Enedis by power-line communication: the data travels as a signal along the low-voltage cables to a concentrator, then on to Enedis’ systems. The same principle has been used for decades to send the peak and off-peak signal to water heaters, ${h.src('enedisLinky', 'Enedis points out')}.</p>
<p>The meter also has a built-in switch. It takes over the limiting role of the old breaker: if the appliances running exceed the subscribed power, it cuts out and shows « PUISS DEPASSEE »; you switch an appliance off and reset it. This is what lets the subscribed power be changed remotely, with no visit, as explained on the ${h.a('puissance-compteur', 'meter power')} page.</p>
<h2>What the Linky displays, and what it knows about Tempo</h2>
<p>The buttons on the meter scroll through its screens: subscribed power, the reading for each slot, the power drawn right now and, for a Tempo customer, the current day’s colour and tomorrow’s as soon as it is known. The meter receives the colour RTE publishes at 10:30 the day before and switches registers at 06:00 and 22:00, which is why a Tempo household has nothing to report. Tomorrow’s colour can also be checked without going to the meter on our ${h.a('couleur-tempo-demain', 'Tempo colour tomorrow')} page. The same relay drives the water heater and handles the move to the ${h.a('heures-creuses', 'new off-peak hours')} set by the CRE regulator.</p>
<h2>What keeping the old meter costs</h2>
${h.table(['Situation', 'Surcharge per year before tax', 'With VAT'], [
  ['Linky fitted', h.eur(0, 2), h.eur(0, 2)],
  ['No Linky, reading sent within the year', h.eur(T.majoration_sans_linky_an_ht, 2), h.eur(sL.ttc, 2)],
  ['No Linky, no reading for 12 months', h.eur(T.majoration_sans_linky_an_ht + T.majoration_sans_index_an_ht, 2), h.eur(sI.ttc, 2)],
], 'Standing charge surcharges, EDF Tarif Bleu grid of 1 August 2026, the same for Base, Off-peak and Tempo.', ['l', 'r', 'r'])}
<p>Both surcharges appear on the ${h.src('grilleEdf', 'Tarif Bleu price grid')}; they come from the network tariff set by the CRE and apply with every supplier. ${h.src('enedisReleve', 'Enedis describes them')} as a fixed charge for handling old-generation meters, billed every two months, plus reading fees when no reading has been sent for more than a year. The second can be avoided by sending a reading at least once a year; the fixed charge only by asking for a Linky, which is fitted free of charge.</p>
${h.table(['Enedis service', 'With Linky', 'Old meter'], prestations(h, false), 'Prices incl. tax published by Enedis, read on 27 October 2026.', ['l', 'r', 'r'])}
<p>Call-outs also cost more without Linky, since a technician has to travel: ${h.src('enedisSansLinky', 'Enedis’ list')} gives the prices above; charging differently by meter generation started on 1 November 2023. The mini calculator adds up the surcharge over several years and the extra cost of connections when you move in. Enedis also stresses that the meter is part of the public grid and that fitting it is compulsory; it lasts at least ${h.P.linky.duree_vie_ans} years according to ${h.src('enedisDuree', 'its tests')}.</p>`;
    },
  },
});

import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Exemples de calcul : puissance (W), heures par jour, jours par an, choisis pour illustrer la formule. */
const EX: Array<[string, string, number, number, number]> = [
  ['Appareil de 2 000 W, 1 h par jour', '2,000 W appliance, 1 h a day', 2000, 1, 365],
  ['Appareil de 1 000 W, 30 min par jour', '1,000 W appliance, 30 min a day', 1000, 0.5, 365],
  ['Appareil de 150 W, 4 h par jour', '150 W appliance, 4 h a day', 150, 4, 365],
  ['Appareil de 3 000 W, 2 h par jour l’hiver', '3,000 W appliance, 2 h a day in winter', 3000, 2, 150],
];
const VEILLE = [2, 5, 10, 20];
const ex = (h: Helpers, fr: boolean) => EX.map(([f, e, w, hh, j]) => { const k = (w / 1000) * hh * j; return [fr ? f : e, `${h.num(k)} kWh`, h.eur(k * h.P.base.kwh['6']), h.eur(k * h.P.hc.hc), h.kwh(h.P.tempo.kwh.R.hp)]; });
const veille = (h: Helpers) => VEILLE.map((w) => { const k = (w / 1000) * 24 * 365; return [`${h.num(w)} W`, `${h.num(k)} kWh`, h.eur(k * h.P.base.kwh['6'])]; });

export default defineGuide({
  id: 'consommation-appareils',
  group: 'choisir',
  order: 15,
  mini: 'appareil',
  related: ['comparateur', 'puissance-compteur', 'prix-kwh', 'jour-rouge-tempo'],
  sources: ['grilleEdf', 'creTrve2026', 'creTempo2014'],
  fr: {
    slug: 'calcul-consommation-electrique',
    nav: 'Consommation d’un appareil',
    card: 'Puissance, heures de marche, kWh : la consommation d’un appareil et son coût.',
    title: 'Consommation électrique d’un appareil en 2026 : le calcul',
    description: 'Consommation électrique d’un appareil en 2026 : formule kWh = kW × heures, plaque signalétique, coût de la veille et coût en Base, Heures creuses ou Tempo.',
    h1: 'Consommation électrique d’un appareil : le calcul pas à pas',
    intro: 'Une seule multiplication donne la consommation d’un appareil : sa puissance par sa durée de marche. Voici comment l’appliquer, et ce qu’elle coûte selon votre option.',
    resume: (h) => `La consommation d’un appareil électrique se calcule en multipliant sa puissance, en kilowatts, par sa durée de fonctionnement, en heures : le résultat est en kilowattheures, l’unité de votre facture. Un appareil de 2 000 W, soit 2 kW, qui fonctionne une heure consomme 2 kWh ; le même appareil une heure par jour pendant un an consomme ${h.num(2 * 365)} kWh. Il suffit ensuite de multiplier par le prix du kWh de votre option : ${h.kwh(h.P.base.kwh['6'])} en Base à 6 kVA, ${h.kwh(h.P.hc.hp)} ou ${h.kwh(h.P.hc.hc)} en Heures creuses selon l’heure, de ${h.kwh(h.P.tempo.kwh.B.hc)} à ${h.kwh(h.P.tempo.kwh.R.hp)} en Tempo selon la couleur, au tarif réglementé du 1er août 2026. La puissance se lit sur la plaque signalétique de l’appareil ; pour un appareil à thermostat, comme un four ou un radiateur, c’est une puissance maximale, atteinte seulement une partie du temps. Le mini-simulateur fait le calcul pour vous et donne le coût annuel dans chaque option.`,
    faqs: (h) => [
      { q: 'Où trouver la puissance d’un appareil ?', a: 'Sur sa plaque signalétique, souvent collée au dos ou sous l’appareil, ou dans sa notice : elle est exprimée en watts (W) ou en kilowatts (kW). Pour un appareil vendu récemment, l’étiquette énergie donne parfois directement une consommation annuelle en kWh, calculée selon une méthode normalisée. Un wattmètre branché sur la prise mesure la consommation réelle, utile pour les appareils à thermostat.' },
      { q: 'Quelle différence entre kW et kWh ?', a: 'Le kilowatt mesure une puissance, c’est-à-dire ce que l’appareil appelle à un instant donné. Le kilowattheure mesure une énergie, ce que l’appareil consomme sur une durée. Un radiateur de 1 kW allumé deux heures consomme 2 kWh. La facture compte les kWh ; la puissance du compteur, en kVA, limite la somme des kW appelés en même temps.' },
      { q: 'Combien coûte un appareil laissé en veille toute l’année ?', a: `Une veille de ${h.num(5)} W, permanente, représente ${h.num(5 / 1000 * 24 * 365)} kWh par an, soit ${h.eur(5 / 1000 * 24 * 365 * h.P.base.kwh['6'])} en Base à 6 kVA. C’est peu pour un appareil, mais plusieurs veilles s’additionnent. Une multiprise à interrupteur coupe d’un geste la box de télévision, la console ou l’ordinateur quand ils ne servent pas.` },
      { q: 'Faut-il lancer ses appareils la nuit en option Base ?', a: 'Non : en Base, le kWh a le même prix à toute heure, donc l’horaire ne change rien à la facture. Décaler ses usages ne rapporte qu’en option Heures creuses ou Tempo. Si une bonne part de vos appareils peut tourner la nuit, le comparateur vous dira si changer d’option vous ferait gagner de l’argent.' },
      { q: 'Comment calculer la consommation d’un appareil utilisé quelques minutes ?', a: 'Convertissez la durée en heures en divisant les minutes par 60, puis multipliez par la puissance en kilowatts. Une bouilloire de 2 000 W qui chauffe trois minutes consomme 2 × 0,05 = 0,1 kWh. Multiplié par le nombre d’utilisations dans l’année, cela donne sa consommation annuelle, que le mini-simulateur transforme en euros dans chaque option.' },
    ],
    body: (h) => `
<h2>La formule, et ses trois pièges</h2>
<p>Consommation en kWh = puissance en kW × durée en heures. Pour passer des watts aux kilowatts, divisez par 1 000 : 1 500 W font 1,5 kW. Pour une durée en minutes, divisez par 60 : 30 minutes font 0,5 heure. Un appareil de 1,5 kW utilisé 30 minutes consomme donc 0,75 kWh.</p>
<p>Le premier piège tient aux appareils à thermostat. Un four, un radiateur, un ballon d’eau chaude, un lave-linge chauffent à pleine puissance puis s’arrêtent, et recommencent : leur plaque indique un maximum, pas une moyenne. Le calcul donne alors un plafond, pas la consommation réelle. Le deuxième piège est la durée : on surestime volontiers le temps d’un sèche-linge et l’on oublie celui d’un appareil qui ne s’éteint jamais. Le troisième est la veille, ces quelques watts consommés en permanence par les appareils « éteints ».</p>

<h2>Quelques exemples de consommation électrique</h2>
<p>Le tableau applique la formule à des puissances et durées choisies pour l’exemple, au prix de la ${h.src('grilleEdf', 'grille du Tarif Bleu au 1er août 2026')}. Remplacez-les par celles de vos appareils dans le mini-simulateur.</p>
${h.table(['Exemple', 'Par an', 'En Base (6 kVA)', 'En heures creuses (option HC)', 'Prix rouge heures pleines, par kWh'], ex(h, true), 'Coût annuel TTC, hors abonnement.', ['l', 'r', 'r', 'r', 'r'])}
<p>La dernière colonne rappelle ce que coûte chaque kWh un jour rouge Tempo entre 6 h et 22 h : un appareil utilisé ces heures-là ces jours-là coûte plus de trois fois et demie son prix en Base. C’est pour cela que la question « quand » compte autant que « combien » dès que l’on choisit Tempo.</p>

<h2>La veille, petite mais permanente</h2>
<p>Un appareil en veille consomme peu, mais 24 heures sur 24, soit 8 760 heures par an :</p>
${h.table(['Veille permanente', 'Par an', 'En Base (6 kVA)'], veille(h), 'Consommation de veille sur 8 760 heures, prix TTC du 1er août 2026.', ['l', 'r', 'r'])}
<p>Additionnez la box internet, le décodeur, la console, l’ordinateur et les chargeurs restés branchés, et la somme devient visible sur une année. Couper ce qui ne sert pas, par une multiprise à interrupteur, est un geste sans inconfort.</p>

<h2>Du calcul d’un appareil à celui de la maison</h2>
<p>Additionner tous les appareils pour retrouver sa consommation annuelle est fastidieux et souvent faux, parce que les durées réelles sont mal connues. Votre facture, ou l’espace client de votre fournisseur, donne directement le total, et le compteur Linky le détaille par demi-heure. Le calcul par appareil sert à autre chose : décider où porter l’effort, et savoir ce qu’il faut décaler en heures creuses.</p>
<p>Si plusieurs gros appareils peuvent tourner la nuit, comparez les options : en Heures creuses, le kWh nocturne vaut ${h.kwh(h.P.hc.hc)} ; en Tempo, ${h.kwh(h.P.tempo.kwh.B.hc)} un jour bleu, selon la ${h.src('creTempo2014', 'plage de 22 h à 6 h fixée par le tarif')}. Le ${h.a('comparateur', 'comparateur Base, Heures creuses ou Tempo')} fait le calcul sur votre consommation totale.</p>

<h2>Puissance des appareils et puissance du compteur</h2>
<p>La puissance de chaque appareil sert aussi à choisir la puissance du compteur : la somme de ce qui fonctionne en même temps ne doit pas dépasser les kVA souscrits, sinon le disjoncteur coupe. Un four, des plaques, un sèche-linge et le chauffage allumés ensemble peuvent dépasser 9 kW. La page ${h.a('puissance-compteur', 'puissance du compteur')} additionne vos appareils et donne la puissance conseillée, avec l’abonnement correspondant, issu de la ${h.src('creTrve2026', 'proposition tarifaire de la CRE')}.</p>
<h2>Comparer deux appareils avant d’acheter</h2>
<p>La formule sert aussi à comparer deux appareils. Deux modèles qui rendent le même service se départagent sur leur consommation annuelle, multipliée par le nombre d’années où vous les garderez. Un écart de ${h.num(100)} kWh par an représente ${h.eur(100 * h.P.base.kwh['6'])} par an en Base à 6 kVA, soit ${h.eur(1000 * h.P.base.kwh['6'])} sur dix ans aux prix d’aujourd’hui. Pour les appareils vendus avec une étiquette énergie, la consommation annuelle normalisée qui y figure permet ce calcul directement ; pour les autres, partez de la puissance et de votre usage réel.</p>
<p>Le même raisonnement vaut pour l’horaire. En Heures creuses, un kWh déplacé de la journée vers la nuit fait gagner ${h.kwh(h.P.hc.hp - h.P.hc.hc)} ; en Tempo, un kWh déplacé des heures pleines rouges vers la nuit fait gagner ${h.kwh(h.P.tempo.kwh.R.hp - h.P.tempo.kwh.R.hc)}. C’est pourquoi un même appareil peut coûter presque la même chose à deux foyers qui ont la même option, et très différemment à deux foyers qui n’ont pas les mêmes habitudes.</p>

<h2>Ce que le calcul ne dit pas</h2>
<p>Le coût calculé ici est celui de l’énergie seule. L’abonnement, payé quelle que soit votre consommation, ne change pas parce qu’un appareil tourne une heure de plus ; il ne bouge qu’avec la puissance du compteur. Le calcul ignore aussi l’usure, l’entretien et le prix d’achat. Enfin, un appareil qui produit de la chaleur dans la maison, comme un four ou un sèche-linge, réduit un peu le travail du chauffage en hiver : un effet réel mais difficile à chiffrer, que ce site ne modélise pas.</p>
<h2>Du kVA au kW, et retour</h2>
<p>La puissance du compteur s’exprime en kilovoltampères (kVA), celle des appareils en watts ou en kilowatts. Pour un usage domestique, on peut considérer qu’un kVA correspond à peu près à un kW : un compteur de 9 kVA supporte environ 9 kW d’appareils allumés en même temps. Cette approximation suffit pour choisir sa puissance ; elle n’intervient pas dans le calcul de la consommation, qui ne dépend que des kilowattheures réellement consommés.</p>
<p>Le compteur Linky permet de vérifier tout cela : il affiche la puissance appelée à l’instant, et l’espace client du fournisseur donne la consommation par demi-heure. Allumer un appareil seul et regarder de combien monte la puissance affichée est le moyen le plus simple de connaître sa puissance réelle, quand la plaque est illisible ou absente.</p>
<p>Pour un appareil branché en permanence, comme un réfrigérateur ou un congélateur, le plus juste est de mesurer sa consommation sur une semaine entière avec un wattmètre, puis de multiplier par 52 : le compresseur s’arrête et repart, et une mesure d’une heure ne dit presque rien.</p>
<p>Un dernier conseil de méthode : notez vos calculs. Une liste de vos appareils les plus gourmands, avec leur puissance, leur durée et leur consommation annuelle, sert à chaque changement : achat d’un nouvel appareil, passage à une autre option, arrivée d’une voiture électrique ou d’une pompe à chaleur. Elle permet aussi de vérifier, en comparant au total de la facture, qu’aucun appareil n’a été oublié, comme un chauffe-eau d’appoint, un aquarium ou une pompe de piscine qui tournent sans qu’on y pense.</p>`,
  },
  en: {
    slug: 'appliance-electricity-use',
    nav: 'Appliance electricity use',
    card: 'Power, running hours, kWh: an appliance’s consumption and what it costs.',
    title: 'Appliance Electricity Use 2026: How to Work It Out',
    description: 'Appliance electricity use in 2026: the kWh = kW × hours formula, the rating plate, the cost of standby and the cost on Base, Off-peak or Tempo in France.',
    h1: 'Appliance electricity use: the calculation step by step',
    intro: 'One multiplication gives an appliance’s electricity use: its power times its running time. Here is how to apply it, and what it costs on your option.',
    resume: (h) => `An electrical appliance’s consumption is worked out by multiplying its power in kilowatts by its running time in hours: the result is in kilowatt-hours, the unit on your bill. A 2,000 W appliance, that is 2 kW, running for one hour uses 2 kWh; the same appliance one hour a day for a year uses ${h.num(2 * 365)} kWh. You then multiply by the kWh price of your option: ${h.kwh(h.P.base.kwh['6'])} on Base at 6 kVA, ${h.kwh(h.P.hc.hp)} or ${h.kwh(h.P.hc.hc)} on Off-peak depending on the hour, from ${h.kwh(h.P.tempo.kwh.B.hc)} to ${h.kwh(h.P.tempo.kwh.R.hp)} on Tempo depending on the colour, under the regulated tariff of 1 August 2026. The power is printed on the appliance’s rating plate; for a thermostat appliance such as an oven or radiator it is a maximum, reached only part of the time. The mini-calculator does the sum for you and gives the annual cost on each option.`,
    faqs: (h) => [
      { q: 'Where do I find an appliance’s power?', a: 'On its rating plate, often stuck on the back or underneath, or in its manual: it is given in watts (W) or kilowatts (kW). For a recent appliance the energy label sometimes gives an annual consumption in kWh directly, measured with a standard method. A plug-in power meter measures real consumption, which helps with thermostat appliances.' },
      { q: 'What is the difference between kW and kWh?', a: 'A kilowatt measures power, what the appliance draws at a given moment. A kilowatt-hour measures energy, what it uses over time. A 1 kW radiator left on for two hours uses 2 kWh. The bill counts kWh; the meter power, in kVA, caps the total kW drawn at the same time.' },
      { q: 'How much does an appliance on standby all year cost?', a: `A permanent ${h.num(5)} W standby adds up to ${h.num(5 / 1000 * 24 * 365)} kWh a year, or ${h.eur(5 / 1000 * 24 * 365 * h.P.base.kwh['6'])} on Base at 6 kVA. That is little for one appliance, but several standbys add up. A switched power strip cuts the TV box, games console or computer in one go when they are not in use.` },
      { q: 'Should I run appliances at night on the Base option?', a: 'No: on Base a kWh costs the same at any hour, so timing makes no difference to the bill. Shifting use only pays on the Off-peak or Tempo options. If a good share of your appliances could run at night, the comparison tool will tell you whether switching option would save you money.' },
      { q: 'How do I work out the use of an appliance run for a few minutes?', a: 'Turn the time into hours by dividing the minutes by 60, then multiply by the power in kilowatts. A 2,000 W kettle boiling for three minutes uses 2 × 0.05 = 0.1 kWh. Multiplied by the number of uses in a year, that gives its annual consumption, which the mini-calculator turns into euros for each option.' },
    ],
    body: (h) => `
<h2>The formula, and its three traps</h2>
<p>Consumption in kWh = power in kW × time in hours. To go from watts to kilowatts, divide by 1,000: 1,500 W is 1.5 kW. For a time in minutes, divide by 60: 30 minutes is 0.5 hours. A 1.5 kW appliance used for 30 minutes therefore uses 0.75 kWh.</p>
<p>The first trap is thermostat appliances. An oven, a radiator, a water heater or a washing machine heats at full power, stops, then starts again: the plate shows a maximum, not an average. The calculation then gives a ceiling, not real consumption. The second trap is time: people readily overestimate a dryer’s running time and forget an appliance that never switches off. The third is standby, the few watts drawn around the clock by appliances that are “off”.</p>

<h2>A few worked examples of appliance electricity use</h2>
<p>The table applies the formula to powers and times chosen as examples, at the prices of the ${h.src('grilleEdf', 'Tarif Bleu grid of 1 August 2026')}. Swap in your own appliances in the mini-calculator.</p>
${h.table(['Example', 'Per year', 'On Base (6 kVA)', 'Off-peak hours (HC option)', 'Red peak price per kWh'], ex(h, false), 'Annual cost including tax, standing charge excluded.', ['l', 'r', 'r', 'r', 'r'])}
<p>The last column is a reminder of what each kWh costs on a Tempo red day between 06:00 and 22:00: an appliance used at those hours on those days costs more than three and a half times its Base price. That is why “when” matters as much as “how much” once you choose Tempo.</p>

<h2>Standby, small but constant</h2>
<p>An appliance on standby draws little, but 24 hours a day, 8,760 hours a year:</p>
${h.table(['Permanent standby', 'Per year', 'On Base (6 kVA)'], veille(h), 'Standby use over 8,760 hours, prices including tax from 1 August 2026.', ['l', 'r', 'r'])}
<p>Add up the internet box, the TV decoder, the console, the computer and chargers left plugged in, and the total becomes noticeable over a year. Switching off what is not in use, with a switched power strip, costs no comfort.</p>

<h2>From one appliance to the whole home</h2>
<p>Adding up every appliance to rebuild your annual consumption is tedious and often wrong, because real running times are poorly known. Your bill, or your supplier’s online account, gives the total directly, and the Linky meter breaks it down half-hour by half-hour. The per-appliance calculation serves another purpose: deciding where to put the effort and knowing what to move into off-peak hours.</p>
<p>If several big appliances can run at night, compare the options: on Off-peak a night-time kWh costs ${h.kwh(h.P.hc.hc)}; on Tempo, ${h.kwh(h.P.tempo.kwh.B.hc)} on a blue day, within the ${h.src('creTempo2014', '22:00 to 06:00 window set by the tariff')}. The ${h.a('comparateur', 'Base, Off-peak or Tempo comparison')} works it out on your total consumption.</p>

<h2>Appliance power and meter power</h2>
<p>Each appliance’s power also helps choose the meter power: the total of what runs at the same time must not exceed the subscribed kVA, or the breaker trips. An oven, a hob, a dryer and the heating on together can exceed 9 kW. The ${h.a('puissance-compteur', 'meter power')} page adds up your appliances and gives the recommended power, with the matching standing charge from the ${h.src('creTrve2026', 'regulator’s tariff proposal')}.</p>
<h2>Comparing two appliances before buying</h2>
<p>The formula also helps compare two appliances. Two models that do the same job can be told apart by their annual consumption multiplied by the years you will keep them. A gap of ${h.num(100)} kWh a year comes to ${h.eur(100 * h.P.base.kwh['6'])} a year on Base at 6 kVA, or ${h.eur(1000 * h.P.base.kwh['6'])} over ten years at today’s prices. For appliances sold with an energy label, the standardised annual consumption printed on it allows this sum directly; for the others, start from the power and your real use.</p>
<p>The same reasoning applies to timing. On Off-peak, a kWh moved from daytime to night saves ${h.kwh(h.P.hc.hp - h.P.hc.hc)}; on Tempo, a kWh moved from red peak hours to the night saves ${h.kwh(h.P.tempo.kwh.R.hp - h.P.tempo.kwh.R.hc)}. That is why the same appliance can cost almost the same in two households on the same option, and very differently in two households with different habits.</p>

<h2>What the calculation does not tell you</h2>
<p>The cost worked out here is for energy alone. The standing charge, paid whatever you use, does not change because an appliance runs an extra hour; it only moves with the meter power. The calculation also ignores wear, maintenance and purchase price. Finally, an appliance that gives off heat indoors, such as an oven or a tumble dryer, slightly eases the heating’s work in winter: a real effect but a hard one to put a figure on, which this site does not model.</p>
<h2>From kVA to kW and back</h2>
<p>Meter power is expressed in kilovolt-amperes (kVA), appliance power in watts or kilowatts. For household use you can treat one kVA as roughly one kW: a 9 kVA meter carries about 9 kW of appliances switched on at the same time. That approximation is enough to choose your power; it plays no part in working out consumption, which depends only on the kilowatt-hours actually used.</p>
<p>The Linky meter lets you check all this: it shows the power being drawn at any moment, and the supplier’s online account gives consumption by half-hour. Switching an appliance on by itself and watching how far the displayed power rises is the simplest way to find its real power when the plate is unreadable or missing.</p>
<p>For an appliance plugged in all the time, such as a fridge or freezer, the most accurate approach is to measure its use over a whole week with a plug-in meter and multiply by 52: the compressor stops and starts, and a one-hour reading says almost nothing.</p>
<p>If you have just moved to France, note that appliances bought elsewhere in Europe use the same 230 V supply, so their rating plates read the same way and the formula applies unchanged.</p>
<p>One last tip on method: write your sums down. A list of your hungriest appliances, with their power, running time and annual use, comes in handy at every change: buying a new appliance, switching option, an electric car or heat pump arriving. Comparing it with the bill’s total also shows whether something has been forgotten, such as a back-up water heater, an aquarium or a pool pump running without anyone noticing. Keep the list with your bills and update it when the tariff changes: the kWh stay the same, only the prices move.</p>`,
  },
});

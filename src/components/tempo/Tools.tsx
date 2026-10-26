/**
 * Outils des pages Tempo et heures creuses. Chacun : un formulaire court, un résultat immédiat marqué
 * data-resultat (kit.Shell), le moteur du site (lib/engine), jamais un second calcul. Premier rendu =
 * valeurs par défaut et jour du build (propriétés) ; heure de Paris lue après hydratation (§17.5).
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import * as M from '../../lib/engine/index';
import { P } from '../../lib/engine/params';
import { parisNow } from '../../lib/today';
import { Shell, Row2, Head, Rows, Note, MethodLink, eur, type L } from '../calc/kit';
import { formatNumber, formatPercent, formatMoney } from '../../lib/format';
import SeasonCalendar from './SeasonCalendar';
import { NOM, NOM_JOUR, cardStyle, jourLong, dateLongue } from './ui';

const sepOf = (l: L) => (l === 'fr' ? ' : ' : ': ');
const n0 = (x: number, l: L) => formatNumber(x, 0, l);
const kwhP = (x: number, l: L) => formatMoney(x, 4, l);
const useParisDate = (buildDate: string) => { const [d, setD] = useState(buildDate); const [h, setH] = useState(12); useEffect(() => { const p = parisNow(); setD(p.date); setH(p.hour); }, []); return [d, h] as const; };
const kvaOpts = (min = 3) => M.PUISSANCES.filter((p) => p >= min).map((p) => ({ value: String(p), label: `${p} kVA` }));

/* ---------------- Couleur de demain : ce que va coûter la journée ---------------- */
export function DemainCalc({ lang = 'fr', buildDate, methodHref }: { lang?: L; buildDate: string; methodHref?: string }) {
  const fr = lang === 'fr', sep = sepOf(lang);
  const [today, hour] = useParisDate(buildDate);
  const [kj, setKj] = useState(30); const [hc, setHc] = useState(35);
  const demain = M.addDays(today, 1), c = M.colour(demain);
  const cout = (x: M.Couleur) => M.coutJour(x, kj, hc / 100);
  const hcOpt = kj * (hc / 100 * P.hc.hc + (1 - hc / 100) * P.hc.hp);
  const pending = !c;
  return (
    <Shell id="demain" form={<>
      <div className="rounded-xl border-2 px-4 py-2" style={cardStyle(c)} data-couleur={c ?? 'inconnue'}>
        <p className="text-xs font-medium opacity-90">{fr ? 'Demain' : 'Tomorrow'} · {jourLong(demain, lang)}</p>
        <p className="text-xl font-bold leading-tight">{c ? NOM_JOUR[lang][c] : fr ? 'Pas encore publiée' : 'Not published yet'}</p>
        <p className="mt-0.5 text-xs opacity-90">{c ? (fr ? 'Couleur publiée par RTE, valable de 6 h à 6 h' : 'Colour published by RTE, valid 06:00 to 06:00') : hour < 11 ? (fr ? 'RTE la publie vers 10 h 30' : 'RTE publishes it around 10:30') : (fr ? 'Relevé en cours, revenez dans l’heure' : 'Reading in progress, check back within the hour')}</p>
      </div>
      <Row2>
        <NumberField id="demain-kj" label={fr ? 'Votre consommation sur une journée' : 'Your use over one day'} value={kj} onChange={setKj} unit="kWh" max={500} help={fr ? 'Hiver, maison chauffée à l’électricité : 30 à 60 kWh' : 'Winter, electrically heated house: 30 to 60 kWh'} lang={lang} />
        <NumberField id="demain-hc" label={fr ? 'Part la nuit (22 h - 6 h)' : 'Share at night (22:00-06:00)'} value={hc} onChange={setHc} unit="%" max={100} lang={lang} />
      </Row2>
    </>} result={<>
      <Head label={pending ? (fr ? 'Une journée rouge vous coûterait' : 'A red day would cost you') : (fr ? `Demain, jour ${NOM[lang][c!].toLowerCase()}, vous coûtera` : `Tomorrow, a ${NOM[lang][c!].toLowerCase()} day, will cost you`)} value={eur(cout(pending ? 'R' : c!), lang)} sub={fr ? 'consommation de la journée, hors abonnement' : 'that day’s energy, standing charge excluded'} />
      <Rows rows={[
        [fr ? 'Même journée un jour bleu' : 'Same day on a blue day', eur(cout('B'), lang)],
        [fr ? 'Un jour blanc' : 'On a white day', eur(cout('W'), lang)],
        [fr ? 'Un jour rouge' : 'On a red day', eur(cout('R'), lang)],
        [fr ? 'En option Heures creuses' : 'On the Off-peak option', eur(hcOpt, lang)],
      ]} />
      <Note>{fr ? `Prix TTC du kWh au 1er août 2026 ; rouge en heures pleines${sep}${kwhP(P.tempo.kwh.R.hp, lang)}.` : `kWh prices incl. tax from 1 August 2026; red peak${sep}${kwhP(P.tempo.kwh.R.hp, lang)}.`}</Note>
      <MethodLink href={methodHref} lang={lang} />
    </>} />
  );
}

/* ---------------- Jours restants : le budget des jours rouges qui restent ---------------- */
export function JoursRestantsTool({ lang = 'fr', buildDate }: { lang?: L; buildDate: string }) {
  const fr = lang === 'fr', sep = sepOf(lang);
  const [today] = useParisDate(buildDate);
  const y = M.seasonStart(today), r = M.remaining(y);
  const [kj, setKj] = useState(40); const [hc, setHc] = useState(30);
  const rouge = r.R * M.coutJour('R', kj, hc / 100), blanc = r.W * M.coutJour('W', kj, hc / 100), bleu = M.coutJour('B', kj, hc / 100);
  const slots = M.redSlotsLeft(y);
  return (<>
    <Shell id="restants" form={<>
      <Row2>
        <NumberField id="restants-kj" label={fr ? 'Consommation d’une journée d’hiver' : 'Use on a winter day'} value={kj} onChange={setKj} unit="kWh" max={500} help={fr ? 'Relevé Linky d’un jour froid' : 'Linky reading on a cold day'} lang={lang} />
        <NumberField id="restants-hc" label={fr ? 'Part la nuit (22 h - 6 h)' : 'Share at night (22:00-06:00)'} value={hc} onChange={setHc} unit="%" max={100} lang={lang} />
      </Row2>
      <Rows rows={[
        [fr ? 'Jours rouges restants' : 'Red days left', n0(r.R, lang)],
        [fr ? 'Jours blancs restants' : 'White days left', n0(r.W, lang)],
        [fr ? 'Jours bleus restants' : 'Blue days left', n0(r.B, lang)],
        [fr ? 'Jours ouvrés encore possibles pour un rouge' : 'Weekdays still able to be red', n0(slots, lang)],
      ]} />
    </>} result={<>
      <Head label={fr ? `Les ${n0(r.R, lang)} jours rouges restants vous coûteront` : `The ${n0(r.R, lang)} red days left will cost you`} value={eur(rouge, lang)} sub={fr ? `soit ${eur(rouge - r.R * bleu, lang)} de plus que des jours bleus` : `that is ${eur(rouge - r.R * bleu, lang)} more than blue days`} />
      <Rows rows={[
        [fr ? 'Une journée rouge' : 'One red day', eur(M.coutJour('R', kj, hc / 100), lang)],
        [fr ? 'Une journée bleue' : 'One blue day', eur(bleu, lang)],
        [fr ? `Les ${n0(r.W, lang)} jours blancs restants` : `The ${n0(r.W, lang)} white days left`, eur(blanc, lang)],
      ]} />
      <Note>{fr ? `Saison ${y}-${y + 1} au ${dateLongue(M.lastPublished(y) ?? today, lang)}, couleurs publiées par RTE${sep}${n0(r.u.R, lang)} rouge(s), ${n0(r.u.W, lang)} blanc(s), ${n0(r.u.B, lang)} bleu(s).` : `Season ${y}-${y + 1} to ${dateLongue(M.lastPublished(y) ?? today, lang)}, colours published by RTE${sep}${n0(r.u.R, lang)} red, ${n0(r.u.W, lang)} white, ${n0(r.u.B, lang)} blue.`}</Note>
    </>} />
    <SeasonCalendar y={y} lang={lang} today={today} />
  </>);
}

/* ---------------- Historique : une saison passée ---------------- */
export function HistoriqueTool({ lang = 'fr', buildDate }: { lang?: L; buildDate: string }) {
  const fr = lang === 'fr';
  const keys = M.seasonKeys();
  const [today] = useParisDate(buildDate);
  const closed = keys.filter((k) => M.seasonStats(Number(k.slice(0, 4))).complete);
  const [k, setK] = useState(closed[closed.length - 1]); const [kj, setKj] = useState(40);
  const y = Number(k.slice(0, 4)), s = M.seasonStats(y);
  const surcout = s.n.R * (M.coutJour('R', kj, 0.3) - M.coutJour('B', kj, 0.3));
  return (<>
    <Shell id="historique" form={<>
      <Row2>
        <SelectField id="historique-saison" label={fr ? 'Saison' : 'Season'} value={k} onChange={setK} options={keys.slice().reverse().map((x) => ({ value: x, label: x }))} />
        <NumberField id="historique-kj" label={fr ? 'Consommation d’un jour d’hiver' : 'Use on a winter day'} value={kj} onChange={setKj} unit="kWh" max={500} lang={lang} />
      </Row2>
    </>} result={<>
      <Head label={fr ? `Saison ${k} : jours rouges` : `Season ${k}: red days`} value={n0(s.n.R, lang)} sub={fr ? `${n0(s.n.W, lang)} blancs, ${n0(s.n.B, lang)} bleus${s.complete ? '' : ' (saison en cours)'}` : `${n0(s.n.W, lang)} white, ${n0(s.n.B, lang)} blue${s.complete ? '' : ' (current season)'}`} />
      <Rows rows={[
        [fr ? 'Premier jour rouge' : 'First red day', s.premierRouge ? dateLongue(s.premierRouge, lang) : (fr ? 'aucun' : 'none')],
        [fr ? 'Dernier jour rouge' : 'Last red day', s.dernierRouge ? dateLongue(s.dernierRouge, lang) : (fr ? 'aucun' : 'none')],
        [fr ? 'Plus longue série de rouges' : 'Longest red run', s.premierRouge ? `${n0(s.serieRouge, lang)} ${fr ? 'jours' : 'days'}` : (fr ? 'aucune' : 'none')],
        [fr ? 'Surcoût des rouges pour vous' : 'Extra cost of red days for you', eur(surcout, lang)],
      ]} />
      <Note>{fr ? 'Surcoût : chaque jour rouge comparé à un jour bleu de même consommation, 30 % la nuit, prix du 1er août 2026.' : 'Extra cost: each red day against a blue day with the same use, 30% at night, prices from 1 August 2026.'}</Note>
    </>} />
    <SeasonCalendar y={y} lang={lang} today={today} />
  </>);
}

/* ---------------- Tarif Tempo : facture annuelle à partir des relevés par couleur ---------------- */
export function TarifTempoCalc({ lang = 'fr', methodHref }: { lang?: L; methodHref?: string }) {
  const fr = lang === 'fr';
  const [kva, setKva] = useState('9');
  const [kb, setKb] = useState(5200); const [kw, setKw] = useState(1300); const [kr, setKr] = useState(900); const [hc, setHc] = useState(35);
  const n = hc / 100;
  const lignes = ([['B', kb], ['W', kw], ['R', kr]] as Array<[M.Couleur, number]>).map(([c, q]) => ({ c, q, cout: q * (n * P.tempo.kwh[c].hc + (1 - n) * P.tempo.kwh[c].hp) }));
  const abo = M.aboAnnuel('tempo', Number(kva)), conso = lignes.reduce((a, l) => a + l.cout, 0), tot = kb + kw + kr;
  const base = M.coutOption('base', { kwh: tot, kva: Number(kva), chauffage: 0, partHC: n }).total;
  const hcT = M.coutOption('hc', { kwh: tot, kva: Number(kva), chauffage: 0, partHC: n }).total;
  return (
    <Shell id="tarif-tempo" form={<>
      <Row2>
        <SelectField id="tt-kva" label={fr ? 'Puissance' : 'Meter power'} value={kva} onChange={setKva} options={kvaOpts(6)} />
        <NumberField id="tt-hc" label={fr ? 'Part en heures creuses' : 'Off-peak share'} value={hc} onChange={setHc} unit="%" max={100} lang={lang} />
      </Row2>
      <Row2>
        <NumberField id="tt-b" label={fr ? 'kWh des jours bleus' : 'kWh on blue days'} value={kb} onChange={setKb} unit="kWh" max={100000} lang={lang} />
        <NumberField id="tt-w" label={fr ? 'kWh des jours blancs' : 'kWh on white days'} value={kw} onChange={setKw} unit="kWh" max={100000} lang={lang} />
      </Row2>
      <Row2>
        <NumberField id="tt-r" label={fr ? 'kWh des jours rouges' : 'kWh on red days'} value={kr} onChange={setKr} unit="kWh" max={100000} help={fr ? 'Votre facture Tempo détaille les six index' : 'Your Tempo bill lists the six meter readings'} lang={lang} />
        <div />
      </Row2>
    </>} result={<>
      <Head label={fr ? 'Votre facture Tempo sur un an' : 'Your Tempo bill over a year'} value={eur(abo + conso, lang)} sub={fr ? `dont abonnement ${eur(abo, lang)}` : `of which standing charge ${eur(abo, lang)}`} />
      <Rows rows={[...lignes.map((l): [string, string] => [`${NOM_JOUR[lang][l.c]} (${n0(l.q, lang)} kWh)`, eur(l.cout, lang)]),
        [fr ? 'Même consommation en Base' : 'Same use on Base', eur(base, lang)],
        [fr ? 'En Heures creuses' : 'On Off-peak', eur(hcT, lang)]]} />
      <MethodLink href={methodHref} lang={lang} />
    </>} />
  );
}

/* ---------------- Nouvelles heures creuses : ce que le changement coûte ou rapporte ---------------- */
export function HeuresCreusesCalc({ lang = 'fr', methodHref }: { lang?: L; methodHref?: string }) {
  const fr = lang === 'fr';
  const H = P.heures_creuses;
  const [fixe, setFixe] = useState(3); const [midi, setMidi] = useState(4); const [saison, setSaison] = useState('ete');
  const ecart = M.ecartHpHc();
  const jE = 214, jH = 151; // 1er avril - 31 octobre ; 1er novembre - 31 mars
  const jours = saison === 'ete' ? jE : saison === 'hiver' ? jH : 365;
  const perte = fixe * ecart * jours, gain = midi * ecart * (saison === 'hiver' ? 0 : jE);
  return (
    <Shell id="heures-creuses" form={<>
      <Row2>
        <NumberField id="hc-fixe" label={fr ? 'kWh par jour lancés à heure fixe' : 'kWh a day started on a fixed timer'} value={fixe} onChange={setFixe} unit="kWh" max={200} help={fr ? 'Minuterie réglée sur vos anciennes heures creuses' : 'Timer set to your old off-peak hours'} lang={lang} />
        <NumberField id="hc-midi" label={fr ? 'kWh par jour déplaçables l’après-midi' : 'kWh a day you could run in the afternoon'} value={midi} onChange={setMidi} unit="kWh" max={200} help={fr ? 'Lave-linge, recharge, ballon en journée' : 'Washing, charging, water heater by day'} lang={lang} />
      </Row2>
      <Row2>
        <SelectField id="hc-saison" label={fr ? 'Vos nouvelles heures creuses changent' : 'Your new off-peak hours change'} value={saison} onChange={setSaison} options={[{ value: 'ete', label: fr ? 'L’été seulement (avril - octobre)' : 'In summer only (April-October)' }, { value: 'an', label: fr ? 'Toute l’année' : 'All year' }, { value: 'hiver', label: fr ? 'L’hiver seulement' : 'In winter only' }]} />
        <div />
      </Row2>
    </>} result={<>
      <Head label={fr ? 'Si vous ne reprogrammez rien' : 'If you reprogram nothing'} value={`−${eur(perte, lang)}`} sub={fr ? 'par an : ces kWh passent en heures pleines' : 'a year: those kWh move to peak hours'} />
      <Rows rows={[
        [fr ? 'Si vous profitez des heures creuses de l’après-midi' : 'If you use the afternoon off-peak hours', `+${eur(gain, lang)}`],
        [fr ? 'Écart d’un kWh heures pleines / creuses' : 'Gap per kWh, peak against off-peak', kwhP(ecart, lang)],
        [fr ? 'Heures creuses par jour' : 'Off-peak hours a day', `${n0(H.heures_par_jour, lang)} h`],
        [fr ? 'Dont au moins la nuit (23 h - 7 h)' : 'Of which at least at night (23:00-07:00)', `${n0(H.nuit_min_consecutives, lang)} h`],
      ]} />
      <Note>{fr ? `Prix de l’option Heures creuses au 1er août 2026. Été : ${n0(jE, lang)} jours (1er avril - 31 octobre).` : `Off-peak option prices from 1 August 2026. Summer: ${n0(jE, lang)} days (1 April-31 October).`}</Note>
      <MethodLink href={methodHref} lang={lang} />
    </>} />
  );
}

/* ---------------- Puissance du compteur ---------------- */
export function PuissanceCalc({ lang = 'fr', methodHref }: { lang?: L; methodHref?: string }) {
  const fr = lang === 'fr';
  const [chauf, setChauf] = useState(6); const [cuis, setCuis] = useState(3.5); const [eau, setEau] = useState(2.2); const [ve, setVe] = useState(0); const [autres, setAutres] = useState(1.5);
  const pointe = chauf + cuis + eau + ve + autres;
  const kva = M.puissanceConseillee(pointe), i = M.PUISSANCES.indexOf(kva), dessus = M.PUISSANCES[i + 1];
  const opt: M.Option[] = ['base', 'hc', 'tempo'];
  const name = { base: 'Base', hc: fr ? 'Heures creuses' : 'Off-peak', tempo: 'Tempo' };
  return (
    <Shell id="puissance" form={<>
      <Row2>
        <NumberField id="pw-ch" label={fr ? 'Chauffage allumé en même temps' : 'Heating running at once'} value={chauf} onChange={setChauf} unit="kW" max={60} decimals={1} help={fr ? 'Somme des radiateurs ou puissance de la PAC' : 'Sum of radiators or heat-pump power'} lang={lang} />
        <NumberField id="pw-cu" label={fr ? 'Cuisson (plaques, four)' : 'Cooking (hob, oven)'} value={cuis} onChange={setCuis} unit="kW" max={30} decimals={1} lang={lang} />
      </Row2>
      <Row2>
        <NumberField id="pw-eau" label={fr ? 'Ballon d’eau chaude' : 'Water heater'} value={eau} onChange={setEau} unit="kW" max={10} decimals={1} lang={lang} />
        <NumberField id="pw-ve" label={fr ? 'Recharge de voiture' : 'Car charging'} value={ve} onChange={setVe} unit="kW" max={22} decimals={1} help={fr ? 'Prise renforcée 3,7 ; borne 7,4' : 'Reinforced socket 3.7; wallbox 7.4'} lang={lang} />
      </Row2>
      <Row2>
        <NumberField id="pw-au" label={fr ? 'Autres appareils en marche' : 'Other appliances running'} value={autres} onChange={setAutres} unit="kW" max={30} decimals={1} help={fr ? 'Lave-linge, sèche-linge, éclairage' : 'Washer, dryer, lighting'} lang={lang} />
        <div />
      </Row2>
    </>} result={<>
      <Head label={fr ? 'Puissance à souscrire' : 'Power to subscribe'} value={`${kva} kVA`} sub={fr ? `pour ${formatNumber(pointe, 1, lang)} kW appelés en même temps` : `for ${formatNumber(pointe, 1, lang)} kW drawn at the same time`} />
      <Rows rows={opt.map((o): [string, string] => [`${name[o]} ${kva} kVA`, M.disponible(o, kva) ? `${eur(M.aboAnnuel(o, kva), lang)} ${fr ? '/ an' : '/ yr'}` : (fr ? 'non proposée' : 'not offered')])} />
      {dessus && <Note>{fr ? `Un cran au-dessus (${dessus} kVA) : ${eur(M.aboAnnuel('hc', dessus) - M.aboAnnuel('hc', kva), lang)} d’abonnement de plus par an en Heures creuses.` : `One step up (${dessus} kVA): ${eur(M.aboAnnuel('hc', dessus) - M.aboAnnuel('hc', kva), lang)} more standing charge a year on Off-peak.`}</Note>}
      <MethodLink href={methodHref} lang={lang} />
    </>} />
  );
}

/* ---------------- Prix du kWh : prix moyen tout compris ---------------- */
export function PrixKwhCalc({ lang = 'fr', methodHref }: { lang?: L; methodHref?: string }) {
  const fr = lang === 'fr';
  const [kwh, setKwh] = useState(4500); const [kva, setKva] = useState('6'); const [hc, setHc] = useState(35);
  const e = { kwh, kva: Number(kva), chauffage: 0.3, partHC: hc / 100 };
  const c = useMemo(() => M.comparer(e), [kwh, kva, hc]);
  const name = { base: 'Base', hc: fr ? 'Heures creuses' : 'Off-peak', tempo: 'Tempo' };
  return (
    <Shell id="prix-kwh" form={<>
      <Row2>
        <NumberField id="pk-kwh" label={fr ? 'Consommation annuelle' : 'Annual consumption'} value={kwh} onChange={setKwh} unit="kWh" max={100000} lang={lang} />
        <SelectField id="pk-kva" label={fr ? 'Puissance' : 'Meter power'} value={kva} onChange={setKva} options={kvaOpts(3)} />
      </Row2>
      <Row2>
        <NumberField id="pk-hc" label={fr ? 'Part en heures creuses' : 'Off-peak share'} value={hc} onChange={setHc} unit="%" max={100} lang={lang} />
        <div />
      </Row2>
    </>} result={<>
      <Head label={fr ? `Prix moyen du kWh, abonnement compris (${name[c.meilleure.o]})` : `Average price per kWh, standing charge included (${name[c.meilleure.o]})`} value={kwhP(c.meilleure.prixMoyen, lang)} sub={fr ? `facture annuelle ${eur(c.meilleure.total, lang)}` : `annual bill ${eur(c.meilleure.total, lang)}`} />
      <Rows rows={c.lignes.map((l): [string, string] => [name[l.o], l.dispo ? `${kwhP(l.prixMoyen, lang)} · ${eur(l.total, lang)}` : (fr ? 'non proposée' : 'not offered')])} />
      <Note>{fr ? 'Tempo calculé avec 30 % de chauffage dans la consommation.' : 'Tempo worked out with heating at 30% of consumption.'}</Note>
      <MethodLink href={methodHref} lang={lang} />
    </>} />
  );
}

/* ---------------- EJP demain : jour annoncé par EDF, jours restants, EJP ou Tempo ---------------- */
const EJP_CARTE: Record<M.StatutEjp, { fond: string; texte: string; bord: string }> = {
  ejp: { fond: '#b91c1c', texte: '#ffffff', bord: '#b91c1c' },
  non: { fond: '#ffffff', texte: '#0f172a', bord: '#94a3b8' },
  attente: { fond: '#f8fafc', texte: '#334155', bord: '#cbd5e1' },
  hors: { fond: '#f8fafc', texte: '#334155', bord: '#cbd5e1' },
};
export function EjpTool({ lang = 'fr', buildDate, methodHref }: { lang?: L; buildDate: string; methodHref?: string }) {
  const fr = lang === 'fr', sep = sepOf(lang);
  const [today, hour] = useParisDate(buildDate);
  const demain = M.addDays(today, 1), st = M.statutEjp(demain), r = M.ejpRestants(demain);
  const [kwh, setKwh] = useState(12000); const [kva, setKva] = useState('12'); const [ch, setCh] = useState(60);
  const e = M.factureEjp(kwh, Number(kva), ch / 100);
  const t = M.coutOption('tempo', { kwh, kva: Number(kva), chauffage: ch / 100, partHC: 0.35 });
  const t50 = M.coutOption('tempo', { kwh, kva: Number(kva), chauffage: ch / 100, partHC: 0.35, effortRouge: 0.5 });
  const rel = M.releveParis();
  const relTxt = rel ? `${dateLongue(rel.date, lang)}, ${rel.hour} h` : '';
  const libelle = {
    ejp: fr ? 'Oui, jour EJP' : 'Yes, an EJP day',
    non: fr ? 'Non, pas de jour EJP annoncé' : 'No EJP day announced',
    attente: fr ? 'Pas encore annoncé' : 'Not announced yet',
    hors: fr ? 'Non, hors période EJP' : 'No, outside the EJP period',
  }[st];
  const detail = {
    ejp: fr ? 'Pointe mobile de 7 h à 1 h le lendemain, annonce EDF' : 'Peak from 07:00 to 01:00 the next day, as announced by EDF',
    non: fr ? `Relevé EDF du ${relTxt} ; EDF peut annoncer jusqu’à 5 h du matin` : `EDF reading of ${relTxt}; EDF may still announce until 05:00`,
    attente: hour < 14 ? (fr ? 'EDF met à jour vers 14 h, parfois plus tard' : 'EDF updates around 14:00, sometimes later') : (fr ? 'Relevé en cours, revenez dans l’heure' : 'Reading in progress, check back within the hour'),
    hors: fr ? 'Les jours EJP tombent du 1er novembre au 31 mars' : 'EJP days fall between 1 November and 31 March',
  }[st];
  const c = EJP_CARTE[st];
  return (
    <Shell id="ejp" form={<>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="rounded-xl border-2 px-4 py-2" style={{ backgroundColor: c.fond, color: c.texte, borderColor: c.bord }} data-ejp={st}>
          <p className="text-xs font-medium opacity-90">{fr ? 'Demain' : 'Tomorrow'} · {jourLong(demain, lang)}</p>
          <p className="text-xl font-bold leading-tight">{libelle}</p>
          <p className="mt-0.5 text-xs opacity-90">{detail}</p>
        </div>
        <div className="rounded-xl border-2 border-navy-200 bg-white px-4 py-2 text-navy-900">
          <p className="text-xs font-medium text-navy-700">{fr ? `Saison ${r.y}-${r.y + 1}` : `Season ${r.y}-${r.y + 1}`}</p>
          <p className="text-xl font-bold leading-tight tabular-nums">{n0(r.restants, lang)} / {n0(r.quota, lang)}</p>
          <p className="mt-0.5 text-xs text-navy-700">{fr ? 'jours EJP restants' : 'EJP days left'}</p>
        </div>
      </div>
      <Row2>
        <NumberField id="ejp-kwh" label={fr ? 'Consommation annuelle' : 'Annual consumption'} value={kwh} onChange={setKwh} unit="kWh" max={100000} help={fr ? 'Total de la dernière facture annuelle' : 'Total on your last annual bill'} lang={lang} />
        <SelectField id="ejp-kva" label={fr ? 'Puissance' : 'Meter power'} value={kva} onChange={setKva} options={M.EJP_PUISSANCES.map((p) => ({ value: String(p), label: `${p} kVA` }))} />
      </Row2>
      <Row2>
        <NumberField id="ejp-ch" label={fr ? 'Part du chauffage électrique' : 'Electric heating share'} value={ch} onChange={setCh} unit="%" max={100} help={fr ? 'Maison chauffée à l’électricité : 50 à 70 %' : 'Electrically heated house: 50 to 70%'} lang={lang} />
        <div />
      </Row2>
    </>} result={<>
      <Head label={fr ? 'Votre facture annuelle en EJP' : 'Your annual bill on EJP'} value={eur(e.total, lang)} sub={fr ? `dont ${eur(e.kwhPointe * P.ejp.kwh.pm, lang)} pour les heures de pointe mobile` : `of which ${eur(e.kwhPointe * P.ejp.kwh.pm, lang)} for mobile peak hours`} />
      <Rows rows={[
        [fr ? 'Même consommation en Tempo' : 'Same use on Tempo', eur(t.total, lang)],
        [fr ? 'Tempo, moitié des heures rouges décalée' : 'Tempo, half of red peak use shifted', eur(t50.total, lang)],
        [fr ? 'Une journée EJP de 60 kWh' : 'A 60 kWh EJP day', eur(M.coutJourEjp(60, true), lang)],
        [fr ? 'La même journée hors EJP' : 'The same day outside EJP', eur(M.coutJourEjp(60, false), lang)],
      ]} />
      <Note>{fr ? `Grille EDF du 1er août 2026${sep}heures normales ${kwhP(P.ejp.kwh.hn, lang)}, pointe mobile ${kwhP(P.ejp.kwh.pm, lang)}. Tempo : 35 % la nuit.` : `EDF grid of 1 August 2026${sep}normal hours ${kwhP(P.ejp.kwh.hn, lang)}, mobile peak ${kwhP(P.ejp.kwh.pm, lang)}. Tempo: 35% at night.`}</Note>
      <MethodLink href={methodHref} lang={lang} />
    </>} />
  );
}

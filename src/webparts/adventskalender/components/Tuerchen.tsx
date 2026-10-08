import * as React from 'react';
import styles from './Adventskalender.module.scss';
import { IVerpackung, verpackung } from '../logic/verpackung';

/** halb = Wochenend-Türchen in einer geteilten Zelle. */
export type TuerGroesse = 'start' | 'finale' | 'breit' | 'hoch' | 'klein' | 'halb';

export interface ITuerchenProps {
  tag: number;
  groesse: TuerGroesse;
  /** Papierfarbe 0-3. */
  farbe: number;
  /** Lage im Raster; fehlt bei halben Türchen, die in ihrer Zelle liegen. */
  lage?: React.CSSProperties;
  /** Titel des Inhalts, wird auf dem geöffneten Türchen gezeigt. */
  inhaltTitel?: string;
  offen: boolean;
  heute: boolean;
  geoeffnet: boolean;
  tageBisOffen: number;
  /** Jahr des Kalenders, bestimmt zusammen mit dem Tag die Verpackung. */
  jahr: number;
  onOeffnen: (tag: number) => void;
}

const FARBEN: string[] = [styles.farbe0, styles.farbe1, styles.farbe2, styles.farbe3];
const MUSTER: string[] = [styles.muster0, styles.muster1, styles.muster2, styles.muster3, styles.muster4];
const BANDFARBEN: string[] = [styles.band0, styles.band1, styles.band2];

const GROESSEN: { [groesse in TuerGroesse]: string } = {
  start: styles.start,
  finale: styles.finale,
  breit: styles.breit,
  hoch: styles.hoch,
  klein: styles.klein,
  halb: styles.halb
};

const WOCHENTAGE: string[] = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/** Funkelnde Sterne auf dem Hauptgeschenk: Lage in Prozent, Größe in Pixel, Verzögerung in Sekunden. */
const FUNKELN: { x: number; y: number; groesse: number; verzoegerung: number }[] = [
  { x: 12, y: 18, groesse: 16, verzoegerung: 0 },
  { x: 88, y: 14, groesse: 12, verzoegerung: 0.7 },
  { x: 70, y: 78, groesse: 18, verzoegerung: 1.3 },
  { x: 8, y: 82, groesse: 11, verzoegerung: 1.9 },
  { x: 46, y: 10, groesse: 10, verzoegerung: 0.4 },
  { x: 92, y: 60, groesse: 14, verzoegerung: 2.2 },
  { x: 30, y: 62, groesse: 9, verzoegerung: 1.0 }
];

// Feste Feiertage im Advent, die eine kleine Beschriftung bekommen.
const BESCHRIFTUNG: { [tag: number]: string } = {
  6: 'Nikolaus',
  24: 'Heiligabend'
};

/** So lange läuft die Animation, in der sich das Geschenkband löst. */
const AUSPACKEN_MS: number = 650;

function wenigerBewegung(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function KlassischeSchleife(): React.ReactElement {
  return (
    <svg className={styles.schleife} viewBox="0 0 64 44" aria-hidden="true" focusable="false">
      <path className={styles.schleifeEnde} d="M29 24 L18 43 L24 41 L27 44 L32 26 Z" />
      <path className={styles.schleifeEnde} d="M35 24 L46 43 L40 41 L37 44 L32 26 Z" />
      <path d="M31 21 C22 4 4 2 4 13 C4 23 20 25 31 23 Z" />
      <path d="M33 21 C42 4 60 2 60 13 C60 23 44 25 33 23 Z" />
      <path className={styles.schleifeSchatten} d="M31 21 C24 10 12 8 10 13 C14 12 24 15 31 22 Z" />
      <path className={styles.schleifeSchatten} d="M33 21 C40 10 52 8 54 13 C50 12 40 15 33 22 Z" />
      <ellipse cx="32" cy="22" rx="5.5" ry="5" />
    </svg>
  );
}

// Rosette aus zwei Ringen von Schlaufen, wie bei gekauften Geschenkschleifen.
const ROSETTE_AUSSEN: number[] = [0, 45, 90, 135, 180, 225, 270, 315];
const ROSETTE_INNEN: number[] = [22, 82, 142, 202, 262, 322];

function Rosette(): React.ReactElement {
  return (
    <svg className={`${styles.schleife} ${styles.rosette}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {ROSETTE_AUSSEN.map(winkel => (
        <ellipse key={winkel} className={styles.schleifeEnde} cx="32" cy="17" rx="7.5" ry="14" transform={`rotate(${winkel} 32 32)`} />
      ))}
      {ROSETTE_INNEN.map(winkel => (
        <ellipse key={winkel} cx="32" cy="21" rx="6" ry="10.5" transform={`rotate(${winkel} 32 32)`} />
      ))}
      <circle className={styles.schleifeSchatten} cx="33" cy="33" r="7" />
      <circle cx="32" cy="32" r="6.5" />
    </svg>
  );
}

export default function Tuerchen(props: ITuerchenProps): React.ReactElement<ITuerchenProps> {
  const { tag, groesse, farbe, inhaltTitel, offen, heute, geoeffnet, tageBisOffen, jahr, onOeffnen } = props;
  const gross: boolean = groesse === 'start' || groesse === 'finale';
  const halb: boolean = groesse === 'halb';
  const v: IVerpackung = React.useMemo(() => {
    const basis: IVerpackung = verpackung(tag, jahr, gross);
    // Halbe Türchen sind flach: nur ein senkrechtes Band mit kleiner Schleife, Zahl daneben.
    return halb ? { ...basis, art: 'senkrecht', schleife: 'klassisch', bandY: 50, zahlY: 50 } : basis;
  }, [tag, jahr, gross, halb]);
  const [loest, setLoest] = React.useState<boolean>(false);
  const nochTage: string = halb
    ? `${tageBisOffen} T.`
    : `noch ${tageBisOffen} ${tageBisOffen === 1 ? 'Tag' : 'Tage'}`;
  const wochentag: string = WOCHENTAGE[new Date(jahr, 11, tag).getDay()];
  const hinweis: string = offen
    ? `Türchen ${tag} öffnen`
    : `Türchen ${tag}, noch ${tageBisOffen} ${tageBisOffen === 1 ? 'Tag' : 'Tage'}`;
  const verpackt: boolean = !geoeffnet;

  const klassen: string[] = [
    styles.tuerchen,
    GROESSEN[groesse],
    FARBEN[farbe],
    MUSTER[v.muster],
    BANDFARBEN[v.bandFarbe],
    offen ? styles.offen : styles.gesperrt
  ];
  if (v.art === 'anhaenger' && !geoeffnet) {
    klassen.push(styles.mitAnhaenger);
  }
  if (heute) {
    klassen.push(styles.heute);
  }
  if (geoeffnet) {
    klassen.push(styles.geoeffnet);
  }
  if (loest) {
    klassen.push(styles.loest);
  }

  // Position im Raster und Verpackung als CSS-Variablen; das Stylesheet setzt daraus Band, Schleife und Zahl.
  const lage: React.CSSProperties = {
    ...props.lage,
    ['--band-x' as string]: `${v.bandX}%`,
    ['--band-y' as string]: `${v.bandY}%`,
    ['--zahl-x' as string]: `${v.zahlX}%`,
    ['--zahl-y' as string]: `${v.zahlY}%`,
    ['--dreh' as string]: `${v.dreh}deg`
  };
  // Kleine Hinweise in die Ecken legen, in denen weder Schleife noch Zahl liegen.
  const schleifeLinks: boolean = v.bandX < 50;
  const schleifeOben: boolean = v.bandY < 50;
  const seite = (links: boolean): React.CSSProperties => (links ? { left: 10 } : { right: 10 });
  const markeEcke: React.CSSProperties = seite(schleifeOben ? !schleifeLinks : schleifeLinks);
  const countdownEcke: React.CSSProperties = seite(schleifeOben ? schleifeLinks : !schleifeLinks);

  const klick = (): void => {
    if (!offen || loest) {
      return;
    }
    if (geoeffnet || wenigerBewegung()) {
      onOeffnen(tag);
      return;
    }
    // Erst löst sich das Band, dann öffnet sich das Türchen.
    setLoest(true);
    window.setTimeout(() => {
      setLoest(false);
      onOeffnen(tag);
    }, AUSPACKEN_MS);
  };

  return (
    <button
      type="button"
      className={klassen.join(' ')}
      style={lage}
      aria-label={hinweis}
      title={hinweis}
      aria-disabled={!offen}
      onClick={klick}
    >
      <span className={styles.rahmen} aria-hidden="true" />
      {verpackt && (
        <span className={styles.geschenk} aria-hidden="true">
          {v.art !== 'waagerecht' && <span className={styles.bandSenkrecht} />}
          {v.art !== 'senkrecht' && <span className={styles.bandWaagerecht} />}
          {v.art === 'anhaenger' && <span className={styles.faden} />}
          {v.schleife === 'rosette' ? <Rosette /> : <KlassischeSchleife />}
        </span>
      )}
      {groesse === 'finale' && verpackt && FUNKELN.map((f, i) => (
        <span
          key={i}
          className={styles.funkeln}
          style={{ left: `${f.x}%`, top: `${f.y}%`, width: f.groesse, height: f.groesse, animationDelay: `${f.verzoegerung}s` }}
          aria-hidden="true"
        />
      ))}
      {heute && !geoeffnet && <span className={styles.heuteMarke} style={markeEcke}>Heute</span>}
      <span className={styles.etikett}>
        <span className={styles.zahl}>{tag}</span>
        {halb && <span className={styles.wochentag}>{wochentag}</span>}
        {!halb && BESCHRIFTUNG[tag] && <span className={styles.beschriftung}>{BESCHRIFTUNG[tag]}</span>}
        {geoeffnet && !halb && (
          <span className={styles.inhaltTitel}>{inhaltTitel || 'Nochmal ansehen'}</span>
        )}
      </span>
      {!offen && <span className={styles.countdown} style={countdownEcke}>{nochTage}</span>}
    </button>
  );
}

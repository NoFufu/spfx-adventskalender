import * as React from 'react';
import styles from './Adventskalender.module.scss';
import { Groesse, IBelegterPlatz, spannweite } from '../logic/layout';

export interface ITuerchenProps {
  platz: IBelegterPlatz;
  offen: boolean;
  heute: boolean;
  geoeffnet: boolean;
  tageBisOffen: number;
  onOeffnen: (tag: number) => void;
}

const FARBEN: string[] = [styles.farbe0, styles.farbe1, styles.farbe2, styles.farbe3];

const GROESSEN: { [groesse in Groesse]: string } = {
  start: styles.start,
  finale: styles.finale,
  breit: styles.breit,
  hoch: styles.hoch,
  klein: styles.klein
};

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

function Schleife(): React.ReactElement {
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

export default function Tuerchen(props: ITuerchenProps): React.ReactElement<ITuerchenProps> {
  const { platz, offen, heute, geoeffnet, tageBisOffen, onOeffnen } = props;
  const { tag, groesse } = platz;
  const { spalten, zeilen } = spannweite(groesse);
  const [loest, setLoest] = React.useState<boolean>(false);
  const nochTage: string = `noch ${tageBisOffen} ${tageBisOffen === 1 ? 'Tag' : 'Tage'}`;
  const hinweis: string = offen ? `Türchen ${tag} öffnen` : `Türchen ${tag}, ${nochTage}`;
  const verpackt: boolean = !geoeffnet;

  const klassen: string[] = [
    styles.tuerchen,
    GROESSEN[groesse],
    FARBEN[platz.farbe],
    offen ? styles.offen : styles.gesperrt
  ];
  if (heute) {
    klassen.push(styles.heute);
  }
  if (geoeffnet) {
    klassen.push(styles.geoeffnet);
  }
  if (loest) {
    klassen.push(styles.loest);
  }

  const lage: React.CSSProperties = {
    gridColumn: `${platz.spalte} / span ${spalten}`,
    gridRow: `${platz.zeile} / span ${zeilen}`
  };

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
          <span className={styles.bandSenkrecht} />
          <span className={styles.bandWaagerecht} />
          <Schleife />
        </span>
      )}
      {heute && !geoeffnet && <span className={styles.heuteMarke}>Heute</span>}
      <span className={styles.zahl}>{tag}</span>
      {BESCHRIFTUNG[tag] && <span className={styles.beschriftung}>{BESCHRIFTUNG[tag]}</span>}
      {!offen && <span className={styles.countdown}>{nochTage}</span>}
    </button>
  );
}

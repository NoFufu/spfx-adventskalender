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

export default function Tuerchen(props: ITuerchenProps): React.ReactElement<ITuerchenProps> {
  const { platz, offen, heute, geoeffnet, tageBisOffen, onOeffnen } = props;
  const { tag, groesse } = platz;
  const { spalten, zeilen } = spannweite(groesse);
  const nochTage: string = `noch ${tageBisOffen} ${tageBisOffen === 1 ? 'Tag' : 'Tage'}`;
  const hinweis: string = offen ? `Türchen ${tag} öffnen` : `Türchen ${tag}, ${nochTage}`;

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

  const lage: React.CSSProperties = {
    gridColumn: `${platz.spalte} / span ${spalten}`,
    gridRow: `${platz.zeile} / span ${zeilen}`
  };

  return (
    <button
      type="button"
      className={klassen.join(' ')}
      style={lage}
      aria-label={hinweis}
      title={hinweis}
      aria-disabled={!offen}
      onClick={() => {
        if (offen) {
          onOeffnen(tag);
        }
      }}
    >
      <span className={styles.rahmen} aria-hidden="true" />
      {heute && !geoeffnet && <span className={styles.heuteMarke}>Heute</span>}
      <span className={styles.zahl}>{tag}</span>
      {BESCHRIFTUNG[tag] && <span className={styles.beschriftung}>{BESCHRIFTUNG[tag]}</span>}
      {!offen && <span className={styles.countdown}>{nochTage}</span>}
    </button>
  );
}

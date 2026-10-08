import * as React from 'react';
import styles from './Adventskalender.module.scss';

export interface IDekoProps {
  /** Lage im Raster; fehlt bei halben Zellen. */
  lage?: React.CSSProperties;
  halb?: boolean;
}

// Füllt freie Stellen im Raster mit einer kleinen Weihnachtskugel und funkelnden Sternen.
export default function Deko(props: IDekoProps): React.ReactElement<IDekoProps> {
  return (
    <div className={`${styles.deko} ${props.halb ? styles.dekoHalb : ''}`} style={props.lage} aria-hidden="true">
      <svg className={styles.dekoKugel} viewBox="0 0 40 52" focusable="false">
        <line x1="20" y1="0" x2="20" y2="10" className={styles.dekoFaden} />
        <rect x="15" y="9" width="10" height="6" rx="1.5" className={styles.dekoKappe} />
        <circle cx="20" cy="33" r="17" />
        <path d="M5 30 Q20 37 35 30" className={styles.dekoLinie} />
        <circle cx="14" cy="27" r="3.5" className={styles.dekoGlanz} />
      </svg>
      <span className={styles.dekoStern} />
      <span className={styles.dekoStern} />
      <span className={styles.dekoStern} />
    </div>
  );
}

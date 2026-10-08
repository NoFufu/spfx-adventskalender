import * as React from 'react';
import styles from './Adventskalender.module.scss';

export interface ITuerchenProps {
  tag: number;
  offen: boolean;
  tageBisOffen: number;
  onOeffnen: (tag: number) => void;
}

export default function Tuerchen(props: ITuerchenProps): React.ReactElement<ITuerchenProps> {
  const { tag, offen, tageBisOffen, onOeffnen } = props;
  const hinweis: string = offen
    ? `Türchen ${tag} öffnen`
    : `Türchen ${tag}, noch ${tageBisOffen} ${tageBisOffen === 1 ? 'Tag' : 'Tage'}`;

  return (
    <button
      type="button"
      className={`${styles.tuerchen} ${offen ? styles.offen : styles.gesperrt}`}
      aria-label={hinweis}
      title={hinweis}
      aria-disabled={!offen}
      onClick={() => {
        if (offen) {
          onOeffnen(tag);
        }
      }}
    >
      <span className={styles.zahl}>{tag}</span>
      {!offen && <span className={styles.countdown}>noch {tageBisOffen} {tageBisOffen === 1 ? 'Tag' : 'Tage'}</span>}
    </button>
  );
}

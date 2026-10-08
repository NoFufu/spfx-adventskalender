import * as React from 'react';
import { Dialog, DialogType, Link } from '@fluentui/react';
import styles from './Adventskalender.module.scss';
import type { IAdventskalenderProps } from './IAdventskalenderProps';
import type { ITuerchenInhalt } from '../logic/ITuerchenInhalt';
import { ANZAHL_TUERCHEN, gemischteReihenfolge, istOffen, tageBisOffen } from '../logic/freischaltung';
import Tuerchen from './Tuerchen';

export default function Adventskalender(props: IAdventskalenderProps): React.ReactElement<IAdventskalenderProps> {
  const { titel, jahr, gemischt, vorschau, inhalte } = props;
  const jetzt: Date = props.jetzt ?? new Date();
  const [offenerTag, setOffenerTag] = React.useState<number | undefined>(undefined);

  const reihenfolge: number[] = React.useMemo(
    () => (gemischt ? gemischteReihenfolge(jahr) : Array.from({ length: ANZAHL_TUERCHEN }, (_, i) => i + 1)),
    [gemischt, jahr]
  );

  const inhalt: ITuerchenInhalt | undefined =
    offenerTag === undefined ? undefined : inhalte.filter(i => i.tag === offenerTag)[0];

  return (
    <section className={styles.adventskalender}>
      {titel && <h2 className={styles.titel}>{titel}</h2>}
      {vorschau && <p className={styles.vorschauHinweis}>Vorschau: alle Türchen sind offen.</p>}
      <div className={styles.raster}>
        {reihenfolge.map(tag => (
          <Tuerchen
            key={tag}
            tag={tag}
            offen={vorschau || istOffen(tag, jahr, jetzt)}
            tageBisOffen={tageBisOffen(tag, jahr, jetzt)}
            onOeffnen={setOffenerTag}
          />
        ))}
      </div>
      <Dialog
        hidden={offenerTag === undefined}
        onDismiss={() => setOffenerTag(undefined)}
        dialogContentProps={{
          type: DialogType.close,
          title: inhalt?.titel ?? `${offenerTag}. Dezember`,
          closeButtonAriaLabel: 'Schließen'
        }}
        minWidth={320}
        maxWidth={560}
      >
        {inhalt?.bildUrl && <img className={styles.bild} src={inhalt.bildUrl} alt="" />}
        <p className={styles.text}>{inhalt?.text ?? 'Für diesen Tag gibt es noch keinen Inhalt.'}</p>
        {inhalt?.linkUrl && (
          <Link href={inhalt.linkUrl} target="_blank" rel="noreferrer">
            Mehr dazu
          </Link>
        )}
      </Dialog>
    </section>
  );
}

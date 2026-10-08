import * as React from 'react';
import { Dialog, DialogType, IDialogContentStyles, IDialogStyles, Link } from '@fluentui/react';
import styles from './Adventskalender.module.scss';
import type { IAdventskalenderProps } from './IAdventskalenderProps';
import type { ITuerchenInhalt } from '../logic/ITuerchenInhalt';
import { adventsHinweis, istOffen, tageBisOffen } from '../logic/freischaltung';
import { belegePlaetze, IBelegterPlatz } from '../logic/layout';
import Tuerchen from './Tuerchen';

// Dialog im Stil des Kalenders statt im weißen Standard-Look.
const DIALOG_STIL: Partial<IDialogStyles> = {
  main: {
    background: 'linear-gradient(180deg, #241a30, #150f1a)',
    color: '#f7efe7',
    border: '1px solid rgba(243, 182, 106, 0.45)',
    borderRadius: 16,
    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.55)'
  }
};

const DIALOG_INHALT_STIL: Partial<IDialogContentStyles> = {
  title: {
    color: '#f3b66a',
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 30,
    fontWeight: 400,
    paddingBottom: 12
  },
  inner: { color: '#f7efe7' },
  topButton: {
    selectors: {
      '.ms-Button': { color: '#f7efe7' },
      '.ms-Button:hover': { color: '#f3b66a', background: 'rgba(255, 255, 255, 0.08)' }
    }
  }
};

function ladeGeoeffnete(schluessel: string): number[] {
  try {
    const wert: string | null = window.localStorage.getItem(schluessel);
    return wert ? JSON.parse(wert) : [];
  } catch {
    return [];
  }
}

function speichereGeoeffnete(schluessel: string, tage: number[]): void {
  try {
    window.localStorage.setItem(schluessel, JSON.stringify(tage));
  } catch {
    // Ohne Browser-Speicher (z. B. privates Fenster) geht nur das Merken verloren.
  }
}

export default function Adventskalender(props: IAdventskalenderProps): React.ReactElement<IAdventskalenderProps> {
  const { titel, jahr, gemischt, vorschau, speicherSchluessel, ladeInhalte, ladeSchluessel, bearbeitungsModus } = props;
  const jetzt: Date = props.jetzt ?? new Date();
  const [offenerTag, setOffenerTag] = React.useState<number | undefined>(undefined);
  const [geoeffnete, setGeoeffnete] = React.useState<number[]>(() => ladeGeoeffnete(speicherSchluessel));

  const [inhalte, setInhalte] = React.useState<ITuerchenInhalt[]>([]);
  const [fehler, setFehler] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    let aktuell: boolean = true;
    ladeInhalte().then(
      geladen => {
        if (aktuell) {
          setInhalte(geladen);
          setFehler(undefined);
        }
      },
      (grund: Error) => {
        if (aktuell) {
          setInhalte([]);
          setFehler(grund.message);
        }
      }
    );
    return () => {
      aktuell = false;
    };
  }, [ladeSchluessel]);

  const plaetze: IBelegterPlatz[] = React.useMemo(() => belegePlaetze(jahr, gemischt), [jahr, gemischt]);
  const heutigerTag: number =
    jetzt.getFullYear() === jahr && jetzt.getMonth() === 11 ? jetzt.getDate() : 0;

  const oeffne = (tag: number): void => {
    setOffenerTag(tag);
    if (geoeffnete.indexOf(tag) === -1) {
      const neu: number[] = [...geoeffnete, tag];
      setGeoeffnete(neu);
      speichereGeoeffnete(speicherSchluessel, neu);
    }
  };

  const inhalt: ITuerchenInhalt | undefined =
    offenerTag === undefined ? undefined : inhalte.filter(i => i.tag === offenerTag)[0];

  return (
    <section className={styles.adventskalender}>
      <header className={styles.kopf}>
        <div>
          {titel && <h2 className={styles.titel}>{titel}</h2>}
          <p className={styles.untertitel}>{adventsHinweis(jahr, jetzt)}</p>
        </div>
        {vorschau && <span className={styles.vorschauHinweis}>Vorschau: alle Türchen offen</span>}
      </header>
      {bearbeitungsModus && fehler && (
        <p className={styles.redaktionsHinweis}>
          {fehler} In den Webpart-Einstellungen kannst du sie mit „Liste anlegen“ erstellen.
        </p>
      )}
      <div className={styles.raster}>
        {plaetze.map(platz => (
          <Tuerchen
            key={platz.tag}
            platz={platz}
            offen={vorschau || istOffen(platz.tag, jahr, jetzt)}
            heute={platz.tag === heutigerTag}
            geoeffnet={geoeffnete.indexOf(platz.tag) !== -1}
            tageBisOffen={tageBisOffen(platz.tag, jahr, jetzt)}
            onOeffnen={oeffne}
          />
        ))}
      </div>
      <Dialog
        hidden={offenerTag === undefined}
        onDismiss={() => setOffenerTag(undefined)}
        dialogContentProps={{
          type: DialogType.close,
          title: inhalt?.titel ?? `${offenerTag}. Dezember`,
          closeButtonAriaLabel: 'Schließen',
          styles: DIALOG_INHALT_STIL
        }}
        styles={DIALOG_STIL}
        minWidth={420}
        maxWidth={640}
      >
        {inhalt?.bildUrl && <img className={styles.bild} src={inhalt.bildUrl} alt="" />}
        <p className={styles.text}>{inhalt?.text || 'Für diesen Tag gibt es noch keinen Inhalt.'}</p>
        {inhalt?.linkUrl && (
          <Link className={styles.link} href={inhalt.linkUrl} target="_blank" rel="noreferrer">
            Mehr dazu
          </Link>
        )}
      </Dialog>
    </section>
  );
}

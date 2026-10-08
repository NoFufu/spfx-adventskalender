import * as React from 'react';
import { Dialog, DialogType, IDialogContentStyles, IDialogStyles, Link } from '@fluentui/react';
import styles from './Adventskalender.module.scss';
import type { IAdventskalenderProps } from './IAdventskalenderProps';
import type { ITuerchenInhalt } from '../logic/ITuerchenInhalt';
import { adventsHinweis, istOffen, tageBisOffen } from '../logic/freischaltung';
import { belegePlaetze, IBelegterPlatz } from '../logic/layout';
import { Design, DESIGN_KNOEPFE, DIALOG_FARBEN, IDialogFarben } from '../logic/designs';
import Tuerchen from './Tuerchen';

// Dialog im Stil des gewählten Designs statt im Standard-Look.
function dialogStil(farben: IDialogFarben): Partial<IDialogStyles> {
  return {
    main: {
      background: farben.hintergrund,
      color: farben.text,
      border: `1px solid ${farben.rand}`,
      borderRadius: 16,
      boxShadow: '0 24px 64px rgba(0, 0, 0, 0.45)'
    }
  };
}

function dialogInhaltStil(farben: IDialogFarben): Partial<IDialogContentStyles> {
  return {
    title: {
      color: farben.titel,
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: 30,
      fontWeight: 400,
      paddingBottom: 12
    },
    inner: { color: farben.text },
    topButton: {
      selectors: {
        '.ms-Button': { color: farben.text },
        '.ms-Button:hover': { color: farben.titel, background: 'rgba(127, 127, 127, 0.12)' }
      }
    }
  };
}

const DESIGN_KLASSEN: { [design in Design]: string } = {
  winternacht: styles.winternacht,
  ihk: styles.ihk,
  klassisch: styles.klassisch
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
  const { titel, jahr, gemischt, vorschau, speicherSchluessel, ladeInhalte, ladeSchluessel, bearbeitungsModus, design, onDesignAendern } = props;
  const farben: IDialogFarben = DIALOG_FARBEN[design];
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
    <section className={`${styles.adventskalender} ${DESIGN_KLASSEN[design]}`}>
      <header className={styles.kopf}>
        <div>
          {titel && <h2 className={styles.titel}>{titel}</h2>}
          <p className={styles.untertitel}>{adventsHinweis(jahr, jetzt)}</p>
        </div>
        <div className={styles.kopfRechts}>
          {vorschau && <span className={styles.vorschauHinweis}>Vorschau: alle Türchen offen</span>}
          {bearbeitungsModus && onDesignAendern && (
            <div className={styles.designWahl} role="group" aria-label="Design wählen">
              {DESIGN_KNOEPFE.map(knopf => (
                <button
                  key={knopf.key}
                  type="button"
                  className={`${styles.designKnopf} ${knopf.key === design ? styles.designAktiv : ''}`}
                  aria-pressed={knopf.key === design}
                  onClick={() => onDesignAendern(knopf.key)}
                >
                  <span className={styles.designFarbe} style={{ background: knopf.farbe }} />
                  {knopf.name}
                </button>
              ))}
            </div>
          )}
        </div>
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
            jahr={jahr}
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
          styles: dialogInhaltStil(farben)
        }}
        styles={dialogStil(farben)}
        minWidth={420}
        maxWidth={640}
      >
        {inhalt?.bildUrl && <img className={styles.bild} src={inhalt.bildUrl} alt="" />}
        <p className={styles.text}>{inhalt?.text || 'Für diesen Tag gibt es noch keinen Inhalt.'}</p>
        {inhalt?.linkUrl && (
          <Link className={styles.link} style={{ color: farben.titel }} href={inhalt.linkUrl} target="_blank" rel="noreferrer">
            Mehr dazu
          </Link>
        )}
      </Dialog>
    </section>
  );
}

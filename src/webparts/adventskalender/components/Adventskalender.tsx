import * as React from 'react';
import { Dialog, DialogType, IDialogContentStyles, IDialogStyles, Link } from '@fluentui/react';
import styles from './Adventskalender.module.scss';
import type { IAdventskalenderProps } from './IAdventskalenderProps';
import type { ITuerchenInhalt } from '../logic/ITuerchenInhalt';
import { adventsHinweis, istOffen, tageBisOffen } from '../logic/freischaltung';
import { belegePlaetze, IBelegung, IZelle, spannweite } from '../logic/layout';
import { Design, DESIGN_KNOEPFE, DIALOG_FARBEN, gueltigesDesign, IDialogFarben } from '../logic/designs';
import Tuerchen, { TuerGroesse } from './Tuerchen';
import Deko from './Deko';

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

// Besucher können sich ein Design aussuchen; das gilt nur in ihrem Browser.
function ladeEigenesDesign(schluessel: string): Design | undefined {
  try {
    const wert: string | null = window.localStorage.getItem(schluessel);
    return wert ? gueltigesDesign(wert) : undefined;
  } catch {
    return undefined;
  }
}

function speichereEigenesDesign(schluessel: string, design: Design): void {
  try {
    window.localStorage.setItem(schluessel, design);
  } catch {
    // Ohne Browser-Speicher gilt die Auswahl nur bis zum Neuladen.
  }
}

export default function Adventskalender(props: IAdventskalenderProps): React.ReactElement<IAdventskalenderProps> {
  const { titel, jahr, gemischt, vorschau, speicherSchluessel, ladeInhalte, ladeSchluessel, bearbeitungsModus, onDesignAendern } = props;
  const designSchluessel: string = `${speicherSchluessel}-design`;
  const [eigenesDesign, setEigenesDesign] = React.useState<Design | undefined>(() => ladeEigenesDesign(designSchluessel));
  // Im Bearbeitungsmodus zählt das Design der Seite, sonst die eigene Auswahl des Besuchers.
  const design: Design = !bearbeitungsModus && eigenesDesign ? eigenesDesign : props.design;
  const designWaehlen = (neu: Design): void => {
    if (bearbeitungsModus && onDesignAendern) {
      onDesignAendern(neu);
      return;
    }
    setEigenesDesign(neu);
    speichereEigenesDesign(designSchluessel, neu);
  };
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

  const zellen: IZelle[] = React.useMemo(() => belegePlaetze(jahr, gemischt), [jahr, gemischt]);
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

  const zeigeTuer = (b: IBelegung, groesse: TuerGroesse, lage?: React.CSSProperties): React.ReactElement => (
    <Tuerchen
      key={b.tag}
      tag={b.tag}
      groesse={groesse}
      farbe={b.farbe}
      lage={lage}
      inhaltTitel={inhalte.filter(i => i.tag === b.tag)[0]?.titel}
      offen={vorschau || istOffen(b.tag, jahr, jetzt)}
      heute={b.tag === heutigerTag}
      geoeffnet={geoeffnete.indexOf(b.tag) !== -1}
      tageBisOffen={tageBisOffen(b.tag, jahr, jetzt)}
      jahr={jahr}
      onOeffnen={oeffne}
    />
  );

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
          <div className={styles.designWahl} role="group" aria-label="Design wählen">
            {DESIGN_KNOEPFE.map(knopf => (
              <button
                key={knopf.key}
                type="button"
                className={`${styles.designKnopf} ${knopf.key === design ? styles.designAktiv : ''}`}
                aria-pressed={knopf.key === design}
                onClick={() => designWaehlen(knopf.key)}
              >
                <span className={styles.designFarbe} style={{ background: knopf.farbe }} />
                {knopf.name}
              </button>
            ))}
          </div>
        </div>
      </header>
      {bearbeitungsModus && fehler && (
        <p className={styles.redaktionsHinweis}>
          {fehler} In den Webpart-Einstellungen kannst du sie mit „Liste anlegen“ erstellen.
        </p>
      )}
      <div className={styles.raster}>
        {zellen.map(zelle => {
          const { spalten, zeilen } = spannweite(zelle.groesse);
          const lage: React.CSSProperties = {
            gridColumn: `${zelle.spalte} / span ${spalten}`,
            gridRow: `${zelle.zeile} / span ${zeilen}`
          };
          const schluessel: string = `${zelle.zeile}-${zelle.spalte}`;
          if (zelle.groesse === 'doppelt' && zelle.belegung.some(b => b)) {
            return (
              <div key={schluessel} className={styles.doppelt} style={lage}>
                {zelle.belegung.map((b, i) => (b ? zeigeTuer(b, 'halb') : <Deko key={`deko-${i}`} halb />))}
              </div>
            );
          }
          const b: IBelegung | undefined = zelle.groesse === 'doppelt' ? undefined : zelle.belegung[0];
          return b ? zeigeTuer(b, zelle.groesse as TuerGroesse, lage) : <Deko key={schluessel} lage={lage} />;
        })}
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

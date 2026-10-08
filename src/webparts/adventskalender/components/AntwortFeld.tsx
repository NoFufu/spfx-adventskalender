import * as React from 'react';
import { MessageBar, MessageBarType, PrimaryButton, Spinner, SpinnerSize, TextField } from '@fluentui/react';
import { IAntwortDienst } from '../logic/IAntwortDienst';
import { IAntwort } from '../logic/auswertung';
import { IDialogFarben } from '../logic/designs';

export interface IAntwortFeldProps {
  tag: number;
  dienst: IAntwortDienst;
  /** Nur am Tag des Türchens (oder in der Vorschau) darf geantwortet werden. */
  moeglich: boolean;
  farben: IDialogFarben;
}

function uhrzeit(datum: Date): string {
  return datum.toLocaleString('de-DE', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

// Antwortfeld unter dem Inhalt eines Türchens. SharePoint kennt die angemeldete Person, Name und E-Mail kommen automatisch dazu.
export default function AntwortFeld(props: IAntwortFeldProps): React.ReactElement<IAntwortFeldProps> {
  const { tag, dienst, moeglich, farben } = props;
  const [laedt, setLaedt] = React.useState<boolean>(true);
  const [sendet, setSendet] = React.useState<boolean>(false);
  const [gesendet, setGesendet] = React.useState<IAntwort | undefined>(undefined);
  const [text, setText] = React.useState<string>('');
  const [fehler, setFehler] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    let aktuell: boolean = true;
    setLaedt(true);
    dienst.eigeneAntwort(tag).then(
      vorhanden => {
        if (aktuell) {
          setGesendet(vorhanden);
          setText(vorhanden?.antwort ?? '');
          setLaedt(false);
        }
      },
      (grund: Error) => {
        if (aktuell) {
          setFehler(`Das Antwortfeld ist noch nicht eingerichtet. ${grund.message}`);
          setLaedt(false);
        }
      }
    );
    return () => {
      aktuell = false;
    };
  }, [tag, dienst]);

  const abschicken = async (): Promise<void> => {
    setSendet(true);
    setFehler(undefined);
    try {
      setGesendet(await dienst.senden(tag, text.trim()));
    } catch (grund) {
      setFehler((grund as Error).message);
    }
    setSendet(false);
  };

  const rahmen: React.CSSProperties = {
    marginTop: 18,
    paddingTop: 14,
    borderTop: `1px solid ${farben.rand}`
  };

  if (laedt) {
    return <div style={rahmen}><Spinner size={SpinnerSize.small} label="Antwortfeld wird geladen …" /></div>;
  }

  return (
    <div style={rahmen}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: farben.titel }}>Deine Antwort</div>
      {fehler && <MessageBar messageBarType={MessageBarType.error}>{fehler}</MessageBar>}
      {moeglich ? (
        <>
          <TextField
            multiline
            autoAdjustHeight
            value={text}
            onChange={(_, wert) => setText(wert ?? '')}
            placeholder="Antwort hier eintippen"
            ariaLabel="Deine Antwort"
            disabled={sendet}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
            <PrimaryButton
              text={gesendet ? 'Antwort ändern' : 'Antwort abschicken'}
              disabled={sendet || text.trim().length === 0 || text.trim() === gesendet?.antwort}
              onClick={() => { abschicken().catch(() => undefined); }}
            />
            <span style={{ fontSize: 13, opacity: 0.85 }}>
              {gesendet
                ? `Gesendet als ${dienst.name} am ${uhrzeit(gesendet.geaendert)}. Ändern geht bis heute 24 Uhr.`
                : `Wird als ${dienst.name} abgeschickt.`}
            </span>
          </div>
        </>
      ) : (
        <p style={{ margin: 0, opacity: 0.85 }}>
          {gesendet
            ? `Deine Antwort: „${gesendet.antwort}“${gesendet.ergebnis !== 'offen' ? ` (${gesendet.ergebnis})` : ''}`
            : `Antworten waren nur am ${tag}. Dezember möglich.`}
        </p>
      )}
    </div>
  );
}

import * as React from 'react';
import {
  DefaultButton, Dropdown, IDropdownOption, MessageBar, MessageBarType, Panel, PanelType, PrimaryButton, Spinner
} from '@fluentui/react';
import { IAntwortDienst } from '../logic/IAntwortDienst';
import { Ergebnis, IAntwort, ILoesung, pruefe } from '../logic/auswertung';

export interface IAuswertungProps {
  dienst: IAntwortDienst;
  offen: boolean;
  onSchliessen: () => void;
}

const FARBE: { [e in Ergebnis]: string } = {
  offen: '#8a8886',
  richtig: '#107c10',
  falsch: '#a4262c',
  'zu spät': '#8f6200'
};

function zeit(datum: Date): string {
  return datum.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// Auswertung für Organisatoren: prüft offene Antworten automatisch gegen die Lösung, speichert das Ergebnis
// und erlaubt Korrekturen per Klick. Sichtbar im Bearbeitungsmodus der Seite.
export default function Auswertung(props: IAuswertungProps): React.ReactElement<IAuswertungProps> {
  const { dienst, offen, onSchliessen } = props;
  const [antworten, setAntworten] = React.useState<IAntwort[] | undefined>(undefined);
  const [loesungen, setLoesungen] = React.useState<ILoesung[]>([]);
  const [fehler, setFehler] = React.useState<string | undefined>(undefined);
  const [tag, setTag] = React.useState<number | undefined>(undefined);
  const [gewinner, setGewinner] = React.useState<IAntwort | undefined>(undefined);

  React.useEffect(() => {
    if (!offen) {
      return;
    }
    let aktuell: boolean = true;
    setAntworten(undefined);
    setFehler(undefined);
    (async () => {
      const [geladen, geloest] = await Promise.all([dienst.alleAntworten(), dienst.loesungen()]);
      // Offene Antworten automatisch prüfen und das Ergebnis gleich speichern.
      const alle: IAntwort[] = [];
      for (const a of geladen) {
        const vorschlag: Ergebnis | undefined =
          a.ergebnis === 'offen' ? pruefe(a, geloest.filter(l => l.tag === a.tag)[0]?.loesung) : undefined;
        if (vorschlag) {
          await dienst.ergebnisSpeichern(a.id, vorschlag);
        }
        alle.push(vorschlag ? { ...a, ergebnis: vorschlag } : a);
      }
      if (aktuell) {
        setLoesungen(geloest);
        setAntworten(alle);
        const tage: number[] = alle.map(a => a.tag);
        setTag(tage.length ? Math.max(...tage) : undefined);
      }
    })().catch((grund: Error) => {
      if (aktuell) {
        setFehler(`Die Antworten konnten nicht geladen werden. Nur Organisatoren mit Zugriff auf die Antwort- und Lösungsliste können auswerten. (${grund.message})`);
      }
    });
    return () => {
      aktuell = false;
    };
  }, [offen, dienst]);

  const setze = (antwort: IAntwort, ergebnis: Ergebnis): void => {
    dienst.ergebnisSpeichern(antwort.id, ergebnis).then(
      () => setAntworten(liste => liste?.map(a => (a.id === antwort.id ? { ...a, ergebnis } : a))),
      (grund: Error) => setFehler(grund.message)
    );
  };

  const tage: number[] = antworten ? antworten.map(a => a.tag).filter((t, i, alle) => alle.indexOf(t) === i).sort((a, b) => a - b) : [];
  const optionen: IDropdownOption[] = tage.map(t => ({
    key: t,
    text: `${t}. Dezember (${antworten?.filter(a => a.tag === t).length} Antworten)`
  }));
  const desTages: IAntwort[] = antworten?.filter(a => a.tag === tag) ?? [];
  const richtige: IAntwort[] = desTages.filter(a => a.ergebnis === 'richtig');
  const loesung: string | undefined = loesungen.filter(l => l.tag === tag)[0]?.loesung;

  return (
    <Panel isOpen={offen} onDismiss={onSchliessen} type={PanelType.large} headerText="Antworten auswerten" closeButtonAriaLabel="Schließen">
      {fehler && <MessageBar messageBarType={MessageBarType.error}>{fehler}</MessageBar>}
      {!antworten && !fehler && <Spinner label="Antworten werden geladen und geprüft …" />}
      {antworten && antworten.length === 0 && <p>Es sind noch keine Antworten eingegangen.</p>}
      {antworten && antworten.length > 0 && (
        <>
          <Dropdown
            label="Türchen"
            options={optionen}
            selectedKey={tag}
            onChange={(_, o) => { setTag(Number(o?.key)); setGewinner(undefined); }}
            styles={{ root: { maxWidth: 320 } }}
          />
          <p>
            <strong>Lösung:</strong> {loesung || 'keine hinterlegt, bitte selbst bewerten'}
            <br />
            <strong>{richtige.length}</strong> richtig von {desTages.length} Antworten.
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <PrimaryButton
              text="Gewinner auslosen"
              disabled={richtige.length === 0}
              onClick={() => setGewinner(richtige[Math.floor(Math.random() * richtige.length)])}
            />
            {gewinner && <span>🎉 <strong>{gewinner.name}</strong> {gewinner.email && `(${gewinner.email})`}</span>}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #c8c6c4' }}>
                <th style={{ padding: 6 }}>Name</th>
                <th style={{ padding: 6 }}>Antwort</th>
                <th style={{ padding: 6 }}>Zeit</th>
                <th style={{ padding: 6 }}>Ergebnis</th>
                <th style={{ padding: 6 }} />
              </tr>
            </thead>
            <tbody>
              {desTages.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #edebe9', verticalAlign: 'top' }}>
                  <td style={{ padding: 6 }}>{a.name}</td>
                  <td style={{ padding: 6, whiteSpace: 'pre-line' }}>{a.antwort}</td>
                  <td style={{ padding: 6, whiteSpace: 'nowrap' }}>{zeit(a.geaendert)}</td>
                  <td style={{ padding: 6, color: FARBE[a.ergebnis], fontWeight: 600 }}>{a.ergebnis}</td>
                  <td style={{ padding: 6, whiteSpace: 'nowrap' }}>
                    <DefaultButton text="Richtig" onClick={() => setze(a, 'richtig')} disabled={a.ergebnis === 'richtig'} styles={{ root: { minWidth: 0, marginRight: 4 } }} />
                    <DefaultButton text="Falsch" onClick={() => setze(a, 'falsch')} disabled={a.ergebnis === 'falsch'} styles={{ root: { minWidth: 0 } }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 12, color: '#605e5c' }}>
            Alle Antworten stehen auch in der Liste mit den Antworten und lassen sich dort nach Excel exportieren.
          </p>
        </>
      )}
    </Panel>
  );
}

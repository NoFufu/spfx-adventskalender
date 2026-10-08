import { Ergebnis, IAntwort, ILoesung } from './auswertung';

/** Was Kalender und Auswertung zum Antworten brauchen; die Umsetzung spricht mit SharePoint. */
export interface IAntwortDienst {
  /** Angemeldete Person, so wie sie in der Auswertung erscheint. */
  name: string;
  /** Eigene Antwort für den Tag, falls schon abgeschickt. */
  eigeneAntwort(tag: number): Promise<IAntwort | undefined>;
  /** Neue Antwort anlegen oder die eigene überschreiben. */
  senden(tag: number, text: string): Promise<IAntwort>;
  /** Alle Antworten des Jahres (nur für Organisatoren lesbar). */
  alleAntworten(): Promise<IAntwort[]>;
  /** Lösungen des Jahres (nur für Organisatoren lesbar). */
  loesungen(): Promise<ILoesung[]>;
  ergebnisSpeichern(id: number, ergebnis: Ergebnis): Promise<void>;
}

import { ITuerchenInhalt } from '../logic/ITuerchenInhalt';

export interface IAdventskalenderProps {
  titel: string;
  jahr: number;
  gemischt: boolean;
  /** Redaktionsvorschau: alle Türchen offen, unabhängig vom Datum. */
  vorschau: boolean;
  /** Lädt die Inhalte der freigeschalteten Türchen (aus der SharePoint-Liste). */
  ladeInhalte: () => Promise<ITuerchenInhalt[]>;
  /** Ändert sich dieser Wert, werden die Inhalte neu geladen (z. B. andere Liste oder neuer Tag). */
  ladeSchluessel: string;
  /** Hinweise für Redakteure (z. B. fehlende Liste) nur im Bearbeitungsmodus zeigen. */
  bearbeitungsModus: boolean;
  /** Schlüssel für den Browser-Speicher, in dem geöffnete Türchen gemerkt werden. */
  speicherSchluessel: string;
  /** Für Tests und die Vorschau; Standard ist die aktuelle Uhrzeit. */
  jetzt?: Date;
}

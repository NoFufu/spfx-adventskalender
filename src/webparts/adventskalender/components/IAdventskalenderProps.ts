import { ITuerchenInhalt } from '../logic/ITuerchenInhalt';
import { Design } from '../logic/designs';
import { IAntwortDienst } from '../logic/IAntwortDienst';

export interface IAdventskalenderProps {
  titel: string;
  jahr: number;
  gemischt: boolean;
  design: Design;
  /** Redaktionsvorschau: alle Türchen offen, unabhängig vom Datum. */
  vorschau: boolean;
  /** Lädt die Inhalte der freigeschalteten Türchen (aus der SharePoint-Liste). */
  ladeInhalte: () => Promise<ITuerchenInhalt[]>;
  /** Ändert sich dieser Wert, werden die Inhalte neu geladen (z. B. andere Liste oder neuer Tag). */
  ladeSchluessel: string;
  /** Hinweise für Redakteure (z. B. fehlende Liste) nur im Bearbeitungsmodus zeigen. */
  bearbeitungsModus: boolean;
  /** Wird aufgerufen, wenn im Bearbeitungsmodus ein anderes Design gewählt wird. */
  onDesignAendern?: (design: Design) => void;
  /** Schlüssel für den Browser-Speicher, in dem geöffnete Türchen gemerkt werden. */
  speicherSchluessel: string;
  /** Antworten abschicken und auswerten; ohne Dienst gibt es kein Antwortfeld. */
  antwortDienst?: IAntwortDienst;
  /** Für Tests und die Vorschau; Standard ist die aktuelle Uhrzeit. */
  jetzt?: Date;
}

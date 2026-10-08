import { ITuerchenInhalt } from '../logic/ITuerchenInhalt';

export interface IAdventskalenderProps {
  titel: string;
  jahr: number;
  gemischt: boolean;
  /** Redaktionsvorschau: alle Türchen offen, unabhängig vom Datum. */
  vorschau: boolean;
  inhalte: ITuerchenInhalt[];
  /** Schlüssel für den Browser-Speicher, in dem geöffnete Türchen gemerkt werden. */
  speicherSchluessel: string;
  /** Für Tests und die Vorschau; Standard ist die aktuelle Uhrzeit. */
  jetzt?: Date;
}

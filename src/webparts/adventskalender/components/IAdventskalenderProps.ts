import { ITuerchenInhalt } from '../logic/ITuerchenInhalt';

export interface IAdventskalenderProps {
  titel: string;
  jahr: number;
  gemischt: boolean;
  /** Redaktionsvorschau: alle Türchen offen, unabhängig vom Datum. */
  vorschau: boolean;
  inhalte: ITuerchenInhalt[];
  /** Für Tests und die Vorschau; Standard ist die aktuelle Uhrzeit. */
  jetzt?: Date;
}

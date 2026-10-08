/** Inhalt hinter einem Türchen. Entspricht später einem Eintrag der Liste "Adventskalender". */
export interface ITuerchenInhalt {
  tag: number;
  titel: string;
  text: string;
  bildUrl?: string;
  linkUrl?: string;
  /** Zeigt ein Antwortfeld unter dem Inhalt. */
  frage?: boolean;
}

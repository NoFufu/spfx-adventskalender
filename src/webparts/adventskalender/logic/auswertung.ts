import { IAntwortDienst } from './IAntwortDienst';

// Automatische Prüfung von Antworten gegen die hinterlegte Lösung (ohne SharePoint-Abhängigkeit, damit testbar).

export type Ergebnis = 'offen' | 'richtig' | 'falsch' | 'zu spät';

export const ERGEBNISSE: Ergebnis[] = ['offen', 'richtig', 'falsch', 'zu spät'];

export interface IAntwort {
  id: number;
  tag: number;
  jahr: number;
  name: string;
  email: string;
  antwort: string;
  ergebnis: Ergebnis;
  /** Letzte Änderung, vom Server gesetzt. */
  geaendert: Date;
}

export interface ILoesung {
  tag: number;
  /** Erlaubte Antworten, getrennt durch Semikolon oder Zeilenumbruch. */
  loesung: string;
}

/** Kleinschreibung, Umlaute ausgeschrieben, nur Buchstaben, Ziffern und einfache Leerzeichen. */
export function normalisieren(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function erlaubteAntworten(loesung: string): string[] {
  return loesung
    .split(/[;\n]/)
    .map(normalisieren)
    .filter(teil => teil.length > 0);
}

/**
 * Richtig, wenn die Antwort einer erlaubten Lösung entspricht oder sie als ganze Wörter enthält,
 * z. B. "Ich glaube, ein Handtuch!" für die Lösung "Handtuch".
 */
export function istRichtig(antwort: string, loesung: string): boolean {
  const text: string = ` ${normalisieren(antwort)} `;
  return erlaubteAntworten(loesung).some(teil => text.indexOf(` ${teil} `) !== -1);
}

/** Antworten zählen nur, wenn sie am Tag des Türchens abgegeben wurden. */
export function rechtzeitig(antwort: IAntwort): boolean {
  const d: Date = antwort.geaendert;
  return d.getFullYear() === antwort.jahr && d.getMonth() === 11 && d.getDate() === antwort.tag;
}

/** Vorschlag für eine noch offene Antwort; undefined, wenn es keine Lösung gibt (dann bleibt sie offen). */
export function pruefe(antwort: IAntwort, loesung: string | undefined, testlauf: boolean = false): Ergebnis | undefined {
  // Im Testlauf (Vorschau) zählt das Datum nicht, damit man vor Dezember ausprobieren kann.
  if (!testlauf && !rechtzeitig(antwort)) {
    return 'zu spät';
  }
  if (!loesung || erlaubteAntworten(loesung).length === 0) {
    return undefined;
  }
  return istRichtig(antwort.antwort, loesung) ? 'richtig' : 'falsch';
}

export function antwortMoeglich(tag: number, jahr: number, jetzt: Date, vorschau: boolean): boolean {
  return vorschau || (jetzt.getFullYear() === jahr && jetzt.getMonth() === 11 && jetzt.getDate() === tag);
}

/**
 * Lädt alle Antworten und Lösungen, prüft offene Antworten automatisch und speichert das Ergebnis.
 * Bereits bewertete Antworten (auch von Hand korrigierte) bleiben unverändert.
 */
export async function offeneAuswerten(
  dienst: IAntwortDienst,
  testlauf: boolean
): Promise<{ antworten: IAntwort[]; loesungen: ILoesung[] }> {
  const [geladen, loesungen] = await Promise.all([dienst.alleAntworten(), dienst.loesungen()]);
  const antworten: IAntwort[] = [];
  for (const a of geladen) {
    const vorschlag: Ergebnis | undefined =
      a.ergebnis === 'offen' ? pruefe(a, loesungen.filter(l => l.tag === a.tag)[0]?.loesung, testlauf) : undefined;
    if (vorschlag) {
      await dienst.ergebnisSpeichern(a.id, vorschlag);
    }
    antworten.push(vorschlag ? { ...a, ergebnis: vorschlag } : a);
  }
  return { antworten, loesungen };
}

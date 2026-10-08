// Freischaltlogik: Türchen "tag" öffnet sich am <tag>. Dezember des Kalenderjahrs um 00:00 Uhr Ortszeit.
// Reine Funktionen ohne SharePoint-Abhängigkeit, damit sie sich direkt testen lassen.

export const ANZAHL_TUERCHEN: number = 24;

const MS_PRO_TAG: number = 24 * 60 * 60 * 1000;

/** Zeitpunkt, ab dem das Türchen offen ist (00:00 Uhr Ortszeit). */
export function oeffnungsZeitpunkt(tag: number, jahr: number): Date {
  return new Date(jahr, 11, tag, 0, 0, 0, 0);
}

/** true, wenn das Türchen zum Zeitpunkt "jetzt" geöffnet werden darf. */
export function istOffen(tag: number, jahr: number, jetzt: Date): boolean {
  return jetzt.getTime() >= oeffnungsZeitpunkt(tag, jahr).getTime();
}

/**
 * Ganze Kalendertage bis zur Öffnung (0, wenn schon offen).
 * Rechnet mit Kalenderdaten statt Millisekunden, damit die Zeitumstellung nichts verschiebt.
 */
export function tageBisOffen(tag: number, jahr: number, jetzt: Date): number {
  if (istOffen(tag, jahr, jetzt)) {
    return 0;
  }
  const heute: number = Date.UTC(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate());
  const ziel: number = Date.UTC(jahr, 11, tag);
  return Math.round((ziel - heute) / MS_PRO_TAG);
}

/**
 * Mischt eine Liste in einer festen, aber zufällig wirkenden Reihenfolge. Gleicher Startwert
 * (das Jahr) ergibt immer dieselbe Reihenfolge, damit die Türchen beim Neuladen nicht springen.
 */
export function mischen<T>(liste: T[], startwert: number): T[] {
  const ergebnis: T[] = liste.slice();
  // Einfacher deterministischer Zufallsgenerator (mulberry32).
  let zustand: number = startwert >>> 0;
  const zufall = (): number => {
    zustand = (zustand + 0x6d2b79f5) >>> 0;
    let t: number = zustand;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i: number = ergebnis.length - 1; i > 0; i--) {
    const j: number = Math.floor(zufall() * (i + 1));
    const tmp: T = ergebnis[i];
    ergebnis[i] = ergebnis[j];
    ergebnis[j] = tmp;
  }
  return ergebnis;
}

/** Kurzer Hinweis unter der Überschrift, z. B. "Noch 5 Tage bis Heiligabend". */
export function adventsHinweis(jahr: number, jetzt: Date): string {
  if (!istOffen(1, jahr, jetzt)) {
    const tage: number = tageBisOffen(1, jahr, jetzt);
    return tage === 1 ? 'Morgen öffnet sich das erste Türchen' : `Noch ${tage} Tage bis zum ersten Türchen`;
  }
  if (!istOffen(ANZAHL_TUERCHEN, jahr, jetzt)) {
    const tage: number = tageBisOffen(ANZAHL_TUERCHEN, jahr, jetzt);
    return tage === 1 ? 'Morgen ist Heiligabend' : `Noch ${tage} Tage bis Heiligabend`;
  }
  return 'Frohe Weihnachten!';
}

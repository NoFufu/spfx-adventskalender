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
 * Feste, aber gemischte Anordnung der Türchen. Gleiches Jahr ergibt immer dieselbe Reihenfolge,
 * damit die Türchen beim Neuladen nicht springen.
 */
export function gemischteReihenfolge(jahr: number): number[] {
  const tage: number[] = [];
  for (let tag: number = 1; tag <= ANZAHL_TUERCHEN; tag++) {
    tage.push(tag);
  }
  // Einfacher deterministischer Zufallsgenerator (mulberry32), Startwert = Jahr.
  let zustand: number = jahr >>> 0;
  const zufall = (): number => {
    zustand = (zustand + 0x6d2b79f5) >>> 0;
    let t: number = zustand;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i: number = tage.length - 1; i > 0; i--) {
    const j: number = Math.floor(zufall() * (i + 1));
    const tmp: number = tage[i];
    tage[i] = tage[j];
    tage[j] = tmp;
  }
  return tage;
}

// Anordnung der Türchen in unterschiedlichen Größen auf einem festen 8x5-Raster ohne Lücken.
// Türchen 1 steht groß oben links, Türchen 24 noch größer unten rechts.
// Wochenend-Türchen werden ohnehin kaum geöffnet: Samstag und Sonntag teilen sich eine Zelle (je halbe Höhe).
// Bleibt eine Hälfte oder Zelle frei, steht dort Dekoration.

import { ANZAHL_TUERCHEN, mischen } from './freischaltung';

/** doppelt = eine Zelle mit zwei halben Türchen (Wochenende). */
export type Groesse = 'start' | 'finale' | 'breit' | 'hoch' | 'klein' | 'doppelt';

export interface IPlatz {
  groesse: Groesse;
  /** Zeile und Spalte im 8-Spalten-Raster (ab 1). */
  zeile: number;
  spalte: number;
}

export interface IBelegung {
  tag: number;
  /** Farbvariante 0-3, damit benachbarte Türchen sich unterscheiden. */
  farbe: number;
}

export interface IZelle extends IPlatz {
  /** Ein Eintrag, bei doppelt zwei (oben, unten). undefined = Dekoration. */
  belegung: (IBelegung | undefined)[];
}

export const SPALTEN: number = 8;
export const ZEILEN: number = 5;

export const PLAETZE: IPlatz[] = [
  { groesse: 'start', zeile: 1, spalte: 1 },
  { groesse: 'breit', zeile: 1, spalte: 3 },
  { groesse: 'hoch', zeile: 1, spalte: 5 },
  { groesse: 'klein', zeile: 1, spalte: 6 },
  { groesse: 'breit', zeile: 1, spalte: 7 },
  { groesse: 'doppelt', zeile: 2, spalte: 3 },
  { groesse: 'klein', zeile: 2, spalte: 4 },
  { groesse: 'breit', zeile: 2, spalte: 6 },
  { groesse: 'hoch', zeile: 2, spalte: 8 },
  { groesse: 'hoch', zeile: 3, spalte: 1 },
  { groesse: 'breit', zeile: 3, spalte: 2 },
  { groesse: 'doppelt', zeile: 3, spalte: 4 },
  { groesse: 'breit', zeile: 3, spalte: 5 },
  { groesse: 'doppelt', zeile: 3, spalte: 7 },
  { groesse: 'klein', zeile: 4, spalte: 2 },
  { groesse: 'hoch', zeile: 4, spalte: 3 },
  { groesse: 'breit', zeile: 4, spalte: 4 },
  { groesse: 'finale', zeile: 4, spalte: 6 },
  { groesse: 'doppelt', zeile: 5, spalte: 1 },
  { groesse: 'klein', zeile: 5, spalte: 2 },
  { groesse: 'klein', zeile: 5, spalte: 4 },
  { groesse: 'klein', zeile: 5, spalte: 5 }
];

export function spannweite(groesse: Groesse): { spalten: number; zeilen: number } {
  switch (groesse) {
    case 'start': return { spalten: 2, zeilen: 2 };
    case 'finale': return { spalten: 3, zeilen: 2 };
    case 'breit': return { spalten: 2, zeilen: 1 };
    case 'hoch': return { spalten: 1, zeilen: 2 };
    default: return { spalten: 1, zeilen: 1 };
  }
}

export function istWochenende(tag: number, jahr: number): boolean {
  const wochentag: number = new Date(jahr, 11, tag).getDay();
  return wochentag === 0 || wochentag === 6;
}

/** Fasst die Wochenendtage zu Paaren [Samstag, Sonntag] zusammen; fehlt ein Tag, bleibt die Stelle leer. */
function wochenenden(tage: number[], jahr: number): (number | undefined)[][] {
  const paare: (number | undefined)[][] = [];
  for (const tag of tage) {
    const samstag: boolean = new Date(jahr, 11, tag).getDay() === 6;
    const letztes: (number | undefined)[] | undefined = paare[paare.length - 1];
    if (!samstag && letztes && letztes[0] === tag - 1) {
      letztes[1] = tag;
    } else {
      paare.push(samstag ? [tag, undefined] : [undefined, tag]);
    }
  }
  return paare;
}

/**
 * Verteilt die Tage: 1 auf den Startplatz, 24 aufs Finale, Wochenenden paarweise in die geteilten Zellen,
 * die übrigen Tage auf die anderen Plätze, der Reihe nach oder (gemischt) in einer pro Jahr festen Reihenfolge.
 */
export function belegePlaetze(jahr: number, gemischt: boolean): IZelle[] {
  const werktage: number[] = [];
  const wochenendtage: number[] = [];
  for (let tag: number = 2; tag < ANZAHL_TUERCHEN; tag++) {
    (istWochenende(tag, jahr) ? wochenendtage : werktage).push(tag);
  }
  const werktagFolge: number[] = gemischt ? mischen(werktage, jahr) : werktage;
  const paare: (number | undefined)[][] = wochenenden(wochenendtage, jahr);
  const paarFolge: (number | undefined)[][] = gemischt ? mischen(paare, jahr + 1) : paare;

  // Bleibt ein Werktag-Platz übrig, wird der letzte kleine Platz zur Dekoration.
  const werktagPlaetze: IPlatz[] = PLAETZE.filter(p => p.groesse === 'breit' || p.groesse === 'hoch' || p.groesse === 'klein');
  const reihenfolge: IPlatz[] = [
    ...werktagPlaetze.filter(p => p.groesse !== 'klein'),
    ...werktagPlaetze.filter(p => p.groesse === 'klein')
  ];
  const leer: IPlatz[] = reihenfolge.slice(werktagFolge.length);

  let naechsterWerktag: number = 0;
  let naechstesPaar: number = 0;
  return PLAETZE.map((platz, index) => {
    const farbe = (versatz: number): number => (index * 3 + platz.zeile + versatz) % 4;
    const belege = (tag: number | undefined, versatz: number = 0): IBelegung | undefined =>
      tag === undefined ? undefined : { tag, farbe: farbe(versatz) };
    switch (platz.groesse) {
      case 'start':
        return { ...platz, belegung: [belege(1)] };
      case 'finale':
        return { ...platz, belegung: [belege(ANZAHL_TUERCHEN)] };
      case 'doppelt': {
        const paar: (number | undefined)[] = paarFolge[naechstesPaar++] || [undefined, undefined];
        return { ...platz, belegung: [belege(paar[0]), belege(paar[1], 2)] };
      }
      default:
        if (leer.indexOf(platz) !== -1) {
          return { ...platz, belegung: [undefined] };
        }
        return { ...platz, belegung: [belege(werktagFolge[naechsterWerktag++])] };
    }
  });
}

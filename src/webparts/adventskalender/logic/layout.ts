// Anordnung der Türchen in unterschiedlichen Größen.
// Auf breiten Flächen (8 Spalten x 5 Reihen) liegt jedes Türchen an einer festen Stelle,
// so dass keine Lücken entstehen. Türchen 1 steht groß oben links, Türchen 24 noch größer unten rechts.

import { ANZAHL_TUERCHEN, mischen } from './freischaltung';

export type Groesse = 'start' | 'finale' | 'breit' | 'hoch' | 'klein';

export interface IPlatz {
  groesse: Groesse;
  /** Zeile und Spalte im 8-Spalten-Raster (ab 1). */
  zeile: number;
  spalte: number;
}

export interface IBelegterPlatz extends IPlatz {
  tag: number;
  /** Farbvariante 0-3, damit benachbarte Türchen sich unterscheiden. */
  farbe: number;
}

export const SPALTEN: number = 8;

// Reihenfolge = Lesereihenfolge; auf schmalen Flächen werden die Türchen in dieser Reihenfolge angeordnet.
export const PLAETZE: IPlatz[] = [
  { groesse: 'start', zeile: 1, spalte: 1 },
  { groesse: 'klein', zeile: 1, spalte: 3 },
  { groesse: 'breit', zeile: 1, spalte: 4 },
  { groesse: 'klein', zeile: 1, spalte: 6 },
  { groesse: 'hoch', zeile: 1, spalte: 7 },
  { groesse: 'klein', zeile: 1, spalte: 8 },
  { groesse: 'hoch', zeile: 2, spalte: 3 },
  { groesse: 'klein', zeile: 2, spalte: 4 },
  { groesse: 'klein', zeile: 2, spalte: 5 },
  { groesse: 'klein', zeile: 2, spalte: 6 },
  { groesse: 'hoch', zeile: 2, spalte: 8 },
  { groesse: 'klein', zeile: 3, spalte: 1 },
  { groesse: 'klein', zeile: 3, spalte: 2 },
  { groesse: 'breit', zeile: 3, spalte: 4 },
  { groesse: 'breit', zeile: 3, spalte: 6 },
  { groesse: 'breit', zeile: 4, spalte: 1 },
  { groesse: 'klein', zeile: 4, spalte: 3 },
  { groesse: 'klein', zeile: 4, spalte: 4 },
  { groesse: 'klein', zeile: 4, spalte: 5 },
  { groesse: 'finale', zeile: 4, spalte: 6 },
  { groesse: 'klein', zeile: 5, spalte: 1 },
  { groesse: 'breit', zeile: 5, spalte: 2 },
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

/**
 * Verteilt die Tage auf die Plätze: 1 auf den Startplatz, 24 aufs Finale,
 * 2 bis 23 der Reihe nach oder (gemischt) in einer pro Jahr festen Reihenfolge.
 */
export function belegePlaetze(jahr: number, gemischt: boolean): IBelegterPlatz[] {
  const mitte: number[] = [];
  for (let tag: number = 2; tag < ANZAHL_TUERCHEN; tag++) {
    mitte.push(tag);
  }
  const reihenfolge: number[] = gemischt ? mischen(mitte, jahr) : mitte;
  let naechster: number = 0;
  return PLAETZE.map((platz, index) => {
    let tag: number;
    if (platz.groesse === 'start') {
      tag = 1;
    } else if (platz.groesse === 'finale') {
      tag = ANZAHL_TUERCHEN;
    } else {
      tag = reihenfolge[naechster++];
    }
    return { ...platz, tag, farbe: (index * 3 + platz.zeile) % 4 };
  });
}

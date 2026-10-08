import { ANZAHL_TUERCHEN } from './freischaltung';
import { belegePlaetze, IBelegterPlatz, PLAETZE, SPALTEN, spannweite } from './layout';

describe('Layout', () => {
  it('füllt das 8x5-Raster lückenlos und ohne Überlappung', () => {
    const belegt: number[][] = Array.from({ length: 5 }, () => new Array(SPALTEN).fill(0));
    for (const platz of PLAETZE) {
      const { spalten, zeilen } = spannweite(platz.groesse);
      for (let z: number = platz.zeile; z < platz.zeile + zeilen; z++) {
        for (let s: number = platz.spalte; s < platz.spalte + spalten; s++) {
          belegt[z - 1][s - 1]++;
        }
      }
    }
    expect(belegt.every(zeile => zeile.every(anzahl => anzahl === 1))).toBe(true);
  });

  it('legt 1 auf den Start, 24 aufs Finale und jeden Tag genau einmal', () => {
    for (const gemischt of [true, false]) {
      const plaetze: IBelegterPlatz[] = belegePlaetze(2026, gemischt);
      expect(plaetze.filter(p => p.groesse === 'start')[0].tag).toBe(1);
      expect(plaetze.filter(p => p.groesse === 'finale')[0].tag).toBe(ANZAHL_TUERCHEN);
      expect(plaetze.map(p => p.tag).sort((a, b) => a - b)).toEqual(
        Array.from({ length: ANZAHL_TUERCHEN }, (_, i) => i + 1)
      );
    }
  });
});

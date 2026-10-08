import { ANZAHL_TUERCHEN } from './freischaltung';
import { belegePlaetze, istWochenende, IZelle, PLAETZE, SPALTEN, spannweite, ZEILEN } from './layout';

describe('Layout', () => {
  it('füllt das 8x5-Raster lückenlos und ohne Überlappung', () => {
    const belegt: number[][] = Array.from({ length: ZEILEN }, () => new Array(SPALTEN).fill(0));
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

  for (let jahr: number = 2024; jahr <= 2034; jahr++) {
    it(`verteilt ${jahr} jeden Tag genau einmal, Wochenenden in die halben Zellen`, () => {
      for (const gemischt of [true, false]) {
        const zellen: IZelle[] = belegePlaetze(jahr, gemischt);
        expect(zellen.filter(z => z.groesse === 'start')[0].belegung[0]?.tag).toBe(1);
        expect(zellen.filter(z => z.groesse === 'finale')[0].belegung[0]?.tag).toBe(ANZAHL_TUERCHEN);
        const tage: number[] = [];
        for (const zelle of zellen) {
          for (const b of zelle.belegung) {
            if (b) {
              tage.push(b.tag);
              if (b.tag !== 1 && b.tag !== ANZAHL_TUERCHEN) {
                expect(istWochenende(b.tag, jahr)).toBe(zelle.groesse === 'doppelt');
              }
            }
          }
        }
        expect(tage.sort((a, b) => a - b)).toEqual(Array.from({ length: ANZAHL_TUERCHEN }, (_, i) => i + 1));
      }
    });
  }

  it('legt Samstag und Sonntag in dieselbe Zelle', () => {
    // 2026: Samstag 5., Sonntag 6. Dezember
    const zelle: IZelle = belegePlaetze(2026, true).filter(z => z.belegung.some(b => b?.tag === 5))[0];
    expect(zelle.belegung.map(b => b?.tag)).toEqual([5, 6]);
  });
});

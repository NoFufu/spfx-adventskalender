import { ANZAHL_BANDFARBEN, ANZAHL_MUSTER, IVerpackung, verpackung } from './verpackung';

function alleTage(jahr: number): IVerpackung[] {
  const ergebnis: IVerpackung[] = [];
  for (let tag: number = 1; tag <= 24; tag++) {
    ergebnis.push(verpackung(tag, jahr, false));
  }
  return ergebnis;
}

describe('verpackung', () => {
  it('liefert für denselben Tag immer dieselbe Verpackung', () => {
    expect(verpackung(7, 2026, false)).toEqual(verpackung(7, 2026, false));
  });

  it('bleibt in den erlaubten Bereichen und legt die Zahl gegenüber der Schleife', () => {
    for (const v of alleTage(2026)) {
      expect(v.bandX < 36 || v.bandX > 64).toBe(true);
      expect(v.bandY < 36 || v.bandY > 64).toBe(true);
      expect(v.dreh).toBeGreaterThanOrEqual(-20);
      expect(v.dreh).toBeLessThanOrEqual(20);
      expect(v.bandFarbe).toBeLessThan(ANZAHL_BANDFARBEN);
      expect(v.muster).toBeLessThan(ANZAHL_MUSTER);
      if (v.art !== 'waagerecht') {
        expect(v.bandX < 50).toBe(v.zahlX > 50);
      }
      if (v.art !== 'senkrecht') {
        expect(v.bandY < 50).toBe(v.zahlY > 50);
      }
    }
  });

  it('sorgt für Abwechslung zwischen den Türchen', () => {
    const tage: IVerpackung[] = alleTage(2026);
    expect(new Set(tage.map(v => v.art)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(tage.map(v => v.schleife)).size).toBe(2);
    expect(new Set(tage.map(v => `${v.bandX < 50}|${v.bandY < 50}`)).size).toBe(4);
  });

  it('packt große Türchen immer mit Kreuzband', () => {
    for (let tag: number = 1; tag <= 24; tag++) {
      expect(verpackung(tag, 2026, true).art).toBe('kreuz');
    }
  });
});

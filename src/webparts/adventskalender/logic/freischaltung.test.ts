import {
  ANZAHL_TUERCHEN,
  gemischteReihenfolge,
  istOffen,
  tageBisOffen
} from './freischaltung';

describe('istOffen', () => {
  it('hält alle Türchen vor dem 1. Dezember geschlossen', () => {
    const jetzt: Date = new Date(2026, 10, 30, 23, 59, 59);
    for (let tag: number = 1; tag <= ANZAHL_TUERCHEN; tag++) {
      expect(istOffen(tag, 2026, jetzt)).toBe(false);
    }
  });

  it('öffnet Türchen 1 genau um 00:00 Uhr am 1. Dezember', () => {
    expect(istOffen(1, 2026, new Date(2026, 11, 1, 0, 0, 0))).toBe(true);
    expect(istOffen(2, 2026, new Date(2026, 11, 1, 23, 59, 59))).toBe(false);
  });

  it('lässt nach dem 24. Dezember alle Türchen offen', () => {
    const jetzt: Date = new Date(2026, 11, 27);
    for (let tag: number = 1; tag <= ANZAHL_TUERCHEN; tag++) {
      expect(istOffen(tag, 2026, jetzt)).toBe(true);
    }
  });

  it('hält einen Kalender für das nächste Jahr geschlossen', () => {
    expect(istOffen(1, 2027, new Date(2026, 11, 24))).toBe(false);
  });
});

describe('tageBisOffen', () => {
  it('zählt Kalendertage bis zur Öffnung', () => {
    expect(tageBisOffen(24, 2026, new Date(2026, 11, 1, 18, 0))).toBe(23);
    expect(tageBisOffen(1, 2026, new Date(2026, 10, 30, 0, 1))).toBe(1);
  });

  it('liefert 0 für offene Türchen', () => {
    expect(tageBisOffen(5, 2026, new Date(2026, 11, 5))).toBe(0);
  });
});

describe('gemischteReihenfolge', () => {
  it('enthält jeden Tag genau einmal', () => {
    const reihenfolge: number[] = gemischteReihenfolge(2026);
    expect([...reihenfolge].sort((a, b) => a - b)).toEqual(
      Array.from({ length: ANZAHL_TUERCHEN }, (_, i) => i + 1)
    );
  });

  it('ist für dasselbe Jahr stabil', () => {
    expect(gemischteReihenfolge(2026)).toEqual(gemischteReihenfolge(2026));
  });
});

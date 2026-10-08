import {
  ANZAHL_TUERCHEN,
  adventsHinweis,
  hoechsterOffenerTag,
  istOffen,
  mischen,
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

describe('mischen', () => {
  const tage: number[] = Array.from({ length: ANZAHL_TUERCHEN }, (_, i) => i + 1);

  it('enthält jeden Eintrag genau einmal', () => {
    expect([...mischen(tage, 2026)].sort((a, b) => a - b)).toEqual(tage);
  });

  it('ist für denselben Startwert stabil und ändert die Eingabe nicht', () => {
    const kopie: number[] = tage.slice();
    expect(mischen(tage, 2026)).toEqual(mischen(tage, 2026));
    expect(tage).toEqual(kopie);
  });
});

describe('adventsHinweis', () => {
  it('zählt vor dem 1. Dezember bis zum ersten Türchen', () => {
    expect(adventsHinweis(2026, new Date(2026, 10, 28))).toBe('Noch 3 Tage bis zum ersten Türchen');
    expect(adventsHinweis(2026, new Date(2026, 10, 30))).toBe('Morgen öffnet sich das erste Türchen');
  });

  it('zählt im Dezember bis Heiligabend', () => {
    expect(adventsHinweis(2026, new Date(2026, 11, 10))).toBe('Noch 14 Tage bis Heiligabend');
    expect(adventsHinweis(2026, new Date(2026, 11, 23))).toBe('Morgen ist Heiligabend');
  });

  it('wünscht ab dem 24. frohe Weihnachten', () => {
    expect(adventsHinweis(2026, new Date(2026, 11, 24))).toBe('Frohe Weihnachten!');
  });
});

describe('hoechsterOffenerTag', () => {
  it('liefert 0 vor Dezember, den Tag im Dezember und 24 danach', () => {
    expect(hoechsterOffenerTag(2026, new Date(2026, 10, 30, 23))).toBe(0);
    expect(hoechsterOffenerTag(2026, new Date(2026, 11, 10, 8))).toBe(10);
    expect(hoechsterOffenerTag(2026, new Date(2027, 0, 5))).toBe(24);
  });
});

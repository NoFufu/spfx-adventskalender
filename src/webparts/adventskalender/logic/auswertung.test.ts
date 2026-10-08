import { antwortMoeglich, IAntwort, istRichtig, normalisieren, pruefe } from './auswertung';

function antwort(text: string, geaendert: Date = new Date(2026, 11, 7, 10)): IAntwort {
  return { id: 1, tag: 7, jahr: 2026, name: 'Test', email: '', antwort: text, ergebnis: 'offen', geaendert };
}

describe('Auswertung', () => {
  it('normalisiert Groß-/Kleinschreibung, Umlaute und Satzzeichen', () => {
    expect(normalisieren('  Grüße, Straße!  ')).toBe('gruesse strasse');
  });

  it('erkennt die Lösung auch in ganzen Sätzen und mit Alternativen', () => {
    expect(istRichtig('Ich glaube, ein Handtuch!', 'Handtuch')).toBe(true);
    expect(istRichtig('Badetuch', 'Handtuch; Badetuch')).toBe(true);
    expect(istRichtig('42', 'zweiundvierzig\n42')).toBe(true);
    expect(istRichtig('Handtücher', 'Handtuch')).toBe(false);
    expect(istRichtig('Schwamm', 'Handtuch')).toBe(false);
  });

  it('bewertet verspätete Antworten als zu spät und lässt Fragen ohne Lösung offen', () => {
    expect(pruefe(antwort('Handtuch'), 'Handtuch')).toBe('richtig');
    expect(pruefe(antwort('Schwamm'), 'Handtuch')).toBe('falsch');
    expect(pruefe(antwort('Handtuch', new Date(2026, 11, 8, 9)), 'Handtuch')).toBe('zu spät');
    expect(pruefe(antwort('Handtuch'), '')).toBeUndefined();
  });

  it('erlaubt Antworten nur am Tag des Türchens, außer in der Vorschau', () => {
    expect(antwortMoeglich(7, 2026, new Date(2026, 11, 7, 23, 59), false)).toBe(true);
    expect(antwortMoeglich(7, 2026, new Date(2026, 11, 8, 0, 1), false)).toBe(false);
    expect(antwortMoeglich(7, 2026, new Date(2026, 9, 8), true)).toBe(true);
  });
});

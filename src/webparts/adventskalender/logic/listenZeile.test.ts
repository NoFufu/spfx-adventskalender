import { sichereUrl, zeileZuInhalt } from './listenZeile';
import { BEISPIELE } from './beispielDaten';

describe('sichereUrl', () => {
  it('übernimmt nur http- und https-Adressen', () => {
    expect(sichereUrl('https://contoso.sharepoint.com/bild.jpg')).toBe('https://contoso.sharepoint.com/bild.jpg');
    // eslint-disable-next-line no-script-url
    expect(sichereUrl('javascript:alert(1)')).toBeUndefined();
    expect(sichereUrl(undefined)).toBeUndefined();
  });
});

describe('zeileZuInhalt', () => {
  it('wandelt eine Listenzeile in einen Türchen-Inhalt um', () => {
    expect(zeileZuInhalt({ Title: 'Plätzchen', Tag: 3, Text: 'Rezept', Bild: { Url: 'https://x/y.png' }, Link: null }))
      .toEqual({ tag: 3, titel: 'Plätzchen', text: 'Rezept', bildUrl: 'https://x/y.png', linkUrl: undefined, frage: false });
  });

  it('ignoriert Zeilen ohne gültigen Tag', () => {
    expect(zeileZuInhalt({ Title: 'x', Tag: 25 })).toBeUndefined();
    expect(zeileZuInhalt({ Title: 'x' })).toBeUndefined();
  });
});

describe('Beispielinhalte', () => {
  it('gibt es für alle 24 Tage mit Titel und Text', () => {
    expect(BEISPIELE).toHaveLength(24);
    expect(BEISPIELE.every(b => b.titel !== '' && b.text !== '')).toBe(true);
  });
});

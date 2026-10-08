import './test/spAttrappe';
import { AdventskalenderListe } from './AdventskalenderListe';
import { AntwortenListe, IAngemeldet } from './AntwortenListe';
import { IAntwort, offeneAuswerten } from './auswertung';
import { BEISPIELE } from './beispielDaten';
import { ITuerchenInhalt } from './ITuerchenInhalt';
import { BESITZERGRUPPE, NachgebautesSharePoint } from './test/NachgebautesSharePoint';

// Durchlauf mit nachgebautem SharePoint: Organisator Levi richtet alles ein, drei Kolleginnen und Kollegen antworten,
// danach wertet Levi aus. So wie es im Dezember auf der echten Seite laufen soll.

const WEB: string = 'https://firma.sharepoint.com/sites/intranet';
const LEVI: IAngemeldet = { id: 1, name: 'Levi', email: 'levi@firma.de' };
const ANNA: IAngemeldet = { id: 2, name: 'Anna Berger', email: 'anna@firma.de' };
const TIM: IAngemeldet = { id: 3, name: 'Tim Koch', email: 'tim@firma.de' };
const MIA: IAngemeldet = { id: 4, name: 'Mia Wolf', email: 'mia@firma.de' };

function aufbauen(): NachgebautesSharePoint {
  const sp: NachgebautesSharePoint = new NachgebautesSharePoint([LEVI.id]);
  // Bestehende Inhaltsliste aus Version 1.2, noch ohne Spalte "Frage", mit den alten Beispielzeilen.
  const inhalt = sp.listeAnlegen('Adventskalender', ['Tag', 'Jahr', 'Text', 'Bild', 'Link']);
  BEISPIELE.forEach((b, i) => sp.eintragAnlegen(inhalt, { Title: b.titel, Text: 'alter Text', Tag: i + 1, Jahr: 2026 }, LEVI.id));
  return sp;
}

function dienst(sp: NachgebautesSharePoint, wer: IAngemeldet, jahr: number = 2026): AntwortenListe {
  return new AntwortenListe(sp.client(wer.id), WEB, 'Adventskalender', jahr, wer);
}

describe('Antworten von Anfang bis Ende', () => {
  it('richtet die Listen ein, nimmt Antworten an und wertet sie aus', async () => {
    const sp: NachgebautesSharePoint = aufbauen();

    // 1. Levi klickt "Liste anlegen".
    sp.jetzt = new Date(2026, 9, 8, 12);
    const { neu, beispielTage } = await new AdventskalenderListe(sp.client(LEVI.id), WEB, 'Adventskalender').anlegen(2026);
    const hinweise: string[] = await dienst(sp, LEVI).anlegen(beispielTage);
    expect(neu).toBe(0);
    expect(hinweise).toEqual([]);
    expect(sp.listen.get('Adventskalender')?.felder.has('Frage')).toBe(true);
    expect(sp.listen.get('Adventskalender-Antworten')?.readSecurity).toBe(2);
    expect(Array.from(sp.listen.get('Adventskalender-Loesungen')?.zugriff || []).sort()).toEqual([LEVI.id, BESITZERGRUPPE].sort());

    // 2. Anna sieht am 7. Dezember das Rätsel mit Antwortfeld, aber keine Lösungen.
    const inhalte: ITuerchenInhalt[] = await new AdventskalenderListe(sp.client(ANNA.id), WEB, 'Adventskalender').laden(2026, 7);
    expect(inhalte.filter(i => i.tag === 7)[0].frage).toBe(true);
    expect(inhalte.filter(i => i.tag === 6)[0].frage).toBe(false);
    await expect(dienst(sp, ANNA).loesungen()).rejects.toThrow();

    // 3. Antworten am 7. Dezember; Anna korrigiert ihre Antwort, Mia ist einen Tag zu spät.
    sp.jetzt = new Date(2026, 11, 7, 8, 12);
    await dienst(sp, ANNA).senden(7, 'Ein Schwamm?');
    sp.jetzt = new Date(2026, 11, 7, 9, 40);
    await dienst(sp, TIM).senden(7, 'Ein Schwamm');
    sp.jetzt = new Date(2026, 11, 7, 10, 5);
    await dienst(sp, ANNA).senden(7, 'Ich glaube, ein Handtuch!');
    sp.jetzt = new Date(2026, 11, 8, 7, 30);
    await dienst(sp, MIA).senden(7, 'Handtuch');

    // Jeder sieht nur die eigene Antwort.
    const annasSicht: IAntwort[] = await dienst(sp, ANNA).alleAntworten();
    expect(annasSicht.map(a => a.name)).toEqual(['Anna Berger']);
    expect(annasSicht[0].antwort).toBe('Ich glaube, ein Handtuch!');

    // 4. Levi öffnet die Auswertung.
    const { antworten } = await offeneAuswerten(dienst(sp, LEVI), false);
    const ergebnis = (name: string): string => antworten.filter(a => a.name === name)[0].ergebnis;
    expect(antworten).toHaveLength(3);
    expect(ergebnis('Anna Berger')).toBe('richtig');
    expect(ergebnis('Tim Koch')).toBe('falsch');
    expect(ergebnis('Mia Wolf')).toBe('zu spät');

    // 5. Levi lässt Mias Antwort von Hand gelten; ein zweiter Durchlauf ändert das nicht mehr.
    const mia: IAntwort = antworten.filter(a => a.name === 'Mia Wolf')[0];
    await dienst(sp, LEVI).ergebnisSpeichern(mia.id, 'richtig');
    const zweiter = await offeneAuswerten(dienst(sp, LEVI), false);
    expect(zweiter.antworten.filter(a => a.name === 'Mia Wolf')[0].ergebnis).toBe('richtig');

    // 6. Anna sieht ihr Ergebnis; Tim kann Annas Antwort nicht ändern.
    expect((await dienst(sp, ANNA).eigeneAntwort(7))?.ergebnis).toBe('richtig');
    await expect(dienst(sp, TIM).ergebnisSpeichern(annasSicht[0].id, 'falsch')).rejects.toThrow();
  });

  it('wertet in der Vorschau auch vor Dezember aus', async () => {
    const sp: NachgebautesSharePoint = aufbauen();
    sp.jetzt = new Date(2026, 9, 8, 12);
    const { beispielTage } = await new AdventskalenderListe(sp.client(LEVI.id), WEB, 'Adventskalender').anlegen(2026);
    await dienst(sp, LEVI).anlegen(beispielTage);
    await dienst(sp, ANNA).senden(7, 'handtuch');
    const { antworten } = await offeneAuswerten(dienst(sp, LEVI), true);
    expect(antworten[0].ergebnis).toBe('richtig');
  });

  it('füllt leere Zeilen mit Rätselfragen und lässt eigene Inhalte in Ruhe', async () => {
    const sp: NachgebautesSharePoint = new NachgebautesSharePoint([LEVI.id]);
    // Eigene Liste mit 24 Zeilen, nur Tag und Jahr ausgefüllt; an Tag 2 steht schon eine eigene Frage.
    const liste = sp.listeAnlegen('Adventskalender 26', ['Tag', 'Jahr', 'Text', 'Bild', 'Link']);
    for (let tag: number = 1; tag <= 24; tag++) {
      sp.eintragAnlegen(liste, tag === 2 ? { Title: 'Unsere Frage', Text: 'Wer hat das Büro geschmückt?', Tag: tag, Jahr: 2026 } : { Tag: tag, Jahr: 2026 }, LEVI.id);
    }
    const kalender: AdventskalenderListe = new AdventskalenderListe(sp.client(LEVI.id), WEB, 'Adventskalender 26');
    const { neu, beispielTage } = await kalender.anlegen(2026);
    await new AntwortenListe(sp.client(LEVI.id), WEB, 'Adventskalender 26', 2026, LEVI).anlegen(beispielTage);
    expect(neu).toBe(23);

    const inhalte: ITuerchenInhalt[] = await kalender.laden(2026, 24);
    const tag = (t: number): ITuerchenInhalt => inhalte.filter(i => i.tag === t)[0];
    expect(tag(2).titel).toBe('Unsere Frage');
    expect(tag(9).frage).toBe(true);
    expect(tag(9).text).toContain('Stille Nacht');
    expect(inhalte.filter(i => i.frage).length).toBeGreaterThanOrEqual(8);

    // Lösungen gibt es nur für Beispielfragen, nicht für Levis eigene Frage an Tag 2.
    const loesungen = await new AntwortenListe(sp.client(LEVI.id), WEB, 'Adventskalender 26', 2026, LEVI).loesungen();
    expect(loesungen.map(l => l.tag)).toContain(9);
    expect(loesungen.map(l => l.tag)).not.toContain(2);
  });

  it('lädt eine alte Liste ohne Spalte "Frage" trotzdem', async () => {
    const sp: NachgebautesSharePoint = aufbauen();
    const inhalte: ITuerchenInhalt[] = await new AdventskalenderListe(sp.client(ANNA.id), WEB, 'Adventskalender').laden(2026, 24);
    expect(inhalte).toHaveLength(24);
    expect(inhalte.every(i => !i.frage)).toBe(true);
  });
});

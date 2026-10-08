import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { ITuerchenInhalt } from './ITuerchenInhalt';
import { ANZAHL_TUERCHEN } from './freischaltung';
import { IListenZeile, zeileZuInhalt } from './listenZeile';
import { BEISPIELE } from './beispielDaten';
import { fehlermeldung, listenPfad, listeSicherstellen, sende, spaltenSicherstellen } from './spHilfe';

// Zugriff auf die SharePoint-Liste mit den Türchen-Inhalten (eine Zeile pro Tag und Jahr).
//
// Spalten: Title (Titel), Tag (Zahl 1-24), Jahr (Zahl), Text (mehrzeilig, nur Text),
// Bild (Link/Bild-Adresse), Link (Link) und Frage (Ja/Nein: Antwortfeld zeigen). Spaltennamen sind bewusst einfach gehalten,
// damit Redakteure sie in der Listenansicht wiedererkennen.

export class ListeNichtGefunden extends Error {
  constructor(listenName: string) {
    super(`Die Liste "${listenName}" wurde auf dieser Website nicht gefunden.`);
    this.name = 'ListeNichtGefunden';
  }
}

export class AdventskalenderListe {
  constructor(
    private readonly _client: SPHttpClient,
    private readonly _webUrl: string,
    private readonly _listenName: string
  ) {}

  private get _listenPfad(): string {
    return listenPfad(this._webUrl, this._listenName);
  }

  /** Lädt die Inhalte der Tage 1 bis bisTag. Spätere Tage werden gar nicht erst abgefragt. */
  public async laden(jahr: number, bisTag: number): Promise<ITuerchenInhalt[]> {
    if (bisTag < 1) {
      return [];
    }
    const filter: string = `Jahr eq ${jahr} and Tag le ${bisTag}`;
    const abfrage = (spalten: string): Promise<SPHttpClientResponse> => this._client.get(
      `${this._listenPfad}/items?$select=${spalten}&$filter=${encodeURIComponent(filter)}&$top=100`,
      SPHttpClient.configurations.v1
    );
    let antwort: SPHttpClientResponse = await abfrage('Title,Tag,Text,Bild,Link,Frage');
    if (!antwort.ok && antwort.status !== 404) {
      // Ältere Liste ohne Spalte "Frage": ohne sie laden, bis "Liste anlegen" sie ergänzt.
      antwort = await abfrage('Title,Tag,Text,Bild,Link');
    }
    if (antwort.status === 404) {
      throw new ListeNichtGefunden(this._listenName);
    }
    if (!antwort.ok) {
      throw new Error(`Die Liste konnte nicht geladen werden: ${await fehlermeldung(antwort)}`);
    }
    const daten: { value: IListenZeile[] } = await antwort.json();
    const inhalte: ITuerchenInhalt[] = [];
    for (const zeile of daten.value) {
      const inhalt: ITuerchenInhalt | undefined = zeileZuInhalt(zeile);
      if (inhalt) {
        inhalte.push(inhalt);
      }
    }
    return inhalte;
  }

  /**
   * Legt die Liste mit allen Spalten an (falls sie fehlt) und füllt fehlende Tage des Jahres
   * mit Beispielinhalten, die Redakteure danach überschreiben. Bestehende Zeilen bleiben unverändert. Liefert die Zahl neuer Zeilen.
   */
  public async anlegen(jahr: number): Promise<number> {
    await listeSicherstellen(
      this._client, this._webUrl, this._listenName, 'Inhalte für das Adventskalender-Webpart: eine Zeile pro Türchen.'
    );
    const neueSpalten: string[] = await spaltenSicherstellen(this._client, this._listenPfad, [
      '<Field Type="Number" DisplayName="Tag" Name="Tag" Required="TRUE" Min="1" Max="24" Decimals="0" />',
      '<Field Type="Number" DisplayName="Jahr" Name="Jahr" Required="TRUE" Decimals="0" />',
      '<Field Type="Note" DisplayName="Text" Name="Text" NumLines="8" RichText="FALSE" />',
      '<Field Type="URL" DisplayName="Bild" Name="Bild" Format="Image" />',
      '<Field Type="URL" DisplayName="Link" Name="Link" Format="Hyperlink" />',
      '<Field Type="Boolean" DisplayName="Frage (Antwortfeld zeigen)" Name="Frage"><Default>0</Default></Field>'
    ]);

    const bestehend: SPHttpClientResponse = await this._client.get(
      `${this._listenPfad}/items?$select=Id,Tag,Title&$filter=${encodeURIComponent(`Jahr eq ${jahr}`)}&$top=100`,
      SPHttpClient.configurations.v1
    );
    if (!bestehend.ok) {
      throw new Error(`Die vorhandenen Zeilen konnten nicht gelesen werden (${bestehend.status}).`);
    }
    const zeilen: { Id: number; Tag: number; Title: string }[] = (await bestehend.json()).value;
    const tage: number[] = zeilen.map(z => Number(z.Tag));
    let neu: number = 0;
    for (let tag: number = 1; tag <= ANZAHL_TUERCHEN; tag++) {
      const beispiel = BEISPIELE[tag - 1];
      if (tage.indexOf(tag) === -1) {
        await this._sende(`${this._listenPfad}/items`, {
          Title: beispiel.titel, Text: beispiel.text, Tag: tag, Jahr: jahr, Frage: !!beispiel.loesung
        });
        neu++;
      } else if (neueSpalten.indexOf('Frage') !== -1 && beispiel.loesung) {
        // Spalte gerade nachgerüstet: das unveränderte Beispielrätsel bekommt gleich ein Antwortfeld.
        const zeile = zeilen.filter(z => Number(z.Tag) === tag)[0];
        if (zeile.Title === beispiel.titel) {
          await sende(this._client, `${this._listenPfad}/items(${zeile.Id})`, { Frage: true }, 'MERGE');
        }
      }
    }
    return neu;
  }

  private async _sende(url: string, inhalt: object): Promise<void> {
    await sende(this._client, url, inhalt);
  }
}

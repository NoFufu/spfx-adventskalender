import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { ITuerchenInhalt } from './ITuerchenInhalt';
import { ANZAHL_TUERCHEN } from './freischaltung';
import { IListenZeile, zeileZuInhalt } from './listenZeile';

// Zugriff auf die SharePoint-Liste mit den Türchen-Inhalten (eine Zeile pro Tag und Jahr).
//
// Spalten: Title (Titel), Tag (Zahl 1-24), Jahr (Zahl), Text (mehrzeilig, nur Text),
// Bild (Link/Bild-Adresse) und Link (Link). Spaltennamen sind bewusst einfach gehalten,
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
    return `${this._webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(this._listenName.replace(/'/g, "''"))}')`;
  }

  /** Lädt die Inhalte der Tage 1 bis bisTag. Spätere Tage werden gar nicht erst abgefragt. */
  public async laden(jahr: number, bisTag: number): Promise<ITuerchenInhalt[]> {
    if (bisTag < 1) {
      return [];
    }
    const filter: string = `Jahr eq ${jahr} and Tag le ${bisTag}`;
    const antwort: SPHttpClientResponse = await this._client.get(
      `${this._listenPfad}/items?$select=Title,Tag,Text,Bild,Link&$filter=${encodeURIComponent(filter)}&$top=100`,
      SPHttpClient.configurations.v1
    );
    if (antwort.status === 404) {
      throw new ListeNichtGefunden(this._listenName);
    }
    if (!antwort.ok) {
      throw new Error(`Die Liste konnte nicht geladen werden (${antwort.status}).`);
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
   * mit leeren Zeilen. Bestehende Zeilen bleiben unverändert. Liefert die Zahl neuer Zeilen.
   */
  public async anlegen(jahr: number): Promise<number> {
    const vorhanden: SPHttpClientResponse = await this._client.get(
      `${this._listenPfad}?$select=Id`,
      SPHttpClient.configurations.v1
    );
    if (vorhanden.status === 404) {
      await this._sende(`${this._webUrl}/_api/web/lists`, {
        Title: this._listenName,
        Description: 'Inhalte für das Adventskalender-Webpart: eine Zeile pro Türchen.',
        BaseTemplate: 100
      });
      const spalten: string[] = [
        '<Field Type="Number" DisplayName="Tag" Name="Tag" Required="TRUE" Min="1" Max="24" Decimals="0" />',
        '<Field Type="Number" DisplayName="Jahr" Name="Jahr" Required="TRUE" Decimals="0" />',
        '<Field Type="Note" DisplayName="Text" Name="Text" NumLines="8" RichText="FALSE" />',
        '<Field Type="URL" DisplayName="Bild" Name="Bild" Format="Image" />',
        '<Field Type="URL" DisplayName="Link" Name="Link" Format="Hyperlink" />'
      ];
      for (const schema of spalten) {
        // 25 = zum Standard-Inhaltstyp und zur Standardansicht hinzufügen, interner Name wie angegeben.
        await this._sende(`${this._listenPfad}/fields/createfieldasxml`, {
          parameters: { SchemaXml: schema, Options: 25 }
        });
      }
    } else if (!vorhanden.ok) {
      throw new Error(`Die Liste konnte nicht geprüft werden (${vorhanden.status}).`);
    }

    const bestehend: SPHttpClientResponse = await this._client.get(
      `${this._listenPfad}/items?$select=Tag&$filter=${encodeURIComponent(`Jahr eq ${jahr}`)}&$top=100`,
      SPHttpClient.configurations.v1
    );
    if (!bestehend.ok) {
      throw new Error(`Die vorhandenen Zeilen konnten nicht gelesen werden (${bestehend.status}).`);
    }
    const tage: number[] = ((await bestehend.json()).value as IListenZeile[]).map(z => Number(z.Tag));
    let neu: number = 0;
    for (let tag: number = 1; tag <= ANZAHL_TUERCHEN; tag++) {
      if (tage.indexOf(tag) === -1) {
        await this._sende(`${this._listenPfad}/items`, { Title: `${tag}. Dezember`, Tag: tag, Jahr: jahr });
        neu++;
      }
    }
    return neu;
  }

  private async _sende(url: string, inhalt: object): Promise<void> {
    const antwort: SPHttpClientResponse = await this._client.post(url, SPHttpClient.configurations.v1, {
      body: JSON.stringify(inhalt)
    });
    if (!antwort.ok) {
      let meldung: string = String(antwort.status);
      try {
        const fehler: { error?: { message?: string } } = await antwort.json();
        meldung = fehler.error?.message || meldung;
      } catch {
        // Antwort ohne JSON: Statuscode reicht.
      }
      throw new Error(`SharePoint hat die Änderung abgelehnt: ${meldung}`);
    }
  }
}

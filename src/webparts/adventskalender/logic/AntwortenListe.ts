import { SPHttpClient } from '@microsoft/sp-http';
import { Ergebnis, ERGEBNISSE, IAntwort, ILoesung } from './auswertung';
import { IAntwortDienst } from './IAntwortDienst';
import { BEISPIELE } from './beispielDaten';
import { holeJson, listenPfad, listeSicherstellen, sende, spaltenSicherstellen } from './spHilfe';

// Zwei Listen neben der Inhaltsliste:
// "<Liste>-Antworten": eine Zeile pro Person und Tag. Jeder sieht und ändert nur die eigenen Zeilen,
//                       Organisatoren (Besitzer) sehen alle.
// "<Liste>-Loesungen":  Lösungen pro Tag, nur für Besitzer der Website lesbar, damit niemand nachschauen kann.

interface IAntwortZeile {
  Id: number;
  Title?: string;
  Email?: string;
  Tag?: number;
  Jahr?: number;
  Antwort?: string;
  Ergebnis?: string;
  Modified: string;
}

export interface IAngemeldet {
  id: number;
  name: string;
  email: string;
}

function zuAntwort(zeile: IAntwortZeile): IAntwort {
  const ergebnis: Ergebnis = ERGEBNISSE.indexOf(zeile.Ergebnis as Ergebnis) !== -1 ? (zeile.Ergebnis as Ergebnis) : 'offen';
  return {
    id: zeile.Id,
    tag: Number(zeile.Tag),
    jahr: Number(zeile.Jahr),
    name: zeile.Title || '',
    email: zeile.Email || '',
    antwort: zeile.Antwort || '',
    ergebnis,
    geaendert: new Date(zeile.Modified)
  };
}

const ANTWORT_SPALTEN: string = 'Id,Title,Email,Tag,Jahr,Antwort,Ergebnis,Modified';

export class AntwortenListe implements IAntwortDienst {
  public readonly name: string;

  constructor(
    private readonly _client: SPHttpClient,
    private readonly _webUrl: string,
    private readonly _inhaltsListe: string,
    private readonly _jahr: number,
    private readonly _ich: IAngemeldet
  ) {
    this.name = _ich.name;
  }

  public static antwortListe(inhaltsListe: string): string {
    return `${inhaltsListe}-Antworten`;
  }

  public static loesungsListe(inhaltsListe: string): string {
    return `${inhaltsListe}-Loesungen`;
  }

  private get _antworten(): string {
    return listenPfad(this._webUrl, AntwortenListe.antwortListe(this._inhaltsListe));
  }

  private get _loesungen(): string {
    return listenPfad(this._webUrl, AntwortenListe.loesungsListe(this._inhaltsListe));
  }

  public async eigeneAntwort(tag: number): Promise<IAntwort | undefined> {
    const filter: string = `Jahr eq ${this._jahr} and Tag eq ${tag} and AuthorId eq ${this._ich.id}`;
    const daten: { value: IAntwortZeile[] } = await holeJson(
      this._client,
      `${this._antworten}/items?$select=${ANTWORT_SPALTEN}&$filter=${encodeURIComponent(filter)}&$top=1`
    );
    return daten.value.length ? zuAntwort(daten.value[0]) : undefined;
  }

  public async senden(tag: number, text: string): Promise<IAntwort> {
    const vorhanden: IAntwort | undefined = await this.eigeneAntwort(tag);
    // Eine geänderte Antwort wird neu geprüft.
    const felder: object = { Title: this._ich.name, Email: this._ich.email, Tag: tag, Jahr: this._jahr, Antwort: text, Ergebnis: 'offen' };
    if (vorhanden) {
      await sende(this._client, `${this._antworten}/items(${vorhanden.id})`, felder, 'MERGE');
    } else {
      await sende(this._client, `${this._antworten}/items`, felder);
    }
    return (await this.eigeneAntwort(tag)) as IAntwort;
  }

  public async alleAntworten(): Promise<IAntwort[]> {
    const daten: { value: IAntwortZeile[] } = await holeJson(
      this._client,
      `${this._antworten}/items?$select=${ANTWORT_SPALTEN}&$filter=${encodeURIComponent(`Jahr eq ${this._jahr}`)}&$orderby=Modified&$top=5000`
    );
    return daten.value.map(zuAntwort);
  }

  public async loesungen(): Promise<ILoesung[]> {
    const daten: { value: { Tag?: number; Loesung?: string }[] } = await holeJson(
      this._client,
      `${this._loesungen}/items?$select=Tag,Loesung&$filter=${encodeURIComponent(`Jahr eq ${this._jahr}`)}&$top=100`
    );
    return daten.value.map(z => ({ tag: Number(z.Tag), loesung: z.Loesung || '' }));
  }

  public async ergebnisSpeichern(id: number, ergebnis: Ergebnis): Promise<void> {
    await sende(this._client, `${this._antworten}/items(${id})`, { Ergebnis: ergebnis }, 'MERGE');
  }

  /**
   * Legt beide Listen an (falls sie fehlen), schränkt die Rechte ein und trägt die Beispiellösung ein.
   * Liefert Hinweise, falls etwas von Hand nachgestellt werden muss.
   */
  public async anlegen(beispielTage: number[]): Promise<string[]> {
    const hinweise: string[] = [];
    const antwortName: string = AntwortenListe.antwortListe(this._inhaltsListe);
    const neuAntworten: boolean = await listeSicherstellen(
      this._client, this._webUrl, antwortName, 'Antworten aus dem Adventskalender: eine Zeile pro Person und Tag.'
    );
    await spaltenSicherstellen(this._client, this._antworten, [
      '<Field Type="Number" DisplayName="Tag" Name="Tag" Required="TRUE" Min="1" Max="24" Decimals="0" />',
      '<Field Type="Number" DisplayName="Jahr" Name="Jahr" Required="TRUE" Decimals="0" />',
      '<Field Type="Note" DisplayName="Antwort" Name="Antwort" NumLines="4" RichText="FALSE" />',
      '<Field Type="Text" DisplayName="E-Mail" Name="Email" />',
      '<Field Type="Choice" DisplayName="Ergebnis" Name="Ergebnis" Format="Dropdown"><Default>offen</Default><CHOICES>' +
        ERGEBNISSE.map(e => `<CHOICE>${e}</CHOICE>`).join('') + '</CHOICES></Field>'
    ]);
    if (neuAntworten) {
      // Leserechte nur auf eigene Einträge, Schreibrechte nur auf eigene Einträge.
      try {
        await sende(this._client, this._antworten, { ReadSecurity: 2, WriteSecurity: 2 }, 'MERGE');
        const gesetzt: { ReadSecurity?: number } = await holeJson(this._client, `${this._antworten}?$select=ReadSecurity`);
        if (gesetzt.ReadSecurity !== 2) {
          throw new Error('Leserechte nicht übernommen');
        }
      } catch {
        hinweise.push(
          `Bitte in den Einstellungen der Liste "${antwortName}" unter "Erweiterte Einstellungen" einstellen: ` +
          'Lesezugriff "Elemente, die vom Benutzer erstellt wurden" und Bearbeitungszugriff ebenso.'
        );
      }
    }

    const loesungName: string = AntwortenListe.loesungsListe(this._inhaltsListe);
    const neuLoesungen: boolean = await listeSicherstellen(
      this._client, this._webUrl, loesungName, 'Lösungen für die Rätsel im Adventskalender. Nur für Organisatoren sichtbar.'
    );
    await spaltenSicherstellen(this._client, this._loesungen, [
      '<Field Type="Number" DisplayName="Tag" Name="Tag" Required="TRUE" Min="1" Max="24" Decimals="0" />',
      '<Field Type="Number" DisplayName="Jahr" Name="Jahr" Required="TRUE" Decimals="0" />',
      '<Field Type="Note" DisplayName="Lösung" Name="Loesung" NumLines="3" RichText="FALSE" />'
    ]);
    if (neuLoesungen) {
      try {
        await this._nurFuerBesitzer(this._loesungen);
      } catch {
        hinweise.push(
          `Die Rechte der Liste "${loesungName}" konnten nicht eingeschränkt werden. ` +
          'Bitte dort die Berechtigungen so einstellen, dass nur Organisatoren sie lesen können.'
        );
      }
    }
    // Beispiellösungen nur für Tage mit Beispielinhalt und ohne Lösung; vorhandene bleiben unverändert.
    const vorhanden: number[] = (await this.loesungen()).map(l => l.tag);
    for (let tag: number = 1; tag <= BEISPIELE.length; tag++) {
      const loesung: string | undefined = BEISPIELE[tag - 1].loesung;
      if (loesung && beispielTage.indexOf(tag) !== -1 && vorhanden.indexOf(tag) === -1) {
        await sende(this._client, `${this._loesungen}/items`, { Title: `Türchen ${tag}`, Tag: tag, Jahr: this._jahr, Loesung: loesung });
      }
    }
    return hinweise;
  }

  /** Eigene Berechtigungen für die Liste: nur Besitzergruppe und die anlegende Person behalten Zugriff. */
  private async _nurFuerBesitzer(pfad: string): Promise<void> {
    const web: string = `${this._webUrl}/_api/web`;
    await sende(this._client, `${pfad}/breakroleinheritance(copyRoleAssignments=true,clearSubscopes=true)`);
    const vollzugriff: { Id: number } = await holeJson(this._client, `${web}/roledefinitions/getbytype(5)?$select=Id`);
    await sende(this._client, `${pfad}/roleassignments/addroleassignment(principalid=${this._ich.id},roledefid=${vollzugriff.Id})`);
    let besitzer: number | undefined;
    try {
      besitzer = (await holeJson<{ Id: number }>(this._client, `${web}/associatedownergroup?$select=Id`)).Id;
    } catch {
      besitzer = undefined;
    }
    const zuweisungen: { value: { PrincipalId: number }[] } = await holeJson(
      this._client, `${pfad}/roleassignments?$select=PrincipalId`
    );
    for (const { PrincipalId } of zuweisungen.value) {
      if (PrincipalId !== this._ich.id && PrincipalId !== besitzer) {
        await sende(this._client, `${pfad}/roleassignments/getbyprincipalid(${PrincipalId})`, undefined, 'DELETE');
      }
    }
  }
}

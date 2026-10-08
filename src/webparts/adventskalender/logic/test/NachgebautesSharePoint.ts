// Ein kleines nachgebautes SharePoint für Tests: Listen, Spalten, Einträge, Leserechte und eigene Berechtigungen.
// Es versteht genau die REST-Aufrufe, die das Webpart benutzt, und verhält sich bei Rechten wie SharePoint.

/* eslint-disable @typescript-eslint/no-explicit-any */

interface IEintrag {
  Id: number;
  AuthorId: number;
  Modified: string;
  [feld: string]: any;
}

interface IListe {
  titel: string;
  felder: Set<string>;
  eintraege: IEintrag[];
  readSecurity: number;
  writeSecurity: number;
  /** undefined = erbt die Rechte der Website (alle dürfen lesen). */
  zugriff?: Set<number>;
}

export interface IAntwortAttrappe {
  ok: boolean;
  status: number;
  json(): Promise<any>;
}

const STANDARD_FELDER: string[] = ['Id', 'Title', 'Modified', 'AuthorId', 'Created'];
export const BESITZERGRUPPE: number = 100;
const MITGLIEDERGRUPPE: number = 200;

function antwort(status: number, daten?: any): IAntwortAttrappe {
  return { ok: status >= 200 && status < 300, status, json: async () => daten ?? {} };
}

export class NachgebautesSharePoint {
  public readonly listen: Map<string, IListe> = new Map();
  /** Uhrzeit des Servers, setzt "Modified". */
  public jetzt: Date = new Date();
  private _naechsteId: number = 1;

  constructor(private readonly _besitzer: number[]) {}

  public listeAnlegen(titel: string, felder: string[] = []): IListe {
    const liste: IListe = { titel, felder: new Set([...STANDARD_FELDER, ...felder]), eintraege: [], readSecurity: 1, writeSecurity: 1 };
    this.listen.set(titel, liste);
    return liste;
  }

  public eintragAnlegen(liste: IListe, werte: object, autor: number): IEintrag {
    const eintrag: IEintrag = { ...werte, Id: this._naechsteId++, AuthorId: autor, Modified: this.jetzt.toISOString() };
    liste.eintraege.push(eintrag);
    return eintrag;
  }

  /** SPHttpClient-Ersatz für eine angemeldete Person. */
  public client(benutzer: number): any {
    return {
      get: async (url: string) => this._anfrage(benutzer, 'GET', url),
      post: async (url: string, _konfig: unknown, optionen: { headers?: Record<string, string>; body?: string }) =>
        this._anfrage(benutzer, optionen.headers?.['X-HTTP-Method'] || 'POST', url, optionen.body ? JSON.parse(optionen.body) : undefined)
    };
  }

  private _istBesitzer(benutzer: number): boolean {
    return this._besitzer.indexOf(benutzer) !== -1;
  }

  private _darfLesen(liste: IListe, benutzer: number): boolean {
    return !liste.zugriff || liste.zugriff.has(benutzer) || (liste.zugriff.has(BESITZERGRUPPE) && this._istBesitzer(benutzer));
  }

  private _anfrage(benutzer: number, methode: string, rohUrl: string, inhalt?: any): IAntwortAttrappe {
    const url: string = decodeURIComponent(rohUrl);
    const [pfad, abfrage = ''] = url.split('?');
    const parameter: Map<string, string> = new Map(
      abfrage.split('&').filter(Boolean).map(teil => [teil.slice(0, teil.indexOf('=')), teil.slice(teil.indexOf('=') + 1)])
    );

    if (/\/_api\/web\/lists$/.test(pfad) && methode === 'POST') {
      this.listeAnlegen(inhalt.Title);
      return antwort(201, {});
    }
    if (/\/_api\/web\/roledefinitions\/getbytype\(5\)$/.test(pfad)) {
      return antwort(200, { Id: 1073741829 });
    }
    if (/\/_api\/web\/associatedownergroup$/.test(pfad)) {
      return antwort(200, { Id: BESITZERGRUPPE });
    }

    const treffer: RegExpExecArray | null = /\/_api\/web\/lists\/getbytitle\('(.+?)'\)(.*)$/.exec(pfad);
    if (!treffer) {
      return antwort(400, { error: { message: `Unbekannter Aufruf ${pfad}` } });
    }
    const liste: IListe | undefined = this.listen.get(treffer[1].replace(/''/g, "'"));
    const rest: string = treffer[2];
    // Ohne Leserecht verhält sich SharePoint so, als gäbe es die Liste nicht.
    if (!liste || !this._darfLesen(liste, benutzer)) {
      return antwort(404, { error: { message: 'List does not exist.' } });
    }

    if (rest === '') {
      if (methode === 'MERGE') {
        if (!this._istBesitzer(benutzer)) {
          return antwort(403, { error: { message: 'Access denied.' } });
        }
        liste.readSecurity = inhalt.ReadSecurity ?? liste.readSecurity;
        liste.writeSecurity = inhalt.WriteSecurity ?? liste.writeSecurity;
        return antwort(204);
      }
      return antwort(200, { Id: liste.titel, ReadSecurity: liste.readSecurity });
    }

    const feld: RegExpExecArray | null = /^\/fields\/getbyinternalnameortitle\('(.+)'\)$/.exec(rest);
    if (feld) {
      return liste.felder.has(feld[1]) ? antwort(200, { Id: feld[1] }) : antwort(404);
    }
    if (rest === '/fields/createfieldasxml') {
      liste.felder.add((/ Name="([^"]+)"/.exec(inhalt.parameters.SchemaXml) || [])[1]);
      return antwort(201, {});
    }

    if (rest.indexOf('/breakroleinheritance') === 0) {
      liste.zugriff = new Set([BESITZERGRUPPE, MITGLIEDERGRUPPE]);
      return antwort(200, {});
    }
    const neueRolle: RegExpExecArray | null = /^\/roleassignments\/addroleassignment\(principalid=(\d+)/.exec(rest);
    if (neueRolle) {
      liste.zugriff?.add(Number(neueRolle[1]));
      return antwort(200, {});
    }
    if (rest === '/roleassignments') {
      return antwort(200, { value: Array.from(liste.zugriff || []).map(id => ({ PrincipalId: id })) });
    }
    const entfernen: RegExpExecArray | null = /^\/roleassignments\/getbyprincipalid\((\d+)\)$/.exec(rest);
    if (entfernen && methode === 'DELETE') {
      liste.zugriff?.delete(Number(entfernen[1]));
      return antwort(200, {});
    }

    if (rest === '/items' && methode === 'POST') {
      return antwort(201, this.eintragAnlegen(liste, inhalt, benutzer));
    }
    const einzeln: RegExpExecArray | null = /^\/items\((\d+)\)$/.exec(rest);
    if (einzeln && methode === 'MERGE') {
      const eintrag: IEintrag | undefined = liste.eintraege.filter(e => e.Id === Number(einzeln[1]))[0];
      if (!eintrag) {
        return antwort(404);
      }
      const eigenerNurErlaubt: boolean = liste.writeSecurity === 2 && !this._istBesitzer(benutzer);
      if (eigenerNurErlaubt && eintrag.AuthorId !== benutzer) {
        return antwort(403, { error: { message: 'Access denied.' } });
      }
      Object.assign(eintrag, inhalt, { Modified: this.jetzt.toISOString() });
      return antwort(204);
    }
    if (rest === '/items' && methode === 'GET') {
      const spalten: string[] = (parameter.get('$select') || '').split(',').filter(Boolean);
      const unbekannt: string | undefined = spalten.filter(s => !liste.felder.has(s))[0];
      if (unbekannt) {
        return antwort(400, { error: { message: `Column '${unbekannt}' does not exist.` } });
      }
      let eintraege: IEintrag[] = liste.eintraege;
      if (liste.readSecurity === 2 && !this._istBesitzer(benutzer)) {
        eintraege = eintraege.filter(e => e.AuthorId === benutzer);
      }
      const bedingungen: RegExpExecArray[] = [];
      const muster: RegExp = /(\w+) (eq|le) (\d+)/g;
      for (let t: RegExpExecArray | null = muster.exec(parameter.get('$filter') || ''); t; t = muster.exec(parameter.get('$filter') || '')) {
        bedingungen.push(t);
      }
      eintraege = eintraege.filter(e => bedingungen.every(([, name, op, wert]) =>
        op === 'eq' ? Number(e[name]) === Number(wert) : Number(e[name]) <= Number(wert)));
      return antwort(200, { value: eintraege.map(e => ({ ...e })) });
    }
    return antwort(400, { error: { message: `Unbekannter Aufruf ${methode} ${rest}` } });
  }
}

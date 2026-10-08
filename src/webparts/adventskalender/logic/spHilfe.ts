import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

// Kleine Helfer für die SharePoint-REST-Schnittstelle, gemeinsam genutzt von Inhalts- und Antwortlisten.

export function listenPfad(webUrl: string, listenName: string): string {
  return `${webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(listenName.replace(/'/g, "''"))}')`;
}

export async function fehlermeldung(antwort: SPHttpClientResponse): Promise<string> {
  try {
    const fehler: { error?: { message?: string } } = await antwort.json();
    return fehler.error?.message || String(antwort.status);
  } catch {
    return String(antwort.status);
  }
}

export async function holeJson<T>(client: SPHttpClient, url: string): Promise<T> {
  const antwort: SPHttpClientResponse = await client.get(url, SPHttpClient.configurations.v1);
  if (!antwort.ok) {
    throw new Error(`SharePoint hat die Abfrage abgelehnt: ${await fehlermeldung(antwort)}`);
  }
  return antwort.json();
}

/** POST; mit methode "MERGE" oder "DELETE" als Änderung bzw. Löschung eines vorhandenen Eintrags. */
export async function sende(
  client: SPHttpClient,
  url: string,
  inhalt?: object,
  methode?: 'MERGE' | 'DELETE'
): Promise<SPHttpClientResponse> {
  const headers: Record<string, string> = methode ? { 'X-HTTP-Method': methode, 'IF-MATCH': '*' } : {};
  const antwort: SPHttpClientResponse = await client.post(url, SPHttpClient.configurations.v1, {
    headers,
    body: inhalt ? JSON.stringify(inhalt) : undefined
  });
  if (!antwort.ok) {
    throw new Error(`SharePoint hat die Änderung abgelehnt: ${await fehlermeldung(antwort)}`);
  }
  return antwort;
}

/** Legt die Liste an, falls sie fehlt. Liefert true, wenn sie neu ist. */
export async function listeSicherstellen(
  client: SPHttpClient,
  webUrl: string,
  listenName: string,
  beschreibung: string
): Promise<boolean> {
  const vorhanden: SPHttpClientResponse = await client.get(
    `${listenPfad(webUrl, listenName)}?$select=Id`,
    SPHttpClient.configurations.v1
  );
  if (vorhanden.ok) {
    return false;
  }
  if (vorhanden.status !== 404) {
    throw new Error(`Die Liste "${listenName}" konnte nicht geprüft werden (${vorhanden.status}).`);
  }
  await sende(client, `${webUrl}/_api/web/lists`, { Title: listenName, Description: beschreibung, BaseTemplate: 100 });
  return true;
}

/** Legt fehlende Spalten an (Schema als Feld-XML, interner Name aus Name="..."). Liefert die neu angelegten Namen. */
export async function spaltenSicherstellen(client: SPHttpClient, pfad: string, schemata: string[]): Promise<string[]> {
  const neu: string[] = [];
  for (const schema of schemata) {
    const name: string = (/ Name="([^"]+)"/.exec(schema) || [])[1];
    const vorhanden: SPHttpClientResponse = await client.get(
      `${pfad}/fields/getbyinternalnameortitle('${name}')?$select=Id`,
      SPHttpClient.configurations.v1
    );
    if (vorhanden.ok) {
      continue;
    }
    // 25 = zum Standard-Inhaltstyp und zur Standardansicht hinzufügen, interner Name wie angegeben.
    await sende(client, `${pfad}/fields/createfieldasxml`, { parameters: { SchemaXml: schema, Options: 25 } });
    neu.push(name);
  }
  return neu;
}

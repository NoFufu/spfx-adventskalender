// Umwandlung einer Zeile der Liste "Adventskalender" in einen Türchen-Inhalt (ohne SharePoint-Abhängigkeit, damit testbar).
import { ITuerchenInhalt } from './ITuerchenInhalt';
import { ANZAHL_TUERCHEN } from './freischaltung';

interface IUrlFeld {
  Url?: string;
}

export interface IListenZeile {
  Title?: string;
  Tag?: number;
  Text?: string;
  // SharePoint liefert leere Link-Spalten als null.
  // eslint-disable-next-line @rushstack/no-new-null
  Bild?: IUrlFeld | null;
  // eslint-disable-next-line @rushstack/no-new-null
  Link?: IUrlFeld | null;
  Frage?: boolean;
}

/** Nur http(s)-Adressen übernehmen, damit kein "javascript:"-Link in den Kalender gelangt. */
export function sichereUrl(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }
  return /^https?:\/\//i.test(url.trim()) ? url.trim() : undefined;
}

export function zeileZuInhalt(zeile: IListenZeile): ITuerchenInhalt | undefined {
  const tag: number = Number(zeile.Tag);
  if (!(tag >= 1 && tag <= ANZAHL_TUERCHEN)) {
    return undefined;
  }
  return {
    tag,
    titel: zeile.Title || '',
    text: zeile.Text || '',
    bildUrl: sichereUrl(zeile.Bild?.Url),
    linkUrl: sichereUrl(zeile.Link?.Url),
    frage: !!zeile.Frage
  };
}

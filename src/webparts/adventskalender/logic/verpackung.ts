// Jedes Türchen bekommt eine eigene Verpackung: Bandlage, Schleifenform, Drehung, Bandfarbe und Papiermuster.
// Alles hängt nur von Tag und Jahr ab, damit ein Türchen bei jedem Seitenaufruf gleich aussieht.

/** kreuz = Band in beide Richtungen, senkrecht/waagerecht = nur ein Band, anhaenger = Kreuz mit Namensschild für die Zahl. */
export type Verpackungsart = 'kreuz' | 'senkrecht' | 'waagerecht' | 'anhaenger';

/** klassisch = Schleife mit zwei Schlaufen, rosette = runde Rosettenschleife. */
export type Schleifenform = 'klassisch' | 'rosette';

export interface IVerpackung {
  art: Verpackungsart;
  schleife: Schleifenform;
  /** Lage der Bandkreuzung (und damit der Schleife) in Prozent von links und oben. */
  bandX: number;
  bandY: number;
  /** Mitte der Zahl in Prozent, auf der freien Seite gegenüber der Schleife. */
  zahlX: number;
  zahlY: number;
  /** Drehung der Schleife in Grad. */
  dreh: number;
  /** Bandfarbe 0 bis 2 (die Farben legt das Design fest). */
  bandFarbe: number;
  /** Papiermuster 0 bis 4. */
  muster: number;
}

export const ANZAHL_BANDFARBEN: number = 3;
export const ANZAHL_MUSTER: number = 5;

const ARTEN: Verpackungsart[] = ['kreuz', 'senkrecht', 'waagerecht', 'anhaenger'];

// Kleiner Zufallsgenerator (mulberry32) mit festem Startwert.
function zufallsfolge(startwert: number): () => number {
  let zustand: number = startwert >>> 0;
  return () => {
    zustand = (zustand + 0x6d2b79f5) >>> 0;
    let t: number = zustand;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function zwischen(zufall: () => number, von: number, bis: number): number {
  return Math.round(von + zufall() * (bis - von));
}

/** Lage auf einer Seite: entweder 18-35 % oder 65-82 %. */
function seitenlage(zufall: () => number): number {
  const lage: number = zwischen(zufall, 18, 35);
  return zufall() < 0.5 ? lage : 100 - lage;
}

/** Mitte des freien Bereichs gegenüber dem Band. */
function gegenueber(band: number): number {
  return band < 50 ? Math.round((band + 100) / 2) : Math.round(band / 2);
}

/**
 * Verpackung für ein Türchen. Große Türchen (Start und Finale) bekommen immer ein Kreuzband,
 * weil sie als Hauptgeschenke wirken sollen.
 */
export function verpackung(tag: number, jahr: number, gross: boolean): IVerpackung {
  const zufall: () => number = zufallsfolge(jahr * 1000 + tag * 7919);
  const art: Verpackungsart = gross ? 'kreuz' : ARTEN[Math.floor(zufall() * ARTEN.length)];
  const bandX: number = seitenlage(zufall);
  const bandY: number = seitenlage(zufall);
  return {
    art,
    schleife: zufall() < 0.6 ? 'klassisch' : 'rosette',
    bandX,
    bandY,
    zahlX: art === 'waagerecht' ? 50 : gegenueber(bandX),
    zahlY: art === 'senkrecht' ? 50 : gegenueber(bandY),
    dreh: zwischen(zufall, -20, 20),
    bandFarbe: Math.floor(zufall() * ANZAHL_BANDFARBEN),
    muster: Math.floor(zufall() * ANZAHL_MUSTER)
  };
}

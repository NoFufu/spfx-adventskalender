// Verfügbare Designs. Die Farben der Türchen stehen im Stylesheet, hier nur die Farben des Dialogs,
// weil Fluent UI den Dialog außerhalb des Webparts anzeigt.

export type Design = 'winternacht' | 'ihk' | 'klassisch';

export const DESIGNS: { key: Design; text: string }[] = [
  { key: 'winternacht', text: 'Winternacht (dunkel, Gold)' },
  { key: 'ihk', text: 'IHK (Blau, Gold, warm)' },
  { key: 'klassisch', text: 'Klassisch (Rot, Grün, Gold)' }
];

/** Kurzname und Farbtupfer für den Umschalter im Webpart. */
export const DESIGN_KNOEPFE: { key: Design; name: string; farbe: string }[] = [
  { key: 'winternacht', name: 'Winternacht', farbe: 'linear-gradient(135deg, #1d1527 50%, #e9b866 50%)' },
  { key: 'ihk', name: 'IHK', farbe: 'linear-gradient(135deg, #0a6bb8 50%, #f2b552 50%)' },
  { key: 'klassisch', name: 'Klassisch', farbe: 'linear-gradient(135deg, #b3202e 50%, #2e6b3f 50%)' }
];

export interface IDialogFarben {
  hintergrund: string;
  text: string;
  titel: string;
  rand: string;
}

export const DIALOG_FARBEN: { [design in Design]: IDialogFarben } = {
  winternacht: { hintergrund: 'linear-gradient(180deg, #241a30, #150f1a)', text: '#f7efe7', titel: '#f3b66a', rand: 'rgba(243, 182, 106, 0.45)' },
  ihk: { hintergrund: 'linear-gradient(180deg, #123561, #0a1f3d)', text: '#fbf1df', titel: '#f2b552', rand: 'rgba(242, 181, 82, 0.45)' },
  klassisch: { hintergrund: '#fffaf0', text: '#3a2a1c', titel: '#9b2230', rand: '#c9a75a' }
};

export function gueltigesDesign(wert: string | undefined): Design {
  return DESIGNS.some(d => d.key === wert) ? (wert as Design) : 'winternacht';
}

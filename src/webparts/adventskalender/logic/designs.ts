// Verfügbare Designs. Die Farben der Türchen stehen im Stylesheet, hier nur die Farben des Dialogs,
// weil Fluent UI den Dialog außerhalb des Webparts anzeigt.

export type Design = 'winternacht' | 'ihk' | 'klassisch';

export const DESIGNS: { key: Design; text: string }[] = [
  { key: 'winternacht', text: 'Winternacht (dunkel, Gold)' },
  { key: 'ihk', text: 'IHK (Blau und Weiß)' },
  { key: 'klassisch', text: 'Klassisch (Rot, Grün, Gold)' }
];

export interface IDialogFarben {
  hintergrund: string;
  text: string;
  titel: string;
  rand: string;
}

export const DIALOG_FARBEN: { [design in Design]: IDialogFarben } = {
  winternacht: { hintergrund: 'linear-gradient(180deg, #241a30, #150f1a)', text: '#f7efe7', titel: '#f3b66a', rand: 'rgba(243, 182, 106, 0.45)' },
  ihk: { hintergrund: '#ffffff', text: '#1d2b3a', titel: '#003c71', rand: '#0069b4' },
  klassisch: { hintergrund: '#fffaf0', text: '#3a2a1c', titel: '#9b2230', rand: '#c9a75a' }
};

export function gueltigesDesign(wert: string | undefined): Design {
  return DESIGNS.some(d => d.key === wert) ? (wert as Design) : 'winternacht';
}

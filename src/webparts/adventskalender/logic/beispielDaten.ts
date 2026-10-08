import { ITuerchenInhalt } from './ITuerchenInhalt';
import { ANZAHL_TUERCHEN } from './freischaltung';

// Platzhalter-Inhalte, bis die SharePoint-Liste angebunden ist (Schritt 2 im Plan).
const TEXTE: string[] = [
  'Der Kalender ist eröffnet. Schön, dass du da bist!',
  'Heute schon gelacht? Ein kleiner Witz wartet hier bald.',
  'Zeit für einen Tee: Die Rezeptidee folgt.',
  'Heute ist Barbaratag: Zweige ins Wasser, dann blühen sie zu Weihnachten.',
  'Kleiner Tipp für den Feierabend.',
  'Nikolaustag! Stiefel geputzt?',
  'Ein Rätsel für die Kaffeepause.',
  'Ein Bastel-Tipp für den Schreibtisch.',
  'Ein Fundstück aus dem Team.',
  'Plätzchen-Rezept des Tages.',
  'Heute: ein Lieblingslied für die Playlist.',
  'Bergfest im Advent ist nah.',
  'Luciatag: Lichter gegen die dunkle Zeit.',
  'Wusstest du schon? Eine kleine Weihnachtsgeschichte.',
  'Zeit für eine kleine Pause.',
  'Rückblick: Was war schön in diesem Jahr?',
  'Tipp für das Last-Minute-Geschenk.',
  'Ein Gruß aus einem anderen Standort.',
  'Wintertipp: Raus an die frische Luft.',
  'Nur noch vier Tage bis Heiligabend.',
  'Wintersonnenwende: ab morgen werden die Tage länger.',
  'Danke für dieses Jahr!',
  'Letzter Arbeitstag vor den Feiertagen?',
  'Frohe Weihnachten!'
];

export function beispielInhalte(): ITuerchenInhalt[] {
  const inhalte: ITuerchenInhalt[] = [];
  for (let tag: number = 1; tag <= ANZAHL_TUERCHEN; tag++) {
    inhalte.push({
      tag,
      titel: `${tag}. Dezember`,
      text: TEXTE[tag - 1]
    });
  }
  return inhalte;
}

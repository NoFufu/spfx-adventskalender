// Beispielinhalte, mit denen "Liste anlegen" die 24 Zeilen füllt.
// Sie zeigen, wie ein Türchen aussehen kann, und lassen sich in der Liste einfach überschreiben.

export interface IBeispielInhalt {
  titel: string;
  text: string;
}

export const BEISPIELE: IBeispielInhalt[] = [
  { titel: 'Willkommen im Advent', text: 'Das erste Türchen ist offen! Ab heute wartet jeden Morgen eine kleine Überraschung auf dich. Schön, dass du dabei bist.' },
  { titel: 'Witz des Tages', text: 'Warum sind Schneemänner so gut im Team? Weil sie immer cool bleiben, auch wenn es heiß hergeht.' },
  { titel: 'Teezeit', text: 'Gewürztee für die Kaffeepause: Zimtstange, zwei Nelken und eine Scheibe Orange mit heißem Wasser aufgießen, fünf Minuten ziehen lassen.' },
  { titel: 'Barbaratag', text: 'Heute Kirschzweige schneiden und in eine Vase stellen. Mit etwas Glück blühen sie an Heiligabend.' },
  { titel: 'Feierabend-Tipp', text: 'Heute einmal ohne Bildschirm in den Abend: Kerze an, Lieblingsmusik, und das Handy bleibt im Flur.' },
  { titel: 'Nikolaus', text: 'Stiefel geputzt? Heute ist Nikolaustag. Eine kleine Aufmerksamkeit für die Kollegin oder den Kollegen nebenan freut garantiert.' },
  { titel: 'Rätsel', text: 'Was wird nasser, je mehr es trocknet? Die Auflösung gibt es morgen hinter Türchen 8.' },
  { titel: 'Auflösung und Bastel-Tipp', text: 'Ein Handtuch! Und zum Basteln: Aus einem Blatt Papier, sechsmal gefaltet und eingeschnitten, wird eine Schneeflocke fürs Bürofenster.' },
  { titel: 'Fundstück', text: 'Platz für ein Foto oder eine Geschichte aus dem Team. Einfach in der Liste ein Bild und einen Text eintragen.' },
  { titel: 'Plätzchen-Rezept', text: 'Vanillekipferl: 250 g Mehl, 200 g Butter, 100 g gemahlene Mandeln, 80 g Zucker verkneten, Hörnchen formen, bei 175 °C etwa 12 Minuten backen und in Vanillezucker wälzen.' },
  { titel: 'Musik', text: 'Welches Weihnachtslied läuft bei dir in Dauerschleife? Teile es mit dem Team und baut zusammen eine Playlist.' },
  { titel: 'Halbzeit', text: 'Die Hälfte ist fast geschafft! Zeit für einen kurzen Spaziergang an der frischen Luft.' },
  { titel: 'Luciatag', text: 'In Schweden ist heute Luciatag: Lichter gegen die dunkelste Zeit des Jahres.' },
  { titel: 'Wusstest du schon?', text: 'Der erste Adventskalender wurde 1903 in München gedruckt. Damals noch mit Bildern zum Aufkleben statt mit Türchen.' },
  { titel: 'Kleine Pause', text: 'Drei tiefe Atemzüge, Schultern locker, ein Glas Wasser. Mehr braucht es manchmal nicht.' },
  { titel: 'Rückblick', text: 'Was war dein schönster Moment in diesem Jahr? Schreib ihn auf, bevor er im Trubel untergeht.' },
  { titel: 'Last-Minute-Geschenk', text: 'Ein selbst geschriebener Gutschein für gemeinsame Zeit ist schnell gemacht und kommt fast immer gut an.' },
  { titel: 'Gruß aus dem Team', text: 'Hier ist Platz für einen Gruß von einem anderen Standort oder einer anderen Abteilung.' },
  { titel: 'Wintertipp', text: 'Kalte Hände? Ein warmer Becher in der Hand und fünf Minuten Bewegung bringen den Kreislauf in Schwung.' },
  { titel: 'Nur noch vier Tage', text: 'Die Vorfreude steigt. Hast du schon alles für die Feiertage beisammen?' },
  { titel: 'Wintersonnenwende', text: 'Heute ist der kürzeste Tag des Jahres. Ab morgen wird es wieder heller.' },
  { titel: 'Danke', text: 'Danke für die Zusammenarbeit in diesem Jahr. Ohne euch wäre es nur halb so schön gewesen.' },
  { titel: 'Fast geschafft', text: 'Morgen ist Heiligabend. Zeit, das Postfach zu leeren und die Abwesenheitsnotiz einzuschalten.' },
  { titel: 'Frohe Weihnachten!', text: 'Das letzte Türchen ist offen. Wir wünschen dir und deinen Liebsten frohe Weihnachten und erholsame Feiertage!' }
];

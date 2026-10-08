// Beispielinhalte, mit denen "Liste anlegen" die 24 Zeilen füllt.
// Sie zeigen, wie ein Türchen aussehen kann, und lassen sich in der Liste einfach überschreiben.

export interface IBeispielInhalt {
  titel: string;
  text: string;
  /** Bei Rätseln: Lösung für die automatische Prüfung der Antworten. */
  loesung?: string;
}

export const BEISPIELE: IBeispielInhalt[] = [
  { titel: 'Willkommen im Advent', text: 'Das erste Türchen ist offen! Ab heute wartet jeden Morgen eine kleine Überraschung auf dich. Schön, dass du dabei bist.' },
  { titel: 'Quizfrage', text: 'Wie viele Rentiere ziehen den Schlitten des Weihnachtsmanns, Rudolph nicht mitgezählt? Schick deine Antwort unten ab.', loesung: '8; acht' },
  { titel: 'Teezeit', text: 'Gewürztee für die Kaffeepause: Zimtstange, zwei Nelken und eine Scheibe Orange mit heißem Wasser aufgießen, fünf Minuten ziehen lassen.' },
  { titel: 'Barbaratag', text: 'Heute Kirschzweige schneiden und in eine Vase stellen. Mit etwas Glück blühen sie an Heiligabend.' },
  { titel: 'Feierabend-Tipp', text: 'Heute einmal ohne Bildschirm in den Abend: Kerze an, Lieblingsmusik, und das Handy bleibt im Flur.' },
  { titel: 'Nikolaus', text: 'Stiefel geputzt? Heute ist Nikolaustag. Eine kleine Aufmerksamkeit für die Kollegin oder den Kollegen nebenan freut garantiert.' },
  { titel: 'Rätsel', text: 'Was wird nasser, je mehr es trocknet? Schick deine Antwort unten ab. Die Auflösung gibt es morgen hinter Türchen 8.', loesung: 'Handtuch; Handtücher; Geschirrtuch; Badetuch' },
  { titel: 'Auflösung und Bastel-Tipp', text: 'Ein Handtuch! Und zum Basteln: Aus einem Blatt Papier, sechsmal gefaltet und eingeschnitten, wird eine Schneeflocke fürs Bürofenster.' },
  { titel: 'Stille Nacht', text: 'Aus welchem Land stammt das Lied „Stille Nacht, heilige Nacht“? Schick deine Antwort unten ab.', loesung: 'Österreich; Oesterreich' },
  { titel: 'Plätzchen-Rezept', text: 'Vanillekipferl: 250 g Mehl, 200 g Butter, 100 g gemahlene Mandeln, 80 g Zucker verkneten, Hörnchen formen, bei 175 °C etwa 12 Minuten backen und in Vanillezucker wälzen.' },
  { titel: 'Rote Nase', text: 'Wie heißt das Rentier mit der leuchtend roten Nase? Schick deine Antwort unten ab.', loesung: 'Rudolph; Rudolf' },
  { titel: 'Halbzeit', text: 'Die Hälfte ist fast geschafft! Kopfrechnen zur Halbzeit: Wie viele Türchen sind nach dem heutigen noch geschlossen?', loesung: '12; zwölf' },
  { titel: 'Luciatag', text: 'In Schweden ist heute Luciatag: Lichter gegen die dunkelste Zeit des Jahres.' },
  { titel: 'Wusstest du schon?', text: 'Der erste gedruckte Adventskalender erschien 1903, damals noch mit Bildern zum Aufkleben. In welcher Stadt wurde er gedruckt?', loesung: 'München; Muenchen' },
  { titel: 'Kleine Pause', text: 'Drei tiefe Atemzüge, Schultern locker, ein Glas Wasser. Mehr braucht es manchmal nicht.' },
  { titel: 'Adventskranz', text: 'Wie viele Kerzen hat ein klassischer Adventskranz? Schick deine Antwort unten ab.', loesung: '4; vier' },
  { titel: 'Last-Minute-Geschenk', text: 'Ein selbst geschriebener Gutschein für gemeinsame Zeit ist schnell gemacht und kommt fast immer gut an.' },
  { titel: 'Andere Länder', text: 'Wie heißt der Nikolaus in den Niederlanden? Schick deine Antwort unten ab.', loesung: 'Sinterklaas; Sinter Klaas' },
  { titel: 'Wintertipp', text: 'Kalte Hände? Ein warmer Becher in der Hand und fünf Minuten Bewegung bringen den Kreislauf in Schwung.' },
  { titel: 'Gewürzfrage', text: 'Welches Gewürz aus der Rinde eines Baumes gehört in Lebkuchen und Glühwein? Schick deine Antwort unten ab.', loesung: 'Zimt' },
  { titel: 'Wintersonnenwende', text: 'Heute ist der kürzeste Tag des Jahres. Ab morgen wird es wieder heller.' },
  { titel: 'Danke', text: 'Danke für die Zusammenarbeit in diesem Jahr. Ohne euch wäre es nur halb so schön gewesen.' },
  { titel: 'Fast geschafft', text: 'Morgen ist Heiligabend. Zeit, das Postfach zu leeren und die Abwesenheitsnotiz einzuschalten.' },
  { titel: 'Frohe Weihnachten!', text: 'Das letzte Türchen ist offen. Wir wünschen dir und deinen Liebsten frohe Weihnachten und erholsame Feiertage!' }
];

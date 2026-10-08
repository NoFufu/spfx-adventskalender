# SPFx Adventskalender

SharePoint-Online-Webpart mit 24 Türchen. Jedes Türchen öffnet sich ab 00:00 Uhr (Ortszeit) an seinem Dezembertag und zeigt dann seinen Inhalt in einem Dialog.

SharePoint Framework 1.23.2, React 17, Fluent UI 8, Heft-Toolchain, Node 22.

```
npm install
npm run build   # Tests, Lint, Produktions-Bundle und sharepoint/solution/spfx-adventskalender.sppkg
npm run start   # lokale Entwicklung gegen die gehostete Workbench (config/serve.json: Tenant eintragen)
```

## Inhalte pflegen

Die Türchen lesen ihre Inhalte aus einer SharePoint-Liste auf derselben Website (Standardname "Adventskalender").

1. Seite bearbeiten, Webpart-Einstellungen öffnen, unter "Inhalte" auf **Liste anlegen** klicken.
   Das legt die Liste mit allen Spalten an und erzeugt 24 Zeilen mit Beispielinhalten für das eingestellte Jahr.
2. In der Liste pro Zeile ausfüllen: **Titel**, **Text**, optional **Bild** (Adresse eines Bildes, z. B. aus der Websiteobjekte-Bibliothek) und **Link**.
3. Speichern. Änderungen erscheinen beim nächsten Laden der Seite, ohne neues Paket.

| Spalte | Typ | Bedeutung |
| --- | --- | --- |
| Titel | Text | Überschrift im Türchen-Dialog |
| Tag | Zahl 1–24 | Welches Türchen |
| Jahr | Zahl | Für welches Jahr (so bleiben Vorjahre erhalten) |
| Text | Mehrzeiliger Text | Inhalt hinter dem Türchen |
| Bild | Link (Bild) | Optionales Bild oben im Dialog |
| Link | Link | Optionaler Link "Mehr dazu" |

Das Webpart fragt nur Zeilen ab, deren Tag schon offen ist. Wer die Liste direkt öffnet, sieht alle Zeilen; wer das verhindern will, muss die Berechtigungen der Liste einschränken.

Das Design (Winternacht, IHK, Klassisch) lässt sich direkt oben rechts im Webpart umschalten. Im Bearbeitungsmodus ändert das das Design der Seite, sonst gilt die Auswahl nur im eigenen Browser. Jedes Türchen hat eine eigene Verpackung (Bandlage, Schleife, Papier, manchmal ein Anhänger am Band), die pro Jahr gleich bleibt. Türchen 24 ist ein goldenes Hauptgeschenk. Wochenend-Türchen sind halb so groß: Samstag und Sonntag teilen sich ein Feld. Geöffnete Türchen zeigen den Titel ihres Inhalts.

Webpart-Einstellungen: Überschrift, Design, Jahr (leer = aktuelles Jahr), gemischte Anordnung, Vorschau (alle Türchen offen, nur zum Testen), Name der Liste.

## Auslieferung

Der CI-Workflow baut bei jedem Push die `.sppkg` und legt sie als Artefakt ab. Hochladen in den App-Katalog des Tenants, danach das Webpart "Adventskalender" auf einer Seite einfügen.

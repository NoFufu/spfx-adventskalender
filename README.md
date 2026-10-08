# SPFx Adventskalender

SharePoint-Online-Webpart mit 24 Türchen. Jedes Türchen öffnet sich ab 00:00 Uhr (Ortszeit) an seinem Dezembertag und zeigt dann seinen Inhalt in einem Dialog.

SharePoint Framework 1.23.2, React 17, Fluent UI 8, Heft-Toolchain, Node 22.

```
npm install
npm run build   # Tests, Lint, Produktions-Bundle und sharepoint/solution/spfx-adventskalender.sppkg
npm run start   # lokale Entwicklung gegen die gehostete Workbench (config/serve.json: Tenant eintragen)
```

## Stand

Schritt 1 aus dem Plan: Raster mit 24 Türchen, Freischaltlogik mit Tests (`src/webparts/adventskalender/logic/`), Beispielinhalte.
Die Anbindung an die SharePoint-Liste "Adventskalender" folgt in Schritt 2.

Webpart-Einstellungen: Überschrift, Jahr (leer = aktuelles Jahr), gemischte Anordnung, Vorschau (alle Türchen offen, nur zum Testen).

## Auslieferung

Der CI-Workflow baut bei jedem Push die `.sppkg` und legt sie als Artefakt ab. Hochladen in den App-Katalog des Tenants, danach das Webpart "Adventskalender" auf einer Seite einfügen.

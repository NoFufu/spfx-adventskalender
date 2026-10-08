// Ersetzt @microsoft/sp-http in Tests, damit die Listenklassen ohne SharePoint laufen.
// Muss vor allen anderen Importen geladen werden.
jest.mock('@microsoft/sp-http', () => ({ SPHttpClient: { configurations: { v1: {} } } }), { virtual: true });

export {};

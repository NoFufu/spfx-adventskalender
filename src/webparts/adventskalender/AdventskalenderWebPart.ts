import * as React from 'react';
import * as ReactDom from 'react-dom';
import { DisplayMode, Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneButton,
  PropertyPaneButtonType,
  PropertyPaneDropdown,
  PropertyPaneLabel,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'AdventskalenderWebPartStrings';
import Adventskalender from './components/Adventskalender';
import { IAdventskalenderProps } from './components/IAdventskalenderProps';
import { AdventskalenderListe } from './logic/AdventskalenderListe';
import { hoechsterOffenerTag } from './logic/freischaltung';
import { Design, DESIGNS, gueltigesDesign } from './logic/designs';

export interface IAdventskalenderWebPartProps {
  titel: string;
  /** Leer = aktuelles Jahr. Als Text gespeichert, weil das Eigenschaftsfeld ein Textfeld ist. */
  jahr: string;
  gemischt: boolean;
  vorschau: boolean;
  listenName: string;
  design: string;
}

const STANDARD_LISTE: string = 'Adventskalender';

export default class AdventskalenderWebPart extends BaseClientSideWebPart<IAdventskalenderWebPartProps> {

  private _anlegenStatus: string = '';
  private _legtAn: boolean = false;
  /** Wird erhöht, wenn die Liste angelegt wurde, damit der Kalender neu lädt. */
  private _ladeZaehler: number = 0;

  public render(): void {
    const jahr: number = this._jahr();
    const vorschau: boolean = !!this.properties.vorschau;
    // Ohne Vorschau werden nur Tage abgefragt, die schon offen sind.
    const bisTag: number = vorschau ? 24 : hoechsterOffenerTag(jahr, new Date());
    const liste: AdventskalenderListe = this._liste();

    const element: React.ReactElement<IAdventskalenderProps> = React.createElement(
      Adventskalender,
      {
        titel: this.properties.titel,
        jahr,
        gemischt: !!this.properties.gemischt,
        design: gueltigesDesign(this.properties.design),
        vorschau,
        ladeInhalte: () => liste.laden(jahr, bisTag),
        ladeSchluessel: `${this._listenName()}|${jahr}|${bisTag}|${this._ladeZaehler}`,
        bearbeitungsModus: this.displayMode === DisplayMode.Edit,
        onDesignAendern: (design: Design) => {
          // Wird wie eine Änderung in den Einstellungen mit der Seite gespeichert.
          this.properties.design = design;
          this.context.propertyPane.refresh();
          this.render();
        },
        speicherSchluessel: `adventskalender-${this.context.instanceId}-${jahr}`
      }
    );

    ReactDom.render(element, this.domElement);
  }

  private _jahr(): number {
    const jahr: number = parseInt(this.properties.jahr, 10);
    return isNaN(jahr) ? new Date().getFullYear() : jahr;
  }

  private _listenName(): string {
    return (this.properties.listenName || '').trim() || STANDARD_LISTE;
  }

  private _liste(): AdventskalenderListe {
    return new AdventskalenderListe(
      this.context.spHttpClient,
      this.context.pageContext.web.absoluteUrl,
      this._listenName()
    );
  }

  private async _listeAnlegen(): Promise<void> {
    if (this._legtAn) {
      return;
    }
    this._legtAn = true;
    this._anlegenStatus = strings.ListeWirdAngelegt;
    this.context.propertyPane.refresh();
    try {
      const neu: number = await this._liste().anlegen(this._jahr());
      this._anlegenStatus = neu > 0
        ? strings.ListeAngelegt.replace('{0}', String(neu))
        : strings.ListeVollstaendig;
    } catch (fehler) {
      this._anlegenStatus = (fehler as Error).message;
    }
    this._legtAn = false;
    this._ladeZaehler++;
    this.context.propertyPane.refresh();
    this.render();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('titel', {
                  label: strings.TitelFieldLabel
                }),
                PropertyPaneDropdown('design', {
                  label: strings.DesignFieldLabel,
                  options: DESIGNS,
                  selectedKey: gueltigesDesign(this.properties.design)
                }),
                PropertyPaneTextField('jahr', {
                  label: strings.JahrFieldLabel,
                  description: strings.JahrFieldDescription,
                  onGetErrorMessage: (wert: string) =>
                    wert === '' || /^\d{4}$/.test(wert) ? '' : strings.JahrFieldError
                }),
                PropertyPaneToggle('gemischt', {
                  label: strings.GemischtFieldLabel
                }),
                PropertyPaneToggle('vorschau', {
                  label: strings.VorschauFieldLabel
                })
              ]
            },
            {
              groupName: strings.InhalteGroupName,
              groupFields: [
                PropertyPaneTextField('listenName', {
                  label: strings.ListenNameFieldLabel,
                  description: strings.ListenNameFieldDescription,
                  placeholder: STANDARD_LISTE
                }),
                PropertyPaneButton('listeAnlegen', {
                  text: strings.ListeAnlegenButton,
                  buttonType: PropertyPaneButtonType.Primary,
                  disabled: this._legtAn,
                  onClick: () => {
                    this._listeAnlegen().catch(() => undefined);
                    return '';
                  }
                }),
                PropertyPaneLabel('anlegenStatus', {
                  text: this._anlegenStatus || strings.ListeAnlegenHinweis
                })
              ]
            }
          ]
        }
      ]
    };
  }
}

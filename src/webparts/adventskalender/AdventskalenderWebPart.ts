import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'AdventskalenderWebPartStrings';
import Adventskalender from './components/Adventskalender';
import { IAdventskalenderProps } from './components/IAdventskalenderProps';
import { beispielInhalte } from './logic/beispielDaten';

export interface IAdventskalenderWebPartProps {
  titel: string;
  /** Leer = aktuelles Jahr. Als Text gespeichert, weil das Eigenschaftsfeld ein Textfeld ist. */
  jahr: string;
  gemischt: boolean;
  vorschau: boolean;
}

export default class AdventskalenderWebPart extends BaseClientSideWebPart<IAdventskalenderWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IAdventskalenderProps> = React.createElement(
      Adventskalender,
      {
        titel: this.properties.titel,
        jahr: this._jahr(),
        gemischt: !!this.properties.gemischt,
        vorschau: !!this.properties.vorschau,
        inhalte: beispielInhalte()
      }
    );

    ReactDom.render(element, this.domElement);
  }

  private _jahr(): number {
    const jahr: number = parseInt(this.properties.jahr, 10);
    return isNaN(jahr) ? new Date().getFullYear() : jahr;
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
            }
          ]
        }
      ]
    };
  }
}

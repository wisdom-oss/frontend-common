import {Component, Input} from "@angular/core";

/**
 * This component is used to inject the icons from IonIcons.
 * IonIcons uses WebComponents to display the icons.
 * To allow to use them here, this component adds the icons via js.
 */
@Component({
  selector: "ion-icon",
  template: ""
})
export class IonIconComponent {

  @Input() name: string | undefined;

}

import {Component, ElementRef, Input} from "@angular/core";

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

  constructor(private elRef: ElementRef) {}

  /**
   * The name of the icon.
   * Is not used by angular but needed to render the correct icon and necessary
   * so that angular stops complaining.
   *
   * You can find the names at the official website
   * {@link https://ionic.io/ionicons}.
   */
  @Input() set name(name: string | undefined) {
    this.elRef.nativeElement?.setAttribute("name", name);
  };

}

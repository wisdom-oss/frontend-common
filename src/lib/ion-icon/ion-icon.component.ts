import {Component, Input, ElementRef} from "@angular/core";

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

  /**
   * Constructor.
   * @param elRef Element reference to itself
   */
  constructor(private elRef: ElementRef) {}

  /**
   * The name of the icon.
   * Is not used by angular but needed to render the correct icon and necessary
   * so that angular stops complaining.
   *
   * This setter also directly modifies the native element to have the "name"
   * directly as an attribute which is needed to make ion icons work.
   *
   * You can find the names at the official website
   * {@link https://ionic.io/ionicons}.
   */
  @Input() set name(name: string | undefined) {
    this.elRef.nativeElement?.setAttribute("name", name);
  };

}

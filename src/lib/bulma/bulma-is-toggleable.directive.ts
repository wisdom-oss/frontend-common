import {
  HostBinding,
  Directive,
  Input,
  HostListener,
  ElementRef
} from "@angular/core";

/**
 * Directive for making things toggleable with bulma.
 *
 * Clicking on the node that has this directive will toggle the "is-active"
 * class.
 */
@Directive({
  selector: ".is-toggleable"
})
export class BulmaIsToggleableDirective {

  /**
   * Constructor.
   * @param elementRef Reference to element this is applied to
   */
  constructor(private elementRef: ElementRef) {}

  /**
   * Toggles the visibility of a bulma element by toggling `is-active` css class.
   */
  @HostListener("click")
  toggle() {
    this.elementRef.nativeElement.classList.toggle("is-active");
  }

}

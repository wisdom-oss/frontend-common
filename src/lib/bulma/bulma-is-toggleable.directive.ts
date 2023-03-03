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

  constructor(private elementRef: ElementRef) {}

  @HostListener("click")
  toggle() {
    this.elementRef.nativeElement.classList.toggle("is-active");
  }

}

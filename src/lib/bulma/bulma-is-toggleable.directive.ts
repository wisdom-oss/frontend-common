import {HostBinding, Directive, Input, HostListener} from "@angular/core";

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

  /** Is the host currently active. */
  private isActive: boolean = false;
  /** The classes of the host node. */
  private classes: string[] = [];

  /** The classes of the host node. */
  @Input("class")
  @HostBinding("class")
  get elementClasses(): string {
    return this.classes.join(" ");
  }
  /** Set the classes of the host node. */
  set elementClasses(classes: string) {
    this.classes = classes.trim().split(/\s+/);
  }

  /**
   * Function to be executed when the host is clicked.
   *
   * Will toggle the "is-active" class on the host node.
   */
  @HostListener("click")
  toggle() {
    this.isActive = !this.isActive;
    if (this.isActive) this.classes.push("is-active")
    else {
      this.elementClasses = this.elementClasses
        .split("is-active")
        .join("");
    }
  }

}

import {
  HostBinding,
  Directive,
  Input,
  HostListener,
  ViewContainerRef
} from "@angular/core";

@Directive({
  selector: '.is-toggleable'
})
export class BulmaIsToggleableDirective {

  private isActive: boolean = false;
  private classes: string[] = [];

  constructor(private container: ViewContainerRef) {}

  @Input("class")
  @HostBinding("class")
  get elementClasses(): string {
    return this.classes.join(" ");
  }
  set elementClasses(classes: string) {
    this.classes = classes.trim().split(/\s+/);
  }

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

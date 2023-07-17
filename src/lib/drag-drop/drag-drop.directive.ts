import {
  Directive,
  EventEmitter,
  Output,
  HostListener,
  HostBinding,
} from "@angular/core";

@Directive({
  selector: "[dragDropDirective]",
})

//imports drag and drop functionality
export class DragDropDirective {
  /**
   * outputs a new event emitter
   */
  @Output() fileDropped = new EventEmitter<Object>();

  /**
   * sets the style of the background to white
   */
  @HostBinding("style.background-color") private background = "#ffffff";

  /**
   * overwrites the dragover event, coloring the box in light blue
   * @param event var to observe the dragover
   */
  @HostListener("dragover", ["$event"]) dragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.background = "#e2eefd";
  }

  /**
   * overwrites dragleave event, coloring box back in white
   * @param event to track the leave
   */
  @HostListener("dragleave", ["$event"]) dragLeave(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.background = "#ffffff";
  }

  /**
   * drop event, to register if any files got dropped into the container
   * @param event contains the files being dropped and gets send to component
   */
  @HostListener("drop", ["$event"]) drop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.background = "#ffffff";

    this.fileDropped.emit(event);
  }
}

import {
  Directive,
  EventEmitter,
  Output,
  HostListener,
  HostBinding,
} from '@angular/core';

@Directive({
  selector: '[dragDropDirective]',
})

//imports drag and drop functionality
export class DragDropDirective {
  // Outputs an EventEmitter to use
  @Output() fileDropped = new EventEmitter<Object>();

  @HostBinding('style.background-color') private background = '#ffffff';

  // Dragover Event
  @HostListener('dragover', ['$event']) dragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.background = '#e2eefd';
  }

  // Dragleave Event
  @HostListener('dragleave', ['$event']) dragLeave(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.background = '#ffffff';
  }

  // Drop Event
  @HostListener('drop', ['$event']) drop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.background = '#ffffff';

    this.fileDropped.emit(event);
  }
}

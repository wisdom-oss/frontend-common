import {Directive, ElementRef, OnInit} from '@angular/core';
import * as BulmaCalendar from "bulma-calendar";

@Directive({
  selector: '[type="date"]'
})
export class BulmaCalendarDirective implements OnInit {

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    let attached = BulmaCalendar.attach(this.elementRef.nativeElement);
  }

}

import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnInit, Output
} from '@angular/core';
import * as BulmaCalendar from "bulma-calendar";

/**
 * Directive to attach a Bulma calendar to date inputs.
 *
 * @see https://bulma-calendar.onrender.com
 */
@Directive({
  selector: '[type="date"]'
})
export class BulmaCalendarDirective implements OnInit {

  /** Bulma calendar instance. */
  private calendar!: BulmaCalendar;

  /**
   * Options to configure bulma calendar.
   *
   * @see https://bulma-calendar.onrender.com/#options
   */
  @Input()
  options?: BulmaCalendar.Options;


  /**
   * Triggered when calendar is initialized.
   * (DO NOT USE IT but pass callback into the onReady option)
   */
  @Output("ready")
  readyEvent: EventEmitter<BulmaCalendar.Event> = new EventEmitter();

  /**
   * Triggered when calendar is opened.
   */
  @Output("show")
  showEvent: EventEmitter<BulmaCalendar.Event> = new EventEmitter();

  /**
   * Triggered when calendar is closed.
   */
  @Output("hide")
  hideEvent: EventEmitter<BulmaCalendar.Event> = new EventEmitter();

  /**
   * Triggered when a date/time is selected
   * (for range = when both start and end dates/times have been selected)
   */
  @Output("select")
  selectEvent: EventEmitter<BulmaCalendar.Event> = new EventEmitter();

  /**
   * Triggered when the start date is selected.
   */
  @Output("select:start")
  selectStartEvent: EventEmitter<BulmaCalendar.Event> = new EventEmitter();


  /** Constructor. */
  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.calendar = BulmaCalendar.attach(
      this.elementRef.nativeElement,
      this.options
    )[0];

    this.calendar.on(
      <BulmaCalendar.EventType>"ready",
        instance => this.readyEvent.emit(instance)
    );

    this.calendar.on(
      "show",
        instance => this.showEvent.emit(instance)
    );

    this.calendar.on(
      "hide",
        instance => this.hideEvent.emit(instance)
    );

    this.calendar.on(
      "select",
        instance => this.selectEvent.emit(instance)
    );

    this.calendar.on(
      "select:start",
        instance => this.selectStartEvent.emit(instance)
    );
  }


  /**
   * Show the calendar date picker.
   * (not available with "inline" display style)
   */
  show = this.calendar.show;

  /**
   * Close the date picker.
   * (not available with "inline" display style)
   */
  hide = this.calendar.hide;

  /**
   * Check if the date picker is open or not.
   * @return {boolean} True if date picker is open, otherwise False.
   */
  isOpen = this.calendar.isOpen;

  /**
   * Check if the current instance is a range date picker.
   * @return {boolean} True if the instance is a range date picker.
   */
  isRange = this.calendar.isRange;

  /**
   * Get the date picker value as a formatted string if no parameter,
   * otherwise set the passed value.
   * @param {string|null} value Formatted date value or null.
   * @return {Object} Date picker selected date. If not a range calendar,
   *   endDate is undefined.
   */
  value = this.calendar.value;

  /** Force calendar refresh. */
  refresh = this.calendar.refresh;

  /** Force to set calendar data into UI inputs. */
  save = this.calendar.save;

  /**
   * Clear date selection.
   * Both startDate and endDate are set to undefined.
   */
  clear = this.calendar.clear;


  /** Get component instance ID. */
  get id() { return this.calendar.id; }

  /** Get active lang. */
  get lang() { return this.calendar.lang; }

  /** Get selected date. */
  get date() { return this.calendar.date; }

  /** Get selected start date. */
  get startDate() { return this.calendar.startDate; }

  /** Get selected end date. */
  get endDate() { return this.calendar.endDate; }

  /** Get min possible date. */
  get minDate() { return this.calendar.minDate; }

  /** Get max possible date. */
  get maxDate() { return this.calendar.maxDate; }

  /** Get date format pattern. */
  get dateFormat() { return this.calendar.dateFormat; }

  /** Get selected time. */
  get time() { return this.calendar.time; }

  /** Get selected start time. */
  get startTime() { return this.calendar.startTime; }

  /** Get selected end time. */
  get endTime() { return this.calendar.endTime; }

  /** Get time format pattern. */
  get timeFormat() { return this.calendar.timeFormat; }


  /** Set component lang. */
  set lang(lang) { this.calendar.lang = lang; }

  /** Set date. */
  set date(date) { this.calendar.date = date; }

  /** Set start date. */
  set startDate(startDate) { this.calendar.startDate = startDate; }

  /** Set end date. */
  set endDate(endDate) { this.calendar.endDate = endDate; }

  /** Set min possible date. */
  set minDate(minDate) { this.calendar.minDate = minDate; }

  /** Set max possible date. */
  set maxDate(maxDate) { this.calendar.maxDate = maxDate; }

  /** Set date format pattern. */
  set dateFormat(dateFormat) { this.calendar.dateFormat = dateFormat; }

  /** Set time. */
  set time(time) { this.calendar.time = time; }

  /** Set start time. */
  set startTime(startTime) { this.calendar.startTime = startTime; }

  /** Set end time. */
  set endTime(endTime) { this.calendar.endTime = endTime; }

  /** Set time format pattern. */
  set timeFormat(timeFormat) { this.calendar.timeFormat = timeFormat; }

}

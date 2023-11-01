import {
  Directive,
  ElementRef,
  EventEmitter, HostBinding,
  Input, OnDestroy,
  OnInit, Output
} from '@angular/core';
import * as BulmaCalendar from "bulma-calendar";

/** Enum to decide in which mode the Bulma Calendar should take values. */
export enum BulmaCalendarMode {
  DEFAULT = "default",
  MONTH = "month",
  YEAR = "year"
}

/**
 * Directive to attach a bulma calendar to date inputs.
 *
 * @see https://bulma-calendar.onrender.com
 */
@Directive({
  selector: '[type="date"]',
})
export class BulmaCalendarDirective implements OnInit, OnDestroy {

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
   * Mode of value input for the bulma calendar.
   *
   * Only works when {@link type} is set to `"date"`.
   *
   * This is specifically implemented for this directive and is not part of the
   * default bulma calendar.
   * It works by calling some internal hooks.
   *
   * Functions called inside can be found in the source code of the date
   * picker.
   * @see https://github.com/Wikiki/bulma-calendar/blob/master/src/js/datePicker/index.js
   */
  @Input()
  mode: BulmaCalendarMode = BulmaCalendarMode.DEFAULT;

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
    let options = this.options ?? {};

    // override some options that are necessary for the modes to work correctly
    if (this.mode !== BulmaCalendarMode.DEFAULT) {
      switch (this.mode) {
        case BulmaCalendarMode.YEAR:
          options.dateFormat = options?.dateFormat ?? "yyyy";
          break;
        case BulmaCalendarMode.MONTH:
          options.dateFormat = options?.dateFormat ?? "MM/yyyy";
          break;
      }

      options.showFooter = false;
      options.showHeader = false;
    }

    this.calendar = BulmaCalendar.attach(
      this.elementRef.nativeElement,
      options
    )[0];

    // @ts-ignore this is a private field
    let id = this.calendar._id;
    document.getElementById(id)!.dataset["mode"] = this.mode;

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

    if (
      options.type == undefined ||
      options.type == "date"
    ) {
      // make use of the mode here to override calendar behavior
      switch (this.mode) {
        case BulmaCalendarMode.YEAR:
          this.applyYearMode();
          break;

        case BulmaCalendarMode.MONTH:
          this.applyMonthMode();
          break;

        case BulmaCalendarMode.DEFAULT:
        default:
          break;
      }
    }
  }

  ngOnDestroy(): void {
    // remove event listeners, the typescript type doesn't reflect the null case
    this.calendar.removeListeners(null as any);
    this.calendar.removeMiddleware(null as any);
  }


  /**
   * Show the calendar date picker.
   * (not available with "inline" display style)
   */
  show = () => this.calendar.show();

  /**
   * Close the date picker.
   * (not available with "inline" display style)
   */
  hide = () => this.calendar.hide();

  /**
   * Check if the date picker is open or not.
   * @return {boolean} True if date picker is open, otherwise False.
   */
  isOpen = (): boolean => this.calendar.isOpen();

  /**
   * Check if the current instance is a range date picker.
   * @return {boolean} True if the instance is a range date picker.
   */
  isRange = (): boolean => this.calendar.isRange();

  /**
   * Get the date picker value as a formatted string if no parameter,
   * otherwise set the passed value.
   * @param {string|null} value Formatted date value or null.
   * @return {Object} Date picker selected date. If not a range calendar,
   *   endDate is undefined.
   */
  value = (value: string | null): Object => this.calendar.value();

  /** Force calendar refresh. */
  refresh = () => this.calendar.refresh();

  /** Force to set calendar data into UI inputs. */
  save = () => this.calendar.save();

  /**
   * Clear date selection.
   * Both startDate and endDate are set to undefined.
   */
  clear = () => this.calendar.clear();


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

  /** Apply the {@link BulmaCalendarMode.YEAR} mode. */
  private applyYearMode() {
    let calendar = this.calendar as typeof this.calendar & {
      // this datepicker refers to "private" functions of the internal date picker
      datePicker: {
        onSelectYearDatePicker: Function,
        onYearClickDatePicker: Function,
        onDateClickDatePicker: Function,
        onNextDatePicker: Function,
        _format: String,
      }
    };

    let dummyEvent = {
      preventDefault() {},
      stopPropagation() {}
    };

    // open the calendar always in the year view
    calendar.on("show", () => {
      calendar.datePicker.onSelectYearDatePicker(dummyEvent);
    });

    // when year is selected, abort further selection and set first day of year
    let ogOnYearClickDatePicker = calendar.datePicker.onYearClickDatePicker;
    calendar.datePicker.onYearClickDatePicker = (e: any) => {
      ogOnYearClickDatePicker(e);
      e.currentTarget.dataset.date = `1-1-${e.currentTarget.dataset.year}`
      calendar.datePicker.onDateClickDatePicker(e);
      if (this.options?.isRange) {
        // if options.isRange, jump to select year view for end date
        calendar.datePicker.onSelectYearDatePicker(dummyEvent);
      }
    }

    // use year selector when the picker is cleared but still open
    // @ts-ignore this event is not public
    calendar.on("clear", () => {
      if (this.isOpen()) {
        calendar.datePicker.onSelectYearDatePicker(dummyEvent);
      }
    });
  }

  /** Apply the {@link BulmaCalendarMode.MONTH} mode. */
  private applyMonthMode() {
    let calendar = this.calendar as typeof this.calendar & {
      // this datepicker refers to "private" functions of the internal date picker
      datePicker: {
        onSelectYearDatePicker: Function,
        onSelectMonthDatePicker: Function,
        onYearClickDatePicker: Function,
        onMonthClickDatePicker: Function,
        onDateClickDatePicker: Function,
        onNextDatePicker: Function,
        _format: String,
        _visibleDate: Date
      }
    };

    let dummyEvent = {
      preventDefault() {},
      stopPropagation() {}
    };

    // open the calendar always in the month view
    calendar.on("show", () => {
      calendar.datePicker.onSelectMonthDatePicker(dummyEvent);
    });

    // when year is selected, abort further selection and set first day of month
    let ogOnMonthClickDatePicker = calendar.datePicker.onMonthClickDatePicker;
    calendar.datePicker.onMonthClickDatePicker = (e: any) => {
      ogOnMonthClickDatePicker(e);
      e.currentTarget.dataset.date = [
        calendar.datePicker._visibleDate.getMonth() + 1,
        1,
        calendar.datePicker._visibleDate.getFullYear()
      ].join("-");
      calendar.datePicker.onDateClickDatePicker(e);
      if (this.options?.isRange) {
        // if options.isRange, jump to select month view for end date
        calendar.datePicker.onSelectMonthDatePicker(dummyEvent);
      }
    }

    let ogOnYearClickDatePicker = calendar.datePicker.onYearClickDatePicker;
    calendar.datePicker.onYearClickDatePicker = (e: any) => {
      ogOnYearClickDatePicker(e);
      calendar.datePicker.onSelectMonthDatePicker(dummyEvent);
    }

    // use year selector when the picker is cleared but still open
    // @ts-ignore this event is not public
    calendar.on("clear", () => {
      if (this.isOpen()) {
        calendar.datePicker.onSelectMonthDatePicker(dummyEvent);
      }
    });
  }
}

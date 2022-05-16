import {
  OnChanges,
  SimpleChanges,
  ViewChild,
  Component,
  AfterViewInit,
  Input,
  ElementRef
} from "@angular/core";
import Chart, {ChartData, ChartOptions} from "chart.js/auto";
import {TranslateService} from "@ngx-translate/core";
import {translateObject} from "../util";

/** Component for displaying bar charts with chart.js */
@Component({
  selector: "bar-chart",
  template: "<div><canvas style='max-width: min(100%, 100vw)' #chart></canvas></div>"
})
export class BarChartComponent implements AfterViewInit, OnChanges {

  constructor(private translate: TranslateService) {}

  /** The host element of the chart. */
  @ViewChild("chart") private chartElement!: ElementRef<HTMLCanvasElement>;

  /** The data to display with the chart. */
  @Input("data") data?: ChartData<"bar">;

  /** Options passed to the chart. */
  @Input("options") set options(o: ChartOptions<"bar">) {
    this.rawOptions = o;
  };
  get options(): ChartOptions<"bar"> {
    if (!this.rawOptions) return {};
    return translateObject(this.translate, this.rawOptions);
  }
  private rawOptions?: ChartOptions<"bar">;

  /** The chart generated by chart.js. */
  chart?: Chart<"bar">;

  /** After the view is initialized this will create the chart and render it. */
  ngAfterViewInit(): void {
    const ctx = this.chartElement.nativeElement.getContext("2d")!;
    this.chart = new Chart(ctx, {
      type: "bar",
      data: this.data ?? {datasets: []},
      options: this.options
    });
    this.translate.onLangChange.subscribe(() => {
      if (!this.options) return;
      this.chart!.options = this.options;
      this.chart!.update();
    });
  }

  /**
   * When the data is changed on the chart, it will call an update.
   * @param changes Changes made to the chart
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (this.data && this.chart) {
      this.chart.data = this.data;
      setTimeout(() => this.chart!.update(), 0);
    }
  }

}

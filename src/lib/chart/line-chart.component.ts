import {
  OnChanges,
  SimpleChanges,
  ViewChild,
  Component,
  AfterViewInit,
  Input,
  Output,
  ElementRef
} from "@angular/core";
import Chart, {ChartData, ChartOptions} from "chart.js/auto";

@Component({
  selector: "line-chart",
  template: "<canvas #chart></canvas>"
})
export class LineChartComponent implements AfterViewInit, OnChanges {

  @ViewChild("chart") private chartElement!: ElementRef<HTMLCanvasElement>;

  @Input("data") data?: ChartData<"line">;

  @Input("options") options?: ChartOptions<"line">;

  chart?: Chart<"line">;

  ngAfterViewInit(): void {
    const ctx = this.chartElement.nativeElement.getContext("2d")!;
    this.chart = new Chart(ctx, {
      type: "line",
      data: this.data ?? {datasets: []},
      options: this.options
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.data && this.chart) {
      this.chart.data = this.data;
      setTimeout(() => this.chart!.update(), 0);
    }
  }

}

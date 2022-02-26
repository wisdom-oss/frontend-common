import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";

import {BarChartComponent} from "./bar-chart.component";
import {LineChartComponent} from "./line-chart.component";

/** Module containing the charts. */
@NgModule({
  declarations: [
    BarChartComponent,
    LineChartComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    BarChartComponent,
    LineChartComponent
  ]
})
export class ChartModule {}

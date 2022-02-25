import {NgModule} from "@angular/core";

import {
  BulmaIsToggleableDirective
} from "./bulma/bulma-is-toggleable.directive";
import {IonIconComponent} from "./ion-icon/ion-icon.component";
import {MapComponent} from "./map/map.component";

@NgModule({
  declarations: [
    IonIconComponent,
    BulmaIsToggleableDirective,
    MapComponent
  ],
  imports: [],
  exports: [
    IonIconComponent,
    BulmaIsToggleableDirective,
    MapComponent,
    ChartModule
  ]
})
export class WisdomModule {}

import {NgModule} from "@angular/core";
import {TranslateModule} from "@ngx-translate/core";

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
  imports: [
    TranslateModule
  ],
  exports: [
    IonIconComponent,
    BulmaIsToggleableDirective,
    MapComponent
  ]
})
export class WisdomModule {}

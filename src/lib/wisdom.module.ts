import {NgModule} from "@angular/core";

import {
  BulmaIsToggleableDirective
} from "./bulma/bulma-is-toggleable.directive";
import {IonIconComponent} from "./ion-icon/ion-icon.component";

@NgModule({
  declarations: [IonIconComponent, BulmaIsToggleableDirective],
  imports: [],
  exports: [IonIconComponent, BulmaIsToggleableDirective]
})
export class WisdomModule {}

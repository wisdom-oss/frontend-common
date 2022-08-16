import {NgModule} from "@angular/core";
import {TranslateModule} from "@ngx-translate/core";

import {
  BulmaIsToggleableDirective
} from "./bulma/bulma-is-toggleable.directive";
import {IonIconComponent} from "./ion-icon/ion-icon.component";
import {MapComponent} from "./map/map.component";
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";

@NgModule({
  declarations: [
    IonIconComponent,
    BulmaIsToggleableDirective,
    MapComponent,
    BreadcrumbsComponent
  ],
  imports: [
    TranslateModule,
    CommonModule,
    RouterModule
  ],
  exports: [
    IonIconComponent,
    BulmaIsToggleableDirective,
    MapComponent,
    BreadcrumbsComponent
  ]
})
export class WisdomModule {}

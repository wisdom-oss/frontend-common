import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";

import {BreadcrumbsComponent} from "./breadcrumbs/breadcrumbs.component";
import {
  BulmaIsToggleableDirective
} from "./bulma/bulma-is-toggleable.directive";
import {IonIconComponent} from "./ion-icon/ion-icon.component";
import {MapComponent} from "./map/map.component";
import { BimComponent } from './bim/bim.component';

@NgModule({
  declarations: [
    IonIconComponent,
    BulmaIsToggleableDirective,
    MapComponent,
    BreadcrumbsComponent,
    BimComponent
  ],
  imports: [
    TranslateModule,
    CommonModule,
    RouterModule
  ],
  exports: [
    BimComponent,
    IonIconComponent,
    BulmaIsToggleableDirective,
    MapComponent,
    BreadcrumbsComponent
  ]
})
export class WisdomModule {}

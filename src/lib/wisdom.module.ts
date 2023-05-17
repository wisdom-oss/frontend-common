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
import { IfcComponent } from './ifc/ifc.component';

@NgModule({
  declarations: [
    IonIconComponent,
    BulmaIsToggleableDirective,
    MapComponent,
    BreadcrumbsComponent,
    IfcComponent
  ],
  imports: [
    TranslateModule,
    CommonModule,
    RouterModule
  ],
  exports: [
    IonIconComponent,
    IfcComponent,
    BulmaIsToggleableDirective,
    MapComponent,
    BreadcrumbsComponent
  ]
})
export class WisdomModule {}

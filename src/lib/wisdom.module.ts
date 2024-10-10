import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";

import { BreadcrumbsComponent } from "./breadcrumbs/breadcrumbs.component";
import {
  BulmaIsToggleableDirective
} from "./bulma/bulma-is-toggleable.directive";
import { DragDropComponent } from "./drag-drop/drag-drop.component";
import { DragDropDirective } from "./drag-drop/drag-drop.directive";
import { IfcComponent } from "./ifc/ifc.component";
import { IonIconComponent } from "./ion-icon/ion-icon.component";
import { MapComponent } from "./map/map.component";
import { BulmaCalendarDirective } from './bulma/bulma-calendar.directive';
import { Map2Component, Map2ControlComponent } from './map2/map2.component';
import { ResizeDirective } from './layout/resize.directive';
import { EmptyPipe } from './pipes/empty.pipe';
import { TransformStringPipe } from "./transform-string.pipe";

@NgModule({
  declarations: [
    IonIconComponent,
    BulmaIsToggleableDirective,
    MapComponent,
    Map2Component,
    Map2ControlComponent,
    BreadcrumbsComponent,
    IfcComponent,
    DragDropComponent,
    DragDropDirective,
    BulmaCalendarDirective,
    ResizeDirective,
    EmptyPipe,
    TransformStringPipe
  ],
  imports: [TranslateModule, CommonModule, RouterModule],
  exports: [
    IonIconComponent,
    IfcComponent,
    BulmaCalendarDirective,
    BulmaIsToggleableDirective,
    MapComponent,
    Map2Component,
    Map2ControlComponent,
    EmptyPipe,
    BreadcrumbsComponent,
    DragDropComponent,
    DragDropDirective,
    ResizeDirective,
  ],
})
export class WisdomModule { }

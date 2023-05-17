import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {IfcViewerAPI} from "web-ifc-viewer";

@Component({
  selector: 'ifc',
  template: `
    <div #viewerContainer></div>
  `,
})
export class IfcComponent implements AfterViewInit {

  @ViewChild("viewerContainer")
  viewerContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    const container = this.viewerContainer.nativeElement;
    const viewer = new IfcViewerAPI({
      container
    });
    viewer.axes.setAxes();
    viewer.grid.setGrid();
    viewer.IFC.loader.ifcManager.applyWebIfcConfig({
      USE_FAST_BOOLS: true,
      COORDINATE_TO_ORIGIN: true
    }).catch(e => console.error(e));
    viewer.context.renderer.postProduction.active = true;
    viewer.IFC.loadIfcUrl("/files/WW-TGA.ifc");
  }

}

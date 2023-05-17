import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild
} from '@angular/core';
import {IfcViewerAPI} from "web-ifc-viewer";

@Component({
  selector: 'ifc',
  template: `
    <div #resizeContainer style="width: 100%; height: {{height}}">
      <div #viewerContainer style="position: absolute"></div>
    </div>
  `,
})
export class IfcComponent implements AfterViewInit {

  @ViewChild("viewerContainer")
  viewerContainer!: ElementRef<HTMLDivElement>;

  @ViewChild("resizeContainer")
  resizeContainer!: ElementRef<HTMLDivElement>;

  @Input()
  height = "70vh";

  ngAfterViewInit(): void {
    const container = this.viewerContainer.nativeElement;
    const viewer = new IfcViewerAPI({
      container
    });
    viewer.IFC.loader.ifcManager.applyWebIfcConfig({
      USE_FAST_BOOLS: true,
      COORDINATE_TO_ORIGIN: true
    }).catch(e => console.error(e));
    viewer.IFC.loadIfcUrl("/files/WW-Langeoog/20191105-4001110-WW-TGA.ifc", true).then(() => {
      viewer.IFC.loader.ifcManager.applyWebIfcConfig({
        USE_FAST_BOOLS: true,
        COORDINATE_TO_ORIGIN: false
      }).then(() => {
        viewer.IFC.loadIfcUrl("/files/WW-Langeoog/20191028-4001110-WW-Gel.ifc", true);
        viewer.IFC.loadIfcUrl("/files/WW-Langeoog/20191028-4001110-WW-Arch.ifc", true);
        viewer.IFC.loadIfcUrl("/files/WW-Langeoog/20191028-4001110-WW-ELT.ifc", true)
      })
    });

    const observer = new ResizeObserver(entries => {
      container.style.width = entries[0].contentRect.width + "px";
      container.style.height = entries[0].contentRect.height + "px";
      viewer.context.updateAspect();
    });
    observer.observe(this.resizeContainer.nativeElement);
  }

}

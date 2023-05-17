import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild
} from '@angular/core';
import {IfcViewerAPI} from "web-ifc-viewer";
import {IFCModel} from "web-ifc-three/IFC/components/IFCModel";

/**
 * Model entry.
 */
type ModelEntry = {
  /** Specifies the path to the IFC model file. */
  path: string,

  /**
   * Indicates whether the model should be displayed after loading.
   * This is optional, with the model being visible by default.
   */
  visible?: boolean,

  /**
   * Denotes whether this model's visibility can be altered.
   * This is optional, with the model being disable-able by default.
   */
  fixed?: boolean,

  /**
   * Decides whether this model should be adjusted to fit within the frame.
   * This is recommended to be set only for one model.
   * This is optional, with the model not fitting to frame by default.
   */
  fitToFrame?: boolean
};

@Component({
  selector: 'ifc',
  template: `
    <div #resizeContainer style="width: 100%; height: {{height}}">
      <div #viewerContainer style="position: absolute"></div>
    </div>
  `,
})
export class IfcComponent implements AfterViewInit {

  @Input()
  height = "70vh";

  @Input("models")
  inputModels: Record<string, ModelEntry> = {};
  models: Record<string, ModelEntry | {ifcModel: IFCModel}> = {}

  @ViewChild("viewerContainer")
  viewerContainer!: ElementRef<HTMLDivElement>;

  @ViewChild("resizeContainer")
  resizeContainer!: ElementRef<HTMLDivElement>;

  viewer!: IfcViewerAPI;

  async ngAfterViewInit(): Promise<void> {
    const container = this.viewerContainer.nativeElement;
    this.viewer = new IfcViewerAPI({ container });
    await this.viewer.IFC.loader.ifcManager.useWebWorkers(true, "IFCWorker.js");

    const observer = new ResizeObserver(entries => {
      container.style.width = entries[0].contentRect.width + "px";
      container.style.height = entries[0].contentRect.height + "px";
      this.viewer.context.updateAspect();
    });
    observer.observe(this.resizeContainer.nativeElement);

    let first = true;
    for (
      let [model, {path, visible, fixed, fitToFrame}]
      of Object.entries(this.inputModels)
    ) {
      await this.viewer.IFC.loader.ifcManager.applyWebIfcConfig({
        USE_FAST_BOOLS: true,
        COORDINATE_TO_ORIGIN: first
      });
      first = false;
      const ifcModel = await this.viewer.IFC.loadIfcUrl(path, fitToFrame);
      if (visible === false) this.viewer.context.scene.removeModel(ifcModel);
      this.models[model] = {path, visible, fixed, ifcModel};
    }
  }

}

import {
  AfterViewInit,
  Component,
  ElementRef,
  Input, OnDestroy,
  ViewChild
} from '@angular/core';
import {IfcViewerAPI} from "web-ifc-viewer";
import {IFCModel} from "web-ifc-three/IFC/components/IFCModel";
import {IfcService} from "./ifc.service";
import {LoaderInjector} from "../loader/loader.injector";

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
  fitToFrame?: boolean,

  /**
   * Decides whether to use caching on this model.
   * This is recommended for static models with static paths.
   * This is optional, caching is enabled by default.
   */
  cache?: boolean
};

@Component({
  selector: 'ifc',
  template: `
    <div #resizeContainer style="width: 100%; height: {{height}}">
      <div #viewerContainer style="position: absolute"></div>
    </div>
  `,
})
export class IfcComponent implements AfterViewInit, OnDestroy {

  @Input()
  height = "70vh";

  @Input("models")
  inputModels: Record<string, ModelEntry> = {};
  models: Record<string, ModelEntry & {ifcModel: IFCModel}> = {}

  @ViewChild("viewerContainer")
  viewerContainer!: ElementRef<HTMLDivElement>;

  @ViewChild("resizeContainer")
  resizeContainer!: ElementRef<HTMLDivElement>;

  viewer!: IfcViewerAPI;

  constructor(private service: IfcService, private loader: LoaderInjector) {}

  ngAfterViewInit(): Promise<void> {
    const loadAll: Promise<void> = new Promise(async allLoaded => {
      const container = this.viewerContainer.nativeElement;

      // set initial width and height to properly render, after load is done,
      // resize will fix this size
      container.style.width = "500px";
      container.style.height = "500px";

      // initialize ifc viewer
      this.viewer = new IfcViewerAPI({ container });
      await this.viewer.IFC.loader.ifcManager.useWebWorkers(true, "IFCWorker.js");

      // fetch models from path or local db
      let fetchModels = [];
      for (let [model, opts] of Object.entries(this.inputModels)) {
        let {path, cache} = opts;
        fetchModels.push(
          this.service.fetchModel(path, cache === false)
            .then(file => [model, Object.assign({}, opts, { file })])
        );
      }
      let fetchedInput: Record<string, ModelEntry & {file: File}> =
        Object.fromEntries(await Promise.all(fetchModels));

      // render models
      let first = true;
      let modelIter = Object.entries(fetchedInput);
      let count = modelIter.length;
      for (let i in modelIter) {
        // TODO: make this parallel first the smallest solo first
        let [model, opts] = modelIter[i];
        let renderPromise: Promise<void> = new Promise(async ifcLoaded => {
          const {file, fitToFrame, visible, path, fixed} = opts;
          await this.viewer.IFC.loader.ifcManager.applyWebIfcConfig({
            USE_FAST_BOOLS: true,
            COORDINATE_TO_ORIGIN: first
          });
          first = false;
          const ifcModel = await this.viewer.IFC.loadIfc(file, fitToFrame);
          if (visible === false) this.viewer.context.scene.removeModel(ifcModel);
          this.models[model] = {path, visible, fixed, ifcModel};
          ifcLoaded();
        });
        // TODO: add translation text here
        this.loader.addLoader(renderPromise, `rendering models [${+i + 1}/${count}]`);
        await renderPromise;
      }

      // initialize observer to automatically resize ifc viewer
      const observer = new ResizeObserver(entries => {
        container.style.width = entries[0].contentRect.width + "px";
        container.style.height = entries[0].contentRect.height + "px";
        this.viewer.context.updateAspect();
      });
      observer.observe(this.resizeContainer.nativeElement);

      // everything is loaded, allow curtain to rise
      allLoaded();
    });

    this.loader.addLoader(loadAll);
    return loadAll;
  }

  hideModel(model: string) {
    this.viewer.context.scene.removeModel(this.models[model].ifcModel);
  }

  showModel(model: string) {
    this.viewer.context.scene.addModel(this.models[model].ifcModel);
  }

  ngOnDestroy(): void {
    // TODO: destroy models to avoid memory leak
    // https://ifcjs.github.io/info/docs/Guide/web-ifc-viewer/Tutorials/Memory
  }

}

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
  resizeObserver!: ResizeObserver;

  viewer!: IfcViewerAPI;

  constructor(private service: IfcService, private loader: LoaderInjector) {}

  ngAfterViewInit(): Promise<void> {
    const loadAll: Promise<void> = new Promise(async allLoaded => {
      // @ts-ignore the models do not have the ifcModel at this point, but this is fine
      this.models = this.inputModels;
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

      // load models
      let modelIter = Object.entries(fetchedInput);
      modelIter.sort(([_a, a], [_b, b]) => a.file.size - b.file.size);
      let smallest = modelIter[0];
      let rest = modelIter.slice(1);

      const loadModel = async (modelEntry: typeof smallest, first: boolean) => {
        const [model, opts] = modelEntry;
        const {file, fitToFrame, visible, path, fixed} = opts;
        await this.viewer.IFC.loader.ifcManager.applyWebIfcConfig({
          USE_FAST_BOOLS: true,
          COORDINATE_TO_ORIGIN: first
        });
        const ifcModel = await this.viewer.IFC.loadIfc(file, fitToFrame);
        if (visible === false) this.viewer.context.scene.removeModel(ifcModel);
        this.models[model].ifcModel = ifcModel;
      }

      let loadModels = new Promise<void>(async loaded => {
        await loadModel(smallest, true);
        let others = [];
        for (let r of rest.reverse()) others.push(loadModel(r, false));
        await Promise.all(others);
        loaded();
      });
      this.loader.addLoader(loadModels, "loading models");
      await loadModels;

      // initialize observer to automatically resize ifc viewer
      this.resizeObserver = new ResizeObserver(entries => {
        container.style.width = entries[0].contentRect.width + "px";
        container.style.height = entries[0].contentRect.height + "px";
        this.viewer.context.updateAspect();
      });
      this.resizeObserver.observe(this.resizeContainer.nativeElement);

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

  async ngOnDestroy(): Promise<void> {
    this.resizeObserver.disconnect();
    // FIXME: check out how to fix this dispose
    await this.viewer.IFC.dispose();
  }

}

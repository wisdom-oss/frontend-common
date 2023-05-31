import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter,
  Input, OnDestroy, Output,
  ViewChild
} from '@angular/core';
import {IfcViewerAPI} from "web-ifc-viewer";
import {IFCModel} from "web-ifc-three/IFC/components/IFCModel";
import {IfcService} from "./ifc.service";
import {LoaderInjector} from "../loader/loader.injector";
import {JSONObject} from "web-ifc-three/IFC/BaseDefinitions";
import {TranslateService} from "@ngx-translate/core";

export namespace IfcComponent {
  /**
   * Model entry.
   */
  export type ModelEntry = {
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
}

type ModelEntry = IfcComponent.ModelEntry;

@Component({
  selector: 'ifc',
  template: `
    <div #resizeContainer style="width: 100%; height: {{height}}">
      <div #viewerContainer style="position: absolute"></div>
    </div>
  `
})
export class IfcComponent implements AfterViewInit, OnDestroy {

  @Input()
  height = "70vh";

  @Input("models")
  inputModels: Record<string, ModelEntry> = {};
  models: Record<string, ModelEntry & {ifcModel: IFCModel}> = {};

  @Output("selected")
  selectedModel: EventEmitter<JSONObject> = new EventEmitter();

  @ViewChild("viewerContainer")
  viewerContainer!: ElementRef<HTMLDivElement>;

  @ViewChild("resizeContainer")
  resizeContainer!: ElementRef<HTMLDivElement>;
  resizeObserver?: ResizeObserver;

  viewer!: IfcViewerAPI;

  private isDestroyed: boolean = false;

  constructor(
    private service: IfcService,
    private loader: LoaderInjector,
    private translate: TranslateService
  ) {}

  ngAfterViewInit(): Promise<void> {
    const loadAll: Promise<void> = new Promise(async allLoaded => {
      // make code clearer by this alias
      const abort = allLoaded;

      // @ts-ignore the models do not have the ifcModel at this point, but this
      // is fine
      this.models = this.inputModels;
      const container = this.viewerContainer.nativeElement;

      // set initial width and height to properly render, after load is done,
      // resize will fix this size
      container.style.width = "500px";
      container.style.height = "500px";

      // initialize ifc viewer
      this.viewer = new IfcViewerAPI({container});
      await this.viewer.IFC.loader.ifcManager.useWebWorkers(true, "IFCWorker.js");

      // fetch models from path or local db
      let fetchModels = [];
      for (let [model, opts] of Object.entries(this.inputModels)) {
        let {path, cache} = opts;
        fetchModels.push(
          this.service.fetchModel(path, cache === false)
            .then(file => [model, Object.assign({}, opts, {file})])
        );
      }
      let fetchedInput: Record<string, ModelEntry & {file: File}> =
        Object.fromEntries(await Promise.all(fetchModels));

      // load models
      let modelIter = Object.entries(fetchedInput);
      const loadModel = async (modelEntry: typeof modelIter[0], first: boolean) => {
        const [model, opts] = modelEntry;
        const {file, fitToFrame, visible, path, fixed} = opts;

        // COORDINATE_TO_ORIGIN sets the origin of the model
        // only first run should align this, the other should use same system
        await this.viewer.IFC.loader.ifcManager.applyWebIfcConfig({
          USE_FAST_BOOLS: true,
          COORDINATE_TO_ORIGIN: first
        });
        const ifcModel = await this.viewer.IFC.loadIfc(file, fitToFrame);

        // this just hides model from scene
        if (visible === false) this.viewer.context.scene.removeModel(ifcModel);
        this.models[model].ifcModel = ifcModel;
      };

      let first = true;
      let count = modelIter.length;
      for (let i in modelIter) {
        // do not load another model if this component is destroyed
        if (this.isDestroyed) return abort();

        let loading = loadModel(modelIter[i], first);
        first = false;
        // TODO: clean this translation up
        let translated = this.translate.instant("common.ifc.loading");
        this.loader.addLoader(loading, `${translated} [${+i + 1}/${count}]`);
        await loading;
      }

      // initialize observer to automatically resize ifc viewer
      this.resizeObserver = new ResizeObserver(entries => {
        container.style.width = entries[0].contentRect.width + "px";
        container.style.height = entries[0].contentRect.height + "px";
        this.viewer.context.updateAspect();
      });
      this.resizeObserver.observe(this.resizeContainer.nativeElement);

      // everything is loaded, allow curtain to rise
      allLoaded();

      // add events
      this.viewerContainer.nativeElement.onmousemove = () => {
        this.viewer.IFC.selector.prePickIfcItem();
      };

      this.viewerContainer.nativeElement.onclick = async () => {
        const picked = await this.viewer.IFC.selector.pickIfcItem();
        if (!picked) return;
        const {modelID, id} = picked;
        // TODO: make recursive an input
        const props = await this.viewer.IFC.getProperties(modelID, id, true, false);
        this.selectedModel.emit(props);
      };
    });

    this.loader.addLoader(loadAll);
    return loadAll;
  }

  hideModel(model: string) {
    if (this.models[model].fixed) return;
    this.viewer.context.scene.removeModel(this.models[model].ifcModel);
  }

  showModel(model: string) {
    this.viewer.context.scene.addModel(this.models[model].ifcModel);
  }

  async ngOnDestroy(): Promise<void> {
    this.isDestroyed = true;
    if (this.resizeObserver) this.resizeObserver.disconnect();
    await this.viewer.dispose();
  }

}

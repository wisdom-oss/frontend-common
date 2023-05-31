import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter,
  Input, OnDestroy, OnInit, Output,
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
type InputModels = Record<string, ModelEntry>;
type LoadedModels = Record<string, ModelEntry & {ifcModel: IFCModel}>;

/** Component for displaying IFC models. */
@Component({
  selector: 'ifc',
  template: `
    <div #resizeContainer style="width: 100%; height: {{height}}">
      <div #viewerContainer style="position: absolute"></div>
    </div>
  `
})
export class IfcComponent implements AfterViewInit, OnDestroy, OnInit {

  /**
   * Input for the height of the component.
   *
   * The height should be adjusted by this property to allow the renderer to
   * correctly output the height.
   * The width is dynamically inferred.
   */
  @Input()
  height = "70vh";

  /**
   * Input for the models that should be displayed.
   *
   * The keys of the given record will be used for the show and hide functions.
   * The order of the given record is respected at any time, the first model
   * will define the coordinate system used by all models.
   * The finally fully loaded models will also have the ordering given by this
   * record.
   *
   * **Example**:
   * ```
   * <ifc [layers]="{
   *   MODEL_A: {path: "path/to/model/a", fixed: true},
   *   MODEL_B: {path: "path/to/model/b", visible: false}
   * }"></ifc>
   * ```
   *
   * @see ModelEntry
   */
  @Input("models")
  inputModels: InputModels = {};

  /** Input indicating whether picking should be enabled. */
  @Input("picking")
  usePicking: boolean = false;

  /** Input indicating whether the picker should load object data recursively. */
  @Input("recursive")
  useRecursive: boolean = false;

  /**
   * Output for the selected model.
   *
   * This event is emitted when a model is selected if picking is enabled.
   * The event data is a JSON object representing the selected model.
   * The specific structure of the object depends on the model and needs to be
   * inferred by other means.
   */
  @Output("selected")
  selectedModel: EventEmitter<JSONObject> = new EventEmitter();

  /**
   * Ifc viewer containing every interaction with the viewer.
   *
   * **Attention**: This viewer is only fully available after the models have
   * fully loaded.
   * To avoid race conditions await the {@link loadedModels}.
   *
   * Beware of directly using this viewer, as it may not be easy to use directly.
   * Most important interactions are available via the {@link loadedModels} and
   * {@link selectedModel} properties.
   *
   * @see https://ifcjs.github.io/info/docs/Guide/web-ifc-viewer/web-ifc-viewer-API
   */
  viewer?: IfcViewerAPI;

  /**
   * A promise for the loaded IFC models.
   *
   * This promise resolves with the loaded models when the viewer has fully
   * loaded them.
   * It may also be rejected if the component is destroyed before fully loading
   * the models.
   */
  loadedModels!: Promise<LoadedModels>;

  /** Container for the viewer. */
  @ViewChild("viewerContainer")
  private viewerContainer!: ElementRef<HTMLDivElement>;

  /** Container for the {@link resizeObserver}. */
  @ViewChild("resizeContainer")
  private resizeContainer!: ElementRef<HTMLDivElement>;

  /**
   * Resize observer detecting changes on the {@link resizeContainer} to update
   * the size of the {@link viewerContainer}.
   */
  private resizeObserver?: ResizeObserver;

  /** Models loaded by this component. */
  private models: LoadedModels = {};

  /** Resolve function for the {@link loadedModels} promise. */
  private modelLoadDone!: (value: LoadedModels) => void;
  /** Reject function for the {@link loadedModels} promise. */
  private modelLoadAbort!: () => void;

  /** Flag whether this component is destroyed. */
  private isDestroyed: boolean = false;

  /**
   * Constructor.
   * @param service IFC service to lazily fetch models
   * @param loader Loader injector to lower the loading curtain while loading models
   * @param translate Translate service to translate loading text
   */
  constructor(
    private service: IfcService,
    private loader: LoaderInjector,
    private translate: TranslateService
  ) {}

  /** Prepares the {@link loadedModels} promise. */
  ngOnInit(): void {
    this.loadedModels = new Promise((resolve, reject) => {
      this.modelLoadDone = resolve;
      this.modelLoadAbort = reject;
    });
  }

  /**
   * Main function of this component.
   *
   * After the view is initialized, this function prepares the {@link viewer}
   * and loads all the models for {@link loadedModels}.
   *
   * While loading, the loading curtain will be lowered.
   *
   * When loading is complete, {@link loadedModels} is resolved, and
   * {@link viewer} can be used.
   */
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
        await this.viewer!.IFC.loader.ifcManager.applyWebIfcConfig({
          USE_FAST_BOOLS: true,
          COORDINATE_TO_ORIGIN: first
        });
        const ifcModel = await this.viewer!.IFC.loadIfc(file, fitToFrame);

        // this just hides model from scene
        if (visible === false) this.viewer!.context.scene.removeModel(ifcModel);
        this.models[model].ifcModel = ifcModel;
      };

      let first = true;
      let count = modelIter.length;
      for (let i in modelIter) {
        // do not load another model if this component is destroyed
        if (this.isDestroyed) {
          abort();
          this.modelLoadAbort();
          return;
        }

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
        this.viewer!.context.updateAspect();
      });
      this.resizeObserver.observe(this.resizeContainer.nativeElement);

      // everything is loaded, allow curtain to rise
      allLoaded();
      this.modelLoadDone(this.models);

      // if picking is disabled, return here, otherwise add events for picking
      if (!this.usePicking) return;

      this.viewerContainer.nativeElement.onmousemove = () => {
        this.viewer!.IFC.selector.prePickIfcItem();
      };

      this.viewerContainer.nativeElement.onclick = async () => {
        const picked = await this.viewer!.IFC.selector.pickIfcItem();
        if (!picked) return;
        const {modelID, id} = picked;
        const props = await this.viewer!.IFC.getProperties(modelID, id, true, this.useRecursive);
        this.selectedModel.emit(props);
      };
    });

    this.loader.addLoader(loadAll);
    return loadAll;
  }

  /**
   * Hides a model from the viewer.
   *
   * This function ensures that no errors occur, but it does not keep a queue
   * of all the models to be hidden.
   * If called too early, the models cannot be hidden.
   * To avoid race conditions, await the {@link loadedModels} promise.
   * To hide a model from the start, set the `visible` property of the
   * corresponding model entry in {@link inputModels} to `false`.
   * Models with the `fixed` property set to `true` cannot be hidden using this
   * function.
   * It is recommended to use this function to hide models from the viewer
   * instead of hiding them manually via the {@link viewer}.
   *
   * @param model The model to hide, using the keys from {@link inputModels}
   */
  hideModel(model: string) {
    if (this.models[model].fixed) return;
    if (this.viewer) this.viewer.context.scene.removeModel(this.models[model].ifcModel);
  }

  /**
   * Shows a model in the viewer.
   *
   * This function ensures that no errors occur, but it does not keep a queue
   * of all the models to be shown.
   * If called too early, the models cannot be shown.
   * To avoid race conditions, await the {@link loadedModels} promise.
   *
   * @param model The model to show, using the keys from {@link inputModels}
   */
  showModel(model: string) {
    if (this.viewer) this.viewer.context.scene.addModel(this.models[model].ifcModel);
  }

  /**
   * Disconnects the {@link resizeObserver} and clears the memory from the
   * models of the {@link viewer}.
   *
   * This ensures that models will no longer be loaded when this
   * component is destroyed.
   */
  async ngOnDestroy(): Promise<void> {
    this.isDestroyed = true;
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.viewer) await this.viewer.dispose();
  }

}

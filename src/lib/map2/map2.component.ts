import { AfterViewInit, Component, ComponentRef, ElementRef, Input, OnDestroy, OnInit, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { LayerContent, LayerFilter, LayerRef, LayerId, LayerInfo, Map2Service } from './map2.service';
import * as L from "leaflet";
import "leaflet.markercluster";
import { not, OneOrMany, WithRequired } from "../util";

import "leaflet.markercluster";
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import * as geojson from "geojson";

export namespace LayerConfig {
  /** 
   * A layer in the config may be described either via a {@link LayerRef} which 
   * is a {@link LayerId} or a {@link Layerkey}, or by an object with with 
   * additional properties.
   * 
   * This also allows using {@link RawLayer}s.
   */
  export type Descriptor = LayerRef | RawLayer | ExpandedDescriptor;

  /**
   * Expanded descriptor to configure more complex layers.
   */
  export type ExpandedDescriptor = {
    /** ID of the layer. */
    layer: LayerRef,
    /** Override for layer names, especially useful if filtered. */
    name?: string,
    /** If this layer is visible by default, `true` by default. */
    show?: boolean,
    /** Optional filter to be applied on the selected layer. */
    filter?: LayerFilter,
    /** Whether this layer can be selected by user input. */
    select?: boolean,
    /** 
     * Override default behavior for marker clustering. 
     * 
     * By default markers will be clustered. 
     * Has no effect on layers that don't have markers, e.g. polygons. 
     */
    cluster?: boolean,
    /** If this layer should show names, `false` by default. */
    showNames?: boolean,
    /** A function defining how the polygons should be styled. */
    style?: (
      layerContent: LayerContent,
      allLayerContents: LayerContent[],
      info: LayerInfo
    ) => L.PathOptions,
    /** A function defining how marker should be created from points. */
    marker?: (
      latlng: L.LatLng,
      LayerContent: LayerContent,
      allLayerContents: LayerContent[],
      info: LayerInfo
    ) => L.Marker,
    /** 
     * One or a list of controls, each control needs to be a component which 
     * implements `Map2Control`.
     * Every control needs a location to be placed on the map.
     * And optionally an object can be passed here to be used to initialize the 
     * control.
     */
    control?: OneOrMany<[Type<Map2Control>, L.ControlPosition, ControlInit?]>,
  };

  export type ControlInit = Record<string, any>;

  /**
   * Instead of a {@link LayerRef}, this uses a raw leaft {@link L.Layer}.
   * 
   * The name is required as we have no server backing up a name for that layer.
   */
  export type RawLayer = {
    /** A leaflet layer. */
    layer: L.Layer,
    /** A display name for that layer. */
    name: string,
    /** If this layer is visible by default, `true` by default. */
    show?: boolean,
  };

  export namespace Descriptor {
    /** Expand {@link LayerRef}s into {@link ExpandedDescriptor}. */
    export function expand(
      descriptor: Descriptor
    ): Exclude<Descriptor, LayerRef> {
      if (typeof descriptor != "string") return descriptor;
      return { layer: descriptor }
    }

    /** Check whether a {@link Descriptor} is a {@link RawLayer}. */
    export function isRaw(descriptor: Descriptor): boolean {
      if (typeof descriptor == "string") return false;
      return typeof descriptor.layer != "string";
    }
  }

  /**
   * A group represents one control element of a map.
   * The {@link Descriptor} in a group will be used as base layers and will 
   * therefore be selectable via a radio menu.
   * These layers will be mutually exclusive, useful for different resolutions 
   * of the same layer.
   * 
   * For overlays, i.e. layers with a checkbox, {@link Descriptor}s need to be 
   * wrapped in an array with only one element.
   * This allows the resolver to easily differentiate between base layers and 
   * overlays.
   */
  export type Group = Array<Descriptor | [Descriptor]>;

  /**
   * The config for a map defines what layer should be shown, how they
   * interact with each other and if they are required or not.
   * 
   * The array consists for either {@link Descriptor} elements which describe 
   * the required layers for that map, these layers cannot be hidden.
   * The other option are {@link Group}s, the elements inside a group 
   * may be toggled in their visiblity.
   * 
   * Having multiple groups will result into multiple control elements.
   * 
   * The order of layer groups will also be reflected on the map.
   */
  export type Input = Array<Descriptor | Group>;
}

@Component({
  selector: 'map2',
  template: `
    <div class="map-container" [style.height]="height">
      <div #map class="map"></div>
    </div>
  `,
  styles: [`
    .map {
      z-index: 10;
      height: 100%;
    }
  `]
})
export class Map2Component implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("map")
  private mapElement!: ElementRef<HTMLDivElement>;

  @Input("height")
  height: string = "500px";

  @Input("tileUrl")
  tileUrl: string = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  @Input("center")
  center: string = "53.1434501, 8.2145521";

  @Input("zoom")
  zoom: number = 7;

  @Input("scrollWheelZoom")
  scrollWheelZoom: boolean | "center" = true;

  @Input("layers")
  layerConfig: LayerConfig.Input = [];

  // TODO: add outputs for all the events

  private mapResolve!: (map: L.Map) => void;
  map: Promise<L.Map>;

  private layerData!: Promise<Record<LayerId, {
    info: LayerInfo,
    contents: LayerContent[]
  }>>;

  // container for elements to destroy on destroy
  private components: ComponentRef<any>[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private service: Map2Service,
    private vcr: ViewContainerRef
  ) {
    this.map = new Promise((resolve) => this.mapResolve = resolve);
  }

  ngOnInit(): void {
    this.layerData = this.resolveLayers();
  }

  async ngAfterViewInit(): Promise<void> {
    const nativeMapElement = this.mapElement.nativeElement;

    const map = L.map(nativeMapElement, {
      scrollWheelZoom: this.scrollWheelZoom,
      center: this.center.split(",").map(str => parseFloat(str)) as [number, number],
      zoom: this.zoom
    });
    map.getRenderer(map as any).options.padding = 100;

    L.tileLayer(this.tileUrl).addTo(map);

    let layerData = await this.layerData;
    for (let layerConfigItem of this.layerConfig) {
      if (!Array.isArray(layerConfigItem)) { // is not a group
        let { layer } = this.constructLayer(layerConfigItem, layerData, map);
        layer.addTo(map);
        continue;
      }

      let control = L.control.layers();
      if (layerConfigItem.length) control.addTo(map);
      for (let [index, groupItem] of Object.entries(layerConfigItem)) {
        if (Array.isArray(groupItem)) {
          // overlay item
          let { name, layer, show = true } = this.constructLayer(groupItem[0], layerData, map);
          control.addOverlay(layer, name);
          if (show) layer.addTo(map);
          continue;
        }

        // base item
        let { name, layer, show = (+index == 0) } = this.constructLayer(groupItem, layerData, map);
        control.addBaseLayer(layer, name);
        if (show) layer.addTo(map);
      }
    }

    this.mapResolve(map);
  }

  ngOnDestroy(): void {
    this.map.then(map => map.remove());
    for (let ref of this.components) ref.destroy();
    for (let sub of this.subscriptions) sub.unsubscribe();
  }

  /**
   * Iterate through the `layerConfig` and resolve all layer info and layer 
   * contents that exist in the layer config.
   */
  private resolveLayers(): Map2Component["layerData"] {
    function throwOnNull<T>(value: T | null): T {
      if (value === null) throw new Error("expected value to be not null");
      return value;
    }

    let layers = this
      .layerConfig
      .flat(2)
      .map(LayerConfig.Descriptor.expand)
      .filter(not(LayerConfig.Descriptor.isRaw)) as
      LayerConfig.ExpandedDescriptor[];

    let layerDataEntries = [];
    for (let layer of layers) {
      layerDataEntries.push((async () => {
        let [info, contents] = await Promise.all([
          this
            .service
            .fetchLayerInfo(layer.layer)
            .then(throwOnNull),
          this
            .service
            .fetchLayerContents(layer.layer, true, layer.filter)
            .then(throwOnNull),
        ]);
        return [layer.layer, { info, contents }];
      })())
    }

    return Promise.all(layerDataEntries).then(Object.fromEntries);
  }

  private constructLayer(
    descriptor: LayerConfig.Descriptor,
    layerData: Awaited<Map2Component["layerData"]>,
    map: L.Map
  ): { name: string, layer: L.Layer } &
    Omit<LayerConfig.ExpandedDescriptor, "layer"> {
    try {
      let expanded = LayerConfig.Descriptor.expand(descriptor);
      if (expanded.layer instanceof L.Layer) {
        // ts doesn't recognize by the instanceof here alone
        expanded = expanded as LayerConfig.RawLayer;
        return { ...expanded, name: expanded.name, layer: expanded.layer };
      }

      expanded = expanded as LayerConfig.ExpandedDescriptor;
      let thisLayerData = layerData[expanded.layer];
      let layer = this.constructContentLayer(expanded, thisLayerData, map);
      let name = expanded.name ?? thisLayerData.info.name;
      let cluster = expanded.cluster ?? thisLayerData
        .contents
        .every(content => content.geometry.type == "Point");
      if (cluster) layer = new L.MarkerClusterGroup().addLayers([layer]);
      return { ...expanded, name, layer };
    }
    catch (e: any) {
      if (!(e instanceof Error)) throw e;
      throw new ConstructLayerError(descriptor, layerData, e);
    }
  }

  private constructContentLayer(
    descriptor: LayerConfig.ExpandedDescriptor,
    layerData: {
      info: LayerInfo,
      contents: LayerContent[]
    },
    map: L.Map
  ): L.Layer {
    function styleFunction(content: LayerContent) {
      if (!descriptor.style) return undefined;
      return () => descriptor.style!(content, layerData.contents, layerData.info);
    }

    function markerFunction(content: LayerContent) {
      if (!descriptor.marker) return undefined;
      return (_: any, latlng: L.LatLng) => descriptor.marker!(
        latlng,
        content,
        layerData.contents,
        layerData.info
      )
    }

    let controlHandle;
    if (descriptor.control) {
      controlHandle = [];
      let controlDescriptor: [Type<Map2Control>, L.ControlPosition, LayerConfig.ControlInit?][];
      if (Array.isArray(descriptor.control[0])) controlDescriptor = descriptor.control as any;
      else controlDescriptor = [descriptor.control] as any;

      for (let [component, position, init] of controlDescriptor) {
        controlHandle.push(this.constructControl(
          [component, position, init ?? {}],
          descriptor as WithRequired<LayerConfig.ExpandedDescriptor, "control">,
          map
        ))
      }
    }

    let layerGroup = L.layerGroup();
    for (let content of layerData.contents) {
      let layer = L.geoJSON(content.geometry, {
        attribution: layerData.info.attribution,
        style: styleFunction(content),
        pointToLayer: markerFunction(content),
        onEachFeature: (feature, layer) => {
          if (descriptor.showNames) layer.bindTooltip(content.name);
        }
      });
      for (let handle of controlHandle ?? []) {
        handle(layer, content, layerData.contents, layerData.info);
      }
      // controlHandle?.(layer, content, layerData.contents, layerData.info);
      layerGroup.addLayer(layer);
    }
    return layerGroup
  }

  private constructControl(
    control: [Type<Map2Control>, L.ControlPosition, LayerConfig.ControlInit],
    descriptor: WithRequired<LayerConfig.ExpandedDescriptor, "control">, 
    map: L.Map
  ) {
    let component = this.vcr.createComponent(control[0]);
    this.components.push(component);
    let lControl = new L.Control();
    lControl.onAdd = () => component.location.nativeElement;
    lControl.setPosition(control[1]);
    lControl.addTo(map);
    if (component.instance.isVisible) {
      this.subscriptions.push(component.instance.isVisible.subscribe(data => {
        if (data) lControl.addTo(map);
        else lControl.remove();
      }));
    }

    component.instance.controlInit?.(control[2]);

    return (
      layer: L.Layer,
      layerContent: LayerContent,
      allLayerContents: LayerContent[],
      info: LayerInfo,
    ) => {
      let evtArgs = [layerContent, allLayerContents, info] as const;
      layer.on("add", evt => component.instance.onLayerAdd?.(...evtArgs, evt));
      layer.on("remove", evt => component.instance.onLayerRemove?.(...evtArgs, evt));
      layer.on("click", evt => component.instance.onClick?.(...evtArgs, evt));
      layer.on("dblclick", evt => component.instance.onDoubleClick?.(...evtArgs, evt));
      layer.on("mousedown", evt => component.instance.onMouseDown?.(...evtArgs, evt));
      layer.on("mouseup", evt => component.instance.onMouseUp?.(...evtArgs, evt));
      layer.on("mouseover", evt => component.instance.onMouseOver?.(...evtArgs, evt));
      layer.on("mouseout", evt => component.instance.onMouseOut?.(...evtArgs, evt));
    }
  }
}

export class ConstructLayerError extends Error {
  constructor(
    public layerDescriptor: LayerConfig.Descriptor,
    public layerData: Awaited<Map2Component["layerData"]>,
    public error: Error
  ) {
    super([
      `Cannot construct layer for '${layerDescriptor}', `,
      error.message.substring(0, 1).toLowerCase(),
      error.message.substring(1)
    ].join(""));
  }
}

type MapEventHandler<E = L.LeafletEvent> = (
  layerContent: LayerContent,
  allLayerContents: LayerContent[],
  info: LayerInfo,
  event: E
) => void;
export interface Map2Control {
  controlInit?: (args: object) => void,
  isVisible?: Observable<boolean>,
  onLayerAdd?: MapEventHandler,
  onLayerRemove?: MapEventHandler,
  onClick?: MapEventHandler<L.LeafletMouseEvent>,
  onDoubleClick?: MapEventHandler<L.LeafletMouseEvent>,
  onMouseDown?: MapEventHandler<L.LeafletMouseEvent>,
  onMouseUp?: MapEventHandler<L.LeafletMouseEvent>,
  onMouseOver?: MapEventHandler<L.LeafletMouseEvent>,
  onMouseOut?: MapEventHandler<L.LeafletMouseEvent>,
}

@Component({
  selector: 'map2-control',
  template: `
    <div class="map-container">
      <div>
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      border: 2px solid rgba(0, 0, 0, 0.2);
      background-clip: padding-box;
      border-radius: 5px;
    }
    .map-container div {
      color: #333;
      padding: 6px 10px 6px 6px;
      background: #fff;
      border-radius: inherit;
    }
  `]
})
export class Map2ControlComponent {}

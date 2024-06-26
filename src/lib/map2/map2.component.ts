import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { LayerContent, LayerFilter, LayerId, LayerInfo, Map2Service } from './map2.service';
import * as L from "leaflet";
import "leaflet.markercluster";
import { not } from "../util";

export namespace LayerConfig {
  /** 
   * A layer in the config may be described either via a {@link LayerId} or by 
   * an object with with additional properties.
   * 
   * This also allows using {@link RawLayer}s.
   */
  export type Descriptor = LayerId | RawLayer | ExpandedDescriptor;

  /**
   * Expanded descriptor to configure more complex layers.
   */
  export type ExpandedDescriptor = {
    /** ID of the layer. */
    layer: LayerId,
    /** Override for layer names, especially useful if filtered. */
    name?: string,
    /** If this layer is visible by default, `true` by default. */
    show?: boolean,
    /** Optional filter to be applied on the selected layer. */
    filter?: LayerFilter,
    /** Whether this layer can be selected by user input. */
    select?: boolean,
  };

  /**
   * Instead of a {@link LayerId}, this uses a raw leaft {@link L.Layer}.
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
    /** Expand {@link LayerId}s into {@link ExpandedDescriptor}. */
    export function expand(
      descriptor: Descriptor
    ): Exclude<Descriptor, LayerId> {
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
export class Map2Component implements OnInit, AfterViewInit {
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

  map?: L.Map;

  private layerData!: Promise<Record<LayerId, {
    info: LayerInfo,
    contents: LayerContent[]
  }>>;

  constructor(private service: Map2Service) {}

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

    let control = L.control.layers();

    let layerData = await this.layerData;
    for (let layerConfigItem of this.layerConfig) {
      if (!Array.isArray(layerConfigItem)) { // is not a group
        let {layer} = this.constructLayer(layerConfigItem, layerData);
        layer.addTo(map);
        continue;
      }

      let control = L.control.layers();
      for (let groupItem of layerConfigItem) {
        if (Array.isArray(groupItem)) {
          // overlay item
          let {name, layer, show = true} = this.constructLayer(groupItem[0], layerData);
          control.addOverlay(layer, name);
          if (show) layer.addTo(map);
          continue;
        }

        // base item
        let {name, layer, show = true} = this.constructLayer(groupItem, layerData);
        control.addBaseLayer(layer, name);
        if (show) layer.addTo(map);
      }
    }

    if (Object.keys(layerData).length) control.addTo(map);
    this.map = map;
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
        return [layer.layer, {info, contents}];
      })())
    }

    return Promise.all(layerDataEntries).then(Object.fromEntries);
  }

  private constructLayer(
    descriptor: LayerConfig.Descriptor, 
    layerData: Awaited<Map2Component["layerData"]>
  ): 
    { name: string, layer: L.Layer } & 
    Omit<LayerConfig.ExpandedDescriptor, "layer"> 
  {
    let expanded = LayerConfig.Descriptor.expand(descriptor);
    if (expanded.layer instanceof L.Layer) {
      // ts doesn't recognize by the instanceof here alone
      expanded = expanded as LayerConfig.RawLayer;
      return {...expanded, name: expanded.name, layer: expanded.layer};
    }

    expanded = expanded as LayerConfig.ExpandedDescriptor;
    let thisLayerData = layerData[expanded.layer];
    let layer = L.geoJSON();
    for (let content of thisLayerData.contents) layer.addData(content.geometry);
    let name = expanded.name ?? thisLayerData.info.name;
    return {...expanded, name, layer};
  }
}

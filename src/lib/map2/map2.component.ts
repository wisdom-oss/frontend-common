import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { LayerContent, LayerFilter, LayerId, LayerInfo, Map2Service } from './map2.service';
import * as L from "leaflet";
import "leaflet.markercluster";

export namespace LayerConfig {
  /** 
   * A layer in the config may be described either via a layer id or by an 
   * object with with additional properties.
   */
  export type Descriptor = LayerId | {
    /** ID of the layer. */
    layer: LayerId,
    /** Override for layer names, especially useful if filtered. */
    name?: string,
    /** Optional filter to be applied on the selected layer. */
    filter?: LayerFilter,
    /** Whether this layer can be selected by user input. */
    select?: boolean
  };

  export namespace Descriptor {
    export function expand(
      descriptor: Descriptor
    ): Exclude<Descriptor, LayerId> {
      if (typeof descriptor != "string") return descriptor;
      return { layer: descriptor } 
    }
  }

  /**
   * A group in the config may be a single descriptor, an array with only one
   * descriptor or an array of descriptors.
   * 
   * The plain descriptor is used to define layers that are required to show.
   * 
   * The array with only a single descriptor defines a layers that is 
   * toggleable.
   * 
   * The array of multiple descriptors defines a collection of layers which are 
   * mutually exclusive to each other. 
   * This will result into a radio group.
   */
  export type Group = Descriptor | [Descriptor] | Descriptor[];

  /**
   * The config for a map defines what layers should be shown, how they 
   * interact with each other and if they are required or not. 
   * 
   * The order of layer groups will also be reflected on the map.
   */
  export type Input = Array<Group>;
}

export type LayerConfig = Array<LayerId[] | [LayerId] | LayerId>

@Component({
  selector: 'map2',
  template: `
    <div class="map-container" [style.height]="height">
      <div #map class="map"></div>
    </div>
  `,
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
    });
    map.getRenderer(map as any).options.padding = 100;

    L.tileLayer(this.tileUrl).addTo(map);

    let layerData = await this.layerData;
    for (let group of this.layerConfig) {
      // TODO: loop over the layer config and figure out what to do with each
      //       entry, remember LayerConfig.Descriptor.expand exists
      let layerId, name, required, selectable;
      if (Array.isArray(group)) {
        if (group.length == 1) {

        } 
      }
    }

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

    let layerDataEntries = [];
    let layers = this.layerConfig.flat().map(LayerConfig.Descriptor.expand);
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
}

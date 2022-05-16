import {
  ViewChild,
  Component,
  EventEmitter,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  ElementRef
} from "@angular/core";

import * as L from "leaflet";
import * as LX from "./invert-selection";

import {MapService} from "./map.service";
import LayerData from "./layer-data";

/**
 * GeoJSON data type used by Leaflet.
 * @private
 */
type GeoJsonObject = Parameters<typeof L["geoJSON"]>[0];

/**
 * Component for displaying maps.
 */
@Component({
  selector: "map",
  template: `
    <div class="map-container" [style.height]="height">
      <div #map class="map"></div>
    </div>
  `,
  styleUrls: [
    "./map.component.css"
  ]
})
export class MapComponent implements OnInit, AfterViewInit {

  /** The ref to the map html element. */
  @ViewChild("map") private mapElement!: ElementRef<HTMLDivElement>;

  /** Input for the height of the map. */
  @Input("height") inputHeight?: string;
  /** Height of map, defaults to 500px. */
  height = "500px";

  /** Input for the tile url of the map. */
  @Input("tileUrl") inputTileUrl?: string;
  /** Tile url of the map, defaults to the osm. */
  tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  /** Input for the center coordinates of the map. */
  @Input("center") inputCenter?: string;
  /** Center of the map, defaults to longitude and latitude of Oldenburg. */
  center = "53.1434501, 8.2145521";

  /** Input for the map zoom level. */
  @Input("zoom") inputZoom?: string;
  /** Zoom level of the map, defaults to 7. */
  zoom = 7;

  /**
   * Input for the layers that should be displayed.
   *
   * The record expects as the key the `layer_name` and as the value an array
   * of `layer_resolutions`.
   *
   * @example
   * ```html
   * <map
   *   height="70vh"
   *   [layers]="{'lower-saxony': ['municipalities', 'districts', 'regions']}"
   * ></map>
   * ```
   *
   * @see https://wisdom04.vlba.uni-oldenburg.de/repos/service-geo-data-rest/main/api/get-layer
   */
  @Input("layers") layers?: Record<string, string[]>

  /** Layer data fetching the map data. */
  private layerData?: Promise<Record<string, Record<string, LayerData[]>>>

  /** Input for a hex code for unselected shapes. */
  @Input("unselectedColor") unselectedColor = "#1f5aec";
  /** Input for a hex code selected shapes. */
  @Input("selectedColor") selectedColor = "#d35a0c";

  /** The leaflet map that is displayed here. */
  map?: L.Map;

  /**
   * Internally holds all elements that are currently selected.
   *
   * Keys: `"layer_name.resolution.shape"`
   * Values: `[layer_name, resolution, shape]`
   * @private
   */
  private selectedShapes: Record<string, [string, string, string]> = {};

  /**
   * The currently selected layer in the map control.
   * @private
   */
  private selectedLayer?: [string, string];

  /** Outputs the currently selected shapes. */
  @Output() selected = new EventEmitter<{
    layerName: string,
    resolution: string,
    keys: string[],
  }>();

  /**
   * Constructor.
   * @param service Service to interact with the server for geo data
   */
  constructor(private service: MapService) {}

  /**
   * While init this sets the input values to the inner, private values.
   */
  ngOnInit(): void {
    if (this.inputHeight) this.height = this.inputHeight;
    if (this.inputTileUrl) this.tileUrl = this.inputTileUrl;
    if (this.inputCenter) this.center = this.inputCenter;
    if (this.inputZoom) this.zoom = parseInt(this.inputZoom);
    if (this.layers) {
      this.layerData = new Promise(async (resolve, reject) => {
        let layerData: Awaited<MapComponent["layerData"]> = {};
        let requests: Promise<any>[] = [];
        for (let [layerName, resolutions] of Object.entries(this.layers!)) {
          layerData[layerName] = {};
          for (let resolution of resolutions) {
            requests.push(
              this.service.fetchLayerData(layerName, resolution)
                .then(data => layerData![layerName][resolution] = data)
            );
          }
        }
        Promise.all(requests)
          .then(() => resolve(layerData!))
          .catch(e => reject(e));
      });
    }
  }

  /**
   * Renders the map with the given input values.
   */
  ngAfterViewInit(): void {
    const nativeMapElement = this.mapElement.nativeElement;

    const map = L.map(nativeMapElement, {
      center: this.center
        .split(", ")
        .map(str => parseFloat(str)) as [number, number],
      zoom: this.zoom
    });
    map.getRenderer(map as any).options.padding = 100;

    L.tileLayer(this.tileUrl).addTo(map);

    this.map = map;

    if (this.layerData) {
      // control to select which base layer to use
      let control = L.control.layers();
      let layers: L.Layer[] = [];

      this.layerData.then(layerData => {
        // this promise is started in the init part, but is needed here

        let baseLayerDisplayed = false;

        for (let [layerName, resolutions] of Object.entries(layerData)) {
          for (let [resolution, shapes] of Object.entries(resolutions)) {

            // put the geojson in a single layer to optimize runtime of the map
            let geoJsonLayer = L.geoJSON(undefined, {
              style: {color: this.unselectedColor},
              onEachFeature: (feature, layer) => {
                // TODO: make automatic tooltips
                layer.bindTooltip(feature.properties.name, {
                  direction: "center"
                });

                layer.on("click", () => {
                  let value = [layerName, resolution, feature.properties.name];
                  let key = feature.properties.key;

                  let path = layer as L.Path;

                  // highlight the clicked on shape and add it to the selection
                  // if already in the selection, unselect
                  if (this.selectedShapes[key]) {
                    path.setStyle({
                      color: this.unselectedColor
                    });
                    path.bringToBack();
                    delete this.selectedShapes[key];
                  }
                  else {
                    path.setStyle({
                      color: this.selectedColor
                    });
                    path.bringToFront();
                    this.selectedShapes[key] = value as [string, string, string];
                  }

                  // selecting a shape should update the output
                  this.emitSelection();
                });

                layers.push(layer);
              }
            });

            for (let {name, key, geojson} of shapes) {
              // assign the name as a property in the shape to allow its usage
              // in the click handler
              geoJsonLayer.addData(Object.assign(geojson!, {properties: {name, key}}));
            }

            if (!baseLayerDisplayed) {
              // the first base layer should be the default
              geoJsonLayer.addTo(map);
              baseLayerDisplayed = true;
              this.selectedLayer = [layerName, resolution];
            }

            // TODO: use names here than can be translated
            control.addBaseLayer(geoJsonLayer, `${layerName}: ${resolution}`);

            map.on("baselayerchange", data => {
              // check if the current layer is selected, this preffered over the
              // name, since the name might change caused by translation efforts
              let {layer} = data as L.LayersControlEvent;
              if (layer == geoJsonLayer) {
                this.selectedLayer = [layerName, resolution];
                this.emitSelection();
              }
            });
          }
        }
      });

      control.addTo(map);
      LX.control.invertSelection(() => {
        for (let layer of layers) {
          layer.fire("click");
        }
      }).addTo(map);
    }
  }

  /**
   * Internally used function to emit the currently selected shapes via the
   * {@link selected} output.
   * @private
   */
  private emitSelection(): void {
    let [layerName, resolution] = this.selectedLayer!;
    let keys = Object.entries(this.selectedShapes)
      .map(([key, values]) => [...values, key])
      .filter(([elLayerName, elResolution]) => {
        return elLayerName == layerName && elResolution == resolution;
      })
      .map(([layerName, resolution, shape, key]) => key);
    this.selected.emit({
      layerName,
      resolution,
      keys
    });
  }
}

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
import {BehaviorSubject, firstValueFrom, Subject} from "rxjs";

import * as L from "leaflet";

import {MapService} from "./map.service";
import LayerData from "./layer-data";
import {Resolution} from "./resolution";
import {Marker} from "./marker";

import * as LX from "./invert-selection";

import "leaflet.markercluster";
import {TranslateService} from "@ngx-translate/core";

/** Type alias to enforce the meaning of the layer keys. */
type LayerKey = string;

/** A layer config for the input of {@link MapComponent.inputLayers}. */
type LayerConfig = Record<LayerKey, [string, Resolution | null, string[] | null]>;

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
   * Input for the option if the map should scroll zoom on mouse scroll.
   * If "center" is passed, the map will always zoom onto the center.
   */
  @Input("scrollWheelZoom") inputScrollWheelZoom: boolean | "center" = true;

  /** Input for a hex code for unselected shapes. */
  @Input("unselectedColor") unselectedColor = "#1f5aec";
  /** Input for a hex code selected shapes. */
  @Input("selectedColor") selectedColor = "#d35a0c";

  /**
   * Input for the layers that should be displayed.
   *
   * The key of the record is layer key and is also emitted on the selection.
   * The value of the record is an array and the values of that should be the
   * following:
   * <ol>
   *   <li>
   *     The name of the layer, this will be only used to display a name of
   *     the layer (may also be a translation key).
   *   </li>
   *   <li>
   *     This should be the resolution to display the layer at, this may also
   * be
   *     null to display the keys directly without any shape intersection
   *     resolving.
   *   </li>
   *   <li>
   *     These should be the keys used to display the shapes from.
   *     If the given keys are empty or null, this will display everything from
   *     the give resolution.
   *   </li>
   * </ol>
   *
   * **Attention**: The service needs at least one of the resolution or the
   * keys
   * to properly respond.
   *
   * @example
   * ```html
   * <map
   *   height="70vh"
   *   [layers]="{
   *     full_res: ['All of municipal resolution', Resolution.MUNICIPAL, null],
   *     only_keys: ['Only show exactly these', null, ['01', '034030000000']],
   *     mixed: ['Show district resolution', Resolution.DISTRICT, ['01',
   *   '034030000000']]
   *   }"
   * ></map>
   * ```
   * // TODO: update link when geo data docs update
   * @see https://wisdom04.vlba.uni-oldenburg.de/repos/service-geo-data-rest/main/api/get-layer
   */
  @Input("layers")
  set inputLayers(layerConfig: LayerConfig) {
    this.layerConfig.next(layerConfig);
  };
  /**
   * {@link Subject} of the {@link LayerConfig}, to be used as
   * {@link Observable}.
   * @private
   */
  private layerConfig: BehaviorSubject<LayerConfig> = new BehaviorSubject({});
  /**
   * {@link Subject} of the pairs of {@link Layerkey} and {@link LayerData},
   * to be used as {@link Observable}.
   * @private
   */
  private layerData: BehaviorSubject<Record<LayerKey, LayerData>> = new BehaviorSubject({});
  /**
   * {@link Subject} of the layer names mapped by the {@link LayerKey}.
   * @private
   */
  private layerNames: Record<LayerKey, string> = {};

  /** Should the layers be selectable. */
  @Input("layerSelectable") inputLayerSelectable: boolean = true;

  /** Markers that should be displayed on the map. */
  @Input("markers") set inputMarkers(markers: Marker[]) {
    this.markers.next(markers);
  };
  /** {@link Marker}s {@link Subject} to be used as {@link Observable}. */
  private markers = new BehaviorSubject<Marker[]>([]);

  /** The leaflet map that is displayed here. */
  map?: L.Map;

  /**
   * Internally holds all elements that are currently selected.
   *
   * The set holds all keys of shapes currently selected.
   */
  private selectedShapes: Record<LayerKey, Set<string>> = {};

  /**
   * The currently selected layer in the map control.
   * @private
   */
  private selectedLayer?: LayerKey;
  /** The currently selected geo json layer. */
  private selectedGeoJsonLayer?: L.Layer;

  /** Outputs the currently selected shapes. */
  @Output() selected = new EventEmitter<{
    layer: LayerKey,
    name: string,
    keys: string[],
  }>();

  /**
   * Constructor.
   * @param service Service to interact with the server for geo data
   * @param translate Translation service to update resolution names
   */
  constructor(
    private service: MapService,
    private translate: TranslateService
  ) {}

  /**
   * While init this sets the input values to the inner, private values.
   */
  ngOnInit(): void {
    if (this.inputHeight) this.height = this.inputHeight;
    if (this.inputTileUrl) this.tileUrl = this.inputTileUrl;
    if (this.inputCenter) this.center = this.inputCenter;
    if (this.inputZoom) this.zoom = parseInt(this.inputZoom);

    this.layerConfig.subscribe(async config => {
      let layerData = {};
      let requests: Record<LayerKey, Promise<LayerData>> = {};
      for (
        let [layerKey, [displayName, resolution, keys]]
        of Object.entries(config)
      ) {
        this.layerNames[layerKey] = displayName;
        requests[layerKey] = this.service.fetchLayerData(
          resolution,
          keys?.map(k => k.split(" ").join(""))
        );
      }
      let fetched: Record<LayerKey, LayerData> = {};
      for (let [layerKey, data] of Object.entries(requests)) {
        fetched[layerKey] = await data;
      }
      this.layerData.next(fetched);
    });
  }

  /**
   * Renders the map with the given input values.
   */
  ngAfterViewInit(): void {
    const nativeMapElement = this.mapElement.nativeElement;

    const map = L.map(nativeMapElement, {
      scrollWheelZoom: this.inputScrollWheelZoom,
      center: this.center
        .split(", ")
        .map(str => parseFloat(str)) as [number, number],
      zoom: this.zoom
    });
    map.getRenderer(map as any).options.padding = 100;

    L.tileLayer(this.tileUrl).addTo(map);

    this.map = map;
    let layersControl: L.Control.Layers;
    // TODO: make a clear type from this
    let invertSelectionControl: any;

    this.layerData.subscribe(async layerData => {
      let displayLayer = true;

      // reset selected data
      this.selectedShapes = {};

      if (layersControl) map.removeControl(layersControl);
      layersControl = L.control.layers();
      // layer index to allow sorting by it
      // this allows updating the names without having to worry about layer
      // shuffling
      let layerIndex = 0;
      layersControl.options.sortLayers = true;
      layersControl.options.sortFunction = (layerA, layerB) => {
        // @ts-ignore these orders are injected here to allow fixed ordering
        return layerA.options.order - layerB.options.order;
      }
      let layers: L.Layer[] = [];

      if (this.selectedGeoJsonLayer) map.removeLayer(this.selectedGeoJsonLayer);

      // update map with new layer data
      for (let [key, data] of Object.entries(layerData)) {
        let selectedShapes = this.selectedShapes[key] = new Set();
        // use for every layer a new geoJSON layer
        let geoJsonLayer = L.geoJSON(undefined, {
          // @ts-ignore insert order here to allow fixed ordering when updating
          // translation
          order: layerIndex++,
          attribution: `
            <a target="_blank" href='https://gdz.bkg.bund.de/index.php/default/open-data/verwaltungsgebiete-1-5-000-000-ebenen-stand-01-01-vg5000-ebenen-01-01.html'>
              📐 © GeoBasis-DE / BKG 2022
            </a>
            |
            <a target="_blank" href="http://www.govdata.de/dl-de/by-2-0">
              🔖 dl-de/by-2-0
            </a>
          `,
          style: {color: this.unselectedColor},
          onEachFeature: (feature, layer) => {
            // used properties are injected later into the feature
            layer.bindTooltip(feature.properties.name, {direction: "center"});
            if (this.inputLayerSelectable) {
              layer.on("click", () => {
                let [key, path] = [feature.properties.key, layer as L.Path];
                if (selectedShapes.has(key)) {
                  path.setStyle({color: this.unselectedColor});
                  path.bringToBack();
                  selectedShapes.delete(key);
                }
                else {
                  path.setStyle({color: this.selectedColor});
                  path.bringToFront();
                  selectedShapes.add(key);
                }
                this.emitSelection();
              });
            }
            layers.push(layer);
          }
        });
        for (let shape of data.shapes) {
          geoJsonLayer.addData(Object.assign(shape.geoJson, {properties: {
            name: shape.name,
            key: shape.key
          }}));
          if (displayLayer) {
            geoJsonLayer.addTo(map);
            displayLayer = false;
            this.selectedLayer = key;
            this.selectedGeoJsonLayer = geoJsonLayer;
            map.fitBounds([
              data.box[0],
              data.box[2]
            ]);
          }
        }
        this.translate.onLangChange.subscribe(() => {
          layersControl.removeLayer(geoJsonLayer);
          layersControl.addBaseLayer(
            geoJsonLayer,
            this.translate.instant(this.layerNames[key])
          );
        });
        let layerName = await firstValueFrom(
          this.translate.get(this.layerNames[key])
        );
        layersControl.addBaseLayer(geoJsonLayer, layerName);
        map.on("baselayerchange", ({layer}) => {
          if (layer == geoJsonLayer) {
            this.selectedGeoJsonLayer = layer;
            this.selectedLayer = key;
            this.emitSelection();
          }
        })
      }
      if (Object.keys(layerData).length > 1) layersControl.addTo(map);

      if (this.inputLayerSelectable) {
        if (invertSelectionControl) map.removeControl(invertSelectionControl);
        invertSelectionControl = LX.control.invertSelection(() => {
          for (let layer of layers) {
            layer.fire("click");
          }
        });
        invertSelectionControl.addTo(map);
      }
    });

    let markerLayer = L.markerClusterGroup();
    this.markers.subscribe(markers => {
      markerLayer.removeFrom(map);
      markerLayer = L.markerClusterGroup();
      for (let marker of markers) {
        let lMarker = L.marker(marker.coordinates);
        if (marker.icon) lMarker.setIcon(marker.icon);
        if (marker.tooltip) lMarker.bindTooltip(marker.tooltip);
        if (marker.onClick) lMarker.on("click", marker.onClick)
        lMarker.addTo(markerLayer);
      }
      markerLayer.addTo(map);
    });
  }

  /**
   * Internally used function to emit the currently selected shapes via the
   * {@link selected} output.
   * @private
   */
  private emitSelection(): void {
    let layerKey = this.selectedLayer!;
    let layerName = this.layerNames[layerKey]!;
    let keys = Array.from(this.selectedShapes[layerKey]);
    this.selected.emit({
      layer: layerKey,
      name: layerName,
      keys
    });
  }
}

import {
  ViewChild,
  Component,
  OnInit,
  AfterViewInit,
  Input,
  ElementRef
} from "@angular/core";

import * as L from "leaflet";

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
  center = "54.2957397, 10.8919582";

  /** Input for the map zoom level. */
  @Input("zoom") inputZoom?: string;
  /** Zoom level of the map, defaults to 7. */
  zoom = 7;

  /** The leaflet map that is displayed here. */
  map?: L.Map;

  /**
   * While init this sets the input values to the inner, private values.
   */
  ngOnInit(): void {
    if (this.inputHeight) this.height = this.inputHeight;
    if (this.inputTileUrl) this.tileUrl = this.inputTileUrl;
    if (this.inputCenter) this.center = this.inputCenter;
    if (this.inputZoom) this.zoom = parseInt(this.inputZoom);
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

    L.tileLayer(this.tileUrl).addTo(map);

    this.map = map;
  }
}

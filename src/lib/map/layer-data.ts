import * as L from "leaflet";

/**
 * GeoJSON data type used by Leaflet.
 * @private
 */
export type GeoJsonObject = Parameters<typeof L["geoJSON"]>[0];
/** Type to represent layer data received from the geo data server. */
export interface ShapeData {
  name: string,
  key: string,
  nutsKey: string,
  geoJson: GeoJsonObject
};

export interface LayerData {
  box: [[number, number], [number, number], [number, number], [number, number]],
  shapes: ShapeData[]
};

export default LayerData;

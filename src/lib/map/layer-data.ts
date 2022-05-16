import * as L from "leaflet";

/**
 * GeoJSON data type used by Leaflet.
 * @private
 */
type GeoJsonObject = Parameters<typeof L["geoJSON"]>[0];
/** Type to represent layer data received from the geo data server. */
interface LayerData {
  name: string,
  key: string,
  geojson: GeoJsonObject
}[];

export default LayerData;

import * as L from "leaflet";
import {GeoJsonObject} from "geojson";

/** Type to represent a single shape with all of its metadata. */
export interface ShapeData {
  /** Name of the shape. */
  name: string,
  /** Key of the shape. */
  key: string,
  /** Nomenclature of Territorial Units code of the shape. */
  nutsKey: string,
  /** GeoJson representing the shape. */
  geoJson: GeoJsonObject
}

/** Type to represent layer data received from the geo data server. */
export interface LayerData {
  /** Corner coordinates of a box containing all the shapes this displays. */
  box: [[number, number], [number, number], [number, number], [number, number]],
  /** List of shapes. */
  shapes: ShapeData[]
}

export default LayerData;

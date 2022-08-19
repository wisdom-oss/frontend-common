import {Content, LeafletMouseEvent, Layer, Tooltip} from "leaflet";

import * as L from "leaflet";

/** Marker interface for creating custom markers on a {@link MapComponent}. */
export interface Marker {
  /** Coordinates of the marker. */
  coordinates: [number, number],
  /** Displayed tooltip when hovering the marker. */
  tooltip?: Content | ((layer: Layer) => Content) | Tooltip,
  /** Event handler for a click on the marker. */
  onClick?: (evt: LeafletMouseEvent) => void,
  /** Optional icon for the marker, if not set a default one will be used. */
  icon?: L.Icon | L.DivIcon
}

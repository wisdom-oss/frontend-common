import {Content, LeafletMouseEvent, Layer, Tooltip} from "leaflet";

import * as L from "leaflet";

export interface Marker {
  coordinates: [number, number],
  tooltip?: Content | ((layer: Layer) => Content) | Tooltip,
  onClick?: (evt: LeafletMouseEvent) => void,
  icon?: L.Icon | L.DivIcon
}

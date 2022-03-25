/** Type to represent layer data received from the geo data server. */
type LayerData = {
  name: string,
  geojson: object
}[];

export default LayerData;

import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams
} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {openDB, DBSchema} from "idb";
import {firstValueFrom} from "rxjs";

import {Resolution} from "./resolution";
import {LayerData, ShapeData, GeoJsonObject} from "./layer-data";
import {USE_API_URL} from "../http-context/use-api-url";
import {USE_LOADER} from "../http-context/use-loader";

const API_URL = "geodata";
const DB_NAME = "map-db";
const SCHEMA_V = 1;

/** The schema the map db uses. */
interface MapDB extends DBSchema {
  /**
   * All cached queries, used to identify if a query is already in the db.
   *
   * The key[0] represents the resolution of the query, a -1 represents no
   * resolution.
   * The rest are the given keys.
   *
   * The value is an array of all the keys the query returned.
   */
  queries: {
    key: [number, ...string[]],
    value: string[]
  },

  /**
   * All shapes in the indexed db.
   *
   * The key is the key of the shape.
   *
   * The value is some {@link ShapeData}.
   * Since {@link LayerData} is simply an array of {@link ShapeData}, this may
   * be used to reconstruct some layer data.
   */
  shapes: {
    key: string,
    value: ShapeData
  }
}

/**
 * Service to interact with the geo data api to fetch map data.
 *
 * Fetched map data is cached in the indexedDB and therefore only retrieved
 * lazily.
 */
@Injectable({
  providedIn: 'root'
})
export class MapService {

  private readonly idb;

  /**
   * Constructor.
   * @param http Client to request geo data
   */
  constructor(private http: HttpClient) {
    this.idb = openDB<MapDB>(DB_NAME, SCHEMA_V, {
      upgrade(db) {
        db.createObjectStore("queries");
        db.createObjectStore("shapes");
      }
    });
  }

  /**
   * Asynchronously fetch the map from the geo data rest api.
   *
   * Will only fetch data if not already stored in the indexedDB.
   * @param resolution The resolution the of the shapes returned by the service
   * @param keys The keys given to look for shapes
   * @param force If true, this will ignore the cache and request everything
   */
  async fetchLayerData(
    resolution: Resolution | null | undefined,
    keys?: string[] | null,
    force: boolean = false
  ): Promise<LayerData> {
    // prepare db and keys
    let idb = await this.idb;
    let trimmedKeys = keys ?? [];
    let resolutionNum = resolution ? Resolution.toKeyLength(resolution) : -1;
    let queryKey = [resolutionNum, ...trimmedKeys] as [number, ...string[]];

    // check for cached keys or ignore if is force is true
    let cachedKeys = force ? undefined : await idb.get("queries", queryKey);
    if (cachedKeys) {
      let tx = idb.transaction("shapes", "readonly");
      let store = tx.objectStore("shapes");
      let shapes: ShapeData[] = [];
      let operations = [];
      for (let key of cachedKeys) {
        operations.push(store.get(key).then(shape => {
          if (shape) shapes.push(shape);
        }));
      }
      operations.push(tx.done);
      await Promise.all(operations);
      return shapes;
    }

    // if cachedKeys was empty, request data from the server
    let params = new HttpParams();
    if (resolution) params = params.set("resolution", resolution);
    if (keys && keys.length) params = params.appendAll({key: keys.map(k => {
      if (resolution) return k.substring(0, resolutionNum);
      return k;
    })});

    let layerData: LayerData = (await firstValueFrom(this.http.get<{
      name: string,
      key: string,
      nuts_key: string,
      geojson: GeoJsonObject
    }[]>(`${API_URL}/`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      }),
      params,
      responseType: "json",
      context: new HttpContext()
        .set(USE_API_URL, true)
        .set(USE_LOADER, true)
    })) ?? []).map(rawShape => ({
      nutsKey: rawShape.nuts_key,
      geoJson: rawShape.geojson,
      ...rawShape
    }));

    // store the requested data back into the db
    let tx = idb.transaction(["queries", "shapes"], "readwrite");
    let operations = [];
    let shapeStore = tx.objectStore("shapes");
    let shapeKeys = [];
    for (let shape of layerData) {
      operations.push(shapeStore.put(shape, shape.key));
      shapeKeys.push(shape.key);
    }
    let queryStore = tx.objectStore("queries");
    operations.push(queryStore.put(shapeKeys, queryKey));
    await Promise.all(operations);

    return layerData;
  }

}

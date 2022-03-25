import {HttpClient, HttpContext, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {firstValueFrom} from "rxjs";

import * as idb from "idb-keyval";

import {USE_API_URL} from "../http-context/use-api-url";

const API_URL = "geodata-rest";

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

  /**
   * Constructor.
   * @param http Client to request geo data
   */
  constructor(private http: HttpClient) {}

  /**
   * Asynchronously fetch the map from the geo data rest api.
   *
   * Will only fetch data if not already stored in the indexedDB.
   * @param layerName The layer name to request data from
   * @param layerResolution The resolution to request shapes from
   * @param force If true, this will ignore the cache and request everything
   */
  async fetchLayerData(
    layerName: string,
    layerResolution: string,
    force: boolean = false
  ) {
    let dbKey = `MAP_LAYER_DATA:${layerName}:${layerResolution}`;
    if (!force && (await idb.keys()).includes(dbKey)) {
      return await idb.get(dbKey);
    }

    let url = encodeURI(`${API_URL}/${layerName}/${layerResolution}`);
    let layerData = await firstValueFrom(this.http.get(url, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      }),
      responseType: "json",
      context: new HttpContext().set(USE_API_URL, true)
    }));

    await idb.set(dbKey, layerData);
    return layerData;
  }

}

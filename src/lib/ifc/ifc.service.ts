import { Injectable } from '@angular/core';
import {DBSchema, openDB} from "idb";
import {HttpClient, HttpContext} from "@angular/common/http";
import {USE_LOADER} from "../http-context/use-loader";
import {firstValueFrom} from "rxjs";

/** Indexed DB name. */
const DB_NAME = "ifc-db";

/** Indexed DB schema version. */
const SCHEMA_V = 1;

/** The schema the ifc db uses. */
interface IfcDB extends DBSchema {
  /**
   * Cached IFC models.
   *
   * The key is the path where the model is found.
   *
   * The value is the raw bytes of the model stored as a Blob.
   */
  models: {
    key: string,
    value: Blob
  }
}

/**
 * Service to lazily fetch IFC models.
 * The fetch will try to load from the local indexed db first.
 */
@Injectable({
  providedIn: 'root'
})
export class IfcService {

  /** Indexed DB client. */
  private readonly idb;

  /**
   * Constructor.
   * @param http Client to request geo data
   */
  constructor(private http: HttpClient) {
    this.idb = openDB<IfcDB>(DB_NAME, SCHEMA_V, {
      upgrade(db, oldV) {
        if (oldV) db.deleteObjectStore("models");
        db.createObjectStore("models");
      }
    });
  }

  /**
   * Asynchronously fetch IFC models.
   *
   * Will only fetch data if not already stored in the indexedDB.
   * @param path The path where to download model from, will also be the cache key
   * @param force If true, this will ignore the cache and request everything
   */
  async fetchModel(path: string, force: boolean = false): Promise<File> {
    const idb = await this.idb;
    let dbBlob = force ? undefined : await idb.get("models", path);
    if (dbBlob) return new File([dbBlob], path);
    let res = await firstValueFrom(this.http.get(path, {
      responseType: "blob",
      context: new HttpContext().set(USE_LOADER, "common.ifc.fetching")
    }));
    await idb.put("models", res, path);
    return new File([res], path);
  }
}

import { Injectable } from '@angular/core';
import {DBSchema, openDB} from "idb";
import {HttpClient, HttpContext} from "@angular/common/http";
import {USE_LOADER} from "../http-context/use-loader";
import {firstValueFrom} from "rxjs";

const DB_NAME = "ifc-db";

const SCHEMA_V = 1;

interface IfcDB extends DBSchema {
  models: {
    key: string,
    value: Blob
  }
}

@Injectable({
  providedIn: 'root'
})
export class IfcService {

  private readonly idb;

  constructor(private http: HttpClient) {
    this.idb = openDB<IfcDB>(DB_NAME, SCHEMA_V, {
      upgrade(db, oldV) {
        if (oldV) db.deleteObjectStore("models");
        db.createObjectStore("models");
      }
    });
  }

  async fetchModel(path: string, force: boolean = false): Promise<File> {
    const idb = await this.idb;
    let dbBlob = force ? undefined : await idb.get("models", path);
    if (dbBlob) return new File([dbBlob], path);
    let res = await firstValueFrom(this.http.get(path, {
      responseType: "blob",
      context: new HttpContext().set(USE_LOADER, "fetching model files")
    }));
    await idb.put("models", res, path);
    return new File([res], path);
  }
}

import { Injectable } from '@angular/core';
import {HttpClient, HttpContext} from "@angular/common/http";
import {firstValueFrom} from "rxjs";
import {USE_LOADER} from "../http-context/use-loader";
import {USE_BASE_URL} from "../http-context/use-base-url";

@Injectable({
  providedIn: 'root'
})
export class BimService {

  constructor(private http: HttpClient) {}

  fetchModel(fileLink: string): Promise<Blob> {
    let context = new HttpContext()
      .set(USE_LOADER, "common.bim.fetching")
      .set(USE_BASE_URL, true);
    return firstValueFrom(this.http.get(fileLink, {
      responseType: "blob",
      context
    }));
  }
}

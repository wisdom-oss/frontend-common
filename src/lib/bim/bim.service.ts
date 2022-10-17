import { Injectable } from '@angular/core';
import {HttpClient, HttpContext} from "@angular/common/http";
import {firstValueFrom} from "rxjs";
import {USE_LOADER} from "../http-context/use-loader";

@Injectable({
  providedIn: 'root'
})
export class BimService {

  constructor(private http: HttpClient) {}

  fetchModel(fileLink: string): Promise<Blob> {
    let context = new HttpContext();
    context.set(USE_LOADER, "common.bim.loading");
    return firstValueFrom(this.http.get(fileLink, {
      responseType: "blob",
      context
    }));
  }
}

import { HttpClient, HttpContext, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {USE_API_URL} from "../http-context/use-api-url";
import {USE_LOADER} from "../http-context/use-loader";
import { GeoJsonObject, Feature, Geometry } from 'geojson';

/** API url for the map to request data from. */
const API_URL = "geodata";

@Injectable({
  providedIn: 'root'
})
export class Map2Service {

  constructor(private http: HttpClient) {}

  async fetchAvailableLayers(): Promise<LayerInfo[] | null> {
    let res: HttpResponse<LayerInfo[] | null> = await firstValueFrom(
      this.http.get<LayerInfo[] | null>(
        `${API_URL}/`, 
        { 
          observe: "response", 
          responseType: "json", 
          context: new HttpContext().set(USE_API_URL, true)
        }
      )
    );

    switch (res.status) {
      case 200: return res.body;
      case 204: return null;
      default: throw new HttpErrorResponse({
        error: `Unexpected status ${res.status}`,
        headers: res.headers,
        status: res.status,
        statusText: res.statusText,
      });
    }
  }

  async fetchLayerInfo(layerRef: LayerRef): Promise<LayerInfo | null> {
    try {
      return await firstValueFrom(this.http.get<LayerInfo>(
        `${API_URL}/${layerRef}`, 
        {
          responseType: "json",
          context: new HttpContext().set(USE_API_URL, true)
        }
      ));
    }
    catch (e) {
      if (e instanceof HttpErrorResponse && e.status == 404) return null;
      throw e;
    }
  }

  async fetchLayerContents(
    layerRef: LayerRef,
    cache: boolean = true,
    filter?: LayerFilter
  ): Promise<LayerContent[] | null> {
    const options = {
      responseType: "json",
      context: new HttpContext()
        .set(USE_API_URL, true)
        .set(USE_LOADER, true),
    } as const;
    
    try {
      if (filter) {
        return await firstValueFrom(this.http.post<LayerContent[] | null>(
          `${API_URL}/content/${layerRef}`, 
          filter,
          options
        ));  
      }

      return await firstValueFrom(this.http.get<LayerContent[] | null>(
        `${API_URL}/content/${layerRef}`,
        options
      ));
    }
    catch (e) {
      if (e instanceof HttpErrorResponse && e.status == 404) return null;
      throw e;
    }
  }

  static layerContentToFeature(layerContent: LayerContent): Feature {
    return {
      type: "Feature",
      geometry: layerContent.geometry as Geometry,
      id: layerContent.key,
      properties: {
        name: layerContent.name,
        ...layerContent.additionalProperties
      }
    };
  }
}

export type LayerId = string;
export type LayerKey = string;
export type LayerRef = LayerId | LayerKey;
export type LayerFilterOperator = "contains" | "overlaps" | "within";
export type ShapeKey = string;
export type LayerFilter = Record<
  LayerFilterOperator, 
  Record<LayerId, ShapeKey[]>
>;

export interface LayerInfo {
  id: LayerId,
  key: LayerKey,
  name: string,
  description: string,
  /** The EPSG code for the coordinate reference system used in the layer. **/
  crs: number,
  attribution?: string
}

export interface LayerContent {
  name: string,
  key: ShapeKey,
  additionalProperties: object,
  geometry: GeoJsonObject
}

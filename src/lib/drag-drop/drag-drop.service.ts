import {HttpClient, HttpContext} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

import {USE_API_URL} from "../http-context/use-api-url";
import {USE_LOADER} from "../http-context/use-loader";
import {USE_ERROR_HANDLER} from "../http-context/use-error-handler";


@Injectable({
  providedIn: "root",
})
export class DragDropService {
  constructor(private http: HttpClient) { }

  /**
   * httpContext with base values, in order to prevent the request from having no context at all.
   */
  httpBaseContext: HttpContext = new HttpContext()
    .set(USE_API_URL, true)
    .set(USE_LOADER, false)
    .set(USE_ERROR_HANDLER, 1);


  /* 
  adds all files to a formdata object, sends post request and returns res
  @param files: a list of files to be uploaded
  @param apiUrL: the URL where to upload the files to
  @param listName: name of the fileList to identify it at the server side
  @param httpContext: a context for extra functionality regarding the http-context component in common
  */
  postFiles(files: File[], apiUrl?: string, listName?: string, httpContext?: HttpContext): Observable<any> {

    let formData: FormData = new FormData();

    if (!files) {
      return this.handleError("There are no files to upload");
    }

    if (!apiUrl) {
      return this.handleError("No URL provided");
    }

    if (!listName) {
      return this.handleError("No name provided for the list of files");
    } else {
      for (let file of files) {
        formData.append(listName, file);
      }
    }

    let ctx;
    if (!httpContext) {
      ctx = this.httpBaseContext;
      console.log("BaseHttpContext provided automatically")
    } else {
      ctx = httpContext;
    }

    return this.http.post(apiUrl, formData, {
      responseType: "text",
      context: ctx
    });

  }

  /**
     * creates an Observable with an error to subscribe to it and logs the information in the console.
     * @param msg error meesage
     * @returns observable with contained error.
     */
  handleError(msg: string): Observable<any> {

    return new Observable((observer) => {
      observer.error(new Error(msg));
    });
  }
}

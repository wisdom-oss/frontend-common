import { Injectable } from "@angular/core";
import { HttpClient, HttpContext } from "@angular/common/http";
import { USE_API_URL } from "../http-context/use-api-url";
import { USE_LOADER } from "../http-context/use-loader";

@Injectable({
  providedIn: "root",
})
export class DragDropService {
  constructor(private http: HttpClient) {}

  /**
   * httpContext with base values, in order to prevent the request from having no context at all.
   */
  httpBaseContext: HttpContext = new HttpContext()
    .set(USE_API_URL, true)
    .set(USE_LOADER, true);

  /**
   * adds all files to a formdata object, sends post request and returns response
   * @param files array of files to be uploaded
   * @param apiUrl URL where to upload the files to
   * @param valueName name of the value to identify it at the server side
   * @param httpContext extra context to control interceptor behavior
   * @returns
   */
  postFiles(
    files: File[],
    apiUrl: string,
    valueName: string,
    httpContext?: HttpContext
  ) {
    let formData: FormData = new FormData();

    for (let file of files) {
      formData.append(valueName, file);
    }

    let ctx;

    // decide if a new context was given or base context gets used
    if (httpContext) {
      ctx = httpContext;
    } else {
      ctx = this.httpBaseContext;
    }

    // send post request, alter responsetype and use a context
    let res = this.http.post(apiUrl, formData, {
      responseType: "text",
      context: ctx,
    });

    return res;
  }
}

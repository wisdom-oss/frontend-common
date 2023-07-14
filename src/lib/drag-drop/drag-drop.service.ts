import { Injectable } from "@angular/core";
import { HttpClient, HttpContext } from "@angular/common/http";
import { USE_API_URL } from "../http-context/use-api-url";
import { USE_LOADER } from "../http-context/use-loader";
import { USE_BASE_URL } from "../http-context/use-base-url";

@Injectable({
  providedIn: "root",
})
export class DragDropService {
  constructor(private http: HttpClient) {}

  /* 
  adds all files to a formdata object, sends post request and returns res
  @param files: a list of files to be uploaded
  @param api_urL: the URL where to upload the files to
  @param listName: name of the fileList to identify it at the server side
  */
  postFiles(
    files: File[],
    api_url: string,
    listName: string,
    httpContext?: HttpContext
  ) {
    let formData: FormData = new FormData();

    for (let file of files) {
      formData.append(listName, file);
    }

    let ctx = new HttpContext().set(USE_API_URL, true).set(USE_LOADER, true);

    let res = this.http.post(api_url, formData, {
      responseType: "text",
      context: ctx,
    });
    return res;
  }
}

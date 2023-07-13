import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

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
  postFiles(files: File[], api_url: string, listName: string) {
    let formData: FormData = new FormData();

    for (let file of files) {
      formData.append(listName, file);
    }

    let res = this.http.post(api_url, formData, {
      responseType: "text",
    });

    return res;
  }
}

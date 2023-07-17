import { Component, Input } from "@angular/core";
import { DragDropService } from "./drag-drop.service";
import { HttpContext } from "@angular/common/http";

@Component({
  selector: "drag-drop",
  templateUrl: "./drag-drop.component.html",
})
export class DragDropComponent {
  /**
   * determine the relative height of the drag-n-drop-field
   * @Input height the new height
   */
  @Input("height")
  height: string = "20vh";

  /**
   * determine the max amount of allowed files per upload
   * @Input file-limit new max amount
   */
  @Input("file-limit")
  fileLimit: number = 9;

  /**
   * determine the url, to which requests get forwarded to.
   * @Input: api-url the url
   */
  @Input("api-url")
  apiUrl: string = "";

  /**
   * send extra information regarding the http context with the request
   * @Input http-context new http context with self defined flags
   */
  @Input("http-context")
  httpContext: HttpContext | undefined;

  /**
   * set the name of the variable being uploaded in the formData object
   * @Input value-name name of the value
   */
  @Input("value-name")
  valueName: string = "";

  constructor(public dragdropService: DragDropService) {}

  /**
   * Array of Files, initiated to an empty array
   */
  fileArr: File[] = [];

  /**
   * flag to decide which view gets shown in the html
   */
  filesSelected = false;

  /**
   * transform an incoming event, check for max. amount of files, as well es duplicate files.
   * Set filesSelected to true and displays files
   * @param event coming from the drag-and-drop-directive or the input-field
   */
  submitCheck(event: any) {
    let files = this.transformEvent(event);

    if (this.checkAllowed(files.length)) {
      this.fileArr = this.fileArr.concat(this.checkForDuplicates(files));
      this.filesSelected = true;
    }
  }

  /**
   * transform an event to a Array of Files
   * @param event event to transform
   * @returns fileArray for continuous processing
   */
  transformEvent(event: any): Array<File> {
    let files: File[] = [];

    if (event.target.files) {
      files = Array.from(event.target.files);
    } else {
      if (event.dataTransfer.files) {
        files = Array.from(event.dataTransfer.files);
      }
    }

    return files;
  }

  /**
   * Help function to determine, if more then max amount of files are being transferred
   * @param fileLength number of new files coming in
   * @returns false if max amount of files in exceeded, else true
   */
  checkAllowed(fileLength: number): boolean {
    let hypothetical_files = this.fileArr.length + fileLength;

    if (hypothetical_files > this.fileLimit) {
      alert("Only " + this.fileLimit + " files allowed");
      return false;
    }

    return true;
  }

  /**
   * Checks the fileArr and the incoming files for duplicates in order to prevent them
   * @param files new files coming in
   * @returns an alert if a file is duplicate, Array of files else
   */
  checkForDuplicates(files: File[]): File[] {
    let selectList: File[] = [];

    files.forEach((file: File) => {
      if (
        this.fileArr.find(
          (selectedFile) =>
            selectedFile.name === file.name && selectedFile.size === file.size
        )
      ) {
        alert("Duplicate file found: " + file.name);
      } else {
        selectList.push(file);
      }
    });

    selectList = Array.from(selectList);

    return selectList;
  }

  /**
   * sets back the necessary variables after successful uploading
   */
  cleanUp(): void {
    this.fileArr = [];
    this.filesSelected = false;
  }

  /**
   * delete a file from the fileArr, used by the del-button.
   * switches view if fileArr is empty.
   * @param index index of the file in the file Array
   */
  deleteFile(index: number): void {
    this.fileArr.splice(index, 1);

    if (this.fileArr.length === 0) {
      this.cleanUp();
    }
  }

  /**
   * uploads the received files to the api, by the push of the submit button
   */
  upload() {
    // create a value holding the return status of the post request
    const upload = this.dragdropService.postFiles(
      this.fileArr,
      this.apiUrl,
      this.valueName,
      this.httpContext
    );

    // subscribe to the value to finish the request
    upload.subscribe({
      next: (response) => {
        console.log(response);
        alert(response);
        this.cleanUp();
      },
      // log the error and display an error alert
      error: (error) => {
        console.log(error);
        alert("Data submission failed");
      },
    });
  }
}

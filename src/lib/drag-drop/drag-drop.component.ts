import { Component, Input } from "@angular/core";
import { DragDropService } from "./drag-drop.service";

@Component({
  selector: "drag-drop",
  templateUrl: "./drag-drop.component.html",
})
export class DragDropComponent {
  // defines the vertical height of the component
  @Input("height")
  height: string = "20vh";

  // set the file limit to be uploaded in one session
  @Input("file-limit")
  fileLimit: number = 5;

  // set the url of the api to reach
  @Input("api-url")
  apiUrl: string = "";

  // set the valueName for the request to the api
  @Input("value-name")
  valueName: string = "";

  constructor(public dragdropService: DragDropService) {}

  // Array of files being displayed
  fileArr: File[] = [];

  // bool to change view for checking files
  filesSelected = false;

  // create array from files and change view
  submitCheck(event: any) {
    let files = this.transformEvent(event);

    if (this.checkAllowed(files.length)) {
      this.fileArr = this.fileArr.concat(this.checkForDuplicates(files));
      this.filesSelected = true;
    }
  }

  //transform event from drop or click to Array
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

  // check if number of files are allowed
  checkAllowed(fileLength: number): boolean {
    let hypothetical_files = this.fileArr.length + fileLength;

    if (hypothetical_files > this.fileLimit) {
      alert("Only " + this.fileLimit + " files allowed");
      return false;
    }

    return true;
  }

  /* 
  checks for duplicates before uploading to the server.
  returns an Array of the selected files
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

  cleanUp(): void {
    this.fileArr = [];
    this.filesSelected = false;
  }

  // delete a file from the fileArr
  deleteFile(index: number): void {
    this.fileArr.splice(index, 1);

    if (this.fileArr.length === 0) {
      this.cleanUp();
    }
  }

  // tries to upload a List of Files and subscribes to them
  upload() {
    // create a value holding the return status of the post request
    const upload = this.dragdropService.postFiles(
      this.fileArr,
      this.apiUrl,
      this.valueName
    );

    // subscribe to the value to finish the request
    upload.subscribe({
      next: (response) => {
        console.log(response);
        alert(response);
        this.cleanUp();
      },
      error: (error) => {
        console.log(error);
        alert("Data submission failed");
      },
    });
  }
}

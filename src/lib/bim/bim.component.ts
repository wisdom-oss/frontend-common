import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild
} from '@angular/core';
import {Viewer, ViewType} from "@xbim/viewer";

@Component({
  selector: 'bim',
  template: `
    <div #container style="width: 100%">
      <canvas #bim style="position: absolute"></canvas>
    </div>
  `
})
export class BimComponent implements AfterViewInit {

  @ViewChild("container") containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild("bim") canvasRef!: ElementRef<HTMLCanvasElement>;
  viewer!: Viewer;

  @Input("file") file?: string;
  @Input("aspect-ratio") aspectRatio: number = 16/9;

  private resizeObserver!: ResizeObserver;

  ngAfterViewInit(): void {
    // TODO: make use of this
    console.log(Viewer.check());
    let containerElement = this.containerRef.nativeElement;
    let canvasElement = this.canvasRef.nativeElement;
    this.viewer = new Viewer(canvasElement);

    // resize canvas according to container div
    this.resizeObserver = new ResizeObserver(entries => {
      canvasElement.width = entries[0].contentRect.width;
      canvasElement.height = canvasElement.width / this.aspectRatio;
      containerElement.style.height = canvasElement.height + "px";
    });
    this.resizeObserver.observe(containerElement);

    this.viewer.start();
    if (!this.file) return;
    this.viewer.load(this.file);
    this.viewer.on("loaded", args => {
      this.viewer.show(ViewType.DEFAULT).catch(e => console.error(e));
    });
  }

}

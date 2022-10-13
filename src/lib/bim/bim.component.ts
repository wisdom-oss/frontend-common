import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter,
  Input, Output,
  ViewChild
} from '@angular/core';
import {
  Viewer,
  ViewerInteractionEvent,
  ViewerLoadedEvent, ViewerPointerLockChangedEvent,
  ViewType
} from "@xbim/viewer";

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

  @Output() click = new EventEmitter<ViewerInteractionEvent>();
  @Output() contextmenu = new EventEmitter<ViewerInteractionEvent>();
  @Output() dblclick = new EventEmitter<ViewerInteractionEvent>();
  @Output() drag = new EventEmitter<ViewerInteractionEvent>();
  @Output() dragend = new EventEmitter<ViewerInteractionEvent>();
  @Output() dragenter = new EventEmitter<ViewerInteractionEvent>();
  @Output() dragleave = new EventEmitter<ViewerInteractionEvent>();
  @Output() dragover = new EventEmitter<ViewerInteractionEvent>();
  @Output() dragstart = new EventEmitter<ViewerInteractionEvent>();
  @Output() drop = new EventEmitter<ViewerInteractionEvent>();
  @Output() error = new EventEmitter<{message: string}>();
  @Output() fps = new EventEmitter<number>();
  @Output() gotpointercapture = new EventEmitter<ViewerInteractionEvent>();
  @Output() hoverpick = new EventEmitter<ViewerInteractionEvent>();
  @Output() loaded = new EventEmitter<ViewerLoadedEvent>();
  @Output() lostpointercapture = new EventEmitter<ViewerInteractionEvent>();
  @Output() mousedown = new EventEmitter<ViewerInteractionEvent>();
  @Output() mouseenter = new EventEmitter<ViewerInteractionEvent>();
  @Output() mouseleave = new EventEmitter<ViewerInteractionEvent>();
  @Output() mousemove = new EventEmitter<ViewerInteractionEvent>();
  @Output() mouseout = new EventEmitter<ViewerInteractionEvent>();
  @Output() mouseover = new EventEmitter<ViewerInteractionEvent>();
  @Output() mouseup = new EventEmitter<ViewerInteractionEvent>();
  @Output() mousewheel = new EventEmitter<ViewerInteractionEvent>();
  @Output() navigationEnd = new EventEmitter<boolean>();
  @Output() pick = new EventEmitter<ViewerInteractionEvent>();
  @Output() pointercancel = new EventEmitter<ViewerInteractionEvent>();
  @Output() pointerdown = new EventEmitter<ViewerInteractionEvent>();
  @Output() pointerenter = new EventEmitter<ViewerInteractionEvent>();
  @Output() pointerleave = new EventEmitter<ViewerInteractionEvent>();
  @Output() pointerlockchange = new EventEmitter<ViewerPointerLockChangedEvent>();
  @Output() pointerlockerror = new EventEmitter<ViewerPointerLockChangedEvent>();
  @Output() pointermove = new EventEmitter<ViewerInteractionEvent>();
  @Output() pointerout = new EventEmitter<ViewerInteractionEvent>();
  @Output() pointerover = new EventEmitter<ViewerInteractionEvent>();
  @Output() pointerup = new EventEmitter<ViewerInteractionEvent>();
  @Output() touchcancel = new EventEmitter<ViewerInteractionEvent>();
  @Output() touchend = new EventEmitter<ViewerInteractionEvent>();
  @Output() touchmove = new EventEmitter<ViewerInteractionEvent>();
  @Output() touchstart = new EventEmitter<ViewerInteractionEvent>();
  @Output() unloaded = new EventEmitter<ViewerLoadedEvent>();
  @Output() wheel = new EventEmitter<ViewerInteractionEvent>();

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

    this.hookEvents();
  }

  private hookEvents() {
    this.viewer.on("click", evt => this.click.emit(evt));
    this.viewer.on("contextmenu", evt => this.contextmenu.emit(evt));
    this.viewer.on("dblclick", evt => this.dblclick.emit(evt));
    this.viewer.on("drag", evt => this.drag.emit(evt));
    this.viewer.on("dragend", evt => this.dragend.emit(evt));
    this.viewer.on("dragenter", evt => this.dragenter.emit(evt));
    this.viewer.on("dragleave", evt => this.dragleave.emit(evt));
    this.viewer.on("dragover", evt => this.dragover.emit(evt));
    this.viewer.on("dragstart", evt => this.dragstart.emit(evt));
    this.viewer.on("drop", evt => this.drop.emit(evt));
    this.viewer.on("error", evt => this.error.emit(evt));
    this.viewer.on("fps", evt => this.fps.emit(evt));
    this.viewer.on("gotpointercapture", evt => this.gotpointercapture.emit(evt));
    this.viewer.on("hoverpick", evt => this.hoverpick.emit(evt));
    this.viewer.on("loaded", evt => this.loaded.emit(evt));
    this.viewer.on("lostpointercapture", evt => this.lostpointercapture.emit(evt));
    this.viewer.on("mousedown", evt => this.mousedown.emit(evt));
    this.viewer.on("mouseenter", evt => this.mouseenter.emit(evt));
    this.viewer.on("mouseleave", evt => this.mouseleave.emit(evt));
    this.viewer.on("mousemove", evt => this.mousemove.emit(evt));
    this.viewer.on("mouseout", evt => this.mouseout.emit(evt));
    this.viewer.on("mouseover", evt => this.mouseover.emit(evt));
    this.viewer.on("mouseup", evt => this.mouseup.emit(evt));
    this.viewer.on("mousewheel", evt => this.mousewheel.emit(evt));
    this.viewer.on("navigationEnd", evt => this.navigationEnd.emit(evt));
    this.viewer.on("pick", evt => this.pick.emit(evt));
    this.viewer.on("pointercancel", evt => this.pointercancel.emit(evt));
    this.viewer.on("pointerdown", evt => this.pointerdown.emit(evt));
    this.viewer.on("pointerenter", evt => this.pointerenter.emit(evt));
    this.viewer.on("pointerleave", evt => this.pointerleave.emit(evt));
    this.viewer.on("pointerlockchange", evt => this.pointerlockchange.emit(evt));
    this.viewer.on("pointerlockerror", evt => this.pointerlockerror.emit(evt));
    this.viewer.on("pointermove", evt => this.pointermove.emit(evt));
    this.viewer.on("pointerout", evt => this.pointerout.emit(evt));
    this.viewer.on("pointerover", evt => this.pointerover.emit(evt));
    this.viewer.on("pointerup", evt => this.pointerup.emit(evt));
    this.viewer.on("touchcancel", evt => this.touchcancel.emit(evt));
    this.viewer.on("touchend", evt => this.touchend.emit(evt));
    this.viewer.on("touchmove", evt => this.touchmove.emit(evt));
    this.viewer.on("touchstart", evt => this.touchstart.emit(evt));
    this.viewer.on("unloaded", evt => this.unloaded.emit(evt));
    this.viewer.on("wheel", evt => this.wheel.emit(evt));
  }

}

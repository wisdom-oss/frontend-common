import { AfterViewInit, Directive, ElementRef, EventEmitter, OnDestroy, Output } from '@angular/core';
import { ReplaySubject } from 'rxjs';

interface Size {
  height: number,
  width: number
}

@Directive({
  selector: '[resize]'
})
export class ResizeDirective implements AfterViewInit, OnDestroy {

  private observer = new ResizeObserver(this.onResize.bind(this));
  private resizeSubject = new ReplaySubject<Size>();
  public resize = this.resizeSubject.asObservable();
  @Output("resize") resizeEventEmitter = new EventEmitter<Size>();

  constructor(private elementRef: ElementRef) {}

  private onResize([entry]: ResizeObserverEntry[]) {
    console.log(entry);
    let size: Size = {
      height: entry.borderBoxSize.reduce((acc, v) => acc + v.blockSize, 0),
      width: entry.borderBoxSize.reduce((acc, v) => acc + v.inlineSize, 0)
    };
    this.resizeSubject.next(size);
    this.resizeEventEmitter.emit(size);
  }

  ngAfterViewInit(): void {
    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
    this.resizeSubject.complete();
  }

}

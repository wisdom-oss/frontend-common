import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

export interface Layout {
  main?: {
    width: number,
    height: number
  }
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  private currentLayout: Layout = {};
  private layoutSubject = new ReplaySubject<Layout>();
  public layout = this.layoutSubject.asObservable();

  private onMainResize([entry]: ResizeObserverEntry[]) {
    this.currentLayout.main = {
      height: entry.contentRect.height,
      width: entry.contentRect.width
    };
    this.layoutSubject.next(this.currentLayout);
  }

  watch = {
    main: (target: HTMLElement) => {
      let observer = new ResizeObserver(this.onMainResize.bind(this));
      observer.observe(target);
    }
  }

  get rem(): number {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
  }
}

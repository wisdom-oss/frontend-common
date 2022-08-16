import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Params, UrlTree} from "@angular/router";
import {Observable, Subject} from "rxjs";

export interface Breadcrumb {
  icon?: string,
  text: string,
  link: string,
  query?: Params
};

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbsService {
  fragments: Breadcrumb[] = [];
  private subject:Subject<Breadcrumb[]> = new Subject();

  set(index: number, value: Breadcrumb) {
    this.fragments.length = index + 1;
    this.fragments[index] = value;
    this.subject.next(this.fragments);
  }

  observe(): Observable<Breadcrumb[]> {
    return this.subject.asObservable();
  }
}

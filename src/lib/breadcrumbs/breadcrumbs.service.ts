import {Injectable} from "@angular/core";
import {Params, ActivatedRouteSnapshot, UrlTree} from "@angular/router";
import {Observable, BehaviorSubject, Subject} from "rxjs";

export interface Breadcrumb {
  icon?: string,
  text: string | string[],
  link: string,
  query?: Params
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbsService {
  fragments: Breadcrumb[] = [];
  private subject: BehaviorSubject<Breadcrumb[]>
    = new BehaviorSubject<Breadcrumb[]>([]);

  set(index: number, value: Breadcrumb) {
    this.fragments.length = index + 1;
    this.fragments[index] = value;
    this.subject.next(this.fragments);
  }

  observe(): Observable<Breadcrumb[]> {
    return this.subject.asObservable();
  }
}

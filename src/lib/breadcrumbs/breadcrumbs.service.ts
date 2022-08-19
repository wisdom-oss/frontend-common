import {Injectable} from "@angular/core";
import {Params, ActivatedRouteSnapshot, UrlTree} from "@angular/router";
import {Observable, BehaviorSubject, Subject} from "rxjs";

/** Breadcrumb fragment interface. */
export interface Breadcrumb {
  /**
   * Optional icon name to be displayed on the left of the fragment name.
   * This will use an {@link IonIconComponent} for the icon.
   */
  icon?: string,
  /**
   * String or array of strings to be displayed as fragment.
   * Every element will be passed to the {@link TranslateService}.
   */
  text: string | string[],
  /** Router link to be set for the fragment. */
  link: string,
  /** Optional query parameters for the router link. */
  query?: Params
}

/** Service collecting the breadcrumbs. */
@Injectable({
  providedIn: 'root'
})
export class BreadcrumbsService {
  /** List of breadcrumbs. */
  fragments: Breadcrumb[] = [];
  /**
   * {@link Subject} for the {@link Breadcrumb}s, to be used as
   * {@link Observable}.
   */
  private subject: BehaviorSubject<Breadcrumb[]>
    = new BehaviorSubject<Breadcrumb[]>([]);

  /**
   * Set a new breadcrumb fragment.
   *
   * This removes all fragments with a higher index than the set one.
   * @param index Index of the breadcrumb array
   * @param value Breadcrumb fragment to display
   */
  set(index: number, value: Breadcrumb) {
    this.fragments.length = index + 1;
    this.fragments[index] = value;
    this.subject.next(this.fragments);
  }

  /** Observe the breadcrumb fragments. */
  observe(): Observable<Breadcrumb[]> {
    return this.subject.asObservable();
  }
}

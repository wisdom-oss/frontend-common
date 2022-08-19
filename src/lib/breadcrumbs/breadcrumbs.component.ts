import {Component, OnDestroy, OnInit} from "@angular/core";
import {takeWhile} from "rxjs";

import {Breadcrumb, BreadcrumbsService} from "./breadcrumbs.service";

/**
 * Component to display breadcrumbs collected by the {@link BreadcrumbsService}.
 *
 * This will display a slash separated row with all breadcrumb fragments.
 * The one the most right is considered the current page and is therefore not
 * clickable.
 */
@Component({
  selector: 'breadcrumbs',
  templateUrl: './breadcrumbs.component.html'
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  /** Whether this component is alive. */
  private alive: boolean = true;
  /** Breadcrumb fragments that will be displayed. */
  fragments: (Breadcrumb | undefined)[] = [];

  /**
   * Constructor.
   * @param service Service to get breadcrumb fragments from
   */
  constructor(private service: BreadcrumbsService) { }

  /**
   * Upon init this will observe the service and update the breadcrumbs if
   * needed.
   */
  ngOnInit(): void {
    this.service.observe()
      .pipe(takeWhile(() => this.alive))
      .subscribe(next => {
      this.fragments = next
    });
  }

  /**
   * Check if all fragments up to the most right are set.
   *
   * If one is undefined this will return `false`.
   *
   * This allows ensuring that only fully defined breadcrumbs will be displayed.
   */
  isAllSet(): boolean {
    return !this.fragments.includes(undefined);
  }

  /**
   * On destroy set {@link alive} to `false`.
   *
   * This makes sure that the component does not live as long as the service.
   */
  ngOnDestroy(): void {
    this.alive = false;
  }
}

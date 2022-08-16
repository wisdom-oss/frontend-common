import {Component, OnDestroy, OnInit} from '@angular/core';
import {Breadcrumb, BreadcrumbsService} from "./breadcrumbs.service";
import {ActivatedRouteSnapshot} from "@angular/router";
import {takeWhile} from "rxjs";

let counter = 0;

@Component({
  selector: 'breadcrumbs',
  templateUrl: './breadcrumbs.component.html'
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  private alive: boolean = true;
  fragments: (Breadcrumb | undefined)[] = [];

  constructor(private service: BreadcrumbsService) { }

  ngOnInit(): void {
    this.service.observe()
      .pipe(takeWhile(() => this.alive))
      .subscribe(next => {
      this.fragments = next
    });
  }

  isAllSet(): boolean {
    return !this.fragments.includes(undefined);
  }

  ngOnDestroy(): void {
    this.alive = false;
  }
}

import { Component, OnInit } from '@angular/core';
import {Breadcrumb, BreadcrumbsService} from "./breadcrumbs.service";
import {ActivatedRouteSnapshot} from "@angular/router";

@Component({
  selector: 'breadcrumbs',
  templateUrl: './breadcrumbs.component.html'
})
export class BreadcrumbsComponent implements OnInit {
  fragments: (Breadcrumb | undefined)[] = [];

  constructor(private service: BreadcrumbsService) { }

  ngOnInit(): void {
    this.service.observe().subscribe(next => {
      this.fragments = next
    });
  }

  isAllSet(): boolean {
    return !this.fragments.includes(undefined);
  }
}

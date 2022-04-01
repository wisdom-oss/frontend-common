import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'page-loader',
  template: `
    <div [class.is-active]="enable" class="pageloader" #pageLoader>
      <span class="title">{{title}}</span>
    </div>
  `,
  styleUrls: ["./page-loader.component.scss"]
})
export class PageLoaderComponent {

  @Input("title") title: string = "";

  @Input("enable") enable: boolean = true;

}

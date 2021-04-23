import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.scss']
})
export class SearchItemComponent implements OnInit {
  @Input() item:any;
  constructor() { }

  ngOnInit(): void {
  }

  getFilter(key){
    return ".filter-" + key;
  }

}

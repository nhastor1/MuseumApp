import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '@app/_services';

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.scss']
})
export class SearchItemComponent implements OnInit {
  @Input() item:any;
  source:any;
  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    console.log(this.item);
    this.source = "assets/images/no_image.svg.png";
    if(this.item.image){
      this.dataService.getFile('image', this.item.image).subscribe((data) => this.source = data);
    }
  }

  getFilter(key){
    return ".filter-" + key;
  }

}

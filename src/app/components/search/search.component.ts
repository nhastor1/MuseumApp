import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DataService } from '@app/_services';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  form:FormGroup;
  results:Array<string>;
  categories:Array<any>;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      search: new FormControl('')
    });
    this.dataService.getCategories().subscribe((results) => {
      console.log(results);
      this.categories = results;
    });
  }

  search(){
    this.dataService.search(this.form.getRawValue().search).subscribe((response) => {
      console.log(response);
      this.results = response;
    });
  }

}

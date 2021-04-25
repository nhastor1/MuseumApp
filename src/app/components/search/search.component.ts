import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DataService, ToastrService } from '@app/_services';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  form:FormGroup;
  results:Array<string>;
  categories:Array<any>;
  filter:string = "*";

  constructor(private dataService: DataService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      search: new FormControl(localStorage.getItem('searchText'))
    });
    this.results = JSON.parse(localStorage.getItem('searchResponse'));
    this.dataService.getCategories().subscribe((results) => {
      console.log(results);
      this.categories = results;
    });
  }

  search(){
    let search = this.form.getRawValue().search;
    this.dataService.search(search).subscribe((response) => {
      console.log(response);
      localStorage.setItem('searchText', search);
      localStorage.setItem('searchResponse', JSON.stringify(response));
      this.results = response;
      if(response.length==0)
        this.toastr.warning("No results found");
      else{
        this.toastr.info("There are result for different category");
      }
    });
  }

  changeFilter(newFilter){
    this.filter = newFilter;
  }

}

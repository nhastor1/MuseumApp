import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DataService } from '@app/_services';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  form:any;
  results:any = null;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      search: new FormControl('')
    });
  }

  search(){
    console.log("Calling");
    this.dataService.search(this.form.getRawValue().search).subscribe((response) => {
      console.log(response);
      console.log("Resp");
    });
  }

}

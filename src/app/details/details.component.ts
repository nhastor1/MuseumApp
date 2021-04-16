import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Role } from '@app/_models/role';
import { AuthenticationService, DataService } from '@app/_services';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  form: FormGroup = new FormGroup({});

  createForm;
  categories = [];
  codes = [];
  currentCategory = null;
  currentCategoryKey = null;
  loading = false;

  constructor(public authService: AuthenticationService, 
    private dataService: DataService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.dataService.getCategories().subscribe((results) => {
      this.categories = results;
      this.onChangeCategory(results[0].key);
    });
  }

  onChangeCategory(value){
    this.currentCategoryKey = value;
    this.dataService.getCategory(value).subscribe((results) => {
      this.currentCategory = results;

      this.setForm(results, null);
    });
    this.dataService.getCodes(value).subscribe((results) => {
      //console.log(results);
      this.codes = results;
      this.onChangeCode(results[0]);
    })
  }
  
  onChangeCode(value){
    console.log(value);
    this.dataService.getData(this.currentCategory, value).subscribe((results) => {
      console.log(results);
      this.setForm(this.currentCategory, results);
    })
  }

  saveData(){
    this.loading = true;
    // console.log(this.form.getRawValue());
    // this.dataService.addData(this.currentCategory, this.currentCategoryKey, this.form.getRawValue())
    //   .then((response) => {
    //     console.log(response);
    //     this.loading = false;
    //   });
  }

  setForm(results, data){
    let obj = {};
    let i=0;
    for(var res of results){
      obj[res.name] = [''];
    }
    if(data)
      this.form.setValue(data);
    else
      this.form = this.formBuilder.group(obj);
  }
  
}

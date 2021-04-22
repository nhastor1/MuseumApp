import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { AuthenticationService, DataService, ToastrService } from '@app/_services';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  form: FormGroup = new FormGroup({});

  createForm;
  categories = [];
  currentCategory = null;
  currentCategoryKey = null;
  loading = false;

  constructor(private authService: AuthenticationService, 
    private dataService: DataService, private formBuilder: FormBuilder,
    private toastr: ToastrService) { }

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
      this.form = this.getForm(results);
    });
  }

  saveData(){
    this.loading = true;
    console.log(this.form.getRawValue());
    this.dataService.addData(this.currentCategory, this.currentCategoryKey, this.form.getRawValue())
      .then((response) => {
        console.log(response);
        this.loading = false;
        this.toastr.success("Data added");
      });
  }

  getForm(results){
    var obj = {};
    for(var res of results){
      // obj[res.name] = new FormControl('');
      obj[res.name] = [''];
    }
    //return new FormGroup(obj);
    return this.formBuilder.group(obj);
  }

}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService, DataService, ToastrService } from '@app/_services';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  searchForm: FormGroup = new FormGroup({
    category: new FormControl(),
    key: new FormControl()
  });

  createForm;
  categories = [];
  codes = [];
  currentCategory = null;
  currentCategoryKey = null;
  currentDataKey = null;
  loading = false;
  first = true;

  constructor(public authService: AuthenticationService, private route: ActivatedRoute,
    private dataService: DataService, private formBuilder: FormBuilder,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.dataService.getCategories().subscribe((results) => {
      this.categories = results;
      this.currentDataKey = this.route.snapshot.params['key'];
      let tempCatKey = undefined;
      if(this.currentDataKey != undefined)
        tempCatKey = this.currentDataKey.substring(0, this.currentDataKey.indexOf('_'));
      if(this.currentDataKey!=undefined && results.map(a => a.key).includes(tempCatKey)){
        console.log("DA");
        this.searchForm.get('category').setValue(tempCatKey);
        this.currentCategory = tempCatKey;
        this.onChangeCategory(tempCatKey);
      }
      else{
        console.log("NE");
        this.first = false;
        this.searchForm.get('category').setValue(results[0].key);
        this.onChangeCategory(results[0].key);
      }
    });
  }

  onChangeCategory(value){
    this.currentCategoryKey = value;
    this.dataService.getCategory(value).subscribe((results) => {
      this.currentCategory = results;
      this.setForm(results, null);
    });
    this.dataService.getCodes(value).subscribe((results) => {
      this.codes = results;
      console.log(results);
      if(this.first && results.includes(this.currentDataKey)){
        this.first = false;
        this.searchForm.get('key').setValue(this.currentDataKey);
        this.onChangeCode(this.currentDataKey);
      }
      else{
        this.searchForm.get('key').setValue(results[0]);
        this.onChangeCode(results[0]);
      }
    })
  }
  
  onChangeCode(value){
    console.log(value);
    this.currentDataKey = value;
    this.dataService.getData(value).subscribe((results) => {
      console.log(results);
      this.setForm(this.currentCategory, results);
    })
  }

  saveData(){
    this.loading = true;
    console.log(this.form.getRawValue());
    this.dataService.updateData(this.currentCategory, this.currentCategoryKey, this.form.getRawValue(), this.currentDataKey)
      .then((response) => {
        console.log(response);
        this.loading = false;
        this.toastr.success("Data edited");
      },
      (error) => {
        this.loading = false;
        this.toastr.error(error.message);
      });
  }

  setForm(results, data){
    let obj = {};
    let i=0;
    if(data)
      for(var key of Object.keys(data))
        obj[key] = [data[key]]
    else
      for(var res of results)
        obj[res.name] = [''];
    console.log(obj);
    this.form = this.formBuilder.group(obj);
    // if(data)
    //   //this.form.setValue(data);
    //   this.form = this.formBuilder.group(data);
    // else
    //   this.form = this.formBuilder.group(obj);
  }
  
}

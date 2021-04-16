import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Type } from '../_models/type';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  @Input() field: any;
  @Input() form: FormGroup;
  //@Input() file: any;

  constructor() { }

  ngOnInit(): void {
  }

  onFileSelect(event){
    //this.file = event.target.files[0];
    //this.file = new BitmapImage(new Uri(@"component/Images/down.png", UriKind.RelativeOrAbsolute)); 
    this.setFile(event);
    console.log(event.target.files[0]);
    console.log(this.field.name);
    this.form.controls[this.field.name].setValue(event.target.files[0]);
  }

  setFile(event){
    // var selectedFile = event.target.files[0];
    // var reader = new FileReader();
    // let fileToSet = this.file;
    // console.log("ispisi se");
    // let setVal = this.setSource;
  
    // reader.onload = function(event) {
    //   setVal(event.target.result);
    // };
  
    // reader.readAsDataURL(selectedFile);
  }

  setSource(src){
    //console.log(src);
    //  console.log(this.file);
    //this.file = src;
  }

}

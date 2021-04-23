import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  @Input() field: any;
  @Input() form: FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

  onFileSelect(event){
    console.log(event.target.files[0]);
    console.log(this.field.name);
    this.form.controls[this.field.name].setValue(event.target.files[0]);
  }

}

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataService, ToastrService } from '@app/_services';
import { Type } from '../../_models/type';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit, OnChanges {
  @Input() category: any;
  @Input() field: any;
  @Input() form: FormGroup;
  list = [];

  constructor(private dataService: DataService, private toastr: ToastrService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.field.type==Type.checkbox){
      console.log("DOCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCA");
      console.log(this.form.get(this.field.name).value);
      if(!this.form.get(this.field.name).value)
        this.form.get(this.field.name).setValue('');
        console.log("DOCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCA2");
      console.log(this.form.get(this.field.name).value);
      console.log(this.form)
    }
  }

  ngOnInit(): void {
    if(this.field.type==Type.dropdown || this.field.type == Type.radiobuttons){
      this.dataService.getList(this.field.type, "middleAgesKey", this.field.name).subscribe((response) => {
        if(response.error)
          this.toastr.warning(response.error);
        else
          this.list = response;
      });
    }
  }

  onFileSelect(event){
    console.log(event.target.files[0]);
    console.log(this.field.name);
    this.form.controls[this.field.name].setValue(event.target.files[0]);
  }

}

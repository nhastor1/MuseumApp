import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataService, ToastrService } from '@app/_services';
import { Type } from '../../_models/type';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  @Input() category: any;
  @Input() field: any;
  @Input() form: FormGroup;
  list = [];

  constructor(private dataService: DataService, private toastr: ToastrService) { }

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

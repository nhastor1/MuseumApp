import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService, UserService } from '@app/_services';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  myForm:any = new FormGroup({
    oldPass: new FormControl('', Validators.required),
    newPass: new FormControl('', Validators.required),
    repPass: new FormControl('', Validators.required)
  });
  loading = false;

  constructor(private userService:UserService, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  update(formValues){
    if(this.validForm){
      this.loading = true;
      this.userService.changePassword(formValues.oldPass, formValues.newPass).subscribe((obj) => {
        this.loading = false;
        if(obj && obj!='undefined'){
          this.toastr.error(obj.message);
        }
      })
    }
  }

  samePassword(){
    return this.myForm.get('newPass').value === this.myForm.get('repPass').value;
  }

  validForm(){
    return this.myForm.valid && this.samePassword();
  }
}

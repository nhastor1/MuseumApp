import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService, UserService } from '@app/_services';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  myForm:any = new FormGroup({
    username: new FormControl('', Validators.required),
    firstname: new FormControl('', Validators.required),
    lastname: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    role: new FormControl('Read', Validators.required),
  });
  loading = false;

  // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character:
  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  constructor(private userService: UserService, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  create(){
    this.loading = true;
    console.log(this.myForm.getRawValue());
    this.userService.createUser(this.myForm.getRawValue()).subscribe((response) => {
      this.loading = false;
      console.log(response);
      if(response.error)
        this.toastr.error(response.error);
      else if(response.message)
        this.toastr.success(response.message);
    });
  }

  validPassword(){
    return this.passwordRegex.test(this.myForm.get('password').value);
  }

  validForm(){
    return this.myForm.valid && this.validPassword();
  }

}

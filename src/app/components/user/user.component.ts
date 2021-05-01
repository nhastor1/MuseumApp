import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService, ToastrService, UserService } from '@app/_services';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  myForm:FormGroup = new FormGroup({
    username: new FormControl('', Validators.required),
    firstname: new FormControl('', Validators.required),
    lastname: new FormControl('', Validators.required),
    role: new FormControl('Read', Validators.required),
  });
  loading = false;
  username;
  isCreate = false;
  isProfile = false;

  // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character:
  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  constructor(private userService: UserService, private toastr: ToastrService,
    private route: ActivatedRoute, private router: Router,
    private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.username = this.route.snapshot.params['username'];
    let routePath = this.route.snapshot.routeConfig.path;
    if(routePath == 'users/create'){
      this.isCreate = true;
      this.myForm.addControl('password', new FormControl('', Validators.required));
    }
    else if(routePath == 'profile'){
      this.isProfile = true;
      let user = this.authService.userValue;
      this.myForm.setValue({
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role
      });
    }

    if(this.username!=undefined){
      this.userService.getUser(this.username).subscribe((user) => {
        if(user.error)
          this.router.navigate(['profile']);
        else{
          console.log(user);
          this.myForm.setValue(user);
        }
      })
    }
  }

  save(){
    let rawForm = this.myForm.getRawValue();
    if(this.isCreate){
      this.loading = true;
      this.userService.createUser(rawForm).subscribe((response) => {
        this.loading = false;
        console.log(response);
        if(response.error)
          this.toastr.error(response.error);
        else if(response.message){
          this.toastr.success(response.message);
          this.router.navigate(['users', rawForm.username]);
        }
      });
    }
    else if(!this.isProfile){
      this.loading = true;
      this.userService.editUser(rawForm).subscribe((response) => {
        this.loading = false;
        console.log(response);
        if(response.error)
          this.toastr.error(response.error);
        else if(response.message)
          this.toastr.success(response.message);
      });
    }
    
  }

  saveUser(){

  }

  validPassword(){
    return this.passwordRegex.test(this.myForm.get('password').value);
  }

  validForm(){
    return this.myForm.valid && (!this.isCreate || this.validPassword());
  }
}

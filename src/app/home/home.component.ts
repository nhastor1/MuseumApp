import { Component } from '@angular/core';
import { first } from 'rxjs/operators';

import { Role, User } from '@app/_models';
import { UserService, AuthenticationService } from '@app/_services';

@Component({ 
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.scss']
})
export class HomeComponent {
    loading = false;
    user: User;
    //userFromApi: User;
    userFromApi: String;

    constructor(
        private userService: UserService,
        private authenticationService: AuthenticationService
    ) {
        this.user = JSON.parse(localStorage.getItem('user'));
        //this.user.role = Role.Update;
        console.log(this.user);
    }

    ngOnInit() {
        this.loading = true;
        this.userService.getApi().pipe(first()).subscribe(a => {
            this.loading = false;
        });
        // this.userService.getById(this.user.id).pipe(first()).subscribe(user => {
        //     this.loading = false;
        //     this.userFromApi = user;
        // });
    }
}
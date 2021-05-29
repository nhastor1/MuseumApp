import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from './_services';
import { User, Role } from './_models';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

@Component({ 
    selector: 'app', 
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    user: User;
    faChevronDown = faChevronDown;

    constructor(private authService: AuthenticationService) {
        this.authService.user.subscribe(x => this.user = x);
    }
    
    logout() {
        this.authService.logout();
    }
}
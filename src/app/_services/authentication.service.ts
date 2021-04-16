import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Role, User } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private userSubject: BehaviorSubject<User>;
    public user: Observable<User>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();
    }

    public get userValue(): User {
        return this.userSubject.value;
    }

    login(username: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/login`, { username, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                if(!user.message){
                    console.log(user);
                    localStorage.setItem('user', JSON.stringify(user));
                    this.userSubject.next(user);
                }
                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.user == null;
        this.router.navigate(['/login']);
    }
    
    refreshToken(){
        console.log("REFRESHTOKEN");
        return this.http.post<any>(`${environment.apiUrl}/newToken`, {refreshToken: this.userValue.renewableToken})
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                if(!user.message){
                    localStorage.setItem('user', JSON.stringify(user));
                    this.userSubject.next(user);
                }
                return user.token;
            }));
    }

    public isUpdateOrAdmin() {
        return this.userValue && ( this.userValue.role === Role.Update
            || this.userValue.role === Role.Admin);
    }

    public isAdmin() {
        return this.userValue && this.userValue.role === Role.Admin;
    }

    public isUpdate() {
        return this.userValue && this.userValue.role === Role.Update;
    }
}
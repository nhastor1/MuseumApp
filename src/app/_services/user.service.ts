import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '@environments/environment';
import { User } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }

    changePassword(oldPass:string, newPass:string){
        return this.http.put<any>(`${environment.apiUrl}/account/changePassword`, {
            oldPass: oldPass,
            newPass: newPass
        });
    }

    getAll() {
        return this.http.get<User[]>(`${environment.apiUrl}/users`);
    }

    getUser(username){
        return this.http.get<any>(`${environment.apiUrl}/users/${username}`);
    }

    deleteUser(username){
        return this.http.delete<any>(`${environment.apiUrl}/users/${username}`);
    }

    createUser(user){
        return this.http.post<any>(`${environment.apiUrl}/users/`, JSON.stringify(user), { headers: new HttpHeaders({
            'Content-Type':  'application/json; charset=utf-8'
          })});
    }

    // getById(id: number) {
    //     return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
    // }

    // getApi(){
    //     return this.http.get<any>(`${environment.apiUrl}/hello`);
    // }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

    getById(id: number) {
        return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
    }

    getApi(){
        return this.http.get<any>(`${environment.apiUrl}/hello`);
    }
}
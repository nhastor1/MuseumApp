import { Component, OnInit } from '@angular/core';
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

import { User } from '@app/_models';
import { ToastrService, UserService } from '@app/_services';

@Component({ 
    templateUrl: 'admin.component.html',
    styleUrls: ['admin.component.scss']
})
export class AdminComponent implements OnInit {
    loading: boolean;
    users: User[] = [];
    faEdit = faEdit;
    faDelete = faTrash;
    faPlus = faPlus;

    constructor(private userService: UserService, private toastr: ToastrService) { }

    ngOnInit() {
        this.loading = true;
        this.userService.getAll().subscribe(users => {
            this.loading = false;
            this.users = users;
            console.log(users)
        });
    }

    deleteUser(username){
        if(confirm("Are you sure to delete "+ username)) {
            this.toastr.success(username + " successfully deleted");
        }
    }
}
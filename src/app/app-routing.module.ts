import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { AdminComponent } from './admin';
import { LoginComponent } from './login';
import { AuthGuard } from './_helpers';
import { Role } from './_models';
import { CreateComponent } from './create/create.component';
import { DetailsComponent } from './details/details.component';
import { SearchComponent } from './search/search.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'create',
        component: CreateComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Update, Role.Admin] }
    },
    {
        path: 'search',
        component: SearchComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Update, Role.Admin, Role.Read] }
    },
    {
        path: 'details',
        component: DetailsComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Update, Role.Admin, Role.Read] }
    },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin] }
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'changePassword',
        component: ChangePasswordComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Update, Role.Admin, Role.Read] }
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

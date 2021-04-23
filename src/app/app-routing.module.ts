import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './components/home';
import { AdminComponent } from './components/admin';
import { LoginComponent } from './components/login';
import { AuthGuard } from './_helpers';
import { Role } from './_models';
import { CreateComponent } from './components/create/create.component';
import { DetailsComponent } from './components/details/details.component';
import { SearchComponent } from './components/search/search.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';

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

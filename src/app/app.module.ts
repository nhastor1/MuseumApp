import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// used to create fake backend
//import { fakeBackendProvider } from './_helpers';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { ErrorInterceptor } from './_helpers';
import { HomeComponent } from './components/home';
import { AdminComponent } from './components/admin';
import { LoginComponent } from './components/login';
import { UpdateComponent } from './components/update';;
import { CreateComponent } from './components/create/create.component';
import { SearchComponent } from './components/search/search.component';
import { DetailsComponent } from './components/details/details.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { InputComponent } from './components/input/input.component';
import { MediaComponent } from './components/media/media.component';
import { ToastrService } from './_services';;
import { SearchItemComponent } from './components/search-item/search-item.component'
@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRoutingModule
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        AdminComponent,
        LoginComponent,
        CreateComponent,
        UpdateComponent,
        DetailsComponent,
        SearchComponent,
        ChangePasswordComponent,
        InputComponent,
        MediaComponent,
        SearchItemComponent],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        ToastrService
        // provider used to create fake backend
        //fakeBackendProvider
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }
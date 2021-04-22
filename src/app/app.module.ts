import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// used to create fake backend
//import { fakeBackendProvider } from './_helpers';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { ErrorInterceptor } from './_helpers';
import { HomeComponent } from './home';
import { AdminComponent } from './admin';
import { LoginComponent } from './login';
import { UpdateComponent } from './update';;
import { CreateComponent } from './create/create.component';
import { SearchComponent } from './search/search.component';
import { DetailsComponent } from './details/details.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { InputComponent } from './input/input.component';
import { MediaComponent } from './media/media.component';
import { ToastrService } from './_services';
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
        MediaComponent],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        ToastrService
        // provider used to create fake backend
        //fakeBackendProvider
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }
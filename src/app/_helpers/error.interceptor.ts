import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthenticationService } from '@app/_services';
import { environment } from '@environments/environment';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const user = this.authenticationService.userValue;
        const isLoggedIn = user && user.token;
        const isApiUrl = request.url.startsWith(environment.apiUrl);
        if (isLoggedIn && isApiUrl && !this.isRefreshing) {
            request = this.addToken(request, this.authenticationService.userValue.token);
            // console.log(this.authenticationService.userValue.token);
            // console.log(request);
        }

        return this.handleRequest(request, next);
    }

    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authenticationService.refreshToken()
                .pipe(
                    switchMap((token: any) => {
                        this.isRefreshing = false;
                        this.refreshTokenSubject.next(token);
                        return this.handleRequest(this.addToken(request, token), next);
                }))

        } else {
            return this.refreshTokenSubject.pipe(
            filter(token => token != null),
            take(1),
            switchMap(jwt => {
                return this.handleRequest(this.addToken(request, jwt), next);
            }));
        }
    }

    private addToken(request: HttpRequest<any>, token: string) {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    private handleRequest(request, next){
        return next.handle(request).pipe(catchError(err => {
            if ([403].indexOf(err.status) !== -1) {
                // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                this.authenticationService.logout();
            }
            else if(err.status === 401){
                return this.handle401Error(request, next);
            }
            else if(err.status === 301){
                this.authenticationService.logout();
            }
            else{
                console.log(err);
                //return err;
                const error = err.error.message || err.statusText;
                return throwError(error);
            }
        }));
    }
}
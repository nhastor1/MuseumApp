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
        if (isLoggedIn && isApiUrl) {
            request = this.addToken(request, this.authenticationService.userValue.token);
        }

        return next.handle(request).pipe(catchError(err => {
            if ([403].indexOf(err.status) !== -1) {
                // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                this.authenticationService.logout();
            }
            else if(err.status === 401){
                this.handle401Error(request, next);
            }
            else if(err.status === 301){
                this.authenticationService.logout();
            }
            else{
                console.log("GRESKAAA");
                const error = err.error.message || err.statusText;
                return throwError(error);
            }
        }))
    }

    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        console.log("HANDLA SEE");
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authenticationService.refreshToken()
                .pipe(
                    switchMap((token: any) => {
                        console.log("Prvi slucaj");
                        console.log(token);
                        this.isRefreshing = false;
                        this.refreshTokenSubject.next(token);
                        return next.handle(this.addToken(request, token));
                })).subscribe();

        } else {
            return this.refreshTokenSubject.pipe(
            filter(token => token != null),
            take(1),
            switchMap(jwt => {
                console.log("Drugi slucaj");
                console.log(jwt);
                return next.handle(this.addToken(request, jwt));
            }));
        }
    }

    private addToken(request: HttpRequest<any>, token: string) {
        console.log("PONOVO");
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }
}
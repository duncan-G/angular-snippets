import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router'
import { HttpClient, HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/catch';

import { AuthService } from '../app/main/content/authentication/authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private router: Router,
        private inj: Injector
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log(req);
        
        var refreshStatus = req.params.get('refresh')

        const authService = this.inj.get(AuthService)
        
        let currentUser = authService.retrieveUser()

        var token = authService.getToken()

        console.log("intercepted request ... ");

        // Clone the request to add the new header.
        var authReq;

        // Don't refresh auth token
        if (refreshStatus === "false"){
            if (token){
                authReq = req.clone({
                    withCredentials: true,
                    headers: req.headers.set("Authorization", "JWT " + token),
                    params: req.params.delete('refresh')});
            } else {
                authReq = req.clone({
                    withCredentials: true,
                    params: req.params.delete('refresh')});
            } 
        }
        
        else {
            if (token)
            {   
                // Refresh token if expired
                if (authService.isTokenNearExpired(token))
                {
                    authService.refreshToken()
                        .subscribe( results => {
                            authService.setToken(results['token'])
                        })
                    token = authService.getToken(); // Get new token
                }
                authReq = req.clone({
                    headers: req.headers.set("Authorization", "JWT " + token),
                    withCredentials: true});
            } else
            {
                authReq = req.clone({withCredentials: true});
            } 
        }

        //send the newly created request
        return next.handle(authReq)
            .catch((error, caught) => {
            //intercept the response error and displace it to the console
            console.log(error);
            if (error.error['detail'] === "Signature has expired.")
            {
                authService.removeUser();
                this.router.navigate(['/auth/login']);
            }

            //return the error to the method that called it
            return Observable.throw(error);
        }) as any;
    }
}
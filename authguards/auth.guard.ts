import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { AuthService } from '../content/authentication/authentication.service'


@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router,
                private authService: AuthService) { }

    canActivate() {
        let currentUser = this.authService.retrieveUser()
        if (currentUser && currentUser.token) {
            if (currentUser && currentUser.isNewAccount){
                // user has not yet setup account
                this.router.navigate(['/auth/register/profile-setup']);
                return false
            } else {
                // Logout user if token has expired
                if (this.authService.isTokenExpired(currentUser.token)){
                    this.authService.removeUser();
                    this.router.navigate(['/auth/login']);
                    return false
                }

                if (this.authService.isTokenNearExpired(currentUser.token)){
                    console.log('near expired');
                    this.authService.refreshToken()
                        .subscribe( result => {
                            this.authService.setToken(result['token'])
                            return true
                        }, error => {
                            this.authService.removeUser();
                            this.router.navigate(['/auth/login'])
                            return false
                        });
                }

                // logged in so return true
                return true
            }
        }
        // not logged in so redirect to login page
        this.router.navigate(['/auth/login']);
        return false;
    }
}

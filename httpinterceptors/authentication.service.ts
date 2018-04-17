import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient,HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { tokenRefreshUrl }  from '../../config/endpoints';

//Service shared amongst authentication components and auth guards
@Injectable()
export class AuthService
{
    public token: string;
    public email: string;
    public storeInfoAvailable: boolean;
    public userLoggedIn = new BehaviorSubject<boolean>(this.isUserLoggedIn());

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
    }

    isUserLoggedIn(): boolean {
        var currentUser = this.retrieveUser()
        if (currentUser && currentUser.token && !this.isTokenExpired(currentUser.token)) {
            return true
        } return false
    }

    saveUser(token:string,newAccount:boolean,confirmedAccount:boolean){
        localStorage.setItem('currentUser', JSON.stringify(
            {
                token: token, 
                isNewAccount: newAccount,
                isConfirmedAccount: confirmedAccount 
            }));
    }

    retrieveUser(){
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser){
            return currentUser
        } else {
            return null
        };
    }

    retrieveEmail(){
        let user = this.retrieveUser()
        if (user && user.token){
            let token = this.decodeToken(user.token)
            return token.email
        }
    }

    removeUser() {
        this.token = null;
        localStorage.removeItem('currentUser');
    }


    getToken() {
        let currentUser = this.retrieveUser()
        this.token = currentUser && currentUser.token;
        return this.token
    }

    setToken(token){
        this.token = token
        let user = this.retrieveUser()
        this.saveUser(token,user.isNewAccount,user.isConfirmedAccount)
        
    }


    refreshToken() {
        let requestParams = new HttpParams()
            .set('refresh', 'false');

       return this.http.post(tokenRefreshUrl,{token: this.getToken()},{params: requestParams})
    }

    public isTokenExpired(token: string, offsetSeconds?: number): boolean {
        let date = this.getTokenExpirationDate(token);
        offsetSeconds = offsetSeconds || 0;

        if (date == null) {
            return false;
        }

        // Token expired?
        return !(date.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
    }

    public isTokenNearExpired(token: string, offsetSeconds?: number): boolean {
        return (this.isTokenExpired(token,300) && !this.isTokenExpired(token));
    }

    public urlBase64Decode(str: string): string {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
          case 0: { break; }
          case 2: { output += '=='; break; }
          case 3: { output += '='; break; }
          default: {
            throw 'Illegal base64url string!';
          }
        }
        return this.b64DecodeUnicode(output);
      }

    private b64DecodeUnicode(str: any) {
        return decodeURIComponent(Array.prototype.map.call(this.b64decode(str), (c: any) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
      }
    
    public decodeToken(token: string): any {
        let parts = token.split('.');

        if (parts.length !== 3) {
            throw new Error('JWT must have 3 parts');
        }

        let decoded = this.urlBase64Decode(parts[1]);
        if (!decoded) {
            throw new Error('Cannot decode the token');
        }

        return JSON.parse(decoded);
    }

    private b64decode(str: string): string {
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let output: string = '';

        str = String(str).replace(/=+$/, '');

        if (str.length % 4 == 1) {
            throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
        }

        for (
            // initialize result and counters
            let bc: number = 0, bs: any, buffer: any, idx: number = 0;
            // get next character
            buffer = str.charAt(idx++);
            // character found in table? initialize bit storage and add its ascii value;
            ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
            // and if not first of each 4 characters,
            // convert the first 8 bits to one ascii character
            bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
        ) {
            // try to find character in table (0-63, not found => -1)
            buffer = chars.indexOf(buffer);
        }
        return output;
    }

    public getTokenExpirationDate(token: string): Date {
        let decoded: any;
        decoded = this.decodeToken(token);

        if (!decoded.hasOwnProperty('exp')) {
            return null;
        }

        let date = new Date(0); // The 0 here is the key, which sets the date to the epoch
        date.setUTCSeconds(decoded.exp);

        return date;
    }

}
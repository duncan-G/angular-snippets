import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { dataUrl, updateDataUrl } from '../endpoints';

@Injectable()
export class MyService implements Resolve<any>
{
    routeParams: any;
    data: any;
    onDataChanged: BehaviorSubject<any> = new BehaviorSubject({});

    constructor(
        private http: HttpClient
    )
    {
    }

    /**
     * Resolve
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {

        this.routeParams = route.params;

        return new Promise((resolve, reject) => {

            Promise.all([
                this.getData()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    getData(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.http.get(dataUrl)
                .subscribe((response: any) => {
                    this.data = response.results[0];
                    this.onDataChanged.next(this.data);
                    resolve(response);
                }, reject);
        });
    }

    saveData(product)
    {        
        return new Promise((resolve, reject) => {
            this.http.post(updateDataUrl, data)
            .subscribe((response: any) => {
                resolve(response);
            }, reject);
        });
    }

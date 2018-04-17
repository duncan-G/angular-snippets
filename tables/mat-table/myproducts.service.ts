import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { productsUrl } from '../../endpoints'

@Injectable()
export class MyProductsService implements Resolve<any>
{
    products: any[];
    routeParams: any;
    public pageUrl;
    public next: string;
    public previous: string;
    public count: number;
    public state: string;
    public store: string;

    onProductsChanged: BehaviorSubject<any> = new BehaviorSubject({});

    constructor(
        private http: HttpClient,
        private router: Router
    )
    {
        this.pageUrl = productsUrl;
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
                this.getProducts()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * getProducts
     * @routeParam {store} Store name
     * @routeParam {status} Status of products (active/inactive/soldout)
     */
    getProducts(): Promise<any>
    {
        let store = this.routeParams.store;
        let status = this.routeParams.status;
        this.state = status;
        this.store = store

        let params = new HttpParams()
            .set("store",store)
            .set("status",status);

        return new Promise((resolve, reject) => {
            this.http.get(this.pageUrl,{params : params})
                .subscribe((response: any) => {
                    this.products = response.results;
                    this.count = response.count;
                    this.next = response.next;
                    this.previous = response.previous;
                    this.onProductsChanged.next(this.products);
                    resolve(response);
                }, reject);
        });
    }

    filterProductsByState(state)
    {
        this.router.navigate(['products/'+this.store + '/' + state]);
    }


}

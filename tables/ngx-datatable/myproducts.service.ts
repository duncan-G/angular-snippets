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
    temp: any[];
    displayListings: boolean = false;
    loadingIndicator: boolean = true;
    reorderable: boolean = true;

    onProductsChanged: BehaviorSubject<any> = new BehaviorSubject({});

    constructor(
        private http: HttpClient,
        private router: Router
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

        // ngx-databable uses the virtual dom to handle displaying 10k rows. 
        // Pass min-info to avoid deserializing nested product models and return 10k rows
        let params = new HttpParams()
            .set("store",store)
            .set("status",status)
            .set('min_info','True');

        return new Promise((resolve, reject) => {
            this.http.get(this.pageUrl,{params : params})
                .subscribe((response: any) => {
                    this.products = response.results;
                    this.displayListings = true;
                    this.loadingIndicator = false
                    this.temp = this.products;
                    resolve(response);
                }, reject);
        });
    }

    updateStateFilter(listings,filterVal){
        // filter our data
        if (filterVal === 'inactive'){
            return listings.filter(
                product => product.state != 'active');
        } else if (filterVal === 'all'){
            return listings;
        } else {
            return listings.filter(
                product => product.state === 'active');
        }
    }

    updateSectionFilter(listings,filterVal){
        // filter our data
        if (filterVal === 0 || filterVal === "all"){
            return listings
        } else if (filterVal === 'no_section'){
            return listings.filter(
                product => product.shop_section_id === null);
        } else {
            return listings.filter(
                product => product.shop_section_id === filterVal);
        }

    }

    updateSearchFilter(listings,filterVal) {
        // filter our data
        const temp = listings.filter(function(d) {
          return d.title.toLowerCase().indexOf(filterVal) !== -1 || !filterVal;
        });
        return temp
   }

}

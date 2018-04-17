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
            this.http.get(productsUrl,{params : params})
                .subscribe((response: any) => {
                    this.products = response.results;
                    this.displayListings = true;
                    this.loadingIndicator = false
                    this.temp = this.products;
                    resolve(response);
                }, reject);
        });
    }

    updateStateFilter(products,filterVal){
        // filter our data
        if (filterVal === 'inactive'){
            return products.filter(
                product => product.state != 'active');
        } else if (filterVal === 'all'){
            return products;
        } else {
            return products.filter(
                product => product.state === 'active');
        }
    }

    updateCategoryFilter(products,filterVal){
        // filter our data
        if (filterVal === 0 || filterVal === "all"){
            return products
        } else if (filterVal === 'no_category'){
            return products.filter(
                product => product.category === null);
        } else {
            return listings.filter(
                product => product.category === filterVal);
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

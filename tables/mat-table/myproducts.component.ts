import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MyProductsService } from './products.service';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { MatPaginator, PageEvent } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import { Router } from '@angular/router';


@Component({
    selector   : 'my-products',
    templateUrl: './myproducts.component.html',
    styleUrls  : ['./myproducts.component.scss'],
})
export class MyProductsComponent implements OnInit
{
    pageEvent: PageEvent;
    currentPageIndex: number = 0;
    dataSource: FilesDataSource | null;
    public showLoadingBar: boolean;
    displayedColumns = ['main_image', 'title', 'category', 'price', 'quantity', 'state','has_variations'];

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('scrollTo') elRef: ElementRef;
    
    constructor(
        private productsService: MyProductsService,
    )
    {
    }

    ngOnInit()
    {
        this.dataSource = new FilesDataSource(this.productsService, this.paginator);
    }

    // On next page or previous page
    loadPageData(event) {
        this.showLoadingBar = true;
        
        // get next or previous page
        if (event.pageIndex > this.currentPageIndex){
            // get next page
            this.productsService.pageUrl = this.productsService.next;
        } else if (event.pageIndex < this.currentPageIndex){
            // get previous page
            this.productsService.pageUrl = this.productsService.previous;
        };
        
        this.productsService.getProducts()
            .then(()=> {
                // mat-paginator does not automatically scroll to top when viewing the next/previous page
                // Scroll to the top of the page when pressing next or previous
                this.elRef.nativeElement.scrollIntoView();
                this.showLoadingBar = null;
            });
        this.currentPageIndex = event.pageIndex;
    }
}

export class FilesDataSource extends DataSource<any>
{
    _filterChange = new BehaviorSubject('');
    _filteredDataChange = new BehaviorSubject('');

    get filteredData(): any
    {
        return this._filteredDataChange.value;
    }

    set filteredData(value: any)
    {
        this._filteredDataChange.next(value);
    }

    get filter(): string
    {
        return this._filterChange.value;
    }

    set filter(filter: string)
    {
        this._filterChange.next(filter);
    }

    constructor(
        private productsService: MyProductsService,
        private _paginator: MatPaginator,
    )
    {
        super();
        this.filteredData = this.productsService.products;
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<any[]>
    {
        const displayDataChanges = [
            this.productsService.onProductsChanged,
            this._paginator.page,
            this._filterChange,
        ];

        return Observable.merge(...displayDataChanges).map(() => {
            let data = this.productsService.products.slice();

            data = this.filterData(data);

            this.filteredData = [...data];

            // Grab the page's slice of data.
            const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
            return data.splice(0,50);
            //return data.splice(startIndex, this._paginator.pageSize);
        });
    }

    filterData(data)
    {
        if ( !this.filter )
        {
            return data;
        }
        return this.filterArrayByString(data, this.filter);
    }
    
    public static filterArrayByString(mainArr, searchText)
    {
        if ( searchText === '' )
        {
            return mainArr;
        }

        searchText = searchText.toLowerCase();

        return mainArr.filter(itemObj => {
            return this.searchInObj(itemObj, searchText);
        });
    }

    disconnect()
    {
    }
}

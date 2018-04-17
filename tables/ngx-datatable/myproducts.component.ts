import { OnInit, AfterViewInit, Component, ViewChild, ElementRef, Renderer2, Inject } from '@angular/core'
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { DatatableComponent } from '@swimlane/ngx-datatable';
import { MyProductsService } from './myproducts.service';


@Component({
    selector   : 'my-products',
    templateUrl: './myproducts.component.html',
    styleUrls  : ['./myproducts.component.scss'],
})

  
  
export class MyProductsComponent
{
    @ViewChild(DatatableComponent) productsTable: DatatableComponent;
    @ViewChild('searchFilterInput') searchInput: ElementRef;

    formDoc: FormGroup;
    states = [{id: "all",value: "All States"},
              {id: "active",value:"Active"},
              {id: "inactive",value:"Inactive"}];
    categories = [{id: "all",value: "All Categories"},
                  {id: "c1",value:"Category 2"},
                  {id: "c2",value:"Category 3"}]
    
    // filters
    private currentState: string = "all";
    private currentCategory: string ="all";
    private currentSearchText: string;
   

    constructor(private productForm         : FormBuilder,
                public dialog               : MatDialog,
                private activeRoute         : ActivatedRoute,
                private myProductsService    : MyProductsService,
                public snackBar             : MatSnackBar)
                {}

    ngOnInit() 
    {
    }

    // dynamically change row height
    getRowHeight(row){
        if(!row) return 40;
        return row.height;
    }

    stateFilter(event){
        // Clear search text when filtering by state
        this.clearSearch();

        this.currentState = event.value;
        var temp = this.filter();
        this.applyFilter(temp);

    }

    categoryFilter(event){
        // Clear search text when filtering by section
        this.clearSearch();

        this.currentCategory = event.value;
        var temp = this.filter();
        this.applyFilter(temp);
    }

    searchFilter(event){
        this.currentSearchText = event.target.value.toLowerCase();
        var temp = this.filter();
        this.applyFilter(temp)
    }

    clearSearch(){
        if (this.currentSearchText){
            this.currentSearchText = null;
            this.searchInput.nativeElement.value = null;
        }
    }

    filter(){
        var products: any[];

        if (this.currentState)
            products = this.MyProductsService.updateStateFilter(
                this.MyProductsService.temp,this.currentState
            )
        if (this.currentCategory)
            products = this.MyProductsService.updateCategoryFilter(
                products || this.MyProductsService.temp,this.currentSection
            )

        if (this.currentSearchText)
            products = this.MyProductsService.updateSearchFilter(
                products || this.MyProductsService.temp,this.currentSearchText
            )
        return products
    }

    applyFilter(temp){
        // update the rows
        this.myProductsService.products = temp;
        // Whenever the filter changes, always go back to the first page
        this.productsTable.offset = 0;
    }

    onPageChange(event: any){
        // Scroll to top on page change
        this.productsTable.element.scrollIntoView();
    }


    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
        duration: 3000,
        });
    }
}

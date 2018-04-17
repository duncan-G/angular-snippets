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
              {id: "inactive",value:"Inactive"}]
    private currentState: string = "all";
    private currentCategory: string ="all";
    private currentSearchText: string;
   

    constructor(private productForm         : FormBuilder,
                public dialog               : MatDialog,
                private activeRoute         : ActivatedRoute,
                private myProductsService    : MyProductsService,
                public snackBar             : MatSnackBar)
                {}

    ngOnInit() {
        this.myProductsService.getProducts();
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

    sectionFilter(event){
        // Clear search text when filtering by section
        this.clearSearch();

        this.currentSection = event.value;
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
        var listings: any[];

        if (this.currentState)
            listings = this.bulkUpdateService.updateStateFilter(
                this.bulkUpdateService.temp,this.currentState
            )
        if (this.currentSection)
            listings = this.bulkUpdateService.updateSectionFilter(
                listings || this.bulkUpdateService.temp,this.currentSection
            )

        if (this.currentSearchText)
            listings = this.bulkUpdateService.updateSearchFilter(
                listings || this.bulkUpdateService.temp,this.currentSearchText
            )
        return listings
    }

    applyFilter(temp){
        // update the rows
        this.myProductsService.products = temp;
        // Whenever the filter changes, always go back to the first page
        this.listingTable.offset = 0;
    }

    onPageChange(event: any){
        this.productsTable.element.scrollIntoView();
    }


    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
        duration: 3000,
        });
    }
}

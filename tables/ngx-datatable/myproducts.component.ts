import { OnInit, AfterViewInit, Component, ViewChild, ElementRef, Renderer2, Inject } from '@angular/core'
import { fuseAnimations } from '../../../core/animations';
import { AcceptedFile } from '../../../core/directives/dropzone/dropped-files/accepted-file';
import { FileState } from '../../../core/directives/dropzone/utilities/file-state';
import { DropZoneStyle } from '../../../core/directives/dropzone/utilities/drop-zone-style';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { display_fields_1, display_fields_2,restrictions } from './fields-models';
import { MatDialog } from '@angular/material';
import { FieldInfoPopupDialog } from './field-info-dialog/field-info-popup';
import { BulkUpdateService } from './bulk-update-products.service';

import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { MatPaginator, PageEvent } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FuseUtils } from '../../../core/fuseUtils';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { PapaParseService } from 'ngx-papaparse';
import { ListingValidatorService } from '../product/product-validator.service';
import { NgStyle, NumberFormatStyle } from '@angular/common';

@Component({
    selector   : 'bulk-update-products',
    templateUrl: './bulk-update-products.component.html',
    styleUrls  : ['./bulk-update-products.component.scss'],
    animations : fuseAnimations
})

  
  
export class BulkUpdateProductsComponent
{
    @ViewChild('fileInput') fileInput: ElementRef
    @ViewChild(DatatableComponent) listingTable: DatatableComponent;
    @ViewChild(DatatableComponent) errorTable: DatatableComponent;
    @ViewChild('searchFilterInput') searchInput: ElementRef;

    /* tslint:disable:no-unused-variable */
    // Supported file types
    private supportedFileTypes: string[] = ['text/csv'];
    /* tslint:enable:no-unused-variable */

    private currentCSVFile: string = '';
    private fileUploaded: boolean = false;
    private fileName: string;
    shop_name: string;
    formDoc: FormGroup;
    listingErrors: any[] = [];
    templateForm: FormGroup;
    fieldList_1 = display_fields_1;
    fieldList_2 = display_fields_2;
    display_more: boolean = false;
    upload_submitted: boolean = false;
    submitting: boolean = false;
    states = [{id: "all",value: "All States"},
              {id: "active",value:"Active"},
              {id: "inactive",value:"Inactive"}]
    private currentState: string = "all";
    private currentSection: any = 0;
    private currentSearchText: string;
    
    //
    // File being dragged has been dropped and is valid
    //
    /* tslint:disable:no-unused-variable */
    private dragFileAccepted(acceptedFile: AcceptedFile) {
        /* tslint:enable:no-unused-variable */

        // Load the image in
        this.fileName = acceptedFile.filename();
        let fileReader = new FileReader();
        fileReader.onload = () => {

            // Set and show the image
            this.currentCSVFile = fileReader.result;
            this.fileUploaded = true;
        };

        // Read in the file
        fileReader.readAsText(acceptedFile.file);
        this.formDoc.controls['requiredfile'].setValue([acceptedFile.file]);
    }

    constructor(private _fb                 : FormBuilder,
                public dialog               : MatDialog,
                private activeRoute         : ActivatedRoute,
                private bulkUpdateService   : BulkUpdateService,
                public snackBar             : MatSnackBar,
                private papa                : PapaParseService)
                {}

    ngOnInit() {
        this.formDoc = this._fb.group({
          basicfile: [],
          requiredfile: [{ value: undefined, disabled: false }, [Validators.required]]
        });
        this.templateForm = this._fb.group({})
        for (let field of this.fieldList_1){
            const control = new FormControl(null)
            this.templateForm.addControl(field.control_name,control);
        }
        for (let field of this.fieldList_2){
            const control = new FormControl(null)
            this.templateForm.addControl(field.control_name,control);
        }

        this.shop_name = this.activeRoute.snapshot.params['store']
        this.bulkUpdateService.shopChoices(this.shop_name)
    }

    ngAfterViewInit(){
        this.bulkUpdateService.getShopInfo(this.shop_name);
        this.bulkUpdateService.getProducts(this.shop_name);
    }

    onSubmit(){
        this.submitting = true;
        this._submit();
    }
    
    _submit() {
        let arrayObject = this.papa.parse(this.currentCSVFile,{delimiter:","});
        if (arrayObject.errors.length > 0){
            console.log('Error Reading CSV \n',arrayObject.errors);
        } else arrayObject = arrayObject.data
        
        let headers = arrayObject[0]
        let jsonArray = []

        for (let i in arrayObject){
            // Ignore headers and empty rows
            if (i == "0"){ continue }
            if (arrayObject[i].length === 1 && arrayObject[i][0] === "") { continue }

            // Convert array into a json object
            let obj = {}
            for (let j in headers){
                obj[headers[j]] = arrayObject[i][j]
            }
            jsonArray.push(obj)
        }

        let validator = new ListingValidatorService(this.bulkUpdateService.shop_choices);

        let i = 1;
        let listingErrors: any[] = [];
        this.listingErrors = [];

        for (let data of jsonArray){
            var valid = validator.validate(data);
            if (!valid){
                validator.errors["keys"] = Object.keys(validator.errors);
                validator.errors['row_id'] = i
                validator.errors['height'] = 40*validator.errors.keys.length
                listingErrors.push(validator.errors);
                }
            i++
        }

        this.listingErrors = listingErrors;
        this.errorTable.offset = 0;

        if(this.listingErrors.length === 0){
            this.bulkUpdateService.updateListings(JSON.stringify(jsonArray),this.shop_name)
                .subscribe((response:any) =>{
                    this.upload_submitted = true;
                    this.openSnackBar("Changes Have Been Submitted","Close")
                });
        }
        this.formDoc.controls['requiredfile'].setValue(null);
        this.submitting = false;
    }
    
    uploadAnother(){
        this.upload_submitted = false
    }

    getRowHeight(row){
        if(!row) return 40;
        return row.height;
    }

    displayMore(){
        this.display_more = true
    }

    fieldInfo(field)
    {
        this.dialog.open(FieldInfoPopupDialog, {
            data: {
                restrictions: restrictions[field],
                fieldName: field
            },
            width: "500px"
        });
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
        this.bulkUpdateService.products = temp;
        // Whenever the filter changes, always go back to the first page
        this.listingTable.offset = 0;
    }

    onPageChange(event: any){
        this.listingTable.element.scrollIntoView();
        console.log(event);
    }

    generateTemplate(){
        let template = this.cleanTemplateForm(this.templateForm.value);
        if (Object.keys(template).length === 0){
            this.openSnackBar("Please Select Fields To Change","Close")
            return
        }
        let listings = this.listingTable.selected
        if (Object.keys(listings).length === 0){
            this.openSnackBar("Please Select Listings To Change","Close")
            return
        }

        let headers = ['listing_id']
        headers = headers.concat(Object.keys(template))
        let body = this.cleanListings(listings)

        //Add headers to the first item
        for (let header of headers){
            if (!Object.keys(body[0]).includes(header)){
                body[0][header] = ''
            }
        }
        this.download(this.papa.unparse(body),'bulkUpdateListingsTemplate');

    }

    download(csvData,filename){
        var a: any = document.createElement("a");
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        var blob = new Blob([csvData], { type: 'text/csv' });
        var url= window.URL.createObjectURL(blob);
        a.href = url;
        
        var isIE = /*@cc_on!@*/false || !!(<any> document).documentMode;
        
        if (isIE)
        {   
            var retVal = navigator.msSaveBlob(blob, filename+'.csv');
        }
        else{
            a.download = filename+'.csv';
        }
        // If you will any error in a.download then dont worry about this. 
        a.click();
    }

    cleanListings(listings){
        let cleanListings = []
        for (let listing of listings){
            cleanListings.push({listing_id:listing.listing_id,
                                title: listing.title})
        }
        return cleanListings
    }

    cleanTemplateForm(form){
        let cleanForm = {}
        for (let item of Object.keys(form)){
            if (form[item] !== null){
                cleanForm[item] = form[item]
            }
        }
        return cleanForm
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
        duration: 3000,
        });
    }
}

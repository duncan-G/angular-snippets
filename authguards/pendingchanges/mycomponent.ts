import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { DataModel } from './models';
import { MyService } from '.mycomponent.service.ts';

@Component({
    selector     : 'my-component',
    templateUrl  : '.my-component.html',
    styleUrls    : ['.my-component.scss'],
})

export class MyComponent implements OnInit, OnDestroy
{
    myForm: FormGroup;
    onFormChanged: Subscription;
    data:  new DataModel();
    
    constructor(
        private myService       : MyService,
        private formBuilder     : FormBuilder,
        public  snackBar        : MatSnackBar,
        public  dialog          : MatDialog,
    )
    
    ngOnInit()
    {
        // Subscribe to update data on changes
        this.onFormChanged =
            this.myService.onDataChanged
                .subscribe(data => {
                    if ( data )
                    {
                        this.data = new DataModel(data);
                    }
                    else 
                    {
                        this.data = new DataModel();
                    }
                    this.myForm = this.createForm();
                });
    }
    
    createProductForm()
    {
        return this.formBuilder.group({
            data_id             : [this.data.data_id,Validators.required],
            field_one           : [this.data.field_one,Validators.required],
            field_two           : [this.data.field_two,Validators.maxLength(140)],
            field_three         : [this.data.field_three]
    });
    
    saveModel()
    {
        const data = this.myForm.getRawValue();
        
        // Only save the fields that have changed
        let diff = this.pruneUnchangedFields(this.product,data);
        
        this.myService.saveModel([diff])
            .then(() => {

                // Trigger the subscription with new data
                this.myService.onFormChanged.next(data);

                // Show the success message
                this.snackBar.open('Form saved', 'OK', {
                    verticalPosition: 'top',
                    duration        : 2000
                });
            });

    }
    
    pruneUnchangedFields(original,edited)
    {
        var diff = {'data_id': original.data_id};
        var edited_keys = Object.keys(edited);

        for (let key of Object.keys(original)){
            if (!edited_keys.includes(key)) { }
            else if (original[key] != edited[key]) {
                diff[key] = edited[key]
            }
        };

        return diff
    }

    canDeactivate(): Promise<boolean> {
        let result = this.checkPendingChanges().catch(error => {
            console.log(error)
            return false
        })
        return result
    }

    checkPendingChanges(): Promise<boolean>
    {
        return new Promise<boolean>((resolve, reject) => {
            if (this.myForm.pristine) resolve(true)

            //check if pending changes are unsaved
            if(!this.myForm.pristine) {
                let dialogRef = this.dialog.open(PendingChangesPopupDialog, {
                    width: '350px',
                });
                dialogRef.afterClosed()
                    .subscribe(result => {
                        if (result) resolve(true);
                        else reject(false)
                    });
            }
            else resolve(true);
        });
    }

    ngOnDestroy()
    {
        this.onFormChanged.unsubscribe();
    }
}

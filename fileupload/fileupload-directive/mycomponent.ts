import { OnInit, Component, ViewChild, ElementRef, Renderer2, Inject } from '@angular/core'
import { AcceptedFile } from '../../../core/directives/dropzone/dropped-files/accepted-file';
import { FileState } from '../../../core/directives/dropzone/utilities/file-state';
import { DropZoneStyle } from '../../../core/directives/dropzone/utilities/drop-zone-style';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MyService } from './myservice';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { NgStyle, NumberFormatStyle } from '@angular/common';

@Component({
    selector   : 'my-component',
    templateUrl: './mycomponent.html',
    styleUrls  : ['./mycomponent.scss'],
})

  
  
export class MyComponent
{
    @ViewChild('fileInput') fileInput: ElementRef

    /* tslint:disable:no-unused-variable */
    // Supported file types
    private supportedFileTypes: string[] = ['text/csv'];
    /* tslint:enable:no-unused-variable */

    private fileUploaded: boolean = false;
    private fileName: string;
    fileUploadForm: FormGroup;
    public fileObject: any;
    upload_submitted: boolean = false;
    submitting: boolean = false;

    
    //
    // File being dragged has been dropped and is valid
    //
    /* tslint:disable:no-unused-variable */
    private dragFileAccepted(acceptedFile: AcceptedFile) {
        /* tslint:enable:no-unused-variable */

        // Load the file in
        this.fileName = acceptedFile.filename();
        let fileReader = new FileReader();
        fileReader.onload = () => {

            // Set and and if image show the image
            this.fileObject = fileReader.result;
            this.fileUploaded = true;
        };

        // Read in the file if CSV file or text file
        // fileReader.readAsText(acceptedFile.file);
        this.fileUploadForm.controls['requiredfile'].setValue([acceptedFile.file]);
    }

    constructor(private _fb                 : FormBuilder,
                public dialog               : MatDialog,
                private activeRoute         : ActivatedRoute,
                private myService           : MyService,
                )
                {}

    ngOnInit() {
        this.fileUploadForm = this._fb.group({
          requiredfile: [{ value: undefined, disabled: false }, [Validators.required]]
        });
    }
    
    onSubmit(){
        this.submitting = true;
        this._submit();
    }
    
    _submit() {
        this.myService.submitFile(this.fileObject);
        this.formDoc.controls['requiredfile'].setValue(null);
        this.submitting = false;
    }
    
    uploadAnother(){
        this.upload_submitted = false
    }   
}

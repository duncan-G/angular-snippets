import { OnInit, Component, ViewChild, ElementRef, Renderer2, Inject } from '@angular/core'
import { AcceptedFile } from '../../../core/directives/dropzone/dropped-files/accepted-file';
import { FileState } from '../../../core/directives/dropzone/utilities/file-state';
import { DropZoneStyle } from '../../../core/directives/dropzone/utilities/drop-zone-style';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MyService } from './myservice';
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

        // Read in the file 
        fileReader.readAsText(acceptedFile.file);
        this.fileUploadForm.controls['requiredfile'].setValue([acceptedFile.file]);
    }

    constructor(private _fb                 : FormBuilder,
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
        this.myService.submitFile(this.fileObject)
            .subscribe( 
                response => {
                this.fileUploadForm.controls(['requiredfile'].setValue(null);
                this.submitting = false;},
                error => {
                    console.log(error);
                });
        }
    }
    
    uploadAnother(){
        this.upload_submitted = false
    }   
}

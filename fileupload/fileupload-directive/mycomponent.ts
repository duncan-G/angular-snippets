<blockquote class="m-12">
        <span class="mat-display-2">Upload File</span>
</blockquote>
<form *ngIf="(!submitting && !upload_submitted)" class="upload-section" [formGroup]="fileUploadForm" (ngSubmit)="onSubmit()">
    <mat-form-field class="upload-section-input">
        <app-input-file formControlName="requiredfile" placeholder="Click Here To Upload"></app-input-file>
        <mat-icon matSuffix>folder</mat-icon>
    </mat-form-field>
    <div class="upload-section-dropzone"
        FileDrop [FileDropSupportedFileTypes]="supportedFileTypes"
        (FileDropFileAccepted)="dragFileAccepted($event)">
        <div fxLayout="row" fxLayoutAlign="center center" class="upload-section-request-group">
            <div class="upload-icon-container">
                <img class ="upload-icon" src="/assets/icons/upload.svg" />
                <p class="upload-instructions"> Drag And Drop</p>
            </div>
        </div>
    </div>
    <div class="button-container">
        <button color="accent" (submit)="onSubmit()" type="submit" [disabled]="fileUploadForm.invalid" mat-raised-button>Submit</button>
    </div> 
</form>

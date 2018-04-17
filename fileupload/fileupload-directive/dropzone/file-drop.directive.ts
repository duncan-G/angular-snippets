import { Directive, EventEmitter, ElementRef, Renderer, HostListener, Output, Input, OnInit } from '@angular/core';

import { FileState } from './utilities/file-state';
import { DropZoneStyle } from './utilities/drop-zone-style';
import { RejectionReasons } from './properties/rejection-reasons';

import { AcceptedFile } from './dropped-files/accepted-file';
import { RejectedFile } from './dropped-files/rejected-file';
import { DroppedFiles } from './dropped-files/dropped-files';

//
// Directive to support dragging and dropping and element onto a div
//
@Directive({
    // Selector required in component HTML
    selector: '[FileDrop]',
})
export class FileDropDirective implements OnInit {

    @Output()
    public FileDropHoverStart: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    public FileDropHoverEnd: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    public FileDropFileAccepted: EventEmitter<AcceptedFile> = new EventEmitter<AcceptedFile>();
    @Output()
    public FileDropFileRejected: EventEmitter<RejectedFile> = new EventEmitter<RejectedFile>();
    @Output()
    public FileDropFilesDropped: EventEmitter<DroppedFiles> = new EventEmitter<DroppedFiles>();

    @Input()
    public FileDropAcceptMultiple: boolean;
    @Input()
    public FileDropSupportedFileTypes: string[];
    @Input()
    public FileDropMaximumSizeBytes: number;
    @Input()
    public FileDropDisableStyles: boolean;

    // Keep track of our dropped files
    private fileService: FileState = new FileState();
    private dropZoneStyle: DropZoneStyle = null;

    //
    // Constructor requires an element reference that instantiated this directive
    //
    public constructor(private element: ElementRef, private renderer: Renderer) {
    }

    //
    // Initialisation
    //
    public ngOnInit() {
        // Set our properties
        this.fileService.setExpectedFileProperties(this.FileDropSupportedFileTypes, this.FileDropMaximumSizeBytes);
        if (this.FileDropDisableStyles !== true) {
            this.dropZoneStyle = new DropZoneStyle(this.element, this.renderer);
        }
    }

    //
    // Called when the element has content dragged over
    //
    @HostListener('dragover', ['$event'])
    public onDragOver(event: Event): void {

        // If we're already in the on-drag, don't bother with this
        if (this.fileService.currentFile === null) {

            // Get the object being dragged and reference it as a copy action
            this.fileService.currentFile = this.getDataTransferObject(event);
            if (this.fileService.currentFile === null) {
                return;
            }

            // Let the client know
            this.FileDropHoverStart.emit();
            if (this.dropZoneStyle !== null) {
                this.dropZoneStyle.onHoverStart();
            }
        }

        // Don't propagate
        this.preventAndStopEventPropagation(event);
    }

    //
    // Called when the element has dragged content leave
    //
    @HostListener('dragleave', ['$event'])
    public onDragLeave(event: Event): void {

        // Only bother if we have a file
        if (this.fileService.currentFile !== null) {

            // Finished with the file
            this.fileService.currentFile = null;
            if (event.currentTarget === (this as any).element[0]) {
                return;
            }

            // Let the client know
            this.FileDropHoverEnd.emit();
            if (this.dropZoneStyle !== null) {
                this.dropZoneStyle.onHoverEnd();
            }
        }

        // Don't let it continue
        this.preventAndStopEventPropagation(event);
    }

    //
    // Called when the element has content dropped
    //
    @HostListener('drop', ['$event'])
    public onDrop(event: Event): void {

        // Only bother if we have a file
        if (this.fileService.currentFile !== null) {

            // Let the client know
            this.FileDropHoverEnd.emit();
            if (this.dropZoneStyle !== null) {
                this.dropZoneStyle.onHoverEnd();
            }

            // Update our data
            this.fileService.currentFile = this.getDataTransferObject(event);
            
            if (this.FileDropAcceptMultiple) {

                // Check if our files are valid or not
                let droppedFiles: DroppedFiles = this.fileService.verifyFiles();

                this.FileDropFilesDropped.emit(droppedFiles);
                if (this.dropZoneStyle !== null) {
                    if (droppedFiles.areAllAccepted()) {
                        this.dropZoneStyle.onFileAccepted();
                    } else {
                        this.dropZoneStyle.onFileRejected();
                    }
                }
            } else {

                // Check if our file is valid or not
                let rejectionReason: RejectionReasons = this.fileService.isFileValid();

                let fileData: File = this.fileService.getFiles()[0];
                if (rejectionReason === RejectionReasons.None) {
                    this.FileDropFileAccepted.emit(new AcceptedFile(fileData));
                    if (this.dropZoneStyle !== null) {
                        this.dropZoneStyle.onFileAccepted();
                    }
                } else {
                    this.FileDropFileRejected.emit(new RejectedFile(fileData, rejectionReason));
                    if (this.dropZoneStyle !== null) {
                        this.dropZoneStyle.onFileRejected();
                    }
                }
            }

            // Finished with the file
            this.fileService.currentFile = null;
        }

        // Don't let it continue
        this.preventAndStopEventPropagation(event);
    }

    //
    // Stops the drag/drop events propagating
    //
    private preventAndStopEventPropagation(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
    }

    //
    // Returns the file dragged into the directive
    //
    private getDataTransferObject(event: Event | any): DataTransfer {
        return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer;
    }

    //
    // Called when the element has received user input
    //
    @HostListener('change', ['$event'])
    public onInput(event: Event): void {
        let fileList = this.getFileObject(event)
        if (this.FileDropAcceptMultiple) {

            // Check if our files are valid or not
            let droppedFiles: DroppedFiles = this.fileService.verifyFiles(fileList);

            this.FileDropFilesDropped.emit(droppedFiles);
            if (this.dropZoneStyle !== null) {
                if (droppedFiles.areAllAccepted()) {
                    this.dropZoneStyle.onFileAccepted();
                } else {
                    this.dropZoneStyle.onFileRejected();
                }
            }
        } else {

            // Check if our file is valid or not
            let rejectionReason: RejectionReasons = this.fileService.isFileValid(fileList);

            let fileData: File = fileList[0]
            if (rejectionReason === RejectionReasons.None) {
                this.FileDropFileAccepted.emit(new AcceptedFile(fileData));
                if (this.dropZoneStyle !== null) {
                    this.dropZoneStyle.onFileAccepted();
                }
            } else {
                this.FileDropFileRejected.emit(new RejectedFile(fileData, rejectionReason));
                if (this.dropZoneStyle !== null) {
                    this.dropZoneStyle.onFileRejected();
                }
            }
        }
    }

    getFileObject(event)
    {
        return event.target.files
    }
}
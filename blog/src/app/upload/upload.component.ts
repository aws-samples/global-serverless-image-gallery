import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import * as $ from 'jQuery';
import * as AWS from 'aws-sdk';


@Component({
    selector: 'app-upload',
    templateUrl: './upload.component.html']
})
export class UploadComponent implements OnInit {

    acceptedMimeTypes = [
        'image/gif',
        'image/jpeg',
        'image/png'
    ];

    @ViewChild('fileInput') fileInput: ElementRef;
    fileDataUri = '';
    errorMsg = '';

    constructor(private http: HttpClient) {

    }

    ngOnInit() {

    }

    previewFile() {
        const file = this.fileInput.nativeElement.files[0];
        if (file && this.validateFile(file)) {
            const reader = new FileReader();
            reader.readAsDataURL(this.fileInput.nativeElement.files[0]);
            reader.onload = () => {
                this.fileDataUri = reader.result;
            }
            this.errorMsg = "";
        } else {
            // this.errorMsg = 'File must be jpg, png, or gif and cannot be more than 500 KB in size'
        }
    }

    uploadFile(event: Event) {

        event.preventDefault();
        $('#loading').removeClass('kv-hidden');

        if (this.fileDataUri.length > 0) {
            //const base64File = this.fileDataUri.split(',')[1];
            //const data = { 'image': base64File };

            var objFile = $('#file-1')[0].files[0];
            
            $.ajax({
                url: environment.apiUrl + "/upload-photo",
                type: 'POST',
                data: JSON.stringify({
                    "fileName": objFile.name,
                    "contentType": objFile.type,
                }),
                dataType: 'json',
                crossDomain: true,
                contentType: 'application/json',
                context: this,
                success: function(res, status) {
                    
                    $.ajax({
                        url: res.url, // the presigned URL
                        type: 'PUT',
                        contentType: objFile.type,
                        processData: false,
                        data: objFile,
                        context: this,
                        crossDomain: true,
                        success: function(res, status) {
                            this.processResp();
                        },
                        error: function(error) {
                            console.log(error)
                            $('#loading').addClass('kv-hidden');
                            this.errorMsg = 'Could not upload your image : ' + error.message;
                        }
                      });
                },
                error: function(error) {
                    console.log(error)
                    $('#loading').addClass('kv-hidden');
                    this.errorMsg = 'Could not upload your image : ' + error.message;
                }
            });
        }
    }
    processResp() {
        this.fileInput.nativeElement.value = '';
        $('#loading').addClass('kv-hidden');
        this.errorMsg = 'Your image has been published.';
    }
    validateFile(file) {
        return this.acceptedMimeTypes.includes(file.type) && file.size < 500000;
    }
}
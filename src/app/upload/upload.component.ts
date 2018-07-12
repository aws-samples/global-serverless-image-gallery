import {Component, ElementRef, ViewChild, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import * as $ from 'jQuery'; 
import * as AWS from 'aws-sdk';
import apigClientFactory from 'aws-api-gateway-client'

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
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
      const base64File = this.fileDataUri.split(',')[1];
      const data = {'image': base64File};

    var config =   {
	    invokeUrl: environment.apiUrl+"/upload-photo",
	    accessKey: AWS.config.credentials.accessKeyId,
	    secretKey: AWS.config.credentials.secretAccessKey,
	    sessionToken: AWS.config.credentials.sessionToken, 
	    region: environment.region, 
	    systemClockOffset: 0, 
	    retries: 4
	}

	var apigClient = apigClientFactory.newClient(config);

  	apigClient.invokeApi({}, '', 'POST', {}, data)
    .then((res) => this.processResp(res)).
    catch( error => {
        	console.log(error)
    		$('#loading').addClass('kv-hidden');
    		this.errorMsg = 'Could not upload your image : '+error.message;
    });
    }
  }

  processResp(response) {
  	this.fileInput.nativeElement.value = '';
    $('#loading').addClass('kv-hidden');
    this.errorMsg = 'Your image has been published.';
  }

  validateFile(file) {
    return this.acceptedMimeTypes.includes(file.type) && file.size < 500000;
  }
}


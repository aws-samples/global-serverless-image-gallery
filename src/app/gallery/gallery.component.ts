import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import * as $ from 'jQuery';
import * as AWS from 'aws-sdk';
import apigClientFactory from 'aws-api-gateway-client'

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    searchImage(srcKey) {

        var config = {
            invokeUrl: environment.apiUrl+"/searchimage",
            accessKey: AWS.config.credentials.accessKeyId,
            secretKey: AWS.config.credentials.secretAccessKey,
            sessionToken: AWS.config.credentials.sessionToken,
            region: environment.region,
            systemClockOffset: 0,
            retries: 4
        }

        var apigClient = apigClientFactory.newClient(config);

        apigClient.invokeApi({}, '', 'GET', { queryParams: { searchKey: srcKey } }, null)
            .then((res) => this.processResp(res))
            .catch(error => {
                console.log("Error happened" + error)
            });
    }

    processResp(response) {
        var innerHTML = '';
        console.log(JSON.stringify(response));

        if (response != undefined && response != null && response.data != undefined && response.data != null && response.data.length > 0) {
            response.data.forEach(function(item, index, array) {
                innerHTML = innerHTML + "<div class='responsive'><div  class='gallery'><a target='_blank' href='" + item.sUrl + "'><img alt=" + item.name + " src='" + item.sUrl + "' style='height:178px; width:160px'></a><div class='desc'>confidence : " + Math.round(item.confidence * 100) / 100 + "%</div></div></div>"
            });
            $("#gallery").html(innerHTML);
            $('#no-rec').css('display', 'none');
            $('#gallery').css('display', 'inline-block');
        } else {
            $('#no-rec').css('display', 'inline-block');
            $('#gallery').css('display', 'none');
        }


        
        console.log("Success Response" + response)
    }
}
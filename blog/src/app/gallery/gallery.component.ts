import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import * as $ from 'jQuery';
import * as AWS from 'aws-sdk';

@Component({ 
    selector: 'app-gallery',
    templateUrl: './gallery.component.html']
})
export class GalleryComponent implements OnInit {

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    searchImage(srcKey) {

     var data = {  searchKey: srcKey  };
     $.ajax({
                url: environment.apiUrl+"/searchimage",
                type: 'GET',
                data: data,
                dataType: 'json',
                crossDomain: true,
                contentType: 'application/json',
                context: this,
                success: function(res, status) {
                    this.processResp(res);
                },
                error: function(error) {
                    console.log(error)
                }
            });
           
    }

    processResp(response) {
        var innerHTML = '';
        console.log(JSON.stringify(response));
        if (response != undefined && response != null && response.length > 0) {
            response.forEach(function(item, index, array) {
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
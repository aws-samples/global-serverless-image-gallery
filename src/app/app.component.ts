import { Component } from '@angular/core';
import {FbLoginService} from './service/fb-login.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent {
    title = 'app';

    constructor(public facebookLogin: FbLoginService) {

    }  
}
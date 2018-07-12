import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { UploadComponent } from './upload/upload.component';
import { GalleryComponent } from './gallery/gallery.component';
import {FbLoginService} from './service/fb-login.service';


@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    GalleryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [FbLoginService],
  bootstrap: [AppComponent]
})
export class AppModule { }

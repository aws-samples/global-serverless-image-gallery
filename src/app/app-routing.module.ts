import { NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate } from '@angular/router'
import { UploadComponent } from './upload/upload.component';
import { GalleryComponent } from './gallery/gallery.component';

const routes: Routes = [{
        path: '',
        component: UploadComponent,
        pathMatch: 'full'
    },
    {
        path: 'upload',
        component: UploadComponent
    },
    {
        path: 'gallery',
        component: GalleryComponent
    },
    {
        path: 'logout',
        component: UploadComponent
    },
    {
        path: '**',
        redirectTo: ''
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
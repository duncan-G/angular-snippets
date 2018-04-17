import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../auth.guard';
import { PendingChangesGuard } from  './guards/pending-changes.guard'
import { MyProductsComponent } from './mycomponent';
import { MyProductsService } from './myservice';

const routes: Routes = [
    {
        path        : 'data',
        component   : MyProductsComponent,
        resolve     : {
            data: MyProductsService
        },
        canActivate : [AuthGuard],
    },
]

@NgModule({
    imports     : [
        RouterModule.forChild(routes),
    ],

    declarations: [
        MyProductsComponent
    ],
    
    providers   : [
        MyProductsService
    ]
})

export class MyPoductsModule
{
}

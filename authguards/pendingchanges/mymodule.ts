import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../auth.guard';
import { PendingChangesGuard } from  './guards/pending-changes.guard'
import { MyComponent } from './mycomponent';
import { MyService } from './myservice';
import { PendingChangesPopupDialog } from './pending-changes-popup';

const routes: Routes = [
    {
        path        : 'data',
        component   : MyComponent,
        resolve     : {
            data: MyService
        },
        canActivate : [AuthGuard],
        canDeactivate: [PendingChangesGuard]
    },
]

@NgModule({
    imports     : [
        RouterModule.forChild(routes),
    ],

    declarations: [
        MyComponent
    ],
    
    entryComponents: [
        PendingChangesPopupDialog,
    ],
    
    providers   : [
        MyService
    ]
})

export class MyModule
{
}

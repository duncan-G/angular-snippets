import { Component, ElementRef, HostBinding, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { style, animate, AnimationBuilder, AnimationPlayer } from '@angular/animations';
import { Subscription } from 'rxjs/Subscription';
import { MyProductsService } from '../products.service';
import { Router } from '@angular/router';

@Component({
    selector   : 'products-filter-menu',
    templateUrl: './filter-menu.component.html',
    styleUrls  : ['./filter-menu.component.scss'],
})
export class ProductsSideMenuComponent implements OnInit
{
    @ViewChild('openButton') openButton;
    @ViewChild('panel') panel;
    @ViewChild('overlay') overlay: ElementRef;

    public player: AnimationPlayer;
    fuseSettings: any;
    states :any[] = [
        {'value': 'active',     'viewValue': 'Active',     'reason' : 'Active'},
        {'value': 'removed',    'viewValue': 'Removed',    'reason' : 'Listing Has Been Removed By Owner'},
        {'value': 'sold_out',   'viewValue': 'Sold Out',   'reason' : 'Listing Has Sold Out'},
        {'value': 'expired',    'viewValue': 'Expired',    'reason' : 'Listing Has Expired'},
        {'value': 'edit',       'viewValue':'Inactive',   'reason' : 'Listing Is Inactive'},
        {'value': 'draft',      'viewValue': 'Draft',      'reason' : 'New Listing Is in Draft Mode'},
        {'value': 'private',    'viewValue': 'Private',    'reason' : 'Private Listing'},
        {'value': 'unavailable','viewValue':'Unavailabe', 'reason' : 'Listing Has Been Removed By Etsy Admin For Unspecified Reasons'}
    ]

    @HostBinding('class.bar-closed') barClosed: boolean;

    constructor(
        private animationBuilder: AnimationBuilder,
        private renderer: Renderer2,
        private productService: MyProductsService,
    )
    {
        this.barClosed = true;
    }

    ngOnInit()
    {
        this.renderer.listen(this.overlay.nativeElement, 'click', () => {
            this.closeBar();
        });
    }

    closeBar()
    {
        this.player =
            this.animationBuilder
                .build([
                    style({transform: 'translate3d(0,0,0)'}),
                    animate('400ms ease', style({transform: 'translate3d(100%,0,0)'}))
                ]).create(this.panel.nativeElement);

        this.player.play();

        this.player.onDone(() => {
            this.barClosed = true;
        });
    }

    openBar()
    {
        this.barClosed = false;

        this.player =
            this.animationBuilder
                .build([
                    style({transform: 'translate3d(100%,0,0)'}),
                    animate('400ms ease', style({transform: 'translate3d(0,0,0)'}))
                ]).create(this.panel.nativeElement);

        this.player.play();
    }

    filterProductsByState(state)
    {
        this.productService.filterProductsByState(state);
        this.closeBar();
    }

}

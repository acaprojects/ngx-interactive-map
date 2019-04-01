
import { Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

import { BaseWidgetComponent } from '../../../base.component';
import { PointOfInterest } from '../../map-overlay-outlet/map-overlay-outlet.component';

@Component({
    selector: 'map-range',
    templateUrl: './map-range.template.html',
    styleUrls: ['./map-range.styles.scss'],
    animations: [
        trigger('show', [
            transition(':enter', [ style({ opacity: 0 }), animate(300, style({ opacity: 1 })) ]),
            transition(':leave', [ style({ opacity: 1 }), animate(300, style({ opacity: 0 })) ]),
        ]),
    ],
})
export class MapRangeComponent extends BaseWidgetComponent {
    public size = 10;

    constructor(protected context: PointOfInterest) { super(); }
}

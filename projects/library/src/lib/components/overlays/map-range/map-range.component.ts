
import { Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

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
export class MapRangeComponent {
    /** Default diameter of the range circle */
    public diameter = 10;
    /** Contextual data associated with the component */
    public context: PointOfInterest;
    /** Reference size for scaling the cicle */
    public base_size: number;
    /** Background colour of the range circle */
    public background: string;
    /** Border colour of the range circle */
    public border: string;
    /** Display text for the range cirlce */
    public text: string;

    constructor(context: PointOfInterest) {
        this.context = context || {} as any;
        if (!this.context.data) { this.context.data = {}; }
        this.text = this.context.data.text || '';
        this.background = this.context.data.background || this.context.data.bg_alpha || 'rgba(3, 169, 244, .54)';
        this.border = this.context.data.border || this.context.data.bg || '#03A9F4';
        const map_state = this.context.data.map_state || {};
        this.base_size = map_state.dim || 2;
    }
}

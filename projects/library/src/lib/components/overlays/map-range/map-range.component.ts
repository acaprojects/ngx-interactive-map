import { Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

import { AMapFeature } from '../../map-feature/map-feature.class';
import { BaseWidgetDirective } from '../../../base.directive';

@Component({
    selector: 'map-range',
    templateUrl: './map-range.template.html',
    styleUrls: ['./map-range.styles.scss'],
    animations: [
        trigger('show', [
            transition(':enter', [style({ opacity: 0 }), animate(300, style({ opacity: 1 }))]),
            transition(':leave', [style({ opacity: 1 }), animate(300, style({ opacity: 0 }))])
        ])
    ]
})
export class MapRangeComponent extends BaseWidgetDirective {
    /** Default diameter of the range circle */
    public diameter = 10;
    /** Contextual data associated with the component */
    public context: AMapFeature;
    /** Reference size for scaling the cicle */
    public base_size: number;
    /** Background colour of the range circle */
    public background: string;
    /** Border colour of the range circle */
    public border: string;
    /** Display text for the range cirlce */
    public text: string;

    private previous_size = 0;

    constructor(context: AMapFeature) {
        super();
        this.context = context || ({} as any);
        this.text = this.context.data.text || '';
        this.background = this.context.data.background || this.context.data.bg_alpha || 'rgba(3, 169, 244, .54)';
        this.border = this.context.data.border || this.context.data.bg || '#03A9F4';
        this.base_size = (this.context.zoom || 1) * 5;
        this.context.zoomChanges((zoom: number) => this.updateZoom(zoom));
    }

    private updateZoom(zoom: number): void {
        if (this.subs.timers.zoom) {
            return this.timeout('retry_zoom', () => this.updateZoom(zoom), 10);
        }
        if (this.previous_size !== zoom) {
            this.timeout(
                'zoom',
                () => {
                    this.base_size = Math.round((zoom || 1) * 5);
                    this.previous_size = this.base_size;
                    this.subs.timers.zoom = null;
                },
                10
            );
        }
    }
}

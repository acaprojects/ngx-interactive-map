
import { Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { AMapFeature } from '../../map-feature/map-feature.class';


@Component({
    selector: 'map-pin',
    templateUrl: './map-pin.template.html',
    styleUrls: ['./map-pin.styles.scss'],
    animations: [
        trigger('show', [
            transition(':enter', [
                style({ transform: 'translate(-50%, -100%)', opacity: 0 }),
                animate(300, style({ transform: 'translate(-50%, 0%)', opacity: 1 })),
            ]),
            transition(':leave', [style({ opacity: 1 }), animate(300, style({ opacity: 0 }))]),
        ]),
    ],
})
export class MapPinComponent {
    /** Contextual data associated with the component */
    public context: AMapFeature;
    /** Display text above the pin */
    public text: string;
    /** Primary colour of the pin */
    public back: string;
    /** Secondary colour of the pin */
    public fore: string;

    constructor(context: AMapFeature) {
        this.context = context || {} as any;
        this.text = this.context.data.text || '';
        this.back = this.context.data.back || '#FFFFFF';
        this.fore = this.context.data.fore || '#DC6900';
    }
}

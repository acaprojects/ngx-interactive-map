import { Component, OnInit, Inject } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

import { MAP_OVERLAY_DATA } from '../../../helpers/map.interfaces';

export interface MapPinData {
    /** Text to render above the pin */
    readonly text: string;
    /** CSS colour of the pin outline */
    readonly stroke: string;
    /** CSS colour of the pin */
    readonly fill: string;
}

@Component({
    selector: 'a-map-pin',
    templateUrl: './map-pin.component.html',
    styleUrls: ['./map-pin.component.scss'],
    animations: [
        trigger('show', [
            transition(':enter', [
                style({ transform: 'translate(-50%, -100%)', opacity: 0 }),
                animate(200, style({ transform: 'translate(-50%, 0%)', opacity: 1 })),
            ]),
            transition(':leave', [style({ opacity: 1 }), animate(200, style({ opacity: 0 }))]),
        ]),
        trigger('showText', [
            transition(':enter', [
                style({ transform: 'translate(-50%, -200%)', opacity: 0 }),
                animate(200, style({ transform: 'translate(-50%, -100%)', opacity: 1 })),
            ]),
            transition(':leave', [style({ opacity: 1 }), animate(200, style({ opacity: 0 }))]),
        ]),
    ],
})
export class MapPinComponent {

    public show_text: boolean = false;

    public get text(): string {
        return this.show_text ? (this._data ? this._data.text : '') : '';
    }

    public get stroke(): string {
        return (this._data ? this._data.stroke : '') || '#fff';
    }

    public get fill(): string {
        return (this._data ? this._data.fill : '') || '#f44336';
    }

    constructor(@Inject(MAP_OVERLAY_DATA) private _data: MapPinData) {
        setTimeout(() => this.show_text = true, 300);
    }
}

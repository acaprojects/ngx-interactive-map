import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { MAP_OVERLAY_DATA, MAP_STATE } from '../../map-overlay-outlet/map-overlay-outlet.component';
import { MapState } from '../../../helpers/map.interfaces';

export interface MapRadiusData {
    /** Text to render above the pin */
    readonly text: string;
    /** Diameter of the radius circle in em at 100% zoom */
    readonly diameter: number;
    /** Fill colour of the map radius circle */
    readonly fill: string;
}

@Component({
    selector: 'a-map-radius',
    templateUrl: './map-radius.component.html',
    styleUrls: ['./map-radius.component.scss']
})
export class MapRadiusComponent implements OnInit, OnDestroy {
    /** Current zoom level of the map */
    public zoom: number = 1;
    /** Subscription to the state of the map */
    private _sub: Subscription;

    /** Diameter of the radius circle */
    public get diameter(): number {
        return (this._data ? this._data.diameter : 0) || 5;
    }

    public get text(): string {
        return this._data ? this._data.text : '';
    }

    public get fill(): string {
        return (this._data ? this._data.fill : '') || '#f44336';
    }


    constructor(
        @Inject(MAP_OVERLAY_DATA) private _data: MapRadiusData,
        @Inject(MAP_STATE) private _state: BehaviorSubject<MapState>
    ) {}

    public ngOnInit() {
        this._sub = this._state.subscribe((state) => {
            this.zoom = state.zoom;
        });
    }

    public ngOnDestroy(): void {
        if (this._sub) {
            this._sub.unsubscribe();
            this._sub = null;
        }
    }
}

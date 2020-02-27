import { Component, Input, Injector, SimpleChanges, OnChanges, Type } from '@angular/core';
import { MapRenderFeature } from '../../classes/map-render-feature';
import { HashMap, Point } from '../../helpers/type.helpers';
import { MapState, MAP_STATE, MAP_LOCATION, MAP_OVERLAY_DATA } from '../../helpers/map.interfaces';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'map-overlay-outlet',
    templateUrl: './map-overlay-outlet.component.html',
    styleUrls: ['./map-overlay-outlet.component.scss']
})
export class MapOverlayOutletComponent implements OnChanges {
    /** List of text items to render on top of the map */
    @Input() items: MapRenderFeature[] = [];
    /** Rotation of the map */
    @Input() zoom = 1;
    /** Rotation of the map */
    @Input() center: Point = { x: .5, y: .5 };
    /** Rotation of the map */
    @Input() rotation = 0;
    /** List of injectors for overlay items */
    public injectors: HashMap<Injector> = {};
    /** Emitter for changes to the state of the map */
    private _state: BehaviorSubject<MapState> = new BehaviorSubject({ zoom: 1, center: { x: 0.5, y: 0.5 } });

    constructor(private _injector: Injector) {}

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.items && this.items) {
            delete this.injectors;
            this.injectors = {};
            for (const item of this.items) {
                if (item.content instanceof Type) {
                    this.injectors[item.id] = this._createInjector(item);
                }
            }
        }
        if (changes.zoom || changes.center) {
            this._state.next({
                zoom: this.zoom || 1,
                center: this.center || { x: 0.5, y: 0.5 }
            });
        }
    }

    public trackByFn(item: MapRenderFeature, index: number) {
        return item.id || JSON.stringify(item.coordinates) || index;
    }

    /**
     * Create injector for overlay element
     * @param item Feature needing a injector
     */
    private _createInjector(item: MapRenderFeature) {
        return Injector.create({
            providers: [
                { provide: MAP_STATE, useValue: this._state },
                { provide: MAP_LOCATION, useValue: item.coordinates },
                { provide: MAP_OVERLAY_DATA, useValue: item.data }
            ],
            parent: this._injector
        });
    }
}

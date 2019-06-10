
import { Injector, TemplateRef, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { AMapComponent } from '../map/map.component';
import { IReadonlyMapPoint, MapOverlayContent, IMapFeature } from '../map.interfaces';

export class AMapFeature<T = any> {
    /** Map Element selector */
    readonly id: string;
    /** Map coordinates */
    readonly coordinates: IReadonlyMapPoint;
    /** Content to render at position */
    readonly content: MapOverlayContent;
    /** Content render method. Determined automatically from `content` value */
    readonly method: 'component' | 'text' | 'template';
    /** Data to inject into the content template/component */
    private _data: T;
    /** Inject for passing data into components */
    private _inject: Injector;
    /** Location of the feature on the map */
    private _position: IReadonlyMapPoint;

    constructor(private _map: AMapComponent, private _injector: Injector, data: IMapFeature<T>) {
        if (!this._map || !this._injector) {
            throw new Error('Cannot build map feature without map or injector');
        }
        this.id = data.id;
        this.coordinates = data.coordinates;
        this._data = data.data;
        this.content = data.content;

        this.method = 'component';

        if (typeof this.content === 'string') {
            this.method = 'text';
        } else if (this.content instanceof TemplateRef) {
            this.method = 'template';
        }
    }

    /** Location of the feature on the map */
    public get position(): IReadonlyMapPoint {
        return this._position || { x: 0, y: 0 };
    }

    public set position(position: IReadonlyMapPoint) {
        this._position = position;
    }

    /** Current zoom level of the map */
    public get zoom(): number {
        return this._map.zoom || 0;
    }

    /** Listen for changes to the map's zoom value */
    public zoomChanges(next: (v) => void): Subscription {
        return this._map.zoomChange.subscribe(next);
    }

    /** Center position of the map */
    public get center(): IReadonlyMapPoint {
        return this._map.center || { x: .5, y: .5 };
    }

    /** Listen for changes to the map's center poistion */
    public centerChanges(next: (v) => void): Subscription {
        return this._map.centerChange.subscribe(next);
    }

    /** Data to inject into the content template/component */
    public get data(): any {
        return this._data;
    }

    public set data(data: any) {
        this._data = data;
    }

    /** Angular Injector for this map feature */
    public get injector(): Injector {
        if (!this._inject) {
            this._inject = Injector.create([
                { provide: AMapFeature, useValue: this }
            ], this._injector);
        }
        return this._inject;
    }
}

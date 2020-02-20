import { TemplateRef, Type } from '@angular/core';

import { Point } from './type.helpers';

export interface MapFeature<T = any> {
    /** Map element id attribute to associate the feature with */
    readonly id?: string;
    /** Map coordinates */
    readonly coordinates: Point;
    /** Contents of the map feature */
    readonly content: Type<any> | TemplateRef<any> | string;
    /** Data to pass into the contents */
    readonly data: T;
}

export interface MapTextFeature extends MapFeature {
    readonly content: string;
}

export interface MapState {
    /** Current zoom level of the map */
    readonly zoom: number;
    /** Current center point of the map */
    readonly center: Point;
}

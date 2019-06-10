import { TemplateRef, Type } from '@angular/core';

/** Point of interest */
export interface IMapFeature<T = any> {
    /** Map Element selector */
    id?: string;
    /** Map coordinates */
    coordinates?: IMapPoint;
    /** Content to render at position */
    content: MapOverlayContent;
    /** Content render method. Determined automatically */
    method?: string;
    /** Data to inject into the content template/component */
    data?: T;
    /** Default zoom level for focus items */
    zoom?: number;
}

/** A coordinate */
export interface IMapPoint {
    /** x coordinate */
    x: number;
    /** y coordinate */
    y: number;
}

/** A coordinate with readonly x and y values */
export interface IReadonlyMapPoint {
    /** x coordinate */
    readonly x: number;
    /** y coordinate */
    readonly y: number;
}

/** Valid content types Template, Component or HTML string */
export type MapOverlayContent = TemplateRef<any> | Type<any> | string;

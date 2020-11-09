import { MapRenderFeature } from '../classes/map-render-feature';
import { TemplateRef, Type } from '@angular/core';

/** Coordinates pair for the map */
export interface Point {
    /** Coordinate on the X axis */
    readonly x: number;
    /** Coordinate on the Y axis */
    readonly y: number;
}

export interface HashMap<T = any> {
    [key: string]: T;
}

export type RenderFeature = TemplateRef<any> | Type<any> | string;

export interface MapOptions {
    /** Fix the position and zoom of the map */
    readonly lock: boolean;
}

export interface MapEvent<T = any> {
    type: 'click' | 'action';
    metadata: T;
}

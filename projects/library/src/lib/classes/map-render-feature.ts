import { TemplateRef, Type } from '@angular/core';

import { Point, RenderFeature } from '../helpers/type.helpers';
import { RenderableMap } from './renderable-map';
import { log } from '../settings';

export class MapRenderFeature {
    /** ID of an element to render */
    public readonly id: string;
    /** Coordinates with the map */
    public readonly coordinates: Point;
    /** Content to render on the map */
    public readonly content: RenderFeature;
    /** Data to pass to the content */
    public readonly data: any;
    /** Data to pass to the content */
    public readonly show_after_zoom: number;

    /** Type of content being rendered by this feature */
    public get content_type(): 'component' | 'template' | 'html' {
        return this.content instanceof Type
            ? 'component'
            : this.content instanceof TemplateRef
                ? 'template'
                : 'html';
    }

    constructor(data: { [name: string]: any }, map: RenderableMap) {
        const coordinates = this.processCoordinates(data.id || data.coordinates, map);
        this.id = data.id || JSON.stringify(coordinates);
        this.coordinates = coordinates;
        this.content = data.content;
        this.data = data.data || data.styles;
        this.show_after_zoom = data.show_after_zoom;
    }

    private processCoordinates(data: string | Point, map: RenderableMap): Point {
        if (!map) { return; }
        if (typeof data === 'string') {
            const element = map.element_map[data];
            if (element) {
                return element.coordinates;
            } else {
                log('MAP', `No element for id "${data}"`, undefined, 'warn');
            }
        } else {
            if (data.x <= 1 && data.x >= 0 && data.y <= 1 && data.y >= 0) {
                return data;
            } else {
                return {
                    x: data.x / 10000,
                    y: data.y / (10000 * map.dimensions.y)
                };
            }
        }
    }
}

import { HashMap, Point } from '../helpers/type.helpers';
import { getPosition } from '../helpers/map.helpers';

export interface MapElement {
    readonly id: string;
    readonly coordinates: Point;
}

let COUNTER = 0;

export class RenderableMap {
    /** ID of the map */
    public readonly id: string;
    /** URL of the map */
    public readonly url: string;
    /** File contents of URL */
    public readonly raw_data: string;
    /** List of available ID selectors in the map data */
    public readonly available_ids: readonly string[];
    /** Dimensions ratio of the map */
    public readonly dimensions: Point;

    /** Mapping of element id's to their locations with the map data */
    private _element_map: HashMap<MapElement> = {};

    public get element_map(): HashMap<MapElement> {
        return { ...this._element_map };
    }

    constructor(url: string, map_data: string) {
        this.id = `map-${++COUNTER}`;
        this.url = url;
        const raw_data = this._cleanMapData(map_data);
        this.raw_data = raw_data;
        const { id_list, dimensions } = this._processMapData();
        this.available_ids = id_list;
        this.dimensions = dimensions;
    }

    /** Process map data and generate lookup table */
    private _processMapData() {
        const element = document.createElement('div');
        element.style.setProperty('position', 'absolute');
        element.style.setProperty('top', '-9999px');
        element.style.setProperty('left', '-9999px');
        element.style.setProperty('height', '1000px');
        element.style.setProperty('width', '1000px');
        element.innerHTML = this.raw_data;
        document.body.appendChild(element);
        const svg_el: SVGElement = element.querySelector('svg');
        const box = svg_el.getBoundingClientRect();
        const dimensions = { x: 1, y: box.height / box.width };
        const id_elements = element.querySelectorAll('[id]');
        const id_list: string[] = [];
        this._element_map = {};
        id_elements.forEach(el => {
            const el_box = el.getBoundingClientRect();
            this._element_map[el.id] = {
                id: el.id,
                coordinates: getPosition(box, el_box)
            };
            id_list.push(el.id);
        });
        return { id_list, dimensions };
    }

    /** Clean map styles */
    private _cleanMapData(map_data: string) {
        let raw_data = '';
        // Prevent non SVG files from being used
        if (map_data.match(/<\/svg>/g)) {
            // Prevent Adobe generic style names from being used
            raw_data = map_data.replace(/cls-/g, `${this.id}-`);
            raw_data = map_data.replace(/\.map/g, `svg .map`);
            // Remove title tags and content from the map
            raw_data = map_data.replace(/<title>.*<\/title>/gm, '');
        }
        return raw_data;
    }
}

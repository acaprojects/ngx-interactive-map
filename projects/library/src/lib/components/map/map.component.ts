import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy, Output, EventEmitter, Renderer2 } from '@angular/core';

import { Point, HashMap, MapOptions, MapEvent } from '../../helpers/type.helpers';
import { MapRenderFeature } from '../../classes/map-render-feature';
import { MapService } from '../../services/map.service';
import { RenderableMap } from '../../classes/renderable-map';
import { MapStyles } from '../../classes/map-styles';
import { log } from '../../settings';
import { MapFeature, MapTextFeature, MapListener } from '../../helpers/map.interfaces';

@Component({
  selector: 'a-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnChanges, OnDestroy {
    /** URL to the map resource to be displayed */
    @Input() public src: string;
    /** Zoom level of the map as a whole number. 1 = 100% zoom */
    @Input() public zoom: number;
    /**
     * Position of the center point of the component on the map displayed
     *
     * For example:
     *
     *     { x: 0, y: 0 }
     * Places the map top left corner in the middle of the component
     *
     *     { x: 0.5, y: 0.5 }
     * Places the center of the map in the middle of the component
     *
     *     { x: 1, y: 1 }
     * Places the bottom right corner of the map in the middle of the component
     */
    @Input() public center: Point = { x: .5, y: .5 };
    /** List of elements to render on top of the map */
    @Input() public features: MapFeature[] = [];
    /** List of elements to render on top of the map */
    @Input() public text: MapTextFeature[] = [];
    /** List of listeners for elements on the map */
    @Input() public listeners: MapListener[] = [];
    /** Mapping of CSS selectors to override styles */
    @Input() public css: HashMap<HashMap<string>> = {};
    /** Element or Point to focus the map on */
    @Input() public focus: string | Point;
    /** Optional flags for the map */
    @Input() public options: MapOptions;
    /** Emitter for changes to the zoom value */
    @Output() public zoomChange = new EventEmitter<number>();
    /** Emitter for changes to the center value */
    @Output() public centerChange = new EventEmitter<Point>();
    /** Emitter for changes to the zoom value */
    @Output() public events = new EventEmitter<MapEvent>();
    /** Details of the currently displayed map */
    public map: RenderableMap;
    /**  */
    public styler: MapStyles;
    /** List of elements to render on top of the map */
    public feature_list: MapRenderFeature[] = [];
    /** List of text to render on top of the map */
    public text_list: MapRenderFeature[] = [];

    constructor(private _service: MapService) { }

    public ngOnInit() {

    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.src && this.src) {
            this._service.loadMap(this.src).then((map) => {
                this.map = map;
                this.updateStyles();
                this.feature_list = this.processFeatures(this.features || []);
                this.text_list = this.processFeatures(this.text || []);
            });
        }
        if (changes.css) {
            this.updateStyles();
        }
        if (changes.focus && this.focus) {
            this.onFocusChange(this.focus);
        }
        if (changes.features) {
            this.feature_list = this.processFeatures(this.features || []);
        }
        if (changes.text) {
            this.text_list = this.processFeatures(this.text || []);
        }
    }

    public ngOnDestroy(): void {
        if (this.styler) {
            this.styler.destroy();
            this.styler = null;
        }
    }

    public updateStyles() {
        if (this.styler) {
            this.styler.destroy();
        }
        this.styler = new MapStyles(this.css || {}, this.map);
    }

    /**
     * Update focused point or element
     * @param location ID of the element to focus or a point within the map
     */
    public onFocusChange(location: string | Point) {
        if (!this.map) { return; }
        if (typeof location === 'string') {
            const element = this.map.element_map[location];
            if (!element) {
                log('MAP', `No element for id "${location}"`, undefined, 'warn');
                return;
            } else {
                this.center = element.coordinates;
            }
        } else {
            this.center = {
                x: Math.max(0, Math.min(1, location.x || this.center.x)),
                y: Math.max(0, Math.min(1, location.y || this.center.y))
            };
        }
    }

    public processFeatures(list: MapFeature[]): MapRenderFeature[] {
        if (!this.map) { return []; }
        return list.map(i => new MapRenderFeature(i, this.map));
    }
}

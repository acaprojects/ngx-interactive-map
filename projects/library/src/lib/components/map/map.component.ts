import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy, Output, EventEmitter } from '@angular/core';

import { Point, HashMap, MapOptions, MapEvent } from '../../utlities/type.helpers';
import { MapRenderFeature } from '../../classes/map-render-feature';
import { MapService } from '../../services/map.service';
import { RenderableMap } from '../../classes/renderable-map';
import { MapListenerFeature } from '../../classes/map-listener-feature';
import { MapStyles } from '../../classes/map-styles';

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
    @Input() public features: MapRenderFeature[] = [];
    /** List of listeners for elements on the map */
    @Input() public listeners: MapListenerFeature[] = [];
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

    constructor(private _service: MapService) { }

    public ngOnInit() {

    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.src && this.src) {
            this._service.loadMap(this.src).then((map) => {
                this.map = map;
                this.updateStyles();
            });
        }
        if (changes.css) {
            this.updateStyles();
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
}

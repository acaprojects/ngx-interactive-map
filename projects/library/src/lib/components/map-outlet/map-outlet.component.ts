import {
    Component,
    OnInit,
    Input,
    ViewChild,
    ElementRef,
    EventEmitter,
    Output,
    SimpleChanges,
    OnChanges
} from '@angular/core';

import { RenderableMap } from '../../classes/renderable-map';
import { Point, MapEvent } from '../../helpers/type.helpers';
import { eventToPoint, staggerChange } from '../../helpers/map.helpers';
import { MapRenderFeature } from '../../classes/map-render-feature';

@Component({
    selector: 'a-map-outlet',
    templateUrl: './map-outlet.component.html',
    styleUrls: ['./map-outlet.component.scss']
})
export class MapOutletComponent implements OnInit, OnChanges {
    /** Details of the map */
    @Input() map: RenderableMap;
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
    @Input() public center: Point;
    /** List of features to render over the map */
    @Input() public features: MapRenderFeature[] = [];
    /** List of text to render over the map */
    @Input() public text: MapRenderFeature[] = [];
    /** Emitter for changes to the zoom value */
    @Output() public zoomChange = new EventEmitter<number>();
    /** Emitter for changes to the center value */
    @Output() public centerChange = new EventEmitter<Point>();
    /** Emitter for changes to the zoom value */
    @Output() public events = new EventEmitter<MapEvent>();
    /** Element reference to the map display element */
    @ViewChild('element', { static: true }) public map_element: ElementRef<HTMLDivElement>;
    /** Element reference to the map container element */
    @ViewChild('container', { static: true }) private _container: ElementRef<HTMLDivElement>;
    /** Bounding box for the map */
    private _box: ClientRect;
    /** Local zoom value used to rendered the map */
    public local_zoom: number = 1;
    /** Local zoom value used to rendered the map */
    public local_center: Point = { x: .5, y: .5 };
    /** Promise for handling changes to zoom values */
    private zoom_promise: Promise<void>;
    /** Promise for handling changes to center position values */
    private center_promise: Promise<void>;
    /** Store of latest difference change between zoom values */
    private _zoom_diff: number;

    /** Width of the map outlet container */
    public get width(): string {
        if (!this.map) {
            return '0';
        }
        return `${(this.local_zoom * this.size_dimension).toFixed(2)}px`;
    }
    /** Height of the map outlet container */
    public get height(): string {
        if (!this.map) {
            return '0';
        }
        const height =
            this.map.dimensions.y > this.map.dimensions.x
                ? this.local_zoom * this.size_dimension
                : this.local_zoom * this.size_dimension * this.map.dimensions.y;
        return `${height.toFixed(2)}px`;
    }
    /** Position of the map outlet container */
    public get transformX(): number {
        return -(this.local_center ? this.local_center.x : 0.5) * 100;
    }
    /** Position of the map outlet container */
    public get transformY(): number {
        return -(this.local_center ? this.local_center.y : 0.5) * 100;
    }

    /**  */
    public get size_dimension(): number {
        return this._box ? this._box.width : 100;
    }

    public ngOnInit(): void {
        this.updateContainerBox();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.zoom) {
            this.staggerZoom();
        }
        if (changes.center) {
            this.staggerCenter();
        }
    }

    /**
     * Emitted the position of the mouse click relative to the map
     * @param event Mouse or touch event
     */
    public emitPointerPostion(event: MouseEvent | TouchEvent) {
        const point = eventToPoint(event);
        const box = this.map_element.nativeElement.getBoundingClientRect();
        const position = {
            x: +((point.x - box.left) / box.width).toFixed(4),
            y: +((point.y - box.top) / box.height).toFixed(4)
        };
        this.events.emit({ type: 'click', metadata: position } as MapEvent);
    }

    /** Update the bound box of the container bounding box */
    public updateContainerBox() {
        if (this._container && this._container.nativeElement) {
            this._box = this._container.nativeElement.getBoundingClientRect();
        }
    }

    public updateZoom(new_zoom: number) {
        this.zoomChange.emit(new_zoom);
        this.staggerZoom();
    }

    private staggerZoom() {
        this._zoom_diff = Math.abs(this.zoom - this.local_zoom);
        if (!this.zoom_promise) {
            this.zoom_promise = staggerChange(this.zoom - this.local_zoom, () => {
                let change = this.zoom - this.local_zoom;
                const direction = change < 0 ? -1 : 1;
                const change_value = Math.max(0.02, Math.min(0.75, Math.abs(this._zoom_diff) / 10));
                this.local_zoom +=
                    this._zoom_diff > change_value ? (direction < 0 ? -change_value : change_value) : change;
                this.local_zoom = Math.max(1, Math.min(10, this.local_zoom));
                const not_done = Math.abs(change) < change_value ? 0 : change;
                if (!not_done) {
                    this.local_zoom = this.zoom;
                }
                return not_done;
            });
            this.zoom_promise.then(() => this.zoom_promise = null);
        }
    }

    public updateCenter(new_center: Point) {
        this.centerChange.emit(new_center);
        this.staggerCenter();
    }

    private staggerCenter() {
        if (!this.center_promise) {
            this.center_promise = staggerChange(1, () => {
                const change = {
                    x: this.center.x - this.local_center.x,
                    y: this.center.y - this.local_center.y
                };
                const direction = {
                    x: change.x < 0 ? -1 : 1,
                    y: change.y < 0 ? -1 : 1
                };
                const change_value = {
                    x: Math.max(0.01, Math.min(0.05, Math.abs(change.x) / 5)),
                    y: Math.max(0.01, Math.min(0.05, Math.abs(change.y) / 5))
                };
                this.local_center = {
                    x: this.local_center.x + (Math.abs(change.x) > change_value.x ? (direction.x < 0 ? -1 : 1) * change_value.x : change.x),
                    y: this.local_center.y + (Math.abs(change.y) > change_value.y ? (direction.y < 0 ? -1 : 1) * change_value.y : change.y),
                };
                return Math.abs(change.x) < change_value.x && Math.abs(change.y) < change_value.y ? 0 : 1;
            });
            this.center_promise.then(() => this.center_promise = null);
        }
    }
}

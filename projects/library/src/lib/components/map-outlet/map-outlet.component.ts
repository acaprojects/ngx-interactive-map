import {
    Component,
    OnInit,
    Input,
    ViewChild,
    ElementRef,
    EventEmitter,
    Output,
    SimpleChanges,
    OnChanges,
    Renderer2,
    OnDestroy
} from '@angular/core';

import { RenderableMap } from '../../classes/renderable-map';
import { Point, MapEvent } from '../../helpers/type.helpers';
import { eventToPoint, staggerChange, cleanCssSelector } from '../../helpers/map.helpers';
import { MapRenderFeature } from '../../classes/map-render-feature';
import { MapListener } from '../../helpers/map.interfaces';
import { log } from '../../settings';

@Component({
    selector: 'a-map-outlet',
    templateUrl: './map-outlet.component.html',
    styleUrls: ['./map-outlet.component.scss']
})
export class MapOutletComponent implements OnInit, OnChanges, OnDestroy {
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
    /** List of features to render over the map */
    @Input() public listeners: MapListener[] = [];
    /** List of text to render over the map */
    @Input() public text: MapRenderFeature[] = [];
    /** Whether Map cannot be moved */
    @Input() public lock: boolean;
    /** Emitter for changes to the zoom value */
    @Output() public zoomChange = new EventEmitter<number>();
    /** Emitter for changes to the center value */
    @Output() public centerChange = new EventEmitter<Point>();
    /** Emitter for changes to the zoom value */
    @Output() public events = new EventEmitter<MapEvent>();
    /** Local zoom value used to rendered the map */
    public local_zoom: number = 1;
    /** Local zoom value used to rendered the map */
    public local_center: Point = { x: 0.5, y: 0.5 };

    /** Element reference to the map display element */
    @ViewChild('element', { static: true }) public map_element: ElementRef<HTMLDivElement>;
    /** Element reference to the map container element */
    @ViewChild('container', { static: true }) private _container: ElementRef<HTMLDivElement>;
    /** Bounding box for the map */
    private _box: ClientRect;
    /** Promise for handling changes to zoom values */
    private zoom_promise: Promise<void>;
    /** Promise for handling changes to center position values */
    private center_promise: Promise<void>;
    /** Store of latest difference change between zoom values */
    private _zoom_diff: number;

    private dimensions: Point = { x: 1, y: 1 };
    /** List of active listeners */
    private _event_handlers: (() => void)[] = [];

    /** Width of the map outlet container */
    public get width(): string {
        if (!this.map) {
            return '0';
        }
        return `${(this.local_zoom * this.size_dimension * .9).toFixed(2)}px`;
    }
    /** Height of the map outlet container */
    public get height(): string {
        if (!this.map) {
            return '0';
        }
        const height = (this.local_zoom * this.size_dimension * this.map.dimensions.y) * .9;
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

    /** Get width of the map render box */
    public get size_dimension(): number {
        return this._box
            ? this.dimensions.y < this.map.dimensions.y
                ? this._box.width * (this.dimensions.y / this.map.dimensions.y)
                : this._box.width
            : 100;
    }

    constructor(private _renderer: Renderer2) { }

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
        if (changes.listeners || changes.map) {
            this.updateListeners();
        }
    }

    public ngOnDestroy(): void {
        this._event_handlers.forEach(item => item ? item() : '');
        delete this._event_handlers;
        this._event_handlers = [];
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
            this.dimensions = { x: 1, y: this._box.height / this._box.width };
        }
    }


    /**
     * Update the zoom level of the map
     * @param new_zoom New zoom level
     */
    public updateZoom(new_zoom: number) {
        this.zoomChange.emit(new_zoom);
        this.staggerZoom();
    }


    /**
     * Stagger the changes of the zoom value to have it animate smoothly
     */
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
            this.zoom_promise.then(() => (this.zoom_promise = null));
        }
    }

    /**
     * Update the center location of the map
     * @param new_center New center coordinates
     */
    public updateCenter(new_center: Point) {
        this.centerChange.emit(new_center);
        this.staggerCenter();
    }

    /**
     * Stagger the changes of the center values to have it animate smoothly
     */
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
                    x:
                        this.local_center.x +
                        (Math.abs(change.x) > change_value.x ? (direction.x < 0 ? -1 : 1) * change_value.x : change.x),
                    y:
                        this.local_center.y +
                        (Math.abs(change.y) > change_value.y ? (direction.y < 0 ? -1 : 1) * change_value.y : change.y)
                };
                return Math.abs(change.x) < change_value.x && Math.abs(change.y) < change_value.y ? 0 : 1;
            });
            this.center_promise.then(() => (this.center_promise = null));
        }
    }

    /**
     * Update event handlers for map elements
     */
    private updateListeners(): void {
        if (!this.map_element || !this.map) {
            setTimeout(() => this.updateListeners(), 50);
            return;
        }
        this._event_handlers.forEach(item => item ? item() : '');
        delete this._event_handlers;
        this._event_handlers = [];
        for (const item of this.listeners) {
            if (this.map.available_ids.indexOf(item.id) >= 0) {
                const selector = `#${cleanCssSelector(item.id)}`;
                const element = this.map_element.nativeElement.querySelector(selector);
                if (element) {
                    this._event_handlers.push(
                        this._renderer.listen(element, item.event, item.callback)
                    );
                    continue;
                }
            }
            log('LISTEN', `Update to listen to "${item.event}" on element "${item.id}"`);
        }
    }
}

import { Directive, Input, EventEmitter, Output, ElementRef, HostListener, SimpleChanges, Renderer2 } from '@angular/core';
import { Point } from '../helpers/type.helpers';
import { eventToPoint } from '../helpers/map.helpers';
import { MapCenterDirective } from './map-center.directive';

@Directive({
    selector: '[map-input][zoom]'
})
export class MapZoomDirective {
    /** Zoom level of the map as a whole number. 1 = 100% zoom */
    @Input() public zoom: number;
    /** Emitter for changes to the zoom value */
    @Output() public zoomChange = new EventEmitter<number>();
    /** Zoom level of the map as a whole number. 1 = 100% zoom */
    @Input() public center: Point;

    @Input() public element: ElementRef<HTMLDivElement>;
    /** Emitter for changes to the zoom value */
    @Output() public centerChange = new EventEmitter<Point>();

    /** Bounding box of the map element */
    private _box: ClientRect;
    /** Bound box of the host element */
    private _parent_box: ClientRect;

    private _pinch_listener: () => void;

    private _pinch_end_listener: () => void;

    private _pinch_delta: number;

    constructor(private _element: ElementRef<HTMLDivElement>, private _renderer: Renderer2, private _move_directive: MapCenterDirective) {
        this.updateHostElementBox();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.element) {
            this.updateHostElementBox();
        }
    }

    public ngOnDestroy(): void {
        this.clearListeners();
    }

    @HostListener('wheel', ['$event'])
    public wheelScroll(event: WheelEvent) {
        event.preventDefault();
        const delta = -event.deltaY / 100;
        const new_zoom = Math.min(10, Math.max(1, this.zoom + delta / 5));
        this.updateCenter(this.zoom, new_zoom, eventToPoint(event));
        this.zoom = Math.floor(new_zoom * 1000) / 1000;
        this.zoomChange.emit(this.zoom);
    }

    @HostListener('pinchstart', ['$event'])
    public pinchStart(event: any) {
        console.log('Event:', event);
        this._pinch_delta = event.scale || 1;
        event.preventDefault();
        if (this._move_directive) { this._move_directive.cleanListeners(); }
        this._pinch_listener = this._renderer.listen('window', 'pinchmove', (e) => this.onPinch(e));
        this._pinch_end_listener = this._renderer.listen('window', 'pinchend', (e) => this.clearListeners());
    }

    @HostListener('dblclick', ['$event'])
    public tapZoom(event: MouseEvent) {
        const new_zoom = Math.min(10, Math.max(1, this.zoom * 1.5));
        this.updateCenter(this.zoom, new_zoom, eventToPoint(event));
        this.zoom = new_zoom;
        this.zoomChange.emit(this.zoom);
    }

    public onPinch(event: any) {
        event.preventDefault();
        const delta = (event.scale - this._pinch_delta) / 4;
        const delta_zoom = delta < 0 ? delta * 4 : delta;
        console.log('Delta:', delta);
        const new_zoom = Math.min(10, Math.max(1, this.zoom * (1 + delta_zoom)));
        this.zoom = new_zoom;
        this.zoomChange.emit(this.zoom);
        this._pinch_delta = event.scale || 1;
    }


    private updateCenter(old_zoom: number, new_zoom: number, position: Point) {
        // if (!this.element || !this.element.nativeElement) { return; }
        // this.updateHostElementBox();
        // const zoom_diff = new_zoom - old_zoom;
        // const point: Point = {
        //     x: (position.x - this._box.left) / this._box.width,
        //     y: (position.y - this._box.top) / this._box.height,
        // };
        // const old_center = this.center;
        // this.center = {
        //     x: Math.max(0, Math.min(1, this.center.x - (this.center.x - point.x) * (zoom_diff))),
        //     y: Math.max(0, Math.min(1, this.center.y - (this.center.y - point.y) * (zoom_diff)))
        // };
        // console.log('Update center:', (zoom_diff * 100).toFixed(2), {
        //     x: ((point.x - old_center.x) * 100).toFixed(2),
        //     y: ((point.y - old_center.y) * 100).toFixed(2)
        // }, { x: (this.center.x * 100).toFixed(2), y: (this.center.y * 100).toFixed(2) });
        // this.centerChange.emit(this.center);
    }

    /** Update bounding boxes of parent and map elements */
    private updateHostElementBox() {
        if (this.element && this.element.nativeElement) {
            this._box = this.element.nativeElement.getBoundingClientRect();
        }
        if (this._element && this._element.nativeElement) {
            this._parent_box = this._element.nativeElement.getBoundingClientRect();
        }
    }

    private clearListeners() {
        if (this._pinch_listener) {
            this._pinch_listener();
            this._pinch_listener = null;
        }
        if (this._pinch_end_listener) {
            this._pinch_end_listener();
            this._pinch_end_listener = null;
        }
    }
}

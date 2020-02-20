import { Directive, Input, EventEmitter, Output, ElementRef, HostListener, SimpleChanges } from '@angular/core';
import { Point } from '../helpers/type.helpers';
import { eventToPoint } from '../helpers/map.helpers';

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

    constructor(private _element: ElementRef<HTMLDivElement>) {
        this.updateHostElementBox();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.element) {
            this.updateHostElementBox();
        }
    }

    @HostListener('wheel', ['$event'])
    public wheelScroll(event: WheelEvent) {
        const delta = -event.deltaY / 100;
        const new_zoom = Math.min(10, Math.max(1, this.zoom + delta / 5));
        this.updateCenter(this.zoom, new_zoom, eventToPoint(event));
        this.zoom = Math.floor(new_zoom * 1000) / 1000;
        this.zoomChange.emit(this.zoom);
    }

    @HostListener('dblclick', ['$event'])
    public tapZoom(event: MouseEvent) {
        const new_zoom = Math.min(10, Math.max(1, this.zoom * 1.5));
        this.updateCenter(this.zoom, new_zoom, eventToPoint(event));
        this.zoom = new_zoom;
        this.zoomChange.emit(this.zoom);
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
}

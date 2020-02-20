import { Directive, Input, Output, HostListener, ElementRef, EventEmitter, Renderer2, OnDestroy } from '@angular/core';

import { Point } from '../helpers/type.helpers';
import { eventToPoint, diffPoints, insideRect } from '../helpers/map.helpers';
import { RenderableMap } from '../classes/renderable-map';

@Directive({
    selector: '[map-input][center]'
})
export class MapCenterDirective implements OnDestroy {
    /** Map to be rendered */
    @Input() public map: RenderableMap;
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
    /** Element containing the map */
    @Input() public element: ElementRef<HTMLDivElement>;
    /** Emitter for changes to the center value */
    @Output() public centerChange = new EventEmitter<Point>();
    /** Bound box of the host element */
    private _box: ClientRect;
    /** Bound box of the host element */
    private _parent_box: ClientRect;
    /** Starting position of the move events */
    private _move_start: Point;
    /** Listener for move events */
    private _move_listener: () => void;
    /** Listener for move events */
    private _end_listener: () => void;

    @HostListener('mousedown', ['$event'])
    public startMoveMouse(event: MouseEvent) {
        this.startMove(event);
    }

    @HostListener('touchstart', ['$event'])
    public startMoveTouch(event: TouchEvent) {
        this.startMove(event);
    }

    constructor(private _element: ElementRef<HTMLDivElement>, private _renderer: Renderer2) {
        this.updateHostElementBox();
    }

    public ngOnDestroy(): void {
        this.cleanListeners();
    }

    private startMove(event: MouseEvent | TouchEvent) {
        this.updateHostElementBox();
        this._move_start = eventToPoint(event);
        this.cleanListeners();
        if (event instanceof MouseEvent) {
            this._move_listener = this._renderer.listen('window', 'mousemove', (e: MouseEvent) =>
                this.move(e)
            );
            this._end_listener = this._renderer.listen('window', 'mouseup', _ =>
                this.cleanListeners()
            );
        } else {
            this._move_listener = this._renderer.listen('window', 'touchmove', (e: TouchEvent) =>
                this.move(e)
            );
            this._end_listener = this._renderer.listen('window', 'touchend', _ =>
                this.cleanListeners()
            );
        }
    }

    /**
     * Update the position of the map based of the pointer position
     * @param event Last pointer move event
     */
    private move(event: MouseEvent | TouchEvent) {
        if (!this._box) { return; }
        const position = eventToPoint(event);
        if (!insideRect(position, this._parent_box)) { return; }
        const diff = diffPoints(position, this._move_start);
        const width = this._box.width;
        const height = this._box.height;
        const change = {
            x: diff.x / (width || 1),
            y: diff.y / (height || 1)
        };
        this.center = {
            x: Math.min(1, Math.max(0, this.center.x - change.x)),
            y: Math.min(1, Math.max(0, this.center.y - change.y))
        };
        this.centerChange.emit(this.center);
        this._move_start = position;
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

    /** Clean up existing listeners */
    private cleanListeners() {
        if (this._move_listener) {
            this._move_listener();
            this._move_listener = null;
        }
        if (this._end_listener) {
            this._end_listener();
            this._end_listener = null;
        }
    }
}
